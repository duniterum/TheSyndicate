// Chain-time helper — estimate wall-clock time for an Avalanche block.
//
// We anchor on the current tip block's timestamp (fetched once, cached) and
// project backwards using AVA_BLOCK_SECONDS (~2s). This is an APPROXIMATION;
// it is honest to the user via tooltips ("estimated from block N at ~2s/block").
// When a subgraph or indexer lands we will swap in real per-block timestamps
// without changing the signature.

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

export const AVA_BLOCK_SECONDS = 2;

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
  const publicClient = usePublicClient();

  const q = useQuery({
    queryKey: ["chain-time-tip"],
    enabled: Boolean(publicClient),
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async () => {
      if (!publicClient) return undefined;
      const block = await publicClient.getBlock();
      return { number: block.number, unix: Number(block.timestamp) };
    },
  });

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
