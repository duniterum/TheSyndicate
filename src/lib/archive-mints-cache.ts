// Local persistence for the Archive1155 mint scanner (P4f incremental
// indexing).
//
// Mirrors the canonical purchase / lp / usdc-flow caches so a refetch resumes
// from a persisted cursor instead of re-walking the whole ~lookback span of
// TransferSingle-from-0x0 logs every 60s.
//
// Sliding-window note: unlike the deployment-anchored scanners, the archive
// rail shows the most-recent ~lookback blocks, a window whose floor advances
// with the tip. This cache stores the cursor + the events currently inside the
// window; the hook drops anything that has aged below the floor before display
// and before persisting, so the cache stays bounded and the output matches the
// prior fixed [from, tip] scan exactly.
//
// Hard rules (identical doctrine to the sibling caches):
//   • No fake data — only the real scan result is ever stored.
//   • No altered parsing / ordering — events are stored and restored as-is.
//   • SSR-safe — all storage access is guarded for `window`.
//   • Corrupt / version-mismatched / quota-failed cache degrades silently to
//     "no snapshot" (the scanner simply does a full window scan, as before).
//
// bigint note: a mint event carries exactly ONE bigint field (blockNumber)
// which JSON cannot represent. It is stored as a string and rebuilt on load;
// every other field (to / tokenId / value) is already JSON-safe and round-trips
// untouched.

/**
 * Schema/version buster. Bump whenever the stored shape changes so old
 * snapshots are ignored rather than mis-read.
 */
export const ARCHIVE_MINTS_CACHE_VERSION = "v1";

const KEY_PREFIX = "syn:archive-mints";

/**
 * Minimal shape every mint shares — the fields the cache validates and the only
 * bigint it has to (de)serialise. ArchiveMintEvent extends this with JSON-safe
 * number/string fields (to / tokenId / value) that pass through untouched.
 */
export type ScannedMint = {
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

/**
 * Cache key carries the full identity of the scan it represents: schema
 * version + chainId + Archive1155 address + lookback span + id filter. If any
 * differ, the key differs and a foreign snapshot can never be read. The id list
 * is sorted so different orderings of the same filter share one snapshot.
 */
export function archiveMintsCacheKey(params: {
  chainId: number;
  archive: string;
  lookback: bigint | string;
  ids?: readonly number[] | null;
}): string {
  const idsPart =
    params.ids && params.ids.length
      ? [...params.ids].map(Number).sort((a, b) => a - b).join("-")
      : "all";
  return [
    KEY_PREFIX,
    ARCHIVE_MINTS_CACHE_VERSION,
    `chain-${params.chainId}`,
    params.archive.toLowerCase(),
    `lookback-${String(params.lookback)}`,
    `ids-${idsPart}`,
  ].join(":");
}

export type ArchiveMintsSnapshot<T extends ScannedMint> = {
  updatedAt: number;
  lastScannedBlock: bigint;
  events: T[];
};

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Canonical unique identity of a scanned mint: its tx hash + log position. */
export function scannedMintKey(e: ScannedMint): string {
  return `${e.txHash}:${e.logIndex}`;
}

/**
 * Merge a cached mint list with a freshly scanned window. Dedupes by
 * `scannedMintKey` — the re-scanned reorg overlap intentionally re-emits mints
 * already cached — preferring the freshly scanned copy on collision, and returns
 * newest-first using the EXACT comparator the scanner used inline, so callers
 * see identical ordering and values whether or not a cache existed.
 */
export function mergeArchiveMints<T extends ScannedMint>(prev: T[], next: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const e of prev) byKey.set(scannedMintKey(e), e);
  for (const e of next) byKey.set(scannedMintKey(e), e);
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
export function serializeArchiveMints<T extends ScannedMint>(
  events: T[],
  updatedAt: number,
  lastScannedBlock: bigint,
): string {
  return JSON.stringify({
    v: ARCHIVE_MINTS_CACHE_VERSION,
    updatedAt,
    lastScannedBlock: lastScannedBlock.toString(),
    events: events.map((e) => ({ ...e, blockNumber: e.blockNumber.toString() })),
  });
}

/**
 * Pure deserialize — bigint-safe and defensive. Returns `undefined` (never
 * throws) for missing, malformed, or version-mismatched input. If any single
 * mint is structurally corrupt the whole snapshot is rejected, so callers never
 * receive a partially-decoded list.
 */
export function deserializeArchiveMints<T extends ScannedMint>(
  raw: string | null | undefined,
): ArchiveMintsSnapshot<T> | undefined {
  if (!raw) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  const o = parsed as Record<string, unknown>;
  if (o.v !== ARCHIVE_MINTS_CACHE_VERSION) return undefined;
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
export function loadArchiveMintsSnapshot<T extends ScannedMint>(key: string): ArchiveMintsSnapshot<T> | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return undefined;
  }
  return deserializeArchiveMints<T>(raw);
}

/** SSR- and quota-safe save. Failures degrade silently (no persistence). */
export function saveArchiveMintsSnapshot<T extends ScannedMint>(
  key: string,
  events: T[],
  lastScannedBlock: bigint,
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, serializeArchiveMints(events, Date.now(), lastScannedBlock));
  } catch {
    // Quota exceeded / storage disabled — degrade to no snapshot.
  }
}
