import { CURRENT_SOURCE_POLICY_SNAPSHOT, ZERO_SOURCE_ID } from "./source-policy-observability";

export const PROTOCOL_EVOLUTION_STATUS_ORDER = [
  "LIVE",
  "PAUSED",
  "INACTIVE",
  "RESEARCH",
  "DESIGN",
  "BUILDING",
  "TESTING",
  "READBACK",
  "BLOCKED",
  "DEFERRED",
  "FUTURE",
  "DEPRECATED",
] as const;

export type ProtocolEvolutionStatus = (typeof PROTOCOL_EVOLUTION_STATUS_ORDER)[number];

export const PROTOCOL_EVOLUTION_EVIDENCE_KINDS = [
  "ONCHAIN_TX",
  "ONCHAIN_READBACK",
  "CODE_COMMIT",
  "TEST_RESULT",
  "ROUTE_PROOF",
  "PRODUCTION_QA",
  "CANONICAL_DOC",
  "OPERATIONAL_DOC",
  "REJECTION_NOTE",
] as const;

export type ProtocolEvolutionEvidenceKind = (typeof PROTOCOL_EVOLUTION_EVIDENCE_KINDS)[number];

export type ProtocolEvolutionEvidence = {
  label: string;
  kind: ProtocolEvolutionEvidenceKind;
  href?: string;
  note: string;
};

export type ProtocolEvolutionModule = {
  id: string;
  title: string;
  status: ProtocolEvolutionStatus;
  category: "Core" | "Economy" | "Memory" | "Identity" | "Acquisition" | "Operations" | "Future";
  summary: string;
  currentTruth: string;
  notLive: string;
  nextMilestone: string;
  blocker: string | null;
  safetyBoundary: string;
  evidence: readonly ProtocolEvolutionEvidence[];
};

const sourcePolicy = CURRENT_SOURCE_POLICY_SNAPSHOT;

export const PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT = sourcePolicy.recordCount;

const sourceAttributionStatus: ProtocolEvolutionStatus =
  sourcePolicy.activeCount > 0 ? "LIVE" : sourcePolicy.recordCount > 0 ? "PAUSED" : "INACTIVE";

export const PROTOCOL_EVOLUTION_MODULES: readonly ProtocolEvolutionModule[] = [
  {
    id: "membership-engine",
    title: "Membership Engine",
    status: "LIVE",
    category: "Core",
    summary: "MembershipSaleV3 is the current direct-buy path for SYN membership seats.",
    currentTruth:
      "The public buy path points to MembershipSaleV3, uses deterministic era pricing, and passes ZERO_SOURCE_ID by default.",
    notLive: "No source-aware public buy path is live.",
    nextMilestone: "Keep direct buys stable while source attribution remains separate.",
    blocker: null,
    safetyBoundary: "SYN remains the V1 seat; source attribution does not change seat identity.",
    evidence: [
      {
        label: "Join",
        kind: "ROUTE_PROOF",
        href: "/join",
        note: "Current public buy surface.",
      },
      {
        label: "Registry",
        kind: "ROUTE_PROOF",
        href: "/registry",
        note: "Contract address and lifecycle truth.",
      },
    ],
  },
  {
    id: "source-attribution",
    title: "Source / Referral Attribution",
    status: sourceAttributionStatus,
    category: "Acquisition",
    summary: "SourceRegistryV1 exists, but referral/source UX is not active.",
    currentTruth:
      sourcePolicy.recordCount === 0
        ? "SourceRegistryV1 is deployed with zero source records. Public/default buys use ZERO_SOURCE_ID."
        : sourcePolicy.currentSummary,
    notLive: "No referral activation, no public source link, no source dashboard, and no claim UI.",
    nextMilestone: "If founder-approved, create one internal PAUSED source record and read it back.",
    blocker: "Founder/manual source ceremony remains separate from frontend activation.",
    safetyBoundary:
      "A source record is policy state only. It is not public referral activation and does not create a claim UI.",
    evidence: [
      {
        label: "Referral status",
        kind: "ROUTE_PROOF",
        href: "/referral",
        note: "Public pending/inactive source-attribution boundary.",
      },
      {
        label: "Source readiness",
        kind: "OPERATIONAL_DOC",
        note: "REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS records zero source records and inactive claims.",
      },
    ],
  },
  {
    id: "protocol-economy",
    title: "Protocol Economy",
    status: "LIVE",
    category: "Economy",
    summary: "Read-only economy surfaces explain routed USDC, receipt truth, and future revenue boundaries.",
    currentTruth:
      "Transparency shows Protocol Economy, and My Syndicate shows My Economy from receipt-backed state.",
    notLive: "No accounting export, source dashboard, or claim reporting is live.",
    nextMilestone: "Keep read-only economy truth aligned with actual receipts and source status.",
    blocker: null,
    safetyBoundary: "Volume is not revenue, and source attribution is not the business model.",
    evidence: [
      {
        label: "Transparency",
        kind: "ROUTE_PROOF",
        href: "/transparency",
        note: "Protocol Economy Observatory surface.",
      },
      {
        label: "My Syndicate",
        kind: "ROUTE_PROOF",
        href: "/my-syndicate",
        note: "Member-facing My Economy section.",
      },
    ],
  },
  {
    id: "activity",
    title: "Activity",
    status: "LIVE",
    category: "Memory",
    summary: "The protocol heartbeat shows recent verifiable movement.",
    currentTruth: "Activity reads purchase and protocol events into a public heartbeat layer.",
    notLive: "Activity is not a governance feed and does not activate future systems.",
    nextMilestone: "Classify future source-policy readbacks only after real SourceCreated events exist.",
    blocker: null,
    safetyBoundary: "Events can become candidates for memory, but not every event becomes Chronicle or Archive.",
    evidence: [
      {
        label: "Activity",
        kind: "ROUTE_PROOF",
        href: "/activity",
        note: "Live heartbeat surface.",
      },
      {
        label: "Event registry",
        kind: "CODE_COMMIT",
        note: "protocol-event-registry defines event vocabulary.",
      },
    ],
  },
  {
    id: "institutional-register",
    title: "Institutional Register",
    status: "LIVE",
    category: "Memory",
    summary: "Durable public truth for contracts, decisions, addresses, and material protocol facts.",
    currentTruth: "The Register and canonical registries preserve address and institutional truth.",
    notLive: "Register entries do not authorize transactions or activation.",
    nextMilestone: "Record future source-policy facts only after on-chain readback.",
    blocker: null,
    safetyBoundary: "Register truth is evidence, not permission to act.",
    evidence: [
      {
        label: "Registry",
        kind: "ROUTE_PROOF",
        href: "/registry",
        note: "Public contract and wallet truth.",
      },
      {
        label: "Institutional Register",
        kind: "ROUTE_PROOF",
        href: "/institutional-register",
        note: "Durable institutional memory surface.",
      },
    ],
  },
  {
    id: "member-os",
    title: "My Syndicate / Member OS",
    status: "LIVE",
    category: "Core",
    summary: "Member home for seat, receipts, activity, memory, and pending systems.",
    currentTruth: "My Syndicate is the live member cockpit and includes pending source/module boundaries.",
    notLive: "No source dashboard, claim UI, wallet recovery, Privy account layer, or SeatRecord721 identity record is live.",
    nextMilestone: "Add a future changed-since-last-visit evolution briefing after the status layer stabilizes.",
    blocker: null,
    safetyBoundary: "The member home must never imply fake balances or source claims.",
    evidence: [
      {
        label: "My Syndicate",
        kind: "ROUTE_PROOF",
        href: "/my-syndicate",
        note: "Live Member OS route.",
      },
      {
        label: "Protocol model",
        kind: "CANONICAL_DOC",
        note: "Seat identity and contribution doctrine.",
      },
    ],
  },
  {
    id: "chronicle",
    title: "Chronicle",
    status: "LIVE",
    category: "Memory",
    summary: "Curated institutional story for material turning points.",
    currentTruth: "Chronicle exists as a story surface and admission model.",
    notLive: "It is not a raw task board and does not record every operational event.",
    nextMilestone: "Promote only material source, Archive, or institutional milestones after evidence exists.",
    blocker: null,
    safetyBoundary: "Routine progress belongs in Protocol Evolution; historical turning points belong in Chronicle.",
    evidence: [
      {
        label: "Chronicle",
        kind: "ROUTE_PROOF",
        href: "/chronicle",
        note: "Institutional story surface.",
      },
      {
        label: "Protocol Evolution architecture",
        kind: "CANONICAL_DOC",
        note: "Separates evolution tracking from curated memory.",
      },
    ],
  },
  {
    id: "archive1155",
    title: "Archive1155",
    status: "LIVE",
    category: "Memory",
    summary: "Archive1155 is the deployed protocol memory layer.",
    currentTruth: "The First Signal is open, Patron Seal is read-gated, and future IDs remain reserved or sealed.",
    notLive: "Archive1155 is not source-aware and does not create financial rights.",
    nextMilestone: "Keep Archive memory separate from source attribution and future identity records.",
    blocker: null,
    safetyBoundary: "Artifacts are memory, not seats, yield, equity, governance, or source rewards.",
    evidence: [
      {
        label: "NFT",
        kind: "ROUTE_PROOF",
        href: "/nft",
        note: "Public Archive memory route.",
      },
      {
        label: "Archive",
        kind: "ROUTE_PROOF",
        href: "/archive",
        note: "Museum and memory surface.",
      },
    ],
  },
  {
    id: "seatrecord721",
    title: "SeatRecord721",
    status: "FUTURE",
    category: "Identity",
    summary: "Future identity record derived from SYN seat truth.",
    currentTruth: "No SeatRecord721 contract is live.",
    notLive: "It does not replace SYN as the seat and has no public mint or claim path.",
    nextMilestone: "Return only after identity and recovery policy require implementation.",
    blocker: "Founder policy and contract design remain deferred.",
    safetyBoundary: "Future identity must not imply governance, equity, yield, or financial rights.",
    evidence: [
      {
        label: "Identity constitution",
        kind: "CANONICAL_DOC",
        note: "Defines future identity relationship and wallet migration posture.",
      },
    ],
  },
  {
    id: "swaprail",
    title: "SwapRail",
    status: "FUTURE",
    category: "Future",
    summary: "Future swap/commerce module concept.",
    currentTruth: "SwapRail is not implemented.",
    notLive: "No swap source attribution, no router, and no production route are live.",
    nextMilestone: "Pass the Module Integration Standard before any provider, router, or source-aware path is built.",
    blocker: "Module intake and architecture are not complete.",
    safetyBoundary: "SwapRail cannot inherit MembershipSaleV3 source terms automatically.",
    evidence: [
      {
        label: "Module standard",
        kind: "CANONICAL_DOC",
        note: "Future modules need explicit source/payment/read-model gates.",
      },
    ],
  },
  {
    id: "product-attribution",
    title: "Product Attribution",
    status: "FUTURE",
    category: "Acquisition",
    summary: "Future product sales may need their own attribution model.",
    currentTruth: "No ProductSaleRouter or premium product attribution path is live.",
    notLive: "No Archive, NFT, premium product, or marketplace revenue is source-attributed today.",
    nextMilestone: "Design product commerce before extending source terms beyond MembershipSaleV3.",
    blocker: "No product payment module exists.",
    safetyBoundary: "Source attribution is not universal protocol commerce.",
    evidence: [
      {
        label: "Referral infrastructure audit",
        kind: "OPERATIONAL_DOC",
        note: "Defines source attribution as product-specific, not inherited globally.",
      },
    ],
  },
  {
    id: "reporting-tax-export",
    title: "Reporting / Tax Export",
    status: "DEFERRED",
    category: "Operations",
    summary: "Future reporting and export tools may help sources and operators reconcile receipts.",
    currentTruth: "No source receipts or escrow claims are live, so reporting/export remains deferred.",
    notLive: "No tax dashboard, source statement, or claim report exists.",
    nextMilestone: "Revisit after source-attributed purchase receipts exist.",
    blocker: "Requires real source receipts and legal/accounting copy review.",
    safetyBoundary: "Reporting can summarize receipts; it must not provide tax advice.",
    evidence: [
      {
        label: "Source creation runbook",
        kind: "OPERATIONAL_DOC",
        note: "Source creation and activation remain separate ceremonies.",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    status: "FUTURE",
    category: "Operations",
    summary: "Future return-loop layer for member, source, Archive, Chronicle, and Register events.",
    currentTruth: "No notification system is live beyond current route surfaces.",
    notLive: "No source notifications, claim alerts, or activation pings exist.",
    nextMilestone: "Design notifications only after real event sources and privacy posture are clear.",
    blocker: "Needs privacy, moderation, and event-quality rules.",
    safetyBoundary: "Notifications must follow real events, never fake progress.",
    evidence: [
      {
        label: "Operational memory",
        kind: "OPERATIONAL_DOC",
        note: "Separates local, GitHub, Replit, and production truth.",
      },
    ],
  },
] as const;

export function getProtocolEvolutionModulesByStatus(status: ProtocolEvolutionStatus) {
  return PROTOCOL_EVOLUTION_MODULES.filter((module) => module.status === status);
}

export function getProtocolEvolutionStatusCounts() {
  return PROTOCOL_EVOLUTION_STATUS_ORDER.map((status) => ({
    status,
    count: getProtocolEvolutionModulesByStatus(status).length,
  })).filter((entry) => entry.count > 0);
}

export function getProtocolEvolutionEvidenceCount() {
  return PROTOCOL_EVOLUTION_MODULES.reduce((total, module) => total + module.evidence.length, 0);
}

export const PROTOCOL_EVOLUTION_BOUNDARIES = [
  "No source record is created by Protocol Evolution.",
  "No source, referral, or claim UI is activated by Protocol Evolution.",
  "No public source-aware buy path is created by Protocol Evolution.",
  "No contract deployment, registry switch, or wallet transaction is authorized by Protocol Evolution.",
  `Public/default MembershipSaleV3 buys remain ${ZERO_SOURCE_ID}.`,
] as const;
