// ─── Report Registry (architecture only — no report is generated) ──────────
// Declares the SHAPE and SOURCES of the protocol's future periodic reports so
// the data layer is ready before any report page exists. Nothing here renders a
// public page or generates a document; every report is status PENDING.
//
// Each report declares what it DERIVES FROM — canonical metric ids (from the
// Protocol Metrics Registry, proven-real because they appear in the event
// pipeline's metric effects), event categories, the ledger, and the candidate
// layers. No new metric is invented here; reports only compose existing truth.

import type { ProtocolEventCategory } from "./protocol-event-registry";

export type ReportCadence =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "half-year"
  | "annual";

export const REPORT_CADENCE_LABEL: Record<ReportCadence, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  "half-year": "Half-Year",
  annual: "Annual",
};

export type ReportSourceRefs = {
  /** Canonical metric ids (see protocol-metrics-registry.ts). */
  metricIds: readonly string[];
  /** Event families the report summarizes. */
  eventCategories: readonly ProtocolEventCategory[];
  usesLedger: boolean;
  usesChronicleCandidates: boolean;
  usesRecognitionCandidates: boolean;
};

export type ReportDefinition = {
  id: string;
  cadence: ReportCadence;
  title: string;
  summary: string;
  /** Architecture only — no report is produced yet. */
  status: "PENDING";
  derivesFrom: ReportSourceRefs;
};

export const REPORT_REGISTRY: readonly ReportDefinition[] = [
  {
    id: "weekly-chronicle",
    cadence: "weekly",
    title: "Weekly Chronicle",
    summary:
      "A short weekly record of protocol-level moments: new members, burns, artifacts, and liquidity changes.",
    status: "PENDING",
    derivesFrom: {
      metricIds: ["members", "burnedSupply", "artifactsTotal", "lpTvl"],
      eventCategories: ["membership-sale", "burn", "archive", "lp"],
      usesLedger: false,
      usesChronicleCandidates: true,
      usesRecognitionCandidates: false,
    },
  },
  {
    id: "monthly-protocol-report",
    cadence: "monthly",
    title: "Monthly Protocol Report",
    summary:
      "Membership growth, USDC routed, SYN sold, supply reductions, and treasury movement for the month.",
    status: "PENDING",
    derivesFrom: {
      metricIds: [
        "members",
        "usdcRouted",
        "synSold",
        "burnedSupply",
        "circulatingSupply",
        "protocolWalletsTotal",
      ],
      eventCategories: ["membership-sale", "burn", "protocol-wallet"],
      usesLedger: true,
      usesChronicleCandidates: true,
      usesRecognitionCandidates: false,
    },
  },
  {
    id: "quarterly-protocol-report",
    cadence: "quarterly",
    title: "Quarterly Protocol Report",
    summary:
      "Quarterly state of membership, supply, liquidity, the archive, and recognition candidates.",
    status: "PENDING",
    derivesFrom: {
      metricIds: [
        "members",
        "usdcRouted",
        "synSold",
        "lpTvl",
        "burnedSupply",
        "circulatingSupply",
        "proofOfFireCount",
        "artifactsTotal",
        "protocolWalletsTotal",
      ],
      eventCategories: ["membership-sale", "burn", "archive", "lp", "protocol-wallet"],
      usesLedger: true,
      usesChronicleCandidates: true,
      usesRecognitionCandidates: true,
    },
  },
  {
    id: "half-year-protocol-report",
    cadence: "half-year",
    title: "Half-Year Protocol Report",
    summary:
      "Six-month review of growth, supply, treasury accounting, and chronicle-worthy moments.",
    status: "PENDING",
    derivesFrom: {
      metricIds: [
        "members",
        "usdcRouted",
        "synSold",
        "lpTvl",
        "burnedSupply",
        "circulatingSupply",
        "proofOfFireCount",
        "artifactsTotal",
        "protocolWalletsTotal",
      ],
      eventCategories: ["membership-sale", "burn", "archive", "lp", "protocol-wallet"],
      usesLedger: true,
      usesChronicleCandidates: true,
      usesRecognitionCandidates: true,
    },
  },
  {
    id: "annual-state-of-the-syndicate",
    cadence: "annual",
    title: "Annual State of The Syndicate",
    summary:
      "The full-year record: membership, economics, supply, liquidity, the archive, recognition, and the chronicle.",
    status: "PENDING",
    derivesFrom: {
      metricIds: [
        "members",
        "usdcRouted",
        "synSold",
        "lpTvl",
        "burnedSupply",
        "circulatingSupply",
        "proofOfFireCount",
        "artifactsTotal",
        "protocolWalletsTotal",
      ],
      eventCategories: ["membership-sale", "burn", "archive", "lp", "protocol-wallet"],
      usesLedger: true,
      usesChronicleCandidates: true,
      usesRecognitionCandidates: true,
    },
  },
];

export function reportById(id: string): ReportDefinition | undefined {
  return REPORT_REGISTRY.find((r) => r.id === id);
}

/** All distinct metric ids referenced across the report registry. */
export function allReferencedMetricIds(): string[] {
  return Array.from(
    new Set(REPORT_REGISTRY.flatMap((r) => r.derivesFrom.metricIds)),
  );
}
