---
name: genesisOffset 333 floor (Model 2 — lower floor REMOVED)
description: Post-Model-2 truth about genesisOffset bounds, what 333 still means, and what enforces the "Era II opens at #334" invariant.
---

# 333 after Model 2 — NOT a deploy floor anymore; only a chapter boundary + range gate

**Ratified change (Model 2):** the constructor LOWER floor was REMOVED. `genesisOffset`
may now be ANY real V1 unique-member count in `[0, FINAL_SEAT)`. The only constructor
revert is the upper bound: `if (genesisOffset >= FINAL_SEAT) revert BadGenesisOffset();`
(`FINAL_SEAT = 1_000_000`). A sub-333 V1 handoff IS deployable: V2 then CONTINUES selling
the remaining Genesis seats at Era I pricing (100 SYN/USDC, $5 min) from seat
`genesisOffset + 1`, and **Era II still opens at seat #334**.

**What 333 still is:** `GENESIS_END = 333` is retained as the Genesis ceiling for
(a) reserve math and (b) the Era I→II boundary in the era table. It is NO LONGER a
constructability gate.

**The invariant that replaced the old SECONDARY lock — Genesis is RANGE-bounded:**
the OLD secondary block (`addrCaps[0]=0 < $5` → `BadEraCaps`, which incidentally blocked
sub-333 deploys) is gone for Model 2 because:
- the constructor now special-cases `e == 1`: it FORCES `eraSynCap[1] = type(uint256).max`
  and SKIPS the per-era cap-fit check for Era I. `eraCaps[0]` is IGNORED (pass 0).
- it KEEPS `addrCaps[0] >= eraMin` and `maxUsdcPerTx >= eraMin`.
- **Why max-cap is mandatory, not cosmetic:** repeat buys + recognized-V1 buys grow
  `soldInEra[1]` WITHOUT advancing `memberCount`. A FINITE `eraCaps[0]` could exhaust →
  `_syncEra` would advance to Era II BEFORE #334, mispricing Genesis seats. Forcing the
  Genesis aggregate cap non-binding means Genesis advances to Era II ONLY by the range
  check (`memberCount >= 333`), never by cap exhaustion. (Architect raised this as a HIGH;
  the max-cap sentinel resolved it.)
- Anti-whale for Genesis under Model 2 = `addrCaps[0]` ($5 = one seat) + the 333 ceiling
  + the reserve floor + funded inventory. There is NO Genesis aggregate SYN cap.

**Recommended path unaffected:** when V2 starts in Era II+ (`genesisOffset >= 333`,
`startEra >= 2`) the `e == 1` branch never runs; that pause-at-333 path is byte-for-byte
unchanged. Eras II–IX keep their finite §Q SYN cap-fit validation.

**Still narrative / derived (enforce nothing):** chapters.ts (`endN/capacity=333`,
`isFounder<=333`), eras.ts display, Holder Index cohort labels, frontend surfaces
("seals at #333", "/333"), canon doctrine — pure functions of member number, break at no count.

**The ONE irreversible gate is no longer 333 — it is `FINAL_SEAT` + identity:** lowering/raising
the Era boundary or `FINAL_SEAT` is a contract edit = governance, not a launch tweak. But
launching V2 below 333 is now a ratified, supported config, not an unfreeze.

**Doc sync:** param sheet / sim / architecture all now document `eraCaps[0]` as IGNORED
(range-bounded), NOT "≈208,125 SYN cap" (that earlier recommendation was superseded by the
range-bounded fix). If you see a 208,125 / 248,125 Genesis-cap figure anywhere, it is stale.
