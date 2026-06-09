// CockpitCollector — Wave C3 of the /my-syndicate Member Cockpit.
//
// The ownership / collector loop. Answers, cockpit-only and read-only:
//   • "What do I own?"            → live balanceOf for the canonical artifacts
//   • "What can I collect next?"  → only real, canonical opportunities
//   • "What is live vs pending?"  → ACTIVE_MINT_OPEN vs future ERC-721
//   • "What can I verify?"        → wallet + contract proof links everywhere
//
// Truth doctrine (hard rules):
//   • No fake supply / minted / scarcity. Supply bars render ONLY from a live
//     on-chain maxSupply + minted read. The First Signal is uncapped, so it
//     NEVER shows a supply progress bar.
//   • No "Genesis NFT", no false 1,000 supply, no "Mint Genesis NFT".
//   • Seat Record is a future ERC-721 (SyndicateSeatRecord721) — never shown as
//     mintable, never conflated with Archive1155.
//   • Prices come from the live priceUsdc read, falling back to the canonical
//     archive-config targetPriceUsdc — never a hardcoded literal.
//   • One failed read never breaks the cockpit — per-field "Read pending/error".
//
// No write paths here. The actual mint flow lives on /nft.
import { useAccount } from "wagmi";
import { Link } from "@tanstack/react-router";
import { GlassCard, Pill, StatusPill } from "@/components/syndicate/Primitives";
import { useArchiveBalances } from "@/lib/archive-balances-hook";
import { useUserBalances, fmtSyn } from "@/lib/sale-hooks";
import {
  useArchiveArtifactReads,
  formatRelativeTime,
} from "@/lib/archive-nft-hooks";
import { ARCHIVE_ARTIFACTS, ARCHIVE_DISCLAIMER } from "@/lib/archive-config";
import type { ArchiveArtifact } from "@/lib/archive-nft-abi";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";
import type { HolderRecord } from "@/lib/holder-index";

const SHORT = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmtInt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

// ── canonical collector catalog ─────────────────────────────────────────────
// Token-id → canonical config id mapping. Prices are looked up from
// ARCHIVE_ARTIFACTS (the single source of truth), never inlined.
type SupplyMode = "uncapped" | "capped" | "pending";
type CollectItem = {
  id: number;
  configId: string;
  name: string;
  chapter: string;
  meaning: string;
  status: "ACTIVE_MINT_OPEN" | "PENDING_CONTRACT";
  supplyMode: SupplyMode;
  /** Catalog (reference) supply target — used ONLY as a clearly-labeled
   *  fallback denominator for capped artifacts when the live maxSupply read
   *  is unavailable. Never used for uncapped artifacts. */
  catalogMaxSupply?: number;
  /** Catalog wallet-limit fallback (doctrine), shown labeled when not live. */
  catalogWalletLimit: number;
};

const COLLECT: CollectItem[] = [
  {
    id: 1,
    configId: "first-signal",
    name: "The First Signal",
    chapter: "Chapter I — Genesis Signal",
    meaning:
      "The Genesis Chapter Artifact — the first public signal of the Archive. Uncapped during the open chapter.",
    status: "ACTIVE_MINT_OPEN",
    supplyMode: "uncapped",
    catalogWalletLimit: 5,
  },
  {
    id: 3,
    configId: "patron-seal",
    name: "Patron Seal",
    chapter: "Cross-chapter",
    meaning:
      "Optional flat-support artifact. One tier only — no rank, no wealth-coding, no financial rights.",
    status: "ACTIVE_MINT_OPEN",
    supplyMode: "capped",
    catalogMaxSupply: 10_000,
    catalogWalletLimit: 5,
  },
  {
    id: 2,
    configId: "seat-record",
    name: "Seat Record",
    chapter: "—",
    meaning:
      "Optional timestamp of a Membership Sale purchase. Lives in a separate future ERC-721 (SyndicateSeatRecord721) — not part of Archive1155, not mintable yet.",
    status: "PENDING_CONTRACT",
    supplyMode: "pending",
    catalogWalletLimit: 0,
  },
];

const OWNED_IDS = [1, 3] as const; // canonical mintable Archive1155 artifacts
const READ_IDS = [1, 2, 3] as const;

function configPrice(configId: string): number | null {
  return ARCHIVE_ARTIFACTS.find((a) => a.id === configId)?.targetPriceUsdc ?? null;
}

// Live priceUsdc (6-dp USDC) → display, falling back to canonical config.
function resolvePrice(
  priceUsdc: bigint | undefined,
  configId: string,
): { text: string; live: boolean } {
  if (priceUsdc !== undefined && priceUsdc > 0n) {
    return { text: `${(Number(priceUsdc) / 1_000_000).toFixed(2)} USDC`, live: true };
  }
  const cfg = configPrice(configId);
  if (cfg != null) return { text: `${cfg.toFixed(2)} USDC`, live: false };
  return { text: "—", live: false };
}

// ── small presentational helpers ────────────────────────────────────────────
function Fact({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: { text: string; live: boolean };
}) {
  return (
    <div className="min-w-0">
      <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="mono text-sm text-foreground truncate">{value}</span>
        {note && (
          <span
            className={`mono text-[8px] uppercase tracking-[0.14em] ${
              note.live ? "text-[var(--success)]" : "text-muted-foreground/70"
            }`}
          >
            {note.text}
          </span>
        )}
      </div>
    </div>
  );
}

function VerifyLink() {
  return (
    <a
      href={ARCHIVE_NFT_EXPLORERS.avascan}
      target="_blank"
      rel="noopener noreferrer"
      className="mono text-[10px] uppercase tracking-[0.16em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)]"
    >
      Verify ↗
    </a>
  );
}

// ── owned ownership pill (per canonical artifact) ───────────────────────────
function OwnedChip({
  name,
  balance,
  error,
  loading,
}: {
  name: string;
  balance: bigint | undefined;
  error?: string;
  loading: boolean;
}) {
  const owns = balance !== undefined && balance > 0n;
  return (
    <div className="surface elevated px-3 py-2 flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-foreground truncate">{name}</span>
      <span
        className="mono text-xs shrink-0"
        title={error ?? undefined}
      >
        {error ? (
          <span className="text-destructive">Read error</span>
        ) : balance !== undefined ? (
          <span className={owns ? "text-[var(--success)]" : "text-muted-foreground"}>
            ×{balance.toString()}
          </span>
        ) : loading ? (
          <span className="text-muted-foreground/70">Read pending</span>
        ) : (
          <span className="text-muted-foreground/70">—</span>
        )}
      </span>
    </div>
  );
}

// ── per-artifact mint progress (the safely-rewritten "mint progress") ───────
function MintProgress({
  item,
  art,
  remainingSupply,
  artifactError,
}: {
  item: CollectItem;
  art: ArchiveArtifact | undefined;
  remainingSupply: bigint | undefined;
  artifactError?: string | null;
}) {
  // Pending future contract — no Archive1155 supply at all.
  if (item.supplyMode === "pending") {
    return (
      <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Future ERC-721 · not mintable yet
      </div>
    );
  }

  const minted = art?.totalMinted !== undefined ? Number(art.totalMinted) : undefined;

  // Uncapped (The First Signal) — NEVER a supply bar. Show the live minted
  // count if available (informational only — not scarcity), otherwise just
  // the uncapped status.
  if (item.supplyMode === "uncapped") {
    return (
      <div className="flex items-center gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-foreground">
          Uncapped supply
        </span>
        {minted !== undefined ? (
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            · {fmtInt(minted)} minted
            <span className="text-[var(--success)]"> live</span>
          </span>
        ) : artifactError ? (
          <span className="mono text-[10px] text-destructive">read error</span>
        ) : (
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
            · minted read pending
          </span>
        )}
      </div>
    );
  }

  // Capped (Patron Seal). A bar only renders when we can derive a real minted
  // count. Denominator prefers the live maxSupply read; the catalog target is
  // a clearly-labeled fallback.
  const liveMax = art?.maxSupply !== undefined && art.maxSupply > 0n ? Number(art.maxSupply) : undefined;
  const denom = liveMax ?? item.catalogMaxSupply;
  const denomLive = liveMax !== undefined;

  const mintedNum =
    minted !== undefined
      ? minted
      : liveMax !== undefined && remainingSupply !== undefined
        ? liveMax - Number(remainingSupply)
        : undefined;

  // No live minted → status / availability only, no fabricated bar.
  if (mintedNum === undefined || denom === undefined || denom <= 0) {
    return (
      <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {artifactError ? (
          <span className="text-destructive">Supply read error · availability shown when live</span>
        ) : (
          <>Minted count syncing · availability shown when live</>
        )}
      </div>
    );
  }

  const pct = Math.max(0, Math.min(1, mintedNum / denom));
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {fmtInt(mintedNum)}
          <span className="text-[var(--success)]"> live</span> of {fmtInt(denom)}
          <span className={denomLive ? "text-[var(--success)]" : "text-muted-foreground/70"}>
            {" "}
            {denomLive ? "live" : "catalog"}
          </span>
        </span>
        <span className="mono text-[10px] text-foreground">{Math.round(pct * 100)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, background: "var(--gradient-gold)" }}
        />
      </div>
    </div>
  );
}

// ── a single Collect Next card ──────────────────────────────────────────────
function CollectCard({
  item,
  art,
  remainingSupply,
  isMintableConnected,
  paused,
  pausedError,
  artifactError,
  ownedBalance,
  isConnected,
}: {
  item: CollectItem;
  art: ArchiveArtifact | undefined;
  remainingSupply: bigint | undefined;
  isMintableConnected: boolean | undefined;
  paused: boolean | undefined;
  pausedError?: string | null;
  artifactError?: string | null;
  ownedBalance: bigint | undefined;
  isConnected: boolean;
}) {
  const pending = item.supplyMode === "pending";
  const price = resolvePrice(art?.priceUsdc, item.configId);
  const walletLimit =
    art?.walletLimit !== undefined && art.walletLimit > 0n
      ? { text: art.walletLimit.toString(), live: true }
      : item.catalogWalletLimit > 0
        ? { text: item.catalogWalletLimit.toString(), live: false }
        : undefined;

  // Live-derived mint status — never a static "LIVE · MINT OPEN" claim. The
  // pill reflects the actual on-chain active/paused state (or honest
  // read-pending/error), so the UI cannot assert a live state the contract
  // does not report.
  const active = art?.active;
  const anyReadError = Boolean(artifactError);
  // Pause must be explicitly confirmed false before we ever assert mint-open.
  // If paused() is unreadable, we refuse to claim ACTIVE regardless of active.
  const pauseUnknown = paused === undefined && Boolean(pausedError);
  let statusLabel: string;
  let statusTone: "muted" | "success" | "warning";
  if (pending) {
    statusLabel = "PENDING · ERC-721";
    statusTone = "muted";
  } else if (paused === true) {
    statusLabel = "PAUSED ON-CHAIN";
    statusTone = "warning";
  } else if (pauseUnknown) {
    statusLabel = "PAUSE UNREADABLE";
    statusTone = "warning";
  } else if (active === true && paused === false) {
    statusLabel = "ACTIVE · MINT OPEN";
    statusTone = "success";
  } else if (active === false) {
    statusLabel = "CONFIGURED · NOT ACTIVE";
    statusTone = "warning";
  } else if (anyReadError) {
    statusLabel = "READ ERROR";
    statusTone = "warning";
  } else {
    statusLabel = "READ PENDING";
    statusTone = "muted";
  }

  return (
    <div className="surface elevated p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            ID {item.id} · {item.chapter}
          </div>
          <div className="text-base font-semibold text-foreground">{item.name}</div>
        </div>
        <Pill tone={statusTone}>{statusLabel}</Pill>
      </div>

      <p className="text-[12px] text-muted-foreground leading-relaxed">{item.meaning}</p>

      {!pending && (
        <div className="grid grid-cols-3 gap-3 border-t border-border/40 pt-3">
          <Fact label="Price" value={price.text} note={{ text: price.live ? "live" : "catalog", live: price.live }} />
          {walletLimit && (
            <Fact label="Wallet limit" value={walletLimit.text} note={{ text: walletLimit.live ? "live" : "catalog", live: walletLimit.live }} />
          )}
          <Fact
            label="You own"
            value={ownedBalance !== undefined ? `×${ownedBalance.toString()}` : isConnected ? "—" : "connect"}
          />
        </div>
      )}

      <div className="border-t border-border/40 pt-3">
        <MintProgress
          item={item}
          art={art}
          remainingSupply={remainingSupply}
          artifactError={artifactError}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {pending ? (
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Available once SyndicateSeatRecord721 ships
          </span>
        ) : paused === true ? (
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-[color:oklch(0.62_0.18_25)]">
            Mint paused on-chain
          </span>
        ) : pauseUnknown ? (
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-[color:oklch(0.62_0.18_25)]">
            Mint status unverifiable — refreshing
          </span>
        ) : active === true && paused === false ? (
          <Link
            to="/nft"
            className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium text-[oklch(0.22_0.025_260)]"
            style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }}
          >
            Collect →
          </Link>
        ) : active === false ? (
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Mint not open yet
          </span>
        ) : (
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Checking mint status…
          </span>
        )}
        {!pending && isConnected && active === true && paused === false && isMintableConnected === false && (
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Wallet limit reached or not eligible
          </span>
        )}
        <VerifyLink />
      </div>
    </div>
  );
}

// ── main ────────────────────────────────────────────────────────────────────
export function CockpitCollector({ record }: { record?: HolderRecord }) {
  const { address, isConnected } = useAccount();
  const balances = useArchiveBalances(OWNED_IDS);
  const reads = useArchiveArtifactReads(READ_IDS);
  const userBal = useUserBalances(); // live SYN held (balanceOf)

  const walletUrl = address ? explorerUrlForAddress(address) : null;
  const firstSignalBal = balances.balances[1]?.balance;
  const patronSealBal = balances.balances[3]?.balance;
  const ownsAny =
    (firstSignalBal !== undefined && firstSignalBal > 0n) ||
    (patronSealBal !== undefined && patronSealBal > 0n);

  return (
    <GlassCard className="p-5">
      {/* ── 1 · My Holdings & Artifacts ───────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
          What you own
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          · live balanceOf · Archive1155
        </span>
      </div>

      {!isConnected || !address ? (
        <div className="surface elevated p-4 flex flex-col gap-3">
          <p className="text-sm text-foreground">
            Connect your wallet to load owned artifacts — every count a live on-chain read.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/join"
              className="inline-flex items-center justify-center rounded-md px-3.5 py-2 text-xs font-medium text-[oklch(0.22_0.025_260)]"
              style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)" }}
            >
              Join The Syndicate
            </Link>
            <VerifyLink />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* seat-holdings recap — SYN held is a live balanceOf read; SYN
              received / USDC routed come from the SAME record as My Assets
              above, so nothing diverges. Full holdings live in My Assets. */}
          <div className="surface elevated px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {record && (
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Member #{record.memberNumber}
              </span>
            )}
            <span className="mono text-[11px] text-foreground">
              {fmtSyn(userBal.synBalance)} SYN held
              <span className="ml-1 text-[8px] uppercase tracking-[0.14em] text-[var(--success)]">live</span>
            </span>
            {record && (
              <span className="mono text-[11px] text-foreground">
                {fmtInt(Math.round(record.cumulativeSyn))} SYN received
              </span>
            )}
            {record && (
              <span className="mono text-[11px] text-foreground">
                ${fmtInt(Math.round(record.cumulativeUsdc))} USDC routed
              </span>
            )}
            <a href="#my-assets" className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-[var(--gold)]">
              see Assets ↑
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <OwnedChip name="The First Signal" balance={firstSignalBal} error={balances.balances[1]?.error ?? undefined} loading={balances.isLoading} />
            <OwnedChip name="Patron Seal" balance={patronSealBal} error={balances.balances[3]?.error ?? undefined} loading={balances.isLoading} />
          </div>

          {!ownsAny && !balances.isLoading && (
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              No artifacts owned yet — collect a canonical artifact below. Owned artifacts appear here as live reads.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <a
              href={walletUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-muted-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Wallet {SHORT(address)} ↗
            </a>
            <a
              href={ARCHIVE_NFT_EXPLORERS.avascan}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-muted-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Contract {SHORT(ARCHIVE_NFT_CONTRACT_ADDRESS)} ↗
            </a>
          </div>
        </div>
      )}

      {/* ── 2 · Collect Next (with inline mint progress) ──────────────── */}
      <div className="mt-6 mb-3 flex flex-wrap items-center gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
          Collect next
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          · canonical artifacts only · live status
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {COLLECT.map((item) => {
          const read = reads.reads[item.id];
          const ownedBalance = item.id === 1 ? firstSignalBal : item.id === 3 ? patronSealBal : undefined;
          return (
            <CollectCard
              key={item.id}
              item={item}
              art={read?.artifact}
              remainingSupply={read?.remainingSupply}
              isMintableConnected={read?.isMintableConnected}
              paused={reads.paused}
              pausedError={reads.pausedError}
              artifactError={read?.errors.artifact ?? read?.errors.remainingSupply}
              ownedBalance={ownedBalance}
              isConnected={isConnected}
            />
          );
        })}
      </div>

      {/* ── footer · disclaimer + freshness ───────────────────────────── */}
      <div className="mt-4 border-t border-border/40 pt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          {ARCHIVE_DISCLAIMER}
        </p>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 shrink-0">
          reads {reads.isFetching ? "refreshing…" : formatRelativeTime(reads.dataUpdatedAt)}
        </span>
      </div>
    </GlassCard>
  );
}
