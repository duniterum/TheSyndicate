# Sprint 14 — Chronicle Chronology Layer — Implementation Report

**Pipeline edge built:** `CHRONICLE ENTRY → CHRONOLOGICAL TIMELINE`
**Posture:** internal, additive, identity-free, deterministic. **Not** Story, **not** Recognition, **not** Governance, **not** publishing.
**Date:** 2026-06-12

---

## 1. Pre-implementation challenge answer

**A) Is Chronicle Chronology the next dependency-valid layer?** Yes. The pipeline already runs `… → Promotion → Institutional Register → Admission → Chronicle Entry`. Chronicle Entries are factual, identity-free institutional records but have **no canonical sense of order** — they sort by derivation, not by when the underlying on-chain fact happened. A truthful temporal foundation is the next missing dependency before any future Chronicle *publication* or Story can be honest about "what happened, in what order." Chronology reads Entries only, so it is adjacency-valid.

**B) Hidden layer missing between Entry and Timeline?** No. The only intermediate concern is *evidence threading*: the verified block height existed on the upstream register entry (`sourceBlock`) but was not carried down to the Chronicle Entry. That is a data-threading gap, not a missing layer. It was closed in T001 (see §2) rather than by inventing a new layer.

**C) Does existing code already implement chronology / sequencing / block ordering / timestamps / milestone or chapter progression?** Partially, in **adjacent but distinct** concerns that must NOT be reused for chronology:
- `protocol-events` orders raw events newest-first for a *windowed activity feed* (a pointer, not a canonical spine).
- Chapters / milestones are **member-ordinal / pulse-derived** (count-derived), never time-derived — using them for order would be a doctrine leak.
- No code ordered **Chronicle Entries** by verified block height. That is genuinely new and is what this sprint builds.

**D) Architectural risk that makes chronology premature?** One, and it is bounded: **no block timestamp is fetched anywhere in the pipeline.** That makes calendar dating impossible today. The resolution is to scope this layer to **ordinal sequence only** (order, never date), hold anything unprovable, and leave `blockTimestamp` as a documented `null` seam. Chronology is therefore not premature — it is correct *as long as it never claims a date.*

---

## 2. Files changed

**New (4):**
- `src/lib/chronology-registry.ts` — pure-data leaf: `ChronologyEntry` type, the status/anchor/confidence vocabulary, `resolveChronology`, `chronologyAnchorKey`, `orderedTimeline`, `isActiveEntryStatus`, and `CHRONOLOGY_MAINTAINER`. Imports **only** the chronicle-entry registry.
- `src/lib/chronology.ts` — the pure deriver `deriveChronologicalTimeline`. Reads Chronicle Entries only (type import + the leaf); no clock, no I/O.
- `src/lib/__tests__/chronology.test.ts` — full spec §13 list + an end-to-end genesis fixture (25 tests).
- `src/routes/labs.chronicle-timeline.tsx` — hidden, `noindex` labs workbench mirroring the entries-preview pipeline through `deriveChronologicalTimeline`.

**Modified (8):**
- `src/lib/chronicle-admission-registry.ts` — `ChronicleAdmissionCandidate` gains optional `sourceBlock?: number`.
- `src/lib/chronicle-admission.ts` — admission deriver threads `sourceBlock` (bigint→number, guarded so `JSON.stringify` never sees a bigint).
- `src/lib/chronicle-entry-registry.ts` — entry `chronology.block` typed `number | null`; "sourceBlock intentionally absent" comment removed.
- `src/lib/chronicle-entry.ts` — entry deriver sets `chronology.block = candidate.sourceBlock ?? null`; deferral note updated (array length unchanged).
- `src/lib/__tests__/signal-adjacency.test.ts` — new `CHRONOLOGY_MODULES` describe asserting the two chronology files import the entry leaf only.
- `src/lib/__tests__/signal-money-guardrail.test.ts` — both chronology files added to `PRESTIGE_MODULES`; new Rule-E magnitude-token describe.
- `src/lib/protocol-knowledge-map.ts` — chronicle node gains the `/labs/chronicle-timeline` surface, the `chronology-registry.ts` registry, and a chronology clause in its `statusNote`.
- `src/routes/labs.index.tsx` — link to the new workbench.

(`src/routeTree.gen.ts` regenerated automatically by the dev server.)

---

## 3. Chronology object shape

`ChronologyEntry` is a **separate 1:1 overlay** of a Chronicle Entry — it never mutates the entry. Fields:

| field | type | meaning |
|---|---|---|
| `chronologyId` | `string` | deterministic, 1:1 with source entry; the **durable** identity |
| `sourceChronicleEntryId` | `string` | the entry this overlay orders |
| `chronologyStatus` | `ordered \| held-no-anchor \| coverage-limited` | where it stands |
| `chronologyType` | `ChronicleCategory` | record type, carried verbatim (factual) |
| `blockNumber` | `number \| null` | verified block height, or null |
| `blockTimestamp` | `number \| null` | **always null today** — no timestamp is fetched; reserved seam |
| `txHash` | `string \| null` | source transaction hash when carried |
| `sequenceNumber` | `number \| null` | 1-based position, **only** for `ordered`; positional, not durable |
| `chapter` | `null` | always null (chapters are count-derived; adjacency forbids reuse) |
| `milestone` | `null` | always null (same reason) |
| `chronologyAnchor` | `block-number \| tx \| deployment \| none` | strongest provable anchor |
| `chronologyConfidence` | `verified \| held` | proven vs held |
| `chronologyReason` | `string` | sober, person-free, magnitude-free explanation |
| `suspectedDuplicateOf` | `string \| null` | id of the earlier ordered twin, when flagged |
| `supersedes` | `string \| null` | id this entry corrects (carried from the entry) |
| `lineage` | `readonly string[]` | full provenance, chronology id prepended |

It carries **no narrative, no interpretation, no invented date, no magnitude, no identity.**

---

## 4. Ordering hierarchy

Spec §3 safest-evidence hierarchy, as implemented in `resolveChronology`:

1. **Verified block timestamp** — *unreachable today* (no timestamp fetched); `blockTimestamp` stays null.
2. **Verified block number** — the **only** anchor that earns a `sequenceNumber`. → `ordered` / `verified`.
3. **Verified tx anchor** — proves *existence*, not *order*. → `held-no-anchor` / `held`.
4. **Deployment anchor** — `RESERVED`; not reachable from entry data today (a deployment with a block is just `block-number`). Documented, never emitted.
5. **Explicit held status** — no anchor at all → `held-no-anchor` / `held`.

The sequence is computed over the **eligible set** (active *and* block-anchored), sorted by **(block number ascending, source-entry-id tie-break)**, so same-block facts and reorg renumberings remain deterministic. `orderedTimeline()` projects just the sequenced subset in ascending order.

---

## 5. Seeded vs pipeline chronology handling

Both paths are treated identically — chronology never distinguishes a genesis-seeded fact from a live pipeline-derived fact; it orders **by carried block evidence alone.**

- **Genesis-seeded facts** (e.g. the membership-sale deployment, Proof of Fire #001) carry their block through the same `sourceBlock → chronology.block` thread, so they earn sequences when block-anchored.
- **Pipeline facts** flow through the same admission → entry thread.
- Live e2e over the genesis seed: **8 chronology entries → 2 ordered, 6 held**:
  - seq 1 — membership-sale-deployment @ block **87,157,852**
  - seq 2 — proof-of-fire-001 @ block **87,703,847**
  - first-liquidity & others — **held** (tx anchor only, or no anchor): existence proven, order not.
- De-duplication of seed-vs-pipeline overlap is the **upstream register's** job (it merges by transaction). Chronology is the *safety net*: if a duplicate slips through, it is flagged (§8), never silently double-sequenced.

---

## 6. Activity relationship

Chronology and Activity are **different roles and must not be conflated**:
- **Activity** = a windowed, newest-first *pointer* to recent on-chain motion (ephemeral attention).
- **Chronology** = the permanent, oldest-first *spine* of canonical order over Chronicle Entries.

Chronology does **not** read the event/activity layer (adjacency forbids it) and does not feed Activity. The labs workbench links across to Activity for orientation only; no data crosses.

---

## 7. Chapter / milestone integration

**None today, by design.** `chapter` and `milestone` are hard `null`:
- Chapters and milestones are **member-ordinal / pulse-derived** (count-derived), not time-derived. Mapping a block-anchored fact onto them would import a non-temporal axis into a temporal layer.
- Adjacency (canon 05 §2.1) forbids chronology from reaching chapter/milestone sources anyway.
- The fields are retained as a **documented future path** (spec §7): a *later* layer may map an anchored entry onto a chapter boundary — but only above this leaf, never inside it.

---

## 8. Duplication prevention mechanism

A fact is "the same on-chain action" only when it shares **BOTH** a block height and a transaction hash. `chronologyAnchorKey(block, tx)` returns `"{block}::{tx}"` — and `null` if either part is missing (block-only or tx-only matches are *not* duplicates; distinct facts can share a block).

When two eligible entries share a key, the **first in canonical order keeps the sequence**; the second is set `coverage-limited`, given `suspectedDuplicateOf = <first id>`, and **retained, never dropped.** Because upstream already dedups by transaction, a flag here is treated as an **upstream bug to surface**, not to swallow.

---

## 9. Versioning / correction handling

Supersession is append-only and respects "one fact, one position":
- A **superseded** entry keeps its block anchor and stays visible, but is `coverage-limited` and **not separately sequenced** — its `supersedes`/active relationship is preserved.
- The **active replacement** holds the timeline position (`ordered`, with the `supersedes` pointer visible).
- `isActiveEntryStatus` excludes **only** `superseded`. A `held` or `rejected` entry that nonetheless carries a block anchor **is still ordered** — chronology orders *facts*; publication is a separate act. (Pinned by test.)

---

## 10. Maintainer intelligence

`CHRONOLOGY_MAINTAINER` is **exactly four** durable notes, kept as data (not just a comment) so a guard test pins their presence and copy-cleanliness:

1. **One chronology risk we are not seeing** — block heights are ordinal, not calendar time; same-block facts and reorgs order by block + id tie-break, deterministic but not a true clock. Never present a block number as a date.
2. **One existing data source we should reuse** — the verified `chronology.block` now on every block-anchored entry is the single ordering source; never re-derive a height elsewhere, never reach into chapters/milestones for order.
3. **One duplication risk chronology can solve** — seed and pipeline facts can describe the same action; chronology flags a second `(block, tx)` twin and withholds its sequence, surfacing the upstream issue instead of double-counting.
4. **One future Story prerequisite that still remains** — a real **block timestamp**. Story narrates over dates; chronology can order but not date. A one-read-per-anchored-block timestamp lookup is the outstanding prerequisite before any dated narrative is honest.

---

## 11. What was intentionally not touched

- **No Story, Recognition, Governance, or publishing** — nothing was published, narrated, scored, or ranked.
- **No Chronicle Entry mutation** — the overlay is a separate object; entries are read-only inputs.
- **No date invention** — `blockTimestamp` stays null; no calendar value is synthesized anywhere.
- **No chapter/milestone wiring** — left null; not reached.
- **No public surface** — the only new surface is a hidden, `noindex`, robots-blocked labs workbench; no public navigation links to it.
- **No money/magnitude in ordering** — order is block-ordinal; amounts never influence position (Rule-E enforced).
- **No upstream layer reached** — admission/register/promotion/review/memory/signal/event layers and the chronicle-entry *deriver* are all untouched by the chronology modules.

---

## 12. Tests added

`src/lib/__tests__/chronology.test.ts` — **25 tests**, covering the full spec §13 list plus the e2e genesis fixture:
- ordering (block asc, id tie-break); determinism (identical re-derivation, snapshot immutability, no source mutation); 1:1 output preserving input order.
- held semantics: tx-only and no-anchor entries held, never sequenced.
- duplication: `(block, tx)` twin flagged + retained, not double-sequenced; same-block/different-tx **not** a duplicate; key requires both parts; defensive id de-dup.
- versioning: superseded retained-but-unsequenced, active holds the slot; **publication-status independence** (held/rejected block-anchored entries still ordered; only `superseded` yields its slot).
- sequence semantics: append-only for a later-block fact **and** the counterpart — a newly evidenced *earlier*-block fact renumbers later facts while `chronologyId` stays stable.
- lineage/purity/immutability; e2e genesis fixture asserting absolute blocks (sale 87,157,852; proof-of-fire 87,703,847).

**Lockstep guard edits:**
- `signal-adjacency.test.ts` — `CHRONOLOGY_MODULES` describe: the two chronology files import the entry leaf only (no upstream, no deriver, no chapter/milestone).
- `signal-money-guardrail.test.ts` — both files in `PRESTIGE_MODULES` + Rule-E magnitude-token scan.
- `protocol-knowledge-map.test.ts` — already pins "every registry exists" and "every surface resolves to a route"; both new entries pass.

---

## 13. QA results

| gate | result |
|---|---|
| `bunx tsc --noEmit` | **exit 0** (clean) |
| `vitest` (chronology, chronicle-entry, chronicle-admission, signal-adjacency, signal-money-guardrail, protocol-knowledge-map, knowledge-map-graph), `--maxWorkers=1` | **479 passed / 479** (7 files) |
| `node scripts/check-ownership-wording.mjs` | **OK — 362 files scanned** |
| route render `/labs/chronicle-timeline` | renders; status distribution **8 entries → 2 ordered, 6 held, 0 coverage-limited, 0 suspected duplicates** |
| architect `evaluate_task` (incl. git diff) | **PASS** — no severe issues; two optional hardening notes applied (see §14) |

---

## 14. Remaining risks

1. **No block timestamp (known, scoped).** The timeline proves *sequence*, never *date*. This is the single outstanding prerequisite for any dated Story; mitigated by holding `blockTimestamp` null and the maintainer note. **Risk only if** a future surface presents a block number as a date.
2. **`sequenceNumber` is positional, not durable.** It is recomputed each derivation, so a newly evidenced earlier-block fact correctly renumbers later facts. Mitigated by an explicit field doc + a dedicated test, and by exposing `chronologyId` as the stable identity. **Risk only if** a future surface persists `sequenceNumber` as an id.
3. **`deployment` anchor is reserved/unreachable.** Documented for the future path; `resolveChronology` can never emit it, so no surface can display it dishonestly. Kept for parity with the established `published`-status "reserved" precedent.
4. **`coverage-limited` is shared** by superseded and suspected-duplicate. Honest (both are "anchored but deliberately withheld") and disambiguated by the non-null `supersedes` / `suspectedDuplicateOf` fields plus distinct reason strings. Minor terminology overlap with the knowledge-map's coverage vocabulary; non-severe.
5. **Adjacency is convention + test-enforced, not type-enforced.** The `CHRONOLOGY_MODULES` guard pins the import surface; a future edit that imports an upstream layer would fail that test rather than the compiler. Acceptable and consistent with the rest of the pipeline.

---

*This sprint builds only `Chronicle Entry → Chronological Timeline`, so that future Chronicle publication and future Story have a truthful temporal foundation. It is not Story, not Recognition, not Governance.*
