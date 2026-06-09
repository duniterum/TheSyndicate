// Activity Intelligence vocabulary guard.
//
// Ensures protocol events surface human-readable summaries — never raw
// blockchain event names — as the primary title shown in /activity, the
// homepage Activity Tape, or the NotificationBell.
//
// Raw vocabulary (TransferSingle, TokensPurchased, USDCTransfer, etc.) is
// only allowed inside proof / details / drawer surfaces.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  evaluateMilestones,
  splitReached,
  PROTOCOL_MILESTONES,
} from "../activity-milestones";

const BANNED_AS_TITLE = ["TransferSingle", "TokensPurchased", "USDCTransfer"];

// The title strings live in the data layer (src/lib/protocol-events.ts).
// Grep ensures no future contributor swaps a human title for a raw event
// name. Allowed everywhere else (detail rows, drawers, ABI files).
describe("activity vocabulary guard", () => {
  it("protocol-events.ts emits human titles, never raw event names", () => {
    const src = readFileSync(join(process.cwd(), "src/lib/protocol-events.ts"), "utf8");
    // Strip comments — banned tokens are mentioned in the header comment.
    const code = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const term of BANNED_AS_TITLE) {
      const re = new RegExp(`title:\\s*\`[^\`]*${term}[^\`]*\``);
      expect(re.test(code), `protocol-events.ts uses raw "${term}" as a title`).toBe(false);
    }
  });

  it("ProtocolEventsFeed does not hardcode raw event names as primary labels", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/syndicate/ProtocolEventsFeed.tsx"),
      "utf8",
    );
    for (const term of BANNED_AS_TITLE) {
      // The component renders {e.title}; we only ban the literal token from
      // appearing as a hardcoded JSX label (no occurrence outside comments).
      const inJsx = new RegExp(`>\\s*${term}\\s*<`).test(src);
      expect(inJsx, `ProtocolEventsFeed renders raw "${term}" as label`).toBe(false);
    }
  });

  it("NotificationBell exposes the canonical category set including MILESTONE", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/syndicate/NotificationBell.tsx"),
      "utf8",
    );
    for (const cat of ["MEMBERS", "NFT", "TREASURY", "LIQUIDITY", "MILESTONE"]) {
      expect(src.includes(`"${cat}"`), `NotificationBell missing category "${cat}"`).toBe(true);
    }
  });
});

describe("milestones derivation", () => {
  it("reports nothing reached for empty pulse", () => {
    const r = evaluateMilestones({
      buyers: 0,
      usdcRaised: 0,
      firstSignalMinted: false,
      patronSealMinted: false,
    });
    expect(r.find((s) => s.milestone.id === "first-buyer")?.reached).toBe(false);
    expect(r.every((s) => s.reached === false)).toBe(true);
  });

  it("flags first-buyer + first-signal once they happen", () => {
    const r = evaluateMilestones({
      buyers: 1,
      usdcRaised: 0.5,
      firstSignalMinted: true,
      patronSealMinted: false,
    });
    expect(r.find((s) => s.milestone.id === "first-buyer")?.reached).toBe(true);
    expect(r.find((s) => s.milestone.id === "first-signal-mint")?.reached).toBe(true);
    expect(r.find((s) => s.milestone.id === "patron-seal-mint")?.reached).toBe(false);
  });

  it("splits reached vs upcoming and orders upcoming by progress desc", () => {
    const r = evaluateMilestones({
      buyers: 50,
      usdcRaised: 250,
      firstSignalMinted: true,
      patronSealMinted: true,
    });
    const { completed, upcoming } = splitReached(r);
    expect(completed.length).toBeGreaterThan(0);
    expect(upcoming.length).toBeGreaterThan(0);
    for (let i = 1; i < upcoming.length; i++) {
      expect(upcoming[i - 1].progress).toBeGreaterThanOrEqual(upcoming[i].progress);
    }
  });

  it("every canonical milestone has a non-empty label and positive target", () => {
    for (const m of PROTOCOL_MILESTONES) {
      expect(m.label.length).toBeGreaterThan(0);
      expect(m.target).toBeGreaterThan(0);
    }
  });
});

describe("Milestones section is mounted on /activity", () => {
  it("activity route imports ActivityMilestones and SinceYourLastVisit", () => {
    const src = readFileSync(join(process.cwd(), "src/routes/activity.tsx"), "utf8");
    expect(src.includes("ActivityMilestones")).toBe(true);
    expect(src.includes("SinceYourLastVisit")).toBe(true);
  });

  it("my-syndicate route mounts SinceYourLastVisit", () => {
    const src = readFileSync(join(process.cwd(), "src/routes/my-syndicate.tsx"), "utf8");
    expect(src.includes("SinceYourLastVisit")).toBe(true);
  });
});

// Sanity: make sure we didn't break the activity directory tree
describe("activity layer surfaces", () => {
  it("all expected activity components exist", () => {
    const dir = readdirSync(join(process.cwd(), "src/components/syndicate"));
    for (const f of [
      "ActivityMilestones.tsx",
      "ActivitySummaryRow.tsx",
      "ActivityFilterChips.tsx",
      "ActivityHealthBanner.tsx",
      "ProtocolEventsFeed.tsx",
      "NotificationBell.tsx",
      "SinceYourLastVisit.tsx",
    ]) {
      expect(dir.includes(f), `missing ${f}`).toBe(true);
    }
  });
});
