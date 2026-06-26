import { describe, expect, it } from "vitest";
import type { PurchaseEvent } from "../activity-hooks";
import {
  completedInternalSourceAttributionPurchaseEvent,
  getCompletedInternalSourceAttributionProof,
  projectSourceAttributedReceipt,
  summarizeSourceAttributedReceipts,
} from "../source-attributed-receipts";
import { deserializePurchaseEvents, serializePurchaseEvents } from "../purchase-events-cache";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

const BUYER = "0x1111111111111111111111111111111111111111";
const RECIPIENT = "0x2222222222222222222222222222222222222222";
const SOURCE_WALLET = "0x3333333333333333333333333333333333333333";
const SOURCE_ID = `0x${"a".repeat(64)}`;

function v3Purchase(over: Partial<PurchaseEvent> = {}): PurchaseEvent {
  return {
    source: "v3",
    buyer: BUYER,
    recipient: RECIPIENT,
    purchaseId: 9n,
    usdcAmount: 5,
    synAmount: 500,
    vaultAmount: 3.325,
    liquidityAmount: 0.95,
    operationsAmount: 0.475,
    blockNumber: 90_000_001n,
    txHash: `0x${"b".repeat(64)}`,
    logIndex: 7,
    era: 1,
    firstSeat: true,
    referralAmount: 0.25,
    receiptId: `0x${"c".repeat(64)}`,
    acquisitionCostAmount: 0.25,
    protocolContributionAmount: 4.75,
    sourceId: SOURCE_ID,
    sourceClass: 1,
    sourceWallet: SOURCE_WALLET,
    commissionBps: 500,
    attributionScope: 1,
    attributionWindowEndsAt: 1_784_116_800,
    sourceGrossRemaining: 20,
    buyerGrossRemaining: 0,
    receiptVersion: 3,
    ...over,
  };
}

describe("source-attributed receipt read model", () => {
  it("projects a future V3 source-attributed receipt without creating activation state", () => {
    const receipt = projectSourceAttributedReceipt(v3Purchase());

    expect(receipt).toMatchObject({
      sourceId: SOURCE_ID,
      sourceClass: 1,
      sourceClassLabel: "BUILDER_SOURCE",
      sourceStatusProof: "REQUIRES_SOURCE_REGISTRY_READBACK",
      sourceWallet: SOURCE_WALLET,
      commissionBps: 500,
      commissionRateLabel: "5%",
      attributionScope: 1,
      attributionScopeLabel: "WINDOWED",
      grossUsdc: 5,
      acquisitionCommission: 0.25,
      netUsdcRouted: 4.75,
      vaultAmount: 3.325,
      liquidityAmount: 0.95,
      operationsAmount: 0.475,
      synAmount: 500,
      receiptVersion: 3,
    });
  });

  it("does not project public/default ZERO_SOURCE_ID purchases as source-attributed", () => {
    expect(projectSourceAttributedReceipt(v3Purchase({ sourceId: ZERO_SOURCE_ID }))).toBeNull();
    expect(projectSourceAttributedReceipt({ ...v3Purchase(), source: "v2" })).toBeNull();
  });

  it("summarizes Activity/My Syndicate receipts by buyer or recipient wallet", () => {
    const other = v3Purchase({
      buyer: "0x4444444444444444444444444444444444444444",
      recipient: "0x5555555555555555555555555555555555555555",
      txHash: `0x${"d".repeat(64)}`,
      logIndex: 8,
    });
    const summary = summarizeSourceAttributedReceipts([v3Purchase(), other], RECIPIENT);

    expect(summary.count).toBe(1);
    expect(summary.latestReceipt?.txHash).toBe(`0x${"b".repeat(64)}`);
    expect(summary.totalGrossUsdc).toBe(5);
    expect(summary.totalAcquisitionCommission).toBe(0.25);
    expect(summary.totalNetUsdcRouted).toBe(4.75);
  });

  it("survives purchase cache serialize/restore with all source receipt fields intact", () => {
    const event = v3Purchase();
    const restored = deserializePurchaseEvents(serializePurchaseEvents([event], 123, 90_000_001n));

    expect(restored).toBeDefined();
    const receipt = projectSourceAttributedReceipt(restored!.events[0]);
    expect(receipt).toMatchObject({
      sourceId: SOURCE_ID,
      sourceClassLabel: "BUILDER_SOURCE",
      commissionRateLabel: "5%",
      attributionScopeLabel: "WINDOWED",
      sourceStatusProof: "REQUIRES_SOURCE_REGISTRY_READBACK",
    });
    expect(restored!.events[0].blockNumber).toBe(90_000_001n);
  });

  it("marks the completed internal source-attribution ceremony as readback-confirmed and re-paused", () => {
    const receipt = getCompletedInternalSourceAttributionProof();

    expect(receipt).toMatchObject({
      txHash: "0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46",
      sourceStatusProof: "READBACK_CONFIRMED_SOURCE_REPAUSED",
      finalSourceStatus: "PAUSED",
      finalIsActive: false,
      latestAuthorityReadbackBlock: 88808111,
      grossUsdc: 5,
      acquisitionCommission: 0.25,
      netUsdcRouted: 4.75,
      sourceEscrowOwed: 0,
      sourceGrossAttributed: 5,
      buyerGrossAttributedToSource: 5,
      publicReferralActive: false,
      claimUiActive: false,
      publicSourceAwareBuyPathActive: false,
      sourceClassLabel: "BUILDER_SOURCE",
      attributionScopeLabel: "WINDOWED",
    });
    expect(receipt.memberNumber).toBe(10n);
    expect(receipt.boundarySummary).toContain("Public referral");
  });

  it("projects the completed ceremony event through the same receipt path used by Activity", () => {
    const event = completedInternalSourceAttributionPurchaseEvent();
    const receipt = projectSourceAttributedReceipt(event);

    expect(receipt?.sourceStatusProof).toBe("READBACK_CONFIRMED_SOURCE_REPAUSED");
    expect(receipt?.buyer).toBe("0x620febd921E7B8d123c7DFB6731ed58fCfbcC75F");
    expect(receipt?.sourceGrossRemaining).toBe(20);
    expect(receipt?.buyerGrossRemaining).toBe(0);
  });

  it("contains no fake-live referral, claim, or financial-leaderboard language", () => {
    const text = JSON.stringify(projectSourceAttributedReceipt(v3Purchase()), (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    );
    expect(text).not.toMatch(/public referral is live|claim UI is live|source link is live/i);
    expect(text).not.toMatch(/passive income|downline|upline|\bROI\b|top earner|leaderboard/i);
  });
});
