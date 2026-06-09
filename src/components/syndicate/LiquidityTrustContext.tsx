// LiquidityTrustContext — trust polish around the small initial pool.
// Explains: seed → growth path → what happens if liquidity is shallow.

import { Section, SectionHeader } from "./Primitives";
import { LP_POOL } from "@/lib/syndicate-config";
import { useLpStats } from "@/lib/sale-hooks";

const fmtUsd = (n: number | undefined) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function LiquidityTrustContext() {
  const lp = useLpStats();

  const steps: Array<{ label: string; body: string; status: "LIVE" | "ACTIVE" | "PLANNED" }> = [
    {
      label: "Seed",
      body: `Initial pool of ${LP_POOL.initialSyn} SYN + ${LP_POOL.initialUsdc} USDC at $${LP_POOL.initialPriceUsd}, on Trader Joe classic AMM (JLP).`,
      status: "LIVE",
    },
    {
      label: "Routing",
      body: "20% of every USDC purchase is routed on-chain to the Liquidity Wallet by the Membership Sale contract.",
      status: "LIVE",
    },
    {
      label: "Deployment",
      body: "The Liquidity Wallet progressively deploys USDC + matched SYN into the pool to deepen depth and reduce slippage.",
      status: "ACTIVE",
    },
    {
      label: "Community LPs",
      body: "Anyone can add liquidity directly on Trader Joe — equal-value SYN + USDC. Future recognition is PLANNED.",
      status: "PLANNED",
    },
  ];

  const tone = (s: "LIVE" | "ACTIVE" | "PLANNED") =>
    s === "LIVE"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : s === "ACTIVE"
      ? "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400"
      : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";

  return (
    <Section id="liquidity-context">
      <SectionHeader
        eyebrow="Why liquidity looks small"
        title={<>Honest <span className="text-gradient-gold">liquidity context</span></>}
        description="The pool is intentionally seeded small. Here is exactly how depth grows, and what to expect while it is still shallow."
      />

      {/* Now → Next strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <KPI label="Pool TVL now" value={fmtUsd(lp.tvlUsd)} hint="USDC × 2" />
        <KPI label="Initial price anchor" value={`$${LP_POOL.initialPriceUsd}`} hint="Set at seed" />
        <KPI label="Routing share to LP" value="20%" hint="Per USDC purchase" />
        <KPI label="Pool type" value={LP_POOL.poolType} hint="Not Liquidity Book / DLMM" />
      </div>

      {/* Growth path */}
      <ol className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <li key={s.label} className="surface elevated p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Step {String(i + 1).padStart(2, "0")}</span>
              <span className={`mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${tone(s.status)}`}>
                {s.status}
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground">{s.label}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
          </li>
        ))}
      </ol>

      {/* What to expect */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        <article className="surface elevated p-4">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">If liquidity is shallow</div>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc pl-4 space-y-1">
            <li>Larger swaps face higher slippage — size accordingly.</li>
            <li>Price can move sharply on a single trade.</li>
            <li>The Membership Sale rate stays fixed at 1 SYN = $0.01 regardless of pool price.</li>
          </ul>
        </article>
        <article className="surface elevated p-4">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">What never changes</div>
          <ul className="text-xs text-muted-foreground leading-relaxed list-disc pl-4 space-y-1">
            <li>SYN supply is fixed. No mint, no admin, no upgrade.</li>
            <li>USDC routing stays 70 / 20 / 10 on every purchase.</li>
            <li>Every pool number is read live from the pair contract.</li>
          </ul>
        </article>
      </div>
    </Section>
  );
}

function KPI({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="surface elevated p-3 flex flex-col gap-1">
      <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="mono text-base font-semibold truncate">{value}</span>
      <span className="text-[10px] text-muted-foreground">{hint}</span>
    </article>
  );
}

export default LiquidityTrustContext;
