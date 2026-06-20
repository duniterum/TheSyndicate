# CommissionRouterV1 Remix Deployment Readiness

Status: DO NOT DEPLOY YET / REMIX PREP ONLY / NOT LIVE

This guide prepares a future Remix + MetaMask deployment of
`CommissionRouterV1`. It does not authorize deployment. It is written for a
beginner operator so the signing step stays slow, visible, and reversible until
founder approval is explicit.

## 0. Do Not Deploy Yet

Stop now unless every hard gate below is green:

- fresh Slither run: NOT GREEN
- second static-analysis tool: NOT GREEN
- fork rehearsal: NOT GREEN
- owner / final owner decision: NOT DECIDED
- external line-by-line review: NOT DONE
- legal/product signoff: NOT FINAL

Run the local freeze checker before any deployment session:

```bash
npm run check-commission-router-freeze
```

Expected current result: `BLOCKED`. A blocked result means do not deploy.

Founder approval is required before opening Remix for a real deployment session.

## 1. Deployment Preference

Preferred signing path:

- Remix IDE for the deployment UI
- MetaMask for the actual transaction signature
- Avalanche C-Chain as the selected network

Foundry remains the preparation tool:

- tests
- fork rehearsal
- compile checks
- ABI/bytecode inspection
- constructor parameter preparation
- post-deploy readback checklist

Do not use Foundry `--broadcast` for live deployment unless the founder
explicitly approves a different deployment path later.

## 2. Exact Contract File To Open

Open this file in Remix:

```text
contracts/src/CommissionRouterV1.sol
```

Do not deploy:

- `SyndicateSaleV2.sol`
- test files
- mocks
- flattened sale artifacts
- any OpenZeppelin dependency

## 3. Compiler Settings

Use the same compiler shape as the repository:

| Setting | Value |
| --- | --- |
| Solidity compiler | `0.8.24` |
| Auto compile | Optional; manual compile is safer |
| Language | Solidity |
| EVM version | `paris` if Remix exposes the setting; otherwise record Remix default |
| Optimization | Enabled |
| Optimizer runs | `200` |
| viaIR | Enabled if Remix exposes the setting; if unavailable, stop and compare bytecode with Foundry before proceeding |

Before deployment, compare the Remix compiler settings against:

```text
contracts/foundry.toml
```

STOP if Remix cannot compile with a compatible `0.8.24` optimized build.

## 4. Constructor Arguments

`CommissionRouterV1` constructor:

```solidity
constructor(address usdc)
```

Current constructor argument:

```text
0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
```

Meaning: Avalanche native USDC.

STOP if Remix asks for any constructor argument other than `usdc`.

STOP if the USDC address differs from the freeze sheet.

## 5. Avalanche C-Chain Network Details

MetaMask network must be Avalanche C-Chain mainnet:

| Field | Value |
| --- | --- |
| Network name | Avalanche C-Chain |
| Chain ID | `43114` |
| Native currency | `AVAX` |
| RPC URL | Use the approved Avalanche HTTPS RPC for the wallet session |
| Explorer | Snowtrace / Avascan / Routescan for verification readback |

Do not use the WSS endpoint in MetaMask or Foundry fork tests.

STOP if MetaMask shows any chain other than Avalanche C-Chain / `43114`.

## 6. MetaMask Safety Checklist

Before signing:

1. Confirm MetaMask is on Avalanche C-Chain.
2. Confirm the deploying account is the intended initial owner.
3. Confirm the account has enough AVAX for gas.
4. Confirm the hardware wallet or final-owner plan is ready.
5. Confirm the transaction says contract deployment, not token approval or a call
   to another contract.
6. Confirm no website is asking for unlimited token approvals.
7. Confirm there is no private key pasted into Remix, chat, terminal, or docs.

STOP if MetaMask shows an unfamiliar network, unfamiliar account, or unexpected
transaction type.

## 7. Owner Model Warning

The deployer becomes the initial `owner`.

Owner can:

- add an allow-listed sale source
- remove an allow-listed sale source
- transfer ownership

Owner cannot:

- change Vault routing
- change Liquidity routing
- drain referral escrow directly
- mint SYN
- mint Archive artifacts

Recommendation:

- hardware wallet EOA is the minimum acceptable launch owner
- multisig is preferred before broad public referral activation
- hot MetaMask EOA should be rehearsal-only unless founder explicitly accepts the risk

STOP if final owner is not decided.

## 8. Exact Pre-Deploy Checklist

All must be green before deployment:

1. `npm run check-release` passes.
2. Foundry tests pass.
3. `npm run check-commission-router-freeze` passes.
4. Fresh Slither run has no unresolved high/medium findings.
5. Second static-analysis tool has no unresolved high/medium findings.
6. Fork rehearsal passes with Avalanche HTTPS RPC.
7. External line-by-line review is signed off.
8. Legal/product wording is signed off.
9. Initial owner is recorded.
10. Final owner is recorded.
11. Constructor USDC address is verified.
12. Remix compiler settings are recorded.
13. Founder gives explicit deploy approval.

STOP if any item is missing.

## 9. Deployment Step, When Approved Later

This section is informational. Do not execute it yet.

In Remix:

1. Open `contracts/src/CommissionRouterV1.sol`.
2. Compile `CommissionRouterV1` with the frozen compiler settings.
3. Open "Deploy & Run Transactions".
4. Environment: "Injected Provider - MetaMask".
5. Confirm network: Avalanche C-Chain, chain ID `43114`.
6. Select contract: `CommissionRouterV1`.
7. Constructor argument: Avalanche native USDC.
8. Click deploy only after founder approval.
9. Review MetaMask carefully.
10. Sign only if every field matches the freeze checklist.

STOP after deployment transaction confirmation. Do not click any write method.

## 10. Exact Post-Deploy Readback Checklist

After the deployment transaction confirms, record:

- deployed router address
- deployment transaction hash
- deploying account
- block number
- compiler version
- optimizer setting
- optimizer runs
- constructor argument
- explorer verification status

Read back from the deployed contract:

| Read | Expected |
| --- | --- |
| `USDC()` | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| `owner()` | initial owner or final owner, depending on whether transfer has happened |
| `pendingOwner()` | zero address unless ownership transfer has started |
| `sourceConfig(0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b)` | disabled / zero values before `addSource` |
| `tierFor(0)` | tier `0`, Operations percent `30` |
| `tierFor(5)` | tier `1`, Operations percent `40` |
| `tierFor(20)` | tier `2`, Operations percent `55` |
| `tierFor(50)` | tier `3`, Operations percent `70` |
| `tierFor(100)` | tier `4`, Operations percent `80` |

STOP if any readback differs.

## 11. Source Verification Steps

After deployment, verify source on a supported Avalanche explorer.

Use the same settings:

- contract: `CommissionRouterV1`
- compiler: `0.8.24`
- optimization: enabled
- optimizer runs: `200`
- EVM version: `paris`, if required by the explorer
- constructor argument: USDC address

Preferred readback pages:

- Routescan contract code tab
- Snowtrace address/contract view
- Avascan C-Chain address view

STOP if source verification fails. Do not continue to `addSource` or frontend
registry updates while source is unverified.

## 12. What Not To Click

Do not click:

- `addSource`
- `removeSource`
- `transferOwnership`
- `renounceOwnership`
- `claimReferral`
- any Sale V2 router method
- any token approval method
- any "at address" write action for Sale V2

Do not paste:

- private keys
- seed phrases
- deployment secrets
- QuickNode URLs into public docs or chat

Do not update:

- contract registry
- referral route live status
- claim UI
- Join referral write flow
- Replit production env

## 13. What Must Wait

These must wait until after deploy readback and founder approval:

- `addSource`
- Sale V2 `proposeCommissionRouter`
- Sale V2 `confirmCommissionRouter`
- registry address update
- frontend read-only activation
- referral-at-buy UI
- claim UI
- public referral launch copy

## 14. addSource Steps Later, Not Now

Future step only after source verification and owner readback:

```text
addSource(
  0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b,
  0xccfff1a00e76bfae657a6db2e63f47caf7640d4f57c704fd04a5112e530caae5,
  0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80
)
```

STOP before executing this. It requires founder approval after deployment
readback.

## 15. Sale V2 Router Steps Later, Not Now

Future Sale V2 sequence only after router source is verified:

1. `proposeCommissionRouter(routerAddress)`
2. wait the Sale V2 router timelock
3. `confirmCommissionRouter()`
4. read back `commissionRouter()`
5. confirm Sale V2 allowance to the router

STOP before this sequence. It changes live sale behavior.

## 16. Registry Update Sequence Later

Only after verified deployment and readback:

1. update `COMMISSION_ROUTER_V1` address in `src/lib/contract-registry.ts`
2. move status from `PENDING` to `DEPLOYED`, not broad live referral
3. add explorer link via registry helpers
4. keep referral write UI disabled
5. update tests to require verified read-only state
6. run full release gate

STOP before merging any registry update unless the deployed address is verified.

## 17. Frontend Read-Only Activation Later

Stage 1 can show read-only truth only:

- router deployed
- verified explorer link
- source config read
- tier preview read
- referred count read
- escrow owed read only if clearly labeled and not claimable

Stage 1 must not include:

- referral-at-buy writes
- claim button
- fake balances
- fake commissions
- reward/yield/passive income wording

## 18. Rollback / Disable Reminder

If referral infrastructure is later wired and must be disabled:

- router owner can call `removeSource(SaleV2)`
- Sale V2 owner can call `disableCommissionRouter()`
- frontend can downgrade `COMMISSION_ROUTER_V1` to `PENDING` /
  `REQUIRES CONTRACT`

Expected fallback:

- buys continue
- Vault receives 70%
- Liquidity receives 20%
- Operations receives full 10%
- no referral commission accrues while disabled

## 19. Founder Stop Points

Founder approval is required before:

1. opening a real deployment session in Remix
2. signing the deployment transaction
3. transferring ownership
4. calling `addSource`
5. proposing the router on Sale V2
6. confirming the router on Sale V2
7. updating frontend registry address
8. changing referral route status from pending
9. adding any referral write UI
10. adding any claim UI

Current conclusion: this guide is ready as a preparation artifact. Deployment
remains blocked.
