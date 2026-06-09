#!/usr/bin/env node
// Lightweight live-site content check.
//
// Fetches a small set of public routes and asserts that current copy is
// present and stale copy is absent. Designed for QA after `Publish → Update`
// and a hard refresh — NOT a full e2e or screenshot diff system.
//
// Usage:
//   node scripts/check-live-content.mjs                       # checks default base URL
//   node scripts/check-live-content.mjs https://other.host      # checks an arbitrary base URL
//   BASE_URL=https://other.host node scripts/check-live-content.mjs
//
// Exit code: 0 if all routes PASS and the deployed build stamp matches the
// source build-stamp tag; 1 otherwise. The build-stamp gate prevents the
// silent "source is correct but live is stale" failure mode that bit us
// during the redesign pass.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_BASE = "https://thesyndicate.money";
const BASE = (process.argv[2] || process.env.BASE_URL || DEFAULT_BASE).replace(/\/$/, "");

const GLOBAL_MUST_NOT = [
  "Compounder Score",
  "transparent onchain society",
  "Episode #001 footer",
  "Episode #001",
  "quests",
  "achievements",
  "community rewards",
  "governance participation",
  "proposal eligibility",
  "governance-approved unlocks",
  "score multiplier",
  "private strategy room",
  "Genesis NFT eligibility",
  "DEMO PREVIEW",
];

let RULES;
try {
  const raw = readFileSync(join(__dirname, "live-content-rules.json"), "utf-8");
  RULES = JSON.parse(raw);
} catch (e) {
  console.error("Failed to load live-content-rules.json:", e.message);
  process.exit(2);
}

// Read the current source build-stamp tag so we can compare against the
// deployed stamp returned by "/". A mismatch means the live URL is still
// serving an older bundle even if every route returns 200.
let SOURCE_TAG = null;
try {
  const stampSrc = readFileSync(join(__dirname, "..", "src", "lib", "build-stamp.ts"), "utf-8");
  const m = stampSrc.match(/tag:\s*"([^"]+)"/);
  SOURCE_TAG = m ? m[1] : null;
} catch {
  /* ignore — we'll just skip the parity gate */
}

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

function lower(s) {
  return s.toLowerCase();
}

async function fetchRoute(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "syndicate-content-check/1.0",
      "cache-control": "no-cache",
    },
    redirect: "follow",
  });
  const body = await res.text();
  return { status: res.status, body };
}

async function checkOne(rule) {
  const url = BASE + rule.path;
  let res;
  try {
    res = await fetchRoute(url);
  } catch (e) {
    return { rule, ok: false, status: 0, missing: [], leaked: [], error: String(e) };
  }
  const lowered = lower(res.body);
  const must = rule.must || [];
  const mustNot = [...new Set([...(rule.mustNot || []), ...GLOBAL_MUST_NOT])];
  const missing = must.filter((needle) => !lowered.includes(lower(needle)));
  const leaked = mustNot.filter((needle) => lowered.includes(lower(needle)));
  const stamp = extractBuildStamp(res.body);
  const stampMismatch = SOURCE_TAG && stamp?.tag && stamp.tag !== SOURCE_TAG;
  const missingStamp = !stamp;
  const ok = res.status >= 200 && res.status < 400 && missing.length === 0 && leaked.length === 0 && !stampMismatch && !missingStamp;
  return { rule, ok, status: res.status, missing, leaked, stamp, stampMismatch, missingStamp };
}

function extractBuildStamp(body) {
  const m = body.match(/data-build-iso="([^"]+)"[^>]*data-build-tag="([^"]+)"/);
  if (!m) return null;
  return { iso: m[1], tag: m[2] };
}

async function main() {
  console.log(`${BOLD}Syndicate · live content check${RESET}`);
  console.log(`${DIM}Base: ${BASE}${RESET}`);
  if (SOURCE_TAG) console.log(`${DIM}Source build tag: ${SOURCE_TAG}${RESET}`);
  console.log("");

  // Parity gate: deployed build stamp must match source build-stamp tag.
  let deployedTag = null;
  try {
    const root = await fetchRoute(BASE + "/");
    const stamp = extractBuildStamp(root.body);
    if (stamp) {
      deployedTag = stamp.tag;
      console.log(`${DIM}Deployed build stamp: ${stamp.iso} · ${stamp.tag}${RESET}\n`);
    } else {
      console.log(`${DIM}(no build stamp found in /)${RESET}\n`);
    }
  } catch {
    /* main checks will surface the error */
  }

  const results = [];
  for (const rule of RULES) {
    const r = await checkOne(rule);
    results.push(r);
    const tag = r.ok ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    const path = rule.path.padEnd(14);
    console.log(`${tag}  ${path}  ${DIM}HTTP ${r.status}${RESET}`);
    if (r.error) console.log(`       ${RED}error:${RESET} ${r.error}`);
    if (r.missing.length) console.log(`       ${RED}missing:${RESET} ${r.missing.map((s) => JSON.stringify(s)).join(", ")}`);
    if (r.leaked.length) console.log(`       ${RED}stale:${RESET}   ${r.leaked.map((s) => JSON.stringify(s)).join(", ")}`);
    if (r.missingStamp) console.log(`       ${RED}build:${RESET}   no build stamp found`);
    if (r.stampMismatch) console.log(`       ${RED}build:${RESET}   source=${SOURCE_TAG} · route=${r.stamp?.tag}`);
    if (rule.notes && (!r.ok || process.env.VERBOSE)) {
      console.log(`       ${DIM}note: ${rule.notes}${RESET}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  const parityFail = SOURCE_TAG && deployedTag && SOURCE_TAG !== deployedTag;

  console.log("");
  if (parityFail) {
    console.log(`${RED}${BOLD}Build-stamp parity FAIL${RESET}`);
    console.log(`${RED}  source=${SOURCE_TAG} · deployed=${deployedTag}${RESET}`);
    console.log(`${DIM}  → Click Publish → Update, then re-run after a hard refresh.${RESET}`);
  }

  if (failed.length === 0 && !parityFail) {
    console.log(`${GREEN}${BOLD}All ${results.length} routes passed · build parity OK.${RESET}`);
    process.exit(0);
  } else {
    if (failed.length) console.log(`${RED}${BOLD}${failed.length} of ${results.length} routes failed.${RESET}`);
    console.log(`${DIM}If the repo is up to date, click Publish → Update and retry after a hard refresh.${RESET}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
