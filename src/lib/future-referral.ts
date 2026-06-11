// ─── Future Referral Event Model (RESERVED — attribution-first) ─────────────
// Reserves the SHAPE of a future referral attribution event. No referral
// contract exists; nothing here is scanned, emitted, or paid. This is the
// canonical reserved MODEL — distinct from the SIMULATED UX preview in
// src/lib/preview/referral.ts (which is for design only).
//
// Doctrine:
//   • Referral is ATTRIBUTION FIRST, payout later. It records who brought whom
//     — a verified growth contribution and member recognition.
//   • Reward status is ALWAYS PENDING until an on-chain referral contract is
//     deployed. No live commission is implied now.
//   • This namespace is intentionally kept OUT of `ProtocolEventKind` so no
//     pipeline consumer must handle it. See FUTURE_EVENT_NAMESPACES
//     ("referral-attribution" / "referral-reward") in protocol-event-registry.

/** The only allowed reward status until a contract exists. */
export type FutureReferralRewardStatus = "PENDING";

export const FUTURE_REFERRAL_REWARD_STATUS: FutureReferralRewardStatus = "PENDING";

export type FutureReferralAttribution = {
  /** Public registry reference of the referrer, e.g. "Member #27". Never identity. */
  referrerMember: string;
  /** Public registry reference of the new member, e.g. "Member #456". */
  newMember: string;
  /** Membership sale amount in USDC (when known). */
  saleUsdc?: number;
  /** USDC routed by the sale (when known). */
  usdcRouted?: number;
  /** SYN delivered to the new member (when known). */
  synSold?: number;
  /** ALWAYS "PENDING" — no reward is paid until a contract exists. */
  rewardStatus: FutureReferralRewardStatus;
  /** Legal-safe note rendered anywhere this model is surfaced. */
  legalNote: string;
};

export const FUTURE_REFERRAL_NOTE =
  "Attribution only — a verified growth contribution and member recognition. " +
  "No reward is implied or paid. Reward status remains PENDING until an " +
  "on-chain referral contract is deployed.";

/**
 * Build a reserved attribution record. `rewardStatus` is forced to PENDING and
 * cannot be overridden — there is no contract to settle against.
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
