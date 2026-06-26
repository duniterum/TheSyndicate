import type { PurchaseEvent } from "./activity-hooks";
import {
  REAL_CONDITION_SOURCE_TEST_COMPLETION,
  REAL_CONDITION_SOURCE_TEST_TERMS,
} from "./source-real-condition-test";
import { ZERO_SOURCE_ID } from "./source-policy-observability";

const SOURCE_CLASS_LABELS = [
  "MEMBER_INTRODUCTION",
  "BUILDER_SOURCE",
  "AFFILIATE",
  "BD_NETWORK",
  "WHITELABEL",
  "SPONSORSHIP",
  "TREASURY_DEAL",
] as const;

const ATTRIBUTION_SCOPE_LABELS = [
  "FIRST_PURCHASE",
  "WINDOWED",
  "CAPPED",
  "LIFETIME",
  "CUSTOM",
] as const;

export type SourceAttributedReceiptReadModel = {
  receiptId?: string;
  txHash: string;
  blockNumber: bigint;
  buyer: string;
  recipient: string;
  memberNumber: bigint;
  grossUsdc: number;
  acquisitionCommission: number;
  netUsdcRouted: number;
  vaultAmount: number;
  liquidityAmount: number;
  operationsAmount: number;
  synAmount: number;
  sourceId: string;
  sourceClass?: number;
  sourceClassLabel: string;
  sourceStatusProof:
    | "REQUIRES_SOURCE_REGISTRY_READBACK"
    | "READBACK_CONFIRMED_SOURCE_REPAUSED";
  sourceWallet?: string;
  commissionBps?: number;
  commissionRateLabel: string;
  attributionScope?: number;
  attributionScopeLabel: string;
  attributionWindowEndsAt?: number;
  sourceGrossRemaining?: number;
  buyerGrossRemaining?: number;
  firstSeat?: boolean;
  receiptVersion?: number;
  finalSourceStatus?: "PAUSED";
  finalIsActive?: boolean;
  latestAuthorityReadbackBlock?: number;
  sourceEscrowOwed?: number;
  sourceGrossAttributed?: number;
  buyerGrossAttributedToSource?: number;
  publicReferralActive?: boolean;
  claimUiActive?: boolean;
  publicSourceAwareBuyPathActive?: boolean;
  proofSummary?: string;
  boundarySummary?: string;
};

export type SourceAttributedReceiptSummary = {
  receipts: SourceAttributedReceiptReadModel[];
  count: number;
  totalGrossUsdc: number;
  totalAcquisitionCommission: number;
  totalNetUsdcRouted: number;
  latestReceipt?: SourceAttributedReceiptReadModel;
};

export function isNonZeroSourceId(sourceId?: string): sourceId is string {
  return Boolean(sourceId && sourceId.toLowerCase() !== ZERO_SOURCE_ID);
}

export function sourceClassLabel(sourceClass?: number): string {
  return sourceClass !== undefined && SOURCE_CLASS_LABELS[sourceClass]
    ? SOURCE_CLASS_LABELS[sourceClass]
    : "UNKNOWN_SOURCE_CLASS";
}

export function attributionScopeLabel(attributionScope?: number): string {
  return attributionScope !== undefined && ATTRIBUTION_SCOPE_LABELS[attributionScope]
    ? ATTRIBUTION_SCOPE_LABELS[attributionScope]
    : "UNKNOWN_SCOPE";
}

export function formatCommissionBps(commissionBps?: number): string {
  if (commissionBps === undefined) return "unknown bps";
  const pct = commissionBps / 100;
  return `${Number.isInteger(pct) ? pct.toFixed(0) : pct.toFixed(2)}%`;
}

const USDC_UNITS = 1_000_000;
const SYN_UNITS = 1_000_000_000_000_000_000n;

function usdcFromRaw(raw: number): number {
  return raw / USDC_UNITS;
}

function synFromWei(raw: string): number {
  return Number(BigInt(raw) / SYN_UNITS);
}

function isCompletedInternalSourceReceipt(receipt: SourceAttributedReceiptReadModel): boolean {
  return (
    receipt.txHash.toLowerCase() ===
      REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.buy.hash.toLowerCase() &&
    receipt.sourceId.toLowerCase() === REAL_CONDITION_SOURCE_TEST_COMPLETION.sourceId.toLowerCase()
  );
}

export function applyCompletedInternalSourceProof(
  receipt: SourceAttributedReceiptReadModel,
): SourceAttributedReceiptReadModel {
  if (!isCompletedInternalSourceReceipt(receipt)) return receipt;

  return {
    ...receipt,
    sourceStatusProof: "READBACK_CONFIRMED_SOURCE_REPAUSED",
    finalSourceStatus: "PAUSED",
    finalIsActive: REAL_CONDITION_SOURCE_TEST_COMPLETION.finalIsActive,
    latestAuthorityReadbackBlock: REAL_CONDITION_SOURCE_TEST_COMPLETION.latestAuthorityReadbackBlock,
    sourceEscrowOwed: usdcFromRaw(REAL_CONDITION_SOURCE_TEST_COMPLETION.sourceEscrowOwed),
    sourceGrossAttributed: usdcFromRaw(REAL_CONDITION_SOURCE_TEST_COMPLETION.sourceGrossAttributed),
    buyerGrossAttributedToSource: usdcFromRaw(
      REAL_CONDITION_SOURCE_TEST_COMPLETION.buyerGrossAttributedToSource,
    ),
    publicReferralActive: REAL_CONDITION_SOURCE_TEST_COMPLETION.publicBoundaries.referralActive,
    claimUiActive: REAL_CONDITION_SOURCE_TEST_COMPLETION.publicBoundaries.claimUiActive,
    publicSourceAwareBuyPathActive:
      REAL_CONDITION_SOURCE_TEST_COMPLETION.publicBoundaries.publicSourceAwareBuyPathActive,
    proofSummary:
      "Readback-confirmed internal source-attributed V3 receipt; source returned to PAUSED.",
    boundarySummary:
      "Validated protocol capability only. Public referral, claim UI, source links, and public source-aware buys remain inactive.",
  };
}

export function completedInternalSourceAttributionPurchaseEvent(): PurchaseEvent {
  const completion = REAL_CONDITION_SOURCE_TEST_COMPLETION;
  const terms = REAL_CONDITION_SOURCE_TEST_TERMS;

  return {
    source: "v3",
    buyer: completion.buyer,
    recipient: completion.buyer,
    purchaseId: BigInt(completion.memberNumber),
    usdcAmount: usdcFromRaw(completion.grossUsdc),
    synAmount: synFromWei(completion.synOut),
    vaultAmount: usdcFromRaw(completion.vaultAmount),
    liquidityAmount: usdcFromRaw(completion.liquidityAmount),
    operationsAmount: usdcFromRaw(completion.operationsAmount),
    blockNumber: BigInt(completion.transactions.buy.block),
    txHash: completion.transactions.buy.hash,
    logIndex: 0,
    era: 1,
    firstSeat: true,
    receiptId: completion.receiptId,
    acquisitionCostAmount: usdcFromRaw(completion.acquisitionCost),
    protocolContributionAmount: usdcFromRaw(completion.protocolContribution),
    sourceId: completion.sourceId,
    sourceClass: 1,
    sourceWallet: terms.sourceWallet,
    commissionBps: terms.commissionBps,
    attributionScope: 1,
    attributionWindowEndsAt: terms.endTime,
    sourceGrossRemaining: usdcFromRaw((terms.grossCap ?? 0) - completion.sourceGrossAttributed),
    buyerGrossRemaining: usdcFromRaw(
      (terms.perBuyerCap ?? 0) - completion.buyerGrossAttributedToSource,
    ),
    receiptVersion: 1,
  };
}

export function getCompletedInternalSourceAttributionProof(): SourceAttributedReceiptReadModel {
  const receipt = projectSourceAttributedReceipt(completedInternalSourceAttributionPurchaseEvent());
  if (!receipt) {
    throw new Error("Completed internal source-attribution receipt could not be projected.");
  }
  return receipt;
}

export function projectSourceAttributedReceipt(
  event: PurchaseEvent,
): SourceAttributedReceiptReadModel | null {
  if (event.source !== "v3" || !isNonZeroSourceId(event.sourceId)) return null;

  const routed = event.vaultAmount + event.liquidityAmount + event.operationsAmount;
  const acquisitionCommission =
    event.acquisitionCostAmount ?? event.referralAmount ?? Math.max(0, event.usdcAmount - routed);
  const netUsdcRouted = event.protocolContributionAmount ?? routed;

  const receipt: SourceAttributedReceiptReadModel = {
    receiptId: event.receiptId,
    txHash: event.txHash,
    blockNumber: event.blockNumber,
    buyer: event.buyer,
    recipient: event.recipient ?? event.buyer,
    memberNumber: event.purchaseId,
    grossUsdc: event.usdcAmount,
    acquisitionCommission,
    netUsdcRouted,
    vaultAmount: event.vaultAmount,
    liquidityAmount: event.liquidityAmount,
    operationsAmount: event.operationsAmount,
    synAmount: event.synAmount,
    sourceId: event.sourceId,
    sourceClass: event.sourceClass,
    sourceClassLabel: sourceClassLabel(event.sourceClass),
    sourceStatusProof: "REQUIRES_SOURCE_REGISTRY_READBACK",
    sourceWallet: event.sourceWallet,
    commissionBps: event.commissionBps,
    commissionRateLabel: formatCommissionBps(event.commissionBps),
    attributionScope: event.attributionScope,
    attributionScopeLabel: attributionScopeLabel(event.attributionScope),
    attributionWindowEndsAt: event.attributionWindowEndsAt,
    sourceGrossRemaining: event.sourceGrossRemaining,
    buyerGrossRemaining: event.buyerGrossRemaining,
    firstSeat: event.firstSeat,
    receiptVersion: event.receiptVersion,
  };

  return applyCompletedInternalSourceProof(receipt);
}

export function summarizeSourceAttributedReceipts(
  events: readonly PurchaseEvent[],
  wallet?: string | null,
): SourceAttributedReceiptSummary {
  const walletKey = wallet?.toLowerCase();
  const receipts = events
    .map(projectSourceAttributedReceipt)
    .filter((receipt): receipt is SourceAttributedReceiptReadModel => {
      if (!receipt) return false;
      if (!walletKey) return true;
      return receipt.buyer.toLowerCase() === walletKey || receipt.recipient.toLowerCase() === walletKey;
    });

  return {
    receipts,
    count: receipts.length,
    totalGrossUsdc: receipts.reduce((sum, receipt) => sum + receipt.grossUsdc, 0),
    totalAcquisitionCommission: receipts.reduce(
      (sum, receipt) => sum + receipt.acquisitionCommission,
      0,
    ),
    totalNetUsdcRouted: receipts.reduce((sum, receipt) => sum + receipt.netUsdcRouted, 0),
    latestReceipt: receipts[0],
  };
}
