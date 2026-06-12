// ─── Controlled Public Chronicle Integration leaf (Sprint 17 / Batch 1a) ────
// The FIRST public bridge between the institutional-memory engine and the public
// Chronicle. It does ONE thing: for each LOCKED, hand-curated Chronicle entry, it
// attaches an optional, restrained "institutional record" backing line IF — and
// only if — an EXPLICIT, curated overlap map links that entry to an ACTIVE
// Institutional Register entry (the genesis-seed protocol-birth facts).
//
// WHAT IT IS NOT:
//   • NOT a second Activity / register feed. It re-lists nothing. Non-overlapping
//     register facts already have a public home at /institutional-register and are
//     deliberately NOT repeated here (a Chronicle is not a feed — doctrine §7).
//   • NOT a publisher. It surfaces only entryStatus === "active" register entries.
//     A draft / held / rejected entry can never back a public Chronicle entry, so
//     this layer never "publishes" anything awaiting a human/governance act.
//   • NOT a deriver. It runs no pipeline, reads no chain, mutates no input, and
//     invents no fact — it is a pure, deterministic projection.
//
// ── ADJACENCY ──
// This is a presentation/integration leaf at the route boundary (like
// institutional-register-public.ts). It imports ONLY entry TYPES plus the
// canonical explorer-URL helpers from syndicate-config (on-chain truth config,
// the highest authority — never a pipeline module). The ROUTE owns the value
// imports (CHRONICLE_ENTRIES + deriveGenesisRegisterEntries) and passes both in.
//
// ── "CONTROLLED" ──
// Overlap is decided by an EXPLICIT, audited curated map keyed by human curation,
// never by a fragile title/contract heuristic. The map below is the single place
// a maintainer declares "this locked entry and that register fact are the same
// fact." chronicle-public-integration.test.ts pins every key to a locked entry id
// and every value to an ACTIVE genesis fact, so the map can never drift or dangle.

import { isTxHash, txExplorerUrl } from "./syndicate-config";
import type { ChronicleEntry } from "./chronicle-entries";
import type { InstitutionalRegisterEntry } from "./institutional-register-registry";

/** Id prefix the genesis-seed leaf assigns every seeded register entry. */
export const GENESIS_ENTRY_ID_PREFIX = "institutional-entry:genesis:" as const;

/** Public route the backing line links to for full lineage. */
export const INSTITUTIONAL_REGISTER_HREF = "/institutional-register" as const;

// ── Sober copy (spec §5) — neutral institutional voice. No legend/hero framing,
// no person heroising, no profit/return/yield, no governance-right claim. Pinned
// by tests against findPublicVocabularyViolations + the Chronicle banlist.
export const BACKING_LABEL = "Institutional record";
export const BACKING_NOTE =
  "This entry is recorded in the Institutional Register as a verified protocol-birth fact.";
export const BACKING_TX_LABEL = "Verified source transaction ↗";
export const BACKING_LINEAGE_LABEL = "View in the Institutional Register ↗";

/**
 * CURATED OVERLAP MAP — locked Chronicle entry id → the genesis FACT id(s) that
 * record the SAME on-chain fact in the Institutional Register. This is the human
 * curation that makes the integration "controlled": only an explicit declaration
 * here links a locked entry to a register entry. Values are FACT ids (the slug),
 * not full entry ids — the prefix is applied at lookup time.
 *
 *   chapter-i-opened        ≡ membership-sale-deployment (sale live = chapter opened)
 *   first-artifact-mintable ≡ archive-contract-deployment (the archive's contract)
 *   second-artifact-mintable≡ archive-contract-deployment (same contract, 2nd object)
 */
export const CHRONICLE_INSTITUTIONAL_BACKING: Readonly<
  Record<string, readonly string[]>
> = {
  "chapter-i-opened": ["membership-sale-deployment"],
  "first-artifact-mintable": ["archive-contract-deployment"],
  "second-artifact-mintable": ["archive-contract-deployment"],
};

/** A restrained backing reference shown beneath a locked Chronicle entry. */
export type ChronicleBacking = {
  /** Sober label for the backing block, e.g. "Institutional record". */
  label: string;
  /** One-line, person-free note. It backs the entry; it is not a second entry. */
  note: string;
  /** The Institutional Register entry id this backing references (audit key). */
  registerEntryId: string;
  /** Source-transaction explorer URL — present only for tx-locked facts. */
  sourceTxHref?: string;
  /** Label for the source-transaction link (present iff sourceTxHref is). */
  sourceTxLabel?: string;
  /** In-app link to the public Institutional Register (full lineage home). */
  lineageHref: string;
  /** Label for the lineage link. */
  lineageLabel: string;
};

/**
 * One public Chronicle item: the locked entry, plus an OPTIONAL backing. There is
 * deliberately NO standalone list of derived/register facts on this view model —
 * that would turn /chronicle into a second register feed.
 */
export type PublicChronicleItem = {
  entry: ChronicleEntry;
  backing?: ChronicleBacking;
};

/** Build the restrained backing from an ACTIVE register entry (caller-gated). */
function buildBacking(registerEntry: InstitutionalRegisterEntry): ChronicleBacking {
  const txHash = registerEntry.sourceTxHash;
  const sourceTxHref = isTxHash(txHash) ? txExplorerUrl(txHash) : undefined;
  return {
    label: BACKING_LABEL,
    note: BACKING_NOTE,
    registerEntryId: registerEntry.id,
    sourceTxHref,
    sourceTxLabel: sourceTxHref ? BACKING_TX_LABEL : undefined,
    lineageHref: INSTITUTIONAL_REGISTER_HREF,
    lineageLabel: BACKING_LINEAGE_LABEL,
  };
}

/**
 * Project the locked Chronicle entries into the public view, attaching a backing
 * line to each entry the curated map links to an ACTIVE register entry.
 *
 * Guarantees (pinned by tests):
 *   • Output length and order EXACTLY match `locked` (one item per locked entry).
 *   • Locked entries are passed through by reference, never mutated; neither input
 *     array is mutated.
 *   • ACTIVE-ONLY gate: a held / draft / rejected / missing register entry never
 *     produces a backing — the entry simply renders without one (degrade, never
 *     imply). The genesis "held" coverage-limited facts are therefore unreachable.
 *   • Deterministic: same inputs → identical output, server and client.
 */
export function buildPublicChronicleView(
  locked: readonly ChronicleEntry[],
  registerEntries: readonly InstitutionalRegisterEntry[],
): PublicChronicleItem[] {
  // Index ACTIVE register entries by id — the active-only publication gate.
  const activeById = new Map<string, InstitutionalRegisterEntry>();
  for (const e of registerEntries) {
    if (e.entryStatus === "active") activeById.set(e.id, e);
  }

  return locked.map((entry) => {
    const factIds = CHRONICLE_INSTITUTIONAL_BACKING[entry.id];
    if (!factIds || factIds.length === 0) return { entry };

    // First mapped fact that resolves to an ACTIVE register entry backs it.
    for (const factId of factIds) {
      const registerEntry = activeById.get(GENESIS_ENTRY_ID_PREFIX + factId);
      if (registerEntry) return { entry, backing: buildBacking(registerEntry) };
    }
    return { entry };
  });
}
