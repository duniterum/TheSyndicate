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

**Header→hero blend pass (founder reference "image 1").** To make the global header flow straight into the hero: (1) the "● LIVE PROTOCOL" pill was removed from `HeroLeft` so the headline sits higher; (2) the homepage suppresses the two global strips that sat between header and hero via new `PageShell` props `hideDemoBanner` + `hideIdentityRibbon` (both default false; set true only in `routes/index.tsx`); (3) section/grid `min-h` corrected `100svh-72px`→`100svh-64px` and `HeroEngine` tightened (`max-w-[580px] py-2`) so the radial ring rides UP and stays fully centered. No test pins the pill / DemoBanner / IdentityRibbon on the homepage.
