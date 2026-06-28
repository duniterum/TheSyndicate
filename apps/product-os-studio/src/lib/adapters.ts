/**
 * Adapter seams for The Syndicate — Product OS Studio.
 *
 * TYPE-ONLY. These describe the production-shaped contracts the Studio EXPECTS a future
 * Codex adapter layer to satisfy. They contain NO implementations, import NO production
 * code, and perform NO RPC / chain reads / wallet writes. Everything in the Studio today
 * is SIMULATED; these types document the seam where real production machinery (wagmi,
 * RPC, contracts) plugs in later.
 *
 * Real contract address VALUES now live in the Codex production-truth porting map
 * (docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md), which IS present. They are
 * surfaced in the Studio ONLY as clearly-labeled READ-ONLY PRODUCTION PROOF in a single
 * place (PRODUCTION_PROOF in src/lib/mock-data.ts). This file stays TYPE-ONLY — it holds
 * no address values and no implementations.
 *
 * See docs/STUDIO_ADAPTER_SEAMS.md and docs/STUDIO_PRODUCTION_ADAPTATION_PLAN.md.
 */

/** Posture of a Studio value/surface relative to production. */
export type AdapterStatus =
  | "SIMULATED"
  | "ADAPTER_REQUIRED"
  | "READ_ONLY_PROOF"
  | "NOT_WIRED";

// ---------------------------------------------------------------------------
// Wallet / connection (production: wagmiConfig, Web3Provider, useWalletGate)
// Canonical gate statuses mirror production useWalletGate exactly.
// ---------------------------------------------------------------------------
export type WalletState =
  | "unsupported" // no injected provider / unsupported environment
  | "disconnected" // provider present, no account
  | "wrongNetwork" // connected to a non-Avalanche chain
  | "ready" // account connected on Avalanche C-Chain, gate open
  | "stale"; // account drift / needs reconnect or refresh (WalletAccountSynchronizer)

export type ChainId = number;

export interface WalletSnapshot {
  state: WalletState;
  /** Checksum address when connected. SIMULATED in the Studio. */
  address?: string;
  chainId?: ChainId;
  isCorrectNetwork: boolean;
  /** The Studio frontend is never production authority. Always false. */
  isProductionAuth: false;
}

/**
 * Production seam: a future adapter wraps useWalletGate / WalletGate / wagmi.
 * Actions mirror the production gate: connectWallet, switchToAvalanche, reconnect, disconnect.
 * NONE are wired in the Studio.
 */
export interface WalletAdapter {
  getSnapshot(): WalletSnapshot;
  /** Begin a connect flow. NOT wired in the Studio. */
  connectWallet(): Promise<WalletSnapshot>;
  /** Request a switch to Avalanche C-Chain. NOT wired in the Studio. */
  switchToAvalanche(): Promise<void>;
  /** Re-establish a stale/drifted connection. NOT wired in the Studio. */
  reconnect(): Promise<WalletSnapshot>;
  disconnect(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Read-state vocabulary (production: RPC fallback, chain-time, freshness)
// ---------------------------------------------------------------------------
export type ReadState =
  | "idle"
  | "notConnected"
  | "wrongNetwork"
  | "loading"
  | "live"
  | "partial"
  // Read succeeded but an internal consistency check failed (e.g. an enumerated event-sum that
  // exceeds the authoritative on-chain balance it is reconciled against). Distinct from "partial":
  // the data is not merely incomplete, it is contradictory and must not be presented as truth.
  | "anomaly"
  | "stale"
  | "error"
  | "read-only-proof"
  | "adapter-required";

export interface ReadResult<T> {
  state: ReadState;
  data?: T;
  /** Source freshness when known (chain time / block height). */
  asOf?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Contract / address registry (production: canonical constants)
// ---------------------------------------------------------------------------
export type ContractRefStatus =
  | "READ-ONLY PRODUCTION PROOF" // canonical, production-deployed, read-only reference
  | "PAUSED" // deployed in production but paused (e.g. SourceRegistryV1 policy)
  | "PROTOTYPE PLACEHOLDER" // not a real value; demonstration only
  | "ADAPTER REQUIRED" // value/behavior supplied by a future adapter
  | "NOT WIRED"; // no interaction wired

export interface ContractRef {
  /** e.g. "SYN", "USDC", "MembershipSaleV3", "SourceRegistryV1", "Archive1155". */
  key: string;
  label: string;
  /**
   * Address VALUE, when present, is a READ-ONLY PRODUCTION PROOF constant copied from
   * the porting map (see PRODUCTION_PROOF in mock-data.ts). Never wire it to a live read
   * or write — a live read is ADAPTER REQUIRED. Prototype/future rows omit the address.
   */
  address?: string;
  status: ContractRefStatus;
  note?: string;
}

export interface ContractRegistryAdapter {
  list(): ReadResult<ContractRef[]>;
}

// ---------------------------------------------------------------------------
// Membership sale / purchase (production: LivePurchase, useSaleStats, useQuoteSyn)
// ---------------------------------------------------------------------------
export type PurchaseFlowStep =
  | "input"
  | "wrong-network"
  | "approve"
  | "approving"
  | "buy"
  | "pending"
  | "receipt"
  | "failed";

export interface SaleStats {
  minimumEntryUsdc: number;
  /** Live sale stats are ADAPTER REQUIRED. */
}

export interface QuotePreview {
  usdcIn: number;
  /** SYN acquired preview. */
  synOut: number;
  /** ZERO_SOURCE_ID for public/default buys. */
  defaultSourceId: string;
}

export interface MembershipSaleAdapter {
  getSaleStats(): ReadResult<SaleStats>;
  quote(usdcIn: number): ReadResult<QuotePreview>;
  /** Approve + buy are NOT wired in the Studio (no wallet write). */
  approveUsdc(amount: number): Promise<never>;
  buy(amount: number, sourceId: string): Promise<never>;
}

// ---------------------------------------------------------------------------
// Member index (production: purchase-event scanning, buildHolderIndex)
// ---------------------------------------------------------------------------
export type Chapter = string;

export interface MemberIndexEntry {
  address: string;
  /** "Member #N" — derived from sale purchase events in production. */
  designation: string;
  seatHeld: boolean;
  chapter: Chapter;
  capitalFootprintUsdc: number;
  /** Qualitative tier; not a rank for sale. */
  contributionDepth: string;
  synAcquired: number;
}

export interface MemberIndexAdapter {
  getByAddress(address: string): ReadResult<MemberIndexEntry | null>;
  list(): ReadResult<MemberIndexEntry[]>;
}

// ---------------------------------------------------------------------------
// Activity / receipts (production: useLivePurchaseEvents, useProtocolEvents)
// ---------------------------------------------------------------------------
export type ActivityType =
  | "membership"
  | "routing"
  | "archive"
  | "source"
  | "milestone";

export type ProofKind = "On-chain" | "ERC-1155" | "Internal" | "Protocol";

/** Canonical routing split: 70% / 20% / 10%. */
export interface RoutingSplit {
  vault: number; // 70%
  liquidity: number; // 20%
  operations: number; // 10%
}

export interface Receipt {
  txHash: string;
  usdcRouted: number;
  synAcquired: number;
  routing: RoutingSplit;
  /** ZERO_SOURCE_ID for public/default buys. */
  sourceId: string;
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  proof: ProofKind;
  receipt?: Receipt;
  timestamp: string;
}

/**
 * A raw membership purchase log event (production: scanned from MembershipSaleV3
 * purchase logs via useLivePurchaseEvents; feeds the member index + activity heartbeat).
 * Read-only projection — the Studio never emits one.
 */
export interface PurchaseEvent {
  txHash: string;
  buyer: string;
  usdcIn: number;
  synOut: number;
  routing: RoutingSplit;
  /** ZERO_SOURCE_ID for public/default buys. */
  sourceId: string;
  /** Block/chain time when known. */
  blockTime?: string;
}

export interface ActivityAdapter {
  recent(): ReadResult<ActivityEvent[]>;
  /** Read-only purchase-event scan. Live scan is ADAPTER REQUIRED. */
  purchases(): ReadResult<PurchaseEvent[]>;
}

// ---------------------------------------------------------------------------
// Source policy / referral (production: SourceRegistryV1, ZERO_SOURCE_ID)
// ---------------------------------------------------------------------------
export type SourcePolicyState = "PAUSED" | "ACTIVE" | "REVOKED";

export interface SourcePolicy {
  /** PAUSED today. One internal protocol-test source was returned to PAUSED. */
  state: SourcePolicyState;
  /** No public source link today. */
  publicLinkActive: false;
  /** No claim UI today. */
  claimUiActive: false;
  /** ZERO_SOURCE_ID for public/default buys. */
  defaultSourceId: string;
}

export interface SourcePolicyAdapter {
  getPolicy(): ReadResult<SourcePolicy>;
}

// ---------------------------------------------------------------------------
// Archive memory (production: Archive1155 read-only reads)
// ---------------------------------------------------------------------------
export interface ArchiveItem {
  id: string;
  title: string;
  standard: "ERC-1155"; // Archive1155
  /** Memory only — never a seat, never financial rights, never source-aware. */
  memoryOnly: true;
}

export interface ArchiveAdapter {
  list(): ReadResult<ArchiveItem[]>;
  /** Mint is NOT wired in the Studio. */
  mint(): Promise<never>;
}

// ---------------------------------------------------------------------------
// Burn proof / Proof of Fire (production: SYN_BURN_ADDRESS, useSynBurnEvents,
// assignProofOfFireNumbers, PROOF_OF_FIRE_001)
// ---------------------------------------------------------------------------
export interface BurnProof {
  /** e.g. "PROOF_OF_FIRE_001" — assigned by production numbering (assignProofOfFireNumbers). */
  proofNumber: string;
  /**
   * SYN_BURN_ADDRESS — a READ-ONLY PRODUCTION PROOF constant (0x…dEaD) copied from the
   * porting map. Reference only; the live burn-event scan is implemented read-only by the
   * concrete burn-proof-adapter.ts (BurnProofAdapter V1).
   */
  burnAddress?: string;
  synRetired: number;
  /** Burn retires supply; it is never minted and never a price promise. */
  priceImpact: null;
  timestamp: string;
}

export interface BurnProofAdapter {
  /** Read-only burn proofs. The live burn-event scan is implemented by the concrete burn-proof-adapter.ts (BurnProofAdapter V1). */
  proofs(): ReadResult<BurnProof[]>;
  // No execute(): burn execution is intentionally NOT part of the Studio seam.
}

// ---------------------------------------------------------------------------
// Transparency / economy (production: canonical routing, transparency surfaces)
// ---------------------------------------------------------------------------
export interface TransparencyTotals {
  /** Gross USDC in. */
  grossUsdc: number;
  /**
   * Acquisition cost — only applies when source attribution is later approved.
   * Gross USDC − acquisition = Net USDC Routed. Zero on default ZERO_SOURCE_ID buys.
   */
  acquisitionUsdc: number;
  /** Net USDC Routed = gross − acquisition. Split 70% / 20% / 10%. */
  netRoutedUsdc: number;
  /** Canonical split: 70% / 20% / 10% (Vault / Liquidity / Operations). */
  routing: RoutingSplit;
}

export interface TransparencyAdapter {
  totals(): ReadResult<TransparencyTotals>;
}
