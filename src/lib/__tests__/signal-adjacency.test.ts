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

// Modules a Signal must NEVER read from (Memory / Recognition / prestige).
const FORBIDDEN_IMPORTS = [
  "chronicle-entries",
  "chronicle-candidates",
  "recognition-candidates",
  "protocol-memory",
  "protocol-ledger",
  "leaderboard-hooks",
  "future-referral",
  "preview/referral",
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
