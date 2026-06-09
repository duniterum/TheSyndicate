import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMembersLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard-hooks";
import { explorerUrlForAddress } from "@/lib/syndicate-config";
import { fmtAddress } from "@/lib/sale-hooks";
import { GlassCard, Section, SectionHeader, StatusPill } from "@/components/syndicate/Primitives";
import { EmptyState } from "@/components/syndicate/EmptyState";

const PAGE_SIZE = 10;

const fmtNum = (n: number, max = 0) => n.toLocaleString("en-US", { maximumFractionDigits: max });

export function MembersLeaderboard() {
  const { entries, isLoading, isDemo } = useMembersLeaderboard();
  const [page, setPage] = useState(0);

  const total = entries.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = entries.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <Section id="leaderboard">
      <SectionHeader
        eyebrow="Members Leaderboard"
        title={<>Ranked by <span className="text-gradient-gold">Reputation</span></>}
        description="Aggregated from live TokensPurchased events on the Membership Sale contract. Reputation blends rank, total USDC committed, and number of purchases — so conviction and repeat participation both matter."
      />

      <GlassCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <StatusPill status={isDemo ? "DEMO" : "LIVE"} />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {isDemo ? "Illustrative entries — no purchases indexed yet" : `${total} unique buyer${total === 1 ? "" : "s"}`}
            </span>
          </div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Page {safePage + 1} / {pages}
          </div>
        </div>

        {isLoading ? (
          <EmptyState
            variant="compact"
            status="PARTIAL"
            title="Scanning Avalanche RPC"
            description="Fetching Purchase events from the Membership Sale contract. This takes a few seconds on first load."
          />
        ) : (

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4 text-right">USDC</th>
                  <th className="py-3 px-4 text-right">SYN</th>
                  <th className="py-3 px-4 text-right">Buys</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((e, i) => (
                  <Row key={e.buyer} entry={e} index={safePage * PAGE_SIZE + i + 1} />
                ))}
                {slice.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No entries.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border/40">
          <button
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded border border-border/60 disabled:opacity-40 hover:border-[var(--gold)]/60"
          >
            ← Prev
          </button>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Showing {Math.min(total, safePage * PAGE_SIZE + 1)}–{Math.min(total, safePage * PAGE_SIZE + slice.length)} of {total}
          </div>
          <button
            disabled={safePage >= pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            className="mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded border border-border/60 disabled:opacity-40 hover:border-[var(--gold)]/60"
          >
            Next →
          </button>
        </div>
      </GlassCard>

      <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
        Score formula: <span className="mono">√(usdcTotal) × (1 + log₂(1 + purchaseCount))</span>.
        Holding-duration and governance multipliers ship when those contracts deploy.
      </p>
    </Section>
  );
}

function Row({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const url = explorerUrlForAddress(entry.buyer);
  return (
    <tr className="border-b border-border/20 last:border-0 align-top hover:bg-foreground/5 transition-colors">
      <td className="py-3 px-4 mono text-xs text-muted-foreground">{index}</td>
      <td className="py-3 px-4">
        {entry.isDemo ? (
          <span className="mono text-xs">{fmtAddress(entry.buyer)}</span>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/wallet/$address"
              params={{ address: entry.buyer }}
              className="mono text-xs hover:text-[var(--gold)] underline-offset-2 hover:underline"
            >
              {fmtAddress(entry.buyer)}
            </Link>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="mono text-[10px] text-muted-foreground hover:text-[var(--gold)]" title="View on Avascan">
                ↗
              </a>
            ) : null}
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-right mono text-xs font-semibold">{fmtNum(entry.archiveWeight, 2)}</td>
      <td className="py-3 px-4 mono text-xs text-muted-foreground">{entry.rank?.name ?? "—"}</td>
      <td className="py-3 px-4 text-right mono text-xs">${fmtNum(entry.usdcTotal, 2)}</td>
      <td className="py-3 px-4 text-right mono text-xs">{fmtNum(entry.synTotal)}</td>
      <td className="py-3 px-4 text-right mono text-xs">{entry.purchaseCount}</td>
    </tr>
  );
}
