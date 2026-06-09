// Canonical source-status pill used across live surfaces.
//   LIVE    — read directly from chain (wagmi / viem / RPC)
//   INDEXED — derived from on-chain events (e.g. holder-index, mint scan)
//   LOCAL   — sourced from a server-side cookie/cache (no chain read)
// Kept tiny and dependency-free so it can sit next to any tile, row, or card.
import { Pill } from "./Primitives";

export type LiveSource = "LIVE" | "INDEXED" | "LOCAL";

const HINT: Record<LiveSource, string> = {
  LIVE: "Read directly from Avalanche via RPC.",
  INDEXED: "Derived from on-chain events scanned client-side.",
  LOCAL: "Server-side cookie / cache — not a chain read.",
};

const TONE: Record<LiveSource, "success" | "warning" | "muted"> = {
  LIVE: "success",
  INDEXED: "warning",
  LOCAL: "muted",
};

export function SourceTag({ source, size = "sm" }: { source: LiveSource; size?: "sm" | "xs" }) {
  return (
    <span title={HINT[source]} className={size === "xs" ? "scale-90 origin-left" : undefined}>
      <Pill tone={TONE[source]}>{source}</Pill>
    </span>
  );
}
