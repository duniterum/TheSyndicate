// src/routes/labs.chronicle-candidates.tsx
// INTERNAL · Chronicle Candidate layer — the Memory → Chronicle review workbench.
//
// NOT marketing. An internal QA surface for the MINIMAL Chronicle Candidate layer
// (Sprint 4): a pure, deterministic projection of Memory Candidates into
// ChronicleReviewCandidates that answer "is this eligible to become a permanent
// Chronicle entry LATER?" — review-ready ONLY. Nothing is published to the locked
// Chronicle, no Story/Recognition is written, no contract or public UI touched.
//
//   events → deriveSignals() → deriveMemoryCandidates() → deriveChronicleReviewCandidates()
//
// Doctrine on display:
//   • Adjacency Law — candidates read MEMORY CANDIDATES only; lineage to the
//     Signal → Event → Tx/Block is carried THROUGH the MemoryCandidate.
//   • Eligibility from the carried lineage TIER — S0 never; S1 only a Chronicle
//     safe-set of categories; S2+ always. Identity-neutral: a founder/system act
//     qualifies via tier/category, never via who acted.
//   • Review-first — the only recommended actions are "promote-on-review" and
//     "hold"; promotion to the Chronicle is always a human act.
//   • Coverage / context holds — a coverage-limited candidate is HELD
//     (hold-coverage); an institutional founder/system/protocol-burn act is HELD
//     (hold-context) for human framing.
//   • Own person-free copy — this layer generates its OWN Chronicle-voice copy
//     (never reusing memory titles, which may name a "founder"); every string is
//     validated against the banned-term / forbidden-subject rules.
//
// noindex/nofollow (inherits the /labs layout); never linked from public nav;
// /labs/* is blocked in robots.txt and excluded from the sitemap.

import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProtocolEvents } from "@/lib/protocol-events";
import { deriveSignals } from "@/lib/protocol-signals";
import { deriveMemoryCandidates } from "@/lib/memory-candidates";
import { deriveChronicleReviewCandidates } from "@/lib/chronicle-review-candidates";
import type { MemoryRegister } from "@/lib/memory-candidate-registry";
import type {
  ChronicleRecommendedAction,
  ChronicleReviewCandidate,
  ChronicleReviewStatus,
  ChronicleVerificationStatus,
} from "@/lib/chronicle-review-candidate-registry";

export const Route = createFileRoute("/labs/chronicle-candidates")({
  head: () => ({
    meta: [
      { title: "Chronicle Candidates · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. The minimal Memory → Chronicle Candidate layer — review-ready eligibility, hold reasons, and proposed person-free copy — projected from the canonical pipeline. Read-only, no Chronicle automation, not for public use.",
      },
    ],
  }),
  component: ChronicleCandidatesWorkbench,
});

const REGISTER_TONE: Record<MemoryRegister, string> = {
  "protocol-institutional":
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "member-living":
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

const REGISTER_LABEL: Record<MemoryRegister, string> = {
  "protocol-institutional": "protocol · institutional",
  "member-living": "member · living",
};

const REVIEW_TONE: Record<ChronicleReviewStatus, string> = {
  "needs-review":
    "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  approved:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  "hold-coverage":
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "hold-context":
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const VERIFICATION_TONE: Record<ChronicleVerificationStatus, string> = {
  verified:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "coverage-limited":
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  pending: "border-border text-muted-foreground",
};

const ACTION_TONE: Record<ChronicleRecommendedAction, string> = {
  "promote-on-review": "text-emerald-700 dark:text-emerald-400",
  hold: "text-amber-700 dark:text-amber-400",
};

function short(hash?: string): string {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

function ChronicleCandidatesWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 48 });
  const [windowCoversDeployment, setWindowCoversDeployment] = useState(false);

  const candidates = useMemo(() => {
    const signals = deriveSignals(events, { windowCoversDeployment });
    const memory = deriveMemoryCandidates(signals);
    return deriveChronicleReviewCandidates(memory);
  }, [events, windowCoversDeployment]);

  // Newest first for display (derivers return oldest → newest).
  const ordered = useMemo(() => [...candidates].reverse(), [candidates]);

  const byReview = useMemo(() => {
    const m = new Map<ChronicleReviewStatus, number>();
    for (const c of candidates) m.set(c.reviewStatus, (m.get(c.reviewStatus) ?? 0) + 1);
    return m;
  }, [candidates]);

  const promotable = useMemo(
    () => candidates.filter((c) => c.recommendedAction === "promote-on-review").length,
    [candidates],
  );
  const held = candidates.length - promotable;
  const cleanCopy = candidates.every((c) => c.copyViolations.length === 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the minimal Chronicle Candidate layer. Not marketing, not linked
          from public navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt.
          Every value is projected by the pure <code>deriveChronicleReviewCandidates()</code> function
          from <code>deriveMemoryCandidates()</code>. Nothing is published to the Chronicle; nothing is
          written back. Promotion is a human act.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Chronicle Candidates · Memory → Chronicle Review Workbench
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The deterministic layer that answers <b>&ldquo;could this become a permanent Chronicle entry
          later?&rdquo;</b> Each eligible Memory Candidate produces one review candidate, classified by{" "}
          <b>register × category</b> with a <b>review status</b> and a single machine recommendation
          (<code>promote-on-review</code> or <code>hold</code>). Eligibility is read from the carried
          lineage <b>tier</b> — never from how much money moved, and never from who acted. Candidates
          read Memory Candidates only (Adjacency Law) and never publish to the Chronicle.
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {[
            "Canonical event",
            "deriveSignals()",
            "deriveMemoryCandidates()",
            "deriveChronicleReviewCandidates()",
            "Chronicle candidate",
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
            Candidates: <b>{candidates.length}</b>
          </span>
          <span>
            Promote-on-review: <b>{promotable}</b>
          </span>
          <span>
            Held: <b>{held}</b>
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
            deployment (verified continuity vs. held coverage-limited)
          </span>
        </label>
        {!windowCoversDeployment && (
          <p className="mt-2 max-w-3xl text-[11px] text-muted-foreground">
            Off by default: the live workbench loads only a recent window, so coverage-dependent
            candidates stay <code>coverage-limited</code> and are HELD (<code>hold-coverage</code>) —
            never dropped, and never asserting a protocol-wide &ldquo;first&rdquo;.
          </p>
        )}

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/memory-candidates" className="underline hover:no-underline">
            → Memory candidates (signal → memory workbench)
          </Link>
          <Link to="/labs/signals" className="underline hover:no-underline">
            → Signals engine (event → signal workbench)
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

      {/* ── Distribution by review status ──────────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">By review status</div>
        <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              "needs-review",
              "hold-coverage",
              "hold-context",
              "approved",
              "rejected",
            ] as ChronicleReviewStatus[]
          ).map((s) => (
            <li key={s} className="flex items-center justify-between text-sm">
              <span
                className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${REVIEW_TONE[s]}`}
              >
                {s}
              </span>
              <span className="text-muted-foreground">{byReview.get(s) ?? 0}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Candidates ─────────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Chronicle candidates <span className="text-muted-foreground">· {ordered.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Newest first. Each row cites the source Memory Candidate it derives from and preserves the
          full Memory → Signal → Event → Tx/Block lineage. Proposed copy is this layer&rsquo;s own
          person-free Chronicle voice — a curator rewrites it on promotion. Nothing here is published.
        </p>

        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No chronicle candidates from the current sample.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Register</th>
                  <th className="px-3 py-2 font-medium">Category → hint</th>
                  <th className="px-3 py-2 font-medium">Tier</th>
                  <th className="px-3 py-2 font-medium">Proposed title / summary</th>
                  <th className="px-3 py-2 font-medium">Angle</th>
                  <th className="px-3 py-2 font-medium">Verification</th>
                  <th className="px-3 py-2 font-medium">Review</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                  <th className="px-3 py-2 font-medium">From memory</th>
                  <th className="px-3 py-2 font-medium">Source tx</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((c: ChronicleReviewCandidate) => (
                  <tr key={c.id} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${REGISTER_TONE[c.register]}`}
                      >
                        {REGISTER_LABEL[c.register]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{c.category}</code>
                      <span className="text-muted-foreground"> → </span>
                      <code className="mono text-foreground/60">{c.chronicleCategoryHint}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{c.tier}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="font-medium text-foreground/90">{c.proposedTitle}</div>
                      <div className="mt-0.5 text-muted-foreground">{c.proposedSummary}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/70">{c.proposedStoryAngle}</code>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${VERIFICATION_TONE[c.verificationStatus]}`}
                      >
                        {c.verificationStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${REVIEW_TONE[c.reviewStatus]}`}
                      >
                        {c.reviewStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className={`mono ${ACTION_TONE[c.recommendedAction]}`}>
                        {c.recommendedAction}
                      </code>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <code className="mono">{c.sourceMemoryCandidateId}</code>
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
    </div>
  );
}
