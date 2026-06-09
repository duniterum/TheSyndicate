// Health history — client-recorded snapshots of aggregate protocol health
// over time, stored in localStorage. Surfaced as a sparkline/timeline on
// /protocol-health. Honest scope: this is a per-browser record (not a
// server-side audit log) — appropriate for an operator's at-a-glance trend.

import { aggregateHealth, type AggregatedHealth } from "./protocol-health-registry";

const KEY = "syndicate.health.history.v1";
const MAX_ENTRIES = 60;
const MIN_GAP_MS = 5 * 60 * 1000; // throttle to one snapshot per 5 minutes

export interface HealthSnapshot {
  ts: number;
  passes: number;
  warnings: number;
  blockers: number;
  worstLevel: AggregatedHealth["worstLevel"];
}

function safeRead(): HealthSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

function safeWrite(entries: HealthSnapshot[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    /* quota / privacy mode — silent */
  }
}

export function readHistory(): HealthSnapshot[] {
  return safeRead();
}

export function recordSnapshotNow(): HealthSnapshot[] {
  const agg = aggregateHealth();
  const history = safeRead();
  const last = history[history.length - 1];
  const now = Date.now();
  const same =
    last &&
    last.passes === agg.passes &&
    last.warnings === agg.warnings &&
    last.blockers === agg.blockers;
  if (last && now - last.ts < MIN_GAP_MS && same) return history;
  const next: HealthSnapshot = {
    ts: now,
    passes: agg.passes,
    warnings: agg.warnings,
    blockers: agg.blockers,
    worstLevel: agg.worstLevel,
  };
  const out = [...history, next];
  safeWrite(out);
  return out;
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
