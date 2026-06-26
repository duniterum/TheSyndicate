import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CONTRIBUTION_RECOGNITION_AXES,
  CONTRIBUTION_RECOGNITION_DOCTRINE,
  CONTRIBUTION_RECOGNITION_GUARDRAILS,
} from "../contribution-recognition";
import { RANKS_V2 } from "../syndicate-config";

const ROOT = join(__dirname, "..", "..", "..");

const RUNTIME_FILES = [
  "src/routes/index.tsx",
  "src/routes/join.tsx",
  "src/routes/my-syndicate.tsx",
  "src/routes/activity.tsx",
  "src/routes/transparency.tsx",
  "src/routes/registry.tsx",
  "src/routes/institutional-register.tsx",
  "src/routes/knowledge-map.tsx",
  "src/routes/evolution.tsx",
  "src/routes/referral.tsx",
  "src/routes/archive.tsx",
  "src/routes/nft.tsx",
  "src/routes/member.$number.tsx",
  "src/routes/wallet.$address.tsx",
  "src/routes/roadmap.tsx",
  "src/routes/ranks.tsx",
  "src/routes/docs.tsx",
  "src/components/syndicate/RankHub.tsx",
  "src/components/syndicate/JoinPackages.tsx",
  "src/components/syndicate/LivePurchase.tsx",
  "src/components/syndicate/MemberCard.tsx",
  "src/components/syndicate/HomeProgressionTeaser.tsx",
  "src/components/syndicate/CanonicalSpec.tsx",
  "src/components/syndicate/WhatChangesAfterJoining.tsx",
  "src/components/syndicate/FaqRebuilt.tsx",
  "src/components/syndicate/Sections.tsx",
  "src/components/syndicate/IdentityZone.tsx",
  "src/components/syndicate/MemberShareCard.tsx",
  "src/components/syndicate/PatronSealReadiness.tsx",
  "src/components/syndicate/cockpit/CockpitCollector.tsx",
  "src/components/syndicate/cockpit/CockpitNextMove.tsx",
  "src/components/syndicate/cockpit/CockpitProof.tsx",
  "src/components/syndicate/cockpit/MemberCockpit.tsx",
  "src/components/syndicate/cockpit/SeatsAroundYou.tsx",
  "src/lib/activity-filters.ts",
  "src/lib/activity-milestones.ts",
  "src/lib/archive-config.ts",
  "src/lib/archive-preview-catalog.ts",
  "src/lib/archive-truth-states.ts",
  "src/lib/chronicle-promotion-registry.ts",
  "src/lib/chronicle-review-candidates.ts",
  "src/lib/memory-candidates.ts",
  "src/lib/next-best-action.ts",
  "src/lib/og-templates.ts",
  "src/lib/package-catalog.ts",
  "src/lib/protocol-commerce-receipt.ts",
  "src/lib/protocol-event-intelligence.ts",
  "src/lib/protocol-events.ts",
  "src/lib/protocol-knowledge-map.ts",
  "src/lib/protocol-metrics-registry.ts",
  "src/lib/protocol-signals.ts",
  "src/lib/quest-hooks.ts",
  "src/lib/home-candidate.ts",
  "src/labs/components/HomeJoinPreview.tsx",
  "src/labs/components/HomeRankLadder.tsx",
  "src/labs/components/SmartContractFlow.tsx",
  "src/labs/components/RankSimulator.tsx",
  "src/labs/components/RankIntelligence.tsx",
  "src/labs/components/ShareableCards.tsx",
  "src/labs/components/WhyJoinNow.tsx",
  "src/labs/components/MemberJourney.tsx",
  "src/labs/components/MemberCockpitCandidate.tsx",
] as const;

const FORBIDDEN_RUNTIME_PATTERNS: Array<[string, RegExp]> = [
  ["rank unlocked", /Rank unlocked/i],
  ["rank ladder", /The Rank Ladder/i],
  ["rank reflected", /Rank reflected|Rank Reflected/i],
  ["first rank unlock", /First rank you'd unlock/i],
  ["rank derived from cumulative USDC", /Rank is derived from cumulative USDC/i],
  ["membership rank", /membership rank/i],
  ["rank as wallet copy", /your rank reflects/i],
  ["rank as utility", /utility access for rank/i],
  ["rank system", /rank system/i],
  ["recognition rank", /recognition rank/i],
  ["ranks leaderboard", /Ranks leaderboard/i],
  ["chapter rank pairing", /chapter, rank/i],
  ["next rank label", /Next rank/i],
  ["rank-or-chapter holder copy", /rank, or a chapter/i],
  ["routing-impact rank copy", /routing impact, rank/i],
  ["pay to rank", /Pay-to-rank/i],
  ["rank unlocked label", /Rank Unlocked/i],
  ["rank intelligence label", /Rank Intelligence/i],
  ["rank distribution label", /Rank Distribution/i],
  ["closest to next rank label", /Closest to Next Rank/i],
  ["rank recognition proof claim", /Rank \/ recognition/i],
  ["rank reflects copy", /Rank reflects/i],
  ["reach vanguard rank", /Reach Vanguard Rank/i],
  ["operator rank referral copy", /Operator rank/i],
  ["rank attribute copy", /Rank attribute/i],
  ["number chapter rank copy", /number, chapter, and rank/i],
  ["governance vote weight promise", /Proposal eligibility, voting weight/i],
  ["bigger entries change membership rank", /Bigger (?:entries|amounts).*membership rank/i],
  ["purchasable rank", /purchasable rank/i],
  ["bought title", /\b(?:buy|buys|buying|purchase|purchases|purchasing)\b[^.\n]{0,80}\b(?:title|status tier)\b/i],
  ["Genesis Circle rank name", /Genesis Circle/i],
  ["retired multiplier", /scoreMultiplier|Compounder Score/i],
];

describe("contribution recognition doctrine", () => {
  it("keeps capital visible without making capital the whole identity", () => {
    expect(CONTRIBUTION_RECOGNITION_DOCTRINE.seatIdentity).toBe("Seat identity is binary.");
    expect(CONTRIBUTION_RECOGNITION_DOCTRINE.contributionDepth).toBe("Contribution depth is variable.");
    expect(CONTRIBUTION_RECOGNITION_DOCTRINE.recognition).toBe(
      "Recognition is multi-axis and evolves over time.",
    );
    expect(CONTRIBUTION_RECOGNITION_DOCTRINE.capital).toBe(
      "The Syndicate recognizes capital without reducing identity to capital.",
    );
    expect(CONTRIBUTION_RECOGNITION_DOCTRINE.capitalFootprint).toContain(
      "verified USDC routed",
    );
    expect(CONTRIBUTION_RECOGNITION_DOCTRINE.capitalFootprint).toContain(
      "one recognition axis",
    );
  });

  it("includes capital and non-capital recognition axes", () => {
    expect(CONTRIBUTION_RECOGNITION_AXES).toContain("verified USDC routed");
    expect(CONTRIBUTION_RECOGNITION_AXES).toContain("builder work");
    expect(CONTRIBUTION_RECOGNITION_AXES).toContain("verified introductions");
    expect(CONTRIBUTION_RECOGNITION_AXES).toContain("time and continuity");
    expect(CONTRIBUTION_RECOGNITION_GUARDRAILS.join(" ")).toMatch(
      /No rank or band grants payout, yield, governance rights, Vault claim, discount, or private terms\./,
    );
  });

  it("keeps retired identity-colliding tier names out of the live band set", () => {
    const names = RANKS_V2.map((rank) => rank.name);
    expect(names).not.toContain("Founder");
    expect(names).not.toContain("Genesis Circle");
  });

  it("keeps runtime and hidden-review copy off bought-title rank framing", () => {
    for (const file of RUNTIME_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const [name, pattern] of FORBIDDEN_RUNTIME_PATTERNS) {
        expect(pattern.test(source), `${file} contains forbidden ${name}`).toBe(false);
      }
    }
  });

  it("requires the main surfaces to teach capital footprint correctly", () => {
    const corpus = RUNTIME_FILES.map((file) => readFileSync(join(ROOT, file), "utf8")).join("\n");
    expect(corpus).toContain("Capital footprint");
    expect(corpus).toContain("contribution depth");
    expect(corpus).toContain("verified USDC routed");
    expect(corpus).toContain("one recognition axis");
    expect(corpus).toContain("The Syndicate recognizes capital without reducing identity to capital");
  });
});
