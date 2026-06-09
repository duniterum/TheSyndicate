// E2E-style wallet switch simulation. Drives the full freshness guard the
// same way a live MetaMask account switch does:
//   1. UI holds wallet A; injected provider reports A → assertFreshWallet ok.
//   2. User switches MetaMask to B → accountsChanged fires.
//   3. UI has not yet re-rendered → assertFreshWallet must block the write
//      with "wallet-switched" and produce the user-facing message.
//   4. After UI catches up to B, assertFreshWallet ok again.
//
// This is the regression net that prevents re-introducing the bug we hit on
// both First Signal AND Patron Seal sales.

import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  assertFreshWallet,
  walletFreshnessMessage,
  subscribeInjectedAccountsChanged,
} from "../wallet-freshness";

const A = "0x1111111111111111111111111111111111111111";
const B = "0x2222222222222222222222222222222222222222";

type Handler = (...args: unknown[]) => void;

function fakeProvider() {
  let accounts: string[] = [A];
  const listeners: Record<string, Handler[]> = {};
  const provider = {
    request: vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_accounts") return accounts;
      return null;
    }),
    on: (event: string, handler: Handler) => {
      (listeners[event] ||= []).push(handler);
    },
    removeListener: (event: string, handler: Handler) => {
      listeners[event] = (listeners[event] || []).filter((h) => h !== handler);
    },
    _set(next: string[]) {
      accounts = next;
      (listeners["accountsChanged"] || []).forEach((h) => h(next));
    },
  };
  return provider;
}

beforeEach(() => {
  if (typeof (globalThis as any).window === "undefined") {
    (globalThis as any).window = {};
  }
  delete (window as any).ethereum;
});

describe("E2E wallet switch", () => {
  it("blocks a write that would have been signed by the new account while UI still shows the old one", async () => {
    const eth = fakeProvider();
    (window as any).ethereum = eth;

    // UI thinks the user is on A — first write is fine.
    const r1 = await assertFreshWallet(A);
    expect(r1.ok).toBe(true);

    // User switches MetaMask to B. UI has NOT re-rendered yet.
    eth._set([B]);

    const r2 = await assertFreshWallet(A);
    expect(r2.ok).toBe(false);
    expect((r2 as any).code).toBe("wallet-switched");
    expect((r2 as any).actual).toBe(B);
    expect(walletFreshnessMessage(r2)).toMatch(/different wallet/i);

    // Once UI catches up to B (Wagmi reconnect + cache invalidation), the
    // next write passes again. This is the exact path WalletAccountSynchronizer
    // enables in production.
    const r3 = await assertFreshWallet(B);
    expect(r3.ok).toBe(true);
  });

  it("subscribeInjectedAccountsChanged delivers the new accounts to the app", async () => {
    const eth = fakeProvider();
    (window as any).ethereum = eth;

    const seen: string[][] = [];
    const unsub = subscribeInjectedAccountsChanged((accs) => seen.push(accs));

    eth._set([B]);
    eth._set([]);

    expect(seen).toEqual([[B], []]);
    unsub();
    eth._set([A]);
    expect(seen).toEqual([[B], []]);
  });

  it("blocks when MetaMask exposes zero accounts (locked / disconnected)", async () => {
    const eth = fakeProvider();
    eth._set([]);
    (window as any).ethereum = eth;

    const r = await assertFreshWallet(A);
    expect(r.ok).toBe(false);
    expect((r as any).code).toBe("wallet-unavailable");
  });

  it("blocks when no injected provider exists at all", async () => {
    const r = await assertFreshWallet(A);
    expect(r.ok).toBe(false);
    expect((r as any).code).toBe("no-injected-provider");
  });
});
