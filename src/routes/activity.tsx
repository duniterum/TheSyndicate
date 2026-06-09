import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { ActivityFeedTabs } from "@/components/syndicate/LiveActivityFeed";
import { GlassCard, Section, SectionHeader, StatusPill, ProofButton } from "@/components/syndicate/Primitives";
import { SaleStatsPanel } from "@/components/syndicate/LivePurchase";
import { ProtocolEventsFeed } from "@/components/syndicate/ProtocolEventsFeed";
import { ProtocolTimeline } from "@/components/syndicate/ProtocolTimeline";
import { MiniExplorer } from "@/components/syndicate/MiniExplorer";
import { explorerUrlFor } from "@/lib/syndicate-config";
import { avascanAddressUrl } from "@/lib/chain-registry";
import { ArchiveStatusLegend } from "@/components/syndicate/ArchiveStatusLegend";
import { ActivityHealthBanner } from "@/components/syndicate/ActivityHealthBanner";
import { ActivitySummaryRow, getActivityChipCounts } from "@/components/syndicate/ActivitySummaryRow";
import { ActivityFilterChips } from "@/components/syndicate/ActivityFilterChips";
import { ActivityMilestones } from "@/components/syndicate/ActivityMilestones";
import { SinceYourLastVisit } from "@/components/syndicate/SinceYourLastVisit";
import { ProtocolStorySoFar } from "@/components/syndicate/ProtocolStorySoFar";
import { ActivityHeartbeat } from "@/components/syndicate/ActivityHeartbeat";
import { StoryTimeline } from "@/components/syndicate/StoryTimeline";

import { useProtocolEvents } from "@/lib/protocol-events";
import type { ActivityFilterKey } from "@/lib/activity-filters";

const SALE_TX_URL = explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS")
  ? `${explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS")}/transactions`
  : `${avascanAddressUrl("0x0020Df30C127306f0F5B44E6a6E4368D2855842d") ?? ""}/transactions`;

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — The protocol heartbeat | The Syndicate" },
      { name: "description", content: "Everything happening on-chain in The Syndicate — Membership Sale purchases, First Signal and Patron Seal mints, treasury and liquidity flows. Newest first, every row verifiable on Avascan." },
      { property: "og:title", content: "The Syndicate — Activity" },
      { property: "og:description", content: "Live protocol events from Avalanche: purchases, mints, treasury and LP flows. Verify every row." },
      { property: "og:url", content: "https://thesyndicate.money/activity" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/activity" }],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const [filter, setFilter] = useState<ActivityFilterKey>("all");
  const { events } = useProtocolEvents({ limit: 200 });
  const counts = getActivityChipCounts(events);

  return (
    <PageShell
      eyebrow="Activity"
      title="The protocol heartbeat"
      description="Membership purchases, new-member archive entries, LP swaps, liquidity changes, and Vault USDC flows — merged into one chronological feed. Every row is verifiable on Avascan."
    >
      {/* Global "Story So Far" snapshot — same truth used on Home + /my-syndicate */}
      <ProtocolStorySoFar />

      {/* Protocol Heartbeat — single latest verified event with why-it-matters + proof */}
      <ActivityHeartbeat />

      {/* Feed health banner — one-glance LIVE / INDEXED / PARTIAL / FAIL state */}
      <Section id="activity-health">
        <ActivityHealthBanner />
      </Section>


      {/* Live summary row — at-a-glance counts with proof pills */}
      <Section id="activity-summary">
        <ActivitySummaryRow window={200} />
      </Section>

      {/* Since-last-visit momentum banner — renders only on return visits */}
      <SinceYourLastVisit />

      {/* Milestones — what the protocol has already sealed + what's next */}
      <ActivityMilestones />


      {/* Filter chips + main newest-first feed */}
      <Section id="protocol-events">
        <SectionHeader
          eyebrow="Latest Protocol Events"
          title={<>Every <span className="text-gradient-gold">on-chain movement</span>, newest first</>}
          description="Click any chip to scope the feed. Every row links to the originating transaction on Avascan with a Verify chip — even when the feed is sourced from direct RPC fallback."
        />
        <div className="mb-4">
          <ActivityFilterChips value={filter} onChange={setFilter} counts={counts} />
        </div>
        <ProtocolEventsFeed limit={80} filter={filter} withSection={false} />
      </Section>

      {/* Bucketed timeline — recency view (Wave 3A) */}
      <ProtocolTimeline limit={80} />

      {/* Canonical story timeline — doctrine order, single proof per episode */}
      <StoryTimeline />




      {/* Aggregate sale stats */}
      <Section id="live-stats">
        <SectionHeader
          eyebrow="Live Sale Stats"
          title={<>Membership Sale <span className="text-gradient-gold">activity</span></>}
          description="Aggregate totals come straight from the contract — totalUsdcRaised, totalSynSold, totalBuyers. Below, the event feed scans Avalanche RPC for individual TokensPurchased events."
        />
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <StatusPill status="LIVE" />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Membership Sale · Avalanche C-Chain
            </span>
          </div>
          <SaleStatsPanel />
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <ProofButton href={SALE_TX_URL}>
              All transactions on Avascan ↗
            </ProofButton>
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              The counters read 0 until the first member joins — be the first event in the archive.
            </span>
          </div>
        </GlassCard>
      </Section>

      <Section id="event-feed">
        <SectionHeader
          eyebrow="Filtered Purchase Feed"
          title={<>Filter & paginate <span className="text-gradient-gold">TokensPurchased</span> events</>}
          description="Same purchase events as the feed above — with filters, sort, and pagination for deep inspection."
        />
        <ActivityFeedTabs defaultTab="live" enableControls />
      </Section>

      {/* Specialized per-tab explorer (LP swaps, treasury flows, large buys) */}
      <MiniExplorer />

      {/* Archive event categories — live + sealed */}
      <Section id="archive-events">
        <SectionHeader
          eyebrow="Archive events"
          title={<>What streams into the <span className="text-gradient-gold">feed above</span></>}
          description="The Archive1155 contract is live on Avalanche. The First Signal (ID 1) and Patron Seal (ID 3) mint events appear in the unified feed above. Other Artifact categories are sealed by protocol event — they enter the feed when those events fire on-chain."
        />
        <GlassCard className="p-5">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {[
              { label: "First Signal mint (ID 1)", state: "LIVE" },
              { label: "Patron Seal mint (ID 3)", state: "LIVE" },
              { label: "Chapter Artifact minted", state: "SEALED BY EVENT" },
              { label: "Milestone Artifact unlocked", state: "SEALED BY EVENT" },
              { label: "Liquidity Mark unlocked", state: "SEALED BY EVENT" },
              { label: "Protocol Milestone unlocked", state: "SEALED BY EVENT" },
              { label: "Chapter sealed / opened", state: "SEALED BY EVENT" },
              { label: "Protocol Chronicle", state: "SEALED — SEASON CLOSE" },
            ].map(({ label, state }) => (
              <li key={label} className="flex items-center justify-between gap-3 border border-border/40 rounded-md px-3 py-2">
                <span className="text-foreground/90">{label}</span>
                <span className={`mono text-[10px] uppercase tracking-[0.18em] ${state === "LIVE" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>{state}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-border/40 pt-4">
            <ArchiveStatusLegend variant="inline" />
          </div>
          <div className="mt-5 border-t border-border/40 pt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              SYN is the seat. Artifacts are the memory.
            </p>
            <Link
              to="/archive"
              className="mono text-[11px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Explore the Archive →
            </Link>
          </div>
        </GlassCard>
      </Section>
    <RouteFinalCTA preset="verify" />
    </PageShell>
  );
}
