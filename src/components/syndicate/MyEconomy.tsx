import { Link } from "@tanstack/react-router";
import { ArrowRight, CircleDollarSign, FileCheck2, WalletCards } from "lucide-react";
import { useAccount } from "wagmi";

import { useArchiveBalances } from "@/lib/archive-balances-hook";
import { useHolderIndex } from "@/lib/holder-index";

import { GlassCard, Pill, Section, SectionHeader, StatusPill, type CanonicalStatus } from "./Primitives";

const fmtUsd = (value: number) =>
  `$${value.toLocaleString("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  })}`;

const fmtSyn = (value: number) =>
  `${value.toLocaleString("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  })} SYN`;

function EconomyStat({
  label,
  value,
  note,
  status,
}: {
  label: string;
  value: string;
  note: string;
  status: CanonicalStatus;
}) {
  return (
    <GlassCard className="border-slate-800/80 bg-slate-950/72 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <StatusPill status={status} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-50">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{note}</p>
    </GlassCard>
  );
}

function RoutingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800/80 bg-slate-900/45 px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="font-mono text-sm font-semibold text-slate-50">{fmtUsd(value)}</span>
    </div>
  );
}

export function MyEconomy() {
  const { address, isConnected } = useAccount();
  const holderIndex = useHolderIndex();
  const archive = useArchiveBalances([1, 3]);
  const record = address ? holderIndex.getByWallet(address) : undefined;
  const walletStatus: CanonicalStatus = !isConnected
    ? "PENDING"
    : holderIndex.isError || archive.isError
    ? "PARTIAL"
    : record
    ? "LIVE"
    : "PARTIAL";

  const routedVault = record?.cumulativeRoutedToVault ?? 0;
  const routedLiquidity = record?.cumulativeRoutedToLiquidity ?? 0;
  const routedOperations = record?.cumulativeRoutedToOperations ?? 0;
  const netRouted = routedVault + routedLiquidity + routedOperations;
  const acquisitionCommission = Math.max(0, (record?.cumulativeUsdc ?? 0) - netRouted);
  const archiveMemories = Number(archive.totalKnown);

  const primaryStats = [
    {
      label: "Receipts",
      value: record ? record.purchaseCount.toLocaleString("en-US") : isConnected ? "0" : "Connect",
      note: record
        ? "Receipt-backed actions tied to this wallet."
        : isConnected
        ? "This wallet has no purchase receipt in the current index."
        : "Connect a wallet to read your member footprint.",
      status: walletStatus,
    },
    {
      label: "USDC placed",
      value: record ? fmtUsd(record.cumulativeUsdc) : isConnected ? "$0.00" : "--",
      note: "Gross USDC is contribution depth, not a seat count and not revenue.",
      status: walletStatus,
    },
    {
      label: "Net USDC routed",
      value: record ? fmtUsd(netRouted) : isConnected ? "$0.00" : "--",
      note: "Read from receipt routing fields so source-attributed purchases remain reconstructable.",
      status: walletStatus,
    },
    {
      label: "SYN received",
      value: record ? fmtSyn(record.cumulativeSyn) : isConnected ? "0 SYN" : "--",
      note: "SYN is the V1 seat. The seat is binary; contribution depth varies.",
      status: walletStatus,
    },
  ];

  return (
    <Section id="my-economy" className="py-12 md:py-16">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="My Economy"
          title="Your wallet's receipt-backed footprint inside The Syndicate."
          description="This is a read-only member view: purchases, SYN received, routing impact, memory, and pending systems stay clearly separated."
        />
        <div className="flex flex-wrap gap-2">
          <Pill tone="success">Read-only</Pill>
          <Pill tone="muted">No claim UI</Pill>
          <Pill tone="muted">No source activation</Pill>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map((stat) => (
          <EconomyStat key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <GlassCard className="border-slate-800/80 bg-slate-950/74 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-2 text-amber-200">
              <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-200">Routing impact</p>
                <Pill tone="navy">Receipt fields</Pill>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                This view uses the actual Vault, Liquidity, and Operations amounts from indexed receipts. It does not
                re-split gross USDC when acquisition commission exists.
              </p>
              <div className="mt-4 grid gap-3">
                <RoutingRow label="Vault routed" value={routedVault} />
                <RoutingRow label="Liquidity routed" value={routedLiquidity} />
                <RoutingRow label="Operations routed" value={routedOperations} />
                <RoutingRow label="Acquisition commission" value={acquisitionCommission} />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-slate-800/80 bg-slate-950/74 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-200">
              <WalletCards className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">Member systems</p>
                <StatusPill status={walletStatus} />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/45 px-4 py-3">
                  <span>Archive memories</span>
                  <span className="font-mono font-semibold text-slate-50">
                    {isConnected ? archiveMemories.toLocaleString("en-US") : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/45 px-4 py-3">
                  <span>Source attribution</span>
                  <Pill tone="muted">Inactive</Pill>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/45 px-4 py-3">
                  <span>Claim interface</span>
                  <Pill tone="muted">Inactive</Pill>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/45 px-4 py-3">
                  <span>Marketplace / packages</span>
                  <Pill tone="navy">Not implemented</Pill>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Link
                  to="/transparency"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-100"
                >
                  Economy proof <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/activity"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-100"
                >
                  Receipt trail <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </Section>
  );
}
