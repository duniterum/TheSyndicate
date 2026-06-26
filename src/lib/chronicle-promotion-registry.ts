// ─── Chronicle Promotion Registry ──────────────────────────────────────────
// Pure-data leaf for the MINIMAL Chronicle Promotion layer (Sprint 5). It
// declares the ChroniclePromotionDecision vocabulary — the verdict/path enums,
// the deterministic institutional- and member-memory rule tables, and the
// classification helpers that `chronicle-promotion.ts` (the deriver) projects
// Chronicle Review Candidates through. It reads no chain, asserts no live
// status, fabricates no fact, and PUBLISHES NOTHING to the locked Chronicle.
//
// This sprint answers ONE constitutional question:
//   "Which Chronicle Review Candidates deserve permanent protocol memory?"
// It produces a BASELINE RECOMMENDATION only. Promotion to a real ChronicleEntry
// remains a HUMAN act — nothing here writes Story, Recognition, governance, or a
// public entry. The deterministic verdict is advisory; a human reviewer decides.
//
// ── ADJACENCY (docs/canon/05 §2.1) ──
// CHRONICLE PROMOTION reads CHRONICLE REVIEW CANDIDATES only. This file and the
// deriver beside it must NEVER import the raw event layer (protocol-events), the
// Signal layer (protocol-signals / signal-registry), or the Memory/Chronicle
// DERIVERS (memory-candidates / chronicle-review-candidates). Lineage back to
// Memory → Signal → Event → Tx/Block is preserved THROUGH the
// ChronicleReviewCandidate's own fields — never re-derived. The legal edge is
//   EVENT → SIGNAL → MEMORY CANDIDATE → CHRONICLE CANDIDATE → CHRONICLE PROMOTION.
//
// ── MONEY / IDENTITY GUARDRAIL (docs/canon/05 §4.5) ──
// A ChroniclePromotionDecision carries NO monetary magnitude. The verdict is
// read from the candidate's structural register/category/tier and its source
// event KIND — never from how much money moved, and never from the actor's
// identity (founder/system). A founder/system action is never auto-approved; it
// is HELD (hold-context) for human framing, exactly like the layer below.
//
// ── MEMBER-REGISTER DOCTRINE (chronicle-entries clause 6) ──
// A member/wallet/seat subject can NEVER become a protocol-institutional
// Chronicle entry, and the member-living register carries no entries yet (its
// rules are not ratified). Every member-living candidate is therefore HELD
// (hold-context); the protocol-centric counterpart (a chapter/milestone fact) is
// what gets promoted instead.

import {
  CHRONICLE_BANNED_TERMS,
  CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS,
} from "./chronicle-entries";
import type {
  ChronicleReviewCandidate,
  ChronicleReviewRegister,
} from "./chronicle-review-candidate-registry";

/**
 * The candidate's fine-grained category, read THROUGH the ChronicleReviewCandidate
 * so this layer never reaches past its adjacent neighbour into the Memory leaf.
 */
export type PromotionCategory = ChronicleReviewCandidate["category"];
/** The candidate's lineage tier, read through the ChronicleReviewCandidate. */
export type PromotionTier = ChronicleReviewCandidate["tier"];
/** The source event kind, read through the ChronicleReviewCandidate. */
export type PromotionCreatedFrom = ChronicleReviewCandidate["createdFrom"];

/**
 * The four promotion verdicts. Same vocabulary as the human review statuses, so
 * a curator's later hand-decision uses the same words as the baseline:
 *   • approved      — baseline recommends this deserves a permanent entry.
 *   • rejected      — routine / unsafe; not permanent protocol memory.
 *   • hold-context  — valid, but its meaning needs human framing first
 *                     (founder/system acts, deployments, member-living moments).
 *   • hold-coverage — scan coverage is insufficient to assert the claim safely.
 */
export type ChroniclePromotionVerdict =
  | "approved"
  | "rejected"
  | "hold-context"
  | "hold-coverage";

/**
 * Which permanent-memory track a candidate would travel if promoted.
 *   • institutional-memory — the protocol-institutional Chronicle (the only
 *     register with live entries today).
 *   • member-memory        — the member-living register (modelled, NOT ratified).
 *   • deferred             — held (coverage/context); no track chosen yet.
 *   • none                 — rejected; it travels no track.
 */
export type ChroniclePromotionPath =
  | "institutional-memory"
  | "member-memory"
  | "deferred"
  | "none";

/**
 * Reviewer marker for a DETERMINISTIC BASELINE decision. It is intentionally NOT
 * a person — it records that a machine rule produced the recommendation. A human
 * decision later overwrites `reviewer` with a real curator handle and stamps a
 * `timestamp`. The baseline never stamps a time (it is recomputed each render).
 */
export const BASELINE_REVIEWER = "deterministic-baseline" as const;

/**
 * A Chronicle Promotion Decision — the deterministic BASELINE recommendation for
 * ONE Chronicle Review Candidate. It answers "does this deserve permanent
 * protocol memory?" and proposes a track, WITHOUT publishing anything. The six
 * canonical fields (candidateId, decision, reviewer, rationale, timestamp,
 * promotionPath) are the heart; the remaining fields preserve the full lineage
 * (Chronicle → Memory → Signal → Event → Tx/Block) and the rule that fired, so
 * the decision is self-auditable.
 */
export type ChroniclePromotionDecision = {
  // ── Canonical decision fields (Sprint-5 spec §1) ──
  /** The ChronicleReviewCandidate.id this decision is about. */
  candidateId: string;
  decision: ChroniclePromotionVerdict;
  /** Baseline marker (BASELINE_REVIEWER); a human handle replaces it later. */
  reviewer: string;
  /** Person-free, money-free explanation of WHY the rule produced this verdict. */
  rationale: string;
  /** Human decision time. null for a baseline recommendation (no human yet). */
  timestamp: number | null;
  promotionPath: ChroniclePromotionPath;
  // ── Preserved lineage / classification (carried, never re-read) ──
  /** The institutional/member memory rule bucket that fired (audit label). */
  ruleBucket: string;
  register: ChronicleReviewRegister;
  category: PromotionCategory;
  tier: PromotionTier;
  sourceMemoryCandidateId: string;
  sourceSignalId: string;
  sourceEventId: string;
  sourceTxHash?: string;
  sourceBlock?: bigint;
  /** Banned-language violations in the rationale (must be empty). */
  rationaleViolations: string[];
};

/** The deterministic outcome of a memory rule, before coverage/copy overrides. */
export type MemoryRuleResult = {
  verdict: ChroniclePromotionVerdict;
  /** Short audit label for the matched bucket (person-free). */
  bucket: string;
  /** Person-free reason fragment explaining the bucket's disposition. */
  reason: string;
};

/** A documented promotion-guidance row for the §3/§4 guidance tables. */
export type PromotionGuidanceRow = {
  /** Human-readable bucket name (matches the spec's evaluation list). */
  bucket: string;
  /** The baseline verdict this bucket leans to. */
  baseline: ChroniclePromotionVerdict;
  /** Why — person-free, money-free. */
  guidance: string;
};

/**
 * INSTITUTIONAL MEMORY RULES (spec §3). Deterministic guidance for each
 * protocol-institutional bucket. "approved" = deserves permanent memory now;
 * "hold-context" = significant but needs human framing first; "rejected" =
 * routine. Significance is STRUCTURAL (category + first-of-kind), never "because
 * the founder did it" and never "because the amount was large".
 */
export const INSTITUTIONAL_MEMORY_GUIDANCE: ReadonlyArray<PromotionGuidanceRow> = [
  {
    bucket: "protocol milestone",
    baseline: "approved",
    guidance:
      "A pre-declared protocol threshold is a permanent coordinate — it is true in ten years and happened once.",
  },
  {
    bucket: "chapter completion",
    baseline: "approved",
    guidance:
      "A chapter opening/closing is a structural coordinate every seat is anchored to; permanent and singular.",
  },
  {
    bucket: "liquidity seeding",
    baseline: "approved",
    guidance:
      "The first liquidity action establishes the SYN/USDC pair — a one-time foundational protocol fact.",
  },
  {
    bucket: "liquidity removal",
    baseline: "hold-context",
    guidance:
      "Removing liquidity can mean migration or wind-down; a human must frame which before it becomes permanent memory.",
  },
  {
    bucket: "treasury acquisition",
    baseline: "approved",
    guidance:
      "A first treasury funding is the moment a protocol wallet acquired the means to operate; significant and singular.",
  },
  {
    bucket: "treasury deployment",
    baseline: "hold-context",
    guidance:
      "An outflow's significance depends on where it went and why; a human frames a deployment before permanent memory.",
  },
  {
    bucket: "treasury revenue",
    baseline: "rejected",
    guidance:
      "Recurring market/treasury flow is routine activity — it belongs in Activity, not permanent Chronicle memory.",
  },
  {
    bucket: "operations spending",
    baseline: "hold-context",
    guidance:
      "Operational spending is routine unless a human frames a specific spend as institutionally significant.",
  },
  {
    // Spec §3 bucket "founder funding" — labelled protocol-centrically (the
    // doctrine bans person framing; a protocol-wallet acts, not a person).
    bucket: "protocol-wallet funding",
    baseline: "hold-context",
    guidance:
      "A protocol-wallet funding movement is never permanent memory by identity; a human frames its institutional effect.",
  },
  {
    // Spec §3 bucket "founder burn" — labelled protocol-centrically.
    bucket: "protocol-wallet burn",
    baseline: "hold-context",
    guidance:
      "A protocol-initiated supply burn is historic, but a human must frame it protocol-centrically (e.g. Proof of Burn) — never as a person's act.",
  },
  {
    bucket: "artifact issuance",
    baseline: "approved",
    guidance:
      "An artifact entering the archive permanently expands the protocol's issued record; singular per artifact.",
  },
];

/**
 * MEMBER MEMORY RULES (spec §4). The member-living register is MODELLED but NOT
 * ratified for permanent entries, and clause 6 forbids a member/wallet/seat
 * subject from entering the protocol-institutional Chronicle. So EVERY member
 * bucket is HELD (hold-context) today: the promotable form of a "first member"
 * or "milestone member" is its PROTOCOL-CENTRIC counterpart (a chapter/milestone
 * fact handled by the institutional rules), not a member-subject entry.
 */
export const MEMBER_MEMORY_GUIDANCE: ReadonlyArray<PromotionGuidanceRow> = [
  {
    bucket: "first member",
    baseline: "hold-context",
    guidance:
      "Not promoted as a member entry (clause 6 forbids member-subject entries). The protocol-centric counterpart — a chapter going from empty to inhabited — is the promotable form; the member-living record is held pending register ratification.",
  },
  {
    bucket: "milestone member",
    baseline: "hold-context",
    guidance:
      "Promote the protocol milestone (institutional), not the member subject. The member-living recognition is held pending member-register ratification.",
  },
  {
    bucket: "member capital-footprint recognition",
    baseline: "hold-context",
    guidance:
      "Capital footprint is recognition only and confers nothing; a member-living moment, held pending member-register ratification.",
  },
  {
    bucket: "continuity / repeat participation",
    baseline: "hold-context",
    guidance:
      "Repeat participation is a member-living moment, not a protocol-institutional fact; held pending member-register ratification.",
  },
  {
    bucket: "artifact participation",
    baseline: "hold-context",
    guidance:
      "The artifact ISSUANCE is institutional (handled by the institutional rules); a member's act of participating is member-living and held.",
  },
];

/**
 * Person-free validation for a generated rationale: union of the protocol-
 * language guard (passed in by the deriver to avoid an extra import here is
 * unnecessary — we own the Chronicle vocabulary check) and the Chronicle's own
 * banned-term / forbidden-subject rules. Returns violations (empty = clean).
 * NOTE: the deriver also runs findForbiddenLanguage and unions the result.
 */
export function validateRationaleVocabulary(text: string): string[] {
  const errs: string[] = [];
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
 * The promotion path implied by a verdict + register. approved travels the
 * register's track; holds defer; a rejection travels no track.
 */
export function promotionPathFor(
  verdict: ChroniclePromotionVerdict,
  register: ChronicleReviewRegister,
): ChroniclePromotionPath {
  if (verdict === "approved") {
    return register === "member-living" ? "member-memory" : "institutional-memory";
  }
  if (verdict === "rejected") return "none";
  return "deferred";
}

// ─── MAINTAINER SECTION (spec §6) ──────────────────────────────────────────
// Three edge cases a future maintainer must reason through before extending the
// promotion rules. They are NOT handled by special-case code — they are the
// doctrine the baseline already encodes, written down so an override or an
// extension does not silently break it.
//
// 1. PROTOCOL-MEMORY edge case — one event, two permanent coordinates.
//    A single purchase can cross a pre-declared milestone AND close a chapter at
//    once, producing TWO institutional candidates that BOTH baseline-approve.
//    They are distinct permanent coordinates (a milestone is not a chapter); a
//    maintainer must keep them as two entries, never dedupe them into one, and
//    must never let either name the member whose purchase triggered them
//    (clause 6 — the promotable form is the protocol fact, not the person).
//
// 2. FOUNDER-TRANSPARENCY edge case — held, not hidden, not heroised.
//    A protocol-wallet (the "founder" wallet) funding the treasury or burning
//    supply is real and historic, and transparency demands it be RECORDED — but
//    it is ALWAYS hold-context, never auto-approved. The failure is two-sided:
//    suppressing it (opacity) OR promoting it as a heroic personal act
//    (identity/Recognition leak, banned vocabulary). The baseline holds it for
//    human framing and the copy is forced protocol-centric ("protocol-wallet
//    funding/burn", e.g. Proof of Burn) — never "the founder did X". A maintainer
//    overriding to approve must keep the framing protocol-centric and person-free.
//
// 3. DAO-TRANSITION edge case — ratifying the member-living register.
//    Today the member-living register is unratified, so memberRule() holds every
//    member candidate. If governance later ratifies it (a DAO transition), the
//    member-memory TRACK already exists (promotionPathFor → "member-memory") and
//    the change is localised to memberRule() — flipping member buckets from
//    hold-context to real verdicts — WITHOUT touching institutionalRule(). Three
//    invariants survive the transition: (a) promotion stays a human/governance
//    act (no auto-publish); (b) historical candidates are RE-DERIVED under the
//    new rule, never retro-written over existing institutional entries; (c)
//    clause 6 still holds — a member subject enters the member-living register,
//    NEVER the protocol-institutional Chronicle.
