// Verified-up-to badge — small inline pill summarising indexer freshness.
//
// Anywhere we display canonical truth (Story So Far, Heartbeat, Milestone
// Approaching), we surface this badge so the user always sees the exact
// block height the view was verified against. When the indexer is behind,
// the badge degrades visibly instead of silently going stale.

import { Pill } from "./Primitives";
import { useIndexerGuard, type IndexerStaleness } from "@/lib/indexer-guard";

const TONE: Record<IndexerStaleness, "success" | "warning" | "danger" | "muted"> = {
  fresh: "success",
  warming: "warning",
  stale: "danger",
  unknown: "muted",
};

export function VerifiedUpToBadge({ className = "" }: { className?: string }) {
  const g = useIndexerGuard();
  return (
    <span className={className} title={g.message} aria-label={g.message}>
      <Pill tone={TONE[g.staleness]}>{g.message}</Pill>
    </span>
  );
}
