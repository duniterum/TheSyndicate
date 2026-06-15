# The Syndicate — Sale V2 Wave 1 Execution Report (WS1 + WS2)

**Type:** Final Wave-1 execution report (Parts A–K).
**Date:** 2026-06-15
**Scope guardrails (held):** **No deploy. No fund movement. No Sale V1 behavior
change. No frontend publish. No architecture/economics/contract change.** Live V1
stays byte-identical while V2 is null/PENDING. The only writes this wave are
frontend wiring (dormant until V2 live), off-chain tooling, this report, doc
count/reference sync, and agent memory.

> **Doctrine anchors.** Holder Index (first-seen `TokensPurchased` / `Purchased`
> across **both** sale contracts) is the master member identity; a V2
> `memberNumber` is metadata / a cross-check, never identity. "Don't trust,
> verify" — no fake on-chain data is ever displayed or persisted; anything not
> verifiable on-chain is labelled PENDING and fails closed.

---

## Part A — Wave-1 objective & what shipped

Wave 1 combined two workstreams plus their tooling, audit sync, tests, and this
report:

| WS | Deliverable | State |
|----|-------------|-------|
| **WS1** | V1 + V2 **multi-source indexing** (one canonical scan, source-tagged, V2 enrichment) | Shipped, **dormant** until V2 live |
| **WS2** | V1 **membership proof flow** (Merkle proof → V2 `buy`), fail-closed | Shipped, **placeholder artifact** (pending) |
| — | **Snapshot tooling** (export → root → validate) | Shipped, dry-run validated on live V1 |
| — | **Deploy tooling** (`Deploy.s.sol` + params template + read-back verifier) | Shipped, compiles, non-executing |
| — | **Audit/package sync** | Counts → **71 / 50 / 21**, Slither ref corrected |
| — | **Tests + checks** | tsc green, vitest green, **forge 71 GREEN**, architect **PASS** |

Everything V2-facing is gated behind `SALE_V2_LIVE`, which is `false` until both
`MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS` and `SALE_V2_DEPLOYMENT_BLOCK` are set.
Until then the running site is byte-identical to before this wave.

---

## Part B — WS1: multi-source indexing (V1 + V2)

**Config (PENDING by design)** — `src/lib/syndicate-config.ts`:
- `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS = null`
- `SALE_V2_DEPLOYMENT_BLOCK = null`
- `SALE_V2_LIVE` = address-is-live **and** deploy-block-known → currently `false`.

**Registry** — `contract-registry.ts` carries a `MEMBERSHIP_SALE_V2` entry that
reads PENDING (address null) so the verify drawer / registries surface V2 as a
declared-but-not-yet-live contract rather than inventing one.

**ABI** — `sale-abi.ts` adds `SALE_V2_ABI` (4-arg `buy`, `claimV1Membership`,
`quote`, key views) and the `Purchased` + `Routed` events.

**Indexing** — `activity-hooks.ts`:
- `PurchaseEvent` gains `source: "v1" | "v2"` plus V2-only enrichment
  `era?`, `firstSeat?`, `referralAmount?`. `NormalizedPurchase` is the canonical
  cross-source alias.
- `scanV1Purchases` tags `source:"v1"` (parsing/ordering identical to the prior
  inline scan — only the tag is added).
- `scanV2Purchases` reads **both** `Purchased` (identity + sizing) and `Routed`
  (the 70/20/10 + referral money split) over the same window and **joins them by
  txHash** (exactly one buy per tx).
- The canonical query is keyed on `["live-purchases", String(fromBlock), SALE,
  saleV2 ?? "v2-pending"]` — **not** on `limit` (one shared scan feeds all
  consumers) and stable while dormant via the `"v2-pending"` sentinel.
- The expensive `queryFn` scans V1, and **returns the V1 list unchanged** when
  `!saleV2 || SALE_V2_DEPLOYMENT_BLOCK === null` (dormant short-circuit, no V2
  `getLogs`). When live, V2 is scanned from its own deploy block (own cache) and
  merged; cross-source dedupe is safe because V1/V2 tx hashes never collide.

**Cache** — `purchase-events-cache.ts` bumped `PURCHASE_EVENTS_CACHE_VERSION` to
`"v3"` (multi-source: required `source`, optional V2 enrichment carried through);
a legacy/absent `source` is tolerated by defaulting to `"v1"`; a version mismatch
degrades silently to a cold scan.

---

## Part C — WS2: V1 membership proof flow (fail-closed)

`src/lib/v1-proof.ts` is pure + side-effect-light:
- `parseV1ProofArtifact` defensively parses an unknown blob; anything malformed →
  `null` (degrades to "unavailable", never to a silently-wrong proof). A
  well-formed PENDING artifact parses (pending:true, root:null); readiness is a
  separate check.
- `isArtifactReady` is true only for a non-pending artifact with a real root.
- `getV1Proof` / `isKnownV1Member` are case-insensitive lookups.
- `resolveV1ProofForBuy` is **fail-closed**: a missing artifact →
  `artifact-unavailable`; pending → `artifact-pending`; ready + known member →
  their real proof; ready + stranger → empty proof (a genuine new buyer). It only
  ever returns `ok:true` against a READY artifact.
- `buildV2BuyArgs` assembles the `buy(usdcIn, referrer, minSynOut, v1Proof)`
  tuple, normalizing a missing referrer to the zero address. It trusts the proof
  it is handed — **callers must gate on `resolveForBuy.ok`** before building args.

**Artifact** — `public/v1-member-proofs.json` is a **pending placeholder**
(`pending:true, root:null, count:0, proofs:{}`). While pending, the buy flow
refuses to build args, so no real V1 member can be mis-handled as a new seat. The
production artifact is generated from a live V1 snapshot and its `root` must equal
the `V1_MEMBER_ROOT` baked into the deployed Sale V2.

---

## Part D — Snapshot tooling (off-chain, read-only)

`contracts/tools/` (own `package.json`, `.gitignore` for `node_modules` +
snapshot outputs; viem + `@openzeppelin/merkle-tree`):
- `export-members.mjs` — reads live V1 `TokensPurchased` logs → `members.json` in
  **first-seen order**, with provenance; bounded runs supported via `V1_TO_BLOCK`.
- `gen-v1-root.mjs` — builds the Merkle tree / root + per-member proofs.
- `validate-snapshot.mjs` — re-derives the root, replays every proof, reconciles
  the count; **fail-closed** (non-zero exit) on a wrong expected root.
- `RUNBOOK.md` — the snapshot procedure.

**Validated (dry-run, read-only on live V1):** `export-members` found the real
members in first-seen order with provenance; the full pipeline
`export → gen-v1-root → validate-snapshot` ran GREEN, and `validate-snapshot`
correctly **failed closed (exit 1)** against a deliberately-wrong expected root.
Dry-run artifacts were removed afterward.

---

## Part E — Deploy tooling (non-executing)

`contracts/script/`:
- `Deploy.s.sol` — reads `deploy-params.json`; **forces `initialRouter =
  address(0)`** (the router is wired post-deploy, never at construction). Big SYN
  caps are JSON strings so they parse; the per-era `uint256[9]` is parsed via
  `vm.parseJsonUintArray` → fixed-9. Compiles GREEN under `forge build`
  (solc 0.8.24, `via_ir`).
- `deploy-params.json` — a **template**: real public USDC/SYN addresses; vault /
  liquidity / operations / `genesisOffset` (0) / `v1MemberRoot` (0x00) are
  placeholders; ratified bits set (`addrCaps[0]=5_000_000`,
  `reserveThroughSeat=10_000`, `eraCaps[0]=0`); `caps[1..8]` point to the final
  parameter sheet. **No secrets.**
- `contracts/tools/verify-deploy.mjs` — read-only **post-deploy** assertions
  (root, `GENESIS_OFFSET == memberCount`, token/wallet wiring, caps,
  `router == 0x0`); `eraSynCap[1]` skipped because Model 2 forces it to max.

This wave **does not deploy** — these are handoff artifacts for an authorized,
funded deploy later.

---

## Part F — Audit / package sync

- Stale Foundry test counts corrected to **71 total = 50 sale + 21 router** in
  `contracts/README.md` (3 spots), the proof-flow plan, and the reviewer packet
  (§9a body + header).
- Reviewer-packet §11 Slither reference repointed to the authoritative
  `slither-report-14day.txt` (the post-F4, 14-day-timelock run); the pre-F4 run
  remains `slither-report.txt`.

---

## Part G — Truth-doctrine fix (architect-found, resolved)

The first architect pass returned **FAIL** on one severe issue: `scanV2Purchases`
**zero-filled** routing amounts (`vault/liquidity/operations/referral`) when a
`Purchased` had no matching `Routed` split — fabricating fake zero on-chain
economics that could be **persisted** (a direct "no fake on-chain data"
violation).

**Fix:** extracted a pure, exported, unit-testable helper
`joinV2PurchaseEvents(purchased, routedByTx)` that:
- uses the `Routed` split **verbatim** when present (including a legitimately-zero
  `referral` — the contract really emits 0 for "no referrer"), and
- when the split is **wholly absent** (or the tx hash is empty), **drops** the
  event and flips `joinIncomplete = true` — never a fabricated zero.

`scanV2Purchases` now parses `Purchased` into `V2PurchasedLog[]` then joins;
persistence is gated by `anyChunkFailed = routedFailed || purchasedFailed ||
joinIncomplete`, so an incomplete join is **never persisted** and the orphan is
re-resolved on the next scan. The follow-up architect pass returned **PASS** —
"no remaining silent zero-fill path … incomplete never persisted, dropped not
zeroed … no new regression to the dormant-V2 byte-identical path."

---

## Part H — Test inventory & results

**Foundry (contracts):** `forge test --root contracts` → **71 passed, 0 failed**
(**50 sale + 21 router**), via_ir.

**Frontend typecheck:** `tsc --noEmit` → **exit 0**.

**Frontend unit (WS1/WS2-relevant batch, 6 files, 72 tests GREEN):**
- `v1-proof.test.ts` *(new)* — parse/ready/lookup, fail-closed
  `resolveV1ProofForBuy`, `buildV2BuyArgs`.
- `normalized-purchase.test.ts` *(new)* — source tagging, V2 enrichment,
  `NormalizedPurchase` alias, cross-source merge/dedupe ordering, and the
  `joinV2PurchaseEvents` fail-closed suite (complete join, missing-split
  drop+flag, no zero-fill, legit-zero referral preserved, empty-tx incomplete).
- `holder-index-cross-source.test.ts` *(new)* — identity by first-seen order not
  V2 `memberNumber`; a V2 `firstSeat:false` repeat by an existing wallet does
  **not** mint a new identity; ordering by block then logIndex across sources.
- `purchase-events-canonical.test.ts` *(updated)* — canonical key now carries the
  V2 address and still excludes `limit`.
- `purchase-events-incremental.test.ts` *(updated)* — dedupe/order, cursor math,
  plus new source-scan invariants: dormant returns V1 unchanged; `joinIncomplete`
  gates persistence; zero-fill anti-regression.
- `purchase-events-cache.test.ts` — v3 round-trip (source + V2 fields), corrupt /
  version-mismatch fallback, SSR/quota safety.

> Frontend is exercised per-batch in separate vitest processes (the full suite
> OOMs in one process — see Part J). The batch above is the WS1/WS2 surface.

**Architect review:** initial **FAIL** (Part G) → after fix **PASS**.

---

## Part I — Hard invariants verified

| Invariant | How verified | Status |
|-----------|--------------|--------|
| V1 byte-identical while V2 null | Dormant short-circuit returns `v1`; key stable `"v2-pending"`; source-scan test | ✅ |
| Holder Index = master identity (first-seen V1+V2) | `holder-index-cross-source.test.ts` (order, not V2 `memberNumber`) | ✅ |
| V2 `memberNumber` is metadata only | No path assigns identity from it; pinned by test | ✅ |
| No fake on-chain data | `joinV2PurchaseEvents` drops incomplete joins; never zero-fills; not persisted | ✅ |
| Proof flow fails closed | `resolveV1ProofForBuy` ok:false for missing/pending/malformed; placeholder pending | ✅ |
| Cross-source dedupe safe | key = `txHash:logIndex`; V1/V2 tx hashes never collide; tested | ✅ |
| Deploy tooling non-executing & safe | `initialRouter=address(0)`; params template, no secrets; tools read-only | ✅ |

---

## Part J — Open items carried forward (for V2-live, not Wave-1 blockers)

1. **Flip V2 live** — set `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS` +
   `SALE_V2_DEPLOYMENT_BLOCK` after an authorized deploy; everything else
   activates automatically.
2. **Generate the real proof artifact** — run the snapshot pipeline against the
   paused-at-#333 V1 state; the artifact `root` must match the on-chain
   `V1_MEMBER_ROOT`. Until then WS2 stays correctly pending/fail-closed.
3. **Integration-style `scanV2Purchases` test** (architect backlog) — an
   RPC/mock test of the full scan under partial `Routed`/`Purchased` chunk
   failures, beyond the pure-join unit coverage already shipped.
4. **Deploy blockers B1–B7** (from the Execution-Prep report) remain
   live-data / founder-ruling / ops items, not code.
5. **Full vitest in one process OOMs** — keep running per-batch; consider a
   CI shard config before relying on a single-process full run.

---

## Part K — Wave-1 verdict

**Wave 1 is COMPLETE and GREEN.** WS1 (multi-source indexing) and WS2 (V1 proof
flow) are implemented and dormant/fail-closed exactly as required; snapshot and
deploy tooling are in place, compile, and have been dry-run validated read-only on
live V1; audit counts and the Slither reference are synced; the one severe
truth-doctrine finding (V2 zero-fill) was fixed and re-confirmed PASS by the
architect. All guardrails held: **no deploy, no funds, no V1 change, no publish,
no architecture/contract change.** The protocol can move to a V2 deploy when
authorized and funded — Wave 1 added no new code blockers, only the off-chain
artifacts and the dormant frontend wiring that a live V2 will switch on.
