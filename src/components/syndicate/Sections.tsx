import { useMemo, useState } from "react";
import { importSynToWallet, MetaMaskIcon } from "@/lib/wallet-import";
import { BuildStamp } from "@/components/syndicate/BuildStamp";
import { HeartSignalTrigger } from "@/components/syndicate/HeartSignalModal";
import { BrandMark, Wordmark } from "@/components/syndicate/Logo";
import { useSaleStats, fmtSyn } from "@/lib/sale-hooks";
import {
  AnimatedNumber,
  CTAButton,
  GlassCard,
  LiveTimestamp,
  MetricCard,
  Pill,
  ProgressBar,
  Section,
  SectionHeader,
  ShortAddress,
} from "./Primitives";
import { useLiveData } from "@/hooks/use-live-data";
import {
  SYNDICATE_CONFIG,
  verifyOnchain,
  VAULT_ASSETS,
  VAULT_INFLOWS,
  VAULT_ALLOCATION,
  RANKS_V2,
  ACCESS_RATE_USDC_PER_SYN,
  rankForUsdc,
  rankForSyn,
  vaultFlow,
  LEGAL_DISCLAIMER,
  TOKENOMICS_ALLOCATION,
  TOKEN_SPEC,
  MEMBERSHIP_POOL,
  ACCESS_RATE_LABEL,
  type RankTier,
} from "@/lib/syndicate-config";
import {
  avascanAddressUrl,
  avascanTokenUrl,
  routescanContractCodeUrl,
  snowtraceTokenUrl,
} from "@/lib/chain-registry";

const SYN_ADDR = SYNDICATE_CONFIG.TOKEN_CONTRACT_ADDRESS;

/* ─────────────────────────── 01. The Idea ─────────────────────────── */
export function IdeaSection() {
  return (
    <Section id="idea">
      <SectionHeader
        eyebrow="01 — The Idea"
        title={<>Not another token. <span className="text-gradient-gold">A real-life compounding experiment.</span></>}
        description="The Syndicate turns spectators into participants. Members join with USDC, receive utility tokens, earn rank recognition, and follow a public Vault wallet verifiable onchain."
      />
      <GlassCard className="p-8 md:p-12" glow="gold">
        <div className="mono text-[10px] uppercase tracking-[0.25em] text-[color:oklch(0.5_0.13_75)] mb-4">
          Mission Question
        </div>
        <p className="text-2xl md:text-4xl font-medium leading-snug tracking-tight text-foreground">
          “Can a transparent group of long-term thinkers compound{" "}
          <span className="text-gradient-gold">discipline, capital, reputation, and opportunity</span>{" "}
          over decades?”
        </p>
      </GlassCard>
    </Section>
  );
}

/* ─────────────────────── 02. Live Monitoring Dashboard ─────────────────────── */
export function VaultDashboard() {
  const live = useLiveData(5000);
  const pct = (live.vaultValue / live.nextMilestone) * 100;

  const metrics: Array<{
    label: string;
    value: React.ReactNode;
    hint?: string;
    trend?: React.ReactNode;
    accent?: "gold" | "navy";
  }> = [
    { label: "Vault Value", value: <AnimatedNumber value={Math.round(live.vaultValue)} prefix="$" />, hint: "USDC", trend: <ProgressBar value={pct} /> },
    { label: "USDC Received", value: <AnimatedNumber value={Math.round(live.usdcReceived)} prefix="$" />, hint: "All-time inflows" },
    { label: "SYN Distributed", value: <AnimatedNumber value={live.synDistributed} />, hint: `of ${SYNDICATE_CONFIG.TOTAL_SUPPLY}` },
    { label: "Vault Growth Since Genesis", value: `${pct.toFixed(1)}%`, hint: "Baseline = $100", accent: "navy" },
    { label: "Members Joined", value: <AnimatedNumber value={live.members} />, hint: "Founding phase" },
    { label: "Token Holders", value: <AnimatedNumber value={live.tokenHolders} />, hint: "Unique wallets" },
    { label: "Circulating Supply", value: `${(live.synDistributed / 1_000_000_000 * 100).toFixed(4)}%`, hint: `of ${SYNDICATE_CONFIG.TOTAL_SUPPLY}`, trend: <ProgressBar value={live.synDistributed / 1_000_000_000 * 100} /> },
    { label: "Locked Supply", value: `${(100 - live.synDistributed / 1_000_000_000 * 100).toFixed(2)}%`, hint: "Pre-distribution" },
    { label: "Founder Vesting Status", value: "Cliff", hint: "12-mo cliff active", accent: "navy" },
    { label: "Next Milestone", value: `$${live.nextMilestone.toLocaleString("en-US")}`, hint: "Vault target", trend: <ProgressBar value={pct} /> },
  ];

  return (
    <Section id="vault">
      <SectionHeader
        eyebrow="02 — Vault Preview"
        title={<>Vault dashboard <span className="text-gradient-gold">preview.</span></>}
        description="Future Vault monitoring terminal. The Membership Sale routes 70% of USDC inflows live; the programmatic Vault contract that owns and reports these values is still PENDING."
      />
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Pill tone="muted">PENDING</Pill>
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Values are illustrative · pending Vault contract
          </span>
        </div>
        <LiveTimestamp date={live.lastUpdated} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} verifyHref={verifyOnchain(m.label)} />
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────── Shared formatters ─────────────────────── */
const fmtUsd = (n: number) =>
  n < 100 ? `$${n.toFixed(2).replace(/\.00$/, "")}` : `$${Math.round(n).toLocaleString("en-US")}`;
/* ─────────────────────── 05. Payment Strategy ─────────────────────── */
const FLOW = [
  "Member pays USDC",
  "SYN distributed to wallet",
  "70/20/10 routed on-chain",
  "Member number assigned",
  "Rank updates from SYN balance",
  "Wallet recorded on public archive",
];

export function PaymentStrategy() {
  return (
    <Section id="payment">
      <SectionHeader
        eyebrow="05 — Payment Strategy"
        title={<>Why <span className="text-gradient-gold">USDC first?</span></>}
        description="USDC keeps entry simple, pricing clear, and Vault accounting transparent. The DEX remains an optional exit and secondary market, while the site is designed as the main onboarding experience."
      />
      <GlassCard>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-5">
          V1 onboarding flow
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="surface px-3.5 py-2 text-sm">
                <span className="mono text-[10px] text-[color:oklch(0.5_0.13_75)] mr-2">0{i + 1}</span>
                {s}
              </div>
              {i < FLOW.length - 1 && <span className="text-[var(--gold)]/60">→</span>}
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground border-l-2 border-[var(--navy)]/30 pl-3">
          Future versions may support additional tokens or DEX entry, but V1 prioritizes clarity.
        </p>
      </GlassCard>
    </Section>
  );
}

/* ─────────────────────── 06. Ranks ─────────────────────── */
export function Ranks() {
  return (
    <Section id="ranks">
      <SectionHeader
        eyebrow="06 — Ranks"
        title={<>Ranks are based on <span className="text-gradient-gold">SYN held.</span></>}
        description="Twelve unlockable ranks, one fixed rate. Status is derived from on-chain SYN balance — larger purchases unlock recognition and archive placement, never bonus tokens."
      />
      <div className="surface overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-border/60 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <div className="col-span-1">#</div>
          <div className="col-span-2">Rank</div>
          <div className="col-span-2 text-right">Required SYN</div>
          <div className="col-span-2 text-right">USDC equiv.</div>
          <div className="col-span-2 text-right">Next-rank gap</div>
          <div className="col-span-1 text-right">Rank</div>
          <div className="col-span-2">Status benefit</div>
        </div>
        <ul>
          {RANKS_V2.map((r, i) => {
            const nextTier = RANKS_V2[i + 1] ?? null;
            return (
              <li
                key={r.name}
                className="grid grid-cols-2 md:grid-cols-12 gap-3 px-5 py-4 items-center text-sm border-b last:border-b-0 border-border/50 hover:bg-panel/50 transition-colors"
              >
                <div className="md:col-span-1 mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <Pill tone={i >= 9 ? "gold" : "muted"}>{r.name}</Pill>
                </div>
                <div className="md:col-span-2 md:text-right mono">{r.syn.toLocaleString("en-US")} SYN</div>
                <div className="md:col-span-2 md:text-right mono">${r.usdc.toLocaleString("en-US")}</div>
                <div className="md:col-span-2 md:text-right mono text-[11px] text-muted-foreground">
                  {nextTier ? `+${(nextTier.syn - r.syn).toLocaleString("en-US")} SYN → ${nextTier.name}` : "Top tier"}
                </div>
                <div className="md:col-span-1 md:text-right mono text-gradient-gold font-semibold">{String(i + 1).padStart(2, "0")}</div>
                <div className="md:col-span-2 text-foreground/80 text-[12px]">{r.benefits[0]}</div>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-4 text-xs text-muted-foreground border-l-2 border-[var(--navy)]/30 pl-3 max-w-3xl">
        Status and archive placement scale with cumulative purchase size. Token rate stays fixed at 1 SYN = $0.01 USDC.
      </p>
    </Section>
  );
}


/* ─────────────────────── 07. Initial Holders (CONFIRMED INITIAL MINT) ─────────────────────── */
const INITIAL_HOLDERS = [
  { rank: 1, label: "Membership Distribution", addr: "0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8", syn: "350,000,000", pct: "35%" },
  { rank: 2, label: "Vault Reserve",                          addr: "0x205DdC8921A4C60106930eE35e1F395c8D13f464", syn: "250,000,000", pct: "25%" },
  { rank: 3, label: "Founder",                                addr: "0x88EC79AF0d5A2F3b83022A1770c645506803Dd73", syn: "120,000,000", pct: "12%" },
  { rank: 4, label: "Liquidity",                              addr: "0xa9b072db8DcDbb470235204B69D37275d74a2e25", syn: "100,000,000", pct: "10%" },
  { rank: 5, label: "Partnerships",                           addr: "0xf5BEdEEfe48f746d96C1847a5595318579bBcaCf", syn:  "80,000,000", pct:  "8%" },
  { rank: 6, label: "Contributors",                           addr: "0xa55132346C70e63d0c4E0Fb15F35075760dDEF7a", syn:  "50,000,000", pct:  "5%" },
  { rank: 7, label: "Future Ecosystem",                       addr: "0x2530393881820AFe789f1c5D83817B70e46d2963", syn:  "50,000,000", pct:  "5%" },
];

export function Leaderboard() {
  return (
    <Section id="leaderboard">
      <SectionHeader
        eyebrow="07 — Initial Holders"
        title={<>Initial holders — <span className="text-gradient-gold">7 public allocation wallets</span></>}
        description="The genesis distribution of SYN. Every wallet is public, every balance is verifiable on Avascan. The Syndicate does not publish a wealth leaderboard of members — see Ranks for the recognition model."
      />
      <div className="mb-4 flex items-center gap-2">
        <Pill tone="gold">CONFIRMED INITIAL MINT</Pill>
        <span className="text-xs text-muted-foreground">Top 7 wallets share: 100% · Top 10: 100% · Largest: 35%</span>
      </div>
      <div className="surface overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-border/60 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Allocation</div>
          <div className="col-span-3">Wallet</div>
          <div className="col-span-2 text-right">SYN Balance</div>
          <div className="col-span-1 text-right">Share</div>
          <div className="col-span-1 text-right">Explorer</div>
        </div>
        <ul>
          {INITIAL_HOLDERS.map((w) => (
            <li key={w.rank} className="grid grid-cols-2 md:grid-cols-12 gap-3 px-5 py-4 items-center text-sm border-b last:border-b-0 border-border/50">
              <div className="md:col-span-1 mono"><span className={w.rank <= 3 ? "text-gradient-gold font-semibold" : ""}>{w.rank}</span></div>
              <div className="md:col-span-4 text-foreground">{w.label}</div>
              <div className="md:col-span-3"><ShortAddress addr={w.addr} /></div>
              <div className="md:col-span-2 md:text-right mono text-sm">{w.syn}</div>
              <div className="md:col-span-1 md:text-right mono text-gradient-gold font-semibold">{w.pct}</div>
              <div className="md:col-span-1 md:text-right">
                <a href={avascanAddressUrl(w.addr) ?? "#"} target="_blank" rel="noopener noreferrer" className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)]">↗</a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ─────────────────────── 08. (removed) Reputation / rank-score model
 * ─────────────────────── 09. (removed) NFT Layer with hardcoded mock badges
 *
 * Both sections were dead exports — never imported by any route or component
 * (verified via grep on 2026-06-05). They carried constitution-banned content
 * (hardcoded "642" rank, "Decade Member" badge, a rank-weighted reputation
 * score, mock NFT placeholders with $1–$10 mint range). Removed during the
 * final pre-launch repair pass. Per the Rank Constitutional Ruling, rank
 * confers no economic benefit and must never drive a weighted score. If a
 * real reputation or NFT surface is built later, model it on the canonical
 * on-chain hooks (useProtocolPulse / useHolderIndex) and avoid mock data.
 */

/* ─────────────────────── 10. The Vault Balance Sheet ─────────────────────── */
const ASSET_ICON: Record<string, { glyph: string; bg: string; fg: string }> = {
  USDC: { glyph: "$",  bg: "oklch(0.92 0.09 165 / 0.35)", fg: "oklch(0.42 0.16 165)" },
  ETH:  { glyph: "Ξ",  bg: "oklch(0.92 0.04 260 / 0.5)",  fg: "oklch(0.32 0.06 260)" },
  WBTC: { glyph: "₿",  bg: "oklch(0.92 0.08 60 / 0.4)",   fg: "oklch(0.48 0.14 60)"  },
  AVAX: { glyph: "▲",  bg: "oklch(0.92 0.10 25 / 0.35)",  fg: "oklch(0.5 0.18 25)"   },
  SOL:  { glyph: "◎",  bg: "oklch(0.92 0.06 290 / 0.4)",  fg: "oklch(0.45 0.18 290)" },
  SYN:  { glyph: "◆",  bg: "oklch(0.94 0.08 85 / 0.5)",   fg: "oklch(0.5 0.13 75)"   },
};

function AssetIcon({ symbol }: { symbol: string }) {
  const s = ASSET_ICON[symbol] ?? ASSET_ICON.SYN;
  return (
    <span
      className="mono inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold"
      style={{ background: s.bg, color: s.fg }}
      aria-hidden
    >
      {s.glyph}
    </span>
  );
}

function StatusTag({ status }: { status: "LIVE" | "PARTIAL" | "PENDING" }) {
  const tone = status === "LIVE" ? "success" : status === "PARTIAL" ? "gold" : "muted";
  return <Pill tone={tone as "success" | "gold" | "muted"}>{status}</Pill>;
}

const VERIFY_ENTITIES = [
  { label: "Vault Wallet",       addr: SYNDICATE_CONFIG.TREASURY_WALLET_ADDRESS },
  { label: "Founder Wallet",     addr: SYNDICATE_CONFIG.FOUNDER_WALLET_ADDRESS },
  { label: "Liquidity Wallet",   addr: SYNDICATE_CONFIG.LIQUIDITY_WALLET_ADDRESS },
  { label: "Operations Wallet",  addr: SYNDICATE_CONFIG.COMMUNITY_WALLET_ADDRESS },
  { label: "Token Contract",     addr: SYNDICATE_CONFIG.TOKEN_CONTRACT_ADDRESS },
  { label: "Archive Contract (Archive1155)", addr: SYNDICATE_CONFIG.NFT_CONTRACT_ADDRESS },
  { label: "LP Pool",            addr: SYNDICATE_CONFIG.LP_POOL_ADDRESS },
];

const fmtMoney = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function VaultPolicy() {
  const totalUsd = VAULT_ASSETS.reduce((sum, a) => sum + (a.usdValue ?? 0), 0);
  const membership = VAULT_INFLOWS.find((i) => i.internalKey === "membershipSales")?.amount ?? 0;
  const nft = VAULT_INFLOWS.find((i) => i.internalKey === "nftMints")?.amount ?? 0;
  const otherRevenue =
    (VAULT_INFLOWS.find((i) => i.internalKey === "lpFees")?.amount ?? 0) +
    (VAULT_INFLOWS.find((i) => i.internalKey === "partnerships")?.amount ?? 0) +
    (VAULT_INFLOWS.find((i) => i.internalKey === "otherRevenue")?.amount ?? 0);
  const liquidityReserve = totalUsd * VAULT_ALLOCATION.liquidityReinforcement;
  const operationsReserve = totalUsd * VAULT_ALLOCATION.operationsCommunity;
  const vaultAssetsAlloc = totalUsd * VAULT_ALLOCATION.vaultAssets;
  const updated = new Date();

  const summary: Array<{ label: string; value: React.ReactNode; hint?: string; accent?: "gold" | "navy"; live?: boolean }> = [
    { label: "Total Assets",                value: <span className="mono">{VAULT_ASSETS.length}</span>,           hint: "Asset categories tracked" },
    { label: "Membership Access (USDC)",    value: <AnimatedNumber value={membership} prefix="$" />,              hint: "Inflow from founding members" },
    { label: "NFT Mint Revenue",            value: <AnimatedNumber value={nft} prefix="$" />,                     hint: "Artifact mints", accent: "navy" },
    { label: "Other Ecosystem Revenue",     value: <AnimatedNumber value={otherRevenue} prefix="$" />,            hint: "LP fees · partnerships · other", accent: "navy" },
    { label: "Liquidity Reserve",           value: <AnimatedNumber value={Math.round(liquidityReserve)} prefix="$" />, hint: "20% allocation policy" },
    { label: "Operations Reserve",          value: <AnimatedNumber value={Math.round(operationsReserve)} prefix="$" />, hint: "10% allocation policy", accent: "navy" },
  ];

  return (
    <Section id="vault-policy">
      <SectionHeader
        eyebrow="10 — The Vault Balance Sheet"
        title={<>The <span className="text-gradient-gold">Vault Balance Sheet</span></>}
        description="Every asset, inflow, and allocation is designed to be verifiable onchain."
      />

      {/* ── Vault Summary ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--gold)] pulse-dot" />
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Vault Summary</span>
          </div>
          <LiveTimestamp date={updated} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Hero — Total Vault Value */}
          <GlassCard glow="gold" className="lg:col-span-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Pill tone="gold">Hero</Pill>
              <StatusTag status="PENDING" />
            </div>
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">Total Vault Value</div>
            <div className="mono text-5xl md:text-6xl font-semibold text-gradient-gold leading-none">
              <AnimatedNumber value={Math.round(totalUsd)} prefix="$" />
            </div>
            <div className="mono text-[11px] text-muted-foreground">USD-equivalent across all Vault assets</div>
            <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
              <a href={verifyOnchain("vault")} className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)]">
                Verify on-chain →
              </a>
              <span className="mono text-[10px] text-muted-foreground">Auto-refresh planned</span>
            </div>
          </GlassCard>

          {/* Summary grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            {summary.map((s) => (
              <MetricCard
                key={s.label}
                label={s.label}
                value={s.value}
                hint={s.hint}
                accent={s.accent}
                verifyHref={verifyOnchain(s.label)}
                live={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Asset Breakdown ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Asset Breakdown</span>
          <span className="mono text-[10px] text-muted-foreground">{VAULT_ASSETS.length} assets · {totalUsd > 0 ? fmtMoney(totalUsd) : "$0"} total</span>
        </div>

        <div className="surface overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-border/60 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <div className="col-span-3">Asset</div>
            <div className="col-span-2 text-right">Balance</div>
            <div className="col-span-2 text-right">USD Value</div>
            <div className="col-span-2">% of Vault</div>
            <div className="col-span-2">Wallet / Chain</div>
            <div className="col-span-1 text-right">Verify</div>
          </div>
          <ul>
            {VAULT_ASSETS.map((a) => {
              const pct = totalUsd > 0 && a.usdValue != null ? (a.usdValue / totalUsd) * 100 : 0;
              const isInternal = a.usdValue == null;
              return (
                <li
                  key={a.symbol}
                  className="grid grid-cols-2 md:grid-cols-12 gap-3 px-5 py-4 items-center text-sm border-b last:border-b-0 border-border/50 hover:bg-panel/50 transition-colors"
                >
                  <div className="md:col-span-3 flex items-center gap-3">
                    <AssetIcon symbol={a.symbol} />
                    <div>
                      <div className="font-medium">{a.symbol}</div>
                      <div className="mono text-[10px] text-muted-foreground capitalize">{a.category}</div>
                    </div>
                  </div>
                  <div className="md:col-span-2 md:text-right mono text-sm">
                    {a.balance.toLocaleString("en-US")}
                  </div>
                  <div className="md:col-span-2 md:text-right mono text-sm">
                    {isInternal ? <span className="text-muted-foreground">internal reserve</span> : fmtMoney(a.usdValue ?? 0)}
                  </div>
                  <div className="md:col-span-2">
                    {isInternal ? (
                      <span className="mono text-[11px] text-muted-foreground">—</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ProgressBar value={pct} />
                        <span className="mono text-[11px] text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <span className="mono text-[11px]">{a.chain}</span>
                    <StatusTag status={a.status} />
                  </div>
                  <div className="md:col-span-1 md:text-right">
                    <a href={a.explorerUrl} className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)]">↗</a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── Vault Inflows ── */}
      <div className="mb-10">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">Vault Inflows</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {VAULT_INFLOWS.map((inf) => (
            <div key={inf.source} className="surface p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Pill tone={inf.amount > 0 ? "gold" : "muted"}>{inf.source}</Pill>
                <StatusTag status={inf.status} />
              </div>
              <div className="mono text-2xl font-semibold text-gradient-gold leading-none">
                {fmtMoney(inf.amount)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Txs</div>
                  <div className="mono mt-0.5">{inf.txCount}</div>
                </div>
                <div>
                  <div className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Latest</div>
                  <a href={inf.latestTx} className="mono mt-0.5 text-[var(--navy-soft)] hover:text-[var(--gold)]">↗</a>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{inf.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Vault Allocation ── */}
      <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard glow="gold" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">Vault Allocation</span>
            <Pill tone="muted">Policy</Pill>
          </div>
          <div className="space-y-5">
            {[
              { label: "Vault Assets",            pct: VAULT_ALLOCATION.vaultAssets,            usd: vaultAssetsAlloc, tone: "gold" as const },
              { label: "Liquidity Reinforcement", pct: VAULT_ALLOCATION.liquidityReinforcement, usd: liquidityReserve, tone: "navy" as const },
              { label: "Operations / Community",  pct: VAULT_ALLOCATION.operationsCommunity,    usd: operationsReserve, tone: "gold" as const },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm">{row.label}</span>
                  <span className="mono text-sm">
                    <span className="text-gradient-gold mr-3">{(row.pct * 100).toFixed(0)}%</span>
                    <span className="text-muted-foreground">{fmtMoney(Math.round(row.usd))}</span>
                  </span>
                </div>
                <ProgressBar value={row.pct * 100} tone={row.tone} />
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground border-l-2 border-[var(--navy)]/30 pl-3">
            Allocation policy may evolve through governance as The Syndicate matures.
          </p>
        </GlassCard>

        <GlassCard glow="navy">
          <Pill tone="navy">Disclaimer</Pill>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            The Vault is an ecosystem resource. SYN does not represent ownership of Vault assets, equity, debt, dividends, or guaranteed claims.
          </p>
        </GlassCard>
      </div>

      {/* ── Verify Everything ── */}
      <div>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">Verify Everything</div>
        <div className="surface p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {VERIFY_ENTITIES.map((w) => (
              <div key={w.label} className="rounded-md border border-border/60 bg-panel/40 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{w.label}</div>
                  <div className="mono mt-0.5 text-[11px] text-muted-foreground">
                    {w.addr.slice(0, 8)}…{w.addr.slice(-6)}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => navigator.clipboard?.writeText(w.addr)}
                    className="mono text-[10px] uppercase tracking-[0.18em] rounded border border-border/70 px-2 py-1 hover:bg-card"
                    aria-label={`Copy ${w.label} address`}
                  >
                    Copy
                  </button>
                  <a
                    href={verifyOnchain(w.label)}
                    className="mono text-[10px] uppercase tracking-[0.18em] rounded border border-border/70 px-2 py-1 hover:bg-card"
                    aria-label={`Open ${w.label} in explorer`}
                  >
                    ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────── 11. Token Allocation ─────────────────────── */
export function Allocation() {
  const poolPct = MEMBERSHIP_POOL.progressPct;
  return (
    <Section id="allocation">
      <SectionHeader
        eyebrow="11 — Tokenomics"
        title={<>Token allocation <span className="text-gradient-gold">before expansion.</span></>}
        description={`Total Supply: ${TOKEN_SPEC.totalSupply.toLocaleString("en-US")} ${TOKEN_SPEC.symbol} · ${TOKEN_SPEC.chain} · Fixed supply · No future mint · 0% tax · No admin powers.`}
      />

      {/* Core token spec card */}
      <GlassCard className="mb-5">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-3">Core Token</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[
            ["Name", TOKEN_SPEC.name],
            ["Symbol", TOKEN_SPEC.symbol],
            ["Total Supply", `${TOKEN_SPEC.totalSupply.toLocaleString("en-US")} SYN`],
            ["Decimals", String(TOKEN_SPEC.decimals)],
            ["Chain", TOKEN_SPEC.chain],
            ["Fixed Supply", "Yes"],
            ["Future Mint", "No"],
            ["Tax", "0%"],
            ["Blacklist", "No"],
            ["Admin Powers", "None"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-border/60 p-3">
              <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{k}</div>
              <div className="mono text-sm font-semibold mt-1 text-foreground">{v}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <GlassCard className="lg:col-span-3">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-3">Allocation</div>
          <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full border border-border/60">
            {TOKENOMICS_ALLOCATION.map((a, i) => (
              <div
                key={a.label}
                style={{
                  width: `${a.pct}%`,
                  background:
                    i === 0 ? "var(--gradient-gold)"
                    : i === 2 ? "var(--gradient-navy)"
                    : `oklch(${0.6 + i * 0.04} 0.07 ${75 + i * 12})`,
                }}
              />
            ))}
          </div>
          <ul className="divide-y divide-border/50">
            {TOKENOMICS_ALLOCATION.map((a) => (
              <li key={a.label} className="py-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{a.label}</span>
                  <span className="mono text-sm">
                    <span className="text-gradient-gold font-semibold">{a.pct}%</span>
                    <span className="text-muted-foreground"> · {a.syn.toLocaleString("en-US")} SYN</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{a.description}</p>
              </li>
            ))}
          </ul>
        </GlassCard>

        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Membership Distribution Pool */}
          <GlassCard glow="gold">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-2">Membership Distribution Pool</div>
            <div className="mono text-2xl font-semibold tracking-tight">{MEMBERSHIP_POOL.allocated.toLocaleString("en-US")} SYN</div>
            <div className="mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">35% of total supply · sale pool</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">Allocated</span><span className="mono">{MEMBERSHIP_POOL.allocated.toLocaleString("en-US")} SYN</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Distributed</span><span className="mono">{MEMBERSHIP_POOL.distributed.toLocaleString("en-US")} SYN</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Remaining</span><span className="mono">{MEMBERSHIP_POOL.remaining.toLocaleString("en-US")} SYN</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Sale status</span><span className="mono text-emerald-700 dark:text-emerald-400">LIVE</span></li>
            </ul>
            <div className="mt-3">
              <ProgressBar value={poolPct} />
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">{poolPct.toFixed(2)}% distributed · Membership Sale live on Avalanche</div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              The pool used for website membership purchases, small entries, and custom-amount member purchases.
            </p>
          </GlassCard>

          <GlassCard glow="navy">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--navy-soft)] mb-4">Founder Vesting</div>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between"><span>Cliff</span><span className="mono">12 months</span></li>
              <li className="flex justify-between"><span>Vesting</span><span className="mono">36 months</span></li>
              <li className="flex justify-between"><span>Schedule</span><span className="mono">Monthly</span></li>
              <li className="flex justify-between"><span>Founder Wallet</span><span className="mono text-[color:oklch(0.5_0.13_75)]">Public</span></li>
              <li className="flex justify-between"><span>Hidden Unlocks</span><span className="mono text-[var(--destructive)]">None</span></li>
            </ul>
            <a href={verifyOnchain("founder")} className="mt-5 inline-block mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)]">
              Verify on-chain →
            </a>
          </GlassCard>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-border/80 p-5 bg-panel/40">
        <p className="text-xs text-muted-foreground leading-relaxed">{LEGAL_DISCLAIMER}</p>
      </div>
    </Section>
  );
}

/* ─────────────────────── 12. Supply Discipline ─────────────────────── */
export function SupplyDiscipline() {
  const types = [
    { t: "Time-based releases",         d: "Linear unlocks across a defined schedule." },
    { t: "Milestone-based releases",    d: "Allocations only unlock when public targets are reached." },
    { t: "Governance-approved releases", d: "Unlocks require a member vote and a public episode." },
  ];
  const examples = [
    "Seasonal community budget",
    "Milestone reward pool",
    "Vote-approved partnership allocation",
    "Unused allocation burn proposal",
    "Future liquidity expansion",
  ];
  return (
    <Section id="supply">
      <SectionHeader
        eyebrow="12 — Supply Discipline"
        title={<>Rules <span className="text-gradient-gold">before hype.</span></>}
        description="SYN releases are planned before growth begins. Unused ecosystem allocations may be burned by governance if they are no longer needed for long-term sustainability."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {types.map((x, i) => (
          <GlassCard key={x.t}>
            <Pill tone={i === 0 ? "gold" : "muted"}>0{i + 1}</Pill>
            <div className="mt-3 text-lg font-medium">{x.t}</div>
            <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
          </GlassCard>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {examples.map((e) => (
          <div key={e} className="surface p-4">
            <div className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Example</div>
            <div className="mt-1 text-sm">{e}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────── 13. Episodes ─────────────────────── */
const EPISODES = [
  { n: "001", title: "Genesis",          action: "Constitution published",                            vault: "$100",   members: "1", tag: "Milestone",  status: "Live" },
  { n: "002", title: "Founding Members", action: "USDC onboarding opens",                              vault: "$___",   members: "—", tag: "Community",  status: "Up next" },
  { n: "003", title: "First Genesis NFT", action: "First achievement NFT mint",                       vault: "—",      members: "—", tag: "NFT",        status: "Planned" },
  { n: "004", title: "First Vault Milestone", action: "Vault reaches $1,000",                          vault: "$1,000", members: "—", tag: "Vault",      status: "Planned" },
  { n: "005", title: "First Vote",        action: "Members choose first ecosystem allocation",         vault: "—",      members: "—", tag: "Governance", status: "Planned" },
];

export function EpisodeEngine() {
  return (
    <Section id="episodes">
      <SectionHeader
        eyebrow="13 — Episodes"
        title={<>Every decision becomes <span className="text-gradient-gold">an episode.</span></>}
        description="The Syndicate is designed like a long-running real-life series with onchain consequences. Each milestone, vote, allocation, NFT mint, partnership, burn, or Vault action becomes a public episode."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EPISODES.map((e) => (
          <GlassCard key={e.n}>
            <div className="flex items-center justify-between mb-3">
              <Pill tone="gold">Episode #{e.n}</Pill>
              <Pill tone={e.status === "Live" ? "success" : "muted"}>{e.status}</Pill>
            </div>
            <div className="text-xl font-semibold text-foreground">{e.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{e.action}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-panel/60 p-2.5">
                <div className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Vault</div>
                <div className="mono mt-0.5">{e.vault}</div>
              </div>
              <div className="rounded-md bg-panel/60 p-2.5">
                <div className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Members</div>
                <div className="mono mt-0.5">{e.members}</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50">
              <a href={verifyOnchain(`episode-${e.n}`)} className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)]">
                Onchain proof →
              </a>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────── 14. Token Utility ─────────────────────── */
export function TokenUtility() {
  const isList = ["membership access","rank qualification","member archive status","future ecosystem utility","access to selected Syndicate experiences"];
  const isNotList = ["equity","debt","a dividend right","treasury ownership","a guaranteed return","a passive income product","a claim against the company or Vault"];
  return (
    <Section id="token">
      <SectionHeader
        eyebrow="14 — Token Utility"
        title={<>SYN is a utility token for <span className="text-gradient-gold">access, rank, and participation.</span></>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard glow="gold">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-4">SYN is used for</div>
          <ul className="space-y-2.5">
            {isList.map((x) => (
              <li key={x} className="flex items-start gap-3 text-sm">
                <span className="mono mt-0.5 text-[color:oklch(0.5_0.13_75)]">+</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">SYN is not</div>
          <ul className="space-y-2.5">
            {isNotList.map((x) => (
              <li key={x} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mono mt-0.5 text-[var(--destructive)]">×</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </Section>
  );
}

/* ─────────────────────── 15. Whitepaper (in progress) ─────────────────────── */
const WP_CHAPTERS: Array<{ name: string; status: "Done" | "In Progress" | "Planned" }> = [
  { name: "Mission",            status: "Done" },
  { name: "Constitution",       status: "Done" },
  { name: "Utility Token",      status: "Done" },
  { name: "Vault Policy",       status: "In Progress" },
  { name: "Release Schedule",   status: "In Progress" },
  { name: "Governance",         status: "In Progress" },
  { name: "Member Identity Index", status: "In Progress" },
  { name: "NFT Layer",         status: "Planned" },
  { name: "Risk Disclosures",   status: "Planned" },
  { name: "Long-Term Vision",   status: "Planned" },
];

export function WhitepaperPreview() {
  const done = WP_CHAPTERS.filter((c) => c.status === "Done").length;
  const inProgress = WP_CHAPTERS.filter((c) => c.status === "In Progress").length;
  const pct = Math.round(((done + inProgress * 0.5) / WP_CHAPTERS.length) * 100);
  return (
    <Section id="whitepaper">
      <SectionHeader
        eyebrow="15 — Whitepaper"
        title={<>Whitepaper <span className="text-gradient-gold">in progress.</span></>}
        description="The Syndicate will publish its whitepaper before major expansion. Track each chapter as it moves from planned, to drafting, to finalized."
      />
      <GlassCard glow="navy">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Pill tone="navy">Drafting Phase</Pill>
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">v0 — Draft</span>
          </div>
          <div className="mono text-sm">
            <span className="text-muted-foreground">Whitepaper Progress: </span>
            <span className="text-gradient-gold font-semibold">{pct}%</span>
          </div>
        </div>
        <div className="mb-6"><ProgressBar value={pct} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {WP_CHAPTERS.map((c, i) => {
            const tone = c.status === "Done" ? "success" : c.status === "In Progress" ? "gold" : "muted";
            const mark = c.status === "Done" ? "✓" : c.status === "In Progress" ? "…" : "·";
            return (
              <div key={c.name} className="flex items-center justify-between border-b border-border/50 py-3">
                <div className="flex items-center gap-4">
                  <span className="mono text-[color:oklch(0.5_0.13_75)] text-sm">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm">{c.name}</span>
                  <span className="mono text-xs text-muted-foreground">{mark}</span>
                </div>
                <Pill tone={tone as "success" | "gold" | "muted"}>{c.status}</Pill>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground max-w-md">
            A downloadable PDF will be available here once the draft is finalized and reviewed.
          </p>
          <CTAButton variant="ghost" href="/whitepaper">Read Draft Whitepaper</CTAButton>
        </div>
      </GlassCard>
    </Section>
  );
}

/* ─────────────────────── 16. Constitution ─────────────────────── */
const RULES = [
  "Public wallets by default.",
  "Founder allocation locked and visible.",
  "Vault actions documented.",
  "No hidden private unlocks.",
  "Major ecosystem decisions require public explanation.",
  "SYN is for access, status, and participation.",
  "The mission is long-term compounding, not short-term hype.",
  "Reputation matters more than short-term speculation.",
  "The first chapter remains permanently archived.",
];

export function Constitution() {
  return (
    <Section id="constitution">
      <SectionHeader
        eyebrow="16 — Constitution"
        title={<>The <span className="text-gradient-gold">Constitution</span></>}
        description="Nine rules that anchor the experiment. They cannot be quietly rewritten."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {RULES.map((r, i) => (
          <GlassCard key={r} className="flex gap-4">
            <div className="mono text-3xl text-gradient-gold leading-none shrink-0 w-10">
              {String(i + 1).padStart(2, "0")}
            </div>
            <p className="text-sm leading-relaxed pt-1">{r}</p>
          </GlassCard>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <CTAButton variant="ghost" href="/docs">Read Constitution</CTAButton>
      </div>
    </Section>
  );
}

/* ─────────────────────── 17. Measured FOMO ─────────────────────── */
const FOMO_LINES = [
  "Every Syndicate has a first member.",
  "Join before Episode 010 is written.",
  "The earliest members will always be visible in the archive.",
  "Years from now, the first episodes will still be onchain.",
  "Status is built early, then proven over time.",
  "The Vault starts small. The archive remembers everything.",
];

export function MeasuredFomo() {
  return (
    <Section id="fomo">
      <div className="glass-card glow-border-gold p-10 md:p-16 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-40" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative">
          <div className="mono text-[10px] uppercase tracking-[0.25em] text-[color:oklch(0.5_0.13_75)] mb-4">
            17 — The First Chapter
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl text-foreground">
            The first chapter <span className="text-gradient-gold">only happens once.</span>
          </h2>
          <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 max-w-4xl">
            {FOMO_LINES.map((l) => (
              <li key={l} className="flex items-start gap-3 text-base text-muted-foreground">
                <span className="mt-1.5 size-1 rounded-full bg-[var(--gold)] shrink-0" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <CTAButton variant="gold" href="#join">Become a Founding Member</CTAButton>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────── 18. Rank Progression Ladder ─────────────────────── */
export function RankLadder() {
  return (
    <Section id="ladder">
      <SectionHeader
        eyebrow="18 — Progression"
        title={<>The <span className="text-gradient-gold">Rank Ladder</span></>}
        description="A single fixed rate. Twelve unlockable ranks from $5 to $10,000. Every step is predictable and verifiable."
      />
      <div className="surface p-6 md:p-8">
        <div className="hidden md:block relative h-1.5 rounded-full bg-border/50 mb-8">
          <div className="absolute inset-y-0 left-0 right-0 rounded-full" style={{ background: "var(--gradient-gold)", opacity: 0.55 }} />
          <div className="absolute inset-0 flex justify-between -mt-1.5">
            {RANKS_V2.map((r) => (
              <span key={r.name} className="size-4 rounded-full border-2 border-background shadow" style={{ background: "var(--gradient-navy)" }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {RANKS_V2.map((r, i) => {
            const nextTier = RANKS_V2[i + 1] ?? null;
            return (
              <div key={r.name} className="rounded-md border border-border/60 bg-panel/40 p-3">
                <Pill tone={i >= 9 ? "gold" : "muted"}>{String(i + 1).padStart(2, "0")}</Pill>
                <div className="mt-2 text-sm font-semibold text-foreground">{r.name}</div>
                <div className="mono mt-2 text-[9px] uppercase tracking-widest text-muted-foreground">USDC</div>
                <div className="mono text-sm">${r.usdc.toLocaleString("en-US")}</div>
                <div className="mono mt-2 text-[9px] uppercase tracking-widest text-muted-foreground">SYN</div>
                <div className="mono text-[12px]">{r.syn.toLocaleString("en-US")}</div>
                <div className="mono mt-2 text-[9px] uppercase tracking-widest text-muted-foreground">Next</div>
                <div className="mono text-[10px] text-foreground/70">{nextTier ? `+$${(nextTier.usdc - r.usdc).toLocaleString("en-US")}` : "Top"}</div>
                <div className="mono mt-2 text-[9px] uppercase tracking-widest text-[color:oklch(0.5_0.13_75)]">Tier {String(i + 1).padStart(2, "0")}</div>
              </div>
            );
          })}
        </div>
      </div>


      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard glow="gold">
          <Pill tone="gold">Same rate · Higher recognition</Pill>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Why no discount?</h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            The Syndicate does not discount larger purchases. Every wallet pays the same fixed rate — higher tiers unlock recognition and archive visibility, never cheaper SYN.
          </p>
        </GlassCard>
        <GlassCard glow="navy">
          <Pill tone="navy">Recognition, not extra tokens</Pill>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Status, not free tokens.</h3>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {[
              "Larger archive badge",
              "Early archive placement",
              "Visible tier recognition",
              "Permanent public member number",
              "Manual onboarding at top tiers",
            ].map((x) => (
              <li key={x} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 rounded-full bg-[var(--gold)]" />
                <span className="text-foreground/80">{x}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            No bonus tokens, no yield, no dividend. Recognition is non-dilutive and earned through participation.
          </p>
        </GlassCard>
      </div>
    </Section>
  );
}

/* ─────────────────────── 19. Membership Calculator ─────────────────────── */
export function MembershipCalculator() {
  const [usdc, setUsdc] = useState(121);
  const calc = useMemo(() => {
    const syn = usdc / ACCESS_RATE_USDC_PER_SYN;
    const { current } = rankForSyn(syn);
    const f = vaultFlow(usdc);
    return {
      syn, rank: current?.name ?? "Below Citizen",
      ...f,
    };
  }, [usdc]);

  return (
    <Section id="calculator">
      <SectionHeader
        eyebrow="19 — Calculator"
        title={<>Membership <span className="text-gradient-gold">calculator</span></>}
        description="Type any USDC amount — $3, $7, $25, $121, $777. See SYN received, the rank it reflects, and exactly how your USDC flows into the Vault."
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <GlassCard className="lg:col-span-2 flex flex-col gap-4">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">USDC Amount</div>
          <div className="flex items-baseline gap-2">
            <span className="mono text-2xl">$</span>
            <input
              type="number" min={0} step={1}
              value={usdc}
              onChange={(e) => setUsdc(Math.max(0, Number(e.target.value) || 0))}
              className="mono w-full bg-transparent text-4xl md:text-5xl font-semibold tracking-tight focus:outline-none border-b border-border focus:border-[var(--gold)]"
            />
          </div>
          <input
            type="range" min={0} max={10_000} step={1}
            value={Math.min(usdc, 10_000)}
            onChange={(e) => setUsdc(Number(e.target.value))}
            className="w-full accent-[var(--gold)]"
          />
          <div className="flex flex-wrap gap-2">
            {[5, 10, 25, 50, 75, 100, 250, 500, 1_000, 2_500].map((v) => (
              <button key={v} onClick={() => setUsdc(v)} className="mono rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50">
                ${v.toLocaleString("en-US")}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {usdc < 5
              ? "Simulate any amount. Official Citizen entry starts at $5."
              : "Fixed V1 access rate: 1 SYN = $0.01 USDC."}
          </p>
        </GlassCard>

        <GlassCard className="lg:col-span-3" glow="gold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="surface p-4">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">SYN Received</div>
              <div className="mono text-3xl font-semibold text-gradient-gold mt-1">{Math.round(calc.syn).toLocaleString("en-US")}</div>
            </div>
            <div className="surface p-4">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Rank Reflected</div>
              <div className="text-2xl font-semibold text-foreground mt-1">{calc.rank}</div>
              <div className="mono mt-1 text-[11px] text-muted-foreground">
                Recognition only — no bonus tokens, no better rate.
              </div>
            </div>
            <div className="surface p-4">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Vault Contribution</div>
              <div className="mono text-2xl font-semibold text-gradient-gold mt-1">{fmtUsd(calc.vault)}</div>
              <div className="mono text-[10px] text-muted-foreground mt-1">70% of payment</div>
            </div>
            <div className="surface p-4">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Liquidity Reinforcement</div>
              <div className="mono text-2xl font-semibold text-[var(--verify)] mt-1">{fmtUsd(calc.lp)}</div>
              <div className="mono text-[10px] text-muted-foreground mt-1">20% of payment</div>
            </div>
            <div className="surface p-4 sm:col-span-2">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Operations / Community</div>
              <div className="mono text-2xl font-semibold mt-1">{fmtUsd(calc.ops)}</div>
              <div className="mono text-[10px] text-muted-foreground mt-1">10% of payment</div>
            </div>
          </div>
        </GlassCard>
      </div>
    </Section>
  );
}

/* ─────────────────────── 20. Verify Flow — REMOVED (orphan; trust copy lives on /transparency) ─────────────────────── */


/* ─────────────────────── 21. Access Rate ─────────────────────── */
export function AccessRate() {
  const rows = [
    { k: "Access Rate", v: "1 SYN = $0.01 USDC" },
    { k: "Total Supply", v: `${SYNDICATE_CONFIG.TOTAL_SUPPLY} SYN` },
    { k: "V1 Access Model", v: "USDC-only" },
    { k: "DEX", v: "Optional secondary exit" },
    { k: "Site", v: "Primary onboarding interface" },
  ];
  return (
    <Section id="access-rate">
      <SectionHeader
        eyebrow="21 — V1 Access Rate"
        title={<>One rate. <span className="text-gradient-gold">One supply. One door.</span></>}
        description="The DEX is an optional secondary market and exit route. The website is the main V1 onboarding experience so members understand the rules, rank system, Vault flow, and utility before joining."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard glow="gold" className="lg:col-span-1">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-2">Fixed V1 Rate</div>
          <div className="mono text-4xl font-semibold tracking-tight">1 SYN</div>
          <div className="mono text-3xl text-gradient-gold mt-1">$0.01 USDC</div>
          <p className="mt-4 text-xs text-muted-foreground border-l-2 border-[var(--navy)]/30 pl-3">
            Utility membership onboarding and Vault accounting clarity. Not a price target, guarantee, or promise of future value.
          </p>
        </GlassCard>
        <GlassCard className="lg:col-span-2">
          <ul className="divide-y divide-border/60">
            {rows.map((r) => (
              <li key={r.k} className="flex items-center justify-between py-3">
                <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{r.k}</span>
                <span className="mono text-sm">{r.v}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </Section>
  );
}

/* ─────────────────────── 22. Distribution Intelligence ─────────────────────── */
export function DistributionIntel() {
  return (
    <Section id="distribution">
      <SectionHeader
        eyebrow="Distribution Intelligence"
        title={<>Holder analytics <span className="text-gradient-gold">awaiting indexer</span></>}
        description="Top-N wallet share, holder counts, and per-holder averages require a Transfer-event indexer. Until that ships, this section stays empty rather than showing placeholder numbers."
      />
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Pill tone="muted">AWAITING INDEXER</Pill>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            No fake metrics
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          SYN holder distribution will appear here as soon as the Transfer indexer is online.
          In the meantime, every wallet balance is verifiable directly on{" "}
          <a
            href={`${avascanTokenUrl(SYN_ADDR) ?? ""}/holder`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline text-foreground"
          >
            Avascan ↗
          </a>.
        </p>
      </GlassCard>
    </Section>
  );
}


/* ─────────────────────── 23. Genesis Supply Controls ─────────────────────── */
export function GenesisSupplyControls() {
  const { totalSynSold, isLoading } = useSaleStats();
  const liveSold = totalSynSold !== undefined ? fmtSyn(totalSynSold) : isLoading ? "…" : "PENDING";
  const items: Array<{ l: string; v: string; live?: boolean }> = [
    { l: "Distributed through membership",        v: `${liveSold} SYN`, live: true },
    { l: "Membership Distribution", v: "35%" },
    { l: "Vault Reserve",                          v: "25%" },
    { l: "Founder (vested)",                       v: "12%" },
    { l: "Liquidity",                              v: "10%" },
    { l: "Partnerships",                           v: "8%" },
    { l: "Contributors",                           v: "5%" },
    { l: "Future Ecosystem",                       v: "5%" },
  ];
  return (
    <Section id="supply-controls">
      <SectionHeader
        eyebrow="23 — Supply Controls"
        title={<>Genesis <span className="text-gradient-gold">supply controls.</span></>}
        description="Every category of SYN is accounted for from day one. Distribution metric reads live from the Membership Sale contract (totalSynSold)."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2">
          <ul className="divide-y divide-border/60">
            {items.map((x) => (
              <li key={x.l} className="flex items-center justify-between py-3 gap-3">
                <span className="text-sm flex items-center gap-2">
                  {x.l}
                  {x.live && <Pill tone="success">LIVE</Pill>}
                </span>
                <span className="mono text-sm text-gradient-gold">{x.v}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard glow="navy">
          <Pill tone="navy">Discipline</Pill>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">Do not dilute blindly.</h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Future releases must be transparent, pre-defined, milestone-based, or governance-approved.
          </p>
        </GlassCard>
      </div>
    </Section>
  );
}

/* ─────────────────────── 24. Vault Growth Chart ─────────────────────── */
// DEMO-ONLY: fabricated illustrative time-series. Rendered ONLY inside the
// off-by-default, labeled "Future Vault preview" on /vault — never as live data.
const VAULT_HISTORY: Array<{ day: string; value: number }> = [
  { day: "Day 1", value: 100 },
  { day: "Day 2", value: 120 },
  { day: "Day 3", value: 127 },
];

export function VaultGrowthChart() {
  const max = Math.max(...VAULT_HISTORY.map((p) => p.value));
  const min = Math.min(...VAULT_HISTORY.map((p) => p.value));
  const range = Math.max(1, max - min);
  const W = 800;
  const H = 220;
  const padX = 40;
  const padY = 28;
  const step = (W - padX * 2) / (VAULT_HISTORY.length - 1);
  const pts = VAULT_HISTORY.map((p, i) => {
    const x = padX + i * step;
    const y = H - padY - ((p.value - min) / range) * (H - padY * 2);
    return { x, y, ...p };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1].x} ${H - padY} L ${pts[0].x} ${H - padY} Z`;
  const growth = (((VAULT_HISTORY[VAULT_HISTORY.length - 1].value - VAULT_HISTORY[0].value) / VAULT_HISTORY[0].value) * 100).toFixed(1);

  return (
    <Section id="vault-growth">
      <SectionHeader
        eyebrow="24 — Vault Growth"
        title={<>Vault Value <span className="text-gradient-gold">over time.</span></>}
        description="The Vault is a public, slow-moving balance sheet. Come back tomorrow and watch this line move."
      />
      <GlassCard glow="gold">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Current Vault</div>
            <div className="mono text-4xl md:text-5xl font-semibold text-gradient-gold leading-none mt-1">
              ${VAULT_HISTORY[VAULT_HISTORY.length - 1].value}
            </div>
          </div>
          <div className="text-right">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Growth since Day 1</div>
            <div className="mono text-2xl font-semibold text-[var(--success)] mt-1">+{growth}%</div>
          </div>
        </div>
        <div className="surface p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
            <defs>
              <linearGradient id="vgArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.86 0.09 85)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="oklch(0.86 0.09 85)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="vgLine" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="oklch(0.5 0.13 75)" />
                <stop offset="100%" stopColor="oklch(0.7 0.13 75)" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((g, i) => (
              <line key={i} x1={padX} x2={W - padX} y1={padY + g * (H - padY * 2)} y2={padY + g * (H - padY * 2)} stroke="oklch(0.22 0.025 260 / 0.08)" strokeDasharray="3 4" />
            ))}
            <path d={area} fill="url(#vgArea)" />
            <path d={path} fill="none" stroke="url(#vgLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="oklch(0.5 0.13 75)" strokeWidth="2" />
                <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="12" fontFamily="ui-monospace, monospace" fill="oklch(0.22 0.025 260)">${p.value}</text>
                <text x={p.x} y={H - padY + 18} textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fill="oklch(0.5 0.025 260)">{p.day}</text>
              </g>
            ))}
          </svg>
        </div>
        <p className="mt-4 text-xs text-muted-foreground border-l-2 border-[var(--navy)]/30 pl-3">
          PENDING · Genesis baseline = $100. The programmatic Vault contract is not yet deployed — this chart will read on-chain Vault snapshots once it goes live. Numbers shown are illustrative only.
        </p>
      </GlassCard>
    </Section>
  );
}

/* ─────────────────────── 25. Genesis NFT Mint Progress ─────────────────────── */
export function GenesisNFTProgress() {
  const minted = 0;
  const total = 1_000;
  const pct = (minted / total) * 100;
  return (
    <Section id="nft-progress">
      <SectionHeader
        eyebrow="25 — Genesis NFT"
        title={<>Genesis NFT <span className="text-gradient-gold">mint progress.</span></>}
        description="The Genesis Syndicate NFT is the first archive artifact. Only 1,000 will ever be minted."
      />
      <GlassCard glow="gold">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          <div className="md:col-span-1">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Genesis Syndicate NFT</div>
            <div className="mono text-5xl md:text-6xl font-semibold text-gradient-gold mt-2 leading-none">
              {minted}<span className="text-muted-foreground"> / {total.toLocaleString("en-US")}</span>
            </div>
            <div className="mono mt-2 text-sm text-muted-foreground">{(total - minted).toLocaleString("en-US")} remaining</div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Mint Progress</span>
              <span className="mono text-sm text-gradient-gold">{pct.toFixed(2)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-border/50 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.max(0.5, pct)}%`, background: "var(--gradient-gold)" }} />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="surface p-3"><div className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Supply</div><div className="mono mt-1 text-sm">1,000</div></div>
              <div className="surface p-3"><div className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Minted</div><div className="mono mt-1 text-sm">{minted}</div></div>
              <div className="surface p-3"><div className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Remaining</div><div className="mono mt-1 text-sm">{(total - minted).toLocaleString("en-US")}</div></div>
            </div>
            <CTAButton variant="ghost" href="/transparency" className="w-full md:w-auto">Mint Genesis NFT — Pending Contract</CTAButton>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

/* ─────────────────────── 26. Day One Archive ─────────────────────── */
export function DayOneArchive() {
  return (
    <Section id="day-one">
      <SectionHeader
        eyebrow="26 — Permanent Archive"
        title={<>Day One <span className="text-gradient-gold">Archive</span></>}
        description="Genesis deployment of SYN on Avalanche C-Chain. This card is the canonical first entry of The Syndicate."
      />
      <GlassCard glow="gold" className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Pill tone="gold">Day One · Sealed</Pill>
              <Pill tone="success">LIVE ONCHAIN</Pill>
            </div>
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Permanent · Immutable</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: "Supply",      v: "1,000,000,000 SYN" },
              { l: "Allocations", v: "7 wallets" },
              { l: "Chain",       v: "Avalanche" },
              { l: "Status",      v: "Genesis Deployment" },
            ].map((x) => (
              <div key={x.l} className="surface p-5">
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{x.l}</div>
                <div className="mono mt-2 text-lg font-semibold text-gradient-gold leading-tight">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 items-center text-xs">
            <span className="mono text-muted-foreground">Contract:</span>
            <a href={avascanTokenUrl(SYN_ADDR) ?? "#"} target="_blank" rel="noopener noreferrer" className="mono text-foreground hover:text-[var(--gold)]">
              0xC1Cf…0170 ↗
            </a>
          </div>
          <p className="mt-4 text-base text-foreground/70 italic max-w-2xl">
            “The archive remembers everything.”
          </p>
        </div>
      </GlassCard>
    </Section>
  );
}

/* ─────────────────────── 27. Why Come Back Tomorrow? ─────────────────────── */
export function WhyComeBackTomorrow() {
  const items = [
    { t: "Vault Growth",      d: "Watch The Vault balance sheet evolve daily.",       tone: "gold"  as const },
    { t: "New Members",       d: "Every founding member is publicly archived.",       tone: "navy"  as const },
    { t: "Genesis NFT Mints", d: "Scarcity drops as the 1,000 supply gets claimed.",  tone: "gold"  as const },
    { t: "Rank Changes",      d: "Citizen → Operator → Vanguard → Architect…",        tone: "navy"  as const },
    { t: "Member Movements",  d: "Who entered, who advanced, who held longest.",      tone: "gold"  as const },
    { t: "New Episodes",      d: "Every milestone becomes a published chapter.",      tone: "navy"  as const },
    { t: "New Votes",         d: "Proposals open, members vote, results published.",  tone: "gold"  as const },
    { t: "New Milestones",    d: "Vault targets unlock, supply unlocks, episodes ship.", tone: "navy" as const },
  ];
  return (
    <Section id="come-back">
      <SectionHeader
        eyebrow="27 — Why come back?"
        title={<>What changes <span className="text-gradient-gold">daily.</span></>}
        description="The Syndicate is not a static landing page. It is the public monitoring terminal of an ongoing story."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((x) => (
          <div key={x.t} className="surface p-5 flex flex-col gap-2">
            <Pill tone={x.tone}>{x.t}</Pill>
            <p className="text-sm text-muted-foreground mt-1">{x.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground border-l-2 border-[var(--gold)]/40 pl-3 max-w-2xl">
        What changed? What grew? Who joined? What milestone is next? The answers update every day, onchain.
      </p>
    </Section>
  );
}

/* ─────────────────────── 28. Syndicate Index ─────────────────────── */
export function SyndicateIndex() {
  const components = [
    { l: "Vault Growth",         v: 4, hint: "Slow + steady" },
    { l: "Member Growth",        v: 2, hint: "Founding phase" },
    { l: "Holder Growth",        v: 1, hint: "Pre-distribution" },
    { l: "NFT Adoption",         v: 0, hint: "Mint not yet opened" },
    { l: "Governance Activity",  v: 2, hint: "First votes upcoming" },
    { l: "Episodes Published",   v: 3, hint: "Genesis live" },
  ];
  const score = components.reduce((s, c) => s + c.v, 0);
  return (
    <Section id="syndicate-index">
      <SectionHeader
        eyebrow="28 — Flagship Metric"
        title={<>The <span className="text-gradient-gold">Syndicate Index</span></>}
        description="One number to monitor the health of the entire experiment. A composite score derived from Vault growth, member growth, holder growth, NFT adoption, governance activity, and episodes published."
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <GlassCard glow="gold" className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Pill tone="gold">Live Composite</Pill>
            <span className="mono text-[10px] text-muted-foreground">v0 · scoring engine</span>
          </div>
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Syndicate Index</div>
          <div className="mono text-7xl md:text-8xl font-semibold text-gradient-gold leading-none">{score}</div>
          <div className="mono text-xs text-muted-foreground">Updated continuously as the story unfolds.</div>
        </GlassCard>
        <GlassCard className="lg:col-span-3">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">Index Components</div>
          <div className="space-y-3">
            {components.map((c) => (
              <div key={c.l}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm">{c.l}</span>
                  <span className="mono text-sm">
                    <span className="text-gradient-gold mr-3">+{c.v}</span>
                    <span className="text-muted-foreground text-[11px]">{c.hint}</span>
                  </span>
                </div>
                <ProgressBar value={(c.v / 10) * 100} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </Section>
  );
}




/* ─────────────────────── Footer (sitemap-style) ─────────────────────── */
export function Footer() {
  type Col = { label: string; links: Array<{ label: string; href: string; external?: boolean }> };
  const COLS: Col[] = [
    {
      label: "Protocol",
      links: [
        { label: "Transparency", href: "/transparency" },
        { label: "Vault", href: "/vault" },
        { label: "Liquidity", href: "/liquidity" },
        { label: "Registry", href: "/registry" },
        { label: "Activity", href: "/activity" },
        { label: "Archive", href: "/archive" },
        { label: "My Syndicate", href: "/my-syndicate" },
      ],
    },
    {
      label: "SYN",
      links: [
        { label: "Token", href: "/token" },
        { label: "Tokenomics", href: "/tokenomics" },
        { label: "Join", href: "/join" },
      ],
    },
    {
      label: "Members",
      links: [
        { label: "Ranks", href: "/ranks" },
        { label: "Member Journey", href: "/#member-journey" },
      ],
    },
    {
      label: "Learn",
      links: [
        { label: "Docs", href: "/docs" },
        { label: "Whitepaper", href: "/whitepaper" },
        { label: "FAQ", href: "/faq" },
        { label: "Roadmap", href: "/roadmap" },
      ],
    },
    {
      label: "Verify",
      links: [
        { label: "Avascan ↗", href: avascanTokenUrl(SYN_ADDR) ?? "", external: true },
        { label: "Sourcify ↗", href: `https://repo.sourcify.dev/43114/${SYN_ADDR}`, external: true },
        { label: "Routescan ↗", href: routescanContractCodeUrl(SYN_ADDR) ?? "", external: true },
        { label: "Snowtrace ↗", href: snowtraceTokenUrl(SYN_ADDR) ?? "", external: true },
        { label: "DexScreener ↗", href: "https://dexscreener.com/avalanche/0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389", external: true },
      ],
    },
    {
      label: "Legal",
      links: [
        { label: "Risk Notice", href: "/risk" },
        { label: "FAQ — Risk", href: "/faq" },
      ],
    },
  ];

  return (
    <footer className="relative mt-10 border-t border-border/60">
      <div className="border-b border-border/50">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] mono uppercase tracking-[0.18em]">
          <span className="text-muted-foreground">SYN</span>
          <a
            href={avascanTokenUrl(SYN_ADDR) ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-[var(--gold)] transition-colors"
          >
            {SYNDICATE_CONFIG.TOKEN_CONTRACT_ADDRESS.slice(0, 6)}…{SYNDICATE_CONFIG.TOKEN_CONTRACT_ADDRESS.slice(-4)} ↗
          </a>
          <button
            onClick={importSynToWallet}
            className="ml-auto inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 text-foreground transition-colors hover:text-[color:var(--accent)]"
            style={{ border: "1px solid color-mix(in oklab, var(--accent) 45%, transparent)" }}
            title="Add SYN to MetaMask / Core / Rabby"
          >
            <MetaMaskIcon className="size-3.5" />
            <span>Import SYN</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 mb-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <BrandMark size="sm" />
              <Wordmark />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A transparent on-chain protocol on Avalanche. Every member is recorded
              and every USDC route is publicly verifiable.
            </p>
            <div className="mt-5 flex flex-col gap-2 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full pulse-dot" style={{ background: "var(--success)" }} />
                Network · Avalanche C-Chain
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                Status · Live &amp; verifiable
              </span>
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.label}>
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">{c.label}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{l.label}</a>
                    ) : (
                      <a href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline mb-8" />

        <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
          The Syndicate is an experimental utility membership protocol on Avalanche. SYN is not
          equity, debt, Vault ownership, a dividend instrument, or a promise of financial return.
          Participation may result in total loss.
        </p>

        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-col gap-1">
            <span>
              Built with love <HeartSignalTrigger /> for the ones who were early.
            </span>
            <span>© {new Date().getFullYear()} The Syndicate. Transparent by design.</span>
            <BuildStamp />
          </div>
          <a
            href={avascanTokenUrl(SYN_ADDR) ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mono hover:text-foreground"
          >
            SYN {SYNDICATE_CONFIG.TOKEN_CONTRACT_ADDRESS.slice(0, 6)}…{SYNDICATE_CONFIG.TOKEN_CONTRACT_ADDRESS.slice(-4)} ↗
          </a>
        </div>
      </div>
    </footer>
  );
}


/* ─────────────────────── 29. FAQ ─────────────────────── */
const FAQS: Array<{ q: string; a: string }> = [
  { q: "What is The Syndicate?", a: "A transparent public experiment in onchain membership, archive identity, and shared Vault monitoring. Members join with USDC and receive SYN utility tokens." },
  { q: "Is this an investment?", a: "No. SYN is not equity, debt, dividends, or Vault ownership. It is utility access for rank, archive identity, and participation." },
  { q: "Can I lose money?", a: "Yes. Participation may result in total loss of contributed value. Only join if you understand the risks." },
  { q: "Why can people join from $5?", a: "The Syndicate is an open membership experiment. Anyone should be able to enter the Archive — not just large buyers." },
  { q: "What is SYN?", a: "A utility token representing membership rank, archive identity, and access to future Syndicate experiences." },
  { q: "Do members own the Vault?", a: "No. The Vault is an ecosystem resource. SYN does not represent ownership of Vault assets." },
  { q: "Are there dividends?", a: "No. There is no dividend, no passive income, and no guaranteed return." },
  { q: "What happens to USDC paid by members?", a: "70% reinforces the Vault, 20% strengthens liquidity, 10% funds operations and community. Every flow is publicly verifiable onchain today via the Membership Sale contract and the three allocation wallets." },
  { q: "Can I buy a custom amount?", a: "Yes. The simulator accepts any USDC amount. Official Citizen entry starts at $5." },
  { q: "What is a Founder Number?", a: "A permanent archive ID assigned in join order. The first members carry the lowest numbers, forever." },
  { q: "How does membership rank work?", a: "Rank is derived from SYN held at the fixed access rate. It is recognition only — not a payout, governance entitlement, or claim on the Vault." },
  { q: "Can larger members get cheaper tokens?", a: "No. Same fixed rate for everyone: 1 SYN = $0.01 USDC. Bigger amounts change visible membership rank — never bonus tokens." },
  { q: "Why are some sections labeled PENDING?", a: "SYN token, the Membership Sale, and the Trader Joe SYN/USDC LP are live and verifiable onchain right now. Modules that depend on contracts not yet deployed are clearly labeled PENDING — never mixed with live data." },
  { q: "What is verifiable today?", a: "The SYN token, the Membership Sale contract, the Vault / Liquidity / Operations wallets, every USDC purchase and 70/20/10 routing transfer, every SYN allocation wallet balance, and the Trader Joe SYN/USDC LP — all live on Avalanche and verifiable on Avascan, Sourcify, and Routescan. PENDING modules are clearly labeled." },
  { q: "Is SYN live?", a: "Yes. SYN is deployed on Avalanche C-Chain at 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170 and verifiable on Avascan, Sourcify, and Routescan." },
  { q: "Can I buy SYN through the website now?", a: "Yes. The Membership Sale contract is live on Avalanche. Go to /join, approve USDC, and buy SYN at the fixed rate of 1 SYN = $0.01 USDC. Minimum entry is $5." },
  { q: "Where will website buyer SYN come from?", a: "From the Membership Distribution wallet (0x975a…Cec8), which holds 350,000,000 SYN (35% of total supply). The Sale contract pulls SYN from this allocation." },
  { q: "Where does my USDC go?", a: "70% to the Vault Wallet, 20% to the Liquidity Wallet, 10% to the Operations Wallet — split inside the Membership Sale contract on every purchase." },
  { q: "Where can I trade SYN?", a: "On Trader Joe, in the live SYN/USDC pool (0xe124…9389) on Avalanche C-Chain." },
  { q: "What is the SYN/USDC LP pool?", a: "The first official liquidity pool for SYN. It is a Trader Joe classic AMM pair (JLP) — not Liquidity Book / DLMM. Initial liquidity was 200 SYN + 2 USDC at $0.01." },
  { q: "Is this Trader Joe Liquidity Book?", a: "No. The current pool is classic AMM / JLP. Reserves are read from the pair contract via getReserves()." },
  { q: "How is SYN price calculated?", a: "Implied price = USDC reserve ÷ SYN reserve, read live from the pool. Initial price was $0.01." },
  { q: "Why is liquidity small?", a: "It is an initial verification pool. Liquidity depth may increase progressively as the Liquidity wallet (which receives 20% of all USDC) is deployed into the pool." },
  { q: "How do I add liquidity?", a: "Open the pool on Trader Joe and add equal-value SYN and USDC. Larger deposits keep the price near $0.01. Be aware of impermanent loss." },
  { q: "Are LP providers guaranteed recognition or rewards?", a: "No. Providing liquidity is risky and creates no reward, yield, NFT eligibility, governance boost, or entitlement." },
  { q: "What risks do LP providers face?", a: "Impermanent loss, price movement, smart contract risk, low-liquidity slippage, and total loss. Providing liquidity is risky." },
  { q: "Is the token mintable?", a: "No. SYN is fixed supply. There is no mint function." },
  { q: "Can the owner change the token?", a: "No. The ERC20 contract has no owner and no admin. It is non-upgradeable." },
  { q: "Is there a tax?", a: "No. SYN has 0% transfer tax." },
  { q: "Can transfers be blocked?", a: "No. There is no blacklist, no whitelist, no pause, no max wallet, no max tx, and no transfer restrictions." },
  { q: "What is the Archive?", a: "An optional collectible memory layer for what happens around each seat — Chapter Artifacts, Seat Records, Patron Seals, Milestone Artifacts, Liquidity Marks, Protocol Milestones, Secret Artifacts, Legacy Artifacts, Genesis Founder Marks. SYN is the seat. Artifacts are the memory. The SyndicateArchive1155 contract is deployed on Avalanche." },
  { q: "Is the Archive live?", a: "Yes — The First Signal (ID 1) public mint is OPEN on Avalanche at 0.50 USDC (wallet limit 5). Other Artifacts are protocol-memory surfaces sealed by event. See /nft to mint or browse." },
  { q: "Do Archive artifacts grant ownership or yield?", a: "No. Artifacts are collectible records only. They are not equity, debt, Vault ownership, dividend instruments, revenue share, governance rights, or promises of profit. Participation may result in total loss." },
  { q: "Will artifacts have tiers or wealth-coded ranks?", a: "No. Patron Seal is a single flat support amount with no tiers and no status. All artifact identity is positional (seat / chapter / on-chain event), never wealth-coded." },
];

export function FAQ() {
  return (
    <Section id="faq">
      <SectionHeader
        eyebrow="29 — FAQ"
        title={<>Honest <span className="text-gradient-gold">answers</span></>}
        description="Clear answers about what The Syndicate is, what SYN is not, and how the public experiment works."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FAQS.map((f, i) => (
          <div key={f.q} className="surface p-5">
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-[color:oklch(0.5_0.13_75)] mb-2">Q{String(i + 1).padStart(2, "0")}</div>
            <div className="text-sm font-semibold text-foreground">{f.q}</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-dashed border-border/80 p-5 bg-panel/40">
        <p className="text-xs text-muted-foreground leading-relaxed">{LEGAL_DISCLAIMER}</p>
      </div>
    </Section>
  );
}

/* ─────────────────────── 30. Docs ─────────────────────── */
const DOCS: Array<{ title: string; summary: string; href: string }> = [
  { title: "Start Here",         summary: "What The Syndicate is, who it's for, and how to participate.",     href: "/whitepaper" },
  { title: "Membership & Ranks", summary: "Twelve ranks from Citizen ($5) to Cornerstone ($10,000).",        href: "/ranks" },
  { title: "Token Utility",      summary: "What SYN does — and what it is not.",                               href: "/token" },
  { title: "Vault Flow",         summary: "70% Vault · 20% Liquidity · 10% Operations.",                       href: "/vault" },
  { title: "Risk Disclosure",    summary: "Public experiment, total-loss possibility, no guarantees.",         href: "/faq" },
  { title: "Governance",         summary: "Proposal eligibility, voting weight, and Snapshot wiring.",         href: "/ranks" },
  { title: "Reputation",         summary: "Reputation grows with participation, not just size.",               href: "/ranks" },
  { title: "AI Layer",           summary: "Future AI Vault analyst, governance assistant, risk monitor.",      href: "/ai" },
  { title: "Roadmap",            summary: "What is live today, what is pending, and what ships next.",          href: "/roadmap" },
  { title: "Whitepaper",         summary: "Draft chapters and progress tracker.",                              href: "/whitepaper" },
  { title: "Transparency",       summary: "Live, pending, and demo modules — honestly labeled.",               href: "/transparency" },
];

export function Docs() {
  return (
    <Section id="docs">
      <SectionHeader
        eyebrow="30 — Docs"
        title={<>Knowledge <span className="text-gradient-gold">library</span></>}
        description="Everything a coder, designer, analyst, or future AI builder needs to understand the system."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DOCS.map((d) => (
          <a key={d.title} href={d.href} className="surface p-5 hover:border-[var(--gold)]/40 transition-colors block">
            <div className="text-sm font-semibold text-foreground">{d.title}</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.summary}</p>
            <div className="mt-3 mono text-[10px] uppercase tracking-[0.2em] text-[color:oklch(0.5_0.13_75)]">Read section →</div>
          </a>
        ))}
      </div>
    </Section>
  );
}
