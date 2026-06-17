# The Syndicate — Brand Guidelines

Sprint 0B brand foundation. This document is the usage reference for the canonical
mark and the asset set. It is a brand reference, not protocol canon — on-chain truth
and code registries always outrank it.

Live preview: `/labs/component-index` → **Brand Foundation** section (internal, noindex).

---

## 1. The mark

The canonical direction is a **rounded interconnected emblem**: six member nodes on a
hexagonal ring, each linked by a spoke to the central seat node. It reads as *members
around the seat* — the Syndicate. Rounded line caps and rounded nodes throughout.

- React component (in-app): `src/components/syndicate/SyndicateEmblem.tsx`
- Master vector: `public/brand/emblem-gold.svg`
- One-color variants: `public/brand/emblem-ivory.svg` (dark bg), `public/brand/emblem-ink.svg` (light bg)

The component defaults to the theme-aware `--identity` token (always gold in both
themes). Static assets use the fixed brand gold `#E3A92B` to match the live header.

---

## 2. Color roles (founder rule — non-negotiable)

| Color | Hex | In-app token | Meaning |
| --- | --- | --- | --- |
| Gold | `#E3A92B` | `var(--identity)` | Identity · brand · seat · token |
| Cyan | `#2BE8E8` | `var(--live)` / `var(--verify)` | Live data · verification · protocol activity |
| Green | `#25B07A` | success | Success states only |
| Red | `#E5484D` | `var(--destructive)` | Risk · error only |

Note: the dark Obsidian Cockpit theme intentionally repoints `--gold` → cyan. For
brand gold that must survive the dark theme, always use `--identity` (or the fixed
`#E3A92B`), never `--gold`.

Supporting neutrals: obsidian `#0A0B0D` / deep `#070809`, ivory `#F5F1E8`, ink `#16181C`.

---

## 3. Asset index

| Asset | Path |
| --- | --- |
| Master emblem (gold) | `public/brand/emblem-gold.svg` |
| Emblem — ivory / ink (one-color) | `public/brand/emblem-ivory.svg`, `public/brand/emblem-ink.svg` |
| Logo lockup — dark variant | `public/brand/logo-dark.svg` |
| Logo lockup — light variant | `public/brand/logo-light.svg` |
| Favicon (vector + legacy) | `public/favicon.svg`, `public/favicon.ico` |
| App icon (master) | `public/brand/app-icon.svg` |
| Apple touch icon (180) | `public/apple-touch-icon.png` |
| PWA icons (192 / 512 / maskable) | `public/icon-192.png`, `public/icon-512.png`, `public/icon-512-maskable.png` |
| Social avatar | `public/brand/social-avatar.svg`, `public/brand/social-avatar-512.png` |
| SYN coin mark | `public/brand/syn-coin.svg`, `public/brand/syn-coin-256.png`, `public/brand/syn-coin-200.png` |
| Social / OG card (1200×630) | `public/og/og-brand.svg`, `public/og/og-brand.png` |
| Web manifest | `public/site.webmanifest` |

The 200×200 coin PNG is sized for exchange / market-data listing logos
(e.g. CoinGecko / CoinMarketCap upload requirements).

---

## 4. Clearspace & minimum size

- Keep clearspace of at least one node-radius around the emblem on all sides.
- Do not render the bare emblem below **16px**. For 16–32px contexts use the favicon
  tile build (gold emblem on an obsidian rounded square), which stays legible.

---

## 5. Do / Don't

**Do**
- Render identity (mark, seat, token) in gold.
- Reserve cyan for live data, verification, and protocol activity.
- Keep the emblem on obsidian or ivory with full clearspace.
- Use the one-color ivory or ink emblem when gold lacks contrast.

**Don't**
- Recolor identity cyan, or use gold for live / activity accents.
- Stretch, rotate, restyle, or re-space the nodes.
- Pair the mark with market metrics or financial-return claims.
- Place the emblem on low-contrast or busy backgrounds.

---

## 6. Wiring status

- Favicon, app icons, web manifest, theme-color, and the default social card are
  wired in `src/routes/__root.tsx`.
- The `SyndicateEmblem` component is **prepared, not adopted** — the live Header /
  nav still uses `src/components/syndicate/Logo.tsx`. Swapping nav to the emblem is
  reserved for Sprint 1.
