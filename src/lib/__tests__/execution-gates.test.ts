// Guards for the Protocol Execution Control System.
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import {
  SEVERITY,
  OUTCOME,
  RELEASE_GATES,
  ACTIVATION_GATES,
  ABI_REGISTRY,
  INVARIANTS,
  classify,
} from "../execution-gates";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("execution-gates module", () => {
  it("exports the canonical severity vocabulary", () => {
    expect(Object.keys(SEVERITY).sort()).toEqual(["BLOCKER", "HIGH", "LOW", "MEDIUM"]);
  });
  it("exports the canonical decision outcomes", () => {
    expect(Object.keys(OUTCOME).sort()).toEqual([
      "ASK_FOUNDER", "DEFER", "DO_NOT_DO", "EXECUTE_NOW", "REQUIRES_ONCHAIN_ACTION",
    ]);
  });
  it("declares all 13 release gates and the 6 write-path invariants", () => {
    expect(RELEASE_GATES.length).toBeGreaterThanOrEqual(13);
    expect(INVARIANTS.length).toBe(6);
    expect(INVARIANTS).toContain("mint-hash-persistence");
  });
  it("every activation candidate declares freeze + signature + founder + invariants", () => {
    for (const g of ACTIVATION_GATES) {
      expect(typeof g.requiresFreeze).toBe("boolean");
      expect(typeof g.requiresOwnerSignature).toBe("boolean");
      expect(typeof g.requiresFounderApproval).toBe("boolean");
      expect(g.invariants.length).toBe(6);
    }
  });
  it("SeatRecord721 ABI entry is null (no fake ABI)", () => {
    expect(ABI_REGISTRY.SEAT_RECORD_721.abiModule).toBeNull();
    expect(ABI_REGISTRY.SEAT_RECORD_721.export).toBeNull();
  });
  it("classify maps severity to gate result", () => {
    expect(classify({ severity: SEVERITY.BLOCKER })).toBe("BLOCKER");
    expect(classify({ severity: SEVERITY.HIGH })).toBe("WARN");
    expect(classify({ severity: SEVERITY.MEDIUM })).toBe("DEFERRED");
    expect(classify({ severity: SEVERITY.LOW })).toBe("DEFERRED");
  });
});

describe("execution control system docs", () => {
  it("PROTOCOL_EXECUTION_CONTROL_SYSTEM.md declares all four severities and five outcomes", () => {
    const src = read("docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md");
    for (const s of ["BLOCKER", "HIGH", "MEDIUM", "LOW"]) expect(src).toContain(s);
    for (const o of ["EXECUTE_NOW", "DEFER", "ASK_FOUNDER", "REQUIRES_ONCHAIN_ACTION", "DO_NOT_DO"]) {
      expect(src).toContain(o);
    }
  });
  it("DEFERRED_WORK_LEDGER.md exists and contains required deferred items", () => {
    const src = read("docs/DEFERRED_WORK_LEDGER.md");
    for (const item of [
      "Refactor ID 1",
      "Ownership proof card",
      "Public NFT polling",
      "Explorer fallback",
      "Dashboard LIVE / INDEXED / LOCAL",
      "Full `useWalletSession` migration",
      "Non-write explorer link consolidation",
      "Build-output HTML doctrine scanner",
      "Playwright",
      "CI convenience script",
      "MetaMask explorer helper",
      "ID 9 Protocol Chronicle",
      "SeatRecord721 Solidity",
      "adminMint",
    ]) expect(src).toContain(item);
  });
  it("activation runbook lists freeze before activate", () => {
    const src = read("docs/ACTIVATION_RUNBOOK.md");
    const freezeIdx = src.indexOf("freezeArtifactDefinition");
    const activateIdx = src.indexOf("setDropActive(id, true)");
    expect(freezeIdx).toBeGreaterThan(-1);
    expect(activateIdx).toBeGreaterThan(freezeIdx);
  });
});

describe("contract registry — no fake SeatRecord721", () => {
  it("SeatRecord721 stays PENDING with null address", () => {
    const src = read("src/lib/contract-registry.ts");
    const block = src.match(/"SEAT_RECORD_721"[\s\S]*?\),/)?.[0];
    expect(block).toBeDefined();
    expect(block!).toContain('"PENDING"');
    expect(block!).toMatch(/,\s*null,/);
  });
});

describe("archive registry — Patron Seal stays live", () => {
  it("ID 3 LIVE_PUBLIC_MINT at 5 USDC", () => {
    const src = read("src/lib/archive-id-registry.ts");
    const block = src.match(/id:\s*3,[\s\S]*?\},/)?.[0];
    expect(block).toBeDefined();
    expect(block!).toContain('"LIVE_PUBLIC_MINT"');
    expect(block!).toMatch(/priceUsdc:\s*5\b/);
    expect(block!).toContain("publicMintAllowed: true");
  });
});

describe("gate runner script", () => {
  it("passes on the current canonical sources", () => {
    expect(existsSync(join(process.cwd(), "scripts/check-execution-gates.mjs"))).toBe(true);
    const out = execSync("node scripts/check-execution-gates.mjs", { encoding: "utf8" });
    expect(out).toMatch(/PASS/);
  });
  it("fails when a synthetic BLOCKER is injected", () => {
    let failed = false;
    try {
      execSync("node scripts/check-execution-gates.mjs", {
        encoding: "utf8",
        env: { ...process.env, GATE_RUNNER_SYNTHETIC: "1" },
      });
    } catch (e: any) {
      failed = true;
      expect(String(e.stdout || "")).toMatch(/BLOCKER/);
    }
    expect(failed).toBe(true);
  });
});
