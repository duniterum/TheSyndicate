// ArchiveOnchainImage — renders the real contract-rendered SVG image for
// an Archive1155 artifact by calling uri(id) and decoding the base64 JSON.
//
// READ-ONLY. No write paths. On any failure we DO NOT fabricate artwork —
// we surface honest "loading" / "unable to load" states.
import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { ARCHIVE_NFT_ABI } from "@/lib/archive-nft-abi";
import { ARCHIVE_NFT_CONTRACT_ADDRESS } from "@/lib/syndicate-config";

const ADDR = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;

const DATA_JSON_PREFIX = "data:application/json;base64,";
const DATA_JSON_UTF8_PREFIX = "data:application/json;utf8,";

function decodeUri(uri: string): { image?: string; name?: string; description?: string } | null {
  try {
    if (uri.startsWith(DATA_JSON_PREFIX)) {
      const b64 = uri.slice(DATA_JSON_PREFIX.length);
      const json = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("utf8");
      return JSON.parse(json);
    }
    if (uri.startsWith(DATA_JSON_UTF8_PREFIX)) {
      return JSON.parse(decodeURIComponent(uri.slice(DATA_JSON_UTF8_PREFIX.length)));
    }
    // Some contracts return raw JSON without the prefix.
    if (uri.trim().startsWith("{")) {
      return JSON.parse(uri);
    }
    return null;
  } catch {
    return null;
  }
}

export function ArchiveOnchainImage({
  id,
  alt,
  className,
}: {
  id: number;
  alt: string;
  className?: string;
}) {
  const q = useReadContract({
    address: ADDR,
    abi: ARCHIVE_NFT_ABI,
    functionName: "uri",
    args: [BigInt(id)],
    query: { staleTime: 60_000, refetchInterval: 120_000 },
  });

  const meta = useMemo(() => {
    if (typeof q.data !== "string") return null;
    return decodeUri(q.data);
  }, [q.data]);

  const image = meta?.image;

  if (q.isLoading) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-background/80 text-[var(--gold)] mono text-[10px] uppercase tracking-[0.18em] ${className ?? ""}`}
        role="status"
        aria-live="polite"
      >
        Contract-rendered image loading
      </div>
    );
  }

  if (q.isError || !image) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-background/80 text-[var(--gold)] mono text-[10px] uppercase tracking-[0.18em] px-3 text-center ${className ?? ""}`}
        role="status"
      >
        <span>Unable to load on-chain SVG right now</span>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="text-[9px] underline underline-offset-2 hover:text-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={alt}
      className={`w-full h-full object-contain bg-background ${className ?? ""}`}
      loading="lazy"
      decoding="async"
    />
  );
}
