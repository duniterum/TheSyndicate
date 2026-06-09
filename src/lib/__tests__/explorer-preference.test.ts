// Persistence + ordering guarantees for the explorer preference.
// Stubs a minimal `window.localStorage` so the suite runs under the node
// vitest environment (no jsdom dependency required).
import { beforeAll } from "vitest";

beforeAll(() => {
  if (typeof globalThis.window === "undefined") {
    const store = new Map<string, string>();
    const localStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size; },
    };
    // @ts-expect-error — test-only window stub
    globalThis.window = {
      localStorage,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
  }
});
import { describe, it, expect, beforeEach } from "vitest";
import {
  STORAGE_KEY,
  DEFAULT_EXPLORER,
  readExplorerPreference,
  writeExplorerPreference,
  applyPreferenceOrder,
} from "../explorer-preference";
import { txUrls } from "../chain-registry";

const HASH = "0x215f9aabcdad17be77a4ee8b827fa8fbf525d1a8a6907fdc854b38e22a62c6be";

describe("explorer-preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to snowtrace when nothing is stored", () => {
    expect(readExplorerPreference()).toBe(DEFAULT_EXPLORER);
    expect(DEFAULT_EXPLORER).toBe("snowtrace");
  });

  it("persists to localStorage and reads back", () => {
    writeExplorerPreference("avascan");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("avascan");
    expect(readExplorerPreference()).toBe("avascan");
  });

  it("rejects unknown stored values and falls back to default", () => {
    window.localStorage.setItem(STORAGE_KEY, "etherscan");
    expect(readExplorerPreference()).toBe(DEFAULT_EXPLORER);
  });

  it("applyPreferenceOrder hoists the preferred label first", () => {
    const items = [
      { label: "Snowtrace", href: "s" },
      { label: "Avascan", href: "a" },
      { label: "Routescan", href: "r" },
    ];
    expect(applyPreferenceOrder(items, "avascan")[0].label).toBe("Avascan");
    expect(applyPreferenceOrder(items, "routescan")[0].label).toBe("Routescan");
    expect(applyPreferenceOrder(items, "snowtrace")[0].label).toBe("Snowtrace");
  });

  it("txUrls honors the persisted preference across calls", () => {
    writeExplorerPreference("routescan");
    const ordered = txUrls(HASH);
    expect(ordered[0].label.toLowerCase()).toBe("routescan");
    // All three explorers are still returned so a blocked host can fall through.
    expect(ordered.map((u) => u.label.toLowerCase()).sort()).toEqual([
      "avascan",
      "routescan",
      "snowtrace",
    ]);
  });

  it("txUrls explicit preference arg overrides storage", () => {
    writeExplorerPreference("snowtrace");
    const ordered = txUrls(HASH, "avascan");
    expect(ordered[0].label.toLowerCase()).toBe("avascan");
  });
});
