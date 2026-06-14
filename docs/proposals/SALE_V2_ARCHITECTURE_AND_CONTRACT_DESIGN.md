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

**The headline design decisions:**

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

7. **Dual-bound eras (member range AND per-era SYN cap).** *(Added in the
   economic/security addendum — see §Q.)* Each era now closes on whichever comes
   first: its member-range ceiling, OR an aggregate **per-era SYN sold-cap**
   (`eraSynCap[e]` limiting `soldInEra[e]`). This bounds how much cheap early-era
   SYN can ever be sold — even by many Sybil wallets — without physical buckets:
   caps limit sales against ONE global SYN balance, so unsold early-era capacity
   simply remains for later eras. Two more hard caps were added — a
   **per-transaction USDC max** and a **recovery timelock** on the paused
   wind-down path. `activeEra` is now tracked in storage and rolled forward
   (cap-aware), so the live price comes from `currentEra()`/`quote()`, **not**
   from the seat number alone.

**The single most important structural finding (unchanged, now sharper):** with
**member-number era boundaries + uncapped hybrid purchases + a fixed SYN
allocation, you can only pick two.** The addendum adds the **per-era SYN cap** as
the strongest available throttle: it provably bounds early-era cheap-SYN sales
(`soldInEra[e] ≤ eraSynCap[e]`) and preserves the distribution *shape* across
eras. It still does **not** make "First Million" an on-chain guarantee —
repeat/upgrade buys can consume a cap while issuing few seats, advancing the
price for everyone. **"First Million" remains a narrative target bounded by
funded inventory**, never a contract promise. The optional hard-reserve that
*would* guarantee 1M seats (at the cost of restricting hybrid upgrades) is laid
out as **Human Review J16**.

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

> **Addendum sharpening (§Q1):** the per-era SYN cap added in the addendum does
> not dissolve this trilemma — it lets you *choose which two* by bounding (b) per
> era. With caps, early-era cheap-SYN sales are provably bounded
> (`soldInEra[e] ≤ eraSynCap[e]`); the cost is that a member's **price is no
> longer fixed by their seat number** — a cap exhausted by early whales advances
> the era (price) for everyone, so member ranges become *ceilings*, not exact
> price brackets. See §Q1 for the full analysis.

### C3. Recommended resolution

1. **Keep member-number boundaries** as the narrative + identity spine — but
   treat them as **ceilings**, not exact price brackets (the per-era cap, step 3,
   can advance the price before a range fills).
2. **Cap hybrid purchases per-address, per-era** (`MAX_USDC_PER_ADDRESS_PER_ERA`)
   **and per-transaction** (`MAX_USDC_PER_TX`). Bounds how fast any one wallet can
   drain a cheap era. **Cap value = Human Review J3; per-tx = J14.** A worked
   starting point: capping each address to, say, **$25,000 per era** means
   draining Era II's share requires many distinct funded wallets, not one.
3. **Add an aggregate per-era SYN sold-cap** (`eraSynCap[e]`, addendum §Q1). This
   is the strongest throttle and the one a Sybil swarm **cannot** bypass: it
   bounds the *total* cheap-SYN sold per era (`soldInEra[e] ≤ eraSynCap[e]`)
   against one global SYN balance. The era advances automatically when the range
   ends OR the cap can no longer fit a minimum entry — no deadlock, no founder
   switch. Unsold capacity is not physically reserved, so it stays in the pool for
   later eras. **Cap sizing = Human Review J13.**
4. **Make inventory an honest hard stop.** The contract sells from its own SYN
   balance; a `buy` that would exceed the remaining balance reverts
   `InsufficientInventory`. If the dust left is below every era minimum, the sale
   is *economically* over even though `isConcluded()` (seat #1,000,000) is still
   false. To wind down and return dust SYN to the Vault, the founder **pauses**
   and — after a `RECOVERY_TIMELOCK` (e.g. 7 days) — calls `recoverUnsoldSyn()`
   (Vault-only destination; see §F). The timelock blocks an instant pause+sweep.
   **"First Million" is a *narrative* destination** — if heavy upgrade behavior
   exhausts the allocation early, the sale honestly ends there rather than minting
   more (SYN supply is fixed; **we do not touch it**).
5. **Model the per-era allocation before funding.** Decide funding `F ≤ 350M` for
   V2 with explicit headroom by era, and size each `eraSynCap[e]` from that model.
   Spreadsheet exercise to complete before deploy (**Human Review J2 + J13**).
6. **(Optional) hard-guarantee 1M seats** with a min-entry reserve invariant that
   refuses any buy leaving < the SYN needed to seat every remaining member at the
   minimum. This would make "First Million" a contract guarantee, at the cost of
   restricting late-in-era hybrid upgrades. Deferred as **Human Review J16** —
   *not* in the current draft, which favors honest labeling over the complexity.

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
| `recoverUnsoldSyn()` | **Yes, constrained + timelocked** | Callable when the sale **concluded**, OR when **paused for ≥ `RECOVERY_TIMELOCK`** (e.g. 7 days) — a deliberate, pre-announced wind-down for inventory dust. The timelock blocks an instant pause+sweep. Destination is the **immutable Vault** only — no path drains SYN to the owner, paused or not. |
| `rescueToken(token)` | **Yes, constrained** | Recovers tokens sent by mistake; **cannot** touch USDC or SYN; destination is the immutable Vault. |
| `claimV1Membership(proof)` | **Yes, permissionless** | Not an admin power — any V1 member self-registers via Merkle proof. No owner involvement. |
| `transferOwnership` / `acceptOwnership` | **Yes (2-step)** | Safe handoff to a Safe/multisig (mirrors Archive D1/D6: EOA → Safe ≤ 30 days). |

**Net owner capability:** pause the sale; recover *unsold* SYN to the Vault only
when concluded, or after a timelocked wind-down once paused; rescue mistaken
non-sale tokens to the Vault; hand the keys to a multisig. **No power over price,
splits, destinations, buyer SYN, or referral funds — and no instant
pause-and-sweep of unsold inventory.**

---

## G. Threat model

| # | Threat | Vector | Mitigation in draft |
| --- | --- | --- | --- |
| T1 | Reentrancy | External calls in `buy` (USDC/SYN transfers, referral push) | `nonReentrant` + strict checks-effects-interactions (all state written before any transfer). USDC/SYN are non-callback ERC20s. |
| T2 | Decimal mismatch (6dp↔18dp) | Wrong scaling SYN vs USDC | Single constant `SCALE_6_TO_18 = 1e12`; `synOut = usdcIn × synPerUsdc × 1e12`. Unit tests assert exact values per era. |
| T3 | Rounding / precision drain | Division favoring buyer | **No division in the price path** (integer rates). Split uses remainder assignment (`ops = usdcIn − vault − liq`) so totals are exact with zero dust loss. |
| T4 | Era-boundary race / front-run | Era steps between quote and mine; buyer gets worse rate | `minSynOut` slippage floor reverts the buy if the rate stepped. (Buying *earlier* for a cheaper rate is intended, not an exploit.) |
| T5 | Inventory exhaustion mid-tx | Buy exceeds remaining SYN (global or era cap) | Two checks: `synOut ≤ eraSynCap[e] − soldInEra[e]` → `EraInventoryInsufficient`, and `synOut ≤ availableSyn` → `InsufficientInventory`. Atomic single-era buys (no cross-era partial fills). Frontend quotes via `quote()` (returns `eraCapRemaining` + `available`). |
| T6 | Whale accumulation | One actor (or a Sybil swarm) drains a cheap early era | Three layered caps: `MAX_USDC_PER_TX`, `MAX_USDC_PER_ADDRESS_PER_ERA` (per-address), and the aggregate `eraSynCap[e]` — the last is the only one a Sybil swarm cannot bypass (it bounds *total* per-era sales). See §C / §Q1. |
| T7 | Self-referral / fake referral | Buyer refers self or a non-member to skim Operations | `referrer != buyer` **and** `knownMember[referrer]` required; else `refAmt = 0` and Operations keeps the full slice. |
| T8 | Referral griefing | Blacklisted/reverting referrer bricks the buy | `try/catch` push → escrow to `referralOwed`; buy never reverts on referral failure. `claimReferral()` for withdrawal. |
| T9 | Routing failure | A destination wallet reverts on receive | Vault/Liquidity/Operations are protocol-owned EOAs; plain USDC `transfer` has no hook. (If ever a contract, same escrow pattern would apply — note for J4.) |
| T10 | Owner abuse | Owner drains funds or rugs price | No price/split/wallet setters; no USDC withdrawal; SYN recovery destination is Vault-only. Pause cannot move money. |
| T11 | Pause abuse (griefing) | Owner pauses forever to freeze the sale | Pause cannot *take* anything; worst case is a halted sale, recoverable by unpause or a multisig owner. Accept as residual; mitigate via multisig owner. |
| T12 | Stuck SYN | Unsold dust SYN locked below every era minimum | `recoverUnsoldSyn` is callable when **concluded**, or when **paused for ≥ `RECOVERY_TIMELOCK`** → founder winds down and sweeps dust to the Vault. Resolves the deadlock (was J8) without enabling an instant sweep (T19). |
| T13 | V1/V2 double-count | V1 member treated as a new V2 member; era boundary accelerates; V1 member can't refer | Immutable `V1_MEMBER_ROOT` + `knownMember`: a V1 member supplying a proof (in `buy` or via `claimV1Membership`) is recognized as existing — no new seat, no count++. (Residual: see T17.) |
| T14 | Wrong USDC variant | Bridged vs native USDC | Constructor pins native Avalanche USDC (decision D3); verify on Fuji + mainnet. |
| T15 | Approval/allowance abuse | Infinite approve exploited later | Contract only ever pulls `usdcIn` it just validated; no path spends more than the buyer authorized for that call. |
| T16 | Wallet-drift signing (project's repeated bug) | Tx signed by a different injected account than the UI shows | **Frontend** invariant, not contract: `assertFreshWallet` + `account:` pinning per `docs/SALE_FLOW_INVARIANTS.md` (see §I). |
| T17 | V1 member buys via a non-canonical frontend without a proof | They omit `v1Proof` → treated as a new seat (double-count) | Cannot be prevented on-chain (you can't cheaply prove a *negative*). The canonical frontend MUST attach the proof for known V1 members (§I); residual exposure bounded by ≤333 Genesis members. **Human Review J12.** |
| T18 | Era-cap deadlock | An exhausted era's cap blocks all buys, bricking the sale before #1M | **Avoided by design:** when an era's remaining cap can't fit one minimum entry, `_syncEra` auto-advances to the next era (no revert-until-next, no founder switch). Tested in H8. |
| T19 | Premature pause-and-sweep | Owner pauses then instantly `recoverUnsoldSyn` to pull unsold inventory to the Vault mid-sale | Paused recovery path gated by `RECOVERY_TIMELOCK` (`pausedAt + delay`); `pausedAt` resets on unpause. Destination is still Vault-only (not theft, but a premature-halt power) — timelock + multisig owner (J4/J15) bound it. |
| T20 | Misleading price-by-seat | Users/surfaces assume seat #N always equals the seat-N era price | With per-era caps, a cap exhausted by early whales advances the era before its range fills, so **seat number no longer fixes price**. Mitigation is disclosure: live price comes from `currentEra()`/`quote()`; `EraAdvanced.reason` distinguishes a cap-advance from a boundary open; `eraOfSeat()` is labeled positional-preview. §I + §Q1. |
| T21 | Misleading "First Million" | Marketing implies 1M seats are inventory-guaranteed | Per-era caps bound depletion and shape, but do **not** guarantee 1M seats (repeats can consume a cap with few seats). Doctrine: "First Million" is a narrative target bounded by funded inventory; the hard-reserve that *would* guarantee it is opt-in J16. Legal copy review J10. |

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

### H8. Unit — per-era SYN caps, per-tx cap & timelocked recovery *(addendum)*
- **Cap-triggered advance:** with Era II `eraSynCap` set small, large buys push
  `soldInEra[II]` to where remaining < min-entry; the next `buy` auto-advances to
  Era III and emits `EraAdvanced(2,3,nextSeat,REASON_CAP)` — **even mid member
  range** (member #500 can already be in Era III).
- **No partial fill:** a `buy` whose `synOut` exceeds the active era's remaining
  cap reverts `EraInventoryInsufficient(remaining)`; sizing down to ≤ remaining
  succeeds, and if it leaves < min-entry the *next* buy advances.
- **Exact-cap fill then roll:** filling a cap to the wei leaves remaining 0 →
  next buy advances the era; invariant `soldInEra[e] ≤ eraSynCap[e]` always holds.
- **Boundary vs cap reason:** a range-filled crossing emits `REASON_RANGE` with
  `atSeatNumber = endSeat+1`; a cap-exhausted crossing emits `REASON_CAP` with
  `atSeatNumber = memberCount+1`.
- **Era IX inventory conclusion:** when Era IX remaining cap < its min-entry,
  `isConcluded()` is true and `buy`/`quote` revert `SaleConcluded` *before*
  seat #1,000,000.
- **quote/buy parity:** `quote(usdcIn)` returns the same `era`, `synOut`, and
  `eraCapRemaining` the next `buy(usdcIn,…)` uses (read-only twin ↔ state agree).
- **Repeat-buyer cap exhaustion:** a repeat buyer (no new seat) can still push
  `soldInEra` to the cap and trigger an advance; assert no `memberCount` change.
- **Constructor cap sanity:** deploying with a *sellable* era cap < its min-entry
  reverts `BadEraCaps`; `maxUsdcPerTx == 0` reverts.
- **Per-tx cap:** `usdcIn > MAX_USDC_PER_TX` reverts `ExceedsTxMax`; at the cap it
  succeeds.
- **Timelocked recovery:** while paused but `now < pausedAt + RECOVERY_TIMELOCK`,
  `recoverUnsoldSyn` reverts `RecoveryTimelocked(readyAt)`; after the delay it
  succeeds (Vault); `unpause` resets `pausedAt` so the clock restarts; when
  concluded it succeeds with no delay.
- **Indexer reason handling:** an `EraAdvanced` consumer distinguishes
  `REASON_RANGE` vs `REASON_CAP` and does not claim "era N opened at its range
  start" for a cap-advance.

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
| J13 | Per-era SYN cap sizing (`eraSynCap[1..9]`) | Size each from the funding model (J2). A defensible floor is `rangeSeats × minEntrySyn` so each era can seat its full range at the minimum; add headroom for upgrades. | Sets how much cheap early-era SYN can ever be sold and where the price steps. Too small = price jumps early; too large = early eras can over-consume. |
| J14 | `MAX_USDC_PER_TX` value | Set a sane single-tx ceiling (≥ the largest era minimum). Redundant against a Sybil swarm; primary value is UX + fat-finger safety. | Secondary to per-era/per-address caps; cheap to include. |
| J15 | `RECOVERY_TIMELOCK` duration | 7–14 days suggested; pair with a multisig owner. | Long enough that a pause-and-sweep is visible to members before SYN moves; short enough to wind down real dust. |
| J16 | Hard-guarantee 1M seats? (min-entry reserve invariant) | **Default: no** — keep the honest "narrative target" labeling. Adopt only if a contract-level 1M guarantee is required, accepting restricted late-in-era hybrid upgrades. | The only way per-era caps become a *guarantee*; otherwise repeats can consume a cap with few seats issued. |

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
//  STATUS: UNAUDITED DESIGN DRAFT. Produced during the Sale V2 architecture
//          phase for HUMAN REVIEW ONLY.
//
//  THIS FILE MUST NOT BE:
//    - deployed to any network (mainnet OR testnet) without sign-off,
//    - wired into the frontend / contract-registry,
//    - treated as final or audited.
//
//  HARD CONSTRAINTS HONORED BY THIS DRAFT:
//    - Does NOT modify Sale V1 (0x0020Df30C127306f0F5B44E6a6E4368D2855842d).
//    - Does NOT touch the SYN token (0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170).
//    - Does NOT migrate funds. It only routes NEW USDC from NEW buys to the
//      EXISTING 70/20/10 wallets and pays SYN out of its own funded balance.
//
//  REQUIRED GATE BEFORE ANY DEPLOY (per docs/SOLIDITY_REVIEW_STATE.md +
//  docs/SMART_CONTRACT_DECISIONS_PENDING.md D4/D5):
//    external review (Kemal + ChatGPT) -> Fuji rehearsal -> independent audit
//    -> mainnet. No exceptions.
//
//  Companion design doc:
//    docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md
// =============================================================================
pragma solidity 0.8.24;

// In production, import the audited OpenZeppelin v5 base:
//   import {IERC20}        from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//   import {SafeERC20}     from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//   import {Ownable2Step}  from "@openzeppelin/contracts/access/Ownable2Step.sol";
//   import {Pausable}      from "@openzeppelin/contracts/utils/Pausable.sol";
//   import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
//   import {MerkleProof}   from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
//
// The lightweight interfaces / mixins below are placeholders so the draft reads
// as a single file. DO NOT ship these stubs — use the audited OZ libraries.

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

/**
 * @title  SyndicateSaleV2 (DRAFT)
 * @notice Era-stepped, automatic, immutable membership distribution engine.
 *
 *  DESIGN PILLARS
 *  --------------
 *  1. AUTOMATIC, PRESCRIPTED ERAS. The access rate steps purely as a function
 *     of protocol state (seats issued AND SYN sold per era). No founder switch,
 *     no oracle, no timer. The only privileged power is emergency pause.
 *
 *  2. EXACT INTEGER MATH. Every era's price is an integer number of SYN per
 *     1 USDC (Genesis 100 -> Era IX 1). USDC has 6 decimals, SYN has 18, so:
 *         synOut(18dp) = usdcIn(6dp) * synPerUsdc * 1e12
 *     There is no division in the price path, hence ZERO rounding/precision
 *     loss and no rounding-favoring-buyer drain vector.
 *
 *  3. DUAL-BOUND ERAS (member range AND per-era SYN cap). Each era closes on
 *     whichever comes first: its member-range ceiling is reached, OR its SYN
 *     sold-cap can no longer fit even one minimum entry. This bounds how much
 *     cheap early-era SYN can ever be sold (anti-Sybil at the aggregate level)
 *     WITHOUT physical buckets: caps limit `soldInEra[e]` against ONE global
 *     SYN balance, so unsold early-era capacity simply remains in the pool and
 *     is available to later eras. The era engine NEVER splits a purchase across
 *     two rates: a buy is priced entirely at one era, or it reverts.
 *
 *     IMPORTANT (honesty): per-era caps PRESERVE THE DISTRIBUTION SHAPE and
 *     reduce early depletion. They do NOT by themselves guarantee that exactly
 *     1,000,000 seats are reachable — repeat/upgrade buys can consume a cap
 *     while issuing few seats, advancing the price for everyone. "First Million"
 *     remains a TARGET bounded by funded inventory, not an on-chain guarantee.
 *     See HUMAN REVIEW J13/J16 for the optional hard-reserve alternative.
 *
 *  4. HYBRID PROPORTIONAL PURCHASES. A buyer may pay any amount >= the era
 *     minimum and receives proportional SYN at the current era rate. Whale
 *     accumulation is bounded by THREE independent caps: per-transaction USDC,
 *     per-address-per-era USDC, and the aggregate per-era SYN sold-cap.
 *
 *  5. 70 / 20 / 10 PRESERVED, REFERRAL FROM OPERATIONS ONLY. Vault (70%) and
 *     Liquidity (20%) are NEVER diluted. A 5% referral is carved strictly out
 *     of the 10% Operations slice (i.e. half of Operations). The contract pulls
 *     the full payment in, THEN fans out; the referrer is paid by the CONTRACT
 *     inside the same buy tx, NEVER by the Operations wallet afterwards. No
 *     referrer => Operations keeps the full 10%.
 *
 *  6. CONTINUITY WITH V1 (no double-counting). Member numbers are a single
 *     global sequence. V2 is constructed with the final V1 unique-member count
 *     as an immutable offset, AND with an immutable Merkle root of all V1
 *     member addresses. A V1 member who buys (or registers) in V2 is recognized
 *     as an EXISTING member: they get NO new seat and do NOT advance the seat
 *     boundary. Identity (member #N) remains indexer-derived across both
 *     contracts; the Merkle root only prevents double-counting and enables V1
 *     members to act as referrers.
 */
contract SyndicateSaleV2 {
    // using SafeERC20 for IERC20;  // (production)

    // --------------------------------------------------------------- errors
    error ZeroAddress();
    error BadGenesisOffset();
    error BadEraCaps();
    error SaleConcluded();
    error BelowEraMinimum(uint256 min);
    error ExceedsTxMax(uint256 maxTx);
    error AddressEraCapExceeded(uint256 capRemaining);
    error EraInventoryInsufficient(uint256 eraCapRemaining);
    error InsufficientInventory(uint256 available);
    error SlippageExceeded(uint256 got, uint256 minOut);
    error NotWindingDown();
    error RecoveryTimelocked(uint256 readyAt);
    error NothingToClaim();
    error ProtectedToken();
    error AlreadyKnown();
    error InvalidProof();

    // ----------------------------------------------- era-advance reason codes
    uint8 internal constant REASON_RANGE = 0; // member-range ceiling reached
    uint8 internal constant REASON_CAP   = 1; // era SYN sold-cap exhausted

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
    // `reason` distinguishes a NATURAL boundary open (range filled, atSeatNumber
    // == first seat of the new era) from a CAP-triggered advance (atSeatNumber
    // == the next seat to be issued, which may be mid-range).
    event EraAdvanced(uint16 indexed fromEra, uint16 indexed toEra, uint256 atSeatNumber, uint8 reason);
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
    uint256 public immutable MAX_USDC_PER_TX; // per-transaction ceiling (6dp)

    uint256 private constant GENESIS_END   = 333;
    uint256 private constant FINAL_SEAT    = 1_000_000;
    uint256 private constant SCALE_6_TO_18 = 1e12;
    uint256 public  constant RECOVERY_TIMELOCK = 7 days; // delay on the PAUSED recovery path

    // ------------------------------------------------------------- ownership
    address public owner;
    address public pendingOwner;

    // ---------------------------------------------------------------- state
    bool    public paused;
    uint64  public pausedAt;          // timestamp of the last false->true pause
    uint256 public memberCount;       // global; starts at GENESIS_OFFSET
    uint256 public totalUsdcRaised;   // V2 only (6dp)
    uint256 public totalSynSold;      // V2 only (18dp)
    uint16  public activeEra;         // CURRENT sellable era (advanced, never derived-only)

    // Per-era SYN sold-caps (18dp). Immutable after construction (no setter).
    // eraSynCap[e] limits soldInEra[e]; both indexed by era 1..9.
    mapping(uint16 => uint256) public eraSynCap;
    mapping(uint16 => uint256) public soldInEra;

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
    /**
     * @param genesisOffset  Final V1 unique-member count at handoff. MUST be
     *                       >= 333 so V2 only ever sells Era II+ (Genesis is
     *                       V1-only). See HUMAN REVIEW item J1.
     * @param v1MemberRoot   Merkle root of the V1 member address set, frozen at
     *                       handoff. Lets V2 recognize V1 members without
     *                       double-counting seats. See HUMAN REVIEW item J12.
     * @param maxUsdcPerAddressPerEra  Anti-whale cap in USDC 6dp units (J3).
     * @param maxUsdcPerTx   Per-transaction USDC ceiling, 6dp (J14).
     * @param eraCaps        Per-era SYN sold-caps (18dp), index 0..8 => era 1..9.
     *                       Era 1 (Genesis) is unused by V2 (may be 0). Each
     *                       SELLABLE era's cap MUST fit at least one minimum
     *                       entry; recommended sizing per funding model (J13).
     *
     *  NOTE: This constructor does NOT pull SYN. The contract must be funded
     *  with its membership-distribution SYN allocation in a SEPARATE,
     *  explicitly-authorized transaction AFTER review (honors "do not migrate
     *  funds" during the design phase).
     */
    constructor(
        address usdc,
        address syn,
        address vault,
        address liquidity,
        address operations,
        uint256 genesisOffset,
        bytes32 v1MemberRoot,
        uint256 maxUsdcPerAddressPerEra,
        uint256 maxUsdcPerTx,
        uint256[9] memory eraCaps
    ) {
        if (
            usdc == address(0) || syn == address(0) || vault == address(0) ||
            liquidity == address(0) || operations == address(0)
        ) revert ZeroAddress();
        if (genesisOffset < GENESIS_END || genesisOffset >= FINAL_SEAT) revert BadGenesisOffset();
        if (maxUsdcPerTx == 0) revert BadEraCaps();

        USDC = IERC20(usdc);
        SYN = IERC20(syn);
        VAULT = vault;
        LIQUIDITY = liquidity;
        OPERATIONS = operations;
        GENESIS_OFFSET = genesisOffset;
        V1_MEMBER_ROOT = v1MemberRoot;
        MAX_USDC_PER_ADDRESS_PER_ERA = maxUsdcPerAddressPerEra;
        MAX_USDC_PER_TX = maxUsdcPerTx;

        memberCount = genesisOffset;
        uint16 startEra = _eraIndexForSeat(genesisOffset + 1);
        activeEra = startEra;

        // Each SELLABLE era's cap must fit at least one minimum entry, else the
        // era would be dead-on-arrival (instantly skipped). Full sizing is J13.
        for (uint16 e = startEra; e <= 9; ++e) {
            uint256 cap = eraCaps[e - 1];
            if (cap < _minEntrySyn(e)) revert BadEraCaps();
            eraSynCap[e] = cap;
        }
        // Non-sellable lower eras (e < startEra, e.g. Genesis) keep their cap
        // value verbatim for transparency; they are never sold by V2.
        for (uint16 e = 1; e < startEra; ++e) {
            eraSynCap[e] = eraCaps[e - 1];
        }

        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // =================================================== V1 recognition
    /// @notice Register as an existing V1 member (e.g. to act as a referrer)
    ///         without buying. Idempotent; reverts if already known or proof bad.
    function claimV1Membership(bytes32[] calldata proof) external {
        if (knownMember[msg.sender]) revert AlreadyKnown();
        if (!_verifyV1(proof, msg.sender)) revert InvalidProof();
        knownMember[msg.sender] = true;
        emit V1MembershipRecognized(msg.sender);
    }

    // ============================================================ purchase
    /**
     * @notice Buy SYN at the CURRENT era rate. Hybrid/proportional, single-era.
     * @param usdcIn    USDC amount (6dp). Must be >= current era minimum and
     *                  <= MAX_USDC_PER_TX, and fit the per-address-per-era cap.
     * @param referrer  Optional referrer (existing member, not self). 0 = none.
     * @param minSynOut Slippage floor.
     * @param v1Proof   Merkle proof that msg.sender is a V1 member. Pass an
     *                  EMPTY array for protocol-newcomers and already-known
     *                  members. Supplying it for a V1 member prevents a new
     *                  (double-counted) seat being issued.
     *
     *  NO SILENT SPLIT / NO PARTIAL FILL: a purchase is priced entirely at one
     *  era. If it cannot fit the active era's remaining SYN cap, it REVERTS
     *  (`EraInventoryInsufficient`) — the buyer sizes down. The era only
     *  advances between buys, automatically, via `_syncEra`.
     */
    function buy(uint256 usdcIn, address referrer, uint256 minSynOut, bytes32[] calldata v1Proof)
        external
        nonReentrant
        whenNotPaused
    {
        // Recognize V1 membership first so a returning V1 member is NOT minted
        // a new seat / does NOT advance the seat boundary.
        if (v1Proof.length > 0 && !knownMember[msg.sender] && _verifyV1(v1Proof, msg.sender)) {
            knownMember[msg.sender] = true;
            emit V1MembershipRecognized(msg.sender);
        }

        // Roll the era forward (emits EraAdvanced per step) and detect conclusion.
        (uint16 era, bool concluded) = _syncEra();
        if (concluded || memberCount >= FINAL_SEAT) revert SaleConcluded();

        (uint64 synPerUsdc, uint256 minUsdc6,) = _eraParams(era);
        if (usdcIn < minUsdc6) revert BelowEraMinimum(minUsdc6);
        if (usdcIn > MAX_USDC_PER_TX) revert ExceedsTxMax(MAX_USDC_PER_TX);

        // anti-whale: per-address, per-era cumulative USDC cap
        uint256 spentThisEra = usdcByAddressEra[msg.sender][era];
        if (spentThisEra + usdcIn > MAX_USDC_PER_ADDRESS_PER_ERA) {
            revert AddressEraCapExceeded(MAX_USDC_PER_ADDRESS_PER_ERA - spentThisEra);
        }

        // exact pricing (no division)
        uint256 synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18;
        if (synOut < minSynOut) revert SlippageExceeded(synOut, minSynOut);

        // per-era aggregate SYN sold-cap (NO partial fill — revert if it won't fit)
        uint256 eraRemaining = eraSynCap[era] - soldInEra[era];
        if (synOut > eraRemaining) revert EraInventoryInsufficient(eraRemaining);

        // global inventory (the contract's own funded SYN balance)
        uint256 available = SYN.balanceOf(address(this));
        if (synOut > available) revert InsufficientInventory(available);

        // splits (70/20/10, remainder-safe; referral from Ops only)
        uint256 vaultAmt = (usdcIn * 70) / 100;
        uint256 liqAmt = (usdcIn * 20) / 100;
        uint256 opsSlice = usdcIn - vaultAmt - liqAmt; // exact remainder == ~10%
        uint256 refAmt = 0;
        bool referralValid = referrer != address(0) && referrer != msg.sender && knownMember[referrer];
        if (referralValid) refAmt = opsSlice / 2; // fixed 5% of gross
        uint256 opsAmt = opsSlice - refAmt;

        // ================= EFFECTS (state before interactions) =============
        bool firstSeat = !knownMember[msg.sender];
        uint256 assignedNumber;
        if (firstSeat) {
            knownMember[msg.sender] = true;
            memberCount += 1;
            memberNumberOf[msg.sender] = memberCount;
            assignedNumber = memberCount;
        } else {
            // 0 for recognized V1 members (indexer is the authoritative source).
            assignedNumber = memberNumberOf[msg.sender];
        }

        soldInEra[era] += synOut;
        usdcByAddressEra[msg.sender][era] = spentThisEra + usdcIn;
        usdcContributed[msg.sender] += usdcIn;
        totalUsdcRaised += usdcIn;
        totalSynSold += synOut;

        // ================= INTERACTIONS ====================================
        // Pull the FULL payment into the contract, THEN fan out. The referrer
        // is paid by THIS CONTRACT (never by the Operations wallet afterwards).
        // Order mirrors the canonical flow: Vault -> Liquidity -> Referrer -> Ops.
        _safeTransferFrom(USDC, msg.sender, address(this), usdcIn);
        _safeTransfer(USDC, VAULT, vaultAmt);
        _safeTransfer(USDC, LIQUIDITY, liqAmt);

        bool escrowed = false;
        if (refAmt > 0) {
            // Try push; escrow on failure (e.g. USDC blacklist) so the BUY IS
            // NEVER BLOCKED by a bad referrer. opsAmt is ALREADY net of refAmt,
            // so the Operations wallet is paid its reduced slice regardless.
            try USDC.transfer(referrer, refAmt) returns (bool ok) {
                if (!ok) { referralOwed[referrer] += refAmt; escrowed = true; }
            } catch {
                referralOwed[referrer] += refAmt; escrowed = true;
            }
            emit ReferralAttributed(referrer, msg.sender, assignedNumber, refAmt, escrowed);
        }

        _safeTransfer(USDC, OPERATIONS, opsAmt);
        _safeTransfer(SYN, msg.sender, synOut);

        emit Routed(assignedNumber, vaultAmt, liqAmt, opsAmt, refAmt);
        emit Purchased(msg.sender, assignedNumber, era, usdcIn, synOut, synPerUsdc, firstSeat);
    }

    /// @notice Referrer claims any escrowed commission (pull fallback).
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
        returns (
            uint256 synOut,
            uint16 era,
            uint64 synPerUsdc,
            uint256 seatIfFirst,
            uint256 available,
            uint256 eraCapRemaining
        )
    {
        bool concluded;
        (era, concluded) = _resolveEraView();
        if (concluded || memberCount >= FINAL_SEAT) revert SaleConcluded();
        (synPerUsdc,,) = _eraParams(era);
        synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18;
        seatIfFirst = memberCount + 1;
        available = SYN.balanceOf(address(this));
        eraCapRemaining = eraSynCap[era] - soldInEra[era];
    }

    function currentEra() external view returns (uint16) {
        (uint16 era, bool concluded) = _resolveEraView();
        return concluded ? 0 : era; // 0 == concluded
    }

    function remainingEraCap(uint16 era) external view returns (uint256) {
        uint256 cap = eraSynCap[era];
        uint256 sold = soldInEra[era];
        return cap > sold ? cap - sold : 0;
    }

    function nextSeatNumber() external view returns (uint256) { return memberCount + 1; }
    function availableSyn() external view returns (uint256) { return SYN.balanceOf(address(this)); }

    function isConcluded() public view returns (bool) {
        if (memberCount >= FINAL_SEAT) return true;
        (, bool concluded) = _resolveEraView();
        return concluded;
    }

    /// @notice POSITIONAL preview only — the era a seat WOULD fall in by member
    ///         range alone. NOT the executable price: cap-triggered advances mean
    ///         the live price comes from `currentEra()`/`quote()`, not seat number.
    function eraOfSeat(uint256 seat) external pure returns (uint16) { return _eraIndexForSeat(seat); }

    // ===================================================== era engine (state)
    /// @dev Roll `activeEra` forward while the current era is closed (member
    ///      range reached OR its cap can't fit a minimum entry). Emits one
    ///      EraAdvanced per step with the triggering reason + seat. Mutating
    ///      twin of `_resolveEraView`.
    function _syncEra() internal returns (uint16 era, bool concluded) {
        era = activeEra == 0 ? 1 : activeEra;
        while (true) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(era);
            uint256 minEntry = minU * uint256(spu) * SCALE_6_TO_18;
            bool rangeFilled = memberCount >= endSeat;
            bool capExhausted = (eraSynCap[era] - soldInEra[era]) < minEntry;
            if (!rangeFilled && !capExhausted) { concluded = false; break; }
            if (era == 9) { concluded = true; break; }
            uint8 reason = rangeFilled ? REASON_RANGE : REASON_CAP;
            uint256 atSeat = rangeFilled ? endSeat + 1 : memberCount + 1;
            emit EraAdvanced(era, era + 1, atSeat, reason);
            era += 1;
        }
        if (era != activeEra) activeEra = era;
    }

    /// @dev Read-only twin of `_syncEra` for views (no emit, no state write).
    function _resolveEraView() internal view returns (uint16 era, bool concluded) {
        era = activeEra == 0 ? 1 : activeEra;
        while (true) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(era);
            uint256 minEntry = minU * uint256(spu) * SCALE_6_TO_18;
            bool rangeFilled = memberCount >= endSeat;
            bool capExhausted = (eraSynCap[era] - soldInEra[era]) < minEntry;
            if (!rangeFilled && !capExhausted) return (era, false);
            if (era == 9) return (9, true);
            era += 1;
        }
    }

    // ============================================================ admin (min)
    function pause() external onlyOwner {
        if (!paused) { paused = true; pausedAt = uint64(block.timestamp); }
        emit Paused(msg.sender);
    }
    function unpause() external onlyOwner {
        paused = false;
        pausedAt = 0;
        emit Unpaused(msg.sender);
    }

    /// @notice Return remaining unsold SYN to the immutable Vault. Allowed when:
    ///           - the sale has CONCLUDED (all seats issued, or era 9 inventory
    ///             can no longer fit a minimum entry); OR
    ///           - the sale has been PAUSED for at least RECOVERY_TIMELOCK
    ///             (deliberate, pre-announced wind-down — e.g. dust below any
    ///             era minimum).
    ///         The timelock blocks an instant pause+sweep; destination is
    ///         Vault-only (no discretionary owner SYN drain exists, ever). A
    ///         multisig owner is recommended (J4/J15).
    function recoverUnsoldSyn() external onlyOwner {
        bool concluded = isConcluded();
        if (!concluded) {
            if (!paused) revert NotWindingDown();
            uint256 readyAt = uint256(pausedAt) + RECOVERY_TIMELOCK;
            if (pausedAt == 0 || block.timestamp < readyAt) revert RecoveryTimelocked(readyAt);
        }
        uint256 bal = SYN.balanceOf(address(this));
        _safeTransfer(SYN, VAULT, bal);
        emit UnsoldSynRecovered(VAULT, bal);
    }

    /// @notice Rescue tokens sent here by mistake. CANNOT touch USDC or SYN.
    ///         Destination is the immutable Vault.
    function rescueToken(address token) external onlyOwner {
        if (token == address(USDC) || token == address(SYN)) revert ProtectedToken();
        IERC20 t = IERC20(token);
        _safeTransfer(t, VAULT, t.balanceOf(address(this)));
    }

    // 2-step ownership (use OZ Ownable2Step in prod).
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
    // IMMUTABLE, hardcoded in bytecode. Boundaries are GLOBAL seat numbers and
    // match src/lib/eras.ts exactly. synPerUsdc is an exact integer per era.
    // `_eraParams` (indexed by era) is THE single source; `_eraIndexForSeat`
    // derives the positional era from a seat by walking this table.
    function _eraParams(uint16 era)
        internal
        pure
        returns (uint64 synPerUsdc, uint256 minUsdc6, uint256 endSeat)
    {
        if (era == 1) return (100, 5_000_000, 333);       // Genesis (V1-only)
        if (era == 2) return (50, 10_000_000, 1_000);
        if (era == 3) return (40, 10_000_000, 3_333);
        if (era == 4) return (16, 25_000_000, 10_000);
        if (era == 5) return (12, 25_000_000, 25_000);
        if (era == 6) return (6, 50_000_000, 50_000);
        if (era == 7) return (4, 50_000_000, 100_000);
        if (era == 8) return (2, 100_000_000, 250_000);
        if (era == 9) return (1, 100_000_000, 1_000_000);
        revert SaleConcluded();
    }

    /// @dev Minimum-entry SYN (18dp) for an era: minUsdc6 * synPerUsdc * 1e12.
    function _minEntrySyn(uint16 era) internal pure returns (uint256) {
        (uint64 spu, uint256 minU,) = _eraParams(era);
        return minU * uint256(spu) * SCALE_6_TO_18;
    }

    function _eraIndexForSeat(uint256 seat) internal pure returns (uint16) {
        for (uint16 e = 1; e <= 9; ++e) {
            (,, uint256 endSeat) = _eraParams(e);
            if (seat <= endSeat) return e;
        }
        revert SaleConcluded();
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

## M. Changelog — first draft → fixed draft

Three findings from the architect review were fixed in **both** this report and
`docs/proposals/drafts/SyndicateSaleV2.draft.sol`. Nothing else in the economic
model changed.

| # | Area | First draft (before) | Fixed draft (after) | Why |
| --- | --- | --- | --- | --- |
| 1 | **V1 continuity / double-counting** | V2 only had a numeric `GENESIS_OFFSET`. A returning V1 member buying in V2 was treated as a brand-new buyer: minted a **new seat**, **incremented `memberCount`** (nudging the era boundary), and — because they were not yet `knownMember` — **could not be a referrer**. | Added immutable `V1_MEMBER_ROOT` (Merkle root of V1 member addresses) + `knownMember` map + permissionless `claimV1Membership(proof)` + an inline `bytes32[] v1Proof` arg on `buy()`. A proven V1 member is recognized as **existing**: no new seat, no `memberCount++`, `firstSeat=false`, and immediately eligible as a referrer. New errors `InvalidProof`/`AlreadyKnown`, event `V1MembershipRecognized`, threats **T13/T17**. | Prevents the V1→V2 boundary from being corrupted and lets V1 members refer. Residual (member buying via a non-canonical UI without a proof) is documented as **T17 / J12**, bounded by ≤333 Genesis members. |
| 2 | **`EraAdvanced` reported the wrong seat** | The event reported the **triggering buyer's** member number. If the tx that crossed a boundary was a *repeat* buyer (who gets no new number), the "era opened at seat #X" value was wrong/misleading. | `EraAdvanced(fromEra, toEra, atSeatNumber)` now emits `atSeatNumber = nextSeat` — **the first seat of the new era** — computed before the firstSeat/repeat branch, so it is correct regardless of who triggers the crossing. | The era-open event is the canonical hook for an Activity/Chronicle "an era opened" candidate; it must name the boundary seat, not an arbitrary buyer. |
| 3 | **Unsold-SYN dust deadlock** | `recoverUnsoldSyn` was callable **only when concluded** (seat #1,000,000 issued). If heavy upgrades exhausted inventory *before* #1,000,000, the sale could never conclude, so leftover dust SYN (below every era minimum) was **permanently locked**. | `recoverUnsoldSyn` is now callable when **concluded OR paused**, with the destination still **Vault-only**. Founder pauses, then sweeps dust to the Vault. Captured as threat **T12**; **J8** marked resolved. | Removes a permanent-lock failure mode **without** adding any owner SYN-drain path — the destination remains the immutable Vault, paused or not. |

> `buy()`'s signature changed across the fix:
> `buy(uint256 usdcIn, address referrer, uint256 minSynOut, bytes32[] calldata v1Proof)`.
> Newcomers and already-known members pass an **empty** `v1Proof`.

### M2. Economic / security addendum (this revision)

A second pass — the **economic/security addendum** — added inventory and admin
hardening on top of the three fixes above. Economic doctrine (rates, splits,
wallets, 70/20/10, referral 5%) is **unchanged**; these are bounds and clarity.

| # | Area | Before | After | Why |
| --- | --- | --- | --- | --- |
| 4 | **Per-era SYN sold-cap** | One global SYN balance; early eras could over-consume cheap SYN (a Sybil swarm bypassed the per-address cap). | Immutable `eraSynCap[1..9]` + `soldInEra[e]`; a buy reverts `EraInventoryInsufficient` if it won't fit; `soldInEra[e] ≤ eraSynCap[e]` always. Bounds total cheap-SYN per era without physical buckets. | The only throttle a Sybil swarm can't bypass; protects distribution shape. (§Q1, T6) |
| 5 | **Stateful, cap-aware era engine** | Era derived purely from `memberCount+1`. | `activeEra` stored and rolled forward by `_syncEra` (range-end OR cap-can't-fit-min); `quote`/`currentEra` use the read-only twin. Price now comes from contract state, not seat number. | A cap can advance the era mid-range; seat number alone can no longer fix price. (§Q1, T20) |
| 6 | **`EraAdvanced` reason + seat** | `EraAdvanced(from,to,atSeat)`. | `EraAdvanced(from,to,atSeatNumber,reason)` — `REASON_RANGE` (boundary, seat = `endSeat+1`) vs `REASON_CAP` (cap, seat = `memberCount+1`). | Indexers must not claim "era opened at its range start" for a cap-advance. (T20) |
| 7 | **Per-transaction cap** | None. | Immutable `MAX_USDC_PER_TX`; `buy` reverts `ExceedsTxMax`. | Simple UX/fat-finger bound (secondary to the per-era/per-address caps). (J14) |
| 8 | **Recovery timelock** | `recoverUnsoldSyn` callable the instant the owner paused. | Paused path gated by `pausedAt + RECOVERY_TIMELOCK`; `pausedAt` set on pause, reset on unpause. Concluded path unchanged. | Blocks an instant pause-and-sweep of unsold inventory; destination still Vault-only. (§Q5, T19) |
| 9 | **Referral fan-out order** | Vault→Liquidity→Operations→Referrer. | Vault→Liquidity→**Referrer**→Operations, with explicit comments + ASCII (§Q4). Behavior identical (amounts pre-computed; `opsAmt` already net). | Makes "the contract pays the referrer, never the Operations EOA" impossible to misread. |
| 10 | **Honest "First Million"** | Implicit. | Explicitly documented as a **narrative target bounded by funded inventory**, not a contract guarantee; opt-in hard-reserve = J16. | Caps preserve shape but can't guarantee 1M seats under heavy upgrades. (§Q1, T21) |

> Constructor signature also changed: it now takes `maxUsdcPerTx` and
> `uint256[9] eraCaps`. New errors `EraInventoryInsufficient`, `ExceedsTxMax`,
> `RecoveryTimelocked`, `BadEraCaps`. New views `remainingEraCap`, cap-aware
> `quote`/`currentEra`/`isConcluded`. `eraOfSeat` is now labeled
> positional-preview only.

---

## N. Critical decisions (quick answers)

- **How V1 members are recognized in V2** — by an **immutable Merkle root** of the
  V1 member address set (`V1_MEMBER_ROOT`), frozen at handoff. A member proves
  inclusion once (inline in `buy` via `v1Proof`, or via the permissionless
  `claimV1Membership`) and is flagged `knownMember`. Identity (member #N) still
  comes from the indexer; the root only proves "already a member."
- **How double-counting is prevented** — a recognized V1 member has
  `knownMember=true`, so `buy()` takes the `firstSeat=false` branch: **no new
  seat, no `memberCount++`, no era nudge.** The on-chain count and the indexer
  ordinal agree by construction when the offset + root are correct.
- **How automatic era transitions work** — `activeEra` is stored and rolled
  forward by `_syncEra` at the start of every `buy` (and previewed by the
  read-only twin in `quote`/`currentEra`). An era closes — automatically, with no
  switch, timer, or oracle — when **either** its member-range ceiling is reached
  **or** its remaining `eraSynCap` can no longer fit one minimum entry.
  `EraAdvanced(from,to,atSeatNumber,reason)` fires once per step: `REASON_RANGE`
  (seat = `endSeat+1`) or `REASON_CAP` (seat = `memberCount+1`).
- **Member-limited, inventory-limited, or both?** — **Both, at two levels.** Each
  era is bounded by a member range **and** an aggregate `eraSynCap[e]`; whichever
  binds first advances the era. On top of that, every `buy` is hard-bounded by the
  contract's global remaining SYN balance. Per-era caps limit `soldInEra[e]`
  against one global pool — no physical buckets, so unsold era capacity stays
  available to later eras.
- **If era inventory is exhausted before the member range ends** — the era's
  `eraSynCap` is a sold-*cap* against one global SYN balance (not a physical
  bucket). When the remaining cap can't fit a minimum entry, `_syncEra`
  **auto-advances** to the next era (next buyers pay the higher rate); buys are
  never blocked and never split, and unsold capacity simply remains in the pool
  for later eras. A buy that exceeds the *current* era's remaining cap reverts
  `EraInventoryInsufficient` (size down — no partial fill). Only when the global
  balance dust is below every era minimum is the sale economically over → founder
  **pauses**, waits `RECOVERY_TIMELOCK`, then `recoverUnsoldSyn()` (dust → Vault).
  SYN is **never** minted to continue.
- **If the member range ends before inventory is exhausted** — at seat
  #1,000,000 the sale concludes; the next `buy` reverts `SaleConcluded` (incl.
  repeat buys). Leftover SYN is swept to the Vault via `recoverUnsoldSyn()`.
  Whether to instead open a future "Million+" era is **J7**.
- **Can large purchases drain an era?** — Bounded at three levels: (a)
  `MAX_USDC_PER_TX` per transaction, (b) `MAX_USDC_PER_ADDRESS_PER_ERA` per
  address per era, and (c) the aggregate `eraSynCap[e]` — the only one a Sybil
  swarm of many wallets **cannot** bypass, because it caps the *total* SYN sold in
  that era. The cost of (c): a cap exhausted early advances the price for everyone
  (seat ≠ fixed price; see §Q1 / T20).
- **Boundary-crossing purchase: rejected or split?** — **Neither split nor
  silently mixed.** A `buy` is priced entirely at the **current** `activeEra`. It
  never straddles two rates: a buy that won't fit the active era's remaining
  `eraSynCap` reverts `EraInventoryInsufficient` (the buyer sizes down), and the
  era only advances *between* buys via `_syncEra`. `minSynOut` reverts if the era
  stepped between quote and mine (T4). There are **no cross-era partial fills.**
- **How referral works / is deferred** — **fixed 5% of gross, carved only from
  the 10% Operations slice** (Vault 70% / Liquidity 20% never diluted). Valid iff
  `referrer != buyer` **and** `knownMember[referrer]`. Push in-tx; on failure
  (e.g. USDC blacklist) **escrow** to `referralOwed` and let the referrer
  `claimReferral()` — the buy is never blocked. Tiered/reputation boosts are
  **deferred to V3** (J5/J6).
- **What admin can do** — `pause`/`unpause`; `recoverUnsoldSyn` (Vault-only, only
  when concluded or paused); `rescueToken` (non-USDC/SYN only, to Vault); 2-step
  `transferOwnership`/`acceptOwnership` (to a multisig).
- **What admin cannot do** — change era rates/boundaries, change the 70/20/10
  split, change any wallet, withdraw USDC, take buyer SYN, or touch escrowed
  referral funds. **Pause cannot move a single dollar.**
- **Can unsold SYN be recovered?** — Yes, via `recoverUnsoldSyn()`, but **only**
  when the sale is concluded, or after the sale has been **paused for ≥
  `RECOVERY_TIMELOCK`** (no instant pause-and-sweep).
- **Where recovered SYN can go** — the **immutable Vault address only**
  (`VAULT`, a constructor immutable). There is no owner/arbitrary destination.
- **Why this does not allow rugging users** — no price/split/wallet setters
  (immutable bytecode); no USDC withdrawal path; SYN recovery is Vault-only and
  gated; buyers receive SYN atomically in the same tx; CEI + `nonReentrant`;
  worst-case owner action is a (reversible) pause, which **takes nothing**.
- **What is immutable** — `USDC`, `SYN`, `VAULT`, `LIQUIDITY`, `OPERATIONS`,
  `GENESIS_OFFSET`, `V1_MEMBER_ROOT`, `MAX_USDC_PER_ADDRESS_PER_ERA`,
  `MAX_USDC_PER_TX`, the per-era `eraSynCap[1..9]` (set once in the constructor,
  no setter), `RECOVERY_TIMELOCK`; the 70/20/10 split; the entire era schedule
  (rates, boundaries, minimums); the `FINAL_SEAT` conclusion.
- **What is configurable** — only at **construction** (offset, root, anti-whale
  cap, wallet/token addresses). At **runtime**: only `paused` and `owner`
  (2-step). Nothing economic is runtime-mutable.

---

## O. Test matrix

| Scenario | Setup | Expected result |
| --- | --- | --- |
| V1 member buys in V2 | `knownMember=false`, valid `v1Proof` | Recognized first: `firstSeat=false`, **no** `memberCount++`, `V1MembershipRecognized` + `Purchased(memberNumber=0)`; pays current era. |
| New V2 member buys | Newcomer, empty proof | `firstSeat=true`, `memberCount++`, `memberNumberOf` set, `Purchased(memberNumber=memberCount+1)`. |
| Same wallet buys twice | Any known member, 2nd `buy` | 2nd: `firstSeat=false`, no new number, pays **current** era rate (not original). |
| Era boundary purchase | Buy that takes count across a boundary (e.g. #333→#334) | `EraAdvanced(from,to,atSeatNumber=boundary seat)` once; that buy priced at the **new** current era; correct even if a repeat buyer triggers it. |
| Too large for remaining era inventory | `uscIn` valid but `synOut > balance` | Revert `InsufficientInventory(available)`; exact-remaining buy succeeds and zeroes inventory. **No partial fill.** |
| Too large for remaining contract inventory | Same as above (one shared balance) | Same `InsufficientInventory`; below-min dust → pause + `recoverUnsoldSyn`. |
| Referral valid | `referrer != buyer`, `knownMember[referrer]` | 5% to referrer, 5% Operations, 70/20 untouched; `ReferralAttributed(escrowed=false)`. |
| Referral invalid (non-member) | `knownMember[referrer]=false` | `refAmt=0`, Operations keeps full 10%, **no** `ReferralAttributed`. |
| Self-referral | `referrer == msg.sender` | `refAmt=0`, Operations keeps full 10%, no attribution. |
| Paused sale | `paused=true`, `buy` | Revert (`whenNotPaused`); `unpause` restores. |
| Recover unsold SYN | concluded **or** paused | Sweeps full SYN balance to **Vault**, `UnsoldSynRecovered`; reverts `NotWindingDown` if neither. |
| Admin abuse cases | owner tries to: set rate/split/wallet (no such fn); withdraw USDC (no path); `rescueToken(USDC/SYN)` → `ProtectedToken`; `recoverUnsoldSyn` while live → `NotWindingDown`; non-pending `acceptOwnership` → revert | All blocked; no path moves buyer funds, USDC, or non-Vault SYN. |
| Blacklisted/reverting referrer | mock USDC reverts transfer→referrer | `buy` succeeds, `referralOwed` credited, `escrowed=true`; `claimReferral` pays; double-claim `NothingToClaim`. |
| Reentrancy | malicious token re-enters `buy`/`claimReferral` | Blocked by `nonReentrant` + CEI. |
| Exact pricing per era | min-entry buy each era II–IX | `synOut == usdcIn × synPerUsdc × 1e12` exactly (e.g. Era II $10→500 SYN, Era IX $100→100 SYN); split sums to `usdcIn`. |

---

## P. Warning list (read before any deploy)

**Must NOT be deployed without external review (hard gate):**
- The draft as-is — it ships **stub** `IERC20`/`SafeERC20`/`MerkleProof`/ownership
  mixins so it reads as one file. **Replace every stub with audited OpenZeppelin
  v5** before any compile-for-deploy.
- Anything before the mandated path completes: **external review (Kemal +
  ChatGPT) → Fuji rehearsal → independent audit → mainnet** (`SOLIDITY_REVIEW_STATE`,
  D4/D5, J11). No exceptions.
- No deploy until `GENESIS_OFFSET` is locked to V1's **actual paused-at** count
  and `V1_MEMBER_ROOT` is built from the **same** frozen snapshot (J1/J12).

**Must be audited:**
- The Merkle verification (replace the illustrative sorted-pair stub with OZ
  `MerkleProof` + standardized double-hashed leaf) and the snapshot/root build.
- The full money path: CEI ordering, `nonReentrant`, exact-integer pricing/splits,
  the `try/catch` referral escrow, and inventory exhaustion behavior.
- Decimal handling (native USDC 6dp ↔ SYN 18dp; `SCALE_6_TO_18`) and overflow at
  realistic ceilings.
- Admin surface: Vault-only SYN recovery gating, `rescueToken` protected-token
  guard, 2-step ownership, pause semantics.
- The anti-whale cap value `MAX_USDC_PER_ADDRESS_PER_ERA` (J3) against a real
  per-era funding model (J2).

**Legal wording to check before live:**
- All era + referral copy for forbidden framing: **no ROI, yield, dividend,
  passive income, profit, revenue-share**. Referral = "direct sales commission"
  only (J10).
- Era-advance copy must be **recognition-only** ("Era II opened at seat #334"),
  never "price went up / buy now."
- Confirm SYN is consistently framed as an experimental utility membership token
  — not equity/debt/a return.

**Frontend / indexer changes required before deployment (separate, reviewed PR — not this phase):**
- `contract-registry.ts`: add V2 address + ABI (never inline).
- `holder-index.ts`: scan **both** V1 `TokensPurchased` and V2 `Purchased`,
  ordered by block+logIndex, one shared canonical scan; `firstSeat` marks member
  creation.
- Build the V1-member Merkle tree from the paused-at snapshot; the buy/referral UI
  **must attach `v1Proof` for any connected wallet that is a V1 member** (mitigates
  T17).
- Buy component → V2 `buy(usdcIn, referrer, minSynOut, v1Proof)`; compute
  `minSynOut` from `quote()` + slippage; read live `currentEra()`/`quote()`.
- Apply the six write-path invariants (`assertFreshWallet`, `account:` pinning,
  chain-registry links, guard-test entry) per `SALE_FLOW_INVARIANTS`.
- `/referral`: reframe tiered preview → **fixed 5% (V2)**; surface
  `claimV1Membership` for V1 referrers.
- Add `era-advanced` + `referral` event kinds across the protocol-event pipeline
  (lockstep edits + tests); extend the localStorage purchase-events cache to V2.

---

## Q. Economic & security addendum (Sale V2 hardening)

> Scope: this addendum answers the founder's seven-part economic/security review.
> It changed **only** this report and the draft `.sol` — no deploy, no Sale V1
> change, no `src/` change, no funds moved. Economic doctrine (rates, splits,
> wallets, referral 5%) is unchanged; these changes are **bounds + clarity**.

### Q1. Inventory model — per-era SYN caps

**Decision: adopt BOTH (A) a member range per era AND (B) a per-era SYN
sold-cap** — implemented as caps on `soldInEra[e]` against ONE global SYN balance
(not physical buckets).

1. **Can the global-inventory draft over-sell cheap early SYN?** Yes. With one
   global balance and only a per-address cap, a swarm of wallets could consume a
   disproportionate share of cheap Era II/III SYN. The aggregate per-era cap
   closes this.
2. **Can many wallets bypass the per-address cap?** Yes — it is Sybil-bypassable.
   The aggregate `eraSynCap[e]` is **not**: it bounds total sales in the era
   regardless of wallet count.
3. **If inventory ends before #1,000,000, is "First Million" only narrative?**
   Yes. It always was, and per-era caps do not change that — they bound depletion
   and shape but cannot guarantee 1M seats under heavy upgrades. We state it
   honestly (T21).
4. **Would per-era buckets better protect economics?** Yes — they are the single
   strongest, non-bypassable throttle on cheap-era sales.
5. **Worth the extra complexity?** Yes, but implemented as **sold-caps against a
   global balance**, which is materially simpler than physical buckets (no
   rollover logic, no stranded inventory).
6. **Should the era advance when range ends OR cap exhausted?** Yes — exactly
   this dual trigger, automatically, in `_syncEra` (no founder switch).
7. **Range ends first, SYN remains?** Unsold capacity is **not** physically
   reserved, so it simply **remains in the global pool for later eras** — the
   cleanest of the three options (roll forward / return to Vault / remain). No
   extra code.
8. **Cap ends first, range not full?** The **next era begins automatically**;
   purchases do **not** revert-until-next (that would deadlock), and the sale does
   **not** pause. Subsequent buyers pay the next era's higher rate.
9. **Cleanest, safest rule for users + indexers?** *"An era closes when its
   member range fills OR its SYN cap can no longer fit one minimum entry,
   whichever comes first. The live era/price is always readable from
   `currentEra()`/`quote()`; `EraAdvanced.reason` says why each step happened."*

**The honest tradeoff (must be stated):** because a cap exhausted by early whales
advances the era before its range fills, **a member's price is no longer fixed by
their seat number** — member ranges become *ceilings*, not exact price brackets.
This is economically self-correcting (early demand steps the price up sooner for
everyone) but it means `src/lib/eras.ts` is a **positional preview**, not the
executable pricing truth for V2 (T20).

**Why not a hard 1M guarantee?** A min-entry reserve invariant *could* guarantee
1M seats, but only by refusing late-in-era hybrid upgrades — contradicting the
hybrid-purchase preference. Deferred as **J16**; the draft favors honest labeling.

### Q2. Market price / arbitrage risk

Scenario: future DEX price $20, Sale V2 Era IX $1 → buyers buy from V2 only to
flip on the DEX.

1. **Can fixed future pricing become an arbitrage machine?** Yes, in principle —
   any below-market fixed price invites arbitrage.
2. **Acceptable because inventory is limited?** Largely yes: arbitrage is bounded
   by the same caps as everything else (per-tx, per-address, aggregate per-era,
   total funded inventory, bounded end at #1M). Arbitrage just means seats sell
   faster — which is the *goal* (membership), not a drain of protocol funds (USDC
   still routes 70/20/10).
3. **Cap future eras harder?** The per-era caps already do this; size late-era
   caps conservatively (J13) if extra protection is wanted.
4. **Should V2 end and require a V3?** **Yes — recommended.** V2 concludes at #1M
   (or inventory end). A future **Sale V3** can re-price for then-current market
   conditions. Do not try to make V2 absorb a 20× market move.
5. **Avoid promising "First Million" inventory if price explodes?** Yes — the
   narrative-target framing + inventory hard-stop + caps already handle this.
6. **Protect without oracle/market logic?** Hard caps (per-tx, per-address,
   per-era, total inventory) + bounded end + the V3 escape hatch.

**No oracle (strongly recommended).** An oracle adds a price-manipulation
surface, a trust dependency, and complexity, and it **contradicts the entire
"prescripted, immutable, don't-trust-verify" model**. The product is membership
at a known schedule, not a market-pegged sale. **Do not add oracle pricing.**

### Q3. Purchase model

**Recommendation: hybrid — "packages" are frontend presets; the contract only
understands a USDC amount.**

1. **Every buy uses the active era rate?** Yes.
2. **Packages = frontend presets only?** Yes.
3. **Contract understands USDC, not package names?** Yes — `buy(usdcIn,…)`.
4. **Max per wallet per era?** Yes — `MAX_USDC_PER_ADDRESS_PER_ERA`.
5. **Max per transaction?** Yes — `MAX_USDC_PER_TX` (added).
6. **Exceeds remaining era inventory → reject or partial-fill?** **Reject**
   (`EraInventoryInsufficient`). No partial fill.
7. **Split across eras?** **Never.** A buy is priced entirely at one era.

Matches the founder stance: no silent split, no surprise partial fill, **clear
revert**.

### Q4. Referral cash flow (must be impossible to misread)

The Operations wallet is a **plain EOA**. It **never** pays the referrer. The
**contract** pulls the full USDC in, then fans out and pays the referrer in the
**same `buy` transaction**.

```
              10 USDC (with a valid referrer)
                        │
                        ▼
              ┌────────────────────────┐
   buyer ───▶ │   Sale V2 contract      │  (pulls the FULL 10 USDC in first)
              └───────────┬────────────┘
                          │  splits computed BEFORE any payout:
                          │    vault = 7.00   liq = 2.00   opsSlice = 1.00
                          │    ref = opsSlice / 2 = 0.50
                          │    ops = opsSlice − ref = 0.50
          ┌───────────────┼────────────────┬────────────────┐
          ▼               ▼                ▼                ▼
       Vault           Liquidity        Referrer         Operations
       7.00 USDC       2.00 USDC        0.50 USDC        0.50 USDC
       (70%)           (20%)            (5%, from Ops)   (5%, net)
```

Without a referrer: Vault 7.00 · Liquidity 2.00 · Operations **1.00** (full 10%).
**Vault and Liquidity are never diluted.**

1. **Exact step the referrer is paid?** Inside `buy()`, after the full
   `transferFrom` pulls USDC in and after state effects, in the fan-out (the
   `refAmt > 0` block) — before the Operations transfer.
2. **Pull-then-fan-out?** Yes — `transferFrom(buyer → contract, usdcIn)` first,
   then all payouts originate from the contract.
3. **Does Operations ever pay the referrer manually?** **No, never.** `opsAmt` is
   already net of `refAmt`; Operations receives only its reduced slice.
4. **If the referrer transfer fails?** It is **escrowed** to `referralOwed` and
   the buy still succeeds; the referrer later calls `claimReferral()`. A bad
   referrer can never brick a buy.
5. **Escrow safe/clear?** Yes — pull-payment fallback, `nonReentrant`,
   `ReferralAttributed(…, escrowed=true)` emitted.
6. **Event shows referral and operations separately?** Yes — `Routed(memberNumber,
   vaultAmount, liquidityAmount, operationsAmount, referralAmount)` carries both,
   and `ReferralAttributed` carries the referral leg explicitly.

### Q5. Admin / recovery rules

1. **Owner can recover unsold SYN?** Yes.
2. **Only paused/concluded?** Yes.
3. **Only to Vault?** Yes — immutable `VAULT`; no other destination exists.
4. **Could owner pause and sweep too early?** This was the gap. Fixed with a
   **timelock**.
5. **Acceptable?** Only with the timelock + (recommended) multisig owner. Even
   then the destination is the Vault (protocol-owned), so it is a *premature-halt*
   power, never theft.
6. **Concluded-only, or paused OR concluded?** **Concluded, OR paused for ≥
   `RECOVERY_TIMELOCK`.** Concluded-only would re-introduce the dust deadlock
   (T12); the timelock keeps the deadlock fix without enabling an instant sweep.
7. **Time delay or multisig?** **Both** — `RECOVERY_TIMELOCK` (J15) + multisig
   owner (J4).
8. **Owner change wallets?** **No** — all wallets immutable. A compromised wallet
   → deploy V3.
9. **Ownable2Step + multisig?** Yes — 2-step in the draft; multisig recommended.

Matches the founder stance: minimal admin, no price changes, no wallet changes,
pause for safety only, recovered SYN never to the owner.

### Q6. Decision table

| Decision | Current draft | Alternative | Recommendation | Why |
| --- | --- | --- | --- | --- |
| Global vs per-era inventory | Per-era **sold-caps** over a global balance | Physical per-era buckets / pure global | **Per-era sold-caps (adopted)** | Bounds cheap-era sales without rollover/stranded-inventory complexity. |
| Member range cap | Yes (#ranges from `eras.ts`) | Drop ranges | **Keep (as ceilings)** | Narrative + identity spine; now an upper bound, not a price guarantee. |
| Per-era SYN cap | **Yes** (`eraSynCap[e]`) | None | **Adopt** | Only throttle a Sybil swarm can't bypass. |
| Per-address per-era cap | Yes | None | **Keep** | Spreads distribution; first anti-whale lever. |
| Per-transaction cap | **Yes** (`MAX_USDC_PER_TX`) | None | **Adopt** | Cheap UX / fat-finger bound (secondary). |
| Buy crossing an era boundary | Revert `EraInventoryInsufficient`; advance only between buys | Split / partial fill | **Revert (adopted)** | No silent split; clear revert; single-era pricing. |
| Unsold era inventory | Remains in the global pool for later eras | Reserve / return to Vault | **Remain in pool** | Simplest + safe; no stranded SYN. |
| Market-price arbitrage protection | Hard caps + bounded end + future V3 | Oracle / peg | **Hard caps, no oracle** | Oracle = manipulation/trust/complexity; contradicts the prescripted schedule. |
| Referral payment flow | Contract pays referrer in-tx (Vault→Liq→Ref→Ops) | Operations pays later | **Contract in-tx (adopted)** | Automatic, atomic; the Operations EOA never pays out. |
| Referral escrow | `referralOwed` + `claimReferral` on push failure | Block the buy on failure | **Escrow (keep)** | A bad referrer can't brick buys. |
| Admin recovery | Concluded OR paused-for-≥-timelock, Vault-only | Concluded-only / instant-paused | **Timelocked (adopted)** | Keeps the dust-deadlock fix; blocks an instant pause+sweep. |
| V1 member recognition | Immutable Merkle root + `knownMember` + proof | Numeric offset only | **Merkle (keep)** | Prevents double-count; lets V1 members refer. |

### Q7. Deltas — what changed, why, new risks, tests, review

**What changed (draft + report in lockstep):**
- Added immutable `eraSynCap[1..9]` + `soldInEra[e]`; stateful cap-aware
  `activeEra` with `_syncEra` / `_resolveEraView`; revert `EraInventoryInsufficient`
  (no partial fill); auto-advance on range-end OR cap-can't-fit-min.
- Added `MAX_USDC_PER_TX` (`ExceedsTxMax`).
- Added `RECOVERY_TIMELOCK` + `pausedAt`; gated the paused recovery path.
- `EraAdvanced` gained a `reason` (RANGE vs CAP) and a correct `atSeatNumber`.
- Reordered the referral fan-out to Vault→Liquidity→Referrer→Operations with
  explicit comments + ASCII; behavior unchanged.
- New views `remainingEraCap`, cap-aware `quote`/`currentEra`/`isConcluded`;
  `eraOfSeat` relabeled positional-preview.
- Constructor now takes `maxUsdcPerTx` + `uint256[9] eraCaps` with a `BadEraCaps`
  sanity check.

**Why:** protect early-era economics against Sybil bypass (aggregate cap),
prevent an inventory deadlock, prevent an instant pause-and-sweep, and make the
referral flow + the honest "First Million" framing impossible to misread.

**New risks introduced (now in the threat model):** T19 premature
pause-and-sweep (→ timelock), T20 seat-no-longer-fixes-price (→ disclosure +
`reason`), T21 misleading "First Million" (→ doctrine + J16/J10). T18 records the
era-cap deadlock that the design *avoids*.

**Tests that must be added (H8):** cap-triggered advance + reason/seat
correctness; no-partial-fill revert; exact-cap-fill then roll; Era IX inventory
conclusion before #1M; quote/buy parity (incl. `eraCapRemaining`); repeat-buyer
cap exhaustion; constructor cap sanity + `maxUsdcPerTx == 0`; per-tx cap;
timelocked recovery (before/after/reset/concluded); indexer `reason` handling.

**Human review items added:** J13 per-era cap sizing, J14 per-tx value, J15
timelock duration, J16 optional hard-reserve for a true 1M guarantee.

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
