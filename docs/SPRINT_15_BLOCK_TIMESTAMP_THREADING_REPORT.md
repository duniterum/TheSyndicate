# Sprint 15 — Block Timestamp Threading — Implementation Report

**Layer edge:** `Chronological Timeline → Verified block timestamp metadata`
**Scope:** metadata only. No Story, no Chronicle publishing, no Recognition, no
Governance, no new contracts, no ordering change, no inferred/estimated dates.
**Verdict:** complete; architect `evaluate_task` = PASS, no code fixes required.

---

## 1. Pre-implementation challenge answer

**A) Is Block Timestamp Threading the next dependency-valid layer after Chronicle
Chronology?** Yes. Sprint 14 left every chronology entry ordered by *verified
block height* with `blockTimestamp: null` hardcoded. A timestamp is a pure,
additive read keyed on data the layer already proves (the block number). It adds
no new upstream dependency and unlocks future dated Story/Chronicle.

**B) Any hidden dependency missing before timestamps can be added?** No. The
chronology entry already carries `blockNumber` (the only input a timestamp lookup
needs). The fetch is a leaf read; nothing upstream must change.

**C) Does the codebase already fetch block timestamps anywhere?** Not for
chronology. There is a `chain-time` head-of-chain helper (`useChainTip`), but it
reads the *current* tip, not historical per-block timestamps — reusing it would
be an approximation, which is forbidden. So a dedicated, verified per-block read
was required. (We deliberately do **not** import `chain-time`.)

**D) Architectural risk making threading premature?** None. Ordering is already
proven by block height and is independent of any timestamp. Threading is a pure
overlay that cannot alter order; worst case (RPC down) is a soft `pending`/`error`
state with no date — the layer still renders and still orders.

---

## 2. Files changed

| File | Change |
| --- | --- |
| `src/lib/chronology-registry.ts` | + `TimestampStatus`, `TimestampSource`, `BlockTimestampFetch`, `BlockTimestampLookup` types; + 4 `ChronologyEntry` fields (`timestampStatus`/`timestampSource`/`timestampConfidence`/`timestampReason`); pure `resolveBlockTimestamp()` + pure `applyBlockTimestamps()` overlay; fixed stale "ALWAYS null" `blockTimestamp` comment; refreshed maintainer notes #1 & #4 in place (length kept = 4). **No new imports.** |
| `src/lib/chronology.ts` | Replaced hardcoded `blockTimestamp: null` with `...resolveBlockTimestamp(blockNumber, undefined)`. Deriver signature unchanged (1-arg). |
| `src/lib/chronology-timestamps.ts` | **NEW** I/O hook. Pure helpers `collectAnchoredBlockNumbers` / `blockTimestampQueryKey` / `buildBlockTimestampLookup` + `useBlockTimestamps` (TanStack `useQueries`). Imports only `react` / `@tanstack/react-query` / `wagmi` / `./chronology-registry`. |
| `src/routes/labs.chronicle-timeline.tsx` | Wired `collect → useBlockTimestamps → applyBlockTimestamps`; added verified/pending counts, status badge, UTC value when verified, source; refreshed stale "no timestamp fetched" copy. |
| `src/lib/__tests__/chronology.test.ts` | + §10 matrix (resolver classification, overlay purity/no-reorder, helpers, genesis end-to-end). |
| `src/lib/__tests__/signal-adjacency.test.ts` | + adjacency describe for `chronology-timestamps.ts` (exact-specifier allowlist). |
| `src/lib/__tests__/signal-money-guardrail.test.ts` | + `chronology-timestamps.ts` to `PRESTIGE_MODULES` and the Rule-E magnitude sweep. |
| `src/lib/protocol-knowledge-map.ts` | Chronicle node `statusNote` now cites `src/lib/chronology-timestamps.ts` and the timestamp-threading behaviour. |

---

## 3. Timestamp source

**Chain RPC `getBlock` only.** `useBlockTimestamps` calls
`publicClient.getBlock({ blockNumber: BigInt(n) })` and reads `block.timestamp`
(unix seconds), converting the `bigint` to a plain `number` before it ever enters
the cache (bigints are not JSON-serialisable). `timestampSource` is
`"chain-rpc-getblock"` on the verified path and `"none"` on every other path.
No approximate dates, no local clock, no deployment-date guess, no explorer
scraping, no hardcoded dates.

---

## 4. Timestamp object / fields

Five fields populated by the pure `resolveBlockTimestamp(blockNumber, fetched?)`:

| Field | Type | Notes |
| --- | --- | --- |
| `blockTimestamp` | `number \| null` | Unix **seconds**. Non-null **only** on the verified path. |
| `timestampStatus` | `verified \| unavailable \| pending \| error \| not-applicable` | |
| `timestampSource` | `"chain-rpc-getblock" \| "none"` | Only `chain-rpc-getblock` when verified. |
| `timestampConfidence` | reuses `ChronologyConfidence` | `"verified"` only when verified; otherwise `"held"`. |
| `timestampReason` | `string` | Sober, person-free, copy-guard-clean. |

**Classification rules (the only date-carrying path is `verified`):**

| Input | Status | Date | Confidence | Source |
| --- | --- | --- | --- | --- |
| `blockNumber === null` | `not-applicable` | null | held | none |
| anchored, no fetch yet | `pending` | null | held | none |
| `{ state: "verified", unix }` | `verified` | **unix** | verified | chain-rpc-getblock |
| `{ state: "unavailable" }` | `unavailable` | null | held | none |
| `{ state: "error" }` | `error` | null | held | none |

---

## 5. Cache / performance behavior

- **Dedupe before lookup:** `collectAnchoredBlockNumbers` returns unique,
  ascending block heights; `useBlockTimestamps` also re-dedupes internally. One
  query per unique block, never per render.
- **Immutable cache:** a mined block's timestamp never changes, so each query
  uses `staleTime: Infinity`, `gcTime: Infinity`, `retry: false`. Once verified,
  it is cached for the session and refetched zero times.
- **Stable identities:** query key is `["block-timestamp", chainId, n]`,
  namespaced by chain id so the same height on a different chain cannot collide.
- **No heavy infra:** plain TanStack `useQueries` over the existing wagmi
  `publicClient`. No indexer, no background job, no new service.

---

## 6. Failure / partial handling (fail soft)

- RPC unavailable / SSR (no `publicClient`) → queries `enabled: false` → every
  anchored entry reports `pending`, no date, **entry still rendered and still
  ordered**.
- Query error → `error` status, null date, `held` confidence — entry retained.
- Block queried but no timestamp number → `unavailable` (never `verified`).
- `buildBlockTimestampLookup` maps `success`-without-a-number to `unavailable`,
  `error` to `error`, and `pending`/missing to **absent** (the resolver then
  reports `pending`). **There is no code path that produces a date without a real
  unix number.** Dates are never invented and never marked verified on failure.

---

## 7. Ordering rules confirmation

**Unchanged.** Ordering is still `block number ascending` with
source-entry-id tie-break, assigned in the deriver **before any timestamp
exists**. `orderedTimeline` sorts by `sequenceNumber` alone. `applyBlockTimestamps`
is `chronology.map(c => ({ ...c, ...resolveBlockTimestamp(...) }))` — structurally
it can change only the five timestamp fields and preserves array length and order.
Proven empirically by a test that feeds a **contradicting** lookup (earlier block
gets a *later* unix than a later block) and asserts the order and every
`sequenceNumber`/`chronologyStatus` are unchanged. **Timestamp is metadata only;
it is never an ordering input.**

---

## 8. Seeded vs pipeline handling

One path for both. The deriver baseline (`resolveBlockTimestamp(blockNumber,
undefined)`) runs for every entry regardless of origin, and `applyBlockTimestamps`
overlays the same lookup uniformly. The genesis-seed end-to-end test confirms
every anchored seeded entry is `pending` at baseline and becomes `verified` from
the identical lookup path used by pipeline-derived entries. No seeded-only
timestamp rule exists beyond source integrity.

---

## 9. Labs / inspection updates

`/labs/chronicle-timeline` (internal, `noindex`, not in public nav) now shows per
the spec: block number, **timestamp status badge**, **UTC value when verified**
(deterministic `formatUtc`), **timestamp source**, and the reason via status. The
header gained `Timestamps verified` / `Pending` counts. Live verification: the two
genesis anchored entries (membership-sale-deployment block and Proof of Fire #001
block) resolved to **verified** timestamps read from chain on first render
(`verified: 2, pending: 0`). No public Story exposed; public Chronicle untouched.

---

## 10. Future Story compatibility (documented, NOT built)

With verified `blockTimestamp` now threaded as metadata, a future Story/Chronicle
layer can — **without inventing dates** — build: a **calendar timeline**,
**date-grouping** (day/month/year buckets), **episode ordering** by real time,
**chapter-aligned narrative** (block-anchored chapters dated by their boundary
blocks), and **milestone chronology**. None of these are implemented now; the
sprint only supplies the verified date input they will require.

---

## 11. Maintainer intelligence

- **One timestamp-risk you may not see:** the query key embeds `chainId`, which is
  `undefined` until the wagmi client resolves. Queries are disabled while
  undefined (so no bad fetch fires), but undefined-keyed cache entries persist
  under `gcTime: Infinity`. Negligible today; if multi-chain ever matters, gate
  the key on a resolved chain id.
- **One existing source/cache to reuse:** the wagmi `publicClient` (already wired
  app-wide) is the verified read surface — no new provider needed. Note: the
  `chain-time` / `useChainTip` head-of-chain helper is intentionally **not**
  reused, because it reads the current tip (an approximation for historical
  blocks), which the no-estimated-dates rule forbids.
- **One future Story prerequisite still missing:** a *coverage/window-complete*
  signal. Story date-grouping over "all of history" needs assurance the timestamp
  set is complete; today verification is per-anchored-block and on-demand.
- **One low-scope improvement (not done, fits later):** surface a single
  "verified N / M anchored" coverage line on the labs route — pure presentation,
  no new fetch.

---

## 12. What was intentionally NOT touched

- Chronological **ordering** rules (block height + tie-break) — unchanged.
- The deriver signature (`deriveChronologicalTimeline` stays 1-arg).
- Story, Recognition, Governance, AI, contracts — none built.
- Public Chronicle / public Story surfaces — untouched.
- No estimated/inferred/local-clock/explorer/hardcoded dates introduced.
- `chain-time` approximation helper — deliberately not imported.
- Production build OOM — not fought (per spec).

---

## 13. Tests added

`chronology.test.ts` §10 matrix:
- verified is the **only** path that carries a date, and only from a real unix;
- no undated state (`not-applicable`/`pending`/`unavailable`/`error`) carries a date;
- `unavailable`/`error` → null date + `held`;
- failed/absent lookup keeps the entry (never dropped) and invents no date;
- ordering stays block-based under a **contradicting** lookup (no reorder; seq + status preserved);
- overlay changes **only** the five timestamp fields (field-by-field diff);
- overlay is deterministic; introduces no Story/Recognition field names;
- every `timestampReason` is copy-clean (`findForbiddenLanguage` + `findPublicVocabularyViolations`);
- `collectAnchoredBlockNumbers` dedupes/sorts/drops unanchored;
- `blockTimestampQueryKey` is chain-namespaced;
- `buildBlockTimestampLookup` maps success→verified, error→error, pending/missing→absent, and success-without-a-number→unavailable (never invents a date);
- genesis end-to-end: baseline all anchored `pending` / unanchored `not-applicable`; seeded + applied share one path; order intact after dating.

Lockstep guards:
- `signal-adjacency.test.ts`: new describe proving `chronology-timestamps.ts`
  imports only `react`/`@tanstack/react-query`/`wagmi`/`./chronology-registry`,
  and never the deriver, upstream pipeline layers, chapters/milestones, or
  `chain-time`.
- `signal-money-guardrail.test.ts`: `chronology-timestamps.ts` added to
  `PRESTIGE_MODULES` and the Rule-E magnitude-token sweep (correctly **not** added
  to `CHRONOLOGY_MODULES`, since it legitimately imports wagmi).

---

## 14. QA results

| Check | Result |
| --- | --- |
| `tsc --noEmit` | **PASS** (exit 0) |
| chronology + signal-adjacency + signal-money-guardrail | **438 passed** |
| chronicle-entry + chronicle-admission + protocol-knowledge-map + knowledge-map-graph | **78 passed** |
| ownership / forbidden-language guard (`check-ownership-wording.mjs`) | **OK** (363 files scanned) |
| route render `/labs/chronicle-timeline` | **PASS** (HTTP 200; verified: 2, pending: 0) |
| architect `evaluate_task` (includeGitDiff) | **PASS**, no code fixes required |
| production build | not run (known OOM; validated via tsc + vitest + dev server per doctrine) |

---

## 15. Remaining risks

- **Coverage completeness (low):** verification is per-anchored-block and
  on-demand; there is no "all history dated" guarantee. A future Story date-group
  must gate on a completeness flag (see §11), not assume the set is full.
- **Undefined chainId cache entries (negligible):** see §11; harmless under the
  current single-chain setup.
- **No render test for `useBlockTimestamps` (low):** acceptable — all decision
  logic lives in the pure, fully-tested helpers; the hook is thin glue over
  `useQueries`.
- **RPC variability (handled):** a flaky/slow RPC yields `pending`/`error`, never
  a wrong date; the layer degrades to block-height ordering with no date, exactly
  as designed.
