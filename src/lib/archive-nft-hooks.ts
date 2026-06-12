// Read-only on-chain hooks for SyndicateArchive1155 V1.
//
// Doctrine: never fabricate. Each call is allowFailure=true; failures surface
// as per-id `errors` so the UI can show "Read pending/error" honestly.
// No write paths. No mint, approve, or admin calls live here.
//
// See docs/CONTRACT_INTEGRATION_STATUS.md and docs/DEPLOYMENT_STATE_V1.md.
import { useAccount, useReadContracts } from "wagmi";
import { ARCHIVE_NFT_CONTRACT_ADDRESS } from "./syndicate-config";
import {
  ARCHIVE_NFT_ABI,
  REFERENCE_WALLET,
  normalizeArtifactCore,
  type ArchiveArtifact,
} from "./archive-nft-abi";

const ADDR = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;

export type ArchiveIdRead = {
  id: number;
  remainingSupply: bigint | undefined;
  isMintableConnected: boolean | undefined;
  isMintableReference: boolean | undefined;
  artifact: ArchiveArtifact | undefined;
  errors: {
    remainingSupply: string | null;
    isMintableConnected: string | null;
    isMintableReference: string | null;
    artifact: string | null;
  };
};

export type ArchiveReadsResult = {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  dataUpdatedAt: number | undefined; // ms epoch of last successful aggregate read
  errorUpdatedAt: number | undefined;
  refetch: () => void;
  connectedWallet: `0x${string}` | undefined;
  reads: Record<number, ArchiveIdRead>;
  // Global Pausable.paused() flag for the Archive1155 contract.
  // `undefined` means UNKNOWN — either still loading OR the read failed;
  // distinguish the two via `pausedError`. Truth-sensitive UI must NOT collapse
  // an unknown pause state into "not paused" / mint-open: the cockpit collector
  // requires an explicit `paused === false` before asserting ACTIVE · MINT OPEN
  // (an unreadable pause degrades to PAUSE UNREADABLE, never Collect), and the
  // mint write-path likewise refuses to proceed when pause is undefined.
  paused: boolean | undefined;
  pausedError: string | null;
};

const errMsg = (e: unknown): string => {
  if (!e) return "Read failed";
  if (typeof e === "string") return e;
  if (e instanceof Error) {
    // viem errors have long stacks — keep the short name.
    const m = e.message.split("\n")[0]?.trim();
    return m && m.length < 140 ? m : "Read failed";
  }
  return "Read failed";
};

/**
 * Aggregate read of remainingSupply, isMintable (connected + reference wallet),
 * and getArtifactCore for each requested id. Always refetches every 60s.
 */
export function useArchiveArtifactReads(ids: readonly number[]): ArchiveReadsResult {
  const { address } = useAccount();

  // Build a flat call list, 4 calls per id, plus a trailing `paused()`
  // global call. Indexing stays stable per id (4 slots), paused is the
  // very last entry in the response array.
  const perIdContracts = ids.flatMap((id) => {
    const idBn = BigInt(id);
    return [
      // 0: remainingSupply
      {
        address: ADDR,
        abi: ARCHIVE_NFT_ABI,
        functionName: "remainingSupply",
        args: [idBn],
      },
      // 1: isMintable for reference (zero) wallet — always callable
      {
        address: ADDR,
        abi: ARCHIVE_NFT_ABI,
        functionName: "isMintable",
        args: [idBn, REFERENCE_WALLET, 1n],
      },
      // 2: isMintable for connected wallet — only when connected
      {
        address: ADDR,
        abi: ARCHIVE_NFT_ABI,
        functionName: "isMintable",
        args: [idBn, (address ?? REFERENCE_WALLET) as `0x${string}`, 1n],
      },
      // 3: getArtifactCore tuple. Deployed ABI does not expose getArtifact().
      {
        address: ADDR,
        abi: ARCHIVE_NFT_ABI,
        functionName: "getArtifactCore",
        args: [idBn],
      },
    ] as const;
  });

  const contracts = [
    ...perIdContracts,
    // Global Pausable.paused() — allowFailure handles ABIs without paused().
    {
      address: ADDR,
      abi: ARCHIVE_NFT_ABI,
      functionName: "paused",
      args: [],
    } as const,
  ];

  const q = useReadContracts({
    allowFailure: true,
    contracts,
    // Faster refetch than the old 60s — after `setDropActive(3, true)` lands
    // on-chain we want the UI to flip from "Not active yet" to the mint flow
    // within ~20s without requiring a manual reload.
    query: { refetchInterval: 20_000, staleTime: 10_000 },
  });

  const reads: Record<number, ArchiveIdRead> = {};
  ids.forEach((id, idx) => {
    const base = idx * 4;
    const rem = q.data?.[base + 0];
    const refMint = q.data?.[base + 1];
    const conMint = q.data?.[base + 2];
    const art = q.data?.[base + 3];

    const remainingSupply =
      rem && rem.status === "success" ? (rem.result as unknown as bigint) : undefined;
    const isMintableReference =
      refMint && refMint.status === "success" ? (refMint.result as unknown as boolean) : undefined;
    const isMintableConnected =
      address && conMint && conMint.status === "success"
        ? (conMint.result as unknown as boolean)
        : undefined;
    const artifact =
      art && art.status === "success" ? normalizeArtifactCore(art.result) : undefined;

    reads[id] = {
      id,
      remainingSupply,
      isMintableReference,
      isMintableConnected,
      artifact,
      errors: {
        remainingSupply:
          rem && rem.status === "failure" ? errMsg(rem.error) : null,
        isMintableReference:
          refMint && refMint.status === "failure" ? errMsg(refMint.error) : null,
        isMintableConnected:
          address && conMint && conMint.status === "failure"
            ? errMsg(conMint.error)
            : null,
        artifact:
          art && art.status === "failure" ? errMsg(art.error) : null,
      },
    };
  });

  // paused() lives at the very end of the response array.
  const pausedIdx = ids.length * 4;
  const pausedSlot = q.data?.[pausedIdx];
  const paused =
    pausedSlot && pausedSlot.status === "success"
      ? (pausedSlot.result as unknown as boolean)
      : undefined;
  const pausedError =
    pausedSlot && pausedSlot.status === "failure" ? errMsg(pausedSlot.error) : null;

  return {
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    dataUpdatedAt: q.dataUpdatedAt || undefined,
    errorUpdatedAt: q.errorUpdatedAt || undefined,
    refetch: () => {
      void q.refetch();
    },
    connectedWallet: address,
    reads,
    paused,
    pausedError,
  };
}

// ── NFT-revenue destination reads (Batch 3b) ────────────────────────────────
// owner() = who may withdraw; treasury() = where withdrawUSDC pays out (the
// actual revenue destination). Both allowFailure=true: an unreadable address
// surfaces as `undefined` so the UI shows PENDING — never a fabricated address.
// This reads the DESTINATION only; cumulative NFT revenue has no single
// on-chain read and stays PENDING by doctrine.
export type ArchiveOwnershipRead = {
  owner: `0x${string}` | undefined;
  treasury: `0x${string}` | undefined;
  errors: { owner: string | null; treasury: string | null };
  isLoading: boolean;
};

export function useArchiveOwnership(): ArchiveOwnershipRead {
  const q = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: ADDR, abi: ARCHIVE_NFT_ABI, functionName: "owner", args: [] },
      { address: ADDR, abi: ARCHIVE_NFT_ABI, functionName: "treasury", args: [] },
    ],
    query: { refetchInterval: 60_000, staleTime: 30_000 },
  });

  const ownerSlot = q.data?.[0];
  const treasurySlot = q.data?.[1];

  const owner =
    ownerSlot && ownerSlot.status === "success"
      ? (ownerSlot.result as unknown as `0x${string}`)
      : undefined;
  const treasury =
    treasurySlot && treasurySlot.status === "success"
      ? (treasurySlot.result as unknown as `0x${string}`)
      : undefined;

  return {
    owner,
    treasury,
    errors: {
      owner: ownerSlot && ownerSlot.status === "failure" ? errMsg(ownerSlot.error) : null,
      treasury:
        treasurySlot && treasurySlot.status === "failure" ? errMsg(treasurySlot.error) : null,
    },
    isLoading: q.isLoading,
  };
}

export function formatRelativeTime(ms: number | undefined): string {
  if (!ms) return "—";
  const diff = Date.now() - ms;
  if (diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 5)  return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
