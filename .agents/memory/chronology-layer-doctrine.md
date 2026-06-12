---
name: Chronicle Chronology layer doctrine
description: How the Chronicle Entry → Chronological Timeline overlay orders facts; what it holds and never invents.
---

# Chronicle Chronology layer (pipeline edge: Chronicle Entry → Chronological Timeline)

The temporal OVERLAY over Chronicle Entries. A `ChronologyEntry` is a SEPARATE 1:1 object — it never mutates the entry. Lives in `src/lib/chronology-registry.ts` (leaf) + `src/lib/chronology.ts` (deriver `deriveChronologicalTimeline`).

## Rules (the non-obvious doctrine)
- **Order by verified block height ONLY.** `block-number` is the only anchor that earns a `sequenceNumber`. Sort key = (blockNumber asc, source-entry-id tie-break).
- **Hold the unprovable.** A `tx` anchor proves EXISTENCE, not ORDER → `held-no-anchor`, never sequenced. No anchor → also `held-no-anchor`.
- **`sequenceNumber` is POSITIONAL, not durable.** Recomputed each derivation; a newly evidenced EARLIER-block fact renumbers later facts (correct — it takes its rightful slot). The stable identity is `chronologyId`. Never persist sequenceNumber as an id. (The "append-only" intuition only holds for later-block arrivals.)
- **`blockTimestamp` is ALWAYS null.** No block timestamp is fetched anywhere in the pipeline → chronology proves SEQUENCE, never DATE. A one-read-per-anchored-block timestamp lookup is THE outstanding prerequisite before any dated Story is honest. Never present a block number as a date.
- **`chapter`/`milestone` are ALWAYS null.** They are member-ordinal / pulse-derived (count-derived, NOT time-derived); adjacency forbids reaching them for order. Reserved as a future path ABOVE this leaf only.
- **`coverage-limited` is shared** by BOTH superseded AND suspected-duplicate (both = "has a block anchor but deliberately withheld so one fact holds one position"). Disambiguate via non-null `supersedes` / `suspectedDuplicateOf` + distinct reason strings.
- **`isActiveEntryStatus` excludes ONLY `superseded`.** So a `held` or `rejected` entry that carries a block anchor IS still ordered — chronology orders FACTS; publication is a separate act.
- **Duplicate key requires BOTH block AND tx** (`chronologyAnchorKey` → `"{block}::{tx}"`, else null). Block-only or tx-only is NOT a duplicate. Second twin flagged `suspectedDuplicateOf` + `coverage-limited`, RETAINED never dropped — a flag signals an UPSTREAM dedup bug to surface, not swallow (register dedups by tx upstream).
- **`deployment` anchor is RESERVED/unreachable** from entry data today; `resolveChronology` never emits it (parity with the `published` publication-status "reserved" precedent). Keep documented, don't remove.

## Adjacency & guards
- Chronology modules import the **chronicle-entry registry leaf ONLY** (entry type + publication-status type). Never the entry DERIVER, never upstream layers, never chapters/milestones. Pinned by `CHRONOLOGY_MODULES` describe in `signal-adjacency.test.ts`.
- Both files are in `PRESTIGE_MODULES` + covered by a Rule-E magnitude-token scan in `signal-money-guardrail.test.ts` — order is block-ordinal, magnitude NEVER influences position.
- `CHRONOLOGY_MAINTAINER` = exactly 4 notes, kept as DATA (guard-pinned count + copy-clean).

## Evidence threading (the one upstream change)
The verified block existed on the register entry as `sourceBlock` but wasn't carried to the Chronicle Entry. Threaded down: admission candidate gains `sourceBlock?: number` (bigint→Number guarded so JSON.stringify never sees a bigint) → entry `chronology.block = candidate.sourceBlock ?? null`.

## Live genesis e2e (truth anchors)
8 chronology entries → 2 ordered, 6 held: seq1 membership-sale-deployment @ block 87,157,852; seq2 proof-of-fire-001 @ 87,703,847; first-liquidity held (tx-only).
