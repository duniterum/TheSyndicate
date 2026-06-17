---
name: /join ?amount deep-link prefill
description: How package/preset cards prefill the purchase widget, and why URL params (not shared state) are the mechanism.
---

# /join `?amount=N` deep-link prefill

Package/preset cards (JoinPackages, HomeProgressionTeaser) deep-link to
`/join?amount=N`. `join.tsx` `validateSearch` parses → `{ amount?: number }` and
`LivePurchase` seeds its `usdcInput` from `initialAmount` and self-scrolls to its
own `<section id="buy">` on mount.

**Why URL params and not shared component state:** `CTAButton` (Primitives.tsx)
is a plain `<a href>`, **not** a TanStack router `<Link>`. Every CTA click is a
full navigation / fresh mount, so the `useState` *initializer* reseeds the amount
on each mount — no client state-sync, no effect-on-prop-change needed. If
CTAButton ever becomes a router Link, the prefill+scroll must move to a
`useEffect([initialAmount])` (initializer alone won't re-run on same-route nav).

**Why `validateSearch` clamps magnitude + snaps to 6 decimals:** `LivePurchase`
computes `usdcRaw = parseUnits(String(usdc), 6)` inside a try/catch that falls
back to `0n`. A huge value (e.g. `?amount=1e30`) stringifies to exponent notation
(`"1e+30"`) which `parseUnits` rejects → silent `0n`. Clamp to ≤1_000_000 (well
above any package, far below JS's 1e21 exponent threshold) and round to 1e6.

**Truth boundary:** the prefill only *selects* an amount; the live widget still
enforces the era minimum, the per-address era cap (`exceedsEraCap`) and remaining
inventory. A package label never changes the rate — recognition is cumulative USDC.
Only `<LivePurchase>` call site is join.tsx; signature default `= {}` keeps it safe.
