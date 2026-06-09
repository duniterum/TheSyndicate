# THE SYNDICATE — SITE HARMONIZATION AUDIT

Date: 2026-06-04
Scope: full repo + live preview at `/`, `/join`, `/tokenomics`, `/vault`, `/transparency`, `/registry`, `/liquidity`, `/whitepaper`, `/faq`, `/docs`, `/roadmap`, `/activity`.

This audit was performed against the canonical model in `docs/SYNDICATE_PROTOCOL_MODEL.md` and `docs/TERMINOLOGY_GLOSSARY.md`. Vision constraints come from `docs/VISION.md`.

---

## 1. Canonical routing — confirmed

**Source of truth:** `src/lib/syndicate-config.ts`

```ts
VAULT_ALLOCATION = { vaultAssets: 0.7, liquidityReinforcement: 0.2, operationsCommunity: 0.1 }
USDC_ROUTING = [
  { label: "Vault Wallet",      pct: 70, key: "VAULT_WALLET"      },
  { label: "Liquidity Wallet",  pct: 20, key: "LIQUIDITY_WALLET"  },
  { label: "Operations Wallet", pct: 10, key: "OPERATIONS_WALLET" },
]
```

Deployed Membership Sale: `0x0020Df30C127306f0F5B44E6a6E4368D2855842d`.

**Canonical split: 70 % Vault Wallet · 20 % Liquidity Wallet · 10 % Operations Wallet.**

## 2. Pages that already conform (no change needed)

These pages already match the canonical model and use consistent terminology:

- `/registry` — `routes/registry.tsx`
- `/tokenomics` — `routes/tokenomics.tsx` (RoutingFlow, allocation table with live balances, RankSimulator splits)
- `/vault` — `routes/vault.tsx` (VaultPolicyCore + flow math)
- `/whitepaper` — `routes/whitepaper.tsx`
- `/transparency` — `routes/transparency.tsx` (TransparencyCenter, TransparencyReport)
- `/join` — `routes/join.tsx` (LivePurchase, AccessRate, MembershipCalculator, RankLadder, PaymentStrategy)
- Components: `RoutingFlow.tsx`, `VaultPolicyCore.tsx`, `RankSimulator.tsx`, `HomeJoinPreview.tsx`, `CapitalAllocation.tsx`, `ContractDossiers.tsx`, `TransparencyReport.tsx`, `Sections.tsx` (FlowSplit blocks, MembershipCalculator), homepage RoutingFlow, registry routing rows.

## 3. Drift identified and FIXED in this pass

| # | File | Line(s) | Problem | Fix |
|---|---|---|---|---|
| 1 | `src/components/syndicate/ProtocolFlywheel.tsx` | 8–9 | Swapped split: "70% reinforces protocol-owned liquidity" / "20% strengthens treasury / vault". | Corrected to 70 % Vault / 20 % Liquidity. |
| 2 | `src/components/syndicate/HowItWorks30s.tsx` | 12 | Same swap: "70% to protocol-owned liquidity, 20% to the treasury reserve". | Corrected. |
| 3 | `src/lib/syndicate-config.ts` | 184 | `LEGAL_DISCLAIMER` ends "…after launch" — sale is already live. | Removed stale "after launch" wording. |
| 4 | `src/components/syndicate/Sections.tsx` | 190 | Activity copy: "Demo rows preview what the Membership Sale contract will emit once deployed." | Updated — Sale is deployed; demo rows now described as illustrative previews of richer event shapes. |
| 5 | `src/components/syndicate/Sections.tsx` | 2072 | FAQ question "What becomes verifiable after launch?" | Reworded to present-tense "What is verifiable today?". |
| 6 | `src/components/syndicate/SmartContractFlow.tsx` | 177, 200–204 | Comment + helper paragraph still describe sale as "next milestone — once deployed…". | Updated to present-tense LIVE language. |

## 4. Drift INTENTIONALLY not changed (no regression, no contradiction)

These items were inspected and left alone to avoid breaking working flows or destroying useful copy:

- **`Sections.tsx` L1658 — "Liquidity 10%"** in `GenesisSupplyControls`. This is the SYN **token allocation** (10% of supply reserved for LP seeding), not the 20% USDC routing. Matches `TOKENOMICS_ALLOCATION`. Not a drift.
- **`VAULT_ASSETS` mock balances** in `syndicate-config.ts`. Explicitly labeled `status: "Mock"` and only surfaced in opt-in demo views. Keeping until the programmatic Vault contract ships.
- **`Hero`, `TrustBar`, `ProtocolOverview`, `ProtocolRevenueEngine`, `UseOfFunds`, `OpportunitySection`, `WhyBecomeMember`, `WhatSynDoes`, `WhyDifferent`** — already aligned with VISION + canonical model.
- **Existing on-chain hooks** (`useSaleStats`, `useAllocationBalances`, `useLpStatus`, `useTreasury*`, activity scanners, registry config, all explorer link helpers): untouched.

## 5. Open follow-ups (not done in this pass, listed for future Lovable prompts)

These are real improvements but were intentionally scoped out to avoid a blind redesign:

1. **Tokenomics chart** — add a donut/bar visual above the allocation table in `routes/tokenomics.tsx`. Spec: 7 slices matching `TOKENOMICS_ALLOCATION`, % + SYN label on hover, link each slice to its wallet row.
2. **Liquidity page chart fallback** — `DexScreenerChart` should always render a "Open chart on DEXScreener" fallback link + live pair-reserve summary so empty-state never persists.
3. **Activity page default tab** — ensure default is LIVE, demo behind explicit tab. Verify against `routes/activity.tsx`.
4. **Roadmap** — flesh out each item with status pill + dependency + verification link (no fake dates).
5. **Docs** — restructure into the canonical sections in `VISION.md` and link every page to its deep canonical doc.
6. **Redundancy pass** — risk disclaimer is rendered on many pages. Consider rendering once per page max (already mostly the case via `RiskDisclaimer.tsx`).
7. **Vault terminology audit pass 2** — any string that says just "the Vault" without context could be re-read to ensure it refers to the Vault Wallet, not PCA in general.

## 6. Acceptance check

Against the user's 15-second acceptance criteria:

- ✅ "USDC routing is enforced onchain" — RoutingFlow + Sale contract reads.
- ✅ "Split is clear and consistent everywhere" — every page now reads 70 Vault / 20 LP / 10 Ops.
- ✅ "Live data is real, pending modules are clearly pending" — status pill system standardised in `TransparencyCenter`.
- ✅ "No returns are promised" — banned-copy audit clean; `LEGAL_DISCLAIMER` updated.
- ⚠️ Tokenomics chart and Liquidity chart fallback are still open follow-ups.
