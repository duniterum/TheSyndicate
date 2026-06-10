---
name: Existing authority-map architecture
description: The Syndicate already has a canon/authority system; it is fragmented across several files plus a hardcoded guard. Future "authority map" work = consolidate + index, never invent taxonomy or rewrite the 140 docs.
---

# The authority/canon system already exists — fragmented

Before proposing any "Protocol Authority Map", know these already exist and are
the real spine:

- `docs/DOCUMENTATION_AUTHORITY_MAP.md` — **binding**. Classifies every doc as
  CANONICAL / OPERATIONAL / HISTORICAL / DEPRECATED, defines the **precedence
  order**, a doctrine reading order, vocabulary doctrine, and the "Superseded
  doctrines" ban table.
- `docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md` — the **four-verb model**: every system
  collapses to exactly one of Money / Time / History / Constitution
  (RAL+Treasury Ledger+Activity=Money; Builder Records+Reputation=Time;
  Artifacts+Chronicle=Memory/History; Governance=Constitution).
- `docs/TERMINOLOGY_GLOSSARY.md` — vocabulary, banned words (ROI/yield/dividend/
  investment…), and the user-facing Simplicity Rule (Identity→Members,
  history→Founders, eras→Chapters, structure→Ranks, memory→Activity).
- `docs/CANONICAL_REGISTRY.md` — points to the CODE registries that are the real
  truth: `chain-registry.ts`, `contract-registry.ts`, `archive-id-registry.ts`,
  ABIs.

**Precedence (critical):** on-chain truth > code registries > execution gates >
canonical docs > operational docs > historical docs. **Code outranks docs.**
So canon docs should be THIN POINTERS to code sources of truth, never restated
values that can drift.

**Enforcement is decoupled** (see doctrine-guard-decoupling.md): the guard's
`CANONICAL_DOCS` / `DOC_BANNED` arrays are hardcoded, not parsed from the map.

**How to apply:** a future "authority map foundation" / `docs/canon/` is a
consolidation + index job — relocate/alias these existing files and add a
source-of-truth table + doc-sync checklist. Do NOT invent a new taxonomy and do
NOT rewrite the ~140 historical docs (they're already classified HISTORICAL).
