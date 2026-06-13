// Pure helpers for the /activity protocol-heartbeat feed.
// All functions here are framework-free so they can be unit-tested
// without a DOM. The UI layer (ActivityFilterChips, ActivitySummaryRow,
// ProtocolEventsFeed) consumes these helpers — never inlines the logic.

import type { ProtocolEvent, ProtocolEventKind } from "./protocol-events";

export type ActivityFilterKey =
  | "all"
  | "membership"
  | "archive"
  | "nft"
  | "liquidity"
  | "vault"
  | "burn";

export type ActivityFilterGroup = {
  key: ActivityFilterKey;
  label: string;
  description: string;
  kinds: ProtocolEventKind[] | "*";
};

export const ACTIVITY_FILTER_GROUPS: ActivityFilterGroup[] = [
  {
    key: "all",
    label: "All events",
    description: "Every on-chain movement, newest first.",
    kinds: "*",
  },
  {
    key: "membership",
    label: "Membership",
    description: "Sale purchases, new members, rank reached.",
    kinds: ["purchase", "new-member", "rank-reached"],
  },
  {
    key: "archive",
    label: "Archive",
    description: "Permanent on-chain seats and artifact mints — First Signal, Patron Seal, future artifacts.",
    kinds: ["new-member", "nft-mint-first-signal", "nft-mint-patron-seal", "nft-mint-other"],
  },
  {
    key: "nft",
    label: "NFT mints",
    description: "Archive1155 mints — First Signal, Patron Seal, future artifacts.",
    kinds: ["nft-mint-first-signal", "nft-mint-patron-seal", "nft-mint-other"],
  },
  {
    key: "liquidity",
    label: "Liquidity",
    description: "LP swaps and pool changes on Trader Joe.",
    kinds: ["swap-buy", "swap-sell", "lp-add", "lp-remove"],
  },
  {
    key: "vault",
    label: "Vault",
    description: "Treasury USDC flows in and out of the Vault wallet.",
    kinds: ["vault-in", "vault-out"],
  },
  {
    key: "burn",
    label: "Proof of Burn",
    description: "Verified SYN burns — supply permanently removed via the dead address.",
    kinds: ["burn-founder", "burn-community"],
  },
];

export function getActivityFilterGroup(key: ActivityFilterKey): ActivityFilterGroup {
  return ACTIVITY_FILTER_GROUPS.find((g) => g.key === key) ?? ACTIVITY_FILTER_GROUPS[0];
}

export function applyActivityFilter(
  events: ProtocolEvent[],
  key: ActivityFilterKey,
): ProtocolEvent[] {
  const g = getActivityFilterGroup(key);
  if (g.kinds === "*") return events;
  const set = new Set(g.kinds);
  return events.filter((e) => set.has(e.kind));
}

export type ActivitySummary = {
  total: number;
  membership: number;
  archive: number;
  nft: number;
  liquidity: number;
  vault: number;
  burn: number;
  usdcSettledTotal: number;
  lastEventBlock?: bigint;
  lastEventTxHash?: string;
};

export function summarizeActivity(events: ProtocolEvent[]): ActivitySummary {
  let membership = 0;
  let archive = 0;
  let nft = 0;
  let liquidity = 0;
  let vault = 0;
  let burn = 0;
  let usdcSettledTotal = 0;
  for (const e of events) {
    if (e.kind === "purchase" || e.kind === "rank-reached") membership++;
    if (e.kind === "new-member") archive++;
    if (
      e.kind === "nft-mint-first-signal" ||
      e.kind === "nft-mint-patron-seal" ||
      e.kind === "nft-mint-other"
    ) { nft++; archive++; }
    if (
      e.kind === "swap-buy" ||
      e.kind === "swap-sell" ||
      e.kind === "lp-add" ||
      e.kind === "lp-remove"
    ) liquidity++;
    if (e.kind === "vault-in" || e.kind === "vault-out") vault++;
    if (e.kind === "burn-founder" || e.kind === "burn-community") burn++;
    if (typeof e.amountUsd === "number") usdcSettledTotal += e.amountUsd;
  }
  const first = events[0];
  return {
    total: events.length,
    membership,
    archive,
    nft,
    liquidity,
    vault,
    burn,
    usdcSettledTotal,
    lastEventBlock: first?.blockNumber,
    lastEventTxHash: first?.txHash,
  };
}
