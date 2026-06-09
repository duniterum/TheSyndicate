> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# Story Engine Audit

Audit only. No code changes. Lens: Founder · Product · Growth · Investor · Community · UX · Psychology · Retention. Driving question: **"Why would someone come back tomorrow?"**

---

## 1. Inventory — story-related surfaces that already exist

Legend: V = visible (mounted on a live route) · H = hidden (defined but not mounted) · L/P/Pn = Live/Partial/Pending data.

### A. Activity / Events / Feeds

| # | Component | Route | Source | Status | Vis | Role |
|---|---|---|---|---|---|---|
| 1 | `ProtocolEventsFeed` | `/` (compact 8), `/activity` (40), `/liquidity` (15) | `useProtocolEvents` (purchases, swaps, LP, vault flows, new-member, ranks) | L | V | Unified chronological feed |
| 2 | `ProtocolTimeline` | `/` (60), `/activity` (80) | same `useProtocolEvents` + `useChainTime` | L | V | Today / Week / Recent bucketed view of #1 |
| 3 | `LiveActivityFeed` + `ActivityFeedTabs` | `/activity`, `/transparency` | `useLiveActivity` (sale-only TokensPurchased) | L | V | Filtered purchase feed |
| 4 | `MiniExplorer` | `/activity` | per-tab LP / treasury / large-buys | L/P | V | Specialized explorer tabs |
| 5 | `Sections.tsx → ActivityFeed` | none | demo data | P | H | Legacy demo of #3 |

### B. History / Archive / Chronicle

| # | Component | Route | Source | Status | Vis | Role |
|---|---|---|---|---|---|---|
| 6 | `Sections.tsx → DayOneArchive` | none | static | — | H | "Day-one archive" concept, unmounted |
| 7 | `chapters.$slug` (Chapter Archives) | `/chapters/:slug` | `useHolderIndex` window | L/P | V | Per-chapter member roster + open/close events |
| 8 | `EarlyChapters` | `/` | `useProtocolPulse.nextMemberNumber` | L | V | Genesis / 100 / 500 / 1000 banding |
| 9 | `LiveRecencyStrip` "Chapter forming" | `/` (sub-hero) | `useProtocolPulse` | L | V | Tiny chapter cue |
| 10 | Founders Hall (`/founders`) | `/founders` | `useHolderIndex` first 100 | L | V | Historical: who was first |

### C. Timeline / Roadmap / Episodes

| # | Component | Route | Source | Status | Vis | Role |
|---|---|---|---|---|---|---|
| 11 | `roadmap` route | `/roadmap` | static phases | — | V | Forward-looking phases |
| 12 | `episodes` route | `/episodes` | `EpisodeEngine`, `WhyComeBackTomorrow`, `MeasuredFomo` | — | V (orphan, marked for merge → /roadmap per IA decision) | Narrative episodes |
| 13 | `Sections.tsx → EpisodeEngine` | `/episodes` only | static | — | V (via #12) | Story beats |
| 14 | `Sections.tsx → WhyComeBackTomorrow` | `/episodes` only | static | — | V (via #12) | LITERALLY answers the audit question, but buried on an orphan route |

### D. Milestones / Progression

| # | Component | Route | Source | Status | Vis | Role |
|---|---|---|---|---|---|---|
| 15 | `MilestoneTracker` | `/` | `useSaleStats` + thresholds | L | V | Numeric thresholds (members, USDC raised, vault) |
| 16 | `HomeNextMilestone` | none | derived | L | H | "Next milestone" focus card, unmounted |
| 17 | OG milestone route `/milestone/:id` | `/milestone/:id`, `/api/public/og/milestone/:id` | derived | L | V | Shareable milestone cards |
| 18 | `QuestProgress` | none/wallet | `useUserQuestProgress` | P | H mostly | Per-wallet quest steps |

### E. Journey / Identity / Member story

| # | Component | Route | Source | Status | Vis | Role |
|---|---|---|---|---|---|---|
| 19 | `HomeJourney` (`JOURNEY_STEPS`) | none | static config | — | H | 7-step membership journey, unmounted |
| 20 | `MemberJourney` | `/` | static identity progression | — | V | Identity arc, member-first |
| 21 | `wallet/:address` | `/wallet/:address` | `useHolderIndex` + protocol pulse | L | V | Per-wallet identity page (member #, joined block, holdings) |
| 22 | `SinceYourLastVisit` | `/` | `visitor-memory` localStorage + protocol pulse | L | V | Personal "what changed since you were here" |

### F. Momentum / Pulse / Recency

| # | Component | Route | Source | Status | Vis | Role |
|---|---|---|---|---|---|---|
| 23 | `LiveRecencyStrip` | `/` | `useProtocolPulse` | L | V | Members · last join · chapter forming |
| 24 | `LivePulseStrip` | `/` | `useProtocolPulse` | L | V | Members · raised · vault · LP · last buy · next # |
| 25 | `ProtocolFlywheel` | `/` | static + live deltas | L/P | V | Flywheel narrative |
| 26 | `DeltaBadge` (utility) | many | `useHolderIndex` windowed delta | L | V | Δ since 24h/7d |

### G. Ranks / Identity status

| # | Component | Route | Source | Status | Vis | Role |
|---|---|---|---|---|---|---|
| 27 | `RankHub` | `/ranks` | `useMembersLeaderboard`, `useRankSimulator` | L/P | V | Ranks overview |
| 28 | `RankIntelligence` | `/ranks` | leaderboard | L | V | Distribution intel |
| 29 | `RankSimulator` | `/ranks` | derived | L | V | "Where would I land?" |
| 30 | `MembersLeaderboard` | `/members` | `useMembersLeaderboard` | L | V | Member ranking (naming flagged in prior audit) |
| 31 | `HomeRankLadder` | none | static | — | H | Ladder, unmounted |
| 32 | `Sections.tsx → RankLadder` / `CompounderScore` / `Leaderboard` | none | demo | — | H | Legacy duplicates |

### H. Distribution / Treasury growth (story-relevant)

| # | Component | Route | Source | Status | Vis | Role |
|---|---|---|---|---|---|---|
| 33 | `TreasuryComposition`, `CapitalAllocation`, `ProtocolStatusGrid` | `/`, `/transparency` | live | L | V | "How big is the treasury" — growth-as-story when diffed over time (currently shown only as point-in-time) |
| 34 | `Sections.tsx → VaultGrowthChart`, `DistributionIntel`, `AccessRate` | none | demo/static | — | H | Legacy growth-story duplicates |

### I. Data substrate (no UI)

| # | Module | Purpose |
|---|---|---|
| 35 | `lib/protocol-events.ts` | unified event stream (the spine of Story Engine) |
| 36 | `lib/protocol-pulse.ts` | live aggregate state |
| 37 | `lib/holder-index.ts` | member # ↔ wallet ↔ join block |
| 38 | `lib/chain-time.ts` | block → seconds-ago |
| 39 | `lib/visitor-memory.ts` | personal snapshot of last visit |
| 40 | `lib/sale-hooks.ts`, `lib/treasury-hooks.ts`, `lib/leaderboard-hooks.ts`, `lib/quest-hooks.ts`, `lib/activity-hooks.ts` | per-domain reads |

---

## 2. Fragmentation Map

The same story concept is told by multiple components — most overlap is real.

| Concept | Components telling it | Recommendation |
|---|---|---|
| **Live event stream** | `ProtocolEventsFeed` (1), `ProtocolTimeline` (2), `LiveActivityFeed` (3), `MiniExplorer` (4), legacy `Sections.ActivityFeed` (5) | Keep 1+2 (story view) and 3+4 (explorer view). **Delete 5.** Decide whether `/activity` needs both #1 and #2 — currently both are stacked on `/` AND `/activity`, which doubles the feed twice on each page. |
| **Recency strip** | `LiveRecencyStrip` (23), `LivePulseStrip` (24) | Two strips back-to-back on `/`. **Merge into one strip** with a "more metrics" disclosure, or demote `LivePulseStrip` below the fold. |
| **Membership journey** | `HomeJourney` (19, hidden), `MemberJourney` (20, visible), `JOURNEY_STEPS` config | One config powers two components; only one is mounted. **Delete `HomeJourney`** or merge into `MemberJourney`. |
| **Milestones** | `MilestoneTracker` (15), `HomeNextMilestone` (16, hidden), `/milestone/:id` OG (17), milestone deltas in `SinceYourLastVisit` (22) | Promote a single "Next milestone" card to the heartbeat (use #16 logic inside #23 strip). Keep #15 as the full tracker, #17 as the share artifact. |
| **Chapters** | `chapters` index + `$slug` (7), `EarlyChapters` (8), Recency-strip chapter cue (9), Founders Hall (10) | Coherent already — 9 → 8 → 7 → 10 is a working zoom-in. No merge needed; just cross-link. |
| **Ranks** | `RankHub` (27), `RankIntelligence` (28), `RankSimulator` (29), `MembersLeaderboard` (30), `HomeRankLadder` (31 hidden), `Sections.RankLadder/Leaderboard/CompounderScore` (32 hidden) | `/ranks` is consolidated. **Delete legacy 31 + 32** (already flagged in `CODE_HEALTH_AUDIT.md`). |
| **History/Archive** | `DayOneArchive` (6 hidden), Founders Hall (10), chapter archives (7), `WhyComeBackTomorrow` (14 orphan) | History is fragmented and underused. `DayOneArchive` is dead; Founders Hall is the de-facto "day one". **Promote Founders Hall** and **delete `DayOneArchive`**. |
| **Forward-looking story** | `roadmap` (11), `episodes` (12, orphan), `EpisodeEngine` (13), `WhyComeBackTomorrow` (14) | Per IA decision, merge `/episodes` → `/roadmap`. Resurface `WhyComeBackTomorrow` on home or roadmap — it is exactly the "come back tomorrow" answer and currently no one sees it. |
| **Treasury growth-as-story** | `TreasuryComposition` + others (33), legacy `VaultGrowthChart` (34) | All current treasury surfaces are point-in-time. The growth chart (legacy) is dead. **A real growth-over-time chart is missing** — the largest story gap. |

---

## 3. Story-Engine Evaluation (A–F)

| Pillar | Question | Existing surfaces | Verdict |
|---|---|---|---|
| **A. HISTORY** | Where did the protocol start? | Founders Hall (10), chapter archives (7), `EarlyChapters` (8) | **Largely present.** Missing: an explicit "Day 1" / origin moment on the homepage; `DayOneArchive` was built then orphaned. |
| **B. MOMENTUM** | What happened recently? | `LiveRecencyStrip` (23), `LivePulseStrip` (24), `ProtocolEventsFeed` (1), `ProtocolTimeline` (2), `SinceYourLastVisit` (22), `DeltaBadge` (26) | **Very strong, somewhat duplicated.** Best-in-class momentum surface across the whole repo. |
| **C. PROGRESSION** | What happens next? | `MilestoneTracker` (15), `HomeNextMilestone` (16 hidden), `roadmap` (11), `episodes` (12 orphan) | **Partial.** "Next milestone" exists in two forms but only the tracker is mounted; no single "you are HERE on the timeline" surface. |
| **D. IDENTITY** | Do users feel ownership? | `wallet/:address` (21), `MemberJourney` (20), `MemberCard`, `RankSimulator` (29), `QuestProgress` (18 hidden) | **Partial.** Identity exists per-wallet but the homepage doesn't reflect the connected wallet's place in the story. `QuestProgress` is built but not surfaced. |
| **E. ANTICIPATION** | Anything to look forward to? | Milestones (15), `WhyJoinNow`, `WhyComeBackTomorrow` (14 orphan), roadmap (11) | **Weakest pillar visibly.** The component literally named `WhyComeBackTomorrow` is on an orphan route. |
| **F. MEMORY** | Major moments preserved? | Chapter archives (7), Founders Hall (10), OG milestone cards (17), event tx links | **Present but fragmented.** No canonical "moments" timeline (e.g. "Member #100 joined · LP seeded · first vault flow · first chapter closed"). The data exists in `protocol-events`; nothing renders it as a curated highlight reel. |

Score (qualitative, /10): History 7 · Momentum 9 · Progression 5 · Identity 6 · Anticipation 4 · Memory 5.

---

## 4. Retention / Identity / Anticipation analysis

**Retention (why come back tomorrow?)**
- Working today: `SinceYourLastVisit`, `ProtocolTimeline` (Today bucket), `LiveRecencyStrip`. A returning user immediately sees what's new.
- Weak: no scheduled "next moment" (e.g. "Member #100 expected in ~3 days at current pace"), no per-wallet personalization on `/`, no email/push hook (out of scope).
- The single biggest retention asset that exists but is invisible: `WhyComeBackTomorrow`.

**Identity**
- A connected wallet has a rich page (`/wallet/:address`) but the homepage doesn't acknowledge them. `HeaderWalletChip` exists; a "Your member #N · your chapter · your rank" cue on `/` is missing.
- `QuestProgress` is built and hidden — it would be the single strongest per-user retention loop if surfaced.

**Anticipation**
- Milestone tracker shows distance to next number, but framing is neutral. No "what unlocks when we reach it" copy linked at the moment.
- `roadmap` is static and undated by design (correct per VISION constraints), so anticipation must come from milestone proximity + chapter-forming cues, not from countdowns.

---

## 5. What already exists / is missing / merge / promote / remove

**Already exists (Story Engine substrate is largely built):**
- Unified event spine (`protocol-events`)
- Live pulse (`protocol-pulse`)
- Personal memory (`visitor-memory`)
- Per-wallet identity page
- Chapter system + Founders Hall
- Milestone numeric tracker + shareable OG renderer
- Two journey configs
- A literal "Why come back tomorrow" component

**Missing (true gaps, not duplicates):**
1. Growth-over-time chart (treasury, members, raised). Currently every metric is point-in-time + a 24h/7d delta. No history curve.
2. Curated "Protocol Moments" highlight reel (the few events worth remembering, not the chronological firehose).
3. Personalized homepage cue for the connected wallet ("You are Member #42 — your chapter is forming").
4. A single "you are here" progression bar tying members → milestones → chapters → roadmap into one visual.

**Merge:**
- `LiveRecencyStrip` + `LivePulseStrip` → one strip.
- `HomeJourney` → into `MemberJourney`.
- `episodes` route → `/roadmap` (already decided in IA pass).
- `ProtocolEventsFeed` (compact) + `ProtocolTimeline` on `/` → one of the two; both is redundant.

**Promote (hidden but valuable):**
- `WhyComeBackTomorrow` → onto `/` (anticipation pillar) or `/roadmap`.
- `HomeNextMilestone` → into the heartbeat strip.
- `QuestProgress` → onto `/wallet/:address` (and a teaser on `/`).
- `DayOneArchive` → either kill it or fold into Founders Hall as an "Origin" header.

**Remove (legacy, demo, duplicate — confirmed unmounted):**
- `Sections.tsx` exports: `ActivityFeed`, `Leaderboard`, `CompounderScore`, `RankLadder`, `DistributionIntel`, `VaultGrowthChart`, `GenesisNFTProgress`, `DayOneArchive`, `SyndicateIndex`, `MeasuredFomo` (if not used), `GenesisNFT`, `GenesisSupplyControls`. These are already flagged in `CODE_HEALTH_AUDIT.md`.
- `HomeRankLadder` (replaced by `RankHub`).
- Legacy demo `ActivityFeed` from `Sections.tsx`.

---

## 6. Final Conclusion

**How much of the Story Engine already exists?** ≈ **70%.** The substrate (unified events, pulse, holder index, visitor memory, chapters, founders, milestones, per-wallet identity, OG share artifacts) is built and live. What's missing is **curation, personalization, and consolidation**, not new infrastructure.

**Smallest change that creates a TV-series-like experience for long-term investors** — purely a curation pass, no new modules:

1. **Promote anticipation.** Mount `WhyComeBackTomorrow` on `/` (or fold into `/roadmap`). One paragraph, immediately answers the audit question.
2. **Merge the two heartbeats.** Collapse `LiveRecencyStrip` + `LivePulseStrip` into a single strip that includes the `HomeNextMilestone` cue ("Next: Member #100 · ~12 to go"). One heartbeat, three beats: recency · next · personal.
3. **Personalize the heartbeat when a wallet is connected.** Read `HeaderWalletChip` state → show "You are Member #N · your chapter is X · your rank is Y" in the same strip. Reuses existing hooks; zero new components.
4. **Curate a "Protocol Moments" rail.** Filter the existing `useProtocolEvents` stream to a handful of marked moment types (first member, every 100th member, first LP, first vault flow, every chapter close) and render them as a small horizontal rail above the chronological feed. Same data source, new selector.
5. **Resolve duplicates and orphans** per the lists in §5 so the story stops repeating itself.

These five moves turn the existing pieces into a single arc — **History (Founders Hall) → Memory (Moments rail) → Momentum (heartbeat + timeline) → Progression (next milestone) → Identity (your member # in the strip) → Anticipation (Why come back tomorrow)** — without adding a new module, a new route, or any banned feature.

The Story Engine isn't a build. It's a curation.
