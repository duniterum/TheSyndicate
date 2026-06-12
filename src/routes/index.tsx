import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { ProtocolHero } from "@/components/syndicate/ProtocolHero";
import { LivePulseStrip } from "@/components/syndicate/LivePulseStrip";
import { HomeActivityTape } from "@/components/syndicate/HomeActivityTape";
import { Flywheel } from "@/components/syndicate/Flywheel";
import { ProtocolStorySoFar } from "@/components/syndicate/ProtocolStorySoFar";
import { MilestoneApproachingTile } from "@/components/syndicate/MilestoneApproachingTile";
import { StoryTimeline } from "@/components/syndicate/StoryTimeline";
import { IdentityZone } from "@/components/syndicate/IdentityZone";
import { WhyJoinSimple } from "@/components/syndicate/WhyJoinSimple";
import { HowToJoinSteps } from "@/components/syndicate/HowToJoinSteps";
import { WhatChangesAfterJoining } from "@/components/syndicate/WhatChangesAfterJoining";
import { HomeTransparencySnapshot } from "@/components/syndicate/HomeTransparencySnapshot";
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

// ─────────────────────────────────────────────────────────────────────────────
// The homepage is ONE journey told in five acts. Every surface below is an
// EXISTING protocol system, reordered so a first-time visitor moves through:
//   01 What is this · 02 Why join · 03 Why now · 04 What happens after · 05 Verify
// Consolidation pass: no new data, no new cards. Duplicated story/proof surfaces
// (StorySoFar, ProtocolMoments, LiveProofStrip, HomeArchiveTeaser, the LP card,
// and the second SinceYourLastVisit — already mounted inside IdentityZone) were
// removed from the homepage to keep the line of meaning unbroken.
// ─────────────────────────────────────────────────────────────────────────────
function Index() {
  return (
    <PageShell title="" hideHeader headerWide hideIntelligenceBar hideDemoBanner hideIdentityRibbon>
      {/* ── ACT 01 · WHAT IS THIS? ──────────────────────────────────────────
          A living protocol on Avalanche. SYN is the seat. */}
      <ProtocolHero />
      <ActMarker
        n="01"
        kicker="What this is"
        title="A living protocol on Avalanche — not a promise. Here is its state, right now."
      />
      <ProtocolStorySoFar />

      {/* ── ACT 02 · WHY JOIN? ──────────────────────────────────────────────
          A permanent on-chain seat, and the identity it carries. */}
      <ActMarker
        n="02"
        kicker="Why join"
        title="A seat is a permanent, numbered place in the archive. It cannot be reassigned — by anyone, ever."
      />
      <WhyJoinSimple />
      <IdentityZone />

      {/* ── ACT 03 · WHY NOW? ───────────────────────────────────────────────
          Current chapter, seats, nearest milestone, live movement. */}
      <ActMarker
        n="03"
        kicker="Why now"
        title="The chapter is open and the next seat is waiting. The earliest members are sealed in first."
      />
      <MilestoneApproachingTile />
      <LivePulseStrip />
      <HomeActivityTape />

      {/* ── ACT 04 · WHAT HAPPENS AFTER YOU JOIN? ───────────────────────────
          USDC → Sale → SYN → 70/20/10 → Chronicle → Archive → identity. */}
      <ActMarker
        n="04"
        kicker="What happens next"
        title="Your USDC routes on-chain, your SYN arrives, and the archive records the moment."
      />
      <HowToJoinSteps />
      <WhatChangesAfterJoining />
      <Flywheel />

      {/* ── ACT 05 · HOW TO VERIFY? ─────────────────────────────────────────
          Memory, proof, and the routes that let you check every claim. */}
      <ActMarker
        n="05"
        kicker="How to verify"
        title="Don't trust — verify. Every public claim maps to an on-chain read."
      />
      <StoryTimeline />
      <HomeTransparencySnapshot />

      {/* Final CTA — one clear call to action, with the verification paths beside it. */}
      <Section id="home-join-cta">
        <SectionHeader
          eyebrow="Take your seat"
          title={<>Buy SYN. <span className="text-gradient-gold">Verify on-chain.</span></>}
          description="Open the live Membership Sale on Avalanche. Same rate for everyone: every USDC routes 70% Vault, 20% Liquidity, 10% Operations."
        />
        <div className="flex flex-wrap items-center gap-3">
          <CTAButton variant="gold" href="/join">Join The Syndicate →</CTAButton>
          <CTAButton variant="ghost" href="/transparency">Open transparency</CTAButton>
          <CTAButton variant="ghost" href="/activity">See live activity</CTAButton>
          <a
            href="/archive"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline text-muted-foreground hover:text-foreground self-center"
          >
            Explore the archive →
          </a>
          <a
            href="/registry"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline text-muted-foreground hover:text-foreground self-center"
          >
            Verify every contract →
          </a>
        </div>
      </Section>

      <RiskDisclaimer />
    </PageShell>
  );
}

// Minimal narrative scaffolding — orients the visitor without adding protocol
// data or cards. One labeled rule per act so the five-part journey is legible.
function ActMarker({ n, kicker, title }: { n: string; kicker: string; title: string }) {
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-16">
      <div className="flex flex-col gap-2 border-t border-border/60 pt-5 sm:flex-row sm:items-baseline sm:gap-4">
        <div className="flex items-baseline gap-3 shrink-0">
          <span className="mono text-xs tracking-[0.26em] text-[var(--gold)]">{n}</span>
          <span className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {kicker}
          </span>
        </div>
        <p className="max-w-2xl text-sm md:text-[15px] leading-relaxed text-foreground/75 sm:ml-auto sm:text-right">
          {title}
        </p>
      </div>
    </div>
  );
}
