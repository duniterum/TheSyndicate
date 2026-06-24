import { useEffect, useMemo, useState } from "react";
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
import {
  PROTOCOL_EVOLUTION_EPISODES,
  getProtocolEvolutionEpisodeCounts,
  getProtocolEvolutionEpisodesByState,
  getProtocolEvolutionEpisodesSince,
  getProtocolEvolutionLatestEpisode,
  type ProtocolEvolutionEpisode,
  type ProtocolEvolutionEpisodeState,
} from "@/lib/protocol-evolution-episodes";

export const Route = createFileRoute("/evolution")({
  head: () => ({
    meta: [
      { title: "Protocol Evolution - Living Protocol Command Center | The Syndicate" },
      {
        name: "description",
        content:
          "The Syndicate Protocol Evolution layer: episodes, proof, status, blockers, and safety boundaries for a living membership institution.",
      },
      { property: "og:title", content: "The Syndicate - Protocol Evolution" },
      {
        property: "og:description",
        content:
          "A read-only protocol command center: what became true, what is unfolding now, and the evidence underneath.",
      },
      { property: "og:url", content: "https://thesyndicate.money/evolution" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/evolution" }],
  }),
  component: EvolutionPage,
});

const EVOLUTION_VISIT_KEY = "syndicate.protocolEvolution.seenEpisodeIds.v1";

const STATUS_COPY: Record<
  ProtocolEvolutionStatus,
  { title: string; tone: "success" | "warning" | "muted" | "gold" | "navy" | "danger" }
> = {
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

const EPISODE_STATE_COPY: Record<
  ProtocolEvolutionEpisodeState,
  { title: string; tone: "success" | "warning" | "muted" | "gold" | "navy" | "danger" }
> = {
  BECAME_TRUE: { title: "Became true", tone: "success" },
  UNFOLDING: { title: "Unfolding", tone: "gold" },
  WATCH_NEXT: { title: "Watch next", tone: "navy" },
  WAITING_READBACK: { title: "Waiting readback", tone: "warning" },
  DEFERRED: { title: "Deferred", tone: "muted" },
};

function useEvolutionVisitMemory() {
  const [seenEpisodeIds, setSeenEpisodeIds] = useState<readonly string[] | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EVOLUTION_VISIT_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const previousIds = Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string")
        : [];
      setSeenEpisodeIds(previousIds);
      window.localStorage.setItem(
        EVOLUTION_VISIT_KEY,
        JSON.stringify(PROTOCOL_EVOLUTION_EPISODES.map((episode) => episode.id)),
      );
    } catch {
      setSeenEpisodeIds([]);
    }
  }, []);

  return useMemo(() => {
    if (seenEpisodeIds === null) {
      return { isReady: false, newEpisodes: [] as ProtocolEvolutionEpisode[] };
    }
    return {
      isReady: true,
      newEpisodes: getProtocolEvolutionEpisodesSince(seenEpisodeIds),
    };
  }, [seenEpisodeIds]);
}

function EvidenceLink({
  evidence,
}: {
  evidence: (typeof PROTOCOL_EVOLUTION_MODULES)[number]["evidence"][number];
}) {
  const label = `${evidence.label} - ${evidence.kind.replace(/_/g, " ")}`;
  if (!evidence.href) {
    return (
      <div className="rounded-[6px] border border-border/55 bg-background/45 p-3">
        <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/75">{evidence.note}</p>
      </div>
    );
  }

  return (
    <a
      href={evidence.href}
      className="block rounded-[6px] border border-border/55 bg-background/45 p-3 transition-colors hover:border-[var(--gold)]/60"
    >
      <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">{label}</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/75">{evidence.note}</p>
    </a>
  );
}

function EpisodeEvidenceLink({
  evidence,
}: {
  evidence: ProtocolEvolutionEpisode["evidence"][number];
}) {
  return <EvidenceLink evidence={evidence} />;
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
      <p className="text-base leading-relaxed text-foreground/85">{module.summary}</p>
      <div className="mt-4 space-y-3 text-sm">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Current truth</div>
          <p className="mt-1 leading-relaxed text-foreground/80">{module.currentTruth}</p>
        </div>
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Not live</div>
          <p className="mt-1 leading-relaxed text-foreground/75">{module.notLive}</p>
        </div>
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Next milestone</div>
          <p className="mt-1 leading-relaxed text-foreground/75">{module.nextMilestone}</p>
        </div>
        {module.blocker && (
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Blocker</div>
            <p className="mt-1 leading-relaxed text-foreground/75">{module.blocker}</p>
          </div>
        )}
      </div>
      <div className="mt-4 rounded-[6px] border border-[var(--gold)]/25 bg-[color:color-mix(in_oklab,var(--accent)_6%,transparent)] p-3">
        <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">Safety boundary</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">{module.safetyBoundary}</p>
      </div>
      <div className="mt-4 grid gap-2">
        {module.evidence.map((evidence) => (
          <EvidenceLink key={`${module.id}-${evidence.label}`} evidence={evidence} />
        ))}
      </div>
    </Panel>
  );
}

function EpisodeCard({
  episode,
  prominent = false,
}: {
  episode: ProtocolEvolutionEpisode;
  prominent?: boolean;
}) {
  const state = EPISODE_STATE_COPY[episode.state];

  return (
    <Panel
      variant={prominent ? "surface" : "glass"}
      padding="md"
      glow={prominent ? "verify" : undefined}
      className="h-full"
      header={{
        eyebrow: episode.eyebrow,
        title: episode.title,
        aside: <Pill tone={state.tone}>{state.title}</Pill>,
      }}
    >
      <p className={prominent ? "text-lg leading-relaxed text-foreground/88" : "text-base leading-relaxed text-foreground/84"}>
        {episode.plainSummary}
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
            Why it matters
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/78">{episode.whyItMattersToMembers}</p>
        </div>
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            What did not change
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">{episode.whatDidNotChange}</p>
        </div>
      </div>
      <div className="mt-5 rounded-[6px] border border-border/60 bg-background/35 p-3">
        <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Proof to watch next
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{episode.proofToWatchNext}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {episode.surfaces.map((surface) => (
          <Pill key={`${episode.id}-${surface}`} tone="muted">
            {surface}
          </Pill>
        ))}
      </div>
    </Panel>
  );
}

function CommandMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <Panel variant="surface" padding="sm">
      <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold leading-none">{value}</div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/70">{note}</p>
    </Panel>
  );
}

function SinceLastVisitCard({
  isReady,
  newEpisodes,
}: {
  isReady: boolean;
  newEpisodes: readonly ProtocolEvolutionEpisode[];
}) {
  const hasNewEpisodes = isReady && newEpisodes.length > 0;

  return (
    <Panel
      variant="flat"
      padding="md"
      header={{
        eyebrow: "Return loop",
        title: "Changed since last follow",
        aside: <Pill tone={hasNewEpisodes ? "gold" : "muted"}>{hasNewEpisodes ? `${newEpisodes.length} new` : "Current"}</Pill>,
      }}
    >
      {!isReady ? (
        <p className="text-sm leading-relaxed text-foreground/75">
          Checking this browser's local Protocol Evolution memory. No account, cookie, or server tracking is used here.
        </p>
      ) : hasNewEpisodes ? (
        <div className="space-y-3">
          {newEpisodes.slice(0, 3).map((episode) => (
            <div key={`new-${episode.id}`} className="rounded-[6px] border border-border/55 bg-background/35 p-3">
              <div className="text-sm font-semibold text-foreground">{episode.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/70">{episode.whatBecameTrue}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-foreground/75">
          You are current on this browser. The next change to watch is a proof event, not a promise.
        </p>
      )}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        This memory is local to your browser. It does not create an account, source record, referral path, or claim.
      </p>
    </Panel>
  );
}

function EpisodeTimeline() {
  return (
    <div className="grid gap-4">
      {PROTOCOL_EVOLUTION_EPISODES.map((episode, index) => {
        const state = EPISODE_STATE_COPY[episode.state];
        return (
          <Panel key={episode.id} variant="glass" padding="md">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.8fr)_minmax(220px,0.7fr)] lg:items-start">
              <div>
                <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Episode {String(index + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Pill tone={state.tone}>{state.title}</Pill>
                  <Pill tone="muted">{episode.timelineLabel}</Pill>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{episode.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-foreground/78">{episode.plainSummary}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
                      What became true
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/76">{episode.whatBecameTrue}</p>
                  </div>
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      What is unfolding
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/76">{episode.whatIsUnfolding}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-[6px] border border-[var(--gold)]/25 bg-[color:color-mix(in_oklab,var(--accent)_6%,transparent)] p-3">
                  <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
                    Safety boundary
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{episode.safetyBoundary}</p>
                </div>
              </div>
              <div className="grid gap-2">
                {episode.evidence.map((item) => (
                  <EpisodeEvidenceLink key={`${episode.id}-${item.label}`} evidence={item} />
                ))}
              </div>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function EvolutionPage() {
  const statusCounts = getProtocolEvolutionStatusCounts();
  const episodeCounts = getProtocolEvolutionEpisodeCounts();
  const latestEpisode = getProtocolEvolutionLatestEpisode() ?? PROTOCOL_EVOLUTION_EPISODES[0];
  const unfoldingEpisodes = [
    ...getProtocolEvolutionEpisodesByState("UNFOLDING"),
    ...getProtocolEvolutionEpisodesByState("WATCH_NEXT"),
    ...getProtocolEvolutionEpisodesByState("WAITING_READBACK"),
  ];
  const visitMemory = useEvolutionVisitMemory();

  return (
    <PageShell
      eyebrow="Protocol Evolution"
      title="The Syndicate is becoming in public"
      description="A read-only protocol command center for what became true, what is unfolding now, what proof to watch next, and the evidence underneath."
    >
      <Section id="evolution-command-center">
        <SectionHeader
          eyebrow="Protocol command center"
          title="Simple surface. Deep proof underneath."
          description="Normal visitors can follow the story in seconds. Builders and researchers can drill into routes, docs, readbacks, commits, contracts, and safety boundaries."
        />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <EpisodeCard episode={latestEpisode} prominent />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <CommandMetric
              label="Became true"
              value={episodeCounts.BECAME_TRUE}
              note="Episodes backed by current route, doc, or contract evidence."
            />
            <CommandMetric
              label="Unfolding now"
              value={unfoldingEpisodes.length}
              note="Proof to watch next, without treating future work as live."
            />
            <CommandMetric
              label="Source records"
              value={PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT}
              note="Referral/source remains inactive unless a separate ceremony proves otherwise."
            />
            <CommandMetric
              label="Write actions here"
              value="0"
              note="This page cannot deploy, activate, create records, or switch registry state."
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill tone="success">V3 membership path</Pill>
          <Pill tone="muted">ZERO_SOURCE_ID default</Pill>
          <Pill tone="warning">Source attribution not public</Pill>
          <Pill tone="muted">Claim UI absent</Pill>
          <Pill tone="navy">Proof board below</Pill>
        </div>
      </Section>

      <Section id="evolution-return-loop">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SinceLastVisitCard isReady={visitMemory.isReady} newEpisodes={visitMemory.newEpisodes} />
          <Panel
            variant="surface"
            glow="verify"
            padding="md"
            header={{
              eyebrow: "What to watch next",
              title: unfoldingEpisodes[0]?.title ?? "The next proof event",
              aside: <Pill tone="gold">Watch</Pill>,
            }}
          >
            <p className="text-base leading-relaxed text-foreground/84">
              {unfoldingEpisodes[0]?.proofToWatchNext ??
                "Watch for a proof event that changes current truth before any public claim changes."}
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <CTAButton variant="navy" href="/registry">Registry</CTAButton>
              <CTAButton variant="ghost" href="/activity">Activity</CTAButton>
              <CTAButton variant="ghost" href="/referral">Referral boundary</CTAButton>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Watching does not activate anything. Source records, referral links, claim UI, and future identity
              systems require separate proof and separate approval.
            </p>
          </Panel>
        </div>
      </Section>

      <Section id="evolution-episodes">
        <SectionHeader
          eyebrow="Episode layer"
          title="What became true, what is unfolding, and why it matters"
          description="Episodes are curated protocol moments. They are not votes, comments, claims, rewards, or roadmap promises."
        />
        <EpisodeTimeline />
      </Section>

      <Section id="evolution-summary">
        <SectionHeader
          eyebrow="Proof board"
          title="Evidence first. No fake-live systems."
          description="Protocol Evolution keeps the V1 status board as the trust layer: module status, evidence, blockers, and boundaries."
        />
        <div className="grid gap-3 md:grid-cols-4">
          <CommandMetric
            label="Modules tracked"
            value={PROTOCOL_EVOLUTION_MODULES.length}
            note="Current protocol, product, memory, and future-system modules."
          />
          <CommandMetric
            label="Evidence entries"
            value={getProtocolEvolutionEvidenceCount()}
            note="Routes, docs, contract facts, readbacks, and guardrails."
          />
          <CommandMetric
            label="Source records"
            value={PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT}
            note="Must remain factual after every SourceRegistry readback."
          />
          <CommandMetric
            label="Write actions here"
            value="0"
            note="Read-only surface. No wallet signing path exists here."
          />
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
              <p className="text-base leading-relaxed text-foreground/85">{boundary}</p>
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
        <div className="surface elevated p-5 text-base leading-relaxed text-muted-foreground">
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
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
