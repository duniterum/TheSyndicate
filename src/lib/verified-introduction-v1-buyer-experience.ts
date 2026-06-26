import { ZERO_SOURCE_ID } from "./source-policy-observability";

export const VERIFIED_INTRODUCTION_BUYER_LABEL = "Verified Introduction";
export const VERIFIED_INTRODUCTION_PROTOCOL_LABEL = "Source Attribution";
export const VERIFIED_INTRODUCTION_ACCOUNTING_LABEL = "Acquisition Source";

export const VERIFIED_INTRODUCTION_PREVIEW_GROSS_USDC_UNITS = 5_000_000n;
export const VERIFIED_INTRODUCTION_PREVIEW_COMMISSION_BPS = 500;

const USDC_SCALE = 1_000_000n;
const BPS_SCALE = 10_000n;

export type VerifiedIntroductionBuyerScenarioId =
  | "NO_SOURCE_PRESENT"
  | "SOURCE_PRESENT_NOT_APPROVED"
  | "SOURCE_PAUSED"
  | "SOURCE_REVOKED"
  | "SOURCE_EXPIRED"
  | "SOURCE_NOT_YET_ACTIVE"
  | "CAP_EXCEEDED"
  | "BUYER_ALREADY_SEATED"
  | "BUYER_HISTORICAL"
  | "BUYER_EQUALS_SOURCE_WALLET"
  | "WRONG_CHAIN"
  | "STALE_READBACK"
  | "ACTIVE_TERMS_MATCH"
  | "BUYER_CLEARED_SOURCE"
  | "APPROVAL_NEEDED"
  | "APPROVAL_COMPLETE_BUY_PENDING"
  | "BUY_SUBMITTED_WAIT_READBACK";

export type VerifiedIntroductionPreviewStatus =
  | "ZERO_SOURCE_DEFAULT"
  | "BLOCKED"
  | "PREVIEW_ALLOWED"
  | "APPROVAL_NEEDED"
  | "APPROVAL_COMPLETE_BUY_PENDING"
  | "BUY_SUBMITTED_STOP";

export type VerifiedIntroductionSourceStatus =
  | "NONE"
  | "UNAPPROVED"
  | "PAUSED"
  | "REVOKED"
  | "EXPIRED"
  | "NOT_YET_ACTIVE"
  | "CAP_EXCEEDED"
  | "STALE_READBACK"
  | "ACTIVE_TERMS_MATCH";

export type VerifiedIntroductionBuyerBlocker =
  | "NONE"
  | "SOURCE_NOT_APPROVED"
  | "SOURCE_PAUSED"
  | "SOURCE_REVOKED"
  | "SOURCE_EXPIRED"
  | "SOURCE_NOT_YET_ACTIVE"
  | "CAP_EXCEEDED"
  | "BUYER_ALREADY_SEATED"
  | "BUYER_HISTORICAL"
  | "BUYER_EQUALS_SOURCE_WALLET"
  | "WRONG_CHAIN"
  | "STALE_READBACK"
  | "BUY_SUBMITTED_WAIT_READBACK";

export type VerifiedIntroductionBuyerPreview = {
  labels: {
    buyerFacing: typeof VERIFIED_INTRODUCTION_BUYER_LABEL;
    protocol: typeof VERIFIED_INTRODUCTION_PROTOCOL_LABEL;
    accounting: typeof VERIFIED_INTRODUCTION_ACCOUNTING_LABEL;
  };
  source: {
    label: string;
    approvedIdentity: string;
    sourceClass: string;
    status: VerifiedIntroductionSourceStatus;
    payoutPosture: string;
  };
  quote: {
    grossUsdc: string;
    commissionBps: number;
    acquisitionCommissionUsdc: string;
    netUsdcRouted: string;
  };
  clearSource: {
    available: boolean;
    resultSourceId: typeof ZERO_SOURCE_ID;
    explanation: string;
  };
  disclosure: {
    membershipUnchanged: string;
    zeroSourceDefault: string;
    nonLaunchBoundary: string;
  };
};

export type VerifiedIntroductionBuyerScenario = {
  id: VerifiedIntroductionBuyerScenarioId;
  title: string;
  previewStatus: VerifiedIntroductionPreviewStatus;
  sourceStatus: VerifiedIntroductionSourceStatus;
  blocker: VerifiedIntroductionBuyerBlocker;
  sourceIdForPurchase: typeof ZERO_SOURCE_ID | "APPROVED_SOURCE_ID_ONLY_AFTER_LAUNCH_PACKET";
  usesZeroSourceFallback: boolean;
  previewAllowed: boolean;
  sourceAwareQuoteAllowed: boolean;
  signatureAllowedNow: false;
  approvalOnly: boolean;
  buySubmitted: boolean;
  clearSourceAvailable: boolean;
  buyerMessage: string;
  nextAction: string;
  stopCondition: string;
  requiredReadback: string;
  preview: VerifiedIntroductionBuyerPreview;
};

export type VerifiedIntroductionBuyerPreviewInput = {
  sourceLabel?: string;
  approvedIdentity?: string;
  sourceClass?: string;
  sourceStatus?: VerifiedIntroductionSourceStatus;
  grossUsdcUnits?: bigint;
  commissionBps?: number;
  clearSourceAvailable?: boolean;
};

export function formatUsdcUnits(units: bigint): string {
  const whole = units / USDC_SCALE;
  const decimals = (units % USDC_SCALE).toString().padStart(6, "0").slice(0, 2);
  return `${whole.toString()}.${decimals} USDC`;
}

export function buildVerifiedIntroductionBuyerPreview(
  input: VerifiedIntroductionBuyerPreviewInput = {},
): VerifiedIntroductionBuyerPreview {
  const grossUsdcUnits = input.grossUsdcUnits ?? VERIFIED_INTRODUCTION_PREVIEW_GROSS_USDC_UNITS;
  const commissionBps = input.commissionBps ?? VERIFIED_INTRODUCTION_PREVIEW_COMMISSION_BPS;
  const acquisitionCommissionUnits = (grossUsdcUnits * BigInt(commissionBps)) / BPS_SCALE;
  const netUsdcRoutedUnits = grossUsdcUnits - acquisitionCommissionUnits;

  return {
    labels: {
      buyerFacing: VERIFIED_INTRODUCTION_BUYER_LABEL,
      protocol: VERIFIED_INTRODUCTION_PROTOCOL_LABEL,
      accounting: VERIFIED_INTRODUCTION_ACCOUNTING_LABEL,
    },
    source: {
      label: input.sourceLabel ?? "Approved source identity pending founder launch packet",
      approvedIdentity: input.approvedIdentity ?? "Manually approved introducer only",
      sourceClass: input.sourceClass ?? "MembershipSaleV3 acquisition source",
      status: input.sourceStatus ?? "ACTIVE_TERMS_MATCH",
      payoutPosture:
        "Direct on-chain payout first; escrow fallback only if direct payout fails; no claim UI in V1.",
    },
    quote: {
      grossUsdc: formatUsdcUnits(grossUsdcUnits),
      commissionBps,
      acquisitionCommissionUsdc: formatUsdcUnits(acquisitionCommissionUnits),
      netUsdcRouted: formatUsdcUnits(netUsdcRoutedUnits),
    },
    clearSource: {
      available: input.clearSourceAvailable ?? true,
      resultSourceId: ZERO_SOURCE_ID,
      explanation: "Clearing the introduction returns the buyer to the public/default ZERO_SOURCE_ID path.",
    },
    disclosure: {
      membershipUnchanged:
        "The seat, price, rights, membership status, and buyer obligations do not change because an introduction is present.",
      zeroSourceDefault:
        "Public/default purchases continue to use ZERO_SOURCE_ID unless a separately approved V1 introduction path is present.",
      nonLaunchBoundary:
        "This skeleton is not referral activation, not a public referral link, not a source dashboard, and not a claim surface.",
    },
  };
}

function scenario(
  partial: Omit<VerifiedIntroductionBuyerScenario, "signatureAllowedNow" | "preview"> & {
    preview?: VerifiedIntroductionBuyerPreview;
  },
): VerifiedIntroductionBuyerScenario {
  return {
    ...partial,
    signatureAllowedNow: false,
    preview:
      partial.preview ??
      buildVerifiedIntroductionBuyerPreview({
        sourceStatus: partial.sourceStatus,
        clearSourceAvailable: partial.clearSourceAvailable,
      }),
  };
}

export const VERIFIED_INTRODUCTION_BUYER_SCENARIOS: readonly VerifiedIntroductionBuyerScenario[] = [
  scenario({
    id: "NO_SOURCE_PRESENT",
    title: "No introduction present",
    previewStatus: "ZERO_SOURCE_DEFAULT",
    sourceStatus: "NONE",
    blocker: "NONE",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: false,
    buyerMessage: "The buyer is on the normal public path.",
    nextAction: "Continue with the default buy flow only.",
    stopCondition: "Do not attach a sourceId.",
    requiredReadback: "Confirm public/default buy parameters still use ZERO_SOURCE_ID.",
    preview: buildVerifiedIntroductionBuyerPreview({
      sourceStatus: "NONE",
      clearSourceAvailable: false,
    }),
  }),
  scenario({
    id: "SOURCE_PRESENT_NOT_APPROVED",
    title: "Introduction is present but not approved",
    previewStatus: "BLOCKED",
    sourceStatus: "UNAPPROVED",
    blocker: "SOURCE_NOT_APPROVED",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The buyer must not see this as a valid introduction.",
    nextAction: "Clear the source and return to ZERO_SOURCE_ID.",
    stopCondition: "Stop before approval or purchase.",
    requiredReadback: "Confirm the source is founder-approved before any future V1 use.",
  }),
  scenario({
    id: "SOURCE_PAUSED",
    title: "Source is PAUSED",
    previewStatus: "BLOCKED",
    sourceStatus: "PAUSED",
    blocker: "SOURCE_PAUSED",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The source record exists but is intentionally stopped.",
    nextAction: "Wait for a separate ACTIVE ceremony or clear back to ZERO_SOURCE_ID.",
    stopCondition: "Do not request approval or purchase while PAUSED.",
    requiredReadback: "Confirm isActive(sourceId) remains false.",
  }),
  scenario({
    id: "SOURCE_REVOKED",
    title: "Source is REVOKED",
    previewStatus: "BLOCKED",
    sourceStatus: "REVOKED",
    blocker: "SOURCE_REVOKED",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The introduction is no longer eligible.",
    nextAction: "Clear the source and use ZERO_SOURCE_ID.",
    stopCondition: "Never revive a revoked source through buyer UX.",
    requiredReadback: "Confirm status remains revoked before treating it as unavailable.",
  }),
  scenario({
    id: "SOURCE_EXPIRED",
    title: "Source window expired",
    previewStatus: "BLOCKED",
    sourceStatus: "EXPIRED",
    blocker: "SOURCE_EXPIRED",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The introduction window has ended.",
    nextAction: "Clear the source unless a new founder-approved terms update occurs.",
    stopCondition: "Do not purchase against expired terms.",
    requiredReadback: "Confirm current time is after endTime and terms were not extended.",
  }),
  scenario({
    id: "SOURCE_NOT_YET_ACTIVE",
    title: "Source window has not started",
    previewStatus: "BLOCKED",
    sourceStatus: "NOT_YET_ACTIVE",
    blocker: "SOURCE_NOT_YET_ACTIVE",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The introduction has approved terms, but the window has not opened.",
    nextAction: "Wait for the approved start time or clear back to ZERO_SOURCE_ID.",
    stopCondition: "Do not allow approval or purchase before startTime.",
    requiredReadback: "Confirm current time is before startTime.",
  }),
  scenario({
    id: "CAP_EXCEEDED",
    title: "Source cap exceeded",
    previewStatus: "BLOCKED",
    sourceStatus: "CAP_EXCEEDED",
    blocker: "CAP_EXCEEDED",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The introduction cannot accept more attributed volume.",
    nextAction: "Clear the source and use ZERO_SOURCE_ID.",
    stopCondition: "Do not exceed gross or per-buyer caps.",
    requiredReadback: "Confirm gross and per-buyer cap accounting before blocking.",
  }),
  scenario({
    id: "BUYER_ALREADY_SEATED",
    title: "Buyer already owns a seat",
    previewStatus: "BLOCKED",
    sourceStatus: "ACTIVE_TERMS_MATCH",
    blocker: "BUYER_ALREADY_SEATED",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "A seated member is not eligible for a first-seat introduction purchase.",
    nextAction: "Stop and show the existing member path.",
    stopCondition: "Do not route repeat purchases unless a later policy explicitly allows it.",
    requiredReadback: "Confirm buyer seat status before any source-aware purchase.",
  }),
  scenario({
    id: "BUYER_HISTORICAL",
    title: "Buyer is a historical member",
    previewStatus: "BLOCKED",
    sourceStatus: "ACTIVE_TERMS_MATCH",
    blocker: "BUYER_HISTORICAL",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "Historical member recognition is not a new acquisition.",
    nextAction: "Stop and show the historical/member path.",
    stopCondition: "Do not count historical members as V1 introductions.",
    requiredReadback: "Confirm historical membership status before proceeding.",
  }),
  scenario({
    id: "BUYER_EQUALS_SOURCE_WALLET",
    title: "Buyer equals source wallet",
    previewStatus: "BLOCKED",
    sourceStatus: "ACTIVE_TERMS_MATCH",
    blocker: "BUYER_EQUALS_SOURCE_WALLET",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "A source wallet cannot introduce itself.",
    nextAction: "Clear the source and use a distinct buyer wallet if eligible.",
    stopCondition: "Do not permit self-attribution.",
    requiredReadback: "Compare buyer wallet to sourceWallet and payoutWallet.",
  }),
  scenario({
    id: "WRONG_CHAIN",
    title: "Wrong chain",
    previewStatus: "BLOCKED",
    sourceStatus: "ACTIVE_TERMS_MATCH",
    blocker: "WRONG_CHAIN",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The buyer wallet is not connected to Avalanche C-Chain.",
    nextAction: "Switch to chainId 43114 before any future V1 source-aware action.",
    stopCondition: "Do not encode a purchase on the wrong chain.",
    requiredReadback: "Confirm chainId 43114.",
  }),
  scenario({
    id: "STALE_READBACK",
    title: "Readback is stale",
    previewStatus: "BLOCKED",
    sourceStatus: "STALE_READBACK",
    blocker: "STALE_READBACK",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The buyer experience must not rely on old source truth.",
    nextAction: "Refresh current-authority readback before showing source-aware preview.",
    stopCondition: "Do not use historical anchors for live buyer decisions.",
    requiredReadback: "Read sourceConfig(sourceId) and isActive(sourceId) at latest block.",
  }),
  scenario({
    id: "ACTIVE_TERMS_MATCH",
    title: "Source ACTIVE and terms match",
    previewStatus: "PREVIEW_ALLOWED",
    sourceStatus: "ACTIVE_TERMS_MATCH",
    blocker: "NONE",
    sourceIdForPurchase: "APPROVED_SOURCE_ID_ONLY_AFTER_LAUNCH_PACKET",
    usesZeroSourceFallback: false,
    previewAllowed: true,
    sourceAwareQuoteAllowed: true,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The buyer may see the Verified Introduction preview.",
    nextAction: "Show disclosure, clear-source option, and approval readiness without launching public referral.",
    stopCondition: "Do not treat preview as a completed wallet action.",
    requiredReadback: "Confirm source status, terms, caps, buyer eligibility, and chain before any future approval step.",
  }),
  scenario({
    id: "BUYER_CLEARED_SOURCE",
    title: "Buyer clears the introduction",
    previewStatus: "ZERO_SOURCE_DEFAULT",
    sourceStatus: "NONE",
    blocker: "NONE",
    sourceIdForPurchase: ZERO_SOURCE_ID,
    usesZeroSourceFallback: true,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: false,
    buyerMessage: "The buyer intentionally returns to the public/default path.",
    nextAction: "Use ZERO_SOURCE_ID for any subsequent purchase.",
    stopCondition: "Do not preserve the cleared source in cache or URL state.",
    requiredReadback: "Confirm the encoded buy args use ZERO_SOURCE_ID after clearing.",
    preview: buildVerifiedIntroductionBuyerPreview({
      sourceStatus: "NONE",
      clearSourceAvailable: false,
    }),
  }),
  scenario({
    id: "APPROVAL_NEEDED",
    title: "USDC approval needed",
    previewStatus: "APPROVAL_NEEDED",
    sourceStatus: "ACTIVE_TERMS_MATCH",
    blocker: "NONE",
    sourceIdForPurchase: "APPROVED_SOURCE_ID_ONLY_AFTER_LAUNCH_PACKET",
    usesZeroSourceFallback: false,
    previewAllowed: true,
    sourceAwareQuoteAllowed: true,
    approvalOnly: true,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "Approval is permission only. It is not a purchase.",
    nextAction: "After an approved launch packet, request allowance before buy.",
    stopCondition: "Stop after approval and wait for allowance readback.",
    requiredReadback: "Confirm allowance increased; confirm no MembershipPurchased event exists yet.",
  }),
  scenario({
    id: "APPROVAL_COMPLETE_BUY_PENDING",
    title: "Approval complete, buy still pending",
    previewStatus: "APPROVAL_COMPLETE_BUY_PENDING",
    sourceStatus: "ACTIVE_TERMS_MATCH",
    blocker: "NONE",
    sourceIdForPurchase: "APPROVED_SOURCE_ID_ONLY_AFTER_LAUNCH_PACKET",
    usesZeroSourceFallback: false,
    previewAllowed: true,
    sourceAwareQuoteAllowed: true,
    approvalOnly: false,
    buySubmitted: false,
    clearSourceAvailable: true,
    buyerMessage: "The wallet has allowance, but the seat has not been purchased.",
    nextAction: "Show a separate buy step only after source and buyer readbacks remain green.",
    stopCondition: "Do not label approval as a completed buy.",
    requiredReadback: "Confirm allowance, source status, buyer eligibility, and no prior seat before buy.",
  }),
  scenario({
    id: "BUY_SUBMITTED_WAIT_READBACK",
    title: "Buy submitted; wait for readback",
    previewStatus: "BUY_SUBMITTED_STOP",
    sourceStatus: "ACTIVE_TERMS_MATCH",
    blocker: "BUY_SUBMITTED_WAIT_READBACK",
    sourceIdForPurchase: "APPROVED_SOURCE_ID_ONLY_AFTER_LAUNCH_PACKET",
    usesZeroSourceFallback: false,
    previewAllowed: false,
    sourceAwareQuoteAllowed: false,
    approvalOnly: false,
    buySubmitted: true,
    clearSourceAvailable: false,
    buyerMessage: "The operator must stop and wait for the transaction receipt.",
    nextAction: "Read back MembershipPurchasedV3, source accounting, buyer state, and payout result.",
    stopCondition: "Do not retry, refresh into a second buy, or infer success before receipt.",
    requiredReadback: "Confirm receipt, sourceId, commission, net routing, payout, escrow, and buyer attribution state.",
  }),
];

export function getVerifiedIntroductionBuyerScenario(
  id: VerifiedIntroductionBuyerScenarioId,
): VerifiedIntroductionBuyerScenario {
  const scenario = VERIFIED_INTRODUCTION_BUYER_SCENARIOS.find((item) => item.id === id);
  if (!scenario) {
    throw new Error(`Unknown Verified Introduction buyer scenario: ${id}`);
  }
  return scenario;
}

export const VERIFIED_INTRODUCTION_BUYER_SKELETON_BOUNDARY = {
  mountedInPublicJoin: false,
  publicSourceAwareBuyPath: false,
  publicReferralLaunch: false,
  claimUi: false,
  sourceDashboard: false,
  aliasRoute: false,
  defaultSourceId: ZERO_SOURCE_ID,
} as const;
