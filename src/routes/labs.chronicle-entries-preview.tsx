// src/routes/labs.chronicle-entries-preview.tsx
// INTERNAL · Chronicle Entry layer — the Admission → Chronicle Entry publication
// inspection bench (Sprint 13).
//
// NOT marketing. An internal QA surface for the MINIMAL, controlled publication
// edge CHRONICLE ADMISSION CANDIDATE → CHRONICLE ENTRY: a pure, deterministic
// projection of admitted candidates into DRAFT institutional Chronicle entries.
// Nothing is published — an admitted candidate lands as a `draft` awaiting a
// human / governance act. No existing Chronicle entry is mutated, no Story /
// Recognition / Member-Register / Governance / AI surface is built, no upstream
// derivation is changed, and no contract is touched.
//
//   events → deriveSignals() → deriveMemoryCandidates()
//          → deriveChronicleReviewCandidates() → deriveChroniclePromotionDecisions()
//          → deriveInstitutionalRegister()  ╮
//                                            ├─ mergeInstitutionalEntries(genesis, …)
//   config → deriveGenesisRegisterEntries() ╯
//          → deriveChronicleAdmissionCandidates()
//          → deriveInstitutionalChronicleEntries()
//
// Doctrine on display:
//   • Adjacency Law — entries read ADMISSION CANDIDATES only; the full lineage is
//     carried THROUGH each candidate.
//   • Draft-only — resolvePublication maps admitted→draft, review/held→held,
//     rejected→rejected. It NEVER emits `published`: publication is a human /
//     governance act this layer does not perform.
//   • Precedence — copy > rules: a carried copy violation rejects an entry even
//     when the candidate was admitted upstream.
//   • The locked, hand-curated Chronicle entries are never read or mutated; this
//     is a SEPARATE derived institutional store.
//
// noindex/nofollow (inherits the /labs layout); never linked from public nav;
// /labs/* is blocked in robots.txt and excluded from the sitemap.

import { useMemo, useState } from "react";
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
import {
  CHRONICLE_ENTRY_MAINTAINER,
  type ChroniclePublicationStatus,
  type InstitutionalChronicleEntry,
} from "@/lib/chronicle-entry-registry";

export const Route = createFileRoute("/labs/chronicle-entries-preview")({
  head: () => ({
    meta: [
      { title: "Chronicle Entries · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. The minimal Chronicle Admission → Chronicle Entry publication edge — a deterministic, read-only projection of admitted candidates into DRAFT institutional entries. Nothing is published; publication is a human / governance act. Not for public use.",
      },
    ],
  }),
  component: ChronicleEntriesWorkbench,
});

const STATUS_TONE: Record<ChroniclePublicationStatus, string> = {
  draft: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  published:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  held: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  superseded: "border-border bg-muted/40 text-muted-foreground",
};

const STATUSES: ChroniclePublicationStatus[] = [
  "draft",
  "published",
  "held",
  "rejected",
  "superseded",
];

function short(hash?: string | null): string {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

function ChronicleEntriesWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 48 });
  const [windowCoversDeployment, setWindowCoversDeployment] = useState(false);

  const { entries, candidateCount } = useMemo(() => {
    const signals = deriveSignals(events, { windowCoversDeployment });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    const decisions = deriveChroniclePromotionDecisions(review);
    const derived = deriveInstitutionalRegister(decisions);
    const merged = mergeInstitutionalEntries(deriveGenesisRegisterEntries(), derived);
    const candidates = deriveChronicleAdmissionCandidates(merged);
    const built = deriveInstitutionalChronicleEntries(candidates);
    return { entries: built, candidateCount: candidates.length };
  }, [events, windowCoversDeployment]);

  // Newest first for display (derivers return oldest → newest).
  const ordered = useMemo(() => [...entries].reverse(), [entries]);

  const byStatus = useMemo(() => {
    const m = new Map<ChroniclePublicationStatus, number>();
    for (const e of entries) m.set(e.publicationStatus, (m.get(e.publicationStatus) ?? 0) + 1);
    return m;
  }, [entries]);

  const draft = byStatus.get("draft") ?? 0;
  const held = byStatus.get("held") ?? 0;
  const rejected = byStatus.get("rejected") ?? 0;
  const published = byStatus.get("published") ?? 0;
  const cleanCopy = entries.every((e) => e.copyViolations.length === 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the minimal Chronicle Entry layer. Not marketing, not linked from
          public navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt. Every
          row is projected by the pure <code>deriveInstitutionalChronicleEntries()</code> function
          from admitted Chronicle Admission Candidates. An entry is a <b>DRAFT</b> until a human /
          governance act publishes it — nothing here is live in the public Chronicle, and the locked,
          hand-curated Chronicle entries are never read or mutated.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Chronicle Entries · Admission → Entry Publication
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The controlled publication edge. Each admitted <code>ChronicleAdmissionCandidate</code>{" "}
          projects to one DRAFT <code>InstitutionalChronicleEntry</code>; a candidate in{" "}
          <code>review</code>/<code>held</code> is <code>held</code>, a rejected candidate is{" "}
          <code>rejected</code>. <b>The deriver never publishes</b> — there is no <code>published</code>{" "}
          row unless a human / governance act records one. Entries read admission candidates only
          (Adjacency Law) and carry the full lineage verbatim.
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {[
            "Admission candidate",
            "deriveInstitutionalChronicleEntries()",
            "Chronicle entry (draft)",
          ].map((stage, i, arr) => (
            <span key={stage} className="flex items-center gap-2">
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
            Admission candidates: <b>{candidateCount}</b>
          </span>
          <span>
            Chronicle entries: <b>{entries.length}</b>
          </span>
          <span>
            Draft: <b>{draft}</b>
          </span>
          <span>
            Held: <b>{held}</b>
          </span>
          <span>
            Rejected: <b>{rejected}</b>
          </span>
          <span className={published === 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
            Published: <b>{published}</b> {published === 0 ? "(none — as designed)" : "(UNEXPECTED)"}
          </span>
          <span className={cleanCopy ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
            copy clean: <b>{cleanCopy ? "holds" : "VIOLATED"}</b>
          </span>
        </div>

        {/* Coverage toggle — gates the upstream coverage-dependent candidates */}
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
          <input
            type="checkbox"
            checked={windowCoversDeployment}
            onChange={(e) => setWindowCoversDeployment(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          <span className="text-foreground/80">
            <code>windowCoversDeployment</code> — treat the loaded window as a gapless scan back to
            deployment (verified vs. held <code>coverage-limited</code>)
          </span>
        </label>
        {!windowCoversDeployment && (
          <p className="mt-2 max-w-3xl text-[11px] text-muted-foreground">
            Off by default: the live workbench loads only a recent window, so coverage-dependent
            facts stay <code>held</code> — never filed as a draft.
          </p>
        )}

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/chronicle-admission" className="underline hover:no-underline">
            → Chronicle admission (register → admission workbench)
          </Link>
          <Link to="/chronicle" className="underline hover:no-underline">
            → Public Chronicle (live, curated)
          </Link>
        </nav>
      </header>

      {isLoading && (
        <p className="mt-10 text-sm text-muted-foreground">Loading on-chain events…</p>
      )}
      {isError && !isLoading && (
        <p className="mt-10 text-sm text-muted-foreground">
          Live read unavailable right now — the derivation degrades rather than fabricating rows.
        </p>
      )}

      {/* ── Distribution by publication status ───────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          By publication status
        </div>
        <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-5">
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

      {/* ── Entries ─────────────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Chronicle entries <span className="text-muted-foreground">· {ordered.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Newest first. Each row cites the admission candidate it derives from and preserves the
          lineage. A <code>draft</code> verdict marks eligibility only — publishing it into the public
          Chronicle requires a human / governance act; the baseline derivation never auto-publishes.
        </p>

        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No Chronicle entries from the current sample.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Publication</th>
                  <th className="px-3 py-2 font-medium">Verification</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Decision</th>
                  <th className="px-3 py-2 font-medium">From candidate</th>
                  <th className="px-3 py-2 font-medium">Source tx</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((e: InstitutionalChronicleEntry) => (
                  <tr key={e.id} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${STATUS_TONE[e.publicationStatus]}`}
                      >
                        {e.publicationStatus}
                      </span>
                      {e.version > 1 && (
                        <div className="mt-1 text-[10px] text-muted-foreground">v{e.version}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{e.verificationStatus}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{e.category}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="font-medium text-foreground">{e.title}</div>
                      <div className="mt-0.5 text-muted-foreground">{e.summary}</div>
                      <div className="mt-1 text-[11px] italic text-muted-foreground">
                        {e.createdFrom}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/70">{e.publicationDecision.verdict}</code>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        reviewer: {e.publicationDecision.reviewer ?? "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <code className="mono">{e.sourceChronicleAdmissionCandidateId}</code>
                    </td>
                    <td className="px-3 py-2">
                      <code className="mono text-[11px] text-muted-foreground">
                        {short(e.chronology.txHash)}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Maintainer notes (§ internal) ───────────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold tracking-tight">Maintainer notes</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {CHRONICLE_ENTRY_MAINTAINER.map((m) => (
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
