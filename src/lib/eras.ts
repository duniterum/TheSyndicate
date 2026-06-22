// ─── Distribution Era Schedule (additive — schedule layer) ───────────────
//
// SECOND coordinate system, layered ON TOP of the canonical Chapters
// (src/lib/chapters.ts), which are left UNTOUCHED. Chapters are the STORY
// layer (historical coordinates). Eras are the DISTRIBUTION layer — the
// deterministic V3 pricing schedule for how SYN is distributed as the archive
// fills. Chapter = history / belonging. Era = pricing.
//
// DOCTRINE (binding — do not weaken):
//   • V3 uses deterministic era pricing. Era I (Genesis) is the current active
//     era and currently returns 100 SYN per 1 USDC.
//   • Eras II+ are scheduled later pricing eras. They become active only by
//     the deterministic member-seat ranges, not by an admin price switch,
//     oracle, market price, or private rate.
//   • This is a pure-data leaf with deterministic helpers. It reads no chain,
//     writes nothing, and asserts no live status beyond the current active era.
//   • Eras I–IV share the Chapter I–IV member-number boundaries exactly.
//     Eras V–IX all fall inside Chapter V (Open Era, #10,001+).
//   • Capacities sum to exactly 1,000,000 seats (the "First Million").
//
// Verified against docs/proposals/ERA_ENGINE_V2_RECONCILIATION_SPRINT0.md:
//   entry-only distribution = 131,100,000 SYN of the sale pool; entry-only
//   USDC across all nine eras ≈ $94,323,340.

import { ACCESS_RATE_USDC_PER_SYN } from "@/lib/syndicate-config";
import type { ChapterId } from "@/lib/chapters";

export type EraId =
  | "genesis"
  | "first-thousand"
  | "the-expansion"
  | "first-ten-thousand"
  | "open-era-i"
  | "open-era-ii"
  | "hundred-thousand"
  | "quarter-million"
  | "first-million";

export type EraStatus = "LIVE" | "FUTURE";

export type Era = {
  /** Stable identifier. Never rename. */
  id: EraId;
  /** 1-indexed position (1..9). */
  index: number;
  /** Roman numeral label ("I".."IX"). */
  roman: string;
  /** Visitor-facing era name. */
  name: string;
  /** Lowest member number in this era (inclusive). */
  startMember: number;
  /** Highest member number in this era (inclusive). */
  endMember: number;
  /** Seats in this era (endMember - startMember + 1). */
  capacity: number;
  /** Illustrative entry USDC for this era — defines the era access rate. */
  entryUsdc: number;
  /** SYN received at the illustrative entry (entryUsdc ÷ rate). */
  synPerEntry: number;
  /** LIVE only for the current active era. Other eras are scheduled later eras. */
  status: EraStatus;
  /** Which canonical Chapter this era falls inside (link only — not owned). */
  chapterId: ChapterId;
  /** One-line meaning sentence. Recognition framing only. */
  blurb: string;
};

export const ERAS: ReadonlyArray<Era> = [
  {
    id: "genesis",
    index: 1,
    roman: "I",
    name: "Genesis",
    startMember: 1,
    endMember: 333,
    capacity: 333,
    entryUsdc: 5,
    synPerEntry: 500,
    status: "LIVE",
    chapterId: "genesis-signal",
    blurb:
      "The founding cohort. The current active era — 100 SYN per 1 USDC.",
  },
  {
    id: "first-thousand",
    index: 2,
    roman: "II",
    name: "First Thousand",
    startMember: 334,
    endMember: 1_000,
    capacity: 667,
    entryUsdc: 10,
    synPerEntry: 500,
    status: "FUTURE",
    chapterId: "first-thousand",
    blurb: "The first thousand seats. A scheduled later pricing era.",
  },
  {
    id: "the-expansion",
    index: 3,
    roman: "III",
    name: "The Expansion",
    startMember: 1_001,
    endMember: 3_333,
    capacity: 2_333,
    entryUsdc: 10,
    synPerEntry: 400,
    status: "FUTURE",
    chapterId: "the-expansion",
    blurb:
      "The protocol becomes a visible community. A scheduled later pricing era.",
  },
  {
    id: "first-ten-thousand",
    index: 4,
    roman: "IV",
    name: "First Ten Thousand",
    startMember: 3_334,
    endMember: 10_000,
    capacity: 6_667,
    entryUsdc: 25,
    synPerEntry: 400,
    status: "FUTURE",
    chapterId: "first-ten-thousand",
    blurb:
      "The first large public archive. A scheduled later pricing era.",
  },
  {
    id: "open-era-i",
    index: 5,
    roman: "V",
    name: "Open Era I",
    startMember: 10_001,
    endMember: 25_000,
    capacity: 15_000,
    entryUsdc: 25,
    synPerEntry: 300,
    status: "FUTURE",
    chapterId: "open-era",
    blurb:
      "The open era begins beyond the founding archive. A scheduled later pricing era.",
  },
  {
    id: "open-era-ii",
    index: 6,
    roman: "VI",
    name: "Open Era II",
    startMember: 25_001,
    endMember: 50_000,
    capacity: 25_000,
    entryUsdc: 50,
    synPerEntry: 300,
    status: "FUTURE",
    chapterId: "open-era",
    blurb: "The open era widens. A scheduled later pricing era.",
  },
  {
    id: "hundred-thousand",
    index: 7,
    roman: "VII",
    name: "Hundred Thousand",
    startMember: 50_001,
    endMember: 100_000,
    capacity: 50_000,
    entryUsdc: 50,
    synPerEntry: 200,
    status: "FUTURE",
    chapterId: "open-era",
    blurb: "Toward one hundred thousand seats. A scheduled later pricing era.",
  },
  {
    id: "quarter-million",
    index: 8,
    roman: "VIII",
    name: "Quarter Million",
    startMember: 100_001,
    endMember: 250_000,
    capacity: 150_000,
    entryUsdc: 100,
    synPerEntry: 200,
    status: "FUTURE",
    chapterId: "open-era",
    blurb: "Toward a quarter million seats. A scheduled later pricing era.",
  },
  {
    id: "first-million",
    index: 9,
    roman: "IX",
    name: "First Million",
    startMember: 250_001,
    endMember: 1_000_000,
    capacity: 750_000,
    entryUsdc: 100,
    synPerEntry: 100,
    status: "FUTURE",
    chapterId: "open-era",
    blurb: "Toward the first million seats. A scheduled later pricing era.",
  },
] as const;

/** Plain-language doctrine note for any surface that shows the era schedule. */
export const ERA_SCHEDULE_NOTE =
  "V3 uses deterministic era pricing. Era I is the current active era at 100 SYN per 1 USDC. Later eras use scheduled SYN-per-USDC rates as member-seat ranges advance. Chapter is history and belonging; era is pricing.";

const FALLBACK_ERA: Era = ERAS[ERAS.length - 1];

/** The one LIVE era today (Genesis / Era I). */
export function currentEra(): Era {
  return ERAS.find((e) => e.status === "LIVE") ?? ERAS[0];
}

/** True when an era is scheduled for a later member-seat range. */
export function isFutureEra(era: Era): boolean {
  return era.status === "FUTURE";
}

/**
 * Which era a member number falls inside under the deterministic positional
 * schedule. Pure; no chain read.
 */
export function eraForMemberNumber(memberNumber: number): Era {
  if (!Number.isFinite(memberNumber) || memberNumber < 1) return ERAS[0];
  for (const e of ERAS) {
    if (memberNumber <= e.endMember) return e;
  }
  return FALLBACK_ERA;
}

/** SYN received per 1 USDC in an era (entryUsdc defines the era rate). */
export function eraSynPerUsdc(era: Era): number {
  return era.entryUsdc > 0 ? era.synPerEntry / era.entryUsdc : 0;
}

/** USDC required per 1 SYN in an era — the era access rate. */
export function eraUsdcPerSyn(era: Era): number {
  return era.synPerEntry > 0 ? era.entryUsdc / era.synPerEntry : 0;
}

/**
 * SYN a given USDC amount would receive in an era. Era I uses the current
 * active rate; scheduled later eras use their deterministic schedule rate.
 */
export function synForUsdcInEra(usdc: number, era: Era): number {
  if (!Number.isFinite(usdc) || usdc <= 0) return 0;
  if (era.status === "LIVE") return usdc / ACCESS_RATE_USDC_PER_SYN;
  return usdc * eraSynPerUsdc(era);
}

/** The next era after a given one, or null at the end of the schedule. */
export function nextEra(era: Era): Era | null {
  return ERAS.find((e) => e.index === era.index + 1) ?? null;
}

/** Convenience: era by stable id. */
export function getEraById(id: EraId): Era {
  return ERAS.find((e) => e.id === id) ?? FALLBACK_ERA;
}

/**
 * The era at a 1-indexed schedule position — the exact shape of the on-chain
 * `currentEra()` getter (1 = Genesis … 9 = First Million). Returns undefined
 * for an out-of-range / unknown index so callers degrade to a neutral state
 * instead of guessing a rate. Pure; no chain read.
 */
export function eraByIndex(index: number | undefined): Era | undefined {
  if (
    index === undefined ||
    !Number.isInteger(index) ||
    index < 1 ||
    index > ERAS.length
  ) {
    return undefined;
  }
  return ERAS[index - 1];
}

/**
 * Minimum USDC entry for a 1-indexed era position. This is a VERIFIED mirror of
 * the immutable on-chain `_eraParams(...).minUsdc6` table in SyndicateSaleV2
 * (`entryUsdc` per era equals `minUsdc6` exactly for all nine eras — pinned by
 * eras-and-packages.test.ts). The contract does not expose a per-era minimum
 * getter (`quote()` returns the rate but not the minimum), so this mirror keyed
 * by the LIVE chain era is the smallest safe source for the UI minimum.
 * Returns undefined for an unknown era so callers can show a neutral state.
 */
export function eraMinUsdc(index: number | undefined): number | undefined {
  return eraByIndex(index)?.entryUsdc;
}
