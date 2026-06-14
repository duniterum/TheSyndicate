# The Syndicate — Sale V2 Architecture & Contract Design

> **Phase:** DESIGN / REVIEW / SOLIDITY-DRAFT only.
> **This document changes NO protocol code, config, or canon.** It does not
> deploy, does not modify Sale V1, does not touch the SYN token, does not
> migrate funds, and does not implement anything in `src/`.
>
> **Draft contract:** `docs/proposals/drafts/SyndicateSaleV2.draft.sol`
> (UNAUDITED — for human review only; embedded verbatim in §L).
>
> **Builds on:** `docs/proposals/ERA_ENGINE_V2_RECONCILIATION_SPRINT0.md`
> (Sprint 0 reconciliation), `docs/REVENUE_ATTRIBUTION_LAYER.md` (referral
> doctrine), `docs/SALE_FLOW_INVARIANTS.md` (write-path invariants),
> `src/lib/eras.ts` (the 9-era schedule), `src/lib/syndicate-config.ts`.
>
> Date: 2026-06-14. All on-chain figures must be re-read live before any deploy.

---

## 0. Executive summary (read first)

Sale V1 is a single-rate Genesis engine: `1 SYN = $0.01`, $5 minimum, 70/20/10
routing, pausable, open-ended. It cannot express the multi-era schedule the
protocol wants. **Sale V2** is a new, separate contract that adds an
**automatic, prescripted, immutable era ladder** on top of the same money
plumbing, while leaving V1, SYN, and all funds untouched.

**The five headline design decisions:**

1. **Era transitions are automatic and on-chain — not founder-activated.**
   The access rate is a pure function of how many seats have been issued. The
   only privileged power is **emergency pause/unpause**. *(This intentionally
   reverses Sprint 0's "manual activation" recommendation, per the updated
   founder preference.)*

2. **Immutable schedule + emergency pause (the "hybrid" trust model).** Pure
   immutability is safest but offers no kill-switch for a discovered exploit;
   pure mutability re-introduces founder discretion. The recommended middle is
   an **immutable economic schedule** (rates, boundaries, splits, wallets) with
   a **single non-economic lever: pause**. Pause can stop harm; it can never
   change a price or redirect a dollar.

3. **The price ladder uses exact integer math.** Every era's rate is a whole
   number of SYN per 1 USDC (Genesis 100 → Era IX 1). With USDC at 6 decimals
   and SYN at 18, `synOut = usdcIn × synPerUsdc × 1e12` — **no division, zero
   rounding loss**. This removes an entire class of precision/drain bugs.

4. **Hybrid proportional purchases, bounded by a per-address per-era cap.**
   Buyers pay any amount ≥ the era minimum and get proportional SYN. A
   per-address, per-era USDC cap is the anti-whale guard that keeps the
   "everyone gets a fair seat" promise and bounds inventory burn.

5. **Referral = fixed 5%, carved only from the 10% Operations slice.** Vault
   (70%) and Liquidity (20%) are never diluted. No referrer → Operations keeps
   the full 10%. This matches existing canon exactly (RAL doctrine + Sprint 0).

6. **V1→V2 continuity with no double-counting.** Member numbers are one global
   sequence. V2 is seeded with V1's final count **and** an immutable Merkle root
   of V1 member addresses, so a returning V1 member is recognized as *existing*
   (no new seat, no era acceleration) and can act as a referrer.

**The single most important structural finding:** with **member-number era
boundaries + uncapped hybrid purchases + a fixed SYN allocation, you can only
pick two.** A whale buying millions of USDC at an early cheap rate would drain
inventory long before the millionth seat. The resolution is the per-address
per-era cap (bounds burn while preserving the narrative member-number ladder),
plus an honest "sale concludes when the allocation is exhausted OR the millionth
seat is issued" stance — the "First Million" is a narrative target, not a
contract guarantee of inventory.

---

## A. Architecture: V1 → V2 relationship

### A1. What V1 is (do not touch)

| Property | V1 value |
| --- | --- |
| Contract | `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` |
| Rate | Fixed `1 SYN = $0.01` (`ACCESS_RATE_USDC_PER_SYN`, `syndicate-config.ts`) |
| Minimum | $5 USDC |
| Routing | 70 Vault / 20 Liquidity / 10 Operations (on-chain) |
| Pausable | **Yes** (`paused()` gates the buy path) |
| Membership cap | **None on-chain.** Genesis #1–333 is a narrative/`foundersBadge` range only — V1 will keep selling at $0.01 past #333 if not paused. |
| Event | `TokensPurchased(buyer, purchaseId, usdcAmount, synAmount, vaultAmount, liquidityAmount, operationsAmount)` |
| Member number | **Off-chain / indexer-derived** (`holder-index.ts`, ordered by block + logIndex) |

### A2. Recommended topology: parallel contracts, single member sequence

```
                 ┌──────────────────────────────────────────────┐
                 │  SYN (0xC1Cf…0170) · fixed 1B · 18dp · no mint │
                 └──────────────────────────────────────────────┘
                         ▲ pays SYN out of                ▲ pays SYN out of
                         │ its funded balance             │ its funded balance
   ┌─────────────────────┴─────────┐        ┌─────────────┴──────────────────┐
   │  Sale V1 (Genesis, $0.01)     │ PAUSE  │  Sale V2 (Eras II–IX, stepped)  │
   │  seats #1 … #333              │ ─────▶ │  seats #(offset+1) … #1,000,000 │
   └───────────────┬───────────────┘        └────────────────┬────────────────┘
                   │ 70/20/10 USDC                            │ 70/20/10 USDC
                   ▼                                          ▼  (+5% ref from Ops)
        Vault 0x205DdC…464 (70) · Liquidity 0xa9b0…e25 (20) · Operations 0x5cb5…E80 (10)
```

- **V1 is frozen, not replaced.** At handoff, V1 is **paused** (its native
  capability). It keeps its history and remains a verifiable record.
- **V2 routes to the SAME three wallets.** No funds move between contracts; the
  70/20/10 destinations are continuous, which keeps the Treasury Ledger and
  every "where does the money go" surface coherent across V1+V2.
- **Member number is one global sequence.** The indexer continues numbering
  across both contracts by block order (V1 `TokensPurchased` then V2
  `Purchased`). V2 keeps an on-chain `memberCount` (seeded from V1's final count)
  to pick the era, and an immutable **Merkle root of V1 member addresses** so a
  returning V1 member is recognized as *existing* (`knownMember`) rather than
  minted a new, double-counted seat. Identity itself (member #N) stays
  indexer-derived; the on-chain counter and the indexer ordinal agree by
  construction when the offset and root are correct.

### A3. The V1→V2 handoff sequence (operational, future)

1. Re-read V1's final **unique-member count** `C` and the **set of V1 member
   addresses** from the indexer immediately before handoff.
2. Build the **Merkle root** of that V1 address set (frozen snapshot).
3. **Pause V1.** (This is the one unavoidable discretionary action in the whole
   model — a one-time migration step on the *old* contract, not a recurring
   economic lever on V2.)
4. Deploy V2 with `GENESIS_OFFSET = C` and `V1_MEMBER_ROOT = root`. The draft
   requires `C ≥ 333` so V2 can only ever sell Era II+ (Genesis remains V1-only).
5. Fund V2 with its membership-distribution SYN allocation (separate authorized
   tx — see §C).
6. Frontend flips the buy surface from V1 to V2; `eras.ts` Era II+ flip
   `FUTURE → LIVE` (a code change, reviewed separately).

> **Why pause V1 at exactly #333?** If V1 sells to #340 before pausing, then
> `GENESIS_OFFSET = 340` and Era II would start at global #341, not #334 — the
> whole narrative ladder shifts by 7. Pausing precisely at the Genesis ceiling
> keeps the published boundaries true. This is **Human Review item J1.**

---

## B. Era model recommendation: AUTOMATIC, prescripted, on-chain

### B1. The decision

**Recommended: fully automatic on-chain era stepping. No founder activation.**

The access rate is a deterministic pure function of the next seat number:

```
activeEra = eraForSeat(memberCount + 1)
```

The moment the 333rd → 334th seat is issued, the protocol is in Era II *for
everyone* — first-time buyers and repeat buyers alike pay the current era rate.
There is no switch to flip, no timer, no oracle. This is the strongest possible
"don't trust, verify" posture: the price for seat #N is knowable by anyone,
forever, from the bytecode alone.

This **reverses Sprint 0 §B5** ("automatic detection + manual activation"),
which is the correct change given the updated preference: founder discretion
over pricing is exactly what an immutable ladder should eliminate.

**Why automatic over manual (and over the alternatives):**

| Model | Trust surface | Verdict |
| --- | --- | --- |
| **Immutable schedule, auto-step, pause-only** *(recommended)* | Founder can only pause; price/splits/wallets fixed in bytecode | **Strongest.** Eliminates pricing discretion; keeps an incident kill-switch. |
| Pure immutable, no pause | None — but no kill-switch either | Safest economically, but a discovered exploit cannot be stopped. Rejected: the cost of *no* brake outweighs the small trust of pause. |
| Mutable rate, founder activation | Founder sets each era live | Rejected: re-introduces exactly the discretion the protocol wants gone. |

### B2. Schedule (matches `src/lib/eras.ts` exactly — verified)

| Era | Global seats | Min USDC | SYN/USDC (int) | $/SYN | SYN at min entry | Live in |
| --- | --- | --- | --- | --- | --- | --- |
| I · Genesis | 1 – 333 | $5 | 100 | $0.01 | 500 | **V1** |
| II · First Thousand | 334 – 1,000 | $10 | 50 | $0.02 | 500 | V2 |
| III · Expansion | 1,001 – 3,333 | $10 | 40 | $0.025 | 400 | V2 |
| IV · First Ten Thousand | 3,334 – 10,000 | $25 | 16 | $0.0625 | 400 | V2 |
| V · Open Era I | 10,001 – 25,000 | $25 | 12 | $0.0833 | 300 | V2 |
| VI · Open Era II | 25,001 – 50,000 | $50 | 6 | $0.1667 | 300 | V2 |
| VII · Hundred Thousand | 50,001 – 100,000 | $50 | 4 | $0.25 | 200 | V2 |
| VIII · Quarter Million | 100,001 – 250,000 | $100 | 2 | $0.50 | 200 | V2 |
| IX · First Million | 250,001 – 1,000,000 | $100 | 1 | $1.00 | 100 | V2 |

**Coherence check — the ladder is sound:**
- The SYN price **rises monotonically** $0.01 → $1.00 (a 100× appreciation over
  the ladder). Early seats are always cheaper. Early-mover advantage is real and
  preserved. ✔
- Every `SYN/USDC` rate is a **clean integer** (100, 50, 40, 16, 12, 6, 4, 2,
  1). This is the property that makes the contract math exact. ✔
- Member-count boundaries sum to exactly 1,000,000 seats. ✔ (Sprint 0 verified;
  re-verified here against `eras.ts`.)

### B3. The "current era" rule (and why repeat buyers pay current price)

A purchase's rate is set by the era of the **next seat to be issued**
(`memberCount + 1`), *not* by the buyer's original seat era.

- A first-time buyer becomes member `memberCount + 1` and pays that era's rate.
- A repeat buyer does **not** get a new number, but **still pays the current
  era's rate**.

This is deliberate. If repeat buyers paid their *original* (cheaper) seat era
forever, a Genesis member could keep buying at $0.01 indefinitely and drain the
whole allocation. Pricing every live purchase at the current era keeps "early is
cheaper" honest: you got your cheap entry once; buying more today costs today's
price.

### B4. Where the schedule ends

The draft **reverts `SaleConcluded` past seat #1,000,000** — including for
repeat buyers once the millionth seat is issued. This gives the sale a
deterministic, bounded end with no founder action. Whether to instead allow
repeat buys at the Era IX rate after the millionth seat, or to open a future
"Million+" era, is **Human Review item J7** (Sprint 0 left "Era 10" as TBD).

---

## C. Tokenomics review (does the schedule fit 350M SYN?)

### C1. Entry-only floor (from Sprint 0, re-verified against `eras.ts`)

If every member made exactly one minimum-entry purchase:

| Aggregate | Value |
| --- | --- |
| SYN distributed to reach 1,000,000 members (entry-only) | **131,100,000 SYN** |
| Membership Distribution allocation | **350,000,000 SYN** |
| Headroom for repeats/upgrades/whales | **218,900,000 SYN (62.5%)** |
| USDC raised at 1M members (entry-only) | **≈ $94,323,340** |

### C2. The structural tension (the core economic finding)

Entry-only is a **floor**, not a forecast. Hybrid purchases let members buy
*more* than the minimum, and that draws from the same 350M. The danger is the
**early eras**, where SYN is cheapest:

- In Era II ($0.02), **$1,000,000 of buys = 50,000,000 SYN** — ~38% of the
  entire entry-only budget, consumed by a handful of large buyers before the
  protocol ever reaches member #1,000.
- Uncapped, a single well-funded actor could exhaust the allocation in the first
  one or two eras, at the cheapest prices, defeating both the distribution goal
  and the "fair seat for everyone" promise.

**You cannot simultaneously guarantee all three of:** (a) member-number era
boundaries, (b) uncapped hybrid purchases, (c) a fixed SYN allocation that lasts
to seat #1,000,000. One must give.

### C3. Recommended resolution

1. **Keep member-number boundaries** (they are the narrative + identity spine).
2. **Cap hybrid purchases per-address, per-era** (`MAX_USDC_PER_ADDRESS_PER_ERA`
   in the draft). This bounds how fast cheap eras can be drained, spreads
   distribution across more wallets, and is the single most important anti-whale
   lever. **The cap value is Human Review item J3.** A worked starting point:
   capping each address to, say, **$25,000 per era** means draining Era II's
   share requires many distinct funded wallets, not one.
3. **Make inventory an honest hard stop.** The contract sells from its own SYN
   balance; when `synOut` would exceed the remaining balance, `buy` reverts
   `InsufficientInventory`. If the dust left is below every era minimum, the sale
   is *economically* over even though `isConcluded()` (seat #1,000,000) is still
   false. To formally wind down and return that dust SYN to the Vault, the
   founder **pauses** and calls `recoverUnsoldSyn()` (Vault-only destination —
   see §F). The "First Million" is a *narrative* destination — if heavy upgrade
   behavior exhausts the allocation early, the sale honestly ends there rather
   than minting more (SYN supply is fixed; **we do not touch it**).
4. **Model the per-era allocation before funding.** Decide funding `F ≤ 350M`
   for V2 with explicit headroom assumptions for repeats/upgrades by era. This
   is a spreadsheet exercise to complete before deploy (**Human Review J2**).

### C4. Distribution-health note

Early members get **far more SYN per dollar** (100×) than late members. That
concentrates SYN among early adopters — intended as reward for early risk, but
worth stating plainly. The rising price curve + per-address per-era cap are the
two mitigations that keep this from becoming raw plutocracy. Rank remains
**cumulative-USDC, recognition-only** and is unaffected by era rate (canon).

---

## D. Referral recommendation (fixed 5%, Operations-only)

This aligns exactly with `docs/REVENUE_ATTRIBUTION_LAYER.md` and Sprint 0 §B4 —
**no new doctrine invented**, just the V2 contract realization.

| Rule | V2 design |
| --- | --- |
| Rate | **Fixed 5% of gross** (= 50% of the 10% Operations slice). |
| Source | **Operations only.** Vault 70% & Liquidity 20% never diluted. |
| No referrer | Operations keeps the full 10%. |
| Example ($100) | 70 Vault · 20 Liquidity · **5 Referrer · 5 Operations**. |
| Eligibility | `referrer != buyer` (no self-referral) **and** referrer is a recognized member (`knownMember` — a V2 buyer, or a V1 member who registered via `claimV1Membership`). |
| Attribution | Last-verified-referrer at point of sale; passed as a `buy()` arg (no retroactive attribution). |
| Payout | **Push in same tx**; if the push fails (e.g. USDC blacklists the referrer), **escrow to a claimable balance** so the buy is never blocked. |
| Wording | "direct sales commission." **Never** yield / dividend / passive income / revenue share. |
| Tiered/reputation boosts | **V3/future.** Reframe the current `/referral` tiered preview to fixed-5% before V2 ships. |

**Why escrow-on-failure matters:** a plain ERC20 `transfer` has no recipient
hook, so an EOA referrer always succeeds — *but* Circle USDC can **blacklist**
addresses, and a `transfer` to a blacklisted referrer reverts. Without the
`try/catch` + escrow fallback, one blacklisted referrer could brick every buy
that names them. The draft wraps the referral push in `try/catch` and escrows on
any failure; `claimReferral()` lets the referrer withdraw later.

**V1 members as referrers:** because eligibility checks `knownMember`, a V1
member who has not yet bought in V2 must first call `claimV1Membership(proof)`
(a gasless-to-the-buyer, one-time self-registration) to become a valid referrer.
This is a deliberate, documented constraint, not an exclusion.

> The RAL `Attribution{ splits[5], paymentMode, attribution, refTag }` schema is
> the richer **doctrine** event. The draft emits a lean
> `Routed` + `ReferralAttributed` pair that the indexer can map onto the RAL
> shape. Whether to emit the full RAL `Attribution` struct on-chain in V2 or
> keep it as an indexer-side projection is **Human Review item J6.**

---

## E. Identity & event recommendation

### E1. Member identity stays indexer-derived (canon FS-2)

V2 does **not** mint a seat token. Identity (member #N) remains derived by the
indexer from purchase events across V1+V2, ordered by block + logIndex. V2's
on-chain `memberCount` exists only to pick the era; it is seeded from V1's final
count, and an immutable **V1 Merkle root** lets V2 recognize returning V1
members so they are never double-counted. The future `SeatRecord721`
(`docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`) remains the eventual on-chain
identity layer — and V2's `Purchased`/`firstSeat` events are precisely the data
source it will need (wallet, member number, era, first-purchase block/tx).

**`memberNumber` authority rule:** the on-chain `memberNumber` in events is
authoritative **only when `firstSeat == true`** (a brand-new protocol member,
assigned `memberCount + 1`). For a recognized V1 member buying again, the event
carries `0` and the **indexer** supplies the real (V1) number. This is honest:
on-chain V2 knows the *count* it must, and defers identity to the indexer where
canon already places it.

### E2. Event design (indexer-first)

| Event | Purpose | Indexed fields |
| --- | --- | --- |
| `Purchased(buyer, memberNumber, era, usdcIn, synOut, synPerUsdc, firstSeat)` | Canonical purchase; `firstSeat` marks member creation; `memberNumber` authoritative iff `firstSeat` | buyer, memberNumber, era |
| `Routed(memberNumber, vault, liquidity, operations, referral)` | Deterministic money split (mirrors V1 `TokensPurchased` + referral) | memberNumber |
| `ReferralAttributed(referrer, buyer, memberNumber, amount, escrowed)` | Referral attribution + escrow flag | referrer, buyer, memberNumber |
| `ReferralClaimed(referrer, amount)` | Escrow withdrawal | referrer |
| `EraAdvanced(fromEra, toEra, atSeatNumber)` | Automatic boundary crossing; `atSeatNumber` = first seat of the new era | fromEra, toEra |
| `V1MembershipRecognized(member)` | A V1 member registered/recognized in V2 | member |
| `UnsoldSynRecovered(to, amount)` | Post-conclusion / wind-down sweep to Vault | to |

**Design rules honored:**
- **Absolute values, not deltas** — every event carries enough to reconstruct
  state without prior events (FS-2 indexer friendliness).
- **`memberNumber` on every money event** so Activity/Chronicle/Treasury
  surfaces can join money to identity without re-deriving.
- **`synPerUsdc` on `Purchased`** so the era rate is provable per-tx.
- `EraAdvanced` reports the **boundary seat** (the first seat of the new era),
  not the triggering buyer's number — so a repeat buy that happens to be the
  first tx after a boundary still reports the correct era-open seat. It is the
  clean hook for an Activity/Chronicle "an era opened" candidate, but per
  money/Signal guardrails it is a **protocol** event (subject = protocol): an
  era opening MAY be S3+, while no person-money event auto-promotes. Keep
  era-advance copy recognition-only ("Era II opened at seat #334"), never "price
  went up / buy now."

---

## F. Admin powers (minimal-trust surface)

| Power | In V2? | Rationale |
| --- | --- | --- |
| `pause()` / `unpause()` | **Yes** | The only economic lever. Stops harm during an incident; cannot change a price or move a dollar. |
| Change era rates / boundaries | **No** | Immutable in bytecode. The whole point of "prescripted." |
| Change 70/20/10 split | **No** | Constitutional; immutable. |
| Change Vault/Liquidity/Operations wallets | **No (recommended)** | Immutable constructor args. A compromised wallet → deploy V3, don't add a live setter. *(Optional 2-step timelocked rotation is **Human Review J4** if ops demands it.)* |
| Withdraw USDC | **No** | USDC is only ever held transiently mid-`buy` and fully routed in the same tx; escrowed referral is claimable by the referrer only. Owner has **no** USDC withdrawal path. |
| `recoverUnsoldSyn()` | **Yes, constrained** | Callable when the sale **concluded** OR is **paused** (deliberate wind-down for inventory dust). Destination is the **immutable Vault** only — no path drains SYN to the owner, paused or not. |
| `rescueToken(token)` | **Yes, constrained** | Recovers tokens sent by mistake; **cannot** touch USDC or SYN; destination is the immutable Vault. |
| `claimV1Membership(proof)` | **Yes, permissionless** | Not an admin power — any V1 member self-registers via Merkle proof. No owner involvement. |
| `transferOwnership` / `acceptOwnership` | **Yes (2-step)** | Safe handoff to a Safe/multisig (mirrors Archive D1/D6: EOA → Safe ≤ 30 days). |

**Net owner capability:** pause the sale; recover *unsold* SYN to the Vault only
when concluded or paused; rescue mistaken non-sale tokens to the Vault; hand the
keys to a multisig. **No power over price, splits, destinations, buyer SYN, or
referral funds.**

---

## G. Threat model

| # | Threat | Vector | Mitigation in draft |
| --- | --- | --- | --- |
| T1 | Reentrancy | External calls in `buy` (USDC/SYN transfers, referral push) | `nonReentrant` + strict checks-effects-interactions (all state written before any transfer). USDC/SYN are non-callback ERC20s. |
| T2 | Decimal mismatch (6dp↔18dp) | Wrong scaling SYN vs USDC | Single constant `SCALE_6_TO_18 = 1e12`; `synOut = usdcIn × synPerUsdc × 1e12`. Unit tests assert exact values per era. |
| T3 | Rounding / precision drain | Division favoring buyer | **No division in the price path** (integer rates). Split uses remainder assignment (`ops = usdcIn − vault − liq`) so totals are exact with zero dust loss. |
| T4 | Era-boundary race / front-run | Era steps between quote and mine; buyer gets worse rate | `minSynOut` slippage floor reverts the buy if the rate stepped. (Buying *earlier* for a cheaper rate is intended, not an exploit.) |
| T5 | Inventory exhaustion mid-tx | Buy exceeds remaining SYN | `require(synOut ≤ availableSyn)` → `InsufficientInventory`. Atomic single-era buys (no cross-era partial fills). Frontend quotes against `availableSyn()`. |
| T6 | Whale accumulation | One actor drains a cheap early era | `MAX_USDC_PER_ADDRESS_PER_ERA` per-address per-era cap (§C). |
| T7 | Self-referral / fake referral | Buyer refers self or a non-member to skim Operations | `referrer != buyer` **and** `knownMember[referrer]` required; else `refAmt = 0` and Operations keeps the full slice. |
| T8 | Referral griefing | Blacklisted/reverting referrer bricks the buy | `try/catch` push → escrow to `referralOwed`; buy never reverts on referral failure. `claimReferral()` for withdrawal. |
| T9 | Routing failure | A destination wallet reverts on receive | Vault/Liquidity/Operations are protocol-owned EOAs; plain USDC `transfer` has no hook. (If ever a contract, same escrow pattern would apply — note for J4.) |
| T10 | Owner abuse | Owner drains funds or rugs price | No price/split/wallet setters; no USDC withdrawal; SYN recovery destination is Vault-only. Pause cannot move money. |
| T11 | Pause abuse (griefing) | Owner pauses forever to freeze the sale | Pause cannot *take* anything; worst case is a halted sale, recoverable by unpause or a multisig owner. Accept as residual; mitigate via multisig owner. |
| T12 | Stuck SYN | Unsold dust SYN locked below every era minimum | `recoverUnsoldSyn` is callable when **paused** (not only when concluded) → founder pauses and sweeps dust to the Vault. Resolves the deadlock (was J8). |
| T13 | V1/V2 double-count | V1 member treated as a new V2 member; era boundary accelerates; V1 member can't refer | Immutable `V1_MEMBER_ROOT` + `knownMember`: a V1 member supplying a proof (in `buy` or via `claimV1Membership`) is recognized as existing — no new seat, no count++. (Residual: see T17.) |
| T14 | Wrong USDC variant | Bridged vs native USDC | Constructor pins native Avalanche USDC (decision D3); verify on Fuji + mainnet. |
| T15 | Approval/allowance abuse | Infinite approve exploited later | Contract only ever pulls `usdcIn` it just validated; no path spends more than the buyer authorized for that call. |
| T16 | Wallet-drift signing (project's repeated bug) | Tx signed by a different injected account than the UI shows | **Frontend** invariant, not contract: `assertFreshWallet` + `account:` pinning per `docs/SALE_FLOW_INVARIANTS.md` (see §I). |
| T17 | V1 member buys via a non-canonical frontend without a proof | They omit `v1Proof` → treated as a new seat (double-count) | Cannot be prevented on-chain (you can't cheaply prove a *negative*). The canonical frontend MUST attach the proof for known V1 members (§I); residual exposure bounded by ≤333 Genesis members. **Human Review J12.** |

---

## H. Test plan

### H1. Unit — pricing & math (exactness is the headline property)
- For each era II–IX: min-entry buy yields **exactly** the table's SYN
  (e.g. Era II $10 → 500.000000000000000000 SYN; Era IX $100 → 100 SYN).
- Fuzz `usdcIn`: assert `synOut == usdcIn × synPerUsdc × 1e12` for all inputs;
  assert no overflow at realistic ceilings.
- Split exactness: `vault + liquidity + operations + referral == usdcIn` for all
  `usdcIn` (including non-multiples of 100 — dust goes to Operations, never
  lost). `vault == usdcIn×70/100`, `liquidity == usdcIn×20/100`.

### H2. Unit — era engine
- `eraForSeat` returns the right era at every boundary and ±1 around it (333,
  334, 1000, 1001, …, 1_000_000, 1_000_001 → revert).
- `EraAdvanced` emits exactly once per crossing, with `atSeatNumber` == the
  first seat of the new era (e.g. 1001), **even when the triggering tx is a
  repeat buyer**.
- Repeat buyer pays **current** era, not original seat era.
- `buy` at seat #1,000,000 issues the seat; the next `buy` reverts
  `SaleConcluded`.

### H3. Unit — membership, V1 recognition & caps
- First buy sets `knownMember`, assigns `memberCount+1`, emits `firstSeat=true`.
- Second buy by same address: no new number, `firstSeat=false`.
- `GENESIS_OFFSET` seeding: with offset 333, first V2 newcomer is #334 (Era II).
- Constructor reverts when `genesisOffset < 333` or `≥ 1_000_000`.
- **V1 recognition:** an address in `V1_MEMBER_ROOT` that supplies a valid proof
  (via `claimV1Membership` or inline in `buy`) is `knownMember`, gets **no new
  seat**, does **not** increment `memberCount`, emits `firstSeat=false`, and is a
  valid referrer. A bad proof reverts `InvalidProof`; double-claim reverts
  `AlreadyKnown`.
- Per-address per-era cap: buy up to cap OK; one wei over reverts
  `AddressEraCapExceeded`; cap resets in the next era.

### H4. Unit — referral
- Valid referrer: 5% to referrer, 5% to Operations, 70/20 untouched.
- No referrer / self / non-member referrer: Operations keeps full 10%, no
  `ReferralAttributed`.
- V1 referrer recognized via `claimV1Membership` then used as referrer: paid.
- Reverting/blacklisted referrer (mock USDC that reverts on transfer to X):
  buy succeeds, `referralOwed[X]` credited, `escrowed=true`; `claimReferral`
  pays out; double-claim reverts `NothingToClaim`.

### H5. Unit — inventory & admin
- `buy` reverts `InsufficientInventory` when `synOut > balance`; exact-remaining
  buy succeeds and zeroes inventory.
- `pause` blocks `buy`; `unpause` restores.
- `recoverUnsoldSyn` reverts when neither concluded nor paused; succeeds (to
  Vault only) when **paused**; succeeds when **concluded**.
- `rescueToken` reverts for USDC and SYN; works for a third token, to Vault.
- 2-step ownership: `transferOwnership` then `acceptOwnership`; non-pending
  acceptor reverts.

### H6. Security / property
- Reentrancy: malicious ERC20 mock attempting reentry into `buy`/`claimReferral`
  is blocked.
- Invariant (fork/echidna-style): `totalSynSold == Σ synOut`; contract USDC
  balance after any `buy` == `Σ referralOwed` (nothing else lingers).
- Slippage: simulate era step between quote and execution → `minSynOut` reverts.

### H7. Fork / integration (Fuji first, per D4/D5)
- Real native USDC (6dp) approve→buy→split lands in the three real wallets.
- Indexer parity: replay V1 `TokensPurchased` + V2 `Purchased`; member numbers
  are continuous and unique across the boundary; a recognized V1 member buying
  in V2 keeps their original number.
- Gas snapshot for `buy` (first vs repeat, with/without referral, with proof).

---

## I. Frontend & indexer implications

| Area | Change required (future, separate PR — NOT in this phase) |
| --- | --- |
| `contract-registry.ts` | Add V2 address + ABI (never inline — `SALE_FLOW_INVARIANTS` §1). |
| `holder-index.ts` | Scan **both** V1 `TokensPurchased` and V2 `Purchased`; order by block+logIndex; `firstSeat` marks member creation; keep one shared canonical scan (per `purchase-events-canonical` memory — don't refork). |
| V1 member proof | Generate the V1-member Merkle tree (same snapshot used for `V1_MEMBER_ROOT`); the buy/referral UI **must attach `v1Proof` for any connected wallet that is a V1 member** so it is recognized, not double-counted (mitigates T17). |
| `eras.ts` | Flip Era II+ `FUTURE → LIVE` once V2 is live; read the **on-chain** `currentEra()`/`quote()` for live rate; keep `eraForMemberNumber` for preview. (`synForUsdcInEra` already branches LIVE vs preview.) |
| Buy component (`LivePurchase.tsx`) | Point at V2 `buy(usdcIn, referrer, minSynOut, v1Proof)`; compute `minSynOut` from `quote()` with a slippage tolerance; show current era + price + "you'd be member #N". |
| Write-path invariants | New buy path MUST: `assertFreshWallet` before `writeContractAsync`, pin `account:`, route links via chain-registry helpers, add the guard-test entry (`SALE_FLOW_INVARIANTS` §"Adding a new sale component"). |
| `/referral` | Reframe tiered preview → **fixed 5% (V2)**; wire referral arg; surface `claimV1Membership` for V1 members who want to refer; "direct sales commission" wording. |
| Protocol event pipeline | Add `era-advanced` and `referral` kinds across `protocol-events.ts` + `protocol-event-registry.ts` (lockstep edits + tests — per `protocol-event-pipeline` memory). |
| Treasury/Activity/Chronicle | `Routed`/`EraAdvanced` feed Treasury Ledger + Activity; era-open is a protocol-subject Activity candidate (recognition-only copy). |
| `quoteSyn` parity | V2 `quote()` replaces V1 `quoteSyn` on the buy surface; verify-drawer reads the live era rate from chain, not the hardcoded $0.01. |
| Persistence | Extend the localStorage purchase-events cache to the V2 scan using the existing incremental-cursor template (`purchase-events-persistence` memory). |

---

## J. Human review items before any deploy

| # | Decision | Recommendation | Why it matters |
| --- | --- | --- | --- |
| J1 | Pause V1 exactly at seat #333? | **Yes** — pause at the Genesis ceiling, then deploy V2 with `GENESIS_OFFSET = 333`. | If V1 overshoots, every era boundary shifts. The draft enforces `offset ≥ 333` but cannot enforce *exactly* 333. |
| J2 | V2 SYN funding amount `F` | Model repeats/upgrades by era; fund with headroom but `F ≤ 350M − (V1 already sold)`. | Determines when the honest inventory hard-stop hits. |
| J3 | `MAX_USDC_PER_ADDRESS_PER_ERA` value | Set per modeling; starting point ~$25k/era. | The primary anti-whale + distribution-fairness lever. |
| J4 | Wallet rotation: immutable vs 2-step timelock | **Immutable** unless ops requires rotation. | Immutable = max trust; rotation = a live privileged path to scrutinize. |
| J5 | Referral first-purchase-only or every purchase? | **Every eligible purchase** (matches RAL "every sale"). | Affects Operations economics; confirm against legal framing. |
| J6 | Emit full RAL `Attribution{splits[5]…}` on-chain in V2, or project it indexer-side? | Lean `Routed`+`ReferralAttributed` on-chain; project RAL shape off-chain. | Gas + simplicity vs single-event richness. |
| J7 | Behavior past seat #1,000,000 | **Revert `SaleConcluded`** (bounded end). Reopen via a future "Million+" contract if desired. | Sprint 0 left Era 10 TBD. |
| J8 | Wind-down / dust recovery | **Resolved in draft:** `recoverUnsoldSyn` allowed when paused, Vault-only. Confirm this is the desired authority. | Avoids permanently-locked dust SYN without granting a rug path. |
| J9 | USDC address | Native Avalanche USDC (D3); verify on Fuji + mainnet. | Wrong variant breaks payment. |
| J10 | Royalty/secondary, legal review of era + referral copy | Legal sign-off before live. | Forbidden-wording compliance (ROI/yield/dividend/etc.). |
| J11 | Review/audit gate | External review (Kemal+ChatGPT) → Fuji → independent audit → mainnet. | `SOLIDITY_REVIEW_STATE` + D4/D5. **Non-negotiable.** |
| J12 | V1 Merkle root: snapshot timing & frontend proof delivery | Snapshot V1 members at the same instant V1 is paused; ship the proof in the canonical buy/referral UI. | Recognition correctness + T17 residual (V1 member buying without a proof). |

---

## K. Solidity architecture (structure & rationale)

**Base:** OpenZeppelin v5 — `IERC20` + `SafeERC20`, `Ownable2Step`, `Pausable`,
`ReentrancyGuard`, `MerkleProof`. (The draft ships minimal stubs so it reads as
one file; **production must import the audited OZ libraries**, not the stubs.)

**State shape:**
- *Immutables* (bytecode-fixed): `USDC`, `SYN`, `VAULT`, `LIQUIDITY`,
  `OPERATIONS`, `GENESIS_OFFSET`, `V1_MEMBER_ROOT`,
  `MAX_USDC_PER_ADDRESS_PER_ERA`.
- *Constants*: `GENESIS_END=333`, `FINAL_SEAT=1_000_000`, `SCALE_6_TO_18=1e12`.
- *Mutable*: `paused`, `memberCount`, `totalUsdcRaised`, `totalSynSold`,
  `lastEra`, and the per-address maps (`knownMember`, `memberNumberOf`,
  `usdcContributed`, `usdcByAddressEra`, `referralOwed`).

**Era engine:** a single `pure` function `_eraInfoForSeat(seat) → (era,
synPerUsdc, minUsdc6)` with hardcoded boundaries identical to `eras.ts`. Pure +
hardcoded = immutable, gas-cheap, and independently verifiable. No storage
array, no setter, no oracle.

**V1 recognition:** an immutable Merkle root of V1 member addresses + a
`knownMember` map. A V1 member proves membership once (inline in `buy` or via the
permissionless `claimV1Membership`) and is thereafter treated as existing — no
new seat, no era acceleration, eligible as a referrer. Authoritative member
numbers for V1 members stay with the indexer (events carry `0` + `firstSeat=false`).

**Money path (CEI-ordered):** recognize V1 (if proof) → validate (era, min, cap,
slippage, inventory) → write all state (membership, ledgers, totals,
`EraAdvanced` at the boundary seat) → interactions (pull USDC in; push
Vault/Liquidity/Operations; `try/catch` referral push with escrow fallback; push
SYN out) → emit `Routed` + `Purchased`. `nonReentrant` wraps `buy` and
`claimReferral`.

**Why pull-then-fan-out** (vs direct `transferFrom` to each destination): it
lets the referral leg use `try/catch` + escrow without leaving the other legs in
a half-paid state, and keeps the contract's transient USDC balance provably zero
after each tx except for escrowed referral.

**Views for the frontend:** `quote(usdcIn)`, `currentEra()`,
`nextSeatNumber()`, `availableSyn()`, `isConcluded()`, `eraOfSeat(seat)` — so the
UI never hardcodes a rate and always reads on-chain truth.

---

## L. Draft Solidity implementation

> **UNAUDITED DRAFT — NOT FOR DEPLOYMENT.** For human review only. Replace the
> stub interfaces/mixins (incl. the Merkle/SafeERC20 stubs) with audited
> OpenZeppelin v5 before any compile-for-deploy. Must pass external review →
> Fuji → independent audit → mainnet (`SOLIDITY_REVIEW_STATE`, D4/D5). Identical
> copy saved at `docs/proposals/drafts/SyndicateSaleV2.draft.sol`.

```solidity
// SPDX-License-Identifier: UNLICENSED
// =============================================================================
//  SyndicateSaleV2 — DRAFT · NOT FOR DEPLOYMENT
//  The Syndicate · Membership Distribution Engine (Sale V2)
// =============================================================================
//  STATUS: UNAUDITED DESIGN DRAFT. For HUMAN REVIEW ONLY. Do NOT deploy, do NOT
//  wire into the frontend, do NOT treat as final or audited.
//
//  HARD CONSTRAINTS HONORED:
//    - Does NOT modify Sale V1 (0x0020Df30C127306f0F5B44E6a6E4368D2855842d).
//    - Does NOT touch the SYN token (0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170).
//    - Does NOT migrate funds. Routes only NEW USDC from NEW buys to the
//      EXISTING 70/20/10 wallets; pays SYN out of its own funded balance.
//
//  REQUIRED GATE BEFORE DEPLOY: external review (Kemal + ChatGPT) -> Fuji
//  rehearsal -> independent audit -> mainnet (docs/SOLIDITY_REVIEW_STATE.md).
// =============================================================================
pragma solidity 0.8.24;

// Production: import the audited OpenZeppelin v5 base instead of the stubs below.
//   IERC20, SafeERC20, Ownable2Step, Pausable, ReentrancyGuard, MerkleProof.

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

/**
 * @title  SyndicateSaleV2 (DRAFT)
 * @notice Automatic, prescripted, immutable era-stepped membership distribution.
 *         Only privileged power is emergency pause. Exact integer pricing.
 *         70/20/10 preserved; fixed 5% referral from Operations only. V1 members
 *         recognized via an immutable Merkle root (no double-counting).
 */
contract SyndicateSaleV2 {
    // --------------------------------------------------------------- errors
    error ZeroAddress();
    error BadGenesisOffset();
    error SaleConcluded();
    error BelowEraMinimum(uint256 min);
    error AddressEraCapExceeded(uint256 capRemaining);
    error InsufficientInventory(uint256 available);
    error SlippageExceeded(uint256 got, uint256 minOut);
    error NotWindingDown();
    error NothingToClaim();
    error ProtectedToken();
    error AlreadyKnown();
    error InvalidProof();

    // --------------------------------------------------------------- events
    event Purchased(
        address indexed buyer,
        uint256 indexed memberNumber,   // authoritative only when firstSeat==true
        uint16  indexed era,
        uint256 usdcIn,
        uint256 synOut,
        uint64  synPerUsdc,
        bool    firstSeat
    );
    event Routed(
        uint256 indexed memberNumber,
        uint256 vaultAmount,
        uint256 liquidityAmount,
        uint256 operationsAmount,
        uint256 referralAmount
    );
    event ReferralAttributed(
        address indexed referrer,
        address indexed buyer,
        uint256 indexed memberNumber,
        uint256 amount,
        bool    escrowed
    );
    event ReferralClaimed(address indexed referrer, uint256 amount);
    event EraAdvanced(uint16 indexed fromEra, uint16 indexed toEra, uint256 atSeatNumber);
    event V1MembershipRecognized(address indexed member);
    event UnsoldSynRecovered(address indexed to, uint256 amount);
    event Paused(address account);
    event Unpaused(address account);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ----------------------------------------------------------- immutables
    IERC20  public immutable USDC;            // Avalanche native USDC (6dp)
    IERC20  public immutable SYN;             // SYN token (18dp, fixed supply)
    address public immutable VAULT;           // 70% — 0x205DdC...464
    address public immutable LIQUIDITY;       // 20% — 0xa9b0...e25
    address public immutable OPERATIONS;      // 10% — 0x5cb5...E80
    uint256 public immutable GENESIS_OFFSET;  // final V1 unique-member count
    bytes32 public immutable V1_MEMBER_ROOT;  // Merkle root of V1 member addresses
    uint256 public immutable MAX_USDC_PER_ADDRESS_PER_ERA; // anti-whale (6dp)

    uint256 private constant GENESIS_END = 333;
    uint256 private constant FINAL_SEAT  = 1_000_000;
    uint256 private constant SCALE_6_TO_18 = 1e12;

    // ------------------------------------------------------------- ownership
    address public owner;
    address public pendingOwner;

    // ---------------------------------------------------------------- state
    bool    public paused;
    uint256 public memberCount;       // global; starts at GENESIS_OFFSET
    uint256 public totalUsdcRaised;   // V2 only (6dp)
    uint256 public totalSynSold;      // V2 only (18dp)
    uint16  public lastEra;

    mapping(address => bool)    public knownMember;     // V1-proven OR V2-bought
    mapping(address => uint256) public memberNumberOf;  // set for V2-new seats only
    mapping(address => uint256) public usdcContributed; // lifetime, per address (V2)
    mapping(address => mapping(uint16 => uint256)) public usdcByAddressEra; // anti-whale
    mapping(address => uint256) public referralOwed;    // escrowed referral (6dp)

    // ----------------------------------------------------------- modifiers
    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier whenNotPaused() { require(!paused, "paused"); _; }

    uint256 private _lock = 1;
    modifier nonReentrant() {
        require(_lock == 1, "reentrant");
        _lock = 2; _; _lock = 1;
    }

    // ------------------------------------------------------------ construct
    constructor(
        address usdc,
        address syn,
        address vault,
        address liquidity,
        address operations,
        uint256 genesisOffset,
        bytes32 v1MemberRoot,
        uint256 maxUsdcPerAddressPerEra
    ) {
        if (
            usdc == address(0) || syn == address(0) || vault == address(0) ||
            liquidity == address(0) || operations == address(0)
        ) revert ZeroAddress();
        if (genesisOffset < GENESIS_END || genesisOffset >= FINAL_SEAT) revert BadGenesisOffset();

        USDC = IERC20(usdc);
        SYN = IERC20(syn);
        VAULT = vault;
        LIQUIDITY = liquidity;
        OPERATIONS = operations;
        GENESIS_OFFSET = genesisOffset;
        V1_MEMBER_ROOT = v1MemberRoot;
        MAX_USDC_PER_ADDRESS_PER_ERA = maxUsdcPerAddressPerEra;

        memberCount = genesisOffset;
        lastEra = _eraIndexForSeat(genesisOffset + 1);

        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // =================================================== V1 recognition
    /// @notice Register as an existing V1 member (e.g. to act as a referrer)
    ///         without buying. Reverts if already known or proof is invalid.
    function claimV1Membership(bytes32[] calldata proof) external {
        if (knownMember[msg.sender]) revert AlreadyKnown();
        if (!_verifyV1(proof, msg.sender)) revert InvalidProof();
        knownMember[msg.sender] = true;
        emit V1MembershipRecognized(msg.sender);
    }

    // ============================================================ purchase
    /**
     * @param usdcIn    USDC amount (6dp). Must be >= current era minimum.
     * @param referrer  Optional referrer (existing member, not self). 0 = none.
     * @param minSynOut Slippage floor.
     * @param v1Proof   Merkle proof that msg.sender is a V1 member. EMPTY for
     *                  newcomers / already-known members. Supplying it for a V1
     *                  member prevents a new (double-counted) seat.
     */
    function buy(uint256 usdcIn, address referrer, uint256 minSynOut, bytes32[] calldata v1Proof)
        external
        nonReentrant
        whenNotPaused
    {
        // Recognize V1 membership first so a returning V1 member is NOT minted
        // a new seat / does NOT advance the era boundary.
        if (v1Proof.length > 0 && !knownMember[msg.sender] && _verifyV1(v1Proof, msg.sender)) {
            knownMember[msg.sender] = true;
            emit V1MembershipRecognized(msg.sender);
        }

        uint256 nextSeat = memberCount + 1;
        if (nextSeat > FINAL_SEAT) revert SaleConcluded();

        (uint16 era, uint64 synPerUsdc, uint256 minUsdc6) = _eraInfoForSeat(nextSeat);
        if (usdcIn < minUsdc6) revert BelowEraMinimum(minUsdc6);

        uint256 spentThisEra = usdcByAddressEra[msg.sender][era];
        if (spentThisEra + usdcIn > MAX_USDC_PER_ADDRESS_PER_ERA) {
            revert AddressEraCapExceeded(MAX_USDC_PER_ADDRESS_PER_ERA - spentThisEra);
        }

        uint256 synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18; // exact, no division
        if (synOut < minSynOut) revert SlippageExceeded(synOut, minSynOut);

        uint256 available = SYN.balanceOf(address(this));
        if (synOut > available) revert InsufficientInventory(available);

        // splits: 70/20/10 (remainder-safe), referral from Ops only
        uint256 vaultAmt = (usdcIn * 70) / 100;
        uint256 liqAmt = (usdcIn * 20) / 100;
        uint256 opsSlice = usdcIn - vaultAmt - liqAmt; // exact ~10% remainder
        uint256 refAmt = 0;
        bool referralValid = referrer != address(0) && referrer != msg.sender && knownMember[referrer];
        if (referralValid) refAmt = opsSlice / 2; // 5% of gross
        uint256 opsAmt = opsSlice - refAmt;

        // ---- EFFECTS ----
        bool firstSeat = !knownMember[msg.sender];
        uint256 assignedNumber;
        if (firstSeat) {
            knownMember[msg.sender] = true;
            memberCount = nextSeat;
            memberNumberOf[msg.sender] = nextSeat;
            assignedNumber = nextSeat;
        } else {
            assignedNumber = memberNumberOf[msg.sender]; // 0 for V1 members; indexer is source
        }
        usdcByAddressEra[msg.sender][era] = spentThisEra + usdcIn;
        usdcContributed[msg.sender] += usdcIn;
        totalUsdcRaised += usdcIn;
        totalSynSold += synOut;
        if (era != lastEra) {
            emit EraAdvanced(lastEra, era, nextSeat); // boundary seat, not buyer #
            lastEra = era;
        }

        // ---- INTERACTIONS ----
        _safeTransferFrom(USDC, msg.sender, address(this), usdcIn);
        _safeTransfer(USDC, VAULT, vaultAmt);
        _safeTransfer(USDC, LIQUIDITY, liqAmt);
        _safeTransfer(USDC, OPERATIONS, opsAmt);

        bool escrowed = false;
        if (refAmt > 0) {
            try USDC.transfer(referrer, refAmt) returns (bool ok) {
                if (!ok) { referralOwed[referrer] += refAmt; escrowed = true; }
            } catch {
                referralOwed[referrer] += refAmt; escrowed = true;
            }
            emit ReferralAttributed(referrer, msg.sender, assignedNumber, refAmt, escrowed);
        }

        _safeTransfer(SYN, msg.sender, synOut);

        emit Routed(assignedNumber, vaultAmt, liqAmt, opsAmt, refAmt);
        emit Purchased(msg.sender, assignedNumber, era, usdcIn, synOut, synPerUsdc, firstSeat);
    }

    function claimReferral() external nonReentrant {
        uint256 amt = referralOwed[msg.sender];
        if (amt == 0) revert NothingToClaim();
        referralOwed[msg.sender] = 0;
        _safeTransfer(USDC, msg.sender, amt);
        emit ReferralClaimed(msg.sender, amt);
    }

    // ================================================================ views
    function quote(uint256 usdcIn)
        external
        view
        returns (uint256 synOut, uint16 era, uint64 synPerUsdc, uint256 seatIfFirst, uint256 available)
    {
        uint256 nextSeat = memberCount + 1;
        if (nextSeat > FINAL_SEAT) revert SaleConcluded();
        uint256 minUsdc6;
        (era, synPerUsdc, minUsdc6) = _eraInfoForSeat(nextSeat);
        synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18;
        seatIfFirst = nextSeat;
        available = SYN.balanceOf(address(this));
    }

    function currentEra() external view returns (uint16) {
        uint256 nextSeat = memberCount + 1;
        if (nextSeat > FINAL_SEAT) return 0;
        return _eraIndexForSeat(nextSeat);
    }

    function nextSeatNumber() external view returns (uint256) { return memberCount + 1; }
    function availableSyn() external view returns (uint256) { return SYN.balanceOf(address(this)); }
    function isConcluded() public view returns (bool) { return memberCount >= FINAL_SEAT; }
    function eraOfSeat(uint256 seat) external pure returns (uint16) { return _eraIndexForSeat(seat); }

    // ============================================================ admin (min)
    function pause() external onlyOwner { paused = true; emit Paused(msg.sender); }
    function unpause() external onlyOwner { paused = false; emit Unpaused(msg.sender); }

    /// @notice Return remaining unsold SYN to the immutable Vault. Allowed only
    ///         when concluded OR paused (deliberate wind-down for inventory
    ///         dust). Destination is Vault-only: no discretionary SYN drain.
    function recoverUnsoldSyn() external onlyOwner {
        if (!isConcluded() && !paused) revert NotWindingDown();
        uint256 bal = SYN.balanceOf(address(this));
        _safeTransfer(SYN, VAULT, bal);
        emit UnsoldSynRecovered(VAULT, bal);
    }

    /// @notice Rescue tokens sent here by mistake. CANNOT touch USDC or SYN.
    function rescueToken(address token) external onlyOwner {
        if (token == address(USDC) || token == address(SYN)) revert ProtectedToken();
        IERC20 t = IERC20(token);
        _safeTransfer(t, VAULT, t.balanceOf(address(this)));
    }

    function transferOwnership(address newOwner) external onlyOwner {
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "not pending owner");
        address prev = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(prev, owner);
    }

    // ====================================================== era schedule (pure)
    // Boundaries are GLOBAL seat numbers; match src/lib/eras.ts exactly.
    function _eraInfoForSeat(uint256 seat)
        internal
        pure
        returns (uint16 era, uint64 synPerUsdc, uint256 minUsdc6)
    {
        if (seat <= 333)       return (1, 100, 5_000_000);   // Genesis (V1-only)
        if (seat <= 1_000)     return (2, 50, 10_000_000);
        if (seat <= 3_333)     return (3, 40, 10_000_000);
        if (seat <= 10_000)    return (4, 16, 25_000_000);
        if (seat <= 25_000)    return (5, 12, 25_000_000);
        if (seat <= 50_000)    return (6, 6, 50_000_000);
        if (seat <= 100_000)   return (7, 4, 50_000_000);
        if (seat <= 250_000)   return (8, 2, 100_000_000);
        if (seat <= 1_000_000) return (9, 1, 100_000_000);
        revert SaleConcluded();
    }

    function _eraIndexForSeat(uint256 seat) internal pure returns (uint16 era) {
        (era,,) = _eraInfoForSeat(seat);
    }

    // ===================================================== merkle (stub)
    // Production: replace with OpenZeppelin MerkleProof.verify and a
    // standardized double-hashed leaf. This sorted-pair stub is illustrative.
    function _verifyV1(bytes32[] calldata proof, address who) internal view returns (bool) {
        if (V1_MEMBER_ROOT == bytes32(0)) return false;
        bytes32 h = keccak256(abi.encodePacked(who));
        for (uint256 i; i < proof.length; ++i) {
            bytes32 p = proof[i];
            h = h <= p ? keccak256(abi.encodePacked(h, p)) : keccak256(abi.encodePacked(p, h));
        }
        return h == V1_MEMBER_ROOT;
    }

    // ===================================================== safe ERC20 (stub)
    // Production: replace with OpenZeppelin SafeERC20.
    function _safeTransfer(IERC20 token, address to, uint256 amount) private {
        if (amount == 0) return;
        require(token.transfer(to, amount), "transfer failed");
    }
    function _safeTransferFrom(IERC20 token, address from, address to, uint256 amount) private {
        require(token.transferFrom(from, to, amount), "transferFrom failed");
    }
}
```

---

## Appendix — alignment ledger (no canon was modified)

| Source | What this design reuses unchanged |
| --- | --- |
| `src/lib/eras.ts` | The 9-era schedule, boundaries, integer rates, minimums. |
| `ERA_ENGINE_V2_RECONCILIATION_SPRINT0.md` | 350M tokenomics solvency, two-layer eras-vs-chapters, referral V2 = fixed 5% from Operations, $100 (not $99) at Eras VIII–IX. |
| `REVENUE_ATTRIBUTION_LAYER.md` | Operations-only referral source, last-verified-referrer, push-then-escrow payout. |
| `SALE_FLOW_INVARIANTS.md` | The six write-path invariants the future buy component must satisfy. |
| `SEAT_RECORD_ARCHITECTURE_DECISION.md` | Identity stays a future ERC-721; V2 does not mint seats. |
| `SOLIDITY_REVIEW_STATE.md` / `SMART_CONTRACT_DECISIONS_PENDING.md` | The mandatory review → Fuji → audit → mainnet gate; EOA→Safe ownership. |

**The single intentional change vs prior canon:** era transitions become
**automatic on-chain**, not founder-activated (Sprint 0 §B5 → reversed per the
updated founder preference). Founder retains pause/unpause only.

*Design/review/draft phase only. No protocol code, config, or canon was
modified. All on-chain figures must be re-read live before any deploy.*
