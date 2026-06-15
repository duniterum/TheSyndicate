// =============================================================================
//  Holder Index — master identity across V1 + V2 (first-seen)
// =============================================================================
//  Pins the FROZEN identity rule end-to-end across both sale contracts:
//    • member numbers come from first-SEEN wallet order, NEVER from a V2
//      on-chain memberNumber (which is metadata / a cross-check only)
//    • a V2 repeat / recognized-V1 buy (firstSeat:false) by a wallet already
//      present does NOT mint a new identity — it folds into the existing record
//  These guard the architect's pre-V2-live concern: an orphan firstSeat:false
//  must never create a phantom member when the full first-seen window is present.
// =============================================================================
import { describe, it, expect } from "vitest";
import { buildHolderIndex } from "../holder-index";
import type { PurchaseEvent } from "../activity-hooks";

function ev(over: Partial<PurchaseEvent>): PurchaseEvent {
  return {
    source: "v1",
    buyer: "0xA",
    purchaseId: 1n,
    usdcAmount: 100,
    synAmount: 10_000,
    vaultAmount: 70,
    liquidityAmount: 20,
    operationsAmount: 10,
    blockNumber: 100n,
    txHash: "0xt",
    logIndex: 0,
    ...over,
  };
}

describe("Holder Index · cross-source identity", () => {
  it("assigns member numbers by first-seen order, NOT by V2 memberNumber", () => {
    const idx = buildHolderIndex([
      ev({ source: "v1", buyer: "0xAAA", blockNumber: 100n, txHash: "0x1" }),
      ev({
        source: "v2",
        buyer: "0xBBB",
        blockNumber: 200n,
        txHash: "0x2",
        purchaseId: 334n,
        firstSeat: true,
        era: 2,
        referralAmount: 0,
      }),
    ]);
    expect(idx.totals.members).toBe(2);
    expect(idx.byWallet.get("0xaaa")!.memberNumber).toBe(1);
    // V2 buyer is #2 by ORDER even though its on-chain memberNumber is 334.
    expect(idx.byWallet.get("0xbbb")!.memberNumber).toBe(2);
  });

  it("a V2 repeat buy (firstSeat:false) by an existing V1 wallet does NOT create a new identity", () => {
    const idx = buildHolderIndex([
      ev({ source: "v1", buyer: "0xAAA", blockNumber: 100n, txHash: "0x1", usdcAmount: 100 }),
      ev({
        source: "v2",
        buyer: "0xAAA",
        blockNumber: 200n,
        txHash: "0x2",
        usdcAmount: 50,
        firstSeat: false,
        era: 2,
        referralAmount: 0,
        purchaseId: 0n,
      }),
    ]);
    expect(idx.totals.members).toBe(1);
    const rec = idx.byWallet.get("0xaaa")!;
    expect(rec.memberNumber).toBe(1);
    expect(rec.purchaseCount).toBe(2);
    expect(rec.cumulativeUsdc).toBe(150);
  });

  it("orders identity by block then logIndex regardless of source", () => {
    const idx = buildHolderIndex([
      ev({ source: "v2", buyer: "0xBBB", blockNumber: 100n, logIndex: 1, txHash: "0x2", firstSeat: true, era: 2 }),
      ev({ source: "v1", buyer: "0xAAA", blockNumber: 100n, logIndex: 0, txHash: "0x1" }),
    ]);
    // Same block: logIndex 0 (V1) is first-seen → member #1.
    expect(idx.byWallet.get("0xaaa")!.memberNumber).toBe(1);
    expect(idx.byWallet.get("0xbbb")!.memberNumber).toBe(2);
  });
});
