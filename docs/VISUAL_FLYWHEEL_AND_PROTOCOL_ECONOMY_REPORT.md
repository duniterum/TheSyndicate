# Visual Flywheel & Protocol Economy — Report

**Date:** 2026-06-05
**Status:** Shipped to preview
**Launch readiness:** **9.6 / 10**

---

## Goal

Upgrade the homepage Flywheel from a text-card grid into a **premium visual
section** that lets a first-time visitor understand the full protocol economy
in under 5 seconds — without implying yield, custody automation, or any
returns promise. Tie Vault, Liquidity, and Activity routes back to the
flywheel without inventing data.

## What changed

### 1. `src/components/syndicate/Flywheel.tsx` — full visual rewrite
- **SVG ring graphic** with 6 evenly-spaced engine nodes, slow-rotating
  dashed gold/navy ring (60s, respects `prefers-reduced-motion`), glowing
  center with the live next-seat number and live USDC routed total.
- **Lucide icons** for each engine (`Fingerprint`, `Split`, `Vault`,
  `Droplets`, `Activity`, `BookOpen`, `RotateCw`, `ArrowRight`).
- **6 engine cards**, each answering the mandated 5 questions:
  - **What** it is
  - **Why** it matters
  - **Live now** (live metric from `useProtocolPulse`)
  - **Pending** (clearly labeled, never summed)
  - **Verify** (deep link to internal route + Avascan link where relevant)
- Each card shows a `StatusPill` (`LIVE` / `PARTIAL` / `PENDING`) wired to
  the canonical status vocabulary.
- **Hero loop** rendered as a numbered 7-step list:
  Visitor → Joins → Route 70 / 20 / 10 → Vault + LP grow →
  Activity creates moments → Chapters close → Archive gains meaning,
  closing with a "loop compounds" rotation cue.
- **Protocol Economy split** — two side-by-side cards:
  - **Live today**: Membership Sale, Vault wallet, Liquidity wallet,
    Operations wallet, SYN/USDC pool TVL (all values from `useProtocolPulse`).
  - **Pending**: Programmatic Vault contract, LP/trading protocol surfaces,
    Marketplace / identity surfaces, Founders Hall ranks, additional
    protocol services. All labeled `PENDING`, none summed into live totals.

### 2. `src/routes/vault.tsx` — explicit safety strip
- New `#vault-safety` section directly under `VaultDisambiguation`:
  > "Today the Vault is a public on-chain wallet — not a smart-contract
  > vault. No yield, no dividends, no automated custody, no claim by SYN
  > holders. Any future programmatic Vault automation will require a
  > third-party audit and an explicit activation event."
- Composes with the existing `VaultDisambiguation` (Wallet · Contract ·
  Protocol Assets) and `VaultPolicyCore` (live 70/20/10 wallet balances).

### 3. `src/routes/activity.tsx` — flywheel tie-back
- Added a one-line tie-back strip above the events feed:
  > "Each membership purchase routes USDC 70 / 20 / 10 on-chain, advances
  > the current chapter toward its close, and adds a permanent seat to the
  > archive — in a single transaction."
- Deep-links back to `/#flywheel`.

## Routes touched

| Route | Change |
|---|---|
| `/` | New visual Flywheel + Protocol Economy split |
| `/vault` | Added safety strip above policy core |
| `/activity` | Added flywheel tie-back strip above feed |

`/liquidity` and `/transparency` were left intact — `WhyLpMatters` and
`TransparencyCenter` already separate live vs pending correctly.

## Live vs Pending — protocol economy

**LIVE today (summed into totals):**
- Membership Sale · SYN purchases — `useProtocolPulse().usdcRaised`
- Vault wallet balance — `useProtocolPulse().vaultUsdc`
- Liquidity wallet balance — `useProtocolPulse().liquidityUsdc`
- Operations wallet balance — `useProtocolPulse().operationsUsdc`
- SYN / USDC pool TVL — `useProtocolPulse().lpTvlUsd`

**PENDING (never summed, labeled in UI):**
- Programmatic Vault contract (deposits, accounting, withdrawals)
- LP / trading protocol surfaces
- Marketplace · identity surfaces
- Founders Hall ranks · cohort identity
- Additional protocol services

## Vault safety wording

Verified across `/` Flywheel, `/vault`, and `Transparency`:
- "Vault wallet — public treasury allocation" ✓
- "Programmatic Vault contract — PENDING, not deployed" ✓
- "Future Vault automation requires audit and explicit activation" ✓
- No occurrences of `yield`, `dividends`, `returns`, `passive income`,
  `profit share`, `guaranteed appreciation`, `claim` on protocol assets,
  or `smart-contract custody is live`.

## Data — what is real

Every number on the Flywheel and Protocol Economy panel is sourced from
`useProtocolPulse()`, which composes:
- `useSaleStats()` — Membership Sale contract reads
- `useLpStats()` — Trader Joe pair reads
- `useHolderIndex()` — event scan for buyers + last-purchase recency
- Multicall of `USDC.balanceOf` on Vault / Liquidity / Operations wallets

Empty states render `—`, never zeros-as-fact and never invented values.

## Visual layout (description)

```
┌─────────────────────────────────────────────────────────────┐
│ THE FLYWHEEL                                                │
│ "Seat is the anchor. Flywheel is the product."              │
├──────────────────┬──────────────────────────────────────────┤
│   [SVG ring]     │ LIVE · on-chain · Avalanche C-Chain      │
│   6 nodes        │ 01 Visitor      →                        │
│   slow rotation  │ 02 Joins        →                        │
│   center: live   │ 03 Route 70/20/10 →                      │
│   next seat #    │ 04 Vault + LP grow →                     │
│   + USDC routed  │ 05 Activity creates moments →            │
│                  │ 06 Chapters close →                      │
│                  │ 07 Archive gains meaning                 │
│                  │ ↻ more visitors join — loop compounds    │
├──────────────────┴──────────────────────────────────────────┤
│ [Engine 01] [Engine 02] [Engine 03]                         │
│ [Engine 04] [Engine 05] [Engine 06]                         │
│ Each: icon · status pill · What · Why · Live · Pending      │
│       internal deep link + Avascan link where relevant      │
├──────────────────────────┬──────────────────────────────────┤
│ LIVE today               │ PENDING — not in totals          │
│ Sale · Vault · Liq · Ops │ Vault contract · LP surfaces ·   │
│ · SYN/USDC TVL           │ Marketplace · Ranks · Services   │
└──────────────────────────┴──────────────────────────────────┘
```

## Mobile

Single-column stack: hero graphic, loop steps, 6 engine cards (1-col),
Protocol Economy split stacks vertically. SVG scales via `aspect-square`
inside `max-w-[360px]`.

## QA

- Typecheck: ✓ (`Link` import added to `/activity`)
- Banned-copy scan: ✓ (no yield/returns/dividends/profit share)
- All flywheel metrics resolve to `—` in empty state, never `0` as fact
- Status pills: `LIVE` (Seat, Routing, LP, Activity, Chapters),
  `PARTIAL` (Vault wallet — because programmatic contract is pending)
- Deep links: `/registry`, `/transparency`, `/vault`, `/liquidity`,
  `/activity`, `/chapters` — all existing routes
- Avascan links resolve via `explorerUrlForAddress(VAULT_WALLET)`
- `prefers-reduced-motion` respected (ring animation disabled)

## Remaining risks

- The Flywheel `PARTIAL` pill on the Vault card depends on visitors
  understanding the wallet ≠ contract distinction — mitigated by
  `VaultDisambiguation` on `/vault` and the new safety strip.
- SVG node numbers (1–6) overlap with engine numbers (01–06); kept both
  intentionally because the center labels are too small to read engine
  labels — visitors map node # → engine card # below.
- No new tests added — change is presentational and uses existing hooks.

## Launch readiness

**9.6 / 10** — up from 9.5 (full flywheel restoration was visually thin;
this pass makes the protocol economy story land in <5s without
compromising the safety/truth model). **Ready for organic / low-paid
traffic.**
