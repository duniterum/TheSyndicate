// CockpitProgression — Wave C4 "Progression / Story Loop" surface.
//
// Answers, as one coherent story, the questions the rest of the cockpit did not
// yet cover:
//
//   • Your chapter       — the permanent historical coordinate your member
//                          number falls in (#1–#333 = Genesis Signal, …).
//   • Protocol progress  — how close the CURRENTLY ACTIVE chapter is to sealing,
//                          i.e. the next real member-number threshold
//                          (#333 / #1,000 / #3,333 / #10,000), derived from the
//                          indexed member count.
//   • Why early matters   — story / identity ONLY: earlier is earlier, never
//                          financially better.
//
// Truth doctrine (binding):
//   • Every value is an indexed on-chain read or a PURE derivation from
//     chapters.ts. No new thresholds, no new chapter/rank names.
//   • Uncapped Open Era NEVER renders a seat progress bar.
//   • While the member count is still loading we show a read-pending note — we
//     never paint a 0% bar as if it were truth.
//   • No timers, no dates, no fabricated scarcity, no rewards / financial /
//     priority language. Rank progression is intentionally NOT duplicated here;
//     it lives in the seat header.

import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import {
  GlassCard,
  Pill,
  StatusPill,
  ProgressBar,
} from "@/components/syndicate/Primitives";
import { CockpitSection, useCockpitEmbed } from "./cockpit-shell";
import { useHolderIndex, type HolderRecord } from "@/lib/holder-index";
import {
  CHAPTERS,
  getActiveChapter,
  getChapterByMemberNumber,
  getChapterProgress,
  getRemainingSeats,
  type Chapter,
} from "@/lib/chapters";

const fmtInt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

// The chapter that opens after `c`. CHAPTERS index is 1-based, so the 0-based
// slot at position `c.index` is the next chapter (undefined for Open Era).
function nextChapterAfter(c: Chapter): Chapter | undefined {
  return CHAPTERS[c.index];
}

// ─────────────────────────────────────────────────────────────────────────
export function CockpitProgression() {
  const embedded = useCockpitEmbed();
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;

  const members = idx.totals.members;
  const status: "LIVE" | "PARTIAL" | "PENDING" = idx.isLoading
    ? "PARTIAL"
    : idx.hasData
      ? "LIVE"
      : "PENDING";

  return (
    <CockpitSection id="my-progression" className={embedded ? "" : "py-4"}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusPill status={status} />
        <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
          Your Place in the Story
        </h2>
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          · chapter · progression · why early numbers matter
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <YourChapterCard
          record={record}
          isConnected={isConnected}
          nextMemberNumber={idx.totals.nextMemberNumber}
          memberCount={members}
        />
        <ProtocolProgressCard memberCount={members} hasData={idx.hasData} />
      </div>
    </CockpitSection>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// YourChapterCard — the member's permanent historical coordinate + the
// "why early matters" story line. For visitors / non-members it previews the
// chapter the next seat would land in, with no personal claims.
// ─────────────────────────────────────────────────────────────────────────
function YourChapterCard({
  record,
  isConnected,
  nextMemberNumber,
  memberCount,
}: {
  record?: HolderRecord;
  isConnected: boolean;
  nextMemberNumber: number;
  memberCount: number;
}) {
  const isMember = Boolean(record);
  const chapter = record
    ? getChapterByMemberNumber(record.memberNumber)
    : getChapterByMemberNumber(nextMemberNumber);

  // Position within a capped chapter — pure derivation from the member number.
  const positionInChapter =
    record && chapter.capacity !== null
      ? record.memberNumber - chapter.startN + 1
      : undefined;

  // A chapter is sealed once every seat inside it has been taken.
  const sealed = chapter.endN !== null && memberCount >= chapter.endN;

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {isMember ? "Your chapter" : "Where the next seat lands"}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-serif text-2xl md:text-3xl leading-none text-gradient-gold">
          {chapter.label}
        </span>
        <Pill tone="muted">{chapter.range}</Pill>
        {chapter.endN !== null &&
          (sealed ? (
            <Pill tone="navy">Sealed</Pill>
          ) : (
            <Pill tone="gold">Filling now</Pill>
          ))}
      </div>

      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {chapter.blurb}
      </p>

      {isMember && positionInChapter !== undefined ? (
        <div className="mt-3 mono text-[11px] uppercase tracking-[0.16em] text-foreground">
          You hold seat {fmtInt(positionInChapter)} of{" "}
          {fmtInt(chapter.capacity as number)} in this chapter
        </div>
      ) : isMember ? (
        <div className="mt-3 mono text-[11px] uppercase tracking-[0.16em] text-foreground">
          Member #{fmtInt((record as HolderRecord).memberNumber)} · open-ended era
        </div>
      ) : !isConnected ? (
        <div className="mt-3 text-xs text-muted-foreground">
          Connect your wallet to see your own chapter and member number.
        </div>
      ) : (
        <div className="mt-3 text-xs text-muted-foreground">
          No member number for this wallet yet — the next seat (#
          {fmtInt(nextMemberNumber)}) would join {chapter.shortLabel}.
        </div>
      )}

      <p className="mt-4 border-t border-border/40 pt-3 text-[11px] text-muted-foreground leading-relaxed">
        Earlier is earlier — not better. Your member number is a permanent
        historical coordinate: identity and story only. It grants no financial
        return, no revenue share, and no priority — only the moment in history
        changes.
      </p>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ProtocolProgressCard — how far the CURRENTLY ACTIVE chapter is from sealing,
// i.e. the next real member-number threshold. Uncapped Open Era shows no bar;
// an unread member count shows a pending note, never a 0% bar.
// ─────────────────────────────────────────────────────────────────────────
function ProtocolProgressCard({
  memberCount,
  hasData,
}: {
  memberCount: number;
  hasData: boolean;
}) {
  const active = getActiveChapter(memberCount);
  const prog = getChapterProgress(memberCount);
  const next = nextChapterAfter(active);
  const uncapped = active.endN === null || active.capacity === null;
  const remaining = getRemainingSeats(memberCount);

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Where the protocol is now
        </div>
        <Link
          to="/chapters"
          className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
        >
          All chapters →
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-serif text-xl md:text-2xl leading-none text-foreground">
          {active.label}
        </span>
        {hasData ? (
          <Pill tone="gold">Active</Pill>
        ) : (
          <Pill tone="muted">Reading…</Pill>
        )}
      </div>

      {!hasData ? (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed" role="status">
          Reading the live member count from Avalanche… chapter progress appears
          once the first purchase events are indexed.
        </p>
      ) : uncapped ? (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Open-ended era — no seat cap. Membership stays open to every qualifying
          wallet; there is no further chapter threshold to reach.
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-baseline justify-between gap-2 mb-1.5">
            <span className="mono text-[11px] text-foreground tabular-nums">
              {fmtInt(prog.filled)} / {fmtInt(prog.target as number)} seats
            </span>
            <span className="mono text-[11px] text-muted-foreground tabular-nums">
              {prog.pct.toFixed(prog.pct < 10 ? 1 : 0)}%
            </span>
          </div>
          <ProgressBar value={prog.pct} max={100} tone="gold" />
          <div className="mono text-[11px] text-muted-foreground mt-2 leading-relaxed">
            {fmtInt(Math.max(0, remaining))} seats until{" "}
            {next ? next.shortLabel : "the next chapter"} opens at #
            {fmtInt(next ? next.startN : (active.endN as number) + 1)}.
          </div>
        </>
      )}

      <p className="mt-4 border-t border-border/40 pt-3 text-[11px] text-muted-foreground leading-relaxed">
        Chapters seal in order at fixed member numbers — #333, #1,000, #3,333,
        #10,000. Each is a historical marker, not a finish line: there is no
        timer, and filling one sooner grants nothing extra.
      </p>
    </GlassCard>
  );
}
