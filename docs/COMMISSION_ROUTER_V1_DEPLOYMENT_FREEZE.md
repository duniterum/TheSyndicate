# CommissionRouterV1 Deployment Freeze

Status: DEPLOYMENT DECISION PACKET / NOT DEPLOYED / NOT LIVE

This document freezes what must be true before `CommissionRouterV1` can move
from production-candidate code to a serious deployment decision. It does not
authorize deployment. It keeps the public product PENDING / REQUIRES CONTRACT
until a verified router address exists and the frontend is intentionally updated.

## 1. Deployment Parameter Checklist

All values must be recorded before deployment and independently read back after
deployment.

| Parameter | Required value / source | Why it matters |
| --- | --- | --- |
| USDC address | Avalanche native USDC: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | Router pays USDC commissions; wrong token means wrong money movement. |
| Sale V2 address | The active Membership Sale V2 contract from `src/lib/syndicate-config.ts` / contract registry | Only this source should be allow-listed for membership referral routing. |
| Operations wallet | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` unless governance changes it before freeze | Router forwards the Operations remainder here. Must equal Sale V2 `OPERATIONS()`. |
| Initial router owner | Deployer at constructor time | Owner can add/remove sources; signer risk is material. |
| Final owner | Hardware-wallet EOA or multisig, accepted through `Ownable2Step` | Prevents accidental ownership and reduces key risk. |
| sourceId | `keccak256("SALE_V2")` unless intentionally renamed and documented | Stamps `Attribution` events for indexers. |
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

## 3. Static-Analysis Plan

Saved reports exist:

- `contracts/audit/slither-report.txt`
- `contracts/audit/slither-report-14day.txt`

Local Windows status: `slither` is not installed in the current shell, so static
analysis was not rerun in this sprint.

Before deployment:

1. Install/run Slither against `contracts/`.
2. Run a second independent tool if available.
3. Record the exact tool versions.
4. Disposition every note in writing.
5. Block deployment on any unresolved high/medium issue.

Known notes from saved reports that need sign-off:

- `CommissionRouterV1.route` self-call / escrow reentrancy note.
- `SyndicateSaleV2` timestamp usage in timelocked admin paths.
- `CommissionRouterV1` not inheriting `ICommissionRouter` directly.
- uppercase immutable names.
- OpenZeppelin pragma / low-level-call informational notes.

## 4. Fork Rehearsal Plan

No private key or broadcast is required for the test-level rehearsal.

Command shape:

```bash
cd contracts
AVAX_RPC=<Avalanche archive/mainnet RPC> forge test --match-contract RehearsalForkV2b -vv --evm-version cancun
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
- read `sourceConfig(SaleV2)`
- read `tierFor`
- read `referredCount(address)` only as factual state
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

Go only if every item is green:

- Foundry unit/fuzz tests pass.
- Fork rehearsal passes against a reliable Avalanche RPC.
- Slither and second static-analysis pass have no unresolved high/medium issues.
- External line-by-line review is complete.
- Deployment parameters are frozen.
- Owner model is accepted.
- USDC, Sale V2, Operations wallet, and sourceId are independently verified.
- `sourceConfig` read-back plan is ready.
- Sale V2 router proposal/confirmation timing is understood.
- Legal/product copy is approved.
- Frontend Stage 1 read-only activation plan is approved.
- Rollback/disable runbook is written and rehearsed.

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
