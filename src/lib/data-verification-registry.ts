// ────────────────────────────────────────────────────────────────────────────
// DATA VERIFICATION REGISTRY — the "verify it yourself" drawer view over the
// canonical Protocol Metrics Registry.
//
// This file no longer RE-STATES metric metadata. It is a thin projection of
// `protocol-metrics-registry.ts` into the drawer shape the heartbeat strip and
// hero already consume. One metric is defined once (in the canonical registry)
// and surfaced here — label, description, source, links, refresh, and status
// can never drift from the value layer (`protocol-truth.ts`) again.
//
// The public surface is unchanged on purpose:
//   • METRIC_REGISTRY keeps its legacy keys (members, usdcRaised, vaultRouted,
//     lpTvl, synSold, lastBuy, nextMember, synSupply, circulating, synBurned)
//     so `?verify=<key>` deep-links keep resolving.
//   • getMetricVerification() additionally resolves ANY alias of a surfaced
//     metric (e.g. ?verify=lpTvlUsd, ?verify=vaultUsdc) via the canonical
//     alias index.
// ────────────────────────────────────────────────────────────────────────────

import { getMetric } from "./protocol-metrics-registry";

export type VerificationStatus = "LIVE" | "PARTIAL" | "PENDING";

export type VerificationLink = { label: string; href: string };

export type MetricVerification = {
  /** Stable key — also used as the React key for the drawer. */
  key: string;
  /** Label shown in the drawer header (matches the cell label). */
  label: string;
  /** One-line plain explanation of WHAT this number represents. */
  description: string;
  /** Hook name in this repo that computes the value. */
  hook: string;
  /** Underlying data source in plain language. */
  source: string;
  /** Refresh cadence in human language. */
  refresh: string;
  /** Trust status — must match the pill rendered next to the cell. */
  status: VerificationStatus;
  /** Verification links — explorers, RPC reads, source contracts. */
  links: VerificationLink[];
  /** Optional note about empty / loading state semantics. */
  emptyState?: string;
};

// Legacy drawer keys, in display order. Each is an id or alias in the canonical
// Protocol Metrics Registry, so it resolves directly via getMetric().
const VERIFY_KEYS = [
  "members",
  "usdcRaised",
  "vaultRouted",
  "lpTvl",
  "synSold",
  "lastBuy",
  "nextMember",
  "synSupply",
  "circulating",
  "synBurned",
] as const;

/** Project a canonical metric (resolved from a legacy verify key) into the drawer shape. */
function fromMetric(verifyKey: string): MetricVerification {
  const metric = getMetric(verifyKey);
  if (!metric) {
    throw new Error(
      `[data-verification-registry] no canonical metric resolves verify key "${verifyKey}"`,
    );
  }
  return {
    key: verifyKey,
    label: metric.shortLabel ?? metric.label,
    description: metric.description,
    hook: metric.hook,
    source: metric.source,
    refresh: metric.verification.refresh,
    status: metric.status,
    links: metric.verification.links,
    ...(metric.emptyState ? { emptyState: metric.emptyState } : {}),
  };
}

export const METRIC_REGISTRY: Record<string, MetricVerification> = Object.fromEntries(
  VERIFY_KEYS.map((key) => [key, fromMetric(key)]),
);

/**
 * Resolve a verification entry by its legacy key OR by any alias of the same
 * canonical metric. Exact legacy keys are returned directly; everything else
 * is resolved through the canonical registry's alias index so a surfaced
 * metric can be deep-linked under any of its names.
 */
export function getMetricVerification(key: string): MetricVerification | undefined {
  const exact = METRIC_REGISTRY[key];
  if (exact) return exact;

  const metric = getMetric(key);
  if (!metric) return undefined;

  for (const verifyKey of VERIFY_KEYS) {
    const surfaced = getMetric(verifyKey);
    if (surfaced && surfaced.id === metric.id) return METRIC_REGISTRY[verifyKey];
  }
  return undefined;
}
