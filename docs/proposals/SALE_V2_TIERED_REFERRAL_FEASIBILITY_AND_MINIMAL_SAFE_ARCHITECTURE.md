# The Syndicate — Tiered Referral: Feasibility & Minimal-Safe Architecture

**Question:** the safest way to launch **tiered** referral with Sale V2 — or the exact technical
reason it cannot be done without unacceptable risk.

**Founder preference honored:** tiered live with V2 **if technically safe**; flat 5% acceptable only as
a **base/fallback layer**, never the final experience; framing is **attribution / builder / durability
/ retention / verified introduction quality / participation** — never yield / ROI / revenue-share /
rank-based ownership.

**Strict scope:** READ-ONLY analysis. No code, no Solidity, no frontend, no deploy, no new economics.
This grounds its answers in the actual draft (`docs/proposals/drafts/SyndicateSaleV2.draft.sol`) and
the existing designed tiers (`src/lib/preview/referral.ts`). It invents no new numbers.

---

## The single technical fact that decides everything

A sale contract can only tier on data **it can compute on-chain, deterministically, at the moment of
the buy, without trusting an off-chain feed.** Sorting the proposed tier inputs against the draft:

| Tier input | On-chain at tx time? | Why |
| --- | --- | --- |
| **Referred-member count** | ✅ **YES** | The contract already sets `knownMember` and issues seats; adding `mapping(address=>uint256) referredCount` incremented on each valid, first-seat referral is deterministic and oracle-free. |
| **Referrer member age** | ✅ YES (cheap add) | Record `joinedAt[addr]=block.timestamp` on first seat; age = `now − joinedAt`. |
| **Verified introduction (is referrer a real member)** | ✅ Already live | `knownMember[referrer]` — V1 set by immutable Merkle root (`V1_MEMBER_ROOT`) / `claimV1Membership`, V2 set on purchase. |
| **Retained referred members / retention / durability** | ❌ **NO** | The sale never observes whether a referred member later sells/transfers. Computing it on-chain means either an unbounded `balanceOf` loop over every referred member (gas-prohibitive + wash-holdable) or trusting an off-chain indexer/oracle inside an **immutable** money-routing contract. |
| **Builder record / reputation score** | ❌ NO | Off-chain aggregate → oracle/indexer trust. Same problem. |
| **SYN balance / rank amount** | ⛔ Forbidden | Wealth-weighted; legally and doctrinally banned. |

**Conclusion:** **count-based (and optionally age-based) tiering is safely live today; reputation /
retention / durability / builder-record tiering is NOT safely live in an immutable contract.** This is
not a preference — it is what the contract can and cannot verify.

This single fact is why the *richer* vision must live in a component that can evolve **without
redeploying the sale** — which is the whole architecture question below.

---

## Three-path evaluation (all 15 questions)

"Operations slice" = the ~10% that remains after Vault 70% + Liquidity 20% (paid first, never touched).
"Count tier" = tier derived from `referredCount`.

| # | Question | **A — tiered inside Sale V2** | **B — CommissionRouter from day one** | **C — hybrid minimal tiered V2** |
|---|---|---|---|---|
| 1 | Data the contract needs | `referredCount` + immutable tier table | same, but held in the **router**; sale passes `(referrer, buyer, firstSeat, opsSlice)` | `referredCount` + small immutable tier table in the sale |
| 2 | Available on-chain today? | Count: yes (contract-tracked). Retention/reputation: **no** | Same | Same |
| 3 | Can it safely compute the tier? | Count: **yes** (integer compare). Richer: no | Count: **yes**. Richer: added later by router upgrade | Count: **yes**. Richer: no |
| 4 | Needs indexer/oracle/off-chain trust? | No (count only) | No (count only); router **pointer** is governance, not an oracle | No (count only) |
| 5 | Can it be gamed? | Self-referral farming via many wallets — but each fake referral is a **real ≥-era-min USDC buy**, bounded by Operations-only, blocked by `referrer != buyer`. Count-only is *more* farmable than count+retention | Same gaming surface; **retention gating (the anti-farm axis) can be added later with no sale change** | Same as A |
| 6 | Preserves 70/20/10? | ✅ Yes | ✅ Yes (sale pays Vault/Liq **before** calling the router) | ✅ Yes |
| 7 | Referral only from Operations? | ✅ Yes | ✅ Yes — router only ever receives the opsSlice | ✅ Yes |
| 8 | Max referral % without diluting Vault/Liquidity | **10% of gross** (the entire Operations slice) is the hard ceiling | Same hard ceiling | Same |
| 9 | What happens to Operations at each tier | Ops keeps `opsSlice − referral`: 70%→20% of Ops across tiers; full 10% if no referrer | Same | Same |
| 10 | Audit / security risks | Tier table **immutable in the sale** → a mispriced tier can never be fixed; larger immutable surface | One **trusted external call** to a swappable router → must be **timelocked pointer + try/catch fallback + CEI + nonReentrant**; an evolvable money component is the main new risk → **bounded to the Operations slice only** | A's risks **plus** a future migration seam (dead inline tier logic once a router arrives) |
| 11 | Frontend changes required | None to launch; optional read-only tier display | Same (reads count/tier from router) | Same |
| 12 | Docs / legal changes | Reframe referral as **count-based attribution tiers**, not flat-forever | Same + document router governance + timelock | Same |
| 13 | What can remain future | Reputation, retention, builder, campaign, source/B2B/marketplace, buyer-override — **but reaching them requires a new sale or a router that supersedes the inline logic = migration** | **All of the above arrive as router upgrades with ZERO sale change** | Same migration problem as A |
| 14 | Breaks the parameter / economic model? | ❌ No — referral only sub-divides the USDC Operations slice; SYN era/cap/reserve/pricing untouched | ❌ No | ❌ No |
| 15 | Delays launch significantly? | Small delay (counter + table + tests on the existing draft) | **Larger** delay now (2nd contract + interface + cross-call + audit of both + timelock) — but **avoids the far larger later cost** of redesign/migration | Small delay now, **pays the migration cost later** |

**The deciding row is #13 + #15 against the founder's stated #1 fear** ("don't launch, then come back to
redesign / rewrite doctrine / rewire frontend / debug migration"):

- **A and C both deliver tiered-now but reintroduce migration** the moment the richer vision (reputation
  / retention / builder / campaign) is added — because that logic cannot be bolted onto an immutable
  sale.
- **Only B delivers tiered-now AND never-migrate.** The sale stays immutable; the tiered/reputation/
  builder/campaign roadmap lands as **router upgrades behind a timelock**, with the sale untouched.

---

## 1 — Final recommendation

## ✅ **B — CommissionRouter from day one**, launched with the **minimal count-based tier table**.

No fence-sitting. B is chosen specifically because it is the **only** path that satisfies all three of
the founder's hard constraints at once: **tiered live with V2**, **safe (no oracle, Operations-bounded
blast radius)**, and **no future migration/redesign**. Flat 5% survives as **tier 0 / the fallback**,
exactly as the founder permitted — not as the final experience.

A and C are rejected **not because they are unsafe at launch** (the count tier is safe in all three),
but because they bake referral logic into the immutable sale and therefore force the redesign/migration
the founder explicitly refuses to repeat.

---

## 2 — Tiered CAN be live. The exact minimal design.

### Minimal tier table (count axis only — existing designed economics, retention gate deferred)

These are the **existing** designed tiers (`src/lib/preview/referral.ts` `REFERRAL_TIERS`), launched on
the **one axis the contract can verify on-chain (verified referred-member count)**. The
`retentionRequiredPct` from the design is **deferred to the future router** (it needs off-chain data).
Nothing here is a new number.

| Tier | Name | Threshold (verified referred members) | Commission (% of **Operations** slice) | = % of gross | Operations keeps |
|---|---|---|---|---|---|
| 0 | **Signal** | 0 | 30% | 3.0% | 7.0% of gross |
| 1 | **Advocate** | 5 | 40% | 4.0% | 6.0% of gross |
| 2 | **Connector** | 20 | 55% | 5.5% | 4.5% of gross |
| 3 | **Catalyst** | 50 | 70% | 7.0% | 3.0% of gross |
| 4 | **Ambassador** | 100 | 80% | 8.0% | 2.0% of gross |

- **Tier names** avoid the reserved words "Patron"/"Council"; they are attribution labels, not ranks.
- **Flat 5% (50% of Operations)** is retained as the **fallback rate** when the router pointer is unset
  (graceful degradation) — the founder's "base layer," not a tier.

### Max commission ceiling
- **Hard protocol ceiling: 10% of gross** (the entire Operations slice). The router must enforce
  `referral ≤ opsSlice` so it can **never** dip into Vault/Liquidity.
- **Recommended top tier: 8% of gross** (80% of Operations / Ambassador), leaving Operations a 2%-of-
  gross runway for infra/audit.

### How Operations is split (per buy)
1. Sale computes `vault = 70%`, `liquidity = 20%`, `opsSlice = remainder (~10%)` — **unchanged from the
   draft**, paid to Vault and Liquidity **first**.
2. Sale forwards **only `opsSlice`** to the CommissionRouter.
3. Router computes `tier = tierForCount(referredCount[referrer])`, pays
   `referral = opsSlice × tierBps[tier] / 10_000` to the referrer (push-then-escrow), forwards the
   remainder to the Operations wallet, increments `referredCount[referrer]` on a valid first-seat
   referral, emits lean events.

### What the contract must verify (on-chain, every buy)
- `referrer != address(0) && referrer != buyer && knownMember[referrer]` (already in the draft).
- `referral ≤ opsSlice` (Operations-bounded; Vault/Liquidity untouched).
- Tier lookup is a pure integer comparison over `referredCount` (no external read).
- Router-call failure (or unset router) **must not block the buy** → fall back to paying Operations the
  full slice (mirror the existing escrow-on-failure pattern).
- CEI ordering + `nonReentrant` preserved across the added external call.

### What is immutable
- The sale's **70/20/10 split** and the entire SYN era/cap/reserve/pricing engine.
- The **hard ceiling** `referral ≤ opsSlice` (Vault/Liquidity can never be reached by referral).
- Everything in the sale **except one** governance-settable, **timelocked** `commissionRouter` address
  — the single, deliberately-bounded point of future flexibility, whose blast radius is capped at the
  Operations slice.

### What remains future (router upgrades — no sale change ever)
Retention/durability gating, reputation weighting, builder records, campaign/`refTag`, `source`
attribution (B2B / affiliate / sponsorship / archive / marketplace), buyer-override, leaderboard
productionization, Mythology-Gate artifacts. All land by pointing the timelocked router address at a
richer router. **The sale is never redeployed.**

---

## 3 — What CANNOT be live safely (and the no-migration guarantee)

**Exact blocker:** retention / durability / reputation / builder-record tiering **cannot be computed
safely on-chain in an immutable money-routing contract.** The sale never witnesses whether referred
members stay; computing it means an unbounded `balanceOf` loop (gas-prohibitive + wash-holdable) or
trusting an off-chain oracle that, once wired into an immutable contract, can never be corrected if
manipulated. So those axes **must** be off-chain-derived and live in an evolvable component.

**Why flat 5% is only a temporary technical fallback (not the design):** flat exists in this
architecture purely as the router-unset default. The live launch is **tiered (count-based)**; flat is
the floor beneath tier 0.

**Preserve the full vision visibly on-site** (already true; keep it): `/referral` keeps the SIMULATED
tier ladder + reputation leaderboard + builder-score, clearly labeled "future CommissionRouter." The
launch makes the **count tiers real** while the **reputation/retention layer stays a visible future
preview** — no surface is removed.

**No-migration path from flat → tiered router (this is the point of B):**
1. Ship the sale with the **timelocked `commissionRouter` pointer** and Operations-bounded handoff.
2. Launch **Router v1** = count-based tier table (this report's table). Tiered is live.
3. Later, deploy **Router v2** adding retention/reputation/builder/campaign/source from off-chain
   derivations; governance re-points the timelocked pointer. **Sale untouched, no frontend rewire of
   the sale, no doctrine rewrite, no migration.**

---

## 4 — Execution plan

### Before Solidity review (design must be settled first)
- Founder ratifies **Path B + the count-based launch tier table** above.
- Produce a **Sale↔Router interface spec** (one page): the sale's `commissionRouter` timelocked
  pointer, the `route(referrer, buyer, firstSeat, opsSlice)` call, the Operations-bounded invariant,
  and the unset/failed-call fallback.
- Freeze the **launch tier table** (count thresholds + bps) and **J6 = lean events** for both contracts.
- Add a **router section to the Solidity review checklist** (trusted-call safety, timelock, blast-radius
  bound, reentrancy, counter integrity, fallback).

### Before deployment
- Legal wording: "commission = a share of the **operational budget** that scales with **verified
  introductions**; not yield/ROI/revenue-share/rank ownership." Lock allowed/forbidden vocabulary.
- `/referral`, My Syndicate, and preview labels: count tiers → live; reputation/retention → "future."
  Flip `noindex`/SIMULATED only on the now-live portions.
- Reconcile docs that say payout is PENDING / recognition-only / "fixed 5% forever."
- Testnet/Fuji rehearsal of **sale + router** together; independent audit of **both** + the cross-call.

### After deployment
- Router v2: retention/reputation/builder/campaign/source/buyer-override/marketplace/B2B, richer
  analytics, leaderboard productionization, Mythology-Gate artifacts — all via timelocked re-point.

### What to visually inspect on the site
- `/referral`: count tiers labeled **live**; reputation leaderboard + builder score still labeled
  **SIMULATED / future**; 70/20/10 split graphic unchanged; no yield/ROI language.
- My Syndicate: referral card shows your live tier from `referredCount`, your link, escrow/claim — no
  "earn/yield" verbs.
- Verify a real buy with a referrer shows Vault 70% / Liquidity 20% **untouched** and the referral
  coming **only** from Operations.

---

## 5 — Stop / Go

## **NO — Sale V2 / CommissionRouter design must change first.**

Solidity review **cannot** proceed on the current draft as-is, because the current draft pays referral
**inline and flat** (`refAmt = opsSlice / 2`). Choosing B is a **design change**, and reviewing the
inline draft would be reviewing the wrong architecture.

**Exact design changes required before review:**
1. Extract referral out of `SyndicateSaleV2` into a separate **CommissionRouter** contract.
2. Add to the sale a single **governance-settable, timelocked `commissionRouter` address** (the only
   new mutable field); everything else stays immutable.
3. Sale pays **Vault + Liquidity first**, then hands **only the Operations slice** to the router; on
   unset/failed router call, pay Operations the full slice (buy never blocked).
4. Router holds `referredCount`, the **count-based tier table** (governance-settable bps, hard-capped
   at `opsSlice`), push-then-escrow payout, and lean events.
5. Define the **Sale↔Router interface** and the **Operations-bounded blast-radius invariant** as the
   first things the reviewer checks.

Once these are reflected in an updated draft, the review proceeds against this **frozen design**:
flat is tier 0/fallback only; tiers are count-based and on-chain; reputation/retention/builder/campaign
are future router upgrades reachable **without ever redeploying the sale.**

---

*This document writes no code, modifies no Solidity, changes no frontend, and deploys nothing. It
selects the only architecture that launches tiered referral safely while preserving the full
tiered/reputation/builder-record vision as a no-migration future CommissionRouter.*
