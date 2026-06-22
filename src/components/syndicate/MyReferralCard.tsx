// My Referral / Reputation — personal cockpit surfaces, kept as honest
// PENDING shells until source records and activation are separately approved.
//
// Doctrine: SourceRegistryV1 and MembershipSaleV3 exist, but SourceRegistryV1
// has zero source records and public/default buys use ZERO_SOURCE_ID.
//   • There is no live source link, commission, claim UI, or source-aware
//     public buy path. We say so plainly instead of rendering fabricated
//     estimators, tier ladders, or simulated scores.
//   • Status vocabulary is LIVE / PARTIAL / PENDING only — never "SIMULATED".
//   • Recognition and source money terms remain separate. Any future source
//     terms must be disclosed and verified before they affect money.

import { Link as RouterLink } from "@tanstack/react-router";
import { GlassCard, Pill, Section, SectionHeader, StatusPill } from "./Primitives";

export function MyReferralCard() {
  return (
    <Section id="my-referral">
      <SectionHeader
        eyebrow="Referral · Pending"
        title={<>Bring members. Recognition, <span className="text-gradient-gold">not payout</span></>}
        description="The referral surface is not live yet. SourceRegistryV1 is deployed with zero source records; public V3 buys use ZERO_SOURCE_ID. No commission is accruing and no claim UI is live."
      />
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusPill status="PENDING" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            No source records · no claim UI
          </span>
        </div>

        <p className="text-sm text-foreground/85 leading-relaxed">
          Your introduction path may become visible after a separate approved
          source packet, on-chain source record, activation readback, and legal
          copy. Until then there is no link to share, no balance to estimate,
          and no commission accruing — so we show none.
        </p>

        <div className="mt-4 border-t border-border/40 pt-3 text-[11px] text-muted-foreground leading-relaxed">
          CommissionRouterV1 is not the active V3 source engine. V3 source
          terms would be disclosed in the purchase receipt before they affect
          money.
          <div className="mt-2">
            <RouterLink to="/referral" className="underline-offset-4 hover:underline text-foreground">
              Read the public explainer →
            </RouterLink>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

export function MyReputationConceptCard() {
  return (
    <Section id="my-reputation">
      <SectionHeader
        eyebrow="Reputation · Pending"
        title={<>Ranked by <span className="text-gradient-gold">durability</span>, not dollars</>}
        description="Builder Records are a future concept, not a live score. They will reflect retention, durability, and referrer age — gross USDC is a tiebreaker only. No formula is locked and nothing is scored yet."
      />
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusPill status="PENDING" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Concept only · no live score yet
          </span>
        </div>
        <ul className="text-sm text-foreground/85 space-y-1.5">
          <li>• Retention — % of referred members still active</li>
          <li>• Durability — composite of multi-window retention</li>
          <li>• Referrer age — how long you've been bringing members</li>
          <li>• Active reach — count of referred buyers still here today</li>
          <li className="text-muted-foreground">• Gross USDC — tiebreaker only</li>
        </ul>
        <div className="mt-3">
          <Pill tone="muted">Not a top-earners board</Pill>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Read how reputation is intended to work on{" "}
          <RouterLink to="/referral" className="underline-offset-4 hover:underline text-foreground">
            /referral
          </RouterLink>
          .
        </p>
      </GlassCard>
    </Section>
  );
}
