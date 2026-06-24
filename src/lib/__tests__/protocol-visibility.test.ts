import { describe, expect, it } from "vitest";
import {
  PROTOCOL_INSTITUTIONAL_SPINE,
  PROTOCOL_VISIBILITY_DEEP_STATUSES,
  PROTOCOL_VISIBILITY_HARD_BOUNDARIES,
  PROTOCOL_VISIBILITY_NODES,
  PROTOCOL_VISIBILITY_PILLARS,
  PROTOCOL_VISIBILITY_PROOF_BACKBONE,
  PROTOCOL_VISIBILITY_PULSE,
  PROTOCOL_VISIBILITY_STATUSES,
  PROTOCOL_VISIBILITY_SYSTEM_GROUPS,
  getProtocolVisibilityNodesByGroup,
  getProtocolVisibilityStatusCounts,
  isProtocolVisibilityNodeLive,
} from "@/lib/protocol-visibility";
import { ZERO_SOURCE_ID } from "@/lib/source-policy-observability";

const allowedStatuses = new Set(PROTOCOL_VISIBILITY_STATUSES);
const allowedGroups = new Set(PROTOCOL_VISIBILITY_SYSTEM_GROUPS);
const forbiddenFinancialMotivation = /\b(passive income|ROI|top earner|top earners|downline|upline|MLM|guaranteed return|public source link live|claim UI live)\b/i;

describe("protocol visibility model", () => {
  it("defines the five-pillar institutional visibility language", () => {
    expect(PROTOCOL_VISIBILITY_PILLARS.map((pillar) => pillar.label)).toEqual([
      "Institutional Spine",
      "Institution Map",
      "Institutional Pulse",
      "Proof Backbone",
      "Place / Belonging",
    ]);

    expect(PROTOCOL_INSTITUTIONAL_SPINE.map((step) => step.verb)).toEqual([
      "Join",
      "Prove",
      "Remember",
      "Return",
      "Evolve",
    ]);
  });

  it("keeps the public status vocabulary narrow with deeper statuses reserved", () => {
    expect(PROTOCOL_VISIBILITY_STATUSES).toEqual([
      "LIVE",
      "PAUSED",
      "INACTIVE",
      "BUILDING",
      "PLANNED",
      "FUTURE",
      "DEFERRED",
    ]);
    expect(PROTOCOL_VISIBILITY_DEEP_STATUSES).toEqual(["READBACK", "SEALED"]);
  });

  it("gives every visible system the required truth fields", () => {
    expect(PROTOCOL_VISIBILITY_NODES.length).toBeGreaterThan(10);

    for (const node of PROTOCOL_VISIBILITY_NODES) {
      expect(node.id).toBeTruthy();
      expect(node.label).toBeTruthy();
      expect(node.role).toBeTruthy();
      expect(allowedStatuses.has(node.status), node.id).toBe(true);
      expect(allowedGroups.has(node.systemGroup), node.id).toBe(true);
      expect(node.userMeaning).toBeTruthy();
      expect(node.liveTruth).toBeTruthy();
      expect(node.boundary).toBeTruthy();
      expect(node.pillarIds.length, node.id).toBeGreaterThan(0);
      expect(node.route || node.futureState, node.id).toBeTruthy();
      expect(node.proofPath || node.boundary, node.id).toBeTruthy();
    }
  });

  it("keeps inactive and future systems from rendering live actions", () => {
    for (const node of PROTOCOL_VISIBILITY_NODES) {
      if (!isProtocolVisibilityNodeLive(node)) {
        expect(node.primaryAction?.live ?? false, node.id).toBe(false);
      }
    }

    for (const id of ["seatrecord721", "identity-layer", "swaprail", "product-sale-router"]) {
      const node = PROTOCOL_VISIBILITY_NODES.find((candidate) => candidate.id === id);
      expect(node?.status, id).toBe("FUTURE");
      expect(node?.route, id).toBeNull();
    }
  });

  it("keeps referral, source attribution, and claim surfaces inactive or non-public", () => {
    const sourceAttribution = PROTOCOL_VISIBILITY_NODES.find((node) => node.id === "source-attribution");
    const referral = PROTOCOL_VISIBILITY_NODES.find((node) => node.id === "referral");

    expect(sourceAttribution?.status).not.toBe("LIVE");
    expect(referral?.status).toBe("INACTIVE");
    expect(sourceAttribution?.boundary).toContain("No public source link");
    expect(sourceAttribution?.boundary).toContain("no claim UI");
    expect(referral?.boundary).toContain("No referral activation");
    expect(PROTOCOL_VISIBILITY_HARD_BOUNDARIES.join("\n")).toContain(ZERO_SOURCE_ID);
  });

  it("represents future recognition as reserved institutional memory, not an incentive product", () => {
    const reserve = PROTOCOL_VISIBILITY_NODES.find((node) => node.id === "future-recognition-reserve");

    expect(reserve?.status).toBe("FUTURE");
    expect(reserve?.route).toBeNull();
    expect(reserve?.liveTruth).toContain("No public recognition");
    expect(reserve?.boundary).toContain("financial leaderboard");
    expect(reserve?.futureState).toContain("Builder Records");
    expect(reserve?.futureState).toContain("Institutional Trust Capital");
  });

  it("covers each institution-map group and proof backbone route", () => {
    for (const group of PROTOCOL_VISIBILITY_SYSTEM_GROUPS) {
      expect(getProtocolVisibilityNodesByGroup(group).length, group).toBeGreaterThan(0);
    }

    for (const proof of PROTOCOL_VISIBILITY_PROOF_BACKBONE) {
      expect(proof.route.startsWith("/"), proof.label).toBe(true);
      expect(proof.meaning).toBeTruthy();
    }

    expect(getProtocolVisibilityStatusCounts().length).toBeGreaterThan(2);
  });

  it("keeps model copy free from financialized motivation and fake-live wording", () => {
    const modelText = [
      JSON.stringify(PROTOCOL_VISIBILITY_PILLARS),
      JSON.stringify(PROTOCOL_INSTITUTIONAL_SPINE),
      JSON.stringify(PROTOCOL_VISIBILITY_NODES),
      JSON.stringify(PROTOCOL_VISIBILITY_PULSE),
      JSON.stringify(PROTOCOL_VISIBILITY_HARD_BOUNDARIES),
    ].join("\n");

    expect(modelText).not.toMatch(forbiddenFinancialMotivation);
    expect(modelText).not.toMatch(/\bsource links are live\b/i);
    expect(modelText).not.toMatch(/\breferral is active\b/i);
  });
});
