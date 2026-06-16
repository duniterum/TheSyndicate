# V2b Accelerated Safe Cutover — Mainnet Prep Package (NO BROADCAST)

> **Status: PREP ONLY.** No mainnet deploy. No pause performed. No new architecture,
> governance, multisig, timelock, referral, NFT, Archive, journey, wallet-provider, or
> frontend code was changed. This document + `contracts/script/deploy-params.v2b.final.template.json`
> + agent memory are the only writes.
>
> **Pattern followed:** inspect current truth → expose conflicts first → checkpoint
> (6ca154b9, prior) → generate exact params (template) → rehearse on fork (prior sprint
> green; final re-run is post-pause) → run guards (snapshot validation re-run green) →
> architect review → report.
>
> **Read date:** 2026-06-16 · **Live read block:** `88,166,135` · **RPC:** publicnode (Avalanche C-Chain 43114)

---

## ⚠️ Conflicts exposed first (read before anything else)

1. **V2a is NOT paused.** `paused()=false`, `pausedAt=0`. The "final snapshot at pause
   block" precondition is **unmet**. Every snapshot today is a **rolling target** — any
   V2a `buy()` before pause changes `genesisOffset` and the merged root.
2. **The $5 Genesis defect is LIVE.** `maxUsdcPerAddressPerEra(1) = 5,000,000` ($5). The
   headline $10k/$25k Genesis package is **impossible on V2a** right now.
3. **V2a is underfunded for its own ladder.** Sellable headroom is **901,500 SYN ≈ $9,015** —
   less than a single $10k package. Fixing only the cap on V2a would still not enable the
   headline package. This confirms the V2b + fresh-funding path.
4. **`deploy-params.json` (CANONICAL) is V1-ONLY and dangerous if used by accident:**
   `genesisOffset=2`, root `0xae75…74ff`, `addrCaps[0]=$5`. Deploying it would (a) fail to
   recognize the 3 V2a members → **re-issue them new seats (double-seat risk)** and (b)
   re-ship the $5 defect. The corrected shape exists only as the **provisional** rehearsal
   file. The **final** params file does not exist yet (placeholders depend on the pause block).

None of these block *preparation*; all of them block *deploy*. The gate (§8) is **NO**.

---

## 1. Current V2a live state

On-chain reads, V2a = `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48`, block `88,166,135`:

| Field | Value | Note |
|---|---|---|
| address | `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48` | live, unaudited V2a |
| owner | `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` | EOA; same key that paused V1 (Ownable2Step) |
| paused | **false** | sale is OPEN |
| pausedAt | 0 | never paused |
| memberCount | **5** | 2 V1-recognized + 3 V2a buyers |
| GENESIS_OFFSET (V2a) | 2 | V2a's own constructor offset (V1-only) |
| currentEra / activeEra | 1 / 1 | Genesis |
| nextSeatNumber | **6** | next new seat |
| Genesis cap `maxUsdcPerAddressPerEra(1)` | **5,000,000 = $5** | ❌ the defect, live |
| MAX_USDC_PER_TX | 25,000,000,000 = $25,000 | correct |
| RESERVE_THROUGH_SEAT | 10,000 | reserves the ladder through seat #10,000 |
| V1_MEMBER_ROOT (V2a) | `0xae75ae20…74ff` | V1-only root |
| commissionRouter | `0x0` | unset (no referral) ✓ |
| totalUsdcRaised | 15,000,000 = **$15** | = total USDC routed (70/20/10 of $15) |
| totalSynSold | 1,500 SYN | 3 buyers × $5 × 100 SYN/$ = 1,500 ✓ |
| isConcluded | false | era 1 open |
| SYN balance | **4,998,500 SYN** | funded once at deploy |

**Derived:** reserve floor `_reserveSyn(5) = 4,097,500 SYN`; reserve for next new seat
`_reserveSyn(6) = 4,097,000 SYN`; **sellable headroom `= 4,998,500 − 4,097,000 = 901,500 SYN ≈ $9,015`**
(Era I rate 100 SYN/$). The $5 cap and the funding ceiling are **two independent** reasons the
headline package can't be sold on V2a.

---

## 2. Final pause procedure (DO NOT pause yet — founder word required)

| Item | Value |
|---|---|
| **Who clicks pause** | The V2a **owner** EOA `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F` (founder/admin key). |
| **Contract** | V2a `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48`. |
| **Method** | `pause()` — `external onlyOwner` (OpenZeppelin Pausable). Snowtrace → Contract → *Write* → `pause` (connected as owner), **or** `cast send 0x0b883…2b48 "pause()" --rpc-url $RPC --ledger/--private-key …`. No args. |
| **What to record** | (a) pause **tx hash**; (b) the **block number** the pause tx was included in — **this block IS the snapshot block**; (c) block **timestamp**; (d) `pausedAt` read-back; (e) confirm `paused()==true`. |
| **Snapshot block** | = the block of the `pause()` tx. Everything in §3 pins `SNAPSHOT_BLOCK` to this number. |
| **Events to scan after pause** | V1 `TokensPurchased` (deploy `87,157,852` → V1 pause `88,087,947`) and V2a `Purchased` (deploy `88,095,827` → **pause block**). No other contracts emit member events. |
| **Proof no buy can happen after pause** | `buy()` carries `whenNotPaused`; once `paused()==true` every `buy()` reverts. Verify by reading `paused()==true` and (optionally) a `cast call` simulation of `buy()` reverting. Therefore `memberCount` is frozen at the pause block — the snapshot is final. |

Rollback note: `pause()` is reversible by the owner via `unpause()` (no timelock on
un-pause). If V2b is not deployed, the owner can `unpause()` V2a to resume (still $5-capped).

---

## 3. Final snapshot procedure (from the pause block)

Run from `contracts/tools/` after the pause block `B` is recorded. **Do not reuse the
provisional root** — it is only valid if the pause block equals the rehearsal block
`88,162,414`, which it will not.

```bash
cd contracts/tools
# 1. Scan V1 (to its pause 88,087,947) ∪ V2a (to the V2a PAUSE block B), union + dedupe by FIRST SEEN
SNAPSHOT_BLOCK=<B> RPC_URLS=https://avalanche-c-chain-rpc.publicnode.com \
  node export-members-merged.mjs
#   -> members-merged.json            (addresses in first-seen order)
#   -> members-merged.snapshot.json   (count, genesisOffset, onchainV2aMemberCount, crossChecks)

# 2. Merkle root + per-member proofs over the merged set
node gen-v1-root.mjs members-merged.json     # -> prints root; ALWAYS writes v1-merkle.json (hardcoded name)
cp v1-merkle.json v2b-merkle.json            # name the MERGED proof artifact distinctly (gen-v1-root always writes v1-merkle.json)

# 3. Independently re-derive + replay every proof (don't trust, verify)
node validate-snapshot.mjs members-merged.json v2b-merkle.json <root>   # must print OK / count / N proofs
```

**Built-in fail-closed cross-checks (already in `export-members-merged.mjs`):**
- `count == on-chain V2a memberCount` at block `B` — **fails** if they differ (stale/missed buyer).
- every V2a `firstSeat=true` member's on-chain memberNumber == its derived first-seen number.
- every repeat buyer (`firstSeat=false`) has a strictly-earlier first-seen (no duplicate seat).
- numbering preserved: V1 members keep their first-seen order, V2a continues after them.
- `genesisOffset = count`.

**Reference (rehearsal @ 88,162,414, validated OK today):** count `5`, offset `5`,
root `0xa1f2ed10…718c49`, members `#1 0x2445…C721 (v1) · #2 0x3488…0045 (v1) · #3 0x03E9…C6d0 (v2) · #4 0x3b13…Ec6a (v2) · #5 0x5734…C2cD (v2)`.
**As of block 88,166,135 `memberCount` is still 5**, so this set is still representative —
but it is NOT pinned to a pause and must be regenerated at the real pause block.

---

## 4. Final deploy params template

Created: **`contracts/script/deploy-params.v2b.final.template.json`**.

It ships **fail-closed two ways**: `provisional=true` (Deploy.s.sol refuses unless
`ALLOW_PROVISIONAL_DEPLOY=1`, which a mainnet operator must never set) **and** non-numeric
placeholders in the two pause-dependent fields (`vm.parseJsonUint`/`parseJsonBytes32` revert
on the placeholder text). Fixed values are already correct:

| Field | Value | Source |
|---|---|---|
| `addrCaps[0]` | `25000000000` ($25,000) | **the fix** (was $5) |
| `addrCaps[1..8]` | unchanged | = `deploy-params.json` |
| `maxUsdcPerTx` | `25000000000` | unchanged |
| `reserveThroughSeat` | `10000` | unchanged |
| `eraCaps` | unchanged | unchanged |
| `initialRouter` | `0x0` | forced `address(0)` by Deploy.s.sol |
| `genesisOffset` | **placeholder** | = final snapshot count (pause block) |
| `v1MemberRoot` | **placeholder** | = final merged root (pause block) |

**Finalize → deploy (only after all gates pass):**
```bash
# after §3 produces count + root, set genesisOffset/v1MemberRoot in the template and provisional=false
EXPECT_GENESIS_OFFSET=<count> EXPECT_V1_ROOT=<root> \
DEPLOY_PARAMS=script/deploy-params.v2b.final.template.json \
  forge script script/Deploy.s.sol:Deploy --rpc-url $RPC          # DRY-RUN first
# add --broadcast --verify ONLY when §8 gate is YES
```
The `EXPECT_*` double-entry guard is **operationally MANDATORY** — note the *code* makes it
optional (skipped when the env vars are unset), so discipline is the only enforcement: the
operator declares the offset/root independently and the deploy reverts on any mismatch (this
is what makes the stale V1-only `offset=2`/`0xae75…74ff` params impossible to ship by accident).
Equally mandatory: **`deploy-params.json` (stale V1-only $5/offset=2) is the script's DEFAULT
path** — every final command MUST pass `DEPLOY_PARAMS=script/deploy-params.v2b.final.template.json`
or the stale canonical file is silently read.

---

## 5. Funding requirement (V2b is a fresh contract — starts at 0 SYN)

Era I sells at **100 SYN per USDC** ($0.01/SYN). Reserve protects the ladder through seat
#10,000 at each era's own minimum. Numbers below assume the pause lands at `memberCount=5`
(offset `5`, first new seat `#6`). **If V2a takes more buyers before pause, recompute:** each
extra Genesis seat lowers the reserve by **500 SYN** (e.g. offset `6` → `_reserveSyn(7)=4,096,500`).

| Quantity | SYN | USDC |
|---|---|---|
| Reserve floor that must always remain (`_reserveSyn(6)`) | **4,097,000 SYN** | — |
| SYN sold by one $10k Genesis buy | 1,000,000 SYN | $10,000 |
| → **min V2b balance to support one $10k buy** | **5,097,000 SYN** | — |
| SYN sold by one $25k Genesis buy (max per tx/era) | 2,500,000 SYN | $25,000 |
| → **min V2b balance to support one $25k buy** | **6,597,000 SYN** | — |
| Current V2a SYN balance | 4,998,500 SYN | — |
| Current V2a sellable headroom | 901,500 SYN | ≈ $9,015 |
| **Funding gap vs one $10k package** (5,097,000 − 4,998,500) | **+98,500 SYN** | — |
| **Funding gap vs one $25k package** (6,597,000 − 4,998,500) | **+1,598,500 SYN** | — |

Marginal cost: **+1,000,000 SYN per additional $10k package**, **+2,500,000 SYN per $25k
package** (Genesis `eraSynCap[1]` is forced to max for a sub-333 offset, so funding — not the
era cap — is the only ceiling).

> **Funding source — the "gap vs V2a balance" figures are informational, NOT a transfer plan.**
> V2b is a fresh contract that starts at **0 SYN** and cannot draw on V2a's balance. V2a SYN is
> only movable via `recoverUnsoldSyn()`, which requires the sale to be *concluded* **OR** *paused
> for ≥ 14 days* (`RECOVERY_TIMELOCK`) and sends to the **Vault**, never to V2b. So day-one V2b
> funding must be **externally sourced** into the owner/deployer wallet; any recovered V2a SYN is
> a later, timelocked top-up, not the launch funding.

**Recommended funding (founder-adjustable):** at least **6,597,000 SYN** so V2b can honor a
full $25k max-conviction Genesis buyer on day one; for a healthy launch tranche size it as
`4,097,000 (reserve) + 1,000,000 × N` where `N` = expected number of $10k packages. Do **not**
assume the V2a balance is enough — it is below even the single-$10k minimum.

---

## 6. Final fork rehearsal command list (run AFTER the real pause)

The prior sprint's `RehearsalForkV2b` passed green and nothing material has changed, so it
stands as proof of the V2b parameter **shape**. It is **NOT** a turnkey final gate: the test
**hardcodes** the rehearsal `ROOT` (`0xa1f2…18c49`), the offset/next-seat (`#6`), and the two
member proofs (`_proofM1`/`_proofM3`). Before the final rehearsal these constants **must be
updated to the pause-block snapshot values** (a small, guarded code edit) — otherwise the run
re-validates the STALE rehearsal root, not the final params.

```bash
# 0.  regenerate snapshot + params from the real pause block B  (§3); fill the template, provisional=false
# 0b. UPDATE test/RehearsalForkV2b.t.sol: ROOT, next-seat/offset, _proofM1/_proofM3 -> final snapshot values
#     (or parameterize the test to read deploy-params.v2b.final.template.json) — else it tests the OLD root
# 1.  fork rehearsal (cancun REQUIRED — paris -> NotActivated on SYN PUSH0; runs=1 dodges OOM)
cd contracts
AVAX_RPC=https://avalanche-c-chain-rpc.publicnode.com FOUNDRY_OPTIMIZER_RUNS=1 \
  forge test --match-contract RehearsalForkV2b -vv --evm-version cancun
# 2.  guard: deploy dry-run with the MANDATORY double-entry guard (must SIMULATE, not broadcast)
EXPECT_GENESIS_OFFSET=<count> EXPECT_V1_ROOT=<root> \
DEPLOY_PARAMS=script/deploy-params.v2b.final.template.json \
  forge script script/Deploy.s.sol:Deploy --rpc-url $AVAX_RPC
```

The final rehearsal must assert: buys at **$5, $25, $100, $1k, $10k** seat #6→#10; **$10k = 1,000,000 SYN**;
a **repeat purchase by an existing member adds no new seat**; **70/20/10** split (Vault/Liquidity/Operations);
**commissionRouter==0x0**. The existing `RehearsalForkV2b` sections A–H cover these on a
**freshly-deployed V2b in isolation** (it deploys a new V2b on a fork — *no V1/V2a touch*), but
they exercise only **representative** carried members (`M1_V1`, `M3_V2A`), not every seat —
exhaustive "no duplicate seat for every carried member" coverage comes from `validate-snapshot.mjs`
replaying **all** proofs (§3), not from the fork test. **"Old V2a sealed" is NOT covered by the
fork test** — verify it operationally after the pause (§2) by reading live `paused()==true` on
`0x0b883…2b48` (on-chain history is immutable; no further seats are possible once paused).

---

## 7. Frontend public relaunch blocker list (NOT implemented now — classification only)

**MUST BEFORE MAINNET** (ship in lockstep with the V2b deploy + V2a pause, or the live site
breaks/misleads the instant V2a is paused):
- **registry/config update after V2b** — point the app's sale address at V2b; mark V2a sealed.
- **indexer sale list update** — scan V2b `Purchased` from its deploy block, keep V2a history,
  preserve the **unified holder index** (member identity must not regress at cutover).

**MUST BEFORE PUBLIC RELAUNCH** (before re-opening the public buy flow / marketing):
- **remove false checkout perk** — every public claim must map to on-chain truth (doctrine).
- **package/rank separation** — packages must not imply rank confers rights/returns (rank is recognition-only).
- **public Chapter vs internal Era wording** — public surface says "Chapter"; "Era" is internal.
- **amount presets** — $5 / $25 / $100 / $1k / $10k / $25k, now that the $25k cap is live.
- **live quote display** — show `quote()` SYN-out and set `minSynOut`; cap/headroom-aware.
- **cap guard** — UI enforces the live era + address cap (contract is the backstop).

**CAN AFTER** (non-blocking / conditional):
- **funding-aware package display** — only needed if a presented package could exceed live
  sellable inventory. Avoid the need entirely by funding V2b above the largest offered package (§5).

---

## 8. Mainnet cutover readiness gate

**GATE: ❌ NO — mainnet deploy is NOT allowed.**

| Precondition | State |
|---|---|
| V2a paused | ❌ `paused()=false` |
| Pause block recorded | ❌ none |
| Final snapshot generated (at pause block) | ❌ only provisional/rehearsal |
| Snapshot validated | ⚠️ provisional validated OK today; final pending |
| Params generated from final snapshot | ❌ template only (placeholders) |
| `EXPECT_*` guards pass | ⏳ N/A until final params exist |
| Fork rehearsal passes with **final** params | ❌ passed with provisional; re-run post-pause |
| Funding ready (≥ 5,097,000 SYN, rec. ≥ 6,597,000) | ❌ not funded |
| Frontend config/indexer update plan ready | ✅ plan ready (§7); implementation pending |
| Rollback plan ready | ✅ see §10 |

The single gating fact: **V2a is not paused**, so no final snapshot can exist. Everything
downstream is blocked on that one founder action.

---

## 9. What changed since the last rehearsal

| | Rehearsal (block 88,162,414) | Now (block 88,166,135) | Δ |
|---|---|---|---|
| Head block | 88,162,414 | 88,166,135 | +3,721 |
| V2a memberCount | 5 | **5** | **unchanged** |
| V2a SYN balance | 4,998,500 | 4,998,500 | unchanged |
| Genesis cap | $5 | $5 | unchanged (still defective) |
| V2a paused | false | false | unchanged |
| Merged root validity | offset 5 / `0xa1f2…18c49` | **still re-derives + replays (guard OK)** | unchanged |

**No new V2a purchases occurred between the rehearsal and this read.** The provisional merged
snapshot is therefore still representative — but it is still **not** pinned to a pause block and
remains a rolling target until V2a is paused.

---

## 10. What remains blocked

1. **Pause** — V2a is open; founder word required (no pause performed here).
2. **Final snapshot + params** — depend entirely on the pause block; today only placeholders exist.
3. **Funding** — V2b is a new contract at 0 SYN; needs ≥ 5,097,000 SYN (rec. ≥ 6,597,000) sourced
   into the owner/deployer wallet **before** opening, ideally ready at pause to minimize the dark window.
4. **Final fork rehearsal + `EXPECT_*` guards** — re-run only after the pause-block snapshot exists.
5. **Frontend cutover items** (§7 MUST-BEFORE-MAINNET) — registry/config + indexer, ready to ship in lockstep.
6. **Audit posture unchanged** — V2b is the same code path that replaces the *unaudited* V2a; this
   prep does not change that. (No new architecture introduced.)

**Rollback plan:** V2b is a fresh deploy, not an upgrade — there is no on-chain state to migrate
or revert. If anything fails: *before pause*, nothing has changed. *After pause but before
frontend switch*, keep the app pointed at V2a (sealed) and either retry V2b or `unpause()` V2a
(degraded — $5-capped) to resume. The frontend registry switch (§7) is the actual point of no
easy return; do it last, only after V2b is deployed, funded, and verified (`verify-deploy.mjs`).

---

## 11. Exact next action for the founder

**One decision, in order:**

1. **Confirm SYN funding is in hand** — at least **5,097,000 SYN** (recommended **≥ 6,597,000 SYN**)
   available in the owner/deployer wallet `0xa2E538…26e2F` to fund V2b immediately post-deploy.
2. **Give the explicit word to pause V2a** (and only then). That single owner action —
   `pause()` on `0x0b883…2b48` (§2) — freezes `memberCount` and creates the snapshot block.

Nothing downstream (final snapshot → final params → fork rehearsal → guards → deploy) can
proceed until V2a is paused. **No pause, no deploy, and no frontend work has been performed —
awaiting your explicit instruction to pause.**
