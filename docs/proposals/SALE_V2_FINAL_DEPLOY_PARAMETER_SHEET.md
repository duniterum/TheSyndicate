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
   and swap the router in later under the 7-day `ROUTER_TIMELOCK`). It is `Ownable2Step`.
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
| 6 | `genesisOffset` | Final V1 unique-member count (recommend pause V1 at the Genesis ceiling → **333**) | seat # | **DECISION** | `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §A3, J1; constructor reverts if `< 333` or `>= 1_000_000` | **Live V1 snapshot at handoff** |
| 7 | `v1MemberRoot` | Merkle root of the frozen V1 member address set | bytes32 | **DECISION** | `contracts/README.md` (exact root-generation procedure); `_verifyV1` uses OZ `MerkleProof.verify`, standard double-hashed leaf | **Live V1 snapshot at handoff** |
| 8 | `addrCaps[9]` | Per-era ADDRESS cap ramp: tiny early → **$25,000-class** late (anti-whale) | USDC 6dp | **DECISION** | `SALE_V2_PARAMETER_AND_TREASURY_SIMULATION.md` (per-address ramp), `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §C3/J3/T6; constructor reverts `BadEraCaps` if a sellable era's cap `<` that era's USDC minimum | **Transcribe the 9-value ramp from the sim** |
| 9 | `maxUsdcPerTx` | **`25_000_000_000`** ($25,000) | USDC 6dp | **DECISION** (recommended) | sim §7b; `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` J14; must be `>= every sellable era minimum`, else `BadEraCaps` | Founder sign-off |
| 10 | `reserveThroughSeat` | **`10_000`** (guarantees Eras II–IV; reserves ≈ **3.93M SYN**). Alternatives: `1_000_000` = full "First Million" (≈ **130.9M SYN**); `0` = disabled | seat # | **DECISION (F2)** | `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` J16, §C3, T21/T22; valid range `(GENESIS_END, FINAL_SEAT]` or `0` | Founder sign-off |
| 11 | `eraCaps[9]` | **Model B** (see §2). `eraCaps[0]` (Era I / Genesis) = **0** (V1-sealed); indices 1–8 = Eras II–IX | SYN 18dp | **DECISION (F3)** (Model B recommended) | sim §7a, §verdict; constructor reverts `BadEraCaps` on malformed caps | Founder sign-off + confirm index↔era mapping |
| 12 | `initialRouter` | `CommissionRouterV1` deployed address (or `address(0)` to bootstrap with **no referral** — full Operations slice to Operations) | address | **DECISION** | `SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §router; swap later via 7-day `ROUTER_TIMELOCK` | Router deployed first |

> **Index↔era caution.** `eraCaps` / `addrCaps` are `uint256[9]` indexed era 1..9.
> Era I is Genesis and is **V1-sealed** — V2's first newcomer is seat #334 (Era II)
> when `genesisOffset = 333`. Confirm the index-0 (Era I) handling against
> `_eraForSeat` / the era-boundary table in the design doc **at deploy time**.

---

## 2. `eraCaps` — Model B (recommended), SYN sold-caps

From `docs/proposals/SALE_V2_PARAMETER_AND_TREASURY_SIMULATION.md` §7a (verdict: Model B).

| Index | Era | SYN sold-cap |
|-------|-----|--------------|
| 0 | I (Genesis) | **0** (sealed by Sale V1) |
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

---

## 3. Constants (hardcoded — NOT constructor args)

| Constant | Value | Status | Note |
|----------|-------|--------|------|
| `GENESIS_END` | `333` | **FINAL** | Genesis ceiling |
| `FINAL_SEAT` | `1_000_000` | **FINAL** | Sale concludes at the millionth seat |
| `SCALE_6_TO_18` | `1e12` | **FINAL** | USDC(6dp) → SYN(18dp) scaling |
| `ROUTER_TIMELOCK` | `7 days` | **FINAL** | Delay on swapping the commission router |
| `RECOVERY_TIMELOCK` | `7 days` | **OPEN (F4)** | **Conflict:** code = 7 days; sim recommends **14 days**. Changing to 14d is a one-line contract edit that **would require a full Foundry re-run** and is OUT of this docs-only sprint's scope. Founder must rule before deploy. |

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
| Initial SYN funding | Fund the sale's SYN balance **≥ the initial reserve floor** `_reserveSyn(genesisOffset)` BEFORE opening, else the first buy reverts (under-funding / `ReserveFloorViolation`). With `reserveThroughSeat = 10_000` the floor ≈ **3.93M SYN**. Top-ups over time are allowed; never let the funded balance fall below the live reserve floor while the sale is open. | DECISION |

> **Pre-buy test needs ZERO funding:** `claimV1Membership(proof)` only marks
> `knownMember` — it never moves SYN. Use it to validate the V1 proof path before
> any inventory is funded (see the V1 Proof-Flow Plan).

---

## 6. Blockers summary (what must clear before deploy)

1. **Live V1 snapshot** at handoff → `genesisOffset` + `v1MemberRoot`
   (pause V1 first; recommend exactly at #333).
2. **Founder rulings:** F2 `reserveThroughSeat` (rec 10,000), F3 funding model
   (rec Model B), F4 `RECOVERY_TIMELOCK` (7 vs 14 — 14 needs a contract change +
   Foundry re-run).
3. **`addrCaps[9]` ramp** transcribed from the treasury sim.
4. **Multisig address(es)** for both contracts.
5. **SYN inventory** funded ≥ reserve floor before opening.

_All other constructor inputs are FINAL (live addresses / hardcoded constants)._
