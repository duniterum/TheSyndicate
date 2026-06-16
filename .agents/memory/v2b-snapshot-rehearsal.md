---
name: V2b snapshot + parameter rehearsal
description: V2b replaces live unaudited V2a — merged-snapshot identity rule, the live V2a $5 Genesis-cap defect, the executed forked-mainnet rehearsal recipe (cancun REQUIRED + runs=1), and the SYN funding gap.
---

# V2b snapshot + parameter rehearsal

V2b is the parameter-corrected sale that **replaces the live, unaudited V2a**
(`0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48`). V1 = `0x0020Df30…5842d`.

## Merged-snapshot identity rule (irreversible gate)
**Any V2b snapshot MUST union V1 `TokensPurchased` ∪ V2a `Purchased`**, sort by
`(blockNumber, logIndex)`, dedupe first-seen, number `1..N` — i.e. mirror
`src/lib/activity-hooks.ts` `useLivePurchaseEvents` exactly.
**Why:** reusing V2a's own deploy artifact (offset=2, V1-**only** root from the V1 pause block)
would fail to recognize the 3 V2a members → V2b would **re-issue them seats** = duplicate
identity, the one irreversible mistake.
**How to apply:** the exporter (`contracts/tools/export-members-merged.mjs`) must **fail loud**
before emitting — distinct count == on-chain V2a `memberCount` at the SAME block, every V2a
`firstSeat=true` number == derived first-seen number, every `firstSeat=false` has a strictly
earlier first-seen. Identity comes from `Purchased`; the frontend's extra `Purchased⋈Routed`
join is money-split only, NOT identity (safe to omit in the exporter).

## Live V2a $5 Genesis-cap defect
Live V2a shipped with `addrCaps[0] = $5` (Era I / Genesis per-address cap) — a **defect**: it
blocks every high-conviction Genesis buy (the $10k = 1,000,000 SYN package can't clear a $5 cap).
V2b fixes it to **$25,000** (= `maxUsdcPerTx`, so one address can take a full high-conviction
seat in one tx). The V2b rehearsal params differ from canonical `deploy-params.json` by **exactly
3 fields** (`addrCaps[0]`, `genesisOffset`, `v1MemberRoot`) **+ the `provisional` flag** —
everything else byte-identical.

## Fork rehearsal EXECUTED — in-container recipe (cancun REQUIRED + runs=1)
`RehearsalForkV2b.t.sol` now runs **green in this container** (1 passed/0 failed). Recipe:
```
cd contracts
FOUNDRY_OPTIMIZER_RUNS=1 forge build --evm-version cancun        # ~67s warm
AVAX_RPC="https://avalanche-c-chain-rpc.publicnode.com" \
  FOUNDRY_OPTIMIZER_RUNS=1 forge test --match-contract RehearsalForkV2b -vv --evm-version cancun
```
- **`--evm-version cancun` is REQUIRED, not optional** (corrects the earlier note): under `paris`
  the forked **SYN** token bytecode (PUSH0) reverts `EvmError: NotActivated` on the first
  `balanceOf`. Constructor read-backs pass under paris; execution against the real tokens does not.
- **`FOUNDRY_OPTIMIZER_RUNS=1` dodges the cgroup OOM:** the cold cancun via_ir compile at the
  production `runs=200` is OOM-killed (no error/marker — same ceiling as vite build). `runs=1`
  compiles (~67s) with identical runtime semantics. This is a **behavior** rehearsal, **NOT**
  production-bytecode equivalence (production stays `paris`/`runs=200`).
- The fork samples **one V1 + one V2a proof**; "all 5 preserved" rests on `offset=5` read-back
  (`memberCount==5`) + the offline merged-snapshot validation, not an on-fork replay of all five.

## Deploy.s.sol param-path footgun — FIXED (but EXPECT_* is opt-in)
`Deploy.s.sol` no longer hardcodes `vm.readFile("script/deploy-params.json")`. It reads an explicit
`DEPLOY_PARAMS` path (default unchanged), **logs the path it loaded**, and a double-entry
`EXPECT_GENESIS_OFFSET`/`EXPECT_V1_ROOT` guard **reverts** on a stale/mismatched file
(`genesisOffset != EXPECT_GENESIS_OFFSET (stale snapshot?)`); `fs_permissions` now reads `./script`.
**Gotcha:** the guard only fires if the operator SETS `EXPECT_*` — so treat both as **mandatory**
deploy gates; that human-discipline step is the only residual. Proven by 3 `forge script` dry-runs
(happy path → SIMULATION COMPLETE; wrong EXPECT → revert; default stale file + EXPECT=5 → revert).
`provisional=true` still fail-closes unless `ALLOW_PROVISIONAL_DEPLOY=1`.

## SYN funding gap (carry-over deploy blocker)
`buy()` gates on `_reserveSyn` (each remaining reservable seat #m+1..10000 at its own era min):
`_reserveSyn(5)=4,097,500 SYN` (deploy floor), `_reserveSyn(6)=4,097,000`. A fresh **$10k** Genesis
buy needs **≥ 5,097,000 SYN** (1,000,000 + reserve); a full **$25k** buy needs **≥ 6,597,000 SYN**.
V2a holds only **4,998,500 SYN** → a like-for-like balance transfer to V2b **cannot** honor even one
$10k package (only ≈ $9,015 sellable above the floor). **V2b MUST be funded ABOVE the V2a balance**
before opening; the constructor pulls no SYN (fork test `deal`s 50M to sidestep this).
**The "gap vs V2a balance" is INFORMATIONAL, not a transfer plan:** V2b starts at 0 SYN and cannot
draw on V2a; V2a SYN moves only via `recoverUnsoldSyn()` (requires *concluded* OR *paused ≥ 14d*
`RECOVERY_TIMELOCK`) and it sends to the **Vault**, never to V2b. So day-one V2b funding is
**externally sourced**; recovered V2a SYN is a later, timelocked top-up at best.

## Final-deploy caveat
The rehearsal snapshot is pinned to the **rolling head** (`snapshotBlock` = current). The FINAL
(deploy) snapshot MUST be re-run pinned to the real **V2a pause block** — `genesisOffset` and root
change if any V2a purchase lands before pause. Today's values are a rehearsal, not a deploy artifact.

## Finalization tooling footguns (cost 2 architect FAILs)
- **`gen-v1-root.mjs` ALWAYS writes `v1-merkle.json`** (hardcoded, no output arg) even when fed the
  MERGED `members-merged.json`. The distinctly-named `v2b-merkle.json` only exists via an explicit
  `cp v1-merkle.json v2b-merkle.json`. **All three tools write relative to CWD** → run export/gen/
  validate from **`contracts/tools/`** (one cwd) or `cp` copies a stale artifact. `validate-snapshot.mjs`
  args = `[members.json] [merkle.json] [expectedRoot]`; it's the ONLY thing that replays EVERY proof.
- **`RehearsalForkV2b.t.sol` HARDCODES `ROOT`/offset(next-seat #6)/`_proofM1`/`_proofM3`** — re-running
  the same `forge test` after pause validates the STALE rehearsal root, NOT the final params. The final
  rehearsal needs those constants repointed (or the test parameterized) first.
- The fork test deploys a **fresh V2b in isolation (no V1/V2a touch)** → it does **NOT** assert "old V2a
  sealed". Verify that operationally by reading live `paused()==true` on the V2a address after the pause;
  don't claim the fork covers it.

## Deploy-guard hardening + funding (the decision, not the diff)
- **Deploy.s.sol `EXPECT_*` is now MANDATORY when `provisional==false`** (real deploy reverts unless BOTH
  `EXPECT_GENESIS_OFFSET` and `EXPECT_V1_ROOT` are set). Provisional rehearsals (`ALLOW_PROVISIONAL_DEPLOY=1`)
  stay exempt → fork flow unchanged. **Why safe:** NO test invokes `Deploy.run()` (both rehearsal tests do
  `new SyndicateSaleV2(...)` directly) and NO CI/script runs `forge script Deploy` — so nothing automated breaks.
- **RehearsalForkV2b has a fork-free fail-closed cross-check** (`test_rehearsalConstantsMatchDeployParams`):
  asserts the test's `ROOT`/`GENESIS_OFFSET`/`addrCaps[0]` == the `DEPLOY_PARAMS` file, so the rehearsal can't
  pass against stale constants after re-pinning. Chosen OVER full JSON-proof parameterization (parsing
  `bytes32[][]` in Solidity adds harness-bug risk that could MASK a real failure — higher risk pre-deploy).
- **Scope ruling (NO BROADENING):** rejected the architect's optional extra guard (reject default
  `DEPLOY_PARAMS` path for non-provisional). It's a NEW guard, not a hardening of the existing one; mandatory
  `EXPECT_*` already makes a stale deploy loud not silent. Residual: guard can't prove the operator's EXPECT_*
  values ARE the pause-block snapshot — only that the file matches them; closed procedurally by the checklist.
- **Funding reality:** deployer/owner EOA `0xa2E538…26e2F` held **0 SYN** (block 88,179,800, 2026-06-16) →
  funding is a HARD prerequisite; STAGE INDEPENDENTLY before pausing. **V2a SYN is NOT a funding source**
  (recoverUnsoldSyn = timelock→Vault, AND its ~4.998M < the 6.597M floor anyway). Rate 100 SYN/$; through-seat
  reserve (RESERVE_THROUGH_SEAT=10,000) ≈ **4.097M SYN** at offset=5 (recompute after finalize). One $10k buy
  needs ≈5.097M; one $25k buy needs ≈6.597M; **recommend ≥6.597M (round 7M)**. Smoke = fund FULLY first, THEN
  one $5 real buy (an underfunded contract can revert the reserve check even on $5 → false "broken" signal).
- Full executable pause→deploy chain lives in `docs/audits/V2B_FINAL_EXECUTION_CHAIN.md` (16 steps + stop conds).
