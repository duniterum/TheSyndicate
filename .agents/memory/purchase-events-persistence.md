---
name: Purchase-events local persistence (holder-index snapshot)
description: How/why the canonical purchase-events scan is cached to localStorage and seeded back, and the safety constraints around it.
---

# Persisting the canonical purchase scan

The canonical `live-purchases` scan (one expensive getLogs walk shared by all
callers) is persisted to `localStorage` so a cold reload hydrates the holder
index instantly instead of re-scanning from zero.

## Seeding a STALE cache is the truthful way — do not "fix" it to look fresh
You can restore the snapshot into TanStack Query and it will NOT falsely read
as LIVE, because freshness is derived from **event-block age vs chain tip**
(`freshness-signals` computes `latestEventBlock` = max event `blockNumber`, then
`blocksBehindTip`), NOT from RQ's `dataUpdatedAt`/`isSuccess`. A stale snapshot
has old event blocks → large lag → ActivityHealthBanner shows PARTIAL/degraded.

**How to apply:** seed via `setQueryData(key, events, { updatedAt: <true age> })`
(RQ v5 `SetDataOptions.updatedAt` sets `dataUpdatedAt`). The old timestamp keeps
the query stale → background refetch fires (refetchOnMount + refetchInterval),
and the snapshot is never mistaken for fresh. Guard with
`dataUpdatedAt >= snapshot.updatedAt` so you never clobber fresher live data.
Seeding must happen in a client `useEffect` (post-hydration) — the server has no
localStorage, so any pre-hydration seed would be an SSR mismatch.

## GOTCHA: LivePulseStrip renders a hardcoded `<StatusPill status="LIVE" />`
Pre-existing and unconditional — it does NOT consult freshness. If a future task
audits "is every LIVE claim truthful?", this strip is the one surface that can
show LIVE regardless of actual lag. Left untouched by the perf work.

## CONSTRAINT: partial scans can clobber a fuller snapshot
The chunk loop in `useLivePurchaseEvents` swallows per-chunk RPC errors
(`catch {}`), so a non-empty but INCOMPLETE scan still returns results. The
persistence guard is only `results.length > 0`, which stops fully-empty failures
but NOT partial ones. A partial seed (missing middle events) can transiently
shift member numbers on the next cold load until the always-fired background
refetch corrects it — same kind of wrongness that already exists in-memory for
partial scans, bounded by the immediate refresh.
**Why it matters:** any P2+ incremental-indexing / "lastScannedBlock" work must
track failed chunks and skip persistence on incomplete scans, or it will harden
a partial snapshot into the persisted source of truth.

## Cache key identity
`purchaseEventsCacheKey({chainId, sale(lowercased), fromBlock})` + a
`PURCHASE_EVENTS_CACHE_VERSION` buster. Note the RQ queryKey itself omits chainId
(P0 design) — the localStorage key adds it, so cross-chain seeding can't happen.
Deserialize rejects the WHOLE snapshot on any single malformed event (bigint
fields stored as strings); missing/non-JSON/version-mismatch → undefined.
