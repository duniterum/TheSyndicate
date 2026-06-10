// Local persistence for the canonical purchase-events scan (P1).
//
// Goal: a member revisiting the site should not re-discover known on-chain
// identity from zero. We persist the FULL canonical (newest-first) purchase
// list from `useLivePurchaseEvents` to localStorage so a cold reload can
// hydrate the holder index instantly, then refresh in the background.
//
// Hard rules:
//   • No fake data — only the real scan result is ever stored.
//   • No altered parsing / ordering — the array is stored and restored as-is.
//   • SSR-safe — all storage access is guarded for `window`.
//   • Corrupt / version-mismatched / quota-failed cache degrades silently to
//     "no snapshot" (the app simply scans from zero, as before).
//
// bigint note: PurchaseEvent carries two bigint fields (purchaseId,
// blockNumber) which JSON cannot represent. We store them as strings and
// rebuild the bigints on load, validating every field.

import type { PurchaseEvent } from "./activity-hooks";

/**
 * Schema/version buster. Bump this whenever the stored shape changes so old
 * snapshots are ignored rather than mis-read.
 */
export const PURCHASE_EVENTS_CACHE_VERSION = "v2";

const KEY_PREFIX = "syn:purchase-events";

/**
 * Cache key carries the full identity of the scan it represents: schema
 * version + chainId + sale contract address + deployment (from) block. If any
 * of these differ, the key differs and a foreign snapshot can never be read.
 */
export function purchaseEventsCacheKey(params: {
  chainId: number;
  sale: string;
  fromBlock: bigint | string;
}): string {
  return [
    KEY_PREFIX,
    PURCHASE_EVENTS_CACHE_VERSION,
    `chain-${params.chainId}`,
    params.sale.toLowerCase(),
    `from-${String(params.fromBlock)}`,
  ].join(":");
}

type StoredEvent = {
  buyer: string;
  purchaseId: string;
  usdcAmount: number;
  synAmount: number;
  vaultAmount: number;
  liquidityAmount: number;
  operationsAmount: number;
  blockNumber: string;
  txHash: string;
  logIndex: number;
};

type StoredSnapshot = {
  v: string;
  updatedAt: number;
  // Highest block this snapshot's scan has covered (P4a incremental cursor).
  // Stored as a string because JSON cannot represent bigint.
  lastScannedBlock: string;
  events: StoredEvent[];
};

export type PurchaseEventsSnapshot = {
  updatedAt: number;
  lastScannedBlock: bigint;
  events: PurchaseEvent[];
};

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function toStored(e: PurchaseEvent): StoredEvent {
  return {
    buyer: e.buyer,
    purchaseId: e.purchaseId.toString(),
    usdcAmount: e.usdcAmount,
    synAmount: e.synAmount,
    vaultAmount: e.vaultAmount,
    liquidityAmount: e.liquidityAmount,
    operationsAmount: e.operationsAmount,
    blockNumber: e.blockNumber.toString(),
    txHash: e.txHash,
    logIndex: e.logIndex,
  };
}

function fromStored(raw: unknown): PurchaseEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.buyer !== "string" || typeof o.txHash !== "string") return null;
  if (typeof o.purchaseId !== "string" || typeof o.blockNumber !== "string") return null;
  if (
    !isFiniteNumber(o.usdcAmount) ||
    !isFiniteNumber(o.synAmount) ||
    !isFiniteNumber(o.vaultAmount) ||
    !isFiniteNumber(o.liquidityAmount) ||
    !isFiniteNumber(o.operationsAmount) ||
    !isFiniteNumber(o.logIndex)
  ) {
    return null;
  }
  let purchaseId: bigint;
  let blockNumber: bigint;
  try {
    purchaseId = BigInt(o.purchaseId);
    blockNumber = BigInt(o.blockNumber);
  } catch {
    return null;
  }
  return {
    buyer: o.buyer,
    purchaseId,
    usdcAmount: o.usdcAmount,
    synAmount: o.synAmount,
    vaultAmount: o.vaultAmount,
    liquidityAmount: o.liquidityAmount,
    operationsAmount: o.operationsAmount,
    blockNumber,
    txHash: o.txHash,
    logIndex: o.logIndex,
  };
}

/**
 * Pure serialize — bigint-safe. Exported for unit testing without storage.
 * Preserves the array order exactly (the list is newest-first as produced by
 * the scan; we never re-sort here).
 */
export function serializePurchaseEvents(
  events: PurchaseEvent[],
  updatedAt: number,
  lastScannedBlock: bigint,
): string {
  const snap: StoredSnapshot = {
    v: PURCHASE_EVENTS_CACHE_VERSION,
    updatedAt,
    lastScannedBlock: lastScannedBlock.toString(),
    events: events.map(toStored),
  };
  return JSON.stringify(snap);
}

/**
 * Pure deserialize — bigint-safe and defensive. Returns `undefined` (never
 * throws) for missing, malformed, or version-mismatched input. If any single
 * event is corrupt the whole snapshot is rejected, so callers never receive a
 * partially-decoded list.
 */
export function deserializePurchaseEvents(raw: string | null | undefined): PurchaseEventsSnapshot | undefined {
  if (!raw) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  const o = parsed as Record<string, unknown>;
  if (o.v !== PURCHASE_EVENTS_CACHE_VERSION) return undefined;
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

  const events: PurchaseEvent[] = [];
  for (const item of o.events) {
    const ev = fromStored(item);
    if (!ev) return undefined;
    events.push(ev);
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
export function loadPurchaseEventsSnapshot(key: string): PurchaseEventsSnapshot | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return undefined;
  }
  return deserializePurchaseEvents(raw);
}

/** SSR- and quota-safe save. Failures degrade silently (no persistence). */
export function savePurchaseEventsSnapshot(
  key: string,
  events: PurchaseEvent[],
  lastScannedBlock: bigint,
): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, serializePurchaseEvents(events, Date.now(), lastScannedBlock));
  } catch {
    // Quota exceeded / storage disabled — degrade to no snapshot.
  }
}
