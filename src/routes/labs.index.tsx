// src/routes/labs.index.tsx — hidden quarantine index (content for exactly /labs).
// Rendered inside the /labs layout (labs.tsx → <Outlet/>). noindex; never linked
// from production navigation; excluded from sitemap; disallowed in robots.txt.
//
// Purpose (per docs/P6_IMPLEMENTATION_AND_ARCHIVE_REPORT.md):
//   Preserve institutional memory for components that were demoted from the
//   homepage so we never re-spend on ideas we already built. The Archive
//   Safety Net rule states: demote first, archive second, delete last.

import { createFileRoute, Link } from "@tanstack/react-router";
import { LABS_REGISTRY, entriesByClass, type LabsClass } from "@/labs/registry";

export const Route = createFileRoute("/labs/")({
  head: () => ({
    meta: [
      { title: "Labs · Component Quarantine — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Internal quarantine of demoted components. Not for public use." },
    ],
  }),
  component: LabsIndex,
});

const CLASS_TONE: Record<LabsClass, string> = {
  LABS:       "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  ARCHIVE:    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  DEPRECATED: "border-destructive/40 bg-destructive/10 text-destructive",
};

function Group({ heading, blurb, cls }: { heading: string; blurb: string; cls: LabsClass }) {
  const items = entriesByClass(cls);
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight">{heading} <span className="text-muted-foreground">· {items.length}</span></h2>
      <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-card">
        {items.map((e) => (
          <li key={e.name} className="flex flex-col gap-1 p-4 md:flex-row md:items-start md:gap-4">
            <div className="flex shrink-0 items-center gap-2">
              <span className={`mono inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${CLASS_TONE[cls]}`}>{cls}</span>
              <code className="text-sm font-medium">{e.name}</code>
            </div>
            <div className="text-sm text-foreground/80">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{e.origin}</div>
              <div className="mt-0.5">{e.reason}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Source: <code>src/labs/components/{e.name}.tsx</code>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LabsIndex() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Internal · noindex</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Labs · Component Quarantine</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Components demoted from the homepage and other production surfaces. Preserved per the Archive Safety
          Net rule (demote → archive → delete). Not linked publicly, blocked in robots.txt, excluded from the
          sitemap, and excluded from Return-Loop calculations.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Total quarantined: <b>{LABS_REGISTRY.length}</b>. See <code>docs/P6_IMPLEMENTATION_AND_ARCHIVE_REPORT.md</code>.
        </p>
        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs/protocol-intelligence" className="underline hover:no-underline">→ Protocol intelligence (metric workbench)</Link>
          <Link to="/labs/protocol-events" className="underline hover:no-underline">→ Protocol event pipeline (event workbench)</Link>
          <Link to="/labs/protocol-memory" className="underline hover:no-underline">→ Protocol memory &amp; recognition (foundation workbench)</Link>
          <Link to="/labs/signals" className="underline hover:no-underline">→ Signals engine (event → signal workbench)</Link>
          <Link to="/labs/memory-candidates" className="underline hover:no-underline">→ Memory candidates (signal → memory workbench)</Link>
          <Link to="/labs/design-museum" className="underline hover:no-underline">→ Visual design museum</Link>
          <Link to="/labs/component-index" className="underline hover:no-underline">→ Technical component index</Link>
          <Link to="/labs/design-archive" className="underline hover:no-underline">→ Design archive (docs)</Link>
          <Link to="/labs/invariants" className="underline hover:no-underline">→ Sale-flow invariants</Link>
        </nav>
      </header>

      <Group
        heading="Labs"
        cls="LABS"
        blurb="Removed from public surfaces but potentially useful later. Eligible for promotion back to production."
      />
      <Group
        heading="Archive"
        cls="ARCHIVE"
        blurb="Historical reference. Earlier iterations superseded by current production components. Kept for institutional memory."
      />
      <Group
        heading="Deprecated"
        cls="DEPRECATED"
        blurb="Violates VISION guardrails (wealth ranking, speculative projection, empty gamification). Will not be re-promoted; preserved only to make the decision auditable."
      />
    </div>
  );
}
