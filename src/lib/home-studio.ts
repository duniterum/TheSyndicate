import { ZERO_SOURCE_ID } from "./source-policy-observability";

export type HomeStudioStatus =
  | "LIVE"
  | "READ_ONLY"
  | "INACTIVE"
  | "HIDDEN_REVIEW"
  | "CANDIDATE"
  | "FUTURE"
  | "BLOCKED_NOW";

export type HomeDirectionId =
  | "production-trust-home"
  | "living-institution-home"
  | "member-journey-home"
  | "proof-first-institution-home";

export type HomeBaselineFinding = {
  readonly id: string;
  readonly label: string;
  readonly status: HomeStudioStatus;
  readonly currentTruth: string;
  readonly founderRead: string;
};

export type HomeDirection = {
  readonly id: HomeDirectionId;
  readonly label: string;
  readonly status: HomeStudioStatus;
  readonly promise: string;
  readonly bestFor: string;
  readonly preserves: readonly string[];
  readonly risks: readonly string[];
  readonly firstViewport: readonly string[];
};

export type VisibilityStandardItem = {
  readonly status: HomeStudioStatus;
  readonly meaning: string;
  readonly mayShow: string;
  readonly mustNotShow: string;
};

export type PublicDriftFinding = {
  readonly id: string;
  readonly surface: string;
  readonly status: HomeStudioStatus;
  readonly finding: string;
  readonly action: string;
};

export type FounderDecision = {
  readonly id: string;
  readonly label: string;
  readonly decision: string;
  readonly safeNextStep: string;
};

export const HOME_STUDIO_REVIEW_TOKEN = "SYNDICATE_HOME_STUDIO";
export const HOME_STUDIO_ROUTE = "/labs/home-studio";
export const HOME_STUDIO_ROUTE_WITH_REVIEW = `${HOME_STUDIO_ROUTE}?review=${HOME_STUDIO_REVIEW_TOKEN}`;

export const HOME_STUDIO_BOUNDARIES = {
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
  replacesProductionHome: false,
  publicJoinDefaultSourceId: ZERO_SOURCE_ID,
  referralActive: false,
  publicSourceLinksActive: false,
  sourceDashboardActive: false,
  claimUiActive: false,
  aliasRoutesActive: false,
  publicSourceAwareBuyPathActive: false,
  registrySwitch: false,
  contractChange: false,
} as const;

export const HOME_BASELINE_FINDINGS: readonly HomeBaselineFinding[] = [
  {
    id: "first-viewport",
    label: "First viewport",
    status: "LIVE",
    currentTruth:
      "Production leads with the seat, on-chain routing, proof status, and direct join/verify intent.",
    founderRead:
      "Strong trust baseline. The visitor can see this is real before reading long-form doctrine.",
  },
  {
    id: "living-institution",
    label: "Living institution signal",
    status: "READ_ONLY",
    currentTruth:
      "The homepage already includes a Living institution / five views surface and status boundaries.",
    founderRead:
      "The thesis exists in production, but it competes with many proof modules below the hero.",
  },
  {
    id: "member-journey",
    label: "Member journey",
    status: "LIVE",
    currentTruth:
      "Join, My Syndicate, Activity, Archive, Chronicle, Registry, and Evolution form a real journey.",
    founderRead:
      "The journey is true, but the homepage still asks the visitor to infer the story from many panels.",
  },
  {
    id: "future-boundaries",
    label: "Future boundaries",
    status: "READ_ONLY",
    currentTruth:
      "Future recognition, source attribution, SeatRecord721, SwapRail, and ProductSaleRouter are labeled as reserved, paused, planned, or future.",
    founderRead:
      "The safety posture is strong. The next risk is copy drift, not missing mechanics.",
  },
  {
    id: "source-referral",
    label: "Source/referral truth",
    status: "INACTIVE",
    currentTruth:
      "/referral is noindex and status-only; public/default /join remains ZERO_SOURCE_ID.",
    founderRead:
      "This stays outside the home decision. Home can mention reserved growth only if it remains non-actionable.",
  },
];

export const HOME_DIRECTIONS: readonly HomeDirection[] = [
  {
    id: "production-trust-home",
    label: "Production Trust Home",
    status: "CANDIDATE",
    promise:
      "Keep the current cockpit posture: proof, routing, live protocol status, then narrative.",
    bestFor:
      "A cautious launch where the founder wants maximum trust and minimum interpretive risk.",
    preserves: [
      "Existing proof-first hero.",
      "Direct join and verify intent.",
      "Current public route order and release risk.",
      "No new product promises.",
    ],
    risks: [
      "The living-society idea can feel like a section instead of the spine.",
      "Cold visitors may understand the machine before they feel why it matters.",
    ],
    firstViewport: [
      "Take your seat in a living protocol.",
      "Your seat is on-chain.",
      "Every USDC route is verifiable.",
      "Join and verify remain the only actions.",
    ],
  },
  {
    id: "living-institution-home",
    label: "Living Institution Home",
    status: "CANDIDATE",
    promise:
      "Make the homepage read as one institution becoming in public: spine, pulse, memory, proof, place.",
    bestFor:
      "A founder review where meaning and return behavior must become as visible as proof.",
    preserves: [
      "Proof as the floor.",
      "Current live modules.",
      "No future module activation.",
      "No homepage replacement without founder approval.",
    ],
    risks: [
      "If over-written, it could sound abstract.",
      "Needs strict simple language so it does not become internal doctrine on a public page.",
    ],
    firstViewport: [
      "A transparent on-chain society forming in public.",
      "Seat, receipt, memory, and proof visible from the start.",
      "A heartbeat that changes only when the chain changes.",
      "One primary join action and one verify action.",
    ],
  },
  {
    id: "member-journey-home",
    label: "Member Journey Home",
    status: "CANDIDATE",
    promise:
      "Explain the site through the visitor's arc: watch, join, receive SYN, verify, return, remember.",
    bestFor:
      "A conversion-focused homepage that still avoids hype and keeps proof close.",
    preserves: [
      "SYN as the V1 seat.",
      "My Syndicate as the member home.",
      "Activity and Archive as memory surfaces.",
      "Join as the only live write path.",
    ],
    risks: [
      "Can become too member-centric if it underplays public proof.",
      "Future identity language must not imply SeatRecord721 exists today.",
    ],
    firstViewport: [
      "You can become Member #N.",
      "The wallet receives SYN.",
      "The receipt proves routing.",
      "My Syndicate becomes the return home.",
    ],
  },
  {
    id: "proof-first-institution-home",
    label: "Proof-First Institution Home",
    status: "CANDIDATE",
    promise:
      "A balanced option: lead with living institution language, then immediately prove the engine.",
    bestFor:
      "The likely best next homepage candidate if the founder wants 70% trust and 30% aspiration.",
    preserves: [
      "The current trust cockpit.",
      "A clearer living-protocol thesis.",
      "The one-minute explanation test.",
      "Visible status discipline for future modules.",
    ],
    risks: [
      "Requires careful sequencing, not more components.",
      "Founder must approve exact public copy before replacing production home.",
    ],
    firstViewport: [
      "The Syndicate is a transparent on-chain protocol where every member is recorded and every dollar is routed.",
      "Live heartbeat: members, USDC routed, vault, last join.",
      "Why now: the institution is forming in public.",
      "Actions: Join or verify.",
    ],
  },
];

export const EVOLUTION_VISIBILITY_STANDARD: readonly VisibilityStandardItem[] = [
  {
    status: "LIVE",
    meaning: "Backed by deployed contracts, current reads, or a mounted production route.",
    mayShow: "User action, live proof, current state, and direct verification.",
    mustNotShow: "Anything future or approval-gated as if it were usable.",
  },
  {
    status: "READ_ONLY",
    meaning: "Visible as proof, explanation, memory, or education only.",
    mayShow: "Evidence, status, history, public route context, and boundaries.",
    mustNotShow: "Controls that change state.",
  },
  {
    status: "INACTIVE",
    meaning: "Infrastructure or route exists, but the product behavior is not active.",
    mayShow: "Paused status, current blockers, and required approvals.",
    mustNotShow: "Source links, dashboards, balances, claims, or buy paths.",
  },
  {
    status: "HIDDEN_REVIEW",
    meaning: "Direct-URL internal founder/operator review surface.",
    mayShow: "Decision models, audits, candidates, and release-readiness notes.",
    mustNotShow: "Public nav, sitemap entry, wallet controls, or activation controls.",
  },
  {
    status: "CANDIDATE",
    meaning: "A possible public direction that still needs founder approval.",
    mayShow: "Comparison, expected ordering, and risk notes.",
    mustNotShow: "Live-user copy that implies the decision has been made.",
  },
  {
    status: "FUTURE",
    meaning: "Named later system with no current implementation authority.",
    mayShow: "Plain reserved language and dependency list.",
    mustNotShow: "Launch dates, user action, claim flow, or guaranteed outcome.",
  },
  {
    status: "BLOCKED_NOW",
    meaning: "Explicitly prohibited until a separate approval and release packet exists.",
    mayShow: "The reason it is blocked.",
    mustNotShow: "A workaround, preview control, or public shortcut.",
  },
];

export const PUBLIC_DRIFT_AUDIT: readonly PublicDriftFinding[] = [
  {
    id: "home-proof-heavy",
    surface: "/",
    status: "READ_ONLY",
    finding:
      "No blocking contradiction found in the live/repo baseline. The homepage is proof-heavy and safe, but the living-institution thesis is not yet the first organising principle.",
    action:
      "Founder should choose whether to keep the cockpit order or approve a later homepage candidate copy/order pass.",
  },
  {
    id: "referral-status-only",
    surface: "/referral",
    status: "INACTIVE",
    finding:
      "The route remains noindex and status-only. It names the paused source record and says no commission, no claim, no public source-aware path.",
    action:
      "Do not pull referral into the homepage except as reserved/inactive institutional growth context.",
  },
  {
    id: "join-zero-source",
    surface: "/join",
    status: "LIVE",
    finding:
      "The live membership path remains the only buy path and defaults public source attribution to ZERO_SOURCE_ID.",
    action:
      "Keep this unchanged. Any non-zero source path requires a separate founder-approved launch packet.",
  },
  {
    id: "archive-nft-distinction",
    surface: "/archive and /nft",
    status: "LIVE",
    finding:
      "Archive1155 memory is live where configured, while SeatRecord721 stays future and separate. Public copy already distinguishes SYN as the seat and artifacts as memory.",
    action:
      "Keep future identity and Archive evolution out of this slice.",
  },
  {
    id: "evolution-standard",
    surface: "/evolution",
    status: "READ_ONLY",
    finding:
      "Evolution is a strong read-only status board, but future homepage work needs one shared status vocabulary so modules never appear fake-live.",
    action:
      "Use the Evolution Visibility Standard before any public homepage replacement.",
  },
];

export const FOUNDER_HOME_DECISIONS: readonly FounderDecision[] = [
  {
    id: "choose-home-direction",
    label: "Choose a homepage direction",
    decision:
      "Keep Production Trust Home, move toward Living Institution Home, move toward Member Journey Home, or approve the Proof-First Institution blend as a candidate.",
    safeNextStep:
      "Codex may prepare exact public homepage copy/order only after explicit founder approval.",
  },
  {
    id: "approve-status-standard",
    label: "Approve visibility vocabulary",
    decision:
      "Adopt LIVE / READ_ONLY / INACTIVE / HIDDEN_REVIEW / CANDIDATE / FUTURE / BLOCKED_NOW as the permanent public-truth standard.",
    safeNextStep:
      "Apply the standard in a later copy pass, not in this hidden review slice.",
  },
  {
    id: "decide-public-drift-fixes",
    label: "Decide drift fixes",
    decision:
      "Treat current drift as reported, not patched, unless the founder asks for public copy changes.",
    safeNextStep:
      "Keep production unchanged until a public-home replacement is explicitly approved.",
  },
];

export function getHomeDirection(id: HomeDirectionId): HomeDirection | undefined {
  return HOME_DIRECTIONS.find((direction) => direction.id === id);
}
