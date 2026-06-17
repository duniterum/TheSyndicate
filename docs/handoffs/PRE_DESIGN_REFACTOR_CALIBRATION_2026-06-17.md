# Pre-Design-Refactor Calibration — Constraints First

**Type:** Read-only senior diagnosis. **No implementation, no redesign, no production changes, no new lab, no route moves, no renames.**
**Date:** 2026-06-17
**Grounding:** verified against the live codebase (`src/styles.css`, `PageShell`, `ProtocolHero`, `ProtocolIntelligenceBar`, the homepage + `/join` + `/my-syndicate` routes) plus the on-chain/RPC reality.
**On the board:** Section **K — Pre-Refactor Calibration**.

---

## 0. TL;DR (the brutal version)

Previous design passes missed not because the *ideas* were wrong, but because **there is no shared visual primitive/token layer underneath ~140 domain components.** `src/styles.css` has a genuinely good token foundation (Tailwind v4 `@theme`, obsidian/ivory themes, Space Grotesk / Space Mono / Fraunces), but almost every component overrides it locally with **hardcoded hex (`#E3A92B`, `#F97316`), inline gradient styles, and arbitrary classes (`tracking-[0.28em]`, `size-[420px]`)**. So each pass restyled pages *on top of* fragmented parts and produced inconsistency — "report style," not "instrument-grade cockpit."

**Therefore Sprint 0 is NOT the homepage cockpit. Sprint 0 is brand + a minimal primitive/token kit.** Build the homepage cockpit on top of that, once, instead of twice.

Three things will otherwise bite us: (1) **fragmented primitives** → inconsistent cockpit; (2) **report-style components** that kill momentum; (3) the **dev RPC shows blanks/PENDING** (a dev artifact, not production truth) → we risk designing around false "empty" states.

---

## 1. Why previous passes missed the target (root cause)

| # | Root cause | Evidence |
|---|---|---|
| 1 | **No primitive layer.** Good tokens in `styles.css`, but no shared `Stat`/`Badge`/`Button`/`Card`/`SectionShell` that consume them. | ~46 shadcn primitives + **~140** `src/components/syndicate` components; mono + CTA styles re-declared locally inside `ProtocolHero.tsx`; extensive `style={{…}}` gradients in `PageShell.tsx`. |
| 2 | **Ad-hoc styling everywhere.** Hardcoded hex, inline gradients, arbitrary classes bypass the theme engine. | `#E3A92B`/`#F97316` in `ProtocolHero`; `tracking-[0.28em]`, `text-[10px]`, `size-[420px]` across the tree. |
| 3 | **Report-style composition.** Pages are tall stacks of prose/table sections, not dense cockpit modules. | Homepage ≈ 12 sections (several prose: `WhyJoinSimple`, `WhatChangesAfterJoining`, `StoryTimeline`); `/join` ≈ 10–12 (tables: `RankLadder`, `EraSchedulePreview`, `AccessRate`). |
| 4 | **Designing against dev blanks.** Dev preview renders many LIVE values as PENDING/—. | Dev primary RPC (api.avax.network) = 429 + no CORS; cold holder-index scan rate-limits the fallback. **Production is fine** (seed + persisted incremental cache + CORS RPC). |

The fix is **architectural, not cosmetic**: a thin primitive/token layer + brand, *then* compose pages from it.

---

## 2. Constraints to respect before refactoring

**Component:** good *aesthetic* foundation, poor *reuse* discipline. Reusable as-is: `ProtocolIntelligenceBar` (~270 lines, pure module), `LivePulseStrip`, `HomeActivityTape`, `IdentityZone`, the `MemberCockpit` *layout* (~500 lines). Not reusable as-is: report tables and proof prose (see §4).

**Layout:** `PageShell` (DemoBanner → Header+wallet → ProtocolIntelligenceBar → IdentityRibbon → main) is sound; the problem is **stacked full-width sections** and a monolithic `ProtocolHero`. Grids/spacing are inconsistent because they're hand-set per component.

**Data:** Reliable enough for hero/dashboard **in production**: members, USDC routed, vault/liquidity/operations balances, LP TVL, supply, burned (`balanceOf(dead)`), chapter fill, latest activity. Genuinely PENDING (don't design as live): **LP fees** (unreadable), **referral** (`commissionRouter=0x0`), **SeatRecord721** (unbuilt), **Vault contract**. **Trap:** the dev environment under-reads these — design against a **production snapshot/fixtures**, never the dev preview's blanks.

**Visual identity:** brand is **not wired** (no canonical favicon/token/app icon/social/press). Starting the homepage before brand = rework. The **preferred rounded interconnected mark can and should be the canonical anchor** (Section H).

**Narrative:** still **proof-first / defensive** — legal disclaimers lead, desire lives below the fold. Alice meets "is this an investment? no" before she feels the seat.

**UX:** `/join` overloaded (a prospectus, not a checkout); `/my-syndicate` buried behind the wallet chip; homepage doing 6 jobs; referral too quiet to review; nav too wide (~18 destinations).

**Legal (must not imply):** ROI, yield, dividends, returns, equity, vault ownership, rank rights, NFT = membership, referral live today. These are enforced by wording-guard tests — copy edits can trip banlists.

**Technical:** theme is centralized but **diluted by inline/hardcoded overrides**; dark/light is consistent at the CSS layer but component branching is mixed; **a real redesign needs design tokens/primitives first.** Note: `vite build` **OOMs in this container** — validate via `tsc` + `vitest` + dev server, not a prod build.

**QA (what breaks):** homepage has **gated tests** pinning `ProtocolStorySoFar` + `StoryTimeline` and required Flywheel phrases (restyle/collapse, don't delete); `/join` `LivePurchase` has a fragile two-step approve/buy + `quote()` + v1-proof gate (reskin the shell only, never the logic); `/my-syndicate` has **SSR hydration gating, a BigInt query-key hash fix, embed providers, and a pinned narrative-arc order** (moving surfaces breaks scans).

---

## 3. Components good enough to REUSE

- `ProtocolIntelligenceBar.tsx` — pure data-dense module; the cockpit's backbone.
- `MemberCockpit.tsx` — strong "flight deck" *layout* foundation (identity band + flight deck).
- `ProtocolHero.tsx` — high-fidelity visual anchor (but extract its local CTA/mono styles into primitives).
- `LivePulseStrip` / `HomeActivityTape` — high-frequency "this is alive" viz.
- `IdentityZone.tsx` — clean visual product mapping of the seat.

## 4. Components too REPORT-LIKE (redesign / compress — later, not first)

- `/join` route — move ~60% (specs/tables) into a "Protocol Specs" disclosure; keep buy + what-you-get + scarcity.
- `CockpitProof.tsx` — too much "claim → source" prose; convert to a proof-badge + verify modal.
- `RankLadder` / `EraSchedulePreview` / `AccessRate` / `SeatRecordPanel` — PDF-style tables that kill cockpit momentum.
- `RiskDisclaimer` — essential but should be a compact modal/footer, not a full scroll section.
- Homepage prose: `WhyJoinSimple`, `WhatChangesAfterJoining` (compress to modules).

---

## 5. Pages safe vs dangerous to touch first

**Safe first (low blast radius, additive/contained):**
- Brand assets + the minimal primitive kit (no visual page risk).
- **Homepage** — *compose* existing good modules (un-hide ticker, lift engines); keep gated components present.
- **`/my-syndicate`** — contained; promote + add zero/return states.

**Dangerous first (high blast radius — defer):**
- **`/join`** — on-chain buy logic + legal-sensitive copy + many report tables.
- **`/transparency` · `/registry` · `/tokenomics`** — proof/data-dense, legal-sensitive.
- Anything with a **write path** (`LivePurchase`) — reskin shell only.
- Gated-test surfaces (homepage pins, cockpit arc order) — restyle, never restructure.

---

## 6. Sprint 0 verdict: brand + tokens — NOT the homepage cockpit

**Honest answer to "brand assets, design tokens, or homepage cockpit?":** brand **and** a *minimal* token/primitive kit, together, first.
- **Brand alone** isn't enough — without primitives, the homepage pass re-creates today's inconsistency.
- **Homepage first** = guaranteed redesign-twice.
- **Full design system first** = over-engineering; don't. Extract **only the ~6 primitives the cockpit actually needs** (`Stat`/Metric, `StatusPill`/Badge, `Button`/CTA, `Card`/Module shell, `SectionShell`, `MonoNumber`) **from components that already look right** (the ticker, the hero CTA). Wire them to `styles.css` tokens; don't invent new values.

---

## 7. Recommended strategy — 5 small sprints

| Sprint | Scope | Risk | Output |
|---|---|---|---|
| **0 · Brand + Primitive kit** | finalize the preferred mark (favicon/app icon/token/social/press) **+** extract ~6 token-bound primitives from existing good components | **Low** (assets + additive primitives; no page redesign) | one symbol + one consistent kit to build on |
| **1 · Homepage cockpit** | recompose with primitives: un-hide ticker, lift economy engines, pull liveness up, collapse the prose sections (keep gated ones) | Medium (most-seen page; composition) | the public *trailer that promises the seat* |
| **2 · Member OS promotion** | entry path + first-time/zero state + return-hook; redesign `CockpitProof` → proof-badge; compress `BuildingZone` | Low–Med | the **center of gravity** as the obvious home |
| **3 · Join simplification** | focused checkout; demote specs/tables to disclosure; **reskin only**, never touch buy logic | Med–High | a shop, not a brochure |
| **4 · Nav / IA + cleanup** | promote belonging+economy, demote proof, flatten "More"; retro-fit primitives page-by-page | Medium | one coherent IA on one design language |

Each sprint is *composition + primitives*, not new protocol claims, and is independently shippable.

---

## 8. What I need from the founder before starting

1. **Brand sign-off:** approve the rounded interconnected mark as canonical + pick the final token-coin treatment (gold vs white) and whether nav leads with the lockup or the mark.
2. **Accept a non-visible Sprint 0 step:** a small primitive/token refactor *before* the visible homepage work (this is the anti-redesign-twice insurance).
3. **Design-data decision:** either provide a **CORS/keyed dev RPC** (env override exists) or agree we design against a **production snapshot/fixtures** — not the dev preview's blanks.
4. **Confirm anchor + order:** seat/Member OS center of gravity and the sprint order above.
5. **Out-of-scope confirmation:** proof/registry/tokenomics/docs/whitepaper/faq stay untouched in Sprints 0–2.
6. **A premium reference or two** (cockpits you admire) to calibrate "premium" objectively.

---

## 9. Do-NOT list (to avoid another messy pass)

- ❌ Don't restyle pages one-by-one on top of the fragmented components — that *is* what missed before.
- ❌ Don't start the homepage before brand + primitives (= redesign twice).
- ❌ Don't design against the dev preview's PENDING/blank values — use production truth/fixtures.
- ❌ Don't rely on `vite build` locally (OOM) — validate with `tsc` + `vitest` + dev server.
- ❌ Don't touch on-chain write logic (`LivePurchase`/buy/quote/proof gate) — reskin shells only.
- ❌ Don't delete gated components (homepage pins, cockpit arc order) — restyle/collapse instead.
- ❌ Don't rename concepts or move routes during design sprints.
- ❌ Don't add new labs or one-off components — extend the primitive layer.
- ❌ Don't introduce new hex / inline gradients — consume tokens; retire ad-hoc styles as you go.
- ❌ Don't make Vault, NFT, or token the visual hero — the seat is the anchor.
- ❌ Don't soften the legal guardrails (no ROI/yield/return/equity/vault-ownership/rank-rights/NFT=membership/referral-live).

---

## 10. Honest prediction — what happens when I begin

- **If we start with the homepage (skipping primitives):** it will look better in isolation, then drift back to inconsistent the moment we touch the next page — and we'll rebuild the homepage again. This is the most likely repeat of past failure.
- **If we start with brand + a minimal primitive kit:** Sprint 0 is invisible to users but makes Sprints 1–4 fast, consistent, and cheap. The homepage cockpit then lands in **one** pass and the rest of the site inherits the language.
- **Data caveat regardless of path:** in *dev* the cockpit will show PENDING/blanks because of the RPC; that's expected and not a design failure. We must review against production values or fixtures, or it will look broken when it isn't.
- **Biggest residual risk:** scope creep turning the primitive kit into a full design-system rebuild. Hold the line at ~6 primitives extracted from what already works.

*End of calibration. Read-only by design. Approve §8 + Sprint 0 to begin safely.*
