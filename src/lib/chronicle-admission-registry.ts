// ─── Chronicle Admission Registry (Sprint 12) ──────────────────────────────
// Pure-data leaf for the CHRONICLE ADMISSION layer — the new LAST edge of the
// knowledge pipeline:
//   … → INSTITUTIONAL REGISTER ENTRY → CHRONICLE ADMISSION CANDIDATE.
//
// This layer is an INSPECTION-ONLY BRIDGE. It reads durable Institutional
// Register entries and decides which are ELIGIBLE to LATER become public
// Chronicle entries. It is a CANDIDATE layer, not a publisher:
//   • It PUBLISHES NOTHING and rewrites NO existing Chronicle entry.
//   • It builds NO Story, Recognition, Member-Register, Governance, or AI surface.
//   • It changes NO upstream derivation and touches NO contract.
//   • Promotion of an `admitted` candidate INTO the Chronicle stays a human /
//     governance act — admission only marks eligibility, it never acts on it.
//
// ── ADJACENCY (docs/canon/05 §2.1) ──
// CHRONICLE ADMISSION reads INSTITUTIONAL REGISTER ENTRIES only. This file and
// the deriver beside it must NEVER import the Chronicle-promotion layer
// (chronicle-promotion / chronicle-promotion-registry), the Chronicle-review
// layer, the Memory layer, the Signal layer, the raw event layer, or the
// institutional-register DERIVER / GENESIS leaves. Lineage back through
// Promotion → Chronicle → Memory → Signal → Event → Tx/Block is carried THROUGH
// each InstitutionalRegisterEntry's own fields — never re-derived. The legal
// imports are: the register registry leaf (the entry vocabulary +
// findHistoricClaims), the register public leaf (the §5 sober-language guard +
// isLineageComplete), the protocol-language guard, and the Chronicle's own
// register map (registerForCategory / requiresInstitutionalSignificance from
// chronicle-entries — admission decides Chronicle eligibility, so it reads the
// Chronicle's classification vocabulary, never its candidate pipeline).
//
// ── MONEY / IDENTITY GUARDRAIL (docs/canon/05 §4.5) ──
// A ChronicleAdmissionCandidate carries NO monetary magnitude. Admission is
// decided from the entry's STRUCTURE (register / category / rule bucket /
// verification / lineage) — never from how much money moved or who acted. Money
// may never, by itself, admit a fact to the Chronicle.
//
// ── MEMBER-REGISTER DOCTRINE (chronicle-entries clause 6) ──
// A member-subject fact (a `membership` / `continuity` category, or anything
// whose Chronicle register is member-living) is EXCLUDED entirely — it is never
// written as a candidate. The member-living track stays reserved for DAO
// ratification, exactly as every upstream layer holds it.

import {
  registerForCategory,
  requiresInstitutionalSignificance,
  type ChronicleCategory,
  type ChronicleRegister,
} from "./chronicle-entries";
import { findPublicVocabularyViolations } from "./institutional-register-public";
import {
  INSTITUTIONAL_REGISTER,
  findHistoricClaims,
  type InstitutionalEntryCategory,
  type InstitutionalEntryStatus,
  type InstitutionalRegister,
  type InstitutionalRegisterEntry,
  type InstitutionalVerificationStatus,
} from "./institutional-register-registry";
import { findForbiddenLanguage } from "./protocol-language";

/**
 * The admission disposition for one Institutional Register entry.
 *   • admitted — a verified/locked, structurally institutional fact whose rule
 *                bucket is admissible: ELIGIBLE to become a Chronicle entry
 *                (subject to a later human / governance promotion act).
 *   • review   — eligible in principle but a human must decide (an unfinalised
 *                draft, a founder/system-wallet action, or a bucket that is not
 *                auto-admissible).
 *   • held     — not eligible yet (held upstream, coverage-limited, or an
 *                incomplete lineage); retained, never dropped.
 *   • rejected — copy failed re-validation, or the entry is rejected upstream.
 */
export type ChronicleAdmissionStatus = "admitted" | "review" | "held" | "rejected";

/**
 * One Chronicle Admission Candidate — a read-only eligibility verdict over ONE
 * InstitutionalRegisterEntry. It carries the entry's copy and lineage VERBATIM
 * (admission generates no new copy) plus the proposed Chronicle classification
 * the entry would file under, so the verdict is self-auditable.
 */
export type ChronicleAdmissionCandidate = {
  /** Deterministic candidate id (1:1 with the source entry). */
  id: string;
  // ── Lineage (carried, never re-derived) ──
  sourceInstitutionalEntryId: string;
  sourcePromotionDecisionId: string;
  /** On-chain anchor carried from the source entry (inspection only, no magnitude). */
  sourceTxHash?: string;
  /**
   * Verified source block height, carried from the register entry as a plain
   * number (the upstream pipeline carries it as bigint; it is narrowed at the
   * deriver boundary to stay JSON-serialisable). The Chronicle Chronology layer
   * orders by this. Inspection only — a height, never a magnitude.
   */
  sourceBlock?: number;
  // ── Carried classification ──
  register: InstitutionalRegister;
  category: InstitutionalEntryCategory;
  /** The promotion rule bucket the source entry derived from. */
  createdFrom: string;
  // ── Carried copy (verbatim, re-validated — never regenerated) ──
  title: string;
  summary: string;
  // ── Carried verification + source disposition ──
  verificationStatus: InstitutionalVerificationStatus;
  sourceEntryStatus: InstitutionalEntryStatus;
  // ── Admission verdict ──
  admissionStatus: ChronicleAdmissionStatus;
  /** Sober, person-free explanation of the verdict. */
  admissionReason: string;
  // ── Proposed Chronicle classification (spec §1) ──
  /** The Chronicle register this fact would file under (always protocol-institutional for a candidate). */
  proposedChronicleRegister: ChronicleRegister;
  /** The Chronicle category this fact would file under. */
  proposedChronicleCategory: ChronicleCategory;
  // ── Audit ──
  lineageComplete: boolean;
  lineage: readonly string[];
  /** Re-validated copy violations on the carried title/summary (must be empty to admit). */
  copyViolations: string[];
  /** Deterministic baseline derivations are unstamped (recomputed each render). */
  derivedAt: number | null;
};

/**
 * Rule buckets whose VERIFIED/LOCKED, active entries are auto-admissible — the
 * permanent, protocol-primitive facts the Chronicle is for. Every other known
 * bucket (treasury deployment/revenue, operations, liquidity removal, the
 * protocol-wallet/system-wallet actions) needs a human review call, and an
 * UNKNOWN bucket is NEVER auto-admitted (it falls through to review).
 *
 * Admission keys on the rule BUCKET (createdFrom), not the category, so a
 * genesis-seed fact (createdFrom "genesis-seed") admits while a routine treasury
 * flow does not.
 */
export const ADMISSION_ADMIT_BUCKETS: ReadonlySet<string> = new Set([
  "liquidity seeding",
  "treasury acquisition",
  "artifact issuance",
  "protocol milestone",
  "chapter completion",
  "genesis-seed",
]);

/**
 * The Chronicle category an Institutional Register entry would file under. The
 * register only ever carries protocol-institutional entries, so this mirrors the
 * canonical Chronicle-hint map for that register: member-side categories
 * (membership / continuity) map to the Chronicle `member` category; `chapter`
 * maps to `protocol`; every remaining MemoryCategory is already a valid
 * ChronicleCategory and maps to itself.
 */
export function proposedChronicleCategoryFor(
  category: InstitutionalEntryCategory,
): ChronicleCategory {
  if (category === "membership" || category === "continuity") return "member";
  if (category === "chapter") return "protocol";
  return category;
}

/**
 * True when an entry is member-living and must be EXCLUDED entirely (clause 6).
 * Catches both a register that is not the protocol-institutional store and a
 * category whose Chronicle register is member-living (e.g. a membership ordinal).
 */
export function isMemberLivingEntry(
  entry: Pick<InstitutionalRegisterEntry, "register" | "category">,
): boolean {
  if (entry.register !== INSTITUTIONAL_REGISTER) return true;
  return registerForCategory(proposedChronicleCategoryFor(entry.category)) === "member-living";
}

/**
 * Re-validate carried copy for Chronicle admission GIVEN the entry's
 * verification posture. Reuses the SAME guards the register pipeline uses — the
 * coverage-aware historic-claim guard, the forbidden-framing guard, and the §5
 * public sober-language banlist — so copy safety stays single-sourced. The
 * Chronicle marketing banlist (chronicle-entries) is intentionally NOT re-run
 * here: it overlaps these guards for every investment / hero term, and is
 * enforced at the (later, human) publish step that is out of this layer's scope.
 */
export function findAdmissionCopyViolations(
  text: string,
  verification: InstitutionalVerificationStatus,
): string[] {
  return [
    ...findHistoricClaims(text, verification),
    ...findForbiddenLanguage(text),
    ...findPublicVocabularyViolations(text),
  ];
}

/** The structural facts the admission verdict is decided from (no magnitude). */
export type AdmissionInput = {
  category: InstitutionalEntryCategory;
  createdFrom: string;
  entryStatus: InstitutionalEntryStatus;
  verificationStatus: InstitutionalVerificationStatus;
  /** Re-validated admission copy violations on the carried title/summary. */
  copyViolations: readonly string[];
  /** Whether the entry's upstream lineage is complete. */
  lineageComplete: boolean;
};

/**
 * Resolve the admission verdict for one entry. Precedence is COPY > COVERAGE >
 * RULES, first match wins:
 *   P1 copy violations          → rejected
 *   P2 incomplete lineage       → held
 *   P3 source status            → rejected → rejected · held → held · draft → review
 *   P4 (active only):
 *      coverage-limited         → held (no historic admission without coverage)
 *      founder/system action    → review (institutional significance is a human call)
 *      admissible rule bucket   → admitted
 *      otherwise                → review (unknown / non-admissible bucket)
 *
 * Member-living entries are excluded BEFORE this runs (isMemberLivingEntry); the
 * deriver never passes one in.
 */
export function resolveAdmission(input: AdmissionInput): {
  status: ChronicleAdmissionStatus;
  reason: string;
} {
  // P1 — copy is the highest gate (copy > coverage > rules).
  if (input.copyViolations.length > 0) {
    return {
      status: "rejected",
      reason: "Carried copy failed re-validation; not eligible for the Chronicle (copy > coverage > rules).",
    };
  }
  // P2 — coverage of the lineage trail.
  if (!input.lineageComplete) {
    return {
      status: "held",
      reason: "Lineage is incomplete; held until the full trail is present.",
    };
  }
  // P3 — the source entry's own disposition.
  switch (input.entryStatus) {
    case "rejected":
      return { status: "rejected", reason: "The source institutional entry is rejected upstream." };
    case "held":
      return { status: "held", reason: "The source institutional entry is held upstream." };
    case "draft":
      return {
        status: "review",
        reason: "Approved upstream but not human-finalised; a reviewer decides before admission.",
      };
    case "active":
      break;
  }
  // P4 — an active entry. Coverage gate first, then the rule bucket.
  if (input.verificationStatus === "coverage-limited") {
    return {
      status: "held",
      reason: "Active but coverage-limited; held — no historic admission is asserted without coverage.",
    };
  }
  const chronicleCategory = proposedChronicleCategoryFor(input.category);
  if (requiresInstitutionalSignificance(chronicleCategory)) {
    return {
      status: "review",
      reason: "A protocol-wallet or system-wallet action — its institutional significance is a human call.",
    };
  }
  if (ADMISSION_ADMIT_BUCKETS.has(input.createdFrom)) {
    return {
      status: "admitted",
      reason: `Verified institutional fact in an admissible bucket ("${input.createdFrom}").`,
    };
  }
  return {
    status: "review",
    reason: `Verified, but rule bucket "${input.createdFrom}" is not auto-admissible; a reviewer decides.`,
  };
}

// ─── MAINTAINER SECTION ─────────────────────────────────────────────────────
// Four durable notes a future maintainer needs to extend this layer safely.
// Kept as data (not just a comment) so the guard test can assert they exist and
// stay copy-clean. NOT public copy — an internal orientation surface only.
export const CHRONICLE_ADMISSION_MAINTAINER: ReadonlyArray<{
  topic: string;
  note: string;
}> = [
  {
    topic: "What this layer is",
    note: "The last pipeline edge: it reads durable Institutional Register entries and marks which are ELIGIBLE to LATER become Chronicle entries. It is a candidate layer, not a publisher — admission marks eligibility and never acts on it.",
  },
  {
    topic: "Adjacency — what it may read",
    note: "Institutional Register entries only. It reuses the register registry vocabulary, the register public sober-language guard and lineage check, the protocol-language guard, and the Chronicle register map. It never reaches into the promotion, chronicle-review, memory, signal, or raw event layers, nor the register deriver/genesis leaves; lineage is carried through each entry.",
  },
  {
    topic: "Precedence & disposition",
    note: "Member-living entries are excluded entirely. For the rest the order is copy > coverage > rules: copy violations reject; an incomplete lineage holds; then the source status decides (rejected/held/draft); an active verified or locked entry is admitted only when its category needs no human significance call and its rule bucket is admissible — otherwise it goes to review.",
  },
  {
    topic: "Out of scope — what it must never do",
    note: "It never auto-publishes or rewrites the Chronicle, builds Story/Recognition/Member-Register/Governance/AI, changes any upstream derivation, or touches a contract. Turning an admitted candidate into a Chronicle entry stays a human / governance act. To extend: add a bucket to ADMISSION_ADMIT_BUCKETS only when its facts are permanent protocol primitives.",
  },
];
