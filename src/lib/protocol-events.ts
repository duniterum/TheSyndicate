// Protocol Intelligence — unified chronological event stream.
// Merges Purchases · LP Swaps · LP Mint/Burn · Vault USDC Flows into one
// newest-first feed. Every entry includes blockNumber for time ordering
// and txHash for verification. Designed for the Activity page hero and
// homepage "Latest Protocol Events" preview.

import { useMemo } from "react";
import { useLivePurchaseEvents } from "./activity-hooks";
import { useLpSwaps, useLpLiquidityEvents, useUsdcFlows } from "./onchain-events";
import { useArchiveMintEvents } from "./archive-mint-events";
import { CONTRACTS, rankForUsdc } from "./syndicate-config";

export type ProtocolEventKind =
  | "purchase"
  | "swap-buy"
  | "swap-sell"
  | "lp-add"
  | "lp-remove"
  | "vault-in"
  | "vault-out"
  | "new-member"
  | "rank-reached"
  | "nft-mint-first-signal"
  | "nft-mint-patron-seal"
  | "nft-mint-other";

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

  const events = useMemo<ProtocolEvent[]>(() => {
    const out: ProtocolEvent[] = [];
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

    for (const p of purchases.data ?? []) {
      const rank = rankForUsdc(p.usdcAmount).current?.name ?? "Member";
      out.push({
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
      });
      const memberNo = memberIndex.get(`${p.txHash}-${p.logIndex}`);
      if (memberNo !== undefined) {
        out.push({
          id: `m-${p.txHash}-${p.logIndex}`,
          kind: "new-member",
          title: `Member #${memberNo} archived`,
          detail: `${short(p.buyer)} entered the public registry`,
          blockNumber: p.blockNumber,
          logIndex: p.logIndex + 0.5,
          txHash: p.txHash,
          actor: p.buyer,
          badge: "info",
        });
      }
      const promo = rankPromotions.get(`${p.txHash}-${p.logIndex}`);
      // Only emit a rank-reached event when it's an UPGRADE (not the very
      // first rank assignment at member creation — that's already covered
      // by the purchase + new-member entries).
      if (promo && memberNo === undefined) {
        out.push({
          id: `r-${p.txHash}-${p.logIndex}`,
          kind: "rank-reached",
          title: `${short(p.buyer)} reached ${promo.rank}`,
          detail: `Cumulative ${fmtUsd(promo.cumulative)} — derived from on-chain purchase history`,
          blockNumber: p.blockNumber,
          logIndex: p.logIndex + 0.6,
          txHash: p.txHash,
          actor: p.buyer,
          badge: "info",
        });
      }
    }

    for (const s of swaps.data ?? []) {
      out.push({
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
      });
    }

    for (const e of liquidity.data ?? []) {
      out.push({
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
      });
    }

    for (const f of vaultFlows.data ?? []) {
      out.push({
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
      });
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
      out.push({
        id: `n-${m.txHash}-${m.logIndex}`,
        kind,
        title: `${artifact} minted${qty}`,
        detail: `${short(m.to)} archived ${artifact} · token ID ${m.tokenId}`,
        blockNumber: m.blockNumber,
        logIndex: m.logIndex,
        txHash: m.txHash,
        actor: m.to,
        badge: "live",
      });
    }



    out.sort((a, b) =>
      a.blockNumber === b.blockNumber
        ? b.logIndex - a.logIndex
        : a.blockNumber > b.blockNumber ? -1 : 1,
    );
    return limit > 0 ? out.slice(0, limit) : out;
  }, [purchases.data, swaps.data, liquidity.data, vaultFlows.data, mints.data, limit]);

  return {
    isLoading: purchases.isLoading || swaps.isLoading || liquidity.isLoading || vaultFlows.isLoading,
    isError: purchases.isError && swaps.isError && liquidity.isError && vaultFlows.isError,
    refetch: () => {
      purchases.refetch();
      swaps.refetch();
      liquidity.refetch();
      vaultFlows.refetch();
    },
    events,
  };
}
