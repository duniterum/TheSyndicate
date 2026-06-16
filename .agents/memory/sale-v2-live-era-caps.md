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

**Doctrine vs mismatch (reconciliation):** the $5 value is NOT a random
placeholder — it is the ratified anti-whale param for a Model-2 (sub-333) deploy
("flat one-seat Genesis = tightest anti-whale", FINAL_DEPLOY_PARAMETER_SHEET §8).
The RECOMMENDED path was pause-V1-at-#333 / `genesisOffset=333`, where V2 starts
at Era II and `addrCaps[0]` is UNUSED — there the package/rank menu ($10–$1k)
works because Era II's addr cap is $1,000. The LIVE deploy used `genesisOffset=2`
(Model 2), which makes $5 binding for the whole Genesis-continuation (#3–333).
FOUNDER_DECISION_REPORT: "Genesis … sits at $5/500 SYN and is NOT part of any V2
decision" — the package/rank economics are an **Eras II–IX** feature (addr caps
$1k→$25k). The app's OWN doctrine (`eras.ts`) already says only Era I is LIVE and
Eras II+ are "PROPOSED FUTURE … not live." So the real defect is **sequencing**:
the buy UI presents the Eras-II+ package/rank menu as purchasable during Era I.
Contract is correct; UI is out of sequence. Making >$5 buyable NOW in Genesis
requires a REDEPLOY (new addr cap) — no setter, frontend can't raise it, and the
contract only auto-advances to Era II organically at seat #334.

**Corrected founder intent (ratified) + contract already supports it:** intent =
Era sets the MINIMUM entry ($5 Genesis), but a member may then buy MORE/larger
packages anytime; "one seat per wallet" is IDENTITY only, NOT "$5 total per
wallet"; high-conviction buys wanted NOW, not gated to seat #334. The V2 code
ALREADY separates these into independent mechanisms: minimum = `minUsdc6`
(`BelowEraMinimum`); cumulative ceiling = `maxUsdcPerAddressPerEra`
(`AddressEraCapExceeded`); per-tx = `MAX_USDC_PER_TX`; and one-seat identity =
`firstSeat = !knownMember[sender]` (repeat buys deliver SYN + raise
usdcContributed/rank but issue NO new seat). So the defect is PURELY that Era I's
`addrCaps[0]` was sized == the $5 minimum, collapsing min and max. Fix = redeploy
a corrected Sale V2 (SAME audited code) with `addrCaps[0]` high/non-binding
(e.g. = MAX_USDC_PER_TX $25k); **no Sale V3 needed** — the min/cap/identity split
already exists. Anti-abuse for Genesis = one-seat (knownMember) + per-tx +
funded-inventory/reserve floor; dollar volume is DESIRED, not throttled. PRACTICAL:
large Genesis buys need SYN funded ABOVE the reserve floor (top-ups allowed).
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
