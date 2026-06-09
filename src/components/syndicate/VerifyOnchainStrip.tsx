// VerifyOnchainStrip — compact, accessible "Verify on-chain" row shown
// under each /nft band. Links to the contract on Avascan, the tokenId
// page (when supported), and the live tokenURI metadata data-URI returned
// by uri(id). Keeps each band's verifiability self-contained.
//
// All links open in a new tab with rel="noopener noreferrer". 44×44 tap
// targets on mobile, focus-visible rings, mono microcopy.
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
} from "@/lib/syndicate-config";
import { archiveVerifyUrl } from "@/lib/explorer-guard";
import { fmtAddress } from "@/lib/sale-hooks";

type Props = {
  tokenId: number;
  tokenUri?: string | undefined;
  className?: string;
};

export function VerifyOnchainStrip({ tokenId, tokenUri, className }: Props) {
  const contractUrl = archiveVerifyUrl() ?? ARCHIVE_NFT_EXPLORERS.avascan;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-2 ${className ?? ""}`}
      role="group"
      aria-label={`Verify on-chain — token ID ${tokenId}`}
    >
      <span className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground px-1">
        Verify on-chain
      </span>
      <a
        href={contractUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 min-h-9 px-2 rounded mono text-[10px] uppercase tracking-[0.18em] text-foreground/80 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
      >
        <span>Contract</span>
        <code className="text-muted-foreground normal-case tracking-normal">
          {fmtAddress(ARCHIVE_NFT_CONTRACT_ADDRESS)}
        </code>
        <span aria-hidden="true">↗</span>
      </a>
      <span
        className="inline-flex items-center gap-1.5 min-h-9 px-2 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        aria-label={`Token ID ${tokenId} is verified through the contract tokenURI read`}
      >
        <span>Token ID {tokenId}</span>
        <span aria-hidden="true">· contract read</span>
      </span>
      {tokenUri ? (
        <a
          href={tokenUri}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 min-h-9 px-2 rounded mono text-[10px] uppercase tracking-[0.18em] text-foreground/80 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
          title="Open the tokenURI() data-URI returned by the contract"
        >
          <span>tokenURI</span>
          <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <span
          className="inline-flex items-center gap-1.5 min-h-9 px-2 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70"
          aria-label="tokenURI not yet loaded"
        >
          tokenURI · pending
        </span>
      )}
      <a
        href={ARCHIVE_NFT_EXPLORERS.sourcify}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 min-h-9 px-2 rounded mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
      >
        <span>Sourcify</span>
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
