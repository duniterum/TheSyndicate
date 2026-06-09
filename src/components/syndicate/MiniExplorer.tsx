// Mini blockchain explorer for /activity.
// Tabs: Purchases · New Holders · Treasury Flows · LP Trades · LP Liquidity · Large Buys.
// All feeds are live-scanned from Avalanche RPC.

import { useMemo, useState } from "react";
import {
  CONTRACTS,
  LP_POOL,
  extrasForAddress,
  explorerUrlForAddress,
  txExplorerUrl,
} from "@/lib/syndicate-config";
import { EmptyState } from "./EmptyState";
import { useLivePurchaseEvents } from "@/lib/activity-hooks";
import {
  useUsdcFlows,
  useLpSwaps,
  useLpLiquidityEvents,
  firstSeenBuyers,
} from "@/lib/onchain-events";
import { ContractLink, GlassCard, Pill, Section, SectionHeader, StatusPill } from "./Primitives";

type TabKey = "purchases" | "holders" | "treasury" | "swaps" | "liquidity" | "large";

const TABS: Array<{ key: TabKey; label: string; hint: string }> = [
  { key: "purchases", label: "Purchases",   hint: "TokensPurchased · Sale" },
  { key: "holders",   label: "New Holders", hint: "First-time buyers · derived" },
  { key: "treasury",  label: "Treasury",    hint: "USDC in/out · Vault wallet" },
  { key: "swaps",     label: "LP Trades",   hint: "Swap · Trader Joe pair" },
  { key: "liquidity", label: "LP Activity", hint: "Mint / Burn · pair" },
  { key: "large",     label: "Large Buys",  hint: "≥ $25 swaps · Trader Joe" },
];

const fmtUsd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const fmtSyn = (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} SYN`;
const shortTx = (h: string) => `${h.slice(0, 8)}…${h.slice(-6)}`;

export function MiniExplorer() {
  const [tab, setTab] = useState<TabKey>("purchases");

  return (
    <Section id="mini-explorer">
      <SectionHeader
        eyebrow="Mini Explorer"
        title={<>Every <span className="text-gradient-gold">onchain movement</span></>}
        description="Purchases, new holders, treasury USDC flows, LP swaps, and liquidity events — all streamed live from Avalanche RPC. Anything not yet indexed is labeled accordingly."
      />

      <div className="mb-4 flex flex-wrap gap-1 mono text-[11px] uppercase tracking-[0.18em]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            title={t.hint}
            className={`px-3 py-1.5 rounded-md border transition-colors ${
              tab === t.key
                ? "border-[var(--gold)]/60 bg-[var(--gold)]/10 text-[var(--gold)]"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <GlassCard className="p-5">
        {tab === "purchases" && <PurchasesTab />}
        {tab === "holders" && <HoldersTab />}
        {tab === "treasury" && <TreasuryTab />}
        {tab === "swaps" && <SwapsTab onlyLarge={false} />}
        {tab === "liquidity" && <LiquidityTab />}
        {tab === "large" && <SwapsTab onlyLarge />}
      </GlassCard>
    </Section>
  );
}

// ─── Tab: purchases ──────────────────────────────────────────────────────

function PurchasesTab() {
  const q = useLivePurchaseEvents({ limit: 25 });
  return (
    <FeedShell
      isLoading={q.isLoading}
      isError={q.isError}
      onRefresh={() => q.refetch()}
      sourceLabel="Sale contract · TokensPurchased event"
      empty={!q.isLoading && (q.data ?? []).length === 0}
    >
      <ul className="divide-y divide-border/40">
        {(q.data ?? []).map((ev) => (
          <li key={`${ev.txHash}-${ev.logIndex}`} className="py-3 grid grid-cols-12 gap-3 text-sm items-start">
            <div className="col-span-12 md:col-span-3 min-w-0">
              <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                Purchase #{ev.purchaseId.toString()}
              </div>
              <ContractLink address={ev.buyer} explorerHref={explorerUrlForAddress(ev.buyer)} />
            </div>
            <div className="col-span-4 md:col-span-2 mono text-xs"><Stat label="USDC" value={fmtUsd(ev.usdcAmount)} /></div>
            <div className="col-span-4 md:col-span-2 mono text-xs"><Stat label="SYN" value={fmtSyn(ev.synAmount)} /></div>
            <div className="col-span-4 md:col-span-3 mono text-[10px] text-muted-foreground">
              Vault ${ev.vaultAmount.toFixed(2)} · Liq ${ev.liquidityAmount.toFixed(2)} · Ops ${ev.operationsAmount.toFixed(2)}
            </div>
            <TxLink hash={ev.txHash} />
          </li>
        ))}
      </ul>
    </FeedShell>
  );
}

// ─── Tab: new holders ────────────────────────────────────────────────────

function HoldersTab() {
  const q = useLivePurchaseEvents({ limit: 0 });
  const events = q.data ?? [];
  const holders = useMemo(() => firstSeenBuyers(events), [events]);
  return (
    <FeedShell
      isLoading={q.isLoading}
      isError={q.isError}
      onRefresh={() => q.refetch()}
      sourceLabel="Derived from TokensPurchased event stream"
      empty={!q.isLoading && holders.length === 0}
    >
      <div className="mb-3 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {holders.length} unique buyers indexed
      </div>
      <ul className="divide-y divide-border/40">
        {holders.slice(0, 25).map((h) => (
          <li key={h.buyer + h.txHash} className="py-3 grid grid-cols-12 gap-3 items-center text-sm">
            <div className="col-span-12 md:col-span-5">
              <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1">First purchase</div>
              <ContractLink address={h.buyer} explorerHref={explorerUrlForAddress(h.buyer)} />
            </div>
            <div className="col-span-6 md:col-span-2 mono text-xs"><Stat label="Entry USDC" value={fmtUsd(h.usdcAmount)} /></div>
            <div className="col-span-6 md:col-span-2 mono text-xs"><Stat label="SYN" value={fmtSyn(h.synAmount)} /></div>
            <TxLink hash={h.txHash} />
          </li>
        ))}
      </ul>
    </FeedShell>
  );
}

// ─── Tab: treasury flows ─────────────────────────────────────────────────

function TreasuryTab() {
  const q = useUsdcFlows(CONTRACTS.VAULT_WALLET, { limit: 25 });
  return (
    <FeedShell
      isLoading={q.isLoading}
      isError={q.isError}
      onRefresh={() => q.refetch()}
      sourceLabel="USDC Transfer logs · Vault wallet"
      empty={!q.isLoading && (q.data ?? []).length === 0}
      headerRight={
        <ContractLink
          address={CONTRACTS.VAULT_WALLET}
          explorerHref={explorerUrlForAddress(CONTRACTS.VAULT_WALLET)}
          extras={extrasForAddress(CONTRACTS.VAULT_WALLET)}
        />
      }
    >
      <ul className="divide-y divide-border/40">
        {(q.data ?? []).map((f) => (
          <li key={f.txHash + f.logIndex} className="py-3 grid grid-cols-12 gap-3 items-center text-sm">
            <div className="col-span-3 md:col-span-2">
              <Pill tone={f.direction === "in" ? "success" : "muted"}>{f.direction === "in" ? "IN" : "OUT"}</Pill>
            </div>
            <div className="col-span-9 md:col-span-3 mono text-xs"><Stat label="USDC" value={fmtUsd(f.amount)} /></div>
            <div className="col-span-12 md:col-span-5">
              <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1">{f.direction === "in" ? "From" : "To"}</div>
              <ContractLink address={f.counterparty} explorerHref={explorerUrlForAddress(f.counterparty)} />
            </div>
            <TxLink hash={f.txHash} />
          </li>
        ))}
      </ul>
    </FeedShell>
  );
}

// ─── Tab: swaps (and "large buys" filter) ────────────────────────────────

function SwapsTab({ onlyLarge }: { onlyLarge: boolean }) {
  const q = useLpSwaps({ limit: 100 });
  const rows = useMemo(() => {
    const list = q.data ?? [];
    return onlyLarge ? list.filter((s) => s.kind === "buy" && s.usdcAmount >= 25) : list;
  }, [q.data, onlyLarge]);
  return (
    <FeedShell
      isLoading={q.isLoading}
      isError={q.isError}
      onRefresh={() => q.refetch()}
      sourceLabel={`Trader Joe SYN/USDC pair · Swap event${onlyLarge ? " · USDC ≥ $25 buys" : ""}`}
      empty={!q.isLoading && rows.length === 0}
      headerRight={
        <a href={LP_POOL.traderJoeUrl} target="_blank" rel="noopener noreferrer" className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)]">
          Trader Joe ↗
        </a>
      }
    >
      <ul className="divide-y divide-border/40">
        {rows.slice(0, 25).map((s) => (
          <li key={s.txHash + s.logIndex} className="py-3 grid grid-cols-12 gap-3 items-center text-sm">
            <div className="col-span-3 md:col-span-2">
              <Pill tone={s.kind === "buy" ? "success" : "muted"}>{s.kind === "buy" ? "BUY" : "SELL"}</Pill>
            </div>
            <div className="col-span-9 md:col-span-3 mono text-xs"><Stat label="USDC" value={fmtUsd(s.usdcAmount)} /></div>
            <div className="col-span-6 md:col-span-2 mono text-xs"><Stat label="SYN" value={fmtSyn(s.synAmount)} /></div>
            <div className="col-span-6 md:col-span-3 min-w-0">
              <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1">Trader</div>
              <ContractLink address={s.trader} explorerHref={explorerUrlForAddress(s.trader)} />
            </div>
            <TxLink hash={s.txHash} />
          </li>
        ))}
      </ul>
    </FeedShell>
  );
}

// ─── Tab: liquidity (mint/burn) ──────────────────────────────────────────

function LiquidityTab() {
  const q = useLpLiquidityEvents({ limit: 25 });
  return (
    <FeedShell
      isLoading={q.isLoading}
      isError={q.isError}
      onRefresh={() => q.refetch()}
      sourceLabel="Trader Joe pair · Mint / Burn events"
      empty={!q.isLoading && (q.data ?? []).length === 0}
      headerRight={
        <ContractLink
          address={LP_POOL.pairAddress}
          explorerHref={explorerUrlForAddress(LP_POOL.pairAddress)}
          extras={extrasForAddress(LP_POOL.pairAddress)}
        />
      }
    >
      <ul className="divide-y divide-border/40">
        {(q.data ?? []).map((ev) => (
          <li key={ev.txHash + ev.logIndex} className="py-3 grid grid-cols-12 gap-3 items-center text-sm">
            <div className="col-span-3 md:col-span-2">
              <Pill tone={ev.kind === "add" ? "success" : "muted"}>{ev.kind === "add" ? "ADD LP" : "REMOVE LP"}</Pill>
            </div>
            <div className="col-span-9 md:col-span-3 mono text-xs"><Stat label="USDC" value={fmtUsd(ev.usdcAmount)} /></div>
            <div className="col-span-6 md:col-span-2 mono text-xs"><Stat label="SYN" value={fmtSyn(ev.synAmount)} /></div>
            <div className="col-span-6 md:col-span-3 min-w-0">
              <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1">Actor</div>
              <ContractLink address={ev.actor} explorerHref={explorerUrlForAddress(ev.actor)} />
            </div>
            <TxLink hash={ev.txHash} />
          </li>
        ))}
      </ul>
    </FeedShell>
  );
}

// ─── Shared feed chrome ──────────────────────────────────────────────────

function FeedShell({
  isLoading,
  isError,
  onRefresh,
  sourceLabel,
  empty,
  headerRight,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
  sourceLabel: string;
  empty: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <StatusPill status="LIVE" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">{sourceLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          {headerRight}
          <button onClick={onRefresh} className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]">
            Refresh ↻
          </button>
        </div>
      </div>
      {isLoading ? (
        <EmptyState
          variant="compact"
          status="PARTIAL"
          title="Scanning Avalanche RPC"
          description="Querying onchain logs for this feed. Results stream in as the RPC responds."
        />
      ) : isError ? (
        <EmptyState
          variant="compact"
          status="PARTIAL"
          title="RPC log query failed"
          description="Public RPC endpoints occasionally throttle. Retry, or verify the contract directly on Avascan."
        />
      ) : empty ? (
        <EmptyState
          variant="compact"
          status="PENDING"
          title="No events indexed in window"
          description="New activity will appear here automatically. Auto-refresh every 60 seconds."
        />

      ) : (
        children
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground uppercase tracking-[0.14em] text-[9px] mono">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function TxLink({ hash }: { hash: string }) {
  return (
    <div className="col-span-12 md:col-span-2 md:text-right">
      <a
        href={txExplorerUrl(hash)}
        target="_blank"
        rel="noopener noreferrer"
        className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]"
      >
        {shortTx(hash)} ↗
      </a>
    </div>
  );
}
