> **Historical note:** this document predates the current chapter/NFT doctrine. It is kept for record and must not be used as implementation authority. See `docs/DOCUMENTATION_AUTHORITY_MAP.md`.

# Chapter Archives — QA Checklist

Run this before marking Chapter Archives "shipped." Any failed item is
a blocker.

## Routes

- [ ] `/chapters` resolves and renders.
- [ ] `/chapters/genesis` resolves.
- [ ] `/chapters/first-100` resolves.
- [ ] `/chapters/first-500` resolves.
- [ ] `/chapters/first-1000` resolves.
- [ ] `/chapters/open` resolves.
- [ ] `/chapters/current` resolves and shows the currently-forming chapter.
- [ ] `/chapters/unknown-slug` shows the not-found component, not a crash.

## Pagination

- [ ] `?page=2` advances the list and the URL persists across refresh.
- [ ] First page disables "Previous".
- [ ] Last page disables "Next".
- [ ] When members < 50, no pagination control is rendered.
- [ ] Page size is exactly 50.
- [ ] Out-of-range `?page=999` is clamped to the last real page.

## Empty / loading / error states

- [ ] Chapter with zero members shows the `Opens at #N` empty state with a Join CTA.
- [ ] While the holder index is loading and has no data: status pill `PARTIAL`, body shows skeleton/empty copy.
- [ ] If the holder index errors: status pill `PENDING`, no fabricated rows.
- [ ] Active chapter is highlighted on `/chapters` overview.

## Data model integrity

- [ ] Member count comes from `useHolderIndex` (no manual numbers).
- [ ] Chapter assignment is purely a function of `founderNumber`.
- [ ] No USDC amounts displayed on tiles.
- [ ] No SYN balances displayed on tiles.
- [ ] No sort-by-contribution control anywhere.
- [ ] No "top buyers" / "biggest spenders" / leaderboard language.

## Verification

- [ ] Each tile links to `/wallet/$address`.
- [ ] Each tile shows the first-purchase block.
- [ ] "Verify on Avascan" opens the correct transaction on Avalanche.
- [ ] "How to verify this chapter" block is present on every chapter page.

## Status / freshness

- [ ] `StatusPill` shows `LIVE` once at least one purchase is indexed.
- [ ] `asOfBlock` is rendered when known.
- [ ] No surface invents numbers when data is missing.

## Navigation & IA

- [ ] Header → Community menu lists Chapters between Founders and Ranks.
- [ ] Breadcrumbs render "Chapters" on overview and chapter pages.
- [ ] Each chapter page links back to `/chapters`.
- [ ] Each chapter page exposes a Join CTA for the empty case only.

## SEO / OG

- [ ] `/chapters` has unique title, description, canonical.
- [ ] Each `/chapters/$slug` has a slug-specific title and description.
- [ ] OG image, OG dimensions, and Twitter card present on every page.
- [ ] `og:url` and `<link rel="canonical">` agree.

## Responsive

- [ ] Mobile (≤480 px): grid collapses to one column, tiles stay tappable, pagination controls reachable.
- [ ] Tablet (~768 px): two/three columns, no overflow.
- [ ] Desktop (≥1280 px): four columns, no horizontal scroll.

## Performance

- [ ] Per-page DOM stays ≤ ~50 tiles (pagination cap).
- [ ] No infinite list growth as data scales.
- [ ] No layout shift on tile hover.
- [ ] Lighthouse mobile score ≥ 90 on `/chapters` with empty data.

## Accessibility

- [ ] All tiles are real anchor / button elements (keyboard reachable).
- [ ] Pagination buttons have visible focus state.
- [ ] Status pills have readable text contrast.
- [ ] No essential information is conveyed via color alone (sealed/active also uses text).

## Legal / copy

- [ ] No "reward", "yield", "dividend", "profit", "investment", "returns".
- [ ] No "guaranteed", "priority", "exclusive perks".
- [ ] Disclosure block is present on overview and on each chapter page.
- [ ] Active-chapter framing is neutral (no urgency, no scarcity countdown).

## Regression sanity

- [ ] `/members`, `/founders`, `/ranks`, `/wallet/$address` still render.
- [ ] No new console errors on load.
- [ ] `bun run build` succeeds.
