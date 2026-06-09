// My Referral / Reputation — personal cockpit surfaces, demoted to honest
// PENDING shells (Wave C1).
//
// Doctrine: docs/LEGAL_DISCLOSURE_REFERRAL.md + PROTOCOL_IN_PUBLIC_DOCTRINE.
//   • No contract has shipped for either surface, so there is nothing live to
//     show. We say so plainly instead of rendering fabricated estimators,
//     tier ladders, or simulated scores.
//   • Status vocabulary is LIVE / PARTIAL / PENDING only — never "SIMULATED".
//   • Referral commission, when it ships, is paid ONLY from the 10% Operations
//     slice. Vault and Liquidity are never touched. Recognition, not payout.

import { Link as RouterLink } from "@tanstack/react-router";
import { GlassCard, Pill, Section, SectionHeader, StatusPill } from "./Primitives";

export function MyReferralCard() {
  return (
    <Section id="my-referral">
      <SectionHeader
        eyebrow="Referral · Pending"
        title={<>Bring members. Recognition, <span className="text-gradient-gold">not payout</span></>}
        description="The referral surface is not live yet. When the CommissionRouter contract ships, commission is paid only from the 10% Operations slice — Vault and Liquidity are never touched. Nothing is being tracked or owed today."
      />
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusPill status="PENDING" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            No contract deployed · nothing to claim yet
          </span>
        </div>

        <p className="text-sm text-foreground/85 leading-relaxed">
          Your referral link will derive from your wallet at launch. Until the
          router is deployed there is no link to share, no balance to estimate,
          and no commission accruing — so we show none.
        </p>

        <div className="mt-4 border-t border-border/40 pt-3 text-[11px] text-muted-foreground leading-relaxed">
          Referral commission is routed from Operations only. Vault and Liquidity
          routing are never touched.
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
