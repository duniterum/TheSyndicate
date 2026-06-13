---
name: Proof of Burn rename (founder canon override)
description: Founder overrode canon — burn-recognition term is "Proof of Burn", not "Proof of Fire". RULE — any RENDERED token must be "burn"; only never-rendered code identifiers may stay "fire".
---

The founder renamed the burn-recognition term from **"Proof of Fire" → "Proof of Burn"**, overriding the prior canon (which had mandated "Proof of Fire, never Proof of Burn"; the reference mockups always said "Proof of Burn"). Canon vocabulary is the founder's to change.

**The durable rule:** a `fire` / `PROOF_OF_FIRE` token may remain in code ONLY if it is never rendered to a user. Anything a user can SEE — visible prose, display IDs that surface raw in the UI or a URL, registry kind codes printed even on a `/labs` page — must read `Proof of Burn` / `proof-of-burn` / `proofOfBurn`. "Is it rendered?" is the whole test; the camelCase/UPPER vs kebab spelling is just a hint about whether it tends to be a key (often hidden) or a label (often shown) — verify each case.

**Renamed because they ARE rendered:**
- All visible prose phrases across `src/` + `docs/` (incl. canon docs + display-asserting tests). `attached_assets/` left alone (historical prompt logs).
- Genesis-seed id slug `proof-of-fire-001` → `proof-of-burn-001` — its derived `institutional-entry:genesis:…` id is shown raw on the PUBLIC institutional register and cascades into chronicle/chronology ids.
- Recognition kind code `proof-of-fire-participant` → `proof-of-burn-participant` — printed as raw `<code>` on `/labs/protocol-memory` (it enumerates `RECOGNITION_KIND_BASIS` keys).
- Metric id `proofOfFireCount` → `proofOfBurnCount` — `MetricDisplays` renders `{metric.id}` as visible code; this was a non-obvious leak (a metric *id*, not its label).
- Metric `source` / `hook` display strings (verify drawer) — raw const tokens swapped for "Proof of Burn #001" / "Proof of Burn records".

**Kept (verified NEVER rendered):** const NAMES `PROOF_OF_FIRE_001` / `PROOF_OF_FIRE_FIRST_TIER`, type fields `proofOfFireIndex` / `proofOfFireNumber`, input prop `proofOfFireParticipant`, function `assignProofOfFireNumbers`, component name `ProofOfFireCard` (it renders `PROOF_OF_FIRE_001.label`, whose VALUE is now "Proof of Burn #001"), and the unlinked HTML `id="proof-of-fire"` anchor (nothing links to that hash). **Why kept:** stable internal identifiers / a config-const value already drives the visible label — renaming them is pure refactor + cache-key risk with zero visible benefit. Only touch them in a future explicit atomic refactor.

**Flame:** the ceremonial pivot (amber `#E0902A`, flanking tongues removed, calmed motion) was REVERTED to the bonfire pass (`FLAME = #F97316`, flanking tongues, fuller motion) — see [hero-radial-throne-layout](hero-radial-throne-layout.md).

**Guards:** wording guards don't enforce this term (no "burn" banlist), so the rename trips nothing. Validate with `tsc --noEmit` + the affected vitest files. A rendered-string / display-id regression guard would catch a future flip but isn't built.
