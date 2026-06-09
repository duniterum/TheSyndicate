// ActivityHealthBanner — one-glance health summary for /activity.
//
// Collapses the three freshness signals (RPC head, activity tip, indexer
// probe) into ONE overall state pill + one plain-English sentence so a
// visitor instantly knows whether what they're looking at is current,
// delayed, or running on fallback.
//
// States:
//   • LIVE     — RPC at tip AND indexer probe healthy
//   • INDEXED  — Indexer mock/PENDING but RPC is live (fallback active)
//   • PARTIAL  — Activity tip > 5 blocks behind RPC, or no events in window
//   • FAIL     — RPC unreachable
//
// Behaviour:
//   • Sticky to the top of the viewport (under the global header).
//   • Collapsible details panel showing the raw block heights and probe
//     timestamps for verification.
//   • Collapsed/expanded state persists in localStorage.
//
// All values are read live via useFreshnessSignals — never fabricated.

import { useEffect, useState } from "react";
import { Pill } from "./Primitives";
import { useFreshnessSignals, formatAgo, type FreshnessSignals } from "@/lib/freshness-signals";

export type Overall = "LIVE" | "INDEXED" | "PARTIAL" | "FAIL";

export type ComputedHealth = {
  overall: Overall;
  message: string;
  tone: "success" | "warning" | "danger" | "muted";
  /** True while still booting (no RPC head and no probe yet) — for skeleton UI. */
  loading: boolean;
};

/**
 * Pure reducer over freshness signals. Exposed for unit-testing the
 * messaging contract (LIVE / INDEXED / PARTIAL / FAIL) independently of
 * any DOM or React.
 */
export function computeActivityHealth(
  f: Pick<
    FreshnessSignals,
    | "rpcHeadBlock"
    | "isLoading"
    | "indexer"
    | "indexerHttpOk"
    | "blocksBehindTip"
    | "estimatedLagSec"
    | "latestEventBlock"
  >,
): ComputedHealth {
  const rpcUp = f.rpcHeadBlock !== undefined;
  const indexerOk = f.indexer?.ok === true && f.indexerHttpOk === true;
  const indexerKindLive = f.indexer?.indexerKind === "live";
  const lag = f.blocksBehindTip;
  const hasAnyEvent = f.latestEventBlock !== undefined;

  let overall: Overall = "PARTIAL";
  let message = "";
  let loading = false;

  if (f.isLoading && !rpcUp) {
    overall = "PARTIAL";
    message = "Reading the chain…";
    loading = true;
  } else if (!rpcUp) {
    overall = "FAIL";
    message = "Avalanche RPC unreachable. Retrying — press Refresh to retry now.";
  } else if (!hasAnyEvent) {
    overall = "PARTIAL";
    message = "No indexed events in this window. The feed updates as soon as the next on-chain event fires.";
  } else if (lag !== undefined && lag > 50) {
    overall = "PARTIAL";
    message = `Indexer delayed — ${lag} blocks behind chain tip (~${formatAgo(f.estimatedLagSec ?? 0).replace(" ago", "")}). Direct RPC fallback active.`;
  } else if (!indexerOk || !indexerKindLive) {
    overall = "INDEXED";
    message = "Background indexer is in PENDING/mock state. Direct RPC fallback active — every row below is read from Avalanche.";
  } else if (lag !== undefined && lag > 5) {
    overall = "PARTIAL";
    message = `Activity tip ${lag} blocks behind chain tip (~${formatAgo(f.estimatedLagSec ?? 0).replace(" ago", "")}). Still streaming live.`;
  } else {
    overall = "LIVE";
    message = "At chain tip. Indexer healthy. Every row below is a real Avalanche event.";
  }

  const tone: ComputedHealth["tone"] =
    overall === "LIVE" ? "success"
    : overall === "INDEXED" ? "warning"
    : overall === "FAIL" ? "danger"
    : "warning";

  return { overall, message, tone, loading };
}

const LS_KEY = "syndicate.activity.health.expanded";

function readStoredExpanded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = window.localStorage.getItem(LS_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export function ActivityHealthBanner() {
  const f = useFreshnessSignals();
  const { overall, message, tone, loading } = computeActivityHealth(f);

  const [expanded, setExpanded] = useState<boolean>(false);

  // Hydrate from localStorage post-mount (avoids SSR mismatch).
  useEffect(() => {
    setExpanded(readStoredExpanded());
  }, []);

  // Persist on change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LS_KEY, expanded ? "1" : "0");
    } catch {
      /* storage disabled — silent */
    }
  }, [expanded]);

  const headLabel = f.rpcHeadBlock !== undefined ? `block ${f.rpcHeadBlock.toLocaleString("en-US")}` : "—";
  const checked = f.rpcAgeSec !== undefined ? `RPC read ${formatAgo(f.rpcAgeSec)}` : "";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Activity feed health: ${overall}. ${message}`}
      className="sticky top-16 z-30 surface elevated rounded-md border border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 md:p-5 flex flex-col gap-3 shadow-sm"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Pill tone={tone}>{overall}</Pill>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">
            Feed health · Avalanche C-Chain
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="activity-health-details"
            className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
          >
            {expanded ? "Hide details ▴" : "Show details ▾"}
          </button>
          <button
            type="button"
            onClick={f.refetch}
            className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
            aria-label="Refresh feed health"
          >
            Refresh ↻
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2" aria-hidden>
          <div className="h-3 w-2/3 rounded bg-muted/40 animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-muted/30 animate-pulse" />
        </div>
      ) : (
        <p className="text-sm text-foreground/90 leading-snug">{message}</p>
      )}

      <p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Chain tip: {headLabel}
        {checked ? ` · ${checked}` : ""}
      </p>

      {expanded && (
        <dl
          id="activity-health-details"
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-border/40 pt-3"
        >
          <DetailRow
            label="RPC head"
            value={f.rpcHeadBlock !== undefined ? `#${f.rpcHeadBlock.toLocaleString("en-US")}` : "—"}
            hint={f.rpcAgeSec !== undefined ? `read ${formatAgo(f.rpcAgeSec)}` : "—"}
          />
          <DetailRow
            label="Activity tip"
            value={f.latestEventBlock !== undefined ? `#${f.latestEventBlock.toLocaleString("en-US")}` : "no events yet"}
            hint={
              f.blocksBehindTip === undefined
                ? "—"
                : f.blocksBehindTip === 0
                  ? "at tip"
                  : `${f.blocksBehindTip} block${f.blocksBehindTip === 1 ? "" : "s"} behind`
            }
          />
          <DetailRow
            label="Indexer probe"
            value={(() => {
              if (f.indexer === undefined) return "—";
              if (f.indexerHttpOk === false) return "FAIL (HTTP)";
              if (!f.indexer.ok) return "FAIL";
              return f.indexer.indexerKind === "live" ? "LIVE" : "PENDING (mock)";
            })()}
            hint={f.indexerAgeSec !== undefined ? `checked ${formatAgo(f.indexerAgeSec)}` : "—"}
          />
        </dl>
      )}
    </div>
  );
}

function DetailRow({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded border border-border/40 bg-background/40 p-2">
      <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mono text-[11px] text-foreground flex items-center justify-between gap-2">
        <span className="truncate">{value}</span>
        <span className="text-muted-foreground text-[10px] truncate">{hint}</span>
      </dd>
    </div>
  );
}
