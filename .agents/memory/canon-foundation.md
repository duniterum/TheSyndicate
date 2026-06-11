---
name: Canon foundation (docs/canon/)
description: The Phase-0 consolidated canon layer — what it is, why it isn't guard-enforced yet, and the binding collision rulings.
---

# Canon foundation — `docs/canon/`

Phase 0 created a consolidated canon front door: `00_AUTHORITY_MAP`, `01_FOUNDER_INTENT_MAP`,
`02_SOURCE_OF_TRUTH_TABLE`, `03_GLOSSARY`, `04_DOC_SYNC_CHECKLIST`. It consolidates (does NOT
replace) `DOCUMENTATION_AUTHORITY_MAP.md`, `UNIFIED_PROTOCOL_DOCTRINE_MAP.md`,
`TERMINOLOGY_GLOSSARY.md`, `CANONICAL_REGISTRY.md`.

**Authoritative-by-convention, NOT machine-enforced yet.**
**Why:** the doctrine guard's `CANONICAL_DOCS`/`DOC_BANNED` are hardcoded and scan only their
listed paths + `src/{routes,components,lib}`. The new canon files are deliberately NOT registered,
so they're unscanned. Registering them is a CODE task and will FAIL unless deep-lore/banned terms
the glossary teaches (e.g. "Relic", "9 USDC") are moved onto `**Wrong:**` lines (the guard strips
those). `04_DOC_SYNC_CHECKLIST` records this caveat.

**Binding collision rulings (documented, not code-enforced):** Patron *rank* ($500) ≠ Patron *Seal*
(artifact); Council *rank* confers no governance; Vault umbrella → precise sub-terms (Vault Wallet
70% USDC / Vault Reserve 25% SYN — **same address**, disclose it); **Member = sale buyer** (vs
Holder = any SYN holder) — this is the canonical fix for the protocol-truth vs
data-verification-registry drift; Activity (raw, public) ≠ Chronicle (curated, deep-lore);
Referral (attribution) ≠ Reward (payout), both PENDING; NFT (public) / Artifact (secondary) /
Relic (deep-lore only, banned in live UI).

**How to apply:** treat canon as the doctrine front door. Renaming the Patron/Council ranks,
unifying the members definition in code, and registering canon in the guard are OPEN founder
decisions / code follow-ups — do not execute under a docs-only constraint.
