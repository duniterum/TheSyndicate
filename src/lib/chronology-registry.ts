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
 * Lifecycle of a block-timestamp lookup for a chronology entry (Sprint 15 §3).
 *   • verified        — a real block timestamp was read from verified chain
 *                       metadata; the only status that carries a date.
 *   • unavailable     — the block was queried but no timestamp could be found.
 *   • pending         — the entry is block-anchored but no lookup has resolved
 *                       yet (the default before the async fetch lands).
 *   • error           — the timestamp lookup failed (e.g. RPC unavailable).
 *   • not-applicable  — the entry carries no block anchor, so no block timestamp
 *                       can ever apply (a tx-only or no-anchor held entry).
 */
export type TimestampStatus =
  | "verified"
  | "unavailable"
  | "pending"
  | "error"
  | "not-applicable";

/**
 * Where a verified block timestamp came from (Sprint 15 §3). Only the chain RPC
 * getBlock read is honest today; "none" is carried whenever no date is present.
 */
export type TimestampSource = "chain-rpc-getblock" | "none";

/**
 * The result of an out-of-layer block-timestamp fetch, handed BACK into the pure
 * overlay as plain data. The chronology layer never performs the fetch itself
 * (no I/O); a caller resolves these and applies them via applyBlockTimestamps.
 *   • verified    — carries the real unix seconds read from chain metadata.
 *   • unavailable — the block was queried, no timestamp found.
 *   • error       — the lookup failed.
 * A block with NO entry in the lookup is treated as still "pending".
 */
export type BlockTimestampFetch =
  | { state: "verified"; unix: number }
  | { state: "unavailable" }
  | { state: "error" };

/**
 * A caller-resolved map of block number → fetch result. Plain data so the
 * overlay stays pure and deterministic: same (chronology, lookup) in → same out.
 */
export type BlockTimestampLookup = ReadonlyMap<number, BlockTimestampFetch>;

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
   * Verified block timestamp in unix SECONDS, or null. Non-null ONLY when
   * timestampStatus is "verified" (a real timestamp read from chain metadata).
   * Held / pending / error / not-applicable entries keep this null — a date is
   * NEVER inferred, estimated, or carried from the local clock (Sprint 15).
   */
  blockTimestamp: number | null;
  /** Where the timestamp lookup stands (verified / unavailable / pending / error / not-applicable). */
  timestampStatus: TimestampStatus;
  /** The verified source of the timestamp, or "none" when no date is present. */
  timestampSource: TimestampSource;
  /** Whether the timestamp is proven ("verified") or merely held ("held"). */
  timestampConfidence: ChronologyConfidence;
  /** Sober, person-free explanation of the timestamp status — carries no magnitude. */
  timestampReason: string;
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

/**
 * PURE resolution of the timestamp fields for a single chronology entry from a
 * caller-resolved lookup result (Sprint 15 §3). It performs NO I/O and reads no
 * clock — it only classifies plain data:
 *   • no block anchor (blockNumber null) → not-applicable, no date.
 *   • block-anchored but no fetch resolved yet (fetched undefined) → pending.
 *   • verified fetch → the ONLY path that carries a date (the real unix).
 *   • unavailable / error fetch → held, no date.
 * A date is NEVER inferred, estimated, or invented: blockTimestamp is non-null
 * only on the verified path, and only from a real unix supplied by the caller.
 */
export function resolveBlockTimestamp(
  blockNumber: number | null,
  fetched: BlockTimestampFetch | undefined,
): Pick<
  ChronologyEntry,
  | "blockTimestamp"
  | "timestampStatus"
  | "timestampSource"
  | "timestampConfidence"
  | "timestampReason"
> {
  if (blockNumber === null) {
    return {
      blockTimestamp: null,
      timestampStatus: "not-applicable",
      timestampSource: "none",
      timestampConfidence: "held",
      timestampReason:
        "No block anchor, so no block timestamp can apply; the entry is held without a date.",
    };
  }

  if (fetched === undefined) {
    return {
      blockTimestamp: null,
      timestampStatus: "pending",
      timestampSource: "none",
      timestampConfidence: "held",
      timestampReason:
        "Block-anchored; awaiting a verified block timestamp lookup. Ordered by block height in the meantime.",
    };
  }

  if (fetched.state === "verified") {
    return {
      blockTimestamp: fetched.unix,
      timestampStatus: "verified",
      timestampSource: "chain-rpc-getblock",
      timestampConfidence: "verified",
      timestampReason:
        "Verified block timestamp read from chain metadata via getBlock.",
    };
  }

  if (fetched.state === "unavailable") {
    return {
      blockTimestamp: null,
      timestampStatus: "unavailable",
      timestampSource: "none",
      timestampConfidence: "held",
      timestampReason:
        "The block was queried but carried no timestamp; held without a date, ordering preserved by block height.",
    };
  }

  // fetched.state === "error"
  return {
    blockTimestamp: null,
    timestampStatus: "error",
    timestampSource: "none",
    timestampConfidence: "held",
    timestampReason:
      "The block timestamp lookup failed; held without a date, ordering preserved by block height.",
  };
}

/**
 * PURE overlay that threads caller-resolved block timestamps onto an EXISTING
 * chronology set (Sprint 15 §3). It runs AFTER ordering is fully computed, so a
 * timestamp can never become an ordering input: this function changes ONLY the
 * five timestamp fields (blockTimestamp, timestampStatus, timestampSource,
 * timestampConfidence, timestampReason) and preserves array order, sequence
 * numbers, and every other field exactly. Same (chronology, lookup) in → same
 * out; it performs no I/O and reads no clock.
 */
export function applyBlockTimestamps(
  chronology: ReadonlyArray<ChronologyEntry>,
  lookup: BlockTimestampLookup,
): ChronologyEntry[] {
  return chronology.map((c) => {
    const fetched =
      c.blockNumber === null ? undefined : lookup.get(c.blockNumber);
    return { ...c, ...resolveBlockTimestamp(c.blockNumber, fetched) };
  });
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
    note: "Block heights are ordinal, not calendar time. Two facts in the same block, or a chain reorganisation that renumbers a height, both order purely by block number with an entry-id tie-break here — deterministic, but not a true clock. A verified block timestamp is now threaded as metadata (applyBlockTimestamps), but it is NEVER an ordering input: ordering stays block-height based, and a date appears only on the verified path. Do not let a future surface order by timestamp, nor present a block number as a date.",
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
    note: "Dated coverage, not just a lookup. The verified block-timestamp lookup now lands a real date on verified entries (one getBlock per anchored block, cached forever), but held / pending / error / not-applicable entries still carry NO date. Story must narrate sequence for the dated subset and degrade — never invent a date — for the rest; full dated coverage across all anchored facts is the outstanding prerequisite before any uniformly dated narrative is honest.",
  },
];
