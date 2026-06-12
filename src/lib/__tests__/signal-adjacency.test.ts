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
  }
});
