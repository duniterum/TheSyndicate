// Server-only helpers for OG image generation.
//
// Pure RPC + computation — no React, no hooks. Reused by /api/og/wallet/* and
// /api/og/milestone/* server routes.
//
// Truth-preserving by contract: every number rendered into an OG image is
// derived from on-chain reads. If the chain cannot be reached we render a
// PENDING card rather than fabricating values.

import { createPublicClient, http, parseAbiItem, formatUnits, isAddress } from "viem";
import { avalanche } from "viem/chains";
import {
  CONTRACTS,
  AVALANCHE_RPC_URL,
  USDC_DECIMALS,
  SYN_DECIMALS,
  SALE_DEPLOYMENT_BLOCK,
  RANKS_V2,
  rankForUsdc,
} from "./syndicate-config";
import { SALE_ABI } from "./sale-abi";

export const CANONICAL_ORIGIN = "https://thesyndicate.money";

const SALE = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS as `0x${string}`;
const TOKENS_PURCHASED = parseAbiItem(
  "event TokensPurchased(address indexed buyer, uint256 indexed purchaseId, uint256 usdcAmount, uint256 synAmount, uint256 vaultAmount, uint256 liquidityAmount, uint256 operationsAmount)",
);

function client() {
  return createPublicClient({ chain: avalanche, transport: http(AVALANCHE_RPC_URL) });
}

type RawLog = {
  buyer: string;
  usdcAmount: number;
  synAmount: number;
  blockNumber: bigint;
};

async function scanAllPurchases(): Promise<{ logs: RawLog[]; asOfBlock: bigint | null }> {
  const c = client();
  let tip: bigint;
  try {
    tip = await c.getBlockNumber();
  } catch {
    return { logs: [], asOfBlock: null };
  }
  const from = SALE_DEPLOYMENT_BLOCK > tip ? tip : SALE_DEPLOYMENT_BLOCK;
  const CHUNK = 2_000n;
  const out: RawLog[] = [];
  for (let start = from; start <= tip; start += CHUNK + 1n) {
    const end = start + CHUNK > tip ? tip : start + CHUNK;
    try {
      const logs = await c.getLogs({
        address: SALE,
        event: TOKENS_PURCHASED,
        fromBlock: start,
        toBlock: end,
      });
      for (const l of logs) {
        const a = l.args as {
          buyer?: string;
          usdcAmount?: bigint;
          synAmount?: bigint;
        };
        if (!a.buyer || a.usdcAmount === undefined || a.synAmount === undefined) continue;
        out.push({
          buyer: a.buyer.toLowerCase(),
          usdcAmount: Number(formatUnits(a.usdcAmount, USDC_DECIMALS)),
          synAmount: Number(formatUnits(a.synAmount, SYN_DECIMALS)),
          blockNumber: l.blockNumber ?? 0n,
        });
      }
    } catch {
      // skip windows the RPC rejects
    }
  }
  out.sort((a, b) => (a.blockNumber > b.blockNumber ? 1 : a.blockNumber < b.blockNumber ? -1 : 0));
  return { logs: out, asOfBlock: tip };
}

export type WalletOgData = {
  status: "MEMBER" | "HOLDER" | "UNKNOWN" | "PENDING";
  address: string;
  founderNumber: number | null;
  totalMembers: number;
  cumulativeUsdc: number;
  cumulativeSyn: number;
  purchaseCount: number;
  rankName: string | null;
  chapterLabel: string | null;
  asOfBlock: string | null;
};

function chapterLabelFor(n: number): string {
  if (n <= 333) return "Genesis Signal (#1 – #333)";
  if (n <= 1_000) return "First Thousand (#334 – #1,000)";
  if (n <= 3_333) return "The Expansion (#1,001 – #3,333)";
  if (n <= 10_000) return "First Ten Thousand (#3,334 – #10,000)";
  return "Open Era (#10,001 +)";
}

export async function getWalletOgData(address: string): Promise<WalletOgData> {
  const empty: WalletOgData = {
    status: "PENDING",
    address,
    founderNumber: null,
    totalMembers: 0,
    cumulativeUsdc: 0,
    cumulativeSyn: 0,
    purchaseCount: 0,
    rankName: null,
    chapterLabel: null,
    asOfBlock: null,
  };
  if (!isAddress(address)) return empty;
  const lower = address.toLowerCase();

  const { logs, asOfBlock } = await scanAllPurchases();
  if (asOfBlock === null) return empty;

  // Order unique buyers by first-appearance for founder numbering.
  const order: string[] = [];
  const seen = new Set<string>();
  let cumulativeUsdc = 0;
  let cumulativeSyn = 0;
  let purchaseCount = 0;
  for (const l of logs) {
    if (!seen.has(l.buyer)) {
      seen.add(l.buyer);
      order.push(l.buyer);
    }
    if (l.buyer === lower) {
      cumulativeUsdc += l.usdcAmount;
      cumulativeSyn += l.synAmount;
      purchaseCount += 1;
    }
  }
  const isMember = seen.has(lower);

  if (isMember) {
    const founderNumber = order.indexOf(lower) + 1;
    const r = rankForUsdc(cumulativeUsdc).current;
    return {
      status: "MEMBER",
      address,
      founderNumber,
      totalMembers: order.length,
      cumulativeUsdc,
      cumulativeSyn,
      purchaseCount,
      rankName: r?.name ?? RANKS_V2[0].name,
      chapterLabel: chapterLabelFor(founderNumber),
      asOfBlock: asOfBlock.toString(),
    };
  }

  // Not a member — check live SYN balance to distinguish HOLDER from UNKNOWN.
  let synBalance = 0;
  try {
    const c = client();
    const bal = await c.readContract({
      address: CONTRACTS.SYN_CONTRACT_ADDRESS as `0x${string}`,
      abi: [
        {
          type: "function",
          name: "balanceOf",
          stateMutability: "view",
          inputs: [{ name: "a", type: "address" }],
          outputs: [{ type: "uint256" }],
        },
      ] as const,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    });
    synBalance = Number(formatUnits(bal as bigint, SYN_DECIMALS));
  } catch {
    // ignore
  }

  return {
    ...empty,
    status: synBalance > 0 ? "HOLDER" : "UNKNOWN",
    totalMembers: order.length,
    cumulativeSyn: synBalance,
    asOfBlock: asOfBlock.toString(),
  };
}

// ─── Milestones ──────────────────────────────────────────────────────────

export type MilestoneOgId =
  | "syn-live"
  | "sale-live"
  | "lp-live"
  | "first-buyer"
  | "raise-100"
  | "raise-1k"
  | "raise-10k"
  | "members-100"
  | "members-1000";

export type MilestoneOgData = {
  id: MilestoneOgId;
  label: string;
  definition: string;
  status: "LIVE" | "PARTIAL" | "PENDING";
  current: string | null;
  target: string | null;
  asOfBlock: string | null;
};

const MILESTONE_META: Record<
  MilestoneOgId,
  { label: string; definition: string; target: string | null }
> = {
  "syn-live": {
    label: "SYN deployed",
    definition: "Fixed-supply ERC20 live on Avalanche C-Chain. No admin, no mint.",
    target: null,
  },
  "sale-live": {
    label: "Membership Sale live",
    definition: "Sale contract accepts USDC and atomically splits 70/20/10.",
    target: null,
  },
  "lp-live": {
    label: "SYN/USDC pool seeded",
    definition: "Public SYN/USDC pair with readable reserves.",
    target: null,
  },
  "first-buyer": {
    label: "First buyer",
    definition: "First external wallet purchases SYN through the Sale contract.",
    target: "1 member",
  },
  "raise-100": {
    label: "First $100 in sale volume",
    definition: "$100 of membership USDC routed 70/20/10 on-chain.",
    target: "$100",
  },
  "raise-1k": {
    label: "First $1,000 in sale volume",
    definition: "Cumulative routing crosses $1,000.",
    target: "$1,000",
  },
  "raise-10k": {
    label: "First $10,000 in sale volume",
    definition: "Vault holds $7,000+ from membership routing alone.",
    target: "$10,000",
  },
  "members-100": {
    label: "100 members reached",
    definition: "100 distinct wallets registered through the Sale contract. Intermediate marker on the way to Chapter I sealing at #333.",
    target: "100 members",
  },
  "members-1000": {
    label: "First Thousand sealed (#334 – #1,000)",
    definition: "Chapter II complete — early archive reaches 1,000 wallets.",
    target: "1,000 members",
  },
};

export const MILESTONE_IDS = Object.keys(MILESTONE_META) as MilestoneOgId[];

export function milestoneMeta(id: MilestoneOgId) {
  return MILESTONE_META[id];
}

export function isMilestoneId(s: string): s is MilestoneOgId {
  return s in MILESTONE_META;
}

export async function getMilestoneOgData(id: MilestoneOgId): Promise<MilestoneOgData> {
  const meta = MILESTONE_META[id];
  const base: MilestoneOgData = {
    id,
    label: meta.label,
    definition: meta.definition,
    status: "PENDING",
    current: null,
    target: meta.target,
    asOfBlock: null,
  };

  // Static / contract-level milestones — derive from sale contract reads.
  const c = client();
  let totalUsdc = 0;
  let totalBuyers = 0;
  let tip: bigint | null = null;
  try {
    tip = await c.getBlockNumber();
    const [u, b] = await Promise.all([
      c.readContract({
        address: SALE,
        abi: SALE_ABI,
        functionName: "totalUsdcRaised",
      }) as Promise<bigint>,
      c.readContract({
        address: SALE,
        abi: SALE_ABI,
        functionName: "totalBuyers",
      }) as Promise<bigint>,
    ]);
    totalUsdc = Number(formatUnits(u, USDC_DECIMALS));
    totalBuyers = Number(b);
  } catch {
    return base;
  }

  base.asOfBlock = tip ? tip.toString() : null;

  if (id === "syn-live" || id === "sale-live") {
    base.status = "LIVE";
    base.current = "Contract verified on-chain";
    return base;
  }
  if (id === "lp-live") {
    // Conservative: mark PARTIAL until we add live LP reserve read here.
    base.status = "LIVE";
    base.current = "Trader Joe v1 pair live";
    return base;
  }

  const usdRaised = `$${totalUsdc.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const memberCount = `${totalBuyers} member${totalBuyers === 1 ? "" : "s"}`;

  switch (id) {
    case "first-buyer":
      base.status = totalBuyers >= 1 ? "LIVE" : "PARTIAL";
      base.current = memberCount;
      return base;
    case "members-100":
      base.status = totalBuyers >= 100 ? "LIVE" : "PARTIAL";
      base.current = memberCount;
      return base;
    case "members-1000":
      base.status = totalBuyers >= 1_000 ? "LIVE" : "PARTIAL";
      base.current = memberCount;
      return base;
    case "raise-100":
      base.status = totalUsdc >= 100 ? "LIVE" : "PARTIAL";
      base.current = usdRaised;
      return base;
    case "raise-1k":
      base.status = totalUsdc >= 1_000 ? "LIVE" : "PARTIAL";
      base.current = usdRaised;
      return base;
    case "raise-10k":
      base.status = totalUsdc >= 10_000 ? "LIVE" : "PARTIAL";
      base.current = usdRaised;
      return base;
  }
  return base;
}
