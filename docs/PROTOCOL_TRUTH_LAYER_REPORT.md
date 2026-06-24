# Protocol Truth Layer — Consolidation Report

**Wave:** P4 · protocol-truth-layer
**Build stamp:** `wave-P4.protocol-truth-layer`
**Author:** legacy deployment platform build pass

## Why

We spent waves P1 → P3c chasing individual leaks: stale copy, stale build
tags, "Untagged · $2", phantom categories, route-level inconsistency.

The recurring root cause was not the copy. It was **fragmented truth**.

Different surfaces independently computed (or re-classified) the same fact:

- "Members" was sometimes `useHolderIndex().totals.members`, sometimes
  `useSaleStats().totalBuyers`, sometimes a hard-coded zero.
- "USDC Routed" was sometimes `useSaleStats().totalUsdcRaised`, sometimes
  `useProtocolPulse().usdcRaised`, sometimes a recomputed sum in the
  Transparency table.
- "Status" labels (LIVE / PARTIAL / PENDING / Mock / Coming Soon) were
  redefined per-component with different colors and pill shapes.
- The "$2 LP seed" — same dollar — appeared as `LP_POOL.initialUsdc` on
  one page, "Other / Untagged" on another, and was missing from a third.

That is the failure mode the user flagged. Truth must be one source.

## What changed

A new module — `src/lib/protocol-truth.ts` — is now the **single source of
truth** for every protocol fact rendered in the UI.

The truth layer does **not** add chain reads. It composes the existing
canonical hooks (`useSaleStats`, `useLpStats`, `useHolderIndex`,
`useProtocolPulse`, `useWalletAssets`) and the transaction-tag registry,
and exposes each displayed fact as a typed `Fact<T>`:

```ts
type Fact<T> = {
  key:         string;        // canonical key (TRUTH.usdcRaised)
  label:       string;        // canonical display label
  value:       T | undefined; // undefined → renders "—"
  status:      "LIVE" | "PARTIAL" | "PENDING";
  source:      string;        // contract / hook / address
  formula:     string;        // exact derivation
  verifyHref:  string | null; // explorer / contract link
  hook:        string;        // owning hook in this repo
};
```

The status enum (`TruthStatus`) and pill classes (`statusPillClasses`) live
here too — no page may redefine them.

## Canonical facts registered

| Key                       | Label                       | Source                                              | Formula                                       | Status   |
| ------------------------- | --------------------------- | --------------------------------------------------- | --------------------------------------------- | -------- |
| `members`                 | Members                     | `useHolderIndex` · TokensPurchased events           | distinct buyer count                          | LIVE     |
| `usdcRaised`              | USDC Routed                 | `useSaleStats` · `totalUsdcRaised()`                | sum(usdcIn) over all buy() calls              | LIVE     |
| `synSold`                 | SYN Distributed             | `useSaleStats` · `totalSynSold()`                   | usdcRaised / 0.01                             | LIVE     |
| `purchaseCount`           | Purchases                   | `useSaleStats` · `purchaseCount()`                  | count of buy() calls                          | LIVE     |
| `nextMemberNumber`        | Next Member #               | derived                                             | members + 1                                   | LIVE     |
| `vaultUsdc`               | Vault Wallet · USDC         | RPC · `USDC.balanceOf(VAULT_WALLET)`                | current ERC20 balance                         | LIVE     |
| `liquidityUsdc`           | Liquidity Wallet · USDC     | RPC · `USDC.balanceOf(LIQUIDITY_WALLET)`            | current ERC20 balance                         | LIVE     |
| `operationsUsdc`          | Operations Wallet · USDC    | RPC · `USDC.balanceOf(OPERATIONS_WALLET)`           | current ERC20 balance                         | LIVE     |
| `lpTvlUsd`                | LP TVL                      | RPC · Trader Joe v1 pair `getReserves()`            | usdcReserve × 2                               | LIVE     |
| `synPriceUsd`             | SYN Spot                    | RPC · Trader Joe v1 pair `getReserves()`            | usdcReserve / synReserve                      | LIVE     |
| `lastBuyAgoSeconds`       | Last Buy                    | RPC · most recent TokensPurchased event             | (currentBlock − lastBuyBlock) × 2s            | LIVE     |
| `lastBuyBuyer`            | Last Buyer                  | RPC · most recent TokensPurchased event             | argmax(block) buyer                           | LIVE     |
| `transactions`            | Classified Transactions     | `TAGGED_TRANSACTIONS` registry                       | manual append-only, each entry on-chain      | LIVE     |
| `classifiedUsdcOut`       | Classified Spend            | derived from `TAGGED_TRANSACTIONS`                  | sum(USDC tagged outflows)                     | LIVE     |
| `membershipAllocationSyn` | Membership Allocation       | `TOKENOMICS_ALLOCATION`                             | constant — 35% of supply                      | LIVE     |
| `totalSupplySyn`          | Total SYN Supply            | SYN ERC20 totalSupply (fixed)                       | constant                                       | LIVE     |
| `routingSplit`            | USDC routing split          | `USDC_ROUTING`                                      | constant 70 / 20 / 10                         | LIVE     |

Each value is `undefined → status: PENDING`. There are no other status
sources.

## Status enum — centralized

Before:
- `HomeMetricsStrip` used `"LIVE" / "PENDING"` with custom Tailwind classes.
- `MembersLeaderboard` used `"Live" / "Demo"`.
- `VAULT_INFLOWS` used `"Live" / "Mock" / "Coming Soon"`.
- `UseOfFunds` used emerald / amber pills with bespoke wording.
- `TransparencyCenter` re-implemented its own LIVE / PARTIAL / PENDING legend.

After:
- One enum: `TruthStatus = "LIVE" | "PARTIAL" | "PENDING"`.
- One pill: `statusPillClasses(status)` returns `{ border, dot }`.
- New surfaces must consume these. Legacy `"Mock" / "Demo" / "Coming Soon"`
  literals are scheduled for removal as their components migrate (see
  Migration Backlog below).

## Transactions — single source

The transaction-tag registry (`src/lib/transaction-tags.ts`, introduced in
P3c) is now re-exported through the truth layer (`TRUTH.transactions`,
`TRUTH.classifiedUsdcOut`). Every displayed dollar that has left an
allocation wallet maps to:

- a source `txHash` (Avalanche C-Chain)
- a canonical `TransactionTag`
- a verifiable explorer URL (`txExplorerUrl`)
- a derived `splitSpend()` (classified vs untagged residual)

The Transparency Use of Funds table already consumes this. Future surfaces
(Liquidity, Activity, Protocol Moments, Treasury) MUST read from the same
helpers — no local recomputation.

## Migrated to the truth layer this pass

| Surface                                     | Reads via TRUTH                                |
| ------------------------------------------- | ---------------------------------------------- |
| `src/components/syndicate/HomeMetricsStrip` | usdcRaised · synSold · members · purchaseCount |

Exemplar migration. Same visual output, no per-component status logic, no
`formatUnits` boilerplate, one verify link per tile derived from the
canonical `verifyHref`.

## Migration backlog (ranked by risk of truth drift)

**Tier 1 — trust-critical surfaces (next pass):**

1. `HomeTransparencySnapshot` — homepage summary; today re-reads
   `useProtocolPulse` directly. → switch to `TRUTH.usdcRaised`,
   `TRUTH.vaultUsdc`, `TRUTH.liquidityUsdc`, `TRUTH.operationsUsdc`,
   `TRUTH.lpTvlUsd`.
2. `TransparencyCenter` — `/transparency` hub. Today uses
   `TRANSPARENCY_ITEMS` + ad-hoc status. → derive items from `TRUTH.*`.
3. `LiquidityTrustContext` + `LpStatus` — duplicate LP TVL / price logic.
   → consume `TRUTH.lpTvlUsd` and `TRUTH.synPriceUsd`.
4. `TreasuryComposition` + `VaultPolicyCore` — wallet balance surfaces.
   → consume `TRUTH.vaultUsdc` and `useWalletAssets` (re-exported via
   the truth layer for multi-asset breakdowns).

**Tier 2 — identity/membership surfaces:**

5. `Hero`, `IdentityZone`, `MemberJourney`, `HomeRankLadder`,
   `MembersLeaderboard`, `EarlyChapters`, `MemberCard`, `wallet.$address`,
   `members`, `chapters`, `founders` — every "member number / chapter /
   rank" derivation. All flow from `useHolderIndex`, but the truth layer
   should be the single import going forward so any future swap (subgraph,
   cache) is one-file.

**Tier 3 — pulse / activity surfaces:**

6. `LivePulseStrip`, `LiveRecencyStrip`, `LiveActivityFeed`,
   `SinceYourLastVisit`, `ProtocolMoments`, `ShareableCards`,
   `AnticipationLine`, `MilestoneTracker` — currently mix `useProtocolPulse`
   + `useHolderIndex` + bespoke formatting. → migrate to `TRUTH.lastBuy*`,
   `TRUTH.nextMemberNumber`.

**Tier 4 — copy/derivation cleanups (post-migration):**

7. Remove `VAULT_ASSETS`, `VAULT_INFLOWS`, `HOMEPAGE_METRICS`, `HomeMetric`
   constants from `syndicate-config.ts` once no surface imports them.
8. Remove `"Mock" / "Demo" / "Coming Soon"` status literals across the
   config — replace with `TruthStatus` everywhere.
9. Replace the bespoke `DEMO_ENTRIES` leaderboard with a `PENDING` empty
   state derived from `TRUTH.members.status === "PENDING"`.

## Duplicate calculations found (now centralized)

- **USDC raised**: `useSaleStats` → `formatUnits(totalUsdcRaised, 6)`
  recomputed in `HomeMetricsStrip`, `HomeTransparencySnapshot`,
  `UseOfFunds`, `TransparencyReport`, `ProtocolRevenueEngine`,
  `StorySoFar`. → all should read `TRUTH.usdcRaised.value`.
- **Vault / Liquidity / Operations USDC**: 70/20/10 allocation recomputed
  in `UseOfFunds`, `RoutingFlow`, `CapitalAllocation`, `HomeAllocationPreview`.
  → derive from `TRUTH.routingSplit` × `TRUTH.usdcRaised.value`; current
  balances from `TRUTH.{vault|liquidity|operations}Usdc`.
- **LP TVL / SYN price**: `useLpStats` consumed directly by `LpStatus`,
  `MarketDashboard`, `LiquidityTrustContext`, `DexScreenerChart`,
  `WhyLpMatters`. → `TRUTH.lpTvlUsd`, `TRUTH.synPriceUsd`.
- **Members / next member #**: `useHolderIndex().totals.members` and
  `useProtocolPulse().nextMemberNumber` returned from two paths.
  → `TRUTH.members`, `TRUTH.nextMemberNumber`.
- **"$2 LP seed"** — was a string in `LP_POOL`, a row in `UseOfFunds`,
  a derived label in `LiquidityTrustContext`. Now: one entry in
  `TAGGED_TRANSACTIONS`, surfaced as `TRUTH.transactions` everywhere.

## Duplicate classifications found (now removed)

- `"Other / Untagged · $2"` in old `UseOfFunds` → replaced by
  `LP_SEED · $2` from the tag registry (P3c) and now also reachable via
  `TRUTH.transactions`.
- `Spending Categories` invented bucket (Development / Infrastructure /
  Marketing / Other / Untagged) → deleted; only on-chain categories
  appear, derived from `classifiedUsdcByTag()`.

## Inconsistencies found (logged, fix in migration tiers above)

1. `HomeTransparencySnapshot` and `TransparencyCenter` can today disagree
   on routing balances by up to one refresh cycle because they wrap
   `useProtocolPulse` independently. Migrating both to `TRUTH.*` eliminates
   the drift — they share the same Fact object reference per render.
2. `MembersLeaderboard` falls back to `DEMO_ENTRIES` when `idx.hasData`
   is false. The Hero / IdentityZone do not. After migration both consume
   `TRUTH.members.status === "PENDING"` and render an identical empty
   state — no more "homepage says X, leaderboard says fake".
3. `wallet.$address.tsx` derives `currentRank` from `cumulativeUsdc`
   independently of `HolderRecord.currentRank`. Same formula, two code
   paths — migration consolidates on `TRUTH` accessors.

## Risk ranking — going forward

| Risk                                                                                          | Severity | Mitigation                                                                                       |
| --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| A new component bypasses TRUTH and reads `useSaleStats` directly                              | HIGH     | Code review rule: any component showing a protocol fact MUST import from `@/lib/protocol-truth`. |
| A new "status" literal slips in (e.g. `"Coming Soon"`)                                        | MEDIUM   | `scripts/check-live-content.mjs` already blocks several. Add `Mock`, `Demo`, `Coming Soon`.       |
| A page invents a new spending category                                                        | HIGH     | Categories may only come from `TAG_LABEL` in `transaction-tags.ts`. Enforced by registry import. |
| A future cache / subgraph replacement requires touching every consumer                        | LOW      | The truth layer is the only place that needs to swap implementations.                            |
| Members count drifts between `useHolderIndex` and `useSaleStats.totalBuyers`                  | LOW      | `TRUTH.members` reads `idx.totals.members` first, falls back to `sale.totalBuyers` only if zero. |

## Rule going forward

> If a UI surface displays a protocol fact, it MUST read that fact from
> `@/lib/protocol-truth`. No exceptions. New surfaces that do not are a
> regression to fragmented truth and must be rejected in review.

> If a member asks "why is this number shown?", the answer must be
> traceable from UI → `Fact.hook` → `Fact.source` → `Fact.verifyHref`.

## Files touched this pass

- **Created:** `src/lib/protocol-truth.ts`
- **Migrated:** `src/components/syndicate/HomeMetricsStrip.tsx`
- **Bumped:** `src/lib/build-stamp.ts` → `wave-P4.protocol-truth-layer`
- **Created:** `docs/PROTOCOL_TRUTH_LAYER_REPORT.md` (this file)
