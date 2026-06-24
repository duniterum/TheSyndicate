#!/usr/bin/env node
// Low-cost production smoke test: public and critical noindex truth routes
// must return 200, /episodes must 30x → /chapters, and /labs must remain
// non-indexed.
// Run with: node scripts/check-route-status.mjs [origin]
// Default origin: https://thesyndicate.money

const ORIGIN = process.argv[2] || "https://thesyndicate.money";

const ROUTES_200 = [
  "/", "/join", "/activity", "/chapters", "/liquidity", "/members",
  "/founders", "/ranks", "/registry", "/transparency", "/token",
  "/tokenomics", "/vault", "/roadmap", "/docs", "/faq", "/whitepaper",
  "/archive", "/chronicle", "/evolution", "/institutional-register",
  "/knowledge-map", "/my-syndicate", "/nft", "/nfts", "/risk",
  "/ai", "/referral", "/protocol-health",
  "/sitemap.xml", "/robots.txt",
];

const ROUTES_REDIRECT = [
  { from: "/episodes", toContains: "/chapters" },
];

let failed = 0;

async function head(path, { follow = true } = {}) {
  const res = await fetch(ORIGIN + path, {
    redirect: follow ? "follow" : "manual",
    headers: { "user-agent": "syndicate-smoke/1.0" },
  });
  return res;
}

for (const p of ROUTES_200) {
  try {
    const r = await head(p);
    const ok = r.status === 200;
    console.log(`${ok ? "OK " : "FAIL"}  ${r.status}  ${p}`);
    if (!ok) failed++;
  } catch (e) {
    console.log(`FAIL  ERR  ${p}  ${e.message}`);
    failed++;
  }
}

for (const { from, toContains } of ROUTES_REDIRECT) {
  try {
    const r = await head(from, { follow: false });
    const loc = r.headers.get("location") || "";
    const ok = r.status >= 300 && r.status < 400 && loc.includes(toContains);
    console.log(`${ok ? "OK " : "FAIL"}  ${r.status}  ${from} -> ${loc}`);
    if (!ok) failed++;
  } catch (e) {
    console.log(`FAIL  ERR  ${from}  ${e.message}`);
    failed++;
  }
}

// /labs must be Disallow-ed in robots.txt
try {
  const robots = await (await head("/robots.txt")).text();
  const ok = /Disallow:\s*\/labs/.test(robots);
  console.log(`${ok ? "OK " : "FAIL"}  robots.txt disallows /labs`);
  if (!ok) failed++;
} catch (e) {
  console.log(`FAIL  robots.txt fetch: ${e.message}`);
  failed++;
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${ROUTES_200.length + ROUTES_REDIRECT.length + 1} checks passed.`);
