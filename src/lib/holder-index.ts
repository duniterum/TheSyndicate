// ─────────────────────────────────────────────────────────────────────────
// useHolderIndex — canonical member intelligence layer for The Syndicate.
//
// Design contract (do not drift): see docs/HOLDER_INDEX_ARCHITECTURE.md
//
//   • Membership identity comes from EXACTLY ONE event: TokensPurchased on
//     the Membership Sale contract. A wallet that receives SYN via Transfer
//     or buys on the LP is a HOLDER, not a MEMBER, and must not appear here.
//
//   • Fields are strictly classified:
//       INDEXED  — immutable, sourced from purchase events
//       DERIVED  — pure functions of indexed state (re-derived on read)
//       LIVE     — (future enrichment, multicalls) — not stored
//       MANUAL   — forbidden
//
//   • The public hook signature is stable across phases. Today it scans
//     the chain client-side via useLivePurchaseEvents. Tomorrow it can be
//     fed by a hosted cache, indexer, or subgraph WITHOUT changing the
//     return type or any consumer.
// ─────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useLivePurchaseEvents, type PurchaseEvent } from "./activity-hooks";
import { RANKS_V2, rankForUsdc, type RankTier } from "./syndicate-config";
import { useChainTime, WINDOW_24H, WINDOW_7D } from "./chain-time";
import { getChapterByMemberNumber, isFounder, type ChapterId } from "./chapters";

/**
 * Canonical chapter identifier. Re-exported from `./chapters` so the
 * canonical doctrine lives in exactly one place. Members of this protocol
 * belong to one of:
 *   "genesis-signal"      — members #1     – #333
 *   "first-thousand"      — members #334   – #1,000
 *   "the-expansion"       — members #1,001 – #3,333
 *   "first-ten-thousand"  — members #3,334 – #10,000
 *   "open-era"            — members #10,001+
 */
export type HolderChapter = ChapterId;

export type HolderEligibility = {
  /** Inside the Genesis Signal cohort (#1 – #333). Pure derivation, NOT contract-driven. */
  foundersBadge: boolean;
  /** Holds a chapter badge (any sealed chapter membership). */
  chapterBadge: boolean;
  /** Eligible to participate in member-only governance once it ships. */
  governance: boolean;
};

export type HolderRecord = {
  // ─── IDENTITY (INDEXED, immutable once written) ─────────────────────
  wallet: `0x${string}`;
  founderNumber: number;          // 1..N order of FIRST purchase
  memberNumber: number;           // alias of founderNumber for Wave 1
  firstPurchaseBlock: bigint;
  firstPurchaseTx: `0x${string}`;
  lastPurchaseBlock: bigint;
  lastPurchaseTx: `0x${string}`;

  // ─── CUMULATIVE FOOTPRINT (INDEXED, monotonic) ──────────────────────
  purchaseCount: number;
  cumulativeUsdc: number;
  cumulativeSyn: number;
  cumulativeRoutedToVault: number;
  cumulativeRoutedToLiquidity: number;
  cumulativeRoutedToOperations: number;
  largestSinglePurchaseUsdc: number;
  /** Most-recent single purchase amounts for this wallet. */
  lastPurchaseUsdc: number;
  lastPurchaseSyn: number;

  // ─── RANK STATE (DERIVED) ───────────────────────────────────────────
  currentRank: RankTier | null;
  nextRank: RankTier | null;
  usdcToNextRank: number | null;

  // ─── CHAPTER (DERIVED from founderNumber) ───────────────────────────
  chapter: HolderChapter;

  // ─── ELIGIBILITY (DERIVED, never stored) ────────────────────────────
  eligibility: HolderEligibility;
};

export type HolderTotals = {
  members: number;
  purchaseCount: number;
  cumulativeUsdc: number;
  cumulativeSyn: number;
  averageTicketUsdc: number;
  medianTicketUsdc: number;
  largestTicketUsdc: number;
  rankDistribution: Record<string, number>;
  nextMemberNumber: number;
};

export type HolderWindowDelta = {
  /** Window length in seconds (e.g. 86_400 for 24h). */
  windowSeconds: number;
  /** True when the data source actually covers this window. */
  available: boolean;
  newMembers: number;
  purchases: number;
  usdcRaised: number;
  synSold: number;
  vaultRouted: number;
  liquidityRouted: number;
  operationsRouted: number;
};

export type HolderIndex = {
  isLoading: boolean;
  isError: boolean;
  /** True when at least one TokensPurchased event has been indexed. */
  hasData: boolean;
  asOfBlock: bigint | undefined;
  asOfUnix: number | undefined;
  byWallet: Map<string, HolderRecord>;
  /** Sorted by founderNumber ASC — the canonical archive ordering. */
  ordered: HolderRecord[];
  /** Sorted by lastPurchaseBlock DESC — most-recently-active first. */
  latest: HolderRecord[];
  totals: HolderTotals;
  /** Windowed deltas; undefined if chain-time tip not yet resolved. */
  deltas: { last24h: HolderWindowDelta; last7d: HolderWindowDelta } | undefined;
  /** Convenience accessor — case-insensitive. */
  getByWallet: (address?: string | null) => HolderRecord | undefined;
  refetch: () => void;
};

// ─── Derivation helpers (pure) ────────────────────────────────────────

export function chapterForFounderNumber(n: number): HolderChapter {
  return getChapterByMemberNumber(n).id;
}

function deriveEligibility(founderNumber: number): HolderEligibility {
  return {
    foundersBadge: isFounder(founderNumber),       // Genesis Signal cohort (#1 – #333)
    chapterBadge: founderNumber >= 1,              // every member has a chapter
    governance: true,                              // any member can participate when governance ships
  };
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function emptyTotals(): HolderTotals {
  return {
    members: 0,
    purchaseCount: 0,
    cumulativeUsdc: 0,
    cumulativeSyn: 0,
    averageTicketUsdc: 0,
    medianTicketUsdc: 0,
    largestTicketUsdc: 0,
    rankDistribution: Object.fromEntries(RANKS_V2.map((r) => [r.name, 0])),
    nextMemberNumber: 1,
  };
}

// ─── Core builder (pure function over raw events) ─────────────────────
// Exposed so future data sources (Cloud cache, subgraph) can reuse it.

export function buildHolderIndex(events: PurchaseEvent[]): {
  byWallet: Map<string, HolderRecord>;
  ordered: HolderRecord[];
  totals: HolderTotals;
} {
  if (!events || events.length === 0) {
    return { byWallet: new Map(), ordered: [], totals: emptyTotals() };
  }

  // 1. Sort events oldest → newest. This is what fixes founder numbering.
  const sorted = [...events].sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? a.logIndex - b.logIndex
      : a.blockNumber > b.blockNumber ? 1 : -1,
  );

  const byWallet = new Map<string, HolderRecord>();
  const founderOrder: string[] = []; // first-seen wallet ordering
  const ticketSizes: number[] = [];

  for (const ev of sorted) {
    const key = ev.buyer.toLowerCase();
    ticketSizes.push(ev.usdcAmount);
    const existing = byWallet.get(key);

    if (!existing) {
      founderOrder.push(key);
      const founderNumber = founderOrder.length;
      const rank = rankForUsdc(ev.usdcAmount);
      byWallet.set(key, {
        wallet: ev.buyer as `0x${string}`,
        founderNumber,
        memberNumber: founderNumber,
        firstPurchaseBlock: ev.blockNumber,
        firstPurchaseTx: ev.txHash as `0x${string}`,
        lastPurchaseBlock: ev.blockNumber,
        lastPurchaseTx: ev.txHash as `0x${string}`,
        purchaseCount: 1,
        cumulativeUsdc: ev.usdcAmount,
        cumulativeSyn: ev.synAmount,
        cumulativeRoutedToVault: ev.vaultAmount,
        cumulativeRoutedToLiquidity: ev.liquidityAmount,
        cumulativeRoutedToOperations: ev.operationsAmount,
        largestSinglePurchaseUsdc: ev.usdcAmount,
        lastPurchaseUsdc: ev.usdcAmount,
        lastPurchaseSyn: ev.synAmount,
        currentRank: rank.current,
        nextRank: rank.next,
        usdcToNextRank: rank.next ? Math.max(0, rank.next.usdc - ev.usdcAmount) : null,
        chapter: chapterForFounderNumber(founderNumber),
        eligibility: deriveEligibility(founderNumber),
      });
    } else {
      existing.purchaseCount += 1;
      existing.cumulativeUsdc += ev.usdcAmount;
      existing.cumulativeSyn += ev.synAmount;
      existing.cumulativeRoutedToVault += ev.vaultAmount;
      existing.cumulativeRoutedToLiquidity += ev.liquidityAmount;
      existing.cumulativeRoutedToOperations += ev.operationsAmount;
      if (ev.usdcAmount > existing.largestSinglePurchaseUsdc) {
        existing.largestSinglePurchaseUsdc = ev.usdcAmount;
      }
      existing.lastPurchaseBlock = ev.blockNumber;
      existing.lastPurchaseTx = ev.txHash as `0x${string}`;
      existing.lastPurchaseUsdc = ev.usdcAmount;
      existing.lastPurchaseSyn = ev.synAmount;
      const rank = rankForUsdc(existing.cumulativeUsdc);
      existing.currentRank = rank.current;
      existing.nextRank = rank.next;
      existing.usdcToNextRank = rank.next
        ? Math.max(0, rank.next.usdc - existing.cumulativeUsdc)
        : null;
    }
  }

  const ordered = founderOrder.map((k) => byWallet.get(k)!);

  // ─── Totals (DERIVED) ───
  const rankDistribution = Object.fromEntries(RANKS_V2.map((r) => [r.name, 0]));
  let cumulativeUsdc = 0;
  let cumulativeSyn = 0;
  let largestTicket = 0;
  for (const r of ordered) {
    cumulativeUsdc += r.cumulativeUsdc;
    cumulativeSyn += r.cumulativeSyn;
    if (r.currentRank) rankDistribution[r.currentRank.name] = (rankDistribution[r.currentRank.name] ?? 0) + 1;
  }
  for (const t of ticketSizes) if (t > largestTicket) largestTicket = t;

  const totals: HolderTotals = {
    members: ordered.length,
    purchaseCount: ticketSizes.length,
    cumulativeUsdc,
    cumulativeSyn,
    averageTicketUsdc: ticketSizes.length > 0 ? cumulativeUsdc / ticketSizes.length : 0,
    medianTicketUsdc: median(ticketSizes),
    largestTicketUsdc: largestTicket,
    rankDistribution,
    nextMemberNumber: ordered.length + 1,
  };

  return { byWallet, ordered, totals };
}

// ─── The hook ─────────────────────────────────────────────────────────

/**
 * Canonical member intelligence hook.
 *
 * Returns the same shape regardless of underlying data source (today: client
 * RPC scan; future: server cache / subgraph). Always safe to call: returns
 * empty totals + empty maps until the first purchase is indexed.
 */
export function useHolderIndex(): HolderIndex {
  const events = useLivePurchaseEvents({ limit: 5_000 });
  const chainTime = useChainTime();

  const built = useMemo(() => buildHolderIndex(events.data ?? []), [events.data]);

  const latest = useMemo(
    () =>
      [...built.ordered].sort((a, b) =>
        a.lastPurchaseBlock === b.lastPurchaseBlock
          ? 0
          : a.lastPurchaseBlock > b.lastPurchaseBlock
          ? -1
          : 1,
      ),
    [built.ordered],
  );

  // Most-recent block we've indexed is a reasonable "asOf" stamp.
  const asOfBlock = useMemo(() => {
    let max: bigint | undefined;
    for (const r of built.ordered) {
      if (max === undefined || r.lastPurchaseBlock > max) max = r.lastPurchaseBlock;
    }
    return max;
  }, [built.ordered]);

  const asOfUnix = useMemo(
    () => (asOfBlock !== undefined ? chainTime.blockToUnix(asOfBlock) : chainTime.tipUnix),
    [asOfBlock, chainTime],
  );

  const deltas = useMemo(() => {
    if (chainTime.tipUnix === undefined) return undefined;
    const raw = events.data ?? [];
    const tipUnix = chainTime.tipUnix;
    const compute = (windowSeconds: number): HolderWindowDelta => {
      const cutoff = tipUnix - windowSeconds;
      const inWindow = raw.filter((e) => {
        const u = chainTime.blockToUnix(e.blockNumber);
        return u !== undefined && u >= cutoff;
      });
      const firstSeenBeforeCutoff = new Set<string>();
      for (const e of raw) {
        const u = chainTime.blockToUnix(e.blockNumber);
        if (u !== undefined && u < cutoff) firstSeenBeforeCutoff.add(e.buyer.toLowerCase());
      }
      const newMemberWallets = new Set<string>();
      for (const e of inWindow) {
        const k = e.buyer.toLowerCase();
        if (!firstSeenBeforeCutoff.has(k)) newMemberWallets.add(k);
      }
      return {
        windowSeconds,
        available: true,
        newMembers: newMemberWallets.size,
        purchases: inWindow.length,
        usdcRaised: inWindow.reduce((s, e) => s + e.usdcAmount, 0),
        synSold: inWindow.reduce((s, e) => s + e.synAmount, 0),
        vaultRouted: inWindow.reduce((s, e) => s + e.vaultAmount, 0),
        liquidityRouted: inWindow.reduce((s, e) => s + e.liquidityAmount, 0),
        operationsRouted: inWindow.reduce((s, e) => s + e.operationsAmount, 0),
      };
    };
    return { last24h: compute(WINDOW_24H), last7d: compute(WINDOW_7D) };
  }, [events.data, chainTime]);

  return {
    isLoading: events.isLoading,
    isError: events.isError,
    hasData: built.ordered.length > 0,
    asOfBlock,
    asOfUnix,
    byWallet: built.byWallet,
    ordered: built.ordered,
    latest,
    totals: built.totals,
    deltas,
    getByWallet: (address?: string | null) =>
      address ? built.byWallet.get(address.toLowerCase()) : undefined,
    refetch: () => {
      events.refetch();
    },
  };
}
