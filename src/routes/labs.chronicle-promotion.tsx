// src/routes/labs.chronicle-promotion.tsx
// INTERNAL · Chronicle Promotion layer — the Chronicle Review → Promotion bench.
//
// NOT marketing. An internal QA surface for the MINIMAL Chronicle Promotion layer
// (Sprint 5): a pure, deterministic projection of Chronicle Review Candidates into
// ChroniclePromotionDecisions that answer "does this deserve permanent protocol
// memory, and on which track?" — a BASELINE RECOMMENDATION ONLY. Nothing is
// published to the locked Chronicle, no Story/Recognition/governance is written,
// no contract or public UI is touched. Promotion is always a human act.
//
//   events → deriveSignals() → deriveMemoryCandidates()
//          → deriveChronicleReviewCandidates() → deriveChroniclePromotionDecisions()
//
// Doctrine on display:
//   • Adjacency Law — decisions read CHRONICLE REVIEW CANDIDATES only; lineage to
//     Memory → Signal → Event → Tx/Block is carried THROUGH the candidate.
//   • Precedence — unsafe copy → rejected; coverage-limited → hold-coverage;
//     otherwise the memory rules decide.
//   • Institutional rule — milestone/chapter/artifact/first-funding/seeding →
//     approved; deployment/removal/protocol-wallet acts → hold-context; recurring
//     market flow → rejected. Identity- AND amount-blind.
//   • Member rule — every member-living candidate is HELD (hold-context): the
//     member register is unratified and a member subject cannot enter the
//     protocol-institutional Chronicle (clause 6).
//   • Human act — reviewer is the deterministic baseline marker, timestamp is
//     null, and nothing is published.
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
import {
  INSTITUTIONAL_MEMORY_GUIDANCE,
  MEMBER_MEMORY_GUIDANCE,
  type ChroniclePromotionDecision,
  type ChroniclePromotionPath,
  type ChroniclePromotionVerdict,
} from "@/lib/chronicle-promotion-registry";
import type { MemoryRegister } from "@/lib/memory-candidate-registry";

export const Route = createFileRoute("/labs/chronicle-promotion")({
  head: () => ({
    meta: [
      { title: "Chronicle Promotion · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. The minimal Chronicle Review → Promotion layer — deterministic baseline verdicts, promotion paths, hold reasons, and full lineage — projected from the canonical pipeline. Read-only, no Chronicle automation, not for public use.",
      },
    ],
  }),
  component: ChroniclePromotionWorkbench,
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

const VERDICT_TONE: Record<ChroniclePromotionVerdict, string> = {
  approved:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  "hold-coverage":
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "hold-context":
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const PATH_TONE: Record<ChroniclePromotionPath, string> = {
  "institutional-memory": "text-amber-700 dark:text-amber-400",
  "member-memory": "text-emerald-700 dark:text-emerald-400",
  deferred: "text-muted-foreground",
  none: "text-destructive",
};

const VERDICTS: ChroniclePromotionVerdict[] = [
  "approved",
  "hold-context",
  "hold-coverage",
  "rejected",
];

function short(hash?: string): string {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

function ChroniclePromotionWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 48 });
  const [windowCoversDeployment, setWindowCoversDeployment] = useState(false);

  const decisions = useMemo(() => {
    const signals = deriveSignals(events, { windowCoversDeployment });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    return deriveChroniclePromotionDecisions(review);
  }, [events, windowCoversDeployment]);

  // Newest first for display (derivers return oldest → newest).
  const ordered = useMemo(() => [...decisions].reverse(), [decisions]);

  const byVerdict = useMemo(() => {
    const m = new Map<ChroniclePromotionVerdict, number>();
    for (const d of decisions) m.set(d.decision, (m.get(d.decision) ?? 0) + 1);
    return m;
  }, [decisions]);

  const approved = byVerdict.get("approved") ?? 0;
  const held =
    (byVerdict.get("hold-context") ?? 0) + (byVerdict.get("hold-coverage") ?? 0);
  const rejected = byVerdict.get("rejected") ?? 0;
  const cleanRationale = decisions.every((d) => d.rationaleViolations.length === 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the minimal Chronicle Promotion layer. Not marketing, not linked
          from public navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt.
          Every verdict is projected by the pure{" "}
          <code>deriveChroniclePromotionDecisions()</code> function from{" "}
          <code>deriveChronicleReviewCandidates()</code>. Each verdict is a deterministic{" "}
          <b>baseline recommendation</b> — promotion to the Chronicle is a human act. Nothing is
          published; nothing is written back.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Chronicle Promotion · Review → Promotion Decision Workbench
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The deterministic layer that answers <b>&ldquo;does this deserve permanent protocol
          memory?&rdquo;</b> Each Chronicle Review Candidate produces one baseline decision —{" "}
          <code>approved</code>, <code>rejected</code>, <code>hold-context</code>, or{" "}
          <code>hold-coverage</code> — with a <b>promotion path</b> and a person-free{" "}
          <b>rationale</b>. Verdicts read the candidate&rsquo;s <b>register × category × source kind</b>{" "}
          — never how much money moved, and never who acted. Decisions read Chronicle Review Candidates
          only (Adjacency Law) and never publish to the Chronicle.
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {[
            "Canonical event",
            "deriveSignals()",
            "deriveMemoryCandidates()",
            "deriveChronicleReviewCandidates()",
            "deriveChroniclePromotionDecisions()",
            "Promotion decision",
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
            Decisions: <b>{decisions.length}</b>
          </span>
          <span>
            Approved (baseline): <b>{approved}</b>
          </span>
          <span>
            Held: <b>{held}</b>
          </span>
          <span>
            Rejected: <b>{rejected}</b>
          </span>
          <span className={cleanRationale ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
            rationale clean: <b>{cleanRationale ? "holds" : "VIOLATED"}</b>
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
            deployment (verified vs. held <code>hold-coverage</code>)
          </span>
        </label>
        {!windowCoversDeployment && (
          <p className="mt-2 max-w-3xl text-[11px] text-muted-foreground">
            Off by default: the live workbench loads only a recent window, so coverage-dependent
            candidates stay <code>coverage-limited</code> upstream and are HELD here
            (<code>hold-coverage</code>) — never approved, and never asserting a protocol-wide
            &ldquo;first&rdquo;.
          </p>
        )}

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/chronicle-candidates" className="underline hover:no-underline">
            → Chronicle candidates (memory → chronicle workbench)
          </Link>
          <Link to="/labs/memory-candidates" className="underline hover:no-underline">
            → Memory candidates (signal → memory workbench)
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

      {/* ── Distribution by verdict ────────────────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">By verdict</div>
        <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-4">
          {VERDICTS.map((v) => (
            <li key={v} className="flex items-center justify-between text-sm">
              <span
                className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${VERDICT_TONE[v]}`}
              >
                {v}
              </span>
              <span className="text-muted-foreground">{byVerdict.get(v) ?? 0}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Decisions ──────────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Promotion decisions <span className="text-muted-foreground">· {ordered.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Newest first. Each row cites the Chronicle Review Candidate it decides on and preserves the
          full Chronicle → Memory → Signal → Event → Tx/Block lineage. Every verdict is an unstamped
          baseline (<code>reviewer = deterministic-baseline</code>, <code>timestamp = null</code>) a
          human curator confirms or overrides. Nothing here is published.
        </p>

        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No promotion decisions from the current sample.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Register</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Tier</th>
                  <th className="px-3 py-2 font-medium">Verdict</th>
                  <th className="px-3 py-2 font-medium">Path</th>
                  <th className="px-3 py-2 font-medium">Rule bucket</th>
                  <th className="px-3 py-2 font-medium">Rationale</th>
                  <th className="px-3 py-2 font-medium">From candidate</th>
                  <th className="px-3 py-2 font-medium">Source tx</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((d: ChroniclePromotionDecision) => (
                  <tr key={d.candidateId} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${REGISTER_TONE[d.register]}`}
                      >
                        {REGISTER_LABEL[d.register]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{d.category}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{d.tier}</code>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${VERDICT_TONE[d.decision]}`}
                      >
                        {d.decision}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className={`mono ${PATH_TONE[d.promotionPath]}`}>{d.promotionPath}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/70">{d.ruleBucket}</code>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{d.rationale}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <code className="mono">{d.candidateId}</code>
                    </td>
                    <td className="px-3 py-2">
                      <code className="mono text-[11px] text-muted-foreground">
                        {short(d.sourceTxHash)}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Promotion rule reference (documented guidance) ─────────────────── */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold tracking-tight">
            Institutional memory rules <span className="text-muted-foreground">· §3</span>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Protocol-institutional buckets. Significance is structural — never by identity, never by
            amount.
          </p>
          <ul className="mt-3 space-y-2">
            {INSTITUTIONAL_MEMORY_GUIDANCE.map((row) => (
              <li key={row.bucket} className="text-xs">
                <div className="flex items-center gap-2">
                  <code className="mono text-foreground/80">{row.bucket}</code>
                  <span
                    className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${VERDICT_TONE[row.baseline]}`}
                  >
                    {row.baseline}
                  </span>
                </div>
                <p className="mt-0.5 text-muted-foreground">{row.guidance}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold tracking-tight">
            Member memory rules <span className="text-muted-foreground">· §4</span>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            The member-living register is modelled but NOT ratified for permanent entries; clause 6
            forbids a member subject. Every member bucket is held.
          </p>
          <ul className="mt-3 space-y-2">
            {MEMBER_MEMORY_GUIDANCE.map((row) => (
              <li key={row.bucket} className="text-xs">
                <div className="flex items-center gap-2">
                  <code className="mono text-foreground/80">{row.bucket}</code>
                  <span
                    className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${VERDICT_TONE[row.baseline]}`}
                  >
                    {row.baseline}
                  </span>
                </div>
                <p className="mt-0.5 text-muted-foreground">{row.guidance}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
