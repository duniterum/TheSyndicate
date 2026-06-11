// Protocol Intelligence — unified live pulse for the homepage strip.
// One hook that aggregates every "is the protocol alive right now?" signal
// from on-chain sources. No invented numbers; every field is either LIVE,
// derived from a LIVE field, or undefined → caller renders "—".

import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import {
  CONTRACTS,
  USDC_DECIMALS,
  SYN_DECIMALS,
} from "./syndicate-config";
import { ERC20_ABI } from "./sale-abi";
import { useSaleStats, useLpStats } from "./sale-hooks";
import { useChainTip } from "./chain-time";
import { useHolderIndex, type HolderWindowDelta } from "./holder-index";

const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const AVA_BLOCK_SECONDS = 2; // Avalanche C-Chain ≈ 2s/block

export type ProtocolPulse = {
  isLoading: boolean;
  // routed + distribution
  usdcRaised: number | undefined;
  synSold: number | undefined;
  buyers: number | undefined;
  purchaseCount: number | undefined;
  saleInventory: number | undefined;
  // bucket balances (USDC held by routing wallets, live)
  vaultUsdc: number | undefined;
  liquidityUsdc: number | undefined;
  operationsUsdc: number | undefined;
  // LP
  lpTvlUsd: number | undefined;
  synPriceUsd: number | undefined;
  // pulse
  lastBuyAgoSeconds: number | undefined;
  lastBuyBuyer: string | undefined;
  lastBuyUsdc: number | undefined;
  lastBuySyn: number | undefined;
  lastBuyTxHash: string | undefined;
  nextMemberNumber: number | undefined;
  // recency layer (Wave 3A) — undefined until chain-time tip resolves
  asOfBlock: bigint | undefined;
  deltas: { last24h: HolderWindowDelta; last7d: HolderWindowDelta } | undefined;
};

/**
 * Single read used everywhere the homepage / nav strip wants "what is the
 * protocol doing RIGHT NOW". Multicalls USDC.balanceOf for each routing
 * wallet, joins with sale + LP reads, derives last-buy relative time.
 */
export function useProtocolPulse(): ProtocolPulse {
  const sale = useSaleStats();
  const lp = useLpStats();
  // Reuse the holder-index event scan — derive "most recent purchase" from
  // idx.latest[0] instead of triggering a second {limit:1} chain scan with a
  // different query key (which was duplicating log-range RPC work).
  const idx = useHolderIndex();

  const buckets = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [CONTRACTS.VAULT_WALLET as `0x${string}`] },
      { address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [CONTRACTS.LIQUIDITY_WALLET as `0x${string}`] },
      { address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [CONTRACTS.OPERATIONS_WALLET as `0x${string}`] },
    ],
    query: { refetchInterval: 60_000, staleTime: 30_000 },
  });

  // Current head block — the SHARED chain-tip query (also powering chain-time),
  // not a second independent head fetch. Used for "X ago" derivation.
  const tip = useChainTip();

  return useMemo<ProtocolPulse>(() => {
    const usdcRaised = sale.totalUsdcRaised !== undefined
      ? Number(formatUnits(sale.totalUsdcRaised, USDC_DECIMALS)) : undefined;
    const synSold = sale.totalSynSold !== undefined
      ? Number(formatUnits(sale.totalSynSold, SYN_DECIMALS)) : undefined;
    const buyers = sale.totalBuyers !== undefined ? Number(sale.totalBuyers) : undefined;
    const purchaseCount = sale.purchaseCount !== undefined ? Number(sale.purchaseCount) : undefined;
    const saleInventory = sale.saleSynBalance !== undefined
      ? Number(formatUnits(sale.saleSynBalance, SYN_DECIMALS)) : undefined;

    const ok = <T,>(r: { status: string; result?: T } | undefined) =>
      r && r.status === "success" ? r.result : undefined;
    const b0 = ok<bigint>(buckets.data?.[0]);
    const b1 = ok<bigint>(buckets.data?.[1]);
    const b2 = ok<bigint>(buckets.data?.[2]);

    const vaultUsdc = b0 !== undefined ? Number(formatUnits(b0, USDC_DECIMALS)) : undefined;
    const liquidityUsdc = b1 !== undefined ? Number(formatUnits(b1, USDC_DECIMALS)) : undefined;
    const operationsUsdc = b2 !== undefined ? Number(formatUnits(b2, USDC_DECIMALS)) : undefined;

    const lastRec = idx.latest[0];
    const tipBlock = tip.data?.number;
    let lastBuyAgoSeconds: number | undefined;
    if (lastRec && tipBlock !== undefined) {
      const delta = tipBlock > lastRec.lastPurchaseBlock ? tipBlock - lastRec.lastPurchaseBlock : 0n;
      lastBuyAgoSeconds = Number(delta) * AVA_BLOCK_SECONDS;
    }

    // Prefer indexed buyer count from idx.totals (single source of truth).
    // Falls back to on-chain sale.totalBuyers if the event index is empty.
    const memberCount = idx.totals.members > 0 ? idx.totals.members : buyers;
    const nextMemberNumber = memberCount !== undefined ? memberCount + 1 : undefined;

    return {
      isLoading: sale.isLoading || buckets.isLoading || idx.isLoading,
      usdcRaised, synSold, buyers, purchaseCount, saleInventory,
      vaultUsdc, liquidityUsdc, operationsUsdc,
      lpTvlUsd: lp.tvlUsd,
      synPriceUsd: lp.synPriceUsd,
      lastBuyAgoSeconds,
      lastBuyBuyer: lastRec?.wallet,
      lastBuyUsdc: lastRec?.lastPurchaseUsdc,
      lastBuySyn: lastRec?.lastPurchaseSyn,
      lastBuyTxHash: lastRec?.lastPurchaseTx,
      nextMemberNumber,
      asOfBlock: tipBlock,
      deltas: idx.deltas,
    };
  }, [sale, buckets.data, buckets.isLoading, lp.tvlUsd, lp.synPriceUsd, tip.data, idx.latest, idx.totals, idx.deltas, idx.isLoading]);
}

export function formatAgo(seconds: number | undefined): string {
  if (seconds === undefined) return "—";
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86_400)}d ago`;
}
