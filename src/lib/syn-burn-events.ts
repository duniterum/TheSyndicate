// ─── SYN burn scanner (Proof of Fire) ──────────────────────────────────────
// The protocol runs NO automated burn. A burn is a manual, verifiable SYN
// Transfer to the standard dead address. This scanner indexes those transfers
// the same way the treasury-flow scanner indexes USDC: an incremental cursor
// from SALE_DEPLOYMENT_BLOCK, chunked, reorg-overlapped, cached.
//
// Why incremental-cursor (NOT a sliding lookback): Proof of Fire #001 sits at
// block 87,703,847, far behind the chain head. A lookback window would age it
// out and the numbering would drift. The cursor pattern scans the full history
// once, then only the tail — so #001 is always present and #N is stable.
//
// Numbering rule (doctrine): a Proof-of-Fire number is assigned ONLY when the
// scan is complete (no failed chunk) and therefore gapless. On an incomplete
// scan the burn is still shown, but WITHOUT a number (status PARTIAL upstream),
// because a number implies "the Nth verified burn ever" and a gap could make
// that false. Founder vs Community is decided by the sender via the canonical
// known-address registry — never re-hardcoded here.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePublicClient, useChainId } from "wagmi";
import { formatUnits, parseAbiItem } from "viem";
import { CONTRACTS, SYN_DECIMALS, SALE_DEPLOYMENT_BLOCK, SYN_BURN_ADDRESS } from "./syndicate-config";
import { fetchSharedChainTip } from "./chain-time";
import { REORG_OVERLAP, computeIncrementalScanStart } from "./activity-hooks";
import { isFounderWallet } from "./known-addresses";
import {
  synBurnEventsCacheKey,
  loadSynBurnSnapshot,
  saveSynBurnSnapshot,
  mergeSynBurnEvents,
} from "./syn-burn-events-cache";

const SYN = CONTRACTS.SYN_CONTRACT_ADDRESS as `0x${string}`;
const BURN_ADDRESS = SYN_BURN_ADDRESS as `0x${string}`;
const TRANSFER = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");
const CHUNK = 2_000n;

export type SynBurnEvent = {
  /** Address that sent SYN to the dead address. */
  sender: string;
  /** SYN amount burned (human units). */
  amountSyn: number;
  /** True when the sender is the Founder allocation wallet → "Founder Burn". */
  isFounder: boolean;
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
  /**
   * 1-based "Proof of Fire #N" — assigned ONLY on a complete, gapless scan.
   * Undefined while the scan is incomplete (upstream renders that as PARTIAL).
   */
  proofOfFireNumber?: number;
};

export type SynBurnScan = {
  events: SynBurnEvent[];
  /** True when every chunk of the scan succeeded — required to assign numbers. */
  complete: boolean;
};

/**
 * Pure: assign 1-based Proof-of-Fire numbers oldest → newest, returning the
 * list in its ORIGINAL order with `proofOfFireNumber` populated. The oldest
 * burn is always #1. Exported (and unit-tested) so the numbering contract is
 * verifiable without a live RPC.
 */
export function assignProofOfFireNumbers(events: SynBurnEvent[]): SynBurnEvent[] {
  const ascending = [...events].sort((a, b) =>
    a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber > b.blockNumber ? 1 : -1,
  );
  const numberByKey = new Map<string, number>();
  ascending.forEach((e, i) => numberByKey.set(`${e.txHash}:${e.logIndex}`, i + 1));
  return events.map((e) => ({ ...e, proofOfFireNumber: numberByKey.get(`${e.txHash}:${e.logIndex}`) }));
}

// Generic chunked scan with a typed fetch callback — mirrors onchain-events so
// the returned logs keep their decoded `.args`. Returns the events AND whether
// every chunk succeeded; an incomplete scan must not advance the cursor.
async function scan<T>(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  fromBlock: bigint,
  tip: bigint,
  fetchChunk: (start: bigint, end: bigint) => Promise<T[]>,
): Promise<{ events: T[]; complete: boolean }> {
  const from = fromBlock > tip ? tip : fromBlock;
  const out: T[] = [];
  let complete = true;
  for (let start = from; start <= tip; start += CHUNK + 1n) {
    const end = start + CHUNK > tip ? tip : start + CHUNK;
    try {
      out.push(...(await fetchChunk(start, end)));
    } catch {
      complete = false;
    }
  }
  return { events: out, complete };
}

/**
 * Live SYN burns (Proof of Fire), newest-first. `data.complete` reports whether
 * the scan was gapless; only then do events carry `proofOfFireNumber`.
 */
export function useSynBurnEvents(opts?: { fromBlock?: bigint; limit?: number }) {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const fromBlock = opts?.fromBlock ?? SALE_DEPLOYMENT_BLOCK;
  const limit = opts?.limit ?? 25;

  return useQuery({
    queryKey: ["syn-burns", String(fromBlock), limit],
    enabled: Boolean(publicClient),
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<SynBurnScan> => {
      if (!publicClient) return { events: [], complete: false };
      const tip = (await fetchSharedChainTip(publicClient, queryClient)).number;

      // Incremental: resume from the persisted cursor. The cache is only ever
      // written on a complete scan, so a stored snapshot is gapless up to its
      // cursor; we still require the current window to complete before numbering.
      const cacheKey = synBurnEventsCacheKey({ chainId, token: SYN, burnAddress: BURN_ADDRESS, fromBlock });
      const cached = loadSynBurnSnapshot<SynBurnEvent>(cacheKey);
      const scanStart = computeIncrementalScanStart({
        fromBlock,
        tip,
        lastScannedBlock: cached?.lastScannedBlock,
        overlap: REORG_OVERLAP,
      });

      const { events: logs, complete } = await scan(publicClient, scanStart, tip, (start, end) =>
        publicClient.getLogs({
          address: SYN,
          event: TRANSFER,
          args: { to: BURN_ADDRESS },
          fromBlock: start,
          toBlock: end,
        }),
      );
      const fresh: SynBurnEvent[] = [];
      for (const l of logs) {
        const a = l.args as { from?: string; to?: string; value?: bigint };
        if (!a.from || a.value === undefined) continue;
        fresh.push({
          sender: a.from,
          amountSyn: Number(formatUnits(a.value, SYN_DECIMALS)),
          isFounder: isFounderWallet(a.from),
          blockNumber: l.blockNumber ?? 0n,
          txHash: l.transactionHash ?? "",
          logIndex: l.logIndex ?? 0,
        });
      }

      // Merge cached history with the fresh window (dedupe reorg overlap), store
      // newest-first. Persist the RAW (un-numbered) list ONLY when complete so
      // the cursor never advances past an unscanned gap.
      const merged = mergeSynBurnEvents(cached?.events ?? [], fresh);
      if (complete && merged.length > 0) {
        const nextLastScanned = cached && cached.lastScannedBlock > tip ? cached.lastScannedBlock : tip;
        saveSynBurnSnapshot(cacheKey, merged, nextLastScanned);
      }

      // Numbers are derived AFTER merge and ONLY on a complete, gapless scan.
      const numbered = complete ? assignProofOfFireNumbers(merged) : merged;
      return { events: limit > 0 ? numbered.slice(0, limit) : numbered, complete };
    },
  });
}
