// Public-company-style investor relations panels for /transparency.
// Every panel is derived from live RPC reads — never hand-entered.

import { useMemo } from "react";
import { Section, SectionHeader, GlassCard, ContractLink } from "./Primitives";
import { EmptyState } from "./EmptyState";
import { useLivePurchaseEvents } from "@/lib/activity-hooks";
import { useUsdcFlows, useLpLiquidityEvents } from "@/lib/onchain-events";
import { useLpStats, useSaleStats } from "@/lib/sale-hooks";
import {
  CONTRACTS,
  LP_POOL,
  explorerUrlForAddress,
  extrasForAddress,
  txExplorerUrl,
} from "@/lib/syndicate-config";

const fmtUsd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const fmtSyn = (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} SYN`;
const shortTx = (h: string) => `${h.slice(0, 8)}…${h.slice(-6)}`;

export function TransparencyReport() {
  return (
    <>
      <RevenueHistoryCard />
      <SalesHistoryCard />
      <LpGrowthCard />
      <TreasuryActivityCard />
    </>
  );
}

// ─── Revenue history (aggregate stats over the full purchase stream) ────

function RevenueHistoryCard() {
  const stats = useSaleStats();
  const events = useLivePurchaseEvents({ limit: 0 });
  const list = events.data ?? [];

  const summary = useMemo(() => {
    if (list.length === 0) return null;
    const total = list.reduce((s, e) => s + e.usdcAmount, 0);
    const avg = total / list.length;
    const max = list.reduce((m, e) => Math.max(m, e.usdcAmount), 0);
    const min = list.reduce((m, e) => Math.min(m, e.usdcAmount), Infinity);
    const sorted = [...list].sort((a, b) => (a.blockNumber > b.blockNumber ? 1 : -1));
    return {
      total, avg, max, min,
      first: sorted[0],
      last: sorted[sorted.length - 1],
      count: list.length,
    };
  }, [list]);

  return (
    <Section id="revenue-history">
      <SectionHeader
        eyebrow="Revenue History"
        title={<>Every dollar <span className="text-gradient-gold">raised onchain</span></>}
        description="Aggregated from the full TokensPurchased event stream on the Membership Sale contract."
      />
      <GlassCard className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Stat label="Sale Volume"   value={summary ? fmtUsd(summary.total) : "—"} />
          <Stat label="Total Purchases" value={stats.purchaseCount !== undefined ? Number(stats.purchaseCount).toString() : "—"} />
          <Stat label="Avg Purchase" value={summary ? fmtUsd(summary.avg) : "—"} />
          <Stat label="Largest Single" value={summary ? fmtUsd(summary.max) : "—"} />
          <Stat label="Smallest Single" value={summary ? fmtUsd(summary.min) : "—"} />
          <Stat label="Unique Buyers" value={stats.totalBuyers !== undefined ? Number(stats.totalBuyers).toString() : "—"} />
          <Stat label="First Purchase" value={summary ? `Block ${summary.first.blockNumber.toString()}` : "—"} link={summary ? txExplorerUrl(summary.first.txHash) : null} />
          <Stat label="Latest Purchase" value={summary ? `Block ${summary.last.blockNumber.toString()}` : "—"} link={summary ? txExplorerUrl(summary.last.txHash) : null} />
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          100% of USDC routes onchain via the Sale contract: 70% Vault · 20% Liquidity · 10% Operations.
        </p>
      </GlassCard>
    </Section>
  );
}

// ─── Sales history (top 10 largest purchases) ────────────────────────────

function SalesHistoryCard() {
  const events = useLivePurchaseEvents({ limit: 0 });
  const top = useMemo(() => {
    return [...(events.data ?? [])]
      .sort((a, b) => b.usdcAmount - a.usdcAmount)
      .slice(0, 10);
  }, [events.data]);

  return (
    <Section id="sales-history">
      <SectionHeader
        eyebrow="Membership Sales History"
        title={<>Top <span className="text-gradient-gold">10 largest purchases</span></>}
        description="Ranked by USDC paid. Every row is a verifiable onchain transaction."
      />
      <GlassCard className="p-5">
        {top.length === 0 ? (
          <EmptyState
            variant="compact"
            status={events.isLoading ? "PARTIAL" : "PENDING"}
            title={events.isLoading ? "Scanning Avalanche RPC" : "No purchases indexed yet"}
            description={events.isLoading
              ? "Fetching Purchase events from the Membership Sale contract."
              : "Membership Sale is live. The first onchain purchase will appear here automatically — verify the contract on Avascan."}
          />
        ) : (

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="py-2 pr-3 font-normal">#</th>
                <th className="py-2 pr-3 font-normal">Buyer</th>
                <th className="py-2 pr-3 font-normal text-right">USDC</th>
                <th className="py-2 pr-3 font-normal text-right">SYN</th>
                <th className="py-2 pr-3 font-normal">Tx</th>
              </tr>
            </thead>
            <tbody>
              {top.map((e, i) => (
                <tr key={e.txHash} className="border-t border-border/40">
                  <td className="py-2 pr-3 mono text-xs text-muted-foreground">{i + 1}</td>
                  <td className="py-2 pr-3">
                    <ContractLink address={e.buyer} explorerHref={explorerUrlForAddress(e.buyer)} />
                  </td>
                  <td className="py-2 pr-3 text-right mono">{fmtUsd(e.usdcAmount)}</td>
                  <td className="py-2 pr-3 text-right mono">{fmtSyn(e.synAmount)}</td>
                  <td className="py-2 pr-3">
                    <a href={txExplorerUrl(e.txHash)} target="_blank" rel="noopener noreferrer" className="mono text-[10px] uppercase tracking-[0.18em] hover:text-[var(--gold)]">{shortTx(e.txHash)} ↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </Section>
  );
}

// ─── LP Growth ───────────────────────────────────────────────────────────

function LpGrowthCard() {
  const lp = useLpStats();
  const liq = useLpLiquidityEvents({ limit: 0 });
  const list = liq.data ?? [];
  const adds = list.filter((e) => e.kind === "add").length;
  const removes = list.filter((e) => e.kind === "remove").length;
  const seedUsd = LP_POOL.initialUsdc;
  const seedSyn = LP_POOL.initialSyn;
  const growth =
    lp.usdcReserve !== undefined && seedUsd > 0
      ? ((lp.usdcReserve - seedUsd) / seedUsd) * 100
      : undefined;

  return (
    <Section id="lp-growth">
      <SectionHeader
        eyebrow="LP Growth"
        title={<>Liquidity pool <span className="text-gradient-gold">depth over time</span></>}
        description="Seed snapshot vs current reserves. Liquidity events streamed from the Trader Joe v1 pair contract."
      />
      <GlassCard className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Stat label="Seed USDC" value={fmtUsd(seedUsd)} />
          <Stat label="Seed SYN" value={fmtSyn(seedSyn)} />
          <Stat label="Current USDC" value={lp.usdcReserve !== undefined ? fmtUsd(lp.usdcReserve) : "—"} />
          <Stat label="Current SYN" value={lp.synReserve !== undefined ? fmtSyn(lp.synReserve) : "—"} />
          <Stat label="TVL" value={lp.tvlUsd !== undefined ? fmtUsd(lp.tvlUsd) : "—"} />
          <Stat label="USDC Growth" value={growth !== undefined ? `${growth.toFixed(0)}%` : "—"} />
          <Stat label="LP Adds" value={adds.toString()} />
          <Stat label="LP Removes" value={removes.toString()} />
        </div>
        <div className="mt-4">
          <ContractLink
            address={LP_POOL.pairAddress}
            explorerHref={explorerUrlForAddress(LP_POOL.pairAddress)}
            extras={extrasForAddress(LP_POOL.pairAddress)}
            label="Pair contract"
          />
        </div>
      </GlassCard>
    </Section>
  );
}

// ─── Treasury wallet activity ────────────────────────────────────────────

function TreasuryActivityCard() {
  const flows = useUsdcFlows(CONTRACTS.VAULT_WALLET, { limit: 0 });
  const list = flows.data ?? [];
  const top = useMemo(() => [...list].sort((a, b) => b.amount - a.amount).slice(0, 10), [list]);
  const totalIn = list.filter((f) => f.direction === "in").reduce((s, f) => s + f.amount, 0);
  const totalOut = list.filter((f) => f.direction === "out").reduce((s, f) => s + f.amount, 0);

  return (
    <Section id="treasury-activity">
      <SectionHeader
        eyebrow="Treasury Wallet Activity"
        title={<>Largest <span className="text-gradient-gold">treasury transactions</span></>}
        description="USDC Transfer events scanned against the Vault wallet on Avalanche."
      />
      <GlassCard className="p-5">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="USDC In (window)" value={fmtUsd(totalIn)} />
          <Stat label="USDC Out (window)" value={fmtUsd(totalOut)} />
          <Stat label="Net (window)" value={fmtUsd(totalIn - totalOut)} />
        </div>
        <div className="mb-3">
          <ContractLink
            address={CONTRACTS.VAULT_WALLET}
            explorerHref={explorerUrlForAddress(CONTRACTS.VAULT_WALLET)}
            extras={extrasForAddress(CONTRACTS.VAULT_WALLET)}
            label="Vault wallet"
          />
        </div>
        {top.length === 0 ? (
          <EmptyState
            variant="compact"
            status={flows.isLoading ? "PARTIAL" : "PENDING"}
            title={flows.isLoading ? "Scanning Avalanche RPC" : "No USDC movement indexed yet"}
            description={flows.isLoading
              ? "Querying Transfer logs on the Vault wallet."
              : "Vault wallet is live. As USDC routes in or out, transfers will surface here — verify the wallet on Avascan."}
          />
        ) : (

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="py-2 pr-3 font-normal">#</th>
                <th className="py-2 pr-3 font-normal">Direction</th>
                <th className="py-2 pr-3 font-normal text-right">USDC</th>
                <th className="py-2 pr-3 font-normal">Counterparty</th>
                <th className="py-2 pr-3 font-normal">Tx</th>
              </tr>
            </thead>
            <tbody>
              {top.map((f, i) => (
                <tr key={f.txHash + f.logIndex} className="border-t border-border/40">
                  <td className="py-2 pr-3 mono text-xs text-muted-foreground">{i + 1}</td>
                  <td className="py-2 pr-3 mono text-xs uppercase tracking-[0.16em]">{f.direction === "in" ? "IN" : "OUT"}</td>
                  <td className="py-2 pr-3 text-right mono">{fmtUsd(f.amount)}</td>
                  <td className="py-2 pr-3"><ContractLink address={f.counterparty} explorerHref={explorerUrlForAddress(f.counterparty)} /></td>
                  <td className="py-2 pr-3"><a href={txExplorerUrl(f.txHash)} target="_blank" rel="noopener noreferrer" className="mono text-[10px] uppercase tracking-[0.18em] hover:text-[var(--gold)]">{shortTx(f.txHash)} ↗</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </Section>
  );
}

function Stat({ label, value, link }: { label: string; value: string; link?: string | null }) {
  const inner = (
    <div className="rounded-md border border-border/50 bg-background/60 p-3 h-full">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 mono text-sm font-semibold truncate">{value}</div>
    </div>
  );
  if (link) {
    return <a href={link} target="_blank" rel="noopener noreferrer" className="block hover:text-[var(--gold)]">{inner}</a>;
  }
  return inner;
}
