// src/lib/__tests__/protocol-knowledge-map.test.ts
// Guard test for the PROTOCOL KNOWLEDGE MAP (src/lib/protocol-knowledge-map.ts).
//
// Keeps the map HONEST over time. Mirrors the doctrine-guard (fs existence) and
// signal-adjacency (import-line scan) styles:
//   • every cited file/doc/registry exists on disk
//   • every surface resolves to a real route file
//   • ids unique; core fields nonempty; enums valid
//   • a non-live status MUST carry a statusNote that CITES an evidencing .ts file
//   • a member-living-reserved layer MUST be reserved + surface-free
//   • the leaf imports nothing (sits outside the Adjacency Law)
//   • the canon doc names every layer id, and canon 00 indexes the doc
//
// The guard catches dead paths and structural drift; it cannot catch a stale
// human-asserted status — which is why each statusNote must cite its evidence.

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  PROTOCOL_LAYERS,
  PROTOCOL_LAYER_IDS,
  CLUSTER_ORDER,
  KNOWLEDGE_FACT_LIFECYCLE,
  type ProtocolLayer,
} from "../protocol-knowledge-map";

const ROOT = process.cwd();
const MAP_FILE = "src/lib/protocol-knowledge-map.ts";
const DOC_FILE = "docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md";
const AUTHORITY_MAP = "docs/canon/00_AUTHORITY_MAP.md";

const PERMANENCE = new Set([
  "onchain-permanent",
  "append-only-curated",
  "recomputed-projection",
  "local-cache",
  "reserved",
]);
const COVERAGE = new Set([
  "deployment-anchored",
  "bounded-window",
  "config-pinned",
  "derived",
  "none",
]);
const STATUS = new Set(["live", "partial", "mock-quarantined", "reserved"]);
const POSTURE = new Set([
  "identity-free",
  "member-derived",
  "member-living-reserved",
]);

function exists(rel: string): boolean {
  return existsSync(resolve(ROOT, rel));
}

/** "/labs/signals" → "labs.signals.tsx"; "/wallet/$address" → "wallet.$address.tsx". */
function routeFileExists(route: string): boolean {
  const trimmed = route.replace(/^\//, "");
  const file = trimmed === "" ? "index.tsx" : `${trimmed.replace(/\//g, ".")}.tsx`;
  return exists(`src/routes/${file}`);
}

describe("protocol-knowledge-map: structural integrity", () => {
  it("has a non-trivial set of layers", () => {
    expect(PROTOCOL_LAYERS.length).toBeGreaterThanOrEqual(12);
  });

  it("has unique layer ids", () => {
    const ids = PROTOCOL_LAYERS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every layer sits in a known cluster", () => {
    for (const l of PROTOCOL_LAYERS) {
      expect(CLUSTER_ORDER).toContain(l.cluster);
    }
  });

  it("core string fields are nonempty and enums are valid", () => {
    for (const l of PROTOCOL_LAYERS) {
      const why = `layer ${l.id}`;
      expect(l.id.trim().length, why).toBeGreaterThan(0);
      expect(l.name.trim().length, why).toBeGreaterThan(0);
      expect(l.purpose.trim().length, why).toBeGreaterThan(0);
      expect(l.sourceOfTruth.description.trim().length, why).toBeGreaterThan(0);
      expect(l.sourceOfTruth.homeFiles.length, why).toBeGreaterThan(0);
      expect(PERMANENCE.has(l.permanence), `${why} permanence`).toBe(true);
      expect(COVERAGE.has(l.coverageModel), `${why} coverage`).toBe(true);
      expect(STATUS.has(l.status), `${why} status`).toBe(true);
      expect(POSTURE.has(l.identityPosture), `${why} posture`).toBe(true);
      // promotionPath is string | null; when present it must be meaningful.
      if (l.promotionPath !== null) {
        expect(l.promotionPath.trim().length, `${why} promotionPath`).toBeGreaterThan(0);
      }
    }
  });
});

describe("protocol-knowledge-map: every cited path exists", () => {
  it("home files exist on disk", () => {
    for (const l of PROTOCOL_LAYERS) {
      for (const f of l.sourceOfTruth.homeFiles) {
        expect(exists(f), `${l.id} homeFile ${f}`).toBe(true);
      }
    }
  });

  it("indexed canon docs and registries exist on disk", () => {
    for (const l of PROTOCOL_LAYERS) {
      for (const d of l.indexes.canonDocs) {
        expect(exists(d), `${l.id} canonDoc ${d}`).toBe(true);
      }
      for (const r of l.indexes.registries) {
        expect(exists(r), `${l.id} registry ${r}`).toBe(true);
      }
    }
  });

  it("every public and internal surface resolves to a route file", () => {
    for (const l of PROTOCOL_LAYERS) {
      for (const s of [...l.publicSurfaces, ...l.internalSurfaces]) {
        expect(routeFileExists(s), `${l.id} surface ${s}`).toBe(true);
      }
    }
  });
});

describe("protocol-knowledge-map: doctrine invariants", () => {
  it("non-live status carries a statusNote that cites an evidencing file", () => {
    for (const l of PROTOCOL_LAYERS) {
      if (l.status !== "live") {
        expect(l.statusNote, `${l.id} needs a statusNote`).toBeTruthy();
        expect(
          /\.ts\b/.test(l.statusNote ?? ""),
          `${l.id} statusNote must cite a .ts file`,
        ).toBe(true);
      }
    }
  });

  it("any statusNote present cites an evidencing file", () => {
    for (const l of PROTOCOL_LAYERS) {
      if (l.statusNote !== null) {
        expect(/\.ts\b/.test(l.statusNote), `${l.id} statusNote evidence`).toBe(true);
      }
    }
  });

  it("member-living-reserved layers are reserved and surface-free", () => {
    for (const l of PROTOCOL_LAYERS) {
      if (l.identityPosture === "member-living-reserved") {
        expect(l.status, `${l.id} must be reserved`).toBe("reserved");
        expect(l.publicSurfaces.length, `${l.id} no public surface`).toBe(0);
        expect(l.internalSurfaces.length, `${l.id} no internal surface`).toBe(0);
      }
    }
  });

  it("every non-reserved layer is inspectable on at least one surface", () => {
    for (const l of PROTOCOL_LAYERS) {
      if (l.status !== "reserved") {
        const total = l.publicSurfaces.length + l.internalSurfaces.length;
        expect(total, `${l.id} must have a surface`).toBeGreaterThan(0);
      }
    }
  });

  it("models source policy and lifecycle proof as knowledge homes without public activation authority", () => {
    const sourcePolicy = PROTOCOL_LAYERS.find((l) => l.id === "source-policy");
    const lifecycleProof = PROTOCOL_LAYERS.find((l) => l.id === "protocol-lifecycle-proof");
    const register = PROTOCOL_LAYERS.find((l) => l.id === "institutional-register");

    expect(sourcePolicy).toBeTruthy();
    expect(sourcePolicy?.cluster).toBe("source-attribution");
    expect(sourcePolicy?.status).toBe("partial");
    expect(sourcePolicy?.promotionPath).toContain("protocol lifecycle proof");
    expect(sourcePolicy?.promotionPath).toContain("public referral remains a separate product decision");
    expect(sourcePolicy?.statusNote).toContain("public referral");
    expect(sourcePolicy?.statusNote).toContain("remain inactive");
    expect(sourcePolicy?.sourceOfTruth.homeFiles).toContain("src/lib/source-policy-observability.ts");
    expect(sourcePolicy?.sourceOfTruth.homeFiles).toContain("src/lib/source-real-condition-test.ts");

    expect(lifecycleProof).toBeTruthy();
    expect(lifecycleProof?.status).toBe("live");
    expect(lifecycleProof?.promotionPath).toContain("Institutional Register seed");
    expect(lifecycleProof?.promotionPath).toContain("Chronicle admission remains review-only");
    expect(lifecycleProof?.promotionPath).toContain("public product activation requires separate approval");
    expect(lifecycleProof?.sourceOfTruth.homeFiles).toContain("src/lib/protocol-lifecycle.ts");

    expect(register?.sourceOfTruth.homeFiles).toContain(
      "src/lib/institutional-register-lifecycle.ts",
    );
  });
});

describe("protocol-knowledge-map: fact lifecycle", () => {
  it("keeps the lifecycle ordered and complete", () => {
    const ids = KNOWLEDGE_FACT_LIFECYCLE.map((stage) => stage.id);

    expect(ids).toEqual([
      "raw-event",
      "readback",
      "proof",
      "register-memory",
      "chronicle-review",
      "public-product",
    ]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(KNOWLEDGE_FACT_LIFECYCLE.map((stage) => stage.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("prevents proof, memory, or Chronicle from implying product launch", () => {
    const proof = KNOWLEDGE_FACT_LIFECYCLE.find((stage) => stage.id === "proof");
    const register = KNOWLEDGE_FACT_LIFECYCLE.find((stage) => stage.id === "register-memory");
    const chronicle = KNOWLEDGE_FACT_LIFECYCLE.find((stage) => stage.id === "chronicle-review");
    const product = KNOWLEDGE_FACT_LIFECYCLE.find((stage) => stage.id === "public-product");

    expect(proof?.notAuthorityFor).toMatch(/public launch/i);
    expect(proof?.notAuthorityFor).toContain("claim UI");
    expect(proof?.notAuthorityFor).toContain("source dashboard");
    expect(register?.notAuthorityFor).toContain("public product activation");
    expect(chronicle?.notAuthorityFor).toContain("product launch");
    expect(product?.belongsIn).toContain("founder approval gates");
    expect(product?.belongsIn).toContain("verified-introduction-v1-execution");
    expect(product?.belongsIn).toContain("verified-introduction-v1-release-qa");
    expect(product?.notAuthorityFor).toContain("direction approval");
    expect(product?.notAuthorityFor).toContain("framework text");
  });
});

describe("protocol-knowledge-map: purity (outside the Adjacency Law)", () => {
  it("the registry leaf has zero value imports", () => {
    const src = readFileSync(resolve(ROOT, MAP_FILE), "utf8");
    const valueImports = src
      .split("\n")
      .filter((line) => /^\s*import\s+(?!type\b)/.test(line));
    expect(valueImports).toEqual([]);
  });
});

describe("protocol-knowledge-map: doc/code cross-check", () => {
  it("the canon doc names every layer id", () => {
    expect(exists(DOC_FILE)).toBe(true);
    const doc = readFileSync(resolve(ROOT, DOC_FILE), "utf8");
    for (const id of PROTOCOL_LAYER_IDS) {
      expect(doc.includes(id), `doc must name layer id "${id}"`).toBe(true);
    }
  });

  it("the canon doc declares the code registry as its source of truth", () => {
    const doc = readFileSync(resolve(ROOT, DOC_FILE), "utf8");
    expect(doc.includes(MAP_FILE)).toBe(true);
  });

  it("canon 00 indexes the knowledge-map doc", () => {
    const authority = readFileSync(resolve(ROOT, AUTHORITY_MAP), "utf8");
    expect(authority.includes("09_PROTOCOL_KNOWLEDGE_MAP.md")).toBe(true);
  });
});

// The 3 anti-fragmentation rules are stated in BOTH the registry header (a JS
// comment) and doc 09. They are the doctrine the map enforces, so the two copies
// must not drift apart. We normalize away case, JS comment markers (`//`), markdown
// emphasis, and whitespace/line-wraps, then assert each rule fragment survives in
// both texts. Editing a rule in one file but not the other fails this gate. This is
// a substring presence check, not a semantic one — it closes the duplication seam
// (per the Sprint 10 report) without forcing byte-identical prose.
const normalizeDoctrine = (s: string): string =>
  s
    .replace(/\/\//g, " ") // strip JS line-comment markers (registry header)
    .toLowerCase()
    .replace(/[*_`]/g, "") // strip markdown emphasis
    .replace(/\s+/g, " ") // collapse line-wraps + indentation
    .trim();

const RULE_FRAGMENTS: ReadonlyArray<{ rule: string; fragment: string }> = [
  { rule: "1 · one home", fragment: "one canonical home per fact" },
  {
    rule: "1 · reference not copy",
    fragment: "every other layer references it; nothing keeps a second copy",
  },
  { rule: "2 · assertion + anchor", fragment: "assertion + anchor" },
  { rule: "2 · never a live value", fragment: "never a live value" },
  {
    rule: "3 · promotion or seed",
    fragment:
      "a fact enters durable memory only by promotion (lineage-covered) or by seed (a discrete config anchor)",
  },
  { rule: "3 · otherwise held", fragment: "otherwise it is held" },
];

describe("protocol-knowledge-map: doc ↔ registry rule alignment", () => {
  const registryText = normalizeDoctrine(readFileSync(resolve(ROOT, MAP_FILE), "utf8"));
  const docText = normalizeDoctrine(readFileSync(resolve(ROOT, DOC_FILE), "utf8"));

  for (const { rule, fragment } of RULE_FRAGMENTS) {
    it(`registry header carries rule ${rule}`, () => {
      expect(registryText.includes(fragment), `registry missing rule fragment: "${fragment}"`).toBe(
        true,
      );
    });
    it(`doc 09 carries rule ${rule}`, () => {
      expect(docText.includes(fragment), `doc 09 missing rule fragment: "${fragment}"`).toBe(true);
    });
  }
});

// Type-only reference so the ProtocolLayer import is exercised by the compiler.
const _typecheck: ProtocolLayer | undefined = PROTOCOL_LAYERS[0];
void _typecheck;
