// ────────────────────────────────────────────────────────────────────────────
// DATA VERIFICATION REGISTRY — single source of truth for every metric
// exposed in the heartbeat strip and hero.
//
// Each entry answers four questions a sceptical visitor would ask:
//   1. What hook reads this number?
//   2. Where does the data actually come from (RPC / contract / address)?
//   3. What is its current trust status (LIVE / PARTIAL / PENDING)?
//   4. Where can I verify it myself, end-to-end?
//
// The mirror narrative document lives at:
//   docs/DATA_VERIFICATION_REGISTRY.md
// If you add or change an entry here, update that doc in the same PR.
// ────────────────────────────────────────────────────────────────────────────

import { CONTRACTS, LP_POOL, explorerUrlForAddress, MEMBER_DEFINITION } from "./syndicate-config";

export type VerificationStatus = "LIVE" | "PARTIAL" | "PENDING";

export type VerificationLink = { label: string; href: string };

export type MetricVerification = {
  /** Stable key — also used as the React key for the drawer. */
  key: string;
  /** Label shown in the drawer header (matches the cell label). */
  label: string;
  /** One-line plain explanation of WHAT this number represents. */
  description: string;
  /** Hook name in this repo that computes the value. */
  hook: string;
  /** Underlying data source in plain language. */
  source: string;
  /** Refresh cadence in human language. */
  refresh: string;
  /** Trust status — must match the pill rendered next to the cell. */
  status: VerificationStatus;
  /** Verification links — explorers, RPC reads, source contracts. */
  links: VerificationLink[];
  /** Optional note about empty / loading state semantics. */
  emptyState?: string;
};

const explorer = (addr: string, label: string): VerificationLink | null => {
  const href = explorerUrlForAddress(addr);
  return href ? { label, href } : null;
};

const dropNull = (xs: Array<VerificationLink | null>): VerificationLink[] =>
  xs.filter((x): x is VerificationLink => x !== null);

export const METRIC_REGISTRY: Record<string, MetricVerification> = {
  members: {
    key: "members",
    label: MEMBER_DEFINITION.label,
    description: MEMBER_DEFINITION.description,
    hook: "useHolderIndex (via useProtocolPulse)",
    source: MEMBER_DEFINITION.source,
    refresh: "Every 60 seconds; cached for 30 seconds.",
    status: "LIVE",
    emptyState: "Shows 0 until the first TokensPurchased event is mined.",
    links: dropNull([
      explorer(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, "Membership Sale contract"),
      explorer(CONTRACTS.SYN_CONTRACT_ADDRESS, "SYN contract"),
    ]),
  },
  usdcRaised: {
    key: "usdcRaised",
    label: "USDC Routed",
    description:
      "Cumulative USDC received by the Membership Sale contract since deployment — every buy() call adds to this total.",
    hook: "useSaleStats (via useProtocolPulse)",
    source:
      "Avalanche C-Chain RPC. Reads totalUsdcRaised() on the SyndicateMembershipSale contract.",
    refresh: "Every 60 seconds.",
    status: "LIVE",
    links: dropNull([
      explorer(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, "Sale contract"),
      explorer(CONTRACTS.USDC_CONTRACT_ADDRESS, "USDC contract"),
    ]),
  },
  vaultRouted: {
    key: "vaultRouted",
    label: "Vault Routed",
    description:
      "Live USDC balance sitting in the Vault Wallet. Every buy() routes 70% of the purchase atomically to this address.",
    hook: "useReadContracts → USDC.balanceOf(VAULT_WALLET)",
    source: "Avalanche C-Chain RPC. ERC20 balanceOf on the USDC contract.",
    refresh: "Every 60 seconds.",
    status: "LIVE",
    emptyState:
      "Reflects current balance, not lifetime inflow — outflows from the Vault Wallet (e.g. allocation to the programmatic Vault contract once deployed) will reduce this figure.",
    links: dropNull([
      explorer(CONTRACTS.VAULT_WALLET, "Vault Wallet"),
      explorer(CONTRACTS.USDC_CONTRACT_ADDRESS, "USDC contract"),
    ]),
  },
  lpTvl: {
    key: "lpTvl",
    label: "LP TVL",
    description:
      "Total value locked in the SYN/USDC Trader Joe pair — computed as (USDC reserve × 2) when SYN price is anchored from USDC reserve ÷ SYN reserve.",
    hook: "useLpStats (via useProtocolPulse)",
    source:
      "Avalanche C-Chain RPC. Calls getReserves() on the Trader Joe v1 SYN/USDC pair contract.",
    refresh: "Every 60 seconds.",
    status: "LIVE",
    links: dropNull([
      explorer(LP_POOL.pairAddress, "LP pair contract"),
      { label: "Trader Joe pool", href: LP_POOL.traderJoeUrl },
      {
        label: "DexScreener",
        href: `https://dexscreener.com/avalanche/${LP_POOL.pairAddress}`,
      },
    ]),
  },
  synSold: {
    key: "synSold",
    label: "SYN Sold",
    description:
      "Cumulative SYN tokens distributed by the Membership Sale contract — equals USDC routed ÷ 0.01.",
    hook: "useSaleStats (via useProtocolPulse)",
    source:
      "Avalanche C-Chain RPC. Reads totalSold() on the SyndicateMembershipSale contract.",
    refresh: "Every 60 seconds.",
    status: "LIVE",
    links: dropNull([
      explorer(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, "Sale contract"),
      explorer(CONTRACTS.MEMBERSHIP_SYN_WALLET, "Membership SYN wallet"),
    ]),
  },
  lastBuy: {
    key: "lastBuy",
    label: "Last Buy",
    description:
      "Time elapsed since the most recent TokensPurchased event emitted by the Membership Sale contract.",
    hook: "useLivePurchaseEvents (via useProtocolPulse)",
    source:
      "Avalanche C-Chain RPC. Scans recent blocks for TokensPurchased(buyer, usdcIn, synOut) events.",
    refresh: "Every 60 seconds.",
    status: "LIVE",
    emptyState: 'Renders "Awaiting first buy" if no event has been mined yet.',
    links: dropNull([
      explorer(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, "Sale contract"),
    ]),
  },
  nextMember: {
    key: "nextMember",
    label: "Next Member",
    description:
      "Founder archive number that will be assigned to the next unique wallet to buy SYN. Derived: members count + 1.",
    hook: "useHolderIndex (via useProtocolPulse)",
    source:
      "Derived deterministically from the Members count above. Not a separate on-chain read.",
    refresh: "Updates whenever the holder index refreshes (every 60s).",
    status: "LIVE",
    emptyState:
      'Shows "#1" before any wallet has bought; updates as soon as the first TokensPurchased event is indexed.',
    links: dropNull([
      explorer(CONTRACTS.SYN_CONTRACT_ADDRESS, "SYN contract"),
      explorer(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, "Sale contract"),
    ]),
  },
};

export function getMetricVerification(key: string): MetricVerification | undefined {
  return METRIC_REGISTRY[key];
}
