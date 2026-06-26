import { ZERO_SOURCE_ID } from "./source-policy-observability";
import { SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION } from "./source-public-product-framework";

export type VerifiedIntroductionAntiAbuseStatus =
  "DRAFT_REVIEW_NOT_APPROVED";

export type VerifiedIntroductionControlStatus =
  | "SATISFIED_FOR_REVIEW"
  | "PENDING_FOUNDER_APPROVAL"
  | "PENDING_REVIEW"
  | "BLOCKED_BY_DESIGN";

export type VerifiedIntroductionEligibilityRule = {
  readonly id: string;
  readonly label: string;
  readonly status: VerifiedIntroductionControlStatus;
  readonly requirement: string;
  readonly evidenceNeeded: string;
  readonly failClosedBehavior: string;
};

export type VerifiedIntroductionAbuseState = {
  readonly id: string;
  readonly risk: string;
  readonly trigger: string;
  readonly control: string;
  readonly operatorAction: string;
  readonly buyerOutcome: string;
};

export type VerifiedIntroductionAntiAbuseReview = {
  readonly id: "verified-introduction-v1-anti-abuse-review";
  readonly productId: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id;
  readonly status: VerifiedIntroductionAntiAbuseStatus;
  readonly launchApproved: false;
  readonly publicControlsApproved: false;
  readonly defaultPublicSourceId: typeof ZERO_SOURCE_ID;
  readonly eligibilityRules: readonly VerifiedIntroductionEligibilityRule[];
  readonly abuseStates: readonly VerifiedIntroductionAbuseState[];
  readonly forbiddenUntilApproved: readonly string[];
};

export const VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW = {
  id: "verified-introduction-v1-anti-abuse-review",
  productId: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id,
  status: "DRAFT_REVIEW_NOT_APPROVED",
  launchApproved: false,
  publicControlsApproved: false,
  defaultPublicSourceId: ZERO_SOURCE_ID,
  eligibilityRules: [
    {
      id: "manual-source-approval",
      label: "Manual source approval",
      status: "PENDING_FOUNDER_APPROVAL",
      requirement:
        "Every V1 source needs founder/operator approval, source packet, source class, terms, payout wallet, metadata hash, and current-authority readback before use.",
      evidenceNeeded:
        "Approved packet, SourceRegistryV1 sourceConfig, ACTIVE status only when separately approved, and no mismatch with the buyer-facing disclosure.",
      failClosedBehavior:
        "If approval or readback is missing, show no valid source and keep the buyer on ZERO_SOURCE_ID.",
    },
    {
      id: "source-class-policy",
      label: "Source class policy",
      status: "PENDING_REVIEW",
      requirement:
        "MEMBER_INTRODUCTION requires seated-member eligibility; BUILDER_SOURCE or any other class requires explicit packet approval and must not become generic referral.",
      evidenceNeeded:
        "Source class in packet, class-specific approval rationale, and seated-wallet readback when the class depends on membership.",
      failClosedBehavior:
        "If class meaning is ambiguous, block source-aware preview and require founder review.",
    },
    {
      id: "buyer-eligibility",
      label: "Buyer eligibility",
      status: "PENDING_REVIEW",
      requirement:
        "Buyer must be eligible for a MembershipSaleV3 purchase and must not already be seated, historical-only, same as source wallet, or same as payout wallet.",
      evidenceNeeded:
        "Latest buyer seat state, historical-member state, buyer wallet, source wallet, payout wallet, and chain ID 43114.",
      failClosedBehavior:
        "If buyer eligibility is unclear, stop before signature and keep the normal member path separate.",
    },
    {
      id: "source-buyer-self-source-block",
      label: "Self-source block",
      status: "PENDING_REVIEW",
      requirement:
        "The source wallet, payout wallet, and buyer wallet must be distinct unless a later founder-approved policy says otherwise.",
      evidenceNeeded:
        "Wallet comparison before source-aware approval or buy.",
      failClosedBehavior:
        "If wallet overlap exists, clear the source and return the buyer to ZERO_SOURCE_ID.",
    },
    {
      id: "terms-cap-window-gate",
      label: "Terms, cap, and window gate",
      status: "PENDING_REVIEW",
      requirement:
        "Latest terms must confirm ACTIVE status, valid start/end window, gross cap, per-buyer cap, repeat-purchase posture, commission bps, and metadata hash.",
      evidenceNeeded:
        "Latest sourceConfig(sourceId), isActive(sourceId), cap accounting, and no stale historical readback.",
      failClosedBehavior:
        "If terms are stale, expired, not started, exhausted, or mismatched, block source-aware action before signature.",
    },
    {
      id: "buyer-visible-attribution",
      label: "Buyer-visible attribution",
      status: "SATISFIED_FOR_REVIEW",
      requirement:
        "Buyer must see source label, class, status, commission bps, acquisition commission, Net USDC Routed, payout posture, and clear-source option before signing.",
      evidenceNeeded:
        "Internal review surface and buyer skeleton show the required preview without wallet controls.",
      failClosedBehavior:
        "If the buyer cannot understand or clear attribution, do not expose source-aware controls.",
    },
    {
      id: "prohibited-promotion",
      label: "Prohibited promotion rules",
      status: "PENDING_REVIEW",
      requirement:
        "Approved sources must not imply agency, employment, official representation, ownership, guaranteed rewards, yield, passive income, ROI, downline, or upline.",
      evidenceNeeded:
        "Source packet acknowledgement, operator review process, and revocation/re-pause path.",
      failClosedBehavior:
        "If promotion conduct is unclear or violates the policy, pause or revoke before any further source-aware use.",
    },
    {
      id: "excluded-surfaces",
      label: "Excluded surfaces stay excluded",
      status: "BLOCKED_BY_DESIGN",
      requirement:
        "No claim UI, source dashboard, alias route, public source creation, open self-serve member referral, or product-wide attribution belongs in V1.",
      evidenceNeeded:
        "Production coherence guards, sitemap/nav checks, and route-specific QA.",
      failClosedBehavior:
        "If any excluded surface becomes necessary, stop and create a separate founder-approved sprint.",
    },
  ],
  abuseStates: [
    {
      id: "UNAPPROVED_SOURCE",
      risk: "A source appears before founder/operator approval.",
      trigger: "Source packet, source record, metadata hash, or approval record is missing.",
      control: "Require manual approval and latest sourceConfig readback.",
      operatorAction: "Do not show the source as valid; require packet review.",
      buyerOutcome: "Buyer remains on ZERO_SOURCE_ID.",
    },
    {
      id: "SELF_SOURCE",
      risk: "A buyer attempts to source their own purchase.",
      trigger: "Buyer wallet equals source wallet or payout wallet.",
      control: "Compare wallets before signature.",
      operatorAction: "Block source-aware action and clear attribution.",
      buyerOutcome: "Buyer may continue only through ZERO_SOURCE_ID if otherwise eligible.",
    },
    {
      id: "ALREADY_SEATED_OR_HISTORICAL",
      risk: "An existing or historical member is treated as a new acquisition.",
      trigger: "Buyer is already seated or recognized as historical.",
      control: "Read buyer membership state before source-aware action.",
      operatorAction: "Stop and route to the member/historical path.",
      buyerOutcome: "No source-attributed first-purchase flow.",
    },
    {
      id: "INACTIVE_OR_STALE_SOURCE",
      risk: "A stale link or old snapshot treats an inactive source as usable.",
      trigger: "Source is PAUSED, REVOKED, expired, not-yet-active, or readback is historical.",
      control: "Read latest SourceRegistryV1 state before preview, approval, and buy.",
      operatorAction: "Stop until current-authority readback is green.",
      buyerOutcome: "Source-aware action remains blocked.",
    },
    {
      id: "CAP_OR_REPEAT_LIMIT",
      risk: "A source exceeds approved economic limits.",
      trigger: "Gross cap, per-buyer cap, repeat-purchase setting, or window would be violated.",
      control: "Check terms and purchase state before signature.",
      operatorAction: "Block source-aware action and record the reason.",
      buyerOutcome: "Buyer can clear source and continue with ZERO_SOURCE_ID if eligible.",
    },
    {
      id: "HIDDEN_ATTRIBUTION",
      risk: "A buyer is attributed through hidden state or source hijacking.",
      trigger: "Source is carried by invisible cookie/session state or unclear URL state.",
      control: "Show source before signature and provide clear-source behavior.",
      operatorAction: "Reject silent attribution patterns.",
      buyerOutcome: "Buyer decides consciously or clears to ZERO_SOURCE_ID.",
    },
    {
      id: "PROMOTION_VIOLATION",
      risk: "A source frames the introduction as official status, ownership, or money-game mechanics.",
      trigger: "Marketing uses agency, employment, ownership, yield, passive income, ROI, downline, upline, or guaranteed-income framing.",
      control: "Require prohibited-promotion acknowledgement and revocation authority.",
      operatorAction: "Pause or revoke the source pending review.",
      buyerOutcome: "No source-aware purchase while conduct is unresolved.",
    },
    {
      id: "ESCROW_OR_PAYOUT_FAILURE",
      risk: "Direct payout fails and escrow mechanics are mistaken for claim UI.",
      trigger: "sourceEscrowOwed becomes non-zero or payout readback mismatches.",
      control: "Record escrow as operational readback only; keep claim UI excluded.",
      operatorAction: "Stop public claims and prepare a separate claim/escrow review if needed.",
      buyerOutcome: "Buyer receipt can be read back; no claim surface appears.",
    },
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
} satisfies VerifiedIntroductionAntiAbuseReview;

export function getVerifiedIntroductionAntiAbuseBlockers(): readonly VerifiedIntroductionEligibilityRule[] {
  return VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW.eligibilityRules.filter(
    (rule) => rule.status !== "SATISFIED_FOR_REVIEW",
  );
}

export function isVerifiedIntroductionAntiAbuseApproved(): false {
  return false;
}
