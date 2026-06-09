---
name: Design token harmonization
description: Rules for replacing hardcoded oklch light-mode-only colors with theme-aware Tailwind tokens in The Syndicate codebase.
---

# Replacement rules

## Background colors
- `bg-[color:oklch(0.96_0.018_85/0.4)]` → `bg-panel/40`
- `bg-[color:oklch(0.96_0.018_85/0.5)]` → `bg-panel/50`
- `bg-[color:oklch(0.96_0.018_85/0.6)]` → `bg-panel/60`
- `bg-[color:oklch(0.22_0.025_260/0.04)]` → `bg-muted/30`
- `bg-[color:oklch(0.22_0.025_260/0.08)]` → `bg-border/50` (progress bar tracks)
- `bg-white` → `bg-background` (in labs/preview components)

## Border colors
- `border-[color:oklch(0.22_0.025_260/0.06)]` → `border-border/50`
- `border-[color:oklch(0.22_0.025_260/0.08)]` → `border-border/60`
- `border-[color:oklch(0.22_0.025_260/0.12)]` → `border-border/70`
- `border-[color:oklch(0.22_0.025_260/0.15)]` → `border-border`
- `border-[color:oklch(0.22_0.025_260/0.18)]` → `border-border`
- `border-[color:oklch(0.22_0.025_260/0.2)]` → `border-border/80`

## Divide colors
- `divide-[color:oklch(0.22_0.025_260/0.04)]` → `divide-border/30`
- `divide-[color:oklch(0.22_0.025_260/0.06)]` → `divide-border/50`
- `divide-[color:oklch(0.22_0.025_260/0.08)]` → `divide-border/60`

## Text colors
- `text-[var(--navy)]` on headings/card content → `text-foreground`
- `text-[var(--navy)]` on quote/secondary text → `text-foreground/70`
- `text-[oklch(0.22_0.025_260)]` on **gold-gradient-background** buttons → KEEP (dark-on-gold is correct in all modes, gold gradient doesn't change between light/dark)
- `text-[oklch(0.22_0.025_260)]` on ghost buttons (no gold bg) → `text-foreground`

## Pill component (Primitives.tsx)
- `navy` tone pill was `border-[var(--navy)]/30 text-[var(--navy)] bg-[var(--navy)]/5` → `border-border/60 text-foreground/80 bg-muted/30`
- `muted` tone pill was `border-[color:oklch(0.22_0.025_260/0.15)] text-muted-foreground bg-[color:oklch(0.22_0.025_260/0.04)]` → `border-border/60 text-muted-foreground bg-muted/30`

## Key principle
`oklch(0.22_0.025_260)` is dark navy (~22% lightness) — SAME in both light and dark mode. 
- On light backgrounds → good contrast (correct)
- On dark backgrounds (dark mode cards) → invisible (bug)
- On gold-gradient buttons → good contrast in ALL modes (keep, don't change)

## Protected files (never touch)
- `src/lib/syndicate-config.ts`
- `src/lib/protocol-truth.ts`
- `src/lib/sale-hooks.ts`
- `src/lib/wagmi.ts`
- `src/lib/payment-flow.ts`
- `src/lib/chapters.ts`
