// Chain-time helper — estimate wall-clock time for an Avalanche block.
//
// We anchor on the current tip block's timestamp (fetched once, cached) and
// project backwards using AVA_BLOCK_SECONDS (~2s). This is an APPROXIMATION;
// it is honest to the user via tooltips ("estimated from block N at ~2s/block").
// When a subgraph or indexer lands we will swap in real per-block timestamps
// without changing the signature.

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

export const AVA_BLOCK_SECONDS = 2;

/**
 * Shared chain-tip query key (P3). One head-block read serves every
 * "where is the chain right now?" consumer — chain-time's relative timestamps
 * AND the homepage protocol pulse — instead of each hook fetching the head
 * block independently under its own key.
 */
export const CHAIN_TIP_QUERY_KEY = ["chain-tip"] as const;

export type ChainTip = { number: bigint; unix: number };

/**
 * Shared queryFn for the chain tip. Throws instead of returning undefined
 * (react-query v5 forbids an undefined queryFn result). Used by BOTH the
 * useChainTip observer and the imperative fetchSharedChainTip(), so scanners
 * and render-time consumers resolve the head through ONE cached query.
 */
async function chainTipQueryFn(
  publicClient: ReturnType<typeof usePublicClient>,
): Promise<ChainTip> {
  if (!publicClient) throw new Error("publicClient unavailable");
  const block = await publicClient.getBlock();
  return { number: block.number, unix: Number(block.timestamp) };
}

/**
 * Single source of truth for the current Avalanche head block and its
 * timestamp. getBlock() is a superset of getBlockNumber(), so this one query
 * feeds both the pulse's block-number recency math and chain-time's unix
 * derivations. Cached briefly and shared via CHAIN_TIP_QUERY_KEY.
 */
export function useChainTip() {
  const publicClient = usePublicClient();
  return useQuery({
    queryKey: CHAIN_TIP_QUERY_KEY,
    enabled: Boolean(publicClient),
    refetchInterval: 30_000,
    staleTime: 15_000,
    queryFn: () => chainTipQueryFn(publicClient),
  });
}

/**
 * Imperative read of the SHARED chain tip for use inside event-scanner
 * queryFns, which cannot call the useChainTip hook (P4c). Resolves through the
 * same CHAIN_TIP_QUERY_KEY cache: when a fresh tip (≤ staleTime) already exists
 * — fetched by the render-time observer or a sibling scanner this cycle — it is
 * returned with no new RPC; otherwise ONE getBlock populates the shared entry
 * for every consumer. Replaces each scanner's independent getBlockNumber() head
 * fetch, so the whole app agrees on a single head block.
 */
export async function fetchSharedChainTip(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  queryClient: QueryClient,
): Promise<ChainTip> {
  return queryClient.fetchQuery({
    queryKey: CHAIN_TIP_QUERY_KEY,
    staleTime: 15_000,
    queryFn: () => chainTipQueryFn(publicClient),
  });
}

export type ChainTime = {
  tipBlock: bigint | undefined;
  tipUnix: number | undefined; // seconds since epoch
  /** Returns approximate unix seconds for a given historical block. */
  blockToUnix: (block: bigint) => number | undefined;
  /** Returns seconds elapsed since block (clamped ≥ 0). */
  secondsSince: (block: bigint) => number | undefined;
  isLoading: boolean;
};

export function useChainTime(): ChainTime {
  const q = useChainTip();

  const tipBlock = q.data?.number;
  const tipUnix = q.data?.unix;

  const blockToUnix = (block: bigint): number | undefined => {
    if (tipBlock === undefined || tipUnix === undefined) return undefined;
    const delta = tipBlock > block ? tipBlock - block : 0n;
    return tipUnix - Number(delta) * AVA_BLOCK_SECONDS;
  };

  const secondsSince = (block: bigint): number | undefined => {
    const u = blockToUnix(block);
    if (u === undefined || tipUnix === undefined) return undefined;
    return Math.max(0, tipUnix - u);
  };

  return { tipBlock, tipUnix, blockToUnix, secondsSince, isLoading: q.isLoading };
}

/** Human-readable elapsed time, e.g. "3h ago", "2d ago". */
export function formatRelative(seconds: number | undefined): string {
  if (seconds === undefined || Number.isNaN(seconds)) return "—";
  if (seconds < 45) return "just now";
  if (seconds < 90) return "1m ago";
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.round(seconds / 3600)}h ago`;
  if (seconds < 604_800) return `${Math.round(seconds / 86_400)}d ago`;
  if (seconds < 2_592_000) return `${Math.round(seconds / 604_800)}w ago`;
  return `${Math.round(seconds / 2_592_000)}mo ago`;
}

/** Returns the block number that was current ~`seconds` ago (approx). */
export function blockForSecondsAgo(tipBlock: bigint | undefined, seconds: number): bigint | undefined {
  if (tipBlock === undefined) return undefined;
  const blocks = BigInt(Math.floor(seconds / AVA_BLOCK_SECONDS));
  return tipBlock > blocks ? tipBlock - blocks : 0n;
}

export const WINDOW_24H = 86_400;
export const WINDOW_7D = 604_800;
