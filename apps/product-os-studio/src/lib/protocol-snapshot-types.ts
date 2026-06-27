// THE SYNDICATE — PRODUCT OS STUDIO · PROTOCOL SNAPSHOT TYPES
//
// Types for a READ-ONLY, provider-less protocol snapshot (see protocol-snapshot-adapter.ts).
// Every value described here is either a LIVE READ (real, read-only on-chain value) or a
// clearly labeled gap (ADAPTER REQUIRED). There is no write/sign/approve/network-switch shape
// anywhere in this layer — by design.

import type { ReadState } from "./adapters";

export type { ReadState };

/** Which protocol surface a balance fact belongs to (for grouped, filtered rendering). */
export type SnapshotGroup =
  | "chain"
  | "routing"
  | "sale"
  | "membership"
  | "burn"
  | "liquidity";

export type SnapshotTokenSymbol = "SYN" | "USDC";

/** Live chain context — eth_chainId + eth_blockNumber against the public RPC. */
export interface ChainContextFact {
  chainId: number;
  chainIdHex: string;
  expectedChainId: number;
  isExpectedChain: boolean;
  name: string;
  /** null when the block height read failed (chain id still succeeded). */
  blockNumber: number | null;
  rpcUrl: string;
  rpcHost: string;
}

/** A single live, read-only ERC-20 balanceOf result, formatted by a LIVE decimals() read. */
export interface TokenBalanceFact {
  key: string;
  label: string;
  group: SnapshotGroup;
  /** Canonical contract key of the holder (CANONICAL_CONTRACTS). */
  holderKey: string;
  holderAddress: string;
  holderExplorerUrl: string;
  token: SnapshotTokenSymbol;
  tokenAddress: string;
  /** Read live via decimals() — never hardcoded. */
  decimals: number;
  /** Raw integer amount as a base-10 string (serializable). */
  raw: string;
  /** Human-formatted amount (≤4 dp, thousands separators). */
  formatted: string;
  /** Honest, non-misleading description of exactly what this number is (and is not). */
  note: string;
}

/** A fact the Studio intentionally does NOT read live — labeled ADAPTER REQUIRED. */
export interface AdapterRequiredFact {
  key: string;
  label: string;
  reason: string;
}

export interface ProtocolSnapshot {
  /** Aggregate read state across the whole snapshot. */
  state: ReadState;
  /** ISO timestamp of when this snapshot was successfully read this session. */
  asOf?: string;
  chain: ChainContextFact | null;
  balances: TokenBalanceFact[];
  /** Facts intentionally left to a future adapter (member count, era, paused, burn scan). */
  adapterRequired: AdapterRequiredFact[];
  /** Non-fatal, per-read error messages collected while building the snapshot. */
  errors: string[];
  rpcUrl: string;
  rpcHost: string;
}
