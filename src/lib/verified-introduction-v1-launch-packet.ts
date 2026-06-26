import { ZERO_SOURCE_ID } from "./source-policy-observability";
import { SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION } from "./source-public-product-framework";

export type VerifiedIntroductionLaunchPacketStatus =
  "DRAFT_BOUNDARY_NOT_APPROVED";

export type VerifiedIntroductionLaunchGateStatus =
  | "SATISFIED_FOR_REVIEW"
  | "PENDING_FOUNDER_APPROVAL"
  | "PENDING_REVIEW"
  | "BLOCKED_BY_DESIGN";

export type VerifiedIntroductionLaunchGate = {
  readonly id: string;
  readonly label: string;
  readonly status: VerifiedIntroductionLaunchGateStatus;
  readonly requiredBefore: "DESIGN_REVIEW" | "IMPLEMENTATION" | "PUBLIC_RELEASE";
  readonly requirement: string;
  readonly stopCondition: string;
};

export type VerifiedIntroductionLaunchPacketDraft = {
  readonly id: "verified-introduction-v1-launch-packet-draft";
  readonly productId: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id;
  readonly status: VerifiedIntroductionLaunchPacketStatus;
  readonly launchApproved: false;
  readonly publicControlsApproved: false;
  readonly publicJoinDefaultSourceId: typeof ZERO_SOURCE_ID;
  readonly scope: "MEMBERSHIP_SALE_V3_ONLY";
  readonly accessModel: "INVITE_ONLY_MANUAL_APPROVAL";
  readonly routePosture: "NO_PUBLIC_SOURCE_ROUTE_APPROVED";
  readonly sourceLinkPosture: "NO_PUBLIC_SOURCE_LINK_APPROVED";
  readonly claimPosture: "NO_CLAIM_UI_APPROVED";
  readonly dashboardPosture: "NO_SOURCE_DASHBOARD_APPROVED";
  readonly gates: readonly VerifiedIntroductionLaunchGate[];
  readonly founderDecisionSlots: readonly string[];
  readonly forbiddenUntilApproved: readonly string[];
};

export const VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT = {
  id: "verified-introduction-v1-launch-packet-draft",
  productId: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id,
  status: "DRAFT_BOUNDARY_NOT_APPROVED",
  launchApproved: false,
  publicControlsApproved: false,
  publicJoinDefaultSourceId: ZERO_SOURCE_ID,
  scope: "MEMBERSHIP_SALE_V3_ONLY",
  accessModel: "INVITE_ONLY_MANUAL_APPROVAL",
  routePosture: "NO_PUBLIC_SOURCE_ROUTE_APPROVED",
  sourceLinkPosture: "NO_PUBLIC_SOURCE_LINK_APPROVED",
  claimPosture: "NO_CLAIM_UI_APPROVED",
  dashboardPosture: "NO_SOURCE_DASHBOARD_APPROVED",
  gates: [
    {
      id: "internal-review-surface",
      label: "Internal buyer review surface",
      status: "SATISFIED_FOR_REVIEW",
      requiredBefore: "DESIGN_REVIEW",
      requirement:
        "Founder/operators can review the non-activating buyer skeleton through the noindex labs route.",
      stopCondition:
        "If the route appears in public navigation, sitemap, or exposes controls, stop before release work.",
    },
    {
      id: "founder-launch-approval",
      label: "Founder launch approval",
      status: "PENDING_FOUNDER_APPROVAL",
      requiredBefore: "PUBLIC_RELEASE",
      requirement:
        "Founder must approve the exact public product surface, source scope, copy, stop conditions, and release packet.",
      stopCondition:
        "Direction approval, proof, Register memory, Chronicle review, or this draft cannot authorize launch.",
    },
    {
      id: "source-eligibility-policy",
      label: "Source eligibility policy",
      status: "PENDING_REVIEW",
      requiredBefore: "IMPLEMENTATION",
      requirement:
        "Approve source classes, manual approval rules, seated-member rules, source/buyer self-source blocking, and revocation operations.",
      stopCondition:
        "If source eligibility is ambiguous, do not expose source-aware controls.",
    },
    {
      id: "buyer-disclosure-policy",
      label: "Buyer disclosure policy",
      status: "PENDING_REVIEW",
      requiredBefore: "IMPLEMENTATION",
      requirement:
        "Approve buyer-visible source identity, commission, Net USDC Routed, direct payout, clear-source, and no-change-to-seat copy.",
      stopCondition:
        "If the buyer cannot understand and clear attribution before signing, do not proceed.",
    },
    {
      id: "legal-accounting-review",
      label: "Legal and accounting review",
      status: "PENDING_REVIEW",
      requiredBefore: "PUBLIC_RELEASE",
      requirement:
        "Review acquisition-commission language, tax/accounting posture, no-agency framing, and payout/escrow explanations.",
      stopCondition:
        "If copy implies ownership, employment, yield, passive income, ROI, downline, upline, or guaranteed income, stop.",
    },
    {
      id: "current-authority-readbacks",
      label: "Current-authority readbacks",
      status: "PENDING_REVIEW",
      requiredBefore: "PUBLIC_RELEASE",
      requirement:
        "Latest-chain readbacks must confirm SourceRegistryV1, MembershipSaleV3 wiring, source status/terms, and public/default ZERO_SOURCE_ID.",
      stopCondition:
        "If readback is historical, stale, mismatched, or source is not in the approved status, stop.",
    },
    {
      id: "release-and-live-qa",
      label: "Release and live QA",
      status: "PENDING_REVIEW",
      requiredBefore: "PUBLIC_RELEASE",
      requirement:
        "GitHub validation, Replit sync decision, route QA, sitemap/robots/noindex checks, and anti-leakage checks must be green.",
      stopCondition:
        "If /join, /referral, sitemap, robots, or any public route implies launch before approval, stop.",
    },
    {
      id: "claim-dashboard-alias-exclusions",
      label: "Excluded surfaces remain excluded",
      status: "BLOCKED_BY_DESIGN",
      requiredBefore: "PUBLIC_RELEASE",
      requirement:
        "Claim UI, source dashboards, alias routes, public source creation, open self-serve referral, and product-wide attribution stay out of V1.",
      stopCondition:
        "If any excluded surface becomes necessary, create a separate founder-approved product sprint first.",
    },
  ],
  founderDecisionSlots: [
    "Approve, revise, defer, or reject public Verified Introduction V1 launch.",
    "Approve exact source class and source eligibility policy.",
    "Approve exact buyer disclosure and clear-source language.",
    "Approve legal/accounting review path before public controls.",
    "Approve Replit sync/publish and live QA only after launch packet is complete.",
  ],
  forbiddenUntilApproved: [
    "No transactions.",
    "No wallet signing.",
    "No source activation.",
    "No referral activation.",
    "No public source link.",
    "No alias route.",
    "No claim UI.",
    "No source dashboard.",
    "No public source-aware buy path.",
    "No non-zero default /join sourceId.",
    "No registry switch.",
    "No contract change.",
  ],
} satisfies VerifiedIntroductionLaunchPacketDraft;

export function isVerifiedIntroductionPublicLaunchApproved(): false {
  return false;
}

export function getVerifiedIntroductionLaunchBlockers(): readonly VerifiedIntroductionLaunchGate[] {
  return VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT.gates.filter(
    (gate) => gate.status !== "SATISFIED_FOR_REVIEW",
  );
}
