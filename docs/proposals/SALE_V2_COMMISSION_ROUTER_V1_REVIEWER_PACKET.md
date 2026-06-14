# Sale V2 · CommissionRouter V1 — Reviewer Packet (Frozen for Line-by-Line Solidity Review)

**Status:** FROZEN FOR REVIEW · DRAFT / NOT DEPLOYED · economics ratified, no further economic change
**Purpose:** Single hand-off artifact for line-by-line Solidity review. Records the frozen
assumptions, the ratified OD-1 decision, the retention-deferral note, the exact files to
review, the invariants the reviewer must verify (each mapped to where it is enforced), the
required pre-mainnet tests, and the mainnet-direct deployment checklist.

**Founder constraints in force:** no deploy · no Sale V1 change · no frontend change yet ·
no further economics change.

---

## 1 — Final frozen Sale V2 + CommissionRouter assumptions

1. Sale V2 is the membership sale engine; **CommissionRouter V1 owns all referral routing**.
2. Referral is **live with Sale V2** through the router; tiers are **count-based from day one**.
3. **70 / 20 / 10 is constitutional.** Vault (70%) and Liquidity (20%) are paid in full *before*
   the router is called and are **never** diluted by referral. Referral is carved **only** from
   the 10% Operations slice; max referral ceiling = 10% of gross (tier 4 = 80% of the slice).
4. On-chain commission axis = **verified referred-member count only** (`referredCount`). No oracle,
   no reputation/retention/durability math on-chain, no wealth / rank / SYN-balance / participation
   input, no MLM/downline, no streaks/badges.
5. The router emits the **full RAL-compatible `Attribution` event** as the single canonical emitter.
6. Reputation / Builder Records / retention / durability are **off-chain future layers** that read
   router events; they never gate an on-chain payout.
7. Eligibility (re-validated inside the router against the calling sale): `referrer != 0 &&
   referrer != buyer && knownMember(referrer)`.
8. Custody: Sale V2 max-approves the router; the router **pulls exactly the Operations slice** via
   `transferFrom`, pays the referrer (push, escrow-on-failure), and forwards the remainder to a
   **governance-set** `operationsWallet`. Router unset/revert → Sale V2 pays the **full** slice to
   Operations (`CommissionRouterFallback`); a buy never bricks.
9. Router wiring: `initialRouter` constructor (day-one); add/replace behind a 7-day timelock;
   **disable is instant**. Source allow-list is governance-gated (`Ownable2Step`).
10. Tier ladder (canonical, count-only on-chain — `retentionRequiredPct` is off-chain only):

| Tier | Name | Threshold (verified referred members) | % of Operations slice | ≈ % of gross |
|---|---|---|---|---|
| 0 | Signal | 0 | 30% | 3.0% |
| 1 | Advocate | 5 | 40% | 4.0% |
| 2 | Connector | 20 | 55% | 5.5% |
| 3 | Catalyst | 50 | 70% | 7.0% |
| 4 | Ambassador | 100 | 80% | 8.0% |

No yield / ROI / revenue-share wording anywhere; recognition only.

---

## 2 — Final OD-1 decision (RECORDED)

**RATIFIED:** Referral commission is paid on **every eligible referred buy**, but `referredCount`
increments **only once per valid first-seat referral**.

- If Member A introduces Member B, A may receive commission on B's later eligible purchases.
- A's **tier count** rises **only once** for B (first seat). Repeat buys **do not** farm tier count.
- Operations-only cap remains enforced; Vault 70% / Liquidity 20% never diluted.

**Already implemented in the draft (no economics change required):** commission is computed and
paid whenever `valid` is true (every eligible buy); the count increment is gated on
`valid && firstSeat`. Reviewer must confirm these two conditions are genuinely independent in code.

---

## 3 — Final retention-deferral note (RECORDED)

**RATIFIED:** Tiers launch **count-only**. `retentionRequiredPct` (the 0/60/70/75/80% design gate)
is **not** enforced on-chain in V1 — retention is not on-chain-knowable and never gates a live
payout. Durability-gated tiers, Reputation, and Builder Records arrive later as the off-chain layer
reading router events.

**Required public/site wording (FUTURE frontend follow-up — not implemented in this sprint):**
> "Tiers are based on verified introductions today; durability-gated reputation and Builder Records
> arrive later through the off-chain layer."

---

## 4 — Exact contracts to be reviewed

**Review the PRODUCTION-CANDIDATE contracts** (hardened from the drafts; these are what would be
compiled and deployed). The frozen drafts remain as the design-of-record alongside them.

| Contract | PRODUCTION file (review this) | Frozen draft (design-of-record) |
|---|---|---|
| **CommissionRouter V1** | `contracts/src/CommissionRouterV1.sol` | `docs/proposals/drafts/CommissionRouterV1.draft.sol` |
| **Sale V2** | `contracts/src/SyndicateSaleV2.sol` | `docs/proposals/drafts/SyndicateSaleV2.draft.sol` |

The production files differ from the drafts ONLY by the named, frozen-scope hardening (audited
OpenZeppelin `Ownable2Step` / `ReentrancyGuard` / `Pausable` / `SafeERC20` + `forceApprove` /
`MerkleProof` replacing the drafts' placeholder primitives; the double-hashed Merkle leaf; and the
H4 split-integrity guard). **No economics, referral, era, reserve, or doctrine change.** The build,
tests, mocks, Slither output, and the reproducible `V1_MEMBER_ROOT` generator all live under
`contracts/` (see `contracts/README.md`).

Reference (non-contract): `docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §L (sale) and
§R (router) embed each `.draft.sol` **byte-identical**; `docs/REVENUE_ATTRIBUTION_LAYER.md` is the RAL
event spec. `CommissionRouteInput` is duplicated byte-for-byte in both files — verify ABI parity.

---

## 5 — Exact invariants the reviewer must verify (each mapped to its enforcement point)

| # | Invariant | Where enforced (start point for line-by-line) |
|---|---|---|
| I1 | Vault 70% never diluted | Sale `buy()` pays `vaultAmt` in full **before** the router call; router only echoes `vaultAmount` into `splits[0]`, never moves it |
| I2 | Liquidity 20% never diluted | Sale `buy()` pays `liqAmt` in full before the router call; router echoes `splits[1]` only |
| I3 | Referral only from Operations | Router commission = `opsSlice × opsPct / 100`; `referrerAmount + operationsAmount == opsSlice`; router pulls exactly `opsSlice` |
| I4 | Tier count increments **first-seat only** | Router effects block gated on `valid && p.firstSeat`; sale computes `firstSeat = !knownMember[msg.sender]` |
| I5 | Payout can happen on **every eligible buy** | Router computes/pays `referrerAmount` whenever `valid` (independent of `firstSeat`) |
| I6 | Full RAL `Attribution` event emitted | Router emits `Attribution(source, buyer, referrer, campaign, refTag, token, gross, tier, splits[5], paymentMode, attributionMode)`; tier snapshotted **before** increment |
| I7 | Router-failure fallback safe | Sale wraps `route()` in `try/catch`; unset/revert → full slice to `OPERATIONS` + `CommissionRouterFallback`; router revert reverts its `transferFrom` pull in the same frame (untouched slice) |
| I8 | Escrow / claim safe | Router push uses `try/catch` → `referralOwed` + `ReferralEscrowed`; `claimReferral()` is `nonReentrant`, zeroes before transfer, `NothingToClaim` on empty |
| I9 | No oracle | No price feed / external price read in either contract |
| I10 | No wealth / rank / SYN-balance input | Tier axis is `referredCount` only; verify no SYN balance, rank, USDC total, or buyer participation feeds the tier |
| I11 | Reentrancy safe | `nonReentrant` on `route()` + `claimReferral()` (router) and `buy()` (sale); strict CEI (state writes before external value moves) |
| I12 | Sale V2 era / cap / reserve logic unaffected | Referral rewire does not alter era advance, per-tx / per-address / per-era caps, or `RESERVE_THROUGH_SEAT` / `_reserveSyn()` |
| I13 | Eligibility | Router re-validates `referrer != 0 && != buyer && knownMember(referrer)` against `msg.sender` (the calling sale) |
| I14 | Conservation (global) | `vaultAmt + liqAmt + opsSlice == usdcIn` on every path; router USDC balance == Σ `referralOwed`; sale holds no transient USDC after `buy()` |
| I15 | Source authority | `route()` reverts `NotAuthorizedSource` for non-allow-listed callers; `operationsWallet` is governance-set, never caller-passed; owner has no price/split/wallet setter and cannot touch escrow/USDC |

Lower-priority note for the reviewer (R9/OD-7): the sale's `Routed` event mirrors the router's
returned splits — treat the router's `Attribution` as the **authoritative** referral-split record,
or add `refPaid + opsPaid == opsSlice` assertion on return.

---

## 6 — Exact tests required before mainnet deployment

**Functional / referral:**
- no referrer → full Operations to OPERATIONS; `Attribution(referrer=0, tier=0)`; no increment.
- valid referrer (each tier 0–4) → exact 30/40/55/70/80% of Operations to referrer; remainder to Ops.
- invalid referrer (non-member) / self-referral / zero → commission 0, full Ops to OPERATIONS, no increment.
- V1 member referrer and V2 member referrer both accepted (`knownMember` covers both paths).
- **first-seat-only count:** first buy increments `referredCount`; **repeat buys pay commission but do NOT increment** (the ratified OD-1 — assert both halves).
- tier boundary behavior (count exactly 5 / 20 / 50 / 100 takes the higher tier).
- referral payout exactness + Operations remainder exactness (`referrer + operations == opsSlice`).

**Custody / safety:**
- Vault/Liquidity balances untouched on every path.
- router unset fallback; router-failure (revert) fallback; both pay full Ops to OPERATIONS + emit fallback.
- escrow path (referrer transfer fails) → `referralOwed` credited, buy still succeeds; `claimReferral` pays; double-claim → `NothingToClaim`.
- reentrancy attempts on `route` / `claimReferral` / `buy` blocked.
- conservation invariant (I14) asserted in fuzz/property tests.

**Authorization / governance:**
- non-allow-listed caller → `NotAuthorizedSource`; `addSource`/`removeSource` behavior; disabled source rejected.
- router swap timelock: `confirmCommissionRouter` before `ROUTER_TIMELOCK` reverts; after succeeds; `disableCommissionRouter` instant; approvals re-pointed on swap.

**Sale-engine regression (unchanged behavior):**
- era / cap (per-tx, per-address-per-era, aggregate-per-era) / `RESERVE_THROUGH_SEAT` reserve logic unaffected by the rewire.
- V1 member continuity (`V1_MEMBER_ROOT` / `claimV1Membership`) and automatic era transitions intact.

**Events / indexing:**
- all events emitted with correct values; an indexer can reconstruct full attribution from `Attribution` alone.

Coverage target: 100% of `route()`, `buy()` money path, fallback, escrow, and the swap lifecycle.

---

## 7 — Mainnet-direct deployment checklist (no Fuji/testnet)

Execute strictly in order; do not advance on a red:

1. **Compile** both contracts against pinned `solc` + production OpenZeppelin (swap the placeholder interfaces).
2. **Static analysis** (Slither + a second tool); zero unresolved high/medium.
3. **Full unit + property/fuzz tests** green at target coverage (§6).
4. **Deploy with tiny/no funding first** (router + sale; minimal or zero SYN funding).
5. **Verify source** on the explorer (both contracts).
6. **Owner / read checks** — confirm owner = the multisig; `Ownable2Step` two-step accept done; immutable params (USDC, wallets, root) correct.
7. **Quote checks** — `tierFor` / `quoteCommission` return the exact ladder; `sourceConfig` shows the sale allow-listed with the correct `operationsWallet`.
8. **Tiny controlled buy** (no referrer) — verify 70/20/10 split + fallback/no-referrer path + events.
9. **Tiny referred buy** — verify tier-0 payout, `referredCount` increment on first seat, escrow path if applicable.
10. **Verify events** — `Attribution`, `Routed`, `ReferredCountIncremented` carry correct values.
11. **Verify routing** — referrer received commission; Operations wallet received remainder; Vault/Liquidity intact.
12. **Only then larger funding** of the SYN sale pool.
13. **Only then frontend wiring** (and apply the §3 retention-deferral wording).

Pre-deploy sign-offs required: line-by-line Solidity review complete; OD-1 (§2) and retention
deferral (§3) ratified [✅ done]; multisig owner address fixed; `ROUTER_TIMELOCK` duration confirmed;
legal sign-off on public referral copy before frontend wiring.

---

## 8 — Can line-by-line Solidity review begin now?

**YES — review can begin.**

The economics are frozen and ratified (§1–§3), both drafts already implement the ratified OD-1 and
the count-only retention deferral, the architecture doc embeds are byte-identical to the `.sol`, and
the prior architect pass returned no severe/blocking issues. The only items outstanding are
review-phase and deploy-phase steps (production OZ swap, the multisig owner address, timelock
duration, and legal copy sign-off) — none of which block starting the line-by-line read.

---

## 9 — Production hardening applied (drafts → `contracts/src/`)

The production-candidate contracts (§4) implement the §7-step-1/step-2 work. Changes vs the frozen
drafts are STRICTLY the following — no economics, referral, era, reserve, or doctrine change:

| # | Hardening | Where |
|---|---|---|
| H1 | Placeholder ERC20/Ownable interfaces → audited **OpenZeppelin v5.1.0** (`SafeERC20`, `Ownable2Step`, `ReentrancyGuard`; sale adds `Pausable`, `MerkleProof`, and `forceApprove` for the router allowance). | both |
| H2 | Merkle V1 recognition uses **OZ `MerkleProof.verify` over a double-hashed leaf** `keccak256(bytes.concat(keccak256(abi.encode(addr))))` (StandardMerkleTree-compatible; §10). | sale |
| H3 | **H4 input-integrity guard** `vaultAmount + liquidityAmount + opsSlice == gross` → reverts `SplitMismatch` (audit L5). | router |
| H4 | Referrer push isolated behind a `this.pushReferral` self-call (`OnlySelf`) so a blocked/reverting referrer is **escrowed**, never reverts the route. | router |

Toolchain: solc `0.8.24` pinned, `evm=paris`, optimizer `runs=200`, `via_ir=true` (`buy()` exceeds
the legacy stack limit). Build/test/Slither/root-gen instructions: `contracts/README.md`.

## 9a — Test matrix (59 tests green; fuzz at 512 runs)

`forge test` → **59 passed, 0 failed** (`test/CommissionRouterV1.t.sol` 21 · `test/SyndicateSaleV2.t.sol` 38).
Each §5 invariant and §6 requirement maps to concrete tests:

| Invariant / finding | Covering test(s) |
|---|---|
| I1/I2 Vault & Liquidity never diluted | `test_buy_happyNewSeat`, `test_router_integrationReferralPaid`, `testFuzz_splitConservation` |
| I3 Referral only from Operations | `test_route_validReferral_signalTier`, `testFuzz_route_conservation`, `testFuzz_referrerPlusOps_eqOpsSlice` |
| I4 Tier count first-seat-only | `test_route_firstSeatOnly_count`, `test_route_validReferral_signalTier` |
| I5 Payout on every eligible buy | `test_route_firstSeatOnly_count` (paid, no increment) |
| I6 Full RAL `Attribution` | `test_attribution_fullReconstruction` |
| I7 Router-failure fallback safe | `test_router_fallbackOnRevert`, `test_reentrancy_buyBlocked` |
| I8 Escrow / claim safe | `test_escrow_onBlockedReferrer_thenClaim`, `test_claimReferral_nothingReverts`, `test_claimReferral_doubleClaimReverts` |
| I10 No wealth/rank input (count-only) | `test_tierFor_boundaries`, `test_tierLadder_applies_afterFiveReferrals` |
| I11 Reentrancy safe | `test_reentrancy_buyBlocked`, `test_pushReferral_onlySelf`, `test_claimReferral_doubleClaimReverts` |
| I12 Era / cap / reserve unaffected | `test_eraAdvance_byCap`, `test_eraAdvance_byRange`, `test_buy_addressEraCapReverts`, `test_buy_eraInventoryInsufficientReverts`, `test_buy_insufficientInventoryReverts`, `test_buy_exceedsTxMaxReverts`, `test_reserveFloor_blocksOverdraw`, `test_eraOfSeat_positional` |
| I13 Eligibility | `test_route_selfReferral_ignored`, `test_route_unknownReferrer_ignored`, `test_route_noReferrer_allToOps` |
| I14 Conservation (global) | `testFuzz_splitConservation`, `test_buy_splitConservation`, `testFuzz_route_conservation` |
| I15 Source authority | `test_route_notAuthorizedSource`, `test_addSource_onlyOwner`, `test_addSource_existsReverts`, `test_addSource_zeroReverts`, `test_removeSource`, `test_sourceConfig` |
| H4 SplitMismatch guard | `test_route_splitMismatchReverts` |
| M1 router ops-wallet == sale OPERATIONS | `test_router_integrationReferralPaid` (router `addSource` ops == sale `OPERATIONS`) |
| M2 V1 proof vs no-proof | `test_buy_v1WithProof_noNewSeat` (no new seat), `test_buy_v1WithoutProof_getsSeat_M2` (double-count documented) |
| Merkle double-hash recognition | `test_claimV1_validProof`, `test_claimV1_invalidProofReverts`, `test_claimV1_alreadyKnownReverts` |
| Constructor validation | `test_ctor_zeroAddressReverts`, `test_ctor_badGenesisOffsetReverts`, `test_ctor_zeroMaxTxReverts`, `test_ctor_badReserveReverts`, `test_ctor_eraCapTooSmallReverts`, `test_ctor_addrCapBelowMinReverts`, `test_ctor_maxTxBelowEraMinReverts` |
| Pause / timelocked recovery / rescue | `test_pause_blocksBuy`, `test_pause_onlyOwner`, `test_recover_notWindingDownReverts`, `test_recover_timelockedThenSucceeds`, `test_rescueToken_protectedReverts`, `test_rescueToken_otherToVault` |
| Router swap timelock | `test_router_proposeConfirmTimelock`, `test_router_proposeZeroReverts` |

**Open items NOT in scope of this sprint (documented, not fixed):** M1 (router `operationsWallet`
must be configured == the sale's `OPERATIONS` at deploy — a deploy-config check, covered by a test
that wires it correctly); M2 (a V1 member who omits the proof on `buy` is issued a fresh seat /
double-counted — a known draft behavior, asserted as-is); and the `RECOVERY_TIMELOCK` is 7 days in
code vs 14 days in the parameter simulation (a deploy-time governance decision).

## 10 — `V1_MEMBER_ROOT` generation (reproducible)

On-chain leaf (asserted by the tests): `keccak256(bytes.concat(keccak256(abi.encode(address))))` —
identical to `@openzeppelin/merkle-tree` `StandardMerkleTree` with leaf encoding `["address"]`,
verified by OZ `MerkleProof.verify` (commutative sorted-pair internal nodes).

```bash
cd contracts/tools && npm init -y && npm i @openzeppelin/merkle-tree
node gen-v1-root.mjs members.json   # ["0xabc…", …]  (or members.txt, one per line)
#  -> prints V1_MEMBER_ROOT; writes v1-merkle.json { root, count, proofs, tree }
```

`proofs[address]` is the array each member passes to `claimV1Membership(proof)` / `buy(…, v1Proof)`.
The generator and the contract are provably in lockstep (same leaf formula in `tools/gen-v1-root.mjs`
and `test/SyndicateSaleV2.t.sol`).

## 11 — Static analysis (Slither) result

`slither .` (full output saved to `contracts/audit/slither-report.txt`): **no high/medium findings
in `src/`.** All results are informational — either in vendored OpenZeppelin (the `^0.8.20` pragma
notice, `Address` low-level calls inside `SafeERC20`, unindexed `Pausable` events) or by-design notes
on our code: `buy()` cyclomatic complexity (intentional single-CEI era/cap/reserve path), UPPERCASE
immutable naming (deliberate), and the router↔`ICommissionRouter` "missing-inheritance" (intentional
decoupling to avoid a circular import; the `CommissionRouteInput` struct is byte-identical in both
files). Slither is step 2 of the §7 checklist; a second independent tool + a full external audit
remain required before any deploy.
