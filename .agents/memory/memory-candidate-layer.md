---
name: Signal → Memory Candidate layer
description: Non-obvious traps when deriving MemoryCandidates from Signals (register-from-subject, the purchase→membership trap, founderAction generic copy-down).
---

# Signal → Memory Candidate layer (minimal, additive, inspection-only)

The layer is a pure deriver `deriveMemoryCandidates(signals)` (reads SIGNALS only,
never raw events) + a leaf registry. It only PROPOSES memories; it never publishes
to the Chronicle, confers recognition, or automates anything. recommendedAction is
only `review` | `hold-coverage`.

## Doctrine that is NOT in the spec table
- **Register comes from the Signal SUBJECT, not from tier.** Person subject
  (member/wallet) → `member-living`; protocol primitive → `protocol-institutional`.
  The spec's tier→register table self-contradicts (a founder burn is S2 but
  institutional), so it was rejected. `burn` is the ONLY dual-register category.
- **S1 is mostly activity-only.** A candidate is created at S1 only for
  `continuity`, a `new-member` membership, or a first-funding institutional moment
  WITH coverage. S2+ always creates.

## Traps that bit us (each cost a wrong candidate)
- **`CATEGORY_FOR_KIND["purchase"] === "membership"`.** So a *plain* repeat
  purchase signal at S1 maps to the membership category and, without a guard,
  fabricates a "new seat took a place" memory. Gate membership-at-S1 on
  `createdFrom === "new-member"`; repeat participation is remembered through the
  CONTINUITY signal instead, never through a raw purchase.
- **The signal deriver copies `founderAction` generically onto EVERY signal.** So
  funding actions (`founder-funded-vault|liquidity|operations`) carry a
  founderAction and route to the `founder-action` category — and the founder-action
  copy must BRANCH burn vs funding (`founderAction === "founder-burn"` /
  `createdFrom === "burn-founder"` → burn copy; else funding copy) or a vault/LP
  funding candidate falsely claims a supply burn.
- **`founder-allocation-movement` slips past the tier rules.** A first-of-kind,
  covered `vault-out`/`lp-*` tagged allocation-movement satisfies
  `isInstitutionalFirstFunding` and would create a candidate. The locked ruling is
  it NEVER creates one, so it must be excluded EXPLICITLY at the top of the
  creation check, regardless of tier/coverage — categoryFor alone does not stop it.

**Why:** significance is structural (tier/subject/facts). The actor being
founder/system, and money magnitude, never alone make a memory; and a candidate
must never invent a fact (a burn that did not happen).

## Guards
- `signal-adjacency.test.ts` — memory modules must not import `./protocol-events`
  (only `./protocol-event-registry` types), and any chronicle-entries import must be
  `import type`. Signals must never import the memory modules (edge is SIGNAL→MEMORY).
- `signal-money-guardrail.test.ts` — both memory files are in PRESTIGE_MODULES and
  scanned for RULE_E magnitude identifiers (no amount/balance/score names).
- Copy runs through `findForbiddenLanguage`; **`raised` and `yield` are banned** by
  `scripts/check-ownership-wording.mjs` (run it separately — not in check-release).
