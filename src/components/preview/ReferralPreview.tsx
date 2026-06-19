// /referral page composition — all SIMULATED.

import { useMemo, useState } from "react";
import {
  REFERRAL_TIERS,
  SIM_REFERRAL_EVENTS,
  COMMISSION_BY_TIER,
  tierForCount,
  referrerShareOfGross,
} from "@/lib/preview/referral";
import { PreviewCard, SimPill, BarChart } from "./PreviewPrimitives";
import { SplitVisualizer } from "./SplitVisualizer";

export function ReferralLinkPreview() {
  const [w, setW] = useState("0xYourWalletWillAppearHere…");
  const link = `https://thesyndicate.money/join?ref=${w.slice(0, 6)}…${w.slice(-4)}`;
  return (
    <PreviewCard title="Your referral link" hint="Shape only. The real link will derive from your connected wallet at launch.">
      <div className="flex flex-col gap-2">
        <input
          value={w}
          onChange={(e) => setW(e.target.value)}
          className="mono text-xs bg-background border border-border rounded-md px-3 py-2"
        />
        <div className="mono text-xs text-foreground/80 break-all p-3 rounded-md bg-muted/30 border border-dashed border-border">
          {link}
        </div>
        <div className="text-[11px] text-muted-foreground">
          No copy button yet — link generation is part of the future CommissionRouter integration.
        </div>
      </div>
    </PreviewCard>
  );
}

export function TierLadderPreview() {
  return (
    <PreviewCard title="Tier ladder" hint="Commission shown as a percent of the 10% Operations slice. Final values locked at contract deployment.">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {REFERRAL_TIERS.map((t) => (
          <div key={t.name} className="rounded-md border border-border p-3">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t.name}</div>
            <div className="mt-1 text-lg font-medium">{t.commissionPct}%</div>
            <div className="text-[11px] text-muted-foreground">
              ≥ {t.threshold} referred · retention ≥ {t.retentionRequiredPct}%
            </div>
            <div className="mt-2 text-[10px] mono uppercase tracking-[0.14em] text-foreground/70">
              = {referrerShareOfGross(t).toFixed(2)}% of gross
            </div>
          </div>
        ))}
      </div>
    </PreviewCard>
  );
}

export function CommissionEstimator() {
  const [usdc, setUsdc] = useState(100);
  const [referred, setReferred] = useState(20);
  const tier = useMemo(() => tierForCount(referred), [referred]);
  const commission = (usdc * referrerShareOfGross(tier)) / 100;

  return (
    <PreviewCard title="Commission estimator" hint="Move the sliders to see a simulated commission on a single sale.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-[11px] mono uppercase tracking-[0.18em] text-muted-foreground mb-1">Sale size (USDC)</label>
          <input
            type="range" min={5} max={2500} step={5} value={usdc}
            onChange={(e) => setUsdc(Number(e.target.value))}
            className="w-full"
          />
          <div className="mono text-sm mt-1">${usdc.toLocaleString()}</div>
        </div>
        <div>
          <label className="block text-[11px] mono uppercase tracking-[0.18em] text-muted-foreground mb-1">Members you've referred</label>
          <input
            type="range" min={0} max={120} step={1} value={referred}
            onChange={(e) => setReferred(Number(e.target.value))}
            className="w-full"
          />
          <div className="mono text-sm mt-1">{referred} → {tier.name}</div>
        </div>
        <div className="rounded-md border border-border p-3 bg-[color:oklch(0.78_0.14_60/0.06)]">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Simulated commission</div>
          <div className="mono text-2xl font-medium mt-1">${commission.toFixed(2)}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {tier.commissionPct}% of Operations · {referrerShareOfGross(tier).toFixed(2)}% of gross
          </div>
        </div>
      </div>
    </PreviewCard>
  );
}

export function SimReferralActivity() {
  return (
    <PreviewCard title="Recent referral activity" hint="Fictional sample. Real activity will read from CommissionRouter events.">
      <div className="divide-y divide-border">
        {SIM_REFERRAL_EVENTS.map((e) => (
          <div key={e.id} className="py-2.5 grid grid-cols-[1fr,auto] gap-2 items-center text-xs">
            <div className="min-w-0">
              <div className="text-foreground truncate">
                <span className="mono">{e.referrer}</span>
                <span className="text-muted-foreground"> brought </span>
                <span className="mono">{e.buyerShort}</span>
                <span className="text-muted-foreground"> · ${e.usdc} sale · {e.tier}</span>
              </div>
              <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{e.whenLabel} · pending future contract deployment</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="mono text-foreground">+${e.commissionUsdc.toFixed(2)}</span>
              <SimPill />
            </div>
          </div>
        ))}
      </div>
    </PreviewCard>
  );
}

export function CommissionByTierChart() {
  return (
    <PreviewCard title="Referral commission by tier" hint="Per $100 sale, the dollar amount the referrer receives at each tier.">
      <BarChart
        rows={COMMISSION_BY_TIER.map((c) => ({ label: c.tier, value: c.usdcOn100, tone: "gold" as const }))}
        unit=" USDC"
        max={Math.max(...COMMISSION_BY_TIER.map((c) => c.usdcOn100))}
      />
    </PreviewCard>
  );
}

export function ReferralDisclosure() {
  return (
    <div data-preview="true" className="rounded-md border border-border p-4 text-xs text-muted-foreground leading-relaxed">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground mb-2">Disclosure</div>
      Referral economics are reserved future infrastructure. No CommissionRouter is deployed, no referral
      commission is accruing, and no reward is claimable. If a future referral contract ships, it must preserve
      Vault and Liquidity routing, disclose local-law requirements, and stay separate from any security,
      investment contract, or promise of profit. The Syndicate is an experimental utility membership protocol.
      Participation may result in total loss. All figures here are illustrative planning data, not live state.
    </div>
  );
}

export function SplitVisualizerSection() {
  return <SplitVisualizer />;
}
