import { describe, expect, it } from "vitest";

import {
  VERIFIED_INTRODUCTION_PRIORITY_ORDER,
  VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE,
  getVerifiedIntroductionNextSprint,
  isVerifiedIntroductionLaunchBlocked,
} from "../verified-introduction-v1-execution";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

describe("Verified Introduction V1 execution bridge", () => {
  it("converts founder direction approval into non-activating implementation authority", () => {
    const bridge = VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE;

    expect(bridge.productId).toBe("verified-introduction-v1");
    expect(bridge.productName).toBe("Verified Introduction");
    expect(bridge.directionApproved).toBe(true);
    expect(bridge.launchApproved).toBe(false);
    expect(bridge.implementationAuthority).toBe(
      "NON_ACTIVATING_PLANNING_AND_INFRASTRUCTURE_ONLY",
    );
    expect(bridge.launchPosture).toBe("DO_NOT_LAUNCH_PUBLIC_PRODUCT_YET");
    expect(bridge.publicJoinDefaultSourceId).toBe(ZERO_SOURCE_ID);
    expect(isVerifiedIntroductionLaunchBlocked()).toBe(true);
  });

  it("preserves the founder priority order before ERC721 and NFT work", () => {
    expect(VERIFIED_INTRODUCTION_PRIORITY_ORDER).toEqual([
      "Verified Introduction / Source Attribution public-product path",
      "SeatRecord721 / ERC721 identity layer",
      "NFT / Archive evolution",
    ]);
    expect(VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.priorityOrder[0]).toContain(
      "Verified Introduction",
    );
  });

  it("defines a concrete next sprint without exposing public source controls", () => {
    const bridge = VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE;
    const phaseIds = bridge.phases.map((phase) => phase.id);
    const safeNow = bridge.safeToImplementNow.join("\n");
    const forbidden = bridge.forbiddenUntilLaunchApproval.join("\n");

    expect(phaseIds).toEqual([
      "phase-1-non-activating-ux-spec",
      "phase-2-internal-implementation-skeleton",
      "phase-3-internal-review-surface",
      "phase-4-source-launch-packet",
      "phase-5-replit-production-qa",
      "phase-6-founder-launch-decision",
    ]);
    expect(bridge.phases[0].status).toBe("AUTHORIZED_NOW");
    expect(bridge.phases[1].status).toBe("DONE_ENOUGH");
    expect(bridge.phases[2].status).toBe("DONE_ENOUGH");
    expect(bridge.phases[3].status).toBe("DRAFT_BOUNDARY");
    expect(safeNow).toContain("buyer preview");
    expect(safeNow).toContain("Failure-state components");
    expect(safeNow).toContain("Noindex internal review surface");
    expect(safeNow).toContain("Anti-abuse and source eligibility draft review model");
    expect(safeNow).toContain("Buyer disclosure and legal/accounting draft review model");
    expect(safeNow).toContain("Current-authority and release QA draft packet");
    expect(safeNow).toContain("Founder launch-decision packet assembly");
    expect(getVerifiedIntroductionNextSprint()).toContain("Founder reviews");
    expect(getVerifiedIntroductionNextSprint()).toContain("approve launch-candidate preparation only");
    expect(getVerifiedIntroductionNextSprint()).toContain("approve with revisions");
    expect(getVerifiedIntroductionNextSprint()).toContain("defer public product");
    expect(getVerifiedIntroductionNextSprint()).toContain("reject the V1 posture");
    expect(getVerifiedIntroductionNextSprint()).toContain("ZERO_SOURCE_ID");
    expect(forbidden).toContain("No public source-aware buy path.");
    expect(forbidden).toContain("No claim UI.");
    expect(forbidden).toContain("No alias route.");
  });

  it("requires buyer-visible proof and clear-source behavior before any signature", () => {
    const bridge = VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE;
    const requirements = new Map(
      bridge.buyerFlowRequirements.map((item) => [item.id, item]),
    );

    expect(requirements.get("source-preview-before-signature")?.before).toBe(
      "WALLET_SIGNATURE",
    );
    expect(requirements.get("clear-source-back-to-zero")?.requirement).toContain(
      "ZERO_SOURCE_ID",
    );
    expect(requirements.get("active-latest-chain-gate")?.requirement).toContain(
      "latest-chain readback",
    );
    expect(requirements.get("approval-vs-buy-separation")?.requirement).toContain(
      "USDC approval",
    );
    expect(requirements.get("post-purchase-proof")?.before).toBe("LAUNCH");
  });

  it("fails closed on the states most likely to create fake-live drift", () => {
    const bridge = VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE;
    const failureCopy = bridge.failureStates
      .flatMap((state) => [state.trigger, state.requiredBehavior])
      .join("\n");
    const blockers = bridge.launchBlockers.join("\n");

    expect(failureCopy).toContain("PAUSED");
    expect(failureCopy).toContain("REVOKED");
    expect(failureCopy).toContain("expired");
    expect(failureCopy).toContain("already seated");
    expect(failureCopy).toContain("stale");
    expect(failureCopy).toContain("Fail closed before signature");
    expect(blockers).toContain("No founder launch decision has been selected");
    expect(blockers).toContain("No legal/accounting disclosure signoff");
    expect(blockers).toContain("No latest-chain current-authority readback");
    expect(blockers).toContain("No founder-approved Replit publish/live QA packet");
    expect(failureCopy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(failureCopy).not.toMatch(/yield|ROI|passive income|downline|upline/i);
  });
});
