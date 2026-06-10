/**
 * Performance Block P3 — global protocol read tuning + duplicate cleanup.
 *
 * Source-scan assertions (NODE env, no DOM) that pin the de-duplication and
 * immutable-read caching introduced in P3:
 *   • ONE shared chain-tip query feeds both chain-time and the protocol pulse
 *     (the per-hook ["pulse-tip"] / ["chain-time-tip"] head fetches are gone).
 *   • LivePurchase invalidates that single shared key after a buy.
 *   • The LP pair's immutable token ordering is read once and cached with
 *     infinite staleTime instead of being re-read on every event scan.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

describe("P3 · global read tuning + duplicate cleanup", () => {
  const chainTime = read("src/lib/chain-time.ts");
  const pulse = read("src/lib/protocol-pulse.ts");
  const live = read("src/components/syndicate/LivePurchase.tsx");
  const events = read("src/lib/onchain-events.ts");

  it("exposes ONE shared chain-tip query and retires the per-hook tip keys", () => {
    expect(chainTime).toMatch(/CHAIN_TIP_QUERY_KEY\s*=\s*\[\s*["']chain-tip["']/);
    expect(chainTime).toMatch(/export function useChainTip\b/);
    // The duplicated, independent head fetches are fully removed.
    expect(chainTime).not.toMatch(/chain-time-tip/);
    expect(pulse).not.toMatch(/pulse-tip/);
  });

  it("protocol-pulse consumes the shared tip instead of its own head fetch", () => {
    expect(pulse).toMatch(/useChainTip/);
    expect(pulse).not.toMatch(/usePublicClient/);
    expect(pulse).not.toMatch(/getBlockNumber/);
  });

  it("the shared chain-tip queryFn throws rather than returning undefined (react-query v5)", () => {
    // v5 forbids an undefined queryFn result; the shared tip throws instead.
    expect(chainTime).toMatch(/throw new Error\(/);
  });

  it("LivePurchase invalidates the unified chain-tip key after a buy", () => {
    expect(live).toMatch(/CHAIN_TIP_QUERY_KEY/);
    expect(live).not.toMatch(/pulse-tip/);
    expect(live).not.toMatch(/chain-time-tip/);
  });

  it("caches the immutable LP token ordering with infinite staleTime, read once", () => {
    expect(events).toMatch(/LP_TOKEN_ORDER_KEY\s*=\s*\[\s*["']lp-token-order["']/);
    expect(events).toMatch(/staleTime:\s*Infinity/);
    expect(events).toMatch(/gcTime:\s*Infinity/);
    // Token ordering is no longer re-read inline per scan: token1 disappears
    // entirely and token0 is read in exactly one place (the cached helper).
    expect(events).not.toMatch(/functionName:\s*["']token1["']/);
    const token0Reads = events.match(/functionName:\s*["']token0["']/g) ?? [];
    expect(token0Reads.length).toBe(1);
  });
});
