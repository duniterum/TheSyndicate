// Per-wallet read-only balance reads for the deployed Archive contract.
// Uses balanceOf(account, id) on SyndicateArchive1155 with allowFailure=true.
// No write paths. No fabricated ownership — when wallet is not connected or
// a read fails, the UI surfaces it honestly.
import { useAccount, useReadContracts } from "wagmi";
import { ARCHIVE_NFT_CONTRACT_ADDRESS } from "./syndicate-config";
import { ARCHIVE_NFT_ABI } from "./archive-nft-abi";

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
