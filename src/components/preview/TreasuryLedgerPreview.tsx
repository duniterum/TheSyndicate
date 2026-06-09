// Treasury Ledger preview — simulated source → destination rows with directional tags.
// No fake tx hashes. No fake explorer links. PENDING rows say so.

import { SIM_TREASURY_ROWS, TREASURY_CATEGORIES } from "@/lib/preview/referral";
import { PreviewCard, SimPill, BarChart } from "./PreviewPrimitives";

export function TreasuryLedgerPreview() {
  return (
    <PreviewCard
      title="Treasury Ledger (preview)"
      hint='Directional movement tags answering "where did the money go?". Real rows will link to a tx hash; simulated rows do not.'
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="text-left mono uppercase tracking-[0.14em] text-[10px]">
              <th className="py-2 pr-3">Source</th>
              <th className="py-2 pr-3">→ Destination</th>
              <th className="py-2 pr-3 text-right">Amount</th>
              <th className="py-2 pr-3">Reason</th>
              <th className="py-2 pr-3">When</th>
              <th className="py-2 pl-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {SIM_TREASURY_ROWS.map((r) => (
              <tr key={r.id}>
                <td className="py-2 pr-3 text-foreground/85">{r.source}</td>
                <td className="py-2 pr-3 text-foreground/85">→ {r.destination}</td>
                <td className="py-2 pr-3 text-right mono">${r.amountUsdc.toLocaleString()}</td>
                <td className="py-2 pr-3 mono text-[11px] text-foreground/80">{r.reason}</td>
                <td className="py-2 pr-3 text-muted-foreground">
                  {r.status === "SIMULATED" ? r.whenLabel : "pending future contract deployment"}
                </td>
                <td className="py-2 pl-3 text-right"><SimPill kind={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Schema is forward-compatible with the canonical Attribution event. When CommissionRouter ships,
        these rows will be replaced by live router emissions with explorer links.
      </p>
    </PreviewCard>
  );
}

export function TreasuryCategoryChart() {
  return (
    <PreviewCard title="Treasury movement categories" hint="Share of total outflow this preview window.">
      <BarChart
        rows={TREASURY_CATEGORIES.map((c) => ({ label: c.tag, value: c.pct, tone: c.tone }))}
        unit="%"
        max={100}
      />
    </PreviewCard>
  );
}
