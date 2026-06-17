# Design Foundation Layer — Sprint 0 Spec (for approval)

**Type:** Read-only proposal. **No implementation.** Approve this before the first refactor begins.
**Date:** 2026-06-17
**Grounding:** verified against `src/styles.css`, `src/components/syndicate/Primitives.tsx`, `src/components/ui/*`, `ProtocolHero.tsx`, `ProtocolIntelligenceBar.tsx`, `RevenueStreams.tsx`, and live screenshots of `/` and `/join`.
**Current-state screenshots:** `screenshots/current-home.jpg`, `screenshots/current-join.jpg` (presented alongside this doc).

---

## Headline correction (good news)

The foundation is **not missing — it's bypassed.** A primitive layer already exists:
- `src/components/syndicate/Primitives.tsx` → `StatusPill`, `ProgressBar`, `AnimatedNumber`, `GlassCard`, `Section`, `SectionHeader`, `ProofButton` (+ `CanonicalStatus` type).
- `src/components/ui/*` (shadcn) → `Button` (cva variants), `Badge`, `Card`, `Table`, etc.

The problem is **discipline**, not absence. Examples found in the code:
- `RevenueStreams.tsx` **re-declares its own local `StatusPill`** (raw `emerald-300/amber-300`) instead of importing the canonical one.
- `ProtocolHero.tsx` **hardcodes** `GOLD = "#E3A92B"`, `FLAME = "#F97316"` and local `CTA_PRIMARY`/`CTA_SECONDARY` class strings — so **the hero stays gold in dark mode while the rest of the system repoints to cyan** (visible in `current-home.jpg`). That single inconsistency is a direct symptom.
- **~19 components** re-implement the status pill (`rounded-full mono uppercase tracking-[…]`) with **8 different tracking values and 5 different micro font-sizes**.

**So Sprint 0 = FINISH + CANONICALIZE the existing primitives, then MIGRATE the bypassers.** This is additive and far lower-risk than a from-scratch design system.

---

## 1. The 6 primitives to standardize

For each: where you can see it today (screenshot) → the canonical version proposed.

### P1 · StatusPill  *(exists — enforce)*
- **Current:** canonical `StatusPill` in `Primitives.tsx`, but bypassed ~19× (`RevenueStreams`, `LpStatus`, `VaultDisambiguation`, `TransparencyCenter`, `LiquidityActionRail`, `UseOfFunds`, `LivePurchase`…). **Seen:** the green **`LIVE`** chip in the `/join` ticker (`current-join.jpg`, top-left).
- **Canonical:** one `<StatusPill status>` for `LIVE · PARTIAL · PENDING · DERIVED · FUTURE`, token colors (`success/verify/warning/muted`), optional pulse dot, one size. Delete every local re-impl.

### P2 · Stat / Metric cell  *(extract — new)*
- **Current:** the ticker's `BarCell` (`ProtocolIntelligenceBar.tsx`) is the gold standard (micro mono label + tabular value); but numbers are re-styled per surface. **Seen:** the ticker cells *(SYN REFERENCE PRICE / FDV / BURNED…)* and the right-hand "Protocol Overview" panel on `current-home.jpg`.
- **Canonical:** `<Stat label value status title>` — mono `tabular-nums` value, one micro-label style, status-aware. Pairs with existing `AnimatedNumber`.

### P3 · Button / CTA  *(unify — exists fragmented)*
- **Current:** shadcn `Button` (cva) **and** the hero's local `CTA_PRIMARY`/`CTA_SECONDARY` with hardcoded gold gradient. **Seen:** gold **JOIN** + outline **CONNECT** (header), **JOIN THE PROTOCOL** + **VERIFY LIVE FLOWS** (hero) on `current-home.jpg`.
- **Canonical:** extend `Button` with variants `gold` (primary), `verify` (outline), `ghost`; back them with `--gold`/`--verify` **tokens** (fixes the dark-mode gold→cyan repoint). Retire hero CTA constants + hex.

### P4 · Panel / Card  *(consolidate — exists fragmented)*
- **Current:** `GlassCard` component + `surface`/`panel`/`glass-card` CSS utilities **plus** ad-hoc `rounded-lg border border-border/50 bg-card/50` blocks. **Seen:** the "Protocol Overview" panel (`current-home.jpg`, right) and the revenue cards.
- **Canonical:** one `<Panel variant="glass|surface|flat">` with an optional header slot; map ad-hoc card blocks onto it.

### P5 · SectionShell + SectionHeader  *(exists — enforce rhythm)*
- **Current:** `Section` + `SectionHeader` (eyebrow/title/description) exist, but vertical spacing & max-width vary page-to-page (the "stacked sections" feel). **Seen:** every band on `/` and `/join`.
- **Canonical:** one section rhythm — fixed max-width, fixed vertical padding scale, eyebrow→title→description. Every page section uses it.

### P6 · Eyebrow / MonoLabel  *(extract — new atom)*
- **Current:** the `mono … uppercase tracking-[…]` micro-label is everywhere with **8 tracking values** (`0.12 → 0.28em`) and **5 sizes** (`8 → 12px`). **Seen:** "YOU ARE VISITOR", "USDC ROUTED", every ticker label.
- **Canonical:** `<Eyebrow size="xs|sm">` with a fixed tracking + label type scale (kills the 8×5 sprawl).

> **Already canonical — keep as-is:** `ProgressBar`, `AnimatedNumber`. No rework.

---

## 2. Design tokens to standardize

Most already live in `src/styles.css` `@theme` (oklch, light + obsidian dark). Job = **fill the gaps and stop bypassing**.

| Group | Status | Action |
|---|---|---|
| **Colors** | ✓ semantic + brand (gold + variants, navy, champagne, ivory) + functional (verify/success/warning/danger); gold→cyan repoint in dark | Retire hardcoded `#E3A92B`, `#F97316`, raw `emerald/amber/sky` → map to `--gold`/`--success`/`--warning`/`--verify`; **add a `--flame` token** (burn). |
| **Spacing** | ✗ **biggest gap** — no scale; raw `px-4/py-2/gap-3` ad hoc | Add canonical **section padding · card padding · stack-gap** tokens; use them in P4/P5. |
| **Typography** | ✓ Space Grotesk (UI) / Space Mono (data) / Fraunces (editorial-only) + fluid `h1–h3` + `amount-hero/xl/lg` | Add a **label type scale** (`label-xs/sm`) + **tracking tokens** to replace the 8×5 micro-label sprawl. |
| **Shadows** | ✓ `--shadow-soft/elevated/glow-gold/navy/verify` | Keep; stop inline `box-shadow`, use the utilities. |
| **Borders** | ✓ `--border` + radius scale (`--radius 0.25rem` → sm…2xl) | Keep; standardize border-opacity (currently `/40 /50 /60` ad hoc → pick **two**). |
| **Icon sizing** | ✗ gap — `size-1 / 1.5 / 2 / 2.5 / 4` ad hoc | Add **icon size tokens** `xs 12 · sm 16 · md 20 · lg 24`. |

---

## 3. Brand system to standardize  *(all PENDING — from board Section H)*

Anchor = the **preferred rounded interconnected "SYN" mark** (gold/black).

| Asset | Today | Target |
|---|---|---|
| **Logo (mark + lockup)** | text "The Syndicate / PROTOCOL" + a small square "S" | canonical mark + horizontal lockup (light/dark) |
| **Token logo** | none | SYN coin glyph (for wallets/exchanges/charts) |
| **Favicon** | default | mark @ 16/32/48 |
| **App icon** | none | maskable 512 (iOS/Android/PWA) |
| **Social avatar** | none | square mark on ink, safe-area |
| **Dashboard mark** | the cyan "S" seat badge (see `/join` screenshot) | finalized small-size mark |

**One decision needed:** the mark's color in **dark** — **gold** (matches today's hero) or **cyan** (matches the obsidian cockpit accent). Recommendation: gold mark, cyan reserved for live-data accents — but your call.

---

## 4. Components that migrate to the primitives

Mechanical swaps, grouped by primitive:
- **→ StatusPill:** `RevenueStreams`, `LpStatus`, `VaultDisambiguation`, `TransparencyCenter`, `LiquidityActionRail`, `LiquidityTrustContext`, `UseOfFunds`, `LivePurchase` pill.
- **→ Stat:** `ProtocolIntelligenceBar` `BarCell`, hero `BottomFacts`, "Protocol Overview" panel, cockpit stat blocks.
- **→ Button:** `ProtocolHero` CTAs (drop `#E3A92B`), `ShareActions`, `MetricVerificationDrawer` pill-buttons.
- **→ Panel:** ad-hoc `bg-card/50 border` blocks across hero + cockpit + cards.
- **→ Eyebrow:** every `mono uppercase tracking-[…]` micro-label.
- **→ Chip (StatusPill sibling):** `ActivityFilterChips`, `HomeActivityTape` filters.

## 5. Pages that immediately benefit

Primitives are global, so **every page** inherits — but in priority order:
1. **Homepage** — hero (gold→token fix), ticker, section rhythm.
2. **`/join`** — cards + the report tables get consistent chrome (precondition for Sprint 3).
3. **`/my-syndicate`** — cockpit cards, stats, pills (the center of gravity).
4. Then **`/transparency` · `/vault` · `/activity` · `/members` · `/ranks`** inherit for free.

## 6. Estimate

| Dimension | Assessment |
|---|---|
| **Effort** | **~2–3 focused days.** Sprint 0a = tokens + finish/extract primitives (P1–P6). Sprint 0b = brand asset set. |
| **Files touched (core)** | **Small: 3–5** — `src/styles.css` (tokens), `Primitives.tsx` (add `Stat`, `Eyebrow`, `Panel`; harden `StatusPill`), `ui/button.tsx` (variants). Brand = `public/` assets + favicon/og refs. |
| **Files touched (migration)** | ~20–30 components, but each is a **mechanical 1-line swap**; can be done incrementally inside Sprints 1–4, not all up front. |
| **Risk** | **LOW** for the additive token/primitive work (new exports + tokens; nothing removed). **MEDIUM** only where migration touches **gated tests / wording guards / write paths** (`ProtocolHero`, `LivePurchase`) — migrate those **last**, keep tests green, change no copy semantics, move no routes. |

---

## What I need from you to start Sprint 0
1. **Approve the 6 primitives** (P1–P6) and the "finish + migrate, don't rebuild" approach.
2. **Approve the token gaps** to add: spacing scale, label/tracking scale, icon-size scale, `--flame`.
3. **Brand decision:** confirm the rounded mark as canonical + pick **gold vs cyan** for the mark in dark.
4. **Confirm migration is incremental** (core primitives now; per-component swaps fold into Sprints 1–4).

*Read-only by design. On approval, Sprint 0a (tokens + primitives) is the first and safest surface to touch.*
