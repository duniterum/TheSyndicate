// Revenue Sources — LIVE vs PLANNED.
// Single source of truth for "how money enters the protocol".
// Planned sources are NEVER counted into totals — labels only.

import { formatUnits } from "viem";
import { Section, SectionHeader } from "@/components/syndicate/Primitives";
import { useSaleStats } from "@/lib/sale-hooks";
import {
  USDC_DECIMALS,
  CONTRACTS,
  explorerUrlFor,
} from "@/lib/syndicate-config";

type Planned = { label: string; trigger: string };

const PLANNED: Planned[] = [
  { label: "Protocol-Owned Liquidity Fees", trigger: "Trader Joe LP fee accrual hook · planned" },
  { label: "Treasury Deployment Revenue",   trigger: "Vault deployment policy v1 · planned" },
  { label: "Artifact Revenue",              trigger: "Archive1155 artifact mints · live" },
  { label: "Protocol Services",             trigger: "Services launch · planned" },
  { label: "Partner Revenue",               trigger: "First partnership · planned" },
  { label: "Premium Access Revenue",        trigger: "Gated module · planned" },
  { label: "Future Protocol Products",      trigger: "Roadmap milestones · planned" },
];

const fmtUsd = (n: number | undefined) =>
  n === undefined
    ? "—"
    : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function ProtocolRevenueEngine() {
  const s = useSaleStats();
  const raised =
    s.totalUsdcRaised !== undefined
      ? Number(formatUnits(s.totalUsdcRaised, USDC_DECIMALS))
      : undefined;
  const txs = s.purchaseCount !== undefined ? Number(s.purchaseCount) : undefined;
  const saleUrl = explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS");

  return (
    <Section id="revenue-sources" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Revenue Sources"
        title={<>How <span className="text-gradient-gold">money enters</span> the protocol</>}
        description="Every revenue source is labeled LIVE or PLANNED. Planned sources are never counted into Protocol Revenue Generated. Today there is one live source: Membership Sales."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* LIVE — Membership Sales */}
        <article className="md:col-span-1 surface elevated p-4 border-emerald-500/40 bg-emerald-500/[0.04]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Source</span>
            <span className="mono inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              <span className="size-1 rounded-full bg-emerald-500" /> LIVE
            </span>
          </div>
          <h3 className="font-semibold text-foreground">Membership Sales</h3>
          <div className="mono text-2xl font-semibold mt-2">{fmtUsd(raised)}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Cumulative USDC routed through the Membership Sale contract.
            {txs !== undefined && <> · {txs.toLocaleString("en-US")} purchases</>}
          </div>
          <div className="mt-3 text-[10px] mono uppercase tracking-[0.16em] text-muted-foreground">
            Source: <code className="mono">TokensPurchased</code> · Avalanche RPC
          </div>
          {saleUrl && (
            <a
              href={saleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[10px] uppercase tracking-[0.18em] mt-3 inline-block text-foreground hover:text-[var(--gold)]"
            >
              Verify Sale contract ↗
            </a>
          )}
          <div className="mt-2 mono text-[10px] text-muted-foreground break-all">
            {CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS}
          </div>
        </article>

        {/* PLANNED list */}
        <div className="md:col-span-2 surface elevated p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Planned Revenue Sources</span>
            <span className="mono inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
              <span className="size-1 rounded-full bg-amber-500" /> PLANNED · NOT COUNTED
            </span>
          </div>
          <ul className="divide-y divide-border/40">
            {PLANNED.map((p) => (
              <li key={p.label} className="py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-1.5 rounded-full bg-amber-500/70 shrink-0" />
                  <span className="text-sm truncate">{p.label}</span>
                </div>
                <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground text-right">
                  {p.trigger}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
            Planned sources are listed for transparency only. They contribute zero to Protocol Revenue Generated until their contracts are deployed and verifiable on-chain.
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground max-w-3xl">
        Protocol Revenue Generated represents verifiable value that entered protocol contracts or wallets. It is shown for transparency and does not imply profit, dividend, yield, or holder entitlement.
      </p>
    </Section>
  );
}
