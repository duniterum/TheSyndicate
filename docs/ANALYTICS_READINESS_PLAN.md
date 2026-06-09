# Analytics Readiness Plan — Pre Ads

Date: 2026-06-06
Status: vendor-neutral helper installed; **no provider attached**.

## Current state

`src/lib/analytics.ts` exposes a `track(name, props)` helper that dispatches through `window.__syndicateAnalytics` if (and only if) a provider has registered itself. Until then, events are no-ops in production and a single `console.debug` line in dev. There is **no third-party script, no cookie, no fingerprinting, no session replay, no PII, and no wallet-address-as-identity**. This pre-ads pass intentionally keeps it that way.

## Event vocabulary (typed in `AnalyticsEvent`)

Existing call sites:
- `join_cta_click`, `claim_seat_click`, `verify_click`, `registry_click`, `liquidity_click`, `trade_syn_click`, `add_liquidity_click`, `transparency_click`, `wallet_connect_click`, `purchase_start`, `purchase_success`, `purchase_error`.

Added in this pass (typed, ready when a provider is connected):
- `nft_archive_cta_click` — fired by the homepage NFT Archive teaser CTA.
- `my_syndicate_cta_click` — reserved for the dashboard CTA card.
- `docs_cta_click` — reserved for header/docs links.
- `view_archive_page` — reserved for an `/archive` mount effect (deferred to avoid SSR noise).
- `view_join_page` — reserved for an `/join` mount effect (deferred).

The five reserved events are typed but not wired. They can be added in a one-line `useEffect` per route when a provider is selected — no provider, no firing.

## Why we did not attach a provider in this pass

The brief explicitly forbids adding analytics that requires:
- new paid service
- new account setup
- cookie consent changes
- privacy policy changes
- third-party scripts that slow the site
- user fingerprinting

Every viable provider (Plausible, PostHog, GA4, Fathom) requires at minimum a new account and a script tag. That belongs in a deliberate later decision, not a pre-ads pass.

## Recommended next steps (deferred until after first ads or until owner picks a stack)

1. Pick a privacy-first provider. Default recommendation: **Plausible** (no cookies, no PII, no consent banner required in EU, lightweight script).
2. Add the provider snippet inside `<head>` via `__root.tsx`'s `head().scripts` so it ships once.
3. Implement `window.__syndicateAnalytics = (name, props) => window.plausible(name, { props })` in a small bootstrap module imported from `__root.tsx`.
4. Wire the five reserved events:
   - `view_archive_page` → `useEffect` in `src/routes/archive.tsx`
   - `view_join_page` → `useEffect` in `src/routes/join.tsx`
   - `my_syndicate_cta_click` → existing CTA `onClick`
   - `docs_cta_click` → header Docs link
   - `nft_archive_cta_click` → already wired in `HomeArchiveTeaser.tsx`
5. Update privacy notice on `/whitepaper` or `/docs` only if the chosen provider requires it (Plausible does not).

## Privacy guarantees we will maintain

- No wallet address is sent as a user identity. Wallet context (e.g. a successful purchase tx hash) may be passed as an event property where the action is itself public on-chain.
- No PII (email, IP storage beyond provider defaults).
- No cross-site tracking.
- No session replay.
- Events remain anonymous and aggregate.

## Verdict

Pre-ads safe. Analytics is opt-in by provider registration; nothing fires today.
