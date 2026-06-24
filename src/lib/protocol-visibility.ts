import { CURRENT_SOURCE_POLICY_SNAPSHOT, ZERO_SOURCE_ID } from "./source-policy-observability";

export const PROTOCOL_VISIBILITY_STATUSES = [
  "LIVE",
  "PAUSED",
  "INACTIVE",
  "BUILDING",
  "PLANNED",
  "FUTURE",
  "DEFERRED",
] as const;

export const PROTOCOL_VISIBILITY_DEEP_STATUSES = ["READBACK", "SEALED"] as const;

export type ProtocolVisibilityStatus = (typeof PROTOCOL_VISIBILITY_STATUSES)[number];
export type ProtocolVisibilityDeepStatus = (typeof PROTOCOL_VISIBILITY_DEEP_STATUSES)[number];

export const PROTOCOL_VISIBILITY_SYSTEM_GROUPS = [
  "ENTRY",
  "ECONOMY",
  "PROOF",
  "MEMORY",
  "GROWTH",
  "FUTURE",
  "INFRASTRUCTURE",
] as const;

export type ProtocolVisibilitySystemGroup = (typeof PROTOCOL_VISIBILITY_SYSTEM_GROUPS)[number];

export type ProtocolVisibilityPillarId = "spine" | "map" | "pulse" | "proof" | "place";

export type ProtocolVisibilityPillar = {
  id: ProtocolVisibilityPillarId;
  label: string;
  publicLabel: string;
  purpose: string;
  meaning: string;
};

export type ProtocolVisibilitySpineStep = {
  id: "join" | "prove" | "remember" | "return" | "evolve";
  label: string;
  verb: string;
  status: ProtocolVisibilityStatus;
  route: string;
  meaning: string;
};

export type ProtocolVisibilityNode = {
  id: string;
  label: string;
  role: string;
  systemGroup: ProtocolVisibilitySystemGroup;
  status: ProtocolVisibilityStatus;
  route: string | null;
  proofPath: string | null;
  userMeaning: string;
  liveTruth: string;
  boundary: string;
  pillarIds: readonly ProtocolVisibilityPillarId[];
  futureState?: string;
  primaryAction?: {
    label: string;
    href: string;
    live: boolean;
  };
};

export type ProtocolVisibilityPulseItem = {
  id: string;
  label: string;
  status: ProtocolVisibilityStatus;
  route: string;
  summary: string;
  proof: string;
};

const sourcePolicy = CURRENT_SOURCE_POLICY_SNAPSHOT;

export const PROTOCOL_VISIBILITY_RECOGNITION_DOCTRINE =
  "Future recognition should answer what a person or source helped the institution become, not how much money they earned." as const;

export const PROTOCOL_VISIBILITY_PILLARS: readonly ProtocolVisibilityPillar[] = [
  {
    id: "spine",
    label: "Institutional Spine",
    publicLabel: "How participation works",
    purpose: "Join -> Prove -> Remember -> Return -> Evolve.",
    meaning:
      "A person joins, receives proof, sees activity become memory, returns home, and watches the institution evolve.",
  },
  {
    id: "map",
    label: "Institution Map",
    publicLabel: "Where systems belong",
    purpose: "Entry, Economy, Proof, Memory, Growth, Future, and Infrastructure.",
    meaning: "The site is one organism, not random pages.",
  },
  {
    id: "pulse",
    label: "Institutional Pulse",
    publicLabel: "Why it feels alive",
    purpose: "What became true, what changed, what entered memory, and what proof to watch next.",
    meaning: "Visible change creates the reason to return without becoming roadmap theater.",
  },
  {
    id: "proof",
    label: "Proof Backbone",
    publicLabel: "Why it can be trusted",
    purpose: "Contracts, readbacks, receipts, Activity, Registry, Transparency, Chronicle, Archive, and Evolution evidence.",
    meaning: "Every important claim should point to proof or a visible boundary.",
  },
  {
    id: "place",
    label: "Place / Belonging",
    publicLabel: "Where the human fits",
    purpose: "Seat identity, My Syndicate, member number, era participation, and future contribution memory.",
    meaning: "The institution is systems plus people: members, builders, sources, contributors, partners, and future historians.",
  },
] as const;

export const PROTOCOL_INSTITUTIONAL_SPINE: readonly ProtocolVisibilitySpineStep[] = [
  {
    id: "join",
    label: "1",
    verb: "Join",
    status: "LIVE",
    route: "/join",
    meaning: "Take a seat with SYN.",
  },
  {
    id: "prove",
    label: "2",
    verb: "Prove",
    status: "LIVE",
    route: "/transparency",
    meaning: "Your action leaves a receipt.",
  },
  {
    id: "remember",
    label: "3",
    verb: "Remember",
    status: "LIVE",
    route: "/activity",
    meaning: "Activity becomes institutional memory.",
  },
  {
    id: "return",
    label: "4",
    verb: "Return",
    status: "LIVE",
    route: "/my-syndicate",
    meaning: "My Syndicate becomes your home.",
  },
  {
    id: "evolve",
    label: "5",
    verb: "Evolve",
    status: "LIVE",
    route: "/evolution",
    meaning: "Watch the institution become real over time.",
  },
] as const;

export const PROTOCOL_VISIBILITY_NODES: readonly ProtocolVisibilityNode[] = [
  {
    id: "join",
    label: "Join",
    role: "Entry surface",
    systemGroup: "ENTRY",
    status: "LIVE",
    route: "/join",
    proofPath: "/transparency",
    userMeaning: "Take a seat, receive SYN, and create a receipt.",
    liveTruth: "MembershipSaleV3 is the current direct-buy path.",
    boundary: "Public/default buys use ZERO_SOURCE_ID; no source-aware public buy path is live.",
    pillarIds: ["spine", "map", "place"],
    primaryAction: { label: "Take your seat", href: "/join", live: true },
  },
  {
    id: "protocol-economy",
    label: "Protocol Economy",
    role: "Routing and economy explanation",
    systemGroup: "ECONOMY",
    status: "LIVE",
    route: "/transparency",
    proofPath: "/transparency",
    userMeaning: "See how USDC routes and what the receipt proves.",
    liveTruth: "Economy surfaces are read-only and receipt-backed.",
    boundary: "Economy language must stay factual and non-promissory.",
    pillarIds: ["map", "proof", "pulse"],
  },
  {
    id: "registry",
    label: "Registry",
    role: "Address and truth register",
    systemGroup: "PROOF",
    status: "LIVE",
    route: "/registry",
    proofPath: "/registry",
    userMeaning: "Verify contracts, addresses, readbacks, and status.",
    liveTruth: "Current contract truth is public and route-backed.",
    boundary: "Registry truth is evidence, not permission to act.",
    pillarIds: ["map", "proof"],
  },
  {
    id: "transparency",
    label: "Transparency",
    role: "Proof and routing surface",
    systemGroup: "PROOF",
    status: "LIVE",
    route: "/transparency",
    proofPath: "/transparency",
    userMeaning: "Inspect routing, wallets, contracts, and read-only economy truth.",
    liveTruth: "Transparency is the public proof center.",
    boundary: "No hidden activation or source-aware path is created here.",
    pillarIds: ["map", "proof"],
  },
  {
    id: "activity",
    label: "Activity",
    role: "Heartbeat",
    systemGroup: "MEMORY",
    status: "LIVE",
    route: "/activity",
    proofPath: "/activity",
    userMeaning: "Watch raw verifiable movement.",
    liveTruth: "Activity is the live heartbeat layer.",
    boundary: "Activity records movement; it does not turn every event into Chronicle or Archive.",
    pillarIds: ["spine", "map", "pulse", "proof"],
  },
  {
    id: "chronicle",
    label: "Chronicle",
    role: "Meaningful memory",
    systemGroup: "MEMORY",
    status: "LIVE",
    route: "/chronicle",
    proofPath: "/chronicle",
    userMeaning: "See which events became institutional story.",
    liveTruth: "Chronicle is the curated meaning layer.",
    boundary: "Chronicle is not a task board or hype feed.",
    pillarIds: ["spine", "map", "pulse", "proof"],
  },
  {
    id: "archive1155",
    label: "Archive1155",
    role: "Immutable memory objects",
    systemGroup: "MEMORY",
    status: "LIVE",
    route: "/archive",
    proofPath: "/nft",
    userMeaning: "Carry institutional memory without confusing it for the seat.",
    liveTruth: "Archive1155 is deployed; First Signal is open and Patron Seal is read-gated.",
    boundary: "Artifacts are memory, not seats, source rewards, or financial rights.",
    pillarIds: ["map", "proof", "place"],
  },
  {
    id: "my-syndicate",
    label: "My Syndicate",
    role: "Member home",
    systemGroup: "INFRASTRUCTURE",
    status: "LIVE",
    route: "/my-syndicate",
    proofPath: "/my-syndicate",
    userMeaning: "Return to your seat, receipts, activity, memory, and economy context.",
    liveTruth: "My Syndicate is the current member home.",
    boundary: "It must not imply source balances, claim balances, or fake future identity records.",
    pillarIds: ["spine", "place", "pulse"],
    primaryAction: { label: "Open home", href: "/my-syndicate", live: true },
  },
  {
    id: "protocol-evolution",
    label: "Protocol Evolution",
    role: "Episode and proof board",
    systemGroup: "INFRASTRUCTURE",
    status: "LIVE",
    route: "/evolution",
    proofPath: "/evolution",
    userMeaning: "Follow what became true, what is unfolding, and what proof to watch next.",
    liveTruth: "Protocol Evolution V2 is the live read-only episode layer.",
    boundary: "Evolution explains state; it cannot deploy, activate, claim, or create records.",
    pillarIds: ["spine", "pulse", "proof"],
  },
  {
    id: "source-attribution",
    label: "Source Attribution",
    role: "Reserved acquisition attribution",
    systemGroup: "GROWTH",
    status: sourcePolicy.recordCount > 0 ? "PAUSED" : "INACTIVE",
    route: "/referral",
    proofPath: "/referral",
    userMeaning: "Understand that acquisition attribution is reserved, not public referral.",
    liveTruth:
      sourcePolicy.recordCount === 0
        ? "SourceRegistryV1 exists with zero source records."
        : sourcePolicy.currentSummary,
    boundary: "No public source link, no source dashboard, no source-aware public buy path, and no claim UI.",
    pillarIds: ["map", "pulse", "proof"],
    futureState: "Needs separate ceremony, readback, activation, legal framing, tests, and production QA.",
  },
  {
    id: "referral",
    label: "Referral",
    role: "Inactive future growth surface",
    systemGroup: "GROWTH",
    status: "INACTIVE",
    route: "/referral",
    proofPath: "/referral",
    userMeaning: "See the boundary: referral is not live today.",
    liveTruth: "The public referral route is read-only and inactive.",
    boundary: "No referral activation, no public link, and no payment/claim UI.",
    pillarIds: ["map", "proof"],
    futureState: "Future only after source activation and disclosure gates.",
  },
  {
    id: "future-recognition-reserve",
    label: "Recognition Reserve",
    role: "Future institutional contribution memory",
    systemGroup: "GROWTH",
    status: "FUTURE",
    route: null,
    proofPath: null,
    userMeaning: "Future recognition may record what people helped the institution become.",
    liveTruth: "No public recognition, ranking, builder record, contributor record, or verified-introducer system is live.",
    boundary: "Recognition must never become a financial leaderboard or unverified badge system.",
    pillarIds: ["place", "map", "pulse"],
    futureState: "Reserved for Builder Records, Contributor Records, Verified Introducers, Partner Sources, Era memory, and Institutional Trust Capital.",
  },
  {
    id: "seatrecord721",
    label: "SeatRecord721",
    role: "Future durable identity record",
    systemGroup: "FUTURE",
    status: "FUTURE",
    route: null,
    proofPath: null,
    userMeaning: "Future identity may preserve seat history without replacing SYN.",
    liveTruth: "No SeatRecord721 contract, mint path, or claim path is live.",
    boundary: "SYN remains the V1 seat. Future identity cannot imply financial or governance rights.",
    pillarIds: ["place", "map"],
    futureState: "Requires separate policy freeze, Solidity, review, deployment, and frontend activation.",
  },
  {
    id: "identity-layer",
    label: "Identity Layer",
    role: "Future wallet and account continuity",
    systemGroup: "FUTURE",
    status: "FUTURE",
    route: null,
    proofPath: null,
    userMeaning: "Future account recovery and continuity remain reserved.",
    liveTruth: "No Privy/account layer or wallet migration UI is live.",
    boundary: "No recovery promise exists until policy, implementation, and proof exist.",
    pillarIds: ["place", "map"],
    futureState: "Needs separate identity and privacy sprint.",
  },
  {
    id: "swaprail",
    label: "SwapRail",
    role: "Future secondary-market infrastructure",
    systemGroup: "FUTURE",
    status: "FUTURE",
    route: null,
    proofPath: null,
    userMeaning: "Future swap infrastructure is reserved.",
    liveTruth: "SwapRail is not implemented and has no public route.",
    boundary: "It cannot inherit source terms or source-aware paths automatically.",
    pillarIds: ["map"],
    futureState: "Requires module integration review before any build.",
  },
  {
    id: "product-sale-router",
    label: "Product Sale Router",
    role: "Future commerce routing layer",
    systemGroup: "FUTURE",
    status: "FUTURE",
    route: null,
    proofPath: null,
    userMeaning: "Future premium products and commerce are not live.",
    liveTruth: "No product-sale router or marketplace payment path is live.",
    boundary: "Product commerce needs separate source, receipt, disclosure, and proof rules.",
    pillarIds: ["map"],
    futureState: "Reserved for future commerce design.",
  },
] as const;

export const PROTOCOL_VISIBILITY_PULSE: readonly ProtocolVisibilityPulseItem[] = [
  {
    id: "v3-live",
    label: "Became true",
    status: "LIVE",
    route: "/join",
    summary: "V3 is the current membership engine.",
    proof: "Join and Registry show the current buy path and contract truth.",
  },
  {
    id: "episodes-live",
    label: "Changed",
    status: "LIVE",
    route: "/evolution",
    summary: "Protocol Evolution V2 is live as the episode layer.",
    proof: "Evolution shows what became true, what is unfolding, and the evidence underneath.",
  },
  {
    id: "source-boundary",
    label: "Still inactive",
    status: sourcePolicy.recordCount > 0 ? "PAUSED" : "INACTIVE",
    route: "/referral",
    summary:
      sourcePolicy.recordCount === 0
        ? "SourceRegistry has zero source records."
        : "Source policy exists only in its readback state.",
    proof: `Public/default buys remain ${ZERO_SOURCE_ID}. No public source link or claim UI is live.`,
  },
  {
    id: "watch-next-proof",
    label: "Watch next",
    status: "PLANNED",
    route: "/evolution",
    summary: "The next meaningful change must arrive as proof, not promise.",
    proof: "Future source, recognition, identity, and commerce systems require separate ceremonies and readbacks.",
  },
] as const;

export const PROTOCOL_VISIBILITY_PROOF_BACKBONE = [
  { label: "Receipts", route: "/activity", meaning: "ERC-1155 and transaction proof." },
  { label: "Activity", route: "/activity", meaning: "Raw verified movement." },
  { label: "Registry", route: "/registry", meaning: "Addresses, status, and readbacks." },
  { label: "Transparency", route: "/transparency", meaning: "Routing and economy proof." },
  { label: "Chronicle", route: "/chronicle", meaning: "Meaningful institutional memory." },
  { label: "Archive", route: "/archive", meaning: "Durable memory objects." },
  { label: "Evolution", route: "/evolution", meaning: "Episodes and evidence board." },
] as const;

export const PROTOCOL_VISIBILITY_HARD_BOUNDARIES = [
  "No public referral activation.",
  "No public source link.",
  "No source-aware public buy path.",
  "No claim UI.",
  "No rankings or leaderboards.",
  "No fake governance.",
  `Default V3 buys use ${ZERO_SOURCE_ID}.`,
] as const;

export function getProtocolVisibilityNodesByGroup(group: ProtocolVisibilitySystemGroup) {
  return PROTOCOL_VISIBILITY_NODES.filter((node) => node.systemGroup === group);
}

export function getProtocolVisibilityNodesByStatus(status: ProtocolVisibilityStatus) {
  return PROTOCOL_VISIBILITY_NODES.filter((node) => node.status === status);
}

export function getProtocolVisibilityStatusCounts() {
  return PROTOCOL_VISIBILITY_STATUSES.map((status) => ({
    status,
    count: getProtocolVisibilityNodesByStatus(status).length,
  })).filter((entry) => entry.count > 0);
}

export function isProtocolVisibilityNodeLive(node: ProtocolVisibilityNode) {
  return node.status === "LIVE";
}
