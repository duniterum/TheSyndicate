// src/components/syndicate/InstitutionalRegisterView.tsx
// PUBLIC, read-only VIEW over the Institutional Register (Sprint 7).
//
// Exposes durable protocol memory as a verifiable surface. It is NOT Story, NOT
// Recognition, NOT the public Chronicle, and it publishes nothing. Every row is
// projected by the pure pipeline (events → … → deriveInstitutionalRegister) and
// then filtered to the public-safe set (active + draft) by
// selectPublicInstitutionalEntries(). Held / rejected entries stay internal
// (the /labs workbench renders the full set); member-living decisions never reach
// this layer at all.
//
// Doctrine on display:
//   • Verifiable — each entry carries the full Promotion → Chronicle → Memory →
//     Signal → Event → Tx/Block lineage; the source transaction links to the
//     explorer.
//   • No hidden claim is final — a `draft` is labelled "awaiting finalisation",
//     never as accepted memory.
//   • Sober institutional voice — copy is protocol-centric, person-free, and
//     money-free; it confers no rights, governance, or financial value.

import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { GlassCard, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import { useProtocolEvents } from "@/lib/protocol-events";
import { deriveSignals } from "@/lib/protocol-signals";
import { deriveMemoryCandidates } from "@/lib/memory-candidates";
import { deriveChronicleReviewCandidates } from "@/lib/chronicle-review-candidates";
import { deriveChroniclePromotionDecisions } from "@/lib/chronicle-promotion";
import { deriveInstitutionalRegister } from "@/lib/institutional-register";
import { deriveGenesisRegisterEntries } from "@/lib/institutional-register-genesis";
import { deriveProtocolLifecycleRegisterEntries } from "@/lib/institutional-register-lifecycle";
import {
  selectPublicInstitutionalEntries,
  mergeInstitutionalEntries,
  deriveRegisterStatus,
  isLineageComplete,
  type RegisterDataStatus,
  type RegisterStatus,
} from "@/lib/institutional-register-public";
import {
  INSTITUTIONAL_EVENT_CLASSES,
  type InstitutionalRegisterEntry,
  type InstitutionalVerificationStatus,
} from "@/lib/institutional-register-registry";
import { txExplorerUrl } from "@/lib/syndicate-config";

// The public view reads a bounded, newest-first LIVE event window AND merges a
// curated set of verified/locked protocol-birth GENESIS SEEDS that predate the
// scanner (institutional-register-genesis.ts). It still NEVER asserts proven
// deployment coverage for the LIVE window, so an unverified historic "first" can
// never surface from derivation; the only "genesis/first" wording comes from
// seeds whose source is independently verified or transaction-locked.
const EVENT_WINDOW_LIMIT = 200;

// Tone per data-status for the compact status strip (presentation only).
const STATUS_TONE: Record<RegisterDataStatus, string> = {
  loading: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  ready: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  partial: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "rpc-limited": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "coverage-limited": "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  empty: "border-border bg-muted/40 text-muted-foreground",
  error: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
};

/** Deterministic UTC stamp (YYYY-MM-DD HH:MM UTC) — SSR/client agree. */
function utcStamp(ms: number): string {
  return `${new Date(ms).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

// ── Public-facing status vocabulary (only active/draft are ever shown) ────────
const STATUS_META: Record<
  "active" | "draft",
  { label: string; tone: string; hint: string }
> = {
  active: {
    label: "Active",
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    hint: "Accepted institutional memory — finalised by a human / governance act.",
  },
  draft: {
    label: "Draft",
    tone: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    hint: "Approved upstream, awaiting human / governance finalisation — not yet durable.",
  },
};

const VERIFICATION_META: Record<
  InstitutionalVerificationStatus,
  { label: string; tone: string; hint: string }
> = {
  verified: {
    label: "Verified",
    tone: "text-emerald-700 dark:text-emerald-400",
    hint: "Backed by sufficient scan coverage.",
  },
  "coverage-limited": {
    label: "Coverage-limited",
    tone: "text-amber-700 dark:text-amber-400",
    hint: "The scan did not reach deployment; no historic claim is asserted.",
  },
  locked: {
    label: "Locked",
    tone: "text-sky-700 dark:text-sky-400",
    hint: "An explicitly locked, verified fact.",
  },
};

function short(hash?: string): string {
  if (!hash) return "—";
  return hash.length > 16 ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : hash;
}

function StatusBadge({ status }: { status: "active" | "draft" }) {
  const m = STATUS_META[status];
  return (
    <span
      title={m.hint}
      className={`mono inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${m.tone}`}
    >
      {m.label}
    </span>
  );
}

function LineageTrail({ entry }: { entry: InstitutionalRegisterEntry }) {
  const steps: Array<{ label: string; value: string }> = [
    { label: "Register entry", value: entry.id },
    { label: "Promotion decision", value: entry.sourcePromotionDecisionId },
    { label: "Chronicle review", value: entry.sourceChronicleReviewCandidateId },
    { label: "Memory candidate", value: entry.sourceMemoryCandidateId },
    { label: "Signal", value: entry.sourceSignalId },
    { label: "Event", value: entry.sourceEventId },
  ];
  const txUrl = entry.sourceTxHash ? txExplorerUrl(entry.sourceTxHash) : null;

  return (
    <div className="mt-4 rounded-md border border-border/60 bg-muted/20 p-3">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Lineage — verifiable back to the on-chain event
      </div>
      <ol className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[11px]">
        {steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="rounded border border-border bg-card px-1.5 py-0.5">
              <span className="text-muted-foreground">{s.label}: </span>
              <code className="mono text-foreground/80">{s.value}</code>
            </span>
            <span aria-hidden className="text-muted-foreground">
              →
            </span>
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span className="rounded border border-border bg-card px-1.5 py-0.5">
            <span className="text-muted-foreground">Tx / Block: </span>
            <code className="mono text-foreground/80">{short(entry.sourceTxHash)}</code>
            {entry.sourceBlock !== undefined && (
              <span className="text-muted-foreground"> · block {entry.sourceBlock.toString()}</span>
            )}
          </span>
          {txUrl && (
            <a
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] underline-offset-4 hover:text-[var(--gold)] hover:underline"
            >
              Verify ↗
            </a>
          )}
        </li>
      </ol>
    </div>
  );
}

function EntryCard({ entry }: { entry: InstitutionalRegisterEntry }) {
  // Lineage status (spec §6): an entry with a broken upstream chain must NEVER be
  // presented as a final/durable fact, even if its entryStatus is "active".
  const lineageComplete = isLineageComplete(entry);
  // Only active/draft reach the public view; an active entry with broken lineage
  // is downgraded to a non-final "draft" presentation rather than shown as final.
  const status: "active" | "draft" =
    entry.entryStatus === "active" && lineageComplete ? "active" : "draft";
  const v = VERIFICATION_META[entry.verificationStatus];
  // Whether a verifiable on-chain anchor is present for this entry's lineage.
  const hasAnchor = Boolean(entry.sourceTxHash);
  // Deterministic UTC date (YYYY-MM-DD) so SSR and client agree — no locale/tz
  // hydration mismatch. Only a genuinely final entry shows a finalised date.
  const finalised =
    status === "active" && entry.createdAt !== null
      ? new Date(entry.createdAt).toISOString().slice(0, 10)
      : null;

  return (
    <GlassCard className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {entry.category} · {entry.createdFrom}
          </div>
          <h3 className="mt-1 text-base font-semibold leading-snug text-foreground">
            {entry.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={status} />
          <span className={`mono text-[10px] uppercase tracking-[0.16em] ${v.tone}`} title={v.hint}>
            {v.label}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground/85">{entry.summary}</p>

      {entry.rationale && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          <span className="text-foreground/70">Rationale: </span>
          {entry.rationale}
        </p>
      )}

      {status === "draft" && entry.entryStatus === "draft" && (
        <p className="mt-2 text-[11px] leading-relaxed text-sky-700/90 dark:text-sky-400/90">
          {STATUS_META.draft.hint}
        </p>
      )}

      {!lineageComplete && (
        <p className="mt-2 text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-400/90">
          Lineage incomplete — an upstream reference is missing, so this entry is
          not shown as a final fact.
        </p>
      )}

      <LineageTrail entry={entry} />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>{v.hint}</span>
        <span>
          {lineageComplete
            ? hasAnchor
              ? "Lineage complete · verifiable to its transaction"
              : "Lineage complete · structural (no transaction anchor)"
            : "Lineage incomplete"}
        </span>
        {finalised && <span>Finalised {finalised}</span>}
      </div>
    </GlassCard>
  );
}

/** Compact, sober data-status strip (spec §2). */
function RegisterStatusStrip({ status }: { status: RegisterStatus }) {
  return (
    <GlassCard className="p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={`mono inline-block rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${STATUS_TONE[status.status]}`}
        >
          {status.label}
        </span>
        <span className="text-xs leading-relaxed text-foreground/85">{status.reason}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          Sources: {status.sourcesAvailable}/{status.sourcesChecked} available
        </span>
        {status.sourceFailures.length > 0 && (
          <span className="text-amber-700 dark:text-amber-400">
            Unavailable: {status.sourceFailures.join(", ")}
          </span>
        )}
        {status.lastDerivedAt !== null && <span>Last read: {utcStamp(status.lastDerivedAt)}</span>}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{status.coverageNote}</p>
    </GlassCard>
  );
}

/** Honest empty-state (spec §3): distinguishes none-yet vs partial vs coverage. */
function EmptyState({ status }: { status: RegisterStatus }) {
  // Within the partial posture, distinguish a truncated window from source failure.
  const isTruncated = status.status === "partial";

  const heading = status.isPartial
    ? isTruncated
      ? "The scanned window is bounded — the view may be incomplete"
      : "Some sources are unavailable — the view may be incomplete"
    : status.canTrustEmpty
      ? "No institutional memory entries yet"
      : "No entries are visible in the current view";

  const body = status.isPartial
    ? isTruncated
      ? "The scanned window is bounded by a read limit, so eligible entries beyond it may not appear. This is not necessarily an empty register — every protocol movement is already visible, unfiltered, on the "
      : "One or more on-chain sources did not respond, so eligible entries may be missing. This is not necessarily an empty register — please retry, or verify directly on the "
    : status.canTrustEmpty
      ? "An entry appears here only after a protocol-institutional event is promoted through the pipeline and finalised. None have been finalised yet — nothing is invented to fill the register. Every protocol movement is already visible, unfiltered, on the "
      : "No active or draft entries fall within the current scan window, and full deployment coverage is not proven — so this is not asserted as a complete history. Every protocol movement is already visible, unfiltered, on the ";

  return (
    <GlassCard className="p-6">
      <h3 className="text-base font-semibold text-foreground">{heading}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {body}
        <Link to="/activity" className="text-foreground underline-offset-4 hover:underline">
          Activity
        </Link>{" "}
        feed.
      </p>
    </GlassCard>
  );
}

const PIPELINE_STAGES = [
  "On-chain event",
  "Signal",
  "Memory candidate",
  "Chronicle review",
  "Promotion decision",
  "Register entry",
];

export function InstitutionalRegisterView() {
  const { events, sources } = useProtocolEvents({ limit: EVENT_WINDOW_LIMIT });

  // Curated, verified protocol-birth seeds that predate the event scanner
  // (spec §3). Pure + deterministic, so this is computed once.
  const genesisEntries = useMemo(() => deriveGenesisRegisterEntries(), []);
  const lifecycleEntries = useMemo(() => deriveProtocolLifecycleRegisterEntries(), []);

  const entries = useMemo(() => {
    const signals = deriveSignals(events, { windowCoversDeployment: false });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    const decisions = deriveChroniclePromotionDecisions(review);
    const register = deriveInstitutionalRegister(decisions);
    return selectPublicInstitutionalEntries(
      mergeInstitutionalEntries([...genesisEntries, ...lifecycleEntries], register),
    );
  }, [events, genesisEntries, lifecycleEntries]);

  // Reliability status (Sprint 8). Coverage stays conservative (the public view
  // never proves genesis coverage); the window is "truncated" when it hits the
  // read limit, so older eligible entries may exist beyond it.
  const status = useMemo(
    () =>
      deriveRegisterStatus({
        sources,
        entryCount: entries.length,
        coverageComplete: false,
        windowTruncated: events.length >= EVENT_WINDOW_LIMIT,
      }),
    [sources, entries.length, events.length],
  );

  const showLoading = status.status === "loading";
  const showError = status.status === "error";

  return (
    <>
      {/* Reliability / data status */}
      <Section id="status">
        <RegisterStatusStrip status={status} />
      </Section>

      {/* What this is / what it is not */}
      <Section id="what-this-is">
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Verified protocol memory · read-only
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">
            The Institutional Register is the protocol's durable record of significant
            protocol-level events — treasury and liquidity movements, supply burns,
            milestones, and chapter coordinates. Each entry is derived from an on-chain
            event and preserves the full lineage back to its transaction, so it can be
            independently verified. Only <b>active</b> (accepted) and <b>draft</b>{" "}
            (approved, awaiting finalisation) entries appear here.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            This is a protocol record only — not equity, debt, a dividend, revenue share,
            a governance right, or a promise of profit. It confers no rights and represents
            no investment value. It is not Story, not Recognition, and not the public
            Chronicle.
          </p>
        </GlassCard>
      </Section>

      {/* Status legend */}
      <Section id="legend">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["active", "draft"] as const).map((s) => (
            <div key={s} className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
              <StatusBadge status={s} />
              <p className="text-xs leading-relaxed text-muted-foreground">{STATUS_META[s].hint}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Entries */}
      <Section id="entries">
        <SectionHeader
          eyebrow="Register"
          title={<>Institutional <span className="text-gradient-gold">memory entries</span></>}
          description="Newest first. Each entry traces to an on-chain event. Held and rejected entries are kept internal; nothing here is auto-published or editorial."
        />

        {showLoading ? (
          <p className="text-sm text-muted-foreground">Reading on-chain events…</p>
        ) : showError ? (
          <GlassCard className="p-5">
            <p className="text-sm text-muted-foreground">
              Every on-chain source is unavailable right now. The register degrades rather
              than fabricating entries — please retry shortly, or verify directly on the{" "}
              <Link to="/activity" className="text-foreground underline-offset-4 hover:underline">
                Activity
              </Link>{" "}
              feed.
            </p>
          </GlassCard>
        ) : entries.length === 0 ? (
          <EmptyState status={status} />
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
        )}
      </Section>

      {/* How an entry earns its place */}
      <Section id="pipeline">
        <SectionHeader
          eyebrow="Provenance"
          title="How an entry earns its place"
          description="Every entry is the end of a deterministic chain. Nothing is written by hand; an entry becomes durable only after a human / governance finalisation."
        />
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {PIPELINE_STAGES.map((stage, i, arr) => (
            <span key={stage} className="flex items-center gap-2">
              <span className="rounded border border-border bg-card px-2 py-1 font-medium text-foreground">
                {stage}
              </span>
              {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
      </Section>

      {/* Event classes the register records */}
      <Section id="event-classes">
        <SectionHeader
          eyebrow="Scope"
          title="What the register records"
          description="The protocol-level event classes the register supports today (live), seeds from verified protocol-birth facts that predate the scanner (seeded), or reserves for the future (reserved). A reserved class is declared so the vocabulary stays stable — no fact is invented for it."
        />
        <GlassCard className="p-5">
          <ul className="grid gap-3 sm:grid-cols-2">
            {INSTITUTIONAL_EVENT_CLASSES.map((c) => (
              <li key={c.class} className="text-xs">
                <div className="flex items-center gap-2">
                  <code className="mono text-foreground/80">{c.class}</code>
                  <span
                    className={`mono rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${
                      c.availability === "live"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : c.availability === "seeded"
                          ? "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400"
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
        </GlassCard>
      </Section>

      {/* Cross-references */}
      <Section id="cross-links">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="muted">Cross-references</Pill>
          <Link to="/activity" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">
            Activity (raw events) →
          </Link>
          <Link to="/chronicle" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">
            Chronicle (curated memory) →
          </Link>
          <Link to="/registry" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">
            Registry (contracts & wallets) →
          </Link>
          <Link to="/transparency" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">
            Transparency →
          </Link>
        </div>
      </Section>
    </>
  );
}
