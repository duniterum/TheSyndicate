import { describe, expect, it } from "vitest";

import {
  PROTOCOL_EVOLUTION_BOUNDARIES,
  PROTOCOL_EVOLUTION_EVIDENCE_KINDS,
  PROTOCOL_EVOLUTION_MODULES,
  PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT,
  PROTOCOL_EVOLUTION_STATUS_ORDER,
  getProtocolEvolutionEvidenceCount,
  getProtocolEvolutionStatusCounts,
} from "../protocol-evolution";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

describe("protocol evolution registry", () => {
  it("covers the expected protocol organism modules", () => {
    const ids = PROTOCOL_EVOLUTION_MODULES.map((module) => module.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "membership-engine",
        "source-attribution",
        "protocol-economy",
        "activity",
        "institutional-register",
        "member-os",
        "chronicle",
        "archive1155",
        "seatrecord721",
        "swaprail",
        "product-attribution",
        "reporting-tax-export",
        "notifications",
      ]),
    );
  });

  it("uses only canonical evolution statuses and evidence kinds", () => {
    const statuses = new Set(PROTOCOL_EVOLUTION_STATUS_ORDER);
    const evidenceKinds = new Set(PROTOCOL_EVOLUTION_EVIDENCE_KINDS);

    for (const module of PROTOCOL_EVOLUTION_MODULES) {
      expect(statuses.has(module.status), module.id).toBe(true);
      expect(module.evidence.length, module.id).toBeGreaterThan(0);
      for (const evidence of module.evidence) {
        expect(evidenceKinds.has(evidence.kind), `${module.id}:${evidence.label}`).toBe(true);
        expect(evidence.note.trim().length, `${module.id}:${evidence.label}`).toBeGreaterThan(0);
      }
    }
  });

  it("keeps source attribution inactive without creating referral, source, or claim behavior", () => {
    const source = PROTOCOL_EVOLUTION_MODULES.find((module) => module.id === "source-attribution");

    expect(source).toBeTruthy();
    expect(source?.status).toBe("INACTIVE");
    expect(source?.currentTruth).toContain("zero source records");
    expect(source?.currentTruth).toContain("ZERO_SOURCE_ID");
    expect(source?.notLive).toContain("No referral activation");
    expect(source?.notLive).toContain("no claim UI");
    expect(PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT).toBe(0);
    expect(PROTOCOL_EVOLUTION_BOUNDARIES.join("\n")).toContain(ZERO_SOURCE_ID);
  });

  it("keeps future systems future or deferred until their own module intake exists", () => {
    const statusById = new Map(PROTOCOL_EVOLUTION_MODULES.map((module) => [module.id, module.status]));

    expect(statusById.get("seatrecord721")).toBe("FUTURE");
    expect(statusById.get("swaprail")).toBe("FUTURE");
    expect(statusById.get("product-attribution")).toBe("FUTURE");
    expect(statusById.get("reporting-tax-export")).toBe("DEFERRED");
    expect(statusById.get("notifications")).toBe("FUTURE");
  });

  it("summarizes statuses and evidence without empty buckets", () => {
    expect(getProtocolEvolutionEvidenceCount()).toBeGreaterThanOrEqual(PROTOCOL_EVOLUTION_MODULES.length);

    for (const entry of getProtocolEvolutionStatusCounts()) {
      expect(entry.count).toBeGreaterThan(0);
    }
  });

  it("does not contain activation or entitlement drift language", () => {
    const corpus = JSON.stringify({
      modules: PROTOCOL_EVOLUTION_MODULES,
      boundaries: PROTOCOL_EVOLUTION_BOUNDARIES,
    });

    expect(corpus).not.toMatch(/public referral is live/i);
    expect(corpus).not.toMatch(/source links are live/i);
    expect(corpus).not.toMatch(/claim UI is live/i);
    expect(corpus).not.toMatch(/passive income|yield-bearing|\bROI\b|guaranteed return|downline/i);
    expect(corpus).not.toMatch(/community vote|members voted|governance rights/i);
  });
});
