import { describe, expect, it } from "vitest";

import { ZERO_SOURCE_ID } from "../source-policy-observability";
import {
  VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW,
  getVerifiedIntroductionDisclosureBlockers,
  isVerifiedIntroductionDisclosureApproved,
} from "../verified-introduction-v1-disclosure";

describe("Verified Introduction V1 disclosure review", () => {
  it("keeps disclosure as draft review, not launch approval", () => {
    const review = VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW;

    expect(review.id).toBe("verified-introduction-v1-disclosure-review");
    expect(review.productId).toBe("verified-introduction-v1");
    expect(review.status).toBe("DRAFT_REVIEW_NOT_APPROVED");
    expect(review.launchApproved).toBe(false);
    expect(review.publicControlsApproved).toBe(false);
    expect(review.defaultPublicSourceId).toBe(ZERO_SOURCE_ID);
    expect(isVerifiedIntroductionDisclosureApproved()).toBe(false);
  });

  it("defines the accounting labels buyers and operators must share", () => {
    const labels = new Map(
      VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW.accountingLabels.map((item) => [
        item.id,
        item,
      ]),
    );

    expect(labels.get("acquisition-source")?.label).toBe("Acquisition Source");
    expect(labels.get("acquisition-commission")?.label).toBe("Acquisition Commission");
    expect(labels.get("net-usdc-routed")?.label).toBe("Net USDC Routed");
    expect(labels.get("direct-payout-first")?.label).toBe("Direct Payout First");

    const copy = [...labels.values()].map((item) => `${item.definition}\n${item.mustNotMean}`).join("\n");
    expect(copy).toContain("Gross USDC minus acquisition commission");
    expect(copy).toContain("Vault, Liquidity, and Operations");
    expect(copy).toContain("not proof that escrow claiming is public-live");
    expect(copy).toContain("Not yield, passive income, guaranteed income, ROI");
    expect(copy).toContain("not a source dashboard");
  });

  it("requires buyer understanding before any future signature", () => {
    const blockers = getVerifiedIntroductionDisclosureBlockers().map((item) => item.id);
    const required = VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW.requiredBeforeSignature.join("\n");

    expect(blockers).toEqual([
      "source-identity-before-signature",
      "commission-and-net-routing",
      "payout-and-escrow",
    ]);
    expect(required).toContain("Source label, class, status, wallet, and payout posture are visible");
    expect(required).toContain("Commission bps, Acquisition Commission, and Net USDC Routed are visible");
    expect(required).toContain("Buyer can clear source and return to ZERO_SOURCE_ID");
    expect(required).toContain("Approval and buy are separate actions");
    expect(required).toContain("No claim UI, source dashboard, source link, alias route, or public referral launch is implied");
  });

  it("blocks copy that would make Verified Introduction look like referral launch or money-game mechanics", () => {
    const forbidden = VERIFIED_INTRODUCTION_V1_DISCLOSURE_REVIEW.forbiddenCopy;
    const patterns = forbidden.map((item) => item.forbiddenPattern).join("\n");
    const safer = forbidden.map((item) => item.saferReplacement).join("\n");

    expect(patterns).toContain("public referral is live");
    expect(patterns).toContain("claim your commission");
    expect(patterns).toContain("yield / ROI / passive income / guaranteed return");
    expect(patterns).toContain("downline / upline");
    expect(patterns).toContain("official representative / employee / agent / owns the member");
    expect(safer).toContain("invite-only and manually approved");
    expect(safer).toContain("direct first");
    expect(safer).toContain("direct on-chain acquisition cost");
    expect(safer).not.toMatch(/claim UI is live|source links are live|passive income|downline/i);
  });
});
