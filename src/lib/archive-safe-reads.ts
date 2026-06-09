// Per-call safe re-read for Archive1155 reads — used when the aggregate
// multicall fails or returns a malformed tuple. Each call is an independent
// `useReadContract`, so a single revert no longer poisons the whole panel.
//
// READ-ONLY. Refetches every 60s. Decoded with the same strict validator
// (decodeArtifactCore) as the multicall path so the two are guaranteed to
// agree about whether the tuple is well-formed.
import { useAccount, useReadContract } from "wagmi";
import { ARCHIVE_NFT_ABI, REFERENCE_WALLET, decodeArtifactCore } from "./archive-nft-abi";
import { ARCHIVE_NFT_CONTRACT_ADDRESS } from "./syndicate-config";

const ADDR = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;

export type SafeReadStatus = "pending" | "ok" | "error";
export type SafeReadResult<T> = {
  status: SafeReadStatus;
  value: T | undefined;
  error: string | null;
  updatedAt: number | undefined;
};

const errMsg = (e: unknown): string => {
  if (!e) return "Read failed";
  if (typeof e === "string") return e;
  if (e instanceof Error) {
    const m = e.message.split("\n")[0]?.trim();
    return m && m.length < 200 ? m : "Read failed";
  }
  return "Read failed";
};

function toSafe<T>(q: {
  data: unknown;
  error: unknown;
  isLoading: boolean;
  isError: boolean;
  dataUpdatedAt: number;
}, transform?: (v: unknown) => T | undefined): SafeReadResult<T> {
  if (q.isLoading) return { status: "pending", value: undefined, error: null, updatedAt: undefined };
  if (q.isError) return { status: "error", value: undefined, error: errMsg(q.error), updatedAt: undefined };
  const value = transform ? transform(q.data) : (q.data as T | undefined);
  return { status: "ok", value, error: null, updatedAt: q.dataUpdatedAt || undefined };
}

const COMMON = { query: { refetchInterval: 60_000, staleTime: 30_000 } as const };

export function useArchiveSafeReads(id: number) {
  const { address } = useAccount();
  const idBn = BigInt(id);
  const wallet = (address ?? REFERENCE_WALLET) as `0x${string}`;

  const remainingSupply = useReadContract({
    address: ADDR, abi: ARCHIVE_NFT_ABI,
    functionName: "remainingSupply", args: [idBn], ...COMMON,
  });
  const isMintableConnected = useReadContract({
    address: ADDR, abi: ARCHIVE_NFT_ABI,
    functionName: "isMintable", args: [idBn, wallet, 1n], ...COMMON,
  });
  const isMintableReference = useReadContract({
    address: ADDR, abi: ARCHIVE_NFT_ABI,
    functionName: "isMintable", args: [idBn, REFERENCE_WALLET, 1n], ...COMMON,
  });
  const artifactCore = useReadContract({
    address: ADDR, abi: ARCHIVE_NFT_ABI,
    functionName: "getArtifactCore", args: [idBn], ...COMMON,
  });
  const uri = useReadContract({
    address: ADDR, abi: ARCHIVE_NFT_ABI,
    functionName: "uri", args: [idBn], ...COMMON,
  });
  const walletRemaining = useReadContract({
    address: ADDR, abi: ARCHIVE_NFT_ABI,
    functionName: "walletRemaining", args: [idBn, wallet], ...COMMON,
  });

  // Decode tuple with strict validator. If validation fails, surface the
  // structured reason as the error so the health panel shows the truth.
  const artifactSafe: SafeReadResult<ReturnType<typeof decodeArtifactCore>> = (() => {
    if (artifactCore.isLoading) return { status: "pending", value: undefined, error: null, updatedAt: undefined };
    if (artifactCore.isError)
      return { status: "error", value: undefined, error: errMsg(artifactCore.error), updatedAt: undefined };
    const decoded = decodeArtifactCore(artifactCore.data);
    if (!decoded.ok) {
      return {
        status: "error", value: decoded, error: `Decode failed: ${decoded.error.reason}`,
        updatedAt: artifactCore.dataUpdatedAt || undefined,
      };
    }
    return { status: "ok", value: decoded, error: null, updatedAt: artifactCore.dataUpdatedAt || undefined };
  })();

  return {
    remainingSupply: toSafe<bigint>(remainingSupply),
    isMintableConnected: toSafe<boolean>(isMintableConnected),
    isMintableReference: toSafe<boolean>(isMintableReference),
    walletRemaining: toSafe<bigint>(walletRemaining),
    uri: toSafe<string>(uri),
    artifactCore: artifactSafe,
    connectedWallet: address,
  };
}
