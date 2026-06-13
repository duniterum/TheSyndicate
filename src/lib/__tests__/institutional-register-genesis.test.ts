// Sprint 9 — GENESIS SEED + GENESIS_EVENT classification tests (spec §9).
//
// Proves: genesis is allowed ONLY as a verified/locked institutional fact; hype /
// unverified historic copy is still blocked; coverage-gated ordinals are HELD (not
// invented); seeded entries preserve lineage and never bypass the architecture
// silently; member identity can never enter; and the public view renders the seeds
// safely. Copy is validated against the SAME guards the live pipeline uses.

import { describe, expect, it } from "vitest";
import {
  GENESIS_FACTS,
  GENESIS_SEED_CURATED_AT,
  deriveGenesisRegisterEntries,
} from "../institutional-register-genesis";
import { findHistoricClaims } from "../institutional-register-registry";
import { findForbiddenLanguage } from "../protocol-language";
import {
  findPublicVocabularyViolations,
  isLineageComplete,
  isPubliclyVisible,
  mergeInstitutionalEntries,
  selectPublicInstitutionalEntries,
} from "../institutional-register-public";

const entries = deriveGenesisRegisterEntries();
const copyOf = (e: { title: string; summary: string; rationale: string }) =>
  `${e.title}\n${e.summary}\n${e.rationale}`;

describe("Genesis seed — copy safety (every fact is clean by construction)", () => {
  for (const e of entries) {
    it(`${e.id} carries zero copy violations`, () => {
      expect(e.copyViolations).toEqual([]);
    });
  }

  it("no seeded copy contains forbidden framing or public-vocab violations", () => {
    for (const e of entries) {
      const copy = copyOf(e);
      expect(findForbiddenLanguage(copy)).toEqual([]);
      expect(findPublicVocabularyViolations(copy)).toEqual([]);
      // Historic claims are evaluated AGAINST the fact's own verification posture.
      expect(findHistoricClaims(copy, e.verificationStatus)).toEqual([]);
    }
  });
});

describe("GENESIS_EVENT classification (spec §2)", () => {
  it("genesis is allowed ONLY as a verified/locked institutional fact", () => {
    const genesis = entries.filter((e) => e.category === "genesis");
    expect(genesis.length).toBeGreaterThan(0);
    for (const e of genesis) {
      expect(["verified", "locked"]).toContain(e.verificationStatus);
      expect(e.entryStatus).toBe("active");
    }
  });

  it("a verified institutional fact MAY state 'genesis'; an unverified one may NOT", () => {
    // verified/locked → the word is a legitimate institutional fact
    expect(findHistoricClaims("Protocol genesis — SYN token deployed", "verified")).toEqual([]);
    expect(findHistoricClaims("Protocol genesis — contract deployed", "locked")).toEqual([]);
    // coverage-limited (unverified) → the SAME word is blocked as a historic claim
    expect(
      findHistoricClaims("genesis launch — first ever", "coverage-limited").length,
    ).toBeGreaterThan(0);
  });

  it("hype / marketing language is still rejected by the public + language guards", () => {
    expect(
      findPublicVocabularyViolations("legendary founder achievement, guaranteed profit").length,
    ).toBeGreaterThan(0);
    expect(findForbiddenLanguage("guaranteed yield and dividends").length).toBeGreaterThan(0);
  });
});

describe("Verification / disposition discipline (spec §4, §9)", () => {
  it("active entries are verified/locked; held entries are coverage-limited", () => {
    for (const e of entries) {
      if (e.entryStatus === "active") {
        expect(["verified", "locked"]).toContain(e.verificationStatus);
      }
      if (e.entryStatus === "held") {
        expect(e.verificationStatus).toBe("coverage-limited");
      }
    }
  });

  it("unverified first-ever ordinals are HELD, not invented, and assert no historic claim", () => {
    const held = entries.filter((e) => e.entryStatus === "held");
    expect(held.map((e) => e.id.replace("institutional-entry:genesis:", "")).sort()).toEqual([
      "earliest-artifact",
      "earliest-member",
      "earliest-milestone",
    ]);
    for (const e of held) {
      // Coverage-limited → any historic "first" pattern WOULD flag; there are none.
      expect(findHistoricClaims(copyOf(e), e.verificationStatus)).toEqual([]);
      expect(copyOf(e).toLowerCase()).not.toMatch(/\bfirst\s+(member|liquidity|artifact)\b/);
    }
  });

  it("first campaign funding is excluded entirely (no verifiable source)", () => {
    expect(GENESIS_FACTS.some((f) => /campaign/i.test(f.id) || /campaign/i.test(f.title))).toBe(
      false,
    );
  });

  it("every active seed cites a real on-chain anchor (tx hash OR contract)", () => {
    for (const e of entries.filter((x) => x.entryStatus === "active")) {
      const hasTx =
        typeof e.sourceTxHash === "string" && /^0x[a-f0-9]{64}$/i.test(e.sourceTxHash);
      const hasContract = e.lineage.some((l) => /^contract:0x[a-f0-9]{40}$/i.test(l));
      expect(hasTx || hasContract).toBe(true);
    }
  });
});

describe("Lineage + provenance (spec §3 — no silent bypass)", () => {
  it("every seeded entry preserves a complete lineage", () => {
    for (const e of entries) {
      expect(isLineageComplete(e)).toBe(true);
      expect(e.lineage.length).toBeGreaterThanOrEqual(4);
      expect(e.sourceEventId).toMatch(/^genesis-fact:/);
      expect(e.sourcePromotionDecisionId).toMatch(/^genesis-seed:/);
    }
  });

  it("seeded entries are explicitly labelled (provenance visible, never silent)", () => {
    for (const e of entries) {
      expect(e.createdFrom).toBe("genesis-seed");
      expect(e.id).toMatch(/^institutional-entry:genesis:/);
      expect(
        e.lineage.some((l) => /genesis-seed/.test(l) && /predates event scanner/.test(l)),
      ).toBe(true);
    }
  });

  it("active entries use the FIXED curation timestamp; held entries carry none", () => {
    for (const e of entries) {
      if (e.entryStatus === "active") expect(e.createdAt).toBe(GENESIS_SEED_CURATED_AT);
      if (e.entryStatus === "held") expect(e.createdAt).toBeNull();
    }
  });

  it("the seed derivation is deterministic (no Date.now / no chain read)", () => {
    expect(deriveGenesisRegisterEntries()).toEqual(deriveGenesisRegisterEntries());
  });
});

describe("Member-living exclusion (spec §7 / clause 6)", () => {
  it("no seeded entry carries a member or wallet identity", () => {
    for (const e of entries) {
      const copy = copyOf(e);
      expect(/wallet\s+0x/i.test(copy)).toBe(false);
      expect(/member\s*#\s*\d+/i.test(copy)).toBe(false);
      expect(/\b0x[a-f0-9]{6,}/i.test(copy)).toBe(false);
    }
  });

  it("the membership ordinal is HELD and never publicly visible", () => {
    const membership = entries.filter((e) => e.category === "membership");
    expect(membership.length).toBeGreaterThan(0);
    for (const e of membership) {
      expect(e.entryStatus).toBe("held");
      expect(isPubliclyVisible(e)).toBe(false);
    }
  });
});

describe("Public render + merge (spec §7)", () => {
  it("public selection exposes ONLY the active seeds, clean and newest-first", () => {
    const publicSeeds = selectPublicInstitutionalEntries(
      mergeInstitutionalEntries(entries, []),
    );
    expect(publicSeeds.length).toBe(entries.filter((e) => e.entryStatus === "active").length);
    for (const e of publicSeeds) {
      expect(e.entryStatus).toBe("active");
      expect(e.copyViolations).toEqual([]);
      expect(findPublicVocabularyViolations(copyOf(e))).toEqual([]);
    }
    // Newest-first: the last fact in chronological order surfaces at the top.
    expect(publicSeeds[0].id).toBe("institutional-entry:genesis:proof-of-burn-001");
  });

  it("no duplicate ids across the seeded set", () => {
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("merge drops a derived entry sharing a locked seed's tx (locked seed wins)", () => {
    const lockedSeed = entries.find((e) => e.sourceTxHash);
    expect(lockedSeed).toBeDefined();
    const dupe = { ...lockedSeed!, id: "derived-dupe", createdFrom: "promotion" };
    const merged = mergeInstitutionalEntries(entries, [dupe]);
    expect(merged.some((e) => e.id === "derived-dupe")).toBe(false);
  });

  it("merge keeps a derived entry with a distinct tx, after the seeds", () => {
    const distinct = { ...entries[0], id: "derived-distinct", sourceTxHash: "0xfeed" };
    const merged = mergeInstitutionalEntries(entries, [distinct]);
    expect(merged.some((e) => e.id === "derived-distinct")).toBe(true);
    expect(merged.indexOf(merged.find((e) => e.id === "derived-distinct")!)).toBeGreaterThan(
      entries.length - 1,
    );
  });
});
