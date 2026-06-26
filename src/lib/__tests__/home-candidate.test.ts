import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  HOME_CANDIDATE_BOUNDARIES,
  HOME_CANDIDATE_CHANNELS,
  HOME_CANDIDATE_EPISODES,
  HOME_CANDIDATE_FOUNDER_DECISIONS,
  HOME_CANDIDATE_JOURNEY,
  HOME_CANDIDATE_LOOP,
  HOME_CANDIDATE_MODULES,
  HOME_CANDIDATE_POSITIONING,
  HOME_CANDIDATE_PROOF_POINTS,
  HOME_CANDIDATE_REVIEW_TOKEN,
  HOME_CANDIDATE_ROUTE,
  HOME_CANDIDATE_ROUTE_WITH_REVIEW,
  HOME_CANDIDATE_TRUST_BOUNDARIES,
  getHomeCandidateModule,
} from "../home-candidate";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

const repoRoot = process.cwd();

function read(rel: string) {
  return readFileSync(join(repoRoot, rel), "utf8");
}

describe("home candidate", () => {
  it("defines a hidden founder review route without production-home authority", () => {
    expect(HOME_CANDIDATE_REVIEW_TOKEN).toBe("SYNDICATE_HOME_CANDIDATE");
    expect(HOME_CANDIDATE_ROUTE).toBe("/labs/home-candidate");
    expect(HOME_CANDIDATE_ROUTE_WITH_REVIEW).toBe(
      "/labs/home-candidate?review=SYNDICATE_HOME_CANDIDATE",
    );

    expect(HOME_CANDIDATE_BOUNDARIES).toMatchObject({
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
      sourceControls: false,
      claimControls: false,
      replacesProductionHome: false,
      publicJoinDefaultSourceId: ZERO_SOURCE_ID,
      referralActive: false,
      publicSourceLinksActive: false,
      sourceDashboardActive: false,
      aliasRoutesActive: false,
      publicSourceAwareBuyPathActive: false,
      registrySwitch: false,
      contractChange: false,
      erc721Implementation: false,
      archiveEvolutionImplementation: false,
    });
  });

  it("chooses the proof-first institution blend with a visible member return loop", () => {
    expect(HOME_CANDIDATE_POSITIONING).toMatchObject({
      direction: "Proof-First Institution Home",
      emotionalSpine: "Living Protocol / Series Home",
      conversionStructure: "Member Journey Home",
      primaryPreviewAction: "Join / Take Your Seat",
    });
    expect(HOME_CANDIDATE_POSITIONING.rationale).toContain("proof close to story");
    expect(HOME_CANDIDATE_POSITIONING.rationale).toContain("future modules");

    expect(HOME_CANDIDATE_LOOP.map((step) => step.verb)).toEqual([
      "Join",
      "Prove",
      "Remember",
      "Return",
      "Evolve",
    ]);
    expect(HOME_CANDIDATE_LOOP.find((step) => step.id === "join")?.body).toContain(
      "ZERO_SOURCE_ID",
    );
    expect(HOME_CANDIDATE_LOOP.find((step) => step.id === "remember")?.body).toContain(
      "not financial rights",
    );
  });

  it("keeps live, read-only, inactive, in-review, and future modules separated", () => {
    expect(HOME_CANDIDATE_MODULES.map((module) => module.id)).toEqual([
      "membership-join",
      "my-syndicate",
      "activity",
      "transparency",
      "registry",
      "evolution",
      "archive-memory",
      "referral-verified-introduction",
      "seat-record-721",
      "archive-evolution",
    ]);

    expect(getHomeCandidateModule("membership-join")?.status).toBe("LIVE");
    expect(getHomeCandidateModule("membership-join")?.boundary).toContain("ZERO_SOURCE_ID");
    expect(getHomeCandidateModule("activity")?.status).toBe("READ_ONLY");
    expect(getHomeCandidateModule("archive-memory")?.status).toBe("LIVE_MEMORY");
    expect(getHomeCandidateModule("referral-verified-introduction")?.status).toBe("IN_REVIEW");
    expect(getHomeCandidateModule("seat-record-721")?.status).toBe("FUTURE");
    expect(getHomeCandidateModule("archive-evolution")?.status).toBe("FUTURE");

    const moduleCopy = HOME_CANDIDATE_MODULES.map((module) =>
      [module.label, module.promise, module.boundary].join(" "),
    ).join("\n");
    expect(moduleCopy).toContain("No public source link");
    expect(moduleCopy).toContain("No contract, claim path, or mint path");
    expect(moduleCopy).not.toMatch(/public referral is live|source links are live|claim UI is live/i);
  });

  it("answers proof, journey, episodes, boundaries, channels, and founder decisions", () => {
    expect(HOME_CANDIDATE_PROOF_POINTS.map((point) => point.id)).toEqual([
      "buy-target",
      "default-source",
      "receipt-routing",
      "capital-footprint",
      "verification-surfaces",
      "source-boundary",
    ]);
    expect(HOME_CANDIDATE_PROOF_POINTS.find((point) => point.id === "default-source")?.value).toBe(
      ZERO_SOURCE_ID,
    );

    expect(HOME_CANDIDATE_JOURNEY.map((step) => step.id)).toEqual([
      "visitor",
      "buyer",
      "member",
      "returning-member",
    ]);
    expect(HOME_CANDIDATE_JOURNEY.find((step) => step.id === "buyer")?.receives).toContain(
      "USDC routing proof",
    );

    expect(HOME_CANDIDATE_EPISODES.map((episode) => episode.id)).toEqual([
      "protocol-deployed",
      "v3-live",
      "source-proven-internally",
      "verified-introduction-review",
      "mvp-reality-map",
      "home-studio",
      "home-candidate",
    ]);
    expect(HOME_CANDIDATE_EPISODES.find((episode) => episode.id === "home-candidate")?.status).toBe(
      "HIDDEN_REVIEW",
    );

    expect(HOME_CANDIDATE_TRUST_BOUNDARIES).toContain("No public referral activation.");
    expect(HOME_CANDIDATE_TRUST_BOUNDARIES).toContain("No public source link.");
    expect(HOME_CANDIDATE_TRUST_BOUNDARIES).toContain("No claim UI.");
    expect(HOME_CANDIDATE_TRUST_BOUNDARIES).toContain("Production / is not replaced by this route.");
    expect(HOME_CANDIDATE_CHANNELS.map((channel) => channel.value)).toEqual([
      "https://x.com/TheSyndicateOne",
      "https://t.me/TheSyndicateMoney",
    ]);
    expect(HOME_CANDIDATE_CHANNELS.map((channel) => channel.label)).not.toContain("GitHub");
    expect(HOME_CANDIDATE_FOUNDER_DECISIONS.map((decision) => decision.id)).toEqual([
      "approve-direction",
      "revise-candidate",
      "reject-candidate",
    ]);
  });

  it("renders as a noindex direct-review labs route with no controls or public leaks", () => {
    const route = read("src/routes/labs.home-candidate.tsx");
    const model = read("src/lib/home-candidate.ts");
    const home = read("src/routes/index.tsx");
    const join = read("src/routes/join.tsx");
    const livePurchase = read("src/components/syndicate/LivePurchase.tsx");
    const saleHooks = read("src/lib/sale-hooks.ts");
    const referral = read("src/routes/referral.tsx");
    const header = read("src/components/syndicate/Header.tsx");
    const labsIndex = read("src/routes/labs.index.tsx");
    const sitemap = read("src/routes/sitemap[.]xml.ts");

    expect(route).toContain('createFileRoute("/labs/home-candidate")');
    expect(route).toContain("noindex, nofollow");
    expect(route).toContain("HOME_CANDIDATE_REVIEW_TOKEN");
    expect(route).toContain("data-wallet-controls");
    expect(route).toContain("data-buy-controls");
    expect(route).toContain("data-activation-controls");
    expect(route).toContain("data-source-controls");
    expect(route).toContain("data-claim-controls");
    expect(route).toContain("data-replaces-production-home");
    expect(route).toContain("Preview actions only");
    expect(route).not.toMatch(/useWriteContract|writeContract|sendTransaction|useSendTransaction|claimSourceEscrow|createSource\(/);
    expect(route).not.toContain("<button");
    expect(route).not.toContain("href=");

    expect(model).toContain("replacesProductionHome: false");
    expect(model).toContain("publicSourceAwareBuyPathActive: false");
    expect(model).toContain("SeatRecord721 is future, not live.");
    expect(model).toContain("No public source link.");
    expect(model).toContain("No source dashboard.");
    expect(model).toContain("No claim UI.");
    expect(model).not.toMatch(/passive income|\bROI\b|MLM|downline|upline|guaranteed return/i);
    expect(model).not.toMatch(/public referral is live|source links are live|claim UI is live/i);

    expect(home).not.toContain("HOME_CANDIDATE");
    expect(home).not.toContain("/labs/home-candidate");
    expect(join).toContain("LivePurchase");
    expect(livePurchase).toContain("ZERO_SOURCE_ID");
    expect(saleHooks).toContain("options.sourceId ?? ZERO_SOURCE_ID");
    expect(referral).toContain("noindex,nofollow");
    expect(referral).toContain("No commission.");
    expect(header).not.toContain("/labs/home-candidate");
    expect(labsIndex).not.toContain("/labs/home-candidate");
    expect(sitemap).not.toContain("/labs/home-candidate");
  });
});
