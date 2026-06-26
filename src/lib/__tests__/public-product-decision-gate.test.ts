import { describe, expect, it } from "vitest";

import { FIRST_SOURCE_ATTRIBUTION_LIFECYCLE } from "../protocol-lifecycle";
import {
  SOURCE_ATTRIBUTION_PUBLIC_PRODUCT_DECISION_GATE,
  buildSourceAttributionPublicProductDecisionGate,
} from "../public-product-decision-gate";
import {
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
  buildSourcePolicySnapshot,
  type SourcePolicyRecord,
} from "../source-policy-observability";

describe("source attribution public-product decision gate", () => {
  it("treats the completed lifecycle as proof, not public product readiness", () => {
    const gate = SOURCE_ATTRIBUTION_PUBLIC_PRODUCT_DECISION_GATE;

    expect(gate.capabilityId).toBe("source-attribution-public-product-v1");
    expect(gate.proofLifecycleId).toBe(FIRST_SOURCE_ATTRIBUTION_LIFECYCLE.id);
    expect(gate.factLifecycleStage).toBe("public-product");
    expect(gate.decisionStatus).toBe("NOT_READY_FOR_PUBLIC_PRODUCT");
    expect(gate.publicProductReady).toBe(false);
    expect(gate.recommendedFrameworkId).toBe("verified-introduction-v1");
    expect(gate.recommendedFrameworkName).toBe("Verified Introduction");
    expect(gate.recommendedFrameworkStatus).toBe(
      "FRAMEWORK_DEFINED_PUBLIC_PRODUCT_NOT_APPROVED",
    );
    expect(gate.directionApproved).toBe(true);
    expect(gate.launchApproved).toBe(false);
    expect(gate.executionBridgeId).toBe("verified-introduction-v1-execution-bridge");
    expect(gate.defaultBuySourceId).toBe(ZERO_SOURCE_ID);
    expect(gate.currentReason).toContain("proven internally");
    expect(gate.currentReason).toContain("approved as direction only");
    expect(gate.currentReason).toContain("public source/referral product remains blocked");
  });

  it("satisfies proof and safe closure while requiring public product gates", () => {
    const statuses = new Map(
      SOURCE_ATTRIBUTION_PUBLIC_PRODUCT_DECISION_GATE.gates.map((gate) => [
        gate.id,
        gate.status,
      ]),
    );

    expect(statuses.get("internal-proof-recorded")).toBe("SATISFIED");
    expect(statuses.get("safe-closure-state")).toBe("SATISFIED");
    expect(statuses.get("public-scope-definition")).toBe("SATISFIED");
    expect(statuses.get("source-link-and-buyer-ux")).toBe("REQUIRED");
    expect(statuses.get("anti-abuse-eligibility")).toBe("REQUIRED");
    expect(statuses.get("legal-accounting-disclosure")).toBe("REQUIRED");
    expect(statuses.get("claim-and-escrow-policy")).toBe("BLOCKED_BY_DESIGN");
    expect(statuses.get("release-and-production-qa")).toBe("REQUIRED");
    expect(statuses.get("founder-public-product-approval")).toBe(
      "FOUNDER_APPROVAL_REQUIRED",
    );

    const blockers = SOURCE_ATTRIBUTION_PUBLIC_PRODUCT_DECISION_GATE.gates.filter(
      (gate) => gate.blocksPublicProduct,
    );
    expect(blockers.map((gate) => gate.id)).toEqual([
      "source-link-and-buyer-ux",
      "anti-abuse-eligibility",
      "legal-accounting-disclosure",
      "claim-and-escrow-policy",
      "release-and-production-qa",
      "founder-public-product-approval",
    ]);
  });

  it("fails the safe-closure gate if the source is active again", () => {
    const activeRecord: SourcePolicyRecord = {
      ...INTERNAL_PROTOCOL_TEST_SOURCE_001,
      status: "ACTIVE",
    };
    const activeSnapshot = buildSourcePolicySnapshot([activeRecord]);
    const gate = buildSourceAttributionPublicProductDecisionGate(activeSnapshot);

    const safeClosure = gate.gates.find((item) => item.id === "safe-closure-state");
    expect(safeClosure?.status).toBe("REQUIRED");
    expect(safeClosure?.blocksPublicProduct).toBe(true);
    expect(gate.publicProductReady).toBe(false);
  });

  it("preserves the forbidden public boundaries and safe next work", () => {
    const gate = SOURCE_ATTRIBUTION_PUBLIC_PRODUCT_DECISION_GATE;
    const copy = [
      gate.currentReason,
      gate.recommendedFrameworkId,
      gate.recommendedFrameworkName,
      gate.recommendedFrameworkStatus,
      gate.executionBridgeId,
      ...gate.gates.flatMap((item) => [item.label, item.proof, item.requirement]),
      ...gate.allowedNextWork,
      ...gate.forbiddenUntilApproved,
    ].join("\n");

    expect(copy).toContain("ZERO_SOURCE_ID");
    expect(copy).toContain("No public source link");
    expect(copy).toContain("Do not activate public referral");
    expect(copy).toContain("Do not add claim UI");
    expect(copy).toContain("Do not route public/default buys through a non-zero sourceId");
    expect(copy).toContain("verified-introduction-v1");
    expect(copy).toContain("verified-introduction-v1-execution-bridge");
    expect(copy).toContain("FRAMEWORK_DEFINED_PUBLIC_PRODUCT_NOT_APPROVED");
    expect(copy).toContain("noindex Verified Introduction internal surface");
    expect(copy).toContain("launch packet draft");
    expect(copy).toContain("anti-abuse/source eligibility model");
    expect(copy).toContain("docs/VERIFIED_INTRODUCTION_V1_EXECUTION_BRIDGE.md");
    expect(copy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(copy).not.toMatch(/top earner|guaranteed return|yield opportunity/i);
  });
});
