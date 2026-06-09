import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { PageShell } from "@/components/syndicate/PageShell";
import { Section, SectionHeader } from "@/components/syndicate/Primitives";
import { PreviewBanner } from "@/components/preview/PreviewPrimitives";
import {
  TierLadderPreview,
  SimReferralActivity,
  CommissionByTierChart,
  ReferralDisclosure,
  SplitVisualizerSection,
} from "@/components/preview/ReferralPreview";
import {
  ReputationLeaderboard,
  BuilderScoreComparisonChart,
  RetentionOverTimeChart,
} from "@/components/preview/ReputationLeaderboardPreview";

export const Route = createFileRoute("/referral")({
  head: () => ({
    meta: [
      { title: "Referral — Preview (simulated) | The Syndicate" },
      { name: "description", content: "Public explainer of the future Referral / Reputation model. Simulated data for UX testing — no contract is deployed yet." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "The Syndicate — Referral preview" },
      { property: "og:description", content: "Public preview of the future Referral and Reputation surfaces. Simulated data only. Personal tools live in /my-syndicate." },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/referral" }],
  }),
  component: ReferralPage,
});

function ReferralPage() {
  const { isConnected } = useAccount();
  return (
    <PageShell
      eyebrow="Preview"
      title="Referral · how it will work"
      description="Familiar referral pattern, Syndicate doctrine underneath. Commission comes only from the 10% Operations slice — Vault and Liquidity are never touched. Everything labeled SIMULATED is illustrative only."
    >
      <Section id="preview-banner">
        <PreviewBanner sticky title="Simulated preview of the future Referral / Reputation model" />
      </Section>

      {isConnected && (
        <Section id="connected-redirect">
          <div className="rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/[0.05] p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] mb-1">
                Your personal referral tools
              </div>
              <p className="text-sm text-foreground/90 leading-snug">
                Your link, your tier, your estimator, and your simulated activity
                live in your cockpit — not on this public page.
              </p>
            </div>
            <RouterLink
              to="/my-syndicate"
              hash="my-referral"
              className="mono text-[11px] uppercase tracking-[0.18em] px-4 py-2 rounded-md border border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10"
            >
              Open My Syndicate →
            </RouterLink>
          </div>
        </Section>
      )}

      <Section id="split">
        <SectionHeader
          eyebrow="Where every $1 goes"
          title={<>The split <span className="text-gradient-gold">never changes</span></>}
          description="Vault gets 70%. Liquidity gets 20%. Operations gets 10%. Referral commission comes only from the Operations slice."
        />
        <SplitVisualizerSection />
      </Section>

      <Section id="tiers">
        <SectionHeader eyebrow="Tiers" title="Higher tiers reward durable members" description="Higher tiers require not just count, but retention." />
        <TierLadderPreview />
      </Section>

      <Section id="commission-chart">
        <SectionHeader eyebrow="Commission" title="Per-sale commission by tier" />
        <CommissionByTierChart />
      </Section>

      <Section id="activity">
        <SectionHeader eyebrow="Activity" title="Sample simulated referrals" />
        <SimReferralActivity />
      </Section>

      <Section id="reputation">
        <SectionHeader
          eyebrow="Reputation"
          title={<>Ranked by <span className="text-gradient-gold">durability</span>, not dollars</>}
          description="Money is a tiebreaker. The leaderboard is composed of retention, durability, age, and reach."
        />
        <div className="flex flex-col gap-4">
          <ReputationLeaderboard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BuilderScoreComparisonChart />
            <RetentionOverTimeChart />
          </div>
        </div>
      </Section>

      <Section id="disclosure">
        <SectionHeader eyebrow="Disclosure" title="Honest notes" />
        <ReferralDisclosure />
      </Section>
    </PageShell>
  );
}
