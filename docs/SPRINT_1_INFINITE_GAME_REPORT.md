# Sprint 1 — Infinite-Game Journey · A–F Report

> **One-line summary.** Shipped the SAFEST Sprint 1 of the Syndicate "infinite
> game" journey — **frontend, config, and docs only**. No smart-contract change,
> no V1 / Genesis behaviour change, no deploy, no banned vocabulary, no canon
> renames. All values below are refreshed from live code at build time.

---

## A. Decision

**Chosen path: additive V1-safe layer — do NOT touch contracts, V1 sale, or canon.**

The "infinite game" (Join → Seat → Rank → Package → Artifact → Referral →
Chronicle → Marketplace → Signal Chamber) can be expressed **entirely as
presentation and pure-data config** on top of what is already live. The live
Membership Sale stays exactly as deployed: one fixed Genesis access rate
(`1 SYN = $0.01 USDC`) for every member, with no on-chain era stepping.

Why this path:

- **Lowest risk.** Nothing here can alter a member's seat, balance, rank math,
  routing, or the deployed contracts. Everything new is a pure-data leaf or a
  presentational component.
- **Truth-preserving.** Every new surface that describes the future (eras II+,
  Marketplace, Signal Chamber) is labeled **PENDING / PROPOSED / FUTURE** and is
  never mixed with live numbers. "Don't trust, verify" holds.
- **Reversible.** Each addition is an isolated file or a single mount point; any
  of them can be removed without affecting V1.

Anything that would need a contract (programmatic era stepping, on-chain
referral commission, a Seat Record NFT, a real marketplace, a binding Signal
layer) is explicitly **deferred** and shown as PENDING — never implied as live.

---

## B. Conflict / collision report

Resolved by **adding a second coordinate system, not renaming the first**:

| Potential conflict | Resolution |
|---|---|
| **Eras vs Chapters** | Chapters (`src/lib/chapters.ts`) are the **story** layer and were left fully untouched. Eras (`src/lib/eras.ts`) are a separate **distribution** layer. Eras I–IV reuse the Chapter I–IV member-number boundaries exactly; Eras V–IX all sit inside Chapter V. No chapter renamed, re-numbered, or re-bounded. |
| **"Package" vs Rank** | A package is **not** a new naming system. `package-catalog.ts` projects 1:1 from `RANKS_V2` — same names, same thresholds, same SYN amounts. Add/rename a tier in `RANKS_V2` only; packages follow automatically. |
| **Sale rate vs market price** | Surfaced the **two-price doctrine** explicitly: the Genesis access rate is the protocol's own sale rate; the Trader Joe price is a separate, market-set price. Neither is a peg, floor, or guarantee. |
| **"next rank" gamification ban** | The cockpit guard (`my-syndicate-doctrine.test.ts`) blocks the phrase "next rank". The orchestrator names the tier directly ("Reach Steward") and never uses point/score/streak/XP language. |
| **Duplicate "Your next move" heading** | The new orchestrator owns the "Your next move" eyebrow; the pre-existing Action band eyebrow was renamed to **"Action dock"** so there is one of each. |
| **Member-state CTA flash** | Fixed: a connected member whose holder index is still loading now sees a neutral "Reading seat…" CTA — never a "Join The Syndicate" prompt flashed at a real member. |

No terminology collisions were introduced; the standing collisions tracked in
canon ("Patron", "Council", "Vault", "Genesis", "Chronicle") were not touched.

---

## C. Tokenomics (refreshed from live code)

**Token:** SYN — fixed supply **1,000,000,000**, ERC-20 on Avalanche C-Chain
(`0xC1Cf…0170`). No mint, no admin, no pause, no tax. **Access rate (LIVE, fixed):
`1 SYN = $0.01 USDC`.** Minimum entry: **5 USDC**.

**USDC routing per purchase (LIVE, inside the Sale contract):** 70% Vault · 20%
Liquidity · 10% Operations.

**Supply allocation (1,000,000,000 SYN):**

| Allocation | % | SYN |
|---|---:|---:|
| Membership Distribution | 35% | 350,000,000 |
| Vault Reserve | 25% | 250,000,000 |
| Founder (12-mo cliff, 36-mo vest) | 12% | 120,000,000 |
| Liquidity | 10% | 100,000,000 |
| Partnerships | 8% | 80,000,000 |
| Contributors | 5% | 50,000,000 |
| Future Ecosystem | 5% | 50,000,000 |
| **Total** | **100%** | **1,000,000,000** |

**Recognition ladder (RANKS_V2 — recognition only, derived from cumulative USDC):**

| Tier | Entry USDC | SYN @ Genesis | Onboarding |
|---|---:|---:|---|
| Citizen | $5 | 500 | one-click |
| Scout | $10 | 1,000 | one-click |
| Operator | $25 | 2,500 | one-click |
| Builder | $50 | 5,000 | one-click |
| Strategist | $75 | 7,500 | one-click |
| Vanguard | $100 | 10,000 | one-click |
| Architect | $250 | 25,000 | one-click |
| Steward | $500 | 50,000 | one-click |
| Custodian | $1,000 | 100,000 | one-click |
| Keystone | $2,500 | 250,000 | manual |
| Inner Circle | $5,000 | 500,000 | manual |
| Cornerstone | $10,000 | 1,000,000 | manual |

Featured packages = the four one-click anchors **Citizen / Operator / Vanguard /
Steward**. Rank confers recognition only — no payout, no rate change, no rights.

**Distribution-era schedule (Era I LIVE; II–IX PROPOSED FUTURE, not live):**

| Era | Name | Members | Seats | Entry | SYN/entry | SYN per $1 | Status |
|---:|---|---|---:|---:|---:|---:|---|
| I | Genesis | #1–#333 | 333 | $5 | 500 | 100 | **LIVE** |
| II | First Thousand | #334–#1,000 | 667 | $10 | 500 | 50 | PROPOSED |
| III | The Expansion | #1,001–#3,333 | 2,333 | $10 | 400 | 40 | PROPOSED |
| IV | First Ten Thousand | #3,334–#10,000 | 6,667 | $25 | 400 | 16 | PROPOSED |
| V | Open Era I | #10,001–#25,000 | 15,000 | $25 | 300 | 12 | PROPOSED |
| VI | Open Era II | #25,001–#50,000 | 25,000 | $50 | 300 | 6 | PROPOSED |
| VII | Hundred Thousand | #50,001–#100,000 | 50,000 | $50 | 200 | 4 | PROPOSED |
| VIII | Quarter Million | #100,001–#250,000 | 150,000 | $100 | 200 | 2 | PROPOSED |
| IX | First Million | #250,001–#1,000,000 | 750,000 | $100 | 100 | 1 | PROPOSED |

Capacities sum to **exactly 1,000,000** seats. Era II+ would each require a
future sale contract before any could take effect; today only Genesis is live.

---

## D. Sprint 1 plan (as executed)

| # | Task | Status |
|---|---|---|
| T001 | `eras.ts` — distribution-era data + deterministic helpers | ✅ done |
| T002 | `package-catalog.ts` — featured packages derived 1:1 from `RANKS_V2` | ✅ done |
| T003 | Unit tests for eras + packages (boundaries, sum, consistency, clean copy) | ✅ done (19) |
| T004 | Join page — featured packages + future-era preview + two-price note | ✅ done |
| T005 | Cockpit — `CockpitNextMove` orchestrator (one primary + onward cards) | ✅ done |
| T006 | Docs / FAQ minimal updates (packages, eras, Signal Chamber, two-price) | ✅ done |
| T007 | Optional homepage teaser | ⏭️ **deferred** (see F) |
| T008 | Guards / tests + this A–F report | ✅ done |

---

## E. Implementation (what was built)

**New files**

- `src/lib/eras.ts` — pure-data 9-era distribution schedule + helpers
  (`currentEra`, `eraForMemberNumber`, `isFutureEra`, `synForUsdcInEra`,
  `eraSynPerUsdc`, `eraUsdcPerSyn`, `nextEra`, `getEraById`). Reads no chain.
  `synForUsdcInEra` uses the **live** access rate for Genesis and **proposed**
  preview rates only for future eras.
- `src/lib/package-catalog.ts` — `SEAT_PACKAGES` projected 1:1 from `RANKS_V2`,
  plus `featuredPackages`, `executablePackages`, `nextSeatPackage`, lookups.
- `src/lib/__tests__/eras-and-packages.test.ts` — 19 tests.
- `src/components/syndicate/JoinPackages.tsx` — `SeatPackages` strip +
  `EraSchedulePreview` table (with the sale-rate-vs-market-price note).
- `src/components/syndicate/cockpit/CockpitNextMove.tsx` — the orchestrator: one
  primary recommended step + a grid of 8 onward cards (Recognition · Package ·
  Artifacts · Chronicle · Referral · Distribution era · Marketplace · Signal
  Chamber). Future modules are clearly PENDING.
- `docs/proposals/SPRINT_1_INFINITE_GAME_SURFACES.md` — additive source material.

**Wiring (no behaviour removed)**

- `src/routes/join.tsx` — wrapped `<LivePurchase/>` in a `#buy` anchor; inserted
  `<SeatPackages/>` after it and `<EraSchedulePreview/>` after `<AccessRate/>`.
- `src/components/syndicate/cockpit/MemberCockpit.tsx` — mounted
  `<CockpitNextMove/>` at the top of the Momentum band (before
  `CockpitProgression`); renamed the Action band eyebrow to "Action dock".
- `src/components/syndicate/FaqRebuilt.tsx` — 4 additive FAQ entries (seat
  package · distribution eras · Signal Chamber · access rate vs market price).

**Narrative-arc safety.** The pinned arc Identity → Place → Ownership → Momentum
→ Action is preserved: the orchestrator opens the Momentum chapter (it summarises
and links onward); the Action dock remains the single unified action surface.

---

## F. Post-implementation report

**Verification — all green**

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `check-ownership-wording` | OK (375 files) |
| `check-visitor-vocabulary` | PASS |
| `check-preview-labels` | OK (6 files) |
| `doctrine-guard.test.ts` | 225 passed |
| `my-syndicate-doctrine.test.ts` (arc + gamification guard) | 14 passed |
| `eras-and-packages.test.ts` | 19 passed |
| `proof-drawer-and-timeline.test.ts` (homepage gated) | 15 passed |

**Code review (architect).** Two findings raised and **both fixed**: (1) a
connected member in the loading state could see a "Join The Syndicate" CTA — now
shows a neutral "Reading seat…"; (2) the computed `onwardPackage` was unused —
now surfaced as a dedicated Package card. The architect confirmed the eras/config
layer is doctrinally safe and does not alter V1/Genesis.

**Note on `check-homepage-content.mjs`.** This script fetches the **deployed**
production site, not local code, and is non-blocking (exit 0). Its current
"missing phrase" reports reflect deploy lag on production, not a local
regression — the homepage source was not touched this sprint.

**Deferred (intentionally, for the SAFEST scope)**

- **T007 homepage teaser** — skipped to keep the change surface minimal and avoid
  any risk to the gated homepage. Easy, isolated follow-up if desired.
- **Anything contract-bound** — programmatic era stepping, on-chain referral
  commission, Seat Record (ERC-721), a real Marketplace, and a binding Signal
  layer all remain **PENDING** and are shown as such. They need contracts +
  audit + deploy and were explicitly out of scope.

**No deploy performed.** This sprint is verified locally only.
