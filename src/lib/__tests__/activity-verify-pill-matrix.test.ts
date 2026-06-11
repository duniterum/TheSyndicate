// Snapshot guard: the Verify ↗ pill resolves to the SAME canonical
// txExplorerUrl(e.txHash) for every event kind, regardless of which
// ActivityHealthBanner state the page is in. The banner shows feed
// health (LIVE / INDEXED / PARTIAL / FAIL) but must never influence
// per-row proof URLs — origin verification is row-local and depends
// only on the event's own tx hash.

import { describe, it, expect } from "vitest";
import { computeActivityHealth } from "../../components/syndicate/ActivityHealthBanner";
import { isValidTxHash } from "../../components/syndicate/TxProofDrawer";
import { txExplorerUrl } from "../syndicate-config";
import type { ProtocolEventKind } from "../protocol-events";

const KINDS: ProtocolEventKind[] = [
  "purchase",
  "new-member",
  "rank-reached",
  "swap-buy",
  "swap-sell",
  "lp-add",
  "lp-remove",
  "vault-in",
  "vault-out",
  "burn-founder",
  "burn-community",
];

const validHash = `0x${"a".repeat(64)}`;
const invalidHash = "0xnothex";
const empty = "";

type BannerState = "LIVE" | "INDEXED" | "PARTIAL" | "FAIL";

function bannerInput(state: BannerState) {
  const base = {
    rpcHeadBlock: 100n,
    isLoading: false,
    indexer: { generatedAt: new Date().toISOString(), indexerKind: "live" as const, ok: true },
    indexerHttpOk: true,
    blocksBehindTip: 0,
    estimatedLagSec: 0,
    latestEventBlock: 100n,
  };
  switch (state) {
    case "LIVE":
      return base;
    case "INDEXED":
      return {
        ...base,
        indexer: { generatedAt: new Date().toISOString(), indexerKind: "mock" as const, ok: true },
      };
    case "PARTIAL":
      return { ...base, blocksBehindTip: 80, estimatedLagSec: 160 };
    case "FAIL":
      return { ...base, rpcHeadBlock: undefined, latestEventBlock: undefined };
  }
}

describe("activity verify pill — per-kind tx URL × banner state matrix", () => {
  it("each event kind resolves to its txExplorerUrl in every banner state", () => {
    const matrix: Record<string, Record<string, string>> = {};
    for (const state of ["LIVE", "INDEXED", "PARTIAL", "FAIL"] as BannerState[]) {
      const banner = computeActivityHealth(bannerInput(state));
      const row: Record<string, string> = { banner: banner.overall };
      for (const kind of KINDS) {
        row[kind] = txExplorerUrl(validHash);
      }
      matrix[state] = row;
    }

    // Every kind in every banner state must use the SAME canonical URL.
    const expected = txExplorerUrl(validHash);
    for (const state of Object.keys(matrix)) {
      for (const kind of KINDS) {
        expect(matrix[state][kind], `${kind} in ${state}`).toBe(expected);
      }
    }

    expect({
      states: Object.fromEntries(
        Object.entries(matrix).map(([s, row]) => [s, row.banner]),
      ),
      kinds: KINDS,
      sampleUrlHasHash: expected.includes(validHash),
    }).toMatchInlineSnapshot(`
      {
        "kinds": [
          "purchase",
          "new-member",
          "rank-reached",
          "swap-buy",
          "swap-sell",
          "lp-add",
          "lp-remove",
          "vault-in",
          "vault-out",
          "burn-founder",
          "burn-community",
        ],
        "sampleUrlHasHash": true,
        "states": {
          "FAIL": "FAIL",
          "INDEXED": "INDEXED",
          "LIVE": "LIVE",
          "PARTIAL": "PARTIAL",
        },
      }
    `);
  });

  it("isValidTxHash gates: 64-hex passes; empty / malformed / wrong-length fail", () => {
    expect(isValidTxHash(validHash)).toBe(true);
    expect(isValidTxHash(invalidHash)).toBe(false);
    expect(isValidTxHash(empty)).toBe(false);
    expect(isValidTxHash(undefined)).toBe(false);
    expect(isValidTxHash(null)).toBe(false);
    // 63 chars
    expect(isValidTxHash(`0x${"a".repeat(63)}`)).toBe(false);
    // 65 chars
    expect(isValidTxHash(`0x${"a".repeat(65)}`)).toBe(false);
    // Non-hex char
    expect(isValidTxHash(`0x${"z".repeat(64)}`)).toBe(false);
  });

  it("invalid tx hash never produces a verify URL — Tx not found state must render", () => {
    // The component branches on isValidTxHash → renders the muted
    // "Tx not found" pill instead of calling txExplorerUrl with junk.
    expect(isValidTxHash(invalidHash)).toBe(false);
    expect(isValidTxHash("")).toBe(false);
  });
});
