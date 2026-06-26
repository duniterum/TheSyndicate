import { ZERO_SOURCE_ID } from "./source-policy-observability";
import { SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION } from "./source-public-product-framework";

export type VerifiedIntroductionDisclosureReviewStatus =
  "DRAFT_REVIEW_NOT_APPROVED";

export type VerifiedIntroductionDisclosureItemStatus =
  | "SATISFIED_FOR_REVIEW"
  | "PENDING_LEGAL_ACCOUNTING_REVIEW"
  | "PENDING_FOUNDER_APPROVAL"
  | "FORBIDDEN_UNTIL_APPROVED";

export type VerifiedIntroductionAccountingLabel = {
  readonly id: string;
  readonly label: string;
  readonly definition: string;
  readonly mustNotMean: string;
};

export type VerifiedIntroductionDisclosureItem = {
  readonly id: string;
  readonly label: string;
  readonly status: VerifiedIntroductionDisclosureItemStatus;
  readonly buyerMustUnderstand: string;
  readonly requiredCopy: string;
  readonly stopCondition: string;
};

export type VerifiedIntroductionForbiddenCopyRule = {
  readonly id: string;
  readonly forbiddenPattern: string;
  readonly reason: string;
  readonly saferReplacement: string;
};

export type VerifiedIntroductionDisclosureReview = {
  readonly id: "verified-introduction-v1-disclosure-review";
  readonly productId: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id;
  readonly status: VerifiedIntroductionDisclosureReviewStatus;
  readonly launchApproved: false;
  readonly publicControlsApproved: false;
  readonly defaultPublicSourceId: typeof ZERO_SOURCE_ID;
  readonly accountingLabels: readonly VerifiedIntroductionAccountingLabel[];
  readonly disclosureItems: readonly VerifiedIntroductionDisclosureItem[];
  readonly forbiddenCopy: readonly VerifiedIntroductionForbiddenCopyRule[];
  readonly requiredBeforeSignature: readonly string[];
};

export const VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW = {
  id: "verified-introduction-v1-disclosure-review",
  productId: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id,
  status: "DRAFT_REVIEW_NOT_APPROVED",
  launchApproved: false,
  publicControlsApproved: false,
  defaultPublicSourceId: ZERO_SOURCE_ID,
  accountingLabels: [
    {
      id: "acquisition-source",
      label: "Acquisition Source",
      definition:
        "The approved source identity connected to a MembershipSaleV3 purchase for acquisition attribution only.",
      mustNotMean:
        "Not ownership of the buyer, not agency, not employment, not official representation, and not public referral launch.",
    },
    {
      id: "acquisition-commission",
      label: "Acquisition Commission",
      definition:
        "The USDC amount routed to the approved source from gross USDC before protocol routing.",
      mustNotMean:
        "Not yield, passive income, guaranteed income, ROI, claim balance, member dividend, or downline reward.",
    },
    {
      id: "net-usdc-routed",
      label: "Net USDC Routed",
      definition:
        "Gross USDC minus acquisition commission; this is the amount routed through Vault, Liquidity, and Operations.",
      mustNotMean:
        "Not a reduction in buyer price, not a change in SYN delivered, and not a hidden fee added to the buyer.",
    },
    {
      id: "direct-payout-first",
      label: "Direct Payout First",
      definition:
        "The protocol attempts direct on-chain payout to the source payout wallet during the purchase.",
      mustNotMean:
        "Not a claim UI, not a source dashboard, and not proof that escrow claiming is public-live.",
    },
  ],
  disclosureItems: [
    {
      id: "source-identity-before-signature",
      label: "Source identity before signature",
      status: "PENDING_FOUNDER_APPROVAL",
      buyerMustUnderstand:
        "The purchase is linked to one founder-approved source identity and source class before any wallet signature.",
      requiredCopy:
        "This purchase is linked to an approved acquisition source. You can clear it and continue with the public/default ZERO_SOURCE_ID path.",
      stopCondition:
        "If source identity, source class, or current status is hidden or ambiguous, stop before approval or buy.",
    },
    {
      id: "commission-and-net-routing",
      label: "Commission and net routing",
      status: "PENDING_LEGAL_ACCOUNTING_REVIEW",
      buyerMustUnderstand:
        "The acquisition commission is deducted from gross USDC before protocol routing; Net USDC Routed is what remains for Vault/Liquidity/Operations.",
      requiredCopy:
        "Acquisition Commission is paid from gross USDC. Net USDC Routed is gross USDC minus that commission.",
      stopCondition:
        "If copy makes the buyer think the price, SYN delivered, seat, or rights changed, stop.",
    },
    {
      id: "membership-unchanged",
      label: "Membership unchanged",
      status: "SATISFIED_FOR_REVIEW",
      buyerMustUnderstand:
        "Verified Introduction changes attribution only; it does not change membership status, seat rights, price, SYN delivery, or buyer obligations.",
      requiredCopy:
        "Your membership terms do not change because an introduction is present.",
      stopCondition:
        "If copy implies a different membership class, ownership right, or financial right, stop.",
    },
    {
      id: "clear-source",
      label: "Clear source choice",
      status: "SATISFIED_FOR_REVIEW",
      buyerMustUnderstand:
        "The buyer can remove source attribution before signing and return to ZERO_SOURCE_ID.",
      requiredCopy:
        "Clear this source to continue without attribution through ZERO_SOURCE_ID.",
      stopCondition:
        "If the buyer cannot clearly return to ZERO_SOURCE_ID before signature, stop.",
    },
    {
      id: "approval-is-not-buy",
      label: "Approval is not buy",
      status: "SATISFIED_FOR_REVIEW",
      buyerMustUnderstand:
        "USDC approval is wallet permission only; the seat is not purchased until the separate buy transaction succeeds and is read back.",
      requiredCopy:
        "Approve USDC only grants permission. It does not buy SYN or complete membership.",
      stopCondition:
        "If approval is described as purchase completion, stop.",
    },
    {
      id: "payout-and-escrow",
      label: "Payout and escrow posture",
      status: "PENDING_LEGAL_ACCOUNTING_REVIEW",
      buyerMustUnderstand:
        "Direct payout is attempted first; escrow is a fallback state only and does not make a claim UI public-live.",
      requiredCopy:
        "Direct source payout is attempted first. Escrow fallback is operational readback only unless a separate claim surface is approved later.",
      stopCondition:
        "If copy implies claim balances, claim buttons, source dashboards, or public rewards are live, stop.",
    },
  ],
  forbiddenCopy: [
    {
      id: "no-referral-launch",
      forbiddenPattern: "public referral is live / get your referral link",
      reason: "Verified Introduction V1 is not open self-serve referral and has no public source link.",
      saferReplacement: "Verified Introduction is invite-only and manually approved if a future launch packet is approved.",
    },
    {
      id: "no-claim-framing",
      forbiddenPattern: "claim your commission / claim rewards / claim balance",
      reason: "Claim UI is excluded from V1 and direct payout is first.",
      saferReplacement: "Source payout is direct first; escrow fallback remains an operational readback state.",
    },
    {
      id: "no-investment-framing",
      forbiddenPattern: "yield / ROI / passive income / guaranteed return",
      reason: "Acquisition commission is not an investment return or financial promise.",
      saferReplacement: "Acquisition commission is a direct on-chain acquisition cost when an approved source-attributed purchase succeeds.",
    },
    {
      id: "no-hierarchy-framing",
      forbiddenPattern: "downline / upline / team earnings / top earners",
      reason: "The product must not become money-game psychology or MLM-style referral marketing.",
      saferReplacement: "One approved source may be attributed to one qualifying MembershipSaleV3 purchase under explicit terms.",
    },
    {
      id: "no-status-framing",
      forbiddenPattern: "official representative / employee / agent / owns the member",
      reason: "Source attribution records acquisition contribution only.",
      saferReplacement: "A source may be credited for an approved introduction; it receives no agency, employment, ownership, or governance status.",
    },
  ],
  requiredBeforeSignature: [
    "Source label, class, status, wallet, and payout posture are visible.",
    "Commission bps, Acquisition Commission, and Net USDC Routed are visible.",
    "Buyer can clear source and return to ZERO_SOURCE_ID.",
    "Membership, price, seat, SYN delivery, and rights are unchanged.",
    "Approval and buy are separate actions.",
    "No claim UI, source dashboard, source link, alias route, or public referral launch is implied.",
  ],
} satisfies VerifiedIntroductionDisclosureReview;

export function getVerifiedIntroductionDisclosureBlockers(): readonly VerifiedIntroductionDisclosureItem[] {
  return VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW.disclosureItems.filter(
    (item) => item.status !== "SATISFIED_FOR_REVIEW",
  );
}

export function isVerifiedIntroductionDisclosureApproved(): false {
  return false;
}
