# 00 — AUTHORITY MAP (Canon Front Door)

Status: **binding · start here.** This is the single entry point for understanding
The Syndicate's canon. Read this first, then branch to the file you need.

> **The One Rule:** *Code and deployed contracts are the ultimate source of truth.*
> Documentation exists to **consolidate and synchronize** that truth — never to
> override it. When a doc and the code disagree, the code wins and the doc is wrong.

This canon (the `docs/canon/` set) consolidates four previously-fragmented
artifacts — the documentation authority map, the doctrine maps, the terminology
glossary, and the scattered source-of-truth findings — into one navigable layer.
It does **not** delete the underlying docs; those remain for detail and are still
guard-enforced (see *Enforcement* below).

---

## The canon file set

| File | Answers the question |
|---|---|
| `docs/canon/00_AUTHORITY_MAP.md` (this file) | "Where do I start? Which doc wins?" |
| `docs/canon/01_FOUNDER_INTENT_MAP.md` | "Why does each concept exist, and what must it never become?" |
| `docs/canon/02_SOURCE_OF_TRUTH_TABLE.md` | "For concept X, what is the contract / code / doc source and its status?" |
| `docs/canon/03_GLOSSARY.md` | "What is the one approved word for this, and how are name-collisions resolved?" |
| `docs/canon/04_DOC_SYNC_CHECKLIST.md` | "I changed something — what do I update, in what order?" |
| `docs/canon/05_FOUNDATION_FREEZE.md` | "Which architectural layer does this feature belong to, and what rules freeze it against drift?" |
| `docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md` | "How may money / economic data surface, and what stops it becoming prestige?" |
| `docs/canon/07_FOUNDER_PRINCIPLE.md` | "What direction has the founder approved but deliberately *not built yet*?" |
| `docs/canon/08_PROTOCOL_OPERATING_PRINCIPLE.md` | "How should new capability be built — derive from existing truth, or invent new stores?" |
| `docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md` | "Where does each kind of knowledge live, and is it Protocol Knowledge or Institutional Register Memory?" (defers to `src/lib/protocol-knowledge-map.ts`) |

---

## Precedence law (when sources disagree)

1. **On-chain truth** — live read from Avalanche C-Chain (43114).
2. **Canonical code registries** — `src/lib/contract-registry.ts`, `archive-id-registry.ts`, `chain-registry.ts`, `execution-gates.ts`, `syndicate-config.ts`.
3. **Execution gates** — `scripts/check-execution-gates.mjs`, `docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md`.
4. **Canonical docs** — this canon + the CANONICAL class in `docs/DOCUMENTATION_AUTHORITY_MAP.md`.
5. **Operational docs** — runbooks, registries, integration/deployment state (operational entry point: `docs/CANONICAL_REGISTRY.md`).
6. **Historical / Deprecated docs** — record only, **never** authority.

---

## The 12 canonical buckets

Every concept in the protocol belongs to exactly one bucket. Use these as the
mental index for the whole system.

| # | Bucket | Status today | Primary code source |
|---|---|---|---|
| 1 | Core Doctrine & Constitution | LIVE | — (doctrine) |
| 2 | Vocabulary, Legal & Risk | LIVE | `scripts/live-content-rules.json`, `doctrine-guard.test.ts`, `LEGAL_DISCLAIMER` |
| 3 | Authority, Precedence & Doc-Sync | LIVE | `doctrine-guard.test.ts` |
| 4 | Identity / Seat | LIVE (Seat = SYN); Seat Record PENDING | `holder-index.ts`, `contract-registry.ts` |
| 5 | Chapter / Era | LIVE | `chapters.ts` |
| 6 | Rank / Progression | LIVE (recognition only) | `syndicate-config.ts` (`RANKS_V2`, `rankForUsdc`) |
| 7 | Tokenomics / Supply | LIVE (Burn = FUTURE) | `syndicate-config.ts` (`TOKEN_SPEC`, `TOKENOMICS_ALLOCATION`) |
| 8 | Economic / Routing & Revenue | LIVE (sale); other streams PARTIAL/PENDING | `USDC_ROUTING`, sale ABI/hooks, `protocol-truth.ts` |
| 9 | Artifact / NFT (incl. Patronage) | PARTIAL | `archive-config.ts`, `archive-id-registry.ts`, `ARCHIVE_CONTRACT_STATE` |
| 10 | Activity & Chronicle | Activity LIVE; Chronicle PARTIAL/curated | `protocol-events.ts`, `chronicle-entries.ts` |
| 11 | Verification / Transparency | LIVE (metric definition PARTIAL) | `protocol-truth.ts`, `data-verification-registry.ts` |
| 12 | Future Modules (Referral · Reward · Burn · Governance · SeatRecord721) | PENDING / FUTURE | none deployed |

> **Intent vs. catalog:** this table is the *catalog* of future modules and their
> status. The founder's *approved-but-unbuilt direction* and the reasoning behind
> it live in `07_FOUNDER_PRINCIPLE.md`.

---

## Authority classes

Full per-document classification lives in `docs/DOCUMENTATION_AUTHORITY_MAP.md`
(the binding, guard-enforced detailed list). Summary:

| Class | Meaning | May guide future work? |
|---|---|---|
| **CANONICAL** | Current source of truth — doctrine, constitution, gates, vision. | **Yes** |
| **OPERATIONAL** | Current runbooks, registries, integration/contract maps, plans. | **Yes** |
| **HISTORICAL** | Audit snapshot from a previous wave. Kept for record. | No |
| **DEPRECATED** | Superseded; dangerous if referenced as-is. Kept for traceability. | No |

---

## Doctrine reading order

1. `docs/VISION.md` — what it is / is not.
2. `docs/NORTH_STAR_SYSTEM.md` — what we measure (verified members; the loops).
3. `docs/STORY_ENGINE_AND_EMOTIONAL_OPERATING_SYSTEM.md` — how it means / feels / behaves.
4. `docs/INFORMATION_HIERARCHY.md` — how it surfaces.
5. `docs/SCARCITY_STATUS_PERMANENCE_AUDIT.md` — identity / the seat.
6. `docs/RANK_CONSTITUTIONAL_RULING.md` — rank doctrine.
7. **This canon** (`docs/canon/`) — consolidated index, intent, source-of-truth, glossary, sync.
8. `docs/canon/05_FOUNDATION_FREEZE.md` — the architecture constitution: the five-layer model (Truth→Events→Signals→Memory→Story), the Adjacency Law, and the signal/memory/story freezes that stop drift.
9. `docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md` — how economic data may surface; the money≠prestige guardrail.
10. `docs/canon/07_FOUNDER_PRINCIPLE.md` — approved-but-unbuilt strategic direction (the intent register).
11. `docs/canon/08_PROTOCOL_OPERATING_PRINCIPLE.md` — derive, don't invent: build new capability from existing truth, never new stores of duplicated truth.
12. `docs/DOCUMENTATION_AUTHORITY_MAP.md` — full precedence + vocabulary + per-doc classification.

---

## Relationship to the legacy maps

| Legacy doc | Role after consolidation |
|---|---|
| `docs/DOCUMENTATION_AUTHORITY_MAP.md` | **Retained & binding.** The detailed, guard-enforced per-doc classification + superseded-doctrine table. The canon links to it; the canon does not replace it. |
| `docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md` | **Retained.** The four-verb doctrine map (Money / Time / History / Constitution); its navigational role is now indexed here. |
| `docs/TERMINOLOGY_GLOSSARY.md` | **Retained & guard-enforced.** `03_GLOSSARY.md` consolidates it and adds the collision rulings; keep the two in sync. |
| `docs/CANONICAL_REGISTRY.md` | **Retained.** The operational entry point for chain / contract / address / ABI data (which always defers to code registries). |

---

## Enforcement

The doctrine guard (`src/lib/__tests__/doctrine-guard.test.ts`) is the automated
freeze. It scans rendered source (`src/routes`, `src/components`, `src/lib`) and
a hardcoded `CANONICAL_DOCS` list for banned legacy vocabulary.

**Coupling status (updated 2026-06-12, Batch 8):** the guard's `CANONICAL_DOCS`
and `DOC_BANNED` arrays are still hardcoded — *not* parsed from any map. That is
deliberate: a docs-only pass can reclassify docs and add supersession rows
without the guard drifting red. What changed: the `docs/canon/` set is now in
the guard's scanned set, so this canon is **machine-enforced** for banned
vocabulary — except the vocabulary-defining docs (`01_FOUNDER_INTENT_MAP`,
`03_GLOSSARY`, `04_DOC_SYNC_CHECKLIST`), which are intentionally EXEMPT because
they define the banned terms (the guard still pins them as CANONICAL-listed, so
the exemption cannot become a silent omission). The remaining follow-up is
mechanizing the rank-row `DOC_BANNED` regexes, deferred for false-positive risk.
See `docs/canon/04_DOC_SYNC_CHECKLIST.md`.
