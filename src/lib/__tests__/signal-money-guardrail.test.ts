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

// Modules that derive prestige (recognition candidacy, chronicle eligibility).
const PRESTIGE_MODULES = ["recognition-candidates.ts", "chronicle-candidates.ts"];

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
