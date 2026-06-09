---
name: Doctrine guard ↔ Authority Map decoupling
description: The doctrine-guard test does NOT read the Authority Map; its canonical-doc list and banned-vocab list are hardcoded and must be updated in lockstep with doc-level reclassifications.
---

# Doctrine guard ↔ Authority Map are decoupled

`src/lib/__tests__/doctrine-guard.test.ts` enforces canonical-doc hygiene using
**two hardcoded arrays**, NOT a live parse of `docs/DOCUMENTATION_AUTHORITY_MAP.md`:

- `CANONICAL_DOCS` — the only docs whose banned-vocab gets scanned.
- `DOC_BANNED` — the regexes that count as banned vocabulary.

**The rule:** reclassifying a doc to CANONICAL *in the Authority Map* (or adding a
new "Superseded doctrines" table row) has **zero** automatic enforcement effect.
The map is documentary; the test is the enforcer; they drift independently.

**Why:** this lets a docs-only doctrine pass run without touching code — you can
register/reclassify docs and add supersession rows safely (guard stays green
because it still scans only its hardcoded list). The flip side: enforcement is
NOT actually live for the new classifications until the test arrays are edited.

**How to apply:**
- Docs-only pass: safe to reclassify docs and add table rows; the only guard
  risk is introducing a `DOC_BANNED` string into one of the *existing* hardcoded
  `CANONICAL_DOCS` (notably `TERMINOLOGY_GLOSSARY.md`, `CONSTITUTION_SUMMARY.md`).
  `**Wrong:`-prefixed lines are stripped before scanning; `/\b9(?:\.00)?\s*USDC\b/`
  is the live "Patron Seal at 9 USDC" trap.
- To make a *new* canonical doc actually enforced, a later **code** pass must add
  it to `CANONICAL_DOCS` and add any new banned phrases to `DOC_BANNED`.
- The "authority map lists every canonical doc" test only checks the hardcoded
  list is present (substring) in the map — never remove those 10 doc paths.
