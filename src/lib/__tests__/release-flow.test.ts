// Guards that the release flow includes the production release checks and that
// gate severity maps to the correct exit code.
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("release flow wiring", () => {
  it("package.json exposes check-release + check-execution-gates + prepublishOnly", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.scripts["check-execution-gates"]).toContain("check-execution-gates.mjs");
    expect(pkg.scripts["check-release"]).toContain("check-release.mjs");
    expect(pkg.scripts.prepublishOnly).toContain("check-release.mjs");
    expect(pkg.scripts.typecheck).toContain("tsc --noEmit");
  });

  it("check-release.mjs invokes the canonical release steps", () => {
    expect(existsSync(join(process.cwd(), "scripts/check-release.mjs"))).toBe(true);
    const src = read("scripts/check-release.mjs");
    expect(src).toContain('"typecheck"');
    expect(src).toContain('"tests"');
    expect(src).toContain('"build"');
    expect(src).toContain("check-execution-gates.mjs");
    expect(src).toContain("check-explorer-urls.mjs");
    expect(src).toContain("check-explorer-canonical.mjs");
    expect(src).toContain("check-protocol-health.mjs");
    expect(src).toContain("check-visitor-vocabulary.mjs");
    expect(src).toContain("check-live-state-truth.mjs");
  });
});

describe("gate runner severity to exit code", () => {
  it("PASS / WARN / DEFERRED do not fail the runner (exit 0)", () => {
    // Canonical sources currently produce zero findings, so this should PASS.
    const out = execSync("node scripts/check-execution-gates.mjs", { encoding: "utf8" });
    expect(out).toMatch(/PASS=1/);
    expect(out).toMatch(/BLOCKER=0/);
  });

  it("BLOCKER fails the runner (exit nonzero) via synthetic injection", () => {
    let failed = false;
    let stdout = "";
    try {
      execSync("node scripts/check-execution-gates.mjs", {
        encoding: "utf8",
        env: { ...process.env, GATE_RUNNER_SYNTHETIC: "1" },
      });
    } catch (e: any) {
      failed = true;
      stdout = String(e.stdout || "");
    }
    expect(failed).toBe(true);
    expect(stdout).toMatch(/BLOCKER=1|BLOCKER/);
    expect(stdout).toMatch(/FAIL/);
  });

  it("writes reports/execution-gates.latest.json", () => {
    execSync("node scripts/check-execution-gates.mjs", { encoding: "utf8" });
    const report = JSON.parse(read("reports/execution-gates.latest.json"));
    expect(report.status).toBe("PASS");
    expect(report.counts).toHaveProperty("BLOCKER");
    expect(report.counts).toHaveProperty("WARN");
    expect(report.counts).toHaveProperty("DEFERRED");
    expect(typeof report.timestamp).toBe("string");
  });
});
