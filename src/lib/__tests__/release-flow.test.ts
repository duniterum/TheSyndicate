// Guards that the release flow includes the execution gate runner and that
// gate severity → exit-code mapping is correct.
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
  });

  it("check-release.mjs invokes the execution gate runner", () => {
    expect(existsSync(join(process.cwd(), "scripts/check-release.mjs"))).toBe(true);
    const src = read("scripts/check-release.mjs");
    expect(src).toContain("check-execution-gates.mjs");
    expect(src).toContain("tsc");
    expect(src).toContain("vitest");
  });
});

describe("gate runner severity → exit code", () => {
  it("PASS / WARN / DEFERRED do not fail the runner (exit 0)", () => {
    // Canonical sources currently produce zero findings → PASS.
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
