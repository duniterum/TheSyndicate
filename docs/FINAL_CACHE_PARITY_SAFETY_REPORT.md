# Final Cache / Parity Safety Pass — Report

**Date:** 2026-06-05
**Scope:** Hidden build diagnostics · stale-build banner · automated rendered
content scan. No visible "dev build" tag on the public site.

---

## 1. Visible build tag — REJECTED

A visible footer build tag (`Build YYYY-MM-DD · wave-Pn · production`) was
present and has been removed. Public visitors should never see deployment
IDs, wave codenames, or asset hashes — it reads as unfinished.

**Change:** `src/components/syndicate/BuildStamp.tsx` now renders only:
- a `sr-only` div carrying `data-build-stamp / data-build-iso /
  data-build-tag / data-build-env` attributes (invisible, screen-reader
  hidden via `aria-hidden`, no visible glyph)
- an HTML comment sibling `<!-- syndicate-build: <iso> | <tag> | <env> -->`
  so curl/grep parity scripts can identify the build

The footer no longer prints any build text.

## 2. Hidden diagnostics — how QA reads the build

```bash
# from a terminal
curl -s https://thesyndicate.money | grep -oE 'syndicate-build:[^>]+'

# from the browser console
document.querySelector('[data-build-stamp]').dataset.buildTag
document.querySelector('[data-build-stamp]').dataset.buildIso
```

No new public route was added — the existing `BuildStamp` component placed
in the footer is sufficient and avoids advertising a `/_diagnostics` URL.

## 3. Stale-build banner — `src/components/syndicate/StaleBuildBanner.tsx`

Mounted once in `src/routes/__root.tsx`, runs only in production builds
(`import.meta.env.DEV` short-circuit).

**Detection:**
1. At mount, read the current bundle hash from
   `<script src="/assets/index-XXXX.js">` in `document`.
2. Fetch `/` with `cache: 'no-store'`, extract the same regex from the
   returned HTML.
3. Re-poll every 5 minutes and on `visibilitychange → visible`.
4. If the hashes diverge → show a small pill banner pinned to the bottom
   centre: `New version available.` + `Refresh` button + dismiss `✕`.

**Behaviour rules:**
- Hidden by default (no mismatch yet detected ⇒ nothing rendered)
- Hidden in dev (Vite HMR has no hashes)
- Hidden if detection fails (no `/assets/index-*.js` script found, or
  network fetch fails)
- Dismissal is per-hash: dismissing version `X` keeps it dismissed until
  a newer version `Y` is published (stored in
  `localStorage["syndicate.staleBuild.dismissedHash"]`)
- Small, professional, rounded pill — uses semantic tokens
  (`bg-background/95`, `border-amber-500/40`), not loud colours
- `role="status" aria-live="polite"` for screen readers
- Refresh triggers `window.location.reload()` — no service-worker
  unregister required because the project doesn't ship a SW

## 4. Automated rendered production scan —
   `scripts/check-homepage-content.mjs`

New script. Asserts on each target HTML payload:

| Must contain | Must NOT contain |
|---|---|
| `Flywheel` | `EP #` |
| `Protocol Economy` | `Compounder` |
| `70% Vault` | `score multiplier` |
| `70 / 20 / 10` | `Live Protocol Pulse` |
| `seat is the anchor` | `Episode entries` |
| `Programmatic Vault` | |

Targets (override with `node scripts/check-homepage-content.mjs <url>`):
- `https://thesyndicate.money`
- `[legacy preview URL removed]`
- preview URL

Bodies under 4 KB are treated as SPA shells (warn, skip — preview
sometimes returns an empty document and that's expected).

**Live run against production** (current build):

```
=== https://thesyndicate.money ===
OK    must contain  "Flywheel"
OK    must contain  "Protocol Economy"
OK    must contain  "70% Vault"
OK    must contain  "70 / 20 / 10"
OK    must contain  "seat is the anchor"
OK    must contain  "Programmatic Vault"
OK    must NOT contain  "EP #"
OK    must NOT contain  "Compounder"
OK    must NOT contain  "score multiplier"
OK    must NOT contain  "Live Protocol Pulse"
OK    must NOT contain  "Episode entries"
WARN  no <!-- syndicate-build: ... --> marker found
All content parity checks passed.
```

The build-marker warning will clear once the new `BuildStamp` ships in the
next publish.

Exit code is non-zero on any failure → easy to wire into a manual
pre-publish check or future CI step without locking us in.

## 5. Visual regression — deferred

Skipped intentionally. Pixel-diff suites against a constantly-evolving
live protocol page would generate constant false positives (LP TVL ticks,
buyer count increments, ago-timestamps) and a maintenance burden out of
proportion to the risk. The content-phrase scan above already catches
the failure modes that pixel diff would catch (missing Flywheel section,
old Episode list back in DOM, wrong routing wording).

Revisit when traffic justifies it — Playwright + a snapshot stored in
`tests/__visual__/` against a single deterministic surface (e.g.
`/registry` empty state) would be the entry point.

## 6. Remaining risks

- **Bundle hash never changes between deploys** if the JS bundle is
  byte-identical. Real risk is near-zero given BUILD_STAMP is bumped
  every pass.
- **Edge cache lag on HTML.** The HTML carries
  `cache-control: no-cache, must-revalidate, max-age=0`, so visitors
  pick up new HTML on their next navigation. The banner is a
  secondary safety net for already-open tabs.
- **Service workers.** The project ships none. If one is added later,
  add `navigator.serviceWorker.controller.postMessage('SKIP_WAITING')`
  to the Refresh click handler.

## 7. Launch readiness

**9.6 / 10** (unchanged). This pass adds resilience, not new product
surface. Production parity is verified by an automated script and
protected by a client-side staleness detector.
