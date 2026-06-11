// Local persistence for the SYN burn scanner (incremental indexing).
//
// Models usdc-flows-cache / lp-events-cache: a refetch resumes from a persisted
// cursor instead of replaying SALE_DEPLOYMENT_BLOCK→head every 60s. Burns are
// single-directional (always SYN → the dead address), so the dedup identity is
// the non-directional txHash:logIndex (same as the LP caches).
//
// Hard rules (identical doctrine to the sibling caches):
//   • No fake data — only the real scan result is ever stored.
//   • No altered parsing / ordering — events are stored and restored as-is.
//   • SSR-safe — all storage access is guarded for `window`.
//   • Corrupt / version-mismatched / quota-failed cache degrades silently to
//     "no snapshot" (the scanner simply does a full scan, as before).
//
// bigint note: a burn carries exactly ONE bigint field (blockNumber) which JSON
// cannot represent. It is stored as a string and rebuilt on load; every other
// field (sender / amountSyn / isFounder) is JSON-safe and round-trips untouched.
// The derived proofOfFireNumber is NOT persisted — it is re-assigned after merge
// so the number always reflects the full, gapless ordering.

/**
 * Schema/version buster. Bump whenever the stored shape changes so old
 * snapshots are ignored rather than mis-read.
 */
export const SYN_BURN_EVENTS_CACHE_VERSION = "v1";

const KEY_PREFIX = "syn:burn-events";

/**
 * Minimal shape every scanned burn shares — the fields the cache validates and
 * the only bigint it (de)serialises. Concrete burn types extend this with
 * JSON-safe fields (sender / amountSyn / isFounder) that pass through untouched.
 */
export type ScannedBurnEvent = {
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

/**
 * Cache key carries the full identity of the scan it represents: schema
 * version + chainId + SYN token + burn (to) address + deployment (from) block.
 * If any differ, the key differs and a foreign snapshot can never be read.
 */
export function synBurnEventsCacheKey(params: {
  chainId: number;
  token: string;
  burnAddress: string;
  fromBlock: bigint | string;
}): string {
  return [
    KEY_PREFIX,
    SYN_BURN_EVENTS_CACHE_VERSION,
    `chain-${params.chainId}`,
    params.token.toLowerCase(),
    `to-${params.burnAddress.toLowerCase()}`,
    `from-${String(params.fromBlock)}`,
  ].join(":");
}

export type SynBurnSnapshot<T extends ScannedBurnEvent> = {
  updatedAt: number;
  lastScannedBlock: bigint;
  events: T[];
};

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Canonical unique identity of a scanned burn: its tx hash + log position. */
export function synBurnEventKey(e: ScannedBurnEvent): string {
  return `${e.txHash}:${e.logIndex}`;
}

/**
 * Merge a cached burn list with a freshly scanned window. Dedupes by
 * `synBurnEventKey` — the re-scanned reorg overlap intentionally re-emits burns
 * already cached — preferring the freshly scanned copy on collision, and returns
 * newest-first using the same comparator as the sibling scanners.
 */
export function mergeSynBurnEvents<T extends ScannedBurnEvent>(prev: T[], next: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const e of prev) byKey.set(synBurnEventKey(e), e);
  for (const e of next) byKey.set(synBurnEventKey(e), e);
  const merged = [...byKey.values()];
  merged.sort((a, b) =>
    a.blockNumber === b.blockNumber ? b.logIndex - a.logIndex : b.blockNumber > a.blockNumber ? 1 : -1,
  );
  return merged;
}

/** Pure serialize — bigint-safe. Preserves array order exactly. */
export function serializeSynBurnEvents<T extends ScannedBurnEvent>(
  events: T[],
  updatedAt: number,
  lastScannedBlock: bigint,
): string {
  return JSON.stringify({
    v: SYN_BURN_EVENTS_CACHE_VERSION,
    updatedAt,
    lastScannedBlock: lastScannedBlock.toString(),
    events: events.map((e) => ({ ...e, blockNumber: e.blockNumber.toString() })),
  });
}

/**
 * Pure deserialize — bigint-safe and defensive. Returns `undefined` (never
 * throws) for missing, malformed, or version-mismatched input. If any single
 * burn is structurally corrupt the whole snapshot is rejected.
 */
export function deserializeSynBurnEvents<T extends ScannedBurnEvent>(
  raw: string | null | undefined,
): SynBurnSnapshot<T> | undefined {
  if (!raw) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  const o = parsed as Record<string, unknown>;
  if (o.v !== SYN_BURN_EVENTS_CACHE_VERSION) return undefined;
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
    return undefined;
  }
}

/** SSR- and corruption-safe load. */
export function loadSynBurnSnapshot<T extends ScannedBurnEvent>(key: string): SynBurnSnapshot<T> | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return undefined;
  }
  return deserializeSynBurnEvents<T>(raw);
}

/** SSR- and quota-safe save. Failures degrade silently (no persistence). */
export function saveSynBurnSnapshot<T extends ScannedBurnEvent>(
  key: string,
  events: T[],
  lastScannedBlock: bigint,
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, serializeSynBurnEvents(events, Date.now(), lastScannedBlock));
  } catch {
    // Quota exceeded / storage disabled — degrade to no snapshot.
  }
}
