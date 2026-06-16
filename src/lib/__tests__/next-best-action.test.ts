/**
 * next-best-action selector — pure-logic guard.
 *
 * Locks the extracted journey backbone (Identity State → Next Best Action →
 * Protocol Actions) so any drift fails CI instead of shipping:
 *   • output is always a subset of the registry's emittable actions,
 *   • PENDING / PREVIEW / SEALED actions are NEVER emitted,
 *   • each identity state yields the correct, deterministic, ordered list,
 *   • a non-member is never told to "Buy More SYN" and a member is never told
 *     to "Become a Member" (carried by joinIntent, not labels — the selector
 *     emits ids only).
 *
 * This file changes NO UI, NO routes, NO labels, NO CTA wiring. It only reads
 * the pure selector + registry metadata.
 */

import { describe, expect, it } from "vitest";

import {
  selectNextActions,
  deriveIdentityState,
  isEmittableAction,
  EMITTABLE_STATUSES,
  VISITOR_ACTIONS,
  NON_MEMBER_ACTIONS,
  MEMBER_ACTIONS,
  COLLECTOR_ACTIONS,
  type NextActionContext,
} from "../next-best-action";
import {
  PROTOCOL_ACTIONS,
  type ProtocolActionId,
} from "../protocol-actions";

// Default context = connected, loaded, non-member, no spend, no artifacts.
const ctx = (over: Partial<NextActionContext> = {}): NextActionContext => ({
  isConnected: true,
  identityLoading: false,
  isMember: false,
  cumulativeUsdc: 0,
  ownsArtifacts: false,
  ...over,
});

const VISITOR = ctx({ isConnected: false });
const LOADING = ctx({ isConnected: true, identityLoading: true });
const NON_MEMBER = ctx({ isMember: false });
const MEMBER = ctx({ isMember: true, cumulativeUsdc: 100 }); // next tier exists
const TOP_RANK = ctx({ isMember: true, cumulativeUsdc: 10_000 }); // Cornerstone, no next
const MEMBER_COLLECTOR = ctx({
  isMember: true,
  cumulativeUsdc: 50,
  ownsArtifacts: true,
});
const NON_MEMBER_COLLECTOR = ctx({ isMember: false, ownsArtifacts: true });

const ALL_STATE_CONTEXTS: NextActionContext[] = [
  VISITOR,
  LOADING,
  NON_MEMBER,
  MEMBER,
  TOP_RANK,
  MEMBER_COLLECTOR,
  NON_MEMBER_COLLECTOR,
];

const PENDING_IDS: ProtocolActionId[] = [
  "claimEscrowedCommission",
  "claimCampaignReward",
  "claimMerchEligibility",
  "mintSeatRecord721",
  "marketplaceAction",
];

describe("identity state derivation", () => {
  it("maps each context to its membership-axis state", () => {
    expect(deriveIdentityState(VISITOR)).toBe("visitor");
    expect(deriveIdentityState(LOADING)).toBe("identity-loading");
    expect(deriveIdentityState(NON_MEMBER)).toBe("connected-non-member");
    expect(deriveIdentityState(MEMBER)).toBe("member");
    expect(deriveIdentityState(TOP_RANK)).toBe("member");
  });

  it("disconnected is always visitor, even mid-load or owning artifacts", () => {
    expect(
      deriveIdentityState(ctx({ isConnected: false, identityLoading: true })),
    ).toBe("visitor");
    expect(
      deriveIdentityState(ctx({ isConnected: false, ownsArtifacts: true })),
    ).toBe("visitor");
  });
});

describe("per-state action lists (deterministic, ordered)", () => {
  it("visitor → join only, with connect precondition", () => {
    const p = selectNextActions(VISITOR);
    expect(p.actions).toEqual(["joinMembership"]);
    expect(p.requiresConnect).toBe(true);
    expect(p.joinIntent).toBe("join");
  });

  it("identity-loading → neutral (no journey emitted)", () => {
    const p = selectNextActions(LOADING);
    expect(p.actions).toEqual([]);
    expect(p.joinIntent).toBe("none");
    expect(p.requiresConnect).toBe(false);
  });

  it("connected non-member → join → my syndicate → verify", () => {
    const p = selectNextActions(NON_MEMBER);
    expect(p.actions).toEqual([
      "joinMembership",
      "openMySyndicate",
      "verifyProtocol",
    ]);
    expect(p.joinIntent).toBe("join");
  });

  it("member → my syndicate → buy more → mint → verify → liquidity", () => {
    const p = selectNextActions(MEMBER);
    expect(p.actions).toEqual([
      "openMySyndicate",
      "joinMembership",
      "mintFirstSignal",
      "verifyProtocol",
      "addLiquidity",
    ]);
    expect(p.joinIntent).toBe("buy-more");
    expect(p.atTopRank).toBe(false);
  });

  it("higher-rank (top tier) member → same ordered list, atTopRank flagged", () => {
    const p = selectNextActions(TOP_RANK);
    expect(p.actions).toEqual(selectNextActions(MEMBER).actions);
    expect(p.atTopRank).toBe(true);
    expect(p.joinIntent).toBe("buy-more");
  });
});

describe("collector overlay", () => {
  it("any context owning artifacts gets every collector-path action present", () => {
    // The membership spine orders the journey; the collector overlay only
    // GUARANTEES the collector actions are present (exact order is pinned
    // per-context below). So we assert presence, not relative order.
    for (const c of [MEMBER_COLLECTOR, NON_MEMBER_COLLECTOR]) {
      const p = selectNextActions(c);
      expect(p.isCollector).toBe(true);
      for (const id of COLLECTOR_ACTIONS) expect(p.actions).toContain(id);
    }
  });

  it("non-member collector keeps the join-first journey + gains the next artifact", () => {
    const p = selectNextActions(NON_MEMBER_COLLECTOR);
    expect(p.actions).toEqual([
      "joinMembership",
      "openMySyndicate",
      "verifyProtocol",
      "mintFirstSignal",
    ]);
    expect(p.joinIntent).toBe("join");
  });

  it("member collector is unchanged (member journey already covers collector path)", () => {
    expect(selectNextActions(MEMBER_COLLECTOR).actions).toEqual(
      selectNextActions(ctx({ isMember: true, cumulativeUsdc: 50 })).actions,
    );
  });
});

describe("output invariants (Section D)", () => {
  it("emittable policy is exactly live + live-unaudited (excludes preview)", () => {
    expect([...EMITTABLE_STATUSES].sort()).toEqual(["live", "live-unaudited"]);
    // mintPatronSeal is PREVIEW — must be classified non-emittable.
    expect(PROTOCOL_ACTIONS.mintPatronSeal.status).toBe("preview");
    expect(isEmittableAction("mintPatronSeal")).toBe(false);
  });

  it("every emitted action is a real, emittable registry action", () => {
    for (const c of ALL_STATE_CONTEXTS) {
      for (const id of selectNextActions(c).actions) {
        expect(PROTOCOL_ACTIONS[id], `${id} not in registry`).toBeTruthy();
        expect(isEmittableAction(id), `${id} not emittable`).toBe(true);
        expect(["live", "live-unaudited"]).toContain(PROTOCOL_ACTIONS[id].status);
      }
    }
  });

  it("never emits a PENDING action in any state", () => {
    for (const c of ALL_STATE_CONTEXTS) {
      const out = selectNextActions(c).actions;
      for (const pending of PENDING_IDS) expect(out).not.toContain(pending);
    }
  });

  it("never emits PREVIEW (Patron Seal) or any SEALED action", () => {
    for (const c of ALL_STATE_CONTEXTS) {
      const out = selectNextActions(c).actions;
      expect(out).not.toContain("mintPatronSeal");
      for (const id of out) expect(PROTOCOL_ACTIONS[id].status).not.toBe("sealed");
    }
  });

  it("output is always a subset of the live registry ids", () => {
    const emittable = (Object.keys(PROTOCOL_ACTIONS) as ProtocolActionId[]).filter(
      isEmittableAction,
    );
    for (const c of ALL_STATE_CONTEXTS) {
      for (const id of selectNextActions(c).actions) {
        expect(emittable).toContain(id);
      }
    }
  });

  it("output has no duplicates in any state", () => {
    for (const c of ALL_STATE_CONTEXTS) {
      const out = selectNextActions(c).actions;
      expect(out.length).toBe(new Set(out).size);
    }
  });
});

describe("join-vs-buy-more correctness", () => {
  it("a non-member is NEVER told to Buy More SYN", () => {
    for (const c of [NON_MEMBER, NON_MEMBER_COLLECTOR]) {
      const p = selectNextActions(c);
      expect(p.joinIntent).not.toBe("buy-more");
      expect(p.joinIntent).toBe("join");
      // member-only pattern (My Syndicate first + Add Liquidity) is absent.
      expect(p.actions[0]).toBe("joinMembership");
      expect(p.actions).not.toContain("addLiquidity");
    }
  });

  it("a member is NEVER told to Become a Member (join leads to buy-more)", () => {
    for (const c of [MEMBER, TOP_RANK, MEMBER_COLLECTOR]) {
      const p = selectNextActions(c);
      expect(p.joinIntent).toBe("buy-more");
      expect(p.actions[0]).toBe("openMySyndicate");
    }
  });
});

describe("journey constants are authored emittable-only", () => {
  it("every exported journey constant contains only emittable ids", () => {
    const constants: Record<string, readonly ProtocolActionId[]> = {
      VISITOR_ACTIONS,
      NON_MEMBER_ACTIONS,
      MEMBER_ACTIONS,
      COLLECTOR_ACTIONS,
    };
    for (const [name, ids] of Object.entries(constants)) {
      for (const id of ids) {
        expect(
          isEmittableAction(id),
          `${name} contains non-emittable ${id}`,
        ).toBe(true);
      }
    }
  });
});

describe("determinism", () => {
  it("repeated calls return equal output and do not mutate constants", () => {
    for (const c of ALL_STATE_CONTEXTS) {
      expect(selectNextActions(c).actions).toEqual(selectNextActions(c).actions);
    }
    // exported journey constants are not mutated by selection.
    expect(COLLECTOR_ACTIONS).toEqual([
      "openMySyndicate",
      "mintFirstSignal",
      "verifyProtocol",
    ]);
  });
});
