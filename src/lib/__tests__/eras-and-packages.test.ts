import { describe, it, expect } from "vitest";
import {
  ERAS,
  ERA_SCHEDULE_NOTE,
  currentEra,
  isFutureEra,
  eraForMemberNumber,
  eraSynPerUsdc,
  synForUsdcInEra,
  nextEra,
  getEraById,
  eraByIndex,
  eraMinUsdc,
} from "@/lib/eras";
import {
  SEAT_PACKAGES,
  featuredPackages,
  nextSeatPackage,
  getPackageByRankName,
} from "@/lib/package-catalog";
import {
  RANKS_V2,
  ACCESS_RATE_USDC_PER_SYN,
  rankForUsdc,
} from "@/lib/syndicate-config";
import { CHAPTERS } from "@/lib/chapters";
import { findForbiddenLanguage } from "@/lib/protocol-language";

// Broader banlist than protocol-language's FORBIDDEN_LANGUAGE: also covers the
// ownership / price-stability framing that the site-level guards forbid.
const EXTRA_BANNED = [
  "ownership",
  "profit",
  "peg",
  "price floor",
  "price support",
  "stable price",
  "binding governance",
];
function extraBanned(text: string): string[] {
  const lower = text.toLowerCase();
  return EXTRA_BANNED.filter((t) => lower.includes(t));
}

describe("eras — schedule integrity", () => {
  it("has nine eras in order", () => {
    expect(ERAS).toHaveLength(9);
    ERAS.forEach((e, i) => expect(e.index).toBe(i + 1));
  });

  it("member ranges are contiguous with no gaps or overlaps", () => {
    expect(ERAS[0].startMember).toBe(1);
    for (let i = 1; i < ERAS.length; i++) {
      expect(ERAS[i].startMember).toBe(ERAS[i - 1].endMember + 1);
    }
  });

  it("capacities sum to exactly 1,000,000 seats", () => {
    const total = ERAS.reduce((s, e) => s + e.capacity, 0);
    expect(total).toBe(1_000_000);
    ERAS.forEach((e) =>
      expect(e.capacity).toBe(e.endMember - e.startMember + 1),
    );
  });

  it("only Genesis (Era I) is LIVE; every other era is FUTURE", () => {
    expect(ERAS[0].id).toBe("genesis");
    expect(ERAS[0].status).toBe("LIVE");
    expect(currentEra().id).toBe("genesis");
    ERAS.slice(1).forEach((e) => {
      expect(e.status).toBe("FUTURE");
      expect(isFutureEra(e)).toBe(true);
    });
    expect(isFutureEra(currentEra())).toBe(false);
  });

  it("Genesis rate equals the live access rate", () => {
    const genesis = currentEra();
    expect(genesis.entryUsdc / genesis.synPerEntry).toBeCloseTo(
      ACCESS_RATE_USDC_PER_SYN,
      10,
    );
    expect(synForUsdcInEra(5, genesis)).toBe(500);
    expect(synForUsdcInEra(100, genesis)).toBe(10_000);
  });

  it("future-era SYN uses the proposed schedule rate", () => {
    const firstThousand = getEraById("first-thousand");
    expect(eraSynPerUsdc(firstThousand)).toBe(50); // 500 SYN / $10
    expect(synForUsdcInEra(10, firstThousand)).toBe(500);
  });

  it("eras I–IV align exactly with chapter I–IV boundaries", () => {
    const map: Array<[string, string]> = [
      ["genesis", "genesis-signal"],
      ["first-thousand", "first-thousand"],
      ["the-expansion", "the-expansion"],
      ["first-ten-thousand", "first-ten-thousand"],
    ];
    for (const [eraId, chapterId] of map) {
      const era = getEraById(eraId as never);
      const chapter = CHAPTERS.find((c) => c.id === chapterId)!;
      expect(era.startMember).toBe(chapter.startN);
      expect(era.endMember).toBe(chapter.endN);
      expect(era.chapterId).toBe(chapterId);
    }
  });

  it("eras V–IX all live inside Chapter V (Open Era)", () => {
    ERAS.slice(4).forEach((e) => {
      expect(e.chapterId).toBe("open-era");
      expect(e.startMember).toBeGreaterThan(10_000);
    });
  });

  it("eraForMemberNumber maps positions correctly", () => {
    expect(eraForMemberNumber(1).id).toBe("genesis");
    expect(eraForMemberNumber(333).id).toBe("genesis");
    expect(eraForMemberNumber(334).id).toBe("first-thousand");
    expect(eraForMemberNumber(10_000).id).toBe("first-ten-thousand");
    expect(eraForMemberNumber(10_001).id).toBe("open-era-i");
    expect(eraForMemberNumber(1_000_000).id).toBe("first-million");
    expect(eraForMemberNumber(0).id).toBe("genesis");
  });

  it("nextEra walks the schedule and stops at the end", () => {
    expect(nextEra(ERAS[0])?.id).toBe("first-thousand");
    expect(nextEra(ERAS[ERAS.length - 1])).toBeNull();
  });

  it("eraByIndex maps the 1-indexed on-chain era position, guarding out-of-range", () => {
    expect(eraByIndex(1)?.id).toBe("genesis");
    expect(eraByIndex(9)?.id).toBe("first-million");
    ERAS.forEach((e, i) => expect(eraByIndex(i + 1)).toBe(e));
    // Out-of-range / unknown → undefined (callers degrade to neutral, never guess).
    expect(eraByIndex(0)).toBeUndefined();
    expect(eraByIndex(10)).toBeUndefined();
    expect(eraByIndex(undefined)).toBeUndefined();
    expect(eraByIndex(1.5)).toBeUndefined();
  });

  it("eraMinUsdc mirrors the on-chain SyndicateSaleV2 _eraParams minUsdc6 table", () => {
    // VERIFIED against contracts/src/SyndicateSaleV2.sol `_eraParams(...).minUsdc6`
    // (USDC has 6 decimals → these are the $-denominated minimums). The contract
    // has no per-era minimum getter, so this mirror keyed by the live chain era
    // is the UI's only safe source. If `entryUsdc` ever drifts from these, the
    // purchase UI minimum would silently diverge from the contract — fail loudly.
    const ON_CHAIN_MIN_USDC = [5, 10, 10, 25, 25, 50, 50, 100, 100];
    ON_CHAIN_MIN_USDC.forEach((min, i) => {
      expect(eraMinUsdc(i + 1)).toBe(min);
      expect(ERAS[i].entryUsdc).toBe(min);
    });
    expect(eraMinUsdc(undefined)).toBeUndefined();
    expect(eraMinUsdc(0)).toBeUndefined();
    expect(eraMinUsdc(10)).toBeUndefined();
  });
});

describe("eras — verified tokenomics totals (Sprint 0)", () => {
  it("entry-only SYN distribution = 131,100,000", () => {
    const total = ERAS.reduce((s, e) => s + e.capacity * e.synPerEntry, 0);
    expect(total).toBe(131_100_000);
  });

  it("entry-only USDC across all eras ≈ $94,323,340", () => {
    const total = ERAS.reduce((s, e) => s + e.capacity * e.entryUsdc, 0);
    expect(total).toBe(94_323_340);
  });
});

describe("packages — derived 1:1 from RANKS_V2", () => {
  it("one package per rank, thresholds and SYN match exactly", () => {
    expect(SEAT_PACKAGES).toHaveLength(RANKS_V2.length);
    SEAT_PACKAGES.forEach((p) => {
      expect(p.usdc).toBe(p.rank.usdc);
      expect(p.synAtGenesis).toBe(p.rank.syn); // Genesis rate ⇒ usdc × 100
      expect(p.synAtGenesis).toBe(p.rank.usdc * 100);
    });
  });

  it("every rank has exactly one self-service package (none gated)", () => {
    expect(SEAT_PACKAGES).toHaveLength(RANKS_V2.length);
    RANKS_V2.forEach((r) => expect(getPackageByRankName(r.name)).toBeDefined());
    const featured = featuredPackages();
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });

  it("featured strip is the curated six, with one recommended + one high-conviction", () => {
    const featured = featuredPackages();
    expect(featured.map((p) => p.rank.name)).toEqual([
      "Citizen",
      "Operator",
      "Vanguard",
      "Steward",
      "Keystone",
      "Cornerstone",
    ]);
    // Exactly one default "Start here" path, and it is the entry tier.
    const recommended = SEAT_PACKAGES.filter((p) => p.recommended);
    expect(recommended.map((p) => p.rank.name)).toEqual(["Citizen"]);
    // Exactly one high-conviction headline, and it is the deepest tier.
    const highConviction = SEAT_PACKAGES.filter((p) => p.highConviction);
    expect(highConviction.map((p) => p.rank.name)).toEqual(["Cornerstone"]);
  });

  it("every package carries a non-empty forWhom descriptor", () => {
    SEAT_PACKAGES.forEach((p) => {
      expect(typeof p.forWhom).toBe("string");
      expect(p.forWhom.trim().length).toBeGreaterThan(0);
    });
  });

  it("no package or rank presents manual / off-site onboarding", () => {
    const ONBOARDING_BANNED = [
      "manual",
      "concierge",
      "assisted",
      "private onboarding",
      "gated access",
      "contact us",
      "apply to join",
    ];
    const surfaces = [
      ...SEAT_PACKAGES.map((p) => p.tagline),
      ...SEAT_PACKAGES.map((p) => p.forWhom),
      ...RANKS_V2.flatMap((r) => r.benefits),
    ];
    for (const s of surfaces) {
      const lower = s.toLowerCase();
      expect(ONBOARDING_BANNED.filter((t) => lower.includes(t))).toEqual([]);
    }
  });

  it("nextSeatPackage tracks the next rank threshold", () => {
    // Citizen ($5) cumulative → next package is Scout ($10).
    const fromCitizen = nextSeatPackage(5);
    expect(fromCitizen?.rank.name).toBe(rankForUsdc(5).next?.name);
    expect(fromCitizen?.rank.name).toBe("Scout");
    // Top tier has no next package.
    expect(nextSeatPackage(10_000)).toBeNull();
  });

  it("packages resolve back to their rank by name", () => {
    RANKS_V2.forEach((r) =>
      expect(getPackageByRankName(r.name)?.usdc).toBe(r.usdc),
    );
  });
});

describe("language — era + package copy stays doctrine-clean", () => {
  const strings: string[] = [
    ERA_SCHEDULE_NOTE,
    ...ERAS.map((e) => `${e.name} ${e.blurb}`),
    ...SEAT_PACKAGES.map((p) => p.tagline),
    ...SEAT_PACKAGES.map((p) => p.forWhom),
  ];

  it("no forbidden protocol-language framing", () => {
    for (const s of strings) {
      expect(findForbiddenLanguage(s)).toEqual([]);
    }
  });

  it("no ownership / price-stability framing", () => {
    for (const s of strings) {
      expect(extraBanned(s)).toEqual([]);
    }
  });
});
