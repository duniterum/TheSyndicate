import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("production coherence guards", () => {
  it("does not describe live membership infrastructure as still upcoming", () => {
    const root = read("src/routes/__root.tsx");

    expect(root).toContain("Membership Sale and 70/20/10 routing live on Avalanche C-Chain");
    expect(root).not.toMatch(/Membership Sale contract is next/i);
  });

  it("keeps simulated treasury ledger previews off the public Transparency route", () => {
    const transparency = read("src/routes/transparency.tsx");

    expect(transparency).toContain("TransparencyTimeline");
    expect(transparency).toContain("UseOfFunds");
    expect(transparency).toContain("TransparencyReport");

    expect(transparency).not.toMatch(/treasury-ledger-preview/i);
    expect(transparency).not.toMatch(/TreasuryLedgerPreview/);
    expect(transparency).not.toMatch(/TreasuryCategoryChart/);
    expect(transparency).not.toMatch(/simulated rows/i);
    expect(transparency).not.toMatch(/CommissionRouter ships/i);
    expect(transparency).not.toMatch(/Founder-managed until DAO activation/i);
  });

  it("keeps future referral simulations away from live purchase and pending referral routes", () => {
    const join = read("src/routes/join.tsx");
    const referral = read("src/routes/referral.tsx");

    expect(join).toContain("RoutingFlow");
    expect(join).not.toMatch(/components\/preview/);
    expect(join).not.toMatch(/SplitVisualizer/);
    expect(join).not.toMatch(/Referral commission \(preview\)/i);
    expect(join).not.toMatch(/SIMULATED/i);

    expect(referral).toContain("REQUIRES CONTRACT");
    expect(referral).toContain("No router. No commission.");
    expect(referral).not.toMatch(/components\/preview/);
    expect(referral).not.toMatch(/simulated/i);
    expect(referral).not.toMatch(/CommissionByTierChart|SimReferralActivity|ReputationLeaderboard/);
  });

  it("keeps the Docs hub aligned with live cockpit and read-gated archive truth", () => {
    const docs = read("src/routes/docs.tsx");

    expect(docs).toContain("Patron Seal (ID 3) CONTRACT_GATED / PUBLIC_MINT_READ_GATED");
    expect(docs).toContain("other Artifacts sealed or reserved");
    expect(docs).not.toMatch(/other Artifacts inactive/);

    expect(docs).toContain("Live member cockpit");
    expect(docs).toContain('title: "My Syndicate"');
    expect(docs).toContain('status: "LIVE"');
    expect(docs).not.toMatch(/My Syndicate", purpose: "Your seat[\s\S]{0,180}status: "PENDING"/);
  });
});
