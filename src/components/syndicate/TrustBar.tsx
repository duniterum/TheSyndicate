import {
  ARCHIVE_NFT_EXPLORERS,
  LP_POOL,
  SYN_EXPLORERS,
  explorerUrlFor,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";

type TrustItem = {
  label: string;
  href: string | null;
  description: string;
  status: "live" | "pending";
  glyph: string;
};

const DEXSCREENER_URL = `https://dexscreener.com/avalanche/${LP_POOL.pairAddress}`;

const TRUST_ITEMS: TrustItem[] = [
  { label: "SYN Token",      href: SYN_EXPLORERS.avascan, description: "ERC20 on Avalanche · fixed supply", status: "live", glyph: "◆" },
  { label: "Sale Contract",  href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"), description: "Membership Sale · USDC → SYN @ $0.01", status: "live", glyph: "◇" },
  { label: "LP Pool",        href: explorerUrlForAddress(LP_POOL.pairAddress), description: "Trader Joe AMM · SYN/USDC pair", status: "live", glyph: "◈" },
  { label: "Avascan",        href: SYN_EXPLORERS.avascan, description: "Primary Avalanche explorer", status: "live", glyph: "⬡" },
  { label: "SnowScan",       href: SYN_EXPLORERS.snowtrace, description: "Snowtrace · alternate explorer", status: "live", glyph: "❄" },
  { label: "Sourcify",       href: SYN_EXPLORERS.sourcify, description: "Source verified · open registry", status: "live", glyph: "✓" },
  { label: "Trader Joe",     href: LP_POOL.traderJoeUrl, description: "Trade SYN / Add liquidity", status: "live", glyph: "♦" },
  { label: "DEXScreener",    href: DEXSCREENER_URL, description: "Awaiting indexing · pool live", status: "live", glyph: "▲" },
  { label: "Snapshot",       href: null, description: "Governance — coming soon", status: "pending", glyph: "◐" },
  { label: "Archive1155",    href: ARCHIVE_NFT_EXPLORERS.avascan, description: "The First Signal mint live", status: "live", glyph: "◑" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border/40 bg-[color:oklch(0.98_0.005_260/0.6)] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-4">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">
            ✓ Verify Everything
          </div>
          <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            Don't trust · verify
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x scrollbar-thin">
          {TRUST_ITEMS.map((t) => (
            <TrustChip key={t.label} item={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustChip({ item }: { item: TrustItem }) {
  const live = item.status === "live" && item.href;
  const cls = live
    ? "border-border/60 hover:border-[var(--gold)]/60 hover:bg-card text-foreground"
    : "border-amber-500/30 bg-amber-500/5 text-muted-foreground";

  const inner = (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span className={`text-xs ${live ? "text-[var(--gold)]" : "text-amber-600"}`}>{item.glyph}</span>
      <span className="mono text-[11px] uppercase tracking-[0.14em] font-medium">{item.label}</span>
      {live ? (
        <span className="mono text-[9px] text-muted-foreground">↗</span>
      ) : (
        <span className="mono text-[8px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">soon</span>
      )}
    </span>
  );

  const titleAttr = `${item.label} — ${item.description}`;

  if (live) {
    return (
      <a
        href={item.href!}
        target="_blank"
        rel="noopener noreferrer"
        title={titleAttr}
        className={`group snap-start shrink-0 rounded-md border px-3 py-2 transition-colors ${cls}`}
      >
        {inner}
      </a>
    );
  }
  return (
    <div title={titleAttr} className={`snap-start shrink-0 rounded-md border px-3 py-2 ${cls}`}>
      {inner}
    </div>
  );
}
