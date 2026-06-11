import { formatUnits } from "viem";
import {
  USDC_DECIMALS,
  SYN_DECIMALS,
  LP_POOL,
  explorerUrlFor,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";
import { useSaleStats, useLpStats } from "@/lib/sale-hooks";
import { Section, SectionHeader, CTAButton } from "@/components/syndicate/Primitives";

const fmtN = (n: number, max = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: max });

type Cell = {
  label: string;
  value: string;
  hint: string;
  href?: string | null;
  status: "live" | "pending";
};

export function MarketDashboard() {
  const s = useSaleStats();
  const lp = useLpStats();
  const loading = s.isLoading || lp.isLoading;
  const dash = "…";

  const usdcRaised =
    s.totalUsdcRaised !== undefined ? Number(formatUnits(s.totalUsdcRaised, USDC_DECIMALS)) : undefined;
  const synSold =
    s.totalSynSold !== undefined ? Number(formatUnits(s.totalSynSold, SYN_DECIMALS)) : undefined;
  const inventory =
    s.availableSyn !== undefined ? Number(formatUnits(s.availableSyn, SYN_DECIMALS)) : undefined;

  const cells: Cell[] = [
    {
      label: "SYN Price",
      value: lp.synPriceUsd !== undefined ? `$${lp.synPriceUsd.toLocaleString("en-US", { maximumFractionDigits: 6 })}` : (loading ? dash : "—"),
      hint: "Implied from LP reserves",
      href: LP_POOL.traderJoeUrl,
      status: "live",
    },
    {
      label: "Liquidity (TVL)",
      value: lp.tvlUsd !== undefined ? `$${fmtN(lp.tvlUsd, 2)}` : (loading ? dash : "—"),
      hint: `${LP_POOL.pair} · ${LP_POOL.dex}`,
      href: explorerUrlForAddress(LP_POOL.pairAddress),
      status: "live",
    },
    {
      label: "Pool",
      value: `${LP_POOL.pair}`,
      hint: `${LP_POOL.dex} · ${LP_POOL.poolType}`,
      href: LP_POOL.traderJoeUrl,
      status: "live",
    },
    {
      label: "24h Volume",
      value: "—",
      hint: "Awaiting DEXScreener indexer",
      status: "pending",
    },
    {
      label: "Transactions",
      value: s.purchaseCount !== undefined ? fmtN(Number(s.purchaseCount)) : (loading ? dash : "—"),
      hint: "Sale purchaseCount()",
      href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
      status: "live",
    },
    {
      label: "Unique Buyers",
      value: s.totalBuyers !== undefined ? fmtN(Number(s.totalBuyers)) : (loading ? dash : "—"),
      hint: "Sale totalBuyers()",
      href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
      status: "live",
    },
    {
      label: "USDC Routed",
      value: usdcRaised !== undefined ? `$${fmtN(usdcRaised, 2)}` : (loading ? dash : "—"),
      hint: "Sale totalUsdcRaised()",
      href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
      status: "live",
    },
    {
      label: "SYN Sold",
      value: synSold !== undefined ? `${fmtN(synSold)} SYN` : (loading ? dash : "—"),
      hint: "Sale totalSynSold()",
      href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
      status: "live",
    },
    {
      label: "Inventory",
      value: inventory !== undefined ? `${fmtN(inventory)} SYN` : (loading ? dash : "—"),
      hint: "Sale availableSyn()",
      href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
      status: "live",
    },
    {
      label: "LP Supply",
      value: lp.lpSupply !== undefined ? fmtN(lp.lpSupply, 4) : (loading ? dash : "—"),
      hint: "JLP totalSupply()",
      href: explorerUrlForAddress(LP_POOL.pairAddress),
      status: "live",
    },
  ];

  return (
    <Section id="market" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Market Dashboard"
        title={<>Live <span className="text-gradient-gold">market signals</span></>}
        description="Every cell reads from the SYN token, Membership Sale, and Trader Joe LP pair on Avalanche. Refreshes every 60 seconds."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {cells.map((c) => (
          <MarketCell key={c.label} c={c} />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <CTAButton variant="gold" href="/join">Join The Syndicate →</CTAButton>
        <CTAButton variant="ghost" href={LP_POOL.traderJoeUrl}>Trade on Trader Joe ↗</CTAButton>
        <CTAButton variant="ghost" href="/liquidity">Liquidity dashboard →</CTAButton>
      </div>
    </Section>
  );
}

function MarketCell({ c }: { c: Cell }) {
  const live = c.status === "live";
  const inner = (
    <article className="surface elevated p-3 h-full flex flex-col gap-1.5 hover:border-[var(--gold)]/40 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground leading-tight">{c.label}</span>
        <span
          className={`mono inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] ${
            live
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
        >
          <span className={`size-1 rounded-full ${live ? "bg-emerald-500" : "bg-amber-500"}`} />
          {live ? "LIVE" : "SOON"}
        </span>
      </div>
      <div className={`mono text-base md:text-lg font-semibold leading-none truncate ${live ? "text-foreground" : "text-muted-foreground"}`}>
        {c.value}
      </div>
      <div className="text-[10px] text-muted-foreground leading-snug">{c.hint}</div>
      {live && c.href ? (
        <span className="mono text-[9px] uppercase tracking-[0.16em] text-[var(--navy-soft)] mt-auto">Verify ↗</span>
      ) : null}
    </article>
  );
  if (live && c.href) {
    return (
      <a href={c.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}
