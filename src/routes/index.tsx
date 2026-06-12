import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { EditorialHero } from "@/components/syndicate/EditorialHero";
import { LivePulseStrip } from "@/components/syndicate/LivePulseStrip";
import { HomeActivityTape } from "@/components/syndicate/HomeActivityTape";
import { LiveProofStrip } from "@/components/syndicate/LiveProofStrip";
import { Flywheel } from "@/components/syndicate/Flywheel";
import { SinceYourLastVisit } from "@/components/syndicate/SinceYourLastVisit";
import { StorySoFar } from "@/components/syndicate/StorySoFar";
import { ProtocolStorySoFar } from "@/components/syndicate/ProtocolStorySoFar";
import { MilestoneApproachingTile } from "@/components/syndicate/MilestoneApproachingTile";
import { StoryTimeline } from "@/components/syndicate/StoryTimeline";

import { ProtocolMoments } from "@/components/syndicate/ProtocolMoments";
import { IdentityZone } from "@/components/syndicate/IdentityZone";
import { WhyJoinSimple } from "@/components/syndicate/WhyJoinSimple";
import { HowToJoinSteps } from "@/components/syndicate/HowToJoinSteps";
import { WhatChangesAfterJoining } from "@/components/syndicate/WhatChangesAfterJoining";
import { HomeTransparencySnapshot } from "@/components/syndicate/HomeTransparencySnapshot";
import { HomeArchiveTeaser } from "@/components/syndicate/HomeArchiveTeaser";
import { LpStatusCard } from "@/components/syndicate/LpStatus";
import { RiskDisclaimer } from "@/components/syndicate/RiskDisclaimer";
import { Section, SectionHeader, CTAButton } from "@/components/syndicate/Primitives";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Syndicate — Transparent On-Chain Asset Accumulation Protocol" },
      {
        name: "description",
        content:
          "A transparent on-chain protocol on Avalanche. Revenue enters via Membership Sales, routes on-chain to liquidity, treasury, and operations. Every number verifiable.",
      },
      { property: "og:title", content: "The Syndicate — On-chain asset accumulation" },
      {
        property: "og:description",
        content:
          "Revenue in → routed on-chain → liquidity, treasury, operations. Live on Avalanche. Pending modules clearly labeled.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://thesyndicate.money/" },
      { property: "og:image", content: "https://thesyndicate.money/og/og-protocol-default.png" },
      { property: "og:image:width", content: "1280" },
      { property: "og:image:height", content: "672" },
      { property: "og:image:alt", content: "The Syndicate — Living protocol on Avalanche C-Chain" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Syndicate — On-chain asset accumulation" },
      { name: "twitter:description", content: "Live on Avalanche. Membership Sale routes every USDC 70 / 20 / 10 on-chain. Verifiable." },
      { name: "twitter:image", content: "https://thesyndicate.money/og/og-protocol-default.png" },
      { name: "twitter:image:alt", content: "The Syndicate — Living protocol on Avalanche C-Chain" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "The Syndicate — Transparent On-Chain Asset Accumulation Protocol",
          url: "https://thesyndicate.money/",
          description:
            "A transparent on-chain protocol on Avalanche. Revenue enters via Membership Sales, routes on-chain to liquidity, treasury, and operations.",
          isPartOf: { "@id": "https://thesyndicate.money/#site" },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageShell title="" hideHeader>
      {/* ZONE 1 — EDITORIAL HERO */}
      <EditorialHero />

      {/* ZONE 1.4 — GLOBAL "STORY SO FAR" SNAPSHOT (one truth across all surfaces) */}
      <ProtocolStorySoFar />

      {/* ZONE 1.45 — MILESTONE APPROACHING (closest canonical threshold, no countdowns) */}
      <MilestoneApproachingTile />

      {/* ZONE 1.5 — LIVE PROTOCOL PULSE (7 verifiable tiles, above the fold) */}
      <LivePulseStrip />


      {/* ZONE 1.6 — COMPRESSED CTA: one primary, one secondary, one tertiary */}
      <Section id="home-pulse-cta">
        <div className="flex flex-wrap items-center gap-3">
          <CTAButton variant="gold" href="/join">Join The Syndicate →</CTAButton>
          <CTAButton variant="ghost" href="/nft">Mint The First Signal</CTAButton>
          <a
            href="/registry"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline text-muted-foreground hover:text-foreground"
          >
            Verify every contract →
          </a>
        </div>
      </Section>

      {/* ZONE 1.7 — LIVE ACTIVITY TAPE (newest on-chain events) */}
      <HomeActivityTape />

      {/* ZONE 1.8 — auditor-grade live proof strip (kept as supporting context) */}
      <LiveProofStrip />

      {/* ZONE 2 — LOOP C (returning visitors only). Chapter-close progress is
          already carried above by MilestoneApproachingTile (closest threshold)
          and by NextMemberHero in the hero — HomeNextMilestone was a duplicate. */}
      <SinceYourLastVisit />

      {/* ZONE 2.5 — FLYWHEEL (full product, not only the seat) */}
      <Flywheel />

      {/* ZONE 4 — IDENTITY (who you become — lifted above the deep narrative) */}
      <IdentityZone />

      {/* ZONE 5 — CONVERSION (why/how/what — lifted above deep story for action clarity) */}
      <WhyJoinSimple />
      <HowToJoinSteps />
      <WhatChangesAfterJoining />

      {/* ZONE 3 — STORY (narrative + Loop D supporting — now below conversion) */}
      <StorySoFar />
      <StoryTimeline />
      <ProtocolMoments />

      {/* ZONE 3.5 — ARCHIVE TEASER (compact, optional memory layer) */}
      <HomeArchiveTeaser />

      {/* ZONE 6 — PROOF (snapshot only; deep proof lives on dedicated routes) */}
      <HomeTransparencySnapshot />
      <Section id="home-lp">
        <SectionHeader
          eyebrow="Liquidity Pool"
          title={<>Live <span className="text-gradient-gold">SYN/USDC pool</span> on Trader Joe</>}
          description="Reserves and price read directly from the AMM pair contract on Avalanche."
        />
        <LpStatusCard />
      </Section>

      {/* Final CTA */}
      <Section id="home-join-cta">
        <SectionHeader
          eyebrow="Join"
          title={<>Buy SYN. <span className="text-gradient-gold">Verify on-chain.</span></>}
          description="Open the live Membership Sale on Avalanche. Same rate for everyone: every USDC routes 70% Vault, 20% Liquidity, 10% Operations."
        />
        <div className="flex flex-wrap gap-3">
          <CTAButton variant="gold" href="/join">Join The Syndicate →</CTAButton>
          <CTAButton variant="ghost" href="/transparency">Open transparency</CTAButton>
          <CTAButton variant="ghost" href="/registry">See full registry</CTAButton>
        </div>
      </Section>

      <RiskDisclaimer />
    </PageShell>
  );
}
