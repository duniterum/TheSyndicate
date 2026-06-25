// My Referral / Reputation — personal cockpit surfaces, kept as honest
// PENDING shells until source records and activation are separately approved.
//
// Doctrine: SourceRegistryV1 and MembershipSaleV3 exist, but the first source
// record is PAUSED/internal only and public/default buys use ZERO_SOURCE_ID.
//   • There is no live source link, commission, claim UI, or source-aware
//     public buy path. We say so plainly instead of rendering fabricated
//     estimators, tier ladders, or simulated scores.
//   • Status vocabulary is LIVE / PARTIAL / PENDING only — never "SIMULATED".
//   • Recognition and source money terms remain separate. Any future source
//     terms must be disclosed and verified before they affect money.

import { Link as RouterLink } from "@tanstack/react-router";
import {
  CURRENT_SOURCE_POLICY_SNAPSHOT,
  SOURCE_ATTRIBUTED_RECEIPT_PROOF_FIELDS,
  SOURCE_ATTRIBUTION_READINESS_GATES,
} from "@/lib/source-policy-observability";
import { GlassCard, Pill, Section, SectionHeader, StatusPill } from "./Primitives";

export function MyReferralCard() {
  const sourcePolicy = CURRENT_SOURCE_POLICY_SNAPSHOT;
  const memberFacingGates = SOURCE_ATTRIBUTION_READINESS_GATES.filter((gate) =>
    ["Source policy fact", "Source-aware buy path", "Claim boundary"].includes(gate.label),
  );
  const receiptProofLabels = SOURCE_ATTRIBUTED_RECEIPT_PROOF_FIELDS.map((field) => field.label);

  return (
    <Section id="my-referral">
      <SectionHeader
        eyebrow="Referral · Pending"
        title={<>Bring members. Recognition, <span className="text-gradient-gold">not payout</span></>}
        description="The referral surface is not live yet. SourceRegistryV1 has one PAUSED internal source record; public V3 buys use ZERO_SOURCE_ID. No commission is accruing and no claim UI is live."
      />
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusPill status="PENDING" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            One PAUSED source record · no claim UI
          </span>
        </div>

        <p className="text-sm text-foreground/85 leading-relaxed">
          The internal source record is a protocol-test fact, not a member
          referral program. Your introduction path may become visible only after
          a separate approved activation readback, source-aware product path,
          and legal copy. Until then there is no link to share, no balance to
          estimate, and no commission accruing — so we show none.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {memberFacingGates.map((gate) => (
            <div key={gate.label} className="rounded-[6px] border border-border/55 bg-background/45 p-3">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
                {gate.currentStatus}
              </div>
              <div className="mt-1.5 text-sm font-semibold text-foreground">{gate.label}</div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{gate.requirement}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[6px] border border-border/50 bg-background/35 p-3">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Future receipt must prove
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {receiptProofLabels.map((label) => (
              <Pill key={label} tone="muted">{label}</Pill>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-border/40 pt-3 text-[11px] text-muted-foreground leading-relaxed">
          Current readback: {sourcePolicy.currentSummary}
          <br />
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
