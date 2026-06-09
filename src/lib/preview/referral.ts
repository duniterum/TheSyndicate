// SIMULATED preview data for the Referral / Reputation / Treasury preview surfaces.
// Nothing here is live. Nothing here is on-chain. Nothing here is a final formula.
//
// Doctrine: docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md
// Every consumer of this file MUST render a SIMULATED label and MUST NOT use the
// LIVE status pill. The CI guard scripts/check-preview-labels.mjs enforces both.

export const PREVIEW_DISCLAIMER =
  "Simulated preview · Not live data · For UX testing only · No contract deployed yet";

/** Public referral tier ladder — indicative only. Final tiers locked at contract deployment. */
export type ReferralTier = {
  name: string;
  threshold: number;           // verified referred members
  commissionPct: number;       // % of OPERATIONS slice (10% of gross), not of gross
  retentionRequiredPct: number;
};

export const REFERRAL_TIERS: ReferralTier[] = [
  { name: "Signal",     threshold: 0,   commissionPct: 30, retentionRequiredPct: 0 },
  { name: "Advocate",   threshold: 5,   commissionPct: 40, retentionRequiredPct: 60 },
  { name: "Patron",     threshold: 20,  commissionPct: 55, retentionRequiredPct: 70 },
  { name: "Architect",  threshold: 50,  commissionPct: 70, retentionRequiredPct: 75 },
  { name: "Steward",    threshold: 100, commissionPct: 80, retentionRequiredPct: 80 },
];

/** 70/20/10 split. Referral comes only from the 10% Operations slice. */
export const PROTOCOL_SPLIT = { vault: 70, liquidity: 20, operations: 10 } as const;

export function tierForCount(referred: number): ReferralTier {
  let t = REFERRAL_TIERS[0];
  for (const r of REFERRAL_TIERS) if (referred >= r.threshold) t = r;
  return t;
}

/** % of gross routed to referrer at a given tier (commission is taken from Operations only). */
export function referrerShareOfGross(tier: ReferralTier): number {
  return (PROTOCOL_SPLIT.operations * tier.commissionPct) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATED leaderboard rows
// Note: gross USDC is a tiebreaker only. Score is durability + retention + age + members.
// ─────────────────────────────────────────────────────────────────────────────

export type SimReferrer = {
  wallet: string;
  handle: string;
  referredMembers: number;
  activeAfter90d: number;        // still holding / active after 90 days
  activeAfter1y: number;         // still active after 1 year (sim window)
  durabilityScore: number;       // 0–100
  retentionScore: number;        // 0–100 (active/referred)
  referrerAgeDays: number;
  grossCommissionUsdc: number;
};

export const SIM_REFERRERS: SimReferrer[] = [
  { wallet: "0xS1M0000000000000000000000000000000000001", handle: "ember.eth",   referredMembers: 142, activeAfter90d: 128, activeAfter1y: 96, durabilityScore: 92, retentionScore: 90, referrerAgeDays: 612, grossCommissionUsdc: 18_420 },
  { wallet: "0xS1M0000000000000000000000000000000000002", handle: "north.eth",   referredMembers:  87, activeAfter90d:  79, activeAfter1y: 64, durabilityScore: 88, retentionScore: 91, referrerAgeDays: 540, grossCommissionUsdc: 11_310 },
  { wallet: "0xS1M0000000000000000000000000000000000003", handle: "halo.eth",    referredMembers:  68, activeAfter90d:  60, activeAfter1y: 47, durabilityScore: 84, retentionScore: 88, referrerAgeDays: 420, grossCommissionUsdc:  8_720 },
  { wallet: "0xS1M0000000000000000000000000000000000004", handle: "delta.eth",   referredMembers:  54, activeAfter90d:  41, activeAfter1y: 22, durabilityScore: 64, retentionScore: 76, referrerAgeDays: 380, grossCommissionUsdc:  6_980 },
  { wallet: "0xS1M0000000000000000000000000000000000005", handle: "kepler.eth",  referredMembers:  41, activeAfter90d:  39, activeAfter1y: 33, durabilityScore: 86, retentionScore: 95, referrerAgeDays: 300, grossCommissionUsdc:  5_200 },
  { wallet: "0xS1M0000000000000000000000000000000000006", handle: "atlas.eth",   referredMembers:  33, activeAfter90d:  21, activeAfter1y:  8, durabilityScore: 38, retentionScore: 64, referrerAgeDays: 210, grossCommissionUsdc:  4_120 },
  { wallet: "0xS1M0000000000000000000000000000000000007", handle: "verde.eth",   referredMembers:  22, activeAfter90d:  19, activeAfter1y: 14, durabilityScore: 72, retentionScore: 86, referrerAgeDays: 270, grossCommissionUsdc:  2_640 },
  { wallet: "0xS1M0000000000000000000000000000000000008", handle: "ridge.eth",   referredMembers:  18, activeAfter90d:  16, activeAfter1y: 11, durabilityScore: 70, retentionScore: 88, referrerAgeDays: 195, grossCommissionUsdc:  1_980 },
  { wallet: "0xS1M0000000000000000000000000000000000009", handle: "harbor.eth",  referredMembers:  12, activeAfter90d:   9, activeAfter1y:  5, durabilityScore: 52, retentionScore: 75, referrerAgeDays: 140, grossCommissionUsdc:  1_220 },
  { wallet: "0xS1M000000000000000000000000000000000000A", handle: "lumen.eth",   referredMembers:   7, activeAfter90d:   6, activeAfter1y:  4, durabilityScore: 60, retentionScore: 85, referrerAgeDays:  95, grossCommissionUsdc:    640 },
];

/** Builder Score (preview formula — NOT FINAL).
 *   score = retention × 0.40 + durability × 0.30 + ageFactor × 0.20 + reachFactor × 0.10
 *   Gross commission is only used as a tiebreaker.
 */
export function builderScore(r: SimReferrer): number {
  const ageFactor = Math.min(100, (r.referrerAgeDays / 730) * 100); // caps at ~2yr
  const reachFactor = Math.min(100, Math.log2(1 + r.activeAfter90d) * 18);
  return (
    r.retentionScore * 0.4 +
    r.durabilityScore * 0.3 +
    ageFactor * 0.2 +
    reachFactor * 0.1
  );
}

export function rankedReferrers(): Array<SimReferrer & { score: number }> {
  return SIM_REFERRERS
    .map((r) => ({ ...r, score: builderScore(r) }))
    .sort((a, b) => (b.score - a.score) || (b.grossCommissionUsdc - a.grossCommissionUsdc));
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATED recent referral activity
// ─────────────────────────────────────────────────────────────────────────────

export type SimReferralEvent = {
  id: string;
  referrer: string;
  buyerShort: string;
  usdc: number;
  tier: string;
  commissionUsdc: number;
  whenLabel: string; // human, relative
};

export const SIM_REFERRAL_EVENTS: SimReferralEvent[] = [
  { id: "e1", referrer: "ember.eth",  buyerShort: "0x9f…42c1", usdc: 250, tier: "Patron",    commissionUsdc: 13.75, whenLabel: "~2h ago" },
  { id: "e2", referrer: "north.eth",  buyerShort: "0x12…ab30", usdc: 100, tier: "Advocate",  commissionUsdc:  4.00, whenLabel: "~5h ago" },
  { id: "e3", referrer: "kepler.eth", buyerShort: "0x77…0d2e", usdc:  50, tier: "Advocate",  commissionUsdc:  2.00, whenLabel: "~9h ago" },
  { id: "e4", referrer: "halo.eth",   buyerShort: "0x4b…3a99", usdc: 500, tier: "Patron",    commissionUsdc: 27.50, whenLabel: "~14h ago" },
  { id: "e5", referrer: "atlas.eth",  buyerShort: "0xee…77c2", usdc:  25, tier: "Signal",    commissionUsdc:  0.75, whenLabel: "~1d ago" },
  { id: "e6", referrer: "ember.eth",  buyerShort: "0x33…91ff", usdc:  75, tier: "Patron",    commissionUsdc:  4.13, whenLabel: "~1d ago" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATED treasury ledger rows
// Schema mirrors the canonical Attribution event (forward-compatible).
// status: "SIMULATED" for previews. A future real row would be "LIVE" + txHash.
// ─────────────────────────────────────────────────────────────────────────────

export type LedgerRow = {
  id: string;
  source: string;       // wallet / module name
  destination: string;  // wallet / category
  amountUsdc: number;
  reason: string;       // canonical movement tag
  status: "SIMULATED" | "PENDING";
  whenLabel: string;
};

export const SIM_TREASURY_ROWS: LedgerRow[] = [
  { id: "t1", source: "MembershipSale",   destination: "Vault Reserve",          amountUsdc: 175, reason: "SALE_TO_VAULT (70%)",        status: "SIMULATED", whenLabel: "~1h ago" },
  { id: "t2", source: "MembershipSale",   destination: "Liquidity Wallet",       amountUsdc:  50, reason: "SALE_TO_LIQUIDITY (20%)",    status: "SIMULATED", whenLabel: "~1h ago" },
  { id: "t3", source: "MembershipSale",   destination: "Operations Wallet",      amountUsdc:  25, reason: "SALE_TO_OPERATIONS (10%)",   status: "SIMULATED", whenLabel: "~1h ago" },
  { id: "t4", source: "Operations Wallet", destination: "ember.eth (referrer)",  amountUsdc:  13.75, reason: "OPERATIONS_TO_REFERRER",  status: "SIMULATED", whenLabel: "~1h ago" },
  { id: "t5", source: "Liquidity Wallet", destination: "Trader Joe SYN/USDC LP", amountUsdc:  50, reason: "LIQUIDITY_LP_ADD",           status: "PENDING",   whenLabel: "queued" },
  { id: "t6", source: "Vault Reserve",    destination: "Yield-bearing position", amountUsdc: 500, reason: "VAULT_TO_INVESTMENT",        status: "PENDING",   whenLabel: "queued" },
  { id: "t7", source: "Operations Wallet", destination: "Infrastructure (RPC)",  amountUsdc:  35, reason: "OPERATIONS_TO_INFRA",        status: "SIMULATED", whenLabel: "~6h ago" },
  { id: "t8", source: "Operations Wallet", destination: "Audit firm",            amountUsdc: 250, reason: "OPERATIONS_TO_AUDIT",        status: "SIMULATED", whenLabel: "~2d ago" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Chart data (all SIMULATED)
// ─────────────────────────────────────────────────────────────────────────────

/** Referrer commission earned (USDC) at each tier, for a $100 reference sale. */
export const COMMISSION_BY_TIER = REFERRAL_TIERS.map((t) => ({
  tier: t.name,
  usdcOn100: (100 * referrerShareOfGross(t)) / 100, // = referrer % of $100 sale
  pctOfGross: referrerShareOfGross(t),
}));

/** 12-week simulated retention curve for a fictional cohort of 100 referred members. */
export const RETENTION_CURVE = [
  { week:  0, active: 100 },
  { week:  1, active:  96 },
  { week:  2, active:  92 },
  { week:  4, active:  88 },
  { week:  6, active:  84 },
  { week:  8, active:  81 },
  { week: 10, active:  78 },
  { week: 12, active:  76 },
];

/** Treasury movement categories — share of total simulated outflow this preview window. */
export const TREASURY_CATEGORIES = [
  { tag: "SALE_TO_VAULT",         pct: 70, tone: "gold"    as const },
  { tag: "SALE_TO_LIQUIDITY",     pct: 20, tone: "navy"    as const },
  { tag: "OPERATIONS_TO_REFERRER", pct: 5, tone: "success" as const },
  { tag: "OPERATIONS_TO_INFRA",   pct:  3, tone: "muted"   as const },
  { tag: "OPERATIONS_TO_AUDIT",   pct:  2, tone: "muted"   as const },
];
