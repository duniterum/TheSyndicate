---
name: Sale V2 live Genesis per-address cap ($5) vs purchase UI
description: Why on-chain buys >$5 revert AddressEraCapExceeded during Genesis, and the lawful fix direction.
---

# Sale V2 is in Genesis (Era I) with a ratified $5 / address cap

The live Sale V2 enforces a per-address, per-era cumulative USDC cap
(`maxUsdcPerAddressPerEra[era]`, written ONLY in the constructor from
`deploy-params.json`'s `addrCaps`). Era I (Genesis) = **$5** (`addrCaps[0]`).
Eras II–IX ramp $1k → $25k. The $5 is **deliberate, ratified** ("J3 per-era
address-cap ramp"); the contract comment says literally *"$5 = one seat"* — the
Genesis anti-whale rule is **one minimum seat (500 SYN) per wallet**.

`buy()` checks `usdcByAddressEra[sender][era] + usdcIn > addrCap` and reverts
**`AddressEraCapExceeded(uint256)` (selector `0xafc664e8`)** — and it does so
BEFORE the USDC `transferFrom`. So any amount > $5 in Genesis reverts atomically
with **zero funds moved** (only gas). A wallet that already spent its $5 cannot
buy again at all that era. `quote()` does NOT model the cap, so quotes for
$10/$25/$75 look fine — the cap only bites in `buy()`.

**The actual defect is a UI↔contract mismatch, NOT a contract bug.** The purchase
UI (`LivePurchase.tsx` presets $5–$75 + custom + a rank ladder to Cornerstone)
never reads `maxUsdcPerAddressPerEra` / `usdcByAddressEra`, so it lets users pick
amounts guaranteed to revert during Genesis. `sale-hooks.ts` doesn't surface
those reads either.

**Why this matters / how to apply:**
- There is **NO setter** for the cap (only constructor). Raising the Genesis cap
  ⇒ **redeploy a new Sale V2** (+ re-fund SYN, re-snapshot V1, re-point the
  frontend). Never assume an owner tx can change it.
- Doctrine = code/on-chain outranks docs ⇒ the lawful minimal fix is to make the
  **UI conform to the live era cap** (read it, clamp input, gate presets, label
  "Genesis = one $5 seat; larger allocations open in Era II"), not to fight the
  contract.
- Funds are safe by construction (cap check precedes transferFrom). A granted
  USDC allowance after a failed buy is harmless (permission, not a transfer).
- Build is irrelevant: same hardcoded V2 address in dev & prod; rebuilding the
  current frontend does NOT fix it.
