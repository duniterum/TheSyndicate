/**
 * Regression matrix for the /my-syndicate Member Cockpit progression / story
 * loop (CockpitProgression.tsx — Wave C4). These tests pin the TRUTH-GATING
 * and doctrine contract of the chapter/progression surface in source so the
 * hard rules cannot silently regress.
 *
 * Doctrine being protected:
 *   • Chapter + progression data is derived ONLY from chapters.ts helpers and
 *     the indexed member count — never new thresholds or new chapter names.
 *   • The uncapped Open Era NEVER renders a seat progress bar.
 *   • An unread member count (hasData === false) shows a pending note BEFORE
 *     any bar — a 0% bar must never be painted as truth.
 *   • The "why early matters" copy stays story/identity only: no yield, no
 *     revenue share, no priority, no countdown / deadline / scarcity language,
 *     no fabricated dates, no rewards.
 *
 * Like cockpit-collector-gating.test.ts, these are intentionally source-string
 * based: they protect the branching + copy contract without spinning up a
 * React + wagmi runtime.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");
const PROGRESSION = "src/components/syndicate/cockpit/CockpitProgression.tsx";
const src = readFileSync(join(ROOT, PROGRESSION), "utf8");

describe("CockpitProgression — chapter data provenance", () => {
  it("derives chapters ONLY from the canonical chapters.ts helpers", () => {
    expect(src).toMatch(/from "@\/lib\/chapters"/);
    for (const helper of [
      "getActiveChapter",
      "getChapterByMemberNumber",
      "getChapterProgress",
      "getRemainingSeats",
      "CHAPTERS",
    ]) {
      expect(src).toContain(helper);
    }
  });

  it("does not hardcode an inline chapter ladder (no local label/range table)", () => {
    // The only chapter strings allowed are the threshold reminders in copy.
    // A re-declared chapter array/object literal would be a doctrine fork.
    expect(src).not.toMatch(/shortLabel:\s*["']/);
    expect(src).not.toMatch(/const\s+CHAPTERS\s*=/);
  });
});

describe("CockpitProgression — uncapped Open Era never shows a seat bar", () => {
  it("computes an explicit uncapped flag from endN/capacity being null", () => {
    expect(src).toMatch(
      /const uncapped = active\.endN === null \|\| active\.capacity === null;/,
    );
  });

  it("renders the ProgressBar only in the capped branch, after the uncapped guard", () => {
    const uncappedIdx = src.indexOf("uncapped ? (");
    const barIdx = src.indexOf("<ProgressBar");
    expect(uncappedIdx).toBeGreaterThan(-1);
    expect(barIdx).toBeGreaterThan(-1);
    // The bar must live AFTER the uncapped branch so Open Era can never reach it.
    expect(uncappedIdx).toBeLessThan(barIdx);
  });
});

describe("CockpitProgression — unread member count is gated", () => {
  it("shows a read-pending note before the bar when hasData is false", () => {
    expect(src).toMatch(/!hasData \? \(/);
    const pendingIdx = src.indexOf("Reading the live member count");
    const barIdx = src.indexOf("<ProgressBar");
    expect(pendingIdx).toBeGreaterThan(-1);
    // The pending branch must be evaluated before the bar is ever rendered.
    expect(pendingIdx).toBeLessThan(barIdx);
  });
});

describe("CockpitProgression — next-chapter boundary math", () => {
  it("'opens at' uses the next chapter's startN, never the current chapter's endN", () => {
    // The next chapter OPENS at next.startN (#334), not where the current
    // chapter SEALS (active.endN === #333). Pin the correct boundary source.
    expect(src).toContain("next ? next.startN");
    expect(src).toMatch(/opens at #[\s\S]{0,40}next \? next\.startN/);
    // Negative guard: the off-by-one regression (opening at the current
    // chapter's last seat) must never come back.
    expect(src).not.toMatch(/opens at #[\s\S]{0,40}\{fmtInt\(active\.endN as number\)\}/);
  });
});

describe("CockpitProgression — story/identity copy stays clean", () => {
  it("affirms early-is-not-better and historical-coordinate framing", () => {
    expect(src).toMatch(/Earlier is earlier/);
    expect(src).toMatch(/historical coordinate/);
  });

  it("contains no financial / reward / scarcity / countdown language", () => {
    // Whole-word checks so negated copy ("no timer") cannot false-trigger.
    const forbidden = [
      "ROI",
      "APY",
      "yield",
      "guaranteed",
      "profit",
      "investment",
      "dividend",
      "countdown",
      "deadline",
      "days left",
      "hurry",
      "act now",
      "limited time",
      "XP",
      "points",
    ];
    for (const word of forbidden) {
      const re = new RegExp(`\\b${word.replace(/ /g, "\\s")}\\b`, "i");
      expect(src).not.toMatch(re);
    }
  });

  it("does not fabricate dates (no month names / ISO dates in copy)", () => {
    expect(src).not.toMatch(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/,
    );
    expect(src).not.toMatch(/\b\d{4}-\d{2}-\d{2}\b/);
  });
});
