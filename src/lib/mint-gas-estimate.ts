// Gas estimation + actual-gas accounting for the First Signal mint flow.
//
// Before submit we show an honest estimated AVAX fee for each step
// (approve, mint). After confirmation we show the *actual* gas used,
// computed from the receipt. Estimates are LIVE on-chain reads — if the
// estimate fails (e.g. would-revert) we degrade to "—" rather than
// guessing.

import { useEffect, useMemo, useState } from "react";
import { encodeFunctionData, formatEther, type Abi } from "viem";
import { usePublicClient } from "wagmi";
import { ERC20_ABI } from "@/lib/sale-abi";
import { ARCHIVE_NFT_ABI } from "@/lib/archive-nft-abi";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  CONTRACTS,
} from "@/lib/syndicate-config";

const ARCHIVE = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;
const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;

export type GasEstimate = {
  /** Estimated gas units. */
  gas?: bigint;
  /** Fee per gas (maxFee or gasPrice) in wei. */
  feePerGas?: bigint;
  /** Total fee in wei = gas * feePerGas. */
  feeWei?: bigint;
  /** Formatted AVAX string, e.g. "0.00123 AVAX", or undefined when not ready. */
  feeAvax?: string;
  loading: boolean;
  error?: string;
};

function fmtAvax(wei: bigint): string {
  const eth = Number(formatEther(wei));
  if (!Number.isFinite(eth)) return "—";
  if (eth < 0.00001) return "<0.00001 AVAX";
  return `${eth.toLocaleString("en-US", { maximumFractionDigits: 5 })} AVAX`;
}

/**
 * Estimate gas for the approve + mint steps from the connected wallet.
 * Re-runs when `enabled` flips true or when wallet / required allowance change.
 */
export function useMintGasEstimates({
  wallet,
  requiredUsdc,
  enabled,
}: {
  wallet: `0x${string}` | undefined;
  requiredUsdc: bigint | undefined;
  enabled: boolean;
}): { approve: GasEstimate; mint: GasEstimate } {
  const publicClient = usePublicClient();
  const [approve, setApprove] = useState<GasEstimate>({ loading: false });
  const [mint, setMint] = useState<GasEstimate>({ loading: false });

  useEffect(() => {
    if (!enabled || !publicClient || !wallet || requiredUsdc === undefined) {
      setApprove({ loading: false });
      setMint({ loading: false });
      return;
    }
    let cancelled = false;
    setApprove((s) => ({ ...s, loading: true }));
    setMint((s) => ({ ...s, loading: true }));

    const run = async () => {
      let feePerGas: bigint | undefined;
      try {
        const fees = await publicClient.estimateFeesPerGas().catch(() => null);
        feePerGas = fees?.maxFeePerGas;
        if (feePerGas === undefined) {
          feePerGas = await publicClient.getGasPrice();
        }
      } catch {
        feePerGas = undefined;
      }

      // approve(spender, amount)
      try {
        const data = encodeFunctionData({
          abi: ERC20_ABI as Abi,
          functionName: "approve",
          args: [ARCHIVE, requiredUsdc],
        });
        const gas = await publicClient.estimateGas({
          account: wallet,
          to: USDC,
          data,
        });
        if (cancelled) return;
        const feeWei = feePerGas !== undefined ? gas * feePerGas : undefined;
        setApprove({
          gas,
          feePerGas,
          feeWei,
          feeAvax: feeWei !== undefined ? fmtAvax(feeWei) : undefined,
          loading: false,
        });
      } catch (e) {
        if (cancelled) return;
        setApprove({
          loading: false,
          error: e instanceof Error ? e.message : "estimate failed",
        });
      }

      // mint(id, qty) — only estimable when allowance already covers; safe to
      // attempt anyway, we just degrade on revert.
      try {
        const data = encodeFunctionData({
          abi: ARCHIVE_NFT_ABI as Abi,
          functionName: "mint",
          args: [1n, 1n],
        });
        const gas = await publicClient.estimateGas({
          account: wallet,
          to: ARCHIVE,
          data,
        });
        if (cancelled) return;
        const feeWei = feePerGas !== undefined ? gas * feePerGas : undefined;
        setMint({
          gas,
          feePerGas,
          feeWei,
          feeAvax: feeWei !== undefined ? fmtAvax(feeWei) : undefined,
          loading: false,
        });
      } catch (e) {
        if (cancelled) return;
        setMint({
          loading: false,
          error: e instanceof Error ? e.message : "estimate failed",
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [publicClient, wallet, requiredUsdc, enabled]);

  return { approve, mint };
}

/**
 * Format actual fee from a confirmed receipt. Returns undefined when the
 * receipt has no usable fee fields.
 */
export function formatActualFee(receipt: {
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
} | undefined | null): { gasUsed?: bigint; feeAvax?: string } {
  if (!receipt?.gasUsed) return {};
  const price = receipt.effectiveGasPrice;
  if (price === undefined) return { gasUsed: receipt.gasUsed };
  const feeWei = receipt.gasUsed * price;
  return { gasUsed: receipt.gasUsed, feeAvax: fmtAvax(feeWei) };
}

export function useFormattedActualFee(receipt: unknown) {
  return useMemo(
    () => formatActualFee(receipt as { gasUsed?: bigint; effectiveGasPrice?: bigint }),
    [receipt],
  );
}
