// Indexer-stale guard — single source of truth for "is the protocol view
// fresh enough to act on?".
//
// Returns a small derived object every surface can branch on:
//
//   • verifiedUpToBlock — the highest block we've actually scanned
//                         (latest indexed event block, NOT RPC head)
//   • staleness         — "fresh" | "warming" | "stale" | "unknown"
//                         derived from blocks-behind-tip
//   • disableRecommendations — true once we cross the "stale" threshold,
//                              so YourNextAction etc. can pause CTAs
//   • message           — short human label for the badge
//
// Thresholds match IndexerFreshnessBadge so the UX stays consistent:
//   ≤  5 blocks  → fresh
//   ≤ 50 blocks  → warming (still actionable, show a hint)
//   >  50 blocks → stale (disable speculative recommendations)

import { useFreshnessSignals } from "./freshness-signals";

export type IndexerStaleness = "fresh" | "warming" | "stale" | "unknown";

export type IndexerGuard = {
  verifiedUpToBlock: bigint | undefined;
  rpcHeadBlock: bigint | undefined;
  blocksBehindTip: number | undefined;
  staleness: IndexerStaleness;
  disableRecommendations: boolean;
  message: string;
};

const WARMING = 5;
const STALE = 50;

export function useIndexerGuard(): IndexerGuard {
  const f = useFreshnessSignals();
  const behind = f.blocksBehindTip;
  const probeBroken = f.indexer !== undefined && (f.indexerHttpOk === false || f.indexer.ok === false);

  let staleness: IndexerStaleness = "unknown";
  if (behind === undefined) staleness = "unknown";
  else if (behind <= WARMING) staleness = "fresh";
  else if (behind <= STALE) staleness = "warming";
  else staleness = "stale";

  if (probeBroken && staleness !== "stale") staleness = "warming";

  const disableRecommendations = staleness === "stale";

  const head =
    f.latestEventBlock !== undefined
      ? `block ${f.latestEventBlock.toLocaleString("en-US")}`
      : "block — pending";

  const message =
    staleness === "fresh"
      ? `Verified up to ${head}`
      : staleness === "warming"
        ? `Verified up to ${head} · catching up`
        : staleness === "stale"
          ? `Indexer behind by ${behind} blocks · recommendations paused`
          : "Awaiting first indexed block";

  return {
    verifiedUpToBlock: f.latestEventBlock,
    rpcHeadBlock: f.rpcHeadBlock,
    blocksBehindTip: behind,
    staleness,
    disableRecommendations,
    message,
  };
}
