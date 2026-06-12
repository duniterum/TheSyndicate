// src/lib/chronology-registry.ts
// CHRONICLE CHRONOLOGY — the pure-data leaf for Sprint 14, the pipeline edge
// CHRONICLE ENTRY → CHRONOLOGICAL TIMELINE.
//
// This leaf defines the ChronologyEntry object, the ordering vocabulary
// (status / anchor / confidence), the per-entry chronology RESOLVER, the
// duplicate-anchor key, and the ordered-timeline projection. It establishes the
// protocol's permanent sense of historical ORDER — and nothing more.
//
// ── What this layer is NOT ──
//   • not Story, not Recognition, not Governance, not publishing
//   • it generates NO narrative, NO interpretation, NO dates — it only records
//     the order that on-chain evidence can prove
//   • it never mutates Chronicle Entries: a ChronologyEntry is a SEPARATE overlay
//     object (1:1 with its source entry), never a rewrite of the entry
//   • it never invents order: an entry with no verifiable block anchor is HELD,
//     never positioned by guess; tx / deployment anchors prove EXISTENCE, not order
//
// ── Adjacency (canon 05 §2.1) ──
//   It reads CHRONICLE ENTRIES only. It imports nothing but the chronicle-entry
//   registry leaf (the entry type + its publication-status type); the full
//   lineage and on-chain anchor are carried THROUGH each entry. It never reaches
//   back into the admission, register, promotion, review, memory, signal, or raw
//   event layers, nor the chronicle-entry DERIVER, nor chapters / milestones.

import type {
  ChroniclePublicationStatus,
  InstitutionalChronicleEntry,
} from "./chronicle-entry-registry";

// The Chronicle-domain record type is taken from the entry via an indexed-access
// type, so this leaf imports ONLY its immediate neighbour.
type ChronicleCategory = InstitutionalChronicleEntry["category"];

/**
 * Where a ChronologyEntry stands in the timeline (spec §3).
 *   • ordered          — the entry has a VERIFIED block anchor and is the active,
 *                        non-duplicate record of its fact; it holds a sequence.
 *   • held-no-anchor   — no verifiable block anchor (a tx hash alone, or nothing);
 *                        retained but NEVER given a sequence (existence ≠ order).
 *   • coverage-limited — the entry HAS a block anchor but is deliberately withheld
 *                        from the sequence so one on-chain fact holds one timeline
 *                        position: a superseded version, or a suspected duplicate.
 */
export type ChronologyStatus = "ordered" | "held-no-anchor" | "coverage-limited";

/**
 * The strongest evidence a ChronologyEntry could anchor to (spec §3 hierarchy).
 *   • block-number — a verified block height (the only anchor that earns a sequence)
 *   • tx           — a transaction hash only (proves existence, not order)
 *   • deployment   — RESERVED: a contract-deployment marker with no block. Not
 *                    reachable from entry data today (entries carry no contract
 *                    reference distinct from "none"); kept for the future path
 *                    where a deployment block is threaded — at which point such a
 *                    fact becomes "block-number" anyway.
 *   • none         — no on-chain anchor carried at all.
 */
export type ChronologyAnchor = "block-number" | "tx" | "deployment" | "none";

/** Whether the chronological position is proven or held (spec §3). */
export type ChronologyConfidence = "verified" | "held";

/**
 * One chronology overlay record (spec §2). It is a SEPARATE object derived 1:1
 * from a Chronicle Entry — it never mutates the entry. It carries only factual,
 * verifiable ordering metadata: no narrative, no interpretation, no invented date.
 */
export type ChronologyEntry = {
  /** Deterministic id (1:1 with the source entry). */
  chronologyId: string;
  /** The Chronicle Entry this overlay orders. */
  sourceChronicleEntryId: string;
  /** Where this entry stands in the timeline. */
  chronologyStatus: ChronologyStatus;
  /** The Chronicle record type, carried verbatim from the entry (factual, not narrative). */
  chronologyType: ChronicleCategory;
  /** Verified block height, or null when the source fact carried no block. */
  blockNumber: number | null;
  /**
   * Block timestamp — ALWAYS null today: no block timestamp is fetched anywhere
   * in the pipeline. Kept so a future timestamp lookup has a home (spec §10).
   */
  blockTimestamp: number | null;
  /** Source transaction hash, when the entry carried one. */
  txHash: string | null;
  /**
   * Position in the canonical order, 1-based — assigned ONLY to "ordered"
   * entries. null for everything held or coverage-limited (order is never
   * fabricated for an entry that cannot prove its block).
   *
   * POSITIONAL, not a durable id: it is recomputed each derivation, so an entry
   * that arrives later carrying an EARLIER block renumbers the entries after it.
   * That is correct (a newly evidenced earlier fact takes its rightful slot) —
   * but never treat sequenceNumber as a stable identifier. Use chronologyId.
   */
  sequenceNumber: number | null;
  /**
   * Chapter reference — null today. Chronology reads entries only, and entries
   * carry no chapter; chapters are member-ordinal-derived. Documented future path
   * (spec §7): a later layer may map an anchored entry onto a chapter boundary.
   */
  chapter: null;
  /**
   * Milestone reference — null today, for the same reason as `chapter`:
   * milestones are pulse / count-derived and not carried on an entry (spec §7).
   */
  milestone: null;
  /** The strongest anchor the entry could prove. */
  chronologyAnchor: ChronologyAnchor;
  /** Whether the position is proven (verified) or merely held. */
  chronologyConfidence: ChronologyConfidence;
  /** Sober, person-free explanation of the status — carries no magnitude. */
  chronologyReason: string;
  /**
   * When this entry shares a (blockNumber, txHash) with an earlier ordered entry,
   * the id of that earlier entry. Non-null means a suspected duplicate that is
   * flagged and NOT sequenced (it is never silently dropped — spec §8). Upstream
   * merge already dedups seed vs pipeline by tx, so a flag here signals an
   * upstream bug to surface, not to swallow.
   */
  suspectedDuplicateOf: string | null;
  /**
   * The entry id this one supersedes (carried from the entry), or null. A
   * superseded entry keeps its anchor and stays visible via this pointer, but is
   * NOT separately sequenced — one fact holds one position (spec §9).
   */
  supersedes: string | null;
  /** Full provenance, the chronology id prepended to the entry's lineage. */
  lineage: readonly string[];
};

/** An entry is active for sequencing unless it has been superseded. */
export function isActiveEntryStatus(status: ChroniclePublicationStatus): boolean {
  return status !== "superseded";
}

/**
 * The duplicate-detection key: a fact is the same on-chain action when it shares
 * BOTH a block height and a transaction hash. Block-only or tx-only matches are
 * NOT treated as duplicates (distinct facts can share a block).
 */
export function chronologyAnchorKey(
  blockNumber: number | null,
  txHash: string | null,
): string | null {
  if (blockNumber === null || txHash === null) return null;
  return `${blockNumber}::${txHash}`;
}

/**
 * Resolve the chronology status / anchor / confidence / reason for a single
 * entry from its carried evidence and two set-level flags. PURE: no clock, no
 * I/O, no cross-entry lookup (the caller computes the flags).
 *
 *   block anchor + active + not duplicate → ordered          (verified)
 *   block anchor + superseded             → coverage-limited  (held)
 *   block anchor + suspected duplicate    → coverage-limited  (held)
 *   tx anchor only / no anchor            → held-no-anchor    (held)
 */
export function resolveChronology(input: {
  blockNumber: number | null;
  txHash: string | null;
  active: boolean;
  suspectedDuplicate: boolean;
}): {
  status: ChronologyStatus;
  anchor: ChronologyAnchor;
  confidence: ChronologyConfidence;
  reason: string;
} {
  const anchor: ChronologyAnchor =
    input.blockNumber !== null
      ? "block-number"
      : input.txHash !== null
        ? "tx"
        : "none";

  if (anchor !== "block-number") {
    return {
      status: "held-no-anchor",
      anchor,
      confidence: "held",
      reason:
        anchor === "tx"
          ? "A transaction anchor proves the fact happened but not when relative to others; held, never sequenced."
          : "No on-chain block or transaction anchor was carried; held, never sequenced.",
    };
  }

  if (!input.active) {
    return {
      status: "coverage-limited",
      anchor,
      confidence: "held",
      reason:
        "Superseded: the block anchor is retained and the entry stays visible, but the active version holds the timeline position.",
    };
  }

  if (input.suspectedDuplicate) {
    return {
      status: "coverage-limited",
      anchor,
      confidence: "held",
      reason:
        "Shares a block and transaction anchor with an earlier ordered entry; flagged and retained, not sequenced, so one on-chain action holds one position.",
    };
  }

  return {
    status: "ordered",
    anchor,
    confidence: "verified",
    reason: "Anchored to a verified block height; ordered by block number.",
  };
}

/**
 * Project the ordered subset of a chronology set, sorted by sequence. PURE:
 * returns a new array of only the "ordered" entries (those that earned a
 * sequenceNumber), in ascending sequence order. Held / coverage-limited entries
 * are intentionally excluded from the ORDERED view (they remain in the full set).
 */
export function orderedTimeline(
  chronology: ReadonlyArray<ChronologyEntry>,
): ChronologyEntry[] {
  return chronology
    .filter((c) => c.sequenceNumber !== null)
    .slice()
    .sort((a, b) => (a.sequenceNumber as number) - (b.sequenceNumber as number));
}

// ─── MAINTAINER SECTION ─────────────────────────────────────────────────────
// Spec §11 — four durable notes a future maintainer needs. Kept as data (not
// just a comment) so the guard test can assert they exist and stay copy-clean.
// NOT public copy — an internal orientation surface only.
export const CHRONOLOGY_MAINTAINER: ReadonlyArray<{
  topic: string;
  note: string;
}> = [
  {
    topic: "One chronology risk we are not seeing",
    note: "Block heights are ordinal, not calendar time. Two facts in the same block, or a chain reorganisation that renumbers a height, both order purely by block number with an entry-id tie-break here — deterministic, but not a true clock. Until a block timestamp is fetched, the timeline proves SEQUENCE, never date; do not let a future surface present a block number as a date.",
  },
  {
    topic: "One existing data source we should reuse",
    note: "The verified block height now carried as chronology.block on every Chronicle Entry whose source fact had a block (threaded Sprint 14). It is the single ordering source; do not re-derive a height from anywhere else, and do not reach into chapters or milestones for order — adjacency forbids it and those are count-derived, not time-derived.",
  },
  {
    topic: "One duplication risk chronology can solve",
    note: "Genesis-seeded facts and later pipeline-derived facts can describe the same on-chain action. The upstream register merge dedups by transaction, but if a duplicate slips through, two entries would claim one position. Chronology flags any second entry sharing a (block, transaction) key as a suspected duplicate and withholds its sequence, surfacing the upstream issue instead of silently double-counting.",
  },
  {
    topic: "One future Story prerequisite that still remains",
    note: "A real block timestamp. Story needs to narrate over dates, not just sequence positions; chronology can order entries by block but cannot date them, because no timestamp is fetched anywhere in the pipeline. A block-timestamp lookup (one read per anchored block) is the outstanding prerequisite before any dated narrative is honest.",
  },
];
