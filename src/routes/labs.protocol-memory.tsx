// src/routes/labs.protocol-memory.tsx
// INTERNAL · Protocol Memory, Recognition & Reporting — the foundation workbench.
//
// NOT marketing. An internal design + QA surface for the STRICTLY ADDITIVE data
// leaves that derive from the ONE canonical event pipeline:
//
//   CanonicalProtocolEvent → ledger entry (factual money movement)
//                          → chronicle candidate (protocol-voice, advisory)
//                          → founder-action classification
//   member facts           → recognition candidate (anonymous by default)
//   (reserved)             → future referral attribution (PENDING)
//   (architecture)         → report registry (PENDING)
//
// Every value here is either read straight from useProtocolEvents() or from a
// static registry. Nothing fabricates a number, no report is generated, no
// reward is paid, and no member identity is claimed. Chronicle candidates are
// ADVISORY only — none is auto-published; the locked Chronicle is never touched.
//
// noindex/nofollow (inherits the /labs layout); never linked from public nav;
// /labs/* is blocked in robots.txt and excluded from the sitemap.

import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProtocolEvents, type CanonicalProtocolEvent } from "@/lib/protocol-events";
import {
  deriveChronicleCandidates,
  type ChronicleCandidate,
} from "@/lib/chronicle-candidates";
import {
  deriveLedgerEntries,
  LEDGER_CATEGORY_LABEL,
  LEDGER_LEGAL_NOTE,
  type ProtocolLedgerEntry,
} from "@/lib/protocol-ledger";
import {
  FOUNDER_ACTION_LABEL,
  FOUNDER_ACTION_NOTE,
  type FounderActionCategory,
} from "@/lib/founder-actions";
import {
  RECOGNITION_DISPLAY_RULES,
  RECOGNITION_KIND_BASIS,
  RECOGNITION_LEGAL_NOTE,
  DEFAULT_DISPLAY_TIER,
} from "@/lib/recognition-candidates";
import {
  FUTURE_REFERRAL_NOTE,
  FUTURE_REFERRAL_REWARD_STATUS,
} from "@/lib/future-referral";
import { REPORT_REGISTRY, REPORT_CADENCE_LABEL } from "@/lib/report-registry";

export const Route = createFileRoute("/labs/protocol-memory")({
  head: () => ({
    meta: [
      { title: "Protocol Memory & Recognition · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. Chronicle candidates, recognition rules, the protocol ledger, founder actions, the report registry, and the reserved referral model — all derived from the one canonical pipeline. Not for public use.",
      },
    ],
  }),
  component: ProtocolMemoryWorkbench,
});

const WORTHINESS_TONE: Record<ChronicleCandidate["worthiness"], string> = {
  always: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  sometimes: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  "activity-only": "border-border text-muted-foreground",
};

const FOUNDER_ACTION_ORDER: FounderActionCategory[] = [
  "founder-burn",
  "founder-funded-operations",
  "founder-funded-vault",
  "founder-funded-liquidity",
  "founder-allocation-movement",
];

function short(hash?: string): string {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

function ProtocolMemoryWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 24 });

  const candidates = useMemo(() => deriveChronicleCandidates(events), [events]);
  const ledger = useMemo(() => deriveLedgerEntries(events), [events]);
  const founderEvents = useMemo(
    () => events.filter((e) => e.founderAction),
    [events],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the additive memory, recognition &amp; reporting leaves. Not
          marketing, not linked from public navigation, <code>noindex</code>, blocked by{" "}
          <code>/labs</code> in robots.txt. Every value is read from{" "}
          <code>useProtocolEvents()</code> or a static registry. Chronicle candidates are{" "}
          <b>advisory only</b> — none is auto-published; no report is generated; no reward is paid;
          no member identity is claimed.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Protocol Memory, Recognition &amp; Reporting · Foundation Workbench
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The additive data leaves that turn the canonical event stream into protocol memory. Each
          leaf is a pure derivation — it adds no contract, scans no new source, and never invents a
          value. This is their map; the registries and the event pipeline remain the one source.
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {[
            "Canonical event",
            "Ledger entry",
            "Chronicle candidate",
            "Founder action",
            "Recognition",
            "Report (PENDING)",
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
            Chronicle candidates: <b>{candidates.length}</b>
          </span>
          <span>
            Ledger entries: <b>{ledger.length}</b>
          </span>
          <span>
            Founder actions: <b>{founderEvents.length}</b>
          </span>
          <span>
            Reports (PENDING): <b>{REPORT_REGISTRY.length}</b>
          </span>
        </div>

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/protocol-events" className="underline hover:no-underline">
            → Protocol event pipeline (event workbench)
          </Link>
          <a href="#chronicle" className="underline hover:no-underline">
            → Chronicle candidates
          </a>
          <a href="#ledger" className="underline hover:no-underline">
            → Protocol ledger
          </a>
          <a href="#founder" className="underline hover:no-underline">
            → Founder actions
          </a>
          <a href="#recognition" className="underline hover:no-underline">
            → Recognition
          </a>
          <a href="#reports" className="underline hover:no-underline">
            → Report registry
          </a>
          <a href="#referral" className="underline hover:no-underline">
            → Future referral
          </a>
        </nav>
      </header>

      {isLoading && (
        <p className="mt-10 text-sm text-muted-foreground">Loading on-chain events…</p>
      )}
      {isError && !isLoading && (
        <p className="mt-10 text-sm text-muted-foreground">
          Live read unavailable right now — the derivations degrade rather than fabricating rows.
        </p>
      )}

      {/* ── Chronicle candidates ───────────────────────────────────────────── */}
      <section id="chronicle" className="mt-12 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Chronicle candidates <span className="text-muted-foreground">· {candidates.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Protocol-primitive milestones derived from eligible events (person-subject kinds never
          qualify). Each carries protocol-voice suggested copy that passes the constitutional
          vocabulary gate. <b>Advisory only</b> — default status is <code>CANDIDATE</code>; nothing
          is auto-published and the locked Chronicle is never modified here.
        </p>

        {candidates.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No chronicle-worthy events in the current sample.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {candidates.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <code className="mono text-sm font-semibold text-foreground">{c.kind}</code>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${WORTHINESS_TONE[c.worthiness]}`}
                    >
                      {c.worthiness}
                    </span>
                    <span className="mono rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {c.status}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{c.reason}</p>

                <div className="mt-3 rounded border border-border bg-background p-3">
                  <div className="text-sm font-medium text-foreground">{c.suggestedTitle}</div>
                  <p className="mt-1 text-xs text-foreground/80">{c.suggestedBody}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    <span className="uppercase tracking-wide">What changed:</span>{" "}
                    {c.suggestedWhatChanged}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-muted-foreground">
                    Subject: <code className="text-foreground/80">{c.subjectHint}</code>
                  </span>
                  <span className="text-muted-foreground">
                    Promotable:{" "}
                    <span className={c.promotable ? "text-emerald-700 dark:text-emerald-400" : ""}>
                      {c.promotable ? "yes" : "no"}
                    </span>
                  </span>
                  <span
                    className={
                      c.copyViolations.length === 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-destructive"
                    }
                  >
                    {c.copyViolations.length === 0
                      ? "copy clean"
                      : `${c.copyViolations.length} copy violation(s)`}
                  </span>
                  {c.verifyHref && (
                    <a
                      href={c.verifyHref}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:no-underline"
                    >
                      verify
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Protocol ledger ────────────────────────────────────────────────── */}
      <section id="ledger" className="mt-14 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Protocol ledger <span className="text-muted-foreground">· {ledger.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Factual money movement joined with the manual tag registry. A <b>purpose</b> is shown only
          when a transaction is manually classified; otherwise it reads the literal{" "}
          <code>unknown</code>. Nothing is inferred. {LEDGER_LEGAL_NOTE}
        </p>

        {ledger.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No ledger entries in the current sample.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">From → To</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Purpose</th>
                  <th className="px-3 py-2 font-medium">Tag</th>
                  <th className="px-3 py-2 font-medium">Tx</th>
                  <th className="px-3 py-2 font-medium">Proof</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((l: ProtocolLedgerEntry) => (
                  <tr key={l.id} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2 text-xs text-foreground/80">
                      {LEDGER_CATEGORY_LABEL[l.category]}
                    </td>
                    <td className="px-3 py-2 text-xs text-foreground/80">
                      {l.fromLabel}
                      {l.toLabel ? ` → ${l.toLabel}` : ""}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {l.amount !== undefined ? `${l.amount} ${l.token ?? ""}`.trim() : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {l.purpose === "unknown" ? (
                        <span className="text-muted-foreground">unknown</span>
                      ) : (
                        <span className="text-foreground/80">{l.purpose}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {l.isManualTag ? (
                        <span className="text-emerald-700 dark:text-emerald-400">manual</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <code className="mono text-[11px] text-muted-foreground">{short(l.txHash)}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {l.verifyHref ? (
                        <a
                          href={l.verifyHref}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:no-underline"
                        >
                          verify
                        </a>
                      ) : (
                        <span className="text-muted-foreground">no proof</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Founder actions ────────────────────────────────────────────────── */}
      <section id="founder" className="mt-14 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Founder actions{" "}
          <span className="text-muted-foreground">· {FOUNDER_ACTION_ORDER.length} categories</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Classified only when the sender is the founder wallet. Founder support is structural and
          recognition-only — there is no buyback, no automation, and no return is implied. The
          classification is attached to the event as an optional <code>founderAction</code> field;
          existing consumers are unaffected.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {FOUNDER_ACTION_ORDER.map((cat) => {
            const live = founderEvents.filter((e) => e.founderAction === cat).length;
            return (
              <div key={cat} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-medium text-foreground">{FOUNDER_ACTION_LABEL[cat]}</div>
                  <span className="mono rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {live} in sample
                  </span>
                </div>
                <code className="mono mt-1 block text-[11px] text-muted-foreground">{cat}</code>
                <p className="mt-2 text-xs text-foreground/80">{FOUNDER_ACTION_NOTE[cat]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Recognition ────────────────────────────────────────────────────── */}
      <section id="recognition" className="mt-14 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">Recognition</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Member-subject acknowledgement of an on-chain action. Default display tier is{" "}
          <code>{DEFAULT_DISPLAY_TIER}</code> — a member is shown only as a public registry number.
          {" "}
          {RECOGNITION_LEGAL_NOTE}
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Display tiers</div>
            <ul className="mt-2 space-y-2">
              {RECOGNITION_DISPLAY_RULES.map((r) => (
                <li key={r.tier} className="text-sm">
                  <span className="font-medium text-foreground">{r.label}</span>
                  {r.tier === DEFAULT_DISPLAY_TIER && (
                    <span className="mono ml-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                      default
                    </span>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Recognition basis
            </div>
            <ul className="mt-2 space-y-2">
              {Object.entries(RECOGNITION_KIND_BASIS).map(([kind, basis]) => (
                <li key={kind} className="text-sm">
                  <code className="mono text-xs font-medium text-foreground">{kind}</code>
                  <p className="mt-0.5 text-xs text-foreground/80">{basis}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Report registry ────────────────────────────────────────────────── */}
      <section id="reports" className="mt-14 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Report registry{" "}
          <span className="text-muted-foreground">· {REPORT_REGISTRY.length} · PENDING</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Architecture only. Each report declares its cadence and the canonical sources it would
          derive from. <b>No report is generated</b> and every report is PENDING — the data layer is
          simply ready before any report page exists.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {REPORT_REGISTRY.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-medium text-foreground">{r.title}</div>
                <span className="mono rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {REPORT_CADENCE_LABEL[r.cadence]} · {r.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-foreground/80">{r.summary}</p>
              <div className="mt-3 text-xs">
                <div className="uppercase tracking-wide text-muted-foreground">
                  Derives from · {r.derivesFrom.metricIds.length} metrics
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {r.derivesFrom.metricIds.map((id) => (
                    <code
                      key={id}
                      className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-foreground/80"
                    >
                      {id}
                    </code>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span>ledger: {r.derivesFrom.usesLedger ? "yes" : "no"}</span>
                  <span>chronicle: {r.derivesFrom.usesChronicleCandidates ? "yes" : "no"}</span>
                  <span>recognition: {r.derivesFrom.usesRecognitionCandidates ? "yes" : "no"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Future referral ────────────────────────────────────────────────── */}
      <section id="referral" className="mt-14 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Future referral <span className="text-muted-foreground">· reserved · PENDING</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          A reserved attribution MODEL — distinct from the SIMULATED UX preview. No referral
          contract exists; nothing is scanned, emitted, or paid. The namespace is intentionally kept
          OUT of <code>ProtocolEventKind</code>.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Reward status
            </span>
            <span className="mono rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {FUTURE_REFERRAL_REWARD_STATUS}
            </span>
          </div>
          <p className="mt-2 text-xs text-foreground/80">{FUTURE_REFERRAL_NOTE}</p>
          <div className="mt-3 text-xs">
            <div className="uppercase tracking-wide text-muted-foreground">Model fields</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {["referrerMember", "newMember", "saleUsdc", "usdcRouted", "synSold", "rewardStatus"].map(
                (f) => (
                  <code
                    key={f}
                    className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-foreground/80"
                  >
                    {f}
                  </code>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
        Sources of truth: <code>src/lib/protocol-events.ts</code> (canonical events),{" "}
        <code>src/lib/chronicle-candidates.ts</code>, <code>src/lib/recognition-candidates.ts</code>,{" "}
        <code>src/lib/protocol-ledger.ts</code>, <code>src/lib/founder-actions.ts</code>,{" "}
        <code>src/lib/future-referral.ts</code>, <code>src/lib/report-registry.ts</code>. Each is a
        pure derivation of the one pipeline — additive, advisory, and never a source of new truth.
      </footer>
    </div>
  );
}
