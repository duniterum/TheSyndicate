// ─── Activity → Institutional Register link · PURE projection leaf (Batch 1b) ─
// A metadata-ONLY indicator source for the /activity feed. It answers ONE
// question for a given on-chain transaction: "is this transaction recorded in
// the protocol's ACTIVE Institutional Register?" — and, if so, returns the
// register entry's id + title so the feed can render a restrained cross-link to
// /institutional-register.
//
// This is NOT Story, NOT Recognition, NOT a second feed, and it surfaces NO
// amount, rank, magnitude, or member identity. It only POINTS an activity row at
// the durable institutional record that already exists for that transaction; the
// activity stream itself stays the raw, un-editorialised on-chain truth.
//
// ── ADJACENCY ──
// INSTITUTIONAL REGISTER ENTRY → activity surface link. It reads register
// ENTRIES only (the terminal durable store), exactly as the public selection
// leaf and the Chronicle public-integration leaf do — it is a downstream
// CONSUMER for display, never a pipeline layer, and it derives nothing new.
//
// ── DOCTRINE ──
// ACTIVE-ONLY. Only entries with entryStatus "active" (accepted institutional
// memory) ever light an indicator; draft / held / rejected never do — a row must
// never imply institutional memory the register has not finalised. An entry with
// no source transaction is skipped (nothing to match a feed row on).

import { deriveGenesisRegisterEntries } from "./institutional-register-genesis";
import { deriveProtocolLifecycleRegisterEntries } from "./institutional-register-lifecycle";
import type { InstitutionalRegisterEntry } from "./institutional-register-registry";

/** Route that renders the durable Institutional Register (the link target). */
export const INSTITUTIONAL_REGISTER_ROUTE = "/institutional-register" as const;

/**
 * Metadata-only descriptor of the active register entry behind a transaction.
 * Carries NO amount, rank, magnitude, or identity — only what is needed to label
 * and link a restrained "Institutional record" indicator.
 */
export interface ActivityInstitutionalLink {
  /** The active register entry's stable id. */
  entryId: string;
  /** The entry's protocol-centric, person-free title. */
  title: string;
}

/**
 * Build a tx-hash → active-entry index from register entries. ACTIVE-ONLY and
 * tx-anchored: an entry is indexed only when entryStatus === "active" AND it
 * carries a sourceTxHash. Keys are lowercased tx hashes. When two active entries
 * share a tx hash the FIRST wins (deterministic; the merged register places the
 * locked genesis seed first). Pure: mutates no input, same output every call.
 */
export function buildActivityInstitutionalIndex(
  entries: readonly InstitutionalRegisterEntry[],
): Map<string, ActivityInstitutionalLink> {
  const index = new Map<string, ActivityInstitutionalLink>();
  for (const e of entries) {
    if (e.entryStatus !== "active") continue;
    const tx = e.sourceTxHash;
    if (typeof tx !== "string" || tx.length === 0) continue;
    const key = tx.toLowerCase();
    if (index.has(key)) continue; // first active entry wins
    index.set(key, { entryId: e.id, title: e.title });
  }
  return index;
}

/**
 * Look up the active institutional record for a transaction, or null. Lookup is
 * case-insensitive and guards empty / missing input.
 */
export function institutionalLinkForTx(
  index: ReadonlyMap<string, ActivityInstitutionalLink>,
  txHash: string | null | undefined,
): ActivityInstitutionalLink | null {
  if (typeof txHash !== "string" || txHash.length === 0) return null;
  return index.get(txHash.toLowerCase()) ?? null;
}

/**
 * The default index used by the live /activity feed. Built from the genesis-seed
 * register entries ONLY — the same SSR-safe, pure config source the public
 * Chronicle backing (Batch 1a) uses — so it covers the verified protocol-birth
 * facts that are active AND tx-anchored. It deliberately does NOT include derived
 * (runtime) register entries: those are produced by the InstitutionalRegisterView
 * merge pipeline at runtime and never reach this static, module-load index.
 *
 * Today the two sets coincide: no human-finalisation action exists yet, so every
 * derived entry is draft-only, and this index exactly matches the register's
 * active set. If a derived entry is ever finalised to "active", surfacing its
 * transaction here is DEFERRED work — it requires feeding the MERGED runtime
 * register entries into the feed, not an edit to this static index. The active
 * gate above is the single source of truth either way.
 */
export const ACTIVE_INSTITUTIONAL_TX_INDEX: ReadonlyMap<
  string,
  ActivityInstitutionalLink
> = buildActivityInstitutionalIndex([
  ...deriveGenesisRegisterEntries(),
  ...deriveProtocolLifecycleRegisterEntries(),
]);
