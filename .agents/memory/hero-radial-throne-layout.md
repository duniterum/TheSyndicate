---
name: Hero radial throne/ring layout
description: Why the ProtocolHero radial ring stacks seat-text ABOVE the ring, throne alone on the top arc, and a small central-number clamp.
---

The hero radial ring (`ProtocolHero` `RadialStage`, ~400px wide at the lg/xl 3-column breakpoint) is too compressed to stack a throne + "You are visitor / Seat available" text + the large central "$X / LIVE CAPITAL FLOW" value vertically. They collide.

The reference mockup (image 3) resolves it, and the code now mirrors it:
- Seat text ("You are visitor / Seat available") lives **above** the `aspect-square` ring (`hidden sm:block`), not inside its top — this frees the ring's top zone.
- The throne (`/hero/throne.png`, ~0.97 aspect) sits **alone** on the top arc (`top-[1.5%]`), with **non-monotonic** responsive widths (base 80 → lg 72 → xl 84 → 2xl 92) because the `sm` single-column layout gives the ring more width than the `lg` 3-column layout.
- The central value clamp is kept **small** (`clamp(3rem,2.2rem+1.6vw,4.75rem)`, ~14–20% of the ring) to match the mockup proportion. The original `clamp(4.9rem,…,7.25rem)` was ~27% and forced the collision.

**Why:** at 1280 the ring is ~400px; a big number's centered value-stack tops out near ~25% of the ring, leaving no room for a throne + seat text at the top.

**How to apply:** if re-enlarging the hero number or moving the seat text back inside the ring, expect throne/number collision — re-test at the **lg breakpoint (1024–1280, tightest 3-col)**, not just wide screens.

Related: `AvalancheMark` is the exported official-logo SVG in `HeaderWalletChip` (red circle + evenodd white AVAX cutout), reused by `ProtocolHero` `ProofMini`; old hand-drawn `AvalancheIcon`/`ThroneIcon` removed.

**Mountain bg = `public/hero/cervin.jpg` (real Matterhorn/Cervin photo), shown in BOTH themes.** This OVERRIDES the earlier dark-only doctrine: the old `public/hero/mountain-bg.jpg` (generated, `hidden dark:block`) was replaced at founder request with a real Swiss peak, and `HeroAtmosphere` now renders it in light AND dark (`opacity-[0.5] dark:opacity-[0.6]`, NOT `hidden dark:block`). Scrims use `var(--background)` color-mix so the photo washes to ivory in light / obsidian in dark — light mode shows a subtle warm mountain field (rocky foreground low-center), not the old no-photo ivory. Do NOT re-hide the photo in light mode.

**Homepage header→hero blend + alignment doctrine.** The global `Header` (rendered by `PageShell`, NOT gated by `hideHeader` — that flag only hides the page-title block) is the alignment reference for the hero. Blend rules: `HeroLeft` carries no status pill so the headline sits high; the homepage suppresses the strips between header and hero via `PageShell` props `hideDemoBanner` + `hideIdentityRibbon` (default false; homepage only); the grid is `items-start` so the headline column and right metrics panel top-align under the header, while ONLY the `HeroEngine` root gets `lg:self-center` so the radial ring stays vertically centered.
**Why the header has a `wide` prop:** header + hero MUST share one container width or the hero overhangs the header on wide screens (founder viewport ≈1920). But the ring lives in the CENTER grid column, so a "bigger ring" is impossible inside the global 1280 (`max-w-7xl`) header — the column caps the ring at ~560. Resolution: `Header` takes a homepage-only `wide` prop (`PageShell.headerWide`) widening BOTH header and hero to `max-w-[1480px]`; every other page stays `max-w-7xl`. 1480 is chosen so the center column finally reaches the `max-w-[640px]` ring cap (cap is meaningful, not dead), yielding a ring bigger than the prior ~580 while header≈hero edges stay aligned; cost = ~100px header overhang past the 1280 lower homepage sections on very wide screens (accepted).
**Durable geometry gotchas:** the left column fr must stay ≥~1.1 or the "economy." headline overflows at the lg (1024) breakpoint; the right panel (3 stacked cards) is taller than the viewport, so the self-centered ring centers in that TALL grid and its bottom nodes graze the fold at ≤720px viewport height — a capture-tool artifact, NOT a bug, do NOT shrink the ring to "fix" it. No test pins the pill / DemoBanner / IdentityRibbon / hero layout classes.
