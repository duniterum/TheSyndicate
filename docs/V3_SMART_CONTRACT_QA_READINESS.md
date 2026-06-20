# V3 Smart Contract QA Readiness

Status: QA PASS FOR LOCAL CANDIDATE / NOT AUDIT-READY / NOT DEPLOYMENT-READY

This document records the focused QA pass for the V3 candidate contracts:

- `contracts/src/SourceRegistryV1.sol`
- `contracts/src/MembershipSaleV3.sol`

Nothing in this document deploys, activates, registers, or frontend-wires V3.
V2b remains the live buy path until a future deployment, verification, funding,
registry update, and product activation pass is explicitly approved.

## QA Scope

Reviewed areas:

- `SourceRegistryV1` source-term lifecycle and validation,
- `MembershipSaleV3` acquisition-first buy path,
- escrow/claim safety for source payouts,
- source cap and per-buyer cap math,
- rounding and USDC conservation,
- reentrancy exposure,
- smart-wallet payout compatibility,
- pause/admin powers,
- receipt/event completeness,
- `memberNumber` and `firstSeat` correctness,
- V2b migration posture,
- static-analysis availability,
- fork rehearsal readiness.

## Current Candidate Architecture

`SourceRegistryV1` stores explicit source policy terms. It does not move funds,
mint SYN, count seats, or activate referral UI.

`MembershipSaleV3` consumes source terms and performs the acquisition-first sale:

```text
gross USDC
  -> acquisition cost, if a valid source exists
  -> protocol contribution
  -> 70% Vault / 20% Liquidity / 10% Operations
  -> SYN delivered at deterministic era pricing
  -> reconstructable V3 receipt event
```

SYN remains the V1 seat. Seat identity is binary; contribution depth is
variable. V3 does not deploy SeatRecord721 and does not modify Archive1155.

## Invariant Coverage Added

The V3 candidate test suite now covers:

- no-source purchase routes the full gross amount through 70 / 20 / 10,
- source purchase applies acquisition-first routing before 70 / 20 / 10,
- fuzzed conservation across gross USDC and commission bps,
- deterministic rounding where Operations receives the residual protocol split,
- exact source gross-cap boundary behavior,
- linked source cap stops automatic commission without blocking repeat purchase,
- explicit capped source rejects instead of silently changing user intent,
- blocked payout wallet escrows acquisition cost without blocking the buy,
- escrowed source payout remains conserved in Sale V3,
- escrow claim uses the registry's current payout wallet,
- smart-contract payout wallets receive direct ERC-20 transfers without escrow,
- receipt event reconstructs gross, acquisition cost, protocol contribution,
  Vault, Liquidity, Operations, SYN, era, chapter, source, rate, cap/window state,
  first-seat state, and receipt version.

## Payout Safety Review

Direct source payout is intentionally push-first but not purchase-critical.

Behavior:

1. Sale V3 pulls gross USDC from the buyer.
2. Sale V3 attempts to push acquisition cost to the source payout wallet.
3. If the token transfer succeeds, no escrow remains.
4. If the token transfer reverts, Sale V3 records:
   - `sourceEscrowOwed[sourceId] += amount`
   - `totalAcquisitionEscrowed += amount`
   - `SourcePayoutEscrowed(sourceId, payoutWallet, amount)`
5. The buy continues and routes Vault/Liquidity/Operations/SYN.
6. Anyone may later call `claimSourceEscrow(sourceId)`.
7. Claimed funds always go to the current payout wallet in `SourceRegistryV1`.

This means:

- a blocked payout wallet cannot grief normal purchases,
- a smart-contract payout wallet works if it can receive ERC-20 balances,
- payout recovery after compromise can happen through visible registry action,
- the sale contract may hold USDC only as acquisition escrow,
- receipt accounting remains reconstructable because acquisition cost is still
  emitted in the purchase receipt and escrow mode is emitted separately.

Remaining deployment-review note: escrow claims can still revert while the
current payout wallet remains blocked. That is acceptable because it does not
block buys, but operations must update the payout wallet before claiming.

## Source Cap Math

`SourceRegistryV1.attributionTerms` receives projected totals after the current
purchase. Caps are inclusive at the exact cap and ineligible above cap:

- `projectedSourceGross > grossCap` rejects,
- `projectedBuyerGross > perBuyerCap` rejects.

Sale V3 behavior differs by user intent:

- explicit source over cap reverts,
- auto-linked source over cap pays zero commission and lets the purchase proceed.

This preserves buyer intent while preventing a stale linked source from blocking
return purchases.

## Rounding Dust

Acquisition cost is integer USDC-unit math:

```text
acquisitionCost = grossUsdc * commissionBps / 10_000
protocolContribution = grossUsdc - acquisitionCost
vaultAmount = protocolContribution * 70 / 100
liquidityAmount = protocolContribution * 20 / 100
operationsAmount = protocolContribution - vaultAmount - liquidityAmount
```

Operations receives the deterministic residual from protocol split rounding.
The invariant is:

```text
acquisitionCost + vaultAmount + liquidityAmount + operationsAmount == grossUsdc
```

## Reentrancy Review

`MembershipSaleV3.buy` and `claimSourceEscrow` are `nonReentrant`.

The source payout fallback uses `this.pushSourcePayout(...)` so token-level
transfer failures can be caught and escrowed. `pushSourcePayout` is callable only
by `address(this)`.

Current risk assessment:

- Standard ERC-20 transfers do not invoke payout-wallet code.
- Smart-contract payout wallets are compatible.
- Malicious ERC-20 behavior is out of scope for Avalanche USDC but should remain
  part of audit review.
- USDC and SYN are protected from owner rescue.

## Pause And Admin Powers

`SourceRegistryV1` owner powers:

- create source,
- update source terms,
- update source wallet,
- update payout wallet,
- set source status ACTIVE / PAUSED / REVOKED.

All source policy actions emit events.

`MembershipSaleV3` owner powers:

- pause/unpause,
- recover unsold SYN after conclusion or timelocked wind-down,
- rescue non-USDC/non-SYN tokens.

Founder decision update: V3 preparation now uses a hardware-wallet-first owner
model. The operational package is `docs/V3_DEPLOYMENT_READINESS_PACKAGE.md`.
Deployment remains blocked until the exact deployment hardware-wallet address,
owner hardware-wallet address, ownership transfer/acceptance flow, and readback
log are frozen. Safe/multisig/timelock remain future control-evolution stages,
not the current execution blocker.

## Event Completeness

`MembershipPurchasedV3` is rich enough for:

- receipt reconstruction,
- Activity,
- Register,
- Chronicle candidates,
- Archive candidates,
- My Syndicate,
- future notifications.

Companion events cover:

- source attribution linked,
- source payout escrowed,
- source payout claimed,
- era advanced,
- V1 membership recognized.

Known readiness note: `SourceAttributionExpired` exists but is not emitted by
current Sale V3. Expiry is currently a read-time condition. If the product later
needs explicit expiry notifications, an indexer or maintenance transaction can
emit/record that transition.

## Member Number And First Seat

Sale V3 preserves the seat doctrine:

- first purchase for a new recipient assigns the next member number,
- repeat contribution does not create a second seat,
- payer and recipient can differ,
- SYN is delivered to the recipient,
- `firstSeat` is emitted in the receipt,
- V1 proof recognition can mark a historical member without issuing a new seat.

## V2b Migration Posture

V3 is a fresh candidate, not an upgrade of V2b.

Before activation:

- V2b remains the live buy target,
- V1/V2a/V2b remain historical Holder Index sources,
- frontend registry must not point to V3,
- no V3 quote/write UI should appear as live,
- V3 deployment must be registered as a new era of sale truth only after
  deployment, funding, verification, readback, docs, and product signoff.

## Static Analysis Status

Fresh Slither was attempted locally and is blocked because Slither is not
installed:

```text
cd contracts
slither . --exclude-dependencies
```

Observed blocker:

```text
slither: command not found
```

Second analyzer check was attempted with Aderyn and is blocked because Aderyn is
not installed:

```text
cd contracts
aderyn .
```

Observed blocker:

```text
aderyn: command not found
```

Deployment remains blocked until fresh Slither and a second static-analysis tool
are run and every finding is either fixed or dispositioned.

## Fork Rehearsal Plan

No fork rehearsal was executed in this pass because neither `AVAX_RPC` nor
`VITE_AVALANCHE_RPC_URL` is available in the current shell.

Required environment:

```text
AVAX_RPC=<QuickNode Avalanche C-Chain HTTPS endpoint>
```

Recommended command after a V3 rehearsal test exists:

```text
cd contracts
AVAX_RPC=<endpoint> forge test --match-contract RehearsalForkV3 --evm-version cancun -vv
```

The rehearsal must not broadcast and must not use private keys.

The rehearsal should prove:

- deployed/candidate constructor parameters match registry/docs,
- Sale V3 can be funded with SYN inventory,
- quote and buy work against forked Avalanche USDC/SYN behavior,
- source payout push succeeds for normal payout wallet,
- blocked/unreachable payout falls back to escrow,
- V1/V2/V2b historical seat posture remains intact,
- no V3 frontend activation happens as part of rehearsal.

## Go / No-Go

Green locally:

- SourceRegistryV1 unit tests,
- MembershipSaleV3 unit tests,
- Foundry compile,
- frontend release gate after candidate files.

Still blocked before audit/deployment:

- fresh Slither,
- second static-analysis tool,
- V3 fork rehearsal,
- deployment hardware-wallet address recorded and tested,
- owner hardware-wallet address recorded and tested,
- Ownable2Step transfer/acceptance readback rehearsed,
- deployment parameter sheet frozen,
- external review,
- legal/product signoff,
- frontend read-only preview design,
- explicit activation plan.

Verdict: V3 candidate is stronger after QA, but still not audit-ready and not
deployment-ready.
