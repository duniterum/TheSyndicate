// Loop B canonical surface — Remaining to Chapter Close.
//
// Rewritten per Wave P6 / docs/LOOP_OWNERSHIP_DECISION.md to lead with the
// chapter-progress headline read from the Protocol Truth Layer. The live
// sale stats panel is demoted to a verify-link footer underneath.

import { Link } from "@tanstack/react-router";
import { GlassCard, Pill, Section, SectionHeader, CTAButton, StatusPill } from "@/components/syndicate/Primitives";
import { SaleStatsPanel } from "@/components/syndicate/LivePurchase";
import { useProtocolTruth } from "@/lib/protocol-truth";

export function HomeNextMilestone() {
  const truth = useProtocolTruth();
  const cp = truth.chapterProgress.value;
  const next = truth.nextMemberNumber.value;

  const headline = cp
    ? cp.remaining === 0
      ? `Chapter ${cp.label} sealed`
      : `${cp.remaining} seat${cp.remaining === 1 ? "" : "s"} until ${cp.label} closes`
    : "Awaiting first buyer on-chain";

  const subline = cp && cp.remaining > 0 && next !== undefined
    ? `Member #${next} fills seat ${cp.taken + 1} of ${cp.capacity}. No private rounds, no insider rate.`
    : cp && cp.remaining === 0
      ? "The next chapter opens at the next on-chain purchase."
      : "Chapter assignments derive from on-chain join order via the Membership Sale contract.";

  return (
    <Section id="next-milestone">
      <SectionHeader
        eyebrow="What changes next"
        title={<>Remaining to <span className="text-gradient-gold">chapter close</span></>}
        description="Chapters close at fixed on-chain capacities — Genesis Signal (#333) · First Thousand (#1,000) · The Expansion (#3,333) · First Ten Thousand (#10,000). No countdowns, no projected dates. Closes when the next buyer fills the last seat."
      />
      <GlassCard className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <StatusPill status={truth.chapterProgress.status} />
          {cp && <Pill tone="gold">Chapter {cp.label}</Pill>}
          <Pill tone="navy">On-chain</Pill>
        </div>

        <div className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground">
          {headline}
        </div>
        <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
          {subline}
        </p>

        {cp && (
          <div className="mt-5 max-w-xl">
            <div className="h-3 rounded-full bg-border/40 overflow-hidden ring-1 ring-border/50">
              <div
                className="h-full rounded-full transition-all"
                aria-label={`${cp.progressPct}% filled`}
                style={{ width: `${Math.max(2, cp.progressPct)}%`, background: "var(--gradient-gold)" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>{cp.taken} of {cp.capacity} taken</span>
              <span>{cp.progressPct}% filled</span>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <CTAButton variant="gold" href="/join">Take the next seat →</CTAButton>
          <CTAButton variant="ghost" href="/chapters">See all chapters</CTAButton>
        </div>

        {/* Demoted: live sale stats stay reachable as a verify-link footer. */}
        <details className="mt-6 group">
          <summary className="cursor-pointer mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground">
            Verify ↓ live sale stats from the contract
          </summary>
          <div className="mt-4 border-t border-border/40 pt-4">
            <SaleStatsPanel />
            <div className="mt-3 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Source: <Link to="/transparency" className="underline hover:text-[var(--gold)]">/transparency</Link> · derived from <code className="text-[10px]">{truth.chapterProgress.formula}</code>
            </div>
          </div>
        </details>
      </GlassCard>
    </Section>
  );
}
