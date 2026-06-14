---
name: Sale V2 economic/security addendum doctrine
description: Durable design decisions for the FUTURE Sale V2 contract (per-era caps, timelock, no-oracle, honest "First Million", referral via external CommissionRouter V1). Draft-only; not deployed.
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
all three caps: per-tx, per-era address cap, aggregate-per-era. The per-address cap
is now sized PER ERA in the draft (`maxUsdcPerAddressPerEra[1..9]`) — a single
global value is provably wrong (it lets one wallet drain a tiny early era).

## Seat number no longer fixes price (the honest tradeoff)
With a cap that can be exhausted early, the era advances before its member range
fills → member ranges become **ceilings, not exact price brackets**. `src/lib/eras.ts`
is therefore a **positional preview**, NOT the executable pricing truth for V2.
**How to apply:** drive any V2 price display from `currentEra()`/`quote()` (contract
state), never from seat number. `EraAdvanced` carries a `reason` (RANGE vs CAP);
indexers must not claim "era N opened at its range start" for a CAP advance.

## "First Million" = narrative target, unless the seat-reserve is switched on
Per-era caps preserve distribution shape but cannot by themselves guarantee 1,000,000
reachable seats (repeat/upgrade buys consume a cap while issuing few seats).
**Now in the draft:** a configurable immutable `RESERVE_THROUGH_SEAT` + helper
`_reserveSyn(m)` makes seats an on-chain guarantee up to a chosen seat. Default =
#10,000 (Eras II–IV, the cheap early run = 3,933,500 SYN); #1,000,000 = full million
(130,933,500 SYN); 0 = off. Buy reverts `ReserveFloorViolation(maxSynOut)`.
**Why the default isn't the full million:** a full 1M reserve restricts late-in-era
hybrid upgrades; reserving only the cheap early eras closes the worst abuse without
taxing the whole sale. Where the reserve doesn't cover a seat, label "First Million"
as an honest target (never "guarantee") in public copy.

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

## Referral = external CommissionRouter V1, NOT inline-5% (the current ruling)
Referral was moved OUT of the sale into a dedicated `CommissionRouterV1.draft.sol`.
The sale pays Vault(70%)+Liquidity(20%) IN FULL, then hands the whole 10% Operations
slice to `router.route()` under `try/catch`; the router PULLS the slice via
`transferFrom`, pays the referrer a **count-only tier** (Signal/Advocate/Connector/
Catalyst/Ambassador = 30/40/55/70/80% **of the Ops slice**, recovered verbatim from
`src/lib/preview/referral.ts` — never invent), escrows on push-failure
(`referralOwed`/`claimReferral` now live on the ROUTER), forwards the remainder to a
**governance-set** operationsWallet, and emits the full RAL `Attribution` event.
**Why a separate contract:** isolates referral policy from sale custody (a swapped/
buggy router can only ever touch the Ops slice, never the already-paid Vault/Liquidity);
upgrade = router swap, not sale migration; one canonical RAL emitter for read-models.
**How to apply / invariants that MUST hold:**
- Eligibility (re-validated IN the router): `referrer != 0 && != buyer && knownMember`
  via the CALLING sale's view (on-chain truth, no off-chain trust in money routing).
- `referredCount` increments ONLY on a VALID FIRST-SEAT referral; commission is paid
  on EVERY valid-referrer buy (OD-1 RATIFIED: pay every eligible referred buy, but count
  increments first-seat-only so repeat buys can't farm tier count — draft already does this).
  Retention gate (retentionRequiredPct) RATIFIED off-chain only; tiers launch count-only.
- `referrerAmount + operationsAmount == opsSlice` on EVERY path; max tier 80% < 100%.
- Router unset OR `route` reverts → sale pays the FULL slice to Operations + emits
  `CommissionRouterFallback`; buy NEVER bricks.
- Router wiring on the SALE side: `initialRouter` ctor (day-one max-approve);
  add/replace behind a 7-day timelock; **disable is instant** (removing trust is fast).
- `retentionRequiredPct` is OFF-CHAIN only — retention isn't on-chain-knowable so it
  NEVER gates a live payout. `attributionMode=1` (buyer-override), `campaign`/`refTag`/
  `splits[4]` protocol slice are all RESERVED (0 in V1).
- `CommissionRouteInput` struct is duplicated byte-for-byte in BOTH drafts — a mismatch
  is an ABI break. Architect note (R9/OD-7): sale `Routed.referral` only MIRRORS the
  router's returned `splits[2]`; the router's `Attribution` is the AUTHORITATIVE RAL leg.
- The architecture doc now embeds BOTH .sol verbatim (§L sale, §R router) — keep both
  byte-identical. Sprint report: `docs/proposals/SALE_V2_COMMISSION_ROUTER_V1_SPRINT.md`.

## Audit (line-by-line) — non-obvious cross-contract constraints

Senior audit verdict = PASS WITH FIXES (no Critical/High). Durable, code-non-obvious findings:
- **Two Operations destinations.** On router SUCCESS the remainder goes to the ROUTER's
  `sources[sale].operationsWallet`; on FALLBACK it goes to the SALE's immutable `OPERATIONS`.
  Nothing on-chain forces them equal → deploy MUST set `router.operationsWallet == OPERATIONS`
  and verify via `sourceConfig()`, or Operations revenue splits by path.
- **V1-no-proof double-count.** `firstSeat = !knownMember`; a V1 member who buys WITHOUT
  submitting their Merkle proof is issued a NEW V2 seat and bumps `memberCount` (nudges era
  boundaries/reserve). Unpreventable on-chain — frontend MUST always submit the proof; treat
  as indexer-reconciled.
- **Max-approval is bounded-safe ONLY because the sale is never a USDC reservoir.** Sale grants
  the router `type(uint256).max` USDC, but holds ~0 USDC between buys and exactly `opsSlice` when
  `route()` is called (Vault/Liq already paid) → a malicious confirmed router can pull at most
  `opsSlice`. The guarantee breaks if the sale is ever changed to hold USDC across txs.
- Production swaps required pre-deploy (not economics): OZ SafeERC20/Ownable2Step/
  ReentrancyGuard/Pausable + double-hashed Merkle leaf; optional `route` integrity assert
  `vaultAmount+liquidityAmount+opsSlice == gross`. No Fuji → compensate with a forked-mainnet
  full rehearsal before the live tiny buy.

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
  Era II and vice-versa. **Fixed: now `uint256[9]` per-era `maxUsdcPerAddressPerEra`
  in the draft** (constructor arg `addrCaps`, buy reverts `AddressEraCapExceeded`,
  constructor requires each sellable era's cap ≥ its min); only the cap VALUES (the
  ramp) remain a human-review item (J3).

- **Correct "First Million" reserve invariant — now in the draft** as a configurable
  immutable `RESERVE_THROUGH_SEAT` + helper `_reserveSyn(m)`:
  `reserve(m) = seatsLeftInCurrentEra×synPerMinSeat[curEra] +
  Σ capacity[e]×synPerMinSeat[e] (later eras)` — i.e. cost each remaining seat at
  ITS OWN era's min rate. = full V2 entry-floor 130,933,500 SYN at V2 start;
  early-eras-only (II–IV / seat #10,000) variant = 3,933,500 SYN (the default).
  **Why own-era, not blanket:** the naïve version that reserves all future seats at
  the *current* era's rate over-reserves to ~500M SYN (more than the pool) and bricks
  Era II. Default ships the early-era reserve; set #1,000,000 for a full guarantee
  only if Legal demands an unconditional claim; 0 disables. Views
  `sellableSynForNextSeat`/`currentReserveFloor` expose the live headroom/floor.

- **Referral is carved from the 10% Operations slice ONLY** — Vault (70%) and
  Liquidity (20%) are mathematically never diluted by referrals. (The payout is now
  a tiered 30–80% **of that slice** via CommissionRouter V1, not a flat 5% — see the
  router section above; this simulation predates the router and used the flat 5%.)
  **"First Million" stays a TARGET, never "guarantee"** in public copy (Option 1).
