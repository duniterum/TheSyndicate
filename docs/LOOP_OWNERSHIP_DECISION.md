# LOOP OWNERSHIP DECISION — Wave P6

**Status:** Architecture decision · no new code, no new framework, no new registry.
**Supersedes (partially):** `docs/RETURN_LOOP_ARCHITECTURE.md` Top-3 recommendation.
**Build tag (when implemented):** `wave-P6.loop-ownership`.

---

## 1. Confirmed Loops

P5 (Return Loop Architecture) is approved with one change: **Protocol Moments
is retained as a supporting loop**, not a primary one.

| # | Loop | Role | Cadence |
|---|---|---|---|
| **A** | Next Member # | Primary — identity | Every visit |
| **B** | Remaining to Chapter Close | Primary — urgency without scarcity | Every visit |
| **C** | Since Your Last Visit | Primary — ownership / memory | 2nd visit onward |
| **D** | Protocol Moments | **Supporting** — historical memory; feeds Loop C | Slow (one moment per real on-chain event) |

Hierarchy: **A > B > C > D**. D may never visually outweigh A–C.

---

## 2. Canonical Ownership

For every loop: **one source · one component · one home**. Other surfaces
may *reference* (with a link), never *re-render*.

### Loop A — Next Member #
| Slot | Owner |
|---|---|
| Canonical source | `TRUTH.nextMemberNumber` (from `src/lib/protocol-truth.ts`) |
| Canonical component | `NextMemberHero` (to be extracted from `Hero.tsx`) |
| Canonical home | Homepage hero — directly under the one-line positioning sentence |
| Allowed secondary references | `IdentityZone`, `ProtocolMoments`, `EarlyChapters`, `MobileJoinBar` — must read from `TRUTH.nextMemberNumber`, must NOT render a standalone counter tile larger than a single inline pill |
| Forbidden | Any duplicate `#NN` headline outside the hero. No "Next member" tiles in `HomeMetricsStrip`, `LivePulseStrip`, `LiveRecencyStrip`, `TrustBar`, `AnticipationLine` |

### Loop B — Remaining to Chapter Close
| Slot | Owner |
|---|---|
| Canonical source | `TRUTH.chapterProgress` (new derived fact: `{ chapter, closeAt, remaining }` — composed inside protocol-truth, no new registry) |
| Canonical component | `HomeNextMilestone` (already exists; rewire to read `TRUTH.chapterProgress`) |
| Canonical home | Homepage — immediately below hero, before any narrative / proof sections |
| Allowed secondary references | `/chapters`, `EarlyChapters` card, `MobileJoinBar` mini-pill |
| Forbidden | Additional "X to next milestone" counters on the homepage. No countdowns on `HomeMetricsStrip`, `TrustBar`, or `Sections.tsx` strips |

### Loop C — Since Your Last Visit
| Slot | Owner |
|---|---|
| Canonical source | `visitor-memory` × `protocol-truth` (existing) |
| Canonical component | `SinceYourLastVisit` |
| Canonical home | Homepage — first section after hero **for returning visitors only**; hidden on first visit |
| Detailed view | `/activity` page renders the full chronological delta |
| Allowed secondary references | `/activity` link inside the component |
| Forbidden | Showing this card on first-visit sessions; replicating "since your last visit" copy inside other components |

### Loop D — Protocol Moments (supporting)
| Slot | Owner |
|---|---|
| Canonical source | `TRUTH` × `TAGGED_TRANSACTIONS` (existing) |
| Canonical component | `ProtocolMoments` |
| Canonical home | Story Zone (between `StorySoFar` and `IdentityZone`) |
| Purpose | Historical memory — "I was there for…" anchors. Feeds Loop C narration. |
| Forbidden | Promotion above A–C. No moments in the hero. No "next moment" countdown styled like Loop B. No fabricated future moments |

---

## 3. Duplicate Renderings Found (must collapse)

Audit of current homepage + components for each loop:

### Next Member # (Loop A) — duplicates
1. `Hero.tsx` — primary headline. **KEEP as canonical (extract `NextMemberHero`).**
2. `IdentityZone.tsx` — renders next-number prominently. **DEMOTE to inline reference pill.**
3. `AnticipationLine.tsx` — re-states "Next Member #N" as a stand-alone strip. **REMOVE (rolls into hero).**
4. `LivePulseStrip.tsx` — surfaces next-number tile. **REMOVE the tile (strip itself may keep last-buy only — see §4).**
5. `MobileJoinBar.tsx` — inline "#N" pill. **KEEP as reference (mobile only).**
6. `EarlyChapters.tsx` — uses next-number to compute remaining. **KEEP, but consume `TRUTH.nextMemberNumber` directly, no local re-derivation.**

### Remaining to Chapter Close (Loop B) — duplicates
1. `HomeNextMilestone.tsx` — currently renders `SaleStatsPanel` (USDC raised). **REWIRE to render chapter progress as the headline; demote USDC raised to a verify link.**
2. `EarlyChapters.tsx` — renders chapter progress per row. **KEEP as detail view (different framing: per-chapter list, not homepage headline).**
3. `MilestoneTracker.tsx` — overlaps. **DEMOTE to /roadmap only; remove from homepage if present.**

### Since Your Last Visit (Loop C) — duplicates
1. `SinceYourLastVisit.tsx` — canonical. **KEEP.**
2. Homepage currently does **not** render it. **ADD to homepage (returning-visitor only).**
3. `/activity` route — keep as detailed view; ensure it does NOT re-render the same compact card.

### Protocol Moments (Loop D) — duplicates
1. `ProtocolMoments.tsx` — canonical. **KEEP.**
2. `StorySoFar.tsx` — narrates similar moments in prose. **KEEP (different medium — prose vs. enumerated list); add a one-line cross-link, no data duplication.**
3. `LiveActivityFeed.tsx` — event list. **KEEP on `/activity`; remove from homepage to avoid Loop D vs. raw-feed confusion.**

---

## 4. Noise Audit — KEEP / DEMOTE / REMOVE

Test for every homepage component: *"Which loop (A, B, C, D) does this support?"*
If the answer is **none**, it is noise.

| Component | Supports | Decision | Rationale |
|---|---|---|---|
| `Hero` | A | **KEEP** (extract `NextMemberHero`) | Canonical home for Loop A |
| `HomeNextMilestone` | B | **KEEP** (rewire) | Canonical home for Loop B |
| `SinceYourLastVisit` | C | **KEEP + ADD to home** | Missing from homepage; canonical home for Loop C |
| `ProtocolMoments` | D | **KEEP** | Canonical home for Loop D |
| `IdentityZone` | A (reference) | **DEMOTE** | Strip standalone counter; keep identity narrative |
| `EarlyChapters` | A + B (reference) | **KEEP** | Per-chapter detail; reads canonical sources |
| `StorySoFar` | D (prose) | **KEEP** | Narrative complement to Loop D |
| `WhyJoinSimple` / `HowToJoinSteps` / `WhatChangesAfterJoining` | — (explanatory) | **KEEP** | Answers "What is this?" — required before loop engagement |
| `HomeTransparencySnapshot` | — (trust) | **KEEP** | Trust pre-req for all loops |
| `LpStatusCard` | — (trust detail) | **KEEP** | Verifiable proof; not a loop |
| `RiskDisclaimer` | — (legal) | **KEEP** | Required |
| `AnticipationLine` | A (duplicate) | **REMOVE** | Pure re-render of Loop A |
| `LivePulseStrip` | A/B (duplicate tiles) | **DEMOTE** to "last buy · N ago" single pill, OR **REMOVE** | Currently a multi-tile re-render of TRUTH; doesn't drive return |
| `LiveRecencyStrip` | A/B (duplicate) | **REMOVE from home** | Folds into Loop B headline + last-buy pill |
| `TrustBar` | — | **REMOVE from home** | Trust signals already in `HomeTransparencySnapshot` |
| `HomeMetricsStrip` | — (raw data) | **REMOVE from home** | Raw numbers belong on `/registry` and `/transparency`; doesn't answer any loop |
| `HomeRankLadder` | — | **REMOVE from home** | Move to `/ranks` (already canonical) |
| `MarketDashboard` | — (price) | **REMOVE from home** | Price talk violates trust/aspiration rule; link to DexScreener instead |
| `MilestoneTracker` | B (duplicate) | **REMOVE from home** | Keep on `/roadmap` |
| `LiveActivityFeed` | D (raw) | **REMOVE from home** | Keep on `/activity` |

---

## 5. Canonical Homepage Section Order (post-P6)

```text
1. Hero                            ← Loop A canonical (NextMemberHero inside)
2. HomeNextMilestone               ← Loop B canonical (chapter progress headline)
3. SinceYourLastVisit              ← Loop C canonical (returning visitors only)
4. WhyJoinSimple                   ← "What is this?" — explanatory
5. HowToJoinSteps                  ← How to engage
6. WhatChangesAfterJoining         ← Member story
7. StorySoFar                      ← Narrative
8. ProtocolMoments                 ← Loop D supporting
9. IdentityZone                    ← Identity story (no standalone counter)
10. HomeTransparencySnapshot       ← Trust proof
11. LpStatusCard                   ← Trust detail
12. Home Join CTA                  ← Conversion
13. RiskDisclaimer                 ← Legal
14. Footer
```

Removed from homepage (live elsewhere):
`AnticipationLine`, `LivePulseStrip`, `LiveRecencyStrip`, `TrustBar`,
`HomeMetricsStrip`, `HomeRankLadder`, `MarketDashboard`, `MilestoneTracker`,
`LiveActivityFeed`.

---

## 6. Implementation Order

Strict order — do not parallelize across phases.

1. **Extend `protocol-truth.ts`** with `chapterProgress` fact (Loop B canonical source). Composed from existing reads; no new chain calls; no new registry file.
2. **Extract `NextMemberHero`** from `Hero.tsx`. Hero composes positioning sentence + `NextMemberHero`. No duplicate counters elsewhere.
3. **Rewire `HomeNextMilestone`** to read `TRUTH.chapterProgress` as the headline; existing sale-stats panel becomes a verify-link footer.
4. **Add `SinceYourLastVisit` to homepage** under `HomeNextMilestone`, gated on `visitor-memory.isReturning`.
5. **Remove from homepage**: the 9 components listed above. Keep them in their canonical homes.
6. **Demote duplicate counters** inside `IdentityZone`, `EarlyChapters`, `MobileJoinBar` to inline references reading `TRUTH.nextMemberNumber`.
7. **Verification pass** — for every homepage component answer: "Which loop does this support? (A/B/C/D)". If none → it must not be on the homepage.
8. **Update `build-stamp`** to `wave-P6.loop-ownership` and record evidence in `docs/WAVE_P_EXECUTION_REPORT.md`.

---

## 7. Guardrails

- No new framework. No new layer. No new registry. Everything composes from `protocol-truth` and `transaction-tags`.
- No price, yield, governance, or rewards talk inside any loop.
- Loop D may not gain countdowns, fake moments, or projected future events.
- A component that supports zero loops is noise on the homepage, even if it is valuable on its own canonical page.
- Constitution still wins all conflicts (see `docs/VISION.md`).

---

## 8. Out of Scope (deferred)

- Wallet flow, KYC-like identity, additional drawers, CI polish — all blocked until P6 implementation is shipped and verified on the preview URL.
- Memory Layer (chatgpt's earlier suggestion) — deferred until return loops are observed in real visitor data.
