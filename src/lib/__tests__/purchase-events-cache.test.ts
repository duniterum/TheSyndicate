/**
 * Performance Block P1 — purchase-events persistent snapshot.
 *
 * The canonical purchase list is persisted to localStorage so a cold reload
 * hydrates the holder index instantly. These tests pin the safety contract:
 *   • the cache key carries chain / sale / deployment-block / version identity
 *   • round-tripping preserves bigint fields AND ordering (no parsing/ordering
 *     change) so limit semantics are identical before vs after persistence
 *   • corrupt / version-mismatched / malformed cache falls back safely
 *   • storage access is SSR- and quota-safe
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  PURCHASE_EVENTS_CACHE_VERSION,
  purchaseEventsCacheKey,
  serializePurchaseEvents,
  deserializePurchaseEvents,
  loadPurchaseEventsSnapshot,
  savePurchaseEventsSnapshot,
} from "../purchase-events-cache";
import { applyPurchaseLimit, type PurchaseEvent } from "../activity-hooks";

function ev(block: number, logIndex: number): PurchaseEvent {
  return {
    source: "v1",
    buyer: `0x${"0".repeat(39)}${logIndex % 10}`,
    purchaseId: BigInt(block * 100 + logIndex),
    usdcAmount: 100,
    synAmount: 1000,
    vaultAmount: 0,
    liquidityAmount: 0,
    operationsAmount: 0,
    blockNumber: BigInt(block),
    txHash: `0x${"a".repeat(64)}`,
    logIndex,
  };
}

function v3Ev(block: number, logIndex: number): PurchaseEvent {
  return {
    ...ev(block, logIndex),
    source: "v3",
    era: 1,
    firstSeat: true,
    referralAmount: 0,
  };
}

// Newest-first, exactly as the scan produces it before slicing.
const NEWEST_FIRST: PurchaseEvent[] = [ev(500, 0), ev(400, 1), ev(300, 0), ev(200, 0), ev(100, 0)];

function makeStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? (m.get(k) as string) : null),
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: (i: number) => [...m.keys()][i] ?? null,
    get length() {
      return m.size;
    },
  } as Storage;
}

describe("P1 · purchaseEventsCacheKey identity", () => {
  it("includes version, chainId, sale (lowercased) and deployment block", () => {
    const key = purchaseEventsCacheKey({
      chainId: 43114,
      sale: "0x0020Df30C127306f0F5B44E6a6E4368D2855842d",
      fromBlock: 87_157_852n,
    });
    expect(key).toContain(PURCHASE_EVENTS_CACHE_VERSION);
    expect(key).toContain("chain-43114");
    expect(key).toContain("0x0020df30c127306f0f5b44e6a6e4368d2855842d");
    expect(key).toContain("87157852");
  });

  it("differs across chain, sale, and fromBlock", () => {
    const base = { chainId: 43114, sale: "0xabc", fromBlock: 1n };
    const k = purchaseEventsCacheKey(base);
    expect(purchaseEventsCacheKey({ ...base, chainId: 1 })).not.toBe(k);
    expect(purchaseEventsCacheKey({ ...base, sale: "0xdef" })).not.toBe(k);
    expect(purchaseEventsCacheKey({ ...base, fromBlock: 2n })).not.toBe(k);
  });
});

describe("P1 · serialize/deserialize preserves data, bigints and order", () => {
  it("round-trips identically (bigints + lastScannedBlock intact, order unchanged)", () => {
    const snap = deserializePurchaseEvents(serializePurchaseEvents(NEWEST_FIRST, 123, 87_200_000n));
    expect(snap).toBeDefined();
    expect(snap!.updatedAt).toBe(123);
    expect(snap!.lastScannedBlock).toBe(87_200_000n);
    expect(snap!.events).toEqual(NEWEST_FIRST);
    expect(snap!.events.map((e) => e.blockNumber)).toEqual([500n, 400n, 300n, 200n, 100n]);
  });

  it("does not change limit semantics after persistence", () => {
    const snap = deserializePurchaseEvents(serializePurchaseEvents(NEWEST_FIRST, 1, 1n))!;
    for (const n of [0, 1, 2, 5000]) {
      expect(applyPurchaseLimit(snap.events, n)).toEqual(applyPurchaseLimit(NEWEST_FIRST, n));
    }
  });

  it("preserves V3 purchase source and V3 receipt fields after cache restore", () => {
    const events: PurchaseEvent[] = [v3Ev(700, 2), ev(500, 0)];
    const snap = deserializePurchaseEvents(serializePurchaseEvents(events, 123, 87_800_000n));
    expect(snap).toBeDefined();
    expect(snap!.events[0]).toMatchObject({
      source: "v3",
      era: 1,
      firstSeat: true,
      referralAmount: 0,
    });
    expect(snap!.events[0].blockNumber).toBe(700n);
    expect(snap!.events[1].source).toBe("v1");
  });
});

describe("P1 · corrupt / mismatched cache falls back safely", () => {
  it("returns undefined for missing/empty input", () => {
    expect(deserializePurchaseEvents(null)).toBeUndefined();
    expect(deserializePurchaseEvents(undefined)).toBeUndefined();
    expect(deserializePurchaseEvents("")).toBeUndefined();
  });

  it("returns undefined for non-JSON garbage (never throws)", () => {
    expect(deserializePurchaseEvents("{not json")).toBeUndefined();
    expect(deserializePurchaseEvents("[1,2,3")).toBeUndefined();
  });

  it("rejects a version mismatch", () => {
    const stale = JSON.stringify({ v: "v0", updatedAt: 1, events: [] });
    expect(deserializePurchaseEvents(stale)).toBeUndefined();
  });

  it("rejects a snapshot with any malformed event", () => {
    const good = JSON.parse(serializePurchaseEvents(NEWEST_FIRST, 1, 1n));
    good.events[2] = { ...good.events[2], blockNumber: "not-a-bigint" };
    expect(deserializePurchaseEvents(JSON.stringify(good))).toBeUndefined();

    const missingField = JSON.parse(serializePurchaseEvents(NEWEST_FIRST, 1, 1n));
    delete missingField.events[0].usdcAmount;
    expect(deserializePurchaseEvents(JSON.stringify(missingField))).toBeUndefined();
  });

  it("rejects a v2 snapshot missing or with a non-numeric lastScannedBlock", () => {
    const missing = JSON.parse(serializePurchaseEvents(NEWEST_FIRST, 1, 1n));
    delete missing.lastScannedBlock;
    expect(deserializePurchaseEvents(JSON.stringify(missing))).toBeUndefined();

    const bad = JSON.parse(serializePurchaseEvents(NEWEST_FIRST, 1, 1n));
    bad.lastScannedBlock = "not-a-bigint";
    expect(deserializePurchaseEvents(JSON.stringify(bad))).toBeUndefined();
  });

  it("rejects unknown future source labels instead of relabeling them as V1", () => {
    const unknownSource = JSON.parse(serializePurchaseEvents([v3Ev(700, 2)], 1, 1n));
    unknownSource.events[0].source = "v4";
    expect(deserializePurchaseEvents(JSON.stringify(unknownSource))).toBeUndefined();
  });
});

describe("P1 · storage is SSR- and quota-safe", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("no-ops with no window (SSR): load undefined, save does not throw", () => {
    // Default vitest env is node — `window` is undefined here.
    expect(typeof window).toBe("undefined");
    expect(loadPurchaseEventsSnapshot("any-key")).toBeUndefined();
    expect(() => savePurchaseEventsSnapshot("any-key", NEWEST_FIRST, 1n)).not.toThrow();
  });

  it("save then load round-trips events AND the cursor through localStorage", () => {
    vi.stubGlobal("window", { localStorage: makeStorage() });
    const key = purchaseEventsCacheKey({ chainId: 43114, sale: "0xabc", fromBlock: 1n });
    savePurchaseEventsSnapshot(key, NEWEST_FIRST, 87_200_000n);
    const snap = loadPurchaseEventsSnapshot(key);
    expect(snap?.events).toEqual(NEWEST_FIRST);
    expect(snap?.lastScannedBlock).toBe(87_200_000n);
  });

  it("swallows a quota error on save", () => {
    const throwing = makeStorage();
    throwing.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    vi.stubGlobal("window", { localStorage: throwing });
    expect(() => savePurchaseEventsSnapshot("k", NEWEST_FIRST, 1n)).not.toThrow();
  });
});
