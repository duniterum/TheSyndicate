import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import {
  PROTOCOL_HEALTH_REGISTRY,
  aggregateHealth,
} from "../protocol-health-registry";

const REQUIRED_MODULES = [
  "core-site", "syn-token", "membership-sale", "wallet-payment",
  "nft-archive", "registry", "my-syndicate", "activity-indexer",
  "vault-transparency", "liquidity", "docs", "explorer-links",
  "deferred-ledger", "execution-gates", "protocol-chronicle", "seat-record-721",
];

describe("protocol-health-registry", () => {
  it("registry exists and is non-empty", () => {
    expect(PROTOCOL_HEALTH_REGISTRY.length).toBeGreaterThanOrEqual(REQUIRED_MODULES.length);
  });

  it.each(REQUIRED_MODULES)("module %s has an entry", (id) => {
    expect(PROTOCOL_HEALTH_REGISTRY.find((m) => m.moduleId === id)).toBeTruthy();
  });

  it("no module has a BLOCKER (current state)", () => {
    const agg = aggregateHealth();
    expect(agg.blockers).toBe(0);
  });

  it("NFT module reflects ID 3 live and ID 9 deferred", () => {
    const nft = PROTOCOL_HEALTH_REGISTRY.find((m) => m.moduleId === "nft-archive")!;
    expect(nft.contracts).toContain("ARCHIVE_1155");
    expect(nft.deferred.some((d) => /ID 9/i.test(d))).toBe(true);
    expect(nft.health).not.toBe("BLOCKER");
  });

  it("Protocol Chronicle remains ROADMAP and SeatRecord721 remains ROADMAP", () => {
    const chron = PROTOCOL_HEALTH_REGISTRY.find((m) => m.moduleId === "protocol-chronicle")!;
    const seat = PROTOCOL_HEALTH_REGISTRY.find((m) => m.moduleId === "seat-record-721")!;
    expect(chron.status).toBe("ROADMAP");
    expect(seat.status).toBe("ROADMAP");
  });

  it("deferred-only modules do not count as BLOCKER", () => {
    for (const m of PROTOCOL_HEALTH_REGISTRY) {
      if (m.deferred.length > 0 && m.findings.every((f) => f.level !== "BLOCKER")) {
        expect(m.health).not.toBe("BLOCKER");
      }
    }
  });
});

describe("check-protocol-health.mjs script", () => {
  it("exits 0 with WARN-only state", () => {
    const r = spawnSync("node", ["scripts/check-protocol-health.mjs"], { encoding: "utf8" });
    expect(r.status).toBe(0);
  }, 15000);

  it("exits non-zero with synthetic BLOCKER", () => {
    const r = spawnSync("node", ["scripts/check-protocol-health.mjs", "--inject-blocker"], { encoding: "utf8" });
    expect(r.status).not.toBe(0);
  }, 15000);
});
