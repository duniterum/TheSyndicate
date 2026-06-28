// THE SYNDICATE — PRODUCT OS STUDIO · CANONICAL PRODUCTION CONSTANTS (READ-ONLY)
//
// A typed, labeled projection of PRODUCTION_PROOF (src/lib/mock-data.ts) — the canonical
// on-chain constants copied VERBATIM from the production porting map. Everything here is
// READ-ONLY PRODUCTION PROOF: static references + canonical explorer links. The Studio
// reads no chain from this file, imports no ABI, and calls no contract. A LIVE read of any
// of these is performed (if at all) ONLY through the user's own wallet provider in
// wallet-adapter.ts or, for the burn-event scan, the read-only burn-proof-adapter.ts
// (BurnProofAdapter V1); other live event scans (e.g. purchase events) remain ADAPTER REQUIRED.
//
// NOTE ON DECIMALS: token decimals are intentionally NOT hardcoded for SYN. They are read
// LIVE (decimals()) through the user's provider before formatting a balance or calling
// wallet_watchAsset. If a live read is unavailable, the dependent action degrades to
// ADAPTER REQUIRED / NOT WIRED rather than inventing a value.

import { PRODUCTION_PROOF, snowtraceAddress, snowtraceTx } from "./mock-data";
import type { Status } from "@/components/ui/status-badge";

export const AVALANCHE = {
  chainId: PRODUCTION_PROOF.chainId, // 43114
  chainIdHex: "0xa86a",
  name: PRODUCTION_PROOF.chain, // "Avalanche C-Chain"
  // Canonical public Avalanche C-Chain network params. These are static REFERENCE values for
  // the future Codex-owned production adapter (see WalletAdapter in adapters.ts) and for human-
  // readable guidance. The Studio itself NEVER requests a network change — it does not call
  // wallet_switchEthereumChain or wallet_addEthereumChain. Wrong-network is manual guidance only.
  publicRpcUrl: "https://api.avax.network/ext/bc/C/rpc",
  explorerName: "Snowtrace",
  explorerUrl: "https://snowtrace.io",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
} as const;

export type ContractCategory =
  | "token"
  | "sale"
  | "registry"
  | "archive"
  | "routing"
  | "liquidity"
  | "burn";

export interface CanonicalContract {
  key: string;
  label: string;
  address: string;
  /** StatusBadge label — reused, never a parallel enum. */
  status: Status;
  category: ContractCategory;
  note: string;
  explorerUrl: string;
}

const proof = (address: string): { status: Status; explorerUrl: string } => ({
  status: "READ-ONLY PRODUCTION PROOF",
  explorerUrl: snowtraceAddress(address),
});

// Canonical, production-deployed contracts/addresses. Order is presentation order.
export const CANONICAL_CONTRACTS: CanonicalContract[] = [
  {
    key: "SYN",
    label: "SYN — accounting unit (ERC-20)",
    address: PRODUCTION_PROOF.syn,
    category: "token",
    note: "The protocol accounting unit. Acquired/anchored through membership — never a financial right, yield, or price promise.",
    ...proof(PRODUCTION_PROOF.syn),
  },
  {
    key: "USDC",
    label: "USDC — settlement asset (ERC-20)",
    address: PRODUCTION_PROOF.usdc,
    category: "token",
    note: "The settlement asset routed by the canonical 70% / 20% / 10% split.",
    ...proof(PRODUCTION_PROOF.usdc),
  },
  {
    key: "MembershipSaleV3",
    label: "MembershipSaleV3 — membership engine (active)",
    address: PRODUCTION_PROOF.membershipSaleV3,
    category: "sale",
    note: "The active membership engine. Approve + buy are production write paths and are NOT wired in the Studio.",
    ...proof(PRODUCTION_PROOF.membershipSaleV3),
  },
  {
    key: "MembershipSaleV1",
    label: "MembershipSaleV1 — historical (sealed)",
    address: PRODUCTION_PROOF.membershipSaleV1,
    category: "sale",
    note: "Historical sale engine, sealed. Read-only reference for provenance.",
    ...proof(PRODUCTION_PROOF.membershipSaleV1),
  },
  {
    key: "SourceRegistryV1",
    label: "SourceRegistryV1 — source policy (deployed, PAUSED)",
    address: PRODUCTION_PROOF.sourceRegistryV1,
    category: "registry",
    status: "PAUSED",
    explorerUrl: snowtraceAddress(PRODUCTION_PROOF.sourceRegistryV1),
    note: "Deployed, but source/referral policy is PAUSED. No public source link, no claim UI, default ZERO_SOURCE_ID.",
  },
  {
    key: "Archive1155",
    label: "Archive1155 — protocol memory (ERC-1155)",
    address: PRODUCTION_PROOF.archive1155,
    category: "archive",
    note: "Protocol memory only — never a seat, never financial rights, not source-aware. Live mint is NOT wired.",
    ...proof(PRODUCTION_PROOF.archive1155),
  },
  {
    key: "VaultWallet",
    label: "Vault routing wallet (70%)",
    address: PRODUCTION_PROOF.vaultWallet,
    category: "routing",
    note: "Destination for the 70% Vault share of Net USDC Routed.",
    ...proof(PRODUCTION_PROOF.vaultWallet),
  },
  {
    key: "LiquidityWallet",
    label: "Liquidity routing wallet (20%)",
    address: PRODUCTION_PROOF.liquidityWallet,
    category: "routing",
    note: "Destination for the 20% Liquidity share of Net USDC Routed.",
    ...proof(PRODUCTION_PROOF.liquidityWallet),
  },
  {
    key: "OperationsWallet",
    label: "Operations routing wallet (10%)",
    address: PRODUCTION_PROOF.operationsWallet,
    category: "routing",
    note: "Destination for the 10% Operations share of Net USDC Routed.",
    ...proof(PRODUCTION_PROOF.operationsWallet),
  },
  {
    key: "MembershipSynWallet",
    label: "Membership SYN wallet",
    address: PRODUCTION_PROOF.membershipSynWallet,
    category: "routing",
    note: "Holds SYN allocated to membership. Read-only reference.",
    ...proof(PRODUCTION_PROOF.membershipSynWallet),
  },
  {
    key: "TraderJoeLpPair",
    label: "Trader Joe SYN/USDC LP pair",
    address: PRODUCTION_PROOF.traderJoeLpPair,
    category: "liquidity",
    note: "Canonical SYN/USDC liquidity pair on Trader Joe (LFJ). External market tool — not a promised return.",
    ...proof(PRODUCTION_PROOF.traderJoeLpPair),
  },
  {
    key: "SynBurnAddress",
    label: "SYN burn address (Proof of Fire)",
    address: PRODUCTION_PROOF.synBurnAddress,
    category: "burn",
    note: "The canonical burn sink (0x…dEaD). Burn retires supply — never minted, never a price promise. The live burn-event scan is read-only via BurnProofAdapter V1.",
    ...proof(PRODUCTION_PROOF.synBurnAddress),
  },
];

export function getCanonicalContract(key: string): CanonicalContract | undefined {
  return CANONICAL_CONTRACTS.find((c) => c.key === key);
}

// Token metadata used by the wallet layer. Symbol is canonical (the porting map names the
// token SYN). Decimals are deliberately omitted — read live via decimals() before use.
export const SYN_TOKEN = {
  address: PRODUCTION_PROOF.syn,
  symbol: "SYN",
  explorerUrl: snowtraceAddress(PRODUCTION_PROOF.syn),
} as const;

export const USDC_TOKEN = {
  address: PRODUCTION_PROOF.usdc,
  symbol: "USDC",
  explorerUrl: snowtraceAddress(PRODUCTION_PROOF.usdc),
} as const;

// Proof of Fire #001 — verified founder burn, READ-ONLY PRODUCTION PROOF.
export const PROOF_OF_FIRE = {
  proofNumber: PRODUCTION_PROOF.proofOfFire001.proofNumber,
  amountSyn: PRODUCTION_PROOF.proofOfFire001.amountSyn,
  category: PRODUCTION_PROOF.proofOfFire001.category,
  txHash: PRODUCTION_PROOF.proofOfFire001.txHash,
  block: PRODUCTION_PROOF.proofOfFire001.block,
  burnAddress: PRODUCTION_PROOF.synBurnAddress,
  txExplorerUrl: snowtraceTx(PRODUCTION_PROOF.proofOfFire001.txHash),
  burnAddressExplorerUrl: snowtraceAddress(PRODUCTION_PROOF.synBurnAddress),
} as const;
