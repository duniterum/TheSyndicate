// ─── Metric Display Library ───────────────────────────────────────────────
// Reusable, registry-driven display FORMS for any Protocol Metric.
//
// One canonical metric (src/lib/protocol-metrics-registry.ts) → many display
// forms. Build a future data surface by importing the block you need here and
// passing it `{ metric, value?, status? }` — never re-derive a label, badge, or
// verify link inline. The internal workbench at /labs/protocol-intelligence
// renders every form for every metric so you can pick one before building.
//
// Contract: every block takes the canonical `metric` plus an OPTIONAL
// pre-formatted `value` string and an OPTIONAL `status` override (defaults to
// the metric's documented status). The caller owns value formatting (use
// `formatMetricValue`) and the live status (e.g. from the Protocol Truth layer).

import type {
  ProtocolMetric,
  MetricType,
  MetricStatus,
  MetricUnit,
  LegalSensitivity,
} from "@/lib/protocol-metrics-registry";
import { StatusPill } from "@/components/syndicate/Primitives";

// ─── Value formatting ──────────────────────────────────────────────────────

const PLACEHOLDER = "—";

const fmtUsd = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n).toLocaleString("en-US")}`;
  return `$${n.toFixed(2)}`;
};

const fmtAgo = (s: number): string => {
  if (s < 60) return `${Math.round(s)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

const truncAddr = (a: string): string =>
  a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;

/**
 * Format a resolved metric value for display, driven by the metric's unit.
 * Returns the canonical "—" placeholder for undefined / unrenderable values.
 */
export function formatMetricValue(value: unknown, unit: MetricUnit): string {
  if (value === undefined || value === null) return PLACEHOLDER;
  if (Array.isArray(value)) return value.length.toLocaleString("en-US");
  if (typeof value === "object") {
    const label = (value as Record<string, unknown>).label;
    return typeof label === "string" ? label : PLACEHOLDER;
  }
  if (unit === "address" && typeof value === "string") return truncAddr(value);
  if (unit === "text") return String(value);
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return String(value);
  switch (unit) {
    case "USD":
      return fmtUsd(n);
    case "SYN":
      return `${Math.round(n).toLocaleString("en-US")} SYN`;
    case "count":
      return Math.round(n).toLocaleString("en-US");
    case "percent":
      return `${n.toFixed(1)}%`;
    case "seconds":
      return fmtAgo(n);
    case "ratio":
      return `${n.toLocaleString("en-US")}×`;
    default:
      return n.toLocaleString("en-US");
  }
}

// ─── Shared props ──────────────────────────────────────────────────────────

type ValueProps = {
  metric: ProtocolMetric;
  /** Pre-formatted display value. Omit to render the "—" placeholder. */
  value?: string;
  /** Live status override. Defaults to the metric's documented status. */
  status?: MetricStatus;
};

type VerifyProps = {
  /** Called with the metric id to open the shared verification drawer. */
  onVerify?: (metricId: string) => void;
  /** True when the metric has a drawer entry (offer the in-app drawer button). */
  hasDrawer?: boolean;
};

// ─── Atomic forms ──────────────────────────────────────────────────────────

const TYPE_TONE: Record<MetricType, string> = {
  RAW: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  DERIVED: "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  AGGREGATE: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
};

/** RAW / DERIVED / AGGREGATE provenance badge. */
export function MetricTypeBadge({ type }: { type: MetricType }) {
  return (
    <span
      className={`mono inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${TYPE_TONE[type]}`}
    >
      {type}
    </span>
  );
}

/** LIVE / PARTIAL / PENDING trust badge (canonical Syndicate pill). */
export function MetricStatusBadge({ status }: { status: MetricStatus }) {
  return <StatusPill status={status} />;
}

const LEGAL_TONE: Record<LegalSensitivity, string> = {
  high: "border-destructive/40 bg-destructive/10 text-destructive",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted/40 text-muted-foreground",
  none: "border-border bg-muted/40 text-muted-foreground",
};

const LEGAL_NOTE: Record<LegalSensitivity, string> = {
  high: "Price / valuation figure. Always present with its non-promissory, fixed-reference framing intact — never a market price, yield, return, or projection.",
  medium:
    "Carries legal weight (recognition / relative standing). Present without implying rights, returns, or profit.",
  low: "Low sensitivity. Standard factual presentation.",
  none: "No special legal framing required.",
};

/** Legal-sensitivity badge + the framing rule for this metric. */
export function MetricLegalNote({
  metric,
  compact = false,
}: {
  metric: ProtocolMetric;
  compact?: boolean;
}) {
  const tone = LEGAL_TONE[metric.legalSensitivity];
  if (compact) {
    return (
      <span
        className={`mono inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${tone}`}
        title={LEGAL_NOTE[metric.legalSensitivity]}
      >
        legal: {metric.legalSensitivity}
      </span>
    );
  }
  return (
    <div className={`rounded-md border px-3 py-2 text-xs leading-snug ${tone}`}>
      <span className="mono text-[10px] uppercase tracking-[0.18em]">
        Legal · {metric.legalSensitivity}
      </span>
      <p className="mt-1">{LEGAL_NOTE[metric.legalSensitivity]}</p>
    </div>
  );
}

/** Recommended surfaces (advisory) for this metric. */
export function MetricSurfaceList({ surfaces }: { surfaces: string[] }) {
  if (surfaces.length === 0) {
    return <span className="text-xs text-muted-foreground">{PLACEHOLDER}</span>;
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {surfaces.map((s) => (
        <li
          key={s}
          className="mono rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
        >
          {s}
        </li>
      ))}
    </ul>
  );
}

/** Source (where the data comes from) + formula (how it's derived). */
export function MetricSourceFormula({ metric }: { metric: ProtocolMetric }) {
  return (
    <dl className="space-y-2 text-xs">
      <div>
        <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Source
        </dt>
        <dd className="mt-0.5 text-foreground/80">{metric.source}</dd>
      </div>
      <div>
        <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Formula
        </dt>
        <dd className="mt-0.5">
          <code className="mono text-[11px] text-foreground/80">{metric.formula}</code>
        </dd>
      </div>
      <div>
        <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Hook
        </dt>
        <dd className="mt-0.5">
          <code className="mono text-[11px] text-foreground/70">{metric.hook}</code>
        </dd>
      </div>
    </dl>
  );
}

/** Verify affordance — on-chain explorer links + optional in-app drawer button. */
export function MetricVerifyAffordance({
  metric,
  onVerify,
  hasDrawer,
}: { metric: ProtocolMetric } & VerifyProps) {
  const links = metric.verification.links;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasDrawer && onVerify && (
        <button
          type="button"
          onClick={() => onVerify(metric.id)}
          className="mono inline-flex items-center gap-1 rounded-md border border-border/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-foreground/80 hover:border-[var(--gold)]/50 hover:text-foreground"
        >
          Verify ↗
        </button>
      )}
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mono inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:border-[var(--gold)]/50 hover:text-foreground"
        >
          {l.label} <span aria-hidden>↗</span>
        </a>
      ))}
      {!hasDrawer && links.length === 0 && (
        <span className="text-xs text-muted-foreground">No on-chain link</span>
      )}
    </div>
  );
}

// ─── Composite forms ───────────────────────────────────────────────────────

/** Dense single-stat cell (intelligence-bar / pulse style). */
export function MetricCompactBlock({ metric, value, status }: ValueProps) {
  const s = status ?? metric.status;
  const dot = statusDot(s);
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <div className="mono flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
        {metric.shortLabel ?? metric.label}
      </div>
      <div className="mono mt-1 text-lg font-semibold tabular-nums">{value ?? PLACEHOLDER}</div>
    </div>
  );
}

/** Inline ticker / marquee item. */
export function MetricTickerItem({ metric, value, status }: ValueProps) {
  const s = status ?? metric.status;
  return (
    <span className="mono inline-flex items-center gap-2 whitespace-nowrap text-xs">
      <span className={`size-1.5 rounded-full ${statusDot(s)}`} aria-hidden />
      <span className="uppercase tracking-[0.16em] text-muted-foreground">
        {metric.shortLabel ?? metric.label}
      </span>
      <span className="font-semibold tabular-nums text-foreground">{value ?? PLACEHOLDER}</span>
    </span>
  );
}

/** Full metric card — label, status, value, description, source/formula,
 *  surfaces, legal framing, and the verify affordance. */
export function MetricFullBlock({
  metric,
  value,
  status,
  onVerify,
  hasDrawer,
}: ValueProps & VerifyProps) {
  const s = status ?? metric.status;
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">{metric.label}</h3>
            <code className="mono text-[10px] text-muted-foreground">{metric.id}</code>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <MetricStatusBadge status={s} />
            <MetricTypeBadge type={metric.type} />
            <span className="mono rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {metric.category}
            </span>
            <MetricLegalNote metric={metric} compact />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="mono text-xl font-semibold tabular-nums">{value ?? PLACEHOLDER}</div>
          <div className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            {metric.unit}
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-foreground/80">{metric.description}</p>

      <MetricSourceFormula metric={metric} />

      <div>
        <div className="mono mb-1.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Recommended surfaces
        </div>
        <MetricSurfaceList surfaces={metric.surfaces} />
      </div>

      <MetricLegalNote metric={metric} />

      <div className="border-t border-border/60 pt-3">
        <div className="mono mb-1.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Verify
        </div>
        <MetricVerifyAffordance metric={metric} onVerify={onVerify} hasDrawer={hasDrawer} />
      </div>
    </div>
  );
}

// ─── Table form ────────────────────────────────────────────────────────────

const TH =
  "p-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap";

/** Header row matching <MetricTableRow>. */
export function MetricTableHeader() {
  return (
    <tr className="border-b border-border bg-muted/40">
      <th className={TH}>Metric</th>
      <th className={TH}>Category</th>
      <th className={TH}>Type</th>
      <th className={TH}>Status</th>
      <th className={TH}>Unit</th>
      <th className={TH}>Value</th>
      <th className={TH}>Formula</th>
      <th className={TH}>Legal</th>
      <th className={TH}>Surfaces</th>
      <th className={TH}>Verify</th>
    </tr>
  );
}

/** One dense table row for a metric. Use inside a <table><tbody>. */
export function MetricTableRow({
  metric,
  value,
  status,
  onVerify,
  hasDrawer,
}: ValueProps & VerifyProps) {
  const s = status ?? metric.status;
  return (
    <tr className="border-b border-border/60 align-top last:border-0">
      <td className="p-2">
        <div className="font-medium">{metric.label}</div>
        <code className="mono text-[10px] text-muted-foreground">{metric.id}</code>
      </td>
      <td className="p-2 text-xs text-muted-foreground whitespace-nowrap">{metric.category}</td>
      <td className="p-2 whitespace-nowrap">
        <MetricTypeBadge type={metric.type} />
      </td>
      <td className="p-2 whitespace-nowrap">
        <MetricStatusBadge status={s} />
      </td>
      <td className="p-2 text-xs text-muted-foreground whitespace-nowrap">{metric.unit}</td>
      <td className="p-2 mono text-xs font-semibold tabular-nums whitespace-nowrap">
        {value ?? PLACEHOLDER}
      </td>
      <td className="p-2">
        <code className="mono text-[10px] text-foreground/70">{metric.formula}</code>
      </td>
      <td className="p-2 whitespace-nowrap">
        <MetricLegalNote metric={metric} compact />
      </td>
      <td className="p-2 text-[10px] text-muted-foreground">{metric.surfaces.join(", ") || PLACEHOLDER}</td>
      <td className="p-2">
        <MetricVerifyAffordance metric={metric} onVerify={onVerify} hasDrawer={hasDrawer} />
      </td>
    </tr>
  );
}

// ─── internal ──────────────────────────────────────────────────────────────

function statusDot(s: MetricStatus): string {
  switch (s) {
    case "LIVE":
      return "bg-emerald-500";
    case "PARTIAL":
      return "bg-sky-500";
    case "PENDING":
      return "bg-amber-500";
  }
}
