// "Milestone Approaching" tile.
//
// Derives the single closest canonical milestone the protocol is approaching
// from already-LIVE inputs (members + USDC routed + first-mint flags) via
// evaluateMilestones() + splitReached(). No countdowns, no projected dates,
// no invented thresholds — pure distance to a real on-chain threshold.
//
// If no upcoming milestone can be evaluated (data PENDING), the tile renders
// a PENDING placeholder. If every canonical milestone has sealed, it renders
// a "caught up" state pointing to the next protocol step.

import { useMemo } from "react";
import { useProtocolTruth } from "@/lib/protocol-truth";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { useProtocolEvents } from "@/lib/protocol-events";
import {
  evaluateMilestones,
  splitReached,
  isBinaryMilestone,
  type MilestoneStatus,
} from "@/lib/activity-milestones";
import { GlassCard, Section, StatusPill } from "./Primitives";
import { ProofChip } from "./ProofChip";
import { VerifiedUpToBadge } from "./VerifiedUpToBadge";

const fmtInt = (n: number | undefined) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 0 });

function pickApproaching(upcoming: MilestoneStatus[]): MilestoneStatus | undefined {
  // Closest = highest progress, ignoring binary first-mint milestones
  // (distance to a one-shot mint event is meaningless) and ones whose
  // `current` is unknown.
  return upcoming.filter(
    (s) => !isBinaryMilestone(s.milestone) && s.current !== undefined,
  )[0];
}

export function MilestoneApproachingTile() {
  const truth = useProtocolTruth();
  const pulse = useProtocolPulse();
  const { events } = useProtocolEvents({ limit: 200 });

  const mintFlags = useMemo(
    () => ({
      firstSignal: events.some((e) => e.kind === "nft-mint-first-signal"),
      patronSeal: events.some((e) => e.kind === "nft-mint-patron-seal"),
    }),
    [events],
  );

  const { upcoming } = useMemo(
    () =>
      splitReached(
        evaluateMilestones({
          buyers: pulse.buyers,
          usdcRaised: pulse.usdcRaised,
          firstSignalMinted: mintFlags.firstSignal,
          patronSealMinted: mintFlags.patronSeal,
        }),
      ),
    [pulse.buyers, pulse.usdcRaised, mintFlags.firstSignal, mintFlags.patronSeal],
  );

  const next = pickApproaching(upcoming);

  // Proof href: tie the milestone to the contract whose state confirms it.
  const verifyHref =
    next?.milestone.kind === "usdc"
      ? truth.usdcRaised.verifyHref
      : next?.milestone.kind === "members"
        ? truth.members.verifyHref
        : null;

  const pct = next ? Math.round(next.progress * 100) : 0;
  const dataKnown = next !== undefined;

  return (
    <Section id="milestone-approaching" className="py-6 md:py-8">
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
              Milestone approaching
            </span>
            <StatusPill status={dataKnown ? "LIVE" : "PENDING"} />
          </div>
          <div className="flex items-center gap-2">
            <VerifiedUpToBadge />
            {dataKnown && verifyHref && (
              <ProofChip
                kind="document"
                value={verifyHref}
                href={verifyHref}
                label="Verify"
                description={`On-chain witness for: ${next!.milestone.label}.`}
              />
            )}
          </div>
        </div>

        {!dataKnown ? (
          <p className="text-sm text-muted-foreground">
            Awaiting indexed pulse data. The next canonical milestone surfaces here as soon as
            the on-chain totals load — no projected dates, no invented thresholds.
          </p>
        ) : (
          <>
            <div className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
              {next!.milestone.label}
            </div>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              {next!.milestone.description}
            </p>

            <div className="mt-4 max-w-xl">
              <div className="h-2 rounded-full bg-border/40 overflow-hidden ring-1 ring-border/40">
                <div
                  className="h-full transition-all"
                  aria-label={`${pct}% to ${next!.milestone.label}`}
                  style={{ width: `${Math.max(2, pct)}%`, background: "var(--gradient-gold)" }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>
                  {fmtInt(next!.current)} of {fmtInt(next!.milestone.target)}
                </span>
                <span>
                  {next!.remaining !== undefined
                    ? `${fmtInt(next!.remaining)} to seal`
                    : `${pct}% progress`}
                </span>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </Section>
  );
}
