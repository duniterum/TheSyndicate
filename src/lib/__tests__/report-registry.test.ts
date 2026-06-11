// Report registry. Proves all five cadences exist, every report is PENDING
// (architecture only), and every metric id a report claims to derive from is a
// proven-real metric (it appears in the event pipeline's metric effects).

import { describe, it, expect } from "vitest";
import {
  REPORT_REGISTRY,
  REPORT_CADENCE_LABEL,
  reportById,
  allReferencedMetricIds,
  type ReportCadence,
} from "../report-registry";
import { EVENT_METRIC_EFFECTS } from "../protocol-event-registry";

const PROVEN_METRIC_IDS = new Set(Object.values(EVENT_METRIC_EFFECTS).flat());

describe("report-registry", () => {
  it("declares all five cadences", () => {
    const cadences = new Set<ReportCadence>(REPORT_REGISTRY.map((r) => r.cadence));
    for (const c of ["weekly", "monthly", "quarterly", "half-year", "annual"] as ReportCadence[]) {
      expect(cadences.has(c), `cadence ${c}`).toBe(true);
      expect(REPORT_CADENCE_LABEL[c]).toBeTruthy();
    }
  });

  it("keeps every report PENDING with a title, summary, and metric ids", () => {
    expect(REPORT_REGISTRY.length).toBeGreaterThan(0);
    for (const r of REPORT_REGISTRY) {
      expect(r.status).toBe("PENDING");
      expect(r.title).toBeTruthy();
      expect(r.summary).toBeTruthy();
      expect(r.derivesFrom.metricIds.length).toBeGreaterThan(0);
      expect(r.derivesFrom.eventCategories.length).toBeGreaterThan(0);
    }
  });

  it("references only proven-real metric ids", () => {
    for (const id of allReferencedMetricIds()) {
      expect(PROVEN_METRIC_IDS.has(id), `metric id "${id}" must be a real pipeline metric`).toBe(true);
    }
  });

  it("resolves a report by id", () => {
    expect(reportById("annual-state-of-the-syndicate")?.cadence).toBe("annual");
    expect(reportById("does-not-exist")).toBeUndefined();
  });
});
