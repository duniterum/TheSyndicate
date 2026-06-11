---
name: Metric display forms + workbench
description: Where to find/reuse registry-driven metric display blocks, and the non-obvious wiring gotchas of the /labs/protocol-intelligence workbench.
---

# Metric display forms + workbench

**Rule:** Before building ANY new data/metric surface (reports, Chronicle,
investor view, protocol-intelligence, etc.), reuse the registry-driven blocks in
`src/components/metrics/MetricDisplays.tsx` instead of hand-rolling a label,
badge, formula, or verify link. The internal catalog of every form for every
metric is the route `/labs/protocol-intelligence` (the permanent metric
workbench) — inspect it to pick a block, don't rescan the codebase.

**Why:** The project's whole doctrine is "one canonical definition → many
surfaces" (the Protocol Metrics Registry). Re-deriving labels/badges inline is
exactly the drift that registry consolidation closed; the display layer must stay
single-sourced too.

**How to apply:**
- Each block takes `{ metric, value?, status? }`. The **caller owns formatting**
  (use the exported `formatMetricValue(value, unit)`) and the **live status**.
  Blocks default `status` to `metric.status` and render `"—"` for missing values.
- Exports: `MetricTypeBadge`, `MetricStatusBadge` (wraps canonical `StatusPill`),
  `MetricLegalNote`, `MetricSurfaceList`, `MetricSourceFormula`,
  `MetricVerifyAffordance`, `MetricCompactBlock`, `MetricTickerItem`,
  `MetricFullBlock`, `MetricTableHeader`/`MetricTableRow`, `formatMetricValue`.

**Gotchas (non-obvious):**
- Live values are joined by `fact.metricId` (set in `protocol-truth.ts` `bind()`).
  Only ~half the 30 registry metrics have a Truth fact; the rest legitimately
  render `"—"` with their *documented* status. So a **LIVE pill can sit next to
  "—"** — the pill reflects the registry's documented ceiling, NOT the rendered
  value. This is intentional for an internal QA surface.
- `formatMetricValue` must survive **object** fact values (e.g. `chapterProgress`
  is a `ChapterProgress` object) — it renders `.label` for objects, else `"—"`.
  Don't assume fact values are scalars.
- `src/components/metrics/` is OUTSIDE the `check-preview-labels` guard roots
  (`src/lib/preview`, `src/components/preview`), so using `StatusPill status="LIVE"`
  there is fine. If you ever put a *preview* metric surface under those roots, the
  LIVE pill / explorer links / "verified" will trip the guard.
- The workbench is a `/labs` child → inherits noindex; `/labs` is robots-blocked
  and excluded from the explicit sitemap allowlist (sitemap is an allowlist, not a
  route scan), so new `/labs/*` routes are never auto-indexed.
