// My Archive Preview — read-only personal Archive panel for /my-syndicate.
//
// Doctrine:
// - Never invent ownership. balanceOf is a real on-chain read; failures
//   surface as "Read pending" / "Read error".
// - ID 2 is reserved and disabled in Archive1155 V1; Seat Records will
//   live in a separate future ERC-721 contract (SyndicateSeatRecord721).
// - No write paths, no mint, no approve, no admin.
import { useAccount } from "wagmi";
import { Link } from "@tanstack/react-router";
import { GlassCard, Pill } from "@/components/syndicate/Primitives";
import { PREVIEW_ARTIFACTS, PREVIEW_IDS } from "@/lib/archive-preview-catalog";
import { useArchiveBalances } from "@/lib/archive-balances-hook";
import { useArchiveArtifactReads } from "@/lib/archive-nft-hooks";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";

const SHORT = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function MyArchivePreview() {
  const { address, isConnected } = useAccount();
  const q = useArchiveBalances(PREVIEW_IDS);
  const artifactReads = useArchiveArtifactReads([1, 2, 3]);

  return (
    <div id="my-archive">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Pill tone="success">ID 1 · ACTIVE · MINT OPEN</Pill>
        <Pill tone="navy">ID 3 · ACTIVE · READ GATED</Pill>
        <Pill tone="navy">READ-ONLY OTHER IDS</Pill>
      </div>

      <GlassCard className="p-5">
        <div className="mb-4 border-b border-border/40 pb-3">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Archive1155 assets
          </div>
          <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
            Real per-wallet balance reads from the deployed Archive contract. The
            First Signal (ID 1) is open; Patron Seal (ID 3) is active but
            wallet/read-gated; owned Artifacts appear here after minting.
          </p>
        </div>
        {/* Compact token ID status list */}
        <div className="mb-4">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Artifact IDs · read-only status
          </div>
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((id) => {
              const meta = PREVIEW_ARTIFACTS.find((a) => a.id === id);
              const read = artifactReads.reads[id];
              const reserved = meta?.status === "RESERVED_DISABLED";
              const art = read?.artifact;
              const hasRead = art !== undefined;
              const readErr = read?.errors.artifact;

              let statusText: string;
              let meaningText: string;
              let tone: "muted" | "navy" | "warning" | "success" = "navy";

              if (reserved) {
                statusText = "Reserved · Disabled · Future ERC-721";
                meaningText = "Not mintable in Archive1155 V1 — future SyndicateSeatRecord721";
                tone = "muted";
              } else if (meta?.status === "ACTIVE_MINT_OPEN") {
                // ID 1 is ACTIVE at the contract level (active=true,
                // definitionFrozen=true). A failed RPC read MUST NOT
                // imply "no public mint yet" — show a refreshing state.
                const readGated = id === 3;
                statusText = readGated ? "Active · Read gated" : "Active · Mint OPEN";
                meaningText = readGated
                  ? readErr
                    ? "Active support Artifact — refreshing wallet/read-gated status."
                    : "Patron Seal — mintability comes from live Archive1155 reads"
                  : readErr
                    ? "Public mint OPEN — refreshing on-chain status."
                    : "First public Artifact — 0.50 USDC on Avalanche";
                tone = "success";
              } else if (readErr) {
                statusText = "Configured · Not active";
                meaningText = "Previewable Artifact, not active yet";
                tone = "warning";
              } else if (hasRead && art.active) {
                statusText = "Configured · Active";
                meaningText = "Previewable Artifact";
                tone = "success";
              } else {
                statusText = "Configured · Not active";
                meaningText = "Previewable Artifact, not active yet";
                tone = "navy";
              }

              return (
                <div key={id} className="surface elevated p-3 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">ID {id}</span>
                      <span className="text-sm font-semibold text-foreground">{meta?.name}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{meaningText}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Pill tone={tone}>{statusText}</Pill>
                    {!hasRead && !reserved && !readErr && (
                      <span className="mono text-[10px] text-muted-foreground">Read pending</span>
                    )}
                    {readErr && !reserved && (
                      <span className="mono text-[10px] text-destructive" title={readErr}>Read error</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isConnected || !address ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-foreground">
              Connect your wallet to preview your Archive assets.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/join"
                className="inline-flex items-center justify-center rounded-md px-3.5 py-2 text-xs font-medium text-[oklch(0.22_0.025_260)]"
                style={{
                  background: "var(--gradient-gold)",
                  boxShadow: "var(--shadow-glow-gold)",
                }}
              >
                Join The Syndicate
              </Link>
              <Link
                to="/nft"
                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/60 hover:bg-card px-3.5 py-2 text-xs font-medium text-foreground"
              >
                Explore Archive
              </Link>
              <a
                href={ARCHIVE_NFT_EXPLORERS.avascan}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-[11px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)]"
              >
                Verify contract ↗
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Wallet
              </span>
              <a
                href={explorerUrlForAddress(address) ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-xs text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
              >
                {SHORT(address)} ↗
              </a>
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Contract
              </span>
              <a
                href={ARCHIVE_NFT_EXPLORERS.avascan}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-xs text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
              >
                {SHORT(ARCHIVE_NFT_CONTRACT_ADDRESS)} ↗
              </a>
            </div>

            {/* Empty-state notice — The First Signal (ID 1) is the first
                public Artifact mint; other Artifacts are protocol-memory surfaces sealed by event. */}
            <div className="surface elevated p-3 mb-3 text-xs text-muted-foreground leading-relaxed">
              The First Signal (ID 1) is an open public Artifact mint —
              open at 0.50 USDC on Avalanche. Patron Seal (ID 3) is active
              but wallet/read-gated; other Artifacts are sealed, reserved, or
              future-contract surfaces. Join The Syndicate to take your seat;
              owned Artifacts will appear here as real on-chain reads.
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Link
                  to="/join"
                  className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium text-[oklch(0.22_0.025_260)]"
                  style={{
                    background: "var(--gradient-gold)",
                    boxShadow: "var(--shadow-glow-gold)",
                  }}
                >
                  Join The Syndicate
                </Link>
                <Link
                  to="/nft"
                  className="inline-flex items-center justify-center rounded-md border border-border/60 bg-card/60 hover:bg-card px-3 py-1.5 text-[11px] font-medium text-foreground"
                >
                  Explore Archive
                </Link>
                <a
                  href={ARCHIVE_NFT_EXPLORERS.avascan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-[10px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)]"
                >
                  Verify contract ↗
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              {PREVIEW_ARTIFACTS.map((a) => {
                const r = q.balances[a.id];
                const reserved = a.status === "RESERVED_DISABLED";
                const balanceText =
                  reserved
                    ? "Reserved · not mintable"
                    : r?.balance !== undefined
                      ? r.balance.toString()
                      : r?.error
                        ? "Read error"
                        : q.isLoading
                          ? "Read pending"
                          : "Ownership read pending";
                const tone =
                  reserved
                    ? "muted"
                    : r?.balance !== undefined && r.balance > 0n
                      ? "success"
                      : a.status === "ACTIVE_MINT_OPEN"
                        ? "success"
                        : a.status === "DEPLOYED_CONFIGURED"
                          ? "navy"
                          : "warning";
                return (
                  <div
                    key={a.id}
                    className="surface elevated p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        ID {a.id}
                      </div>
                      <div className="text-sm font-semibold text-foreground truncate">
                        {a.name}
                      </div>
                      {reserved && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Future SyndicateSeatRecord721 — separate ERC-721
                          contract, not part of Archive1155 V1.
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Pill tone={tone}>
                        {reserved
                          ? "RESERVED · DISABLED"
                          : a.status === "ACTIVE_MINT_OPEN"
                            ? a.id === 3
                              ? "ACTIVE · READ GATED"
                              : "ACTIVE · MINT OPEN"
                            : "NOT ACTIVE"}
                      </Pill>

                      <span
                        className="mono text-[11px] text-foreground"
                        title={r?.error ?? undefined}
                      >
                        bal: {balanceText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
              Balances come from a live{" "}
              <span className="mono text-foreground">balanceOf(wallet, id)</span>{" "}
              read against the deployed Archive contract. The First Signal
              (ID 1) public mint is OPEN — owned Artifacts appear here after
              minting. Patron Seal (ID 3) is active but wallet/read-gated.
              ID 2 is reserved/disabled in V1 — a future ERC-721 will hold
              Seat Records.
            </p>
          </>
        )}
      </GlassCard>
    </div>
  );
}
