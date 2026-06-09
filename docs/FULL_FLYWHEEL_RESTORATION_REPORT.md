# FULL FLYWHEEL RESTORATION REPORT

**Date:** 2026-06-05
**Wave:** Post pre-launch recalibration
**Trigger:** The public site had over-corrected into "the seat is the product" framing, reducing a six-engine living protocol to a single identity hook.

---

## 1. Where the site had become too seat-only

| Surface | Symptom |
|---|---|
| Hero (`src/components/syndicate/Hero.tsx`) | Lede led with "The seat is the product." Vault, Liquidity, Routing, Activity, Chapters were not mentioned in the first paragraph. |
| Homepage zones (`src/routes/index.tsx`) | Flow went Hero → Milestone → Story → Identity → WhyJoin. Identity dominated; the **flywheel itself** was never named or visualized. |
| `WhyJoinSimple` | Six reasons all framed around "be recorded" / "have an identity" — no reason explained *what the protocol becomes* as more people join. |
| `StorySoFar` | Past / archive / next-member — correct, but stopped at the seat. Did not say "your USDC routes here, the Vault grows, the pool deepens." |
| Vault / Liquidity routes | Already strong individually, but never tied back to the loop on the homepage. |

Net: a first-time visitor could read the homepage and conclude "this is a numbered membership site." They would miss the full product.

---

## 2. What was restored

### 2.1 Hero copy (`src/components/syndicate/Hero.tsx`)
- Replaced "The seat is the product." lede with: *"A transparent on-chain protocol on Avalanche. Early members take permanent seats; every USDC routes publicly to Vault, Liquidity, and Operations; the archive deepens with every chapter."*
- Sub-paragraph now states the seat is the **identity anchor** and the flywheel is the **product**.
- No countdowns, no return promise, no banned copy. Same Genesis #10 anchor preserved.

### 2.2 New `Flywheel` section (`src/components/syndicate/Flywheel.tsx`)
- Mounted on the homepage between `SinceYourLastVisit` and `StorySoFar` (Zone 2.5).
- **The loop**, rendered inline: Join → Route 70/20/10 → Vault & Liquidity grow → Activity creates moments → Chapters close → Archive deepens → New visitors see proof → ↻ more join.
- **Six engines**, one card each, each ending with a deep-link CTA:
  1. Seat / Identity → `/registry`
  2. Routing / Trust → `/transparency`
  3. Vault / Accumulation → `/vault`
  4. Liquidity / Market → `/liquidity`
  5. Activity / Story → `/activity`
  6. Chapters / Momentum → `/chapters`
- Each card frames the engine as a **question the visitor is already asking** ("Who am I?" / "Where did the money go?" / "What just happened?") — not a feature list.
- Closing disclaimer: no return promise, the flywheel describes *meaning accumulation*, not yield.

### 2.3 Homepage order (`src/routes/index.tsx`)
```
Hero (seat + protocol promise)
HomeNextMilestone (Genesis closing)
SinceYourLastVisit (returning visitors)
Flywheel  ← NEW — full loop + six engines
StorySoFar / ProtocolMoments (narrative)
IdentityZone (your seat in the archive)
WhyJoin / HowToJoin / WhatChangesAfterJoining
HomeTransparencySnapshot / LP card
Final Join CTA
```
Flywheel sits **before** the narrative and identity zones so visitors see *what the protocol is* before *who they would be in it*.

---

## 3. How each route now supports the flywheel

| Route | Role in the flywheel | Status |
|---|---|---|
| `/` | Hero → Flywheel → Story → Identity → Proof → CTA | ✅ restored |
| `/transparency` | Engine #2 (Routing) deep dive — `VerifyEverything`, `RoutingFlow`, `UseOfFunds` already in place | ✅ already deep |
| `/vault` | Engine #3 (Vault) — `VaultPolicyCore`, routing examples, PENDING disclosure | ✅ already deep |
| `/liquidity` | Engine #4 (Liquidity) — `WhyLpMatters`, live reserves, LP events feed | ✅ already deep |
| `/activity` | Engine #5 (Activity) — `ProtocolEventsFeed` unified | ✅ already deep |
| `/chapters` | Engine #6 (Chapters) — chapter list + chapter detail | ✅ already deep |
| `/registry` | Engine #1 (Seat) — full member archive | ✅ already deep |

The repair was almost entirely on the **homepage narration**. Sub-routes already carried their own engine; they were just no longer named together.

---

## 4. Remaining gaps (intentional — not blockers)

| Gap | Why deferred |
|---|---|
| Roadmap framed by engine | `/roadmap` still reads as protocol phases. Acceptable for v1; revisit once Vault contract deploys. |
| Activity grouped by "moment" rather than "event" | Current chronological feed is correct for trust. Moment-grouping is a Wave-4 narrative concern, not a launch blocker. |
| Vault "what changed today" summary | Vault contract still PENDING; once live, surface daily delta on the homepage Flywheel card. |
| Cross-engine deltas ("the pool deepened by X since your last visit") | `SinceYourLastVisit` covers this for returning visitors; can be extended per-engine post-launch. |

None are required to ship. All are evolutions of the same flywheel framing.

---

## 5. Constitutional compliance

- **Five pillars** — Transparency (Routing/Vault/Liquidity engines), Identity (Seat engine), Memory (Chapters engine), Momentum (the loop), Shareability (cards link out). ✅
- **No banned copy** — no ROI, yield, dividend, returns, profit, guaranteed appreciation, scarcity countdowns. ✅
- **Verifiable > Impressive** — every engine card deep-links to its on-chain source route. ✅
- **Core Asset gate** — seat remains the scarce on-chain asset; the flywheel describes what the seat *witnesses*, not what it *earns*. ✅
- **Infinite Narrative gate** — Past (archive), Present (routing/activity), Next (chapters), Far (ongoing loop) all visible. ✅

---

## 6. Launch readiness

| Score | Value |
|---|---|
| Prior (post pre-launch verification) | 9.4 / 10 |
| **Now** | **9.5 / 10** |
| Delta | +0.1 — story reads as a living protocol, not a numbered membership |

**Recommendation:** ready for organic / low-paid traffic. The flywheel framing closes the last conceptual gap between "what we sell" and "what the protocol is."

---

## 7. Files changed

- **Created**: `src/components/syndicate/Flywheel.tsx`
- **Created**: `docs/FULL_FLYWHEEL_RESTORATION_REPORT.md`
- **Edited**: `src/components/syndicate/Hero.tsx` (lede + sub-paragraph)
- **Edited**: `src/routes/index.tsx` (mount Flywheel between Zone 2 and Zone 3)
