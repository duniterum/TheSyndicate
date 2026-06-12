// ─── Memory Candidates (the MINIMAL Memory Candidate layer) ────────────────
// The deterministic Signal → MemoryCandidate derivation layer. ONE pure function
// projects Signals into MemoryCandidates that propose "this is worth
// remembering" — WITHOUT publishing a Chronicle entry and WITHOUT touching the
// locked Chronicle. It is OUTPUT-ONLY and additive.
//
// ADJACENCY (canon 05 §2.1): this module reads SIGNALS only. It imports the
// signal registry, the memory-candidate registry leaf, and the language guard —
// NEVER the raw event layer (protocol-events). Lineage back to the event (tx /
// block / verification) is preserved THROUGH the Signal's own fields. The legal
// edge is EVENT → SIGNAL → MEMORY CANDIDATE → (later, out of scope) CHRONICLE.
//
// MONEY GUARDRAIL (canon 05 §4.5): a candidate carries no monetary magnitude.
// Significance is read from the Signal's structural tier/subject/facts. The
// register is derived from the Signal SUBJECT, so a person subject (capped at S2
// upstream) can only ever produce a member-living candidate — money can never
// lift a person into the protocol-institutional register, and the actor's
// identity (founder/system) never, by itself, creates a memory.
//
// CHRONICLE COMPATIBILITY: this layer does NOT auto-write Chronicle entries. It
// only prepares the two-register shape a curator could later promote by hand.

import {
  ALLOWED_REGISTERS_FOR_CATEGORY,
  CATEGORY_FOR_KIND,
  IMPORTANT_S1_CATEGORIES,
  INSTITUTIONAL_FIRST_FUNDING_KINDS,
  registerForSubject,
  type MemoryCandidate,
  type MemoryCategory,
  type MemoryRecommendedAction,
  type MemoryVerification,
} from "./memory-candidate-registry";
import { tierRank, type Signal } from "./signal-registry";
import { findForbiddenLanguage } from "./protocol-language";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

/** True when the Signal's FIRST occurrence (with coverage) makes a routine
 *  institutional kind worth remembering as a protocol moment. */
function isInstitutionalFirstFunding(s: Signal): boolean {
  return (
    INSTITUTIONAL_FIRST_FUNDING_KINDS.has(s.createdFrom) &&
    s.facts.isFirstOfKind === true &&
    s.facts.windowCoversDeployment === true
  );
}

/**
 * Deterministic creation rule (canon §4.5 tiers). Returns whether this Signal
 * deserves a MemoryCandidate at all.
 *   • S0 routine          → never.
 *   • S1 notable          → only {membership, continuity}, OR a first-funding
 *                            institutional moment with deployment coverage.
 *   • S2 recognized action → always (member-living for person, institutional
 *                            for a protocol primitive).
 *   • S3+ protocol/historic → always (protocol-institutional).
 */
function shouldCreate(s: Signal, category: MemoryCategory): boolean {
  // Locked ruling (canon 05 §4.5): a routine founder ALLOCATION MOVEMENT —
  // the protocol moving its own allocation between its own wallets — is NEVER a
  // memory, regardless of tier or first-of-kind coverage. The actor's identity
  // alone is not significance. (Funding actions are handled below; only this
  // rebalance class is categorically excluded.)
  if (s.facts.founderAction === "founder-allocation-movement") return false;

  const rank = tierRank(s.tier);
  if (rank <= 0) return false; // S0 — routine noise, never remembered.
  if (rank === 1) {
    // S1 — notable, but most of it is activity-only. A candidate only when:
    if (!IMPORTANT_S1_CATEGORIES.has(category)) {
      // …a routine institutional kind crosses its FIRST funding moment WITH
      // deployment coverage (lp-*/vault-*). Otherwise nothing.
      return isInstitutionalFirstFunding(s);
    }
    // membership at S1 is remembered ONLY for a NEW SEAT. A plain repeat
    // purchase also maps to category "membership" but stays activity-only —
    // repeat participation is remembered through the CONTINUITY signal instead.
    if (category === "membership") return s.createdFrom === "new-member";
    return true; // continuity
  }
  return true; // S2 and above.
}

/**
 * Deterministic category, by precedence:
 *   1. MILESTONE type            → "milestone"
 *   2. CONTINUITY type           → "continuity"
 *   3. founderAction (≠ routine allocation movement) → "founder-action"
 *   4. fallback CATEGORY_FOR_KIND table.
 */
function categoryFor(s: Signal): MemoryCategory {
  if (s.type === "MILESTONE") return "milestone";
  if (s.type === "CONTINUITY") return "continuity";
  const fa = s.facts.founderAction;
  if (fa && fa !== "founder-allocation-movement") return "founder-action";
  return CATEGORY_FOR_KIND[s.createdFrom];
}

/** Coverage-dependent copy = ordinal/first/cumulative claims. Only continuity
 *  produces such copy WITHOUT coverage (milestone/first-funding candidates are
 *  themselves gated on coverage upstream, so they never reach here uncovered). */
function isCoverageDependent(s: Signal): boolean {
  return s.type === "CONTINUITY";
}

function verificationFor(s: Signal): MemoryVerification {
  if (s.verification !== "LIVE") return "pending";
  if (isCoverageDependent(s) && s.facts.windowCoversDeployment !== true) {
    return "coverage-limited";
  }
  return "verified";
}

function recommendedActionFor(v: MemoryVerification): MemoryRecommendedAction {
  return v === "coverage-limited" ? "hold-coverage" : "review";
}

type Copy = { title: string; summary: string; reason: string };

/**
 * Protocol-voice, money-free, person-anonymous suggested copy. Member-living
 * copy never names a wallet or an amount ("a seat" / "a member"); institutional
 * copy never glorifies the founder (founder actions are framed as protocol
 * support, recognition only — mirroring founder-actions.ts).
 */
function suggestCopy(s: Signal, category: MemoryCategory): Copy {
  const covered = s.facts.windowCoversDeployment === true;

  if (category === "continuity") {
    const n = s.facts.repeatPurchaseIndex;
    const summary =
      covered && typeof n === "number"
        ? `A seat returned for its ${ordinal(n)} purchase.`
        : "A seat returned and purchased again within the loaded window.";
    return {
      title: "A member returned.",
      summary,
      reason:
        "Continuity signal — repeat participation is a member-living moment. " +
        "Recognition only; the amount is never considered.",
    };
  }

  if (category === "milestone") {
    // Reuse the Signal's own (already coverage-gated, label-bearing) reason as
    // the summary so we never re-import or re-derive a milestone label.
    return {
      title: "A pre-declared protocol milestone was recorded.",
      summary: s.reason,
      reason:
        `Milestone signal (${s.tier}) — a pre-declared protocol threshold ` +
        "recorded on-chain. Protocol-subject; not attributed to any person.",
    };
  }

  if (category === "founder-action") {
    // A founder action is only a BURN when the fact says so. Every other
    // founder action that reaches here is a FUNDING movement (operations /
    // vault / liquidity) — never describe it as a burn, or the candidate
    // invents a supply reduction that did not happen.
    if (s.facts.founderAction === "founder-burn" || s.createdFrom === "burn-founder") {
      return {
        title: "A founder-initiated burn reduced supply.",
        summary:
          "SYN was permanently sent to the burn address from a protocol wallet, " +
          "lowering circulating supply.",
        reason:
          "Burn signal recorded as a founder action — protocol support, " +
          "recognition only. No buyback, no automation, no financial claim.",
      };
    }
    return {
      title: "A founder-initiated protocol funding was recorded.",
      summary:
        "A protocol wallet recorded an incoming funding movement from a founder action.",
      reason:
        "Founder-action signal — protocol support, recognition only. " +
        "No buyback, no automation, no financial claim.",
    };
  }

  if (category === "burn") {
    return {
      title: "A community burn reduced supply.",
      summary:
        "SYN was permanently sent to the burn address, lowering circulating supply.",
      reason:
        "Burn signal — a member-witnessed, verifiable reduction of supply. " +
        "Recognition only.",
    };
  }

  if (category === "membership") {
    if (s.createdFrom === "rank-reached") {
      return {
        title: "A member reached a new recognition rank.",
        summary:
          "Cumulative on-chain activity moved a seat to a new recognition rank.",
        reason:
          "Membership signal (recognized action) — rank is structural " +
          "recognition only; it confers no rights, rewards, or return.",
      };
    }
    return {
      title: "A new member took a seat.",
      summary: "A new seat entered the public registry, expanding the membership.",
      reason:
        "Membership signal — a new seat entering the registry is a " +
        "member-living moment worth remembering. Recognition only.",
    };
  }

  if (category === "artifact") {
    return {
      title: "A recognized artifact was issued.",
      summary: "The Archive issued a verifiable artifact.",
      reason:
        `Artifact signal (${s.tier}) — a verifiable issuance from the Archive, ` +
        "expanding the protocol's permanent record.",
    };
  }

  if (category === "liquidity") {
    return {
      title: covered
        ? "The protocol's first recorded liquidity action."
        : "A liquidity action was recorded.",
      summary: "A liquidity event was recorded on the SYN/USDC pair.",
      reason:
        "Economic signal elevated to a protocol-institutional moment by " +
        "first-of-kind coverage — the protocol's liquidity structure changed.",
    };
  }

  if (category === "treasury") {
    return {
      title: covered
        ? "The protocol's first recorded Vault flow."
        : "A Vault flow was recorded.",
      summary: "A USDC flow through a protocol wallet was recorded.",
      reason:
        "Economic signal elevated to a protocol-institutional moment by " +
        "first-of-kind coverage — a treasury movement worth remembering.",
    };
  }

  // RESERVED categories (genesis / chapter / operations / system-wallet-action)
  // have no live producer; a safe, non-fabricating fallback.
  return {
    title: "A protocol-level event was recorded.",
    summary: "A verifiable protocol-level event was recorded on-chain.",
    reason: `Signal (${s.tier}) — a verifiable protocol moment worth reviewing.`,
  };
}

/**
 * Derive Memory Candidates from Signals. Pure & deterministic: the same Signals
 * always produce the same Candidates, in input order. Reads Signals ONLY —
 * never the raw event layer. Every candidate cites its Signal and preserves the
 * Signal → Event → Tx/Block lineage carried on the Signal.
 */
export function deriveMemoryCandidates(
  signals: ReadonlyArray<Signal>,
): MemoryCandidate[] {
  const out: MemoryCandidate[] = [];
  for (const s of signals) {
    const category = categoryFor(s);
    if (!shouldCreate(s, category)) continue;

    const register = registerForSubject(s.subject);
    // Defensive: never emit a candidate whose category cannot carry the derived
    // register (e.g. a coding error in the rule table). Skipped, not fabricated.
    if (!ALLOWED_REGISTERS_FOR_CATEGORY[category].includes(register)) continue;

    const copy = suggestCopy(s, category);
    const verification = verificationFor(s);
    const copyViolations = findForbiddenLanguage(
      `${copy.title}\n${copy.summary}\n${copy.reason}`,
    );

    out.push({
      id: `mem-${s.id}`,
      register,
      category,
      subject: s.subject,
      sourceSignalId: s.id,
      sourceEventId: s.sourceEventId,
      ...(s.sourceTxHash ? { sourceTxHash: s.sourceTxHash } : {}),
      ...(typeof s.sourceBlock === "bigint" ? { sourceBlock: s.sourceBlock } : {}),
      title: copy.title,
      summary: copy.summary,
      reason: copy.reason,
      verification,
      recommendedAction: recommendedActionFor(verification),
      createdFrom: s.createdFrom,
      copyViolations,
    });
  }
  return out;
}
