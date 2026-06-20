import { describe, expect, it } from "vitest";
import {
  V3_ERA_PREVIEW,
  V3_PUBLIC_SOURCE_PROGRESSION,
  V3_SOURCE_CLASSES,
  previewV3Quote,
} from "../v3-preview";

describe("V3 preview model", () => {
  it("keeps the frozen V3 era schedule visible without marking it live", () => {
    expect(V3_ERA_PREVIEW.map((era) => era.era)).toEqual([
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ]);
    expect(V3_ERA_PREVIEW[0]).toMatchObject({
      seatRange: "#1 - #333",
      synPerUsdc: 100,
      impliedSynPrice: 0.01,
      minimumUsdc: 5,
    });
    expect(V3_ERA_PREVIEW[8]).toMatchObject({
      seatRange: "#250,001 - #1,000,000",
      synPerUsdc: 1,
      impliedSynPrice: 1,
      minimumUsdc: 100,
    });
  });

  it("models acquisition-first routing with reconstructable conservation", () => {
    const quote = previewV3Quote({
      grossUsdc: 1_000,
      era: V3_ERA_PREVIEW[2],
      source: V3_PUBLIC_SOURCE_PROGRESSION[2],
    });

    expect(quote).toMatchObject({
      grossUsdc: 1_000,
      commissionBps: 800,
      acquisitionCost: 80,
      protocolContribution: 920,
      vaultAmount: 644,
      liquidityAmount: 184,
      operationsAmount: 92,
      synDelivered: 40_000,
    });
    expect(
      quote.acquisitionCost +
        quote.vaultAmount +
        quote.liquidityAmount +
        quote.operationsAmount,
    ).toBe(quote.grossUsdc);
  });

  it("keeps source classes and public progression bounded as candidate policy", () => {
    expect(V3_SOURCE_CLASSES.map((source) => source.sourceClass)).toEqual([
      "MEMBER_INTRODUCTION",
      "BUILDER_SOURCE",
      "AFFILIATE",
      "BD_NETWORK",
      "WHITELABEL",
      "SPONSORSHIP",
      "TREASURY_DEAL",
    ]);

    expect(V3_PUBLIC_SOURCE_PROGRESSION.map((row) => row.recognition)).toEqual([
      "Signal",
      "Advocate",
      "Connector",
      "Catalyst",
      "Ambassador",
      "Chapter Source",
    ]);
    expect(Math.max(...V3_PUBLIC_SOURCE_PROGRESSION.map((row) => row.commissionBps))).toBe(1500);
    expect(V3_PUBLIC_SOURCE_PROGRESSION.at(-1)).toMatchObject({
      status: "PENDING",
      reviewRequired: true,
    });
  });
});
