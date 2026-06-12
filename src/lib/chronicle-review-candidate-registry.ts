// ─── Chronicle Review Candidate Registry ───────────────────────────────────
// Pure-data leaf for the MINIMAL Chronicle Candidate layer (Sprint 4). It
// declares the ChronicleReviewCandidate vocabulary — the review/recommended-
// action enums, the verification alias, the tier-based eligibility tables, the
// MemoryCategory → ChronicleCategory hint map, and the classification validator
// that `chronicle-review-candidates.ts` (the deriver) projects Memory Candidates
// through. It reads no chain, asserts no live status, fabricates no fact, and
// publishes nothing to the locked Chronicle.
//
// NOTE — this is DISTINCT from the legacy `chronicle-candidates.ts` (the older
// Event → Chronicle path that reads CanonicalProtocolEvent.chronicleEligible).
// This Sprint-4 layer reads MEMORY CANDIDATES only and carries a different
// shape. Both coexist; neither writes to the locked Chronicle.
//
// ── ADJACENCY (docs/canon/05 §2.1) ──
// CHRONICLE CANDIDATES read MEMORY CANDIDATES only. This file and the deriver
// beside it must NEVER import the raw event layer (protocol-events), the Signal
// deriver (protocol-signals), or the Signal registry directly. Lineage back to
// the Signal → Event → Tx/Block is preserved THROUGH the MemoryCandidate's own
// fields (tier, sourceSignalId, sourceEventId, sourceTxHash, sourceBlock),
// re-exported via memory-candidate-registry — never re-derived. The legal edge
// is EVENT → SIGNAL → MEMORY CANDIDATE → CHRONICLE CANDIDATE.
//
// ── MONEY GUARDRAIL (docs/canon/05 §4.5) ──
// A ChronicleReviewCandidate carries NO monetary magnitude. Eligibility is read
// from the MemoryCandidate's structural tier/register/category — never from how
// much money moved, and never from the actor's identity (founder/system). A
// founder action is eligible only because its tier/significance qualifies.
//
// ── COVERAGE GUARDRAIL (spec §8) ──
// No "first ever / genesis / first liquidity / first burn / first campaign"
// claim is made unless the source MemoryCandidate verified WITH coverage. A
// coverage-limited candidate is HELD (hold-coverage), never dropped, and its
// proposed copy never asserts historic firsts (the human adds those on promotion).

import {
  registerForCategory,
  type ChronicleCategory,
  type ChronicleRegister,
} from "./chronicle-entries";
import {
  validateMemoryClassification,
  type MemoryCandidate,
  type MemoryCategory,
  type MemoryRegister,
  type MemoryVerification,
  type SignalSubject,
  type SignalTier,
} from "./memory-candidate-registry";

/** Register a candidate carries — identical to the Memory/Chronicle register. */
export type ChronicleReviewRegister = MemoryRegister;

/**
 * Human review workflow status. NOTHING here auto-publishes.
 *   • needs-review   — a normal valid candidate awaiting a human curator.
 *   • approved       — a human approved promotion (set by hand; never derived).
 *   • rejected       — a human rejected it (set by hand; never derived).
 *   • hold-coverage  — scan coverage is insufficient to assert the claim safely.
 *   • hold-context   — valid, but its meaning requires human framing before it
 *                      could become a permanent Chronicle entry (institutional
 *                      founder/system/protocol-burn acts).
 */
export type ChronicleReviewStatus =
  | "needs-review"
  | "approved"
  | "rejected"
  | "hold-coverage"
  | "hold-context";

/**
 * The only two machine recommendations. Promotion to the Chronicle is a HUMAN
 * act, so neither value publishes anything:
 *   • promote-on-review — eligible; a curator may promote it after review.
 *   • hold              — held (coverage/context); do not promote yet.
 */
export type ChronicleRecommendedAction = "promote-on-review" | "hold";

/** Verification carried through from the MemoryCandidate (same vocabulary). */
export type ChronicleVerificationStatus = MemoryVerification;

/**
 * A Chronicle Review Candidate — a deterministic projection of ONE Memory
 * Candidate that answers "is this eligible to become a permanent Chronicle entry
 * LATER?". It cites its MemoryCandidate and preserves the full lineage
 * (MemoryCandidate → Signal → Event → Tx/Block) without re-reading any of them.
 * It is advisory only: nothing here writes to the locked Chronicle.
 */
export type ChronicleReviewCandidate = {
  id: string;
  register: ChronicleReviewRegister;
  /** The source MemoryCandidate's category (kept verbatim; not translated). */
  category: MemoryCategory;
  /**
   * The ChronicleCategory a human curator would likely file this under. A HINT
   * only — translation to a real Chronicle category is the human promotion act.
   * Invariant: registerForCategory(chronicleCategoryHint) === register.
   */
  chronicleCategoryHint: ChronicleCategory;
  subject: SignalSubject;
  /** Lineage tier carried from the MemoryCandidate (drives eligibility). */
  tier: SignalTier;
  /** The MemoryCandidate.id this candidate derives from (always present). */
  sourceMemoryCandidateId: string;
  /** Lineage carried through the MemoryCandidate — never re-derived. */
  sourceSignalId: string;
  sourceEventId: string;
  sourceTxHash?: string;
  sourceBlock?: bigint;
  /** Protocol-voice, person-free proposed headline (curator may rewrite). */
  proposedTitle: string;
  /** One-sentence proposed summary. */
  proposedSummary: string;
  /** A short angle LABEL for a future curator — NOT generated Story prose. */
  proposedStoryAngle: string;
  /** Why this is eligible (cites tier/register; coverage-aware). */
  significanceReason: string;
  verificationStatus: ChronicleVerificationStatus;
  reviewStatus: ChronicleReviewStatus;
  recommendedAction: ChronicleRecommendedAction;
  /** The source event kind, carried through the MemoryCandidate. */
  createdFrom: MemoryCandidate["createdFrom"];
  /** Selection-gate violations in the proposed copy (must be empty). */
  copyViolations: string[];
};

/**
 * The ONLY MemoryCategories whose S1 candidates are Chronicle-eligible. At S1
 * everything else is activity-only. membership/continuity are the member-living
 * first/return moments; treasury/liquidity/founder-action can only ARRIVE at S1
 * through the upstream first-funding-with-coverage gate, so accepting them here
 * is defense-in-depth, not a new elevation. (Significance is structural —
 * never "because the founder did it".)
 */
export const S1_CHRONICLE_ELIGIBLE_CATEGORIES: ReadonlySet<MemoryCategory> =
  new Set(["membership", "continuity", "treasury", "liquidity", "founder-action"]);

/**
 * Categories whose meaning requires human framing before a permanent entry —
 * institutional founder/system actions. burn is hold-context ONLY in the
 * protocol-institutional register (a protocol-wallet burn); a member-living
 * (community) burn is a normal needs-review member moment. This mirrors
 * chronicle-entries' requiresInstitutionalSignificance — it is category
 * discipline, NOT actor special-casing.
 */
export const HOLD_CONTEXT_CATEGORIES: ReadonlySet<MemoryCategory> = new Set([
  "founder-action",
  "system-wallet-action",
]);

/**
 * The ChronicleCategory a MemoryCandidate would likely be filed under.
 * Deterministic and total over MemoryCategory. The member-side MemoryCategories
 * (membership/continuity, and a member-living burn) map to the Chronicle's
 * `member` category; `chapter` maps to `protocol`; every other MemoryCategory is
 * already a valid ChronicleCategory and maps to itself. By construction
 * registerForCategory(hint) === registerForSubject's register for the candidate.
 */
export function chronicleCategoryHint(
  category: MemoryCategory,
  register: MemoryRegister,
): ChronicleCategory {
  if (category === "membership" || category === "continuity") return "member";
  if (category === "chapter") return "protocol";
  if (category === "burn" && register === "member-living") return "member";
  // Remaining: genesis | treasury | operations | liquidity | burn | artifact |
  // milestone | founder-action | system-wallet-action — all valid Chronicle
  // categories.
  return category;
}

/**
 * Validate a candidate's classification: reuse the Memory classification check
 * (register legal for category + person ⟺ member-living), then assert the
 * Chronicle-hint invariant — the hinted ChronicleCategory must imply the SAME
 * register the candidate carries, so the two registries can never silently
 * disagree. Returns violations (empty = passes).
 */
export function validateChronicleReviewClassification(c: {
  category: MemoryCategory;
  register: ChronicleReviewRegister;
  subject: SignalSubject;
}): string[] {
  const errs = validateMemoryClassification(c);
  const hint = chronicleCategoryHint(c.category, c.register);
  const implied: ChronicleRegister = registerForCategory(hint);
  if (implied !== c.register) {
    errs.push(
      `chronicleCategoryHint "${hint}" implies register "${implied}", but candidate declares "${c.register}"`,
    );
  }
  return errs;
}
