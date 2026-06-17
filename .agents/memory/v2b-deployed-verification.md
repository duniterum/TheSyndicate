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

## Cutover DONE — site points to V2b (June 2026)
- Frontend cutover is COMPLETE: active buy/quote/approve target = V2b; V2a is now a HISTORICAL-ONLY scan source. The earlier "blockers" are resolved.
- **Durable rule (scanner):** the purchase-events scan must read V1 + V2a + V2b and UNION them (`scanV2Purchases` is called once per V2 contract; `mergePurchaseEvents` dedupes by tx:logIndex, order-independent). V2a holds 3 members (seats #3–#5) absent from BOTH V1 and V2b, so collapsing back to a single "V2" slot silently erases them from member identity. V2a is scanned regardless of `SALE_V2_LIVE`.
- **Durable rule (proof root):** `public/v1-member-proofs.json` root and `V1_MEMBER_ROOT` (v1-proof.ts) MUST both equal V2b's on-chain MERGED root `0xa1f2…718c49` (count 5 = 2 V1 + 3 V2a, first-seen order). The old V1-only root `0xae75…74ff` (count 2) is V2a's and is now STALE; any mismatch fails the buy closed (no duplicate-seat risk).
- **Durable rule (why the proof gate must Merkle-VERIFY, not just pin addresses):** the deployed `buy()` does NOT revert on a bad/empty non-empty V1 proof — it skips `knownMember` and falls through to mint a FRESH seat. So an empty/corrupt proof for a real member = a DUPLICATE seat (the one irreversible identity gate). The frontend artifact gate therefore must recompute the contract's leaf — `keccak256(bytes.concat(keccak256(abi.encode(addr))))` (StandardMerkleTree `["address"]`, DOUBLE hash) + OZ commutative sorted-pair fold — and verify EVERY proof against the sealed root, plus pin the exact recognized-set (raw key count, distinct count, full coverage). Pinning the address set alone is insufficient. **Why:** the contract's silent fall-through, not a revert, is the trap.
- **Limitation (cannot be fixed client-side):** the gate only protects the UI-mediated buy. A recognized member can still bypass the site and call `buy()` directly with an empty/bad proof to mint a duplicate. Absolute prevention is a contract-level change, out of the website-cutover scope.
- Validated locally: tsc clean; purchase-events-incremental/canonical + v1-proof suites green. SMOKE TEST still requires PUBLISH + a connected wallet — dev preview shows PENDING/— because the public Avalanche RPC has no CORS for a cold scan; that is expected, not a regression.
