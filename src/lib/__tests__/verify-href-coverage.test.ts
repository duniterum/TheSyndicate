// VerifyHref coverage guard.
//
// Binding rule: every MemoryFact and every notification row MUST carry a
// verifyHref / deep proof link whenever a canonical proof source is
// available. This test fails if the derivation utilities OR the rendering
// components drop a proof link a user could reasonably expect.
//
// Canonical proof availability:
//   • Seat fact            → record.firstPurchaseTx → tx explorer URL
//   • Rank / contribution  → wallet address explorer URL
//   • First Signal / Patron Seal balances > 0 → Archive contract URL
//   • Notification rows that carry a valid tx hash → tx explorer URL
//
// If any of these rows render without their canonical href, this test
// fails so the regression is caught before it reaches users.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { derivePersonalMemory } from "../protocol-memory";

const ROOT = join(__dirname, "..", "..");

const BASE_INPUT = {
  events: [],
  pulse: { buyers: 0, usdcRaised: 0 },
  mintFlags: { firstSignal: false, patronSeal: false },
  archiveBalances: {},
};

describe("verifyHref coverage · MemoryFact derivation", () => {
  it("seat fact carries verifyHref when firstPurchaseTx is known", () => {
    const m = derivePersonalMemory({
      ...BASE_INPUT,
      record: {
        memberNumber: 12,
        wallet: "0x1111111111111111111111111111111111111111",
        firstPurchaseTx: "0xabc1234567890abc1234567890abc1234567890abc1234567890abc12345678",
        cumulativeUsdc: 0,
      } as any,
    });
    const seat = m.facts.find((f) => f.id === "seat");
    expect(seat).toBeDefined();
    expect(seat!.verifyHref, "seat fact MUST have verifyHref when firstPurchaseTx is known")
      .toBeTruthy();
    expect(seat!.verifyHref).toMatch(/^https?:\/\//);
  });

  it("rank / contribution facts carry a wallet verifyHref when wallet is known", () => {
    const m = derivePersonalMemory({
      ...BASE_INPUT,
      record: {
        memberNumber: 9,
        wallet: "0x2222222222222222222222222222222222222222",
        firstPurchaseTx: "0xabc1234567890abc1234567890abc1234567890abc1234567890abc12345678",
        currentRank: { name: "Citizen" } as any,
        cumulativeUsdc: 100,
      } as any,
    });
    const rank = m.facts.find((f) => f.id === "rank");
    // The wallet-contribution fact is emitted with id "usdc-paid"
    // ("USDC routed by your wallet"); it carries the wallet-explorer verifyHref.
    const contrib = m.facts.find((f) => f.id === "usdc-paid");
    expect(rank?.verifyHref, "rank fact MUST link to wallet explorer").toBeTruthy();
    expect(contrib?.verifyHref, "contribution (usdc-paid) fact MUST link to wallet explorer").toBeTruthy();
  });

  it("NFT facts (First Signal / Patron Seal) carry an Archive contract verifyHref", () => {
    const m = derivePersonalMemory({
      ...BASE_INPUT,
      record: { memberNumber: 1, wallet: "0x3", firstPurchaseTx: "0x0", cumulativeUsdc: 0 } as any,
      archiveBalances: { firstSignal: 1n, patronSeal: 2n },
    });
    const fs = m.facts.find((f) => f.id === "first-signal");
    const ps = m.facts.find((f) => f.id === "patron-seal");
    expect(fs?.verifyHref, "First Signal fact MUST link to Archive contract").toBeTruthy();
    expect(ps?.verifyHref, "Patron Seal fact MUST link to Archive contract").toBeTruthy();
  });
});

describe("verifyHref coverage · NotificationBell rendering", () => {
  const bell = readFileSync(
    join(ROOT, "components/syndicate/NotificationBell.tsx"),
    "utf8",
  );

  it("uses isValidTxHash + txExplorerUrl so every valid-tx row gets a proof link", () => {
    expect(bell).toMatch(/isValidTxHash/);
    expect(bell).toMatch(/txExplorerUrl/);
  });

  it("never renders a notification row that drops the txHash silently", () => {
    // Crude regex guard — if a future refactor reads e.txHash but stops
    // wiring it into an <a> / href, this guard fires.
    const hasTxHashAccess = /\.txHash\b/.test(bell);
    const hasHrefBinding = /href=\{[^}]*\}/.test(bell) && /txExplorerUrl\(e\.txHash\)/.test(bell);
    if (hasTxHashAccess) {
      expect(hasHrefBinding, "NotificationBell reads txHash → must bind it into an href").toBe(true);
    }
  });
});

describe("verifyHref coverage · WhatChangedForYou rendering", () => {
  const src = readFileSync(
    join(ROOT, "components/syndicate/WhatChangedForYou.tsx"),
    "utf8",
  );

  it("renders f.verifyHref into an anchor whenever present", () => {
    // Pattern: `f.verifyHref && ( <a href={f.verifyHref}` (whitespace-tolerant).
    expect(src).toMatch(/f\.verifyHref/);
    expect(src).toMatch(/href=\{f\.verifyHref\}/);
  });
});

describe("verifyHref coverage · MilestoneApproaching + ActivityHeartbeat", () => {
  it("MilestoneApproachingTile wires verifyHref into a proof affordance", () => {
    const src = readFileSync(
      join(ROOT, "components/syndicate/MilestoneApproachingTile.tsx"),
      "utf8",
    );
    expect(src).toMatch(/verifyHref/);
    // Either a raw anchor or the reusable inline ProofChip is acceptable —
    // both render a working verification link for the same href.
    expect(src).toMatch(/href=\{verifyHref\}|<ProofChip[\s\S]*verifyHref/);
  });

  it("ActivityHeartbeat exposes a proof affordance whenever txHash is valid", () => {
    const src = readFileSync(
      join(ROOT, "components/syndicate/ActivityHeartbeat.tsx"),
      "utf8",
    );
    expect(src).toMatch(/isValidTxHash/);
    // Must surface a verifiable anchor — raw anchor OR ProofChip(kind="tx").
    expect(src).toMatch(/href=\{proofHref\}|<ProofChip[\s\S]*kind="tx"/);
  });
});
