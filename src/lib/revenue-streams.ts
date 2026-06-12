// ─── Revenue Streams Registry (Batch 3b) ───────────────────────────────────
// THE canonical, person-free enumeration of the protocol's income streams and
// their distinct on-chain destinations. Pure-data leaf: imports only
// syndicate-config, asserts no balances, reads no chain.
//
// Doctrine (docs/canon; .agents/memory/revenue-routing-by-stream.md):
//   • The canonical 70 / 20 / 10 split is enforced ON-CHAIN inside the
//     Membership Sale contract and applies ONLY to that stream. NFT mints and
//     LP fees are SEPARATE streams with their own destinations — never conflate.
//   • Every figure maps to an on-chain read or is labeled PENDING. A destination
//     can be LIVE (a readable address) while its cumulative figure stays PENDING.
//   • No yield / ROI / dividend framing. SYN holders have no claim on any stream.
import { USDC_ROUTING, VAULT_ALLOCATION, type ContractKey } from "./syndicate-config";

export type RevenueStreamId = "membership-sale" | "nft-mints" | "lp-fees";

/** "live" = a figure is readable on-chain today; "pending" = the destination is
 *  known but the amount has NO single on-chain read and is never estimated. */
export type RevenueAmountStatus = "live" | "pending";

export type RevenueStreamLink = {
  label: string;
  /** Reference into CONTRACTS — the component resolves the explorer URL. */
  contractKey: ContractKey;
};

export type RevenueStream = {
  id: RevenueStreamId;
  label: string;
  /** Person-free description of where the money comes from. */
  source: string;
  /** Where the proceeds go on-chain. */
  destination: string;
  /** TRUE only for the Membership Sale — the 70/20/10 split is sale-only. */
  routedThroughMembershipSplit: boolean;
  amountStatus: RevenueAmountStatus;
  /** Honest note about exactly what is and isn't readable on-chain. */
  note: string;
  proofLinks: readonly RevenueStreamLink[];
};

/** The canonical 70/20/10 split, projected from USDC_ROUTING (single source). */
export const MEMBERSHIP_SPLIT: readonly { label: string; pct: number; contractKey: ContractKey }[] =
  USDC_ROUTING.map((r) => ({ label: r.label, pct: r.pct, contractKey: r.key as ContractKey }));

export const REVENUE_STREAMS: readonly RevenueStream[] = [
  {
    id: "membership-sale",
    label: "Membership Sale",
    source: "Members buy SYN with USDC through the Membership Sale contract.",
    destination:
      "Split on-chain across the Vault (70%), Liquidity (20%), and Operations (10%) wallets.",
    routedThroughMembershipSplit: true,
    amountStatus: "live",
    note: "The split is enforced inside the Membership Sale contract — the only stream that uses 70 / 20 / 10. Sale volume is readable on-chain.",
    proofLinks: [
      { label: "Vault Wallet", contractKey: "VAULT_WALLET" },
      { label: "Liquidity Wallet", contractKey: "LIQUIDITY_WALLET" },
      { label: "Operations Wallet", contractKey: "OPERATIONS_WALLET" },
    ],
  },
  {
    id: "nft-mints",
    label: "Archive mints",
    source:
      "Collectors mint Archive artifacts (e.g. The First Signal, the Patron Seal) with USDC.",
    destination:
      "Proceeds accrue to the Archive contract and are withdrawable by its owner to the contract treasury address.",
    routedThroughMembershipSplit: false,
    amountStatus: "pending",
    note: "Separate stream — it does not pass through the 70 / 20 / 10 split. The destination addresses (owner, treasury) are readable on-chain; a single cumulative figure is not, so it stays PENDING rather than estimated.",
    proofLinks: [{ label: "Archive contract", contractKey: "ARCHIVE_NFT_CONTRACT_ADDRESS" }],
  },
  {
    id: "lp-fees",
    label: "LP trading fees",
    source:
      "Trades against the Trader Joe SYN/USDC pair generate liquidity-provider fees.",
    destination:
      "Fees compound into the pair reserves; the protocol's LP position (JLP) is held by the Liquidity Wallet.",
    routedThroughMembershipSplit: false,
    amountStatus: "pending",
    note: "Separate stream — it does not pass through the 70 / 20 / 10 split. A Uniswap-V2-style pair exposes no per-position accrued-fee read, so the amount is PENDING and is never computed or estimated.",
    proofLinks: [
      { label: "SYN/USDC pair", contractKey: "LP_PAIR_ADDRESS" },
      { label: "Liquidity Wallet", contractKey: "LIQUIDITY_WALLET" },
    ],
  },
] as const;

/** Sanity: the projected membership split always reflects VAULT_ALLOCATION. */
export const MEMBERSHIP_SPLIT_MATCHES_ALLOCATION =
  MEMBERSHIP_SPLIT[0]?.pct === Math.round(VAULT_ALLOCATION.vaultAssets * 100) &&
  MEMBERSHIP_SPLIT[1]?.pct === Math.round(VAULT_ALLOCATION.liquidityReinforcement * 100) &&
  MEMBERSHIP_SPLIT[2]?.pct === Math.round(VAULT_ALLOCATION.operationsCommunity * 100);
