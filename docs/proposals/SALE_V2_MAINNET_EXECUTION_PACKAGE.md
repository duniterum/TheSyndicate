# Sale V2 — Mainnet Execution Package (Steps 7–10)

> **Status:** READY TO COPY/PASTE. Read-only handoff archive. Nothing in this file
> has been executed. The three mainnet signatures (deploy, fund, buy) are the
> founder's alone. Before any broadcast, re-confirm the exact command + expected
> output one final time.
>
> **Doctrine:** Don't trust, verify. Every value below was read from live code or
> the live chain on **2026-06-15**. Re-read `currentReserveFloor()` and wallet
> balances immediately before acting — do not act on a memorized number.

---

## 0. Live state verified (mainnet read, 2026-06-15)

| Read | Value | Meaning |
|---|---|---|
| `SYN.balanceOf(recovered 0x975a…ecec8)` | **349,997,500 SYN** | funding source has ample balance |
| `SYN.balanceOf(Vault Reserve 0x205DdC…f464)` | **250,000,000 SYN** | alternative funding source |
| `SYN.balanceOf(V1 0x0020Df…842d)` | **0** | V1 fully drained |
| `V1.paused()` | **true** | V1 sale closed |
| `V1.availableSyn()` | **0** | V1 cannot sell |
| `deploy-params.json` | git-clean, `provisional:false` | canonical, unchanged since rehearsal |
| `v1-merkle.json.root` | `0xae75…74ff` | matches baked `V1_MEMBER_ROOT` |

---

## 1. Canonical constants (every read must match these)

| | |
|---|---|
| Chain | Avalanche C-Chain, **id 43114** |
| Signer / owner EOA | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` |
| USDC | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| SYN | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| VAULT (70%) | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| LIQUIDITY (20%) | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| OPERATIONS (10%) | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| V1 (paused) | `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` |
| Recovered-SYN wallet (funding source) | `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` |
| genesisOffset | `2` |
| V1_MEMBER_ROOT | `0xae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff` |
| reserveThroughSeat | `10000` |
| maxUsdcPerTx | `25000000000` ($25,000) |
| Compiler | solc `0.8.24`, optimizer `200`, **via_ir=true, evm_version=paris** (production `foundry.toml` default — do **not** override) |

**Reference amounts (wei):**

| Amount | Human | uint256 |
|---|---|---|
| Funding target | 5,000,000 SYN | `5000000000000000000000000` |
| Reserve floor `currentReserveFloor()` @ memberCount 2 | 4,099,000 SYN | `4099000000000000000000000` |
| `_reserveSyn(3)` (post-first-buy floor) | 4,098,500 SYN | `4098500000000000000000000` |
| First-buy `synOut` | 500 SYN | `500000000000000000000` |
| Sellable after 5M funding | 901,500 SYN | `901500000000000000000000` |
| SYN left after first buy | 4,999,500 SYN | `4999500000000000000000000` |
| Both timelocks | 14 days | `1209600` seconds |

**Shell prelude (every step):**

```bash
export PATH="/nix/store/y859lxadky9li4hr27dx3cvvrc5kc5i2-foundry-1.1.0/bin:$PATH"
cd contracts
export RPC=https://api.avax.network/ext/bc/C/rpc   # or any reliable 43114 RPC
```

---

## 2. STEP 7 — Deploy V2 (mainnet tx #1)

```bash
# signer: --ledger for hardware, or --account <keystore-name> for a cast keystore
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $RPC \
  --broadcast \
  --ledger \
  --sender 0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F \
  --verify \
  --verifier custom \
  --verifier-url 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan' \
  --etherscan-api-key "verifyContract"
```

- **Signer:** founder/admin EOA `0xa2E538…26e2F`. Deployer is the initial `owner`
  directly (Ownable2Step — no acceptance step for the *initial* owner). Use
  `--ledger` or a `cast wallet import` keystore (`--account`); **never** paste a
  plaintext `--private-key`.
- **Do NOT** set `ALLOW_PROVISIONAL_DEPLOY` (`provisional:false` already; guard passes).
- **Do NOT** pass `--evm-version` (paris from the toml is production and must match verification).
- **Expected gas:** ~**3,568,882** gas; at ~0.36 nAVAX ≈ **0.0013 AVAX**. Fund the deployer with **≥ 0.2 AVAX** headroom.
- **Expected console output:**
  ```
  SyndicateSaleV2 deployed at: 0x<ADDRESS>
  owner (deployer ...): 0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F
  memberCount (== genesisOffset): 2
  activeEra: 1
  commissionRouter (must be 0x0): 0x0000…0000
  ```
- **Where the address appears:** the console line above ·
  `broadcast/Deploy.s.sol/43114/run-latest.json` (`contractAddress`) · the Routescan receipt.
- **STOP if:** guard reverts ("PROVISIONAL snapshot") · chain id ≠ 43114 ·
  owner ≠ `0xa2E538…26e2F` · memberCount ≠ 2 · activeEra ≠ 1 · router ≠ `0x0` ·
  gas wildly different from ~3.57M.

> Save once: `export SALE=0x<ADDRESS>` and `export DEPLOY_BLOCK=<block from receipt>`

---

## 3. STEP 8a — Post-deploy verification (read-only)

Bundled 28-check verifier first:

```bash
cd tools && SALE_V2=$SALE RPC_URL=$RPC node verify-deploy.mjs && cd ..   # expect "28/28 checks passed"
```

Explicit reads:

```bash
cast call $SALE 'owner()(address)'                 --rpc-url $RPC   # 0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F
cast call $SALE 'memberCount()(uint256)'           --rpc-url $RPC   # 2
cast call $SALE 'GENESIS_OFFSET()(uint256)'        --rpc-url $RPC   # 2
cast call $SALE 'V1_MEMBER_ROOT()(bytes32)'        --rpc-url $RPC   # 0xae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff
cast call $SALE 'activeEra()(uint16)'              --rpc-url $RPC   # 1  (Era I / Genesis)
cast call $SALE 'currentEra()(uint16)'            --rpc-url $RPC   # 1
cast call $SALE 'nextSeatNumber()(uint256)'        --rpc-url $RPC   # 3
cast call $SALE 'currentReserveFloor()(uint256)'   --rpc-url $RPC   # 4099000000000000000000000  (4,099,000 SYN)
cast call $SALE 'commissionRouter()(address)'      --rpc-url $RPC   # 0x0000000000000000000000000000000000000000
cast call $SALE 'RECOVERY_TIMELOCK()(uint256)'     --rpc-url $RPC   # 1209600  (14 days)
cast call $SALE 'ROUTER_TIMELOCK()(uint256)'       --rpc-url $RPC   # 1209600
cast call $SALE 'paused()(bool)'                   --rpc-url $RPC   # false   (see note)
cast call $SALE 'USDC()(address)'                  --rpc-url $RPC   # 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
cast call $SALE 'SYN()(address)'                   --rpc-url $RPC   # 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170
cast call $SALE 'VAULT()(address)'                 --rpc-url $RPC   # 0x205DdC8921A4C60106930eE35e1F395c8D13f464
cast call $SALE 'LIQUIDITY()(address)'             --rpc-url $RPC   # 0xa9b072db8DcDbb470235204B69D37275d74a2e25
cast call $SALE 'OPERATIONS()(address)'            --rpc-url $RPC   # 0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80
cast call $SALE 'MAX_USDC_PER_TX()(uint256)'       --rpc-url $RPC   # 25000000000
cast call $SALE 'RESERVE_THROUGH_SEAT()(uint256)'  --rpc-url $RPC   # 10000

# address caps e=1..9 (expect: 5000000 1000000000 2500000000 5000000000 10000000000 15000000000 20000000000 25000000000 25000000000)
for e in 1 2 3 4 5 6 7 8 9; do cast call $SALE 'maxUsdcPerAddressPerEra(uint16)(uint256)' $e --rpc-url $RPC; done

# era SYN caps e=2..9 (expect: 416875e18 1166500e18 3333500e18 6750000e18 11250000e18 15000000e18 60000000e18 150000000e18)
for e in 2 3 4 5 6 7 8 9; do cast call $SALE 'eraSynCap(uint16)(uint256)' $e --rpc-url $RPC; done
cast call $SALE 'eraSynCap(uint16)(uint256)' 1 --rpc-url $RPC   # type(uint256).max (Genesis forced max under Model 2)
```

**Pause state:** the contract deploys **UNPAUSED** (`paused()==false`). The
constructor sets `activeEra` but never calls `_pause()`. This is safe because
`buy()` still **fails closed** (`InsufficientInventory` / `ReserveFloorViolation`)
until SYN is funded — an unfunded, unpaused contract cannot sell. *Optional
belt-and-suspenders:* `cast send $SALE 'pause()' --ledger` right after deploy and
`unpause()` just before the first buy. Not required.

---

## 4. STEP 8b — Source verification

`--verify` in Step 7 auto-submits to Routescan during broadcast. If skipped/failed,
run standalone (constructor args pre-encoded — verified against the canonical params):

```bash
export CARGS=0x000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e000000000000000000000000c1cf19a52603c1f71c057bde71d723cfa2fb0170000000000000000000000000205ddc8921a4c60106930ee35e1f395c8d13f464000000000000000000000000a9b072db8dcdbb470235204b69d37275d74a2e250000000000000000000000005cb57937d1cea51014e7ed8baaa05cca3f72be800000000000000000000000000000000000000000000000000000000000000002ae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff00000000000000000000000000000000000000000000000000000000004c4b40000000000000000000000000000000000000000000000000000000003b9aca00000000000000000000000000000000000000000000000000000000009502f900000000000000000000000000000000000000000000000000000000012a05f20000000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000037e11d60000000000000000000000000000000000000000000000000000000004a817c80000000000000000000000000000000000000000000000000000000005d21dba0000000000000000000000000000000000000000000000000000000005d21dba0000000000000000000000000000000000000000000000000000000005d21dba0000000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005846d6cad996e6cc000000000000000000000000000000000000000000000000f704177a521eec10000000000000000000000000000000000000000000000002c1e565a8480e6870000000000000000000000000000000000000000000000005955e3bb3e743fec00000000000000000000000000000000000000000000000094e47b8d68171534000000000000000000000000000000000000000000000000c685fa11e01ec6f00000000000000000000000000000000000000000000000031a17e847807b1bc0000000000000000000000000000000000000000000000007c13bc4b2c133c560000000000000000000000000000000000000000000000000000000000000000000000

# Routescan (Snowtrace shares this backend):
forge verify-contract $SALE src/SyndicateSaleV2.sol:SyndicateSaleV2 \
  --chain 43114 --watch \
  --verifier custom \
  --verifier-url 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan' \
  --etherscan-api-key "verifyContract" \
  --compiler-version 0.8.24 --num-of-optimizations 200 \
  --constructor-args $CARGS

# Sourcify fallback:
forge verify-contract $SALE src/SyndicateSaleV2.sol:SyndicateSaleV2 \
  --chain 43114 --verifier sourcify --constructor-args $CARGS
```

- **Files needed:** `src/SyndicateSaleV2.sol` + its OZ imports under `lib/` +
  `foundry.toml` (forge bundles standard-JSON automatically, including `via_ir`).
  Verify with the **same** settings as deploy (paris / 200 / via_ir) — both read
  `foundry.toml`, so they stay consistent.

---

## 5. STEP 9 — Fund 5,000,000 SYN (mainnet tx #2)

- **Amount:** 5,000,000 SYN · **raw uint256:** `5000000000000000000000000`
- **Recommended source:** the **recovered wallet `0x975a…ecec8`** — founder-
  controlled and currently holds **349,997,500 SYN** (ample). *(Alternative: the
  Vault Reserve `0x205DdC…f464`, 250,000,000 SYN.)*
- **Destination:** `$SALE`

```bash
# signer = the source wallet (recovered wallet)
cast send $SYN 'transfer(address,uint256)' $SALE 5000000000000000000000000 \
  --rpc-url $RPC --ledger --from 0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8
```

**Verify:**

```bash
cast call $SYN  'balanceOf(address)(uint256)' $SALE --rpc-url $RPC   # 5000000000000000000000000  (== 5,000,000 SYN)
cast call $SALE 'currentReserveFloor()(uint256)'    --rpc-url $RPC   # 4099000000000000000000000  (floor <= balance OK)
cast call $SALE 'sellableSynForNextSeat()(uint256)' --rpc-url $RPC   # 901500000000000000000000   (> 0 OK = 901,500 SYN)
cast call $SALE 'availableSyn()(uint256)'           --rpc-url $RPC   # 5000000000000000000000000
```

---

## 6. STEP 10a — First controlled buy (mainnet tx #3, + approve)

- **Buyer wallet:** a **fresh address** — NOT a V1 member, NOT the owner — so
  `firstSeat==true` mints seat **#3**. Must hold **≥ $5 USDC** (`5000000`) **+
  ~0.05 AVAX** gas (buy ≈ 200–350k gas).
- **referrer:** `address(0)` · **v1Proof:** `[]` (empty) · **buy amount:** $5 USDC
  (`5000000`, 6dp) · **minSynOut:** `500000000000000000000` (500 SYN, exact —
  Genesis math is exact, zero slippage).

```bash
# sanity quote first
cast call $SALE 'quote(uint256)(uint256,uint16,uint64,uint256,uint256,uint256)' 5000000 --rpc-url $RPC
# expect: synOut=500000000000000000000  era=1  synPerUsdc=100  seatIfFirst=3  available=5e24  eraCapRemaining=large

# approve exactly $5
cast send $USDC 'approve(address,uint256)' $SALE 5000000 --rpc-url $RPC --ledger --from <BUYER>

# buy
cast send $SALE 'buy(uint256,address,uint256,bytes32[])' \
  5000000 0x0000000000000000000000000000000000000000 500000000000000000000 '[]' \
  --rpc-url $RPC --ledger --from <BUYER>
```

**Expected result:** member **#3**; buyer receives **500 SYN**; **Era I**; **no
referral** (`referralAmount=0`); 70/20/10 routing; events emitted in this receipt
order (`Routed` first, then `Purchased`):

- `Routed(3, 3500000, 1000000, 500000, 0)`  *(vault 3.5 / liq 1.0 / ops 0.5 USDC, ref 0)*
- `Purchased(buyer, 3, 1, 5000000, 500000000000000000000, 100, true)`

---

## 7. STEP 10b — Post-buy verification

```bash
cast call $SALE 'memberCount()(uint256)'                   --rpc-url $RPC   # 3
cast call $SALE 'memberNumberOf(address)(uint256)' <BUYER> --rpc-url $RPC   # 3
cast call $SALE 'knownMember(address)(bool)' <BUYER>       --rpc-url $RPC   # true
cast call $SALE 'activeEra()(uint16)'                     --rpc-url $RPC   # 1  (still Era I)
cast call $SYN  'balanceOf(address)(uint256)' <BUYER>      --rpc-url $RPC   # 500000000000000000000  (+500 SYN)
cast call $SYN  'balanceOf(address)(uint256)' $SALE        --rpc-url $RPC   # 4999500000000000000000000  (5,000,000 - 500)
cast receipt <BUY_TX_HASH> --rpc-url $RPC   # decode logs: Purchased + Routed as above
```

**USDC splits — measure as before/after deltas** (wallets may carry prior balances):

```bash
# delta(VAULT) = +3500000 (3.5)  ·  delta(LIQUIDITY) = +1000000 (1.0)  ·  delta(OPERATIONS) = +500000 (0.5)
cast call $USDC 'balanceOf(address)(uint256)' 0x205DdC8921A4C60106930eE35e1F395c8D13f464 --rpc-url $RPC
cast call $USDC 'balanceOf(address)(uint256)' 0xa9b072db8DcDbb470235204B69D37275d74a2e25 --rpc-url $RPC
cast call $USDC 'balanceOf(address)(uint256)' 0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80 --rpc-url $RPC
```

---

## 8. Frontend switch values (stage only — DO NOT publish here)

In `src/lib/syndicate-config.ts`:

- `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS`: `null` → `"0x<SALE>"`
- `SALE_V2_DEPLOYMENT_BLOCK`: `null` → `<DEPLOY_BLOCK>n` (bigint literal)
- `SALE_V2_LIVE`: **derived automatically** — becomes `true` once both above are set. No separate flag.

Proof artifact:

- `public/v1-member-proofs.json` is currently the **placeholder** (`pending:true`,
  `root:null`). Replace with the production artifact built from the canonical
  snapshot at `contracts/tools/v1-merkle.json` (root **must equal** `0xae75…74ff`,
  `pending:false`). While `pending:true` the buy flow fails closed.

Build stamp / smoke (after publish): bump the site's deploy/build stamp. Smoke:
`/` (hero, live pulse, flywheel) · the Join flow ($5 buy builds args once
`pending:false`) · `/my-syndicate` (connect buyer → seat #3) · `/members` +
`/member/3` · `/activity` (Purchased event) · `/registry` / transparency center.

---

## 9. STOP / GO checklist

**GO only if all true:**

- [ ] Step 8a reads match canonical (owner, memberCount 2, genesisOffset 2, root `0xae75…74ff`, activeEra 1, nextSeat 3, floor 4,099,000 SYN, router `0x0`, both timelocks 1,209,600, all wallets/caps) — verifier prints **28/28**
- [ ] Source **verified** on Routescan/Sourcify (or Step 8b path ready)
- [ ] `balanceOf(SALE) == 5,000,000 SYN`, floor ≤ balance, `sellableSynForNextSeat > 0`
- [ ] First buy succeeds → **member #3**, 500 SYN out, `Purchased`+`Routed` emitted, splits 3.5/1.0/0.5 USDC, ref 0
- [ ] Indexer/explorer sees the events

**STOP immediately if any:** read-back mismatch · source verification impossible ·
`balanceOf(SALE)` < reserve floor · buy reverts · routing/split mismatch ·
assigned member number ≠ 3.

---

## 10. Referenced artifacts & files

| Path | Role | Tracked in git? |
|---|---|---|
| `contracts/script/deploy-params.json` | canonical constructor params (`provisional:false`) | yes |
| `contracts/script/Deploy.s.sol` | deploy script (forces router=0, fail-closed provisional guard) | yes |
| `contracts/src/SyndicateSaleV2.sol` | the contract being deployed | yes |
| `contracts/foundry.toml` | compiler settings (paris / 0.8.24 / 200 / via_ir) | yes |
| `contracts/tools/verify-deploy.mjs` | post-deploy 28-check read-back verifier | yes |
| `contracts/tools/RUNBOOK.md` | snapshot regeneration runbook | yes |
| `contracts/tools/export-members.mjs` | V1 member snapshot exporter | yes |
| `contracts/tools/v1-merkle.json` | merkle root + proofs (root `0xae75…74ff`) | **no — gitignored, regenerate** |
| `contracts/tools/members.json` | 2 V1 buyers, first-seen order | **no — gitignored, regenerate** |
| `contracts/tools/members.snapshot.json` | snapshot provenance (V1 addr, blocks 87157852→88087947) | **no — gitignored, regenerate** |
| `public/v1-member-proofs.json` | published proof artifact (currently placeholder) | yes |

> The snapshot artifacts are intentionally gitignored — regenerate deterministically
> via `contracts/tools/RUNBOOK.md`. The published proof artifact at
> `public/v1-member-proofs.json` is the only one that ships to the frontend.
