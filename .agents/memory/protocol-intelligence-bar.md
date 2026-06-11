---
name: Protocol Intelligence Bar pricing + status doctrine
description: Why the global metrics ticker uses the fixed access rate (not LP spot) for market cap/FDV, and never a blanket LIVE pill.
---

The Protocol Intelligence Bar is a compact, horizontally-scrollable metrics ticker mounted globally in `PageShell` (between Header and IdentityRibbon), so it shows on every page including the homepage.

## Reference price = fixed access rate, NOT LP spot
"SYN Reference Price", "Reference Market Cap", and "FDV" all derive from `ACCESS_RATE_USDC_PER_SYN` ($0.01, the protocol-set access rate), **not** from `synPriceUsd` (the LP-implied spot price, which also exists in the truth layer).
- Reference Market Cap = reference price × circulating supply.
- FDV = reference price × total supply (= $10,000,000 at 1B supply).

**Why:** "reference" framing keeps these legal-safe — a fixed protocol rate is not a market/traded price and implies no ROI/yield/scarcity value. Using the live LP spot would read as a market valuation / price signal.

**How to apply:** do NOT "improve" market cap / FDV to use `synPriceUsd`. The LP spot belongs only to LP/liquidity surfaces, labeled "SYN Spot". Never display "USDC raised" anywhere — the label is "USDC Routed".

## Status pill must reflect real fact state
The bar's `StatusPill` is derived from aggregate fact presence (LIVE only when every displayed read resolves; PENDING when none; PARTIAL while filling or on a degraded/error read) — never a hardcoded `status="LIVE"`.

**Why:** doctrine — every public claim is on-chain or labeled PENDING. A blanket LIVE over a possibly-PENDING cell is the exact pattern already flagged against LivePulseStrip's "Live Protocol Pulse".

## Data sourcing
Read facts from `useProtocolTruth` (wallets, LP TVL, SYN sold, USDC routed, members, chapter) + `useSynSupply`/`useCirculatingSupply` (total/circulating/burned) — same hooks as `SupplyTruthLine`, so wagmi dedupes the reads. Burn appears as the "Burned Supply" metric carrying the "Proof of Fire" flame badge (category "Founder Burn"), linking to /activity.
