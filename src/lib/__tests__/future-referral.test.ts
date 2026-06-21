// Future referral model. Proves the reserved attribution shape always reports
// rewardStatus PENDING, carries a legal-safe note, and that the referral
// namespace is kept OUT of the live ProtocolEventKind union.

import { describe, it, expect } from "vitest";
import {
  buildFutureReferralAttribution,
  describeFutureReferral,
  FUTURE_REFERRAL_REWARD_STATUS,
  FUTURE_REFERRAL_NOTE,
} from "../future-referral";
import { CATEGORY_FOR_KIND } from "../protocol-event-registry";
import { findForbiddenLanguage } from "../protocol-language";

describe("future-referral", () => {
  it("always reports rewardStatus PENDING", () => {
    expect(FUTURE_REFERRAL_REWARD_STATUS).toBe("PENDING");
    const a = buildFutureReferralAttribution({
      referrerMember: "Member #27",
      newMember: "Member #456",
      saleUsdc: 100,
      usdcRouted: 100,
      synSold: 1000,
    });
    expect(a.rewardStatus).toBe("PENDING");
    expect(a.referrerMember).toBe("Member #27");
    expect(a.newMember).toBe("Member #456");
    expect(a.legalNote).toBe(FUTURE_REFERRAL_NOTE);
  });

  it("describes the attribution in plain protocol voice", () => {
    const a = buildFutureReferralAttribution({ referrerMember: "Member #27", newMember: "Member #456" });
    expect(describeFutureReferral(a)).toBe("Member #27 brought Member #456 into The Syndicate.");
  });

  it("keeps the legal note free of investment/reward framing", () => {
    expect(findForbiddenLanguage(FUTURE_REFERRAL_NOTE)).toEqual([]);
  });

  it("keeps referral OUT of the live ProtocolEventKind union", () => {
    const kinds = Object.keys(CATEGORY_FOR_KIND);
    expect(kinds.some((k) => k.includes("referral"))).toBe(false);
  });

  it("distinguishes contract candidate work from live deployed routing", () => {
    const src = FUTURE_REFERRAL_NOTE;
    expect(src).toContain("verified source records are created, read back, legally approved, and wired live");
    expect(src).not.toMatch(/until an on-chain referral contract is deployed/i);
    expect(src).not.toMatch(/referral router is deployed/i);
  });
});
