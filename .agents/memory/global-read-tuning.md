---
name: Shared chain-tip + immutable LP token-order reads
description: One shared head-block query feeds chain-time AND the protocol pulse; LP pair token ordering is cached forever. Rules for any new "current head block" or LP-order consumer.
---

# Shared chain-tip + immutable LP token-order reads

## The chain tip is ONE shared query
`CHAIN_TIP_QUERY_KEY = ["chain-tip"]` (in `chain-time.ts`) backs `useChainTip()`,
which does a single `getBlock()` (superset of `getBlockNumber()` → `{number, unix}`)
at refetch 30s / stale 15s. BOTH `useChainTime()` (relative timestamps across
~10 surfaces) and `useProtocolPulse()` (homepage "X ago" recency) consume it.

**Why:** there used to be TWO independent head fetches — `["pulse-tip"]`
(getBlockNumber) in protocol-pulse and `["chain-time-tip"]` (getBlock) in
chain-time — fetching the same head every minute. Collapsing to one cut tip RPC
from 3 calls/min → 2 with no display change.

**How to apply:**
- Need "where is the chain right now?" → call `useChainTip()` / read
  `CHAIN_TIP_QUERY_KEY`. NEVER spin up a new per-hook head fetch.
- Post-write invalidation that must refresh recency (e.g. `LivePurchase` after a
  buy) invalidates `CHAIN_TIP_QUERY_KEY` — one key, not the two dead ones.
- The shared queryFn must **throw** when `publicClient` is missing, never
  `return undefined` — react-query v5 errors on an undefined queryFn result.
  (The old `chain-time-tip` returned undefined; do not copy that pattern.)

## Deliberately-separate head reads (do NOT "dedupe" these)
These read the head block too but are intentionally distinct — leave them:
- `freshness-signals.ts` `["freshness","rpc-head"]` @15s — a liveness probe whose
  identity as a separate measurement matters.
- `scan()` internal `getBlockNumber()` in `onchain-events.ts` / `activity-hooks`
  — each scan needs the absolute latest tip to bound its log range.
- `og-data` server-side read — different (SSR) concern.

## LP pair token ordering is immutable → cache forever
`LP_TOKEN_ORDER_KEY = ["lp-token-order", PAIR]` + `getSynIs0(publicClient,
queryClient)` in `onchain-events.ts` resolves "is SYN token0?" via
`queryClient.fetchQuery({ staleTime: Infinity, gcTime: Infinity })`, reading only
`token0`. `useLpSwaps`/`useLpLiquidityEvents` call it instead of re-reading
token0/token1 inside every scan's queryFn.

**Why:** pair ordering never changes, but the scanners re-read it on every
refetch. `fetchQuery` with infinite stale reads it once; failures still
propagate (errors aren't cached as data) so the outer scan's retry handles them —
unlike a module-level memoized promise, which would cache a rejection forever.

**How to apply:** any new consumer needing SYN/pair ordering uses `getSynIs0`
(or the cached key), not a fresh token0/token1 read. `useLpStats`' multicall
keeps its own token0/token1 on purpose — they ride one multicall (zero marginal
RPC) and are part of its return shape; don't "dedupe" those.
