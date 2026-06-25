import {
  PROTOCOL_EVOLUTION_MODULES,
  PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT,
  type ProtocolEvolutionEvidence,
} from "./protocol-evolution";

export const PROTOCOL_EVOLUTION_EPISODE_STATES = [
  "BECAME_TRUE",
  "UNFOLDING",
  "WATCH_NEXT",
  "WAITING_READBACK",
  "DEFERRED",
] as const;

export type ProtocolEvolutionEpisodeState =
  (typeof PROTOCOL_EVOLUTION_EPISODE_STATES)[number];

export type ProtocolEvolutionSurface =
  | "Activity"
  | "Register"
  | "Chronicle"
  | "My Syndicate"
  | "Protocol Economy"
  | "Referral"
  | "Transparency"
  | "Archive";

export type ProtocolEvolutionEpisode = {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly state: ProtocolEvolutionEpisodeState;
  readonly timelineLabel: string;
  readonly plainSummary: string;
  readonly whatBecameTrue: string;
  readonly whatIsUnfolding: string;
  readonly whyItMattersToMembers: string;
  readonly proofToWatchNext: string;
  readonly whatDidNotChange: string;
  readonly moduleIds: readonly string[];
  readonly surfaces: readonly ProtocolEvolutionSurface[];
  readonly evidence: readonly ProtocolEvolutionEvidence[];
  readonly safetyBoundary: string;
  readonly chronicleCandidate: boolean;
  readonly registerCandidate: boolean;
};

const moduleIds = new Set(PROTOCOL_EVOLUTION_MODULES.map((module) => module.id));

function evidence(
  label: string,
  href: string,
  kind: ProtocolEvolutionEvidence["kind"] | "route" | "doc",
  note: string,
): ProtocolEvolutionEvidence {
  const canonicalKind: ProtocolEvolutionEvidence["kind"] =
    kind === "route" ? "ROUTE_PROOF" : kind === "doc" ? "CANONICAL_DOC" : kind;
  return { label, href, kind: canonicalKind, note };
}

function assertKnownModules(moduleIdsForEpisode: readonly string[]) {
  const unknown = moduleIdsForEpisode.filter((id) => !moduleIds.has(id));
  if (unknown.length > 0) {
    throw new Error(
      `Protocol Evolution episode references unknown module ids: ${unknown.join(
        ", ",
      )}`,
    );
  }
  return moduleIdsForEpisode;
}

export const PROTOCOL_EVOLUTION_EPISODES = [
  {
    id: "v3-membership-engine",
    title: "V3 is the current membership engine",
    eyebrow: "What became true",
    state: "BECAME_TRUE",
    timelineLabel: "Live path",
    plainSummary:
      "The public buy path now points to MembershipSaleV3 with deterministic era pricing and direct purchases using ZERO_SOURCE_ID.",
    whatBecameTrue:
      "Membership entry moved from the paused V2b sale to the funded V3 sale path.",
    whatIsUnfolding:
      "Receipts, Activity, My Syndicate, and the Register now need to keep treating V3 purchases as the current membership record.",
    whyItMattersToMembers:
      "A member can still take a seat by acquiring SYN, while the site can explain era pricing and routing without pretending referral is live.",
    proofToWatchNext:
      "Watch Join, Registry, Activity, and My Syndicate readbacks after each real V3 purchase.",
    whatDidNotChange:
      "Default buys still use ZERO_SOURCE_ID. No public source-aware buy path or claim UI exists.",
    moduleIds: assertKnownModules([
      "membership-engine",
      "activity",
      "institutional-register",
      "member-os",
    ]),
    surfaces: [
      "Activity",
      "Register",
      "My Syndicate",
      "Transparency",
      "Protocol Economy",
    ],
    evidence: [
      evidence("Join", "/join", "route", "Current public membership entry."),
      evidence(
        "Registry",
        "/registry",
        "route",
        "Contract and status readbacks.",
      ),
      evidence(
        "V3 constitution",
        "/docs#v3-protocol-engine-constitution",
        "doc",
        "Deterministic era pricing and acquisition-first architecture.",
      ),
    ],
    safetyBoundary:
      "This episode does not activate source attribution, referral links, claim UI, or source dashboards.",
    chronicleCandidate: true,
    registerCandidate: true,
  },
  {
    id: "protocol-economy-visible",
    title: "Protocol Economy became visible",
    eyebrow: "What became true",
    state: "BECAME_TRUE",
    timelineLabel: "Trust surface",
    plainSummary:
      "Transparency now separates seat identity, contribution depth, routing, protocol economy, and member economy.",
    whatBecameTrue:
      "The site has a clearer public explanation of how USDC routing, contribution, and member history fit together.",
    whatIsUnfolding:
      "Future receipts and source-attributed purchases should feed the same economy surfaces without creating fake-live claims.",
    whyItMattersToMembers:
      "Members can understand what happened, what moved, and what remains pending without reading contract code first.",
    proofToWatchNext:
      "Watch Transparency and My Syndicate as the read model receives more V3 purchase history.",
    whatDidNotChange:
      "The Protocol Economy is read-only explanation and readback. It is not a treasury dashboard or yield promise.",
    moduleIds: assertKnownModules([
      "protocol-economy",
      "member-os",
      "activity",
      "institutional-register",
    ]),
    surfaces: ["Protocol Economy", "My Syndicate", "Transparency", "Register"],
    evidence: [
      evidence(
        "Transparency",
        "/transparency",
        "route",
        "Public protocol economy surface.",
      ),
      evidence(
        "My Syndicate",
        "/my-syndicate",
        "route",
        "Member home and My Economy surface.",
      ),
      evidence(
        "Canonical doctrine",
        "/docs#syndicate-protocol-model",
        "doc",
        "Seat identity plus contribution depth doctrine.",
      ),
    ],
    safetyBoundary:
      "Economy language must stay factual: no income, return, guarantee, or member ownership framing.",
    chronicleCandidate: true,
    registerCandidate: true,
  },
  {
    id: "source-policy-rehearsal",
    title: "Source policy is in rehearsal, not public referral",
    eyebrow: "What is unfolding",
    state: "UNFOLDING",
    timelineLabel: "Controlled next proof",
    plainSummary:
      PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT > 0
        ? "One internal PAUSED source record exists, but the public site still has no referral activation, no claim UI, and no source-aware buy path."
        : "SourceRegistryV1 exists, but the public site still has no referral activation, no claim UI, and no source-aware buy path.",
    whatBecameTrue:
      PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT > 0
        ? "The first internal source-policy fact now exists as PAUSED state and can be inspected without activating referral."
        : "The source policy contracts and source observability layer are ready to record source-policy facts when separately approved.",
    whatIsUnfolding:
      "The next source step is an internal gated source-attributed test path and separate activation decision, not a public referral launch.",
    whyItMattersToMembers:
      "The institution can test acquisition attribution without confusing members about referral availability or rewards.",
    proofToWatchNext:
      "Watch for an internal source-attributed receipt test, unchanged public ZERO_SOURCE_ID buys, and zero public source links.",
    whatDidNotChange:
      "No source record should be treated as referral activation. Public/default buys remain direct.",
    moduleIds: assertKnownModules(["source-attribution", "activity", "institutional-register"]),
    surfaces: ["Referral", "Register", "Activity", "Transparency"],
    evidence: [
      evidence(
        "Referral",
        "/referral",
        "route",
        "Pending referral/source surface.",
      ),
      evidence(
        "Source ceremony runbook",
        "/docs#source-creation-ceremony-runbook",
        "doc",
        "Manual source-policy ceremony boundary.",
      ),
      evidence(
        "Source packet",
        "/docs#source-packet-internal-test-001-draft",
        "doc",
        "Internal protocol rehearsal packet.",
      ),
    ],
    safetyBoundary:
      "A PAUSED source record is not a public referral system, not a source link, and not a claim path.",
    chronicleCandidate: false,
    registerCandidate: true,
  },
  {
    id: "archive-memory-layer",
    title: "Archive remains protocol memory",
    eyebrow: "What became true",
    state: "BECAME_TRUE",
    timelineLabel: "Memory layer",
    plainSummary:
      "Archive1155 remains the memory layer for institutional artifacts, separate from SYN seat identity and future SeatRecord721.",
    whatBecameTrue:
      "The site now presents Archive as memory, not an NFT speculation surface.",
    whatIsUnfolding:
      "Future Archive IDs should only be created when a real institutional milestone deserves memory.",
    whyItMattersToMembers:
      "Members can follow what mattered without confusing Archive artifacts with seat ownership or financial rights.",
    proofToWatchNext:
      "Watch Chronicle, Register, and Archive for major milestones that become historically meaningful.",
    whatDidNotChange:
      "Archive1155 does not replace SYN, does not create referral rights, and does not create yield or equity.",
    moduleIds: assertKnownModules(["archive1155", "chronicle", "institutional-register"]),
    surfaces: ["Archive", "Chronicle", "Register"],
    evidence: [
      evidence("Archive", "/nft", "route", "Archive1155 public memory surface."),
      evidence(
        "Chronicle",
        "/chronicle",
        "route",
        "Narrative memory and historical context.",
      ),
      evidence(
        "Smart contract system map",
        "/docs#smart-contract-system-map",
        "doc",
        "Contract identity and memory boundaries.",
      ),
    ],
    safetyBoundary:
      "Archive is memory. It is not a marketplace, referral module, governance object, or seat record.",
    chronicleCandidate: true,
    registerCandidate: true,
  },
  {
    id: "identity-layer-horizon",
    title: "Durable identity stays on the horizon",
    eyebrow: "What to watch next",
    state: "WATCH_NEXT",
    timelineLabel: "Future identity",
    plainSummary:
      "SeatRecord721 remains a future identity record concept. SYN remains the V1 seat today.",
    whatBecameTrue:
      "The identity and attribution constitution now separates seat identity, wallet ownership, recovery, and future durable identity.",
    whatIsUnfolding:
      "Future identity work must preserve SYN as the current seat and must not imply governance, equity, yield, or financial rights.",
    whyItMattersToMembers:
      "A member should know what seats them today and what future identity records may eventually preserve.",
    proofToWatchNext:
      "Watch for a separate SeatRecord721 policy freeze before any Solidity, deployment, or frontend activation.",
    whatDidNotChange:
      "SeatRecord721 is not live, not deployed, and not a replacement for SYN.",
    moduleIds: assertKnownModules(["seatrecord721", "member-os", "institutional-register"]),
    surfaces: ["My Syndicate", "Register"],
    evidence: [
      evidence(
        "Identity constitution",
        "/docs#identity-attribution-constitution",
        "doc",
        "Seat, wallet, and attribution doctrine.",
      ),
      evidence(
        "Smart contract map",
        "/docs#smart-contract-system-map",
        "doc",
        "SeatRecord721 future-status boundary.",
      ),
    ],
    safetyBoundary:
      "Do not present SeatRecord721 as live, deployed, claimable, transferable, or replacing SYN.",
    chronicleCandidate: false,
    registerCandidate: true,
  },
] as const satisfies readonly ProtocolEvolutionEpisode[];

export const PROTOCOL_EVOLUTION_LATEST_EPISODE_ID =
  PROTOCOL_EVOLUTION_EPISODES[0].id;

export function getProtocolEvolutionLatestEpisode() {
  return PROTOCOL_EVOLUTION_EPISODES.find(
    (episode) => episode.id === PROTOCOL_EVOLUTION_LATEST_EPISODE_ID,
  );
}

export function getProtocolEvolutionEpisodesByState(
  state: ProtocolEvolutionEpisodeState,
) {
  return PROTOCOL_EVOLUTION_EPISODES.filter((episode) => episode.state === state);
}

export function getProtocolEvolutionEpisodeCounts() {
  return PROTOCOL_EVOLUTION_EPISODE_STATES.reduce(
    (counts, state) => ({
      ...counts,
      [state]: getProtocolEvolutionEpisodesByState(state).length,
    }),
    {} as Record<ProtocolEvolutionEpisodeState, number>,
  );
}

export function getProtocolEvolutionEpisodesSince(
  seenEpisodeIds: readonly string[],
) {
  const seen = new Set(seenEpisodeIds);
  return PROTOCOL_EVOLUTION_EPISODES.filter((episode) => !seen.has(episode.id));
}
