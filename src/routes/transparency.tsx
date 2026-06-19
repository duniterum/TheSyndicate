import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { TransparencyCenter } from "@/components/syndicate/TransparencyCenter";
import { TransparencyTimeline } from "@/components/syndicate/TransparencyTimeline";
import { TransparencyReport } from "@/components/syndicate/TransparencyReport";
import { TreasuryComposition } from "@/components/syndicate/TreasuryComposition";
import { VerifyEverything } from "@/components/syndicate/VerifyEverything";
import { RoutingFlow } from "@/components/syndicate/RoutingFlow";
import { UseOfFunds } from "@/components/syndicate/UseOfFunds";
import { LpStatusCard } from "@/components/syndicate/LpStatus";
import { Section, SectionHeader } from "@/components/syndicate/Primitives";
import { RiskDisclaimer } from "@/components/syndicate/RiskDisclaimer";

export const Route = createFileRoute("/transparency")({
  head: () => ({
    meta: [
      { title: "Transparency Center — Live, Pending, Verifiable | The Syndicate" },
      { name: "description", content: "Honest status of every module: what is live onchain, what is pending deployment, and where to verify each piece." },
      { property: "og:title", content: "The Syndicate — Transparency Center" },
      { property: "og:description", content: "Verify The Syndicate on-chain. SYN, Membership Sale, and LP live on Avalanche. 70% Vault, 20% Liquidity, 10% Operations." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://thesyndicate.money/transparency" },
      { property: "og:image", content: "https://thesyndicate.money/og/og-transparency.png" },
      { property: "og:image:width", content: "1280" },
      { property: "og:image:height", content: "672" },
      { property: "og:image:alt", content: "Verify The Syndicate on-chain — Treasury 70%, Liquidity 20%, Operations 10%" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Syndicate — Transparency Center" },
      { name: "twitter:description", content: "Verify on-chain. Live contracts, public wallets, 70% Vault, 20% Liquidity, 10% Operations." },
      { name: "twitter:image", content: "https://thesyndicate.money/og/og-transparency.png" },
      { name: "twitter:image:alt", content: "Verify The Syndicate on-chain — Treasury 70%, Liquidity 20%, Operations 10%" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/transparency" }],
  }),
  component: () => (
    <PageShell
      eyebrow="Transparency"
      title="Verify on-chain"
      description="What is live onchain, what is pending, and where to verify each piece. Full contract + wallet addresses live on the Registry."
    >
      <TransparencyCenter />

      <TransparencyTimeline />

      <VerifyEverything />

      <TreasuryComposition />

      <RoutingFlow />

      <UseOfFunds />

      <TransparencyReport />

      <Section id="lp-status">
        <SectionHeader
          eyebrow="LP Status"
          title="Liquidity pool status"
          description="Current SYN/USDC reserves, LP supply, and implied price read from the live Trader Joe pair."
        />
        <LpStatusCard />
      </Section>

      <Section id="archive-status">
        <SectionHeader
          eyebrow="Archive"
          title="Memory layer — open plus read-gated artifacts"
          description="An optional collectible memory layer around each seat. The Archive1155 contract is deployed on Avalanche; The First Signal (ID 1) is OPEN at 0.50 USDC. Patron Seal (ID 3) is CONTRACT_GATED / PUBLIC_MINT_READ_GATED: mintability is shown only from live Archive1155 reads. Other Artifacts are protocol-memory surfaces sealed by event. SYN is the seat. Artifacts are the memory."
        />
        <div className="surface elevated p-5 text-sm text-muted-foreground leading-relaxed">
          <p>
            Nine artifact categories are registered in code (Chapter Artifacts, Seat Records,
            Genesis Founder Marks, Milestone Artifacts, Liquidity Marks, Protocol Milestones, Patron
            Seals, Secret Artifacts, Legacy Artifacts) with explicit pending/locked/secret statuses.
            See <a href="/nft" className="text-foreground underline-offset-4 hover:underline">/nft</a>.

          </p>
          <p className="mt-3 text-xs">
            Artifacts are collectible records only. They are not equity, debt, Vault ownership,
            dividend instruments, revenue share, governance rights, or promises of profit.
            Participation may result in total loss.
          </p>
        </div>
      </Section>

      <Section id="knowledge-map-xref">
        <div className="surface elevated p-5 text-sm text-muted-foreground leading-relaxed">
          Want to see where each of these facts actually lives? The{" "}
          <Link to="/knowledge-map" className="text-foreground underline-offset-4 hover:underline">
            Protocol Knowledge Map
          </Link>{" "}
          shows every knowledge home — live on-chain projections, durable institutional memory,
          and reserved future systems. Structure, not live values.
        </div>
      </Section>

      <RiskDisclaimer />
    <RouteFinalCTA preset="verify" />
    </PageShell>
  ),
});
