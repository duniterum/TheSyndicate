// src/routes/labs.chronicle-timeline.tsx
// INTERNAL · Chronicle Chronology layer — the Chronicle Entry → Chronological
// Timeline inspection bench (Sprint 14).
//
// NOT marketing. An internal QA surface for the overlay edge
// CHRONICLE ENTRY → CHRONOLOGICAL TIMELINE: a pure, deterministic projection of
// Chronicle Entries into an ordered timeline. It establishes the protocol's
// permanent sense of historical ORDER and nothing more — no Story, no
// Recognition, no publishing, no date invention. An entry that cannot prove a
// verified block height is HELD, never positioned by guess.
//
//   …→ deriveInstitutionalChronicleEntries()
//      → deriveChronologicalTimeline()   ← THIS layer
//
// Doctrine on display:
//   • Adjacency Law — chronology reads CHRONICLE ENTRIES only; lineage is carried
//     THROUGH each entry. No chapters / milestones (count-derived, not time).
//   • Block ordering — only ACTIVE, block-anchored, non-duplicate entries earn a
//     sequence (block number asc, entry-id tie-break). Everything else is HELD.
//   • Never invent — blockTimestamp stays null (no timestamp is fetched); a
//     tx-only or anchor-free entry proves existence, never order.
//   • Duplicate-safe — two entries sharing a (block, tx) anchor: the first is
//     sequenced, the second flagged and retained, never silently dropped.
//   • Existing Chronicle entries are never mutated; chronology is an OVERLAY.
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
import {
  CHRONOLOGY_MAINTAINER,
  orderedTimeline,
  type ChronologyEntry,
  type ChronologyStatus,
} from "@/lib/chronology-registry";

export const Route = createFileRoute("/labs/chronicle-timeline")({
  head: () => ({
    meta: [
      { title: "Chronicle Timeline · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. The Chronicle Entry → Chronological Timeline overlay — a deterministic, read-only ordering of Chronicle Entries by verified block height. Unprovable order is held, never invented. Not for public use.",
      },
    ],
  }),
  component: ChronicleTimelineWorkbench,
});

const STATUS_TONE: Record<ChronologyStatus, string> = {
  ordered: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "held-no-anchor": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "coverage-limited": "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

const STATUSES: ChronologyStatus[] = ["ordered", "held-no-anchor", "coverage-limited"];

function short(hash?: string | null): string {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

function ChronicleTimelineWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 48 });

  const { chronology } = useMemo(() => {
    const signals = deriveSignals(events, { windowCoversDeployment: false });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    const decisions = deriveChroniclePromotionDecisions(review);
    const derived = deriveInstitutionalRegister(decisions);
    const merged = mergeInstitutionalEntries(deriveGenesisRegisterEntries(), derived);
    const candidates = deriveChronicleAdmissionCandidates(merged);
    const entries = deriveInstitutionalChronicleEntries(candidates);
    const chron = deriveChronologicalTimeline(entries);
    return { chronology: chron };
  }, [events]);

  const ordered = useMemo(() => orderedTimeline(chronology), [chronology]);

  const byStatus = useMemo(() => {
    const m = new Map<ChronologyStatus, number>();
    for (const c of chronology) m.set(c.chronologyStatus, (m.get(c.chronologyStatus) ?? 0) + 1);
    return m;
  }, [chronology]);

  const duplicates = useMemo(
    () => chronology.filter((c) => c.suspectedDuplicateOf !== null),
    [chronology],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the Chronicle Chronology layer. Not marketing, not linked from
          public navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt. Every
          row is projected by the pure <code>deriveChronologicalTimeline()</code> function from
          Chronicle Entries. Order is derived from the <b>verified block height</b> alone; an entry
          that cannot prove a block is <b>held</b>, never positioned by guess. No date is invented, no
          Story is generated, and no Chronicle entry is mutated — chronology is an overlay.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Chronicle Timeline · Entry → Chronological Order
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The temporal overlay. Each Chronicle Entry projects to one{" "}
          <code>ChronologyEntry</code>. Only <b>active, block-anchored, non-duplicate</b> entries earn
          a <code>sequenceNumber</code>, ordered by block number (entry-id tie-break). A superseded
          entry keeps its anchor but yields its position to the active version; a duplicate (shared
          block + transaction) is flagged and retained, never dropped. Chronology reads entries only
          (Adjacency Law) and carries the full lineage verbatim.
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {["Chronicle entry", "deriveChronologicalTimeline()", "Chronological timeline"].map(
            (stage, i, arr) => (
              <span key={stage} className="flex items-center gap-2">
                <span className="rounded border border-border bg-card px-2 py-1 font-medium text-foreground">
                  {stage}
                </span>
                {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
              </span>
            ),
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Source events: <b>{events.length}</b>
          </span>
          <span>
            Chronology entries: <b>{chronology.length}</b>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400">
            Ordered: <b>{ordered.length}</b>
          </span>
          <span>
            Held (no anchor): <b>{byStatus.get("held-no-anchor") ?? 0}</b>
          </span>
          <span>
            Coverage-limited: <b>{byStatus.get("coverage-limited") ?? 0}</b>
          </span>
          <span className={duplicates.length === 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
            Suspected duplicates: <b>{duplicates.length}</b>{" "}
            {duplicates.length === 0 ? "(none)" : "(flagged, not dropped)"}
          </span>
        </div>

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/chronicle-entries-preview" className="underline hover:no-underline">
            → Chronicle entries (admission → entry workbench)
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
          Live read unavailable right now — the derivation degrades rather than fabricating order.
        </p>
      )}

      {/* ── Distribution by chronology status ─────────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">By chronology status</div>
        <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {STATUSES.map((s) => (
            <li key={s} className="flex items-center justify-between text-sm">
              <span
                className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${STATUS_TONE[s]}`}
              >
                {s}
              </span>
              <span className="text-muted-foreground">{byStatus.get(s) ?? 0}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Ordered timeline ──────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Ordered timeline <span className="text-muted-foreground">· {ordered.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          The proven order: only entries with a verified block height, by ascending block. Block
          numbers are ordinal positions, <b>not dates</b> — no timestamp is fetched anywhere in the
          pipeline, so <code>blockTimestamp</code> is null by design.
        </p>

        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No block-anchored entries from the current sample — nothing is ordered (held, not guessed).
          </p>
        ) : (
          <ol className="mt-4 space-y-2">
            {ordered.map((c: ChronologyEntry) => (
              <li
                key={c.chronologyId}
                className="flex items-start gap-3 rounded-md border border-border bg-card px-4 py-3"
              >
                <span className="mono mt-0.5 shrink-0 rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  #{c.sequenceNumber}
                </span>
                <div className="min-w-0 text-sm">
                  <div className="font-medium text-foreground">
                    <code className="mono">{c.sourceChronicleEntryId.split(":").pop()}</code>
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>
                      block <b>{c.blockNumber?.toLocaleString() ?? "—"}</b>
                    </span>
                    <span>anchor {c.chronologyAnchor}</span>
                    <span>confidence {c.chronologyConfidence}</span>
                    <span>tx {short(c.txHash)}</span>
                    <span>type {c.chronologyType}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ── Full chronology table ─────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          All chronology entries <span className="text-muted-foreground">· {chronology.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          The complete overlay (1:1 with Chronicle Entries, input order). Held and coverage-limited
          rows carry no sequence — chronology never fabricates an order it cannot prove.
        </p>

        {chronology.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No Chronicle entries from the current sample.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Seq</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Anchor</th>
                  <th className="px-3 py-2 font-medium">Block</th>
                  <th className="px-3 py-2 font-medium">Timestamp</th>
                  <th className="px-3 py-2 font-medium">Chapter</th>
                  <th className="px-3 py-2 font-medium">Milestone</th>
                  <th className="px-3 py-2 font-medium">Source entry</th>
                  <th className="px-3 py-2 font-medium">Tx</th>
                  <th className="px-3 py-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {chronology.map((c) => (
                  <tr key={c.chronologyId} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2 mono text-xs text-foreground/80">
                      {c.sequenceNumber ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${STATUS_TONE[c.chronologyStatus]}`}
                      >
                        {c.chronologyStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{c.chronologyAnchor}</code>
                    </td>
                    <td className="px-3 py-2 mono text-xs text-foreground/80">
                      {c.blockNumber?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-3 py-2 mono text-xs text-muted-foreground">
                      {c.blockTimestamp ?? "—"}
                    </td>
                    <td className="px-3 py-2 mono text-xs text-muted-foreground">
                      {c.chapter ?? "—"}
                    </td>
                    <td className="px-3 py-2 mono text-xs text-muted-foreground">
                      {c.milestone ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <code className="mono">{c.sourceChronicleEntryId.split(":").pop()}</code>
                      {c.suspectedDuplicateOf && (
                        <div className="mt-0.5 text-[11px] text-destructive">
                          duplicate of {c.suspectedDuplicateOf.split(":").pop()}
                        </div>
                      )}
                      {c.supersedes && (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          supersedes {c.supersedes.split(":").pop()}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 mono text-[11px] text-muted-foreground">
                      {short(c.txHash)}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">
                      {c.chronologyReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Maintainer notes ──────────────────────────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold tracking-tight">Maintainer notes</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {CHRONOLOGY_MAINTAINER.map((m) => (
            <li key={m.topic} className="text-xs">
              <div className="font-medium text-foreground/80">{m.topic}</div>
              <p className="mt-0.5 text-muted-foreground">{m.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
