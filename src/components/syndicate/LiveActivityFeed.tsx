import { useMemo, useState } from "react";
import { Link as RouterLink } from "@tanstack/react-router";
import { useLivePurchaseEvents, purchaseLabel, type PurchaseEvent } from "@/lib/activity-hooks";
import { CONTRACTS, extrasForAddress, SALE_DEPLOYMENT_BLOCK, txExplorerUrl, explorerUrlForAddress } from "@/lib/syndicate-config";
import { fmtSyn, fmtUsdc, useBuyerPurchaseTotals, useSaleStats } from "@/lib/sale-hooks";
import { projectSourceAttributedReceipt, type SourceAttributedReceiptReadModel } from "@/lib/source-attributed-receipts";
import { ContractLink, GlassCard, Pill, Section, SectionHeader, StatusPill } from "./Primitives";
import { EmptyState } from "./EmptyState";
import { IndexerFreshnessBadge } from "./IndexerFreshnessBadge";

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const fmtSynN = (n: number) =>
  `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} SYN`;

// Demo events / DemoPreview removed in the truth cleanup pass —
// the activity feed only renders live RPC events now.

/** Live activity wrapper for the Activity page and homepage embeds. */
export function ActivityFeedTabs({ defaultTab = "live", enableControls = false }: { defaultTab?: "live"; enableControls?: boolean }) {
  // Demo tab removed (truth cleanup pass) — feed now always renders live RPC events.
  void defaultTab;
  return (
    <Section id="activity-tabs">
      <SectionHeader
        eyebrow="Activity"
        title={<>Live <span className="text-gradient-gold">TokensPurchased</span> events</>}
        description="Read from TokensPurchased logs on the Membership Sale contract. LIVE if RPC responds, PARTIAL while scanning historical ranges, PENDING if no events have been emitted yet."
      />
      <div className="mb-3">
        <IndexerFreshnessBadge />
      </div>
      <LiveActivityFeed enableControls={enableControls} limit={enableControls ? 0 : 25} />
    </Section>
  );
}

export function LiveActivityFeed({ limit = 25, enableControls = false }: { limit?: number; enableControls?: boolean }) {
  const { data, isLoading, isError, refetch } = useLivePurchaseEvents({ limit });
  const stats = useSaleStats();
  const buyer = useBuyerPurchaseTotals();
  const events = data ?? [];

  // Filtering + pagination (only used when controls are enabled)
  const [buyerFilter, setBuyerFilter] = useState("");
  const [minUsdc, setMinUsdc] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "largest">("newest");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    if (!enableControls) return events;
    const bf = buyerFilter.trim().toLowerCase();
    const min = Number(minUsdc) || 0;
    const out = events.filter((e) => {
      if (bf && !e.buyer.toLowerCase().includes(bf)) return false;
      if (min > 0 && e.usdcAmount < min) return false;
      return true;
    });
    if (sortBy === "oldest") {
      out.sort((a, b) => (a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber > b.blockNumber ? 1 : -1));
    } else if (sortBy === "largest") {
      out.sort((a, b) => b.usdcAmount - a.usdcAmount);
    }
    return out;
  }, [events, enableControls, buyerFilter, minUsdc, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageEvents = enableControls ? filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE) : filtered;

  const purchaseCount = stats.purchaseCount ?? 0n;
  const hasPurchases = purchaseCount > 0n;
  const hasEvents = events.length > 0;
  const saleStatsPending = stats.isLoading || stats.purchaseCount === undefined;
  const showFallback = !isLoading && !hasEvents && (hasPurchases || saleStatsPending);

  const refreshAll = () => {
    refetch();
    stats.refetch();
    buyer.refetch();
  };

  const resetFilters = () => {
    setBuyerFilter("");
    setMinUsdc("");
    setSortBy("newest");
    setPage(0);
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <StatusPill status="LIVE" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            TokensPurchased · from deployment block {SALE_DEPLOYMENT_BLOCK.toString()}
          </span>
        </div>
        <button
          onClick={refreshAll}
          className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]"
        >
          Refresh ↻
        </button>
      </div>

      {isLoading ? (
        <EmptyState
          variant="compact"
          status="PARTIAL"
          title="Scanning Avalanche RPC"
          description="Pulling recent Purchase events from the Sale contract. New activity refreshes automatically."
        />
      ) : showFallback || isError ? (

        <LiveSaleFallback stats={stats} buyer={buyer} logsErrored={isError} />
      ) : !hasEvents ? (
        <ZeroActivityState />
      ) : (
        <>
          <LiveSaleSummary stats={stats} buyer={buyer} compact />
          {enableControls && (
            <div className="mt-5 rounded-md border border-border/50 bg-background/40 p-3 grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-5">
                <label className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground block mb-1">Filter by buyer address</label>
                <input
                  value={buyerFilter}
                  onChange={(e) => { setBuyerFilter(e.target.value); setPage(0); }}
                  placeholder="0x… (partial match)"
                  className="w-full rounded-md border border-border/60 bg-background px-2 py-1.5 text-xs mono"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground block mb-1">Min USDC</label>
                <input
                  value={minUsdc}
                  onChange={(e) => { setMinUsdc(e.target.value.replace(/[^0-9.]/g, "")); setPage(0); }}
                  inputMode="decimal"
                  placeholder="0"
                  className="w-full rounded-md border border-border/60 bg-background px-2 py-1.5 text-xs mono"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground block mb-1">Sort</label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(0); }}
                  className="w-full rounded-md border border-border/60 bg-background px-2 py-1.5 text-xs mono"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="largest">Largest USDC</option>
                </select>
              </div>
              <div className="sm:col-span-1 flex sm:items-end">
                <button
                  onClick={resetFilters}
                  className="w-full mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2 py-1.5 text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
          {enableControls && (
            <div className="mt-3 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              {filtered.length !== events.length ? ` (filtered from ${events.length})` : ""}
            </div>
          )}
          {pageEvents.length === 0 ? (
            <div className="py-10 text-center mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              No purchases match the current filters.
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border/40">
              {pageEvents.map((ev) => (
                <PurchaseRow key={`${ev.txHash}-${ev.logIndex}`} ev={ev} />
              ))}
            </ul>
          )}
          {enableControls && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-3 py-1.5 disabled:opacity-40 hover:text-[var(--gold)]"
              >
                ← Prev
              </button>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Page {safePage + 1} / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-3 py-1.5 disabled:opacity-40 hover:text-[var(--gold)]"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
}

function PurchaseRow({ ev }: { ev: PurchaseEvent }) {
  const buyerUrl = explorerUrlForAddress(ev.buyer);
  const sourceReceipt = projectSourceAttributedReceipt(ev);
  return (
    <li className="py-4 grid grid-cols-12 gap-3 items-start text-sm">
      <div className="col-span-12 lg:col-span-3 min-w-0">
        <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1">{purchaseLabel(ev)}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <RouterLink
            to="/wallet/$address"
            params={{ address: ev.buyer }}
            className="mono text-xs hover:text-[var(--gold)] underline-offset-2 hover:underline"
          >
            {ev.buyer.slice(0, 6)}…{ev.buyer.slice(-4)}
          </RouterLink>
          <ContractLink address={ev.buyer} explorerHref={buyerUrl} />
        </div>
      </div>
      <div className="col-span-6 sm:col-span-3 lg:col-span-2 mono text-xs">
        <span className="text-muted-foreground block mb-1">USDC paid</span>
        {fmtUsd(ev.usdcAmount)}
      </div>
      <div className="col-span-6 sm:col-span-3 lg:col-span-2 mono text-xs">
        <span className="text-muted-foreground block mb-1">SYN received</span>
        {fmtSynN(ev.synAmount)}
      </div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-3 grid grid-cols-3 gap-2 mono text-[11px]">
        <MiniAmount label="Vault" value={fmtUsd(ev.vaultAmount)} />
        <MiniAmount label="Liquidity" value={fmtUsd(ev.liquidityAmount)} />
        <MiniAmount label="Ops" value={fmtUsd(ev.operationsAmount)} />
      </div>
      <div className="col-span-12 lg:col-span-2 lg:text-right">
        <a
          href={txExplorerUrl(ev.txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]"
        >
          {`${ev.txHash.slice(0, 8)}…${ev.txHash.slice(-6)}`} ↗
        </a>
      </div>
      {sourceReceipt && (
        <div className="col-span-12">
          <SourceAttributedReceiptStrip receipt={sourceReceipt} />
        </div>
      )}
    </li>
  );
}

function SourceAttributedReceiptStrip({ receipt }: { receipt: SourceAttributedReceiptReadModel }) {
  const isConfirmedRepaused = receipt.sourceStatusProof === "READBACK_CONFIRMED_SOURCE_REPAUSED";

  return (
    <div className="rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/[0.04] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
          Source-attributed receipt
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="gold">{receipt.sourceClassLabel}</Pill>
          {isConfirmedRepaused && <Pill tone="warning">SOURCE RE-PAUSED</Pill>}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 mono text-[11px]">
        <MiniAmount label="Source" value={`${receipt.sourceId.slice(0, 8)}…${receipt.sourceId.slice(-6)}`} />
        <MiniAmount label="Acquisition" value={fmtUsd(receipt.acquisitionCommission)} />
        <MiniAmount label="Net Routed" value={fmtUsd(receipt.netUsdcRouted)} />
        <MiniAmount label="Terms" value={`${receipt.commissionRateLabel} · ${receipt.attributionScopeLabel}`} />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {isConfirmedRepaused
          ? "Read-only Activity proof from the completed internal test. Current-authority readback confirms the source returned to PAUSED; no public source link, claim surface, source dashboard, or referral activation exists."
          : "Read-only Activity proof from the V3 receipt event. It does not create a public source link, claim surface, source dashboard, or referral activation; current source status still requires SourceRegistry readback."}
      </p>
    </div>
  );
}

function MiniAmount({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/50 p-2">
      <div className="text-muted-foreground uppercase tracking-[0.14em] text-[9px]">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function LiveSaleFallback({ stats, buyer, logsErrored }: { stats: ReturnType<typeof useSaleStats>; buyer: ReturnType<typeof useBuyerPurchaseTotals>; logsErrored: boolean }) {
  return (
    <div className="space-y-4">
      <LiveSaleSummary stats={stats} buyer={buyer} />
      <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4">
        <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400 mb-1">
          Event history: Indexer pending
        </div>
        <p className="text-xs text-muted-foreground">
          Live sale stats are available. Event-level history is still indexing{logsErrored ? " after an RPC log query error" : ""}.
        </p>
      </div>
    </div>
  );
}

function LiveSaleSummary({ stats, buyer, compact = false }: { stats: ReturnType<typeof useSaleStats>; buyer: ReturnType<typeof useBuyerPurchaseTotals>; compact?: boolean }) {
  return (
    <div>
      {!compact && <h3 className="text-lg font-semibold mb-1">Live Sale Summary</h3>}
      <p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Source · Membership Sale contract reads (purchaseCount, totalUsdcRaised, totalSynSold, totalBuyers, availableSyn)
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <SummaryStat label="Purchases" value={stats.purchaseCount !== undefined ? stats.purchaseCount.toString() : "—"} />
        <SummaryStat label="USDC Routed" value={`$${fmtUsdc(stats.totalUsdcRaised)}`} />
        <SummaryStat label="SYN Sold" value={fmtSyn(stats.totalSynSold)} />
        <SummaryStat label="Unique Buyers" value={stats.totalBuyers !== undefined ? stats.totalBuyers.toString() : "—"} />
        <SummaryStat label="Sale Inventory" value={fmtSyn(stats.availableSyn)} />
        <SummaryStat label="Your USDC Total" value={buyer.address ? `$${fmtUsdc(buyer.buyerUsdcTotal)}` : "Connect wallet"} />
        <SummaryStat label="Your SYN Total" value={buyer.address ? fmtSyn(buyer.buyerSynTotal) : "Connect wallet"} />
        <div className="rounded-md border border-border/50 bg-background/60 p-3">
          <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Sale contract</div>
          <div className="mt-1">
            <ContractLink
              address={CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS}
              explorerHref={explorerUrlForAddress(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS)}
              extras={extrasForAddress(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/60 p-3">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 mono text-sm font-semibold">{value}</div>
    </div>
  );
}

function ZeroActivityState() {
  return (
    <div className="py-10 text-center">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
        Awaiting first purchase
      </div>
      <p className="text-xs text-muted-foreground max-w-md mx-auto">
        Purchase count is currently zero on the Membership Sale contract. New live events will appear here automatically.
      </p>
    </div>
  );
}

