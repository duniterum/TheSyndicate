// /chapters/$slug — per-chapter archive page.
//
// Pure derivation of useHolderIndex. Pagination from day one (50/page) via
// URL search params so deep links are shareable. No wealth leaderboard. No
// scarcity language. Recognition is historical; entries do not imply
// rewards or claims. See docs/CHAPTER_ARCHIVES_SPEC.md.

import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/syndicate/PageShell";
import { Section, SectionHeader, StatusPill, GlassCard } from "@/components/syndicate/Primitives";
import { EmptyState } from "@/components/syndicate/EmptyState";
import { Breadcrumbs } from "@/components/syndicate/Breadcrumbs";
import { useHolderIndex, type HolderRecord, type HolderChapter } from "@/lib/holder-index";
import { useChainTime } from "@/lib/chain-time";
import { fmtAddress } from "@/lib/sale-hooks";
import { txExplorerUrl } from "@/lib/syndicate-config";
import { CHAPTERS, activeChapter } from "./chapters";

const CANONICAL_ORIGIN = "https://thesyndicate.money";
const PAGE_SIZE = 50;

const VALID_SLUGS = new Set([
  "genesis-signal",
  "first-thousand",
  "the-expansion",
  "first-ten-thousand",
  "open-era",
  "current",
]);

function resolveSlug(slug: string, memberCount: number) {
  if (slug === "current") return activeChapter(memberCount);
  return CHAPTERS.find((c) => c.slug === slug);
}

export const Route = createFileRoute("/chapters/$slug")({
  validateSearch: (search) => ({
    page: Math.max(1, Number((search as Record<string, unknown>).page) || 1),
  }),
  beforeLoad: ({ params }) => {
    if (!VALID_SLUGS.has(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const meta =
      params.slug === "current"
        ? activeChapter(0)
        : CHAPTERS.find((c) => c.slug === params.slug) ?? CHAPTERS[0];
    const title = `${meta.label} — Chapter · The Syndicate`;
    const desc = `${meta.label} (${meta.range}) records who joined The Syndicate during this period of formation. ${meta.blurb} Verifiable on Avalanche.`;
    const url = `${CANONICAL_ORIGIN}/chapters/${params.slug}`;
    const img = `${CANONICAL_ORIGIN}/og/og-protocol-default.png`;
    const imgAlt = `The Syndicate — ${meta.label} chapter. Historical participation, verifiable on Avalanche.`;
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
  notFoundComponent: () => (
    <PageShell eyebrow="Chapters" title="Chapter not found" description="No chapter exists at this URL.">
      <Section>
        <EmptyState
          status="PENDING"
          title="Unknown chapter"
          description="Try Genesis Signal, First Thousand, The Expansion, First Ten Thousand, or Open Era."
          action={
            <Link to="/chapters" className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
              Back to Chapters →
            </Link>
          }
        />
      </Section>
    </PageShell>
  ),
  errorComponent: ({ error }) => (
    <PageShell eyebrow="Chapters" title="Something went wrong" description="The chapter page failed to load.">
      <Section>
        <EmptyState status="PENDING" title="Chapter unavailable" description={error.message} />
      </Section>
    </PageShell>
  ),
  component: ChapterPage,
});

function ChapterPage() {
  const { slug } = Route.useParams();
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const idx = useHolderIndex();
  const chain = useChainTime();

  const meta = resolveSlug(slug, idx.totals.members) ?? CHAPTERS[0];

  const status: "LIVE" | "PARTIAL" | "PENDING" = idx.isError
    ? "PENDING"
    : !idx.hasData
      ? idx.isLoading ? "PARTIAL" : "PENDING"
      : "LIVE";

  const all = useMemo(
    () => idx.ordered.filter((r) => r.chapter === meta.key),
    [idx.ordered, meta.key],
  );

  const totalMembers = idx.totals.members;
  const filled = all.length;
  const target = meta.endN === null ? null : meta.endN - meta.startN + 1;
  const sealed = meta.endN !== null && totalMembers >= meta.endN;
  const pct =
    target === null ? 100 : Math.min(100, Math.max(0, (filled / target) * 100));
  const pageCount = Math.max(1, Math.ceil(filled / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const rows = useMemo(
    () => all.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [all, safePage],
  );

  const earliestUnix = filled > 0 ? chain.blockToUnix(all[0].firstPurchaseBlock) : undefined;
  const latestUnix =
    filled > 0
      ? chain.blockToUnix(all[all.length - 1].firstPurchaseBlock)
      : undefined;

  return (
    <PageShell
      eyebrow={`Chapter · ${meta.label}`}
      title={`${meta.label} · ${meta.range}`}
      description={meta.blurb}
    >
      <Breadcrumbs />

      <Section id="chapter-header">
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
            <Stat label="Members in chapter" value={filled.toLocaleString("en-US")} />
            <Stat
              label="Chapter status"
              value={
                sealed
                  ? "Sealed"
                  : meta.endN !== null && totalMembers < meta.startN
                    ? "Not started"
                    : meta.endN === null
                      ? "Open"
                      : "Forming"
              }
            />
            <Stat
              label="Started"
              value={
                earliestUnix !== undefined
                  ? new Date(earliestUnix * 1000).toISOString().slice(0, 10)
                  : "—"
              }
            />
            <Stat
              label={sealed ? "Closed" : "Latest join"}
              value={
                latestUnix !== undefined
                  ? new Date(latestUnix * 1000).toISOString().slice(0, 10)
                  : "—"
              }
            />
          </div>

          {meta.endN !== null && (
            <div className="mt-4">
              <div className="flex items-center justify-between mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                <span>Progress</span>
                <span>
                  {Math.min(filled, target ?? 0)} / {target}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-border/30">
                <div
                  className="h-full bg-[var(--gold)]/80 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </GlassCard>
      </Section>

      <Section id="chapter-members">
        <SectionHeader
          eyebrow="Members"
          title={<>Who joined during <span className="text-gradient-gold">{meta.label}</span></>}
          description="Archive-ordered by founder number. Click any tile for the full wallet history."
        />

        {filled === 0 ? (
          <EmptyState
            status="PENDING"
            title={
              meta.endN !== null && totalMembers < meta.startN
                ? `${meta.label} opens at founder #${meta.startN}`
                : `No members in ${meta.label} yet`
            }
            description={
              meta.endN !== null && totalMembers < meta.startN
                ? `The protocol is currently at member #${totalMembers}. This chapter activates once founder #${meta.startN} joins.`
                : "Once the first qualifying wallet joins, it will be permanently recorded here."
            }
            action={
              <Link
                to="/join"
                className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]"
              >
                Become founder #{idx.totals.nextMemberNumber} →
              </Link>
            }
          />
        ) : (
          <>
            <ChapterGrid rows={rows} />
            {pageCount > 1 && (
              <Pagination
                page={safePage}
                pageCount={pageCount}
                onChange={(p) =>
                  navigate({ search: () => ({ page: p }), replace: false })
                }
              />
            )}
          </>
        )}
      </Section>

      <Section id="chapter-verification">
        <GlassCard className="p-5 text-sm text-muted-foreground leading-relaxed">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground mb-2">
            How to verify this chapter
          </div>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Every member tile is a real wallet that emitted a <span className="mono">TokensPurchased</span> event on the Membership Sale contract.</li>
            <li>Click any tile to open the wallet page with the full purchase history.</li>
            <li>Click <span className="mono">Verify on Avascan</span> to inspect the first-purchase transaction on Avalanche.</li>
            <li>Chapter assignment is derived from founder number, not stored. The same wallet always lands in the same chapter.</li>
          </ul>
        </GlassCard>
      </Section>

      <Section id="chapter-disclosure">
        <GlassCard className="p-4 text-xs text-muted-foreground leading-relaxed">
          Chapter membership records when a wallet joined the protocol. It
          does not imply ownership rights, treasury claims, guaranteed
          rewards, or future benefits.
        </GlassCard>
      </Section>
    </PageShell>
  );
}

// ─── Grid + Tile ──────────────────────────────────────────────────────────

function ChapterGrid({ rows }: { rows: HolderRecord[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {rows.map((r) => (
        <ChapterTile key={r.wallet} record={r} />
      ))}
    </div>
  );
}

const CHAPTER_LABEL: Record<HolderChapter, string> = {
  "genesis-signal":     "Genesis Signal",
  "first-thousand":     "First Thousand",
  "the-expansion":      "The Expansion",
  "first-ten-thousand": "First Ten Thousand",
  "open-era":           "Open Era",
};

function ChapterTile({ record }: { record: HolderRecord }) {
  const chain = useChainTime();
  const joinedUnix = chain.blockToUnix(record.firstPurchaseBlock);
  const joinedAbs =
    joinedUnix !== undefined
      ? new Date(joinedUnix * 1000).toISOString().slice(0, 10)
      : null;

  return (
    <div className="group rounded-lg border border-border/60 bg-card/40 hover:border-[var(--gold)]/60 hover:bg-card/70 transition-colors p-4">
      <Link
        to="/wallet/$address"
        params={{ address: record.wallet }}
        className="block"
      >
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-lg font-semibold tracking-tight">
            <span className="text-gradient-gold">#{record.founderNumber}</span>
          </div>
          <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            {CHAPTER_LABEL[record.chapter]}
          </span>
        </div>
        <div className="mt-2 mono text-xs text-foreground/85 group-hover:text-[var(--gold)] transition-colors">
          {fmtAddress(record.wallet)}
        </div>
        <div className="mt-3 text-[10px] text-muted-foreground space-y-0.5">
          {joinedAbs && <div className="mono">Joined {joinedAbs}</div>}
          <div className="mono">Block {record.firstPurchaseBlock.toString()}</div>
        </div>
      </Link>
      <a
        href={txExplorerUrl(record.firstPurchaseTx)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-[var(--gold)] transition-colors"
      >
        Verify on Avascan <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  const prev = Math.max(1, page - 1);
  const next = Math.min(pageCount, page + 1);
  return (
    <div className="mt-6 flex items-center justify-between gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(prev)}
        className="mono text-[10px] uppercase tracking-[0.18em] px-3 py-2 rounded border border-border/60 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Previous
      </button>
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Page {page} / {pageCount}
      </div>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onChange(next)}
        className="mono text-[10px] uppercase tracking-[0.18em] px-3 py-2 rounded border border-border/60 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
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
