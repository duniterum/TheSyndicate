// FirstSignalAnatomyBands — below-the-fold design + transparency suite
// on /nft. Adapts the three NFT Archive reference visuals to the live
// surface of The First Signal (ID 1). NO new facts; only structured
// expression of data the contract already exposes.
//
// Layout (top → bottom):
//   1. ANATOMY  — numbered field list paired with the live on-chain SVG.
//   2. ENGINE   — 4-step contract flow (template → mint → tokenURI → wallets).
//                  Mobile: horizontal scroll-snap. Desktop: 4-up grid.
//   3. ECONOMICS — who pays once / per mint / nobody ongoing.
//   4. VERIFY   — per-band <VerifyOnchainStrip /> linking contract, token-id,
//                  live tokenURI data-URI, Sourcify.
//   5. HEALTH   — <ArchiveReadHealthPanel /> with per-call PASS/PENDING/FAIL.
//   6. PARITY   — <ArchiveDiscrepancyReport /> comparing multicall vs per-call.
//
// All read-only. No write paths introduced. Strict mobile a11y: 44px tap
// targets, scroll-snap with aria-live regions, semantic headings.
import { ArchiveOnchainImage } from "@/components/syndicate/ArchiveOnchainImage";
import { VerifyOnchainStrip } from "@/components/syndicate/VerifyOnchainStrip";
import { ArchiveReadHealthPanel } from "@/components/syndicate/ArchiveReadHealthPanel";
import { ArchiveDiscrepancyReport } from "@/components/syndicate/ArchiveDiscrepancyReport";
import { useArchiveSafeReads } from "@/lib/archive-safe-reads";

const FIRST_SIGNAL_ID = 1;

type AnatomyField = { n: number; label: string; value: string };

const ANATOMY_FIELDS: AnatomyField[] = [
  { n: 1, label: "Artifact name", value: "The First Signal" },
  { n: 2, label: "Chapter", value: "Chapter I · Protocol Origin" },
  { n: 3, label: "Category", value: "Chapter Artifact" },
  { n: 4, label: "Serial / Token ID", value: "ID 1 (ERC-1155)" },
  { n: 5, label: "Renderer", value: "On-chain SVG" },
  { n: 6, label: "Chain", value: "Avalanche C-Chain" },
  { n: 7, label: "Protocol", value: "SyndicateArchive1155" },
];

type EngineStep = { n: number; title: string; body: string };

const ENGINE_STEPS: EngineStep[] = [
  {
    n: 1,
    title: "Template stored",
    body: "The SVG template for ID 1 lives in contract storage on Avalanche. No IPFS, no host, no expiring link.",
  },
  {
    n: 2,
    title: "mint() composes",
    body: "When you mint, the contract pulls the template and stamps in the live data (token ID, supply position).",
  },
  {
    n: 3,
    title: "tokenURI() returns",
    body: "uri(1) returns a base64 data-URI containing the JSON metadata and the fully-rendered SVG image inline.",
  },
  {
    n: 4,
    title: "Wallets render",
    body: "Every wallet, marketplace, or explorer reads the same on-chain URI. Nobody serves the image but the contract.",
  },
];

function BandHeading({
  step,
  label,
  meta,
}: {
  step: string;
  label: string;
  meta: string;
}) {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <span className="mono text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
        {step} · {label}
      </span>
      <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
        {meta}
      </span>
    </div>
  );
}

export function FirstSignalAnatomyBands() {
  // Live tokenURI for the verify strips — same per-call hook the health
  // panel uses, so all three surfaces see the same value at the same time.
  const safe = useArchiveSafeReads(FIRST_SIGNAL_ID);
  const tokenUri = safe.uri.value;

  return (
    <section
      id="how-this-artifact-works"
      aria-labelledby="how-this-artifact-works-title"
      className="relative bg-background text-foreground"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            How this artifact works
          </span>
          <h2
            id="how-this-artifact-works-title"
            className="mt-3 font-serif text-4xl md:text-5xl font-normal text-foreground tracking-tight leading-[1.05]"
          >
            Anatomy, engine, and who pays for what
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            The same on-chain SVG you can mint above — broken down into the
            fields it carries, the engine that renders it, and the honest
            cost of keeping it alive forever.
          </p>
        </div>

        {/* ─── 1. ANATOMY ─────────────────────────────────────────── */}
        <div className="mt-12 md:mt-16">
          <BandHeading step="01" label="Anatomy" meta="Seven fields" />

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 md:gap-10 items-center">
            {/* Artwork */}
            <div className="relative w-full max-w-[420px] mx-auto aspect-square">
              <div
                className="absolute inset-0 rounded-2xl blur-2xl opacity-40 motion-reduce:opacity-20"
                style={{ background: "var(--gradient-gold)" }}
                aria-hidden="true"
              />
              <div
                className="relative w-full h-full bg-background border border-[var(--gold)]/30 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-glow-gold)" }}
              >
                <ArchiveOnchainImage
                  id={FIRST_SIGNAL_ID}
                  alt="The First Signal — anatomical reference view"
                />
                {(["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"] as const).map((pos) => (
                  <span
                    key={pos}
                    aria-hidden="true"
                    className={`absolute ${pos} w-3 h-3 border-[var(--gold)]/70`}
                    style={{
                      borderTopWidth: pos.includes("top") ? 1 : 0,
                      borderBottomWidth: pos.includes("bottom") ? 1 : 0,
                      borderLeftWidth: pos.includes("left") ? 1 : 0,
                      borderRightWidth: pos.includes("right") ? 1 : 0,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Numbered field list */}
            <ol className="space-y-3" aria-label="Artifact anatomy fields">
              {ANATOMY_FIELDS.map((f) => (
                <li
                  key={f.n}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/40 p-3 min-h-11 hover:border-[var(--gold)]/30 transition-colors"
                >
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full border border-[var(--gold)]/50 bg-[var(--gold)]/5 flex items-center justify-center mono text-[11px] text-[var(--gold)]"
                  >
                    {f.n.toString().padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {f.label}
                    </div>
                    <div className="mt-1 text-base text-foreground truncate">
                      {f.value}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5">
            <VerifyOnchainStrip tokenId={FIRST_SIGNAL_ID} tokenUri={tokenUri} />
          </div>
        </div>

        {/* ─── 2. ENGINE ─────────────────────────────────────────── */}
        <div className="mt-16 md:mt-24">
          <BandHeading step="02" label="Engine" meta="Four steps" />

          {/* Mobile: horizontal scroll-snap. Desktop: 4-up grid. */}
          <ol
            className="
              flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2
              sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none
              lg:grid-cols-4
            "
            aria-label="On-chain rendering pipeline"
          >
            {ENGINE_STEPS.map((s, idx) => (
              <li
                key={s.n}
                className="
                  relative rounded-xl border border-border/60 bg-muted/40 p-4
                  flex flex-col flex-shrink-0
                  w-[78%] min-w-[260px] snap-start
                  sm:w-auto sm:min-w-0
                "
              >
                <div className="flex items-center justify-between">
                  <span className="mono text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
                    Step {s.n.toString().padStart(2, "0")}
                  </span>
                  {idx < ENGINE_STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="mono text-muted-foreground/60 text-base hidden lg:inline"
                    >
                      →
                    </span>
                  )}
                </div>
                <div className="mt-2 text-base font-semibold text-foreground">
                  {s.title}
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="sr-only" aria-live="polite">
            Four-step pipeline shown {ENGINE_STEPS.length} steps. Scroll
            horizontally on small screens.
          </p>

          <div className="mt-5">
            <VerifyOnchainStrip tokenId={FIRST_SIGNAL_ID} tokenUri={tokenUri} />
          </div>
        </div>

        {/* ─── 3. ECONOMICS ─────────────────────────────────────── */}
        <div className="mt-16 md:mt-24">
          <BandHeading step="03" label="Economics" meta="Who pays for what" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Founder once */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <div className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Founder · once
              </div>
              <div className="mt-3 text-xl font-semibold text-foreground">
                Deployment gas
              </div>
              <div className="mt-1 mono text-xs text-[var(--gold)]">
                Paid before launch
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The engine + the template for The First Signal were deployed
                once to Avalanche. Not your cost. Not an ongoing cost.
              </p>
            </div>

            {/* User per mint */}
            <div
              className="rounded-xl border border-[var(--gold)]/40 bg-gradient-to-b from-[var(--gold)]/[0.06] to-transparent p-6 relative"
              style={{ boxShadow: "var(--shadow-glow-gold)" }}
            >
              <div className="mono text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
                You · per mint
              </div>
              <div className="mt-3 text-xl font-semibold text-foreground">
                Gas + 0.50 USDC
              </div>
              <div className="mt-1 mono text-xs text-emerald-300">
                + one-time USDC approval
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-foreground/80 leading-relaxed">
                <li>· Avalanche gas — cents, not dollars</li>
                <li>· 0.50 USDC — the artifact price</li>
                <li>· USDC approve() — once, ever, per wallet</li>
              </ul>
            </div>

            {/* Nobody ongoing */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <div className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Nobody · ongoing
              </div>
              <div className="mt-3 text-xl font-semibold text-foreground">
                No hosting bill
              </div>
              <div className="mt-1 mono text-xs text-muted-foreground">
                Storage lives on-chain
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The image is composed by the contract every time it's read.
                No IPFS pin to renew, no server to maintain, no link to
                expire.
              </p>
            </div>
          </div>

          <p className="mt-4 mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70 text-center">
            Collectible record only — no financial rights, no revenue share.
          </p>

          <div className="mt-5">
            <VerifyOnchainStrip tokenId={FIRST_SIGNAL_ID} tokenUri={tokenUri} />
          </div>
        </div>

        {/* ─── 4. ON-CHAIN READ HEALTH + DISCREPANCY ──────────── */}
        <div className="mt-16 md:mt-24 space-y-6">
          <BandHeading step="04" label="Transparency" meta="Read health · parity" />
          <ArchiveReadHealthPanel tokenId={FIRST_SIGNAL_ID} />
          <ArchiveDiscrepancyReport tokenId={FIRST_SIGNAL_ID} />
        </div>
      </div>
    </section>
  );
}
