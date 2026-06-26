import { describe, expect, it } from "vitest";

import {
  SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION,
  getSourcePublicProductDecisionAnswer,
} from "../source-public-product-framework";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

describe("source public product decision framework", () => {
  it("recommends a constrained V1 shape without approving launch", () => {
    const framework = SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION;

    expect(framework.id).toBe("verified-introduction-v1");
    expect(framework.status).toBe("FRAMEWORK_DEFINED_PUBLIC_PRODUCT_NOT_APPROVED");
    expect(framework.launchPosture).toBe("DO_NOT_LAUNCH_PUBLIC_PRODUCT_YET");
    expect(framework.directionApproved).toBe(true);
    expect(framework.launchApproved).toBe(false);
    expect(framework.implementationAuthority).toBe(
      "NON_ACTIVATING_PLANNING_AND_INFRASTRUCTURE_ONLY",
    );
    expect(framework.userFacingName).toBe("Verified Introduction");
    expect(framework.protocolName).toBe("Source Attribution");
    expect(framework.accountingName).toBe("Acquisition Source");
    expect(framework.publicNameToAvoidAsPrimary).toBe("Referral");
    expect(framework.scope).toBe("MEMBERSHIP_SALE_V3_ONLY");
    expect(framework.accessModel).toBe("INVITE_ONLY_MANUAL_APPROVAL");
    expect(framework.defaultPublicSourceId).toBe(ZERO_SOURCE_ID);
    expect(framework.founderApprovalRequired).toBe(true);
    expect(framework.founderLaunchApprovalRequired).toBe(true);
  });

  it("excludes the risky public-product surfaces from V1", () => {
    const exclusions = SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.v1Exclusions.map(
      (item) => item.id,
    );

    expect(exclusions).toEqual([
      "no-claim-ui",
      "no-source-dashboard",
      "no-aliases",
      "no-product-wide-attribution",
      "no-open-member-referral",
    ]);

    const exclusionCopy = SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.v1Exclusions
      .flatMap((item) => [item.exclusion, item.reason])
      .join("\n");

    expect(exclusionCopy).toContain("Claim UI");
    expect(exclusionCopy).toContain("Source dashboard");
    expect(exclusionCopy).toContain("Aliases");
    expect(exclusionCopy).toContain("Product-wide attribution");
    expect(exclusionCopy).toContain("Open self-serve member referral program");
    expect(exclusionCopy).not.toMatch(/claim UI is live|source links are live|referral is live/i);
  });

  it("requires buyer disclosure, clear-source behavior, and current-authority readbacks", () => {
    const buyerRules = SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.buyerExperience.map(
      (item) => item.id,
    );
    const readbacks = SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.mandatoryReadbacks.map(
      (item) => item.id,
    );

    expect(buyerRules).toContain("source-preview-before-signature");
    expect(buyerRules).toContain("clear-source-control");
    expect(buyerRules).toContain("active-status-hard-gate");
    expect(readbacks).toEqual([
      "source-registry-current-authority",
      "membership-sale-wiring",
      "post-purchase-receipt",
    ]);
    expect(SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.buyerDisclosureTemplate).toContain(
      "You may clear this source",
    );
    expect(SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.buyerDisclosureTemplate).toContain(
      "ZERO_SOURCE_ID",
    );
  });

  it("answers the 15 founder decision questions without broadening scope", () => {
    const answers = Array.from({ length: 15 }, (_, i) =>
      getSourcePublicProductDecisionAnswer(i + 1),
    ).join("\n");

    expect(answers).toContain("Verified Introduction");
    expect(answers).toContain("MembershipSaleV3-only");
    expect(answers).toContain("manual approval");
    expect(answers).toContain("MEMBER_INTRODUCTION");
    expect(answers).toContain("Aliases should be excluded");
    expect(answers).toContain("clear a source before signing");
    expect(answers).toContain("Direct payout first");
    expect(answers).toContain("Claim UI is excluded");
    expect(answers).toContain("Source dashboards are excluded");
    expect(answers).toContain("Latest-chain SourceRegistryV1");
    expect(answers).toContain("non-zero default /join");
    expect(answers).not.toMatch(/public referral is live|claim UI is live|source dashboard is live/i);
    expect(answers).not.toMatch(/passive income|guaranteed return|yield opportunity|downline|upline/i);
  });
});
