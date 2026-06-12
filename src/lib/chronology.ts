// ─── Chronicle Chronology deriver (Sprint 14) ──────────────────────────────
// The pure projection CHRONICLE ENTRY → CHRONOLOGICAL TIMELINE. Given the
// derived institutional Chronicle Entries, it returns a read-only chronology
// OVERLAY — one ChronologyEntry per entry — establishing deterministic
// historical order from on-chain evidence alone.
//
// PURE + DETERMINISTIC: same entries in → same chronology out, input order
// preserved, no mutation, no I/O, no clock. It NEVER invents a date, NEVER
// fabricates order, and NEVER mutates a Chronicle Entry. An entry that cannot
// prove a verified block height is HELD, never positioned by guess.
//
// ADJACENCY (docs/canon/05 §2.1): reads CHRONICLE ENTRIES only. It imports the
// chronology registry leaf (vocabulary + resolver) and the entry TYPE — never
// the chronicle-entry deriver, nor any upstream layer, nor chapters/milestones.

import type { InstitutionalChronicleEntry } from "./chronicle-entry-registry";
import {
  chronologyAnchorKey,
  isActiveEntryStatus,
  resolveBlockTimestamp,
  resolveChronology,
  type ChronologyEntry,
} from "./chronology-registry";

/**
 * Derive the Chronological Timeline overlay from Chronicle Entries.
 *
 * 1:1 with entries (order-preserving, nothing dropped). Only ACTIVE,
 * block-anchored, non-duplicate entries receive a sequenceNumber, ordered by
 * (block number asc, entry id tie-break). Superseded entries keep their anchor
 * and supersession pointer but are not separately sequenced (one fact = one
 * position). Two entries sharing a (block, transaction) anchor are flagged as a
 * suspected duplicate — the deterministic first is sequenced, the second is
 * retained and flagged, never silently dropped.
 */
export function deriveChronologicalTimeline(
  entries: ReadonlyArray<InstitutionalChronicleEntry>,
): ChronologyEntry[] {
  // Defensive 1:1 guarantee: if the same entry id appears twice (malformed
  // input), keep the first occurrence only — never double-record one entry.
  const uniqueEntries: InstitutionalChronicleEntry[] = [];
  const seenEntryIds = new Set<string>();
  for (const e of entries) {
    if (seenEntryIds.has(e.id)) continue;
    seenEntryIds.add(e.id);
    uniqueEntries.push(e);
  }

  // The set eligible for a sequence: active (non-superseded) AND block-anchored.
  // Sorted deterministically so duplicate detection and sequencing agree.
  const sortedEligible = uniqueEntries
    .filter((e) => isActiveEntryStatus(e.publicationStatus) && e.chronology.block !== null)
    .slice()
    .sort((a, b) => {
      const ba = a.chronology.block as number;
      const bb = b.chronology.block as number;
      if (ba !== bb) return ba - bb;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });

  // Flag suspected duplicates by (block, transaction) key. The first entry to
  // hold a key is canonical; any later entry sharing it is flagged.
  const canonicalByKey = new Map<string, string>();
  const duplicateOf = new Map<string, string>();
  for (const e of sortedEligible) {
    const key = chronologyAnchorKey(e.chronology.block, e.chronology.txHash);
    if (key === null) continue; // block-only (no tx) is never a duplicate key
    const existing = canonicalByKey.get(key);
    if (existing === undefined) {
      canonicalByKey.set(key, e.id);
    } else {
      duplicateOf.set(e.id, existing);
    }
  }

  // Assign 1-based sequence numbers to the ordered (eligible, non-duplicate) set.
  const sequenceById = new Map<string, number>();
  let seq = 0;
  for (const e of sortedEligible) {
    if (duplicateOf.has(e.id)) continue;
    seq += 1;
    sequenceById.set(e.id, seq);
  }

  // Build one ChronologyEntry per entry, in INPUT order (the order is expressed
  // through sequenceNumber, not array position).
  return uniqueEntries.map((e) => {
    const blockNumber = e.chronology.block;
    const txHash = e.chronology.txHash;
    const active = isActiveEntryStatus(e.publicationStatus);
    const suspectedDuplicateOf = duplicateOf.get(e.id) ?? null;

    const { status, anchor, confidence, reason } = resolveChronology({
      blockNumber,
      txHash,
      active,
      suspectedDuplicate: suspectedDuplicateOf !== null,
    });

    const chronologyId = `chronology:${e.id}`;
    return {
      chronologyId,
      sourceChronicleEntryId: e.id,
      chronologyStatus: status,
      chronologyType: e.category,
      blockNumber,
      ...resolveBlockTimestamp(blockNumber, undefined),
      txHash,
      sequenceNumber: sequenceById.get(e.id) ?? null,
      chapter: null,
      milestone: null,
      chronologyAnchor: anchor,
      chronologyConfidence: confidence,
      chronologyReason: reason,
      suspectedDuplicateOf,
      supersedes: e.supersedes,
      lineage: [chronologyId, ...e.lineage],
    };
  });
}
