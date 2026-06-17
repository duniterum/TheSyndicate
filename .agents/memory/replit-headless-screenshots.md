---
name: Replit headless screenshots (below-fold + mobile)
description: How to capture scrolled/section/mobile screenshots on Replit when the screenshot tool and testing subagent fall short.
---

# Capturing below-fold & mobile screenshots on Replit

The built-in `screenshot` tool only captures the **top of the viewport** for an app preview — no scrolling, no custom viewport/mobile. The `runTest` (testing subagent) *verifies* sections fine but returns an **empty `screenshotPaths`** and persists nothing to disk, so you cannot retrieve its images. `external_url`/Firecrawl captures only the **above-the-fold viewport** too (not full-page, no scroll).

**Working recipe (for arbitrary viewport + scroll + element shots):**
1. `installSystemDependencies(["chromium"])` — nixpkgs chromium is self-contained (brings all libs). Playwright's own downloaded chromium fails on Nix (missing `libglib`/`libgobject` etc.); don't chase individual libs.
2. Install Playwright in a throwaway dir (e.g. `/tmp/pwshot` via `npm`), write the capture script there so `playwright` resolves; write output PNGs to an absolute workspace path.
3. Launch via `chromium.launch({ executablePath: <nix chromium bin>, headless: false, args: ['--headless=new','--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--hide-scrollbars'] })`.
   - **Critical:** chrome 138 **removed old headless**. Playwright (1.48) passes `--headless=old` when `headless:true` → "Old Headless mode has been removed" crash. Cure: `headless:false` + explicit `--headless=new` arg.
4. Target the local dev server (`http://localhost:5000/`) or the public `*.replit.dev` domain. Public domain + a longer wait (~14s) gives on-chain/data reads a better chance to populate (cold contexts often show empty/PENDING because dev RPC is rate-limited/CORS-flaky — that's expected, not a bug).
5. **Clean section panels:** find the section by its eyebrow text and screenshot the enclosing element — `page.getByText(eyebrow).first().locator('xpath=ancestor::section[1]').screenshot()` — instead of a header-centered viewport shot (which clips the grid at the frame edge).
6. **Cleanup after:** `uninstallSystemDependencies(["chromium"])` and `rm -rf /tmp/pwshot` so `replit.nix` nets back to clean (install+uninstall in the same session leaves no diff).

**Why:** repeated dead-ends — screenshot tool is top-only, runTest gives no files, and the nix chromium + new-headless flag is the non-obvious unlock. Saves re-deriving the headless-mode quirk and the testing-subagent limitation next time.
