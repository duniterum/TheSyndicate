// src/routes/labs.memory-candidates.tsx
// INTERNAL · Memory Candidate layer — the Signal → Memory Candidate workbench.
//
// NOT marketing. An internal QA surface for the MINIMAL Memory Candidate layer
// (Sprint 3): a pure, deterministic projection of the Signal stream into
// MemoryCandidates that PROPOSE "this is worth remembering" — without publishing
// anything to the locked Chronicle.
//
//   CanonicalProtocolEvent[] → deriveSignals() → deriveMemoryCandidates()
//
// Doctrine on display:
//   • Adjacency Law — candidates read SIGNALS only; lineage to the event is
//     carried through the Signal, never re-read.
//   • Register from SUBJECT — a person subject (member/wallet) produces a
//     member-living candidate; a protocol primitive produces a
//     protocol-institutional one. (burn is the one dual-register category.)
//   • Coverage gate — no protocol-wide "first" is asserted unless the window
//     covers deployment; continuity stays window-relative (coverage-limited).
//   • No automation — promotion to the Chronicle is a human act; the only
//     recommended actions are "review" and "hold-coverage".
//
// noindex/nofollow (inherits the /labs layout); never linked from public nav;
// /labs/* is blocked in robots.txt and excluded from the sitemap.

import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProtocolEvents } from "@/lib/protocol-events";
import { deriveSignals } from "@/lib/protocol-signals";
import { deriveMemoryCandidates } from "@/lib/memory-candidates";
import {
  MEMORY_CATEGORIES,
  type MemoryCandidate,
  type MemoryRegister,
  type MemoryVerification,
} from "@/lib/memory-candidate-registry";

export const Route = createFileRoute("/labs/memory-candidates")({
  head: () => ({
    meta: [
      { title: "Memory Candidates · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. The minimal Signal → Memory Candidate layer — register, category, verification — projected from the canonical event pipeline. Read-only, no Chronicle automation, not for public use.",
      },
    ],
  }),
  component: MemoryCandidatesWorkbench,
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

const VERIFICATION_TONE: Record<MemoryVerification, string> = {
  verified: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "coverage-limited": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  pending: "border-border text-muted-foreground",
};

function short(hash?: string): string {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

function MemoryCandidatesWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 48 });
  const [windowCoversDeployment, setWindowCoversDeployment] = useState(false);

  const candidates = useMemo(() => {
    const signals = deriveSignals(events, { windowCoversDeployment });
    return deriveMemoryCandidates(signals);
  }, [events, windowCoversDeployment]);

  // Newest first for display (derivers return oldest → newest).
  const ordered = useMemo(() => [...candidates].reverse(), [candidates]);

  const byRegister = useMemo(() => {
    const m = new Map<MemoryRegister, number>();
    m.set("protocol-institutional", 0);
    m.set("member-living", 0);
    for (const c of candidates) m.set(c.register, (m.get(c.register) ?? 0) + 1);
    return m;
  }, [candidates]);

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of candidates) m.set(c.category, (m.get(c.category) ?? 0) + 1);
    return m;
  }, [candidates]);

  const cleanCopy = candidates.every((c) => c.copyViolations.length === 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the minimal Memory Candidate layer. Not marketing, not linked from
          public navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt. Every
          value is projected by the pure <code>deriveMemoryCandidates()</code> function from{" "}
          <code>deriveSignals()</code>. Nothing is published to the Chronicle; nothing is written back.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Memory Candidates · Signal → Memory Workbench
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The deterministic layer that PROPOSES what is worth remembering. Each Signal may produce one
          candidate, classified by <b>register × category</b>. The register is derived from the
          Signal&rsquo;s <b>subject</b> (a person → member-living; a protocol primitive →
          protocol-institutional), never from how much money moved. Candidates read Signals only
          (Adjacency Law) and never publish to the Chronicle — promotion is a human act.
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {["Canonical event", "deriveSignals()", "deriveMemoryCandidates()", "Memory candidate"].map(
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
            Candidates: <b>{candidates.length}</b>
          </span>
          <span>
            Protocol/institutional: <b>{byRegister.get("protocol-institutional") ?? 0}</b>
          </span>
          <span>
            Member/living: <b>{byRegister.get("member-living") ?? 0}</b>
          </span>
          <span className={cleanCopy ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
            copy clean: <b>{cleanCopy ? "holds" : "VIOLATED"}</b>
          </span>
        </div>

        {/* Coverage toggle — gates "first ever" / first-funding candidates */}
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
          <input
            type="checkbox"
            checked={windowCoversDeployment}
            onChange={(e) => setWindowCoversDeployment(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          <span className="text-foreground/80">
            <code>windowCoversDeployment</code> — treat the loaded window as a gapless scan back to
            deployment (unlocks first-funding candidates; verifies window-relative continuity)
          </span>
        </label>
        {!windowCoversDeployment && (
          <p className="mt-2 max-w-3xl text-[11px] text-muted-foreground">
            Off by default: the live workbench loads only a recent window, so no protocol-wide
            &ldquo;first&rdquo; is asserted and repeat-participation candidates stay coverage-limited.
          </p>
        )}

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/signals" className="underline hover:no-underline">
            → Signals engine (event → signal workbench)
          </Link>
          <Link to="/labs/protocol-memory" className="underline hover:no-underline">
            → Protocol memory &amp; recognition (foundation workbench)
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

      {/* ── Distribution ───────────────────────────────────────────────────── */}
      <section className="mt-12 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">By register</div>
          <ul className="mt-3 space-y-1.5">
            {(["protocol-institutional", "member-living"] as MemoryRegister[]).map((r) => (
              <li key={r} className="flex items-center justify-between text-sm">
                <span
                  className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${REGISTER_TONE[r]}`}
                >
                  {REGISTER_LABEL[r]}
                </span>
                <span className="text-muted-foreground">{byRegister.get(r) ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">By category</div>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {MEMORY_CATEGORIES.map((cat) => (
              <li key={cat} className="flex items-center justify-between text-sm">
                <code className="mono text-foreground/80">{cat}</code>
                <span className="text-muted-foreground">{byCategory.get(cat) ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Candidates ─────────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Memory candidates <span className="text-muted-foreground">· {ordered.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Newest first. Each row cites the source Signal it derives from and mirrors that Signal&rsquo;s
          verification lineage — a candidate asserts nothing the Signal did not, and proposes only
          &ldquo;review&rdquo; or &ldquo;hold-coverage&rdquo;.
        </p>

        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No memory candidates from the current sample.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Register</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Subject</th>
                  <th className="px-3 py-2 font-medium">Title / summary</th>
                  <th className="px-3 py-2 font-medium">Verification</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                  <th className="px-3 py-2 font-medium">From signal</th>
                  <th className="px-3 py-2 font-medium">Source tx</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((c: MemoryCandidate) => (
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
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={
                          c.subject === "member" || c.subject === "wallet"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-amber-700 dark:text-amber-400"
                        }
                      >
                        {c.subject}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="font-medium text-foreground/90">{c.title}</div>
                      <div className="mt-0.5 text-muted-foreground">{c.summary}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${VERIFICATION_TONE[c.verification]}`}
                      >
                        {c.verification}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <code className="mono">{c.recommendedAction}</code>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <code className="mono">{c.createdFrom}</code>
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
