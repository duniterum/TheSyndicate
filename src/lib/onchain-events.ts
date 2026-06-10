// Generic onchain event scanners for the /activity mini-explorer.
// All scanners chunk at 2000-block windows to stay within Avalanche public
// RPC log-range limits. Newest-first, capped by `limit`.

import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { usePublicClient, useChainId } from "wagmi";
import { formatUnits, parseAbiItem, getAddress } from "viem";
import { CONTRACTS, USDC_DECIMALS, SYN_DECIMALS, SALE_DEPLOYMENT_BLOCK, LP_POOL } from "./syndicate-config";
import { fetchSharedChainTip } from "./chain-time";
import { REORG_OVERLAP, computeIncrementalScanStart } from "./activity-hooks";
import {
  lpEventsCacheKey,
  loadLpEventsSnapshot,
  saveLpEventsSnapshot,
  mergeScannedEvents,
} from "./lp-events-cache";
import {
  usdcFlowsCacheKey,
  loadUsdcFlowsSnapshot,
  saveUsdcFlowsSnapshot,
  mergeUsdcFlows,
} from "./usdc-flows-cache";

const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const SYN  = CONTRACTS.SYN_CONTRACT_ADDRESS  as `0x${string}`;
const PAIR = LP_POOL.pairAddress              as `0x${string}`;

const TRANSFER = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");
const SWAP     = parseAbiItem("event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)");
const MINT     = parseAbiItem("event Mint(address indexed sender, uint256 amount0, uint256 amount1)");
const BURN     = parseAbiItem("event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)");

const CHUNK = 2_000n;

const TOKEN0_ABI = [{ type: "function", name: "token0", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] }] as const;

/** Shared query key for the LP pair's IMMUTABLE token ordering (P3). */
export const LP_TOKEN_ORDER_KEY = ["lp-token-order", PAIR] as const;

/**
 * Resolve whether SYN is token0 of the pair. The pair's token ordering is
 * immutable, so it is read ONCE and cached with infinite staleTime instead of
 * being re-read on every event scan (token0/token1 were previously fetched
 * inside each scan's queryFn).
 */
async function getSynIs0(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  queryClient: QueryClient,
): Promise<boolean> {
  const order = await queryClient.fetchQuery({
    queryKey: LP_TOKEN_ORDER_KEY,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async (): Promise<{ token0: string }> => {
      const t0 = await publicClient.readContract({ address: PAIR, abi: TOKEN0_ABI, functionName: "token0" });
      return { token0: t0 as string };
    },
  });
  return order.token0.toLowerCase() === SYN.toLowerCase();
}

/**
 * Chunked log scan over [fromBlock, tip]. The caller passes `tip` (resolved
 * once via the shared chain-tip, P4c) instead of each scan fetching its own
 * head. Returns the events AND whether EVERY chunk succeeded — incremental
 * callers must not persist (or advance their cursor) on an incomplete scan.
 */
async function scan<T>(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  fromBlock: bigint,
  tip: bigint,
  fetchChunk: (start: bigint, end: bigint) => Promise<T[]>,
): Promise<{ events: T[]; complete: boolean }> {
  const from = fromBlock > tip ? tip : fromBlock;
  const out: T[] = [];
  let complete = true;
  for (let start = from; start <= tip; start += CHUNK + 1n) {
    const end = start + CHUNK > tip ? tip : start + CHUNK;
    try {
      const chunk = await fetchChunk(start, end);
      out.push(...chunk);
    } catch {
      // Skip windows the RPC rejects, but remember the gap.
      complete = false;
    }
  }
  return { events: out, complete };
}

// ─── USDC transfers in/out of any wallet (Treasury Flows) ────────────────

export type UsdcFlow = {
  direction: "in" | "out";
  counterparty: string;
  amount: number;          // USDC
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

export function useUsdcFlows(wallet: string, opts?: { fromBlock?: bigint; limit?: number }) {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const fromBlock = opts?.fromBlock ?? SALE_DEPLOYMENT_BLOCK;
  const limit = opts?.limit ?? 50;
  const target = wallet as `0x${string}`;

  return useQuery({
    queryKey: ["usdc-flows", wallet, String(fromBlock), limit],
    enabled: Boolean(publicClient),
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<UsdcFlow[]> => {
      if (!publicClient) return [];
      // One shared head read for BOTH the in and out scans (P4c).
      const tip = (await fetchSharedChainTip(publicClient, queryClient)).number;

      // P4e incremental: resume from the persisted cursor instead of replaying
      // deploymentBlock→head every refetch, for BOTH the inbound and outbound
      // scans. Parsing/ordering/values are unchanged; a corrupt/absent cache
      // degrades to a full scan. We persist ONLY when both scans completed (no
      // failed chunk), so a partial RPC failure can never advance the cursor
      // past an unscanned gap. A self-transfer emits one log matching both
      // filters, so the merge dedupes by txHash:logIndex:direction — preserving
      // the prior code's two-row (in + out) output for that log.
      const cacheKey = usdcFlowsCacheKey({ chainId, wallet, fromBlock });
      const cached = loadUsdcFlowsSnapshot<UsdcFlow>(cacheKey);
      const scanStart = computeIncrementalScanStart({
        fromBlock,
        tip,
        lastScannedBlock: cached?.lastScannedBlock,
        overlap: REORG_OVERLAP,
      });

      const { events: inLogs, complete: inComplete } = await scan(publicClient, scanStart, tip, (start, end) =>
        publicClient.getLogs({ address: USDC, event: TRANSFER, args: { to: target }, fromBlock: start, toBlock: end }),
      );
      const { events: outLogs, complete: outComplete } = await scan(publicClient, scanStart, tip, (start, end) =>
        publicClient.getLogs({ address: USDC, event: TRANSFER, args: { from: target }, fromBlock: start, toBlock: end }),
      );
      const complete = inComplete && outComplete;

      const fresh: UsdcFlow[] = [];
      const push = (l: typeof inLogs[number], dir: "in" | "out") => {
        const args = l.args as { from?: string; to?: string; value?: bigint };
        if (!args.from || !args.to || args.value === undefined) return;
        fresh.push({
          direction: dir,
          counterparty: dir === "in" ? args.from : args.to,
          amount: Number(formatUnits(args.value, USDC_DECIMALS)),
          blockNumber: l.blockNumber ?? 0n,
          txHash: l.transactionHash ?? "",
          logIndex: l.logIndex ?? 0,
        });
      };
      inLogs.forEach((l) => push(l, "in"));
      outLogs.forEach((l) => push(l, "out"));

      const merged = mergeUsdcFlows(cached?.events ?? [], fresh);
      if (complete && merged.length > 0) {
        const nextLastScanned = cached && cached.lastScannedBlock > tip ? cached.lastScannedBlock : tip;
        saveUsdcFlowsSnapshot(cacheKey, merged, nextLastScanned);
      }
      return limit > 0 ? merged.slice(0, limit) : merged;
    },
  });
}

// ─── LP Swaps (buys / sells against SYN/USDC pair) ───────────────────────

export type LpSwap = {
  kind: "buy" | "sell";       // buy = SYN out, USDC in
  synAmount: number;
  usdcAmount: number;
  trader: string;
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

export function useLpSwaps(opts?: { fromBlock?: bigint; limit?: number }) {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const fromBlock = opts?.fromBlock ?? SALE_DEPLOYMENT_BLOCK;
  const limit = opts?.limit ?? 50;

  return useQuery({
    queryKey: ["lp-swaps", String(fromBlock), limit],
    enabled: Boolean(publicClient),
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<LpSwap[]> => {
      if (!publicClient) return [];
      // Shared head (P4c) + immutable LP token ordering (P3).
      const tip = (await fetchSharedChainTip(publicClient, queryClient)).number;
      const synIs0 = await getSynIs0(publicClient, queryClient);
      const synDec = SYN_DECIMALS;
      const usdcDec = USDC_DECIMALS;

      // P4b incremental: resume from the persisted cursor instead of replaying
      // deploymentBlock→head every refetch. Parsing, ordering, and the returned
      // values are unchanged; a corrupt/absent cache degrades to a full scan.
      const cacheKey = lpEventsCacheKey({ chainId, pair: PAIR, kind: "swaps", fromBlock });
      const cached = loadLpEventsSnapshot<LpSwap>(cacheKey);
      const scanStart = computeIncrementalScanStart({
        fromBlock,
        tip,
        lastScannedBlock: cached?.lastScannedBlock,
        overlap: REORG_OVERLAP,
      });

      const { events: logs, complete } = await scan(publicClient, scanStart, tip, (start, end) =>
        publicClient.getLogs({ address: PAIR, event: SWAP, fromBlock: start, toBlock: end }),
      );
      const fresh: LpSwap[] = [];
      for (const l of logs) {
        const a = l.args as { sender?: string; to?: string; amount0In?: bigint; amount1In?: bigint; amount0Out?: bigint; amount1Out?: bigint };
        if (a.amount0In === undefined || a.amount1In === undefined || a.amount0Out === undefined || a.amount1Out === undefined) continue;
        const syn0 = synIs0 ? a.amount0Out - a.amount0In : a.amount1Out - a.amount1In; // signed SYN delta to trader
        const usdc0 = synIs0 ? a.amount1Out - a.amount1In : a.amount0Out - a.amount0In; // signed USDC delta to trader
        const synAbs = syn0 < 0n ? -syn0 : syn0;
        const usdcAbs = usdc0 < 0n ? -usdc0 : usdc0;
        fresh.push({
          kind: syn0 > 0n ? "buy" : "sell",
          synAmount: Number(formatUnits(synAbs, synDec)),
          usdcAmount: Number(formatUnits(usdcAbs, usdcDec)),
          trader: a.to ?? a.sender ?? "0x",
          blockNumber: l.blockNumber ?? 0n,
          txHash: l.transactionHash ?? "",
          logIndex: l.logIndex ?? 0,
        });
      }

      // Merge with cached history (dedupe overlap by txHash:logIndex, sort
      // newest-first — identical to the prior single-scan output).
      const merged = mergeScannedEvents(cached?.events ?? [], fresh);
      if (complete && merged.length > 0) {
        const nextLastScanned = cached && cached.lastScannedBlock > tip ? cached.lastScannedBlock : tip;
        saveLpEventsSnapshot(cacheKey, merged, nextLastScanned);
      }
      return limit > 0 ? merged.slice(0, limit) : merged;
    },
  });
}

// ─── LP add / remove (Mint / Burn) ───────────────────────────────────────

export type LpLiquidityEvent = {
  kind: "add" | "remove";
  synAmount: number;
  usdcAmount: number;
  actor: string;
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

export function useLpLiquidityEvents(opts?: { fromBlock?: bigint; limit?: number }) {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const fromBlock = opts?.fromBlock ?? SALE_DEPLOYMENT_BLOCK;
  const limit = opts?.limit ?? 25;

  return useQuery({
    queryKey: ["lp-liquidity", String(fromBlock), limit],
    enabled: Boolean(publicClient),
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<LpLiquidityEvent[]> => {
      if (!publicClient) return [];
      // Shared head (P4c) + immutable LP token ordering (P3).
      const tip = (await fetchSharedChainTip(publicClient, queryClient)).number;
      const synIs0 = await getSynIs0(publicClient, queryClient);

      // P4b incremental: resume from the persisted cursor. A mint OR burn chunk
      // failure marks the scan incomplete, so we never persist over a gap.
      const cacheKey = lpEventsCacheKey({ chainId, pair: PAIR, kind: "liquidity", fromBlock });
      const cached = loadLpEventsSnapshot<LpLiquidityEvent>(cacheKey);
      const scanStart = computeIncrementalScanStart({
        fromBlock,
        tip,
        lastScannedBlock: cached?.lastScannedBlock,
        overlap: REORG_OVERLAP,
      });

      const { events: mints, complete: mintsComplete } = await scan(publicClient, scanStart, tip, (start, end) =>
        publicClient.getLogs({ address: PAIR, event: MINT, fromBlock: start, toBlock: end }),
      );
      const { events: burns, complete: burnsComplete } = await scan(publicClient, scanStart, tip, (start, end) =>
        publicClient.getLogs({ address: PAIR, event: BURN, fromBlock: start, toBlock: end }),
      );
      const complete = mintsComplete && burnsComplete;

      const fresh: LpLiquidityEvent[] = [];
      for (const l of mints) {
        const a = l.args as { sender?: string; amount0?: bigint; amount1?: bigint };
        if (a.amount0 === undefined || a.amount1 === undefined) continue;
        fresh.push({
          kind: "add",
          synAmount: Number(formatUnits(synIs0 ? a.amount0 : a.amount1, SYN_DECIMALS)),
          usdcAmount: Number(formatUnits(synIs0 ? a.amount1 : a.amount0, USDC_DECIMALS)),
          actor: a.sender ?? "0x",
          blockNumber: l.blockNumber ?? 0n,
          txHash: l.transactionHash ?? "",
          logIndex: l.logIndex ?? 0,
        });
      }
      for (const l of burns) {
        const a = l.args as { sender?: string; to?: string; amount0?: bigint; amount1?: bigint };
        if (a.amount0 === undefined || a.amount1 === undefined) continue;
        fresh.push({
          kind: "remove",
          synAmount: Number(formatUnits(synIs0 ? a.amount0 : a.amount1, SYN_DECIMALS)),
          usdcAmount: Number(formatUnits(synIs0 ? a.amount1 : a.amount0, USDC_DECIMALS)),
          actor: a.to ?? a.sender ?? "0x",
          blockNumber: l.blockNumber ?? 0n,
          txHash: l.transactionHash ?? "",
          logIndex: l.logIndex ?? 0,
        });
      }

      const merged = mergeScannedEvents(cached?.events ?? [], fresh);
      if (complete && merged.length > 0) {
        const nextLastScanned = cached && cached.lastScannedBlock > tip ? cached.lastScannedBlock : tip;
        saveLpEventsSnapshot(cacheKey, merged, nextLastScanned);
      }
      return limit > 0 ? merged.slice(0, limit) : merged;
    },
  });
}

// ─── New-holder derivation from purchase event stream ────────────────────

export function firstSeenBuyers<T extends { buyer: string; blockNumber: bigint; logIndex: number; txHash: string; usdcAmount: number; synAmount: number }>(
  events: T[],
): Array<{ buyer: string; blockNumber: bigint; txHash: string; logIndex: number; usdcAmount: number; synAmount: number }> {
  // Walk oldest → newest, keep only first occurrence per buyer.
  const sorted = [...events].sort((a, b) => (a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber > b.blockNumber ? 1 : -1));
  const seen = new Set<string>();
  const out: Array<{ buyer: string; blockNumber: bigint; txHash: string; logIndex: number; usdcAmount: number; synAmount: number }> = [];
  for (const e of sorted) {
    let key: string;
    try { key = getAddress(e.buyer).toLowerCase(); } catch { key = e.buyer.toLowerCase(); }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ buyer: e.buyer, blockNumber: e.blockNumber, txHash: e.txHash, logIndex: e.logIndex, usdcAmount: e.usdcAmount, synAmount: e.synAmount });
  }
  out.reverse(); // newest holder first
  return out;
}
