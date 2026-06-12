// Chronicle Promotion layer (Sprint 5) — deterministic ChronicleReviewCandidate
// → ChroniclePromotionDecision, BASELINE RECOMMENDATION ONLY (no auto-publish, no
// Story, no Recognition, no governance, no contract, no public UI).
//
// Doctrine under test (docs/canon/05 §2.1, §4.5; chronicle-entries clause 6):
//   • Adjacency — decisions derive from CHRONICLE REVIEW CANDIDATES only; lineage
//     to Memory/Signal/Event/Tx/Block is carried through the candidate, never
//     re-read.
//   • Precedence — unsafe copy → rejected; coverage-limited → hold-coverage;
//     otherwise the memory rules decide.
//   • Institutional rule — milestone/chapter/artifact/first-funding/seeding →
//     approved; deployment/removal/protocol-wallet acts → hold-context; recurring
//     market flow → rejected. Identity- AND amount-blind.
//   • Member rule — EVERY member-living candidate is HELD (hold-context): the
//     member register is unratified and clause 6 forbids member-subject entries.
//   • Promotion is a HUMAN act — reviewer is the deterministic baseline marker,
//     timestamp is null, and no decision publishes anything.
//   • Copy — every generated rationale is person-free and banned-language-free.

import { describe, expect, it } from "vitest";
import type { CanonicalProtocolEvent } from "../protocol-events";
import type { ProtocolEventKind } from "../protocol-event-registry";
import { CATEGORY_FOR_KIND as EVENT_CATEGORY_FOR_KIND } from "../protocol-event-registry";
import { deriveSignals } from "../protocol-signals";
import { deriveMemoryCandidates } from "../memory-candidates";
import { deriveChronicleReviewCandidates } from "../chronicle-review-candidates";
import type {
  ChronicleReviewCandidate,
  ChronicleReviewRegister,
  ChronicleReviewStatus,
  ChronicleVerificationStatus,
} from "../chronicle-review-candidate-registry";
import type { MemoryCategory, SignalSubject, SignalTier } from "../memory-candidate-registry";
import {
  BASELINE_REVIEWER,
  INSTITUTIONAL_MEMORY_GUIDANCE,
  MEMBER_MEMORY_GUIDANCE,
} from "../chronicle-promotion-registry";
import { deriveChroniclePromotionDecisions } from "../chronicle-promotion";
import { findForbiddenLanguage } from "../protocol-language";
import { CHRONICLE_BANNED_TERMS } from "../chronicle-entries";

// ── Direct ChronicleReviewCandidate factory (unit precision over the matrix) ──
let seq = 0;
function crc(
  p: Partial<ChronicleReviewCandidate> & {
    id: string;
    register: ChronicleReviewRegister;
    category: MemoryCategory;
    subject: SignalSubject;
    tier: SignalTier;
    createdFrom: ProtocolEventKind;
  },
): ChronicleReviewCandidate {
  seq += 1;
  return {
    id: p.id,
    register: p.register,
    category: p.category,
    chronicleCategoryHint: p.chronicleCategoryHint ?? "protocol",
    subject: p.subject,
    tier: p.tier,
    sourceMemoryCandidateId: p.sourceMemoryCandidateId ?? `mem-${p.id}`,
    sourceSignalId: p.sourceSignalId ?? `sig-${p.id}`,
    sourceEventId: p.sourceEventId ?? `evt-${p.id}`,
    sourceTxHash: p.sourceTxHash ?? `0x${"a".repeat(64)}`,
    sourceBlock: p.sourceBlock ?? BigInt(seq),
    proposedTitle: p.proposedTitle ?? "A protocol moment.",
    proposedSummary: p.proposedSummary ?? "A protocol moment was recorded.",
    proposedStoryAngle: p.proposedStoryAngle ?? "protocol moment",
    significanceReason: p.significanceReason ?? "Structural significance.",
    verificationStatus: (p.verificationStatus ?? "verified") as ChronicleVerificationStatus,
    reviewStatus: (p.reviewStatus ?? "needs-review") as ChronicleReviewStatus,
    recommendedAction: p.recommendedAction ?? "promote-on-review",
    createdFrom: p.createdFrom,
    copyViolations: p.copyViolations ?? [],
  };
}

function assertCleanRationale(rationale: string, rationaleViolations: string[]) {
  expect(rationaleViolations).toEqual([]);
  expect(findForbiddenLanguage(rationale)).toEqual([]);
  const lower = rationale.toLowerCase();
  for (const term of CHRONICLE_BANNED_TERMS) {
    expect(lower, `rationale contains banned term "${term}"`).not.toContain(term);
  }
}

describe("deriveChroniclePromotionDecisions — precedence", () => {
  it("unsafe copy (copyViolations) → rejected / none, regardless of category", () => {
    const c = crc({
      id: "bad",
      register: "protocol-institutional",
      category: "milestone",
      subject: "milestone",
      tier: "S3",
      createdFrom: "purchase",
      copyViolations: ["contains banned term: \"yield\""],
    });
    const [d] = deriveChroniclePromotionDecisions([c]);
    expect(d.decision).toBe("rejected");
    expect(d.promotionPath).toBe("none");
    expect(d.ruleBucket).toBe("unsafe copy");
  });

  it("coverage-limited → hold-coverage / deferred, even for an approvable category", () => {
    const c = crc({
      id: "cov",
      register: "protocol-institutional",
      category: "milestone",
      subject: "milestone",
      tier: "S3",
      createdFrom: "purchase",
      verificationStatus: "coverage-limited",
    });
    const [d] = deriveChroniclePromotionDecisions([c]);
    expect(d.decision).toBe("hold-coverage");
    expect(d.promotionPath).toBe("deferred");
    // never asserts a historic first
    expect(d.rationale.toLowerCase()).not.toContain("first ever");
  });

  it("unsafe copy wins over coverage (precedence order)", () => {
    const c = crc({
      id: "both",
      register: "protocol-institutional",
      category: "milestone",
      subject: "milestone",
      tier: "S3",
      createdFrom: "purchase",
      verificationStatus: "coverage-limited",
      copyViolations: ["bad"],
    });
    expect(deriveChroniclePromotionDecisions([c])[0].decision).toBe("rejected");
  });
});

describe("deriveChroniclePromotionDecisions — institutional memory rule", () => {
  const approve: Array<[MemoryCategory, ProtocolEventKind, string]> = [
    ["milestone", "purchase", "protocol milestone"],
    ["genesis", "purchase", "chapter completion"],
    ["chapter", "purchase", "chapter completion"],
    ["artifact", "nft-mint-patron-seal", "artifact issuance"],
    ["liquidity", "lp-add", "liquidity seeding"],
    ["treasury", "vault-in", "treasury acquisition"],
  ];
  for (const [category, createdFrom, bucket] of approve) {
    it(`${category}/${createdFrom} → approved → institutional-memory (${bucket})`, () => {
      const c = crc({
        id: `ap-${category}-${createdFrom}`,
        register: "protocol-institutional",
        category,
        subject: "protocol",
        tier: "S3",
        createdFrom,
      });
      const [d] = deriveChroniclePromotionDecisions([c]);
      expect(d.decision).toBe("approved");
      expect(d.promotionPath).toBe("institutional-memory");
      expect(d.ruleBucket).toBe(bucket);
      assertCleanRationale(d.rationale, d.rationaleViolations);
    });
  }

  const hold: Array<[MemoryCategory, ProtocolEventKind, string]> = [
    ["liquidity", "lp-remove", "liquidity removal"],
    ["treasury", "vault-out", "treasury deployment"],
    ["operations", "vault-out", "operations spending"],
    ["founder-action", "vault-in", "protocol-wallet funding"],
    ["founder-action", "burn-founder", "protocol-wallet burn"],
    ["system-wallet-action", "vault-in", "system-wallet action"],
    ["burn", "burn-founder", "protocol-wallet burn"],
  ];
  for (const [category, createdFrom, bucket] of hold) {
    it(`${category}/${createdFrom} → hold-context → deferred (${bucket})`, () => {
      const c = crc({
        id: `ho-${category}-${createdFrom}`,
        register: "protocol-institutional",
        category,
        subject: "protocol",
        tier: "S2",
        createdFrom,
      });
      const [d] = deriveChroniclePromotionDecisions([c]);
      expect(d.decision).toBe("hold-context");
      expect(d.promotionPath).toBe("deferred");
      expect(d.ruleBucket).toBe(bucket);
      assertCleanRationale(d.rationale, d.rationaleViolations);
    });
  }

  it("treasury revenue (swap) → rejected / none", () => {
    for (const createdFrom of ["swap-buy", "swap-sell"] as ProtocolEventKind[]) {
      const c = crc({
        id: `rev-${createdFrom}`,
        register: "protocol-institutional",
        category: "treasury",
        subject: "treasury",
        tier: "S3",
        createdFrom,
      });
      const [d] = deriveChroniclePromotionDecisions([c]);
      expect(d.decision).toBe("rejected");
      expect(d.promotionPath).toBe("none");
      expect(d.ruleBucket).toBe("treasury revenue");
    }
  });

  it("identity- AND amount-blind: a protocol-wallet act is held by category, not by who/how-much", () => {
    // Same tier, same kind — a treasury acquisition is approved while a
    // protocol-wallet (founder) funding of the SAME kind is held: the difference
    // is CATEGORY discipline, never the actor's identity or any amount.
    const treasury = crc({ id: "t", register: "protocol-institutional", category: "treasury", subject: "treasury", tier: "S2", createdFrom: "vault-in" });
    const wallet = crc({ id: "w", register: "protocol-institutional", category: "founder-action", subject: "protocol", tier: "S2", createdFrom: "vault-in" });
    expect(deriveChroniclePromotionDecisions([treasury])[0].decision).toBe("approved");
    expect(deriveChroniclePromotionDecisions([wallet])[0].decision).toBe("hold-context");
  });
});

describe("deriveChroniclePromotionDecisions — member memory rule", () => {
  const members: Array<[MemoryCategory, ProtocolEventKind, SignalSubject, string]> = [
    ["membership", "new-member", "member", "member arrival"],
    ["membership", "rank-reached", "member", "member rank recognition"],
    ["continuity", "purchase", "member", "continuity / repeat participation"],
    ["burn", "burn-community", "member", "community burn"],
  ];
  for (const [category, createdFrom, subject, bucket] of members) {
    it(`${category}/${createdFrom} (member-living) → hold-context → deferred (${bucket})`, () => {
      const c = crc({
        id: `mem-${category}-${createdFrom}`,
        register: "member-living",
        category,
        subject,
        tier: "S2",
        createdFrom,
      });
      const [d] = deriveChroniclePromotionDecisions([c]);
      expect(d.decision).toBe("hold-context");
      expect(d.promotionPath).toBe("deferred");
      expect(d.ruleBucket).toBe(bucket);
      assertCleanRationale(d.rationale, d.rationaleViolations);
    });
  }

  it("no member-living candidate is ever approved (register not ratified)", () => {
    const samples = members.map(([category, createdFrom, subject], i) =>
      crc({ id: `na-${i}`, register: "member-living", category, subject, tier: "S3", createdFrom }),
    );
    for (const d of deriveChroniclePromotionDecisions(samples)) {
      expect(d.decision).not.toBe("approved");
      expect(d.promotionPath).not.toBe("member-memory");
    }
  });
});

describe("deriveChroniclePromotionDecisions — human-act invariants & lineage", () => {
  it("every baseline decision is unstamped (timestamp null) and marked baseline", () => {
    const c = crc({ id: "b", register: "protocol-institutional", category: "milestone", subject: "milestone", tier: "S3", createdFrom: "purchase" });
    const [d] = deriveChroniclePromotionDecisions([c]);
    expect(d.timestamp).toBeNull();
    expect(d.reviewer).toBe(BASELINE_REVIEWER);
  });

  it("preserves the full lineage carried by the candidate", () => {
    const c = crc({
      id: "lin",
      register: "protocol-institutional",
      category: "milestone",
      subject: "milestone",
      tier: "S3",
      createdFrom: "purchase",
      sourceTxHash: `0x${"b".repeat(64)}`,
      sourceBlock: 99n,
    });
    const [d] = deriveChroniclePromotionDecisions([c]);
    expect(d.candidateId).toBe("lin");
    expect(d.sourceMemoryCandidateId).toBe(c.sourceMemoryCandidateId);
    expect(d.sourceSignalId).toBe(c.sourceSignalId);
    expect(d.sourceEventId).toBe(c.sourceEventId);
    expect(d.sourceTxHash).toBe(`0x${"b".repeat(64)}`);
    expect(d.sourceBlock).toBe(99n);
    expect(d.tier).toBe("S3");
  });

  it("preserves input order and is deterministic", () => {
    const a = crc({ id: "a", register: "protocol-institutional", category: "milestone", subject: "milestone", tier: "S3", createdFrom: "purchase" });
    const b = crc({ id: "b", register: "member-living", category: "membership", subject: "member", tier: "S2", createdFrom: "new-member" });
    const r1 = deriveChroniclePromotionDecisions([a, b]);
    const r2 = deriveChroniclePromotionDecisions([a, b]);
    expect(r1.map((d) => d.candidateId)).toEqual(["a", "b"]);
    expect(r1).toEqual(r2);
  });
});

describe("promotion guidance tables — documented & clean", () => {
  it("institutional guidance covers the §3 buckets and carries no banned language", () => {
    const buckets = INSTITUTIONAL_MEMORY_GUIDANCE.map((r) => r.bucket);
    for (const b of ["protocol milestone", "treasury acquisition", "treasury revenue", "liquidity seeding"]) {
      expect(buckets).toContain(b);
    }
    for (const row of INSTITUTIONAL_MEMORY_GUIDANCE) {
      const blob = `${row.bucket}\n${row.guidance}`;
      assertCleanRationale(blob, []);
    }
  });

  it("member guidance holds every member bucket and carries no banned language", () => {
    expect(MEMBER_MEMORY_GUIDANCE.length).toBeGreaterThan(0);
    for (const row of MEMBER_MEMORY_GUIDANCE) {
      expect(row.baseline).toBe("hold-context");
      const blob = `${row.bucket}\n${row.guidance}`;
      assertCleanRationale(blob, []);
    }
  });
});

// ── End-to-end: events → signals → memory → chronicle → promotion ────────────
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

describe("Chronicle promotion — end-to-end from the real pipeline", () => {
  const events: CanonicalProtocolEvent[] = [
    ev({ kind: "new-member", id: "ev-nm", from: "0xA", memberOrdinal: 7 }),
    ev({ kind: "purchase", id: "ev-p1", from: "0xA", amountUsd: 50 }),
    ev({ kind: "purchase", id: "ev-p2", from: "0xA", amountUsd: 50 }),
    ev({ kind: "burn-community", id: "ev-bc", from: "0xB" }),
  ];

  it("flows EVENT → SIGNAL → MEMORY → CHRONICLE → PROMOTION with full lineage & clean rationale", () => {
    const signals = deriveSignals(events, { windowCoversDeployment: true });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    const decisions = deriveChroniclePromotionDecisions(review);

    expect(decisions.length).toBe(review.length);
    const reviewIds = new Set(review.map((c) => c.id));
    const memIds = new Set(memory.map((m) => m.id));
    for (const d of decisions) {
      // lineage back through every layer
      expect(reviewIds.has(d.candidateId)).toBe(true);
      expect(memIds.has(d.sourceMemoryCandidateId)).toBe(true);
      expect(d.sourceSignalId).toBeTruthy();
      expect(d.sourceEventId).toBeTruthy();
      // human-act invariants + clean copy
      expect(d.reviewer).toBe(BASELINE_REVIEWER);
      expect(d.timestamp).toBeNull();
      assertCleanRationale(d.rationale, d.rationaleViolations);
      // path agrees with verdict
      if (d.decision === "approved")
        expect(["institutional-memory", "member-memory"]).toContain(d.promotionPath);
      if (d.decision === "rejected") expect(d.promotionPath).toBe("none");
      if (d.decision.startsWith("hold")) expect(d.promotionPath).toBe("deferred");
    }
  });

  it("with coverage OFF, the continuity decision is HELD (hold-coverage), never approved", () => {
    const signals = deriveSignals(events, { windowCoversDeployment: false });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    const decisions = deriveChroniclePromotionDecisions(review);
    const cont = decisions.find((d) => d.category === "continuity");
    expect(cont).toBeDefined();
    expect(cont?.decision).toBe("hold-coverage");
    expect(cont?.promotionPath).toBe("deferred");
    for (const d of decisions) {
      expect(d.rationale.toLowerCase()).not.toContain("first ever");
    }
  });

  it("no member-living decision in the live pipeline is ever approved", () => {
    const signals = deriveSignals(events, { windowCoversDeployment: true });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    const decisions = deriveChroniclePromotionDecisions(review);
    for (const d of decisions.filter((x) => x.register === "member-living")) {
      expect(d.decision).not.toBe("approved");
    }
  });
});
