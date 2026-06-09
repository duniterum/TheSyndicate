// ─── ArchiveIndexer — Mocked Interface for Future Contract/Indexer ───────
//
// SYN is the seat. Artifacts are the memory.
//
// This module defines the STABLE interface that the future NFT Archive
// indexer (or direct contract reads) will implement. Today it ships with
// a `MockArchiveIndexer` that returns honest empty/pending values for
// every query — no fake token IDs, no fake ownership, no fake counts,
// no fake eligibility.
//
// When the Archive contract is deployed:
//   1. Implement `LiveArchiveIndexer` against the deployed contract +
//      indexer (e.g. wagmi reads, subgraph, custom indexer).
//   2. Swap `getArchiveIndexer()` to return the live implementation.
//   3. `resolveTruthState()` in archive-truth-states.ts will start
//      returning LIVE_ON_AVALANCHE / DERIVED_FROM_ON_CHAIN_DATA without
//      any UI call-site changes.
//
// CONTRACT (do not break):
//   • Every method returns a Promise. Mock returns resolved promises
//     immediately, but call sites MUST await — no sync shortcuts.
//   • Every read is scoped (wallet, category, artifact, milestone).
//     There is no "list everything" read that could leak fake data.
//   • Every return shape includes `truthState`, so the UI never needs
//     to guess which of the four protocol-truth states applies.
//
// See:
//   src/lib/archive-truth-states.ts
//   docs/ARCHIVE_ENGINE_SPEC.md
//   docs/SMART_CONTRACTS_DEFERRED.md
//   docs/STEP_BY_STEP_FROM_HERE.md

import type { ArtifactCategoryId } from "./archive-config";
import {
  CATEGORY_FUTURE_BINDING,
  type FutureBinding,
  type TruthState,
} from "./archive-truth-states";

export type Address = `0x${string}`;
export type TxHash = `0x${string}`;

// ─── Read shapes ─────────────────────────────────────────────────────────

export interface ArtifactToken {
  /** On-chain token id once minted. Always undefined in mock. */
  tokenId?: string;
  /** Owner wallet once minted. Always undefined in mock. */
  owner?: Address;
  /** Mint tx hash once minted. Always undefined in mock. */
  mintTxHash?: TxHash;
  /** ISO timestamp of mint event. Always undefined in mock. */
  mintedAt?: string;
  /** tokenURI / metadata pointer once deployed. Always undefined in mock. */
  tokenURI?: string;
}

export interface CategoryQueryResult {
  categoryId: ArtifactCategoryId;
  truthState: TruthState;
  /** Total minted in this category. 0 + PENDING in mock. */
  totalMinted: number;
  /** Tokens for the queried wallet (if any). [] in mock. */
  ownedByWallet: ArtifactToken[];
  /** Future contract/indexer binding for this category. */
  binding: FutureBinding;
}

export interface ArtifactQueryResult {
  artifactId: string;
  truthState: TruthState;
  /** The on-chain token, if it exists. undefined in mock. */
  token?: ArtifactToken;
  /** True once the wallet has minted/claimed this artifact. false in mock. */
  ownedByWallet: boolean;
}

export interface EligibilityResult {
  truthState: TruthState;
  /** Eligible today? false in mock (no contract = no enforceable eligibility). */
  eligible: false | true;
  /** Why not, in human-readable form. */
  reason: string;
  /** Future binding describing how this will be computed on-chain. */
  binding: FutureBinding;
}

export interface MilestoneResult {
  milestoneId: string;
  truthState: TruthState;
  /** Did the milestone fire on-chain? false in mock. */
  reached: boolean;
  /** Trigger tx hash. undefined in mock. */
  triggerTxHash?: TxHash;
  /** ISO timestamp of trigger. undefined in mock. */
  reachedAt?: string;
}

// ─── The interface ───────────────────────────────────────────────────────
//
// This is the surface the UI is allowed to depend on. The mock and the
// future live implementation MUST both satisfy it identically.

export interface ArchiveIndexer {
  /** Roll-up read for a single artifact category, optionally scoped to a wallet. */
  getCategory(
    categoryId: ArtifactCategoryId,
    wallet?: Address,
  ): Promise<CategoryQueryResult>;

  /** Single artifact read, optionally scoped to a wallet for ownership. */
  getArtifact(
    artifactId: string,
    wallet?: Address,
  ): Promise<ArtifactQueryResult>;

  /** Eligibility check for a (wallet, artifact) pair. */
  checkEligibility(
    wallet: Address,
    artifactId: string,
  ): Promise<EligibilityResult>;

  /** All artifacts (across categories) currently owned by a wallet. [] in mock. */
  listOwnedArtifacts(wallet: Address): Promise<ArtifactToken[]>;

  /** Has a named protocol milestone fired on-chain? */
  getMilestone(milestoneId: string): Promise<MilestoneResult>;

  /** Marker for diagnostics / tests. */
  readonly kind: "mock" | "live";
}

// ─── Mock implementation ─────────────────────────────────────────────────
//
// Every read returns the honest pending shape. No invented data ever
// crosses this boundary.

function bindingFor(categoryId: ArtifactCategoryId): FutureBinding {
  return (
    CATEGORY_FUTURE_BINDING[categoryId] ?? {
      providerKind: "tbd",
      eventOrCall: "tbd",
      eligibility: "none",
      note: "No future binding declared yet for this category.",
    }
  );
}

export class MockArchiveIndexer implements ArchiveIndexer {
  readonly kind = "mock" as const;

  async getCategory(
    categoryId: ArtifactCategoryId,
    _wallet?: Address,
  ): Promise<CategoryQueryResult> {
    return {
      categoryId,
      truthState: "PENDING_SEAT_RECORD_CONTRACT",
      totalMinted: 0,
      ownedByWallet: [],
      binding: bindingFor(categoryId),
    };
  }

  async getArtifact(
    artifactId: string,
    _wallet?: Address,
  ): Promise<ArtifactQueryResult> {
    return {
      artifactId,
      truthState: "PENDING_SEAT_RECORD_CONTRACT",
      token: undefined,
      ownedByWallet: false,
    };
  }

  async checkEligibility(
    _wallet: Address,
    artifactId: string,
  ): Promise<EligibilityResult> {
    return {
      truthState: "PENDING_SEAT_RECORD_CONTRACT",
      eligible: false,
      reason:
        "Archive NFT contract is not deployed. Eligibility cannot be enforced or proven on-chain today.",
      // We don't know the category from artifactId in the mock; return a
      // generic deferred binding. The live indexer will resolve this from
      // the artifact's category metadata.
      binding: {
        providerKind: "tbd",
        eventOrCall: "tbd",
        eligibility: "none",
        note: `Eligibility binding will be resolved from artifact '${artifactId}' category metadata once the contract is live.`,
      },
    };
  }

  async listOwnedArtifacts(_wallet: Address): Promise<ArtifactToken[]> {
    return [];
  }

  async getMilestone(milestoneId: string): Promise<MilestoneResult> {
    return {
      milestoneId,
      truthState: "PENDING_SEAT_RECORD_CONTRACT",
      reached: false,
    };
  }
}

// ─── Singleton accessor ──────────────────────────────────────────────────
//
// Call sites do `getArchiveIndexer()` — never `new MockArchiveIndexer()`.
// When the live indexer ships, this is the single line that changes.

let _indexer: ArchiveIndexer | null = null;

export function getArchiveIndexer(): ArchiveIndexer {
  if (!_indexer) _indexer = new MockArchiveIndexer();
  return _indexer;
}

/** Test/integration hook: swap the indexer (e.g. inject the live one). */
export function __setArchiveIndexerForTesting(indexer: ArchiveIndexer): void {
  _indexer = indexer;
}
