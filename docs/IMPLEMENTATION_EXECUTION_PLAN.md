# THE SYNDICATE — IMPLEMENTATION EXECUTION PLAN

> Execution document. Not a strategy doc, not an audit, not a vision
> doc. Source of truth: `VISION.md`, `NORTH_STAR_SYSTEM.md`,
> `INFORMATION_HIERARCHY.md`, `CONSTITUTION_SUMMARY.md`. This file
> only sequences the **APPROVED** items from
> `CONSTITUTION_SUMMARY.md` into shippable waves.

Scoring legend (each 1–5):
- **Impact** — effect on the 10-second rule + north star.
- **Effort** — engineering hours (1 = <2h, 5 = multi-day).
- **Risk** — chance of regression, data drift, or layout break.

---

## 1. APPROVED ITEMS — SCORED

| # | Recommendation | Impact | Effort | Risk | Dependencies | User benefit |
|---|---|---|---|---|---|---|
| A1 | Collapse duplicate heartbeat (`LiveRecencyStrip` → merge into `LivePulseStrip`, 4 cells + deltas) | 5 | 2 | 2 | none | One unambiguous "is it alive?" signal in Zone 2 |
| A2 | Anticipation line under heartbeat ("Next member #N · Y to Chapter Z") | 5 | 1 | 1 | A1 (placement), `useHolderIndex`, chapter config | First reason to come back tomorrow, visible in 10s |
| A3 | Single 30-day sparkline (members **or** USDC) | 4 | 2 | 1 | members/USDC time series in existing hooks | Trajectory at a glance, no dashboard bloat |
| A4 | Promote Story to Zone 3 (mount `MilestoneTracker` + condensed `EarlyChapters` + `WhyComeBackTomorrow`) | 5 | 2 | 2 | components already exist; `WhyComeBackTomorrow` un-orphan | Past + future visible above the fold-2 |
| A5 | Consolidate Identity into one component, three states (first-time / connected / returning) | 4 | 3 | 2 | `HeaderWalletChip` state, `visitor-memory`, existing `SinceYourLastVisit` | "Who am I in this?" answered for every visitor type |
| A6 | Merge 5 Why-* components into single `WhyJoin` (Zone 5) | 4 | 3 | 2 | copy consolidation; route imports updated | One clear answer to "why join?" instead of five overlapping ones |
| A7 | Global mobile sticky Join bar (only sticky element) | 5 | 2 | 1 | `useIsMobile`, header CTA route | Join reachable from every scroll position on mobile |
| A8 | Demote `ProtocolEventsFeed` → `/activity`, `ProtocolTimeline` → `/transparency` | 3 | 1 | 1 | A4 done (Story takes their slot) | Homepage tightens; deep surfaces still intact |
| A9 | Resolve dead-ends + orphans per `FINAL_INFORMATION_ARCHITECTURE_DECISION.md` (link or delete) | 3 | 3 | 2 | route inventory in `FULL_SITE_MAP.md` | No black-hole pages; every leaf has a next step |
| A10 | Unique `head()` per primary route + single trailing Join CTA | 3 | 3 | 1 | A9 inventory | Shareable routes with correct OG; conversion at every leaf |
| A11 | Truth discipline pass — every metric labeled LIVE / PARTIAL / PENDING; totals sum LIVE only | 4 | 2 | 1 | existing status pill primitive | Verifiable trust signal everywhere |
| A12 | "Protocol Moments" curated rail on `/activity` (filtered `useProtocolEvents`) | 3 | 3 | 2 | A8 (events demoted there first) | Memory layer reads as story, not log |

---

## 2. WAVE SEQUENCE

Waves are ordered by **impact-per-hour** with hard dependency edges
respected. Each wave is independently shippable and reversible.

### Wave E-1 — "The 10-second rule" (Zone 1 + Zone 2)
Items: **A1, A2, A3**
- Outcome: Hero → unified heartbeat (4 cells + deltas) → anticipation line → sparkline. A first-time visitor can answer *what / alive / why-now* without scrolling past the second screen.
- Risk: low. All data sources already live. Cosmetic and layout-only.
- Ship gate: visual QA at 375 / 768 / 1440; verify deltas and anticipation derive from `useHolderIndex` / chapter config, not constants.

### Wave E-2 — "Story above the fold-2" (Zone 3)
Items: **A4, A8**
- Outcome: "The Story So Far" (milestones + condensed chapters) and "Coming Next" (`WhyComeBackTomorrow`) mounted in Zone 3. `ProtocolEventsFeed` and `ProtocolTimeline` removed from the homepage and confirmed present on `/activity` and `/transparency`.
- Risk: low-medium. `WhyComeBackTomorrow` un-orphaning needs a route check.
- Ship gate: orphan-route check passes; `/activity` and `/transparency` still render the demoted components.

### Wave E-3 — "Identity for every visitor" (Zone 4) + mobile conversion
Items: **A5, A7**
- Outcome: Single Identity component renders the right state per visitor (first-time #N / connected founder# / returning delta). Global mobile sticky Join bar mounted; desktop unchanged.
- Risk: medium. State branching on `HeaderWalletChip` + `visitor-memory`; needs SSR-safe defaults.
- Ship gate: all three states render without hydration mismatch; sticky bar appears only ≤ `md` and never overlaps modals/toasts.

### Wave E-4 — "One reason to join" (Zone 5)
Items: **A6**
- Outcome: One `WhyJoin` block + 3-step How-To-Join + single trailing Join CTA. Legacy Why-* components deleted from `Sections.tsx` exports.
- Risk: medium. Copy migration; route audit for stale imports.
- Ship gate: no remaining imports of deprecated Why-* components; copy reviewed against banned-word list in `VISION.md`.

### Wave E-5 — "Trust discipline + leaf hygiene"
Items: **A11, A9, A10**
- Outcome: LIVE / PARTIAL / PENDING pills audited site-wide; revenue totals exclude PLANNED; every primary route has a unique `head()` and a trailing Join CTA; dead-ends and orphans linked or removed per the IA decision.
- Risk: low-medium. Touches many routes; mechanical.
- Ship gate: `npm run check-live` clean; route inventory diff matches `FULL_SITE_MAP.md`.

### Wave E-6 — "Memory reads as story"
Items: **A12**
- Outcome: `/activity` ships a "Protocol Moments" rail (first member, chapter closes, milestone hits) above the raw events feed.
- Risk: medium. Requires a deterministic filter over `useProtocolEvents`; no new data sources.
- Ship gate: rail is empty-safe (PENDING state) and never invents events.

---

## 3. DEPENDENCY GRAPH

```text
E-1 (A1 → A2, A3)
  ↓
E-2 (A4 needs A1's Zone 2 settled; A8 needs A4 to fill the slot)
  ↓
E-3 (A5, A7 — independent of E-2 but better after Story lands)
  ↓
E-4 (A6 — independent; sequenced after identity to avoid double copy churn)
  ↓
E-5 (A11, A9, A10 — site-wide hygiene; runs once homepage is stable)
  ↓
E-6 (A12 — depends on A8 having moved events to /activity)
```

No wave blocks a later constitutional amendment. Each wave is a
single PR-sized unit.

---

## 4. RISK CONTROLS

- **No new data sources.** Every wave reuses existing hooks
  (`useHolderIndex`, `useProtocolEvents`, `visitor-memory`, treasury /
  sale / LP hooks). If a wave needs a new source, stop and re-scope.
- **No new top-level routes.** E-5 may delete routes; it adds none.
- **No copy that fails the banned-word list** in `VISION.md`.
- **No metric without a status pill.** Enforced in E-5; spot-checked
  in every prior wave.
- **Reversibility.** Each wave's diff must be revertable in one PR
  without follow-up cleanup.

---

## 5. IF WE ONLY EXECUTE WAVES E-1, E-2, E-3 — WHAT USERS WILL FEEL

After the first three waves a visitor — first-time, connected, or
returning — will experience the following measurable changes:

1. **Time-to-comprehension drops below 10 seconds.**
   Hero states what The Syndicate is; the unified heartbeat answers
   "is it alive?" with members, USDC, vault, last join + 24h deltas
   in one strip; the anticipation line answers "why now?" with a real
   next-member / next-chapter target; the sparkline answers "is it
   growing?" — all within the first two screens.

2. **A concrete reason to return tomorrow exists.**
   The anticipation line plus "Coming Next" gives every visitor a
   named, near-term event (next member #N, next milestone, next
   chapter close) that will be different the next time they load the
   page. This is the operational form of the
   `NORTH_STAR_SYSTEM.md` Anticipation Loop.

3. **The visitor becomes someone, not just a reader.**
   The single Identity component personalizes the page for all three
   states: first-timers see "You could be Member #N", connected
   wallets see their founder number / rank / chapter, returning
   visitors see "Since your last visit: +X / +Y USDC". Identity stops
   being invisible.

4. **Past and future are visible together.**
   Zone 3 mounts "The Story So Far" (milestones + condensed chapters)
   alongside "Coming Next". The protocol stops reading as a snapshot
   and starts reading as a story-in-progress — the long-running-series
   psychological model from the directive.

5. **Mobile conversion stops leaking.**
   The global sticky Join bar makes Join reachable from any scroll
   position on the dominant device class without affecting desktop.

Operationally, the same three waves should move:

- returning-visitor share with a wallet connected → up,
- bounce on the homepage → down,
- scroll-depth to Zone 3 → up,
- mobile Join-CTA click-through → up,

without changing the underlying data model, the contracts, or the
constitutional layer.

Waves E-4 through E-6 then tighten conversion copy, enforce trust
discipline site-wide, and turn `/activity` into a memory surface —
compounding the gains from the first three waves rather than
replacing them.
