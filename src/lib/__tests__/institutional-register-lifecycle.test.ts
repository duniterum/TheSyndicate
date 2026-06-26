import { describe, expect, it } from "vitest";

import {
  LIFECYCLE_REGISTER_CURATED_AT,
  deriveProtocolLifecycleRegisterEntries,
} from "../institutional-register-lifecycle";
import {
  buildActivityInstitutionalIndex,
  institutionalLinkForTx,
} from "../activity-institutional-link";
import { deriveChronicleAdmissionCandidates } from "../chronicle-admission";
import { findPublicVocabularyViolations } from "../institutional-register-public";
import { findHistoricClaims } from "../institutional-register-registry";
import { FIRST_SOURCE_ATTRIBUTION_LIFECYCLE } from "../protocol-lifecycle";
import { findForbiddenLanguage } from "../protocol-language";
import { REAL_CONDITION_SOURCE_TEST_COMPLETION } from "../source-real-condition-test";

const entries = deriveProtocolLifecycleRegisterEntries();
const [entry] = entries;
const copy = `${entry.title}\n${entry.summary}\n${entry.rationale}`;

describe("protocol lifecycle register seed", () => {
  it("records the completed Source Attribution lifecycle as active Register memory", () => {
    expect(entries).toHaveLength(1);
    expect(entry.id).toBe(
      "institutional-entry:lifecycle:source-attribution-real-condition-001",
    );
    expect(entry.entryStatus).toBe("active");
    expect(entry.verificationStatus).toBe("locked");
    expect(entry.register).toBe("protocol-institutional");
    expect(entry.category).toBe("milestone");
    expect(entry.createdFrom).toBe("protocol lifecycle proof");
    expect(entry.createdAt).toBe(LIFECYCLE_REGISTER_CURATED_AT);
  });

  it("anchors the durable memory to the safe-closure transaction and carries the full ceremony trail", () => {
    expect(entry.sourceTxHash).toBe(
      REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.rePaused.hash,
    );
    expect(entry.sourceBlock).toBe(
      BigInt(REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.rePaused.block),
    );
    expect(entry.lineage).toContain(
      `terms-updated:${REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.termsUpdated.hash}`,
    );
    expect(entry.lineage).toContain(
      `activated:${REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.activated.hash}`,
    );
    expect(entry.lineage).toContain(
      `source-attributed-buy:${REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.buy.hash}`,
    );
    expect(entry.lineage).toContain(
      `re-paused:${REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.rePaused.hash}`,
    );
    expect(entry.lineage).toContain(
      `readback-block:${REAL_CONDITION_SOURCE_TEST_COMPLETION.latestAuthorityReadbackBlock}`,
    );
  });

  it("keeps copy sober and does not imply public referral, claims, yield, or source paths", () => {
    expect(entry.copyViolations).toEqual([]);
    expect(findForbiddenLanguage(copy)).toEqual([]);
    expect(findPublicVocabularyViolations(copy)).toEqual([]);
    expect(findHistoricClaims(copy, entry.verificationStatus)).toEqual([]);
    expect(copy).toContain("not public referral activation");
    expect(copy).toContain("public ZERO_SOURCE_ID boundary");
    expect(copy).not.toMatch(
      /public referral is live|claim UI is live|source links are live|source dashboard is live/i,
    );
    expect(copy).not.toMatch(/passive income|downline|upline|\bROI\b|yield|guaranteed return/i);
  });

  it("links Activity to the Register only through the completed safe-closure transaction", () => {
    const index = buildActivityInstitutionalIndex(entries);
    const link = institutionalLinkForTx(
      index,
      REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.rePaused.hash,
    );

    expect(link?.entryId).toBe(entry.id);
    expect(link?.title).toBe(entry.title);
    expect(
      institutionalLinkForTx(
        index,
        REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.buy.hash,
      ),
    ).toBeNull();
  });

  it("creates a Chronicle review candidate but does not auto-publish or auto-admit it", () => {
    const [candidate] = deriveChronicleAdmissionCandidates(entries);

    expect(candidate.sourceInstitutionalEntryId).toBe(entry.id);
    expect(candidate.admissionStatus).toBe("review");
    expect(candidate.admissionReason).toContain("not auto-admissible");
    expect(candidate.proposedChronicleRegister).toBe("protocol-institutional");
    expect(FIRST_SOURCE_ATTRIBUTION_LIFECYCLE.nextQuestions.join("\n")).not.toMatch(
      /Should this proof enter Chronicle\/Register memory/i,
    );
  });
});
