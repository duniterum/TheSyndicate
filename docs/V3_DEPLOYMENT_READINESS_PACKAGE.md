# V3 Deployment Readiness Package

Status: OPERATIONAL READINESS PACKAGE / HARDWARE-WALLET FIRST / NO DEPLOYMENT AUTHORIZED

This package originally converted the V3 candidate state into a practical
deployment-preparation path. Current status update: SourceRegistryV1 and
MembershipSaleV3 have since been deployed, verified, ownership-accepted, and
MembershipSaleV3 has been funded. V2b is now paused on-chain and retained as a
historical scan source/recovery boundary. The frontend direct-buy target is
MembershipSaleV3 for zero-source public purchases. Source records, referral UI,
claim UI, and any source activation remain blocked until a separate approval.

Current V3 candidate contracts:

- `contracts/src/SourceRegistryV1.sol`
- `contracts/src/MembershipSaleV3.sol`

Current founder decision:

- use a dedicated hardware-wallet owner model for the current V3 preparation
  and test-deployment path,
- do not block current execution on Safe/multisig setup,
- keep future migration to Safe/multisig/timelock as a staged control upgrade,
- keep all owner actions visible, event-backed, and publicly explainable.

## 1. Hardware-Wallet Owner Model

### Recommended Setup Today

Use a dedicated protocol hardware wallet that is separate from any daily,
personal, trading, testing, exchange, or browser-hot wallet.

Recommended wallets:

1. Deployment wallet: hardware wallet used to deploy candidate contracts.
2. Owner wallet: hardware wallet that receives ownership after deployment.
3. Backup hardware wallet: initialized and stored safely, but not used for
   normal signing unless recovery is required.

The deployment wallet and owner wallet may be the same only for a private fork
or dry-run. For any real mainnet deployment, prefer:

```text
deployment hardware wallet -> deploys
owner hardware wallet      -> accepts ownership through Ownable2Step
```

Reason: the deployer can be used for deployment mechanics while the owner wallet
becomes the long-term authority for pause, source policy, and recovery actions.

### Hardware Wallet Rules

- Never use a hot wallet as owner.
- Never use the protocol owner wallet for personal trading.
- Never import the seed phrase into MetaMask, Rabby, browser wallets, cloud
  password managers, screenshots, phones, chat, email, or notes apps.
- Store the seed phrase offline, physically, in at least two secure locations.
- Label the address externally as `Syndicate V3 Owner Candidate` until live.
- Keep a small AVAX balance for gas only.
- Test the address with a tiny AVAX transaction before any deployment flow.
- Confirm Avalanche C-Chain chain ID `43114` before signing.
- Confirm every transaction on the hardware device screen, not only in the
  browser.
- Maintain a manual deployment log with timestamp, wallet address, transaction
  hash, action, and result.

### Who Signs What

| Action | Today / preparation | Public activation target |
| --- | --- | --- |
| Deploy `SourceRegistryV1` | dedicated hardware deployment wallet | hardware deployment wallet |
| Deploy `MembershipSaleV3` | dedicated hardware deployment wallet | hardware deployment wallet |
| Own `SourceRegistryV1` | dedicated owner hardware wallet | owner hardware wallet |
| Own `MembershipSaleV3` | dedicated owner hardware wallet | owner hardware wallet |
| Pause / unpause sale | owner hardware wallet | owner hardware wallet |
| Create / update source terms | owner hardware wallet | owner hardware wallet |
| Pause / revoke source | owner hardware wallet | owner hardware wallet |
| Update payout wallet | owner hardware wallet | owner hardware wallet |
| Recover unsold SYN after allowed wind-down | owner hardware wallet | owner hardware wallet |

Every source action, payout-wallet update, source pause/revoke, sale pause,
sale unpause, ownership transfer, and recovery action must be recorded publicly
in the deployment log and, where contract-supported, emitted on-chain.

## 2. Future Control Evolution

Future control is not a blocker today, but it should be staged intentionally.

| Stage | Suggested control | Trigger |
| --- | --- | --- |
| Today | dedicated hardware-wallet owner | V3 preparation, local tests, fork rehearsal, test deployment path |
| Real traction | consider 2-of-3 Safe | meaningful public usage, real source terms, higher operational risk |
| Stronger scale | consider 3-of-5 Safe | multiple operators/reviewers, more value routed, more source partners |
| Mature scale | Safe + timelock | non-emergency policy changes become socially material |

Emergency actions that should remain fast even later:

- pause sale,
- pause source,
- revoke source,
- protect payout wallet after suspected compromise.

Actions that should later become Safe/timelock candidates:

- source rate increases,
- cap increases,
- source scope extensions,
- registry activation changes,
- future identity/recovery policy changes,
- high-impact contract ownership transfers.

## 3. Deployment Parameter Sheet

All values below must be frozen before any real deployment.

### Live Addresses From Current Registry

| Parameter | Current value / source |
| --- | --- |
| Avalanche C-Chain chain ID | `43114` |
| USDC address | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| SYN address | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| Vault wallet | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| Liquidity wallet | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| Operations wallet | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| Active live sale today | V2b `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` |
| Archive1155 live memory contract | `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` |

### Hardware Wallet Parameters To Freeze

| Parameter | Required before deployment |
| --- | --- |
| Deployment hardware-wallet address | `TBD` |
| Owner hardware-wallet address | `TBD` |
| Backup hardware-wallet address | `TBD / optional until recovery policy` |
| Public owner label | `Syndicate V3 Owner Candidate` until activation |
| Ownership acceptance flow | Ownable2Step transfer + owner acceptance readback |

### `SourceRegistryV1` Constructor

Current constructor has no external parameters. Deployer becomes initial owner
through `Ownable(msg.sender)`. If deployer and owner are separate, ownership
must be transferred through the two-step ownership flow and accepted by the
owner hardware wallet before activation.

### `MembershipSaleV3` Constructor Parameters

| Parameter | Required value |
| --- | --- |
| `usdc` | native Avalanche USDC address above |
| `syn` | live SYN address above |
| `sourceRegistry` | deployed and readback-verified `SourceRegistryV1` address |
| `vault` | Vault wallet above |
| `liquidity` | Liquidity wallet above |
| `operations` | Operations wallet above |
| `genesisOffset` | freeze from Holder Index / V1-V2-V2b continuity before deploy |
| `v1MemberRoot` | freeze from recognized historical members, or zero root if explicitly approved by tests |
| `addrCaps[9]` | freeze per-era address caps from V3 test/config sheet |
| `maxUsdcPerTx` | freeze from V3 test/config sheet |
| `reserveThroughSeat` | freeze or set to zero only with explicit signoff |
| `eraCaps[9]` | freeze per-era SYN inventory caps from V3 test/config sheet |

### V3 Era Schedule

The schedule is deterministic and must not be mutable after deployment.

| Era | Seat range | SYN per 1 USDC | Minimum USDC |
| --- | --- | ---: | ---: |
| I | #1 - #333 | 100 | 5 |
| II | #334 - #1,000 | 50 | 10 |
| III | #1,001 - #3,333 | 40 | 10 |
| IV | #3,334 - #10,000 | 16 | 25 |
| V | #10,001 - #25,000 | 12 | 25 |
| VI | #25,001 - #50,000 | 6 | 50 |
| VII | #50,001 - #100,000 | 4 | 50 |
| VIII | #100,001 - #250,000 | 2 | 100 |
| IX | #250,001 - #1,000,000 | 1 | 100 |

### Source / Commission Limits

| Parameter | Current candidate value |
| --- | ---: |
| BPS denominator | `10_000` |
| Absolute max commission | `3_000` bps / 30% |
| Max member-introduction commission | `1_500` bps / 15% |
| Public automatic max | `1_200` bps / 12% |

### Funding Requirements

Before activation:

- fund `MembershipSaleV3` with the approved SYN sale inventory,
- confirm SYN balance on explorer and contract readback,
- do not fund from a daily/personal wallet without recording source and tx,
- do not activate frontend until inventory, owner, source registry, and quote
  readbacks are correct.

### Receipt / Runtime Rules

- Receipt version: V3 receipt version must remain explicit in event/read model.
- Routing: gross USDC -> acquisition commission -> Net USDC Routed -> 70 / 20 / 10.
- Payout: direct source payout first, escrow fallback if payout fails.
- Pause: owner hardware wallet can pause/unpause.
- Recovery: unsold SYN recovery follows the contract's conclusion/wind-down
  and timelock rules.

## 4. Static Analysis Package

Fresh static analysis remains required before deployment.

### Slither

Install options:

```text
python -m pip install slither-analyzer
```

Command:

```text
cd contracts
slither . --exclude-dependencies
```

Expected output:

- no high/critical issues, or every issue dispositioned,
- findings classified as BLOCKER / WARNING / INFO,
- saved report committed or attached to external review package.

Blocker examples:

- reentrancy affecting money movement,
- owner can drain USDC or SYN contrary to docs,
- source caps bypassable,
- acquisition commission exceeding cap,
- purchase can be griefed by source payout,
- receipt cannot reconstruct money movement.

Warning examples:

- gas optimizations,
- naming,
- event-indexing improvements,
- informational OpenZeppelin inherited notices.

### Second Analyzer

Preferred second analyzer: Aderyn.

Install option:

```text
cargo install aderyn
```

Command:

```text
cd contracts
aderyn .
```

If Aderyn is unavailable, use another credible Solidity analyzer and record:

- tool name,
- version,
- command,
- report path,
- disposition table.

## 5. Fork Rehearsal Package

Fork rehearsal uses QuickNode Avalanche RPC or another reliable Avalanche C-Chain
HTTPS endpoint.

Environment:

```text
AVAX_RPC=<QuickNode Avalanche C-Chain HTTPS endpoint>
```

No private keys. No broadcast. No real deployment.

Command shape after fork rehearsal tests exist:

```text
cd contracts
AVAX_RPC=<endpoint> forge test --match-contract RehearsalForkV3 --evm-version cancun -vv
```

Fork rehearsal must prove:

- constructor parameters match this package,
- SourceRegistry deploy/readback works,
- MembershipSaleV3 deploy/readback works,
- ownership transfer/acceptance can be rehearsed,
- sale can be funded with SYN inventory,
- quote matches era schedule,
- no-source buy routes full gross through 70 / 20 / 10,
- source buy applies acquisition-first routing,
- normal source payout succeeds,
- blocked source payout escrows without blocking buy,
- smart-wallet payout compatibility is preserved,
- member numbering and first-seat behavior are correct,
- receipt reconstructs all money movement,
- V1/V2a/V2b historical posture is preserved,
- no frontend registry activation happens during rehearsal.

## 6. External Review Package

External reviewer packet should include:

- `contracts/src/SourceRegistryV1.sol`
- `contracts/src/MembershipSaleV3.sol`
- `contracts/test/SourceRegistryV1.t.sol`
- `contracts/test/MembershipSaleV3.t.sol`
- `docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md`
- `docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md`
- `docs/V3_ACQUISITION_ENGINE_TEST_PLAN.md`
- `docs/V3_SMART_CONTRACT_QA_READINESS.md`
- this deployment readiness package,
- static-analysis reports and disposition table,
- fork rehearsal output,
- deployment parameter sheet,
- known risks and blockers,
- no-deployment/no-activation statement.

Reviewer must confirm:

- source terms cannot exceed caps,
- money movement conserves USDC,
- escrow cannot be stolen or orphaned,
- owner powers match documentation,
- pause/recovery powers are acceptable,
- receipts are reconstructable,
- no source owns a member,
- V3 does not affect Archive1155 or SeatRecord721,
- V3 activation plan is separate from deployment.

## 7. Activation Package

Correct order:

1. Resolve blockers.
2. Freeze deployment parameters.
3. Configure hardware wallets.
4. Run static analysis.
5. Run fork rehearsal.
6. Complete external review.
7. Complete legal/product signoff.
8. Deploy candidate.
9. Verify source.
10. Transfer/accept ownership if deployer and owner differ.
11. Fund candidate with SYN inventory.
12. Read back candidate state.
13. Dry-run frontend read-only reads locally.
14. Update registry only after explicit approval.
15. Activate frontend only after registry/readback approval.

### Pre-Deployment Checklist

- [ ] Hardware deployment wallet initialized and tested.
- [ ] Hardware owner wallet initialized and tested.
- [ ] Owner address recorded.
- [ ] AVAX gas funded.
- [ ] USDC/SYN/Vault/Liquidity/Operations addresses verified.
- [ ] SourceRegistry constructor reviewed.
- [ ] MembershipSaleV3 constructor args frozen.
- [ ] Static analysis complete.
- [ ] Fork rehearsal complete.
- [ ] External review complete.
- [ ] Legal/product signoff complete.

### Deployment Checklist

- [ ] Deploy `SourceRegistryV1`.
- [ ] Record tx hash.
- [ ] Verify source.
- [ ] Read owner.
- [ ] Deploy `MembershipSaleV3`.
- [ ] Record tx hash.
- [ ] Verify source.
- [ ] Read constructor state.
- [ ] Transfer ownership to owner hardware wallet if separate.
- [ ] Owner hardware wallet accepts ownership.

### Funding Checklist

- [ ] Confirm sale address.
- [ ] Transfer approved SYN inventory.
- [ ] Read sale SYN balance.
- [ ] Confirm no USDC is accidentally held except future source escrow.

### Readback Checklist

- [ ] `USDC`, `SYN`, `SOURCE_REGISTRY`, `VAULT`, `LIQUIDITY`, `OPERATIONS`.
- [ ] `owner()`.
- [ ] `currentEra()`.
- [ ] era caps and address caps.
- [ ] sale inventory balance.
- [ ] quote result for no-source purchase.
- [ ] source terms readback for a test source if configured.
- [ ] paused state.

### Registry / Frontend Checklist

- [x] Add V3 address after approval.
- [x] Wire direct buys to MembershipSaleV3 for zero-source public purchases.
- [x] Preserve V2b as paused historical/recovery-boundary truth after cutover.
- [ ] No referral/claim UI until source terms and readbacks are live.
- [ ] Run `npm run check-release`.
- [ ] Visual QA `/v3-preview`, `/join`, `/registry`, `/my-syndicate`.

### Rollback / Emergency Checklist

- [ ] Pause sale.
- [ ] Pause/revoke source.
- [ ] Update payout wallet if compromised.
- [ ] Keep frontend on V2b or downgrade to pending.
- [ ] Publish Register/Activity explanation if material.
- [ ] Do not hide or delete historical events.

## 8. Biggest Remaining Risks

| Rank | Risk | Why it matters now |
| ---: | --- | --- |
| 1 | Static analysis not run | Unit tests are strong, but deployment-quality review needs independent tooling. |
| 2 | Fork rehearsal not run | Real Avalanche token behavior and constructor/readback flow need rehearsal. |
| 3 | Hardware owner address not frozen | The model is decided, but the actual address and acceptance flow are still TBD. |
| 4 | External review not complete | V3 controls money, source terms, escrow, and sale state. |
| 5 | Legal/product signoff not complete | Acquisition commission copy must avoid yield, passive income, employment, or agency drift. |
| 6 | UX activation risk | Users may confuse V3 preview with live V3 unless activation remains staged. |
| 7 | Operational logging risk | Hardware-wallet actions must be recorded; hidden admin actions would damage trust. |

Most dangerous today: running deployment before static analysis, fork rehearsal,
and hardware-owner readback are complete.

## 9. Final Execution Roadmap To V3 Live

1. Commit the current V3 preview language/readability polish batch.
2. Commit this hardware-wallet-first deployment readiness package.
3. Founder prepares dedicated deployment and owner hardware wallets.
4. Record candidate deployment/owner addresses.
5. Install and run Slither.
6. Install and run Aderyn or another second analyzer.
7. Create/disposition static-analysis finding table.
8. Add or run V3 fork rehearsal with `AVAX_RPC`.
9. Freeze constructor parameters.
10. Prepare external reviewer packet.
11. Complete external review.
12. Complete legal/product signoff.
13. Deploy SourceRegistryV1 candidate with hardware wallet.
14. Verify SourceRegistryV1 source and read owner.
15. Deploy MembershipSaleV3 candidate with hardware wallet.
16. Verify MembershipSaleV3 source and read constructor state.
17. Transfer ownership to owner hardware wallet if deployer differs.
18. Owner hardware wallet accepts ownership.
19. Fund sale with approved SYN inventory.
20. Read back all deployment state.
21. Run frontend read-only local verification.
22. Prepare registry update PR/commit.
23. Activate read-only registry status.
24. Re-run release gate.
25. Only after founder approval, activate the live V3 buy path.

No step in this package authorizes deployment, activation, registry switch, or
live UI.
