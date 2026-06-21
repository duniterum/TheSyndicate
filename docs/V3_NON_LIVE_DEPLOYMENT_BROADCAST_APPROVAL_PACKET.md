# V3 Non-Live Deployment Broadcast Approval Packet

Status: FOUNDER APPROVAL PACKET / NO BROADCAST YET
> Current status update (2026-06-21): the non-live V3 deployment/readback ceremony was completed and recorded in `docs/V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md`. SourceRegistryV1 is deployed non-live at `0x780013bB358be6be95b401901264FC7c22a595a6`; MembershipSaleV3 is deployed non-live at `0x2A6cFc76906e758B934209AFf5A163c9bC20132E`. Ownership was accepted by `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73`. MembershipSaleV3 is zero-funded, not registry-wired, not activated, and not live. `paused()` is false by deployment default; pause is deferred intentionally. No funding is authorized.


Prepared from base GitHub commit: `d87d68ac668f7d388da666dcc93e73f15a296695` (`Create V3 historical member proof artifact`).

This packet prepares a possible NON-LIVE V3 deployment/readback ceremony. It does not authorize deployment, broadcast, funding, unpause, frontend registry switch, public V3 buy UI, source-record creation, or activation.

Founder approval required before broadcast: YES / NO

## Hard Boundaries

- No deployment unless founder explicitly approves the broadcast ceremony.
- No broadcast from this document alone.
- No private keys, seed phrases, Ledger recovery words, signer exports, screenshots of recovery words, or secrets in chat, docs, scripts, or logs.
- V3 deployment/readback only.
- Zero SYN funding.
- No USDC funding.
- No source records.
- No frontend registry switch.
- No public V3 UI.
- No activation.
- V2b remains the live buy target.
- Deployment wallet is temporary owner.
- Ownership transfers to owner hardware wallet.
- Owner accepts before any future funding, source records, unpause, activation, or registry switch.
- `pause()` may be performed only if founder explicitly approves that pause transaction.

## Final Freeze Check

Read-only scan result:

| Item | Result |
| --- | --- |
| Current scan block | `88499582` |
| Prior freeze block compared against | `88496414` |
| Log source | Public Avalanche RPC for historical log scan; QuickNode was available but its plan rejected large `eth_getLogs` ranges |
| V1 logs | `5` |
| V2a logs | `3` |
| V2b logs | `6` |
| V2b logs after block `88496414` | `0` |
| Distinct first-seen members | `8` |
| V2b `memberCount()` | `8` |
| Roster changed since `88496414` | No |
| `genesisOffset` | `8` |
| Final root | `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329` |
| Input artifact | `contracts/script/input/v3-historical-members.freeze-88496414.json` |
| Input artifact SHA-256 | `72541a446315f30d4b51297a570530d607970700d9b3165050359edfe4669765` |
| Output artifact | `contracts/script/output/v3-historical-members-root.freeze-88496414.json` |
| Output artifact SHA-256 | `0aec9b678678256710332d8f7f879986e1ba1d6fe324d0df5c21f546c56a220a` |
| Generator | `contracts/script/generate-v3-historical-members-root.mjs` |

Final-freeze interpretation: the committed proof artifact remains current at block `88499582` because no new V2b purchase/member appeared after block `88496414`. If a new V2b member appears before an actual broadcast, stop and regenerate the input/output artifacts before using MembershipSaleV3 constructor parameters.

## Historical Member Roster

| Member # | Wallet | Source | First block | First transaction | Log index |
| --- | --- | --- | --- | --- | --- |
| 1 | `0x244531C571966f90f4849e03a507543d90f9C721` | V1 | `87158947` | `0x959bf5f6af6c697aab2fe008a3ee9d5a1596375a43de93ecd51ad32bee9a8d07` | `13` |
| 2 | `0x3488857b003104e2B08A1D198f8a23BFF28B0045` | V1 | `87216573` | `0xab4cc6b681087a808d62ff0c9abb1c5f63bb9bdcbf834561fde1f6ba7e0e89bd` | `45` |
| 3 | `0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0` | V2a | `88105075` | `0x46b38df9403fbb1b1e0f78b2def6d1d83f34ed18db1a055690db2d9290dae0ae` | `6` |
| 4 | `0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a` | V2a | `88151112` | `0xa0acd4ff586623be4d2922b1f3b081e77577e901e082986d00114a3295df8f54` | `35` |
| 5 | `0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD` | V2a | `88151239` | `0xb1e90d6861811f26c359500a25dac8c8e36275131f8b172ef22a697ba74379d2` | `6` |
| 6 | `0x8DeB56b4db62f48A6E1bC226220E24845B592Cb9` | V2b | `88204831` | `0xcfba3dcc7dd0ac8cb76dbb1f9db2e7b94365ba098ad58dd8c509946be63c62dd` | `6` |
| 7 | `0x3FF01A0c3e70101bFb1dBb3742e135E7eD9e894F` | V2b | `88205043` | `0xc0c7caf0cd7ade2091423f7af5fc3cd3cb526bd5f15e0ec3715b2a2c094e6639` | `6` |
| 8 | `0xAb87e74Ff69Ee0B6C1A73B884a80b737988DE081` | V2b | `88205651` | `0x2eb7ade5dfe9f76c3eb6f073bfef93f176a81c91ce90ed2270a5a5329df7e1e5` | `7` |

## Hardware Wallet Ceremony Check

| Role | Address | Code | AVAX balance at readback | Expected use |
| --- | --- | --- | --- | --- |
| Deployment hardware wallet | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` | `0x` | `1.472522622265013989 AVAX` | Deploy SourceRegistryV1, deploy MembershipSaleV3, initiate two ownership transfers |
| Owner hardware wallet | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` | `0x` | `0.499763025977667064 AVAX` | Accept ownership for SourceRegistryV1 and MembershipSaleV3 |

Hardware-wallet interpretation: both addresses are EOA-like (`code = 0x`). Both have AVAX. Final gas sufficiency still depends on live gas conditions at broadcast time; confirm in MetaMask before each transaction.

## Constructor Argument Packet

### A. Pre-SourceRegistry Deployment Packet

Contract: `contracts/src/SourceRegistryV1.sol`

Constructor args: none.

Expected initial owner: deployment hardware wallet, because `Ownable2Step` sets `owner()` to `msg.sender`.

Read back immediately after deployment:

```text
SourceRegistryV1 address: <DEPLOYED_SOURCE_REGISTRY_ADDRESS>
owner(): 0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F
pendingOwner(): 0x0000000000000000000000000000000000000000
```

Then, if founder approves ownership transfer:

```text
transferOwnership(0x88EC79AF0d5A2F3b83022A1770c645506803Dd73)
```

Owner hardware wallet then accepts:

```text
acceptOwnership()
```

Expected after acceptance:

```text
owner(): 0x88EC79AF0d5A2F3b83022A1770c645506803Dd73
pendingOwner(): 0x0000000000000000000000000000000000000000
```

### B. Post-SourceRegistry MembershipSaleV3 Packet

Contract: `contracts/src/MembershipSaleV3.sol`

Replace `<DEPLOYED_SOURCE_REGISTRY_ADDRESS>` with the actual SourceRegistryV1 address read back after deployment. Do not guess it.

Constructor order:

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

Constructor values:

```text
usdc_ = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
syn_ = 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170
sourceRegistry_ = <DEPLOYED_SOURCE_REGISTRY_ADDRESS>
vault_ = 0x205DdC8921A4C60106930eE35e1F395c8D13f464
liquidity_ = 0xa9b072db8DcDbb470235204B69D37275d74a2e25
operations_ = 0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80
genesisOffset_ = 8
v1MemberRoot_ = 0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329
addrCaps_ = [25000000000,1000000000,2500000000,5000000000,10000000000,15000000000,20000000000,25000000000,25000000000]
maxUsdcPerTx_ = 25000000000
reserveThroughSeat_ = 10000
eraCaps_ = [0,416875000000000000000000,1166500000000000000000000,3333500000000000000000000,6750000000000000000000000,11250000000000000000000000,15000000000000000000000000,60000000000000000000000000,150000000000000000000000000]
```

Readable constructor tuple:

```text
(
  "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  "0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  "<DEPLOYED_SOURCE_REGISTRY_ADDRESS>",
  "0x205DdC8921A4C60106930eE35e1F395c8D13f464",
  "0xa9b072db8DcDbb470235204B69D37275d74a2e25",
  "0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80",
  8,
  "0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329",
  [25000000000,1000000000,2500000000,5000000000,10000000000,15000000000,20000000000,25000000000,25000000000],
  25000000000,
  10000,
  [0,416875000000000000000000,1166500000000000000000000,3333500000000000000000000,6750000000000000000000000,11250000000000000000000000,15000000000000000000000000,60000000000000000000000000,150000000000000000000000000]
)
```

## Broadcast Steps If Founder Later Approves

### SourceRegistryV1

1. Open Remix.
2. Open `contracts/src/SourceRegistryV1.sol`.
3. Compile with Solidity `0.8.24` using the repository's optimizer posture unless reviewer says otherwise.
4. Confirm MetaMask is connected to Avalanche C-Chain (`43114`).
5. Confirm signer is deployment hardware wallet `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`.
6. Deploy SourceRegistryV1.
7. Read back address, `owner()`, and `pendingOwner()`.
8. Stop and record evidence.

### MembershipSaleV3

Only continue after SourceRegistryV1 readback is complete.

1. Open `contracts/src/MembershipSaleV3.sol`.
2. Compile with Solidity `0.8.24` using the repository's optimizer posture unless reviewer says otherwise.
3. Replace `<DEPLOYED_SOURCE_REGISTRY_ADDRESS>` with the exact SourceRegistryV1 address from readback.
4. Confirm signer is deployment hardware wallet `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`.
5. Deploy MembershipSaleV3 with the exact constructor order above.
6. Do not fund.
7. Do not create source records.
8. Do not switch frontend registry.
9. Do not activate UI.
10. Read back all values in the sheet below.
11. Stop and record evidence.

### Ownership Transfer / Acceptance

For each contract, only if founder approves ownership transfer transactions:

1. Deployment hardware wallet calls `transferOwnership(0x88EC79AF0d5A2F3b83022A1770c645506803Dd73)`.
2. Read back `pendingOwner()`.
3. Owner hardware wallet calls `acceptOwnership()`.
4. Read back `owner()` and `pendingOwner()`.
5. Stop and record evidence.

## Readback Sheet

### SourceRegistryV1

| Check | Expected | Actual |
| --- | --- | --- |
| Deployed address | `<DEPLOYED_SOURCE_REGISTRY_ADDRESS>` |  |
| `owner()` before transfer | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` |  |
| `pendingOwner()` before transfer | `0x0000000000000000000000000000000000000000` |  |
| `pendingOwner()` after transfer | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |  |
| `owner()` after acceptOwnership | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |  |
| `pendingOwner()` after acceptOwnership | `0x0000000000000000000000000000000000000000` |  |

### MembershipSaleV3

| Check | Expected | Actual |
| --- | --- | --- |
| Deployed address | `<DEPLOYED_MEMBERSHIP_SALE_V3_ADDRESS>` |  |
| `owner()` before transfer | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` |  |
| `pendingOwner()` after transfer | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |  |
| `owner()` after acceptOwnership | `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73` |  |
| `pendingOwner()` after acceptOwnership | `0x0000000000000000000000000000000000000000` |  |
| `USDC()` | `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E` |  |
| `SYN()` | `0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170` |  |
| `VAULT()` | `0x205DdC8921A4C60106930eE35e1F395c8D13f464` |  |
| `LIQUIDITY()` | `0xa9b072db8DcDbb470235204B69D37275d74a2e25` |  |
| `OPERATIONS()` | `0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80` |  |
| `SOURCE_REGISTRY()` | `<DEPLOYED_SOURCE_REGISTRY_ADDRESS>` |  |
| `GENESIS_OFFSET()` | `8` |  |
| `V1_MEMBER_ROOT()` | `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329` |  |
| `MAX_USDC_PER_TX()` | `25000000000` |  |
| `RESERVE_THROUGH_SEAT()` | `10000` |  |
| `maxUsdcPerAddressPerEra(1)` | `25000000000` |  |
| `maxUsdcPerAddressPerEra(2)` | `1000000000` |  |
| `maxUsdcPerAddressPerEra(3)` | `2500000000` |  |
| `maxUsdcPerAddressPerEra(4)` | `5000000000` |  |
| `maxUsdcPerAddressPerEra(5)` | `10000000000` |  |
| `maxUsdcPerAddressPerEra(6)` | `15000000000` |  |
| `maxUsdcPerAddressPerEra(7)` | `20000000000` |  |
| `maxUsdcPerAddressPerEra(8)` | `25000000000` |  |
| `maxUsdcPerAddressPerEra(9)` | `25000000000` |  |
| `eraSynCap(1)` | `type(uint256).max` or contract's exposed unlimited equivalent for Era I |  |
| `eraSynCap(2)` | `416875000000000000000000` |  |
| `eraSynCap(3)` | `1166500000000000000000000` |  |
| `eraSynCap(4)` | `3333500000000000000000000` |  |
| `eraSynCap(5)` | `6750000000000000000000000` |  |
| `eraSynCap(6)` | `11250000000000000000000000` |  |
| `eraSynCap(7)` | `15000000000000000000000000` |  |
| `eraSynCap(8)` | `60000000000000000000000000` |  |
| `eraSynCap(9)` | `150000000000000000000000000` |  |
| `paused()` | `false` immediately after constructor unless separately paused |  |
| `currentEra()` | expected current V3 era for seat `9`, likely `1` before any V3 buys |  |
| `memberCount()` | `8` |  |
| `availableSyn()` | `0` because zero SYN funding |  |
| `sellableSynForNextSeat()` | `0` because zero SYN funding |  |
| SYN balance of sale contract | `0` |  |

### Repository / Frontend Checks

| Check | Expected | Actual |
| --- | --- | --- |
| Frontend registry still V2b | Yes |  |
| V3 SourceRegistry address added to live registry | No |  |
| V3 MembershipSale address added to live registry | No |  |
| V3 public buy UI live | No |  |
| V3 source records created | No |  |
| V3 funded with SYN | No |  |
| V3 activated | No |  |

## Stop Conditions

Stop before or during any future ceremony if:

- V2b records a new member after the freeze block and before broadcast.
- The SourceRegistryV1 deployed address is not recorded/read back.
- Any constructor argument differs from this packet.
- MetaMask shows the wrong network.
- MetaMask shows the wrong signer.
- A contract readback differs from expected values.
- Either hardware wallet cannot sign or lacks gas.
- Any UI/registry change is requested before readback is complete.
- Any private key, seed phrase, recovery phrase, signer export, or secret is requested.

## Final Founder Approval

Founder approval required before broadcast: YES / NO

Founder approval means only approval for the non-live deployment/readback ceremony described here. It does not approve funding, source records, frontend registry switch, public V3 UI, unpause/activation, or live user routing.


