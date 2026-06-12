// ─── Chronicle Admission deriver (Sprint 12) ───────────────────────────────
// The pure projection INSTITUTIONAL REGISTER ENTRY → CHRONICLE ADMISSION
// CANDIDATE. Given the durable Institutional Register, it returns a read-only
// eligibility verdict per entry — which verified institutional facts are
// ELIGIBLE to LATER become public Chronicle entries.
//
// PURE + DETERMINISTIC: same entries in → same candidates out, input order
// preserved, no mutation, no I/O, no clock. Nothing is published; promotion of
// an `admitted` candidate into the Chronicle remains a human / governance act.
//
// ADJACENCY (docs/canon/05 §2.1): reads INSTITUTIONAL REGISTER ENTRIES only.
// See chronicle-admission-registry.ts for the legal-import contract — this file
// inherits it (registry leaf + register public guard + Chronicle register map).

import {
  findAdmissionCopyViolations,
  isMemberLivingEntry,
  proposedChronicleCategoryFor,
  resolveAdmission,
  type ChronicleAdmissionCandidate,
} from "./chronicle-admission-registry";
import { registerForCategory } from "./chronicle-entries";
import { isLineageComplete } from "./institutional-register-public";
import type { InstitutionalRegisterEntry } from "./institutional-register-registry";

/**
 * Derive Chronicle Admission Candidates from Institutional Register entries.
 * Member-living entries (clause 6) are excluded entirely — never written. Every
 * other entry yields exactly one candidate carrying a copy>coverage>rules
 * verdict, the entry's copy/lineage verbatim, and the Chronicle classification
 * it would file under.
 */
export function deriveChronicleAdmissionCandidates(
  entries: ReadonlyArray<InstitutionalRegisterEntry>,
): ChronicleAdmissionCandidate[] {
  const out: ChronicleAdmissionCandidate[] = [];

  for (const e of entries) {
    // P0 — member-living is excluded entirely (never becomes a candidate).
    if (isMemberLivingEntry(e)) continue;

    const copyViolations = findAdmissionCopyViolations(
      `${e.title}\n${e.summary}`,
      e.verificationStatus,
    );
    const lineageComplete = isLineageComplete(e);

    const { status, reason } = resolveAdmission({
      category: e.category,
      createdFrom: e.createdFrom,
      entryStatus: e.entryStatus,
      verificationStatus: e.verificationStatus,
      copyViolations,
      lineageComplete,
    });

    const proposedChronicleCategory = proposedChronicleCategoryFor(e.category);
    const proposedChronicleRegister = registerForCategory(proposedChronicleCategory);

    out.push({
      id: `chronicle-admission:${e.id}`,
      sourceInstitutionalEntryId: e.id,
      sourcePromotionDecisionId: e.sourcePromotionDecisionId,
      sourceTxHash: e.sourceTxHash,
      register: e.register,
      category: e.category,
      createdFrom: e.createdFrom,
      title: e.title,
      summary: e.summary,
      verificationStatus: e.verificationStatus,
      sourceEntryStatus: e.entryStatus,
      admissionStatus: status,
      admissionReason: reason,
      proposedChronicleRegister,
      proposedChronicleCategory,
      lineageComplete,
      lineage: [`chronicle-admission:${e.id}`, ...e.lineage],
      copyViolations,
      derivedAt: null,
    });
  }

  return out;
}
