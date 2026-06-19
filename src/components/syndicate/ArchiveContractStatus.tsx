// Read-only Contract Integration Status widget for the deployed
// SyndicateArchive1155 contract on Avalanche C-Chain.
//
// Doctrine: contract is DEPLOYED; ID 1 (First Signal) is the public-open
// mint; ID 3 (Patron Seal) is active but wallet/read-gated; ID 2 is
// reserved/disabled. Reads are real and live where they succeed — values
// that fail or are unavailable show honest labels. No mint/approve/quantity
// UI.
//
// See docs/DEPLOYMENT_STATE_V1.md and docs/CONTRACT_INTEGRATION_STATUS.md.
import { GlassCard, Pill } from "@/components/syndicate/Primitives";
import {
  ARCHIVE_CONTRACT_STATE,
  ARCHIVE_NFT_EXPLORERS,
} from "@/lib/syndicate-config";
import { isValidExplorerUrl } from "@/lib/explorer-guard";
import {
  useArchiveArtifactReads,
  formatRelativeTime,
  type ArchiveIdRead,
} from "@/lib/archive-nft-hooks";
import { RENDERER_MODE_LABEL } from "@/lib/archive-nft-abi";

const SHORT = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

type Tone = "live" | "validation" | "pending" | "reserved" | "error";

function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const styles: Record<Tone, string> = {
    live:       "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    validation: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    pending:    "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    reserved:   "border-border bg-muted/50 text-muted-foreground",
    error:      "border-destructive/40 bg-destructive/10 text-destructive",
  };
  return (
    <span className={`mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${styles[tone]}`}>
      {children}
    </span>
  );
}

const IDS = [1, 2, 3] as const;

export function ArchiveContractStatus() {
  const s = ARCHIVE_CONTRACT_STATE;
  const q = useArchiveArtifactReads(IDS);

  const anyError =
    q.isError ||
    Object.values(q.reads).some((r) =>
      Object.values(r.errors).some((e) => e !== null),
    );
  const anySuccess =
    !!q.dataUpdatedAt &&
    Object.values(q.reads).some(
      (r) =>
        r.remainingSupply !== undefined ||
        r.isMintableReference !== undefined ||
        r.artifact !== undefined,
    );

  const readStatusTone: Tone = q.isLoading
    ? "pending"
    : anySuccess && !anyError
      ? "live"
      : anySuccess && anyError
        ? "validation"
        : "error";
  const readStatusLabel = q.isLoading
    ? "READ · PENDING"
    : anySuccess && !anyError
      ? "READ · OK"
      : anySuccess && anyError
        ? "READ · PARTIAL"
        : "READ · ERROR";

  return (
    <GlassCard className="p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <StatusPill tone="live">DEPLOYED</StatusPill>
        <StatusPill tone="live">PUBLIC DROP READS · {s.publicDropsActivated}</StatusPill>
        {s.artifacts.map((a) => {
          const id = a.id;
          const active = a.active as boolean;
          const reserved = a.configured === "RESERVED_DISABLED";
          const readGated = id === 3 && active;
          const tone: Tone = reserved ? "reserved" : active ? "live" : "validation";
          const label = reserved
            ? `ID ${id} · RESERVED · DISABLED`
            : readGated
              ? `ID ${id} · ACTIVE · READ GATED`
              : active
              ? `ID ${id} · ACTIVE · MINT OPEN`
              : `ID ${id} · CONFIGURED · NOT ACTIVE`;
          return (
            <StatusPill key={id} tone={tone}>
              {label}
            </StatusPill>
          );
        })}
        <StatusPill tone={readStatusTone}>{readStatusLabel}</StatusPill>
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Archive Contract · Avalanche · {s.deployedAt}
        </span>
      </div>

      <h3 className="text-base font-semibold text-foreground">
        Archive Contract — Deployed on Avalanche · First Signal OPEN
      </h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        Read-only contract state. The First Signal (ID 1) public mint is open
        on Avalanche at 0.50 USDC. Patron Seal (ID 3) is CONTRACT_GATED /
        PUBLIC_MINT_READ_GATED and only appears mintable from live Archive1155
        reads. ID 2 is reserved and disabled. Values below come from live
        on-chain reads; if a read fails it is labeled honestly and never
        replaced with fake or zero values.
      </p>

      {/* Address + explorer links */}
      <div className="mt-4 border-t border-border/40 pt-4">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
          Contract address
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="mono text-xs text-foreground break-all">{s.address}</code>
          <span className="mono text-[10px] text-muted-foreground">({SHORT(s.address)})</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(() => {
            const links = [
              { href: ARCHIVE_NFT_EXPLORERS.avascan,   label: "Verify on Avalanche Explorer ↗", primary: true },
              { href: ARCHIVE_NFT_EXPLORERS.snowtrace, label: "SnowTrace ↗" },
              { href: ARCHIVE_NFT_EXPLORERS.routescan, label: "Routescan ↗" },
              { href: ARCHIVE_NFT_EXPLORERS.sourcify,  label: "Sourcify ↗" },
            ].filter((l) => isValidExplorerUrl(l.href));
            if (links.length === 0) {
              return (
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Explorer link pending
                </span>
              );
            }
            return links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  l.primary
                    ? "inline-flex items-center gap-1 mono text-[11px] uppercase tracking-[0.16em] px-2.5 py-1.5 rounded border border-border/60 hover:border-[var(--gold)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50"
                    : "mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded border border-border/60 hover:border-[var(--gold)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50"
                }
              >
                {l.label}
              </a>
            ));
          })()}
        </div>
      </div>


      {/* Status grid */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-border/40 pt-4">
        <KV label="Network" value={`${s.network} (chain ${s.chainId})`} />
        <KV label="Contract status" value="DEPLOYED" />
        <KV label="ID 1 mint state" value="ACTIVE · OPEN" />
        <KV label="Source verification" value={s.sourceVerified} />
        <KV label="Public drops activated" value={String(s.publicDropsActivated)} />
        <KV
          label="Last successful read"
          value={
            q.dataUpdatedAt
              ? formatRelativeTime(q.dataUpdatedAt)
              : q.isLoading
                ? "Pending…"
                : "—"
          }
        />
      </div>

      {/* Connected wallet hint */}
      <div className="mt-3 text-[11px] text-muted-foreground">
        {q.connectedWallet ? (
          <>Connected wallet eligibility uses <span className="mono text-foreground">{SHORT(q.connectedWallet)}</span>. Reference check uses zero address.</>
        ) : (
          <>Connect wallet to check per-wallet eligibility. Reference eligibility below uses the zero address.</>
        )}
      </div>

      {/* Per-artifact rows */}
      <div className="mt-5 border-t border-border/40 pt-4">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Artifact IDs · read-only
        </div>
        <div className="flex flex-col gap-3">
          {s.artifacts.map((a) => (
            <ArtifactRow
              key={a.id}
              meta={a}
              read={q.reads[a.id]}
              walletConnected={Boolean(q.connectedWallet)}
            />
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          ID 1 (The First Signal) public mint is OPEN — 0.50 USDC, wallet
          limit 5. ID 2 is reserved in Archive1155 V1 and intentionally
          non-mintable; Seat Records will live in a separate future ERC-721
          contract (<span className="mono">SyndicateSeatRecord721</span>).
          ID 3 (Patron Seal) is active but wallet/read-gated — 5.00 USDC,
          wallet limit 5, and shown as mintable only from live Archive1155
          reads. All values shown are read directly from the deployed
          contract; missing reads are labeled and never substituted with
          placeholder zeros.
        </p>
      </div>
    </GlassCard>
  );
}

function ArtifactRow({
  meta,
  read,
  walletConnected,
}: {
  meta: typeof ARCHIVE_CONTRACT_STATE.artifacts[number];
  read: ArchiveIdRead | undefined;
  walletConnected: boolean;
}) {
  const reserved = meta.configured === "RESERVED_DISABLED";
  const art = read?.artifact;
  const renderer =
    art?.rendererMode !== undefined ? RENDERER_MODE_LABEL[art.rendererMode] ?? `MODE_${art.rendererMode}` : undefined;

  // Top-line pills. Drive primary status from the static config (known
  // on-chain state) so the row is never blank while live reads resolve.
  // Live reads only refine the values shown in the data cells below.
  const topPills: React.ReactNode[] = [];
  if (reserved) {
    topPills.push(<Pill key="r" tone="muted">RESERVED · DISABLED</Pill>);
    topPills.push(<Pill key="f" tone="warning">FUTURE ERC-721</Pill>);
    topPills.push(<Pill key="n" tone="muted">NOT MINTABLE IN ARCHIVE1155 V1</Pill>);
  } else if (meta.active) {
    const readGated = meta.id === 3;
    topPills.push(
      <Pill key="a" tone="success">
        {readGated ? "ACTIVE · READ GATED" : "ACTIVE · MINT OPEN"}
      </Pill>,
    );
    topPills.push(
      <Pill key="p" tone={readGated ? "navy" : "success"}>
        {readGated ? "WALLET MINTABILITY FROM LIVE READS" : "PUBLIC MINT OPEN"}
      </Pill>,
    );
    if (art?.active === false) {
      topPills.push(<Pill key="w" tone="warning">LIVE READ: active=false</Pill>);
    }
  } else {
    topPills.push(<Pill key="c" tone="navy">CONFIGURED</Pill>);
    topPills.push(<Pill key="na" tone="warning">NOT ACTIVE</Pill>);
  }

  return (
    <div className="surface elevated p-3 flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">ID {meta.id}</span>
          <span className="text-sm font-semibold text-foreground">{meta.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">{topPills}</div>
      </div>

      {/* Read values */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
        <ReadCell
          label="remainingSupply"
          value={
            read?.remainingSupply !== undefined
              ? read.remainingSupply.toString()
              : undefined
          }
          error={read?.errors.remainingSupply}
        />
        <ReadCell
          label="isMintable (ref)"
          value={
            read?.isMintableReference !== undefined
              ? read.isMintableReference ? "TRUE" : "FALSE"
              : undefined
          }
          error={read?.errors.isMintableReference}
        />
        <ReadCell
          label="isMintable (you)"
          value={
            !walletConnected
              ? "Connect wallet to check"
              : read?.isMintableConnected !== undefined
                ? read.isMintableConnected ? "TRUE" : "FALSE"
                : undefined
          }
          error={walletConnected ? read?.errors.isMintableConnected : null}
          mute={!walletConnected}
        />
        <ReadCell
          label="active · frozen · ownerOnly"
          value={
            art
              ? `${art.active ? "Y" : "N"} · ${art.definitionFrozen ? "Y" : "N"} · ${art.ownerOnly ? "Y" : "N"}`
              : undefined
          }
          error={read?.errors.artifact}
        />
      </div>

      {/* Secondary read row */}
      {(art || read?.errors.artifact) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <ReadCell
            label="rendererMode"
            value={renderer}
            error={read?.errors.artifact}
          />
          <ReadCell
            label="maxSupply"
            value={art ? art.maxSupply.toString() : undefined}
            error={read?.errors.artifact}
          />
          <ReadCell
            label="walletLimit"
            value={art ? art.walletLimit.toString() : undefined}
            error={read?.errors.artifact}
          />
          <ReadCell
            label="totalMinted"
            value={art ? art.totalMinted.toString() : undefined}
            error={read?.errors.artifact}
          />
        </div>
      )}

      {art && art.priceUsdc !== undefined && (
        <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          priceUsdc (raw, 6-dec): <span className="text-foreground">{art.priceUsdc.toString()}</span> · reference only · not for sale
        </div>
      )}
    </div>
  );
}

function ReadCell({
  label,
  value,
  error,
  mute,
}: {
  label: string;
  value: string | undefined;
  error: string | null | undefined;
  mute?: boolean;
}) {
  const display = value !== undefined ? value : error ? "Read error" : "Read pending";
  return (
    <div>
      <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-0.5 mono text-[11px] ${
          value !== undefined
            ? mute
              ? "text-muted-foreground"
              : "text-foreground"
            : error
              ? "text-destructive"
              : "text-muted-foreground"
        }`}
        title={error ?? undefined}
      >
        {display}
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
