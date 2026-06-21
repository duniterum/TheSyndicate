# V3 Deployment Parameter Sheet

Status: DEPLOYED / OWNER ACCEPTED / V2B PAUSED / V3 FUNDED / FRONTEND BUY TARGET / SOURCE RECORDS INACTIVE

This sheet records the completed deployment/readback posture plus the later V2b pause, V3 funding, and frontend buy-target wiring. It does not authorize recovery, additional funding, pause/unpause, source-record creation, referral UI, claim UI, or any private-key/broadcast action. The readback log is `docs/V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md`. The next boundary plan is `docs/V3_NEXT_BOUNDARY_FUNDING_AND_ACTIVATION_PLAN.md`.

## Boundaries

- V3 SourceRegistryV1 and MembershipSaleV3 are deployed and owner-accepted.
- MembershipSaleV3 is funded with 7,000,000 SYN, unpaused, and selected as the frontend approval/quote/buy target.
- Public V3 buys use zero sourceId. No source records exist.
- SourceRegistryV1 is not activated for public source/referral use.
- V2b is paused on-chain and retained as historical proof plus recovery boundary.
- No additional funding unless separately approved. The recorded V3 funding transaction transferred 7,000,000 SYN from `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` to MembershipSaleV3.
- No unpause unless separately approved.
- No public source/referral UI or claim UI unless separately approved after source-record policy, legal/product signoff, and readback.
- No private keys are required for this document.

## Chain

| Field | Value |
| --- | --- |
| Network | Avalanche C-Chain |
| Chain ID | `43114` |

## Current Canonical Addresses

These addresses are derived from repository truth, V2b deployed-lineage parameters, and the current fork rehearsal constants. They must remain aligned with `src/lib/syndicate-config.ts`, `contracts/test/RehearsalForkV3.t.sol`, and deployed sale readbacks.

| Role | Address / status |
| --- | --- |
| USDC | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |
| SYN | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |
| Vault wallet | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |
| Liquidity wallet | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |
| Operations wallet | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |
| V1 historical sale / proof source | `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` |
| V2a historical sale | `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48` |
| V2b paused historical source | `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b` |
| Archive1155 | `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` |
| V3 SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` - deployed / owner accepted / no source records / referral UI inactive |
| V3 MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` - deployed / owner accepted / funded with 7,000,000 SYN / current frontend buy target / public buys use zero sourceId |

## Deployment Candidates

| Candidate | Source file | Status |
| --- | --- | --- |
| SourceRegistryV1 | `contracts/src/SourceRegistryV1.sol` | Deployed / owner accepted / no source records / referral UI inactive |
| MembershipSaleV3 | `contracts/src/MembershipSaleV3.sol` | Deployed / owner accepted / funded with 7,000,000 SYN / current frontend buy target / zero sourceId public buys |

## Hardware Wallet Addresses

These are public addresses only. No private keys, seed phrases, Ledger recovery words, signer exports, or password manager secrets belong in this repository.

| Role | Address | Status |
| --- | --- | --- |
| Deployment hardware wallet | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` | Supplied by founder and sanity-checked |
| Final owner hardware wallet | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` | Supplied by founder and sanity-checked |
| Backup hardware wallet | TBD / optional | Not required for first non-live deployment/readback |

Read-only Avalanche C-Chain sanity check:

| Check | Deployment wallet | Owner wallet |
| --- | --- | --- |
| Valid nonzero EVM address | Yes | Yes |
| Distinct from each other | Yes | Yes |
| Code at address | Empty EOA-like address | Empty EOA-like address |
| AVAX balance at readback | `1.472522622265013989 AVAX` | `0.499763025977667064 AVAX` |
| Not equal to USDC, SYN, V1, V2a, V2b, Archive1155, Vault, Liquidity, or Operations | Yes | Yes |

Founder direction: deployment wallet and owner wallet are distinct. Ownership flow remains deployer temporary owner -> transfer ownership to owner hardware wallet -> owner accepts before funding, source records, unpause/activation, or registry switch.

## Founder Inputs Required Before Any Transaction

The founder must provide only public wallet addresses and public parameter decisions. Never paste a seed phrase, private key, Ledger recovery words, signer export, screenshot of recovery words, or password manager secret.

| # | Input | Current status |
| --- | --- | --- |
| 1 | Deployment hardware-wallet public address | Supplied: `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` |
| 2 | Owner hardware-wallet public address | Supplied: `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |
| 3 | Optional backup hardware-wallet public address | TBD / optional |
| 4 | Whether deployer and owner are distinct or intentionally same | Confirmed distinct |
| 5 | Final `genesisOffset` | Generated artifact value: `8` from V1 + V2a + V2b historical lineage as of freeze block `88496414`; must be rerun if V2b records more members before V3 deployment |
| 6 | Final numbered historical-member proof root | Generated artifact value: `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329`; input hash `sha256:72541a446315f30d4b51297a570530d607970700d9b3165050359edfe4669765`; V3 leaf format is numbered wallet + member number, not address-only |
| 7 | Whether all 8 existing founder/family wallets are included in numbered historical-member proofs | All 8 current historical member wallets from V1/V2a/V2b are included; the founder/family label itself is not independently provable from chain data |
| 8 | Final `addrCaps[9]` | Derived from deployed V2b lineage; ready to freeze subject final pre-transaction readback |
| 9 | Final `eraCaps[9]` | Derived from deployed V2b lineage and live V2b readback; ready to freeze subject final pre-transaction readback |
| 10 | Final `maxUsdcPerTx` | Derived from deployed V2b lineage: `25000000000` USDC units ($25,000) |
| 11 | Final `reserveThroughSeat` | Derived from deployed V2b lineage: `10000` |
| 12 | Recorded V3 funding | `0x04b3baf507d2908bff3b561207407cd12d8469a5785bcf90cd4dccaaea5cb7e2` transferred 7,000,000 SYN from `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8` to MembershipSaleV3 |
| 13 | V3 source/referral systems remain inactive | Confirmed yes |
| 14 | Frontend direct-buy target | MembershipSaleV3 with zero sourceId public buys |
| 15 | No source records at deployment time | Confirmed yes |
| 16 | Ownership transfer timing | Confirmed: deployer temporary owner -> transfer to owner hardware wallet -> owner accepts before funding or activation |

## Historical Member Derivation

V3 historical member identity is proven by numbered historical-member proofs. Raw SYN balance alone is not historical member identity.

Current derivation status:

- QuickNode readbacks succeeded for chain ID, wallet code/balances, and deployed sale getters.
- QuickNode log scanning was rejected by the RPC provider, so the historical member roster was derived through a public Avalanche RPC event scan and cross-checked against V2b `memberCount`.
- Readiness scan / freeze block: `88496414`.
- V1 logs: `5`; V2a logs: `3`; V2b logs: `6`.
- Distinct first-seen historical members: `8`.
- V2b on-chain `memberCount`: `8`.
- Generated artifact V3 `genesisOffset`: `8`.
- Generated numbered root: `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329`.
- Generator: `contracts/script/generate-v3-historical-members-root.mjs`.
- Input artifact: `contracts/script/input/v3-historical-members.freeze-88496414.json`.
- Output artifact: `contracts/script/output/v3-historical-members-root.freeze-88496414.json`.
- Input hash: `sha256:72541a446315f30d4b51297a570530d607970700d9b3165050359edfe4669765`.
- Generated root matches previously documented root: yes.
- Leaf format: `keccak256(bytes.concat(keccak256(abi.encode(wallet, memberNumber))))`.
- Leaf encoding: `['address','uint256']`.

| Member # | Wallet | Source | First block | First transaction |
| --- | --- | --- | --- | --- |
| 1 | `0x244531C571966f90f4849e03a507543d90f9C721` | V1 | `87158947` | `0x959bf5f6af6c697aab2fe008a3ee9d5a1596375a43de93ecd51ad32bee9a8d07` |
| 2 | `0x3488857b003104e2B08A1D198f8a23BFF28B0045` | V1 | `87216573` | `0xab4cc6b681087a808d62ff0c9abb1c5f63bb9bdcbf834561fde1f6ba7e0e89bd` |
| 3 | `0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0` | V2a | `88105075` | `0x46b38df9403fbb1b1e0f78b2def6d1d83f34ed18db1a055690db2d9290dae0ae` |
| 4 | `0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a` | V2a | `88151112` | `0xa0acd4ff586623be4d2922b1f3b081e77577e901e082986d00114a3295df8f54` |
| 5 | `0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD` | V2a | `88151239` | `0xb1e90d6861811f26c359500a25dac8c8e36275131f8b172ef22a697ba74379d2` |
| 6 | `0x8DeB56b4db62f48A6E1bC226220E24845B592Cb9` | V2b | `88204831` | `0xcfba3dcc7dd0ac8cb76dbb1f9db2e7b94365ba098ad58dd8c509946be63c62dd` |
| 7 | `0x3FF01A0c3e70101bFb1dBb3742e135E7eD9e894F` | V2b | `88205043` | `0xc0c7caf0cd7ade2091423f7af5fc3cd3cb526bd5f15e0ec3715b2a2c094e6639` |
| 8 | `0xAb87e74Ff69Ee0B6C1A73B884a80b737988DE081` | V2b | `88205651` | `0x2eb7ade5dfe9f76c3eb6f073bfef93f176a81c91ce90ed2270a5a5329df7e1e5` |

V2b is now paused and retained as historical proof plus recovery boundary. The deployed V3 constructor uses the frozen roster/root recorded here.

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

The constructor order in `contracts/src/MembershipSaleV3.sol` is:

```solidity
constructor(
  address usdc_,
  address syn_,
  address sourceRegistry_,
  address vault_,
  address liquidity_,
  address operations_,
  uint256 genesisOffset_,
  bytes32 v1MemberRoot_,
  uint256[9] memory addrCaps_,
  uint256 maxUsdcPerTx_,
  uint256 reserveThroughSeat_,
  uint256[9] memory eraCaps_
)
```

| Parameter | Value | Status |
| --- | --- | --- |
| `usdc_` | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` | Canonical Avalanche USDC |
| `syn_` | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` | Canonical SYN |
| `sourceRegistry_` | `0x780013bB358be6be95b401901264FC7c22a595a6` | SourceRegistryV1 deployed/readback green |
| `vault_` | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` | Canonical Vault wallet |
| `liquidity_` | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` | Canonical Liquidity wallet |
| `operations_` | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` | Canonical Operations wallet |
| `genesisOffset_` | Generated artifact value: `8` | Derived from V1 + V2a + V2b first-seen historical lineage as of freeze block `88496414`; rerun if V2b changes |
| `v1MemberRoot_` | Generated artifact value: `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329` | V3 numbered historical-member root from committed artifact; rerun if V2b changes |
| `addrCaps_` | `[25000000000, 1000000000, 2500000000, 5000000000, 10000000000, 15000000000, 20000000000, 25000000000, 25000000000]` | Derived from deployed V2b lineage |
| `maxUsdcPerTx_` | `25000000000` | Derived from deployed V2b lineage |
| `reserveThroughSeat_` | `10000` | Derived from deployed V2b lineage |
| `eraCaps_` | `[0, 416875000000000000000000, 1166500000000000000000000, 3333500000000000000000000, 6750000000000000000000000, 11250000000000000000000000, 15000000000000000000000000, 60000000000000000000000000, 150000000000000000000000000]` | Derived from deployed V2b lineage and live V2b readback |

## Derived Deployed-Lineage Values

### Address Caps

`addrCaps[9]` is derived from deployed V2b lineage, V2b constructor records, and live V2b readback:

```text
[
  25000000000,
  1000000000,
  2500000000,
  5000000000,
  10000000000,
  15000000000,
  20000000000,
  25000000000,
  25000000000
]
```

### Scalar Limits

| Parameter | Value | Source |
| --- | --- | --- |
| `maxUsdcPerTx` | `25000000000` | Deployed V2b lineage and live V2b readback |
| `reserveThroughSeat` | `10000` | Deployed V2b lineage and live V2b readback |

### Era Caps

The V3 candidate now matches the deployed V2b lineage. Era I is passed as `0` in constructor records; the contract exposes Era I as unlimited (`type(uint256).max`).

| Era | Deployed V2b lineage cap | Current V3 candidate cap | Human decoded SYN amount | Source |
| --- | --- | --- | --- | --- |
| I | `0` constructor input / unlimited on-chain | `0` constructor input | Unlimited by contract rule | V2b constructor records + live readback |
| II | `416875000000000000000000` | `416875000000000000000000` | 416,875 SYN | V2b constructor records + live readback |
| III | `1166500000000000000000000` | `1166500000000000000000000` | 1,166,500 SYN | V2b constructor records + live readback |
| IV | `3333500000000000000000000` | `3333500000000000000000000` | 3,333,500 SYN | V2b constructor records + live readback |
| V | `6750000000000000000000000` | `6750000000000000000000000` | 6,750,000 SYN | V2b constructor records + live readback |
| VI | `11250000000000000000000000` | `11250000000000000000000000` | 11,250,000 SYN | V2b constructor records + live readback |
| VII | `15000000000000000000000000` | `15000000000000000000000000` | 15,000,000 SYN | V2b constructor records + live readback |
| VIII | `60000000000000000000000000` | `60000000000000000000000000` | 60,000,000 SYN | V2b constructor records + live readback |
| IX | `150000000000000000000000000` | `150000000000000000000000000` | 150,000,000 SYN | V2b constructor records + live readback |

The previous V3 fork/test candidate used `12,000,000 SYN` for Era VII. No canonical founder-approved V3 policy change was found for that lower cap, so the candidate has been aligned back to deployed sale lineage.
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

## Parameter Consistency Check

| Check | Status | Notes |
| --- | --- | --- |
| Deployment and owner wallet distinct | Passed | Founder supplied distinct addresses |
| Deployment/owner wallet not forbidden protocol addresses | Passed | Neither equals USDC, SYN, V1, V2a, V2b, Archive1155, Vault, Liquidity, or Operations |
| Vault, Liquidity, and Operations distinct | Passed | Canonical route wallets are distinct |
| Frontend direct-buy target | Passed | MembershipSaleV3 is the current approval/quote/buy target; public buys use zero sourceId |
| V3 SourceRegistry and MembershipSale address posture | Passed | SourceRegistry has no source records; MembershipSaleV3 is funded and selected for direct buys |
| Recorded V3 funding | Passed | 7,000,000 SYN funded by `0x04b3baf507d2908bff3b561207407cd12d8469a5785bcf90cd4dccaaea5cb7e2` |
| No source records at deployment | Passed | Founder direction is no records before separate approval |
| Historical proof root format | Passed by artifact and Foundry test | V3 requires numbered wallet + member number leaves, not address-only leaves |
| Historical member roster/root currentness | Conditional | Generated root covers 8 historical members as of freeze block `88496414`; rerun if V2b records new members before deploy |
| `addrCaps[9]` | Ready | Derived from deployed V2b lineage |
| `maxUsdcPerTx` | Ready | Derived from deployed V2b lineage |
| `reserveThroughSeat` | Ready | Derived from deployed V2b lineage |
| `eraCaps[9]` | Ready | Derived from deployed V2b lineage and live V2b readback |
| MembershipSaleV3 default pause state | Recorded | `paused()` is false by deployment default; pause is deferred intentionally. Current safety boundary is zero sourceId public buys, no source records, no referral UI, and no claim UI. |

## Current Safety Rule For Unpaused Direct-Buy State

`MembershipSaleV3` does not pause itself in the constructor. The deployed contract currently has `paused() = false`; pause is deferred intentionally. The current safety boundary is:

- recorded SYN funding of 7,000,000 SYN, no additional funding without approval,
- no USDC funding,
- direct frontend buys use zero sourceId,
- ownership transfer/acceptance before any funding or activation decision,
- pause remains available as a later owner action, but is intentionally deferred by founder decision,
- no source records, referral UI, or claim UI until separately approved.

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
- frontend direct-buy target is MembershipSaleV3
- `/v3-preview` remains read-only and candidate/source-only
- SourceRegistryV1 still has no source records

## Final Non-Live Deployment/Readback Checklist

This checklist is preparation only. It is not permission to deploy.

1. Confirm GitHub main is clean and matches the reviewed commit.
2. Confirm V3 direct-buy address is configured only for zero-source public buys.
3. Confirm SourceRegistryV1 bytecode/constructor shape.
4. Deploy SourceRegistryV1 only if separately approved.
5. Read back SourceRegistryV1 address, owner, pendingOwner.
6. Transfer SourceRegistryV1 ownership to owner hardware wallet if separately approved.
7. Owner hardware wallet accepts SourceRegistryV1 ownership.
8. Rerun historical-member root generation at the final freeze block if V2b is still live.
9. Verify final era caps against deployed-lineage values before preparing MembershipSaleV3 constructor args.
10. Prepare MembershipSaleV3 constructor args in exact contract order.
11. Deploy MembershipSaleV3 only if separately approved.
12. Read back MembershipSaleV3 constructor constants.
13. Transfer MembershipSaleV3 ownership to owner hardware wallet if separately approved.
14. Owner hardware wallet accepts MembershipSaleV3 ownership before any funding/activation.
15. Recorded V3 funding is 7,000,000 SYN; keep no additional SYN funding unless separately approved.
16. Keep no source records unless separately approved.
17. Keep public buys constrained to MembershipSaleV3 with zero sourceId.
18. Keep source/referral UI disabled / candidate-only.
19. If owner flow permits and founder approves, pause MembershipSaleV3 immediately after readback.
20. Record deployment/readback evidence in docs before any next decision.

## Remaining Blockers

### Non-Live Deployment/Readback Transaction Status

- Completed: SourceRegistryV1 deployed/readback green and owner accepted.
- Completed for deployment/readback: final freeze/readback used `genesisOffset = 8` and root `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329`.
- Completed/recorded: MembershipSaleV3 deployed/readback green, owner accepted, `paused() = false`, funded with 7,000,000 SYN, no source records, and selected as the direct frontend buy target with zero sourceId.

### Blocks Additional Funding, Source Activation, or Public Referral/Claim UI

- External review final signoff.
- Second static analyzer or documented reviewer-accepted substitute.
- Repeatable Slither / payout-escrow disposition.
- Any additional funding ceremony; the 7,000,000 SYN V3 funding transaction is recorded, but no further funding is authorized.
- Legal/product signoff.
- Clean full Foundry run in stable CI/Linux/WSL/reviewer environment.
- Source-record policy, read-only verification, and referral/claim activation plan approval.

### Optional / Process Items

- Backup hardware-wallet public address remains TBD / optional.
- Deterministic committed V3 numbered-root generator and freeze-block proof artifact exist and were used for deployment; V2b is now paused.

