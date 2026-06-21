# The Syndicate - Contracts

Isolated Foundry project for the smart-contract layer of The Syndicate.

This folder contains both historical live-contract source/context and
production-candidate code that is not yet deployed. Deployment status must be
read from the frontend contract registry and the deployment-readiness docs, not
from file presence alone.

## Current Contract Truth

| Contract | Status | Role |
| --- | --- | --- |
| `SYN` ERC-20 | LIVE | Fixed-supply V1 membership seat token. No admin mint, no tax, no blacklist. |
| Membership Sale V1 | LIVE / SEALED HISTORICAL | Original sale. Paused/closed with no active inventory. Kept for proof and holder history. |
| Membership Sale V2a | LIVE / SEALED HISTORICAL | Superseded V2 sale. Scanned for seats #3-#5 and Holder Index continuity. Not the active buy target. |
| Membership Sale V2b | LIVE / PAUSED HISTORICAL | Paused on-chain. Retained for seats #6-#8, Holder Index continuity, and recovery boundary. Not the active buy target. |
| `SyndicateArchive1155` | LIVE | Protocol-memory ERC-1155. ID 1 is public-open; ID 3 is active/read-gated; ID 2 is a disabled pointer to future SeatRecord721. |
| `CommissionRouterV1` | CANDIDATE / NOT DEPLOYED / NOT LIVE | Future Operations-slice commission router. No address, no live referral, no claim UI. |
| `SourceRegistryV1` | DEPLOYED / NO SOURCE RECORDS / REFERRAL UI INACTIVE | V3 source-term registry. Stores source policy only; moves no money. No source records exist. |
| `MembershipSaleV3` | LIVE DIRECT-BUY TARGET / SOURCE UI INACTIVE | Funded V3 membership sale. Frontend approval/quote/buy target for zero-source public purchases. |
| `SeatRecord721` | FUTURE / NOT IMPLEMENTED / NOT DEPLOYED | Future identity record. SYN remains the V1 seat today. |

Hard rule: do not treat Solidity files in `contracts/src/` as deployed simply
because they exist. Current truth is explicit above: `MembershipSaleV3.sol` is
deployed and funded as the direct-buy target, `SourceRegistryV1.sol` is deployed
with no source records, and `CommissionRouterV1.sol` remains not deployed.
File presence never authorizes new source records, referral UI, or claim UI.

## What's Here

| Path | Role |
| --- | --- |
| `src/SyndicateSaleV2.sol` | Sale V2 source used for historical V2a/V2b deployments: era table, caps, reserve floor, V1 recognition, 70/20/10 routing, and timelocked router wiring. |
| `src/CommissionRouterV1.sol` | Production-candidate referral router: Operations-slice-only, tier ladder, push/escrow, RAL `Attribution` event. Not deployed. |
| `src/SourceRegistryV1.sol` | Deployed V3 source-term registry: source class, commission bps, caps, windows, payout wallet, status, and visible policy events. No source records exist. |
| `src/MembershipSaleV3.sol` | Deployed and funded V3 sale engine: deterministic era pricing, acquisition-first routing, source validation, payout escrow fallback, and rich receipt event. Current frontend buy target with zero sourceId. |
| `test/SyndicateSaleV2.t.sol` | Sale tests covering constructor validation, buy path, era engine, caps, reserve, Merkle recognition, router glue, pause/recovery, and reentrancy fallback. |
| `test/CommissionRouterV1.t.sol` | Router tests covering source allow-list, ABI parity, Operations-slice conservation, tier ladder, push/escrow/claim, remove/re-add lifecycle, and event reconstruction. |
| `test/SourceRegistryV1.t.sol` | V3 registry tests covering source creation, term updates, caps, windows, status, wallet recovery, and source validation. |
| `test/MembershipSaleV3.t.sol` | V3 sale tests covering acquisition-first conservation, source caps, payout escrow, smart-wallet payouts, member numbering, and receipt reconstruction. |
| `test/RehearsalForkV2b.t.sol` | Fork rehearsal for the V2b sale topology. Requires `AVAX_RPC`; no broadcast. |
| `test/mocks/` | Mock ERC-20, blocklist simulation, source mock, reverting/reentrant router mocks. |
| `script/Deploy.s.sol` | Sale V2 deployment script. Forces `initialRouter = address(0)`. Not used for CommissionRouter deployment. |
| `script/deploy-params*.json` | Historical/current sale deployment parameter records and templates. |
| `audit/slither-report.txt` | Prior static-analysis artifact. |
| `audit/slither-report-14day.txt` | Current saved Slither artifact after 14-day timelock parameter lock. |
| `tools/` | V1/V2 member snapshot and Merkle-root tools. |

## Toolchain

- solc `0.8.24` pinned.
- EVM `paris` in `foundry.toml` unless a rehearsal explicitly overrides it.
- Optimizer on, `runs = 200`, `via_ir = true`.
- OpenZeppelin Contracts v5.1.0 vendored under `lib/openzeppelin-contracts/`.
- forge-std vendored under `lib/forge-std/`.

## Build And Test

From this directory:

```bash
forge build
forge test
forge test --gas-report
forge test --match-contract SyndicateSaleV2Test -vvv
```

Latest validated result in this workspace lineage:

- Foundry: 111 passed, 0 failed, 2 skipped after V3 QA hardening.
- Frontend/release guards are run from the repository root with
  `npm run check-release`.

## Static Analysis

Saved reports:

- `audit/slither-report.txt`
- `audit/slither-report-14day.txt`

Fresh static analysis is still a blocker before CommissionRouter deployment.

Command shape once Slither is available:

```bash
cd contracts
slither . --exclude-dependencies
```

CommissionRouter deployment remains blocked until:

- fresh Slither is green or dispositioned,
- a second static-analysis tool is green or dispositioned,
- fork rehearsal is green with a reliable Avalanche RPC,
- owner/final-owner model is frozen for the specific deployment,
- external review is complete,
- legal/product signoff is final.

V3 source/referral activation remains blocked until:

- `docs/V3_SMART_CONTRACT_QA_READINESS.md` blockers are resolved,
- `docs/V3_DEPLOYMENT_READINESS_PACKAGE.md` is followed,
- fresh Slither is green or dispositioned,
- a second static-analysis tool is green or dispositioned,
- V3 fork rehearsal remains documented green against Avalanche RPC after patches,
- hardware-wallet deployment and owner addresses are recorded and tested,
- Ownable2Step ownership transfer/acceptance is rehearsed and read back,
- external review is complete,
- legal/product signoff is final,
- source-record policy, referral UI, claim UI, and activation sequence are approved.

## V2b Sale Topology

V2b is a paused historical sale contract, not an upgrade proxy. The frontend:

- writes new direct purchases to MembershipSaleV3 with zero sourceId,
- scans V1, V2a, and V2b for Holder Index continuity,
- treats V1 and V2a as sealed historical event sources,
- keeps CommissionRouter unset until a future deployment decision.

MembershipSaleV3 routes money in the direct-buy transaction:

```text
buyer USDC -> MembershipSaleV3
  70% -> Vault wallet
  20% -> Liquidity wallet
  10% -> Operations wallet
       or, only after future router activation:
       Operations slice -> CommissionRouterV1 -> referrer escrow/payout + Operations remainder
```

CommissionRouter can never receive Vault or Liquidity funds under the current
Sale V3 direct-buy design.

## CommissionRouterV1 Deployment Boundary

`CommissionRouterV1` is review/audit-prep ready but not deployment-ready.

Do not:

- deploy the router,
- add a router address,
- activate referral,
- add claim UI,
- add referral write UI,
- imply rewards/yield/passive income,
- describe a flat 5% commission unless Solidity changes to implement it.

Use these docs before any deployment decision:

- `docs/COMMISSION_ROUTER_V1_REVIEW_READINESS.md`
- `docs/COMMISSION_ROUTER_V1_DEPLOYMENT_FREEZE.md`
- `docs/COMMISSION_ROUTER_V1_REMIX_DEPLOYMENT_READINESS.md`

Preferred future signing path: Remix IDE + MetaMask. Foundry remains the
compile/test/fork/readback preparation tool unless the founder explicitly
approves a Foundry broadcast path.

## SeatRecord721 Boundary

No SeatRecord721 Solidity exists today. Do not add it casually.

Binding doctrine:

- SYN is the V1 seat.
- Archive1155 artifacts are protocol memory, not seats.
- SeatRecord721 is reserved for a future identity record.
- Archive1155 ID 2 is a disabled pointer only.

Spec freeze:

- `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`

## Source Of Truth

Contract status and public truth are locked across:

- `src/lib/contract-registry.ts`
- `src/lib/syndicate-config.ts`
- `src/lib/archive-id-registry.ts`
- `docs/SMART_CONTRACT_SYSTEM_MAP.md`
- `docs/COMMISSION_ROUTER_V1_DEPLOYMENT_FREEZE.md`
- `docs/SEAT_RECORD_ARCHITECTURE_DECISION.md`

If these disagree, stop and reconcile before implementation or deployment.

