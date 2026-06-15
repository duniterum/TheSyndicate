---
name: V2 Purchased⋈Routed fail-closed join
description: Multi-log on-chain join (identity log + money-split log) must drop incomplete pairs, never zero-fill, and gate persistence — the truth-doctrine rule a V2 indexing review enforced.
---

# V2 `Purchased` ⋈ `Routed` join must fail closed

A V2 buy emits TWO logs in one tx: `Purchased` (identity + sizing) and `Routed`
(the 70/20/10 + referral money split). The indexer joins them **by txHash** (one
buy per tx). The pure helper is `joinV2PurchaseEvents(purchased, routedByTx)` in
`activity-hooks.ts` → `{ events, joinIncomplete }`.

**Rule:** if a `Purchased` has NO matching `Routed` split (or an empty txHash),
**drop the event and set `joinIncomplete = true`**. Never emit a placeholder with
`vault/liquidity/operations/referral = 0`. A genuinely-present split is used
verbatim, INCLUDING a legitimately-zero `referral` (the contract really emits 0
for "no referrer") — only a *wholly-absent* split fails closed.

`scanV2Purchases` then does `anyChunkFailed = routedFailed || purchasedFailed ||
joinIncomplete`, and persists/advances the cursor only when `!anyChunkFailed`. So
an incomplete join is never cached and is re-resolved next scan.

**Why:** an architect review FAILED Wave 1 because the original join did
`split?.vault ?? 0` — a missing `Routed` log (failed RPC chunk / unexpected ABI)
became fabricated zero economics that could be persisted. That is a direct "no
fake on-chain data" violation. Honest absence (PENDING, re-resolved) beats a fake
zero. This is the template for ANY future multi-log join scanner.

**How to apply:** when joining two on-chain logs that must co-occur, drop unpaired
rows + flag incompleteness + gate persistence on completeness. Don't `?? 0` a
missing economic field.

## Companion gotchas
- **Dormant V2 byte-identical:** the canonical queryKey carries `saleV2 ??
  "v2-pending"` (stable sentinel while V2 is null) and the queryFn returns the V1
  list **before** touching V2 when `!saleV2 || SALE_V2_DEPLOYMENT_BLOCK === null`.
  Don't remove the short-circuit — it's what keeps live V1 unchanged until deploy.
- **Source-scan tests:** `purchase-events-{canonical,incremental}.test.ts` assert
  queryFn/queryKey behavior by **reading the source string** (the scan needs a
  live client, so it can't be run in unit tests). Any queryKey/queryFn refactor
  breaks these regexes — retarget them in lockstep (they are not logic bugs).
