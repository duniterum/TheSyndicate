import { ZERO_SOURCE_ID } from "./source-policy-observability";
import { SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION } from "./source-public-product-framework";

export type VerifiedIntroductionPhaseStatus =
  | "DONE_ENOUGH"
  | "DRAFT_BOUNDARY"
  | "AUTHORIZED_NOW"
  | "NEXT_SAFE_SPRINT"
  | "FOUNDER_APPROVAL_REQUIRED"
  | "LATER_RUNTIME_VISIBLE";

export type VerifiedIntroductionExecutionPhase = {
  readonly id: string;
  readonly title: string;
  readonly status: VerifiedIntroductionPhaseStatus;
  readonly purpose: string;
  readonly output: string;
  readonly blocks: readonly string[];
  readonly mustNotDo: readonly string[];
};

export type VerifiedIntroductionRequirement = {
  readonly id: string;
  readonly requirement: string;
  readonly before: "DESIGN" | "IMPLEMENTATION" | "WALLET_SIGNATURE" | "LAUNCH";
};

export type VerifiedIntroductionFailureState = {
  readonly id: string;
  readonly trigger: string;
  readonly requiredBehavior: string;
};

export const VERIFIED_INTRODUCTION_PRIORITY_ORDER = [
  "Verified Introduction / Source Attribution public-product path",
  "SeatRecord721 / ERC721 identity layer",
  "NFT / Archive evolution",
] as const;

export const VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE = {
  id: "verified-introduction-v1-execution-bridge",
  productId: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id,
  productName: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.userFacingName,
  directionApproved: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.directionApproved,
  launchApproved: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.launchApproved,
  implementationAuthority:
    SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.implementationAuthority,
  launchPosture: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.launchPosture,
  publicJoinDefaultSourceId: ZERO_SOURCE_ID,
  currentPhase: "PHASE_3_INTERNAL_REVIEW_SURFACE_DONE_ENOUGH",
  priorityOrder: VERIFIED_INTRODUCTION_PRIORITY_ORDER,
  phases: [
    {
      id: "phase-1-non-activating-ux-spec",
      title: "Non-activating UX/spec",
      status: "AUTHORIZED_NOW",
      purpose:
        "Define the buyer preview, disclosure, clear-source behavior, failure states, route posture, and release gates before any public source-aware path exists.",
      output:
        "A testable buyer/source experience contract that can be implemented without navigation, source links, aliases, or live public routing.",
      blocks: [
        "Any wallet signature carrying a non-zero sourceId",
        "Any public source link or source-aware public buy path",
      ],
      mustNotDo: [
        "Do not add public navigation or sitemap entries.",
        "Do not make /join use anything except ZERO_SOURCE_ID by default.",
        "Do not create claim UI, source dashboards, aliases, or source directories.",
      ],
    },
    {
      id: "phase-2-internal-implementation-skeleton",
      title: "Internal implementation skeleton",
      status: "DONE_ENOUGH",
      purpose:
        "Build read-only or hard-gated components that render source preview, clear-source, and failure states without unlocking public action.",
      output:
        "Reusable models/components that can be tested locally or behind explicit internal gates.",
      blocks: [
        "Runtime-visible public controls",
        "Production publish unless the changed surface needs explicit QA",
      ],
      mustNotDo: [
        "Do not expose a route as a public referral product.",
        "Do not add a public source selector to the default buy path.",
      ],
    },
    {
      id: "phase-3-internal-review-surface",
      title: "Internal review surface",
      status: "DONE_ENOUGH",
      purpose:
        "Make the non-activating buyer skeleton reviewable by founder/operators without public launch authority.",
      output:
        "A noindex, direct-URL /labs review surface with exact review query, scenario matrix, and no wallet controls.",
      blocks: [
        "Public launch inference",
        "User-actionable source controls",
      ],
      mustNotDo: [
        "Do not link from public navigation or sitemap.",
        "Do not add wallet write hooks, buttons, source links, aliases, claim UI, or source dashboards.",
      ],
    },
    {
      id: "phase-4-source-launch-packet",
      title: "Source packet / launch packet",
      status: "DRAFT_BOUNDARY",
      purpose:
        "Freeze the exact source, eligible buyer path, legal/accounting copy, anti-abuse posture, current-authority readbacks, and stop conditions for any launch candidate.",
      output:
        "Draft launch-decision boundary exists; founder-approved launch packet still required before public controls.",
      blocks: [
        "Source status changes",
        "Public source-aware purchase path",
        "Launch QA",
      ],
      mustNotDo: [
        "Do not activate a source from a product plan alone.",
        "Do not treat a past internal source as the default public template.",
      ],
    },
    {
      id: "phase-5-replit-production-qa",
      title: "Replit / production QA",
      status: "LATER_RUNTIME_VISIBLE",
      purpose:
        "Publish only when runtime-visible product truth should reach production and all anti-leakage checks are explicit.",
      output:
        "Replit sync/publish handoff with route QA, sitemap/robots checks, ZERO_SOURCE_ID public default checks, and no fake-live verification.",
      blocks: ["Production exposure"],
      mustNotDo: [
        "Do not publish source-aware public controls without a launch packet.",
        "Do not let GitHub green be mistaken for production green.",
      ],
    },
    {
      id: "phase-6-founder-launch-decision",
      title: "Founder launch decision",
      status: "FOUNDER_APPROVAL_REQUIRED",
      purpose:
        "Make the final public-product decision after UX, anti-abuse, disclosure, readback, and release gates are satisfied.",
      output:
        "Approve, revise, defer, or reject public release. Approval must be separate from direction approval.",
      blocks: ["Public launch"],
      mustNotDo: [
        "Do not infer launch from direction approval.",
        "Do not infer launch from proof, Register memory, Chronicle, or a public-product framework.",
      ],
    },
  ] satisfies readonly VerifiedIntroductionExecutionPhase[],
  buyerFlowRequirements: [
    {
      id: "source-preview-before-signature",
      requirement:
        "Buyer sees source label, status, class, commission bps, gross amount, acquisition commission, Net USDC Routed, and payout posture before signing.",
      before: "WALLET_SIGNATURE",
    },
    {
      id: "clear-source-back-to-zero",
      requirement:
        "Buyer can clear the source and continue through the standard ZERO_SOURCE_ID path before signing.",
      before: "WALLET_SIGNATURE",
    },
    {
      id: "active-latest-chain-gate",
      requirement:
        "Source-aware action hard-fails unless latest-chain readback confirms sourceExists, ACTIVE status, valid terms, and isActive true.",
      before: "WALLET_SIGNATURE",
    },
    {
      id: "approval-vs-buy-separation",
      requirement:
        "UX distinguishes USDC approval from the actual MembershipSaleV3 purchase event.",
      before: "IMPLEMENTATION",
    },
    {
      id: "post-purchase-proof",
      requirement:
        "Receipt/readback must show sourceId, source class, source wallet, commission bps, acquisition cost, Net USDC Routed, payout, and escrow state.",
      before: "LAUNCH",
    },
  ] satisfies readonly VerifiedIntroductionRequirement[],
  failureStates: [
    {
      id: "source-paused-or-revoked",
      trigger: "sourceConfig status is PAUSED, REVOKED, or isActive(sourceId) is false.",
      requiredBehavior:
        "Block source-aware action, explain that public/default buys remain ZERO_SOURCE_ID, and do not present this as referral failure.",
    },
    {
      id: "expired-window-or-cap",
      trigger:
        "Source window is expired/not started, gross cap is exhausted, per-buyer cap would be exceeded, or repeat purchase is disallowed.",
      requiredBehavior:
        "Fail closed before signature and offer only the clear-source ZERO_SOURCE_ID path.",
    },
    {
      id: "ineligible-buyer",
      trigger:
        "Buyer is historical, already seated, same as source/payout wallet, not allowlisted for an internal test, or on the wrong chain.",
      requiredBehavior:
        "Block source-aware purchase and show a plain eligibility reason without exposing claim or dashboard behavior.",
    },
    {
      id: "stale-readback",
      trigger: "Source, sale wiring, or public/default ZERO_SOURCE_ID readback is stale.",
      requiredBehavior:
        "Stop and require current-authority readback before any wallet action.",
    },
  ] satisfies readonly VerifiedIntroductionFailureState[],
  safeToImplementNow: [
    "Non-activating buyer preview and clear-source models.",
    "Read-only or test-only source status components.",
    "Failure-state components and tests.",
    "Noindex internal review surface with exact review query.",
    "Anti-abuse and source eligibility draft review model.",
    "Buyer disclosure and legal/accounting draft review model.",
    "Current-authority and release QA draft packet.",
    "Production-coherence guards that prevent public /join source drift.",
    "Docs that turn approved direction into execution steps without launch authority.",
  ],
  docsOnlyUntilFurtherApproval: [
    "Legal/accounting acquisition-commission copy.",
    "Prohibited promotion acknowledgments.",
    "Public launch packet.",
    "Source onboarding policy for real external sources.",
    "Claim/escrow user-facing policy.",
  ],
  freshReadbacksRequired: [
    "SourceRegistryV1 latest block, owner, sourceExists, sourceConfig, status, isActive, terms, wallets, caps, and metadata hash.",
    "MembershipSaleV3 bytecode, source registry wiring, paused/unpaused status, and public/default ZERO_SOURCE_ID behavior.",
    "Post-purchase receipt, payout, escrow, and final source status after any approved test.",
  ],
  launchBlockers: [
    "No founder launch approval packet exists.",
    "No public source route/link posture is approved.",
    "No legal/accounting disclosure signoff is recorded.",
    "No anti-abuse acceptance packet is recorded.",
    "No latest-chain current-authority readback is green for a public source-aware path.",
    "No founder-approved Replit publish/live QA packet exists for any runtime-visible public source product.",
  ],
  forbiddenUntilLaunchApproval: [
    "No transactions.",
    "No wallet signing.",
    "No source activation.",
    "No public referral activation.",
    "No live public source link.",
    "No alias route.",
    "No claim UI.",
    "No source dashboard.",
    "No public source-aware buy path.",
    "No product-wide attribution.",
    "No registry switch.",
    "No contract change.",
  ],
} as const;

export function getVerifiedIntroductionNextSprint(): string {
  return "Review the noindex Verified Introduction internal surface, launch packet draft, anti-abuse/source eligibility model, buyer disclosure/legal-accounting model, and current-authority/release QA packet together; then assemble a founder launch-decision packet or revise the blocked gates while public /join stays ZERO_SOURCE_ID.";
}

export function isVerifiedIntroductionLaunchBlocked(): boolean {
  return (
    VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.launchApproved === false ||
    VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.launchBlockers.length > 0
  );
}
