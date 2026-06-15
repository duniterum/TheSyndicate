# The Syndicate — Sale V2 Deploy Finalization + Forked-Mainnet Rehearsal Report

**Read-only / staging status.** No mainnet deploy, no funds moved, no frontend
publish, no V1 write, no architecture/contract/economics/doctrine change. **The V1
pause is NOT executed** — it remains gated on the founder's explicit go *plus*
confirmation the owner/admin EOA `0xa2E538…26e2F` is funded with AVAX.

This sprint completed the founder's first three steps:
1. **Finalized `addrCaps[1..8]`** (the one genuinely-open economic value — the J3
   per-era per-address ramp).
2. **Wrote `contracts/script/deploy-params.json`** with the real token/wallet/economic
   values + the **provisional** pre-pause snapshot (`genesisOffset`, `v1MemberRoot`).
3. **Ran a forked-mainnet deploy rehearsal** (in-test + the real `Deploy.s.sol`
   `--broadcast` against a local fork + `verify-deploy.mjs` read-back).

> ⚠ **Provisional values.** `genesisOffset = 2` and `v1MemberRoot = 0xae75ae…74ff`
> are derived from a **pre-pause dry-run** snapshot. They MUST be regenerated from
> the **V1 pause block** before any real deploy. `deploy-params.json` marks them via
> its `_PROVISIONAL` key. Until the seal, any new V1 buy changes them.

---

## Part 1 — Deploy finalization + rehearsal — **Report (A–F)**

### A. `addrCaps[1..8]` — **FINALIZED**

Per-era, per-address USDC cap ramp (6dp), transcribed from the **ratified J3 ramp**
(architecture doc) — the per-era anti-Sybil throttle (tiny early → $25,000-class
late). No economics were changed; the values were transcribed and locked.

| Era | Tier | `addrCap` (USDC 6dp) | Human |
|-----|------|----------------------|-------|
| I   | Genesis (Model 2 binding) | `5000000`     | $5 |
| II  | —    | `1000000000`  | $1,000 |
| III | —    | `2500000000`  | $2,500 |
| IV  | —    | `5000000000`  | $5,000 |
| V   | —    | `10000000000` | $10,000 |
| VI  | —    | `15000000000` | $15,000 |
| VII | —    | `20000000000` | $20,000 |
| VIII| —    | `25000000000` | $25,000 |
| IX  | —    | `25000000000` | $25,000 |

### B. `deploy-params.json` — **WRITTEN**

| Field | Value | Source / status |
|-------|-------|-----------------|
| `usdc` | `0xB97EF9…48a6E` | ✅ live USDC |
| `syn` | `0xC1Cf19…0170` | ✅ live SYN |
| `vault` | `0x205DdC…f464` | ✅ config |
| `liquidity` | `0xa9b072…2e25` | ✅ config |
| `operations` | `0x5cb579…BE80` | ✅ config |
| `genesisOffset` | `2` | ⚠ **PROVISIONAL** (regenerate from pause block) |
| `v1MemberRoot` | `0xae75ae…74ff` | ⚠ **PROVISIONAL** (regenerate from pause block) |
| `addrCaps` | `[5e6, 1e9, 2.5e9, 5e9, 1e10, 1.5e10, 2e10, 2.5e10, 2.5e10]` | ✅ J3 ramp (A) |
| `maxUsdcPerTx` | `25000000000` ($25,000) | ✅ J14 / founder sign-off |
| `reserveThroughSeat` | `10000` | ✅ F2 |
| `eraCaps` (18dp) | `0`, `416875e18`, `1166500e18`, `3333500e18`, `6750000e18`, `11250000e18`, `15000000e18`, `60000000e18`, `150000000e18` | ✅ Model B (J13/§7a); `eraCaps[0]` ignored — Era I forced to `type(uint256).max` |
| `initialRouter` | `0x0` | ✅ forced `address(0)` by `Deploy.s.sol` (day-one no referral) |
| `provisional` | `true` | ⚠ machine flag — `Deploy.s.sol` **fails closed** while `true`; set `false` only after the canonical post-pause snapshot (the rehearsal opts in via `ALLOW_PROVISIONAL_DEPLOY=1`) |

`foundry.toml` gained `fs_permissions` read access to `deploy-params.json` (the
script reads it via `vm.readFile`). `forge build` clean (via_ir).

### C. Forked-mainnet rehearsal — method

- **Foundry 1.1.0.** Avalanche C-Chain **archive** fork (`https://avalanche.drpc.org`)
  pinned at block **88,085,000** (public load-balanced non-archive endpoints fail
  forking with "missing trie node"; an archive node is required).
- **EVM spec = `cancun` at runtime** (matches live Avalanche post-Durango; the forked
  USDC/SYN bytecode uses `PUSH0`, so a `paris` spec reverts `NotActivated` when
  executing real mainnet token code). The **production build + the 71-test suite stay
  `paris`** per the deploy checklist's conservative target — **both green**. (`paris`
  bytecode is a strict subset and behaves identically under `cancun` execution.)
- **Three fidelity levels:**
  1. `contracts/test/RehearsalFork.t.sol` — self-contained: deploys with the exact
     `deploy-params` values on the fork and exercises the full behavior. Skips cleanly
     when `AVAX_RPC` is unset (default `forge test` unaffected).
  2. The **real `Deploy.s.sol`** dry-run (`forge script --rpc-url <fork>`, **no
     broadcast**) — validates `vm.readFile(deploy-params.json)` → constructor
     (`memberCount == genesisOffset == 2`, `activeEra == 1`, `router == 0x0`,
     est. ~3.57M gas).
  3. The **real `Deploy.s.sol` `--broadcast`** to a local `anvil` fork, then
     `tools/verify-deploy.mjs` read-back (run with the rehearsal opt-in
     `ALLOW_PROVISIONAL_DEPLOY=1`, since the snapshot is provisional).

### D. Rehearsal behavior — **GREEN** (`RehearsalFork.t.sol`, 1 test PASS)

On the real Avalanche fork the deployed Sale V2:
- `owner == deployer`; `RECOVERY_TIMELOCK == ROUTER_TIMELOCK == 14 days`.
- `GENESIS_OFFSET == memberCount == 2`; `commissionRouter == 0x0`.
- `V1_MEMBER_ROOT`, USDC/SYN, vault/liquidity/operations, `MAX_USDC_PER_TX`,
  `RESERVE_THROUGH_SEAT`, and **all 9** `maxUsdcPerAddressPerEra` + `eraSynCap`
  match deploy-params — Era I's `eraSynCap[1]` is **forced to `type(uint256).max`**
  by the constructor (the JSON `eraCaps[0]` is ignored).
- `activeEra == 1` (Genesis); `nextSeatNumber == 3`.
- `claimV1Membership(proof)` for a real V1 member → recognized, **no seat minted**
  (`memberCount` stays `2`).
- First fresh `buy()` ($5, Era I) → mints **member #3**, delivers **500 SYN**.
- A **returning V1 member**'s `buy()` with a valid proof → **no second seat**
  (`memberCount` stays `3`, `memberNumberOf == 0`), still receives SYN (delta
  asserted — the real V1 wallet already holds SYN on-chain).

**Negative paths** (invalid/stale proof rejects `claimV1Membership`, `paused` blocks
`buy`, reserve floor + Era I per-address cap + inventory all revert) are covered by
the baseline `SyndicateSaleV2.t.sol` unit suite — `test_claimV1_invalidProofReverts`,
`test_claimV1_alreadyKnownReverts`, `test_pause_blocksBuy`,
`test_reserveFloor_blocksOverdraw`, `test_buy_addressEraCapReverts`,
`test_buy_eraInventoryInsufficientReverts`. The fork gate owns deploy-params wiring;
the unit suite owns contract logic.

### E. `verify-deploy.mjs` read-back — **28/28 PASS**

The real `Deploy.s.sol --broadcast` deployed to the anvil fork (e.g.
`0x81a518…Da922`); the read-back verifier confirmed root, `GENESIS_OFFSET ==
memberCount`, tokens, wallets, **`commissionRouter` disarmed (`0x0`)**, reserve,
maxTx, and all 9 `addrCaps` + `eraCaps[2..9]`. Dry-run gas ≈ **3.57M**
(~**0.0005 AVAX** @ 0.14 gwei).

### F. Status + remaining blockers

Founder steps 1–3 **COMPLETE**. Default `forge test` = **71 passed, 1 skipped**
(fork test skips without `AVAX_RPC`). `deploy-params.json` is committed with the
finalized caps + provisional snapshot. `Deploy.s.sol` now **fails closed** on the
`provisional` flag — a stray mainnet `--broadcast` reverts with a
regenerate-the-snapshot message (proven: deploy reverts without the flag, succeeds
with `ALLOW_PROVISIONAL_DEPLOY=1`). Remaining gating before a real V2 deploy
(unchanged in nature — provisional snapshot is the only newly-narrowed item):

1. **Seal V1** — founder go + funded owner EOA `0xa2E538…26e2F` (Part 2-B command).
2. **Canonical snapshot** from the pause block → overwrite the provisional
   `genesisOffset` + `v1MemberRoot` in `deploy-params.json` **and set
   `"provisional": false`** (the deploy script fails closed until then); publish
   `public/v1-member-proofs.json` (`pending:false`, root match).
3. **Final pre-deploy review** on the frozen params.
4. **Mainnet deploy** + `Ownable2Step` ownership acceptance + `verify-deploy` read-back.
5. **Fund SYN ≥ `_reserveSyn(2)` ≈ 4.10M SYN** before opening (sub-333 floor exceeds
   the 3.93M @ 333; first buy reverts otherwise).
6. **Flip V2 live** in `syndicate-config.ts` (address + deploy block) + wire the buy
   UI to `resolveV1ProofForBuy` / `buildV2BuyArgs` (lib-only today).
7. **Open the sale** → `claimV1Membership` smoke → first minimal funded `buy()`.

**No deploy. No funds. No frontend publish. No V1 write.** The V1 pause remains the
single gating action; everything downstream is staged and de-risked.

---

## Part 2 — V1 seal + snapshot (reference, prior sprint)

### A. Pre-pause state (live, head block `88,084,390`)

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

`pause()` (selector `0x8456cb59`) exists and is owner-callable (confirmed by
`eth_call` simulation, not broadcast).

### B. Pause tx hash + block — **PENDING (gated)**

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

### C. Snapshot outputs (PROVISIONAL — pre-pause dry-run)

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
**Provenance:**
| # | Address | First block | First tx |
|---|---------|-------------|----------|
| 1 | `0x244531C571966f90f4849e03a507543d90f9C721` | 87,158,947 | `0x959bf5…a8d07` |
| 2 | `0x3488857b003104e2B08A1D198f8a23BFF28B0045` | 87,216,573 | `0xab4cc6…e89bd` |

### D. genesisOffset — **2** (provisional)

V2's first member is **#3**; V2 continues Genesis **#3–#333** (Model 2 sub-333).

### E. V1_MEMBER_ROOT (provisional)

```
0xae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff
```
Per-member proofs (canonical OZ `StandardMerkleTree`, leaf `["address"]`):
- `0x244531…C721` → `["0x3eb58fd16895751acdd571cb5db11df332a3c61a317fe3cdbba62311120dd484"]`
- `0x348885…0045` → `["0x2f88566ae4accbe296cd9222269a1eeeb4d56bf2c96a9f4bab14a2a9623e5fe3"]`

### F. Proof validation — **OK**

`validate-snapshot.mjs` re-derived the root independently and **replayed 2/2
proofs**; count reconciled (`members.length == 2 == totalBuyers()`). Exit 0.

> ⚠ These D/E/F values are **provisional** (pre-pause). They become canonical only
> after the post-pause re-run; the rehearsal in Part 1 used them as stand-ins.
