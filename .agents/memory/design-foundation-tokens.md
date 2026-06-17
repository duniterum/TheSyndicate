---
name: Design foundation tokens (identity-gold vs live-cyan)
description: Canonical design primitives/tokens for The Syndicate; how brand-gold survives the dark obsidian theme that repoints --gold→cyan.
---

# Design Foundation Layer (Sprint 0A)

Canonicalized the EXISTING primitives — did NOT build a 2nd design system. Touched only
`src/styles.css`, `Primitives.tsx`, `ui/button.tsx`, and migrated the RevenueStreams pill.

## Brand ruling (founder-approved)
- **Gold = identity / brand / seat / token.** **Cyan = live data / verification / activity.**

## The --gold trap (most important)
- The DARK obsidian-cockpit theme INTENTIONALLY repoints `--gold` → cyan (and
  `--shadow-glow-gold` → cyan). This is correct by doctrine, NOT a bug — do not "fix" it.
- **Why:** dark accent is cyan (see obsidian-cockpit-doctrine).
- **How to apply:** when something must stay GOLD in BOTH themes (brand/identity/seat),
  use the always-gold tokens `--identity` / `--identity-foreground` and the
  `--shadow-glow-identity` token / `.glow-border-identity` utility. Never use
  `--gold` / `glow-border-gold` for brand-gold that must survive dark — those turn cyan.

## ProtocolHero deliberately left gold (do not migrate)
- Hex is woven through inline styles + SVG stopColor + color-mix (a forbidden restructure),
  and its `#E3A92B` ≠ `--gold` (converting would shift hue). Under the ruling the hero
  staying gold is CORRECT. Leave it.

## Primitives (additive, in Primitives.tsx)
- `CanonicalStatus` is the canonical status vocabulary (LIVE/DERIVED/PARTIAL/PENDING/FUTURE/DEMO).
  Widening it = edit the union AND the two exhaustive `Record<CanonicalStatus,…>` maps in lockstep.
- Atoms Eyebrow/MonoLabel/Stat/Panel/SectionShell are additive. Eyebrow defaults to `div`;
  MonoLabel defaults to `span` (inline). Inside an inline container use `<Eyebrow as="span">`
  to avoid invalid div-in-span / hydration quirks.
- Button `gold`/`verify` cva variants use `color-mix`, NOT `/NN` opacity on arbitrary var()
  colors (Tailwind v4 quirk — see tailwind-v4-arbitrary-colors).
