// ─── Chronicle Promotion (deriver) ─────────────────────────────────────────
// The MINIMAL Chronicle Promotion layer (Sprint 5). It projects each Chronicle
// Review Candidate into a deterministic BASELINE ChroniclePromotionDecision that
// answers "does this deserve permanent protocol memory, and on which track?".
//
// IT PUBLISHES NOTHING. No ChronicleEntry is written; no Story, Recognition, or
// governance is produced. The verdict is a RECOMMENDATION — promotion remains a
// human act. A curator may override any baseline by hand (replacing `reviewer`
// and stamping a real `timestamp`).
//
// ── ADJACENCY (docs/canon/05 §2.1) ──
// Reads CHRONICLE REVIEW CANDIDATES only. It must NEVER import the raw event
// layer (protocol-events), the Signal layer (protocol-signals / signal-registry),
// or the Memory / Chronicle-review DERIVERS (memory-candidates /
// chronicle-review-candidates). Lineage back through Memory → Signal → Event →
// Tx/Block is carried THROUGH each candidate's own fields — never re-derived.
//   EVENT → SIGNAL → MEMORY → CHRONICLE CANDIDATE → CHRONICLE PROMOTION.
// It MAY import chronicle-entries VALUES (the banned-term vocabulary) and the
// protocol-language guard, as it is the Chronicle's own downstream.
//
// ── DECISION PRECEDENCE (deterministic) ──
//   1. Unsafe copy (candidate.copyViolations non-empty) → REJECTED. Memory must
//      never inherit banned/forbidden language; a human fixes the copy first.
//   2. Coverage-limited verification → HOLD-COVERAGE. The claim cannot be made
//      safely until the scan covers deployment; never dropped, never a "first".
//   3. Otherwise apply the MEMORY RULES by register:
//        • protocol-institutional → institutional rule (approve / reject /
//          hold-context by category + source kind; identity- and amount-blind).
//        • member-living → member rule → ALWAYS hold-context (the member-living
//          register is modelled but NOT ratified; clause 6 forbids a member /
//          wallet / seat SUBJECT from a protocol-institutional entry, so the
//          protocol-centric counterpart is promoted instead).

import { findForbiddenLanguage } from "./protocol-language";
import {
  BASELINE_REVIEWER,
  promotionPathFor,
  validateRationaleVocabulary,
  type ChroniclePromotionDecision,
  type ChroniclePromotionVerdict,
  type MemoryRuleResult,
  type PromotionCategory,
  type PromotionCreatedFrom,
} from "./chronicle-promotion-registry";
import type { ChronicleReviewCandidate } from "./chronicle-review-candidate-registry";

/**
 * INSTITUTIONAL MEMORY RULE (spec §3). Deterministic verdict for a protocol-
 * institutional candidate, read from its category + source event KIND only.
 * Significance is structural: a milestone/chapter/artifact/first-funding is
 * permanent; a deployment/removal/protocol-wallet act needs human framing
 * (hold-context); recurring market flow is routine (reject). It is identity- and
 * amount-blind — who acted and how much moved never change the verdict.
 */
function institutionalRule(
  category: PromotionCategory,
  createdFrom: PromotionCreatedFrom,
): MemoryRuleResult {
  switch (category) {
    case "milestone":
      return {
        verdict: "approved",
        bucket: "protocol milestone",
        reason:
          "a pre-declared protocol threshold is a permanent, singular coordinate worth permanent memory",
      };
    case "genesis":
    case "chapter":
      return {
        verdict: "approved",
        bucket: "chapter completion",
        reason:
          "a chapter coordinate anchors every seat claimed within it; permanent and singular",
      };
    case "artifact":
      return {
        verdict: "approved",
        bucket: "artifact issuance",
        reason:
          "an artifact entering the archive permanently expands the protocol's issued record",
      };
    case "liquidity":
      if (createdFrom === "lp-add")
        return {
          verdict: "approved",
          bucket: "liquidity seeding",
          reason:
            "establishing the SYN/USDC pair is a one-time foundational protocol fact",
        };
      return {
        verdict: "hold-context",
        bucket: createdFrom === "lp-remove" ? "liquidity removal" : "liquidity action",
        reason:
          "a liquidity withdrawal can mean migration or wind-down; a human must frame which",
      };
    case "treasury":
      if (createdFrom === "vault-in")
        return {
          verdict: "approved",
          bucket: "treasury acquisition",
          reason:
            "a treasury wallet acquiring the means to operate is a significant, singular fact",
        };
      if (createdFrom === "vault-out")
        return {
          verdict: "hold-context",
          bucket: "treasury deployment",
          reason:
            "an outflow's significance depends on where it went and why; a human frames it",
        };
      if (createdFrom === "swap-buy" || createdFrom === "swap-sell")
        return {
          verdict: "rejected",
          bucket: "treasury revenue",
          reason: "recurring market flow is routine activity, not permanent memory",
        };
      return {
        verdict: "hold-context",
        bucket: "treasury flow",
        reason: "an unclassified treasury flow needs human framing before permanent memory",
      };
    case "operations":
      return {
        verdict: "hold-context",
        bucket: "operations spending",
        reason:
          "operational spending is routine unless a human frames a specific spend as significant",
      };
    case "founder-action":
      // Spec §3 "founder funding" / "founder burn". Labelled protocol-centrically
      // (a protocol-wallet acts, not a person) and ALWAYS held for human framing.
      if (createdFrom === "burn-founder")
        return {
          verdict: "hold-context",
          bucket: "protocol-wallet burn",
          reason:
            "a protocol-initiated supply burn is historic but must be framed protocol-centrically by a human",
        };
      return {
        verdict: "hold-context",
        bucket: "protocol-wallet funding",
        reason:
          "a protocol-wallet funding movement is never permanent memory by identity; a human frames its effect",
      };
    case "system-wallet-action":
      return {
        verdict: "hold-context",
        bucket: "system-wallet action",
        reason: "a system-wallet action requires human framing before permanent memory",
      };
    case "burn":
      // A protocol-institutional burn (a protocol-wallet supply reduction).
      return {
        verdict: "hold-context",
        bucket: "protocol-wallet burn",
        reason:
          "a protocol-initiated supply burn is historic but must be framed protocol-centrically by a human",
      };
    default:
      return {
        verdict: "hold-context",
        bucket: "protocol event",
        reason: "an unclassified protocol event needs human framing before permanent memory",
      };
  }
}

/**
 * MEMBER MEMORY RULE (spec §4). EVERY member-living candidate is HELD
 * (hold-context). The member-living register is modelled but NOT ratified for
 * permanent entries, and chronicle-entries clause 6 forbids a member / wallet /
 * seat SUBJECT from a protocol-institutional entry. The promotable form of a
 * "first member" or "milestone member" is its PROTOCOL-CENTRIC counterpart (a
 * chapter / milestone fact, handled by the institutional rule) — never a
 * member-subject entry. The bucket records which member moment this was.
 */
function memberRule(
  category: PromotionCategory,
  createdFrom: PromotionCreatedFrom,
): MemoryRuleResult {
  let bucket = "member-living moment";
  if (category === "membership")
    bucket = createdFrom === "rank-reached" ? "member rank recognition" : "member arrival";
  else if (category === "continuity") bucket = "continuity / repeat participation";
  else if (category === "burn") bucket = "community burn";
  return {
    verdict: "hold-context",
    bucket,
    reason:
      "a member-living moment is held: the member register is not yet ratified and a member subject cannot enter the protocol-institutional Chronicle (clause 6)",
  };
}

/** Build the person-free rationale sentence for a decision. */
function buildRationale(
  decision: ChroniclePromotionVerdict,
  rule: MemoryRuleResult,
): string {
  switch (decision) {
    case "rejected":
      return rule.bucket === "unsafe copy"
        ? "Rejected: the proposed copy carries banned or forbidden language and cannot enter protocol memory; a human must rewrite it first."
        : `Rejected (${rule.bucket}): ${rule.reason}.`;
    case "hold-coverage":
      return "Held for coverage: the scan does not cover deployment, so the claim cannot be made safely yet; never asserted as a historic first.";
    case "hold-context":
      return `Held for context (${rule.bucket}): ${rule.reason}.`;
    case "approved":
      return `Approved as a baseline recommendation (${rule.bucket}): ${rule.reason}. A human curator confirms before any permanent entry.`;
  }
}

/**
 * Derive the deterministic baseline ChroniclePromotionDecision for each Chronicle
 * Review Candidate, preserving input order. Pure and deterministic: the same
 * input always yields the same output, and no decision publishes anything.
 */
export function deriveChroniclePromotionDecisions(
  candidates: ReadonlyArray<ChronicleReviewCandidate>,
): ChroniclePromotionDecision[] {
  const out: ChroniclePromotionDecision[] = [];
  for (const c of candidates) {
    let verdict: ChroniclePromotionVerdict;
    let rule: MemoryRuleResult;

    if (c.copyViolations.length > 0) {
      // (1) Unsafe copy — reject; never inherit banned/forbidden language.
      verdict = "rejected";
      rule = {
        verdict,
        bucket: "unsafe copy",
        reason: "the proposed copy carries banned or forbidden language",
      };
    } else if (c.verificationStatus === "coverage-limited") {
      // (2) Coverage-limited — hold; the claim cannot be asserted safely yet.
      verdict = "hold-coverage";
      rule = {
        verdict,
        bucket: "coverage-limited",
        reason: "the scan window does not cover deployment",
      };
    } else {
      // (3) Apply the memory rules by register.
      rule =
        c.register === "member-living"
          ? memberRule(c.category, c.createdFrom)
          : institutionalRule(c.category, c.createdFrom);
      verdict = rule.verdict;
    }

    const rationale = buildRationale(verdict, rule);
    const rationaleViolations = [
      ...validateRationaleVocabulary(rationale),
      ...findForbiddenLanguage(rationale),
    ];

    out.push({
      candidateId: c.id,
      decision: verdict,
      reviewer: BASELINE_REVIEWER,
      rationale,
      timestamp: null,
      promotionPath: promotionPathFor(verdict, c.register),
      ruleBucket: rule.bucket,
      register: c.register,
      category: c.category,
      tier: c.tier,
      sourceMemoryCandidateId: c.sourceMemoryCandidateId,
      sourceSignalId: c.sourceSignalId,
      sourceEventId: c.sourceEventId,
      sourceTxHash: c.sourceTxHash,
      sourceBlock: c.sourceBlock,
      rationaleViolations,
    });
  }
  return out;
}
