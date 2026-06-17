import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePublicClient, useChainId } from "wagmi";
import { formatUnits, parseAbiItem } from "viem";
import {
  CONTRACTS,
  USDC_DECIMALS,
  SYN_DECIMALS,
  SALE_DEPLOYMENT_BLOCK,
  MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS,
  SALE_V2_DEPLOYMENT_BLOCK,
  SALE_V2_LIVE,
  MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS,
  SALE_V2A_DEPLOYMENT_BLOCK,
} from "./syndicate-config";
import {
  loadPurchaseEventsSnapshot,
  savePurchaseEventsSnapshot,
  purchaseEventsCacheKey,
} from "./purchase-events-cache";
import { fetchSharedChainTip } from "./chain-time";

type WagmiPublicClient = NonNullable<ReturnType<typeof usePublicClient>>;

const SALE = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS as `0x${string}`;

const TOKENS_PURCHASED = parseAbiItem(
  "event TokensPurchased(address indexed buyer, uint256 indexed purchaseId, uint256 usdcAmount, uint256 synAmount, uint256 vaultAmount, uint256 liquidityAmount, uint256 operationsAmount)",
);

// Sale V2 (Model 2 continuation). A buy emits TWO logs in one tx: `Purchased`
// (identity + sizing) and `Routed` (the 70/20/10 + referral money split). They
// are joined by transaction hash — exactly one buy per tx — NOT by memberNumber
// (which is 0 for recognized V1 / repeat buyers).
const V2_PURCHASED = parseAbiItem(
  "event Purchased(address indexed buyer, uint256 indexed memberNumber, uint16 indexed era, uint256 usdcIn, uint256 synOut, uint64 synPerUsdc, bool firstSeat)",
);
const V2_ROUTED = parseAbiItem(
  "event Routed(uint256 indexed memberNumber, uint256 vaultAmount, uint256 liquidityAmount, uint256 operationsAmount, uint256 referralAmount)",
);

/** Which sale contract a normalized purchase originated from. */
export type PurchaseSource = "v1" | "v2";

export type PurchaseEvent = {
  /** Originating sale contract. V1 has no on-chain firstSeat/era/referral. */
  source: PurchaseSource;
  buyer: string;
  /**
   * V1: the on-chain `purchaseId`.
   * V2: the on-chain `memberNumber` (authoritative ONLY when `firstSeat`; 0 for
   * recognized-V1 / repeat buyers). Identity is ALWAYS derived by the Holder
   * Index from first-seen order across BOTH contracts — this field is metadata
   * and a cross-check, never the source of a member number.
   */
  purchaseId: bigint;
  usdcAmount: number;
  synAmount: number;
  vaultAmount: number;
  liquidityAmount: number;
  operationsAmount: number;
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
  // ── V2-only enrichment (undefined for V1) ──
  /** Era the buy priced at (V2). */
  era?: number;
  /** True when this buy issued a NEW seat (V2). false = spend-only / recognized V1. */
  firstSeat?: boolean;
  /** USDC paid to the referrer out of the Operations slice (V2 CommissionRouter). */
  referralAmount?: number;
};

/**
 * Canonical cross-source purchase shape. Alias of `PurchaseEvent`, kept as a
 * distinct name so multi-source call sites read intentionally (V1 + V2 unified).
 */
export type NormalizedPurchase = PurchaseEvent;

/**
 * Applies a caller's `limit` to the canonical (newest-first) purchase-event
 * list. Pure + exported so the slice can be unit-tested and so it can run in
 * TanStack Query's `select` (i.e. AFTER the fetch), never forking the scan.
 *
 * Semantics are preserved exactly from the original queryFn:
 *   • limit > 0   → newest N (the list is already sorted newest-first)
 *   • limit === 0 → the entire list
 */
export function applyPurchaseLimit(events: PurchaseEvent[], limit: number): PurchaseEvent[] {
  return limit > 0 ? events.slice(0, limit) : events;
}

/**
 * Reorg-safety overlap (P4a). Incremental scans restart this many blocks below
 * the last scanned block so a shallow reorg near the tip re-resolves correctly
 * instead of being missed.
 */
export const REORG_OVERLAP = 50n;

/** Canonical unique identity of a purchase log: its tx hash + log position. */
export function purchaseEventKey(e: PurchaseEvent): string {
  return `${e.txHash}:${e.logIndex}`;
}

/**
 * Merge a cached purchase list with a freshly scanned window. Dedupes by
 * `purchaseEventKey` — the re-scanned reorg overlap intentionally re-emits
 * events already cached — preferring the freshly scanned copy on collision, and
 * returns newest-first using the EXACT same comparator as the scan, so callers
 * (e.g. the holder index) see identical ordering and values.
 */
export function mergePurchaseEvents(prev: PurchaseEvent[], next: PurchaseEvent[]): PurchaseEvent[] {
  const byKey = new Map<string, PurchaseEvent>();
  for (const e of prev) byKey.set(purchaseEventKey(e), e);
  for (const e of next) byKey.set(purchaseEventKey(e), e);
  const merged = [...byKey.values()];
  merged.sort((a, b) =>
    a.blockNumber === b.blockNumber ? b.logIndex - a.logIndex : b.blockNumber > a.blockNumber ? 1 : -1,
  );
  return merged;
}

/**
 * Pure: where should an incremental scan begin? With no prior cursor it starts
 * at the deployment block (a full scan, clamped to the tip). Otherwise it
 * resumes `overlap` blocks below the last scanned block, anchored to the tip
 * when the RPC head lags behind our cursor, and clamped to [fromBlock, tip] so
 * we never request a range past the head.
 */
export function computeIncrementalScanStart(args: {
  fromBlock: bigint;
  tip: bigint;
  lastScannedBlock?: bigint;
  overlap: bigint;
}): bigint {
  const { fromBlock, tip, lastScannedBlock, overlap } = args;
  if (lastScannedBlock === undefined) {
    return fromBlock > tip ? tip : fromBlock;
  }
  const anchor = lastScannedBlock < tip ? lastScannedBlock : tip;
  const candidate = anchor - overlap;
  let start = candidate > fromBlock ? candidate : fromBlock;
  if (start > tip) start = tip;
  return start;
}

/** Parsed V2 `Purchased` log (identity + sizing), before the money-split join. */
export type V2PurchasedLog = {
  buyer: string;
  memberNumber: bigint;
  era: number;
  usdcAmount: number;
  synAmount: number;
  firstSeat: boolean;
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

/** Parsed V2 `Routed` money-split, keyed by txHash for the join. */
export type V2RoutedSplit = { vault: number; liquidity: number; operations: number; referral: number };

/**
 * Join V2 `Purchased` (identity + sizing) with its `Routed` money-split by
 * txHash — exactly one buy per tx. Pure + exported so the join is unit-testable.
 *
 * Truth doctrine (no fake on-chain data): a `Purchased` with NO matching
 * `Routed` split is INCOMPLETE data — a missing/partial Routed log (a failed
 * RPC chunk or an unexpected ABI), NOT a real zero routing. Such an event is
 * DROPPED and `joinIncomplete` is flipped so the caller refuses to persist and
 * re-resolves it on the next scan. A split that is genuinely present is used
 * verbatim, INCLUDING a legitimately-zero `referral` (no referrer → 0 payout,
 * which the contract really does emit) — only a wholly-absent split fails closed.
 */
export function joinV2PurchaseEvents(
  purchased: V2PurchasedLog[],
  routedByTx: Map<string, V2RoutedSplit>,
): { events: PurchaseEvent[]; joinIncomplete: boolean } {
  const events: PurchaseEvent[] = [];
  let joinIncomplete = false;
  for (const p of purchased) {
    const split = p.txHash ? routedByTx.get(p.txHash) : undefined;
    if (!split) {
      joinIncomplete = true;
      continue;
    }
    events.push({
      source: "v2",
      buyer: p.buyer,
      purchaseId: p.memberNumber,
      usdcAmount: p.usdcAmount,
      synAmount: p.synAmount,
      vaultAmount: split.vault,
      liquidityAmount: split.liquidity,
      operationsAmount: split.operations,
      referralAmount: split.referral,
      era: p.era,
      firstSeat: p.firstSeat,
      blockNumber: p.blockNumber,
      txHash: p.txHash,
      logIndex: p.logIndex,
    });
  }
  return { events, joinIncomplete };
}

/**
 * Chunked block walker. Calls `fetchWindow` for each [start,end] slice of
 * [fromBlock, tip] (CHUNK=2000, the public Avalanche RPC log-range limit) and
 * returns whether ANY chunk threw. A failed chunk is skipped (so a flaky RPC
 * window never aborts the whole scan) but flips the flag so callers never
 * persist — and never advance the cursor over — a gap.
 */
async function scanChunked(
  fromBlock: bigint,
  tip: bigint,
  fetchWindow: (start: bigint, end: bigint) => Promise<void>,
): Promise<boolean> {
  const CHUNK = 2_000n;
  let anyChunkFailed = false;
  for (let start = fromBlock; start <= tip; start += CHUNK + 1n) {
    const end = start + CHUNK > tip ? tip : start + CHUNK;
    try {
      await fetchWindow(start, end);
    } catch {
      anyChunkFailed = true;
    }
  }
  return anyChunkFailed;
}

/**
 * Incremental V1 scan: resume from the persisted cursor (REORG_OVERLAP below
 * it), merge with the cached history, persist a COMPLETE scan, return the FULL
 * newest-first canonical list. Parsing/ordering identical to the original inline
 * scan — only the `source: "v1"` tag is added.
 */
async function scanV1Purchases(args: {
  publicClient: WagmiPublicClient;
  chainId: number;
  fromBlock: bigint;
  tip: bigint;
}): Promise<PurchaseEvent[]> {
  const { publicClient, chainId, fromBlock, tip } = args;
  const cacheKey = purchaseEventsCacheKey({ chainId, sale: SALE, fromBlock });
  const cached = loadPurchaseEventsSnapshot(cacheKey);
  const scanStart = computeIncrementalScanStart({
    fromBlock,
    tip,
    lastScannedBlock: cached?.lastScannedBlock,
    overlap: REORG_OVERLAP,
  });

  const fresh: PurchaseEvent[] = [];
  const anyChunkFailed = await scanChunked(scanStart, tip, async (start, end) => {
    const logs = await publicClient.getLogs({ address: SALE, event: TOKENS_PURCHASED, fromBlock: start, toBlock: end });
    for (const l of logs) {
      const a = l.args as { buyer?: string; purchaseId?: bigint; usdcAmount?: bigint; synAmount?: bigint; vaultAmount?: bigint; liquidityAmount?: bigint; operationsAmount?: bigint };
      if (!a.buyer || a.purchaseId === undefined || a.usdcAmount === undefined || a.synAmount === undefined || a.vaultAmount === undefined || a.liquidityAmount === undefined || a.operationsAmount === undefined) continue;
      fresh.push({
        source: "v1",
        buyer: a.buyer,
        purchaseId: a.purchaseId,
        usdcAmount: Number(formatUnits(a.usdcAmount, USDC_DECIMALS)),
        synAmount: Number(formatUnits(a.synAmount, SYN_DECIMALS)),
        vaultAmount: Number(formatUnits(a.vaultAmount, USDC_DECIMALS)),
        liquidityAmount: Number(formatUnits(a.liquidityAmount, USDC_DECIMALS)),
        operationsAmount: Number(formatUnits(a.operationsAmount, USDC_DECIMALS)),
        blockNumber: l.blockNumber ?? 0n,
        txHash: l.transactionHash ?? "",
        logIndex: l.logIndex ?? 0,
      });
    }
  });

  const merged = mergePurchaseEvents(cached?.events ?? [], fresh);
  if (!anyChunkFailed && merged.length > 0) {
    const nextLastScanned = cached && cached.lastScannedBlock > tip ? cached.lastScannedBlock : tip;
    savePurchaseEventsSnapshot(cacheKey, merged, nextLastScanned);
  }
  return merged;
}

/**
 * Incremental V2 scan. Reads BOTH `Purchased` (identity + sizing) and `Routed`
 * (the money split) over the same window and joins them by transaction hash —
 * exactly one buy per tx, so both logs share a tx and a block (always the same
 * chunk). `firstSeat`/`era`/`referralAmount` ride along as V2 enrichment; the
 * Holder Index still derives identity from first-seen order. Own cache snapshot
 * keyed on the V2 address so V1 persistence is untouched.
 */
async function scanV2Purchases(args: {
  publicClient: WagmiPublicClient;
  chainId: number;
  saleV2: `0x${string}`;
  fromBlock: bigint;
  tip: bigint;
}): Promise<PurchaseEvent[]> {
  const { publicClient, chainId, saleV2, fromBlock, tip } = args;
  const cacheKey = purchaseEventsCacheKey({ chainId, sale: saleV2, fromBlock });
  const cached = loadPurchaseEventsSnapshot(cacheKey);
  const scanStart = computeIncrementalScanStart({
    fromBlock,
    tip,
    lastScannedBlock: cached?.lastScannedBlock,
    overlap: REORG_OVERLAP,
  });

  // Index the money split by tx hash first, then enrich each Purchased.
  const routedByTx = new Map<string, { vault: number; liquidity: number; operations: number; referral: number }>();
  const routedFailed = await scanChunked(scanStart, tip, async (start, end) => {
    const logs = await publicClient.getLogs({ address: saleV2, event: V2_ROUTED, fromBlock: start, toBlock: end });
    for (const l of logs) {
      const a = l.args as { vaultAmount?: bigint; liquidityAmount?: bigint; operationsAmount?: bigint; referralAmount?: bigint };
      const tx = l.transactionHash ?? "";
      if (!tx || a.vaultAmount === undefined || a.liquidityAmount === undefined || a.operationsAmount === undefined || a.referralAmount === undefined) continue;
      routedByTx.set(tx, {
        vault: Number(formatUnits(a.vaultAmount, USDC_DECIMALS)),
        liquidity: Number(formatUnits(a.liquidityAmount, USDC_DECIMALS)),
        operations: Number(formatUnits(a.operationsAmount, USDC_DECIMALS)),
        referral: Number(formatUnits(a.referralAmount, USDC_DECIMALS)),
      });
    }
  });

  // Parse Purchased logs first, then JOIN them to their Routed split (truth
  // doctrine: a missing split is incomplete data — joinV2PurchaseEvents drops
  // the event and flags joinIncomplete; it NEVER fabricates zero routing).
  const purchased: V2PurchasedLog[] = [];
  const purchasedFailed = await scanChunked(scanStart, tip, async (start, end) => {
    const logs = await publicClient.getLogs({ address: saleV2, event: V2_PURCHASED, fromBlock: start, toBlock: end });
    for (const l of logs) {
      const a = l.args as { buyer?: string; memberNumber?: bigint; era?: number; usdcIn?: bigint; synOut?: bigint; firstSeat?: boolean };
      if (!a.buyer || a.memberNumber === undefined || a.era === undefined || a.usdcIn === undefined || a.synOut === undefined || a.firstSeat === undefined) continue;
      purchased.push({
        buyer: a.buyer,
        memberNumber: a.memberNumber,
        era: Number(a.era),
        usdcAmount: Number(formatUnits(a.usdcIn, USDC_DECIMALS)),
        synAmount: Number(formatUnits(a.synOut, SYN_DECIMALS)),
        firstSeat: a.firstSeat,
        blockNumber: l.blockNumber ?? 0n,
        txHash: l.transactionHash ?? "",
        logIndex: l.logIndex ?? 0,
      });
    }
  });

  const { events: fresh, joinIncomplete } = joinV2PurchaseEvents(purchased, routedByTx);
  const anyChunkFailed = routedFailed || purchasedFailed || joinIncomplete;
  const merged = mergePurchaseEvents(cached?.events ?? [], fresh);
  if (!anyChunkFailed && merged.length > 0) {
    const nextLastScanned = cached && cached.lastScannedBlock > tip ? cached.lastScannedBlock : tip;
    savePurchaseEventsSnapshot(cacheKey, merged, nextLastScanned);
  }
  return merged;
}

/**
 * Canonical multi-source purchase scan (V1 + V2a history + V2b active). Returns
 * the FULL newest-first NormalizedPurchase list across EVERY sale contract a
 * member can live on; callers narrow via `select`.
 *
 * P0 (canonical scan): the expensive historical scan is keyed ONLY on
 * (fromBlock, sale contracts) — NOT on `limit`, so all ~31 holder-index
 * consumers share one cached scan and slice it client-side.
 *
 * V2 is fully DORMANT until `SALE_V2_LIVE` (address + deploy block known): when
 * dormant only V1 is scanned and the result is byte-identical to before. When
 * live, V2 is scanned from its own deploy block (own cache) and merged in —
 * cross-source dedupe is safe because V1/V2 tx hashes never collide.
 */
export function useLivePurchaseEvents(opts?: { fromBlock?: bigint; limit?: number }) {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const fromBlock = opts?.fromBlock ?? SALE_DEPLOYMENT_BLOCK;
  const limit = opts?.limit ?? 50;

  const saleV2 =
    SALE_V2_LIVE && MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS
      ? (MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS as `0x${string}`)
      : null;

  // V2a is the SUPERSEDED/SEALED earlier V2 deploy. It is NEVER the active buy
  // target, but its `Purchased`/`Routed` history holds members (seats #3–#5) who
  // never appeared on V1 or V2b — so it is ALWAYS scanned as a historical source
  // to keep member identity continuous across the V2a→V2b cutover.
  const saleV2a =
    MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS && SALE_V2A_DEPLOYMENT_BLOCK !== null
      ? (MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS as `0x${string}`)
      : null;

  // Stable per-observer view, memoized on [limit] so the select reference does
  // not change every render. This keeps TanStack Query v5's select memoization
  // intact and `data` referentially stable across renders — important because
  // the ~31 useHolderIndex consumers re-derive buildHolderIndex keyed on it.
  const select = useCallback(
    (events: PurchaseEvent[]) => applyPurchaseLimit(events, limit),
    [limit],
  );

  return useQuery({
    // V2 address is part of the key so the query refetches cleanly the moment
    // V2 goes live; "v2-pending" keeps the dormant key stable (== old behavior).
    queryKey: ["live-purchases", String(fromBlock), SALE, saleV2a ?? "no-v2a", saleV2 ?? "v2-pending"],
    enabled: Boolean(publicClient),
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<PurchaseEvent[]> => {
      if (!publicClient) return [];
      // Resolve the head through the SHARED chain-tip cache (P4c) — one tip feeds
      // ALL source scans (same chain), freshness, and the pulse.
      const tip = (await fetchSharedChainTip(publicClient, queryClient)).number;

      // Identity is first-seen order across ALL sources, so the scan UNIONS every
      // sale contract a member can live on:
      //   V1  → historical (sealed)
      //   V2a → historical (sealed/superseded — seats #3–#5 live ONLY here)
      //   V2b → ACTIVE     (current buy target — new seats land here)
      // mergePurchaseEvents is an order-independent union deduped by tx:logIndex,
      // and tx hashes never collide across contracts, so chaining merges is safe.
      let merged = await scanV1Purchases({ publicClient, chainId, fromBlock, tip });

      // Sealed V2a history — ALWAYS included (independent of SALE_V2_LIVE) so the
      // V2a-only members survive the cutover even before any V2b buy exists.
      if (saleV2a && SALE_V2A_DEPLOYMENT_BLOCK !== null) {
        const v2a = await scanV2Purchases({
          publicClient,
          chainId,
          saleV2: saleV2a,
          fromBlock: SALE_V2A_DEPLOYMENT_BLOCK,
          tip,
        });
        merged = mergePurchaseEvents(merged, v2a);
      }

      // Active V2b. Dormant (V1 + V2a only) until V2b is live.
      if (!saleV2 || SALE_V2_DEPLOYMENT_BLOCK === null) return merged;

      const v2b = await scanV2Purchases({
        publicClient,
        chainId,
        saleV2,
        fromBlock: SALE_V2_DEPLOYMENT_BLOCK,
        tip,
      });
      return mergePurchaseEvents(merged, v2b);
    },
    select,
  });
}
