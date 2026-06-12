---
name: Institutional Register genesis seed (parallel lawful source)
description: The register has a SECOND lawful origin store for pre-scanner protocol-birth facts; how genesis classification and held-not-invented ordinals work.
---

# Institutional Register — genesis SEED leaf

The Institutional Register now has **two** lawful sources, not one:

1. The normal edge `… → CHRONICLE PROMOTION DECISION → INSTITUTIONAL REGISTER ENTRY`,
   projected by the deriver (`institutional-register.ts`) from the LIVE event scanner.
2. A **parallel curated origin store** — the genesis seed leaf
   (`institutional-register-genesis.ts`) — for foundational facts that **predate**
   the scanner's bounded window (token deploy, initial distribution, sale/archive
   contracts, first liquidity, first burn).

**Why:** the event scanner only sees a bounded recent window, so protocol-birth
facts older than that window can never reach the register through the deriver. Spec
§3 permits a documented exception "when a foundational event predates or sits
outside the current event scanner." The deriver was left **unchanged** (architect-
approved Option C) — the seed is additive, not a rewrite.

## How to apply

- The seed leaf's adjacency is `CONFIG (on-chain truth) → GENESIS SEED → ENTRY`. It
  imports ONLY the register registry leaf (vocabulary + `findHistoricClaims`), the
  public selection leaf (the §5 sober-language guard, reused so copy-safety stays
  single-sourced), `protocol-language`, and `syndicate-config`. It must NEVER import
  the event / Signal / Memory / Chronicle-review / Chronicle-promotion layers — it
  does not read promotion decisions. A new `GENESIS_SEED_MODULES` block in
  `signal-adjacency.test.ts` enforces this edge. It is intentionally NOT in
  `REGISTER_MODULES` (that block requires a promotion-registry import).
- The view MERGES seed + derived via pure `mergeInstitutionalEntries(seed, derived)`
  in the public leaf, deduped by lowercased `sourceTxHash` (**seed wins**), returning
  `[...seed, ...derived]`, BEFORE `selectPublicInstitutionalEntries` (which reverses →
  newest-first, so derived-newest sit above the seeds).
- Seeds use a FIXED curation timestamp constant (never `Date.now()`) so SSR/client
  render byte-identically. Lineage uses HONEST sentinels (`genesis-seed:<id>` /
  `predates-scanner` / `genesis-fact:<id>`) so `isLineageComplete()` holds while the
  trail truthfully reads "predates scanner" — do not fake intermediate ids.

## GENESIS_EVENT classification rule

Genesis is a legitimate **institutional fact** only when independently verifiable.
`findHistoricClaims(text, verificationStatus)` is **verification-aware** (pre-existing
— Sprint 9 did NOT change guard logic): `verified`/`locked` → the word "genesis" /
"first X" is allowed; `coverage-limited` → the same words flag as a violation. So:
verified/locked seeds may say "genesis"; coverage-limited ordinals must NOT.

**Why:** lets the protocol state real history without re-opening the door to hype.
Hype copy is still independently blocked by the public-vocab + protocol-language guards.

## "Held is better than invented"

Ordinals that need deployment-range coverage the public window never proves
(earliest member / artifact / milestone) are seeded as `entryStatus:"held"` +
`coverage-limited`, INTERNAL only (`isPubliclyVisible` excludes held), and carry NO
"first" claim and NO member identity. Recording the *decision to hold* keeps it on
the record. Facts with no verifiable source at all (e.g. first campaign funding) are
OMITTED entirely. `coverageComplete` stays false — seeding genesis never upgrades it.
