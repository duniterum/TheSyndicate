---
name: Supply & burn visibility surface
description: How SYN supply/circulating/burned are surfaced and the burned-metric computation doctrine
---

SupplyTruthLine is the ONE reusable surface for the supply/burn truth a crypto-native
reads in <30s. It mounts in the homepage pulse strip (gated `!embedded` so the
/my-syndicate cockpit embed never shows it), on `/tokenomics`, and the join contract
panel + transparency (VerifyEverything) carry the same claim as plain copy/rows.

**Burned = balanceOf(the standard dead address), NOT (initialSupply − totalSupply).**
`useSynSupply` reads BOTH `totalSupply()` and `balanceOf(SYN_BURN_ADDRESS = 0x…dEaD)`;
`burned` is the dead-address balance.
**Why:** The Syndicate's burns are TRANSFERS to the dead address, not contract `burn()`
calls — so `totalSupply` stays fixed at 1,000,000,000 and the 1B−totalSupply "gap" is
always 0. A real burn happened (Proof of Fire #001: Founder wallet → 0x…dEaD = 1,000
SYN, tx 0x2db1…2d47, block 87,703,847). Computing burned as 1B−totalSupply reads 0 and
HIDES the real burn — that was the earlier mistake, now corrected.

**Circulating subtracts burned.** The burned 1,000 SYN left the Founder allocation
wallet (so `reserved` dropped) and now sits at the dead address inside `totalSupply −
reserved`. `useCirculatingSupply` computes `totalSupply − reserved − burned` (and
`nonCirculating = reserved + burned`) so burned SYN is never counted as "in public hands."

**No NEW taxonomy for the burn.** Do NOT add a `ProtocolEventKind` for it — that union
is literally called "taxonomy" in code (NotificationBell/ActivityHeartbeat have
exhaustive `Record<ProtocolEvent["kind"]>` + protocol-awareness.test.ts), and the
founder forbids new taxonomy. Proof of Fire #001 is surfaced as a PINNED recognition
card (`ProofOfFireCard` on /activity), sourced from the `PROOF_OF_FIRE_001` constant in
syndicate-config — guaranteed visible, zero ripple into the event taxonomy.

**Legal-safe wording only.** Allowed: verified supply reduction, standard burn/dead
address, Proof of Fire, Founder Burn, permanently sent. FORBIDDEN: price impact, pump,
ROI, yield, burn rewards, guaranteed scarcity value, buyback, financial return. There
is no AUTOMATED burn — say "manual, verifiable transfer (no automation)," never imply a
running burn mechanism.

**How to apply:** any future supply/burn surface reuses SupplyTruthLine + the
`synBurned`/`circulating` registry keys (both dead-address-balance based) and the
`PROOF_OF_FIRE_001` constant — never reintroduce the 1B−totalSupply derivation, and
never invent a new tile/status/event-kind for a burn.
