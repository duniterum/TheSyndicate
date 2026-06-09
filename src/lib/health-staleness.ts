// Staleness detector — flags modules whose `lastVerified` source date is
// older than a configurable threshold. The lastVerified field may either be
// a free-form path with a parenthesized date (e.g. "docs/X.md (2026-06-08)")
// or a bare path with no date. Modules with no extractable date are
// classified as UNKNOWN — surfaced but not treated as stale.

import { PROTOCOL_HEALTH_REGISTRY, type ProtocolModule } from "./protocol-health-registry";

const DATE_RE = /\((\d{4}-\d{2}-\d{2})\)/;

export type StalenessStatus = "FRESH" | "AGING" | "STALE" | "UNKNOWN";

export interface StalenessRow {
  moduleId: string;
  moduleName: string;
  source: string;
  verifiedAt: string | null;
  ageDays: number | null;
  status: StalenessStatus;
}

export interface StalenessThresholds {
  freshMaxDays: number;   // ≤ this → FRESH
  agingMaxDays: number;   // ≤ this → AGING; beyond → STALE
  /** Reference date — defaults to today. Injectable for tests. */
  now?: Date;
}

const DEFAULTS: StalenessThresholds = { freshMaxDays: 30, agingMaxDays: 90 };

export function classifyStaleness(
  modules: ProtocolModule[] = PROTOCOL_HEALTH_REGISTRY,
  thresholds: Partial<StalenessThresholds> = {},
): StalenessRow[] {
  const t = { ...DEFAULTS, ...thresholds };
  const now = (t.now ?? new Date()).getTime();
  return modules.map((m) => {
    const match = m.lastVerified.match(DATE_RE);
    const verifiedAt = match ? match[1] : null;
    let ageDays: number | null = null;
    let status: StalenessStatus = "UNKNOWN";
    if (verifiedAt) {
      const then = new Date(verifiedAt + "T00:00:00Z").getTime();
      if (!Number.isNaN(then)) {
        ageDays = Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
        status = ageDays <= t.freshMaxDays ? "FRESH"
              : ageDays <= t.agingMaxDays ? "AGING"
              : "STALE";
      }
    }
    return {
      moduleId: m.moduleId,
      moduleName: m.moduleName,
      source: m.lastVerified,
      verifiedAt,
      ageDays,
      status,
    };
  });
}

export function summarizeStaleness(rows: StalenessRow[]) {
  return {
    fresh: rows.filter((r) => r.status === "FRESH").length,
    aging: rows.filter((r) => r.status === "AGING").length,
    stale: rows.filter((r) => r.status === "STALE").length,
    unknown: rows.filter((r) => r.status === "UNKNOWN").length,
  };
}
