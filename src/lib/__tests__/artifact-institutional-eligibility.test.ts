// Batch 2 — Artifact / NFT → institutional memory eligibility (end-to-end pin).
//
// Doctrine pinned here (docs/canon/05 §4.5; MASTER_COMPLETION_PASS Batch 2):
// Artifact facts reach the institutional-memory engine through exactly TWO
// doctrine-correct paths, and no other:
//   1. A Patron Seal mint → S2 ARTIFACT signal → an artifact-category
//      protocol-institutional memory candidate → review → promotion (approved)
//      → a DRAFT institutional-register entry. It is NEVER active: no human
//      finalisation action exists, so the deterministic baseline stays a draft.
//   2. The FIRST issuance of a milestone artifact (ID1 / ID3) → an S3 MILESTONE
//      twin, emitted ONLY with deployment coverage → a milestone-category
//      protocol-institutional candidate. The artifact CATEGORY itself never
//      creates the first-mint candidate (that would duplicate the milestone).
//
// Deliberately EXCLUDED (the anti-saturation rule, canon §4.5 S1):
//   • routine, non-first artifact mints — never a memory.
//   • a first artifact mint WITHOUT coverage — no milestone twin, no memory.
//   • nft-mint-other — has no milestone twin at all (documented limit; ID2 is
//     reserved with no live producer).
//
// These exclusions are pinned so a future pass cannot silently widen
// IMPORTANT_S1_CATEGORIES or INSTITUTIONAL_FIRST_FUNDING_KINDS to artifacts.

import { describe, expect, it } from "vitest";
import type { CanonicalProtocolEvent } from "../protocol-events";
import type { ProtocolEventKind } from "../protocol-event-registry";
import { CATEGORY_FOR_KIND as EVENT_CATEGORY_FOR_KIND } from "../protocol-event-registry";
import { deriveSignals } from "../protocol-signals";
import { deriveMemoryCandidates } from "../memory-candidates";
import {
  IMPORTANT_S1_CATEGORIES,
  INSTITUTIONAL_FIRST_FUNDING_KINDS,
} from "../memory-candidate-registry";
import { deriveChronicleReviewCandidates } from "../chronicle-review-candidates";
import { deriveChroniclePromotionDecisions } from "../chronicle-promotion";
import { deriveInstitutionalRegister } from "../institutional-register";
import { findForbiddenLanguage } from "../protocol-language";

// ── Synthetic on-chain event factory (mirrors memory-candidates.test.ts) ─────
let evSeq = 0;
function ev(
  partial: Partial<CanonicalProtocolEvent> & { kind: ProtocolEventKind },
): CanonicalProtocolEvent {
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

/** Full refinement pipeline: events → signals → memory → review → promotion → register. */
function runPipeline(
  events: CanonicalProtocolEvent[],
  opts?: { windowCoversDeployment?: boolean },
) {
  const signals = deriveSignals(events, opts);
  const memory = deriveMemoryCandidates(signals);
  const review = deriveChronicleReviewCandidates(memory);
  const decisions = deriveChroniclePromotionDecisions(review);
  const register = deriveInstitutionalRegister(decisions);
  return { signals, memory, review, decisions, register };
}

describe("Artifact → institutional eligibility — anti-saturation doctrine is pinned", () => {
  it("the artifact category is NOT an important-S1 category (routine mints stay activity-only)", () => {
    expect(IMPORTANT_S1_CATEGORIES.has("artifact")).toBe(false);
  });

  it("no nft-mint kind is an institutional-first-funding kind (no S1 artifact elevation)", () => {
    expect(INSTITUTIONAL_FIRST_FUNDING_KINDS.has("nft-mint-first-signal")).toBe(false);
    expect(INSTITUTIONAL_FIRST_FUNDING_KINDS.has("nft-mint-patron-seal")).toBe(false);
    expect(INSTITUTIONAL_FIRST_FUNDING_KINDS.has("nft-mint-other")).toBe(false);
  });
});

describe("Artifact → institutional eligibility — Patron Seal (path 1)", () => {
  it("a Patron Seal mint flows end-to-end to a DRAFT artifact register entry", () => {
    const { signals, memory, register } = runPipeline(
      [ev({ kind: "nft-mint-patron-seal", id: "ps", txHash: "0xpatronsealtx" })],
      { windowCoversDeployment: true },
    );

    // Signal: S2 ARTIFACT with the artifact subject.
    const seal = signals.find((s) => s.createdFrom === "nft-mint-patron-seal")!;
    expect(seal.type).toBe("ARTIFACT");
    expect(seal.tier).toBe("S2");
    expect(seal.subject).toBe("artifact");

    // Memory candidate: protocol-institutional, artifact category, clean copy.
    const cand = memory.find((c) => c.category === "artifact")!;
    expect(cand.register).toBe("protocol-institutional");
    expect(cand.copyViolations).toEqual([]);

    // Register entry: an artifact-category protocol-institutional DRAFT.
    const entry = register.find((e) => e.category === "artifact")!;
    expect(entry).toBeDefined();
    expect(entry.register).toBe("protocol-institutional");
    expect(entry.entryStatus).toBe("draft");
    expect(entry.copyViolations).toEqual([]);
    expect(entry.lineage.length).toBeGreaterThan(0);
    // Lineage is carried, not re-read: the source tx survives the whole chain.
    expect(entry.sourceTxHash).toBe("0xpatronsealtx");
  });

  it("the Patron Seal register entry is NEVER active (no human finalisation exists)", () => {
    const { register } = runPipeline(
      [ev({ kind: "nft-mint-patron-seal", id: "ps2" })],
      { windowCoversDeployment: true },
    );
    expect(register.every((e) => e.entryStatus !== "active")).toBe(true);
  });
});

describe("Artifact → institutional eligibility — first issuance milestone (path 2)", () => {
  it("the FIRST First-Signal mint WITH coverage flows to a DRAFT milestone entry", () => {
    const { signals, memory, register } = runPipeline(
      [ev({ kind: "nft-mint-first-signal", id: "fs1" })],
      { windowCoversDeployment: true },
    );

    // An S3 MILESTONE twin is emitted alongside the base S1 artifact signal.
    const ms = signals.find((s) => s.subject === "milestone")!;
    expect(ms.type).toBe("MILESTONE");
    expect(ms.tier).toBe("S3");
    expect(ms.facts.crossedMilestoneIds).toEqual(["first-signal-mint"]);

    // It is the milestone CATEGORY (not artifact) that becomes the candidate…
    const cand = memory.find((c) => c.category === "milestone")!;
    expect(cand.register).toBe("protocol-institutional");
    // …and the artifact category never creates a first-mint candidate (no dup).
    expect(memory.some((c) => c.category === "artifact")).toBe(false);

    const entry = register.find((e) => e.category === "milestone")!;
    expect(entry.register).toBe("protocol-institutional");
    expect(entry.entryStatus).toBe("draft");
    expect(entry.copyViolations).toEqual([]);
  });
});

describe("Artifact → institutional eligibility — deliberate exclusions", () => {
  it("a First-Signal mint WITHOUT coverage yields no milestone and no memory", () => {
    const { signals, memory } = runPipeline(
      [ev({ kind: "nft-mint-first-signal", id: "fs-nocov" })],
      { windowCoversDeployment: false },
    );
    expect(signals.some((s) => s.subject === "milestone")).toBe(false);
    expect(memory).toHaveLength(0);
  });

  it("a routine (non-first) First-Signal mint creates no memory candidate", () => {
    // Two first-signal mints with coverage: only the FIRST is a milestone.
    const { memory } = runPipeline(
      [
        ev({ kind: "nft-mint-first-signal", id: "fs-a", blockNumber: 1n }),
        ev({ kind: "nft-mint-first-signal", id: "fs-b", blockNumber: 2n }),
      ],
      { windowCoversDeployment: true },
    );
    // Exactly one milestone candidate (from the first mint); the second mint is
    // routine S1 artifact and is excluded.
    expect(memory).toHaveLength(1);
    expect(memory[0].category).toBe("milestone");
    expect(memory.some((c) => c.sourceEventId === "fs-b")).toBe(false);
  });

  it("nft-mint-other has no milestone twin even on its first issuance (documented limit)", () => {
    const { signals, memory } = runPipeline(
      [ev({ kind: "nft-mint-other", id: "other1" })],
      { windowCoversDeployment: true },
    );
    expect(signals.some((s) => s.subject === "milestone")).toBe(false);
    expect(memory).toHaveLength(0);
  });
});

describe("Artifact → institutional eligibility — mixed batch invariants", () => {
  const { register } = runPipeline(
    [
      ev({ kind: "nft-mint-first-signal", id: "m-fs", blockNumber: 1n }),
      ev({ kind: "nft-mint-patron-seal", id: "m-ps", blockNumber: 2n }),
      ev({ kind: "nft-mint-other", id: "m-other", blockNumber: 3n }),
      ev({ kind: "nft-mint-first-signal", id: "m-fs2", blockNumber: 4n }),
    ],
    { windowCoversDeployment: true },
  );

  it("every artifact-derived register entry is a non-active draft with clean copy", () => {
    for (const e of register) {
      expect(e.register).toBe("protocol-institutional");
      expect(e.entryStatus).toBe("draft");
      expect(e.copyViolations).toEqual([]);
      expect(findForbiddenLanguage(`${e.title} ${e.summary} ${e.rationale}`)).toEqual([]);
    }
  });

  it("is deterministic — same events produce identical register entries", () => {
    const again = runPipeline(
      [
        ev({ kind: "nft-mint-first-signal", id: "m-fs", blockNumber: 1n }),
        ev({ kind: "nft-mint-patron-seal", id: "m-ps", blockNumber: 2n }),
        ev({ kind: "nft-mint-other", id: "m-other", blockNumber: 3n }),
        ev({ kind: "nft-mint-first-signal", id: "m-fs2", blockNumber: 4n }),
      ],
      { windowCoversDeployment: true },
    ).register;
    expect(again).toEqual(register);
  });
});
