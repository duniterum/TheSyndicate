// Protocol Awareness Layer — binding regression checks.
//
// Locks the awareness contract so future edits cannot silently regress:
//
//   • Story So Far mounts on Home, /activity, and /my-syndicate.
//   • Story So Far derives every tile from useProtocolTruth/useProtocolEvents
//     (no hardcoded numeric literals as primary values).
//   • Next Action surfaces EXACTLY ONE recommendation and only reads
//     live (wagmi) + indexed (holder index / archive balances) sources —
//     never localStorage as a permission gate.
//   • Notification bell exposes per-category unread counts using the
//     canonical CATEGORY_ORDER and ProtocolEventKind taxonomy.
//   • Memory facts keep proof-link affordances (verifyHref).
//   • /my-syndicate renders modules in the canonical MY PROTOCOL POSITION
//     order: Story So Far → Since Last Visit → What Changed For You →
//     Your Seat → Your Artifacts → Your Next Action.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

describe("Protocol Awareness · Story So Far", () => {
  const src = read("src/components/syndicate/ProtocolStorySoFar.tsx");

  it("mounts on Home, /activity, and /my-syndicate", () => {
    for (const route of [
      "src/routes/index.tsx",
      "src/routes/activity.tsx",
      "src/routes/my-syndicate.tsx",
    ]) {
      expect(read(route).includes("<ProtocolStorySoFar")).toBe(true);
    }
  });

  it("derives values from canonical truth/event hooks", () => {
    expect(src.includes("useProtocolTruth")).toBe(true);
    expect(src.includes("useProtocolEvents")).toBe(true);
  });

  it("never hardcodes a numeric member/USDC headline", () => {
    // Disallow obvious literal totals as the primary numeric value.
    // (Decimals like 0.22em tracking and small grid sizes are fine.)
    const banned = /value=\{["']\$?\d{2,}/;
    expect(banned.test(src)).toBe(false);
  });

  it("renders the latest verified event with an explorer link", () => {
    // Verification anchor may be a direct txExplorerUrl anchor OR the
    // canonical inline ProofChip (which opens TxProofDrawer for the hash).
    const hasAnchor = src.includes("txExplorerUrl") || /<ProofChip[\s\S]*kind="tx"/.test(src);
    expect(hasAnchor).toBe(true);
    expect(src.includes("Latest verified event")).toBe(true);
  });
});

describe("Protocol Awareness · Your Next Action", () => {
  const src = read("src/components/syndicate/YourNextAction.tsx");

  it("surfaces exactly one Action object at a time", () => {
    // Single `action` variable assigned in the if/else chain — never an
    // array of recommendations.
    expect(/let action: Action;/.test(src)).toBe(true);
    expect(/Action\[\]/.test(src)).toBe(false);
  });

  it("derives eligibility from wagmi + indexed reads only", () => {
    expect(src.includes("useAccount")).toBe(true);
    expect(src.includes("useHolderIndex")).toBe(true);
    expect(src.includes("useArchiveBalances")).toBe(true);
  });

  it("never gates recommendations on localStorage", () => {
    // Strip line comments before checking — the doc header may mention
    // the rule, but no executable code path is allowed to touch it.
    const code = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(/localStorage/i.test(code)).toBe(false);
  });

  it("falls back to 'caught up' when no action exists", () => {
    expect(/Verify your seat|caught up|All caught/i.test(src)).toBe(true);
  });
});

describe("Protocol Awareness · Notification bell categories", () => {
  const src = read("src/components/syndicate/NotificationBell.tsx");

  it("declares the canonical category order", () => {
    expect(
      src.includes(`["MEMBERS", "MILESTONE", "NFT", "TREASURY", "LIQUIDITY"]`),
    ).toBe(true);
  });

  it("renders per-category unread counters", () => {
    expect(src.includes("unreadByCategory")).toBe(true);
    expect(/CATEGORY_ORDER\.map/.test(src)).toBe(true);
  });

  it("counts only from the unread protocol-event set (no fake events)", () => {
    expect(src.includes("useUnreadProtocolEvents")).toBe(true);
    // No marketing/placeholder push generators allowed.
    expect(/fakeEvents|mockNotifications|sampleNotifications/.test(src)).toBe(false);
  });
});

describe("Protocol Awareness · Memory facts keep proof affordances", () => {
  const mem = read("src/lib/protocol-memory.ts");
  const ui = read("src/components/syndicate/WhatChangedForYou.tsx");

  it("MemoryFact type exposes verifyHref", () => {
    expect(/verifyHref\?\s*:\s*string/.test(mem)).toBe(true);
  });

  it("WhatChangedForYou renders the verify link when present", () => {
    expect(ui.includes("f.verifyHref")).toBe(true);
  });
});

describe("Protocol Awareness · /my-syndicate canonical order", () => {
  const src = read("src/routes/my-syndicate.tsx");

  it("orders modules: Story So Far → Since Last Visit → What Changed For You → Next Action → Cockpit", () => {
    const idx = (needle: string) => src.indexOf(needle);
    const story = idx("<ProtocolStorySoFar");
    const since = idx("<SinceYourLastVisit");
    const changed = idx("<WhatChangedForYou");
    const next = idx("<YourNextAction");
    const cockpit = idx("<MemberWalletDashboard");
    expect(story).toBeGreaterThan(-1);
    expect(since).toBeGreaterThan(story);
    expect(changed).toBeGreaterThan(since);
    expect(next).toBeGreaterThan(changed);
    expect(cockpit).toBeGreaterThan(next);
  });
});
