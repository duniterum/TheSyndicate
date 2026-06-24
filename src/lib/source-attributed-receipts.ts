import type { PurchaseEvent } from "./activity-hooks";
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
  sourceStatusProof: "REQUIRES_SOURCE_REGISTRY_READBACK";
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

export function projectSourceAttributedReceipt(
  event: PurchaseEvent,
): SourceAttributedReceiptReadModel | null {
  if (event.source !== "v3" || !isNonZeroSourceId(event.sourceId)) return null;

  const routed = event.vaultAmount + event.liquidityAmount + event.operationsAmount;
  const acquisitionCommission =
    event.acquisitionCostAmount ?? event.referralAmount ?? Math.max(0, event.usdcAmount - routed);
  const netUsdcRouted = event.protocolContributionAmount ?? routed;

  return {
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
