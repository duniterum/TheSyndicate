import { describe, expect, it } from "vitest";

import {
  VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET,
  getVerifiedIntroductionFounderDecisionBlockers,
  isVerifiedIntroductionFounderLaunchApproved,
} from "../verified-introduction-v1-founder-launch-decision";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

describe("Verified Introduction V1 founder launch-decision packet", () => {
  it("assembles the decision packet without granting launch authority", () => {
    const packet = VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET;

    expect(packet.id).toBe("verified-introduction-v1-founder-launch-decision-packet");
    expect(packet.productId).toBe("verified-introduction-v1");
    expect(packet.status).toBe("READY_FOR_FOUNDER_REVIEW_NO_LAUNCH_AUTHORITY");
    expect(packet.directionApproved).toBe(true);
    expect(packet.launchApproved).toBe(false);
    expect(packet.publicControlsApproved).toBe(false);
    expect(packet.publicJoinDefaultSourceId).toBe(ZERO_SOURCE_ID);
    expect(packet.readyForFounderDecision).toBe(true);
    expect(packet.readyForPublicLaunch).toBe(false);
    expect(packet.readyForPublicControlsImplementation).toBe(false);
    expect(isVerifiedIntroductionFounderLaunchApproved()).toBe(false);
  });

  it("pulls every prior review ingredient into one founder decision surface", () => {
    const ingredients = VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET.ingredients;

    expect(ingredients.map((item) => item.id)).toEqual([
      "direction-approved",
      "execution-bridge",
      "launch-packet-draft",
      "anti-abuse-review",
      "disclosure-review",
      "release-qa-review",
    ]);
    expect(ingredients.map((item) => item.source)).toContain(
      "src/lib/verified-introduction-v1-anti-abuse.ts",
    );
    expect(ingredients.map((item) => item.source)).toContain(
      "src/lib/verified-introduction-v1-disclosure.ts",
    );
    expect(ingredients.map((item) => item.source)).toContain(
      "src/lib/verified-introduction-v1-release-qa.ts",
    );
  });

  it("offers founder options without approving public source controls", () => {
    const packet = VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET;
    const optionIds = packet.decisionOptions.map((option) => option.id);
    const copy = packet.decisionOptions
      .flatMap((option) => [
        option.label,
        option.founderPhrase,
        option.meaning,
        option.ifChosen,
        ...option.stillForbidden,
      ])
      .join("\n");

    expect(optionIds).toEqual([
      "APPROVE_LAUNCH_CANDIDATE_PREPARATION_ONLY",
      "APPROVE_WITH_REVISIONS",
      "DEFER_PUBLIC_PRODUCT",
      "REJECT_V1_POSTURE",
    ]);
    expect(copy).toContain("launch-candidate preparation only");
    expect(copy).toContain("does not activate referral");
    expect(copy).toContain("No public source-aware buy path.");
    expect(copy).toContain("No non-zero default /join sourceId.");
    expect(copy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(copy).not.toMatch(/yield opportunity|guaranteed return|top earner/i);
  });

  it("keeps unresolved founder, readback, Replit, and exclusion gates visible", () => {
    const packet = VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET;
    const statuses = new Map(
      packet.requiredFounderDecisions.map((item) => [item.id, item.status]),
    );

    expect(statuses.get("launch-posture")).toBe("REQUIRES_FOUNDER_DECISION");
    expect(statuses.get("source-eligibility")).toBe("REQUIRES_FOUNDER_DECISION");
    expect(statuses.get("legal-accounting-copy")).toBe("REQUIRES_LEGAL_ACCOUNTING_REVIEW");
    expect(statuses.get("latest-chain-readback")).toBe("REQUIRES_LATEST_READBACK");
    expect(statuses.get("replit-live-qa")).toBe("REQUIRES_REPLIT_LIVE_QA");
    expect(statuses.get("excluded-surfaces")).toBe("BLOCKED_BY_DESIGN");
    expect(getVerifiedIntroductionFounderDecisionBlockers().map((item) => item.id)).toEqual([
      "launch-posture",
      "source-eligibility",
      "legal-accounting-copy",
      "latest-chain-readback",
      "replit-live-qa",
      "excluded-surfaces",
    ]);
  });

  it("defines the next path only if founder approves preparation", () => {
    const packet = VERIFIED_INTRODUCTION_V1_FOUNDER_LAUNCH_DECISION_PACKET;
    const stop = packet.stopConditions.join("\n");
    const next = packet.nextIfApprovedForPreparation.join("\n");

    expect(stop).toContain("Stop if the founder decision is ambiguous.");
    expect(stop).toContain("public /join");
    expect(stop).toContain("ZERO_SOURCE_ID");
    expect(stop).toContain("latest-chain readback");
    expect(next).toContain("Freeze exact launch-candidate route posture");
    expect(next).toContain("Run latest-chain SourceRegistryV1 and MembershipSaleV3 readbacks");
    expect(next).toContain("Return for founder approval before any public controls");
  });
});
