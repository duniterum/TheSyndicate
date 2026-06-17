/**
 * Performance Block P0 — canonical purchase-events query.
 *
 * Invariant under guard: there is exactly ONE expensive historical scan per
 * (fromBlock, sale contract), shared by every caller regardless of the `limit`
 * they request. `limit` must only narrow the result slice client-side (in
 * TanStack Query's `select`), never fork a second full-range getLogs walk.
 *
 * Two layers, matching this repo's renderer-free test convention:
 *   1. Pure-function semantics of applyPurchaseLimit (slice happens AFTER fetch).
 *   2. Source-scan invariants on useLivePurchaseEvents:
 *        - the queryKey does NOT include `limit`
 *        - the queryFn returns the full list (no slice inside the fetch)
 *        - the limit is applied in `select` via applyPurchaseLimit
 *
 * Does NOT touch contracts, ABI, addresses, event parsing, or displayed data.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applyPurchaseLimit, type PurchaseEvent } from "../activity-hooks";

const ROOT = join(__dirname, "..", "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

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

// Newest-first ordering, exactly as the hook produces it before slicing.
const NEWEST_FIRST: PurchaseEvent[] = [
  ev(500, 0),
  ev(400, 1),
  ev(300, 0),
  ev(200, 0),
  ev(100, 0),
];

describe("P0 · applyPurchaseLimit (slice happens after the fetch)", () => {
  it("limit > 0 returns the newest N, order preserved", () => {
    const out = applyPurchaseLimit(NEWEST_FIRST, 2);
    expect(out).toHaveLength(2);
    expect(out.map((e) => e.blockNumber)).toEqual([500n, 400n]);
  });

  it("limit === 0 returns the entire list (current 'all' semantics)", () => {
    const out = applyPurchaseLimit(NEWEST_FIRST, 0);
    expect(out.map((e) => e.blockNumber)).toEqual([500n, 400n, 300n, 200n, 100n]);
  });

  it("limit larger than the list returns everything (no padding/throw)", () => {
    expect(applyPurchaseLimit(NEWEST_FIRST, 5000)).toHaveLength(NEWEST_FIRST.length);
  });

  it("does not mutate the source list", () => {
    const before = [...NEWEST_FIRST];
    applyPurchaseLimit(NEWEST_FIRST, 2);
    expect(NEWEST_FIRST).toEqual(before);
  });

  it("different limits derive from the SAME source array (one cache path)", () => {
    // Proves slicing is a pure view over one canonical list: every limit is a
    // prefix of the full result, so all callers can share one cached scan.
    const full = applyPurchaseLimit(NEWEST_FIRST, 0);
    for (const n of [1, 25, 30, 100, 1000, 5000]) {
      expect(applyPurchaseLimit(NEWEST_FIRST, n)).toEqual(full.slice(0, n));
    }
  });
});

describe("P0 · canonical query key (one scan per chain/sale, not per limit)", () => {
  const src = read("src/lib/activity-hooks.ts");

  it("the live-purchases queryKey does NOT include limit (carries the V2a + V2b addresses)", () => {
    expect(src).toMatch(
      /queryKey:\s*\["live-purchases",\s*String\(fromBlock\),\s*SALE,\s*saleV2a\s*\?\?\s*"no-v2a",\s*saleV2\s*\?\?\s*"v2-pending"\]/,
    );
    // Anti-regression: the old per-limit key must be gone.
    expect(src).not.toMatch(/\["live-purchases",\s*String\(fromBlock\),\s*limit/);
  });

  it("the expensive queryFn returns the full list (no slice inside the fetch)", () => {
    expect(src).not.toMatch(/return\s+limit\s*>\s*0\s*\?\s*results\.slice/);
  });

  it("limit is applied client-side via a stable select → applyPurchaseLimit", () => {
    // select is the transform; applyPurchaseLimit narrows the canonical list.
    expect(src).toMatch(/applyPurchaseLimit\(events,\s*limit\)/);
    // Memoized on [limit] so the reference is stable (preserves v5 select memo
    // and keeps data referentially stable for useHolderIndex consumers).
    expect(src).toMatch(/useCallback\([\s\S]*?\[limit\]/);
    // And it is passed to useQuery as the select option.
    expect(src).toMatch(/^\s*select,\s*$/m);
  });
});
