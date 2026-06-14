# Sale V2 · CommissionRouter V1 — Architecture Sprint Report

**Status:** DRAFT / DESIGN-ONLY · NOT FOR DEPLOYMENT · no `src/` change · no funds moved
**Scope:** Convert Sale V2 referral from a flat-inline 5% carve into a dedicated,
governance-gated **CommissionRouter V1** that Sale V2 calls, while preserving the
future Reputation / Builder-Record / RAL read-model layers as **off-chain**
projections fed by an on-chain `Attribution` event.

This sprint changed **only** draft `.sol` files and design docs:

- `docs/proposals/drafts/CommissionRouterV1.draft.sol` (NEW, 355 lines)
- `docs/proposals/drafts/SyndicateSaleV2.draft.sol` (referral path rewired)
- `docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` (§D rewrite, §L re-sync, §R added, drift-sync across §E/§G/§H/§I/§J/§K/§N/§O/§Q)
- this report

Nothing was deployed; no Sale V1 contract or behavior was touched; no frontend was
implemented; no new economics were invented (the tier ladder is recovered verbatim
from `src/lib/preview/referral.ts`).

---

## Output 1 — Founder task map (A–H)

| Founder task | Where it landed | Status |
| --- | --- | --- |
| **A** — Router owns referral routing only (Operations-only) | `CommissionRouterV1.draft.sol` scope header + `route()`; never references Vault/Liquidity except to echo them into the event | ✅ |
| **B** — Tier ladder = canonical count-only axis | `_tierFor()` / `tierFor()` / `quoteCommission()`; matches `referral.ts` `REFERRAL_TIERS` byte-for-byte (see Output 3) | ✅ |
| **C** — Eligibility: non-zero, non-self, known member | `route()` `valid` check via the calling sale's `knownMember()` view | ✅ |
| **D** — `referredCount` increments on valid **first-seat** only | `route()` effects block gated on `valid && p.firstSeat` | ✅ |
| **E** — Full RAL `Attribution` event on-chain | `Attribution{source,buyer,referrer,campaign,refTag,token,gross,tier,splits[5],paymentMode,attributionMode}` | ✅ |
| **F** — Custody + escrow (push, escrow-on-fail, claim) | `transferFrom`-pull custody, `try/catch` push → `referralOwed` + `claimReferral()` | ✅ |
| **G** — Sale V2 integration with safe fallback | `buy()` routes the Operations slice under `try/catch`; unset/revert → full slice to Operations + `CommissionRouterFallback` | ✅ |
| **H** — This sprint report | this file | ✅ |

---

## Output 2 — What changed vs the old inline model

**Before (Sprint 0 draft):** Sale V2 computed a **flat 5%** referral inline
(`refAmt = opsSlice / 2`), held escrow in its own `referralOwed`, and exposed
`claimReferral()` itself. Referral policy was fused into the sale's hot path.

**After (this sprint):** Sale V2 pays **Vault (70%) and Liquidity (20%) in full**,
then hands the **entire 10% Operations slice** to an external `CommissionRouter V1`.
The router owns *all* referral policy — tier lookup, eligibility re-validation,
payout, escrow, count tracking, and the RAL event. The sale keeps zero referral
state. The 70/20/10 constitutional split is **unchanged**; referral remains carved
**only** from the Operations slice.

**Why a separate contract (founder rationale):**
- **Isolation of policy from custody of the sale.** A swapped/buggy router can only
  ever touch the Operations slice — Vault and Liquidity are already paid.
- **Upgrade path without touching the sale.** Tier/attribution evolution becomes a
  router swap (behind a timelock), not a sale migration.
- **One RAL event surface.** The router is the single emitter of `Attribution`, so
  Reputation / Builder-Record / Treasury read-models read one place.

---

## Output 3 — Tier ladder (EXACT, count-only axis)

Recovered verbatim from `src/lib/preview/referral.ts` → `REFERRAL_TIERS`. `commissionPct`
is a **percent of the 10% Operations slice**, *not* of gross.

| Tier | `referredCount ≥` | % of Operations slice | ≈ % of gross | `retentionRequiredPct` (off-chain only) |
| --- | --- | --- | --- | --- |
| Signal | 0 | 30% | 3.0% | 0 |
| Advocate | 5 | 40% | 4.0% | 60 |
| Connector | 20 | 55% | 5.5% | 70 |
| Catalyst | 50 | 70% | 7.0% | 75 |
| Ambassador | 100 | 80% | 8.0% | 80 |

- Boundary rule: a count exactly on a threshold takes the **higher** tier
  (`count >= threshold`).
- `retentionRequiredPct` is **deliberately NOT enforced on-chain** in V1. Retention
  is not safely knowable on-chain, so it never gates a live payout — it is a future
  **off-chain read-model gate** only (founder doctrine 4: only on-chain-knowable data
  gates a payout).
- The maximum tier pays 80% of the Operations slice — strictly **< 100%**, so the
  referrer share can never exceed the slice (asserted defensively as `OpsCapExceeded`).

---

## Output 4 — CommissionRouter V1 architecture

**Trust model:** `Ownable2Step` (multisig owner recommended), `nonReentrant` on
`route()` and `claimReferral()`. No oracle, no upgradeable proxy, mostly-immutable
params (`USDC` immutable; tier table is `pure`/hardcoded).

**Governance allow-list (source registry):** `addSource(caller, sourceId, operationsWallet)`
/ `removeSource(caller)`. Each authorized sale maps to:
- `sourceId` (`bytes32`) — stamped on its `Attribution` events (RAL `source`).
- `operationsWallet` — **governance-set destination** for that source's Operations
  remainder. The caller never passes a destination, so a compromised sale cannot
  redirect Operations funds.
- `enabled` — removing trust is instant (no timelock needed to *reduce* authority).

**`route(CommissionRouteInput)` — the one money entrypoint:**
1. Authorize: `msg.sender` must be an enabled source, else `NotAuthorizedSource`.
2. Validate referrer: `referrer != 0 && referrer != buyer && knownMember(referrer)`
   (membership read against the **calling sale**, the on-chain source of truth).
3. Tier snapshot from the **current** `referredCount[referrer]` (count-only).
4. `referrerAmount = opsSlice × opsPct / 100`; `operationsAmount = opsSlice − referrerAmount`.
5. **Pull** exactly `opsSlice` from the caller via `transferFrom` (caller pre-approved).
6. Effects: increment `referredCount` **iff** `valid && firstSeat`
   (`ReferredCountIncremented`).
7. Interactions: push commission to the referrer; on revert/`false`, **escrow** to
   `referralOwed` (`paymentMode = escrow`, `ReferralEscrowed`). Forward the remainder
   to the source's `operationsWallet`.
8. Emit the canonical `Attribution` event.

**Escrow / claim:** `claimReferral()` is a pull-payment withdrawal of `referralOwed`
(`nonReentrant`, `NothingToClaim` on empty, `ReferralClaimed`). Supports
smart-contract referrers (DAOs / smart wallets) that may revert on push.

**Views for the frontend:** `tierFor(count)`, `quoteCommission(referrer, opsSlice)`,
`sourceConfig(caller)`, plus the `referredCount` / `referralOwed` public mappings.

**Conservation invariants (per `route`):**
- `referrerAmount + operationsAmount == opsSlice` (no dust, no leak).
- `referrerAmount <= opsSlice` always (max tier 80% < 100%).
- Vault/Liquidity are never moved by the router (only echoed into `splits[0..1]`).
- A revert in `route` reverts the `transferFrom` pull in the same frame, so the
  caller's `try/catch` re-routes an **untouched** slice (clean fallback).

---

## Output 5 — Sale V2 integration

- **State:** `commissionRouter` (active), `pendingCommissionRouter` +
  `commissionRouterReadyAt` (timelocked swap). The sale holds **no** `referralOwed`
  and no `claimReferral` anymore.
- **Day-one wiring:** `initialRouter` constructor param. When set, the sale issues a
  max `approve` to the router so `route`'s `transferFrom` pull works from the first buy.
- **Swap lifecycle (asymmetric by design):**
  - Add/replace: `proposeCommissionRouter` → wait `ROUTER_TIMELOCK` (7 days) →
    `confirmCommissionRouter` (re-approves the new router, zero-approves the old).
    *Adding* authority is slow on purpose.
  - Disable: `disableCommissionRouter` is **instant** (zeroes the router → every buy
    pays the full Operations slice straight to Operations). *Removing* authority is fast.
- **`buy()` money path (CEI-ordered):** recognize V1 (if proof) → validate (era, min,
  cap, slippage, inventory) → write all state → pull USDC in → pay Vault & Liquidity
  in full → **hand the Operations slice to `commissionRouter.route` under `try/catch`**;
  if the router is unset or the call reverts, pay the full slice directly to Operations
  and emit `CommissionRouterFallback` → push SYN out → emit `Routed` + `Purchased`.
- **Untouched:** 70/20/10 split, era/cap/reserve engine, V1 continuity (Merkle root +
  `knownMember` + `claimV1Membership`), no oracle, immutable wallets.

The `CommissionRouteInput` struct is duplicated **byte-for-byte** in both drafts; a
mismatch is an ABI break caught at integration.

---

## Output 6 — Event & RAL schema

**Router (single RAL emitter):**

```
Attribution(
  bytes32 indexed source,     // sourceId of the calling sale
  address indexed buyer,
  address indexed referrer,   // address(0) when no valid referral
  bytes32 campaign,           // reserved (0 in V1)
  bytes32 refTag,             // reserved (0 in V1)
  address token,              // USDC
  uint256 gross,              // full USDC paid by buyer
  uint16  tier,               // 0..4 (0 = Signal/none)
  uint256[5] splits,          // [vault, liquidity, referrer, operations, protocol]
  uint8   paymentMode,        // 0 push, 1 escrow
  uint8   attributionMode     // 0 last-verified (1 buyer-override reserved)
)
ReferralEscrowed(referrer, amount)
ReferralClaimed(referrer, amount)
ReferredCountIncremented(referrer, newCount)
SourceAdded(caller, sourceId, operationsWallet) / SourceRemoved(caller, sourceId)
OwnershipTransferStarted / OwnershipTransferred
```

**Sale:** `Routed(memberNumber, vault, liquidity, operations, referral)` (the
`referral` leg mirrors the router's `splits[2]`), `CommissionRouterFallback(memberNumber,
operationsAmount)`, and the timelocked-wiring lifecycle events. The sale **no longer**
emits any referral-attribution event itself.

**RAL conformance** (vs `docs/REVENUE_ATTRIBUTION_LAYER.md`): the on-chain
`Attribution` event carries every locked-V1 field, including the reserved
`campaign`/`refTag` (0 in V1), `splits[4]` protocol slice (0 in V1), and
`attributionMode` (0 last-verified; **buyer-override = 1 is reserved**, not
implemented). This **resolves open decision J6**: the router emits the full RAL struct
on-chain rather than projecting it indexer-side.

---

## Output 7 — Reputation / Builder-Record readiness

The router computes **no** reputation, retention, durability, or Builder-Record math.
It only emits the data those layers need:

- **Builder Record** (`docs/BUILDER_RECORD_DOCTRINE.md`): a derived view over
  `Attribution` + `ReferredCountIncremented` events. `referredCount` (verified
  first-seat referrals) is the only on-chain tier axis; everything richer
  (retention, durability, age, reach) is projected off-chain.
- **Reputation formula** (`docs/REPUTATION_FORMULA_DOCTRINE.md`): a score function
  over Builder Records — stays off-chain. The preview formula in `referral.ts`
  (`builderScore`) is and remains **quarantined** (money-weighted, A/B/C/D class;
  must never raise a Signal tier > S2, create an S3+ signal, a Chronicle candidate,
  confer governance, or imply ROI).
- **RAL guardrail honored:** money may feed Financial Trace / rank recognition as
  *one* input, but never alone raises a Signal tier or implies return. The router's
  `tier` field is a referral-attribution label, **not** a rank.

The single on-chain commitment that keeps all of this future-proof is the `bytes32`
governance-gated `source` field: new B2B / affiliate / white-label sources are a
config change (allow-list vote), not a contract migration.

---

## Output 8 — Frontend readiness (classified)

**No `src/` was changed this sprint** (forbidden). Classification of existing
surfaces against the new router model:

| Surface | Class | Note |
| --- | --- | --- |
| Sale V1 buy flow, holder index, `/members`, cockpit | **LIVE / UNCHANGED** | V2 is draft; nothing live moved. |
| `/referral` page + `REFERRAL_TIERS` ladder | **VISIBLE-FUTURE (SIMULATED)** | The tiered preview already shows the exact 30/40/55/70/80 ladder — it matches the router. Must be **rebound** to the router's on-chain `referredCount`/`tierFor`/`quoteCommission` when wired. |
| `SIM_REFERRERS` / `SIM_REFERRAL_EVENTS` / `SIM_TREASURY_ROWS` / charts | **SIMULATED** | Mock data; no contract. |
| `referral.ts` `TREASURY_CATEGORIES` (`OPERATIONS_TO_REFERRER: 5`) and `SIM_REFERRAL_EVENTS` commission figures | **SIMULATED — STALE EXAMPLE** | These still depict the *old flat-5%* example numbers. **Not changed** (src/ frozen); flagged as a frontend follow-up to recompute from the live tier when the buy path is wired. |
| `builderScore` / money-weighted scoring | **HIDDEN / QUARANTINED** | Labs-only; must never feed live recognition (A/B/C/D class). |
| Buy component, protocol-event pipeline, persistence cache | **UNCHANGED — FUTURE WORK** | When V2 ships: `buy(usdcIn, referrer, minSynOut, v1Proof)`, add `referral`/`era-advanced` event kinds, extend the localStorage scan. Out of scope here. |

**Key alignment win:** `REFERRAL_TIERS` in `referral.ts` is *already* the canonical
ladder the router encodes, so the preview UI and the contract agree on day one — only
the **data source** (mock → router reads) must change, not the tier numbers.

---

## Output 9 — Test matrix (for the eventual implementation)

| Area | Case | Expected |
| --- | --- | --- |
| Tier | count 0/5/20/50/100 → 30/40/55/70/80% of Ops slice | `_tierFor` exact; boundary takes higher tier |
| Valid referral (Signal) | distinct known member, count < 5 | 30% of Ops to referrer, 70% of Ops to Operations, 70/20 untouched; `Attribution(tier=0, paymentMode=push)` |
| Count increment | valid **first-seat** vs repeat buy | first-seat → `referredCount++` + `ReferredCountIncremented`; repeat buy pays commission but **no** increment |
| Invalid (non-member / self / zero) | `knownMember=false` / `referrer==buyer` / `0` | commission 0, full slice to Operations, `Attribution(referrer=address(0))`, no increment |
| Escrow | mock USDC reverts on transfer→referrer | router escrows to `referralOwed` (`paymentMode=escrow`), forwards remainder, buy succeeds; `claimReferral` pays; double-claim `NothingToClaim` |
| Fallback | router unset OR `route` reverts | sale pays full Ops slice to Operations, `CommissionRouterFallback`, buy succeeds |
| Authorization | non-allow-listed caller → `route` | `NotAuthorizedSource`; disabled source rejected |
| Governance | `addSource` dup → `SourceExists`; `removeSource` unknown → `UnknownSource` | as stated |
| Timelock (sale) | `confirmCommissionRouter` before `ROUTER_TIMELOCK` | `RouterTimelocked`; after → succeeds; `disableCommissionRouter` instant |
| Conservation | every path incl. fallback | `referrer + operations == opsSlice` AND `vault + liquidity + opsSlice == usdcIn`; router USDC balance == Σ `referralOwed`; sale transient USDC == 0 |
| Reentrancy | malicious token re-enters `route`/`claimReferral` (router) or `buy` (sale) | blocked by `nonReentrant` + CEI |
| Caps (router) | `referrerAmount > opsSlice` | unreachable; `OpsCapExceeded` defensive guard |

---

## Output 10 — Risk matrix

| # | Risk | Mitigation |
| --- | --- | --- |
| R1 | Malicious/buggy router drains or misroutes | Router only ever pulls the **Operations slice** (Vault/Liquidity already paid); governance-set behind a 7-day timelock; instant disable; reverting router → safe full-slice fallback |
| R2 | Reentrancy via callback token | `nonReentrant` + strict CEI; USDC is non-callback; router called last among value moves |
| R3 | Self / fake referral skims Operations | Router re-validates non-zero / non-self / `knownMember` against the calling sale |
| R4 | Referral griefing (reverting referrer bricks buy) | `try/catch` push → escrow; remainder always forwarded; whole-`route` revert → sale fallback; buy never reverts |
| R5 | Source spoofing / redirected Operations funds | `operationsWallet` is governance-set per source, never caller-passed; `route` gated on the allow-list |
| R6 | Tier gaming via cheap repeat self-buys | Count increments only on **valid first-seat** referrals (self-referral already invalid); see open decision OD-1 on commission-on-every-buy |
| R7 | ABI drift between sale and router | `CommissionRouteInput` duplicated byte-for-byte; integration test asserts parity |
| R8 | Owner abuse | No price/split/wallet setters; owner cannot withdraw USDC or touch escrow; `Ownable2Step` + multisig recommended |
| R9 | Sale-side `Routed` event trusts `route()` return values | A buggy/malicious approved router could return misleading split numbers, so the sale's `Routed.referral`/`operations` could disagree with reality even though the router's `Attribution` is canonical. Mitigation for implementation: either assert `refPaid + opsPaid == opsSlice` on return before emitting `Routed`, or have indexers treat the router's `Attribution` as **authoritative** for referral splits and the sale's `Routed` as non-canonical for the referral leg. (Architect note; not severe — a malicious router is already timelock/disable-gated and can only touch the Operations slice.) |

---

## Output 11 — Files changed

| File | Change |
| --- | --- |
| `docs/proposals/drafts/CommissionRouterV1.draft.sol` | **NEW** — full router draft (355 lines), header-gated NOT-FOR-DEPLOYMENT |
| `docs/proposals/drafts/SyndicateSaleV2.draft.sol` | Inline referral removed; `ICommissionRouter` + `CommissionRouteInput`, router state, `initialRouter` ctor, timelocked swap, `buy()` routes Ops slice with fallback |
| `docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` | §D rewritten (router); §L re-synced byte-identical; §R added (router architecture + embedded `.sol`); drift-sync across exec-summary, §E/§G/§H/§I/§J/§K/§N/§O/§Q |
| `docs/proposals/SALE_V2_COMMISSION_ROUTER_V1_SPRINT.md` | **NEW** — this report |

Both embeds in the architecture doc (§L sale, §R router) are verified **byte-identical**
to their source `.sol` files. `src/` was not touched.

---

## Output 12 — Open decisions (founder confirmation)

| # | Decision | Current draft behavior | Needs |
| --- | --- | --- | --- |
| **OD-1** | Commission on **every** eligible buy, or **first-seat only**? | Commission paid on every valid-referrer buy; the tier **count** increments on first-seat only (J5). | Founder confirmation — paying on repeat buys is defensible (RAL "every sale") but widens the tier-gaming surface vs first-seat-only commission. |
| **OD-2** | `retentionRequiredPct` enforcement | **Off-chain only** in V1 (never gates a live payout). | Confirm retention stays a read-model gate, not on-chain. |
| **OD-3** | `attributionMode` buyer-override | Reserved (`attributionMode = 1` defined, not implemented; V1 always last-verified). | Confirm override is deferred. |
| **OD-4** | `campaign` / `refTag` / `splits[4]` protocol slice | Reserved (0 in V1). | Confirm V1 ships with these zeroed. |
| **OD-5** | Router owner | `Ownable2Step`; multisig recommended. | Confirm the multisig owner address before any deploy. |
| **OD-6** | `ROUTER_TIMELOCK` duration | 7 days (add/replace). | Confirm duration. |
| **OD-7** | Event authority: sale `Routed` vs router `Attribution` for referral splits | Sale `Routed.referral` mirrors the router's returned `splits[2]`; the router's `Attribution` is the canonical RAL emitter. | Decide for implementation: assert `refPaid + opsPaid == opsSlice` before emitting `Routed`, **or** declare the router's `Attribution` authoritative for referral splits and `Routed` non-canonical for that leg (R9). |

(These extend, not replace, the existing §J human-review items in the architecture doc.)

---

## Output 13 — Architect review

**Verdict: PASS** (architect / code-review pass over both drafts + the architecture
doc + sprint report with `includeGitDiff: true`). The Sale V2 → CommissionRouter V1
design is internally consistent, preserves 70/20/10, accounts for the Operations slice
on every intended path (valid / invalid / escrow / fallback), and has **no severe
correctness or security issue** blocking hand-off to a human Solidity auditor.

**Confirmed sound:**
- **Money flow** — sale pulls full USDC, pays Vault & Liquidity before the router call,
  routes only `opsSlice`; the router pulls exactly `p.opsSlice`, applies the canonical
  30/40/55/70/80% Operations-slice tier table, escrows failed pushes, forwards the
  remainder, and emits `Attribution`.
- **Conservation** — `referrerAmount + operationsAmount == opsSlice`; invalid/no/self
  referrer yields the full Operations remainder; escrow leaves router balance ==
  `Σ referralOwed`; the sale fallback preserves full Operations payment when the router
  is unset/reverts.
- **Custody / approval** — max approval is bounded in practice by the sale's transient
  post-Vault/Liquidity balance; timelocked replace + instant disable is the correct
  asymmetry; `nonReentrant` + CEI acceptable for draft review.
- **Security controls** — allow-list, governance-set operations wallet, referrer
  non-zero/non-self/known-member validation against the calling sale, escrow-on-failure,
  no oracle / no reputation math. A malicious approved router can only misroute/drain
  USDC transiently held by Sale V2 — **never** the already-paid Vault/Liquidity slices —
  and is timelock/disable-gated (kept on the auditor risk list).
- **Doc integrity** — §L and §R embeds verified byte-identical to the `.sol` drafts;
  sprint report has all 13 outputs; OD-1 captures commission-on-every-buy vs
  first-seat-only.

**Lower-priority note (addressed):** the sale's `Routed` event trusts `route()` return
values, so a buggy/malicious router could emit misleading sale-side split data even when
the router's `Attribution` is canonical → captured as **R9** (risk matrix) and **OD-7**
(open decision) for the implementation phase.

**Architect's recommended next actions:**
1. ✅ Populate this Output 13 (done).
2. Founder/auditor resolve **OD-1** (commission every eligible buy vs first-seat-only)
   before implementation.
3. Add deploy-grade tests for conservation, fallback, escrow, tier boundaries, the
   allowance swap, and sale-vs-router event consistency (mapped in Output 9 + R9/OD-7).

No code changes were required by the review (no severe findings).
