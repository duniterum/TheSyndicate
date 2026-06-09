import { describe, expect, it, beforeEach } from "vitest";
import {
  recordTx,
  updateTxStatus,
  listTxsForAccount,
  listAllTxs,
  clearTxHistory,
  STORAGE_KEY,
} from "../tx-history";

// Minimal localStorage shim for node
class MemStorage {
  store: Record<string, string> = {};
  getItem(k: string) { return this.store[k] ?? null; }
  setItem(k: string, v: string) { this.store[k] = v; }
  removeItem(k: string) { delete this.store[k]; }
  clear() { this.store = {}; }
}

if (typeof window === "undefined") {
  (globalThis as any).window = {
    localStorage: new MemStorage(),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    CustomEvent: class { constructor(public type: string, public init?: any) {} },
  };
  (globalThis as any).CustomEvent = (globalThis as any).window.CustomEvent;
}

const A = "0xAAAAaaaaAAAAaaaaAAAAaaaaAAAAaaaaAAAAaaaa" as `0x${string}`;
const B = "0xBBBBbbbbBBBBbbbbBBBBbbbbBBBBbbbbBBBBbbbb" as `0x${string}`;
const H1 = "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`;
const H2 = "0x2222222222222222222222222222222222222222222222222222222222222222" as `0x${string}`;

beforeEach(() => {
  (window.localStorage as any).clear?.();
  window.localStorage.removeItem(STORAGE_KEY);
});

describe("tx-history", () => {
  it("records, lists per-wallet, and lowercases addresses", () => {
    recordTx({ hash: H1, account: A, chainId: 43114, surface: "first_signal_mint", label: "First Signal mint" });
    const list = listTxsForAccount(A);
    expect(list).toHaveLength(1);
    expect(list[0].account).toBe(A.toLowerCase());
    expect(list[0].status).toBe("submitted");
  });

  it("dedupes by hash and keeps newest write", () => {
    recordTx({ hash: H1, account: A, chainId: 43114, surface: "x", label: "v1" });
    recordTx({ hash: H1, account: A, chainId: 43114, surface: "x", label: "v2" });
    const list = listTxsForAccount(A);
    expect(list).toHaveLength(1);
    expect(list[0].label).toBe("v2");
  });

  it("isolates txs per wallet", () => {
    recordTx({ hash: H1, account: A, chainId: 43114, surface: "x", label: "a" });
    recordTx({ hash: H2, account: B, chainId: 43114, surface: "x", label: "b" });
    expect(listTxsForAccount(A)).toHaveLength(1);
    expect(listTxsForAccount(B)).toHaveLength(1);
    expect(listAllTxs()).toHaveLength(2);
  });

  it("updates status to confirmed and stamps confirmedAt", () => {
    recordTx({ hash: H1, account: A, chainId: 43114, surface: "x", label: "a" });
    const updated = updateTxStatus(H1, "confirmed", 1234);
    expect(updated?.status).toBe("confirmed");
    expect(updated?.confirmedAt).toBe(1234);
  });

  it("clears per-wallet and global", () => {
    recordTx({ hash: H1, account: A, chainId: 43114, surface: "x", label: "a" });
    recordTx({ hash: H2, account: B, chainId: 43114, surface: "x", label: "b" });
    clearTxHistory(A);
    expect(listTxsForAccount(A)).toHaveLength(0);
    expect(listTxsForAccount(B)).toHaveLength(1);
    clearTxHistory();
    expect(listAllTxs()).toHaveLength(0);
  });
});
