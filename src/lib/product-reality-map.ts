import { ZERO_SOURCE_ID } from "./source-policy-observability";
import { VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET } from "./verified-introduction-v1-founder-launch-decision";

export type ProductRealityStatus =
  | "LIVE"
  | "INACTIVE"
  | "HIDDEN_REVIEW"
  | "FUTURE"
  | "FORBIDDEN";

export type ProductRealitySurface = {
  readonly id: string;
  readonly label: string;
  readonly route: string;
  readonly status: ProductRealityStatus;
  readonly audience: string;
  readonly userSees: string;
  readonly userCanDo: string;
  readonly statusOnly: string;
  readonly hiddenInternal: string;
  readonly future: string;
  readonly confusionRisk: string;
};

export type MemberRealityItem = {
  readonly id: string;
  readonly label: string;
  readonly status: ProductRealityStatus;
  readonly reality: string;
};

export type VerifiedIntroductionRealityItem = {
  readonly id: string;
  readonly label: string;
  readonly status: ProductRealityStatus;
  readonly reality: string;
};

export type ProductRealityMatrixColumn =
  | "liveNow"
  | "hiddenReviewOnly"
  | "verifiedIntroductionV1Candidate"
  | "v2Candidate"
  | "futureSeatRecordErc721"
  | "futureArchiveNft"
  | "forbiddenNow";

export type ProductRealityMatrixRow = {
  readonly action: string;
  readonly liveNow?: true;
  readonly hiddenReviewOnly?: true;
  readonly verifiedIntroductionV1Candidate?: true;
  readonly v2Candidate?: true;
  readonly futureSeatRecordErc721?: true;
  readonly futureArchiveNft?: true;
  readonly forbiddenNow?: true;
  readonly note: string;
};

export type ProductRealityPhase = {
  readonly id: string;
  readonly label: string;
  readonly items: readonly string[];
};

export type ProductRealityDecisionOption = {
  readonly id: string;
  readonly label: string;
  readonly meaning: string;
};

export const PRODUCT_REALITY_REVIEW_TOKEN = "SYNDICATE_MVP_REALITY";
export const PRODUCT_REALITY_ROUTE = "/labs/product-reality-map";
export const PRODUCT_REALITY_ROUTE_WITH_REVIEW = `${PRODUCT_REALITY_ROUTE}?review=${PRODUCT_REALITY_REVIEW_TOKEN}`;

export const PRODUCT_REALITY_BOUNDARIES = {
  hidden: true,
  noindex: true,
  nofollow: true,
  directUrlOnly: true,
  absentFromPublicNavigation: true,
  absentFromSitemap: true,
  walletControls: false,
  buyControls: false,
  activationControls: false,
  publicJoinDefaultSourceId: ZERO_SOURCE_ID,
  referralActive: false,
  verifiedIntroductionLaunchApproved:
    VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET.launchApproved,
  verifiedIntroductionPublicControlsApproved:
    VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET.publicControlsApproved,
} as const;

export const PRODUCT_REALITY_SURFACES: readonly ProductRealitySurface[] = [
  {
    id: "home",
    label: "Home",
    route: "/",
    status: "LIVE",
    audience: "Public visitors and returning members.",
    userSees:
      "The protocol story, membership as the seat, proof surfaces, and the join path.",
    userCanDo:
      "Read the institution, open public proof routes, and move toward /join.",
    statusOnly:
      "Future recognition and source attribution are framed as reserved or pending, not active.",
    hiddenInternal: "No labs or source-aware controls are exposed from home.",
    future:
      "Future surfaces may become visible only after their own intake, proof, and approval gates.",
    confusionRisk:
      "Visitors could mistake future recognition language for a live system if status labels drift.",
  },
  {
    id: "join",
    label: "Join",
    route: "/join",
    status: "LIVE",
    audience: "Public buyers and connected wallets.",
    userSees:
      "MembershipSaleV3, deterministic era pricing, SYN received, USDC routing, member card context, and receipt expectations.",
    userCanDo:
      "Connect wallet, approve USDC, buy membership, receive SYN, and verify the receipt.",
    statusOnly:
      "Referral attribution is a note only; public/default buys use ZERO_SOURCE_ID.",
    hiddenInternal:
      "Verified Introduction buyer skeleton is not mounted here and no source selector is present.",
    future:
      "A source-aware path can exist only after a separate founder launch decision and release packet.",
    confusionRisk:
      "The founder should watch for any non-zero public sourceId, source selector, or source-coded buy path.",
  },
  {
    id: "my-syndicate",
    label: "My Syndicate",
    route: "/my-syndicate",
    status: "LIVE",
    audience: "Connected wallets, members, and observer wallets.",
    userSees:
      "Seat state, member number when known, SYN acquired, receipt/routing context, memory, proof, and pending horizon slots.",
    userCanDo:
      "Connect wallet, inspect wallet-scoped state, open proof routes, and navigate to the live join path when unseated.",
    statusOnly:
      "Referral, SeatRecord721, Privy/account, and advanced recognition slots remain pending or reserved.",
    hiddenInternal:
      "No source dashboard, claim control, alias creation, or public source link is exposed.",
    future:
      "Future identity, account, and source context require separate module intake and approval.",
    confusionRisk:
      "A reserved slot can look live if its label becomes too action-oriented.",
  },
  {
    id: "activity",
    label: "Activity",
    route: "/activity",
    status: "LIVE",
    audience: "Members, operators, and public verifiers.",
    userSees:
      "Protocol heartbeat events, purchase activity, archive events, and proof cards.",
    userCanDo:
      "Read and verify events; use activity as evidence, not as an action surface.",
    statusOnly:
      "The controlled source-attributed receipt is proof of internal capability, not public referral launch.",
    hiddenInternal:
      "No source activation, claim, or source-link action appears in Activity.",
    future:
      "Future source events can appear only as status-aware proof after current readbacks.",
    confusionRisk:
      "Routine events must not be treated as Chronicle entries or public product approval.",
  },
  {
    id: "transparency",
    label: "Transparency",
    route: "/transparency",
    status: "LIVE",
    audience: "Public verifiers, members, and operators.",
    userSees:
      "Routing proof, economy context, use-of-funds explanation, and source attribution proof where relevant.",
    userCanDo:
      "Inspect money movement and proof links without receiving any entitlement from the page.",
    statusOnly:
      "Source proof is read-only and keeps public/default ZERO_SOURCE_ID truth visible.",
    hiddenInternal: "No payout claim, source dashboard, or source-aware buy control.",
    future:
      "Future analytics can aggregate receipts only after privacy, source, and proof rules are approved.",
    confusionRisk:
      "Money proof must not read as a promise to participants.",
  },
  {
    id: "registry",
    label: "Registry",
    route: "/registry",
    status: "LIVE",
    audience: "Public verifiers and operators.",
    userSees:
      "Contract addresses, source policy truth, source lifecycle proof, and institutional records.",
    userCanDo: "Verify deployed addresses and current policy facts.",
    statusOnly:
      "Register memory records durable truth; it does not launch public referral.",
    hiddenInternal: "No registry switch or owner transaction is exposed.",
    future:
      "Future modules must enter the Register only when their proof and status are clear.",
    confusionRisk:
      "A source record in the Registry could be mistaken for public source activation.",
  },
  {
    id: "institutional-register",
    label: "Institutional Register",
    route: "/institutional-register",
    status: "LIVE",
    audience: "Founder, operators, public verifiers.",
    userSees:
      "Durable institutional facts and completed lifecycle memory.",
    userCanDo: "Read proof-backed memory; no user action is attached.",
    statusOnly:
      "The completed source lifecycle is institutional memory, not public product launch.",
    hiddenInternal: "No activation or Chronicle-publish control.",
    future:
      "Chronicle admission remains a separate curation decision.",
    confusionRisk:
      "Register memory can look like a product decision if not labeled as proof/memory.",
  },
  {
    id: "knowledge-map",
    label: "Knowledge Map",
    route: "/knowledge-map",
    status: "LIVE",
    audience: "Founder, operators, contributors, reviewers.",
    userSees:
      "Where protocol knowledge lives and which surfaces are authority, proof, memory, or review.",
    userCanDo: "Orient themselves before changing product or docs.",
    statusOnly: "Knowledge does not grant activation authority.",
    hiddenInternal:
      "Labs review routes may be referenced as internal surfaces but not public calls to action.",
    future:
      "New modules must be added only when their authority path exists.",
    confusionRisk:
      "Old or historical truth can override current authority if readers skip the map.",
  },
  {
    id: "evolution",
    label: "Evolution",
    route: "/evolution",
    status: "LIVE",
    audience: "Members, founder, operators, public verifiers.",
    userSees:
      "Read-only module status, lifecycle proof, and evidence-backed protocol movement.",
    userCanDo: "Read what evolved and what remains blocked.",
    statusOnly:
      "Evolution explains state; it does not change state or authorize new systems.",
    hiddenInternal: "No governance, source action, or future-module action.",
    future:
      "SeatRecord721, SwapRail, ProductSaleRouter, and Archive evolution remain future modules.",
    confusionRisk:
      "Roadmap visibility can become fake-live if future modules lose their blocked labels.",
  },
  {
    id: "referral",
    label: "Referral",
    route: "/referral",
    status: "INACTIVE",
    audience: "Public readers and operators checking source truth.",
    userSees:
      "Source attribution pending, one PAUSED internal source record, no commission accrual, no claim.",
    userCanDo: "Read status and proof boundaries only.",
    statusOnly:
      "SourceRegistryV1 exists; public referral and source-aware buying are not active.",
    hiddenInternal:
      "No source link, source dashboard, alias, claim UI, or source activation control.",
    future:
      "Verified Introduction V1 may become the first public candidate only after founder approval.",
    confusionRisk:
      "This is the page most likely to be misread as live referral if copy softens.",
  },
  {
    id: "archive-nft-memory",
    label: "Archive / NFT Memory",
    route: "/archive and /nft",
    status: "LIVE",
    audience: "Members, collectors, and protocol-memory readers.",
    userSees:
      "Archive1155 protocol memory and NFT/artifact ownership or mint surfaces where configured.",
    userCanDo:
      "View archive memory and interact with configured current mint surfaces if the route exposes them.",
    statusOnly:
      "Archive1155 is not source-aware, not a seat, and not a financial-rights object.",
    hiddenInternal:
      "No source attribution, SeatRecord721 identity, or future Archive evolution is live here.",
    future:
      "NFT/Archive evolution requires separate product, contract, receipt, disclosure, and approval work.",
    confusionRisk:
      "Current Archive/NFT memory can be confused with future identity or source-aware commerce.",
  },
  {
    id: "verified-introduction-review",
    label: "Labs / Verified Introduction Review",
    route: "/labs/verified-introduction-review?review=VERIFIED_INTRODUCTION_V1",
    status: "HIDDEN_REVIEW",
    audience: "Founder and operators with the direct review URL.",
    userSees:
      "Non-activating buyer skeleton, source identity preview, clear-source behavior, failure states, release QA, and founder decision packet.",
    userCanDo: "Review the model. No wallet, buy, claim, or activation control exists.",
    statusOnly:
      "Direction approved; launch, public controls, source links, aliases, dashboards, and claim UI remain unapproved.",
    hiddenInternal:
      "Noindex, direct URL only, absent from public nav and sitemap.",
    future:
      "Can prepare a launch candidate only if the founder selects that decision path.",
    confusionRisk:
      "Reviewability can be mistaken for launch approval.",
  },
  {
    id: "future-seat-record-721",
    label: "Future SeatRecord721",
    route: "none",
    status: "FUTURE",
    audience: "Future identity design only.",
    userSees: "No live route, contract, claim, or mint path.",
    userCanDo: "Nothing today.",
    statusOnly: "Mentioned only as future identity architecture.",
    hiddenInternal: "No implementation started in this slice.",
    future:
      "Requires identity spec, contract design, audit, recovery policy, read models, and activation gates.",
    confusionRisk:
      "Could be mistaken as replacing SYN as the V1 seat; it does not.",
  },
  {
    id: "future-nft-archive-evolution",
    label: "Future NFT / Archive Evolution",
    route: "none",
    status: "FUTURE",
    audience: "Future memory and commerce design only.",
    userSees: "No future evolution route, wrapper, router, or contract path.",
    userCanDo: "Nothing today.",
    statusOnly:
      "Current Archive1155 remains the live memory layer; future evolution is not started.",
    hiddenInternal: "No ProductSaleRouter, Archive wrapper, or Archive1155 V2.",
    future:
      "Requires module intake, source posture, receipt schema, legal copy, tests, and founder approval.",
    confusionRisk:
      "Future Archive/NFT work could accidentally inherit MembershipSaleV3 source terms; it must not.",
  },
];

export const MEMBER_REALITY_ITEMS: readonly MemberRealityItem[] = [
  {
    id: "connect-wallet",
    label: "Connect wallet",
    status: "LIVE",
    reality:
      "Wallet connection powers My Syndicate, member status, receipt context, and proof surfaces.",
  },
  {
    id: "buy-membership",
    label: "Buy membership through /join",
    status: "LIVE",
    reality:
      "The live write path is MembershipSaleV3 through /join; public/default sourceId remains ZERO_SOURCE_ID.",
  },
  {
    id: "view-wallet-seat",
    label: "View wallet and seat state",
    status: "LIVE",
    reality:
      "My Syndicate reads wallet state and shows member number/chapter when the holder index knows it.",
  },
  {
    id: "view-syn-usdc-receipt",
    label: "View SYN, USDC routed, and receipt context",
    status: "LIVE",
    reality:
      "Member surfaces can show SYN acquired, contribution depth, USDC routing, purchase count, and proof links.",
  },
  {
    id: "view-proof",
    label: "View Activity, Registry, and Transparency proof",
    status: "LIVE",
    reality:
      "Proof surfaces are public/read-only and derive from contract registries, events, and receipt read models.",
  },
  {
    id: "archive-memory",
    label: "View Archive/NFT memory where live",
    status: "LIVE",
    reality:
      "Archive1155 memory exists, but it is not SeatRecord721 and not source-aware.",
  },
  {
    id: "source-referral-status",
    label: "See source/referral as status-only",
    status: "INACTIVE",
    reality:
      "Referral remains inactive; members do not get a public source link, source dashboard, alias, or claim UI.",
  },
  {
    id: "seat-record-721",
    label: "SeatRecord721",
    status: "FUTURE",
    reality:
      "No claim or mint UI exists; identity work must wait until after the Verified Introduction founder decision boundary.",
  },
];

export const VERIFIED_INTRODUCTION_REALITY_ITEMS: readonly VerifiedIntroductionRealityItem[] = [
  {
    id: "direction-approved",
    label: "Direction approved",
    status: "HIDDEN_REVIEW",
    reality:
      "Verified Introduction V1 is approved as product direction only; public launch remains unapproved.",
  },
  {
    id: "buyer-skeleton",
    label: "Buyer skeleton exists",
    status: "HIDDEN_REVIEW",
    reality:
      "The review model can show source identity, accounting labels, clear-source behavior, and failure states.",
  },
  {
    id: "source-identity-preview",
    label: "Source identity preview",
    status: "HIDDEN_REVIEW",
    reality:
      "Source identity exists only as review/model data, not as a public source link or source page.",
  },
  {
    id: "clear-source",
    label: "Clear-source behavior",
    status: "HIDDEN_REVIEW",
    reality:
      "The candidate behavior returns the buyer to ZERO_SOURCE_ID; it is not mounted on /join.",
  },
  {
    id: "not-live",
    label: "Public source product not live",
    status: "INACTIVE",
    reality:
      "Generated source links, aliases, source dashboard, claim UI, and public source-aware buys are not live.",
  },
  {
    id: "founder-decision",
    label: "Founder decision required",
    status: "HIDDEN_REVIEW",
    reality:
      "The founder must choose approve-preparation, revise, defer, or reject before the next public-product step.",
  },
];

export const ACTION_ABILITY_MATRIX: readonly ProductRealityMatrixRow[] = [
  {
    action: "connect wallet",
    liveNow: true,
    note: "Used by /join and My Syndicate.",
  },
  {
    action: "buy membership",
    liveNow: true,
    note: "MembershipSaleV3 via /join with ZERO_SOURCE_ID by default.",
  },
  {
    action: "view member status",
    liveNow: true,
    note: "Derived from holder index and wallet state.",
  },
  {
    action: "view receipts",
    liveNow: true,
    note: "Purchase and proof context render from indexed receipts/events.",
  },
  {
    action: "view USDC routed",
    liveNow: true,
    note: "Routing proof appears in member and transparency surfaces.",
  },
  {
    action: "view SYN acquired",
    liveNow: true,
    note: "Member wallet and purchase context can show SYN acquired.",
  },
  {
    action: "view Activity",
    liveNow: true,
    note: "Read-only protocol heartbeat.",
  },
  {
    action: "view Registry proof",
    liveNow: true,
    note: "Contract and policy proof surface.",
  },
  {
    action: "generate source link",
    verifiedIntroductionV1Candidate: true,
    forbiddenNow: true,
    note: "Candidate only after founder approval; not live today.",
  },
  {
    action: "use source link",
    verifiedIntroductionV1Candidate: true,
    forbiddenNow: true,
    note: "No public source-aware buy path exists today.",
  },
  {
    action: "clear source",
    hiddenReviewOnly: true,
    verifiedIntroductionV1Candidate: true,
    note: "Modeled in the hidden buyer skeleton; not public /join behavior.",
  },
  {
    action: "see source identity",
    hiddenReviewOnly: true,
    verifiedIntroductionV1Candidate: true,
    note: "Review/model only until a launch candidate is approved.",
  },
  {
    action: "see acquisition commission",
    hiddenReviewOnly: true,
    verifiedIntroductionV1Candidate: true,
    note: "Accounting label is draft review; not public release copy.",
  },
  {
    action: "receive direct payout",
    verifiedIntroductionV1Candidate: true,
    forbiddenNow: true,
    note: "V1 posture is direct-payout-first only after approval and current readback.",
  },
  {
    action: "claim escrow",
    v2Candidate: true,
    forbiddenNow: true,
    note: "Contract escrow mechanics exist, but no claim UI is live.",
  },
  {
    action: "view source dashboard",
    v2Candidate: true,
    forbiddenNow: true,
    note: "Explicitly excluded from V1.",
  },
  {
    action: "create alias",
    v2Candidate: true,
    forbiddenNow: true,
    note: "Explicitly excluded from V1.",
  },
  {
    action: "claim/mint SeatRecord721",
    futureSeatRecordErc721: true,
    forbiddenNow: true,
    note: "No ERC721 identity implementation is started.",
  },
  {
    action: "view Archive NFT",
    liveNow: true,
    futureArchiveNft: true,
    note: "Current Archive/NFT memory is live; future evolution is separate.",
  },
  {
    action: "share public profile",
    liveNow: true,
    v2Candidate: true,
    note: "Member public pages exist; richer source/recognition sharing is later.",
  },
  {
    action: "receive recognition",
    liveNow: true,
    v2Candidate: true,
    note: "Current recognition is derived/read-only; future source recognition is not live.",
  },
  {
    action: "appear in Chronicle",
    liveNow: true,
    note: "Chronicle is curated; no user can force admission.",
  },
];

export const PRODUCT_REALITY_PHASES: readonly ProductRealityPhase[] = [
  {
    id: "v1",
    label: "Verified Introduction V1 candidate",
    items: [
      "Invite-only and manually approved.",
      "MembershipSaleV3 only.",
      "Buyer-visible source identity.",
      "Buyer-clearable back to ZERO_SOURCE_ID.",
      "Direct-payout-first; escrow fallback only.",
      "No open self-serve referral.",
      "No source dashboard.",
      "No alias route.",
      "No claim UI.",
      "No product-wide attribution.",
      "No multi-level referral framing.",
    ],
  },
  {
    id: "v2",
    label: "V2 candidates",
    items: [
      "Source dashboard.",
      "Custom alias.",
      "Public source links.",
      "Campaign pages.",
      "Analytics.",
      "Claim UI if escrow becomes user-facing.",
      "B2B or partner campaigns.",
      "Source reputation or connector recognition.",
    ],
  },
  {
    id: "later",
    label: "Later",
    items: [
      "SeatRecord721 identity.",
      "NFT/Archive evolution.",
      "SwapRail.",
      "ProductSaleRouter.",
      "Privy/login/account layer.",
    ],
  },
];

export const PRODUCT_REALITY_DECISION_OPTIONS: readonly ProductRealityDecisionOption[] =
  VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET.decisionOptions.map(
    (option) => ({
      id: option.id,
      label: option.label,
      meaning: option.meaning,
    }),
  );

export const PRODUCT_REALITY_PRODUCTION_DRIFT_NOTE = {
  status: "REPLIT_SYNC_MAY_BE_BEHIND_GITHUB",
  note:
    "Production may still be at 6928e27 while GitHub is b37ea67 unless Replit has synced. Syncing is useful only if the founder wants to review the latest hidden internal surface live. This model does not request publish.",
} as const;

export function getProductRealitySurface(
  id: string,
): ProductRealitySurface | undefined {
  return PRODUCT_REALITY_SURFACES.find((surface) => surface.id === id);
}

export function getProductRealityMatrixRowsFor(
  column: ProductRealityMatrixColumn,
): readonly ProductRealityMatrixRow[] {
  return ACTION_ABILITY_MATRIX.filter((row) => row[column]);
}
