// /members — Member Wall.
//
// Founder framing (not engineering framing): this is the first surface where
// The Syndicate stops feeling like a token site and starts feeling like a
// society being formed in public. Three lenses on the SAME data:
//
//   • Latest    — "People are joining."           (social proof)
//   • Founders  — "Who got here first?"           (history)
//   • Chapters  — "Which cohort am I part of?"    (belonging)
//
// Never a wealth leaderboard. Never sortable by USDC. No bios, no handles,
// no avatars. Pure derivation of useHolderIndex. See docs/MEMBER_WALL_SPEC.md.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { Section, SectionHeader, StatusPill, GlassCard } from "@/components/syndicate/Primitives";
import { EmptyState } from "@/components/syndicate/EmptyState";
import { Breadcrumbs } from "@/components/syndicate/Breadcrumbs";
import { useHolderIndex, type HolderRecord, type HolderChapter } from "@/lib/holder-index";
import { useChainTime } from "@/lib/chain-time";
import { fmtAddress } from "@/lib/sale-hooks";

const CANONICAL_ORIGIN = "https://thesyndicate.money";

export const Route = createFileRoute("/members")({
  head: () => {
    const title = "Members — The Syndicate";
    const desc =
      "A living wall of every verifiable member of The Syndicate. Archive-ordered, never wealth-ordered. Latest joins, founders, and chapter cohorts — all derived from on-chain Membership Sale events.";
    const url = `${CANONICAL_ORIGIN}/members`;
    const img = `${CANONICAL_ORIGIN}/og/og-protocol-default.png`;
    const imgAlt =
      "The Syndicate — Member Wall. Real members, verifiable, archive-ordered.";
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
  component: MembersPage,
});

type Lens = "latest" | "founders" | "chapters";

const CHAPTERS: Array<{ key: HolderChapter; label: string; range: string; target: number; startN: number }> = [
  { key: "genesis-signal",     label: "Genesis Signal",     range: "#1 – #333",        target: 333,      startN: 1 },
  { key: "first-thousand",     label: "First Thousand",     range: "#334 – #1,000",    target: 1_000,    startN: 334 },
  { key: "the-expansion",      label: "The Expansion",      range: "#1,001 – #3,333",  target: 3_333,    startN: 1_001 },
  { key: "first-ten-thousand", label: "First Ten Thousand", range: "#3,334 – #10,000", target: 10_000,   startN: 3_334 },
  { key: "open-era",           label: "Open Era",           range: "#10,001 +",        target: Infinity, startN: 10_001 },
];

const CHAPTER_LABEL: Record<HolderChapter, string> = {
  "genesis-signal":     "Genesis Signal",
  "first-thousand":     "First Thousand",
  "the-expansion":      "The Expansion",
  "first-ten-thousand": "First Ten Thousand",
  "open-era":           "Open Era",
};

function MembersPage() {
  return (
    <PageShell
      eyebrow="Members"
      title="The Member Wall"
      description="People are joining. Every tile is a real wallet that bought SYN through the Membership Sale — verifiable on Avalanche in one click. Archive-ordered, never wealth-ordered."
    >
      <Breadcrumbs />
      <MemberWallBody />
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  );
}

function MemberWallBody() {
  const idx = useHolderIndex();
  const [lens, setLens] = useState<Lens>("latest");
  const [chapter, setChapter] = useState<HolderChapter>("genesis-signal");

  const totalMembers = idx.totals.members;
  const nextNumber = idx.totals.nextMemberNumber;
  const status = idx.isError
    ? "PENDING"
    : !idx.hasData
      ? (idx.isLoading ? "PARTIAL" : "PENDING")
      : "LIVE";

  return (
    <>
      <Section id="member-wall-header">
        <GlassCard className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={status as "LIVE" | "PARTIAL" | "PENDING"} />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Indexed from TokensPurchased · Membership Sale
            </span>
            {idx.asOfBlock !== undefined && (
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                · as of block {idx.asOfBlock.toString()}
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Members" value={totalMembers.toLocaleString("en-US")} />
            <Stat label="Next founder #" value={`#${nextNumber.toLocaleString("en-US")}`} />
            <Stat
              label="Joined (24h)"
              value={idx.deltas?.last24h.available ? idx.deltas.last24h.newMembers.toString() : "—"}
            />
            <Stat
              label="Joined (7d)"
              value={idx.deltas?.last7d.available ? idx.deltas.last7d.newMembers.toString() : "—"}
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            The Wall is not a leaderboard. There is no sort-by-contribution.
            Every member appears once, with their founder number, rank tier, and
            chapter. The deepest financial detail lives on the wallet page.
          </p>
        </GlassCard>
      </Section>

      <Section id="member-wall-lenses">
        <SectionHeader
          eyebrow="Three lenses · same data"
          title={<>How do you want to <span className="text-gradient-gold">read the wall?</span></>}
          description="Latest = social proof. Founders = history. Chapters = belonging. Same members, different storytelling."
        />

        <div className="flex flex-wrap gap-2 mb-6">
          <LensBtn current={lens} value="latest"   onClick={setLens}>Latest joins</LensBtn>
          <LensBtn current={lens} value="founders" onClick={setLens}>Founders (Genesis Signal · #1–#333)</LensBtn>
          <LensBtn current={lens} value="chapters" onClick={setLens}>Chapters</LensBtn>
        </div>

        {!idx.hasData ? (
          <EmptyState
            status={idx.isLoading ? "PARTIAL" : "PENDING"}
            title={idx.isLoading ? "Reading the chain" : "The wall is waiting for Member #1"}
            description={
              idx.isLoading
                ? "Pulling every membership purchase directly from Avalanche. The wall fills in as members are read."
                : "When the first person joins, they become Member #1 — permanently. No placeholders, no fake names, no marketing-only entries. Ever."
            }
            action={
              <Link
                to="/join"
                className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]"
              >
                Become founder #{nextNumber} →
              </Link>
            }
          />
        ) : (
          <>
            {lens === "latest" && <LatestLens records={idx.latest} />}
            {lens === "founders" && <FoundersLens records={idx.ordered} />}
            {lens === "chapters" && (
              <ChaptersLens
                ordered={idx.ordered}
                chapter={chapter}
                setChapter={setChapter}
                totalMembers={totalMembers}
              />
            )}
          </>
        )}
      </Section>
    </>
  );
}

// ─── Lens 1 · Latest joins (social proof) ─────────────────────────────────

function LatestLens({ records }: { records: HolderRecord[] }) {
  const rows = records.slice(0, 50);
  return (
    <>
      <p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Last {rows.length} joins · most recent first
      </p>
      <MemberGrid rows={rows} showJoinedAt />
    </>
  );
}

// ─── Lens 2 · Founders (history) ──────────────────────────────────────────

function FoundersLens({ records }: { records: HolderRecord[] }) {
  const genesisSignal = records.filter((r) => r.founderNumber <= 333);
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-baseline gap-3 mb-3">
          <h3 className="text-lg font-semibold tracking-tight">Chapter I — Genesis Signal</h3>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            #1 – #333 · {genesisSignal.length} / 333
          </span>
        </div>
        {genesisSignal.length === 0 ? (
          <EmptyState
            variant="compact"
            status="PENDING"
            title="Awaiting Genesis Signal"
            description="Founder #1 will be permanently recorded here once they join. Chapter I seals at Member #333."
          />
        ) : (
          <MemberGrid rows={genesisSignal} emphasis />
        )}
      </div>
    </div>
  );
}

// ─── Lens 3 · Chapters (belonging) ────────────────────────────────────────

function ChaptersLens({
  ordered,
  chapter,
  setChapter,
  totalMembers,
}: {
  ordered: HolderRecord[];
  chapter: HolderChapter;
  setChapter: (c: HolderChapter) => void;
  totalMembers: number;
}) {
  const counts = useMemo(() => {
    const c: Record<HolderChapter, number> = {
      "genesis-signal": 0, "first-thousand": 0, "the-expansion": 0, "first-ten-thousand": 0, "open-era": 0,
    };
    for (const r of ordered) c[r.chapter] += 1;
    return c;
  }, [ordered]);

  const rows = useMemo(
    () => ordered.filter((r) => r.chapter === chapter),
    [ordered, chapter],
  );

  const meta = CHAPTERS.find((c) => c.key === chapter)!;
  const filled = Math.min(counts[chapter], meta.target);
  const sealed = meta.target !== Infinity && counts[chapter] >= meta.target;
  const pct = meta.target === Infinity
    ? 100
    : Math.min(100, (filled / meta.target) * 100);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-5">
        {CHAPTERS.map((c) => {
          const active = c.key === chapter;
          const cnt = counts[c.key];
          const isSealed = c.target !== Infinity && cnt >= c.target;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setChapter(c.key)}
              className={`mono text-[10px] uppercase tracking-[0.18em] px-3 py-2 rounded border transition-colors ${
                active
                  ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/5"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
              <span className="ml-2 opacity-70">
                {cnt}{c.target === Infinity ? "" : `/${c.target}`}
              </span>
              {isSealed && <span className="ml-1.5 text-[var(--gold)]">●</span>}
            </button>
          );
        })}
      </div>

      <GlassCard className="p-5 mb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
          <div>
            <div className="text-lg font-semibold tracking-tight">
              {meta.label}{" "}
              <span className="mono text-xs text-muted-foreground font-normal">
                {meta.range}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {sealed
                ? "Sealed. This chapter is a permanent record."
                : meta.target === Infinity
                  ? "Open chapter — every member from #1,001 onward."
                  : `Forming · ${filled} of ${meta.target} founders joined.`}
            </div>
          </div>
          <StatusPill status={sealed ? "LIVE" : "PARTIAL"} />
        </div>
        {meta.target !== Infinity && (
          <div className="h-1.5 rounded-full overflow-hidden bg-border/30">
            <div
              className="h-full bg-[var(--gold)]/80 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </GlassCard>

      {rows.length === 0 ? (
        <EmptyState
          variant="compact"
          status="PENDING"
          title={`No members in ${meta.label} yet`}
          description={
            chapter === "open-era"
              ? "The Open Era starts at member #10,001."
              : `Member #${meta.startN} will land here first.`
          }
          action={
            <Link
              to="/join"
              className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]"
            >
              Claim founder #{Math.max(meta.startN, totalMembers + 1)} →
            </Link>
          }
        />
      ) : (
        <MemberGrid rows={rows} />
      )}
    </>
  );
}

// ─── Grid + Tile ──────────────────────────────────────────────────────────

function MemberGrid({
  rows,
  showJoinedAt = false,
  emphasis = false,
}: {
  rows: HolderRecord[];
  showJoinedAt?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`grid gap-3 ${
        emphasis
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }`}
    >
      {rows.map((r) => (
        <MemberTile key={r.wallet} record={r} showJoinedAt={showJoinedAt} emphasis={emphasis} />
      ))}
    </div>
  );
}

function MemberTile({
  record,
  showJoinedAt,
  emphasis,
}: {
  record: HolderRecord;
  showJoinedAt?: boolean;
  emphasis?: boolean;
}) {
  const chain = useChainTime();
  const joinedUnix = chain.blockToUnix(record.firstPurchaseBlock);
  const joinedRel = joinedUnix !== undefined ? relativeTime(joinedUnix, chain.tipUnix) : null;

  return (
    <Link
      to="/wallet/$address"
      params={{ address: record.wallet }}
      className={`group block rounded-lg border border-border/60 bg-card/40 hover:border-[var(--gold)]/60 hover:bg-card/70 transition-colors ${
        emphasis ? "p-5" : "p-4"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className={`font-semibold tracking-tight ${emphasis ? "text-2xl" : "text-lg"}`}>
          <span className="text-gradient-gold">#{record.founderNumber}</span>
        </div>
        <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          {CHAPTER_LABEL[record.chapter]}
        </span>
      </div>
      <div className="mt-2 mono text-xs text-foreground/85 group-hover:text-[var(--gold)] transition-colors">
        {fmtAddress(record.wallet)}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span className="mono uppercase tracking-[0.16em]">
          {record.currentRank?.name ?? "—"}
        </span>
        {showJoinedAt && joinedRel && (
          <span className="mono">{joinedRel}</span>
        )}
      </div>
    </Link>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────

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

function LensBtn({
  current,
  value,
  onClick,
  children,
}: {
  current: Lens;
  value: Lens;
  onClick: (v: Lens) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`mono text-[11px] uppercase tracking-[0.18em] px-4 py-2.5 rounded border transition-colors ${
        active
          ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/5"
          : "border-border/60 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function relativeTime(unix: number, nowUnix: number | undefined): string {
  const now = nowUnix ?? Math.floor(Date.now() / 1000);
  const s = Math.max(0, now - unix);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}
