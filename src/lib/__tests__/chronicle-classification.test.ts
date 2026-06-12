// Regression guards for the Chronicle two-register classification model.
//
// These lock the model + guardrails added in Sprint 1:
//   • every locked entry carries a register + category that AGREE
//   • the day-one entries are all Protocol/Institutional (no member entries yet)
//   • founder / system-wallet actions require institutional significance
//   • category → register mapping is stable
//
// This is additive to chronicle-doctrine.test.ts (the six-part gate). It must
// never relax that gate.

import { describe, it, expect } from "vitest";
import {
  CHRONICLE_ENTRIES,
  registerForCategory,
  requiresInstitutionalSignificance,
  validateChronicleClassification,
} from "../chronicle-entries";

describe("Chronicle — two-register classification", () => {
  it("every locked entry has a register + category that agree", () => {
    for (const e of CHRONICLE_ENTRIES) {
      const errs = validateChronicleClassification(e);
      expect(errs, errs.join("\n")).toEqual([]);
    }
  });

  it("day-one entries are all Protocol/Institutional (no member-living entries yet)", () => {
    for (const e of CHRONICLE_ENTRIES) {
      expect(e.register).toBe("protocol-institutional");
    }
  });

  it("maps the member category to the member-living register, others to protocol-institutional", () => {
    expect(registerForCategory("member")).toBe("member-living");
    expect(registerForCategory("genesis")).toBe("protocol-institutional");
    expect(registerForCategory("artifact")).toBe("protocol-institutional");
    expect(registerForCategory("burn")).toBe("protocol-institutional");
  });

  it("founder / system-wallet actions are Activity-by-default (require institutional significance)", () => {
    expect(requiresInstitutionalSignificance("founder-action")).toBe(true);
    expect(requiresInstitutionalSignificance("system-wallet-action")).toBe(true);
    expect(requiresInstitutionalSignificance("genesis")).toBe(false);
    expect(requiresInstitutionalSignificance("artifact")).toBe(false);
    expect(requiresInstitutionalSignificance("member")).toBe(false);
  });

  it("rejects an entry whose declared register disagrees with its category", () => {
    const bad = {
      ...CHRONICLE_ENTRIES[0],
      register: "member-living" as const,
      category: "genesis" as const,
    };
    expect(validateChronicleClassification(bad).length).toBeGreaterThan(0);
  });
});
