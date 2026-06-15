# The Syndicate — V1 Seal + Snapshot Execution Package

**Type:** Operational command package + founder checklist (execution gate).
**Read-only.** No deploy, no funds, no frontend publish, no architecture change.
Nothing here was executed. **The pause must not be executed until the founder
explicitly says so.**

**Live read taken at block `88,083,712`** (Avalanche C-Chain, mainnet). Values are
current as of that block and can still change until V1 is paused — re-read at pause
time.

---

## 1. Pre-seal verification (live V1 state)

Contract: **Sale V1** `0x0020Df30C127306f0F5B44E6a6E4368D2855842d`

| View | Value | Note |
|------|-------|------|
| `paused()` | **false** | V1 is **LIVE** right now |
| `totalBuyers()` | **2** | → `genesisOffset = 2` (Model 2, sub-333; V2 continues Genesis from seat **#3**) |
| `purchaseCount()` | **5** | 2 buyers, 5 purchases |
| `totalSynSold()` | **2,500 SYN** | `2500 × 1e18` |
| `totalUsdcRaised()` | **25 USDC** | `25 × 1e6` (5 × $5) |
| `availableSyn()` | **997,500 SYN** | unsold inventory held by V1 |
| `vaultWallet()` | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` | **matches config** |
| `liquidityWallet()` | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` | **matches config** |
| `operationsWallet()` | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` | **matches config** |
| `owner()` | **`0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`** | **pause authority** |

**Can the founder/admin EOA pause it?** **Yes.** V1 is `Ownable` + `Pausable`.
`pause()` exists and was **simulated successfully from the owner address** (an
`eth_call`, **not** broadcast). So the exact wallet that must execute the seal is
**`0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`**.

**Unique buyers from logs:** the public RPCs reject a full-range `getLogs` (block
range too large), so the authoritative count is the on-chain counter
`totalBuyers() = 2`. The snapshot's `export-members.mjs` performs the chunked log
reconciliation (its `members.json` length **must equal 2** — see Stop Conditions).

---

## 2. Seal command package (DO NOT EXECUTE until founder go)

`pause()` selector: **`0x8456cb59`** · signer: **owner EOA `0xa2E538…26e2F`**.

### Path A — explorer Write tab (easiest, if V1 is verified)
1. Open the verified contract on Snowtrace / Routescan
   (`https://snowtrace.io/address/0x0020Df30C127306f0F5B44E6a6E4368D2855842d#writeContract`).
2. **Connect the owner wallet** `0xa2E538…26e2F`.
3. Call **`pause()`** (no args) → confirm in wallet.

### Path B — `cast` (robust, hardware-wallet friendly)
```bash
# Ledger (recommended) — Replit never sees the key
cast send 0x0020Df30C127306f0F5B44E6a6E4368D2855842d "pause()" \
  --rpc-url https://api.avax.network/ext/bc/C/rpc \
  --ledger

# or an encrypted keystore
cast send 0x0020Df30C127306f0F5B44E6a6E4368D2855842d "pause()" \
  --rpc-url https://api.avax.network/ext/bc/C/rpc \
  --keystore <path-to-keystore.json>
```
**Gas/AVAX:** `pause()` is a single state write (~30–47k gas). At Avalanche base
fee it costs **well under 0.01 AVAX** — keep **≥ 0.05 AVAX** in the owner wallet
for comfort. (Do **not** pass a raw `--private-key`.)

### Post-pause verification
```bash
cast call 0x0020Df30C127306f0F5B44E6a6E4368D2855842d "paused()(bool)" \
  --rpc-url https://api.avax.network/ext/bc/C/rpc
# expect: true
```
Record the **pause transaction hash** and its **block number** — that block is the
snapshot cutoff (`V1_TO_BLOCK`).

---

## 3. Snapshot command package (run AFTER pause confirmed)

```bash
cd contracts/tools
npm install                      # once (viem + @openzeppelin/merkle-tree)

# (1) export — pin to the pause block for a final, deterministic set
V1_TO_BLOCK=<pauseBlock> node export-members.mjs
#   -> members.json           first-seen (Holder-Index) order
#   -> members.snapshot.json  provenance (sale addr, block range, per-member firstSeen)
#   prints: "unique V1 members = N"   (must be 2)

# (2) root + proofs
node gen-v1-root.mjs members.json
#   prints: V1_MEMBER_ROOT
#   -> v1-merkle.json { root, count, proofs, tree }

# (3) validate — independent re-derive + replay every proof
node validate-snapshot.mjs members.json v1-merkle.json
#   exit 0 = OK; non-zero = STOP

# (4) count consistency (manual gate)
#   members.json length == on-chain totalBuyers() (== 2)
```

**Expected output files:** `members.json`, `members.snapshot.json`,
`v1-merkle.json`. (The frontend artifact `public/v1-member-proofs.json` is written
in the later, gated **publish** step — not now.)

---

## 4. Deploy-params update plan

After the snapshot, edit `contracts/script/deploy-params.json`:

| Field | Fill with | Source |
|-------|-----------|--------|
| `genesisOffset` | **`"2"`** | export count (step 1) |
| `v1MemberRoot` | the validated root | `gen-v1-root` (step 2), validated (step 3) |
| (frontend) proof artifact | `public/v1-member-proofs.json` = `{root,count,proofs}` from `v1-merkle.json` | **publish step — gated, later** |

**Derived from the snapshot:** only `genesisOffset` + `v1MemberRoot`. No other
field comes from the snapshot.

**Still placeholder / zero — must be transcribed before fork rehearsal** (these do
**not** need the snapshot; can be done now):
- `vault` = `0x205DdC8921A4C60106930eE35e1F395c8D13f464`
- `liquidity` = `0xa9b072db8DcDbb470235204B69D37275d74a2e25`
- `operations` = `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80`
- `addrCaps[1..8]` — the per-era address-cap ramp (transcribe from the treasury
  sim §J3 via the parameter sheet; **not restated here to avoid transcription
  error**) + founder sign-off
- `eraCaps[1..8]` — **Model B** (×1e18): II 416,875 · III 1,166,500 · IV 3,333,500
  · V 6,750,000 · VI 11,250,000 · VII 15,000,000 · VIII 60,000,000 · IX 150,000,000
- `maxUsdcPerTx` — parameter sheet J14

**Already correct:** `usdc`, `syn`, `addrCaps[0]="5000000"`,
`reserveThroughSeat="10000"`, `eraCaps[0]="0"`, `initialRouter` (forced `0x0`).

> **Model 2 note (genesisOffset = 2):** `addrCaps[0]` IS live and binding (Genesis
> continues #3–333). The reserve floor `_reserveSyn(2)` ≈ **4.10M SYN** (higher
> than the 3.93M @ 333 because the unsold Genesis seats are also reserved) — a
> **funding-gate** figure, not a seal/snapshot concern.

---

## 5. Fork-rehearsal readiness

**Can a forked-mainnet rehearsal run immediately after the snapshot? — YES**,
once §4 caps are transcribed.

- **Missing before fork rehearsal:** the transcribed caps (`addrCaps[1..8]`,
  `eraCaps[1..8]`, `maxUsdcPerTx`) + the three split addresses. `genesisOffset` +
  `v1MemberRoot` come from the snapshot. No real deployer key is needed — `anvil`
  provides funded accounts.
- **Exact commands:**
  ```bash
  # 1) fork mainnet
  anvil --fork-url https://api.avax.network/ext/bc/C/rpc --chain-id 43114

  # 2) deploy against the fork
  cd contracts
  forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast

  # 3) read-back
  SALE_V2=<forkDeployedAddr> RPC_URL=http://127.0.0.1:8545 \
    node tools/verify-deploy.mjs

  # 4) fund test SYN to the sale (impersonate a SYN holder), then exercise
  #    claimV1Membership(proof) for the 2 real members + a fresh buy()
  ```
- **Success means:** deploy succeeds; `verify-deploy` GREEN (on-chain
  `V1_MEMBER_ROOT` == `v1-merkle.json` root, `GENESIS_OFFSET == memberCount == 2`,
  token/wallet wiring correct, `commissionRouter == 0x0`); a V1 member's
  `claimV1Membership(proof)` succeeds **without consuming a seat**
  (`knownMember == true`, `memberNumberOf == 0`); a fresh `buy()` mints seat **#3**
  at Era I pricing.

> A rehearsal can also be run **today** (pre-seal) using a current-state *test*
> snapshot (count = 2) to prove the mechanism; re-run with the **real** root after
> the seal.

---

## 6. Stop conditions (halt — do not proceed)

| Condition | Concrete check |
|-----------|----------------|
| V1 not paused | `paused()` ≠ `true` after the pause tx → the set isn't final; **do not snapshot** |
| Buyer-count mismatch | `members.json` length ≠ `totalBuyers()` (≠ 2) |
| Proof validation fails | `validate-snapshot.mjs` exits non-zero |
| Root mismatch | on-chain `V1_MEMBER_ROOT` ≠ `v1-merkle.json` root (post-deploy / `EXPECTED_ROOT` check) |
| Deploy params incomplete | any `0x0` address, zero root, or zero `eraCaps[1..8]` remains (the constructor reverts `BadEraCaps` anyway) |
| Fork rehearsal fails | deploy reverts, `verify-deploy` non-zero, or claim/buy fails → **do not touch mainnet** |

---

## 7. Final checklist

### Founder action
1. Confirm the decision to seal at the current count — **`genesisOffset = 2`**, V2
   continues Genesis **#3–333** (Model 2). 
2. Ensure the owner EOA **`0xa2E538…26e2F`** holds **≥ 0.05 AVAX** for gas.
3. Execute **`pause()`** on V1 (Path A or B) — **only on your explicit go**.
4. Confirm **`paused() == true`** and share the **pause tx hash + block**.
5. Sign off on the ratified caps / funding model when params are filled (already
   decided — F2/F3/F4).

### Replit action (after founder approval / after the pause is confirmed)
1. Pin `V1_TO_BLOCK = <pauseBlock>`; run `export-members` → `members.json` +
   provenance; assert **count == 2**.
2. `gen-v1-root` → `V1_MEMBER_ROOT` + `v1-merkle.json`.
3. `validate-snapshot` (re-derive + replay every proof) → must exit 0.
4. Fill `deploy-params.json`: `genesisOffset=2`, `v1MemberRoot=<root>`, split
   addresses, transcribe caps + `maxUsdcPerTx`; leave `initialRouter` `0x0`.
5. Run the **forked-mainnet rehearsal** (deploy → `verify-deploy` → claim/buy) →
   all green.
6. Report results and **STOP** before any mainnet deploy, funding, or publish —
   await the next explicit go.

**No deployment. No funds. No frontend publish.** This is the last preparation
step before the real V1 seal.
