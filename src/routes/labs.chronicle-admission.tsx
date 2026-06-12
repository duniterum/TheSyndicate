// src/routes/labs.chronicle-admission.tsx
// INTERNAL · Chronicle Admission layer — the Institutional Register → Chronicle
// admission inspection bench (Sprint 12).
//
// NOT marketing. An internal QA surface for the MINIMAL, inspection-only
// CHRONICLE ADMISSION layer: a pure, deterministic projection of durable
// InstitutionalRegisterEntries into ChronicleAdmissionCandidates — a read-only
// eligibility verdict marking which verified institutional facts are ELIGIBLE to
// LATER become public Chronicle entries. Nothing is published, no existing
// Chronicle entry is mutated, no Story / Recognition / Member-Register /
// Governance / AI surface is built, no upstream derivation is changed, and no
// contract is touched. Promotion of an `admitted` candidate INTO the Chronicle
// is always a human / governance act.
//
//   events → deriveSignals() → deriveMemoryCandidates()
//          → deriveChronicleReviewCandidates() → deriveChroniclePromotionDecisions()
//          → deriveInstitutionalRegister()  ╮
//                                            ├─ mergeInstitutionalEntries(genesis, …)
//   config → deriveGenesisRegisterEntries() ╯
//          → deriveChronicleAdmissionCandidates()
//
// Doctrine on display:
//   • Adjacency Law — candidates read INSTITUTIONAL REGISTER ENTRIES only; the
//     full lineage is carried THROUGH each entry.
//   • Member-register rule — member-subject facts (membership/continuity, or any
//     member-living register) are EXCLUDED entirely (clause 6).
//   • Precedence — copy > coverage > rules: copy violations reject; an incomplete
//     lineage holds; the source status decides (rejected/held/draft); an active,
//     verified/locked entry is admitted only in an admissible rule bucket.
//   • Identity- AND amount-blind — the verdict is read from structure (register /
//     category / rule bucket / verification / lineage), never who acted or how much.
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
import {
  ADMISSION_ADMIT_BUCKETS,
  CHRONICLE_ADMISSION_MAINTAINER,
  isMemberLivingEntry,
  type ChronicleAdmissionCandidate,
  type ChronicleAdmissionStatus,
} from "@/lib/chronicle-admission-registry";

export const Route = createFileRoute("/labs/chronicle-admission")({
  head: () => ({
    meta: [
      { title: "Chronicle Admission · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. The minimal Institutional Register → Chronicle Admission layer — a deterministic, read-only eligibility verdict marking which verified institutional facts may LATER become Chronicle entries. Read-only, no publishing, not for public use.",
      },
    ],
  }),
  component: ChronicleAdmissionWorkbench,
});

const STATUS_TONE: Record<ChronicleAdmissionStatus, string> = {
  admitted:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  review: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  held: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
};

const STATUSES: ChronicleAdmissionStatus[] = ["admitted", "review", "held", "rejected"];

function short(hash?: string): string {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

function ChronicleAdmissionWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 48 });
  const [windowCoversDeployment, setWindowCoversDeployment] = useState(false);

  const { candidates, entryCount, excludedMemberLiving } = useMemo(() => {
    const signals = deriveSignals(events, { windowCoversDeployment });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    const decisions = deriveChroniclePromotionDecisions(review);
    const derived = deriveInstitutionalRegister(decisions);
    // Genesis seed first, then deduped derived (mergeInstitutionalEntries order).
    const merged = mergeInstitutionalEntries(deriveGenesisRegisterEntries(), derived);
    const cands = deriveChronicleAdmissionCandidates(merged);
    const excluded = merged.filter((e) => isMemberLivingEntry(e)).length;
    return { candidates: cands, entryCount: merged.length, excludedMemberLiving: excluded };
  }, [events, windowCoversDeployment]);

  // Newest first for display (derivers return oldest → newest).
  const ordered = useMemo(() => [...candidates].reverse(), [candidates]);

  const byStatus = useMemo(() => {
    const m = new Map<ChronicleAdmissionStatus, number>();
    for (const c of candidates) m.set(c.admissionStatus, (m.get(c.admissionStatus) ?? 0) + 1);
    return m;
  }, [candidates]);

  const admitted = byStatus.get("admitted") ?? 0;
  const review = byStatus.get("review") ?? 0;
  const held = byStatus.get("held") ?? 0;
  const rejected = byStatus.get("rejected") ?? 0;
  const cleanCopy = candidates.every((c) => c.copyViolations.length === 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the minimal Chronicle Admission layer. Not marketing, not linked
          from public navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt.
          Every candidate is projected by the pure <code>deriveChronicleAdmissionCandidates()</code>{" "}
          function from durable Institutional Register entries. A candidate is a{" "}
          <b>read-only eligibility verdict</b> — nothing is published to the Chronicle, no existing
          entry is mutated, and turning an <code>admitted</code> candidate into a Chronicle entry is a
          human / governance act.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Chronicle Admission · Register → Admission Inspection
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The last pipeline edge. Each durable <code>InstitutionalRegisterEntry</code> projects to one{" "}
          <code>ChronicleAdmissionCandidate</code> with an eligibility verdict —{" "}
          <code>admitted</code>, <code>review</code>, <code>held</code>, or <code>rejected</code> —
          the proposed Chronicle classification, and the full lineage carried verbatim. Candidates
          read register entries only (Adjacency Law). <b>Member-subject facts are excluded entirely</b>{" "}
          (the member register is reserved for DAO ratification).
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {[
            "Institutional register entry",
            "deriveChronicleAdmissionCandidates()",
            "Admission candidate",
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
            Register entries: <b>{entryCount}</b>
          </span>
          <span>
            Admission candidates: <b>{candidates.length}</b>
          </span>
          <span>
            Admitted: <b>{admitted}</b>
          </span>
          <span>
            Review: <b>{review}</b>
          </span>
          <span>
            Held: <b>{held}</b>
          </span>
          <span>
            Rejected: <b>{rejected}</b>
          </span>
          <span>
            Member-living excluded: <b>{excludedMemberLiving}</b>
          </span>
          <span className={cleanCopy ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
            copy clean: <b>{cleanCopy ? "holds" : "VIOLATED"}</b>
          </span>
        </div>

        {/* Coverage toggle — gates the upstream first-funding / continuity candidates */}
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
            entries stay <code>coverage-limited</code> and are <code>held</code> — never admitted.
          </p>
        )}

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/institutional-register" className="underline hover:no-underline">
            → Institutional register (promotion → register workbench)
          </Link>
          <Link to="/labs/chronicle-promotion" className="underline hover:no-underline">
            → Chronicle promotion (chronicle → promotion workbench)
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

      {/* ── Distribution by admission status ─────────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          By admission status
        </div>
        <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* ── Candidates ──────────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Admission candidates <span className="text-muted-foreground">· {ordered.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Newest first. Each row cites the register entry it derives from and preserves the lineage.
          An <code>admitted</code> verdict marks eligibility only — promotion into the Chronicle
          requires a human / governance act; the baseline derivation never auto-publishes.
        </p>

        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No admission candidates from the current sample.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Admission</th>
                  <th className="px-3 py-2 font-medium">Verification</th>
                  <th className="px-3 py-2 font-medium">Proposed category</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Rule bucket</th>
                  <th className="px-3 py-2 font-medium">From entry</th>
                  <th className="px-3 py-2 font-medium">Source tx</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((c: ChronicleAdmissionCandidate) => (
                  <tr key={c.id} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${STATUS_TONE[c.admissionStatus]}`}
                      >
                        {c.admissionStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{c.verificationStatus}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{c.proposedChronicleCategory}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="font-medium text-foreground">{c.title}</div>
                      <div className="mt-0.5 text-muted-foreground">{c.summary}</div>
                      <div className="mt-1 text-[11px] italic text-muted-foreground">
                        {c.admissionReason}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/70">{c.createdFrom}</code>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <code className="mono">{c.sourceInstitutionalEntryId}</code>
                    </td>
                    <td className="px-3 py-2">
                      <code className="mono text-[11px] text-muted-foreground">
                        {short(c.sourceTxHash)}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Admissible rule buckets ─────────────────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold tracking-tight">Admissible rule buckets</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          A verified / locked, active entry is auto-admitted only when its rule bucket is one of
          these permanent, protocol-primitive buckets. Every other bucket — and any unknown bucket —
          falls through to <code>review</code>; founder / system-wallet actions always need a human
          significance call.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {[...ADMISSION_ADMIT_BUCKETS].map((b) => (
            <li
              key={b}
              className="mono rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-700 dark:text-emerald-400"
            >
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Maintainer notes (§ internal) ───────────────────────────────────── */}
      <section className="mt-8 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold tracking-tight">Maintainer notes</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {CHRONICLE_ADMISSION_MAINTAINER.map((m) => (
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
