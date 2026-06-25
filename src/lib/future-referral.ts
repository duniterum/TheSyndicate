// Future Referral / Source Attribution Event Model (RESERVED).
//
// This reserves the shape of future attribution language. SourceRegistryV1 and
// MembershipSaleV3 exist, but SourceRegistryV1's first source record is
// PAUSED/internal only and the public buy path uses ZERO_SOURCE_ID. Nothing
// here is scanned, emitted, or paid. This is distinct from the SIMULATED UX preview in
// src/lib/preview/referral.ts.
//
// Doctrine:
//   - Referral/source attribution is attribution first, payout later.
//   - It records who helped bring whom into The Syndicate as a verified growth
//     contribution and member recognition.
//   - Commission status is ALWAYS PENDING until verified source records are created,
//     read back as ACTIVE, legally approved, and wired live.
// Canonical gate: verified source records are active, read back, legally approved, and wired live.
//   - No live commission is implied now.
//   - This namespace is intentionally kept OUT of ProtocolEventKind.

/** Legacy internal field name. The only allowed status while source/referral remains inactive. */
export type FutureReferralRewardStatus = "PENDING";

export const FUTURE_REFERRAL_REWARD_STATUS: FutureReferralRewardStatus = "PENDING";

export type FutureReferralAttribution = {
  /** Public registry reference of the source member, e.g. "Member #27". Never identity ownership. */
  referrerMember: string;
  /** Public registry reference of the new member, e.g. "Member #456". */
  newMember: string;
  /** Membership sale amount in USDC (when known). */
  saleUsdc?: number;
  /** USDC routed by the sale (when known). */
  usdcRouted?: number;
  /** SYN delivered to the new member (when known). */
  synSold?: number;
  /** ALWAYS "PENDING" while no source record is active. */
  rewardStatus: FutureReferralRewardStatus;
  /** Legal-safe note rendered anywhere this model is surfaced. */
  legalNote: string;
};

export const FUTURE_REFERRAL_NOTE =
  "Attribution only - a verified growth contribution and member recognition. " +
  "No commission is implied or paid. Commission status remains PENDING until verified " +
  "source records are active, read back, legally approved, and wired live.";

/**
 * Build a reserved attribution record. The legacy rewardStatus field is forced to PENDING and
 * cannot be overridden while public source/referral activation is inactive.
 */
export function buildFutureReferralAttribution(input: {
  referrerMember: string;
  newMember: string;
  saleUsdc?: number;
  usdcRouted?: number;
  synSold?: number;
}): FutureReferralAttribution {
  return {
    referrerMember: input.referrerMember,
    newMember: input.newMember,
    saleUsdc: input.saleUsdc,
    usdcRouted: input.usdcRouted,
    synSold: input.synSold,
    rewardStatus: FUTURE_REFERRAL_REWARD_STATUS,
    legalNote: FUTURE_REFERRAL_NOTE,
  };
}

/** Human summary, e.g. "Member #27 brought Member #456 into The Syndicate." */
export function describeFutureReferral(a: FutureReferralAttribution): string {
  return `${a.referrerMember} brought ${a.newMember} into The Syndicate.`;
}
