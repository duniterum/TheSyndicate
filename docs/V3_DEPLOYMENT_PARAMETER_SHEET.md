# V3 Deployment Parameter Sheet

Status: NON-LIVE PREPARATION ONLY

This sheet prepares readback-ready parameters for a future V3 deployment rehearsal or deployment decision. It does not authorize deployment, funding, unpause, frontend activation, registry switch, public V3 buy UI, or any private-key/broadcast action.

## Boundaries

- V3 is not deployed.
- V3 is not live.
- No frontend registry switch is authorized.
- V2b remains the current live buy target.
- No funding unless separately approved.
- No unpause unless separately approved.
- No public V3 buy UI unless separately approved after deployment/readback/legal/product signoff.
- No private keys are required for this document.

## Chain

| Field | Value |
| --- | --- |
| Network | Avalanche C-Chain |
| Chain ID | `43114` |

## Current Canonical Addresses

| Role | Address / status |
| --- | --- |
| USDC | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| SYN | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| Vault wallet | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| Liquidity wallet | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| Operations wallet | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| V1 historical sale / proof source | `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` |
| V2a historical sale | `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48` |
| V2b current live buy target | `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` |
| Archive1155 | `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` |
| V3 SourceRegistryV1 | `PENDING` / no address |
| V3 MembershipSaleV3 | `PENDING` / no address |

## Deployment Candidates

| Candidate | Source file | Status |
| --- | --- | --- |
| SourceRegistryV1 | `contracts/src/SourceRegistryV1.sol` | Candidate / not deployed / not live |
| MembershipSaleV3 | `contracts/src/MembershipSaleV3.sol` | Candidate / not deployed / not live |

## Hardware Wallet Addresses

These public addresses must be supplied and recorded before any deployment decision.

| Role | Value |
| --- | --- |
| Deployment hardware-wallet public address | `TBD` |
| Owner hardware-wallet public address | `TBD` |
| Optional backup hardware-wallet public address | `TBD` |

Preferred posture: deployment and owner wallets should be dedicated hardware wallets. The owner address should not be a Replit wallet, hot browser wallet, personal daily wallet, Vault wallet, Liquidity wallet, or Operations wallet unless separately approved and documented.

## SourceRegistryV1 Constructor

`SourceRegistryV1` has no external constructor arguments.

Initial owner:

- `owner()` is the deploying address at construction.
- If final owner differs from deployer, use Ownable2Step:
  - `transferOwnership(ownerHardwareWallet)`
  - owner hardware wallet calls `acceptOwnership()`

Required readback:

- deployed address
- `owner()`
- `pendingOwner()`

## MembershipSaleV3 Constructor Parameters

| Parameter | Required value / status |
| --- | --- |
| `usdc` | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| `syn` | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| `sourceRegistry` | Deployed and readback-verified `SourceRegistryV1` address, currently `TBD` |
| `vault` | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| `liquidity` | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| `operations` | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| `genesisOffset` | `TBD` - freeze from Holder Index / V1-V2a-V2b continuity before deployment |
| `v1MemberRoot` | `TBD` - must be a numbered historical-member proof root if enabled; raw SYN balance alone is not historical member identity |
| `addrCaps[9]` | Candidate rehearsal values below; final values require founder signoff |
| `maxUsdcPerTx` | Candidate rehearsal value below; final value requires founder signoff |
| `reserveThroughSeat` | Candidate rehearsal value below; final value requires founder signoff |
| `eraCaps[9]` | Candidate rehearsal values below; final values require founder signoff |

## Current Candidate Rehearsal Values

These values are used by the current V3 fork rehearsal shape. They are not an activation instruction and must be final-frozen before any mainnet deployment.

### `addrCaps[9]`

| Index | Value |
| ---: | ---: |
| 0 | `25000000000` |
| 1 | `1000000000` |
| 2 | `2500000000` |
| 3 | `5000000000` |
| 4 | `10000000000` |
| 5 | `15000000000` |
| 6 | `20000000000` |
| 7 | `25000000000` |
| 8 | `25000000000` |

### Other scalar values

| Parameter | Candidate value |
| --- | ---: |
| `maxUsdcPerTx` | `25000000000` |
| `reserveThroughSeat` | `10000` |

### `eraCaps[9]`

| Index | Candidate value |
| ---: | ---: |
| 0 | `0` |
| 1 | `416875000000000000000000` |
| 2 | `1166500000000000000000000` |
| 3 | `3333500000000000000000000` |
| 4 | `6750000000000000000000000` |
| 5 | `11250000000000000000000000` |
| 6 | `12000000000000000000000000` |
| 7 | `60000000000000000000000000` |
| 8 | `150000000000000000000000000` |

## Deterministic Era Pricing

The price schedule is contract-fixed in `MembershipSaleV3._eraParams`. Constructor caps do not change these rates.

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

## Post-Deploy Readback Checklist

Before any funding or activation decision, read back:

- SourceRegistryV1 address
- MembershipSaleV3 address
- `owner()`
- `pendingOwner()`
- `USDC()`
- `SYN()`
- `VAULT()`
- `LIQUIDITY()`
- `OPERATIONS()`
- `SOURCE_REGISTRY()`
- `GENESIS_OFFSET()`
- `V1_MEMBER_ROOT()`
- `paused()`
- `currentEra()`
- `memberCount()`
- `availableSyn()`
- `sellableSynForNextSeat()`
- `MAX_USDC_PER_TX()`
- `RESERVE_THROUGH_SEAT()`
- `eraSynCap(1..9)`
- `maxUsdcPerAddressPerEra(1..9)`
- source default status behavior
- rescue restrictions for USDC and SYN
- frontend registry still points to V2b
- `/v3-preview` remains read-only and candidate-only
- V3 still not live

## Remaining Blockers

- External review final signoff
- Second analyzer
- Repeatable Slither / payout-escrow disposition
- Hardware-wallet deployment and owner addresses
- Legal/product signoff
- Clean full Foundry run in stable CI/Linux/WSL/reviewer environment
- Final freeze of `genesisOffset`, numbered historical-member proof root, `addrCaps`, `eraCaps`, `maxUsdcPerTx`, and `reserveThroughSeat`

