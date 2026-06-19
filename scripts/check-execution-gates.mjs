#!/usr/bin/env node
// Protocol Execution Control System — gate runner.
// Reads canonical source files and reports findings. Exits non-zero only
// on BLOCKER findings. HIGH/MEDIUM are reported but never fail CI.
//
// Authority: docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const findings = [];
const add = (gate, severity, message) => findings.push({ gate, severity, message });

// 1. Contract registry sanity
try {
  const src = read("src/lib/contract-registry.ts");
  for (const key of ["SYN_TOKEN", "USDC", "MEMBERSHIP_SALE", "ARCHIVE_1155"]) {
    if (!src.includes(`"${key}"`)) add("contract-registry-complete", "BLOCKER", `Missing ${key} entry`);
  }
  // SeatRecord721 must remain PENDING + address: null
  const seatBlock = src.match(/"SEAT_RECORD_721"[\s\S]*?\),/);
  if (!seatBlock) add("seat-record-721-pending", "BLOCKER", "SEAT_RECORD_721 entry missing");
  else {
    if (!seatBlock[0].includes('"PENDING"')) add("seat-record-721-pending", "BLOCKER", "SeatRecord721 must be PENDING");
    if (!/,\s*null,/.test(seatBlock[0])) add("seat-record-721-pending", "BLOCKER", "SeatRecord721 address must be null");
  }
} catch (e) {
  add("contract-registry-complete", "BLOCKER", `contract-registry.ts unreadable: ${e.message}`);
}

// 2. Archive ID registry sanity
try {
  const src = read("src/lib/archive-id-registry.ts");
  const blockFor = (id) => {
    const re = new RegExp(`id:\\s*${id},([\\s\\S]*?)\\},`);
    const m = src.match(re);
    return m ? m[1] : null;
  };
  const id1 = blockFor(1);
  if (!id1 || !id1.includes('"LIVE_PUBLIC_MINT"')) add("archive-id-1-live", "BLOCKER", "ID 1 not LIVE_PUBLIC_MINT");
  const id2 = blockFor(2);
  if (!id2 || !id2.includes('"RESERVED_DISABLED"')) add("archive-id-2-reserved", "BLOCKER", "ID 2 not RESERVED_DISABLED");
  if (id2 && !id2.includes("publicMintAllowed: false")) add("archive-id-2-reserved", "BLOCKER", "ID 2 must not allow public mint");
  const id3 = blockFor(3);
  if (!id3 || !id3.includes('"LIVE_PUBLIC_MINT"')) add("archive-id-3-live", "BLOCKER", "ID 3 not LIVE_PUBLIC_MINT");
  if (id3 && !/priceUsdc:\s*5\b/.test(id3)) add("patron-seal-price-5-usdc", "BLOCKER", "Patron Seal price drifted from 5 USDC");
  for (const id of [4, 5, 6, 7, 8]) {
    const b = blockFor(id);
    if (b && b.includes("publicMintAllowed: true")) add("archive-ids-4-8-not-public", "BLOCKER", `ID ${id} must not be publicMintAllowed`);
  }
  const id9 = blockFor(9);
  if (id9 && !id9.includes('"NOT_CONFIGURED"')) add("archive-id-9-not-configured", "BLOCKER", "ID 9 must be NOT_CONFIGURED");
} catch (e) {
  add("archive-id-1-live", "BLOCKER", `archive-id-registry.ts unreadable: ${e.message}`);
}

// 3. Write-flow canonical patterns
const WRITE_COMPONENTS = [
  "src/components/syndicate/LivePurchase.tsx",
  "src/components/syndicate/MintFirstSignal.tsx",
  "src/components/syndicate/MintPatronSeal.tsx",
];
for (const file of WRITE_COMPONENTS) {
  if (!existsSync(join(ROOT, file))) {
    add("mint-hash-persistence", "BLOCKER", `Write component missing: ${file}`);
    continue;
  }
  const src = read(file);
  if (!/useMintHashPersistence/.test(src)) add("mint-hash-persistence", "BLOCKER", `${file} missing useMintHashPersistence`);
  if (!/classifyTxError/.test(src)) add("no-financial-rights-copy", "HIGH", `${file} missing classifyTxError`);
  for (const host of ["snowtrace.io", "avascan.info", "routescan.io"]) {
    if (src.includes(host)) add("canonical-explorer-helpers", "BLOCKER", `${file} hardcodes ${host}`);
  }
  if (/avascan\.info\/tx\//.test(src)) add("no-bare-avascan-tx", "BLOCKER", `${file} uses bare avascan /tx/`);
  // Financial-rights language
  for (const word of [/\bROI\b/, /\bdividend\b/i, /\byield\b/i, /\bprofit share\b/i, /\bguaranteed appreciation\b/i, /\bpassive income\b/i]) {
    if (word.test(src)) add("no-financial-rights-copy", "BLOCKER", `${file} contains banned copy ${word}`);
  }
}

// 4. Activation runbook freeze-before-activate
try {
  const runbook = read("docs/ACTIVATION_RUNBOOK.md");
  if (!/freezeArtifactDefinition/.test(runbook) || !/setDropActive/.test(runbook)) {
    add("freeze-before-activate", "BLOCKER", "Activation runbook missing freeze→activate steps");
  }
  const freezeIdx = runbook.indexOf("freezeArtifactDefinition");
  const activateIdx = runbook.indexOf("setDropActive(id, true)");
  if (freezeIdx > -1 && activateIdx > -1 && freezeIdx > activateIdx) {
    add("freeze-before-activate", "BLOCKER", "Activation runbook activates before freezing");
  }
} catch (e) {
  add("freeze-before-activate", "BLOCKER", `ACTIVATION_RUNBOOK.md unreadable: ${e.message}`);
}

// 5. Execution gates module sanity
try {
  const src = read("src/lib/execution-gates.ts");
  for (const token of ["BLOCKER", "EXECUTE_NOW", "ASK_FOUNDER", "REQUIRES_ONCHAIN_ACTION", "DO_NOT_DO", "RELEASE_GATES", "ACTIVATION_GATES", "ABI_REGISTRY"]) {
    if (!src.includes(token)) add("contract-registry-complete", "BLOCKER", `execution-gates.ts missing ${token}`);
  }
} catch (e) {
  add("contract-registry-complete", "BLOCKER", `execution-gates.ts unreadable: ${e.message}`);
}

// ── Report ───────────────────────────────────────────────────────────────
const counts = { BLOCKER: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
for (const f of findings) counts[f.severity] = (counts[f.severity] || 0) + 1;

const synthetic = process.env.GATE_RUNNER_SYNTHETIC === "1";
if (synthetic) {
  add("synthetic-test", "BLOCKER", "Synthetic blocker injected via GATE_RUNNER_SYNTHETIC=1");
  counts.BLOCKER++;
}

// Severity → release decision (mirrors src/lib/execution-gates.ts classify()).
const decisionFor = (sev) =>
  sev === "BLOCKER" ? "BLOCKER" : sev === "HIGH" ? "WARN" : "DEFERRED";

const buckets = { PASS: 0, WARN: 0, BLOCKER: 0, DEFERRED: 0 };
for (const f of findings) buckets[decisionFor(f.severity)]++;
if (findings.length === 0) buckets.PASS = 1;

// Best-effort JSON report. Never fails the runner.
// Synthetic failure injection is for exit-code tests only; it must not
// overwrite the canonical latest release report.
try {
  const { mkdirSync, writeFileSync } = await import("node:fs");
  if (!synthetic) {
    mkdirSync(join(ROOT, "reports"), { recursive: true });
    const payload = {
      timestamp: new Date().toISOString(),
      status: buckets.BLOCKER > 0 ? "BLOCKER" : buckets.WARN > 0 ? "WARN" : "PASS",
      counts: { ...counts, ...buckets },
      findings: findings.map((f) => ({
        gate: f.gate,
        severity: f.severity,
        decision: decisionFor(f.severity),
        message: f.message,
      })),
    };
    writeFileSync(join(ROOT, "reports/execution-gates.latest.json"), JSON.stringify(payload, null, 2));
  }
} catch { /* report is optional */ }

if (findings.length === 0) {
  console.log("✅ Protocol Execution Gates — PASS (no findings)");
  console.log(`Summary: PASS=1 WARN=0 BLOCKER=0 DEFERRED=0`);
  process.exit(0);
}

console.log("Protocol Execution Gates — findings:\n");
for (const f of findings) {
  const d = decisionFor(f.severity);
  const tag = d === "BLOCKER" ? "🛑 BLOCKER" : d === "WARN" ? "⚠️  WARN" : "·  DEFERRED";
  console.log(`  ${tag}  [${f.gate}] (${f.severity}) ${f.message}`);
}
console.log(`\nSummary: PASS=0 WARN=${buckets.WARN} BLOCKER=${buckets.BLOCKER} DEFERRED=${buckets.DEFERRED}`);
console.log(`  (raw: BLOCKER=${counts.BLOCKER || 0} HIGH=${counts.HIGH || 0} MEDIUM=${counts.MEDIUM || 0} LOW=${counts.LOW || 0})`);

if (buckets.BLOCKER > 0) {
  const topBlockers = findings.filter((f) => f.severity === "BLOCKER").slice(0, 5).map((f) => f.gate);
  console.log(`\nTop blocking gates: ${topBlockers.join(", ")}`);
  console.log("\n❌ FAIL — BLOCKER findings present.");
  process.exit(1);
}
console.log("\n✅ PASS — no BLOCKER findings (WARN/DEFERRED reported above).");
process.exit(0);
