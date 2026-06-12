// ─── Chronicle Review Candidates (the MINIMAL Chronicle Candidate layer) ──────
// The deterministic MemoryCandidate → ChronicleReviewCandidate derivation layer.
// ONE pure function projects Memory Candidates into review-ready Chronicle
// Candidates that answer "is this eligible to become a permanent Chronicle entry
// LATER?" — WITHOUT publishing anything to the locked Chronicle, WITHOUT writing
// Story/Recognition, and WITHOUT touching any contract or public UI. It is
// OUTPUT-ONLY, additive, and review-first: the only machine recommendations are
// "promote-on-review" and "hold"; promotion itself is always a HUMAN act.
//
// ── ADJACENCY (docs/canon/05 §2.1) ──
// This module reads MEMORY CANDIDATES only. It imports the memory-candidate
// registry (for the candidate shape + the re-exported tier rank), the
// chronicle-review registry leaf, the Chronicle vocabulary (banned terms +
// forbidden patterns) and the language guard — NEVER the raw event layer
// (protocol-events), the Signal deriver (protocol-signals), or the Signal
// registry directly. Lineage back to Signal → Event → Tx/Block is carried
// THROUGH the MemoryCandidate's own fields. The legal edge is
//   EVENT → SIGNAL → MEMORY CANDIDATE → CHRONICLE CANDIDATE.
//
// ── MONEY / IDENTITY GUARDRAIL (docs/canon/05 §4.5) ──
// A ChronicleReviewCandidate carries no monetary magnitude and is never created
// "because the founder/system acted". Eligibility is read from the candidate's
// structural tier/category — significance is structural. Institutional founder /
// system / protocol-burn acts are HELD for human framing (hold-context), not
// elevated by actor identity.
//
// ── COPY DOCTRINE ──
// This layer generates its OWN protocol-voice, person-free proposed copy. It
// NEVER reuses the MemoryCandidate's title/summary/reason — those can name a
// "founder" (a Chronicle-banned term). Every generated string is validated
// against findForbiddenLanguage + the Chronicle banned-term/forbidden-subject
// rules; any violation is surfaced on `copyViolations` (and asserted empty in
// tests), never silently published.

import {
  CHRONICLE_BANNED_TERMS,
  CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS,
} from "./chronicle-entries";
import {
  chronicleCategoryHint,
  validateChronicleReviewClassification,
  HOLD_CONTEXT_CATEGORIES,
  S1_CHRONICLE_ELIGIBLE_CATEGORIES,
  type ChronicleRecommendedAction,
  type ChronicleReviewCandidate,
  type ChronicleReviewRegister,
  type ChronicleReviewStatus,
  type ChronicleVerificationStatus,
} from "./chronicle-review-candidate-registry";
import {
  tierRank,
  type MemoryCandidate,
  type MemoryCategory,
} from "./memory-candidate-registry";
import { findForbiddenLanguage } from "./protocol-language";

/**
 * Eligibility (canon §4.5 tiers, read from the carried lineage tier):
 *   • S0 routine → never (activity-only).
 *   • S1 notable → only the Chronicle-eligible safe-set of categories.
 *   • S2+ recognized / protocol / historic → always.
 * Identity-neutral: a founder/system action qualifies only via its tier/category.
 */
function isChronicleEligible(mc: MemoryCandidate): boolean {
  const rank = tierRank(mc.tier);
  if (rank <= 0) return false; // S0 — never.
  if (rank === 1) return S1_CHRONICLE_ELIGIBLE_CATEGORIES.has(mc.category);
  return true; // S2 and above.
}

/**
 * True when a candidate's meaning needs human framing before it could become a
 * permanent entry — institutional founder/system actions, and a protocol-wallet
 * (institutional-register) burn. A member-living (community) burn is a normal
 * member moment, not hold-context. Category discipline, NOT actor special-casing.
 */
function isHoldContext(
  category: MemoryCategory,
  register: ChronicleReviewRegister,
): boolean {
  if (HOLD_CONTEXT_CATEGORIES.has(category)) return true;
  if (category === "burn" && register === "protocol-institutional") return true;
  return false;
}

/**
 * reviewStatus precedence (architect ruling):
 *   1. hold-coverage  — verification is coverage-limited (cannot assert the claim
 *                       safely yet); ALWAYS wins.
 *   2. hold-context   — institutional founder/system/protocol-burn act needing
 *                       human framing.
 *   3. needs-review   — a normal valid candidate (covers BOTH verified and
 *                       pending; a pending source simply awaits a human).
 */
function reviewStatusFor(
  verification: ChronicleVerificationStatus,
  category: MemoryCategory,
  register: ChronicleReviewRegister,
): ChronicleReviewStatus {
  if (verification === "coverage-limited") return "hold-coverage";
  if (isHoldContext(category, register)) return "hold-context";
  return "needs-review";
}

/** hold ⇔ a hold-* review status; otherwise promote-on-review. */
function recommendedActionFor(
  status: ChronicleReviewStatus,
): ChronicleRecommendedAction {
  return status === "hold-coverage" || status === "hold-context"
    ? "hold"
    : "promote-on-review";
}

type ChronicleCopy = {
  proposedTitle: string;
  proposedSummary: string;
  /** A SHORT angle LABEL for a future curator — never generated Story prose. */
  proposedStoryAngle: string;
};

/**
 * Generate OWN protocol-voice, person-free, money-free proposed copy from the
 * candidate's STRUCTURE (category / register / source kind) — never from the
 * MemoryCandidate's own copy. No "first ever" is asserted: coverage-limited
 * candidates are held and a curator confirms any historic-first on promotion.
 */
function suggestChronicleCopy(mc: MemoryCandidate): ChronicleCopy {
  const { category, register, createdFrom } = mc;

  if (category === "membership") {
    if (createdFrom === "rank-reached") {
      return {
        proposedTitle: "A seat reached a new recognition rank.",
        proposedSummary:
          "Cumulative on-chain activity moved a seat to a new recognition rank.",
        proposedStoryAngle: "rank-recognition",
      };
    }
    if (createdFrom === "new-member") {
      return {
        proposedTitle: "A new seat entered the membership registry.",
        proposedSummary:
          "A new seat was recorded on-chain, expanding the membership.",
        proposedStoryAngle: "new-seat",
      };
    }
    return {
      proposedTitle: "A seat was recorded in the membership registry.",
      proposedSummary: "A membership action was recorded on-chain.",
      proposedStoryAngle: "membership-record",
    };
  }

  if (category === "continuity") {
    return {
      proposedTitle: "A seat returned to the protocol.",
      proposedSummary:
        "A seat recorded repeat participation within the protocol's history.",
      proposedStoryAngle: "member-return",
    };
  }

  if (category === "milestone") {
    return {
      proposedTitle: "A pre-declared protocol milestone was recorded.",
      proposedSummary:
        "A pre-declared protocol threshold was recorded on-chain.",
      proposedStoryAngle: "protocol-milestone",
    };
  }

  if (category === "founder-action") {
    // A protocol-wallet burn arrives here as a founder-action (the upstream
    // category precedence). Describe it as a burn ONLY when the source kind says
    // so — otherwise it is an institutional funding movement, never a burn.
    if (createdFrom === "burn-founder") {
      return {
        proposedTitle: "A protocol-initiated burn reduced supply.",
        proposedSummary:
          "SYN was permanently sent to the burn address from a protocol wallet, lowering circulating supply.",
        proposedStoryAngle: "supply-burn",
      };
    }
    return {
      proposedTitle: "An institutional protocol funding movement was recorded.",
      proposedSummary:
        "A protocol wallet recorded an incoming institutional funding movement.",
      proposedStoryAngle: "institutional-funding",
    };
  }

  if (category === "burn") {
    return {
      proposedTitle: "A community burn reduced supply.",
      proposedSummary:
        "SYN was permanently sent to the burn address, lowering circulating supply.",
      proposedStoryAngle: "community-burn",
    };
  }

  if (category === "artifact") {
    return {
      proposedTitle: "A recognized artifact was issued.",
      proposedSummary:
        "The Archive issued a verifiable artifact, expanding the protocol's permanent record.",
      proposedStoryAngle: "archive-issuance",
    };
  }

  if (category === "liquidity") {
    return {
      proposedTitle: "A protocol liquidity action was recorded.",
      proposedSummary: "A liquidity action was recorded on the SYN/USDC pair.",
      proposedStoryAngle: "liquidity-structure",
    };
  }

  if (category === "treasury") {
    return {
      proposedTitle: "A protocol treasury flow was recorded.",
      proposedSummary: "A USDC flow through a protocol wallet was recorded.",
      proposedStoryAngle: "treasury-flow",
    };
  }

  // RESERVED categories (genesis / chapter / operations / system-wallet-action)
  // have no live producer — a safe, non-fabricating fallback that a curator
  // would re-frame on promotion. Register kept generic ("protocol-level").
  void register;
  return {
    proposedTitle: "A protocol-level event was recorded.",
    proposedSummary: "A verifiable protocol-level event was recorded on-chain.",
    proposedStoryAngle: "protocol-record",
  };
}

/**
 * The "why this is eligible" line. Cites the structural tier + register and is
 * coverage-aware: a coverage-limited candidate explicitly asserts NO historic
 * first, and a pending candidate explicitly awaits verification. Recognition
 * only — never ROI/yield/governance/return.
 */
function significanceReasonFor(
  mc: MemoryCandidate,
  register: ChronicleReviewRegister,
  verification: ChronicleVerificationStatus,
): string {
  const base =
    `Tier ${mc.tier} ${register} moment, carried from a Memory Candidate with ` +
    "full Signal → Event → Tx/Block lineage. Recognition only — it confers no " +
    "rights, rewards, or return.";
  if (verification === "coverage-limited") {
    return (
      base +
      " Held pending fuller scan coverage; no historic-first claim is asserted " +
      "(a curator confirms any first on promotion)."
    );
  }
  if (verification === "pending") {
    return (
      base +
      " The source is not yet confirmed on-chain; it awaits verification before review."
    );
  }
  return base;
}

/**
 * Validate generated copy against BOTH the protocol-language guard and the
 * Chronicle's own banned-term / forbidden-subject rules. Returns the union of
 * violations (empty = clean). Surfaced on the candidate, never silently dropped.
 */
function validateChronicleCopy(parts: ReadonlyArray<string>): string[] {
  const text = parts.join("\n");
  const errs = findForbiddenLanguage(text);
  const lower = text.toLowerCase();
  for (const term of CHRONICLE_BANNED_TERMS) {
    if (lower.includes(term)) errs.push(`contains banned term: "${term}"`);
  }
  for (const pat of CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS) {
    if (pat.test(text)) errs.push(`matches forbidden subject pattern ${pat}`);
  }
  return errs;
}

/**
 * Derive Chronicle Review Candidates from Memory Candidates. Pure &
 * deterministic: the same Memory Candidates always produce the same Chronicle
 * Candidates, in input order. Reads Memory Candidates ONLY — never the Signal or
 * event layers. Every candidate cites its MemoryCandidate and preserves the full
 * MemoryCandidate → Signal → Event → Tx/Block lineage carried on the candidate.
 * Nothing here writes to the locked Chronicle.
 */
export function deriveChronicleReviewCandidates(
  memoryCandidates: ReadonlyArray<MemoryCandidate>,
): ChronicleReviewCandidate[] {
  const out: ChronicleReviewCandidate[] = [];
  for (const mc of memoryCandidates) {
    if (!isChronicleEligible(mc)) continue;

    const register = mc.register;
    const category = mc.category;
    const subject = mc.subject;

    // Defensive: never emit a malformed candidate (a coding error in the maps).
    // Skipped, not fabricated — mirrors the Memory deriver's classification gate.
    if (validateChronicleReviewClassification({ category, register, subject }).length) {
      continue;
    }

    const hint = chronicleCategoryHint(category, register);
    const verificationStatus: ChronicleVerificationStatus = mc.verification;
    const reviewStatus = reviewStatusFor(verificationStatus, category, register);
    const copy = suggestChronicleCopy(mc);
    const significanceReason = significanceReasonFor(mc, register, verificationStatus);
    const copyViolations = validateChronicleCopy([
      copy.proposedTitle,
      copy.proposedSummary,
      copy.proposedStoryAngle,
      significanceReason,
    ]);

    out.push({
      id: `chron-${mc.id}`,
      register,
      category,
      chronicleCategoryHint: hint,
      subject,
      tier: mc.tier,
      sourceMemoryCandidateId: mc.id,
      sourceSignalId: mc.sourceSignalId,
      sourceEventId: mc.sourceEventId,
      ...(mc.sourceTxHash ? { sourceTxHash: mc.sourceTxHash } : {}),
      ...(typeof mc.sourceBlock === "bigint" ? { sourceBlock: mc.sourceBlock } : {}),
      proposedTitle: copy.proposedTitle,
      proposedSummary: copy.proposedSummary,
      proposedStoryAngle: copy.proposedStoryAngle,
      significanceReason,
      verificationStatus,
      reviewStatus,
      recommendedAction: recommendedActionFor(reviewStatus),
      createdFrom: mc.createdFrom,
      copyViolations,
    });
  }
  return out;
}
