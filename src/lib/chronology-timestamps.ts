// ─── Block-timestamp lookup for the Chronicle Chronology layer (Sprint 15) ──
// The I/O EDGE that the pure chronology layer cannot perform itself. It reads
// the VERIFIED timestamp of an already-anchored block straight from chain
// metadata (publicClient.getBlock), and hands the result BACK to the pure
// overlay (applyBlockTimestamps) as plain data.
//
// DOCTRINE:
//   • Verified-only — a date is read from chain metadata or it is absent. This
//     module NEVER estimates, projects from ~2s/block, or reads the local clock.
//     (That is precisely why it does NOT reuse chain-time.ts, which approximates
//     historical blocks from the tip.)
//   • Fail soft — an RPC failure resolves to an "error" fetch state (or stays
//     pending while loading); it never throws upward and never invents a date.
//   • Immutable cache — a mined block's timestamp never changes, so each block
//     is cached with staleTime + gcTime Infinity: one getBlock per unique block,
//     ever.
//   • Ordering-blind — this module only RESOLVES timestamps; ordering is owned
//     by the pure deriver and is never a function of any value read here.
//
// ADJACENCY: this is a data-access surface (like a route), NOT a pure chronology
// module. It imports react, @tanstack/react-query, wagmi, and the chronology
// registry TYPES only — never the deriver, never any upstream pipeline layer.

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import type {
  BlockTimestampFetch,
  BlockTimestampLookup,
  ChronologyEntry,
} from "./chronology-registry";

/**
 * The minimal shape of one block-timestamp query as the pure lookup builder
 * sees it: react-query's status plus the resolved unix seconds (when success).
 * Modelled as plain data so buildBlockTimestampLookup is unit-testable without
 * rendering a wagmi/react-query hook.
 */
export type BlockTimestampQueryState = {
  status: "success" | "error" | "pending";
  data: number | null | undefined;
};

/**
 * PURE — collect the unique, block-anchored heights from a chronology set,
 * sorted ascending. Entries without a block anchor carry no height and are
 * skipped (their timestamp is not-applicable). Sorting + de-duping keeps the
 * fetch set minimal and the query identities stable across renders.
 */
export function collectAnchoredBlockNumbers(
  chronology: ReadonlyArray<ChronologyEntry>,
): number[] {
  const seen = new Set<number>();
  for (const c of chronology) {
    if (c.blockNumber !== null && Number.isFinite(c.blockNumber)) {
      seen.add(c.blockNumber);
    }
  }
  return [...seen].sort((a, b) => a - b);
}

/**
 * PURE — the per-block query key. Namespaced by chain id so a block height on
 * one chain can never collide with the same height on another.
 */
export function blockTimestampQueryKey(
  chainId: number | undefined,
  blockNumber: number,
): readonly ["block-timestamp", number | undefined, number] {
  return ["block-timestamp", chainId, blockNumber] as const;
}

/**
 * PURE — fold a set of resolved per-block query states into a BlockTimestampLookup:
 *   • success + finite number → verified (carries the real unix).
 *   • success + non-number    → unavailable (block queried, no timestamp found).
 *   • error                   → error.
 *   • pending / missing state → ABSENT (the resolver treats absence as pending).
 * It never invents a date: a verified entry is produced ONLY from a real number.
 */
export function buildBlockTimestampLookup(
  blocks: ReadonlyArray<number>,
  states: ReadonlyArray<BlockTimestampQueryState>,
): BlockTimestampLookup {
  const map = new Map<number, BlockTimestampFetch>();
  blocks.forEach((block, i) => {
    const s = states[i];
    if (s === undefined) return; // not yet resolved → pending (absent)
    if (s.status === "error") {
      map.set(block, { state: "error" });
    } else if (s.status === "success") {
      if (typeof s.data === "number" && Number.isFinite(s.data)) {
        map.set(block, { state: "verified", unix: s.data });
      } else {
        map.set(block, { state: "unavailable" });
      }
    }
    // status === "pending" → leave absent so the resolver reports "pending"
  });
  return map;
}

/**
 * Read the VERIFIED timestamps for a set of already-anchored block heights and
 * return a caller-resolved BlockTimestampLookup to hand into applyBlockTimestamps.
 *
 * Pass a STABLE blockNumbers array (e.g. collectAnchoredBlockNumbers wrapped in
 * useMemo) so the per-block queries keep their identity across renders.
 *
 * SSR-safe: with no publicClient the queries are disabled (status "pending"),
 * so every anchored entry reports "pending" and the layer renders without dates.
 */
export function useBlockTimestamps(
  blockNumbers: ReadonlyArray<number>,
): BlockTimestampLookup {
  const publicClient = usePublicClient();
  const chainId = publicClient?.chain?.id;

  const blocks = useMemo(() => {
    const seen = new Set<number>();
    for (const n of blockNumbers) if (Number.isFinite(n)) seen.add(n);
    return [...seen].sort((a, b) => a - b);
  }, [blockNumbers]);

  return useQueries({
    queries: blocks.map((n) => ({
      queryKey: blockTimestampQueryKey(chainId, n),
      enabled: Boolean(publicClient),
      // A mined block's timestamp is immutable — cache it forever.
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
      queryFn: async (): Promise<number> => {
        if (!publicClient) throw new Error("publicClient unavailable");
        const block = await publicClient.getBlock({ blockNumber: BigInt(n) });
        // Convert the bigint timestamp to a plain number of unix SECONDS — never
        // store a bigint in the cache (it is not JSON-serialisable).
        return Number(block.timestamp);
      },
    })),
    combine: (results) =>
      buildBlockTimestampLookup(
        blocks,
        results.map((r) => ({ status: r.status, data: r.data })),
      ),
  });
}
