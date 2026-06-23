import { Link } from "@tanstack/react-router";
import { ArrowRight, FileCheck2, Landmark, Route, ShieldCheck } from "lucide-react";

import { useLivePurchaseEvents } from "@/lib/activity-hooks";
import { useHolderIndex } from "@/lib/holder-index";
import { CURRENT_SOURCE_POLICY_SNAPSHOT } from "@/lib/source-policy-observability";

import { GlassCard, Pill, Section, SectionHeader, StatusPill, type CanonicalStatus } from "./Primitives";

const fmtUsd = (value: number) =>
  `$${value.toLocaleString("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  })}`;

const fmtInt = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 0 });

type EconomyMetric = {
  label: string;
  value: string;
  status: CanonicalStatus;
  evidence: string;
  note: string;
};

function MetricCard({ metric }: { metric: EconomyMetric }) {
  return (
    <GlassCard className="border-slate-800/80 bg-slate-950/72 p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
        <StatusPill status={metric.status} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-50 md:text-[1.7rem]">{metric.value}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{metric.note}</p>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-cyan-200/80">{metric.evidence}</p>
    </GlassCard>
  );
}

export function ProtocolEconomyBand() {
  const purchases = useLivePurchaseEvents({ limit: 5000 });
  const holderIndex = useHolderIndex();
  const sourcePolicy = CURRENT_SOURCE_POLICY_SNAPSHOT;
  const events = purchases.data ?? [];

  const routed = events.reduce(
    (acc, event) => {
      acc.grossUsdc += event.usdcAmount;
      acc.acquisitionCost += event.acquisitionCostAmount ?? event.referralAmount ?? 0;
      acc.vault += event.vaultAmount;
      acc.liquidity += event.liquidityAmount;
      acc.operations += event.operationsAmount;
      return acc;
    },
    { grossUsdc: 0, acquisitionCost: 0, vault: 0, liquidity: 0, operations: 0 },
  );

  const netRouted = routed.vault + routed.liquidity + routed.operations;
  const readStatus: CanonicalStatus =
    purchases.isError || holderIndex.isError ? "PARTIAL" : purchases.isLoading || holderIndex.isLoading ? "PARTIAL" : "LIVE";

  const metrics: EconomyMetric[] = [
    {
      label: "Membership flow",
      value: `${fmtInt(holderIndex.totals.members)} seated wallets`,
      status: readStatus,
      evidence: "Holder Index + purchase receipts",
      note: "SYN remains the V1 seat. Member count is adoption, not revenue.",
    },
    {
      label: "Net USDC routed",
      value: fmtUsd(netRouted),
      status: readStatus,
      evidence: "Receipt routing fields",
      note: "USDC paid minus any acquisition commission, then routed through Vault, Liquidity, and Operations.",
    },
    {
      label: "Vault / Liquidity / Operations",
      value: `${fmtUsd(routed.vault)} / ${fmtUsd(routed.liquidity)} / ${fmtUsd(routed.operations)}`,
      status: readStatus,
      evidence: "70 / 20 / 10 receipt split",
      note: "Volume is not revenue. Treasury balance is not profit. These are transparent routing totals.",
    },
    {
      label: "Verified receipts",
      value: fmtInt(events.length),
      status: readStatus,
      evidence: "Activity read model",
      note: "Every recorded purchase can be inspected through Activity, Register, and Explorer links.",
    },
  ];

  return (
    <Section id="protocol-economy" className="border-b border-slate-900/70 bg-slate-950/72 py-10 md:py-12">
      <div className="w-full">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Protocol Economy Observatory"
            title="One compact read-only view of how membership value moves."
            description="This surface is evidence-labeled and non-transactional: seats, receipts, routing, and future modules stay separate so the protocol does not become a yield dashboard."
          />
          <div className="flex flex-wrap gap-2">
            <Pill tone="success">
              V3 direct-buy target
            </Pill>
            <Pill tone="muted">
              ZERO_SOURCE_ID default
            </Pill>
            <Pill tone="navy">
              No writes here
            </Pill>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="border-slate-800/80 bg-slate-950/78 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">
                <Route className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">Current acquisition truth</p>
                <p className="mt-2 text-base leading-relaxed text-slate-200">
                  {sourcePolicy.currentSummary} Public/default V3 buys use
                  ZERO_SOURCE_ID, and no claim UI is live.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill tone="muted">Source records: {sourcePolicy.recordCount}</Pill>
                  <Pill tone="muted">{sourcePolicy.referralActive ? "Referral active" : "Referral inactive"}</Pill>
                  <Pill tone="muted">{sourcePolicy.claimingActive ? "Claims active" : "Claims inactive"}</Pill>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-slate-800/80 bg-slate-950/78 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Future modules</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              {sourcePolicy.productCapabilities.slice(1).map((capability) => (
                <div key={capability.product} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/45 px-3 py-2">
                  <span>{capability.product}</span>
                  <Pill tone="navy">
                    {capability.status === "NOT_SOURCE_AWARE" ? "NOT SOURCE-AWARE" : "DESIGN REQUIRED"}
                  </Pill>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            Verification before trust
          </span>
          <span className="inline-flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-cyan-200" aria-hidden="true" />
            Receipt-backed only
          </span>
          <span className="inline-flex items-center gap-2">
            <Landmark className="h-4 w-4 text-amber-200" aria-hidden="true" />
            Company and protocol remain distinct
          </span>
          <Link
            to="/registry"
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-100"
          >
            Verify registry <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
