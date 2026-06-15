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

## Where this lives in the docs
Reviewer packet §7 (mainnet-direct checklist), §7a (deploy blockers), §7b (EOA-vs-multisig risk note);
`SALE_V2_REFERRAL_LAUNCH_EXECUTION_PLAN.md` (deploy sequence); `contracts/README.md` (status banner +
scope guardrails). The `.sol` NatSpec still says "multisig recommended" — that is advisory code-comment
copy, intentionally left untouched (no contract edits in scope); it is superseded by this doctrine.

**Why:** founder explicitly chose speed/simplicity for a small launch and accepts the EOA risk; the
multisig/Fuji language was a stale pre-decision assumption.
