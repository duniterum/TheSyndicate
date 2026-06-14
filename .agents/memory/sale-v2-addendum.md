---
name: Sale V2 economic/security addendum doctrine
description: Durable design decisions for the FUTURE Sale V2 contract (per-era caps, timelock, no-oracle, honest "First Million"). Draft-only; not deployed.
---

Sale V2 lives ONLY as a design doc (`docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md`)
+ a draft `docs/proposals/drafts/SyndicateSaleV2.draft.sol`. The doc's §L embeds
the `.sol` **verbatim** — they must stay byte-identical (verify with a fenced-block
diff before claiming "in sync"). Hard constraints on all Sale V2 work: no deploy,
no Sale V1 change, no `src/` change, no funds moved.

## Per-era SYN sold-cap (the central ruling)
Cap `soldInEra[e]` against ONE global SYN balance — **not** physical per-era buckets.
**Why:** buckets add rollover/stranded-inventory complexity; a sold-cap bounds
cheap-early-era distribution just as well. Unsold era capacity simply remains in the
global pool for later eras.
**How to apply:** the aggregate `eraSynCap[e]` is the ONLY anti-whale throttle a
Sybil swarm of many wallets cannot bypass (the per-address cap IS bypassable). Keep
all three caps: per-tx, per-address-per-era, aggregate-per-era.

## Seat number no longer fixes price (the honest tradeoff)
With a cap that can be exhausted early, the era advances before its member range
fills → member ranges become **ceilings, not exact price brackets**. `src/lib/eras.ts`
is therefore a **positional preview**, NOT the executable pricing truth for V2.
**How to apply:** drive any V2 price display from `currentEra()`/`quote()` (contract
state), never from seat number. `EraAdvanced` carries a `reason` (RANGE vs CAP);
indexers must not claim "era N opened at its range start" for a CAP advance.

## "First Million" = narrative target, not a guarantee
Per-era caps preserve distribution shape but cannot guarantee 1,000,000 reachable
seats (repeat/upgrade buys consume a cap while issuing few seats). Label it honestly.
**Why:** a true on-chain 1M guarantee needs a min-entry reserve invariant that would
**restrict late-in-era hybrid upgrades** — contradicting the hybrid-purchase model.
That hard-reserve is deferred (a human-review item), default = honest labeling.

## Recovery must be timelocked, never an instant sweep
The paused `recoverUnsoldSyn` path must be gated by `pausedAt + RECOVERY_TIMELOCK`
(`pausedAt` resets on unpause so the clock restarts); the *concluded* path needs no
delay. Destination is ALWAYS the immutable Vault — recovery is a premature-halt
power, never a theft path.
**Why:** concluded-only recovery re-introduces a dust deadlock; instant paused
recovery would let the owner pause-and-sweep unsold inventory with no warning.

## No oracle for V2 pricing
Do NOT add oracle/market-peg pricing. **Why:** it adds a manipulation surface + trust
dependency and contradicts the prescripted-immutable "don't trust, verify" model.
Below-market arbitrage is acceptable — bounded by the caps + the #1M hard stop; the
escape hatch for a large market move is a future **Sale V3**, not making V2 adaptive.

## Referral fan-out (impossible-to-misread rule)
The Operations wallet is a plain EOA and NEVER pays the referrer. The **contract**
pulls full USDC in, then fans out Vault→Liquidity→Referrer→Operations in the same
buy tx; `opsAmt` is already net of the referral. Vault(70%)/Liquidity(20%) are never
diluted; the 5% referral is carved only from the 10% Operations slice. Push-with-
escrow fallback (`referralOwed`/`claimReferral`) so a bad referrer can't brick a buy.
