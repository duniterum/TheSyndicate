#!/usr/bin/env node
// Ownership / investment / dividend wording guard.
//
// Doctrine: docs/PROTOCOL_IN_PUBLIC_DOCTRINE.md.
// Fails when banned mental-model wording appears outside an explicit legal
// denial sentence ("does not", "never", "no ", "not a", etc.) on the same
// line. Scope is intentionally narrow: non-labs runtime surfaces only.
// docs/, /labs/, and tests are exempted (legacy archived language lives
// there under quarantine).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SCAN_ROOTS = ["src/components", "src/routes", "src/lib"];
const EXCLUDE_DIRS = new Set([
  "labs",
  "preview",          // already covered by check-preview-labels
  "__tests__",
  "node_modules",
]);
const EXCLUDE_FILES = new Set([
  // self-references / canonical legal-denial files (allow-listed)
  "src/lib/chronicle-entries.ts",
  "src/lib/execution-gates.ts",
  "src/lib/archive-config.ts",
  "src/lib/data-verification-registry.ts",
  "src/lib/archive-preview-catalog.ts",
  "src/components/syndicate/WhyJoinSimple.tsx",
  "src/components/syndicate/WhyLpMatters.tsx",
  "src/components/syndicate/WhatChangesAfterJoining.tsx",
  "src/routes/whitepaper.tsx",
  "src/routes/transparency.tsx",
]);

// case-insensitive word-ish patterns
const BANNED = [
  /\bcumulative contribution\b/i,
  /\byour contribution\b/i,
  /\bmy contribution\b/i,
  /\btreasury share\b/i,
  /\bvault share\b/i,
  /\bmy share\b/i,
  /\byour share\b/i,
  /\bcapital raised\b/i,
  /\bmoney raised\b/i,
  /\bpassive income\b/i,
  /\bprofit share\b/i,
  /\brevenue share\b/i,
  /\bdividend(s)?\b/i,
  /\bROI\b/,
  /\binvestor(s)?\b/i,
  /\binvestment\b/i,
  /\byield\b/i,
  /\bUSDC Raised\b/,
  /\bTotal Raised\b/,
];

// allow-list: lines that explicitly deny / disclaim the concept are fine
const DENIAL_HINTS =
  /\b(no |not |never|neither|without|non[- ]?investment|non[- ]?yield|denial|disclaimer|excluded?|forbidden|banned|risk\b|equity, *debt|grants?\b|nor\b|isn't|aren't|doesn't|don't|cannot|claims? against|repayment)\b/i;

const errors = [];
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/\.(t|j)sx?$/.test(name)) out.push(p);
  }
  return out;
}

const files = SCAN_ROOTS.flatMap((r) => { try { return walk(r); } catch { return []; } });
for (const f of files) {
  const rel = relative(process.cwd(), f).replace(/\\/g, "/");
  if (EXCLUDE_FILES.has(rel)) continue;
  const src = readFileSync(f, "utf8");
  // Strip block comments to avoid false positives in JSDoc / inline notes.
  const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const lines = noBlock.split(/\r?\n/);
  lines.forEach((line, i) => {
    // skip line comments
    const stripped = line.replace(/^\s*(?:\/\/).*/, "").replace(/\s*\/\/.*$/, "");
    if (!stripped.trim()) return;
    // 3-line window: this line + previous 2 (catches denial sentences that
    // wrap, and array literals whose declaration line says ISNOT / disclaimers).
    const ctx =
      stripped + "\n" + (lines[i - 1] ?? "") + "\n" + (lines[i - 2] ?? "");
    for (const re of BANNED) {
      if (re.test(stripped)) {
        if (DENIAL_HINTS.test(ctx)) continue;
        if (/\b(ISNOT|isNotList|notList|disclaimers?|deny|denial|negat)/i.test(ctx)) continue;
        errors.push(`${rel}:${i + 1}: banned wording ${re}  →  ${stripped.trim().slice(0, 140)}`);
      }
    }
  });
}

if (errors.length) {
  console.error("\nOwnership-wording guard failed:\n");
  for (const e of errors) console.error("  ✗ " + e);
  console.error(
    "\nUse approved language: purchases · USDC routed · routing proof · receipts · sale volume · protocol movements · treasury movements · referral commission (from Operations).\n",
  );
  process.exit(1);
}
console.log(`check-ownership-wording: OK (${files.length} files scanned)`);
