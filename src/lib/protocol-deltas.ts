// Canonical protocol-wide "what changed" delta set.
//
// Two surfaces tell the "since your last visit" story over the SAME four
// protocol-wide metrics, but from different sources and with different
// presentation:
//   • SinceLastVisitStory  — backend httpOnly cookie, 1-line cockpit strip
//   • SinceYourLastVisit   — localStorage, Home/Activity grid + milestones
//
// Before this module each component re-defined an identical diff() and
// re-enumerated the same metric set. This is the single source of that
// definition + the undefined-safe diff math. It deliberately does NOT own
// inclusion rules, thresholds, formatting, copy, source badges, or milestone
// tracking — each surface keeps its own presentation so visible behaviour is
// unchanged.

/** The canonical protocol-wide metrics compared across visits. */
export const PROTOCOL_DELTA_METRICS = [
  "members",
  "usdcRaised",
  "purchases",
  "vaultUsdc",
] as const;

export type ProtocolDeltaMetric = (typeof PROTOCOL_DELTA_METRICS)[number];

/** A snapshot of the canonical protocol-wide metrics at a point in time. */
export type ProtocolDeltaSnapshot = Partial<Record<ProtocolDeltaMetric, number>>;

/** Per-metric delta (current − previous); undefined when either side is missing. */
export type ProtocolDeltas = Partial<Record<ProtocolDeltaMetric, number>>;

function diff(now: number | undefined, then: number | undefined): number | undefined {
  if (now === undefined || then === undefined) return undefined;
  return now - then;
}

/**
 * Compute the undefined-safe delta (current − previous) for each canonical
 * protocol-wide metric. A metric is omitted as `undefined` when either side is
 * missing. Inclusion, thresholds, and formatting are the caller's concern.
 */
export function computeProtocolDeltas(
  current: ProtocolDeltaSnapshot,
  previous: ProtocolDeltaSnapshot,
): ProtocolDeltas {
  return {
    members: diff(current.members, previous.members),
    usdcRaised: diff(current.usdcRaised, previous.usdcRaised),
    purchases: diff(current.purchases, previous.purchases),
    vaultUsdc: diff(current.vaultUsdc, previous.vaultUsdc),
  };
}
