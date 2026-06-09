---
name: Tailwind v4 @theme inline + cascade layers
description: Why per-scope CSS-variable overrides and @layer base overrides of a utility silently fail in this app's styles.css
---

In `src/styles.css` the design tokens live in `@theme inline { ... }`.

**Gotcha 1 — `@theme inline` bakes values into utilities.**
With `inline`, Tailwind substitutes a token's *resolved value* directly into the
generated utility instead of emitting `var(--token)`. Example: `--font-serif: var(--font-sans)`
makes the `.font-serif` utility compile to `font-family: var(--font-sans)`, NOT
`font-family: var(--font-serif)`. So redefining `--font-serif` in a narrower scope
(e.g. `.editorial-serif { --font-serif: ... }`) has **zero effect** on the `font-serif`
utility — it never reads that variable.

**Gotcha 2 — @layer utilities beats @layer base regardless of specificity.**
A scoped override like `.editorial-serif .font-serif { font-family: ... }` placed inside
`@layer base` will LOSE to Tailwind's `.font-serif` utility (in `@layer utilities`),
even though the scoped selector has higher specificity — cascade layers win over specificity.

**How to apply:** to override a Tailwind utility for a scope, write the rule **unlayered**
(outside any `@layer`). Unlayered rules beat all layered rules. This is how the
`.editorial-serif`/`.prose-serif` Fraunces override is made to win.

**Why:** retiring serif site-wide (Obsidian Cockpit) while keeping Fraunces only in
Chronicle/whitepaper required exactly this — took several attempts before the unlayered
fix worked.
