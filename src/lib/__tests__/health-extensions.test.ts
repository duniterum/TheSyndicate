import { describe, it, expect, beforeEach } from "vitest";
import { classifyStaleness, summarizeStaleness } from "../health-staleness";
import { buildHealthCsv } from "../health-csv";
import { recordSnapshotNow, readHistory, clearHistory } from "../health-history";
import type { ProtocolModule } from "../protocol-health-registry";

const sample: ProtocolModule[] = [
  { moduleId: "a", moduleName: "A", sources: [], dataSources: [], routes: [], contracts: [],
    status: "LIVE", health: "PASS", checks: [], deferred: [],
    lastVerified: "docs/x.md (2026-06-01)", nextMilestoneBlocker: "", findings: [] },
  { moduleId: "b", moduleName: "B", sources: [], dataSources: [], routes: [], contracts: [],
    status: "LIVE", health: "WARN", checks: [], deferred: [],
    lastVerified: "docs/y.md (2026-04-01)", nextMilestoneBlocker: "", findings: [] },
  { moduleId: "c", moduleName: "C", sources: [], dataSources: [], routes: [], contracts: [],
    status: "LIVE", health: "PASS", checks: [], deferred: [],
    lastVerified: "docs/z.md (2025-01-01)", nextMilestoneBlocker: "", findings: [] },
  { moduleId: "d", moduleName: "D", sources: [], dataSources: [], routes: [], contracts: [],
    status: "ROADMAP", health: "PASS", checks: [], deferred: [],
    lastVerified: "docs/no-date.md", nextMilestoneBlocker: "", findings: [] },
];

describe("health-staleness", () => {
  it("classifies FRESH/AGING/STALE/UNKNOWN against fixed now", () => {
    const rows = classifyStaleness(sample, { now: new Date("2026-06-08T00:00:00Z") });
    const by = Object.fromEntries(rows.map((r) => [r.moduleId, r.status]));
    expect(by.a).toBe("FRESH");
    expect(by.b).toBe("AGING");
    expect(by.c).toBe("STALE");
    expect(by.d).toBe("UNKNOWN");
  });

  it("summary tallies match", () => {
    const rows = classifyStaleness(sample, { now: new Date("2026-06-08T00:00:00Z") });
    const sum = summarizeStaleness(rows);
    expect(sum).toEqual({ fresh: 1, aging: 1, stale: 1, unknown: 1 });
  });
});

describe("health-csv", () => {
  it("includes module + finding + ticket sections and escapes quotes", () => {
    const csv = buildHealthCsv();
    expect(csv).toMatch(/section,module_id,module_name/);
    expect(csv).toMatch(/^module,/m);
    expect(csv).toMatch(/section,priority,level,module_id/);
    // No raw newlines breaking rows
    for (const line of csv.split("\n")) {
      const quotes = (line.match(/"/g) ?? []).length;
      expect(quotes % 2).toBe(0);
    }
  });
});

describe("health-history (localStorage)", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => { store.set(k, v); },
        removeItem: (k: string) => { store.delete(k); },
      },
    };
    clearHistory();
  });
  it("records a snapshot and reads it back", () => {
    expect(readHistory().length).toBe(0);
    const after = recordSnapshotNow();
    expect(after.length).toBe(1);
    expect(readHistory().length).toBe(1);
    expect(after[0].ts).toBeGreaterThan(0);
  });
  it("does not duplicate identical snapshots within the throttle window", () => {
    recordSnapshotNow();
    const second = recordSnapshotNow();
    expect(second.length).toBe(1);
  });
});
