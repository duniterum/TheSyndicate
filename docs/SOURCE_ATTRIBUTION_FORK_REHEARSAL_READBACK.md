# Source Attribution Fork Rehearsal Readback

Date: 2026-06-22  
Status: PASSED / DEPLOYED-ADDRESS FORK ONLY / NO MAINNET SOURCE RECORD

## Baseline

| Field | Value |
| --- | --- |
| GitHub commit | `f5b33308cdcf13401201ba0dc4e48953671728a6` |
| Commit label | `Align source attribution fork guard expectations` |
| Test suite | `SourceAttributionForkV3Test` |
| Command pattern | `AVAX_RPC=<QuickNode HTTPS endpoint> forge test --match-contract SourceAttributionForkV3Test --evm-version cancun -vv` |
| RPC handling | Endpoint was used locally only and is not recorded in this repository. |

## Result

| Test | Result |
| --- | --- |
| `test_deployedV3Fork_sourceCreationAndSourceAttributedBuy()` | PASS |
| `test_deployedV3Fork_sourceGuardsPauseRevokeAndUnseatedMemberIntro()` | PASS |

Suite result: `ok`  
Total: `2 passed / 0 failed / 0 skipped`

## What This Proves

- A deployed-address Avalanche fork can impersonate the current `SourceRegistryV1`
  owner inside the local fork and create a test source record without touching
  mainnet state.
- The deployed `MembershipSaleV3` can process a source-attributed purchase on a
  fork using the deployed `SourceRegistryV1`.
- Acquisition-first routing is reconstructable in the fork receipt:
  `grossUsdc = acquisitionCost + vaultAmount + liquidityAmount + operationsAmount`.
- `protocolContribution = grossUsdc - acquisitionCost`.
- Direct public buys using `ZERO_SOURCE_ID` still work and do not accrue source
  gross or source payout.
- `MEMBER_INTRODUCTION` sources enforce seated-referrer status with
  `ReferrerNotSeated()`.
- `PAUSED` and `REVOKED` source status fail closed with `SourceNotEligible()`
  when the source wallet is otherwise seated.
- SourceRegistry validation rejects over-cap commission terms and zero payout
  wallet terms.

## What This Does Not Prove

- It does not create a real mainnet source record.
- It does not activate public referral/source UX.
- It does not activate claim UI.
- It does not prove a production source-link frontend path.
- It does not approve any real source wallet, payout wallet, commission bps,
  metadata hash, cap, window, or source class.
- It does not replace the required founder-approved source packet and ceremony.

## Current Mainnet Boundary

| Surface | Status |
| --- | --- |
| `SourceRegistryV1` | Deployed at `0x780013bB358be6be95b401901264FC7c22a595a6`; owner accepted. Later current-authority readback records one internal PAUSED source record. |
| `MembershipSaleV3` | Deployed at `0x2A6cFc76906e758B934209AFf5A163c9bC20132E`; funded; direct-buy target. |
| Public buy path | `ZERO_SOURCE_ID` only. |
| Referral/source UI | Inactive. |
| Claim UI | Inactive. |
| Mainnet source record | None created by this rehearsal. |

## Next Gate

Before any mainnet source record:

1. Complete a source packet from `docs/SOURCE_RECORD_PACKET_TEMPLATE.md`.
2. Founder reviews and approves source wallet, payout wallet, source class,
   commission bps, window, caps, metadata hash, and risk posture.
3. Legal/product copy is approved.
4. Source creation ceremony follows `docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md`.
5. Initial source status starts as `PAUSED`.
6. A separate activation ceremony is required before any source can be used live.
