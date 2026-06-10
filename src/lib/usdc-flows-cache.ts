// Local persistence for the USDC treasury-flow scanner (P4e incremental
// indexing).
//
// Mirrors the canonical purchase-events / lp-events caches so a refetch resumes
// from a persisted cursor instead of replaying deploymentBlock→head for BOTH
// the inbound and outbound USDC Transfer scans every 60s.
//
// Hard rules (identical doctrine to the sibling caches):
//   • No fake data — only the real scan result is ever stored.
//   • No altered parsing / ordering — events are stored and restored as-is.
//   • SSR-safe — all storage access is guarded for `window`.
//   • Corrupt / version-mismatched / quota-failed cache degrades silently to
//     "no snapshot" (the scanner simply does a full scan, as before).
//
// Directional dedup: a self-transfer (from == to == wallet) emits ONE log that
// matches both the `to:wallet` and `from:wallet` filters, so the prior scanner
// produced TWO rows for it (one "in", one "out"). To preserve that output the
// merge keys on txHash:logIndex:DIRECTION, not txHash:logIndex alone — the only
// way this cache differs from the (non-directional) lp-events cache.
//
// bigint note: a USDC flow carries exactly ONE bigint field (blockNumber) which
// JSON cannot represent. It is stored as a string and rebuilt on load; every
// other field (direction / counterparty / amount) is already JSON-safe and
// round-trips untouched.

/**
 * Schema/version buster. Bump whenever the stored shape changes so old
 * snapshots are ignored rather than mis-read.
 */
export const USDC_FLOWS_CACHE_VERSION = "v1";

const KEY_PREFIX = "syn:usdc-flows";

/**
 * Minimal shape every USDC flow shares — the fields the cache validates and the
 * dedup identity. Concrete flow types (UsdcFlow) extend this with JSON-safe
 * fields (counterparty / amount) that pass through untouched.
 */
export type DirectionalScannedEvent = {
  direction: "in" | "out";
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

/**
 * Cache key carries the full identity of the scan it represents: schema
 * version + chainId + wallet + deployment (from) block. If any differ, the key
 * differs and a foreign snapshot can never be read. Wallet is lower-cased so a
 * checksummed and an all-lowercase address share one snapshot.
 */
export function usdcFlowsCacheKey(params: {
  chainId: number;
  wallet: string;
  fromBlock: bigint | string;
}): string {
  return [
    KEY_PREFIX,
    USDC_FLOWS_CACHE_VERSION,
    `chain-${params.chainId}`,
    params.wallet.toLowerCase(),
    `from-${String(params.fromBlock)}`,
  ].join(":");
}

export type UsdcFlowsSnapshot<T extends DirectionalScannedEvent> = {
  updatedAt: number;
  lastScannedBlock: bigint;
  events: T[];
};

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Canonical unique identity of a scanned flow: tx hash + log position + direction. */
export function usdcFlowKey(e: DirectionalScannedEvent): string {
  return `${e.txHash}:${e.logIndex}:${e.direction}`;
}

/**
 * Merge a cached flow list with a freshly scanned window. Dedupes by
 * `usdcFlowKey` — the re-scanned reorg overlap intentionally re-emits flows
 * already cached — preferring the freshly scanned copy on collision, and returns
 * newest-first using the EXACT comparator the scanner used inline, so callers
 * see identical ordering and values whether or not a cache existed.
 */
export function mergeUsdcFlows<T extends DirectionalScannedEvent>(prev: T[], next: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const e of prev) byKey.set(usdcFlowKey(e), e);
  for (const e of next) byKey.set(usdcFlowKey(e), e);
  const merged = [...byKey.values()];
  merged.sort((a, b) =>
    a.blockNumber === b.blockNumber ? b.logIndex - a.logIndex : b.blockNumber > a.blockNumber ? 1 : -1,
  );
  return merged;
}

/**
 * Pure serialize — bigint-safe. Preserves array order exactly (the list is
 * newest-first as produced by the merge; we never re-sort here).
 */
export function serializeUsdcFlows<T extends DirectionalScannedEvent>(
  events: T[],
  updatedAt: number,
  lastScannedBlock: bigint,
): string {
  return JSON.stringify({
    v: USDC_FLOWS_CACHE_VERSION,
    updatedAt,
    lastScannedBlock: lastScannedBlock.toString(),
    events: events.map((e) => ({ ...e, blockNumber: e.blockNumber.toString() })),
  });
}

/**
 * Pure deserialize — bigint-safe and defensive. Returns `undefined` (never
 * throws) for missing, malformed, or version-mismatched input. If any single
 * flow is structurally corrupt the whole snapshot is rejected, so callers never
 * receive a partially-decoded list.
 */
export function deserializeUsdcFlows<T extends DirectionalScannedEvent>(
  raw: string | null | undefined,
): UsdcFlowsSnapshot<T> | undefined {
  if (!raw) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  const o = parsed as Record<string, unknown>;
  if (o.v !== USDC_FLOWS_CACHE_VERSION) return undefined;
  if (!isFiniteNumber(o.updatedAt)) return undefined;
  if (typeof o.lastScannedBlock !== "string") return undefined;
  let lastScannedBlock: bigint;
  try {
    lastScannedBlock = BigInt(o.lastScannedBlock);
  } catch {
    return undefined;
  }
  if (lastScannedBlock < 0n) return undefined;
  if (!Array.isArray(o.events)) return undefined;

  const events: T[] = [];
  for (const item of o.events) {
    if (!item || typeof item !== "object") return undefined;
    const ev = item as Record<string, unknown>;
    if (ev.direction !== "in" && ev.direction !== "out") return undefined;
    if (typeof ev.txHash !== "string") return undefined;
    if (typeof ev.blockNumber !== "string") return undefined;
    if (!isFiniteNumber(ev.logIndex)) return undefined;
    let blockNumber: bigint;
    try {
      blockNumber = BigInt(ev.blockNumber);
    } catch {
      return undefined;
    }
    events.push({ ...ev, blockNumber } as unknown as T);
  }
  return { updatedAt: o.updatedAt, lastScannedBlock, events };
}

function getStorage(): Storage | undefined {
  try {
    if (typeof window === "undefined") return undefined;
    return window.localStorage;
  } catch {
    // Access to localStorage can throw (e.g. privacy mode / disabled cookies).
    return undefined;
  }
}

/** SSR- and corruption-safe load. */
export function loadUsdcFlowsSnapshot<T extends DirectionalScannedEvent>(key: string): UsdcFlowsSnapshot<T> | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return undefined;
  }
  return deserializeUsdcFlows<T>(raw);
}

/** SSR- and quota-safe save. Failures degrade silently (no persistence). */
export function saveUsdcFlowsSnapshot<T extends DirectionalScannedEvent>(
  key: string,
  events: T[],
  lastScannedBlock: bigint,
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, serializeUsdcFlows(events, Date.now(), lastScannedBlock));
  } catch {
    // Quota exceeded / storage disabled — degrade to no snapshot.
  }
}
