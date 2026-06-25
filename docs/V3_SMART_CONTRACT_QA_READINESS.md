# V3 Smart Contract QA Readiness

Status: QA PASS / DEPLOYED / OWNER ACCEPTED / FUNDED / DIRECT-BUY TARGET / ONE PAUSED INTERNAL SOURCE

External-review package status: prepared for review intake in
`docs/V3_EXTERNAL_REVIEW_PACKAGE.md`. V3 direct-buy is now wired through the
frontend with zero sourceId; one internal source record exists as PAUSED policy
state; source activation, referral UI, and claim UI remain blocked until the
gates below are closed.

This document records the focused QA pass for the V3 candidate contracts:

- `contracts/src/SourceRegistryV1.sol`
- `contracts/src/MembershipSaleV3.sol`

Nothing in this document authorizes source activation, referral UI, claim UI,
additional funding, recovery, public source-aware buys, or new transactions.
V2b is paused historical infrastructure; MembershipSaleV3 is the direct-buy target.


## Non-Live Deployment Readback Update

V3 deployment/readback was completed, owner accepted, V2b paused, and MembershipSaleV3 funded with 7,000,000 SYN.

- SourceRegistryV1: `0x780013bB358be6be95b401901264FC7c22a595a6` - deployed / owner accepted / one PAUSED internal source record / referral UI inactive.
- MembershipSaleV3: `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` - deployed / owner accepted / funded / direct-buy target / zero sourceId public buys.
- First SourceCreated block: `88705814`.
- Final owner: `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73`.
- SourceCreated logs for `INTERNAL_PROTOCOL_TEST_SOURCE_001`: `1`, status `PAUSED`.
- MembershipSaleV3 `availableSyn()`: `6,999,000 SYN` at current readback.
- MembershipSaleV3 SYN balance: `6,999,000 SYN` at current readback.
- MembershipSaleV3 `paused()`: `false` by deployment default; pause is deferred intentionally.

Next risk boundary: source activation. No source activation, referral UI, claim UI, public source-aware buy path, or additional funding are authorized until separate approval.
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
- repeat purchase after attribution-window expiry,
- paused linked source auto-fallback and explicit-source rejection,
- revoked linked source auto-fallback and explicit-source rejection,
- stale linked source replacement after expiry, pause, revoke, and cap exhaustion,
- existing seated unlinked members cannot be captured by a new source,
- address-only V1 proofs are disabled so they cannot create member-number-zero
  V3 receipts,
- numbered historical-member proofs set both `knownMember` and `memberNumberOf`,
- `V3HistoricalMemberRootTest` verifies the committed freeze-block `88496414` root artifact, all 8 generated proofs, wrong-wallet/wrong-number/root-mismatch failures, duplicate-number protection, historical-member post-claim buy behavior, and unknown-wallet V3 member numbering,
- existing SYN holders with valid historical-member-number proofs can buy
  through V3 without creating a new first seat,
- unknown wallets with transferred or dusted SYN can still buy and receive a
  new V3 member number,
- raw SYN balance alone is not used as historical-member identity,
- source payout wallet cannot equal the buyer or recipient,
- escrow claim is blocked while a source is PAUSED or REVOKED,
- public `MEMBER_INTRODUCTION` source terms are capped at 12%,
- high-rate / non-member / lifetime / custom source terms require metadata,
- payout wallet changes must use `updatePayoutWallet`, not silent terms update,
- referrer losing SYN seat after attribution,
- active attribution hijack protection,
- V3 fork rehearsal readback shape and skip behavior.

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
7. Claiming is allowed only while the source is ACTIVE.
8. Claimed funds always go to the current payout wallet in `SourceRegistryV1`.

This means:

- a blocked payout wallet cannot grief normal purchases,
- a smart-contract payout wallet works if it can receive ERC-20 balances,
- payout recovery after compromise can happen through visible registry action,
- PAUSED or REVOKED sources cannot claim escrow until source status is reviewed,
- the sale contract may hold USDC only as acquisition escrow,
- receipt accounting remains reconstructable because acquisition cost is still
  emitted in the purchase receipt and escrow mode is emitted separately.

Remaining deployment-review note: escrow claims can still revert while the
current payout wallet remains blocked. That is acceptable because it does not
block buys, but operations must update the payout wallet and explicitly return
the source to ACTIVE before claiming.

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

All source policy actions emit events. `updateSourceTerms` cannot silently
change the payout wallet; payout recovery must use `updatePayoutWallet` so
indexers see `SourcePayoutWalletUpdated`.

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
- historical-member proof recognition can mark a historical member with a
  nonzero member number without issuing a new seat.

`firstSeat` in the V3 receipt means V3 assigned the first protocol-recorded
primary-sale member number for that recipient. It does not mean the wallet held
zero SYN before the transaction. This is intentional because SYN is transferable
and a dusted balance must not block an otherwise valid buyer.

## V2b Migration Posture

V3 is a fresh candidate, not an upgrade of V2b.

Before activation:

- V2b remains the live buy target,
- V1/V2a/V2b remain historical Holder Index sources,
- historical V1/V2/V2b members must be imported through numbered
  historical-member proofs before V3 can treat their repeat purchases as
  non-first-seat contributions,
- raw SYN balance is current holder/seat status only, not sufficient proof of a
  historical member number,
- frontend registry must not point to V3,
- no V3 quote/write UI should appear as live,
- V3 deployment must be registered as a new era of sale truth only after
  deployment, funding, verification, readback, docs, and product signoff.

## Static Analysis Status

Slither was installed and run during the security-readiness phase. It produced
findings that need external disposition before deployment. The most important
finding is a benign-reentrancy warning around the `MembershipSaleV3` source
payout / escrow fallback path.

Current internal disposition:

- `buy` and `claimSourceEscrow` are `nonReentrant`,
- `pushSourcePayout` is callable only by `address(this)`,
- blocked payout wallets fall back to escrow without blocking the buy,
- escrow claims are status-gated and cannot be pulled while a source is PAUSED
  or REVOKED,
- smart-contract payout wallets are covered by tests,
- USDC and SYN are protected from owner rescue.

This remains a reviewer item because direct payout is the most sensitive V3
money path.

Second analyzer status: Aderyn has not run because Rust/Cargo is unavailable in
the current Windows environment. No second analyzer should be marked complete
until a credible second tool runs and findings are dispositioned.

Tooling note: a follow-up Slither rerun hit a Windows `crytic-compile` /
Foundry PATH issue even though `forge test` itself passes. This is a local
static-analysis tooling issue, not a Solidity test failure, but deployment
remains blocked until static analysis is repeatable in a clean shell, CI, WSL,
or reviewer environment.

## Fork Rehearsal Plan

`contracts/test/RehearsalForkV3.t.sol` now exists. The fork path skips cleanly
when `AVAX_RPC` is unset, while local shape tests still validate blocked payout
escrow and smart-wallet payout compatibility.

Required environment:

```text
AVAX_RPC=<QuickNode Avalanche C-Chain HTTPS endpoint>
```

Recommended command:

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

Real QuickNode fork rehearsal was rerun after the historical-member migration patch, then rerun again after the SYN-balance-gate patch.
SYN-balance-gate patch commit: 1581edf6b78f59055b4f618a4655377285a9cd1d.
Previous historical-member migration patch commit: 664cdd0b185104c0665549c841e1fd492bc6e287.

Result:

```text
RehearsalForkV3: 4 passed, 0 failed, 0 skipped.
```

Fork log summary:

```text
V3 fork rehearsal OK: readbacks, no-source buy, source buy, receipt, V2b/Archive posture.
```

Foundry emitted one cache warning for a missing local RPC cache file. This is
normal first-run cache noise and not a contract failure.

## Go / No-Go

Green locally:

- SourceRegistryV1 unit tests,
- MembershipSaleV3 unit tests,
- RehearsalForkV3 local/skip tests,
- targeted V3 Foundry compile and suites,
- frontend release gate after candidate files.

Still blocked before audit/deployment:

- fresh Slither / repeatable Slither disposition,
- second static-analysis tool,
- deployment hardware-wallet address recorded and used for the non-live deployment ceremony,
- owner hardware-wallet address recorded and owner acceptance completed,
- Ownable2Step transfer/acceptance readback completed,
- deployment parameter sheet and non-live readback log recorded,
- external review,
- legal/product signoff,
- frontend read-only preview design,
- explicit activation plan.

Verdict: V3 candidate is ready to package for external review, but still not
deployment-ready.



