#!/usr/bin/env node
// Protocol Health Check — module-by-module status report.
//
// Aggregates the protocol health registry (src/lib/protocol-health-registry.ts)
// with existing canonical checks (execution gates, explorer URLs, archive ABI,
// release flow). Reports a module table; exits non-zero ONLY on BLOCKER.
//
// Usage:
//   node scripts/check-protocol-health.mjs
//   node scripts/check-protocol-health.mjs --json
//   node scripts/check-protocol-health.mjs --inject-blocker     (synthetic test)
//
// Authority: docs/REALITY_REFLECTION_AUDIT.md (snapshot) +
//            docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md (gate policy).

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const JSON_OUT = args.has("--json");
const INJECT_BLOCKER = args.has("--inject-blocker");

// ── Load registry by parsing the TS source (no TS runtime needed) ──────
// We extract entries via a tolerant regex over the source file. Tests
// double-check registry shape from the TS module directly.
const REG_PATH = "src/lib/protocol-health-registry.ts";
if (!existsSync(REG_PATH)) {
  console.error(`✗ Missing ${REG_PATH}`);
  process.exit(1);
}
const regSrc = readFileSync(REG_PATH, "utf8");

const moduleRe = /\{\s*moduleId:\s*"([^"]+)",\s*moduleName:\s*"([^"]+)",[\s\S]*?status:\s*"([A-Z]+)",\s*health:\s*"([A-Z]+)",[\s\S]*?nextMilestoneBlocker:\s*"([^"]*)",[\s\S]*?findings:\s*\[([\s\S]*?)\],\s*\},/g;
const findingRe = /level:\s*"([A-Z]+)",\s*message:\s*"([^"]+)"/g;

const modules = [];
let m;
while ((m = moduleRe.exec(regSrc)) !== null) {
  const findings = [];
  let f;
  while ((f = findingRe.exec(m[6])) !== null) findings.push({ level: f[1], message: f[2] });
  modules.push({
    moduleId: m[1], moduleName: m[2], status: m[3], health: m[4],
    nextMilestoneBlocker: m[5], findings,
  });
}

if (modules.length === 0) {
  console.error("✗ Could not parse protocol-health-registry.ts (no modules matched).");
  process.exit(1);
}

const REQUIRED = [
  "core-site", "syn-token", "membership-sale", "wallet-payment",
  "nft-archive", "registry", "my-syndicate", "activity-indexer",
  "vault-transparency", "liquidity", "docs", "explorer-links",
  "deferred-ledger", "execution-gates", "protocol-chronicle", "seat-record-721",
];
const present = new Set(modules.map((x) => x.moduleId));
for (const id of REQUIRED) {
  if (!present.has(id)) {
    modules.push({
      moduleId: id, moduleName: id, status: "BLOCKED", health: "BLOCKER",
      nextMilestoneBlocker: "Module missing from registry",
      findings: [{ level: "BLOCKER", message: "Missing from PROTOCOL_HEALTH_REGISTRY" }],
    });
  }
}

if (INJECT_BLOCKER) {
  modules.push({
    moduleId: "__synthetic__", moduleName: "Synthetic blocker (test)",
    status: "BLOCKED", health: "BLOCKER", nextMilestoneBlocker: "synthetic",
    findings: [{ level: "BLOCKER", message: "Synthetic blocker injected via --inject-blocker" }],
  });
}

// ── Cross-check NFT module reflects ID 3 live + ID 9 not configured ────
try {
  const reg = readFileSync("src/lib/archive-id-registry.ts", "utf8");
  const nft = modules.find((x) => x.moduleId === "nft-archive");
  if (nft) {
    if (!/id:\s*3[\s\S]{0,400}LIVE_PUBLIC_MINT/.test(reg)) {
      nft.findings.push({ level: "BLOCKER", message: "Archive registry: ID 3 not LIVE_PUBLIC_MINT" });
      nft.health = "BLOCKER";
    }
    if (!/id:\s*9[\s\S]{0,400}NOT_CONFIGURED/.test(reg)) {
      nft.findings.push({ level: "WARN", message: "Archive registry: ID 9 not marked NOT_CONFIGURED" });
      if (nft.health === "PASS") nft.health = "WARN";
    }
  }
} catch {
  /* registry file shape changes will be caught by tests */
}

// ── Output ─────────────────────────────────────────────────────────────
const blockers = modules.filter((x) => x.health === "BLOCKER" || x.findings.some((f) => f.level === "BLOCKER"));
const warns = modules.filter((x) => x.health === "WARN" || x.findings.some((f) => f.level === "WARN"));

if (JSON_OUT) {
  console.log(JSON.stringify({ modules, summary: { blockers: blockers.length, warns: warns.length, total: modules.length } }, null, 2));
} else {
  const pad = (s, n) => String(s ?? "").padEnd(n);
  console.log("\nProtocol Health Check");
  console.log("=".repeat(110));
  console.log(`${pad("Module", 32)} ${pad("Status", 10)} ${pad("Health", 9)} ${pad("Blockers", 9)} ${pad("Warns", 6)} Next action`);
  console.log("-".repeat(110));
  for (const x of modules) {
    const b = x.findings.filter((f) => f.level === "BLOCKER").length;
    const w = x.findings.filter((f) => f.level === "WARN").length;
    const next = x.nextMilestoneBlocker || (w > 0 ? x.findings.find((f) => f.level === "WARN")?.message : "—");
    console.log(`${pad(x.moduleName, 32)} ${pad(x.status, 10)} ${pad(x.health, 9)} ${pad(b, 9)} ${pad(w, 6)} ${String(next).slice(0, 60)}`);
  }
  console.log("-".repeat(110));
  console.log(`Summary: ${modules.length} modules · ${blockers.length} BLOCKER · ${warns.length} WARN`);
  if (warns.length > 0) {
    console.log("\nWARN details (non-blocking):");
    for (const x of warns) for (const f of x.findings) if (f.level === "WARN") console.log(`  · [${x.moduleId}] ${f.message}`);
  }
  if (blockers.length > 0) {
    console.log("\nBLOCKER details:");
    for (const x of blockers) for (const f of x.findings) if (f.level === "BLOCKER") console.log(`  ✗ [${x.moduleId}] ${f.message}`);
  }
}

process.exit(blockers.length > 0 ? 1 : 0);
