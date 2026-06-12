// src/lib/chronicle-entry.ts
// CHRONICLE ENTRY deriver (Sprint 13) — the final pipeline edge
//   CHRONICLE ADMISSION CANDIDATE → CHRONICLE ENTRY (institutional).
//
// A pure, deterministic projection: each Chronicle Admission Candidate becomes
// exactly one InstitutionalChronicleEntry whose publication status is decided by
// resolvePublication (copy > rules). It PUBLISHES NOTHING — an admitted candidate
// lands as a `draft`; turning a draft into a live, public Chronicle entry is a
// human / governance act this deriver never performs.
//
// ── Doctrine ──
//   • Adjacency (canon 05 §2.1): reads CHRONICLE ADMISSION CANDIDATES only. It
//     imports the admission registry leaf (candidate type) and its own entry
//     registry leaf — never the admission DERIVER, the register/promotion/review/
//     memory/signal/event layers, or the genesis seed. Lineage is carried THROUGH
//     each candidate.
//   • Institutional only (spec §6): a member-living candidate can never become an
//     institutional Chronicle entry. The admission layer already excludes member
//     subjects; this deriver DEFENSIVELY drops any candidate whose proposed
//     Chronicle register is not protocol-institutional.
//   • Money/identity-blind (canon §4.5 Rule E): the entry carries no monetary
//     magnitude; status is decided from the admission verdict + copy only.
//   • Existing Chronicle (spec §5): the locked CHRONICLE_ENTRIES are never read
//     or mutated here — this produces a SEPARATE derived institutional store.

import {
  baselinePublicationDecision,
  findAdmissionCopyViolations,
  resolvePublication,
  type InstitutionalChronicleEntry,
} from "./chronicle-entry-registry";
import { type ChronicleAdmissionCandidate } from "./chronicle-admission-registry";

const PROTOCOL_INSTITUTIONAL = "protocol-institutional" as const;

/**
 * Project one admission candidate to one institutional Chronicle entry. Copy is
 * re-validated against the carried verification posture (single-sourced through
 * findAdmissionCopyViolations) so a stale clean flag can never publish unsafe
 * copy; the re-validated violations drive the COPY > RULES precedence.
 */
function toEntry(candidate: ChronicleAdmissionCandidate): InstitutionalChronicleEntry {
  const copyViolations = findAdmissionCopyViolations(
    `${candidate.title}\n${candidate.summary}`,
    candidate.verificationStatus,
  );
  const { status } = resolvePublication(candidate.admissionStatus, copyViolations);
  const id = `chronicle-entry:${candidate.sourceInstitutionalEntryId}`;
  return {
    id,
    sourceChronicleAdmissionCandidateId: candidate.id,
    sourceInstitutionalRegisterEntryId: candidate.sourceInstitutionalEntryId,
    sourcePromotionDecisionId: candidate.sourcePromotionDecisionId,
    sourceTxHash: candidate.sourceTxHash,
    register: candidate.proposedChronicleRegister,
    category: candidate.proposedChronicleCategory,
    title: candidate.title,
    summary: candidate.summary,
    chronology: {
      // date stays null — no block timestamp is fetched anywhere in the pipeline.
      date: null,
      // Verified block height carried from the candidate (Sprint 14); null when
      // the source fact had no on-chain block anchor.
      block: candidate.sourceBlock ?? null,
      txHash: candidate.sourceTxHash ?? null,
    },
    verificationStatus: candidate.verificationStatus,
    publicationStatus: status,
    publicationDecision: baselinePublicationDecision(),
    createdFrom: candidate.createdFrom,
    copyViolations,
    // Prepend the new entry id; the candidate carries the full upstream trail.
    lineage: [id, ...candidate.lineage],
    version: 1,
    supersedes: null,
    derivedAt: null,
  };
}

/**
 * Derive the institutional Chronicle entries from a list of admission
 * candidates. Pure, deterministic, order-preserving, non-mutating.
 *
 * Member-living candidates are dropped defensively (spec §6) — the admission
 * layer never emits one, but the institutional Chronicle must never publish a
 * member-subject fact even if a malformed candidate reaches here.
 */
export function deriveInstitutionalChronicleEntries(
  candidates: readonly ChronicleAdmissionCandidate[],
): InstitutionalChronicleEntry[] {
  return candidates
    .filter((c) => c.proposedChronicleRegister === PROTOCOL_INSTITUTIONAL)
    .map(toEntry);
}
