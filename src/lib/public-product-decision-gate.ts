import { FIRST_SOURCE_ATTRIBUTION_LIFECYCLE } from "./protocol-lifecycle";
import { SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION } from "./source-public-product-framework";
import {
  VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE,
  getVerifiedIntroductionNextSprint,
} from "./verified-introduction-v1-execution";
import {
  CURRENT_SOURCE_POLICY_SNAPSHOT,
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
  type SourcePolicySnapshot,
} from "./source-policy-observability";

export type PublicProductGateStatus =
  | "SATISFIED"
  | "REQUIRED"
  | "FOUNDER_APPROVAL_REQUIRED"
  | "BLOCKED_BY_DESIGN";

export type PublicProductDecisionStatus = "NOT_READY_FOR_PUBLIC_PRODUCT";

export type PublicProductGate = {
  readonly id: string;
  readonly label: string;
  readonly status: PublicProductGateStatus;
  readonly proof: string;
  readonly requirement: string;
  readonly blocksPublicProduct: boolean;
};

export type PublicProductDecisionGate = {
  readonly capabilityId: "source-attribution-public-product-v1";
  readonly proofLifecycleId: typeof FIRST_SOURCE_ATTRIBUTION_LIFECYCLE.id;
  readonly factLifecycleStage: "public-product";
  readonly decisionStatus: PublicProductDecisionStatus;
  readonly publicProductReady: false;
  readonly recommendedFrameworkId: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id;
  readonly recommendedFrameworkName: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.userFacingName;
  readonly recommendedFrameworkStatus: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.status;
  readonly directionApproved: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.directionApproved;
  readonly launchApproved: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.launchApproved;
  readonly executionBridgeId: typeof VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.id;
  readonly currentReason: string;
  readonly defaultBuySourceId: typeof ZERO_SOURCE_ID;
  readonly gates: readonly PublicProductGate[];
  readonly allowedNextWork: readonly string[];
  readonly forbiddenUntilApproved: readonly string[];
};

export function buildSourceAttributionPublicProductDecisionGate(
  snapshot: SourcePolicySnapshot = CURRENT_SOURCE_POLICY_SNAPSHOT,
): PublicProductDecisionGate {
  const target = snapshot.records.find(
    (record) => record.sourceId === INTERNAL_PROTOCOL_TEST_SOURCE_001.sourceId,
  );
  const targetClosedSafe =
    target?.status === "PAUSED" &&
    snapshot.activeCount === 0 &&
    snapshot.defaultBuySourceId === ZERO_SOURCE_ID;

  const gates: readonly PublicProductGate[] = [
    {
      id: "internal-proof-recorded",
      label: "Internal proof exists",
      status: "SATISFIED",
      proof:
        "The first Source Attribution lifecycle is recorded as packet -> terms -> controlled ACTIVE -> real action -> PAUSED closure.",
      requirement:
        "Use the proof as evidence only; do not treat it as public referral, claim UI, source dashboard, or public source-aware buy authority.",
      blocksPublicProduct: false,
    },
    {
      id: "safe-closure-state",
      label: "Safe closure state",
      status: targetClosedSafe ? "SATISFIED" : "REQUIRED",
      proof: targetClosedSafe
        ? `The target source is PAUSED, active source count is ${snapshot.activeCount}, and public/default buys use ${ZERO_SOURCE_ID}.`
        : "Current source state is not safe enough for a public-product decision.",
      requirement:
        "Before any public product decision, latest-chain readback must confirm the internal source is closed safely and public/default buys remain ZERO_SOURCE_ID.",
      blocksPublicProduct: !targetClosedSafe,
    },
    {
      id: "public-scope-definition",
      label: "Public scope definition",
      status: "SATISFIED",
      proof:
        "The founder approved Verified Introduction V1 as product direction only: MembershipSaleV3-only, invite-only, manually approved, buyer-visible, buyer-clearable, direct-payout-first, and not product-wide.",
      requirement:
        "Use the approved direction to build only non-activating execution infrastructure. Public launch still requires a separate launch packet.",
      blocksPublicProduct: false,
    },
    {
      id: "source-link-and-buyer-ux",
      label: "Source link and buyer UX",
      status: "REQUIRED",
      proof:
        "No public source link, source selector, source dashboard, alias flow, or buyer clear-source interaction exists today.",
      requirement:
        "Design and test the Verified Introduction buyer UX from docs/SOURCE_PUBLIC_PRODUCT_DECISION_FRAMEWORK.md: source preview before signature, clear-source control, and hard-fail on stale source state.",
      blocksPublicProduct: true,
    },
    {
      id: "anti-abuse-eligibility",
      label: "Anti-abuse and eligibility rules",
      status: "REQUIRED",
      proof:
        "The internal test used one controlled source wallet and one fresh buyer wallet; it did not prove public onboarding, aliases, open member referral, or abuse resistance.",
      requirement:
        "Approve manual source eligibility, seated-member rules for MEMBER_INTRODUCTION, source/buyer self-source blocking, cap/window checks, promotion rules, and revocation operations.",
      blocksPublicProduct: true,
    },
    {
      id: "legal-accounting-disclosure",
      label: "Legal, accounting, and disclosure posture",
      status: "REQUIRED",
      proof:
        "The internal test produced one acquisition commission and direct payout; it did not approve public copy, tax/accounting treatment, or source reporting language.",
      requirement:
        "Approve acquisition-first copy with no agency, employment, ownership, yield, ROI, passive-income, MLM, downline, or upline framing.",
      blocksPublicProduct: true,
    },
    {
      id: "claim-and-escrow-policy",
      label: "Claim and escrow policy",
      status: "BLOCKED_BY_DESIGN",
      proof:
        "The completed test had zero escrow owed and direct payout succeeded. Contract escrow mechanics exist, but claim UI remains absent.",
      requirement:
        "Do not expose claim UI or claim balances until escrow readback, source-status gating, recovery language, and disclosure copy are separately approved.",
      blocksPublicProduct: true,
    },
    {
      id: "release-and-production-qa",
      label: "Release and production QA",
      status: "REQUIRED",
      proof:
        "Production currently preserves ZERO_SOURCE_ID public/default buys and inactive referral boundaries.",
      requirement:
        "Any future public source product requires GitHub validation, Replit sync/publish, live route QA, anti-leakage checks, and current-authority chain readback.",
      blocksPublicProduct: true,
    },
    {
      id: "founder-public-product-approval",
      label: "Founder public-product approval",
      status: "FOUNDER_APPROVAL_REQUIRED",
      proof:
        "Founder direction approval exists, but no founder launch approval exists for public referral activation, public source links, source dashboards, claim UI, or public source-aware buy paths.",
      requirement:
        "Founder must approve the exact public product surface, copy, gates, source scope, and release packet before implementation can expose user-actionable controls.",
      blocksPublicProduct: true,
    },
  ] as const;

  return {
    capabilityId: "source-attribution-public-product-v1",
    proofLifecycleId: FIRST_SOURCE_ATTRIBUTION_LIFECYCLE.id,
    factLifecycleStage: "public-product",
    decisionStatus: "NOT_READY_FOR_PUBLIC_PRODUCT",
    publicProductReady: false,
    recommendedFrameworkId: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id,
    recommendedFrameworkName: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.userFacingName,
    recommendedFrameworkStatus: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.status,
    directionApproved: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.directionApproved,
    launchApproved: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.launchApproved,
    executionBridgeId: VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.id,
    currentReason:
      "The first Source Attribution lifecycle is proven internally and Verified Introduction V1 is approved as direction only, but public source/referral product remains blocked until product, legal, UX, security, release, and founder launch gates are satisfied.",
    defaultBuySourceId: ZERO_SOURCE_ID,
    gates,
    allowedNextWork: [
      getVerifiedIntroductionNextSprint(),
      "Keep docs/VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.md aligned as the implementation bridge from approved direction to non-activating execution.",
      "Anti-abuse, disclosure, accounting, and source-operator policy design.",
      "Read-only proof and guard hardening that preserves ZERO_SOURCE_ID public/default buys.",
    ],
    forbiddenUntilApproved: [
      "Do not activate public referral.",
      "Do not create public source links or aliases.",
      "Do not add source dashboards.",
      "Do not add claim UI or claim balances.",
      "Do not route public/default buys through a non-zero sourceId.",
      "Do not imply product-wide attribution for Archive1155, SeatRecord721, SwapRail, ProductSaleRouter, or future commerce.",
    ],
  } as const;
}

export const SOURCE_ATTRIBUTION_PUBLIC_PRODUCT_DECISION_GATE =
  buildSourceAttributionPublicProductDecisionGate();
