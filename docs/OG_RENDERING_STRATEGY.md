# OG Rendering Strategy — The Syndicate

**Status:** chosen approach for Wave 3B.1.
**Priority order (non-negotiable):** Stability > Truth > Cross-platform rendering > Visual quality > Maintainability.

## TL;DR

We use a **hybrid SVG + static PNG strategy**:

- `og:image` → **dynamic SVG** generated server-side from on-chain reads
  (`/api/public/og/wallet/$address`, `/api/public/og/milestone/$id`).
  Renders richly on every platform that respects SVG OG: Telegram, Discord,
  Slack, iMessage, Bluesky, Mastodon, Signal.
- `twitter:image` → **static, premium-quality branded PNG** shipped from
  `/public/og/*.png`. X/Twitter strips SVG `og:image` and would otherwise
  fall back to a text-only Summary card. Static PNG guarantees a strong
  branded card on X for every shared Syndicate URL.
- Per-route `head()` always carries truthful `title` + `description` + `og:url`
  so even a pure text fallback (worst case) reads as a real protocol object.

## Why not the alternatives

### Rejected — Option A: workerd-native satori + resvg pipeline

We attempted `workers-og` (satori + WASM resvg) for wallet/milestone OG.
It failed at dev-runtime: `Cannot find package 'a' imported from
/dev-server/node_modules/workers-og/dist/yoga-ZMNYPE6Z.wasm` (WASM-package
ESM resolution diverges between Vite's dev module runner and workerd in
production). The dev server crashed on the OG routes, which would have
cascaded into SSR 500s for any page referencing `og-data.server.ts`.

The package was removed; the route was pivoted to pure SVG. We will NOT
re-introduce a WASM-based satori/resvg pipeline in this wave. Re-evaluating
this is appropriate only after:
1. TanStack Start + workerd ship a stable, Vite-dev-runner-compatible WASM
   loading story, OR
2. We ship an isolated PNG render worker (separate deploy, separate failure
   domain) — see Option B below.

### Rejected — Option B: external rendering service (own micro-worker)

A separate Cloudflare Worker or Vercel function dedicated to PNG render
would solve the dev/runtime split. Deferred because:
- It introduces an external failure domain (extra deploy, extra latency
  budget, extra secret to rotate).
- It is overkill for current traffic.
- Static PNG fallbacks (chosen approach) already give X parity for the
  default identity card. The marginal value of per-wallet/per-milestone
  PNG on X (vs. branded fallback + rich text) is small at MVP scale.

We reserve the right to add this once weekly share volume on X justifies
the operational cost.

### Rejected — Option C alone (static PNG + dynamic text only)

Static-only would forfeit the per-wallet / per-milestone SVG previews we
already have on Telegram/Discord/etc. That preview IS the protocol proof
artifact (founder #, rank, chapter, cumulative USDC). Throwing it away
to satisfy X would degrade every other platform.

### Chosen — Option C + D hybrid (static PNG for X · dynamic SVG everywhere else)

- Keeps the proof-grade SVG card on every platform that supports it.
- Gives X a strong, on-brand card instead of a text-only Summary.
- Zero new runtime dependencies. Zero WASM. Zero SSR risk.
- Static PNGs are generated once, committed to `/public/og/`, served from
  the CDN with permanent caching.

## Runtime constraints

- Workerd has no native PNG encoder; we will not buffer PNGs at request time.
- All dynamic image generation MUST remain pure JS/SVG with zero WASM
  dependencies until the workerd ESM-WASM story is stable in dev.
- Static PNGs live under `/public/og/` and are referenced by absolute URL
  (`https://thesyndicate.money/og/...`) so social crawlers can fetch them
  before any session is established.

## Dependency impact

- No new dependencies added.
- `workers-og` was removed in the SVG pivot and remains removed.

## Fallback behavior

| Platform                       | Reads `og:image` (SVG) | Falls back to `twitter:image` (PNG) | Outcome |
| ------------------------------ | ---------------------- | ----------------------------------- | ------- |
| X / Twitter                    | ✗ strips SVG           | ✓                                   | Branded static PNG card |
| Telegram                       | ✓                      | n/a                                 | Live dynamic SVG card |
| iMessage / Apple Link Preview  | ✓                      | n/a                                 | Live dynamic SVG card |
| Discord                        | ✓                      | n/a                                 | Live dynamic SVG card |
| Slack                          | ✓                      | n/a                                 | Live dynamic SVG card |
| Bluesky                        | ✓                      | n/a                                 | Live dynamic SVG card |
| Mastodon                       | ✓                      | n/a                                 | Live dynamic SVG card |
| Signal                         | ✓                      | n/a                                 | Live dynamic SVG card |
| LinkedIn                       | partial (PNG preferred)| ✓ used as primary                   | Branded static PNG card |
| Facebook                       | partial (PNG preferred)| ✓ used as primary                   | Branded static PNG card |

When neither image renders (rare), every Syndicate URL still has a
truthful `title` + `description` + `og:url` so the fallback Summary
card reads as a real protocol object, not a generic page.

## Static asset inventory

| File                              | Used by               | Purpose                                   |
| --------------------------------- | --------------------- | ----------------------------------------- |
| `/public/og/og-protocol-default.png` | `/` and any wallet/milestone twitter:image fallback | Branded "Living protocol on Avalanche" snapshot |
| `/public/og/og-transparency.png`     | `/transparency`       | "Verify everything on-chain" investor-grade card |

PNGs are 1280×672 (≈ 1.9:1, the safe X large-card aspect ratio).

## Test plan

Before claiming Wave 3B.1 complete, walk through the matrix in
`OG_RENDERING_VERIFICATION.md` for at least:
- `/`
- `/transparency`
- one `/wallet/$address` URL (member)
- one `/milestone/$id` URL

For each, verify:
- title and description correct in platform debugger
- image renders (or branded fallback PNG renders on X)
- on-chain values in dynamic SVG are truthful and as-of-block stamped
- no PENDING shown as LIVE
