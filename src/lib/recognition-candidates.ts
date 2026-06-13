// ─── Recognition Candidate Layer (architecture + rules only) ───────────────
// Recognition = a member did something visible, meaningful, or supportive. This
// is the MEMBER-subject counterpart to the Chronicle (which is PROTOCOL-subject
// and must never name a member). Recognition therefore NEVER crosses into the
// Chronicle.
//
// Hard doctrine:
//   • Recognition is structural acknowledgement. It confers NO rights, rewards,
//     or governance.
//   • This is NOT identity verification. No KYC. No real-world identity claim.
//   • A member's default display is anonymous (Member #N). Alias / public
//     display are OPTIONAL, self-declared, non-verified — architecture only,
//     no paid products built here.
//
// This module declares the rules + types + a pure derivation from a member's
// on-chain facts. It builds no UI and stores no alias.

import { FUTURE_REFERRAL_REWARD_STATUS } from "./future-referral";

export type RecognitionDisplayTier = "anonymous" | "alias" | "public";

export type RecognitionKind =
  | "patron-seal-holder"
  | "proof-of-burn-participant"
  | "early-chapter-member"
  | "major-rank-reached"
  | "artifact-tied"
  | "future-referrer";

export type RecognitionStatus = "CANDIDATE" | "APPROVED" | "REJECTED" | "PUBLISHED";

/** Default display is always the anonymous public registry number. */
export const DEFAULT_DISPLAY_TIER: RecognitionDisplayTier = "anonymous";

export const RECOGNITION_DISPLAY_RULES: ReadonlyArray<{
  tier: RecognitionDisplayTier;
  label: string;
  description: string;
}> = [
  {
    tier: "anonymous",
    label: "Anonymous",
    description:
      "Default. The member is shown only as a public registry number, e.g. Member #217.",
  },
  {
    tier: "alias",
    label: "Alias",
    description:
      "Optional member-chosen display name. Self-declared, non-verified. Not built yet — reserved.",
  },
  {
    tier: "public",
    label: "Public",
    description:
      "Optional self-declared public visibility. Non-verified, makes no claim about real-world identity. Not built yet — reserved.",
  },
];

export const RECOGNITION_LEGAL_NOTE =
  "Recognition is structural acknowledgement of an on-chain action. It confers " +
  "no rights, rewards, or governance, and makes no claim about a member's " +
  "real-world identity.";

export const RECOGNITION_KIND_BASIS: Record<RecognitionKind, string> = {
  "patron-seal-holder": "Holds a Patron Seal artifact.",
  "proof-of-burn-participant": "Participated in a verified Proof of Burn.",
  "early-chapter-member": "Took a seat during an early chapter.",
  "major-rank-reached": "Rose to a major rank through cumulative on-chain activity.",
  "artifact-tied": "Tied to a historical artifact issuance.",
  "future-referrer": "Brought a future member into The Syndicate (attribution only).",
};

export type RecognitionCandidate = {
  id: string;
  recognitionKind: RecognitionKind;
  /** Public registry reference — NEVER a real-world identity. */
  memberRef: string;
  /** Legal-safe statement of what the member did. */
  basis: string;
  /** Display tier (defaults to anonymous). */
  displayTier: RecognitionDisplayTier;
  status: RecognitionStatus;
  verifyHref?: string;
  legalNote: string;
  /** Present only for future-referrer — always PENDING (no contract). */
  rewardStatus?: typeof FUTURE_REFERRAL_REWARD_STATUS;
};

export type RecognitionInputs = {
  memberNumber?: number;
  /** Whether the member's rank is considered "major" (curated, not derived from spend). */
  isMajorRank?: boolean;
  isEarlyChapterMember?: boolean;
  patronSeals?: number;
  firstSignals?: number;
  proofOfFireParticipant?: boolean;
  verifyHref?: string;
};

function memberRefFor(n?: number): string {
  return n !== undefined ? `Member #${n}` : "Member";
}

function candidate(
  kind: RecognitionKind,
  memberRef: string,
  verifyHref?: string,
): RecognitionCandidate {
  return {
    id: `rc-${kind}-${memberRef.replace(/\s+/g, "").toLowerCase()}`,
    recognitionKind: kind,
    memberRef,
    basis: RECOGNITION_KIND_BASIS[kind],
    displayTier: DEFAULT_DISPLAY_TIER,
    status: "CANDIDATE",
    verifyHref,
    legalNote: RECOGNITION_LEGAL_NOTE,
    ...(kind === "future-referrer"
      ? { rewardStatus: FUTURE_REFERRAL_REWARD_STATUS }
      : {}),
  };
}

/**
 * Derive recognition candidates from a member's on-chain facts. Pure; produces
 * member-subject candidates with the default anonymous display tier. Builds no
 * paid product and stores no alias.
 */
export function deriveRecognitionCandidates(
  input: RecognitionInputs,
): RecognitionCandidate[] {
  const ref = memberRefFor(input.memberNumber);
  const out: RecognitionCandidate[] = [];
  if ((input.patronSeals ?? 0) > 0) out.push(candidate("patron-seal-holder", ref, input.verifyHref));
  if (input.proofOfFireParticipant) out.push(candidate("proof-of-burn-participant", ref, input.verifyHref));
  if (input.isEarlyChapterMember) out.push(candidate("early-chapter-member", ref, input.verifyHref));
  if (input.isMajorRank) out.push(candidate("major-rank-reached", ref, input.verifyHref));
  if ((input.firstSignals ?? 0) > 0) out.push(candidate("artifact-tied", ref, input.verifyHref));
  return out;
}

/** Resolve the display string for a candidate at a given tier. Alias/public are
 *  reserved (no alias is stored), so they fall back to the anonymous ref. */
export function recognitionDisplayName(
  c: RecognitionCandidate,
  tier: RecognitionDisplayTier = c.displayTier,
  alias?: string,
): string {
  if (tier === "anonymous") return c.memberRef;
  return alias?.trim() || c.memberRef;
}
