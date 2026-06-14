---
name: Share-card PNG export pattern
description: How to build a share/identity card that exports reliably to PNG via html-to-image, including the off-screen capture variant.
---

# Share-card PNG export (html-to-image)

The canonical share artifact is `MemberShareCard` + `MemberShareBlock`, exported
to PNG through the shared `ShareActions` bar (`downloadNodeAsPng` → `toPng`).

## The reliable capture pattern
- The **capture target** (the node `nodeRef` points at) must be:
  - `position: relative` (never `position: fixed`),
  - fully opaque (no `opacity: 0` on the captured node — that bakes transparency
    into the PNG),
  - given explicit pixel dimensions (e.g. 640×360),
  - styled with **inline styles** (most reliable for html-to-image),
  - free of external `<img>`/web-font dependencies — use CSS gradients, system
    font stacks (`ui-sans-serif`, `ui-monospace`), so nothing has to async-load.
- For an **off-screen** variant (so the live surface stays the control surface),
  wrap the card in a separate `position: fixed; left: -100000; top: 0;
  pointer-events: none; aria-hidden` element. html-to-image clones the node by
  its own offset dimensions, so being off the visible viewport does NOT break the
  capture — and the fixed wrapper is the *parent*, not the capture target.
- `toPng` is called with `{ pixelRatio: 2, cacheBust: true }`.

**Why:** an architect review flagged off-screen capture as "needs a smoke test."
Reasoning through html-to-image's clone-by-dimensions behaviour confirmed the
pattern is correct, not fragile — the doubt was generic, not a real bug.

## How to apply
- New shareable cards should reuse `ShareActions` (one consistent action bar) and
  follow the inline-style + explicit-dimension rules above.
- `oklch()` colors render fine (the browser's own engine renders the SVG
  foreignObject), matching on-screen appearance.

## The one thing you cannot automate
A true "click Download PNG" smoke test needs either a real member address (for
the visible `/wallet/$address` card) or a **connected member wallet** (for the
cockpit's off-screen variant). The wagmi/injected-wallet connect flow isn't
reachable from the Playwright harness, and DEV fixtures are off in all builds, so
this export remains a **manual** human-verification step — surface it honestly in
reports rather than claiming it's verified.
