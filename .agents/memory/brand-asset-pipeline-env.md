---
name: Brand asset generation env quirks
description: Two environment gotchas when generating raster brand assets with ImageMagick and serving new public/ files in the TanStack Start dev server.
---

# Brand asset generation — environment quirks

Two non-obvious, env-specific traps when building the brand asset pipeline
(`scripts/brand/gen-interlock.mjs` → SVG + `magick` rasterize → `public/`).

## 1. `magick` hangs unless fontconfig is pinned

**Symptom:** any `magick` invocation that touches text hangs/stalls for a very
long time (effectively a timeout).

**Cause:** `installSystemDependencies(["raleway","montserrat"])` (Nix font pkgs)
made fontconfig scan many font dirs on every run.

**Fix:** prefix EVERY `magick` call with
`FONTCONFIG_FILE=/tmp/fc/fonts.conf` — a minimal fontconfig that points only at
`/usr/share/fonts`. Only DejaVu fonts exist as real files here; **DejaVu Sans
Bold** renders clean tracked caps and is the working choice for real vector
wordmark text. Under memory pressure also add `-limit memory 512MiB -limit map
512MiB` or the montage step gets OOM-killed (exit -1, no output). `magick
montage` needs `-font <path>` whenever `-label` is used (else it hard-fails
`unable to read font`), and montage of large images still OOMs/times out here —
for QA, prefer reading the output PNGs directly over building a montage.

## 2. New top-level `public/` folders 404 until the dev workflow restarts

**Symptom:** assets under a folder created AFTER the dev server booted (e.g.
`public/brand-v2-syndicate-interlock/*`) return 404 in the browser, while a
sibling folder that existed at boot (`public/brand-v1-node/*`) serves fine.

**Cause:** the TanStack Start (`bun run dev`) server snapshots the `public/`
directory at startup; brand-new top-level dirs are not picked up live.

**Fix:** `restart_workflow("Start application")` after adding a new `public/`
subfolder, then the static files serve. Not a code bug — don't "fix" routing.
Adding new FILES to an already-served folder does NOT need a restart.

## 3. Incremental asset adds + tsc OOM under pressure

The full `gen-interlock.mjs` rasterize loop re-renders ~25 assets (plus the
large splash/press PNGs) and now exceeds a ~110s shell timeout. When ADDING
assets, let the script write all SVGs (fast — it logs "SVGs written" before the
raster step), then rasterize ONLY the new SVGs with individual
`magick … -resize WxH` calls (cap with `-limit memory/map 512MiB`). Separately,
`tsc --noEmit` can itself be cgroup-OOM-killed (exit -1, no output) under
container memory pressure — fall back to the 3 wording guards + a dev-server
render (a TSX error breaks the whole component, so a clean board render proves
the edit compiled) as the validation signal.
