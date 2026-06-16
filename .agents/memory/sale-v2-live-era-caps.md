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

## Founder intent SUPERSEDES the UI-clamp workaround (ratified)
Founder intent = $5 Genesis MINIMUM + one seat/wallet + members may buy LARGER
packages after joining + cumulative recognition continues + package ladder LIVE.
Under that intent the "make UI conform to the $5 cap" minimal fix is NO LONGER
acceptable — clamping to $5 defeats two of the five intents. **There is no
remaining reason to keep the $5 per-address cap:** one-seat is enforced by IDENTITY
(`firstSeat = !knownMember`), not by dollars, so the $5 cap is redundant for
one-seat and actively blocks the ladder. Keep $5 ONLY as `minUsdc6` (the entry
floor), never as the per-address ceiling. Fix = redeploy with `addrCaps[0]`
non-binding: recommended `$25,000` (== `MAX_USDC_PER_TX`; covers the whole
published ladder, top tier Cornerstone = $10k, with headroom + an auditable
ceiling); alternative `type(uint256).max` (fully unthrottled, matches "dollar
volume is DESIRED" + the eraCaps[0]-ignored symmetry). Genesis anti-abuse without
the $5 cap stays intact: one-seat identity + per-tx $25k + reserve floor
(reserveThroughSeat=10000 ≈ 3.93M SYN) + funded inventory + the 333-seat range.

## Redeploy AFTER V2 is already live — migration continuity mechanics
The live deploy used genesisOffset=2 (V1's 2 members) and has since sold V2 seats,
so a corrected redeploy (call it V2b) is a CONTINUATION, not a fresh start:
- **New genesisOffset = V2a.memberCount() read at the V2a pause block.** V2a's
  memberCount was seeded to its genesisOffset and increments per firstSeat, so at
  pause it already equals the total unique V1+V2a members — that exact number is
  the new offset (cross-check against the event-scan count). Do NOT reuse 2.
- **The prior-member Merkle root MUST cover V1 + V2a addresses** (not just V1), or
  existing members buying on V2b get a NEW (duplicate) seat. Re-run the canonical
  pipeline (export-members → gen-root → validate-snapshot) with the cutoff = V2a
  pause block, scanning BOTH MEMBERSHIP_SALE (V1) and V2a `Purchased` events.
- **One-seat continuity still depends on the frontend always submitting the
  member's proof** in buy() (the documented V1-no-proof double-count applies to
  V2a members on V2b too) — regenerate the client proof set from the new snapshot.
- **Rank/recognition continuity is automatic** — rank = cumulative USDC summed
  off-chain by the Holder Index across ALL sale contracts; there is NO on-chain
  rank store to migrate. Continuity = add V2b to the holder-index scan set
  (V1 + V2a + V2b); keep V2a in the scan for history.
- **Funding:** constructor pulls no SYN; fund V2b post-deploy ≥ its live reserve
  floor (~3.93M SYN at reserveThroughSeat=10000) and keep it above the floor while
  open. Total distributed across V1+V2a+V2b must stay ≤ the Membership Distribution
  allocation (Model B ~248M of the 350M pool); V2a's unsold SYN is recoverable to
  the Vault only via the 14-day RECOVERY_TIMELOCK after pause.
- **Rollback = staged cutover:** deploy+fund+verify V2b BEFORE repointing the
  frontend. If V2b fails verify-deploy, never repoint (V2a stays active). If a
  defect appears after repoint, revert the config to V2a (instant, one-line). Run a
  forked-mainnet full rehearsal of pause→snapshot→deploy→fund→repoint→buy→rollback
  first (no Fuji). All else byte-identical to V2a (same audited source, eraCaps,
  minUsdc6, 70/20/10 wallets, 14-day timelocks, initialRouter=0).
