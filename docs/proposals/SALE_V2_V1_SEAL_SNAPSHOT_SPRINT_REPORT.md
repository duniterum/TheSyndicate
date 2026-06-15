# The Syndicate — V1 Seal + Snapshot Execution Sprint Report

**Read-only execution status.** No deploy, no funds, no publish, no V1 write, no
architecture/contract/economics/doctrine change. **The V1 pause was NOT executed**
— it is gated on the founder's explicit go *plus* confirmation the owner/admin EOA
is funded with AVAX. Provisional snapshot artifacts were generated in `/tmp` only
(nothing written into the repo); `contracts/script/deploy-params.json` is
**unchanged** (still the template). Companion command reference:
`SALE_V2_V1_SEAL_AND_SNAPSHOT_EXECUTION_PACKAGE.md`.

---

## A. Pre-pause state (live, head block `88,084,390`)

| View | Value | Expected | Match |
|------|-------|----------|-------|
| `paused()` | **false** | not paused | ✅ |
| `totalBuyers()` | **2** | ~2 | ✅ |
| `purchaseCount()` | **5** | ~5 | ✅ |
| `totalSynSold()` | **2,500 SYN** | ~2,500 | ✅ |
| `totalUsdcRaised()` | **$25** | ~$25 | ✅ |
| `availableSyn()` | **997,500 SYN** | ~997,500 | ✅ |
| `owner()` | **`0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`** | same | ✅ |
| `vaultWallet()` | `0x205DdC…f464` | config | ✅ |
| `liquidityWallet()` | `0xa9b072…2e25` | config | ✅ |
| `operationsWallet()` | `0x5cb579…BE80` | config | ✅ |

**No material difference — no STOP.** `pause()` (selector `0x8456cb59`) exists and
is owner-callable (confirmed by `eth_call` simulation, not broadcast).

---

## B. Pause tx hash + block — **PENDING (gated)**

Not executed. Awaiting: (1) founder explicit go, (2) confirmation the owner EOA
`0xa2E538…26e2F` is funded with AVAX (keep ≥ 0.05 AVAX; `pause()` costs < 0.01).

**Exact command (run only on go; signer MUST be the owner EOA):**
```bash
cast send 0x0020Df30C127306f0F5B44E6a6E4368D2855842d "pause()" \
  --rpc-url https://api.avax.network/ext/bc/C/rpc \
  --ledger            # or --keystore <path>; never a raw --private-key
```
Post-pause verify (must return `true`), then record tx hash + **pause block**:
```bash
cast call 0x0020Df30C127306f0F5B44E6a6E4368D2855842d "paused()(bool)" \
  --rpc-url https://api.avax.network/ext/bc/C/rpc
```
If `pause()` fails or `paused()` ≠ `true` → **STOP**.

---

## C. Snapshot outputs (PROVISIONAL — pre-pause dry-run)

Generated read-only at the current head and reconciled against on-chain counters
(**5 logs == `purchaseCount`, 2 unique == `totalBuyers`** → set provably complete).
The **canonical** artifacts will be regenerated from the **pause block**
(`V1_TO_BLOCK=<pauseBlock>`) after the seal.

**`members.json` (first-seen order):**
```json
[
  "0x244531C571966f90f4849e03a507543d90f9C721",
  "0x3488857b003104e2B08A1D198f8a23BFF28B0045"
]
```
**Provenance (`members.snapshot.json`):**
| # | Address | First block | First tx |
|---|---------|-------------|----------|
| 1 | `0x244531C571966f90f4849e03a507543d90f9C721` | 87,158,947 | `0x959bf5…a8d07` |
| 2 | `0x3488857b003104e2B08A1D198f8a23BFF28B0045` | 87,216,573 | `0xab4cc6…e89bd` |

**`v1-merkle.json`** → root + 2 per-member proofs (below).

---

## D. genesisOffset — **2** (provisional)

V2's first member is **#3**; V2 continues Genesis **#3–#333** (Model 2 sub-333).

## E. V1_MEMBER_ROOT (provisional)

```
0xae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff
```
Per-member proofs (canonical OZ `StandardMerkleTree`, leaf `["address"]`):
- `0x244531…C721` → `["0x3eb58fd16895751acdd571cb5db11df332a3c61a317fe3cdbba62311120dd484"]`
- `0x348885…0045` → `["0x2f88566ae4accbe296cd9222269a1eeeb4d56bf2c96a9f4bab14a2a9623e5fe3"]`

## F. Proof validation — **OK**

`validate-snapshot.mjs` re-derived the root independently and **replayed 2/2
proofs**; count reconciled (`members.length == 2 == totalBuyers()`). Exit 0.

> ⚠ These D/E/F values are **provisional** (pre-pause). If any buy lands before the
> seal, they change. They become canonical only after the post-pause re-run.

---

## G. deploy-params.json status

| Field | Current | Status / required value |
|-------|---------|-------------------------|
| `usdc` | `0xB97EF9…48a6E` | ✅ correct |
| `syn` | `0xC1Cf19…0170` | ✅ correct |
| `addrCaps[0]` | `5000000` | ✅ correct (Era I; Model 2 binding anti-whale, $5) |
| `reserveThroughSeat` | `10000` | ✅ correct (F2) |
| `eraCaps[0]` | `0` | ✅ correct (ignored) |
| `initialRouter` | `0x0` | ✅ forced `address(0)` by Deploy.s.sol (day-one no referral) |
| `vault` | `0x0` | ❌ → `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| `liquidity` | `0x0` | ❌ → `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| `operations` | `0x0` | ❌ → `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| `genesisOffset` | `0` | ❌ → **`2`** (post-pause snapshot) |
| `v1MemberRoot` | `0x0` | ❌ → **`0xae75ae…74ff`** (post-pause snapshot) |
| `maxUsdcPerTx` | `0` | ❌ → `25000000000` ($25,000; sheet item 9, founder sign-off) |
| `eraCaps[1..8]` | all `0` | ❌ → Model B (18dp): `416875` · `1166500` · `3333500` · `6750000` · `11250000` · `15000000` · `60000000` · `150000000` — each ×`1e18` |
| `addrCaps[1..8]` | all `0` | ❌ → **per-era ramp NOT yet pinned** — transcribe from sim §J3 (tiny early → $25,000-class late) + founder sign-off |
| owner/admin EOA | n/a (not a param) | post-deploy `Ownable2Step` acceptance to `0xa2E538…26e2F` |

**Ready-to-paste after pause** (everything except the `addrCaps[1..8]` ramp):
```json
{
  "usdc": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  "syn": "0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  "vault": "0x205DdC8921A4C60106930eE35e1F395c8D13f464",
  "liquidity": "0xa9b072db8DcDbb470235204B69D37275d74a2e25",
  "operations": "0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80",
  "genesisOffset": "2",
  "v1MemberRoot": "0xae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff",
  "addrCaps": ["5000000", "<TODO ramp×8>"],
  "maxUsdcPerTx": "25000000000",
  "reserveThroughSeat": "10000",
  "eraCaps": ["0",
    "416875000000000000000000",
    "1166500000000000000000000",
    "3333500000000000000000000",
    "6750000000000000000000000",
    "11250000000000000000000000",
    "15000000000000000000000000",
    "60000000000000000000000000",
    "150000000000000000000000000"
  ],
  "initialRouter": "0x0000000000000000000000000000000000000000"
}
```
**Proof artifact path:** `public/v1-member-proofs.json` — copy the validated
`{root,count,proofs}` here (set `pending:false`) at the gated publish step (not now;
while `pending` the frontend V1-proof flow fails closed).

---

## H. Fork rehearsal — **NOT run (blocked)**

Foundry 1.1.0 is available. The rehearsal is blocked on a **complete**
`deploy-params.json`: the constructor reverts `BadEraCaps` while `eraCaps[1..8]`
**and** `addrCaps[1..8]` (sellable eras) are `0`/below their era minimum. So it
needs the `addrCaps[1..8]` ramp pinned + signed off (and benefits from the real
post-pause root; the provisional root works for a dry rehearsal).

**Command (once params are complete):**
```bash
anvil --fork-url https://api.avax.network/ext/bc/C/rpc --chain-id 43114    # terminal 1
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast
SALE_V2=<forkAddr> RPC_URL=http://127.0.0.1:8545 node tools/verify-deploy.mjs
# then: fund test SYN, claimV1Membership(proof) for the 2 members, buy() a fresh seat
```
**Success proves:** deploy + constructor valid · `verify-deploy` GREEN · on-chain
`GENESIS_OFFSET == memberCount == 2` · `V1_MEMBER_ROOT` == generated root · owner
correct · `RECOVERY_TIMELOCK`/`ROUTER_TIMELOCK` == 14 days · `commissionRouter ==
0x0` · Era I active for member #3 · first `buy()` mints **#3** · a returning V1
member's `claimV1Membership(proof)` does **not** create a second seat.

---

## I. Remaining blockers before a real V2 deploy
1. **Seal V1** (founder go + funded EOA) → freezes the set.
2. **Canonical snapshot** from the pause block → real `genesisOffset` + `v1MemberRoot`.
3. **`addrCaps[1..8]` ramp** transcribed from sim §J3 + founder sign-off (the one
   genuinely-open economic value).
4. **`maxUsdcPerTx` + `eraCaps[1..8]`** written + signed off (values known/ratified).
5. **Forked-mainnet rehearsal** GREEN (deploy → `verify-deploy` → claim/buy).
6. **Deployer EOA key + RPC** provisioned (owner = `0xa2E538…26e2F`).
7. Final pre-deploy contract review on the frozen params.

## J. Remaining blockers before the first controlled V2 buy
*(all of I, plus)*
8. **Mainnet deploy** + `Ownable2Step` ownership acceptance + `verify-deploy` read-back.
9. **Fund SYN ≥ reserve floor** `_reserveSyn(2)` ≈ **4.10M SYN** before opening
   (sub-333 floor is higher than the 3.93M @ 333; first buy reverts otherwise).
10. **Publish** the real `public/v1-member-proofs.json` (`pending:false`, root match).
11. **Flip V2 live** in `syndicate-config.ts` (address + deploy block) + **wire the
    buy UI** to `resolveV1ProofForBuy`/`buildV2BuyArgs` (lib-only today).
12. **Open the sale**, then `claimV1Membership` smoke → first minimal funded `buy()`.

---

**No deployment. No funds. No frontend publish.** The single gating action remains
the founder's V1 pause; everything downstream is staged and de-risked.
