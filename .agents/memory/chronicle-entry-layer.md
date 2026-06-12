---
name: Chronicle Entry publication layer
description: The terminal admission→entry edge — draft-only, published unreachable, copy>rules, and the test-pinned gotchas around it.
---

# Chronicle Entry layer (admission candidate → Chronicle Entry)

The terminal edge of the adjacency pipeline: `deriveInstitutionalChronicleEntries(candidates)` in `chronicle-entry.ts`, leaf type/logic in `chronicle-entry-registry.ts`. Reads CHRONICLE ADMISSION CANDIDATES only (imports ONLY `chronicle-admission-registry`: candidate type, admission-status type, re-exported `findAdmissionCopyViolations`). Carries the full lineage + on-chain anchor THROUGH the candidate; never reaches register/promotion/review/memory/signal/event or the admission DERIVER.

## Doctrine (frozen rulings)
- **Draft-only.** `resolvePublication(admissionStatus, copyViolations)` can emit `draft | held | rejected` and **NEVER `published`**. `published` exists in the enum only as the target of a FUTURE human/governance act; `superseded` only via `supersedeEntry`. Publication is a human/governance act this layer does not perform.
- **copy > rules.** A carried copy violation REJECTS even an `admitted` candidate. The deriver RE-runs `findAdmissionCopyViolations` from source (single-sourced via the registry re-export) so a stale-clean upstream flag can't publish unsafe copy.
- **register/category = candidate.proposedChronicleRegister/proposedChronicleCategory** (Chronicle domain), NOT the institutional register's category — admission already split those vocabularies.
- **sourceBlock omitted on purpose** — not carried through the candidate; an always-undefined field is dishonest. On-chain anchor honestly via `chronology.{date:null, block:null, txHash}` + optional `sourceTxHash`. Threading real block height is the standing low-scope follow-up.
- Locked, hand-curated `CHRONICLE_ENTRIES` (chronicle-entries.ts, len 3) are NEVER imported/read/mutated; the institutional entry is a SEPARATE derived type that maps onto the locked shape only at the human-publish step.
- Member-living defensively dropped (register !== protocol-institutional) even though admission already excludes it.

## Gotcha — maintainer-note arrays are length-pinned by their guard test
These layers ship a `*_MAINTAINER` notes array whose length is asserted exactly in the test (e.g. chronicle-entry.test.ts "declares exactly N copy-clean maintainer notes"). **Adding/removing a note requires a lockstep edit to that count.** The same test also runs `findForbiddenLanguage`/`findPublicVocabularyViolations` over each note → keep note copy sober (no profit/return/governance-right/etc.).

## supersedeEntry latent gap (recorded, not fixed — no production caller)
`supersedeEntry(original, patch)` is append-only/pure but spreads the original, so the replacement inherits the original publicationStatus + publicationDecision and does NOT re-validate patched copy. Fine today (supersession only ever starts from a draft baseline; tests-only). The future human-publish/correction flow MUST reset publicationDecision to baseline and re-validate patched copy before any `published`.

## Genesis e2e fixture
`mergeInstitutionalEntries(deriveGenesisRegisterEntries(), [])` → admission → entry = **8 candidates → 6 draft + 2 held + 0 published** (member ordinal excluded upstream at admission). Useful regression anchor.

## docs/ is exempt from check-ownership-wording
The wording guard (`scripts/check-ownership-wording.mjs`) excludes `docs/`, `/labs/`, and tests — so sprint reports may quote banned vocab (profit/return/etc.) freely. Don't waste effort sanitizing report prose for the guard.
