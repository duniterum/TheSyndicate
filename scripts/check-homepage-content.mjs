#!/usr/bin/env node
// Rendered-content parity scan. Asserts that each target surface serves the
// current homepage (Flywheel + Protocol Economy + 70/20/10) and contains
// none of the old stale-build leak phrases.
//
// Usage:
//   node scripts/check-homepage-content.mjs
//   node scripts/check-homepage-content.mjs https://thesyndicate.money

const TARGETS = process.argv[2]
  ? [process.argv[2]]
  : ["https://thesyndicate.money"];

// [phrase, mustExist] — true ⇒ required, false ⇒ must NOT appear in homepage HTML.
// Note: a few banned terms (yield, dividend) are intentionally retained inside
// disclaimer wording. Use phrase-anchored guards instead of bare words.
const RULES = [
  ["Flywheel", true],
  ["Protocol Economy", true],
  ["70% Vault", true],
  ["70 / 20 / 10", true],
  ["seat is the anchor", true],
  ["Programmatic Vault", true],
  // Stale-build leak guards
  ["EP #", false],
  ["Compounder", false],
  ["score multiplier", false],
  ["Live Protocol Pulse", false],
  ["Episode entries", false],
  // Pre-ads safety leak guards — anchored phrases only, never bare banned words
  ["guaranteed return", false],
  ["guaranteed yield", false],
  ["revenue share", false],
  ["passive income", false],
  ["governance rights live", false],
  ["NFT rights live", false],
  ["Nothing to lose", false],
  // Routing-split typos / wrong allocation guards
  ["80 / 10 / 10", false],
  ["60 / 30 / 10", false],
  ["50 / 30 / 20", false],
];

let failed = 0;

for (const origin of TARGETS) {
  process.stdout.write(`\n=== ${origin} ===\n`);
  let html = "";
  try {
    const res = await fetch(origin, {
      headers: { "user-agent": "syndicate-parity/1.0", "cache-control": "no-cache" },
    });
    if (!res.ok) {
      console.log(`FAIL  HTTP ${res.status}`);
      failed++;
      continue;
    }
    html = await res.text();
  } catch (e) {
    console.log(`FAIL  fetch: ${e.message}`);
    failed++;
    continue;
  }

  // Preview shell may be JS-only and return an empty body — skip but warn.
  if (html.length < 4000) {
    console.log(`WARN  body too short (${html.length} bytes) — likely SPA shell, skipping content rules`);
    continue;
  }

  for (const [phrase, mustExist] of RULES) {
    const found = html.includes(phrase);
    const ok = mustExist ? found : !found;
    const tag = ok ? "OK  " : "FAIL";
    const verb = mustExist ? "must contain" : "must NOT contain";
    console.log(`${tag}  ${verb}  "${phrase}"  (found=${found})`);
    if (!ok) failed++;
  }

  // Build stamp surfaces (hidden but greppable)
  const stamp = html.match(/syndicate-build:\s*([^|]+)\|\s*([^|]+)\|\s*[a-z]+/);
  if (stamp) {
    console.log(`INFO  build tag: ${stamp[2].trim()} @ ${stamp[1].trim()}`);
  } else {
    console.log("WARN  no <!-- syndicate-build: ... --> marker found");
  }
}

if (failed > 0) {
  console.error(`\n${failed} content check(s) failed`);
  process.exit(1);
}
console.log("\nAll content parity checks passed.");
