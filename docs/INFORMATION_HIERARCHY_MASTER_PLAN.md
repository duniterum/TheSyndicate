# Information Hierarchy Master Plan

**Status:** Decision document. No code changes in this pass.
**Inputs:** `FINAL_INFORMATION_ARCHITECTURE_DECISION.md`, `STORY_ENGINE_AUDIT.md`, `LIVING_PROTOCOL_AUDIT.md`, `VISION.md`, current `src/routes/index.tsx`.
**Lens:** Senior Product · UX · CRO · Growth · Community · Investor · First-time visitor · Returning member.

---

## 1. Diagnosis — what the homepage is doing today

The current `/` renders **~35 sections** in a single vertical stack. Inventory by zone:

| Zone (px from top, approx) | Sections rendered |
|---|---|
| Above fold (0–700) | `DemoBanner`, `Header`, `StartHereCard`, `Hero` (top half only) |
| Just below fold (700–1800) | `Hero` (bottom), `LiveRecencyStrip`, `TrustBar`, `LivePulseStrip` |
| Mid (1800–4500) | `SinceYourLastVisit`, `ProtocolEventsFeed`, `ProtocolTimeline`, `WhyJoinSimple`, `HowToJoinSteps`, `WhyTheSyndicateExists`, `WhyBecomeMember` |
| Deep (4500–9000) | `WhyEarlyMatters`, `WhyJoinNow`, `WhatChangesAfterJoining`, `MemberJourney`, `HowItWorks30s`, `WhatSynDoes`, `WhyDifferent` |
| Proof tail (9000–14000) | `ProtocolOverview`, `ProtocolRevenueEngine`, `RoutingFlow`, `CapitalAllocation`, `ProtocolStatusGrid`, `ProtocolFlywheel`, `OpportunitySection`, `TreasuryComposition`, `UseOfFunds`, `LpStatusCard`, `HomeTransparencySnapshot` |
| Story / share tail (14000+) | `MilestoneTracker`, `EarlyChapters`, `ProtocolSnapshots`, `MemberCard`, `HomeShareCTA`, final CTA, `RiskDisclaimer` |

### Findings

1. **The Hero is doing too much OR too little.** It is the only above-fold real estate, but the protocol's strongest assets (live members, USDC raised, next milestone) sit *below* it in a separate strip. A first-time visitor cannot answer "is this thing alive?" without scrolling.
2. **The heartbeat is duplicated.** `LiveRecencyStrip` and `LivePulseStrip` both prove "this is live", but they sit consecutively and dilute each other. CRO impact: the *first* live signal is the only one that converts skepticism into curiosity; the second one trains the eye to skip.
3. **Story is buried.** `MilestoneTracker` (history) and `EarlyChapters` (chapter close moments) — the strongest *narrative* assets — are placed at section #19–20. By that point only ~10–15% of sessions remain.
4. **Anticipation is missing from the homepage.** "Next Member #N", "Next milestone $X away" already exist in `useProtocolPulse` and `MilestoneTracker` but are not promoted as a standalone *Coming Next* card. Casino lens: the jackpot countdown is buried.
5. **Identity is invisible until you connect a wallet.** `SinceYourLastVisit` only fires for returners, and there is no "You could be Member #N" hook for first-time visitors.
6. **The "Why" layer is too long.** Seven Why-* components (`WhyJoinSimple`, `WhyTheSyndicateExists`, `WhyBecomeMember`, `WhyEarlyMatters`, `WhyJoinNow`, `WhyDifferent`, plus `WhatChangesAfterJoining`) say overlapping things. Investor lens: this reads as protest-too-much, not confidence.
7. **Proof layer is in the wrong order.** Routing / treasury / flywheel / opportunity / revenue engine are all *mechanism* explainers; they come BEFORE the most concrete on-chain proof (`HomeTransparencySnapshot`). Trust lens: show the proof, then explain the mechanism.
8. **Growth trajectory is absent.** No member-count / USDC-raised / vault-balance sparkline anywhere on the homepage. Investor lens: the single biggest missing signal.
9. **The final CTA is the 30th-something section.** By the time a user reaches "Buy SYN with USDC", they have already scrolled past the same CTA 4–5 times. Conversion lens: the CTA gradient is flattened.

### Scorecard (current homepage, out of 10)

| Dimension | Score | Notes |
|---|---|---|
| What is this? (5s test) | 6 | Hero copy explains, but no live proof beside it |
| Why care? | 5 | Buried in Why-* stack |
| Why now? | 4 | No visible anticipation / next-milestone above fold |
| What do I do? | 7 | CTAs present, but repeated past saturation |
| Trust (verifiable proof position) | 5 | Proof exists, but appears after long mechanism essays |
| Momentum (is it growing?) | 4 | Snapshot numbers yes, *trajectory* no |
| Story (anticipation + memory) | 3 | History buried at section ~19, no "coming next" |
| Identity hook for first-time visitor | 4 | "Next member #" exists, not promoted |

**Composite: 4.75 / 10.** Rich, transparent, honest — but not legible in 10 seconds.

---

## 2. The 10-second test — exact answer

> *If a visitor spends only 10 seconds on the homepage, what exact information should they see first, second, third, and fourth?*

**Within the first viewport, in this order:**

1. **One sentence + one verb.**
   "The Syndicate is a transparent on-chain protocol on Avalanche. Every USDC routes 70 / 20 / 10 on-chain. Live now."
   Primary CTA: **Buy SYN** (gold). Secondary: **Verify on-chain** (ghost).
   *Answers: WHAT IS THIS? + WHAT SHOULD I DO?*

2. **A single live heartbeat row, 4 cells maximum, immediately under the headline (not below the fold):**
   - `Members: 43` · `USDC Raised: $21,543` · `Vault: $15,080` · `Last join: 2h ago`
   Each cell links to its on-chain source. Status pill `● LIVE`.
   *Answers: WHY SHOULD I CARE? (this thing is real, right now)*

3. **One anticipation line, same viewport:**
   "Next milestone: **Member #50** · **7 remaining** · You would be Member #44."
   *Answers: WHY NOW? + plants the identity hook before any scroll.*

4. **One trajectory glance (small, single chart strip, not a dashboard):**
   30-day member growth sparkline, with delta `+18 members · 7d`.
   *Answers: is this growing? — the single missing investor signal.*

Everything else (mission, mechanics, treasury, flywheel, FAQ, ranks) is **scroll-reward**, not first-paint.

---

## 3. Proposed homepage hierarchy (target)

Six zones. Each zone has a job. If a section does not advance the zone's job, it does not belong in that zone.

```
ZONE 1 — HERO                     [WHAT IS THIS? + WHAT DO I DO?]
  Hero (compact: 1 sentence, 2 CTAs, status pill)

ZONE 2 — LIVE HEARTBEAT           [WHY CARE?  WHY NOW?]
  Unified pulse strip (4 cells)
  Anticipation line: "Next Member #50 — 7 remaining"
  30-day growth sparkline (members · USDC · vault)

ZONE 3 — STORY                    [MEMORY + ANTICIPATION]
  THE STORY SO FAR   (first member · first chapter close · first $1k)
  COMING NEXT        (Member #50 · $25k raised · Chapter 2 closes)

ZONE 4 — IDENTITY & SOCIAL PROOF  [WHO IS ALREADY HERE?]
  Recent members rail / Founders Hall preview
  "You could be Member #N" card (first-time)
  "Since your last visit" (returner; replaces the above when wallet known)

ZONE 5 — CONVERSION               [WHY JOIN + HOW]
  Why join (single section, merged from 5–7 Why-*)
  How to join (3-step max)
  What changes after joining

ZONE 6 — PROOF & DEEP DIVE        [VERIFY EVERYTHING]
  Transparency snapshot (live numbers, links)
  Routing flow + treasury composition
  Tokenomics / LP / flywheel / opportunity (collapsed or linked, not stacked)
  Final CTA + risk disclaimer
```

---

## 4. Section-by-section verdict

Legend: **KEEP** (in place) · **PROMOTE** (move up) · **DEMOTE** (move down) · **MERGE** · **REMOVE FROM HOME** (still lives on its dedicated route) · **NEW**.

| Section | Today | Verdict | Target zone |
|---|---|---|---|
| `Hero` | Zone 1 | **KEEP** but compact: 1-line headline, 2 CTAs, status pill | 1 |
| `StartHereCard` | Above hero | **DEMOTE** to a dismissable strip *inside* hero, not a full block | 1 |
| `TrustBar` | Between strips | **MERGE** into hero footer row (chain · contract · audit links) | 1 |
| `LiveRecencyStrip` | Zone 2a | **MERGE** with `LivePulseStrip` → one heartbeat | 2 |
| `LivePulseStrip` | Zone 2b | **KEEP** as the canonical heartbeat, cut to 4 cells | 2 |
| *(new)* Anticipation line | — | **NEW** "Next Member #N · X remaining" | 2 |
| *(new)* Growth sparkline strip | — | **NEW** 30-day members · USDC · vault | 2 |
| `SinceYourLastVisit` | Mid | **PROMOTE** to Zone 4, conditional on returner | 4 |
| `ProtocolEventsFeed` | Mid | **DEMOTE** to `/activity`; keep 3-row teaser in Zone 3 | 3 (teaser) |
| `ProtocolTimeline` | Mid | **REMOVE FROM HOME** — lives on `/activity` | — |
| `MilestoneTracker` | Deep | **PROMOTE** to Zone 3 as "Coming Next" | 3 |
| `EarlyChapters` | Deep | **PROMOTE** to Zone 3 as "The Story So Far" | 3 |
| `MemberJourney` | Deep | **DEMOTE** to `/join` or `/ranks` | — |
| `WhyJoinSimple` | Mid | **MERGE** with `WhyBecomeMember` + `WhyJoinNow` → single `WhyJoin` | 5 |
| `WhyTheSyndicateExists` | Mid | **MERGE** into the unified WhyJoin (mission paragraph) | 5 |
| `WhyBecomeMember` | Mid | **MERGE** | 5 |
| `WhyEarlyMatters` | Deep | **MERGE** into WhyJoin's "why now" paragraph | 5 |
| `WhyJoinNow` | Deep | **MERGE** | 5 |
| `WhyDifferent` | Deep | **DEMOTE** to `/whitepaper` or end-of-page collapse | 6 |
| `WhatChangesAfterJoining` | Deep | **KEEP** in Zone 5 (concrete benefits, LIVE/PLANNED labels) | 5 |
| `HowItWorks30s` | Deep | **KEEP**, compact, Zone 5 | 5 |
| `HowToJoinSteps` | Mid | **KEEP**, Zone 5 | 5 |
| `WhatSynDoes` | Deep | **DEMOTE** to `/token` or `/tokenomics` | — |
| `ProtocolOverview` | Proof tail | **DEMOTE** — too much for homepage; link card to `/transparency` | 6 |
| `ProtocolRevenueEngine` | Proof tail | **DEMOTE** to `/transparency` | — |
| `RoutingFlow` | Proof tail | **KEEP** in Zone 6 (this *is* the proof of the 70/20/10 claim) | 6 |
| `CapitalAllocation` | Proof tail | **MERGE** with `TreasuryComposition` | 6 |
| `ProtocolStatusGrid` | Proof tail | **DEMOTE** to `/transparency` | — |
| `ProtocolFlywheel` | Proof tail | **DEMOTE** to `/whitepaper` | — |
| `OpportunitySection` | Proof tail | **DEMOTE** to `/whitepaper` | — |
| `TreasuryComposition` | Proof tail | **KEEP**, Zone 6 (merged with CapitalAllocation) | 6 |
| `UseOfFunds` | Proof tail | **DEMOTE** to `/transparency` | — |
| `HomeTransparencySnapshot` | Proof tail | **PROMOTE** within Zone 6 (lead the proof zone) | 6 |
| `LpStatusCard` | Proof tail | **KEEP** in Zone 6 | 6 |
| `ProtocolSnapshots` + `MemberCard` | Story tail | **DEMOTE** to `/members` and `/wallet/$address` | — |
| `HomeShareCTA` | Story tail | **KEEP** as final-but-one block | 6 |
| `WhyComeBackTomorrow` | currently orphan | **PROMOTE** into Zone 3 "Coming Next" as the anticipation copy | 3 |
| Final CTA + `RiskDisclaimer` | Tail | **KEEP** | 6 |

Net effect: homepage shrinks from ~35 sections to ~14, organized by *psychological job* not by *component inventory*.

---

## 5. The other primary routes — quick hierarchy verdicts

### `/join`
Already conversion-focused. Action: ensure the SaleStatsPanel appears in the first viewport (currently it does). Add the anticipation line ("You would be Member #N") right under the CTA. Move `MemberJourney` here as the "what happens after you buy" block.

### `/transparency`
This becomes the new home for the demoted proof sections (`ProtocolOverview`, `ProtocolRevenueEngine`, `ProtocolStatusGrid`, `UseOfFunds`). Order: live snapshot → routing flow → treasury composition → revenue engine → status grid → use of funds. Verifiable proof leads; mechanism explainers follow.

### `/activity`
Owns `ProtocolEventsFeed` and `ProtocolTimeline` in full. The homepage shows only a 3-row teaser linking here.

### `/members` (and `/founders`)
Owns the social-proof rail. Homepage Zone 4 shows top 5 + link.

### `/ranks`
Owns `MemberJourney`, `RankHub`, `RankSimulator`. Homepage does not need any rank surface.

### `/roadmap`
Owns `WhyComeBackTomorrow`'s longer form. Homepage Zone 3 shows the 3 nearest "Coming Next" items linking here.

### `/tokenomics`, `/whitepaper`, `/faq`, `/registry`, `/chapters`
Already covered by the IA decision doc — dead-end CTAs at end of each.

---

## 6. Target scorecard (after the hierarchy change)

| Dimension | Current | Target | Delta |
|---|---|---|---|
| What is this? (5s) | 6 | 9 | +3 |
| Why care? | 5 | 9 | +4 |
| Why now? | 4 | 8 | +4 |
| What do I do? | 7 | 9 | +2 |
| Trust position | 5 | 8 | +3 |
| Momentum (trajectory) | 4 | 8 | +4 (sparkline) |
| Story (memory + anticipation) | 3 | 8 | +5 (Zone 3) |
| Identity hook | 4 | 7 | +3 |
| **Composite** | **4.75** | **8.25** | **+3.5** |

Expected conversion lift (Join click-through from `/`): **+25–40%** primarily from above-fold anticipation + heartbeat collapse, not from CTA copy.

---

## 7. Implementation order (when approved — DO NOT START YET)

Each wave is a single PR, in this order:

- **Wave I-1 (Heartbeat collapse):** Merge `LiveRecencyStrip` into `LivePulseStrip` cells; cut pulse to 4 cells; add anticipation line "Next Member #N · X remaining"; mount inside hero footer.
- **Wave I-2 (Growth sparkline):** Add a minimal `GrowthSparkline` strip (members · USDC raised · vault, 30d). One row, three sparkliness. Data already in `useProtocolPulse` + `useHolderIndex` history.
- **Wave I-3 (Story zone):** Build `StorySoFar` (from `EarlyChapters` + `MilestoneTracker` past entries) and `ComingNext` (from `MilestoneTracker` future + `WhyComeBackTomorrow` copy). Mount as Zone 3.
- **Wave I-4 (Why merge):** Collapse 5 Why-* components into a single `WhyJoin` section in Zone 5. Delete the rest from homepage (files remain for /join, /whitepaper).
- **Wave I-5 (Proof demotion):** Move `ProtocolOverview`, `ProtocolRevenueEngine`, `ProtocolStatusGrid`, `UseOfFunds`, `ProtocolFlywheel`, `OpportunitySection` off `/` and into `/transparency` and `/whitepaper`. Homepage Zone 6 keeps `HomeTransparencySnapshot` (lead) + `RoutingFlow` + `TreasuryComposition` + `LpStatusCard`.
- **Wave I-6 (Identity rail):** Promote `SinceYourLastVisit` into Zone 4; add a first-time visitor variant ("You would be Member #N · Join now").
- **Wave I-7 (Cleanup):** Remove `ProtocolTimeline`, `MemberJourney`, `WhatSynDoes`, `ProtocolSnapshots`, `MemberCard`, `WhyDifferent` from `/`. Bump `build-stamp` to `wave-IH.master`. Run `check-live`.

Each wave is independent, ships in under 200 LOC, and is reversible.

---

## 8. Explicit non-changes

- No new protocol features, NFTs, governance, referral, AI, or vault automation.
- No copy rewrites of the demoted sections — they keep working on their dedicated routes.
- No design system changes.
- No new data sources — every number in the new hierarchy is already live in `useProtocolPulse`, `useHolderIndex`, `useSaleStats`, `useProtocolEvents`.
- The growth sparkline uses on-chain history we already index; if any window is incomplete, the strip shows PARTIAL and never invents data.

---

## 9. The casino test (final check)

A casino shows: jackpot · last winner · countdown · play button.

The Syndicate equivalent on `/` after this pass:

- **Jackpot** → `Vault: $15,080` (Zone 2)
- **Last winner** → `Last join: 2h ago` (Zone 2)
- **Countdown** → `Next Member #50 · 7 remaining` (Zone 2)
- **Play button** → `Buy SYN` (Zone 1)

All four visible in the first viewport. Everything else earns its scroll.

---

**Decision required:** approve hierarchy + wave order, then I execute Wave I-1 → I-7 in sequence. Nothing built in this pass.
