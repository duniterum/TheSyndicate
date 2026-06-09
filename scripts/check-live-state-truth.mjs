#!/usr/bin/env node
// Live-state truth guard.
//
// Fails if visitor-facing routes/components contain copy that contradicts
// current on-chain truth:
//   • Archive1155 is DEPLOYED on Avalanche.
//   • ID 1 (First Signal, 0.50 USDC) and ID 3 (Patron Seal, 5.00 USDC) are
//     OPEN for public mint.
//   • IDs 2, 4–9 are NOT publicly mintable — but visitor copy must frame
//     them as "protocol-memory surfaces sealed by event", not as
//     "pending contract" / "remain inactive" / "not active yet".
//
// Operator surfaces (registry, protocol-health, archive-id-registry, dev
// panels, labs) are exempt — they should keep technical state visible.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src/routes", "src/components/syndicate"];
const ALLOWLIST_SUBSTR = [
  "archive-id-registry",
  "ArchiveDevPanel",
  "ArchiveDiscrepancyReport",
  "ArchiveReadHealthPanel",
  "ArchiveContractStatus",
  "protocol-health",
  "registry.tsx",
  "labs",
  "/ai.tsx",
  "/docs.tsx",
];

// Phrases that contradict current truth on visitor surfaces.
const BANNED = [
  /coming once the archive contract is live/i,
  /archive contract is not yet deployed/i,
  /nft archive is pending/i,
  /nft archive pending/i,
  /other artifacts remain inactive/i,
  /first public artifact mint/i,             // implies "the only one"
  /archive events.*pending contract/i,
  /patron seal[^.]{0,40}\b0\.50 usdc/i,      // wrong price
  /patron seal[^.]{0,40}(pending|not active|configured · not active)/i,
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(p)) out.push(p);
  }
  return out;
}

const findings = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (ALLOWLIST_SUBSTR.some((s) => file.includes(s))) continue;
    const src = readFileSync(file, "utf8");
    // strip line comments
    const stripped = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const re of BANNED) {
      const m = stripped.match(re);
      if (m) findings.push({ file, match: m[0].slice(0, 120) });
    }
  }
}

if (findings.length === 0) {
  console.log("✅ live-state-truth: PASS (no stale visitor copy contradicts on-chain state)");
  process.exit(0);
}
console.log("✗ live-state-truth: stale copy contradicts current on-chain state");
for (const f of findings) console.log(`  ${f.file}  → "${f.match}"`);
process.exit(1);
