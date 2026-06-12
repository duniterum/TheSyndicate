---
name: Doctrine guard ↔ Authority Map coupling
description: The doctrine-guard test's CANONICAL_DOCS scan is now coupled to the Authority Map's CANONICAL class (canon + constitutional docs scanned); arrays stay hardcoded by design; vocabulary-defining canon docs are an explicit exemption.
---

# Doctrine guard ↔ Authority Map — coupled (with a deliberate exemption)

`src/lib/__tests__/doctrine-guard.test.ts` enforces canonical-doc hygiene via
**two hardcoded arrays** — `CANONICAL_DOCS` (docs whose banned-vocab is scanned)
and `DOC_BANNED` (the banned regexes). They are still hardcoded, **not** a live
markdown parse of `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

**Why arrays stay hardcoded (do NOT "fix" this):** keeping the list hardcoded
preserves the property that a *docs-only* pass can reclassify docs / add
supersession rows without the guard drifting red. A reverse markdown-parse test
would destroy that property. Couple by *extending the hardcoded list*, never by
parsing the map at test time.

**What IS coupled now (2026-06-12):** the guard's `CANONICAL_DOCS` was
widened to match the Authority Map's CANONICAL class — the constitutional docs
(`NORTH_STAR_SYSTEM`, `INFORMATION_HIERARCHY`, `PROTOCOL_EXECUTION_CONTROL_SYSTEM`)
and the `docs/canon/` set (00,02,05,06,07,08; 09 was already in). The canon is
now machine-enforced for banned vocab, closing the "authoritative-by-convention,
not machine-enforced" gap the canon front-door itself flagged.

**The vocabulary-defining exemption (key ruling):** `VOCABULARY_DEFINING_DOCS` =
canon `01_FOUNDER_INTENT_MAP`, `03_GLOSSARY`, `04_DOC_SYNC_CHECKLIST`. They are
CANONICAL authority but are **EXEMPT** from the banned-vocab scan, because they
*define* the banned terms (the glossary lists "Relic" as deep-lore-only, etc.) —
scanning them is self-defeating. Same pattern as `protocol-language.ts` being
exempt from its own `findForbiddenLanguage` scan, and the Authority Map's own
"Superseded doctrines" table not being self-scanned. A drift test pins them as
CANONICAL-listed in the map so the exemption can never silently drop a doc.

**Still deferred:** mechanizing the rank-row `DOC_BANNED` regexes
("Founder"/"Genesis Circle" as a rank, etc.) — they false-positive against
legitimate cohort/chapter usage, so they remain a low-priority hardening item.

**How to apply:**
- Before adding ANY doc to `CANONICAL_DOCS`, grep it for the 8 `DOC_BANNED`
  patterns on non-`**Wrong:`-prefixed lines; only add if clean (or exempt it if
  it is vocabulary-defining). `/\b9(?:\.00)?\s*USDC\b/` is the live "Patron Seal
  at 9 USDC" trap; `**Wrong:`-prefixed lines are stripped before scanning.
- Every doc in `CANONICAL_DOCS` AND in `VOCABULARY_DEFINING_DOCS` must appear
  (substring) in `docs/DOCUMENTATION_AUTHORITY_MAP.md` or its two listing tests
  fail — keep the map's CANONICAL section in sync when adding a doc.
- `docs/DOCUMENTATION_AUTHORITY_MAP.md` itself can NEVER be scanned (its
  Superseded-doctrines table defines every banned term).
