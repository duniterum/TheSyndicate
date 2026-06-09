# THE SYNDICATE — SCALABILITY & ARCHITECTURE AUDIT

Audit baseline: **today** the protocol has a small live member set, a
single RPC source (Avalanche C-Chain), client-side derivation via
`useHolderIndex`, and no indexer / subgraph / cache layer.

Audit horizon: **10,000 members · 100,000 purchases · 50,000 activity
events · years of history · dozens of milestones · future referrals,
NFTs, governance.**

Goal: identify what works now, what breaks at scale, what needs
pagination / archives / indexing / caching — **without refactoring
anything yet.** Audit first. Refactor when the data forces it.

---

## 1. Per-route scale assessment

Legend: ✅ safe · 🟡 needs pagination/virtualization later · 🔴 needs
indexer/cache before scale.

| Route | Data source | Today | At 10k members | Action needed | Trigger |
|---|---|---|---|---|---|
| `/` (index) | aggregates | ✅ | ✅ | none | n/a |
| `/transparency` | RPC reads | ✅ | 🟡 (cache treasury reads) | add 30s memo cache | >100 visits/min |
| `/members` | `useHolderIndex.ordered` | ✅ (50 shown) | 🔴 | virtualized list + paginate by founder# | >500 members |
| `/founders` | `ordered.slice(0,100)` | ✅ | ✅ (cap is fixed) | none | n/a |
| `/chapters` (future) | grouped index | ✅ | 🟡 | per-chapter pagination | >500/chapter |
| `/ranks` | rank aggregate | ✅ | 🟡 | server-side distribution | >1k members |
| `/activity` | event feed | ✅ | 🔴 | indexer + cursor pagination | >5k events |
| `/wallet/$address` | per-address RPC | ✅ | 🟡 | cache per address (5m) | >1k addrs/day |
| `/milestone/$id` | static | ✅ | ✅ | none | n/a |
| `/api/og/*` | dynamic SVG | ✅ | 🟡 | edge-cache by key | >1k req/min |

**No surface is broken today.** Three are on the "must address before
scale" list: `/members`, `/activity`, `/api/og/*` under load.

---

## 2. Pagination & archive requirements

| Surface | Now | Future page size | Archive strategy | Search/filter |
|---|---|---|---|---|
| Members | none | 50/page, cursor by founder# | "All founders #1–N" jump-to | by founder#, by chapter |
| Founders | hard cap 100 | n/a | static archive page when sale closes | none |
| Chapters | n/a | 50/page per chapter | per-chapter permalink | by founder# in chapter |
| Ranks | n/a | distribution chart + 25/rank | "members at rank X" | by rank |
| Activity | last N | 50/page, cursor by block | monthly archive pages | by event type, by address |
| Wallet history | full | 50/page | full archive linked from wallet page | by tx type |
| Milestones | all | n/a | n/a | n/a |
| Transparency events | last N | 50/page | yearly archive | by event type |
| Referral history | n/a | 50/page when built | per-referrer archive | by referrer |
| NFT history | n/a | 50/page when built | by collection | by tier |
| Governance | n/a | 25/page when built | by status | by status, by voter |

**Rule:** any list that can exceed 200 items in the realistic horizon
gets cursor pagination + virtualization from day one of that surface's
build, even if the current count is 10.

---

## 3. Code architecture risks (audit only — do not refactor)

| Pattern | Location | Risk | Recommended later action |
|---|---|---|---|
| Direct RPC reads in components | several `syndicate/*` cards | retry storms on hot paths | centralize in hooks, add 30–60s memo |
| `useHolderIndex` is the only member source | `src/lib/holder-index.ts` | single point of truth — good now, will need backing indexer | preserve consumer API; swap impl when indexer lands |
| EmptyState / StatusPill / ShareActions | well-used primitives | ✅ healthy reuse | keep |
| OG metadata blocks | per-route `head()` | duplication of structure | extract `buildOgMeta(...)` helper when 8+ routes |
| Per-route OG SVG handlers | `routes/api/public/og/*` | each handler re-derives data | shared `og-data.server.ts` already exists — keep using it |
| Wallet page derivations | `wallet.$address.tsx` | recomputes on every render | memoize when wallet page adds more sections |
| Milestone logic | spread across components | risk of drift | consolidate into `lib/milestones.ts` later |
| Chapter logic | duplicated definitions | drift risk | single source in `lib/chapters.ts` (already partial) |
| Protocol events feed | client-side only | won't scale past ~5k events | server endpoint + cursor when triggered |

**Anti-rewrite contract preserved:** the consumer interface of
`useHolderIndex` MUST stay stable. Internal data source may change
(RPC → indexer → subgraph). Components must not care.

---

## 4. Data architecture risks

| Hook / surface | Today | Safe boundary | When to migrate |
|---|---|---|---|
| `useHolderIndex` | client RPC scan | ~1k holders | move scan to server fn + cache |
| `useLivePurchaseEvents` | client log poll | ~10 events/min sustained | server-side WebSocket / SSE proxy |
| `useSaleStats` | RPC read | always safe | n/a |
| `ProtocolEventsFeed` | client poll | ~5k total events | server endpoint w/ cursor |
| `MilestoneTracker` | derived | always safe | n/a |
| Chapter logic | derived from index | as safe as index | follows `useHolderIndex` |
| Wallet route | per-address RPC | <1k addr/day | per-address cache (5m) |
| Member Wall | derived | follows index | follows `useHolderIndex` |
| Founders Hall | derived (cap 100) | always safe | n/a |

**Rules to preserve:**
- nothing is stored manually that can be derived
- nothing is invented or estimated
- PENDING is a first-class state
- derived data stays derived even after indexer lands
- immutable historical facts (first purchase tx, milestone block) stay
  immutable

---

## 5. Information architecture audit

Current top-level nav: Home · Members · Founders · Ranks · Activity ·
Transparency · Docs (+ Join CTA).

| Concern | Status | Action |
|---|---|---|
| First-time visitor finds "what is this" | ✅ via Home | keep |
| Member finds their identity | ✅ via wallet page | promote "Find my wallet" |
| Founder finds protocol history | 🟡 via Founders + Timeline | add cross-link between them |
| Verifier finds proof | ✅ via Transparency | keep |
| 10k-member nav stays sane | 🟡 | group community items under one menu (already partial) |
| Redundant pages | none critical | watch token/tokenomics overlap |
| Overlapping pages | `liquidity` vs `transparency` partial overlap | clarify scope in subhead |
| Mobile drawer | present | audit after Chapters ships |
| Dead ends | wallet page → no "back to members" | add breadcrumb |

---

## 6. Recommended next implementation order (validated)

Re-validating the previously-proposed order against this audit and the
Product Decision Framework.

| # | Surface | Framework score | Scale risk | Decision |
|---|---|---|---|---|
| 1 | **Chapter Archives** | 11/12 YES | low (pagination from day 1) | **BUILD next** |
| 2 | **Rank Distribution Hub** | 9/12 YES | low (aggregate) | **BUILD after Chapters** |
| 3 | **Referral Architecture (doc only)** | n/a — doc | n/a | **WRITE doc, no code** |
| 4 | **NFT Recognition Layer** | mark PENDING only | n/a | **PENDING page only, no contract** |
| 5 | Governance / Vault Automation / AI | defer | high | **DEFER** until real member demand |

**Pre-build requirements for Chapter Archives:**
- pagination scaffold (50/page, cursor by founder#)
- per-chapter OG (reuse milestone SVG template + static PNG fallback)
- empty-state per chapter ("Chapter opens at founder #N")
- no scarcity language, no countdowns
- breadcrumb back to `/members`

**Pre-build requirements for Rank Hub:**
- aggregate-only (distribution chart + counts per rank)
- "members at rank X" expandable, paginated
- explicitly NOT a leaderboard
- never sorts by wealth / spend

---

## 7. What this audit does NOT do

- It does not refactor any code.
- It does not change any consumer interface.
- It does not add an indexer, subgraph, or cache.
- It does not change routing or contracts.

It records **what to do when the data forces our hand** — and what
**not** to do prematurely.

---

## Addendum — Rank Hub wave (2026-06-05)

Rank Hub (`/ranks`) ships in this wave. It is **aggregate-only** and uses
the already-existing `useHolderIndex.totals.rankDistribution` map plus a
wallet-aware "Where do I fit?" panel (`useAccount` + `getByWallet`). No
new data sources. No new indexer requirements.

### Per-section scale check

| Section | Source | 100 | 1k | 10k | 100k events |
|---|---|---|---|---|---|
| What are Ranks | static copy | ✅ | ✅ | ✅ | ✅ |
| Where do I fit (wallet-aware) | `getByWallet(address)` | ✅ | ✅ | ✅ | ✅ |
| Rank ladder definitions | `RANKS_V2` | ✅ | ✅ | ✅ | ✅ |
| Distribution chart | `totals.rankDistribution` (12 keys) | ✅ | ✅ | 🟡 needs server aggregate | 🟡 |
| Members per rank (expandable) | filter on `currentRank` | ✅ | ✅ | 🔴 paginate per rank | 🔴 |
| Latest rank changes | only rendered when real | ✅ | ✅ | 🟡 server-side diff | 🔴 |
| Verification block | static + explorer links | ✅ | ✅ | ✅ | ✅ |

**Trigger to migrate aggregation server-side:** holder count > 1,000.
At that point the per-render scan inside `useHolderIndex` becomes the
bottleneck for `/ranks`, `/members`, and `/chapters` simultaneously —
all three should swap to a cached server function returning the
pre-aggregated totals. Consumer interfaces stay unchanged
(anti-rewrite contract honored).

### Architecture risks identified during this wave (record only)

| Risk | Where | Why it matters | Action |
|---|---|---|---|
| Three components compute `latest by block` independently | `RankIntelligence`, `useHolderIndex.latest`, `MembersLeaderboard` | drift risk | consolidate into a `latestSlice(n)` helper when next we touch any of them |
| Rank distribution computed twice (hook + intelligence card) | `holder-index.ts`, `RankIntelligence.tsx` | minor duplication | acceptable; both read same source |
| `/ranks` page composed several pre-existing cards (Quest, Compounder, Distribution, Leaderboard) | `routes/ranks.tsx` | scope drift from "Where do I fit?" | Rank Hub rewrite (this wave) drops noise; keep ladder + intelligence + verification only |
| Per-wallet rank derivation runs on every render | `getByWallet` | n/a today | memoize when wallet page adds heavier sections |

### Re-validated build order (post Rank Hub)

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Rank Hub | ✅ shipping this wave | aggregate-only, wallet-aware |
| 2 | Referral Architecture (doc only) | next | no code, no contract |
| 3 | NFT Recognition page (PENDING only) | after referral doc | no contract deployment |
| 4 | Governance / Vault Automation / AI | DEFER | gate on real usage |
| 5 | Indexer migration for holder/event aggregation | TRIGGER at ≥1k holders OR ≥5k events | preserves consumer API |

**Stop condition still holds.** No new feature work proceeds until live
community data justifies it.
