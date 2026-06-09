// src/routes/labs.design-archive.tsx
// INTERNAL design archive — a categorized museum of demoted / experimental
// components, doctrine docs, and reusable design patterns. Hidden from
// navigation, noindex+nofollow, blocked in robots.txt (/labs/*), excluded
// from the sitemap.
//
// Purpose: never lose institutional knowledge before a deletion.
// Per the Archive Safety Net rule: demote → archive → delete.
//
// This route does NOT mount any of the archived components — it documents
// them so we can find, reason about, and potentially re-promote them.

import { createFileRoute } from "@tanstack/react-router";
import { LABS_REGISTRY, type LabsEntry } from "@/labs/registry";

export const Route = createFileRoute("/labs/design-archive")({
  head: () => ({
    meta: [
      { title: "Design Archive · Internal — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal categorized archive of experimental components, doctrines, and reusable design patterns. Not for public use.",
      },
    ],
  }),
  component: DesignArchive,
});

// ── Category model ──────────────────────────────────────────────────────
type Category =
  | "Dashboard Experiments"
  | "Referral Experiments"
  | "Treasury Experiments"
  | "Reputation Experiments"
  | "Artifact Experiments"
  | "Story / Chronicle Experiments"
  | "Metrics & Market Widgets"
  | "Deprecated Copy"
  | "Reusable Components"
  | "Uncategorized";

type ArchiveItem = {
  name: string;
  category: Category;
  status: "LABS" | "ARCHIVE" | "DEPRECATED" | "DOCTRINE" | "PREVIEW";
  whyRetired: string;
  whereUsed: string;
  reusable: "yes" | "partial" | "no";
  source: string;
  notes?: string;
};

// Manual classification of labs entries into design-archive categories.
// (LABS_REGISTRY is the source of truth for component status; this maps it
//  into the museum's category structure.)
const LABS_CATEGORY: Record<string, Category> = {
  HomeMetricsStrip: "Metrics & Market Widgets",
  HomeRankLadder: "Reputation Experiments",
  MarketDashboard: "Metrics & Market Widgets",
  MilestoneTracker: "Story / Chronicle Experiments",
  LiveRecencyStrip: "Metrics & Market Widgets",
  RankIntelligence: "Reputation Experiments",
  RankSimulator: "Reputation Experiments",
  ShareableCards: "Reusable Components",
  HomeShareCTA: "Reusable Components",
  ProtocolFlywheel: "Story / Chronicle Experiments",
  ProtocolRevenueEngine: "Treasury Experiments",
  SmartContractFlow: "Reusable Components",
  HomeJourney: "Story / Chronicle Experiments",
  HomeJoinPreview: "Dashboard Experiments",
  HomeAllocationPreview: "Treasury Experiments",
  HowItWorks30s: "Story / Chronicle Experiments",
  MemberJourney: "Dashboard Experiments",
  OpportunitySection: "Deprecated Copy",
  ProtocolOverview: "Deprecated Copy",
  ProtocolStatusGrid: "Metrics & Market Widgets",
  StartHereCard: "Deprecated Copy",
  WhatSynDoes: "Deprecated Copy",
  WhyBecomeMember: "Deprecated Copy",
  WhyDifferent: "Deprecated Copy",
  WhyEarlyMatters: "Deprecated Copy",
  WhyJoinNow: "Deprecated Copy",
  WhyTheSyndicateExists: "Deprecated Copy",
  ArtifactUniverseBoard: "Artifact Experiments",
  CapitalAllocation: "Treasury Experiments",
  FutureCollectorView: "Artifact Experiments",
  QuestProgress: "Reputation Experiments",
  MembersLeaderboard: "Reputation Experiments",
};

const labsItems: ArchiveItem[] = LABS_REGISTRY.map((e) => ({
  name: e.name,
  category: LABS_CATEGORY[e.name] ?? "Uncategorized",
  status: e.classification,
  whyRetired: e.reason,
  whereUsed: e.origin,
  reusable: e.classification === "DEPRECATED" ? "no" : "yes",
  source: `src/labs/components/${e.name}.tsx`,
}));

// Active preview surfaces — currently mounted as SIMULATED previews. They
// are not archived (still in production), but documented here for memory.
const previewItems: ArchiveItem[] = [
  {
    name: "ReferralPreview",
    category: "Referral Experiments",
    status: "PREVIEW",
    whyRetired:
      "Simulated referral funnel — kept as a visual prototype until the CommissionRouter contract is designed.",
    whereUsed: "Public explainer on /referral and inside MyReferralCard.",
    reusable: "yes",
    source: "src/components/preview/ReferralPreview.tsx",
  },
  {
    name: "ReputationLeaderboardPreview",
    category: "Reputation Experiments",
    status: "PREVIEW",
    whyRetired:
      "Simulated reputation leaderboard — non-wealth ranking concept; awaiting Builder Record system.",
    whereUsed: "Embedded under preview surfaces.",
    reusable: "yes",
    source: "src/components/preview/ReputationLeaderboardPreview.tsx",
  },
  {
    name: "TreasuryLedgerPreview",
    category: "Treasury Experiments",
    status: "PREVIEW",
    whyRetired:
      "Simulated treasury ledger view — anchors future protocol-movement transparency UI.",
    whereUsed: "Transparency / preview surfaces.",
    reusable: "yes",
    source: "src/components/preview/TreasuryLedgerPreview.tsx",
  },
  {
    name: "SplitVisualizer",
    category: "Treasury Experiments",
    status: "PREVIEW",
    whyRetired: "70/20/10 split visual — reusable inside member receipts.",
    whereUsed: "Preview surfaces.",
    reusable: "yes",
    source: "src/components/preview/SplitVisualizer.tsx",
  },
  {
    name: "PreviewPrimitives",
    category: "Reusable Components",
    status: "PREVIEW",
    whyRetired:
      "Shared primitives for any SIMULATED surface — pills, frames, watermarks.",
    whereUsed: "All preview/* components.",
    reusable: "yes",
    source: "src/components/preview/PreviewPrimitives.tsx",
  },
];

// Doctrine references — written knowledge we must not lose.
const doctrineItems: ArchiveItem[] = [
  {
    name: "PROTOCOL_IN_PUBLIC_DOCTRINE.md",
    category: "Story / Chronicle Experiments",
    status: "DOCTRINE",
    whyRetired: "Canonical mental model — Watch a protocol operate in public.",
    whereUsed: "Guides every cockpit + transparency decision.",
    reusable: "yes",
    source: "docs/PROTOCOL_IN_PUBLIC_DOCTRINE.md",
  },
  {
    name: "TREASURY_LEDGER_DOCTRINE.md",
    category: "Treasury Experiments",
    status: "DOCTRINE",
    whyRetired: "Treasury = protocol movements, not ownership.",
    whereUsed: "Vault + transparency framing.",
    reusable: "yes",
    source: "docs/TREASURY_LEDGER_DOCTRINE.md",
  },
  {
    name: "REPUTATION_FORMULA_DOCTRINE.md",
    category: "Reputation Experiments",
    status: "DOCTRINE",
    whyRetired: "Rank by durability, retention, participation — never wealth.",
    whereUsed: "Future Builder Records system.",
    reusable: "yes",
    source: "docs/REPUTATION_FORMULA_DOCTRINE.md",
  },
  {
    name: "BUILDER_RECORD_DOCTRINE.md",
    category: "Reputation Experiments",
    status: "DOCTRINE",
    whyRetired: "Builder Records concept.",
    whereUsed: "Pending implementation.",
    reusable: "yes",
    source: "docs/BUILDER_RECORD_DOCTRINE.md",
  },
  {
    name: "LEGAL_DISCLOSURE_REFERRAL.md",
    category: "Referral Experiments",
    status: "DOCTRINE",
    whyRetired: "Safe framing for referral commissions.",
    whereUsed: "All referral surfaces.",
    reusable: "yes",
    source: "docs/LEGAL_DISCLOSURE_REFERRAL.md",
  },
  {
    name: "REVENUE_ATTRIBUTION_LAYER.md",
    category: "Treasury Experiments",
    status: "DOCTRINE",
    whyRetired: "Revenue attribution model.",
    whereUsed: "Future routing implementation.",
    reusable: "yes",
    source: "docs/REVENUE_ATTRIBUTION_LAYER.md",
  },
];

const ALL_ITEMS: ArchiveItem[] = [...labsItems, ...previewItems, ...doctrineItems];

const CATEGORY_ORDER: Category[] = [
  "Dashboard Experiments",
  "Referral Experiments",
  "Treasury Experiments",
  "Reputation Experiments",
  "Artifact Experiments",
  "Story / Chronicle Experiments",
  "Metrics & Market Widgets",
  "Reusable Components",
  "Deprecated Copy",
  "Uncategorized",
];

const STATUS_TONE: Record<ArchiveItem["status"], string> = {
  LABS: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  ARCHIVE: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  DEPRECATED: "border-destructive/40 bg-destructive/10 text-destructive",
  DOCTRINE: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)]",
  PREVIEW: "border-[var(--verify)]/40 bg-[var(--verify)]/10 text-[var(--verify)]",
};

function CategorySection({ category, items }: { category: Category; items: ArchiveItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight">
        {category}{" "}
        <span className="text-muted-foreground">· {items.length}</span>
      </h2>
      <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
        {items.map((e) => (
          <li
            key={`${category}-${e.name}`}
            className="flex flex-col gap-2 p-4 md:flex-row md:items-start md:gap-4"
          >
            <div className="flex shrink-0 items-center gap-2 md:w-48">
              <span
                className={`mono inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${STATUS_TONE[e.status]}`}
              >
                {e.status}
              </span>
              <code className="text-sm font-medium truncate">{e.name}</code>
            </div>
            <div className="text-sm text-foreground/80 min-w-0 flex-1">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {e.whereUsed}
              </div>
              <div className="mt-0.5">{e.whyRetired}</div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Source: <code>{e.source}</code>
                </span>
                <span>
                  Reusable:{" "}
                  <b
                    className={
                      e.reusable === "yes"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : e.reusable === "partial"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-destructive"
                    }
                  >
                    {e.reusable}
                  </b>
                </span>
              </div>
              {e.notes && <p className="mt-1 text-xs text-muted-foreground">{e.notes}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DesignArchive() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · not production UX
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Design Archive · Categorized Museum
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          A categorized record of every experimental component, preview surface,
          and doctrine document we have invested in. Preserved so we never
          re-spend on ideas we already built. Demote → archive → delete.
        </p>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Sources of truth: <code>src/labs/registry.ts</code>,{" "}
          <code>src/components/preview/*</code>, <code>docs/*</code>. Status
          legend: <b>LABS</b> may revisit · <b>ARCHIVE</b> historical reference ·{" "}
          <b>DEPRECATED</b> safe to remove · <b>PREVIEW</b> currently mounted
          simulated surface · <b>DOCTRINE</b> written knowledge.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Total items: <b>{ALL_ITEMS.length}</b>. Excluded from sitemap and
          blocked by <code>/labs</code> in <code>robots.txt</code>.
        </p>
      </header>

      {CATEGORY_ORDER.map((c) => (
        <CategorySection
          key={c}
          category={c}
          items={ALL_ITEMS.filter((i) => i.category === c)}
        />
      ))}
    </div>
  );
}

// Re-export to satisfy unused-import linters in some builds.
export type { LabsEntry };
