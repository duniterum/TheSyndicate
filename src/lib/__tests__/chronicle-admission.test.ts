// src/lib/__tests__/chronicle-admission.test.ts
// Guard test for the CHRONICLE ADMISSION layer (Sprint 12) — the inspection-only
// bridge INSTITUTIONAL REGISTER ENTRY → CHRONICLE ADMISSION CANDIDATE.
//
// What it proves:
//   • member-living entries are EXCLUDED entirely (clause 6) — never a candidate
//   • precedence is COPY > COVERAGE > RULES (P1 copy, P2 lineage, P3 status, P4 rules)
//   • admission keys on the rule BUCKET, never the amount or identity; unknown
//     buckets are NEVER auto-admitted
//   • the bucket table matches ADMISSION_ADMIT_BUCKETS over the full institutional
//     bucket vocabulary (∪ "genesis-seed")
//   • the proposed Chronicle classification is self-consistent and never member-living
//   • the deriver is pure, deterministic, order-preserving, and non-mutating
//   • the maintainer notes exist (exactly 4) and stay copy-clean
//   • end-to-end over the live genesis seed: the active protocol-birth facts are
//     admitted, the held ordinals stay held, the member ordinal is excluded

import { describe, it, expect } from "vitest";
import { deriveChronicleAdmissionCandidates } from "../chronicle-admission";
import {
  ADMISSION_ADMIT_BUCKETS,
  CHRONICLE_ADMISSION_MAINTAINER,
  findAdmissionCopyViolations,
  isMemberLivingEntry,
  proposedChronicleCategoryFor,
  resolveAdmission,
} from "../chronicle-admission-registry";
import { registerForCategory } from "../chronicle-entries";
import { deriveGenesisRegisterEntries } from "../institutional-register-genesis";
import { mergeInstitutionalEntries, findPublicVocabularyViolations } from "../institutional-register-public";
import {
  INSTITUTIONAL_COPY_BUCKETS,
  INSTITUTIONAL_REGISTER,
  type InstitutionalRegister,
  type InstitutionalRegisterEntry,
} from "../institutional-register-registry";
import { findForbiddenLanguage } from "../protocol-language";

// A complete, admittable baseline entry. Overrides tweak one axis at a time.
function makeEntry(o: Partial<InstitutionalRegisterEntry> = {}): InstitutionalRegisterEntry {
  return {
    id: "institutional-entry:test",
    sourcePromotionDecisionId: "promo:test",
    sourceChronicleReviewCandidateId: "review:test",
    sourceMemoryCandidateId: "memory:test",
    sourceSignalId: "signal:test",
    sourceEventId: "event:test",
    sourceTxHash: "0xabc",
    register: INSTITUTIONAL_REGISTER,
    category: "milestone",
    title: "Protocol crossed a structural threshold",
    summary: "A pre-declared structural threshold was crossed and recorded.",
    rationale: "Institutional fact.",
    verificationStatus: "verified",
    entryStatus: "active",
    createdFrom: "protocol milestone",
    createdAt: 1,
    derivedAt: null,
    lineage: ["institutional-entry:test", "promo:test"],
    copyViolations: [],
    ...o,
  };
}

const statusOf = (e: InstitutionalRegisterEntry) =>
  deriveChronicleAdmissionCandidates([e])[0]?.admissionStatus;

describe("chronicle admission — member-living exclusion (clause 6)", () => {
  it("excludes an entry whose register is member-living (defensive cast)", () => {
    const e = makeEntry({ register: "member-living" as InstitutionalRegister });
    expect(isMemberLivingEntry(e)).toBe(true);
    expect(deriveChronicleAdmissionCandidates([e])).toHaveLength(0);
  });

  it("excludes a member-subject category (membership/continuity → member-living)", () => {
    const m = makeEntry({ category: "membership", createdFrom: "genesis-seed" });
    const c = makeEntry({ category: "continuity", createdFrom: "genesis-seed" });
    expect(deriveChronicleAdmissionCandidates([m, c])).toHaveLength(0);
  });
});

describe("chronicle admission — precedence (copy > coverage > rules)", () => {
  it("P1: copy violation REJECTS even an otherwise-admissible entry", () => {
    const e = makeEntry({
      title: "Guaranteed profit for members",
      createdFrom: "treasury acquisition", // admit bucket — proves copy outranks rules
    });
    const [cand] = deriveChronicleAdmissionCandidates([e]);
    expect(cand.copyViolations.length).toBeGreaterThan(0);
    expect(cand.admissionStatus).toBe("rejected");
  });

  it("P2: an incomplete lineage HOLDS an otherwise-admissible entry", () => {
    const e = makeEntry({ sourceEventId: "   ", createdFrom: "treasury acquisition" });
    const [cand] = deriveChronicleAdmissionCandidates([e]);
    expect(cand.lineageComplete).toBe(false);
    expect(cand.admissionStatus).toBe("held");
  });

  it("P3: source status maps rejected→rejected, held→held, draft→review", () => {
    expect(statusOf(makeEntry({ entryStatus: "rejected" }))).toBe("rejected");
    expect(statusOf(makeEntry({ entryStatus: "held" }))).toBe("held");
    expect(statusOf(makeEntry({ entryStatus: "draft" }))).toBe("review");
  });

  it("P4: an active but coverage-limited entry is HELD (no historic admission)", () => {
    const e = makeEntry({
      entryStatus: "active",
      verificationStatus: "coverage-limited",
      createdFrom: "treasury acquisition",
    });
    expect(statusOf(e)).toBe("held");
  });
});

describe("chronicle admission — rule buckets (active + verified/locked)", () => {
  it("ADMITS a verified entry in an admissible bucket", () => {
    expect(statusOf(makeEntry({ createdFrom: "treasury acquisition" }))).toBe("admitted");
    expect(statusOf(makeEntry({ createdFrom: "liquidity seeding", verificationStatus: "locked" }))).toBe(
      "admitted",
    );
  });

  it("sends a founder / system-wallet action to REVIEW (significance is a human call)", () => {
    expect(
      statusOf(makeEntry({ category: "founder-action", createdFrom: "protocol-wallet funding" })),
    ).toBe("review");
    expect(
      statusOf(
        makeEntry({ category: "system-wallet-action", createdFrom: "system-wallet action" }),
      ),
    ).toBe("review");
  });

  it("never auto-admits an UNKNOWN bucket (falls through to review)", () => {
    expect(statusOf(makeEntry({ createdFrom: "some-future-bucket" }))).toBe("review");
  });

  it("matches ADMISSION_ADMIT_BUCKETS across the full bucket vocabulary (∪ genesis-seed)", () => {
    const buckets = [...new Set([...INSTITUTIONAL_COPY_BUCKETS, "genesis-seed"])];
    for (const bucket of buckets) {
      // category 'milestone' carries no human-significance requirement, so the
      // verdict is decided purely by the bucket.
      const status = statusOf(makeEntry({ category: "milestone", createdFrom: bucket }));
      const expected = ADMISSION_ADMIT_BUCKETS.has(bucket) ? "admitted" : "review";
      expect(status, `bucket "${bucket}"`).toBe(expected);
    }
  });
});

describe("chronicle admission — proposed Chronicle classification", () => {
  it("carries a self-consistent register, never member-living, for any candidate", () => {
    const entries = [
      makeEntry({ category: "milestone", createdFrom: "protocol milestone" }),
      makeEntry({ category: "burn", createdFrom: "genesis-seed", verificationStatus: "locked" }),
      makeEntry({ category: "chapter", createdFrom: "chapter completion" }),
      makeEntry({ category: "founder-action", createdFrom: "protocol-wallet burn" }),
    ];
    for (const cand of deriveChronicleAdmissionCandidates(entries)) {
      expect(cand.proposedChronicleRegister).toBe(
        registerForCategory(proposedChronicleCategoryFor(cand.category)),
      );
      expect(cand.proposedChronicleRegister).toBe("protocol-institutional");
    }
  });
});

describe("chronicle admission — purity & determinism", () => {
  it("is deterministic, order-preserving, and non-mutating", () => {
    const entries = [
      makeEntry({ id: "institutional-entry:a", createdFrom: "treasury acquisition" }),
      makeEntry({ id: "institutional-entry:b", entryStatus: "held" }),
      makeEntry({ id: "institutional-entry:c", createdFrom: "operations spending" }),
    ];
    const snapshot = JSON.stringify(entries);
    const r1 = deriveChronicleAdmissionCandidates(entries);
    const r2 = deriveChronicleAdmissionCandidates(entries);
    expect(r1).toEqual(r2);
    expect(r1.map((c) => c.sourceInstitutionalEntryId)).toEqual([
      "institutional-entry:a",
      "institutional-entry:b",
      "institutional-entry:c",
    ]);
    expect(JSON.stringify(entries)).toBe(snapshot); // input untouched
  });
});

describe("chronicle admission — maintainer notes", () => {
  it("declares exactly four copy-clean maintainer notes", () => {
    expect(CHRONICLE_ADMISSION_MAINTAINER).toHaveLength(4);
    for (const { topic, note } of CHRONICLE_ADMISSION_MAINTAINER) {
      expect(topic.trim().length).toBeGreaterThan(0);
      expect(note.trim().length).toBeGreaterThan(0);
      expect(findForbiddenLanguage(note)).toEqual([]);
      expect(findPublicVocabularyViolations(note)).toEqual([]);
    }
  });
});

describe("chronicle admission — end-to-end over the genesis seed", () => {
  const merged = mergeInstitutionalEntries(deriveGenesisRegisterEntries(), []);
  const candidates = deriveChronicleAdmissionCandidates(merged);

  it("excludes the member ordinal, admits the active protocol-birth facts, holds the rest", () => {
    // 9 genesis entries → earliest-member (member-living) excluded → 8 candidates.
    expect(candidates).toHaveLength(8);
    expect(candidates.filter((c) => c.admissionStatus === "admitted")).toHaveLength(6);
    expect(candidates.filter((c) => c.admissionStatus === "held")).toHaveLength(2);
    expect(
      candidates.some((c) => c.sourceInstitutionalEntryId.includes("earliest-member")),
    ).toBe(false);
  });

  it("every genesis candidate carries clean copy and a protocol-institutional register", () => {
    for (const c of candidates) {
      expect(
        findAdmissionCopyViolations(`${c.title}\n${c.summary}`, c.verificationStatus),
      ).toEqual([]);
      expect(c.copyViolations).toEqual([]);
      expect(c.proposedChronicleRegister).toBe("protocol-institutional");
    }
  });
});

describe("chronicle admission — resolveAdmission unit contract", () => {
  it("returns a sober, non-empty reason for every disposition", () => {
    const base = {
      category: "milestone" as const,
      verificationStatus: "verified" as const,
      copyViolations: [] as string[],
      lineageComplete: true,
    };
    const cases = [
      { ...base, createdFrom: "treasury acquisition", entryStatus: "active" as const },
      { ...base, createdFrom: "operations spending", entryStatus: "active" as const },
      { ...base, createdFrom: "protocol milestone", entryStatus: "draft" as const },
      { ...base, createdFrom: "protocol milestone", entryStatus: "held" as const },
    ];
    for (const c of cases) {
      const r = resolveAdmission(c);
      expect(r.reason.trim().length).toBeGreaterThan(0);
      expect(["admitted", "review", "held", "rejected"]).toContain(r.status);
    }
  });
});
