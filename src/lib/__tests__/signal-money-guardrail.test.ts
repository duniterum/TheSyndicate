/**
 * Signal / money guardrail (Sprint A.7).
 *
 * Doctrine: docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md.
 *
 * Money-derived data MAY feed Rank recognition and the (future) Financial Trace,
 * but it must NEVER, by itself, raise a Signal tier above S2, create an S3+
 * signal, create a Chronicle candidate, confer governance, or imply ROI/reward.
 *
 * This guard keeps the money-weighted scores (archiveWeight, builderScore,
 * commission*) quarantined OUT of the prestige-deriving modules, so a future
 * Signal Engine cannot accidentally consume spend as prestige.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const LIB = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(LIB, rel), "utf8");

// Money-weighted score symbols that must stay out of the recognition / chronicle
// (prestige-deriving) layer.
const MONEY_SCORE_TOKENS = [
  "archiveWeight",
  "builderScore",
  "commissionPct",
  "commissionUsdc",
  "grossCommissionUsdc",
  "computeScore",
];

// Modules that derive prestige (recognition candidacy, chronicle eligibility,
// the Sprint 2 Signals Engine, and — added Sprint 3 — the Memory Candidate
// layer). A Signal or candidate must never consume a money-weighted score as
// prestige.
const PRESTIGE_MODULES = [
  "recognition-candidates.ts",
  "chronicle-candidates.ts",
  "signal-registry.ts",
  "protocol-signals.ts",
  "memory-candidate-registry.ts",
  "memory-candidates.ts",
  "chronicle-review-candidate-registry.ts",
  "chronicle-review-candidates.ts",
  "chronicle-promotion-registry.ts",
  "chronicle-promotion.ts",
];

// Per-actor MONETARY MAGNITUDE field names that must never appear in the Signal
// VOCABULARY leaf (signal-registry.ts → StructuralFacts). Counts/ordinals/ids
// are fine; an amount, balance, weighted score, or commission is not. (The
// deriver protocol-signals.ts MAY read a raw amountUsd per canon §4.5 Rule A to
// detect a pre-declared threshold crossing, so it is intentionally NOT checked
// here — see signal-engine.test.ts for the amount-invariance proof.)
const RULE_E_MAGNITUDE_TOKENS = [
  "amountUsd",
  "usdcAmount",
  "synAmount",
  "walletBalance",
  "archiveWeight",
  "builderScore",
  "commissionUsd",
  "commissionPct",
];

describe("Signal/money guardrail — money-weighted scores stay quarantined", () => {
  for (const mod of PRESTIGE_MODULES) {
    const src = read(mod);
    for (const token of MONEY_SCORE_TOKENS) {
      it(`${mod} does not reference money-weighted "${token}"`, () => {
        expect(src.includes(token)).toBe(false);
      });
    }
    it(`${mod} does not import the leaderboard or referral preview`, () => {
      expect(src).not.toMatch(/leaderboard-hooks/);
      expect(src).not.toMatch(/preview\/referral/);
    });
  }

  it("money-weighted score modules keep the QUARANTINE marker", () => {
    expect(read("leaderboard-hooks.ts")).toContain("QUARANTINE: money-weighted score");
    expect(read("preview/referral.ts")).toContain("QUARANTINE: money-weighted score");
  });
});

describe("Signal registry — money-safe StructuralFacts (canon §4.5 Rule E)", () => {
  const src = read("signal-registry.ts");
  for (const token of RULE_E_MAGNITUDE_TOKENS) {
    it(`signal-registry.ts never names the magnitude field "${token}"`, () => {
      expect(src.includes(token)).toBe(false);
    });
  }
});

// The Memory Candidate layer reads ONLY a Signal's structural facts — never a
// raw amount — so, UNLIKE the signal deriver, both memory modules are checked
// for magnitude identifiers too.
describe("Memory candidate layer — money-safe (canon §4.5 Rule E)", () => {
  for (const mod of ["memory-candidate-registry.ts", "memory-candidates.ts"]) {
    const src = read(mod);
    for (const token of RULE_E_MAGNITUDE_TOKENS) {
      it(`${mod} never names the magnitude field "${token}"`, () => {
        expect(src.includes(token)).toBe(false);
      });
    }
  }
});

// The Chronicle Candidate layer reads ONLY a MemoryCandidate's structural fields
// (tier/category/register/lineage) — never any amount. Like the memory layer,
// both modules are checked for magnitude identifiers: eligibility must be tier-
// driven, never money-driven.
describe("Chronicle candidate layer — money-safe (canon §4.5 Rule E)", () => {
  for (const mod of ["chronicle-review-candidate-registry.ts", "chronicle-review-candidates.ts"]) {
    const src = read(mod);
    for (const token of RULE_E_MAGNITUDE_TOKENS) {
      it(`${mod} never names the magnitude field "${token}"`, () => {
        expect(src.includes(token)).toBe(false);
      });
    }
  }
});

// The Chronicle Promotion layer reads ONLY a ChronicleReviewCandidate's
// structural fields (register/category/tier/lineage + source kind) — never any
// amount. Both modules are checked for magnitude identifiers: the promotion
// verdict must be category/tier-driven, never money-driven, and never lifted by
// the actor's identity.
describe("Chronicle promotion layer — money-safe (canon §4.5 Rule E)", () => {
  for (const mod of ["chronicle-promotion-registry.ts", "chronicle-promotion.ts"]) {
    const src = read(mod);
    for (const token of RULE_E_MAGNITUDE_TOKENS) {
      it(`${mod} never names the magnitude field "${token}"`, () => {
        expect(src.includes(token)).toBe(false);
      });
    }
  }
});
