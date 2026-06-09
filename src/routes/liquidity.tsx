import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { LpStatusCard, LpIncentives, ProvideLiquidityCTA } from "@/components/syndicate/LpStatus";
import { DexScreenerChart } from "@/components/syndicate/DexScreenerChart";
import { LiquidityTrustContext } from "@/components/syndicate/LiquidityTrustContext";
import { WhyLpMatters } from "@/components/syndicate/WhyLpMatters";
import { LiquidityActionRail } from "@/components/syndicate/LiquidityActionRail";
import { ProtocolEventsFeed } from "@/components/syndicate/ProtocolEventsFeed";
import { Section, SectionHeader } from "@/components/syndicate/Primitives";

export const Route = createFileRoute("/liquidity")({
  head: () => ({
    meta: [
      { title: "Liquidity — SYN/USDC LP on Trader Joe | The Syndicate" },
      { name: "description", content: "Live Trader Joe AMM (JLP) SYN/USDC liquidity pool on Avalanche. Reserves, TVL, LP supply, and implied price read live from the pair contract." },
      { property: "og:title", content: "The Syndicate — Liquidity" },
      { property: "og:description", content: "Live LP reserves, TVL, and SYN price from the Trader Joe SYN/USDC AMM pair." },
      { property: "og:url", content: "https://thesyndicate.money/liquidity" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/liquidity" }],
  }),
  component: () => (
    <PageShell
      eyebrow="Liquidity"
      title="SYN / USDC liquidity pool"
      description="Trader Joe classic AMM (JLP) pair on Avalanche C-Chain — not Liquidity Book / DLMM. Every number is read from the pair contract."
    >
      {/* Top-of-page crypto-native action rail — above the fold */}
      <LiquidityActionRail />

      {/* WHY before WHAT */}
      <WhyLpMatters />

      <Section id="lp">
        <SectionHeader
          eyebrow="Live Pool"
          title="Reserves, supply, and implied price"
          description="Refreshes every 60 seconds via Avalanche RPC."
        />
        <LpStatusCard />
      </Section>
      <LiquidityTrustContext />
      <DexScreenerChart />
      {/* Latest LP events (swaps + add/remove) — same unified feed, filtered visually by the events themselves */}
      <ProtocolEventsFeed limit={15} compact />
      <ProvideLiquidityCTA />
      <LpIncentives />
    <RouteFinalCTA preset="verify" />
    </PageShell>
  ),
});
