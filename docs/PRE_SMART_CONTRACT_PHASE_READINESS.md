# Pre-Smart-Contract Phase Readiness

Status: LOCAL / GITHUB-READY PLANNING PACK

Purpose: separate what can be prepared now from what must stay pending until
contracts are reviewed, audited, deployed, verified, and wired into the app.

The product truth remains:

- SYN is the V1 membership seat.
- Archive1155 is the protocol memory contract.
- SeatRecord721 is future identity infrastructure.
- Referral is future growth attribution/commission infrastructure.
- No future system is live until the chain can prove it.

## Current Contract Reality

| System | Repository state | Public/product state | Next gate |
| --- | --- | --- | --- |
| Membership Sale V2 | Deployed and integrated as the active sale. | LIVE. SYN purchases seat the wallet. | Continue monitoring reads, wallet safety, and receipts. |
| Archive1155 | Deployed and integrated. ID 1 and ID 3 are live/read-gated according to contract truth. | LIVE memory layer. Artifacts are memories, not seats. | Keep ID 2 disabled; keep future IDs gated by live reads/events. |
| CommissionRouterV1 | Production-candidate Solidity and Foundry tests exist in `contracts/`. | PENDING / REQUIRES CONTRACT. No deployed router is wired live. | Review, audit, deploy, verify, register address, read-only UI, then write paths. |
| SeatRecord721 | Architecture decision exists; no Solidity contract exists in `contracts/src`. | RESERVED / FUTURE. SYN remains the seat. | Final spec, implementation, tests, audit, deployment, Holder Index reconciliation. |

## CommissionRouterV1 Readiness Boundary

`contracts/src/CommissionRouterV1.sol` is not a live product surface. It is a
candidate contract that can become live only after all of these are true:

1. Line-by-line Solidity review is complete.
2. Foundry tests pass in the isolated `contracts/` project.
3. Static analysis has no unresolved high/medium findings.
4. Deployment parameters are frozen.
5. Mainnet/fork rehearsal is complete.
6. Contract is deployed and source-verified.
7. `CONTRACT_REGISTRY` is updated from `PENDING` / `address: null` to the real address.
8. Frontend reads are wired before any write or claim path.
9. Public copy passes legal/product review.

Until then:

- no referral balance exists,
- no referral commission accrues,
- no claim action exists,
- no tier should be displayed as live,
- no route may imply Vault or Liquidity fund referrals.

Historical note: this CommissionRouterV1 boundary was superseded for V3 by
the SourceRegistryV1 + MembershipSaleV3 acquisition-first model. Do not use
this pre-V3 document as the current referral/source economics authority.

## SeatRecord721 Readiness Boundary

SeatRecord721 is not a profile, not a dashboard badge, and not the V1 seat.
It is reserved for a future identity record.

Before implementation:

1. Freeze the ERC-721 spec.
2. Confirm the Holder Index remains the identity source of record.
3. Define whether records are soulbound, transferable, or constrained.
4. Define mint authority and eligibility proof.
5. Define metadata permanence.
6. Define wallet-change / linked-wallet policy.
7. Write Foundry tests before any public UI claims eligibility.

Until then:

- SYN is the seat,
- the Holder Index is the live identity source,
- Archive1155 ID 2 remains a disabled pointer only,
- no SeatRecord721 address, claim, mint, balance, or eligibility may be implied.

## Safe Local Work While Replit Is Paused

Allowed now:

- contract review notes,
- Foundry test planning,
- registry entries with `PENDING` and `address: null`,
- docs that clarify deployment gates,
- product copy that says `RESERVED`, `PENDING`, or `REQUIRES CONTRACT`,
- read-model planning for post-deploy integration.

Must wait:

- production publish,
- Replit env setup,
- live QuickNode verification,
- public referral activation,
- SeatRecord721 UI activation,
- any claim or commission button.

## Next Recommended Phase

Start with `CommissionRouterV1` review readiness, not SeatRecord721.

Reason: CommissionRouterV1 already exists with tests and is closer to a
deployment decision. SeatRecord721 still needs a final contract spec, especially
around transferability, eligibility, Holder Index reconciliation, and metadata.

The safe order is:

1. CommissionRouterV1 review/audit checklist.
2. CommissionRouterV1 deployment parameter lock.
3. CommissionRouterV1 read-only frontend plan.
4. SeatRecord721 final spec.
5. SeatRecord721 implementation and tests.
