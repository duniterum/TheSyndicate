// Regression: /my-syndicate — Member Cockpit composition + section doctrine.
//
// Architecture (current): the route is a thin composition shell. Identity and
// holdings are delegated to <MemberCockpit/>, which owns the cockpit surfaces
// (identity hero, Wake Behind You, progression, memory, collector). The route
// itself only declares the secondary domains below the cockpit:
//
//   <MemberCockpit/>          — Seat (identity) · Assets · Artifacts
//   § Activity                — recent on-chain movement
//   § What's Sealing Next     — real chapter / artifact thresholds
//   § My Chronicle            — block-anchored timeline + routing receipt
//   § My Growth               — referral · reputation (PENDING, collapsed)
//   § My Horizon              — sealed-envelope future modules (PENDING)
//   § Protocol Context        — proof panel + claim sources + links out
//
// Identity is the only hero and it lives in the cockpit. The legacy v2 route
// layout (label="My Seat" / "My Assets" eyebrows, <SeatRecordPanel/>,
// <MyArchivePreview/>) has been retired into MemberCockpit — these are no
// longer route-level assertions.
//
// Language rules: no "raised / contribution / investor / investment / yield /
// dividend / ROI / pooled / commission" and no fake gamification
// ("XP / score / leaderboard / spend-ladder / next rank").

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ARCHIVE_ARTIFACTS } from "../archive-config";

const ROUTE = readFileSync(
  join(process.cwd(), "src/routes/my-syndicate.tsx"),
  "utf8",
);
const COCKPIT = readFileSync(
  join(process.cwd(), "src/components/syndicate/cockpit/MemberCockpit.tsx"),
  "utf8",
);

// Strip block + line comments before scanning source so doctrine notes can
// mention banned vocabulary by name without tripping a guard.
const stripComments = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\s+\/\/.*$/gm, "");

describe("/my-syndicate doctrine — cockpit delegation + section ordering", () => {
  it("delegates the cockpit (identity/holdings) to <MemberCockpit/>, rendered first", () => {
    const matches = ROUTE.match(/<MemberCockpit\s*\/>/g) ?? [];
    expect(matches.length).toBe(1);
    const cockpitIdx = ROUTE.indexOf("<MemberCockpit");
    const firstSectionIdx = ROUTE.indexOf('label="Activity"');
    expect(cockpitIdx).toBeGreaterThan(-1);
    // The cockpit sits above every route-level section eyebrow.
    expect(firstSectionIdx).toBeGreaterThan(cockpitIdx);
  });

  it("no longer inlines the retired v2 seat/assets layout at the route level", () => {
    // These moved into MemberCockpit; the route must not reintroduce them.
    expect(ROUTE).not.toMatch(/<SeatRecordPanel\s*\/>/);
    expect(ROUTE).not.toMatch(/<MyArchivePreview\s*\/>/);
    expect(ROUTE.indexOf('label="My Seat"')).toBe(-1);
    expect(ROUTE.indexOf('label="My Assets"')).toBe(-1);
  });

  const ROUTE_SECTIONS = [
    "Activity",
    "What's Sealing Next",
    "My Chronicle",
    "My Growth",
    "My Horizon",
    "Protocol Context",
  ];

  it("declares the route-level section eyebrows in canonical order, below the cockpit", () => {
    const cockpitIdx = ROUTE.indexOf("<MemberCockpit");
    const positions = ROUTE_SECTIONS.map((label) =>
      ROUTE.indexOf(`label="${label}"`),
    );
    for (const [i, p] of positions.entries()) {
      expect(p, `missing eyebrow: ${ROUTE_SECTIONS[i]}`).toBeGreaterThan(-1);
      expect(
        p,
        `eyebrow must sit below the cockpit: ${ROUTE_SECTIONS[i]}`,
      ).toBeGreaterThan(cockpitIdx);
    }
    const sorted = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(sorted);
  });

  it("MemberCockpit composes the identity / wake / progression / memory / collector surfaces", () => {
    expect(COCKPIT).toMatch(/id="my-seat"/); // identity hero section
    expect(COCKPIT).toMatch(/<CockpitHeader\b/); // identity
    expect(COCKPIT).toMatch(/<WakeBehindYou\s*\/>/); // wake
    expect(COCKPIT).toMatch(/<CockpitProgression\s*\/>/); // progression
    expect(COCKPIT).toMatch(/<CockpitMemory\s*\/>/); // memory
    expect(COCKPIT).toMatch(/<CockpitCollector\b/); // collector
  });

  it("exposes the protocol proof surface via <CockpitProof/> inside § Protocol Context", () => {
    const matches = ROUTE.match(/<CockpitProof\s*\/>/g) ?? [];
    expect(matches.length).toBe(1);
    const proofIdx = ROUTE.indexOf("<CockpitProof");
    const ctxIdx = ROUTE.indexOf('label="Protocol Context"');
    expect(ctxIdx).toBeGreaterThan(-1);
    expect(proofIdx).toBeGreaterThan(ctxIdx);
  });

  it("MyPurchaseRouting renders exactly once, inside § My Chronicle", () => {
    const matches = ROUTE.match(/<MyPurchaseRouting\s*\/>/g) ?? [];
    expect(matches.length).toBe(1);
    const idx = ROUTE.indexOf("<MyPurchaseRouting");
    const chronicleIdx = ROUTE.indexOf('label="My Chronicle"');
    const growthIdx = ROUTE.indexOf('label="My Growth"');
    expect(idx).toBeGreaterThan(chronicleIdx);
    expect(idx).toBeLessThan(growthIdx);
  });

  it("Referral and Reputation previews live inside § My Growth (collapsed, PENDING)", () => {
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
    // The growth domain stays PENDING until contracts ship.
    expect(ROUTE).toMatch(/label="My Growth"[\s\S]*?status="PENDING"/);
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
  it("contains no financial-banlist words anywhere in /my-syndicate route source", () => {
    const stripped = stripComments(ROUTE);
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

  it("introduces no fake gamification language (XP / score / leaderboard / spend-ladder) in route or cockpit", () => {
    const sources = [stripComments(ROUTE), stripComments(COCKPIT)];
    const BANNED: RegExp[] = [
      /\bXP\b/i,
      /\bscore\b/i,
      /\bleaderboard\b/i,
      /\bpoints\b/i,
      /\bstreak\b/i,
      /\bspend(?:ing)? (?:more|to)\b/i,
      /\bspend ladder\b/i,
      /\b(?:to\s+)?next rank\b/i,
      /\brank up\b/i,
    ];
    for (const src of sources) {
      for (const re of BANNED) {
        expect(re.test(src), `gamification word matched: ${re}`).toBe(false);
      }
    }
  });

  it("PageShell renders with hideHeader and the OS title", () => {
    expect(ROUTE).toMatch(/<PageShell/);
    expect(ROUTE).toMatch(/hideHeader/);
    expect(ROUTE).toMatch(/Your seat\. Your assets\. Your chronicle\./);
  });
});
