/**
 * Performance Block P4f — incremental Archive1155 mint indexing.
 *
 * Pure unit coverage for the archive-mints cache helper that backs the
 * cursor/overlap incremental scan. No DOM, no RPC: every function under test is
 * pure, so this stays cheap while pinning the truth-preservation invariants —
 * bigint round-trip, dedupe-by-txHash:logIndex, newest-first ordering identical
 * to the scanner's inline comparator, sliding-window cache-key identity, and
 * silent rejection of corrupt / version-mismatched snapshots.
 */

import { describe, it, expect } from "vitest";
import {
  ARCHIVE_MINTS_CACHE_VERSION,
  archiveMintsCacheKey,
  scannedMintKey,
  mergeArchiveMints,
  serializeArchiveMints,
  deserializeArchiveMints,
  type ScannedMint,
} from "../archive-mints-cache";

type Mint = ScannedMint & { to: string; tokenId: number; value: number };

const mint = (block: bigint, logIndex: number, over: Partial<Mint> = {}): Mint => ({
  blockNumber: block,
  txHash: over.txHash ?? `0xtx${block}-${logIndex}`,
  logIndex,
  to: over.to ?? "0xcollector",
  tokenId: over.tokenId ?? 1,
  value: over.value ?? 1,
});

describe("P4f · archive-mints cache", () => {
  it("dedupe identity is txHash:logIndex", () => {
    expect(scannedMintKey(mint(10n, 2))).toBe("0xtx10-2:2");
  });

  it("cache key includes chainId, archive address, lookback span, sorted ids, and version", () => {
    const key = archiveMintsCacheKey({
      chainId: 43114,
      archive: "0xABCDef0000000000000000000000000000000001",
      lookback: 200_000n,
      ids: [3, 1, 2],
    });
    expect(key).toContain(`:${ARCHIVE_MINTS_CACHE_VERSION}:`);
    expect(key).toContain("chain-43114");
    expect(key).toContain("0xabcdef0000000000000000000000000000000001"); // lower-cased
    expect(key).toContain("lookback-200000");
    expect(key).toContain("ids-1-2-3"); // sorted, stable across orderings
  });

  it("collapses the id-filter to 'all' when no ids are given", () => {
    const key = archiveMintsCacheKey({ chainId: 1, archive: "0xArchive", lookback: 5n });
    expect(key).toContain("ids-all");
  });

  it("merge dedupes by txHash:logIndex and returns newest-first (block desc, logIndex desc)", () => {
    const cached = [mint(100n, 0), mint(90n, 1)];
    const fresh = [
      mint(100n, 0, { to: "0xfresh" }), // same key as cached[0] → fresh wins
      mint(110n, 5),
      mint(110n, 2),
    ];
    const merged = mergeArchiveMints(cached, fresh);
    expect(merged.map((e) => [Number(e.blockNumber), e.logIndex])).toEqual([
      [110, 5],
      [110, 2],
      [100, 0],
      [90, 1],
    ]);
    // freshly scanned copy preferred on collision
    expect(merged.find((e) => e.blockNumber === 100n)?.to).toBe("0xfresh");
  });

  it("serialize → deserialize round-trips bigint blockNumber and passthrough fields", () => {
    const events = [mint(123_456n, 3, { to: "0xabc", tokenId: 7, value: 2 })];
    const snap = deserializeArchiveMints<Mint>(serializeArchiveMints(events, 1_700_000_000_000, 999n));
    expect(snap).toBeDefined();
    expect(snap!.lastScannedBlock).toBe(999n);
    expect(snap!.events[0].blockNumber).toBe(123_456n);
    expect(typeof snap!.events[0].blockNumber).toBe("bigint");
    expect(snap!.events[0]).toMatchObject({ to: "0xabc", tokenId: 7, value: 2, logIndex: 3 });
  });

  it("rejects corrupt, version-mismatched, and structurally-broken snapshots", () => {
    expect(deserializeArchiveMints("not json")).toBeUndefined();
    expect(deserializeArchiveMints(undefined)).toBeUndefined();
    expect(
      deserializeArchiveMints(
        JSON.stringify({ v: "v0", updatedAt: 1, lastScannedBlock: "1", events: [] }),
      ),
    ).toBeUndefined();
    // one broken event rejects the whole snapshot (no partial decode)
    const broken = JSON.stringify({
      v: ARCHIVE_MINTS_CACHE_VERSION,
      updatedAt: 1,
      lastScannedBlock: "10",
      events: [{ txHash: "0x1", blockNumber: "5", logIndex: 0 }, { txHash: "0x2", logIndex: 1 }],
    });
    expect(deserializeArchiveMints(broken)).toBeUndefined();
  });

  it("accepts an empty complete snapshot (cursor with no events)", () => {
    const snap = deserializeArchiveMints(serializeArchiveMints([], 1, 42n));
    expect(snap).toBeDefined();
    expect(snap!.events).toEqual([]);
    expect(snap!.lastScannedBlock).toBe(42n);
  });
});
