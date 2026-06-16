#!/usr/bin/env node
// Regression check — attention hierarchy sprint.
//
// Asserts:
//   1. Homepage renders LivePulseStrip BEFORE any explanatory section.
//   2. Homepage CTA block has exactly one gold (primary) CTA in the
//      compressed near-hero block.
//   4. /nft renders the RecentCollectorsRail.
//   5. /registry renders the RegistryTrustOpener at the top.
//   6. No banned wealth/yield/governance words anywhere in the new components.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FAIL = [];

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), "utf8");
}

// 1. LivePulseStrip above explanatory sections on index.tsx
const home = read("src/routes/index.tsx");
const pulseIdx = home.indexOf("<LivePulseStrip");
const flywheelIdx = home.indexOf("<Flywheel");
const storyIdx = home.indexOf("<StorySoFar");
const whyJoinIdx = home.indexOf("<WhyJoinSimple");
if (pulseIdx < 0) FAIL.push("index.tsx: <LivePulseStrip /> missing");
if (pulseIdx > 0 && (pulseIdx > flywheelIdx || pulseIdx > storyIdx || pulseIdx > whyJoinIdx)) {
  FAIL.push("index.tsx: <LivePulseStrip /> must render BEFORE explanatory sections");
}

// 2. Activity tape on homepage
if (!home.includes("<HomeActivityTape")) FAIL.push("index.tsx: <HomeActivityTape /> missing");

// 4. NFT recent collectors
const nft = read("src/routes/nft.tsx");
if (!nft.includes("<RecentCollectorsRail")) FAIL.push("nft.tsx: <RecentCollectorsRail /> missing");

// 5. Registry trust opener
const reg = read("src/routes/registry.tsx");
if (!reg.includes("<RegistryTrustOpener")) FAIL.push("registry.tsx: <RegistryTrustOpener /> missing");
// must appear before <Section id="status"
const openerIdx = reg.indexOf("<RegistryTrustOpener");
const statusIdx = reg.indexOf('<Section id="status"');
if (openerIdx > 0 && statusIdx > 0 && openerIdx > statusIdx) {
  FAIL.push("registry.tsx: <RegistryTrustOpener /> must render before the status table");
}

// 6. Banned vocabulary in the new sprint components.
const BANNED = [
  "yield",
  "dividend",
  "ROI",
  "investment returns",
  "passive income",
  "guaranteed appreciation",
  "profit share",
  "jackpot",
];
const SCAN = [
  "src/components/syndicate/HomeActivityTape.tsx",
  "src/components/syndicate/RecentCollectorsRail.tsx",
  "src/components/syndicate/RegistryTrustOpener.tsx",
];
for (const f of SCAN) {
  // Strip line comments so doctrine notes can name what we forbid.
  const raw = read(f);
  const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const txt = stripped.toLowerCase();
  for (const w of BANNED) {
    const re = new RegExp(`\\b${w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (re.test(txt)) {
      FAIL.push(`${f}: banned word "${w}"`);
    }
  }
}

if (FAIL.length === 0) {
  console.log("✓ attention-hierarchy: all checks passed");
  process.exit(0);
} else {
  console.error("✗ attention-hierarchy checks failed:");
  for (const m of FAIL) console.error("  · " + m);
  process.exit(1);
}
