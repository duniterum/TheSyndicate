// src/routes/labs.institutional-register.tsx
// INTERNAL · Institutional Register layer — the Promotion → Register inspection bench.
//
// NOT marketing. An internal QA surface for the MINIMAL Institutional Register
// layer (Sprint 6): a pure, deterministic projection of ChroniclePromotionDecisions
// into InstitutionalRegisterEntries — the durable protocol-memory store that
// receives APPROVED protocol-institutional decisions. Nothing is published to the
// public Chronicle, no Story/Recognition/governance/member register is written, no
// contract or public UI is touched, and no existing Chronicle entry is mutated.
// Promotion to an `active` durable entry is always a human / governance act.
//
//   events → deriveSignals() → deriveMemoryCandidates()
//          → deriveChronicleReviewCandidates() → deriveChroniclePromotionDecisions()
//          → deriveInstitutionalRegister()
//
// Doctrine on display:
//   • Adjacency Law — entries read CHRONICLE PROMOTION DECISIONS only; lineage to
//     Promotion → Chronicle → Memory → Signal → Event → Tx/Block is carried THROUGH
//     the decision.
//   • Register rule — only protocol-institutional decisions create entries; every
//     member-living decision is EXCLUDED (the member register is reserved for DAO
//     ratification, clause 6).
//   • Status — approved → draft (active iff human-finalised AND coverage-ok);
//     hold-* → held; rejected → rejected. Durable memory, NOT public publishing.
//   • Coverage — a coverage-limited entry is held and asserts no historic "first".
//   • Identity- AND amount-blind — copy is generated protocol-centrically from the
//     decision's register/category/rule bucket, never from who acted or how much.
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
import {
  INSTITUTIONAL_EVENT_CLASSES,
  type InstitutionalEntryStatus,
  type InstitutionalRegisterEntry,
  type InstitutionalVerificationStatus,
} from "@/lib/institutional-register-registry";

export const Route = createFileRoute("/labs/institutional-register")({
  head: () => ({
    meta: [
      { title: "Institutional Register · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. The minimal Chronicle Promotion → Institutional Register layer — deterministic durable protocol-memory entries with status, verification, and full lineage — projected from the canonical pipeline. Read-only, no publishing, not for public use.",
      },
    ],
  }),
  component: InstitutionalRegisterWorkbench,
});

const STATUS_TONE: Record<InstitutionalEntryStatus, string> = {
  active:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  draft: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  held: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
};

const VERIFICATION_TONE: Record<InstitutionalVerificationStatus, string> = {
  verified: "text-emerald-700 dark:text-emerald-400",
  "coverage-limited": "text-amber-700 dark:text-amber-400",
  locked: "text-sky-700 dark:text-sky-400",
};

const STATUSES: InstitutionalEntryStatus[] = ["active", "draft", "held", "rejected"];

function short(hash?: string): string {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

function InstitutionalRegisterWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 48 });
  const [windowCoversDeployment, setWindowCoversDeployment] = useState(false);

  const { entries, decisionCount, excludedMemberLiving } = useMemo(() => {
    const signals = deriveSignals(events, { windowCoversDeployment });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    const decisions = deriveChroniclePromotionDecisions(review);
    const reg = deriveInstitutionalRegister(decisions);
    const excluded = decisions.filter((d) => d.register !== "protocol-institutional").length;
    return { entries: reg, decisionCount: decisions.length, excludedMemberLiving: excluded };
  }, [events, windowCoversDeployment]);

  // Newest first for display (derivers return oldest → newest).
  const ordered = useMemo(() => [...entries].reverse(), [entries]);

  const byStatus = useMemo(() => {
    const m = new Map<InstitutionalEntryStatus, number>();
    for (const e of entries) m.set(e.entryStatus, (m.get(e.entryStatus) ?? 0) + 1);
    return m;
  }, [entries]);

  const active = byStatus.get("active") ?? 0;
  const draft = byStatus.get("draft") ?? 0;
  const held = byStatus.get("held") ?? 0;
  const rejected = byStatus.get("rejected") ?? 0;
  const cleanCopy = entries.every((e) => e.copyViolations.length === 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the minimal Institutional Register layer. Not marketing, not linked
          from public navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt.
          Every entry is projected by the pure <code>deriveInstitutionalRegister()</code> function from{" "}
          <code>deriveChroniclePromotionDecisions()</code>. An entry is <b>durable protocol memory</b>,
          not public publishing — nothing is published to the Chronicle, no existing entry is mutated,
          and promotion to an <code>active</code> entry is a human / governance act.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Institutional Register · Promotion → Register Inspection
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The durable store that receives <b>approved protocol-institutional</b> promotion decisions.
          Each decision projects to one <code>InstitutionalRegisterEntry</code> with a strict status —{" "}
          <code>draft</code>, <code>active</code>, <code>held</code>, or <code>rejected</code> — a
          verification posture, generated <b>protocol-centric</b> copy, and the full
          Promotion → Chronicle → Memory → Signal → Event → Tx/Block lineage. Entries read promotion
          decisions only (Adjacency Law). <b>Member-living decisions are excluded entirely</b> (the
          member register is reserved for DAO ratification).
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {[
            "Canonical event",
            "deriveSignals()",
            "deriveMemoryCandidates()",
            "deriveChronicleReviewCandidates()",
            "deriveChroniclePromotionDecisions()",
            "deriveInstitutionalRegister()",
            "Register entry",
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
            Promotion decisions: <b>{decisionCount}</b>
          </span>
          <span>
            Register entries: <b>{entries.length}</b>
          </span>
          <span>
            Active: <b>{active}</b>
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
            entries stay <code>coverage-limited</code> and are <code>held</code> — never active, and
            never asserting a protocol-wide &ldquo;first&rdquo;.
          </p>
        )}

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/chronicle-promotion" className="underline hover:no-underline">
            → Chronicle promotion (chronicle → promotion workbench)
          </Link>
          <Link to="/labs/chronicle-candidates" className="underline hover:no-underline">
            → Chronicle candidates (memory → chronicle workbench)
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

      {/* ── Distribution by status ──────────────────────────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">By entry status</div>
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

      {/* ── Entries ─────────────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Register entries <span className="text-muted-foreground">· {ordered.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Newest first. Each row cites the promotion decision it derives from and preserves the full
          lineage. Copy is generated protocol-centrically; an <code>active</code> entry requires a human
          / governance sign-off — the baseline derivation produces drafts and holds, never an
          auto-published record.
        </p>

        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No register entries from the current sample.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Verification</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Rule bucket</th>
                  <th className="px-3 py-2 font-medium">From decision</th>
                  <th className="px-3 py-2 font-medium">Source tx</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((e: InstitutionalRegisterEntry) => (
                  <tr key={e.id} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${STATUS_TONE[e.entryStatus]}`}
                      >
                        {e.entryStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className={`mono ${VERIFICATION_TONE[e.verificationStatus]}`}>
                        {e.verificationStatus}
                      </code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{e.category}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="font-medium text-foreground">{e.title}</div>
                      <div className="mt-0.5 text-muted-foreground">{e.summary}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/70">{e.createdFrom}</code>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <code className="mono">{e.sourcePromotionDecisionId}</code>
                    </td>
                    <td className="px-3 py-2">
                      <code className="mono text-[11px] text-muted-foreground">
                        {short(e.sourceTxHash)}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Institutional event classes (documented §6) ─────────────────────── */}
      <section className="mt-12 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold tracking-tight">
          Institutional event classes <span className="text-muted-foreground">· §6</span>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          The classes the register supports today (<code>live</code>) or reserves for the future
          (<code>reserved</code>). A reserved class is declared so the vocabulary stays stable — the
          deriver never invents a live fact for it.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {INSTITUTIONAL_EVENT_CLASSES.map((c) => (
            <li key={c.class} className="text-xs">
              <div className="flex items-center gap-2">
                <code className="mono text-foreground/80">{c.class}</code>
                <span
                  className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${
                    c.availability === "live"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {c.availability}
                </span>
              </div>
              <p className="mt-0.5 text-muted-foreground">{c.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
