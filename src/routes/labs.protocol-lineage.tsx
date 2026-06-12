// src/routes/labs.protocol-lineage.tsx
// INTERNAL · Protocol Lineage layer — the fact-journey inspection bench (Sprint 16).
//
// NOT marketing. An internal QA surface for the VISIBILITY projection that
// re-expresses a fact's full journey through the protocol intelligence pipeline:
//
//   Activity event → Signal → Memory candidate → Chronicle review candidate →
//   Promotion decision → Institutional Register entry → Chronicle admission →
//   Chronicle entry → Chronology position → Verified timestamp
//
// This page creates NO new intelligence. It runs the SAME pipeline the other
// labs benches run, takes the terminal Chronology entries, and projects each
// one's already-carried `lineage` trail into a typed, read-only LineagePath via
// the pure deriveLineagePaths(). Every node is exactly one trail entry, verbatim.
//
// Doctrine on display:
//   • Pure projection — one trail entry → one node, in trail order. No invented
//     stage, no dropped stage, no re-derived upstream object (middle stages are
//     honest id-only carried-through nodes).
//   • Never invent — a verified date appears only on a chronology node that
//     already proved one (Sprint 15); completeness degrades to held / coverage-
//     limited / rpc-limited / partial rather than implying certainty.
//   • Genesis honesty — a foundational fact that predates the event scanner roots
//     at a genesis-fact sentinel and reads PARTIAL, never a complete chain.
//   • Read-only — no Story, no Recognition, no governance, no publishing, no
//     mutation; the underlying objects are never touched.
//
// noindex/nofollow (inherits the /labs layout); never linked from public nav;
// /labs/* is blocked in robots.txt and excluded from the sitemap.

import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProtocolEvents } from "@/lib/protocol-events";
import { deriveSignals } from "@/lib/protocol-signals";
import { deriveMemoryCandidates } from "@/lib/memory-candidates";
import { deriveChronicleReviewCandidates } from "@/lib/chronicle-review-candidates";
import { deriveChroniclePromotionDecisions } from "@/lib/chronicle-promotion";
import { deriveInstitutionalRegister } from "@/lib/institutional-register";
import { deriveGenesisRegisterEntries } from "@/lib/institutional-register-genesis";
import { mergeInstitutionalEntries } from "@/lib/institutional-register-public";
import { deriveChronicleAdmissionCandidates } from "@/lib/chronicle-admission";
import { deriveInstitutionalChronicleEntries } from "@/lib/chronicle-entry";
import { deriveChronologicalTimeline } from "@/lib/chronology";
import { applyBlockTimestamps } from "@/lib/chronology-registry";
import {
  collectAnchoredBlockNumbers,
  useBlockTimestamps,
} from "@/lib/chronology-timestamps";
import {
  COMPLETENESS_DESCRIPTION,
  COMPLETENESS_LABEL,
  STAGE_LABEL,
  deriveLineagePaths,
  lineagePathsByEvent,
  lineagePathsByTxHash,
  type LineageCompleteness,
  type LineageNode,
  type LineagePath,
} from "@/lib/protocol-lineage";

export const Route = createFileRoute("/labs/protocol-lineage")({
  head: () => ({
    meta: [
      { title: "Protocol Lineage · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. The Protocol Lineage projection — a pure, read-only re-expression of a fact's journey through the intelligence pipeline (Event → Signal → … → Chronology → Verified timestamp). No new intelligence, no invented dates. Not for public use.",
      },
    ],
  }),
  component: ProtocolLineageWorkbench,
});

const COMPLETENESS_TONE: Record<LineageCompleteness, string> = {
  complete: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  partial: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  held: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "coverage-limited": "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  "rpc-limited": "border-destructive/40 bg-destructive/10 text-destructive",
};

const VERIFICATION_TONE: Record<LineageNode["verificationStatus"], string> = {
  verified: "text-emerald-700 dark:text-emerald-400",
  held: "text-amber-700 dark:text-amber-400",
  "carried-through": "text-muted-foreground",
};

const COMPLETENESS_ORDER: LineageCompleteness[] = [
  "complete",
  "partial",
  "rpc-limited",
  "coverage-limited",
  "held",
];

function short(hash?: string | null): string {
  if (!hash) return "—";
  return hash.length > 18 ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : hash;
}

/** Format a VERIFIED unix-seconds timestamp as a deterministic UTC string. */
function formatUtc(unix: number | null): string {
  if (unix === null || !Number.isFinite(unix)) return "—";
  return new Date(unix * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function ProtocolLineageWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 48 });

  // Run the SAME pipeline the other benches run, down to the terminal chronology.
  const baseChronology = useMemo(() => {
    const signals = deriveSignals(events, { windowCoversDeployment: false });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    const decisions = deriveChroniclePromotionDecisions(review);
    const derived = deriveInstitutionalRegister(decisions);
    const merged = mergeInstitutionalEntries(deriveGenesisRegisterEntries(), derived);
    const candidates = deriveChronicleAdmissionCandidates(merged);
    const entries = deriveInstitutionalChronicleEntries(candidates);
    return deriveChronologicalTimeline(entries);
  }, [events]);

  // Thread verified block timestamps (Sprint 15) — read off-chain, applied as
  // metadata. Ordering is already fixed; this only overlays the date fields.
  const anchoredBlocks = useMemo(
    () => collectAnchoredBlockNumbers(baseChronology),
    [baseChronology],
  );
  const timestampLookup = useBlockTimestamps(anchoredBlocks);
  const chronology = useMemo(
    () => applyBlockTimestamps(baseChronology, timestampLookup),
    [baseChronology, timestampLookup],
  );

  // The pure projection: one ChronologyEntry → one LineagePath.
  const paths = useMemo(() => deriveLineagePaths(chronology), [chronology]);

  const byCompleteness = useMemo(() => {
    const m = new Map<LineageCompleteness, number>();
    for (const p of paths)
      m.set(p.completenessStatus, (m.get(p.completenessStatus) ?? 0) + 1);
    return m;
  }, [paths]);

  const indexes = useMemo(
    () => ({
      byEvent: lineagePathsByEvent(paths),
      byTx: lineagePathsByTxHash(paths),
    }),
    [paths],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the Protocol Lineage projection. Not marketing, not linked from
          public navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt. Every
          row is projected by the pure <code>deriveLineagePaths()</code> function from the terminal
          Chronology entries — one trail entry becomes exactly one node, verbatim. No new intelligence
          is created, no date is invented, no Story or Recognition is generated, and no underlying
          object is mutated.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Protocol Lineage · Fact → Full Journey
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The visibility overlay. Each terminal <code>ChronologyEntry</code> already carries its full{" "}
          <code>lineage</code> trail (every stage prepends its own id). This projection re-expresses
          that trail as a typed, read-only <code>LineagePath</code> so a surface can show
          &ldquo;what happened to this fact&rdquo; without re-parsing breadcrumb strings. It reads the
          chronology registry leaf <b>type-only</b> and nothing upstream (Adjacency Law).
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          {[
            "Activity event",
            "Signal",
            "Memory candidate",
            "Chronicle review",
            "Promotion decision",
            "Register entry",
            "Chronicle admission",
            "Chronicle entry",
            "Chronology",
            "Verified timestamp",
          ].map((stage, i, arr) => (
            <span key={stage} className="flex items-center gap-1.5">
              <span className="rounded border border-border bg-card px-2 py-1 font-medium text-foreground">
                {stage}
              </span>
              {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Source events: <b>{events.length}</b>
          </span>
          <span>
            Lineage paths: <b>{paths.length}</b>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400">
            Complete: <b>{byCompleteness.get("complete") ?? 0}</b>
          </span>
          <span className="text-sky-700 dark:text-sky-400">
            Partial (genesis): <b>{byCompleteness.get("partial") ?? 0}</b>
          </span>
          <span className="text-amber-700 dark:text-amber-400">
            Held: <b>{byCompleteness.get("held") ?? 0}</b>
          </span>
          <span>
            Indexed by event: <b>{indexes.byEvent.size}</b>
          </span>
          <span>
            Indexed by tx: <b>{indexes.byTx.size}</b>
          </span>
        </div>

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/chronicle-timeline" className="underline hover:no-underline">
            → Chronicle timeline (entry → order)
          </Link>
          <Link to="/chronicle" className="underline hover:no-underline">
            → Public Chronicle (live, curated)
          </Link>
          <Link to="/activity" className="underline hover:no-underline">
            → Activity (raw event flow)
          </Link>
        </nav>
      </header>

      {isLoading && (
        <p className="mt-10 text-sm text-muted-foreground">Loading on-chain events…</p>
      )}
      {isError && !isLoading && (
        <p className="mt-10 text-sm text-muted-foreground">
          Live read unavailable right now — the projection degrades rather than fabricating a journey.
        </p>
      )}

      {/* ── Distribution by completeness ───────────────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          By lineage completeness
        </div>
        <ul className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
          {COMPLETENESS_ORDER.map((c) => (
            <li key={c} className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span
                  className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${COMPLETENESS_TONE[c]}`}
                >
                  {COMPLETENESS_LABEL[c]}
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {COMPLETENESS_DESCRIPTION[c]}
                </span>
              </span>
              <span className="shrink-0 text-muted-foreground">{byCompleteness.get(c) ?? 0}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Lineage paths ──────────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Lineage paths <span className="text-muted-foreground">· {paths.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Each path projects one Chronology entry, terminal → root. A node&rsquo;s id is the carried
          trail string verbatim; middle stages are honest id-only carried-through nodes (their live
          status is not re-derived here). A date appears only on a verified chronology node.
        </p>

        {paths.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No Chronicle entries from the current sample — nothing to project.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {paths.map((p) => (
              <LineagePathCard key={p.chronologyId} path={p} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function LineagePathCard({ path }: { path: LineagePath }) {
  const tone = COMPLETENESS_TONE[path.completenessStatus];
  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <code className="mono text-sm font-medium text-foreground">
            {path.sourceChronicleEntryId.split(":").pop()}
          </code>
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span>
              current stage <b>{STAGE_LABEL[path.currentStage]}</b>
            </span>
            <span>
              proven to{" "}
              <b>
                {path.highestVerifiedStage ? STAGE_LABEL[path.highestVerifiedStage] : "—"}
              </b>
            </span>
            <span>root {short(path.sourceEventId)}</span>
            <span>tx {short(path.sourceTxHash)}</span>
          </div>
        </div>
        <span
          className={`mono shrink-0 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${tone}`}
        >
          {COMPLETENESS_LABEL[path.completenessStatus]}
        </span>
      </div>

      {/* The node chain, terminal → root */}
      <ol className="mt-3 space-y-1.5">
        {path.nodes.map((n) => (
          <li
            key={n.id}
            className="flex items-start gap-3 rounded border border-border/60 bg-background/40 px-3 py-1.5"
          >
            <span className="mono mt-0.5 shrink-0 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-foreground">
              {STAGE_LABEL[n.layer]}
            </span>
            <div className="min-w-0 text-xs">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <code className="mono text-foreground/80">{n.id}</code>
                <span className={`text-[10px] uppercase tracking-[0.12em] ${VERIFICATION_TONE[n.verificationStatus]}`}>
                  {n.verificationStatus}
                </span>
                {n.chronologyPosition !== null && (
                  <span className="text-muted-foreground">#{n.chronologyPosition}</span>
                )}
                {n.block !== null && (
                  <span className="text-muted-foreground">block {n.block.toLocaleString()}</span>
                )}
                {n.timestamp !== null && (
                  <span className="text-emerald-700 dark:text-emerald-400">{formatUtc(n.timestamp)}</span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{n.lineageReason}</p>
            </div>
          </li>
        ))}
      </ol>
    </li>
  );
}
