---
name: Deploying this app on Replit (Node-server target)
description: How to make the @lovable.dev TanStack Start SSR app build a runnable Node server for Replit Deployments instead of its default Cloudflare worker
---

This project's native publish path is **Lovable → thesyndicate.money**; its
`vite.config.ts` uses `@lovable.dev/vite-tanstack-config`, whose nitro defaults
to a **Cloudflare** target (a worker, not runnable with `node`). To publish on
Replit you need a Node server.

**The rule:** pass `nitro: { preset: "node-server" }` to the preset's
`defineConfig(...)`. That produces `.output/server/index.mjs`, run with
`node .output/server/index.mjs` (nitro reads `PORT`). nitro traces runtime deps
into `.output/server/node_modules`, so the server output is self-contained.

Replit deploy config (autoscale): build `npm run build`, run
`node .output/server/index.mjs`.

**Why this is safe for BOTH pipelines:** the preset only force-overrides the
target to `cloudflare-module` when `isSandboxEnvironment()` is true, i.e. when
`LOVABLE_SANDBOX=1` or `DEV_SERVER__PROJECT_PATH` is set. Inside Lovable's build
those are set, so the override is ignored and it still ships Cloudflare. On
Replit neither is set, so the `node-server` preset wins. nitro only runs at
`command === "build"`, so the dev server (`vite dev`) is unaffected.

**How to apply:** if a Replit deploy build ever reverts to Cloudflare output (no
`.output/server/index.mjs`), check whether a Lovable sandbox env var leaked into
the build env — that's the only thing that re-forces the Cloudflare path.

**Build stamp caveat:** `src/lib/build-stamp.ts` `envLabel()` only recognizes
`lovable.app` / `thesyndicate.money` as preview/production; on a `*.replit.app`
domain it falls through to `"local"`. The ISO date still confirms build
freshness, but the env label / short tag are cosmetic and Lovable-domain-bound.
