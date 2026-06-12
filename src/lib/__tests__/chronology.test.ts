// src/lib/__tests__/chronology.test.ts
// Guard test for the CHRONICLE CHRONOLOGY layer (Sprint 14) — the overlay edge
// CHRONICLE ENTRY → CHRONOLOGICAL TIMELINE.
//
// What it proves (spec §13):
//   • chronology ordering is deterministic (block number asc, entry-id tie-break)
//   • chronology never invents dates (blockTimestamp / date stay null)
//   • chronology never invents ordering (no verified block → no sequence)
//   • seeded and pipeline facts coexist safely in one block-ordered sequence
//   • duplicate chronology entries are flagged, never silently dropped
//   • superseded entries preserve history (anchor + supersedes kept, not re-sequenced)
//   • chronology is append-only (a later-block fact never renumbers earlier ones)
//   • chronology preserves lineage
//   • chronology does not mutate Chronicle Entries
//   • chronology introduces no Story and no Recognition
//   • end-to-end over the live genesis seed: 8 entries → 2 ordered, 6 held

import { describe, it, expect } from "vitest";
import { deriveChronologicalTimeline } from "../chronology";
import {
  CHRONOLOGY_MAINTAINER,
  chronologyAnchorKey,
  orderedTimeline,
  resolveChronology,
  resolveBlockTimestamp,
  applyBlockTimestamps,
  type BlockTimestampFetch,
  type BlockTimestampLookup,
} from "../chronology-registry";
import {
  blockTimestampQueryKey,
  buildBlockTimestampLookup,
  collectAnchoredBlockNumbers,
} from "../chronology-timestamps";
import {
  baselinePublicationDecision,
  type InstitutionalChronicleEntry,
} from "../chronicle-entry-registry";
import { deriveInstitutionalChronicleEntries } from "../chronicle-entry";
import { deriveChronicleAdmissionCandidates } from "../chronicle-admission";
import { deriveGenesisRegisterEntries } from "../institutional-register-genesis";
import { mergeInstitutionalEntries, findPublicVocabularyViolations } from "../institutional-register-public";
import { findForbiddenLanguage } from "../protocol-language";
import { SALE_DEPLOYMENT_BLOCK, PROOF_OF_FIRE_001 } from "../syndicate-config";

// A clean Chronicle Entry baseline. Overrides tweak one axis at a time.
function makeEntry(
  o: Partial<InstitutionalChronicleEntry> = {},
): InstitutionalChronicleEntry {
  return {
    id: "chronicle-entry:institutional-entry:test",
    sourceChronicleAdmissionCandidateId: "chronicle-admission:institutional-entry:test",
    sourceInstitutionalRegisterEntryId: "institutional-entry:test",
    sourcePromotionDecisionId: "promo:test",
    sourceTxHash: undefined,
    register: "protocol-institutional" as InstitutionalChronicleEntry["register"],
    category: "protocol" as InstitutionalChronicleEntry["category"],
    title: "Protocol crossed a structural threshold",
    summary: "A pre-declared structural threshold was crossed and recorded.",
    chronology: { date: null, block: null, txHash: null },
    verificationStatus: "verified" as InstitutionalChronicleEntry["verificationStatus"],
    publicationStatus: "draft",
    publicationDecision: baselinePublicationDecision(),
    createdFrom: "protocol milestone",
    copyViolations: [],
    lineage: [
      "chronicle-entry:institutional-entry:test",
      "institutional-entry:test",
      "promo:test",
    ],
    version: 1,
    supersedes: null,
    derivedAt: null,
    ...o,
  };
}

describe("chronology — deterministic ordering", () => {
  it("orders by block number ascending and assigns 1-based sequence numbers", () => {
    const entries = [
      makeEntry({ id: "chronicle-entry:c", chronology: { date: null, block: 300, txHash: "0xc" } }),
      makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xa" } }),
      makeEntry({ id: "chronicle-entry:b", chronology: { date: null, block: 200, txHash: "0xb" } }),
    ];
    const ordered = orderedTimeline(deriveChronologicalTimeline(entries));
    expect(ordered.map((c) => c.sourceChronicleEntryId)).toEqual([
      "chronicle-entry:a",
      "chronicle-entry:b",
      "chronicle-entry:c",
    ]);
    expect(ordered.map((c) => c.sequenceNumber)).toEqual([1, 2, 3]);
  });

  it("is deterministic — same entries in, identical chronology out", () => {
    const entries = [
      makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xa" } }),
      makeEntry({ id: "chronicle-entry:b", chronology: { date: null, block: 200, txHash: "0xb" } }),
    ];
    expect(deriveChronologicalTimeline(entries)).toEqual(deriveChronologicalTimeline(entries));
  });

  it("breaks a same-block tie deterministically by entry id", () => {
    const entries = [
      makeEntry({ id: "chronicle-entry:z", chronology: { date: null, block: 100, txHash: "0xz" } }),
      makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xa" } }),
    ];
    const ordered = orderedTimeline(deriveChronologicalTimeline(entries));
    expect(ordered.map((c) => c.sourceChronicleEntryId)).toEqual([
      "chronicle-entry:a",
      "chronicle-entry:z",
    ]);
  });
});

describe("chronology — never invents dates or ordering", () => {
  it("never invents a date — blockTimestamp is always null", () => {
    const out = deriveChronologicalTimeline([
      makeEntry({ chronology: { date: null, block: 100, txHash: "0xa" } }),
    ]);
    expect(out.every((c) => c.blockTimestamp === null)).toBe(true);
  });

  it("never sequences an entry without a verified block (tx-only or none is held)", () => {
    const txOnly = makeEntry({
      id: "chronicle-entry:tx",
      chronology: { date: null, block: null, txHash: "0xtx" },
    });
    const none = makeEntry({
      id: "chronicle-entry:none",
      chronology: { date: null, block: null, txHash: null },
    });
    const out = deriveChronologicalTimeline([txOnly, none]);
    expect(out[0].chronologyStatus).toBe("held-no-anchor");
    expect(out[0].chronologyAnchor).toBe("tx");
    expect(out[0].chronologyConfidence).toBe("held");
    expect(out[0].sequenceNumber).toBeNull();
    expect(out[1].chronologyStatus).toBe("held-no-anchor");
    expect(out[1].chronologyAnchor).toBe("none");
    expect(out[1].sequenceNumber).toBeNull();
    expect(orderedTimeline(out)).toHaveLength(0);
  });

  it("resolveChronology only earns a sequence-eligible 'ordered' verdict from a block anchor", () => {
    expect(
      resolveChronology({ blockNumber: 100, txHash: "0xa", active: true, suspectedDuplicate: false }).status,
    ).toBe("ordered");
    expect(
      resolveChronology({ blockNumber: null, txHash: "0xa", active: true, suspectedDuplicate: false }).status,
    ).toBe("held-no-anchor");
    expect(
      resolveChronology({ blockNumber: null, txHash: null, active: true, suspectedDuplicate: false }).anchor,
    ).toBe("none");
  });
});

describe("chronology — seeded & pipeline facts coexist", () => {
  it("unifies a seeded fact and a later pipeline fact into one block-ordered sequence", () => {
    const seeded = makeEntry({
      id: "chronicle-entry:genesis:sale",
      chronology: { date: null, block: 87_157_852, txHash: "0xsale" },
    });
    const pipeline = makeEntry({
      id: "chronicle-entry:pipeline:later",
      chronology: { date: null, block: 90_000_000, txHash: "0xlater" },
    });
    const ordered = orderedTimeline(deriveChronologicalTimeline([pipeline, seeded]));
    expect(ordered.map((c) => c.sourceChronicleEntryId)).toEqual([
      "chronicle-entry:genesis:sale",
      "chronicle-entry:pipeline:later",
    ]);
    expect(ordered.map((c) => c.sequenceNumber)).toEqual([1, 2]);
  });
});

describe("chronology — duplication prevention (§8)", () => {
  it("flags a suspected duplicate (same block + tx) without dropping it or double-sequencing", () => {
    const a = makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xsame" } });
    const b = makeEntry({ id: "chronicle-entry:b", chronology: { date: null, block: 100, txHash: "0xsame" } });
    const out = deriveChronologicalTimeline([a, b]);
    expect(out).toHaveLength(2); // never dropped
    const ca = out.find((c) => c.sourceChronicleEntryId === "chronicle-entry:a")!;
    const cb = out.find((c) => c.sourceChronicleEntryId === "chronicle-entry:b")!;
    expect(ca.sequenceNumber).toBe(1);
    expect(ca.suspectedDuplicateOf).toBeNull();
    expect(cb.sequenceNumber).toBeNull();
    expect(cb.suspectedDuplicateOf).toBe("chronicle-entry:a");
    expect(cb.chronologyStatus).toBe("coverage-limited");
  });

  it("does NOT treat same-block, different-tx entries as duplicates", () => {
    const a = makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xa" } });
    const b = makeEntry({ id: "chronicle-entry:b", chronology: { date: null, block: 100, txHash: "0xb" } });
    const out = deriveChronologicalTimeline([a, b]);
    expect(out.every((c) => c.suspectedDuplicateOf === null)).toBe(true);
    expect(orderedTimeline(out)).toHaveLength(2);
  });

  it("the duplicate key requires BOTH a block and a transaction", () => {
    expect(chronologyAnchorKey(100, "0xa")).toBe("100::0xa");
    expect(chronologyAnchorKey(100, null)).toBeNull();
    expect(chronologyAnchorKey(null, "0xa")).toBeNull();
  });

  it("defensively de-dups a repeated entry id (1:1, first kept)", () => {
    const a = makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xa" } });
    const out = deriveChronologicalTimeline([a, a]);
    expect(out).toHaveLength(1);
  });
});

describe("chronology — versioning / supersession (§9)", () => {
  it("keeps a superseded entry visible (anchor retained) but unsequenced; the active version holds the position", () => {
    const superseded = makeEntry({
      id: "chronicle-entry:v1",
      publicationStatus: "superseded",
      chronology: { date: null, block: 100, txHash: "0xtx" },
    });
    const replacement = makeEntry({
      id: "chronicle-entry:v2",
      publicationStatus: "draft",
      supersedes: "chronicle-entry:v1",
      version: 2,
      chronology: { date: null, block: 100, txHash: "0xtx" },
    });
    const out = deriveChronologicalTimeline([superseded, replacement]);
    const cs = out.find((c) => c.sourceChronicleEntryId === "chronicle-entry:v1")!;
    const cr = out.find((c) => c.sourceChronicleEntryId === "chronicle-entry:v2")!;
    // Superseded: anchor retained, but not sequenced — one fact, one position.
    expect(cs.blockNumber).toBe(100);
    expect(cs.chronologyStatus).toBe("coverage-limited");
    expect(cs.sequenceNumber).toBeNull();
    // Replacement: active, holds the position, and the supersedes link stays visible.
    expect(cr.sequenceNumber).toBe(1);
    expect(cr.supersedes).toBe("chronicle-entry:v1");
    expect(cr.suspectedDuplicateOf).toBeNull();
    expect(cr.chronologyStatus).toBe("ordered");
  });

  it("orders a block-anchored entry regardless of publication status — only 'superseded' yields its slot", () => {
    // Chronology orders facts by verified block; publication is a separate act.
    // A held/rejected entry still happened at a block, so it earns a position.
    // Only supersession (a corrected fact) hands its slot to the active version.
    const rejected = makeEntry({
      id: "chronicle-entry:rejected",
      publicationStatus: "rejected",
      chronology: { date: null, block: 100, txHash: "0xr" },
    });
    const held = makeEntry({
      id: "chronicle-entry:held",
      publicationStatus: "held",
      chronology: { date: null, block: 200, txHash: "0xh" },
    });
    const superseded = makeEntry({
      id: "chronicle-entry:superseded",
      publicationStatus: "superseded",
      chronology: { date: null, block: 300, txHash: "0xs" },
    });
    const out = deriveChronologicalTimeline([rejected, held, superseded]);
    const cr = out.find((c) => c.sourceChronicleEntryId === "chronicle-entry:rejected")!;
    const ch = out.find((c) => c.sourceChronicleEntryId === "chronicle-entry:held")!;
    const cs = out.find((c) => c.sourceChronicleEntryId === "chronicle-entry:superseded")!;
    expect(cr.sequenceNumber).toBe(1);
    expect(cr.chronologyStatus).toBe("ordered");
    expect(ch.sequenceNumber).toBe(2);
    expect(ch.chronologyStatus).toBe("ordered");
    expect(cs.sequenceNumber).toBeNull();
    expect(cs.chronologyStatus).toBe("coverage-limited");
  });

  it("is append-only — a later-block fact does not renumber earlier facts", () => {
    const a = makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xa" } });
    const b = makeEntry({ id: "chronicle-entry:b", chronology: { date: null, block: 200, txHash: "0xb" } });
    const c = makeEntry({ id: "chronicle-entry:c", chronology: { date: null, block: 300, txHash: "0xc" } });
    const seq = (set: InstitutionalChronicleEntry[]) =>
      Object.fromEntries(
        deriveChronologicalTimeline(set).map((x) => [x.sourceChronicleEntryId, x.sequenceNumber]),
      );
    const before = seq([a, b]);
    const after = seq([a, b, c]);
    expect(after["chronicle-entry:a"]).toBe(before["chronicle-entry:a"]);
    expect(after["chronicle-entry:b"]).toBe(before["chronicle-entry:b"]);
    expect(after["chronicle-entry:c"]).toBe(3);
  });

  it("sequenceNumber is positional — a newly evidenced EARLIER-block fact renumbers later facts (chronologyId stays stable)", () => {
    // Counterpart to the append-only test: ordering is recomputed, not durable.
    // sequenceNumber reflects block position, so an earlier fact arriving later
    // takes its rightful slot 1 and pushes the rest down. The stable identity is
    // chronologyId, which must NOT change across the recomputation.
    const b = makeEntry({ id: "chronicle-entry:b", chronology: { date: null, block: 200, txHash: "0xb" } });
    const c = makeEntry({ id: "chronicle-entry:c", chronology: { date: null, block: 300, txHash: "0xc" } });
    const before = deriveChronologicalTimeline([b, c]);
    const beforeSeq = Object.fromEntries(before.map((x) => [x.sourceChronicleEntryId, x.sequenceNumber]));
    expect(beforeSeq["chronicle-entry:b"]).toBe(1);
    expect(beforeSeq["chronicle-entry:c"]).toBe(2);
    // An earlier-block fact (block 100) arrives later in the input.
    const a = makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xa" } });
    const after = deriveChronologicalTimeline([b, c, a]);
    const afterSeq = Object.fromEntries(after.map((x) => [x.sourceChronicleEntryId, x.sequenceNumber]));
    expect(afterSeq["chronicle-entry:a"]).toBe(1);
    expect(afterSeq["chronicle-entry:b"]).toBe(2); // renumbered from 1
    expect(afterSeq["chronicle-entry:c"]).toBe(3); // renumbered from 2
    // chronologyId is the durable identity — unchanged by the renumber.
    const bBefore = before.find((x) => x.sourceChronicleEntryId === "chronicle-entry:b")!;
    const bAfter = after.find((x) => x.sourceChronicleEntryId === "chronicle-entry:b")!;
    expect(bAfter.chronologyId).toBe(bBefore.chronologyId);
  });
});

describe("chronology — lineage, purity & immutability", () => {
  it("preserves lineage, prepending the chronology id", () => {
    const e = makeEntry({
      id: "chronicle-entry:x",
      lineage: ["chronicle-entry:x", "institutional-entry:x", "promo:x"],
    });
    const [c] = deriveChronologicalTimeline([e]);
    expect(c.chronologyId).toBe("chronology:chronicle-entry:x");
    expect(c.lineage[0]).toBe("chronology:chronicle-entry:x");
    expect(c.lineage).toEqual([
      "chronology:chronicle-entry:x",
      "chronicle-entry:x",
      "institutional-entry:x",
      "promo:x",
    ]);
  });

  it("does not mutate the Chronicle Entries it reads", () => {
    const entries = [
      makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xa" } }),
      makeEntry({ id: "chronicle-entry:b" }),
    ];
    const snapshot = JSON.stringify(entries);
    deriveChronologicalTimeline(entries);
    expect(JSON.stringify(entries)).toBe(snapshot);
  });
});

describe("chronology — introduces no Story and no Recognition", () => {
  const [c] = deriveChronologicalTimeline([
    makeEntry({ chronology: { date: null, block: 100, txHash: "0xa" } }),
  ]);

  it("carries no Story / narrative field, and the reason copy is sober", () => {
    for (const k of Object.keys(c)) {
      expect(/story|narrative|caption|prose|headline|tagline/i.test(k)).toBe(false);
    }
    expect(findForbiddenLanguage(c.chronologyReason)).toEqual([]);
    expect(findPublicVocabularyViolations(c.chronologyReason)).toEqual([]);
  });

  it("carries no Recognition / rank / score / money field", () => {
    for (const k of Object.keys(c)) {
      expect(/rank|recognition|score|tier|prestige|amount|usd|balance|reward/i.test(k)).toBe(false);
    }
  });

  it("chapter and milestone stay null (documented future path, never invented)", () => {
    expect(c.chapter).toBeNull();
    expect(c.milestone).toBeNull();
  });
});

describe("chronology — maintainer notes", () => {
  it("declares exactly four copy-clean maintainer notes", () => {
    expect(CHRONOLOGY_MAINTAINER).toHaveLength(4);
    for (const { topic, note } of CHRONOLOGY_MAINTAINER) {
      expect(topic.trim().length).toBeGreaterThan(0);
      expect(note.trim().length).toBeGreaterThan(0);
      expect(findForbiddenLanguage(note)).toEqual([]);
      expect(findPublicVocabularyViolations(note)).toEqual([]);
    }
  });
});

describe("chronology — end-to-end over the genesis seed", () => {
  const entries = deriveInstitutionalChronicleEntries(
    deriveChronicleAdmissionCandidates(mergeInstitutionalEntries(deriveGenesisRegisterEntries(), [])),
  );
  const chron = deriveChronologicalTimeline(entries);

  it("projects one chronology entry per Chronicle Entry (1:1, nothing dropped)", () => {
    expect(entries).toHaveLength(8);
    expect(chron).toHaveLength(8);
  });

  it("orders exactly the two block-anchored genesis facts, holds the other six", () => {
    const ordered = orderedTimeline(chron);
    expect(ordered).toHaveLength(2);
    expect(ordered.map((c) => c.sourceChronicleEntryId)).toEqual([
      "chronicle-entry:institutional-entry:genesis:membership-sale-deployment",
      "chronicle-entry:institutional-entry:genesis:proof-of-fire-001",
    ]);
    expect(ordered.map((c) => c.blockNumber)).toEqual([
      Number(SALE_DEPLOYMENT_BLOCK),
      Number(PROOF_OF_FIRE_001.blockNumber),
    ]);
    expect(chron.filter((c) => c.chronologyStatus === "held-no-anchor")).toHaveLength(6);
  });

  it("the membership-sale-deployment fact carries its verified block and holds sequence 1", () => {
    const sale = chron.find((c) => c.sourceChronicleEntryId.endsWith("membership-sale-deployment"))!;
    expect(sale.blockNumber).toBe(Number(SALE_DEPLOYMENT_BLOCK));
    expect(sale.chronologyStatus).toBe("ordered");
    expect(sale.chronologyConfidence).toBe("verified");
    expect(sale.sequenceNumber).toBe(1);
  });

  it("no chronology entry over the genesis seed invents a date", () => {
    for (const c of chron) expect(c.blockTimestamp).toBeNull();
  });
});

// ─── Sprint 15 · Block Timestamp Threading (§10 matrix) ─────────────────────
// A VERIFIED block timestamp is threaded onto already-block-anchored entries as
// READ-ONLY METADATA. It never changes order, never invents a date, and fails
// soft: pending until fetched, held (no date) on unavailable/error.
describe("chronology timestamps — resolveBlockTimestamp (pure classification)", () => {
  it("no block anchor → not-applicable, no date, source none, held", () => {
    const r = resolveBlockTimestamp(null, undefined);
    expect(r.timestampStatus).toBe("not-applicable");
    expect(r.blockTimestamp).toBeNull();
    expect(r.timestampSource).toBe("none");
    expect(r.timestampConfidence).toBe("held");
  });

  it("block-anchored but no fetch yet → pending, no date", () => {
    const r = resolveBlockTimestamp(100, undefined);
    expect(r.timestampStatus).toBe("pending");
    expect(r.blockTimestamp).toBeNull();
    expect(r.timestampSource).toBe("none");
    expect(r.timestampConfidence).toBe("held");
  });

  it("verified is the ONLY path that carries a date, and only from a real unix", () => {
    const r = resolveBlockTimestamp(100, { state: "verified", unix: 1_700_000_000 });
    expect(r.timestampStatus).toBe("verified");
    expect(r.blockTimestamp).toBe(1_700_000_000);
    expect(r.timestampSource).toBe("chain-rpc-getblock");
    expect(r.timestampConfidence).toBe("verified");
  });

  it("unavailable and error both hold: null date + held confidence + source none", () => {
    for (const state of ["unavailable", "error"] as const) {
      const r = resolveBlockTimestamp(100, { state });
      expect(r.timestampStatus).toBe(state);
      expect(r.blockTimestamp).toBeNull();
      expect(r.timestampConfidence).toBe("held");
      expect(r.timestampSource).toBe("none");
    }
  });

  it("never reports verified without a real unix (no undated state carries a date)", () => {
    const undated = [
      resolveBlockTimestamp(null, undefined),
      resolveBlockTimestamp(100, undefined),
      resolveBlockTimestamp(100, { state: "unavailable" }),
      resolveBlockTimestamp(100, { state: "error" }),
    ];
    for (const r of undated) {
      expect(r.timestampStatus).not.toBe("verified");
      expect(r.blockTimestamp).toBeNull();
      expect(r.timestampConfidence).not.toBe("verified");
    }
  });

  it("every timestampReason is copy-clean (sober, person-free, no banned vocab)", () => {
    const reasons = [
      resolveBlockTimestamp(null, undefined),
      resolveBlockTimestamp(100, undefined),
      resolveBlockTimestamp(100, { state: "verified", unix: 1 }),
      resolveBlockTimestamp(100, { state: "unavailable" }),
      resolveBlockTimestamp(100, { state: "error" }),
    ].map((r) => r.timestampReason);
    for (const reason of reasons) {
      expect(reason.trim().length).toBeGreaterThan(0);
      expect(findForbiddenLanguage(reason)).toEqual([]);
      expect(findPublicVocabularyViolations(reason)).toEqual([]);
    }
  });
});

describe("chronology timestamps — applyBlockTimestamps (pure overlay)", () => {
  // base preserves INPUT order: [a(block 100), b(block 200), c(no anchor)].
  const entries = [
    makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 100, txHash: "0xa" } }),
    makeEntry({ id: "chronicle-entry:b", chronology: { date: null, block: 200, txHash: "0xb" } }),
    makeEntry({ id: "chronicle-entry:c", chronology: { date: null, block: null, txHash: null } }),
  ];
  const base = deriveChronologicalTimeline(entries);

  it("the deriver baseline holds anchored entries pending and unanchored not-applicable", () => {
    expect(base[0].timestampStatus).toBe("pending");
    expect(base[0].blockTimestamp).toBeNull();
    expect(base[1].timestampStatus).toBe("pending");
    expect(base[2].timestampStatus).toBe("not-applicable");
  });

  it("overlays verified dates from the lookup; an unmatched anchored entry stays pending", () => {
    const lookup = new Map<number, BlockTimestampFetch>([
      [100, { state: "verified", unix: 1_700_000_000 }],
    ]);
    const dated = applyBlockTimestamps(base, lookup);
    expect(dated[0].timestampStatus).toBe("verified");
    expect(dated[0].blockTimestamp).toBe(1_700_000_000);
    expect(dated[1].timestampStatus).toBe("pending"); // block 200 absent from lookup
    expect(dated[1].blockTimestamp).toBeNull();
    expect(dated[2].timestampStatus).toBe("not-applicable");
  });

  it("ordering is NEVER a function of the timestamp — a contradicting lookup does not reorder", () => {
    // Block 100 (earlier) gets a LATER unix than block 200 — order must stay by block.
    const lookup = new Map<number, BlockTimestampFetch>([
      [100, { state: "verified", unix: 2_000_000_000 }],
      [200, { state: "verified", unix: 1_000_000_000 }],
    ]);
    const dated = applyBlockTimestamps(base, lookup);
    expect(orderedTimeline(dated).map((c) => c.chronologyId)).toEqual(
      orderedTimeline(base).map((c) => c.chronologyId),
    );
    for (let i = 0; i < base.length; i++) {
      expect(dated[i].sequenceNumber).toBe(base[i].sequenceNumber);
      expect(dated[i].chronologyStatus).toBe(base[i].chronologyStatus);
    }
  });

  it("changes ONLY the five timestamp fields — every other field is identical", () => {
    const lookup = new Map<number, BlockTimestampFetch>([
      [100, { state: "verified", unix: 1_700_000_000 }],
    ]);
    const dated = applyBlockTimestamps(base, lookup);
    const TS_FIELDS = new Set([
      "blockTimestamp",
      "timestampStatus",
      "timestampSource",
      "timestampConfidence",
      "timestampReason",
    ]);
    base.forEach((before, i) => {
      const after = dated[i];
      for (const k of Object.keys(before) as (keyof typeof before)[]) {
        if (TS_FIELDS.has(k as string)) continue;
        expect(after[k]).toEqual(before[k]);
      }
    });
  });

  it("is deterministic — same (chronology, lookup) in → same out", () => {
    const lookup = new Map<number, BlockTimestampFetch>([[100, { state: "verified", unix: 1 }]]);
    expect(applyBlockTimestamps(base, lookup)).toEqual(applyBlockTimestamps(base, lookup));
  });

  it("introduces no Story / Recognition field and keeps reasons copy-clean after overlay", () => {
    const lookup = new Map<number, BlockTimestampFetch>([[100, { state: "verified", unix: 1 }]]);
    const [c] = applyBlockTimestamps(base, lookup);
    for (const k of Object.keys(c)) {
      expect(/story|narrative|caption|prose|headline|tagline/i.test(k)).toBe(false);
      expect(/rank|recognition|score|tier|prestige|amount|usd|balance|reward/i.test(k)).toBe(false);
    }
    expect(findForbiddenLanguage(c.timestampReason)).toEqual([]);
    expect(findPublicVocabularyViolations(c.timestampReason)).toEqual([]);
  });
});

describe("chronology timestamps — helpers (collect / key / build)", () => {
  it("collectAnchoredBlockNumbers dedupes, sorts ascending, and drops unanchored entries", () => {
    const entries = [
      makeEntry({ id: "chronicle-entry:a", chronology: { date: null, block: 200, txHash: "0xa" } }),
      makeEntry({ id: "chronicle-entry:b", chronology: { date: null, block: 100, txHash: "0xb" } }),
      makeEntry({ id: "chronicle-entry:c", chronology: { date: null, block: 200, txHash: "0xc" } }),
      makeEntry({ id: "chronicle-entry:d", chronology: { date: null, block: null, txHash: null } }),
    ];
    const chron = deriveChronologicalTimeline(entries);
    expect(collectAnchoredBlockNumbers(chron)).toEqual([100, 200]);
  });

  it("blockTimestampQueryKey is namespaced by chain id", () => {
    expect(blockTimestampQueryKey(43114, 100)).toEqual(["block-timestamp", 43114, 100]);
    expect(blockTimestampQueryKey(undefined, 100)).toEqual(["block-timestamp", undefined, 100]);
  });

  it("buildBlockTimestampLookup maps success→verified, error→error, pending/missing→absent", () => {
    const blocks = [100, 200, 300, 400];
    const lookup = buildBlockTimestampLookup(blocks, [
      { status: "success", data: 1_700_000_000 },
      { status: "error", data: undefined },
      { status: "pending", data: undefined },
      // index 3 absent → not yet resolved
    ]);
    expect(lookup.get(100)).toEqual({ state: "verified", unix: 1_700_000_000 });
    expect(lookup.get(200)).toEqual({ state: "error" });
    expect(lookup.has(300)).toBe(false); // pending → absent → resolver reports pending
    expect(lookup.has(400)).toBe(false); // missing state → absent
  });

  it("buildBlockTimestampLookup never invents a date — success without a number is unavailable", () => {
    const lookup = buildBlockTimestampLookup([100], [{ status: "success", data: null }]);
    expect(lookup.get(100)).toEqual({ state: "unavailable" });
  });
});

describe("chronology timestamps — end-to-end over the genesis seed", () => {
  const entries = deriveInstitutionalChronicleEntries(
    deriveChronicleAdmissionCandidates(mergeInstitutionalEntries(deriveGenesisRegisterEntries(), [])),
  );
  const base = deriveChronologicalTimeline(entries);

  it("baseline: every anchored entry is pending, every unanchored not-applicable (no invented dates)", () => {
    for (const c of base) {
      expect(c.timestampStatus).toBe(c.blockNumber === null ? "not-applicable" : "pending");
      expect(c.blockTimestamp).toBeNull();
    }
  });

  it("seeded + applied share ONE path: verifying the anchored blocks dates exactly them, order intact", () => {
    const blocks = collectAnchoredBlockNumbers(base);
    const lookup: BlockTimestampLookup = new Map<number, BlockTimestampFetch>(
      blocks.map((b, i): [number, BlockTimestampFetch] => [
        b,
        { state: "verified", unix: 1_700_000_000 + i },
      ]),
    );
    const dated = applyBlockTimestamps(base, lookup);
    const verified = dated.filter((c) => c.timestampStatus === "verified");
    expect(verified.length).toBe(blocks.length);
    for (const c of verified) {
      expect(c.blockNumber).not.toBeNull();
      expect(typeof c.blockTimestamp).toBe("number");
    }
    expect(orderedTimeline(dated).map((c) => c.chronologyId)).toEqual(
      orderedTimeline(base).map((c) => c.chronologyId),
    );
  });
});
