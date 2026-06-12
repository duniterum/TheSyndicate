// Protocol Lineage layer (Sprint 16) — the pure VISIBILITY projection of a
// fact's journey through the protocol intelligence pipeline:
//
//   Activity event → Signal → Memory candidate → Chronicle review candidate →
//   Promotion decision → Institutional Register entry → Chronicle admission →
//   Chronicle entry → Chronology position → Verified timestamp
//
// Doctrine under test (canon 05 §2.1, §4.5; Sprint 16 spec):
//   • Pure projection — it creates NO new intelligence. Each trail string the
//     terminal ChronologyEntry already carries becomes EXACTLY one typed node,
//     in trail order. The projection can neither invent nor drop a stage, and a
//     node's id is the trail string verbatim (identity is never altered).
//   • Read-only — deriveLineagePath never mutates the input entry and is
//     deterministic (same entry in → same path out); it carries no Story, no
//     Recognition, no publication, no narrative, no invented date.
//   • Honest completeness — held → coverage-limited → rpc-limited → partial →
//     complete, first match wins, so the projection never implies more certainty
//     than the source entry proved. A genesis fact that predates the scanner is
//     PARTIAL, not COMPLETE.
//   • Parity with the live trail — the register-and-up node ids reproduce the
//     real buildLineage() output (driven here through deriveInstitutionalRegister).

import { describe, expect, it } from "vitest";
import {
  COMPLETENESS_DESCRIPTION,
  COMPLETENESS_LABEL,
  STAGE_LABEL,
  classifyLineageId,
  deriveLineagePath,
  deriveLineagePaths,
  lineagePathsByEvent,
  lineagePathsByTxHash,
  resolveLineageCompleteness,
  type LineageCompleteness,
  type LineageLayer,
  type LineageNode,
  type LineagePath,
} from "../protocol-lineage";
import type { ChronologyEntry } from "../chronology-registry";
import { deriveInstitutionalRegister } from "../institutional-register";
import {
  BASELINE_REVIEWER,
  type ChroniclePromotionDecision,
} from "../chronicle-promotion-registry";
import { findForbiddenLanguage } from "../protocol-language";

// ── A complete, Activity-event-rooted pipeline trail (terminal → root) ───────
const PIPELINE_TRAIL = [
  "chronology:c1",
  "chronicle-entry:institutional-entry:e1",
  "chronicle-admission:institutional-entry:e1",
  "institutional-entry:e1",
  "promotion-decision:e1",
  "chronicle-candidate:cc1",
  "memory-candidate:mc1",
  "signal:s1",
  "event:p-0xabc-0",
  "tx:0xabc",
  "block:123",
] as const;

// ── A genesis trail: an institutional fact curated BEFORE the event scanner ───
const GENESIS_TRAIL = [
  "chronology:cg",
  "chronicle-entry:institutional-entry:genesis:deploy",
  "chronicle-admission:institutional-entry:genesis:deploy",
  "institutional-entry:genesis:deploy",
  "genesis-seed:deploy (curated, predates event scanner)",
  "genesis-fact:deploy",
  "tx:0xdead · block:1",
] as const;

// ── A genesis fact with NO transaction anchor at all (predates the scanner) ───
const GENESIS_HELD_TRAIL = [
  "chronology:cgh",
  "chronicle-entry:institutional-entry:genesis:doctrine",
  "chronicle-admission:institutional-entry:genesis:doctrine",
  "institutional-entry:genesis:doctrine",
  "genesis-seed:doctrine (curated, predates event scanner)",
  "genesis-fact:doctrine",
  "predates-scanner (no transaction anchor)",
] as const;

// ── A tx-only pipeline trail (existence proven, order not) ───────────────────
const TX_ONLY_TRAIL = [
  "chronology:ch",
  "chronicle-entry:institutional-entry:e2",
  "chronicle-admission:institutional-entry:e2",
  "institutional-entry:e2",
  "promotion-decision:e2",
  "chronicle-candidate:cc2",
  "memory-candidate:mc2",
  "signal:s2",
  "event:p-0xabc-1",
  "tx:0xabc",
] as const;

/** ChronologyEntry factory — defaults to a COMPLETE, ordered, verified entry. */
function chrono(p: Partial<ChronologyEntry> = {}): ChronologyEntry {
  return {
    chronologyId: "chronology:c1",
    sourceChronicleEntryId: "chronicle-entry:institutional-entry:e1",
    chronologyStatus: "ordered",
    chronologyType: "treasury",
    blockNumber: 123,
    blockTimestamp: 1_700_000_000,
    timestampStatus: "verified",
    timestampSource: "chain-rpc-getblock",
    timestampConfidence: "verified",
    timestampReason: "Read from verified chain metadata.",
    txHash: "0xabc",
    sequenceNumber: 1,
    chapter: null,
    milestone: null,
    chronologyAnchor: "block-number",
    chronologyConfidence: "verified",
    chronologyReason: "Anchored to a verified block height.",
    suspectedDuplicateOf: null,
    supersedes: null,
    lineage: [...PIPELINE_TRAIL],
    ...p,
  };
}

// ── ChroniclePromotionDecision factory (parity test) ─────────────────────────
function dec(
  p: Partial<ChroniclePromotionDecision> & {
    candidateId: string;
    decision: ChroniclePromotionDecision["decision"];
    register: ChroniclePromotionDecision["register"];
    category: ChroniclePromotionDecision["category"];
    ruleBucket: string;
  },
): ChroniclePromotionDecision {
  return {
    candidateId: p.candidateId,
    decision: p.decision,
    reviewer: p.reviewer ?? BASELINE_REVIEWER,
    rationale: p.rationale ?? "A protocol fact was recorded under a structural rule.",
    timestamp: p.timestamp ?? null,
    promotionPath: p.promotionPath ?? "institutional-memory",
    ruleBucket: p.ruleBucket,
    register: p.register,
    category: p.category,
    tier: p.tier ?? "S3",
    sourceMemoryCandidateId: p.sourceMemoryCandidateId ?? `mem-${p.candidateId}`,
    sourceSignalId: p.sourceSignalId ?? `sig-${p.candidateId}`,
    sourceEventId: p.sourceEventId ?? `evt-${p.candidateId}`,
    sourceTxHash: p.sourceTxHash ?? `0x${"a".repeat(64)}`,
    sourceBlock: p.sourceBlock ?? 4242n,
    rationaleViolations: p.rationaleViolations ?? [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe("classifyLineageId — deterministic prefix classification", () => {
  const cases: ReadonlyArray<[string, LineageLayer, string]> = [
    ["chronology:x", "chronology", "chronology"],
    ["chronicle-entry:x", "chronicle-entry", "chronicle-entry"],
    ["chronicle-admission:x", "chronicle-admission", "chronicle-admission-candidate"],
    ["chronicle-candidate:x", "chronicle-review", "chronicle-review-candidate"],
    ["institutional-entry:x", "institutional-register", "institutional-register-entry"],
    ["institutional-entry:genesis:x", "institutional-register", "institutional-register-entry-genesis"],
    ["promotion-decision:x", "promotion-decision", "promotion-decision"],
    ["genesis-seed:x (curated, predates event scanner)", "promotion-decision", "genesis-seed-sentinel"],
    ["memory-candidate:x", "memory-candidate", "memory-candidate"],
    ["signal:x", "signal", "signal"],
    ["event:x", "event", "activity-event"],
    ["genesis-fact:x", "event", "genesis-fact-sentinel"],
    ["tx:0xabc", "on-chain-anchor", "transaction-anchor"],
    ["tx:0xabc · block:1", "on-chain-anchor", "transaction-anchor"],
    ["block:1", "on-chain-anchor", "block-anchor"],
    ["contract:0xabc", "on-chain-anchor", "contract-anchor"],
    ["predates-scanner (no transaction anchor)", "on-chain-anchor", "no-anchor-predates-scanner"],
    ["mystery:x", "unknown", "unknown"],
  ];
  for (const [id, layer, sourceType] of cases) {
    it(`classifies "${id}" as ${layer} / ${sourceType}`, () => {
      const c = classifyLineageId(id);
      expect(c.layer).toBe(layer);
      expect(c.sourceType).toBe(sourceType);
    });
  }

  it("flags genesis sentinels and only those", () => {
    expect(classifyLineageId("genesis-seed:x").genesisSentinel).toBe(true);
    expect(classifyLineageId("genesis-fact:x").genesisSentinel).toBe(true);
    expect(classifyLineageId("institutional-entry:genesis:x").genesisSentinel).toBe(true);
    expect(classifyLineageId("predates-scanner (none)").genesisSentinel).toBe(true);
    expect(classifyLineageId("event:x").genesisSentinel).toBe(false);
    expect(classifyLineageId("institutional-entry:x").genesisSentinel).toBe(false);
    expect(classifyLineageId("tx:0xabc").genesisSentinel).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deriveLineagePath — identity & no invented stages", () => {
  it("projects EXACTLY one node per trail entry, in trail order, verbatim id", () => {
    const entry = chrono();
    const path = deriveLineagePath(entry);
    expect(path.nodes.length).toBe(entry.lineage.length);
    expect(path.nodes.map((n) => n.id)).toEqual([...entry.lineage]);
  });

  it("never produces an unknown layer for a well-formed pipeline trail", () => {
    const path = deriveLineagePath(chrono());
    expect(path.nodes.every((n) => n.layer !== "unknown")).toBe(true);
  });

  it("each node's sourceId points at the next trail entry toward the root", () => {
    const entry = chrono();
    const path = deriveLineagePath(entry);
    path.nodes.forEach((n, i) => {
      const expected = i + 1 < entry.lineage.length ? entry.lineage[i + 1] : null;
      expect(n.sourceId).toBe(expected);
    });
  });

  it("an unrecognised trail entry degrades the path to PARTIAL (defensive)", () => {
    const entry = chrono({ lineage: [...PIPELINE_TRAIL, "mystery:foo"] });
    const path = deriveLineagePath(entry);
    expect(path.nodes.some((n) => n.layer === "unknown")).toBe(true);
    expect(path.completenessStatus).toBe("partial");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deriveLineagePath — tx / block / timestamp preservation", () => {
  const entry = chrono();
  const path = deriveLineagePath(entry);
  const byLayer = (l: LineageLayer) => path.nodes.find((n) => n.layer === l) as LineageNode;

  it("the chronology node carries the entry's proven structured fields", () => {
    const c = byLayer("chronology");
    expect(c.txHash).toBe(entry.txHash);
    expect(c.block).toBe(entry.blockNumber);
    expect(c.timestamp).toBe(entry.blockTimestamp);
    expect(c.chronologyPosition).toBe(entry.sequenceNumber);
    expect(c.status).toBe(entry.chronologyStatus);
    expect(c.verificationStatus).toBe("verified");
  });

  it("the root Activity-event node carries the tx/block anchor", () => {
    const e = byLayer("event");
    expect(e.txHash).toBe(entry.txHash);
    expect(e.block).toBe(entry.blockNumber);
    expect(e.sourceType).toBe("activity-event");
    expect(e.status).toBe("root");
  });

  it("a date is carried ONLY on the chronology node", () => {
    for (const n of path.nodes) {
      if (n.layer !== "chronology") expect(n.timestamp).toBeNull();
    }
  });

  it("middle stages are honest id-only carried-through nodes", () => {
    const middles: LineageLayer[] = [
      "signal",
      "memory-candidate",
      "chronicle-review",
      "promotion-decision",
      "institutional-register",
      "chronicle-admission",
      "chronicle-entry",
    ];
    for (const l of middles) {
      const n = byLayer(l);
      expect(n.verificationStatus).toBe("carried-through");
      expect(n.txHash).toBeNull();
      expect(n.block).toBeNull();
      expect(n.timestamp).toBeNull();
      expect(n.chronologyPosition).toBeNull();
      expect(n.status).toBeNull();
    }
  });

  it("path-level lookup keys mirror the entry", () => {
    expect(path.chronologyId).toBe(entry.chronologyId);
    expect(path.sourceChronicleEntryId).toBe(entry.sourceChronicleEntryId);
    expect(path.sourceEventId).toBe("event:p-0xabc-0");
    expect(path.sourceTxHash).toBe(entry.txHash);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deriveLineagePath — current & highest-verified stage", () => {
  it("the current stage is always the chronology layer (the terminal object)", () => {
    expect(deriveLineagePath(chrono()).currentStage).toBe("chronology");
    expect(deriveLineagePath(chrono({ lineage: [...GENESIS_TRAIL] })).currentStage).toBe(
      "chronology",
    );
  });

  it("an ordered, verified entry is proven all the way to the chronology stage", () => {
    expect(deriveLineagePath(chrono()).highestVerifiedStage).toBe("chronology");
  });

  it("a tx-only held entry proves the event but not the chronology order", () => {
    const path = deriveLineagePath(
      chrono({
        chronologyId: "chronology:ch",
        chronologyStatus: "held-no-anchor",
        chronologyConfidence: "held",
        chronologyAnchor: "tx",
        blockNumber: null,
        blockTimestamp: null,
        timestampStatus: "not-applicable",
        timestampConfidence: "held",
        sequenceNumber: null,
        lineage: [...TX_ONLY_TRAIL],
      }),
    );
    expect(path.highestVerifiedStage).toBe("event");
  });

  it("a held genesis fact with no anchor proves no stage on-chain", () => {
    const path = deriveLineagePath(
      chrono({
        chronologyId: "chronology:cgh",
        sourceChronicleEntryId: "chronicle-entry:institutional-entry:genesis:doctrine",
        chronologyStatus: "held-no-anchor",
        chronologyConfidence: "held",
        chronologyAnchor: "none",
        blockNumber: null,
        blockTimestamp: null,
        timestampStatus: "not-applicable",
        timestampConfidence: "held",
        txHash: null,
        sequenceNumber: null,
        lineage: [...GENESIS_HELD_TRAIL],
      }),
    );
    expect(path.highestVerifiedStage).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deriveLineagePath — genesis vs pipeline origin", () => {
  it("a pipeline path roots at an Activity event", () => {
    const path = deriveLineagePath(chrono());
    const event = path.nodes.find((n) => n.layer === "event") as LineageNode;
    expect(event.sourceType).toBe("activity-event");
    expect(path.sourceEventId?.startsWith("event:")).toBe(true);
  });

  it("a genesis path roots at a genesis-fact sentinel, never an Activity event", () => {
    const path = deriveLineagePath(
      chrono({
        chronologyId: "chronology:cg",
        sourceChronicleEntryId: "chronicle-entry:institutional-entry:genesis:deploy",
        blockNumber: 1,
        txHash: "0xdead",
        lineage: [...GENESIS_TRAIL],
      }),
    );
    const event = path.nodes.find((n) => n.layer === "event") as LineageNode;
    expect(event.sourceType).toBe("genesis-fact-sentinel");
    expect(path.sourceEventId?.startsWith("genesis-fact:")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("resolveLineageCompleteness — precedence matrix (never imply certainty)", () => {
  it("COMPLETE — a full Activity-event-rooted, ordered, verified chain", () => {
    expect(deriveLineagePath(chrono()).completenessStatus).toBe("complete");
  });

  it("COMPLETE — pending timestamp does NOT degrade completeness (order is known)", () => {
    const path = deriveLineagePath(
      chrono({ timestampStatus: "pending", blockTimestamp: null, timestampConfidence: "held" }),
    );
    expect(path.completenessStatus).toBe("complete");
  });

  it("PARTIAL — a genesis fact that predates the scanner", () => {
    const path = deriveLineagePath(
      chrono({
        chronologyId: "chronology:cg",
        sourceChronicleEntryId: "chronicle-entry:institutional-entry:genesis:deploy",
        blockNumber: 1,
        txHash: "0xdead",
        lineage: [...GENESIS_TRAIL],
      }),
    );
    expect(path.completenessStatus).toBe("partial");
  });

  it("RPC-LIMITED — ordered, but the verified-timestamp lookup errored", () => {
    const path = deriveLineagePath(
      chrono({ timestampStatus: "error", blockTimestamp: null, timestampConfidence: "held" }),
    );
    expect(path.completenessStatus).toBe("rpc-limited");
  });

  it("RPC-LIMITED — ordered, but the verified-timestamp lookup was unavailable", () => {
    const path = deriveLineagePath(
      chrono({ timestampStatus: "unavailable", blockTimestamp: null, timestampConfidence: "held" }),
    );
    expect(path.completenessStatus).toBe("rpc-limited");
  });

  it("COVERAGE-LIMITED — a withheld block anchor (takes precedence over rpc-limited)", () => {
    const path = deriveLineagePath(
      chrono({
        chronologyStatus: "coverage-limited",
        sequenceNumber: null,
        timestampStatus: "error",
        blockTimestamp: null,
        timestampConfidence: "held",
        supersedes: "chronicle-entry:institutional-entry:e0",
      }),
    );
    expect(path.completenessStatus).toBe("coverage-limited");
  });

  it("HELD — a held position (takes precedence over a genesis origin)", () => {
    const path = deriveLineagePath(
      chrono({
        chronologyId: "chronology:cgh",
        sourceChronicleEntryId: "chronicle-entry:institutional-entry:genesis:doctrine",
        chronologyStatus: "held-no-anchor",
        chronologyConfidence: "held",
        chronologyAnchor: "none",
        blockNumber: null,
        blockTimestamp: null,
        timestampStatus: "not-applicable",
        timestampConfidence: "held",
        txHash: null,
        sequenceNumber: null,
        lineage: [...GENESIS_HELD_TRAIL],
      }),
    );
    expect(path.completenessStatus).toBe("held");
  });

  it("resolveLineageCompleteness is consistent with deriveLineagePath", () => {
    const entry = chrono();
    const path = deriveLineagePath(entry);
    expect(resolveLineageCompleteness(entry, path.nodes)).toBe(path.completenessStatus);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deriveLineagePath — purity & read-only", () => {
  it("never mutates the input entry", () => {
    const entry = chrono();
    const snapshot = JSON.parse(JSON.stringify(entry));
    deriveLineagePath(entry);
    expect(JSON.parse(JSON.stringify(entry))).toEqual(snapshot);
  });

  it("is deterministic — same entry in, deep-equal path out", () => {
    const entry = chrono();
    expect(deriveLineagePath(entry)).toEqual(deriveLineagePath(entry));
  });

  it("survives a JSON round-trip (no bigint, Map, or function leaks)", () => {
    const path = deriveLineagePath(chrono());
    expect(JSON.parse(JSON.stringify(path))).toEqual(path);
  });

  it("carries no Story / Recognition / publication fields", () => {
    const path = deriveLineagePath(chrono());
    expect(Object.keys(path).sort()).toEqual(
      [
        "chronologyId",
        "completenessStatus",
        "currentStage",
        "highestVerifiedStage",
        "nodes",
        "sourceChronicleEntryId",
        "sourceEventId",
        "sourceTxHash",
      ].sort(),
    );
    for (const n of path.nodes) {
      expect(Object.keys(n).sort()).toEqual(
        [
          "block",
          "chronologyPosition",
          "id",
          "layer",
          "lineageReason",
          "sourceId",
          "sourceType",
          "status",
          "timestamp",
          "txHash",
          "verificationStatus",
        ].sort(),
      );
    }
    const blob = JSON.stringify(path).toLowerCase();
    for (const banned of ["recognition", "\"story\"", "published", "narrative", "score"]) {
      expect(blob.includes(banned)).toBe(false);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deriveLineagePath — parity with the live buildLineage() trail", () => {
  it("reproduces the real register-and-up trail verbatim", () => {
    const decision = dec({
      candidateId: "cc-parity",
      decision: "approved",
      register: "protocol-institutional",
      category: "milestone",
      ruleBucket: "protocol milestone",
      sourceMemoryCandidateId: "mc-parity",
      sourceSignalId: "sig-parity",
      sourceEventId: "p-0xfeed-0",
      sourceTxHash: "0xfeed",
      sourceBlock: 9001n,
    });
    const [registerEntry] = deriveInstitutionalRegister([decision]);
    expect(registerEntry).toBeDefined();
    const realTrail = [...registerEntry.lineage];
    // The real buildLineage() trail must start at the institutional-entry node and
    // thread promotion → review → memory → signal → event → tx → block.
    expect(realTrail[0].startsWith("institutional-entry:")).toBe(true);
    expect(realTrail.length).toBeGreaterThanOrEqual(6);

    // Embed that real trail as the SUFFIX of a chronology entry, exactly as the
    // forward layers do, then project and confirm the projection reproduces it.
    const entry = chrono({
      chronologyId: "chronology:cp",
      sourceChronicleEntryId: `chronicle-entry:${realTrail[0]}`,
      txHash: "0xfeed",
      blockNumber: 9001,
      lineage: [
        "chronology:cp",
        `chronicle-entry:${realTrail[0]}`,
        `chronicle-admission:${realTrail[0]}`,
        ...realTrail,
      ],
    });
    const ids = deriveLineagePath(entry).nodes.map((n) => n.id);
    const start = ids.indexOf(realTrail[0]);
    expect(start).toBeGreaterThan(-1);
    expect(ids.slice(start)).toEqual(realTrail);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deriveLineagePaths & lookup indexes", () => {
  const entries = [
    chrono(),
    chrono({
      chronologyId: "chronology:cg",
      sourceChronicleEntryId: "chronicle-entry:institutional-entry:genesis:deploy",
      blockNumber: 1,
      txHash: "0xdead",
      lineage: [...GENESIS_TRAIL],
    }),
    chrono({
      chronologyId: "chronology:cgh",
      sourceChronicleEntryId: "chronicle-entry:institutional-entry:genesis:doctrine",
      chronologyStatus: "held-no-anchor",
      chronologyConfidence: "held",
      chronologyAnchor: "none",
      blockNumber: null,
      blockTimestamp: null,
      timestampStatus: "not-applicable",
      timestampConfidence: "held",
      txHash: null,
      sequenceNumber: null,
      lineage: [...GENESIS_HELD_TRAIL],
    }),
  ];
  const paths = deriveLineagePaths(entries);

  it("preserves input order, one path per entry", () => {
    expect(paths.length).toBe(entries.length);
    expect(paths.map((p) => p.chronologyId)).toEqual(entries.map((e) => e.chronologyId));
  });

  it("indexes by root event id (pipeline event + genesis-fact sentinel)", () => {
    const byEvent = lineagePathsByEvent(paths);
    expect(byEvent.get("event:p-0xabc-0")?.chronologyId).toBe("chronology:c1");
    expect(byEvent.get("genesis-fact:deploy")?.chronologyId).toBe("chronology:cg");
    expect(byEvent.get("genesis-fact:doctrine")?.chronologyId).toBe("chronology:cgh");
  });

  it("indexes by tx hash, skipping entries that carry no transaction", () => {
    const byTx = lineagePathsByTxHash(paths);
    expect(byTx.get("0xabc")?.chronologyId).toBe("chronology:c1");
    expect(byTx.get("0xdead")?.chronologyId).toBe("chronology:cg");
    // The held genesis fact carries no tx, so it is absent from the tx index.
    expect([...byTx.values()].some((p) => p.chronologyId === "chronology:cgh")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("display vocabulary — complete and guard-clean copy", () => {
  const ALL_LAYERS: LineageLayer[] = [
    "event",
    "signal",
    "memory-candidate",
    "chronicle-review",
    "promotion-decision",
    "institutional-register",
    "chronicle-admission",
    "chronicle-entry",
    "chronology",
    "on-chain-anchor",
    "unknown",
  ];
  const ALL_COMPLETENESS: LineageCompleteness[] = [
    "complete",
    "partial",
    "held",
    "coverage-limited",
    "rpc-limited",
  ];

  it("every layer has a stage label", () => {
    for (const l of ALL_LAYERS) expect(typeof STAGE_LABEL[l]).toBe("string");
  });

  it("every completeness state has a label and a description", () => {
    for (const c of ALL_COMPLETENESS) {
      expect(typeof COMPLETENESS_LABEL[c]).toBe("string");
      expect(typeof COMPLETENESS_DESCRIPTION[c]).toBe("string");
    }
  });

  it("all display copy and per-node reasons are free of forbidden language", () => {
    const copy: string[] = [
      ...Object.values(STAGE_LABEL),
      ...Object.values(COMPLETENESS_LABEL),
      ...Object.values(COMPLETENESS_DESCRIPTION),
    ];
    const sampleEntries: ChronologyEntry[] = [
      chrono(),
      chrono({ lineage: [...GENESIS_TRAIL], blockNumber: 1, txHash: "0xdead" }),
      chrono({
        chronologyStatus: "held-no-anchor",
        chronologyConfidence: "held",
        blockNumber: null,
        txHash: null,
        sequenceNumber: null,
        timestampStatus: "not-applicable",
        lineage: [...GENESIS_HELD_TRAIL],
      }),
      chrono({ lineage: [...TX_ONLY_TRAIL], blockNumber: null }),
    ];
    for (const e of sampleEntries) {
      for (const n of deriveLineagePath(e).nodes) copy.push(n.lineageReason);
    }
    for (const text of copy) {
      expect(findForbiddenLanguage(text), `forbidden language in: ${text}`).toEqual([]);
    }
  });
});
