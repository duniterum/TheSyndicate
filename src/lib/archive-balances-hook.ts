// Per-wallet read-only balance reads for the deployed Archive contract.
// Uses balanceOf(account, id) on SyndicateArchive1155 with allowFailure=true.
// No write paths. No fabricated ownership — when wallet is not connected or
// a read fails, the UI surfaces it honestly.
import { useEffect, useMemo } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { ARCHIVE_NFT_CONTRACT_ADDRESS } from "./syndicate-config";
import { ARCHIVE_NFT_ABI } from "./archive-nft-abi";
import {
  loadWalletReadsSnapshot,
  readContractsDataToSlots,
  saveWalletReadsSnapshot,
  slotsToReadContractsData,
  walletReadsCacheKey,
} from "./wallet-reads-cache";

const ADDR = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;

export type ArchiveBalanceRead = {
  id: number;
  balance: bigint | undefined;
  error: string | null;
};

export type ArchiveBalancesResult = {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  connectedWallet: `0x${string}` | undefined;
  balances: Record<number, ArchiveBalanceRead>;
  totalKnown: bigint; // sum of successfully-read balances
};

export function useArchiveBalances(ids: readonly number[]): ArchiveBalancesResult {
  const { address } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const enabled = Boolean(address) && ids.length > 0;

  const contracts = enabled
    ? ids.map((id) => ({
        address: ADDR,
        abi: ARCHIVE_NFT_ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`, BigInt(id)],
      }))
    : [];

  const q = useReadContracts({
    allowFailure: true,
    contracts,
    query: {
      enabled,
      refetchInterval: 60_000,
      staleTime: 30_000,
    },
  });

  // P2: persist last-known balances per (chain, wallet, contract + ids) so a
  // revisit shows ownership instantly, then refreshes in the background. We
  // seed wagmi's OWN query cache (tagged with the snapshot's true age, so it
  // reads as STALE → background refetch fires and nothing is shown as freshly
  // LIVE), which keeps this hook's return shape byte-for-byte identical.
  const idsKey = ids.join("-");
  const cacheKey = useMemo(
    () =>
      enabled && address
        ? walletReadsCacheKey({
            scope: "archive-1155",
            chainId,
            wallet: address,
            slots: `${ADDR.toLowerCase()}#${idsKey}`,
          })
        : null,
    [enabled, address, chainId, idsKey],
  );

  useEffect(() => {
    if (!cacheKey) return;
    const snap = loadWalletReadsSnapshot(cacheKey);
    if (!snap) return;
    if (queryClient.getQueryState(q.queryKey)?.data) return; // don't clobber live/seeded
    queryClient.setQueryData(q.queryKey, slotsToReadContractsData(snap.values), {
      updatedAt: snap.updatedAt,
    });
    // q.queryKey derives from the same inputs as cacheKey; safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, queryClient]);

  useEffect(() => {
    if (!cacheKey || !address || !q.data) return;
    const values = readContractsDataToSlots(q.data);
    // Persist only COMPLETE reads — never cache a partial scan (a missing slot
    // would otherwise resurface as a synthetic read error on restore). Using
    // q.dataUpdatedAt (not Date.now) keeps a re-saved seed honestly stale.
    if (values.length === 0 || values.some((v) => v === undefined)) return;
    saveWalletReadsSnapshot(cacheKey, { updatedAt: q.dataUpdatedAt, wallet: address, values });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, q.dataUpdatedAt]);

  const balances: Record<number, ArchiveBalanceRead> = {};
  let total = 0n;
  ids.forEach((id, i) => {
    const r = q.data?.[i];
    const ok = r?.status === "success";
    const bal = ok ? (r.result as unknown as bigint) : undefined;
    if (bal !== undefined) total += bal;
    balances[id] = {
      id,
      balance: bal,
      error:
        r?.status === "failure"
          ? (r.error instanceof Error
              ? r.error.message.split("\n")[0]
              : "Read failed")
          : null,
    };
  });

  return {
    isLoading: enabled ? q.isLoading : false,
    isFetching: enabled ? q.isFetching : false,
    isError: enabled ? q.isError : false,
    connectedWallet: address,
    balances,
    totalKnown: total,
  };
}
