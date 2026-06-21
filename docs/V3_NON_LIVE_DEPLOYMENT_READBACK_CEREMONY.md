# V3 Non-Live Deployment/Readback Ceremony

Status: PREPARATION ONLY / NO BROADCAST / NO DEPLOYMENT AUTHORIZATION

This document prepares the final non-live V3 deployment/readback ceremony. It does not authorize deployment, broadcast, funding, unpause, registry switch, public V3 UI, source-record creation, or activation.

## Hard Boundaries

- Do not deploy without explicit founder approval.
- Do not broadcast.
- Do not use private keys in code, docs, logs, or chat.
- Do not ask for seed phrases, private keys, Ledger recovery words, signer exports, or secrets.
- Do not fund V3.
- Do not create source records.
- Do not switch the frontend registry.
- Do not add live UI.
- Do not activate V3.
- V2b remains the live buy target.

## Current Baseline

| Field | Value |
| --- | --- |
| Baseline GitHub commit before this ceremony doc | `794189b36e762c29e1d7256d0bf41ac3bd28965d` |
| Deployment wallet | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` |
| Owner wallet | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| Wallet relationship | Distinct |
| Initial V3 funding | Zero |
| Source records at deployment | None |
| Frontend registry | Remains V2b |
| V3 live status | Not live |
| Era VII cap | Resolved from deployed lineage: `15,000,000 SYN` |

## Final Root / Genesis Freeze Ceremony

The historical root and `genesisOffset` are immutable constructor inputs. Because V2b remains live, the current derived values are not final until the last pre-deploy freeze block is chosen.

### Steps

1. Choose the final pre-deploy freeze block.
2. Read V1, V2a, and V2b member continuity up to that exact block.
3. Recompute:
   - `genesisOffset`,
   - numbered historical-member root,
   - historical member wallet + memberNumber list.
4. Confirm all 8 currently known historical member wallets are included if still true.
5. Confirm whether any new V2b member appeared after the currently derived root.
6. If a new V2b member appeared, recompute root and `genesisOffset` from the new freeze block.
7. Record final freeze block, root, `genesisOffset`, input source hash, and generation command/source.
8. Warn clearly: if V2b accepts a new member after freeze and before V3 activation, the deployed V3 root may become stale.

### Path A - Final Usable Candidate

Use this only if the final freeze can be tightly controlled.

- Freeze root/genesis immediately before deployment.
- Keep V2b unchanged until founder makes a separate activation decision.
- Do not treat V3 as live until funding, registry switch, UI, and activation are separately approved.
- If V2b creates a new member after freeze, the V3 root becomes stale and must be addressed before activation.

### Path B - Throwaway Readback Rehearsal

Use this for a disposable readback-only deployment.

- Deploy/read back only.
- Root staleness from later V2b members is acceptable.
- The contract must never be treated as the final live candidate.
- No funding, no source records, no registry switch, no activation.

Recommendation: Path A only if the freeze window is tightly controlled. Otherwise use Path B and label the deployment as throwaway readback rehearsal only.

## Exact Non-Live Deployment Sequence

No step below is authorized until founder explicitly approves broadcast.

1. Confirm deployment wallet is connected on Avalanche C-Chain `43114`.
2. Confirm deployer address is `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`.
3. Confirm owner address is `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73`.
4. Deploy `SourceRegistryV1`.
5. Read back:
   - SourceRegistryV1 address,
   - `owner()`,
   - `pendingOwner()`.
6. Deploy `MembershipSaleV3` using:
   - USDC,
   - SYN,
   - deployed SourceRegistryV1 address,
   - Vault,
   - Liquidity,
   - Operations,
   - final `genesisOffset`,
   - final numbered historical-member root,
   - final `addrCaps[9]`,
   - final `maxUsdcPerTx`,
   - final `reserveThroughSeat`,
   - final `eraCaps[9]`.
7. Read back all MembershipSaleV3 constructor/state values.
8. Transfer SourceRegistryV1 ownership to owner hardware wallet.
9. Transfer MembershipSaleV3 ownership to owner hardware wallet.
10. Owner hardware wallet accepts ownership for both.
11. Read back `owner()` and `pendingOwner()` for both.
12. Confirm zero SYN funding.
13. Confirm zero source records.
14. Confirm frontend registry still points to V2b.
15. Confirm V3 is not live.
16. If founder approves and owner flow permits, call `pause()` after readback and ownership acceptance.

## Unpaused Default Safety Decision

`MembershipSaleV3` deploys unpaused by default. With zero SYN funding and no frontend registry switch, this does not create a live public sale by itself.

Safer recommendation: after deployment/readback and owner acceptance, call `pause()` if founder explicitly approves that post-deploy operational action. This creates a clearer non-live state.

Alternative: leave unpaused, zero-funded, no source records, and not registry-wired. This is technically safe from public sale activity because the sale has no inventory and no public UI, but it is weaker operational signaling than a paused readback candidate.

Do not execute `pause()` without separate founder approval.

## Dry-Run / Simulation Plan

The existing `contracts/script/Deploy.s.sol` is V2-only and must not be used for V3 deployment/readback.

Current safe commands:

```powershell
cd contracts
forge test --match-contract RehearsalForkV3 --evm-version cancun -vv
```

Real fork rehearsal, no private key, no broadcast:

```powershell
cd contracts
$env:AVAX_RPC='<QuickNode Avalanche C-Chain HTTPS endpoint>'
forge test --match-contract RehearsalForkV3 --evm-version cancun -vv
Remove-Item Env:\AVAX_RPC
```

Future V3 dry-run script shape, not yet present:

```powershell
cd contracts
$env:AVAX_RPC='<QuickNode Avalanche C-Chain HTTPS endpoint>'
forge script script/DeployV3Readback.s.sol:DeployV3Readback --rpc-url $env:AVAX_RPC --sender 0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F -vv
Remove-Item Env:\AVAX_RPC
```

Rules for any future V3 script:

- Use environment variables only for public RPC and public signer address context.
- Never include or print private keys.
- Never echo secrets.
- Never broadcast unless founder later explicitly approves.
- Print constructor arguments before deployment simulation.
- Print readback values after simulation if possible.
- If Foundry requires signer access for the chosen script shape, stop and document the requirement before proceeding.

## V3 Non-Live Deployment/Readback Pre-Transaction Checklist

| Item | Requirement | Status |
| --- | --- | --- |
| A | GitHub commit hash | Confirm current HEAD immediately before ceremony; baseline `794189b36e762c29e1d7256d0bf41ac3bd28965d` |
| B | Contract source files frozen | Pending final check |
| C | No uncommitted files | Pending final check |
| D | Avalanche chain ID | `43114` |
| E | Deployment wallet public address | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` |
| F | Owner wallet public address | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| G | Deployment wallet AVAX gas balance | Confirm immediately before ceremony |
| H | Owner wallet AVAX gas balance for ownership acceptance | Confirm immediately before ceremony |
| I | Final freeze block | Pending final freeze |
| J | Final `genesisOffset` | Current derived value `8`; rerun at freeze block |
| K | Final numbered historical-member root | Current derived root `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329`; rerun at freeze block |
| L | Final `addrCaps[9]` | `[25000000000,1000000000,2500000000,5000000000,10000000000,15000000000,20000000000,25000000000,25000000000]` |
| M | Final `eraCaps[9]` | `[0,416875000000000000000000,1166500000000000000000000,3333500000000000000000000,6750000000000000000000000,11250000000000000000000000,15000000000000000000000000,60000000000000000000000000,150000000000000000000000000]` |
| N | Final `maxUsdcPerTx` | `25000000000` |
| O | Final `reserveThroughSeat` | `10000` |
| P | SourceRegistryV1 constructor args | None |
| Q | MembershipSaleV3 constructor args | See full table below |
| R | V2b still frontend live target | Must remain yes |
| S | V3 SourceRegistry address | Pending until deployment/readback |
| T | V3 MembershipSale address | Pending until deployment/readback |
| U | Initial funding | Zero |
| V | Source records | None |
| W | Registry switch | No |
| X | Public UI | No |
| Y | Activation | No |
| Z | Founder approval before any broadcast | Required |

## MembershipSaleV3 Constructor Argument Table

| Order | Parameter | Value / Source |
| --- | --- | --- |
| 1 | `usdc_` | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| 2 | `syn_` | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| 3 | `sourceRegistry_` | Deployed SourceRegistryV1 address after readback |
| 4 | `vault_` | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| 5 | `liquidity_` | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| 6 | `operations_` | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| 7 | `genesisOffset_` | Final freeze value; current derived value `8` |
| 8 | `v1MemberRoot_` | Final numbered root; current derived root `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329` |
| 9 | `addrCaps_` | `[25000000000,1000000000,2500000000,5000000000,10000000000,15000000000,20000000000,25000000000,25000000000]` |
| 10 | `maxUsdcPerTx_` | `25000000000` |
| 11 | `reserveThroughSeat_` | `10000` |
| 12 | `eraCaps_` | `[0,416875000000000000000000,1166500000000000000000000,3333500000000000000000000,6750000000000000000000000,11250000000000000000000000,15000000000000000000000000,60000000000000000000000000,150000000000000000000000000]` |

## Remaining Broadcast Blockers

- Explicit founder approval for broadcast.
- Final freeze block selected and recorded.
- Root/genesis recomputed at freeze block.
- No uncommitted files.
- Gas balances rechecked.
- SourceRegistryV1 deployed/read back first if proceeding beyond dry run.
- MembershipSaleV3 constructor args reviewed in exact order.
- External review final signoff.
- Second static analyzer or accepted substitute.
- Repeatable Slither / payout-escrow disposition.
- Legal/product signoff.
- Stable full Foundry run in CI/Linux/WSL/reviewer environment.