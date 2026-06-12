// ─── Signal Registry ───────────────────────────────────────────────────────
// Pure-data leaf for the MINIMAL Signals Engine (Sprint 2). It declares the
// Signal vocabulary (Type × Tier × Subject), the money-SAFE StructuralFacts
// shape, the Signal object, and the deterministic per-kind classification table
// that `protocol-signals.ts` (the deriver) projects events through. It reads no
// chain, asserts no live status, and fabricates no fact.
//
// ── ADJACENCY LAW (docs/canon/05 §2.1) ──
// SIGNALS read EVENTS only. This file and the deriver beside it must NEVER
// import the Memory layer (Chronicle entries / candidates, Recognition
// candidates, protocol-memory, leaderboard/referral previews). The only legal
// edge is EVENT → SIGNAL → (later, out of scope) RECOGNITION / CHRONICLE.
//
// ── MONEY GUARDRAIL (docs/canon/05 §4.5 Rule E) ──
// StructuralFacts is MONEY-SAFE. It carries only structural facts — counts,
// ordinals, pre-declared threshold ids, and boolean first-of-kind flags. It
// NEVER carries a per-actor monetary magnitude: no USD or token amounts, no
// wallet balances, no weighted prestige scores, and no commission figures.
// Protocol thresholds enter ONLY as pre-declared milestone ids (see
// PROTOCOL_MILESTONES in activity-milestones.ts). Person-subject money can
// never, by itself, lift a Signal above S2 — the rule table caps person
// subjects at S2 and routes all higher significance to milestone/protocol
// subjects. The signal-money-guardrail test enforces that none of those
// magnitude identifiers ever appear in this file.
//
// ── TERMINOLOGY COLLISION (docs/canon/05 §3.2) ──
// Canon §3.2 freezes a SEPARATE seven-name list — Timing, Conviction, Support,
// Growth, Participation, Structural, Historic — as RECOGNITION MEANING FACETS
// (each has an "earned via" + "recognition label"). Those belong to the
// downstream RECOGNITION axis and are OUT OF SCOPE this sprint ("Signals is not
// Recognition"). The `SignalType` union below is the EVENT-DOMAIN discriminant
// the minimal Event → Signal engine switches on. The two lists are different
// AXES; do not merge them. (Future canon addendum should record this split.)

import type { ProtocolEventKind } from "./protocol-event-registry";
import type { EventStatus } from "./protocol-events";
import type { FounderActionCategory } from "./founder-actions";

/**
 * EVENT-DOMAIN Signal type — the minimal Event → Signal discriminant. Frozen at
 * seven per the Sprint 2 spec; do not invent new types. (Distinct from canon
 * §3.2's recognition facets — see the header collision note.)
 */
export type SignalType =
  | "MEMBERSHIP"
  | "ECONOMIC"
  | "MILESTONE"
  | "BURN"
  | "CHAPTER"
  | "CONTINUITY"
  | "ARTIFACT";

export const SIGNAL_TYPES: readonly SignalType[] = [
  "MEMBERSHIP",
  "ECONOMIC",
  "MILESTONE",
  "BURN",
  "CHAPTER",
  "CONTINUITY",
  "ARTIFACT",
] as const;

/**
 * Significance ladder (canon §3.2). S0 noise · S1 standard activity · S2
 * recognized action · S3 protocol milestone · S4 historical event · S5
 * constitutional event. Ordered low → high; index is the rank.
 */
export type SignalTier = "S0" | "S1" | "S2" | "S3" | "S4" | "S5";

export const SIGNAL_TIERS: readonly SignalTier[] = [
  "S0",
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
] as const;

export function tierRank(t: SignalTier): number {
  return SIGNAL_TIERS.indexOf(t);
}

/** Higher of two tiers (ladder order). */
export function maxTier(a: SignalTier, b: SignalTier): SignalTier {
  return tierRank(a) >= tierRank(b) ? a : b;
}

/**
 * What a Signal is ABOUT. `member`/`wallet` are PERSON subjects and are capped
 * at S2 (canon §4.5). `protocol`/`milestone`/`treasury`/`artifact`/`chapter`
 * are protocol primitives and may carry S3+.
 */
export type SignalSubject =
  | "protocol"
  | "member"
  | "wallet"
  | "treasury"
  | "artifact"
  | "milestone"
  | "chapter";

export const PERSON_SUBJECTS: readonly SignalSubject[] = ["member", "wallet"];

export function isPersonSubject(s: SignalSubject): boolean {
  return s === "member" || s === "wallet";
}

/** The hard ceiling for any person-subject signal (canon §4.5). */
export const PERSON_SUBJECT_MAX_TIER: SignalTier = "S2";

/**
 * MONEY-SAFE structural facts that justify a Signal's tier/subject. Every field
 * is a count, an ordinal, a pre-declared id, a boolean, or a recognition-only
 * classification — NEVER a monetary magnitude (see the Rule E note above).
 */
export type StructuralFacts = {
  /** First event of its kind within the supplied window. */
  isFirstOfKind: boolean;
  /**
   * True only when the supplied window is a gapless scan back to deployment, so
   * a window-first is a genuine protocol-wide first and ordinals/cumulative
   * crossings are real. False ⇒ window-relative; no "first ever" is asserted.
   */
  windowCoversDeployment: boolean;
  /** Structured seat ordinal (e.g. 100) — count, never an amount. */
  memberOrdinal?: number;
  /** Proof of Fire index (1-based) — count, never an amount. */
  proofOfFireIndex?: number;
  /** Nth purchase by the same seat (continuity count, never a sum). */
  repeatPurchaseIndex?: number;
  /** Pre-declared PROTOCOL_MILESTONES ids this event crossed. */
  crossedMilestoneIds?: readonly string[];
  /** True when a chapter SEALED (reserved — no live producer yet). */
  chapterSealed?: boolean;
  /** Founder-action classification when present (context only, never glorified). */
  founderAction?: FounderActionCategory;
};

/**
 * The canonical Signal object — a deterministic projection of ONE source event.
 * `verification` mirrors the source event's freshness/verification status; the
 * Signal asserts nothing the event did not.
 */
export type Signal = {
  id: string;
  type: SignalType;
  tier: SignalTier;
  subject: SignalSubject;
  /** The source CanonicalProtocolEvent.id this signal derives from. */
  sourceEventId: string;
  sourceTxHash?: string;
  sourceBlock?: bigint;
  /** Plain-language, doctrine-clean justification. */
  reason: string;
  /** The source event kind. */
  createdFrom: ProtocolEventKind;
  verification: EventStatus;
  facts: StructuralFacts;
};

export type SignalBaseRule = {
  type: SignalType;
  tier: SignalTier;
  subject: SignalSubject;
};

/**
 * Deterministic baseline {type, tier, subject} per event kind. Exhaustive over
 * ProtocolEventKind. Person-subject kinds are capped at S2 here; protocol-level
 * significance is layered on as SEPARATE milestone/protocol-subject signals by
 * the deriver, so a person's row never exceeds S2.
 *
 * `purchase` is ECONOMIC (the USDC movement); the seat-identity event is the
 * paired `new-member` (MEMBERSHIP). Swaps are S0 noise and never elevate.
 */
export const SIGNAL_RULE_FOR_KIND: Record<ProtocolEventKind, SignalBaseRule> = {
  purchase: { type: "ECONOMIC", tier: "S1", subject: "member" },
  "new-member": { type: "MEMBERSHIP", tier: "S1", subject: "member" },
  "rank-reached": { type: "MEMBERSHIP", tier: "S2", subject: "member" },
  "swap-buy": { type: "ECONOMIC", tier: "S0", subject: "wallet" },
  "swap-sell": { type: "ECONOMIC", tier: "S0", subject: "wallet" },
  "lp-add": { type: "ECONOMIC", tier: "S1", subject: "treasury" },
  "lp-remove": { type: "ECONOMIC", tier: "S1", subject: "treasury" },
  "vault-in": { type: "ECONOMIC", tier: "S1", subject: "treasury" },
  "vault-out": { type: "ECONOMIC", tier: "S1", subject: "treasury" },
  "nft-mint-first-signal": { type: "ARTIFACT", tier: "S1", subject: "artifact" },
  "nft-mint-patron-seal": { type: "ARTIFACT", tier: "S2", subject: "artifact" },
  "nft-mint-other": { type: "ARTIFACT", tier: "S1", subject: "artifact" },
  "burn-founder": { type: "BURN", tier: "S2", subject: "protocol" },
  "burn-community": { type: "BURN", tier: "S2", subject: "member" },
};

export function baseRuleForKind(kind: ProtocolEventKind): SignalBaseRule {
  return SIGNAL_RULE_FOR_KIND[kind];
}

/**
 * Tier for a crossed pre-declared milestone (subject = milestone). Member
 * #10,000 is the historical S4 era close; every other pre-declared milestone is
 * an S3 protocol milestone. Keyed by PROTOCOL_MILESTONES id.
 */
export const MILESTONE_SIGNAL_TIER: Readonly<Record<string, SignalTier>> = {
  "members-10000": "S4",
};

export function tierForMilestone(milestoneId: string): SignalTier {
  return MILESTONE_SIGNAL_TIER[milestoneId] ?? "S3";
}

/** Proof of Fire #001 — the protocol's first verified burn — is historical. */
export const PROOF_OF_FIRE_FIRST_TIER: SignalTier = "S4";
