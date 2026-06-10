import { afterEach, describe, expect, it, vi } from "vitest";
import {
  WALLET_READS_CACHE_VERSION,
  deserializeWalletReads,
  loadWalletReadsSnapshot,
  readContractsDataToSlots,
  saveWalletReadsSnapshot,
  serializeWalletReads,
  slotsToReadContractsData,
  walletReadsCacheKey,
} from "../wallet-reads-cache";

const WALLET = "0xABCdef0000000000000000000000000000000001";

describe("walletReadsCacheKey", () => {
  it("includes version, scope, chain, lowercased wallet and slots", () => {
    const key = walletReadsCacheKey({
      scope: "archive-1155",
      chainId: 43114,
      wallet: WALLET,
      slots: "0xnft#1-3",
    });
    expect(key).toContain(WALLET_READS_CACHE_VERSION);
    expect(key).toContain("archive-1155");
    expect(key).toContain("chain-43114");
    expect(key).toContain(WALLET.toLowerCase());
    expect(key).not.toContain(WALLET); // mixed-case form must be normalized
    expect(key).toContain("0xnft#1-3");
  });

  it("is distinct across wallet, chain, scope and slots", () => {
    const base = { scope: "archive-1155", chainId: 43114, wallet: WALLET, slots: "0xnft#1-3" };
    const key = walletReadsCacheKey(base);
    expect(key).not.toBe(walletReadsCacheKey({ ...base, wallet: "0x00000000000000000000000000000000000000ff" }));
    expect(key).not.toBe(walletReadsCacheKey({ ...base, chainId: 43113 }));
    expect(key).not.toBe(walletReadsCacheKey({ ...base, scope: "erc20-balances" }));
    expect(key).not.toBe(walletReadsCacheKey({ ...base, slots: "0xnft#1-2" }));
  });
});

describe("serialize/deserialize", () => {
  it("round-trips bigints, preserves order, and maps undefined ⇄ null", () => {
    const snap = {
      updatedAt: 1_700_000_000_000,
      wallet: WALLET.toLowerCase(),
      values: [123456789012345678901234567890n, undefined, 0n],
    };
    const restored = deserializeWalletReads(serializeWalletReads(snap));
    expect(restored).toEqual(snap);
    // explicit order/identity assertions
    expect(restored?.values[0]).toBe(123456789012345678901234567890n);
    expect(restored?.values[1]).toBeUndefined();
    expect(restored?.values[2]).toBe(0n);
  });

  it("lowercases the wallet on serialize", () => {
    const json = serializeWalletReads({ updatedAt: 1, wallet: WALLET, values: [1n] });
    expect(JSON.parse(json).wallet).toBe(WALLET.toLowerCase());
  });

  it("rejects corrupt, version-mismatched, or malformed payloads", () => {
    expect(deserializeWalletReads(undefined)).toBeUndefined();
    expect(deserializeWalletReads(null)).toBeUndefined();
    expect(deserializeWalletReads("")).toBeUndefined();
    expect(deserializeWalletReads("{not json")).toBeUndefined();
    expect(deserializeWalletReads(JSON.stringify({ v: "v0", updatedAt: 1, wallet: "0x", values: [] }))).toBeUndefined();
    expect(
      deserializeWalletReads(JSON.stringify({ v: WALLET_READS_CACHE_VERSION, updatedAt: "nope", wallet: "0x", values: [] })),
    ).toBeUndefined();
    expect(
      deserializeWalletReads(JSON.stringify({ v: WALLET_READS_CACHE_VERSION, updatedAt: 1, wallet: "0x", values: "x" })),
    ).toBeUndefined();
    // non-string, non-null slot
    expect(
      deserializeWalletReads(JSON.stringify({ v: WALLET_READS_CACHE_VERSION, updatedAt: 1, wallet: "0x", values: [42] })),
    ).toBeUndefined();
    // unparseable bigint string
    expect(
      deserializeWalletReads(JSON.stringify({ v: WALLET_READS_CACHE_VERSION, updatedAt: 1, wallet: "0x", values: ["xyz"] })),
    ).toBeUndefined();
  });
});

describe("wagmi result bridge", () => {
  it("rebuilds a wagmi-shaped array from slots (success/failure) preserving order", () => {
    const data = slotsToReadContractsData([5n, undefined, 0n]);
    expect(data.map((d) => d.status)).toEqual(["success", "failure", "success"]);
    expect((data[0] as { result: bigint }).result).toBe(5n);
    expect((data[2] as { result: bigint }).result).toBe(0n);
  });

  it("extracts positional bigint slots from a wagmi result array", () => {
    const slots = readContractsDataToSlots([
      { status: "success", result: 7n },
      { status: "failure", error: new Error("rpc") },
      { status: "success", result: 0n },
    ]);
    expect(slots).toEqual([7n, undefined, 0n]);
  });

  it("round-trips token-id balances through slots → wagmi → slots in order", () => {
    // archive [1, 3] ownership: owns id 1 (qty 2), owns id 3 (qty 1)
    const original = [2n, 1n];
    const back = readContractsDataToSlots(slotsToReadContractsData(original));
    expect(back).toEqual(original);
  });

  it("ignores non-bigint results defensively", () => {
    const slots = readContractsDataToSlots([{ status: "success", result: "10" }]);
    expect(slots).toEqual([undefined]);
  });
});

describe("storage (SSR + persistence)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not access localStorage when window is undefined (SSR)", () => {
    // Default vitest NODE env has no window: load returns undefined, save no-throws.
    expect(typeof window).toBe("undefined");
    const key = walletReadsCacheKey({ scope: "archive-1155", chainId: 1, wallet: WALLET, slots: "s" });
    expect(loadWalletReadsSnapshot(key)).toBeUndefined();
    expect(() => saveWalletReadsSnapshot(key, { updatedAt: 1, wallet: WALLET, values: [1n] })).not.toThrow();
  });

  it("persists and restores through a stubbed window.localStorage", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
    });
    const key = walletReadsCacheKey({ scope: "erc20-balances", chainId: 43114, wallet: WALLET, slots: "s" });
    saveWalletReadsSnapshot(key, { updatedAt: 42, wallet: WALLET, values: [10n, 20n, undefined] });
    const restored = loadWalletReadsSnapshot(key);
    expect(restored?.updatedAt).toBe(42);
    expect(restored?.wallet).toBe(WALLET.toLowerCase());
    expect(restored?.values).toEqual([10n, 20n, undefined]);
  });

  it("swallows quota / storage errors on save", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceeded");
        },
        removeItem: () => {},
      },
    });
    const key = walletReadsCacheKey({ scope: "archive-1155", chainId: 1, wallet: WALLET, slots: "s" });
    expect(() => saveWalletReadsSnapshot(key, { updatedAt: 1, wallet: WALLET, values: [1n] })).not.toThrow();
  });

  it("returns undefined for a corrupt stored entry", () => {
    const store = new Map<string, string>([["bad", "{broken"]]);
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: () => {},
      },
    });
    expect(loadWalletReadsSnapshot("bad")).toBeUndefined();
  });
});
