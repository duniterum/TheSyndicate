import { describe, expect, it } from "vitest";

import {
  PROTOCOL_EVOLUTION_BOUNDARIES,
  PROTOCOL_EVOLUTION_EVIDENCE_KINDS,
  PROTOCOL_EVOLUTION_MODULES,
  PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT,
  PROTOCOL_EVOLUTION_STATUS_ORDER,
  getProtocolEvolutionEvidenceCount,
  getProtocolEvolutionStatusCounts,
} from "../protocol-evolution";
import {
  PROTOCOL_EVOLUTION_EPISODES,
  PROTOCOL_EVOLUTION_EPISODE_STATES,
  getProtocolEvolutionEpisodeCounts,
  getProtocolEvolutionEpisodesByState,
  getProtocolEvolutionLatestEpisode,
} from "../protocol-evolution-episodes";
import { ZERO_SOURCE_ID } from "../source-policy-observability";

describe("protocol evolution registry", () => {
  it("covers the expected protocol organism modules", () => {
    const ids = PROTOCOL_EVOLUTION_MODULES.map((module) => module.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "membership-engine",
        "source-attribution",
        "protocol-economy",
        "activity",
        "institutional-register",
        "member-os",
        "chronicle",
        "archive1155",
        "seatrecord721",
        "swaprail",
        "product-attribution",
        "reporting-tax-export",
        "notifications",
      ]),
    );
  });

  it("uses only canonical evolution statuses and evidence kinds", () => {
    const statuses = new Set(PROTOCOL_EVOLUTION_STATUS_ORDER);
    const evidenceKinds = new Set(PROTOCOL_EVOLUTION_EVIDENCE_KINDS);

    for (const module of PROTOCOL_EVOLUTION_MODULES) {
      expect(statuses.has(module.status), module.id).toBe(true);
      expect(module.evidence.length, module.id).toBeGreaterThan(0);
      for (const evidence of module.evidence) {
        expect(evidenceKinds.has(evidence.kind), `${module.id}:${evidence.label}`).toBe(true);
        expect(evidence.note.trim().length, `${module.id}:${evidence.label}`).toBeGreaterThan(0);
      }
    }
  });

  it("keeps source attribution paused without creating referral, claim, or public source behavior", () => {
    const source = PROTOCOL_EVOLUTION_MODULES.find((module) => module.id === "source-attribution");

    expect(source).toBeTruthy();
    expect(source?.status).toBe("PAUSED");
    expect(source?.currentTruth).toContain("1 source record");
    expect(source?.currentTruth).toContain("ZERO_SOURCE_ID");
    expect(source?.notLive).toContain("No referral activation");
    expect(source?.notLive).toContain("no claim UI");
    expect(PROTOCOL_EVOLUTION_SOURCE_RECORD_COUNT).toBe(1);
    expect(PROTOCOL_EVOLUTION_BOUNDARIES.join("\n")).toContain(ZERO_SOURCE_ID);
  });

  it("keeps future systems future or deferred until their own module intake exists", () => {
    const statusById = new Map(PROTOCOL_EVOLUTION_MODULES.map((module) => [module.id, module.status]));

    expect(statusById.get("seatrecord721")).toBe("FUTURE");
    expect(statusById.get("swaprail")).toBe("FUTURE");
    expect(statusById.get("product-attribution")).toBe("FUTURE");
    expect(statusById.get("reporting-tax-export")).toBe("DEFERRED");
    expect(statusById.get("notifications")).toBe("FUTURE");
  });

  it("summarizes statuses and evidence without empty buckets", () => {
    expect(getProtocolEvolutionEvidenceCount()).toBeGreaterThanOrEqual(PROTOCOL_EVOLUTION_MODULES.length);

    for (const entry of getProtocolEvolutionStatusCounts()) {
      expect(entry.count).toBeGreaterThan(0);
    }
  });

  it("adds an evidence-backed episode layer above the proof board", () => {
    const moduleIds = new Set(PROTOCOL_EVOLUTION_MODULES.map((module) => module.id));
    const episodeStates = new Set(PROTOCOL_EVOLUTION_EPISODE_STATES);

    expect(PROTOCOL_EVOLUTION_EPISODES.length).toBeGreaterThanOrEqual(5);
    expect(getProtocolEvolutionLatestEpisode()?.state).toBe("BECAME_TRUE");

    for (const episode of PROTOCOL_EVOLUTION_EPISODES) {
      expect(episodeStates.has(episode.state), episode.id).toBe(true);
      expect(episode.title.trim().length, episode.id).toBeGreaterThan(0);
      expect(episode.plainSummary.trim().length, episode.id).toBeGreaterThan(0);
      expect(episode.whyItMattersToMembers.trim().length, episode.id).toBeGreaterThan(0);
      expect(episode.proofToWatchNext.trim().length, episode.id).toBeGreaterThan(0);
      expect(episode.safetyBoundary.trim().length, episode.id).toBeGreaterThan(0);
      expect(episode.evidence.length, episode.id).toBeGreaterThan(0);
      for (const moduleId of episode.moduleIds) {
        expect(moduleIds.has(moduleId), `${episode.id}:${moduleId}`).toBe(true);
      }
    }

    expect(getProtocolEvolutionEpisodesByState("BECAME_TRUE").length).toBeGreaterThan(0);
    expect(getProtocolEvolutionEpisodeCounts().UNFOLDING).toBeGreaterThan(0);
  });

  it("keeps the source episode framed as internal rehearsal, not public referral activation", () => {
    const sourceEpisode = PROTOCOL_EVOLUTION_EPISODES.find(
      (episode) => episode.id === "source-policy-rehearsal",
    );

    expect(sourceEpisode).toBeTruthy();
    expect(sourceEpisode?.state).toBe("UNFOLDING");
    expect(sourceEpisode?.plainSummary).toContain("no referral activation");
    expect(sourceEpisode?.plainSummary).toContain("no claim UI");
    expect(sourceEpisode?.plainSummary).toContain("One internal PAUSED source record exists");
    expect(sourceEpisode?.proofToWatchNext).toContain("internal source-attributed receipt test");
    expect(sourceEpisode?.whatDidNotChange).toContain("Public/default buys remain direct");
  });

  it("does not contain activation or entitlement drift language", () => {
    const corpus = JSON.stringify({
      modules: PROTOCOL_EVOLUTION_MODULES,
      episodes: PROTOCOL_EVOLUTION_EPISODES,
      boundaries: PROTOCOL_EVOLUTION_BOUNDARIES,
    });

    expect(corpus).not.toMatch(/public referral is live/i);
    expect(corpus).not.toMatch(/source links are live/i);
    expect(corpus).not.toMatch(/claim UI is live/i);
    expect(corpus).not.toMatch(/passive income|yield-bearing|\bROI\b|guaranteed return|downline/i);
    expect(corpus).not.toMatch(/community vote|members voted|governance rights/i);
  });
});
