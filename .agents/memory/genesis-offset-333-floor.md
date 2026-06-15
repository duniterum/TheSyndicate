---
name: genesisOffset 333 floor
description: Why "genesisOffset >= 333" is a hard SaleV2 deploy floor, what enforces it, and what does NOT.
---

# The 333 floor — narrative number, hard-coded as a technical gate

**Rule:** `SyndicateSaleV2` is un-constructable unless `genesisOffset ∈ [333, 999_999]`.
Minimum safe V1 unique-member count before V2 can exist = **exactly 333**.

**Enforced in EXACTLY one place (plus one redundant lock):**
- PRIMARY: constructor — `if (genesisOffset < GENESIS_END || genesisOffset >= FINAL_SEAT) revert BadGenesisOffset();`
  with `GENESIS_END = 333`, `FINAL_SEAT = 1_000_000`.
- SECONDARY (same outcome): `startEra = _eraIndexForSeat(genesisOffset+1)`. If `genesisOffset < 333`, seat ≤ 333 →
  `startEra = 1` (Genesis), and the constructor era-cap loop then reverts `BadEraCaps` because the frozen
  `addrCaps[0] = 0 < $5` (Era I min). So even bypassing the primary check, deploy still fails.

**What does NOT require 333 (all narrative / derived — enforce nothing):** chapters.ts (`endN/capacity=333`, `isFounder<=333`,
explicitly "NOT contract-driven"), eras.ts display, Holder Index cohort labels, ~20 frontend surfaces (Hero "seals at #333",
members.tsx "/333", milestone trackers), canon doctrine. These are pure functions of member number and break nothing at any count.

**What actually breaks if Genesis closes < 333:** ONLY that V2 cannot be deployed. Snapshot/Merkle of <333 is cryptographically
valid; Holder Index/chapters/identity/frontend all function; **V1 keeps running**. 333 blocks the *existence of V2*, nothing else.

**Why this matters / how to apply:** When asked "is 333 a real blocker or just a milestone?" the answer is BOTH — origin is
doctrine, enforcement is hard+absolute *under the freeze*. The ONLY lever to launch V2 below 333 is editing GENESIS_END / the era
table / the constructor = unfreezing the contract = a governance act, NOT a launch-path tweak. Do not propose "launch V2 earlier"
as a launch option. Overflow (>333) is deployable but causes minor Era-II positional accounting drift (Era II SYN cap doesn't
subtract SYN already sold to seats 334..current at the Genesis rate); closing at exactly 333 is the only zero-drift handoff.
