// /knowledge-map — the PUBLIC, restrained Protocol Knowledge Map (Sprint 11).
//
// A read-only, educational visualization of src/lib/protocol-knowledge-map.ts:
// where each kind of protocol knowledge lives, what each home owns, and how a fact
// moves from a live projection into durable memory. It renders the registry's OWN
// fields — it invents no nodes, renames nothing, and shows no live values (for live
// numbers, see Transparency and the Registry). Internal /labs surfaces stay internal:
// this page lists each home's PUBLIC surfaces only.
//
// It is NOT Story, NOT Recognition, NOT the Member Register, NOT Chronicle Phase 2.
// Indexable and canonical, but restrained: reached via cross-links from the Registry,
// Institutional Register, Transparency, and Chronicle — never the main navigation.

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { PagePurpose } from "@/components/syndicate/PagePurpose";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import {
  GlassCard,
  Pill,
  Section,
  SectionHeader,
  StatusPill,
  type CanonicalStatus,
} from "@/components/syndicate/Primitives";
import {
  CLUSTER_LABELS,
  KNOWLEDGE_KIND_LABELS,
  KNOWLEDGE_KIND_ORDER,
  ANTI_FRAGMENTATION_RULES,
  KNOWLEDGE_FACT_LIFECYCLE,
  PROTOCOL_LAYERS,
  layersByKnowledgeKind,
  type ProtocolLayer,
} from "@/lib/protocol-knowledge-map";

export const Route = createFileRoute("/knowledge-map")({
  head: () => ({
    meta: [
      { title: "Protocol Knowledge Map — Where Facts Live | The Syndicate" },
      {
        name: "description",
        content:
          "A readable map of where every kind of protocol knowledge lives in The Syndicate — live on-chain projections, durable institutional memory, and reserved future systems. Structure, not live values.",
      },
      { property: "og:title", content: "The Syndicate — Protocol Knowledge Map" },
      {
        property: "og:description",
        content:
          "Where each fact lives, what each system owns, and how knowledge moves from a live projection into durable memory. Read-only.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://thesyndicate.money/knowledge-map" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/knowledge-map" }],
  }),
  component: KnowledgeMapRoute,
});

// Registry status → the canonical public status vocabulary. The map's own
// "reserved" becomes PENDING (not deployed); "mock-quarantined" becomes DEMO.
const STATUS_MAP: Record<ProtocolLayer["status"], CanonicalStatus> = {
  live: "LIVE",
  partial: "PARTIAL",
  "mock-quarantined": "DEMO",
  reserved: "PENDING",
};

const POSTURE_LABEL: Record<ProtocolLayer["identityPosture"], string> = {
  "identity-free": "identity-free",
  "member-derived": "member-derived",
  "member-living-reserved": "member-living · reserved",
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground/85 leading-relaxed">{children}</div>
    </div>
  );
}

function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code className="mono rounded-[3px] border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[11px] text-muted-foreground">
      {children}
    </code>
  );
}

function HomeCard({ l }: { l: ProtocolLayer }) {
  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-serif text-xl font-semibold tracking-tight text-foreground">
          {l.name}
        </h3>
        <span className="grow" />
        <StatusPill status={STATUS_MAP[l.status]} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Pill tone="muted">{CLUSTER_LABELS[l.cluster]}</Pill>
        <Pill tone="muted">{l.permanence}</Pill>
        <Pill tone="muted">{l.coverageModel}</Pill>
        <Pill tone="muted">{POSTURE_LABEL[l.identityPosture]}</Pill>
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed">{l.purpose}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Fact label="Source of truth">
          {l.sourceOfTruth.description}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {l.sourceOfTruth.homeFiles.map((f) => (
              <CodeChip key={f}>{f}</CodeChip>
            ))}
          </div>
        </Fact>
        <Fact label="Promotion path">
          {l.promotionPath ?? "Terminal — no onward promotion."}
        </Fact>
        <Fact label="Public surfaces">
          {l.publicSurfaces.length === 0 ? (
            <span className="text-muted-foreground">— (no public surface yet)</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {l.publicSurfaces.map((s) => (
                <CodeChip key={s}>{s}</CodeChip>
              ))}
            </div>
          )}
        </Fact>
        <Fact label="Canon">
          <div className="flex flex-wrap gap-1">
            {l.indexes.canonDocs.length === 0 ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              l.indexes.canonDocs.map((d) => <CodeChip key={d}>{d}</CodeChip>)
            )}
          </div>
        </Fact>
      </div>

      {l.statusNote && (
        <p className="rounded-[4px] border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground leading-relaxed">
          {l.statusNote}
        </p>
      )}
    </GlassCard>
  );
}

function KnowledgeMapRoute() {
  return (
    <PageShell
      eyebrow="Knowledge Map"
      title="Where every fact lives"
      description="A readable map of where each kind of protocol knowledge lives in The Syndicate, what each system owns, and how a fact moves from a live on-chain projection into durable memory. This page describes structure — not live values."
    >
      <PagePurpose
        statement="The Knowledge Map shows where each kind of protocol knowledge lives and how a fact moves from live projection into durable memory — structure, not live values."
        distinctions={[{ label: "Institutional Register", to: "/institutional-register" }]}
      />

      {/* The model + the three rules + the user-education copy. */}
      <Section id="how-knowledge-moves" width="editorial">
        <SectionHeader
          eyebrow="The model"
          title="Two kinds of truth"
          description="The protocol may know a fact in one system before that fact belongs in the Institutional Register. Knowing is not the same as remembering — and both are kept honest by three rules."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Knowledge is a live projection
            </h3>
            <p className="mt-2 text-sm text-foreground/85 leading-relaxed">
              Most of what the protocol knows is recomputed every load from on-chain truth.
              Member numbers live in the Holder Index. Archive1155 artifacts live in the Archive.
              SeatRecord721 is reserved for future identity records. Treasury values live in the asset / treasury reads. Nothing is stored twice — each fact is read
              from its one canonical home.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Memory is a durable overlay
            </h3>
            <p className="mt-2 text-sm text-foreground/85 leading-relaxed">
              Institutional memory lives in the Institutional Register. It records an assertion
              and its on-chain anchor — never a live value — and a fact only enters it by
              promotion or seed. Everything else is held in its knowledge home until then.
            </p>
          </GlassCard>
        </div>

        <div className="mt-6 grid gap-3">
          {ANTI_FRAGMENTATION_RULES.map((rule) => (
            <div
              key={rule.n}
              className="flex gap-4 rounded-[4px] border border-border/60 bg-muted/20 p-4"
            >
              <span className="mono text-sm font-semibold" style={{ color: "var(--accent)" }}>
                {String(rule.n).padStart(2, "0")}
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">{rule.title}</div>
                <p className="mt-1 text-sm text-foreground/80 leading-relaxed">{rule.statement}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[4px] border border-border/60 bg-muted/15 p-4">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Fact lifecycle
          </div>
          <div className="mt-4 grid gap-3">
            {KNOWLEDGE_FACT_LIFECYCLE.map((stage) => (
              <div
                key={stage.id}
                className="grid gap-3 rounded-[4px] border border-border/50 bg-background/30 p-3 md:grid-cols-[56px_1fr_1fr]"
              >
                <div className="mono text-xs text-muted-foreground">
                  {String(stage.order).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{stage.label}</div>
                  <p className="mt-1 text-xs text-foreground/75 leading-relaxed">
                    {stage.question}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    <span className="text-foreground/75">Home:</span> {stage.belongsIn}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p>
                    <span className="text-foreground/75">Next:</span> {stage.next}
                  </p>
                  <p className="mt-2">
                    <span className="text-foreground/75">Not authority for:</span>{" "}
                    {stage.notAuthorityFor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {PROTOCOL_LAYERS.length} knowledge homes · projected from the code registry · structure,
          not live values
        </p>
      </Section>

      {/* The three buckets: live projections → durable overlays → reserved. */}
      {KNOWLEDGE_KIND_ORDER.map((kind) => {
        const layers = layersByKnowledgeKind(kind);
        if (layers.length === 0) return null;
        const label = KNOWLEDGE_KIND_LABELS[kind];
        return (
          <Section key={kind} id={kind} width="editorial">
            <SectionHeader
              eyebrow={`${label.title} · ${layers.length}`}
              title={label.title}
              description={label.blurb}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {layers.map((l) => (
                <HomeCard key={l.id} l={l} />
              ))}
            </div>
          </Section>
        );
      })}

      {/* Reserved-future note: pending systems tracked elsewhere, not invented here. */}
      <Section id="not-yet" width="editorial">
        <div className="rounded-[4px] border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground leading-relaxed">
          This map shows only the knowledge homes that exist in code today. Other future systems —
          governance, an AI layer, a marketplace — are tracked as PENDING contracts on the{" "}
          <Link to="/registry" className="text-foreground underline-offset-4 hover:underline">
            Registry
          </Link>
          , not as knowledge homes. They are named only where they are honestly labeled as not yet
          built.
        </div>
      </Section>

      {/* Cross-references (restrained; this page is not in the main navigation). */}
      <Section id="more">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="muted">Cross-references</Pill>
          <Link
            to="/registry"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          >
            Registry →
          </Link>
          <Link
            to="/institutional-register"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          >
            Institutional Register →
          </Link>
          <Link
            to="/transparency"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          >
            Transparency →
          </Link>
          <Link
            to="/chronicle"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          >
            Chronicle →
          </Link>
        </div>
      </Section>

      <RouteFinalCTA preset="verify" />
    </PageShell>
  );
}
