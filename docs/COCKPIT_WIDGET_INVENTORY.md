# Cockpit Widget Inventory Report — Phase C (`/my-syndicate`)

Whole-project sweep (rendered + dead + labs + backups + docs) to find the best building
blocks for a Grade AAA Member Operating System. **No code yet.** Stale data and fabricated
numbers are flagged and must NOT be copied. Dead components are mined for *structure*, not
resurrected blindly.

Doctrine guardrails applied throughout:
- The First Signal (ID 1) = **uncapped**, LIVE, 0.50 USDC. Patron Seal (ID 3) = **10,000**, LIVE, 5.00 USDC. Seat Record (ID 2) = **future ERC-721, PENDING**. Never conflate them. Never "Genesis NFT 1,000 supply".
- Status vocabulary = **LIVE / PARTIAL / PENDING** only. Every number is a live read or marked PENDING.
- Banlist: investment, ROI, yield, dividend, share, commission, passive income.
- No countdowns, no "last N slots" urgency. OS reflex: Identity → Holdings → Activity.

Classification key: **1 Reuse as-is · 2 Rewrite w/ live data · 3 Merge into section · 4 Preserve for future · 5 Delete/ignore**

---

## A. The ratified blueprint already exists (docs)

These docs already contain product-approved structure. Phase C should align to them, not contradict them.

| Idea | Source doc | Disposition | Cockpit concern |
|---|---|---|---|
| Member № identity hero (serif, largest type) | MY_SYNDICATE_BLANK_PAGE_REDESIGN, SYNDICATE_OPERATING_SYSTEM | Ship — real registry count, no fabricated offsets | identity |
| Identity Ribbon (persistent top band: №, chapter, founder flag, block anchor) | SYNDICATE_OPERATING_SYSTEM | Ship — ranked #1 build | identity / live |
| Chapter Rail (sealed / forming / ghosted; my tick) | MY_SYNDICATE_BLANK_PAGE_REDESIGN, CHAPTER_ARCHIVES_SPEC | Ship — no countdowns; Far row always visible | chapter |
| Memory Timeline (unified vertical spine; pinned origin) | MY_SYNDICATE_BLANK_PAGE_REDESIGN, MY_SYNDICATE_IMPLEMENTATION_BLUEPRINT | Merge "What changed" + purchases + activity; every row → tx | history / what-changed |
| What's Sealing Next (Soon/Next/Far thresholds) | MY_SYNDICATE_BLANK_PAGE_REDESIGN | Ship — real on-chain thresholds, no clocks | future / do-next |
| Since Your Last Visit (heartbeat delta) | STORY_ENGINE_AUDIT, SYNDICATE_OPERATING_SYSTEM | Merge into Activity; reconcilable vs blocks | what-changed |
| Why Come Back Tomorrow | STORY_ENGINE_AUDIT, PRODUCT_MEMORY_AND_FUTURE_LOOPS | Backlog/Rewrite — live deltas only, no false scarcity | retention |
| Seat Record (identity ERC-721) | ARCHIVE_ENGINE_SPEC, IMPLEMENTATION_BLUEPRINT | Pending contract — label PENDING, address null | identity |
| Referral / Growth | IMPLEMENTATION_BLUEPRINT, LEGAL_DISCLOSURE_REFERRAL | Demote — recognition only, NO payouts/rebates | referral |
| Reputation / participation rank | SYNDICATE_OPERATING_SYSTEM, REPUTATION_FORMULA_DOCTRINE | Simulated/Pending — sorted by participation never holdings | reputation |
| Quest/Progression checklist | STORY_ENGINE_AUDIT | Backlog/promote — on-chain steps only | progression |

---

## B. Widget inventory (per-component)

### 1 — REUSE AS-IS (live, self-contained, fits cockpit)

| File · Component | Status | Shows / Data source | Class | Fits C? | Reuse plan | Risk of using | Risk of ignoring |
|---|---|---|---|---|---|---|---|
| `syndicate/SinceYourLastVisit.tsx` · `SinceYourLastVisit` | rendered (/ , /activity) | members/USDC/vault delta since localStorage snapshot · `useVisitorMemory`+`useProtocolPulse` | LIVE/cached | Yes | Drop into "Since you were away" | Milestone copy has hardcoded labels — audit strings | Lose best what-changed surface |
| `syndicate/ActivityHeartbeat.tsx` · `ActivityHeartbeat`/`WhyItMattersToMe` | rendered (/activity) | latest verified event + per-wallet "why it matters" · `useProtocolEvents`+`useVisitorMemory` | LIVE/cached | Yes | Pair with SinceYourLastVisit | none material | Miss personalized live hook |
| `syndicate/MilestoneApproachingTile.tsx` · same | rendered (/) | progress bar to nearest on-chain milestone · `useProtocolPulse` | LIVE | Yes | Use in "Sealing next" | none | rebuild duplicate |
| `syndicate/LpStatus.tsx` · `LpStatus` | rendered (/, transparency, registry, liquidity) | SYN/USDC reserves, TVL, price · `useLpStats` | LIVE | Yes (compact) | Compact variant in Protocol-live | verbose default — needs compact mode | — |
| `syndicate/TreasuryComposition.tsx` · same | rendered (/transparency) | vault holdings table + proof links · `useTreasuryAssets` | LIVE | Yes (compact) | Summarize total + drill link | full table too tall for cockpit | — |
| `syndicate/ProtocolStorySoFar.tsx` · same | rendered (/, /activity, /my-syndicate) | members/artifacts/treasury snapshot · `useProtocolTruth`+`useProtocolEvents` | LIVE | Yes | Keep as protocol-live anchor | none | — |
| `syndicate/LivePulseStrip.tsx` · same | rendered (/) | 24h/7d deltas members/USDC/vault/TVL · `useProtocolPulse` | LIVE | Yes | Protocol-live strip | global not wallet-scoped (fine) | — |
| `syndicate/TxProofDrawer.tsx` · `TxProofPill`/`TxProofDrawer` | rendered (app-wide) | decoded tx (swap/mint/route) · `usePublicClient` | LIVE | Yes | Wire to every verify button | none | weaker proof UX |
| `syndicate/cockpit/WalletAvatar.tsx` · `WalletAvatar` | rendered | deterministic SVG avatar · props | LIVE | Yes | Identity hero | none | — |
| `syndicate/SeatRecordPanel.tsx` · same | rendered (/archive, /wallet) | Seat Record ERC-721 PENDING state | PENDING | Yes | Reuse in identity/collect | none (honest) | invent new pending UI |
| `syndicate/RankHub.tsx` · `YourRank` | rendered (/ranks) | wallet rank + progress to next · `useHolderIndex`+`RANKS_V2` | LIVE | Yes | Extract `YourRank` into progression | rest of RankHub too page-specific | — |
| `routes/wallet.$address.tsx` · `NeighboursStrip`, `Stat` | rendered (public profile) | neighbour members + stat tiles · `useHolderIndex` | LIVE/cached | Yes | Reuse Stat grid + neighbours context | coupled to route — extract | — |
| `routes/members.tsx` · `MemberTile` | rendered (registry) | canonical small identity block · `useHolderIndex` | LIVE/cached | Yes | Use for neighbours/co-witness | — | reinvent tile |

### 2 — REWRITE WITH LIVE DATA (good structure, fake/stale data — do not copy numbers)

| File · Component | Status | Structure worth keeping | Current data | Rewrite plan | Risk of using | Risk of ignoring |
|---|---|---|---|---|---|---|
| `Sections.tsx` · `GenesisNFTProgress` | dead | mint-progress card: big counter + % bar + Supply/Minted/Remaining | FAKE "Minted 0 / Total 1,000" | Rebuild as "Collect next" for **Patron Seal (10,000)** & artifacts via `useArchiveArtifactReads` (live remaining). First Signal = uncapped (no bar) | reusing "1,000" = doctrine breach | best capped-mint layout lost |
| `Sections.tsx` · `WhyComeBackTomorrow` | dead | 4-up retention grid (deltas + reasons) | static/fabricated | Fold reasons into "Since you were away" using live deltas only | false scarcity if copied | lose retention framing |
| `Sections.tsx` · `VaultGrowthChart` | dead | SVG sparkline / area trend from baseline | FAKE day array | Only if indexed vault time-series exists; else → Preserve | implies fabricated history | — |
| `Sections.tsx` · `SyndicateIndex` | dead | composite score gauge (hero number + input breakdown) | FAKE component scores | Only if every input is a live read; else → Preserve as PENDING | composite invites fabrication | — |
| `syndicate/MyArchivePreview.tsx` · same | rendered | live Archive1155 balances + mint status | hardcoded "0.50 USDC" | Read price live; keep balances | stale price drift | minor |
| `syndicate/MyReferralCard.tsx` · `MyReferralCard` | rendered (GrowthSection) | referral link/estimator layout | FAKE (SIMULATED) | Demote to **PENDING shell**, recognition-only, no numbers | truth violation if shipped as-is | — |
| `syndicate/MyReferralCard.tsx` · `MyReputationConceptCard` | rendered | reputation concept tiles | FAKE (CONCEPT) | PENDING shell per REPUTATION_FORMULA_DOCTRINE | truth violation | — |
| `labs/QuestProgress.tsx` · same | labs | on-chain step checklist layout | FAKE "Quest 01 / 100 SYN" | Rewrite as Progression: Joined → Minted ID1 → Minted ID3 (live reads) | "quest" wording under audit | lose do-next checklist |

### 3 — MERGE INTO COCKPIT SECTION

| File · Component | Status | What to merge | Data | Into section |
|---|---|---|---|---|
| `labs/MemberCockpitCandidate.tsx` · `MemberCockpitCandidate` (+`MySeatPrimary`,`MyChapterContext`,`ProtocolWatchCompact`,`MyMemoryRow`,`MyFutureRow`,`Tile`) | labs-prototype | **Adopt as the structural SPINE**: Seat → Chapter → Memory → Future. "State over explanation." | `useHolderIndex`/`useProtocolTruth`/`useProtocolEvents` (LIVE/cached) | whole page skeleton |
| `syndicate/SinceLastVisitStory.tsx` · same | rendered (via MemberWalletDashboard) | narrative delta line | `useVisitorMemory` LIVE | Since-you-were-away |
| `syndicate/ActivityMilestones.tsx` · same | rendered (/activity) | completed/upcoming milestone columns | LIVE | What's sealing next |
| `syndicate/MythologyWall.tsx` · same | rendered (/archive,/nft) | 9-slot artifact status grid | LIVE/cached | Holdings/artifacts (compact strip) |
| `labs/RankIntelligence.tsx` · same | labs | rank distribution + "closest to next rank" social proof | `useMembersLeaderboard` LIVE/cached | Progression |
| `Sections.tsx` · `DayOneArchive` | dead | milestone plaque (sealed origin, 4-fact grid) | static fact sheet | Memory timeline (pinned origin / Chronicle Entry 1) |
| `labs/ShareableCards.tsx` · `MemberCard`,`ProtocolSnapshots` | labs | export/share identity cards (720x420) | `useBuyerPurchaseTotals`,`useSaleStats`,`useLpStats` LIVE | Do-next (Share/Export action) |
| `syndicate/VerifyEverything.tsx` · same | rendered (/transparency) | claims→on-chain→explorer table | LIVE | Verify & context |

### 4 — PRESERVE FOR FUTURE (do not build in Phase C)

| Item | Why deferred |
|---|---|
| Seat Record ERC-721 (`SeatRecordPanel` already shows PENDING) | contract not deployed |
| Referral payout system (`lib/preview/referral.ts`, `routes/referral.tsx`, LEGAL_DISCLOSURE_REFERRAL) | CommissionRouter not shipped; pending shell only |
| Reputation formula (REPUTATION_FORMULA_DOCTRINE) | participation index not computed live |
| `SyndicateIndex` composite gauge / `VaultGrowthChart` sparkline | need live multi-input / time-series, else fabrication risk |
| `labs/ProtocolStatusGrid.tsx`, `syndicate/Flywheel.tsx` | protocol-context eye-candy; optional later |
| `labs/RankSimulator.tsx` | what-if educational tool; later |
| `Sections.tsx` · `DistributionIntel` | holder analytics — promote when indexer exposes top-N share |

### 5 — DELETE / IGNORE

| Item | Reason |
|---|---|
| `Sections.tsx` · `MeasuredFomo` | pressure/false-scarcity layout conflicts with "no countdowns, no last-N-slots" doctrine |
| `syndicate/MemberWalletDashboard.tsx` (v1 cockpit shell) | superseded by new cockpit; **salvage** `SinceLastVisitStory`/`NextAction` logic, then retire the shell (don't render two cockpits) |
| Any fabricated constants (`PREVIEW_REFERRAL_DATA`, fake mint totals, fake score arrays) | never copy — live read or PENDING |

---

## C. Re-proposed `/my-syndicate` section structure

Seat-first story spine (from `MemberCockpitCandidate` + ratified blueprint), assembled from live blocks above. Each section maps to the OS questions.

0. **Identity Ribbon** (sticky band) — №, chapter, founder flag, block anchor · LIVE/cached → *who I am, at a glance*
1. **My Seat** (identity hero) — serif Member №, rank, chapter, joined block, SYN received, USDC routed, avatar, Seat Record PENDING · LIVE/cached → *who I am + core holdings*
2. **Since you were away** — live deltas (members/vault/price/your events) since last visit; first-visit fallback · LIVE/cached → *what changed while away* (sanctioned WhyComeBack rebuild)
3. **Protocol live** — member count +24h/7d, SYN price/TVL, vault total, freshness badge · LIVE → *what the protocol is doing*
4. **My holdings & artifacts** — SYN/USDC tiles + owned Archive1155 (First Signal/Patron Seal) verify links + compact artifact strip · LIVE → *what I own*
5. **My chapter & progression** — chapter rail (sealed/forming/ghosted, my tick), rank progress to next, closest-to-next · LIVE/cached/derived → *what chapter I'm in*
6. **What's sealing next** — Soon/Next/Far on-chain thresholds (no clocks) + milestone-approaching · LIVE → *what's approaching*
7. **Collect next** — mintable now: First Signal (uncapped, live price), Patron Seal (10,000, live remaining) + eligibility; Seat Record PENDING · LIVE + PENDING → *what I can collect*
8. **Do next** — action rail: Join/Buy More SYN, Trade, Add LP, Share/Export identity · LIVE → *what I can do*
9. **My memory timeline** — unified vertical spine: my purchases + witnessed moments + pinned origin (Chronicle Entry 1), each → tx · LIVE/cached → *proof + history*
10. **Verify & context** — claims→on-chain table + tx proof drawer + contract rails + transparency/health/ledger links · LIVE → *what I can verify*
11. **Horizon (PENDING)** — governance, marketplace, AI, referral (recognition-only pending shell), reputation (pending) · PENDING → *future loops*

Mobile-first: single column in the order above; Identity Ribbon sticky top; action rail sticky bottom (reuse `MobileJoinBar`); telemetry 2-col→4-col; PENDING horizon collapsed; skeletons on every cached section for instant paint.

Disconnected state: page never gates — show "Member № N reserved" fallback, PENDING pills, Connect CTAs.
