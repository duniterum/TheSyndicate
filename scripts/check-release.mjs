#!/usr/bin/env node
// Pre-release verification orchestrator.
// Runs the canonical checks that must pass before publishing.
// Fails (exit 1) on the first BLOCKING step. Non-blocker findings within
// the execution-gates runner are reported but never fail this script —
// the gate runner itself owns that policy.
//
// Steps (in order):
//   1. typecheck (tsc --noEmit)
//   2. tests    (vitest run)
//   3. execution gates (scripts/check-execution-gates.mjs)
//   4. explorer URLs   (scripts/check-explorer-urls.mjs)
//
// Authority: docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md

import { spawnSync } from "node:child_process";

const steps = [
  { name: "typecheck",          cmd: "npx",  args: ["tsc", "--noEmit"] },
  { name: "tests",              cmd: "npx",  args: ["vitest", "run"] },
  { name: "execution-gates",    cmd: "node", args: ["scripts/check-execution-gates.mjs"] },
  { name: "explorer-urls",      cmd: "node", args: ["scripts/check-explorer-urls.mjs"] },
  { name: "explorer-canonical", cmd: "node", args: ["scripts/check-explorer-canonical.mjs"] },
  { name: "protocol-health",    cmd: "node", args: ["scripts/check-protocol-health.mjs"] },
  { name: "visitor-vocabulary", cmd: "node", args: ["scripts/check-visitor-vocabulary.mjs"] },
  { name: "live-state-truth",   cmd: "node", args: ["scripts/check-live-state-truth.mjs"] },
];

let failed = null;
const results = [];
for (const s of steps) {
  console.log(`\n▶ release: ${s.name}`);
  const r = spawnSync(s.cmd, s.args, { stdio: "inherit", env: process.env });
  const ok = r.status === 0;
  results.push({ name: s.name, ok, code: r.status });
  if (!ok && !failed) failed = s.name;
}

console.log("\n──────── release summary ────────");
for (const r of results) console.log(`  ${r.ok ? "✅" : "❌"} ${r.name}${r.ok ? "" : ` (exit ${r.code})`}`);

if (failed) {
  console.log(`\n❌ Release blocked — first failure: ${failed}`);
  process.exit(1);
}
console.log("\n✅ Release checks passed.");
process.exit(0);
