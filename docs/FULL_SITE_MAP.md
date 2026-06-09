# THE SYNDICATE — FULL SITE MAP

Status: audit only. Do not edit pages from this doc — flag, do not fix.
Generated: wave-3A.qa-stamp baseline (post live/repo discrepancy pass).

Legend
- Status: **LIVE** (real on-chain reads), **PARTIAL** (mix of live + config),
  **PENDING** (module not deployed), **DOCS** (content surface),
  **UTILITY** (infra / not user-facing).
- Mobile: ✅ verified responsive, ⚠️ partial (long tables / overflow),
  ❌ broken (none currently known).
- OG: ✅ full meta + image, ⚠️ text-only (no og:image), ❌ inherits root only.

---

## Public routes

### `/`  — Home
- File: `src/routes/index.tsx`
- Title: "The Syndicate — Transparent On-Chain Asset Accumulation Protocol"
- Purpose: explain what The Syndicate is, prove it's live, push to Join.
- Primary user question: "What is this and why should I join?"
- Primary CTA: **Buy SYN with USDC →** (`/join`)
- Secondary CTAs: See registry, Open transparency, Share snapshots
- Status: **PARTIAL** (live pulse + recency live; member-first sections static copy)
- Data sources: `useSaleStats`, `useHolderIndex`, `useProtocolPulse`, `useLiveRecency`, `useLivePurchaseEvents`, visitor-memory (Since Your Last Visit)
- Key components: `Hero`, `LiveRecencyStrip`, `TrustBar`, `LivePulseStrip`, `SinceYourLastVisit`, `ProtocolEventsFeed`, `ProtocolTimeline`, `WhyJoinSimple`, `HowToJoinSteps`, `WhyTheSyndicateExists`, `WhyBecomeMember`, `WhyEarlyMatters`, `WhyJoinNow`, `WhatChangesAfterJoining`, `MemberJourney`, `HowItWorks30s`, `WhatSynDoes`, `WhyDifferent`, `ProtocolOverview`, `ProtocolRevenueEngine`, `RoutingFlow`, `CapitalAllocation`, `ProtocolStatusGrid`, `ProtocolFlywheel`, `OpportunitySection`, `TreasuryComposition`, `UseOfFunds`, `LpStatusCard`, `HomeTransparencySnapshot`, `MilestoneTracker`, `EarlyChapters`, `ProtocolSnapshots`, `MemberCard`, `HomeShareCTA`, `RiskDisclaimer`
- Internal links: every nav target
- External: Snowtrace, Trader Joe, Twitter/X share intents
- OG: ✅ (`/og/og-protocol-default.png`)
- Mobile: ✅
- Notes: very long page (~30 sections). Section count is the main risk — see UX audit.

### `/join` — Buy SYN
- File: `src/routes/join.tsx`
- Title: "Buy SYN with USDC — Live Membership Sale | The Syndicate"
- Purpose: live USDC → SYN purchase + member card preview.
- Primary question: "How do I buy?"
- Primary CTA: in-page Approve / Buy (wallet)
- Secondary CTA: change amount, view rank ladder
- Status: **LIVE** (on-chain write to SyndicateMembershipSale)
- Data sources: `useSaleStats`, `useAccount`, `useReadContract` USDC allowance, `useWriteContract`, `useHolderIndex`
- Key components: `MemberCard`, `LivePurchase`, `AccessRate`, `MembershipCalculator`, `RankLadder`, `PaymentStrategy`
- OG: ⚠️ text-only
- Mobile: ✅
- Notes: highest-conversion page. Wallet chip / context notice integrated in wave-3A.

### `/members` — Member wall
- File: `src/routes/members.tsx`
- Purpose: show every wallet that has bought SYN.
- Primary question: "Who has joined?"
- Primary CTA: pick a wallet → wallet page
- Status: **LIVE** (derived from `useHolderIndex`)
- OG: ⚠️
- Mobile: ⚠️ long lists; pagination present
- Notes: identity surface — must remain free of wealth ranking framing.

### `/founders` — Founders hall
- File: `src/routes/founders.tsx`
- Purpose: first-N members highlighted.
- Status: **LIVE** (slice of holder index)
- OG: ⚠️
- Mobile: ✅
- Notes: spec doc at `FOUNDERS_HALL_SPEC.md`.

### `/chapters` — Chapter index
- File: `src/routes/chapters.tsx`
- Purpose: formation eras (Chapter 1, 2, …) grouped by joining window.
- Status: **PARTIAL** (config-defined windows + live counts)
- OG: ⚠️
- Notes: see `CHAPTER_ARCHIVES_SPEC.md`.

### `/chapters/$slug` — Single chapter
- File: `src/routes/chapters.$slug.tsx`
- Status: **PARTIAL**
- Notes: deep-link target for share intents.

### `/ranks` — Rank Hub
- File: `src/routes/ranks.tsx`
- Title: "Ranks — Where do I fit?"
- Purpose: distribution across 12 ranks, 4 groups.
- Primary CTA: Join with the right entry size
- Status: **PARTIAL** (distribution live; simulator config-driven)
- Components: `RankHub` (composes `RankIntelligence`, `RankSimulator`)
- OG: ⚠️
- Mobile: ✅
- Notes: confirmed shipped per `check-live` (must contain "Where do I fit", no "Compounder Score" leaderboard).

### `/activity` — Live activity
- File: `src/routes/activity.tsx`
- Purpose: full chronological event feed.
- Status: **LIVE** (`useLivePurchaseEvents`, `useProtocolPulse`)
- OG: ⚠️
- Mobile: ⚠️ table density

### `/transparency` — Verify everything
- File: `src/routes/transparency.tsx`
- Purpose: live contracts + wallets + routing proofs.
- Status: **LIVE**
- Components: `TransparencyCenter`, `VerifyEverything`, `ProtocolSnapshots`, `TreasuryComposition`, `UseOfFunds`, `TransparencyReport`, `SaleStatsPanel`, `ContractAddresses`, `RoutingFlow`, `LiveActivityFeed`, `VerifyFlow`
- OG: ✅ (`/og/og-transparency.png`)
- Mobile: ✅

### `/registry` — Public addresses
- File: `src/routes/registry.tsx`
- Purpose: canonical list of contracts + wallets.
- Status: **LIVE** (config-driven, links to Snowtrace)
- OG: ⚠️
- Mobile: ⚠️ long address rows

### `/token` — SYN token
- File: `src/routes/token.tsx`
- Status: **LIVE** (live supply, address)
- OG: ⚠️

### `/tokenomics` — Allocation
- File: `src/routes/tokenomics.tsx`
- Status: **DOCS** (static allocations + donut)
- OG: ⚠️
- Notes: flagged by `check-live` script as stale until republish.

### `/liquidity` — SYN/USDC pool
- File: `src/routes/liquidity.tsx`
- Status: **LIVE** (LP reserves from pair contract)
- OG: ⚠️

### `/vault` — Vault wallet
- File: `src/routes/vault.tsx`
- Status: **PARTIAL** (wallet live; programmatic Vault Contract PENDING)
- Notes: must keep `VaultDisambiguation` (wallet vs contract).

### `/docs` — Knowledge hub
- File: `src/routes/docs.tsx`
- Status: **DOCS**
- Notes: flagged stale by `check-live` until republish.

### `/faq` — Honest answers
- File: `src/routes/faq.tsx`
- Status: **DOCS** (`FaqRebuilt`)
- OG: ⚠️

### `/whitepaper` — Full thesis
- File: `src/routes/whitepaper.tsx`
- Status: **DOCS**

### `/roadmap` — Live · Next · Pending · Future
- File: `src/routes/roadmap.tsx`
- Status: **DOCS** (config-driven phases)

### `/wallet/$address` — Wallet page
- File: `src/routes/wallet.$address.tsx`
- Purpose: per-wallet member identity + holdings.
- Status: **LIVE** (balance + purchase events for address)
- Notes: post wave-3A, includes `WalletContextNotice` for mismatch.
- OG: ✅ dynamic (`/api/public/og/wallet/$address`)

### `/milestone/$id` — Milestone page
- File: `src/routes/milestone.$id.tsx`
- Status: **PARTIAL**
- OG: ✅ dynamic (`/api/public/og/milestone/$id`)

---

## Soft-listed / hidden routes

| Route | File | Status | Notes |
|---|---|---|---|
| `/ai` | `ai.tsx` | **PENDING** | Future module placeholder — not in nav. |
| `/nfts` | `nfts.tsx` | **PENDING** | Future module placeholder — not in nav. |
| `/episodes` | `episodes.tsx` | **PARTIAL** | Story/episode surface; not in primary nav. |

These three are reachable by URL but should be reviewed for removal or
clear "coming soon" framing (see UX audit).

---

## Utility / API routes

| Route | File | Status |
|---|---|---|
| `/sitemap.xml` | `sitemap[.]xml.ts` | **UTILITY** |
| `/api/og/health` | `api/og/health.ts` | **UTILITY** |
| `/api/public/og/wallet/$address` | `api/public/og/wallet.$address.ts` | **UTILITY** (dynamic OG render) |
| `/api/public/og/milestone/$id` | `api/public/og/milestone.$id.ts` | **UTILITY** |

No debug routes currently shipped (`WalletDebugPanel` is gated, not its own route).
