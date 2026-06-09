// Capital allocation — where every USDC routes onchain.
// Sale split is hard-routed by the Membership Sale contract (70/20/10).
// Reserve + Future Investments tracked via SYN allocation wallet balances.

import { Section, SectionHeader, ContractLink } from "@/components/syndicate/Primitives";
import { USDC_ROUTING, CONTRACTS, ALLOCATION_WALLETS, explorerUrlForAddress, extrasForAddress } from "@/lib/syndicate-config";
import { useSaleStats } from "@/lib/sale-hooks";
import { useAllocationBalances } from "@/lib/sale-hooks";
import { formatUnits } from "viem";
import { USDC_DECIMALS } from "@/lib/syndicate-config";

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const fmtSyn = (n: number) =>
  `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} SYN`;

export function CapitalAllocation() {
  const s = useSaleStats();
  const usdcRaised =
    s.totalUsdcRaised !== undefined ? Number(formatUnits(s.totalUsdcRaised, USDC_DECIMALS)) : undefined;

  const reserveAddr = ALLOCATION_WALLETS["Vault Reserve"];
  const futureAddr  = ALLOCATION_WALLETS["Future Ecosystem"];
  const opsAddr     = CONTRACTS.OPERATIONS_WALLET;
  const liqAddr     = CONTRACTS.LIQUIDITY_WALLET;

  const balances = useAllocationBalances([reserveAddr, futureAddr]);
  const reserveSyn = balances.balances[reserveAddr.toLowerCase()];
  const futureSyn  = balances.balances[futureAddr.toLowerCase()];

  type Slice = {
    label: string;
    pct: number | null;
    usd?: number;
    syn?: number;
    address: string;
    source: string;
    tone: string;
  };

  const slices: Slice[] = [
    {
      label: "Treasury (Vault)",
      pct: USDC_ROUTING[0].pct,
      usd: usdcRaised !== undefined ? usdcRaised * 0.7 : undefined,
      address: CONTRACTS.VAULT_WALLET,
      source: "70% of every sale USDC · routed onchain",
      tone: "bg-[var(--gold)]/70",
    },
    {
      label: "Liquidity",
      pct: USDC_ROUTING[1].pct,
      usd: usdcRaised !== undefined ? usdcRaised * 0.2 : undefined,
      address: liqAddr,
      source: "20% of every sale USDC · LP reinforcement",
      tone: "bg-sky-500/70",
    },
    {
      label: "Operations",
      pct: USDC_ROUTING[2].pct,
      usd: usdcRaised !== undefined ? usdcRaised * 0.1 : undefined,
      address: opsAddr,
      source: "10% of every sale USDC · build & ship",
      tone: "bg-amber-500/70",
    },
    {
      label: "Reserve (SYN)",
      pct: null,
      syn: reserveSyn,
      address: reserveAddr,
      source: "Vault Reserve allocation wallet · live balanceOf",
      tone: "bg-violet-500/70",
    },
    {
      label: "Future Investments",
      pct: null,
      syn: futureSyn,
      address: futureAddr,
      source: "Future Ecosystem allocation wallet · live balanceOf",
      tone: "bg-fuchsia-500/70",
    },
  ];

  const usdcTotalPct = USDC_ROUTING.reduce((s, r) => s + r.pct, 0);

  return (
    <Section id="capital-allocation" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Capital Allocation"
        title={<>Where every dollar <span className="text-gradient-gold">actually goes</span></>}
        description="Routing is enforced by the Membership Sale contract — not by a dashboard. Reserve and Future Investments show live SYN balances at their public allocation wallets."
      />

      <div className="surface elevated p-4 md:p-6 mb-4">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">USDC routing (per sale)</div>
        <div className="flex h-3 rounded-full overflow-hidden border border-border/60">
          {USDC_ROUTING.map((r, i) => (
            <div
              key={r.label}
              className={i === 0 ? "bg-[var(--gold)]/80" : i === 1 ? "bg-sky-500/70" : "bg-amber-500/70"}
              style={{ width: `${(r.pct / usdcTotalPct) * 100}%` }}
              title={`${r.label} · ${r.pct}%`}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground mono">
          {USDC_ROUTING.map((r) => (
            <span key={r.label}>{r.label} · {r.pct}%</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {slices.map((s) => (
          <article key={s.label} className="surface elevated p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{s.label}</span>
              {s.pct !== null ? (
                <span className="mono text-xs text-muted-foreground">{s.pct}% of sale USDC</span>
              ) : (
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">SYN reserve</span>
              )}
            </div>
            <div className="mono text-lg font-semibold">
              {s.usd !== undefined
                ? fmtUsd(s.usd)
                : s.syn !== undefined
                ? fmtSyn(s.syn)
                : <span className="text-muted-foreground">…</span>}
            </div>
            <div className="text-[11px] text-muted-foreground">{s.source}</div>
            <ContractLink
              address={s.address}
              explorerHref={explorerUrlForAddress(s.address)}
              extras={extrasForAddress(s.address)}
            />
          </article>
        ))}
      </div>
    </Section>
  );
}
