// Protocol-language vocabulary contract. Proves the forbidden-language scanner
// is word-boundary safe (the approved word "Rise" must never trip "raised") and
// that the approved concepts are themselves clean.

import { describe, it, expect } from "vitest";
import {
  findForbiddenLanguage,
  isLanguageClean,
  APPROVED_CONCEPTS,
  FORBIDDEN_LANGUAGE,
} from "../protocol-language";

describe("protocol-language · findForbiddenLanguage", () => {
  it("flags investment / yield / returns framing", () => {
    expect(findForbiddenLanguage("This is an investment.")).toContain("investment");
    expect(findForbiddenLanguage("Earn passive income today")).toContain("passive income");
    expect(findForbiddenLanguage("guaranteed returns for all")).toContain("guaranteed returns");
    expect(findForbiddenLanguage("great ROI")).toContain("roi");
    expect(findForbiddenLanguage("high yield vault")).toContain("yield");
  });

  it("flags identity / fundraising misframing", () => {
    expect(findForbiddenLanguage("requires KYC")).toContain("kyc");
    expect(findForbiddenLanguage("a verified identity check")).toContain("verified identity");
    expect(findForbiddenLanguage("we raised $1M")).toContain("raised");
    expect(findForbiddenLanguage("our fundraising round")).toContain("fundraising");
  });

  it("is word-boundary safe — approved words never trip forbidden ones", () => {
    expect(isLanguageClean("Rise and take your seat")).toBe(true);
    // 'roi' appears inside these words but must not match with \b boundaries.
    expect(isLanguageClean("android developer")).toBe(true);
    expect(isLanguageClean("a heroic effort")).toBe(true);
  });

  it("treats every approved concept as clean", () => {
    for (const concept of APPROVED_CONCEPTS) {
      expect(isLanguageClean(concept), `approved concept "${concept}"`).toBe(true);
    }
  });

  it("returns empty for clean text and is case-insensitive", () => {
    expect(findForbiddenLanguage("A verifiable on-chain record.")).toEqual([]);
    expect(findForbiddenLanguage("INVESTMENT")).toContain("investment");
  });

  it("exposes a non-empty forbidden list", () => {
    expect(FORBIDDEN_LANGUAGE.length).toBeGreaterThan(0);
  });
});
