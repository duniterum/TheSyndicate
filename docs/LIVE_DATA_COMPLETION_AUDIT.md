# THE SYNDICATE — LIVE DATA COMPLETION AUDIT

**Date:** 2026-06-05
**Scope:** every page, every card, every metric.
**Question for each metric:** is the right thing on screen right now?

Status legend:

| Code | Meaning |
|---|---|
| LIVE | Verifiable on-chain right now via wagmi reads / event logs |
| DERIVED | Pure function of LIVE inputs — safe to display, no new source |
| INDEXER | Reachable today but needs a server-side index to scale (>~1k holders or >~5k events) |
| EXTERNAL | Requires a 3rd-party source not in repo (DEX API, price oracle) |
| PENDING | Intentionally not live yet — future contract / module not deployed |
| HIDE | Currently rendered, should not be |

Every metric carries a status pill in the UI. The pill **must** match the
status assigned below.

---

## 1. Homepage (`/`)

| Metric | Today | Status | Source | Notes |
|---|---|---|---|---|
| SYN price | hard-coded $0.01 access rate | LIVE | `ACCESS_RATE_USDC_PER_SYN` | Access rate is fixed by contract — correct, not market price. Label as "access rate", never "market price". |
| Market cap | derived from circulating × access rate | DERIVED | `useSaleStats` + access rate | Label "membership-implied market cap"; never claim market price. |
| FDV | total supply × access rate | DERIVED | constants | Fine; label "fully diluted at access rate". |
| Treasury value | sum of wallet USDC balances | LIVE | `useTreasury*` reads | Verify each wallet read sets PARTIAL pill when one read fails. |
| LP TVL | LP pool reserves | EXTERNAL | DexScreener/Trader Joe | If pool not yet seeded, render PENDING — requires LP reserve source. |
| Circulating supply | SYN sold via membership sale | LIVE | `useSaleStats.totalSynSold` | Do NOT include allocation wallets as circulating. |
| Revenue generated | cumulative USDC routed | LIVE | `useHolderIndex.totals.cumulativeUsdc` | Live as soon as one event indexed. |
| Revenue allocated | 70/20/10 split sums | DERIVED | per-event split sums | Show "0 / 0 / 0" honestly until events flow. |
| Holders | unique buyer count | LIVE | `useHolderIndex.totals.members` | Equals member count — they are the same primitive today. |
| Transactions | total purchase count | LIVE | `useHolderIndex.totals.purchaseCount` | n/a |
| Last buy | latest purchase | LIVE | `useHolderIndex.latest[0]` | Show "no purchases yet" empty state. |
| Next member # | totals.nextMemberNumber | DERIVED | holder index | n/a |

**Hide rules:** no fake price ticker, no estimated FDV, no rolling
30d revenue chart until at least 30d of events exist.

---

## 2. Members (`/members`)

| Metric | Status | Source |
|---|---|---|
| Member count | LIVE | `useHolderIndex.totals.members` |
| Founder count (≤100) | DERIVED | filter on `founderNumber` |
| Chapter counts | DERIVED | filter on `chapter` |
| Rank counts | DERIVED | `totals.rankDistribution` |
| Per-row rank, chapter, founder# | DERIVED | record fields |
| Per-row USDC amount | HIDE | — | Intentionally not shown (no wealth ranking). |

---

## 3. Activity (`/activity`)

| Metric | Status | Source |
|---|---|---|
| Purchase events | LIVE | TokensPurchased logs |
| Rank events (promotions) | DERIVED | diff per event (computed in `buildHolderIndex`) |
| Milestone events | DERIVED | `MilestoneTracker` thresholds |
| Member events (new wallet) | DERIVED | first-seen wallet detection |
| Routing events (70/20/10) | DERIVED | per-event split |
| Treasury movements | INDEXER | requires ERC-20 transfer log scan per wallet |
| LP events | EXTERNAL | DEX subgraph or DexScreener history |

Pagination required when event count >200 (see scalability audit).

---

## 4. Transparency (`/transparency`)

| Metric | Status | Source |
|---|---|---|
| Vault wallet USDC | LIVE | direct read |
| Liquidity wallet USDC | LIVE | direct read |
| Operations wallet USDC | LIVE | direct read |
| Routing totals 70/20/10 | LIVE | sum over events |
| Allocation totals | LIVE | sale stats |
| Verification (per metric tx link) | LIVE | `txExplorerUrl(hash)` |

Every metric here must link to an explorer page — no exceptions.

---

## 5. Liquidity (`/liquidity`)

| Metric | Status | Source |
|---|---|---|
| Reserves | EXTERNAL | DEX pool (or PENDING if no pool) |
| LP TVL | EXTERNAL | DEX pool |
| Pool address / DEX link | LIVE | constant |
| Fallback when pool absent | PENDING | required label: "PENDING — pool not yet seeded" |

---

## 6. Tokenomics (`/tokenomics`)

| Metric | Status | Source |
|---|---|---|
| Allocation chart | LIVE | constants |
| Wallet allocations | LIVE | 7 INITIAL_HOLDERS |
| Live wallet balances | LIVE | per-wallet read |
| Allocation verification | LIVE | Avascan links |

---

## 7. Vault (`/vault`)

| Metric | Status | Source |
|---|---|---|
| Vault wallet assets | LIVE | direct reads |
| Live balances | LIVE | per-token reads |
| Contract status | PENDING — vault automation contract not deployed |
| Pending modules | PENDING | each labelled with reason |

Every PENDING line must carry a one-sentence reason (see Part 3 below).

---

## 8. Wallet pages (`/wallet/$address`)

| Metric | Status | Source |
|---|---|---|
| Founder #, rank, chapter | DERIVED | holder index |
| Cumulative contribution | LIVE | per-record sum |
| First/last tx | LIVE | record + explorer link |
| Eligibility (founder, chapter, governance) | DERIVED | `deriveEligibility` |

---

## 9. Founders / Chapters / Ranks

| Surface | Source | Status |
|---|---|---|
| Founders Hall #1–100 | `ordered.slice(0,100)` | DERIVED |
| Chapter Archives | filter on chapter | DERIVED |
| Rank Hub distribution | `totals.rankDistribution` | DERIVED |
| Rank Hub "members per rank" | filter on `currentRank.name` | DERIVED |
| Latest rank changes | diff per event | DERIVED (only shown when ≥1 promotion observed) |

---

## Part 3 — PENDING Quality (every PENDING card must answer all four)

| PENDING surface | What is missing? | Why? | What unlocks it? | What can I verify today? |
|---|---|---|---|---|
| Liquidity TVL | Pool reserves | Pool not seeded yet | LP creation tx on Trader Joe | Liquidity wallet USDC balance |
| Vault automation contract | Deployed contract address | Not yet written/audited | Vault contract deployment | Vault wallet balance live |
| Governance | Voting contract | Not built | Governance contract deployment | Rank-implied governance weight |
| NFT recognition | NFT contract | Not built | Approval gate + contract | Founder #, chapter (already canonical) |
| Referral | Architecture doc | Not written | `docs/REFERRAL_SYSTEM_ARCHITECTURE.md` | Nothing — pre-design |
| AI layer | None — deferred | Not justified | Real community signal | Nothing |

**Banned PENDING usages:**
- bare "PENDING" with no explanation
- "PENDING — soon" / "PENDING — Q3"
- PENDING on a metric that is actually derivable today

---

## Part 6 — Data Source Discipline (enforced)

| Concept | Source | Never confuse with |
|---|---|---|
| Members / founders / chapters / ranks / wallet identity | `useHolderIndex` | sale totals, holders |
| Sale totals / SYN sold / USDC raised / purchase counts | `useSaleStats` | treasury totals |
| Vault / Liquidity / Operations balances | wallet reads | sale totals |
| Reserves / LP TVL / pool state | LP / DEX source | treasury |

Rule: **never** treat holders as members, members as holders, sale totals
as treasury totals, or allocation wallets as circulating supply. If a
component blurs these, refactor before shipping.

---

## Audit verdict

| Domain | Verdict |
|---|---|
| Homepage metrics | LIVE/DERIVED coverage is complete. Only LP TVL legitimately PENDING. |
| Members / Founders / Chapters | Fully LIVE/DERIVED. No padding. |
| Ranks | Distribution LIVE; Rank Hub (this wave) closes the last gap. |
| Activity | LIVE for purchase/rank/member/milestone/routing. Treasury & LP movement need INDEXER post-1k events. |
| Transparency | LIVE end-to-end. Verification links present. |
| Liquidity / Vault automation / Governance / NFT / Referral | Correctly PENDING with explicit reasons. |

**No metric currently on screen falls into the "HIDE" category as of
this audit.** No "fake live" pills detected.

Next pass: re-run this audit when (a) holder count crosses 500, (b)
LP pool seeds, or (c) any new module ships.
