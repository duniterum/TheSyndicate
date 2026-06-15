// =============================================================================
//  Multi-source (V1 + V2) NormalizedPurchase indexing — WS1
// =============================================================================
//  Complements purchase-events-{canonical,incremental,cache}.test.ts (which pin
//  the limit slice, dedupe/order, cursor math, and cache round-trip). Here we
//  pin the NEW cross-source surface introduced for Sale V2:
//    • every purchase is tagged with its originating `source` ("v1" | "v2")
//    • V2-only enrichment (era / firstSeat / referralAmount) rides along and is
//      undefined for V1
//    • a mixed V1+V2 merge stays newest-first, deduped, and lossless
//    • NormalizedPurchase is a true alias usable wherever PurchaseEvent is
//  Cross-source dedupe safety RELIES on V1/V2 tx hashes never colliding — the
//  key is `txHash:logIndex`, source-independent, so this invariant is asserted.
// =============================================================================
import { describe, it, expect } from "vitest";
import {
  mergePurchaseEvents,
  purchaseEventKey,
  applyPurchaseLimit,
  joinV2PurchaseEvents,
  type PurchaseEvent,
  type NormalizedPurchase,
  type PurchaseSource,
  type V2PurchasedLog,
  type V2RoutedSplit,
} from "../activity-hooks";

function v1(over: Partial<PurchaseEvent> = {}): PurchaseEvent {
  return {
    source: "v1",
    buyer: "0xV1buyer",
    purchaseId: 1n,
    usdcAmount: 100,
    synAmount: 10_000,
    vaultAmount: 70,
    liquidityAmount: 20,
    operationsAmount: 10,
    blockNumber: 100n,
    txHash: "0xa1",
    logIndex: 0,
    ...over,
  };
}

function v2(over: Partial<PurchaseEvent> = {}): PurchaseEvent {
  return {
    source: "v2",
    buyer: "0xV2buyer",
    purchaseId: 334n,
    usdcAmount: 100,
    synAmount: 10_000,
    vaultAmount: 70,
    liquidityAmount: 20,
    operationsAmount: 10,
    blockNumber: 200n,
    txHash: "0xb2",
    logIndex: 0,
    era: 2,
    firstSeat: true,
    referralAmount: 3,
    ...over,
  };
}

describe("WS1 · source tagging", () => {
  it("tags each purchase with its originating sale contract", () => {
    const s1: PurchaseSource = v1().source;
    const s2: PurchaseSource = v2().source;
    expect(s1).toBe("v1");
    expect(s2).toBe("v2");
  });

  it("V1 carries none of the V2-only enrichment fields", () => {
    const e = v1();
    expect(e.era).toBeUndefined();
    expect(e.firstSeat).toBeUndefined();
    expect(e.referralAmount).toBeUndefined();
  });

  it("V2 carries era, firstSeat and referralAmount", () => {
    const e = v2({ era: 3, firstSeat: false, referralAmount: 12 });
    expect(e.era).toBe(3);
    expect(e.firstSeat).toBe(false);
    expect(e.referralAmount).toBe(12);
  });
});

describe("WS1 · NormalizedPurchase alias", () => {
  it("is interchangeable with PurchaseEvent at every call site", () => {
    const n: NormalizedPurchase = v2();
    expect(purchaseEventKey(n)).toBe("0xb2:0");
    // a NormalizedPurchase[] flows through the same pure helpers
    const list: NormalizedPurchase[] = [v2(), v1()];
    expect(applyPurchaseLimit(list, 1)).toHaveLength(1);
  });
});

describe("WS1 · cross-source merge", () => {
  it("merges V1 + V2 into one newest-first list", () => {
    const merged = mergePurchaseEvents([v1()], [v2()]);
    expect(merged).toHaveLength(2);
    // v2 is block 200 (newer) → first
    expect(merged[0].source).toBe("v2");
    expect(merged[1].source).toBe("v1");
  });

  it("keeps both sources because V1/V2 tx hashes never collide (distinct keys)", () => {
    const a = v1({ txHash: "0xa1", logIndex: 0 });
    const b = v2({ txHash: "0xb2", logIndex: 0 });
    expect(purchaseEventKey(a)).not.toBe(purchaseEventKey(b));
    expect(mergePurchaseEvents([a], [b])).toHaveLength(2);
  });

  it("the key is source-independent (txHash:logIndex) — the safety rests on distinct hashes", () => {
    // Same tx+logIndex but different source WOULD collide; this documents why the
    // V2 scan uses its own contract address (its logs can never share a V1 tx).
    const collidingV1 = v1({ txHash: "0xZ", logIndex: 5 });
    const collidingV2 = v2({ txHash: "0xZ", logIndex: 5 });
    expect(purchaseEventKey(collidingV1)).toBe(purchaseEventKey(collidingV2));
    expect(mergePurchaseEvents([collidingV1], [collidingV2])).toHaveLength(1);
  });

  it("preserves V2 enrichment through a re-scan collision (fresh wins, lossless)", () => {
    const cached = v2({ txHash: "0xc3", firstSeat: true, referralAmount: 1, era: 2 });
    const fresh = v2({ txHash: "0xc3", firstSeat: false, referralAmount: 9, era: 2 });
    const merged = mergePurchaseEvents([cached], [fresh]);
    expect(merged).toHaveLength(1);
    expect(merged[0].firstSeat).toBe(false);
    expect(merged[0].referralAmount).toBe(9);
    expect(merged[0].era).toBe(2);
  });

  it("tie-breaks equal blocks by logIndex descending across sources", () => {
    const earlier = v1({ blockNumber: 150n, logIndex: 0, txHash: "0xd1" });
    const later = v2({ blockNumber: 150n, logIndex: 1, txHash: "0xd2" });
    const merged = mergePurchaseEvents([earlier], [later]);
    expect(merged[0].txHash).toBe("0xd2");
    expect(merged[1].txHash).toBe("0xd1");
  });

  it("applyPurchaseLimit over a mixed list returns the newest N with tags intact", () => {
    const merged = mergePurchaseEvents([v1({ blockNumber: 100n, txHash: "0xe1" })], [
      v2({ blockNumber: 300n, txHash: "0xe3" }),
      v2({ blockNumber: 200n, txHash: "0xe2", purchaseId: 335n }),
    ]);
    const top2 = applyPurchaseLimit(merged, 2);
    expect(top2).toHaveLength(2);
    expect(top2.map((e) => e.source)).toEqual(["v2", "v2"]);
    expect(top2[0].blockNumber).toBe(300n);
  });
});

function plog(over: Partial<V2PurchasedLog> = {}): V2PurchasedLog {
  return {
    buyer: "0xV2buyer",
    memberNumber: 334n,
    era: 2,
    usdcAmount: 100,
    synAmount: 10_000,
    firstSeat: true,
    blockNumber: 200n,
    txHash: "0xtx1",
    logIndex: 0,
    ...over,
  };
}

const SPLIT: V2RoutedSplit = { vault: 70, liquidity: 20, operations: 10, referral: 0 };

describe("WS1 · joinV2PurchaseEvents (Purchased ⋈ Routed, fail-closed)", () => {
  it("joins a Purchased to its Routed money-split by txHash", () => {
    const routed = new Map<string, V2RoutedSplit>([
      ["0xtx1", { vault: 70, liquidity: 20, operations: 7, referral: 3 }],
    ]);
    const { events, joinIncomplete } = joinV2PurchaseEvents([plog()], routed);
    expect(joinIncomplete).toBe(false);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      source: "v2",
      buyer: "0xV2buyer",
      purchaseId: 334n,
      era: 2,
      firstSeat: true,
      vaultAmount: 70,
      liquidityAmount: 20,
      operationsAmount: 7,
      referralAmount: 3,
      txHash: "0xtx1",
    });
  });

  it("DROPS a Purchased with no Routed split and flags joinIncomplete (never zero-fills)", () => {
    const { events, joinIncomplete } = joinV2PurchaseEvents([plog({ txHash: "0xorphan" })], new Map());
    expect(events).toHaveLength(0);
    expect(joinIncomplete).toBe(true);
  });

  it("a dropped event is ABSENT, not zeroed — surviving events carry real amounts", () => {
    const routed = new Map<string, V2RoutedSplit>([["0xtx1", SPLIT]]);
    const { events, joinIncomplete } = joinV2PurchaseEvents(
      [plog({ txHash: "0xtx1" }), plog({ txHash: "0xmissing", memberNumber: 335n })],
      routed,
    );
    expect(joinIncomplete).toBe(true);
    expect(events.map((e) => e.txHash)).toEqual(["0xtx1"]);
    expect(events.every((e) => e.vaultAmount > 0)).toBe(true);
  });

  it("preserves a legitimately-zero referral when the split IS present", () => {
    const routed = new Map<string, V2RoutedSplit>([
      ["0xtx1", { vault: 70, liquidity: 20, operations: 10, referral: 0 }],
    ]);
    const { events, joinIncomplete } = joinV2PurchaseEvents([plog()], routed);
    expect(joinIncomplete).toBe(false);
    expect(events[0].referralAmount).toBe(0);
  });

  it("treats a Purchased with an empty txHash as incomplete (an untrustworthy log)", () => {
    const { events, joinIncomplete } = joinV2PurchaseEvents(
      [plog({ txHash: "" })],
      new Map<string, V2RoutedSplit>([["", SPLIT]]),
    );
    expect(events).toHaveLength(0);
    expect(joinIncomplete).toBe(true);
  });
});
