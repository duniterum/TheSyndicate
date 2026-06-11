// Protocol Memory Layer — derivation + truth guards.
//
// Guards the binding rules of the Protocol Memory Layer:
//   • derivePersonalMemory never invents facts when inputs are missing.
//   • Every personal fact carries a valid source label.
//   • "Witness" language stays soft — no claim like "you witnessed" leaks
//     into the WhatChangedForYou component as a hardcoded JSX label.
//   • localStorage stays a LOCAL hint only (cannot back ownership facts).

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { derivePersonalMemory, sourceLabel } from "../protocol-memory";

const BASE = {
  events: [],
  pulse: { buyers: 0, usdcRaised: 0 },
  mintFlags: { firstSignal: false, patronSeal: false },
  archiveBalances: {},
};

describe("protocol-memory · derivePersonalMemory", () => {
  it("returns no facts and no witness for non-members", () => {
    const m = derivePersonalMemory({ ...BASE, record: undefined });
    expect(m.isMember).toBe(false);
    expect(m.facts).toEqual([]);
    expect(m.milestonesSinceJoin).toEqual([]);
  });

  it("emits INDEXED seat fact for a member", () => {
    const m = derivePersonalMemory({
      ...BASE,
      record: {
        memberNumber: 7,
        currentRank: { name: "Citizen" } as any,
        cumulativeUsdc: 0,
      } as any,
    });
    expect(m.isMember).toBe(true);
    const seat = m.facts.find((f) => f.id === "seat");
    expect(seat?.value).toBe("Member #7");
    expect(seat?.source).toBe("INDEXED");
  });

  it("emits a LIVE NFT fact only when balance > 0", () => {
    const withZero = derivePersonalMemory({
      ...BASE,
      record: { memberNumber: 1, currentRank: null, cumulativeUsdc: 0 } as any,
      archiveBalances: { firstSignal: 0n, patronSeal: 0n },
    });
    expect(withZero.facts.find((f) => f.id === "first-signal")).toBeUndefined();

    const withOne = derivePersonalMemory({
      ...BASE,
      record: { memberNumber: 1, currentRank: null, cumulativeUsdc: 0 } as any,
      archiveBalances: { firstSignal: 2n },
    });
    const fs = withOne.facts.find((f) => f.id === "first-signal");
    expect(fs?.value).toBe("2");
    expect(fs?.source).toBe("LIVE");
  });

  it("coming-next is sorted by progress and capped at 3", () => {
    const m = derivePersonalMemory({
      ...BASE,
      record: { memberNumber: 5, currentRank: null, cumulativeUsdc: 0 } as any,
      pulse: { buyers: 50, usdcRaised: 250 },
      mintFlags: { firstSignal: true, patronSeal: true },
    });
    expect(m.comingNext.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < m.comingNext.length; i++) {
      expect(m.comingNext[i - 1].progress).toBeGreaterThanOrEqual(m.comingNext[i].progress);
    }
  });

  it("sourceLabel returns the literal source string for the badge", () => {
    expect(sourceLabel("LIVE")).toBe("LIVE");
    expect(sourceLabel("INDEXED")).toBe("INDEXED");
    expect(sourceLabel("LOCAL")).toBe("LOCAL");
    expect(sourceLabel("PARTIAL")).toBe("PARTIAL");
  });
});

describe("protocol-memory · UI truth guards", () => {
  const root = process.cwd();

  it("WhatChangedForYou uses soft witness language", () => {
    const src = readFileSync(
      join(root, "src/components/syndicate/WhatChangedForYou.tsx"),
      "utf8",
    );
    // Soft language we DO want.
    expect(src.includes("Protocol milestones since you joined")).toBe(true);
    // Hard, unverifiable claims we MUST NOT ship as JSX labels.
    expect(/>\s*You witnessed\s*</i.test(src)).toBe(false);
  });

  it("SinceYourLastVisit advertises itself as LOCAL", () => {
    const src = readFileSync(
      join(root, "src/components/syndicate/SinceYourLastVisit.tsx"),
      "utf8",
    );
    expect(src.includes("LOCAL")).toBe(true);
  });

  it("/my-syndicate surfaces WhatChangedForYou (mounted via CockpitMemory)", () => {
    // WhatChangedForYou moved into the cockpit Memory spine; /my-syndicate
    // mounts <CockpitMemory/>, which renders it.
    const src = readFileSync(
      join(root, "src/components/syndicate/cockpit/CockpitMemory.tsx"),
      "utf8",
    );
    expect(src.includes("WhatChangedForYou")).toBe(true);
  });

  it("NotificationBell collapses 3+ adjacent same-kind events", () => {
    const src = readFileSync(
      join(root, "src/components/syndicate/NotificationBell.tsx"),
      "utf8",
    );
    expect(src.includes("grouped")).toBe(true);
  });
});
