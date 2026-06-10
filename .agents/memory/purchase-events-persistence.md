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

## Incremental indexing: resume from a persisted cursor, never re-scan from zero
The canonical `live-purchases` scan resumes from a persisted `lastScannedBlock`
instead of replaying `deploymentBlock→head` every refetch. This is the template
any future scanner-indexing block (LP swaps / liquidity / archive mints) must
copy — the safety rules are non-negotiable:
- **Cursor lives in the snapshot.** The persisted shape carries
  `{updatedAt, lastScannedBlock, events}`; the cache-version buster gates it.
- **Resume window** = `computeIncrementalScanStart` → start a small
  `REORG_OVERLAP` (50 blocks) BELOW the cursor, clamped to `[fromBlock, tip]`.
  The overlap re-resolves shallow reorgs near the tip instead of missing them.
- **RPC head lagging the cursor** (`tip < lastScannedBlock`): anchor the overlap
  to `tip` (never request a range past head) and DO NOT regress the persisted
  cursor (`next = max(cursor, tip)`); merge keeps the cached events beyond `tip`,
  so a flaky/lagging node can't erase known history.
- **Merge + dedupe** old∪new by `txHash:logIndex` (`purchaseEventKey`), fresh
  wins on collision, then sort newest-first with the EXACT scan comparator. With
  no cache this is identical to a full scan, so displayed values never change.
- **Persist ONLY a complete scan.** Track `anyChunkFailed` across the chunk loop
  and skip BOTH the events snapshot and the cursor advance on any chunk failure —
  this is the fix for the old "partial scans can clobber" hazard; a partial scan
  now degrades to "show best-effort, persist nothing", never hardening a gap.
- **Corrupt/absent cache → full scan** (deserialize returns undefined).

## Cache key identity
`purchaseEventsCacheKey({chainId, sale(lowercased), fromBlock})` + a
`PURCHASE_EVENTS_CACHE_VERSION` buster (bumped when the stored shape changes —
adding `lastScannedBlock` bumped it, so older snapshots are ignored, not
mis-read). Note the RQ queryKey itself omits chainId (P0 design) — the
localStorage key adds it, so cross-chain seeding can't happen. Deserialize
rejects the WHOLE snapshot on any single malformed event (bigint fields stored as
strings) or a missing/invalid `lastScannedBlock`; non-JSON/version-mismatch →
undefined.
