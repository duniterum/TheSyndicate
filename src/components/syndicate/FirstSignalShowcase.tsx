// FirstSignalShowcase — collector-grade redesign of the /nft hero.
//
// Direction: "Editorial split" (v2). Locked design tokens — gold accent,
// cyan/emerald verify, Instrument Serif headlines, Work Sans body,
// JetBrains Mono for IDs/hashes. Light-default with dark-toggle support.
//
// Composition:
//   Desktop: 60/40 split — artifact LEFT (sticky), narrative + mint RIGHT.
//   Mobile:  artifact first, narrative + mint stacked below.
//
// Story → Desire → Artifact → Status → Mint → Proof.
//
// Wiring contract (do NOT regress):
//   - Renders the REAL on-chain SVG via <ArchiveOnchainImage id={1} />.
//   - Mint CTA is the live <MintFirstSignal compact /> driven by chain reads.
//   - Live counts (totalMinted / remaining) come from useArchiveArtifactReads.
//   - The Genesis Seal only renders once totalMinted >= 1 (verifiable).
//   - Contract address is SUBORDINATED: shown only as "Archive1155 ↗" chip;
//     full 0x string lives behind a copy/explorer link.
//
// Accessibility:
//   - <section aria-labelledby="first-signal-title">
//   - All interactive elements ≥44px tap target, focus-visible rings.
//   - Decorative glows are aria-hidden + motion-reduce: opacity-0.
import { ArchiveOnchainImage } from "@/components/syndicate/ArchiveOnchainImage";
import { MintFirstSignal } from "@/components/syndicate/MintFirstSignal";
import { useArchiveArtifactReads } from "@/lib/archive-nft-hooks";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
} from "@/lib/syndicate-config";
import { archiveVerifyUrl } from "@/lib/explorer-guard";

const FIRST_SIGNAL_ID = 1;

const COLLECTOR_REASONS: Array<{
  eyebrow: string;
  title: string;
  body: string;
}> = [
  {
    eyebrow: "Identity",
    title: "Proof you were early",
    body: "A permanent on-chain marker that you arrived during Chapter I.",
  },
  {
    eyebrow: "Memory",
    title: "Recorded forever",
    body: "Stored on Avalanche. The image itself is rendered fully on-chain.",
  },
  {
    eyebrow: "Status",
    title: "Cohort of origin",
    body: "Future members will be able to verify the cohort that opened the archive.",
  },
];

export function FirstSignalShowcase() {
  const result = useArchiveArtifactReads([FIRST_SIGNAL_ID]);
  const read = result.reads[FIRST_SIGNAL_ID];
  const verifyUrl = archiveVerifyUrl() ?? ARCHIVE_NFT_EXPLORERS.avascan;

  const totalMinted = read?.artifact?.totalMinted ?? 0;
  const maxSupplyN = read?.artifact?.maxSupply;
  const remainingN = read?.remainingSupply;

  const mintedLabel = totalMinted.toLocaleString("en-US");
  const remainingLabel =
    remainingN !== undefined ? remainingN.toLocaleString("en-US") : "—";
  const maxSupplyLabel =
    maxSupplyN !== undefined ? maxSupplyN.toLocaleString("en-US") : "—";

  const genesisSealed = totalMinted >= 1;

  return (
    <section
      id="first-signal-showcase"
      aria-labelledby="first-signal-title"
      className="relative isolate overflow-hidden bg-background text-foreground"
    >
      {/* Ambient gold atmosphere — decorative */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 motion-reduce:opacity-0"
        aria-hidden="true"
      >
        <div
          className="absolute -top-1/3 -left-1/4 w-2/3 h-2/3 rounded-full blur-[180px]"
          style={{ background: "color-mix(in oklab, var(--gold) 55%, transparent)" }}
        />
        <div
          className="absolute -bottom-1/3 -right-1/4 w-2/3 h-2/3 rounded-full blur-[180px]"
          style={{ background: "color-mix(in oklab, var(--verify) 35%, transparent)" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-10 md:pt-16 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
          {/* ─── LEFT · Artifact hero (sticky on desktop) ────────────── */}
          <figure className="md:col-span-7 md:sticky md:top-24">
            <div className="relative w-full max-w-[560px] mx-auto md:mx-0">
              {/* Soft gold halo */}
              <div
                className="absolute -inset-6 rounded-[28px] blur-3xl opacity-60 motion-reduce:opacity-30"
                style={{ background: "var(--gradient-gold)" }}
                aria-hidden="true"
              />
              <div
                className="relative aspect-square w-full rounded-2xl border border-border bg-background overflow-hidden"
                style={{ boxShadow: "var(--shadow-glow-gold)" }}
              >
                <ArchiveOnchainImage
                  id={FIRST_SIGNAL_ID}
                  alt="The First Signal — on-chain SVG rendered live by SyndicateArchive1155 on Avalanche"
                />

                {/* Live verified pill */}
                <div className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-background/80 backdrop-blur px-2.5 py-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
                    aria-hidden="true"
                  />
                  <span className="mono text-[9px] uppercase tracking-[0.22em] text-emerald-300">
                    On-chain · Verified
                  </span>
                </div>

                {/* Chain pill */}
                <div className="pointer-events-none absolute bottom-3 right-3">
                  <span className="mono text-[9px] uppercase tracking-[0.22em] border border-border bg-background/80 backdrop-blur text-muted-foreground px-2.5 py-1 rounded-full">
                    Avalanche · C-Chain
                  </span>
                </div>
              </div>

              {/* Plaque */}
              <figcaption className="mt-4 flex items-center justify-between text-[10px] mono uppercase tracking-[0.22em] text-muted-foreground">
                <span>The Syndicate Archive · Chapter I</span>
                <span>ID #000001</span>
              </figcaption>
            </div>
          </figure>

          {/* ─── RIGHT · Narrative + Mint ────────────────────────────── */}
          <div className="md:col-span-5 flex flex-col">
            <span className="mono text-[10px] uppercase tracking-[0.22em] py-1.5 px-3 self-start rounded-full border border-border bg-muted/50 text-[var(--gold)]">
              Chapter I · Genesis
            </span>

            <h1
              id="first-signal-title"
              className="mt-5 font-serif text-[42px] leading-[1.02] md:text-[56px] md:leading-[1.02] tracking-tight text-foreground"
            >
              Chapter I has begun.
            </h1>

            <p className="mt-5 max-w-[44ch] text-[15px] md:text-base text-muted-foreground leading-relaxed">
              The First Signal is the permanent record of those who arrived at
              the beginning. Mint yours before Chapter I closes — once sealed,
              this artifact can never be issued again.
            </p>

            {/* ─── Genesis Seal (only if #000001 is on-chain) ─────── */}
            {genesisSealed && (
              <a
                href={verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 group block rounded-xl border border-[var(--gold)]/40 bg-[color-mix(in_oklab,var(--gold)_5%,transparent)] p-4 hover:border-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 transition-colors"
                aria-label="View the Genesis mint on Avalanche"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                    Genesis Sealed
                  </span>
                  <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    June 2026
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="font-serif text-xl text-foreground">
                    First Signal
                  </span>
                  <span className="mono text-base text-[var(--gold)]">#000001</span>
                </div>
                <p className="mt-1 text-[11px] mono uppercase tracking-[0.18em] text-muted-foreground">
                  Minted by Founder · Verified forever on Avalanche
                  <span className="text-[var(--gold)] group-hover:translate-x-0.5 inline-block ml-1 transition-transform" aria-hidden="true">↗</span>
                </p>
              </a>
            )}

            {/* ─── Live mint card ─────────────────────────────────── */}
            <div className="mt-6">
              <MintFirstSignal
                read={read}
                refetchArtifact={result.refetch}
                compact
              />
            </div>

            {/* ─── Truth note — collectible edition, not the seat ──── */}
            <p className="mt-3 max-w-[46ch] text-[12px] text-muted-foreground leading-relaxed">
              Collectible Chapter I edition. You can hold up to 5. This is the
              memory of your membership, not the seat.
            </p>
            <p className="mt-1 mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
              Record-only. No equity, governance, revenue share, or financial
              rights.
            </p>

            {/* Live supply line */}
            <div className="mt-3 flex items-center justify-between mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
                  aria-hidden="true"
                />
                Mint live
              </span>
              <span title="Total minted across all wallets, read live from the contract">
                <span className="text-foreground">{mintedLabel}</span> total minted
                <span className="text-muted-foreground/70"> · {remainingLabel} / {maxSupplyLabel} left</span>
              </span>
            </div>

            {/* ─── Trust chip — contract subordinated ─────────────── */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] mono uppercase tracking-[0.18em]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--verify)]" aria-hidden="true" />
                Archive1155 · Verified on Avalanche
              </span>
              <a
                href={verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 rounded-sm px-1 py-1"
                aria-label={`View contract ${ARCHIVE_NFT_CONTRACT_ADDRESS} on Avascan`}
              >
                View contract ↗
              </a>
            </div>

            {/* ─── Why collectors mint ────────────────────────────── */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COLLECTOR_REASONS.map((r) => (
                <div
                  key={r.eyebrow}
                  className="rounded-xl border border-border/60 bg-muted/30 p-3.5"
                >
                  <div className="mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
                    {r.eyebrow}
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-foreground leading-snug">
                    {r.title}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                    {r.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Quiet hint */}
            <a
              href="#collectible-record"
              className="mt-8 self-start inline-flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 rounded-sm px-1 py-1"
            >
              <span>Read the record</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
