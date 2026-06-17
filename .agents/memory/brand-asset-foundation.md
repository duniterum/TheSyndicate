---
name: Brand asset foundation (Sprint 0B)
description: Canonical mark, color-role doctrine, what's wired vs prepared, and rasterization gotchas for The Syndicate brand assets.
---

# Brand asset foundation (Sprint 0B, founder-approved)

## Canonical mark
- The brand mark is the **"rounded interconnected emblem"**: six member nodes on a hexagonal ring, each linked by a spoke to a central **seat** node (members around the seat). Geometry is frozen in `src/components/syndicate/SyndicateEmblem.tsx` (viewBox 0 0 64 64; hex ring + 6 spokes from center; outer nodes r3.4, center r5.6, stroke 2.4 round).
- Brand gold = `#E3A92B` (matches header). The component defaults to theme-aware `var(--identity)` (always gold in both themes); static raster assets use the fixed `#E3A92B`.

## What is WIRED vs PREPARED
- `SyndicateEmblem` is **PREPARED, not adopted** — production nav still uses `src/components/syndicate/Logo.tsx`. Logo.tsx/Header are FROZEN; swapping nav to the emblem is a future sprint, not Sprint 0B.
- `BrandBoard.tsx` is a read-only preview mounted as a **section on the existing `/labs/component-index`** route. Sprint 0B created **NO new lab route** (guardrail).
- Favicon/app-icons/manifest/theme-color (`#0A0B0D`)/default OG card are wired in `src/routes/__root.tsx`.

## Color-role doctrine (founder rule — non-negotiable)
- Gold = identity / brand / seat / token. Cyan = live data / verification / activity. Green = success only. Red = risk / error only.
- **GOTCHA:** do NOT use Avalanche brand red (`#E84142`) for network branding/chrome (e.g. a "C-Chain" dot). Red is reserved for risk/error — architect blocked this once. Use neutral/muted (`bg-muted-foreground/50`) or gold/cyan per role.

## OG / head
- Root sets a DEFAULT `og:image`/`twitter:image` → `/og/og-brand.png`. Leaf routes (e.g. `index.tsx` → og-protocol-default.png) keep their own absolute og:image; TanStack Router head dedupes by `name ?? property` deepest-match-first, so leaf overrides win — **no duplicate tags**. Safe to keep a root default.

## Rasterization (ImageMagick)
- `magick` renders SVG **gradients and `<text>` correctly** using DejaVu fallback fonts. SVG `font-family` stacks MUST include `'DejaVu Sans'`/`'DejaVu Sans Mono'` fallbacks or text won't render in the container (only DejaVu is installed).
- favicon.ico built with `-define icon:auto-resize=64,48,32,16`; maskable icon = app-icon resized to 410 then `-extent 512x512` on `-background "#0A0B0D"` for safe-zone padding.
- Do NOT run `vite build` to validate (OOMs); validate via `tsc --noEmit` + wording guards + dev-server screenshot.
