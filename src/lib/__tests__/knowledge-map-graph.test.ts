// src/lib/__tests__/knowledge-map-graph.test.ts
// Guard test for the PUBLIC Protocol Knowledge Map graph (Sprint 11):
//   • the registry's 3-way knowledge-kind grouping (src/lib/protocol-knowledge-map.ts)
//   • the public route (src/routes/knowledge-map.tsx) — proven by SOURCE SCAN, since
//     this repo has no component-render test infra.
//
// What it proves:
//   • every graph node is a registry layer (the route renders FROM the registry)
//   • the 3 buckets partition every layer exactly once; each bucket is non-empty
//   • reserved systems are clearly labeled (reserved bucket = reserved status/permanence)
//   • the anti-fragmentation rules render from registry DATA and stay aligned with doc 09
//   • every PUBLIC surface referenced resolves to a real route file
//   • internal /labs surfaces stay internal (the route never reads internalSurfaces)
//   • no Story / Recognition / Member-Register module is imported into the route
//   • no banned investment language appears in the route source

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  PROTOCOL_LAYERS,
  KNOWLEDGE_KIND_ORDER,
  KNOWLEDGE_KIND_LABELS,
  ANTI_FRAGMENTATION_RULES,
  knowledgeKindOf,
  layersByKnowledgeKind,
} from "../protocol-knowledge-map";

const ROOT = process.cwd();
const ROUTE_FILE = "src/routes/knowledge-map.tsx";
const DOC_FILE = "docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md";

const routeSrc = readFileSync(resolve(ROOT, ROUTE_FILE), "utf8");
const docText = readFileSync(resolve(ROOT, DOC_FILE), "utf8");

const normalize = (s: string): string =>
  s
    .replace(/\/\//g, " ")
    .toLowerCase()
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** "/labs/signals" → "labs.signals.tsx"; "/wallet/$address" → "wallet.$address.tsx". */
function routeFileExists(route: string): boolean {
  const trimmed = route.replace(/^\//, "");
  const file = trimmed === "" ? "index.tsx" : `${trimmed.replace(/\//g, ".")}.tsx`;
  return existsSync(resolve(ROOT, `src/routes/${file}`));
}

/** Extract every module path imported by the route file. */
function importPaths(src: string): string[] {
  const out: string[] = [];
  const re = /import[^"']*from\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out.push(m[1]);
  return out;
}

describe("knowledge-map graph: knowledge-kind grouping", () => {
  it("maps every layer to a kind in KNOWLEDGE_KIND_ORDER", () => {
    for (const l of PROTOCOL_LAYERS) {
      expect(KNOWLEDGE_KIND_ORDER).toContain(knowledgeKindOf(l));
    }
  });

  it("partitions every layer into exactly one bucket (no drop, no duplicate)", () => {
    const grouped = KNOWLEDGE_KIND_ORDER.flatMap((k) => layersByKnowledgeKind(k));
    expect(grouped.length).toBe(PROTOCOL_LAYERS.length);
    const ids = grouped.map((l) => l.id).sort();
    expect(new Set(ids).size).toBe(ids.length); // unique
    expect(ids).toEqual(PROTOCOL_LAYERS.map((l) => l.id).sort()); // same set
  });

  it("every bucket is non-empty and has a label with title + blurb", () => {
    for (const kind of KNOWLEDGE_KIND_ORDER) {
      expect(layersByKnowledgeKind(kind).length).toBeGreaterThan(0);
      const label = KNOWLEDGE_KIND_LABELS[kind];
      expect(label.title.length).toBeGreaterThan(0);
      expect(label.blurb.length).toBeGreaterThan(0);
    }
  });

  it("reserved bucket only holds reserved layers, and is clearly labeled", () => {
    for (const l of layersByKnowledgeKind("reserved")) {
      expect(l.status === "reserved" || l.permanence === "reserved").toBe(true);
    }
    expect(KNOWLEDGE_KIND_LABELS.reserved.title).toMatch(/reserved/i);
  });

  it("durable-overlay bucket only holds append-only-curated layers", () => {
    for (const l of layersByKnowledgeKind("durable-overlay")) {
      expect(l.permanence).toBe("append-only-curated");
    }
    expect(layersByKnowledgeKind("durable-overlay").length).toBeGreaterThanOrEqual(2);
  });

  it("live-projection bucket excludes reserved + durable layers", () => {
    for (const l of layersByKnowledgeKind("live-projection")) {
      expect(l.status).not.toBe("reserved");
      expect(l.permanence).not.toBe("reserved");
      expect(l.permanence).not.toBe("append-only-curated");
    }
  });
});

describe("knowledge-map graph: anti-fragmentation rules", () => {
  it("has exactly the three numbered rules", () => {
    expect(ANTI_FRAGMENTATION_RULES.map((r) => r.n)).toEqual([1, 2, 3]);
  });

  it("each rule has a non-empty title and statement", () => {
    for (const r of ANTI_FRAGMENTATION_RULES) {
      expect(r.title.trim().length).toBeGreaterThan(0);
      expect(r.statement.trim().length).toBeGreaterThan(0);
    }
  });

  it("each rule statement stays aligned with doc 09", () => {
    const doc = normalize(docText);
    for (const r of ANTI_FRAGMENTATION_RULES) {
      // Each statement opens with the rule's operative clause; assert the leading
      // clause (up to the first sentence break) survives in the doc.
      const lead = normalize(r.statement.split(/[.(]/)[0]);
      expect(doc.includes(lead), `doc 09 missing rule ${r.n} clause: "${lead}"`).toBe(true);
    }
  });
});

describe("knowledge-map graph: public route source", () => {
  it("renders from the registry, not hardcoded nodes", () => {
    expect(routeSrc).toContain('from "@/lib/protocol-knowledge-map"');
    expect(routeSrc).toContain("layersByKnowledgeKind");
    expect(routeSrc).toContain("KNOWLEDGE_KIND_ORDER");
  });

  it("renders the rules FROM registry data (no duplicated prose)", () => {
    expect(routeSrc).toContain("ANTI_FRAGMENTATION_RULES");
    // The full rule statements live in the registry, not inline in the route.
    const route = normalize(routeSrc);
    for (const r of ANTI_FRAGMENTATION_RULES) {
      expect(route.includes(normalize(r.statement))).toBe(false);
    }
  });

  it("keeps internal /labs surfaces internal (never reads internalSurfaces)", () => {
    expect(routeSrc).not.toContain("internalSurfaces");
  });

  it("every public surface referenced resolves to a real route file", () => {
    const surfaces = new Set(PROTOCOL_LAYERS.flatMap((l) => l.publicSurfaces));
    for (const s of surfaces) {
      expect(routeFileExists(s), `missing route file for public surface: ${s}`).toBe(true);
    }
  });

  it("introduces no Story / Recognition / Member-Register module", () => {
    for (const p of importPaths(routeSrc)) {
      expect(/story|recognition|member.?register/i.test(p), `forbidden import: ${p}`).toBe(false);
    }
  });

  it("contains no banned investment language", () => {
    const banned = /\b(roi|dividend|guaranteed|profit|yield|apy|apr)\b/i;
    expect(banned.test(routeSrc)).toBe(false);
  });
});
