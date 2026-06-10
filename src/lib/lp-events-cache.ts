// Local persistence for the LP event scanners (P4b incremental indexing).
//
// Generalises the canonical purchase-events cache to the LP swap and LP
// liquidity scanners so a refetch resumes from a persisted cursor instead of
// replaying deploymentBlock→head every time.
//
// Hard rules (identical doctrine to purchase-events-cache):
//   • No fake data — only the real scan result is ever stored.
//   • No altered parsing / ordering — events are stored and restored as-is.
//   • SSR-safe — all storage access is guarded for `window`.
//   • Corrupt / version-mismatched / quota-failed cache degrades silently to
//     "no snapshot" (the scanner simply does a full scan, as before).
//
// bigint note: LP events carry exactly ONE bigint field (blockNumber) which
// JSON cannot represent. It is stored as a string and rebuilt on load; every
// other field of an LP event is already JSON-safe (number / string), so the
// generic store round-trips the whole record without altering any value.

/**
 * Schema/version buster. Bump whenever the stored shape changes so old
 * snapshots are ignored rather than mis-read.
 */
export const LP_EVENTS_CACHE_VERSION = "v1";

const KEY_PREFIX = "syn:lp-events";

/**
 * Minimal shape every scanned event shares — the fields the cache validates
 * and the only bigint it has to (de)serialise. Concrete event types (LpSwap,
 * LpLiquidityEvent) extend this with JSON-safe number/string fields that pass
 * through untouched.
 */
export type ScannedEvent = {
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

/**
 * Cache key carries the full identity of the scan it represents: schema
 * version + chainId + pair address + event kind + deployment (from) block. If
 * any differ, the key differs and a foreign snapshot can never be read.
 */
export function lpEventsCacheKey(params: {
  chainId: number;
  pair: string;
  kind: "swaps" | "liquidity";
  fromBlock: bigint | string;
}): string {
  return [
    KEY_PREFIX,
    LP_EVENTS_CACHE_VERSION,
    `chain-${params.chainId}`,
    params.pair.toLowerCase(),
    params.kind,
    `from-${String(params.fromBlock)}`,
  ].join(":");
}

export type LpEventsSnapshot<T extends ScannedEvent> = {
  updatedAt: number;
  lastScannedBlock: bigint;
  events: T[];
};

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Canonical unique identity of a scanned log: its tx hash + log position. */
export function scannedEventKey(e: ScannedEvent): string {
  return `${e.txHash}:${e.logIndex}`;
}

/**
 * Merge a cached event list with a freshly scanned window. Dedupes by
 * `scannedEventKey` — the re-scanned reorg overlap intentionally re-emits
 * events already cached — preferring the freshly scanned copy on collision, and
 * returns newest-first using the EXACT comparator the LP scanners used inline,
 * so callers see identical ordering and values whether or not a cache existed.
 */
export function mergeScannedEvents<T extends ScannedEvent>(prev: T[], next: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const e of prev) byKey.set(scannedEventKey(e), e);
  for (const e of next) byKey.set(scannedEventKey(e), e);
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
export function serializeLpEvents<T extends ScannedEvent>(
  events: T[],
  updatedAt: number,
  lastScannedBlock: bigint,
): string {
  return JSON.stringify({
    v: LP_EVENTS_CACHE_VERSION,
    updatedAt,
    lastScannedBlock: lastScannedBlock.toString(),
    events: events.map((e) => ({ ...e, blockNumber: e.blockNumber.toString() })),
  });
}

/**
 * Pure deserialize — bigint-safe and defensive. Returns `undefined` (never
 * throws) for missing, malformed, or version-mismatched input. If any single
 * event is structurally corrupt the whole snapshot is rejected, so callers
 * never receive a partially-decoded list.
 */
export function deserializeLpEvents<T extends ScannedEvent>(
  raw: string | null | undefined,
): LpEventsSnapshot<T> | undefined {
  if (!raw) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  const o = parsed as Record<string, unknown>;
  if (o.v !== LP_EVENTS_CACHE_VERSION) return undefined;
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
export function loadLpEventsSnapshot<T extends ScannedEvent>(key: string): LpEventsSnapshot<T> | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return undefined;
  }
  return deserializeLpEvents<T>(raw);
}

/** SSR- and quota-safe save. Failures degrade silently (no persistence). */
export function saveLpEventsSnapshot<T extends ScannedEvent>(
  key: string,
  events: T[],
  lastScannedBlock: bigint,
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, serializeLpEvents(events, Date.now(), lastScannedBlock));
  } catch {
    // Quota exceeded / storage disabled — degrade to no snapshot.
  }
}
