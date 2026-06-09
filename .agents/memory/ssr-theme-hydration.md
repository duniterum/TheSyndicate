---
name: SSR theme hydration
description: Why the theme provider must not read the DOM during useState init, and how dark-mode SSR is wired in this app.
---

# Rule
A theme/dark-mode provider in this SSR app (TanStack Start) must render the SAME initial value the server renders (always `"light"` here). Do NOT seed `useState` by reading `document.documentElement.classList` — that runs on the client during hydration and diverges from the server.

**Pattern used:** seed state `"light"`, then in a mount `useEffect` call `readInitial()` (read the `.dark` class the boot script applied) and set a `hydrated` flag. Guard the DOM-write effect with `if (hydrated)` so the first post-mount pass doesn't strip the boot-script class (avoids a flash).

**Why:** Initializing state from the DOM caused `ThemeToggle` to render Sun (dark) on the client but Moon (light) on the server → "Hydration failed" + React dev-mode "Invalid hook call" cascade during tree regeneration. The page still rendered, but the console threw on every load. ESLint `rules-of-hooks` was clean — it was a hydration mismatch, not a static hook violation.

**How to apply:** The flash is prevented because an inline boot script in `RootShell` (`__root.tsx`) sets the correct `.dark` class on `<html>` before React hydrates. React state just needs to catch up after mount, never lead.

# Preview host config
`vite.config.ts` uses the `@lovable.dev/vite-tanstack-config` wrapper. Pass extra Vite config via the `vite: {...}` key (deep-merged after the wrapper's own config, React dedupe preserved). `server.allowedHosts: true` is required so the proxied `*.replit.dev` preview host isn't blocked.

# Distinguishing a REAL hydration bug from a dev-preview HMR artifact
Not every "Invalid hook call" + "Hydration failed" in the console is an app bug. There are TWO distinct sources here; diagnose before touching code:

1. **Genuine app mismatch** (the theme-init bug above) — reproduces on EVERY fresh load, in any browser, and the error stack contains APP component frames. Fixable in code.
2. **Dev-preview HMR artifact** — reproduces ONLY in the long-lived canvas preview iframe after it has been WebSocket-reconnected / hot-updated many times (agent restarts, edits, or `node_modules/.vite` cache clears). The error stack is ENTIRELY inside `/node_modules/.vite/deps/react-dom_client.js?v=<hash>` with NO app frames, and the message is "more than one copy of React" (version-skewed React across old vs new `?v=` optimized-dep bundles in one stale tab). It is NOT an app bug and has NO code fix.

**Why:** `<html>` already has `suppressHydrationWarning` and the theme boot script is tolerated, so the theme path is not a live mismatch. The decisive test: a brand-new/fresh load (screenshot tool's headless browser, `curl`, production build) is CLEAN at the SAME moment the stale canvas tab errors. The `?v=` hash only drifts because of manual `.vite` cache clearing — do NOT clear it; that self-induces the skew.

**How to apply:** If fresh loads are clean but the canvas tab errors, it's the artifact #2 — leave code at baseline; a hard refresh of the preview clears it. Don't chase head/body inline `<script>` placement (red herring) and don't empty `head().scripts` SEO JSON-LD trying to "fix" it. `__root.tsx` exports a `Route` alongside the component, so Vite can't Fast-Refresh it ("Route export incompatible") and full-reloads on `__root` edits — that reload is when the skew surfaces during agent churn, not during normal user browsing.
