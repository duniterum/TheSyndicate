/**
 * Doctrine guard — scans every component / route / lib file that contributes
 * to rendered public-site output and fails if legacy chapter/member doctrine
 * leaks back in. This is the closest testable approximation of a rendered
 * crawler we have without spinning up a real SSR/browser harness — TanStack
 * Start renders these exact files, and every banned phrase below has been
 * the source of at least one prior regression.
 *
 * Covers (by inclusion of source roots):
 *   /  /nft  /archive  /chapters  /members  /founders  /activity
 *   /transparency  /whitepaper  /registry
 *
 * Excluded:
 *   - Archival audit docs under docs/ (historical record, not rendered).
 *   - Test files themselves (they must literally type the banned phrases
 *     to assert against them).
 *   - On-chain artifact NAMES that happen to contain "Genesis Sealed"
 *     (Archive1155 ID 5) — preserved as on-chain truth.
 *
 * Allowed (explicitly NOT banned — these are valid protocol/treasury
 * milestones, not chapter doctrine):
 *   - First Member recorded
 *   - First $100 / $1,000 / $10,000 routed
 *   - First LP event
 *   - Genesis Signal sealed at #333
 *   - First Thousand sealed at #1,000
 *   - The Expansion sealed at #3,333
 *   - First Ten Thousand sealed at #10,000
 *
 * Does NOT touch contracts, ABI, addresses, mint price, or any on-chain state.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");

const SCAN_ROOTS = [
  "src/routes",
  "src/components",
  "src/lib",
] as const;

const SKIP_FILE_SUFFIXES = [
  ".test.ts",
  ".test.tsx",
  ".spec.ts",
  ".spec.tsx",
  "routeTree.gen.ts",
];

const SKIP_DIR_NAMES = new Set(["__tests__", "__snapshots__", "node_modules"]);

const ALLOWED_FILES = new Set<string>([
  // archive-config / preview-catalog carry the ON-CHAIN artifact name
  // "Genesis Sealed" for ID 5 — preserved as on-chain truth, not chapter doctrine.
  "src/lib/archive-config.ts",
  "src/lib/archive-preview-catalog.ts",
  // FirstSignalShowcase references the artifact name "Genesis Sealed".
  "src/components/syndicate/FirstSignalShowcase.tsx",
]);

/**
 * Banned legacy doctrine phrases. Each is a RegExp tested against file source.
 * Use word-boundaries / anchors where ambiguity exists (e.g. "First 1000"
 * must not match "First 10000").
 */
const BANNED: Array<{ name: string; re: RegExp; allowFiles?: Set<string> }> = [
  { name: "Genesis sealed (10 members)", re: /Genesis sealed \(10 members\)/i },
  // "Member #10" (standalone) is legacy Genesis-closes-at-10 doctrine. The
  // negative lookahead allows "Member #10,001" (Open Era start) and longer
  // member numbers like "#100"/"#1000"/"#10000".
  { name: "Member #10 (legacy)",         re: /Member #10(?![\d,])/ },
  { name: "Member #100",                 re: /Member #100\b/ },
  { name: "Member #500",                 re: /Member #500\b/ },
  { name: "Genesis closes at",           re: /Genesis closes at/i },
  // "First 100/500/1000/1,000" as a standalone member-doctrine label.
  // We intentionally allow "$100", "$1,000", "$10,000" (treasury milestones)
  // and chapter ranges like "#1,000" by anchoring on the literal label form.
  { name: "First 100 (chapter label)",   re: /\bFirst 100\b(?!\s*(?:routed|\$))/i },
  { name: "First 500 (chapter label)",   re: /\bFirst 500\b(?!\s*(?:routed|\$))/i },
  { name: "First 1000 (chapter label)",  re: /\bFirst 1000\b(?!\s*(?:routed|\$))/i },
  { name: "First 1,000 (chapter label)", re: /\bFirst 1,000\b(?!\s*(?:routed|\$|sealed))/i },
  { name: "First 10 (chapter label)",    re: /\bFirst 10\b(?![\d,])(?!\s*(?:routed|\$|,000|,?000))/i },
  { name: "Genesis #1–#10",              re: /Genesis #1\s*[–-]\s*#10\b/ },
  { name: "#1 – #10 range",              re: /#1\s*[–-]\s*#10\b(?!\d)/ },
  { name: "#11 – #100 range",            re: /#11\s*[–-]\s*#100\b/ },
  { name: "#101 – #500 range",           re: /#101\s*[–-]\s*#500\b/ },
  { name: "#501 – #1,000 range",         re: /#501\s*[–-]\s*#1,?000\b/ },
  { name: "Open #1001+",                 re: /Open #1001\+/ },
  { name: "Open #1,001+",                re: /Open #1,001\+/ },
  { name: "Chapter I — The Beginning",   re: /Chapter I\s*[—-]\s*The Beginning/i },
  { name: "Genesis 10 doctrine",         re: /\bGenesis 10\b/ },
  // ─── Rank Constitutional Ruling — retired rank vocabulary ───────────────
  // Rank confers no economic benefit; the wealth multiplier and the
  // identity-colliding apex tier name were retired. They must not reappear in
  // rendered source. (src/labs is a quarantine and is NOT in SCAN_ROOTS.)
  { name: "Rank wealth multiplier",        re: /scoreMultiplier/ },
  { name: "Compounder Score (retired)",    re: /[Cc]ompounder/ },
  { name: "Genesis Circle rank (renamed)", re: /Genesis Circle/ },
  // ─── Retired rank vocabulary (renamed: Patron→Steward, Council Candidate→
  //     Custodian, Council→Keystone). "Patron Seal"/"Patronage" and a future
  //     "Governance Council" stay valid — only the rank forms below are banned.
  { name: "Council Candidate rank (retired)", re: /Council Candidate/ },
  { name: "Patron rank badge (retired)",      re: /\bPatron badge\b/ },
  { name: "Council rank badge (retired)",     re: /\bCouncil badge\b/ },
  // ─── Phase 0D — protocol-money "raised" vocabulary (legal) ──────────────
  // SYN is not equity / yield / an offering. USDC is ROUTED, never "raised".
  // Money-context only: these never match the internal field `usdcRaised`,
  // the ABI fn `totalUsdcRaised()` (no space before "raised"), or the
  // comments that document this very ban (e.g. 'no "raised"').
  { name: "money 'USDC raised' (use 'USDC routed')",  re: /USDC raised/i },
  { name: "'$N raised' (use '$N routed')",            re: /\$[\d,]+\s+raised\b/i },
  { name: "'raised onchain' (use 'routed onchain')",  re: /raised\s+on-?chain/i },
  { name: "money word + 'raised' (use 'routed')",     re: /\b(?:funds|capital|money|amount|total|proceeds|dollars?|sum)\s+raised\b/i },
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry)) continue;
      walk(full, out);
    } else if (s.isFile()) {
      if (!/\.(ts|tsx)$/.test(entry)) continue;
      if (SKIP_FILE_SUFFIXES.some((suf) => entry.endsWith(suf))) continue;
      out.push(full);
    }
  }
  return out;
}

describe("Doctrine guard — rendered-source scan", () => {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) {
    walk(join(ROOT, root), files);
  }

  it("scans at least the canonical route files", () => {
    const rels = files.map((f) => relative(ROOT, f).replace(/\\/g, "/"));
    for (const route of [
      "src/routes/index.tsx",
      "src/routes/nft.tsx",
      "src/routes/archive.tsx",
      "src/routes/chapters.tsx",
      "src/routes/members.tsx",
      "src/routes/founders.tsx",
      "src/routes/activity.tsx",
      "src/routes/transparency.tsx",
      "src/routes/whitepaper.tsx",
      "src/routes/registry.tsx",
    ]) {
      expect(rels, `expected ${route} in scan set`).toContain(route);
    }
  });

  for (const ban of BANNED) {
    it(`does not contain banned doctrine: "${ban.name}"`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        const rel = relative(ROOT, file).replace(/\\/g, "/");
        if (ALLOWED_FILES.has(rel)) continue;
        const src = readFileSync(file, "utf8");
        if (ban.re.test(src)) offenders.push(rel);
      }
      expect(
        offenders,
        `Banned legacy doctrine "${ban.name}" found in:\n  ${offenders.join("\n  ")}`,
      ).toEqual([]);
    });
  }

  it("treasury / routing / canonical chapter milestones remain allowed", () => {
    // Sanity: at least one file in the scan set should still contain each
    // valid milestone phrase — confirms we did NOT blindly delete them.
    const corpus = files.map((f) => readFileSync(f, "utf8")).join("\n");
    expect(corpus).toMatch(/First Member recorded/);
    expect(corpus).toMatch(/First \$100 routed/);
    expect(corpus).toMatch(/First \$1,000 routed/);
    expect(corpus).toMatch(/First \$10,000 routed/);
    expect(corpus).toMatch(/First LP event/);
    expect(corpus).toMatch(/Genesis Signal sealed at #333/);
    expect(corpus).toMatch(/First Thousand sealed at #1,000/);
    expect(corpus).toMatch(/The Expansion sealed at #3,333/);
  });
});

// ─── Docs doctrine guard ───────────────────────────────────────────────
//
// Scans CANONICAL docs (as classified in docs/DOCUMENTATION_AUTHORITY_MAP.md)
// for the same banned vocabulary. Historical / Deprecated / Operational docs
// are out of scope here — they keep pre-doctrine language for record and must
// carry a `Historical note:` warning header (the authority map enforces this
// classification by hand). The intent: a future contributor cannot quietly
// re-introduce obsolete cohort names into a canonical doctrine doc.

const CANONICAL_DOCS = [
  "docs/VISION.md",
  "docs/CONSTITUTION_SUMMARY.md",
  "docs/AAA_DECISION_LENSES.md",
  "docs/FOUNDER_MULTI_HAT_EVALUATION_FRAMEWORK.md",
  "docs/INFINITE_NARRATIVE_AUDIT.md",
  "docs/SCARCITY_STATUS_PERMANENCE_AUDIT.md",
  "docs/MYTHOLOGY_AND_COHORT_IDENTITY_AUDIT.md",
  "docs/ARCHITECTURE_PROPOSAL_AAA.md",
  "docs/TERMINOLOGY_GLOSSARY.md",
  "docs/PRE_CONTRACT_ALIGNMENT_AUDIT.md",
  "docs/STORY_ENGINE_AND_EMOTIONAL_OPERATING_SYSTEM.md",
  "docs/RANK_CONSTITUTIONAL_RULING.md",
  "docs/EMOTIONAL_ARCHITECTURE_AUDIT.md",
  "docs/PRODUCT_MEMORY_AND_FUTURE_LOOPS.md",
  "docs/SYNDICATE_PROTOCOL_MODEL.md",
  "docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md",
  "docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md",
  "docs/PROTOCOL_EVOLUTION_LAYER_ARCHITECTURE.md",
  "docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md",
  // ── Coupled to the Authority Map's CANONICAL class (2026-06-12, Batch 8) ──
  // Classified CANONICAL in docs/DOCUMENTATION_AUTHORITY_MAP.md but not
  // previously machine-scanned. Each was verified clean of DOC_BANNED before
  // wiring. The vocabulary-defining canon docs (01/03/04) are deliberately
  // EXEMPT below — they define the banned terms they govern.
  "docs/NORTH_STAR_SYSTEM.md",
  "docs/INFORMATION_HIERARCHY.md",
  "docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md",
  "docs/canon/00_AUTHORITY_MAP.md",
  "docs/canon/02_SOURCE_OF_TRUTH_TABLE.md",
  "docs/canon/05_FOUNDATION_FREEZE.md",
  "docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md",
  "docs/canon/07_FOUNDER_PRINCIPLE.md",
  "docs/canon/08_PROTOCOL_OPERATING_PRINCIPLE.md",
] as const;

// Vocabulary-defining canon docs: CANONICAL authority, but they necessarily
// NAME the banned terms they govern (e.g. the glossary lists "Relic" as deep-
// lore-only). Scanning them for banned vocabulary is self-defeating — the same
// reason protocol-language.ts is exempt from its own findForbiddenLanguage scan,
// and the Authority Map's "Superseded doctrines" table is not self-scanned. They
// stay authoritative and are drift-checked below (must remain CANONICAL-listed),
// so the exemption can never become a silent omission.
const VOCABULARY_DEFINING_DOCS = [
  "docs/canon/01_FOUNDER_INTENT_MAP.md",
  "docs/canon/03_GLOSSARY.md",
  "docs/canon/04_DOC_SYNC_CHECKLIST.md",
] as const;

const DOC_BANNED: Array<{ name: string; re: RegExp }> = [
  { name: "First 100 cohort",            re: /\bFirst 100\b/ },
  { name: "First 500 cohort",            re: /\bFirst 500\b/ },
  { name: "First 1000 cohort",           re: /\bFirst 1000\b/ },
  { name: "First 1,000 cohort",          re: /\bFirst 1,000\b/ },
  { name: "Genesis 10",                  re: /\bGenesis 10\b/ },
  { name: "Relic (public NFT language)", re: /\bRelic\b/ },
  { name: "Chapter I — The Beginning",   re: /Chapter I\s*[—·-]\s*The Beginning/i },
  { name: "Patron Seal at 9 USDC",       re: /\b9(?:\.00)?\s*USDC\b/ },
];

describe("Doctrine guard — canonical docs scan", () => {
  for (const doc of CANONICAL_DOCS) {
    const full = join(ROOT, doc);
    const src = readFileSync(full, "utf8");
    // Strip lines marked as anti-pattern examples (`**Wrong:`) so canonical
    // docs may quote a banned phrase while teaching it is banned.
    const sanitized = src
      .split("\n")
      .filter((line) => !/\*\*Wrong:/i.test(line))
      .join("\n");

    for (const ban of DOC_BANNED) {
      it(`${doc} does not contain "${ban.name}"`, () => {
        expect(
          ban.re.test(sanitized),
          `Canonical doc ${doc} contains banned doctrine "${ban.name}".`,
        ).toBe(false);
      });
    }
  }

  it("authority map lists every canonical doc", () => {
    const map = readFileSync(
      join(ROOT, "docs/DOCUMENTATION_AUTHORITY_MAP.md"),
      "utf8",
    );
    for (const doc of CANONICAL_DOCS) {
      expect(map, `${doc} missing from authority map`).toContain(doc);
    }
  });

  it("vocabulary-defining canon docs stay CANONICAL-listed (exempt, not dropped)", () => {
    // These are exempt from the banned-vocab scan above, but must remain
    // registered CANONICAL authority — the exemption is intentional, never a
    // silent omission. Asserting against the CANONICAL *section* (not the whole
    // file) closes the hole where reclassifying a doc to HISTORICAL/OPERATIONAL
    // would still leave it exempt-but-no-longer-canonical.
    const map = readFileSync(
      join(ROOT, "docs/DOCUMENTATION_AUTHORITY_MAP.md"),
      "utf8",
    );
    const start = map.indexOf("## CANONICAL");
    expect(start, "authority map has no ## CANONICAL section").toBeGreaterThan(
      -1,
    );
    const end = map.indexOf("\n## ", start + 1);
    const canonicalSection = map.slice(start, end === -1 ? undefined : end);
    for (const doc of VOCABULARY_DEFINING_DOCS) {
      expect(
        canonicalSection,
        `${doc} missing from the authority map's CANONICAL section`,
      ).toContain(doc);
    }
  });
});
