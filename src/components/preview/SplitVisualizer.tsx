// Buy-flow split visualizer — explains 70/20/10 and where referral commission comes from.
// Uses live PROTOCOL_SPLIT constants and SIMULATED referral commission percentages.

import { useState } from "react";
import { PROTOCOL_SPLIT, REFERRAL_TIERS, tierForCount, referrerShareOfGross } from "@/lib/preview/referral";
import { SimPill } from "./PreviewPrimitives";

export function SplitVisualizer() {
  const [withRef, setWithRef] = useState(true);
  const [tierIdx, setTierIdx] = useState(2); // Patron default
  const tier = REFERRAL_TIERS[tierIdx] ?? tierForCount(0);

  const referrerPct = withRef ? referrerShareOfGross(tier) : 0;
  const opsRemainPct = PROTOCOL_SPLIT.operations - referrerPct;

  const Seg = ({ label, pct, bg, tone }: { label: string; pct: number; bg: string; tone?: string }) => (
    <div
      className="flex items-center justify-center text-[11px] font-medium px-2 transition-all"
      style={{ width: `${pct}%`, background: bg, color: tone ?? "oklch(0.20 0.005 60)", minWidth: pct > 0 ? 60 : 0 }}
      title={`${label} — ${pct.toFixed(2)}%`}
    >
      <span className="truncate mono uppercase tracking-[0.12em]">
        {label} · {pct.toFixed(pct < 10 ? 1 : 0)}%
      </span>
    </div>
  );

  return (
    <div data-preview="true" className="surface elevated p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-sm font-medium text-foreground">Where every $1 goes</div>
          <div className="text-xs text-muted-foreground">
            Vault and Liquidity are <span className="font-medium text-foreground">untouched</span>. Referral commission comes only from the 10% Operations slice.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SimPill kind="SIMULATED" />
          <button
            type="button"
            onClick={() => setWithRef((v) => !v)}
            className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border px-3 py-1.5 hover:border-[color:var(--gold)]/60"
          >
            {withRef ? "With referral" : "Without referral"}
          </button>
        </div>
      </div>

      <div className="flex h-12 rounded-md overflow-hidden border border-border">
        <Seg label="Vault" pct={PROTOCOL_SPLIT.vault} bg="var(--gradient-gold)" />
        <Seg label="Liquidity" pct={PROTOCOL_SPLIT.liquidity} bg="var(--gradient-navy)" tone="var(--primary-foreground)" />
        {withRef && referrerPct > 0 && (
          <Seg label="Referrer" pct={referrerPct} bg="var(--success)" tone="oklch(0.20 0.005 60)" />
        )}
        <Seg label="Operations" pct={opsRemainPct} bg="color-mix(in oklab, var(--foreground) 18%, transparent)" tone="var(--foreground)" />
      </div>

      {withRef && (
        <div className="mt-4 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
          <span>Referrer tier:</span>
          {REFERRAL_TIERS.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setTierIdx(i)}
              className={`mono uppercase tracking-[0.14em] text-[10px] px-2 py-1 rounded border transition ${
                i === tierIdx
                  ? "border-[color:var(--gold)] text-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              {t.name}
            </button>
          ))}
          <span className="ml-auto">
            Referrer gets <span className="mono text-foreground">{tier.commissionPct}%</span> of Operations ={" "}
            <span className="mono text-foreground">{referrerPct.toFixed(2)}%</span> of gross
          </span>
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">
        Indicative tiers — final commission table is locked at CommissionRouter deployment.
      </p>
    </div>
  );
}
