# The Syndicate — Sale V2 Final Deploy Parameter Sheet

**Type:** Execution-prep PLANNING ARTIFACT. Read-only. No deploy, no contract
change, no fund movement, no frontend change. This sheet collects every
constructor argument and constant a deployer must set, with its source,
recommended value, FINAL-vs-founder-decision status, and the blocker that must
clear before it can be filled.

**Authoritative source of truth:** `contracts/src/SyndicateSaleV2.sol` and
`contracts/src/CommissionRouterV1.sol` (the compiled ABI in `contracts/out/` is
the binding ordering). Where this sheet and the source disagree, **the source
wins** — re-read it at deploy time.

---

## 0. Deploy order (must be respected)

1. **`CommissionRouterV1`** first (so its address can be passed to the sale as
   `initialRouter`). It is `Ownable2Step`.
2. **`SyndicateSaleV2`** second, passing the router address (or `address(0)` to
   bootstrap with **no referral** — the full Operations slice goes to Operations —
   and swap the router in later under the 14-day `ROUTER_TIMELOCK`). It is `Ownable2Step`.
3. **`router.addSource(saleV2, sourceId, OPERATIONS)`** so the sale is allow-listed
   to call `route()` and the Operations wallet is registered.

---

## 1. `SyndicateSaleV2` constructor (exact order, production source)

```solidity
constructor(
    address    usdc,               // 1
    address    syn,                // 2
    address    vault,              // 3
    address    liquidity,          // 4
    address    operations,         // 5
    uint256    genesisOffset,      // 6
    bytes32    v1MemberRoot,       // 7
    uint256[9] memory addrCaps,    // 8  (USDC, 6dp)
    uint256    maxUsdcPerTx,       // 9  (USDC, 6dp)
    uint256    reserveThroughSeat, // 10
    uint256[9] memory eraCaps,     // 11 (SYN, 18dp)
    address    initialRouter       // 12
) Ownable(msg.sender)
```

| # | Arg | Recommended value | Unit | Status | Source | Blocker |
|---|-----|-------------------|------|--------|--------|---------|
| 1 | `usdc` | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | address | **FINAL** | Native USDC, Avalanche C-Chain; `src/lib/syndicate-config.ts` `CONTRACTS.USDC_CONTRACT_ADDRESS` | — |
| 2 | `syn` | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` | address | **FINAL** | SYN token; `CONTRACTS.SYN_CONTRACT_ADDRESS` | — |
| 3 | `vault` | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` | address | **FINAL** | 70% slice; `CONTRACTS.VAULT_WALLET` (= Vault Reserve) | — |
| 4 | `liquidity` | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` | address | **FINAL** | 20% slice; `CONTRACTS.LIQUIDITY_WALLET` | — |
| 5 | `operations` | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` | address | **FINAL** | 10% slice; `CONTRACTS.OPERATIONS_WALLET` | — |
| 6 | `genesisOffset` | Final V1 unique-member count at handoff — **any real count in `[0, 1_000_000)`** (Model 2). If V1 sealed **below** the Genesis ceiling (333), V2 **continues Genesis** from seat `genesisOffset + 1` at Era I pricing; Era II still opens at #334 | seat # | **DECISION** | `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §A3, J1; constructor reverts **only** if `>= 1_000_000` | **Live V1 snapshot at handoff (pause ≤ #333)** |
| 7 | `v1MemberRoot` | Merkle root of the frozen V1 member address set | bytes32 | **DECISION** | `contracts/README.md` (exact root-generation procedure); `_verifyV1` uses OZ `MerkleProof.verify`, standard double-hashed leaf | **Live V1 snapshot at handoff** |
| 8 | `addrCaps[9]` | Per-era ADDRESS cap ramp: tiny early → **$25,000-class** late (anti-whale). `addrCaps[0]` (Era I) is unused when `genesisOffset ≥ 333`; under **Model 2** it must be ≥ the Era I min ($5 = `5_000_000`), recommended **`5_000_000`** (flat one-seat Genesis = tightest anti-whale) | USDC 6dp | **DECISION** | `SALE_V2_PARAMETER_AND_TREASURY_SIMULATION.md` (per-address ramp), `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §C3/J3/T6; constructor reverts `BadEraCaps` if a sellable era's cap `<` that era's USDC minimum | **Transcribe the 9-value ramp from the sim** |
| 9 | `maxUsdcPerTx` | **`25_000_000_000`** ($25,000) | USDC 6dp | **DECISION** (recommended) | sim §7b; `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` J14; must be `>= every sellable era minimum`, else `BadEraCaps` | Founder sign-off |
| 10 | `reserveThroughSeat` | **`10_000`** (guarantees Eras II–IV; reserves ≈ **3.93M SYN**). Alternatives: `1_000_000` = full "First Million" (≈ **130.9M SYN**); `0` = disabled | seat # | **DECISION (F2)** | `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` J16, §C3, T21/T22; valid range `(GENESIS_END, FINAL_SEAT]` or `0` | Founder sign-off |
| 11 | `eraCaps[9]` | **Model B** (see §2). `eraCaps[0]` (Era I / Genesis) is **IGNORED** in BOTH paths — pass **`0`**. When V2 starts in Era II+ (`genesisOffset ≥ 333`) Genesis is V1-sealed; under **Model 2** (`genesisOffset < 333`) the constructor forces the Genesis aggregate cap **non-binding** (`type(uint256).max`) because Genesis is **range-bounded** (advances to Era II only at seat #334), so any `eraCaps[0]` value is accepted and discarded. Indices 1–8 = Eras II–IX (these ARE validated). | SYN 18dp | **DECISION (F3)** (Model B recommended) | sim §7a, §verdict; constructor reverts `BadEraCaps` if a SELLABLE era II–IX cap `<` one min entry | Founder sign-off + confirm index↔era mapping |
| 12 | `initialRouter` | `CommissionRouterV1` deployed address (or `address(0)` to bootstrap with **no referral** — full Operations slice to Operations) | address | **DECISION** | `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §router; swap later via 14-day `ROUTER_TIMELOCK` | Router deployed first |

> **Index↔era caution.** `eraCaps` / `addrCaps` are `uint256[9]` indexed era 1..9.
> When `genesisOffset = 333`, Era I is fully V1-sealed and V2's first newcomer is
> seat #334 (Era II) — index-0 caps are unused (`eraCaps[0] = 0`). Under **Model 2**
> (`genesisOffset < 333`) **`addrCaps[0]` IS live and binding** — it (plus the 333
> ceiling, the reserve floor and funded inventory) is the anti-whale guard for the
> Genesis seats V2 still sells (Era I, 100 SYN/USDC, $5 min), so it MUST be a valid
> Era I value. **`eraCaps[0]` is IGNORED** (the constructor forces the Genesis
> aggregate cap non-binding so Genesis cannot cap-advance to Era II before #334);
> pass `0`. Confirm the index-0 handling against `_eraParams` / the era-boundary
> table in the design doc **at deploy time**.

---

## 2. `eraCaps` — Model B (recommended), SYN sold-caps

From `docs/proposals/SALE_V2_PARAMETER_AND_TREASURY_SIMULATION.md` §7a (verdict: Model B).

| Index | Era | SYN sold-cap |
|-------|-----|--------------|
| 0 | I (Genesis) | **0** (IGNORED in both paths — V1-sealed when `genesisOffset ≥ 333`; range-bounded / cap forced non-binding under Model 2, so any value is discarded) |
| 1 | II | 416,875 |
| 2 | III | 1,166,500 |
| 3 | IV | 3,333,500 |
| 4 | V | 6,750,000 |
| 5 | VI | 11,250,000 |
| 6 | VII | 15,000,000 |
| 7 | VIII | 60,000,000 |
| 8 | IX | 150,000,000 |
| | **Total V2 funding** | **247,916,875 SYN** (≈ 70.8% of the 350M Membership pool) |

> Values are 18-decimal on-chain (multiply by `1e18`). Model A (155,626,850 /
> 44.5%) and Model C (327,333,750 / 93.5%) are documented alternatives; the sim
> recommends **B** for headroom + buffer. V1's already-distributed SYN must be
> subtracted from the 350M pool before funding (the contract is funded by SYN
> balance held at its address).
>
> **Model 2 (sub-333 handoff).** `eraCaps[0]` is **IGNORED** in both paths (pass
> `0`) — Genesis is **range-bounded**, not throttled by an aggregate SYN cap, so the
> II–IX total above is unchanged. If V1 seals **below** 333, V2 continues Genesis at
> Era I pricing; the *funding* needed for that continued tranche is **volume-
> dependent** (there is no aggregate cap), bounded by `addrCaps[0]` per address and
> the remaining `≤ (333 − genesisOffset)` first-seat slots. At the recommended
> `addrCaps[0] = $5` (one-seat Genesis, 500 SYN/seat), the entry-only base is
> `≤ (333 − genesisOffset) × 500 SYN` (e.g. ≈ **166,500 SYN** for a full 333 from
> offset 0), plus any V1-recognized Genesis buys — fund with headroom. Eras II–IX
> are UNCHANGED. The unsold Genesis tranche is auto-protected by the seat reserve
> (`_reserveSyn(genesisOffset)` rises accordingly — see §5 funding).

---

## 3. Constants (hardcoded — NOT constructor args)

| Constant | Value | Status | Note |
|----------|-------|--------|------|
| `GENESIS_END` | `333` | **FINAL** | Genesis ceiling |
| `FINAL_SEAT` | `1_000_000` | **FINAL** | Sale concludes at the millionth seat |
| `SCALE_6_TO_18` | `1e12` | **FINAL** | USDC(6dp) → SYN(18dp) scaling |
| `ROUTER_TIMELOCK` | `14 days` | **FINAL** | Delay on swapping the commission router (F4: raised 7→14) |
| `RECOVERY_TIMELOCK` | `14 days` | **FINAL (F4 ruled)** | Founder ruled 14 days (no launch multisig → EOA key-risk; a longer, pre-announced window to detect/stop a bad pause-and-sweep). Contract constant changed 7→14; full Foundry suite (59 tests) re-run GREEN. |

---

## 4. `CommissionRouterV1` — referral tier ladder (FINAL, ratified)

`_tierFor(count)` — axis = **verified referred-member count**; `opsPct` is a
**percent of the 10% Operations slice** (never of gross; Vault/Liquidity never
diluted). Effective gross % = `opsPct / 10`.

| Tier | Name | Referred count ≥ | % of Operations slice | ≈ % of gross |
|------|------|------------------|-----------------------|--------------|
| 0 | Signal | 0 | 30% | 3.0% |
| 1 | Advocate | 5 | 40% | 4.0% |
| 2 | Connector | 20 | 55% | 5.5% |
| 3 | Catalyst | 50 | 70% | 7.0% |
| 4 | Ambassador | 100 | 80% | 8.0% |

- The legacy "flat 5%" model is **fully superseded** — it is not a tier and not a
  fallback. When **no router is set**, the sale pays **no referral at all**: the
  full 10% Operations slice goes to the Operations wallet
  (`SyndicateSaleV2.buy` "router unset" branch). The lowest tier (Signal, tier 0)
  pays **30% of the Operations slice = 3% of gross**. See the SUPERSEDED stamps on
  the historical referral docs.
- `route()` input-integrity guard `SplitMismatch`: `vaultAmount + liquidityAmount
  + opsSlice == gross`. `referredCount` increments **only** on a valid, first-seat
  referral. `Attribution` event splits = `[vault, liquidity, referrer, operations,
  protocol]`, `attributionMode = 0` (last-verified).
- `addSource(saleV2, sourceId, OPERATIONS)` must run post-deploy.

---

## 5. Ownership & funding (deploy-time, not constructor values)

| Item | Recommendation | Status |
|------|----------------|--------|
| `SyndicateSaleV2` owner | `Ownable2Step` (2-step `transferOwnership` → multisig `acceptOwnership`). Transfer ownership to a **multisig** immediately after deploy. Owner powers are constrained: pause, router swap (timelocked), timelocked recovery-to-Vault only — **no price/split discretion, no SYN-to-owner path**. | DECISION (multisig address) |
| `CommissionRouterV1` owner | `Ownable2Step` — accept ownership from a **multisig** (2-step). | DECISION (multisig address) |
| Initial SYN funding | Fund the sale's SYN balance **≥ the initial reserve floor** `_reserveSyn(genesisOffset)` BEFORE opening, else the first buy reverts (under-funding / `ReserveFloorViolation`). With `reserveThroughSeat = 10_000` the floor is ≈ **3.93M SYN** when `genesisOffset = 333`; under **Model 2** (`genesisOffset < 333`) the floor is HIGHER because the unsold Genesis seats are also reserved — e.g. `_reserveSyn(2)` ≈ **4.10M SYN**. Top-ups over time are allowed; never let the funded balance fall below the live reserve floor while the sale is open. | DECISION |

> **Pre-buy test needs ZERO funding:** `claimV1Membership(proof)` only marks
> `knownMember` — it never moves SYN. Use it to validate the V1 proof path before
> any inventory is funded (see the V1 Proof-Flow Plan).

---

## 6. Blockers summary (what must clear before deploy)

1. **Live V1 snapshot** at handoff → `genesisOffset` + `v1MemberRoot` (pause V1
   first, at or below #333). **Model 2:** `genesisOffset` = the REAL V1 count even
   if **below 333**; V2 then continues Genesis from `genesisOffset + 1`. For a
   sub-333 handoff set `addrCaps[0]` (rec `5_000_000` = $5) to a valid Era I value —
   it is the binding Genesis anti-whale. `eraCaps[0]` is IGNORED (Genesis is
   range-bounded; the constructor forces its aggregate cap non-binding) — pass `0`.
2. **Founder rulings:** F2 `reserveThroughSeat` (rec 10,000), F3 funding model
   (rec Model B). F4 `RECOVERY_TIMELOCK` / `ROUTER_TIMELOCK` — **RESOLVED:
   founder ruled 14 days (both); constants set in
   `contracts/src/SyndicateSaleV2.sol`, full Foundry suite (59 tests) re-run
   GREEN (2026-06-15 parameter-lock).**
3. **`addrCaps[9]` ramp** transcribed from the treasury sim.
4. **Multisig address(es)** for both contracts.
5. **SYN inventory** funded ≥ reserve floor before opening.

_All other constructor inputs are FINAL (live addresses / hardcoded constants)._
