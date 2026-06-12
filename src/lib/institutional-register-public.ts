// ─── Institutional Register · PUBLIC selection leaf (Sprint 7) ──────────────
// The PUBLIC, read-only VIEW over the Institutional Register exposes durable
// protocol memory as a verifiable surface. It is NOT Story, NOT Recognition, NOT
// the public Chronicle, and it PUBLISHES NOTHING — it only SELECTS which
// already-derived InstitutionalRegisterEntries are safe to show publicly.
//
// Public discipline (spec §2, §4):
//   • Show only `active` (accepted institutional memory) and `draft` (approved
//     upstream but NOT finalised — never presented as final).
//   • `held` (review / context / coverage) and `rejected` stay INTERNAL — the
//     /labs workbench renders the full set.
//   • Member-living decisions never reach this layer at all (excluded upstream).
//
// This file reads ENTRIES ONLY (the register's own types). It runs no derivation,
// reaches into no upstream layer, fabricates no fact, and asserts no on-chain
// status. Selection is status-only — held/rejected are dropped, never relabelled,
// and the copy/lineage carried on each entry is preserved verbatim.

import type {
  InstitutionalEntryStatus,
  InstitutionalRegisterEntry,
} from "./institutional-register-registry";

/** The only entry statuses safe for the public read-only view (spec §4). */
export const PUBLIC_INSTITUTIONAL_STATUSES = [
  "active",
  "draft",
] as const satisfies readonly InstitutionalEntryStatus[];

export type PublicInstitutionalStatus = (typeof PUBLIC_INSTITUTIONAL_STATUSES)[number];

/** True when an entry's status is one the public view may render. */
export function isPubliclyVisible(
  entry: Pick<InstitutionalRegisterEntry, "entryStatus">,
): boolean {
  return (PUBLIC_INSTITUTIONAL_STATUSES as readonly string[]).includes(
    entry.entryStatus,
  );
}

/**
 * Select the public-safe subset of register entries, NEWEST FIRST.
 *
 * Derivers return entries oldest → newest; the public view reads newest first.
 * `filter` returns a fresh array, so the in-place `reverse` never mutates the
 * caller's input.
 */
export function selectPublicInstitutionalEntries(
  entries: readonly InstitutionalRegisterEntry[],
): InstitutionalRegisterEntry[] {
  return entries.filter(isPubliclyVisible).reverse();
}

/**
 * Sober-language banlist for the PUBLIC view (spec §5). The institutional voice
 * stays neutral: no legend/hero framing, no person heroising, no profit / return
 * / yield / guarantee, no governance-right / investor-reward / financial-promise
 * claims. The generated entry copy is clean by construction; this is a defensive
 * guard against any future copy regression reaching the public surface.
 */
export const PUBLIC_FORBIDDEN_VOCAB: readonly string[] = [
  "legendary",
  "legend",
  "heroic",
  "founder achievement",
  "guaranteed",
  "guarantee",
  "profit",
  "returns",
  "return",
  "yield",
  "governance right",
  "investor reward",
  "financial promise",
  "roi",
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Return the §5 sober-language violations in `text`. Word-boundary, case-
 * insensitive — so "recurring", "revenue", "structural" never false-positive.
 */
export function findPublicVocabularyViolations(text: string): string[] {
  if (!text) return [];
  return PUBLIC_FORBIDDEN_VOCAB.filter((term) =>
    new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(text),
  );
}

// ─── Register data status (Sprint 8) ───────────────────────────────────────
// A small, PURE status object so the public view can tell the user — honestly —
// whether the register is loading, complete, partial, coverage-limited, empty,
// or unavailable. It invents nothing: it only summarises upstream source health,
// whether the scan window was truncated, whether deployment coverage is proven,
// and how many public entries resulted. The view renders it; the deriver decides
// it. No derivation rule changes — this is reliability discipline only.

/** The seven data-health states the public register can be in (spec §1, §2). */
export type RegisterDataStatus =
  | "loading"
  | "ready"
  | "partial"
  | "rpc-limited"
  | "coverage-limited"
  | "empty"
  | "error";

/** Sober, user-facing label for each status (spec §2). */
export const REGISTER_STATUS_LABELS: Record<RegisterDataStatus, string> = {
  loading: "INDEXING",
  ready: "LIVE",
  partial: "PARTIAL",
  "rpc-limited": "RPC-LIMITED",
  "coverage-limited": "COVERAGE-LIMITED",
  empty: "EMPTY",
  error: "ERROR",
};

/** Health of one upstream on-chain source feeding the pipeline. */
export interface RegisterSourceState {
  id: string;
  label: string;
  isLoading: boolean;
  isError: boolean;
  dataUpdatedAt?: number;
}

/** Inputs the view supplies to derive the register's data status. */
export interface RegisterStatusInput {
  /** Health of every upstream on-chain source feeding the pipeline. */
  sources: readonly RegisterSourceState[];
  /** Count of PUBLIC entries (active/draft) the view will render. */
  entryCount: number;
  /** True ONLY when the scan window is proven to cover deployment/genesis. */
  coverageComplete: boolean;
  /** True when the event window was capped by the read limit (more may exist). */
  windowTruncated?: boolean;
}

/** The resolved status object (spec §1). */
export interface RegisterStatus {
  status: RegisterDataStatus;
  /** User-facing label, e.g. "COVERAGE-LIMITED". */
  label: string;
  /** Sober one-line explanation of the status. */
  reason: string;
  sourcesChecked: number;
  sourcesAvailable: number;
  /** Labels of any sources that failed (empty when all responded). */
  sourceFailures: string[];
  /** Last successful source read (ms epoch), or null if none succeeded yet. */
  lastDerivedAt: number | null;
  coverageComplete: boolean;
  /** Always-present coverage caveat (defends every status, not just one). */
  coverageNote: string;
  entryCount: number;
  /** status === "ready": every source available, coverage proven, entries present. */
  isComplete: boolean;
  /** True ONLY when we can honestly say "no entries exist yet" (ready posture, zero entries). */
  canTrustEmpty: boolean;
  /** Some or all sources failed, or the window was truncated — the view may omit eligible entries. */
  isPartial: boolean;
}

function coverageNoteFor(complete: boolean): string {
  return complete
    ? "Scan coverage includes the deployment range."
    : "The public view reads a bounded recent window and does not assert full deployment-to-now coverage, so no historic claims are made.";
}

function reasonFor(
  status: RegisterDataStatus,
  ctx: { sourcesChecked: number; sourceFailures: readonly string[] },
): string {
  switch (status) {
    case "loading":
      return "Reading on-chain sources — the register is still indexing.";
    case "error":
      return "Every on-chain source is unavailable right now. Nothing is shown rather than guessing; please retry shortly.";
    case "rpc-limited":
      return `${ctx.sourceFailures.length} of ${ctx.sourcesChecked} on-chain sources are unavailable. The view may omit eligible entries and is not shown as complete.`;
    case "partial":
      return "The scanned window is capped by the read limit, so the view may not include every eligible entry.";
    case "coverage-limited":
      return "Entries shown are verified to their transaction, but coverage of the full deployment range is not proven — the view is not asserted as complete and no historic claims are made.";
    case "empty":
      return "All on-chain sources responded. No active or draft institutional entries are present yet.";
    case "ready":
      return "All on-chain sources responded and coverage is proven. The register reflects every eligible entry.";
  }
}

/**
 * Resolve the register's data status from upstream source health, window
 * truncation, coverage, and the public entry count (spec §1, §3–§5).
 *
 * Priority (first match wins, most limiting first):
 *   loading → error → rpc-limited → partial → coverage-limited → empty → ready
 *
 * `coverage-limited` precedes `empty`/`ready` so an unproven-coverage view is
 * never presented as a complete or genuinely-empty register: with coverage
 * unproven we cannot honestly assert "no entries exist", only "none are visible
 * in this window". `empty`/`ready`/LIVE therefore require proven coverage.
 */
export function deriveRegisterStatus(input: RegisterStatusInput): RegisterStatus {
  const sources = input.sources;
  const sourcesChecked = sources.length;
  const anyLoading = sources.some((s) => s.isLoading);
  const failed = sources.filter((s) => s.isError);
  const sourceFailures = failed.map((s) => s.label);
  const sourcesAvailable = sourcesChecked - failed.length;

  const stamps = sources.map((s) => s.dataUpdatedAt ?? 0).filter((t) => t > 0);
  const lastDerivedAt = stamps.length > 0 ? Math.max(...stamps) : null;

  const coverageComplete = input.coverageComplete;

  let status: RegisterDataStatus;
  if (anyLoading) status = "loading";
  else if (sourcesChecked > 0 && sourcesAvailable === 0) status = "error";
  else if (failed.length > 0) status = "rpc-limited";
  else if (input.windowTruncated) status = "partial";
  else if (!coverageComplete) status = "coverage-limited";
  else if (input.entryCount === 0) status = "empty";
  else status = "ready";

  return {
    status,
    label: REGISTER_STATUS_LABELS[status],
    reason: reasonFor(status, { sourcesChecked, sourceFailures }),
    sourcesChecked,
    sourcesAvailable,
    sourceFailures,
    lastDerivedAt,
    coverageComplete,
    coverageNote: coverageNoteFor(coverageComplete),
    entryCount: input.entryCount,
    isComplete: status === "ready",
    canTrustEmpty: status === "empty",
    isPartial: status === "rpc-limited" || status === "partial" || status === "error",
  };
}

/**
 * A register entry has COMPLETE lineage when every upstream reference in its
 * Promotion → Chronicle → Memory → Signal → Event chain is present (spec §6).
 * A broken chain must never be presented as a final/durable fact — the view
 * downgrades such an entry and withholds its "finalised" framing.
 */
export function isLineageComplete(
  entry: Pick<
    InstitutionalRegisterEntry,
    | "sourcePromotionDecisionId"
    | "sourceChronicleReviewCandidateId"
    | "sourceMemoryCandidateId"
    | "sourceSignalId"
    | "sourceEventId"
  >,
): boolean {
  const refs = [
    entry.sourcePromotionDecisionId,
    entry.sourceChronicleReviewCandidateId,
    entry.sourceMemoryCandidateId,
    entry.sourceSignalId,
    entry.sourceEventId,
  ];
  return refs.every((r) => typeof r === "string" && r.trim().length > 0);
}
