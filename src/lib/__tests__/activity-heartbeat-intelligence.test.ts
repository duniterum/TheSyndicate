import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("ActivityHeartbeat intelligence wiring", () => {
  it("uses the canonical protocol-event intelligence engine instead of a local meaning table", () => {
    const src = read("src/components/syndicate/ActivityHeartbeat.tsx");

    expect(src).toContain("interpretProtocolEvent");
    expect(src).toContain("intelligence?.meaning");
    expect(src).toContain("intelligence.consequence");
    expect(src).toContain("intelligence.chronicleCandidate.label");
    expect(src).toContain("intelligence.registerDisposition.label");
    expect(src).not.toContain("WHY_IT_MATTERS");
  });
});
