#!/usr/bin/env node
/**
 * OG metadata test — Wave 3B.1 verification.
 *
 * Usage:
 *   node scripts/og-metadata-test.mjs                     # tests local dev (http://localhost:8080)
 *   node scripts/og-metadata-test.mjs https://thesyndicate.money
 *
 * Checks the four canonical shareable routes for required meta tags.
 * Exits non-zero on any missing required tag.
 *
 * No browser dependencies — pure fetch + regex.
 */

const origin = (process.argv[2] ?? "http://localhost:8080").replace(/\/$/, "");

const ROUTES = [
  { path: "/", name: "Home" },
  { path: "/transparency", name: "Transparency" },
  { path: "/wallet/0x0000000000000000000000000000000000000000", name: "Wallet (sample)" },
  { path: "/milestone/syn-live", name: "Milestone (sample)" },
];

const REQUIRED = [
  { key: "title", re: /<title[^>]*>([^<]+)<\/title>/i },
  { key: "og:title", re: /property=["']og:title["'][^>]+content=["']([^"']+)["']/i },
  { key: "og:description", re: /property=["']og:description["'][^>]+content=["']([^"']+)["']/i },
  { key: "og:image", re: /property=["']og:image["'][^>]+content=["']([^"']+)["']/i },
  { key: "twitter:card", re: /name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i },
  { key: "twitter:image", re: /name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i },
  { key: "twitter:image:alt", re: /name=["']twitter:image:alt["'][^>]+content=["']([^"']+)["']/i },
  { key: "canonical", re: /rel=["']canonical["'][^>]+href=["']([^"']+)["']/i },
];

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";

let failed = 0;

for (const route of ROUTES) {
  const url = origin + route.path;
  console.log(`\n${route.name}  ${DIM}${url}${RESET}`);
  let html;
  try {
    const res = await fetch(url, { headers: { "user-agent": "syndicate-og-test/1.0" } });
    if (!res.ok) {
      console.log(`  ${RED}HTTP ${res.status}${RESET}`);
      failed++;
      continue;
    }
    html = await res.text();
  } catch (e) {
    console.log(`  ${RED}fetch failed: ${e.message}${RESET}`);
    failed++;
    continue;
  }
  for (const tag of REQUIRED) {
    const m = html.match(tag.re);
    if (m) {
      const v = m[1].length > 70 ? m[1].slice(0, 70) + "…" : m[1];
      console.log(`  ${GREEN}✓${RESET} ${tag.key.padEnd(18)} ${DIM}${v}${RESET}`);
    } else {
      console.log(`  ${RED}✗ ${tag.key.padEnd(18)} MISSING${RESET}`);
      failed++;
    }
  }
}

console.log(failed === 0 ? `\n${GREEN}All metadata checks passed.${RESET}` : `\n${RED}${failed} check(s) failed.${RESET}`);
process.exit(failed === 0 ? 0 : 1);
