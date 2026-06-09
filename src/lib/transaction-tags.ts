// ─── Transaction Tag Registry ──────────────────────────────────────────────
// Single source of truth for classifying outgoing protocol transactions.
//
// Rule: every dollar that has left an allocation wallet must either appear
// here with a canonical classification (tag + description + tx hash) OR be
// surfaced as an explicit "untagged — awaiting classification" entry. The
// site must never invent categories and must never silently absorb spend.
//
// Allowed tags are intentionally narrow. Add new ones only when a real,
// recurring spend category exists.
//
// Derived consumers:
//   • UseOfFunds (Transparency → spending breakdown)
//   • LiquidityTrustContext (LP seed funding context)
//   • Activity / Protocol Moments (when wired)

import { CONTRACTS, LP_POOL, txExplorerUrl as canonicalTxExplorerUrl } from "./syndicate-config";

export type TransactionTag =
  | "LP_SEED"
  | "LP_ADD"
  | "LP_REMOVE"
  | "DEV"
  | "INFRASTRUCTURE"
  | "LEGAL"
  | "MARKETING"
  | "OPERATIONS"
  | "TREASURY_TRANSFER"
  | "REFUND"
  | "OTHER";

export const TAG_LABEL: Record<TransactionTag, string> = {
  LP_SEED:            "LP Seed",
  LP_ADD:             "LP Add",
  LP_REMOVE:          "LP Remove",
  DEV:                "Development",
  INFRASTRUCTURE:     "Infrastructure",
  LEGAL:              "Legal",
  MARKETING:          "Marketing",
  OPERATIONS:         "Operations",
  TREASURY_TRANSFER:  "Treasury Transfer",
  REFUND:             "Refund",
  OTHER:              "Other",
};

export type TaggedTransaction = {
  /** Canonical tx hash on Avalanche C-Chain. */
  txHash: string;
  /** Wallet the funds left (allocation wallet). */
  wallet: string;
  /** Token symbol — USDC for fiat-equivalent accounting. */
  asset: "USDC" | "SYN" | "AVAX";
  /** Amount in human units of `asset`. */
  amount: number;
  /** ISO timestamp (best known). */
  timestamp: string;
  /** Canonical classification. */
  tag: TransactionTag;
  /** Short human-readable description, surfaced on Transparency / Activity. */
  description: string;
  /** Optional cross-link path within the site (e.g. /liquidity). */
  contextPath?: string;
};

// Re-export the single canonical tx URL helper from syndicate-config so
// downstream consumers (protocol-truth, etc.) keep working without
// duplicating explorer logic. NEVER hand-build a tx URL here.
export const txExplorerUrl = canonicalTxExplorerUrl;

// ─── Known tagged transactions ─────────────────────────────────────────────
// Conservative: only transactions whose purpose is verifiable from the chain
// itself (LP pair creation, deterministic routing). Everything else stays
// untagged until manually classified.

export const TAGGED_TRANSACTIONS: TaggedTransaction[] = [
  {
    txHash:      LP_POOL.creationTx,
    wallet:      CONTRACTS.LIQUIDITY_WALLET,
    asset:       "USDC",
    amount:      LP_POOL.initialUsdc, // 2 USDC
    timestamp:   "2025-01-01T00:00:00Z",
    tag:         "LP_SEED",
    description: `Initial LP seed — funded the ${LP_POOL.pair} pair on ${LP_POOL.dex} ${LP_POOL.dexVersion} with ${LP_POOL.initialSyn} SYN + ${LP_POOL.initialUsdc} USDC.`,
    contextPath: "/liquidity",
  },
];

// ─── Derivation helpers (pure) ─────────────────────────────────────────────

export function tagsForWallet(wallet: string): TaggedTransaction[] {
  const w = wallet.toLowerCase();
  return TAGGED_TRANSACTIONS.filter((t) => t.wallet.toLowerCase() === w);
}

/** Total classified USDC spend out of a wallet (sum across all tags). */
export function classifiedUsdcSpend(wallet: string): number {
  return tagsForWallet(wallet)
    .filter((t) => t.asset === "USDC")
    .reduce((s, t) => s + t.amount, 0);
}

/** Group classified USDC spend by tag (omits tags with $0). */
export function classifiedUsdcByTag(wallet?: string): Array<{ tag: TransactionTag; label: string; amount: number; txs: TaggedTransaction[] }> {
  const pool = wallet ? tagsForWallet(wallet) : TAGGED_TRANSACTIONS;
  const usdc = pool.filter((t) => t.asset === "USDC");
  const grouped = new Map<TransactionTag, TaggedTransaction[]>();
  for (const t of usdc) {
    const arr = grouped.get(t.tag) ?? [];
    arr.push(t);
    grouped.set(t.tag, arr);
  }
  return Array.from(grouped.entries()).map(([tag, txs]) => ({
    tag,
    label: TAG_LABEL[tag],
    amount: txs.reduce((s, t) => s + t.amount, 0),
    txs,
  }));
}

/**
 * Given a wallet's *observed* USDC spend (allocated − current balance),
 * split it into:
 *   - classifiedUsdc: amount we can attribute to known tagged transactions
 *   - untaggedUsdc:   residual that has no canonical classification yet
 *
 * Both numbers are clamped to ≥ 0 to handle rounding noise.
 */
export function splitSpend(wallet: string, observedSpentUsdc: number | undefined): {
  classifiedUsdc: number | undefined;
  untaggedUsdc: number | undefined;
  classifiedBreakdown: Array<{ tag: TransactionTag; label: string; amount: number; txs: TaggedTransaction[] }>;
} {
  const classified = classifiedUsdcSpend(wallet);
  const breakdown = classifiedUsdcByTag(wallet);
  if (observedSpentUsdc === undefined) {
    return { classifiedUsdc: undefined, untaggedUsdc: undefined, classifiedBreakdown: breakdown };
  }
  // Classified can't exceed observed; residual is the untagged portion.
  const classifiedClamped = Math.min(classified, observedSpentUsdc);
  const untagged = Math.max(0, observedSpentUsdc - classifiedClamped);
  return { classifiedUsdc: classifiedClamped, untaggedUsdc: untagged, classifiedBreakdown: breakdown };
}
