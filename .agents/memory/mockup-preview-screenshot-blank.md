---
name: Mockup preview screenshots false-blank
description: external_url screenshots of mockup-sandbox SPA previews can capture pure-white before hydration; not a component bug
---

A pure-WHITE `external_url` screenshot of a mockup-sandbox preview URL
(`/__mockup/preview/<folder>/<Component>`) is usually NOT a render bug — it is a
capture-timing/cache artifact. The sandbox App's PreviewRenderer returns `null`
while the dynamic `import()` is in flight, so an early capture paints a white body.
The Firecrawl-backed screenshot also appears to key by exact URL, so a URL that was
captured white once keeps returning white on retry.

**Why:** Burned several attempts (added an error boundary, transform-checked,
re-screenshotted) chasing a phantom runtime error that did not exist.

**How to apply / fast triage before assuming a code bug:**
- Verify the server side is fine: `curl -s -o /dev/null -w "%{http_code}"` the preview URL (expect 200); curl `/__mockup/src/.../<Component>.tsx` and `_group.css` (Vite returns 200 + valid JS/CSS; transform errors show inline).
- `esbuild.transformSync(..., {loader:'tsx', jsx:'automatic'})` to rule out syntax errors.
- To get a real capture, bust the cache with a query param, e.g. `?cb=<unique>`; a fresh URL captures live. Even then it can still race white — re-try with a new param.
- The on-canvas iframe renders in a real browser with full load time, so it is unaffected by this race — trust the live iframe over the screenshot tool for mockup previews.
- A genuine render throw in the sandbox shows the App's RED `<pre>` ("Failed to load preview" / "No exported component"), NOT a blank white page.
