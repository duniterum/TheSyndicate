// src/routes/labs.signals.tsx
// INTERNAL · Signals Engine — the Event → Signal derivation workbench.
//
// NOT marketing. An internal QA surface for the MINIMAL Signals Engine (Sprint
// 2): a pure, deterministic projection of the ONE canonical event stream into
// Signals (Type × Tier × Subject).
//
//   CanonicalProtocolEvent[] → deriveSignals() → Signal[]
//
// Doctrine on display:
//   • Adjacency Law — Signals read EVENTS only; never Memory / Recognition.
//   • Money rule (canon §4.5) — a person subject (member/wallet) is capped at
//     S2; protocol significance is emitted as SEPARATE milestone/protocol
//     signals. An amount can never, by itself, lift a person above S2.
//   • Coverage gate — true "firsts", ordinals, and cumulative-threshold
//     milestones appear only when the window covers deployment.
//
// Every value is read straight from useProtocolEvents() and projected by the
// pure deriver. Nothing fabricates a number, nothing is published, nothing is
// written back into the pipeline.
//
// noindex/nofollow (inherits the /labs layout); never linked from public nav;
// /labs/* is blocked in robots.txt and excluded from the sitemap.

import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProtocolEvents } from "@/lib/protocol-events";
import { deriveSignals } from "@/lib/protocol-signals";
import {
  SIGNAL_TIERS,
  SIGNAL_TYPES,
  isPersonSubject,
  type Signal,
  type SignalTier,
  type SignalType,
} from "@/lib/signal-registry";

export const Route = createFileRoute("/labs/signals")({
  head: () => ({
    meta: [
      { title: "Signals Engine · Foundation Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal foundation workbench. The minimal Event → Signal derivation engine — Type × Tier × Subject — projected from the one canonical event pipeline. Read-only, not for public use.",
      },
    ],
  }),
  component: SignalsWorkbench,
});

const TIER_TONE: Record<SignalTier, string> = {
  S0: "border-border text-muted-foreground",
  S1: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  S2: "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  S3: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  S4: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  S5: "border-destructive/50 bg-destructive/10 text-destructive",
};

const TIER_NOTE: Record<SignalTier, string> = {
  S0: "noise",
  S1: "standard activity",
  S2: "recognized action",
  S3: "protocol milestone",
  S4: "historical event",
  S5: "constitutional event",
};

function short(hash?: string): string {
  if (!hash) return "—";
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

function SignalsWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 48 });
  const [windowCoversDeployment, setWindowCoversDeployment] = useState(false);

  const signals = useMemo(
    () => deriveSignals(events, { windowCoversDeployment }),
    [events, windowCoversDeployment],
  );

  // Newest first for display (deriver returns oldest → newest).
  const ordered = useMemo(() => [...signals].reverse(), [signals]);

  const byType = useMemo(() => {
    const m = new Map<SignalType, number>();
    for (const t of SIGNAL_TYPES) m.set(t, 0);
    for (const s of signals) m.set(s.type, (m.get(s.type) ?? 0) + 1);
    return m;
  }, [signals]);

  const byTier = useMemo(() => {
    const m = new Map<SignalTier, number>();
    for (const t of SIGNAL_TIERS) m.set(t, 0);
    for (const s of signals) m.set(s.tier, (m.get(s.tier) ?? 0) + 1);
    return m;
  }, [signals]);

  const personSignals = useMemo(
    () => signals.filter((s) => isPersonSubject(s.subject)),
    [signals],
  );
  const personCeilingOk = personSignals.every(
    (s) => s.tier === "S0" || s.tier === "S1" || s.tier === "S2",
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Foundation workbench for the minimal Signals Engine. Not marketing, not linked from public
          navigation, <code>noindex</code>, blocked by <code>/labs</code> in robots.txt. Every value
          is projected by the pure <code>deriveSignals()</code> function from{" "}
          <code>useProtocolEvents()</code>. Nothing is published; nothing is written back.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · foundation workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Signals Engine · Event → Signal Workbench
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The deterministic derivation layer: each canonical event is projected into one or more
          Signals classified by <b>Type × Tier × Subject</b>. Signals read events only (Adjacency
          Law). A person subject (member/wallet) is capped at <b>S2</b>; protocol significance is
          emitted as separate milestone/protocol signals. Same events always produce the same signals.
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {["Canonical event", "deriveSignals()", "Signal (Type × Tier × Subject)"].map(
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
            Signals derived: <b>{signals.length}</b>
          </span>
          <span>
            Person-subject signals: <b>{personSignals.length}</b>
          </span>
          <span className={personCeilingOk ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}>
            person ≤ S2: <b>{personCeilingOk ? "holds" : "VIOLATED"}</b>
          </span>
        </div>

        {/* Coverage toggle — gates "first ever" / ordinal / threshold signals */}
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
          <input
            type="checkbox"
            checked={windowCoversDeployment}
            onChange={(e) => setWindowCoversDeployment(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          <span className="text-foreground/80">
            <code>windowCoversDeployment</code> — treat the loaded window as a gapless scan back to
            deployment (unlocks ordinal, cumulative-threshold &amp; first-of-kind milestones)
          </span>
        </label>
        {!windowCoversDeployment && (
          <p className="mt-2 max-w-3xl text-[11px] text-muted-foreground">
            Off by default: the live workbench loads only a recent window, so no protocol-wide
            &ldquo;first&rdquo; or cumulative milestone is asserted from a partial sample.
          </p>
        )}

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/protocol-events" className="underline hover:no-underline">
            → Protocol event pipeline (event workbench)
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
          <div className="text-xs uppercase tracking-wide text-muted-foreground">By type</div>
          <ul className="mt-3 space-y-1.5">
            {SIGNAL_TYPES.map((t) => (
              <li key={t} className="flex items-center justify-between text-sm">
                <code className="mono text-foreground/80">{t}</code>
                <span className="text-muted-foreground">{byType.get(t) ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">By tier</div>
          <ul className="mt-3 space-y-1.5">
            {SIGNAL_TIERS.map((t) => (
              <li key={t} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${TIER_TONE[t]}`}
                  >
                    {t}
                  </span>
                  <span className="text-muted-foreground">{TIER_NOTE[t]}</span>
                </span>
                <span className="text-muted-foreground">{byTier.get(t) ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Derived signals ────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Derived signals <span className="text-muted-foreground">· {ordered.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Newest first. Each row cites the source event it derives from and mirrors that event&rsquo;s
          verification status — a Signal asserts nothing the event did not.
        </p>

        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No signals derived from the current sample.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Tier</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Subject</th>
                  <th className="px-3 py-2 font-medium">Reason</th>
                  <th className="px-3 py-2 font-medium">From event</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Source tx</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((s: Signal) => (
                  <tr key={s.id} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2">
                      <span
                        className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${TIER_TONE[s.tier]}`}
                        title={TIER_NOTE[s.tier]}
                      >
                        {s.tier}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <code className="mono text-foreground/80">{s.type}</code>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={
                          isPersonSubject(s.subject)
                            ? "text-foreground/80"
                            : "text-amber-700 dark:text-amber-400"
                        }
                      >
                        {s.subject}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-foreground/80">{s.reason}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <code className="mono">{s.createdFrom}</code>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{s.verification}</td>
                    <td className="px-3 py-2">
                      <code className="mono text-[11px] text-muted-foreground">
                        {short(s.sourceTxHash)}
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
