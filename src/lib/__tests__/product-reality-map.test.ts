import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  ACTION_ABILITY_MATRIX,
  MEMBER_REALITY_ITEMS,
  PRODUCT_REALITY_BOUNDARIES,
  PRODUCT_REALITY_DECISION_OPTIONS,
  PRODUCT_REALITY_PHASES,
  PRODUCT_REALITY_REVIEW_TOKEN,
  PRODUCT_REALITY_ROUTE_WITH_REVIEW,
  PRODUCT_REALITY_SURFACES,
  VERIFIED_INTRODUCTION_REALITY_ITEMS,
  getProductRealityMatrixRowsFor,
  getProductRealitySurface,
} from "../product-reality-map";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

const repoRoot = process.cwd();

function read(rel: string) {
  return readFileSync(join(repoRoot, rel), "utf8");
}

describe("product reality map", () => {
  it("summarizes the current MVP without making hidden or future modules live", () => {
    expect(PRODUCT_REALITY_REVIEW_TOKEN).toBe("SYNDICATE_MVP_REALITY");
    expect(PRODUCT_REALITY_ROUTE_WITH_REVIEW).toBe(
      "/labs/product-reality-map?review=SYNDICATE_MVP_REALITY",
    );

    expect(PRODUCT_REALITY_BOUNDARIES).toMatchObject({
      hidden: true,
      noindex: true,
      nofollow: true,
      directUrlOnly: true,
      absentFromPublicNavigation: true,
      absentFromSitemap: true,
      walletControls: false,
      buyControls: false,
      activationControls: false,
      publicJoinDefaultSourceId: ZERO_SOURCE_ID,
      referralActive: false,
      verifiedIntroductionLaunchApproved: false,
      verifiedIntroductionPublicControlsApproved: false,
    });

    const byId = new Map(PRODUCT_REALITY_SURFACES.map((surface) => [surface.id, surface]));
    expect(byId.get("join")?.status).toBe("LIVE");
    expect(byId.get("join")?.statusOnly).toContain("ZERO_SOURCE_ID");
    expect(byId.get("referral")?.status).toBe("INACTIVE");
    expect(byId.get("verified-introduction-review")?.status).toBe("HIDDEN_REVIEW");
    expect(byId.get("future-seat-record-721")?.status).toBe("FUTURE");
    expect(byId.get("future-nft-archive-evolution")?.status).toBe("FUTURE");

    expect(getProductRealitySurface("join")?.hiddenInternal).toContain(
      "Verified Introduction buyer skeleton is not mounted here",
    );
    expect(getProductRealitySurface("referral")?.hiddenInternal).toContain("No source link");
  });

  it("makes member reality and Verified Introduction reality clear for founder review", () => {
    expect(MEMBER_REALITY_ITEMS.map((item) => item.id)).toEqual([
      "connect-wallet",
      "buy-membership",
      "view-wallet-seat",
      "view-syn-usdc-receipt",
      "view-proof",
      "archive-memory",
      "source-referral-status",
      "seat-record-721",
    ]);
    expect(MEMBER_REALITY_ITEMS.find((item) => item.id === "source-referral-status")?.status).toBe(
      "INACTIVE",
    );
    expect(MEMBER_REALITY_ITEMS.find((item) => item.id === "seat-record-721")?.status).toBe(
      "FUTURE",
    );

    expect(VERIFIED_INTRODUCTION_REALITY_ITEMS.find((item) => item.id === "direction-approved")?.reality).toContain(
      "public launch remains unapproved",
    );
    expect(VERIFIED_INTRODUCTION_REALITY_ITEMS.find((item) => item.id === "not-live")?.reality).toContain(
      "public source-aware buys are not live",
    );
    expect(PRODUCT_REALITY_DECISION_OPTIONS.map((option) => option.id)).toEqual([
      "APPROVE_LAUNCH_CANDIDATE_PREPARATION_ONLY",
      "APPROVE_WITH_REVISIONS",
      "DEFER_PUBLIC_PRODUCT",
      "REJECT_V1_POSTURE",
    ]);
  });

  it("keeps the action ability matrix complete and conservative", () => {
    expect(ACTION_ABILITY_MATRIX.map((row) => row.action)).toEqual([
      "connect wallet",
      "buy membership",
      "view member status",
      "view receipts",
      "view USDC routed",
      "view SYN acquired",
      "view Activity",
      "view Registry proof",
      "generate source link",
      "use source link",
      "clear source",
      "see source identity",
      "see acquisition commission",
      "receive direct payout",
      "claim escrow",
      "view source dashboard",
      "create alias",
      "claim/mint SeatRecord721",
      "view Archive NFT",
      "share public profile",
      "receive recognition",
      "appear in Chronicle",
    ]);

    for (const action of [
      "generate source link",
      "use source link",
      "receive direct payout",
      "claim escrow",
      "view source dashboard",
      "create alias",
      "claim/mint SeatRecord721",
    ]) {
      expect(ACTION_ABILITY_MATRIX.find((row) => row.action === action)?.forbiddenNow).toBe(true);
    }

    expect(getProductRealityMatrixRowsFor("hiddenReviewOnly").map((row) => row.action)).toEqual([
      "clear source",
      "see source identity",
      "see acquisition commission",
    ]);
    expect(getProductRealityMatrixRowsFor("futureSeatRecordErc721").map((row) => row.action)).toEqual([
      "claim/mint SeatRecord721",
    ]);
  });

  it("keeps the V1/V2/later split from starting later modules", () => {
    const phases = new Map(PRODUCT_REALITY_PHASES.map((phase) => [phase.id, phase]));
    expect(phases.get("v1")?.items).toContain("MembershipSaleV3 only.");
    expect(phases.get("v1")?.items).toContain("Buyer-clearable back to ZERO_SOURCE_ID.");
    expect(phases.get("v1")?.items).toContain("No source dashboard.");
    expect(phases.get("v1")?.items).toContain("No claim UI.");
    expect(phases.get("v2")?.items).toContain("Source dashboard.");
    expect(phases.get("later")?.items).toContain("SeatRecord721 identity.");
    expect(phases.get("later")?.items).toContain("ProductSaleRouter.");
  });

  it("renders as a hidden noindex labs route with no action controls or public leaks", () => {
    const route = read("src/routes/labs.product-reality-map.tsx");
    const join = read("src/routes/join.tsx");
    const livePurchase = read("src/components/syndicate/LivePurchase.tsx");
    const saleHooks = read("src/lib/sale-hooks.ts");
    const referral = read("src/routes/referral.tsx");
    const header = read("src/components/syndicate/Header.tsx");
    const labsIndex = read("src/routes/labs.index.tsx");
    const sitemap = read("src/routes/sitemap[.]xml.ts");

    expect(route).toContain('createFileRoute("/labs/product-reality-map")');
    expect(route).toContain("noindex, nofollow");
    expect(route).toContain("PRODUCT_REALITY_REVIEW_TOKEN");
    expect(route).toContain("data-wallet-controls");
    expect(route).toContain("data-buy-controls");
    expect(route).toContain("data-activation-controls");
    expect(route).not.toMatch(/useWriteContract|writeContract|sendTransaction|useSendTransaction|claimSourceEscrow|createSource\(/);
    expect(route).not.toContain("<button");
    expect(route).not.toContain("href=");

    expect(join).toContain("LivePurchase");
    expect(livePurchase).toContain("ZERO_SOURCE_ID");
    expect(saleHooks).toContain("options.sourceId ?? ZERO_SOURCE_ID");
    expect(join).not.toContain("PRODUCT_REALITY_ROUTE_WITH_REVIEW");
    expect(referral).toContain("noindex,nofollow");
    expect(referral).toContain("No commission.");
    expect(header).not.toContain("/labs/product-reality-map");
    expect(labsIndex).not.toContain("/labs/product-reality-map");
    expect(sitemap).not.toContain("/labs/product-reality-map");
  });
});
