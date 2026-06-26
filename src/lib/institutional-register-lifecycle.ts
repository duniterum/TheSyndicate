// Institutional Register - PROTOCOL LIFECYCLE seed leaf.
//
// A documented parallel source for completed, verified protocol lifecycle facts
// that do not flow through the normal raw-event -> signal -> memory pipeline.
// The first Source Attribution ceremony is one such fact: its meaning is not one
// transaction alone, but the completed lifecycle of packet -> terms -> controlled
// ACTIVE -> real action -> PAUSED closure.
//
// This leaf records that lifecycle as durable Institutional Register memory.
// It is NOT a Chronicle entry, NOT public referral activation, NOT a source link,
// NOT a claim surface, and NOT a public source-aware buy path.
//
// ADJACENCY:
// PROTOCOL LIFECYCLE PROOF -> INSTITUTIONAL REGISTER ENTRY.
// This leaf imports only the lifecycle proof model, the source completion facts,
// the register vocabulary, and copy guards. It never imports event, signal,
// memory, Chronicle review, Chronicle promotion, or chain clients.

import { findPublicVocabularyViolations } from "./institutional-register-public";
import {
  INSTITUTIONAL_REGISTER,
  findHistoricClaims,
  type InstitutionalRegisterEntry,
} from "./institutional-register-registry";
import { FIRST_SOURCE_ATTRIBUTION_LIFECYCLE } from "./protocol-lifecycle";
import { findForbiddenLanguage } from "./protocol-language";
import { REAL_CONDITION_SOURCE_TEST_COMPLETION } from "./source-real-condition-test";

export const LIFECYCLE_REGISTER_CURATED_AT =
  REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.rePaused.timestamp * 1000;

const LIFECYCLE_ENTRY_ID =
  "institutional-entry:lifecycle:source-attribution-real-condition-001";

function copyViolationsFor(text: string) {
  return [
    ...findHistoricClaims(text, "locked"),
    ...findForbiddenLanguage(text),
    ...findPublicVocabularyViolations(text),
  ];
}

export function deriveProtocolLifecycleRegisterEntries(): InstitutionalRegisterEntry[] {
  const lifecycle = FIRST_SOURCE_ATTRIBUTION_LIFECYCLE;
  const completion = REAL_CONDITION_SOURCE_TEST_COMPLETION;
  const title = "Protocol completed first controlled Source Attribution lifecycle";
  const summary =
    "An internal source policy moved through terms update, controlled ACTIVE state, a real MembershipSaleV3 source-attributed receipt, and PAUSED closure. The result is durable proof of capability, not public referral activation.";
  const rationale =
    "Registered because the completed lifecycle proved a reusable protocol operation under mainnet conditions while preserving the public ZERO_SOURCE_ID boundary and returning the source to PAUSED.";
  const copyText = `${title}\n${summary}\n${rationale}`;

  return [
    {
      id: LIFECYCLE_ENTRY_ID,
      sourcePromotionDecisionId:
        "protocol-lifecycle-proof:source-attribution-real-condition-001",
      sourceChronicleReviewCandidateId: "protocol-lifecycle-proof",
      sourceMemoryCandidateId: "protocol-lifecycle-proof",
      sourceSignalId: "protocol-lifecycle-proof",
      sourceEventId: lifecycle.id,
      sourceTxHash: completion.transactions.rePaused.hash,
      sourceBlock: BigInt(completion.transactions.rePaused.block),
      register: INSTITUTIONAL_REGISTER,
      category: "milestone",
      title,
      summary,
      rationale,
      verificationStatus: "locked",
      entryStatus: "active",
      createdFrom: "protocol lifecycle proof",
      createdAt: LIFECYCLE_REGISTER_CURATED_AT,
      derivedAt: null,
      lineage: [
        LIFECYCLE_ENTRY_ID,
        "protocol-lifecycle-proof:source-attribution-real-condition-001",
        `terms-updated:${completion.transactions.termsUpdated.hash}`,
        `activated:${completion.transactions.activated.hash}`,
        `source-attributed-buy:${completion.transactions.buy.hash}`,
        `re-paused:${completion.transactions.rePaused.hash}`,
        `readback-block:${completion.latestAuthorityReadbackBlock}`,
      ],
      copyViolations: copyViolationsFor(copyText),
    },
  ];
}
