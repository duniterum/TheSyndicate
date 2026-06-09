---
name: Obsidian Cockpit theme doctrine
description: Brand/visual rules for The Syndicate shell so future edits stay consistent.
---

Approved identity: **Direction A — Obsidian Cockpit** (premium crypto cockpit + living
protocol + collector archive + on-chain progression). NOT "dark theme applied", NOT
"developer dashboard", NOT "generic crypto template".

Rules:
- **Accent = neon cyan in DARK theme only.** Dark is the default (see `src/lib/theme.tsx`).
  Light theme intentionally keeps gold + warm ivory — this is a deliberate dual-theme
  decision, not a bug. `--gold`/`--accent`/`--verify` all alias to cyan in `.dark`.
- **Serif (Fraunces) ONLY inside `.editorial-serif`** scope (Chronicle/whitepaper). The
  unlayered `.editorial-serif h1/h2/h3/blockquote` rule overrides the `font-serif`
  utility (which `@theme inline` bakes to Space Grotesk). Default display = Space Grotesk.
- **Geometry is crisp.** Global `--radius` is small (0.25rem) so cards/buttons/badges
  read as instruments. BrandMark is a square plate.
- **Brand mark is shared:** `src/components/syndicate/Logo.tsx` (BrandMark/Wordmark/Logo)
  is the single source — reuse it, never hand-roll a new logo block.
- **CTA hierarchy:** primary = solid cyan + black text, mono uppercase; secondary =
  outline; tertiary = muted ghost. Live via `CTAButton` variants gold/navy/ghost.

**Why:** keeps the whole site reading as ONE product and prevents drift back to soft
"museum" styling or generic crypto templates.

**How to apply:** when touching any shell/brand surface, pull color from tokens (cyan in
dark), keep geometry sharp, use the shared Logo, and never introduce serif outside the
editorial scope.
