import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { LivePurchase } from "@/components/syndicate/LivePurchase";
import { JoinStepsPlaque } from "@/components/syndicate/JoinStepsPlaque";
import { MembershipCalculator, AccessRate, PaymentStrategy, RankLadder } from "@/components/syndicate/Sections";
import { MemberCard } from "@/components/syndicate/MemberCard";
import { SeatRecordPanel } from "@/components/syndicate/SeatRecordPanel";
import { Section, SectionHeader } from "@/components/syndicate/Primitives";
import { SplitVisualizer } from "@/components/preview/SplitVisualizer";
import { ReferralAttributionNote } from "@/components/syndicate/ReferralAttributionNote";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Buy SYN with USDC — Live Membership Sale | The Syndicate" },
      { name: "description", content: "Live USDC → SYN purchase on Avalanche C-Chain. Fixed rate: 1 SYN = $0.01 USDC. Minimum 5 USDC. Routes 70/20/10 to Vault, Liquidity, Operations." },
      { property: "og:title", content: "Buy SYN with USDC — Live on Avalanche" },
      { property: "og:description", content: "Connect wallet, approve USDC, buy SYN. Fully onchain, non-custodial." },
      { property: "og:url", content: "https://thesyndicate.money/join" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/join" }],
  }),
  component: () => (
    <PageShell
      eyebrow="Buy SYN"
      title="Live USDC → SYN purchase"
      description="Membership Sale contract live on Avalanche C-Chain. Fixed access rate: 1 SYN = $0.01 USDC. Minimum 5 USDC."
    >
      <JoinStepsPlaque />
      <ReferralAttributionNote className="mt-2" />
      <Section id="member-card">
        <SectionHeader
          eyebrow="Member identity"
          title={<>Your <span className="text-gradient-gold">member card</span></>}
          description="Member number and chapter are derived live from the canonical holder index. If you have not joined yet, you'll see the seat you'd take."
        />
        <MemberCard />
      </Section>
      {/* Action lifted directly under member identity — buy first, explain the
          split right after (identity → action → proof) */}
      <LivePurchase />
      <Section id="split-visualizer">
        <SectionHeader
          eyebrow="Where every $1 goes"
          title={<>The split <span className="text-gradient-gold">never changes</span></>}
          description="Vault 70% and Liquidity 20% are untouched. Referral commission (preview) only comes from the 10% Operations slice."
        />
        <SplitVisualizer />
      </Section>
      <SeatRecordPanel />
      <AccessRate />
      <MembershipCalculator />
      <RankLadder />
      <PaymentStrategy />
    <RouteFinalCTA preset="mint" />
    </PageShell>
  ),
});
