import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS, SYN_DECIMALS, LP_POOL, RANKS_V2, ACCESS_RATE_USDC_PER_SYN, rankForSyn } from "./syndicate-config";
import { ERC20_ABI } from "./sale-abi";
import { useLivePurchaseEvents, type PurchaseEvent } from "./activity-hooks";

const PAIR = LP_POOL.pairAddress as `0x${string}`;
const SYN = CONTRACTS.SYN_CONTRACT_ADDRESS as `0x${string}`;

const AVALANCHE_AVG_BLOCK_SEC = 2;

export type QuestState = "complete" | "in_progress" | "locked" | "not_started";

export type Quest = {
  id: string;
  title: string;
  detail: string;
  recognition: string;
  state: QuestState;
  /** 0–100 */
  progress: number;
  progressLabel: string;
  recognitionStatus: "PLANNED";
};

/**
 * Per-user activity progress derived from onchain data:
 * - First Purchase: any TokensPurchased event with buyer = user
 * - Long-Term Holder: earliest purchase ≥ 90 days ago AND SYN balance > 0
 * - LP Provider: user holds JLP tokens (balanceOf > 0 on the pair)
 * - Footprint Builder: SYN balance reaches the Vanguard footprint band (10,000 SYN)
 * - Episode Participant: governance not live → locked
 * - Referral: tracking not live → locked
 *
 * Recognition remains PENDING across the board. No reward, claim, or payout is live.
 */
export function useUserQuestProgress(): {
  connected: boolean;
  isLoading: boolean;
  quests: Quest[];
} {
  const { address } = useAccount();
  const events = useLivePurchaseEvents({ limit: 1000 });

  // Real LP balance lookup via ERC20 balanceOf interface (JLP is ERC20).
  const userLp = useReadContract({
    address: PAIR,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 60_000 },
  });
  const userSyn = useReadContract({
    address: SYN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 60_000 },
  });

  const quests = useMemo<Quest[]>(() => {
    const connected = Boolean(address);
    const userEvents: PurchaseEvent[] = connected && events.data
      ? events.data.filter((e) => e.buyer.toLowerCase() === address!.toLowerCase())
      : [];

    const synBalanceRaw = (userSyn.data as bigint | undefined);
    const synBalance = synBalanceRaw !== undefined ? Number(formatUnits(synBalanceRaw, SYN_DECIMALS)) : 0;
    const lpBalanceRaw = (userLp.data as bigint | undefined);
    const lpBalance = lpBalanceRaw !== undefined ? Number(formatUnits(lpBalanceRaw, 18)) : 0;

    // Days held — approx via block delta × avg block time.
    let daysHeld = 0;
    if (userEvents.length > 0) {
      const earliest = userEvents.reduce((min, e) => (e.blockNumber < min ? e.blockNumber : min), userEvents[0].blockNumber);
      // Use latest event in scan window as a recency anchor (cheap; precise enough for a progress bar).
      const tip = events.data && events.data.length > 0
        ? events.data.reduce((max, e) => (e.blockNumber > max ? e.blockNumber : max), events.data[0].blockNumber)
        : earliest;
      const blocks = Number(tip - earliest);
      daysHeld = Math.max(0, Math.floor((blocks * AVALANCHE_AVG_BLOCK_SEC) / 86400));
    }

    const rank = rankForSyn(synBalance).current;
    const vanguardUsdc = 100;
    const vanguardSyn = vanguardUsdc / ACCESS_RATE_USDC_PER_SYN; // 10,000
    const vanguardPct = Math.min(100, (synBalance / vanguardSyn) * 100);

    const quests: Quest[] = [
      {
        id: "first-purchase",
        title: "First Purchase",
        detail: "Buy any amount of SYN via the Membership Sale.",
        recognition: "Citizen marker + archive entry",
        state: !connected ? "not_started" : userEvents.length > 0 ? "complete" : "in_progress",
        progress: !connected ? 0 : userEvents.length > 0 ? 100 : 0,
        progressLabel: !connected
          ? "Connect wallet to track"
          : userEvents.length > 0
            ? `${userEvents.length} purchase${userEvents.length === 1 ? "" : "s"} verified`
            : "No purchase found",
        recognitionStatus: "PLANNED",
      },
      {
        id: "long-term-holder",
        title: "Long-Term Holder",
        detail: "Hold SYN for 90+ days without selling.",
        recognition: "Long-term holder archive marker",
        state: !connected
          ? "not_started"
          : synBalance > 0 && daysHeld >= 90
            ? "complete"
            : synBalance > 0
              ? "in_progress"
              : "not_started",
        progress: !connected ? 0 : Math.min(100, (daysHeld / 90) * 100),
        progressLabel: !connected
          ? "Connect wallet to track"
          : `${daysHeld} / 90 days`,
        recognitionStatus: "PLANNED",
      },
      {
        id: "lp-provider",
        title: "Liquidity Provider",
        detail: "Provide liquidity to the SYN/USDC pool on Trader Joe.",
        recognition: "LP participation marker",
        state: !connected ? "not_started" : lpBalance > 0 ? "complete" : "in_progress",
        progress: !connected ? 0 : lpBalance > 0 ? 100 : 0,
        progressLabel: !connected
          ? "Connect wallet to track"
          : lpBalance > 0
            ? `${lpBalance.toLocaleString("en-US", { maximumFractionDigits: 6 })} JLP held`
            : "No LP position",
        recognitionStatus: "PLANNED",
      },
      {
        id: "rank-climber",
        title: "Reach Vanguard Footprint",
        detail: "Hold ≥ 10,000 SYN (≈ $100 contribution).",
        recognition: "Vanguard archive marker",
        state: !connected
          ? "not_started"
          : synBalance >= vanguardSyn
            ? "complete"
            : synBalance > 0
              ? "in_progress"
              : "not_started",
        progress: !connected ? 0 : vanguardPct,
        progressLabel: !connected
          ? "Connect wallet to track"
          : `${rank?.name ?? "—"} · ${synBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })} / ${vanguardSyn.toLocaleString("en-US")} SYN`,
        recognitionStatus: "PLANNED",
      },
      {
        id: "episode-participant",
        title: "Episode Participant",
        detail: "Vote on a governance episode once governance is live.",
        recognition: "Governance recognition not live",
        state: "locked",
        progress: 0,
        progressLabel: "Governance contract not deployed",
        recognitionStatus: "PLANNED",
      },
      {
        id: "referral",
        title: "Referral",
        detail: "Refer a member who reaches the Operator footprint band.",
        recognition: "Referral tracking not live",
        state: "locked",
        progress: 0,
        progressLabel: "Referral tracking not deployed",
        recognitionStatus: "PLANNED",
      },
    ];

    return quests;
  }, [address, events.data, userSyn.data, userLp.data]);

  return {
    connected: Boolean(address),
    isLoading: events.isLoading || (Boolean(address) && (userSyn.isLoading || userLp.isLoading)),
    quests,
  };
}

// Re-export ranks for downstream consumers.
export { RANKS_V2 };
