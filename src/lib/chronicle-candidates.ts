// ─── Chronicle Candidate Layer ─────────────────────────────────────────────
// Advisory layer that proposes which protocol events MIGHT deserve a Chronicle
// entry — WITHOUT auto-publishing and WITHOUT touching the locked Chronicle.
//
// Relationship to the real Chronicle (src/lib/chronicle-entries.ts):
//   • The Chronicle is a hardcoded, constitutionally-reviewed registry. Its
//     six-part selection gate + chronicle-doctrine.test.ts are the real filter.
//   • This layer NEVER writes there. It derives CANDIDATES from the event
//     pipeline so a human curator can see "these are worth considering."
//   • PUBLISHED means a human recorded that decision here AND a matching real
//     entry exists. Nothing flips to PUBLISHED automatically.
//
// Clause 6 (protocol-centricity): a Chronicle subject must be a protocol
// primitive — NEVER a wallet / member / founder / buyer. Person-subject event
// kinds (purchase / new-member / rank-reached) are therefore excluded at the
// source via `chronicleEligible`. Burns map to a "supply" subject and LP events
// to a "liquidity" subject; those are protocol primitives but are NOT in the
// locked Chronicle's chapter|archive subject set, so they are flagged
// `promotable: false` until a curator maps them (the Member #1 precedent).

import type {
  ProtocolEventKind,
  ProtocolEventCategory,
} from "./protocol-event-registry";
import type { CanonicalProtocolEvent } from "./protocol-events";
import {
  CHRONICLE_BANNED_TERMS,
  CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS,
} from "./chronicle-entries";
import { findForbiddenLanguage } from "./protocol-language";

export type ChronicleWorthiness = "always" | "sometimes" | "activity-only";
export type ChronicleCandidateStatus =
  | "CANDIDATE"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

/** Protocol-primitive subject a candidate would carry. chapter|archive match
 *  the locked Chronicle; supply|liquidity are primitives that still need a
 *  curator's subject mapping before they could ever be promoted. */
export type ChronicleCandidateSubject = "chapter" | "archive" | "supply" | "liquidity";

export type ChronicleCandidate = {
  id: string;
  eventId: string;
  kind: ProtocolEventKind;
  category: ProtocolEventCategory;
  worthiness: ChronicleWorthiness;
  /** Why this event qualifies as a candidate. */
  reason: string;
  subjectHint: ChronicleCandidateSubject;
  /** True only when subjectHint is in the locked Chronicle's subject set. */
  promotable: boolean;
  suggestedTitle: string;
  suggestedBody: string;
  suggestedWhatChanged: string;
  /** Verifiable on-chain link (empty when the tx hash is unverifiable). */
  verifyHref: string;
  status: ChronicleCandidateStatus;
  /** Selection-gate violations in the suggested copy (must be empty). */
  copyViolations: string[];
};

/**
 * Baseline worthiness per kind. Person-subject + routine kinds are
 * "activity-only" (no candidate). The first occurrence of any eligible kind is
 * elevated to "always" at derivation time (first artifact, first LP event…).
 */
const WORTHINESS_FOR_KIND: Record<ProtocolEventKind, ChronicleWorthiness> = {
  purchase: "activity-only",
  "new-member": "activity-only",
  "rank-reached": "activity-only",
  "swap-buy": "activity-only",
  "swap-sell": "activity-only",
  "vault-in": "activity-only",
  "vault-out": "activity-only",
  "lp-add": "sometimes",
  "lp-remove": "sometimes",
  "nft-mint-first-signal": "sometimes",
  "nft-mint-patron-seal": "sometimes",
  "nft-mint-other": "activity-only",
  "burn-founder": "always",
  "burn-community": "sometimes",
};

export function worthinessForKind(kind: ProtocolEventKind): ChronicleWorthiness {
  return WORTHINESS_FOR_KIND[kind];
}

const KIND_NOUN: Partial<Record<ProtocolEventKind, string>> = {
  "lp-add": "liquidity addition",
  "lp-remove": "liquidity removal",
  "nft-mint-first-signal": "First Signal issuance",
  "nft-mint-patron-seal": "Patron Seal issuance",
  "nft-mint-other": "artifact issuance",
  "burn-founder": "founder-initiated burn",
  "burn-community": "community burn",
};

type SuggestedCopy = {
  subjectHint: ChronicleCandidateSubject;
  title: string;
  body: string;
  whatChanged: string;
};

/** Protocol-voice, person-free suggested copy per category. */
function suggestCopyFor(category: ProtocolEventCategory): SuggestedCopy {
  switch (category) {
    case "burn":
      return {
        subjectHint: "supply",
        title: "A verified SYN burn reduced circulating supply.",
        body:
          "A quantity of SYN was permanently sent to the standard dead address, " +
          "lowering circulating supply. The protocol runs no automated burn; each " +
          "reduction is a manual, on-chain-verifiable act recorded under Proof of Fire.",
        whatChanged:
          "Circulating supply decreased by a verified, permanent amount anchored on-chain.",
      };
    case "archive":
      return {
        subjectHint: "archive",
        title: "The archive recorded a new artifact issuance.",
        body:
          "An artifact was issued on the Archive contract, expanding the protocol's " +
          "permanent archive. Each issuance is an on-chain-verifiable object in a growing series.",
        whatChanged: "The archive grew by one verifiable artifact issuance.",
      };
    case "lp":
      return {
        subjectHint: "liquidity",
        title: "The protocol's liquidity position changed.",
        body:
          "A liquidity event was recorded on the SYN/USDC pair, changing the protocol's " +
          "on-chain liquidity structure. The event is verifiable on-chain.",
        whatChanged: "The on-chain liquidity structure changed in a verifiable way.",
      };
    default:
      // Eligible categories are burn/archive/lp; fall back to a safe primitive.
      return {
        subjectHint: "chapter",
        title: "A protocol-level event was recorded.",
        body:
          "A protocol-level event was recorded on-chain. It is verifiable and part of " +
          "the protocol's permanent record.",
        whatChanged: "The protocol's on-chain record advanced in a verifiable way.",
      };
  }
}

/**
 * Validate suggested Chronicle copy against the constitutional vocabulary: the
 * Chronicle's banned terms, its forbidden person-subject patterns, and the
 * protocol-language forbidden list. Returns the violations (empty = clean).
 */
export function validateCandidateCopy(copy: {
  title: string;
  body: string;
  whatChanged: string;
}): string[] {
  const errs: string[] = [];
  const haystack = `${copy.title}\n${copy.body}\n${copy.whatChanged}`;
  const lower = haystack.toLowerCase();
  for (const term of CHRONICLE_BANNED_TERMS) {
    if (lower.includes(term)) errs.push(`banned term: "${term}"`);
  }
  for (const pat of CHRONICLE_FORBIDDEN_SUBJECT_PATTERNS) {
    if (pat.test(haystack)) errs.push(`forbidden subject pattern: ${pat}`);
  }
  for (const term of findForbiddenLanguage(haystack)) {
    errs.push(`forbidden language: "${term}"`);
  }
  return errs;
}

// Curation decisions. Default is CANDIDATE — nothing is APPROVED/PUBLISHED until
// a human records it here AND (for PUBLISHED) a matching real Chronicle entry
// exists. Keyed by event id. This is the ONLY way a candidate advances.
export const CHRONICLE_CANDIDATE_DECISIONS: Readonly<
  Record<string, ChronicleCandidateStatus>
> = {};

export function statusForEvent(eventId: string): ChronicleCandidateStatus {
  return CHRONICLE_CANDIDATE_DECISIONS[eventId] ?? "CANDIDATE";
}

const LOCKED_SUBJECTS: ReadonlySet<ChronicleCandidateSubject> = new Set([
  "chapter",
  "archive",
]);

/**
 * Derive Chronicle candidates from the canonical event stream. Only events the
 * registry marks `chronicleEligible` are considered (person-subject kinds are
 * excluded there). The first occurrence of any eligible kind is elevated to
 * "always"; events that remain "activity-only" produce no candidate.
 */
export function deriveChronicleCandidates(
  events: ReadonlyArray<CanonicalProtocolEvent>,
  opts: {
    /**
     * Set true ONLY when `events` is a gapless, full-history scan. The
     * earliest event of a kind is then a genuine protocol-wide first; otherwise
     * (the default) it is only the earliest in the supplied window, and the
     * reason is phrased window-relative so no false "first ever" claim is made.
     */
    windowComplete?: boolean;
  } = {},
): ChronicleCandidate[] {
  // Find the first (oldest) event id per kind for first-occurrence elevation.
  const ascending = [...events].sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? a.logIndex - b.logIndex
      : a.blockNumber > b.blockNumber
      ? 1
      : -1,
  );
  const firstOfKind = new Map<ProtocolEventKind, string>();
  for (const e of ascending) {
    if (!firstOfKind.has(e.kind)) firstOfKind.set(e.kind, e.id);
  }

  const out: ChronicleCandidate[] = [];
  for (const e of events) {
    if (!e.chronicleEligible) continue;
    const isFirst = firstOfKind.get(e.kind) === e.id;
    const baseline = WORTHINESS_FOR_KIND[e.kind];
    const worthiness: ChronicleWorthiness = isFirst ? "always" : baseline;
    if (worthiness === "activity-only") continue;

    const copy = suggestCopyFor(e.category);
    const noun = KIND_NOUN[e.kind] ?? "protocol event";
    const reason = isFirst
      ? opts.windowComplete
        ? `First ${noun} recorded by the protocol.`
        : `Earliest ${noun} in the current sample.`
      : worthiness === "always"
      ? "Protocol-level milestone — always chronicle-worthy."
      : "Potentially chronicle-worthy — pending curation.";

    out.push({
      id: `cc-${e.id}`,
      eventId: e.id,
      kind: e.kind,
      category: e.category,
      worthiness,
      reason,
      subjectHint: copy.subjectHint,
      promotable: LOCKED_SUBJECTS.has(copy.subjectHint),
      suggestedTitle: copy.title,
      suggestedBody: copy.body,
      suggestedWhatChanged: copy.whatChanged,
      verifyHref: e.verificationLink,
      status: statusForEvent(e.id),
      copyViolations: validateCandidateCopy({
        title: copy.title,
        body: copy.body,
        whatChanged: copy.whatChanged,
      }),
    });
  }
  return out;
}
