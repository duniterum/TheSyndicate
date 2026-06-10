---
name: Wallet-specific read persistence (archive ownership + SYN/USDC balances)
description: How/why per-wallet read-only multicall results are cached and seeded back through wagmi, and the safety constraints around it.
---

# Persisting per-wallet read-only reads

Goal: after the holder index hydrates instantly, wallet-specific reads
(`useArchiveBalances`, `useUserBalances`) should also not start from zero each
visit. Cached to `localStorage`, keyed per chain+wallet+contract/version.

## Technique: seed wagmi's OWN query cache — don't build a parallel state path
wagmi read hooks (`useReadContracts`/`useReadContract`) expose `queryKey` and
`dataUpdatedAt` on their return (it's on `UseQueryReturnType`, minified in the
d.ts). To restore last-known values WITHOUT changing a hook's return shape:
in a client `useEffect`, `queryClient.setQueryData(q.queryKey, <rebuilt data>,
{ updatedAt: snapshot.updatedAt })`. The hook keeps deriving from `q.data`, so
its return shape is byte-identical — values just appear sooner.

**Why this over a fallback-merge:** merging cached values into the derived
return while `isLoading` stays true makes consumers show skeleton AND data at
once. Seeding flips `isLoading`→false (data present) the truthful way.

**How to apply:**
- Effect deps = the string `cacheKey` (chainId+wallet+slots), NOT `q.queryKey`
  (its array identity can churn and re-seed every render).
- Restore guard: skip if `queryClient.getQueryState(q.queryKey)?.data` already
  present (don't clobber live/seeded; also de-dups when two components mount the
  same query, e.g. CockpitMemory + CockpitBadges both read archive `[1,3]`).
- Persist with `updatedAt: q.dataUpdatedAt` (NOT `Date.now()`): re-saving a
  just-seeded snapshot rewrites the SAME old timestamp (stays stale → keeps
  triggering the background refetch); only a real fetch writes a fresh time.
  This is the same "seed as STALE so nothing reads as freshly LIVE" rule as the
  purchase-events snapshot.

## CONSTRAINT: never persist the USDC allowance slot
`useUserBalances` reads [USDC.balanceOf, SYN.balanceOf, USDC.allowance].
Persist only the two balances; store the allowance slot as undefined so it's
restored as undefined = the safe "needs approval / loading" default.
**Why:** allowance gates approve/mint. A stale "approved" cache could let a
write skip the approve step. Balances are display-only and safe to cache.

## CONSTRAINT: archive persist must be COMPLETE-only
`useArchiveBalances` surfaces `balances[id].error`. A restored `{status:
'failure'}` slot would resurface as a synthetic read error in the UI, so only
persist when every slot read succeeded (`balanceOf` returns `0n` on
non-ownership — still a success, so a real wallet is always fully cached).
`useUserBalances` exposes no per-slot error, so its intentional null allowance
slot is harmless there.

## Skipped: buyer purchase totals
`useBuyerPurchaseTotals` is NOT persisted — redundant with the holder index,
which already exposes per-wallet `cumulativeUsdc`/`cumulativeSyn` (and the
underlying events are persisted by the purchase-events snapshot).

## Pre-existing gap noticed (NOT caused here, candidate for a later block)
`LivePurchase` computes `needsApprove = usdcAllowance !== undefined &&
usdcAllowance < usdcRaw`, so an **undefined** allowance (the on-mount window)
falls through to an enabled "Buy SYN" button rather than showing approve first.
This window exists pre-caching and isn't lengthened by it (allowance is never
seeded). Flag if a future block hardens the approve→buy gating.
