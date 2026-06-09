// src/labs/registry.ts
// Quarantined component classification per docs/P6_IMPLEMENTATION_AND_ARCHIVE_REPORT.md.
// Components here are NOT mounted in production routes. They live under
// src/labs/components/ and are reachable only through the noindex /labs page.
//
// Classification (from the AAA Archive Safety Net rule):
//   PUBLIC     — active production surface (NOT in this registry)
//   LABS       — not public, potentially useful later, may be re-promoted
//   ARCHIVE    — historical reference, preserved as institutional memory
//   DEPRECATED — safe to remove permanently (violates VISION guardrails)
//
// Rule: never permanently delete a quarantined component unless DEPRECATED.

export type LabsClass = "LABS" | "ARCHIVE" | "DEPRECATED";

export interface LabsEntry {
  /** Filename without extension under src/labs/components/. */
  name: string;
  classification: LabsClass;
  /** Why it was removed from the homepage / production route tree. */
  reason: string;
  /** What pillar / loop / surface it once served. */
  origin: string;
}

export const LABS_REGISTRY: LabsEntry[] = [
  // ─── LABS — may revisit ────────────────────────────────────────────────
  { name: "HomeMetricsStrip",       classification: "LABS",     origin: "Homepage metrics tiles",        reason: "Demoted from homepage per P6; tiles duplicated Loop A/B counters. Useful pattern for a future /metrics page." },
  { name: "HomeRankLadder",         classification: "LABS",     origin: "Homepage rank preview",         reason: "Demoted from homepage (rank ladder owns /ranks). Pattern reusable for a compact rank widget." },
  { name: "MarketDashboard",        classification: "LABS",     origin: "DEX/market ticker",             reason: "Replaced by a static DexScreener link. Component preserved in case we self-host a chart later." },
  { name: "MilestoneTracker",       classification: "LABS",     origin: "Past milestone timeline",       reason: "Replaced on homepage by ProtocolMoments. Preserve until we decide whether /timeline page is built." },
  { name: "LiveRecencyStrip",       classification: "LABS",     origin: "Activity recency ribbon",       reason: "Collapsed into LivePulseStrip. Preserve in case we want a dedicated recency surface." },
  { name: "RankIntelligence",       classification: "LABS",     origin: "Rank explainer w/ analytics",   reason: "Heavy module not needed on homepage; may anchor a future /ranks/intelligence subroute." },
  { name: "ShareableCards",         classification: "LABS",     origin: "Generated share-card system",   reason: "Share intents currently deferred (Wave 3B gate). Preserve the generator — large prior investment." },
  { name: "HomeShareCTA",           classification: "LABS",     origin: "Homepage share CTA",            reason: "Awaiting share intents wave. Preserve to avoid re-designing the CTA later." },
  { name: "ProtocolFlywheel",       classification: "LABS",     origin: "Flywheel diagram",              reason: "Useful explainer for a future /how-it-works page." },
  { name: "ProtocolRevenueEngine",  classification: "LABS",     origin: "Revenue routing diagram",       reason: "Superseded on production by RoutingFlow + LpStatusCard. Preserve for /transparency depth view." },
  { name: "SmartContractFlow",      classification: "LABS",     origin: "Contract-call sequence diagram",reason: "Superseded by RoutingFlow but the sequence-diagram pattern is reusable for /docs." },

  // ─── ARCHIVE — historical reference ────────────────────────────────────
  { name: "HomeJourney",            classification: "ARCHIVE",  origin: "Early homepage journey strip",  reason: "Superseded by StorySoFar. Kept as a record of the journey-strip iteration." },
  { name: "HomeJoinPreview",        classification: "ARCHIVE",  origin: "Early home → /join preview",    reason: "Superseded by HowToJoinSteps + /join route." },
  { name: "HomeAllocationPreview",  classification: "ARCHIVE",  origin: "Early home allocation card",    reason: "Superseded by HomeTransparencySnapshot." },
  { name: "HowItWorks30s",          classification: "ARCHIVE",  origin: "30-second explainer",           reason: "Superseded by HowToJoinSteps." },
  { name: "MemberJourney",          classification: "ARCHIVE",  origin: "Early member journey card",     reason: "Superseded by MemberCard + /members route." },
  { name: "OpportunitySection",     classification: "ARCHIVE",  origin: "Pre-VISION opportunity CTA",    reason: "Superseded by WhyJoinSimple." },
  { name: "ProtocolOverview",       classification: "ARCHIVE",  origin: "Pre-IdentityZone overview",     reason: "Superseded by IdentityZone + StorySoFar." },
  { name: "ProtocolStatusGrid",     classification: "ARCHIVE",  origin: "Earlier truth-pill grid",       reason: "Superseded by LivePulseStrip + Protocol Truth Layer pills." },
  { name: "StartHereCard",          classification: "ARCHIVE",  origin: "Early onboarding card",         reason: "Role taken by IdentityZone." },
  { name: "WhatSynDoes",            classification: "ARCHIVE",  origin: "Early token explainer",         reason: "Superseded by IdentityZone + TokenIntro." },
  { name: "WhyBecomeMember",        classification: "ARCHIVE",  origin: "Pre-WhyJoinSimple variant",     reason: "Consolidated into WhyJoinSimple." },
  { name: "WhyDifferent",           classification: "ARCHIVE",  origin: "Pre-WhyJoinSimple variant",     reason: "Consolidated into WhyJoinSimple." },
  { name: "WhyEarlyMatters",        classification: "ARCHIVE",  origin: "Pre-WhyJoinSimple variant",     reason: "Consolidated into WhyJoinSimple." },
  { name: "WhyJoinNow",             classification: "ARCHIVE",  origin: "Pre-WhyJoinSimple variant",     reason: "Consolidated into WhyJoinSimple." },
  { name: "WhyTheSyndicateExists",  classification: "ARCHIVE",  origin: "Pre-WhyJoinSimple variant",     reason: "Consolidated into WhyJoinSimple." },
  { name: "CapitalAllocation",      classification: "ARCHIVE",  origin: "Early treasury allocation card",reason: "Superseded by UseOfFunds." },
  { name: "ArtifactUniverseBoard",  classification: "ARCHIVE",  origin: "Legacy 6-family NFT map",       reason: "Superseded by MythologyWall (9-slot Acts I–III). Quarantined 2026-06-08 to remove old catalog model from public surfaces." },
  { name: "FutureCollectorView",    classification: "ARCHIVE",  origin: "Preview-only collector filters",reason: "Superseded by MythologyWall. Quarantined 2026-06-08 — legacy operator-status filter chrome." },
  { name: "MemberCockpitCandidate", classification: "ARCHIVE",  origin: "/my-syndicate cockpit (v1 story-first layout)", reason: "Superseded by /my-syndicate v2 (Member Operating System ordering: Seat → Assets → Activity → Sealing → Chronicle → Growth → Horizon → Context). Kept as historical reference for the v1 cockpit pattern; do not re-promote." },

  // ─── DEPRECATED — violates VISION; will not be re-promoted ─────────────
  { name: "MembersLeaderboard",     classification: "DEPRECATED", origin: "Wealth-ranked member list", reason: "Violates VISION (no wealth-only rankings). Preserved only to make the deletion auditable; do not re-promote." },
  { name: "RankSimulator",          classification: "DEPRECATED", origin: "Future-rank projection",    reason: "Violates VISION (no speculative/wealth projection). Preserved for audit; do not re-promote." },
  { name: "QuestProgress",          classification: "DEPRECATED", origin: "Quest gamification stub",   reason: "Violates VISION (no empty gamification). Preserved for audit; do not re-promote." },
];

export function entriesByClass(c: LabsClass): LabsEntry[] {
  return LABS_REGISTRY.filter((e) => e.classification === c);
}
