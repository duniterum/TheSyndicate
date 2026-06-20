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
| Membership Sale V2b | LIVE / ACTIVE / UNAUDITED EARLY | Current self-service membership sale. Routes USDC 70% Vault, 20% Liquidity, 10% Operations. External CommissionRouter is unset. |
| `SyndicateArchive1155` | LIVE | Protocol-memory ERC-1155. ID 1 is public-open; ID 3 is active/read-gated; ID 2 is a disabled pointer to future SeatRecord721. |
| `CommissionRouterV1` | CANDIDATE / NOT DEPLOYED / NOT LIVE | Future Operations-slice commission router. No address, no live referral, no claim UI. |
| `SeatRecord721` | FUTURE / NOT IMPLEMENTED / NOT DEPLOYED | Future identity record. SYN remains the V1 seat today. |

Hard rule: do not treat Solidity files in `contracts/src/` as deployed simply
because they exist. `CommissionRouterV1.sol` is a reviewed candidate only.

## What's Here

| Path | Role |
| --- | --- |
| `src/SyndicateSaleV2.sol` | Sale V2 source used for the active V2b membership sale: era table, caps, reserve floor, V1 recognition, 70/20/10 routing, and timelocked router wiring. |
| `src/CommissionRouterV1.sol` | Production-candidate referral router: Operations-slice-only, tier ladder, push/escrow, RAL `Attribution` event. Not deployed. |
| `test/SyndicateSaleV2.t.sol` | Sale tests covering constructor validation, buy path, era engine, caps, reserve, Merkle recognition, router glue, pause/recovery, and reentrancy fallback. |
| `test/CommissionRouterV1.t.sol` | Router tests covering source allow-list, ABI parity, Operations-slice conservation, tier ladder, push/escrow/claim, remove/re-add lifecycle, and event reconstruction. |
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

- Foundry: 76 passed, 0 failed, 2 skipped.
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
- final owner/final-owner model is decided,
- external review is complete,
- legal/product signoff is final.

## V2b Sale Topology

V2b is a fresh active sale contract, not an upgrade proxy. The frontend:

- writes new purchases to V2b,
- scans V1, V2a, and V2b for Holder Index continuity,
- treats V1 and V2a as sealed historical event sources,
- keeps CommissionRouter unset until a future deployment decision.

Sale V2b routes money in the buy transaction:

```text
buyer USDC -> Sale V2b
  70% -> Vault wallet
  20% -> Liquidity wallet
  10% -> Operations wallet
       or, only after future router activation:
       Operations slice -> CommissionRouterV1 -> referrer escrow/payout + Operations remainder
```

CommissionRouter can never receive Vault or Liquidity funds under the current
Sale V2 design.

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
