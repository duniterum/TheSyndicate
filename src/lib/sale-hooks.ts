import { useEffect, useMemo } from "react";
import { useAccount, useChainId, useReadContracts, useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits } from "viem";
import {
  CONTRACTS,
  USDC_DECIMALS,
  SYN_DECIMALS,
  LP_POOL,
  MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS,
  MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS,
  MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS,
  SALE_V3_FRONTEND_BUY_TARGET,
  SALE_V2_LIVE,
} from "./syndicate-config";
import { SALE_ABI, SALE_V2_ABI, SALE_V3_ABI, ERC20_ABI, PAIR_ABI } from "./sale-abi";
import {
  loadWalletReadsSnapshot,
  readContractsDataToSlots,
  saveWalletReadsSnapshot,
  slotsToReadContractsData,
  walletReadsCacheKey,
} from "./wallet-reads-cache";

/** Sealed V1 sale (history). Cumulative V1 totals fold into protocol totals. */
const SALE_V1 = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS as `0x${string}`;
/** Sealed V2a sale (history). Its seats #3–#5 predate V2b; totals fold into protocol totals. */
const SALE_V2A = MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS as `0x${string}`;
/** Live V2 sale address, or null while V2 is dormant. */
const SALE_V2 = (SALE_V2_LIVE && MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS
  ? MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS
  : null) as `0x${string}` | null;
/** Live V3 sale address, or null until the V3 frontend cutover is approved. */
const SALE_V3 = (SALE_V3_FRONTEND_BUY_TARGET && MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS
  ? MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS
  : null) as `0x${string}` | null;
/** Zero source: public member buys are active; source/referral UI is not. */
export const ZERO_SOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;
const QUOTE_PREVIEW_RECIPIENT = "0x0000000000000000000000000000000000000001" as `0x${string}`;
/** True once the V3 sale is the active self-service sale. */
export const ACTIVE_SALE_IS_V3 = SALE_V3 !== null;
/** True once the V2 sale is the active self-service sale. */
export const ACTIVE_SALE_IS_V2 = !ACTIVE_SALE_IS_V3 && SALE_V2 !== null;
/**
 * The sale contract self-service buys + active-sale operational reads target.
 * V3 when active, then V2, otherwise the sealed V1 flow.
 */
export const ACTIVE_SALE = (SALE_V3 ?? SALE_V2 ?? SALE_V1) as `0x${string}`;
export const ACTIVE_SALE_VERSION = ACTIVE_SALE_IS_V3 ? "v3" : ACTIVE_SALE_IS_V2 ? "v2" : "v1";

const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const SYN = CONTRACTS.SYN_CONTRACT_ADDRESS as `0x${string}`;
const PAIR = LP_POOL.pairAddress as `0x${string}`;

export type SaleStats = {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  /** Active-sale inventory (V2 when live). */
  availableSyn?: bigint;
  /** Protocol-cumulative USDC routed (sealed V1 + live V2). */
  totalUsdcRaised?: bigint;
  /** Protocol-cumulative SYN distributed (sealed V1 + live V2). */
  totalSynSold?: bigint;
  /** Cumulative unique members across V1+V2. */
  totalBuyers?: bigint;
  /** Cumulative purchase count across V1+V2. */
  purchaseCount?: bigint;
  /** Active-sale paused flag (V2 when live). */
  paused?: boolean;
  /** SYN held by the active sale contract. */
  saleSynBalance?: bigint;
  /** V2 only — SYN that must stay locked for already-promised seats. */
  reserveFloor?: bigint;
  /** V2 only — the next seat the contract will assign. */
  nextSeatNumber?: bigint;
  /** V2 only — the active distribution era (Genesis = Era I). */
  currentEra?: number;
  /** V2 only — SYN sellable before the next seat boundary. */
  sellableSynForNextSeat?: bigint;
  /** V2 only — on-chain member count (includes the V1 genesis baseline). */
  memberCount?: bigint;
  /** True when the active sale is V2. */
  isV2: boolean;
  /** True when the active sale is V3. */
  isV3: boolean;
};

const okResult = <T,>(r: { status: string; result?: unknown } | undefined): T | undefined =>
  r && r.status === "success" ? (r.result as T) : undefined;

const sumBig = (a?: bigint, b?: bigint): bigint | undefined =>
  a === undefined && b === undefined ? undefined : (a ?? 0n) + (b ?? 0n);

/** Aggregate read of public sale stats. Refetches every 60s + on demand via refetch(). */
export function useSaleStats(): SaleStats {
  const q = useReadContracts({
    allowFailure: true,
    contracts: ACTIVE_SALE_IS_V3
      ? [
          // Active V3 sale — operational + identity reads.
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "availableSyn" },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "totalGrossUsdc" },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "totalSynSold" },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "memberCount" },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "GENESIS_OFFSET" },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "paused" },
          { address: SYN, abi: ERC20_ABI, functionName: "balanceOf", args: [ACTIVE_SALE] },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "currentReserveFloor" },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "nextSeatNumber" },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "currentEra" },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "sellableSynForNextSeat" },
          { address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "receiptCount" },
          // Sealed history folded into cumulative totals.
          { address: SALE_V1, abi: SALE_ABI, functionName: "totalUsdcRaised" },
          { address: SALE_V1, abi: SALE_ABI, functionName: "totalSynSold" },
          { address: SALE_V1, abi: SALE_ABI, functionName: "purchaseCount" },
          { address: SALE_V2A, abi: SALE_V2_ABI, functionName: "totalUsdcRaised" },
          { address: SALE_V2A, abi: SALE_V2_ABI, functionName: "totalSynSold" },
          { address: SALE_V2A, abi: SALE_V2_ABI, functionName: "memberCount" },
          { address: SALE_V2A, abi: SALE_V2_ABI, functionName: "GENESIS_OFFSET" },
          { address: SALE_V2 ?? SALE_V1, abi: SALE_V2_ABI, functionName: "totalUsdcRaised" },
          { address: SALE_V2 ?? SALE_V1, abi: SALE_V2_ABI, functionName: "totalSynSold" },
          { address: SALE_V2 ?? SALE_V1, abi: SALE_V2_ABI, functionName: "memberCount" },
          { address: SALE_V2 ?? SALE_V1, abi: SALE_V2_ABI, functionName: "GENESIS_OFFSET" },
        ]
      : ACTIVE_SALE_IS_V2
      ? [
          // Active V2 sale — operational + identity reads.
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "availableSyn" },
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "totalUsdcRaised" },
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "totalSynSold" },
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "memberCount" },
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "GENESIS_OFFSET" },
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "paused" },
          { address: SYN, abi: ERC20_ABI, functionName: "balanceOf", args: [ACTIVE_SALE] },
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "currentReserveFloor" },
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "nextSeatNumber" },
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "currentEra" },
          { address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "sellableSynForNextSeat" },
          // Sealed V1 history — folded into protocol-cumulative totals.
          { address: SALE_V1, abi: SALE_ABI, functionName: "totalUsdcRaised" },
          { address: SALE_V1, abi: SALE_ABI, functionName: "totalSynSold" },
          { address: SALE_V1, abi: SALE_ABI, functionName: "purchaseCount" },
          // Sealed V2a history (seats #3–#5) — also folded into cumulative totals
          // so the cutover to V2b does not silently drop V2a's on-chain sales.
          { address: SALE_V2A, abi: SALE_V2_ABI, functionName: "totalUsdcRaised" },
          { address: SALE_V2A, abi: SALE_V2_ABI, functionName: "totalSynSold" },
          { address: SALE_V2A, abi: SALE_V2_ABI, functionName: "memberCount" },
          { address: SALE_V2A, abi: SALE_V2_ABI, functionName: "GENESIS_OFFSET" },
        ]
      : [
          { address: SALE_V1, abi: SALE_ABI, functionName: "availableSyn" },
          { address: SALE_V1, abi: SALE_ABI, functionName: "totalUsdcRaised" },
          { address: SALE_V1, abi: SALE_ABI, functionName: "totalSynSold" },
          { address: SALE_V1, abi: SALE_ABI, functionName: "totalBuyers" },
          { address: SALE_V1, abi: SALE_ABI, functionName: "purchaseCount" },
          { address: SALE_V1, abi: SALE_ABI, functionName: "paused" },
          { address: SYN, abi: ERC20_ABI, functionName: "balanceOf", args: [SALE_V1] },
        ],
    query: { refetchInterval: 60_000, staleTime: 30_000 },
  });

  const base = { isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };

  if (ACTIVE_SALE_IS_V3) {
    const d = q.data ?? [];
    const memberCount = okResult<bigint>(d[3]);
    const v1Purchases = okResult<bigint>(d[14]);
    const v2aUsdc = okResult<bigint>(d[15]);
    const v2aSyn = okResult<bigint>(d[16]);
    const v2aMembers = okResult<bigint>(d[17]);
    const v2aOffset = okResult<bigint>(d[18]);
    const v2bUsdc = okResult<bigint>(d[19]);
    const v2bSyn = okResult<bigint>(d[20]);
    const v2bMembers = okResult<bigint>(d[21]);
    const v2bOffset = okResult<bigint>(d[22]);
    const v2aSeats =
      v2aMembers !== undefined && v2aOffset !== undefined && v2aMembers > v2aOffset
        ? v2aMembers - v2aOffset
        : 0n;
    const v2bSeats =
      v2bMembers !== undefined && v2bOffset !== undefined && v2bMembers > v2bOffset
        ? v2bMembers - v2bOffset
        : 0n;
    const receiptCount = okResult<bigint>(d[11]);
    return {
      ...base,
      availableSyn: okResult<bigint>(d[0]),
      totalUsdcRaised: sumBig(sumBig(sumBig(okResult<bigint>(d[12]), v2aUsdc), v2bUsdc), okResult<bigint>(d[1])),
      totalSynSold: sumBig(sumBig(sumBig(okResult<bigint>(d[13]), v2aSyn), v2bSyn), okResult<bigint>(d[2])),
      totalBuyers: memberCount,
      purchaseCount:
        v1Purchases !== undefined && receiptCount !== undefined
          ? v1Purchases + v2aSeats + v2bSeats + receiptCount
          : v1Purchases,
      paused: okResult<boolean>(d[5]),
      saleSynBalance: okResult<bigint>(d[6]),
      reserveFloor: okResult<bigint>(d[7]),
      nextSeatNumber: okResult<bigint>(d[8]),
      currentEra: okResult<number>(d[9]),
      sellableSynForNextSeat: okResult<bigint>(d[10]),
      memberCount,
      isV2: false,
      isV3: true,
    };
  }

  if (ACTIVE_SALE_IS_V2) {
    const d = q.data ?? [];
    const memberCount = okResult<bigint>(d[3]);
    const genesisOffset = okResult<bigint>(d[4]);
    const v1Purchases = okResult<bigint>(d[13]);
    // Sealed V2a history (seats #3–#5 predate V2b): its USDC/SYN/seats fold into
    // the protocol-cumulative totals so the headline "verify on-chain" numbers
    // are not understated by the cutover. V2a's seat count mirrors the V2b
    // derivation (memberCount − GENESIS_OFFSET). Reads fail-soft to 0 (sealed).
    const v2aUsdc = okResult<bigint>(d[14]);
    const v2aSyn = okResult<bigint>(d[15]);
    const v2aMembers = okResult<bigint>(d[16]);
    const v2aOffset = okResult<bigint>(d[17]);
    const v2aSeats =
      v2aMembers !== undefined && v2aOffset !== undefined && v2aMembers > v2aOffset
        ? v2aMembers - v2aOffset
        : 0n;
    // V2b memberCount already counts from the MERGED V1∪V2a baseline (GENESIS_OFFSET),
    // so it is the cumulative unique-member count. New V2b seats = memberCount − offset.
    const v2NewSeats =
      memberCount !== undefined && genesisOffset !== undefined
        ? memberCount > genesisOffset
          ? memberCount - genesisOffset
          : 0n
        : undefined;
    return {
      ...base,
      availableSyn: okResult<bigint>(d[0]),
      totalUsdcRaised: sumBig(sumBig(okResult<bigint>(d[11]), v2aUsdc), okResult<bigint>(d[1])),
      totalSynSold: sumBig(sumBig(okResult<bigint>(d[12]), v2aSyn), okResult<bigint>(d[2])),
      totalBuyers: memberCount,
      purchaseCount:
        v1Purchases !== undefined && v2NewSeats !== undefined
          ? v1Purchases + v2aSeats + v2NewSeats
          : v1Purchases,
      paused: okResult<boolean>(d[5]),
      saleSynBalance: okResult<bigint>(d[6]),
      reserveFloor: okResult<bigint>(d[7]),
      nextSeatNumber: okResult<bigint>(d[8]),
      currentEra: okResult<number>(d[9]),
      sellableSynForNextSeat: okResult<bigint>(d[10]),
      memberCount,
      isV2: true,
      isV3: false,
    };
  }

  const d = q.data ?? [];
  return {
    ...base,
    availableSyn: okResult<bigint>(d[0]),
    totalUsdcRaised: okResult<bigint>(d[1]),
    totalSynSold: okResult<bigint>(d[2]),
    totalBuyers: okResult<bigint>(d[3]),
    purchaseCount: okResult<bigint>(d[4]),
    paused: okResult<boolean>(d[5]),
    saleSynBalance: okResult<bigint>(d[6]),
    isV2: false,
    isV3: false,
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
          { address: USDC, abi: ERC20_ABI, functionName: "allowance", args: [address, ACTIVE_SALE] },
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

/**
 * Connected wallet's LIVE anti-whale headroom for the ACTIVE V2 era. Reads the
 * per-era per-address cumulative USDC cap (`maxUsdcPerAddressPerEra[era]`) and
 * how much this wallet has already contributed in that era
 * (`usdcByAddressEra[wallet][era]`). The buy UI uses this to block amounts that
 * are GUARANTEED to revert on-chain (`AddressEraCapExceeded`) before any funds
 * move — no burned gas. Read LIVE, so a future corrected redeploy with a higher
 * cap needs zero UI changes. V2-only; all-undefined on V1 (no per-era cap).
 */
export function useWalletEraCap(era: number | undefined, address?: `0x${string}`) {
  const enabled = (ACTIVE_SALE_IS_V2 || ACTIVE_SALE_IS_V3) && era !== undefined && Boolean(address);
  const abi = ACTIVE_SALE_IS_V3 ? SALE_V3_ABI : SALE_V2_ABI;
  const q = useReadContracts({
    allowFailure: true,
    contracts: enabled
      ? [
          { address: ACTIVE_SALE, abi, functionName: "maxUsdcPerAddressPerEra", args: [era as number] },
          { address: ACTIVE_SALE, abi, functionName: "usdcByAddressEra", args: [address as `0x${string}`, era as number] },
        ]
      : [],
    query: { enabled, refetchInterval: 60_000, staleTime: 30_000 },
  });
  const d = q.data ?? [];
  const capRaw = okResult<bigint>(d[0]);
  const spentRaw = okResult<bigint>(d[1]);
  const remainingRaw =
    capRaw !== undefined && spentRaw !== undefined
      ? capRaw > spentRaw
        ? capRaw - spentRaw
        : 0n
      : undefined;
  return {
    isLoading: q.isLoading,
    refetch: q.refetch,
    /** Per-era per-address cumulative USDC cap (raw, USDC decimals). */
    capRaw,
    /** USDC this wallet has already contributed in the active era (raw). */
    spentRaw,
    /** Remaining headroom before the on-chain cap reverts (raw); 0n when spent out. */
    remainingRaw,
    isV2: ACTIVE_SALE_IS_V2,
    isV3: ACTIVE_SALE_IS_V3,
  };
}

/**
 * Connected wallet purchase totals from the active sale contract. V2 exposes a
 * single `usdcContributed(account)` (no per-buyer SYN total view — that lives in
 * the holder index), so `buyerSynTotal` is undefined on V2.
 */
export function useBuyerPurchaseTotals() {
  const { address } = useAccount();
  const q = useReadContracts({
    allowFailure: true,
    contracts: address
      ? ACTIVE_SALE_IS_V3
        ? [{ address: ACTIVE_SALE, abi: SALE_V3_ABI, functionName: "grossContributed", args: [address] }]
      : ACTIVE_SALE_IS_V2
        ? [{ address: ACTIVE_SALE, abi: SALE_V2_ABI, functionName: "usdcContributed", args: [address] }]
        : [
            { address: SALE_V1, abi: SALE_ABI, functionName: "buyerUsdcTotal", args: [address] },
            { address: SALE_V1, abi: SALE_ABI, functionName: "buyerSynTotal", args: [address] },
          ]
      : [],
    query: { enabled: Boolean(address), refetchInterval: 60_000, staleTime: 30_000 },
  });
  const d = q.data ?? [];
  return {
    address,
    isLoading: q.isLoading,
    refetch: q.refetch,
    buyerUsdcTotal: okResult<bigint>(d[0]),
    buyerSynTotal: ACTIVE_SALE_IS_V2 || ACTIVE_SALE_IS_V3 ? undefined : okResult<bigint>(d[1]),
  };
}

/**
 * On-chain SYN quote for a given USDC amount (raw, USDC-decimals). Returns a
 * stable `{ data: synOut }` shape across V1 (`quoteSyn`) and V2 (`quote` tuple),
 * plus the V2-only `seatIfFirst`/`quoteEra`/`available` extras when live.
 */
export function useQuoteSyn(usdcAmountRaw: bigint | undefined, recipient?: `0x${string}`) {
  const enabled = Boolean(usdcAmountRaw && usdcAmountRaw > 0n);
  const quoteRecipient = recipient ?? QUOTE_PREVIEW_RECIPIENT;
  const v1 = useReadContract({
    address: SALE_V1,
    abi: SALE_ABI,
    functionName: "quoteSyn",
    args: enabled ? [usdcAmountRaw as bigint] : undefined,
    query: { enabled: enabled && !ACTIVE_SALE_IS_V2 },
  });
  const v2 = useReadContract({
    address: ACTIVE_SALE,
    abi: SALE_V2_ABI,
    functionName: "quote",
    args: enabled ? [usdcAmountRaw as bigint] : undefined,
    query: { enabled: enabled && ACTIVE_SALE_IS_V2 },
  });
  const v3 = useReadContract({
    address: ACTIVE_SALE,
    abi: SALE_V3_ABI,
    functionName: "quote",
    args: enabled ? [usdcAmountRaw as bigint, quoteRecipient, ZERO_SOURCE_ID] : undefined,
    query: { enabled: enabled && ACTIVE_SALE_IS_V3 },
  });
  if (ACTIVE_SALE_IS_V3) {
    const tuple = v3.data as
      | readonly [bigint, number, bigint, bigint, bigint, bigint]
      | undefined;
    return {
      data: tuple ? tuple[0] : undefined,
      isLoading: v3.isLoading,
      isError: v3.isError,
      refetch: async () => {
        const r = await v3.refetch();
        const t = r.data as
          | readonly [bigint, number, bigint, bigint, bigint, bigint]
          | undefined;
        return { ...r, data: t ? t[0] : undefined };
      },
      quoteEra: tuple ? tuple[1] : undefined,
      quoteSynPerUsdc: tuple ? tuple[2] : undefined,
      seatIfFirst: tuple ? tuple[3] : undefined,
      available: undefined as bigint | undefined,
      acquisitionCost: tuple ? tuple[4] : undefined,
      protocolContribution: tuple ? tuple[5] : undefined,
    };
  }
  if (ACTIVE_SALE_IS_V2) {
    const tuple = v2.data as
      | readonly [bigint, number, bigint, bigint, bigint, bigint]
      | undefined;
    return {
      data: tuple ? tuple[0] : undefined,
      isLoading: v2.isLoading,
      isError: v2.isError,
      // refetch resolves to the SELECTED synOut (tuple[0]) so a caller can
      // re-quote at submit time and read a fresh floor without decoding the
      // raw V2 tuple. (V1's refetch already yields the bigint directly.)
      refetch: async () => {
        const r = await v2.refetch();
        const t = r.data as
          | readonly [bigint, number, bigint, bigint, bigint, bigint]
          | undefined;
        return { ...r, data: t ? t[0] : undefined };
      },
      quoteEra: tuple ? tuple[1] : undefined,
      /** SYN delivered per 1 USDC at the LIVE era (uint64, integer SYN/$). */
      quoteSynPerUsdc: tuple ? tuple[2] : undefined,
      seatIfFirst: tuple ? tuple[3] : undefined,
      available: tuple ? tuple[4] : undefined,
      acquisitionCost: undefined as bigint | undefined,
      protocolContribution: undefined as bigint | undefined,
    };
  }
  return {
    data: v1.data as bigint | undefined,
    isLoading: v1.isLoading,
    isError: v1.isError,
    refetch: v1.refetch,
    quoteEra: undefined as number | undefined,
    quoteSynPerUsdc: undefined as bigint | undefined,
    seatIfFirst: undefined as bigint | undefined,
    available: undefined as bigint | undefined,
    acquisitionCost: undefined as bigint | undefined,
    protocolContribution: undefined as bigint | undefined,
  };
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
    () => ({ sale: ACTIVE_SALE, usdc: USDC, syn: SYN, pair: PAIR }),
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
