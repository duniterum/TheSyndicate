# Sprint 1B — Infinite-Game Discovery & Consistency

**Envelope:** SAFEST follow-up to Sprint 1. Frontend + docs + config ONLY. No
contracts, no Sale V1 change, no canon renames, no banned financial/gamification
vocabulary, no deploy until checks are green.

**Goal:** make the infinite-game progression visible to first-time visitors,
make seat packages discoverable everywhere, clarify the rank ladder's naming
order without renaming, calm the cockpit "next move" surface, and lay down a
whitepaper extraction layer — all while keeping every price/term consistent.

---

## 1. What shipped (per task)

### Task 1 — Homepage progression teaser
- **New:** `src/components/syndicate/HomeProgressionTeaser.tsx`.
- **Placement:** `src/routes/index.tsx`, ACT 02 (Why join), immediately after
  `<IdentityZone/>` and before the ACT 03 marker. The hero is untouched.
- **Shows:** Era I · Genesis LIVE · `$5 → 500 SYN` · `1 SYN = $0.01 USDC` · a
  compact progress meter to seat #333 · the featured package arc (Citizen $5 /
  Operator $25 / Vanguard $100 / Steward $500, names + USDC only) · two doors:
  **Take your seat →** (`/join`) and **I'm already a member** (`/my-syndicate`).
- **Reads shared sources only:** `useProtocolPulse`, `currentEra`,
  `synForUsdcInEra`, `featuredPackages`, `ACCESS_RATE_USDC_PER_SYN`. No chain
  writes, no hand-maintained tables.
- **Degrades gracefully:** before pulse data loads, the meter shows `— / 333`
  and "Reading the live archive…" (no implied zero).
- **No duplication:** the canonical milestone + proof copy stays in
  `MilestoneApproachingTile` (ACT 03); the teaser only carries a compact meter.

### Task 2 — Package discovery everywhere
Packages are now understandable from every entry point, all derived 1:1 from
`RANKS_V2` (no manual duplication):
| Surface | Where | What it gives |
|---|---|---|
| Homepage | `HomeProgressionTeaser` | featured arc + "what a package is" + doors |
| `/join` | `SeatPackages` + `EraSchedulePreview` (`JoinPackages.tsx`) | full featured cards + era schedule |
| `/my-syndicate` | cockpit `CockpitNextMove` "Package" card | the member's *next* package |
| FAQ | `FaqRebuilt.tsx` "What is a seat package?" / "What are the distribution eras?" | plain-language definition |

### Task 3 — Rank / package clarity (no rename)
- **`RankLadder`** (`src/components/syndicate/Sections.tsx`) gains a "Reading the
  ladder" paragraph: *tier names are recognition labels on one fixed-rate ladder,
  ordered only by USDC threshold — Architect ($250) comes before Steward ($500).
  A name marks where a seat sits in the archive; it never buys a better rate, a
  payout, or different treatment.*
- No tier was renamed or reordered. The naming-order question is recorded as a
  **future-only** decision in the whitepaper extraction map (§10) and here.

### Task 4 — "Next move" UX polish
- **`CockpitNextMove.tsx`** now shows **one primary action + four high-signal
  cards** (Recognition, Package, Artifacts, Chronicle). The remaining moves —
  Distribution era (LIVE), Referral / Marketplace / Signal Chamber (PENDING) —
  moved into a collapsed native `<details>` **"Explore all moves"**. PENDING
  labels preserved; no gamification vocabulary.
- Two "position" strings replaced with "record" / "Buy more SYN" (the
  no-"position" rule).
- Safe against `my-syndicate-doctrine.test.ts` (it scans `MemberCockpit.tsx` +
  the route, not this orchestrator).

### Task 5 — Whitepaper extraction layer
- **New:** `docs/whitepaper/WHITEPAPER_EXTRACTION_MAP.md`. Maps nine sections —
  Membership, Packages, Chapters vs Eras, Ranks, DEX vs sale price, Future
  utility, Marketplace, Signal Chamber, Legal exclusions — each to its
  source-of-truth file, with the figures/disclaimers that must travel with it.
- Explicitly labeled **extraction source material, not a new canon layer**, and
  **code outranks docs**. Includes a sync/lint checklist and a "future decisions"
  section (rank naming order; eras II–IX; pending modules).

### Task 6 — Consistency sweep (verified against config)
| Fact | Source of truth | Matches teaser / docs / FAQ |
|---|---|---|
| Access rate | `ACCESS_RATE_USDC_PER_SYN = 0.01` | ✓ |
| Min entry → SYN | Genesis `entryUsdc 5 → synPerEntry 500` | ✓ |
| Featured packages | `FEATURED_NAMES = Citizen/Operator/Vanguard/Steward` | ✓ |
| Genesis range | Era I `#1–#333`, status LIVE | ✓ |
| Eras II–IX | status FUTURE / proposed | ✓ |
| Legal framing | "not equity, not a security, not a promise of profit; may result in total loss" | ✓ |
No contradictions found.

---

## 2. Verification (all green)
- `npx tsc --noEmit` — 0 errors.
- Guards: `check-ownership-wording` (376 files), `check-visitor-vocabulary`,
  `check-preview-labels` — all OK.
- `vitest` targeted batch — **286 passed**: `doctrine-guard`,
  `my-syndicate-doctrine`, `eras-and-packages`, `protocol-awareness`,
  `proof-drawer-and-timeline`.
- Homepage teaser visually confirmed rendering correctly.
- Architect review (`evaluate_task`, with git diff): **PASS** — doctrinally safe,
  regression-free. Two minor non-blocking notes applied (cleaner loading display;
  removed agent-memory reference from the whitepaper map).

---

## 3. Doctrine guarantees held
- Recognition-only framing throughout; no payout / rate-change / entitlement /
  return language introduced.
- LIVE vs PENDING correct on every new surface (Genesis LIVE; future modules and
  eras II–IX PENDING / proposed).
- No contract, Sale V1, or canon change. No tier renamed or reordered.
- Code/on-chain truth remains the source; docs are subordinate.

---

## 4. Ready to publish
Nothing here changes contracts or the live sale. Once you publish, the homepage
teaser and the calmer cockpit go live. The whitepaper extraction map is internal
source material for assembling the paper later.

## 5. Deferred (future, not in this pass)
- **Rank naming order** (Architect $250 vs Steward $500) — a possible
  rename/reorder is a future governance decision; clarity copy makes today's
  fixed-threshold order read intentionally in the meantime.
- **Eras II–IX** — remain proposed; activation needs a future sale contract.
- **Marketplace / Signal Chamber / Referral** — remain PENDING future modules.
