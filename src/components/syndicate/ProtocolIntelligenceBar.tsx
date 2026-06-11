// Protocol Intelligence Bar — a compact, crypto-native "header" ticker that
// surfaces the protocol's core live metrics in one horizontally-scrollable row.
//
// SINGLE SOURCE OF TRUTH: every value is read from useProtocolTruth (the
// canonical truth layer) plus useSynSupply / useCirculatingSupply for the
// supply line. No invented numbers; a missing value renders the canonical "—".
//
// LEGAL-SAFE doctrine (non-negotiable):
//   • "Reference Market Cap" = reference price × circulating supply.
//   • "FDV"                  = reference price × total supply.
//   • "Reference price"      = the FIXED access rate (1 SYN = $0.01 USDC) —
//     a protocol-set rate, NOT a market/traded price and NOT a price promise.
//   • "USDC Routed" — never "raised".
//   • "Protocol Wallets"     = Vault + Liquidity + Operations (USDC held).
//   • Nothing here implies ROI, yield, return, or scarcity value.
//
// The burn appears here as a METRIC (Burned Supply = 1,000 SYN) carrying the
// Proof of Fire visual badge (Founder Burn). The full activity event lives on
// /activity (ProofOfFireCard).

import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { StatusPill, type CanonicalStatus } from "./Primitives";
import { useProtocolTruth } from "@/lib/protocol-truth";
import { useSynSupply, useCirculatingSupply } from "@/lib/treasury-hooks";
import { ACCESS_RATE_USDC_PER_SYN, PROOF_OF_FIRE_001 } from "@/lib/syndicate-config";
import { requireMetric } from "@/lib/protocol-metrics-registry";

// ─── Formatters ────────────────────────────────────────────────────────────

const fmtUsdCompact = (n?: number) => {
  if (n === undefined) return "—";
  if (n >= 1000)
    return `$${n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
};
const fmtUsdExact = (n?: number) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const fmtSynCompact = (n?: number) =>
  n === undefined ? "—" : `${n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })} SYN`;
const fmtSynExact = (n?: number) =>
  n === undefined ? "—" : `${Math.round(n).toLocaleString("en-US")} SYN`;

const fmtCount = (n?: number) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const REFERENCE_PRICE = ACCESS_RATE_USDC_PER_SYN; // fixed access rate: 1 SYN = $0.01

/** Canonical compact label for a metric — single source for every bar cell. */
const barLabel = (id: string) => {
  const def = requireMetric(id);
  return def.shortLabel ?? def.label;
};

type Cell = {
  key: string;
  label: string;
  value: string;
  /** Native title attribute — exact value / formula clarification. */
  title?: string;
};

export function ProtocolIntelligenceBar({ className = "" }: { className?: string }) {
  const t = useProtocolTruth();
  const supply = useSynSupply();
  const circ = useCirculatingSupply();

  const circulating = circ.circulating;
  const totalSupply = supply.totalSupply;
  const burned = supply.burned;

  const refMktCap = circulating !== undefined ? REFERENCE_PRICE * circulating : undefined;
  const fdv = totalSupply !== undefined ? REFERENCE_PRICE * totalSupply : undefined;

  const vault = t.vaultUsdc.value;
  const liquidity = t.liquidityUsdc.value;
  const operations = t.operationsUsdc.value;
  const protocolWallets =
    vault !== undefined && liquidity !== undefined && operations !== undefined
      ? vault + liquidity + operations
      : undefined;

  const cp = t.chapterProgress.value;

  // Aggregate trust status — never blanket "LIVE". Every cell is on-chain or
  // labeled honestly: LIVE only when every displayed read resolves, PENDING
  // when none have, PARTIAL while filling in (or on a degraded read).
  const liveReads = [
    vault, liquidity, operations,
    t.lpTvlUsd.value, t.synSold.value, t.usdcRaised.value, t.members.value,
    circulating, totalSupply, burned, cp,
  ];
  const present = liveReads.filter((v) => v !== undefined).length;
  const barStatus: CanonicalStatus =
    t.isError || (present > 0 && present < liveReads.length)
      ? "PARTIAL"
      : present === 0
        ? "PENDING"
        : "LIVE";

  // Cells before/after the special Burned cell (which carries the badge).
  const lead: Cell[] = [
    {
      key: "price",
      label: barLabel("referencePrice"),
      value: `$${REFERENCE_PRICE.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`,
      title: "Fixed access rate · 1 SYN = $0.01 USDC (protocol-set rate, not a market price)",
    },
    {
      key: "refMktCap",
      label: barLabel("referenceMarketCap"),
      value: fmtUsdCompact(refMktCap),
      title: `Reference price × circulating supply = ${fmtUsdExact(refMktCap)}`,
    },
    {
      key: "fdv",
      label: barLabel("fdv"),
      value: fmtUsdCompact(fdv),
      title: `Reference price × total supply = ${fmtUsdExact(fdv)}`,
    },
    {
      key: "totalSupply",
      label: barLabel("totalSupply"),
      value: fmtSynCompact(totalSupply),
      title: totalSupply !== undefined ? `${fmtSynExact(totalSupply)} · fixed, no mint function` : undefined,
    },
    {
      key: "circulating",
      label: barLabel("circulatingSupply"),
      value: fmtSynCompact(circulating),
      title: circulating !== undefined ? `${fmtSynExact(circulating)} · in public hands` : undefined,
    },
  ];

  const tail: Cell[] = [
    {
      key: "protocolWallets",
      label: barLabel("protocolWalletsTotal"),
      value: fmtUsdCompact(protocolWallets),
      title: `Vault + Liquidity + Operations (USDC) = ${fmtUsdExact(protocolWallets)}`,
    },
    {
      key: "vault",
      label: barLabel("vaultWalletUsdc"),
      value: fmtUsdCompact(vault),
      title: `Vault routing wallet · USDC = ${fmtUsdExact(vault)}`,
    },
    {
      key: "liquidity",
      label: barLabel("liquidityWalletUsdc"),
      value: fmtUsdCompact(liquidity),
      title: `Liquidity routing wallet · USDC = ${fmtUsdExact(liquidity)}`,
    },
    {
      key: "operations",
      label: barLabel("operationsWalletUsdc"),
      value: fmtUsdCompact(operations),
      title: `Operations routing wallet · USDC = ${fmtUsdExact(operations)}`,
    },
    {
      key: "lpTvl",
      label: barLabel("lpTvl"),
      value: fmtUsdCompact(t.lpTvlUsd.value),
      title: `SYN/USDC pool total value locked = ${fmtUsdExact(t.lpTvlUsd.value)}`,
    },
    {
      key: "synSold",
      label: barLabel("synSold"),
      value: fmtSynCompact(t.synSold.value),
      title: t.synSold.value !== undefined ? `${fmtSynExact(t.synSold.value)} distributed by the sale contract` : undefined,
    },
    {
      key: "usdcRouted",
      label: barLabel("usdcRouted"),
      value: fmtUsdCompact(t.usdcRaised.value),
      title: `Cumulative USDC routed through the sale = ${fmtUsdExact(t.usdcRaised.value)}`,
    },
    {
      key: "members",
      label: barLabel("members"),
      value: fmtCount(t.members.value),
      title: "Unique buyers recorded on-chain",
    },
    {
      key: "chapter",
      label: barLabel("chapterProgress"),
      value: cp ? `${cp.label} · ${fmtCount(cp.taken)}/${fmtCount(cp.capacity)}` : "—",
      title: cp ? `${cp.progressPct}% filled · ${fmtCount(cp.remaining)} seats remain` : undefined,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Protocol intelligence"
      className={`border-b ${className}`}
      style={{
        background: "color-mix(in oklab, var(--accent) 4%, var(--background))",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex items-stretch gap-0 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {/* Lead label + LIVE pill */}
          <div className="flex shrink-0 items-center gap-2 pr-4">
            <span className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="size-1.5 rounded-full pulse-dot" style={{ background: "var(--accent)" }} />
              Protocol
            </span>
            <StatusPill status={barStatus} />
          </div>

          {lead.map((c) => (
            <BarCell key={c.key} cell={c} />
          ))}

          {/* Burned Supply — carries the Proof of Fire badge (Founder Burn) */}
          <BurnedCell value={fmtSynExact(burned)} />

          {tail.map((c) => (
            <BarCell key={c.key} cell={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BarCell({ cell }: { cell: Cell }) {
  return (
    <div
      title={cell.title}
      className="flex shrink-0 flex-col justify-center gap-0.5 border-l border-border/40 px-4"
    >
      <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
        {cell.label}
      </span>
      <span className="mono text-[12px] font-semibold text-foreground whitespace-nowrap">
        {cell.value}
      </span>
    </div>
  );
}

function BurnedCell({ value }: { value: string }) {
  return (
    <Link
      to="/activity"
      title={`${PROOF_OF_FIRE_001.label} · ${PROOF_OF_FIRE_001.category} · verified supply reduction`}
      aria-label={`Burned supply ${value} — ${PROOF_OF_FIRE_001.label}, ${PROOF_OF_FIRE_001.category}`}
      className="group flex shrink-0 flex-col justify-center gap-0.5 border-l border-border/40 px-4 transition-colors"
    >
      <span className="mono inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
        {requireMetric("burnedSupply").label}
        <span
          className="inline-flex items-center gap-0.5 rounded-[2px] px-1 py-px text-[8px] font-semibold tracking-[0.12em]"
          style={{
            color: "var(--gold)",
            background: "color-mix(in oklab, var(--gold) 14%, transparent)",
          }}
        >
          <Flame className="size-2.5" aria-hidden />
          PROOF OF FIRE
        </span>
      </span>
      <span className="mono text-[12px] font-semibold text-foreground whitespace-nowrap group-hover:text-[var(--gold)] transition-colors">
        {value}
      </span>
    </Link>
  );
}
