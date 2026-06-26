import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { ZERO_SOURCE_ID } from "../source-policy-observability";
import {
  buildVerifiedIntroductionBuyerPreview,
  formatUsdcUnits,
  getVerifiedIntroductionBuyerScenario,
  VERIFIED_INTRODUCTION_BUYER_SCENARIOS,
  VERIFIED_INTRODUCTION_BUYER_SKELETON_BOUNDARY,
  type VerifiedIntroductionBuyerScenarioId,
} from "../verified-introduction-v1-buyer-experience";

const repoRoot = process.cwd();

const REQUIRED_SCENARIOS: readonly VerifiedIntroductionBuyerScenarioId[] = [
  "NO_SOURCE_PRESENT",
  "SOURCE_PRESENT_NOT_APPROVED",
  "SOURCE_PAUSED",
  "SOURCE_REVOKED",
  "SOURCE_EXPIRED",
  "SOURCE_NOT_YET_ACTIVE",
  "CAP_EXCEEDED",
  "BUYER_ALREADY_SEATED",
  "BUYER_HISTORICAL",
  "BUYER_EQUALS_SOURCE_WALLET",
  "WRONG_CHAIN",
  "STALE_READBACK",
  "ACTIVE_TERMS_MATCH",
  "BUYER_CLEARED_SOURCE",
  "APPROVAL_NEEDED",
  "APPROVAL_COMPLETE_BUY_PENDING",
  "BUY_SUBMITTED_WAIT_READBACK",
];

const FAIL_CLOSED_SCENARIOS: readonly VerifiedIntroductionBuyerScenarioId[] = [
  "NO_SOURCE_PRESENT",
  "SOURCE_PRESENT_NOT_APPROVED",
  "SOURCE_PAUSED",
  "SOURCE_REVOKED",
  "SOURCE_EXPIRED",
  "SOURCE_NOT_YET_ACTIVE",
  "CAP_EXCEEDED",
  "BUYER_ALREADY_SEATED",
  "BUYER_HISTORICAL",
  "BUYER_EQUALS_SOURCE_WALLET",
  "WRONG_CHAIN",
  "STALE_READBACK",
  "BUYER_CLEARED_SOURCE",
];

function flattenStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((item) => flattenStrings(item));
  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => flattenStrings(item));
  }
  return [];
}

describe("Verified Introduction V1 buyer experience skeleton", () => {
  it("covers every required buyer state before implementation can proceed", () => {
    const scenarioIds = new Set(VERIFIED_INTRODUCTION_BUYER_SCENARIOS.map((scenario) => scenario.id));

    expect(VERIFIED_INTRODUCTION_BUYER_SCENARIOS).toHaveLength(REQUIRED_SCENARIOS.length);
    for (const requiredScenario of REQUIRED_SCENARIOS) {
      expect(scenarioIds.has(requiredScenario)).toBe(true);
    }
  });

  it("falls back to ZERO_SOURCE_ID for absent, blocked, and cleared-source states", () => {
    for (const scenarioId of FAIL_CLOSED_SCENARIOS) {
      const scenario = getVerifiedIntroductionBuyerScenario(scenarioId);

      expect(scenario.sourceIdForPurchase).toBe(ZERO_SOURCE_ID);
      expect(scenario.usesZeroSourceFallback).toBe(true);
      expect(scenario.previewAllowed).toBe(false);
      expect(scenario.sourceAwareQuoteAllowed).toBe(false);
      expect(scenario.signatureAllowedNow).toBe(false);
    }
  });

  it("allows a preview only when source truth and buyer readiness are still explicitly bounded", () => {
    const scenario = getVerifiedIntroductionBuyerScenario("ACTIVE_TERMS_MATCH");

    expect(scenario.previewAllowed).toBe(true);
    expect(scenario.sourceAwareQuoteAllowed).toBe(true);
    expect(scenario.signatureAllowedNow).toBe(false);
    expect(scenario.sourceIdForPurchase).toBe("APPROVED_SOURCE_ID_ONLY_AFTER_LAUNCH_PACKET");
    expect(scenario.preview.disclosure.nonLaunchBoundary).toContain("not referral activation");
    expect(scenario.preview.disclosure.membershipUnchanged).toContain("price");
    expect(scenario.preview.disclosure.zeroSourceDefault).toContain("ZERO_SOURCE_ID");
  });

  it("keeps approval separate from purchase completion", () => {
    const approvalNeeded = getVerifiedIntroductionBuyerScenario("APPROVAL_NEEDED");
    const approvalComplete = getVerifiedIntroductionBuyerScenario("APPROVAL_COMPLETE_BUY_PENDING");

    expect(approvalNeeded.approvalOnly).toBe(true);
    expect(approvalNeeded.buySubmitted).toBe(false);
    expect(approvalNeeded.signatureAllowedNow).toBe(false);
    expect(approvalNeeded.requiredReadback).toContain("no MembershipPurchased event");

    expect(approvalComplete.approvalOnly).toBe(false);
    expect(approvalComplete.buySubmitted).toBe(false);
    expect(approvalComplete.stopCondition).toContain("Do not label approval as a completed buy");
  });

  it("stops after buy submission and waits for readback", () => {
    const scenario = getVerifiedIntroductionBuyerScenario("BUY_SUBMITTED_WAIT_READBACK");

    expect(scenario.buySubmitted).toBe(true);
    expect(scenario.previewAllowed).toBe(false);
    expect(scenario.sourceAwareQuoteAllowed).toBe(false);
    expect(scenario.signatureAllowedNow).toBe(false);
    expect(scenario.nextAction).toContain("Read back MembershipPurchasedV3");
    expect(scenario.stopCondition).toContain("Do not retry");
  });

  it("calculates acquisition commission and net USDC Routed from the preview values", () => {
    const preview = buildVerifiedIntroductionBuyerPreview();

    expect(formatUsdcUnits(5_000_000n)).toBe("5.00 USDC");
    expect(preview.quote.grossUsdc).toBe("5.00 USDC");
    expect(preview.quote.commissionBps).toBe(500);
    expect(preview.quote.acquisitionCommissionUsdc).toBe("0.25 USDC");
    expect(preview.quote.netUsdcRouted).toBe("4.75 USDC");
  });

  it("does not use forbidden public-referral or financial-promise framing", () => {
    const allText = flattenStrings(VERIFIED_INTRODUCTION_BUYER_SCENARIOS).join("\n").toLowerCase();

    expect(allText).not.toMatch(/\bupline\b|\bdownline\b|\bmlm\b/);
    expect(allText).not.toMatch(/passive income|guaranteed return|\broi\b|\byield\b/);
    expect(allText).not.toContain("referral launch");
    expect(allText).not.toContain("public referral link is live");
  });

  it("is not mounted into public join and does not create public route surfaces", () => {
    const componentSource = readFileSync(
      join(repoRoot, "src/components/syndicate/VerifiedIntroductionBuyerExperience.tsx"),
      "utf8",
    );
    const joinRouteSource = readFileSync(join(repoRoot, "src/routes/join.tsx"), "utf8");
    const routeFiles = readdirSync(join(repoRoot, "src/routes"));

    expect(VERIFIED_INTRODUCTION_BUYER_SKELETON_BOUNDARY.mountedInPublicJoin).toBe(false);
    expect(VERIFIED_INTRODUCTION_BUYER_SKELETON_BOUNDARY.publicSourceAwareBuyPath).toBe(false);
    expect(VERIFIED_INTRODUCTION_BUYER_SKELETON_BOUNDARY.defaultSourceId).toBe(ZERO_SOURCE_ID);

    expect(componentSource).not.toMatch(/useWriteContract|writeContract|sendTransaction|buyWithSource|claimReward/);
    expect(componentSource).not.toContain("<button");
    expect(componentSource).not.toContain("href=");
    expect(joinRouteSource).not.toContain("VerifiedIntroductionBuyerExperience");
    expect(joinRouteSource).not.toContain("verified-introduction-v1-buyer-experience");
    expect(routeFiles.some((file) => file.toLowerCase().includes("alias"))).toBe(false);
    expect(existsSync(join(repoRoot, "src/routes/verified-introduction.tsx"))).toBe(false);
  });
});
