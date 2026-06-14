# The Syndicate — Sale V2 Founder Decision Report

**Phase:** Founder Economics Review (pre–Solidity-review).
**Status:** READ-ONLY advisory. This report writes no Solidity, deploys nothing, does not
touch Sale V1, and does not touch the frontend. It changes no parameter — it only
surfaces and frames the decisions that still require founder approval.

**Sources:** `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` (the architecture report, incl.
the §J human-review list), `drafts/SyndicateSaleV2.draft.sol` (the draft), the per-era
cap model and the seat-reserve model now in the draft, `SALE_V2_PARAMETER_AND_TREASURY_SIMULATION.md`
(the treasury simulation), and `src/lib/eras.ts` (the era schedule, read-only).

**Goal of this document:** after the founder signs off here, there should be almost nothing
left to debate before the line-by-line Solidity review.

---

## How to read this report

Every *mechanism* in the contract is already settled and built into the draft (the split,
referral fan-out, no-oracle, timelocked recovery, the three caps, the seat-reserve, bounded
end, V1 continuity). **What remains are values and a few toggles** — the things a contract
cannot decide for you. They are grouped by **when** they must be locked:

- **Group A — Must decide before the Solidity review.** Anything baked into the contract
  source or constructor (every numeric parameter, plus a few structural toggles). The
  line-by-line reviewer validates the code *against these intended values*; deciding them now
  is what prevents re-litigation during review.
- **Group B — Must decide before deployment.** Operational/organizational items that do **not**
  change the contract source but must be finalized to deploy safely (multisig, V1 pause timing,
  Merkle snapshot, USDC address, audit gate, legal sign-off, the funding transfer).
- **Group C — Can be decided after deployment.** Items that need no redeploy of the sale
  contract (off-chain referral weighting, indexer projection, a future Million+ / Sale V3,
  secondary-market posture, frontend polish).

---

## The era schedule these decisions sit on (reference, from `eras.ts` + simulation §1)

| Era | Name | Member range | Seats | Min USDC | SYN/USDC | SYN/min seat | Entry-floor SYN | Entry-only USDC |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| II | First Thousand | 334–1,000 | 667 | $10 | 50 | 500 | 333,500 | $6,670 |
| III | The Expansion | 1,001–3,333 | 2,333 | $10 | 40 | 400 | 933,200 | $23,330 |
| IV | First Ten Thousand | 3,334–10,000 | 6,667 | $25 | 16 | 400 | 2,666,800 | $166,675 |
| V | Open Era I | 10,001–25,000 | 15,000 | $25 | 12 | 300 | 4,500,000 | $375,000 |
| VI | Open Era II | 25,001–50,000 | 25,000 | $50 | 6 | 300 | 7,500,000 | $1,250,000 |
| VII | Hundred Thousand | 50,001–100,000 | 50,000 | $50 | 4 | 200 | 10,000,000 | $2,500,000 |
| VIII | Quarter Million | 100,001–250,000 | 150,000 | $100 | 2 | 200 | 30,000,000 | $15,000,000 |
| IX | First Million | 250,001–1,000,000 | 750,000 | $100 | 1 | 100 | 75,000,000 | $75,000,000 |
| **II–IX total** | | 334–1,000,000 | **999,667** | | | | **130,933,500** | **$94,321,675** |

Genesis (V1, seats 1–333) sits at $5 / 500 SYN and is **not** part of any V2 decision. Pool =
**350,000,000 SYN** (Membership Distribution). Entry-only floor commits 131,100,000 SYN incl.
Genesis (~37.5% of pool); the rest is upgrade/repeat headroom that the per-era caps ration.

---

# PART 1 — Fully resolved decisions (no founder action required)

These are settled doctrine or settled mechanism, already in the draft. They are listed so the
founder can confirm nothing here is reopening.

| # | Decision | Resolved as | Where |
| --- | --- | --- | --- |
| R1 | Treasury split | **70% Vault / 20% Liquidity / 10% Operations**, applied on USDC inflow, per buy | Doctrine / draft |
| R2 | Referral funding source | **5% of gross, carved only from the 10% Operations slice**; Vault & Liquidity never diluted | Draft / sim §5 |
| R3 | Referral mechanics | **Contract pays the referrer in-tx** (Vault→Liquidity→Referrer→Operations); push-with-escrow (`referralOwed`/`claimReferral`) so a bad referrer can't brick a buy | Draft |
| R4 | Oracle | **None.** Fixed pre-published schedule; below-market arbitrage accepted, bounded by caps + the #1M stop | Draft / sim §4 |
| R5 | Recovery authority | **Timelocked** `recoverUnsoldSyn`, **Vault-only** destination; `pausedAt` resets on unpause; concluded path needs no delay | Draft (duration = A6) |
| R6 | Per-era SYN sold-cap mechanism | `eraSynCap[e]` + `soldInEra[e]` against ONE global balance (not physical buckets); the only anti-Sybil throttle a swarm can't bypass | Draft (values = A2) |
| R7 | Per-era address cap mechanism | `maxUsdcPerAddressPerEra[1..9]` (single global cap rejected as provably wrong) | Draft (values = A3) |
| R8 | Seat-reserve mechanism | `RESERVE_THROUGH_SEAT` immutable + `_reserveSyn(m)` costing each remaining seat at its **own** era minimum; reverts `ReserveFloorViolation` | Draft (target = A5) |
| R9 | No purchase splitting | A buy is priced entirely at one era, or it reverts; era advances only between buys | Draft |
| R10 | Bounded end | Past seat #1,000,000 → revert `SaleConcluded` (a future contract may reopen) | Draft (confirm = A10) |
| R11 | V1 continuity | Immutable `GENESIS_OFFSET` + immutable Merkle root of V1 members; V1 buyers recognized, get no new seat | Draft (timing = B3/B4) |
| R12 | Forward path for market moves | A future **Sale V3**, never making V2 adaptive | Doctrine (design = C4) |
| R13 | "First Million" doctrine | A **target bounded by inventory** unless the seat-reserve is switched on to guarantee it | Doctrine (target = A5) |

---

# PART 2 — Unresolved decisions (require founder approval)

## GROUP A — Must decide BEFORE the Solidity review

> These are constructor parameters and structural toggles. They must be fixed before the
> line-by-line review so the reviewer validates the code against final intent.

### A1 — V2 SYN funding amount `F` (J2)
- **Current/recommended value:** **247,916,875 SYN** (Model B; 70.8% of the 350M pool).
  Funding equals the sum of the chosen `eraSynCap` set (it must, so every era can reach its cap).
- **Alternatives:** Model A 155,626,850 (44.5%); Model C 327,333,750 (93.5%); or the
  B-with-II–IV-taper refinement 247,326,850 (70.7%, see A2).
- **Advantages:** B funds real upgrade headroom while keeping a ~29% pool buffer for error/V1
  drift. **Disadvantages:** commits ~71% of the pool up front; over-funding strands SYN that
  could have been reserved for a later contract.
- **Treasury:** Funding is *inventory*, not USDC. It sets the ceiling on upgrade dollars (and
  thus on Vault/Liquidity/Operations USDC inflow). Entry-only raise is ~$94.3M in **every**
  model; B raises the *upgrade* ceiling to a max ~$186.4M.
- **Member experience:** More funding = more room for members to buy above the minimum before
  an era steps. **Future eras:** Under-funding makes the honest inventory hard-stop hit early
  (fewer late seats); over-funding risks committing SYN a Sale V3 may want.
- **First Million doctrine:** Funding alone never guarantees 1M seats (upgrades consume cap
  without issuing seats) — only the reserve (A5) does. **Recommendation:** **Model B funding**,
  and hard-constrain `F ≤ 350,000,000 − (V1 already sold, re-read on-chain at deploy)`.

### A2 — The eight per-era SYN caps `eraSynCap[II..IX]` (J13)
- **Current/recommended values (Model B):** II 416,875 · III 1,166,500 · IV 3,333,500 ·
  V 6,750,000 · VI 11,250,000 · VII 15,000,000 · VIII 60,000,000 · IX 150,000,000.
- **Economist's refinement (recommended):** **taper II–IV down to ×1.10** (the Model A values:
  II 366,850 · III 1,026,520 · IV 2,933,480), keep V–IX at B. The cheapest SYN is the biggest
  abuse vector; tightening only the early eras costs ~$30k of raise ceiling.
- **Alternatives:** Model A (×1.10–1.20 throughout, tightest), Model C (×2.50 flat, loosest).
- **Advantages:** B gives genuine upgrade room where SYN is mid/late-priced; the taper keeps
  early distribution fair. **Disadvantages:** every multiple above floor is pool committed early
  and is upgrade dollars that do **not** add seats.
- **Treasury:** Sets the max USDC ceiling per era (Vault gets 70%). **Member experience:** higher
  caps = fewer "era stepped before I could upgrade" surprises. **Future eras:** the late caps
  (VIII–IX) carry most of the USDC; headroom there is least distorting. **First Million doctrine:**
  caps protect *shape*, never the seat count. **Recommendation:** **Model B with the II–IV taper.**

### A3 — The per-era address-cap ramp `maxUsdcPerAddressPerEra[II..IX]` (J3)
- **Current/recommended values:** II **$1,000** · III **$2,500** · IV **$5,000** · V **$10,000** ·
  VI **$15,000** · VII **$20,000** · VIII **$25,000** · IX **$25,000**. Each must be ≥ its era's
  USDC minimum (enforced by the constructor).
- **Alternatives:** a single global value (rejected — provably wrong: any value safe for Era IX is
  useless for Era II and vice-versa); a steeper or flatter ramp.
- **Advantages:** the primary anti-whale + distribution-fairness lever, sized so early eras are
  genuinely protected. **Disadvantages:** Sybil-bypassable by many wallets (which is why the
  aggregate `eraSynCap` exists as the real wall); early caps below the era's aggregate cap mean a
  single max wallet can still drain the tiniest eras (II) — the reserve (A5) is the backstop there.
- **Treasury:** negligible direct effect (bounds concentration, not totals). **Member experience:**
  keeps a few whales from owning a whole early cohort; legitimate large buyers are unblocked from
  Era V onward. **Future eras:** larger late caps let real demand fill faster. **First Million
  doctrine:** supports "fair, broad seating," not the count itself. **Recommendation:** **adopt the
  ramp above.**

### A4 — Per-transaction cap `MAX_USDC_PER_TX` (J14)
- **Current/recommended value:** **$25,000** (must be ≥ every sellable era minimum — constructor-enforced).
- **Alternatives:** $10,000 (A) / $100,000 (C) / none.
- **Advantages:** cheap UX + fat-finger bound; friction on flash-draining. **Disadvantages:**
  redundant against a Sybil swarm (secondary to the per-era caps). **Treasury/Future eras:**
  minimal. **Member experience:** a sane single-tx ceiling; a member can still buy more across
  multiple txs up to the per-era address cap. **First Million doctrine:** neutral.
  **Recommendation:** **$25,000.**

### A5 — Seat-reserve target `RESERVE_THROUGH_SEAT` (J16) — *the doctrine-defining choice*
- **Current/recommended value:** **10,000** (hard-guarantee Eras II–IV, reserving **3,933,500 SYN**,
  with late-era hybrid upgrades unrestricted).
- **Alternatives:** **1,000,000** = full contract-level "First Million" guarantee (reserves the entire
  130,933,500 SYN entry-floor; restricts late-in-era upgrades once inventory tightens); **0** = disabled
  (pure honest-target wording, no on-chain seat guarantee).
- **Advantages (default 10,000):** closes the worst abuse (cheap early seats are guaranteed regardless
  of wallet count) at a tiny ~3.9M SYN cost, while preserving the hybrid-purchase model everywhere
  after #10,000. **Disadvantages:** between #10,001 and #1,000,000 the seat count is still a target,
  not a guarantee. **Full (1,000,000)** removes that gap but throttles late upgrades and forces funding
  ≥ 130.9M SYN reserved.
- **Treasury:** at the default, ~zero effect (it only blocks buys that would strand reserved early
  seats); full reserve lowers late-era upgrade raise. **Member experience:** early members get a
  provable seat; under full reserve, large late buyers may be partially blocked near boundaries.
  **Future eras:** default leaves late eras fully flexible. **First Million doctrine:** this is the
  single switch that converts "First Million" from narrative to on-chain guarantee — **0** = target,
  **10,000** = early run guaranteed, **1,000,000** = full million guaranteed.
- **Recommendation:** **10,000** unless Legal requires an unconditional "1,000,000 seats" claim — then **1,000,000**.

### A6 — `RECOVERY_TIMELOCK` duration (J15)
- **Current/recommended value:** **14 days** (constructor immutable).
- **Alternatives:** 7 days (C) or longer. **Advantages:** long enough that a pause-and-sweep is
  visible to members before any SYN moves; short enough to wind down real dust. **Disadvantages:**
  longer delays genuine dust recovery. **Treasury/Future eras/First Million:** neutral (recovery is
  Vault-only, premature-halt power, not a raise lever). **Member experience:** trust signal — the
  owner cannot instantly sweep. **Recommendation:** **14 days, paired with a multisig owner (B1).**

### A7 — Wallet addresses: immutable vs rotatable (J4)
- **Current value:** Vault / Liquidity / Operations / USDC / SYN are **immutable** in the draft.
- **Alternatives:** a 2-step timelocked rotation path. **Advantages (immutable):** maximum trust,
  zero privileged live path. **Disadvantages:** if an ops wallet is ever compromised or must move,
  the only remedy is a new contract. **Treasury:** immutable = destinations provably fixed.
  **Member experience/First Million:** trust-positive. **Recommendation:** **keep immutable** unless
  ops explicitly needs rotation; if so, scope a 2-step timelocked path for the reviewer to scrutinize.

### A8 — Referral cadence: every purchase vs first-purchase-only (J5)
- **Current/recommended value:** **every eligible purchase** (matches the "every sale" referral
  framing). **Alternatives:** first-purchase-only. **Advantages:** stronger growth incentive,
  simpler mental model. **Disadvantages:** more Operations dollars routed to referrers (max 50% of
  the 10% slice). **Treasury:** Vault/Liquidity untouched; Operations-after-referral ranges 10%→5%.
  **Member experience/Future eras:** neutral-positive. **First Million:** supports broader seating.
  **Recommendation:** **every eligible purchase** — confirm against Legal (A/B legal item below).

### A9 — On-chain event richness (J6)
- **Current/recommended value:** **lean** — `Routed` + `ReferralAttributed` on-chain; project the
  full RAL `Attribution{splits[5]…}` shape off-chain (indexer). **Alternatives:** emit the full
  attribution struct on-chain. **Advantages (lean):** lower gas, simpler contract surface.
  **Disadvantages:** richer analytics require the indexer. **Treasury:** marginally lower gas.
  **Member experience/First Million:** neutral. **Recommendation:** **lean events**, RAL projected
  indexer-side (the indexer work itself is Group C).

### A10 — Behavior past seat #1,000,000 (J7)
- **Current/recommended value:** **revert `SaleConcluded`** (bounded end). **Alternatives:** a
  rollover "Million+" era. **Advantages:** an honest, finite "First Million." **Disadvantages:**
  needs a new contract to continue. **Treasury/Future eras:** clean hand-off to a future contract.
  **Member experience/First Million:** reinforces the doctrine. **Recommendation:** **confirm revert
  `SaleConcluded`**; design any Million+ later (Group C).

## GROUP B — Must decide BEFORE deployment (no contract-source change)

| # | Decision (J ref) | Current/recommended | Key tradeoff / effect |
| --- | --- | --- | --- |
| B1 | **Multisig structure** for the owner role (pairs J4/J15) | A multisig (e.g. **3-of-5**) holds `owner`; destination of any recovery is the immutable Vault | Removes single-key risk on pause/recovery/ownership; the central *trust* decision members will judge. No treasury effect; large member-confidence effect. |
| B2 | **Owner address at deploy** | The B1 multisig address | Must exist before deploy; wrong owner = redeploy. |
| B3 | **Pause V1 at exactly seat #333 + set `GENESIS_OFFSET = 333`** (J1) | Pause V1 at the Genesis ceiling, then deploy | If V1 overshoots, **every** era boundary shifts. Draft enforces `offset ≥ 333` but not *exactly* 333 — this is an operational guarantee. |
| B4 | **V1 Merkle snapshot timing + frontend proof delivery** (J12) | Snapshot V1 members at the instant V1 pauses; ship proofs in the buy/referral UI | Recognition correctness; a V1 member without a proof is a degraded (not broken) path. |
| B5 | **USDC address verification** (J9) | Native Avalanche USDC; verify on Fuji + mainnet | Wrong variant breaks payment entirely. |
| B6 | **Audit / review gate** (J11) | External review → Fuji → independent audit → mainnet | **Non-negotiable.** No treasury/seat effect — it is the safety precondition for all of the above. |
| B7 | **Legal sign-off on copy** (J10) | Era + referral + access-rate wording cleared (no ROI/yield/dividend language) | Compliance precondition; also ratifies the A5/A8 framing. |
| B8 | **Final funding transfer** (operational half of J2) | Transfer `F` (A1) into the contract, with `F ≤ 350M − V1-sold` re-read on-chain; fund ≥ the initial reserve from A5 | Under-funding the reserve makes the first buy revert; over-funding strands SYN. |

## GROUP C — Can be decided AFTER deployment (no redeploy of the sale)

| # | Decision (J ref) | Current/recommended | Why it can wait |
| --- | --- | --- | --- |
| C1 | Referral allowlist / V1-member weighting (J5 optional, §6 mitigation) | **Off-chain only**, never a gate on buying | Keeps the sale permissionless; tunable later. |
| C2 | Indexer RAL `Attribution` projection (J6 off-chain half) | Project `splits[5]` shape from lean events | Analytics layer; iterate post-launch. |
| C3 | A future "Million+" contract beyond #1M (J7) | Design later if desired | V2 ends cleanly at `SaleConcluded`. |
| C4 | **Sale V3** for future market conditions | The escape hatch for a large market move | V2 is immutable by design; V3 is a separate future contract. |
| C5 | Secondary-market / royalty posture (J10 secondary half) | Legal review when/if a secondary forms | Unrelated to the primary sale mechanics. |
| C6 | Frontend surfacing of the new reserve/cap views | Show `sellableSynForNextSeat()` / `currentReserveFloor()` / `remainingEraCap` so a quote never silently reverts | Explicitly out of this phase (frontend); polish post-review. |

---

# PART 3 — THE MASTER TABLE: every unresolved parameter

> One row per unresolved variable. "Group" = when it must be locked (A before review, B before
> deploy, C after deploy). Constructor-baked values are rows 1–24.

| # | Parameter | Recommended value | Alternatives | Group | Primary effect |
| --- | --- | --- | --- | --- | --- |
| 1 | V2 funding amount `F` | **247,916,875 SYN** (70.8%) *(247,326,850 if II–IV tapered)* | A 155.6M / C 327.3M | A | Upgrade-dollar ceiling; pool buffer |
| 2 | Era II cap `eraSynCap[II]` | **366,850 SYN** (×1.10, tapered) | B 416,875 (×1.25) | A | Tightest early protection |
| 3 | Era III cap | **1,026,520 SYN** (×1.10) | B 1,166,500 | A | Early protection |
| 4 | Era IV cap | **2,933,480 SYN** (×1.10) | B 3,333,500 | A | Early protection |
| 5 | Era V cap | **6,750,000 SYN** (×1.50) | A 5,175,000 / C 11,250,000 | A | Mid upgrade room |
| 6 | Era VI cap | **11,250,000 SYN** (×1.50) | A 8,625,000 / C 18,750,000 | A | Mid upgrade room |
| 7 | Era VII cap | **15,000,000 SYN** (×1.50) | A 11,500,000 / C 25,000,000 | A | Mid upgrade room |
| 8 | Era VIII cap | **60,000,000 SYN** (×2.00) | A 36,000,000 / C 75,000,000 | A | Most USDC raised here |
| 9 | Era IX cap | **150,000,000 SYN** (×2.00) | A 90,000,000 / C 187,500,000 | A | Largest raise lever |
| 10 | Per-tx cap `MAX_USDC_PER_TX` | **$25,000** | $10k / $100k / none | A | UX / fat-finger bound |
| 11 | Addr cap II `maxUsdcPerAddressPerEra[II]` | **$1,000** | global cap (rejected) | A | Anti-whale, early |
| 12 | Addr cap III | **$2,500** | — | A | Anti-whale, early |
| 13 | Addr cap IV | **$5,000** | — | A | Anti-whale, early |
| 14 | Addr cap V | **$10,000** | — | A | Anti-whale, mid |
| 15 | Addr cap VI | **$15,000** | — | A | Anti-whale, mid |
| 16 | Addr cap VII | **$20,000** | — | A | Anti-whale, mid |
| 17 | Addr cap VIII | **$25,000** | — | A | Anti-whale, late |
| 18 | Addr cap IX | **$25,000** | — | A | Anti-whale, late |
| 19 | Reserve through seat `RESERVE_THROUGH_SEAT` | **10,000** (3,933,500 SYN) | 1,000,000 (130.9M) / 0 (off) | A | First Million guarantee switch |
| 20 | Recovery timelock `RECOVERY_TIMELOCK` | **14 days** | 7 days / longer | A | Anti pause-and-sweep |
| 21 | Wallet addresses | **Immutable** | 2-step timelock rotation | A | Trust vs flexibility |
| 22 | Referral cadence | **Every eligible purchase** | First-purchase-only | A | Growth vs Ops cost |
| 23 | On-chain event richness | **Lean** (`Routed`+`ReferralAttributed`) | Full `Attribution[5]` on-chain | A | Gas vs richness |
| 24 | Behavior past #1M | **Revert `SaleConcluded`** | Million+ rollover | A | Bounded end |
| 25 | Multisig structure | **3-of-5** (owner = multisig) | 2-of-3 / other | B | Single-key risk removal |
| 26 | Owner address at deploy | The multisig (B1) | EOA (not recommended) | B | Privileged role holder |
| 27 | V1 pause point + `GENESIS_OFFSET` | **Pause @ #333, offset = 333** | overshoot (shifts all eras) | B | Era boundary integrity |
| 28 | Merkle snapshot timing + proof UI | At V1 pause instant | later snapshot | B | V1 recognition correctness |
| 29 | USDC address (Fuji + mainnet) | Native Avalanche USDC | (verify) | B | Payment correctness |
| 30 | Audit / review gate | Review→Fuji→audit→mainnet | (none — unacceptable) | B | Safety precondition |
| 31 | Legal sign-off on copy | Cleared pre-live | — | B | Compliance precondition |
| 32 | Referral allowlist / weighting | Off-chain, non-gating | none | C | Distribution tuning |
| 33 | Indexer RAL projection | `splits[5]` off-chain | richer/leaner | C | Analytics |
| 34 | Million+ contract | Design later | none | C | Continuation past #1M |
| 35 | Sale V3 | Future contract | none | C | Market-move escape hatch |
| 36 | Secondary / royalty posture | Legal review if/when | none | C | Secondary market |

**Per-era cap set at a glance (recommended = Model B with II–IV taper):**

| Era | `eraSynCap` (SYN) | Max USDC if fully sold | Addr cap | 
| --- | ---: | ---: | ---: |
| II | 366,850 | $7,337 | $1,000 |
| III | 1,026,520 | $25,663 | $2,500 |
| IV | 2,933,480 | $183,343 | $5,000 |
| V | 6,750,000 | $562,500 | $10,000 |
| VI | 11,250,000 | $1,875,000 | $15,000 |
| VII | 15,000,000 | $3,750,000 | $20,000 |
| VIII | 60,000,000 | $30,000,000 | $25,000 |
| IX | 150,000,000 | $150,000,000 | $25,000 |
| **Total** | **247,326,850** | **≈ $186,403,843** | per-tx $25,000 |

*(Pure Model B without the taper: funding 247,916,875 SYN, max raise $186,433,344 — a ~$30k
difference. Either is defensible; the taper is the economist's recommended refinement.)*

---

# PART 4 — Persona recommendations

## (3) Founder recommendation
Keep the mission honest and the trust signal maximal. Adopt **Model B funding (~248M SYN, ~71%
of pool)** so members have real room to buy more than the minimum, but **taper Eras II–IV** so the
founding cohorts are tightly protected. Switch the **seat-reserve to 10,000** so the *cheap early
run is a guarantee, not a slogan*, while leaving the open eras flexible. Make the owner a
**multisig** with a **14-day** recovery timelock — the contract should be something you cannot
betray even if you wanted to. Keep "First Million" a **target** in public copy unless Legal says
otherwise. Nothing here should need re-debate after sign-off.

## (4) CTO recommendation
The mechanisms are built and the draft is internally consistent (architect review: PASS, §L
byte-identical to the draft). For the line-by-line review to be clean, **freeze all 24 Group-A
values now** — the reviewer should be checking arithmetic and safety, not re-opening economics.
Keep wallets **immutable** and events **lean** (lower attack surface + gas; richness lives in the
indexer). Confirm the constructor invariants the draft already enforces: each sellable era's
addr cap ≥ its USDC minimum, `maxUsdcPerTx ≥` every sellable era minimum, `RESERVE_THROUGH_SEAT`
∈ {0} ∪ (333, 1,000,000]. Treat **B6 (external review → Fuji → independent audit → mainnet)** as
non-negotiable, and ensure **B8** funds the contract ≥ the initial reserve or the first buy reverts.

## (5) Economist recommendation
The numbers favor **B with the II–IV taper**. Entry-only raise is ~$94.3M in every model — the
caps only set the *upgrade* ceiling (max ~$186.4M; Vault ~$130.5M at 70%). The cheapest SYN
(Eras II–IV) is the highest-leverage abuse vector and the least valuable to sell at headroom, so
tightening it to ×1.10 costs ~$30k of ceiling for materially fairer founding distribution. The
**per-era address-cap ramp** is the right anti-concentration tool; the single global cap is
provably wrong. The **default reserve (10,000)** is nearly free (3.9M SYN) and removes the worst
Sybil outcome; reserve the full 130.9M only if Legal forces an unconditional 1M claim, because it
taxes late-era upgrades. Avoid Model C — 93.5% pool commitment leaves no buffer for V1 drift.

## (6) Legal recommendation
The framing is sound and must be preserved verbatim: SYN is an **experimental utility membership
token — no ROI, yield, dividend, or profit** promised or implied; the access rate is a **fixed,
pre-published schedule, not a market price or discount to market**; any secondary price is set by
third parties. Therefore: keep **"First Million" as a target, never "guarantee"** in public copy
**unless** you set `RESERVE_THROUGH_SEAT = 1,000,000`, in which case an on-chain guarantee exists
and the stronger claim becomes defensible. Referral on **every eligible purchase** is acceptable
provided it is described as a growth/attribution mechanic, never a return. **B7 legal sign-off**
gates go-live and ratifies the A5 and A8 wording.

---

# PART 5 — (7) Final recommended configuration

> Hand this block to the line-by-line Solidity reviewer as the locked intent. Everything is a
> value or a toggle; no mechanism changes.

**Funding & inventory**
- `F` (V2 SYN funding): **247,326,850 SYN** (Model B, Eras II–IV tapered to ×1.10), constrained
  `F ≤ 350,000,000 − V1-sold` (re-read on-chain at deploy); fund ≥ the initial reserve.

**`eraSynCap[II..IX]` (SYN):** `366,850 · 1,026,520 · 2,933,480 · 6,750,000 · 11,250,000 ·
15,000,000 · 60,000,000 · 150,000,000`.

**`maxUsdcPerAddressPerEra[II..IX]` (USDC):** `$1,000 · $2,500 · $5,000 · $10,000 · $15,000 ·
$20,000 · $25,000 · $25,000`.

**Single values**
- `MAX_USDC_PER_TX` = **$25,000**
- `RESERVE_THROUGH_SEAT` = **10,000** (→ reserves 3,933,500 SYN; set 1,000,000 only on Legal demand)
- `RECOVERY_TIMELOCK` = **14 days**
- `GENESIS_OFFSET` = **333** (V1 paused exactly at seat #333)

**Toggles**
- Wallet addresses: **immutable** · Referral: **every eligible purchase** · Events: **lean**
  (`Routed` + `ReferralAttributed`) · Past #1M: **revert `SaleConcluded`**

**Owner & ops (before deploy)**
- Owner: **multisig (recommended 3-of-5)** · Recovery destination: **Vault only** · USDC: **native
  Avalanche USDC** (verified Fuji + mainnet) · Gate: **external review → Fuji → independent audit →
  mainnet** · Legal copy: **signed off**.

**Expected economics at this configuration**
- Entry-only raise (everyone pays minimum): **≈ $94.3M** → Vault ~$66.0M / Liquidity ~$18.9M /
  Operations ~$9.4M.
- Maximum raise (every cap fully sold): **≈ $186.4M** → Vault ~$130.5M / Liquidity ~$37.3M /
  Operations ~$18.6M (Operations net of referral 10%→5% depending on referred share; Vault &
  Liquidity never diluted).
- Pool buffer retained: **~29%** of 350M for V1 drift / a future contract.
- Seat guarantee: **Eras II–IV (seats 334–10,000) guaranteed on-chain**; seats #10,001–1,000,000
  remain an honest target unless the reserve is raised.

---

## One open economic micro-decision (the only thing left to rule on)
**Pure Model B caps vs Model B with the II–IV ×1.10 taper.** Difference: ~$30k of upgrade-raise
ceiling and ~590,000 SYN of early headroom. Recommendation: **take the taper** (fairer founding
cohorts at negligible cost). Either choice is fully specified above; pick one and the Group-A set
is closed.

*End of Founder Decision Report. This document is advisory and read-only; it modifies no protocol
code, configuration, or canon.*
