// src/lib/chronicle-entry-registry.ts
// CHRONICLE ENTRY (institutional) — the pure-data leaf for Sprint 13, the final
// pipeline edge CHRONICLE ADMISSION CANDIDATE → CHRONICLE ENTRY.
//
// This leaf defines the InstitutionalChronicleEntry object, its publication
// statuses, the human/governance publication-decision seam, the deterministic
// status mapping, and the append-only supersession rule. It generates NO copy
// (title/summary are carried verbatim) and PUBLISHES NOTHING: turning a draft
// into a live, public Chronicle entry is a human / governance act this layer
// never performs.
//
// ── What this layer is NOT ──
//   • not Story, not Recognition, not the Member Register, not DAO governance
//   • it does not rewrite or mutate the locked, hand-curated CHRONICLE_ENTRIES
//     (src/lib/chronicle-entries.ts) — those stay immutable; this is a SEPARATE
//     derived institutional-entry type that maps onto them only at the human
//     publish step
//   • it never auto-publishes: resolvePublication can emit draft | held |
//     rejected, NEVER published (publication requires a human/governance act)
//
// ── Adjacency (canon 05 §2.1) ──
//   It reads CHRONICLE ADMISSION CANDIDATES only. It imports nothing but the
//   admission registry leaf: the candidate type, the admission-status type, and
//   the single-sourced copy guard (findAdmissionCopyViolations). The full
//   lineage and the on-chain anchor are carried THROUGH each candidate; this
//   leaf never reaches back into the register, promotion, review, memory, signal,
//   or raw event layers, nor the admission DERIVER.

import {
  findAdmissionCopyViolations,
  type ChronicleAdmissionCandidate,
  type ChronicleAdmissionStatus,
} from "./chronicle-admission-registry";

// The Chronicle-domain classification vocabulary is taken from the candidate via
// indexed-access types, so this leaf imports ONLY its immediate neighbour.
type ChronicleRegister = ChronicleAdmissionCandidate["proposedChronicleRegister"];
type ChronicleCategory = ChronicleAdmissionCandidate["proposedChronicleCategory"];
type EntryVerificationStatus = ChronicleAdmissionCandidate["verificationStatus"];

/**
 * Publication lifecycle of an institutional Chronicle entry (spec §3).
 *   • draft      — eligible (admitted upstream); awaiting a human / governance
 *                  publish act. The default landing state for an admitted fact.
 *   • published  — live in the public Chronicle. RESERVED: never emitted by this
 *                  layer; reachable only through a future human/governance act.
 *   • held       — not eligible yet (the candidate was review/held upstream);
 *                  retained, never dropped.
 *   • rejected   — copy failed re-validation, or the candidate was rejected
 *                  upstream; recorded, not published.
 *   • superseded — an earlier entry corrected by a later one (append-only; the
 *                  original is never edited in place — see supersedeEntry).
 */
export type ChroniclePublicationStatus =
  | "draft"
  | "published"
  | "held"
  | "rejected"
  | "superseded";

/**
 * The decision verb a human / governance step records when it acts on a draft.
 * The deriver NEVER fabricates one of these — every derived entry carries the
 * pending baseline until a human overwrites it (spec §4).
 */
export type ChroniclePublicationVerdict =
  | "pending-human-review"
  | "human-approved"
  | "governance-approved"
  | "rejected";

/**
 * The human / governance publication-decision seam. Mirrors the promotion
 * layer's BASELINE_REVIEWER pattern: a deterministic baseline that carries no
 * reviewer, no governance reference, and no timestamp until a human acts. This
 * is the ONLY place a future human/governance act records itself; building it as
 * data (not a stub) keeps the seam explicit without faking governance.
 */
export type ChroniclePublicationDecision = {
  verdict: ChroniclePublicationVerdict;
  /** null until a human reviewer is recorded — never invented here (spec §4). */
  reviewer: string | null;
  /** null until a real governance reference exists — never faked here (spec §4). */
  governanceRef: string | null;
  /** null for a deterministic baseline (recomputed each render). */
  decidedAt: number | null;
  /** Sober, person-free note. */
  note: string;
};

/** The on-chain chronology anchor carried from the source fact (no magnitude). */
export type ChronicleChronology = {
  /** Calendar date — null today: the pipeline carries no block timestamps. */
  date: string | null;
  /** Block height — null today: not carried through the admission candidate. */
  block: number | null;
  /** Source transaction hash, when the source fact carried one. */
  txHash: string | null;
};

/**
 * One institutional Chronicle entry (spec §2). It carries the admitted
 * candidate's copy and lineage VERBATIM (this layer generates no copy) plus the
 * publication lifecycle. It is a Chronicle-DOMAIN object: its register/category
 * are the candidate's PROPOSED Chronicle classification, not the institutional
 * category — the admission layer already separated those vocabularies.
 *
 * The individually-named upstream ids (review/memory/signal/event) are spec §2
 * "if carried" fields; the admission candidate carries the full trail as a
 * lineage array rather than as separate ids, so the complete provenance lives in
 * `lineage`. The verified block height is now carried (Sprint 14) and surfaced as
 * `chronology.block` (null when the source fact had no block anchor) rather than
 * as a separate `sourceBlock` field, so the on-chain anchor lives in one place.
 */
export type InstitutionalChronicleEntry = {
  /** Deterministic entry id (1:1 with the source admission candidate). */
  id: string;
  // ── Lineage (carried, never re-derived) ──
  sourceChronicleAdmissionCandidateId: string;
  sourceInstitutionalRegisterEntryId: string;
  sourcePromotionDecisionId: string;
  /** On-chain anchor carried from the source fact (inspection only, no magnitude). */
  sourceTxHash?: string;
  // ── Classification (Chronicle-domain, carried from the candidate) ──
  register: ChronicleRegister;
  category: ChronicleCategory;
  // ── Copy (verbatim, re-validated — never regenerated) ──
  title: string;
  summary: string;
  // ── Chronology anchor ──
  chronology: ChronicleChronology;
  // ── Verification + publication ──
  verificationStatus: EntryVerificationStatus;
  publicationStatus: ChroniclePublicationStatus;
  publicationDecision: ChroniclePublicationDecision;
  /** The promotion rule bucket the source fact derived from. */
  createdFrom: string;
  // ── Audit + durability ──
  copyViolations: string[];
  lineage: readonly string[];
  /** Append-only version (starts at 1; supersedeEntry increments it). */
  version: number;
  /** The id this entry supersedes, or null for an original entry (spec §10). */
  supersedes: string | null;
  /** Deterministic baseline derivations are unstamped (recomputed each render). */
  derivedAt: number | null;
};

/** Re-export the copy guard so consumers single-source it through this leaf. */
export { findAdmissionCopyViolations };

/**
 * The deterministic publication baseline — pending human review, no reviewer, no
 * governance reference, no timestamp. A human / governance act later overwrites
 * this; the deriver never fabricates a decision (spec §4).
 */
export function baselinePublicationDecision(): ChroniclePublicationDecision {
  return {
    verdict: "pending-human-review",
    reviewer: null,
    governanceRef: null,
    decidedAt: null,
    note: "Eligibility only; a human / governance act decides publication. No reviewer or governance reference is invented here.",
  };
}

/**
 * Map an admission verdict to a publication status, with COPY > RULES precedence
 * (the same precedence law every upstream layer holds): any carried copy
 * violation REJECTS the entry even when the candidate was admitted upstream.
 *
 *   copy violations            → rejected
 *   admitted (clean copy)      → draft        (awaiting a human/governance act)
 *   review                     → held
 *   held                       → held
 *   rejected                   → rejected
 *
 * It NEVER returns "published": publication is a human/governance act this layer
 * never performs. "superseded" is reached only through supersedeEntry.
 */
export function resolvePublication(
  admissionStatus: ChronicleAdmissionStatus,
  copyViolations: readonly string[],
): { status: ChroniclePublicationStatus; reason: string } {
  if (copyViolations.length > 0) {
    return {
      status: "rejected",
      reason: "Carried copy failed re-validation; recorded, not published (copy > rules).",
    };
  }
  switch (admissionStatus) {
    case "admitted":
      return {
        status: "draft",
        reason: "Admitted upstream; filed as a draft entry awaiting a human / governance publish act.",
      };
    case "review":
      return {
        status: "held",
        reason: "Upstream verdict is review; held until a human decides — not filed as a final entry.",
      };
    case "held":
      return {
        status: "held",
        reason: "Held upstream; retained, not filed as a final entry.",
      };
    case "rejected":
      return {
        status: "rejected",
        reason: "Rejected upstream; recorded, not published.",
      };
  }
}

/**
 * Create a SUPERSEDING entry for a mistake instead of editing history (spec §10).
 * Pure and append-only: the original is returned UNTOUCHED; a NEW entry is
 * produced with an incremented version, a `supersedes` pointer to the original,
 * and an explicit "superseded" copy of the original so a reader can show the
 * correction without the original ever being mutated.
 *
 * Returns { superseded, replacement }:
 *   • superseded  — a frozen COPY of the original with publicationStatus
 *                   "superseded" (the input object is not changed)
 *   • replacement — the corrected entry (version + 1, supersedes = original.id)
 */
export function supersedeEntry(
  original: InstitutionalChronicleEntry,
  patch: Partial<
    Pick<
      InstitutionalChronicleEntry,
      "title" | "summary" | "category" | "chronology" | "verificationStatus"
    >
  >,
  nextId?: string,
): {
  superseded: InstitutionalChronicleEntry;
  replacement: InstitutionalChronicleEntry;
} {
  const superseded: InstitutionalChronicleEntry = {
    ...original,
    publicationStatus: "superseded",
  };
  const replacement: InstitutionalChronicleEntry = {
    ...original,
    ...patch,
    id: nextId ?? `${original.id}@v${original.version + 1}`,
    version: original.version + 1,
    supersedes: original.id,
  };
  return { superseded, replacement };
}

// ─── MAINTAINER SECTION ─────────────────────────────────────────────────────
// Spec §11 — four durable notes a future maintainer needs. Kept as data (not
// just a comment) so the guard test can assert they exist and stay copy-clean.
// NOT public copy — an internal orientation surface only.
export const CHRONICLE_ENTRY_MAINTAINER: ReadonlyArray<{
  topic: string;
  note: string;
}> = [
  {
    topic: "Existing structure to reuse",
    note: "The locked ChronicleEntry type and its six-part selection gate (validateChronicleEntry) in chronicle-entries.ts. The institutional entry here is a SEPARATE derived type; at the human publish step it maps onto that locked shape rather than duplicating the gate, so the public Chronicle keeps one validator.",
  },
  {
    topic: "Risk in converting admission to a Chronicle entry",
    note: "The genesis-seed facts factually overlap the three locked, hand-curated Chronicle entries (chapter opened, first/second artifact). Filing them as live public entries without a dedup / curation pass would double-record the same fact. This is why derivation stays draft-only and publication is a human / governance act, never automatic.",
  },
  {
    topic: "Missing field future Story would need",
    note: "A real calendar time axis. chronology.date is null because no block timestamp is fetched anywhere in the pipeline — only block heights and transaction anchors are carried. The Chronicle Chronology layer can therefore order entries by verified block number but cannot date them; Story needs an actual timestamp to narrate over, so a block-timestamp lookup remains the outstanding prerequisite.",
  },
  {
    topic: "Verified block anchor (threaded in Sprint 14)",
    note: "The source block height is now carried from the register entry through the admission candidate (narrowed bigint to number) and surfaced as chronology.block, so every entry whose source fact had an on-chain block carries a verifiable height. The Chronicle Chronology layer reads chronology.block to order entries; entries without a block anchor are held, never ordered by guess.",
  },
  {
    topic: "Hardening the future human-publish / correction flow",
    note: "supersedeEntry is append-only and spreads the original, so a replacement inherits the original publicationStatus and publicationDecision and does NOT re-run findAdmissionCopyViolations on a patched title / summary. That is harmless today (no production caller; supersession only ever begins from a draft baseline), but the eventual human-publish flow must, when it patches copy, reset publicationDecision to baseline and re-validate the patched copy before any 'published' state — otherwise a correction could carry a stale reviewer record forward or slip unsafe copy past the gate.",
  },
];
