// Wave: Inline proof drawers + canonical Story Timeline + indexer guard.
//
// Binding regressions:
//
//   • ProofChip is the canonical inline proof drawer and must be used
//     on Story So Far, Activity Heartbeat, and Milestone Approaching.
//   • StoryTimeline must derive episode order from PROTOCOL_MILESTONES
//     (canonical doctrine) — never from event recency — and must render
//     exactly ONE proof affordance per episode.
//   • VerifiedUpToBadge must mount on every surface that presents
//     canonical truth (Story So Far, Heartbeat, Milestone Approaching,
//     Story Timeline) so freshness is always visible.
//   • YourNextAction must gate its CTA on useIndexerGuard so a stale
//     indexer pauses speculative recommendations.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

describe("Proof drawer (ProofChip) is reused across canonical surfaces", () => {
  it("ProtocolStorySoFar uses ProofChip for the latest verified event", () => {
    const src = read("src/components/syndicate/ProtocolStorySoFar.tsx");
    expect(src.includes('from "./ProofChip"')).toBe(true);
    expect(/<ProofChip[\s\S]*kind="tx"/.test(src)).toBe(true);
  });
  it("ActivityHeartbeat uses ProofChip for the latest event", () => {
    const src = read("src/components/syndicate/ActivityHeartbeat.tsx");
    expect(src.includes('from "./ProofChip"')).toBe(true);
    expect(/<ProofChip[\s\S]*kind="tx"/.test(src)).toBe(true);
  });
  it("MilestoneApproachingTile uses ProofChip for the verifyHref", () => {
    const src = read("src/components/syndicate/MilestoneApproachingTile.tsx");
    expect(src.includes('from "./ProofChip"')).toBe(true);
    expect(/<ProofChip[\s\S]*kind="document"/.test(src)).toBe(true);
  });
});

describe("Canonical Story Timeline", () => {
  const src = read("src/components/syndicate/StoryTimeline.tsx");

  it("derives episode order from PROTOCOL_MILESTONES, not from event recency", () => {
    expect(src.includes("evaluateMilestones")).toBe(true);
    // Must not sort by event.blockNumber or timestamps.
    expect(/events\.sort|blockNumber\s*[-<>]/.test(src)).toBe(false);
  });

  it("renders one ProofChip per row (single verification link per episode)", () => {
    const matches = src.match(/<ProofChip/g) ?? [];
    expect(matches.length).toBe(1); // single template instance in the map
  });

  it("mounts on Home and /activity", () => {
    expect(read("src/routes/index.tsx").includes("<StoryTimeline")).toBe(true);
    expect(read("src/routes/activity.tsx").includes("<StoryTimeline")).toBe(true);
  });
});

describe("VerifiedUpToBadge — freshness is always visible on canonical surfaces", () => {
  for (const file of [
    "src/components/syndicate/ProtocolStorySoFar.tsx",
    "src/components/syndicate/ActivityHeartbeat.tsx",
    "src/components/syndicate/MilestoneApproachingTile.tsx",
    "src/components/syndicate/StoryTimeline.tsx",
    "src/components/syndicate/YourNextAction.tsx",
  ]) {
    it(`mounts VerifiedUpToBadge: ${file}`, () => {
      expect(read(file).includes("<VerifiedUpToBadge")).toBe(true);
    });
  }
});

describe("YourNextAction — graceful fallback when indexer is behind", () => {
  const src = read("src/components/syndicate/YourNextAction.tsx");

  it("reads the indexer guard", () => {
    expect(src.includes("useIndexerGuard")).toBe(true);
  });
  it("disables the CTA when recommendations are paused", () => {
    expect(src.includes("guard.disableRecommendations")).toBe(true);
    expect(/disabled\s*\n|\bdisabled\b/.test(src)).toBe(true);
    expect(src.includes('aria-disabled="true"')).toBe(true);
  });
});

describe("Indexer guard thresholds", () => {
  const src = read("src/lib/indexer-guard.ts");
  it("uses freshness signals, never localStorage", () => {
    expect(src.includes("useFreshnessSignals")).toBe(true);
    expect(/localStorage/i.test(src)).toBe(false);
  });
  it("exposes verifiedUpToBlock + disableRecommendations", () => {
    expect(src.includes("verifiedUpToBlock")).toBe(true);
    expect(src.includes("disableRecommendations")).toBe(true);
  });
});
