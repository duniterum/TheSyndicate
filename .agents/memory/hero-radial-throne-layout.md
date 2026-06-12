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

Related: `AvalancheMark` is the exported official-logo SVG in `HeaderWalletChip` (red circle + evenodd white AVAX cutout), reused by `ProtocolHero` `ProofMini`; old hand-drawn `AvalancheIcon`/`ThroneIcon` removed. Mountain bg = `public/hero/mountain-bg.jpg`, dark-theme-only (`hidden dark:block`) per obsidian-cockpit doctrine (light theme keeps the ivory/gold field, no photo).
