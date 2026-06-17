// Lock the homepage status ticker (ProtocolIntelligenceBar) contract so a
// future refactor cannot silently break:
//   1. the prop-less (global) bar renders the canonical cell set/order
//      (lead → burned → tail) used by the PageShell chrome everywhere,
//   2. curated `cells` produce exactly those cells in that order, and
//      `mobilePriority={N}` hides cells at index >= N below the `sm` breakpoint,
//   3. the aggregate status pill reflects ONLY the displayed cells when `cells`
//      is provided (a hidden unresolved global metric must NOT force a curated
//      bar to PARTIAL/PENDING).
//
// Pure-function tests — no DOM, no React renderer needed. The production
// component consumes these exact helpers, so this binds the rendered behaviour.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CANONICAL_TICKER_ORDER,
  DEFAULT_STATUS_KEYS,
  resolveTickerOrder,
  tickerHideOnMobile,
  selectTickerStatusReads,
  computeTickerStatus,
  buildTickerItemsByKey,
  buildTickerStatusValues,
} from "../ProtocolIntelligenceBar";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

// The curated cell set the homepage passes (mirrors src/routes/index.tsx).
const HOME_TICKER_CELLS = ["members", "usdcRouted", "protocolWallets", "lpTvl", "burned", "chapter"];

describe("ProtocolIntelligenceBar · canonical order", () => {
  it("prop-less bar renders the exact canonical set in order (lead → burned → tail)", () => {
    expect(CANONICAL_TICKER_ORDER).toEqual([
      // lead
      "price", "refMktCap", "fdv", "totalSupply", "circulating",
      // special
      "burned",
      // tail
      "protocolWallets", "vault", "liquidity", "operations",
      "lpTvl", "synSold", "usdcRouted", "members", "chapter",
    ]);
  });

  it("the special Burned cell sits between lead and tail", () => {
    const i = CANONICAL_TICKER_ORDER.indexOf("burned");
    expect(i).toBe(5);
    expect(CANONICAL_TICKER_ORDER[i - 1]).toBe("circulating"); // last lead cell
    expect(CANONICAL_TICKER_ORDER[i + 1]).toBe("protocolWallets"); // first tail cell
  });

  it("omitting `cells` yields the full canonical order verbatim", () => {
    expect(resolveTickerOrder(undefined, CANONICAL_TICKER_ORDER)).toEqual(CANONICAL_TICKER_ORDER);
  });
});

describe("ProtocolIntelligenceBar · curated cells", () => {
  it("renders exactly the curated cells in the requested order", () => {
    expect(resolveTickerOrder(HOME_TICKER_CELLS, CANONICAL_TICKER_ORDER)).toEqual(HOME_TICKER_CELLS);
  });

  it("preserves a caller-chosen order that differs from canonical", () => {
    const reordered = ["chapter", "members", "burned"];
    expect(resolveTickerOrder(reordered, CANONICAL_TICKER_ORDER)).toEqual(reordered);
  });

  it("silently drops unknown keys (cannot inject a non-existent cell)", () => {
    expect(resolveTickerOrder(["members", "not-a-cell", "burned"], CANONICAL_TICKER_ORDER)).toEqual([
      "members",
      "burned",
    ]);
  });

  it("the homepage route still passes the cells this test pins", () => {
    const src = read("src/routes/index.tsx");
    // Each curated key is referenced, in order, in the homepage cell array.
    const arr = src.slice(src.indexOf("HOME_TICKER_CELLS"));
    let cursor = 0;
    for (const key of HOME_TICKER_CELLS) {
      const at = arr.indexOf(`"${key}"`, cursor);
      expect(at).toBeGreaterThan(-1);
      cursor = at + 1;
    }
    // mobilePriority={4} keeps the first four cells on phones.
    expect(/mobilePriority=\{4\}/.test(src)).toBe(true);
  });
});

describe("ProtocolIntelligenceBar · no canonical key renders to nothing", () => {
  // A fully-populated value bag: the cell builder produces a cell regardless of
  // value, so this exercises the key set, not the formatting.
  const items = buildTickerItemsByKey({
    referencePrice: 0.01,
    refMktCap: 1,
    fdv: 1,
    totalSupply: 1,
    circulating: 1,
    burned: 1,
    protocolWallets: 1,
    vault: 1,
    liquidity: 1,
    operations: 1,
    lpTvl: 1,
    synSold: 1,
    usdcRouted: 1,
    members: 1,
    chapter: { id: "genesis", label: "Genesis", capacity: 333, taken: 1, remaining: 332, progressPct: 0 },
  });

  it("every CANONICAL_TICKER_ORDER key produces a render item", () => {
    for (const key of CANONICAL_TICKER_ORDER) {
      expect(items.has(key), `missing render item for cell key "${key}"`).toBe(true);
    }
  });

  it("the builder produces exactly the canonical key set (no extra, no missing)", () => {
    // Sorting makes the assertion order-independent — order itself is pinned by
    // the canonical-order describe block above.
    expect([...items.keys()].sort()).toEqual([...CANONICAL_TICKER_ORDER].sort());
  });

  it("a curated bar can never reference a cell key the builder cannot produce", () => {
    // resolveTickerOrder only admits keys in CANONICAL_TICKER_ORDER, and every
    // such key has a render item — so resolve+lookup never drops a curated cell.
    const resolved = resolveTickerOrder(CANONICAL_TICKER_ORDER, CANONICAL_TICKER_ORDER);
    const rendered = resolved.map((k) => items.get(k)).filter((it) => it !== undefined);
    expect(rendered).toHaveLength(CANONICAL_TICKER_ORDER.length);
  });
});

describe("ProtocolIntelligenceBar · no status read can go missing", () => {
  const statusValues = buildTickerStatusValues({
    referencePrice: 0.01,
    refMktCap: 1,
    fdv: 1,
    totalSupply: 1,
    circulating: 1,
    burned: 1,
    protocolWallets: 1,
    vault: 1,
    liquidity: 1,
    operations: 1,
    lpTvl: 1,
    synSold: 1,
    usdcRouted: 1,
    members: 1,
    chapter: { id: "genesis", label: "Genesis", capacity: 333, taken: 1, remaining: 332, progressPct: 0 },
  });

  it("every CANONICAL_TICKER_ORDER + DEFAULT_STATUS_KEYS key has a status entry", () => {
    const keys = new Set([...CANONICAL_TICKER_ORDER, ...DEFAULT_STATUS_KEYS]);
    for (const key of keys) {
      // `in` proves the key is present even if its resolved value is undefined,
      // so selectTickerStatusReads can never silently read a missing read.
      expect(key in statusValues, `missing status read for key "${key}"`).toBe(true);
    }
  });

  it("selecting status for the full canonical order yields no missing reads", () => {
    // Every read resolves in this fully-populated bag, so a gap would surface as
    // an undefined entry here (which would also wrongly degrade the bar status).
    const reads = selectTickerStatusReads(statusValues, CANONICAL_TICKER_ORDER, DEFAULT_STATUS_KEYS);
    expect(reads).toHaveLength(CANONICAL_TICKER_ORDER.length);
    expect(reads.every((v) => v !== undefined)).toBe(true);
  });
});

describe("ProtocolIntelligenceBar · mobilePriority", () => {
  it("hides cells at/after the cut index below `sm`", () => {
    const N = 4;
    expect(tickerHideOnMobile(0, N)).toBe(false);
    expect(tickerHideOnMobile(3, N)).toBe(false);
    expect(tickerHideOnMobile(4, N)).toBe(true);
    expect(tickerHideOnMobile(5, N)).toBe(true);
  });

  it("hides nothing when `mobilePriority` is omitted", () => {
    expect(tickerHideOnMobile(0)).toBe(false);
    expect(tickerHideOnMobile(99)).toBe(false);
  });

  it("for the homepage set, exactly the first four cells survive on phones", () => {
    const N = 4;
    const visibleOnMobile = HOME_TICKER_CELLS.filter((_, i) => !tickerHideOnMobile(i, N));
    expect(visibleOnMobile).toEqual(["members", "usdcRouted", "protocolWallets", "lpTvl"]);
  });

  it("the production component applies the `sm`-breakpoint hide class via the helper", () => {
    const src = read("src/components/syndicate/ProtocolIntelligenceBar.tsx");
    expect(src).toContain("tickerHideOnMobile(i, mobilePriority)");
    expect(src).toContain('hideOnMobile ? "hidden sm:flex"');
  });
});

describe("ProtocolIntelligenceBar · status scoping", () => {
  // A truth snapshot where every curated home cell resolves but an unrelated
  // GLOBAL metric (vault) is still pending. byKey mirrors statusValueByKey.
  const byKey: Record<string, unknown> = {
    price: 0.01,
    refMktCap: 1_000_000,
    fdv: 10_000_000,
    totalSupply: 1_000_000_000,
    circulating: 500_000_000,
    burned: 1000,
    protocolWallets: 50_000,
    vault: undefined, // hidden global metric still loading
    liquidity: undefined,
    operations: undefined,
    lpTvl: 25_000,
    synSold: 200_000_000,
    usdcRouted: 80_000,
    members: 42,
    chapter: { label: "Genesis" },
  };

  it("LIVE — a curated bar ignores unresolved HIDDEN global metrics", () => {
    const reads = selectTickerStatusReads(byKey, HOME_TICKER_CELLS);
    // Every displayed cell resolves, so the curated bar is LIVE even though
    // vault/liquidity/operations are still undefined globally.
    expect(reads.every((v) => v !== undefined)).toBe(true);
    expect(computeTickerStatus(reads, false)).toBe("LIVE");
  });

  it("PARTIAL — the SAME snapshot degrades the prop-less (global) bar", () => {
    const reads = selectTickerStatusReads(byKey, undefined, DEFAULT_STATUS_KEYS);
    expect(computeTickerStatus(reads, false)).toBe("PARTIAL");
  });

  it("PARTIAL — a curated bar with one unresolved displayed cell", () => {
    const reads = selectTickerStatusReads({ ...byKey, members: undefined }, HOME_TICKER_CELLS);
    expect(computeTickerStatus(reads, false)).toBe("PARTIAL");
  });

  it("PENDING — no displayed cell has resolved yet", () => {
    const empty: Record<string, unknown> = {};
    const reads = selectTickerStatusReads(empty, HOME_TICKER_CELLS);
    expect(computeTickerStatus(reads, false)).toBe("PENDING");
  });

  it("PARTIAL — a degraded (isError) read is never LIVE, even fully resolved", () => {
    const reads = selectTickerStatusReads(byKey, HOME_TICKER_CELLS);
    expect(computeTickerStatus(reads, true)).toBe("PARTIAL");
  });

  it("LIVE — the full default key set when every global read resolves", () => {
    const allResolved: Record<string, unknown> = {};
    for (const k of DEFAULT_STATUS_KEYS) allResolved[k] = 1;
    const reads = selectTickerStatusReads(allResolved, undefined, DEFAULT_STATUS_KEYS);
    expect(computeTickerStatus(reads, false)).toBe("LIVE");
  });
});
