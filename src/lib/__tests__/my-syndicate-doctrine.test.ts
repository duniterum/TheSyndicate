// Regression: /my-syndicate v2 — Member Operating System.
//
// Locks the v2 ordering from docs/MY_SYNDICATE_IMPLEMENTATION_BLUEPRINT.md:
//
//   § 1 My Seat
//   § 2 My Assets
//   § 3 Activity
//   § 4 What's Sealing Next
//   § 5 My Chronicle
//   § 6 My Growth
//   § 7 My Horizon
//   § 8 Protocol Context
//
// Identity is the only hero. Assets is the first secondary domain so the
// page reads like an OS (Seat → Holdings → Movement → Forward edge →
// Deep history → Growth → Horizon → Context).

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ARCHIVE_ARTIFACTS } from "../archive-config";

const ROUTE = readFileSync(
  join(process.cwd(), "src/routes/my-syndicate.tsx"),
  "utf8",
);

describe("/my-syndicate v2 doctrine — Member Operating System ordering", () => {
  const ORDER = [
    "My Seat",
    "My Assets",
    "Activity",
    "What's Sealing Next",
    "My Chronicle",
    "My Growth",
    "My Horizon",
    "Protocol Context",
  ];

  it("declares all eight canonical section eyebrows in order", () => {
    const positions = ORDER.map((label) =>
      ROUTE.indexOf(`label="${label}"`),
    );
    for (const [i, p] of positions.entries()) {
      expect(p, `missing eyebrow: ${ORDER[i]}`).toBeGreaterThan(-1);
    }
    const sorted = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(sorted);
  });

  it("Identity (My Seat) is the only Tier-1 hero — no other eyebrows above it", () => {
    const seatIdx = ROUTE.indexOf('label="My Seat"');
    for (const label of ORDER.slice(1)) {
      expect(ROUTE.indexOf(`label="${label}"`)).toBeGreaterThan(seatIdx);
    }
  });

  it("Assets is the FIRST secondary slot (immediately after Seat)", () => {
    const seatIdx = ROUTE.indexOf('label="My Seat"');
    const assetsIdx = ROUTE.indexOf('label="My Assets"');
    const activityIdx = ROUTE.indexOf('label="Activity"');
    expect(assetsIdx).toBeGreaterThan(seatIdx);
    expect(activityIdx).toBeGreaterThan(assetsIdx);
  });

  it("SeatRecordPanel renders exactly once, inside § 2 My Assets", () => {
    const matches = ROUTE.match(/<SeatRecordPanel\s*\/>/g) ?? [];
    expect(matches.length).toBe(1);
    const panelIdx = ROUTE.indexOf("<SeatRecordPanel");
    const assetsIdx = ROUTE.indexOf('label="My Assets"');
    const activityIdx = ROUTE.indexOf('label="Activity"');
    expect(panelIdx).toBeGreaterThan(assetsIdx);
    expect(panelIdx).toBeLessThan(activityIdx);
  });

  it("MyArchivePreview renders exactly once, inside § 2 My Assets", () => {
    const matches = ROUTE.match(/<MyArchivePreview\s*\/>/g) ?? [];
    expect(matches.length).toBe(1);
    const panelIdx = ROUTE.indexOf("<MyArchivePreview");
    const assetsIdx = ROUTE.indexOf('label="My Assets"');
    const activityIdx = ROUTE.indexOf('label="Activity"');
    expect(panelIdx).toBeGreaterThan(assetsIdx);
    expect(panelIdx).toBeLessThan(activityIdx);
  });

  it("MyPurchaseRouting renders exactly once, inside § 5 My Chronicle", () => {
    const matches = ROUTE.match(/<MyPurchaseRouting\s*\/>/g) ?? [];
    expect(matches.length).toBe(1);
    const idx = ROUTE.indexOf("<MyPurchaseRouting");
    const chronicleIdx = ROUTE.indexOf('label="My Chronicle"');
    const growthIdx = ROUTE.indexOf('label="My Growth"');
    expect(idx).toBeGreaterThan(chronicleIdx);
    expect(idx).toBeLessThan(growthIdx);
  });

  it("Referral and Reputation previews live inside § 6 My Growth (collapsed)", () => {
    const refIdx = ROUTE.indexOf("<MyReferralCard");
    const repIdx = ROUTE.indexOf("<MyReputationConceptCard");
    const growthIdx = ROUTE.indexOf('label="My Growth"');
    const horizonIdx = ROUTE.indexOf('label="My Horizon"');
    expect(refIdx).toBeGreaterThan(growthIdx);
    expect(refIdx).toBeLessThan(horizonIdx);
    expect(repIdx).toBeGreaterThan(growthIdx);
    expect(repIdx).toBeLessThan(horizonIdx);
    // Must be inside a <details> for collapse.
    expect(ROUTE).toMatch(/<details[\s\S]*<MyReferralCard/);
  });

  it("does not reintroduce legacy Genesis #10 / #100 / #500 doctrine", () => {
    expect(ROUTE).not.toMatch(/Member\s+#10\b/);
    expect(ROUTE).not.toMatch(/Member\s+#100\b/);
    expect(ROUTE).not.toMatch(/Member\s+#500\b/);
    expect(ROUTE).not.toMatch(/Genesis\s+closes\s+at\s+Member\s+#10/i);
  });

  it("canonical chapter ranges remain 333 / 1,000 / 3,333 / 10,000 / Open Era", () => {
    const genesis = ARCHIVE_ARTIFACTS.find((a) => a.id === "genesis-sealed");
    expect(genesis).toBeDefined();
    expect(genesis!.unlock).toMatch(/#333/);
    expect(genesis!.unlock).not.toMatch(/#10\b/);
  });

  // ─── Banlist guard scoped to this route ────────────────────────────
  it("contains no banlist words anywhere in /my-syndicate route source", () => {
    // Strip block + line comments before scanning so doctrine notes can
    // mention the banlist by name without tripping the guard.
    const stripped = ROUTE
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/\s+\/\/.*$/gm, "");
    const BANNED: RegExp[] = [
      /\braised\b/i,
      /\bcontribution\b/i,
      /\binvestor\b/i,
      /\binvestment\b/i,
      /\bdividend(s)?\b/i,
      /\byield\b/i,
      /\bpassive income\b/i,
      /\bROI\b/,
      /\bprofit share\b/i,
      /\brevenue share\b/i,
      /\bpooled\b/i,
      /\bearn a commission\b/i,
    ];
    for (const re of BANNED) {
      expect(re.test(stripped), `banlist word matched: ${re}`).toBe(false);
    }
  });

  it("PageShell renders with hideHeader and the v2 OS title", () => {
    expect(ROUTE).toMatch(/<PageShell/);
    expect(ROUTE).toMatch(/hideHeader/);
    expect(ROUTE).toMatch(/Your seat\. Your assets\. Your chronicle\./);
  });
});
