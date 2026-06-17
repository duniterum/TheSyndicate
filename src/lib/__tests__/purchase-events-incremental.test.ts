/**
 * Performance Block P4a — incremental indexing for the canonical TokensPurchased
 * scan.
 *
 * The scan now resumes from a persisted cursor (lastScannedBlock) instead of
 * replaying deploymentBlock→head on every refetch. These tests pin the pure
 * algorithm (merge/dedupe + scan-start arithmetic) and the source invariants
 * (resume-from-cursor, complete-scan-only persistence), with NO change to event
 * parsing, ordering, displayed values, or the canonical queryKey.
 *
 * Renderer-free, matching this repo's convention:
 *   1. Pure-function semantics of mergePurchaseEvents / computeIncrementalScanStart.
 *   2. Source-scan invariants on useLivePurchaseEvents's queryFn.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  REORG_OVERLAP,
  purchaseEventKey,
  mergePurchaseEvents,
  computeIncrementalScanStart,
  type PurchaseEvent,
} from "../activity-hooks";

const ROOT = join(__dirname, "..", "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

// Distinct txHash per (block, logIndex) so dedupe keys are unique unless we
// deliberately re-emit the same event (the reorg-overlap case).
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
    txHash: `0xtx-${block}-${logIndex}`,
    logIndex,
  };
}

describe("P4a · mergePurchaseEvents (dedupe + newest-first)", () => {
  it("with no cache returns the fresh list sorted newest-first (== a full scan)", () => {
    const fresh = [ev(100, 0), ev(500, 0), ev(300, 0), ev(400, 1)];
    const out = mergePurchaseEvents([], fresh);
    expect(out.map((e) => e.blockNumber)).toEqual([500n, 400n, 300n, 100n]);
  });

  it("dedupes the re-scanned overlap by txHash:logIndex (no duplicates)", () => {
    const overlap = ev(300, 0); // present in BOTH cache and the re-scanned window
    const cached = [ev(500, 0), ev(400, 0), overlap];
    const fresh = [overlap, ev(600, 0)]; // overlap re-emitted + one genuinely new
    const out = mergePurchaseEvents(cached, fresh);
    expect(out).toHaveLength(4);
    expect(out.map((e) => e.blockNumber)).toEqual([600n, 500n, 400n, 300n]);
    expect(new Set(out.map(purchaseEventKey)).size).toBe(out.length);
  });

  it("tie-breaks equal blocks by logIndex descending", () => {
    const out = mergePurchaseEvents([], [ev(400, 0), ev(400, 2), ev(400, 1)]);
    expect(out.map((e) => e.logIndex)).toEqual([2, 1, 0]);
  });

  it("prefers the freshly scanned copy on key collision", () => {
    const stale = ev(300, 0);
    const refreshed: PurchaseEvent = { ...ev(300, 0), buyer: "0xUPDATED" };
    const out = mergePurchaseEvents([stale], [refreshed]);
    expect(out).toHaveLength(1);
    expect(out[0].buyer).toBe("0xUPDATED");
  });

  it("does not mutate its inputs", () => {
    const prev = [ev(500, 0)];
    const next = [ev(600, 0)];
    const prevCopy = [...prev];
    const nextCopy = [...next];
    mergePurchaseEvents(prev, next);
    expect(prev).toEqual(prevCopy);
    expect(next).toEqual(nextCopy);
  });
});

describe("P4a · computeIncrementalScanStart", () => {
  const fromBlock = 1_000n;
  const overlap = REORG_OVERLAP;

  it("full scan from deployment when there is no prior cursor", () => {
    expect(
      computeIncrementalScanStart({ fromBlock, tip: 5_000n, lastScannedBlock: undefined, overlap }),
    ).toBe(fromBlock);
  });

  it("resumes overlap-blocks below the last scanned block", () => {
    expect(
      computeIncrementalScanStart({ fromBlock, tip: 5_000n, lastScannedBlock: 4_900n, overlap }),
    ).toBe(4_900n - overlap); // 4850 → re-validates 50 blocks, then scans new tip range
  });

  it("never starts below the deployment block", () => {
    // 1010 - 50 = 960 < fromBlock → clamp up to fromBlock
    expect(
      computeIncrementalScanStart({ fromBlock, tip: 1_010n, lastScannedBlock: 1_010n, overlap }),
    ).toBe(fromBlock);
  });

  it("anchors to the tip and never scans past head when the RPC head lags", () => {
    const start = computeIncrementalScanStart({
      fromBlock,
      tip: 4_000n,
      lastScannedBlock: 5_000n,
      overlap,
    });
    expect(start).toBe(4_000n - overlap); // anchored to tip, not the stale cursor
    expect(start <= 4_000n).toBe(true);
  });

  it("clamps to the tip when the deployment block is ahead of head", () => {
    expect(
      computeIncrementalScanStart({ fromBlock: 9_000n, tip: 5_000n, lastScannedBlock: undefined, overlap }),
    ).toBe(5_000n);
  });

  it("overlap is a small, positive window", () => {
    expect(REORG_OVERLAP).toBe(50n);
    expect(REORG_OVERLAP > 0n).toBe(true);
  });
});

describe("P4a · source invariants on useLivePurchaseEvents", () => {
  const src = read("src/lib/activity-hooks.ts");

  it("loads the cached cursor and resumes instead of always scanning from fromBlock", () => {
    expect(src).toMatch(/loadPurchaseEventsSnapshot\(/);
    expect(src).toMatch(/computeIncrementalScanStart\(/);
    expect(src).toMatch(/lastScannedBlock:\s*cached\?\.lastScannedBlock/);
    // Anti-regression: the old unconditional full-range start must be gone.
    expect(src).not.toMatch(/const from = fromBlock > tip \? tip : fromBlock;/);
  });

  it("persists only a complete scan (no failed chunk) and merges with the cache", () => {
    expect(src).toMatch(/anyChunkFailed/);
    expect(src).toMatch(/if \(!anyChunkFailed && merged\.length > 0\)/);
    expect(src).toMatch(/mergePurchaseEvents\(cached\?\.events \?\? \[\], fresh\)/);
  });

  it("V2b is dormant until live: the queryFn returns the V1+V2a list unchanged when V2b is null", () => {
    expect(src).toMatch(/if \(!saleV2 \|\| SALE_V2_DEPLOYMENT_BLOCK === null\) return merged/);
  });

  it("always unions the sealed V2a history so member identity survives the V2a→V2b cutover", () => {
    expect(src).toMatch(/saleV2a/);
    expect(src).toMatch(/fromBlock:\s*SALE_V2A_DEPLOYMENT_BLOCK/);
  });

  it("the V2 money-split join fails closed: joinIncomplete gates persistence, no zero-fill", () => {
    expect(src).toMatch(/joinV2PurchaseEvents\(purchased, routedByTx\)/);
    expect(src).toMatch(/routedFailed \|\| purchasedFailed \|\| joinIncomplete/);
    // Anti-regression: the old zero-fill of an absent Routed split must be gone.
    expect(src).not.toMatch(/split\?\.vault \?\? 0/);
  });

  it("keeps the canonical queryKey (one scan per chain/sale + V2a/V2b addrs, not per limit)", () => {
    expect(src).toMatch(
      /queryKey:\s*\["live-purchases",\s*String\(fromBlock\),\s*SALE,\s*saleV2a\s*\?\?\s*"no-v2a",\s*saleV2\s*\?\?\s*"v2-pending"\]/,
    );
    // Anti-regression: limit must never enter the canonical key.
    expect(src).not.toMatch(/\["live-purchases",\s*String\(fromBlock\),\s*limit/);
  });
});
