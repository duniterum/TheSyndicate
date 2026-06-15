# The Syndicate — Sale V2 Parameter & Treasury Simulation

> **Phase:** ECONOMIC MODELING ONLY. This document changes **no** protocol code,
> config, canon, or Solidity. It does **not** deploy, does **not** modify Sale V1,
> does **not** modify the frontend, and does **not** move funds. It exists to
> choose the exact V2 numeric parameters **before** the contract is reviewed
> line-by-line.
>
> **Companion documents:** `docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md`
> (architecture + §Q addendum) and the draft `docs/proposals/drafts/SyndicateSaleV2.draft.sol`.
> **Schedule source (read-only):** `src/lib/eras.ts`. **Pool source:** `src/lib/syndicate-config.ts`
> (Membership Distribution = **350,000,000 SYN**, 35% of the 1,000,000,000 total).
>
> Date: 2026-06-14. All figures are modeled; on-chain balances (especially V1's
> already-distributed SYN) MUST be re-read live before funding or deploy.

---

## 0. Framing & the one finding that drives everything

Sale V2 sells SYN for USDC across **eras II–IX**, and — under **Model 2**, when the
V1 handoff count is below the Genesis ceiling (333) — the **remaining Genesis (Era I)**
seats too, at Era I pricing (100 SYN/USDC). The figures in this sim assume the
recommended pause-at-333 handoff (Era I fully V1-sealed); a sub-333 handoff simply
adds the unsold Genesis tranche at Era I rates. Genesis is **range-bounded** (no
aggregate SYN cap — `eraCaps[0]` is ignored; the continued tranche is bounded by the
per-address cap and the 333 ceiling; see the deploy sheet §2). Each
era has a **member range** (a seat-count ceiling) and — per the §Q addendum — an
aggregate **`eraSynCap[e]`** that bounds the *total* SYN sold in that era against
ONE global balance. USDC is split **70% Vault / 20% Liquidity / 10% Operations**;
a **5% referral** is carved out of the Operations 10% only.

**The single most important result of this whole simulation:** the cheap early
eras are *physically tiny* in dollar terms. Filling Era II's entire member range
at the minimum is only **$6,670** of USDC; Era III is
**$23,330**. That is **smaller than any sane per-wallet limit.**
Consequently **a single wallet can consume an entire early-era cap in one
transaction in all three models below.** A single global `MAX_USDC_PER_ADDRESS_PER_ERA`
therefore *cannot* protect Era II–III. Early-era protection has to come from one of:

1. the aggregate `eraSynCap[e]` **plus** the optional min-entry **reserve
   invariant** (guarantees seats), or
2. a **per-era** address cap (`MAX_USDC_PER_ADDRESS_PER_ERA` becomes `uint256[9]`).

This is the "needed change" flagged for the line-by-line review (§7, §8). It is
**not** applied to the draft here — per instruction, numbers first.

---

## 1. Per-era minimum inventory floor (entry-only)

"If every member in the range buys exactly the minimum once." This is the **floor**
each era's `eraSynCap` must clear, and the baseline treasury inflow.

| Era | Member range | Seats | Min USDC | SYN/USDC | SYN/min seat | Total SYN (floor) | USDC raised (floor) | Vault 70% | Liquidity 20% | Operations 10% | Referral 5% (all referred) | Ops after referral |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| II · First Thousand | 334–1,000 | 667 | $10 | 50 | 500 | 333,500 | $6,670 | $4,669 | $1,334 | $667 | $334 | $334 |
| III · The Expansion | 1,001–3,333 | 2,333 | $10 | 40 | 400 | 933,200 | $23,330 | $16,331 | $4,666 | $2,333 | $1,167 | $1,167 |
| IV · First Ten Thousand | 3,334–10,000 | 6,667 | $25 | 16 | 400 | 2,666,800 | $166,675 | $116,672 | $33,335 | $16,668 | $8,334 | $8,334 |
| V · Open Era I | 10,001–25,000 | 15,000 | $25 | 12 | 300 | 4,500,000 | $375,000 | $262,500 | $75,000 | $37,500 | $18,750 | $18,750 |
| VI · Open Era II | 25,001–50,000 | 25,000 | $50 | 6 | 300 | 7,500,000 | $1,250,000 | $875,000 | $250,000 | $125,000 | $62,500 | $62,500 |
| VII · Hundred Thousand | 50,001–100,000 | 50,000 | $50 | 4 | 200 | 10,000,000 | $2,500,000 | $1,750,000 | $500,000 | $250,000 | $125,000 | $125,000 |
| VIII · Quarter Million | 100,001–250,000 | 150,000 | $100 | 2 | 200 | 30,000,000 | $15,000,000 | $10,500,000 | $3,000,000 | $1,500,000 | $750,000 | $750,000 |
| IX · First Million | 250,001–1,000,000 | 750,000 | $100 | 1 | 100 | 75,000,000 | $75,000,000 | $52,500,000 | $15,000,000 | $7,500,000 | $3,750,000 | $3,750,000 |
| **V2 total (II–IX)** | 334–1,000,000 | **999,667** | — | — | — | **130,933,500** | **$94,321,675** | **$66,025,172** | **$18,864,335** | **$9,432,168** | **$4,716,084** | **$4,716,084** |

> Including Genesis (333 seats — sold by V1, plus any continued by V2 under Model 2), the full path to 1,000,000 members is
> **131,100,000 SYN** and **≈ $94,323,340** entry-only — matching the architecture
> doc §C1. Of the **350,000,000 SYN** pool that leaves **218,900,000 SYN (62.5%)**
> of headroom for repeats/upgrades — *which is exactly what the per-era caps below
> ration.* Note SYN/min-seat is constant within rate-tiers because min-USDC and
> rate move together; the **USDC raised** column is what actually grows.

---

## 2. Per-era cap proposals — three models

`eraSynCap[e]` is set as a multiple of each era's entry-floor (the "headroom"
that upgrades/repeats may consume before the era advances). Higher multiple = more
upgrade room **and** more of the 350M pool committed early = less protection for
the First Million. The three models differ in headroom, per-wallet limits, and
whether the **reserve invariant** (the only true 1M guarantee, §3) is on.

### Model A — Conservative

**Protect the First Million as much as possible.** Caps barely above the floor (+10–20%), the reserve invariant **ON**, and tight per-wallet limits. Upgrades are minimal; almost everyone pays close to the era minimum. Lowest raise, maximum distribution fairness.

| Era | Floor SYN | Multiple | `eraSynCap[e]` (SYN) | Max USDC if cap fully sold |
| --- | ---: | ---: | ---: | ---: |
| II | 333,500 | ×1.10 | 366,850 | $7,337 |
| III | 933,200 | ×1.10 | 1,026,520 | $25,663 |
| IV | 2,666,800 | ×1.10 | 2,933,480 | $183,343 |
| V | 4,500,000 | ×1.15 | 5,175,000 | $431,250 |
| VI | 7,500,000 | ×1.15 | 8,625,000 | $1,437,500 |
| VII | 10,000,000 | ×1.15 | 11,500,000 | $2,875,000 |
| VIII | 30,000,000 | ×1.20 | 36,000,000 | $18,000,000 |
| IX | 75,000,000 | ×1.20 | 90,000,000 | $90,000,000 |
| **Total** | 130,933,500 | — | **155,626,850** | **$112,960,093** |

- **`MAX_USDC_PER_ADDRESS_PER_ERA`:** $10,000 · **`MAX_USDC_PER_TX`:** $10,000
- **Reserve invariant (1M guarantee):** **ON** · **`RECOVERY_TIMELOCK`:** 14 days
- **Total V2 SYN funding required:** **155,626,850 SYN** (44.5% of the 350M pool)
- **Expected maximum USDC volume** (every era's cap fully sold): **$112,960,093**
- **At max volume →** Vault $79,072,065 · Liquidity $22,592,019 · Operations $11,296,009 · Referral (100% referred) $5,648,005 · Operations after referral $5,648,005

### Model B — Balanced

**Allow meaningful upgrades while protecting future distribution.** Caps at floor +25% (early) to +100% (late), reserve **OFF** (honest "target" wording), moderate per-wallet limits. The recommended balance.

| Era | Floor SYN | Multiple | `eraSynCap[e]` (SYN) | Max USDC if cap fully sold |
| --- | ---: | ---: | ---: | ---: |
| II | 333,500 | ×1.25 | 416,875 | $8,338 |
| III | 933,200 | ×1.25 | 1,166,500 | $29,163 |
| IV | 2,666,800 | ×1.25 | 3,333,500 | $208,344 |
| V | 4,500,000 | ×1.50 | 6,750,000 | $562,500 |
| VI | 7,500,000 | ×1.50 | 11,250,000 | $1,875,000 |
| VII | 10,000,000 | ×1.50 | 15,000,000 | $3,750,000 |
| VIII | 30,000,000 | ×2.00 | 60,000,000 | $30,000,000 |
| IX | 75,000,000 | ×2.00 | 150,000,000 | $150,000,000 |
| **Total** | 130,933,500 | — | **247,916,875** | **$186,433,344** |

- **`MAX_USDC_PER_ADDRESS_PER_ERA`:** $25,000 · **`MAX_USDC_PER_TX`:** $25,000
- **Reserve invariant (1M guarantee):** OFF · **`RECOVERY_TIMELOCK`:** 14 days
- **Total V2 SYN funding required:** **247,916,875 SYN** (70.8% of the 350M pool)
- **Expected maximum USDC volume** (every era's cap fully sold): **$186,433,344**
- **At max volume →** Vault $130,503,341 · Liquidity $37,286,669 · Operations $18,643,334 · Referral (100% referred) $9,321,667 · Operations after referral $9,321,667

### Model C — Aggressive

**Maximize flexibility and USDC raise, accept higher risk.** Uniform 2.5× headroom and large per-wallet limits. Commits **93.5%** of the entire pool — almost no safety buffer; if V1 already distributed more than ~22.7M SYN this model will not even fund. The First Million is least protected and whale/arbitrage exposure is highest.

| Era | Floor SYN | Multiple | `eraSynCap[e]` (SYN) | Max USDC if cap fully sold |
| --- | ---: | ---: | ---: | ---: |
| II | 333,500 | ×2.50 | 833,750 | $16,675 |
| III | 933,200 | ×2.50 | 2,333,000 | $58,325 |
| IV | 2,666,800 | ×2.50 | 6,667,000 | $416,688 |
| V | 4,500,000 | ×2.50 | 11,250,000 | $937,500 |
| VI | 7,500,000 | ×2.50 | 18,750,000 | $3,125,000 |
| VII | 10,000,000 | ×2.50 | 25,000,000 | $6,250,000 |
| VIII | 30,000,000 | ×2.50 | 75,000,000 | $37,500,000 |
| IX | 75,000,000 | ×2.50 | 187,500,000 | $187,500,000 |
| **Total** | 130,933,500 | — | **327,333,750** | **$235,804,188** |

- **`MAX_USDC_PER_ADDRESS_PER_ERA`:** $100,000 · **`MAX_USDC_PER_TX`:** $100,000
- **Reserve invariant (1M guarantee):** OFF · **`RECOVERY_TIMELOCK`:** 7 days
- **Total V2 SYN funding required:** **327,333,750 SYN** (93.5% of the 350M pool)
- **Expected maximum USDC volume** (every era's cap fully sold): **$235,804,188**
- **At max volume →** Vault $165,062,931 · Liquidity $47,160,838 · Operations $23,580,419 · Referral (100% referred) $11,790,209 · Operations after referral $11,790,209

> **Funding ladder:** A = 155,626,850 (44.5%) · B = 247,916,875 (70.8%) · C = 327,333,750 (93.5%).
> **Max-raise ladder:** A = $112,960,093 · B = $186,433,344 · C = $235,804,188.
> Entry-only raise is ~$94.3M in *every* model (caps don't bind if everyone pays the minimum); the model only sets the ceiling on *upgrade* dollars — and, without the reserve invariant, more upgrade dollars means **fewer than 1,000,000 seats** are issued.

---
## 3. The "First Million" decision

**Can the current V2 design (the draft as written — reserve invariant OFF) truly
guarantee 1,000,000 members? → No.**

The per-era caps bound *how much SYN* is sold per era; they do **not** bound *how
many seats* that SYN buys. A repeat/upgrade buyer consumes cap while issuing **zero
or one** new seat. So a cap can be exhausted — advancing the era — long before its
member range fills. Per-era caps protect the *distribution shape and the pool*;
they cannot, by themselves, guarantee the seat count reaches 1,000,000.

**The only thing that would guarantee it — the invariant to add.** A **min-entry
reserve invariant**: on every buy, require that the SYN remaining after the buy is
at least the **entry-floor of all not-yet-issued seats**, costed **era-by-era at
each era's own minimum** (not at one blanket rate):

> `reserve(m) = seatsLeftInCurrentEra × synPerMinSeat[curEra]`
> `           + Σ (capacity[e] × synPerMinSeat[e])  for every later era e`
>
> where `m` = members seated so far. A buy that would leave
> `remainingSYN < reserve(m_after)` is **capped to the reserve boundary or
> reverted.**

This sums each remaining seat at the SYN/min-seat of **its own** era, so it tracks
the real 130,933,500-SYN floor. (A naïve version that reserves every
future seat at the *current* era's rate is wrong — right after Genesis it would
demand ~999,667 × 500 = ~500M SYN, more than the entire pool, and no one could ever
buy through Era II.) Concretely: at the V2 start (member #334) `reserve` equals the
full V2 entry-floor **130,933,500 SYN**, and it falls monotonically as
seats are issued. The recommended **early-eras-only** variant (§7) applies the same
check but only through end-of-Era-IV (member #10,000), reserving **3,933,500 SYN** —
cheap to protect, and it covers exactly the eras where one wallet can drain a cap.

### If we do NOT add it (the draft's current honest stance)

- **"First Million" is a *narrative target bounded by inventory*, not a promise.**
- **Required public wording (mandatory):** "*The Syndicate's distribution schedule
  is designed to seat up to 1,000,000 members. The number of seats actually issued
  depends on how members purchase: larger purchases consume the fixed SYN
  allocation faster. SYN supply is fixed and is never minted to continue. 'First
  Million' is a target, not a guarantee of 1,000,000 seats.*"
- **How to avoid misleading users:** never print "guaranteed", "you will be member
  #X", or a fixed seat-for-price promise; always derive the live era/price from
  `currentEra()`/`quote()` (on-chain), never from a seat number; label every
  forward era FUTURE/illustrative (as `eras.ts` already does); show remaining
  inventory honestly.

### The two options, compared

| | **Option 1 — No hard guarantee** *(draft today)* | **Option 2 — Min-entry reserve invariant** |
| --- | --- | --- |
| 1,000,000 seats | Target, not guaranteed | **Guaranteed** by construction |
| Large/upgrade purchases | Flexible — buy any amount up to the caps | Restricted late-in-era (reserve blocks them) |
| Contract complexity | Lower (already in draft) | Higher (extra invariant on every buy + view) |
| Public promise risk | Must use careful "target" wording | Can state "1,000,000 seats" truthfully |
| Distribution fairness | Good (caps) | Best (seats provably preserved) |
| Treasury raise | Higher (upgrades allowed) | Lower (upgrades throttled near boundaries) |

**Recommendation:** **Option 1 (no hard guarantee) + disciplined wording**, paired
with **Model B caps and the reserve invariant applied to the *early* eras only**
(II–IV), where cheap-SYN exhaustion is most damaging and seats are cheapest to
protect (only 3,933,500 SYN reserved). Reserve the full global Option-2
invariant for a future version unless **Legal** requires an unconditional
"1,000,000 seats" claim — in which case adopt Option 2 wholesale and accept the
upgrade throttle. Rationale: Option 1 matches the existing canon ("don't trust,
verify"; targets not promises), keeps the hybrid purchase model the protocol wants,
and the early-era reserve closes the worst abuse without taxing the whole sale.

> **Status (draft updated since this report):** both simulation-proven *structural*
> corrections are now implemented in `SyndicateSaleV2.draft.sol` (mirrored in §L /
> §M of the architecture doc): (1) the single global address cap is replaced by a
> per-era `maxUsdcPerAddressPerEra[1..9]`, and (2) the seat-reserve is a configurable
> immutable `RESERVE_THROUGH_SEAT` defaulting to seat #10,000 (Eras II–IV =
> 3,933,500 SYN), settable to 1,000,000 (full = 130,933,500 SYN) or 0 (off). Only the
> **parameter values** (the cap ramp J3, the reserve target J16, funding J2) remain
> for the line-by-line human review — the structure is now in code, not deployed.

---

## 4. Arbitrage scenario

Era VIII sells SYN at **$0.50**, Era IX at **$1.00**. Against a future secondary
market:

| Market price / SYN | Era VIII ($0.50) profit | Era IX ($1.00) profit |
| --- | ---: | ---: |
| $2 | 4× | 2× |
| $10 | 20× | 10× |
| $20 | 40× | 20× |

(Earlier eras are far cheaper — Era II is $0.02 — so their multiples are larger
still, but their caps are tiny and most are already behind the live member
boundary.)

- **Can buyers arbitrage the sale?** **Yes, in principle** — any fixed price below
  the market invites it. But it is **self-limiting**: dumping sale-priced SYN into a
  thin DEX pool pushes the market price *down toward the sale price*, and every buy
  routes USDC 70/20/10 (the protocol is funded either way). Arbitrage simply makes
  seats sell *faster* — which is the membership goal, not a loss of protocol funds.
- **Do the per-era caps make this acceptable?** **Yes.** Total arbitrageable SYN per
  era is hard-bounded by `eraSynCap[e]`; per-wallet by the address/tx caps; and the
  whole sale ends at seat #1,000,000 **or at inventory/cap exhaustion, whichever
  comes first**. The blast radius is bounded and pre-disclosed.
- **Should V2 end at Era IX and require a Sale V3?** **Yes — strongly recommended.**
  V2 is an *immutable, prescripted* schedule. It should conclude at #1,000,000 (or
  at inventory end) and a future **Sale V3** can re-price for then-current market
  conditions. Do **not** try to make V2 absorb a 20× market move.
- **Should an oracle be used?** **No.** An oracle adds a price-manipulation surface,
  a trust dependency, and complexity, and it contradicts the entire
  immutable/"don't trust, verify" model. The product is membership at a known
  schedule, not a market-pegged sale.
- **Public wording that avoids price-promise risk:** "*The access rate is a fixed,
  pre-published schedule for membership — not a market price, a discount to market,
  or an investment. SYN is an experimental utility membership token: no ROI, yield,
  dividend, or profit is promised or implied. Any secondary-market price is set by
  third parties and is unrelated to the Syndicate.*"

---
## 5. Referral economics

Flow (the contract pays the referrer; the Operations wallet never does):

```
buyer ──USDC──▶ Sale V2 contract ──┬─▶ Vault       (70%, never diluted)
                                   ├─▶ Liquidity   (20%, never diluted)
                                   ├─▶ Referrer    (5% of gross = half of Operations)
                                   └─▶ Operations  (the remaining 5–10%)
```

Referral is **5% of gross**, carved **only** from the 10% Operations slice. Vault
(70%) and Liquidity (20%) are **mathematically unaffected** by referrals. Below,
per model, at 25% / 50% / 100% of purchases referred, computed on each model's
**maximum** USDC volume.

### Model A — Conservative (max USDC $112,960,093)

| Referred share | Referral paid | Operations gross (10%) | Operations after referral | Vault (70%) | Liquidity (20%) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 25% | $1,412,001 | $11,296,009 | $9,884,008 | $79,072,065 *(unchanged)* | $22,592,019 *(unchanged)* |
| 50% | $2,824,002 | $11,296,009 | $8,472,007 | $79,072,065 *(unchanged)* | $22,592,019 *(unchanged)* |
| 100% | $5,648,005 | $11,296,009 | $5,648,005 | $79,072,065 *(unchanged)* | $22,592,019 *(unchanged)* |

### Model B — Balanced (max USDC $186,433,344)

| Referred share | Referral paid | Operations gross (10%) | Operations after referral | Vault (70%) | Liquidity (20%) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 25% | $2,330,417 | $18,643,334 | $16,312,918 | $130,503,341 *(unchanged)* | $37,286,669 *(unchanged)* |
| 50% | $4,660,834 | $18,643,334 | $13,982,501 | $130,503,341 *(unchanged)* | $37,286,669 *(unchanged)* |
| 100% | $9,321,667 | $18,643,334 | $9,321,667 | $130,503,341 *(unchanged)* | $37,286,669 *(unchanged)* |

### Model C — Aggressive (max USDC $235,804,188)

| Referred share | Referral paid | Operations gross (10%) | Operations after referral | Vault (70%) | Liquidity (20%) |
| --- | ---: | ---: | ---: | ---: | ---: |
| 25% | $2,947,552 | $23,580,419 | $20,632,866 | $165,062,931 *(unchanged)* | $47,160,838 *(unchanged)* |
| 50% | $5,895,105 | $23,580,419 | $17,685,314 | $165,062,931 *(unchanged)* | $47,160,838 *(unchanged)* |
| 100% | $11,790,209 | $23,580,419 | $11,790,209 | $165,062,931 *(unchanged)* | $47,160,838 *(unchanged)* |

> Operations-after-referral ranges from the full 10% (no referrals) down to 5% (all
> referred); the missing dollars are exactly the referral payout — they are **not**
> taken from Vault or Liquidity. Worst case for Operations is a 50% haircut of its
> own slice (5% of gross), which is the *intended* growth cost of referrals.

---
## 6. Whale / Sybil analysis

The question the user asked literally: with **1 / 10 / 100 / 1,000 wallets** each
buying the maximum, how fast are the early-era caps consumed? Each wallet is bounded
by `MAX_USDC_PER_ADDRESS_PER_ERA`, so *N* wallets can buy at most
`N × MAX_USDC_PER_ADDRESS_PER_ERA` of that era — but never more than the aggregate
`eraSynCap[e]` (the hard wall a Sybil swarm **cannot** bypass; exceeding it just
advances the era). The cells below show the **% of that era's cap** consumed.

### Model A — Conservative (per-address $10,000 / per-tx $10,000)

| Era | USDC to drain cap | 1 wallet | 10 wallets | 100 wallets | 1,000 wallets | Wallets to fully drain |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| II | $7,337 | 100% | 100% | 100% | 100% | 1 |
| III | $25,663 | 39.0% | 100% | 100% | 100% | 3 |
| IV | $183,343 | 5.5% | 54.5% | 100% | 100% | 19 |
| V | $431,250 | 2.3% | 23.2% | 100% | 100% | 44 |
| VI | $1,437,500 | 0.7% | 7.0% | 69.6% | 100% | 144 |

### Model B — Balanced (per-address $25,000 / per-tx $25,000)

| Era | USDC to drain cap | 1 wallet | 10 wallets | 100 wallets | 1,000 wallets | Wallets to fully drain |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| II | $8,338 | 100% | 100% | 100% | 100% | 1 |
| III | $29,163 | 85.7% | 100% | 100% | 100% | 2 |
| IV | $208,344 | 12.0% | 100% | 100% | 100% | 9 |
| V | $562,500 | 4.4% | 44.4% | 100% | 100% | 23 |
| VI | $1,875,000 | 1.3% | 13.3% | 100% | 100% | 75 |

### Model C — Aggressive (per-address $100,000 / per-tx $100,000)

| Era | USDC to drain cap | 1 wallet | 10 wallets | 100 wallets | 1,000 wallets | Wallets to fully drain |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| II | $16,675 | 100% | 100% | 100% | 100% | 1 |
| III | $58,325 | 100% | 100% | 100% | 100% | 1 |
| IV | $416,688 | 24.0% | 100% | 100% | 100% | 5 |
| V | $937,500 | 10.7% | 100% | 100% | 100% | 10 |
| VI | $3,125,000 | 3.2% | 32.0% | 100% | 100% | 32 |

**Reading the tables.** In **every** model a **single wallet drains Era II** (and,
in Aggressive, Era III too) because the early-era caps are smaller than the
per-address limit. Beyond the point the aggregate cap is hit, 10 / 100 / 1,000
wallets change nothing — the cap is the wall. The per-address cap only starts to
bite from **Era IV–V onward**, where draining takes tens of wallets.

**Recommended mitigations (reduce concentration without blocking real buyers):**
1. **Per-era address caps** — make `MAX_USDC_PER_ADDRESS_PER_ERA` a `uint256[9]`
   so early eras get a *tiny* per-wallet limit (e.g. ≈ the era minimum × a few) and
   late eras a larger one. This is the single highest-leverage change; it is the
   "needed change" the model proves (see §0, §7).
2. **Early-era reserve invariant** (II–IV, reserving 3,933,500 SYN) —
   guarantees those seats regardless of wallet count, the strongest anti-Sybil
   device for the cheapest SYN.
3. Keep the **aggregate `eraSynCap[e]`** (already in draft) — the only ceiling a
   Sybil swarm cannot bypass.
4. Optional off-chain: a V1-member / allowlist *referral* weighting — never a
   gate on buying (keeps the sale permissionless).

A single global per-address cap **cannot** be set correctly: any value safe for Era
IX (large) is useless for Era II (tiny), and any value safe for Era II blocks
legitimate large buyers in Era IX.

---
## 7. Founder decision table

### 7a. Exact `eraSynCap[e]` per era, all three models (SYN)

| Era | Floor SYN | Model A | Model B | Model C |
| --- | ---: | ---: | ---: | ---: |
| II | 333,500 | 366,850 | 416,875 | 833,750 |
| III | 933,200 | 1,026,520 | 1,166,500 | 2,333,000 |
| IV | 2,666,800 | 2,933,480 | 3,333,500 | 6,667,000 |
| V | 4,500,000 | 5,175,000 | 6,750,000 | 11,250,000 |
| VI | 7,500,000 | 8,625,000 | 11,250,000 | 18,750,000 |
| VII | 10,000,000 | 11,500,000 | 15,000,000 | 25,000,000 |
| VIII | 30,000,000 | 36,000,000 | 60,000,000 | 75,000,000 |
| IX | 75,000,000 | 90,000,000 | 150,000,000 | 187,500,000 |
| **Total** | **130,933,500** | **155,626,850** | **247,916,875** | **327,333,750** |

### 7b. Decision matrix

| Decision | Conservative (A) | Balanced (B) | Aggressive (C) | Recommendation | Why |
| --- | --- | --- | --- | --- | --- |
| **`eraSynCap` II–IV** | ×1.10 floor | ×1.25 floor | ×2.50 floor | **B, but taper II–IV toward ×1.10** | Early eras are the cheapest SYN and the biggest abuse vector — keep them tight. |
| **`eraSynCap` V–VII** | ×1.15 | ×1.50 | ×2.50 | **B (×1.50)** | Real upgrade room where SYN is mid-priced and ranges are large. |
| **`eraSynCap` VIII–IX** | ×1.20 | ×2.00 | ×2.50 | **B (×2.00)** | Most USDC is raised here; headroom is least distorting at the highest prices. |
| **`MAX_USDC_PER_ADDRESS_PER_ERA`** | $10,000 | $25,000 | $100,000 | **Make it per-era (`uint256[9]`)** | A single global value is provably wrong for both ends (§6). This is the needed change. |
| **`MAX_USDC_PER_TX`** | $10,000 | $25,000 | $100,000 | **$25,000** (≤ per-era address cap) | Friction on flash-draining without blocking a normal large buy. |
| **V2 SYN funding** | 155,626,850 (44.5%) | 247,916,875 (70.8%) | 327,333,750 (93.5%) | **≈ 247,916,875 (B)** | ~71% of pool: real headroom, ~29% safety buffer. C's 93.5% leaves no room for error. |
| **Max USDC raise** | $112,960,093 | $186,433,344 | $235,804,188 | **$186,433,344 ceiling (B)** | Strong raise without committing the whole pool to early upgrades. |
| **First Million guarantee** | Yes (reserve ON) | No (target) | No (target) | **No globally; reserve ON for II–IV** | Keep hybrid flexibility; protect only the cheapest seats by construction. |
| **Hard reserve invariant** | Global (130,933,500 SYN) | Off | Off | **Early eras II–IV only (3,933,500 SYN)** | Closes the worst abuse without taxing the whole sale; full Option 2 only if Legal demands "1,000,000 seats". |
| **Sale V3 after Era IX** | Yes | Yes | Yes | **Yes** | V2 is immutable/prescripted; future market conditions belong to a new contract. |
| **Referral** | 5% of Ops 10% | 5% of Ops 10% | 5% of Ops 10% | **5%, Operations-only, contract-paid** | Vault/Liquidity never diluted; push-with-escrow fallback. |
| **`RECOVERY_TIMELOCK`** | 14 days | 14 days | 7 days | **14 days + multisig** | Recovery is a premature-halt power, not routine; longer notice + multisig destination = Vault only. |
| **Oracle** | No | No | No | **No** | Manipulation surface + trust dependency; contradicts the immutable model. |
| **Public wording** | "target" | "target" | "target" | **"target", never "guarantee"** | Matches canon; avoids price/seat-promise risk (§3, §4). |

---

## 8. Final recommendation — Founder + CTO + Economist + Growth + Legal

**Chosen model: Model B (Balanced), funded at ≈ 247,916,875 SYN
(70.8% of pool), with two early-era protections bolted on:
per-era address caps and a reserve invariant on Eras II–IV.**

- **As Founder —** B keeps the mission intact: a real shot at 1,000,000 seated
  members, room for members to buy more than the minimum, and a ~29% pool buffer so
  an honest mistake doesn't end the sale. Conservative under-raises and frustrates
  genuine supporters; Aggressive bets 93.5% of the pool on early behavior going
  perfectly. B is the version I can defend to members in plain language.
- **As CTO —** the simulation proves one concrete contract change is *needed*: a
  single global `MAX_USDC_PER_ADDRESS_PER_ERA` cannot protect Era II–III (one
  wallet drains them in every model). Make it a `uint256[9]` and add the early-era
  reserve check (summed at each era's own minimum, §3). Everything else in the draft
  (aggregate `eraSynCap`, dual era bounds, auto-advance, referral fan-out,
  `RECOVERY_TIMELOCK`) already supports B. No oracle. **I am not editing the
  `.sol` in this document** — these are the exact edits to make during the
  line-by-line review the team asked for next.
- **As Economist —** without a reserve, per-era caps protect the *pool and shape*
  but not the *seat count*; B's max raise is **$186,433,344** vs an
  entry-only ~$94.3M, and the gap is upgrade dollars that trade seats for treasury.
  Tapering II–IV to the floor + an early reserve keeps the cheapest SYN from
  concentrating, which is where distribution actually breaks.
- **As Growth —** B's $25,000 per-era address cap and 5% contract-paid
  referral give real upside to advocates without diluting Vault/Liquidity; arbitrage
  is acceptable and self-limiting and simply sells seats faster. Per-era caps let us
  open early eras to enthusiasts without one whale eating the cohort.
- **As Legal —** mandatory "**target, not guarantee**" wording on First Million; no
  ROI/yield/discount/price-promise language anywhere; access rate framed as a fixed
  membership schedule, not a market price; secondary-market prices disclaimed as
  third-party. If the business insists on claiming "1,000,000 seats" unconditionally,
  we must switch to the **global** reserve invariant (Option 2) and accept the
  upgrade throttle — otherwise Option 1 wording stands.

### One-paragraph answer — "If this were your protocol?"

I would ship **Model B**: fund ≈ 247,916,875 SYN, set per-era SYN caps
at ×1.25 (II–IV) / ×1.50 (V–VII) / ×2.00 (VIII–IX), convert the per-address cap to
a per-era array (tiny early, $25,000-class late), add a reserve
invariant on Eras II–IV only (3,933,500 SYN), keep referral at 5%
Operations-only contract-paid, set `RECOVERY_TIMELOCK` to 14 days behind a
multisig, use no oracle, end V2 at Era IX with a planned Sale V3, and publish "First
Million" strictly as a **target**. It raises meaningfully (up to
$186,433,344), protects the cheap early seats where fairness is won or
lost, and never over-commits the fixed SYN supply.

---

## Appendix — assumptions & provenance

- Era ranges, minimums, and SYN/USDC rates: `src/lib/eras.ts` (read-only).
- Pool = 350,000,000 SYN (Membership Distribution); split 70/20/10; access-rate
  reference $0.01/SYN: `src/lib/syndicate-config.ts`.
- "Max USDC volume" = every era's `eraSynCap` fully sold at that era's rate; it is a
  **ceiling**, not a forecast. Entry-only raise is ~$94.3M in all models.
- Without the reserve invariant, reaching a model's max USDC implies **fewer than
  1,000,000 seats** (upgrade dollars consume cap without issuing seats).
- The reserve invariant (§3) costs each remaining seat at its **own** era's
  SYN/min-seat; at V2 start that totals 130,933,500 SYN, the early-eras-only
  (II–IV) variant 3,933,500 SYN.
- V1's already-distributed SYN must be subtracted from the 350M pool before funding
  V2; re-read on-chain at deploy time. No figure here was taken on faith — all are
  recomputed from the schedule.
- **This document writes no code and changes no parameters.** Of the recommended
  contract edits, the two simulation-proven *structural* corrections — the **per-era
  address cap** and the **configurable early-era reserve** — have since been applied
  to `SyndicateSaleV2.draft.sol` (draft only, not deployed); their **parameter
  values** (cap ramp, reserve target, funding) plus the 14-day timelock tuning
  remain for the line-by-line human review, per instruction.
