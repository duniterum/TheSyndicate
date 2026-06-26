import { describe, expect, it } from "vitest";

import {
  VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT,
  getVerifiedIntroductionLaunchBlockers,
  isVerifiedIntroductionPublicLaunchApproved,
} from "../verified-introduction-v1-launch-packet";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

describe("Verified Introduction V1 launch packet draft", () => {
  it("keeps launch and public controls unapproved", () => {
    const packet = VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT;

    expect(packet.id).toBe("verified-introduction-v1-launch-packet-draft");
    expect(packet.productId).toBe("verified-introduction-v1");
    expect(packet.status).toBe("DRAFT_BOUNDARY_NOT_APPROVED");
    expect(packet.launchApproved).toBe(false);
    expect(packet.publicControlsApproved).toBe(false);
    expect(packet.publicJoinDefaultSourceId).toBe(ZERO_SOURCE_ID);
    expect(packet.scope).toBe("MEMBERSHIP_SALE_V3_ONLY");
    expect(packet.accessModel).toBe("INVITE_ONLY_MANUAL_APPROVAL");
    expect(packet.routePosture).toBe("NO_PUBLIC_SOURCE_ROUTE_APPROVED");
    expect(packet.sourceLinkPosture).toBe("NO_PUBLIC_SOURCE_LINK_APPROVED");
    expect(packet.claimPosture).toBe("NO_CLAIM_UI_APPROVED");
    expect(packet.dashboardPosture).toBe("NO_SOURCE_DASHBOARD_APPROVED");
    expect(isVerifiedIntroductionPublicLaunchApproved()).toBe(false);
  });

  it("marks the review surface done while leaving launch gates blocked", () => {
    const statuses = new Map(
      VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT.gates.map((gate) => [
        gate.id,
        gate.status,
      ]),
    );

    expect(statuses.get("internal-review-surface")).toBe("SATISFIED_FOR_REVIEW");
    expect(statuses.get("founder-launch-approval")).toBe(
      "PENDING_FOUNDER_APPROVAL",
    );
    expect(statuses.get("source-eligibility-policy")).toBe("PENDING_REVIEW");
    expect(statuses.get("buyer-disclosure-policy")).toBe("PENDING_REVIEW");
    expect(statuses.get("legal-accounting-review")).toBe("PENDING_REVIEW");
    expect(statuses.get("current-authority-readbacks")).toBe("PENDING_REVIEW");
    expect(statuses.get("release-and-live-qa")).toBe("PENDING_REVIEW");
    expect(statuses.get("claim-dashboard-alias-exclusions")).toBe(
      "BLOCKED_BY_DESIGN",
    );

    expect(getVerifiedIntroductionLaunchBlockers().map((gate) => gate.id)).toEqual([
      "founder-launch-approval",
      "source-eligibility-policy",
      "buyer-disclosure-policy",
      "legal-accounting-review",
      "current-authority-readbacks",
      "release-and-live-qa",
      "claim-dashboard-alias-exclusions",
    ]);
  });

  it("preserves forbidden surfaces and clean language", () => {
    const packet = VERIFIED_INTRODUCTION_V1_LAUNCH_PACKET_DRAFT;
    const copy = [
      packet.status,
      packet.routePosture,
      packet.sourceLinkPosture,
      packet.claimPosture,
      packet.dashboardPosture,
      ...packet.gates.flatMap((gate) => [
        gate.label,
        gate.requirement,
        gate.stopCondition,
      ]),
      ...packet.founderDecisionSlots,
      ...packet.forbiddenUntilApproved,
    ].join("\n");

    expect(copy).toContain("No public source link");
    expect(copy).toContain("No claim UI");
    expect(copy).toContain("No source dashboard");
    expect(copy).toContain("No public source-aware buy path");
    expect(copy).toContain("No non-zero default /join sourceId");
    expect(copy).toContain("Direction approval");
    expect(copy).toContain("cannot authorize launch");
    expect(copy).toContain(
      "If copy implies ownership, employment, yield, passive income, ROI, downline, upline, or guaranteed income, stop.",
    );
    expect(copy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(copy).not.toMatch(/yield opportunity|earn passive income|guaranteed return|top earner/i);
  });
});
