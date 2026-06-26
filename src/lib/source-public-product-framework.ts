import { ZERO_SOURCE_ID } from "./source-policy-observability";

export type SourcePublicProductDecisionStatus =
  "FRAMEWORK_DEFINED_PUBLIC_PRODUCT_NOT_APPROVED";

export type SourcePublicProductLaunchPosture =
  "DO_NOT_LAUNCH_PUBLIC_PRODUCT_YET";

export type SourcePublicProductV1Shape = {
  readonly id: "verified-introduction-v1";
  readonly status: SourcePublicProductDecisionStatus;
  readonly launchPosture: SourcePublicProductLaunchPosture;
  readonly userFacingName: "Verified Introduction";
  readonly protocolName: "Source Attribution";
  readonly accountingName: "Acquisition Source";
  readonly publicNameToAvoidAsPrimary: "Referral";
  readonly scope: "MEMBERSHIP_SALE_V3_ONLY";
  readonly accessModel: "INVITE_ONLY_MANUAL_APPROVAL";
  readonly sourceEligibility: readonly SourceEligibilityRule[];
  readonly buyerExperience: readonly BuyerExperienceRule[];
  readonly payoutPolicy: readonly PayoutPolicyRule[];
  readonly antiAbuseRules: readonly AntiAbuseRule[];
  readonly mandatoryReadbacks: readonly MandatoryReadbackRule[];
  readonly productionQa: readonly ProductionQaRule[];
  readonly v1Exclusions: readonly V1Exclusion[];
  readonly buyerDisclosureTemplate: string;
  readonly founderApprovalRequired: true;
  readonly defaultPublicSourceId: typeof ZERO_SOURCE_ID;
};

export type SourceEligibilityRule = {
  readonly id: string;
  readonly decision: string;
  readonly reason: string;
};

export type BuyerExperienceRule = {
  readonly id: string;
  readonly requirement: string;
  readonly why: string;
};

export type PayoutPolicyRule = {
  readonly id: string;
  readonly policy: string;
  readonly boundary: string;
};

export type AntiAbuseRule = {
  readonly id: string;
  readonly risk: string;
  readonly requiredControl: string;
};

export type MandatoryReadbackRule = {
  readonly id: string;
  readonly readback: string;
  readonly requiredBefore: string;
};

export type ProductionQaRule = {
  readonly id: string;
  readonly check: string;
  readonly passCondition: string;
};

export type V1Exclusion = {
  readonly id: string;
  readonly exclusion: string;
  readonly reason: string;
};

export const SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION: SourcePublicProductV1Shape = {
  id: "verified-introduction-v1",
  status: "FRAMEWORK_DEFINED_PUBLIC_PRODUCT_NOT_APPROVED",
  launchPosture: "DO_NOT_LAUNCH_PUBLIC_PRODUCT_YET",
  userFacingName: "Verified Introduction",
  protocolName: "Source Attribution",
  accountingName: "Acquisition Source",
  publicNameToAvoidAsPrimary: "Referral",
  scope: "MEMBERSHIP_SALE_V3_ONLY",
  accessModel: "INVITE_ONLY_MANUAL_APPROVAL",
  founderApprovalRequired: true,
  defaultPublicSourceId: ZERO_SOURCE_ID,
  sourceEligibility: [
    {
      id: "manual-approval",
      decision:
        "Every V1 source must be manually approved by the founder/operator before a source record can be ACTIVE for public use.",
      reason:
        "The completed internal proof validated the engine, not open onboarding, public source creation, or self-serve referral behavior.",
    },
    {
      id: "membership-only-scope",
      decision:
        "V1 can attribute MembershipSaleV3 purchases only. Archive1155, SeatRecord721, SwapRail, ProductSaleRouter, premium products, and future commerce remain excluded.",
      reason:
        "Only MembershipSaleV3 reads SourceRegistryV1 today and emits the source-attributed receipt fields needed for proof.",
    },
    {
      id: "source-class-by-packet",
      decision:
        "Each source class must be declared in the source packet. MEMBER_INTRODUCTION requires the referrer/source wallet to remain seated; other classes require explicit founder approval.",
      reason:
        "Source classes have different legal, behavioral, and anti-abuse meanings; V1 must not collapse them into one generic referral program.",
    },
    {
      id: "no-public-self-service",
      decision:
        "V1 does not allow users to create source records, generate source links, or enroll as sources from the public site.",
      reason:
        "Public source onboarding is a separate product, compliance, abuse, and operational problem that the internal proof did not solve.",
    },
  ],
  buyerExperience: [
    {
      id: "source-preview-before-signature",
      requirement:
        "Before wallet signature, the buyer must see the source label, source status, source class, commission bps, source wallet or display identity, gross amount, acquisition commission, and Net USDC Routed.",
      why:
        "A buyer should never sign a non-zero source purchase without understanding how the payment routes.",
    },
    {
      id: "clear-source-control",
      requirement:
        "The buyer must be able to clear the source and continue through the standard ZERO_SOURCE_ID path before signing.",
      why:
        "Verified introduction should preserve buyer judgment, not trap attribution through hidden state.",
    },
    {
      id: "active-status-hard-gate",
      requirement:
        "The source-aware buy path must hard-fail unless latest readback confirms sourceExists(sourceId), status ACTIVE, valid terms, and isActive(sourceId) true.",
      why:
        "A stale link, paused source, revoked source, or expired terms window must never become a successful source-attributed purchase.",
    },
  ],
  payoutPolicy: [
    {
      id: "direct-payout-first",
      policy:
        "V1 uses the contract's direct source payout path when the payment succeeds.",
      boundary:
        "Direct payout is acquisition commission for a verified purchase, not yield, passive income, ownership, or revenue share.",
    },
    {
      id: "escrow-fallback-no-claim-ui",
      policy:
        "If direct payout fails and escrow is owed, V1 records the escrow readback operationally; claim UI remains excluded.",
      boundary:
        "Escrow fallback is a failure-state recovery path, not a public claim product.",
    },
  ],
  antiAbuseRules: [
    {
      id: "self-source-block",
      risk: "Buyer attempts to source their own purchase.",
      requiredControl:
        "Reject source wallet/buyer overlap, preserve contract guard behavior, and show a clear failure state.",
    },
    {
      id: "historical-wallet-block",
      risk: "Historical or already seated wallet attempts to create a new source-attributed first-purchase event.",
      requiredControl:
        "Keep historical-member and already-seated wallet guards active; source-attributed V1 is for eligible MembershipSaleV3 purchases only.",
    },
    {
      id: "source-hijack-block",
      risk: "Hidden browser state, copied links, or last-click behavior silently changes the buyer's source.",
      requiredControl:
        "Do not rely on invisible cookies/session tracking in V1; show the source before signature and allow clearing it.",
    },
    {
      id: "cap-and-window-monitoring",
      risk: "A source exceeds gross cap, per-buyer cap, repeat-purchase rule, or approved time window.",
      requiredControl:
        "Read source terms before buy, display applicable limits, and fail closed when terms are exhausted or expired.",
    },
    {
      id: "promotion-conduct",
      risk: "A source implies official representation, guaranteed reward, yield, downline, or member ownership.",
      requiredControl:
        "Require source packet acknowledgments, prohibited promotion rules, and revocation authority before launch.",
    },
  ],
  mandatoryReadbacks: [
    {
      id: "source-registry-current-authority",
      readback:
        "chain ID 43114, SourceRegistryV1 bytecode, owner, pendingOwner if available, sourceExists, sourceConfig, status, isActive, source wallet, payout wallet, commission bps, caps, scope, repeat flag, and metadata hash.",
      requiredBefore: "Any source-aware public release, source status change, or launch QA signoff.",
    },
    {
      id: "membership-sale-wiring",
      readback:
        "MembershipSaleV3 bytecode exists, sale is the current frontend buy target, sale is wired to SourceRegistryV1, sale paused/unpaused status is known, and public/default buy remains ZERO_SOURCE_ID.",
      requiredBefore: "Any V1 source-aware purchase path can be exposed.",
    },
    {
      id: "post-purchase-receipt",
      readback:
        "MembershipPurchasedV3 receipt, sourceId, sourceClass, sourceWallet, commissionBps, acquisitionCost, Net USDC Routed, Vault/Liquidity/Operations routing, payout wallet balance change, and sourceEscrowOwed.",
      requiredBefore: "Any Activity, My Syndicate, Transparency, Register, or Chronicle claim about a source-attributed purchase.",
    },
  ],
  productionQa: [
    {
      id: "default-join-zero-source",
      check: "/join public/default path",
      passCondition:
        "Public/default buys still call MembershipSaleV3 with ZERO_SOURCE_ID unless the buyer explicitly enters an approved source-aware path and sees the source before signing.",
    },
    {
      id: "no-fake-live-surfaces",
      check: "/referral, /registry, /activity, /my-syndicate, /transparency, /evolution, sitemap, robots",
      passCondition:
        "No claim UI, source dashboard, public source directory, public source creation, financial leaderboard, or product-wide attribution appears.",
    },
    {
      id: "source-aware-path-is-exact",
      check: "Approved source-aware path",
      passCondition:
        "Only the approved sourceId, source terms, buyer disclosure, clear-source control, and ACTIVE readback can unlock the source-aware buy action.",
    },
  ],
  v1Exclusions: [
    {
      id: "no-claim-ui",
      exclusion: "Claim UI and claim balances",
      reason:
        "The first completed lifecycle had zero escrow owed; claim UX remains a separate legal, accounting, readback, and failure-state product.",
    },
    {
      id: "no-source-dashboard",
      exclusion: "Source dashboard",
      reason:
        "A dashboard can turn acquisition proof into money-game psychology before disclosure, anti-abuse, and reporting are ready.",
    },
    {
      id: "no-aliases",
      exclusion: "Human-readable aliases or code registry",
      reason:
        "Aliases create collision, impersonation, support, and governance questions. V1 should prove source links without an alias layer.",
    },
    {
      id: "no-product-wide-attribution",
      exclusion: "Product-wide attribution",
      reason:
        "Only MembershipSaleV3 is source-aware. Other products need their own contract/read-model/receipt design.",
    },
    {
      id: "no-open-member-referral",
      exclusion: "Open self-serve member referral program",
      reason:
        "A seated-member introduction program needs separate eligibility, abuse, source creation, disclosure, and support design.",
    },
  ],
  buyerDisclosureTemplate:
    "This purchase is linked to an approved source. If you continue, the displayed acquisition commission will be paid to the approved source payout wallet and the remaining USDC will route through the protocol split. This does not change your seat, price, rights, or membership. You may clear this source and continue through the standard ZERO_SOURCE_ID path before signing.",
} as const;

export function getSourcePublicProductDecisionAnswer(questionId: number): string {
  const answers: Record<number, string> = {
    1: "Use Verified Introduction for buyer-facing language, Source Attribution for protocol language, and Acquisition Source for accounting. Do not lead with Referral as the public product name.",
    2: "V1 is MembershipSaleV3-only and explicitly not product-wide.",
    3: "Only founder/operator-approved sources with a source packet and source record can become V1 sources.",
    4: "A source must be seated only when the chosen source class is MEMBER_INTRODUCTION; other source classes need explicit approval instead.",
    5: "Yes. V1 requires manual approval.",
    6: "No. Aliases should be excluded from V1.",
    7: "Yes. Buyers must see and clear a source before signing.",
    8: "Direct payout first, escrow fallback only if direct payout fails.",
    9: "Yes. Claim UI is excluded from V1.",
    10: "Yes. Source dashboards are excluded from V1.",
    11: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.buyerDisclosureTemplate,
    12: "V1 requires manual source approval, self-source blocking, historical/already-seated wallet guards, visible source confirmation, caps/window checks, and prohibited promotion rules.",
    13: "Latest-chain SourceRegistryV1, sourceConfig/isActive/status, MembershipSaleV3 wiring, public ZERO_SOURCE_ID, receipt, payout, escrow, and route QA readbacks are mandatory.",
    14: "GitHub validation, Replit sync/publish decision, route QA, sitemap/robots checks, anti-leakage checks, source-aware path gating, and no fake-live wording must pass.",
    15: "V1 must not include claim UI, source dashboards, aliases, open self-serve referral, product-wide attribution, public source creation, non-zero default /join, or financial-leaderboard/yield/MLM framing.",
  };

  return answers[questionId] ?? "Unknown public source product decision question.";
}
