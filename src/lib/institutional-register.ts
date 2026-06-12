// ─── Institutional Register (deriver) ──────────────────────────────────────
// The Institutional Register layer (Sprint 6). It projects each Chronicle
// Promotion Decision into a durable InstitutionalRegisterEntry — the lawful
// receiving store for APPROVED protocol-institutional decisions.
//
// IT PUBLISHES NOTHING to the public Chronicle. No existing Chronicle entry is
// mutated; no Story, Recognition, governance, member register, or contract is
// touched. An entry is durable protocol memory, not public publishing. Promotion
// to an `active` durable entry remains a HUMAN / GOVERNANCE act: a baseline
// approval becomes a `draft`, and only a human-finalised decision (reviewer ≠
// baseline, timestamp set) yields `active`.
//
// ── ADJACENCY (docs/canon/05 §2.1) ──
// Reads CHRONICLE PROMOTION DECISIONS only. It must NEVER import the Chronicle-
// review layer, the Memory layer, the Signal layer, or the raw event layer.
// Lineage back through Promotion → Chronicle → Memory → Signal → Event → Tx/Block
// is carried THROUGH each decision's own fields — never re-derived. It MAY use the
// Chronicle vocabulary guard (validateRationaleVocabulary, re-exported by the
// promotion registry) and the protocol-language guard, being the Chronicle's own
// downstream.
//
// ── LAWFUL PARALLEL SOURCE (Sprint 9, spec §3 exception) ──
// THIS deriver remains promotion-only. A SEPARATE, documented leaf
// (institutional-register-genesis.ts) seeds verified/locked protocol-birth facts
// that PREDATE the event scanner directly from on-chain-truth config constants.
// Those seeds are MERGED with this deriver's output at the public view (deduped
// by transaction hash, locked seed wins) — they never flow through, and never
// alter, this file. See that leaf's header for the §3 documentation.
//
// ── REGISTER RULES (spec §2, §4) ──
//   • Only protocol-institutional decisions create entries. A member-living
//     decision is EXCLUDED entirely (the member register is reserved for DAO
//     ratification; clause 6 forbids a member subject here).
//   • approved      → draft (active iff human-finalised AND coverage-sufficient).
//   • hold-context  → held   (retained, never dropped).
//   • hold-coverage → held   (verification = coverage-limited; no historic wording).
//   • rejected      → rejected (retained for inspection, never active).

import { findForbiddenLanguage } from "./protocol-language";
import {
  validateRationaleVocabulary,
  type ChroniclePromotionDecision,
} from "./chronicle-promotion-registry";
import {
  INSTITUTIONAL_REGISTER,
  findHistoricClaims,
  institutionalCopyFor,
  institutionalEntryStatus,
  isHumanFinalizedDecision,
  type InstitutionalRegisterEntry,
  type InstitutionalVerificationStatus,
} from "./institutional-register-registry";

/** Build the ordered, human-readable lineage trail for an entry. */
function buildLineage(
  entryId: string,
  sourcePromotionDecisionId: string,
  d: ChroniclePromotionDecision,
): string[] {
  const trail = [
    entryId,
    sourcePromotionDecisionId,
    `chronicle-candidate:${d.candidateId}`,
    `memory-candidate:${d.sourceMemoryCandidateId}`,
    `signal:${d.sourceSignalId}`,
    `event:${d.sourceEventId}`,
  ];
  if (d.sourceTxHash) trail.push(`tx:${d.sourceTxHash}`);
  if (d.sourceBlock !== undefined) trail.push(`block:${d.sourceBlock.toString()}`);
  return trail;
}

/**
 * Derive the Institutional Register from a set of Chronicle Promotion Decisions,
 * preserving input order. Pure and deterministic: the same input always yields
 * the same output; no entry publishes anything and no existing Chronicle entry is
 * read or mutated. Member-living decisions are excluded (never written here).
 */
export function deriveInstitutionalRegister(
  decisions: ReadonlyArray<ChroniclePromotionDecision>,
): InstitutionalRegisterEntry[] {
  const out: InstitutionalRegisterEntry[] = [];

  for (const d of decisions) {
    // Register rule (§4): only protocol-institutional decisions create entries.
    if (d.register !== INSTITUTIONAL_REGISTER) continue;

    const coverageLimited = d.decision === "hold-coverage";
    const verificationStatus: InstitutionalVerificationStatus = coverageLimited
      ? "coverage-limited"
      : "verified";

    const humanFinalized = isHumanFinalizedDecision(d);
    const entryStatus = institutionalEntryStatus(d.decision, {
      humanFinalized,
      coverageOk: !coverageLimited,
    });

    const { title, summary } = institutionalCopyFor(d.ruleBucket);

    // Defence in depth: re-validate ALL copy (generated title/summary + carried
    // rationale) for banned terms, forbidden language, and ungated historic claims.
    const copyViolations = [
      ...validateRationaleVocabulary(title),
      ...validateRationaleVocabulary(summary),
      ...validateRationaleVocabulary(d.rationale),
      ...findForbiddenLanguage(`${title}\n${summary}`),
      ...findHistoricClaims(title, verificationStatus),
      ...findHistoricClaims(summary, verificationStatus),
    ];

    const id = `institutional-entry:${d.candidateId}`;
    const sourcePromotionDecisionId = `promotion-decision:${d.candidateId}`;

    out.push({
      id,
      sourcePromotionDecisionId,
      sourceChronicleReviewCandidateId: d.candidateId,
      sourceMemoryCandidateId: d.sourceMemoryCandidateId,
      sourceSignalId: d.sourceSignalId,
      sourceEventId: d.sourceEventId,
      sourceTxHash: d.sourceTxHash,
      sourceBlock: d.sourceBlock,
      register: INSTITUTIONAL_REGISTER,
      category: d.category,
      title,
      summary,
      rationale: d.rationale,
      verificationStatus,
      entryStatus,
      createdFrom: d.ruleBucket,
      // Durable timestamp belongs to an ACTIVE entry only (a human-finalised,
      // coverage-sufficient approval); drafts/holds/rejects stay unstamped.
      createdAt: entryStatus === "active" ? d.timestamp : null,
      derivedAt: null,
      lineage: buildLineage(id, sourcePromotionDecisionId, d),
      copyViolations,
    });
  }

  return out;
}
