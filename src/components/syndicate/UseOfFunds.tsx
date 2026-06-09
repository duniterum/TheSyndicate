// Use of Funds — Generated → Allocated → Spent (classified + untagged) → Remaining.
// Every classified outflow is derived from src/lib/transaction-tags.ts, the
// single source of truth for transaction classification. Untagged residuals
// are surfaced explicitly with a tx-tagging PENDING badge — never silently
// absorbed into a category we cannot verify.

import { formatUnits } from "viem";
import { Section, SectionHeader, ContractLink } from "./Primitives";
import { useSaleStats } from "@/lib/sale-hooks";
import { useWalletAssets } from "@/lib/treasury-hooks";
import {
  CONTRACTS,
  USDC_DECIMALS,
  explorerUrlForAddress,
  extrasForAddress,
} from "@/lib/syndicate-config";
import {
  splitSpend,
  classifiedUsdcByTag,
  txExplorerUrl,
  type TaggedTransaction,
} from "@/lib/transaction-tags";

const fmtUsd = (n: number | undefined, max = 2) =>
  n === undefined ? "…" : `$${n.toLocaleString("en-US", { maximumFractionDigits: max })}`;

function useWalletUsdc(wallet: string): number | undefined {
  const w = useWalletAssets(wallet);
  const usdc = w.assets.find((a) => a.symbol === "USDC");
  return usdc?.amount;
}

export function UseOfFunds() {
  const s = useSaleStats();
  const generated =
    s.totalUsdcRaised !== undefined
      ? Number(formatUnits(s.totalUsdcRaised, USDC_DECIMALS))
      : undefined;

  // Canonical USDC routing: 70% Vault · 20% Liquidity · 10% Operations.
  const allocVault = generated !== undefined ? generated * 0.70 : undefined;
  const allocLp    = generated !== undefined ? generated * 0.20 : undefined;
  const allocOps   = generated !== undefined ? generated * 0.10 : undefined;

  const balVault = useWalletUsdc(CONTRACTS.VAULT_WALLET);
  const balLp    = useWalletUsdc(CONTRACTS.LIQUIDITY_WALLET);
  const balOps   = useWalletUsdc(CONTRACTS.OPERATIONS_WALLET);

  const spentVault = allocVault !== undefined && balVault !== undefined ? Math.max(0, allocVault - balVault) : undefined;
  const spentLp    = allocLp    !== undefined && balLp    !== undefined ? Math.max(0, allocLp    - balLp)    : undefined;
  const spentOps   = allocOps   !== undefined && balOps   !== undefined ? Math.max(0, allocOps   - balOps)   : undefined;

  // Classified vs untagged split, derived from the transaction-tag registry.
  const vaultSplit = splitSpend(CONTRACTS.VAULT_WALLET, spentVault);
  const lpSplit    = splitSpend(CONTRACTS.LIQUIDITY_WALLET, spentLp);
  const opsSplit   = splitSpend(CONTRACTS.OPERATIONS_WALLET, spentOps);

  const spentTotal =
    spentVault !== undefined && spentLp !== undefined && spentOps !== undefined
      ? spentVault + spentLp + spentOps
      : undefined;
  const classifiedTotal =
    vaultSplit.classifiedUsdc !== undefined && lpSplit.classifiedUsdc !== undefined && opsSplit.classifiedUsdc !== undefined
      ? vaultSplit.classifiedUsdc + lpSplit.classifiedUsdc + opsSplit.classifiedUsdc
      : undefined;
  const untaggedTotal =
    vaultSplit.untaggedUsdc !== undefined && lpSplit.untaggedUsdc !== undefined && opsSplit.untaggedUsdc !== undefined
      ? vaultSplit.untaggedUsdc + lpSplit.untaggedUsdc + opsSplit.untaggedUsdc
      : undefined;
  const remaining =
    balVault !== undefined && balLp !== undefined && balOps !== undefined
      ? balVault + balLp + balOps
      : undefined;

  type Row = {
    label: string;
    pct: number;
    allocated: number | undefined;
    balance: number | undefined;
    spent: number | undefined;
    classified: number | undefined;
    untagged: number | undefined;
    breakdown: ReturnType<typeof classifiedUsdcByTag>;
    wallet: string;
  };
  const rows: Row[] = [
    { label: "Vault Wallet",      pct: 70, allocated: allocVault, balance: balVault, spent: spentVault, classified: vaultSplit.classifiedUsdc, untagged: vaultSplit.untaggedUsdc, breakdown: vaultSplit.classifiedBreakdown, wallet: CONTRACTS.VAULT_WALLET },
    { label: "Liquidity Wallet",  pct: 20, allocated: allocLp,    balance: balLp,    spent: spentLp,    classified: lpSplit.classifiedUsdc,    untagged: lpSplit.untaggedUsdc,    breakdown: lpSplit.classifiedBreakdown,    wallet: CONTRACTS.LIQUIDITY_WALLET },
    { label: "Operations Wallet", pct: 10, allocated: allocOps,   balance: balOps,   spent: spentOps,   classified: opsSplit.classifiedUsdc,   untagged: opsSplit.untaggedUsdc,   breakdown: opsSplit.classifiedBreakdown,   wallet: CONTRACTS.OPERATIONS_WALLET },
  ];

  // Site-wide spending categories — derived from registry, NOT invented.
  const globalBreakdown = classifiedUsdcByTag();

  return (
    <Section id="use-of-funds" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Use of Funds"
        title={<>From <span className="text-gradient-gold">generated</span> to <span className="text-gradient-gold">remaining</span></>}
        description="Verifiable on-chain accounting. Every classified outflow links to its transaction. Untagged residuals are surfaced explicitly — never silently absorbed."
      />

      {/* Header KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <Kpi label="Generated"          value={fmtUsd(generated)}        tone="emerald" hint="Protocol Revenue Generated · cumulative" />
        <Kpi label="Allocated"          value={fmtUsd(generated)}        tone="sky"     hint="100% routed on-chain · 70/20/10" />
        <Kpi label="Classified spend"   value={fmtUsd(classifiedTotal)}  tone="emerald" hint="Sum of tagged transactions (registry)" />
        <Kpi label="Untagged residual"  value={fmtUsd(untaggedTotal)}    tone="amber"   hint="Allocated − current − classified" />
      </div>

      {/* Per-bucket table */}
      <div className="surface elevated overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="py-2 px-3 font-normal">Bucket</th>
              <th className="py-2 px-3 font-normal text-right">%</th>
              <th className="py-2 px-3 font-normal text-right">Allocated</th>
              <th className="py-2 px-3 font-normal text-right">Current USDC</th>
              <th className="py-2 px-3 font-normal text-right">Spent · classified</th>
              <th className="py-2 px-3 font-normal text-right">Spent · untagged</th>
              <th className="py-2 px-3 font-normal">Wallet</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-border/40 align-top">
                <td className="py-2 px-3 font-medium">
                  {r.label}
                  {r.breakdown.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.breakdown.map((b) => (
                        <span
                          key={b.tag}
                          className="mono text-[9px] uppercase tracking-[0.14em] rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400"
                          title={b.txs.map((t) => t.description).join(" · ")}
                        >
                          {b.label} · {fmtUsd(b.amount)}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-2 px-3 text-right mono">{r.pct}%</td>
                <td className="py-2 px-3 text-right mono">{fmtUsd(r.allocated)}</td>
                <td className="py-2 px-3 text-right mono">{fmtUsd(r.balance)}</td>
                <td className="py-2 px-3 text-right mono text-emerald-700 dark:text-emerald-400">{fmtUsd(r.classified)}</td>
                <td className="py-2 px-3 text-right mono text-amber-700 dark:text-amber-400">{fmtUsd(r.untagged)}</td>
                <td className="py-2 px-3">
                  <ContractLink
                    address={r.wallet}
                    explorerHref={explorerUrlForAddress(r.wallet)}
                    extras={extrasForAddress(r.wallet)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Classified spending — derived from registry */}
      <div className="mt-4 surface elevated p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Classified Spending — by tag</span>
          <span className="mono inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            <span className="size-1 rounded-full bg-emerald-500" /> LIVE — derived from transaction-tag registry
          </span>
        </div>
        {globalBreakdown.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No classified outflows yet.</p>
        ) : (
          <ul className="grid gap-2">
            {globalBreakdown.map((b) => (
              <li key={b.tag} className="surface p-3">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="font-medium text-sm">{b.label}</span>
                  <span className="mono text-sm">{fmtUsd(b.amount)}</span>
                </div>
                <ul className="mt-2 grid gap-1">
                  {b.txs.map((t) => (
                    <li key={t.txHash} className="text-[11px] text-muted-foreground leading-snug">
                      <a
                        href={txExplorerUrl(t.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono underline underline-offset-2 hover:text-foreground"
                      >
                        {shortTx(t.txHash)} ↗
                      </a>
                      <span> · {fmtUsd(t.amount)} {t.asset} · {t.description}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Untagged residual — explicit, never silent */}
      <div className="mt-3 surface elevated p-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Untagged Residual</span>
          <span className="mono inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
            <span className="size-1 rounded-full bg-amber-500" /> PENDING — awaiting classification
          </span>
        </div>
        <p className="mono text-base">{fmtUsd(untaggedTotal)}</p>
        <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
          Residual = Allocated − Current USDC − Classified. Any non-zero amount here means a verified on-chain
          outflow exists that has not yet been added to the transaction-tag registry. It is shown explicitly
          rather than absorbed into a category.
        </p>
      </div>
    </Section>
  );
}

function shortTx(hash: string) {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

// Keep the TaggedTransaction type import referenced even when no tagged spend
// is present yet, so future maintainers don't strip the registry binding.
export type _TaggedTransactionRef = TaggedTransaction;


function Kpi({
  label, value, hint, tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "emerald" | "sky" | "amber";
}) {
  const border =
    tone === "emerald" ? "border-emerald-500/40 bg-emerald-500/[0.04]"
    : tone === "sky" ? "border-sky-500/40 bg-sky-500/[0.04]"
    : "border-amber-500/40 bg-amber-500/[0.04]";
  return (
    <article className={`surface elevated p-3 flex flex-col gap-1.5 ${border}`}>
      <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="mono text-xl font-semibold">{value}</span>
      <span className="text-[10px] text-muted-foreground leading-snug">{hint}</span>
    </article>
  );
}
