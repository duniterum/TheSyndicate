import { describe, expect, it } from "vitest";

import { ZERO_SOURCE_ID } from "../source-policy-observability";
import {
  VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW,
  getVerifiedIntroductionAntiAbuseBlockers,
  isVerifiedIntroductionAntiAbuseApproved,
} from "../verified-introduction-v1-anti-abuse";

describe("Verified Introduction V1 anti-abuse review", () => {
  it("keeps anti-abuse as draft review, not launch approval", () => {
    const review = VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW;

    expect(review.id).toBe("verified-introduction-v1-anti-abuse-review");
    expect(review.productId).toBe("verified-introduction-v1");
    expect(review.status).toBe("DRAFT_REVIEW_NOT_APPROVED");
    expect(review.launchApproved).toBe(false);
    expect(review.publicControlsApproved).toBe(false);
    expect(review.defaultPublicSourceId).toBe(ZERO_SOURCE_ID);
    expect(isVerifiedIntroductionAntiAbuseApproved()).toBe(false);
  });

  it("defines the non-negotiable source eligibility gates", () => {
    const statuses = new Map(
      VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW.eligibilityRules.map((rule) => [
        rule.id,
        rule.status,
      ]),
    );

    expect(statuses.get("manual-source-approval")).toBe("PENDING_FOUNDER_APPROVAL");
    expect(statuses.get("source-class-policy")).toBe("PENDING_REVIEW");
    expect(statuses.get("buyer-eligibility")).toBe("PENDING_REVIEW");
    expect(statuses.get("source-buyer-self-source-block")).toBe("PENDING_REVIEW");
    expect(statuses.get("terms-cap-window-gate")).toBe("PENDING_REVIEW");
    expect(statuses.get("buyer-visible-attribution")).toBe("SATISFIED_FOR_REVIEW");
    expect(statuses.get("prohibited-promotion")).toBe("PENDING_REVIEW");
    expect(statuses.get("excluded-surfaces")).toBe("BLOCKED_BY_DESIGN");

    expect(getVerifiedIntroductionAntiAbuseBlockers().map((rule) => rule.id)).toEqual([
      "manual-source-approval",
      "source-class-policy",
      "buyer-eligibility",
      "source-buyer-self-source-block",
      "terms-cap-window-gate",
      "prohibited-promotion",
      "excluded-surfaces",
    ]);
  });

  it("fails closed for the abuse states that matter before signature", () => {
    const states = VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW.abuseStates;
    const ids = states.map((state) => state.id);
    const copy = states
      .flatMap((state) => [
        state.risk,
        state.trigger,
        state.control,
        state.operatorAction,
        state.buyerOutcome,
      ])
      .join("\n");

    expect(ids).toEqual([
      "UNAPPROVED_SOURCE",
      "SELF_SOURCE",
      "ALREADY_SEATED_OR_HISTORICAL",
      "INACTIVE_OR_STALE_SOURCE",
      "CAP_OR_REPEAT_LIMIT",
      "HIDDEN_ATTRIBUTION",
      "PROMOTION_VIOLATION",
      "ESCROW_OR_PAYOUT_FAILURE",
    ]);
    expect(copy).toContain("Buyer remains on ZERO_SOURCE_ID");
    expect(copy).toContain("Compare wallets before signature");
    expect(copy).toContain("Read latest SourceRegistryV1 state");
    expect(copy).toContain("Reject silent attribution patterns");
    expect(copy).toContain("keep claim UI excluded");
    expect(copy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(copy).not.toMatch(/top earner|guaranteed return|yield opportunity|earn passive income/i);
  });

  it("preserves forbidden public surfaces", () => {
    const forbidden = VERIFIED_INTRODUCTION_V1_ANTI_ABUSE_REVIEW.forbiddenUntilApproved.join("\n");

    expect(forbidden).toContain("No public source link.");
    expect(forbidden).toContain("No alias route.");
    expect(forbidden).toContain("No claim UI.");
    expect(forbidden).toContain("No source dashboard.");
    expect(forbidden).toContain("No public source-aware buy path.");
    expect(forbidden).toContain("No non-zero default /join sourceId.");
    expect(forbidden).toContain("No contract change.");
  });
});
