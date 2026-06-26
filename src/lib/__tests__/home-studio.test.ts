import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  EVOLUTION_VISIBILITY_STANDARD,
  FOUNDER_HOME_DECISIONS,
  HOME_BASELINE_FINDINGS,
  HOME_DIRECTIONS,
  HOME_STUDIO_BOUNDARIES,
  HOME_STUDIO_REVIEW_TOKEN,
  HOME_STUDIO_ROUTE,
  HOME_STUDIO_ROUTE_WITH_REVIEW,
  PUBLIC_DRIFT_AUDIT,
  getHomeDirection,
} from "../home-studio";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

const repoRoot = process.cwd();

function read(rel: string) {
  return readFileSync(join(repoRoot, rel), "utf8");
}

describe("home studio", () => {
  it("defines a hidden founder review route without public launch authority", () => {
    expect(HOME_STUDIO_REVIEW_TOKEN).toBe("SYNDICATE_HOME_STUDIO");
    expect(HOME_STUDIO_ROUTE).toBe("/labs/home-studio");
    expect(HOME_STUDIO_ROUTE_WITH_REVIEW).toBe(
      "/labs/home-studio?review=SYNDICATE_HOME_STUDIO",
    );

    expect(HOME_STUDIO_BOUNDARIES).toMatchObject({
      hidden: true,
      noindex: true,
      nofollow: true,
      directUrlOnly: true,
      absentFromPublicNavigation: true,
      absentFromSitemap: true,
      readOnly: true,
      walletControls: false,
      buyControls: false,
      activationControls: false,
      replacesProductionHome: false,
      publicJoinDefaultSourceId: ZERO_SOURCE_ID,
      referralActive: false,
      publicSourceLinksActive: false,
      sourceDashboardActive: false,
      claimUiActive: false,
      aliasRoutesActive: false,
      publicSourceAwareBuyPathActive: false,
      registrySwitch: false,
      contractChange: false,
    });
  });

  it("keeps candidate homepage directions as founder choices, not production changes", () => {
    expect(HOME_BASELINE_FINDINGS.map((finding) => finding.id)).toEqual([
      "first-viewport",
      "living-institution",
      "member-journey",
      "future-boundaries",
      "source-referral",
    ]);

    expect(HOME_DIRECTIONS.map((direction) => direction.id)).toEqual([
      "production-trust-home",
      "living-institution-home",
      "member-journey-home",
      "proof-first-institution-home",
    ]);

    for (const direction of HOME_DIRECTIONS) {
      expect(direction.status).toBe("CANDIDATE");
      expect(direction.preserves.join(" ")).not.toMatch(/referral activation|source link/i);
      expect(direction.risks.join(" ")).not.toMatch(/revenue guarantee|yield/i);
    }

    expect(getHomeDirection("proof-first-institution-home")?.bestFor).toContain(
      "70% trust and 30% aspiration",
    );
    expect(getHomeDirection("living-institution-home")?.preserves).toContain(
      "No future module activation.",
    );
  });

  it("defines a shared visibility standard that blocks fake-live future systems", () => {
    expect(EVOLUTION_VISIBILITY_STANDARD.map((item) => item.status)).toEqual([
      "LIVE",
      "READ_ONLY",
      "INACTIVE",
      "HIDDEN_REVIEW",
      "CANDIDATE",
      "FUTURE",
      "BLOCKED_NOW",
    ]);

    expect(
      EVOLUTION_VISIBILITY_STANDARD.find((item) => item.status === "INACTIVE")?.mustNotShow,
    ).toContain("Source links");
    expect(
      EVOLUTION_VISIBILITY_STANDARD.find((item) => item.status === "HIDDEN_REVIEW")?.mustNotShow,
    ).toContain("Public nav");
    expect(
      EVOLUTION_VISIBILITY_STANDARD.find((item) => item.status === "FUTURE")?.mustNotShow,
    ).toContain("Launch dates");
  });

  it("reports public drift without patching public routes in this slice", () => {
    expect(PUBLIC_DRIFT_AUDIT.map((finding) => finding.surface)).toEqual([
      "/",
      "/referral",
      "/join",
      "/archive and /nft",
      "/evolution",
    ]);
    expect(PUBLIC_DRIFT_AUDIT.find((finding) => finding.id === "join-zero-source")?.finding).toContain(
      "ZERO_SOURCE_ID",
    );
    expect(PUBLIC_DRIFT_AUDIT.find((finding) => finding.id === "home-proof-heavy")?.action).toContain(
      "approve a later homepage candidate",
    );

    expect(FOUNDER_HOME_DECISIONS.map((decision) => decision.id)).toEqual([
      "choose-home-direction",
      "approve-status-standard",
      "decide-public-drift-fixes",
    ]);
  });

  it("renders as a hidden noindex labs route with no action controls or public leaks", () => {
    const route = read("src/routes/labs.home-studio.tsx");
    const model = read("src/lib/home-studio.ts");
    const join = read("src/routes/join.tsx");
    const livePurchase = read("src/components/syndicate/LivePurchase.tsx");
    const saleHooks = read("src/lib/sale-hooks.ts");
    const referral = read("src/routes/referral.tsx");
    const header = read("src/components/syndicate/Header.tsx");
    const labsIndex = read("src/routes/labs.index.tsx");
    const sitemap = read("src/routes/sitemap[.]xml.ts");

    expect(route).toContain('createFileRoute("/labs/home-studio")');
    expect(route).toContain("noindex, nofollow");
    expect(route).toContain("HOME_STUDIO_REVIEW_TOKEN");
    expect(route).toContain("data-wallet-controls");
    expect(route).toContain("data-buy-controls");
    expect(route).toContain("data-activation-controls");
    expect(route).toContain("data-replaces-production-home");
    expect(route).not.toMatch(/useWriteContract|writeContract|sendTransaction|useSendTransaction|claimSourceEscrow|createSource\(/);
    expect(route).not.toContain("<button");
    expect(route).not.toContain("href=");

    expect(model).toContain("replacesProductionHome: false");
    expect(model).toContain("publicSourceAwareBuyPathActive: false");
    expect(model).toContain("SeatRecord721 stays future");
    expect(model).toContain("No future module activation.");
    expect(model).not.toMatch(/public referral is live|source links are live|claim UI is live/i);
    expect(model).not.toMatch(/passive income|\bROI\b|top earners?|guaranteed return/i);

    expect(join).toContain("LivePurchase");
    expect(livePurchase).toContain("ZERO_SOURCE_ID");
    expect(saleHooks).toContain("options.sourceId ?? ZERO_SOURCE_ID");
    expect(join).not.toContain("HOME_STUDIO_ROUTE_WITH_REVIEW");
    expect(referral).toContain("noindex,nofollow");
    expect(referral).toContain("No commission.");
    expect(header).not.toContain("/labs/home-studio");
    expect(labsIndex).not.toContain("/labs/home-studio");
    expect(sitemap).not.toContain("/labs/home-studio");
  });
});
