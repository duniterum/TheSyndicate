#!/usr/bin/env node
// Pre-release verification orchestrator.
// Runs the canonical checks that must pass before publishing.
// Fails on the first blocking step after reporting the full summary.
//
// Steps, in order:
//   1. typecheck
//   2. tests
//   3. production build
//   4. execution gates
//   5. explorer URL/canonical guards
//   6. protocol-health and visitor truth guards
//
// Authority: docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const releaseEnv = { ...process.env };
if (!/\b--use-system-ca\b/.test(releaseEnv.NODE_OPTIONS || "")) {
  releaseEnv.NODE_OPTIONS = [releaseEnv.NODE_OPTIONS, "--use-system-ca"].filter(Boolean).join(" ");
}

const runCommand = (cmd, args) =>
  spawnSync(cmd, args, {
    stdio: "inherit",
    env: releaseEnv,
    shell: process.platform === "win32",
  });

const runBuild = () => {
  if (process.platform !== "win32") return runCommand(npmCmd, ["run", "build"]);

  const drive = ["X", "Y", "Z", "W", "V"].find((letter) => !existsSync(`${letter}:\\`));
  if (!drive) return runCommand(npmCmd, ["run", "build"]);
  const substExe = `${process.env.SystemRoot || "C:\\Windows"}\\System32\\subst.exe`;

  const mount = spawnSync(substExe, [`${drive}:`, process.cwd()], {
    stdio: "inherit",
    env: releaseEnv,
  });
  if (mount.status !== 0) return mount;

  try {
    return spawnSync(npmCmd, ["run", "build"], {
      cwd: `${drive}:\\`,
      stdio: "inherit",
      env: releaseEnv,
      shell: true,
    });
  } finally {
    spawnSync(substExe, [`${drive}:`, "/D"], { stdio: "inherit", env: releaseEnv });
  }
};

const steps = [
  { name: "typecheck", cmd: npmCmd, args: ["run", "typecheck"] },
  { name: "tests", cmd: npmCmd, args: ["test"] },
  { name: "build", run: runBuild },
  { name: "execution-gates", cmd: "node", args: ["scripts/check-execution-gates.mjs"] },
  { name: "explorer-urls", cmd: "node", args: ["scripts/check-explorer-urls.mjs"] },
  { name: "explorer-canonical", cmd: "node", args: ["scripts/check-explorer-canonical.mjs"] },
  { name: "protocol-health", cmd: "node", args: ["scripts/check-protocol-health.mjs"] },
  { name: "visitor-vocabulary", cmd: "node", args: ["scripts/check-visitor-vocabulary.mjs"] },
  { name: "live-state-truth", cmd: "node", args: ["scripts/check-live-state-truth.mjs"] },
];

let failed = null;
const results = [];

for (const step of steps) {
  console.log(`\n> release: ${step.name}`);
  const result = step.run ? step.run() : runCommand(step.cmd, step.args);
  const ok = result.status === 0;
  if (result.error) console.error(`Unable to run ${step.name}: ${result.error.message}`);
  results.push({ name: step.name, ok, code: result.status });
  if (!ok && !failed) failed = step.name;
}

console.log("\n-------- release summary --------");
for (const result of results) {
  console.log(`  ${result.ok ? "PASS" : "FAIL"} ${result.name}${result.ok ? "" : ` (exit ${result.code})`}`);
}

if (failed) {
  console.log(`\nRelease blocked. First failure: ${failed}`);
  process.exit(1);
}

console.log("\nRelease checks passed.");
process.exit(0);
