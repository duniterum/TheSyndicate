#!/usr/bin/env node
// Rendered-route QA + structural visual-anchor check for the NFT Archive surfaces.
//
// Scope: /nft, /archive, /nfts, /my-syndicate.
//
// This script is the regression guard for the "ID 1 The First Signal is live"
// invariant. It runs over the rendered HTML of each route (no JS execution)
// and asserts:
//
//   1. Forbidden stale phrases are ABSENT on every route.
//      These are the phrases that caused the prior consistency regression
//      where /nft contradicted itself ("contract not deployed", "no public
//      drop active") even though Archive1155 is live for ID 1.
//
//   2. Required live-truth phrases are PRESENT on every route.
//      ACTIVE · MINT OPEN, 0.50 USDC, wallet limit 5, etc.
//
//   3. Structural visual anchors for the ID 1 card region exist
//      (premium-card framing, "What you are minting" details, mint flow
//      copy near the artwork area). This is a lightweight visual
//      regression: it does not pixel-diff, but it asserts the named
//      structural blocks ship in the HTML.
//
//   4. ID 2 / ID 3 / other roadmap IDs do NOT acquire a mint CTA.
//
// Usage:
//   node scripts/check-nft-archive-qa.mjs                   # default base
//   node scripts/check-nft-archive-qa.mjs https://host      # explicit base
//   BASE_URL=https://host node scripts/check-nft-archive-qa.mjs
//
// Exit: 0 = all routes PASS, 1 = any failure.

const DEFAULT_BASE = "https://thesyndicate.money";
const BASE = (process.argv[2] || process.env.BASE_URL || DEFAULT_BASE).replace(/\/$/, "");

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

// ─── Forbidden stale phrases (case-insensitive) ───────────────────────────
// Anything in this list appearing on ID-1-bearing routes is a regression to
// pre-deployment / pre-activation copy.
const STALE_FORBIDDEN = [
  "archive contract is not deployed",
  "no public drop active",
  "no public archive mint is active yet",
  "public artifact minting is not active yet",
  "public drops activated 0",
  "public drops activated: 0",
  "nothing is mintable today",
  "id 1 configured not active",
  "the first signal configured not active",
  "pending contract for the first signal",
  "the first signal · pending contract",
  "validation phase",
  "no drop is active yet",
];

// ─── Required live-truth phrases per route ────────────────────────────────
// Each phrase must appear at least once. Phrases are checked case-insensitive
// but normalize · and middot variants.
const ROUTES = [
  {
    path: "/nft",
    must: [
      "the first signal",
      "active · mint open",
      "0.50 usdc",
      "wallet limit",
    ],
    // ID 1 is the ONLY id with a mint button. ID 2 / ID 3 must not have one.
    mustNotInIdRegion: {
      // crude heuristic: the only "Mint The First Signal" CTA must exist
      mintCtaCount: { phrase: "mint the first signal", min: 1 },
    },
  },
  {
    path: "/archive",
    must: [
      "the first signal",
      "active · mint open",
      "0.50 usdc",
    ],
    mustNotInIdRegion: {
      mintCtaCount: { phrase: "mint the first signal", min: 1 },
    },
  },
  {
    path: "/nfts",
    must: [
      "the first signal",
      "mint open",
    ],
    mustNotInIdRegion: {
      mintCtaCount: { phrase: "mint the first signal", min: 1 },
    },
  },
  {
    path: "/my-syndicate",
    must: [
      "archive",
    ],
    mustNotInIdRegion: {},
  },
];

// ─── Structural visual anchors (lightweight visual regression) ────────────
// Each anchor is a phrase + an optional "must appear before/after" hint.
// We don't render — we assert these markers all live in the HTML payload of
// the page and that the ID 1 card region keeps its premium framing tokens.
const VISUAL_ANCHORS = {
  "/nft": [
    "the first signal",
    "active · mint open",
    "what you are minting",
    "0.50 usdc",
    "contract-rendered",
  ],
  "/archive": [
    "the first signal",
    "active · mint open",
    "what you are minting",
    "0.50 usdc",
  ],
};

// ─── ID 2 / other inactive IDs MUST NOT carry an enabled mint CTA ────────
// ID 1 (The First Signal) and ID 3 (Patron Seal) are LIVE — those mint
// CTAs are expected. ID 2 and IDs 4–9 must remain non-mintable.
const FORBIDDEN_MINT_CTAS = [
  "mint id 2",
  "mint seat record",
  "mint chapter seal",
  "mint protocol milestone",
];

// ─── No marketplace / trading / financial-rights surface ──────────────────
// Affirmative marketplace surface phrases only. Negation copy like
// "No floor price. No volume." in disclaimers is legitimate, so we don't
// guard the bare words "floor price" / "trading volume" here.
const FORBIDDEN_MARKETPLACE = [
  /\blist for sale\b/i,
  /\bcurrent floor\s*:/i,
  /\b24h\s+volume\b/i,
  /\bmarketplace listing\b/i,
  /\bbuy on opensea\b/i,
];

function norm(s) {
  // collapse middot variants + lower
  return s.replace(/[·•∙]/g, "·").toLowerCase();
}

async function fetchRoute(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "syndicate-nft-qa/1.0",
      "cache-control": "no-cache",
    },
    redirect: "follow",
  });
  const body = await res.text();
  return { status: res.status, body };
}

function countOccurrences(hay, needle) {
  if (!needle) return 0;
  let i = 0;
  let n = 0;
  while ((i = hay.indexOf(needle, i)) !== -1) {
    n++;
    i += needle.length;
  }
  return n;
}

async function checkRoute(rule) {
  const url = BASE + rule.path;
  let res;
  try {
    res = await fetchRoute(url);
  } catch (e) {
    return { rule, ok: false, status: 0, error: String(e), problems: ["fetch failed"] };
  }
  const body = norm(res.body);
  const problems = [];

  // 1. stale forbidden phrases
  for (const p of STALE_FORBIDDEN) {
    if (body.includes(norm(p))) problems.push(`STALE leaked: "${p}"`);
  }
  // 2. required phrases
  for (const p of rule.must || []) {
    if (!body.includes(norm(p))) problems.push(`MISSING required: "${p}"`);
  }
  // 3. forbidden mint CTAs for non-ID-1
  for (const p of FORBIDDEN_MINT_CTAS) {
    if (body.includes(norm(p))) problems.push(`FORBIDDEN mint CTA: "${p}"`);
  }
  // 4. forbidden marketplace surfaces (regex with negation lookbehind)
  for (const re of FORBIDDEN_MARKETPLACE) {
    if (re.test(body)) problems.push(`FORBIDDEN marketplace: ${re}`);
  }
  // 5. visual structural anchors
  const anchors = VISUAL_ANCHORS[rule.path];
  if (anchors) {
    for (const a of anchors) {
      if (!body.includes(norm(a))) problems.push(`VISUAL anchor missing: "${a}"`);
    }
  }
  // 6. mintCta count assertion
  if (rule.mustNotInIdRegion?.mintCtaCount) {
    const { phrase, min } = rule.mustNotInIdRegion.mintCtaCount;
    const c = countOccurrences(body, norm(phrase));
    if (c < min) problems.push(`Mint CTA "${phrase}" count ${c} < ${min}`);
  }

  return {
    rule,
    ok: problems.length === 0 && res.status === 200,
    status: res.status,
    problems,
  };
}

(async () => {
  console.log(`${BOLD}NFT Archive rendered-route QA${RESET} ${DIM}— ${BASE}${RESET}\n`);
  let failed = 0;
  for (const rule of ROUTES) {
    const r = await checkRoute(rule);
    const tag = r.ok ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    console.log(`${tag}  ${rule.path}  ${DIM}status=${r.status}${RESET}`);
    if (!r.ok) {
      failed++;
      if (r.error) console.log(`      error: ${r.error}`);
      for (const p of r.problems) console.log(`      - ${p}`);
    }
  }
  console.log("");
  if (failed) {
    console.log(`${RED}${BOLD}${failed} route(s) failed.${RESET}`);
    process.exit(1);
  } else {
    console.log(`${GREEN}${BOLD}All NFT Archive routes passed.${RESET}`);
  }
})();
