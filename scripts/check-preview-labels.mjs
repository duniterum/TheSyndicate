#!/usr/bin/env node
// CI guard for preview surfaces.
//   1. Files under src/lib/preview/ or src/components/preview/ must not render a "LIVE" pill.
//   2. Preview components must not render external explorer / tx links.
//   3. Preview rows must not claim "verified".
//   4. Files that render a leaderboard preview must include the literal "SIMULATED" label.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = ["src/lib/preview", "src/components/preview"];
const errors = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/\.(t|j)sx?$/.test(name)) out.push(p);
  }
  return out;
}

const files = ROOTS.flatMap((r) => {
  try { return walk(r); } catch { return []; }
});

for (const f of files) {
  const src = readFileSync(f, "utf8");
  const rel = relative(process.cwd(), f);

  // Strip line comments to avoid false positives in JSDoc / inline notes.
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  if (/<StatusPill[^>]+status\s*=\s*["']LIVE["']/.test(code)) {
    errors.push(`${rel}: preview surface must not use <StatusPill status="LIVE">`);
  }
  if (/['"`]LIVE['"`]/.test(code) && !/SimPill|preview/i.test(code)) {
    // soft check — only flag if a bare "LIVE" string is being rendered as a pill
    if (/Pill[^>]*>\s*['"]?LIVE/.test(code)) {
      errors.push(`${rel}: preview surface renders a literal LIVE pill`);
    }
  }
  if (/avascan\.info|snowtrace\.io|dexscreener\.com/.test(code)) {
    errors.push(`${rel}: preview surface must not link to an explorer (no fake tx links)`);
  }
  if (/0x[a-fA-F0-9]{40}.*verified/i.test(code) || /verified.*0x[a-fA-F0-9]{40}/i.test(code)) {
    errors.push(`${rel}: preview surface must not present a wallet/tx as verified`);
  }

  if (/Leaderboard|leaderboard/.test(code) && !/SIMULATED/.test(code)) {
    errors.push(`${rel}: leaderboard preview missing literal "SIMULATED" label`);
  }
}

if (errors.length) {
  console.error("\nPreview label guard failed:\n");
  for (const e of errors) console.error("  ✗ " + e);
  console.error("");
  process.exit(1);
}
console.log(`check-preview-labels: OK (${files.length} files scanned)`);
