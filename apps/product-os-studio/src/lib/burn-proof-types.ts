// THE SYNDICATE — PRODUCT OS STUDIO · BURN PROOF (PROOF OF FIRE) TYPES
//
// Types for a READ-ONLY, provider-less "Proof of Fire" read model (see burn-proof-adapter.ts).
// It enumerates real SYN burns (ERC-20 Transfer → the canonical burn sink 0x…dEaD) via a
// bounded, chunked eth_getLogs scan, and proves completeness by RECONCILIATION: the authoritative
// cumulative burned total is the LIVE balanceOf(burn sink) (a sink only receives — its balance is
// every SYN ever burned). When the enumerated event values sum EXACTLY to that live balance, every
// burn is provably accounted for and the list is "complete". Otherwise it is honestly "partial".
// Nothing here writes, signs, approves, switches networks, or moves funds — by design.

import type { ReadState } from "./adapters";

export type { ReadState };

/** A single read-only burn event (ERC-20 Transfer of SYN → the burn sink). */
export interface BurnEventFact {
  /** Deterministic Proof of Fire number, 1-based, ordered by ascending (block, logIndex). */
  proofNumber: number;
  /** Display label, e.g. "PROOF_OF_FIRE_001". */
  proofLabel: string;
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
  /** The wallet that retired the SYN (Transfer topics[1]). */
  from: string;
  /** Raw integer SYN amount as a base-10 string (serializable). */
  raw: string;
  /** Human-formatted SYN amount, using a LIVE decimals() read (never hardcoded). */
  formatted: string;
  /** Read-only Snowtrace links — reference only, nothing wired. */
  txExplorerUrl: string;
  fromExplorerUrl: string;
  /** True when this event is the canonical, porting-map PROOF_OF_FIRE_001 (live confirmation). */
  isProofOfFire001: boolean;
}

/** Completeness posture of the enumerated event list relative to the authoritative balance. */
export type BurnScanCompleteness =
  | "not-scanned" // enumeration has not been run yet (authoritative cumulative may still be live)
  | "complete" // reconciled: sum(events) === live balanceOf(burn sink); every burn is accounted for
  | "partial" // sum(events) < balance: cap hit / chunk failure / burns outside the scanned range
  | "anomaly"; // sum(events) > balance: unexpected — never claimed complete

/** What the bounded scan actually covered (for honest, non-overstated labeling). */
export interface BurnScanCoverage {
  fromBlock: number;
  /** Highest block actually covered by a successful chunk. */
  toBlock: number;
  headBlock: number;
  chunkSize: number;
  chunksPlanned: number;
  chunksScanned: number;
  chunksFailed: number;
  /** True when the scan covered through chain head. */
  reachedHead: boolean;
  /** True when the scan stopped early because reconciliation was already achieved. */
  earlyExitReconciled: boolean;
  /** True when the maxChunks cap truncated the plan before chain head. */
  capHit: boolean;
}

export interface BurnProofReadModel {
  /** Aggregate read state. */
  state: ReadState;
  /** ISO timestamp of when this model was successfully read this session. */
  asOf?: string;

  // ---- live chain context -------------------------------------------------
  chainId: number | null;
  chainIdHex: string | null;
  expectedChainId: number;
  isExpectedChain: boolean;
  chainName: string;
  headBlock: number | null;
  /** LIVE decimals() for SYN — never hardcoded. null if unreadable. */
  decimals: number | null;

  // ---- authoritative cumulative burned (live balanceOf of the burn sink) --
  /** Raw integer cumulative burned SYN as a base-10 string. null if unreadable. */
  cumulativeRaw: string | null;
  cumulativeFormatted: string | null;

  // ---- addresses ----------------------------------------------------------
  burnAddress: string;
  burnAddressExplorerUrl: string;
  tokenAddress: string;
  tokenExplorerUrl: string;

  // ---- enumerated events + reconciliation ---------------------------------
  /** Enumerated burn events (empty until a scan runs). Ascending by (block, logIndex). */
  events: BurnEventFact[];
  /** Sum of enumerated event values, base-10 string. */
  eventsSumRaw: string;
  eventsSumFormatted: string;
  completeness: BurnScanCompleteness;
  /** True iff completeness === "complete". */
  reconciled: boolean;
  coverage: BurnScanCoverage | null;

  /** Non-fatal, per-read error messages collected while building the model. */
  errors: string[];
  rpcUrl: string;
  rpcHost: string;
}
