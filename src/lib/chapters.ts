// ─── Canonical Chapter Doctrine ──────────────────────────────────────────
//
// SINGLE source of truth for chapter ranges, labels, slugs, and helpers.
//
// Doctrine (locked by founder decision, see docs/PRE_CONTRACT_ALIGNMENT_AUDIT.md):
//
//   I   Genesis Signal       Member #1      – #333
//   II  First Thousand       Member #334    – #1,000
//   III The Expansion        Member #1,001  – #3,333
//   IV  First Ten Thousand   Member #3,334  – #10,000
//   V   Open Era             Member #10,001+
//
// Rules (carried forward, never relax):
//   • Chapters are historical coordinates only.
//   • Earlier chapters are earlier, not financially better.
//   • No rewards, no yield, no governance, no revenue share, no Vault rights.
//   • Chapter is a deterministic function of member number.
//   • Same boundaries are used everywhere — homepage, /chapters, /archive,
//     /nft, /members, /my-syndicate, /registry, /docs, /roadmap, and any
//     future SeatRecord721 metadata.
//
// IMPORTANT — keys are stable protocol identifiers. Renaming a key is a
// breaking change for any persisted state, URL slug, or indexer cursor.
// Labels and ranges are visitor-facing; keys are protocol-facing.

export type ChapterId =
  | "genesis-signal"      // members #1     – #333
  | "first-thousand"      // members #334   – #1,000
  | "the-expansion"       // members #1,001 – #3,333
  | "first-ten-thousand"  // members #3,334 – #10,000
  | "open-era";           // members #10,001+

export type Chapter = {
  /** Stable protocol identifier. Never rename. */
  id: ChapterId;
  /** 1-indexed roman position (1..5). */
  index: number;
  /** URL slug — matches `id` today, kept separate for future evolution. */
  slug: string;
  /** Visitor-facing chapter label, including the roman numeral prefix. */
  label: string;
  /** Visitor-facing label without the "Chapter I" prefix. */
  shortLabel: string;
  /** Visitor-facing range string ("#1 – #333"). */
  range: string;
  /** Lowest member number in this chapter (inclusive). */
  startN: number;
  /** Highest member number in this chapter (inclusive). null = unbounded. */
  endN: number | null;
  /** Total seats in this chapter. null = unbounded. */
  capacity: number | null;
  /** One-line meaning sentence. */
  blurb: string;
};

export const CHAPTERS: ReadonlyArray<Chapter> = [
  {
    id: "genesis-signal",
    index: 1,
    slug: "genesis-signal",
    label: "Chapter I — Genesis Signal",
    shortLabel: "Genesis Signal",
    range: "#1 – #333",
    startN: 1,
    endN: 333,
    capacity: 333,
    blurb:
      "The first signal. The founding cohort of The Syndicate — scarce, but not tiny.",
  },
  {
    id: "first-thousand",
    index: 2,
    slug: "first-thousand",
    label: "Chapter II — First Thousand",
    shortLabel: "First Thousand",
    range: "#334 – #1,000",
    startN: 334,
    endN: 1_000,
    capacity: 667,
    blurb:
      "The first public formation milestone — the protocol reaches one thousand members.",
  },
  {
    id: "the-expansion",
    index: 3,
    slug: "the-expansion",
    label: "Chapter III — The Expansion",
    shortLabel: "The Expansion",
    range: "#1,001 – #3,333",
    startN: 1_001,
    endN: 3_333,
    capacity: 2_333,
    blurb:
      "The protocol moves from early formation to a visible community.",
  },
  {
    id: "first-ten-thousand",
    index: 4,
    slug: "first-ten-thousand",
    label: "Chapter IV — First Ten Thousand",
    shortLabel: "First Ten Thousand",
    range: "#3,334 – #10,000",
    startN: 3_334,
    endN: 10_000,
    capacity: 6_667,
    blurb:
      "The first large public era — the formation phase becomes a permanent ten-thousand-member archive.",
  },
  {
    id: "open-era",
    index: 5,
    slug: "open-era",
    label: "Chapter V — Open Era",
    shortLabel: "Open Era",
    range: "#10,001 +",
    startN: 10_001,
    endN: null,
    capacity: null,
    blurb:
      "Open-ended protocol era after the founding archive. The Syndicate is open to all qualifying wallets.",
  },
] as const;

const FALLBACK: Chapter = CHAPTERS[CHAPTERS.length - 1];

/** Map a member number to its chapter. Deterministic, pure. */
export function getChapterByMemberNumber(memberNumber: number): Chapter {
  if (!Number.isFinite(memberNumber) || memberNumber < 1) return CHAPTERS[0];
  for (const c of CHAPTERS) {
    if (c.endN === null) return c;
    if (memberNumber <= c.endN) return c;
  }
  return FALLBACK;
}

/**
 * The chapter currently active given the total member count so far.
 * `memberCount` is the number of members already recorded — the next
 * member will be #(memberCount + 1).
 */
export function getActiveChapter(memberCount: number): Chapter {
  const nextNumber = Math.max(1, Math.floor(memberCount) + 1);
  return getChapterByMemberNumber(nextNumber);
}

/** Seats remaining in the currently-active chapter. Infinity if open-ended. */
export function getRemainingSeats(memberCount: number): number {
  const active = getActiveChapter(memberCount);
  if (active.endN === null) return Number.POSITIVE_INFINITY;
  return Math.max(0, active.endN - memberCount);
}

/** Progress through the currently-active chapter. */
export function getChapterProgress(memberCount: number): {
  chapter: Chapter;
  filled: number;
  target: number | null;
  pct: number;
} {
  const chapter = getActiveChapter(memberCount);
  if (chapter.endN === null || chapter.capacity === null) {
    return { chapter, filled: Math.max(0, memberCount), target: null, pct: 100 };
  }
  const filled = Math.max(0, Math.min(chapter.capacity, memberCount - (chapter.startN - 1)));
  const pct = Math.max(0, Math.min(100, (filled / chapter.capacity) * 100));
  return { chapter, filled, target: chapter.capacity, pct };
}

/** Convenience: chapter by slug. */
export function getChapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}

/** Convenience: chapter by id. */
export function getChapterById(id: ChapterId): Chapter {
  return CHAPTERS.find((c) => c.id === id) ?? FALLBACK;
}

/** Stable record-shaped label map for components that want a lookup. */
export const CHAPTER_LABEL: Readonly<Record<ChapterId, string>> = {
  "genesis-signal":      "Genesis Signal",
  "first-thousand":      "First Thousand",
  "the-expansion":       "The Expansion",
  "first-ten-thousand":  "First Ten Thousand",
  "open-era":            "Open Era",
};

export const CHAPTER_LABEL_WITH_RANGE: Readonly<Record<ChapterId, string>> = {
  "genesis-signal":      "Genesis Signal (#1 – #333)",
  "first-thousand":      "First Thousand (#334 – #1,000)",
  "the-expansion":       "The Expansion (#1,001 – #3,333)",
  "first-ten-thousand":  "First Ten Thousand (#3,334 – #10,000)",
  "open-era":            "Open Era (#10,001 +)",
};

/** True iff the member number is inside the founding cohort (Genesis Signal). */
export function isFounder(memberNumber: number): boolean {
  return memberNumber >= 1 && memberNumber <= 333;
}
