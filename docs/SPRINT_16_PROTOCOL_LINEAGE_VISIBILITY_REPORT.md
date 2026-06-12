# Sprint 16 — Protocol Lineage Visibility Layer — Implementation Report

**Layer edge:** `(every pipeline layer, already wired) → a pure read-only projection of the carried trail`
**Scope:** visibility only. EXPOSE the existing pipeline; create NO new intelligence,
NO new pipeline stage, NO Story, NO Recognition, NO Governance, NO DAO, NO invented
dates, NO mutation. Internal-only surface (`noindex`, `/labs`, robots-blocked).
**Verdict:** complete; architect `evaluate_task` = **PASS**, one discoverability gap
(labs-index link) fixed, no other code changes required.

---

## 1. Pre-implementation challenge answer

**A) Is a lineage projection the next dependency-valid step?** Yes — but it is a
*projection*, not a *layer*. Every pipeline stage (Event → Signal → Memory
candidate → Chronicle review → Promotion decision → Institutional Register entry →
Chronicle admission → Chronicle entry → Chronology → Verified timestamp) already
exists and already prepends its own id onto the terminal object's `lineage` trail.
The journey is already *recorded*; it was simply never *re-expressed* as one typed
object. Sprint 16 reads the terminal `ChronologyEntry`, re-expresses its carried
trail, and adds nothing.

**B) Any hidden dependency missing before this can be built?** No. The terminal
`ChronologyEntry` already carries the full `lineage` trail plus every structured
field the projection surfaces (`txHash`, `blockNumber`, `blockTimestamp`,
`sequenceNumber`, `chronologyStatus`, `chronologyConfidence`, `timestampStatus`,
`chronologyReason`). No new read, no new contract, no upstream change.

**C) Does anything already do this?** No surface re-expresses the full journey.
Individual benches each inspect one edge; none parse the breadcrumb trail into a
typed path. Each surface re-parsing the trail string by hand would be the wrong
pattern — hence one pure leaf that does it once.

**D) Architectural risk making it premature?** None. It is a pure, read-only
projection with a single type-only import. Worst case (no events / RPC down) it
degrades to genesis-rooted PARTIAL paths and renders fewer rows; it can never
fabricate a journey, a date, or a stage.

---

## 2. Files changed

| File | Change |
| --- | --- |
| `src/lib/protocol-lineage.ts` | **NEW** pure projection leaf. Types `LineageLayer`/`LineageVerification`/`LineageCompleteness`/`LineageNode`/`LineagePath`; pure `classifyLineageId`, `deriveLineagePath`, `deriveLineagePaths`, `resolveLineageCompleteness`, `lineagePathsByEvent`, `lineagePathsByTxHash`; display maps `STAGE_LABEL`/`COMPLETENESS_LABEL`/`COMPLETENESS_DESCRIPTION`. **One import, `import type` from `./chronology-registry`.** No bigint (blocks are `number`). |
| `src/routes/labs.protocol-lineage.tsx` | **NEW** internal `noindex` labs bench. Runs the same full pipeline as `labs.chronicle-timeline` → terminal chronology → `applyBlockTimestamps` → `deriveLineagePaths`; indexes by event/tx; renders completeness distribution + node chains (terminal → root). |
| `src/lib/protocol-knowledge-map.ts` | Added `/labs/protocol-lineage` to `internalSurfaces` of the **chronicle** and **institutional-register** nodes; both `statusNote`s now cite `src/lib/protocol-lineage.ts` and describe the projection. **No new node** (anti-fragmentation). |
| `src/routes/labs.index.tsx` | Added the `/labs/protocol-lineage` link (one line, in pipeline order after Chronicle timeline) so the bench is discoverable. |
| `src/lib/__tests__/protocol-lineage.test.ts` | **NEW** classify table; identity/no-invented-stages; tx/block/timestamp preservation; current/highest-verified stage; genesis-vs-pipeline; completeness matrix (incl. precedence collisions + "pending stays COMPLETE"); purity/JSON round-trip/read-only key-shape; `buildLineage` PARITY via real `deriveInstitutionalRegister`; lookup indexes; guard-clean copy. |
| `src/lib/__tests__/signal-adjacency.test.ts` | + adjacency describe for `protocol-lineage.ts` (exact-specifier allowlist: type-only `./chronology-registry`, nothing else). |
| `src/lib/__tests__/signal-money-guardrail.test.ts` | + `protocol-lineage.ts` to `PRESTIGE_MODULES` and a Rule-E magnitude-token describe. |

---

## 3. The projection contract

The output is two read-only record types, pinned by the read-only key-shape test:

- **`LineageNode`** — one trail entry, projected verbatim: `id` (the trail string
  exactly), `layer`, `sourceId` (next trail entry toward the root), `sourceType`,
  `status`, `timestamp`, `txHash`, `block`, `verificationStatus`,
  `chronologyPosition`, `lineageReason`.
- **`LineagePath`** — one `ChronologyEntry`, projected 1:1: `chronologyId`,
  `sourceChronicleEntryId`, `sourceEventId`, `sourceTxHash`, `nodes[]` (terminal →
  root, in trail order), `currentStage`, `highestVerifiedStage`,
  `completenessStatus`.

**Invariant:** same entry in → same path out. `deriveLineagePath` reads only the
entry's own fields and its carried `lineage` trail; `trail.map(...)` yields exactly
one node per trail entry, so the projection can neither **invent** nor **drop** a
stage.

---

## 4. Classification table (`classifyLineageId`)

Pure: a string in → a `{ layer, sourceType, genesisSentinel }` out, by deterministic
id prefix.

| Prefix | Layer | sourceType | Genesis sentinel |
| --- | --- | --- | --- |
| `chronology:` | `chronology` | `chronology` | no |
| `chronicle-entry:` | `chronicle-entry` | `chronicle-entry` | no |
| `chronicle-admission:` | `chronicle-admission` | `chronicle-admission-candidate` | no |
| `chronicle-candidate:` | `chronicle-review` | `chronicle-review-candidate` | no |
| `institutional-entry:` (`:genesis:`) | `institutional-register` | `institutional-register-entry[-genesis]` | only if `:genesis:` |
| `promotion-decision:` | `promotion-decision` | `promotion-decision` | no |
| `genesis-seed:` | `promotion-decision` | `genesis-seed-sentinel` | **yes** |
| `memory-candidate:` | `memory-candidate` | `memory-candidate` | no |
| `signal:` | `signal` | `signal` | no |
| `event:` | `event` | `activity-event` | no |
| `genesis-fact:` | `event` | `genesis-fact-sentinel` | **yes** |
| `tx:` / `block:` / `contract:` | `on-chain-anchor` | `transaction`/`block`/`contract-anchor` | no |
| `predates-scanner…` | `on-chain-anchor` | `no-anchor-predates-scanner` | **yes** |
| *anything else* | `unknown` | `unknown` | no (defensive → PARTIAL) |

An unrecognised reference defensively classifies to `unknown` and forces the path to
read PARTIAL rather than be mis-read as a COMPLETE chain.

---

## 5. Per-node enrichment rules

Only nodes that genuinely carry structured truth are enriched; every middle stage is
an honest id-only "carried-through" node.

- **Chronology node** (terminal): `status` = `entry.chronologyStatus`; `timestamp`
  = `entry.blockTimestamp` (the Sprint-15 *verified* value, **never** computed);
  `chronologyPosition` = `entry.sequenceNumber`; `txHash`/`block` carried;
  `verificationStatus` = `entry.chronologyConfidence`.
- **Event node** (root): `status` = `"root"`; `txHash`/`block` carried;
  `verificationStatus` = `verified` if a tx exists, else `carried-through`.
- **On-chain anchor:** `txHash`/`block` carried; `verified`, or `held` for a
  predates-scanner sentinel.
- **All middle stages** (signal, memory, review, promotion, register, admission,
  chronicle-entry): `timestamp`/`txHash`/`block`/`chronologyPosition` = `null`;
  `verificationStatus` = `carried-through`. Their *live* status is intentionally
  **not** re-derived here — that would mean reaching into another layer.

A date therefore appears on **exactly one** node, and only when that node already
proved one.

---

## 6. Completeness precedence & matrix

`resolveLineageCompleteness` is pure and first-match-wins; the order encodes "never
imply more certainty than is proven":

1. `held` — `chronologyStatus === "held-no-anchor"` (existence proven, order not).
2. `coverage-limited` — `chronologyStatus === "coverage-limited"` (a block anchor
   exists but is deliberately withheld so one action holds one position).
3. `rpc-limited` — ordered, but `timestampStatus` is `error`/`unavailable` (order
   known, date not).
4. `partial` — a genesis sentinel is present, **or** the chain has no event node,
   **or** any node is `unknown`.
5. `complete` — a full Activity-event-rooted chain, ordered to a verified height.

Tested cases include precedence collisions (held-over-genesis,
coverage-over-rpc-limited) and the deliberate rule that a still-`pending` timestamp
on an ordered entry **stays COMPLETE** (order is the proof; the date is a non-blocking
overlay).

---

## 7. Stage tracking

`currentStage` = the furthest-along pipeline stage present in the trail (by
`STAGE_ORDINAL`, event=1 … chronology=9; anchors/unknown have no ordinal).
`highestVerifiedStage` = the furthest-along stage whose `verificationStatus` is
`verified`, or `null`. Together they answer "how far has this fact travelled, and how
far is that independently provable?" without any narrative.

---

## 8. Genesis honesty

Foundational facts that predate the event scanner do **not** fake a complete chain.
Their trail roots at a sentinel (`genesis-fact:`, `genesis-seed:`,
`institutional-entry:…:genesis:`, or a `predates-scanner` anchor). Every such path
resolves to **PARTIAL**, with `lineageReason` copy stating plainly that the stage
never ran / no Activity event was recorded. The projection never upgrades a genesis
fact to COMPLETE and never invents a missing upstream stage for it.

---

## 9. Adjacency Law compliance (canon 05 §2.1)

`protocol-lineage.ts` has **exactly one** module import, and it is
`import type { … } from "./chronology-registry"` — its immediate neighbour, type-only.
It imports **no** value, **no** deriver, and **none** of the upstream layers
(chronicle / admission / register / promotion / review / memory / signal / event),
and **no** `wagmi` / `react`. Middle stages are read from the trail the entry already
carries, never by reaching back into another layer. This is enforced in lockstep by a
new `signal-adjacency.test.ts` describe with an exact-specifier allowlist.

---

## 10. Doctrine guardrails

- **No new intelligence:** the projection only re-expresses a carried trail; it
  produces no recommendation, interpretation, or decision.
- **No Story / Recognition / Governance / DAO / publishing:** the read-only key-shape
  test asserts the serialized path contains no `recognition` / `story` /
  `published` / `narrative` / `score` token.
- **No money:** the projection carries no monetary field. `protocol-lineage.ts` is in
  `PRESTIGE_MODULES` and swept by Rule-E (magnitude tokens) in the money guardrail.
- **No invented dates:** a `timestamp` is non-null only on a verified chronology node
  (Sprint-15 value); every other path degrades rather than estimating.
- **Sober, person-free copy:** all `lineageReason` / label / description strings pass
  `check-ownership-wording` and the in-test forbidden-language sweep (no founder /
  hero / roi / return / yield / raised vocabulary).
- **Read-only:** no mutation; the source `ChronologyEntry` objects are never touched.

---

## 11. Lookup indexes

Two pure index builders let a surface answer pointed questions:
`lineagePathsByEvent(paths)` keys each path on its root Activity-event id
(genesis-rooted paths key on the genesis-fact sentinel id), and
`lineagePathsByTxHash(paths)` keys on the source transaction hash. Both skip
null keys and resolve id collisions by deterministic last-write.

---

## 12. The surface (`/labs/protocol-lineage`)

An internal bench, not a product surface: `noindex, nofollow` head meta, an amber
"Internal · Labs · Not production" banner, never linked from public nav, blocked by
`/labs` in robots.txt, excluded from the sitemap. It runs the **same** full pipeline
the other benches run (events → signals → memory → review → decisions → register →
merge genesis seed → admission → entries → chronology), threads verified block
timestamps via `collectAnchoredBlockNumbers` / `useBlockTimestamps` /
`applyBlockTimestamps`, then projects `deriveLineagePaths`. It shows source-event /
path / completeness counts, a completeness distribution, and per-path node chains
(terminal → root) with stage labels, verification status, position, block, and a UTC
date only where verified. With no live events yet loaded it still renders the
genesis-rooted paths (verified at first paint: 8 paths = 2 genesis-PARTIAL + 6 HELD),
demonstrating graceful degradation.

---

## 13. Knowledge-map harmonization (anti-fragmentation)

No new knowledge-map node was added — a lineage *projection* is not a new pipeline
*layer*, and adding a node would have forced a canon-09 authority-map edit for a
surface that creates nothing. Instead `/labs/protocol-lineage` was added to the
`internalSurfaces` of the two nodes whose facts it makes visible (chronicle,
institutional-register), and both `statusNote`s now cite `src/lib/protocol-lineage.ts`
and describe the read-only projection. The structural knowledge-map tests (every
surface resolves to a route file; any `statusNote` cites a `.ts` file) pass unchanged.

---

## 14. Tests + lockstep guards

`protocol-lineage.test.ts` covers: the classification table; identity preservation
(node id == trail string); no invented / dropped stages; tx / block / timestamp
preservation; current & highest-verified stage; genesis-vs-pipeline start; the full
completeness matrix incl. precedence collisions and `rpc-limited` and "pending stays
COMPLETE"; purity (no input mutation) and JSON round-trip; the read-only key-shape /
no-forbidden-token assertion; `buildLineage` **PARITY** (drives the real
`deriveInstitutionalRegister` and asserts the projected node ids equal the live trail
suffix); the lookup indexes; and guard-clean copy. Lockstep guards: the adjacency
describe in `signal-adjacency.test.ts` and the `PRESTIGE_MODULES` + Rule-E additions
in `signal-money-guardrail.test.ts`.

---

## 15. Validation results

- `npx tsc --noEmit` — **0 errors** (full project, after `routeTree.gen.ts` regen).
- Targeted `vitest run --maxWorkers=1` across 11 files (protocol-lineage, chronology,
  chronicle-entry, chronicle-admission, institutional-register ×3, signal-adjacency,
  signal-money-guardrail, protocol-knowledge-map, knowledge-map-graph) — **696
  passed**; knowledge-map pair re-run after the labs-index link — **42 passed**.
- `check-ownership-wording` — **OK (365 files scanned)**.
- Route renders cleanly (8 lineage paths visible before live events finish loading;
  no new console errors — only the known DEV-only wallet-resync hook noise).
- Architect `evaluate_task` — **PASS** (purity, adjacency, no doctrine leak,
  completeness precedence, genesis honesty all confirmed); the one noted gap (labs
  index link) is fixed.
- Production `vite build` is **not** used to validate (known cgroup-OOM ceiling in
  transform); validation is tsc + vitest + dev-server render, per standing practice.

---

## 16. What this does NOT do — boundaries & steward note

This layer is deliberately small and final-for-now. It does **not**: create a new
pipeline stage; publish anything; generate Story, Recognition, narrative, or a date;
confer governance or any right; touch money; or mutate the objects it reads. It is a
*window onto* the pipeline, not a new part of it.

Future modules that may build *on top of* this projection — and the guardrails they
must keep — include: a public, curated provenance view (must stay identity-blind and
amount-blind, and must inherit the same "never imply certainty" completeness ladder);
dated Story (only ever from `verified` chronology timestamps, never PARTIAL/HELD); and
a member-living lineage (reserved for DAO ratification, must remain organic and never
flow money into a tier). The steward's standing rule holds: the lineage may show *that*
a fact travelled and *how far it is provable* — it must never narrate *why* it
mattered. That judgement stays with humans.
