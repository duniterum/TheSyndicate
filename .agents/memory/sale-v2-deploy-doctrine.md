---
name: Sale V2 deploy doctrine (EOA owner, no testnet)
description: Founder deployment-assumption decisions for Sale V2 + CommissionRouter — owner custody model and rehearsal path; what is / isn't a launch blocker.
---

# Sale V2 / CommissionRouter deployment doctrine

Founder deployment-assumption ruling (docs-only correction). Future doc/checklist work must stay
consistent with this — do NOT reintroduce "transfer to multisig" or "Fuji/testnet rehearsal" wording
into the Sale V2 deploy path.

## Owner custody
- Owner/admin at launch is a **founder/admin EOA (MetaMask)** — **NOT** a multisig.
- Still `Ownable2Step`; still verify `owner` + `pendingOwner` and require **explicit** acceptance by
  the founder/admin wallet before funding.
- EOA is documented as **higher-risk** than a multisig (single point of failure; controls pause,
  timelocked router swap, Vault-only recover/rescue — cannot redirect splits/economics).
- **Ledger hardware wallet or multisig = future hardening only.** Lack of a multisig is **NOT** a
  launch blocker.

## Rehearsal / rollout path (no testnet)
- **No Fuji/testnet.** Replace with: local/forked-mainnet rehearsal (if possible) → mainnet deploy
  with tiny/no funding → source verify → read checks → tiny controlled buy → tiny referred buy →
  event/routing verification → larger funding → only then frontend wiring.

## Mandatory deploy blockers (still in force)
correct USDC addr · correct SYN addr · final genesisOffset · final V1_MEMBER_ROOT · final eraCaps ·
final addrCaps · final maxUsdcPerTx · final reserveThroughSeat · `router.operationsWallet ==
SaleV2.OPERATIONS` (M1) · sourceConfig verified · V1 proof-gen flow documented · owner EOA verified ·
router source verified · SaleV2 source verified.

The `final genesisOffset` / `final V1_MEMBER_ROOT` blockers are now **mechanically
enforced**: `Deploy.s.sol` fails closed on `deploy-params.json`'s `"provisional"` flag
(see `fork-rehearsal-env.md`). Set `provisional:false` ONLY after regenerating from the
real pause block.

## Compression / sequencing (speed)
- **Deploy with `router == address(0)`** for the first controlled buy. ADDING a router post-deploy
  costs `ROUTER_TIMELOCK` (14 days); the first buy needs NO referral, so keep referral fully
  post-launch and the 14-day timelock OFF the critical path. Only set the router AT construction if
  referral is genuinely wanted day-one (construction-time router has no timelock).
- **Seal V1 LATE, not early.** Sealing pauses ALL V1 sales, so doing it weeks before V2 is live = a
  dead no-active-sale window. Pre-build + dry-run the WHOLE snapshot pipeline on live V1 (#1–#2 only,
  tiny) so seal→snapshot→deploy→activate is a hours-long mechanical sequence; seal only when the
  audit is cleared and deploy is imminent. The snapshot is effectively pre-computable (re-confirm at
  seal), not a build step.
- **WS1 + WS2 are ONE coupled change, not two sprints** — they share files (sale-v2-abi, syndicate-
  config, LivePurchase, holder-index) and WS2's ref→address needs WS1's unified index; build on one
  branch, review once against the combined test matrix.

## Funding floor (deploy vs. fund are SEPARATE)
- The constructor pulls **NO SYN** — deploy (step 7) and funding (step 9) are distinct txs. So the
  contract can be deployed **unfunded (0 SYN)** safely; until funded, every `buy()` fails closed
  (`ReserveFloorViolation`/`InsufficientInventory`) with no fund loss. ⇒ There is **no reason to wait
  for the full floor before deploying**; the floor is required only before the first buy / before
  pointing the live frontend at it.
- Required floor = `currentReserveFloor()` = `_reserveSyn(memberCount)`; for a new buyer the buy-time
  check uses `_reserveSyn(memberCount+1)`, and the next seat's own-era min exactly bridges the two, so
  **funding EXACTLY the floor is sufficient for the first minimum buy** (and, because each reserved seat
  converts to its sale 1:1 at the era min, the floor alone covers the **entire** reserved range
  3..`RESERVE_THROUGH_SEAT` at era-MIN prices). Headroom **above** the floor is only needed for
  above-min Era II+ purchases (Era I addr-cap = $5 forces every Genesis seat to exactly 500 SYN) and for
  seats beyond the reserve target.
- **Why:** prevents the founder over-sourcing SYN or fearing an unfunded deploy. Verify the live number
  with a fork read of `currentReserveFloor()` after any param change — do not trust a memorized figure.
- **Funding SOURCE — read the live balance, the 997,500 figure is STALE.** The recovered wallet
  `0x975a…ecec8` was topped up well beyond the V1 sweep and (live read 2026-06-15) holds **~349,997,500
  SYN**, so it alone covers the 5M funding and is the recommended source; the Vault Reserve
  `0x205DdC…f464` (250M SYN) is the alternative. Always `cast call SYN balanceOf` the source before
  recommending it — never repeat the "recovered = 997,500" number.

## Live deployment record (executed 2026-06-15)
- **SaleV2 is DEPLOYED & verified on mainnet.** Deploy tx `0x5f8929…e743f7`, deployer/owner = founder EOA
  `0xa2E538…26e2F`, chain 43114. Read-back 28/28 + explicit all match canon (memberCount=2, genesisOffset=2,
  root `0xae75…74ff`, activeEra=1, nextSeat=3, floor 4,099,000 SYN, router 0x0, paused=false, timelocks
  1,209,600). Source verified: Sourcify `perfect`, Routescan full source. SYN balance 0 until funded.
- **GOTCHA — `contracts/broadcast/Deploy.s.sol/43114/run-latest.json` is STALE/dry-run** and points at a
  DIFFERENT address than the real deploy. NEVER trust the local broadcast artifact for the live address —
  read it from the actual deploy-tx receipt (`cast receipt <tx> | contractAddress`).
- **Frontend go-live is single-gated:** `SALE_V2_LIVE` derives purely from `MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS`
  + `SALE_V2_DEPLOYMENT_BLOCK` being set (no separate flag). Setting them flips the site live → do NOT wire
  until SYN funding + first buy verify, or the Join flow goes live against a 0-SYN fail-closed contract.

## Where this lives in the docs
Reviewer packet §7 (mainnet-direct checklist), §7a (deploy blockers), §7b (EOA-vs-multisig risk note);
`SALE_V2_REFERRAL_LAUNCH_EXECUTION_PLAN.md` (deploy sequence); `contracts/README.md` (status banner +
scope guardrails). The `.sol` NatSpec still says "multisig recommended" — that is advisory code-comment
copy, intentionally left untouched (no contract edits in scope); it is superseded by this doctrine.

**Why:** founder explicitly chose speed/simplicity for a small launch and accepts the EOA risk; the
multisig/Fuji language was a stale pre-decision assumption.
