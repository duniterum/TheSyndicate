---
name: Tailwind v4 arbitrary colors
description: How to apply token-based tinted colors reliably in this Tailwind v4 CSS-first project.
---

In this project (Tailwind v4, CSS-first `@theme inline` tokens in `src/styles.css`):

- Arbitrary `color-mix(...)` values DO compile and render, e.g.
  `bg-[color:color-mix(in_oklab,var(--accent)_10%,transparent)]`
  `border-[color:color-mix(in_oklab,var(--accent)_45%,transparent)]`
  (use underscores for the spaces inside the value).
- Opacity modifiers on arbitrary CSS-var colors are UNRELIABLE, e.g.
  `border-[var(--gold)]/40`, `bg-[var(--gold)]/10` may not produce the expected tint.

**Why:** the design tokens are CSS custom properties; the `/NN` opacity shorthand
needs a known color, not an opaque var reference, so it silently no-ops in some cases.

**How to apply:** for token-based tints/borders/glows prefer `color-mix(...)` in an
arbitrary value, or set `style={{ ... }}` inline with color-mix. The square BrandMark
glow and the cyan Pill/border tints use this pattern.
