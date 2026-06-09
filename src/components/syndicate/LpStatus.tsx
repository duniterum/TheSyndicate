import { LP_POOL, SYN_EXPLORERS, CONTRACTS, explorerUrlFor, extrasForAddress, txExplorerUrl } from "@/lib/syndicate-config";
import { useLpStats } from "@/lib/sale-hooks";
import { ContractLink, GlassCard, Section, SectionHeader, CTAButton, ProofButton } from "./Primitives";

const fmtN = (n: number | undefined, max = 2) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: max });
const fmtUsd = (n: number | undefined) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const fmtPrice = (n: number | undefined) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 6 })}`;

const PAIR_EXPLORER = explorerUrlFor("LP_PAIR_ADDRESS") ?? "#";

/** Compact homepage Market Status strip — price/liquidity/pair/chain/dex/status. */
export function HomeMarketStatus() {
  const lp = useLpStats();
  const cards = [
    { label: "SYN Price",   value: fmtPrice(lp.synPriceUsd), hint: lp.isLoading ? "Loading…" : "Implied from reserves" },
    { label: "Liquidity",   value: fmtUsd(lp.tvlUsd),        hint: "Total pool TVL (USDC × 2)" },
    { label: "Pair",        value: LP_POOL.pair,             hint: "Trader Joe v1" },
    { label: "Chain",       value: "Avalanche",              hint: "C-Chain" },
    { label: "DEX",         value: LP_POOL.dex,              hint: "Live pool" },
    { label: "Sale",        value: "LIVE",                   hint: "USDC → SYN" },
  ];
  return (
    <Section id="market-status">
      <SectionHeader
        eyebrow="Market Status"
        title={<>Live <span className="text-gradient-gold">market data</span> from the pool</>}
        description="Every value below is read directly from the Trader Joe v1 SYN/USDC pair on Avalanche. No backend, no cache, no estimates."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {cards.map((c) => (
          <article key={c.label} className="surface elevated px-3 py-3">
            <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{c.label}</div>
            <div className="mono text-sm font-semibold mt-1 truncate">{c.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{c.hint}</div>
          </article>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ProofButton href={LP_POOL.traderJoeUrl}>Trader Joe ↗</ProofButton>
        <ProofButton href={PAIR_EXPLORER}>Avascan ↗</ProofButton>
        <ProofButton href={SYN_EXPLORERS.snowtrace}>SnowTrace ↗</ProofButton>
      </div>
    </Section>
  );
}

/** Full LP card — used on /liquidity and embedded in registry. */
export function LpStatusCard() {
  const lp = useLpStats();
  return (
    <GlassCard className="p-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">Liquidity Pool</div>
          <h3 className="mt-1 text-xl font-semibold">{LP_POOL.pair} · {LP_POOL.dex} · {LP_POOL.poolType}</h3>
        </div>
        <span className="mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <span className="size-1 rounded-full bg-emerald-500 animate-pulse" /> LIVE
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="SYN Reserve"  value={fmtN(lp.synReserve)} unit="SYN" />
        <Stat label="USDC Reserve" value={fmtN(lp.usdcReserve, 4)} unit="USDC" />
        <Stat label="Total Liquidity" value={fmtUsd(lp.tvlUsd)} hint="USDC × 2" />
        <Stat label="Implied SYN Price" value={fmtPrice(lp.synPriceUsd)} />
        <Stat label="LP Token Supply" value={fmtN(lp.lpSupply, 6)} unit="LP" />
        <Stat label="Pool Ratio" value={lp.synReserve && lp.usdcReserve ? `${(lp.synReserve / lp.usdcReserve).toLocaleString("en-US", { maximumFractionDigits: 2 })} SYN : 1 USDC` : "—"} />
      </div>

      <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="surface elevated px-3 py-2.5">
          <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">LP Pool (JLP)</dt>
          <dd>
            <ContractLink
              address={LP_POOL.pairAddress}
              explorerHref={PAIR_EXPLORER}
              extras={extrasForAddress(LP_POOL.pairAddress)}
            />
          </dd>
        </div>
        <div className="surface elevated px-3 py-2.5">
          <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">SYN Token</dt>
          <dd>
            <ContractLink
              address={CONTRACTS.SYN_CONTRACT_ADDRESS}
              explorerHref={explorerUrlFor("SYN_CONTRACT_ADDRESS")}
              extras={extrasForAddress(CONTRACTS.SYN_CONTRACT_ADDRESS)}
            />
          </dd>
        </div>
        <div className="surface elevated px-3 py-2.5">
          <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">USDC Token</dt>
          <dd>
            <ContractLink
              address={CONTRACTS.USDC_CONTRACT_ADDRESS}
              explorerHref={explorerUrlFor("USDC_CONTRACT_ADDRESS")}
              extras={extrasForAddress(CONTRACTS.USDC_CONTRACT_ADDRESS)}
            />
          </dd>
        </div>
        <div className="surface elevated px-3 py-2.5">
          <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Current Pool · Why First LP Matters</dt>
          <dd className="mono text-xs">
            {fmtN(lp.synReserve)} SYN + {fmtN(lp.usdcReserve, 4)} USDC · live reserves
          </dd>
          <dd className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
            Seeded at {LP_POOL.initialSyn} SYN + {LP_POOL.initialUsdc} USDC @ ${LP_POOL.initialPriceUsd}. The first LP sets price discovery and lets anyone trade SYN against USDC onchain — every later deposit grows depth from this anchor.
          </dd>
        </div>
        <div className="surface elevated px-3 py-2.5 sm:col-span-2">
          <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Pool Creation TX</dt>
          <dd>
            <a
              href={txExplorerUrl(LP_POOL.creationTx)}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-xs hover:text-[var(--gold)] underline-offset-4 hover:underline break-all"
            >
              {LP_POOL.creationTx.slice(0, 12)}…{LP_POOL.creationTx.slice(-8)} ↗
            </a>
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2 text-[11px] mono uppercase tracking-[0.18em]">
        <a className="rounded border border-border/60 px-2 py-1 hover:border-[var(--gold)]/60 text-foreground hover:text-[var(--gold)]" href={LP_POOL.traderJoeUrl}     target="_blank" rel="noopener noreferrer">Trade on Trader Joe ↗</a>
        <a className="rounded border border-border/60 px-2 py-1 hover:border-[var(--gold)]/60 text-foreground hover:text-[var(--gold)]" href={LP_POOL.addLiquidityUrl}  target="_blank" rel="noopener noreferrer">Add Liquidity ↗</a>
        <a className="rounded border border-border/60 px-2 py-1 hover:border-[var(--gold)]/60 text-foreground hover:text-[var(--gold)]" href={`https://dexscreener.com/avalanche/${LP_POOL.pairAddress}`} target="_blank" rel="noopener noreferrer">DexScreener ↗</a>
        <a className="rounded border border-border/60 px-2 py-1 hover:border-[var(--gold)]/60 text-foreground hover:text-[var(--gold)]" href={SYN_EXPLORERS.snowtrace}  target="_blank" rel="noopener noreferrer">SnowTrace ↗</a>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        Pool creation date and unique LP provider count require event-log indexing —
        view the pool on Trader Joe or Avascan for full history.{" "}
        <span className="mono uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">Indexer · PENDING</span>
      </p>
    </GlassCard>
  );
}

/** Provide Liquidity CTA with risk warning. */
export function ProvideLiquidityCTA() {
  return (
    <Section id="provide-liquidity">
      <SectionHeader
        eyebrow="Provide Liquidity"
        title={<>Help SYN trade with <span className="text-gradient-gold">lower slippage</span></>}
        description="Liquidity providers deposit equal-value SYN and USDC into the Trader Joe AMM pool. Larger deposits keep price stable and reduce slippage for buyers."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ProvideLiquidityCurrentSeed />
        <article className="surface elevated p-4">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Example deposit</div>
          <div className="mono text-lg font-semibold mt-1">10,000 SYN + 100 USDC</div>
          <p className="mt-2 text-xs text-muted-foreground">Equal-value deposit at current implied price.</p>
        </article>
        <article className="surface elevated p-4">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Rule</div>
          <div className="mono text-lg font-semibold mt-1">Same ratio, both sides</div>
          <p className="mt-2 text-xs text-muted-foreground">AMM pools require equal-value SYN and USDC on deposit.</p>
        </article>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <CTAButton variant="gold" href={LP_POOL.addLiquidityUrl}>Add Liquidity on Trader Joe ↗</CTAButton>
        <CTAButton variant="ghost" href="#lp-risks">Learn LP Risks</CTAButton>
      </div>
      <div id="lp-risks" className="mt-5 rounded-md border border-amber-500/40 bg-amber-500/5 p-4 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
        <div className="mono uppercase tracking-[0.18em] text-[10px] mb-1">LP Risk Notice</div>
        Providing liquidity can lose money through impermanent loss, price movement, smart-contract
        risk, and low-liquidity volatility. Future LP recognition may be considered later. No
        rewards, yield, NFT eligibility, governance rights, or entitlement are live or promised.
      </div>
    </Section>
  );
}

function Stat({ label, value, unit, hint }: { label: string; value: string; unit?: string; hint?: string }) {
  return (
    <div className="surface elevated px-3 py-3">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mono text-base font-semibold mt-1 truncate">
        {value} {unit && <span className="text-xs font-normal text-muted-foreground">{unit}</span>}
      </div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function ProvideLiquidityCurrentSeed() {
  const lp = useLpStats();
  return (
    <article className="surface elevated p-4">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Current pool · live</div>
      <div className="mono text-lg font-semibold mt-1">{fmtN(lp.synReserve)} SYN + {fmtN(lp.usdcReserve, 4)} USDC</div>
      <p className="mt-2 text-xs text-muted-foreground">
        Read live from the SYN/USDC pair. Seeded at {LP_POOL.initialSyn} SYN + {LP_POOL.initialUsdc} USDC @ ${LP_POOL.initialPriceUsd}.
      </p>
    </article>
  );
}

/** Why provide liquidity — honest, non-promissory framing. */
export function LpIncentives() {
  return (
    <Section id="lp-incentives">
      <SectionHeader
        eyebrow="Why Provide Liquidity?"
        title="LP providers help market liquidity"
        description="The Syndicate's LP is currently small and seeded. Anyone can add liquidity on Trader Joe today."
      />
      <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4 text-xs text-amber-900 dark:text-amber-200 leading-relaxed max-w-3xl">
        <div className="mono uppercase tracking-[0.18em] text-[10px] mb-1">No promises</div>
        Future LP recognition may be considered later. No rewards, yield, NFT eligibility,
        governance rights, or entitlement are live or promised. Providing liquidity carries
        impermanent-loss and smart-contract risk.
      </div>
    </Section>
  );
}
