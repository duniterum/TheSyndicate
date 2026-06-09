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
