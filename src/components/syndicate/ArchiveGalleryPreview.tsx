// DEPRECATED for public routes. Do not mount on /nft, /nfts, /archive, or any
// other visitor surface. Replaced by <MythologyWall /> per
// docs/NFT_DESIRE_ARCHITECTURE_PASS.md. Kept in src/components/syndicate/ only
// because existing regression tests assert on its source strings; treat as
// frozen reference code and quarantine fully once those tests migrate.
//
// Archive Experience Preview — legacy gallery + disabled-mint preview cards + detail modal.
//
// READ-ONLY. No write calls, no mint handler, no approve calls. Live values
// (remainingSupply, isMintable, getArtifact) come from useArchiveArtifactReads.
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard, Pill, Section, SectionHeader, ProofButton } from "@/components/syndicate/Primitives";
import { ArtifactPreviewArtwork } from "@/components/syndicate/ArtifactPreviewArtwork";
import { ArchiveOnchainImage } from "@/components/syndicate/ArchiveOnchainImage";
import {
  PREVIEW_ARTIFACTS,
  PREVIEW_IDS,
  VISUAL_FAMILY_LABEL,
  MINT_MODEL_LABEL,
  type PreviewArtifact,
} from "@/lib/archive-preview-catalog";
import {
  useArchiveArtifactReads,
  type ArchiveIdRead,
} from "@/lib/archive-nft-hooks";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
} from "@/lib/syndicate-config";
import { MintFirstSignal } from "@/components/syndicate/MintFirstSignal";


const SHORT = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function statusPillFor(
  a: PreviewArtifact,
  _read?: ArchiveIdRead,
): React.ReactNode {
  if (a.status === "RESERVED_DISABLED") {
    // Visitor copy: "Sealed — identity layer" (operator term RESERVED_DISABLED
    // stays in registry / Operator State only).
    return <Pill tone="muted">SEALED · IDENTITY LAYER</Pill>;
  }
  if (a.status === "ACTIVE_MINT_OPEN") {
    return <Pill tone="success">LIVE · MINT OPEN</Pill>;
  }
  if (a.status === "DEPLOYED_CONFIGURED") {
    // Visitor copy: "Sealed by the protocol" — released by on-chain event.
    return <Pill tone="navy">SEALED BY THE PROTOCOL</Pill>;
  }
  // Roadmap / season-finale tier (ID 9 etc.).
  return <Pill tone="warning">SEALED UNTIL THE SEASON CLOSES</Pill>;
}


export function ArchiveGalleryPreview() {
  const q = useArchiveArtifactReads(PREVIEW_IDS);
  const [openId, setOpenId] = useState<number | null>(null);

  const openArtifact = useMemo(
    () => PREVIEW_ARTIFACTS.find((a) => a.id === openId) ?? null,
    [openId],
  );

  // Hierarchy (post-NFT-doctrine):
  //   • ID 1 (The First Signal) is the hero — rendered above on /nft.
  //   • ID 3 (Patron Seal) has its own dedicated readiness panel above —
  //     PatronSealReadiness. Not duplicated here.
  //   • ID 2 is an identity band, not a competing card.
  //   • IDs 4–9 are the quiet protocol-memory shelf — no mint CTAs.
  const reservedSeat = PREVIEW_ARTIFACTS.find((a) => a.id === 2);
  const memoryShelf = PREVIEW_ARTIFACTS.filter((a) => a.id >= 4);

  return (
    <Section id="gallery-preview">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Pill tone="success">ID 1 · MINT OPEN</Pill>
        <Pill tone="warning">ID 3 · READ GATED</Pill>
        <Pill tone="muted">IDS 4–9 · PROTOCOL MEMORY</Pill>
      </div>
      <SectionHeader
        eyebrow="The Collection"
        title={<>The rest of the <span className="text-gradient-gold">NFT Collection</span></>}
        description="One contract on Avalanche. The First Signal is open; Patron Seal is CONTRACT_GATED / PUBLIC_MINT_READ_GATED and only appears mintable from live Archive1155 reads. The remaining slots are protocol-memory artifacts sealed by on-chain events — no public mint, no price urgency."
      />


      {/* Identity band — ID 2 (Reserved Seat Record) */}
      {reservedSeat && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400 shrink-0">
            ID 2 · Identity · Reserved
          </div>
          <p className="text-xs text-foreground/85 leading-snug flex-1">
            ID 2 is a permanently reserved pointer in Archive1155 V1. The seat
            itself — the identity NFT — will live in a separate future ERC-721
            contract (<span className="mono text-foreground">SyndicateSeatRecord721</span>),
            not as an Archive1155 mint. It is not, and will never be, a public
            collectible here.
          </p>
        </div>
      )}

      {/* Quiet protocol-memory shelf — IDs 4–9 */}
      <div className="mb-2 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Protocol Memory · sealed by on-chain events
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-95">
        {memoryShelf.map((a) => (
          <ArtifactCard
            key={a.id}
            artifact={a}
            read={q.reads[a.id]}
            refetch={q.refetch}
            onOpen={() => setOpenId(a.id)}
          />
        ))}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        Only The First Signal (ID 1) is statically publicly mintable today. Patron Seal (ID 3) is contract/read gated and only appears mintable from live Archive1155 reads. ID 2 is a reserved identity
        pointer. IDs 4–8 are ownerOnly protocol-memory artifacts sealed by
        on-chain events. ID 9 is a roadmap slot — not configured on the
        deployed Archive contract. Read the full museum write-up at{" "}
        <a href="/archive" className="underline-offset-4 hover:underline text-foreground">
          /archive
        </a>
        .
      </p>

      <ArtifactDetailModal
        artifact={openArtifact}
        read={openArtifact ? q.reads[openArtifact.id] : undefined}
        refetch={q.refetch}
        open={openId !== null}
        onClose={() => setOpenId(null)}
      />
    </Section>
  );
}


function ArtifactCard({
  artifact,
  read,
  refetch,
  onOpen,
}: {
  artifact: PreviewArtifact;
  read: ArchiveIdRead | undefined;
  refetch: () => void;
  onOpen: () => void;
}) {
  const reserved = artifact.status === "RESERVED_DISABLED";
  const isFirstSignal = artifact.id === 1;
  const isPatron = artifact.id === 3;

  return (
    <article
      className="surface elevated overflow-hidden flex flex-col text-left hover:border-[var(--gold)]/50 transition-colors"
    >
      {/* Artwork — ID 1 uses the real contract-rendered SVG via uri(1);
          inactive IDs continue to use the labeled synthetic preview. */}
      <button
        type="button"
        onClick={onOpen}
        className="image-frame block aspect-[16/10] relative focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/60"
        aria-label={
          isFirstSignal
            ? `Open ${artifact.name} — contract-rendered SVG`
            : `Open ${artifact.name} preview`
        }
      >
        {isFirstSignal ? (
          <ArchiveOnchainImage id={1} alt={`${artifact.name} — on-chain SVG`} />
        ) : (
          <ArtifactPreviewArtwork artifact={artifact} />
        )}
        <span
          className={`absolute top-2 right-2 mono text-[9px] uppercase tracking-[0.18em] rounded border px-1.5 py-0.5 ${
            isFirstSignal
              ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-200"
              : "border-border bg-background/30 text-foreground/80"
          }`}
        >
          {isFirstSignal ? "CONTRACT-RENDERED SVG" : "PREVIEW"}
        </span>
      </button>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              ID {artifact.id} · {artifact.category}
            </div>
            <h3 className="mt-0.5 text-sm font-semibold text-foreground">
              {artifact.name}
            </h3>
          </div>
          {statusPillFor(artifact, read)}
        </div>

        {/* Why it matters — visitor-friendly one-liner */}
        <p className="text-xs text-foreground/85 leading-snug">
          {artifact.whyItMatters}
        </p>

        {/* ID 1 — Mint flow placed near the image, before technical details. */}
        {isFirstSignal && (
          <>
            <div className="mt-1 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-[11px] text-foreground/90 leading-snug">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400 mb-1">
                What you are minting
              </div>
              <p>
                The First Signal — the first public Archive Artifact of
                The Syndicate. The image and metadata are generated on-chain
                by the deployed Archive1155 contract.
              </p>
              <ul className="mt-2 grid grid-cols-1 gap-y-0.5 text-[11px] text-muted-foreground">
                <li>Token ID: <span className="mono text-foreground">1</span></li>
                <li>Network: <span className="mono text-foreground">Avalanche C-Chain (43114)</span></li>
                <li>Metadata: <span className="mono text-foreground">On-chain JSON + SVG</span></li>
                <li>Price: <span className="mono text-foreground">0.50 USDC + Avalanche gas</span></li>
                <li>Wallet limit: <span className="mono text-foreground">5</span></li>
                <li>Supply: <span className="mono text-foreground">10,000</span></li>
                <li>Rights: collectible record only · no financial rights</li>
              </ul>
            </div>
            <MintFirstSignal read={read} refetchArtifact={refetch} />
          </>
        )}

        {/* Mint status line — kept for inactive IDs only (ID 1 has the
            real mint flow above; no "PREVIEW — not active" labeling for it). */}
        {!isFirstSignal && (
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {reserved
              ? "Sealed · identity layer (future contract)"
              : artifact.status === "DEPLOYED_CONFIGURED"
                ? "Sealed by the protocol · released by on-chain event"
                : "Sealed until the season closes"}
          </div>
        )}


        {/* Compact data grid */}
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
          <DT>Visual family</DT>
          <DD>{VISUAL_FAMILY_LABEL[artifact.visualFamily]}</DD>
          <DT>Renderer</DT>
          <DD>{artifact.rendererMode}</DD>
          <DT>Target price</DT>
          <DD>
            {artifact.targetPriceUsdc !== null
              ? `$${artifact.targetPriceUsdc.toFixed(2)} USDC`
              : "—"}
          </DD>
          <DT>Max supply</DT>
          <DD>
            {artifact.proposedMaxSupply !== null
              ? artifact.proposedMaxSupply.toLocaleString("en-US")
              : "—"}
          </DD>
          <DT>Remaining (live)</DT>
          <DD title={read?.errors.remainingSupply ?? undefined}>
            {read?.remainingSupply !== undefined
              ? read.remainingSupply.toString()
              : read?.errors.remainingSupply
                ? "Read error"
                : "Read pending"}
          </DD>
          <DT>Mintable (live)</DT>
          <DD title={read?.errors.isMintableReference ?? undefined}>
            {read?.isMintableReference !== undefined
              ? read.isMintableReference
                ? "TRUE"
                : "FALSE"
              : read?.errors.isMintableReference
                ? "Read error"
                : "Read pending"}
          </DD>
        </dl>

        {/* ID 1 mint flow is rendered above (near the image). */}

        {/* ID 3 (Patron Seal) — LIVE. Detail card points users at the
            dedicated PatronSealReadiness panel above on /nft for the
            actual mint surface. */}
        {isPatron && (
          <div className="mt-2 border-t border-border/40 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Mint card preview
              </span>
              <Pill tone="success">MINT OPEN</Pill>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
              <span>
                {artifact.proposedWalletLimit !== null
                  ? `Wallet limit ${artifact.proposedWalletLimit}`
                  : "—"}
              </span>
              <span>
                {artifact.targetPriceUsdc !== null
                  ? `${artifact.targetPriceUsdc.toFixed(2)} USDC · live`
                  : "—"}
              </span>
            </div>
            <a
              href="#patron-seal-readiness"
              className="block w-full text-center mono text-[11px] uppercase tracking-[0.18em] rounded-md py-2"
              style={{ background: "var(--gradient-gold)", color: "oklch(0.20 0.005 60)" }}
            >
              Mint Patron Seal ↑
            </a>
          </div>
        )}


        {reserved && (
          <div className="mt-2 border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
            Reserved for future ERC-721 Seat Record. Not mintable in
            Archive1155 V1.
          </div>
        )}

        <button
          type="button"
          onClick={onOpen}
          className="mt-auto pt-2 self-end mono text-[10px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)]"
        >
          View details →
        </button>
      </div>
    </article>
  );
}

function DT({ children }: { children: React.ReactNode }) {
  return (
    <dt className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </dt>
  );
}
function DD({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <dd className="mono text-[11px] text-foreground" title={title}>
      {children}
    </dd>
  );
}

function ArtifactDetailModal({
  artifact,
  read,
  refetch,
  open,
  onClose,
}: {
  artifact: PreviewArtifact | null;
  read: ArchiveIdRead | undefined;
  refetch: () => void;
  open: boolean;
  onClose: () => void;
}) {
  if (!artifact) return null;
  const reserved = artifact.status === "RESERVED_DISABLED";
  const isFirstSignal = artifact.id === 1;


  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header — always visible */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/40 shrink-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isFirstSignal ? (
              <>
                <Pill tone="success">ACTIVE · MINT OPEN</Pill>
                <Pill tone="navy">CHAPTER I</Pill>
              </>
            ) : (
              <>
                <Pill tone="gold">PREVIEW</Pill>
                <Pill tone="navy">READ-ONLY</Pill>
                {statusPillFor(artifact, read)}
              </>
            )}
          </div>

          <DialogTitle className="text-base font-semibold">
            {isFirstSignal ? artifact.name : `ID ${artifact.id} · ${artifact.name}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isFirstSignal
              ? "The first public Archive Artifact of The Syndicate. Proof you were early — collectible record only, no financial rights."
              : artifact.description}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable body — desktop: image left, action right */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* LEFT — artwork hero (premium gold-framed collectible container for ID 1) */}
            <div
              className={
                isFirstSignal
                  ? "bg-[oklch(0.08_0.012_260)] border-b md:border-b-0 md:border-r border-[var(--gold)]/30 p-4 md:p-6 flex items-center justify-center"
                  : "bg-background/80 border-b md:border-b-0 md:border-r border-border/40"
              }
            >
              {isFirstSignal ? (
                <div
                  className="relative w-full max-w-[420px] aspect-square rounded-lg overflow-hidden border border-[var(--gold)]/50"
                  style={{
                    background:
                      "radial-gradient(ellipse at top, color-mix(in oklab, var(--gold) 14%, transparent), transparent 70%), #000",
                    boxShadow:
                      "0 0 0 1px color-mix(in oklab, var(--gold) 25%, transparent) inset, 0 30px 80px -30px color-mix(in oklab, var(--gold) 35%, transparent)",
                  }}
                  aria-label="The First Signal — on-chain SVG artwork rendered live from Avalanche"
                >
                  <ArchiveOnchainImage id={1} alt="The First Signal — on-chain SVG" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 py-2 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
                    <span className="mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]/90">
                      Chapter I · The First Signal
                    </span>
                    <span className="mono text-[9px] uppercase tracking-[0.22em] text-foreground/70">
                      on-chain SVG
                    </span>
                  </div>
                </div>
              ) : (
                <div className="aspect-square md:aspect-auto md:h-full md:min-h-[420px] w-full flex items-center justify-center">
                  <ArtifactPreviewArtwork artifact={artifact} />
                </div>
              )}
            </div>


            {/* RIGHT — conversion column */}
            <div className="p-5 flex flex-col gap-3">
              {isFirstSignal ? (
                <>
                  {/* Above-the-fold facts */}
                  <div>
                    <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Chapter I · Genesis Signal
                    </div>
                    <h2 className="mt-0.5 text-lg font-semibold text-foreground">
                      The First Signal
                    </h2>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-md border border-border/50 bg-muted/20 p-3">
                    <KV k="Price" v="0.50 USDC" />
                    <KV k="Network" v="Avalanche" />
                    <KV
                      k="Supply"
                      v={
                        read?.artifact?.maxSupply !== undefined
                          ? read.artifact.maxSupply.toLocaleString("en-US")
                          : "10,000"
                      }
                    />
                    <KV
                      k="Minted"
                      v={
                        read?.artifact?.totalMinted !== undefined
                          ? read.artifact.totalMinted.toString()
                          : "—"
                      }
                    />
                    <KV
                      k="Remaining"
                      v={
                        read?.remainingSupply !== undefined
                          ? read.remainingSupply.toLocaleString("en-US")
                          : "—"
                      }
                    />
                    <KV
                      k="Wallet limit"
                      v={
                        read?.artifact?.walletLimit !== undefined
                          ? read.artifact.walletLimit.toString()
                          : "5"
                      }
                    />
                  </dl>

                  {/* PRIMARY ACTION — visible without scrolling */}
                  <MintFirstSignal read={read} refetchArtifact={refetch} compact />

                  {/* Why this matters — emotional framing, secondary */}
                  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-foreground/90 leading-relaxed">
                    <div className="mono text-[10px] uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400 mb-1">
                      Why this matters
                    </div>
                    <p>
                      Minting The First Signal records that you were here at
                      the opening of The Syndicate. The image and metadata
                      are generated entirely on-chain — nothing off-chain to
                      break.
                    </p>
                  </div>

                  {/* Trust card */}
                  <div className="rounded-md border border-border/60 bg-background/60 p-3">
                    <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Verified on Avalanche
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-foreground">Archive1155</div>
                        <code className="mono text-[11px] text-muted-foreground">
                          {SHORT(ARCHIVE_NFT_CONTRACT_ADDRESS)}
                        </code>
                      </div>
                      <ProofButton href={ARCHIVE_NFT_EXPLORERS.avascan}>
                        Avascan ↗
                      </ProofButton>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-md border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
                    {artifact.whyItMatters}
                  </div>
                  {reserved && (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                      Reserved for future ERC-721 Seat Record. Not mintable in
                      Archive1155 V1.
                    </div>
                  )}
                </>
              )}

              {/* Technical details — collapsed by default */}
              <details className="rounded-md border border-border/40 bg-muted/20">
                <summary className="cursor-pointer px-3 py-2 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground select-none">
                  Technical details
                </summary>
                <div className="px-3 pb-3 pt-1">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <KV k="Token ID" v={artifact.id.toString()} />
                    <KV k="Network" v="Avalanche C-Chain (43114)" />
                    <KV k="Category" v={artifact.category} />
                    <KV k="Chapter" v={artifact.chapterLabel} />
                    <KV k="Visual family" v={VISUAL_FAMILY_LABEL[artifact.visualFamily]} />
                    <KV k="Renderer mode" v={artifact.rendererMode} />
                    <KV k="Mint model" v={MINT_MODEL_LABEL[artifact.mintModel]} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                    Metadata: on-chain JSON + on-chain SVG (base64 via{" "}
                    <span className="mono text-foreground">uri(id)</span>).
                    {reserved
                      ? " For ID 2, uri(2) reverts by design."
                      : isFirstSignal
                        ? " The image is the real on-chain SVG rendered by the contract."
                        : " Preview artwork is synthetic — not contract-rendered."}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                      Rights
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      <li>· Collectible record only</li>
                      <li>· Financial rights: none</li>
                      <li>· Vault claim: none</li>
                      <li>· LP ownership: none</li>
                      <li>· Governance rights: none</li>
                    </ul>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {k}
      </div>
      <div className="mono text-[11px] text-foreground">{v}</div>
    </div>
  );
}
