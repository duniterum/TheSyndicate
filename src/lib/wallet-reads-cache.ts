// Per-wallet, per-chain persistence for read-only multicall reads (P2).
//
// Goal: after holder identity appears instantly (P1), wallet-specific reads
// (artifact ownership, SYN/USDC balances) should also stop starting from zero
// on every visit. We persist the last-known read values to localStorage and
// seed them back into wagmi's own query cache, so the consuming hooks keep
// their exact return shapes — values just become available sooner.
//
// Mirrors purchase-events-cache (P1):
//   • Stores ONLY public on-chain facts (balances / ownership). No private data.
//   • bigint-safe (values stored as strings, undefined ⇄ null).
//   • SSR-safe (all storage access guarded for `window`) and quota-safe.
//   • Corrupt / version-mismatched / malformed cache → undefined (never throws).
//   • Restored values are tagged with their TRUE age by the caller so the query
//     reads as STALE → a background refresh fires and nothing is shown as LIVE.

/** Schema/version buster — bump when the stored shape changes. */
export const WALLET_READS_CACHE_VERSION = "v1";

const KEY_PREFIX = "syn:wallet-reads";

/**
 * Identity of a cached read set. `slots` encodes the contract address(es) +
 * function/ids in positional order, so two different read sets (or a different
 * id order) can never collide.
 */
export function walletReadsCacheKey(params: {
  scope: string;
  chainId: number;
  wallet: string;
  slots: string;
}): string {
  return [
    KEY_PREFIX,
    WALLET_READS_CACHE_VERSION,
    params.scope,
    `chain-${params.chainId}`,
    params.wallet.toLowerCase(),
    params.slots,
  ].join(":");
}

export type WalletReadsSnapshot = {
  updatedAt: number;
  wallet: string;
  /** Positional values aligned to the read set; undefined = no cached value. */
  values: (bigint | undefined)[];
};

type StoredSnapshot = {
  v: string;
  updatedAt: number;
  wallet: string;
  values: (string | null)[];
};

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Pure serialize — bigint-safe. Exported for testing without storage. */
export function serializeWalletReads(snap: WalletReadsSnapshot): string {
  const stored: StoredSnapshot = {
    v: WALLET_READS_CACHE_VERSION,
    updatedAt: snap.updatedAt,
    wallet: snap.wallet.toLowerCase(),
    values: snap.values.map((v) => (v === undefined ? null : v.toString())),
  };
  return JSON.stringify(stored);
}

/**
 * Pure deserialize — defensive. Returns undefined for missing / non-JSON /
 * version-mismatched / malformed input. Preserves value order exactly.
 */
export function deserializeWalletReads(raw: string | null | undefined): WalletReadsSnapshot | undefined {
  if (!raw) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  const o = parsed as Record<string, unknown>;
  if (o.v !== WALLET_READS_CACHE_VERSION) return undefined;
  if (!isFiniteNumber(o.updatedAt)) return undefined;
  if (typeof o.wallet !== "string") return undefined;
  if (!Array.isArray(o.values)) return undefined;

  const values: (bigint | undefined)[] = [];
  for (const item of o.values) {
    if (item === null) {
      values.push(undefined);
      continue;
    }
    if (typeof item !== "string") return undefined;
    let b: bigint;
    try {
      b = BigInt(item);
    } catch {
      return undefined;
    }
    values.push(b);
  }
  return { updatedAt: o.updatedAt, wallet: o.wallet, values };
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
export function loadWalletReadsSnapshot(key: string): WalletReadsSnapshot | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return undefined;
  }
  return deserializeWalletReads(raw);
}

/** SSR- and quota-safe save. Failures degrade silently (no persistence). */
export function saveWalletReadsSnapshot(key: string, snap: WalletReadsSnapshot): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, serializeWalletReads(snap));
  } catch {
    // Quota exceeded / storage disabled — degrade to no snapshot.
  }
}

// ─── wagmi useReadContracts (allowFailure: true) bridge ────────────────────
// These translate between wagmi's per-item result shape and our positional
// bigint slots, so a snapshot can be seeded straight into wagmi's query cache.

type ReadContractsItem =
  | { status: "success"; result: unknown }
  | { status: "failure"; error: Error };

/** Build a wagmi-shaped result array from cached slots (for setQueryData). */
export function slotsToReadContractsData(values: (bigint | undefined)[]): ReadContractsItem[] {
  return values.map((v) =>
    v === undefined
      ? { status: "failure", error: new Error("no cached value") }
      : { status: "success", result: v },
  );
}

/** Extract positional bigint slots from a wagmi result array. */
export function readContractsDataToSlots(data: readonly unknown[] | undefined): (bigint | undefined)[] {
  if (!data) return [];
  return data.map((r) => {
    const item = r as { status?: string; result?: unknown };
    return item?.status === "success" && typeof item.result === "bigint" ? item.result : undefined;
  });
}
