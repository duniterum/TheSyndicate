// Sprint 7 — PUBLIC Institutional Register selection + copy safety.
//
// Guards the public read-only surface: only active/draft are ever shown, ordering
// is newest-first, the selector never mutates its input, and every generated
// institutional copy bucket stays sober (§5 banlist + protocol-language guard +
// no coverage-ungated historic claim).

import { describe, it, expect } from "vitest";
import {
  PUBLIC_INSTITUTIONAL_STATUSES,
  isPubliclyVisible,
  selectPublicInstitutionalEntries,
  findPublicVocabularyViolations,
} from "../institutional-register-public";
import {
  INSTITUTIONAL_COPY_BUCKETS,
  institutionalCopyFor,
  findHistoricClaims,
  type InstitutionalEntryStatus,
  type InstitutionalRegisterEntry,
} from "../institutional-register-registry";
import { findForbiddenLanguage } from "../protocol-language";

function makeEntry(
  id: string,
  entryStatus: InstitutionalEntryStatus,
): InstitutionalRegisterEntry {
  return {
    id,
    sourcePromotionDecisionId: `promotion-decision:${id}`,
    sourceChronicleReviewCandidateId: `chronicle-review:${id}`,
    sourceMemoryCandidateId: `memory-candidate:${id}`,
    sourceSignalId: `signal:${id}`,
    sourceEventId: `event:${id}`,
    register: "protocol-institutional",
    category: "milestone" as InstitutionalRegisterEntry["category"],
    title: "Protocol event recorded",
    summary: "A protocol event recorded as durable protocol memory.",
    rationale: "Recorded for inspection.",
    verificationStatus: "verified",
    entryStatus,
    createdFrom: "protocol event",
    createdAt: entryStatus === "active" ? 1_700_000_000_000 : null,
    derivedAt: null,
    lineage: [],
    copyViolations: [],
  };
}

describe("PUBLIC_INSTITUTIONAL_STATUSES", () => {
  it("is exactly active + draft", () => {
    expect([...PUBLIC_INSTITUTIONAL_STATUSES]).toEqual(["active", "draft"]);
  });

  it("isPubliclyVisible matches the status set", () => {
    expect(isPubliclyVisible({ entryStatus: "active" })).toBe(true);
    expect(isPubliclyVisible({ entryStatus: "draft" })).toBe(true);
    expect(isPubliclyVisible({ entryStatus: "held" })).toBe(false);
    expect(isPubliclyVisible({ entryStatus: "rejected" })).toBe(false);
  });
});

describe("selectPublicInstitutionalEntries", () => {
  it("drops held and rejected, keeps active and draft", () => {
    const entries = [
      makeEntry("a", "active"),
      makeEntry("h", "held"),
      makeEntry("d", "draft"),
      makeEntry("r", "rejected"),
    ];
    const got = selectPublicInstitutionalEntries(entries);
    expect(got.map((e) => e.id).sort()).toEqual(["a", "d"]);
    for (const e of got) {
      expect(["active", "draft"]).toContain(e.entryStatus);
    }
  });

  it("returns newest-first (reverse of the oldest→newest deriver order)", () => {
    // Deriver order is oldest → newest; public view is newest first.
    const entries = [
      makeEntry("oldest", "active"),
      makeEntry("middle", "draft"),
      makeEntry("newest", "active"),
    ];
    expect(selectPublicInstitutionalEntries(entries).map((e) => e.id)).toEqual([
      "newest",
      "middle",
      "oldest",
    ]);
  });

  it("does not mutate the caller's input array", () => {
    const entries = [makeEntry("a", "active"), makeEntry("b", "draft")];
    const snapshot = entries.map((e) => e.id);
    selectPublicInstitutionalEntries(entries);
    expect(entries.map((e) => e.id)).toEqual(snapshot);
  });

  it("yields an empty list when nothing is public", () => {
    const entries = [makeEntry("h", "held"), makeEntry("r", "rejected")];
    expect(selectPublicInstitutionalEntries(entries)).toEqual([]);
  });
});

describe("findPublicVocabularyViolations (§5 sober language)", () => {
  it("flags hype / financial-promise vocabulary", () => {
    expect(findPublicVocabularyViolations("a legendary, guaranteed profit")).not.toEqual([]);
    expect(findPublicVocabularyViolations("expect a return on your yield")).not.toEqual([]);
    expect(findPublicVocabularyViolations("this is a governance right")).not.toEqual([]);
  });

  it("does not false-positive on benign protocol words", () => {
    expect(
      findPublicVocabularyViolations("Recurring protocol treasury revenue flow; a structural threshold."),
    ).toEqual([]);
    expect(findPublicVocabularyViolations("")).toEqual([]);
  });
});

describe("generated institutional copy stays sober across every bucket", () => {
  const buckets = [...INSTITUTIONAL_COPY_BUCKETS, "___unknown_bucket___"];

  for (const bucket of buckets) {
    it(`bucket "${bucket}" has clean, coverage-safe public copy`, () => {
      const { title, summary } = institutionalCopyFor(bucket);
      const text = `${title} ${summary}`;
      expect(findPublicVocabularyViolations(text)).toEqual([]);
      expect(findForbiddenLanguage(text)).toEqual([]);
      // Coverage-limited is the strictest posture: no historic claim allowed.
      expect(findHistoricClaims(text, "coverage-limited")).toEqual([]);
    });
  }
});
