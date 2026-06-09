import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/syndicate/PageShell";
import { GlassCard, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import {
  PROTOCOL_HEALTH_REGISTRY,
  aggregateHealth,
  type HealthLevel,
  type ProtocolModule,
} from "@/lib/protocol-health-registry";
import { buildMilestoneReadiness, type MilestoneTicket, type TicketPriority } from "@/lib/milestone-readiness";
import { readHistory, recordSnapshotNow, clearHistory, type HealthSnapshot } from "@/lib/health-history";
import { classifyStaleness, summarizeStaleness, type StalenessStatus } from "@/lib/health-staleness";
import { triggerCsvDownload } from "@/lib/health-csv";

export const Route = createFileRoute("/protocol-health")({
  head: () => ({
    meta: [
      { title: "Protocol Health — Module-by-Module Status | The Syndicate" },
      { name: "description", content: "Live module-by-module health of The Syndicate protocol: PASS / WARN / BLOCKER per module with last-verified sources, staleness, history, and milestone readiness tickets." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "The Syndicate — Protocol Health" },
      { property: "og:description", content: "Module-by-module reconciliation of contracts, registries, UI, docs and indexers." },
    ],
  }),
  component: ProtocolHealthPage,
});

const LEVEL_TONE: Record<HealthLevel, "success" | "warning" | "danger"> = {
  PASS: "success",
  WARN: "warning",
  BLOCKER: "danger",
};

const PRIORITY_TONE: Record<TicketPriority, "danger" | "warning" | "muted"> = {
  P0: "danger",
  P1: "warning",
  P2: "muted",
};

const STALE_TONE: Record<StalenessStatus, "success" | "warning" | "danger" | "muted"> = {
  FRESH: "success",
  AGING: "warning",
  STALE: "danger",
  UNKNOWN: "muted",
};

function ModuleRow({ m }: { m: ProtocolModule }) {
  const blockers = m.findings.filter((f) => f.level === "BLOCKER").length;
  const warns = m.findings.filter((f) => f.level === "WARN").length;
  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold">{m.moduleName}</h3>
            <Pill tone={LEVEL_TONE[m.health]}>{m.health}</Pill>
            <Pill tone="muted">{m.status}</Pill>
          </div>
          <p className="mono text-[11px] text-muted-foreground mt-1">id: {m.moduleId}</p>
        </div>
        <div className="text-right text-[11px] text-muted-foreground mono">
          <div>blockers: {blockers}</div>
          <div>warns: {warns}</div>
        </div>
      </div>

      {m.findings.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {m.findings.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Pill tone={LEVEL_TONE[f.level]}>{f.level}</Pill>
              <span className="text-muted-foreground">
                <span className="mono text-[11px] uppercase tracking-wide mr-1.5">{f.category}</span>
                {f.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      {m.nextMilestoneBlocker && (
        <p className="mt-3 text-sm">
          <span className="mono text-[11px] uppercase tracking-wide text-muted-foreground mr-1.5">next milestone:</span>
          {m.nextMilestoneBlocker}
        </p>
      )}

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[11px] mono text-muted-foreground">
        <div>last verified: {m.lastVerified}</div>
        {m.contracts.length > 0 && <div>contracts: {m.contracts.join(", ")}</div>}
        {m.routes.length > 0 && <div>routes: {m.routes.join(", ")}</div>}
        {m.deferred.length > 0 && <div>deferred: {m.deferred.length}</div>}
      </div>
    </GlassCard>
  );
}

function TicketRow({ t }: { t: MilestoneTicket }) {
  return (
    <li className="flex items-start gap-3 py-2 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
      <Pill tone={PRIORITY_TONE[t.priority]}>{t.priority}</Pill>
      <div className="min-w-0">
        <div className="text-sm">{t.title}</div>
        <div className="mono text-[11px] text-muted-foreground mt-0.5">{t.moduleId} · source: {t.source}</div>
      </div>
    </li>
  );
}

function Sparkline({ data }: { data: HealthSnapshot[] }) {
  if (data.length < 2) {
    return (
      <p className="mono text-[11px] text-muted-foreground">
        {data.length === 0 ? "No snapshots recorded yet." : "1 snapshot recorded — visit again to grow the timeline."}
      </p>
    );
  }
  const w = 320, h = 60, pad = 4;
  const xs = data.map((_, i) => pad + (i * (w - pad * 2)) / (data.length - 1));
  const maxTotal = Math.max(...data.map((d) => d.passes + d.warnings + d.blockers), 1);
  const y = (n: number) => h - pad - (n / maxTotal) * (h - pad * 2);

  const path = (key: "passes" | "warnings" | "blockers") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");

  const stroke = { passes: "var(--success)", warnings: "var(--gold)", blockers: "var(--destructive)" };

  return (
    <div>
      <svg width={w} height={h} role="img" aria-label="Protocol health history sparkline" className="block">
        <path d={path("passes")} fill="none" stroke={stroke.passes} strokeWidth="1.5" />
        <path d={path("warnings")} fill="none" stroke={stroke.warnings} strokeWidth="1.5" />
        <path d={path("blockers")} fill="none" stroke={stroke.blockers} strokeWidth="1.5" />
      </svg>
      <div className="mono text-[10px] text-muted-foreground mt-1 flex gap-3">
        <span><span className="inline-block size-2 rounded-full mr-1" style={{ background: "var(--success)" }} />pass</span>
        <span><span className="inline-block size-2 rounded-full mr-1" style={{ background: "var(--gold)" }} />warn</span>
        <span><span className="inline-block size-2 rounded-full mr-1" style={{ background: "var(--destructive)" }} />blocker</span>
        <span className="ml-auto">{data.length} snapshot(s) · oldest {new Date(data[0].ts).toLocaleString()}</span>
      </div>
    </div>
  );
}

function ProtocolHealthPage() {
  const agg = aggregateHealth();
  const milestone = buildMilestoneReadiness();
  const staleness = classifyStaleness();
  const staleSummary = summarizeStaleness(staleness);
  const modulesSorted = [...PROTOCOL_HEALTH_REGISTRY].sort((a, b) => {
    const order = { BLOCKER: 0, WARN: 1, PASS: 2 } as const;
    return order[a.health] - order[b.health];
  });
  const stalenessSorted = [...staleness].sort((a, b) => {
    const o = { STALE: 0, AGING: 1, UNKNOWN: 2, FRESH: 3 } as const;
    return o[a.status] - o[b.status];
  });

  const [history, setHistory] = useState<HealthSnapshot[]>([]);
  useEffect(() => {
    setHistory(recordSnapshotNow());
  }, []);

  return (
    <PageShell
      eyebrow="Reality reflection"
      title="Protocol Health"
      description="Module-by-module reconciliation of on-chain contracts, registries, UI surfaces, docs, indexers, and explorer links. Driven by the same registry that powers the CI health check."
    >
      <Section>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-semibold">{agg.totalModules}</div>
            <div className="mono text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Modules</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-semibold">{agg.passes}</div>
            <div className="mono text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Pass</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-semibold">{agg.warnings}</div>
            <div className="mono text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Warn</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <div className="text-2xl font-semibold">{agg.blockers}</div>
            <div className="mono text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Blocker</div>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Pill tone={LEVEL_TONE[agg.worstLevel]}>{agg.worstLevel}</Pill>
            <div className="mono text-[10px] uppercase tracking-wide text-muted-foreground mt-1">Worst</div>
          </GlassCard>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Authority: <span className="mono">docs/REALITY_REFLECTION_AUDIT.md</span>. JSON snapshot:{" "}
          <a href="/api/public/protocol-health" className="underline underline-offset-4 mono">/api/public/protocol-health</a>.
          CI gate: <span className="mono">scripts/check-protocol-health.mjs</span> (non-zero exit on BLOCKER).
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => triggerCsvDownload()}
            className="mono text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border hover:bg-muted"
            style={{ borderColor: "var(--border)" }}
          >
            Export health as CSV
          </button>
          <button
            type="button"
            onClick={() => { clearHistory(); setHistory(recordSnapshotNow()); }}
            className="mono text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border hover:bg-muted"
            style={{ borderColor: "var(--border)" }}
          >
            Reset local history
          </button>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="History"
          title="Health timeline"
          description="Per-browser snapshots of the aggregate health, one per visit (throttled to 5 minutes). Not a server audit log — for that, hit /api/public/protocol-health from a monitor."
        />
        <GlassCard className="p-4 mt-4">
          <Sparkline data={history} />
        </GlassCard>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Staleness"
          title="Verification freshness"
          description="Each module records when it was last verified. FRESH ≤ 30 days · AGING ≤ 90 days · STALE beyond · UNKNOWN if no date is encoded."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-4">
          <GlassCard className="p-3 text-center"><Pill tone="success">FRESH</Pill><div className="text-xl font-semibold mt-1">{staleSummary.fresh}</div></GlassCard>
          <GlassCard className="p-3 text-center"><Pill tone="warning">AGING</Pill><div className="text-xl font-semibold mt-1">{staleSummary.aging}</div></GlassCard>
          <GlassCard className="p-3 text-center"><Pill tone="danger">STALE</Pill><div className="text-xl font-semibold mt-1">{staleSummary.stale}</div></GlassCard>
          <GlassCard className="p-3 text-center"><Pill tone="muted">UNKNOWN</Pill><div className="text-xl font-semibold mt-1">{staleSummary.unknown}</div></GlassCard>
        </div>
        <GlassCard className="p-4">
          <ul>
            {stalenessSorted.map((s) => (
              <li key={s.moduleId} className="flex items-start gap-3 py-2 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                <Pill tone={STALE_TONE[s.status]}>{s.status}</Pill>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{s.moduleName}</div>
                  <div className="mono text-[11px] text-muted-foreground mt-0.5">{s.source}</div>
                </div>
                <div className="mono text-[11px] text-muted-foreground text-right shrink-0">
                  {s.verifiedAt ?? "no date"}<br />
                  {s.ageDays !== null ? `${s.ageDays}d ago` : "—"}
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </Section>

      <Section>
        <SectionHeader eyebrow="Modules" title="Module health" />
        <div className="grid grid-cols-1 gap-3 mt-4">
          {modulesSorted.map((m) => <ModuleRow key={m.moduleId} m={m} />)}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Readiness"
          title="Milestone readiness tickets"
          description="Findings + next-milestone blockers expressed as P0 / P1 / P2 tickets. P0 must be fixed before deploy; P1 before next milestone; P2 may be safely deferred."
        />
        <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
          <GlassCard className="p-3 text-center"><Pill tone="danger">P0</Pill><div className="text-xl font-semibold mt-1">{milestone.totals.P0}</div></GlassCard>
          <GlassCard className="p-3 text-center"><Pill tone="warning">P1</Pill><div className="text-xl font-semibold mt-1">{milestone.totals.P1}</div></GlassCard>
          <GlassCard className="p-3 text-center"><Pill tone="muted">P2</Pill><div className="text-xl font-semibold mt-1">{milestone.totals.P2}</div></GlassCard>
        </div>

        {(["P0", "P1", "P2"] as const).map((p) => (
          milestone.byPriority[p].length > 0 && (
            <GlassCard key={p} className="p-4 mb-3">
              <h3 className="text-sm font-semibold mb-2">{p} — {milestone.byPriority[p].length} ticket(s)</h3>
              <ul>
                {milestone.byPriority[p].map((t, i) => <TicketRow key={i} t={t} />)}
              </ul>
            </GlassCard>
          )
        ))}
      </Section>
    </PageShell>
  );
}
