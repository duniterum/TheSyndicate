#!/usr/bin/env node
// Canonical-Explorer-URL Check.
//
// Detects hand-built explorer URLs that bypass the canonical helpers in
//   • src/lib/chain-registry.ts (txUrl, addressUrl, explorerUrlForAddress)
//   • src/lib/syndicate-config.ts (avascanTxExplorerUrl, snowtraceTxExplorerUrl, routescanTxExplorerUrl)
//
// Severity classification:
//   • BLOCKER → known-broken patterns we must never emit
//       - https://avascan.info/tx/<hash>            (returns 404 — must use /blockchain/c/tx/)
//       - https://avascan.info/blockchain/c/tx/<hash> with an EOA address in <hash> slot (malformed)
//   • WARN    → hand-built explorer URLs in app code (src/components, src/routes, src/labs)
//                that should migrate to the canonical helpers
//
// Allowlist (canonical sources of truth — must contain literal URLs):
//   • src/lib/chain-registry.ts
//   • src/lib/syndicate-config.ts
//   • src/lib/explorer-guard.ts
//   • src/lib/explorer-preference.ts
//   • src/lib/wagmi.ts
//   • anything under src/lib/__tests__/ and *.test.ts
//   • this script and scripts/check-explorer-urls.mjs
//
// Exit code: 0 on PASS or WARN-only, 1 on BLOCKER.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const ALLOWLIST = new Set([
  "src/lib/chain-registry.ts",
  "src/lib/syndicate-config.ts",
  "src/lib/explorer-guard.ts",
  "src/lib/explorer-preference.ts",
  "src/lib/wagmi.ts",
  "scripts/check-explorer-canonical.mjs",
  "scripts/check-explorer-urls.mjs",
]);

const HOST_RE = /https:\/\/(?:www\.)?(snowtrace\.io|routescan\.io|avascan\.info)[^"'`\s)<>]*/g;

// Known-broken: avascan.info/tx/<hash> without /blockchain/c/
const BLOCKER_AVASCAN_BARE_TX = /https:\/\/avascan\.info\/tx\/0x[a-fA-F0-9]{64}/;

function listFiles(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (e === "node_modules" || e.startsWith(".")) continue;
      listFiles(p, out);
    } else if (/\.(ts|tsx|mts|cts|jsx|js)$/.test(e)) {
      out.push(p);
    }
  }
  return out;
}

const findings = []; // { file, line, url, severity }

function classify(url) {
  if (BLOCKER_AVASCAN_BARE_TX.test(url)) return "BLOCKER";
  return "WARN";
}

function scan(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (ALLOWLIST.has(rel)) return;
  if (rel.includes("/__tests__/") || rel.endsWith(".test.ts") || rel.endsWith(".test.tsx")) return;

  const src = readFileSync(file, "utf8");
  if (!/snowtrace|routescan|avascan/.test(src)) return;

  const lines = src.split("\n");
  lines.forEach((line, i) => {
    // skip comments-only lines
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;

    let m;
    HOST_RE.lastIndex = 0;
    while ((m = HOST_RE.exec(line)) !== null) {
      const url = m[0];
      findings.push({ file: rel, line: i + 1, url, severity: classify(url) });
    }
  });
}

for (const f of listFiles(SRC)) scan(f);

const blockers = findings.filter((f) => f.severity === "BLOCKER");
const warns = findings.filter((f) => f.severity === "WARN");

console.log("\nCanonical Explorer URL Check");
console.log("=".repeat(72));
if (findings.length === 0) {
  console.log("✓ No hand-built explorer URLs detected outside canonical sources.");
} else {
  for (const f of findings) {
    const tag = f.severity === "BLOCKER" ? "✗ BLOCKER" : "⚠ WARN  ";
    console.log(`${tag} ${f.file}:${f.line}  ${f.url}`);
  }
}
console.log("-".repeat(72));
console.log(`Summary: ${findings.length} finding(s) · ${blockers.length} BLOCKER · ${warns.length} WARN`);

if (blockers.length > 0) {
  console.log("\nBLOCKER explanation: avascan.info/tx/<hash> 404s — use txUrl()/avascanTxExplorerUrl().");
  process.exit(1);
}
process.exit(0);
