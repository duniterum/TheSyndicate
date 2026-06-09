# THE SYNDICATE — AAA Protocol Positioning & IA Refactor

**Status:** APPROVED with refinements (see §0a). Implementing in this sprint.
**Scope:** Information architecture, narrative hierarchy, data-source mapping.
**Constraints:** Preserve every working integration. Replace placeholders with `PENDING`. Never invent values.

---

## 0a. Final Refinements (binding)

**Terminology — single glossary, used everywhere:**

| Term | Meaning |
|---|---|
| Protocol Revenue Generated | Cumulative, historical value that entered protocol contracts/wallets. NOT a wallet balance. Today: Membership Sales only. |
| Current Protocol-Controlled Assets | Point-in-time sum of Treasury + POL + Operations + Sale contract balance + protocol-owned SYN reserves + other controlled wallets. |
| Protocol Treasury / Vault | The 20% reserve bucket only. Never used as a synonym for "all protocol assets". |
| Protocol-Owned Liquidity (POL) | The 70% allocation supporting LP depth. Protocol-controlled, not idle. |
| Operations Budget | The 10% allocation. Protocol-controlled until spent; once spent becomes use-of-funds history. |
| Use of Funds | Generated → Allocated → Spent → Remaining accounting view. |
| Revenue Sources | Distinct revenue streams. Each labeled LIVE or PLANNED. Planned NEVER counted into totals. |
| LIVE / PARTIAL / PENDING | Mandatory status pill on every cell. |

**Banned vocabulary (rendered copy + docs/FAQ):** guaranteed return, dividend, shareholder, profit share, passive income, guaranteed yield, guaranteed appreciation, investor claim.

**Approved framing:** protocol revenue, protocol-controlled assets, treasury reserve, liquidity allocation, operations allocation, on-chain verification, transparent routing, use of funds, planned revenue source, pending module.

**Honest-numbers rule:** small verified numbers ship. No invented metrics. `$823 verified` beats `$5M unproven`.

**Final homepage order (overrides §1):**

1. Hero
2. Protocol Dashboard (ProtocolOverview — 4 headline KPIs anchor)
3. Revenue Sources (ProtocolRevenueEngine — LIVE vs PLANNED)
4. Revenue Allocation Engine (RoutingFlow — clickable nodes, live balances)
5. Current Protocol-Controlled Assets (TreasuryComposition + ProtocolStatusGrid)
6. Protocol Flywheel (new — static visual)
7. The Syndicate Opportunity (new — static copy, no benchmark numbers without source)
8. Treasury Intelligence (TreasuryComposition table — extended)
9. Use of Funds (new — Generated/Allocated/Spent/Remaining)
10. Transparency Snapshot (HomeTransparencySnapshot)
11. Registry / Contracts (teaser → /registry)
12. Final CTA + RiskDisclaimer

**Implementation scope (binding):** ProtocolRevenueEngine, UseOfFunds, ProtocolFlywheel, OpportunitySection (all new); extend ProtocolOverview / RoutingFlow / TreasuryComposition; reorder `index.tsx`; add UseOfFunds + glossary line to `/transparency`; minimal terminology pass on tokenomics + FAQ. No NFT, no Vault automation, no governance, no AI, no rankings, no gamification.

---

## 0. Audit Snapshot

What already exists and is live (verified against `src/`):

| Concern | Component(s) | Data source | Verdict |
|---|---|---|---|
| Hero / positioning | `Hero.tsx`, `TrustBar.tsx` | static copy | Re-frame, do not rebuild |
| Protocol KPIs | `ProtocolOverview.tsx` | `useLpStats`, `useWalletAssets`, `useCirculatingSupply` | Keep — extend with revenue KPI |
| Treasury composition | `TreasuryComposition.tsx` | `useWalletAssets(VAULT_WALLET)` | Keep |
| Capital routing | `CapitalAllocation.tsx`, `RoutingFlow.tsx` | Sale contract constants + balances | Consolidate to one canonical flow |
| Live sale + events | `LivePurchase.tsx`, `LiveActivityFeed.tsx`, `MiniExplorer.tsx` | `sale-hooks`, `activity-hooks`, `onchain-events` | Keep |
| Transparency | `TransparencyCenter.tsx`, `TransparencyReport.tsx` | derived from above | Keep, layer "Use of Funds" |
| Registry | `ContractDossiers.tsx` | `syndicate-config` | Keep |
| Pending modules | `VaultPolicyCore`, `QuestProgress`, `MembersLeaderboard`, NFT/Vault/AI routes | placeholder | Keep behind PENDING labels |

**Conclusion:** the protocol *data layer* is already AAA. The *narrative layer* on the homepage is fragmented. The refactor is 90% IA and copy, ~10% two new components (Revenue Engine, Use of Funds).

---

## 1. New Homepage Information Hierarchy

The home route (`src/routes/index.tsx`) will be reordered to tell one continuous story. Mockup below uses ASCII for clarity.

```text
┌──────────────────────────────────────────────────────────────┐
│  HERO — "An on-chain asset accumulation protocol."           │  ← reframed
│  Sub: revenue in → allocated → assets accumulated.           │
│  CTAs: [See the engine] [Verify on-chain] [Become a member]  │
├──────────────────────────────────────────────────────────────┤
│  §1  WHAT IS THE SYNDICATE                                   │  ← NEW (copy only)
│      3 lines · no hype · no return promises                  │
├──────────────────────────────────────────────────────────────┤
│  §2  PROTOCOL REVENUE ENGINE                                 │  ← NEW component
│      LIVE: Membership Sales                                  │
│      PLANNED: POL fees · Treasury deployment · NFT · …       │
├──────────────────────────────────────────────────────────────┤
│  §3  TOTAL PROTOCOL REVENUE GENERATED  (lifetime KPI)        │  ← NEW KPI
│      = Σ live, verifiable sources only                       │
├──────────────────────────────────────────────────────────────┤
│  §4  REVENUE ALLOCATION ENGINE  (70 / 20 / 10)               │  ← refactor RoutingFlow
│      every node clickable → wallet · balance · explorer      │
├──────────────────────────────────────────────────────────────┤
│  §5  CURRENT PROTOCOL ASSETS  (point-in-time)                │  ← refactor ProtocolOverview
│      Treasury · POL · Operations · Sale balance · SYN reserves│
├──────────────────────────────────────────────────────────────┤
│  §6  TREASURY INTELLIGENCE                                   │  ← extend TreasuryComposition
│      Asset · Amount · USD · Bucket · Source · PriceSrc · Status│
├──────────────────────────────────────────────────────────────┤
│  §7  LIQUIDITY DETAILS                                       │  ← LpStatusCard (kept)
├──────────────────────────────────────────────────────────────┤
│  §8  PROTOCOL SCOREBOARD                                     │  ← compact strip
│      Revenue · Assets · Members · Holders · Tx · Contracts   │
├──────────────────────────────────────────────────────────────┤
│  §9  TRANSPARENCY SNAPSHOT  → /transparency                  │  ← HomeTransparencySnapshot
├──────────────────────────────────────────────────────────────┤
│  §10 CONTRACTS  → /registry                                  │  ← compact dossier teaser
├──────────────────────────────────────────────────────────────┤
│  CTA STRIP — [Become a member] [Read whitepaper] [Verify]    │
│  RiskDisclaimer                                              │
└──────────────────────────────────────────────────────────────┘
```

### Mockup — §2 Revenue Engine

```text
PROTOCOL REVENUE ENGINE                                    [LIVE 1 · PLANNED 7]
─────────────────────────────────────────────────────────────────────────────
┌─ LIVE ─────────────────────────────────────────────────────────────────┐
│  ● Membership Sales            $X,XXX.XX cumulative   Sale contract ↗  │
│    Source: TokensPurchased event · Avalanche RPC                       │
└─────────────────────────────────────────────────────────────────────────┘
┌─ PLANNED ──────────────────────────────────────────────────────────────┐
│  ○ Protocol-Owned Liquidity Fees      Trigger: Vault contract deploy   │
│  ○ Treasury Deployment Revenue        Trigger: deployment policy v1    │
│  ○ NFT Revenue                        Trigger: NFT contract deploy     │
│  ○ Protocol Services                  Trigger: services launch         │
│  ○ Partner Revenue                    Trigger: first partnership       │
│  ○ Premium Access Revenue             Trigger: gated module live       │
│  ○ Future Protocol Products           Trigger: roadmap milestone       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mockup — §3 Total Protocol Revenue Generated

```text
┌──────────────────────────────────────────────┐
│  TOTAL PROTOCOL REVENUE GENERATED            │
│                                              │
│             $ X X , X X X . X X              │   ← sum of LIVE sources only
│                                              │
│  Membership Sales   $XX,XXX.XX               │
│  LP Fees            PENDING                  │
│  …                  PENDING                  │
│                                              │
│  Source: TokensPurchased · scanned every 60s │
└──────────────────────────────────────────────┘
```

### Mockup — §4 Allocation Engine (clickable nodes)

```text
              ┌────────────────────────┐
              │  Member Purchase (USDC)│
              └──────────┬─────────────┘
                         ▼
              ┌────────────────────────┐
              │ Membership Sale 0x00…2d│ ← click → registry dossier
              └──────────┬─────────────┘
            ┌────────────┼─────────────┐
       70%  ▼       20%  ▼        10%  ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │ Liquidity  │ │ Treasury   │ │ Operations │
   │ 0x…LP      │ │ 0x205D…464 │ │ 0x…ops     │
   │ bal: $X    │ │ bal: $X    │ │ bal: $X    │
   │ verify ↗   │ │ verify ↗   │ │ verify ↗   │
   └────────────┘ └────────────┘ └────────────┘
```

### Mockup — §6 Treasury Intelligence (table)

```text
Asset   Amount        USD Value   Bucket     Source Wallet  Price Source   Status
─────   ───────────   ─────────   ────────   ─────────────  ────────────   ──────
USDC    12,345.67     $12,345.67  Reserve    Vault 0x205D…  fixed $1       LIVE
AVAX     123.4500     PENDING     Reserve    Vault 0x205D…  oracle PENDING PARTIAL
BTC.b      0.5000     PENDING     Reserve    Vault 0x205D…  oracle PENDING PARTIAL
WETH.e     2.1000     PENDING     Reserve    Vault 0x205D…  oracle PENDING PARTIAL
SYN     1,000,000     $X,XXX.XX   Reserve    Vault 0x205D…  LP-derived     LIVE
```

### Mockup — §7 Use of Funds (NEW)

```text
USE OF FUNDS                                                source: on-chain
─────────────────────────────────────────────────────────────────────────────
Generated            $XX,XXX.XX     (Total Protocol Revenue Generated)
  ├─ Allocated
  │    Liquidity  70% $XX,XXX.XX    →  LP wallet  balance: $X,XXX
  │    Treasury  20% $XX,XXX.XX    →  Vault       balance: $X,XXX
  │    Operations 10% $XX,XXX.XX    →  Ops         balance: $X,XXX
  └─ Spent (outflows from allocation wallets)
       Development       PENDING (categorisation requires tagging)
       Infrastructure    PENDING
       Marketing         PENDING
       Other             $X,XXX.XX  (raw net outflow USDC, untagged)
Remaining Assets         $XX,XXX.XX  (current sum of allocation wallets)
```

Spent categories show `PENDING` until per-tx tagging exists. Raw net outflow is shown because it *is* verifiable today via `useUsdcFlows`.

---

## 2. Data-Source Mapping (every cell, every page)

| Metric | Hook / source | Status today |
|---|---|---|
| SYN price | `useLpStats` (Trader Joe reserves) | LIVE |
| Market Cap | price × circulating | LIVE |
| FDV | price × 1B | LIVE |
| Treasury USD | `useWalletAssets(VAULT_WALLET)` + LP-derived SYN price + USDC=$1 | PARTIAL (AVAX/BTC.b/WETH.e USD = PENDING) |
| LP TVL | `useLpStats` × 2 × USDC reserve | LIVE |
| Circulating supply | `useCirculatingSupply` (totalSupply − reserved wallets) | LIVE |
| Members | `useLivePurchaseEvents` → unique buyers | LIVE |
| Holders | derived first-seen from same stream | PARTIAL (no Transfer scan yet) |
| Transactions | count of indexed events | LIVE |
| Membership revenue (cumulative) | sum of `usdcAmount` from `TokensPurchased` | LIVE |
| LP fee revenue | Trader Joe Swap fees on pair | PENDING (requires fee math hook) |
| Allocation wallet balances | `useWalletAssets(<wallet>)` per node | LIVE for routing wallets |
| USDC flows in/out | `useUsdcFlows(wallet)` | LIVE |
| Spent categories | requires tx tagging registry | PENDING |
| Contract dossiers | `syndicate-config.CONTRACTS` | LIVE |

**Rule of rendering:** every cell renders one of `LIVE | PARTIAL | PENDING`. No value renders without a source label and explorer link.

---

## 3. Cross-Page Changes (minimal set)

| Page | Action | Why |
|---|---|---|
| `/` index | Reorder per §1; add Revenue Engine, Total Revenue KPI, Use of Funds | Story coherence |
| `/transparency` | Add Use of Funds module above the existing TransparencyReport | Single source of truth for spent vs remaining |
| `/tokenomics` | Add "Why SYN exists" paragraph + link to Revenue Engine | Close the narrative loop |
| `/registry` | No change | Already AAA |
| `/activity` | No change | Already AAA |
| `/liquidity` | Add link from §7 of home | Discoverability |
| `Header` nav | Add "Revenue" anchor → `/#revenue-engine` | Surface the new section |

No route deletions. No removed components. Pending modules (Vault, NFT, AI, Quests) keep their routes and remain explicitly `PENDING`.

---

## 4. New Components Required (2)

1. **`ProtocolRevenueEngine.tsx`** — renders LIVE vs PLANNED revenue source list. Reads cumulative membership revenue from existing `useLivePurchaseEvents`.
2. **`UseOfFunds.tsx`** — composes Generated / Allocated / Spent / Remaining using existing hooks (`useLivePurchaseEvents`, `useWalletAssets`, `useUsdcFlows`). No new RPC surface.

Existing components extended (not rewritten):
- `ProtocolOverview` → add "Total Protocol Revenue Generated" KPI tile.
- `RoutingFlow` → make every node a link to its dossier and show live balance.
- `TreasuryComposition` → add Bucket + Price Source + Status columns.

---

## 5. Copy & Legal Guardrails

Banned across the entire site: *guaranteed returns, dividends, shareholder rights, profit sharing, passive income, yield, appreciation, ROI promises.*

Approved vocabulary: *protocol-controlled assets, treasury reserves, protocol revenue, liquidity allocation, operational allocation, transparent routing, on-chain verifiable balances.*

A grep gate will be added to CI (follow-up) to fail builds containing banned terms.

---

## 6. Out of Scope (this proposal)

- Price oracle integration for AVAX / BTC.b / WETH.e (separate sprint).
- Tx-tagging registry for Spent categories (separate sprint).
- Holder set via full ERC20 Transfer scan (separate sprint — RPC-heavy).
- Visual redesign — current design system is preserved.

---

## 7. Acceptance Criteria

- Homepage section order matches §1 exactly.
- Every numeric cell has a source label and an explorer link OR shows `PENDING`.
- Zero banned terms in rendered copy.
- Zero deleted routes or components.
- All existing live integrations continue to function (Sale, LP, treasury reads, events).
- A first-time visitor can answer in <15s: *what it is, how revenue is made, where revenue goes, what assets it controls, why SYN, why join.*

---

**Next step:** approve this proposal (or request edits) and I will implement in one sprint: add `ProtocolRevenueEngine` + `UseOfFunds`, extend three existing components, reorder `index.tsx`, and update `/transparency` + `/tokenomics`. No other files touched.
