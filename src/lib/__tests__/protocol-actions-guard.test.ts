/**
 * Protocol-actions guard — a NON-RENDERING assertion layer over the
 * `protocol-actions.ts` registry shell.
 *
 * Purpose (per the "Protocol Action Foundation V1" canon decision):
 *   The registry is metadata only. It is NOT allowed to become the live CTA
 *   source until its labels and targets are reconciled against current
 *   production behavior. This test LOCKS today's truth so any drift — a
 *   pending action going live, a sealed/history flow resurfacing, an external
 *   link silently turning internal, or the registry being wired into a
 *   rendering surface before reconciliation — fails CI instead of shipping.
 *
 * This file changes NO UI, NO routes, NO labels, NO CTA wiring. It only reads
 * source + config and asserts invariants. It does NOT touch contracts, ABIs,
 * addresses, mint price, or any on-chain state.
 *
 * Guards (mapped to the requested checklist):
 *   1. Every LIVE action's route target resolves to a real route file.
 *   2. Every PENDING action is unreachable (target null, excluded from live)
 *      AND the registry is not imported by any rendering surface yet.
 *   3. External behavior stays external (Trader Joe URLs remain absolute
 *      https links and are still referenced by the rendered component layer).
 *   4. No claim / reward / merch / SeatRecord721 / marketplace action is live.
 *   5. Sale V2 membership action remains live-but-unaudited / early.
 *   6. Sale V1 remains sealed / history (never modeled as a live action).
 *   7. CommissionRouter remains unset / referral pending.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  PROTOCOL_ACTIONS,
  getLiveProtocolActions,
  getPendingProtocolActions,
  isLiveProtocolAction,
  type ProtocolAction,
  type ProtocolActionId,
} from "../protocol-actions";
import { LP_POOL } from "../syndicate-config";

const ROOT = join(__dirname, "..", "..", "..");

/** The five future placeholders that must never surface as live CTAs. */
const FUTURE_PENDING_IDS: ProtocolActionId[] = [
  "claimEscrowedCommission",
  "claimCampaignReward",
  "claimMerchEligibility",
  "mintSeatRecord721",
  "marketplaceAction",
];

const allActions = (): ProtocolAction[] => Object.values(PROTOCOL_ACTIONS);

/** Map an internal route target ("/join", "/", "/my-syndicate") to its file. */
function routeFileFor(value: string): string {
  if (value === "/") return join(ROOT, "src/routes/index.tsx");
  const slug = value.replace(/^\//, "");
  return join(ROOT, "src/routes", `${slug}.tsx`);
}

function fileExists(p: string): boolean {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

/** Recursively collect source files under a root, skipping tests/generated. */
function collectSourceFiles(rel: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (name === "__tests__" || name === "node_modules") continue;
      const full = join(dir, name);
      let s;
      try {
        s = statSync(full);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        walk(full);
      } else if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name)) {
        out.push(full);
      }
    }
  };
  walk(join(ROOT, rel));
  return out;
}

describe("protocol-actions guard — registry shape & live/pending split", () => {
  it("guard 4: the five future actions are all PENDING and never live", () => {
    for (const id of FUTURE_PENDING_IDS) {
      const a = PROTOCOL_ACTIONS[id];
      expect(a, `${id} missing from registry`).toBeTruthy();
      expect(a.status, `${id} must be pending`).toBe("pending");
      expect(isLiveProtocolAction(id), `${id} must not be live`).toBe(false);
    }
    const liveIds = getLiveProtocolActions().map((a) => a.id);
    for (const id of FUTURE_PENDING_IDS) {
      expect(liveIds).not.toContain(id);
    }
  });

  it("guard 2: every PENDING action is unreachable (target null, no success dest)", () => {
    for (const a of getPendingProtocolActions()) {
      expect(a.target, `${a.id} pending action must have null target`).toBeNull();
      expect(
        a.successDestination,
        `${a.id} pending action must have null successDestination`,
      ).toBeNull();
    }
  });

  it("guard 2/4: the pending set is EXACTLY the five future placeholders", () => {
    const pending = getPendingProtocolActions()
      .map((a) => a.id)
      .sort();
    expect(pending).toEqual([...FUTURE_PENDING_IDS].sort());
  });

  it("every LIVE action carries a non-null target", () => {
    for (const a of getLiveProtocolActions()) {
      expect(a.target, `${a.id} live action must have a target`).not.toBeNull();
    }
  });
});

describe("protocol-actions guard — route target validity (guard 1)", () => {
  it("every live action with a route target resolves to a real route file", () => {
    for (const a of getLiveProtocolActions()) {
      if (a.target?.type !== "route") continue;
      expect(
        a.target.value.startsWith("/"),
        `${a.id} route target must be an internal path`,
      ).toBe(true);
      const file = routeFileFor(a.target.value);
      expect(
        fileExists(file),
        `${a.id} → ${a.target.value} has no route file (${file})`,
      ).toBe(true);
    }
  });
});

describe("protocol-actions guard — Sale truth (guards 5 & 6)", () => {
  it("guard 5: joinMembership is the Sale V2 action, live-but-unaudited", () => {
    const join = PROTOCOL_ACTIONS.joinMembership;
    expect(join.kind).toBe("membership");
    expect(join.status).toBe("live-unaudited");
    expect(join.target).toEqual({ type: "route", value: "/join" });
    expect(/unaudited/i.test(join.note ?? "")).toBe(true);
  });

  it("guard 6: exactly ONE membership action exists (V2); V1 is not modeled as a live action", () => {
    const membership = allActions().filter((a) => a.kind === "membership");
    expect(membership.map((a) => a.id)).toEqual(["joinMembership"]);
    // No live action may advertise a "V1" / "sealed" sale as joinable.
    for (const a of getLiveProtocolActions()) {
      expect(/\bV1\b/.test(a.note ?? "")).toBe(false);
      expect(a.status).not.toBe("sealed");
    }
  });

  it("mint actions hold their truth: First Signal LIVE, Patron Seal PREVIEW (ID3, on-chain gated)", () => {
    expect(PROTOCOL_ACTIONS.mintFirstSignal.status).toBe("live");
    expect(PROTOCOL_ACTIONS.mintPatronSeal.status).toBe("preview");
  });
});

describe("protocol-actions guard — referral pending (guard 7)", () => {
  it("claimEscrowedCommission stays pending and names CommissionRouter unset / referral pending", () => {
    const a = PROTOCOL_ACTIONS.claimEscrowedCommission;
    expect(a.status).toBe("pending");
    expect(a.target).toBeNull();
    const note = (a.note ?? "").toLowerCase();
    expect(note.includes("commissionrouter")).toBe(true);
    expect(note.includes("unset") || note.includes("not active") || note.includes("pending")).toBe(true);
  });
});

describe("protocol-actions guard — external links stay external (guard 3)", () => {
  it("Trader Joe URLs are absolute https links to traderjoexyz.com", () => {
    for (const url of [LP_POOL.traderJoeUrl, LP_POOL.addLiquidityUrl]) {
      expect(url.startsWith("https://")).toBe(true);
      expect(url.includes("traderjoexyz.com")).toBe(true);
    }
  });

  it("the canonical Trade / Add-Liquidity action surface still binds BOTH external URLs", () => {
    // LiquidityActionRail is the surface that renders the live "Trade SYN" and
    // "Add Liquidity" CTAs. Tying the assertion to this file (not just "the URL
    // appears somewhere") means flipping either CTA to an internal route — e.g.
    // <Link to="/token"> — drops the external href and fails this guard, even if
    // an unrelated lib still references the URL string.
    const rail = join(ROOT, "src/components/syndicate/LiquidityActionRail.tsx");
    expect(fileExists(rail), "LiquidityActionRail surface is missing").toBe(true);
    const src = readFileSync(rail, "utf8");
    expect(
      src.includes("LP_POOL.traderJoeUrl"),
      "Trade SYN CTA must keep the external Trader Joe href",
    ).toBe(true);
    expect(
      src.includes("LP_POOL.addLiquidityUrl"),
      "Add Liquidity CTA must keep the external Trader Joe href",
    ).toBe(true);
  });

  it("the external Add-Liquidity URL stays wired into the rendered component layer", () => {
    const referencing = collectSourceFiles("src/components").filter((f) =>
      readFileSync(f, "utf8").includes("LP_POOL.addLiquidityUrl"),
    );
    expect(
      referencing.length,
      "external Add-Liquidity link must remain wired in a rendered component",
    ).toBeGreaterThan(0);
  });
});

describe("protocol-actions guard — registry stays non-rendering (guards 2 & 4)", () => {
  it("protocol-actions.ts is NOT imported by any rendering surface yet", () => {
    // Per canon decision: the registry must not drive CTAs until its labels +
    // targets are reconciled against production. Until then, no component or
    // route may import it (which is what would let a PENDING action leak into
    // rendered output). When a deliberate reconciliation/wiring pass happens,
    // update this guard alongside it — do NOT delete it.
    const renderRoots = [
      ...collectSourceFiles("src/components"),
      ...collectSourceFiles("src/routes"),
    ];
    // Matches static (`from "../protocol-actions"`) AND dynamic
    // (`import("@/lib/protocol-actions")`) module specifiers; the leading "/"
    // and trailing quote keep it from matching this guard file's own name.
    const IMPORT_RE = /["'][^"']*\/protocol-actions["']/;
    const offenders = renderRoots.filter((f) =>
      IMPORT_RE.test(readFileSync(f, "utf8")),
    );
    expect(
      offenders.map((f) => f.replace(ROOT + "/", "")),
      "a rendering surface imported protocol-actions before reconciliation",
    ).toEqual([]);
  });

  it("guard 2/4: distinctive PENDING action labels never appear in a rendered surface", () => {
    // Only labels that do NOT collide with legitimate descriptive copy are
    // scannable. "Mint Seat Record" and "Marketplace" are intentionally EXCLUDED
    // here — those words appear throughout the whitepaper / FAQ / glossary /
    // PendingModuleNotice as honest "planned module" descriptions, so a raw scan
    // would false-fail. Those two stay covered by the registry-level guards
    // (target null, excluded from live) + the no-render-import tripwire above.
    const DISTINCTIVE_PENDING_LABELS = [
      PROTOCOL_ACTIONS.claimEscrowedCommission.label, // "Claim escrowed commission"
      PROTOCOL_ACTIONS.claimCampaignReward.label, //     "Claim campaign reward"
      PROTOCOL_ACTIONS.claimMerchEligibility.label, //   "Check merch eligibility"
    ];
    const rendered = [
      ...collectSourceFiles("src/components"),
      ...collectSourceFiles("src/routes"),
    ];
    for (const label of DISTINCTIVE_PENDING_LABELS) {
      const hits = rendered
        .filter((f) => readFileSync(f, "utf8").includes(label))
        .map((f) => f.replace(ROOT + "/", ""));
      expect(
        hits,
        `pending label "${label}" leaked into a rendered surface`,
      ).toEqual([]);
    }
  });
});
