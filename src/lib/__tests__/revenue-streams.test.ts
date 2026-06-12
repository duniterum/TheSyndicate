// Batch 3b — revenue-streams registry doctrine pins.
//
// Pins the income-stream truth so a future pass cannot silently (a) conflate a
// separate stream with the 70/20/10 Membership Sale split, (b) flip an
// unreadable amount from PENDING to a fabricated/estimated figure, or (c) drift
// the displayed split away from VAULT_ALLOCATION.

import { describe, expect, it } from "vitest";
import { REVENUE_STREAMS, MEMBERSHIP_SPLIT } from "../revenue-streams";
import {
  VAULT_ALLOCATION,
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  isLiveAddress,
  explorerUrlFor,
} from "../syndicate-config";
import { findForbiddenLanguage } from "../protocol-language";

describe("revenue-streams registry — doctrine pins", () => {
  it("enumerates exactly three income streams", () => {
    expect(REVENUE_STREAMS.map((s) => s.id)).toEqual([
      "membership-sale",
      "nft-mints",
      "lp-fees",
    ]);
  });

  it("ONLY the Membership Sale is routed through the 70/20/10 split", () => {
    const routed = REVENUE_STREAMS.filter((s) => s.routedThroughMembershipSplit);
    expect(routed.map((s) => s.id)).toEqual(["membership-sale"]);
    expect(REVENUE_STREAMS.find((s) => s.id === "nft-mints")!.routedThroughMembershipSplit).toBe(false);
    expect(REVENUE_STREAMS.find((s) => s.id === "lp-fees")!.routedThroughMembershipSplit).toBe(false);
  });

  it("the membership split is projected from VAULT_ALLOCATION and sums to 100", () => {
    expect(MEMBERSHIP_SPLIT.map((s) => s.pct)).toEqual([70, 20, 10]);
    expect(MEMBERSHIP_SPLIT[0].pct).toBe(Math.round(VAULT_ALLOCATION.vaultAssets * 100));
    expect(MEMBERSHIP_SPLIT[1].pct).toBe(Math.round(VAULT_ALLOCATION.liquidityReinforcement * 100));
    expect(MEMBERSHIP_SPLIT[2].pct).toBe(Math.round(VAULT_ALLOCATION.operationsCommunity * 100));
    expect(MEMBERSHIP_SPLIT.reduce((a, s) => a + s.pct, 0)).toBe(100);
  });

  it("the NFT stream references the live Archive1155 contract", () => {
    const nft = REVENUE_STREAMS.find((s) => s.id === "nft-mints")!;
    expect(nft.proofLinks.some((l) => l.contractKey === "ARCHIVE_NFT_CONTRACT_ADDRESS")).toBe(true);
    expect(isLiveAddress(ARCHIVE_NFT_CONTRACT_ADDRESS)).toBe(true);
  });

  it("LP-fee and NFT amounts are PENDING — never a computed/estimated figure", () => {
    expect(REVENUE_STREAMS.find((s) => s.id === "lp-fees")!.amountStatus).toBe("pending");
    expect(REVENUE_STREAMS.find((s) => s.id === "nft-mints")!.amountStatus).toBe("pending");
  });

  it("only the Membership Sale carries a live on-chain figure", () => {
    expect(REVENUE_STREAMS.filter((s) => s.amountStatus === "live").map((s) => s.id)).toEqual([
      "membership-sale",
    ]);
  });

  it("every registry string is free of forbidden investment/yield framing", () => {
    for (const s of REVENUE_STREAMS) {
      const blob = `${s.label} ${s.source} ${s.destination} ${s.note}`;
      expect(findForbiddenLanguage(blob)).toEqual([]);
    }
  });

  it("every proof link resolves to a live on-chain explorer URL", () => {
    for (const s of REVENUE_STREAMS) {
      for (const l of s.proofLinks) {
        expect(explorerUrlFor(l.contractKey)).toBeTruthy();
      }
    }
  });
});
