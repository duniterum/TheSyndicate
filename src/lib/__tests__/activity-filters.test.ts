// Pure-function tests for the /activity filter + summary helpers.
// Renderer-free — exercises the same logic the UI binds to.

import { describe, it, expect } from "vitest";
import {
  ACTIVITY_FILTER_GROUPS,
  applyActivityFilter,
  getActivityFilterGroup,
  summarizeActivity,
} from "../activity-filters";
import type { ProtocolEvent, ProtocolEventKind } from "../protocol-events";

function ev(kind: ProtocolEventKind, n: number, amount = 0): ProtocolEvent {
  return {
    id: `${kind}-${n}`,
    kind,
    title: `${kind} ${n}`,
    detail: "",
    amountUsd: amount,
    blockNumber: BigInt(1000 + n),
    logIndex: n,
    txHash: `0x${"a".repeat(63)}${n}`,
    actor: "0x0000000000000000000000000000000000000001",
    badge: "live",
  };
}

const sample: ProtocolEvent[] = [
  ev("purchase", 1, 250),
  ev("new-member", 2, 0),
  ev("rank-reached", 3, 0),
  ev("swap-buy", 4, 100),
  ev("swap-sell", 5, 50),
  ev("lp-add", 6, 200),
  ev("lp-remove", 7, 75),
  ev("vault-in", 8, 500),
  ev("vault-out", 9, 120),
];

describe("activity-filters", () => {
  it("exposes the canonical chip group list including NFT mints", () => {
    expect(ACTIVITY_FILTER_GROUPS.map((g) => g.key)).toEqual([
      "all",
      "membership",
      "archive",
      "nft",
      "liquidity",
      "vault",
      "burn",
    ]);
  });

  it("getActivityFilterGroup falls back to 'all' for unknown keys", () => {
    // @ts-expect-error — intentionally invalid key
    expect(getActivityFilterGroup("nope").key).toBe("all");
  });

  it("'all' returns every event", () => {
    expect(applyActivityFilter(sample, "all")).toHaveLength(sample.length);
  });

  it("'membership' keeps purchase + new-member + rank-reached", () => {
    const r = applyActivityFilter(sample, "membership");
    expect(r.map((e) => e.kind).sort()).toEqual(
      ["new-member", "purchase", "rank-reached"].sort(),
    );
  });

  it("'archive' keeps new-member only", () => {
    const r = applyActivityFilter(sample, "archive");
    expect(r.every((e) => e.kind === "new-member")).toBe(true);
    expect(r).toHaveLength(1);
  });

  it("'liquidity' keeps swaps + lp add/remove", () => {
    const r = applyActivityFilter(sample, "liquidity");
    expect(r.map((e) => e.kind).sort()).toEqual(
      ["lp-add", "lp-remove", "swap-buy", "swap-sell"].sort(),
    );
  });

  it("'vault' keeps vault-in + vault-out", () => {
    const r = applyActivityFilter(sample, "vault");
    expect(r.map((e) => e.kind).sort()).toEqual(["vault-in", "vault-out"].sort());
  });

  it("'nft' keeps Archive1155 mints across First Signal, Patron Seal, and future artifacts", () => {
    const withMints: ProtocolEvent[] = [
      ...sample,
      ev("nft-mint-first-signal", 10),
      ev("nft-mint-patron-seal", 11),
      ev("nft-mint-other", 12),
    ];
    const r = applyActivityFilter(withMints, "nft");
    expect(r.map((e) => e.kind).sort()).toEqual(
      ["nft-mint-first-signal", "nft-mint-other", "nft-mint-patron-seal"].sort(),
    );
  });

  it("'archive' includes NFT mints alongside new-member entries", () => {
    const withMint = [...sample, ev("nft-mint-patron-seal", 13)];
    const r = applyActivityFilter(withMint, "archive");
    expect(r.some((e) => e.kind === "nft-mint-patron-seal")).toBe(true);
    expect(r.some((e) => e.kind === "new-member")).toBe(true);
  });
});

describe("summarizeActivity", () => {
  it("counts each bucket and sums USD across all events", () => {
    const s = summarizeActivity(sample);
    expect(s.total).toBe(9);
    expect(s.membership).toBe(2); // purchase + rank-reached
    expect(s.archive).toBe(1);
    expect(s.liquidity).toBe(4);
    expect(s.vault).toBe(2);
    expect(s.usdcSettledTotal).toBe(250 + 100 + 50 + 200 + 75 + 500 + 120);
    expect(s.lastEventTxHash).toBe(sample[0].txHash);
    expect(s.lastEventBlock).toBe(sample[0].blockNumber);
  });

  it("returns zeros + undefined anchor for empty input", () => {
    const s = summarizeActivity([]);
    expect(s).toMatchObject({
      total: 0,
      membership: 0,
      archive: 0,
      nft: 0,
      liquidity: 0,
      vault: 0,
      usdcSettledTotal: 0,
      lastEventBlock: undefined,
      lastEventTxHash: undefined,
    });
  });

  it("snapshot — chip counts for the sample matrix", () => {
    expect({
      all: applyActivityFilter(sample, "all").length,
      membership: applyActivityFilter(sample, "membership").length,
      archive: applyActivityFilter(sample, "archive").length,
      nft: applyActivityFilter(sample, "nft").length,
      liquidity: applyActivityFilter(sample, "liquidity").length,
      vault: applyActivityFilter(sample, "vault").length,
    }).toMatchInlineSnapshot(`
      {
        "all": 9,
        "archive": 1,
        "liquidity": 4,
        "membership": 3,
        "nft": 0,
        "vault": 2,
      }
    `);
  });
});
