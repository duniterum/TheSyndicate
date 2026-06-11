// Integrity guard for the Protocol Event Registry. Event drift is prevented by
// classifying every kind ONCE; this test proves the classification is complete
// and that every metric an event claims to affect is a REAL registered metric.

import { describe, it, expect } from "vitest";
import {
  CATEGORY_FOR_KIND,
  EVENT_METRIC_EFFECTS,
  RECOMMENDED_SURFACES_FOR_CATEGORY,
  chronicleEligibleForKind,
  FUTURE_EVENT_NAMESPACES,
  type ProtocolEventKind,
  type ProtocolEventCategory,
} from "../protocol-event-registry";
import { METRIC_IDS } from "../protocol-metrics-registry";
import { findForbiddenLanguage } from "../protocol-language";

const ALL_KINDS = Object.keys(CATEGORY_FOR_KIND) as ProtocolEventKind[];

describe("protocol-event-registry", () => {
  it("classifies every kind with a category and a metric-effects entry", () => {
    for (const kind of ALL_KINDS) {
      expect(CATEGORY_FOR_KIND[kind]).toBeTruthy();
      expect(Array.isArray(EVENT_METRIC_EFFECTS[kind])).toBe(true);
    }
    // The two maps must cover exactly the same key set.
    expect(Object.keys(EVENT_METRIC_EFFECTS).sort()).toEqual([...ALL_KINDS].sort());
  });

  it("every referenced metric id is a real registered metric", () => {
    const known = new Set(METRIC_IDS);
    for (const kind of ALL_KINDS) {
      for (const id of EVENT_METRIC_EFFECTS[kind]) {
        expect(known.has(id), `metric id "${id}" (kind "${kind}") must exist in the registry`).toBe(true);
      }
    }
  });

  it("provides recommended surfaces for every category used by a kind", () => {
    const usedCategories = new Set<ProtocolEventCategory>(ALL_KINDS.map((k) => CATEGORY_FOR_KIND[k]));
    for (const cat of usedCategories) {
      expect(Array.isArray(RECOMMENDED_SURFACES_FOR_CATEGORY[cat])).toBe(true);
      expect(RECOMMENDED_SURFACES_FOR_CATEGORY[cat].length).toBeGreaterThan(0);
    }
  });

  it("never marks a person-subject kind as Chronicle-eligible", () => {
    expect(chronicleEligibleForKind("purchase")).toBe(false);
    expect(chronicleEligibleForKind("new-member")).toBe(false);
    expect(chronicleEligibleForKind("rank-reached")).toBe(false);
    // Protocol-level milestones may be candidates (advisory only).
    expect(chronicleEligibleForKind("burn-founder")).toBe(true);
    expect(chronicleEligibleForKind("burn-community")).toBe(true);
  });

  it("keeps all future namespaces PENDING with no live wiring", () => {
    expect(FUTURE_EVENT_NAMESPACES.length).toBeGreaterThan(0);
    for (const ns of FUTURE_EVENT_NAMESPACES) {
      expect(ns.status).toBe("PENDING");
    }
    // Referral namespaces must forbid reward/return vocabulary until a contract exists.
    const referral = FUTURE_EVENT_NAMESPACES.filter((n) => n.id.startsWith("referral"));
    expect(referral.length).toBe(2);
    for (const ns of referral) {
      expect(ns.forbiddenVocab).toBeTruthy();
      expect(ns.forbiddenVocab).toContain("yield");
    }
  });

  it("uses no forbidden vocabulary in any future-namespace public copy", () => {
    // protocol-event-registry.ts is allow-listed in check-ownership-wording
    // because its forbiddenVocab arrays are banlist DEFINITIONS. This restores
    // vocabulary coverage over the human-facing label/description strings the
    // exclusion would otherwise leave unscanned.
    for (const ns of FUTURE_EVENT_NAMESPACES) {
      for (const [field, text] of [["label", ns.label], ["description", ns.description]] as const) {
        const hits = findForbiddenLanguage(text);
        expect(hits, `forbidden wording in ${ns.id} ${field}: ${hits.join(", ")}`).toEqual([]);
      }
    }
  });
});
