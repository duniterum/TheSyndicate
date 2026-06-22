// ─── Seat Package Catalog (derived — no new vocabulary) ──────────────────
//
// A "package" is a friendly, purchasable presentation of an EXISTING rank
// tier — NOT a new parallel naming system. Every package is projected 1:1
// from RANKS_V2 (src/lib/syndicate-config.ts), so there is exactly one source
// of truth for thresholds and SYN amounts. Adding/renaming a tier happens in
// RANKS_V2 only; this catalog follows automatically.
//
// DOCTRINE:
//   • A package shows: entry USDC · SYN at the current V3 era rate · the rank it
//     maps to · a recognition-only tagline · who the path is for. No returns,
//     no payouts, no yield.
//   • Rank is recognition only — derived from cumulative USDC. A package does
//     not buy rights, discounts, or governance.
//   • Every tier is self-service: any amount above the $5 minimum is taken
//     online via wallet checkout at the current deterministic era price, up to the sale's
//     remaining on-chain SYN inventory. No tier is gated, manual, or off-site.
//   • Pure-data leaf: deterministic, reads no chain, writes nothing.

import { RANKS_V2, rankForUsdc, type RankTier } from "@/lib/syndicate-config";
import { currentEra, synForUsdcInEra } from "@/lib/eras";

export type SeatPackage = {
  /** Stable id, derived from the rank name (e.g. "inner-circle"). */
  id: string;
  /** The rank tier this package maps to (the source of truth). */
  rank: RankTier;
  /** Entry USDC — identical to the rank threshold. */
  usdc: number;
  /** SYN received at the current deterministic V3 era rate. */
  synAtGenesis: number;
  /** Headline card in the featured strip. */
  featured: boolean;
  /** The single "Start here" default path a first-time visitor should weigh first. */
  recommended: boolean;
  /** The headline high-conviction path among the featured set. */
  highConviction: boolean;
  /** Who this path is for — recognition framing, never financial. */
  forWhom: string;
  /** Recognition-only descriptor. Never financial framing. */
  tagline: string;
};

// Curated headline set — a clean arc from open entry to deep, high-conviction
// support (one per group). The full ladder still renders elsewhere
// (RankLadder); every tier is self-service and taken online via wallet
// checkout. The featured strip is curation only.
const FEATURED_NAMES = [
  "Citizen",
  "Operator",
  "Vanguard",
  "Steward",
  "Keystone",
  "Cornerstone",
] as const;

// The single default path surfaced as "Start here".
const RECOMMENDED_NAME = "Citizen";
// The headline high-conviction path among the featured set.
const HIGH_CONVICTION_NAME = "Cornerstone";

const TAGLINES: Readonly<Record<string, string>> = {
  Citizen: "Take your seat. Permanent on-chain entry.",
  Scout: "A clear early mark in the archive.",
  Operator: "An active, visible place in the order.",
  Builder: "A higher profile in the public record.",
  Strategist: "A considered, visible member profile.",
  Vanguard: "Stronger archive recognition.",
  Architect: "Deep-supporter recognition placement.",
  Steward: "Lasting recognition in the archive.",
  Custodian: "Public, durable archive recognition.",
  Keystone: "High-conviction recognition. Available online via wallet checkout.",
  "Inner Circle": "High-conviction recognition. Available online via wallet checkout.",
  Cornerstone: "The deepest archive recognition. Available online via wallet checkout.",
};

// Who each path is for — recognition framing only, no financial language.
const FOR_WHOM: Readonly<Record<string, string>> = {
  Citizen: "First-time members claiming a permanent seat.",
  Scout: "Early members marking the archive.",
  Operator: "Members who want an active, visible place.",
  Builder: "Members stepping into a higher public profile.",
  Strategist: "Considered members building a member profile.",
  Vanguard: "Committed members deepening their record.",
  Architect: "Deep supporters of the protocol.",
  Steward: "Long-term supporters of the archive.",
  Custodian: "Durable, public supporters of the record.",
  Keystone: "High-conviction members taking a deep seat.",
  "Inner Circle": "High-conviction members taking a deep seat.",
  Cornerstone: "The deepest-conviction members of the archive.",
};

function slugForRank(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/** All packages, projected 1:1 from RANKS_V2 (one per rank). */
export const SEAT_PACKAGES: ReadonlyArray<SeatPackage> = RANKS_V2.map((rank) => ({
  id: slugForRank(rank.name),
  rank,
  usdc: rank.usdc,
  synAtGenesis: synForUsdcInEra(rank.usdc, currentEra()),
  featured: (FEATURED_NAMES as ReadonlyArray<string>).includes(rank.name),
  recommended: rank.name === RECOMMENDED_NAME,
  highConviction: rank.name === HIGH_CONVICTION_NAME,
  forWhom: FOR_WHOM[rank.name] ?? "Members taking a permanent archive seat.",
  tagline: TAGLINES[rank.name] ?? "Permanent archive recognition.",
}));

/** Headline packages for the featured strip (all directly executable). */
export function featuredPackages(): ReadonlyArray<SeatPackage> {
  return SEAT_PACKAGES.filter((p) => p.featured);
}

/** Convenience: package by stable id. */
export function getPackageById(id: string): SeatPackage | undefined {
  return SEAT_PACKAGES.find((p) => p.id === id);
}

/** Convenience: package by rank name. */
export function getPackageByRankName(name: string): SeatPackage | undefined {
  return SEAT_PACKAGES.find((p) => p.rank.name === name);
}

/**
 * The next package above a member's cumulative USDC — the package that maps to
 * their NEXT rank. Returns null once the top tier is reached. Used by the
 * cockpit "next move" orchestrator so package and rank stay in lockstep.
 */
export function nextSeatPackage(cumulativeUsdc: number): SeatPackage | null {
  const { next } = rankForUsdc(cumulativeUsdc);
  if (!next) return null;
  return getPackageByRankName(next.name) ?? null;
}
