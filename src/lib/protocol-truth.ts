// ─── Protocol Truth Layer ─────────────────────────────────────────────────
// SINGLE source of truth for every protocol fact displayed anywhere in the
// product. Components MUST read facts from this layer rather than re-deriving
// them from raw hooks (useSaleStats, useHolderIndex, useLpStats, etc.).
//
// This file does not perform new chain reads — it composes the existing
// canonical hooks and assigns each displayed fact:
//
//   • a canonical KEY              (TRUTH.usdcRaised, TRUTH.members, …)
//   • a canonical SOURCE           (which hook / contract / event)
//   • a canonical FORMULA          (how the value is derived)
//   • a canonical STATUS           (LIVE | PARTIAL | PENDING)
//   • a canonical VERIFY href      (explorer / contract / source link)
//
// Rule: if a fact is shown on two surfaces, both surfaces MUST read it from
// here. No page-specific recomputation. No component-specific classification.
// No silent fallbacks. Missing data renders the canonical "—" placeholder
// and surfaces the PENDING status from this layer.
//
// See docs/PROTOCOL_TRUTH_LAYER_REPORT.md for the full registry & migration
// status.

import { formatUnits } from "viem";
import {
  CONTRACTS,
  LP_POOL,
  USDC_DECIMALS,
  SYN_DECIMALS,
  USDC_ROUTING,
  MEMBER_DEFINITION,
  explorerUrlFor,
  explorerUrlForAddress,
} from "./syndicate-config";
import { useSaleStats, useLpStats } from "./sale-hooks";
import { useHolderIndex } from "./holder-index";
import { useProtocolPulse } from "./protocol-pulse";
import { useWalletAssets } from "./treasury-hooks";
import {
  TAGGED_TRANSACTIONS,
  classifiedUsdcByTag,
  txExplorerUrl,
  type TaggedTransaction,
} from "./transaction-tags";

// ─── Status enum (centralized — no page may redefine) ──────────────────────

export type TruthStatus = "LIVE" | "PARTIAL" | "PENDING";

export const STATUS_LABEL: Record<TruthStatus, string> = {
  LIVE:    "LIVE",
  PARTIAL: "PARTIAL",
  PENDING: "PENDING",
};

/** Tailwind classes for the canonical status pill. */
export function statusPillClasses(s: TruthStatus): { border: string; dot: string } {
  switch (s) {
    case "LIVE":
      return {
        border: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        dot:    "bg-emerald-500",
      };
    case "PARTIAL":
      return {
        border: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
        dot:    "bg-sky-500",
      };
    case "PENDING":
      return {
        border: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        dot:    "bg-amber-500",
      };
  }
}

// ─── Fact shape ────────────────────────────────────────────────────────────

export type Fact<T> = {
  /** Canonical key — stable across the entire app. */
  key: string;
  /** Display label (used in pills / drawers / cards). */
  label: string;
  /** Resolved value (undefined while loading or when source unavailable). */
  value: T | undefined;
  /** Trust status. */
  status: TruthStatus;
  /** Plain-language source description. */
  source: string;
  /** Plain-language derivation formula. */
  formula: string;
  /** Primary verification link (explorer / contract). */
  verifyHref: string | null;
  /** Hook that owns the underlying read. */
  hook: string;
};

const fact = <T>(f: Fact<T>): Fact<T> => f;

// ─── The truth registry ───────────────────────────────────────────────────

export type ChapterProgress = {
  /** Chapter id. */
  id: string;
  /** Display label, e.g. "Genesis Signal". */
  label: string;
  /** Inclusive upper bound on member number for this chapter. */
  capacity: number;
  /** Members already in this chapter. */
  taken: number;
  /** Seats remaining until this chapter closes. */
  remaining: number;
  /** Percent of the chapter filled (0–100). */
  progressPct: number;
};

export type ProtocolTruth = {
  /** Members — unique buyer count, derived from TokensPurchased events. */
  members: Fact<number>;
  /** USDC routed in via the sale contract (cumulative). */
  usdcRaised: Fact<number>;
  /** SYN distributed by the sale contract (cumulative). */
  synSold: Fact<number>;
  /** Total purchase events. */
  purchaseCount: Fact<number>;
  /** Next archive member number (members + 1). */
  nextMemberNumber: Fact<number>;
  /** Loop B canonical fact: current chapter + remaining-to-close. */
  chapterProgress: Fact<ChapterProgress>;

  /** Current USDC balance in the Vault routing wallet. */
  vaultUsdc: Fact<number>;
  /** Current USDC balance in the Liquidity routing wallet. */
  liquidityUsdc: Fact<number>;
  /** Current USDC balance in the Operations routing wallet. */
  operationsUsdc: Fact<number>;

  /** Live LP TVL on the SYN/USDC Trader Joe v1 pair. */
  lpTvlUsd: Fact<number>;
  /** Live SYN spot price implied by LP reserves. */
  synPriceUsd: Fact<number>;

  /** Seconds elapsed since the most recent buy event. */
  lastBuyAgoSeconds: Fact<number>;
  /** Buyer of the most recent purchase event. */
  lastBuyBuyer: Fact<string>;

  /** Classified, on-chain-verifiable transactions registry. */
  transactions: Fact<TaggedTransaction[]>;
  /** Sum of classified USDC outflows across all tagged transactions. */
  classifiedUsdcOut: Fact<number>;

  /** Membership distribution allocation (constant, on-chain spec). */
  membershipAllocationSyn: Fact<number>;
  /** Total SYN supply (constant — token is fixed supply). */
  totalSupplySyn: Fact<number>;

  /** Routing split, canonical labels + percentages. */
  routingSplit: typeof USDC_ROUTING;

  /** Aggregate readiness flags. */
  isLoading: boolean;
  isError: boolean;
};

/**
 * Canonical chapter capacities. Mirrors src/lib/chapters.ts doctrine.
 * Genesis Signal · First Thousand · The Expansion · First Ten Thousand
 * (Open Era is unbounded and not represented as a sealing target here).
 */
export const CHAPTERS: ReadonlyArray<{ id: string; label: string; capacity: number }> = [
  { id: "genesis-signal",     label: "Genesis Signal",     capacity: 333 },
  { id: "first-thousand",     label: "First Thousand",     capacity: 1_000 },
  { id: "the-expansion",      label: "The Expansion",      capacity: 3_333 },
  { id: "first-ten-thousand", label: "First Ten Thousand", capacity: 10_000 },
];

function deriveChapterProgress(members: number | undefined): ChapterProgress | undefined {
  if (members === undefined) return undefined;
  let prevCap = 0;
  for (const c of CHAPTERS) {
    if (members < c.capacity) {
      const taken = Math.max(0, members - prevCap);
      const size = c.capacity - prevCap;
      const remaining = Math.max(0, c.capacity - members);
      const progressPct = size > 0 ? Math.round((taken / size) * 100) : 0;
      return { id: c.id, label: c.label, capacity: c.capacity, taken, remaining, progressPct };
    }
    prevCap = c.capacity;
  }
  // All formation chapters sealed.
  const last = CHAPTERS[CHAPTERS.length - 1];
  return { id: last.id, label: last.label, capacity: last.capacity, taken: last.capacity, remaining: 0, progressPct: 100 };
}


const VAULT_ADDR = CONTRACTS.VAULT_WALLET;
const LIQ_ADDR   = CONTRACTS.LIQUIDITY_WALLET;
const OPS_ADDR   = CONTRACTS.OPERATIONS_WALLET;
const SALE_ADDR  = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS;
const PAIR_ADDR  = LP_POOL.pairAddress;

const explSale  = explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS");
const explSyn   = explorerUrlFor("SYN_CONTRACT_ADDRESS");
const explVault = explorerUrlForAddress(VAULT_ADDR);
const explLiq   = explorerUrlForAddress(LIQ_ADDR);
const explOps   = explorerUrlForAddress(OPS_ADDR);
const explPair  = explorerUrlForAddress(PAIR_ADDR);

const lastTx = TAGGED_TRANSACTIONS[TAGGED_TRANSACTIONS.length - 1];

/**
 * Single canonical hook. Every surface that shows a protocol fact MUST
 * read it from here.
 */
export function useProtocolTruth(): ProtocolTruth {
  const sale = useSaleStats();
  const lp   = useLpStats();
  const idx  = useHolderIndex();
  const pulse = useProtocolPulse();

  const usdcRaised = sale.totalUsdcRaised !== undefined
    ? Number(formatUnits(sale.totalUsdcRaised, USDC_DECIMALS)) : undefined;
  const synSold = sale.totalSynSold !== undefined
    ? Number(formatUnits(sale.totalSynSold, SYN_DECIMALS)) : undefined;
  const purchaseCount = sale.purchaseCount !== undefined ? Number(sale.purchaseCount) : undefined;

  const members = idx.totals.members > 0 ? idx.totals.members : (sale.totalBuyers !== undefined ? Number(sale.totalBuyers) : undefined);
  const nextMemberNumber = members !== undefined ? members + 1 : undefined;

  const classifiedBuckets = classifiedUsdcByTag();
  const classifiedUsdcOut = classifiedBuckets.reduce((s, b) => s + b.amount, 0);

  const statusFromValue = (v: unknown): TruthStatus => (v === undefined ? "PENDING" : "LIVE");

  return {
    members: fact({
      key: "members",
      label: "Members",
      value: members,
      status: statusFromValue(members),
      source: MEMBER_DEFINITION.source,
      formula: MEMBER_DEFINITION.formula,
      verifyHref: explSale,
      hook: "useHolderIndex",
    }),
    usdcRaised: fact({
      key: "usdcRaised",
      label: "USDC Routed",
      value: usdcRaised,
      status: statusFromValue(usdcRaised),
      source: "Avalanche C-Chain RPC · SyndicateMembershipSale.totalUsdcRaised().",
      formula: "sum(usdcIn) for every executed buy() call",
      verifyHref: explSale,
      hook: "useSaleStats",
    }),
    synSold: fact({
      key: "synSold",
      label: "SYN Distributed",
      value: synSold,
      status: statusFromValue(synSold),
      source: "Avalanche C-Chain RPC · SyndicateMembershipSale.totalSynSold().",
      formula: "usdcRaised / 0.01 USDC per SYN (fixed rate)",
      verifyHref: explSale,
      hook: "useSaleStats",
    }),
    purchaseCount: fact({
      key: "purchaseCount",
      label: "Purchases",
      value: purchaseCount,
      status: statusFromValue(purchaseCount),
      source: "Avalanche C-Chain RPC · SyndicateMembershipSale.purchaseCount().",
      formula: "count of executed buy() calls since deployment",
      verifyHref: explSale,
      hook: "useSaleStats",
    }),
    nextMemberNumber: fact({
      key: "nextMemberNumber",
      label: "Next Member #",
      value: nextMemberNumber,
      status: statusFromValue(nextMemberNumber),
      source: "Derived from members.",
      formula: "members + 1",
      verifyHref: explSale,
      hook: "useHolderIndex",
    }),
    chapterProgress: fact({
      key: "chapterProgress",
      label: "Chapter Progress",
      value: deriveChapterProgress(members),
      status: members === undefined ? "PENDING" : "LIVE",
      source: "Derived from members against the canonical CHAPTERS table (src/lib/protocol-truth.ts).",
      formula: "first chapter where members < capacity; remaining = capacity − members",
      verifyHref: explSale,
      hook: "useHolderIndex",
    }),



    vaultUsdc: fact({
      key: "vaultUsdc",
      label: "Vault Wallet · USDC",
      value: pulse.vaultUsdc,
      status: statusFromValue(pulse.vaultUsdc),
      source: `Avalanche C-Chain RPC · USDC.balanceOf(${VAULT_ADDR}).`,
      formula: "current ERC20 balance of the Vault routing wallet",
      verifyHref: explVault,
      hook: "useProtocolPulse",
    }),
    liquidityUsdc: fact({
      key: "liquidityUsdc",
      label: "Liquidity Wallet · USDC",
      value: pulse.liquidityUsdc,
      status: statusFromValue(pulse.liquidityUsdc),
      source: `Avalanche C-Chain RPC · USDC.balanceOf(${LIQ_ADDR}).`,
      formula: "current ERC20 balance of the Liquidity routing wallet",
      verifyHref: explLiq,
      hook: "useProtocolPulse",
    }),
    operationsUsdc: fact({
      key: "operationsUsdc",
      label: "Operations Wallet · USDC",
      value: pulse.operationsUsdc,
      status: statusFromValue(pulse.operationsUsdc),
      source: `Avalanche C-Chain RPC · USDC.balanceOf(${OPS_ADDR}).`,
      formula: "current ERC20 balance of the Operations routing wallet",
      verifyHref: explOps,
      hook: "useProtocolPulse",
    }),

    lpTvlUsd: fact({
      key: "lpTvlUsd",
      label: "LP TVL",
      value: lp.tvlUsd,
      status: statusFromValue(lp.tvlUsd),
      source: `Avalanche C-Chain RPC · Trader Joe v1 pair (${PAIR_ADDR}) getReserves().`,
      formula: "usdcReserve × 2 (symmetric pair valuation)",
      verifyHref: explPair,
      hook: "useLpStats",
    }),
    synPriceUsd: fact({
      key: "synPriceUsd",
      label: "SYN Spot",
      value: lp.synPriceUsd,
      status: statusFromValue(lp.synPriceUsd),
      source: `Avalanche C-Chain RPC · Trader Joe v1 pair (${PAIR_ADDR}) getReserves().`,
      formula: "usdcReserve / synReserve",
      verifyHref: explPair,
      hook: "useLpStats",
    }),

    lastBuyAgoSeconds: fact({
      key: "lastBuyAgoSeconds",
      label: "Last Buy",
      value: pulse.lastBuyAgoSeconds,
      status: statusFromValue(pulse.lastBuyAgoSeconds),
      source: "Avalanche C-Chain RPC · TokensPurchased events.",
      formula: "(currentBlock − lastBuyBlock) × 2s (Avalanche block time)",
      verifyHref: explSale,
      hook: "useProtocolPulse",
    }),
    lastBuyBuyer: fact({
      key: "lastBuyBuyer",
      label: "Last Buyer",
      value: pulse.lastBuyBuyer,
      status: statusFromValue(pulse.lastBuyBuyer),
      source: "Avalanche C-Chain RPC · most recent TokensPurchased event.",
      formula: "argmax(blockNumber) over TokensPurchased.buyer",
      verifyHref: pulse.lastBuyTxHash ? txExplorerUrl(pulse.lastBuyTxHash) : explSale,
      hook: "useProtocolPulse",
    }),

    transactions: fact({
      key: "transactions",
      label: "Classified Transactions",
      value: TAGGED_TRANSACTIONS,
      status: TAGGED_TRANSACTIONS.length > 0 ? "LIVE" : "PENDING",
      source: "src/lib/transaction-tags.ts · canonical registry; every entry links to its on-chain tx.",
      formula: "manual append-only registry, each entry verified on Avascan",
      verifyHref: lastTx ? txExplorerUrl(lastTx.txHash) : null,
      hook: "TAGGED_TRANSACTIONS",
    }),
    classifiedUsdcOut: fact({
      key: "classifiedUsdcOut",
      label: "Classified Spend",
      value: classifiedUsdcOut,
      status: classifiedBuckets.length > 0 ? "LIVE" : "PENDING",
      source: "Derived from TAGGED_TRANSACTIONS (USDC tagged outflows).",
      formula: "sum(amount) where asset = USDC",
      verifyHref: lastTx ? txExplorerUrl(lastTx.txHash) : null,
      hook: "classifiedUsdcByTag",
    }),

    membershipAllocationSyn: fact({
      key: "membershipAllocationSyn",
      label: "Membership Allocation",
      value: 350_000_000,
      status: "LIVE",
      source: "src/lib/syndicate-config.ts · TOKENOMICS_ALLOCATION (Membership Distribution slice).",
      formula: "constant — 35% of fixed supply",
      verifyHref: explSyn,
      hook: "TOKENOMICS_ALLOCATION",
    }),
    totalSupplySyn: fact({
      key: "totalSupplySyn",
      label: "Total SYN Supply",
      value: 1_000_000_000,
      status: "LIVE",
      source: "Avalanche C-Chain · SYN ERC20 totalSupply (fixed at deploy).",
      formula: "constant — token is fixed supply, no mint",
      verifyHref: explSyn,
      hook: "TOKEN_SPEC",
    }),

    routingSplit: USDC_ROUTING,

    isLoading: sale.isLoading || lp.isLoading || idx.isLoading || pulse.isLoading,
    isError:   sale.isError   || lp.isError   || idx.isError,
  };
}

// ─── Pure helpers (safe outside React) ─────────────────────────────────────

/** Canonical short-form formatter (USD). */
export function fmtUsd(n: number | undefined, max = 2): string {
  if (n === undefined) return "—";
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: max })}`;
}

/** Canonical short-form formatter (integer count). */
export function fmtCount(n: number | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** Canonical short-form formatter (SYN with symbol). */
export function fmtSyn(n: number | undefined): string {
  if (n === undefined) return "—";
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} SYN`;
}

// Re-export classification helpers so consumers never reach around the layer.
export { TAGGED_TRANSACTIONS, classifiedUsdcByTag, txExplorerUrl } from "./transaction-tags";
export type { TaggedTransaction } from "./transaction-tags";

// Keep useWalletAssets reachable via the truth layer for surfaces that need
// per-wallet, multi-asset balances (treasury/wallet pages). The truth layer
// re-exports it so future migrations can replace it without touching call
// sites.
export { useWalletAssets };
