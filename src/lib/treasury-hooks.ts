// Live treasury reads — Avalanche C-Chain.
// Reads native AVAX + ERC20 balances at the Vault wallet, plus SYN totalSupply
// and the balances of every protocol allocation wallet.
// All values come straight from the chain; USD is only computed where a
// price is verifiable (USDC = $1, SYN = LP-implied). Other assets render
// PENDING for USD until a price oracle is wired.

import { useMemo } from "react";
import { useBalance, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import {
  CONTRACTS,
  USDC_DECIMALS,
  SYN_DECIMALS,
  ALLOCATION_WALLETS,
} from "./syndicate-config";
import { ERC20_ABI } from "./sale-abi";
import { useLpStats } from "./sale-hooks";

// Avalanche C-Chain canonical bridged assets.
export const TREASURY_TOKENS = [
  { symbol: "USDC",   address: CONTRACTS.USDC_CONTRACT_ADDRESS,            decimals: USDC_DECIMALS, stable: true  as const },
  { symbol: "BTC.b",  address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50", decimals: 8,             stable: false as const },
  { symbol: "WETH.e", address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", decimals: 18,            stable: false as const },
  { symbol: "SYN",    address: CONTRACTS.SYN_CONTRACT_ADDRESS,             decimals: SYN_DECIMALS,  stable: false as const },
] as const;

export type TreasuryAsset = {
  symbol: string;
  address: string | null;        // null = native AVAX
  amount: number | undefined;    // human units
  usdValue: number | undefined;  // undefined = PENDING (no oracle)
  decimals: number;
  isLive: boolean;
};

/**
 * Read AVAX + ERC20 balances at any wallet.
 * USD is filled where verifiable: USDC = $1, SYN = LP-implied. Others PENDING.
 */
export function useWalletAssets(wallet: string) {
  const addr = wallet as `0x${string}`;
  const native = useBalance({ address: addr, query: { refetchInterval: 60_000 } });
  const erc20s = useReadContracts({
    allowFailure: true,
    contracts: TREASURY_TOKENS.map((t) => ({
      address: t.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf" as const,
      args: [addr],
    })),
    query: { refetchInterval: 60_000, staleTime: 30_000 },
  });
  const lp = useLpStats();

  const assets: TreasuryAsset[] = useMemo(() => {
    const avaxAmt = native.data ? Number(formatUnits(native.data.value, 18)) : undefined;
    const out: TreasuryAsset[] = [
      { symbol: "AVAX", address: null, amount: avaxAmt, usdValue: undefined, decimals: 18, isLive: !native.isLoading && native.data !== undefined },
    ];
    TREASURY_TOKENS.forEach((t, i) => {
      const r = erc20s.data?.[i];
      const raw = r && r.status === "success" ? (r.result as unknown as bigint) : undefined;
      const amount = raw !== undefined ? Number(formatUnits(raw, t.decimals)) : undefined;
      let usdValue: number | undefined;
      if (amount !== undefined) {
        if (t.stable) usdValue = amount;
        else if (t.symbol === "SYN" && lp.synPriceUsd !== undefined) usdValue = amount * lp.synPriceUsd;
      }
      out.push({ symbol: t.symbol, address: t.address, amount, usdValue, decimals: t.decimals, isLive: raw !== undefined });
    });
    return out;
  }, [native.data, native.isLoading, erc20s.data, lp.synPriceUsd]);

  const knownUsd = assets.reduce((s, a) => s + (a.usdValue ?? 0), 0);
  const anyPendingUsd = assets.some((a) => a.amount !== undefined && a.amount > 0 && a.usdValue === undefined);

  return {
    isLoading: native.isLoading || erc20s.isLoading,
    refetch: () => {
      native.refetch();
      erc20s.refetch();
    },
    assets,
    knownUsd,
    anyPendingUsd,
  };
}

/** SYN total supply read (live). */
export function useSynSupply() {
  const q = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: CONTRACTS.SYN_CONTRACT_ADDRESS as `0x${string}`, abi: [...ERC20_ABI, { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] }] as const, functionName: "totalSupply" },
    ],
    query: { refetchInterval: 120_000, staleTime: 60_000 },
  });
  const r = q.data?.[0];
  const raw = r && r.status === "success" ? (r.result as unknown as bigint) : undefined;
  return {
    isLoading: q.isLoading,
    totalSupply: raw !== undefined ? Number(formatUnits(raw, SYN_DECIMALS)) : undefined,
  };
}

/**
 * Circulating supply estimate:
 *   totalSupply - (Vault + Founder + Liquidity + Partnerships + Contributors + Future Ecosystem + Membership-undistributed)
 * "Undistributed" = SYN still sitting in the Membership Distribution wallet,
 * which has not yet entered circulation via Sale or grants.
 */
export function useCirculatingSupply() {
  const supply = useSynSupply();
  const wallets = [
    ALLOCATION_WALLETS["Vault Reserve"],
    ALLOCATION_WALLETS["Founder"],
    ALLOCATION_WALLETS["Liquidity"],
    ALLOCATION_WALLETS["Partnerships"],
    ALLOCATION_WALLETS["Contributors"],
    ALLOCATION_WALLETS["Future Ecosystem"],
    ALLOCATION_WALLETS["Membership Distribution"],
  ];
  const q = useReadContracts({
    allowFailure: true,
    contracts: wallets.map((w) => ({
      address: CONTRACTS.SYN_CONTRACT_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf" as const,
      args: [w as `0x${string}`],
    })),
    query: { refetchInterval: 120_000, staleTime: 60_000 },
  });
  const reserved = (q.data ?? []).reduce((sum, r) => {
    const raw = r && r.status === "success" ? (r.result as unknown as bigint) : 0n;
    return sum + Number(formatUnits(raw, SYN_DECIMALS));
  }, 0);
  const circulating =
    supply.totalSupply !== undefined && q.data !== undefined
      ? Math.max(supply.totalSupply - reserved, 0)
      : undefined;
  return {
    isLoading: supply.isLoading || q.isLoading,
    totalSupply: supply.totalSupply,
    nonCirculating: q.data !== undefined ? reserved : undefined,
    circulating,
  };
}

export function useTreasuryAssets() {
  return useWalletAssets(CONTRACTS.VAULT_WALLET);
}
