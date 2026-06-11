---
name: Supply & burn visibility surface
description: How SYN supply/circulating/burned are surfaced and the burned-metric computation doctrine
---

SupplyTruthLine is the ONE reusable surface for the supply/burn truth a crypto-native
reads in <30s. It mounts in the homepage pulse strip (gated `!embedded` so the
/my-syndicate cockpit embed never shows it), on `/tokenomics`, and the join contract
panel + transparency (VerifyEverything) carry the same claim as plain copy/rows.

**Burned is one on-chain read, not two.** `useSynSupply` returns
`burned = max(SYN_INITIAL_SUPPLY(1,000,000,000) − totalSupply(), 0)`.
**Why:** SYN is ERC20-Burnable, and `burn()` lowers `totalSupply()`, so the supply gap
IS the burn. We deliberately do NOT add a `balanceOf(0x…dEaD)` read — that would be a
second source and conflate "parked at a dead address" (still in totalSupply) with
"burned from supply." Keeping it derived from the single `totalSupply()` read makes
every claim map to exactly one auditable on-chain number.

**Burn must read LIVE 0 — never PENDING, never a new status.** No burn mechanism runs
today, so `burned` resolves to `0` and the copy is "no burn mechanism active." This is
the honest current state, not a missing primitive. `undefined` only while the read is
loading.

**How to apply:** any future supply/burn surface should reuse SupplyTruthLine + these
registry keys rather than inventing a new tile or a new TruthStatus. If a real burn
mechanism ever ships, `burned` starts moving on its own — no code change needed beyond
copy that no longer says "not active."
