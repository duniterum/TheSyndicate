# V2b Final Execution Chain — Pause → Deploy

**Scope:** turn the proven plan into the exact, unambiguous execution chain. **Read-only on doctrine/architecture.** No broadening: referral/NFT/Archive/journey/wallet-providers/redesign untouched; router stays `0x0`; EOA owner; no external audit; package/rank/chapter cleanup is public-relaunch work, not deploy work.

**Status at authoring (block 88,179,800, 2026-06-16):** V2a `paused()=false`, `memberCount=5`. Deployer/owner `0xa2E538…26e2F` holds 0 SYN — **by design; it never needs to hold SYN** (see §D, Q6). **Launch funding IS available:** the **Membership Distribution** wallet `0x975a…ECec8` holds **344,997,500 SYN** (verified on-chain) — ~52× the recommended launch amount. Funding is a **post-deploy transfer** from that wallet to the new V2b address (step 12), not a pre-pause blocker. **Do not pause yet. Do not broadcast yet.**

The only remaining deployment blockers are exactly these six gates — every step below maps to closing one:
1. V2a not paused · 2. final snapshot not generated from pause block · 3. final params not validated · 4. final rehearsal not re-pinned · 5. **funding transfer not yet executed + verified** (post-deploy; the source wallet is already funded) · 6. deploy dry-run / read-backs not green.

---

## Canonical addresses (mainnet C-Chain 43114)

| Role | Address |
|---|---|
| V2a (live, to pause) | `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48` |
| V1 (history source) | `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` |
| SYN token | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| USDC | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| Vault (70%) | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| Liquidity (20%) | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| Operations (10%) | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| **Membership Distribution (SYN funding source, 35% / 350M slice)** | `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` |
| Deployer / owner EOA (deploys + owns; needs AVAX gas only, no SYN) | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` |

**Placeholders used below:** `<RPC>` mainnet RPC · `<SIGNER>` deployer/owner signer (`--ledger` or `--private-key $PK`) · `<DIST_SIGNER>` signer for the **Membership Distribution** funding wallet `0x975a…ECec8` (used ONLY for the step-12 funding transfer) · `<PAUSE_TX>` pause tx hash · `<V2A_PAUSE_BLOCK>` block of the pause tx · `<FINAL_OFFSET>` finalized genesisOffset · `<FINAL_ROOT>` finalized v1MemberRoot · `<V2B_ADDR>` deployed V2b · `<ARCHIVE_RPC>` archive-node RPC for the fork.

---

## A. Executable checklist

> Run all `cast`/`forge script` commands from `contracts/`. Run all snapshot tools from `contracts/tools/` (they write relative to CWD).

**1 — Pre-pause live read (record for the audit trail)**
```
cast call 0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48 "paused()(bool)"        --rpc-url <RPC>   # expect false
cast call 0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48 "memberCount()(uint256)" --rpc-url <RPC>  # expect 5 (record)
cast call 0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48 "owner()(address)"        --rpc-url <RPC>  # expect 0xa2E538…26e2F
cast call 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170 "balanceOf(address)(uint256)" 0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8 --rpc-url <RPC>  # Membership Distribution SYN — FUNDING SOURCE (≈344,997,500e18; must be ≥ <FUNDING_WEI>)
cast balance 0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F --rpc-url <RPC>   # deployer AVAX for gas (deployer needs AVAX only, NOT SYN)
cast block-number --rpc-url <RPC>   # record pre-pause head
```

**2 — Pause V2a** (owner-only; reversible via `unpause()`)
```
cast send 0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48 "pause()" --rpc-url <RPC> <SIGNER>
```

**3 — Record pause tx + block**
```
# capture the tx hash as <PAUSE_TX>, then:
cast receipt <PAUSE_TX> --rpc-url <RPC>   # read blockNumber -> record as <V2A_PAUSE_BLOCK>
```

**4 — Verify paused=true** (gate 1)
```
cast call 0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48 "paused()(bool)" --rpc-url <RPC>   # MUST be true
```
If not `true` → **STOP** (re-send pause; do not snapshot a live sale).

**5 — Generate pause-block snapshot** (gate 2) — from `contracts/tools/`
```
SNAPSHOT_BLOCK=<V2A_PAUSE_BLOCK> node export-members-merged.mjs   # -> members-merged.json (+ .snapshot.json: count = <FINAL_OFFSET>)
node gen-v1-root.mjs members-merged.json                          # prints <FINAL_ROOT>; ALWAYS writes v1-merkle.json
cp v1-merkle.json v2b-merkle.json                                 # name the MERGED artifact distinctly
```

**6 — Validate snapshot** (gate 3) — from `contracts/tools/`
```
node validate-snapshot.mjs members-merged.json v2b-merkle.json <FINAL_ROOT>   # MUST print OK + count + N proofs verified
cast call 0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48 "memberCount()(uint256)" --block <V2A_PAUSE_BLOCK> --rpc-url <RPC>
```
Snapshot count **MUST equal** V2a `memberCount` at `<V2A_PAUSE_BLOCK>`. Mismatch → **STOP**.

**7 — Finalize deploy params** — `contracts/script/deploy-params.v2b.final.template.json`
- Set `genesisOffset = <FINAL_OFFSET>`, `v1MemberRoot = <FINAL_ROOT>`, `provisional = false`.
- Leave everything else byte-identical (incl. `addrCaps[0] = "25000000000"` — the $5→$25k fix). Do **not** hand-edit offset/root from memory.

**8 — Re-pin RehearsalForkV2b** (gate 4, part 1) — `contracts/test/RehearsalForkV2b.t.sol`
- Update `ROOT` and `GENESIS_OFFSET` to the finalized values; if the member set changed, update `M1_V1`/`M3_V2A` and `_proofM1()`/`_proofM3()` from `v2b-merkle.json`.
- The new fail-closed guard (`test_rehearsalConstantsMatchDeployParams`) will **revert** until these match the final params file — that is the intended forcing function.

**9 — Re-run final fork rehearsal** (gate 4, part 2)
```
DEPLOY_PARAMS=script/deploy-params.v2b.final.template.json \
AVAX_RPC=<ARCHIVE_RPC> AVAX_FORK_BLOCK=<V2A_PAUSE_BLOCK> \
forge test --match-contract RehearsalForkV2b -vv --evm-version cancun
```
Both the constant guard **and** the full flow must pass. Any failure → **STOP**.

**10 — EXPECT_*-guarded deploy DRY-RUN** (gate 6, simulate — NO broadcast)
```
EXPECT_GENESIS_OFFSET=<FINAL_OFFSET> EXPECT_V1_ROOT=<FINAL_ROOT> \
DEPLOY_PARAMS=script/deploy-params.v2b.final.template.json \
forge script script/Deploy.s.sol:Deploy --rpc-url <RPC>
```
Must simulate cleanly and log `memberCount == <FINAL_OFFSET>`, `commissionRouter == 0x0`. Guard revert or mismatch → **STOP**. (The script now *requires* both `EXPECT_*` for any non-provisional deploy — see §B.)

**11 — Deploy V2b mainnet — ONLY if every prior gate is green**
```
EXPECT_GENESIS_OFFSET=<FINAL_OFFSET> EXPECT_V1_ROOT=<FINAL_ROOT> \
DEPLOY_PARAMS=script/deploy-params.v2b.final.template.json \
forge script script/Deploy.s.sol:Deploy --rpc-url <RPC> <SIGNER> --broadcast --verify
# record deployed address as <V2B_ADDR>
```
Production compile profile = **paris / optimizer_runs=200** (default `foundry.toml`), **not** the cancun rehearsal profile.

**12 — Fund V2b** (gate 5) — separate tx, **after** deploy; the constructor pulls no SYN. **Source = Membership Distribution wallet `0x975a…ECec8`** (holds ≈344,997,500 SYN — see §D); sign with **that wallet's key (`<DIST_SIGNER>`), NOT the deployer**. `<FUNDING_WEI>` = `6597000000000000000000000` (6,597,000e18) minimum; `7000000000000000000000000` (7,000,000e18) recommended.
```
cast send 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170 "transfer(address,uint256)" <V2B_ADDR> <FUNDING_WEI> --rpc-url <RPC> <DIST_SIGNER>
```

**13 — Verify funding + reserve/headroom**
```
cast call 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170 "balanceOf(address)(uint256)" <V2B_ADDR> --rpc-url <RPC>   # == <FUNDING_WEI>
```
Confirm the funded balance supports the largest offered Genesis package above the through-seat reserve (≈ 4.1M SYN reserve + 2.5M delivered for a $25k buy). If unsure, re-run the fork sim funded to exactly `<FUNDING_WEI>` and confirm a $25k buy succeeds.

**14 — Verify V2b getters** (gate 6 read-backs)
```
cast call <V2B_ADDR> "GENESIS_OFFSET()(uint256)"            --rpc-url <RPC>   # <FINAL_OFFSET>
cast call <V2B_ADDR> "memberCount()(uint256)"               --rpc-url <RPC>   # <FINAL_OFFSET>
cast call <V2B_ADDR> "V1_MEMBER_ROOT()(bytes32)"            --rpc-url <RPC>   # <FINAL_ROOT>
cast call <V2B_ADDR> "MAX_USDC_PER_TX()(uint256)"           --rpc-url <RPC>   # 25000000000
cast call <V2B_ADDR> "maxUsdcPerAddressPerEra(uint256)(uint256)" 1 --rpc-url <RPC>   # 25000000000
cast call <V2B_ADDR> "commissionRouter()(address)"          --rpc-url <RPC>   # 0x0
cast call <V2B_ADDR> "activeEra()(uint256)"                 --rpc-url <RPC>   # 1
cast call <V2B_ADDR> "nextSeatNumber()(uint256)"            --rpc-url <RPC>   # <FINAL_OFFSET>+1
cast call <V2B_ADDR> "owner()(address)"                     --rpc-url <RPC>   # 0xa2E538…26e2F
```
Any mismatch → **STOP**, do not fund/switch (redeploy from corrected params).

**15 — Keep frontend pointed safely until config/indexer cutover**
- Do **not** switch the public site to V2b until getters verified (14) **and** funding verified (13) **and** the indexer unions V1 ∪ V2a ∪ V2b first-seen so member identity does not regress.
- Interim: leave the site as-is (it will read V2a `paused` — an acceptable holding state) or show an explicit "sale paused / migrating" notice. **No public buy against an unverified or unfunded V2b.**

**16 — Rollback path if any step fails**
- **Before deploy:** stop; nothing on-chain except the pause.
- **Restore the prior sale:** `cast send 0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48 "unpause()" --rpc-url <RPC> <SIGNER>` (re-opens V2a; the $5 defect returns, but the sale is live).
- **Bad V2b deploy (getter mismatch):** do not fund, do not switch the frontend; an unfunded V2b cannot sell, so it is inert. Redeploy from corrected params.

---

## B. Code / script guard changes (DONE this turn — safe & scoped)

1. **`contracts/script/Deploy.s.sol` — `EXPECT_*` now MANDATORY for non-provisional deploys.** When `provisional == false`, the script reverts unless **both** `EXPECT_GENESIS_OFFSET` and `EXPECT_V1_ROOT` are set, then still asserts the file matches them. This closes the #1 risk from the launch-risk memo (silent broadcast of the stale default `deploy-params.json`). Provisional rehearsals (`ALLOW_PROVISIONAL_DEPLOY=1`) are exempt → the fork rehearsal flow is unchanged.
   - **Why safe:** no test invokes `Deploy.run()` (both rehearsal tests deploy `new SyndicateSaleV2(...)` directly), and no CI/script/package.json runs `forge script Deploy` — confirmed by repo scan. So nothing automated breaks.
2. **`contracts/test/RehearsalForkV2b.t.sol` — fail-closed constant guard.** New `test_rehearsalConstantsMatchDeployParams()` (runs with **no** fork, so on every `forge test`) asserts the test's `ROOT`, `GENESIS_OFFSET`, and `addrCaps[0]` equal the `DEPLOY_PARAMS` file (default rehearsal file). The fork test also calls it first. The rehearsal can no longer pass against stale constants once the snapshot is re-pinned — it reverts until the constants match the finalized file.

## C. Final rehearsal method — recommendation

**Safer = keep readable constants + the new fail-closed cross-check (implemented), NOT full JSON-proof parameterization.** Reading per-member `bytes32[][]` proofs from JSON inside Solidity is fiddly and would add parsing complexity to the verification harness immediately before a mainnet deploy — a bug there could *mask* a real failure. The cross-check gives single-source-of-truth enforcement (the test's root/offset/Genesis-cap must equal the deploy file) without that risk; per-member proofs remain validated exhaustively and independently by `validate-snapshot.mjs`. Post-pause, update `ROOT`/`GENESIS_OFFSET`/proofs from the finalized snapshot (step 8); the guard enforces lockstep. Full parameterization is a reasonable *future* hardening, not a pre-deploy change.

## D. Funding requirement and availability — **AVAILABLE; transfer executes after deploy**

> Correction to a prior draft: funding is **not** a pre-pause blocker, and the deployer EOA's 0-SYN balance is irrelevant. The seven questions, answered from live on-chain reads (block ~88.18M):

- **Q1 — Who holds the Membership Distribution allocation?** The **Membership Distribution** wallet `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` — the 35% / 350,000,000 SYN slice (`TOKENOMICS_ALLOCATION` / `ALLOCATION_WALLETS`), canonical purpose: *"Pool used for website membership purchases, small entries, and custom member contributions."*
- **Q2 — Which wallet funds the sale contract?** The same Membership Distribution wallet. **Verified pattern:** V2a's current **4,998,500 SYN** inventory traces to it — the slice has fallen `350,000,000 → 344,997,500`, and the ~5,002,500 delta = V2a's funded inventory (4,998,500) + seats already sold (~4,000). So "Membership Distribution → sale contract" is the **already-proven** funding path, not a new mechanism.
- **Q3 — How much is available now?** **344,997,500 SYN** in `0x975a…ECec8` (live `balanceOf`). That is **~52× the recommended launch funding** — no acquisition or purchase is required.
- **Q4 — Does funding from this wallet respect allocation doctrine?** **Yes — and it's the *only* doctrinally-valid source.** The Membership Distribution slice exists precisely to back membership sales. Funding the sale from Vault Reserve, Founder, Liquidity, Partnerships, Contributors, or Future Ecosystem would **violate** the allocation map and must not be done.
- **Q5 — Which wallet should send launch funding to V2b?** `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` (Membership Distribution), signed with that wallet's key (`<DIST_SIGNER>`), as a plain ERC20 `transfer` to `<V2B_ADDR>` (step 12).
- **Q6 — Does the deployer EOA need to hold SYN?** **No.** It only **deploys** V2b and is its `owner`; it needs **AVAX for gas only**. The contract dispenses SYN from *its own* balance, so funding is a transfer into the contract that can only happen **after** deploy (the address must exist first). The deployer holding 0 SYN is **expected and correct**.
- **Q7 — sizing (unchanged):** Genesis rate 100 SYN/USDC. **Through-seat reserve** (`RESERVE_THROUGH_SEAT = 10,000`) ≈ **4,097,000 SYN** at `offset = 5` (re-confirm after finalize — shifts with the offset). One **$10,000** buy needs ≈ **5,097,000 SYN**; one **$25,000** buy needs ≈ **6,597,000 SYN**. **Recommended launch funding ≥ 6,597,000 SYN (round to 7,000,000 for headroom)** so the full Genesis ladder to the $25k cap is sellable day one. The source wallet covers this ~52×.

**Reclassified blocker:** *not* "funding unavailable." The remaining action is **"funding transfer must be executed after deploy"** — transfer ≥ 6,597,000 SYN from `0x975a…ECec8` → `<V2B_ADDR>` (step 12) and verify (step 13). (V2a's own SYN is irrelevant: `recoverUnsoldSyn` is timelocked → Vault, and the Membership Distribution wallet is the proper source anyway.)

## E. Live smoke-test recommendation

**Fund fully first, then smoke. Do NOT do a $5 buy before full funding.** Because the contract enforces the through-seat reserve on every buy, even a $5 purchase can revert on an underfunded contract — that would be a *false* "broken" signal. Safest sequence: **deploy → verify getters (14) → fund to launch amount (12) → verify balance (13) → ONE real $5 buy of seat #6 from a throwaway address → confirm seat minted + 70/20/10 routing to Vault/Liquidity/Operations → only then open the public site.**

## F. Stop conditions (abort the chain if ANY occur)
- V2a `pause()` tx fails or is not mined.
- `paused()=true` cannot be verified at `<V2A_PAUSE_BLOCK>`.
- Snapshot count ≠ V2a `memberCount` at the pause block.
- `validate-snapshot.mjs` does not print OK / any proof fails to replay.
- `EXPECT_*` dry-run reverts (guard or stale-mismatch).
- Final fork rehearsal fails (constant guard or full flow).
- Any V2b getter read-back mismatches (§14).
- Funding transfer skipped or under-sized: < 6,597,000 SYN actually delivered to `<V2B_ADDR>` (step 12/13). The source wallet `0x975a…ECec8` holds ~344.9M SYN, so this is an execution risk on the transfer step, not an availability problem.
- Frontend/indexer cutover plan not ready (blocks *public relaunch*, not the deploy).
- Any path by which the stale `deploy-params.json` could still be read (always pass `DEPLOY_PARAMS=…final.template.json`).

## G. Founder action required next
1. **Funding is available — no acquisition needed; nothing to stage before pausing.** The Membership Distribution wallet `0x975a…ECec8` holds **344,997,500 SYN** (~52× the recommended 7,000,000). Funding is a **post-deploy transfer** from that wallet (step 12), signed with `<DIST_SIGNER>` — *not* the deployer. The deployer EOA needs **AVAX for gas only** and never holds SYN. Confirm you control `<DIST_SIGNER>` and have AVAX in the deployer; that is the entire funding prerequisite.
2. **Provision an archive-node RPC** (`<ARCHIVE_RPC>`) for the pause-block fork rehearsal (step 9).
3. Then execute §A in order. The code-level guards (§B) are already in place; deploy is justified the moment gates 1–6 are green and funding is confirmed. **Do not switch the public site** until §15 conditions hold (relaunch phase).
