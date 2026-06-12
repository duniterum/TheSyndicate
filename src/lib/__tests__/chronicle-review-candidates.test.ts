// Chronicle Candidate layer (Sprint 4) — deterministic MemoryCandidate →
// ChronicleReviewCandidate, review-ready ONLY (no auto-publish, no Story, no
// Recognition, no contract, no public UI).
//
// Doctrine under test (docs/canon/05 §2.1, §4.5; Sprint-4 spec §10):
//   • Adjacency — candidates derive from MEMORY CANDIDATES only; lineage to the
//     Signal/Event/Tx/Block is carried through the MemoryCandidate, never re-read.
//   • Eligibility (carried lineage tier) — S0 never; S1 only the Chronicle safe-
//     set of categories; S2+ always.
//   • Register from the MemoryCandidate's subject-derived register; hint
//     invariant registerForCategory(hint) === register.
//   • Money / identity guardrail — significance is structural; a founder/system
//     action is eligible only via tier/category, never via actor identity, and is
//     HELD (hold-context) for human framing.
//   • Coverage — a coverage-limited candidate is HELD (hold-coverage), never
//     dropped, and asserts no historic first.
//   • Copy — generated copy is person-free and carries zero banned language.
//   • Review-first — recommendedAction is only promote-on-review | hold.

import { describe, expect, it } from "vitest";
import type { CanonicalProtocolEvent } from "../protocol-events";
import type { ProtocolEventKind } from "../protocol-event-registry";
import { CATEGORY_FOR_KIND as EVENT_CATEGORY_FOR_KIND } from "../protocol-event-registry";
import { deriveSignals } from "../protocol-signals";
import { deriveMemoryCandidates } from "../memory-candidates";
import type {
  MemoryCandidate,
  MemoryCategory,
  MemoryRegister,
  SignalSubject,
  SignalTier,
} from "../memory-candidate-registry";
import { registerForCategory } from "../chronicle-entries";
import {
  chronicleCategoryHint,
  validateChronicleReviewClassification,
} from "../chronicle-review-candidate-registry";
import { deriveChronicleReviewCandidates } from "../chronicle-review-candidates";
import { findForbiddenLanguage } from "../protocol-language";

// ── Direct MemoryCandidate factory (unit precision over the rule matrix) ──────
let seq = 0;
function mc(
  p: Partial<MemoryCandidate> & {
    id: string;
    register: MemoryRegister;
    category: MemoryCategory;
    subject: SignalSubject;
    tier: SignalTier;
    createdFrom: ProtocolEventKind;
  },
): MemoryCandidate {
  seq += 1;
  return {
    id: p.id,
    register: p.register,
    category: p.category,
    subject: p.subject,
    tier: p.tier,
    sourceSignalId: p.sourceSignalId ?? `sig-${p.id}`,
    sourceEventId: p.sourceEventId ?? `evt-${p.id}`,
    sourceTxHash: p.sourceTxHash ?? `0x${"a".repeat(64)}`,
    sourceBlock: p.sourceBlock ?? BigInt(seq),
    title: p.title ?? "A member moment.",
    summary: p.summary ?? "A member moment was recorded.",
    reason: p.reason ?? "Recognition only.",
    verification: p.verification ?? "verified",
    recommendedAction: p.recommendedAction ?? "review",
    createdFrom: p.createdFrom,
    copyViolations: p.copyViolations ?? [],
  };
}

const ALL_BANNED = [
  "founder",
  "founders",
  "roi",
  "yield",
  "dividend",
  "returns",
  "appreciation",
  "passive income",
  "investment",
  "kyc",
  "member #",
  "wallet 0x",
];

function assertCleanCopy(c: {
  proposedTitle: string;
  proposedSummary: string;
  proposedStoryAngle: string;
  significanceReason: string;
  copyViolations: string[];
}) {
  expect(c.copyViolations).toEqual([]);
  const blob = `${c.proposedTitle}\n${c.proposedSummary}\n${c.proposedStoryAngle}\n${c.significanceReason}`;
  expect(findForbiddenLanguage(blob)).toEqual([]);
  const lower = blob.toLowerCase();
  for (const term of ALL_BANNED) {
    expect(lower).not.toContain(term);
  }
}

describe("deriveChronicleReviewCandidates — eligibility (carried tier)", () => {
  it("S0 routine memory candidates create no chronicle candidate", () => {
    // (S0 never actually reaches Memory, but the layer must still refuse it.)
    const m = mc({ id: "s0", register: "member-living", category: "membership", subject: "member", tier: "S0", createdFrom: "new-member" });
    expect(deriveChronicleReviewCandidates([m])).toHaveLength(0);
  });

  it("S1 is eligible ONLY for the Chronicle safe-set of categories", () => {
    const eligible: MemoryCategory[] = ["membership", "continuity", "treasury", "liquidity", "founder-action"];
    for (const category of eligible) {
      const isMember = category === "membership" || category === "continuity";
      const m = mc({
        id: `s1-${category}`,
        register: isMember ? "member-living" : "protocol-institutional",
        category,
        subject: isMember ? "member" : "protocol",
        tier: "S1",
        createdFrom: isMember ? "new-member" : "vault-in",
      });
      expect(deriveChronicleReviewCandidates([m])).toHaveLength(1);
    }
  });

  it("S1 OUTSIDE the safe-set (artifact / milestone / burn) is activity-only", () => {
    const m1 = mc({ id: "s1-art", register: "protocol-institutional", category: "artifact", subject: "artifact", tier: "S1", createdFrom: "nft-mint-first-signal" });
    const m2 = mc({ id: "s1-burn", register: "member-living", category: "burn", subject: "member", tier: "S1", createdFrom: "burn-community" });
    expect(deriveChronicleReviewCandidates([m1])).toHaveLength(0);
    expect(deriveChronicleReviewCandidates([m2])).toHaveLength(0);
  });

  it("S2 and above are always eligible", () => {
    const m = mc({ id: "s2-art", register: "protocol-institutional", category: "artifact", subject: "artifact", tier: "S2", createdFrom: "nft-mint-patron-seal" });
    expect(deriveChronicleReviewCandidates([m])).toHaveLength(1);
  });
});

describe("deriveChronicleReviewCandidates — register & hint invariant", () => {
  it("S2 member subject → member-living, member hint", () => {
    const m = mc({ id: "rank", register: "member-living", category: "membership", subject: "member", tier: "S2", createdFrom: "rank-reached" });
    const [c] = deriveChronicleReviewCandidates([m]);
    expect(c.register).toBe("member-living");
    expect(c.chronicleCategoryHint).toBe("member");
    expect(registerForCategory(c.chronicleCategoryHint)).toBe(c.register);
  });

  it("S3+ protocol subject → protocol-institutional", () => {
    const m = mc({ id: "ms", register: "protocol-institutional", category: "milestone", subject: "milestone", tier: "S3", createdFrom: "purchase" });
    const [c] = deriveChronicleReviewCandidates([m]);
    expect(c.register).toBe("protocol-institutional");
    expect(c.chronicleCategoryHint).toBe("milestone");
    expect(registerForCategory(c.chronicleCategoryHint)).toBe(c.register);
  });

  it("the hint invariant registerForCategory(hint)===register holds for EVERY category/register pair", () => {
    const pairs: Array<{ category: MemoryCategory; register: MemoryRegister; subject: SignalSubject }> = [
      { category: "membership", register: "member-living", subject: "member" },
      { category: "continuity", register: "member-living", subject: "member" },
      { category: "burn", register: "member-living", subject: "member" },
      { category: "burn", register: "protocol-institutional", subject: "protocol" },
      { category: "milestone", register: "protocol-institutional", subject: "milestone" },
      { category: "treasury", register: "protocol-institutional", subject: "treasury" },
      { category: "liquidity", register: "protocol-institutional", subject: "protocol" },
      { category: "artifact", register: "protocol-institutional", subject: "artifact" },
      { category: "founder-action", register: "protocol-institutional", subject: "protocol" },
      { category: "system-wallet-action", register: "protocol-institutional", subject: "protocol" },
      { category: "genesis", register: "protocol-institutional", subject: "chapter" },
      { category: "chapter", register: "protocol-institutional", subject: "chapter" },
      { category: "operations", register: "protocol-institutional", subject: "protocol" },
    ];
    for (const p of pairs) {
      const hint = chronicleCategoryHint(p.category, p.register);
      expect(registerForCategory(hint)).toBe(p.register);
      // The classification validator must agree.
      expect(validateChronicleReviewClassification(p)).toEqual([]);
    }
  });
});

describe("deriveChronicleReviewCandidates — review status & recommended action", () => {
  it("coverage-limited → hold-coverage → hold (precedence wins over context)", () => {
    const m = mc({ id: "cl", register: "member-living", category: "continuity", subject: "member", tier: "S1", createdFrom: "purchase", verification: "coverage-limited" });
    const [c] = deriveChronicleReviewCandidates([m]);
    expect(c.verificationStatus).toBe("coverage-limited");
    expect(c.reviewStatus).toBe("hold-coverage");
    expect(c.recommendedAction).toBe("hold");
  });

  it("institutional founder-action → hold-context → hold", () => {
    const m = mc({ id: "fund", register: "protocol-institutional", category: "founder-action", subject: "protocol", tier: "S2", createdFrom: "vault-in" });
    const [c] = deriveChronicleReviewCandidates([m]);
    expect(c.reviewStatus).toBe("hold-context");
    expect(c.recommendedAction).toBe("hold");
  });

  it("protocol-institutional burn → hold-context; community (member-living) burn → needs-review", () => {
    const inst = mc({ id: "binst", register: "protocol-institutional", category: "burn", subject: "protocol", tier: "S2", createdFrom: "burn-founder" });
    const comm = mc({ id: "bcomm", register: "member-living", category: "burn", subject: "member", tier: "S2", createdFrom: "burn-community" });
    expect(deriveChronicleReviewCandidates([inst])[0].reviewStatus).toBe("hold-context");
    expect(deriveChronicleReviewCandidates([comm])[0].reviewStatus).toBe("needs-review");
  });

  it("a normal verified member moment → needs-review → promote-on-review", () => {
    const m = mc({ id: "nm", register: "member-living", category: "membership", subject: "member", tier: "S1", createdFrom: "new-member" });
    const [c] = deriveChronicleReviewCandidates([m]);
    expect(c.reviewStatus).toBe("needs-review");
    expect(c.recommendedAction).toBe("promote-on-review");
  });

  it("pending verification → needs-review (does not block review queue)", () => {
    const m = mc({ id: "pend", register: "member-living", category: "membership", subject: "member", tier: "S2", createdFrom: "rank-reached", verification: "pending" });
    const [c] = deriveChronicleReviewCandidates([m]);
    expect(c.verificationStatus).toBe("pending");
    expect(c.reviewStatus).toBe("needs-review");
    expect(c.recommendedAction).toBe("promote-on-review");
  });
});

describe("deriveChronicleReviewCandidates — identity neutrality", () => {
  it("a founder action is treated by tier/category, never by actor identity", () => {
    // Same tier, both institutional: a founder funding and a generic treasury
    // flow are BOTH eligible and BOTH held — neither is elevated by who acted.
    const founder = mc({ id: "f", register: "protocol-institutional", category: "founder-action", subject: "protocol", tier: "S2", createdFrom: "vault-in" });
    const treasury = mc({ id: "t", register: "protocol-institutional", category: "treasury", subject: "treasury", tier: "S2", createdFrom: "vault-in" });
    const [cf] = deriveChronicleReviewCandidates([founder]);
    const [ct] = deriveChronicleReviewCandidates([treasury]);
    expect(cf.recommendedAction).toBe("hold"); // founder act held for framing
    expect(ct.recommendedAction).toBe("promote-on-review"); // not held by identity
    // The founder candidate names no person.
    assertCleanCopy(cf);
  });

  it("a structurally significant (S3) founder action is eligible", () => {
    const m = mc({ id: "fbig", register: "protocol-institutional", category: "founder-action", subject: "protocol", tier: "S3", createdFrom: "burn-founder" });
    const [c] = deriveChronicleReviewCandidates([m]);
    expect(c).toBeDefined();
    expect(c.reviewStatus).toBe("hold-context");
    assertCleanCopy(c);
  });
});

describe("deriveChronicleReviewCandidates — copy & lineage", () => {
  it("no generated copy carries banned/forbidden language across ALL categories", () => {
    const samples: MemoryCandidate[] = [
      mc({ id: "c1", register: "member-living", category: "membership", subject: "member", tier: "S2", createdFrom: "new-member" }),
      mc({ id: "c2", register: "member-living", category: "membership", subject: "member", tier: "S2", createdFrom: "rank-reached" }),
      mc({ id: "c3", register: "member-living", category: "continuity", subject: "member", tier: "S2", createdFrom: "purchase" }),
      mc({ id: "c4", register: "protocol-institutional", category: "milestone", subject: "milestone", tier: "S3", createdFrom: "purchase" }),
      mc({ id: "c5", register: "protocol-institutional", category: "founder-action", subject: "protocol", tier: "S2", createdFrom: "vault-in" }),
      mc({ id: "c6", register: "protocol-institutional", category: "founder-action", subject: "protocol", tier: "S2", createdFrom: "burn-founder" }),
      mc({ id: "c7", register: "member-living", category: "burn", subject: "member", tier: "S2", createdFrom: "burn-community" }),
      mc({ id: "c8", register: "protocol-institutional", category: "artifact", subject: "artifact", tier: "S2", createdFrom: "nft-mint-patron-seal" }),
      mc({ id: "c9", register: "protocol-institutional", category: "liquidity", subject: "protocol", tier: "S2", createdFrom: "lp-add" }),
      mc({ id: "c10", register: "protocol-institutional", category: "treasury", subject: "treasury", tier: "S2", createdFrom: "vault-in" }),
    ];
    const cands = deriveChronicleReviewCandidates(samples);
    expect(cands.length).toBe(samples.length);
    for (const c of cands) assertCleanCopy(c);
  });

  it("proposedStoryAngle is a terse label, not prose (no sentence punctuation)", () => {
    const m = mc({ id: "ang", register: "member-living", category: "membership", subject: "member", tier: "S2", createdFrom: "new-member" });
    const [c] = deriveChronicleReviewCandidates([m]);
    expect(c.proposedStoryAngle).not.toMatch(/[.!?]/);
    expect(c.proposedStoryAngle.length).toBeLessThan(40);
  });

  it("every candidate references its source MemoryCandidate and preserves lineage", () => {
    const m = mc({ id: "lin", register: "member-living", category: "membership", subject: "member", tier: "S2", createdFrom: "rank-reached", sourceTxHash: `0x${"b".repeat(64)}`, sourceBlock: 99n });
    const [c] = deriveChronicleReviewCandidates([m]);
    expect(c.sourceMemoryCandidateId).toBe("lin");
    expect(c.sourceSignalId).toBe(m.sourceSignalId);
    expect(c.sourceEventId).toBe(m.sourceEventId);
    expect(c.sourceTxHash).toBe(`0x${"b".repeat(64)}`);
    expect(c.sourceBlock).toBe(99n);
    expect(c.tier).toBe("S2");
    expect(c.id).toBe("chron-lin");
  });

  it("preserves input order and is deterministic", () => {
    const a = mc({ id: "a", register: "member-living", category: "membership", subject: "member", tier: "S2", createdFrom: "new-member" });
    const b = mc({ id: "b", register: "protocol-institutional", category: "milestone", subject: "milestone", tier: "S3", createdFrom: "purchase" });
    const r1 = deriveChronicleReviewCandidates([a, b]);
    const r2 = deriveChronicleReviewCandidates([a, b]);
    expect(r1.map((c) => c.id)).toEqual(["chron-a", "chron-b"]);
    expect(r1).toEqual(r2);
  });
});

// ── End-to-end: events → deriveSignals → deriveMemoryCandidates → chronicle ──
let evSeq = 0;
function ev(partial: Partial<CanonicalProtocolEvent> & { kind: ProtocolEventKind }): CanonicalProtocolEvent {
  evSeq += 1;
  const { kind } = partial;
  const defaults: CanonicalProtocolEvent = {
    id: `e${evSeq}`,
    kind,
    title: "",
    detail: "",
    badge: "info",
    blockNumber: BigInt(evSeq),
    logIndex: 0,
    txHash: `0x${"a".repeat(64)}`,
    category: EVENT_CATEGORY_FOR_KIND[kind],
    verificationLink: "",
    status: "LIVE",
    isOnChainVerified: true,
    isManualTag: false,
    metricEffects: [],
    chronicleEligible: false,
    recommendedSurfaces: [],
  };
  return { ...defaults, ...partial };
}

describe("Chronicle candidates — end-to-end from the real pipeline", () => {
  const events: CanonicalProtocolEvent[] = [
    ev({ kind: "new-member", id: "ev-nm", from: "0xA", memberOrdinal: 7 }),
    ev({ kind: "purchase", id: "ev-p1", from: "0xA", amountUsd: 50 }),
    ev({ kind: "purchase", id: "ev-p2", from: "0xA", amountUsd: 50 }),
    ev({ kind: "burn-community", id: "ev-bc", from: "0xB" }),
  ];

  it("flows EVENT → SIGNAL → MEMORY → CHRONICLE with full lineage and clean copy", () => {
    const signals = deriveSignals(events, { windowCoversDeployment: true });
    const memory = deriveMemoryCandidates(signals);
    const chronicle = deriveChronicleReviewCandidates(memory);

    expect(chronicle.length).toBeGreaterThan(0);
    const memIds = new Set(memory.map((m) => m.id));
    const sigIds = new Set(signals.map((s) => s.id));
    for (const c of chronicle) {
      // lineage back through every layer
      expect(memIds.has(c.sourceMemoryCandidateId)).toBe(true);
      expect(sigIds.has(c.sourceSignalId)).toBe(true);
      expect(c.sourceEventId).toBeTruthy();
      // classification + copy invariants
      expect(validateChronicleReviewClassification(c)).toEqual([]);
      assertCleanCopy(c);
      // review-first: only the two non-publishing actions
      expect(["promote-on-review", "hold"]).toContain(c.recommendedAction);
    }
  });

  it("with coverage OFF, the continuity candidate is HELD (hold-coverage), never dropped", () => {
    const signals = deriveSignals(events, { windowCoversDeployment: false });
    const memory = deriveMemoryCandidates(signals);
    const chronicle = deriveChronicleReviewCandidates(memory);
    const cont = chronicle.find((c) => c.category === "continuity");
    expect(cont).toBeDefined();
    expect(cont?.reviewStatus).toBe("hold-coverage");
    expect(cont?.recommendedAction).toBe("hold");
    // no historic-first claim anywhere
    for (const c of chronicle) {
      expect(`${c.proposedTitle} ${c.proposedSummary}`.toLowerCase()).not.toContain("first ever");
    }
  });
});
