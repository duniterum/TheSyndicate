// ─── Seat Package Catalog (derived — no new vocabulary) ──────────────────
//
// A "package" is a friendly, purchasable presentation of an EXISTING rank
// tier — NOT a new parallel naming system. Every package is projected 1:1
// from RANKS_V2 (src/lib/syndicate-config.ts), so there is exactly one source
// of truth for thresholds and SYN amounts. Adding/renaming a tier happens in
// RANKS_V2 only; this catalog follows automatically.
//
// DOCTRINE:
//   • A package shows: entry USDC · SYN at the live Genesis rate · the rank it
//     unlocks · a recognition-only tagline. No returns, no payouts, no yield.
//   • Rank is recognition only — derived from cumulative USDC. A package does
//     not buy rights, discounts, or governance.
//   • Every tier is self-service: any amount above the $5 minimum is taken
//     online via wallet checkout at the same fixed rate, up to the sale's
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
  /** SYN received at the live Genesis access rate (= rank.syn). */
  synAtGenesis: number;
  /** Headline card in the featured strip. */
  featured: boolean;
  /** Recognition-only descriptor. Never financial framing. */
  tagline: string;
};

// Curated headline set — a clean arc from entry to deep support. The full
// ladder still renders elsewhere (RankLadder); every tier is self-service and
// taken online via wallet checkout. The featured strip is curation only.
const FEATURED_NAMES = ["Citizen", "Operator", "Vanguard", "Steward"] as const;

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
