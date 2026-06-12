// ─── Institutional Register Registry ───────────────────────────────────────
// Pure-data leaf for the Institutional Register layer (Sprint 6) — the DURABLE
// protocol-memory store that receives APPROVED protocol-institutional Chronicle
// Promotion Decisions. It declares the InstitutionalRegisterEntry vocabulary
// (entry statuses, the institutional event-class table, the protocol-centric
// copy generator, and the status/coverage helpers) that `institutional-register.ts`
// (the deriver) projects ChroniclePromotionDecisions through.
//
// It reads no chain, asserts no live status, fabricates no fact, and PUBLISHES
// NOTHING to the public Chronicle. An Institutional Register Entry is durable
// protocol memory — NOT public publishing. Public Chronicle / Story surfaces
// come later and are out of scope here.
//
// ── ADJACENCY (docs/canon/05 §2.1) ──
// THE INSTITUTIONAL REGISTER reads CHRONICLE PROMOTION DECISIONS only. This file
// and the deriver beside it must NEVER import the Chronicle-review layer
// (chronicle-review-candidate-registry / chronicle-review-candidates), the
// Memory layer (memory-candidate-registry / memory-candidates), the Signal layer
// (signal-registry / protocol-signals), or the raw event layer (protocol-events).
// Lineage back through Promotion → Chronicle → Memory → Signal → Event → Tx/Block
// is preserved THROUGH the ChroniclePromotionDecision's own fields — never
// re-derived. The legal edge is:
//   … → CHRONICLE PROMOTION DECISION → INSTITUTIONAL REGISTER ENTRY.
//
// ── LAWFUL PARALLEL SOURCE (Sprint 9, spec §3) ──
// This vocabulary (entry type + findHistoricClaims guard) is ALSO reused by a
// documented genesis-seed leaf (institutional-register-genesis.ts) that builds
// verified/locked protocol-birth entries which PREDATE the event scanner, from
// on-chain-truth config constants. That leaf and this one share no pipeline edge;
// the seeded entries are merged with the deriver's output at the public view.
//
// ── MONEY / IDENTITY GUARDRAIL (docs/canon/05 §4.5) ──
// An InstitutionalRegisterEntry carries NO monetary magnitude. Its title/summary
// are generated from the decision's structural register/category/rule bucket —
// never from how much money moved, and never from the actor's identity. A
// protocol-wallet ("founder")/system action is framed PROTOCOL-CENTRICALLY
// ("protocol seeded liquidity", "protocol performed a supply burn") and is never
// heroised as a person's achievement.
//
// ── MEMBER-REGISTER DOCTRINE (chronicle-entries clause 6) ──
// Only protocol-institutional promotion paths may create entries here. The
// member-living / member-memory track stays RESERVED for DAO ratification; a
// member-living decision is excluded from this register entirely (it is never
// written), exactly as the layer below holds it.

import {
  BASELINE_REVIEWER,
  type ChroniclePromotionDecision,
  type ChroniclePromotionVerdict,
} from "./chronicle-promotion-registry";

/** The only register this store writes — the protocol-institutional Chronicle. */
export const INSTITUTIONAL_REGISTER = "protocol-institutional" as const;
export type InstitutionalRegister = typeof INSTITUTIONAL_REGISTER;

/** The structural category of the entry, read THROUGH the promotion decision. */
export type InstitutionalEntryCategory = ChroniclePromotionDecision["category"];

/**
 * Strict entry lifecycle statuses (spec §2). Durable protocol memory, NOT public
 * publishing — there is intentionally no "published" status here.
 *   • draft    — derived from an APPROVED baseline decision, awaiting a human /
 *                governance sign-off before it becomes durable (active).
 *   • active   — an approved decision a human/governance reviewer has finalised
 *                (reviewer ≠ baseline, timestamp set, coverage sufficient).
 *   • held     — a hold-context / hold-coverage decision; retained, never dropped.
 *   • rejected — a rejected decision; retained for inspection, never active.
 */
export type InstitutionalEntryStatus = "draft" | "active" | "held" | "rejected";

/**
 * The entry's verification posture (spec §9). "coverage-limited" means the
 * upstream scan could not cover deployment, so NO historic ("first ever",
 * "genesis", …) wording may be asserted. "locked" is RESERVED for facts that are
 * explicitly locked/verified (e.g. a pinned Proof of Fire) — the baseline deriver
 * only ever emits "verified" or "coverage-limited".
 */
export type InstitutionalVerificationStatus = "verified" | "coverage-limited" | "locked";

/**
 * An Institutional Register Entry — one durable protocol-memory record derived
 * from ONE protocol-institutional ChroniclePromotionDecision. It preserves the
 * full lineage (Promotion → Chronicle → Memory → Signal → Event → Tx/Block) so
 * the entry is self-auditable, and it carries its own protocol-centric copy
 * (generated here, never reusing an upstream member-facing title).
 */
export type InstitutionalRegisterEntry = {
  /** Deterministic entry id (1:1 with the source decision/candidate). */
  id: string;
  // ── Lineage (carried, never re-derived) ──
  sourcePromotionDecisionId: string;
  sourceChronicleReviewCandidateId: string;
  sourceMemoryCandidateId: string;
  sourceSignalId: string;
  sourceEventId: string;
  sourceTxHash?: string;
  sourceBlock?: bigint;
  // ── Classification ──
  register: InstitutionalRegister;
  category: InstitutionalEntryCategory;
  // ── Generated, protocol-centric copy ──
  title: string;
  summary: string;
  /** Carried from the promotion decision (already person-free, money-free). */
  rationale: string;
  // ── Disposition ──
  verificationStatus: InstitutionalVerificationStatus;
  entryStatus: InstitutionalEntryStatus;
  /** Provenance at this layer — the promotion rule bucket the entry derives from. */
  createdFrom: string;
  /** Human/governance finalisation time (set only for an active entry). */
  createdAt: number | null;
  /** Deterministic baseline derivations are unstamped (recomputed each render). */
  derivedAt: number | null;
  /** Ordered, human-readable lineage trail for inspection. */
  lineage: readonly string[];
  /** Banned/forbidden/historic-claim violations in the generated copy (must be empty). */
  copyViolations: string[];
};

/** A documented institutional event class (spec §6). */
export type InstitutionalEventClass = {
  /** The class name (matches the spec §6 list). */
  class: string;
  /**
   * "live"     — derivable from a detectable event today.
   * "reserved" — declared but not detectable yet; reserved safely, never faked.
   * "seeded"   — a foundational fact that PREDATES the event scanner and is
   *              curated as a verified/locked genesis entry (institutional-
   *              register-genesis.ts), then merged into the public view. Never
   *              invented: each seeded class is backed by a real contract / tx.
   */
  availability: "live" | "reserved" | "seeded";
  /** Person-free, money-free description of the class. */
  description: string;
};

/**
 * INSTITUTIONAL EVENT CLASSES (spec §6). The classes the register supports today
 * (live) or reserves for the future (reserved). Reserved classes are declared so
 * the vocabulary is stable, but the deriver NEVER invents a live fact for them —
 * a reserved class only becomes live when a real, detectable event backs it.
 */
export const INSTITUTIONAL_EVENT_CLASSES: ReadonlyArray<InstitutionalEventClass> = [
  { class: "genesis", availability: "seeded", description: "The protocol's origin coordinate (token / contract / initial-state birth facts). Seeded as verified/locked genesis entries that predate the event scanner; chapter coordinates are recorded live." },
  { class: "token deployment", availability: "seeded", description: "The SYN token contract deployment. Seeded as a verified genesis fact (anchored to the live token contract); predates the event scanner." },
  { class: "initial distribution", availability: "seeded", description: "The initial supply creation and allocation across the published distribution. Seeded as a verified genesis fact (anchored to the token contract and allocation wallets)." },
  { class: "sale deployment", availability: "seeded", description: "The membership-sale contract deployment. Seeded as a locked genesis fact (pinned to its creation transaction and deployment block); predates the event scanner." },
  { class: "first liquidity", availability: "seeded", description: "The first establishment of the SYN/USDC pair. Seeded as a locked genesis fact pinned to the pool creation transaction; predates the event scanner." },
  { class: "liquidity event", availability: "live", description: "A change to the protocol liquidity position (seeding live; removals held for human framing)." },
  { class: "burn / Proof of Fire", availability: "live", description: "A protocol-initiated supply reduction, framed protocol-centrically; held for human framing." },
  { class: "first artifact", availability: "reserved", description: "The first artifact to enter the archive. Recorded live as an artifact issuance; the 'first' claim is coverage-gated." },
  { class: "milestone", availability: "live", description: "A pre-declared structural threshold the protocol crossed — a permanent coordinate." },
  { class: "chapter", availability: "live", description: "A protocol chapter coordinate that anchors the seats claimed within it." },
  { class: "treasury movement", availability: "live", description: "A protocol treasury flow; significance depends on direction and is framed by a human." },
  { class: "treasury acquisition", availability: "live", description: "The protocol treasury acquiring the means to operate." },
  { class: "treasury revenue", availability: "live", description: "Recurring protocol treasury flow; routine activity, not permanent memory." },
  { class: "operations spend", availability: "live", description: "Operational spending by the protocol; routine unless framed as significant by a human." },
  { class: "campaign funding", availability: "reserved", description: "Funding of a named protocol campaign. Reserved — maps to treasury/operations until separately detectable." },
  { class: "protocol-owned asset movement", availability: "reserved", description: "Movement of a protocol-owned asset. Reserved — not separately detectable yet." },
  { class: "external protocol revenue", availability: "reserved", description: "Revenue from an external protocol integration. Reserved — not detectable yet." },
  { class: "system-wallet action", availability: "live", description: "An action by a protocol system wallet; held for human framing." },
  { class: "protocol-steward action", availability: "live", description: "A protocol-wallet (steward) funding or burn, framed protocol-centrically; held for human framing, never as a personal achievement." },
];

/**
 * Generated institutional-voice copy for a promotion rule bucket. Protocol-
 * centric and person-free by construction; it deliberately asserts NO historic
 * "first/genesis" wording (those are coverage-gated and the human curator adds
 * them when a fact is explicitly locked).
 */
type InstitutionalCopy = { title: string; summary: string };

const COPY_BY_BUCKET: Readonly<Record<string, InstitutionalCopy>> = {
  "protocol milestone": {
    title: "Protocol crossed a milestone threshold",
    summary: "The protocol reached a pre-declared structural threshold, recorded as durable protocol memory.",
  },
  "chapter completion": {
    title: "Protocol chapter coordinate recorded",
    summary: "A protocol chapter coordinate that anchors the seats claimed within it.",
  },
  "artifact issuance": {
    title: "Protocol issued an archive artifact",
    summary: "An artifact entered the protocol archive, expanding its issued record.",
  },
  "liquidity seeding": {
    title: "Protocol seeded liquidity",
    summary: "The protocol established its SYN/USDC liquidity pair as a foundational protocol fact.",
  },
  "liquidity removal": {
    title: "Protocol liquidity position changed",
    summary: "A change to the protocol liquidity position, held for human framing of its meaning.",
  },
  "liquidity action": {
    title: "Protocol liquidity action recorded",
    summary: "A protocol liquidity action, held for human framing before durable memory.",
  },
  "treasury acquisition": {
    title: "Protocol treasury acquired an asset",
    summary: "The protocol treasury acquired the means to operate, recorded as durable memory.",
  },
  "treasury deployment": {
    title: "Protocol treasury deployment recorded",
    summary: "A protocol treasury outflow, held for human framing of its destination and purpose.",
  },
  "treasury revenue": {
    title: "Protocol treasury revenue flow",
    summary: "Recurring protocol treasury flow; routine activity, not permanent memory.",
  },
  "treasury flow": {
    title: "Protocol treasury flow recorded",
    summary: "An unclassified protocol treasury flow, held for human framing.",
  },
  "operations spending": {
    title: "Protocol operations executed spending",
    summary: "Operational spending by the protocol, held for human framing of its significance.",
  },
  "protocol-wallet funding": {
    title: "Protocol wallet funding movement",
    summary: "A protocol-wallet funding movement, held for protocol-centric human framing.",
  },
  "protocol-wallet burn": {
    title: "Protocol performed a supply burn",
    summary: "A protocol-initiated supply reduction (Proof of Fire), held for protocol-centric human framing.",
  },
  "system-wallet action": {
    title: "Protocol system-wallet action",
    summary: "A protocol system-wallet action, held for human framing before durable memory.",
  },
  "protocol event": {
    title: "Protocol event recorded",
    summary: "A protocol event recorded as durable memory, held for human framing.",
  },
  "coverage-limited": {
    title: "Protocol event held for coverage",
    summary: "A protocol fact awaiting sufficient scan coverage before it can be recorded; no historic claim is asserted.",
  },
  "unsafe copy": {
    title: "Protocol event held for copy review",
    summary: "An upstream candidate carried unsafe copy; recorded as rejected pending a human rewrite.",
  },
};

const FALLBACK_COPY: InstitutionalCopy = {
  title: "Protocol event recorded",
  summary: "A protocol event recorded as durable protocol memory.",
};

/** Protocol-centric institutional copy for a rule bucket (deterministic). */
export function institutionalCopyFor(ruleBucket: string): InstitutionalCopy {
  return COPY_BY_BUCKET[ruleBucket] ?? FALLBACK_COPY;
}

/**
 * All documented copy rule-buckets. Additive coverage surface so copy-safety
 * tests can iterate every bucket authoritatively (imports only — guard-safe).
 */
export const INSTITUTIONAL_COPY_BUCKETS: readonly string[] = Object.keys(COPY_BY_BUCKET);

/**
 * Historic-claim patterns (spec §9). An entry may NOT assert any of these unless
 * its verification is "verified"/"locked". The generated copy never contains
 * them, so this is a defensive guard against a future copy regression.
 */
export const HISTORIC_CLAIM_PATTERNS: ReadonlyArray<RegExp> = [
  /first ever/i,
  /first-ever/i,
  /\bgenesis\b/i,
  /first liquidity/i,
  /first treasury/i,
  /first campaign/i,
  /first acquisition/i,
  /first revenue/i,
  /\bfirst\s+member\b/i,
];

/**
 * Returns historic-claim violations for `text` GIVEN its verification posture.
 * A "verified"/"locked" fact may legitimately assert a first; a coverage-limited
 * one may not (spec §9).
 */
export function findHistoricClaims(
  text: string,
  verification: InstitutionalVerificationStatus,
): string[] {
  if (verification === "verified" || verification === "locked") return [];
  return HISTORIC_CLAIM_PATTERNS.filter((p) => p.test(text)).map(
    (p) => `historic claim asserted without sufficient coverage: ${p}`,
  );
}

/**
 * A decision is HUMAN/GOVERNANCE-FINALISED when a real reviewer (not the
 * deterministic baseline) has signed off AND stamped a time. Only a finalised,
 * coverage-sufficient APPROVED decision yields an `active` durable entry; an
 * unfinalised baseline approval is a `draft` (spec §2, §7).
 */
export function isHumanFinalizedDecision(
  d: Pick<ChroniclePromotionDecision, "reviewer" | "timestamp">,
): boolean {
  return d.reviewer !== BASELINE_REVIEWER && d.timestamp !== null;
}

/** Map a verdict (+ finalisation/coverage) to a strict entry status (spec §2). */
export function institutionalEntryStatus(
  verdict: ChroniclePromotionVerdict,
  opts: { humanFinalized: boolean; coverageOk: boolean },
): InstitutionalEntryStatus {
  switch (verdict) {
    case "approved":
      return opts.humanFinalized && opts.coverageOk ? "active" : "draft";
    case "hold-context":
    case "hold-coverage":
      return "held";
    case "rejected":
      return "rejected";
  }
}
