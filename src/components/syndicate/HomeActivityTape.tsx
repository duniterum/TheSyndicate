// "Latest protocol events" tape for the homepage.
// Newest first. Pulls live Membership Sale purchases + Archive1155 mints.
// No fake events — when both feeds are empty, the tape says so honestly.
//
// Adds three pieces of UX on top of the pure feed:
//   • Filter chips (All / SYN purchases / NFT mints) — purely client-side
//     filtering of already-fetched events; no extra RPC calls.
//   • Show-more pagination over the already-indexed window. Each click
//     reveals another page from the live data.
//   • Skeleton placeholders + an explicit retry button + a SourceTag pill
//     so the visitor always sees provenance + a way forward on failure.
import { useState, useMemo } from "react";
import { Link as RouterLink } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useLivePurchaseEvents, type PurchaseEvent } from "@/lib/activity-hooks";
import { useArchiveMintEvents, type ArchiveMintEvent } from "@/lib/archive-mint-events";
import { txExplorerUrl } from "@/lib/syndicate-config";
import { Section, SectionHeader, StatusPill, GlassCard } from "./Primitives";
import { SourceTag } from "./SourceTag";
import { RetryNotice, RowSkeleton } from "./RetryNotice";

const AVA_BLOCK_SECONDS = 2;
function agoFromBlocks(blockDelta: bigint): string {
  const s = Number(blockDelta) * AVA_BLOCK_SECONDS;
  if (s < 60) return `${Math.max(1, s)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86_400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86_400)}d ago`;
}

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const ARTIFACT_NAME: Record<number, string> = {
  1: "First Signal",
  3: "Patron Seal",
};

type RowKind = "purchase" | "mint";
type Row = {
  key: string;
  kind: RowKind;
  label: string;
  amount: string;
  wallet: string;
  block: bigint;
  txHash: string;
};

type Filter = "all" | "purchase" | "mint";
const PAGE = 6;

export function HomeActivityTape() {
  const qc = useQueryClient();
  const purchases = useLivePurchaseEvents({ limit: 30 });
  const mints = useArchiveMintEvents({ limit: 30, ids: [1, 3] });

  const [filter, setFilter] = useState<Filter>("all");
  const [visible, setVisible] = useState<number>(PAGE);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [
      ...((purchases.data ?? []) as PurchaseEvent[]).map<Row>((p) => ({
        key: `p-${p.txHash}-${p.logIndex}`,
        kind: "purchase",
        label: "SYN purchase",
        amount: fmtUsd(p.usdcAmount),
        wallet: p.buyer,
        block: p.blockNumber,
        txHash: p.txHash,
      })),
      ...((mints.data ?? []) as ArchiveMintEvent[]).map<Row>((m) => ({
        key: `m-${m.txHash}-${m.logIndex}`,
        kind: "mint",
        label: `${ARTIFACT_NAME[m.tokenId] ?? `Artifact #${m.tokenId}`} mint`,
        amount: m.value > 1 ? `×${m.value}` : "",
        wallet: m.to,
        block: m.blockNumber,
        txHash: m.txHash,
      })),
    ];
    out.sort((a, b) => (a.block === b.block ? 0 : a.block > b.block ? -1 : 1));
    return out;
  }, [purchases.data, mints.data]);

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.kind === filter)),
    [rows, filter],
  );

  const tip = rows.reduce<bigint>((acc, r) => (r.block > acc ? r.block : acc), 0n);
  const top = filtered.slice(0, visible);

  const loading = (purchases.isLoading || mints.isLoading) && rows.length === 0;
  const errored = (purchases.isError || mints.isError) && rows.length === 0;
  const counts = {
    all: rows.length,
    purchase: rows.filter((r) => r.kind === "purchase").length,
    mint: rows.filter((r) => r.kind === "mint").length,
  };
  const canShowMore = visible < filtered.length;

  const refresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["live-purchases"] }),
      qc.invalidateQueries({ queryKey: ["archive-mints"] }),
    ]);
  };

  const setF = (f: Filter) => {
    setFilter(f);
    setVisible(PAGE);
  };

  return (
    <Section id="activity-tape">
      <SectionHeader
        eyebrow="Latest protocol events"
        title={<>The <span className="text-gradient-gold">tape</span></>}
        description="Newest on top. Every row is a real on-chain event on Avalanche — purchases on the Membership Sale and mints on the Archive. Filter, paginate, click any tx to verify."
      />
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/40 flex flex-wrap items-center gap-2">
          <StatusPill status="LIVE" />
          <SourceTag source="INDEXED" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Avalanche · refreshes every 60s
          </span>
          <RouterLink
            to="/activity"
            className="ml-auto mono text-[10px] uppercase tracking-[0.18em] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Open full activity →
          </RouterLink>
        </div>

        <div className="px-4 py-2 border-b border-border/30 flex flex-wrap items-center gap-1.5">
          <FilterChip active={filter === "all"} onClick={() => setF("all")} label="All" count={counts.all} />
          <FilterChip active={filter === "purchase"} onClick={() => setF("purchase")} label="SYN purchases" count={counts.purchase} />
          <FilterChip active={filter === "mint"} onClick={() => setF("mint")} label="NFT mints" count={counts.mint} />
          <button
            type="button"
            onClick={() => void refresh()}
            className="ml-auto mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2 py-1 hover:border-[var(--gold)]/50 hover:text-foreground"
            aria-label="Refresh tape"
          >
            ↻
          </button>
        </div>

        {loading ? (
          <RowSkeleton rows={4} />
        ) : errored ? (
          <RetryNotice
            message="Could not load events from the RPC."
            detail="Public Avalanche endpoints sometimes throttle log scans."
            onRetry={refresh}
          />
        ) : top.length === 0 ? (
          <div className="px-4 py-6 mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            No {filter === "all" ? "events" : filter === "purchase" ? "SYN purchases" : "NFT mints"} in the indexed window.
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border/30">
              {top.map((r) => (
                <li
                  key={r.key}
                  className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center text-sm hover:bg-[var(--gold)]/[0.03] transition-colors"
                >
                  <div className="col-span-12 sm:col-span-4 flex items-center gap-2 min-w-0">
                    <span
                      className={`size-1.5 rounded-full shrink-0 ${r.kind === "mint" ? "bg-[var(--gold)]" : "bg-emerald-500"}`}
                    />
                    <span className="text-foreground/90 truncate">{r.label}</span>
                  </div>
                  <div className="col-span-4 sm:col-span-2 mono text-xs text-foreground">{r.amount || "—"}</div>
                  <div className="col-span-4 sm:col-span-2 mono text-[11px] text-muted-foreground truncate">
                    {short(r.wallet)}
                  </div>
                  <div className="col-span-4 sm:col-span-2 mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground text-right sm:text-left">
                    {tip > 0n && r.block > 0n ? agoFromBlocks(tip > r.block ? tip - r.block : 0n) : "—"}
                  </div>
                  <div className="col-span-12 sm:col-span-2 sm:text-right">
                    <a
                      href={txExplorerUrl(r.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
                    >
                      Verify ↗
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Showing {top.length} of {filtered.length}
              </span>
              <div className="flex gap-2">
                {visible > PAGE && (
                  <button
                    type="button"
                    onClick={() => setVisible(PAGE)}
                    className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-3 py-1.5 hover:border-[var(--gold)]/50 hover:text-foreground"
                  >
                    Collapse
                  </button>
                )}
                {canShowMore && (
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE)}
                    className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-[var(--gold)]/40 text-[var(--gold)] px-3 py-1.5 hover:bg-[var(--gold)]/10"
                  >
                    Show more →
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </Section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`mono text-[10px] uppercase tracking-[0.18em] rounded-full border px-2.5 py-1 transition-colors ${
        active
          ? "border-[var(--gold)]/60 text-[var(--gold)] bg-[var(--gold)]/[0.06]"
          : "border-border/60 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/40"
      }`}
    >
      {label} <span className="opacity-60">· {count}</span>
    </button>
  );
}
