// Protocol Intelligence — the canonical, unified chronological event stream.
// Merges Purchases · LP Swaps · LP Mint/Burn · Vault USDC Flows · Archive mints
// · SYN burns (Proof of Fire) into one newest-first feed. Every entry includes
// blockNumber for time ordering and txHash for verification.
//
// This is the SINGLE pipeline:
//   raw scan → normalized ProtocolEvent → enrichEvent() (category, labels,
//   metric effects, chronicle eligibility, surfaces) → Activity / Chronicle
//   candidate / dashboards.
//
// `ProtocolEventKind` / `ProtocolEventCategory` and every per-kind
// classification live in protocol-event-registry.ts (the pure leaf). This file
// re-exports the kind type so existing consumers keep importing it from here.
// `useProtocolEvents` returns CanonicalProtocolEvent[], which is assignable to
// ProtocolEvent[] — so all existing consumers and test fixtures are unaffected.

import { useMemo } from "react";
import { useLivePurchaseEvents } from "./activity-hooks";
import { useLpSwaps, useLpLiquidityEvents, useUsdcFlows } from "./onchain-events";
import { useArchiveMintEvents } from "./archive-mint-events";
import { useSynBurnEvents } from "./syn-burn-events";
import { CONTRACTS, rankForUsdc, txExplorerUrl, SYN_BURN_ADDRESS } from "./syndicate-config";
import { isValidTxHash } from "@/components/syndicate/TxProofDrawer";
import { labelForAddress } from "./known-addresses";
import { classifyFounderAction, type FounderActionCategory } from "./founder-actions";
import {
  CATEGORY_FOR_KIND,
  EVENT_METRIC_EFFECTS,
  RECOMMENDED_SURFACES_FOR_CATEGORY,
  chronicleEligibleForKind,
  type ProtocolEventKind,
  type ProtocolEventCategory,
} from "./protocol-event-registry";

// Re-export so consumers (and tests) keep importing these from "./protocol-events".
export type { ProtocolEventKind, ProtocolEventCategory };

export type ProtocolEvent = {
  id: string;
  kind: ProtocolEventKind;
  title: string;
  detail: string;
  amountUsd?: number;
  blockNumber: bigint;
  logIndex: number;
  txHash: string;
  actor?: string;
  badge: "live" | "info" | "warn";
};

/** Asset an event moves (when applicable). */
export type EventToken = "USDC" | "SYN" | "NFT";

/** Per-event verification/freshness status. */
export type EventStatus = "LIVE" | "PARTIAL" | "PENDING";

/**
 * The canonical, enriched event. Extends the base ProtocolEvent (never mutates
 * it) with the classification + verification metadata the whole pipeline reads.
 * Assignable to ProtocolEvent, so existing consumers see no change.
 */
export type CanonicalProtocolEvent = ProtocolEvent & {
  category: ProtocolEventCategory;
  amount?: number;
  token?: EventToken;
  from?: string;
  fromLabel?: string;
  to?: string;
  toLabel?: string;
  timestamp?: number;
  sourceContract?: string;
  /** Canonical explorer link for the tx (empty string when the hash is unverifiable). */
  verificationLink: string;
  status: EventStatus;
  isOnChainVerified: boolean;
  /** True when the label/classification was applied manually rather than read from a log. */
  isManualTag: boolean;
  metricEffects: readonly string[];
  chronicleEligible: boolean;
  recommendedSurfaces: readonly string[];
  /** Founder-action classification when the sender is the founder wallet; else undefined. */
  founderAction?: FounderActionCategory;
  /**
   * Structured seat ordinal for a `new-member` event (e.g. 100). Money-safe
   * count, supplied by the normalizer — never parsed from the title. Lets the
   * Signals Engine recognise member-count milestones structurally.
   */
  memberOrdinal?: number;
  /**
   * Proof of Fire index (1-based) for a burn event, present ONLY when the burn
   * scan is gapless. Money-safe count consumed by the Signals Engine.
   */
  proofOfFireIndex?: number;
};

/** Optional context a normalizer passes so enrichEvent can fill from/to/amount precisely. */
export type EnrichContext = {
  from?: string;
  to?: string;
  amount?: number;
  token?: EventToken;
  sourceContract?: string;
  isManualTag?: boolean;
  timestamp?: number;
  status?: EventStatus;
  /** Structured seat ordinal for a new-member event (money-safe count). */
  memberOrdinal?: number;
  /** Proof of Fire index (1-based) for a burn event (money-safe count). */
  proofOfFireIndex?: number;
};

/**
 * The ONE place a base event becomes canonical. Derives category, metric
 * effects, chronicle eligibility, and recommended surfaces from the registry;
 * resolves from/to labels via the known-address registry; and computes the
 * verification link + status from the tx hash (a normalizer may override
 * `status`, e.g. burns mark PARTIAL until the scan is gapless).
 */
export function enrichEvent(base: ProtocolEvent, ctx: EnrichContext = {}): CanonicalProtocolEvent {
  const category = CATEGORY_FOR_KIND[base.kind];
  const verified = isValidTxHash(base.txHash);
  const from = ctx.from ?? base.actor;
  return {
    ...base,
    category,
    amount: ctx.amount,
    token: ctx.token,
    from,
    fromLabel: from ? labelForAddress(from).label : undefined,
    to: ctx.to,
    toLabel: ctx.to ? labelForAddress(ctx.to).label : undefined,
    timestamp: ctx.timestamp,
    sourceContract: ctx.sourceContract,
    verificationLink: verified ? txExplorerUrl(base.txHash) : "",
    status: ctx.status ?? (verified ? "LIVE" : "PENDING"),
    isOnChainVerified: verified,
    isManualTag: ctx.isManualTag ?? false,
    metricEffects: EVENT_METRIC_EFFECTS[base.kind],
    chronicleEligible: chronicleEligibleForKind(base.kind),
    recommendedSurfaces: RECOMMENDED_SURFACES_FOR_CATEGORY[category],
    founderAction: classifyFounderAction({ from, to: ctx.to, kind: base.kind }),
    memberOrdinal: ctx.memberOrdinal,
    proofOfFireIndex: ctx.proofOfFireIndex,
  };
}

const fmtUsd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const fmtSyn = (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} SYN`;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function useProtocolEvents(opts?: { limit?: number }) {
  const limit = opts?.limit ?? 40;
  const purchases = useLivePurchaseEvents({ limit: 100 });
  const swaps = useLpSwaps({ limit: 100 });
  const liquidity = useLpLiquidityEvents({ limit: 50 });
  const vaultFlows = useUsdcFlows(CONTRACTS.VAULT_WALLET, { limit: 50 });
  const mints = useArchiveMintEvents({ limit: 100 });
  const burns = useSynBurnEvents({ limit: 50 });

  const events = useMemo<CanonicalProtocolEvent[]>(() => {
    const out: CanonicalProtocolEvent[] = [];
    const seenBuyer = new Set<string>();

    // Purchases — walk oldest→newest first to compute "new member" flag
    // and rank-promotion events (derived from cumulative USDC per buyer),
    // then re-emit newest-first below.
    const sortedPurchases = [...(purchases.data ?? [])].sort((a, b) =>
      a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber > b.blockNumber ? 1 : -1,
    );
    const memberIndex = new Map<string, number>();
    const cumulativeByBuyer = new Map<string, number>();
    const lastRankByBuyer = new Map<string, string | null>();
    const rankPromotions = new Map<string, { rank: string; cumulative: number }>();
    let memberCounter = 0;
    for (const p of sortedPurchases) {
      const k = p.buyer.toLowerCase();
      if (!seenBuyer.has(k)) {
        seenBuyer.add(k);
        memberCounter += 1;
        memberIndex.set(`${p.txHash}-${p.logIndex}`, memberCounter);
      }
      const prevCum = cumulativeByBuyer.get(k) ?? 0;
      const nextCum = prevCum + p.usdcAmount;
      cumulativeByBuyer.set(k, nextCum);
      const newRank = rankForUsdc(nextCum).current?.name ?? null;
      const prevRank = lastRankByBuyer.has(k) ? lastRankByBuyer.get(k) ?? null : null;
      if (newRank && newRank !== prevRank) {
        rankPromotions.set(`${p.txHash}-${p.logIndex}`, { rank: newRank, cumulative: nextCum });
      }
      lastRankByBuyer.set(k, newRank);
    }

    const SALE = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS;
    const PAIR = CONTRACTS.LP_PAIR_ADDRESS;
    const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS;
    const ARCHIVE = CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS;
    const SYN = CONTRACTS.SYN_CONTRACT_ADDRESS;

    for (const p of purchases.data ?? []) {
      const rank = rankForUsdc(p.usdcAmount).current?.name ?? "Member";
      out.push(
        enrichEvent(
          {
            id: `p-${p.txHash}-${p.logIndex}`,
            kind: "purchase",
            title: `${short(p.buyer)} joined as ${rank}`,
            detail: `${fmtUsd(p.usdcAmount)} · received ${fmtSyn(p.synAmount)}`,
            amountUsd: p.usdcAmount,
            blockNumber: p.blockNumber,
            logIndex: p.logIndex,
            txHash: p.txHash,
            actor: p.buyer,
            badge: "live",
          },
          { from: p.buyer, to: SALE, amount: p.usdcAmount, token: "USDC", sourceContract: SALE },
        ),
      );
      const memberNo = memberIndex.get(`${p.txHash}-${p.logIndex}`);
      if (memberNo !== undefined) {
        out.push(
          enrichEvent(
            {
              id: `m-${p.txHash}-${p.logIndex}`,
              kind: "new-member",
              title: `Member #${memberNo} archived`,
              detail: `${short(p.buyer)} entered the public registry`,
              blockNumber: p.blockNumber,
              logIndex: p.logIndex + 0.5,
              txHash: p.txHash,
              actor: p.buyer,
              badge: "info",
            },
            { from: p.buyer, to: SALE, sourceContract: SALE, memberOrdinal: memberNo },
          ),
        );
      }
      const promo = rankPromotions.get(`${p.txHash}-${p.logIndex}`);
      // Only emit a rank-reached event when it's an UPGRADE (not the very
      // first rank assignment at member creation — that's already covered
      // by the purchase + new-member entries).
      if (promo && memberNo === undefined) {
        out.push(
          enrichEvent(
            {
              id: `r-${p.txHash}-${p.logIndex}`,
              kind: "rank-reached",
              title: `${short(p.buyer)} reached ${promo.rank}`,
              detail: `Cumulative ${fmtUsd(promo.cumulative)} — derived from on-chain purchase history`,
              blockNumber: p.blockNumber,
              logIndex: p.logIndex + 0.6,
              txHash: p.txHash,
              actor: p.buyer,
              badge: "info",
            },
            { from: p.buyer, sourceContract: SALE },
          ),
        );
      }
    }

    for (const s of swaps.data ?? []) {
      out.push(
        enrichEvent(
          {
            id: `s-${s.txHash}-${s.logIndex}`,
            kind: s.kind === "buy" ? "swap-buy" : "swap-sell",
            title: s.kind === "buy" ? "LP buy" : "LP sell",
            detail: `${fmtUsd(s.usdcAmount)} ↔ ${fmtSyn(s.synAmount)} · ${short(s.trader)}`,
            amountUsd: s.usdcAmount,
            blockNumber: s.blockNumber,
            logIndex: s.logIndex,
            txHash: s.txHash,
            actor: s.trader,
            badge: s.kind === "buy" ? "live" : "info",
          },
          { from: s.trader, to: PAIR, amount: s.usdcAmount, token: "USDC", sourceContract: PAIR },
        ),
      );
    }

    for (const e of liquidity.data ?? []) {
      out.push(
        enrichEvent(
          {
            id: `l-${e.txHash}-${e.logIndex}`,
            kind: e.kind === "add" ? "lp-add" : "lp-remove",
            title: e.kind === "add" ? "Liquidity added" : "Liquidity removed",
            detail: `+${fmtSyn(e.synAmount)} + ${fmtUsd(e.usdcAmount)} · ${short(e.actor)}`,
            amountUsd: e.usdcAmount,
            blockNumber: e.blockNumber,
            logIndex: e.logIndex,
            txHash: e.txHash,
            actor: e.actor,
            badge: "info",
          },
          { from: e.actor, to: PAIR, amount: e.usdcAmount, token: "USDC", sourceContract: PAIR },
        ),
      );
    }

    for (const f of vaultFlows.data ?? []) {
      out.push(
        enrichEvent(
          {
            id: `v-${f.txHash}-${f.logIndex}`,
            kind: f.direction === "in" ? "vault-in" : "vault-out",
            title: f.direction === "in" ? "Vault received USDC" : "Vault sent USDC",
            detail: `${fmtUsd(f.amount)} · ${f.direction === "in" ? "from" : "to"} ${short(f.counterparty)}`,
            amountUsd: f.amount,
            blockNumber: f.blockNumber,
            logIndex: f.logIndex,
            txHash: f.txHash,
            actor: f.counterparty,
            badge: f.direction === "in" ? "live" : "warn",
          },
          {
            from: f.direction === "in" ? f.counterparty : CONTRACTS.VAULT_WALLET,
            to: f.direction === "in" ? CONTRACTS.VAULT_WALLET : f.counterparty,
            amount: f.amount,
            token: "USDC",
            sourceContract: USDC,
          },
        ),
      );
    }

    for (const m of mints.data ?? []) {
      const kind: ProtocolEventKind =
        m.tokenId === 1 ? "nft-mint-first-signal"
        : m.tokenId === 3 ? "nft-mint-patron-seal"
        : "nft-mint-other";
      const artifact =
        m.tokenId === 1 ? "First Signal"
        : m.tokenId === 3 ? "Patron Seal"
        : `Artifact #${m.tokenId}`;
      const qty = m.value > 1 ? ` × ${m.value}` : "";
      out.push(
        enrichEvent(
          {
            id: `n-${m.txHash}-${m.logIndex}`,
            kind,
            title: `${artifact} minted${qty}`,
            detail: `${short(m.to)} archived ${artifact} · token ID ${m.tokenId}`,
            blockNumber: m.blockNumber,
            logIndex: m.logIndex,
            txHash: m.txHash,
            actor: m.to,
            badge: "live",
          },
          { from: ARCHIVE, to: m.to, amount: m.value, token: "NFT", sourceContract: ARCHIVE },
        ),
      );
    }

    // SYN burns (Proof of Fire). amountUsd is intentionally LEFT UNDEFINED —
    // burns move SYN, not USDC; including a USD amount would inflate
    // summarizeActivity's usdcSettledTotal. A burn is numbered "Proof of Fire
    // #N" only when the scan is complete (gapless); otherwise it shows without a
    // number and carries status PARTIAL.
    const burnScan = burns.data;
    for (const b of burnScan?.events ?? []) {
      const pof = b.proofOfFireNumber;
      const label = pof !== undefined ? `Proof of Fire #${String(pof).padStart(3, "0")}` : "SYN burn";
      const status: EventStatus = !isValidTxHash(b.txHash)
        ? "PENDING"
        : pof !== undefined
        ? "LIVE"
        : "PARTIAL";
      out.push(
        enrichEvent(
          {
            id: `b-${b.txHash}-${b.logIndex}`,
            kind: b.isFounder ? "burn-founder" : "burn-community",
            title: b.isFounder ? `${label} · Founder Burn` : label,
            detail: `${fmtSyn(b.amountSyn)} permanently sent to the burn address`,
            blockNumber: b.blockNumber,
            logIndex: b.logIndex,
            txHash: b.txHash,
            actor: b.sender,
            badge: "warn",
          },
          {
            from: b.sender,
            to: SYN_BURN_ADDRESS,
            amount: b.amountSyn,
            token: "SYN",
            sourceContract: SYN,
            status,
            proofOfFireIndex: pof,
          },
        ),
      );
    }

    out.sort((a, b) =>
      a.blockNumber === b.blockNumber
        ? b.logIndex - a.logIndex
        : a.blockNumber > b.blockNumber ? -1 : 1,
    );
    return limit > 0 ? out.slice(0, limit) : out;
  }, [purchases.data, swaps.data, liquidity.data, vaultFlows.data, mints.data, burns.data, limit]);

  return {
    isLoading: purchases.isLoading || swaps.isLoading || liquidity.isLoading || vaultFlows.isLoading,
    isError: purchases.isError && swaps.isError && liquidity.isError && vaultFlows.isError,
    refetch: () => {
      purchases.refetch();
      swaps.refetch();
      liquidity.refetch();
      vaultFlows.refetch();
      mints.refetch();
      burns.refetch();
    },
    events,
  };
}
