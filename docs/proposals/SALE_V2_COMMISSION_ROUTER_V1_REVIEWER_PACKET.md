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

## 4 — Exact contracts/drafts to be reviewed

| Contract | File | Notes |
|---|---|---|
| **CommissionRouter V1** | `docs/proposals/drafts/CommissionRouterV1.draft.sol` | Header-gated NOT-FOR-DEPLOYMENT. Lightweight ERC20/Ownable interfaces are intentional placeholders — **production must use audited OpenZeppelin** (`Ownable2Step`, `ReentrancyGuard`, `SafeERC20`). |
| **Sale V2** | `docs/proposals/drafts/SyndicateSaleV2.draft.sol` | Referral logic removed; routes the Operations slice to the router with safe fallback. |

Reference (non-contract): `docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §L (sale) and
§R (router) embed each `.sol` **byte-identical**; `docs/REVENUE_ATTRIBUTION_LAYER.md` is the RAL
event spec. `CommissionRouteInput` is duplicated byte-for-byte in both drafts — verify ABI parity.

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
