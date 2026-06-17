// src/routes/labs.component-index.tsx
// INTERNAL · Technical component index. A status table of every catalogued
// widget grouped by lifecycle bucket so we can decide what to reuse, rewrite,
// consolidate, or keep archived. Documents only — renders no widgets.
//
// Preservation + selection tool — NOT a production feature.
//   • Never deletes anything. Never linked from production navigation.
//   • noindex + nofollow; /labs/* blocked in robots.txt + excluded from sitemap.
//
// Data source: src/labs/museum-inventory.ts (shared with /labs/design-museum).

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  INDEX_BUCKETS,
  MUSEUM_WIDGETS,
  MUSEUM_STATS,
  bucketMatch,
  type IndexBucket,
  type MuseumWidget,
} from "@/labs/museum-inventory";
import { BrandBoard } from "@/components/syndicate/BrandBoard";

export const Route = createFileRoute("/labs/component-index")({
  head: () => ({
    meta: [
      { title: "Component Index · Internal — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal technical index of UI components by lifecycle status (mounted / lab / dead / duplicate / reuse / rewrite / archive). Not for public use.",
      },
    ],
  }),
  component: ComponentIndex,
});

const STATUS_TONE: Record<MuseumWidget["status"], string> = {
  mounted: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  lab: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  dead: "border-zinc-500/40 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  deprecated: "border-destructive/40 bg-destructive/10 text-destructive",
};

const REUSE_TONE: Record<MuseumWidget["reuse"], string> = {
  use: "text-emerald-600 dark:text-emerald-400",
  rewrite: "text-amber-600 dark:text-amber-400",
  archive: "text-sky-600 dark:text-sky-400",
  ignore: "text-destructive",
};

const BUCKET_BLURB: Record<IndexBucket, string> = {
  "Mounted in product": "Live in a production route or component right now.",
  "Hidden / lab only": "Exists under src/labs/* but not mounted on any public surface.",
  "Dead / unmounted": "Exported in the codebase but imported nowhere — orphaned code.",
  "Duplicate concepts": "Overlaps a sibling concept; consolidation candidate.",
  "Candidates to reuse": "Worth promoting back as-is (or near as-is).",
  "Candidates to rewrite": "Good idea, stale execution — rebuild against current doctrine.",
  "Keep archived only": "Preserve for institutional memory; not for re-promotion.",
};

function StatusPill({ w }: { w: MuseumWidget }) {
  return (
    <span
      className={`mono inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${STATUS_TONE[w.status]}`}
    >
      {w.status}
      {w.labClass ? ` · ${w.labClass}` : ""}
    </span>
  );
}

function BucketSection({ bucket }: { bucket: IndexBucket }) {
  const items = MUSEUM_WIDGETS.filter((w) => bucketMatch(w, bucket));
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight">
        {bucket} <span className="text-muted-foreground">· {items.length}</span>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{BUCKET_BLURB[bucket]}</p>
      <div className="mt-3 overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-2 font-medium">Status</th>
              <th className="p-2 font-medium">Component</th>
              <th className="p-2 font-medium">Category</th>
              <th className="p-2 font-medium">Reuse</th>
              <th className="p-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => (
              <tr key={`${bucket}-${w.name}`} className="border-b border-border/60 align-top last:border-0">
                <td className="p-2 whitespace-nowrap">
                  <StatusPill w={w} />
                </td>
                <td className="p-2">
                  <code className="font-medium">{w.name}</code>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{w.source}</div>
                </td>
                <td className="p-2 text-xs text-muted-foreground">{w.category}</td>
                <td className="p-2 whitespace-nowrap">
                  <b className={REUSE_TONE[w.reuse]}>{w.reuse}</b>
                </td>
                <td className="p-2 text-xs text-foreground/80">
                  {w.duplicateOf && (
                    <div className="text-muted-foreground">
                      Duplicate of <code className="text-foreground/70">{w.duplicateOf}</code>
                    </div>
                  )}
                  {w.fixture && (
                    <div className="text-muted-foreground">
                      Fixture <code className="text-foreground/70">{w.fixture}</code>
                    </div>
                  )}
                  {w.risk && <div className="text-destructive">⚠ {w.risk}</div>}
                  {!w.duplicateOf && !w.fixture && !w.risk && <span className="text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ComponentIndex() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Technical lifecycle index of catalogued components, plus the Sprint 0B brand foundation
          preview. Not linked from public navigation, <code>noindex</code>, blocked by{" "}
          <code>/labs</code> in robots.txt.
        </p>
      </div>

      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · preservation tool
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Component Index · Technical Status</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Every catalogued widget grouped by lifecycle bucket. A component can appear in more than
          one bucket (e.g. mounted AND a duplicate concept). Status legend: <b>mounted</b> live in
          product · <b>lab</b> hidden under src/labs · <b>dead</b> exported but imported nowhere ·{" "}
          <b>deprecated</b> violates VISION, audit-only.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Total: <b>{MUSEUM_STATS.total}</b>
          </span>
          <span>
            Mounted: <b>{MUSEUM_STATS.mounted}</b>
          </span>
          <span>
            Lab: <b>{MUSEUM_STATS.lab}</b>
          </span>
          <span>
            Dead: <b>{MUSEUM_STATS.dead}</b>
          </span>
          <span>
            Deprecated: <b>{MUSEUM_STATS.deprecated}</b>
          </span>
        </div>
        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs/design-museum" className="underline hover:no-underline">
            → Visual design museum
          </Link>
          <Link to="/labs/design-archive" className="underline hover:no-underline">
            → Design archive (docs)
          </Link>
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <a href="#brand-foundation" className="underline hover:no-underline">
            → Brand foundation
          </a>
        </nav>
      </header>

      <BrandBoard />

      {INDEX_BUCKETS.map((b) => (
        <BucketSection key={b} bucket={b} />
      ))}

      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
        Source of truth: <code>src/labs/museum-inventory.ts</code>. Preservation rule: demote →
        archive → delete. Sprint follow-up (not started): route / site-map cleanup audit.
      </footer>
    </div>
  );
}
