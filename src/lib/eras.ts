// ─── Distribution Era Schedule (additive — schedule layer) ───────────────
//
// SECOND coordinate system, layered ON TOP of the canonical Chapters
// (src/lib/chapters.ts), which are left UNTOUCHED. Chapters are the STORY
// layer (historical coordinates). Eras are the DISTRIBUTION layer — the
// proposed access-rate schedule for how SYN is distributed as the archive
// fills.
//
// DOCTRINE (binding — do not weaken):
//   • TODAY the Membership Sale is LIVE at a SINGLE fixed Genesis access rate:
//     1 SYN = $0.01 USDC, for every member. The V1 sale has NO on-chain era
//     stepping. Only Era I (Genesis) is LIVE.
//   • Eras II+ are a PROPOSED FUTURE distribution model. They are NOT live and
//     would require a future sale contract before any of them takes effect.
//     Every surface that shows a future era MUST label it FUTURE / not live.
//   • This is a pure-data leaf with deterministic helpers. It reads no chain,
//     writes nothing, and asserts no live status beyond Era I.
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
  /** LIVE only for Era I (Genesis). Every other era is FUTURE / not live. */
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
      "The founding cohort. The live era — seats taken at the fixed Genesis access rate.",
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
    blurb: "The first thousand seats. A proposed future era — not yet live.",
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
      "The protocol becomes a visible community. A proposed future era — not yet live.",
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
      "The first large public archive. A proposed future era — not yet live.",
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
      "The open era begins beyond the founding archive. A proposed future era — not yet live.",
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
    blurb: "The open era widens. A proposed future era — not yet live.",
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
    blurb: "Toward one hundred thousand seats. A proposed future era — not yet live.",
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
    blurb: "Toward a quarter million seats. A proposed future era — not yet live.",
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
    blurb: "Toward the first million seats. A proposed future era — not yet live.",
  },
] as const;

/** Plain-language doctrine note for any surface that shows the era schedule. */
export const ERA_SCHEDULE_NOTE =
  "Today the Membership Sale is live at a single fixed Genesis access rate (1 SYN = $0.01 USDC) for every member. The multi-era schedule below is a proposed future distribution model — it is not live and would require a future sale contract before any of it takes effect.";

const FALLBACK_ERA: Era = ERAS[ERAS.length - 1];

/** The one LIVE era today (Genesis / Era I). */
export function currentEra(): Era {
  return ERAS.find((e) => e.status === "LIVE") ?? ERAS[0];
}

/** True when an era is the proposed future schedule (anything past Genesis). */
export function isFutureEra(era: Era): boolean {
  return era.status === "FUTURE";
}

/**
 * Which era a member number falls inside under the proposed positional
 * schedule. Deterministic and pure. For numbers beyond Genesis this is a
 * PREVIEW mapping only — it does not imply a live or committed rate.
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
 * SYN a given USDC amount would receive in an era. Era I uses the real LIVE
 * access rate; future eras use their proposed (preview-only) schedule rate.
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
