# V3 Local Mainnet Purchase QA Readback

Status: INTERNAL QA RECORD / LOCALHOST MAINNET TEST / NOT PRODUCTION PUBLISH

Date: 2026-06-21

GitHub commit used for test: `fe575f2d02a909c9277381bb9bde5f185d2ca7b4`

## Safety Boundary

- No contract deployment was performed by Codex.
- No contract transaction was performed by Codex.
- No V2b SYN recovery was performed.
- No source records were created.
- No referral/source UI was activated.
- No claim UI was activated.
- No registry switch was performed.
- No Replit/production publish was performed as part of this readback.

## Transaction

| Field | Value |
| --- | --- |
| Transaction | `0x4140bd59aeecf693ed1e31803fdf907a73f49c954439505e3f8cb382b87e032f` |
| Chain | Avalanche C-Chain (`43114`) |
| Status | Success |
| Block | `88525814` |
| Called contract | MembershipSaleV3 `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` |
| Buyer / recipient | `0xDDF3Ea0688D50014818721A58887BA115CE02BD0` |
| Member number | `9` |
| First seat | `true` |

## Receipt Readback

| Field | Value |
| --- | --- |
| Gross USDC | `5` |
| Acquisition cost | `0` |
| Protocol contribution | `5` |
| Vault amount | `3.5` |
| Liquidity amount | `1` |
| Operations amount | `0.5` |
| SYN out | `500` |
| SYN per USDC | `100` |
| Era | `1` |
| Chapter | `1` |
| Source ID | `0x0000000000000000000000000000000000000000000000000000000000000000` |
| Source class | `0` |
| Source wallet | `0x0000000000000000000000000000000000000000` |
| Commission bps | `0` |
| Attribution scope | `0` |
| Receipt version | `3` |

## Post-Purchase Contract State

| Field | Value |
| --- | --- |
| MembershipSaleV3 `memberCount()` | `9` |
| Buyer SYN balance | `500 SYN` |
| MembershipSaleV3 SYN balance | `6,999,500 SYN` |
| MembershipSaleV3 `availableSyn()` | `6,999,500 SYN` |
| MembershipSaleV3 `sellableSynForNextSeat()` | `2,904,500 SYN` |
| MembershipSaleV3 `SOURCE_REGISTRY()` | `0x780013bB358be6be95b401901264FC7c22a595a6` |
| SourceRegistryV1 `SourceCreated` logs since deploy | `0` |

## Local UI QA

Local URL used: `http://127.0.0.1:8080/`

Read-only route checks returned HTTP 200 for:

- `/`
- `/join`
- `/my-syndicate`
- `/activity`
- `/referral`

Fresh rendered HTML did not contain `Indexing your seat...` after the transaction readback pass.

`/referral` continued to render the inactive boundary:

- `SOURCE RECORDS INACTIVE`
- `No source records`
- `No commission`
- `No claim`

Known limitation: Codex did not control the founder's connected MetaMask session and did not sign or connect a wallet. Therefore the wallet-connected `/my-syndicate` member-home state for `0xDDF3Ea0688D50014818721A58887BA115CE02BD0` still requires founder-side visual confirmation in the live local browser session.

## Cache / Read Model

The committed purchase-event cache guard preserves:

- `source: "v3"`
- V3 acquisition/source fields
- V3 receipt enrichment

Unknown future source labels are rejected instead of silently relabeling as V1.

## Production Boundary

This QA confirms the localhost V3 direct-buy path produced a valid mainnet V3 receipt for Member #9. It does not mean production has been published or activated.

Before Replit production publish:

1. Pull latest GitHub main.
2. Confirm the target commit.
3. Run `npm run check-release`.
4. Publish/update only if green.
5. Verify `/join` targets V3.
6. Verify approval spender is MembershipSaleV3.
7. Verify direct buy uses `ZERO_SOURCE_ID`.
8. Verify `/referral` remains inactive with no source records, no commission, and no claim UI.
