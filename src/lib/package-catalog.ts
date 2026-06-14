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
//   • High-conviction tiers are flagged `manual` (onboarding by review), so the
//     UI never offers a one-click buy for an amount that is handled manually.
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
  /** Requires manual onboarding (large tiers) — no one-click buy. */
  manual: boolean;
  /** Recognition-only descriptor. Never financial framing. */
  tagline: string;
};

// Curated headline set — a clean, directly-executable arc from entry to deep
// support. The full ladder still renders elsewhere (RankLadder). Featured
// packages are intentionally all non-manual so every card is one-click usable.
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
  Keystone: "High-conviction recognition — by manual onboarding.",
  "Inner Circle": "High-conviction recognition — by manual onboarding.",
  Cornerstone: "The deepest archive recognition — by manual review.",
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
  manual: Boolean(rank.manual),
  tagline: TAGLINES[rank.name] ?? "Permanent archive recognition.",
}));

/** Headline packages for the featured strip (all directly executable). */
export function featuredPackages(): ReadonlyArray<SeatPackage> {
  return SEAT_PACKAGES.filter((p) => p.featured);
}

/** Packages that can be taken with a single on-chain purchase (non-manual). */
export function executablePackages(): ReadonlyArray<SeatPackage> {
  return SEAT_PACKAGES.filter((p) => !p.manual);
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
