import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useChainId } from "wagmi";
import { formatUnits, parseAbiItem } from "viem";
import { CONTRACTS, USDC_DECIMALS, SYN_DECIMALS, SALE_DEPLOYMENT_BLOCK } from "./syndicate-config";
import {
  loadPurchaseEventsSnapshot,
  savePurchaseEventsSnapshot,
  purchaseEventsCacheKey,
} from "./purchase-events-cache";

const SALE = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS as `0x${string}`;

const TOKENS_PURCHASED = parseAbiItem(
  "event TokensPurchased(address indexed buyer, uint256 indexed purchaseId, uint256 usdcAmount, uint256 synAmount, uint256 vaultAmount, uint256 liquidityAmount, uint256 operationsAmount)",
);

export type PurchaseEvent = {
  buyer: string;
  purchaseId: bigint;
  usdcAmount: number;
  synAmount: number;
  vaultAmount: number;
  liquidityAmount: number;
  operationsAmount: number;
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

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

/**
 * Scans the most recent N blocks on Avalanche for TokensPurchased events
 * from the Membership Sale contract. Returns newest-first. Chunked to stay
 * within RPC log-range limits (2048 blocks/call on public Avalanche RPC).
 *
 * P0 (canonical scan): the expensive historical scan is keyed ONLY on
 * (fromBlock, sale contract) — NOT on `limit`. `limit` previously sat in the
 * queryKey while only affecting the final slice, so every distinct limit
 * (1 / 25 / 30 / 100 / 1000 / 5000 / 0) forked its own full-range getLogs walk.
 * Now all callers share one cached scan and narrow it client-side via `select`.
 */
export function useLivePurchaseEvents(opts?: { fromBlock?: bigint; limit?: number }) {
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const fromBlock = opts?.fromBlock ?? SALE_DEPLOYMENT_BLOCK;
  const limit = opts?.limit ?? 50;

  // Stable per-observer view, memoized on [limit] so the select reference does
  // not change every render. This keeps TanStack Query v5's select memoization
  // intact and `data` referentially stable across renders — important because
  // the ~31 useHolderIndex consumers re-derive buildHolderIndex keyed on it.
  const select = useCallback(
    (events: PurchaseEvent[]) => applyPurchaseLimit(events, limit),
    [limit],
  );

  return useQuery({
    queryKey: ["live-purchases", String(fromBlock), SALE],
    enabled: Boolean(publicClient),
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<PurchaseEvent[]> => {
      if (!publicClient) return [];
      const tip = await publicClient.getBlockNumber();

      // P4a incremental indexing: resume from the persisted cursor instead of
      // replaying deploymentBlock→head every refetch. A corrupt/absent cache
      // degrades to a full scan; a small REORG_OVERLAP re-validates the tip for
      // shallow reorgs. Event parsing, ordering, and returned values unchanged.
      const cacheKey = purchaseEventsCacheKey({ chainId, sale: SALE, fromBlock });
      const cached = loadPurchaseEventsSnapshot(cacheKey);
      const scanStart = computeIncrementalScanStart({
        fromBlock,
        tip,
        lastScannedBlock: cached?.lastScannedBlock,
        overlap: REORG_OVERLAP,
      });

      const CHUNK = 2_000n;
      const fresh: PurchaseEvent[] = [];
      let anyChunkFailed = false;
      for (let start = scanStart; start <= tip; start += CHUNK + 1n) {
        const end = start + CHUNK > tip ? tip : start + CHUNK;
        try {
          const logs = await publicClient.getLogs({
            address: SALE,
            event: TOKENS_PURCHASED,
            fromBlock: start,
            toBlock: end,
          });
          for (const l of logs) {
            const args = l.args as { buyer?: string; purchaseId?: bigint; usdcAmount?: bigint; synAmount?: bigint; vaultAmount?: bigint; liquidityAmount?: bigint; operationsAmount?: bigint };
            if (!args.buyer || args.purchaseId === undefined || args.usdcAmount === undefined || args.synAmount === undefined || args.vaultAmount === undefined || args.liquidityAmount === undefined || args.operationsAmount === undefined) continue;
            fresh.push({
              buyer: args.buyer,
              purchaseId: args.purchaseId,
              usdcAmount: Number(formatUnits(args.usdcAmount, USDC_DECIMALS)),
              synAmount: Number(formatUnits(args.synAmount, SYN_DECIMALS)),
              vaultAmount: Number(formatUnits(args.vaultAmount, USDC_DECIMALS)),
              liquidityAmount: Number(formatUnits(args.liquidityAmount, USDC_DECIMALS)),
              operationsAmount: Number(formatUnits(args.operationsAmount, USDC_DECIMALS)),
              blockNumber: l.blockNumber ?? 0n,
              txHash: l.transactionHash ?? "",
              logIndex: l.logIndex ?? 0,
            });
          }
        } catch {
          // Some public RPCs reject large windows — skip the chunk but remember
          // the failure so we never persist (and advance the cursor over) a gap.
          anyChunkFailed = true;
        }
      }

      // Merge the freshly scanned window with the cached history, dedupe by
      // txHash:logIndex (the re-scanned overlap re-emits cached events), and sort
      // newest-first exactly as before.
      const merged = mergePurchaseEvents(cached?.events ?? [], fresh);

      // Persist only a COMPLETE scan (no failed chunk), and only with data — never
      // clobber a good snapshot with a partial result or advance the cursor over a
      // gap. Keep the cursor from regressing if the RPC head lagged our last scan.
      if (!anyChunkFailed && merged.length > 0) {
        const nextLastScanned = cached && cached.lastScannedBlock > tip ? cached.lastScannedBlock : tip;
        savePurchaseEventsSnapshot(cacheKey, merged, nextLastScanned);
      }

      // Return the FULL canonical list — callers narrow it via `select` below.
      return merged;
    },
    select,
  });
}
