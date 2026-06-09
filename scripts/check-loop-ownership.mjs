#!/usr/bin/env node
// scripts/check-loop-ownership.mjs
//
// Wave P6 guard. Fails CI when the homepage re-imports a component that
// was demoted out of homepage ownership in docs/LOOP_OWNERSHIP_DECISION.md,
// when a labs-quarantined component is imported by production code, or when
// a forbidden duplicate-loop counter creeps back onto the homepage.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

const HOMEPAGE = "src/routes/index.tsx";

/** Components that must NOT appear on the homepage (Loop duplicates / noise). */
const FORBIDDEN_ON_HOMEPAGE = [
  "AnticipationLine",
  "LivePulseStrip",
  "LiveRecencyStrip",
  "TrustBar",
  "HomeMetricsStrip",
  "HomeRankLadder",
  "MarketDashboard",
  "MilestoneTracker",
  "LiveActivityFeed",
];

/** Required canonical loop owners on the homepage. */
const REQUIRED_ON_HOMEPAGE = [
  "Hero",                // Loop A canonical
  "HomeNextMilestone",   // Loop B canonical
  "SinceYourLastVisit",  // Loop C canonical
  "ProtocolMoments",     // Loop D supporting
];

const errors = [];

// 1. Homepage composition
const home = readFileSync(join(ROOT, HOMEPAGE), "utf8");
for (const name of FORBIDDEN_ON_HOMEPAGE) {
  const re = new RegExp(`<${name}[\\s/>]|from\\s+["'][^"']*/${name}["']`);
  if (re.test(home)) {
    errors.push(`Homepage imports/renders forbidden component: ${name} (see docs/LOOP_OWNERSHIP_DECISION.md §4).`);
  }
}
for (const name of REQUIRED_ON_HOMEPAGE) {
  const re = new RegExp(`<${name}[\\s/>]`);
  if (!re.test(home)) {
    errors.push(`Homepage missing required canonical loop owner: ${name}.`);
  }
}

// 2. Archive guard — no production code may import from src/labs/.
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (p.includes(`${"src"}/labs`)) continue;
      walk(p, out);
    } else if (/\.(t|j)sx?$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}
const srcFiles = walk(join(ROOT, "src"));
for (const f of srcFiles) {
  const body = readFileSync(f, "utf8");
  if (/from\s+["']@\/labs\//.test(body) || /from\s+["'][^"']*\/src\/labs\//.test(body)) {
    // The /labs route is allowed to import the registry only.
    const rel = relative(ROOT, f);
    if (rel === "src/routes/labs.tsx" && /from\s+["']@\/labs\/registry["']/.test(body) && !/from\s+["']@\/labs\/components/.test(body)) {
      continue;
    }
    errors.push(`Production file imports from src/labs/: ${rel}`);
  }
}

if (errors.length > 0) {
  console.error("\nLoop-ownership guard failed:\n");
  for (const e of errors) console.error("  ✗", e);
  console.error("");
  process.exit(1);
}
console.log("✓ Loop ownership intact (Loops A/B/C/D · no labs leakage · no duplicate homepage counters).");
