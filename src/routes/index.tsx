import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { ProtocolIntelligenceBar } from "@/components/syndicate/ProtocolIntelligenceBar";
import { ProtocolHero, HeroEntryStrip } from "@/components/syndicate/ProtocolHero";
import { HomeKpiGrid } from "@/components/syndicate/HomeKpiGrid";
import { ProtocolEnginesPanel } from "@/components/syndicate/ProtocolEnginesPanel";
import { LivePulseStrip } from "@/components/syndicate/LivePulseStrip";
import { HomeActivityTape } from "@/components/syndicate/HomeActivityTape";
import { Flywheel } from "@/components/syndicate/Flywheel";
import { ProtocolStorySoFar } from "@/components/syndicate/ProtocolStorySoFar";
import { MilestoneApproachingTile } from "@/components/syndicate/MilestoneApproachingTile";
import { StoryTimeline } from "@/components/syndicate/StoryTimeline";
import { IdentityZone } from "@/components/syndicate/IdentityZone";
import { HomeProgressionTeaser } from "@/components/syndicate/HomeProgressionTeaser";
import { WhyJoinSimple } from "@/components/syndicate/WhyJoinSimple";
import { HowToJoinSteps } from "@/components/syndicate/HowToJoinSteps";
import { WhatChangesAfterJoining } from "@/components/syndicate/WhatChangesAfterJoining";
import { HomeTransparencySnapshot } from "@/components/syndicate/HomeTransparencySnapshot";
import { RiskDisclaimer } from "@/components/syndicate/RiskDisclaimer";
import { Section, SectionHeader, CTAButton } from "@/components/syndicate/Primitives";
import { ProtocolJourneySpine, ProtocolMemoryPipeline } from "@/components/syndicate/ProtocolJourneySpine";
import { AnticipationLine } from "@/components/syndicate/AnticipationLine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Syndicate - Take Your Seat in a Transparent Protocol" },
      {
        name: "description",
        content:
          "A transparent on-chain membership protocol on Avalanche. Buying membership delivers SYN, routes USDC 70 / 20 / 10, and leaves a verifiable public receipt.",
      },
      { property: "og:title", content: "The Syndicate - Take your seat in a transparent protocol" },
      {
        property: "og:description",
        content:
          "SYN is the seat. USDC routes on-chain. Activity becomes Chronicle, Register, and Archive memory. Live systems and future systems are labeled clearly.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://thesyndicate.money/" },
      { property: "og:image", content: "https://thesyndicate.money/brand-v2-syndicate-interlock/syn-og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "The Syndicate - On-chain membership protocol" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Syndicate - Take your seat in a transparent protocol" },
      { name: "twitter:description", content: "Live on Avalanche. Membership Sale delivers SYN and routes every USDC 70 / 20 / 10 on-chain. Verifiable." },
      { name: "twitter:image", content: "https://thesyndicate.money/brand-v2-syndicate-interlock/syn-og.png" },
      { name: "twitter:image:alt", content: "The Syndicate - On-chain membership protocol" },
    ],
    links: [
      { rel: "canonical", href: "https://thesyndicate.money/" },
      { rel: "preload", as: "image", href: "/hero/cervin.webp" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "The Syndicate - Take Your Seat in a Transparent Protocol",
          url: "https://thesyndicate.money/",
          description:
            "A transparent on-chain membership protocol on Avalanche. Buying membership delivers SYN, routes USDC 70 / 20 / 10, and leaves a verifiable public receipt.",
          isPartOf: { "@id": "https://thesyndicate.money/#site" },
        }),
      },
    ],
  }),
  component: Index,
});

// ─────────────────────────────────────────────────────────────────────────────
// The homepage is a public COCKPIT. It leads with proof-of-life — a curated live
// ticker, the hero seat identity, a KPI grid, an engine status board, and the
// raised live heartbeat — then DEMOTES the prose into two clearly-labeled bands
// ("How it works", then "Verify"). Every surface is an EXISTING protocol system;
// nothing was deleted — gated narrative surfaces (ProtocolStorySoFar, Flywheel,
// StoryTimeline, MilestoneApproachingTile) are kept and relocated. No new claims,
// no new data sources, no new routes. Live brand stays the current frozen one.
// ─────────────────────────────────────────────────────────────────────────────

// Curated top ticker: seat / economy cells only (the full global ticker stays
// suppressed via hideIntelligenceBar). mobilePriority keeps the first four cells
// visible on phones; the rest reveal at the `sm` breakpoint.
const HOME_TICKER_CELLS = ["members", "usdcRouted", "protocolWallets", "lpTvl", "burned", "chapter"];

function Index() {
  return (
    <PageShell title="" hideHeader headerWide hideIntelligenceBar hideDemoBanner hideIdentityRibbon>
      {/* ── COCKPIT ── proof-of-life first: ticker → hero → KPIs → engines → heartbeat.
          Each panel self-labels via its own SectionHeader; no act markers up here. */}
      <ProtocolIntelligenceBar cells={HOME_TICKER_CELLS} mobilePriority={4} />
      <ProtocolHero />
      <AnticipationLine />
      <ProtocolJourneySpine current="visitor" />
      <HomeKpiGrid />
      <ProtocolEnginesPanel />

      {/* Raised live heartbeat — nearest milestone, vitals, and the activity tape.
          Honest empty / PARTIAL states come from the components themselves. */}
      <MilestoneApproachingTile />
      <LivePulseStrip />
      <HomeActivityTape />
      <ProtocolMemoryPipeline compact />
      <HeroEntryStrip />

      {/* ── HOW IT WORKS ── prose, demoted into one compressed band below the
          cockpit. Gated narrative surfaces (Flywheel, ProtocolStorySoFar) live here. */}
      <ActMarker
        n="01"
        kicker="How it works"
        title="What a seat is, how you take one, and what changes after — in brief. Verify every claim on-chain."
      />
      <WhyJoinSimple />
      <HowToJoinSteps />
      <WhatChangesAfterJoining />
      <IdentityZone />
      <HomeProgressionTeaser />
      <Flywheel />
      <ProtocolStorySoFar />

      {/* ── VERIFY ── a quieter support band: the timeline + transparency snapshot. */}
      <ActMarker
        n="02"
        kicker="Verify"
        title="Don't trust — verify. Every public claim maps to an on-chain read."
      />
      <StoryTimeline />
      <HomeTransparencySnapshot />

      {/* Final CTA — one clear call to action, with the verification paths beside it. */}
      <Section id="home-join-cta">
        <SectionHeader
          eyebrow="Take your seat"
          title={<>Receive SYN. <span className="text-gradient-gold">Enter the record.</span></>}
          description="Open the live Membership Sale on Avalanche. The wallet receives SYN, every USDC routes 70 / 20 / 10, and the receipt becomes proof My Syndicate can remember."
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
// data or cards. Two labeled rules demote the prose beneath the live cockpit.
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
