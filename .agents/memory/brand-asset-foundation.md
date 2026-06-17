---
name: Brand asset foundation
description: Canonical mark, color-role doctrine, what's wired vs frozen/forbidden, and rasterization gotchas for The Syndicate brand assets.
---

# Brand asset foundation

## Canonical mark (CURRENT, founder-approved)
- The approved brand mark is the **gold "Interlock" emblem** — interlocking "S" form in brand gold `#E3A92B` on obsidian `#0A0B0D`. Approved raster/vector set lives in `public/brand-v2-syndicate-interlock/` (favicon.ico, syn-favicon.svg, syn-app-icon.png + -512, syn-icon-maskable.png, syn-og.png 1200×630, syn-lockup-dark.png 2560×680, syn-mark-gold).
- **SUPERSEDED / FORBIDDEN — never wire:** the old "six-node hex ring" emblem (`src/components/syndicate/SyndicateEmblem.tsx`, lineage `public/brand-v1-node/`) and `public/brand-v2-syndicate-mark/`. The folders still exist on disk but are explicitly out of brand. `SyndicateEmblem.tsx` is dead except for its own BrandBoard preview — do not adopt it.

## What is WIRED vs FROZEN (site chrome)
- **Wired to Interlock:** root `public/favicon.ico` (multi-res 48/32), `public/favicon.svg`, `public/apple-touch-icon.png` (512×512; iOS downscales), `public/site.webmanifest` (name "The Syndicate"/short "Syndicate", display standalone, theme/bg `#0A0B0D`, icons → syn-app-icon-512 [any] + syn-icon-maskable [maskable]), and the **homepage** OG/Twitter image → `…/brand-v2-syndicate-interlock/syn-og.png`. Head links are in `src/routes/__root.tsx`; homepage OG in `src/routes/index.tsx`.
- **Header/nav mark = Interlock (RESOLVED):** `src/components/syndicate/Logo.tsx` `BrandMark` now renders the SAME artwork as the tab favicon (`<img src="/favicon.svg">` = gold Interlock glyph on obsidian plate). `BrandMark` is the single source of truth, so Header / Footer / PageShell hero / mobile bar / Sections all match the tab/app/social identity. The old cyan-"S" plate is GONE — do not reintroduce it. `tone` prop is retained for caller compatibility but is now a **no-op** (the mark is always gold = identity). Header uses the **MARK** (compact chrome), NOT the lockup — lockups (`syn-lockup-*`, `syn-splash`, `syn-press-hero`) are reserved for splash/press, never the nav.
- `BrandBoard.tsx` showcases the Interlock set as a section on the existing `/labs/component-index` route (no dedicated lab route).

## OG / head (current truth)
- `__root.tsx` sets **no** default `og:image` (the old `/og/og-brand.png` default does not exist). Each leaf route sets its own absolute og:image: homepage → `syn-og.png`; `/transparency` → `/og/og-transparency.png`; wallet/milestone → dynamic `/api/public/og/*` with `/og/og-protocol-default.png` as twitter fallback. TanStack head dedupes by `name ?? property`, deepest-match wins.
- `og-metadata-test.mjs` only checks tag **presence** (not path) on 4 canonical routes; it is NOT wired into check-release/validation. No test asserts favicon/apple/manifest links.

## Color-role doctrine (founder rule — non-negotiable)
- Gold = identity / brand / seat / token. Cyan = live data / verification / activity. Green = success only. Red = risk / error only.
- **GOTCHA:** do NOT use Avalanche brand red (`#E84142`) for network branding/chrome. Red is reserved for risk/error — architect blocked this once. Use neutral/muted or gold/cyan per role.

## Rasterization (ImageMagick)
- `magick` renders SVG gradients and `<text>` via DejaVu fallback — SVG `font-family` stacks MUST include `'DejaVu Sans'` / `'DejaVu Sans Mono'` or text won't render.
- favicon.ico built with `-define icon:auto-resize=…`; maskable icon = app-icon on `#0A0B0D` background with safe-zone padding.
- New files under `public/` 404 until the dev workflow restarts. Do NOT `vite build` to validate (OOMs); use `tsc --noEmit` + asset 200 checks + dev-server screenshot.
