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
  USDC_DECIMALS,
  SYN_DECIMALS,
  USDC_ROUTING,
} from "./syndicate-config";
import { requireMetric } from "./protocol-metrics-registry";
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
  /** Canonical key — stable across the entire app (the legacy property name). */
  key: string;
  /** Canonical metric id in the Protocol Metrics Registry this fact binds. */
  metricId: string;
  /** Display label (used in pills / drawers / cards). Sourced from the registry. */
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

const statusFromValue = (v: unknown): TruthStatus => (v === undefined ? "PENDING" : "LIVE");

/** PENDING < PARTIAL < LIVE. Used to clamp a value-derived status to the
 *  registry's documented ceiling so a fact can downgrade but never silently
 *  upgrade past what the canonical registry says it is. */
const STATUS_RANK: Record<TruthStatus, number> = { PENDING: 0, PARTIAL: 1, LIVE: 2 };
const clampStatus = (derived: TruthStatus, ceiling: TruthStatus): TruthStatus =>
  STATUS_RANK[derived] <= STATUS_RANK[ceiling] ? derived : ceiling;

/**
 * Bind a live value to its canonical metric definition. `key` is the legacy
 * property name — also a registry alias — so every consumer keeps reading
 * `t.<prop>` unchanged. Metadata (label, source, formula, verifyHref, hook)
 * is pulled from the canonical Protocol Metrics Registry so it can never drift
 * from the verification drawer or any other surface.
 *
 * `opts.status` overrides the value-derived status (for registry/array facts);
 * `opts.verifyHref` overrides the registry's primary link (for dynamic tx
 * hrefs). An `undefined` verifyHref falls back to the registry default.
 */
function bind<T>(
  key: string,
  value: T | undefined,
  opts?: { status?: TruthStatus; verifyHref?: string | null },
): Fact<T> {
  const def = requireMetric(key);
  return {
    key,
    metricId: def.id,
    label: def.label,
    value,
    status: opts?.status ?? clampStatus(statusFromValue(value), def.status),
    source: def.source,
    formula: def.formula,
    verifyHref: opts?.verifyHref !== undefined ? opts.verifyHref : def.verification.primaryHref,
    hook: def.hook,
  };
}

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

  return {
    members: bind("members", members),
    usdcRaised: bind("usdcRaised", usdcRaised),
    synSold: bind("synSold", synSold),
    purchaseCount: bind("purchaseCount", purchaseCount),
    nextMemberNumber: bind("nextMemberNumber", nextMemberNumber),
    chapterProgress: bind("chapterProgress", deriveChapterProgress(members)),

    vaultUsdc: bind("vaultUsdc", pulse.vaultUsdc),
    liquidityUsdc: bind("liquidityUsdc", pulse.liquidityUsdc),
    operationsUsdc: bind("operationsUsdc", pulse.operationsUsdc),

    lpTvlUsd: bind("lpTvlUsd", lp.tvlUsd),
    synPriceUsd: bind("synPriceUsd", lp.synPriceUsd),

    lastBuyAgoSeconds: bind("lastBuyAgoSeconds", pulse.lastBuyAgoSeconds),
    lastBuyBuyer: bind("lastBuyBuyer", pulse.lastBuyBuyer, {
      // Dynamic per-tx href when the latest buy's tx hash is known; otherwise
      // the registry default (Membership Sale contract) applies.
      verifyHref: pulse.lastBuyTxHash ? txExplorerUrl(pulse.lastBuyTxHash) : undefined,
    }),

    transactions: bind("transactions", TAGGED_TRANSACTIONS, {
      status: TAGGED_TRANSACTIONS.length > 0 ? "LIVE" : "PENDING",
      verifyHref: lastTx ? txExplorerUrl(lastTx.txHash) : null,
    }),
    classifiedUsdcOut: bind("classifiedUsdcOut", classifiedUsdcOut, {
      status: classifiedBuckets.length > 0 ? "LIVE" : "PENDING",
      verifyHref: lastTx ? txExplorerUrl(lastTx.txHash) : null,
    }),

    membershipAllocationSyn: bind("membershipAllocationSyn", 350_000_000),
    totalSupplySyn: bind("totalSupplySyn", 1_000_000_000),

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
