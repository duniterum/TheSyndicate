---
name: Hero right-panel division of labor
description: What the homepage hero's radial center vs Protocol Overview panel may show, and why
---

# Hero right-panel division of labor

The homepage hero has two display zones on the right; the founder "HERO
CLEANLINESS + HYDRATION STABILITY" ruling revised their division of labor:

- **Radial center** = the live protocol-FLOW picture, NOT a KPI. It is calm:
  a "routing in real time" indicator + the directional "Membership → Vault ·
  Liquidity · Ops" statement. NO giant headline number in the center. Per-lane
  treasury figures still live on the surrounding nodes; throne (seat) sits on
  top, burn monument at the bottom.
- **Protocol Overview panel** = the headline metrics, in founder priority
  order: (1) Members, (2) USDC routed, (3) Burned SYN, (4) LP TVL.

**SUPERSEDED:** the older rule "radial OWNS the money stats / panel = ONLY
Members + Burned" no longer holds. The giant center "USDC routed" number was
removed; USDC routed + LP TVL moved INTO the panel.

**Why:** the hero must read as a TRAILER — center communicates *what the
protocol does* (flow); panel carries the *proof numbers* in priority order. One
giant dollar figure over-indexed on a single number and fought the panel.

## Demote, never delete
SYN price / Ref. market / Ref. FDV / Initial / Effective supply stay OFF the
hero but remain on the site (tokenomics page, below-fold KPI grid, the
intelligence-bar ticker). When asked to declutter the hero, demote/move metrics;
never delete a metric off the whole site, and never re-duplicate radial figures
into the panel.

## Hydration-stability contract (durable rules)
First paint (PENDING / "—") and the loaded value must be DIMENSIONALLY IDENTICAL
— no reflow / pop-in. The enforced rules:
- Reserve a fixed value width (`minWidth` in `ch`) + `tabular-nums` so the "—"
  placeholder occupies the same box as the loaded value. `minWidth` (not
  `width`) is deliberate: placeholders must never be larger than loaded values.
- The status meta is a FIXED two-line stack (status/badge, then note), both
  `nowrap`. **Do not** revert it to one wrapping line: a longer status word
  (PENDING/DERIVED vs LIVE) wraps differently and reflows every row below.
- The seat-label number (desktop + mobile) is a fixed-width tabular span so the
  centered headline does not re-center as the seat number grows.

## Header connect-jump
The connected wallet trigger and the disconnected Connect button must share the
same vertical padding, or the fixed-height header self-jumps ~4px on connect.

## Latest Activity rail status honesty
`HeroActivityRail` derives its StatusPill from `useProtocolEvents().sources`:
LIVE only when rows exist AND no source `isError`; degrades to PARTIAL on any
source error. This is INTENTIONALLY stricter than the canonical events feed
(which hardcodes LIVE). Don't "fix" it to match — honest > optimistic. In dev it
shows PARTIAL / "Reading recent blocks" because the RPC has no CORS on cold scan
(expected); it populates LIVE in prod from the seeded persisted cache.
