// ─── Memory Candidate Registry ─────────────────────────────────────────────
// Pure-data leaf for the MINIMAL Memory Candidate layer (Sprint 3). It declares
// the MemoryCandidate vocabulary — the two registers, the category union, the
// verification/recommended-action enums, the category→register legality map,
// the deterministic category-per-kind table, and the classification validator
// that `memory-candidates.ts` (the deriver) projects Signals through. It reads
// no chain, asserts no live status, and fabricates no fact.
//
// ── ADJACENCY (docs/canon/05 §2.1) ──
// MEMORY CANDIDATES read SIGNALS only. This file and the deriver beside it must
// NEVER import the raw event layer (protocol-events). Lineage back to the source
// event (tx / block / verification) is preserved THROUGH the Signal's own
// fields, never by re-reading events. The legal edge is
//   EVENT → SIGNAL → MEMORY CANDIDATE → (later, out of scope) CHRONICLE.
// We `import type` the Chronicle register union for forward-compatibility (a
// MemoryCandidate may LATER become a ChronicleEntry) — types only, no values.
//
// ── MONEY GUARDRAIL (docs/canon/05 §4.5) ──
// A MemoryCandidate carries NO monetary magnitude: no USD/token amounts, no
// balances, no weighted prestige scores. Significance is read from the Signal's
// structural tier/subject/facts, never from how much money moved. The register
// is derived from the Signal SUBJECT, so a person subject can only ever produce
// a member-living candidate (it is capped at S2 upstream) — money can never lift
// a person into the protocol-institutional register.
//
// ── REGISTER DOCTRINE ──
// Register is derived from the Signal SUBJECT, NOT from tier. (The Sprint-3 spec
// table mapping S2→member-living self-contradicts: a founder burn is S2 with a
// PROTOCOL subject. Subject is the truth.) A person subject (member/wallet) →
// member-living; a protocol primitive (protocol/milestone/treasury/artifact/
// chapter) → protocol-institutional. `burn` is the only DUAL-register category:
// burn-founder is protocol-subject (institutional) while burn-community is
// member-subject (living).

import type { ChronicleRegister } from "./chronicle-entries";
import type { ProtocolEventKind } from "./protocol-event-registry";
import {
  isPersonSubject,
  tierRank,
  type Signal,
  type SignalSubject,
  type SignalTier,
} from "./signal-registry";

/**
 * The two memory registers. Reuses the Chronicle's register union verbatim so a
 * MemoryCandidate can later map onto a ChronicleEntry without translation.
 *   • protocol-institutional — protocol-primitive moments (genesis, treasury,
 *     liquidity, supply/burn, artifacts, milestones, institutional founder /
 *     system-wallet actions).
 *   • member-living — member-witnessed moments (a seat's own timeline).
 */
export type MemoryRegister = ChronicleRegister;

/**
 * Fine-grained Memory category. A superset-overlap of the Chronicle categories
 * with member-side additions (membership, continuity). `genesis`, `chapter`,
 * `operations`, and `system-wallet-action` are RESERVED — no live Signal
 * producer emits them yet, and deriving them from anything but a pre-declared
 * fact would invent history.
 */
export type MemoryCategory =
  | "genesis"
  | "membership"
  | "treasury"
  | "operations"
  | "liquidity"
  | "burn"
  | "artifact"
  | "milestone"
  | "chapter"
  | "founder-action"
  | "system-wallet-action"
  | "continuity";

export const MEMORY_CATEGORIES: readonly MemoryCategory[] = [
  "genesis",
  "membership",
  "treasury",
  "operations",
  "liquidity",
  "burn",
  "artifact",
  "milestone",
  "chapter",
  "founder-action",
  "system-wallet-action",
  "continuity",
] as const;

/**
 * Verification of a candidate's claim, DERIVED from the Signal:
 *   • verified        — source signal is LIVE and the copy makes no
 *                       coverage-dependent claim (or coverage holds).
 *   • coverage-limited — copy depends on ordinals / firsts / cumulative totals
 *                       and the window does NOT cover deployment. The candidate
 *                       is window-relative and must never claim "first ever".
 *   • pending         — the source signal is not LIVE; hold until it verifies.
 */
export type MemoryVerification = "verified" | "coverage-limited" | "pending";

/** The only two human actions a candidate can recommend. Promotion to the
 *  Chronicle is a HUMAN act and is intentionally NOT an automatable action. */
export type MemoryRecommendedAction = "review" | "hold-coverage";

/**
 * A Memory Candidate — a deterministic projection of ONE Signal that proposes
 * "this is worth remembering". It cites its Signal and preserves the full
 * verification lineage (Signal → Event → Tx / Block) without re-reading events.
 * It is advisory only: nothing here publishes a Chronicle entry.
 */
export type MemoryCandidate = {
  id: string;
  register: MemoryRegister;
  category: MemoryCategory;
  subject: SignalSubject;
  /**
   * The source Signal's significance tier, carried through as lineage (like
   * sourceEventId/sourceTxHash). The downstream Chronicle Candidate layer reads
   * this — never the Signal — so its tier-based eligibility stays adjacency-legal.
   */
  tier: SignalTier;
  /** The Signal.id this candidate derives from (always present). */
  sourceSignalId: string;
  /** The source CanonicalProtocolEvent.id, carried through the Signal. */
  sourceEventId: string;
  /** Verifiable on-chain lineage, carried through the Signal when present. */
  sourceTxHash?: string;
  sourceBlock?: bigint;
  /** Protocol-voice headline. */
  title: string;
  /** One-sentence summary. */
  summary: string;
  /** Why this is worth remembering (cites the Signal's tier/type). */
  reason: string;
  verification: MemoryVerification;
  recommendedAction: MemoryRecommendedAction;
  /** The source event kind, carried through the Signal. */
  createdFrom: ProtocolEventKind;
  /** Forbidden-language violations in the generated copy (must be empty). */
  copyViolations: string[];
};

/**
 * Which registers each category is allowed to carry. `burn` is the only
 * DUAL-register category (protocol-subject founder burn vs member-subject
 * community burn). Everything else is single-register. RESERVED categories map
 * to protocol-institutional by default.
 */
export const ALLOWED_REGISTERS_FOR_CATEGORY: Record<
  MemoryCategory,
  readonly MemoryRegister[]
> = {
  genesis: ["protocol-institutional"],
  membership: ["member-living"],
  treasury: ["protocol-institutional"],
  operations: ["protocol-institutional"],
  liquidity: ["protocol-institutional"],
  burn: ["protocol-institutional", "member-living"],
  artifact: ["protocol-institutional"],
  milestone: ["protocol-institutional"],
  chapter: ["protocol-institutional"],
  "founder-action": ["protocol-institutional"],
  "system-wallet-action": ["protocol-institutional"],
  continuity: ["member-living"],
} as const;

/** Register implied by a Signal subject. Person → living; primitive → institutional. */
export function registerForSubject(subject: SignalSubject): MemoryRegister {
  return isPersonSubject(subject) ? "member-living" : "protocol-institutional";
}

/**
 * Base category per source event kind. Overridden by the type/founder-action
 * precedence in the deriver; this is the fallback table. Total over
 * ProtocolEventKind so category derivation can never be undefined.
 */
export const CATEGORY_FOR_KIND: Record<ProtocolEventKind, MemoryCategory> = {
  purchase: "membership",
  "new-member": "membership",
  "rank-reached": "membership",
  "swap-buy": "treasury",
  "swap-sell": "treasury",
  "lp-add": "liquidity",
  "lp-remove": "liquidity",
  "vault-in": "treasury",
  "vault-out": "treasury",
  "nft-mint-first-signal": "artifact",
  "nft-mint-patron-seal": "artifact",
  "nft-mint-other": "artifact",
  "burn-founder": "burn",
  "burn-community": "burn",
};

/**
 * S1 categories important enough to remember (everything else at S1 is
 * activity-only). Member-side moments only — a new seat and repeat
 * participation. Plain economic activity, routine treasury/liquidity, and plain
 * artifact issuances stay out (their FIRST occurrence already arrives as a
 * separate S3 milestone Signal).
 */
export const IMPORTANT_S1_CATEGORIES: ReadonlySet<MemoryCategory> = new Set([
  "membership",
  "continuity",
]);

/**
 * Institutional kinds whose FIRST occurrence (with deployment coverage) is worth
 * remembering even though their base Signal is only S1. A founder funding the
 * Operations / Vault / Liquidity wallets for the first time is a protocol
 * moment; a routine, non-first movement is not. Significance is structural
 * (first-of-kind + coverage), never "because the actor is the founder".
 */
export const INSTITUTIONAL_FIRST_FUNDING_KINDS: ReadonlySet<ProtocolEventKind> =
  new Set(["lp-add", "lp-remove", "vault-in", "vault-out"]);

/**
 * Validate a candidate's classification: its register must be legal for its
 * category, and the person/primitive subject must agree with the register
 * (person ⟺ member-living). Returns violations (empty = passes). This mirrors
 * the Chronicle's validateChronicleClassification and is asserted in tests.
 */
export function validateMemoryClassification(c: {
  category: MemoryCategory;
  register: MemoryRegister;
  subject: SignalSubject;
}): string[] {
  const errs: string[] = [];
  const allowed = ALLOWED_REGISTERS_FOR_CATEGORY[c.category];
  if (!allowed.includes(c.register)) {
    errs.push(
      `category "${c.category}" cannot carry register "${c.register}" (allowed: ${allowed.join(
        ", ",
      )})`,
    );
  }
  const personImpliesLiving = isPersonSubject(c.subject)
    ? c.register === "member-living"
    : c.register === "protocol-institutional";
  if (!personImpliesLiving) {
    errs.push(
      `subject "${c.subject}" (${
        isPersonSubject(c.subject) ? "person" : "primitive"
      }) disagrees with register "${c.register}"`,
    );
  }
  return errs;
}

/** Re-export for the deriver/tests so they don't reach into signal-registry for it. */
export type { Signal, SignalSubject, SignalTier };
/**
 * Re-export the canonical tier rank (value) so the DOWNSTREAM Chronicle
 * Candidate layer can rank a candidate's lineage tier WITHOUT importing the
 * Signal layer directly (it reads Memory Candidates only — adjacency stays
 * clean: SIGNAL → MEMORY → CHRONICLE).
 */
export { tierRank };
