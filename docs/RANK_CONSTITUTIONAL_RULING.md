# THE SYNDICATE — RANK CONSTITUTIONAL RULING

> **CONSTITUTIONAL DOCUMENT (rank doctrine).** Canonical, binding source of
> truth for what Rank is and is not. Registered 2026-06-09. Supersedes every
> prior rank meaning in docs and code. Resolves the rank contradiction
> identified in the Doctrine Reconciliation Report (§D).

**Status:** CANONICAL · constitutional (rank doctrine)
**Authority:** sits under VISION, alongside the seat/identity apex
(`SCARCITY_STATUS_PERMANENCE_AUDIT.md`). Cohort > rank, always.
**Scope:** doctrine only. Implementation, UI, and code changes are out of
scope of this ruling and tracked as named follow-ups below.

---

## 1. Canonical definition

> **Rank is a mutable, on-chain-derived, structural recognition label that
> reflects a member's depth of cumulative participation in the protocol. It is
> descriptive standing, not status; it confers nothing; and it is permanently
> subordinate to the seat (identity) and to cohort/chapter (belonging).**

This is **Model D — structural on-chain recognition**, disciplined so it cannot
drift back into wealth, reward, identity, or leaderboard framing.

---

## 2. What Rank IS

- **Structural metadata** — derived from public on-chain facts, recomputed as
  participation changes.
- **Standing, not reward** — relative recognition in the Story Engine sense;
  never a payout, multiplier, discount, or governance weight.
- **Secondary and subordinate** — it always appears below cohort and seat on
  every surface, never above.
- **Mutable** — explicitly the non-permanent layer; only the seat is permanent
  (`SCARCITY_STATUS_PERMANENCE_AUDIT.md` lists rank under "what is NOT
  permanent").
- **Honest** — framed as contribution-depth ("what you've put into the protocol
  over time"), never as wealth or worth.

## 3. What Rank IS NOT

- **Not identity.** Identity is the permanent seat + five constitutive facts
  (member number, chapter-of-joining, founders-cohort flag, block-height anchor,
  co-witness set). Rank is not one of them.
- **Not wealth-coded.** No public "USDC entry-size" status tiers, no
  "rank up your USDC." (USDC may remain a private input; it may not be the
  public meaning.)
- **Not a reward or multiplier.** The `scoreMultiplier` field and any
  "Compounder Score" advantage are unconstitutional and retired.
- **Not positional in the scarce-rung sense.** No finite winner slots, no
  leaderboard of people.
- **Not chapter-based or founder-based.** Those are identity axes; rank must not
  borrow their names or be derived from them.
- **Not hero content, and not private-cockpit content.**

---

## 4. Where Rank belongs

- **`/ranks`** — canonical home (the ladder explained, conferring nothing).
- **Public member page** — a secondary line, *below* member #, chapter, and
  founders flag.
- **Never** in the homepage hero. **Never** on the member's own private
  `/my-syndicate` cockpit ("vanity is for others to see" —
  `MY_SYNDICATE_BLANK_PAGE_REDESIGN.md`).
- **Single source of truth (code):** the rank function in
  `src/lib/syndicate-config.ts`, to be redefined per this ruling (no
  multiplier, neutral framing) when the implementation follow-up runs.

---

## 5. The nine questions, ruled

1. Should Rank be identity? **No.**
2. Should Rank be visible in the hero? **No.**
3. Should Rank be visible on public profiles? **Yes — secondarily, below cohort and seat.**
4. Should Rank be wealth-coded? **No. Absolute.**
5. Should Rank be positional? **Yes — relative standing only, never a scarce rung.**
6. Should Rank be chapter-based? **No — chapter is its own identity axis.**
7. Should Rank be participation-based? **Yes in principle — on honest signals, conferring nothing.**
8. Should Rank be structural metadata? **Yes — this is its true nature.**
9. Should Rank exist at all? **Yes — demoted and disarmed; not a wealth ladder.**

---

## 6. Superseded definitions (retired 2026-06-09)

The following meanings are retired and must never be re-introduced in CANONICAL
or OPERATIONAL docs (recorded in `DOCUMENTATION_AUTHORITY_MAP.md` →
"Superseded doctrines"):

1. **Rank as a USDC entry-size public status tier** ("status tier unlocked by
   USDC entry size") → Rank is structural recognition; USDC may be a private
   input, never the public meaning.
2. **`scoreMultiplier`-based rank / "Compounder Score" multiplier tied to rank**
   → rank confers nothing.
3. **"Founder" as a rank name** (e.g. a $100 tier) → "Founder" is a frozen
   cohort identity fact, never a purchase tier.
4. **"Genesis Circle" as a rank name** (e.g. a $10,000 tier) → "Genesis"
   belongs to Chapter I — Genesis Signal.
5. **Rank as primary identity** → identity is the permanent seat.
6. **Rank as a leaderboard / positional ladder of people** → relative standing
   only; cohort > rank, always.

### Naming note (recommendation, not mandated)

Because the word "Rank" carries leaderboard/status connotations the canon
forbids, public surfaces may retire the word itself in favor of **"Standing"**
or **"Contribution Tier"**, reserving the future **Reputation** system as the
eventual non-monetary participation layer. This is a naming call for the
founder; the ruling above stands regardless of the label chosen.

---

## 7. Out of scope (named follow-ups — not part of this ruling)

These are deliberately deferred and require separate, explicitly-authorized
passes:

- **Implementation pass:** retire `scoreMultiplier` and the "Founder" /
  "Genesis Circle" tier names in `src/lib/syndicate-config.ts`; reframe rank
  copy to structural recognition. (Code — not authorized here.)
- **Guard wiring:** add the six retired rank meanings as regexes to
  `src/lib/__tests__/doctrine-guard.test.ts` `DOC_BANNED`, and add the newly
  constitutional docs to its `CANONICAL_DOCS` scan list. (Code — not authorized
  here.)
- **Participation-signal design:** define honest, non-monetary participation
  inputs (longevity, distinct on-chain actions, artifacts, witnessed sealings)
  so rank can reflect participation rather than spend.

---

## Decision Lens Verdicts

```text
Lens                     Verdict   Notes
Founder                  ✓         Protects seat/cohort identity from wealth-rank dilution.
Investor                 ✓         Removes wealth-tier + multiplier framing (securities-risk reduction).
Growth                   ⚠         Removes a gamified hook; follow-up: honest participation signals.
Behavioral Psychology    ✓         Keeps status motivation as standing, without pay-to-win.
UX                       ✓         Clear hierarchy: seat > cohort > rank; rank off hero/private cockpit.
Product                  ✓         Resolves the core contradiction; one canonical definition.
Staff Engineer           ⚠         Follow-up: retire scoreMultiplier + tier names in code (out of scope).
QA                       ⚠         Follow-up: wire retired meanings into doctrine-guard (out of scope).
Accessibility            ✓         No a11y impact; fewer competing status signals.
SEO                      ✓         No impact.
```

**Gating:** zero ✗. Three ⚠ (Growth, Staff Engineer, QA) are **explicitly
accepted** with the named follow-up tasks in §7. Per the constitutional gating
rule, the decision proceeds because every ⚠ has a named follow-up and none is a
blocking ✗.
