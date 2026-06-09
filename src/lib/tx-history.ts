// Persisted local transaction history for every write surface (mint, sale,
// approve). Survives reloads so users can verify their past transactions
// across sessions without re-querying the chain or losing the link if
// MetaMask drops the wallet activity tab.
//
// Storage shape: per-wallet keyed map under STORAGE_KEY. We cap entries
// per wallet to MAX_PER_WALLET to keep localStorage bounded.

export type TxStatus = "submitted" | "confirmed" | "failed";
export type TxSurface =
  | "first_signal_approve"
  | "first_signal_mint"
  | "patron_seal_approve"
  | "patron_seal_mint"
  | "live_purchase_approve"
  | "live_purchase_buy"
  | string;

export interface TxRecord {
  hash: `0x${string}`;
  account: `0x${string}`;
  chainId: number;
  surface: TxSurface;
  label: string;
  status: TxStatus;
  submittedAt: number; // epoch ms
  confirmedAt?: number;
  contract?: `0x${string}`;
  tokenId?: string;
}

export const STORAGE_KEY = "syndicate.tx.history.v1";
const MAX_PER_WALLET = 50;
const EVENT = "syndicate:tx-history-change";

type Store = Record<string, TxRecord[]>; // lowercased wallet => records (newest first)

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* quota exceeded — ignore */
  }
}

function keyFor(account: string): string {
  return account.toLowerCase();
}

export function recordTx(input: Omit<TxRecord, "submittedAt" | "status"> & { status?: TxStatus; submittedAt?: number }): TxRecord {
  const record: TxRecord = {
    status: input.status ?? "submitted",
    submittedAt: input.submittedAt ?? Date.now(),
    ...input,
    hash: input.hash.toLowerCase() as `0x${string}`,
    account: input.account.toLowerCase() as `0x${string}`,
  };
  const store = readStore();
  const k = keyFor(record.account);
  const existing = store[k] ?? [];
  // de-dupe by hash, keep newest values
  const filtered = existing.filter((r) => r.hash !== record.hash);
  store[k] = [record, ...filtered].slice(0, MAX_PER_WALLET);
  writeStore(store);
  return record;
}

export function updateTxStatus(hash: string, status: TxStatus, when: number = Date.now()): TxRecord | null {
  const lower = hash.toLowerCase();
  const store = readStore();
  let updated: TxRecord | null = null;
  for (const k of Object.keys(store)) {
    const list = store[k];
    const idx = list.findIndex((r) => r.hash === lower);
    if (idx >= 0) {
      const next: TxRecord = { ...list[idx], status };
      if (status === "confirmed" || status === "failed") next.confirmedAt = when;
      list[idx] = next;
      updated = next;
      store[k] = list;
      break;
    }
  }
  if (updated) writeStore(store);
  return updated;
}

export function listTxsForAccount(account: string | undefined | null): TxRecord[] {
  if (!account) return [];
  const store = readStore();
  return store[keyFor(account)] ?? [];
}

export function listAllTxs(): TxRecord[] {
  const store = readStore();
  return Object.values(store).flat().sort((a, b) => b.submittedAt - a.submittedAt);
}

export function clearTxHistory(account?: string) {
  const store = readStore();
  if (account) {
    delete store[keyFor(account)];
  } else {
    for (const k of Object.keys(store)) delete store[k];
  }
  writeStore(store);
}

/** Subscribe to in-tab + cross-tab updates. */
export function subscribeTxHistory(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => handler();
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) handler();
  };
  window.addEventListener(EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
