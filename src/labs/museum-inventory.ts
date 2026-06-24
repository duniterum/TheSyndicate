// src/labs/museum-inventory.ts
// Shared catalog for the two INTERNAL labs surfaces:
//   • /labs/design-museum   — visual archive (renders safe widgets live)
//   • /labs/component-index  — technical status index (no rendering)
//
// This file is a PRESERVATION + SELECTION tool, not a production feature.
// It NEVER deletes or mounts anything in product. It documents what exists,
// where it lives, whether it is mounted, and whether it is worth reusing.
//
// Source-of-truth notes:
//   • Labs component classifications mirror src/labs/registry.ts (LABS/ARCHIVE/
//     DEPRECATED). This file adds museum metadata (category, why, reuse, risk).
//   • Mounted production components + dead exports are added manually.

export type MuseumStatus = "mounted" | "lab" | "dead" | "deprecated";
export type LabClass = "LABS" | "ARCHIVE" | "DEPRECATED";
export type ReuseRec = "use" | "rewrite" | "archive" | "ignore";

/** Provenance label shown on a rendered preview frame so nothing reads as live. */
export type PreviewLabel = "LAB" | "ARCHIVE" | "DEPRECATED" | "FIXTURE";

export type MuseumCategory =
  | "Cockpit / Member OS"
  | "Archive / NFT / Artifact"
  | "Story / Chronicle / Episode"
  | "Growth / Referral / Reputation"
  | "Proof / Transparency"
  | "Legacy Museum / Lab"
  | "Deprecated-but-interesting";

export interface MuseumWidget {
  /** Display name (matches the named export unless `exportName` is set). */
  name: string;
  /** File path, repo-relative. */
  source: string;
  /** Named export, when it differs from `name` (e.g. Sections.tsx, route files). */
  exportName?: string;
  category: MuseumCategory;
  status: MuseumStatus;
  /** Registry classification for lab/deprecated items. */
  labClass?: LabClass;
  /** Why it may be useful / worth preserving. */
  why: string;
  /** Reuse recommendation. */
  reuse: ReuseRec;
  /** Risk note: fake data, stale copy, or wrong doctrine. */
  risk?: string;
  /** When true, /labs/design-museum renders it live (mounted-gate + boundary). */
  renderable?: boolean;
  /** Provenance label for the rendered preview frame. */
  previewLabel?: PreviewLabel;
  /** When NOT renderable, what the widget needs to render (explains placeholder). */
  needs?: string;
  /** Canonical/sibling concept this duplicates. */
  duplicateOf?: string;
  /** Fixture data location, if any. */
  fixture?: string;
}

export const MUSEUM_CATEGORIES: MuseumCategory[] = [
  "Cockpit / Member OS",
  "Archive / NFT / Artifact",
  "Story / Chronicle / Episode",
  "Growth / Referral / Reputation",
  "Proof / Transparency",
  "Legacy Museum / Lab",
  "Deprecated-but-interesting",
];

export const MUSEUM_WIDGETS: MuseumWidget[] = [
  // ─── Cockpit / Member OS ────────────────────────────────────────────────
  {
    name: "MemberCockpitCandidate",
    source: "src/labs/components/MemberCockpitCandidate.tsx",
    category: "Cockpit / Member OS",
    status: "lab",
    labClass: "ARCHIVE",
    why: "v1 story-first cockpit layout — reference for an alternate Member-OS ordering.",
    reuse: "archive",
    needs: "Wallet + Holder Index + Protocol Truth context",
    fixture: "src/lib/dev/cockpit-fixtures.ts",
    duplicateOf: "MemberCockpit (prod /my-syndicate v2)",
    risk: "Superseded by v2 Member-OS ordering; do not re-promote as-is.",
  },
  {
    name: "SinceYourLastVisit",
    source: "src/components/syndicate/SinceYourLastVisit.tsx",
    category: "Cockpit / Member OS",
    status: "mounted",
    why: "Return-loop 'what changed since you left' recap.",
    reuse: "use",
    needs: "Last-visit context",
    duplicateOf: "WhatChangedForYou",
  },
  {
    name: "SinceLastVisitStory",
    source: "src/components/syndicate/SinceLastVisitStory.tsx",
    category: "Cockpit / Member OS",
    status: "mounted",
    why: "Narrative variant of the since-last-visit recap.",
    reuse: "rewrite",
    needs: "Last-visit context",
    duplicateOf: "WhatChangedForYou",
    risk: "Concept overlaps WhatChangedForYou + SinceYourLastVisit — consolidate to one.",
  },
  {
    name: "WhatChangedForYou",
    source: "src/components/syndicate/WhatChangedForYou.tsx",
    category: "Cockpit / Member OS",
    status: "mounted",
    why: "Personalized member delta surfaced on return.",
    reuse: "use",
    needs: "Wallet + last-visit + Holder Index context",
    risk: "Throws to its error boundary in DEV during wallet resync (known dev-only Vite dual-dispatcher noise) — fine in prod.",
  },
  {
    name: "RankHub",
    source: "src/components/syndicate/RankHub.tsx",
    category: "Cockpit / Member OS",
    status: "mounted",
    why: "Member rank surface — structural recognition (non-wealth).",
    reuse: "use",
    needs: "Wallet + Holder Index context",
    duplicateOf: "RankIntelligence / HomeRankLadder",
  },
  {
    name: "SeatRecordPanel",
    source: "src/components/syndicate/SeatRecordPanel.tsx",
    category: "Cockpit / Member OS",
    status: "mounted",
    why: "Canonical seat record (Seat ≠ Seat Record).",
    reuse: "use",
    needs: "Wallet + Holder Index context",
  },
  {
    name: "ActivityHeartbeat",
    source: "src/components/syndicate/ActivityHeartbeat.tsx",
    category: "Cockpit / Member OS",
    status: "mounted",
    why: "Live protocol pulse ribbon (event freshness).",
    reuse: "use",
    needs: "Wallet + purchase-events query",
    duplicateOf: "LiveRecencyStrip",
  },
  {
    name: "MemberJourney",
    source: "src/labs/components/MemberJourney.tsx",
    category: "Cockpit / Member OS",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Early member-journey card — onboarding-progress pattern.",
    reuse: "rewrite",
    needs: "Holder Index context",
    risk: "Superseded by MemberCard + /members.",
  },

  // ─── Archive / NFT / Artifact ───────────────────────────────────────────
  {
    name: "MythologyWall",
    source: "src/components/syndicate/MythologyWall.tsx",
    category: "Archive / NFT / Artifact",
    status: "mounted",
    why: "Canonical 9-slot Acts I–III NFT mythology map.",
    reuse: "use",
    renderable: true,
    previewLabel: "LAB",
  },
  {
    name: "ArchiveMuseumHero",
    source: "src/components/syndicate/ArchiveMuseumHero.tsx",
    category: "Archive / NFT / Artifact",
    status: "mounted",
    why: "Museum hero used on the archive page.",
    reuse: "use",
    renderable: true,
    previewLabel: "LAB",
  },
  {
    name: "MyArchivePreview",
    source: "src/components/syndicate/MyArchivePreview.tsx",
    category: "Archive / NFT / Artifact",
    status: "mounted",
    why: "Member's owned-artifact preview teaser.",
    reuse: "use",
    needs: "Wallet + archive-balances query",
    fixture: "src/lib/dev/cockpit-fixtures.ts",
  },
  {
    name: "ArtifactUniverseBoard",
    source: "src/labs/components/ArtifactUniverseBoard.tsx",
    category: "Archive / NFT / Artifact",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Legacy 6-family NFT map — wide catalog layout pattern.",
    reuse: "archive",
    needs: "Archive-mints query",
    duplicateOf: "MythologyWall",
    risk: "Old 6-family catalog model; superseded by MythologyWall (9-slot).",
  },
  {
    name: "FutureCollectorView",
    source: "src/labs/components/FutureCollectorView.tsx",
    category: "Archive / NFT / Artifact",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Collector filter chrome — reusable filter/sort pattern.",
    reuse: "archive",
    renderable: true,
    previewLabel: "ARCHIVE",
    risk: "Legacy operator-status filter; superseded by MythologyWall. Renders disconnected.",
  },
  {
    name: "GenesisNFTProgress",
    source: "src/components/syndicate/Sections.tsx",
    exportName: "GenesisNFTProgress",
    category: "Archive / NFT / Artifact",
    status: "dead",
    why: "Genesis mint-progress bar — supply-progress UI pattern.",
    reuse: "archive",
    renderable: true,
    previewLabel: "DEPRECATED",
    risk: "STALE Genesis copy / old supply model — must NOT be surfaced in product as-is.",
  },
  {
    name: "DayOneArchive",
    source: "src/components/syndicate/Sections.tsx",
    exportName: "DayOneArchive",
    category: "Archive / NFT / Artifact",
    status: "dead",
    why: "Day-one archive concept block.",
    reuse: "archive",
    renderable: true,
    previewLabel: "DEPRECATED",
    risk: "Dead/unmounted; verify copy against current doctrine before any reuse.",
  },

  // ─── Story / Chronicle / Episode ────────────────────────────────────────
  {
    name: "ProtocolStorySoFar",
    source: "src/components/syndicate/ProtocolStorySoFar.tsx",
    category: "Story / Chronicle / Episode",
    status: "mounted",
    why: "Canonical 'story so far' timeline.",
    reuse: "use",
    needs: "Purchase-events query",
  },
  {
    name: "ActivityMilestones",
    source: "src/components/syndicate/ActivityMilestones.tsx",
    category: "Story / Chronicle / Episode",
    status: "mounted",
    why: "Protocol milestone timeline.",
    reuse: "use",
    renderable: true,
    previewLabel: "LAB",
  },
  {
    name: "HomeJourney",
    source: "src/labs/components/HomeJourney.tsx",
    category: "Story / Chronicle / Episode",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Early homepage journey strip — narrative-arc pattern.",
    reuse: "rewrite",
    renderable: true,
    previewLabel: "ARCHIVE",
    duplicateOf: "ProtocolStorySoFar",
  },
  {
    name: "HowItWorks30s",
    source: "src/labs/components/HowItWorks30s.tsx",
    category: "Story / Chronicle / Episode",
    status: "lab",
    labClass: "ARCHIVE",
    why: "30-second 3-step explainer — clean onboarding copy + layout.",
    reuse: "rewrite",
    renderable: true,
    previewLabel: "ARCHIVE",
    duplicateOf: "HowToJoinSteps",
  },
  {
    name: "WhatSynDoes",
    source: "src/labs/components/WhatSynDoes.tsx",
    category: "Story / Chronicle / Episode",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Early token explainer copy.",
    reuse: "archive",
    renderable: true,
    previewLabel: "ARCHIVE",
    duplicateOf: "IdentityZone / TokenIntro",
  },
  {
    name: "WhyTheSyndicateExists",
    source: "src/labs/components/WhyTheSyndicateExists.tsx",
    category: "Story / Chronicle / Episode",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Mission/why-we-exist narrative.",
    reuse: "archive",
    renderable: true,
    previewLabel: "ARCHIVE",
    duplicateOf: "WhyJoinSimple",
  },
  {
    name: "WhyComeBackTomorrow",
    source: "src/components/syndicate/Sections.tsx",
    exportName: "WhyComeBackTomorrow",
    category: "Story / Chronicle / Episode",
    status: "dead",
    why: "Return-reason explainer — strong retention copy.",
    reuse: "rewrite",
    renderable: true,
    previewLabel: "DEPRECATED",
    risk: "Dead/unmounted; re-check copy against current doctrine before reuse.",
  },
  {
    name: "StartHereCard",
    source: "src/labs/components/StartHereCard.tsx",
    category: "Story / Chronicle / Episode",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Early onboarding entry card.",
    reuse: "archive",
    renderable: true,
    previewLabel: "ARCHIVE",
    duplicateOf: "IdentityZone",
  },
  {
    name: "MilestoneTracker",
    source: "src/labs/components/MilestoneTracker.tsx",
    category: "Story / Chronicle / Episode",
    status: "lab",
    labClass: "LABS",
    why: "Past-milestone timeline — candidate for a future /timeline page.",
    reuse: "rewrite",
    needs: "Purchase-events query",
    duplicateOf: "ProtocolMoments",
  },

  // ─── Growth / Referral / Reputation ─────────────────────────────────────
  {
    name: "HomeRankLadder",
    source: "src/labs/components/HomeRankLadder.tsx",
    category: "Growth / Referral / Reputation",
    status: "lab",
    labClass: "LABS",
    why: "Compact rank-ladder widget pattern.",
    reuse: "rewrite",
    renderable: true,
    previewLabel: "LAB",
    duplicateOf: "RankHub",
  },
  {
    name: "RankIntelligence",
    source: "src/labs/components/RankIntelligence.tsx",
    category: "Growth / Referral / Reputation",
    status: "lab",
    labClass: "LABS",
    why: "Rank explainer with analytics — possible /ranks/intelligence subroute.",
    reuse: "rewrite",
    needs: "Leaderboard query",
    duplicateOf: "RankHub",
  },
  {
    name: "HomeShareCTA",
    source: "src/labs/components/HomeShareCTA.tsx",
    category: "Growth / Referral / Reputation",
    status: "lab",
    labClass: "LABS",
    why: "Share CTA — preserved for the deferred share-intents wave.",
    reuse: "use",
    renderable: true,
    previewLabel: "LAB",
    risk: "Renders disconnected (wallet-gated share intent).",
  },
  {
    name: "ShareableCards",
    source: "src/labs/components/ShareableCards.tsx",
    exportName: "MemberCard, ProtocolSnapshots",
    category: "Growth / Referral / Reputation",
    status: "lab",
    labClass: "LABS",
    why: "Generated share-card system — large prior investment, high reuse value.",
    reuse: "use",
    needs: "Wallet + sale/LP/treasury queries",
  },
  {
    name: "MembersLeaderboard",
    source: "src/labs/components/MembersLeaderboard.tsx",
    category: "Growth / Referral / Reputation",
    status: "deprecated",
    labClass: "DEPRECATED",
    why: "Wealth-ranked member list — preserved only to keep the deletion auditable.",
    reuse: "ignore",
    needs: "Leaderboard query",
    risk: "Violates VISION (no wealth-only rankings). Do not re-promote.",
  },
  {
    name: "QuestProgress",
    source: "src/labs/components/QuestProgress.tsx",
    category: "Growth / Referral / Reputation",
    status: "deprecated",
    labClass: "DEPRECATED",
    why: "Quest gamification stub — audit reference only.",
    reuse: "ignore",
    needs: "Quests query",
    risk: "Violates VISION (no empty gamification). Do not re-promote.",
  },

  // ─── Proof / Transparency ───────────────────────────────────────────────
  {
    name: "NeighboursStrip",
    source: "src/routes/wallet.$address.tsx",
    exportName: "NeighboursStrip",
    category: "Proof / Transparency",
    status: "mounted",
    why: "Co-witness neighbours strip (seats N±1).",
    reuse: "use",
    needs: "Props (neighbour list) — exported from a route file, not standalone",
  },
  {
    name: "ProtocolRevenueEngine",
    source: "src/labs/components/ProtocolRevenueEngine.tsx",
    category: "Proof / Transparency",
    status: "lab",
    labClass: "LABS",
    why: "Revenue routing diagram — depth view for /transparency.",
    reuse: "use",
    needs: "Sale-stats query",
    duplicateOf: "RoutingFlow + LpStatusCard",
  },
  {
    name: "CapitalAllocation",
    source: "src/labs/components/CapitalAllocation.tsx",
    category: "Proof / Transparency",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Early treasury allocation card.",
    reuse: "archive",
    needs: "Treasury query",
    duplicateOf: "UseOfFunds",
  },
  {
    name: "ProtocolStatusGrid",
    source: "src/labs/components/ProtocolStatusGrid.tsx",
    category: "Proof / Transparency",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Earlier truth-pill grid.",
    reuse: "archive",
    needs: "Protocol-truth query",
    duplicateOf: "LivePulseStrip + Protocol Truth pills",
  },
  {
    name: "SmartContractFlow",
    source: "src/labs/components/SmartContractFlow.tsx",
    category: "Proof / Transparency",
    status: "lab",
    labClass: "LABS",
    why: "Interactive contract-call sequence diagram — reusable for /docs.",
    reuse: "use",
    renderable: true,
    previewLabel: "LAB",
    duplicateOf: "RoutingFlow",
  },
  {
    name: "LiveRecencyStrip",
    source: "src/labs/components/LiveRecencyStrip.tsx",
    category: "Proof / Transparency",
    status: "lab",
    labClass: "LABS",
    why: "Activity recency ribbon — dedicated recency surface candidate.",
    reuse: "archive",
    needs: "Purchase-events query",
    duplicateOf: "LivePulseStrip / ActivityHeartbeat",
  },
  {
    name: "MarketDashboard",
    source: "src/labs/components/MarketDashboard.tsx",
    category: "Proof / Transparency",
    status: "lab",
    labClass: "LABS",
    why: "DEX/market chart UI — kept in case we self-host a chart later.",
    reuse: "archive",
    needs: "LP-stats query",
  },

  // ─── Legacy Museum / Lab ───────────────────────────────────────────────
  {
    name: "ProtocolFlywheel",
    source: "src/labs/components/ProtocolFlywheel.tsx",
    category: "Legacy Museum / Lab",
    status: "lab",
    labClass: "LABS",
    why: "Flywheel diagram — useful explainer for a future /how-it-works page.",
    reuse: "use",
    needs: "Unverified deps — preview deferred",
  },
  {
    name: "ProtocolOverview",
    source: "src/labs/components/ProtocolOverview.tsx",
    category: "Legacy Museum / Lab",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Pre-IdentityZone overview block.",
    reuse: "archive",
    duplicateOf: "IdentityZone + StorySoFar",
  },
  {
    name: "HomeMetricsStrip",
    source: "src/labs/components/HomeMetricsStrip.tsx",
    category: "Legacy Museum / Lab",
    status: "lab",
    labClass: "LABS",
    why: "Homepage metric tiles — pattern for a future /metrics page.",
    reuse: "archive",
    duplicateOf: "Loop A/B counters",
  },
  {
    name: "HomeJoinPreview",
    source: "src/labs/components/HomeJoinPreview.tsx",
    category: "Legacy Museum / Lab",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Early home → /join preview.",
    reuse: "archive",
    duplicateOf: "HowToJoinSteps + /join",
  },
  {
    name: "HomeAllocationPreview",
    source: "src/labs/components/HomeAllocationPreview.tsx",
    category: "Legacy Museum / Lab",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Early home allocation card.",
    reuse: "archive",
    duplicateOf: "HomeTransparencySnapshot",
  },

  // ─── Deprecated-but-interesting ─────────────────────────────────────────
  {
    name: "OpportunitySection",
    source: "src/labs/components/OpportunitySection.tsx",
    category: "Deprecated-but-interesting",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Pre-VISION opportunity CTA — strong layout, retired copy.",
    reuse: "archive",
    renderable: true,
    previewLabel: "ARCHIVE",
    duplicateOf: "WhyJoinSimple",
    risk: "Pre-VISION opportunity framing — re-check doctrine before any reuse.",
  },
  {
    name: "RankSimulator",
    source: "src/labs/components/RankSimulator.tsx",
    category: "Deprecated-but-interesting",
    status: "deprecated",
    labClass: "DEPRECATED",
    why: "Future-rank projection UI — interaction pattern only.",
    reuse: "ignore",
    renderable: true,
    previewLabel: "DEPRECATED",
    risk: "Violates VISION (speculative/wealth projection). Preview for audit only; do not re-promote.",
  },
  {
    name: "WhyBecomeMember",
    source: "src/labs/components/WhyBecomeMember.tsx",
    category: "Deprecated-but-interesting",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Pre-WhyJoinSimple copy variant.",
    reuse: "archive",
    duplicateOf: "WhyJoinSimple",
  },
  {
    name: "WhyDifferent",
    source: "src/labs/components/WhyDifferent.tsx",
    category: "Deprecated-but-interesting",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Pre-WhyJoinSimple copy variant.",
    reuse: "archive",
    duplicateOf: "WhyJoinSimple",
  },
  {
    name: "WhyEarlyMatters",
    source: "src/labs/components/WhyEarlyMatters.tsx",
    category: "Deprecated-but-interesting",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Pre-WhyJoinSimple copy variant.",
    reuse: "archive",
    duplicateOf: "WhyJoinSimple",
  },
  {
    name: "WhyJoinNow",
    source: "src/labs/components/WhyJoinNow.tsx",
    category: "Deprecated-but-interesting",
    status: "lab",
    labClass: "ARCHIVE",
    why: "Pre-WhyJoinSimple copy variant.",
    reuse: "archive",
    duplicateOf: "WhyJoinSimple",
  },
];

// ── Derived helpers ───────────────────────────────────────────────────────

export function widgetsByCategory(c: MuseumCategory): MuseumWidget[] {
  return MUSEUM_WIDGETS.filter((w) => w.category === c);
}

export type IndexBucket =
  | "Mounted in product"
  | "Hidden / lab only"
  | "Dead / unmounted"
  | "Duplicate concepts"
  | "Candidates to reuse"
  | "Candidates to rewrite"
  | "Keep archived only";

export const INDEX_BUCKETS: IndexBucket[] = [
  "Mounted in product",
  "Hidden / lab only",
  "Dead / unmounted",
  "Duplicate concepts",
  "Candidates to reuse",
  "Candidates to rewrite",
  "Keep archived only",
];

export function bucketMatch(w: MuseumWidget, bucket: IndexBucket): boolean {
  switch (bucket) {
    case "Mounted in product":
      return w.status === "mounted";
    case "Hidden / lab only":
      return w.status === "lab";
    case "Dead / unmounted":
      return w.status === "dead";
    case "Duplicate concepts":
      return Boolean(w.duplicateOf);
    case "Candidates to reuse":
      return w.reuse === "use";
    case "Candidates to rewrite":
      return w.reuse === "rewrite";
    case "Keep archived only":
      return w.reuse === "archive" || w.status === "deprecated";
  }
}

export const MUSEUM_STATS = {
  total: MUSEUM_WIDGETS.length,
  renderable: MUSEUM_WIDGETS.filter((w) => w.renderable).length,
  mounted: MUSEUM_WIDGETS.filter((w) => w.status === "mounted").length,
  lab: MUSEUM_WIDGETS.filter((w) => w.status === "lab").length,
  dead: MUSEUM_WIDGETS.filter((w) => w.status === "dead").length,
  deprecated: MUSEUM_WIDGETS.filter((w) => w.status === "deprecated").length,
};
