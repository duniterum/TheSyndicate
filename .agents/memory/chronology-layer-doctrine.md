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
- **`blockTimestamp` is THREADED as verified metadata (Sprint 15), still NEVER an ordering input.** A verified per-block timestamp is read on demand (`getBlock`) and overlaid; ordering remains block-height-only. Only the `verified` path carries a date — `pending`/`unavailable`/`error`/`not-applicable` all stay null (`held`). Dates are NEVER invented/estimated; fail soft. Never present a block number as a date.
  - Pure: `resolveBlockTimestamp(block, fetched?)` classifies → 5 fields (`blockTimestamp`/`timestampStatus`/`timestampSource`/`timestampConfidence`(reuses ChronologyConfidence)/`timestampReason`). Pure overlay `applyBlockTimestamps(chronology, lookup)` = `map(c=>({...c,...resolve}))` → can change ONLY those 5 fields; deriver stays 1-arg (seeds baselines via `resolveBlockTimestamp(block, undefined)` = pending/not-applicable).
  - I/O lives in `src/lib/chronology-timestamps.ts` (`useBlockTimestamps`, TanStack `useQueries`, key `["block-timestamp",chainId,n]`, staleTime+gcTime Infinity since a mined block's time is immutable, SSR-safe via `enabled`). **`chain-time`/`useChainTip` reads the current TIP — NEVER reuse it for historical blocks (that's an approximation, forbidden).**
- **`chapter`/`milestone` are ALWAYS null.** They are member-ordinal / pulse-derived (count-derived, NOT time-derived); adjacency forbids reaching them for order. Reserved as a future path ABOVE this leaf only.
- **`coverage-limited` is shared** by BOTH superseded AND suspected-duplicate (both = "has a block anchor but deliberately withheld so one fact holds one position"). Disambiguate via non-null `supersedes` / `suspectedDuplicateOf` + distinct reason strings.
- **`isActiveEntryStatus` excludes ONLY `superseded`.** So a `held` or `rejected` entry that carries a block anchor IS still ordered — chronology orders FACTS; publication is a separate act.
- **Duplicate key requires BOTH block AND tx** (`chronologyAnchorKey` → `"{block}::{tx}"`, else null). Block-only or tx-only is NOT a duplicate. Second twin flagged `suspectedDuplicateOf` + `coverage-limited`, RETAINED never dropped — a flag signals an UPSTREAM dedup bug to surface, not swallow (register dedups by tx upstream).
- **`deployment` anchor is RESERVED/unreachable** from entry data today; `resolveChronology` never emits it (parity with the `published` publication-status "reserved" precedent). Keep documented, don't remove.

## Adjacency & guards
- Chronology modules import the **chronicle-entry registry leaf ONLY** (entry type + publication-status type). Never the entry DERIVER, never upstream layers, never chapters/milestones. Pinned by `CHRONOLOGY_MODULES` describe in `signal-adjacency.test.ts`.
- **`chronology-timestamps.ts` (the I/O hook) is the ONE chronology module allowed to touch wagmi**, so it is deliberately kept OUT of `CHRONOLOGY_MODULES` (that block forbids wagmi). It has its OWN dedicated adjacency describe in `signal-adjacency.test.ts` (exact-specifier allowlist: only `react`/`@tanstack/react-query`/`wagmi`/`./chronology-registry`; never the deriver/upstream/chapters/milestones/`chain-time`). It IS added to `PRESTIGE_MODULES` + the Rule-E sweep alongside the other two.
- The other two files are in `PRESTIGE_MODULES` + covered by a Rule-E magnitude-token scan in `signal-money-guardrail.test.ts` — order is block-ordinal, magnitude NEVER influences position.
- `CHRONOLOGY_MAINTAINER` = exactly 4 notes, kept as DATA (guard-pinned count + copy-clean).

## Evidence threading (the one upstream change)
The verified block existed on the register entry as `sourceBlock` but wasn't carried to the Chronicle Entry. Threaded down: admission candidate gains `sourceBlock?: number` (bigint→Number guarded so JSON.stringify never sees a bigint) → entry `chronology.block = candidate.sourceBlock ?? null`.

## Live genesis e2e (truth anchors)
8 chronology entries → 2 ordered, 6 held: seq1 membership-sale-deployment @ block 87,157,852; seq2 proof-of-fire-001 @ 87,703,847; first-liquidity held (tx-only).
