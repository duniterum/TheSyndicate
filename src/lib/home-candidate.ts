import { ZERO_SOURCE_ID } from "./source-policy-observability";

export type HomeCandidateStatus =
  | "LIVE"
  | "READ_ONLY"
  | "LIVE_MEMORY"
  | "INACTIVE"
  | "IN_REVIEW"
  | "HIDDEN_REVIEW"
  | "FUTURE"
  | "BLOCKED_NOW";

export type HomeCandidateBoundary = {
  readonly hidden: true;
  readonly noindex: true;
  readonly nofollow: true;
  readonly directUrlOnly: true;
  readonly absentFromPublicNavigation: true;
  readonly absentFromSitemap: true;
  readonly readOnly: true;
  readonly walletControls: false;
  readonly buyControls: false;
  readonly activationControls: false;
  readonly sourceControls: false;
  readonly claimControls: false;
  readonly replacesProductionHome: false;
  readonly publicJoinDefaultSourceId: typeof ZERO_SOURCE_ID;
  readonly referralActive: false;
  readonly publicSourceLinksActive: false;
  readonly sourceDashboardActive: false;
  readonly aliasRoutesActive: false;
  readonly publicSourceAwareBuyPathActive: false;
  readonly registrySwitch: false;
  readonly contractChange: false;
  readonly erc721Implementation: false;
  readonly archiveEvolutionImplementation: false;
};

export type HomeCandidateLoopStep = {
  readonly id: string;
  readonly verb: string;
  readonly label: string;
  readonly status: HomeCandidateStatus;
  readonly body: string;
};

export type HomeCandidateModule = {
  readonly id: string;
  readonly label: string;
  readonly route: string;
  readonly status: HomeCandidateStatus;
  readonly promise: string;
  readonly boundary: string;
};

export type HomeCandidateProofPoint = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly status: HomeCandidateStatus;
};

export type HomeCandidateJourneyStep = {
  readonly id: string;
  readonly label: string;
  readonly visitorState: string;
  readonly receives: readonly string[];
  readonly nextSurface: string;
};

export type HomeCandidateEpisode = {
  readonly id: string;
  readonly label: string;
  readonly status: HomeCandidateStatus;
  readonly note: string;
};

export type HomeCandidateDecision = {
  readonly id: string;
  readonly label: string;
  readonly meaning: string;
  readonly nextStep: string;
};

export const HOME_CANDIDATE_REVIEW_TOKEN = "SYNDICATE_HOME_CANDIDATE";
export const HOME_CANDIDATE_ROUTE = "/labs/home-candidate";
export const HOME_CANDIDATE_ROUTE_WITH_REVIEW =
  `${HOME_CANDIDATE_ROUTE}?review=${HOME_CANDIDATE_REVIEW_TOKEN}`;

export const HOME_CANDIDATE_BOUNDARIES: HomeCandidateBoundary = {
  hidden: true,
  noindex: true,
  nofollow: true,
  directUrlOnly: true,
  absentFromPublicNavigation: true,
  absentFromSitemap: true,
  readOnly: true,
  walletControls: false,
  buyControls: false,
  activationControls: false,
  sourceControls: false,
  claimControls: false,
  replacesProductionHome: false,
  publicJoinDefaultSourceId: ZERO_SOURCE_ID,
  referralActive: false,
  publicSourceLinksActive: false,
  sourceDashboardActive: false,
  aliasRoutesActive: false,
  publicSourceAwareBuyPathActive: false,
  registrySwitch: false,
  contractChange: false,
  erc721Implementation: false,
  archiveEvolutionImplementation: false,
};

export const HOME_CANDIDATE_POSITIONING = {
  direction: "Proof-First Institution Home",
  emotionalSpine: "Living Protocol / Series Home",
  conversionStructure: "Member Journey Home",
  oneLine:
    "The Syndicate is a transparent on-chain membership institution forming in public.",
  rationale:
    "This blend keeps proof close to story, explains the member path quickly, and lets future modules be visible without making them appear live. The Syndicate recognizes capital without reducing identity to capital.",
  primaryPreviewAction: "Join / Take Your Seat",
  secondaryPreviewActions: [
    "Verify the Protocol",
    "Explore Evolution",
    "My Syndicate",
  ],
} as const;

export const HOME_CANDIDATE_LOOP: readonly HomeCandidateLoopStep[] = [
  {
    id: "join",
    verb: "Join",
    label: "Take a seat",
    status: "LIVE",
    body:
      "A visitor enters through the live MembershipSaleV3 path on /join. Public buys remain ZERO_SOURCE_ID.",
  },
  {
    id: "prove",
    verb: "Prove",
    label: "Receipt and routing",
    status: "READ_ONLY",
    body:
      "The receipt, contract route, and 70 / 20 / 10 money movement become verifiable public facts.",
  },
  {
    id: "remember",
    verb: "Remember",
    label: "Identity and memory",
    status: "LIVE_MEMORY",
    body:
      "SYN is the seat signal. Archive artifacts are memory surfaces, not financial rights or seat identity.",
  },
  {
    id: "return",
    verb: "Return",
    label: "Member cockpit",
    status: "LIVE",
    body:
      "My Syndicate becomes the return surface for wallet state, receipts, chapter context, and proof.",
  },
  {
    id: "evolve",
    verb: "Evolve",
    label: "Public status movement",
    status: "READ_ONLY",
    body:
      "Evolution, Registry, Activity, and future episodes show what changed, what is blocked, and what needs approval.",
  },
];

export const HOME_CANDIDATE_MODULES: readonly HomeCandidateModule[] = [
  {
    id: "membership-join",
    label: "Membership / Join",
    route: "/join",
    status: "LIVE",
    promise: "Take a seat, receive SYN, and create a verifiable receipt.",
    boundary: "Public/default purchases use ZERO_SOURCE_ID.",
  },
  {
    id: "my-syndicate",
    label: "My Syndicate",
    route: "/my-syndicate",
    status: "LIVE",
    promise: "Wallet-scoped seat, receipt, memory, and proof context.",
    boundary: "Reserved slots stay non-actionable until approved.",
  },
  {
    id: "activity",
    label: "Activity",
    route: "/activity",
    status: "READ_ONLY",
    promise: "Protocol heartbeat and proof events.",
    boundary: "Events explain state; they do not grant controls.",
  },
  {
    id: "transparency",
    label: "Transparency",
    route: "/transparency",
    status: "READ_ONLY",
    promise: "Routing and money movement proof.",
    boundary: "Money proof is not a promise to participants.",
  },
  {
    id: "registry",
    label: "Registry",
    route: "/registry",
    status: "READ_ONLY",
    promise: "Canonical contracts, wallets, and status proof.",
    boundary: "No registry switch or owner action exists here.",
  },
  {
    id: "evolution",
    label: "Evolution",
    route: "/evolution",
    status: "READ_ONLY",
    promise: "Evidence-backed protocol status and episodes.",
    boundary: "A status board cannot activate a future system.",
  },
  {
    id: "archive-memory",
    label: "Archive Memory",
    route: "/archive and /nft",
    status: "LIVE_MEMORY",
    promise: "Archive1155 records memory where live and configured.",
    boundary: "Artifacts are memory, not seats or financial rights.",
  },
  {
    id: "referral-verified-introduction",
    label: "Referral / Verified Introduction",
    route: "/referral and hidden review",
    status: "IN_REVIEW",
    promise: "Source attribution is direction-approved as a model, not launched.",
    boundary: "No public source link, dashboard, alias, or claim UI.",
  },
  {
    id: "seat-record-721",
    label: "SeatRecord721",
    route: "none",
    status: "FUTURE",
    promise: "Future identity infrastructure.",
    boundary: "No contract, claim path, or mint path exists in this slice.",
  },
  {
    id: "archive-evolution",
    label: "Archive Evolution",
    route: "none",
    status: "FUTURE",
    promise: "Future memory or commerce work would require a separate packet.",
    boundary: "No wrapper, router, or source-aware product path begins here.",
  },
];

export const HOME_CANDIDATE_PROOF_POINTS: readonly HomeCandidateProofPoint[] = [
  {
    id: "buy-target",
    label: "Current buy target",
    value: "MembershipSaleV3 through /join",
    status: "LIVE",
  },
  {
    id: "default-source",
    label: "Default source",
    value: ZERO_SOURCE_ID,
    status: "LIVE",
  },
  {
    id: "receipt-routing",
    label: "Receipt and routing proof",
    value: "SYN received, USDC routed 70 / 20 / 10, receipt verifiable",
    status: "READ_ONLY",
  },
  {
    id: "capital-footprint",
    label: "Capital footprint",
    value: "Verified USDC routed is visible proof and one recognition axis, not member identity.",
    status: "READ_ONLY",
  },
  {
    id: "verification-surfaces",
    label: "Verification surfaces",
    value: "Activity, Transparency, Registry, My Syndicate",
    status: "READ_ONLY",
  },
  {
    id: "source-boundary",
    label: "Source boundary",
    value: "/referral inactive; no public source-aware buy path",
    status: "INACTIVE",
  },
];

export const HOME_CANDIDATE_JOURNEY: readonly HomeCandidateJourneyStep[] = [
  {
    id: "visitor",
    label: "Visitor",
    visitorState: "Understands the institution in seconds.",
    receives: [
      "A plain explanation of the seat",
      "Visible proof surfaces",
      "Clear current status",
    ],
    nextSurface: "Preview action: Join / Verify",
  },
  {
    id: "buyer",
    label: "Buyer",
    visitorState: "Chooses the live membership path.",
    receives: [
      "SYN delivered to the wallet",
      "Receipt context",
      "USDC routing proof",
    ],
    nextSurface: "Live destination: /join",
  },
  {
    id: "member",
    label: "Member",
    visitorState: "Returns to wallet-scoped proof.",
    receives: [
      "Member number and chapter context",
      "SYN and purchase history",
      "Memory and proof surfaces",
    ],
    nextSurface: "Return destination: /my-syndicate",
  },
  {
    id: "returning-member",
    label: "Returning Member",
    visitorState: "Follows what changed.",
    receives: [
      "Activity and Registry proof",
      "Evolution episodes",
      "Archive memory where live",
    ],
    nextSurface: "Read-only destinations: Activity / Evolution / Archive",
  },
];

export const HOME_CANDIDATE_EPISODES: readonly HomeCandidateEpisode[] = [
  {
    id: "protocol-deployed",
    label: "Protocol deployed",
    status: "LIVE",
    note: "Contracts and wallets are public and verifiable from Registry.",
  },
  {
    id: "v3-live",
    label: "MembershipSaleV3 live",
    status: "LIVE",
    note: "The live public membership path is /join with ZERO_SOURCE_ID by default.",
  },
  {
    id: "source-proven-internally",
    label: "Source infrastructure proven internally",
    status: "READ_ONLY",
    note:
      "One controlled source-attributed receipt exists as proof; public source product remains inactive.",
  },
  {
    id: "verified-introduction-review",
    label: "Verified Introduction V1 in review",
    status: "IN_REVIEW",
    note: "Direction approved, launch unapproved, no public controls.",
  },
  {
    id: "mvp-reality-map",
    label: "MVP Reality Map",
    status: "HIDDEN_REVIEW",
    note: "Founder-visible product reality map is hidden and noindex.",
  },
  {
    id: "home-studio",
    label: "Home Studio",
    status: "HIDDEN_REVIEW",
    note: "Founder-visible direction studio is hidden and noindex.",
  },
  {
    id: "home-candidate",
    label: "Production Home Candidate",
    status: "HIDDEN_REVIEW",
    note:
      "This visual candidate can be approved, revised, or rejected before any production homepage replacement.",
  },
];

export const HOME_CANDIDATE_TRUST_BOUNDARIES: readonly string[] = [
  "No financial-return framing.",
  "No governance promise.",
  "No public referral activation.",
  "No public source link.",
  "No source dashboard.",
  "No claim UI.",
  "No alias route.",
  "No public source-aware buy path.",
  "Archive artifacts are memory, not financial rights.",
  "SeatRecord721 is future, not live.",
  "Production / is not replaced by this route.",
];

export const HOME_CANDIDATE_CHANNELS = [
  { label: "X", value: "https://x.com/TheSyndicateOne" },
  { label: "Telegram", value: "https://t.me/TheSyndicateMoney" },
] as const;

export const HOME_CANDIDATE_FOUNDER_DECISIONS: readonly HomeCandidateDecision[] = [
  {
    id: "approve-direction",
    label: "Approve direction",
    meaning:
      "Use this as the base for a later public homepage replacement pass.",
    nextStep:
      "Prepare production / copy and component migration only after explicit approval.",
  },
  {
    id: "revise-candidate",
    label: "Revise",
    meaning:
      "Keep the hidden route and adjust tone, order, density, or first-viewport emphasis.",
    nextStep:
      "Return another hidden candidate without touching production /.",
  },
  {
    id: "reject-candidate",
    label: "Reject",
    meaning:
      "Keep the current production cockpit and treat this candidate as archive learning.",
    nextStep:
      "No production change; record why the direction failed.",
  },
];

export function getHomeCandidateModule(
  id: string,
): HomeCandidateModule | undefined {
  return HOME_CANDIDATE_MODULES.find((module) => module.id === id);
}
