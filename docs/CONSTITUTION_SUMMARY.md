# THE SYNDICATE — CONSTITUTION SUMMARY

This document is the index and ratification record for the
constitutional layer of The Syndicate. It is the first document a new
contributor should read.

---

## THE CONSTITUTIONAL LAYER (read in order)

1. **`docs/VISION.md`** — why The Syndicate exists, what it is, what it
   is not, transparency / identity / community principles, phased
   roadmap, momentum principle, Stop Building Test.
2. **`docs/NORTH_STAR_SYSTEM.md`** — north star metric (verified members),
   secondary metrics, the six loops (story, identity, memory,
   anticipation, conversion, growth), what makes someone come back
   tomorrow, decision test.
3. **`docs/INFORMATION_HIERARCHY.md`** — the 10-second contract, the
   six homepage zones (Hero · Heartbeat · Story · Identity ·
   Conversion · Proof), zone responsibility matrix, cross-route rules,
   navigation rules, amendment rule.

All three are authoritative. Any conflict between them and any other
document — audit, plan, spec, README — is resolved in favor of the
constitution.

---

## SUPPORTING FRAMEWORKS (still authoritative within their scope)

These pre-date the constitutional layer but remain in force:

- `docs/PRODUCT_DECISION_FRAMEWORK.md` — the 12-question feature test.
- `docs/MVP_ECOSYSTEM_ROADMAP.md` — the Stop Building Test (five
  questions before any major module).
- `docs/TERMINOLOGY_GLOSSARY.md` — the externally-permitted vocabulary
  (Simplicity Rule).

These are referenced from the constitutional documents; they do not
override them, and the constitutional documents do not override them.

---

## REFERENCE MATERIAL (no longer authoritative on their own)

The following audit and plan documents contributed decisions that have
been migrated into the constitutional layer. They remain in the repo as
historical reasoning and as inventories of specific components, but
they are **reference only**. If they conflict with the constitutional
layer, the constitutional layer wins.

- `docs/STORY_ENGINE_AUDIT.md` — story-component inventory and
  fragmentation map. Loops migrated to `NORTH_STAR_SYSTEM.md`.
- `docs/INFORMATION_HIERARCHY_MASTER_PLAN.md` — six-zone proposal and
  per-section verdicts. Zones migrated to `INFORMATION_HIERARCHY.md`.
- `docs/FINAL_INFORMATION_ARCHITECTURE_DECISION.md` — IA decisions
  (Join discovery, dead-ends, orphans, mobile sticky). Rules migrated
  to `INFORMATION_HIERARCHY.md` cross-route + navigation sections.
- `docs/PRE_LAUNCH_TRUTH_CLEANUP_REPORT.md` *(if present)* — truthful
  data discipline. Principles migrated to `VISION.md` trust model and
  `NORTH_STAR_SYSTEM.md` "live or PENDING" rule.
- `docs/FULL_SITE_STRUCTURE_AND_HEALTH_REPORT.md`,
  `docs/PRODUCT_ARCHITECTURE_MAP.md`,
  `docs/NAVIGATION_IA_AUDIT.md`,
  `docs/UX_CTA_FLOW_AUDIT.md`,
  `docs/CONTENT_CONSISTENCY_AUDIT.md`,
  `docs/STATUS_EMPTY_PENDING_AUDIT.md`,
  `docs/DATA_SOURCE_MAP.md`,
  `docs/FULL_SITE_MAP.md`,
  `docs/ROUTE_ARCHITECTURE_AUDIT.md`,
  `docs/CODE_HEALTH_AUDIT.md` — operational audits. Reference only.

---

## RECOMMENDATION REGISTER

All recommendations from the reference documents above have been
reviewed against the constitutional layer and classified.

### APPROVED — aligned with the constitution; safe to implement in order

1. **Collapse the duplicate heartbeat.** Merge `LiveRecencyStrip` into
   `LivePulseStrip` as a single 4-cell strip with deltas.
   *Authority:* `INFORMATION_HIERARCHY.md` Zone 2.
2. **Add the anticipation line.** "Next member #N · Y remaining to
   Chapter Z" beneath the heartbeat.
   *Authority:* `NORTH_STAR_SYSTEM.md` Anticipation Loop; Zone 2.
3. **Add a single 30-day sparkline** (members or USDC). One chart, not
   a dashboard. *Authority:* Zone 2.
4. **Promote Story to Zone 3.** Mount `MilestoneTracker` + condensed
   `EarlyChapters` as "The Story So Far"; mount `WhyComeBackTomorrow`
   (currently orphan) as "Coming Next". *Authority:* Zone 3.
5. **Consolidate Identity into one component, three states**
   (first-time / connected / returning). *Authority:* Zone 4.
6. **Merge the five Why-\* components into a single `WhyJoin`** in
   Zone 5. *Authority:* Zone 5 + Simplicity Rule.
7. **Mount a global mobile sticky Join bar.** The only sticky element;
   desktop unaffected. *Authority:* `INFORMATION_HIERARCHY.md`
   Navigation.
8. **Demote `ProtocolEventsFeed` and `ProtocolTimeline`** from the
   homepage to `/activity` and `/transparency` respectively.
   *Authority:* Zone 2 + Zone 6 separation.
9. **Resolve dead-end pages and orphan routes** per
   `FINAL_INFORMATION_ARCHITECTURE_DECISION.md`: either link them from
   header/footer/related surfaces or delete them. *Authority:*
   `INFORMATION_HIERARCHY.md` Cross-Route Rules.
10. **Ensure every primary route has a unique `head()`** and ends with
    a single Join CTA. *Authority:* Cross-Route Rules.
11. **Truth discipline:** every metric carries LIVE / PARTIAL /
    PENDING; no invented or estimated numbers; revenue totals sum only
    LIVE sources. *Authority:* `VISION.md` trust model.
12. **Curate a "Protocol Moments" rail** filtered from
    `useProtocolEvents` (first member, chapter closes, milestone hits)
    on `/activity`. *Authority:* Memory + Momentum loops.

### REJECTED — conflicts with the constitution; do not implement

- **Wealth or holdings leaderboards.** Conflicts with `VISION.md`
  ("ranks reflect participation, not wealth") and Identity Loop.
- **Referral system.** Conflicts with `VISION.md` ("no referral spam")
  and Growth Loop ("transparency becomes distribution, not paid
  acquisition").
- **NFT collectibles as a standalone module pre-launch.** Deferred
  by `VISION.md` phased roadmap (advanced modules come after
  foundations) and fails the Stop Building Test at current scale.
- **Governance theatre / DAO surfaces.** Conflicts with `VISION.md`
  ("not a DAO"; governance is downstream of trust).
- **AI assistant / chat module on the homepage.** Fails Simplicity
  Rule and Stop Building Test.
- **Vault automation surfaces** that imply yield or returns.
  Conflicts with `VISION.md` banned-copy list.
- **Hero carousels, scrolling tickers, casino toasts, countdown
  timers, fake scarcity strips.** Conflicts with Momentum Principle
  and Zone 1 / Zone 2 forbidden lists.
- **Duplicate live strips, duplicate Why-\* sections, repeated
  final CTAs past saturation.** Conflicts with Zones 2, 5, and the
  one-primary-CTA-per-surface rule.

### DEFERRED — directionally aligned, revisit later

- **Wallet-level profile enrichment** beyond founder #, rank, chapter.
  Revisit after Identity Loop adoption is measurable.
- **Per-chapter share OG cards.** Revisit after milestone + wallet OG
  cards prove distribution lift.
- **Public Compounder Score / rank ladder beyond what's already in
  `RankHub`.** Revisit only when participation signals (not wealth)
  can be honestly computed.
- **Episodes / long-form storytelling surfaces.** Revisit after Zone 3
  consolidation; do not run in parallel.
- **Advanced revenue modules.** Per `VISION.md` phased roadmap, after
  foundations.

---

## REQUIRED READING FOR FUTURE CONTRIBUTORS

Before opening a PR that adds, removes, or reorders any page, section,
component, copy block, route, or module, read in order:

1. `docs/VISION.md`
2. `docs/NORTH_STAR_SYSTEM.md`
3. `docs/INFORMATION_HIERARCHY.md`
4. `docs/PRODUCT_DECISION_FRAMEWORK.md`
5. `docs/MVP_ECOSYSTEM_ROADMAP.md` (Stop Building Test only)
6. This document (`CONSTITUTION_SUMMARY.md`)

Then, and only then, the relevant reference audits.

---

## AMENDMENT PROCESS

The constitutional layer is amended only by editing the three
constitutional documents and this summary in a single change. Audit
documents, plan documents, and component-level READMEs cannot amend
the constitution by themselves.

The goal: a feature added twelve months from now reinforces the same
story, the same hierarchy, and the same vision — instead of inventing
a new one.

---

## DECISION LENSES (constitutional)

Every non-trivial decision — feature, redesign, refactor, removal,
copy change, audit, or recommendation — must be evaluated against all
ten Decision Lenses simultaneously. See `docs/AAA_DECISION_LENSES.md`
for full gate questions and grid format.

The ten lenses:

1. Founder
2. Investor
3. Growth
4. Behavioral Psychology
5. UX
6. Product
7. Staff Engineer
8. QA
9. Accessibility
10. SEO

Verdicts per lens: `✓ pass` · `⚠ partial (gap + follow-up named)` ·
`✗ fail (blocks shipping)`.

Gating rule: **one ✗ blocks the decision. Two or more ⚠ block the
decision unless gaps are explicitly accepted with named follow-up
tasks.**

Conflict resolution order when lenses disagree:

1. Vision / Constitution wins.
2. Trust and Transparency are never traded for growth or aspiration.
3. Member-first principle.
4. Remaining lenses — balance, do not stack-rank.

### Mandatory audit-report section

Every audit report committed under `docs/` from this point forward
MUST contain a final section titled exactly:

> ## Decision Lens Verdicts

The section must render a grid covering all ten lenses with a verdict
and a one-line note for each:

```text
Lens                     Verdict   Notes
Founder                  ✓ / ⚠ / ✗ …
Investor                 ✓ / ⚠ / ✗ …
Growth                   ✓ / ⚠ / ✗ …
Behavioral Psychology    ✓ / ⚠ / ✗ …
UX                       ✓ / ⚠ / ✗ …
Product                  ✓ / ⚠ / ✗ …
Staff Engineer           ✓ / ⚠ / ✗ …
QA                       ✓ / ⚠ / ✗ …
Accessibility            ✓ / ⚠ / ✗ …
SEO                      ✓ / ⚠ / ✗ …
```

An audit without this section is incomplete and must not be treated
as authoritative. Implementation reports that close out an audit
inherit the same requirement.

---

## FOUNDER MULTI-HAT EVALUATION FRAMEWORK (constitutional)

See `docs/FOUNDER_MULTI_HAT_EVALUATION_FRAMEWORK.md` for the full text.

Engineering correctness is the **floor**, not the ceiling. Every page,
section, card, button, pill, progress bar, status row, CTA, feed item,
chapter card, roadmap card, or hero element must be evaluated through
thirteen hats simultaneously (Founder · Investor · Growth · Behavioral ·
UX · Product · Story · Community · Brand · Staff Eng · QA · A11y · SEO)
and must declare the **Five-Value Test**:

| Value | Question |
|---|---|
| Engineering | What does this make technically possible / correct? |
| User | What can the user now *do* that they couldn't before? |
| Emotional | What does the user *feel* when they see this? |
| Story | What chapter of the protocol's narrative does this advance? |
| Retention | What reason to come back tomorrow does this create? |

**Rule:** if only Engineering Value is non-trivial → **stop and
redesign**. Pure refactor / performance / security / accessibility work
is allowed but must be labeled as such.

Every surface must additionally answer at least three of the seven
emotional questions: *care · join · return · share · early · progress ·
identity-or-anticipation*.

### Mandatory audit-report section (additive)

Audits that touch user-facing surfaces must include, in addition to the
`## Decision Lens Verdicts` grid, a `## Five-Value Test` block for each
major surface reviewed. The framework composes with — does not replace —
the 10 Decision Lenses, the Five Pillars, `VISION.md`, and the Phased
Roadmap.

The framework is not a license for vague copy, manufactured scarcity,
fake countdowns, or hype. Every emotional claim must be backed by a
verifiable on-chain proof.

---

## CORE ASSET — SCARCITY, STATUS & PERMANENCE (constitutional)

See `docs/SCARCITY_STATUS_PERMANENCE_AUDIT.md` for the full audit.

The scarce asset of The Syndicate is **the seat** — a permanent,
publicly verifiable position in the protocol's append-only record,
defined by exactly five constitutive facts:

1. **Member number** (monotonic ordinal, unique forever)
2. **Chapter-of-joining** (sealed at chapter close)
3. **Founders-cohort flag** (frozen at cohort close)
4. **Block-height anchor** (immutable on-chain coordinate)
5. **Co-witness set** (the strictly growing set of sealed protocol
   events whose block height is ≥ the seat's anchor)

Tokens, yield, governance, access, ranks, LP positions, and treasury
exposure are **not** the scarce asset. They are trust substrate
(proving the seat is real) or narrative substrate (telling the story
of the seats). The seat is the product.

### Binding pre-implementation gate

Every proposal for the **Narrative Arc Blueprint**, **Anticipation
Engine**, **Identity Permanence Ladder**, **Narrative Templates**, or
any redesign of **Hero / Coming Next / Activity / Chapters / Identity
/ Roadmap / wallet seat-page** must additionally declare:

1. Which of the five constitutive facts it surfaces (**minimum two**).
2. Whether it reinforces **positional dominance**, **co-witness
   accretion**, or **cohort belonging** (minimum one).
3. That its anticipation, if any, is anchored to a **real on-chain
   sealing event** (chapter close, cohort close, milestone seal,
   vault activation block) — never a countdown, never a manufactured
   timer, never a price target.
4. That its status, if any, is **positional** — never wealth-based,
   never participation-only.

A proposal that cannot answer all four is **not approved**, regardless
of its narrative quality. This gate **composes with** the Infinite
Narrative gate (§8.6 of `INFINITE_NARRATIVE_AUDIT.md`), the Multi-Hat
Five-Value Test, and the ten Decision Lenses — it does not replace
them.

Narrative Arc Blueprint, Anticipation Engine, Identity Permanence
Ladder, and Narrative Templates are **frozen** until §9 of
`SCARCITY_STATUS_PERMANENCE_AUDIT.md` (The Core Asset) is approved.



---

## Constitutional rule — Archive truth labels

Every Archive surface, today and tomorrow, MUST distinguish exactly one
of four permanent truth states:

- `LIVE ON AVALANCHE`
- `DERIVED FROM ON-CHAIN DATA`
- `PENDING NFT CONTRACT`
- `ROADMAP`

Defined in code at `src/lib/archive-truth-states.ts`. If a surface
cannot resolve to one of these, it does not ship. Constitutional, not
optional.

See: `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md`,
`docs/NFT_ARCHIVE_VISUAL_SYSTEM_V1.md`,
`docs/SMART_CONTRACT_DECISIONS_PENDING.md`.

---

## Final Seat Record Architecture Decision (✅ LOCKED 2026-06-06)

Seat Records are **NOT** active ERC-1155 artifacts in `SyndicateArchive1155` V1.
They will ship later in a **separate ERC-721 contract**
(working name `SyndicateSeatRecord721` / `SyndicateSeatRegistry721`)
once membership eligibility is enforceable on-chain.

Token ID 2 in `SyndicateArchive1155` is a **reserved + disabled pointer**:
`active = false`, `ownerOnly = true`, `rendererMode = NONE`,
`maxSupply = 0` (LOCKED / NOT MINTABLE), `walletLimit = 1`,
`priceUsdc = 0`. All mint paths revert; `uri(2)` reverts.

Contract-wide V1 rule: **`maxSupply == 0` means LOCKED / NOT MINTABLE**.
It does **NOT** mean unlimited. No V1 artifact is unlimited.

Allowed wording: *"Seat Records are reserved for a future ERC-721
identity contract."* / *"Archive1155 V1 records collectible protocol
artifacts."* / *"ID 2 is reserved and disabled in V1."* /
*"SYN is the seat. Artifacts are the memory."*

Canonical decision doc: `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`.
