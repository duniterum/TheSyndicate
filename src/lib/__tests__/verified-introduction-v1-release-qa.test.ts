import { describe, expect, it } from "vitest";

import {
  VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET,
  getVerifiedIntroductionReleaseQaBlockers,
  isVerifiedIntroductionReleaseQaApproved,
} from "../verified-introduction-v1-release-qa";
import {
  AVALANCHE_CHAIN_ID,
  MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS,
  SOURCE_REGISTRY_V1_CONTRACT_ADDRESS,
} from "../syndicate-config";
import {
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
} from "../source-policy-observability";

describe("Verified Introduction V1 release QA packet", () => {
  it("keeps release QA as a draft packet with no launch authority", () => {
    const packet = VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET;

    expect(packet.id).toBe("verified-introduction-v1-release-qa-packet");
    expect(packet.productId).toBe("verified-introduction-v1");
    expect(packet.status).toBe("DRAFT_RELEASE_QA_NOT_APPROVED");
    expect(packet.launchApproved).toBe(false);
    expect(packet.publicControlsApproved).toBe(false);
    expect(packet.blockTag).toBe("latest");
    expect(packet.chainId).toBe(AVALANCHE_CHAIN_ID);
    expect(packet.sourceRegistryAddress).toBe(SOURCE_REGISTRY_V1_CONTRACT_ADDRESS);
    expect(packet.membershipSaleAddress).toBe(MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS);
    expect(packet.sourceId).toBe(INTERNAL_PROTOCOL_TEST_SOURCE_001.sourceId);
    expect(packet.publicJoinDefaultSourceId).toBe(ZERO_SOURCE_ID);
    expect(isVerifiedIntroductionReleaseQaApproved()).toBe(false);
  });

  it("requires latest-chain reads instead of historical anchors", () => {
    const reads = VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.latestChainReads;
    const copy = reads
      .flatMap((read) => [
        read.id,
        read.label,
        read.contractOrSurface,
        read.read,
        read.expected,
        read.stopCondition,
      ])
      .join("\n");

    expect(reads.map((read) => read.id)).toEqual([
      "chain-id",
      "source-registry-bytecode",
      "source-registry-owner",
      "source-record-current-status",
      "membership-sale-bytecode",
      "membership-sale-source-wiring",
    ]);
    expect(copy).toContain("eth_chainId at latest");
    expect(copy).toContain("sourceConfig(sourceId)");
    expect(copy).toContain("isActive(sourceId)");
    expect(copy).toContain("public/default buys still use ZERO_SOURCE_ID");
    expect(copy).toContain("Stop if a historical readback");
  });

  it("keeps Replit and live QA gates separate from founder launch approval", () => {
    const statuses = new Map(
      VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.releaseGates.map((gate) => [
        gate.id,
        gate.status,
      ]),
    );

    expect(statuses.get("github-release-gate")).toBe("SATISFIED_FOR_REVIEW");
    expect(statuses.get("latest-chain-readback")).toBe("PENDING_LATEST_READBACK");
    expect(statuses.get("replit-sync-publish-gate")).toBe("PENDING_REPLIT_QA");
    expect(statuses.get("live-no-leakage-gate")).toBe("PENDING_REPLIT_QA");
    expect(statuses.get("founder-final-approval")).toBe("PENDING_FOUNDER_APPROVAL");
    expect(statuses.get("excluded-public-surfaces")).toBe("BLOCKED_BY_DESIGN");

    expect(getVerifiedIntroductionReleaseQaBlockers().map((gate) => gate.id)).toEqual([
      "latest-chain-readback",
      "replit-sync-publish-gate",
      "live-no-leakage-gate",
      "founder-final-approval",
      "excluded-public-surfaces",
    ]);
  });

  it("defines live QA without creating public source controls", () => {
    const qa = VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.liveQaChecks;
    const stopConditions = VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.stopConditions.join("\n");
    const copy = qa
      .flatMap((check) => [
        check.id,
        check.routeOrSurface,
        check.mustConfirm,
        check.mustNotExpose,
      ])
      .join("\n");

    expect(copy).toContain("/join");
    expect(copy).toContain("ZERO_SOURCE_ID");
    expect(copy).toContain("/referral");
    expect(copy).toContain("/labs/verified-introduction-review");
    expect(copy).toContain("noindex");
    expect(copy).toContain("absent from sitemap/nav");
    expect(copy).toContain("buttons, forms, selectors, links, or wallet actions");
    expect(stopConditions).toContain("public/default /join");
    expect(stopConditions).toContain("claim UI, source dashboard, alias route, source link");
    expect(copy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
  });
});
