// /chapters — Chapters overview.
//
// Chapters are historical snapshots of protocol formation, not membership
// tiers, not scarcity buckets, not reward tiers. A visitor should leave this
// page able to answer:
//   • What is a Chapter?
//   • Which Chapter is active right now?
//   • Which Chapter am I in?
//   • What happened during each Chapter?
// without reading docs.
//
// Pure derivation of useHolderIndex. No new data layer. See
// docs/CHAPTER_ARCHIVES_SPEC.md and docs/CHAPTER_ARCHIVES_QA.md.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { Section, SectionHeader, StatusPill, GlassCard } from "@/components/syndicate/Primitives";
import { Breadcrumbs } from "@/components/syndicate/Breadcrumbs";
import { useHolderIndex, type HolderChapter } from "@/lib/holder-index";

const CANONICAL_ORIGIN = "https://thesyndicate.money";

type ChapterMeta = {
  key: HolderChapter;
  slug: string;
  label: string;
  range: string;
  startN: number;
  endN: number | null; // null = open
  blurb: string;
};

export const CHAPTERS: ChapterMeta[] = [
  {
    key: "genesis-signal",
    slug: "genesis-signal",
    label: "Genesis Signal",
    range: "#1 – #333",
    startN: 1,
    endN: 333,
    blurb: "The first signal. The founding cohort of The Syndicate — scarce, but not tiny.",
  },
  {
    key: "first-thousand",
    slug: "first-thousand",
    label: "First Thousand",
    range: "#334 – #1,000",
    startN: 334,
    endN: 1_000,
    blurb: "The first public formation milestone — the protocol reaches one thousand members.",
  },
  {
    key: "the-expansion",
    slug: "the-expansion",
    label: "The Expansion",
    range: "#1,001 – #3,333",
    startN: 1_001,
    endN: 3_333,
    blurb: "The protocol moves from early formation to a visible community.",
  },
  {
    key: "first-ten-thousand",
    slug: "first-ten-thousand",
    label: "First Ten Thousand",
    range: "#3,334 – #10,000",
    startN: 3_334,
    endN: 10_000,
    blurb: "The first large public era. The formation phase becomes a permanent ten-thousand-member archive.",
  },
  {
    key: "open-era",
    slug: "open-era",
    label: "Open Era",
    range: "#10,001 +",
    startN: 10_001,
    endN: null,
    blurb: "Open-ended protocol era after the founding archive. The Syndicate is open to all qualifying wallets.",
  },
];

export function activeChapter(memberCount: number): ChapterMeta {
  for (const c of CHAPTERS) {
    if (c.endN === null) return c;
    if (memberCount < c.endN) return c;
  }
  return CHAPTERS[CHAPTERS.length - 1];
}

export const Route = createFileRoute("/chapters")({
  head: () => {
    const title = "Chapters — The Syndicate";
    const desc =
      "Chapters are historical snapshots of how The Syndicate formed. Genesis Signal, First Thousand, The Expansion, First Ten Thousand, Open Era — each chapter records who joined and when. Verifiable on Avalanche.";
    const url = `${CANONICAL_ORIGIN}/chapters`;
    const img = `${CANONICAL_ORIGIN}/og/og-protocol-default.png`;
    const imgAlt = "The Syndicate — Chapters. Historical snapshots of protocol formation.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:image", content: img },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: imgAlt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: img },
        { name: "twitter:image:alt", content: imgAlt },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ChaptersPage,
});

function ChaptersPage() {
  return (
    <PageShell
      eyebrow="Chapters"
      title="The protocol's formation, one chapter at a time"
      description="A chapter is a snapshot of when a wallet joined the story. It is not a tier, not a reward, not a privilege package. Simple historical record, verifiable on Avalanche."
    >
      <Breadcrumbs />
      <ChaptersOverview />
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  );
}

function ChaptersOverview() {
  const idx = useHolderIndex();
  const total = idx.totals.members;
  const active = activeChapter(total);
  const status: "LIVE" | "PARTIAL" | "PENDING" = idx.isError
    ? "PENDING"
    : !idx.hasData
      ? idx.isLoading ? "PARTIAL" : "PENDING"
      : "LIVE";

  const counts = useMemo(() => {
    const c: Record<HolderChapter, number> = {
      "genesis-signal": 0, "first-thousand": 0, "the-expansion": 0, "first-ten-thousand": 0, "open-era": 0,
    };
    for (const r of idx.ordered) c[r.chapter] += 1;
    return c;
  }, [idx.ordered]);

  return (
    <>
      <Section id="chapters-header">
        <GlassCard className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={status} />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Derived from TokensPurchased · Membership Sale
            </span>
            {idx.asOfBlock !== undefined && (
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                · as of block {idx.asOfBlock.toString()}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Members so far" value={total.toLocaleString("en-US")} />
            <Stat label="Active chapter" value={active.label} />
            <Stat label="Active range" value={active.range} />
            <Stat
              label="Next founder #"
              value={`#${idx.totals.nextMemberNumber.toLocaleString("en-US")}`}
            />
          </div>

          <div className="mt-5 grid md:grid-cols-2 gap-4 text-sm text-muted-foreground leading-relaxed">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground mb-1">
                What is a Chapter?
              </div>
              <p>
                A chapter is a range of founder numbers. Genesis Signal is
                the founding cohort (#1 – #333). First Thousand carries the
                protocol to one thousand members. Joining is the same action
                in every chapter — only the moment in history changes.
              </p>
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground mb-1">
                Why do chapters exist?
              </div>
              <p>
                Chapters give the protocol a memory. They let any visitor
                see how the community formed and verify each entry on
                Avalanche. They are historical records, nothing more.
              </p>
            </div>
          </div>
        </GlassCard>
      </Section>

      <Section id="chapters-grid">
        <SectionHeader
          eyebrow="The five chapters"
          title={<>How <span className="text-gradient-gold">formation</span> unfolds</>}
          description="Each chapter is sealed once it fills. Earlier chapters are not better — they are earlier."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CHAPTERS.map((c) => {
            const filled = counts[c.key];
            const target = c.endN === null ? Infinity : c.endN - c.startN + 1;
            const sealed = c.endN !== null && total >= c.endN;
            const isActive = c.key === active.key;
            const pct = c.endN === null
              ? 100
              : Math.min(100, ((total - (c.startN - 1)) / (c.endN - c.startN + 1)) * 100);
            const clampedPct = Math.max(0, pct);
            return (
              <Link
                key={c.slug}
                to="/chapters/$slug"
                params={{ slug: c.slug }}
                search={{ page: 1 }}
                className={`group block rounded-lg border bg-card/40 hover:bg-card/70 transition-colors p-5 ${
                  isActive
                    ? "border-[var(--gold)]/60"
                    : "border-border/60 hover:border-[var(--gold)]/50"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-lg font-semibold tracking-tight">
                    {c.label}
                  </div>
                  <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                    {c.range}
                  </span>
                </div>
                <div className="mt-1 mono text-[10px] uppercase tracking-[0.18em]">
                  {sealed ? (
                    <span className="text-[var(--gold)]">● Sealed</span>
                  ) : isActive ? (
                    <span className="text-[var(--gold)]">● Active now</span>
                  ) : c.endN !== null && total < c.startN ? (
                    <span className="text-muted-foreground">Opens at #{c.startN}</span>
                  ) : (
                    <span className="text-muted-foreground">Forming</span>
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  {c.blurb}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2 text-[10px] text-muted-foreground mono">
                  <span>
                    {target === Infinity
                      ? `${filled.toLocaleString("en-US")} members`
                      : `${Math.min(filled, target)} / ${target}`}
                  </span>
                  <span className="group-hover:text-[var(--gold)] transition-colors">
                    Open chapter →
                  </span>
                </div>
                {c.endN !== null && (
                  <div className="mt-3 h-1 rounded-full overflow-hidden bg-border/30">
                    <div
                      className="h-full bg-[var(--gold)]/80 transition-all"
                      style={{ width: `${clampedPct}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </Section>

      <Section id="chapters-disclosure">
        <GlassCard className="p-5 text-xs text-muted-foreground leading-relaxed">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground mb-2">
            What chapters do NOT mean
          </div>
          <p>
            Chapter membership records when a wallet joined the protocol. It
            does not imply ownership rights, treasury claims, guaranteed
            rewards, future benefits, priority allocations, or any form of
            financial entitlement. It is a historical coordinate — nothing
            more.
          </p>
        </GlassCard>
      </Section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-card/30 p-3">
      <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}
