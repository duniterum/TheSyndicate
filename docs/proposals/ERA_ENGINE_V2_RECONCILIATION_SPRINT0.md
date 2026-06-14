# The Syndicate — Era Engine (V2) Reconciliation Report · Sprint 0

> **Scope.** This is the **report required before any change** (your section 13). It reconciles the proposed "infinite game" (Era Engine / packs / ladders / Signal Chamber) against current live canon. **No code, config, contracts, or canon were modified.** Sale V1 (Genesis) is untouched. Nothing here is deployed.
>
> **Anchors preserved:** V1 = Genesis (live, $5 min, 1 SYN = $0.01, $5 = 500 SYN); USDC 70/20/10; SYN token unchanged; Membership Distribution = 350M SYN; Member ≠ Holder; existing ranks/chapters/referral-preview/Archive/cockpit/guardrails; forbidden wording stays forbidden.
>
> Date: 2026-06-14. Companion to `docs/audits/TODAY_BASELINE_STATE_SNAPSHOT.md`.

---

## EXECUTIVE RECONCILIATION (read first)

The proposal is **mostly compatible** with current canon and can be staged safely, **but it contains 4 hard conflicts that must be resolved before any UI ships**, plus a clean way to add everything else additively.

**The 4 hard conflicts:**

1. **Per-era SYN schedule vs the on-chain fixed rate.** Today `1 SYN = $0.01` is canon **and enforced on-chain** by Sale V1 (`quoteSyn`). The Era Engine makes SYN-per-USDC *decline by era* (early members get more SYN). This cannot run on V1. **Resolution:** Genesis (Era 1) stays $0.01 fixed on V1; Eras 2+ are a **configured/simulated distribution schedule** until a V2 sale contract with a per-era rate is reviewed and deployed. No V1 change.

2. **Pack names collide with rank names at the wrong prices.** Proposed "Builder $25 / Steward $100 / Architect $500" reuse existing rank names whose real thresholds are Builder $50 / Steward $500 / Architect $250. Shipping these would create two meanings per word. **Resolution:** make packs = curated entry points **named after the rank their USDC actually unlocks** (zero new vocabulary, zero collision). See Part B.

3. **Referral preview is currently tiered; you now want fixed 5% for V2.** The live `/referral` preview renders a "commission by tier" chart. **Resolution:** reframe the preview to **fixed 5% (V2)**; relabel tiered as **V3/future**. Commission source (Operations only) already matches canon — no conflict there.

4. **"Open Era" already exists as a single unbounded Chapter V (#10,001+); the proposal splits it into 6 finite eras.** **Resolution:** keep **Chapters** as the narrative/identity layer (do not rename); add **Eras** as a separate **distribution-schedule layer**. Chapters I–IV map 1:1 to Eras 1–4 (identical boundaries — verified). Chapter V "Open Era" becomes the **narrative umbrella** containing schedule Eras 5–10.

**Everything else** (seat ladder, artifact ladder, marketplace phases, Signal Chamber, next-step cockpit, DEX/sale price doctrine, future SYN utility) is **additive and legal-safe** with the wording rules below.

---

## PART A — EXISTING CANON vs PROPOSED IDEAS

| Existing system (today) | Proposed idea | Conflict? | Recommendation | Files affected (later sprints) |
| --- | --- | --- | --- | --- |
| `ACCESS_RATE_USDC_PER_SYN = 0.01`, fixed, enforced on-chain by Sale V1 `quoteSyn` | Per-era declining SYN schedule | **YES (hard)** | Genesis stays $0.01 on V1; Eras 2+ = config/sim only until V2 contract. Make rate **era-scoped**, never retro-applied to Genesis | `syndicate-config.ts`, new `eras.ts`, V2 sale spec |
| 5 chapters (`chapters.ts`), Chapter V "Open Era" = #10,001+ unbounded | 9–10 finite eras with prices + SYN | **YES (medium)** | Two-layer: keep Chapters (story) untouched; add Eras (schedule). Eras 1–4 = Chapters I–IV boundaries; Eras 5–10 live inside Chapter V | new `eras.ts` (additive); `chapters.ts` unchanged |
| 12 ranks by cumulative USDC, recognition-only (`RANKS_V2`) | "Pack ladder" (6 packs) | **YES (naming)** | Packs = curated presets named by the rank they unlock; do NOT invent rank-colliding names; ranks stay the source of truth | `syndicate-config.ts` presets, new pack-catalog (UI) |
| Ranks recognition-only, no rights/returns | Packs grant "progression path," "future artifact eligibility" | Soft | Keep packs = recognition + curated entry; artifact eligibility = identity, never financial promise | docs, cockpit |
| `/referral` simulated, **tiered** commission, from Operations only | Fixed 5% V2, from Operations, atomic same-tx; tiered = later | **YES (version)** | V2 = fixed 5% only; tiered → V3. Source (Operations) already correct; Vault/Liquidity never diluted | `referral.tsx`, `ReferralPreview`, `LEGAL_DISCLOSURE_REFERRAL.md` |
| Referral paid by contract | "Commission paid atomically in same tx" | YES (needs contract) | Requires V2 sale; spec-only now. V1 has no referral path | V2 sale spec |
| Archive1155 V1 = collectible artifacts; SeatRecord721 reserved/disabled (ID 2) | Artifact ladder tied to packs/eras | No | Keep Archive1155 collectible-only; SeatRecord721 stays PENDING; eligibility = "proof of being there," no value claim | docs, cockpit, archive config |
| Governance = "pending, no rights promised" (canon-reserved) | **The Signal Chamber** (advisory, non-binding) replaces "DAO" framing | Soft (terminology) | Adopt "Signal Chamber" as member-facing name for the advisory layer; never imply binding governance/ownership/treasury/dividends. **Note Signal-root collision** (see below) | docs, roadmap, new `/signal-chamber` (future) |
| "Signal" root already heavily used: Signals Engine (Type×Tier×Subject), "The First Signal" (Archive ID1), "Genesis Signal" (Chapter I), LivePulseStrip | "Signal Chamber" new surface | **Terminology collision (4th meaning of "Signal")** | Keep if desired, but document the 4 meanings in the glossary and scope each; alternative names worth weighing: "Member Voice," "The Forum (advisory)" | `docs/03_GLOSSARY.md` |
| No "pack" concept anywhere (verified) | Pack ladder | No (clean) | Safe to introduce as a UI/marketing layer | new pack-catalog |
| Marketplace = not present | Marketplace V1/V2/V3 roadmap | No | Roadmap/docs/UI placeholder only; comes before Signal Chamber (utility first) | roadmap |
| DEX price (LP) + sale price both exist | Two-price doctrine (access vs market) | No (reinforces canon) | Document explicitly; never peg/floor/defense wording | docs, token/liquidity pages |
| Cockpit = identity arc, "Building" zone is PENDING placeholder | Next-step engine (8 "next" surfaces) | No (this is the key UX add) | Build as Sprint 2 UI deriving "next" from current member state | `my-syndicate.tsx`, cockpit components |
| Forbidden wording list | "direct sales commission," era distribution language | No | All proposal language is compliant **if** referral = "direct sales commission from Operations," eras = "distribution schedule," never price/return | guardrail scripts |

---

## PART B — FINAL RECOMMENDED DECISION SHEET

### B1. Eras (distribution-schedule layer — additive, not a chapter rename)

Boundaries for Eras 1–4 are **identical to existing Chapters I–IV** (verified against `chapters.ts`). Eras 5–10 subdivide Chapter V "Open Era."

| Era | Member range | Maps to Chapter | Entry price | SYN per entry | Implied rate ($/SYN) | Live? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 · Genesis Signal | #1–333 | I (same) | $5 | 500 | $0.01 | **LIVE (V1)** |
| 2 · First Thousand | #334–1,000 | II (same) | $10 | 500 | $0.02 | V2 (sim) |
| 3 · Expansion | #1,001–3,333 | III (same) | $10 | 400 | $0.025 | V2 (sim) |
| 4 · First Ten Thousand | #3,334–10,000 | IV (same) | $25 | 400 | $0.0625 | V2 (sim) |
| 5 · Open Era I | #10,001–25,000 | V (umbrella) | $25 | 300 | $0.0833 | V2 (sim) |
| 6 · Open Era II | #25,001–50,000 | V | $50 | 300 | $0.1667 | V2 (sim) |
| 7 · Hundred Thousand | #50,001–100,000 | V | $50 | 200 | $0.25 | V2 (sim) |
| 8 · Quarter Million | #100,001–250,000 | V | $100 | 200 | $0.50 | V2 (sim) |
| 9 · First Million | #250,001–1,000,000 | V | $100 | 100 | $1.00 | V2 (sim) |
| 10 · Million+ | #1,000,001+ | V | TBD | 50–100 or 0 after inventory | TBD | Future |

**Recommendation on $99 vs $100 (Eras 8–9):** use **$100** — keeps round math, matches an existing rank threshold (Vanguard $100), and avoids a third price point near $100.

### B2. Entry prices & rate doctrine

- **Genesis (Era 1) rate is frozen at $0.01 on V1.** Never retro-change.
- Era rate becomes **era-scoped config** (not a single global constant) — only enforced on-chain when V2 deploys.
- Rank stays computed from **cumulative USDC** (unchanged) — era rate variation does NOT affect rank logic. (Minor: the labs-only `rankForSyn` helper assumes $0.01; flag for V2.)

### B3. Packs (curated entry points named by the rank they unlock — zero collision)

| Pack (recommended name) | Price | Already a preset? | Rank unlocked (by cumulative USDC) | Your proposed name | Collision avoided |
| --- | --- | --- | --- | --- | --- |
| Citizen / "Seat" Pack | $5 | Yes | Citizen | Seat Pack | — (entry) |
| Operator Pack | $25 | Yes | Operator | "Builder $25" ❌ | Builder rank is $50 |
| Vanguard Pack | $100 | Yes | Vanguard | "Steward $100" ❌ | Steward rank is $500 |
| Steward Pack | $500 | Yes | Steward | "Architect $500" ❌ | Architect rank is $250 |
| Keystone Pack | $2,500 | **No — add preset** | Keystone | Keystone $2,500 ✅ | matches |
| Cornerstone Pack | $10,000 | **No — add preset** | Cornerstone | Cornerstone $10,000 ✅ | matches |

**Decision:** packs are **6 featured purchase amounts out of the existing 12-rank ladder**, each labeled by the rank it unlocks. No new vocabulary, no rank-name reuse at wrong prices. Add `2,500` and `10,000` to `PURCHASE_PRESETS_USDC`. SYN received per pack = (price ÷ era rate) at purchase time. If you prefer the marketing names "Seat / Builder / Steward / Architect / Keystone / Cornerstone," then **re-price them to the matching rank thresholds** ($5 / $50 / $500 / $250→reorder / $2,500 / $10,000) — but the rank-accurate naming above is cleaner.

### B4. Referral version

- **V2 = fixed 5%**, paid **atomically in the same transaction**, sourced **only from the 10% Operations tranche** (Vault & Liquidity never diluted).
- Example (100 USDC): **70 → Vault · 20 → Liquidity · 5 → Referrer · 5 → Operations.**
- Wording: **"direct sales commission."** Never yield / dividend / passive income / revenue share.
- **Tiered/reputation boosts = V3/future**, after legal + contract review. Reframe the current tiered preview accordingly.

### B5. Era-transition model

**Automatic detection + manual activation.** UI may show: "Genesis closes at #333," "Next era preview," "You would be Member #N," "Current era progress." **On-chain era params never auto-activate** — admin-approved only. (V1 has no era switch; this is a V2 contract capability.)

### B6. Next-step cockpit model (the key UX)

Derive, for any connected member, the next unachieved item in each ladder from their current on-chain state (cumulative USDC, member #, owned artifacts, referrals, era):

| Surface | Source today | Status |
| --- | --- | --- |
| Next Rank | `RANKS_V2` vs cumulative USDC | LIVE-derivable now |
| Next Pack | featured presets above next-spend | LIVE-derivable now |
| Next Artifact | Archive eligibility / future drops | PARTIAL (eligibility off-chain) |
| Next Referral milestone | V2 fixed-5% model | SIM until V2 |
| Next Chronicle milestone | existing milestones/chapters | LIVE-derivable now |
| Next Era | `eras.ts` vs member # | SIM (config) |
| Next Marketplace unlock | roadmap placeholder | FUTURE |
| Signal Chamber unlock | advisory layer | FUTURE |

Goal phrasing: **"I have a seat. Now I know my next move."** Never "I bought once and I'm done."

---

## PART C — TOKENOMICS CALCULATION (350M Membership Distribution)

**Assumption:** baseline = **one entry purchase per member at the era's entry price**. Real members also buy packs/upgrades/repeats, which draw from the same 350M — so this is the **floor** of SYN consumption, and the remaining headroom must cover all upgrades + the Million+ era.

| Era | Members | Entry $ | SYN/entry | Era SYN (entry-only) | Cumulative SYN | Era USDC | Cumulative USDC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 Genesis Signal | 333 | 5 | 500 | 166,500 | 166,500 | 1,665 | 1,665 |
| 2 First Thousand | 667 | 10 | 500 | 333,500 | 500,000 | 6,670 | 8,335 |
| 3 Expansion | 2,333 | 10 | 400 | 933,200 | 1,433,200 | 23,330 | 31,665 |
| 4 First Ten Thousand | 6,667 | 25 | 400 | 2,666,800 | 4,100,000 | 166,675 | 198,340 |
| 5 Open Era I | 15,000 | 25 | 300 | 4,500,000 | 8,600,000 | 375,000 | 573,340 |
| 6 Open Era II | 25,000 | 50 | 300 | 7,500,000 | 16,100,000 | 1,250,000 | 1,823,340 |
| 7 Hundred Thousand | 50,000 | 50 | 200 | 10,000,000 | 26,100,000 | 2,500,000 | 4,323,340 |
| 8 Quarter Million | 150,000 | 100 | 200 | 30,000,000 | 56,100,000 | 15,000,000 | 19,323,340 |
| 9 First Million | 750,000 | 100 | 100 | 75,000,000 | 131,100,000 | 75,000,000 | 94,323,340 |
| **Totals (to 1M members)** | **1,000,000** | — | — | **131,100,000** | — | — | **$94,323,340** |

**Member-count check:** 333+667+2,333+6,667+15,000+25,000+50,000+150,000+750,000 = **1,000,000** ✅

### Allocation headroom
- Membership Distribution allocation: **350,000,000 SYN**
- Entry-only distributed to reach 1,000,000 members: **131,100,000 SYN (37.5%)**
- **Remaining: 218,900,000 SYN (62.5%)** for pack upgrades, repeat purchases, and the Million+ era.
- Average extra capacity ≈ **~219 SYN per member** beyond entry — comfortable, but **must be modeled** once packs/upgrades are live (heavy upgrade behavior could exceed it in the later eras; cap or rate-tune Era 10 accordingly).

### USDC routing at the 1M-member milestone (entry-only, no referral)
- Vault 70% = **$66,026,338**
- Liquidity 20% = **$18,864,668**
- Operations 10% = **$9,432,334**

### With 5% referral active (worst case: every sale referred)
- Vault 70% and Liquidity 20% **unchanged** (never diluted).
- Operations splits into **5% ops + 5% referrer** → **$4,716,167 each** at the 1M milestone.

### Genesis live actuals today (for grounding, on-chain @ block 87,985,939)
- Sold: **2,500 SYN** to **2 buyers**, **$25 USDC** raised — fully inside the Era 1 plan (166,500 SYN budget).

**Verdict:** the proposed schedule is **solvent** against 350M with large headroom. The numbers are internally consistent. The only quantitative caution is modeling upgrade/pack behavior in Eras 8–10 against the 218.9M remainder before any V2 deploy.

---

## PART D — SAFEST SPRINT PLAN

| Sprint | Goal | Touches contracts? | Output |
| --- | --- | --- | --- |
| **0 — Audit & reconciliation** *(this document)* | Reconcile proposal vs canon, surface conflicts, verify tokenomics | No | This report |
| **1 — Docs/config decision sheet** | Ratify Part B as canon: era table, pack mapping, referral V2, transition model, two-price doctrine, Signal Chamber definition + glossary collision entry | No (docs only) | Updated canon docs (`eras` spec, glossary, referral V2, DEX/sale doctrine), roadmap buckets |
| **2 — UI simulation** | Era preview ("Genesis closes at #333 / you'd be Member #N / era progress"), Pack ladder (featured presets → rank unlocked), **Next-step cockpit engine**; all clearly SIMULATED for non-Genesis | No (read-only UI + config) | New cockpit "next move" module; era + pack surfaces; reframed referral preview (fixed 5%) |
| **3 — Contract spec only** | Write V2 sale spec (per-era rate, atomic 5% referral from Operations, admin era activation) + SeatRecord721 spec — **spec, not code** | No (spec) | `docs/` contract specs for review |
| **4 — Tests / legal / QA** | Doctrine + wording guards for all new copy; tokenomics unit checks; legal review of referral + era + Signal Chamber language | No | Passing vitest/guard suite, legal sign-off |
| **5 — Deploy** | Only after explicit approval | **Yes (V2)** | V2 sale + referral; era activation manual |

Sprints 1–4 ship **zero on-chain risk**. Genesis V1 keeps running untouched throughout.

---

## PART E — IMPLEMENTATION CONSTRAINTS (honored)

- **No smart-contract changes** in Sprints 0–4. Genesis V1 (`quoteSyn`, 70/20/10) is untouched; era rates and referral are simulated/config until V2 is reviewed and explicitly approved.
- **No V1 breakage:** Genesis stays $5 / $0.01 / 500-SYN, fixed on-chain.
- **No live economic promises:** eras = distribution schedule; packs = curated entry + recognition; artifacts = memory; referral = direct sales commission. No price/return language.
- **No legal-risk words:** ROI, yield, dividend, passive income, ownership, profit share, price support/floor, stable price, binding governance — all remain forbidden; Signal Chamber explicitly **advisory, non-binding, no treasury/ownership/dividend rights**.
- **No renaming canon without conflict report:** the 4 conflicts above are shown explicitly; chapters and rank names are **not** renamed — eras and packs are added as new, additive layers that reuse existing rank/chapter facts.
- **Prefer adapting existing system:** packs reuse the rank ladder; eras reuse chapter boundaries; referral reuses the Operations-only source already in canon.

---

## DECISIONS NEEDED FROM YOU BEFORE SPRINT 1

1. **Pack naming:** rank-accurate names (Operator/Vanguard/Steward Pack…) **or** marketing names re-priced to rank thresholds? (Recommend rank-accurate.)
2. **$99 vs $100** for Eras 8–9. (Recommend $100.)
3. **"Signal Chamber"** name kept despite the 4th "Signal" meaning, or alternative? (Recommend keep + glossary entry.)
4. **Two-layer Eras-vs-Chapters** confirmed (eras = schedule, chapters = story), or do you want a single merged "Era" concept (which would require renaming Chapter V)?
5. **Referral preview reframe** to fixed 5% (V2) now, tiered → V3 — approve?

---

*Read-only reconciliation. No protocol code, config, or canon was modified. All on-chain figures re-read live before publishing; chain state changes — re-verify before Sprint 1.*
