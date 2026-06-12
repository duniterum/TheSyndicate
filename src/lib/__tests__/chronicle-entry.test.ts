// src/lib/__tests__/chronicle-entry.test.ts
// Guard test for the CHRONICLE ENTRY layer (Sprint 13) — the controlled bridge
// CHRONICLE ADMISSION CANDIDATE → CHRONICLE ENTRY (institutional).
//
// What it proves:
//   • admitted → draft (eligible, NOT published); review/held → held; rejected → rejected
//   • the deriver can NEVER emit "published" (publication is a human/governance act)
//   • COPY > RULES: an admitted candidate with a copy violation is rejected
//   • a member-living candidate can never become an institutional entry (spec §6)
//   • full lineage is preserved and the new entry id is prepended
//   • the locked CHRONICLE_ENTRIES are never read or mutated (length + ids stable)
//   • carried copy stays sober; the genesis facts are fact-only (genesis allowed)
//   • versioning / supersession is append-only and non-mutating (spec §10)
//   • the deriver is pure, deterministic, and order-preserving
//   • the maintainer notes exist (exactly 4) and stay copy-clean
//   • end-to-end over the live genesis seed: 6 admitted → 6 draft, 2 held → 2 held

import { describe, it, expect } from "vitest";
import { deriveInstitutionalChronicleEntries } from "../chronicle-entry";
import {
  CHRONICLE_ENTRY_MAINTAINER,
  baselinePublicationDecision,
  resolvePublication,
  supersedeEntry,
  type InstitutionalChronicleEntry,
} from "../chronicle-entry-registry";
import { deriveChronicleAdmissionCandidates } from "../chronicle-admission";
import {
  type ChronicleAdmissionCandidate,
  type ChronicleAdmissionStatus,
} from "../chronicle-admission-registry";
import { deriveGenesisRegisterEntries } from "../institutional-register-genesis";
import { mergeInstitutionalEntries, findPublicVocabularyViolations } from "../institutional-register-public";
import { CHRONICLE_ENTRIES } from "../chronicle-entries";
import { findForbiddenLanguage } from "../protocol-language";

// A clean, admitted baseline candidate. Overrides tweak one axis at a time.
function makeCandidate(
  o: Partial<ChronicleAdmissionCandidate> = {},
): ChronicleAdmissionCandidate {
  return {
    id: "chronicle-admission:test",
    sourceInstitutionalEntryId: "institutional-entry:test",
    sourcePromotionDecisionId: "promo:test",
    sourceTxHash: "0xabc",
    register: "protocol-institutional" as ChronicleAdmissionCandidate["register"],
    category: "milestone" as ChronicleAdmissionCandidate["category"],
    createdFrom: "protocol milestone",
    title: "Protocol crossed a structural threshold",
    summary: "A pre-declared structural threshold was crossed and recorded.",
    verificationStatus: "verified",
    sourceEntryStatus: "active",
    admissionStatus: "admitted",
    admissionReason: "Admissible.",
    proposedChronicleRegister: "protocol-institutional",
    proposedChronicleCategory: "protocol" as ChronicleAdmissionCandidate["proposedChronicleCategory"],
    lineageComplete: true,
    lineage: ["institutional-entry:test", "promo:test"],
    copyViolations: [],
    derivedAt: null,
    ...o,
  };
}

describe("chronicle entry — admission status → publication status", () => {
  it("admitted → draft (eligible, NOT published)", () => {
    const [e] = deriveInstitutionalChronicleEntries([makeCandidate()]);
    expect(e.publicationStatus).toBe("draft");
  });

  it("review and held → held (not a final entry)", () => {
    const r = deriveInstitutionalChronicleEntries([makeCandidate({ admissionStatus: "review" })]);
    const h = deriveInstitutionalChronicleEntries([makeCandidate({ admissionStatus: "held" })]);
    expect(r[0].publicationStatus).toBe("held");
    expect(h[0].publicationStatus).toBe("held");
  });

  it("rejected → rejected", () => {
    const [e] = deriveInstitutionalChronicleEntries([makeCandidate({ admissionStatus: "rejected" })]);
    expect(e.publicationStatus).toBe("rejected");
  });

  it("NEVER auto-publishes — no disposition yields 'published'", () => {
    const statuses: ChronicleAdmissionStatus[] = ["admitted", "review", "held", "rejected"];
    for (const s of statuses) {
      const [e] = deriveInstitutionalChronicleEntries([makeCandidate({ admissionStatus: s })]);
      expect(e.publicationStatus).not.toBe("published");
    }
    // resolvePublication itself is the only status source — it can never publish.
    for (const s of statuses) {
      expect(resolvePublication(s, []).status).not.toBe("published");
    }
  });

  it("every derived entry carries the pending publication baseline (no reviewer/governance)", () => {
    const [e] = deriveInstitutionalChronicleEntries([makeCandidate()]);
    expect(e.publicationDecision).toEqual(baselinePublicationDecision());
    expect(e.publicationDecision.reviewer).toBeNull();
    expect(e.publicationDecision.governanceRef).toBeNull();
    expect(e.publicationDecision.decidedAt).toBeNull();
  });
});

describe("chronicle entry — precedence (copy > rules)", () => {
  it("an admitted candidate with carried copy violations is REJECTED", () => {
    // resolvePublication must reject on copy even when admitted.
    expect(resolvePublication("admitted", ["guaranteed profit"]).status).toBe("rejected");
  });

  it("re-validates copy from source: an admitted candidate with unsafe copy → rejected", () => {
    const bad = makeCandidate({
      title: "Guaranteed profit for members",
      admissionStatus: "admitted",
      copyViolations: [], // stale-clean upstream flag must not let unsafe copy through
    });
    const [e] = deriveInstitutionalChronicleEntries([bad]);
    expect(e.copyViolations.length).toBeGreaterThan(0);
    expect(e.publicationStatus).toBe("rejected");
  });
});

describe("chronicle entry — member-living can never become an institutional entry (§6)", () => {
  it("drops a candidate whose proposed Chronicle register is not protocol-institutional", () => {
    const member = makeCandidate({
      proposedChronicleRegister: "member-living" as ChronicleAdmissionCandidate["proposedChronicleRegister"],
    });
    expect(deriveInstitutionalChronicleEntries([member])).toHaveLength(0);
  });
});

describe("chronicle entry — lineage & classification", () => {
  it("preserves full lineage and prepends the new entry id", () => {
    const [e] = deriveInstitutionalChronicleEntries([makeCandidate()]);
    expect(e.id).toBe("chronicle-entry:institutional-entry:test");
    expect(e.lineage[0]).toBe(e.id);
    expect(e.lineage).toEqual([
      "chronicle-entry:institutional-entry:test",
      "institutional-entry:test",
      "promo:test",
    ]);
    expect(e.sourceChronicleAdmissionCandidateId).toBe("chronicle-admission:test");
    expect(e.sourceInstitutionalRegisterEntryId).toBe("institutional-entry:test");
    expect(e.sourcePromotionDecisionId).toBe("promo:test");
  });

  it("files under the candidate's PROPOSED Chronicle classification (not the institutional category)", () => {
    const [e] = deriveInstitutionalChronicleEntries([makeCandidate()]);
    expect(e.register).toBe("protocol-institutional");
    expect(e.category).toBe("protocol");
  });

  it("carries the tx anchor into chronology; date/block stay null (honest absence)", () => {
    const [e] = deriveInstitutionalChronicleEntries([makeCandidate({ sourceTxHash: "0xdef" })]);
    expect(e.chronology.txHash).toBe("0xdef");
    expect(e.chronology.date).toBeNull();
    expect(e.chronology.block).toBeNull();
    const [n] = deriveInstitutionalChronicleEntries([makeCandidate({ sourceTxHash: undefined })]);
    expect(n.chronology.txHash).toBeNull();
  });
});

describe("chronicle entry — the locked CHRONICLE_ENTRIES are never touched (§5)", () => {
  it("leaves the hand-curated entries intact (length + ids stable)", () => {
    const snapshot = JSON.stringify(CHRONICLE_ENTRIES);
    deriveInstitutionalChronicleEntries([makeCandidate()]);
    expect(CHRONICLE_ENTRIES).toHaveLength(3);
    expect(JSON.stringify(CHRONICLE_ENTRIES)).toBe(snapshot);
  });

  it("derived entry ids are a separate namespace from the locked entry ids", () => {
    const lockedIds = new Set(CHRONICLE_ENTRIES.map((e) => e.id));
    const derived = deriveInstitutionalChronicleEntries([makeCandidate()]);
    for (const e of derived) {
      expect(e.id.startsWith("chronicle-entry:")).toBe(true);
      expect(lockedIds.has(e.id)).toBe(false);
    }
  });
});

describe("chronicle entry — copy stays sober", () => {
  it("derived copy carries no forbidden or marketing language", () => {
    const entries = deriveInstitutionalChronicleEntries([
      makeCandidate(),
      makeCandidate({ admissionStatus: "review" }),
    ]);
    for (const e of entries) {
      expect(findForbiddenLanguage(`${e.title}\n${e.summary}`)).toEqual([]);
      expect(findPublicVocabularyViolations(`${e.title}\n${e.summary}`)).toEqual([]);
    }
  });
});

describe("chronicle entry — versioning / supersession (append-only, §10)", () => {
  it("supersedeEntry creates a corrected entry without mutating the original", () => {
    const [original] = deriveInstitutionalChronicleEntries([makeCandidate()]);
    const before = JSON.stringify(original);
    const { superseded, replacement } = supersedeEntry(original, {
      summary: "Corrected: the threshold record was restated.",
    });
    // Original input untouched.
    expect(JSON.stringify(original)).toBe(before);
    expect(original.version).toBe(1);
    // Replacement is append-only.
    expect(replacement.version).toBe(2);
    expect(replacement.supersedes).toBe(original.id);
    expect(replacement.summary).toBe("Corrected: the threshold record was restated.");
    // The superseded view is a copy flagged superseded.
    expect(superseded.publicationStatus).toBe("superseded");
    expect(superseded.id).toBe(original.id);
  });
});

describe("chronicle entry — purity & determinism", () => {
  it("is deterministic, order-preserving, and non-mutating", () => {
    const candidates = [
      makeCandidate({ id: "a", sourceInstitutionalEntryId: "institutional-entry:a" }),
      makeCandidate({ id: "b", sourceInstitutionalEntryId: "institutional-entry:b", admissionStatus: "held" }),
      makeCandidate({ id: "c", sourceInstitutionalEntryId: "institutional-entry:c", admissionStatus: "review" }),
    ];
    const snapshot = JSON.stringify(candidates);
    const r1 = deriveInstitutionalChronicleEntries(candidates);
    const r2 = deriveInstitutionalChronicleEntries(candidates);
    expect(r1).toEqual(r2);
    expect(r1.map((e) => e.sourceInstitutionalRegisterEntryId)).toEqual([
      "institutional-entry:a",
      "institutional-entry:b",
      "institutional-entry:c",
    ]);
    expect(JSON.stringify(candidates)).toBe(snapshot); // input untouched
  });
});

describe("chronicle entry — maintainer notes", () => {
  it("declares exactly five copy-clean maintainer notes", () => {
    expect(CHRONICLE_ENTRY_MAINTAINER).toHaveLength(5);
    for (const { topic, note } of CHRONICLE_ENTRY_MAINTAINER) {
      expect(topic.trim().length).toBeGreaterThan(0);
      expect(note.trim().length).toBeGreaterThan(0);
      expect(findForbiddenLanguage(note)).toEqual([]);
      expect(findPublicVocabularyViolations(note)).toEqual([]);
    }
  });
});

describe("chronicle entry — end-to-end over the genesis seed", () => {
  const merged = mergeInstitutionalEntries(deriveGenesisRegisterEntries(), []);
  const candidates = deriveChronicleAdmissionCandidates(merged);
  const entries = deriveInstitutionalChronicleEntries(candidates);

  it("projects every non-member candidate to one entry (member excluded upstream)", () => {
    // 8 candidates (the member ordinal is excluded at admission) → 8 entries.
    expect(candidates).toHaveLength(8);
    expect(entries).toHaveLength(8);
    expect(entries.some((e) => e.id.includes("earliest-member"))).toBe(false);
  });

  it("6 admitted facts become drafts; 2 held facts stay held; none published", () => {
    expect(entries.filter((e) => e.publicationStatus === "draft")).toHaveLength(6);
    expect(entries.filter((e) => e.publicationStatus === "held")).toHaveLength(2);
    expect(entries.some((e) => e.publicationStatus === "published")).toBe(false);
  });

  it("every genesis entry is protocol-institutional, copy-clean, and fact-only (genesis allowed)", () => {
    for (const e of entries) {
      expect(e.register).toBe("protocol-institutional");
      expect(e.copyViolations).toEqual([]);
      expect(findPublicVocabularyViolations(`${e.title}\n${e.summary}`)).toEqual([]);
    }
  });
});
