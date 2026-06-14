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

## Parameter & treasury simulation conclusions (companion report)

Report: `docs/proposals/SALE_V2_PARAMETER_AND_TREASURY_SIMULATION.md` (docs-only;
numbers recomputed from `eras.ts` + 350M pool + 70/20/10). Durable conclusions:

- **Recommended: Model B (Balanced)** — fund ≈248M SYN (~71% of the 350M pool;
  leaves a ~29% buffer), per-era SYN caps ×1.25 (II–IV)/×1.50 (V–VII)/×2.00
  (VIII–IX), per-tx ~$25k, 14-day recovery timelock + multisig, no oracle, end at
  Era IX → plan Sale V3. Model A (×1.10/1.15/1.20, 44.5%) under-raises; Model C
  (×2.50 flat, 93.5%) over-commits the pool.
  **Why:** B is the only model that keeps the 1M-seat mission credible AND keeps a
  safety buffer; recompute V1's already-sold SYN out of the pool before funding.

- **Single global `MAX_USDC_PER_ADDRESS_PER_ERA` is provably wrong** — early eras
  hold so little USDC capacity (Era II ≈ $7k–$17k across models) that ONE max wallet
  drains Era II in every model. Any per-address value safe for Era IX is useless for
  Era II and vice-versa. **Fix: make it `uint256[9]` (per-era).** This is the one
  contract change the numbers *prove* is needed — flagged for the line-by-line
  review, NOT applied to the draft.

- **Correct "First Million" reserve invariant** (if a hard 1M guarantee is ever
  required): `reserve(m) = seatsLeftInCurrentEra×synPerMinSeat[curEra] +
  Σ capacity[e]×synPerMinSeat[e] (later eras)` — i.e. cost each remaining seat at
  ITS OWN era's min rate. = full V2 entry-floor 130,933,500 SYN at V2 start;
  early-eras-only (II–IV) variant = 3,933,500 SYN. **Why:** the naïve version that
  reserves all future seats at the *current* era's rate over-reserves to ~500M SYN
  (more than the pool) and bricks Era II. Recommendation ships the early-era (II–IV)
  reserve only; full global reserve only if Legal demands an unconditional claim.

- **Referral = 5% of gross, carved from the 10% Operations slice only** — Vault
  (70%) and Liquidity (20%) are mathematically never diluted by referrals.
  **"First Million" stays a TARGET, never "guarantee"** in public copy (Option 1).
