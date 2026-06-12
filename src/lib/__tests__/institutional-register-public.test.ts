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
  deriveRegisterStatus,
  isLineageComplete,
  REGISTER_STATUS_LABELS,
  type RegisterDataStatus,
  type RegisterSourceState,
} from "../institutional-register-public";
import {
  INSTITUTIONAL_COPY_BUCKETS,
  institutionalCopyFor,
  findHistoricClaims,
  type InstitutionalEntryStatus,
  type InstitutionalRegisterEntry,
} from "../institutional-register-registry";
import { findForbiddenLanguage } from "../protocol-language";

function makeSource(
  id: string,
  over: Partial<RegisterSourceState> = {},
): RegisterSourceState {
  return {
    id,
    label: `Source ${id}`,
    isLoading: false,
    isError: false,
    dataUpdatedAt: 0,
    ...over,
  };
}

/** Six healthy sources with successful reads — the common "all good" baseline. */
function healthySources(updatedAt = 1_700_000_000_000): RegisterSourceState[] {
  return ["a", "b", "c", "d", "e", "f"].map((id) => makeSource(id, { dataUpdatedAt: updatedAt }));
}

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

// ─── Sprint 8 — register data status ────────────────────────────────────────

describe("deriveRegisterStatus — priority (most limiting first)", () => {
  it("is 'loading' while ANY source is still loading (even with a failure present)", () => {
    const sources = [
      makeSource("a", { isLoading: true }),
      makeSource("b", { isError: true }),
      ...healthySources().slice(2),
    ];
    const s = deriveRegisterStatus({ sources, entryCount: 0, coverageComplete: true });
    expect(s.status).toBe("loading");
  });

  it("is 'error' when EVERY source failed", () => {
    const sources = ["a", "b", "c"].map((id) => makeSource(id, { isError: true }));
    const s = deriveRegisterStatus({ sources, entryCount: 0, coverageComplete: true });
    expect(s.status).toBe("error");
    expect(s.sourcesAvailable).toBe(0);
    expect(s.sourceFailures).toHaveLength(3);
  });

  it("is 'rpc-limited' when SOME (not all) sources failed", () => {
    const sources = [makeSource("a", { isError: true }), ...healthySources().slice(1)];
    const s = deriveRegisterStatus({ sources, entryCount: 4, coverageComplete: true });
    expect(s.status).toBe("rpc-limited");
    expect(s.sourceFailures).toEqual(["Source a"]);
    expect(s.sourcesAvailable).toBe(5);
  });

  it("is 'partial' when sources are healthy but the window was truncated", () => {
    const s = deriveRegisterStatus({
      sources: healthySources(),
      entryCount: 3,
      coverageComplete: true,
      windowTruncated: true,
    });
    expect(s.status).toBe("partial");
  });

  it("is 'coverage-limited' when healthy + not truncated but coverage is unproven (entries present)", () => {
    const s = deriveRegisterStatus({
      sources: healthySources(),
      entryCount: 5,
      coverageComplete: false,
    });
    expect(s.status).toBe("coverage-limited");
  });

  it("is 'coverage-limited' (NOT empty) when coverage is unproven AND zero entries", () => {
    const s = deriveRegisterStatus({
      sources: healthySources(),
      entryCount: 0,
      coverageComplete: false,
    });
    // We cannot honestly assert "empty" without proven coverage.
    expect(s.status).toBe("coverage-limited");
    expect(s.canTrustEmpty).toBe(false);
  });

  it("is 'empty' ONLY when healthy + coverage proven + zero entries", () => {
    const s = deriveRegisterStatus({
      sources: healthySources(),
      entryCount: 0,
      coverageComplete: true,
    });
    expect(s.status).toBe("empty");
    expect(s.canTrustEmpty).toBe(true);
  });

  it("is 'ready' only when healthy + coverage proven + entries present", () => {
    const s = deriveRegisterStatus({
      sources: healthySources(),
      entryCount: 7,
      coverageComplete: true,
    });
    expect(s.status).toBe("ready");
    expect(s.isComplete).toBe(true);
  });
});

describe("deriveRegisterStatus — derived fields", () => {
  it("counts checked/available sources and reports failures by label", () => {
    const sources = [
      makeSource("x", { isError: true, label: "Membership purchases" }),
      makeSource("y", { label: "Liquidity swaps" }),
    ];
    const s = deriveRegisterStatus({ sources, entryCount: 1, coverageComplete: true });
    expect(s.sourcesChecked).toBe(2);
    expect(s.sourcesAvailable).toBe(1);
    expect(s.sourceFailures).toEqual(["Membership purchases"]);
  });

  it("lastDerivedAt is the max successful read stamp, or null when none succeeded", () => {
    const withStamps = deriveRegisterStatus({
      sources: [makeSource("a", { dataUpdatedAt: 10 }), makeSource("b", { dataUpdatedAt: 99 })],
      entryCount: 1,
      coverageComplete: true,
    });
    expect(withStamps.lastDerivedAt).toBe(99);

    const noStamps = deriveRegisterStatus({
      sources: [makeSource("a", { isLoading: true }), makeSource("b", { isLoading: true })],
      entryCount: 0,
      coverageComplete: true,
    });
    expect(noStamps.lastDerivedAt).toBeNull();
  });

  it("label always matches the canonical label map", () => {
    const s = deriveRegisterStatus({
      sources: healthySources(),
      entryCount: 0,
      coverageComplete: false,
    });
    expect(s.label).toBe(REGISTER_STATUS_LABELS[s.status]);
  });

  it("isComplete/canTrustEmpty/isPartial flags are mutually disciplined", () => {
    const ready = deriveRegisterStatus({ sources: healthySources(), entryCount: 2, coverageComplete: true });
    expect([ready.isComplete, ready.canTrustEmpty, ready.isPartial]).toEqual([true, false, false]);

    const rpc = deriveRegisterStatus({
      sources: [makeSource("a", { isError: true }), ...healthySources().slice(1)],
      entryCount: 2,
      coverageComplete: true,
    });
    expect([rpc.isComplete, rpc.canTrustEmpty, rpc.isPartial]).toEqual([false, false, true]);

    const cov = deriveRegisterStatus({ sources: healthySources(), entryCount: 2, coverageComplete: false });
    expect([cov.isComplete, cov.canTrustEmpty, cov.isPartial]).toEqual([false, false, false]);
  });

  it("never reports 'ready'/'empty' (LIVE) while coverage is unproven", () => {
    for (const entryCount of [0, 3]) {
      const s = deriveRegisterStatus({ sources: healthySources(), entryCount, coverageComplete: false });
      expect(s.status).not.toBe("ready");
      expect(s.status).not.toBe("empty");
      expect(s.isComplete).toBe(false);
    }
  });
});

describe("register status copy stays sober (labels + reasons + coverage notes)", () => {
  const ALL_STATUSES: RegisterDataStatus[] = [
    "loading",
    "ready",
    "partial",
    "rpc-limited",
    "coverage-limited",
    "empty",
    "error",
  ];

  // Cover every status' reason by constructing an input that resolves to it.
  const inputsByStatus: Record<RegisterDataStatus, Parameters<typeof deriveRegisterStatus>[0]> = {
    loading: { sources: [makeSource("a", { isLoading: true })], entryCount: 0, coverageComplete: true },
    error: { sources: [makeSource("a", { isError: true })], entryCount: 0, coverageComplete: true },
    "rpc-limited": {
      sources: [makeSource("a", { isError: true }), ...healthySources().slice(1)],
      entryCount: 1,
      coverageComplete: true,
    },
    partial: { sources: healthySources(), entryCount: 1, coverageComplete: true, windowTruncated: true },
    "coverage-limited": { sources: healthySources(), entryCount: 1, coverageComplete: false },
    empty: { sources: healthySources(), entryCount: 0, coverageComplete: true },
    ready: { sources: healthySources(), entryCount: 1, coverageComplete: true },
  };

  for (const status of ALL_STATUSES) {
    it(`status "${status}" has clean, sober label + reason`, () => {
      const s = deriveRegisterStatus(inputsByStatus[status]);
      expect(s.status).toBe(status);
      const text = `${s.label} ${s.reason}`;
      expect(findPublicVocabularyViolations(text)).toEqual([]);
      expect(findForbiddenLanguage(text)).toEqual([]);
      // Strictest posture: no ungated historic claim in any status reason.
      expect(findHistoricClaims(text, "coverage-limited")).toEqual([]);
    });
  }

  it("coverage notes (proven + unproven) carry no historic/first language", () => {
    for (const coverageComplete of [true, false]) {
      const s = deriveRegisterStatus({ sources: healthySources(), entryCount: 1, coverageComplete });
      expect(findPublicVocabularyViolations(s.coverageNote)).toEqual([]);
      expect(findForbiddenLanguage(s.coverageNote)).toEqual([]);
      expect(findHistoricClaims(s.coverageNote, "coverage-limited")).toEqual([]);
    }
  });
});

describe("isLineageComplete", () => {
  it("is true when every upstream reference is present", () => {
    expect(isLineageComplete(makeEntry("a", "active"))).toBe(true);
  });

  it("is false when any upstream reference is missing or blank", () => {
    const broken = { ...makeEntry("a", "active"), sourceSignalId: "" };
    expect(isLineageComplete(broken)).toBe(false);

    const blank = { ...makeEntry("a", "active"), sourceEventId: "   " };
    expect(isLineageComplete(blank)).toBe(false);
  });
});
