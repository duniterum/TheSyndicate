// Adjacency-Law guard for the Signals Engine (canon 05 §2.1).
//
// Founder ruling: SIGNALS read EVENTS only. The legal edge is
//   EVENT → SIGNAL → (downstream) RECOGNITION / CHRONICLE
// There is NO MEMORY → SIGNAL carve-out. This test FAILS if the signal modules
// ever import the Memory / Recognition / prestige layers, which would let
// remembered or money-weighted facts flow back into a Signal.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const LIB = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(LIB, rel), "utf8");

const SIGNAL_MODULES = ["signal-registry.ts", "protocol-signals.ts"];

// Modules a Signal must NEVER read from (Memory / Recognition / prestige). The
// Memory Candidate layer is downstream of Signals (SIGNAL → MEMORY), so a Signal
// importing it would invert the legal edge.
const FORBIDDEN_IMPORTS = [
  "chronicle-entries",
  "chronicle-candidates",
  "recognition-candidates",
  "protocol-memory",
  "protocol-ledger",
  "leaderboard-hooks",
  "future-referral",
  "preview/referral",
  "memory-candidates",
  "memory-candidate-registry",
  "chronicle-review-candidates",
  "chronicle-review-candidate-registry",
  "chronicle-promotion",
  "chronicle-promotion-registry",
  "institutional-register",
  "institutional-register-registry",
];

describe("Signals — Adjacency Law (EVENT → SIGNAL only)", () => {
  for (const mod of SIGNAL_MODULES) {
    const src = read(mod);
    // Only consider real import statements, not prose in comments.
    const importLines = src
      .split(/\r?\n/)
      .filter((l) => /^\s*import\b/.test(l) || /\bfrom\s+["']/.test(l));
    const imports = importLines.join("\n");

    for (const banned of FORBIDDEN_IMPORTS) {
      it(`${mod} does not import the Memory/Recognition module "${banned}"`, () => {
        const re = new RegExp(`from\\s+["'][^"']*${banned.replace("/", "\\/")}["']`);
        expect(re.test(imports), `unexpected import of ${banned}`).toBe(false);
      });
    }
  }

  it("the deriver reads the canonical event stream type, not Memory", () => {
    const src = read("protocol-signals.ts");
    expect(src).toMatch(/from\s+["']\.\/protocol-events["']/);
  });
});

// SIGNAL → MEMORY only. The Memory Candidate layer reads SIGNALS; it must NEVER
// reach back into the raw event layer (protocol-events) — lineage to the event
// is carried THROUGH the Signal. The only legal type edge to the Chronicle is a
// forward-compat `import type` (a candidate may LATER become a ChronicleEntry),
// never a value import.
const MEMORY_MODULES = ["memory-candidate-registry.ts", "memory-candidates.ts"];

describe("Memory candidates — Adjacency Law (SIGNAL → MEMORY only)", () => {
  for (const mod of MEMORY_MODULES) {
    const src = read(mod);
    const importLines = src
      .split(/\r?\n/)
      .filter((l) => /^\s*import\b/.test(l) || /\bfrom\s+["']/.test(l));
    const imports = importLines.join("\n");

    it(`${mod} does not import the raw event layer (protocol-events)`, () => {
      // protocol-event-registry (a pure type leaf) is allowed; protocol-events
      // (the live event/hook layer) is not.
      expect(/from\s+["'][^"']*\/protocol-events["']/.test(imports)).toBe(false);
    });

    it(`${mod} imports the Signal layer it derives from`, () => {
      expect(/from\s+["'][^"']*signal-registry["']/.test(imports)).toBe(true);
    });

    it(`${mod} only imports TYPES from chronicle-entries (forward-compat, no values)`, () => {
      const chronicleLines = importLines.filter((l) => /chronicle-entries/.test(l));
      for (const l of chronicleLines) {
        expect(/import\s+type\b/.test(l), l).toBe(true);
      }
    });

    it(`${mod} does not import the DOWNSTREAM Chronicle Candidate layer`, () => {
      // SIGNAL → MEMORY → CHRONICLE: a memory module reaching forward into the
      // chronicle-review layer would invert the edge.
      expect(/from\s+["'][^"']*chronicle-review-candidate/.test(imports)).toBe(false);
    });
  }
});

// MEMORY → CHRONICLE only. The Chronicle Candidate layer reads MEMORY CANDIDATES;
// it must NEVER reach back into the Signal layer (signal-registry / protocol-
// signals) or the raw event layer (protocol-events) — lineage to the Signal →
// Event → Tx/Block is carried THROUGH the MemoryCandidate. It MAY import
// chronicle-entries VALUES (the banned-term/forbidden-subject vocabulary) since
// it is the Chronicle's own downstream, unlike the upstream memory layer.
const CHRONICLE_REVIEW_MODULES = [
  "chronicle-review-candidate-registry.ts",
  "chronicle-review-candidates.ts",
];

describe("Chronicle candidates — Adjacency Law (MEMORY → CHRONICLE only)", () => {
  for (const mod of CHRONICLE_REVIEW_MODULES) {
    const src = read(mod);
    const importLines = src
      .split(/\r?\n/)
      .filter((l) => /^\s*import\b/.test(l) || /\bfrom\s+["']/.test(l));
    const imports = importLines.join("\n");

    it(`${mod} does not import the raw event layer (protocol-events)`, () => {
      expect(/from\s+["'][^"']*\/protocol-events["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Signal deriver (protocol-signals)`, () => {
      expect(/from\s+["'][^"']*\/protocol-signals["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Signal registry directly (value OR type)`, () => {
      // The lineage tier is re-exported through memory-candidate-registry; the
      // chronicle layer must read it from there, never reach into the Signal leaf.
      expect(/from\s+["'][^"']*signal-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} imports the Memory Candidate layer it derives from`, () => {
      expect(/from\s+["'][^"']*memory-candidate-registry["']/.test(imports)).toBe(true);
    });

    it(`${mod} does not forward-import the DOWNSTREAM Chronicle Promotion layer`, () => {
      // MEMORY → CHRONICLE → PROMOTION: a chronicle-review module reaching
      // forward into the promotion layer would invert the edge.
      expect(/from\s+["'][^"']*chronicle-promotion/.test(imports)).toBe(false);
    });
  }
});

// CHRONICLE → PROMOTION only. The Chronicle Promotion layer reads CHRONICLE
// REVIEW CANDIDATES; it must NEVER reach back into the Memory layer
// (memory-candidate-registry / memory-candidates), the Signal layer
// (signal-registry / protocol-signals), or the raw event layer (protocol-events)
// — lineage to Memory → Signal → Event → Tx/Block is carried THROUGH the
// ChronicleReviewCandidate. It MAY import chronicle-entries VALUES (the
// banned-term/forbidden-subject vocabulary) and the protocol-language guard,
// being the Chronicle's own downstream.
const PROMOTION_MODULES = [
  "chronicle-promotion-registry.ts",
  "chronicle-promotion.ts",
];

describe("Chronicle promotion — Adjacency Law (CHRONICLE → PROMOTION only)", () => {
  for (const mod of PROMOTION_MODULES) {
    const src = read(mod);
    const importLines = src
      .split(/\r?\n/)
      .filter((l) => /^\s*import\b/.test(l) || /\bfrom\s+["']/.test(l));
    const imports = importLines.join("\n");

    it(`${mod} does not import the raw event layer (protocol-events)`, () => {
      expect(/from\s+["'][^"']*\/protocol-events["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Signal deriver (protocol-signals)`, () => {
      expect(/from\s+["'][^"']*\/protocol-signals["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Signal registry directly (value OR type)`, () => {
      expect(/from\s+["'][^"']*signal-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not reach past its neighbour into the Memory layer`, () => {
      // It must read CHRONICLE REVIEW CANDIDATES, not the Memory leaf/deriver.
      expect(/from\s+["'][^"']*\/memory-candidates["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*memory-candidate-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Chronicle Candidate DERIVER (reads the registry leaf)`, () => {
      expect(/from\s+["'][^"']*\/chronicle-review-candidates["']/.test(imports)).toBe(false);
    });

    it(`${mod} imports the Chronicle Review Candidate registry it derives from`, () => {
      expect(/from\s+["'][^"']*chronicle-review-candidate-registry["']/.test(imports)).toBe(true);
    });

    it(`${mod} does not forward-import the DOWNSTREAM Institutional Register layer`, () => {
      // PROMOTION → INSTITUTIONAL REGISTER: a promotion module reaching forward
      // into the register layer would invert the edge.
      expect(/from\s+["'][^"']*institutional-register/.test(imports)).toBe(false);
    });
  }
});

// PROMOTION → INSTITUTIONAL REGISTER only. The Institutional Register layer reads
// CHRONICLE PROMOTION DECISIONS; it must NEVER reach back into the Chronicle-review
// layer (chronicle-review-candidate-registry / chronicle-review-candidates), the
// Memory layer, the Signal layer, or the raw event layer — lineage to
// Promotion → Chronicle → Memory → Signal → Event → Tx/Block is carried THROUGH the
// ChroniclePromotionDecision. It MAY import the promotion registry leaf (types +
// BASELINE_REVIEWER + validateRationaleVocabulary) and the protocol-language guard,
// being the Chronicle's own downstream. It must read the promotion REGISTRY leaf,
// never the promotion DERIVER (chronicle-promotion).
const REGISTER_MODULES = [
  "institutional-register-registry.ts",
  "institutional-register.ts",
];

describe("Institutional register — Adjacency Law (PROMOTION → REGISTER only)", () => {
  for (const mod of REGISTER_MODULES) {
    const src = read(mod);
    const importLines = src
      .split(/\r?\n/)
      .filter((l) => /^\s*import\b/.test(l) || /\bfrom\s+["']/.test(l));
    const imports = importLines.join("\n");

    it(`${mod} does not import the raw event layer (protocol-events)`, () => {
      expect(/from\s+["'][^"']*\/protocol-events["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Signal layer (deriver or registry)`, () => {
      expect(/from\s+["'][^"']*\/protocol-signals["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*signal-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Memory layer`, () => {
      expect(/from\s+["'][^"']*\/memory-candidates["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*memory-candidate-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not reach past its neighbour into the Chronicle-review layer`, () => {
      expect(/from\s+["'][^"']*chronicle-review-candidate/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Chronicle Promotion DERIVER (reads the registry leaf)`, () => {
      expect(/from\s+["'][^"']*\/chronicle-promotion["']/.test(imports)).toBe(false);
    });

    it(`${mod} imports the Chronicle Promotion registry it derives from`, () => {
      expect(/from\s+["'][^"']*chronicle-promotion-registry["']/.test(imports)).toBe(true);
    });
  }
});

// CONFIG → GENESIS SEED → INSTITUTIONAL REGISTER ENTRY (Sprint 9, spec §3). The
// genesis-seed leaf is a LAWFUL parallel source for foundational protocol-birth
// facts that PREDATE the event scanner. It builds entries DIRECTLY from on-chain-
// truth config constants and reuses the register's own vocabulary — but it does
// NOT read promotion decisions, so it must NEVER import the Chronicle-promotion,
// Chronicle-review, Memory, Signal, or raw event layers. (It is intentionally NOT
// in REGISTER_MODULES: it does not derive from the promotion registry.)
const GENESIS_SEED_MODULES = ["institutional-register-genesis.ts"];

describe("Institutional register GENESIS SEED — Adjacency Law (CONFIG → SEED only)", () => {
  for (const mod of GENESIS_SEED_MODULES) {
    const src = read(mod);
    const importLines = src
      .split(/\r?\n/)
      .filter((l) => /^\s*import\b/.test(l) || /\bfrom\s+["']/.test(l));
    const imports = importLines.join("\n");

    it(`${mod} does not import the raw event layer (protocol-events)`, () => {
      expect(/from\s+["'][^"']*\/protocol-events["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Signal layer (deriver or registry)`, () => {
      expect(/from\s+["'][^"']*\/protocol-signals["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*signal-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Memory layer`, () => {
      expect(/from\s+["'][^"']*\/memory-candidates["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*memory-candidate-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Chronicle-review layer`, () => {
      expect(/from\s+["'][^"']*chronicle-review-candidate/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Chronicle-promotion layer (deriver or registry)`, () => {
      expect(/from\s+["'][^"']*\/chronicle-promotion["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*chronicle-promotion-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} builds from the Institutional Register vocabulary (imports the registry leaf)`, () => {
      expect(/from\s+["'][^"']*institutional-register-registry["']/.test(imports)).toBe(true);
    });
  }
});

// INSTITUTIONAL REGISTER ENTRY → CHRONICLE ADMISSION CANDIDATE (Sprint 12, the
// new LAST edge). The Chronicle Admission layer reads durable INSTITUTIONAL
// REGISTER ENTRIES; it must NEVER reach back past its neighbour into the
// Chronicle-promotion layer (chronicle-promotion / chronicle-promotion-registry),
// the Chronicle-review layer, the Memory layer, the Signal layer, or the raw
// event layer — full lineage is carried THROUGH each InstitutionalRegisterEntry.
// It must also NEVER import the institutional-register DERIVER or the GENESIS
// leaf: it operates on already-built entries (whoever produced them), and the
// genesis seed is merged at the ROUTE, outside the guard. It MAY import the
// register REGISTRY leaf (the entry vocabulary + findHistoricClaims), the register
// public leaf (the §5 sober-language guard + isLineageComplete), the protocol-
// language guard, and the Chronicle's own register map (chronicle-entries) — it
// decides Chronicle eligibility, so it reads the Chronicle's classification
// vocabulary, never its candidate pipeline.
const ADMISSION_MODULES = [
  "chronicle-admission-registry.ts",
  "chronicle-admission.ts",
];

describe("Chronicle admission — Adjacency Law (REGISTER → ADMISSION only)", () => {
  for (const mod of ADMISSION_MODULES) {
    const src = read(mod);
    const importLines = src
      .split(/\r?\n/)
      .filter((l) => /^\s*import\b/.test(l) || /\bfrom\s+["']/.test(l));
    const imports = importLines.join("\n");

    it(`${mod} does not import the raw event layer (protocol-events)`, () => {
      expect(/from\s+["'][^"']*\/protocol-events["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Signal layer (deriver or registry)`, () => {
      expect(/from\s+["'][^"']*\/protocol-signals["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*signal-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Memory layer`, () => {
      expect(/from\s+["'][^"']*\/memory-candidates["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*memory-candidate-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Chronicle-review layer`, () => {
      expect(/from\s+["'][^"']*chronicle-review-candidate/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Chronicle-promotion layer (deriver or registry)`, () => {
      expect(/from\s+["'][^"']*\/chronicle-promotion["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*chronicle-promotion-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the institutional-register DERIVER (reads the registry leaf)`, () => {
      expect(/from\s+["'][^"']*\/institutional-register["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the genesis SEED leaf (operates on already-built entries)`, () => {
      expect(/from\s+["'][^"']*institutional-register-genesis["']/.test(imports)).toBe(false);
    });

    it(`${mod} builds from the Institutional Register vocabulary (imports the registry leaf)`, () => {
      expect(/from\s+["'][^"']*institutional-register-registry["']/.test(imports)).toBe(true);
    });
  }
});

// CHRONICLE ADMISSION CANDIDATE → CHRONICLE ENTRY (Sprint 13, the controlled
// publication edge). The Chronicle Entry layer reads CHRONICLE ADMISSION
// CANDIDATES; it must NEVER reach back past its neighbour into the institutional-
// register layer, the Chronicle-promotion / Chronicle-review layers, the Memory
// layer, the Signal layer, or the raw event layer — full lineage is carried
// THROUGH each ChronicleAdmissionCandidate. It must read the admission REGISTRY
// leaf (the candidate vocabulary + the single-sourced copy guard), never the
// admission DERIVER (chronicle-admission). It publishes nothing and imports no
// Story / Recognition / Member-Register / governance surface.
const ENTRY_MODULES = ["chronicle-entry-registry.ts", "chronicle-entry.ts"];

describe("Chronicle entry — Adjacency Law (ADMISSION → ENTRY only)", () => {
  for (const mod of ENTRY_MODULES) {
    const src = read(mod);
    const importLines = src
      .split(/\r?\n/)
      .filter((l) => /^\s*import\b/.test(l) || /\bfrom\s+["']/.test(l));
    const imports = importLines.join("\n");

    it(`${mod} does not import the raw event layer (protocol-events)`, () => {
      expect(/from\s+["'][^"']*\/protocol-events["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Signal layer (deriver or registry)`, () => {
      expect(/from\s+["'][^"']*\/protocol-signals["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*signal-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Memory layer`, () => {
      expect(/from\s+["'][^"']*\/memory-candidates["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*memory-candidate-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Chronicle-review layer`, () => {
      expect(/from\s+["'][^"']*chronicle-review-candidate/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the Chronicle-promotion layer (deriver or registry)`, () => {
      expect(/from\s+["'][^"']*\/chronicle-promotion["']/.test(imports)).toBe(false);
      expect(/from\s+["'][^"']*chronicle-promotion-registry["']/.test(imports)).toBe(false);
    });

    it(`${mod} does not reach past its neighbour into the institutional-register layer`, () => {
      expect(/from\s+["'][^"']*institutional-register/.test(imports)).toBe(false);
    });

    it(`${mod} does not import the admission DERIVER (reads the registry leaf)`, () => {
      expect(/from\s+["'][^"']*\/chronicle-admission["']/.test(imports)).toBe(false);
    });

    it(`${mod} builds from the admission candidate vocabulary (imports the admission registry leaf)`, () => {
      expect(/from\s+["'][^"']*chronicle-admission-registry["']/.test(imports)).toBe(true);
    });
  }
});
