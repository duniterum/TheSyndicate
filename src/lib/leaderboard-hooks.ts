// Leaderboard view — derived from the canonical useHolderIndex.
// Adds archive-weight ordering on top of HolderRecord. Identity,
// cumulative footprint, and rank all flow from the holder index — this file
// only adds the score reduction so the rest of the UI stays unchanged.

import { useMemo } from "react";
import { useHolderIndex, type HolderRecord } from "./holder-index";
import { ACCESS_RATE_USDC_PER_SYN, rankForUsdc, type RankTier } from "./syndicate-config";

export type LeaderboardEntry = {
  buyer: string;
  usdcTotal: number;
  synTotal: number;
  purchaseCount: number;
  firstBlock: bigint;
  lastBlock: bigint;
  rank: RankTier | null;
  compounderScore: number;
  isDemo?: boolean;
};

/**
 * Archive weight (V1 proxy, transparent + auditable):
 *   score = rankMultiplier × sqrt(usdcTotal) × (1 + log2(1 + purchaseCount))
 *
 *  - rank multiplier rewards conviction
 *  - sqrt(usdc) prevents whale dominance
 *  - log(purchaseCount) rewards repeated participation, not single bursts
 */
function computeScore(usdc: number, purchases: number, mult: number) {
  return mult * Math.sqrt(usdc) * (1 + Math.log2(1 + purchases));
}

const DEMO_ENTRIES: LeaderboardEntry[] = [
  ["0xDE1A0000000000000000000000000000000000A1",  500, 50_000,  3],
  ["0xDE1A0000000000000000000000000000000000B2",  250, 25_000,  2],
  ["0xDE1A0000000000000000000000000000000000C3",  100, 10_000,  1],
  ["0xDE1A0000000000000000000000000000000000D4",   75,  7_500,  2],
  ["0xDE1A0000000000000000000000000000000000E5",   50,  5_000,  1],
  ["0xDE1A0000000000000000000000000000000000F6",   25,  2_500,  1],
  ["0xDE1A0000000000000000000000000000000000A7",   10,  1_000,  1],
  ["0xDE1A0000000000000000000000000000000000B8",    5,    500,  1],
].map(([buyer, usdc, syn, count]) => {
  const r = rankForUsdc(usdc as number).current;
  return {
    buyer: buyer as string,
    usdcTotal: usdc as number,
    synTotal: syn as number,
    purchaseCount: count as number,
    firstBlock: 0n,
    lastBlock: 0n,
    rank: r,
    compounderScore: computeScore(usdc as number, count as number, r?.scoreMultiplier ?? 1),
    isDemo: true,
  };
}).sort((a, b) => b.compounderScore - a.compounderScore);

function entryFromHolder(h: HolderRecord): LeaderboardEntry {
  return {
    buyer: h.wallet,
    usdcTotal: h.cumulativeUsdc,
    synTotal: h.cumulativeSyn,
    purchaseCount: h.purchaseCount,
    firstBlock: h.firstPurchaseBlock,
    lastBlock: h.lastPurchaseBlock,
    rank: h.currentRank,
    compounderScore: computeScore(h.cumulativeUsdc, h.purchaseCount, h.currentRank?.scoreMultiplier ?? 1),
  };
}

export function useMembersLeaderboard() {
  const idx = useHolderIndex();

  return useMemo(() => {
    if (!idx.hasData) {
      return {
        isLoading: idx.isLoading,
        isError: idx.isError,
        isDemo: true,
        entries: DEMO_ENTRIES,
      };
    }
    const entries = idx.ordered.map(entryFromHolder);
    entries.sort((a, b) => b.compounderScore - a.compounderScore);
    return {
      isLoading: idx.isLoading,
      isError: idx.isError,
      isDemo: false,
      entries,
    };
  }, [idx.hasData, idx.ordered, idx.isLoading, idx.isError]);
}

export { ACCESS_RATE_USDC_PER_SYN };
