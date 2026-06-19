// ChapterOneHero — collector hero for /nft & /archive.
//
// Above-the-fold rule (founder directive):
//   The ONLY above-the-fold action is the live "Mint The First Signal" CTA,
//   preceded by one meaning line and minimal supporting text. Everything
//   else lives below the fold inside #collectible-record.
//
// Below-the-fold structure (#collectible-record):
//   1. Artwork preview (live on-chain SVG, gold-framed)
//   2. Disclaimers (collectible-only, contract address + verify link)
//   3. Other artifacts / Future chapters teasers
//
// Wiring contract (do NOT regress):
//   - Renders the REAL on-chain SVG via <ArchiveOnchainImage id={1} />.
//   - Mint CTA is the live <MintFirstSignal /> in compact mode.
//   - Live facts (remaining supply) come from useArchiveArtifactReads([1]).
//
// Accessibility:
//   - Hero is <section aria-labelledby="chapter-one-title">.
//   - Below-fold record is <section aria-labelledby="collectible-record-title">
//     with id="collectible-record" so the post-mint flow can scroll to it.
//   - Teaser links have focus-visible rings and 44px min tap targets.
//   - Decorative blurs are aria-hidden.
import { Link } from "@tanstack/react-router";
import { ArchiveOnchainImage } from "@/components/syndicate/ArchiveOnchainImage";
import { MintFirstSignal } from "@/components/syndicate/MintFirstSignal";
import { AddToWallet } from "@/components/syndicate/AddToWallet";
import { FirstSignalAnatomyBands } from "@/components/syndicate/FirstSignalAnatomyBands";
import { ArchiveDevPanel } from "@/components/syndicate/ArchiveDevPanel";
import { useArchiveArtifactReads } from "@/lib/archive-nft-hooks";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
} from "@/lib/syndicate-config";
import { archiveVerifyUrl } from "@/lib/explorer-guard";
import { fmtAddress } from "@/lib/sale-hooks";

const FIRST_SIGNAL_ID = 1;

export function ChapterOneHero({ hideHero = false }: { hideHero?: boolean } = {}) {
  const result = useArchiveArtifactReads([FIRST_SIGNAL_ID]);
  const read = result.reads[FIRST_SIGNAL_ID];
  const verifyUrl = archiveVerifyUrl() ?? ARCHIVE_NFT_EXPLORERS.avascan;

  const remaining =
    read?.remainingSupply !== undefined
      ? read.remainingSupply.toLocaleString("en-US")
      : "—";
  const maxSupply =
    read?.artifact?.maxSupply !== undefined
      ? read.artifact.maxSupply.toLocaleString("en-US")
      : "—";
  const minted =
    read?.artifact?.totalMinted !== undefined
      ? read.artifact.totalMinted.toLocaleString("en-US")
      : "—";

  return (
    <>
      {/* ─── HERO (above the fold) — suppressed when a parent page
            provides a dedicated showcase hero (e.g. /nft). ──────────── */}
      {!hideHero && (
      <section
        id="chapter-one-hero"
        className="relative isolate overflow-hidden bg-background text-foreground"
        aria-labelledby="chapter-one-title"
      >
        {/* Ambient atmosphere — decorative */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 motion-reduce:opacity-0"
          aria-hidden="true"
        >
          <div
            className="absolute -top-1/4 -left-1/4 w-2/3 h-2/3 rounded-full blur-[160px]"
            style={{ background: "color-mix(in oklab, var(--gold) 60%, transparent)" }}
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 rounded-full blur-[160px]"
            style={{ background: "color-mix(in oklab, #10b981 50%, transparent)" }}
          />
        </div>

        <div className="relative mx-auto max-w-xl px-5 md:px-8 pt-10 md:pt-14 pb-10 flex flex-col items-center min-h-[88vh] md:min-h-0 justify-center md:justify-start">
          <span className="mono text-[10px] uppercase tracking-[0.22em] py-1.5 px-3 rounded-full border border-border/60 bg-muted/50 backdrop-blur-sm text-[var(--gold)]">
            Chapter I · Protocol Origin
          </span>

          <h1
            id="chapter-one-title"
            className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground text-center leading-[1.05] tracking-tight"
          >
            The First Signal
          </h1>

          {/* The single meaning line */}
          <p className="mt-3 max-w-[420px] text-center text-sm text-muted-foreground leading-relaxed">
            Chapter I will never happen again. Mint records that you were
            present at the opening.
          </p>

          {/* The mint action — the only thing the eye should hunt for */}
          <div className="w-full max-w-[420px] mt-6">
            <MintFirstSignal read={read} refetchArtifact={result.refetch} compact />
            <div className="mt-3 flex items-center justify-between mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Avalanche C-Chain</span>
              <span title="Total minted across all wallets, read live from the contract">
                {minted} total minted
                <span className="text-muted-foreground/70"> · {remaining} / {maxSupply} left</span>
              </span>
            </div>
            <ArchiveDevPanel read={read} />
          </div>

          {/* Quiet hint that more lives below — preserves "one screen, one action" */}
          <a
            href="#collectible-record"
            className="mt-8 inline-flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 rounded-sm px-1"
          >
            <span>See the artifact</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      )}

      {/* ─── COLLECTIBLE RECORD (below the fold) ──────────────────── */}
      <section
        id="collectible-record"
        aria-labelledby="collectible-record-title"
        className="relative bg-background text-foreground scroll-mt-4"
      >
        <div className="mx-auto max-w-3xl px-5 md:px-8 py-14 md:py-20 flex flex-col items-center">
          <div className="text-center">
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Collectible record
            </span>
            <h2
              id="collectible-record-title"
              className="mt-2 text-xl sm:text-2xl font-semibold text-foreground tracking-tight"
            >
              The artifact, the proof, the chapters ahead
            </h2>
          </div>

          {/* 1. Artwork preview */}
          <div className="relative w-full max-w-[420px] aspect-square mt-8">
            <div
              className="absolute inset-0 rounded-2xl blur-2xl opacity-50 motion-reduce:opacity-30"
              style={{ background: "var(--gradient-gold)" }}
              aria-hidden="true"
            />
            <div
              className="relative w-full h-full bg-background border border-border rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ boxShadow: "var(--shadow-glow-gold)" }}
            >
              <ArchiveOnchainImage
                id={FIRST_SIGNAL_ID}
                alt="The First Signal — on-chain SVG rendered live by SyndicateArchive1155 on Avalanche"
              />
              <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
                  aria-hidden="true"
                />
                <span className="mono text-[9px] uppercase tracking-[0.22em] text-foreground/70">
                  On-chain · Verified
                </span>
              </div>
              <div className="pointer-events-none absolute bottom-3 right-3">
                <span className="mono text-[8px] uppercase tracking-[0.22em] border border-emerald-500/40 text-emerald-300 bg-emerald-500/5 px-2 py-1 rounded">
                  On-chain SVG
                </span>
              </div>
            </div>
          </div>

          {/* 2. Disclaimers */}
          <div className="mt-8 w-full max-w-[460px] rounded-xl border border-border/60 bg-muted/40 p-4">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              Disclaimers
            </div>
            <ul className="space-y-2 text-[11px] leading-relaxed text-muted-foreground list-disc pl-4 marker:text-muted-foreground/70">
              <li>
                Collectible record only. No financial rights, no governance, no
                expectation of profit.
              </li>
              <li>
                A verifiable historical marker of the protocol's first public
                chapter — minted on Avalanche, image rendered fully on-chain.
              </li>
              <li>
                Other artifacts shown elsewhere on this site are read-gated,
                owner-only, sealed by event, or reserved for future contracts.
              </li>
            </ul>
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 rounded-sm px-1 py-1"
            >
              <span>Archive1155</span>
              <code className="text-muted-foreground">
                {fmtAddress(ARCHIVE_NFT_CONTRACT_ADDRESS)}
              </code>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          {/* 2b. Add to wallet — honest ERC-1155 import helper */}
          <div className="mt-6 w-full max-w-[460px]">
            <AddToWallet tokenId={FIRST_SIGNAL_ID} tokenName="The First Signal" />
          </div>


          {/* 3. Other artifacts / Future chapters teasers */}
          <div className="mt-8 w-full max-w-[460px] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="#gallery-preview"
              className="group rounded-xl border border-border/60 bg-muted/40 p-4 min-h-11 hover:border-[var(--gold)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 transition-colors"
            >
              <div className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Preview
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                Other artifacts
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                SeatRecord721 is future identity. Chapter seals and milestones
                remain sealed until their proof exists on-chain.
              </p>
              <span className="mt-2 inline-block mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-[var(--gold)]">
                Browse the gallery →
              </span>
            </a>
            <Link
              to="/chapters"
              className="group rounded-xl border border-border/60 bg-muted/40 p-4 min-h-11 hover:border-[var(--gold)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 transition-colors"
            >
              <div className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Ahead
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                Future chapters
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                Chapter II onward will seal at real on-chain thresholds. No
                countdowns, no pre-naming.
              </p>
              <span className="mt-2 inline-block mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-[var(--gold)]">
                See the chapters →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW THIS ARTIFACT WORKS (design adaptation of references) ── */}
      <FirstSignalAnatomyBands />
    </>
  );
}
