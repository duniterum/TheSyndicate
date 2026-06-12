import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ACTIVE_INSTITUTIONAL_TX_INDEX,
  INSTITUTIONAL_REGISTER_ROUTE,
  buildActivityInstitutionalIndex,
  institutionalLinkForTx,
} from "../activity-institutional-link";
import { deriveGenesisRegisterEntries } from "../institutional-register-genesis";
import type { InstitutionalRegisterEntry } from "../institutional-register-registry";

const SRC_PATH = resolve(process.cwd(), "src/lib/activity-institutional-link.ts");

/** Minimal stub — the index only reads id, title, entryStatus, sourceTxHash. */
function stub(over: Partial<InstitutionalRegisterEntry>): InstitutionalRegisterEntry {
  return {
    id: "institutional-entry:test",
    title: "Protocol fact recorded",
    entryStatus: "active",
    sourceTxHash: undefined,
    ...over,
  } as unknown as InstitutionalRegisterEntry;
}

describe("activity-institutional-link: route target", () => {
  it("links to the public Institutional Register route", () => {
    expect(INSTITUTIONAL_REGISTER_ROUTE).toBe("/institutional-register");
  });
});

describe("activity-institutional-link: active-only / tx-anchored gate", () => {
  it("indexes only active entries that carry a source tx hash", () => {
    const idx = buildActivityInstitutionalIndex([
      stub({ id: "a", entryStatus: "active", sourceTxHash: "0xAAA" }),
      stub({ id: "d", entryStatus: "draft", sourceTxHash: "0xBBB" }),
      stub({ id: "h", entryStatus: "held", sourceTxHash: "0xCCC" }),
      stub({ id: "r", entryStatus: "rejected", sourceTxHash: "0xDDD" }),
      stub({ id: "n", entryStatus: "active", sourceTxHash: undefined }),
      stub({ id: "e", entryStatus: "active", sourceTxHash: "" }),
    ]);
    expect(idx.size).toBe(1);
    expect(idx.get("0xaaa")?.entryId).toBe("a");
  });

  it("keys on the lowercased tx hash and the first active entry wins", () => {
    const idx = buildActivityInstitutionalIndex([
      stub({ id: "first", entryStatus: "active", sourceTxHash: "0xDEAD" }),
      stub({ id: "second", entryStatus: "active", sourceTxHash: "0xdead" }),
    ]);
    expect(idx.size).toBe(1);
    expect(idx.get("0xdead")?.entryId).toBe("first");
  });

  it("carries metadata only — no amount, rank, or identity fields", () => {
    const idx = buildActivityInstitutionalIndex([
      stub({ id: "x", title: "Protocol seeded liquidity", entryStatus: "active", sourceTxHash: "0x1" }),
    ]);
    const link = idx.get("0x1")!;
    expect(Object.keys(link).sort()).toEqual(["entryId", "title"]);
  });
});

describe("activity-institutional-link: lookup", () => {
  const idx = buildActivityInstitutionalIndex([
    stub({ id: "x", entryStatus: "active", sourceTxHash: "0xAbC123" }),
  ]);

  it("is case-insensitive", () => {
    expect(institutionalLinkForTx(idx, "0xabc123")?.entryId).toBe("x");
    expect(institutionalLinkForTx(idx, "0xABC123")?.entryId).toBe("x");
  });

  it("returns null for unknown / empty / missing input", () => {
    expect(institutionalLinkForTx(idx, "0xnope")).toBeNull();
    expect(institutionalLinkForTx(idx, "")).toBeNull();
    expect(institutionalLinkForTx(idx, null)).toBeNull();
    expect(institutionalLinkForTx(idx, undefined)).toBeNull();
  });
});

describe("activity-institutional-link: default genesis index", () => {
  it("indexes the active tx-anchored genesis facts and excludes held / contract-only ones", () => {
    const ids = new Set(
      [...ACTIVE_INSTITUTIONAL_TX_INDEX.values()].map((v) => v.entryId),
    );
    // Active facts pinned to a transaction → indexed.
    expect(ids.has("institutional-entry:genesis:membership-sale-deployment")).toBe(true);
    expect(ids.has("institutional-entry:genesis:first-liquidity")).toBe(true);
    expect(ids.has("institutional-entry:genesis:proof-of-fire-001")).toBe(true);
    // Active but contract-anchored (no single tx) → excluded.
    expect(ids.has("institutional-entry:genesis:syn-token-deployment")).toBe(false);
    expect(ids.has("institutional-entry:genesis:archive-contract-deployment")).toBe(false);
    // Held coverage-gated ordinals → never indexed.
    expect(ids.has("institutional-entry:genesis:earliest-member")).toBe(false);
    expect(ids.has("institutional-entry:genesis:earliest-artifact")).toBe(false);
  });

  it("matches the active+tx subset of the genesis seed exactly", () => {
    const expected = deriveGenesisRegisterEntries().filter(
      (e) =>
        e.entryStatus === "active" &&
        typeof e.sourceTxHash === "string" &&
        e.sourceTxHash.length > 0,
    );
    expect(ACTIVE_INSTITUTIONAL_TX_INDEX.size).toBe(expected.length);
    for (const e of expected) {
      const link = ACTIVE_INSTITUTIONAL_TX_INDEX.get(e.sourceTxHash!.toLowerCase());
      expect(link?.entryId).toBe(e.id);
      expect(link?.title).toBe(e.title);
    }
  });
});

describe("activity-institutional-link: purity & determinism", () => {
  it("mutates no input array", () => {
    const input = [stub({ id: "x", entryStatus: "active", sourceTxHash: "0x1" })];
    const snapshot = JSON.stringify(input);
    buildActivityInstitutionalIndex(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it("is deterministic across calls", () => {
    const a = buildActivityInstitutionalIndex(deriveGenesisRegisterEntries());
    const b = buildActivityInstitutionalIndex(deriveGenesisRegisterEntries());
    expect([...a.entries()]).toEqual([...b.entries()]);
  });
});

describe("activity-institutional-link: adjacency & purity (source scan)", () => {
  const src = readFileSync(SRC_PATH, "utf8");
  const importLines = src.split("\n").filter((l) => /^\s*import\b/.test(l)).join("\n");

  it("imports only the register registry + genesis seed (downstream consumer)", () => {
    const lines = src.split("\n").filter((l) => /^\s*import\b/.test(l));
    const allowed = /institutional-register-registry|institutional-register-genesis/;
    for (const line of lines) {
      expect(allowed.test(line), `unexpected import: ${line}`).toBe(true);
    }
  });

  it("never imports an upstream pipeline layer, React, or a chain client", () => {
    const forbidden =
      /protocol-events|signal|memory-candidate|chronicle|wagmi|viem|\breact\b/i;
    expect(forbidden.test(importLines)).toBe(false);
  });
});
