// Live scanner for SyndicateArchive1155 mint events (TransferSingle from 0x0).
// Used by the "Recent collectors" rail on /nft. Newest-first, no fabrication —
// when the indexer returns nothing, the UI surfaces that honestly.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { ARCHIVE_NFT_CONTRACT_ADDRESS } from "./syndicate-config";
import { fetchSharedChainTip } from "./chain-time";

const ARCHIVE = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;
const ZERO = "0x0000000000000000000000000000000000000000".toLowerCase();

const TRANSFER_SINGLE = parseAbiItem(
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
);

export type ArchiveMintEvent = {
  to: string;
  tokenId: number;
  value: number;
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
};

/** Scans the most recent ~LOOKBACK blocks for Archive mints (from = 0x0). */
export function useArchiveMintEvents(opts?: { lookbackBlocks?: bigint; limit?: number; ids?: readonly number[] }) {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const lookback = opts?.lookbackBlocks ?? 200_000n; // ~4–5 days on Avalanche
  const limit = opts?.limit ?? 10;
  const idFilter = opts?.ids ? new Set(opts.ids.map((n) => Number(n))) : null;

  return useQuery({
    queryKey: ["archive-mints", String(lookback), limit, ARCHIVE, opts?.ids?.join(",") ?? "all"],
    enabled: Boolean(publicClient),
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<ArchiveMintEvent[]> => {
      if (!publicClient) return [];
      // Shared chain-tip (P4c) instead of an independent getBlockNumber().
      const tip = (await fetchSharedChainTip(publicClient, queryClient)).number;
      const from = tip > lookback ? tip - lookback : 0n;
      const CHUNK = 2_000n;
      const out: ArchiveMintEvent[] = [];
      for (let start = from; start <= tip; start += CHUNK + 1n) {
        const end = start + CHUNK > tip ? tip : start + CHUNK;
        try {
          const logs = await publicClient.getLogs({
            address: ARCHIVE,
            event: TRANSFER_SINGLE,
            args: { from: ZERO as `0x${string}` },
            fromBlock: start,
            toBlock: end,
          });
          for (const l of logs) {
            const a = l.args as { to?: string; id?: bigint; value?: bigint };
            if (!a.to || a.id === undefined || a.value === undefined) continue;
            const tokenId = Number(a.id);
            if (idFilter && !idFilter.has(tokenId)) continue;
            out.push({
              to: a.to,
              tokenId,
              value: Number(a.value),
              blockNumber: l.blockNumber ?? 0n,
              txHash: l.transactionHash ?? "",
              logIndex: l.logIndex ?? 0,
            });
          }
        } catch {
          // public RPCs sometimes reject windows — skip and continue
        }
      }
      out.sort((a, b) =>
        a.blockNumber === b.blockNumber ? b.logIndex - a.logIndex : b.blockNumber > a.blockNumber ? 1 : -1,
      );
      return limit > 0 ? out.slice(0, limit) : out;
    },
  });
}
