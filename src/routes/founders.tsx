// /founders — Founders Hall.
//
// Simple question: "Who was here first?"
// Simple answer: the founding cohort of The Syndicate — Chapter I (Genesis
// Signal · Members #1 – #333) — archive-ordered, with their first-purchase
// block + tx.
//
// Recognition only. A founder number is a historical coordinate, not a
// privilege package. No perks. No promises. No "VIP". No leaderboard.
// No USDC. No SYN balance. No sort-by-contribution. Ever.
//
// Pure derivation of useHolderIndex.ordered. See
// docs/FOUNDERS_HALL_SPEC.md and src/lib/chapters.ts.

import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { Section, SectionHeader, StatusPill, GlassCard } from "@/components/syndicate/Primitives";
import { EmptyState } from "@/components/syndicate/EmptyState";
import { Breadcrumbs } from "@/components/syndicate/Breadcrumbs";
import { useHolderIndex, type HolderRecord } from "@/lib/holder-index";
import { useChainTime } from "@/lib/chain-time";
import { fmtAddress } from "@/lib/sale-hooks";
import { txExplorerUrl } from "@/lib/syndicate-config";
import { getChapterById } from "@/lib/chapters";

const CANONICAL_ORIGIN = "https://thesyndicate.money";
const GENESIS_SIGNAL = getChapterById("genesis-signal");
const GENESIS_CAP = GENESIS_SIGNAL.capacity ?? 333;

export const Route = createFileRoute("/founders")({
  head: () => {
    const title = "Founders — The Syndicate";
    const desc =
      "Chapter I — Genesis Signal. The founding cohort of The Syndicate (Members #1 – #333). Archive-ordered, verifiable on Avalanche. A founder number is a historical coordinate — recognition, not privilege.";
    const url = `${CANONICAL_ORIGIN}/founders`;
    const img = `${CANONICAL_ORIGIN}/og/og-protocol-default.png`;
    const imgAlt = "The Syndicate — Founders Hall. Chapter I, Genesis Signal · Members #1 – #333.";
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
  component: FoundersPage,
});

function FoundersPage() {
  return (
    <PageShell
      eyebrow="Founders"
      title="Who was here first"
      description="Chapter I — Genesis Signal. The founding cohort of The Syndicate (Members #1 – #333). Every entry is real, dated, and verifiable on Avalanche. A founder number is a historical coordinate — nothing more."
    >
      <Breadcrumbs />
      <FoundersBody />
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  );
}

function FoundersBody() {
  const idx = useHolderIndex();
  const total = idx.totals.members;
  const nextNumber = idx.totals.nextMemberNumber;

  const genesisSignal = idx.ordered.filter((r) => r.founderNumber <= GENESIS_CAP);

  const status: "LIVE" | "PARTIAL" | "PENDING" = idx.isError
    ? "PENDING"
    : !idx.hasData
      ? idx.isLoading ? "PARTIAL" : "PENDING"
      : "LIVE";

  return (
    <>
      <Section id="founders-header">
        <GlassCard className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={status} />
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
            <Stat label="Members so far" value={total.toLocaleString("en-US")} />
            <Stat
              label="Genesis Signal filled"
              value={`${Math.min(GENESIS_CAP, total).toLocaleString("en-US")} / ${GENESIS_CAP.toLocaleString("en-US")}`}
            />
            <Stat
              label="Seats remaining"
              value={Math.max(0, GENESIS_CAP - total).toLocaleString("en-US")}
            />
            <Stat label="Next founder #" value={`#${nextNumber.toLocaleString("en-US")}`} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Founders Hall is a record, not a club. There are no founder-only
            rewards, no founder-only access, no founder-only promises. Every
            tile links to the member's full wallet history and to the
            on-chain transaction that minted their founder number.
          </p>
        </GlassCard>
      </Section>

      <Section id="founders-genesis-signal">
        <SectionHeader
          eyebrow={`${GENESIS_SIGNAL.label} · ${GENESIS_SIGNAL.range}`}
          title={<>The <span className="text-gradient-gold">founding cohort</span></>}
          description="The first three hundred and thirty-three wallets to join The Syndicate through the Membership Sale. Once sealed, this chapter is permanent. Earlier doesn't mean better — it means earlier."
        />
        {genesisSignal.length === 0 ? (
          <EmptyState
            status="PENDING"
            title="Awaiting Genesis Signal"
            description="Founder #1 will be permanently recorded here once they join. No placeholders. No fake names."
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
          <FoundersGrid rows={genesisSignal} />
        )}
      </Section>

      <Section id="founders-cta">
        <GlassCard className="p-5 md:p-6 text-center">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Open the archive
          </div>
          <h3 className="mt-2 text-xl md:text-2xl font-semibold tracking-tight">
            Next founder number is{" "}
            <span className="text-gradient-gold">#{nextNumber.toLocaleString("en-US")}</span>
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Joining now writes your wallet into the archive at #{nextNumber}.
            That coordinate is permanent and verifiable. It does not promise
            anything beyond being a record that you were here.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/join"
              className="mono inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-[oklch(0.22_0.025_260)]"
              style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }}
            >
              Become founder #{nextNumber}
            </Link>
            <Link
              to="/members"
              className="mono inline-flex items-center gap-2 rounded-md border border-border/60 px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-foreground hover:border-[var(--gold)]/60 hover:text-[var(--gold)] transition-colors"
            >
              See all members
            </Link>
          </div>
        </GlassCard>
      </Section>
    </>
  );
}

// ─── Founders grid · Genesis Signal cohort ───────────────────────────────

function FoundersGrid({ rows }: { rows: HolderRecord[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {rows.map((r) => (
        <FounderTile key={r.wallet} record={r} />
      ))}
    </div>
  );
}

// ─── Tile · founder number, address, joined date, verify tx ──────────────

function FounderTile({ record }: { record: HolderRecord }) {
  const chain = useChainTime();
  const joinedUnix = chain.blockToUnix(record.firstPurchaseBlock);
  const joinedRel = joinedUnix !== undefined ? relativeTime(joinedUnix, chain.tipUnix) : null;
  const joinedAbs = joinedUnix !== undefined
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
          <div className="font-semibold tracking-tight text-lg">
            <span className="text-gradient-gold">#{record.founderNumber}</span>
          </div>
          <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            Genesis Signal
          </span>
        </div>
        <div className="mt-2 mono text-xs text-foreground/85 group-hover:text-[var(--gold)] transition-colors">
          {fmtAddress(record.wallet)}
        </div>
        <div className="mt-3 text-[10px] text-muted-foreground space-y-0.5">
          {joinedRel && joinedAbs && (
            <div className="mono">
              Joined <span title={joinedAbs}>{joinedRel}</span>
              <span className="opacity-60"> · {joinedAbs}</span>
            </div>
          )}
          <div className="mono">
            Block {record.firstPurchaseBlock.toString()}
          </div>
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

// ─── Small helpers ───────────────────────────────────────────────────────

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
