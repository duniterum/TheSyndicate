// Recognition candidate layer. Proves member-subject recognition defaults to
// anonymous display, never uses identity-verification / KYC framing, always
// carries a legal note, and that future-referrer reward stays PENDING.

import { describe, it, expect } from "vitest";
import {
  deriveRecognitionCandidates,
  recognitionDisplayName,
  DEFAULT_DISPLAY_TIER,
  RECOGNITION_LEGAL_NOTE,
  RECOGNITION_DISPLAY_RULES,
  RECOGNITION_KIND_BASIS,
} from "../recognition-candidates";
import { findForbiddenLanguage } from "../protocol-language";
import { FUTURE_REFERRAL_REWARD_STATUS } from "../future-referral";

describe("recognition-candidates", () => {
  it("defaults every candidate to anonymous display + CANDIDATE status", () => {
    const cands = deriveRecognitionCandidates({
      memberNumber: 217,
      patronSeals: 1,
      proofOfFireParticipant: true,
      isEarlyChapterMember: true,
      isMajorRank: true,
      firstSignals: 1,
    });
    expect(cands.length).toBe(5);
    for (const c of cands) {
      expect(c.displayTier).toBe("anonymous");
      expect(c.status).toBe("CANDIDATE");
      expect(c.memberRef).toBe("Member #217");
      expect(c.legalNote).toBe(RECOGNITION_LEGAL_NOTE);
    }
    expect(DEFAULT_DISPLAY_TIER).toBe("anonymous");
  });

  it("emits no candidates when the member has no recognized facts", () => {
    expect(deriveRecognitionCandidates({ memberNumber: 1 })).toEqual([]);
  });

  it("never uses KYC / verified-identity / investment framing", () => {
    const corpus = [
      RECOGNITION_LEGAL_NOTE,
      ...Object.values(RECOGNITION_KIND_BASIS),
      ...RECOGNITION_DISPLAY_RULES.map((r) => `${r.label} ${r.description}`),
    ];
    for (const text of corpus) {
      expect(findForbiddenLanguage(text), text).toEqual([]);
    }
  });

  it("resolves display names by tier (alias/public are reserved, fall back to ref)", () => {
    const [c] = deriveRecognitionCandidates({ memberNumber: 9, patronSeals: 1 });
    expect(recognitionDisplayName(c, "anonymous")).toBe("Member #9");
    expect(recognitionDisplayName(c, "alias", "Ronin")).toBe("Ronin");
    expect(recognitionDisplayName(c, "alias")).toBe("Member #9");
    expect(recognitionDisplayName(c, "public")).toBe("Member #9");
  });

  it("keeps the future referrer reward PENDING", () => {
    expect(FUTURE_REFERRAL_REWARD_STATUS).toBe("PENDING");
    expect(RECOGNITION_KIND_BASIS["future-referrer"]).toContain("attribution only");
  });

  it("documents all three display tiers", () => {
    const tiers = RECOGNITION_DISPLAY_RULES.map((r) => r.tier);
    expect(tiers).toEqual(["anonymous", "alias", "public"]);
  });
});
