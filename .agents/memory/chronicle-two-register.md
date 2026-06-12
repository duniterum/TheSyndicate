---
name: Chronicle two-register classification
description: The register/category model on ChronicleEntry and the invariants future Chronicle work must respect.
---

Chronicle entries carry a two-register classification:
`register ∈ {protocol-institutional, member-living}` plus a finer `category`.

**Invariant — register is DERIVED, never set independently.** `CATEGORY_REGISTER`
is the single-source map from category → register; `registerForCategory()` is the
only way to get an entry's register. Setting `register` by hand on an entry (or
adding a category without a `CATEGORY_REGISTER` row) creates drift that
`validateChronicleClassification` is meant to catch. Add the category mapping,
don't hardcode the register.

**Institutional-significance rule:** founder-authored and system/treasury-wallet
subjects may only enter the **protocol-institutional** register and only when they
clear institutional significance (`requiresInstitutionalSignificance`). This is
the classification-layer expression of the standing doctrine "founder/system
action defaults to Activity, not Story" — person/founder money never auto-promotes
to a member-living Chronicle moment.

**Why:** keeps the Chronicle honest about *whose* memory an entry represents and
prevents founder/system events from masquerading as organic member history. The
`member-living` register is modelled but intentionally near-empty — it fills from
real member events, not seeded content.

**How to apply:** when adding/extending Chronicle entries or the Signal/candidate
pipeline, classify via category→register, respect the institutional gate for
founder/system subjects, and keep the 3 locked entries' ids/subjects/order frozen
(the chronicle-doctrine test pins exactly those 3).
