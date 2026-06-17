import { describe, it, expect } from "vitest";
import {
  ENGINES,
  validateEngineStatuses,
} from "@/components/syndicate/ProtocolEnginesPanel";
import { PROTOCOL_STATUS } from "@/lib/syndicate-config";

// The homepage "Protocol Engines" panel authors a founder-curated list of
// engines with LIVE / PREVIEW / FUTURE labels. The canonical contract status
// lives in PROTOCOL_STATUS (src/lib/syndicate-config.ts). These two can drift —
// this guard makes a drift a hard failure rather than a silent contradiction.
describe("Protocol Engines ↔ PROTOCOL_STATUS sync", () => {
  it("has no status violations as authored", () => {
    expect(validateEngineStatuses()).toEqual([]);
  });

  it("every engine `backing` references a real PROTOCOL_STATUS key", () => {
    const keys = new Set(PROTOCOL_STATUS.map((p) => p.key));
    for (const e of ENGINES) {
      if (e.backing) expect(keys.has(e.backing)).toBe(true);
    }
  });

  it("no LIVE engine is backed by a pending registry item", () => {
    for (const e of ENGINES) {
      if (e.status !== "LIVE" || !e.backing) continue;
      const item = PROTOCOL_STATUS.find((p) => p.key === e.backing);
      expect(item?.status).toBe("live");
    }
  });

  it("flags a LIVE engine when its backing flips to pending", () => {
    // Synthetic drift: the Vault engine intentionally backs the live "sale".
    // Re-point it at the pending "vault" contract and the guard must catch it.
    const drifted = ENGINES.map((e) =>
      e.key === "vault" ? { ...e, backing: "vault" } : e,
    );
    const violations = validateEngineStatuses(drifted);
    expect(violations).toContainEqual({
      engine: "vault",
      backing: "vault",
      reason: "live-but-backing-pending",
    });
  });

  it("flags an engine whose backing key does not exist", () => {
    const drifted = ENGINES.map((e) =>
      e.key === "sale" ? { ...e, backing: "does-not-exist" } : e,
    );
    const violations = validateEngineStatuses(drifted);
    expect(violations).toContainEqual({
      engine: "sale",
      backing: "does-not-exist",
      reason: "unknown-backing",
    });
  });
});
