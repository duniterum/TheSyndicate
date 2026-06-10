// src/routes/labs.design-museum.tsx
// INTERNAL · Visual design museum. A categorized, *rendered* archive of
// unused / hidden / lab / dead / deprecated UI widgets so we can SEE prior
// work before deciding to reuse, rewrite, archive, or ignore it.
//
// Preservation + selection tool — NOT a production feature.
//   • Never deletes anything. Never linked from production navigation.
//   • noindex + nofollow; /labs/* is blocked in robots.txt + excluded from sitemap.
//   • Safe presentational widgets render LIVE inside a labelled frame
//     (mounted-gate + error boundary, so a throw degrades gracefully).
//   • Wallet / query / context-bound widgets are shown as metadata cards with a
//     placeholder — never faked as live.
//
// Data source: src/labs/museum-inventory.ts

import { createFileRoute, Link } from "@tanstack/react-router";
import React, { Component, Suspense, lazy, useEffect, useState } from "react";
import {
  MUSEUM_CATEGORIES,
  MUSEUM_STATS,
  widgetsByCategory,
  type MuseumWidget,
  type PreviewLabel,
} from "@/labs/museum-inventory";

export const Route = createFileRoute("/labs/design-museum")({
  head: () => ({
    meta: [
      { title: "Design Museum · Internal — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal visual archive of unused / hidden / lab / deprecated UI widgets. Not for public use.",
      },
    ],
  }),
  component: DesignMuseum,
});

// ── Live-preview loaders (literal paths so the bundler can split them) ───────
// Only widgets that render WITHOUT required wallet/query/context are wired here.
type Loader = () => Promise<{ default: React.ComponentType<any> }>;

const PREVIEW_LOADERS: Record<string, Loader> = {
  MythologyWall: () =>
    import("@/components/syndicate/MythologyWall").then((m) => ({ default: m.MythologyWall })),
  ArchiveMuseumHero: () =>
    import("@/components/syndicate/ArchiveMuseumHero").then((m) => ({ default: m.ArchiveMuseumHero })),
  ActivityMilestones: () =>
    import("@/components/syndicate/ActivityMilestones").then((m) => ({ default: m.ActivityMilestones })),
  GenesisNFTProgress: () =>
    import("@/components/syndicate/Sections").then((m) => ({ default: m.GenesisNFTProgress })),
  DayOneArchive: () =>
    import("@/components/syndicate/Sections").then((m) => ({ default: m.DayOneArchive })),
  WhyComeBackTomorrow: () =>
    import("@/components/syndicate/Sections").then((m) => ({ default: m.WhyComeBackTomorrow })),
  HowItWorks30s: () =>
    import("@/labs/components/HowItWorks30s").then((m) => ({ default: m.HowItWorks30s })),
  WhatSynDoes: () =>
    import("@/labs/components/WhatSynDoes").then((m) => ({ default: m.WhatSynDoes })),
  WhyTheSyndicateExists: () =>
    import("@/labs/components/WhyTheSyndicateExists").then((m) => ({ default: m.WhyTheSyndicateExists })),
  StartHereCard: () =>
    import("@/labs/components/StartHereCard").then((m) => ({ default: m.StartHereCard })),
  OpportunitySection: () =>
    import("@/labs/components/OpportunitySection").then((m) => ({ default: m.OpportunitySection })),
  HomeJourney: () =>
    import("@/labs/components/HomeJourney").then((m) => ({ default: m.HomeJourney })),
  HomeRankLadder: () =>
    import("@/labs/components/HomeRankLadder").then((m) => ({ default: m.HomeRankLadder })),
  RankSimulator: () =>
    import("@/labs/components/RankSimulator").then((m) => ({ default: m.RankSimulator })),
  SmartContractFlow: () =>
    import("@/labs/components/SmartContractFlow").then((m) => ({ default: m.SmartContractFlow })),
  FutureCollectorView: () =>
    import("@/labs/components/FutureCollectorView").then((m) => ({ default: m.FutureCollectorView })),
  HomeShareCTA: () =>
    import("@/labs/components/HomeShareCTA").then((m) => ({ default: m.HomeShareCTA })),
};

const PREVIEWS: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> =
  Object.fromEntries(Object.entries(PREVIEW_LOADERS).map(([k, loader]) => [k, lazy(loader)]));

// ── Tone maps ───────────────────────────────────────────────────────────────
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

const LABEL_TONE: Record<PreviewLabel, string> = {
  LAB: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  ARCHIVE: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  DEPRECATED: "border-destructive/40 bg-destructive/10 text-destructive",
  FIXTURE: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-400",
};

// ── Preview frame: mounted-gate + suspense + error boundary ─────────────────
class PreviewBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    /* swallowed on purpose — museum frame degrades to the metadata placeholder */
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function PreviewSkeleton() {
  return (
    <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
      Loading preview…
    </div>
  );
}

function PreviewUnavailable({ reason }: { reason: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-1 px-4 text-center">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Preview unavailable
      </div>
      <p className="max-w-sm text-xs text-muted-foreground">{reason}</p>
    </div>
  );
}

function LivePreview({ name, label }: { name: string; label: PreviewLabel }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Comp = PREVIEWS[name];
  if (!Comp) {
    return <PreviewUnavailable reason="No standalone preview is wired for this widget." />;
  }

  return (
    <div className="relative">
      <span
        className={`mono absolute right-2 top-2 z-10 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${LABEL_TONE[label]}`}
      >
        {label} · preview
      </span>
      {/* transform creates a containing block so any position:fixed children in a
          preview stay inside the frame instead of leaking onto the museum page */}
      <div
        className="max-h-[560px] overflow-auto rounded-md border border-border bg-background"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        {!mounted ? (
          <PreviewSkeleton />
        ) : (
          <PreviewBoundary
            fallback={
              <PreviewUnavailable reason="This widget threw while rendering outside its normal page context (likely needs wallet / on-chain / page context)." />
            }
          >
            <Suspense fallback={<PreviewSkeleton />}>
              <Comp />
            </Suspense>
          </PreviewBoundary>
        )}
      </div>
    </div>
  );
}

function MetadataPlaceholder({ needs }: { needs?: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/30 px-4 text-center">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        No live preview
      </div>
      <p className="max-w-sm text-xs text-muted-foreground">
        Needs {needs ?? "runtime data"} — shown as a record only, never faked as live.
      </p>
    </div>
  );
}

// ── Widget card ─────────────────────────────────────────────────────────────
function WidgetCard({ w }: { w: MuseumWidget }) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <header className="flex flex-wrap items-center gap-2">
        <span
          className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${STATUS_TONE[w.status]}`}
        >
          {w.status}
        </span>
        {w.labClass && (
          <span className="mono rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {w.labClass}
          </span>
        )}
        <code className="text-sm font-semibold">{w.name}</code>
      </header>

      {w.renderable && w.previewLabel ? (
        <LivePreview name={w.name} label={w.previewLabel} />
      ) : (
        <MetadataPlaceholder needs={w.needs} />
      )}

      <div className="space-y-1.5 text-sm">
        <p className="text-foreground/85">{w.why}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Reuse: <b className={REUSE_TONE[w.reuse]}>{w.reuse}</b>
          </span>
          {w.duplicateOf && (
            <span>
              Duplicate of: <code className="text-foreground/70">{w.duplicateOf}</code>
            </span>
          )}
          {w.fixture && (
            <span>
              Fixture: <code className="text-foreground/70">{w.fixture}</code>
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Source: <code>{w.source}</code>
          {w.exportName && (
            <>
              {" "}
              · export <code>{w.exportName}</code>
            </>
          )}
        </div>
        {w.risk && (
          <p className="rounded border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs text-destructive">
            ⚠ {w.risk}
          </p>
        )}
      </div>
    </article>
  );
}

function CategorySection({ category }: { category: (typeof MUSEUM_CATEGORIES)[number] }) {
  const items = widgetsByCategory(category);
  if (items.length === 0) return null;
  const live = items.filter((i) => i.renderable).length;
  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold tracking-tight">
        {category} <span className="text-muted-foreground">· {items.length}</span>
        {live > 0 && (
          <span className="mono ml-2 text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground">
            {live} live
          </span>
        )}
      </h2>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {items.map((w) => (
          <WidgetCard key={w.name} w={w} />
        ))}
      </div>
    </section>
  );
}

function DesignMuseum() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Loud internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Visual archive of demoted / hidden / dead / deprecated widgets. Not linked from
          public navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt.
          Live previews are rendered outside their normal page context and may look or behave
          differently than in product.
        </p>
      </div>

      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · preservation tool
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Design Museum · Visual Archive</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Every demoted, hidden, dead, and experimental UI widget — rendered where it is safe to
          do so, documented where it is not. Built so we can see and reason about prior work before
          deciding to reuse, rewrite, archive, or ignore it. Nothing here is deleted.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Widgets surfaced: <b>{MUSEUM_STATS.total}</b>
          </span>
          <span>
            Live previews: <b>{MUSEUM_STATS.renderable}</b>
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
          <Link to="/labs/component-index" className="underline hover:no-underline">
            → Technical component index
          </Link>
          <Link to="/labs/design-archive" className="underline hover:no-underline">
            → Design archive (docs)
          </Link>
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
        </nav>
      </header>

      {MUSEUM_CATEGORIES.map((c) => (
        <CategorySection key={c} category={c} />
      ))}

      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
        Preservation rule: demote → archive → delete. Nothing on this page is mounted in
        production. Source of truth: <code>src/labs/museum-inventory.ts</code>.
      </footer>
    </div>
  );
}
