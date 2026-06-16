// next-action-context (pure builder) — the canonical normalization of raw
// protocol reads into the selector's input shape.
//
// This is the deterministic core of the NextActionContext adapter. It is PURE
// (no React, no hooks, no chain reads) so it can be unit-tested and so the six
// journey dimensions are interpreted in exactly ONE place:
//
//     wallet + holder-index + archive reads
//        → buildNextActionContext (here)        ← single interpretation
//        → NextActionContext
//        → selectNextActions (next-best-action)  → state / overlays / actions
//
// The React hook `useNextActionContext` (use-next-action-context.ts) gathers
// the live reads and delegates to this builder — it adds no logic of its own.
//
// DOCTRINE:
//   • No duplicate state interpretation: membership (isMember), recognition
//     input (cumulativeUsdc) and collection (ownsArtifacts) are derived here,
//     not re-derived per consumer.
//   • Honest non-membership: a wallet with no holder-index record is a
//     non-member with cumulativeUsdc 0 — never an invented seat.

import type { NextActionContext } from "./next-best-action";

/**
 * The minimal structural slice of a Holder Index record the context needs.
 * Kept structural (not the full HolderRecord) so this stays a zero-dependency
 * pure module. `cumulativeUsdc` is the recognition input; presence ⇒ member.
 */
export interface NextActionRecordLike {
  cumulativeUsdc: number;
}

/** Already-read inputs gathered by the hook from existing protocol sources. */
export interface NextActionContextInputs {
  /** wagmi useAccount().isConnected (mounted-gated by useCockpitAccount). */
  isConnected: boolean;
  /** Holder index still loading (useHolderIndex().isLoading). */
  identityLoading: boolean;
  /** The viewer's holder-index record, or null/undefined when none. */
  record: NextActionRecordLike | null | undefined;
  /** Owns ≥1 tracked Archive1155 artifact (collector overlay). */
  ownsArtifacts: boolean;
}

/**
 * Normalize raw protocol reads into the selector input. Pure and total: the
 * same inputs always produce the same context, and a missing record collapses
 * to an honest non-member (isMember false, cumulativeUsdc 0).
 */
export function buildNextActionContext(
  input: NextActionContextInputs,
): NextActionContext {
  const isMember = input.record != null;
  return {
    isConnected: input.isConnected,
    identityLoading: input.identityLoading,
    isMember,
    cumulativeUsdc: input.record?.cumulativeUsdc ?? 0,
    ownsArtifacts: input.ownsArtifacts,
  };
}
