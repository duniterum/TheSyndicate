// Regression guards for the MINIMAL Signals Engine (Sprint 2).
//
// Doctrine: docs/canon/05_FOUNDATION_FREEZE.md (§3.2 tiers/types, §4.5 money
// rules). These tests FAIL if the deriver:
//   • misclassifies an event kind's base {type, tier, subject}
//   • lets a person-subject (member/wallet) signal exceed S2
//   • lets a monetary amount move a person-subject tier (money → tier leak)
//   • fabricates a "first ever" / ordinal / threshold milestone without
//     deployment coverage
//   • mislabels Proof of Fire #001 (historical, S4)
//   • emits doctrine-forbidden language in a signal reason

import { describe, expect, it } from "vitest";
import type { CanonicalProtocolEvent } from "../protocol-events";
import type { ProtocolEventKind } from "../protocol-event-registry";
import { CATEGORY_FOR_KIND } from "../protocol-event-registry";
import { deriveSignals } from "../protocol-signals";
import {
  SIGNAL_RULE_FOR_KIND,
  isPersonSubject,
  tierRank,
  type Signal,
} from "../signal-registry";
import { isLanguageClean } from "../protocol-language";

let seq = 0;
function ev(
  partial: Partial<CanonicalProtocolEvent> & {
    kind: ProtocolEventKind;
  },
): CanonicalProtocolEvent {
  seq += 1;
  const { kind } = partial;
  const defaults: CanonicalProtocolEvent = {
    id: `e${seq}`,
    kind,
    title: "",
    detail: "",
    badge: "info",
    blockNumber: BigInt(seq),
    logIndex: 0,
    txHash: `0x${"a".repeat(64)}`,
    category: CATEGORY_FOR_KIND[kind],
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

const base = (signals: Signal[], eventId: string) =>
  signals.find((s) => s.sourceEventId === eventId && s.id.endsWith("-base"))!;

describe("Signals — base rule table", () => {
  it("classifies every kind's base signal per the rule table", () => {
    for (const kind of Object.keys(SIGNAL_RULE_FOR_KIND) as ProtocolEventKind[]) {
      const e = ev({ kind, id: `k-${kind}` });
      const signals = deriveSignals([e]);
      const b = base(signals, e.id);
      const rule = SIGNAL_RULE_FOR_KIND[kind];
      expect(b.type, kind).toBe(rule.type);
      expect(b.tier, kind).toBe(rule.tier);
      expect(b.subject, kind).toBe(rule.subject);
      expect(b.createdFrom).toBe(kind);
      expect(b.verification).toBe("LIVE");
    }
  });

  it("pins the key canonical classifications", () => {
    const purchase = base(deriveSignals([ev({ kind: "purchase", id: "p1" })]), "p1");
    expect([purchase.type, purchase.tier, purchase.subject]).toEqual([
      "ECONOMIC",
      "S1",
      "member",
    ]);
    const swap = base(deriveSignals([ev({ kind: "swap-buy", id: "s1" })]), "s1");
    expect([swap.type, swap.tier, swap.subject]).toEqual(["ECONOMIC", "S0", "wallet"]);
    const rank = base(deriveSignals([ev({ kind: "rank-reached", id: "r1" })]), "r1");
    expect(rank.tier).toBe("S2");
    const burnF = base(deriveSignals([ev({ kind: "burn-founder", id: "b1" })]), "b1");
    expect([burnF.type, burnF.tier, burnF.subject]).toEqual(["BURN", "S2", "protocol"]);
    const seal = base(
      deriveSignals([ev({ kind: "nft-mint-patron-seal", id: "n1" })]),
      "n1",
    );
    expect([seal.type, seal.tier]).toEqual(["ARTIFACT", "S2"]);
  });
});

describe("Signals — money guardrail (canon §4.5)", () => {
  const mixed = (scale: number): CanonicalProtocolEvent[] => [
    ev({ kind: "purchase", id: "mp1", from: "0xA", amountUsd: 50 * scale, blockNumber: 1n }),
    ev({ kind: "new-member", id: "mm1", from: "0xA", memberOrdinal: 1, blockNumber: 1n, logIndex: 1 }),
    ev({ kind: "purchase", id: "mp2", from: "0xA", amountUsd: 9_999_999 * scale, blockNumber: 2n }),
    ev({ kind: "swap-buy", id: "ms1", from: "0xB", amountUsd: 5_000_000 * scale, blockNumber: 3n }),
    ev({ kind: "rank-reached", id: "mr1", from: "0xA", blockNumber: 4n }),
    ev({ kind: "burn-community", id: "mb1", from: "0xC", blockNumber: 5n }),
  ];

  it("never lets a person-subject (member/wallet) signal exceed S2", () => {
    for (const cov of [false, true]) {
      const signals = deriveSignals(mixed(1_000), { windowCoversDeployment: cov });
      for (const s of signals) {
        if (isPersonSubject(s.subject)) {
          expect(tierRank(s.tier), `${s.id} (${s.subject})`).toBeLessThanOrEqual(
            tierRank("S2"),
          );
        }
      }
    }
  });

  it("person-subject tiers are invariant under amount scaling (no money→tier leak)", () => {
    const fp = (s: Signal[]) =>
      s
        .filter((x) => isPersonSubject(x.subject))
        .map((x) => `${x.sourceEventId}:${x.type}:${x.tier}`)
        .sort();
    for (const cov of [false, true]) {
      const a = fp(deriveSignals(mixed(1), { windowCoversDeployment: cov }));
      const b = fp(deriveSignals(mixed(1_000_000), { windowCoversDeployment: cov }));
      expect(b).toEqual(a);
    }
  });

  it("with no deployment coverage, scaling amounts produces identical signals", () => {
    const shape = (s: Signal[]) =>
      s.map((x) => `${x.id}|${x.type}|${x.tier}|${x.subject}`).sort();
    const a = shape(deriveSignals(mixed(1)));
    const b = shape(deriveSignals(mixed(1_000_000)));
    expect(b).toEqual(a);
  });

  it("a huge swap is still S0 noise and never spawns extra signals", () => {
    const signals = deriveSignals(
      [ev({ kind: "swap-buy", id: "huge", from: "0xZ", amountUsd: 1e12 })],
      { windowCoversDeployment: true },
    );
    expect(signals).toHaveLength(1);
    expect(signals[0].tier).toBe("S0");
  });
});

describe("Signals — pre-declared milestones (protocol subject)", () => {
  it("emits a member-ordinal milestone only with deployment coverage", () => {
    const e = ev({ kind: "new-member", id: "nm100", memberOrdinal: 100 });
    expect(
      deriveSignals([e]).some((s) => s.subject === "milestone"),
    ).toBe(false);
    const withCov = deriveSignals([e], { windowCoversDeployment: true });
    const ms = withCov.find((s) => s.subject === "milestone")!;
    expect(ms.type).toBe("MILESTONE");
    expect(ms.tier).toBe("S3");
    expect(ms.facts.crossedMilestoneIds).toEqual(["members-100"]);
  });

  it("member #10,000 is a historical S4 milestone", () => {
    const ms = deriveSignals([ev({ kind: "new-member", id: "nm10k", memberOrdinal: 10_000 })], {
      windowCoversDeployment: true,
    }).find((s) => s.subject === "milestone")!;
    expect(ms.tier).toBe("S4");
    expect(ms.facts.crossedMilestoneIds).toEqual(["members-10000"]);
  });

  it("crosses a cumulative routed-USDC threshold exactly once at the crossing event", () => {
    const events = [
      ev({ kind: "purchase", id: "cu1", from: "0xA", amountUsd: 60, blockNumber: 1n }),
      ev({ kind: "purchase", id: "cu2", from: "0xB", amountUsd: 50, blockNumber: 2n }),
      ev({ kind: "purchase", id: "cu3", from: "0xC", amountUsd: 30, blockNumber: 3n }),
    ];
    const signals = deriveSignals(events, { windowCoversDeployment: true });
    const raise100 = signals.filter(
      (s) => s.facts.crossedMilestoneIds?.[0] === "raise-100",
    );
    expect(raise100).toHaveLength(1);
    expect(raise100[0].sourceEventId).toBe("cu2");
    expect(raise100[0].subject).toBe("milestone");
    expect(raise100[0].tier).toBe("S3");
  });

  it("first-artifact issuance is a milestone only with deployment coverage", () => {
    const e = ev({ kind: "nft-mint-first-signal", id: "fa1" });
    expect(deriveSignals([e]).some((s) => s.subject === "milestone")).toBe(false);
    const ms = deriveSignals([e], { windowCoversDeployment: true }).find(
      (s) => s.subject === "milestone",
    )!;
    expect(ms.tier).toBe("S3");
    expect(ms.facts.crossedMilestoneIds).toEqual(["first-signal-mint"]);
  });
});

describe("Signals — burn history & continuity", () => {
  it("Proof of Fire #001 is a historical (S4) protocol signal", () => {
    const s4 = deriveSignals([
      ev({ kind: "burn-founder", id: "pof1", proofOfFireIndex: 1 }),
    ]).find((s) => s.tier === "S4")!;
    expect(s4.type).toBe("MILESTONE");
    expect(s4.subject).toBe("protocol");
    expect(s4.reason).toContain("Proof of Fire #001");
  });

  it("a later Proof of Fire is not historical", () => {
    const signals = deriveSignals([
      ev({ kind: "burn-community", id: "pof2", proofOfFireIndex: 2 }),
    ]);
    expect(signals.some((s) => s.tier === "S4")).toBe(false);
  });

  it("a repeat purchase by the same seat emits one CONTINUITY signal", () => {
    const signals = deriveSignals([
      ev({ kind: "purchase", id: "rp1", from: "0xA", amountUsd: 10, blockNumber: 1n }),
      ev({ kind: "purchase", id: "rp2", from: "0xA", amountUsd: 10, blockNumber: 2n }),
    ]);
    const cont = signals.filter((s) => s.type === "CONTINUITY");
    expect(cont).toHaveLength(1);
    expect(cont[0].sourceEventId).toBe("rp2");
    expect(cont[0].subject).toBe("member");
    expect(cont[0].tier).toBe("S1");
    expect(cont[0].facts.repeatPurchaseIndex).toBe(2);
  });

  it("does not assert an absolute purchase ordinal without deployment coverage", () => {
    const events = [
      ev({ kind: "purchase", id: "wo1", from: "0xA", amountUsd: 10, blockNumber: 1n }),
      ev({ kind: "purchase", id: "wo2", from: "0xA", amountUsd: 10, blockNumber: 2n }),
    ];
    const windowRel = deriveSignals(events).find((s) => s.type === "CONTINUITY")!;
    expect(windowRel.reason).toContain("within the loaded window");
    expect(windowRel.reason).not.toMatch(/\b2nd purchase\b/);

    const covered = deriveSignals(events, { windowCoversDeployment: true }).find(
      (s) => s.type === "CONTINUITY",
    )!;
    expect(covered.reason).toContain("2nd purchase");
  });
});

describe("Signals — language & determinism", () => {
  const everything: CanonicalProtocolEvent[] = [
    ev({ kind: "purchase", id: "x1", from: "0xA", amountUsd: 120, blockNumber: 1n }),
    ev({ kind: "new-member", id: "x2", from: "0xA", memberOrdinal: 100, blockNumber: 1n, logIndex: 1 }),
    ev({ kind: "purchase", id: "x3", from: "0xA", amountUsd: 10, blockNumber: 2n }),
    ev({ kind: "rank-reached", id: "x4", from: "0xA", blockNumber: 3n }),
    ev({ kind: "swap-buy", id: "x5", from: "0xB", amountUsd: 99, blockNumber: 4n }),
    ev({ kind: "swap-sell", id: "x6", from: "0xB", amountUsd: 99, blockNumber: 5n }),
    ev({ kind: "lp-add", id: "x7", blockNumber: 6n }),
    ev({ kind: "lp-remove", id: "x8", blockNumber: 7n }),
    ev({ kind: "vault-in", id: "x9", blockNumber: 8n }),
    ev({ kind: "vault-out", id: "x10", blockNumber: 9n }),
    ev({ kind: "nft-mint-first-signal", id: "x11", blockNumber: 10n }),
    ev({ kind: "nft-mint-patron-seal", id: "x12", blockNumber: 11n }),
    ev({ kind: "nft-mint-other", id: "x13", blockNumber: 12n }),
    ev({ kind: "burn-founder", id: "x14", proofOfFireIndex: 1, blockNumber: 13n }),
    ev({ kind: "burn-community", id: "x15", proofOfFireIndex: 2, blockNumber: 14n }),
  ];

  it("every signal reason is doctrine-clean (no forbidden framing)", () => {
    const signals = deriveSignals(everything, { windowCoversDeployment: true });
    for (const s of signals) {
      expect(isLanguageClean(s.reason), `${s.id}: "${s.reason}"`).toBe(true);
    }
  });

  it("is deterministic — same input yields identical output", () => {
    const a = deriveSignals(everything, { windowCoversDeployment: true });
    const b = deriveSignals(everything, { windowCoversDeployment: true });
    expect(JSON.stringify(a, (_k, v) => (typeof v === "bigint" ? v.toString() : v))).toBe(
      JSON.stringify(b, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
    );
  });

  it("every signal carries a unique id", () => {
    const signals = deriveSignals(everything, { windowCoversDeployment: true });
    expect(new Set(signals.map((s) => s.id)).size).toBe(signals.length);
  });
});
