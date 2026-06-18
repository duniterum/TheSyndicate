---
name: Hero right-panel division of labor
description: What the homepage hero's radial center vs Protocol Overview panel may show, and why
---

# Hero right-panel division of labor

The homepage hero has two display zones on the right. Their division of labor is
a founder ruling (it has flip-flopped — this is the CURRENT, final state):

- **Radial center = the single visual source of USDC routed.** It shows, top to
  bottom: "LIVE USDC FLOW" (with a chain-live ping) → the big USDC-routed
  headline figure → "USDC ROUTED". Desktop and mobile both. The throne sits on
  top, per-lane treasury figures on the surrounding nodes, burn monument below.
- **Protocol Overview panel = Members → Burned SYN → LP TVL, ONLY.** USDC routed
  is deliberately NOT in the panel — it must appear exactly once on the hero, in
  the center. Do not re-add a USDC-routed row to the panel.

**Why:** the founder wants the hero to read top-down as: Seat available → live
protocol flow → $X routed → Members → Burned SYN → LP TVL — with no metric shown
twice. One giant center figure is the focal "what the protocol does" number; the
panel carries the supporting proof figures. Showing USDC routed in both the
center and the panel reads as duplicated / dashboard-heavy.

**SUPERSEDED rulings (do not reinstate without a new founder ruling):**
- "Radial center is calm with NO headline number" — reversed; the big USDC-routed
  number is back in the center.
- "USDC routed lives in the panel" — reversed; it lives only in the center.

## Demote, never delete
SYN price / Ref. market / Ref. FDV / Initial / Effective supply stay OFF the
hero but remain elsewhere on the site (tokenomics page, below-fold KPI grid,
intelligence-bar ticker). When decluttering the hero, demote/move metrics; never
delete a metric off the whole site.

## Hydration-stability contract (founder-mandated, durable)
First paint (PENDING / "—") and the loaded value must be DIMENSIONALLY IDENTICAL
— no reflow / pop-in / panel expansion. The rules:
- Every live figure reserves a fixed value width (`minWidth` in `ch`) +
  `tabular-nums` so the "—" placeholder occupies the same box as the loaded
  value. The center USDC-routed headline reserves enough width to absorb a
  4-digit total ($9,999.99) so growth never causes a jump.
- `minWidth` (not `width`) is deliberate: placeholders must never be larger than
  loaded values; pick the reserve to cover the realistic max.
- Panel rows use a fixed two-line meta stack (status/badge, then note), both
  `nowrap`. Do not revert to one wrapping line — a longer status word
  (PENDING/DERIVED vs LIVE) wraps differently and reflows the rows below.
- The seat-label number (desktop + mobile) is a fixed-width tabular span so the
  centered headline does not re-center as the seat number grows.

## Header connect-jump
The connected wallet trigger and the disconnected Connect button must share the
same vertical padding, or the fixed-height header self-jumps ~4px on connect.

## Latest Activity rail status honesty
`HeroActivityRail` derives its StatusPill from `useProtocolEvents().sources`:
LIVE only when rows exist AND no source `isError`; degrades to PARTIAL on any
source error. This is INTENTIONALLY stricter than the canonical events feed
(which hardcodes LIVE). Don't "fix" it to match — honest > optimistic.
