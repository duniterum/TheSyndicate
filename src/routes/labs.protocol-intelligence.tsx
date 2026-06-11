// src/routes/labs.protocol-intelligence.tsx
// INTERNAL · Protocol Intelligence — the metric workbench.
//
// NOT marketing. An internal design + QA surface. Renders every metric in the
// Protocol Metrics Registry (src/lib/protocol-metrics-registry.ts) in every
// reusable display FORM (src/components/metrics/MetricDisplays.tsx) so that
// before building any future data component — reports, Chronicle, investor view,
// protocol-intelligence surfaces — you can inspect this route and reuse an
// existing block instead of rescanning the codebase.
//
// noindex/nofollow (inherits the /labs layout); never linked from public nav;
// /labs/* is blocked in robots.txt and excluded from the sitemap.
//
// Live values are pulled from the Protocol Truth layer by metric id where a fact
// exists; metrics without a live fact render the canonical "—" placeholder with
// their documented status. Nothing here fabricates a value.

import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PROTOCOL_METRICS,
  metricsByCategory,
  type ProtocolMetric,
  type MetricCategory,
  type MetricStatus,
} from "@/lib/protocol-metrics-registry";
import { useProtocolTruth, type Fact } from "@/lib/protocol-truth";
import { getMetricVerification } from "@/lib/data-verification-registry";
import { MetricVerificationDrawer } from "@/components/syndicate/MetricVerificationDrawer";
import {
  formatMetricValue,
  MetricCompactBlock,
  MetricFullBlock,
  MetricTickerItem,
  MetricTableHeader,
  MetricTableRow,
  MetricTypeBadge,
  MetricStatusBadge,
  MetricSourceFormula,
  MetricVerifyAffordance,
  MetricLegalNote,
  MetricSurfaceList,
} from "@/components/metrics/MetricDisplays";

export const Route = createFileRoute("/labs/protocol-intelligence")({
  head: () => ({
    meta: [
      { title: "Protocol Intelligence · Metric Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal metric workbench. Every Protocol Metrics Registry entry rendered in every reusable display form for design + QA. Not for public use.",
      },
    ],
  }),
  component: ProtocolIntelligence,
});

const CATEGORY_ORDER: MetricCategory[] = [
  "supply",
  "market-reference",
  "membership",
  "sale",
  "protocol-wallets",
  "liquidity",
  "artifacts",
  "burn",
  "activity",
];

const CATEGORY_LABEL: Record<MetricCategory, string> = {
  supply: "Supply",
  "market-reference": "Market reference",
  membership: "Membership",
  sale: "Sale",
  "protocol-wallets": "Protocol wallets",
  liquidity: "Liquidity",
  artifacts: "Artifacts",
  burn: "Burn",
  activity: "Activity",
};

type Cell = { value: string | undefined; status: MetricStatus; hasDrawer: boolean };

function isFact(v: unknown): v is Fact<unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    "metricId" in v &&
    "status" in v &&
    "value" in v
  );
}

function ProtocolIntelligence() {
  const truth = useProtocolTruth();
  const [verifyKey, setVerifyKey] = useState<string | null>(null);

  // Open the shared drawer from a ?verify=<id|alias> deep-link on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const k = new URLSearchParams(window.location.search).get("verify");
    if (k) setVerifyKey(k);
  }, []);

  // Map canonical metric id → live fact (facts carry metricId).
  const factById = useMemo(() => {
    const map = new Map<string, Fact<unknown>>();
    for (const v of Object.values(truth)) {
      if (isFact(v)) map.set(v.metricId, v);
    }
    return map;
  }, [truth]);

  const cellFor = useMemo(() => {
    return (metric: ProtocolMetric): Cell => {
      const fact = factById.get(metric.id);
      return {
        value: fact ? formatMetricValue(fact.value, metric.unit) : undefined,
        status: fact ? fact.status : metric.status,
        hasDrawer: Boolean(getMetricVerification(metric.id)),
      };
    };
  }, [factById]);

  const stats = useMemo(() => {
    const byStatus: Record<MetricStatus, number> = { LIVE: 0, PARTIAL: 0, PENDING: 0 };
    for (const m of PROTOCOL_METRICS) byStatus[m.status]++;
    const live = PROTOCOL_METRICS.filter((m) => Boolean(getMetricVerification(m.id))).length;
    return { total: PROTOCOL_METRICS.length, byStatus, drawerable: live };
  }, []);

  const sample = useMemo(() => {
    const withValue = PROTOCOL_METRICS.find((m) => factById.get(m.id)?.value !== undefined);
    return withValue ?? PROTOCOL_METRICS[0];
  }, [factById]);
  const sampleCell = cellFor(sample);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Metric workbench for design + QA. Not marketing, not linked from public navigation,{" "}
          <code>noindex</code>, blocked by <code>/labs</code> in robots.txt. Live values come from
          the Protocol Truth layer where a fact exists; everything else shows{" "}
          <code>—</code> with its documented status. Nothing here fabricates a number.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · metric workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Protocol Intelligence · Metric Workbench
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Every metric in the canonical Protocol Metrics Registry, rendered in every reusable
          display form. Before building a new data surface, find the block here and import it from{" "}
          <code>@/components/metrics/MetricDisplays</code> — never re-derive a label, badge, formula,
          or verify link inline. The registry is the one source; these are its faces.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Metrics: <b>{stats.total}</b>
          </span>
          <span>
            LIVE: <b>{stats.byStatus.LIVE}</b>
          </span>
          <span>
            PARTIAL: <b>{stats.byStatus.PARTIAL}</b>
          </span>
          <span>
            PENDING: <b>{stats.byStatus.PENDING}</b>
          </span>
          <span>
            With verify drawer: <b>{stats.drawerable}</b>
          </span>
        </div>
        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/component-index" className="underline hover:no-underline">
            → Technical component index
          </Link>
          <a href="#catalog" className="underline hover:no-underline">
            → Form catalog
          </a>
          <a href="#table" className="underline hover:no-underline">
            → Master table
          </a>
        </nav>
      </header>

      {/* ── Form catalog: one metric, every form ───────────────────────────── */}
      <section id="catalog" className="mt-12 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Display form catalog{" "}
          <span className="text-muted-foreground">· sample metric: {sample.label}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          The menu of reusable forms. Each is exported from{" "}
          <code>@/components/metrics/MetricDisplays</code> and takes{" "}
          <code>{"{ metric, value?, status? }"}</code>.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <FormCard name="MetricFullBlock" use="Detail card — reports, registry, drawers.">
            <MetricFullBlock
              metric={sample}
              value={sampleCell.value}
              status={sampleCell.status}
              hasDrawer={sampleCell.hasDrawer}
              onVerify={setVerifyKey}
            />
          </FormCard>

          <div className="flex flex-col gap-4">
            <FormCard name="MetricCompactBlock" use="Dense stat cell — intelligence bar, pulse.">
              <div className="max-w-[220px]">
                <MetricCompactBlock metric={sample} value={sampleCell.value} status={sampleCell.status} />
              </div>
            </FormCard>

            <FormCard name="MetricTickerItem" use="Inline marquee / status line item.">
              <MetricTickerItem metric={sample} value={sampleCell.value} status={sampleCell.status} />
            </FormCard>

            <FormCard name="MetricStatusBadge · MetricTypeBadge" use="Trust + provenance badges.">
              <div className="flex flex-wrap items-center gap-2">
                <MetricStatusBadge status="LIVE" />
                <MetricStatusBadge status="PARTIAL" />
                <MetricStatusBadge status="PENDING" />
                <span className="mx-1 h-4 w-px bg-border" />
                <MetricTypeBadge type="RAW" />
                <MetricTypeBadge type="DERIVED" />
                <MetricTypeBadge type="AGGREGATE" />
              </div>
            </FormCard>

            <FormCard name="MetricSourceFormula" use="Where it comes from · how it's derived.">
              <MetricSourceFormula metric={sample} />
            </FormCard>

            <FormCard name="MetricVerifyAffordance" use="Explorer links + in-app drawer.">
              <MetricVerifyAffordance
                metric={sample}
                hasDrawer={sampleCell.hasDrawer}
                onVerify={setVerifyKey}
              />
            </FormCard>

            <FormCard name="MetricLegalNote" use="Legal-sensitivity framing rule.">
              <MetricLegalNote metric={sample} />
            </FormCard>

            <FormCard name="MetricSurfaceList" use="Recommended surfaces (advisory).">
              <MetricSurfaceList surfaces={sample.surfaces} />
            </FormCard>
          </div>
        </div>
      </section>

      {/* ── Ticker: every metric ───────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="text-lg font-semibold tracking-tight">
          Ticker · every metric <span className="text-muted-foreground">· MetricTickerItem</span>
        </h2>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 rounded-md border border-border bg-card px-4 py-3">
          {PROTOCOL_METRICS.map((m) => {
            const c = cellFor(m);
            return <MetricTickerItem key={m.id} metric={m} value={c.value} status={c.status} />;
          })}
        </div>
      </section>

      {/* ── Compact blocks: every metric ───────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="text-lg font-semibold tracking-tight">
          Compact blocks · every metric{" "}
          <span className="text-muted-foreground">· MetricCompactBlock</span>
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {PROTOCOL_METRICS.map((m) => {
            const c = cellFor(m);
            return <MetricCompactBlock key={m.id} metric={m} value={c.value} status={c.status} />;
          })}
        </div>
      </section>

      {/* ── Full blocks: every metric, by category ─────────────────────────── */}
      <section className="mt-14">
        <h2 className="text-lg font-semibold tracking-tight">
          Full blocks · every metric <span className="text-muted-foreground">· MetricFullBlock</span>
        </h2>
        {CATEGORY_ORDER.map((cat) => {
          const items = metricsByCategory(cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className="mt-8">
              <h3 className="mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {CATEGORY_LABEL[cat]} · {items.length}
              </h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((m) => {
                  const c = cellFor(m);
                  return (
                    <MetricFullBlock
                      key={m.id}
                      metric={m}
                      value={c.value}
                      status={c.status}
                      hasDrawer={c.hasDrawer}
                      onVerify={setVerifyKey}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Master table: every metric ─────────────────────────────────────── */}
      <section id="table" className="mt-14 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Master table · every metric <span className="text-muted-foreground">· MetricTableRow</span>
        </h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <MetricTableHeader />
            </thead>
            <tbody>
              {PROTOCOL_METRICS.map((m) => {
                const c = cellFor(m);
                return (
                  <MetricTableRow
                    key={m.id}
                    metric={m}
                    value={c.value}
                    status={c.status}
                    hasDrawer={c.hasDrawer}
                    onVerify={setVerifyKey}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
        Source of truth: <code>src/lib/protocol-metrics-registry.ts</code>. Display forms:{" "}
        <code>src/components/metrics/MetricDisplays.tsx</code>. Add a metric to the registry and it
        appears here automatically — in every form.
      </footer>

      <MetricVerificationDrawer metricKey={verifyKey} onClose={() => setVerifyKey(null)} />
    </div>
  );
}

function FormCard({
  name,
  use,
  children,
}: {
  name: string;
  use: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <code className="mono text-xs font-semibold text-foreground">{name}</code>
        <span className="text-[11px] text-muted-foreground">{use}</span>
      </div>
      {children}
    </div>
  );
}
