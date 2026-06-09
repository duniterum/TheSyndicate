# THE SYNDICATE — SITE REDESIGN EXECUTION REPORT

Source of truth: `VISION.md`, `NORTH_STAR_SYSTEM.md`,
`INFORMATION_HIERARCHY.md`, `CONSTITUTION_SUMMARY.md`,
`IMPLEMENTATION_EXECUTION_PLAN.md`.

This report records the actual changes shipped in the homepage
redesign pass. It is not a plan; it is a diff narrative.

---

## 1. WHAT CHANGED

The homepage was rebuilt around the 6-zone hierarchy defined in
`INFORMATION_HIERARCHY.md`:

```text
ZONE 1  Hero
ZONE 2  Heartbeat  (LivePulseStrip)  +  AnticipationLine  +  TrustBar
ZONE 3  Story      (StorySoFar)      +  ProtocolMoments
ZONE 4  Identity   (IdentityZone)
ZONE 5  Conversion (WhyJoinSimple    +  HowToJoinSteps   +  WhatChangesAfterJoining)
ZONE 6  Proof      (HomeTransparencySnapshot + LP card + final Join CTA + RiskDisclaimer)
```

A global mobile sticky `MobileJoinBar` is mounted in `__root.tsx`.

---

## 2. NEW COMPONENTS

| File | Purpose | Zone |
|---|---|---|
| `src/components/syndicate/AnticipationLine.tsx` | "Next: Member #N · X remaining · Chapter Y forming" — pure derivation from `useProtocolPulse`. | 2 |
| `src/components/syndicate/StorySoFar.tsx` | Compact wrapper: MilestoneTracker (past) → ProtocolEventsFeed teaser (present) → EarlyChapters (past cont.) → "Coming next" card (future). Reuses existing components — no new data sources. | 3 |
| `src/components/syndicate/ProtocolMoments.tsx` | "I was there" rail: 8 protocol moments (first member, first $100/$1k/$10k routed, Genesis sealed, first LP event, member #100, member #500). Each labeled REACHED / NEXT / Pending — derived live from sale/vault/LP reads. | 3 |
| `src/components/syndicate/IdentityZone.tsx` | One component, three states: disconnected (`You could be Member #N`), connected (`You are Member #N · Chapter X · Rank Y`), returning (delegates to `SinceYourLastVisit`). Uses `useAccount` + `useHolderIndex.getByWallet`. | 4 |
| `src/components/syndicate/MobileJoinBar.tsx` | Global mobile sticky bar with `Next Member #N`, Verify link, Join CTA. Hidden on `/join`. Desktop unaffected. | global |

---

## 3. COMPONENTS MERGED / DEMOTED / REMOVED FROM HOMEPAGE

The following were **removed from `src/routes/index.tsx`** (files still
exist for use on dedicated routes — nothing was deleted):

- `StartHereCard` — no longer needed once Zone 1 + Zone 2 carry the 10-second answer.
- `LiveRecencyStrip` — merged out. The heartbeat is now a single strip (`LivePulseStrip`) with the anticipation line beneath.
- `SinceYourLastVisit` (standalone position) — now rendered inside `IdentityZone`.
- `ProtocolEventsFeed` (full) — demoted. A 5-row teaser appears in `StorySoFar`; the full feed lives on `/activity`.
- `ProtocolTimeline` — fully demoted to `/activity` (already present there).
- `WhyTheSyndicateExists`, `WhyBecomeMember`, `WhyEarlyMatters`, `WhyJoinNow`, `WhyDifferent` — five Why-\* sections collapsed. `WhyJoinSimple` is the single canonical Why block in Zone 5. The other Why-\* components remain available for individual routes if needed but no longer compete for homepage real estate.
- `MemberJourney`, `HowItWorks30s`, `WhatSynDoes` — pulled from the homepage; explanatory content lives on `/whitepaper` and `/docs`.
- `ProtocolOverview`, `ProtocolRevenueEngine`, `RoutingFlow`, `TreasuryComposition`, `CapitalAllocation`, `ProtocolStatusGrid`, `ProtocolFlywheel`, `OpportunitySection`, `UseOfFunds` — heavy proof / mechanism sections removed from the homepage. They are reachable from `/transparency`, `/tokenomics`, `/vault`, and `/whitepaper`.
- `ProtocolSnapshots`, `MemberCard`, `HomeShareCTA`, `MilestoneTracker` (standalone) — milestone tracker now lives inside `StorySoFar`; shareable surfaces moved off the homepage to avoid duplication with `IdentityZone` and the upcoming wallet OG flow.

---

## 4. WHAT WAS MOVED UP

- **Story** (milestones + early chapters + "coming next") — was at section ~19, now at Zone 3.
- **Protocol Moments** — new rail, surfaced immediately after Story.
- **Identity** — was effectively invisible for first-time visitors; now Zone 4 with a wallet-aware variant.
- **Next-member anticipation** — was buried inside `LivePulseStrip`; now a dedicated line directly under the heartbeat AND surfaced inside the hero as `You could be Member #N`.
- **Join CTA** — now persistently reachable from the mobile sticky bar on every page.

---

## 5. WHAT WAS DEMOTED

- All mechanism / explainer sections (Revenue Engine, Flywheel, Routing, Treasury Composition, Capital Allocation, Use of Funds, Protocol Status Grid, Opportunity) — removed from the homepage. Homepage no longer reads like a whitepaper.
- Full event feeds (`ProtocolEventsFeed`, `ProtocolTimeline`) — pinned to `/activity`.

---

## 6. STALE COPY REMOVED / NOT INTRODUCED

While touching the homepage, we removed:

- The redundant `LiveRecencyStrip` block (no longer rendered).
- The "Wallets have joined" phrasing in the hero — replaced with `verified Members on-chain` to align with the north-star metric in `NORTH_STAR_SYSTEM.md`.
- Two of the three redundant CTAs in the bottom Join section (kept Buy SYN + Transparency + Registry; previously the same intent was expressed four times across the page in repeated Why-\* blocks).

New copy was reviewed against `VISION.md` banned-word list (ROI, dividend, yield product, profit share, investment, returns, guaranteed appreciation, passive income). None appears in any new component.

`ProtocolMoments` was specifically designed to never invent events: each tile is either `Reached · on-chain` (derived from live `useProtocolPulse` totals), `Next moment` (the first not-yet-reached), or `Pending`. No fabricated timestamps, no fake "X just hit" toasts.

---

## 7. 10-SECOND RULE CONFIRMATION

A visitor landing on `/` with no scroll sees, in order:

1. **What is this?** — Hero headline + one-sentence positioning ("transparent on-chain protocol on Avalanche … 70/20/10 routing").
2. **Is it alive?** — Hero LIVE/PENDING status rows + green pulsing dot + `N verified Members on-chain`.
3. **Why now?** — Hero `Next: Member #N` + `You could be Member #N` line.
4. **How do I join?** — Hero `Join — become a member for $5` primary CTA + `Verify everything` secondary.
5. **How many members exist?** — Hero counter + (one scroll) Zone 2 `LivePulseStrip` cell `Members`.
6. **What milestone is next?** — Zone 2 `AnticipationLine` immediately under heartbeat.

All six are answered without leaving the first one-and-a-half viewports on desktop, and within the hero + first scroll on mobile (with the mobile sticky Join bar present at all times).

---

## 8. REMAINING RISKS

- **`useHolderIndex` cold load.** `IdentityZone` for connected wallets renders the disconnected variant until the index resolves. This is acceptable (truth > impressive) but should be confirmed visually under slow RPC.
- **`AnticipationLine` chapter math.** If `nextMemberNumber > 1000`, the line hides the chapter remainder (returns `null`); the heartbeat still surfaces the next member number. Acceptable for current scale; revisit before the open chapter.
- **`StorySoFar` length.** It now bundles MilestoneTracker + a 5-row events teaser + EarlyChapters + "Coming next". This is intentionally information-dense; if it dominates the page later, split into two adjacent sections.
- **Footer-level navigation to the demoted sections** (Revenue Engine, Flywheel, etc.) should be audited next pass; their existing routes (`/transparency`, `/tokenomics`, `/whitepaper`) cover the surface area, but a leaf-page audit (Wave E-5 in the execution plan) is the follow-up.

---

## 9. VERIFICATION

`npm run check-live` — **All 9 routes passed** (HTTP 200 on `/`, `/ranks`, `/members`, `/founders`, `/chapters`, `/join`, `/transparency`, `/tokenomics`, `/docs`).

No new data hooks were added. No on-chain reads were introduced. Every new component reuses `useProtocolPulse`, `useHolderIndex`, `useAccount`, or `useVisitorMemory`.

---

## 10. NEXT WAVES (per `IMPLEMENTATION_EXECUTION_PLAN.md`)

E-4 onward — copy review of remaining routes, leaf-page Join CTAs, unique `head()` audit, status-pill discipline pass, and the curated `/activity` "Protocol Moments" rail. Those waves do not block the homepage shipped here.
