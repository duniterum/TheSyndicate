// /member/$number — human-facing public member profile.
//
// A clean, shareable identity page addressed by founder number (e.g.
// /member/27) instead of a raw 0x address. It is a PROJECTION of the same
// canonical holder index that powers /wallet/$address and the Member Wall —
// no new backend, no fabricated data.
//
// Division of labour (intentional, do not blur):
//   • /member/$number  — the human surface. "Who is Member #27?" Recognition
//                        only: number, chapter, rank, SYN received, the share
//                        card. The thing you send to a person.
//   • /wallet/$address — the verification surface. The full purchase trail,
//                        70/20/10 routing totals, eligibility flags, live
//                        balance. The thing you send to a skeptic.
//
// Every profile links to its wallet page and to Avascan, so "don't trust,
// verify" stays one tap away. Rank is recognition only — never a return,
// reward, or claim.

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { GlassCard, Section, SectionHeader, StatusPill, ProofButton } from "@/components/syndicate/Primitives";
import { EmptyState } from "@/components/syndicate/EmptyState";
import { Breadcrumbs } from "@/components/syndicate/Breadcrumbs";
import { MemberShareBlock } from "@/components/syndicate/MemberShareCard";
import { useHolderIndex, type HolderRecord, type HolderChapter, type HolderIndex } from "@/lib/holder-index";
import { fmtAddress } from "@/lib/sale-hooks";
import { explorerUrlForAddress } from "@/lib/syndicate-config";
import { getChapterByMemberNumber } from "@/lib/chapters";
import { buildReferralShareUrl } from "@/lib/referral-attribution";

const CANONICAL_ORIGIN = "https://thesyndicate.money";

const fmtUsd = (n: number, d = 2) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: d })}`;
const fmtN = (n: number, d = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d });

const CHAPTER_LABEL: Record<HolderChapter, string> = {
  "genesis-signal":     "Genesis Signal (#1 – #333)",
  "first-thousand":     "First Thousand (#334 – #1,000)",
  "the-expansion":      "The Expansion (#1,001 – #3,333)",
  "first-ten-thousand": "First Ten Thousand (#3,334 – #10,000)",
  "open-era":           "Open Era",
};

/** Parse the `$number` param into a positive integer, or null. */
function parseMemberNumber(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

export const Route = createFileRoute("/member/$number")({
  head: ({ params }) => {
    const n = parseMemberNumber(params.number);
    const label = n ? `Member #${n.toLocaleString("en-US")}` : "Member";
    const title = `${label} — The Syndicate`;
    const desc = n
      ? `Member #${n.toLocaleString("en-US")} of The Syndicate — chapter, rank, and SYN received, all derived from on-chain Membership Sale activity. Verifiable on Avalanche.`
      : "A verifiable member of The Syndicate — derived from on-chain Membership Sale activity.";
    const url = n ? `${CANONICAL_ORIGIN}/member/${n}` : `${CANONICAL_ORIGIN}/members`;
    const img = `${CANONICAL_ORIGIN}/og/og-protocol-default.png`;
    const imgAlt = `${label} of The Syndicate — verified on Avalanche C-Chain.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
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
  component: MemberNumberPage,
});

function MemberNumberPage() {
  const { number } = Route.useParams();
  const n = parseMemberNumber(number);

  return (
    <PageShell
      eyebrow="Member"
      title={n ? `Member #${n.toLocaleString("en-US")}` : "Member"}
      description="A public, verifiable member profile — addressed by founder number, derived from on-chain Membership Sale activity."
    >
      <Breadcrumbs />
      {n === null ? (
        <Section id="member-invalid">
          <EmptyState
            status="PENDING"
            title="Not a valid member number"
            description="Member profiles are addressed by founder number, e.g. /member/27. Search the wall by number or wallet to find a member."
            action={
              <Link to="/members" className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
                Browse the Member Wall →
              </Link>
            }
          />
        </Section>
      ) : (
        <MemberNumberBody n={n} />
      )}
    </PageShell>
  );
}

function MemberNumberBody({ n }: { n: number }) {
  const idx = useHolderIndex();
  const record = idx.ordered.find((r) => r.founderNumber === n);

  if (record) return <MemberProfile record={record} idx={idx} n={n} />;

  // Still reading the chain — hold judgement.
  if (idx.isLoading) {
    return (
      <Section id="member-loading">
        <SectionHeader
          eyebrow="Member"
          title={<>Member <span className="text-gradient-gold">#{n.toLocaleString("en-US")}</span></>}
          description="Resolving this seat from on-chain activity…"
        />
        <EmptyState
          variant="compact"
          status="PARTIAL"
          title="Scanning Avalanche RPC"
          description="Reading every Membership Sale purchase to resolve this member number."
        />
      </Section>
    );
  }

  // Index couldn't be read.
  if (idx.isError) {
    return (
      <Section id="member-error">
        <EmptyState
          status="PENDING"
          title="Couldn't reach the chain"
          description="The member index could not be read from Avalanche just now. This is a read error, not a missing member — try again in a moment."
          action={
            <Link to="/members" className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
              Browse the Member Wall →
            </Link>
          }
        />
      </Section>
    );
  }

  // Index read cleanly, but no member holds this number yet.
  const totalMembers = idx.totals.members;
  const beyondWall = totalMembers > 0 && n > totalMembers;
  const nextNumber = idx.totals.nextMemberNumber;

  return (
    <Section id="member-not-yet">
      <SectionHeader
        eyebrow="Member"
        title={<>Seat <span className="text-gradient-gold">#{n.toLocaleString("en-US")}</span></>}
        description={
          beyondWall
            ? `This seat hasn't been taken yet. The wall holds ${totalMembers.toLocaleString("en-US")} member${totalMembers === 1 ? "" : "s"} so far.`
            : "The wall is waiting for its first member."
        }
      />
      <EmptyState
        status="PENDING"
        title={beyondWall ? `Member #${n.toLocaleString("en-US")} hasn't joined yet` : "The wall is waiting for Member #1"}
        description={
          beyondWall
            ? "Founder numbers are assigned in first-purchase order and never change. This number is reserved for whoever reaches it — it is never pre-sold or fabricated."
            : "When the first person joins, they become Member #1 — permanently. No placeholders, no fake names. Ever."
        }
        action={
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/join" className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
              Become founder #{nextNumber.toLocaleString("en-US")} →
            </Link>
            <Link to="/members" className="mono text-[11px] uppercase tracking-[0.18em]">
              Browse the wall →
            </Link>
          </div>
        }
      />
    </Section>
  );
}

// ─── The profile ──────────────────────────────────────────────────────────

function MemberProfile({ record, idx, n }: { record: HolderRecord; idx: HolderIndex; n: number }) {
  const explorer = explorerUrlForAddress(record.wallet);
  const chapterLabel = getChapterByMemberNumber(record.memberNumber).shortLabel;
  const rankName = record.currentRank?.name ?? "Member";

  // Prefer the human /member/N URL for the card AND the share link.
  const memberUrl = `${CANONICAL_ORIGIN}/member/${record.founderNumber}`;
  const shareUrl = buildReferralShareUrl(memberUrl, record.founderNumber);
  const identitySentence = `Member #${record.founderNumber} of The Syndicate · ${chapterLabel} · ${rankName} · ${fmtN(Math.round(record.cumulativeSyn))} SYN received. Verified on-chain.`;

  // Seats around this one (by founder number) — context, not competition.
  const pos = idx.ordered.findIndex((r) => r.founderNumber === record.founderNumber);
  const prev = pos > 0 ? idx.ordered[pos - 1] : undefined;
  const next = pos >= 0 && pos + 1 < idx.ordered.length ? idx.ordered[pos + 1] : undefined;

  return (
    <>
      <Section id="member-header">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <StatusPill status="LIVE" />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Member · indexed from TokensPurchased
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Member <span className="text-gradient-gold">#{record.founderNumber.toLocaleString("en-US")}</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-foreground/85 leading-relaxed">
            {CHAPTER_LABEL[record.chapter]} · {rankName}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {explorer ? (
              <a href={explorer} target="_blank" rel="noopener noreferrer" className="mono hover:text-[var(--gold)]">
                {fmtAddress(record.wallet)} ↗
              </a>
            ) : (
              <span className="mono">{fmtAddress(record.wallet)}</span>
            )}
            <span className="text-muted-foreground/60"> · verified on Avalanche C-Chain</span>
          </p>
        </GlassCard>

        <div className="mt-4">
          <MemberShareBlock
            variant="visible"
            filename={`syndicate-member-${record.founderNumber}.png`}
            memberNumber={record.founderNumber}
            chapterLabel={chapterLabel}
            rankName={rankName}
            wallet={record.wallet}
            synReceived={record.cumulativeSyn}
            cardUrl={memberUrl}
            shareUrl={shareUrl}
            shareText={identitySentence}
            hint="Share this member card"
          />
        </div>
      </Section>

      <Section id="member-stats">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Founder #" value={`#${record.founderNumber.toLocaleString("en-US")}`} />
          <Stat label="Rank" value={rankName} hint="Recognition only" />
          <Stat label="Chapter" value={chapterLabel} />
          <Stat label="SYN received" value={fmtN(Math.round(record.cumulativeSyn))} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Rank is recognition only — derived from cumulative USDC, it confers no
          rights, returns, or discounts. The full purchase trail and 70/20/10
          routing totals live on the wallet page.
        </p>
      </Section>

      <SeatsAround prev={prev} current={record} next={next} />

      <Section id="member-verify">
        <SectionHeader
          eyebrow="Don't trust · verify"
          title={<>Verify this <span className="text-gradient-gold">member</span></>}
          description="Every claim on this page is a projection of on-chain Membership Sale activity. Open the wallet page for the full purchase trail and routing totals, or read it straight from the explorer."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            to="/wallet/$address"
            params={{ address: record.wallet }}
            className="mono text-[11px] uppercase tracking-[0.18em] px-3 py-2 rounded border border-[var(--gold)]/60 text-[var(--gold)] hover:bg-[var(--gold)]/10"
          >
            Full wallet record →
          </Link>
          <Link to="/members" className="mono text-[11px] uppercase tracking-[0.18em] px-3 py-2 rounded border border-border/60 text-muted-foreground hover:text-foreground">
            Member Wall →
          </Link>
          {explorer ? <ProofButton href={explorer}>Avascan ↗</ProofButton> : null}
        </div>
      </Section>
    </>
  );
}

// ─── Seats around (neighbours by founder number) ───────────────────────────

function SeatsAround({
  prev,
  current,
  next,
}: {
  prev?: HolderRecord;
  current: HolderRecord;
  next?: HolderRecord;
}) {
  if (!prev && !next) return null;
  return (
    <Section id="member-neighbours">
      <SectionHeader
        eyebrow="Chapter context"
        title={<>Seats <span className="text-gradient-gold">around you</span></>}
        description="Where this member sits in the archive — for context, not competition. Founder numbers are assigned by first-purchase order and never change."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <NeighbourCell label="← Previous" record={prev} />
        <CurrentCell record={current} />
        <NeighbourCell label="Next →" record={next} align="right" />
      </div>
    </Section>
  );
}

function NeighbourCell({
  label,
  record,
  align = "left",
}: {
  label: string;
  record?: HolderRecord;
  align?: "left" | "right";
}) {
  if (!record) {
    return (
      <GlassCard className={`p-4 ${align === "right" ? "text-right" : ""}`}>
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-2 text-xs text-muted-foreground">No adjacent member yet</div>
      </GlassCard>
    );
  }
  return (
    <Link
      to="/member/$number"
      params={{ number: String(record.founderNumber) }}
      className="block"
    >
      <GlassCard className={`p-4 hover:border-[var(--gold)]/40 transition-colors ${align === "right" ? "text-right" : ""}`}>
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-lg font-semibold">Member #{record.founderNumber.toLocaleString("en-US")}</div>
        <div className="mono text-[11px] text-muted-foreground mt-1">{fmtAddress(record.wallet)}</div>
      </GlassCard>
    </Link>
  );
}

function CurrentCell({ record }: { record: HolderRecord }) {
  return (
    <GlassCard className="p-4 border-[var(--gold)]/40 text-center">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">You are here</div>
      <div className="mt-1 text-lg font-semibold">Member #{record.founderNumber.toLocaleString("en-US")}</div>
      <div className="mono text-[11px] text-muted-foreground mt-1">{fmtAddress(record.wallet)}</div>
    </GlassCard>
  );
}

// ─── Bits ──────────────────────────────────────────────────────────────────

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <GlassCard className="p-4">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div> : null}
    </GlassCard>
  );
}
