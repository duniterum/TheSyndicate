// Simulated Reputation / Builder Score leaderboard.
// Ranks by composite score (retention + durability + age + reach), NOT by gross.
// Gross commission is a tiebreaker only — shown as the rightmost column for context.

import { rankedReferrers, RETENTION_CURVE, SIM_REFERRERS, builderScore } from "@/lib/preview/referral";
import { PreviewCard, SimPill, BarChart, Sparkline } from "./PreviewPrimitives";

export function ReputationLeaderboard() {
  const rows = rankedReferrers();
  return (
    <PreviewCard
      title="Reputation leaderboard"
      hint="Score = retention 40% · durability 30% · age 20% · reach 10%. Gross is tiebreaker only."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="text-left mono uppercase tracking-[0.14em] text-[10px]">
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Referrer</th>
              <th className="py-2 pr-3 text-right">Score</th>
              <th className="py-2 pr-3 text-right">Retention</th>
              <th className="py-2 pr-3 text-right">Durability</th>
              <th className="py-2 pr-3 text-right">Members</th>
              <th className="py-2 pr-3 text-right">Active 1y</th>
              <th className="py-2 pr-3 text-right">Age (d)</th>
              <th className="py-2 pr-3 text-right">Gross (tiebreak)</th>
              <th className="py-2 pl-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={r.wallet} className="hover:bg-muted/20">
                <td className="py-2 pr-3 mono text-muted-foreground">{i + 1}</td>
                <td className="py-2 pr-3">
                  <div className="text-foreground">{r.handle}</div>
                  <div className="mono text-[10px] text-muted-foreground">{r.wallet.slice(0, 6)}…{r.wallet.slice(-4)}</div>
                </td>
                <td className="py-2 pr-3 text-right mono text-foreground">{r.score.toFixed(1)}</td>
                <td className="py-2 pr-3 text-right mono">{r.retentionScore}</td>
                <td className="py-2 pr-3 text-right mono">{r.durabilityScore}</td>
                <td className="py-2 pr-3 text-right mono">{r.referredMembers}</td>
                <td className="py-2 pr-3 text-right mono">{r.activeAfter1y}</td>
                <td className="py-2 pr-3 text-right mono">{r.referrerAgeDays}</td>
                <td className="py-2 pr-3 text-right mono text-muted-foreground">${r.grossCommissionUsdc.toLocaleString()}</td>
                <td className="py-2 pl-3 text-right"><SimPill /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        SIMULATED · Future Reputation preview. Not live. For UX testing only.
        Formula is not final — see <code className="mono">docs/REPUTATION_FORMULA_DOCTRINE.md</code>.
      </p>
    </PreviewCard>
  );
}

export function BuilderScoreComparisonChart() {
  const rows = SIM_REFERRERS.slice(0, 6).map((r) => ({
    label: r.handle.replace(".eth", ""),
    value: Number(builderScore(r).toFixed(1)),
    tone: "navy" as const,
  }));
  return (
    <PreviewCard title="Builder Score comparison" hint="Top 6 simulated referrers, by composite score.">
      <BarChart rows={rows} max={100} />
    </PreviewCard>
  );
}

export function RetentionOverTimeChart() {
  return (
    <PreviewCard title="Retention over time" hint="Fictional cohort of 100 referred members across 12 weeks.">
      <Sparkline points={RETENTION_CURVE.map((p) => ({ x: p.week, y: p.active }))} height={120} />
      <div className="mt-2 flex items-center justify-between text-[10px] mono uppercase tracking-[0.16em] text-muted-foreground">
        <span>Week 0</span>
        <span>Week 6</span>
        <span>Week 12 · {RETENTION_CURVE[RETENTION_CURVE.length - 1].active}% still active</span>
      </div>
    </PreviewCard>
  );
}
