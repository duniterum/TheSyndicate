# Return Loop Architecture

**Wave:** P5 · Strategy (architecture only — no implementation)
**Status:** Living document
**Predecessors:** `VISION.md`, `INFORMATION_HIERARCHY.md`, `PROTOCOL_TRUTH_LAYER_REPORT.md`, `TRANSACTION_TAG_REGISTRY.md`, `STORY_ENGINE_AUDIT.md`
**Rule:** No code changes follow from this document until the Top-3 loops are confirmed.

---

## 0 · Why this document exists

We have built, in order:

1. **Vision** — what the protocol is for.
2. **North Star** — the single measurable goal.
3. **Information Hierarchy** — what the visitor sees and in what order.
4. **Protocol Truth Layer** — one canonical fact for every displayed number.
5. **Transaction Tag Registry** — one canonical classification for every dollar.

These layers all answer *"is this true?"* and *"do I belong?"*.
None of them answer *"why should I come back tomorrow?"*

That gap is what this document maps. We are explicitly **not** introducing
another framework, layer, or registry. We are using the surfaces we already
have to identify the smallest set of real, verifiable loops that produce
**repeat visits without rewards, speculation, or gamification.**

Trust → attachment → **habit**. This document is about habit.

---

## 1 · Definitions

- **Loop** = a public, on-chain-derived state that has a *current value* AND
  a *next state* a member can anticipate.
- **Real** = derived from chain reads or the tagged-transaction registry.
- **Verifiable** = every value links to an explorer or contract source.
- **Non-promissory** = no implied price, yield, or governance outcome.
- **Return-eligible** = the loop's next state changes on a timescale a
  human will notice (hours / days / weeks) — not seconds (too noisy) and
  not years (no anticipation).

A loop fails if any of these are absent. A "loop" that never advances is a
metric, not a loop.

---

## 2 · Task 1 — Map every loop currently present

Inventory of every surface that exposes a current → next pair today.

| # | Loop | Where it lives | Source of truth | Status |
|---|------|---------------|-----------------|--------|
| 1 | **Next Member #** (N → N+1) | Hero, HomeNextMilestone, IdentityZone, ProtocolMoments | `TRUTH.nextMemberNumber` | Existing |
| 2 | **Remaining to Chapter Close** | HomeNextMilestone, EarlyChapters, AnticipationLine | derived from members + chapter size | Existing |
| 3 | **Chapter Formation** (which chapter is filling) | EarlyChapters, /chapters | derived | Existing |
| 4 | **Protocol Moments** (next public milestone reached) | ProtocolMoments rail | `useProtocolPulse` + thresholds | Existing |
| 5 | **Last Buy · time since** | LivePulseStrip, LiveRecencyStrip, TrustBar | `TRUTH.lastBuyAgoSeconds` | Existing |
| 6 | **USDC Routed cumulative** | HomeMetricsStrip, TransparencyCenter | `TRUTH.usdcRaised` | Existing — counter only |
| 7 | **LP TVL** | LpStatus, LiquidityTrustContext, MarketDashboard | `TRUTH.lpTvlUsd` | Existing — counter only |
| 8 | **Treasury wallet balances** | TreasuryComposition, VaultPolicyCore | `TRUTH.vaultUsdc / liquidityUsdc / operationsUsdc` | Existing — counter only |
| 9 | **Classified spending** (new tagged tx) | UseOfFunds | `TRUTH.transactions` | Partial — registry exists, no "new since last visit" cue |
| 10 | **Since your last visit** delta | SinceYourLastVisit | `visitor-memory` + truth layer | Partial — built but underused |
| 11 | **Rank ladder** | RankHub, HomeRankLadder | static spec + member count | Partial — ladder is static; no "next rank to fill" hook |
| 12 | **Activity feed** | LiveActivityFeed, ProtocolEventsFeed | event hooks | Existing — stream, not loop |
| 13 | **Founders Hall progression** | /founders | manual / static | Missing — no next-state cue |
| 14 | **Chapter archive (closed chapters)** | /chapters/$slug | derived | Missing — closed chapters have no "what's next" |
| 15 | **Roadmap waves** | /roadmap | manual | Existing — but cadence is months, not days |
| 16 | **Protocol revenue events** | ProtocolRevenueEngine | partial / pending | Missing as a loop — no scheduled next event |
| 17 | **NFT issuance** | /nfts | pending | Missing |

Classification summary:

- **Existing return-eligible**: 1, 2, 3, 4, 5, 10
- **Existing but counter-only** (no anticipation): 6, 7, 8, 12, 15
- **Partial**: 9, 11
- **Missing**: 13, 14, 16, 17

---

## 3 · Task 2 — Score each loop

Scale 1–10. Five dimensions:

- **Visibility** — is it on a surface a returning visitor will actually load?
- **Emotional pull** — does the next state feel personal / mission-relevant?
- **Verifiability** — can the user prove the value on chain in <2 clicks?
- **Frequency** — does the next state change on a human timescale?
- **Return potential** — would I open the tab tomorrow because of this loop?

Score → sum (max 50). Anything ≥ 35 is a candidate Top-3.

| # | Loop | Vis | Emo | Ver | Freq | Ret | Total |
|---|------|----:|----:|----:|----:|----:|------:|
| 1 | Next Member # | 10 | 10 | 10 | 9 | 10 | **49** |
| 2 | Remaining to Chapter Close | 9 | 9 | 10 | 9 | 9 | **46** |
| 4 | Protocol Moments (next moment) | 8 | 9 | 9 | 7 | 9 | **42** |
| 3 | Chapter Formation | 7 | 7 | 9 | 6 | 7 | 36 |
| 9 | Classified spending (new tx) | 6 | 8 | 10 | 6 | 8 | **38** |
| 10 | Since your last visit | 7 | 8 | 9 | 7 | 8 | **39** |
| 5 | Last Buy · time since | 8 | 6 | 9 | 9 | 6 | 38 |
| 11 | Rank ladder (next rank to fill) | 6 | 7 | 8 | 5 | 6 | 32 |
| 6 | USDC Routed cumulative | 9 | 4 | 10 | 6 | 4 | 33 |
| 7 | LP TVL | 7 | 4 | 9 | 6 | 4 | 30 |
| 8 | Treasury balances | 6 | 4 | 10 | 5 | 4 | 29 |
| 12 | Activity feed | 6 | 5 | 8 | 8 | 5 | 32 |
| 13 | Founders Hall progression | 5 | 7 | 6 | 3 | 5 | 26 |
| 14 | Chapter archive | 5 | 6 | 8 | 2 | 4 | 25 |
| 15 | Roadmap waves | 5 | 6 | 6 | 2 | 4 | 23 |
| 16 | Revenue events | 4 | 7 | 5 | 2 | 4 | 22 |
| 17 | NFT issuance | 4 | 5 | 4 | 1 | 3 | 17 |

---

## 4 · Task 3 — The Top 3 loops

Only three. Anything else is noise.

### Loop A — **Next Member #** (49)
The single strongest loop the protocol has.
Every visit answers *"who is next?"* and *"could it be me?"*.
Strictly identity-based. No price, no reward, no leaderboard wealth.

### Loop B — **Remaining to Chapter Close** (46)
Converts the membership counter from a number into a *deadline*.
"3 remaining to Chapter 2" is the only line in the product that creates
real urgency without manufacturing it.

### Loop C — **Since your last visit** (39)
The only loop that personalises return.
Tells the returning visitor exactly what changed on chain in their absence:
new members, new tagged transactions, milestones crossed.
Already implemented as `visitor-memory` + `SinceYourLastVisit` — currently
underused.

> Tiebreaker note: Loop 4 (Protocol Moments) and Loop 9 (Classified spending)
> both scored well and are not discarded — they are demoted to *supporting*
> loops that feed Loop C ("what changed since you were here").

---

## 5 · Task 4 — Placement map (one loop, one home)

| Loop | Canonical home | Supporting surface | Forbidden duplicates |
|------|---------------|-------------------|---------------------|
| A · Next Member # | Hero (above the fold) | IdentityZone, ProtocolMoments | Do NOT also render in HomeMetricsStrip, TrustBar, or any footer rail |
| B · Remaining to Chapter Close | HomeNextMilestone | EarlyChapters, /chapters | Do NOT also render in Hero subtitle or HomeMetricsStrip |
| C · Since your last visit | SinceYourLastVisit panel, immediately under hero on return visits | /activity (full diff view) | Do NOT render generic "live activity" + "since last visit" + "recency strip" on the same screen — collapse into one |

Rule: a loop has exactly one *primary* surface. Other surfaces may *reference*
it (with a link back), never re-render it.

---

## 6 · Task 5 — Noise to remove

Surfaces that consume hierarchy without producing return value. None of
these are bugs — they are simply *not* loops and should not be styled as if
they were.

1. **HomeMetricsStrip**: USDC Routed, LP TVL, SYN Spot as standalone tiles.
   Keep them, but visually demote — they are *context*, not anticipation.
   Remove the pulsing/animated styling that implies they are changing.
2. **LiveRecencyStrip** + **LivePulseStrip** + **TrustBar** *together*.
   Three components saying the same "last buy was X ago". Keep ONE
   (TrustBar), retire the other two as visible surfaces.
3. **MarketDashboard** on /token: live price ticker. Not a return loop —
   it's a speculation surface and risks contradicting the vision. Replace
   the ticker with a static "spot via Trader Joe pair" link.
4. **TransparencyCenter** repeating the same wallet balances rendered on
   /vault, /liquidity, /transparency. Pick one canonical surface per fact
   (per the Truth Layer rule) and remove the duplicates.
5. **Roadmap waves on homepage**: months-scale cadence. Move entirely to
   /roadmap; do not surface on home as a "loop".
6. **Rank ladder on homepage**: currently static. Either wire it to
   "next rank to fill" (Loop 11 promotion) or move it to /ranks. Do not
   keep a static ladder competing for hero attention.

---

## 7 · Task 6 — Decision

> **If The Syndicate had only three reasons to make someone return tomorrow,
> they would be:**
>
> 1. *"Has the next member joined yet — and could it be me?"* (Loop A)
> 2. *"How close is the current chapter to closing?"* (Loop B)
> 3. *"What changed on chain since I was last here?"* (Loop C)

Every other surface in the product must either **support** one of these
three loops or get out of the way. If a surface does neither, it is noise.

---

## 8 · Recommended next implementation (post-confirmation)

In dependency order. Each item is small and surgical. **Do not start until
the Top-3 above are confirmed.**

1. **Promote Loop A** — make "Next Member #N" the single largest typographic
   element above the fold on `/`. Remove competing tiles from the hero band.
2. **Promote Loop B** — wire `HomeNextMilestone` directly under the hero
   with a single sentence: *"N remaining to Chapter K close."* Link to
   `/chapters`.
3. **Promote Loop C** — on return visits (when `visitor-memory` has a prior
   snapshot), render `SinceYourLastVisit` as the second viewport block,
   ahead of generic metrics. On first visits, hide it entirely.
4. **Collapse the three "recency" components** into one TrustBar entry.
5. **Demote** HomeMetricsStrip and MarketDashboard per §6.
6. Only after 1–5 ship and stabilise: revisit the partial loops
   (9 · classified-spend diffs, 11 · next-rank-to-fill) as Wave P5b.

No new layers. No new registries. No new audits.

---

## 9 · Guardrails (binding)

- A loop may not be added if its next state depends on price, yield,
  airdrop, governance, referral, badge, streak, or any reward.
- A loop may not be added if its next-state cadence is faster than ~minutes
  (creates anxiety) or slower than ~weeks (creates apathy).
- A loop may not be added if it cannot be verified on chain in ≤ 2 clicks
  from where it is displayed.
- A surface may host at most one primary loop. Duplicates are noise.
- This document supersedes any future proposal for a "Memory Layer",
  "Anticipation Layer", "Engagement Layer", or similarly named framework.
  Habit is built by the three loops above, not by another framework.

---

*End of document. Architecture only — no code follows from this wave.*
