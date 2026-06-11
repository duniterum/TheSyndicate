---
name: Foundation freeze (architecture constitution)
description: The frozen 5-layer protocol architecture + adjacency law; where it lives and the non-obvious constraints it binds.
---

# Foundation freeze — the architecture constitution

Canon home: `docs/canon/05_FOUNDATION_FREEZE.md` (wired into the front door
`00_AUTHORITY_MAP.md` file-set table + reading order). Read the doc for the full
model; this file holds only the durable, non-obvious constraints.

## Non-obvious lessons (not derivable by skimming the doc)

- **Adjacency Law has ONE sanctioned exception:** MEMORY consumes SIGNALS *and*
  EVENTS directly (raw Activity ingestion). Everything else is strict-adjacent. The
  hard invariants that must never break: only EVENTS read the chain; STORY reads only
  MEMORY (never the chain). Stating the law as pure "only the layer directly above"
  self-contradicts — keep the carve-out explicit.
- **Activity is ruled to live in MEMORY**, not EVENTS, even though the EVENTS pipeline
  produces it (`protocol-events.ts` = the persisted feed/surface = MEMORY). Don't
  re-list that file under EVENTS or you reintroduce a two-layer-home contradiction.
- **The SIGNALS layer is FUTURE (not built).** Subject routing already exists as
  `chronicleEligibleForKind`; the new layer only adds Tier + Type. Proposed home: a
  pure-data `signal-registry.ts` leaf. It is additive, not a rewrite.
- **Signal scarcity invariant:** monetary size NEVER raises a signal tier (the rule
  that keeps "no pay-to-appear" true); the S3+ threshold rises with membership.
- **Rank renames (Patron→Benefactor/Steward, Council→Circle/Inner Table) are
  RECOMMENDED but DEFERRED — an OPEN founder decision, NOT enacted.** Enacting is a
  code/taxonomy change. The binding rule until then is disambiguation (never bare
  "Patron"/"Council"), per `03_GLOSSARY.md` rulings #1–#2.
- **This freeze is authoritative-by-convention, NOT machine-enforced.** The doctrine
  guard scans only `src/{components,routes,lib}`; `docs/` is exempt, so canon docs can
  name banned vocab freely, but adding/registering them with the guard is a code follow-up.

**Why:** the protocol got complex enough that drift (parallel architectures) became
the top risk, not missing features. The five-layer placement test + adjacency law is
the canonical guard against it.

**How to apply:** before building any new module (Signal classifier, Recognition,
Referral, Reporting, SeatRecord721, Governance, Marketplace, AI), place it in exactly
one layer and confirm it only consumes the layer above (plus the MEMORY→EVENTS carve-out).
