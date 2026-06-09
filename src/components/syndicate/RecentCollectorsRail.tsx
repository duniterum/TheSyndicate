// Recent collectors rail for the /nft page — last few wallets that minted
// First Signal or Patron Seal. Indexed live from Archive1155 TransferSingle
// (from = 0x0). When the indexer returns nothing in the window, the rail
// surfaces that honestly with a link to the full contract on Avascan.
import { Link as RouterLink } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useArchiveMintEvents } from "@/lib/archive-mint-events";
import { useHolderIndex } from "@/lib/holder-index";
import { txExplorerUrl, ARCHIVE_NFT_EXPLORERS } from "@/lib/syndicate-config";
import { Section, SectionHeader, StatusPill, GlassCard } from "./Primitives";
import { SourceTag } from "./SourceTag";
import { RetryNotice, RowSkeleton } from "./RetryNotice";

const AVA_BLOCK_SECONDS = 2;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const ARTIFACT_NAME: Record<number, string> = {
  1: "First Signal",
  3: "Patron Seal",
};

function ago(blockDelta: bigint): string {
  const s = Number(blockDelta) * AVA_BLOCK_SECONDS;
  if (s < 60) return `${Math.max(1, s)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86_400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86_400)}d ago`;
}

export function RecentCollectorsRail() {
  const qc = useQueryClient();
  const mints = useArchiveMintEvents({ limit: 5, ids: [1, 3] });
  const idx = useHolderIndex();
  const rows = (mints.data ?? []).slice(0, 5);
  const tip = rows.reduce<bigint>((acc, r) => (r.blockNumber > acc ? r.blockNumber : acc), 0n);
  const refresh = () => qc.invalidateQueries({ queryKey: ["archive-mints"] });

  return (
    <Section id="recent-collectors">
      <SectionHeader
        eyebrow="Recent collectors"
        title={<>The latest <span className="text-gradient-gold">minters</span></>}
        description="Live mints scanned from the Archive contract on Avalanche. Member numbers shown when the wallet is indexed from a prior SYN purchase; otherwise wallet only."
      />
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/40 flex flex-wrap items-center gap-2">
          <StatusPill status={rows.length > 0 ? "LIVE" : "PARTIAL"} />
          <SourceTag source="INDEXED" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            TransferSingle from 0x0 · last ~4 days
          </span>
          <a
            href={ARCHIVE_NFT_EXPLORERS.avascan}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto mono text-[10px] uppercase tracking-[0.18em] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            All collectors on Avascan ↗
          </a>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2 py-1 hover:border-[var(--gold)]/50 hover:text-foreground"
            aria-label="Refresh recent collectors"
          >
            ↻
          </button>
        </div>
        {mints.isLoading && rows.length === 0 ? (
          <RowSkeleton rows={3} />
        ) : mints.isError && rows.length === 0 ? (
          <RetryNotice
            message="Could not scan recent mints."
            detail="Public Avalanche RPC may be throttling log requests."
            onRetry={refresh}
          />
        ) : rows.length === 0 ? (
          <div className="px-4 py-6 mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            No mints in the indexed window yet. Be the next collector.
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            {rows.map((m, i) => {
              const rec = idx.getByWallet(m.to);
              return (
                <li
                  key={`${m.txHash}-${m.logIndex}`}
                  className="px-4 py-3 grid grid-cols-12 gap-3 items-center text-sm hover:bg-[var(--gold)]/[0.03] transition-colors"
                >
                  <div className="col-span-1 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="col-span-11 sm:col-span-4 flex items-center gap-2 min-w-0">
                    <span className="size-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span className="text-foreground/90 truncate">
                      {ARTIFACT_NAME[m.tokenId] ?? `Artifact #${m.tokenId}`}
                      {m.value > 1 ? ` ×${m.value}` : ""}
                    </span>
                  </div>
                  <div className="col-span-6 sm:col-span-3 mono text-[11px]">
                    {rec ? (
                      <RouterLink
                        to="/wallet/$address"
                        params={{ address: m.to }}
                        className="text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
                      >
                        Member #{rec.memberNumber} · {short(m.to)}
                      </RouterLink>
                    ) : (
                      <span className="text-muted-foreground">{short(m.to)}</span>
                    )}
                  </div>
                  <div className="col-span-3 sm:col-span-2 mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {tip > 0n && m.blockNumber > 0n
                      ? ago(tip > m.blockNumber ? tip - m.blockNumber : 0n)
                      : "—"}
                  </div>
                  <div className="col-span-3 sm:col-span-2 sm:text-right">
                    <a
                      href={txExplorerUrl(m.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
                    >
                      Verify ↗
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </Section>
  );
}
