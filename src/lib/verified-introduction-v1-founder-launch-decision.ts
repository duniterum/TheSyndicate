import { ZERO_SOURCE_ID } from "./source-policy-observability";
import { SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION } from "./source-public-product-framework";
import { VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW } from "./verified-introduction-v1-anti-abuse";
import { VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW } from "./verified-introduction-v1-disclosure";
import { VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE } from "./verified-introduction-v1-execution";
import { VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT } from "./verified-introduction-v1-launch-packet";
import { VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET } from "./verified-introduction-v1-release-qa";

export type VerifiedIntroductionFounderDecisionPacketStatus =
  "READY_FOR_FOUNDER_REVIEW_NO_LAUNCH_AUTHORITY";

export type VerifiedIntroductionFounderDecisionOptionId =
  | "APPROVE_LAUNCH_CANDIDATE_PREPARATION_ONLY"
  | "APPROVE_WITH_REVISIONS"
  | "DEFER_PUBLIC_PRODUCT"
  | "REJECT_V1_POSTURE";

export type VerifiedIntroductionFounderDecisionItemStatus =
  | "READY_FOR_DECISION"
  | "REQUIRES_FOUNDER_DECISION"
  | "REQUIRES_LEGAL_ACCOUNTING_REVIEW"
  | "REQUIRES_LATEST_READBACK"
  | "REQUIRES_REPLIT_LIVE_QA"
  | "BLOCKED_BY_DESIGN";

export type VerifiedIntroductionDecisionIngredient = {
  readonly id: string;
  readonly label: string;
  readonly status: string;
  readonly source: string;
  readonly decisionUse: string;
};

export type VerifiedIntroductionFounderDecisionOption = {
  readonly id: VerifiedIntroductionFounderDecisionOptionId;
  readonly label: string;
  readonly founderPhrase: string;
  readonly meaning: string;
  readonly ifChosen: string;
  readonly stillForbidden: readonly string[];
};

export type VerifiedIntroductionFounderDecisionItem = {
  readonly id: string;
  readonly label: string;
  readonly status: VerifiedIntroductionFounderDecisionItemStatus;
  readonly question: string;
  readonly defaultRecommendation: string;
  readonly blocksPublicControls: boolean;
};

export type VerifiedIntroductionFounderLaunchDecisionPacket = {
  readonly id: "verified-introduction-v1-founder-launch-decision-packet";
  readonly productId: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id;
  readonly status: VerifiedIntroductionFounderDecisionPacketStatus;
  readonly directionApproved: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.directionApproved;
  readonly launchApproved: false;
  readonly publicControlsApproved: false;
  readonly publicJoinDefaultSourceId: typeof ZERO_SOURCE_ID;
  readonly readyForFounderDecision: true;
  readonly readyForPublicLaunch: false;
  readonly readyForPublicControlsImplementation: false;
  readonly ingredients: readonly VerifiedIntroductionDecisionIngredient[];
  readonly decisionOptions: readonly VerifiedIntroductionFounderDecisionOption[];
  readonly requiredFounderDecisions: readonly VerifiedIntroductionFounderDecisionItem[];
  readonly stopConditions: readonly string[];
  readonly nextIfApprovedForPreparation: readonly string[];
};

const STILL_FORBIDDEN = [
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
] as const;

export const VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET = {
  id: "verified-introduction-v1-founder-launch-decision-packet",
  productId: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id,
  status: "READY_FOR_FOUNDER_REVIEW_NO_LAUNCH_AUTHORITY",
  directionApproved: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.directionApproved,
  launchApproved: false,
  publicControlsApproved: false,
  publicJoinDefaultSourceId: ZERO_SOURCE_ID,
  readyForFounderDecision: true,
  readyForPublicLaunch: false,
  readyForPublicControlsImplementation: false,
  ingredients: [
    {
      id: "direction-approved",
      label: "Verified Introduction V1 direction",
      status: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.status,
      source: "src/lib/source-public-product-framework.ts",
      decisionUse:
        "Confirms the product posture: MembershipSaleV3-only, invite-only, manually approved, buyer-visible, buyer-clearable, and not open self-serve referral.",
    },
    {
      id: "execution-bridge",
      label: "Execution bridge",
      status: VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.implementationAuthority,
      source: "src/lib/verified-introduction-v1-execution.ts",
      decisionUse:
        "Confirms what can be built without launch authority and preserves Verified Introduction before SeatRecord721 and NFT work.",
    },
    {
      id: "launch-packet-draft",
      label: "Launch packet draft",
      status: VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT.status,
      source: "src/lib/verified-introduction-v1-launch-packet.ts",
      decisionUse:
        "Names the remaining founder, eligibility, disclosure, readback, release-QA, and exclusion gates.",
    },
    {
      id: "anti-abuse-review",
      label: "Anti-abuse and source eligibility review",
      status: VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW.status,
      source: "src/lib/verified-introduction-v1-anti-abuse.ts",
      decisionUse:
        "Defines manual source approval, source/buyer eligibility, fail-closed states, and excluded surfaces.",
    },
    {
      id: "disclosure-review",
      label: "Buyer disclosure and accounting review",
      status: VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW.status,
      source: "src/lib/verified-introduction-v1-disclosure.ts",
      decisionUse:
        "Defines buyer-visible source identity, Acquisition Commission, Net USDC Routed, clear-source behavior, and forbidden copy.",
    },
    {
      id: "release-qa-review",
      label: "Current-authority and release QA review",
      status: VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.status,
      source: "src/lib/verified-introduction-v1-release-qa.ts",
      decisionUse:
        "Defines latest-chain reads, Replit gates, live route QA, no-leakage checks, and stop conditions.",
    },
  ],
  decisionOptions: [
    {
      id: "APPROVE_LAUNCH_CANDIDATE_PREPARATION_ONLY",
      label: "Approve launch-candidate preparation only",
      founderPhrase:
        "I approve Verified Introduction V1 for launch-candidate preparation only. This does not activate referral, create public source links, expose public controls, or authorize wallet signing.",
      meaning:
        "Codex may prepare the exact launch-candidate implementation and release packet, still behind all current-authority, disclosure, QA, and founder approval gates.",
      ifChosen:
        "Prepare the candidate scope, exact route posture, source policy, copy, readback plan, and Replit handoff. Do not publish or activate without a later explicit approval.",
      stillForbidden: STILL_FORBIDDEN,
    },
    {
      id: "APPROVE_WITH_REVISIONS",
      label: "Approve with revisions",
      founderPhrase:
        "I approve the Verified Introduction V1 direction with revisions. Do not prepare public controls until the revisions are incorporated and re-reviewed.",
      meaning:
        "The V1 posture survives, but one or more gates, labels, copy rules, source eligibility rules, or release requirements must change first.",
      ifChosen:
        "Patch the specified revisions, rerun guards, and return the updated decision packet for review.",
      stillForbidden: STILL_FORBIDDEN,
    },
    {
      id: "DEFER_PUBLIC_PRODUCT",
      label: "Defer public product",
      founderPhrase:
        "I defer Verified Introduction V1 public product work. Keep the proven source-attribution engine and internal review materials as institutional memory.",
      meaning:
        "The internal proof remains valuable, but no public source-aware user experience should be prepared now.",
      ifChosen:
        "Record the deferral, preserve the review surface, and move only to the next founder-approved priority.",
      stillForbidden: STILL_FORBIDDEN,
    },
    {
      id: "REJECT_V1_POSTURE",
      label: "Reject V1 posture",
      founderPhrase:
        "I reject the current Verified Introduction V1 posture. Do not use this model as the public source/referral product direction.",
      meaning:
        "The proven engine remains true, but the product shape must be redesigned before any public source-aware path is considered.",
      ifChosen:
        "Mark the V1 posture rejected, keep public /join on ZERO_SOURCE_ID, and do not resume without a new founder-approved product decision.",
      stillForbidden: STILL_FORBIDDEN,
    },
  ],
  requiredFounderDecisions: [
    {
      id: "launch-posture",
      label: "Launch posture",
      status: "REQUIRES_FOUNDER_DECISION",
      question:
        "Should Verified Introduction V1 move into launch-candidate preparation, be revised, be deferred, or be rejected?",
      defaultRecommendation:
        "Approve launch-candidate preparation only if the founder is ready to review exact public route, copy, source policy, and release gates next.",
      blocksPublicControls: true,
    },
    {
      id: "source-eligibility",
      label: "Source eligibility policy",
      status: "REQUIRES_FOUNDER_DECISION",
      question:
        "Which source classes, source approval rules, buyer eligibility rules, and revocation authority are acceptable for V1?",
      defaultRecommendation:
        "Keep V1 invite-only and manually approved; keep aliases, open self-serve referral, source dashboards, and product-wide attribution excluded.",
      blocksPublicControls: true,
    },
    {
      id: "legal-accounting-copy",
      label: "Legal/accounting copy",
      status: "REQUIRES_LEGAL_ACCOUNTING_REVIEW",
      question:
        "Does the buyer disclosure correctly describe Acquisition Source, Acquisition Commission, Net USDC Routed, clear-source behavior, and direct-payout-first posture?",
      defaultRecommendation:
        "Treat current copy as draft review only until founder-approved legal/accounting review is complete.",
      blocksPublicControls: true,
    },
    {
      id: "latest-chain-readback",
      label: "Latest-chain readback",
      status: "REQUIRES_LATEST_READBACK",
      question:
        "Do SourceRegistryV1, MembershipSaleV3, source status/terms, and public/default ZERO_SOURCE_ID read correctly at latest chain state?",
      defaultRecommendation:
        "Run latest-chain current-authority readbacks only after a concrete launch candidate exists.",
      blocksPublicControls: true,
    },
    {
      id: "replit-live-qa",
      label: "Replit and live QA",
      status: "REQUIRES_REPLIT_LIVE_QA",
      question:
        "Should Replit pull, validate, publish, and live-QA a runtime-visible candidate after GitHub is ready?",
      defaultRecommendation:
        "Prepare Replit handoff only when runtime-visible product truth should reach production.",
      blocksPublicControls: true,
    },
    {
      id: "excluded-surfaces",
      label: "Excluded public surfaces",
      status: "BLOCKED_BY_DESIGN",
      question:
        "Should claim UI, source dashboards, alias routes, open self-serve referral, product-wide attribution, or future-module attribution stay excluded from V1?",
      defaultRecommendation:
        "Keep them excluded. If any become necessary, create a separate founder-approved product sprint.",
      blocksPublicControls: true,
    },
  ],
  stopConditions: [
    "Stop if the founder decision is ambiguous.",
    "Stop if any draft review item is treated as legal/accounting signoff.",
    "Stop if public /join stops using ZERO_SOURCE_ID by default.",
    "Stop if /referral becomes actionable before founder approval.",
    "Stop if a public route, sitemap, nav item, source link, alias, claim UI, dashboard, or source-aware buy path appears before approval.",
    "Stop if latest-chain readback is stale, historical, missing, or mismatched.",
    "Stop if Replit validation or live QA is partial and the founder has not explicitly accepted the residual risk.",
  ],
  nextIfApprovedForPreparation: [
    "Freeze exact launch-candidate route posture and public copy.",
    "Run latest-chain SourceRegistryV1 and MembershipSaleV3 readbacks.",
    "Prepare the exact GitHub/Replit release packet and live QA script.",
    "Return for founder approval before any public controls, wallet signing, source activation, or production publish.",
  ],
} satisfies VerifiedIntroductionFounderLaunchDecisionPacket;

export function getVerifiedIntroductionFounderDecisionBlockers(): readonly VerifiedIntroductionFounderDecisionItem[] {
  return VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET.requiredFounderDecisions.filter(
    (item) => item.blocksPublicControls,
  );
}

export function isVerifiedIntroductionFounderLaunchApproved(): false {
  return false;
}
