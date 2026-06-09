// Bloomberg-style top strip — every cell sourced from chain or labeled PENDING.

import { formatUnits } from "viem";
import { Section, SectionHeader } from "@/components/syndicate/Primitives";
import { useSaleStats, useLpStats } from "@/lib/sale-hooks";
import { useTreasuryAssets, useCirculatingSupply } from "@/lib/treasury-hooks";
import {
  USDC_DECIMALS,
  LP_POOL,
  explorerUrlFor,
  explorerUrlForAddress,
  CONTRACTS,
} from "@/lib/syndicate-config";

const fmtN = (n: number, max = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: max });

const fmtCompact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M`
    : n >= 1_000
    ? `${(n / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`
    : n.toLocaleString("en-US", { maximumFractionDigits: 0 });

type Cell = {
  label: string;
  value: string;
  hint: string;
  href?: string | null;
  status: "live" | "partial" | "pending";
};

export function ProtocolOverview() {
  const s = useSaleStats();
  const lp = useLpStats();
  const treasury = useTreasuryAssets();
  const supply = useCirculatingSupply();

  const usdcRaised =
    s.totalUsdcRaised !== undefined
      ? Number(formatUnits(s.totalUsdcRaised, USDC_DECIMALS))
      : undefined;

  const synPrice = lp.synPriceUsd;
  const treasuryUsd = treasury.knownUsd;
  const lpUsd = lp.tvlUsd;

  const marketCap =
    synPrice !== undefined && supply.circulating !== undefined
      ? synPrice * supply.circulating
      : undefined;
  const fdv =
    synPrice !== undefined && supply.totalSupply !== undefined
      ? synPrice * supply.totalSupply
      : undefined;

  const cells: Cell[] = [
    {
      label: "SYN Price",
      value: synPrice !== undefined ? `$${synPrice.toLocaleString("en-US", { maximumFractionDigits: 6 })}` : "—",
      hint: "Trader Joe SYN/USDC reserves",
      href: LP_POOL.traderJoeUrl,
      status: synPrice !== undefined ? "live" : "pending",
    },
    {
      label: "Market Cap",
      value: marketCap !== undefined ? `$${fmtN(marketCap, 0)}` : "—",
      hint: "Price × circulating",
      href: explorerUrlFor("SYN_CONTRACT_ADDRESS"),
      status: marketCap !== undefined ? "live" : "pending",
    },
    {
      label: "FDV",
      value: fdv !== undefined ? `$${fmtN(fdv, 0)}` : "—",
      hint: "Price × totalSupply (1B)",
      href: explorerUrlFor("SYN_CONTRACT_ADDRESS"),
      status: fdv !== undefined ? "live" : "pending",
    },
    {
      label: "Treasury Value",
      value: treasuryUsd > 0 ? `$${fmtN(treasuryUsd, 2)}${treasury.anyPendingUsd ? "+" : ""}` : (treasury.isLoading ? "…" : "$0"),
      hint: treasury.anyPendingUsd ? "Known USD only (oracle pending for AVAX/BTC.b/WETH.e)" : "USDC + SYN @ LP price",
      href: explorerUrlForAddress(CONTRACTS.VAULT_WALLET),
      status: treasury.anyPendingUsd ? "partial" : "live",
    },
    {
      label: "LP Value (TVL)",
      value: lpUsd !== undefined ? `$${fmtN(lpUsd, 2)}` : "—",
      hint: "SYN/USDC pair · 2× USDC side",
      href: explorerUrlForAddress(LP_POOL.pairAddress),
      status: lpUsd !== undefined ? "live" : "pending",
    },
    {
      label: "Circulating Supply",
      value: supply.circulating !== undefined ? `${fmtCompact(supply.circulating)} SYN` : "—",
      hint: "Total − reserved allocation wallets",
      href: explorerUrlFor("SYN_CONTRACT_ADDRESS"),
      status: supply.circulating !== undefined ? "live" : "pending",
    },
    {
      label: "Protocol Revenue Generated",
      value: usdcRaised !== undefined ? `$${fmtN(usdcRaised, 2)}` : "—",
      hint: "Cumulative — Membership Sales (only LIVE source)",
      href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
      status: usdcRaised !== undefined ? "live" : "pending",
    },
    {
      label: "Revenue Allocated",
      value: usdcRaised !== undefined ? `$${fmtN(usdcRaised, 2)}` : "—",
      hint: "100% routed on-chain · 70 / 20 / 10",
      href: "/transparency",
      status: usdcRaised !== undefined ? "live" : "pending",
    },
    {
      label: "Holders",
      value: "PENDING",
      hint: "Awaiting Avascan holder index",
      status: "pending",
    },
    {
      label: "Transactions",
      value: s.purchaseCount !== undefined ? fmtN(Number(s.purchaseCount)) : "—",
      hint: "Sale purchaseCount()",
      href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
      status: s.purchaseCount !== undefined ? "live" : "pending",
    },
  ];

  return (
    <Section id="protocol-overview" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Protocol Overview"
        title={<>The <span className="text-gradient-gold">Syndicate terminal</span></>}
        description="Every metric reads live from Avalanche C-Chain. No estimates. No off-chain assumptions. Anything we cannot verify is labeled PENDING."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {cells.map((c) => (
          <OverviewCell key={c.label} c={c} />
        ))}
      </div>
    </Section>
  );
}

function OverviewCell({ c }: { c: Cell }) {
  const tone =
    c.status === "live"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : c.status === "partial"
      ? "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400"
      : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  const dot =
    c.status === "live" ? "bg-emerald-500" : c.status === "partial" ? "bg-sky-500" : "bg-amber-500";
  const pillLabel = c.status === "live" ? "LIVE" : c.status === "partial" ? "PARTIAL" : "PENDING";
  const inner = (
    <article className="surface elevated p-3 h-full flex flex-col gap-1.5 hover:border-[var(--gold)]/40 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground leading-tight">{c.label}</span>
        <span className={`mono inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] ${tone}`}>
          <span className={`size-1 rounded-full ${dot}`} />
          {pillLabel}
        </span>
      </div>
      <div className="mono text-base md:text-lg font-semibold leading-none truncate text-foreground">
        {c.value}
      </div>
      <div className="text-[10px] text-muted-foreground leading-snug">{c.hint}</div>
      {c.href ? (
        <span className="mono text-[9px] uppercase tracking-[0.16em] text-[var(--navy-soft)] mt-auto">Verify ↗</span>
      ) : null}
    </article>
  );
  if (c.href) {
    if (c.href.startsWith("/")) {
      return (
        <a href={c.href}>{inner}</a>
      );
    }
    return (
      <a href={c.href} target="_blank" rel="noopener noreferrer">{inner}</a>
    );
  }
  return inner;
}
