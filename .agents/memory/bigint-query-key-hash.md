---
name: BigInt in wagmi query keys crashes direct queryClient ops
description: Why touching a wagmi query key directly throws "Do not know how to serialize a BigInt", and the global queryKeyHashFn cure.
---

**Symptom:** `TypeError: Do not know how to serialize a BigInt` thrown from
`JSON.stringify` ← TanStack Query `defaultQueryOptions`/`getQueryState`, in code
that calls `queryClient.getQueryState(q.queryKey)` / `setQueryData(q.queryKey, …)`
where `q.queryKey` is a wagmi key (`useReadContract(s)`) carrying `bigint` args
(e.g. `balanceOf(account, BigInt(id))`). Connected-only (the wagmi query — and
its seeding effect — is gated on a wallet address).

**Why:** wagmi's OWN hooks pass a per-query `queryKeyHashFn` (wagmi's `hashFn`,
which serializes `bigint → string`), so wagmi's internal cache ops never throw.
But app code that touches a wagmi key DIRECTLY through the QueryClient bypasses
that per-query option and falls back to the QueryClient's GLOBAL key hash —
TanStack's default `hashKey`, which is plain `JSON.stringify` and throws on
bigint. Our seeding pattern (persist-then-restore wallet/contract reads via
`getQueryState` + `setQueryData`) lives in `archive-balances-hook`, `sale-hooks`,
and `PurchaseEventsHydrator` — all hit this.

**Cure (one line, global):** set `defaultOptions.queries.queryKeyHashFn = hashFn`
(import `{ hashFn } from "wagmi/query"`) in the QueryClient factory
(`src/lib/query-client.ts`). wagmi's `hashFn` is a DROP-IN for the default —
identical sorted-object-key JSON for bigint-free keys (so nothing else re-hashes,
no cache invalidation) — and additionally (a) stops the throw and (b) makes our
direct ops hash to the SAME entry wagmi uses, so the seed actually lands on the
live query. A local JSON.stringify-with-bigint-replacer would fix the throw but
could hash differently from wagmi → seed silently writes to a dead key. Use
wagmi's exact hashFn, not a homemade one.

**How to apply:** any time you read/write a wagmi-derived query key through the
QueryClient directly, the global hashFn must match wagmi's or it throws / misses.

**Crash-attribution correction:** on connected `/my-syndicate` in prod this — NOT
the SSR hydration mismatch — was the FATAL error. React #418 (the wallet-state
hydration mismatch) is RECOVERABLE: it just forces a client re-render of the
tree. The page died because that client re-render then ran the archive-balances
seeding effect, which threw the bigint error into the root CatchBoundary. The
mounted-gate work (see cockpit-ssr-hydration-gating) reduces #418 noise but was
never sufficient alone; this hashFn fix is what stops the boundary.
