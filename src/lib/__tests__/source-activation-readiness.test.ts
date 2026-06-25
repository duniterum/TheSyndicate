import { describe, expect, it } from "vitest";

import {
  CURRENT_SOURCE_ACTIVATION_READINESS,
  buildSourceActivationReadiness,
  evaluateSourceTermWindow,
} from "../source-activation-readiness";
import {
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
  buildSourcePolicySnapshot,
  type SourcePolicyRecord,
} from "../source-policy-observability";

describe("source activation readiness", () => {
  it("keeps the current internal source not ready for ACTIVE ceremony", () => {
    expect(CURRENT_SOURCE_ACTIVATION_READINESS.targetSourceId).toBe(
      "0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620",
    );
    expect(CURRENT_SOURCE_ACTIVATION_READINESS.targetStatus).toBe("PAUSED");
    expect(CURRENT_SOURCE_ACTIVATION_READINESS.targetClass).toBe("BUILDER_SOURCE");
    expect(CURRENT_SOURCE_ACTIVATION_READINESS.defaultBuySourceId).toBe(ZERO_SOURCE_ID);
    expect(CURRENT_SOURCE_ACTIVATION_READINESS.readyForActiveCeremony).toBe(false);
    expect(CURRENT_SOURCE_ACTIVATION_READINESS.readyForPublicReferral).toBe(false);
    expect(CURRENT_SOURCE_ACTIVATION_READINESS.readyForClaimUi).toBe(false);
    expect(CURRENT_SOURCE_ACTIVATION_READINESS.readyForPublicSourceAwareBuyPath).toBe(false);
  });

  it("lists the exact blockers before any future ACTIVE ceremony", () => {
    const statusesById = new Map(
      CURRENT_SOURCE_ACTIVATION_READINESS.gates.map((gate) => [gate.id, gate.status]),
    );

    expect(statusesById.get("source-policy-record")).toBe("SATISFIED");
    expect(statusesById.get("no-active-source-today")).toBe("SATISFIED");
    expect(statusesById.get("current-authority-preflight")).toBe("READBACK_REQUIRED");
    expect(statusesById.get("terms-window-review")).toBe("READBACK_REQUIRED");
    expect(statusesById.get("internal-source-aware-test-path")).toBe("SATISFIED");
    expect(statusesById.get("clear-source-ux")).toBe("SATISFIED");
    expect(statusesById.get("founder-active-approval")).toBe("FOUNDER_APPROVAL_REQUIRED");
    expect(statusesById.get("legal-product-signoff")).toBe("FOUNDER_APPROVAL_REQUIRED");
    expect(statusesById.get("public-zero-source-boundary")).toBe("SATISFIED");
    expect(statusesById.get("no-public-referral-or-claim-ui")).toBe("BLOCKED_BY_DESIGN");

    const copy = [
      ...CURRENT_SOURCE_ACTIVATION_READINESS.gates.flatMap((gate) => [
        gate.label,
        gate.proof,
        gate.requirement,
      ]),
      ...CURRENT_SOURCE_ACTIVATION_READINESS.requiredNextActions,
      ...CURRENT_SOURCE_ACTIVATION_READINESS.forbiddenActions,
    ].join("\n");

    expect(copy).toContain("ZERO_SOURCE_ID");
    expect(copy).toContain("setSourceStatus(sourceId, ACTIVE)");
    expect(copy).toContain("Internal source-aware test path");
    expect(copy).toContain("production-internal mode");
    expect(copy).toContain("allowlisted fresh buyer wallet");
    expect(copy).toContain("Do not add claim UI");
    expect(copy).toContain("no yield/passive-income/ROI framing");
    expect(copy).toContain("no MLM/downline framing");
    expect(copy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(copy).not.toMatch(/top earner|leaderboard|guaranteed return|yield opportunity/i);
  });

  it("evaluates the approved activation-test window without relying on wall-clock time", () => {
    expect(evaluateSourceTermWindow(INTERNAL_PROTOCOL_TEST_SOURCE_001, 1782800000)).toBe("NOT_STARTED");
    expect(evaluateSourceTermWindow(INTERNAL_PROTOCOL_TEST_SOURCE_001, 1783000000)).toBe("OPEN");
    expect(evaluateSourceTermWindow(INTERNAL_PROTOCOL_TEST_SOURCE_001, 1784200000)).toBe("EXPIRED");
    expect(evaluateSourceTermWindow({}, 1783000000)).toBe("MISSING");
  });

  it("fails readiness if the target record is missing or no longer PAUSED", () => {
    const missingSnapshot = buildSourcePolicySnapshot([]);
    const missing = buildSourceActivationReadiness(missingSnapshot, INTERNAL_PROTOCOL_TEST_SOURCE_001);
    expect(missing.readyForActiveCeremony).toBe(false);
    expect(missing.gates.find((gate) => gate.id === "source-policy-record")?.status).toBe(
      "READBACK_REQUIRED",
    );

    const activeRecord: SourcePolicyRecord = {
      ...INTERNAL_PROTOCOL_TEST_SOURCE_001,
      status: "ACTIVE",
    };
    const activeSnapshot = buildSourcePolicySnapshot([activeRecord]);
    const active = buildSourceActivationReadiness(activeSnapshot, activeRecord);
    expect(active.readyForActiveCeremony).toBe(false);
    expect(active.gates.find((gate) => gate.id === "source-policy-record")?.status).toBe(
      "READBACK_REQUIRED",
    );
  });
});
