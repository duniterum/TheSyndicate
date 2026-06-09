// IndexerFreshnessBadge — single-glance freshness panel for the activity feed.
//
// Shows three live signals so users can verify there is no hidden lag:
//   • RPC head    — latest block we've read from Avalanche C-Chain
//   • Activity    — latest TokensPurchased event we've indexed locally
//                   (Δblocks vs head + estimated seconds of lag)
//   • Indexer     — health probe at /api/public/indexer/health
//                   (LIVE / PENDING / FAIL, last checked Xs ago)
//
// All three values are live reads. No estimated, no faked.
// Block-time estimate (Avalanche ≈ 2s) is used only as a hint next to the
// authoritative block number.

import { Pill } from "@/components/syndicate/Primitives";
import { useFreshnessSignals, formatAgo } from "@/lib/freshness-signals";

export function IndexerFreshnessBadge() {
  const f = useFreshnessSignals();

  const headLabel =
    f.rpcHeadBlock !== undefined
      ? `block ${f.rpcHeadBlock.toLocaleString("en-US")}`
      : "—";

  const eventLabel =
    f.latestEventBlock !== undefined
      ? `block ${f.latestEventBlock.toLocaleString("en-US")}`
      : "no events yet";

  // Activity-vs-tip tone: green if <= 5 blocks, amber if <= 50, red if more.
  const lagTone: "success" | "warning" | "danger" | "muted" =
    f.blocksBehindTip === undefined
      ? "muted"
      : f.blocksBehindTip <= 5
        ? "success"
        : f.blocksBehindTip <= 50
          ? "warning"
          : "danger";

  const lagText =
    f.blocksBehindTip === undefined
      ? "—"
      : f.blocksBehindTip === 0
        ? "at tip"
        : `${f.blocksBehindTip} block${f.blocksBehindTip === 1 ? "" : "s"} behind · ~${formatAgo(
            f.estimatedLagSec,
          ).replace(" ago", "")}`;

  // Indexer probe tone.
  const probeOk = f.indexer?.ok === true && f.indexerHttpOk === true;
  const probeTone: "success" | "warning" | "danger" | "muted" =
    f.indexer === undefined ? "muted" : probeOk ? "success" : "danger";
  const probeText = (() => {
    if (f.indexer === undefined) return "—";
    if (!f.indexerHttpOk) return "FAIL (HTTP)";
    if (!f.indexer.ok) return "FAIL";
    return f.indexer.indexerKind === "live" ? "LIVE" : "PENDING (mock)";
  })();

  return (
    <div
      role="region"
      aria-label="Indexer freshness"
      className="surface elevated rounded-md border border-border/60 bg-background/40 p-3 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Freshness signals
        </span>
        <button
          type="button"
          onClick={f.refetch}
          className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2 py-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
          aria-label="Refresh freshness signals"
        >
          Refresh
        </button>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Row
          label="RPC head"
          value={headLabel}
          hint={f.rpcAgeSec !== undefined ? `read ${formatAgo(f.rpcAgeSec)}` : "—"}
          tone="muted"
        />
        <Row
          label="Activity tip"
          value={eventLabel}
          hint={lagText}
          tone={lagTone}
        />
        <Row
          label="Indexer probe"
          value={probeText}
          hint={f.indexerAgeSec !== undefined ? `checked ${formatAgo(f.indexerAgeSec)}` : "—"}
          tone={probeTone}
        />
      </dl>

      <p className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        All values are live reads. Δblocks vs RPC head is the only true lag
        measurement — the seconds hint uses Avalanche block-time ≈ 2s.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "success" | "warning" | "danger" | "muted";
}) {
  const pillTone =
    tone === "success" ? "success" : tone === "warning" ? "warning" : tone === "danger" ? "danger" : "muted";
  return (
    <div className="flex flex-col gap-1 rounded border border-border/40 bg-background/40 p-2">
      <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mono text-[11px] text-foreground flex items-center gap-2">
        <span>{value}</span>
        <Pill tone={pillTone}>{hint}</Pill>
      </dd>
    </div>
  );
}
