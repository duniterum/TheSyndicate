---
name: Economic truth — rank basis, wallet identities, burn, mock constants
description: Hard economic facts from syndicate-config.ts + holder-index.ts that recur in every revenue/rank/treasury audit. Verify against code before quoting; these are the drift-prone ones.
---

# Economic truth (syndicate-config.ts + holder-index.ts)

- **Rank basis = cumulative USDC (purchase history), monotonic.** Production
  rank is `rankForUsdc(existing.cumulativeUsdc)` in `holder-index.ts` (and
  `og-data.server.ts`). So **$160 in one buy == $160 across many buys** — rank
  is recognition only, never balance-based, never decreases if SYN is sold.
  `rankForSyn(synBalance)` exists but is used ONLY in `src/labs/**` + `quest-hooks`
  (quarantined). Don't let "balance" framing leak into production rank copy.
- **12 rank tiers** (`RANKS_V2`): Citizen $5 · Scout $10 · Operator $25 · Builder
  $50 · Strategist $75 · Vanguard $100 · Architect $250 · Patron $500 · Council
  Candidate $1,000 · Council $2,500(manual) · Inner Circle $5,000(manual) ·
  Cornerstone $10,000(manual). Rate fixed 1 SYN = $0.01.
- **"Vault Wallet" (70% USDC) and "Vault Reserve" (25% SYN) are the SAME
  on-chain address** `0x205DdC8921A4C60106930eE35e1F395c8D13f464`
  (`CONTRACTS.VAULT_WALLET` === `TREASURY_WALLET_ADDRESS`). Glossary treats them
  as distinct *concepts* but they are one wallet — a real transparency/drift trap.
- **No AUTOMATED burn mechanism, but a real burn HAS happened.** SYN spec has
  `futureMint:false` and no contract burn fn — burns are TRANSFERS to the
  standard dead address `SYN_BURN_ADDRESS = 0x…dEaD` (constant in
  syndicate-config). Proof of Fire #001 = a manual Founder Burn of 1,000 SYN →
  dead (tx 0x2db1…2d47, block 87,703,847). `burned` is a LIVE metric =
  `balanceOf(0x…dEaD)` — NOT 1B−totalSupply (transfer-burns keep totalSupply
  fixed at 1B). The Trader Joe LP `Burn` event is **liquidity removal**, a
  different thing. See supply-burn-visibility.
- **Circulating supply IS computed** (`treasury-hooks.ts useCirculatingSupply`:
  circulating = total − reserved wallets − burned; `nonCirculating = reserved +
  burned`).
- **Mock/stale constants (never surface as live):** `VAULT_ASSETS`,
  `VAULT_INFLOWS` (all status PENDING, fabricated balances), `GENESIS_NFT_PRICE`
  = "$1 – $10" (WRONG — First Signal mints at 0.50 USDC), `VAULT_STARTING_VALUE`,
  `NEXT_MILESTONE_VALUE`, `CURRENT_EPISODE`.
- **Live contracts:** SYN `0xC1Cf…0170` · USDC `0xB97E…a6E` · Membership Sale
  `0x0020Df…842d` (deploy block 87,157,852) · LP pair (TraderJoe v1 SYN/USDC)
  `0xe124…9389` · Archive1155 `0xB2AE…D54d` (deployed 2026-06-06, validating).
  **PENDING:** SeatRecord721 (null), CommissionRouter (none), Programmatic Vault.
- **Revenue streams:** 70/20/10 split is **Membership-Sale only**. Archive mint
  proceeds (First Signal 0.50, Patron Seal 5.00) → Archive1155 owner wallet, NOT
  the 70/20/10 split. LP fees → the LP position. (See revenue-routing-by-stream.)
