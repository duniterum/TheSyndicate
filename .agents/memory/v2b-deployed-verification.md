---
name: V2b deployed + post-deploy verification
description: The manually-deployed (Remix) SyndicateSaleV2 "V2b" address, that it passed 33/33 read-back, and the remaining funding + cutover blockers.
---

# V2b is deployed and verified-correct on Avalanche mainnet (43114)

- **Deployed SyndicateSaleV2 (V2b) = `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b`** — creation tx `0x6953c8ead4c18b8026b63eb2e3ac65cf6f7345286f33282d8f8f5133eee7d38e`, success, block **88193183**. Deployed manually via Remix.
- On-chain read-back vs `contracts/script/deploy-params.v2b.final.template.json` = **33/33 PASS** (owner=deployer `0xa2E5…6e2F`, GENESIS_OFFSET=memberCount=5, nextSeatNumber=6, root `0xa1f2…718c49`, MAX_USDC_PER_TX=25000000000, RESERVE_THROUGH_SEAT=10000, activeEra=1, commissionRouter=0x0, paused=false, all tokens/treasury/addrCaps/eraCaps match, eraSynCap[1]=uint256.max Model 2). Constructor PASS.

## State right now (verify-only sprint, June 2026)
- **Unfunded:** `availableSyn()=0`. paused=**false** → it is open but every buy reverts `ReserveFloorViolation(0)` until funded. Funding immediately makes it LIVE; consider `pause()` until frontend cutover.
- Funding source = **Membership Distribution `0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8`**, holds **344,997,500 SYN** (~49× the recommended amount). Constructor pulls no SYN — funding is a separate transfer **signed by the dist-wallet key, NOT the deployer**.
- Funding targets (confirmed on-chain): `currentReserveFloor()` = **4,097,500 SYN** must always remain; one $25k Genesis package needs **6,597,000 SYN**; **recommended launch = 7,000,000 SYN** (`7000000000000000000000000`). Genesis rate = 100 SYN/USDC (quote $5→500 SYN, $25k→2,500,000 SYN).

## Cutover blockers (frontend still on V2a — do NOT change during verify sprint)
- `src/lib/syndicate-config.ts`: `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS` still = V2a `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48`, `SALE_V2_DEPLOYMENT_BLOCK` still = `88095827n`. Must repoint to V2b addr + block `88193183n`.
- `public/v1-member-proofs.json` is STALE: root `0xae75ae20…74ff`, count=2 (V1-only). Deployed root is the merged `0xa1f2…718c49`, count=5. Must replace with `contracts/tools/v2b-merkle.json` or V1 recognition fails closed.
- Holder-index / purchase-events scanner must add V2b as a `Purchased` source from block 88193183 (V2a scan stays for history up to pause block 88190780).
