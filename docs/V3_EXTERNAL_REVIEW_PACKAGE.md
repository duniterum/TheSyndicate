# V3 External Review Package

Status: EXTERNAL REVIEW PACKAGE READY / NO DEPLOYMENT AUTHORIZED / V3 NOT LIVE

Current reviewer-findings disposition state:

```text
Pending commit at document update time.
See REVIEW_CONTEXT.md in the refreshed review bundle for the exact commit hash.
```

This package is the reviewer front door for the V3 candidate contracts. It does
not deploy, activate, register, frontend-wire, or publish V3. V2b remains the
live buy path until a separate deployment, verification, funding, readback,
registry update, and product activation pass is explicitly approved.

## No-Deployment Statement

Do not deploy from this package.

Do not:

- broadcast transactions,
- use private keys,
- switch the frontend registry,
- add a V3 sale address to live product surfaces,
- activate referral, source, or claim UI,
- mark V3 as live,
- change V2b live-sale posture,
- change Archive1155 or SeatRecord721 posture.

Reviewers should evaluate the contracts, tests, docs, and blocker table only.

## Review Scope

Primary contracts:

- `contracts/src/SourceRegistryV1.sol`
- `contracts/src/MembershipSaleV3.sol`

Primary tests:

- `contracts/test/SourceRegistryV1.t.sol`
- `contracts/test/MembershipSaleV3.t.sol`
- `contracts/test/RehearsalForkV3.t.sol`

Supporting current contracts/tests:

- `contracts/src/SyndicateSaleV2.sol`
- `contracts/src/CommissionRouterV1.sol`
- `contracts/test/SyndicateSaleV2.t.sol`
- `contracts/test/CommissionRouterV1.t.sol`
- `contracts/test/RehearsalForkV2b.t.sol`

Canonical docs:

- `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md`
- `docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md`
- `docs/V3_ACQUISITION_ENGINE_TEST_PLAN.md`
- `docs/V3_SMART_CONTRACT_QA_READINESS.md`
- `docs/V3_DEPLOYMENT_READINESS_PACKAGE.md`
- `docs/DOCUMENTATION_AUTHORITY_MAP.md`
- `docs/SMART_CONTRACT_SYSTEM_MAP.md`

## Current V3 Candidate Model

`SourceRegistryV1` stores visible source policy terms. It does not move funds,
mint SYN, count seats, or activate referral UI.

`MembershipSaleV3` performs the candidate acquisition-first membership sale:

```text
gross USDC paid
  -> acquisition commission, if an eligible source applies
  -> Net USDC Routed
  -> 70% Vault / 20% Liquidity / 10% Operations
  -> SYN delivered at deterministic era pricing
  -> reconstructable V3 receipt event
```

SYN remains the V1 seat. The seat is binary. Contribution is variable. V3 does
not deploy SeatRecord721 and does not modify Archive1155.

## Latest Validation

Latest local reviewer-findings disposition validation:

```text
cd contracts
forge test --match-contract SourceRegistryV1Test -vv
forge test --match-contract MembershipSaleV3Test -vv
forge test --match-contract RehearsalForkV3 --evm-version cancun -vv
```

Result:

```text
SourceRegistryV1Test: 20 passed
MembershipSaleV3Test: 35 passed
RehearsalForkV3 local/skip path: 3 passed, 1 skipped
RehearsalForkV3 real QuickNode fork after reviewer-finding patches: 4 passed, 0 failed, 0 skipped
```

The real QuickNode fork was run against patched commit `48007bc6200583d0d3df382f15678d48cd31cdb6`.
The local/skip path remains useful when `AVAX_RPC` is unset.

Full unfiltered Foundry suite status:

```text
Local Windows run timed out during compilation after 180 seconds.
No Solidity assertion failure was observed in the targeted V3 runs.
Clean full-suite Foundry run in CI, WSL/Linux, or reviewer environment remains
required before deployment confidence.
```

Root validation:

```text
npm run typecheck
npm run test
npm run build
npm run check-release
```

Result:

```text
typecheck passed
92 frontend test files passed
1,794 frontend tests passed
production build passed
release gate passed
```

Known build warning: Vite reports third-party `"use client"` directives from
dependencies. This is existing dependency noise, not a V3 blocker.

## Slither / Static Analysis Status

Slither was installed and run in the development environment during the
security-readiness phase. It produced findings that require disposition before
deployment.

Important reviewer item:

- Slither flagged the `MembershipSaleV3` source payout / escrow fallback path
  as benign reentrancy-sensitive.

Current mitigating design:

- `buy` is `nonReentrant`,
- `claimSourceEscrow` is `nonReentrant`,
- `pushSourcePayout` is callable only by `address(this)`,
- source payout is push-first but falls back to escrow on token transfer revert,
- blocked payout wallets do not block purchases,
- escrow claims are blocked while a source is PAUSED or REVOKED,
- payout-wallet recovery must use the dedicated `updatePayoutWallet` event path,
- smart-contract payout wallets are tested,
- USDC and SYN are protected from owner rescue.

Reviewer disposition required:

- confirm the direct payout / escrow fallback model is acceptable for Avalanche
  native USDC,
- confirm no source payout wallet can grief a purchase,
- confirm escrow accounting cannot be stolen, orphaned, or double-claimed,
- confirm PAUSED / REVOKED sources cannot drain escrow before review,
- confirm total USDC conservation across direct payout and escrow states.

Other Slither findings observed during the earlier run:

- strict equality checks around seated-source validation and zero-amount sends,
- timestamp use for attribution windows and recovery timelocks,
- uninitialized local variables that default to false/zero in intended paths,
- unused tuple returns in preview-only source term reads,
- naming/pragma/cyclomatic-complexity style warnings.

Current disposition:

- not classified as critical by current internal review,
- still requires external review signoff before deployment.

## Second Analyzer Status

Aderyn has not run.

Blocker:

```text
Rust/Cargo is not available in the current Windows environment.
```

No second static analyzer should be marked complete until a credible second
tool is installed and its findings are dispositioned.

## Windows Slither Tooling Note

A follow-up Slither rerun hit a Windows `crytic-compile` / Foundry PATH issue:

```text
Cannot execute `forge`, is it installed and in PATH?
KeyError: 'output'
```

Foundry itself is installed and `forge test` passes, so this is a local Slither
toolchain handoff issue, not a Solidity test failure. It must still be resolved
or worked around before deployment, preferably in a clean shell, CI, WSL, or a
reviewer-controlled environment.

## Fork Rehearsal Status

`contracts/test/RehearsalForkV3.t.sol` now exists.

Default local behavior:

- skips the live fork test when `AVAX_RPC` is unset,
- still runs local shape tests for blocked payout escrow and smart-wallet payout
  compatibility.

Required command for real Avalanche fork rehearsal:

```text
cd contracts
AVAX_RPC=<QuickNode Avalanche C-Chain HTTPS endpoint> forge test --match-contract RehearsalForkV3 --evm-version cancun -vv
```

Optional pinned block:

```text
AVAX_FORK_BLOCK=<block-number>
```

No private keys. No broadcast.

The fork rehearsal checks:

- Avalanche USDC address,
- live SYN address,
- Vault / Liquidity / Operations addresses,
- V2b live-sale contract posture,
- Archive1155 live memory-contract posture,
- SourceRegistryV1 deploy/readback on fork,
- MembershipSaleV3 deploy/readback on fork,
- Ownable2Step transfer/acceptance shape,
- SYN inventory funding through rehearsal cheatcode,
- quote,
- no-source buy,
- source-attributed buy,
- acquisition-first routing,
- source payout,
- receipt event reconstruction,
- member number / first-seat behavior.

Real QuickNode fork rehearsal was rerun after reviewer-finding patches against
patched commit `48007bc6200583d0d3df382f15678d48cd31cdb6`.

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

## Blocker Table

### Critical

None currently confirmed by internal tests.

### High

| Blocker | Why it matters | Required action | Blocks |
| --- | --- | --- | --- |
| Second analyzer not run | Slither alone is not enough for deployment-quality confidence. | Install/run Aderyn or another credible Solidity analyzer and disposition findings. | Deployment |
| External review not complete | V3 moves USDC, attributes sources, and controls escrow. | Send this package to reviewer and resolve findings. | Deployment |
| Owner hardware-wallet addresses not frozen | Owner powers are material before protocol maturity. | Freeze deployment and owner hardware-wallet addresses and rehearse Ownable2Step acceptance. | Deployment |

### Medium

| Blocker | Why it matters | Required action | Blocks |
| --- | --- | --- | --- |
| Slither payout/escrow warning needs disposition | Direct payout is the most sensitive V3 money path. | External reviewer signs off or recommends patch. | Deployment |
| Windows Slither PATH/crytic issue | Repeatable local static analysis is currently brittle. | Run Slither in clean shell/WSL/CI/reviewer env. | Deployment-quality process |

### Low

| Item | Why it matters | Required action | Blocks |
| --- | --- | --- | --- |
| Quote is preview-only | Final buy validates payer/source conditions more fully than quote can. | Keep frontend copy clear when read-only quote UI is later added. | UI polish |
| Vite third-party warnings | Build logs are noisy. | No action unless dependency behavior changes. | Nothing current |

## Reviewer Questions

Reviewers should explicitly answer:

1. Can `MembershipSaleV3` direct payout and escrow fallback be deployed as-is?
2. Can any payout wallet, source wallet, or token behavior block a normal buy?
3. Can source attribution be hijacked after a buyer is already linked?
4. Are pause, source update, source revoke, and payout-wallet recovery powers
   bounded and visible enough for the current founder-led stage?
5. Are receipt events sufficient to reconstruct every USDC/SYN movement?
6. Are caps and attribution windows enforced correctly across explicit and
   auto-linked source paths?
7. Does any path let acquisition cost exceed the approved source terms?
8. Does any path create a second seat for the same recipient?
9. Does any path endanger Vault/Liquidity/Operations routing conservation?
10. Is V3 safe to rehearse on fork after review fixes, without deployment?

## Exact Next Workflow

1. Resolve local Slither repeatability or run Slither in reviewer/CI/WSL.
2. Install/run Aderyn or another second analyzer.
3. Run real fork rehearsal:

```text
cd contracts
AVAX_RPC=<QuickNode Avalanche C-Chain HTTPS endpoint> forge test --match-contract RehearsalForkV3 --evm-version cancun -vv
```

4. Send this package and canonical docs to external reviewer.
5. Resolve reviewer findings.
6. Freeze hardware-wallet deployment and owner addresses.
7. Only then prepare a deployment-decision meeting.

No step above authorizes deployment or live activation.
