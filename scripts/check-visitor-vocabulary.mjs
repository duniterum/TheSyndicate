#!/usr/bin/env node
// Visitor-vocabulary regression guard.
//
// Bans operator-only terms from rendering inside visitor-facing surfaces
// (src/components/syndicate/ and src/routes/). Operator vocabulary is
// allowed in /protocol-health, Operator State panels, comments, registry
// constants, archive-id-registry, and Lab files only.
//
// Authority: docs/NFT_DESIRE_ARCHITECTURE_PASS.md (vocabulary contract).

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Phrases that must NEVER appear inside visitor-rendered JSX text.
// We keep this conservative — quoted strings inside JSX text / className-free
// text-like positions are what we want to catch. Source comments and
// registry constants are filtered out by file allowlist below.
const FORBIDDEN = [
  "NOT_CONFIGURED",
  "OWNER_ONLY",
  "RESERVED_DISABLED",
  "not contract-rendered",
  "NOT CONTRACT-RENDERED",
  "PREVIEW · NOT",
  "Renderer NONE",
  "Mintable false",
  "only ID 1 is mintable",
  "only ID 1 mintable",
  "Patron Seal is pending",
  "Patron Seal is inactive",
  "Patron Seal configured not active",
  "Archive contract pending",
  "NFT Archive pending",
];

// Files allowed to contain operator vocabulary (registry/health/operator only).
// NOTE: ArtifactUniverseBoard and FutureCollectorView were quarantined to
// src/labs/components/ on 2026-06-08 and are no longer scanned (outside the
// roots below). ArchiveGalleryPreview remains in tree only because regression
// tests assert on its source strings; it must not be mounted on public routes.
const ALLOWLIST_SUBSTR = [
  "archive-id-registry",
  "ArchiveDevPanel",
  "ArchiveDiscrepancyReport",
  "ArchiveReadHealthPanel",
  "ArchiveContractStatus",
  "ArchiveGalleryPreview",  // DEPRECATED for public routes; kept for test fixtures only
  "protocol-health",
  "MyArchivePreview",
  "Sections.tsx",
  "TrustBar.tsx",
  "ArtifactPreviewArtwork",
  "/ai.tsx",
];

const ROOTS = ["src/components/syndicate", "src/routes"];

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
    for (const term of FORBIDDEN) {
      // Only flag occurrences outside comments. Crude but effective: drop
      // lines starting with // or * before searching.
      const lines = src.split("\n");
      lines.forEach((ln, i) => {
        const stripped = ln.replace(/\/\/.*$/, "");
        if (stripped.includes(term)) {
          findings.push({ file, line: i + 1, term, snippet: ln.trim().slice(0, 120) });
        }
      });
    }
  }
}

if (findings.length === 0) {
  console.log("✅ visitor-vocabulary: PASS (no operator terms in visitor surfaces)");
  process.exit(0);
}
console.log("✗ visitor-vocabulary: operator terms leaked into visitor surfaces");
for (const f of findings) console.log(`  ${f.file}:${f.line}  [${f.term}]  ${f.snippet}`);
process.exit(1);
