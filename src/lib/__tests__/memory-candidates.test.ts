// Memory Candidate layer (Sprint 3) — deterministic Signal → MemoryCandidate.
//
// Doctrine under test (docs/canon/05 §2.1, §4.5):
//   • Adjacency — candidates derive from SIGNALS only; lineage to the event is
//     carried through the Signal, never re-read.
//   • Register from SUBJECT — person → member-living; primitive → institutional.
//   • Tier creation rule — S0 never; S1 only {membership, continuity} or a
//     first-funding institutional moment with coverage; S2+ always.
//   • Money guardrail — significance is structural; the actor being founder /
//     system never, by itself, makes a memory.
//   • Coverage — no "first ever" without deployment coverage; continuity stays
//     window-relative and is marked coverage-limited.

import { describe, expect, it } from "vitest";
import type { CanonicalProtocolEvent } from "../protocol-events";
import type { ProtocolEventKind } from "../protocol-event-registry";
import { CATEGORY_FOR_KIND as EVENT_CATEGORY_FOR_KIND } from "../protocol-event-registry";
import { deriveSignals } from "../protocol-signals";
import type {
  Signal,
  SignalSubject,
  SignalTier,
  SignalType,
  StructuralFacts,
} from "../signal-registry";
import { deriveMemoryCandidates } from "../memory-candidates";
import { validateMemoryClassification } from "../memory-candidate-registry";
import { findForbiddenLanguage } from "../protocol-language";

// ── Direct Signal factory (unit precision over the rule matrix) ──────────────
let seq = 0;
function sig(
  p: Partial<Signal> & {
    id: string;
    type: SignalType;
    tier: SignalTier;
    subject: SignalSubject;
    createdFrom: ProtocolEventKind;
  },
): Signal {
  seq += 1;
  const facts: StructuralFacts = p.facts ?? {
    isFirstOfKind: false,
    windowCoversDeployment: false,
  };
  return {
    id: p.id,
    type: p.type,
    tier: p.tier,
    subject: p.subject,
    sourceEventId: p.sourceEventId ?? `evt-${p.id}`,
    sourceTxHash: p.sourceTxHash ?? `0x${"a".repeat(64)}`,
    sourceBlock: p.sourceBlock ?? BigInt(seq),
    reason: p.reason ?? "A verifiable protocol event was recorded.",
    createdFrom: p.createdFrom,
    verification: p.verification ?? "LIVE",
    facts,
  };
}

const facts = (over: Partial<StructuralFacts> = {}): StructuralFacts => ({
  isFirstOfKind: false,
  windowCoversDeployment: false,
  ...over,
});

describe("deriveMemoryCandidates — creation rule (tiers)", () => {
  it("S0 routine signals create no candidate", () => {
    const s = sig({ id: "s0", type: "ECONOMIC", tier: "S0", subject: "wallet", createdFrom: "swap-buy" });
    expect(deriveMemoryCandidates([s])).toHaveLength(0);
  });

  it("plain S1 economic (purchase) is activity-only — no candidate", () => {
    const s = sig({ id: "p", type: "ECONOMIC", tier: "S1", subject: "member", createdFrom: "purchase" });
    expect(deriveMemoryCandidates([s])).toHaveLength(0);
  });

  it("plain S1 artifact issuance is activity-only — no candidate", () => {
    const s = sig({ id: "a", type: "ARTIFACT", tier: "S1", subject: "artifact", createdFrom: "nft-mint-first-signal" });
    expect(deriveMemoryCandidates([s])).toHaveLength(0);
  });

  it("S1 new-member creates a member-living membership candidate", () => {
    const s = sig({ id: "nm", type: "MEMBERSHIP", tier: "S1", subject: "member", createdFrom: "new-member" });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.id).toBe("mem-nm");
    expect(c.register).toBe("member-living");
    expect(c.category).toBe("membership");
    expect(c.verification).toBe("verified");
    // tier is carried through as lineage for the downstream Chronicle layer.
    expect(c.tier).toBe("S1");
  });

  it("carries the source Signal's tier through as lineage", () => {
    const s = sig({ id: "tcarry", type: "MILESTONE", tier: "S4", subject: "milestone", createdFrom: "rank-reached" });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.tier).toBe("S4");
    expect(c.sourceSignalId).toBe("tcarry");
  });

  it("S2 with a PERSON subject → member-living (rank-reached)", () => {
    const s = sig({ id: "r", type: "MEMBERSHIP", tier: "S2", subject: "member", createdFrom: "rank-reached" });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.register).toBe("member-living");
    expect(c.category).toBe("membership");
    expect(c.title.toLowerCase()).toContain("rank");
  });

  it("S2 with a PRIMITIVE subject → protocol-institutional (patron-seal artifact)", () => {
    const s = sig({ id: "ps", type: "ARTIFACT", tier: "S2", subject: "artifact", createdFrom: "nft-mint-patron-seal" });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.register).toBe("protocol-institutional");
    expect(c.category).toBe("artifact");
  });

  it("S3 protocol milestone → protocol-institutional; summary reuses the Signal reason", () => {
    const s = sig({
      id: "ms",
      type: "MILESTONE",
      tier: "S3",
      subject: "milestone",
      createdFrom: "purchase",
      reason: "$1,000 routed — pre-declared protocol threshold crossed.",
      facts: facts({ windowCoversDeployment: true, crossedMilestoneIds: ["raise-1k"] }),
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.register).toBe("protocol-institutional");
    expect(c.category).toBe("milestone");
    expect(c.summary).toBe("$1,000 routed — pre-declared protocol threshold crossed.");
    expect(c.verification).toBe("verified");
  });

  it("S4 historic (Proof of Burn #001) → protocol-institutional milestone", () => {
    const s = sig({
      id: "pof",
      type: "MILESTONE",
      tier: "S4",
      subject: "protocol",
      createdFrom: "burn-founder",
      reason: "Proof of Burn #001 — the protocol's first verified burn.",
      facts: facts({ isFirstOfKind: true, windowCoversDeployment: true, proofOfFireIndex: 1 }),
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.register).toBe("protocol-institutional");
    expect(c.category).toBe("milestone");
  });
});

describe("deriveMemoryCandidates — dual-register burn", () => {
  it("burn-community (member subject) → member-living burn candidate", () => {
    const s = sig({ id: "bc", type: "BURN", tier: "S2", subject: "member", createdFrom: "burn-community" });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.category).toBe("burn");
    expect(c.register).toBe("member-living");
    expect(validateMemoryClassification(c)).toEqual([]);
  });

  it("burn-founder (protocol subject, founder action) → protocol-institutional founder-action", () => {
    const s = sig({
      id: "bf",
      type: "BURN",
      tier: "S2",
      subject: "protocol",
      createdFrom: "burn-founder",
      facts: facts({ founderAction: "founder-burn" }),
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.category).toBe("founder-action");
    expect(c.register).toBe("protocol-institutional");
    expect(validateMemoryClassification(c)).toEqual([]);
  });

  it("burn-founder without a founder-action fact → protocol-institutional burn (still valid)", () => {
    const s = sig({ id: "bf2", type: "BURN", tier: "S2", subject: "protocol", createdFrom: "burn-founder" });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.category).toBe("burn");
    expect(c.register).toBe("protocol-institutional");
    expect(validateMemoryClassification(c)).toEqual([]);
  });
});

describe("deriveMemoryCandidates — actor never makes a memory by itself", () => {
  it("a routine founder allocation movement creates no candidate", () => {
    const s = sig({
      id: "fm",
      type: "ECONOMIC",
      tier: "S1",
      subject: "treasury",
      createdFrom: "vault-out",
      facts: facts({ windowCoversDeployment: true, founderAction: "founder-allocation-movement" }),
    });
    expect(deriveMemoryCandidates([s])).toHaveLength(0);
  });

  it("a FIRST-of-kind, fully-covered founder allocation movement STILL creates no candidate", () => {
    // Without the explicit guard this would slip through isInstitutionalFirstFunding.
    const s = sig({
      id: "fmf",
      type: "ECONOMIC",
      tier: "S1",
      subject: "treasury",
      createdFrom: "vault-out",
      facts: facts({
        isFirstOfKind: true,
        windowCoversDeployment: true,
        founderAction: "founder-allocation-movement",
      }),
    });
    expect(deriveMemoryCandidates([s])).toHaveLength(0);
  });
});

describe("deriveMemoryCandidates — founder FUNDING is never described as a burn", () => {
  it("first covered founder-funded vault-in → funding candidate, no burn wording", () => {
    const s = sig({
      id: "ffv",
      type: "ECONOMIC",
      tier: "S1",
      subject: "treasury",
      createdFrom: "vault-in",
      facts: facts({
        isFirstOfKind: true,
        windowCoversDeployment: true,
        founderAction: "founder-funded-vault",
      }),
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.category).toBe("founder-action");
    expect(c.register).toBe("protocol-institutional");
    const blob = `${c.title} ${c.summary} ${c.reason}`.toLowerCase();
    expect(blob).not.toContain("burn");
    expect(c.copyViolations).toEqual([]);
    expect(validateMemoryClassification(c)).toEqual([]);
  });

  it("first covered founder-funded liquidity → funding candidate, no burn wording", () => {
    const s = sig({
      id: "ffl",
      type: "ECONOMIC",
      tier: "S1",
      subject: "treasury",
      createdFrom: "lp-add",
      facts: facts({
        isFirstOfKind: true,
        windowCoversDeployment: true,
        founderAction: "founder-funded-liquidity",
      }),
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.category).toBe("founder-action");
    expect(`${c.title} ${c.summary} ${c.reason}`.toLowerCase()).not.toContain("burn");
    expect(c.copyViolations).toEqual([]);
  });
});

describe("deriveMemoryCandidates — first-funding elevation (coverage-gated)", () => {
  it("first lp-add WITH coverage → protocol-institutional liquidity candidate", () => {
    const s = sig({
      id: "lp",
      type: "ECONOMIC",
      tier: "S1",
      subject: "treasury",
      createdFrom: "lp-add",
      facts: facts({ isFirstOfKind: true, windowCoversDeployment: true }),
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.category).toBe("liquidity");
    expect(c.register).toBe("protocol-institutional");
    expect(c.title.toLowerCase()).toContain("first");
  });

  it("first lp-add WITHOUT coverage → NO candidate (not coverage-limited)", () => {
    const s = sig({
      id: "lp2",
      type: "ECONOMIC",
      tier: "S1",
      subject: "treasury",
      createdFrom: "lp-add",
      facts: facts({ isFirstOfKind: true, windowCoversDeployment: false }),
    });
    expect(deriveMemoryCandidates([s])).toHaveLength(0);
  });

  it("covered but NOT first lp-add → NO candidate", () => {
    const s = sig({
      id: "lp3",
      type: "ECONOMIC",
      tier: "S1",
      subject: "treasury",
      createdFrom: "lp-add",
      facts: facts({ isFirstOfKind: false, windowCoversDeployment: true }),
    });
    expect(deriveMemoryCandidates([s])).toHaveLength(0);
  });

  it("first vault-in WITH coverage → protocol-institutional treasury candidate", () => {
    const s = sig({
      id: "vi",
      type: "ECONOMIC",
      tier: "S1",
      subject: "treasury",
      createdFrom: "vault-in",
      facts: facts({ isFirstOfKind: true, windowCoversDeployment: true }),
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.category).toBe("treasury");
    expect(c.register).toBe("protocol-institutional");
  });
});

describe("deriveMemoryCandidates — continuity & coverage", () => {
  it("continuity WITH coverage → verified, ordinal copy", () => {
    const s = sig({
      id: "c",
      type: "CONTINUITY",
      tier: "S1",
      subject: "member",
      createdFrom: "purchase",
      facts: facts({ windowCoversDeployment: true, repeatPurchaseIndex: 2 }),
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.category).toBe("continuity");
    expect(c.register).toBe("member-living");
    expect(c.verification).toBe("verified");
    expect(c.recommendedAction).toBe("review");
    expect(c.summary).toContain("2nd");
  });

  it("continuity WITHOUT coverage → coverage-limited, window-relative, never 'first ever'", () => {
    const s = sig({
      id: "c2",
      type: "CONTINUITY",
      tier: "S1",
      subject: "member",
      createdFrom: "purchase",
      facts: facts({ windowCoversDeployment: false, repeatPurchaseIndex: 2 }),
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.verification).toBe("coverage-limited");
    expect(c.recommendedAction).toBe("hold-coverage");
    expect(c.summary).toContain("within the loaded window");
    const blob = `${c.title} ${c.summary} ${c.reason}`.toLowerCase();
    expect(blob).not.toContain("first ever");
  });
});

describe("deriveMemoryCandidates — verification lineage & pending", () => {
  it("a non-LIVE source signal → pending", () => {
    const s = sig({ id: "pend", type: "MEMBERSHIP", tier: "S2", subject: "member", createdFrom: "rank-reached", verification: "PENDING" });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.verification).toBe("pending");
    expect(c.recommendedAction).toBe("review");
  });

  it("carries the Signal's tx hash and block through unchanged", () => {
    const s = sig({
      id: "lin",
      type: "MEMBERSHIP",
      tier: "S2",
      subject: "member",
      createdFrom: "rank-reached",
      sourceTxHash: "0xdeadbeef",
      sourceBlock: 123n,
    });
    const [c] = deriveMemoryCandidates([s]);
    expect(c.sourceTxHash).toBe("0xdeadbeef");
    expect(c.sourceBlock).toBe(123n);
    expect(c.sourceEventId).toBe("evt-lin");
  });
});

describe("deriveMemoryCandidates — global invariants over a mixed batch", () => {
  const batch: Signal[] = [
    sig({ id: "b-nm", type: "MEMBERSHIP", tier: "S1", subject: "member", createdFrom: "new-member" }),
    sig({ id: "b-rank", type: "MEMBERSHIP", tier: "S2", subject: "member", createdFrom: "rank-reached" }),
    sig({ id: "b-cont", type: "CONTINUITY", tier: "S1", subject: "member", createdFrom: "purchase", facts: facts({ windowCoversDeployment: true, repeatPurchaseIndex: 3 }) }),
    sig({ id: "b-seal", type: "ARTIFACT", tier: "S2", subject: "artifact", createdFrom: "nft-mint-patron-seal" }),
    sig({ id: "b-bc", type: "BURN", tier: "S2", subject: "member", createdFrom: "burn-community" }),
    sig({ id: "b-bf", type: "BURN", tier: "S2", subject: "protocol", createdFrom: "burn-founder", facts: facts({ founderAction: "founder-burn" }) }),
    sig({ id: "b-lp", type: "ECONOMIC", tier: "S1", subject: "treasury", createdFrom: "lp-add", facts: facts({ isFirstOfKind: true, windowCoversDeployment: true }) }),
    sig({ id: "b-ms", type: "MILESTONE", tier: "S3", subject: "milestone", createdFrom: "purchase", reason: "$1,000 routed — pre-declared protocol threshold crossed.", facts: facts({ windowCoversDeployment: true, crossedMilestoneIds: ["raise-1k"] }) }),
    // noise that must NOT produce candidates:
    sig({ id: "b-swap", type: "ECONOMIC", tier: "S0", subject: "wallet", createdFrom: "swap-buy" }),
    sig({ id: "b-buy", type: "ECONOMIC", tier: "S1", subject: "member", createdFrom: "purchase" }),
  ];

  const cands = deriveMemoryCandidates(batch);

  it("produces candidates only for the qualifying signals", () => {
    expect(cands.length).toBe(8);
    expect(cands.some((c) => c.sourceSignalId === "b-swap")).toBe(false);
    expect(cands.some((c) => c.sourceSignalId === "b-buy")).toBe(false);
  });

  it("every candidate cites a real Signal and keyed off it", () => {
    const ids = new Set(batch.map((s) => s.id));
    for (const c of cands) {
      expect(ids.has(c.sourceSignalId)).toBe(true);
      expect(c.id).toBe(`mem-${c.sourceSignalId}`);
      expect(c.sourceEventId).toBeTruthy();
    }
  });

  it("every candidate's classification validates (register ⟷ subject ⟷ category)", () => {
    for (const c of cands) {
      expect(validateMemoryClassification(c), c.id).toEqual([]);
    }
  });

  it("every candidate's copy is doctrine-clean (no forbidden language)", () => {
    for (const c of cands) {
      expect(c.copyViolations, c.id).toEqual([]);
      expect(findForbiddenLanguage(`${c.title} ${c.summary} ${c.reason}`), c.id).toEqual([]);
    }
  });

  it("person subjects only ever produce member-living candidates", () => {
    for (const c of cands) {
      const isPerson = c.subject === "member" || c.subject === "wallet";
      expect(isPerson ? c.register === "member-living" : c.register === "protocol-institutional", c.id).toBe(true);
    }
  });

  it("is deterministic — same signals produce identical candidates", () => {
    expect(deriveMemoryCandidates(batch)).toEqual(cands);
  });
});

// ── End-to-end: events → deriveSignals → deriveMemoryCandidates ──────────────
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

describe("Memory candidates — end-to-end from the real Signal deriver", () => {
  const events: CanonicalProtocolEvent[] = [
    ev({ kind: "new-member", id: "ev-nm", from: "0xA", memberOrdinal: 7 }),
    ev({ kind: "purchase", id: "ev-p1", from: "0xA", amountUsd: 50 }),
    ev({ kind: "purchase", id: "ev-p2", from: "0xA", amountUsd: 50 }),
    ev({ kind: "burn-community", id: "ev-bc", from: "0xB" }),
  ];

  it("flows cleanly and respects every invariant with coverage on", () => {
    const signals = deriveSignals(events, { windowCoversDeployment: true });
    const cands = deriveMemoryCandidates(signals);
    expect(cands.length).toBeGreaterThan(0);
    const sigIds = new Set(signals.map((s) => s.id));
    for (const c of cands) {
      expect(sigIds.has(c.sourceSignalId)).toBe(true);
      expect(validateMemoryClassification(c)).toEqual([]);
      expect(c.copyViolations).toEqual([]);
    }
    // A new seat and a repeat entry are both remembered as member-living.
    expect(cands.some((c) => c.category === "membership" && c.register === "member-living")).toBe(true);
    expect(cands.some((c) => c.category === "continuity" && c.register === "member-living")).toBe(true);
  });

  it("with coverage OFF asserts no protocol-wide first and marks continuity coverage-limited", () => {
    const signals = deriveSignals(events, { windowCoversDeployment: false });
    const cands = deriveMemoryCandidates(signals);
    const cont = cands.find((c) => c.category === "continuity");
    expect(cont?.verification).toBe("coverage-limited");
    for (const c of cands) {
      expect(`${c.title} ${c.summary} ${c.reason}`.toLowerCase()).not.toContain("first ever");
    }
  });
});
