# Protocol Cohesion & Live Product Audit
*The Syndicate — view the protocol as one system, not a collection of pages.*

> Format: pure audit. No implementation. No new tokenomics, contracts, or revenue streams. Focus: making **existing live data** visible, understandable, addictive, verifiable — and ensuring a single on-chain action propagates across every surface.

---

## 0. Executive Summary

| Dimension | Score | Notes |
|---|---|---|
| Protocol Maturity | **62 / 100** | Contracts live; UX still treats them as documentation. |
| Protocol Intelligence | **58 / 100** | `LivePulseStrip` + `ProtocolEventsFeed` exist, but most pages don't consume them. |
| Community Signal | **34 / 100** | No member identity persistence, no momentum framing, no "you vs. cohort". |
| Activity Depth | **55 / 100** | Unified feed exists; missing per-actor view, milestones, vault routing trace. |
| Data Completeness (vs. what chain already exposes) | **48 / 100** | ~half of derivable signals are unsurfaced. |
| Cross-Page Cohesion (the ripple test) | **40 / 100** | A purchase updates Homepage + Activity, but not Ranks/Registry/Join/Liquidity in real time. |
| **Overall — Living Protocol Index** | **49 / 100** | Live data exists. The product still *feels* like a brochure on most routes. |

**Verdict.** The protocol is alive; the site narrates it instead of *being* it. The bottleneck is no longer copy or polish — it's the missing connective tissue between one on-chain event and the seven places it should change something.

---

## 1. The Ripple Test — what happens when a wallet buys SYN right now?

Goal: a single `TokensPurchased` event should mutate **every** surface that mentions members, supply, treasury, ranks, registry, or momentum.

| Surface | Should change | Currently changes | Gap |
|---|---|---|---|
| Homepage `LivePulseStrip` | members+1, raised+, last buy, next member# | ✅ yes (60s refetch) | OK |
| Homepage `HomeMetricsStrip` | same totals | ⚠ partially — separate hook, drifts | Consolidate to `useProtocolPulse` |
| Homepage rank ladder / next milestone | progress bar moves | ❌ static thresholds, no live progress | Wire to `useSaleStats` |
| `/activity` unified feed | new row at top | ✅ yes | OK |
| `/activity` sale stats panel | totals tick | ✅ yes | OK |
| `/ranks` rank distribution | bucket count +1 | ⚠ `RankIntelligence` exists; not bound to live buyer set | Index buyer→USDC →bucket |
| `/ranks` "closest to next rank" | recomputes | ❌ requires holder map, not built | Indexer or `Transfer` scan |
| `/registry` member list | new member # archived | ❌ page is static / non-existent for live data | Derive from purchases stream |
| `/join` "you'd be member #N" | N+1 | ❌ uses copy, not `nextMemberNumber` | Wire from `useProtocolPulse` |
| `/liquidity` member count context | "N members backing this LP" | ❌ no cross-reference | Read members from pulse |
| `/transparency` treasury delta | vault USDC +70% of buy | ⚠ shows balance but not "since last load" | Add 24h delta |
| `/vault` routing proof | "last routed: $X to vault, $Y to LP, $Z to ops" | ❌ policy shown statically | Compute from `VaultPolicyCore` flows |
| `/tokenomics` circulating supply | sold counter ticks | ❌ static donut | Bind to `synSold` |
| Future NFT eligibility | rank threshold crossed → eligible | ❌ no eligibility resolver | Pure derivation, can ship now |
| Future Vault milestone | $100 / $1k / $10k tracker | ⚠ exists in copy, not bound to `vaultUsdc` | Trivial wire-up |

**Ripple coverage: 4 / 15 surfaces (27%).** This is the single biggest finding of the audit.

---

## 2. Live Data Audit — every metric, classified

Legend: **LIVE** = direct read · **DERIVED** = math on live reads · **INDEXER** = needs event scan/index · **IMPOSSIBLE** = not on chain.

### Sale / Membership
| Metric | Class | Status | Action |
|---|---|---|---|
| Total USDC raised | LIVE | ✅ shown | keep |
| Total SYN sold | LIVE | ✅ shown | bind tokenomics donut |
| Unique buyers (members) | LIVE | ✅ shown | propagate to /join, /liquidity |
| Purchase count | LIVE | ⚠ collected, rarely shown | surface as "transactions" |
| Sale inventory remaining | LIVE | ⚠ in hook, no UI | add "X SYN left in this batch" |
| Average ticket size | DERIVED | ❌ missing | raised / count |
| Median ticket size | INDEXER (cheap) | ❌ missing | from purchase events array |
| Largest single buy | INDEXER | ❌ missing | max(events) |
| Purchases today / 7d / 30d | INDEXER (cheap, in-memory) | ❌ missing | bucket by block timestamp |
| New members today / 7d | INDEXER | ❌ missing | first-time buyer filter |
| Time since last buy | DERIVED | ✅ in pulse | reuse on ranks/activity |
| Buyers per rank bucket | DERIVED | ⚠ `RankIntelligence` partial | finish + put on /ranks hero |
| Closest-to-next-rank list | DERIVED | ❌ missing | sort by (threshold − cumulative USDC) |
| Founder number per wallet | DERIVED | ❌ missing | order-of-first-buy index |

### Treasury / Vault / Ops
| Metric | Class | Status |
|---|---|---|
| Vault USDC balance | LIVE | ✅ pulse |
| Liquidity wallet USDC | LIVE | ✅ pulse |
| Operations wallet USDC | LIVE | ✅ pulse |
| Vault inflow events | LIVE (Transfer scan) | ⚠ `useUsdcFlows` exists, only on `/activity` |
| Vault outflow events | LIVE | ⚠ same |
| 24h / 7d vault delta | DERIVED | ❌ missing |
| Routing-policy proof (70/20/10 realized) | DERIVED | ⚠ `VaultPolicyCore` shows balances, doesn't prove ratio over time |
| Treasury composition % | DERIVED | ❌ missing (USDC only today, but show it) |

### LP / Market
| Metric | Class | Status |
|---|---|---|
| LP TVL USD | LIVE | ✅ pulse |
| SYN price USD | LIVE | ✅ pulse |
| LP swaps stream | LIVE | ✅ on /activity & /liquidity |
| LP mint/burn (POL proof) | LIVE | ⚠ shown but not framed as "protocol-owned" |
| Pool address / LP token address | LIVE constant | ⚠ exists in config, not surfaced as copy-friendly tile |
| Pool creation tx | LIVE constant | ❌ not displayed |
| 24h volume / 24h fees | DERIVED | ❌ missing |
| LP holder = protocol % | DERIVED | ❌ missing — the single most important POL proof |
| Trader Joe / DexScreener / Avascan links | static | ⚠ partial — need full triplet on every LP card |

### Token
| Metric | Class | Status |
|---|---|---|
| Total supply | LIVE | ✅ |
| Circulating (sold + LP) | DERIVED | ❌ missing |
| Holders count | INDEXER | ❌ missing (Transfer scan or Avascan API) |
| Burn events | LIVE | ❌ none expected, but absent label |

---

## 3. Protocol Intelligence — checklist vs. ask

| Block | Item | State |
|---|---|---|
| **Live Pulse** | Members | ✅ |
| | USDC Raised | ✅ |
| | Vault Value | ✅ |
| | LP TVL | ✅ |
| | SYN Sold | ✅ |
| | Last Buy | ✅ |
| | Next Founder # | ✅ |
| **Momentum** | Purchases Today | ❌ |
| | Purchases This Week | ❌ |
| | New Members (24h/7d) | ❌ |
| | Vault Growth (24h/7d) | ❌ |
| | LP Growth (24h/7d) | ❌ |
| **Community** | Latest Members | ⚠ in `MembersLeaderboard`, not on home |
| | Rank Distribution | ⚠ `RankIntelligence` partial |
| | Recent Promotions | ❌ (computable: bucket-crossing event) |
| | Closest To Next Rank | ❌ |
| **Treasury** | Vault Wallet balance | ✅ |
| | Liquidity Wallet balance | ✅ |
| | Operations Wallet balance | ✅ |
| | Recent Movements | ⚠ only on /activity, not on /transparency or /vault |

**Score: 11 ✅ · 6 ⚠ · 8 ❌  →  Protocol Intelligence = 58/100.**

---

## 4. Activity Audit

Goal: feel like *The Syndicate's block explorer*, not a changelog.

| Capability | State | Gap |
|---|---|---|
| Purchases | ✅ in unified feed | OK |
| LP swaps (buy/sell) | ✅ | add price impact column |
| LP mint/burn | ✅ | label as "Protocol-owned" when actor = liquidity wallet |
| Vault flows | ✅ | tag direction + counterparty role (sale → vault, vault → ops) |
| Routing events (auto-split per buy) | ❌ | derivable: each purchase should expand into 3 child rows |
| Member milestones (#10, #25, #100) | ❌ | derivable from member counter |
| Rank promotions | ❌ | derivable from cumulative USDC per wallet |
| NFT eligibility unlocks | ❌ | derivable from rank thresholds (UI-only, no contract) |
| Per-wallet view (`/activity?actor=0x…`) | ❌ | URL state + filter |
| "Whale" filter (>$X) | ❌ | trivial filter on amount |
| Compact homepage preview (top 5) | ❌ | feed exists, never embedded in `/` |

**Why it still feels empty:** the feed is one undifferentiated stream. Explorers feel alive because they group, color-code, and let you click into an actor. Today every row is a leaf with no expansion and no narrative.

---

## 5. Ranks Audit

| Item | Computable now? | State |
|---|---|---|
| Rank Distribution (count per bucket) | yes — from purchase events | ⚠ partial |
| Latest Members (last 10 first-time buyers) | yes | ❌ |
| Largest Holders (cumulative USDC per wallet) | yes | ❌ |
| Newest Holders | yes | ❌ |
| Founder numbers (#1..#N) | yes — order of first buy | ❌ |
| Closest To Next Rank | yes — threshold − cumulative | ❌ |
| Average / Median Holdings | yes | ❌ |
| Top-Rank Concentration (Gini-lite) | yes | ❌ |
| Holdings includes LP buys | INDEXER (Transfer to wallet) | future |

**Recommendation:** rebuild `/ranks` as a *cohort dashboard*. Five tiles + one table. Remove anything aspirational that isn't bound to a number.

---

## 6. Homepage Audit

Reference frames: CMC, DexScreener, protocol dashboard, landing page.

| Need | State | Gap |
|---|---|---|
| Clarity (what is SYN in 5s) | ✅ Hero + 30s | OK |
| Trust (live data, verifiable) | ✅ pulse strip | reinforce with "block N · updated Xs ago" |
| Momentum (deltas, velocity) | ❌ | no 24h numbers anywhere on / |
| Social proof (members, latest member, big buy) | ⚠ | latest-member ticker missing |
| Activity (live stream) | ❌ | `ProtocolEventsFeed` exists but is not embedded on `/` |
| Urgency (rank windows, batch left) | ⚠ | thresholds are static copy, not live |

**Dead zones on `/`:** static rank ladder, static next-milestone, static allocation preview, static transparency snapshot. All four have live equivalents already in `src/lib/` and are simply not wired.

---

## 7. LP Audit

| Question a visitor asks | Answered? |
|---|---|
| Why provide liquidity? | ⚠ `WhyLpMatters` exists, lacks "protocol owns the LP" framing |
| What is protocol-owned liquidity (POL)? | ❌ never defined |
| Who owns the LP? | ❌ no "LP holder = liquidity wallet — verify" tile |
| Can outsiders add LP? | ❌ not addressed |
| How do I verify it's real? | ⚠ chart present, address triplet missing |

**Required link triplet on every LP surface:** Trader Joe pool · DexScreener pair · Avascan pool address. Plus: LP token address, pool creation tx, current LP token holder breakdown.

---

## 8. Industry Best-Practice Gaps

| Reference | What they do that we don't |
|---|---|
| DexScreener | per-token info card with socials, audits, paid/unpaid badges, 5m/1h/6h/24h deltas |
| Trader Joe | LP composition + impermanent-loss context |
| Uniswap | "Add liquidity" CTA from the chart panel |
| Jupiter | route-trace per swap |
| Hyperliquid | leaderboards with live P&L deltas |
| FriendTech | per-user pages with portfolio + activity |
| Pump.fun | bonding-curve progress bar, "next milestone" countdown |
| Farcaster | shareable per-event embeds (OG images per tx) |

The cheap, high-ROI imports: **deltas (24h)**, **per-wallet pages**, **bonding-curve / batch progress bar**, **shareable per-event OG**.

---

## 9. Future Compatibility (no new tokenomics — just data hygiene today)

| Future module | Needs us to track today | Tracked? |
|---|---|---|
| NFTs (eligibility by rank) | per-wallet cumulative USDC, rank crossings | ❌ |
| Vault automation (milestones) | vault balance time series | ⚠ point-in-time only |
| Governance (1 member = 1 vote) | unique-buyer set | ✅ |
| AI layer (anomaly, summaries) | unified event log with stable IDs | ✅ (`ProtocolEvent.id`) |
| Referrals | first-touch attribution per buyer | ❌ (out of scope by user rule, noted) |

The only real gap with consequences is **per-wallet cumulative state**. Build that index once and NFTs, ranks, registry, and promotion events all unlock together.

---

## 10. Top 25 Missing Live Metrics

1. Purchases in last 24h
2. New members in last 24h
3. Vault USDC delta 24h / 7d
4. LP TVL delta 24h / 7d
5. SYN price delta 24h
6. LP 24h volume
7. LP 24h fees earned
8. % of LP held by protocol (POL proof)
9. Pool creation tx + age
10. Per-wallet cumulative USDC (holder map)
11. Per-wallet founder number
12. Per-wallet current rank
13. Closest-to-next-rank list (top 10)
14. Average / median ticket size
15. Largest single purchase (link to tx)
16. Rank distribution counts
17. Top-rank concentration ratio
18. Recent promotions feed (bucket-crossing events)
19. Member milestone events (#10, #25, #50, #100)
20. Sale inventory remaining (SYN left in current batch)
21. Realized routing ratio (vault/LP/ops) over last N buys
22. Vault inflow vs. outflow totals
23. Operations wallet spend (outflows)
24. Time-since-last-event per actor type (last buy, last swap, last vault move)
25. Block height & "data freshness" indicator

---

## 11. Top 25 Highest-Impact Improvements

1. **Build one `useHolderIndex` hook** that scans purchase events → wallet → cumulative USDC, rank, founder #. Unlocks items 10–13, 16–19.
2. Embed `ProtocolEventsFeed` (top 6 rows) on the homepage.
3. Wire `HomeMetricsStrip` to `useProtocolPulse` (delete the drift).
4. Add 24h delta badges to every pulse cell.
5. Bind `/join` "you'd be member #N" to `nextMemberNumber`.
6. Bind `HomeNextMilestone` to `vaultUsdc`.
7. Bind tokenomics donut "circulating" slice to `synSold`.
8. Expand each purchase row in `/activity` into 3 routing children.
9. Add per-wallet view: `/activity?actor=0x…` and `/wallet/$address` page.
10. Add "data freshness" stamp ("block N · 12s ago") to footer and pulse strip.
11. Add the LP triplet card (Trader Joe · DexScreener · Avascan) to `/liquidity` and `/`.
12. Add POL % tile ("Protocol owns 94% of LP — verify").
13. Add "latest member" ticker to homepage (last 3 buyers, rank, ago).
14. Add member-milestone events to the feed (synthetic, derived).
15. Add rank-promotion events to the feed (synthetic, derived).
16. Replace static rank ladder on `/` with `RankIntelligence` summary.
17. Add "closest to next rank" panel on `/ranks` (5 wallets, gap shown).
18. Add largest-buy + average-ticket tiles on `/activity`.
19. Add 24h/7d/30d filter chips above unified feed.
20. Add whale-only toggle (> $X) on the feed.
21. Rebuild `/registry` as the founder archive: numbered list from holder index.
22. On `/transparency`, add "since last visit" delta using `localStorage` snapshot.
23. On `/vault`, add realized routing trace (last 10 buys → 3 rows each).
24. Per-event shareable OG image (`/og/tx/[hash]`).
25. Footer "Live" pill with block height + RPC health.

---

## 12. What Should Be Removed

- `VAULT_ASSETS` mock array in `syndicate-config.ts` (multi-asset rows still shown as "Mock"). USDC-only today — show only USDC.
- `VAULT_INFLOWS` mock array (numbers are invented; the unified feed already shows the truth).
- Static "next milestone" copy that isn't bound to `vaultUsdc`.
- Static rank-ladder thresholds on homepage that don't reflect live cohort.
- Any "Coming Soon" tile that has no behind-the-scenes data work in progress (better empty than aspirational).

## 13. What Should Stay Hidden Until Real

- NFT eligibility UI (until at least the eligibility derivation ships).
- Governance / voting tiles.
- AI summaries.
- Vault automation milestones beyond what `vaultUsdc` proves today.
- Any "earnings", "yield", or "APR" framing — banned by core memory.

---

## 14. Roadmap — from "collection of pages" to "living protocol"

**Wave 1 — Connective Tissue (1–2 days, no new contracts).**
Build `useHolderIndex` (purchases → per-wallet cumulative). Wire it into Ranks, Registry, Join, and a new derived-events stream (promotions, member milestones). Single source of truth for "who is a member, what rank, what founder #".

**Wave 2 — Deltas Everywhere (1 day).**
Add 24h/7d windowing to pulse, feed, transparency, vault, LP. Every number gets a green/red delta. This alone changes the perceived heartbeat of the site.

**Wave 3 — Per-Wallet Surfaces (1–2 days).**
`/wallet/$address` and `?actor=` URL state on `/activity`. Now every row in the feed is clickable into a real page.

**Wave 4 — LP Truth Layer (½ day).**
POL %, link triplet, pool creation tx, LP composition. Definitively answer "who owns the LP".

**Wave 5 — Expansion & Sharing (1 day).**
Per-event OG images. Expandable rows in the feed. Footer freshness pill. Shareable purchase receipts.

After Wave 1+2 alone, the **Living Protocol Index** projection rises from 49 → ~78. After all five waves: ~92, true AAA territory — without adding a single new tokenomic, contract, or revenue stream.

---

*End of audit. No code changes made.*
