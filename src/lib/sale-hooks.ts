import { useEffect, useMemo } from "react";
import { useAccount, useChainId, useReadContracts, useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { CONTRACTS, USDC_DECIMALS, SYN_DECIMALS, LP_POOL } from "./syndicate-config";
import { SALE_ABI, ERC20_ABI, PAIR_ABI } from "./sale-abi";
import {
  loadWalletReadsSnapshot,
  readContractsDataToSlots,
  saveWalletReadsSnapshot,
  slotsToReadContractsData,
  walletReadsCacheKey,
} from "./wallet-reads-cache";

const SALE = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS as `0x${string}`;
const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const SYN = CONTRACTS.SYN_CONTRACT_ADDRESS as `0x${string}`;
const PAIR = LP_POOL.pairAddress as `0x${string}`;

/** Aggregate read of public sale stats. Refetches every 60s + on demand via refetch(). */
export function useSaleStats() {
  const q = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: SALE, abi: SALE_ABI, functionName: "availableSyn" },
      { address: SALE, abi: SALE_ABI, functionName: "totalUsdcRaised" },
      { address: SALE, abi: SALE_ABI, functionName: "totalSynSold" },
      { address: SALE, abi: SALE_ABI, functionName: "totalBuyers" },
      { address: SALE, abi: SALE_ABI, functionName: "purchaseCount" },
      { address: SALE, abi: SALE_ABI, functionName: "paused" },
      { address: SYN, abi: ERC20_ABI, functionName: "balanceOf", args: [SALE] },
    ],
    query: { refetchInterval: 60_000, staleTime: 30_000 },
  });

  const [availableSyn, totalUsdcRaised, totalSynSold, totalBuyers, purchaseCount, paused, saleSynBalance] =
    q.data ?? [];

  const ok = <T,>(r: { status: string; result?: T } | undefined) =>
    r && r.status === "success" ? r.result : undefined;

  return {
    isLoading: q.isLoading,
    isError: q.isError,
    refetch: q.refetch,
    availableSyn: ok<bigint>(availableSyn),
    totalUsdcRaised: ok<bigint>(totalUsdcRaised),
    totalSynSold: ok<bigint>(totalSynSold),
    totalBuyers: ok<bigint>(totalBuyers),
    purchaseCount: ok<bigint>(purchaseCount),
    paused: ok<boolean>(paused),
    saleSynBalance: ok<bigint>(saleSynBalance),
  };
}

/** User-scoped reads: USDC balance, SYN balance, USDC allowance. */
export function useUserBalances() {
  const { address } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const q = useReadContracts({
    allowFailure: true,
    contracts: address
      ? [
          { address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [address] },
          { address: SYN, abi: ERC20_ABI, functionName: "balanceOf", args: [address] },
          { address: USDC, abi: ERC20_ABI, functionName: "allowance", args: [address, SALE] },
        ]
      : [],
    query: { enabled: Boolean(address), refetchInterval: 60_000 },
  });

  // P2: persist the connected wallet's USDC + SYN balances (public on-chain
  // facts) so a revisit renders them instantly, then refreshes in background.
  // Seeds wagmi's own cache tagged with the snapshot's true age (→ STALE →
  // background refetch; never shown as freshly LIVE). The USDC ALLOWANCE slot
  // is intentionally NOT persisted — it gates approve/mint, so it stays
  // live-only (restored as undefined = the safe "needs approval" default).
  const cacheKey = useMemo(
    () =>
      address
        ? walletReadsCacheKey({
            scope: "erc20-balances",
            chainId,
            wallet: address,
            slots: `${USDC.toLowerCase()},${SYN.toLowerCase()}#balanceOf`,
          })
        : null,
    [address, chainId],
  );

  useEffect(() => {
    if (!cacheKey) return;
    const snap = loadWalletReadsSnapshot(cacheKey);
    if (!snap) return;
    if (queryClient.getQueryState(q.queryKey)?.data) return; // don't clobber live/seeded
    queryClient.setQueryData(q.queryKey, slotsToReadContractsData(snap.values), {
      updatedAt: snap.updatedAt,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, queryClient]);

  useEffect(() => {
    if (!cacheKey || !address || !q.data) return;
    const slots = readContractsDataToSlots(q.data); // [usdc, syn, allowance]
    if (slots[0] === undefined && slots[1] === undefined) return;
    // Persist balances only — drop the allowance slot (index 2).
    saveWalletReadsSnapshot(cacheKey, {
      updatedAt: q.dataUpdatedAt,
      wallet: address,
      values: [slots[0], slots[1], undefined],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, q.dataUpdatedAt]);

  const [usdcBal, synBal, allowance] = q.data ?? [];
  const ok = <T,>(r: { status: string; result?: T } | undefined) =>
    r && r.status === "success" ? r.result : undefined;
  return {
    isLoading: q.isLoading,
    refetch: q.refetch,
    usdcBalance: ok<bigint>(usdcBal),
    synBalance: ok<bigint>(synBal),
    usdcAllowance: ok<bigint>(allowance),
  };
}

/** Connected wallet purchase totals read from the sale contract. */
export function useBuyerPurchaseTotals() {
  const { address } = useAccount();
  const q = useReadContracts({
    allowFailure: true,
    contracts: address
      ? [
          { address: SALE, abi: SALE_ABI, functionName: "buyerUsdcTotal", args: [address] },
          { address: SALE, abi: SALE_ABI, functionName: "buyerSynTotal", args: [address] },
        ]
      : [],
    query: { enabled: Boolean(address), refetchInterval: 60_000, staleTime: 30_000 },
  });
  const [usdcTotal, synTotal] = q.data ?? [];
  const ok = <T,>(r: { status: string; result?: T } | undefined) =>
    r && r.status === "success" ? r.result : undefined;
  return {
    address,
    isLoading: q.isLoading,
    refetch: q.refetch,
    buyerUsdcTotal: ok<bigint>(usdcTotal),
    buyerSynTotal: ok<bigint>(synTotal),
  };
}

/** On-chain quote for a given USDC amount (raw, USDC-decimals). */
export function useQuoteSyn(usdcAmountRaw: bigint | undefined) {
  return useReadContract({
    address: SALE,
    abi: SALE_ABI,
    functionName: "quoteSyn",
    args: usdcAmountRaw && usdcAmountRaw > 0n ? [usdcAmountRaw] : undefined,
    query: { enabled: Boolean(usdcAmountRaw && usdcAmountRaw > 0n) },
  });
}

// ─── Formatting helpers ───
export const fmtUsdc = (raw?: bigint, opts?: { decimals?: number }) => {
  if (raw === undefined) return "—";
  const n = Number(formatUnits(raw, USDC_DECIMALS));
  const d = opts?.decimals ?? (n < 10 ? 2 : 0);
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
};

export const fmtSyn = (raw?: bigint) => {
  if (raw === undefined) return "—";
  const n = Number(formatUnits(raw, SYN_DECIMALS));
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

export const fmtAddress = (a?: string) =>
  !a ? "—" : `${a.slice(0, 6)}…${a.slice(-4)}`;

export function useSaleAddresses() {
  return useMemo(
    () => ({ sale: SALE, usdc: USDC, syn: SYN, pair: PAIR }),
    [],
  );
}

/**
 * Live reads from the Trader Joe v1 SYN/USDC pair contract.
 * Returns reserves keyed by token symbol, derived TVL & implied SYN price.
 */
export function useLpStats() {
  const q = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: PAIR, abi: PAIR_ABI, functionName: "getReserves" },
      { address: PAIR, abi: PAIR_ABI, functionName: "token0" },
      { address: PAIR, abi: PAIR_ABI, functionName: "token1" },
      { address: PAIR, abi: PAIR_ABI, functionName: "totalSupply" },
    ],
    query: { refetchInterval: 60_000, staleTime: 30_000 },
  });

  const ok = <T,>(r: { status: string; result?: T } | undefined) =>
    r && r.status === "success" ? r.result : undefined;

  const [reservesR, t0R, t1R, supplyR] = q.data ?? [];
  const reserves = ok<readonly [bigint, bigint, number]>(reservesR);
  const token0 = ok<string>(t0R);
  const token1 = ok<string>(t1R);
  const lpSupplyRaw = ok<bigint>(supplyR);

  let synReserveRaw: bigint | undefined;
  let usdcReserveRaw: bigint | undefined;
  if (reserves && token0 && token1) {
    const t0 = token0.toLowerCase();
    const synLc = SYN.toLowerCase();
    if (t0 === synLc) {
      synReserveRaw = reserves[0];
      usdcReserveRaw = reserves[1];
    } else {
      usdcReserveRaw = reserves[0];
      synReserveRaw = reserves[1];
    }
  }

  const synReserve = synReserveRaw !== undefined ? Number(formatUnits(synReserveRaw, SYN_DECIMALS)) : undefined;
  const usdcReserve = usdcReserveRaw !== undefined ? Number(formatUnits(usdcReserveRaw, USDC_DECIMALS)) : undefined;
  const tvlUsd = synReserve !== undefined && usdcReserve !== undefined ? usdcReserve * 2 : undefined;
  const synPriceUsd = synReserve && usdcReserve && synReserve > 0 ? usdcReserve / synReserve : undefined;
  const lpSupply = lpSupplyRaw !== undefined ? Number(formatUnits(lpSupplyRaw, 18)) : undefined;

  return {
    isLoading: q.isLoading,
    isError: q.isError,
    refetch: q.refetch,
    synReserve,
    usdcReserve,
    tvlUsd,
    synPriceUsd,
    lpSupply,
    token0,
    token1,
    lastUpdated: reserves ? Number(reserves[2]) : undefined,
  };
}

/**
 * Reads SYN balanceOf for every allocation wallet in a single multicall.
 * Returns a map keyed by address (lowercased) → balance in whole SYN.
 */
export function useAllocationBalances(addresses: string[]) {
  const list = addresses.filter((a) => /^0x[a-fA-F0-9]{40}$/.test(a));
  const q = useReadContracts({
    allowFailure: true,
    contracts: list.map((addr) => ({
      address: SYN,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [addr as `0x${string}`],
    })),
    query: { refetchInterval: 60_000, staleTime: 30_000, enabled: list.length > 0 },
  });
  const balances: Record<string, number | undefined> = {};
  list.forEach((addr, i) => {
    const r = q.data?.[i];
    const raw = r && r.status === "success" ? (r.result as unknown as bigint) : undefined;
    balances[addr.toLowerCase()] =
      raw === undefined ? undefined : Number(formatUnits(raw, SYN_DECIMALS));
  });
  return { isLoading: q.isLoading, balances, refetch: q.refetch };
}
