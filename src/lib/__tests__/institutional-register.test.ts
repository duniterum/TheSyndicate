// Institutional Register layer (Sprint 6) — deterministic ChroniclePromotionDecision
// → InstitutionalRegisterEntry. The durable protocol-memory store, NOT public
// publishing (no auto-publish, no Story, no Recognition, no governance, no member
// register, no contract, no Chronicle mutation).
//
// Doctrine under test (docs/canon/05 §2.1, §4.5; chronicle-entries clause 6; spec §2/§4/§6/§9):
//   • Adjacency — entries derive from CHRONICLE PROMOTION DECISIONS only; lineage
//     to Promotion → Chronicle → Memory → Signal → Event → Tx/Block is carried
//     through the decision, never re-read.
//   • Register rule — only protocol-institutional decisions create entries; a
//     member-living decision is EXCLUDED entirely (clause 6).
//   • Status rule — approved → draft (active iff human-finalised AND coverage-ok);
//     hold-context/hold-coverage → held; rejected → rejected.
//   • Verification — hold-coverage → coverage-limited (no historic wording);
//     otherwise verified.
//   • Durable, not published — there is no "published" status; promotion to active
//     is a HUMAN/governance act, never automatic.
//   • Copy — every generated title/summary is protocol-centric, person-free, and
//     banned/forbidden/historic-claim-free.

import { describe, expect, it } from "vitest";
import type { CanonicalProtocolEvent } from "../protocol-events";
import type { ProtocolEventKind } from "../protocol-event-registry";
import { CATEGORY_FOR_KIND as EVENT_CATEGORY_FOR_KIND } from "../protocol-event-registry";
import { deriveSignals } from "../protocol-signals";
import { deriveMemoryCandidates } from "../memory-candidates";
import { deriveChronicleReviewCandidates } from "../chronicle-review-candidates";
import { deriveChroniclePromotionDecisions } from "../chronicle-promotion";
import {
  BASELINE_REVIEWER,
  type ChroniclePromotionDecision,
} from "../chronicle-promotion-registry";
import { deriveInstitutionalRegister } from "../institutional-register";
import {
  INSTITUTIONAL_EVENT_CLASSES,
  INSTITUTIONAL_REGISTER,
  findHistoricClaims,
  institutionalCopyFor,
  isHumanFinalizedDecision,
} from "../institutional-register-registry";
import { findForbiddenLanguage } from "../protocol-language";
import { CHRONICLE_BANNED_TERMS } from "../chronicle-entries";

type Decision = ChroniclePromotionDecision;

// ── Direct ChroniclePromotionDecision factory ────────────────────────────────
let seq = 0;
function dec(
  p: Partial<Decision> & {
    candidateId: string;
    decision: Decision["decision"];
    register: Decision["register"];
    category: Decision["category"];
    ruleBucket: string;
  },
): Decision {
  seq += 1;
  return {
    candidateId: p.candidateId,
    decision: p.decision,
    reviewer: p.reviewer ?? BASELINE_REVIEWER,
    rationale: p.rationale ?? "A protocol fact was recorded under a structural rule.",
    timestamp: p.timestamp ?? null,
    promotionPath: p.promotionPath ?? "institutional-memory",
    ruleBucket: p.ruleBucket,
    register: p.register,
    category: p.category,
    tier: p.tier ?? "S3",
    sourceMemoryCandidateId: p.sourceMemoryCandidateId ?? `mem-${p.candidateId}`,
    sourceSignalId: p.sourceSignalId ?? `sig-${p.candidateId}`,
    sourceEventId: p.sourceEventId ?? `evt-${p.candidateId}`,
    sourceTxHash: p.sourceTxHash ?? `0x${"a".repeat(64)}`,
    sourceBlock: p.sourceBlock ?? BigInt(seq),
    rationaleViolations: p.rationaleViolations ?? [],
  };
}

function assertCleanCopy(text: string) {
  expect(findForbiddenLanguage(text)).toEqual([]);
  const lower = text.toLowerCase();
  for (const term of CHRONICLE_BANNED_TERMS) {
    expect(lower, `copy contains banned term "${term}"`).not.toContain(term);
  }
}

// ── Register rule (§4): only protocol-institutional decisions create entries ──
describe("deriveInstitutionalRegister — register gating", () => {
  it("excludes member-living decisions entirely (never written here)", () => {
    const decisions: Decision[] = [
      dec({ candidateId: "inst", decision: "approved", register: "protocol-institutional", category: "milestone", ruleBucket: "protocol milestone" }),
      dec({ candidateId: "m1", decision: "hold-context", register: "member-living", category: "membership", ruleBucket: "member arrival", promotionPath: "deferred" }),
      dec({ candidateId: "m2", decision: "approved", register: "member-living", category: "continuity", ruleBucket: "continuity / repeat participation", promotionPath: "member-memory" }),
    ];
    const entries = deriveInstitutionalRegister(decisions);
    expect(entries.map((e) => e.sourceChronicleReviewCandidateId)).toEqual(["inst"]);
    for (const e of entries) expect(e.register).toBe(INSTITUTIONAL_REGISTER);
  });

  it("produces no entries from an all-member-living input", () => {
    const decisions: Decision[] = [
      dec({ candidateId: "m1", decision: "hold-context", register: "member-living", category: "membership", ruleBucket: "member arrival", promotionPath: "deferred" }),
    ];
    expect(deriveInstitutionalRegister(decisions)).toEqual([]);
  });
});

// ── Status matrix (§2) ───────────────────────────────────────────────────────
describe("deriveInstitutionalRegister — entry-status matrix", () => {
  it("approved baseline (no human) → draft, verified", () => {
    const [e] = deriveInstitutionalRegister([
      dec({ candidateId: "a", decision: "approved", register: "protocol-institutional", category: "milestone", ruleBucket: "protocol milestone" }),
    ]);
    expect(e.entryStatus).toBe("draft");
    expect(e.verificationStatus).toBe("verified");
    expect(e.createdAt).toBeNull();
  });

  it("approved + human-finalised + coverage-ok → active, with createdAt set", () => {
    const [e] = deriveInstitutionalRegister([
      dec({
        candidateId: "a",
        decision: "approved",
        register: "protocol-institutional",
        category: "treasury",
        ruleBucket: "treasury acquisition",
        reviewer: "curator.eth",
        timestamp: 1_700_000_000,
      }),
    ]);
    expect(e.entryStatus).toBe("active");
    expect(e.createdAt).toBe(1_700_000_000);
  });

  it("approved + human reviewer but no timestamp → still draft (not finalised)", () => {
    const [e] = deriveInstitutionalRegister([
      dec({ candidateId: "a", decision: "approved", register: "protocol-institutional", category: "milestone", ruleBucket: "protocol milestone", reviewer: "curator.eth", timestamp: null }),
    ]);
    expect(e.entryStatus).toBe("draft");
    expect(e.createdAt).toBeNull();
  });

  it("hold-context → held, verified", () => {
    const [e] = deriveInstitutionalRegister([
      dec({ candidateId: "h", decision: "hold-context", register: "protocol-institutional", category: "treasury", ruleBucket: "treasury deployment", promotionPath: "deferred" }),
    ]);
    expect(e.entryStatus).toBe("held");
    expect(e.verificationStatus).toBe("verified");
  });

  it("hold-coverage → held, coverage-limited (no historic wording allowed)", () => {
    const [e] = deriveInstitutionalRegister([
      dec({ candidateId: "c", decision: "hold-coverage", register: "protocol-institutional", category: "liquidity", ruleBucket: "coverage-limited", promotionPath: "deferred" }),
    ]);
    expect(e.entryStatus).toBe("held");
    expect(e.verificationStatus).toBe("coverage-limited");
    expect(e.title.toLowerCase()).not.toContain("first");
    expect(e.summary.toLowerCase()).not.toContain("first");
  });

  it("rejected → rejected, never active", () => {
    const [e] = deriveInstitutionalRegister([
      dec({ candidateId: "r", decision: "rejected", register: "protocol-institutional", category: "treasury", ruleBucket: "treasury revenue", promotionPath: "none" }),
    ]);
    expect(e.entryStatus).toBe("rejected");
  });

  it("a coverage-limited approval can never reach active (coverage gate)", () => {
    // hold-coverage is the only coverage-limited verdict; it is held, not active.
    const entries = deriveInstitutionalRegister([
      dec({ candidateId: "x", decision: "hold-coverage", register: "protocol-institutional", category: "liquidity", ruleBucket: "coverage-limited", reviewer: "curator.eth", timestamp: 1, promotionPath: "deferred" }),
    ]);
    expect(entries[0].entryStatus).toBe("held");
    expect(entries[0].entryStatus).not.toBe("active");
  });
});

// ── Copy (§ protocol-centric, person-free) ───────────────────────────────────
describe("deriveInstitutionalRegister — generated copy is clean & protocol-centric", () => {
  const buckets = [
    ["protocol milestone", "milestone"],
    ["chapter completion", "chapter"],
    ["artifact issuance", "artifact"],
    ["liquidity seeding", "liquidity"],
    ["liquidity removal", "liquidity"],
    ["treasury acquisition", "treasury"],
    ["treasury deployment", "treasury"],
    ["treasury revenue", "treasury"],
    ["operations spending", "operations"],
    ["protocol-wallet funding", "founder-action"],
    ["protocol-wallet burn", "burn"],
    ["system-wallet action", "system-wallet-action"],
  ] as const;

  for (const [ruleBucket, category] of buckets) {
    it(`bucket "${ruleBucket}" → clean, person-free copy & no violations`, () => {
      const [e] = deriveInstitutionalRegister([
        dec({ candidateId: `b-${ruleBucket}`, decision: "approved", register: "protocol-institutional", category: category as Decision["category"], ruleBucket }),
      ]);
      expect(e.copyViolations).toEqual([]);
      assertCleanCopy(`${e.title}\n${e.summary}`);
      // protocol-centric, never person-centric
      expect(e.title.toLowerCase()).not.toContain("founder");
      expect(e.summary.toLowerCase()).not.toContain("founder");
    });
  }

  it("an unknown rule bucket still yields safe fallback copy", () => {
    const [e] = deriveInstitutionalRegister([
      dec({ candidateId: "u", decision: "approved", register: "protocol-institutional", category: "milestone", ruleBucket: "some-unmapped-bucket" }),
    ]);
    expect(e.copyViolations).toEqual([]);
    assertCleanCopy(`${e.title}\n${e.summary}`);
  });

  it("institutionalCopyFor is deterministic and never empty", () => {
    const a = institutionalCopyFor("protocol milestone");
    const b = institutionalCopyFor("protocol milestone");
    expect(a).toEqual(b);
    expect(a.title.length).toBeGreaterThan(0);
    expect(a.summary.length).toBeGreaterThan(0);
  });
});

// ── Lineage (§1) ─────────────────────────────────────────────────────────────
describe("deriveInstitutionalRegister — lineage & ids", () => {
  it("synthesises deterministic ids and preserves the full carried lineage", () => {
    const d = dec({
      candidateId: "lin",
      decision: "approved",
      register: "protocol-institutional",
      category: "milestone",
      ruleBucket: "protocol milestone",
      sourceTxHash: `0x${"b".repeat(64)}`,
      sourceBlock: 99n,
    });
    const [e] = deriveInstitutionalRegister([d]);
    expect(e.id).toBe("institutional-entry:lin");
    expect(e.sourcePromotionDecisionId).toBe("promotion-decision:lin");
    expect(e.sourceChronicleReviewCandidateId).toBe("lin");
    expect(e.sourceMemoryCandidateId).toBe(d.sourceMemoryCandidateId);
    expect(e.sourceSignalId).toBe(d.sourceSignalId);
    expect(e.sourceEventId).toBe(d.sourceEventId);
    expect(e.sourceTxHash).toBe(`0x${"b".repeat(64)}`);
    expect(e.sourceBlock).toBe(99n);
    expect(e.createdFrom).toBe("protocol milestone");
    // ordered trail includes every upstream layer + tx/block
    expect(e.lineage[0]).toBe("institutional-entry:lin");
    expect(e.lineage).toContain("promotion-decision:lin");
    expect(e.lineage).toContain(`tx:0x${"b".repeat(64)}`);
    expect(e.lineage).toContain("block:99");
  });

  it("omits tx/block from the lineage trail when the decision carries none", () => {
    const d = dec({ candidateId: "no-tx", decision: "approved", register: "protocol-institutional", category: "milestone", ruleBucket: "protocol milestone" });
    delete (d as { sourceTxHash?: string }).sourceTxHash;
    delete (d as { sourceBlock?: bigint }).sourceBlock;
    const [e] = deriveInstitutionalRegister([d]);
    expect(e.lineage.some((l) => l.startsWith("tx:"))).toBe(false);
    expect(e.lineage.some((l) => l.startsWith("block:"))).toBe(false);
  });
});

// ── Determinism & order (§ deriver contract) ─────────────────────────────────
describe("deriveInstitutionalRegister — determinism & order", () => {
  it("preserves input order and is deterministic", () => {
    const a = dec({ candidateId: "a", decision: "approved", register: "protocol-institutional", category: "milestone", ruleBucket: "protocol milestone" });
    const b = dec({ candidateId: "b", decision: "hold-context", register: "protocol-institutional", category: "treasury", ruleBucket: "treasury deployment", promotionPath: "deferred" });
    const r1 = deriveInstitutionalRegister([a, b]);
    const r2 = deriveInstitutionalRegister([a, b]);
    expect(r1.map((e) => e.sourceChronicleReviewCandidateId)).toEqual(["a", "b"]);
    expect(r1).toEqual(r2);
  });
});

// ── Helpers / event-class table (§6, §9) ─────────────────────────────────────
describe("institutional registry — helpers & event-class table", () => {
  it("isHumanFinalizedDecision needs BOTH a non-baseline reviewer and a timestamp", () => {
    expect(isHumanFinalizedDecision({ reviewer: BASELINE_REVIEWER, timestamp: 1 })).toBe(false);
    expect(isHumanFinalizedDecision({ reviewer: "curator.eth", timestamp: null })).toBe(false);
    expect(isHumanFinalizedDecision({ reviewer: "curator.eth", timestamp: 1 })).toBe(true);
  });

  it("findHistoricClaims gates 'first'/'genesis' wording on verification posture", () => {
    const claim = "The first ever protocol genesis liquidity event.";
    expect(findHistoricClaims(claim, "coverage-limited").length).toBeGreaterThan(0);
    expect(findHistoricClaims(claim, "verified")).toEqual([]);
    expect(findHistoricClaims(claim, "locked")).toEqual([]);
  });

  it("event-class table declares both live and reserved classes, all clean", () => {
    expect(INSTITUTIONAL_EVENT_CLASSES.length).toBeGreaterThan(0);
    expect(INSTITUTIONAL_EVENT_CLASSES.some((c) => c.availability === "live")).toBe(true);
    expect(INSTITUTIONAL_EVENT_CLASSES.some((c) => c.availability === "reserved")).toBe(true);
    for (const c of INSTITUTIONAL_EVENT_CLASSES) {
      assertCleanCopy(`${c.class}\n${c.description}`);
    }
  });
});

// ── End-to-end: events → … → promotion → institutional register ──────────────
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

describe("Institutional register — end-to-end from the real pipeline", () => {
  const events: CanonicalProtocolEvent[] = [
    ev({ kind: "new-member", id: "ev-nm", from: "0xA", memberOrdinal: 7 }),
    ev({ kind: "purchase", id: "ev-p1", from: "0xA", amountUsd: 50 }),
    ev({ kind: "purchase", id: "ev-p2", from: "0xA", amountUsd: 50 }),
    ev({ kind: "burn-community", id: "ev-bc", from: "0xB" }),
  ];

  function pipeline(windowCoversDeployment: boolean) {
    const signals = deriveSignals(events, { windowCoversDeployment });
    const memory = deriveMemoryCandidates(signals);
    const review = deriveChronicleReviewCandidates(memory);
    return deriveChroniclePromotionDecisions(review);
  }

  it("only protocol-institutional decisions become entries; member-living are dropped", () => {
    const decisions = pipeline(true);
    const entries = deriveInstitutionalRegister(decisions);
    const institutional = decisions.filter((d) => d.register === "protocol-institutional");
    expect(entries.length).toBe(institutional.length);
    for (const e of entries) {
      expect(e.register).toBe(INSTITUTIONAL_REGISTER);
      expect(e.copyViolations).toEqual([]);
      assertCleanCopy(`${e.title}\n${e.summary}`);
      // every entry carries lineage and is unstamped at the baseline
      expect(e.sourceMemoryCandidateId).toBeTruthy();
      expect(e.sourceSignalId).toBeTruthy();
      expect(e.sourceEventId).toBeTruthy();
      expect(e.derivedAt).toBeNull();
      // baseline pipeline produces no auto-active durable entries
      expect(e.entryStatus).not.toBe("active");
    }
  });

  it("with coverage OFF, coverage-dependent entries are held & coverage-limited, never assert a first", () => {
    const entries = deriveInstitutionalRegister(pipeline(false));
    const limited = entries.filter((e) => e.verificationStatus === "coverage-limited");
    for (const e of limited) {
      expect(e.entryStatus).toBe("held");
    }
    for (const e of entries) {
      expect(e.title.toLowerCase()).not.toContain("first ever");
      expect(e.summary.toLowerCase()).not.toContain("first ever");
    }
  });

  it("no entry is ever auto-published and no member subject leaks through", () => {
    const entries = deriveInstitutionalRegister(pipeline(true));
    for (const e of entries) {
      // durable-memory store: no "published" status exists at all
      expect(["draft", "active", "held", "rejected"]).toContain(e.entryStatus);
      // protocol-centric: no member/wallet subject in copy
      expect(/member\s*#|wallet\s+0x/i.test(`${e.title} ${e.summary}`)).toBe(false);
    }
  });
});
