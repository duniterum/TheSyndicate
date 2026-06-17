// Home KPI grid — the cockpit's first-class numbers, in one scannable card row.
//
// Pure projection. Every value comes from the canonical truth layer
// (useProtocolTruth) plus useSynSupply for the burned-supply read. No invented
// numbers: an unresolved read renders the canonical "—" and a PENDING pill.
// Labels/units are formatted through the shared registry formatter so the cockpit
// agrees with every other surface. Each card links to its on-chain verification.
//
// Seven metrics, fixed order:
//   Members · Next Seat · USDC Routed · Vault Balance · LP TVL · Burned SYN · Last Action

import { useProtocolTruth } from "@/lib/protocol-truth";
import { useSynSupply } from "@/lib/treasury-hooks";
import { formatMetricValue } from "@/components/metrics/MetricDisplays";
import { requireMetric } from "@/lib/protocol-metrics-registry";
import { Section, SectionHeader, StatusPill, type CanonicalStatus } from "./Primitives";

type Kpi = {
  key: string;
  label: string;
  value: string;
  status: CanonicalStatus;
  href: string | null;
  hint?: string;
  emphasize?: boolean;
};

export function HomeKpiGrid() {
  const t = useProtocolTruth();
  const supply = useSynSupply();

  const burnedHref = requireMetric("burnedSupply").verification.primaryHref;

  const cards: Kpi[] = [
    {
      key: "members",
      label: "Members",
      value: formatMetricValue(t.members.value, "count"),
      status: t.members.status,
      href: t.members.verifyHref,
      hint: "Seats sealed on-chain",
    },
    {
      key: "nextSeat",
      label: "Next Seat",
      value:
        t.nextMemberNumber.value !== undefined
          ? `#${formatMetricValue(t.nextMemberNumber.value, "count")}`
          : "—",
      status: t.nextMemberNumber.status,
      href: t.nextMemberNumber.verifyHref,
      hint: "The seat waiting to be taken",
      emphasize: true,
    },
    {
      key: "usdcRouted",
      label: "USDC Routed",
      value: formatMetricValue(t.usdcRaised.value, "USD"),
      status: t.usdcRaised.status,
      href: t.usdcRaised.verifyHref,
      hint: "Through the Membership Sale",
    },
    {
      key: "vault",
      label: "Vault Balance",
      value: formatMetricValue(t.vaultUsdc.value, "USD"),
      status: t.vaultUsdc.status,
      href: t.vaultUsdc.verifyHref,
      hint: "70% of every purchase",
    },
    {
      key: "lpTvl",
      label: "LP TVL",
      value: formatMetricValue(t.lpTvlUsd.value, "USD"),
      status: t.lpTvlUsd.status,
      href: t.lpTvlUsd.verifyHref,
      hint: "SYN / USDC pool",
    },
    {
      key: "burned",
      label: "Burned SYN",
      value: formatMetricValue(supply.burned, "SYN"),
      status: supply.burned !== undefined ? "LIVE" : "PENDING",
      href: burnedHref,
      hint: "Permanently sent to dead address",
    },
    {
      key: "lastAction",
      label: "Last Action",
      value: formatMetricValue(t.lastBuyAgoSeconds.value, "seconds"),
      status: t.lastBuyAgoSeconds.status,
      href: t.lastBuyAgoSeconds.verifyHref,
      hint: "Most recent on-chain purchase",
    },
  ];

  return (
    <Section id="home-kpis">
      <SectionHeader
        eyebrow="Protocol KPIs"
        title={<>The numbers, <span className="text-gradient-gold">read live</span></>}
        description="Seven first-class metrics, each read on-chain from Avalanche. Every card carries a status pill and a link to verify it yourself."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
        {cards.map((c) => (
          <KpiCard key={c.key} kpi={c} />
        ))}
      </div>
    </Section>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const inner = (
    <div
      className={`surface elevated p-3.5 h-full flex flex-col gap-1.5 transition-colors ${
        kpi.href ? "hover:border-[var(--gold)]/40" : ""
      } ${kpi.emphasize ? "border-[var(--gold)]/30 bg-[var(--gold)]/[0.03]" : ""}`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground truncate">
          {kpi.label}
        </span>
        <StatusPill status={kpi.status} />
      </div>
      <div className="mono text-lg md:text-xl font-semibold leading-none tabular-nums truncate text-foreground">
        {kpi.value}
      </div>
      {kpi.hint && (
        <div className="text-[10px] text-muted-foreground leading-snug">{kpi.hint}</div>
      )}
      {kpi.href && (
        <div className="mono mt-auto pt-1.5 text-[9px] uppercase tracking-[0.18em] text-[var(--verify)]/80 group-hover:text-[var(--verify)] transition-colors">
          Verify ↗
        </div>
      )}
    </div>
  );

  return kpi.href ? (
    <a
      href={kpi.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Verify ${kpi.label} on-chain`}
      className="block group"
    >
      {inner}
    </a>
  ) : (
    inner
  );
}
