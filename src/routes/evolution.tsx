import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { CTAButton, Panel, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import {
  PROTOCOL_EVOLUTION_BOUNDARIES,
  PROTOCOL_EVOLUTION_MODULES,
  PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT,
  PROTOCOL_EVOLUTION_STATUS_ORDER,
  getProtocolEvolutionEvidenceCount,
  getProtocolEvolutionModulesByStatus,
  getProtocolEvolutionStatusCounts,
  type ProtocolEvolutionStatus,
} from "@/lib/protocol-evolution";

export const Route = createFileRoute("/evolution")({
  head: () => ({
    meta: [
      { title: "Protocol Evolution - Evidence-Backed Roadmap | The Syndicate" },
      {
        name: "description",
        content:
          "The Syndicate Protocol Evolution layer: what is live, paused, inactive, being designed, blocked, deferred, or future - with evidence and safety boundaries.",
      },
      { property: "og:title", content: "The Syndicate - Protocol Evolution" },
      {
        property: "og:description",
        content:
          "An evidence-backed institutional evolution layer. No fake dates, no activation by implication, no source/referral shortcuts.",
      },
      { property: "og:url", content: "https://thesyndicate.money/evolution" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/evolution" }],
  }),
  component: EvolutionPage,
});

const STATUS_COPY: Record<ProtocolEvolutionStatus, { title: string; tone: "success" | "warning" | "muted" | "gold" | "navy" | "danger" }> = {
  LIVE: { title: "Live", tone: "success" },
  PAUSED: { title: "Paused", tone: "warning" },
  INACTIVE: { title: "Inactive", tone: "muted" },
  RESEARCH: { title: "Research", tone: "navy" },
  DESIGN: { title: "Design", tone: "navy" },
  BUILDING: { title: "Building", tone: "gold" },
  TESTING: { title: "Testing", tone: "warning" },
  READBACK: { title: "Readback", tone: "warning" },
  BLOCKED: { title: "Blocked", tone: "danger" },
  DEFERRED: { title: "Deferred", tone: "muted" },
  FUTURE: { title: "Future", tone: "navy" },
  DEPRECATED: { title: "Deprecated", tone: "muted" },
};

function EvidenceLink({
  evidence,
}: {
  evidence: (typeof PROTOCOL_EVOLUTION_MODULES)[number]["evidence"][number];
}) {
  const label = `${evidence.label} - ${evidence.kind.replace(/_/g, " ")}`;
  if (!evidence.href) {
    return (
      <div className="rounded-[6px] border border-border/55 bg-background/45 p-3">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/75">{evidence.note}</p>
      </div>
    );
  }

  return (
    <a
      href={evidence.href}
      className="block rounded-[6px] border border-border/55 bg-background/45 p-3 transition-colors hover:border-[var(--gold)]/60"
    >
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">{label}</div>
      <p className="mt-1.5 text-xs leading-relaxed text-foreground/75">{evidence.note}</p>
    </a>
  );
}

function ModuleCard({ module }: { module: (typeof PROTOCOL_EVOLUTION_MODULES)[number] }) {
  const status = STATUS_COPY[module.status];

  return (
    <Panel
      variant="glass"
      padding="md"
      className="flex h-full flex-col"
      header={{
        eyebrow: module.category,
        title: module.title,
        aside: <Pill tone={status.tone}>{status.title}</Pill>,
      }}
    >
      <p className="text-sm leading-relaxed text-foreground/85">{module.summary}</p>
      <div className="mt-4 space-y-3 text-sm">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Current truth</div>
          <p className="mt-1 leading-relaxed text-foreground/80">{module.currentTruth}</p>
        </div>
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Not live</div>
          <p className="mt-1 leading-relaxed text-foreground/75">{module.notLive}</p>
        </div>
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Next milestone</div>
          <p className="mt-1 leading-relaxed text-foreground/75">{module.nextMilestone}</p>
        </div>
        {module.blocker && (
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Blocker</div>
            <p className="mt-1 leading-relaxed text-foreground/75">{module.blocker}</p>
          </div>
        )}
      </div>
      <div className="mt-4 rounded-[6px] border border-[var(--gold)]/25 bg-[color:color-mix(in_oklab,var(--accent)_6%,transparent)] p-3">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">Safety boundary</div>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">{module.safetyBoundary}</p>
      </div>
      <div className="mt-4 grid gap-2">
        {module.evidence.map((evidence) => (
          <EvidenceLink key={`${module.id}-${evidence.label}`} evidence={evidence} />
        ))}
      </div>
    </Panel>
  );
}

function EvolutionPage() {
  const statusCounts = getProtocolEvolutionStatusCounts();

  return (
    <PageShell
      eyebrow="Protocol Evolution"
      title="What is live, what is paused, and what is still becoming"
      description="An evidence-backed view of The Syndicate as a living institution. This page shows module status, proof, blockers, and safety boundaries without turning future work into live claims."
    >
      <Section id="evolution-summary">
        <SectionHeader
          eyebrow="Current layer"
          title="Evidence first. No fake-live systems."
          description="Protocol Evolution is not a launch button, governance portal, or referral dashboard. It is a public status layer that separates repository truth, on-chain readback, production status, and future design."
        />
        <div className="grid gap-3 md:grid-cols-4">
          <Panel variant="surface" padding="sm">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Modules tracked</div>
            <div className="mt-2 text-3xl font-semibold">{PROTOCOL_EVOLUTION_MODULES.length}</div>
          </Panel>
          <Panel variant="surface" padding="sm">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Evidence entries</div>
            <div className="mt-2 text-3xl font-semibold">{getProtocolEvolutionEvidenceCount()}</div>
          </Panel>
          <Panel variant="surface" padding="sm">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Source records</div>
            <div className="mt-2 text-3xl font-semibold">{PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT}</div>
          </Panel>
          <Panel variant="surface" padding="sm">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Write actions here</div>
            <div className="mt-2 text-3xl font-semibold">0</div>
          </Panel>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {statusCounts.map((entry) => (
            <Pill key={entry.status} tone={STATUS_COPY[entry.status].tone}>
              {STATUS_COPY[entry.status].title}: {entry.count}
            </Pill>
          ))}
        </div>
      </Section>

      <Section id="evolution-boundaries">
        <SectionHeader
          eyebrow="Read-only boundary"
          title="This surface explains state. It does not change state."
          description="These rules are intentionally visible because the institution should never confuse planned capability with live user action."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {PROTOCOL_EVOLUTION_BOUNDARIES.map((boundary) => (
            <Panel key={boundary} variant="flat" padding="sm">
              <p className="text-sm leading-relaxed text-foreground/85">{boundary}</p>
            </Panel>
          ))}
        </div>
      </Section>

      {PROTOCOL_EVOLUTION_STATUS_ORDER.map((status) => {
        const modules = getProtocolEvolutionModulesByStatus(status);
        if (modules.length === 0) return null;
        return (
          <Section key={status} id={`evolution-${status.toLowerCase()}`}>
            <SectionHeader
              eyebrow={status}
              title={`${STATUS_COPY[status].title} modules`}
              description="Each card names current truth, what is not live, the next milestone, and the evidence behind the status."
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </Section>
        );
      })}

      <Section id="evolution-next">
        <div className="surface elevated p-5 text-sm leading-relaxed text-muted-foreground">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
            Next disciplined step
          </div>
          <p className="mt-2">
            If the separately approved PAUSED source ceremony happens, this layer should update only after
            readback proves SourceCreated, sourceConfig, and PAUSED status. It should still show no public
            referral activation, no source-aware public buy path, and no claim UI.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTAButton variant="navy" href="/roadmap">Open roadmap</CTAButton>
            <CTAButton variant="ghost" href="/referral">Check source boundary</CTAButton>
          </div>
        </div>
      </Section>

      <RouteFinalCTA preset="verify" />
    </PageShell>
  );
}
