// Homepage Live Pulse — one row that proves the protocol is alive right now.
// Members · USDC routed · Vault · LP TVL · SYN sold · Last buy · Next member #.
// Every cell links to its verification source. No invented numbers.
//
// Wave 3A: every event-derived cell now carries 24h / 7d delta badges.
// Wave P-3: every cell opens a MetricVerificationDrawer with the canonical
// data-source row from src/lib/data-verification-registry.ts. The drawer
// preserves the same "view on explorer" links as before — clicking a cell
// is no longer destructive (no tab switch) unless the user chooses to.

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatAgo, useProtocolPulse } from "@/lib/protocol-pulse";
import { WINDOW_24H, WINDOW_7D } from "@/lib/chain-time";
import { SectionHeader, StatusPill } from "./Primitives";
import { CockpitSection, useCockpitEmbed } from "./cockpit/cockpit-shell";
import { DeltaBadge } from "./DeltaBadge";
import { MetricVerificationDrawer } from "./MetricVerificationDrawer";
import { SupplyTruthLine } from "./SupplyTruthLine";
import { TxProofPill } from "./TxProofDrawer";
import { SourceTag } from "./SourceTag";
import { getMetricVerification } from "@/lib/data-verification-registry";
import { metricLabel } from "@/lib/protocol-metrics-registry";

/** Canonical compact label for a pulse cell — resolves legacy verify keys. */
const pulseLabel = (k: string) => metricLabel(k, true) ?? k;

const fmtUsd = (n?: number, d = 2) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: d })}`;
const fmtN = (n?: number, d = 0) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: d });
const fmtPlusUsd = (n: number) => `${n >= 0 ? "+" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

type Cell = {
  /** Stable key matching an entry in METRIC_REGISTRY. */
  metricKey: string;
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
  delta24h?: { value: number | undefined; unit: string; format?: (n: number) => string; available: boolean };
  delta7d?: { value: number | undefined; unit: string; format?: (n: number) => string; available: boolean };
};

export function LivePulseStrip() {
  const embedded = useCockpitEmbed();
  const p = useProtocolPulse();
  const qc = useQueryClient();
  const d24 = p.deltas?.last24h;
  const d7 = p.deltas?.last7d;
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Deep-link: ?verify=<metricKey> opens the matching drawer on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const k = new URLSearchParams(window.location.search).get("verify");
    if (k && getMetricVerification(k)) setOpenKey(k);
  }, []);

  // SSOT: Members count derives from the same canonical source as
  // nextMemberNumber (idx.totals.members), so the two always agree.
  const memberCount =
    p.nextMemberNumber !== undefined ? p.nextMemberNumber - 1 : p.buyers;

  const cells: Cell[] = [
    {
      metricKey: "members",
      label: pulseLabel("members"),
      value: fmtN(memberCount),
      hint: "Unique buyers",
      delta24h: { value: d24?.newMembers, unit: "members", available: Boolean(d24) },
      delta7d: { value: d7?.newMembers, unit: "members", available: Boolean(d7) },
    },
    {
      metricKey: "usdcRaised",
      label: pulseLabel("usdcRaised"),
      value: fmtUsd(p.usdcRaised, 2),
      hint: "Sale contract",
      delta24h: { value: d24?.usdcRaised, unit: "USDC routed", format: fmtPlusUsd, available: Boolean(d24) },
      delta7d: { value: d7?.usdcRaised, unit: "USDC routed", format: fmtPlusUsd, available: Boolean(d7) },
    },
    {
      metricKey: "vaultRouted",
      label: pulseLabel("vaultRouted"),
      value: fmtUsd(p.vaultUsdc, 2),
      hint: "Live USDC at Vault",
      emphasize: true,
      delta24h: { value: d24?.vaultRouted, unit: "USDC routed to Vault", format: fmtPlusUsd, available: Boolean(d24) },
      delta7d: { value: d7?.vaultRouted, unit: "USDC routed to Vault", format: fmtPlusUsd, available: Boolean(d7) },
    },
    {
      metricKey: "lpTvl",
      label: pulseLabel("lpTvl"),
      value: fmtUsd(p.lpTvlUsd, 2),
      hint: "Trader Joe pool",
      delta24h: { value: undefined, unit: "LP TVL", available: false },
      delta7d: { value: undefined, unit: "LP TVL", available: false },
    },
    {
      metricKey: "synSold",
      label: pulseLabel("synSold"),
      value: fmtN(p.synSold),
      hint: "From Membership Sale",
      delta24h: { value: d24?.synSold, unit: "SYN sold", available: Boolean(d24) },
      delta7d: { value: d7?.synSold, unit: "SYN sold", available: Boolean(d7) },
    },
    {
      metricKey: "lastBuy",
      label: pulseLabel("lastBuy"),
      value: formatAgo(p.lastBuyAgoSeconds),
      hint: p.lastBuyBuyer ? `${fmtUsd(p.lastBuyUsdc)} purchase` : "Awaiting first buy",
      delta24h: { value: d24?.purchases, unit: "purchases", available: Boolean(d24) },
      delta7d: { value: d7?.purchases, unit: "purchases", available: Boolean(d7) },
    },
    {
      metricKey: "nextMember",
      label: pulseLabel("nextMember"),
      value: p.nextMemberNumber !== undefined ? `#${p.nextMemberNumber}` : "—",
      hint: "Founder archive ID",
      emphasize: true,
    },
  ];

  const openCell = cells.find((c) => c.metricKey === openKey);

  return (
    <CockpitSection id="live-pulse">
      {embedded ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
            Protocol vitals
          </h2>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · seven numbers, read live from Avalanche · click any to verify
          </span>
        </div>
      ) : (
        <SectionHeader
          eyebrow="Live Protocol Pulse"
          title={<>What is happening <span className="text-gradient-gold">right now</span></>}
          description="Seven numbers, all read live from Avalanche. Click any cell to see its hook, on-chain source, and verification links. Deltas show change in the last 24 hours and 7 days."
        />
      )}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <StatusPill status="LIVE" />
          <SourceTag source="LIVE" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            On-chain · Avalanche C-Chain · click to verify
          </span>
        </div>
        {p.asOfBlock !== undefined && (
          <span
            className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70"
            title="Pulse refreshes every 60s. As-of block is the most recent block read from the RPC."
          >
            As of block {p.asOfBlock.toString()}
          </span>
        )}
        <button
          type="button"
          onClick={() => void qc.invalidateQueries()}
          className="ml-auto mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2.5 py-1 hover:border-[var(--gold)]/50 hover:text-foreground"
          aria-label="Refresh live protocol pulse"
        >
          Refresh ↻
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {cells.map((c) => (
          <CellTile
            key={c.label}
            c={c}
            asOfBlock={p.asOfBlock}
            onOpen={() => setOpenKey(c.metricKey)}
            loading={p.isLoading}
          />
        ))}
      </div>

      {/* Origin proof for the most recent on-chain event referenced above */}
      {p.lastBuyTxHash && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Last buy tx
          </span>
          <span className="mono text-[10px] text-foreground/80">
            {p.lastBuyTxHash.slice(0, 10)}…{p.lastBuyTxHash.slice(-6)}
          </span>
          <TxProofPill txHash={p.lastBuyTxHash} ariaLabel="Verify last buy transaction" />
        </div>
      )}

      {/* Supply & burn truth — fixed supply, circulating, burned = balanceOf(dead) (gated off the cockpit embed). */}
      {!embedded && <SupplyTruthLine className="mt-3" />}

      <MetricVerificationDrawer
        metricKey={openKey}
        onClose={() => setOpenKey(null)}
        currentValue={openCell?.value}
        currentHint={openCell?.hint}
      />
    </CockpitSection>
  );
}

function CellTile({
  c,
  asOfBlock,
  onOpen,
  loading = false,
}: {
  c: Cell;
  asOfBlock: bigint | undefined;
  onOpen: () => void;
  loading?: boolean;
}) {
  const isEmpty = c.value === "—";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open verification for ${c.label}`}
      className="block text-left group"
    >
      <div
        className={`surface elevated p-3 h-full flex flex-col gap-1 transition-colors hover:border-[var(--gold)]/40 ${
          c.emphasize ? "border-[var(--gold)]/30 bg-[var(--gold)]/[0.03]" : ""
        }`}
      >
        <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
          <span>{c.label}</span>
          <span
            aria-hidden
            className="text-muted-foreground/40 group-hover:text-[var(--verify)] transition-colors"
          >
            ⊕
          </span>
        </div>
        {loading && isEmpty ? (
          <div className="h-5 w-20 rounded bg-foreground/[0.06] animate-pulse mt-1" />
        ) : (
          <div className="mono text-lg md:text-xl font-semibold leading-none mt-1 truncate">
            {c.value}
          </div>
        )}
        {c.hint && (
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
            {c.hint}
          </div>
        )}
        {(c.delta24h || c.delta7d) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {c.delta24h && (
              <DeltaBadge
                value={c.delta24h.value}
                unit={c.delta24h.unit}
                windowLabel="24h"
                windowSeconds={WINDOW_24H}
                asOfBlock={asOfBlock}
                format={c.delta24h.format}
                available={c.delta24h.available}
              />
            )}
            {c.delta7d && (
              <DeltaBadge
                value={c.delta7d.value}
                unit={c.delta7d.unit}
                windowLabel="7d"
                windowSeconds={WINDOW_7D}
                asOfBlock={asOfBlock}
                format={c.delta7d.format}
                available={c.delta7d.available}
              />
            )}
          </div>
        )}

        {/* Per-tile explicit verification action */}
        <div className="mt-auto pt-2 flex items-center gap-1">
          <span className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--verify)]/80 group-hover:text-[var(--verify)] transition-colors inline-flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--verify)]" />
            Open verification
          </span>
        </div>
      </div>
    </button>
  );
}
