// My Referral — personal, SIMULATED preview surface inside the cockpit.
//
// Doctrine: docs/LEGAL_DISCLOSURE_REFERRAL.md + PROTOCOL_IN_PUBLIC_DOCTRINE.
//   • Commission comes ONLY from the Operations slice (10% of gross).
//   • Vault and Liquidity are never touched by referrals.
//   • Everything here is SIMULATED until the CommissionRouter ships.

import { useAccount } from "wagmi";
import { Link as RouterLink } from "@tanstack/react-router";
import { GlassCard, Pill, Section, SectionHeader } from "./Primitives";
import { SimPill } from "@/components/preview/PreviewPrimitives";
import {
  CommissionEstimator,
  TierLadderPreview,
} from "@/components/preview/ReferralPreview";

export function MyReferralCard() {
  const { address, isConnected } = useAccount();
  const linkPreview =
    isConnected && address
      ? `https://thesyndicate.money/join?ref=${address.slice(0, 6)}…${address.slice(-4)}`
      : "https://thesyndicate.money/join?ref=0xYourWallet…";

  return (
    <Section id="my-referral">
      <SectionHeader
        eyebrow="Referral · Preview"
        title={<>Your link, tier, and <span className="text-gradient-gold">estimator</span></>}
        description="Referral commission is paid only from the 10% Operations slice. Vault and Liquidity are never touched. SIMULATED until the CommissionRouter contract ships."
      />
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <SimPill />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Future commission router · Preview shape only
          </span>
        </div>

        <div className="mb-4">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
            Your link (preview)
          </div>
          <div className="mono text-xs text-foreground/80 break-all p-3 rounded-md bg-muted/30 border border-dashed border-border">
            {linkPreview}
          </div>
          {!isConnected && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Connect a wallet to preview your link shape. The real link will derive from
              your wallet at launch.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <TierLadderPreview />
          <CommissionEstimator />
        </div>

        <div className="mt-4 border-t border-border/40 pt-3 text-[11px] text-muted-foreground leading-relaxed">
          Referral commission is routed from Operations only. Vault and Liquidity
          routing are never touched. No contract has been deployed for this surface yet.
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
        eyebrow="Reputation · Concept"
        title={<>Ranked by <span className="text-gradient-gold">durability</span>, not dollars</>}
        description="Future Builder Records will reflect retention, durability, and referrer age — gross USDC is a tiebreaker only. No formula is locked yet."
      />
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <SimPill />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Concept card · No live score yet
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
          See the simulated public leaderboard on{" "}
          <RouterLink to="/referral" className="underline-offset-4 hover:underline text-foreground">
            /referral
          </RouterLink>
          .
        </p>
      </GlassCard>
    </Section>
  );
}
