# CommissionRouterV1 Deployment Freeze

Status: AUDIT-READINESS FREEZE / NOT DEPLOYED / NOT LIVE

This document freezes what must be true before `CommissionRouterV1` can move
from production-candidate code to a serious deployment decision. It does not
authorize deployment. It keeps the public product PENDING / REQUIRES CONTRACT
until a verified router address exists and the frontend is intentionally updated.

Current sprint result:

- Contract code remains unchanged.
- Referral remains PENDING / REQUIRES CONTRACT in public product surfaces.
- No router address is configured.
- No referral write UI or claim UI is authorized.
- Static analysis and fork rehearsal are not green yet because local tooling /
  RPC inputs are missing.

Canonical local readiness command:

```bash
npm run check-commission-router-freeze
```

The command is separate from `npm run check-release` because this pre-deployment
gate is expected to report `BLOCKED` until the external review, Slither, fork
RPC, owner, and legal/product signoff gates are all satisfied. A blocked result
means "do not deploy yet"; it does not mean the public product release is broken.

Preferred future signing path: Remix IDE + MetaMask. The beginner-safe operator
guide lives in `docs/COMMISSION_ROUTER_V1_REMIX_DEPLOYMENT_READINESS.md`.
Foundry remains the test/fork/compile/readback preparation tool unless the
founder explicitly approves a Foundry broadcast path later.

## 1. Deployment Parameter Checklist

All values must be recorded before deployment and independently read back after
deployment.

| Parameter | Required value / source | Why it matters |
| --- | --- | --- |
| USDC address | Avalanche native USDC: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | Router pays USDC commissions; wrong token means wrong money movement. |
| Sale V2 address | Active V2b: `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` from `src/lib/syndicate-config.ts` / contract registry | Only this source should be allow-listed for membership referral routing. |
| Operations wallet | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` unless governance changes it before freeze | Router forwards the Operations remainder here. Must equal Sale V2 `OPERATIONS()`. |
| Initial router owner | FOUNDER DECISION REQUIRED: deployment signer at constructor time | Owner can add/remove sources; signer risk is material. |
| Final owner | FOUNDER DECISION REQUIRED: hardware-wallet EOA minimum; multisig preferred before public activation | Prevents accidental ownership and reduces key risk. |
| sourceId | `keccak256("SALE_V2")` = `0xccfff1a00e76bfae657a6db2e63f47caf7640d4f57c704fd04a5112e530caae5` unless intentionally renamed and documented | Stamps `Attribution` events for indexers. |
| Router approval | Sale V2 must approve the router to pull the Operations slice after the sale router is confirmed | Router uses `transferFrom(msg.sender, address(this), opsSlice)`. |
| Allow-listed source config | `sourceConfig(SaleV2).enabled == true`, sourceId matches, operationsWallet matches Sale V2 `OPERATIONS()` | Prevents unauthorized callers and wrong Operations destination. |

Hard rule: do not update the frontend registry with a router address until the
deployed bytecode, verified source, owner, source config, and Sale V2 router
wiring have all been read back.

## 2. Owner Model Recommendation

Options:

- Founder/admin EOA: simplest, but highest key-risk.
- Hardware wallet EOA: still single signer, but materially safer for launch.
- Multisig: best control model, but requires signer setup and operational discipline.

Recommendation for this stage:

Use a hardware-wallet EOA at minimum. Prefer a multisig before broad public
referral activation. A plain hot MetaMask EOA should be treated as a temporary
review/rehearsal owner only.

Owner authority is bounded: owner cannot alter Vault/Liquidity percentages and
cannot touch referral escrow directly. But owner can add/remove source trust, so
compromise could affect referral routing until disabled.

Later operational steps:

1. Decide the final owner address before deployment.
2. Deploy from the initial owner only if that key is controlled and recorded.
3. If final owner differs, call `transferOwnership(finalOwner)`.
4. Accept ownership from the final owner using `Ownable2Step`.
5. Read back `owner()` before adding the Sale V2 source.
6. Do not activate public referral surfaces until ownership is final.

## 3. Static-Analysis Plan

Saved reports exist:

- `contracts/audit/slither-report.txt`
- `contracts/audit/slither-report-14day.txt`

Local Windows status: `slither --version` fails with "slither is not recognized",
so static analysis was not rerun in this sprint.

Exact command to rerun once Slither is available:

```bash
cd contracts
slither . --exclude-dependencies
```

Before deployment:

1. Install/run Slither against `contracts/`.
2. Run a second independent tool if available.
3. Record the exact tool versions.
4. Disposition every note in writing.
5. Block deployment on any unresolved high/medium issue.

Saved-report disposition table:

| Finding | Location / meaning | Current disposition | Deployment impact |
| --- | --- | --- | --- |
| `incorrect-equality` | `SyndicateSaleV2._send` checks `amount == 0` before skipping a zero transfer | Accepted if reviewer agrees this is a zero-amount guard, not value logic | Auditor sign-off required |
| `uninitialized-local` | `CommissionRouterV1.route` reports local `tier`; invalid/no-referral path intentionally emits tier `0` | Accepted only after auditor verifies event semantics cannot mislead indexers | Auditor sign-off required |
| `missing-zero-check` | OpenZeppelin `Ownable2Step.transferOwnership` pending owner assignment | Library note; operational guard is to never transfer to zero and always read back owner | Informational unless auditor disagrees |
| `reentrancy-benign` | `CommissionRouterV1.route` wraps `this.pushReferral` and escrows on failed push | Existing tests cover push/escrow; reviewer must verify self-call plus `nonReentrant` is safe | Auditor sign-off required |
| `timestamp` | Sale V2 router timelock and unsold-SYN recovery use `block.timestamp` | Accepted because these are admin timelock gates, not price/randomness | Auditor sign-off required |
| `assembly` | OpenZeppelin `SafeERC20`, `Address`, and hashes use assembly | Library implementation detail | Informational |
| `pragma` | Project pins `0.8.24`; OpenZeppelin imports use `^0.8.20` | Expected dependency range; actual compile target must be recorded | Informational unless tool reports compiler mismatch |
| `cyclomatic-complexity` | `SyndicateSaleV2.buy` complexity | Covered by Sale V2 tests; not changed by router deployment | Informational / review focus |
| `solc-version` | OpenZeppelin pragma range includes versions with known issues | Actual compiler is pinned by Foundry config; record exact compiler in audit packet | Informational if compiler remains `0.8.24` |
| `low-level-calls` | OpenZeppelin `Address` library low-level helpers | Library implementation detail | Informational |
| `missing-inheritance` | `CommissionRouterV1` does not inherit Sale V2's local `ICommissionRouter` | Intentional decoupling; ABI parity tests cover the struct/call shape | Auditor sign-off required |
| `naming-convention` | uppercase immutable/constant-style names | Intentional public immutables/constants readability | Informational |
| `unindexed-event-address` | OpenZeppelin `Paused/Unpaused` address params | Library event shape | Informational |

Current static-analysis status: NOT GREEN. The saved report is dispositioned,
but a fresh Slither run and second-tool pass are still blockers before
deployment.

## 4. Fork Rehearsal Plan

No private key or broadcast is required for the test-level rehearsal.

Local status: `AVAX_RPC` and `VITE_AVALANCHE_RPC_URL` are both unset in the
current shell, so the fork rehearsal cannot run locally yet.

Command shape:

```bash
cd contracts
AVAX_RPC=<Avalanche archive/mainnet RPC> forge test --match-contract RehearsalForkV2b -vv --evm-version cancun
```

PowerShell shape:

```powershell
$env:AVAX_RPC="<Avalanche HTTPS RPC>"
& $env:USERPROFILE\.foundry\bin\forge.exe test --match-contract RehearsalForkV2b -vv --evm-version cancun
```

Optional pin:

```bash
AVAX_RPC=<rpc> AVAX_FORK_BLOCK=<block> forge test --match-contract RehearsalForkV2b -vv --evm-version cancun
```

What it proves:

- fork access works against Avalanche C-Chain
- deployment parameters and rehearsal constants match
- existing member snapshot behavior is preserved
- Sale V2 remains no-referral / router-unset during rehearsal
- no duplicate seats are introduced

What it does not prove yet:

- router deployment transaction success
- Sale V2 `proposeCommissionRouter` / `confirmCommissionRouter` on a live deployed router
- `addSource` on the deployed router with the live Sale V2 address
- real post-deploy explorer verification
- escrow claim UX

Inputs needed:

- reliable Avalanche RPC, ideally archive-capable
- final Sale V2 address
- final Operations wallet
- final owner address
- intended fork block, if pinning

No broadcast, no deploy private key, and no live transaction should be used in
this rehearsal step.

Current fork-rehearsal status: NOT GREEN. It must be run after a reliable
Avalanche HTTPS RPC is available locally. Do not use a WSS endpoint for this
Foundry fork test.

## 5. Frontend Activation Sequence

Referral must activate in stages.

### Stage 0 - Current State

- `COMMISSION_ROUTER_V1` stays `PENDING`.
- `/referral` stays noindex / read-only.
- no claim UI
- no router address
- no live tier balances
- no live referral-at-buy path

### Stage 1 - Verified Deployment Read-Only

After deployment and read-back only:

- update contract registry with the verified router address
- show `DEPLOYED` or equivalent read-only status, not a claim surface
- expose explorer link
- read `sourceConfig(SaleV2)` and verify `(enabled, sourceId, operationsWallet)`
- read `tierFor(count)` for documented tier previews
- read `referredCount(address)` only as factual state
- read `referralOwed(address)` only after deployment; do not show a claim button
  until a later claim UX pass is approved
- keep write paths gated

### Stage 2 - Referral During Join

Only after legal/product approval:

- allow a buyer to review/confirm a referrer before buying
- show that commission comes only from Operations
- show that Vault and Liquidity are untouched
- never promise future income
- keep wallet signing explicit

### Stage 3 - Escrow Claim UI

Only after real escrow reads and QA:

- show `referralOwed(address)` from the router
- provide claim only when owed is greater than zero
- label as USDC Operations-slice commission
- include explorer proof and failure states

## 6. Product / Legal Copy Freeze

Approved language:

- verified introduction
- growth attribution
- Operations-slice commission
- paid only if a verified router is deployed and wired live
- Vault and Liquidity are never touched
- future lineage / Builder Record input

Forbidden language:

- reward dashboard
- passive income
- yield
- ROI
- guaranteed payout
- cashback
- downline
- claim now
- earn now
- flat 5% commission, unless the Solidity is changed to implement flat 5%

Public copy must never imply a balance, entitlement, or claim before the router
address is verified and live reads prove the state.

## 7. Rollback / Disable Plan

The router architecture supports downgrade.

Immediate controls:

- router owner can `removeSource(SaleV2)` so `route` reverts for that source
- Sale V2 catches router failure and routes the full Operations slice to Operations
- Sale V2 owner can `disableCommissionRouter()` to clear router wiring and allowance
- frontend can downgrade `COMMISSION_ROUTER_V1` to PENDING / REQUIRES CONTRACT

Expected user-facing fallback:

- buys continue
- Vault still receives 70%
- Liquidity still receives 20%
- Operations receives the full 10%
- no referral commission accrues while disabled

Rollback requirement:

Before activation, rehearse disable behavior and confirm the frontend can return
to pending copy without showing stale claims or balances.

## 8. Final Go / No-Go Checklist

Current decision status:

| Gate | Status | Notes |
| --- | --- | --- |
| Foundry unit/fuzz tests | GREEN | Latest known result: 76 passed, 0 failed, 2 skipped. |
| Frontend/release guards | GREEN | Latest known release gate passed. |
| Saved Slither report reviewed | PARTIAL | Findings dispositioned here, but not freshly rerun. |
| Fresh Slither run | BLOCKED | `slither` is not installed in the current shell. |
| Second static-analysis tool | BLOCKED | Tool not selected/run yet. |
| Fork rehearsal | BLOCKED | No local `AVAX_RPC` / `VITE_AVALANCHE_RPC_URL` is set. |
| External line-by-line review | BLOCKED | Not performed yet. |
| Deployment parameters | PARTIAL | USDC, Sale V2, Operations, sourceId verified; owner/final owner still pending. |
| Owner model | FOUNDER DECISION | Hardware wallet minimum; multisig preferred before public activation. |
| Legal/product copy | PARTIAL | Copy constraints frozen; final sign-off still required. |
| Frontend Stage 1 plan | READY | Read-only activation path documented; no write UI. |
| Rollback/disable plan | READY | Remove source, disable Sale V2 router, downgrade frontend to pending. |

Go only if every blocked/partial/founder-decision row above is resolved.

No-go if any item is true:

- owner key model is unresolved
- Operations wallet equality is not verified
- static-analysis notes are undispositioned
- fork rehearsal cannot run
- frontend would show live claims before live reads
- copy implies yield, rewards, passive income, MLM, or flat 5%
- any router address is unverified

Current conclusion: review/audit preparation may continue. Deployment should not
begin yet.
