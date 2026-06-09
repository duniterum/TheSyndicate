// Regression guards for the Protocol Chronicle.
//
// Constitutional sources:
//   • docs/PROTOCOL_CHRONICLE_MVP_EXECUTION_SPEC.md
//   • docs/PROTOCOL_CHRONICLE_FINAL_READINESS_REVIEW.md
//
// These tests FAIL if implementation accidentally:
//   • adds a member-/wallet-/founder-specific entry
//   • reverses the chronological order
//   • turns Chronicle entries into Activity rows
//   • leaks banned founder-centric or marketing wording
//   • introduces feed primitives on /chronicle

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CHRONICLE_ENTRIES,
  CHRONICLE_BANNED_TERMS,
  CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS,
  validateChronicleEntry,
  validateChronicleOrdering,
} from "../chronicle-entries";

const ROUTE_SRC = readFileSync(
  join(process.cwd(), "src/routes/chronicle.tsx"),
  "utf8",
);

describe("Protocol Chronicle — locked day-one entry set", () => {
  it("contains exactly the 3 approved entries, no more, no less", () => {
    expect(CHRONICLE_ENTRIES).toHaveLength(3);
    expect(CHRONICLE_ENTRIES.map((e) => e.id)).toEqual([
      "chapter-i-opened",
      "first-artifact-mintable",
      "second-artifact-mintable",
    ]);
  });

  it("does NOT contain a Member #1 / per-member entry", () => {
    for (const e of CHRONICLE_ENTRIES) {
      expect(e.id).not.toMatch(/member/i);
      expect(e.title).not.toMatch(/member\s*#\s*\d+/i);
    }
  });

  it("every entry subject is a protocol primitive (chapter | archive)", () => {
    for (const e of CHRONICLE_ENTRIES) {
      expect(["chapter", "archive"]).toContain(e.subject);
    }
  });
});

describe("Protocol Chronicle — six-part selection gate", () => {
  it("every entry passes the per-entry validator (anchor + voice + protocol-centric)", () => {
    for (const e of CHRONICLE_ENTRIES) {
      const errs = validateChronicleEntry(e);
      expect(errs, errs.join("\n")).toEqual([]);
    }
  });

  it("entries are ordered strictly oldest → newest", () => {
    const errs = validateChronicleOrdering(CHRONICLE_ENTRIES);
    expect(errs, errs.join("\n")).toEqual([]);
  });

  it("no entry prose contains a forbidden subject pattern", () => {
    for (const e of CHRONICLE_ENTRIES) {
      for (const pat of CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS) {
        expect(pat.test(e.title), `title matches ${pat}`).toBe(false);
        expect(pat.test(e.body), `body matches ${pat}`).toBe(false);
        expect(pat.test(e.whatChanged), `whatChanged matches ${pat}`).toBe(false);
      }
    }
  });

  it("no entry prose contains banned vocabulary", () => {
    for (const e of CHRONICLE_ENTRIES) {
      const haystack = `${e.title}\n${e.body}\n${e.whatChanged}`.toLowerCase();
      for (const term of CHRONICLE_BANNED_TERMS) {
        // "0x" is also banned in prose; tolerate inside anchor URLs only.
        expect(haystack.includes(term), `entry "${e.id}" contains banned term "${term}"`).toBe(false);
      }
    }
  });
});

describe("Protocol Chronicle — /chronicle route discipline", () => {
  it("declares oldest-first reading order in markup", () => {
    expect(ROUTE_SRC).toContain('data-chronicle-order="oldest-first"');
  });

  it("does NOT import or render feed/social/reaction primitives", () => {
    const forbidden = [
      "ProtocolEventsFeed",
      "LiveActivityFeed",
      "ActivityFilterChips",
      "ActivitySummaryRow",
      "NotificationBell",
      "Heart",
      "Reaction",
      "Comment",
      "Trending",
    ];
    for (const tok of forbidden) {
      expect(ROUTE_SRC.includes(tok), `/chronicle must not reference "${tok}"`).toBe(false);
    }
  });

  it("does NOT contain pagination / infinite-scroll JSX primitives", () => {
    // Strip line comments so doctrinal commentary ("no pagination") doesn't
    // trigger; we only flag actual code usage.
    const code = ROUTE_SRC.replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/<Pagination\b|InfiniteScroll|loadMore|nextPage/i);
  });

  it("does NOT contain a Member-#1 entry in the rendered route", () => {
    // The route renders CHRONICLE_ENTRIES; this catches accidental
    // hard-coding of a member entry directly in JSX.
    expect(ROUTE_SRC).not.toMatch(/Member\s*#\s*\d+/);
  });

  it("renders entries by mapping CHRONICLE_ENTRIES (single source of truth)", () => {
    expect(ROUTE_SRC).toContain("CHRONICLE_ENTRIES");
    expect(ROUTE_SRC).toMatch(/\.sort\(.*a\.order\s*-\s*b\.order/);
  });

  it("has links to /activity and /my-syndicate in footer (no overlap, just navigation)", () => {
    expect(ROUTE_SRC).toMatch(/to="\/activity"/);
    expect(ROUTE_SRC).toMatch(/to="\/my-syndicate"/);
  });
});

describe("Protocol Chronicle — sitemap inclusion", () => {
  it("registers /chronicle in the public sitemap", () => {
    const sitemap = readFileSync(
      join(process.cwd(), "src/routes/sitemap[.]xml.ts"),
      "utf8",
    );
    expect(sitemap).toMatch(/path:\s*"\/chronicle"/);
  });
});
