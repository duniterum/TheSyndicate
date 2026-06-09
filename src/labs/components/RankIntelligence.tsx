// Ranks page intelligence — Rank Distribution + Latest Members + Closest to
// Next Rank. All derived live from the leaderboard hook (TokensPurchased
// events). Renders helpful empty states when no purchases yet.

import { useMemo } from "react";
import { useMembersLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard-hooks";
import { RANKS_V2, rankForUsdc, explorerUrlForAddress } from "@/lib/syndicate-config";
import { fmtAddress } from "@/lib/sale-hooks";
import { GlassCard, Section, SectionHeader, StatusPill } from "@/components/syndicate/Primitives";

const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d });

export function RankIntelligence() {
  const { entries, isLoading, isDemo } = useMembersLeaderboard();

  const dist = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of RANKS_V2) counts.set(r.name, 0);
    for (const e of entries) {
      const name = e.rank?.name ?? "Citizen";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return RANKS_V2.map((r) => ({ name: r.name, count: counts.get(r.name) ?? 0, usdc: r.usdc, group: r.group }));
  }, [entries]);

  const latest = useMemo(() => {
    return [...entries].sort((a, b) => (a.firstBlock === b.firstBlock ? 0 : a.firstBlock > b.firstBlock ? -1 : 1)).slice(0, 8);
  }, [entries]);

  const closest = useMemo(() => {
    return [...entries]
      .map((e) => {
        const next = rankForUsdc(e.usdcTotal).next;
        if (!next) return null;
        return { e, gap: next.usdc - e.usdcTotal, next };
      })
      .filter((x): x is { e: LeaderboardEntry; gap: number; next: typeof RANKS_V2[number] } => x !== null)
      .sort((a, b) => a.gap - b.gap)
      .slice(0, 6);
  }, [entries]);

  return (
    <Section id="rank-intelligence">
      <SectionHeader
        eyebrow="Rank Intelligence"
        title={<>Live <span className="text-gradient-gold">distribution & momentum</span></>}
        description="Who joined recently, how the ranks are filling, and who is one purchase away from leveling up. Everything below is derived live from on-chain purchase events."
      />

      <div className="mb-3 flex items-center gap-2">
        <StatusPill status={isDemo ? "DEMO" : "LIVE"} />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {isDemo ? "Illustrative — no purchases indexed yet" : `${entries.length} unique buyer${entries.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Rank Distribution */}
        <GlassCard className="p-5">
          <h3 className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Rank Distribution</h3>
          {isLoading && !isDemo ? (
            <div className="text-xs text-muted-foreground">Loading…</div>
          ) : (
            <ul className="space-y-2">
              {dist.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-32 truncate">{d.name}</span>
                  <span className="mono text-[10px] text-muted-foreground w-14">${fmt(d.usdc)}+</span>
                  <div className="flex-1 h-1.5 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, d.count * 10)}%`,
                        background: "var(--gradient-gold)",
                      }}
                    />
                  </div>
                  <span className="mono text-xs font-semibold w-8 text-right">{d.count}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {/* Latest Members */}
        <GlassCard className="p-5">
          <h3 className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Latest Members</h3>
          {latest.length === 0 ? (
            <p className="text-xs text-muted-foreground">No members archived yet. The first purchase mints Member #1.</p>
          ) : (
            <ul className="space-y-2">
              {latest.map((e, i) => {
                const url = explorerUrlForAddress(e.buyer);
                return (
                  <li key={e.buyer} className="flex items-center gap-2 text-xs">
                    <span className="mono text-[10px] text-muted-foreground w-6">#{entries.length - i}</span>
                    {url && !e.isDemo ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="mono hover:text-[var(--gold)] truncate flex-1">
                        {fmtAddress(e.buyer)}
                      </a>
                    ) : (
                      <span className="mono truncate flex-1">{fmtAddress(e.buyer)}</span>
                    )}
                    <span className="mono text-[10px] text-muted-foreground truncate">{e.rank?.name ?? "—"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>

        {/* Closest to Next Rank */}
        <GlassCard className="p-5">
          <h3 className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Closest to Next Rank</h3>
          {closest.length === 0 ? (
            <p className="text-xs text-muted-foreground">No members yet. Once buyers exist, the ones nearest to leveling up appear here.</p>
          ) : (
            <ul className="space-y-2">
              {closest.map(({ e, gap, next }) => (
                <li key={e.buyer} className="text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="mono truncate">{fmtAddress(e.buyer)}</span>
                    <span className="mono text-[10px] text-muted-foreground">→ {next.name}</span>
                  </div>
                  <div className="mono text-[10px] text-muted-foreground mt-0.5">
                    ${fmt(e.usdcTotal, 2)} · needs ${fmt(gap, 2)} more
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </Section>
  );
}
