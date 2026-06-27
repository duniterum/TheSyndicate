// THE SYNDICATE — PROTOCOL GRAPH ("the nervous system").
//
// This module is the shared read-model that connects the organs of the Product OS so
// they talk to each other instead of being isolated pages. It encodes HOW a protocol
// signal flows from a raw on-chain/protocol event all the way to public, shareable
// memory, and WHERE each step surfaces in the app.
//
// TRUTH POSTURE
// - Canonical truths are accurate: routing is 70/20/10, ZERO_SOURCE_ID is the default
//   source, the doctrine line is verbatim, and module live/future statuses match the repo.
// - Every concrete instance below (specific events, candidates, chronicle entries,
//   contributor standing) is SIMULATED prototype data. Nothing here reads a live chain,
//   posts anything, or executes an action.
//
// ORGAN DISTINCTIONS (these are deliberately NOT the same thing):
//   Activity      = heartbeat (every verifiable event)
//   Evolution     = series (module progression over time)
//   Chronicle     = curated canon (selective institutional history)
//   Archive       = memory object (ERC-1155 artifact)
//   Registry      = proof (contract truth)
//   Transparency  = capital truth (economy)
//   My Syndicate  = personal return surface
//   Founder Console = control room (approves what becomes canon/public)
//   Shareability  = external propagation

import { MOCK_DATA, ROUTING_SPLIT } from "./mock-data";

export type DataSource = "canonical" | "simulated" | "future";

// The linear backbone every signal can travel. Branches (classifications) hang off the
// "candidate" stage — not everything reaches every later stage.
export type PipelineStage =
  | "raw-event"
  | "activity"
  | "candidate"
  | "memory"
  | "share"
  | "founder-review"
  | "public-update";

export interface PipelineNode {
  stage: PipelineStage;
  title: string;
  subtitle: string;
  organ: string;
  surface: string;
  source: DataSource;
}

// The visual nervous-system backbone. Used by the Protocol Graph page.
export const PIPELINE: PipelineNode[] = [
  {
    stage: "raw-event",
    title: "Raw Event",
    subtitle: "A protocol signal occurs — a membership routes, an artifact anchors, a module changes state.",
    organ: "Protocol",
    surface: "/member/registry",
    source: "canonical",
  },
  {
    stage: "activity",
    title: "Activity",
    subtitle: "The heartbeat. Every verifiable event becomes a readable entry. Read-only, not curated.",
    organ: "Activity",
    surface: "/member/activity",
    source: "simulated",
  },
  {
    stage: "candidate",
    title: "Candidate Review",
    subtitle: "An event is classified. It may become recognition, an evolution episode, chronicle canon, or archive memory — or stay heartbeat only.",
    organ: "Graph",
    surface: "/member/graph",
    source: "simulated",
  },
  {
    stage: "memory",
    title: "Memory",
    subtitle: "Selected history is preserved — as curated Chronicle canon or as an Archive memory object.",
    organ: "Chronicle / Archive",
    surface: "/member/chronicle",
    source: "simulated",
  },
  {
    stage: "share",
    title: "Share Card",
    subtitle: "Proof becomes beautiful and portable. Memory can be witnessed outside the app.",
    organ: "Shareability",
    surface: "/share",
    source: "simulated",
  },
  {
    stage: "founder-review",
    title: "Founder Review",
    subtitle: "The control room. Nothing becomes canon or public truth without operator approval.",
    organ: "Founder Console",
    surface: "/member/founder-review",
    source: "simulated",
  },
  {
    stage: "public-update",
    title: "Public Update",
    subtitle: "Approved history reaches the public surface and press kit. Selective, never automatic.",
    organ: "Press",
    surface: "/press",
    source: "simulated",
  },
];

// The branches that hang off Candidate Review. Each has its own organ + rules.
export type Classification = "recognition" | "evolution" | "chronicle" | "archive" | "share" | "fire";

export interface ClassificationDef {
  key: Classification;
  title: string;
  organ: string;
  surface: string;
  rule: string;
  source: DataSource;
}

export const CLASSIFICATIONS: ClassificationDef[] = [
  {
    key: "recognition",
    title: "Recognition Candidate",
    organ: "Recognition Board",
    surface: "/member/recognition",
    rule: "Proof-backed contribution across an axis. Never a wealth ranking, never a reward.",
    source: "simulated",
  },
  {
    key: "evolution",
    title: "Evolution Episode",
    organ: "Evolution",
    surface: "/member/evolution",
    rule: "A module crossing a state boundary. The series of what became true.",
    source: "simulated",
  },
  {
    key: "chronicle",
    title: "Chronicle Candidate",
    organ: "Chronicle",
    surface: "/member/chronicle",
    rule: "Historically meaningful. Requires founder approval to enter canon. Most events never qualify.",
    source: "simulated",
  },
  {
    key: "archive",
    title: "Archive Memory Candidate",
    organ: "Archive",
    surface: "/member/archive",
    rule: "Becomes a permanent memory object (ERC-1155). Memory, not financial rights.",
    source: "simulated",
  },
  {
    key: "share",
    title: "Share Card",
    organ: "Shareability",
    surface: "/share",
    rule: "Any preserved proof can become a portable card. Witness loop, no hype.",
    source: "simulated",
  },
  {
    key: "fire",
    title: "Proof of Fire Candidate",
    organ: "Fire Ledger",
    surface: "/member/fire",
    rule: "A proposed SYN burn — supply retired as a costly signal. Never minting, never a price promise, never yield. Founder-gated and simulated in this prototype.",
    source: "future",
  },
];

export type FounderDecision = "n/a" | "pending" | "approved" | "declined" | "never";

export interface ProtocolEvent {
  id: string;
  title: string;
  origin: string; // the canonical raw signal
  activityRef?: number; // links to MOCK_DATA.activities id (heartbeat source)
  classifications: Classification[]; // which branches this event feeds
  stage: PipelineStage; // furthest stage reached
  founderDecision: FounderDecision;
  source: DataSource;
  note: string;
}

// Simulated events flowing through the graph. activityRef ties each back to the heartbeat.
export const PROTOCOL_EVENTS: ProtocolEvent[] = [
  {
    id: "evt-genesis-engine",
    title: "Membership V3 Engine activated",
    origin: "MembershipSaleV3 deployed and accepting USDC",
    activityRef: 10,
    classifications: ["evolution", "chronicle", "archive"],
    stage: "public-update",
    founderDecision: "approved",
    source: "simulated",
    note: "Became canon: the institution's first verifiable engine. Anchored as a memory object.",
  },
  {
    id: "evt-transparency-live",
    title: "Activity & Transparency feeds live",
    origin: "Indexer began publishing verifiable routing + entry events",
    activityRef: 8,
    classifications: ["evolution", "chronicle"],
    stage: "memory",
    founderDecision: "approved",
    source: "simulated",
    note: "Canon entry: the protocol learned to speak in public.",
  },
  {
    id: "evt-archive-anchor",
    title: "Genesis Signal artifact anchored",
    origin: "Archive1155 anchored a memory artifact for an early seat",
    activityRef: 5,
    classifications: ["archive", "share"],
    stage: "share",
    founderDecision: "n/a",
    source: "simulated",
    note: "Memory object created. Eligible to travel as a share card.",
  },
  {
    id: "evt-membership-150",
    title: "Membership receipt — 150 USDC routed",
    origin: "MembershipPurchased event, routed 70% / 20% / 10%",
    activityRef: 1,
    classifications: ["recognition", "share"],
    stage: "share",
    founderDecision: "n/a",
    source: "simulated",
    note: "Heartbeat + recognition signal (Capital axis). Receipt is shareable proof.",
  },
  {
    id: "evt-source-paused",
    title: "Source Registry paused",
    origin: "SourceRegistryV1 set to paused; default remains ZERO_SOURCE_ID",
    activityRef: 9,
    classifications: ["evolution"],
    stage: "candidate",
    founderDecision: "pending",
    source: "simulated",
    note: "Evolution-relevant only. Not chronicle canon — a state toggle, not history.",
  },
  {
    id: "evt-intro-candidate",
    title: "Verified Introduction (V1 candidate)",
    origin: "Manual, invite-only source attribution scoped for MembershipSaleV3",
    classifications: ["recognition", "evolution"],
    stage: "candidate",
    founderDecision: "pending",
    source: "future",
    note: "Recognition (Connector axis) once live. Not active publicly. No source link today.",
  },
  {
    id: "evt-routing-vault",
    title: "Vault allocation recorded",
    origin: "70% of a membership routed to the Vault endpoint",
    activityRef: 2,
    classifications: [],
    stage: "activity",
    founderDecision: "never",
    source: "simulated",
    note: "Pure heartbeat. Important for transparency, but never chronicle canon on its own.",
  },
  {
    id: "evt-fire-founder",
    title: "Founder burn proposed — Genesis chapter",
    origin: "A Proof-of-Fire proposal to retire SYN supply as a costly chapter signal",
    classifications: ["fire", "chronicle", "archive"],
    stage: "candidate",
    founderDecision: "pending",
    source: "future",
    note: "Supply retired, nothing minted, no price promise. Simulated — no burn is executed in this prototype.",
  },
  {
    id: "evt-fire-community",
    title: "Community burn signal — milestone",
    origin: "Members propose retiring SYN to mark a chapter milestone together",
    classifications: ["fire", "recognition"],
    stage: "candidate",
    founderDecision: "pending",
    source: "future",
    note: "Proof of conviction, not a reward and not a return. Founder review is required before any burn could be real.",
  },
  {
    id: "evt-fire-recorded",
    title: "Proof of Fire concept recorded",
    origin: "The Fire Ledger records a burn as memory, not as market action",
    classifications: ["fire", "archive", "share"],
    stage: "share",
    founderDecision: "n/a",
    source: "simulated",
    note: "A retired-supply signal becomes a memory artifact and a shareable proof — witness, never hype.",
  },
];

// CHRONICLE — curated institutional canon. Deliberately SELECTIVE. This is not Activity.
export type ChronicleState = "canon" | "eligible" | "activity-only";

export interface ChronicleEntry {
  id: string;
  index: number; // canon numbering (0 for non-canon)
  era: string;
  title: string;
  date: string;
  canon: string; // the historical statement
  state: ChronicleState;
  becameMemory: boolean; // anchored as an Archive object?
  eventRef?: string; // links to PROTOCOL_EVENTS id
  source: DataSource;
}

export const CHRONICLE: ChronicleEntry[] = [
  {
    id: "chr-1",
    index: 1,
    era: "Genesis",
    title: "The first engine",
    date: "January 2024",
    canon: "The Syndicate became real when membership could route capital transparently and prove it. The institution had a heartbeat.",
    state: "canon",
    becameMemory: true,
    eventRef: "evt-genesis-engine",
    source: "simulated",
  },
  {
    id: "chr-2",
    index: 2,
    era: "Transparency",
    title: "The protocol learned to speak",
    date: "February 2024",
    canon: "Routing and entry became publicly verifiable. Nothing important happened in the dark from this point forward.",
    state: "canon",
    becameMemory: false,
    eventRef: "evt-transparency-live",
    source: "simulated",
  },
  {
    id: "chr-3",
    index: 3,
    era: "Memory",
    title: "The first anchored artifact",
    date: "Current cycle",
    canon: "An early seat's memory was anchored as a permanent object — proof of being present before it was obvious.",
    state: "eligible",
    becameMemory: true,
    eventRef: "evt-archive-anchor",
    source: "simulated",
  },
  {
    id: "chr-na-1",
    index: 0,
    era: "Operations",
    title: "Source Registry paused",
    date: "1 day ago",
    canon: "A configuration toggle. Recorded in Activity and relevant to Evolution, but a state change is not institutional history.",
    state: "activity-only",
    eventRef: "evt-source-paused",
    becameMemory: false,
    source: "simulated",
  },
  {
    id: "chr-na-2",
    index: 0,
    era: "Economy",
    title: "Routine vault allocation",
    date: "11 mins ago",
    canon: "Every membership produces routing allocations. Essential heartbeat, never canon on its own.",
    state: "activity-only",
    eventRef: "evt-routing-vault",
    becameMemory: false,
    source: "simulated",
  },
];

// RECOGNITION — multi-axis standing. NOT a wealth leaderboard, NOT yield, NOT rewards.
// Axes themselves live in MOCK_DATA.recognitionAxes; this adds anonymized contributor
// standing and the path an event takes to become a recognition signal.
export interface Contributor {
  seat: string; // anonymized seat reference, never a balance
  primaryAxis: string;
  standing: "Foundational" | "Established" | "Active" | "Emerging";
  signals: number; // count of proof-backed signals, not money
  chapter: string;
  source: DataSource;
}

export const RECOGNITION_BOARD: Contributor[] = [
  { seat: "Seat #1", primaryAxis: "Time / Loyalty", standing: "Foundational", signals: 24, chapter: "Genesis Signal", source: "simulated" },
  { seat: "Seat #3", primaryAxis: "Verifier", standing: "Established", signals: 19, chapter: "Genesis Signal", source: "simulated" },
  { seat: "Seat #7", primaryAxis: "Builder", standing: "Established", signals: 17, chapter: "Genesis Signal", source: "simulated" },
  { seat: "Seat #9", primaryAxis: "Capital", standing: "Foundational", signals: 22, chapter: "Genesis Signal", source: "simulated" },
  { seat: "Seat #12", primaryAxis: "Historian", standing: "Active", signals: 11, chapter: "Genesis Signal", source: "simulated" },
  { seat: "Seat #15", primaryAxis: "Connector", standing: "Emerging", signals: 4, chapter: "Genesis Signal", source: "simulated" },
];

// How an event becomes a recognition signal (the path shown on the Recognition page).
export const RECOGNITION_PATH: { step: string; detail: string; surface: string }[] = [
  { step: "Event", detail: "A proof-backed action occurs (a receipt, a verified introduction, a contribution).", surface: "/member/activity" },
  { step: "Candidate", detail: "It is classified to an axis — Capital, Connector, Builder, and so on.", surface: "/member/graph" },
  { step: "Founder Review", detail: "An operator confirms the signal is proof-backed before it counts.", surface: "/member/founder-review" },
  { step: "Member Signal", detail: "It appears on the member's standing across axes. No money, no rank, no reward.", surface: "/member/recognition" },
];

// ---- PUBLIC-SAFE PROJECTIONS ----------------------------------------------
// The public proof layer must never surface persona-linked identifiers — a real
// member number, a personal receipt hash, or a single member's seat standing.
// These selectors return protocol-level, anonymized data so a public (no-wallet)
// visitor sees verifiable proof without any member-personal linkage.

export interface PublicHeartbeatEntry {
  id: number;
  type: string;
  category: string;
  title: string;
  date: string;
  value: string;
  status: string;
  proof: string;
}

// Protocol heartbeat for the PUBLIC activity page: anonymized, protocol-level
// events only. No member number (the personal "Genesis Signal #9" is generalized
// to the artifact), no personal receipt hash, no "since you joined" framing.
export const PUBLIC_HEARTBEAT: PublicHeartbeatEntry[] = [
  { id: 1, type: "membership", category: "Member", title: "Membership routed", date: "10 mins ago", value: "150 USDC", status: "confirmed", proof: "On-chain" },
  { id: 2, type: "routing", category: "Economy", title: "Vault allocation", date: "11 mins ago", value: "105 USDC", status: "confirmed", proof: "On-chain" },
  { id: 3, type: "routing", category: "Economy", title: "Liquidity allocation", date: "11 mins ago", value: "30 USDC", status: "confirmed", proof: "On-chain" },
  { id: 4, type: "routing", category: "Economy", title: "Operations allocation", date: "11 mins ago", value: "15 USDC", status: "confirmed", proof: "On-chain" },
  { id: 5, type: "archive", category: "Memory", title: "Archive artifact anchored", date: "2 hours ago", value: "Genesis Signal artifact", status: "confirmed", proof: "ERC-1155" },
  { id: 6, type: "source", category: "Source", title: "Source attribution recorded", date: "5 hours ago", value: "ZERO_SOURCE_ID", status: "internal", proof: "Internal" },
  { id: 7, type: "membership", category: "Member", title: "Membership routed", date: "8 hours ago", value: "500 USDC", status: "confirmed", proof: "On-chain" },
  { id: 8, type: "milestone", category: "Chapter", title: "Chapter advanced: Genesis Signal", date: "1 day ago", value: "Protocol milestone", status: "milestone", proof: "Protocol" },
  { id: 9, type: "source", category: "Source", title: "Source Registry paused", date: "1 day ago", value: "SourceRegistryV1", status: "internal", proof: "Internal" },
  { id: 10, type: "milestone", category: "Chapter", title: "V3 Engine activated", date: "3 days ago", value: "Protocol milestone", status: "milestone", proof: "Protocol" },
];

export function getPublicHeartbeat(): PublicHeartbeatEntry[] {
  return PUBLIC_HEARTBEAT;
}

// Public recognition board — fully anonymized. A numeric seat can coincide with a
// real member number, so the public board uses opaque letter labels. The
// member-facing board keeps numeric seats (a member recognizes their own seat).
export function getPublicRecognitionBoard(): Contributor[] {
  return RECOGNITION_BOARD.map((c, i) => ({
    ...c,
    seat: `Seat ${String.fromCharCode(65 + i)}`,
  }));
}

// RETURN LOOP — the emotional surface that makes members come back.
export interface ReturnItem {
  label: string;
  value: string;
  surface: string;
  source: DataSource;
}

export const RETURN_SURFACE = {
  // The member is seat #9, Genesis Signal. These are deltas since they took their seat.
  sinceYouJoined: [
    { label: "Members who joined after you", value: "1 seat", surface: "/member/activity", source: "simulated" as DataSource },
    { label: "USDC routed by the protocol since", value: "8,300 USDC", surface: "/member/transparency", source: "simulated" as DataSource },
    { label: "Chapter progress", value: "Genesis Signal · 10 / 333", surface: "/member/evolution", source: "simulated" as DataSource },
    { label: "Your memory objects", value: "1 anchored", surface: "/member/archive", source: "simulated" as DataSource },
  ] as ReturnItem[],
  sinceYouWereAway: [
    { label: "New activity events", value: "3 verifiable", surface: "/member/activity", source: "simulated" as DataSource },
    { label: "Modules in review", value: "SourceRegistryV1", surface: "/member/registry", source: "simulated" as DataSource },
    { label: "Canon updates", value: "0 new (founder-gated)", surface: "/member/chronicle", source: "simulated" as DataSource },
    { label: "Recognition signals", value: "1 pending review", surface: "/member/recognition", source: "simulated" as DataSource },
  ] as ReturnItem[],
};

// ---- Selectors -------------------------------------------------------------

export function getChronicleCanon() {
  return CHRONICLE.filter((c) => c.state === "canon").sort((a, b) => a.index - b.index);
}

export function getChronicleEligible() {
  return CHRONICLE.filter((c) => c.state === "eligible");
}

export function getActivityOnly() {
  return CHRONICLE.filter((c) => c.state === "activity-only");
}

export function getEventsForClassification(key: Classification) {
  return PROTOCOL_EVENTS.filter((e) => e.classifications.includes(key));
}

// Founder Console candidate queues — events awaiting a decision per branch.
export interface CandidateQueue {
  key: Classification;
  title: string;
  surface: string;
  items: ProtocolEvent[];
}

export function getFounderQueues(): CandidateQueue[] {
  return CLASSIFICATIONS.filter((c) => c.key !== "share").map((c) => ({
    key: c.key,
    title: c.title,
    surface: c.surface,
    items: PROTOCOL_EVENTS.filter(
      (e) => e.classifications.includes(c.key) && (e.founderDecision === "pending" || e.founderDecision === "approved")
    ),
  }));
}

export function getPendingCandidateCount() {
  return PROTOCOL_EVENTS.filter((e) => e.founderDecision === "pending").length;
}

// Convenience: recognition axes come from canonical mock data.
export const RECOGNITION_AXES = MOCK_DATA.recognitionAxes;

// ---- Truth Drift Detector (founder coherence check) ------------------------
// A READ-ONLY coherence check for the Founder Console. The same module/concept is
// described independently across several arrays in mock-data (the Live Board, the
// Contract Registry, the Economy ecosystem, the Evolution episodes). This selector
// compares how each concept is labeled across those sources and flags where they
// disagree, so a founder can reconcile drift before it ships. It mutates nothing,
// reads only data already in the repo, and never touches a live chain.

export type DriftSeverity = "aligned" | "review" | "conflict";

export interface DriftSource {
  source: string; // which array reported it
  label: string; // the name used in that array
  value: string; // the status/value reported
}

export interface TruthDriftAlert {
  id: string;
  concept: string;
  severity: DriftSeverity;
  summary: string;
  sources: DriftSource[];
}

interface DriftConceptDef {
  concept: string;
  aliases: string[];
}

// Maps a canonical concept to every name it is referred to by across the sources.
const DRIFT_CONCEPTS: DriftConceptDef[] = [
  {
    concept: "Membership / Sale Engine",
    aliases: ["Membership / Join", "MembershipSaleV3", "Live membership engine", "Membership V3 Engine"],
  },
  {
    concept: "Verified Introduction",
    aliases: [
      "Referral / Verified Introduction",
      "SourceRegistryV1",
      "Verified Introduction (source acquisition)",
      "Verified Introduction",
      "Source Attribution",
    ],
  },
  {
    concept: "Archive / Memory",
    aliases: ["Archive / NFT Memory", "Archive1155", "Archive memory"],
  },
  { concept: "SeatRecord721", aliases: ["SeatRecord721"] },
  { concept: "ProductSaleRouter", aliases: ["ProductSaleRouter"] },
  { concept: "SwapRail", aliases: ["SwapRail"] },
];

const NOT_LIVE_STATUSES = new Set(["FUTURE", "IN REVIEW", "V1 CANDIDATE", "V2 CANDIDATE", "PAUSED"]);

function collectStatusSources(aliases: string[]): DriftSource[] {
  const found: DriftSource[] = [];
  const inAliases = (name: string) => aliases.some((a) => a.toLowerCase() === name.toLowerCase());

  MOCK_DATA.liveBoard.forEach((m) => {
    if (inAliases(m.name)) found.push({ source: "Live Board", label: m.name, value: m.status });
  });
  MOCK_DATA.contractLayers.forEach((m) => {
    if (inAliases(m.name)) found.push({ source: "Contract Registry", label: m.name, value: m.status });
  });
  MOCK_DATA.economy.ecosystem.forEach((m) => {
    if (inAliases(m.name)) found.push({ source: "Economy Ecosystem", label: m.name, value: m.status });
  });
  MOCK_DATA.protocolEpisodes.forEach((m) => {
    if (inAliases(m.name)) found.push({ source: "Evolution Episodes", label: m.name, value: m.status });
  });
  return found;
}

// Compare every concept's status across sources and surface any drift for review.
export function getTruthDrift(): TruthDriftAlert[] {
  const alerts: TruthDriftAlert[] = [];

  // 1. Per-concept status agreement across independent sources.
  DRIFT_CONCEPTS.forEach((def) => {
    const sources = collectStatusSources(def.aliases);
    if (sources.length < 2) return; // need at least two sources to compare
    const distinct = Array.from(new Set(sources.map((s) => s.value)));
    if (distinct.length === 1) {
      alerts.push({
        id: `drift-${def.concept}`,
        concept: def.concept,
        severity: "aligned",
        summary: `All ${sources.length} sources agree: ${distinct[0]}.`,
        sources,
      });
    } else {
      const hasLive = distinct.includes("LIVE NOW");
      const hasNotLive = distinct.some((d) => NOT_LIVE_STATUSES.has(d));
      const severity: DriftSeverity = hasLive && hasNotLive ? "conflict" : "review";
      alerts.push({
        id: `drift-${def.concept}`,
        concept: def.concept,
        severity,
        summary: `Sources describe this concept differently: ${distinct.join(" vs ")}.`,
        sources,
      });
    }
  });

  // 2. Canonical routing split integrity (must stay 70 / 20 / 10 summing to 100).
  const splitSum = ROUTING_SPLIT.vault + ROUTING_SPLIT.liquidity + ROUTING_SPLIT.operations;
  const splitCanonical =
    ROUTING_SPLIT.vault === 70 && ROUTING_SPLIT.liquidity === 20 && ROUTING_SPLIT.operations === 10;
  alerts.push({
    id: "drift-routing",
    concept: "Routing Split",
    severity: splitSum === 100 && splitCanonical ? "aligned" : "conflict",
    summary:
      splitSum === 100 && splitCanonical
        ? "Canonical 70% / 20% / 10% holds and sums to 100."
        : `Routing split drift: ${ROUTING_SPLIT.vault}/${ROUTING_SPLIT.liquidity}/${ROUTING_SPLIT.operations} (sum ${splitSum}).`,
    sources: [
      {
        source: "Routing Constant",
        label: "ROUTING_SPLIT",
        value: `${ROUTING_SPLIT.vault}/${ROUTING_SPLIT.liquidity}/${ROUTING_SPLIT.operations}`,
      },
    ],
  });

  // 3. Not-live flags must not contradict a LIVE NOW status anywhere.
  if (!MOCK_DATA.referralActive) {
    const sources = collectStatusSources(DRIFT_CONCEPTS[1].aliases);
    const liveSources = sources.filter((s) => s.value === "LIVE NOW");
    if (liveSources.length > 0) {
      alerts.push({
        id: "drift-flag-referral",
        concept: "Verified Introduction",
        severity: "conflict",
        summary: "referralActive is false, but a source reports LIVE NOW.",
        sources,
      });
    }
  }

  return alerts;
}

// Counts by severity for badges/headers in the Founder Console.
export function getTruthDriftSummary() {
  const alerts = getTruthDrift();
  return {
    total: alerts.length,
    aligned: alerts.filter((a) => a.severity === "aligned").length,
    review: alerts.filter((a) => a.severity === "review").length,
    conflict: alerts.filter((a) => a.severity === "conflict").length,
  };
}
