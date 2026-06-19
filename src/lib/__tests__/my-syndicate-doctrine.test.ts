// Regression: /my-syndicate — the Member Cockpit NARRATIVE ARC.
//
// The page is no longer a stack of report sections. It is read as ONE story:
//
//   <MemberCockpit/> owns the live control surface, composed top-to-bottom as
//   an arc:  Identity → Place → Ownership → Momentum → Action.
//
//   The route continues the arc below the cockpit:
//     § Memory  (#memory)  — the one history zone (spine + recent + chronicle)
//     § Proof   (#proof)   — contracts / claim sources, promoted ABOVE pending
//     § Building(#parked)  — Growth + Horizon, collapsed, PENDING (parked tail)
//
// This test protects the ARC ORDER, not the old §1–§8 section stack. Identity
// is the only hero and it lives in the cockpit. Proof is promoted (it must sit
// above the parked/pending tail). Action collapses to ONE dock in the cockpit.
//
// Language rules: no "raised / contribution / investor / investment / yield /
// dividend / ROI / pooled / commission" and no fake gamification
// ("XP / score / leaderboard / spend-ladder / next rank").

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ARCHIVE_ARTIFACTS } from "../archive-config";

// Strip block + line comments before scanning source so doctrine notes can
// mention banned vocabulary (or JSX tags) by name without tripping a guard or
// inflating a usage count. ALL structural scans below run on stripped source.
const stripComments = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\s+\/\/.*$/gm, "");

const ROUTE = stripComments(
  readFileSync(join(process.cwd(), "src/routes/my-syndicate.tsx"), "utf8"),
);
const COCKPIT = stripComments(
  readFileSync(
    join(process.cwd(), "src/components/syndicate/cockpit/MemberCockpit.tsx"),
    "utf8",
  ),
);

// Assert a list of needles appears in source, each strictly after the previous.
function expectInOrder(src: string, needles: string[]) {
  let cursor = -1;
  for (const n of needles) {
    const at = src.indexOf(n, cursor + 1);
    expect(at, `missing or out-of-order: ${n}`).toBeGreaterThan(cursor);
    cursor = at;
  }
}

describe("/my-syndicate doctrine — narrative arc", () => {
  it("delegates the live control surface to <MemberCockpit/>, rendered once and first", () => {
    const matches = ROUTE.match(/<MemberCockpit\s*\/>/g) ?? [];
    expect(matches.length).toBe(1);
    const cockpitIdx = ROUTE.indexOf("<MemberCockpit");
    const memoryIdx = ROUTE.indexOf('id="memory"');
    expect(cockpitIdx).toBeGreaterThan(-1);
    // The cockpit sits above the route-level arc tail.
    expect(memoryIdx).toBeGreaterThan(cockpitIdx);
  });

  it("does not reintroduce the retired v2 seat/assets route layout", () => {
    expect(ROUTE).not.toMatch(/<SeatRecordPanel\s*\/>/);
    expect(ROUTE).not.toMatch(/<MyArchivePreview\s*\/>/);
    expect(ROUTE.indexOf('label="My Seat"')).toBe(-1);
    expect(ROUTE.indexOf('label="My Assets"')).toBe(-1);
  });

  it("composes the cockpit arc IN ORDER: Identity → Place → Ownership → Momentum → Action", () => {
    expectInOrder(COCKPIT, [
      'id="my-seat"', //         frame / Identity hero
      "<CockpitHeader", //       1 · Identity
      "<WakeBehindYou", //       2 · Place
      "<SeatsAroundYou", //      2 · Place
      "<CockpitPortfolio", //    3 · Ownership
      "<CockpitCollector", //    3 · Ownership
      "<CockpitProgression", //  4 · Momentum
      "<CockpitSealingNext", //  4 · Momentum (moved in from the route)
      "<ProtocolHeartbeat", //   4 · Momentum
      "<LivePulseStrip", //      4 · Momentum
      "<CockpitActionRail", //   5 · Action
    ]);
  });

  it("promotes proof beside the identity values it backs (anchor → #proof)", () => {
    expect(COCKPIT).toMatch(/href="#proof"/);
    expect(COCKPIT).toMatch(/live on-chain read/i);
  });

  it("collapses to ONE action dock — no duplicate gradient Join CTA in the identity header", () => {
    // The single dock is CockpitActionRail (rendered once). The hero header no
    // longer ships its own gradient Join/Buy button competing with the dock.
    const railUses = COCKPIT.match(/<CockpitActionRail\b/g) ?? [];
    expect(railUses.length).toBe(1);
    // The CockpitHeader function body must not contain a gradient-gold CTA link.
    const headerStart = COCKPIT.indexOf("function CockpitHeader");
    const headerEnd = COCKPIT.indexOf("function HeroStat");
    expect(headerStart).toBeGreaterThan(-1);
    expect(headerEnd).toBeGreaterThan(headerStart);
    const header = COCKPIT.slice(headerStart, headerEnd);
    expect(/var\(--gradient-gold\)[\s\S]*Buy More SYN/.test(header)).toBe(false);
    expect(/var\(--gradient-gold\)[\s\S]*Join The Syndicate/.test(header)).toBe(false);
  });

  it("continues the arc tail IN ORDER below the cockpit: Memory → Proof → Building", () => {
    expectInOrder(ROUTE, [
      "<MemberCockpit",
      'id="memory"',
      'id="proof"',
      'id="parked"',
    ]);
  });

  it("Memory is the ONE history zone: spine + chronicle routing receipt, between Memory and Proof", () => {
    const memoryIdx = ROUTE.indexOf('id="memory"');
    const proofIdx = ROUTE.indexOf('id="proof"');
    // The cockpit memory spine renders once, inside the Memory zone.
    const mem = ROUTE.match(/<CockpitMemory\s*\/>/g) ?? [];
    expect(mem.length).toBe(1);
    const memSpineIdx = ROUTE.indexOf("<CockpitMemory");
    expect(memSpineIdx).toBeGreaterThan(memoryIdx);
    expect(memSpineIdx).toBeLessThan(proofIdx);
    // The routing receipt renders exactly once, also inside the Memory zone.
    const routing = ROUTE.match(/<MyPurchaseRouting\s*\/>/g) ?? [];
    expect(routing.length).toBe(1);
    const routingIdx = ROUTE.indexOf("<MyPurchaseRouting");
    expect(routingIdx).toBeGreaterThan(memoryIdx);
    expect(routingIdx).toBeLessThan(proofIdx);
  });

  it("promotes <CockpitProof/> into § Proof, ABOVE the parked tail", () => {
    const matches = ROUTE.match(/<CockpitProof\s*\/>/g) ?? [];
    expect(matches.length).toBe(1);
    const proofZoneIdx = ROUTE.indexOf('id="proof"');
    const proofIdx = ROUTE.indexOf("<CockpitProof");
    const parkedIdx = ROUTE.indexOf('id="parked"');
    expect(proofIdx).toBeGreaterThan(proofZoneIdx);
    expect(proofIdx).toBeLessThan(parkedIdx);
  });

  it("parks Referral + Reputation in § Building (collapsed <details>, PENDING)", () => {
    const parkedIdx = ROUTE.indexOf('id="parked"');
    const refIdx = ROUTE.indexOf("<MyReferralCard");
    const repIdx = ROUTE.indexOf("<MyReputationConceptCard");
    expect(refIdx).toBeGreaterThan(parkedIdx);
    expect(repIdx).toBeGreaterThan(parkedIdx);
    // Must be inside a <details> for collapse.
    expect(ROUTE).toMatch(/<details[\s\S]*<MyReferralCard/);
    // The building tail stays PENDING until contracts ship.
    expect(ROUTE).toMatch(/label="What's Building"[\s\S]*?status="PENDING"/);
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
    expect(ROUTE).toMatch(/Your seat\. Your proof\. Your memory\./);
  });
});
