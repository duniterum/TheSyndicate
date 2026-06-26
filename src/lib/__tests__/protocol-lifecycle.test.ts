import { describe, expect, it } from "vitest";

import {
  FIRST_SOURCE_ATTRIBUTION_LIFECYCLE,
  getCompletedProtocolLifecycleCount,
  getProtocolLifecycleById,
  getProtocolLifecycleStageCounts,
} from "../protocol-lifecycle";
import { ZERO_SOURCE_ID } from "../source-policy-observability";
import { REAL_CONDITION_SOURCE_TEST_COMPLETION } from "../source-real-condition-test";

describe("protocol lifecycle proof model", () => {
  it("records the first completed lifecycle as internal proof, not public referral", () => {
    const lifecycle = FIRST_SOURCE_ATTRIBUTION_LIFECYCLE;

    expect(lifecycle.id).toBe("source-attribution-real-condition-001");
    expect(lifecycle.status).toBe("PROVEN_INTERNAL");
    expect(lifecycle.capability).toBe("Source Attribution");
    expect(lifecycle.finalSourceStatus).toBe("PAUSED");
    expect(lifecycle.defaultPublicSourceId).toBe(ZERO_SOURCE_ID);
    expect(lifecycle.latestAuthorityReadbackBlock).toBe(88808111);
    expect(lifecycle.currentSafeState).toContain("isActive is false");
    expect(lifecycle.boundaryFacts.join("\n")).toContain("public referral activation");
    expect(lifecycle.boundaryFacts.join("\n")).toContain("No claim UI");
    expect(lifecycle.boundaryFacts.join("\n")).toContain("public source-aware buy path");
  });

  it("tracks packet, terms update, active window, buy, re-pause, and future product decision separately", () => {
    const lifecycle = FIRST_SOURCE_ATTRIBUTION_LIFECYCLE;
    const counts = getProtocolLifecycleStageCounts(lifecycle);

    expect(counts.COMPLETE).toBe(4);
    expect(counts.SAFE_STATE).toBe(1);
    expect(counts.FUTURE_DECISION).toBe(1);

    expect(lifecycle.stages.map((stage) => stage.label)).toEqual([
      "Terms packet frozen",
      "Terms updated",
      "Source activated for the test",
      "Controlled $5 source-attributed buy",
      "Source re-paused and closed",
      "Public referral product",
    ]);
    expect(lifecycle.stages[1].txHash).toBe(
      REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.termsUpdated.hash,
    );
    expect(lifecycle.stages[3].txHash).toBe(
      "0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46",
    );
    expect(lifecycle.stages[4].txHash).toBe(
      "0x67f6498cd734b27032f0a10fe55bad57079f5b9cf38b38a85a1f95895aece71f",
    );
  });

  it("keeps lifecycle lookup and completed counts deterministic", () => {
    expect(getCompletedProtocolLifecycleCount()).toBe(1);
    expect(getProtocolLifecycleById("source-attribution-real-condition-001")).toBe(
      FIRST_SOURCE_ATTRIBUTION_LIFECYCLE,
    );
    expect(getProtocolLifecycleById("missing")).toBeNull();
  });

  it("contains no fake-live referral, claim, dashboard, or financial language", () => {
    const text = JSON.stringify(FIRST_SOURCE_ATTRIBUTION_LIFECYCLE);

    expect(text).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(text).not.toMatch(/passive income|downline|upline|\bROI\b|top earner|leaderboard/i);
    expect(text).not.toMatch(/governance rights|equity/i);
  });
});
