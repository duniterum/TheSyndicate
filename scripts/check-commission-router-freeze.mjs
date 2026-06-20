#!/usr/bin/env node
// CommissionRouterV1 pre-deployment readiness checker.
// This is intentionally separate from check-release: the current expected
// decision is BLOCKED until external-review/deployment-quality gates clear.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { keccak256, toBytes } from "viem";

const ROOT = process.cwd();
const read = (path) => readFileSync(join(ROOT, path), "utf8");

const findings = [];
const add = (gate, status, message, detail = undefined) =>
  findings.push({ gate, status, message, ...(detail ? { detail } : {}) });

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const EXPECTED = {
  usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  saleV2: "0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b",
  operations: "0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80",
  sourceId: keccak256(toBytes("SALE_V2")),
};

function extractNamedString(src, name) {
  const objectField = new RegExp(`${name}:\\s*["']([^"']+)["']`, "m");
  const exportedConst = new RegExp(`export\\s+const\\s+${name}[^=]*=\\s*["']([^"']+)["']`, "m");
  return src.match(objectField)?.[1] ?? src.match(exportedConst)?.[1] ?? null;
}

function blockForRegistryKey(src, key) {
  const index = src.indexOf(`"${key}"`);
  if (index < 0) return null;
  const tail = src.slice(index);
  const end = tail.indexOf("),");
  return end >= 0 ? tail.slice(0, end) : tail;
}

function commandAvailable(cmd, args = ["--version"]) {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return {
    ok: result.status === 0,
    status: result.status,
    output: [result.stdout, result.stderr].filter(Boolean).join("\n").trim(),
    error: result.error?.message,
  };
}

// Canonical parameter freeze.
try {
  const config = read("src/lib/syndicate-config.ts");
  const usdc = extractNamedString(config, "USDC_CONTRACT_ADDRESS");
  const saleV2 = extractNamedString(config, "MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS");
  const operations = extractNamedString(config, "OPERATIONS_WALLET");

  if (usdc !== EXPECTED.usdc) {
    add("parameter-usdc", "BLOCKER", `USDC drift: expected ${EXPECTED.usdc}, found ${usdc ?? "missing"}`);
  } else add("parameter-usdc", "GREEN", "USDC matches Avalanche native USDC.");

  if (saleV2 !== EXPECTED.saleV2) {
    add("parameter-sale-v2", "BLOCKER", `Active Sale V2 drift: expected ${EXPECTED.saleV2}, found ${saleV2 ?? "missing"}`);
  } else add("parameter-sale-v2", "GREEN", "Active Sale V2b address matches freeze sheet.");

  if (operations !== EXPECTED.operations) {
    add("parameter-operations", "BLOCKER", `Operations wallet drift: expected ${EXPECTED.operations}, found ${operations ?? "missing"}`);
  } else add("parameter-operations", "GREEN", "Operations wallet matches freeze sheet.");
} catch (error) {
  add("parameter-freeze", "BLOCKER", `Unable to read syndicate config: ${error.message}`);
}

add("parameter-source-id", "GREEN", `sourceId keccak256("SALE_V2") = ${EXPECTED.sourceId}`);

// Contract registry must stay pending before deployment.
try {
  const registry = read("src/lib/contract-registry.ts");
  const block = blockForRegistryKey(registry, "COMMISSION_ROUTER_V1");
  if (!block) {
    add("registry-router-entry", "BLOCKER", "COMMISSION_ROUTER_V1 registry entry is missing.");
  } else {
    if (!block.includes('"PENDING"')) {
      add("registry-router-pending", "BLOCKER", "COMMISSION_ROUTER_V1 must remain PENDING before verified deployment.");
    } else add("registry-router-pending", "GREEN", "CommissionRouterV1 remains PENDING.");

    if (!/,\s*null,/.test(block)) {
      add("registry-router-address-null", "BLOCKER", "COMMISSION_ROUTER_V1 must not have a placeholder or unverified address.");
    } else add("registry-router-address-null", "GREEN", "CommissionRouterV1 address remains null.");
  }
} catch (error) {
  add("registry-router-entry", "BLOCKER", `Unable to read contract registry: ${error.message}`);
}

// Freeze/review docs must exist and contain the current hard blockers.
for (const file of [
  "docs/COMMISSION_ROUTER_V1_DEPLOYMENT_FREEZE.md",
  "docs/COMMISSION_ROUTER_V1_REVIEW_READINESS.md",
  "docs/LEGAL_DISCLOSURE_REFERRAL.md",
  "docs/REVENUE_ATTRIBUTION_LAYER.md",
]) {
  if (!existsSync(join(ROOT, file))) add("docs-present", "BLOCKER", `Missing required review doc: ${file}`);
  else add("docs-present", "GREEN", `${file} exists.`);
}

try {
  const freeze = read("docs/COMMISSION_ROUTER_V1_DEPLOYMENT_FREEZE.md");
  for (const token of [
    "Fresh Slither run",
    "Fork rehearsal",
    "Owner model",
    "Frontend Stage 1",
    "Rollback / Disable Plan",
    "No-go",
  ]) {
    if (!freeze.includes(token)) add("freeze-doc-complete", "BLOCKER", `Freeze doc missing section/token: ${token}`);
  }
  if (!freeze.includes(EXPECTED.sourceId)) add("freeze-source-id", "BLOCKER", "Freeze doc does not record exact sourceId.");
  else add("freeze-source-id", "GREEN", "Freeze doc records exact sourceId.");
} catch (error) {
  add("freeze-doc-complete", "BLOCKER", `Unable to read deployment freeze doc: ${error.message}`);
}

// Saved Slither reports can be reviewed, but fresh static analysis must still run.
const slitherReport = "contracts/audit/slither-report.txt";
if (!existsSync(join(ROOT, slitherReport))) {
  add("slither-saved-report", "BLOCKER", `Missing saved Slither report: ${slitherReport}`);
} else {
  const report = read(slitherReport);
  const detectorCount = [...report.matchAll(/^Detector:\s+(.+)$/gm)].length;
  add("slither-saved-report", "GREEN", `Saved Slither report exists with ${detectorCount} detector groups.`);
}

const slither = commandAvailable("slither");
if (!slither.ok) {
  add(
    "slither-fresh-run",
    "BLOCKER",
    "Fresh Slither cannot run in this shell.",
    "Install Slither, then run: cd contracts && slither . --exclude-dependencies",
  );
} else {
  add("slither-fresh-run", "GREEN", `Slither available: ${slither.output.split("\n")[0]}`);
}

// Fork rehearsal input readiness. Do not run the fork here; no private keys or broadcast.
const rpc = process.env.AVAX_RPC || process.env.VITE_AVALANCHE_RPC_URL || "";
if (!rpc) {
  add(
    "fork-rpc",
    "BLOCKER",
    "No Avalanche HTTPS RPC is set for fork rehearsal.",
    "Set AVAX_RPC=<Avalanche HTTPS RPC>, then run the documented RehearsalForkV2b command. Do not use WSS for Foundry fork tests.",
  );
} else if (!/^https:\/\//i.test(rpc)) {
  add("fork-rpc", "BLOCKER", "Fork RPC must be an HTTPS endpoint, not WSS or another scheme.");
} else {
  add("fork-rpc", "GREEN", "Avalanche HTTPS RPC is available for fork rehearsal.");
}

// Founder/operator decisions.
const finalOwner = process.env.COMMISSION_ROUTER_FINAL_OWNER || "";
if (!finalOwner) {
  add(
    "owner-final",
    "BLOCKER",
    "Final owner is not frozen.",
    "Set/record COMMISSION_ROUTER_FINAL_OWNER after founder decision. Hardware wallet minimum; multisig preferred before public activation.",
  );
} else if (!ADDRESS_RE.test(finalOwner)) {
  add("owner-final", "BLOCKER", "COMMISSION_ROUTER_FINAL_OWNER is not a valid EVM address.");
} else {
  add("owner-final", "GREEN", "Final owner address is syntactically valid.");
}

if (process.env.COMMISSION_ROUTER_EXTERNAL_REVIEW_SIGNOFF !== "1") {
  add("external-review", "BLOCKER", "External line-by-line review signoff is not recorded.");
} else {
  add("external-review", "GREEN", "External review signoff is recorded.");
}

if (process.env.COMMISSION_ROUTER_LEGAL_SIGNOFF !== "1") {
  add("legal-copy", "BLOCKER", "Legal/product copy signoff is not recorded.");
} else {
  add("legal-copy", "GREEN", "Legal/product copy signoff is recorded.");
}

const counts = findings.reduce((acc, f) => {
  acc[f.status] = (acc[f.status] || 0) + 1;
  return acc;
}, {});

const status = counts.BLOCKER > 0 ? "BLOCKED" : "READY_FOR_DEPLOYMENT_DECISION";

const report = {
  timestamp: new Date().toISOString(),
  status,
  expected: EXPECTED,
  counts,
  findings,
};

try {
  mkdirSync(join(ROOT, "reports"), { recursive: true });
  writeFileSync(join(ROOT, "reports/commission-router-freeze.latest.json"), JSON.stringify(report, null, 2));
} catch {
  // Optional report; console output is authoritative for this run.
}

console.log(`CommissionRouterV1 freeze check: ${status}`);
console.log(`Summary: GREEN=${counts.GREEN || 0} BLOCKER=${counts.BLOCKER || 0}`);
console.log("");

for (const finding of findings) {
  const icon = finding.status === "GREEN" ? "PASS" : "BLOCKER";
  console.log(`${icon} [${finding.gate}] ${finding.message}`);
  if (finding.detail) console.log(`  ${finding.detail}`);
}

if (counts.BLOCKER > 0) process.exit(1);
process.exit(0);
