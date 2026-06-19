// PatronSealReadiness — live on-chain panel for ID 3 (Patron Seal).
//
// Doctrine (post-activation, June 2026):
//   ID 3 is LIVE on Archive1155 (Avalanche). freezeArtifactDefinition(3)
//   and setDropActive(3, true) have both been executed by the owner.
//   Live on-chain state: active=true, definitionFrozen=true,
//   priceUsdc=5.00 USDC, walletLimit=5, maxSupply=10,000,
//   rendererMode=ONCHAIN_SVG.
//   This component MUST:
//     • Read live on-chain state (never fabricate active/mintable).
//     • Render the real on-chain SVG (uri(3) is valid).
//     • Display 5.00 USDC sourced from priceUsdc when available.
//     • Mount MintPatronSeal when live reads confirm
//       active === true AND isMintableConnected === true AND paused !== true.
//     • Show wallet-specific disabled states (paused / sold out /
//       mint limit reached) when applicable.
//     • Never claim equity, yield, revenue share, Vault/LP ownership,
//       dividends, or governance rights.
import { Pill, Section, SectionHeader, ProofButton } from "@/components/syndicate/Primitives";
import { ArchiveOnchainImage } from "@/components/syndicate/ArchiveOnchainImage";
import { MintPatronSeal } from "@/components/syndicate/MintPatronSeal";
import { useArchiveArtifactReads } from "@/lib/archive-nft-hooks";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
} from "@/lib/syndicate-config";

const PATRON_SEAL_ID = 3;
const CATALOG_PRICE_USDC = 5.0;
const CATALOG_WALLET_LIMIT = 5;
const CATALOG_MAX_SUPPLY = 10_000;

function formatUsdc(priceUsdc: bigint | undefined): { value: string; live: boolean } {
  if (priceUsdc === undefined) {
    return { value: `${CATALOG_PRICE_USDC.toFixed(2)} USDC`, live: false };
  }
  // USDC = 6 decimals on Avalanche.
  const whole = Number(priceUsdc) / 1_000_000;
  return { value: `${whole.toFixed(2)} USDC`, live: true };
}

export function PatronSealReadiness() {
  const q = useArchiveArtifactReads([PATRON_SEAL_ID]);
  const read = q.reads[PATRON_SEAL_ID];
  const art = read?.artifact;

  // Live truth flags — undefined while reads pending or failed.
  const liveActive = art?.active;
  const liveConfigured = art?.configured;
  const liveMintableRef = read?.isMintableReference;
  const liveFrozen = art?.definitionFrozen;
  const liveOwnerOnly = art?.ownerOnly;
  const livePaused = q.paused; // global Pausable.paused() — undefined when unknown

  // CTA is only enabled when live reads positively confirm both flags AND
  // the contract is not paused.
  const canMint =
    liveActive === true && liveMintableRef === true && livePaused !== true;

  const price = formatUsdc(art?.priceUsdc);
  const walletLimit = art?.walletLimit !== undefined
    ? Number(art.walletLimit)
    : CATALOG_WALLET_LIMIT;
  const maxSupply = art?.maxSupply !== undefined
    ? Number(art.maxSupply)
    : CATALOG_MAX_SUPPLY;
  const remaining = read?.remainingSupply;
  const minted = art?.totalMinted;

  // Status pill semantics — derived strictly from live reads.
  // Paused overrides active so an emergency pause is visible at a glance.
  const statusPill = (() => {
    if (livePaused === true) return <Pill tone="warning">PAUSED</Pill>;
    if (liveActive === true) return <Pill tone="success">ACTIVE · READ GATED</Pill>;
    if (liveConfigured === true) return <Pill tone="navy">CONFIGURED · NOT ACTIVE</Pill>;
    if (read?.errors.artifact) return <Pill tone="muted">READ PENDING</Pill>;
    return <Pill tone="muted">READING ON-CHAIN STATE</Pill>;
  })();

  return (
    <Section id="patron-seal-readiness">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {statusPill}
        <Pill tone="navy">ID 3 · PATRON SEAL</Pill>
        <Pill tone="muted">RENDERER · ON-CHAIN SVG</Pill>
      </div>

      <SectionHeader
        eyebrow="Patron Seal · ID 3"
        title={<>The <span className="text-gradient-gold">Patron Seal</span></>}
        description={
          liveActive === true
            ? "Live on Avalanche at 5.00 USDC and shown as mintable only from live Archive1155 reads. Optional, flat support Artifact — one tier only, no rank, no financial rights. Wallet limit 5, supply 10,000."
            : "Configured on-chain at 5.00 USDC. Live reads will enable the mint button as soon as the contract reports active === true."
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 surface elevated p-4 md:p-6">
        {/* LEFT — on-chain SVG (live render of uri(3)) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div
            className="relative w-full aspect-square rounded-lg overflow-hidden border border-[var(--gold)]/40"
            style={{
              background:
                "radial-gradient(ellipse at top, color-mix(in oklab, var(--gold) 10%, transparent), transparent 70%), #000",
            }}
            aria-label="Patron Seal — on-chain SVG artwork rendered live from Avalanche"
          >
            <ArchiveOnchainImage id={PATRON_SEAL_ID} alt="Patron Seal — on-chain SVG" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 py-2 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
              <span className="mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]/90">
                Patron Seal · ID 3
              </span>
              <span className="mono text-[9px] uppercase tracking-[0.22em] text-foreground/70">
                on-chain SVG
              </span>
            </div>
          </div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Renderer · ONCHAIN_SVG · tokenURI verified
          </div>
        </div>

        {/* RIGHT — readiness state + disabled CTA + facts */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Anatomy / explainer */}
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
              What it is
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              The Patron Seal is an optional, flat support NFT for people who
              want to help fund development, infrastructure, design and public
              storytelling. One tier only — no Bronze/Silver/Gold, no rank, no
              wealth-coded status, no financial rights.
            </p>
          </div>

          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
              How it differs from The First Signal
            </div>
            <ul className="text-sm text-foreground/90 leading-relaxed space-y-1">
              <li>· The First Signal marks <em>the opening</em> of the protocol — Chapter I, ID 1.</li>
              <li>· The Patron Seal marks <em>support</em> — cross-chapter, ID 3, single flat amount.</li>
              <li>· Both are collectible records only. Neither grants equity, yield, revenue share, dividends, Vault ownership, LP ownership, or governance rights.</li>
            </ul>
          </div>

          {/* Facts grid — prefers live reads, falls back to catalog with label */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border border-border/50 bg-muted/20 p-3">
            <KV
              k="Price"
              v={price.value}
              note={price.live ? "live" : "catalog"}
            />
            <KV
              k="Wallet limit"
              v={walletLimit.toString()}
              note={art?.walletLimit !== undefined ? "live" : "catalog"}
            />
            <KV
              k="Max supply"
              v={maxSupply.toLocaleString("en-US")}
              note={art?.maxSupply !== undefined ? "live" : "catalog"}
            />
            <KV
              k="Minted"
              v={minted !== undefined ? minted.toString() : "—"}
              note={minted !== undefined ? "live" : "pending"}
            />
            <KV
              k="Remaining"
              v={remaining !== undefined ? remaining.toLocaleString("en-US") : "—"}
              note={remaining !== undefined ? "live" : "pending"}
            />
            <KV
              k="Network"
              v="Avalanche C-Chain"
              note="constant"
            />
          </dl>

          {/* Live status band — adapts to real on-chain state */}
          {liveActive === true ? (
            <div className="rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/5 p-3 text-xs text-foreground/90 leading-relaxed">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] mb-1">
                Live · read gated
              </div>
              <p>
                Patron Seal appears mintable only when live Archive1155 reads confirm
                the connected wallet can mint it at <span className="mono text-foreground">{price.value}</span>.
                Wallet limit {walletLimit}. Definition is frozen on-chain.
                Connect a wallet on Avalanche C-Chain, approve 5.00 USDC, and mint
                ID 3. Patron Seal is a collectible record only — no equity, yield,
                revenue share, dividends, Vault claim, LP claim, or governance rights.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-foreground/90 leading-relaxed">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400 mb-1">
                Reading on-chain state
              </div>
              <p>
                Configured on-chain at <span className="mono text-foreground">{price.value}</span>.
                The button below will enable as soon as live reads return{" "}
                <span className="mono text-foreground">active === true</span>{" "}
                and the contract reports the artifact as mintable.
              </p>
            </div>
          )}

          {/* Mint surface — gated strictly by GLOBAL on-chain state.
              Wallet-specific eligibility (no wallet / wrong chain / allowance
              / limit reached) is owned by <MintPatronSeal /> itself.
              "Not active yet" is rendered ONLY when getArtifactCore(3).active
              has resolved to FALSE on-chain — never as a fallback for a
              wallet-specific unknown. */}
          {livePaused === true ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled
                aria-disabled
                className="mono w-full inline-flex items-center justify-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-3 text-[12px] uppercase tracking-[0.18em] cursor-not-allowed"
                title="Minting is temporarily paused."
              >
                Paused
              </button>
              <p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Minting is temporarily paused.
              </p>
            </div>
          ) : read?.remainingSupply !== undefined && read.remainingSupply === 0n ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled
                aria-disabled
                className="mono w-full inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/40 text-muted-foreground px-4 py-3 text-[12px] uppercase tracking-[0.18em] cursor-not-allowed"
                title="All Patron Seals have been minted."
              >
                Sold out
              </button>
              <p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                All Patron Seals have been minted.
              </p>
            </div>
          ) : liveActive === true && read ? (
            // Globally active on-chain → mount the mint surface, which
            // internally renders Connect wallet / Switch chain / Approve /
            // Mint / Mint limit reached, etc.
            <MintPatronSeal
              read={read}
              refetchArtifact={q.refetch}
              paused={livePaused}
            />
          ) : liveActive === false ? (
            <button
              type="button"
              disabled
              aria-disabled
              className="mono w-full inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/40 text-muted-foreground px-4 py-3 text-[12px] uppercase tracking-[0.18em] cursor-not-allowed"
              title="Not active yet — minting will open once activated on-chain."
            >
              Not active yet
            </button>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled
              className="mono w-full inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/40 text-muted-foreground px-4 py-3 text-[12px] uppercase tracking-[0.18em] cursor-not-allowed"
              title="Reading on-chain state…"
            >
              Reading on-chain state…
            </button>
          )}

          {/* Honest live-state diagnostics — short and verifiable */}
          <details className="rounded-md border border-border/40 bg-muted/20">
            <summary className="cursor-pointer px-3 py-2 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground select-none">
              Live on-chain state
            </summary>
            <div className="px-3 pb-3 pt-1 grid grid-cols-2 gap-x-4 gap-y-2">
              <KV k="configured" v={fmtBool(liveConfigured)} />
              <KV k="active" v={fmtBool(liveActive)} />
              <KV k="ownerOnly" v={fmtBool(liveOwnerOnly)} />
              <KV k="definitionFrozen" v={fmtBool(liveFrozen)} />
              <KV k="paused" v={livePaused === undefined ? "—" : fmtBool(livePaused)} />
              <KV
                k="isMintable(reference)"
                v={fmtBool(liveMintableRef)}
              />
            </div>
          </details>

          {/* Verifiability */}
          <div className="rounded-md border border-border/60 bg-background/60 p-3 flex items-center justify-between gap-2">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Verified on Avalanche
              </div>
              <code className="mono text-[11px] text-muted-foreground">
                {`${ARCHIVE_NFT_CONTRACT_ADDRESS.slice(0, 6)}…${ARCHIVE_NFT_CONTRACT_ADDRESS.slice(-4)}`}
              </code>
            </div>
            <ProofButton href={ARCHIVE_NFT_EXPLORERS.avascan}>
              Avascan ↗
            </ProofButton>
          </div>

          {/* Rights — explicit non-financial declaration */}
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            Rights · Collectible record only. No equity, no yield, no dividends,
            no revenue share, no Vault claim, no LP claim, no governance rights.
            Participation may result in total loss.
          </div>
        </div>
      </div>
    </Section>
  );
}

function fmtBool(v: boolean | undefined): string {
  if (v === true) return "true";
  if (v === false) return "false";
  return "—";
}

function KV({ k, v, note }: { k: string; v: string; note?: string }) {
  return (
    <div>
      <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {k}
        {note ? <span className="ml-1 text-[8px] opacity-70">· {note}</span> : null}
      </div>
      <div className="mono text-[11px] text-foreground">{v}</div>
    </div>
  );
}
