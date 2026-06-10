---
name: Purchase-events canonical scan
description: useLivePurchaseEvents is the single shared TokensPurchased scan behind the whole app; rules that keep it from re-forking or regressing consumers.
---

`useLivePurchaseEvents` (src/lib/activity-hooks.ts) is the ONE expensive historical `getLogs` scan that feeds the holder index and ~31 `useHolderIndex` consumers plus the activity/transparency feeds. Two rules keep it cheap:

1. **`limit` must stay OUT of the queryKey.** The canonical key is `["live-purchases", String(fromBlock), SALE]`. `limit` only narrows the final slice — it does NOT change the work (the scan always walks fromBlock→tip). Putting `limit` back in the key forks a separate full-range scan per distinct limit (callers use 1/25/30/100/1000/5000/0 + a variable), which is exactly the P0 waste that was removed. Apply `limit` client-side via `applyPurchaseLimit(events, limit)` in TanStack Query `select`, not in the queryFn.

2. **Keep `select` memoized** with `useCallback((events) => applyPurchaseLimit(events, limit), [limit])`. **Why:** an inline `select` arrow changes identity every render, defeating v5's select memoization, so `data` becomes a new array each render and every `useHolderIndex` consumer re-runs `buildHolderIndex` (sort + maps over up to 5000 events) on every render — a render-time regression that silently undoes the perf win. **How to apply:** whenever touching this hook (or replicating the pattern in onchain-events.ts P3/P4), preserve the stable-select shape; never revert to an inline select.

**Semantics that must not drift** (preserved from the original queryFn): `limit > 0` → newest N; `limit === 0` → entire list; `undefined` → 50 (`opts?.limit ?? 50`). List is sorted newest-first before slicing.

Deferred to later blocks (do NOT assume present): persistent cache, incremental "last scanned block" indexing, global QueryClient defaults / refetchOnWindowFocus:false. Those are P1–P5, gated on user approval block-by-block.
