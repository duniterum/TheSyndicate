# `useHolderIndex` — Architectural Design Review
*Canonical member intelligence layer for The Syndicate. Design-only document. No code changes.*

> Purpose: define `useHolderIndex` so thoroughly that every future feature (ranks, registry, NFT eligibility, governance weighting, wallet profiles, share cards) reads from it without a rewrite. One source of truth for "who is a member, since when, at what rank, with what footprint".

---

## 1. Source of Truth

### 1.1 Events INCLUDED at v1

| Event | Contract | Why included |
|---|---|---|
| `TokensPurchased(buyer, purchaseId, usdcAmount, synAmount, vaultAmount, liquidityAmount, operationsAmount)` | Membership Sale | The **canonical membership signal.** Defines who is a member, founder #, USDC contributed, rank. |

That is the only event the v1 index ingests. **Membership = bought from the Membership Sale**, by protocol definition. Everything else is footprint, not identity.

### 1.2 Events INCLUDED at v1.1 (footprint layer, additive)

| Event | Contract | Role |
|---|---|---|
| `Transfer(from, to, value)` on SYN ERC-20 | SYN token | Current SYN balance per wallet (for `holdingDeltaVsPurchased`). |
| LP `Swap` (the existing `useLpSwaps`) | Trader Joe pair | Per-wallet buy/sell footprint on the open market. |
| LP `Mint` / `Burn` | Trader Joe pair | Per-wallet LP provision footprint. Tags POL when actor = liquidity wallet. |

These are layered onto the index by wallet — they enrich a member record, but **do not create or remove members**.

### 1.3 Events EXCLUDED at v1 — with reason

| Event | Why excluded (now) | When reconsidered |
|---|---|---|
| Generic `Transfer` from any wallet | Receiving SYN by transfer is **not** a membership signal. A whale could airdrop SYN to a thousand wallets; none of them are members. | Never as identity. Footprint only. |
| LP swap "buy" → membership | Buying on the open market = market participant, **not** a Syndicate member. Membership is a deliberate sale interaction. | Never. Keep tiers distinct: Member · Holder · Market participant. |
| Future NFT mint events | Eligibility *derives* from rank, which derives from purchases. NFT mint becomes a *consequence* of the index, not an input — preventing circular dependency. | NFT shipped → add as enrichment field `nftMinted: boolean`, still not an identity source. |
| Future governance votes | Same reason — derived from membership, never the other way. | Add `lastVoteBlock` enrichment when governance ships. |
| Referrals | Out of scope by user rule; would require off-chain attribution. | Only if a referral contract emits an event. |
| AVAX gas / wallet age heuristics | Off-chain, gameable, non-canonical. | Never. |

### 1.4 Design rule (sticky)

> **Identity** comes from one event: `TokensPurchased`.
> **Footprint** comes from many events, layered after the fact.
> **Eligibility & status** are always *derived*, never indexed.

This separation is what prevents future rewrites.

---

## 2. Data Model

### 2.1 Record shape

```ts
type HolderRecord = {
  // ─── Identity (from TokensPurchased only) ───
  wallet: `0x${string}`;
  founderNumber: number;          // 1..N — order of FIRST purchase
  memberNumber: number;           // alias of founderNumber while sale is open
  firstPurchaseBlock: bigint;
  firstPurchaseTx: `0x${string}`;
  firstPurchaseAt: number;        // unix seconds (derived from block ts)
  lastPurchaseBlock: bigint;
  lastPurchaseAt: number;

  // ─── Cumulative footprint (sum of all TokensPurchased) ───
  purchaseCount: number;
  cumulativeUsdc: number;         // primary rank input
  cumulativeSyn: number;          // SYN received via sale
  cumulativeRoutedToVault: number;
  cumulativeRoutedToLiquidity: number;
  cumulativeRoutedToOperations: number;
  largestSinglePurchaseUsdc: number;

  // ─── Rank state (derived) ───
  currentRank: RankId;            // bucketed by cumulativeUsdc
  rankAchievedAtBlock: bigint;    // when current rank was first reached
  nextRank: RankId | null;
  usdcToNextRank: number | null;  // gap

  // ─── Chapter (derived from founderNumber) ───
  chapter: "founders" | "early" | "open" | "post-sale";

  // ─── Eligibility (pure derivation, no storage) ───
  eligibility: {
    foundersNFT: boolean;
    chapterBadge: boolean;
    governance: boolean;
    // future flags added here — pure functions of fields above
  };

  // ─── v1.1 enrichment (optional, lazy) ───
  enrichment?: {
    currentSynBalance: number;        // live ERC-20 read
    holdingDeltaVsPurchased: number;  // currentSynBalance - cumulativeSyn
    lpSwapsBought: number;            // market buys
    lpSwapsSold: number;              // market sells
    lpProvidedUsdc: number;
    lastActivityBlock: bigint;        // max(purchase, swap, lp event)
  };
};
```

### 2.2 Aggregate shape

```ts
type HolderIndex = {
  byWallet: Map<string, HolderRecord>;
  ordered: HolderRecord[];          // sorted by founderNumber ASC
  asOfBlock: bigint;                // freshness stamp
  totals: {
    members: number;
    cumulativeUsdc: number;
    cumulativeSyn: number;
    averageTicket: number;
    medianTicket: number;
    largestTicket: number;
    rankDistribution: Record<RankId, number>;
    topRankConcentration: number;   // % of USDC held by top 10% of members
  };
};
```

### 2.3 Why this shape

- **Identity fields are immutable** once written — `founderNumber`, `firstPurchaseTx`. They cannot be recomputed differently later. This is the anti-rewrite guarantee.
- **Cumulative fields are monotonic** — only grow. Easy to update incrementally as new events arrive.
- **Derived fields (`currentRank`, `eligibility`, `chapter`) are pure functions** of cumulative fields. Change the rank thresholds tomorrow → no migration, just re-derive.
- **Enrichment is a separate, optional shape** — failure to fetch a SYN balance never invalidates a member record.

---

## 3. Live vs Derived vs Indexed vs Manual

| Field | Class | Why |
|---|---|---|
| `wallet` | INDEXED | From event `buyer`. |
| `founderNumber` / `memberNumber` | DERIVED | Computed from sorted first-purchase order across the event set. Re-derivable any time. |
| `firstPurchaseBlock/Tx/At` | INDEXED | Extracted from earliest event per wallet. `At` is LIVE (block timestamp). |
| `lastPurchaseBlock/At` | INDEXED | Latest event per wallet. |
| `purchaseCount` | INDEXED | `count(events where buyer=w)`. |
| `cumulativeUsdc` / `cumulativeSyn` | INDEXED | `sum(events.usdcAmount)`. |
| `cumulativeRoutedToVault/Liquidity/Operations` | INDEXED | Same, per routing slice — already in the event payload. |
| `largestSinglePurchaseUsdc` | INDEXED | `max(events.usdcAmount)`. |
| `currentRank` | DERIVED | `rankForUsdc(cumulativeUsdc)` — pure function. |
| `rankAchievedAtBlock` | DERIVED | Walk events oldest→newest; first event whose running sum crosses threshold. |
| `nextRank` / `usdcToNextRank` | DERIVED | Pure function of `currentRank` + thresholds. |
| `chapter` | DERIVED | Bucketed `founderNumber`. |
| `eligibility.*` | DERIVED | Pure functions of fields above. **Never stored.** |
| `enrichment.currentSynBalance` | LIVE | `ERC20.balanceOf(wallet)` — multicall. |
| `enrichment.holdingDeltaVsPurchased` | DERIVED | `live − cumulative`. |
| `enrichment.lpSwapsBought/Sold` | INDEXED | From `useLpSwaps`. |
| `enrichment.lpProvidedUsdc` | INDEXED | From LP `Mint`. |
| `enrichment.lastActivityBlock` | DERIVED | `max(...)`. |
| `totals.*` | DERIVED | Reductions over `ordered`. |
| `asOfBlock` | LIVE | `publicClient.getBlockNumber()`. |
| (none) | MANUAL | **There are no manual fields.** Manual data is forbidden — it breaks verifiability. |

The strict discipline: **INDEXED is the only persisted layer. DERIVED is recomputed on read. LIVE is fetched on demand.** That is what makes the index re-buildable from chain alone in case of any corruption, mistake, or future schema change.

---

## 4. Future Compatibility

How each future module reads from `HolderIndex` without modification:

| Future module | Reads | New field needed? |
|---|---|---|
| **Ranks page** | `byWallet`, `totals.rankDistribution`, `ordered.sort(usdcToNextRank ASC)` | none |
| **Founder numbers** | `record.founderNumber`, `record.firstPurchaseTx` | none |
| **Early chapters** | `record.chapter`, filter `ordered` by chapter | none |
| **NFT eligibility (founders NFT, chapter NFT, rank NFT)** | `record.eligibility.foundersNFT` etc. — add new boolean to `eligibility` as new NFTs ship | extend `eligibility` only |
| **Governance eligibility** (1 member = 1 vote, or USDC-weighted) | `record.eligibility.governance`, `record.cumulativeUsdc` as weight | none |
| **Referrals** (when/if a contract emits) | new ingestion source → new field `referredBy: wallet \| null` | one ingest + one field, additive |
| **Protocol milestones** (member #100, $X raised) | `totals.members`, `totals.cumulativeUsdc` + threshold list | none |
| **Member cards** (profile card per wallet) | full `HolderRecord` for that wallet | none |
| **Share cards / OG images** | `HolderRecord` snapshot at block N | none — already serializable |
| **Wallet profile page** (`/wallet/$address`) | `byWallet.get(address)` + filtered events | none |
| **Promotion feed** (rank crossings) | walk events oldest→newest, emit synthetic events on rank change | derivable, no storage |
| **Closest-to-next-rank** | `ordered.sort((a,b) => a.usdcToNextRank - b.usdcToNextRank)` | none |

**Anti-rewrite guarantee:** because identity is canonical and everything else is derived, future modules add *fields*, never *migrations*. New rank thresholds, new chapters, new eligibility rules — all are reductions over existing data.

---

## 5. Performance & Scaling

### 5.1 Cost profile of v1 (client-side, no backend)

Per refresh cycle: one `eth_getLogs` sweep over Sale contract from `SALE_DEPLOYMENT_BLOCK` → tip, chunked at 2,000 blocks. This is already what `useLivePurchaseEvents` does.

| Cohort size | Events | Blocks scanned | Round-trips @ 2k chunks | Build cost | UX |
|---|---|---|---|---|---|
| 10 members | ~10 | small | a few | <100ms after fetch | instant |
| 100 | ~150 | growing | ~10–50 | <250ms | instant |
| 1,000 | ~1,500 | months of chain | 100s | ~500ms first load | needs cache |
| 10,000 | ~15,000 | years of chain | 1,000s | seconds | needs indexer |

### 5.2 Scaling plan (phased — no premature optimization)

**Phase A — today through ~500 members. Pure client.**
- `useHolderIndex` runs in browser via wagmi/viem.
- Reuses existing `useLivePurchaseEvents` log scan.
- React Query cache (`staleTime: 30s`, `refetchInterval: 60s`).
- `useMemo` reductions for totals.
- `localStorage` snapshot of last-seen tip block + events → only fetch *delta* on revisit.

**Phase B — 500–5,000 members. Lightweight cache layer.**
- Move event aggregation into a legacy deployment platform Cloud Postgres table (`holder_events`), indexed by `(wallet, block_number)`.
- A server function `getHolderIndex({ asOfBlock?: bigint })` returns the prebuilt JSON.
- Client falls back to live scan if server is cold.
- Update path: small cron / per-request scan from `last_indexed_block` → tip.

**Phase C — 5,000+ members or multi-chain. Real indexer.**
- Ponder / Envio / Goldsky subgraph indexing `TokensPurchased`, `Transfer`, LP events.
- Same `HolderRecord` shape, served from GraphQL.
- Frontend interface (`useHolderIndex`) **does not change** — only its data source does. That is the entire payoff of designing the contract now.

### 5.3 Caching rules

- Identity fields cached forever per `(chain, wallet)`.
- Derived fields recomputed on every read (cheap).
- Enrichment cached 60s.
- Snapshots are keyed by `asOfBlock` so "Member card as of block N" is reproducible and shareable.

### 5.4 Aggregation tables (Phase B/C)

| Table | Purpose |
|---|---|
| `holder_events` | Raw, append-only purchase events. Source of truth mirror. |
| `holder_records` | Materialized one row per wallet — fast reads for `/ranks`, `/registry`, `/wallet/*`. |
| `protocol_totals` | Single-row materialized aggregates for pulse strip. |
| `daily_snapshots` | One row per day per metric → powers 24h/7d/30d deltas without re-scanning. |

All four are *derivable from* `holder_events`. Lose the others, rebuild from scratch in minutes. Same anti-rewrite guarantee at the data-layer.

---

## 6. Protocol Cohesion Impact — page-by-page

| Page | Current state | After `useHolderIndex` | New metrics unlocked |
|---|---|---|---|
| **Homepage** | Pulse strip + static rank ladder + static milestone + no live members ticker. | Pulse strip stays. Static rank ladder → live `rankDistribution`. Static milestone → bound to `totals.cumulativeUsdc`. New "latest members" mini-ticker (last 3 from `ordered`). | rank distribution, latest 3 members, avg/median ticket, momentum |
| **/ranks** | `RankIntelligence` partial; "closest to next rank" missing. | Full distribution + closest-to-next-rank list + largest holders + newest holders + top-rank concentration. | 6 new tiles, all live |
| **/registry** | Static / non-live. | Founder archive: numbered list from `ordered`, each linking to wallet profile. | founder #, first purchase tx, chapter badge |
| **/activity** | Unified stream, no per-actor view. | Expand a row → "actor card" with `HolderRecord` snippet. New synthetic events: rank promotions, member milestones (#10, #25, #100). | per-actor context, derived events |
| **/join** | "You'd be member #N" is copy, not bound. | Bound to `totals.members + 1`. Shows current chapter, rank you'd land in for typical ticket sizes. | live member#, chapter preview, rank preview |
| **Member Cards (future)** | None. | `HolderRecord` snapshot → card. | identity, founder #, chapter, rank, footprint |
| **Milestones** | Static copy. | Bound to `totals` thresholds. Auto-emits "Member #100 reached" event in feed. | live progress bars, milestone events |
| **Early Chapters** | Copy only. | Filter `ordered` by `chapter` → list of actual chapter members with tx links. | live chapter rosters |
| **Wallet Profiles (`/wallet/$address`)** | Don't exist. | Full `HolderRecord` + enrichment + filtered events. | founder #, rank, lp footprint, holding delta, last activity |
| **/transparency** | Balances only. | Adds "members behind this treasury", "avg member contribution", "concentration ratio". | trust deltas |
| **/liquidity** | LP TVL + swaps. | Adds "N members back this LP", and via `enrichment.lpProvidedUsdc` shows POL split. | member-anchored LP context |
| **/tokenomics** | Static donut. | Sold slice = `totals.cumulativeSyn`; distribution by chapter. | live circulating, chapter distribution |

**Net effect:** the ripple test (one purchase → every surface) moves from **4/15 → ~13/15** after a single hook lands.

---

## 7. Wave Prioritization (post-`useHolderIndex`)

Ranked by **impact × cohesion lift ÷ effort**. Each downstream wave assumes the prior wave is shipped.

| Rank | Wave | Why it's next | Effort |
|---|---|---|---|
| 1 | **`useHolderIndex` itself** | Unlocks 13 other features. Single biggest leverage move on the roadmap. | M |
| 2 | **Bind existing pages** (Homepage rank ladder, milestone, Join member#, Tokenomics donut) | Zero new UI — replace static copy with `useHolderIndex` reads. Highest cohesion per hour. | S |
| 3 | **Wallet Profile page (`/wallet/$address`)** | Makes every feed row clickable. Turns the explorer into a social object. Compounds every later share. | M |
| 4 | **Derived events in feed** (rank promotions, member milestones) | Pure derivation, no new ingest. Activity feels alive instead of transactional. | S |
| 5 | **24h / 7d deltas everywhere** | Needs `daily_snapshots` (or in-memory bucketing). Visible heartbeat. | M |
| 6 | **`/ranks` rebuild** (distribution + closest-to-next + largest holders + concentration) | All reductions over `ordered`. High visual payoff. | M |
| 7 | **`/registry` founder archive** | Trivial after wave 1. The "history" pillar of the protocol. | S |
| 8 | **Share cards / per-event OG** | Each card = `HolderRecord` snapshot. Growth loop. | M |
| 9 | **Routing-proof tile on `/vault`** | Realized 70/20/10 over last N buys — uses `cumulativeRoutedTo*`. | S |
| 10 | **LP truth layer** (POL %, link triplet, pool creation tx) | Independent of index, but pairs naturally with `enrichment.lpProvidedUsdc`. | S |
| 11 | **Whale / range filters on feed** | UX polish, low risk, high explorer-feel. | S |
| 12 | **Snapshot infrastructure** (Phase B server cache) | Only when first-load > 1s consistently. Don't pre-build. | L |

S ≈ ½ day · M ≈ 1–2 days · L ≈ 3+ days.

---

## 8. The Anti-Rewrite Contract (one page summary)

1. **One identity source.** `TokensPurchased`. Everything else enriches.
2. **Identity fields are immutable.** Founder numbers never re-shuffle.
3. **Derived fields are pure functions.** Change thresholds, no migration.
4. **Enrichment is optional and additive.** Layer fails → record still valid.
5. **Same TypeScript interface across phases.** Client scan today, Postgres tomorrow, subgraph at scale — `useHolderIndex` signature does not change.
6. **No manual fields ever.** Verifiability beats convenience.
7. **Synthetic events (promotions, milestones) are derived at read time.** Not stored. They cannot drift from chain truth.

If these seven rules hold, `useHolderIndex` becomes — and stays — the canonical member intelligence layer of The Syndicate.

---

*End of architecture review. Awaiting wave selection.*

---

## Wave 3A addendum — windowed deltas (June 2026)

`useHolderIndex` now exposes a `deltas` field with `last24h` and `last7d`
buckets, each a `HolderWindowDelta` carrying `newMembers`, `purchases`,
`usdcRaised`, `synSold`, and `vaultRouted` / `liquidityRouted` /
`operationsRouted`. Deltas are computed at read time from the same indexed
`TokensPurchased` set — no new ingest, no new storage. Coverage requires
`useChainTime` (a one-shot tip-block timestamp) to be resolved; before then
`deltas` is `undefined` and consumers render "—" rather than fabricating
zero.

This preserves the seven anti-rewrite rules: identity is still untouched,
derivation is still pure, and the same fields will populate identically when
the underlying source moves from client RPC scan to a server cache or
subgraph. The hook signature did not change; one optional field was added.
