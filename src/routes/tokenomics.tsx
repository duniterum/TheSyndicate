import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { Allocation, SupplyDiscipline, GenesisSupplyControls, TokenUtility } from "@/components/syndicate/Sections";
import { SaleStatsPanel } from "@/components/syndicate/LivePurchase";
import { LpStatusCard } from "@/components/syndicate/LpStatus";
import { RoutingFlow } from "@/components/syndicate/RoutingFlow";
import { TokenomicsDonut } from "@/components/syndicate/TokenomicsDonut";
import { SupplyTruthLine } from "@/components/syndicate/SupplyTruthLine";
import { RiskDisclaimer } from "@/components/syndicate/RiskDisclaimer";
import { ContractLink, Section, SectionHeader, GlassCard } from "@/components/syndicate/Primitives";
import {
  ALLOCATION_WALLETS,
  ALLOCATION_EXPECTED_SYN,
  TOKENOMICS_ALLOCATION,
  explorerUrlForAddress,
  extrasForAddress,
} from "@/lib/syndicate-config";
import { useAllocationBalances } from "@/lib/sale-hooks";

const fmt = (n: number) => n.toLocaleString("en-US");
const fmtBal = (n: number | undefined) => (n === undefined ? "—" : Math.round(n).toLocaleString("en-US"));

export const Route = createFileRoute("/tokenomics")({
  head: () => ({
    meta: [
      { title: "Tokenomics — 1B SYN · 7 Allocations | The Syndicate" },
      { name: "description", content: "Full SYN tokenomics: fixed 1,000,000,000 supply across seven public allocation wallets on Avalanche. Membership Sale live. Every wallet verifiable on Avascan." },
      { property: "og:title", content: "SYN Tokenomics" },
      { property: "og:description", content: "Allocation, supply discipline, token utility, and live Membership Sale stats — verified onchain." },
      { property: "og:url", content: "https://thesyndicate.money/tokenomics" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/tokenomics" }],
  }),
  component: TokenomicsPage,
});

function TokenomicsPage() {
  const wallets = Object.values(ALLOCATION_WALLETS);
  const { balances, isLoading } = useAllocationBalances(wallets);

  return (
    <PageShell eyebrow="Tokenomics" title="1,000,000,000 SYN · seven public allocations" description="Fixed supply, no admin, no mint. Initial mint confirmed onchain.">
      <Section id="supply-truth">
        <SupplyTruthLine />
      </Section>
      <TokenomicsDonut />
      <Allocation />

      <Section id="allocation-wallets">
        <SectionHeader
          eyebrow="Verification"
          title={<>Allocation wallets — <span className="text-gradient-gold">live balances onchain</span></>}
          description="Every allocation wallet — its expected SYN balance, the live SYN balance read from chain, and an explorer link. Refreshes every 60 seconds."
        />
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                  <th className="py-3 px-4">Allocation</th>
                  <th className="py-3 px-4 text-right">%</th>
                  <th className="py-3 px-4 text-right">Expected SYN</th>
                  <th className="py-3 px-4 text-right">Current SYN</th>
                  <th className="py-3 px-4">Wallet</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {TOKENOMICS_ALLOCATION.map((a) => {
                  const addr = ALLOCATION_WALLETS[a.label];
                  const expected = ALLOCATION_EXPECTED_SYN[a.label] ?? a.syn;
                  const url = addr ? explorerUrlForAddress(addr) : null;
                  const current = addr ? balances[addr.toLowerCase()] : undefined;
                  const status = !addr
                    ? "pending"
                    : current === undefined
                    ? (isLoading ? "loading" : "live")
                    : Math.abs(current - expected) / expected < 0.02
                    ? "confirmed"
                    : "drift";
                  return (
                    <tr key={a.label} className="border-b border-border/20 last:border-0 align-top">
                      <td className="py-3 px-4 font-medium">{a.label}</td>
                      <td className="py-3 px-4 text-right mono text-xs">{a.pct}%</td>
                      <td className="py-3 px-4 text-right mono text-xs">{fmt(expected)}</td>
                      <td className="py-3 px-4 text-right mono text-xs">{fmtBal(current)}</td>
                      <td className="py-3 px-4">
                        {addr ? (
                          <ContractLink address={addr} explorerHref={url} extras={extrasForAddress(addr)} />
                        ) : (
                          <span className="mono text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusPill kind={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
        <p className="mt-3 text-xs text-muted-foreground">
          Full contract + wallet registry (USDC routing wallets, LP pool, pending modules) is on the{" "}
          <Link to="/registry" className="underline underline-offset-2 hover:text-foreground">Protocol Registry</Link>.
        </p>
      </Section>


      <Section id="membership-sale">
        <SectionHeader
          eyebrow="Membership Sale"
          title="Live USDC → SYN sale"
          description="The Membership Sale contract routes USDC into Vault (70%), Liquidity (20%), and Operations (10%). SYN is delivered from the Membership Distribution allocation at the fixed rate 1 SYN = $0.01 USDC."
        />
        <GlassCard className="p-6"><SaleStatsPanel /></GlassCard>
      </Section>
      <RoutingFlow />
      <Section id="lp-pool">
        <SectionHeader
          eyebrow="Liquidity"
          title="SYN/USDC pool — live"
          description="Trader Joe v1 AMM pair on Avalanche. Reserves and implied price read directly from the pair contract."
        />
        <LpStatusCard />
      </Section>
      {/* Leaderboard removed (truth cleanup pass) — wealth-only rankings conflict with constitution. */}
      <SupplyDiscipline />
      <GenesisSupplyControls />
      <TokenUtility />
      <RiskDisclaimer />
    <RouteFinalCTA preset="verify" />
    </PageShell>
  );
}

function StatusPill({ kind }: { kind: "pending" | "loading" | "live" | "confirmed" | "drift" }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:   { label: "PENDING",   cls: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    loading:   { label: "READING…",  cls: "border-border/60 bg-muted/40 text-muted-foreground" },
    live:      { label: "LIVE",      cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    confirmed: { label: "CONFIRMED", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    drift:     { label: "DRIFT",     cls: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  };
  const s = map[kind];
  return (
    <span className={`mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${s.cls}`}>
      {s.label}
    </span>
  );
}
