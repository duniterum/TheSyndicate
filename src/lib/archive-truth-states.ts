// ─── Archive Truth States — Permanent Protocol Vocabulary ────────────────
//
// SYN is the seat. NFT Artifacts are the memory.
//
// This module is the SINGLE source of truth for the four public labels
// that every Archive surface (and every future NFT Archive contract +
// indexer) must speak:
//
//   LIVE_ON_AVALANCHE             — backed by a deployed contract, public
//                                   wallet, explorer link, or live RPC read.
//   DERIVED_FROM_ON_CHAIN_DATA    — computed from a live on-chain read or
//                                   indexed event log.
//   PENDING_SEAT_RECORD_CONTRACT  — requires the future
//                                   SyndicateSeatRecord721 contract.
//                                   Archive1155 is deployed; Seat Records
//                                   are not.
//   ROADMAP                       — future concept; no deployed contract or
//                                   enforceable eligibility today.
//
// These are NOT temporary UI labels. They are permanent protocol-truth
// states. Every badge, FAQ answer, timeline state, wallet state, and
// Archive surface MUST resolve to exactly one of these four states.
//
// The artifact-layer status vocabulary in `archive-config.ts`
// (PENDING_CONTRACT / PENDING_ELIGIBILITY / LOCKED / SECRET) is a
// PRESENTATION refinement of PENDING_SEAT_RECORD_CONTRACT — it never
// escapes the PENDING bucket until the Seat Record contract is deployed.
//
// CONTRACT INTEGRATION CONTRACT (when contracts ship):
//   1. Implement `resolveTruthState()` to actually query indexer state.
//   2. Replace `futureBinding` placeholders with real contract addresses
//      and event signatures.
//   3. The four-label API stays stable — UI does not need to change.
//
// See:
//   docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md
//   docs/ARCHIVE_ENGINE_SPEC.md
//   docs/SMART_CONTRACTS_DEFERRED.md
//   docs/STEP_BY_STEP_FROM_HERE.md
//   docs/PRE_CONTRACT_ALIGNMENT_AUDIT.md

import type { ArtifactStatus } from "./archive-config";

/** The four permanent protocol-truth states. */
export type TruthState =
  | "LIVE_ON_AVALANCHE"
  | "DERIVED_FROM_ON_CHAIN_DATA"
  | "PENDING_SEAT_RECORD_CONTRACT"
  | "ROADMAP";

export const TRUTH_STATE_LABEL: Record<TruthState, string> = {
  LIVE_ON_AVALANCHE:            "LIVE ON AVALANCHE",
  DERIVED_FROM_ON_CHAIN_DATA:   "DERIVED FROM ON-CHAIN DATA",
  PENDING_SEAT_RECORD_CONTRACT: "PENDING SEAT RECORD CONTRACT",
  ROADMAP:                      "ROADMAP",
};

export const TRUTH_STATE_HINT: Record<TruthState, string> = {
  LIVE_ON_AVALANCHE:
    "Backed by a deployed contract, public wallet, explorer link, or live RPC read on Avalanche today.",
  DERIVED_FROM_ON_CHAIN_DATA:
    "Computed from a live on-chain read or an indexed Avalanche event log.",
  PENDING_SEAT_RECORD_CONTRACT:
    "Requires the future SyndicateSeatRecord721 contract. Archive1155 is deployed; Seat Records are not.",
  ROADMAP:
    "Future concept. No deployed contract, indexer, or enforceable eligibility today.",
};

export const TRUTH_STATE_TONE: Record<TruthState, "success" | "navy" | "warning" | "muted"> = {
  LIVE_ON_AVALANCHE:            "success",
  DERIVED_FROM_ON_CHAIN_DATA:   "navy",
  PENDING_SEAT_RECORD_CONTRACT: "warning",
  ROADMAP:                      "muted",
};

// ─── Future contract / indexer binding shape ─────────────────────────────
//
// Every surface that today renders a PENDING_SEAT_RECORD_CONTRACT or
// ROADMAP badge declares — in code — the shape of the future data that
// will replace it. This is what makes integration "almost plug-and-play":
// when the contracts are deployed, the only change is wiring the real
// `provider` and `eventOrCall` values, and switching `truthState` to LIVE
// or DERIVED.

export type FutureBinding = {
  /** Where the data will come from once it exists. */
  providerKind:
    | "archive-nft-contract"
    | "seat-record-contract"
    | "indexer"
    | "membership-sale-contract"
    | "syn-erc20"
    | "lp-pair"
    | "routing-wallet"
    | "off-chain-registry"
    | "tbd";
  /** Read call or indexed event that will source the data. */
  eventOrCall:
    | "balanceOf"
    | "ownerOf"
    | "tokenOfOwnerByIndex"
    | "tokenURI"
    | "Transfer"
    | "Mint"
    | "TokensPurchased"
    | "ChapterSealed"
    | "MilestoneReached"
    | "LPEvent"
    | "ArtifactMinted"
    | "ArtifactClaimed"
    | "SeatRecordMinted"
    | "tbd";
  /** Eligibility source once enforceable. */
  eligibility:
    | "open-to-all"
    | "wallet-balance"
    | "purchase-history"
    | "chapter-of-joining"
    | "lp-position"
    | "milestone-trigger"
    | "discovery"
    | "none";
  /** Optional structured shape of the future data row this surface needs. */
  dataShape?: Record<string, "address" | "uint256" | "bytes32" | "string" | "bool">;
  /** Free-text engineering note for the smart-contract phase. */
  note?: string;
};

// ─── Mapping from artifact-layer status → public truth state ─────────────
//
// All artifact-layer statuses (other than ACTIVE_MINT_OPEN) live inside
// PENDING_SEAT_RECORD_CONTRACT today.

export function truthStateForArtifactStatus(s: ArtifactStatus): TruthState {
  switch (s) {
    case "ACTIVE_MINT_OPEN":
      return "LIVE_ON_AVALANCHE";
    case "CONFIGURED_NOT_ACTIVE":
    case "PENDING_CONTRACT":
    case "PENDING_ELIGIBILITY":
    case "LOCKED":
    case "SECRET":
      return "PENDING_SEAT_RECORD_CONTRACT";
  }
}

// ─── Default future bindings keyed by artifact category id ───────────────
//
// Mirrors `ARCHIVE_CATEGORIES` in archive-config.ts. When the relevant
// contract is deployed, replace `providerKind: "tbd"` with the real
// contract and wire the matching event.

export const CATEGORY_FUTURE_BINDING: Record<string, FutureBinding> = {
  chapter: {
    providerKind: "archive-nft-contract",
    eventOrCall: "ArtifactMinted",
    eligibility: "chapter-of-joining",
    dataShape: { tokenId: "uint256", chapterId: "uint256", owner: "address", tokenURI: "string" },
    note: "One artifact per chapter; window opens while chapter is active, closes on ChapterSealed.",
  },
  "seat-record": {
    providerKind: "seat-record-contract",
    eventOrCall: "SeatRecordMinted",
    eligibility: "purchase-history",
    dataShape: {
      tokenId: "uint256",
      memberNumber: "uint256",
      chapterId: "uint256",
      blockHeight: "uint256",
      buyer: "address",
      purchaseTxHash: "bytes32",
    },
    note: "Optional post-purchase Seat Record on the future SyndicateSeatRecord721 contract. Indexer derives memberNumber from TokensPurchased order.",
  },
  "founder-mark": {
    providerKind: "archive-nft-contract",
    eventOrCall: "ArtifactMinted",
    eligibility: "purchase-history",
    dataShape: { tokenId: "uint256", recipient: "address", reason: "string" },
    note: "Eligibility computed off-chain from Genesis-era TokensPurchased + manual recognition list, then enforced on-chain via merkle root or admin allowlist.",
  },
  milestone: {
    providerKind: "archive-nft-contract",
    eventOrCall: "MilestoneReached",
    eligibility: "milestone-trigger",
    dataShape: { tokenId: "uint256", milestoneId: "bytes32", triggerTxHash: "bytes32" },
    note: "Auto-claimable when the named on-chain milestone fires (First Member, Genesis Signal sealed, First Thousand sealed, etc).",
  },
  liquidity: {
    providerKind: "lp-pair",
    eventOrCall: "LPEvent",
    eligibility: "lp-position",
    dataShape: { tokenId: "uint256", lpEventTxHash: "bytes32", jlpBalanceAtBlock: "uint256" },
    note: "Eligibility derived from Trader Joe SYN/USDC JLP balance at the trigger block.",
  },
  "protocol-milestone": {
    providerKind: "archive-nft-contract",
    eventOrCall: "MilestoneReached",
    eligibility: "milestone-trigger",
    dataShape: { tokenId: "uint256", milestoneId: "bytes32", proofTxHash: "bytes32" },
    note: "Collectible record of public protocol activity. Confers no Vault/treasury/revenue ownership.",
  },
  patron: {
    providerKind: "archive-nft-contract",
    eventOrCall: "ArtifactMinted",
    eligibility: "open-to-all",
    dataShape: { tokenId: "uint256", supporter: "address", amountUsdc: "uint256" },
    note: "Flat single support amount. No tiers, no rank, no entitlement.",
  },
  secret: {
    providerKind: "archive-nft-contract",
    eventOrCall: "ArtifactClaimed",
    eligibility: "discovery",
    dataShape: { tokenId: "uint256", finder: "address", secretId: "bytes32" },
    note: "Not advertised. Found, not granted. Discovery proof verified on-chain.",
  },
  legacy: {
    providerKind: "archive-nft-contract",
    eventOrCall: "ArtifactMinted",
    eligibility: "purchase-history",
    dataShape: { tokenId: "uint256", chapterId: "uint256", sealedAtBlock: "uint256" },
    note: "Released only after the associated chapter or era is sealed.",
  },
};

// ─── Resolver stub for the smart-contract phase ──────────────────────────
//
// Today this is a pure function: every artifact-layer surface resolves to
// PENDING_SEAT_RECORD_CONTRACT. When the relevant contract is deployed,
// replace the body with the indexer query — the call sites do not change.

export function resolveTruthState(input: {
  artifactStatus?: ArtifactStatus;
  /** Reserved for the smart-contract phase. */
  walletAddress?: `0x${string}`;
  /** Reserved for the smart-contract phase. */
  categoryId?: string;
}): TruthState {
  if (input.artifactStatus) {
    return truthStateForArtifactStatus(input.artifactStatus);
  }
  return "PENDING_SEAT_RECORD_CONTRACT";
}

/**
 * Async resolver that consults the `ArchiveIndexer` interface. Today the
 * mock indexer always returns `PENDING_SEAT_RECORD_CONTRACT`, so this
 * behaves identically to `resolveTruthState()`. When the live indexer
 * ships, this function will return `LIVE_ON_AVALANCHE` /
 * `DERIVED_FROM_ON_CHAIN_DATA` without any UI call-site changes beyond
 * awaiting the promise.
 *
 * Lazy import to avoid a static cycle between this module and
 * `archive-indexer.ts` (which imports `TruthState` + `FutureBinding` from
 * here).
 */
export async function resolveTruthStateAsync(input: {
  artifactStatus?: ArtifactStatus;
  walletAddress?: `0x${string}`;
  categoryId?: string;
  artifactId?: string;
}): Promise<TruthState> {
  const { getArchiveIndexer } = await import("./archive-indexer");
  const indexer = getArchiveIndexer();

  if (input.artifactId) {
    const r = await indexer.getArtifact(
      input.artifactId,
      input.walletAddress,
    );
    return r.truthState;
  }
  if (input.categoryId) {
    const r = await indexer.getCategory(
      input.categoryId as never,
      input.walletAddress,
    );
    return r.truthState;
  }
  return resolveTruthState(input);
}
