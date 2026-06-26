import { useMemo, useState } from "react";
import {
  ACCESS_RATE_USDC_PER_SYN,
  ACCESS_RATE_LABEL,
  CONTRACTS,
  CONTRACT_READINESS,
  DEMO_MODE,
  DEMO_MODE_LABEL,
  EXPLORER_BASE_URL,
  LEGAL_DISCLAIMER,
  PURCHASE_PRESETS_USDC,
  SALE_CTA_LABEL,
  SALE_STATUS_LABEL,
  TOKEN_SPEC,
  explorerUrlFor,
  rankForUsdc,
  vaultFlow,
  type ContractKey,
} from "@/lib/syndicate-config";

const fmtUsd = (n: number) =>
  n < 100
    ? `$${n.toFixed(2).replace(/\.00$/, "")}`
    : `$${Math.round(n).toLocaleString("en-US")}`;
const fmtSyn = (n: number) => `${Math.round(n).toLocaleString("en-US")} SYN`;
const shortAddr = (a: string) =>
  a === "PENDING" ? "PENDING" : `${a.slice(0, 6)}…${a.slice(-4)}`;

export function SmartContractFlow() {
  const [usdc, setUsdc] = useState<number>(25);
  const [step, setStep] = useState<"idle" | "prepared">("idle");

  const calc = useMemo(() => {
    const syn = usdc / ACCESS_RATE_USDC_PER_SYN;
    const { current, next } = rankForUsdc(usdc);
    const f = vaultFlow(usdc);
    const gap = next ? Math.max(0, next.usdc - usdc) : 0;
    return {
      syn,
      current,
      next,
      gap,
      vault: f.vault,
      lp: f.lp,
      ops: f.ops,
    };
  }, [usdc]);

  const belowMin = usdc < 5;

  const handlePrepare = () => {
    // Live sale not deployed yet. Persist intent so the future Membership Sale
    // contract page can pre-fill the chosen amount.
    try {
      localStorage.setItem(
        "syn_prepared_join",
        JSON.stringify({ usdc, ts: Date.now() })
      );
    } catch {
      /* ignore */
    }
    setStep("prepared");
  };

  const reset = () => setStep("idle");

  return (
    <section
      id="buy"
      aria-labelledby="buy-heading"
      className="border-t border-border/40 bg-background"
    >
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
        <header className="mb-8 md:mb-12">
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-3">
            Membership Sale · Smart Contract Flow
          </p>
          <h2
            id="buy-heading"
            className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground"
          >
            Wallet-to-contract purchase
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
            {ACCESS_RATE_LABEL}. USDC routes automatically 70% Vault · 20% Liquidity ·
            10% Operations through the Membership Sale contract. The SYN ERC20 stays
            minimal — no tax, no admin, no mint, no pause.
          </p>

          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] mono uppercase tracking-[0.18em] border ${
              DEMO_MODE
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {DEMO_MODE ? DEMO_MODE_LABEL : "Live mode · contracts deployed"}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Purchase widget */}
          <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Join Simulator
            </h3>

            {/* Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-3">
              {PURCHASE_PRESETS_USDC.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setUsdc(v);
                    reset();
                  }}
                  className={`mono text-[11px] uppercase tracking-[0.15em] rounded-md border py-2 transition-colors ${
                    usdc === v
                      ? "border-[var(--gold)] bg-[var(--gold)]/10 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-[var(--gold)]/60"
                  }`}
                >
                  ${v}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <label className="block mb-4">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Custom amount (USDC)
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 mono text-sm text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={usdc}
                  onChange={(e) => {
                    setUsdc(Math.max(0, Number(e.target.value) || 0));
                    reset();
                  }}
                  className="w-full rounded-md border border-border/60 bg-background pl-7 pr-3 py-2.5 mono text-base font-semibold focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </label>

            {/* Preview */}
            <div className="rounded-lg border border-border/50 bg-background/60 p-4 space-y-2">
              <PreviewRow label="USDC amount" value={fmtUsd(usdc)} />
              <PreviewRow label="SYN received" value={fmtSyn(calc.syn)} accent />
              <PreviewRow label="Capital footprint" value={calc.current?.name ?? "Below Citizen"} />
              <PreviewRow
                label="Next footprint gap"
                value={calc.next ? `${fmtUsd(calc.gap)} → ${calc.next.name}` : "Top tier"}
              />
              <div className="h-px bg-border/40 my-2" />
              <PreviewRow label="70% Vault" value={fmtUsd(calc.vault)} />
              <PreviewRow label="20% Liquidity" value={fmtUsd(calc.lp)} />
              <PreviewRow label="10% Operations" value={fmtUsd(calc.ops)} />
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
              {LEGAL_DISCLAIMER}
            </p>

            {belowMin && (
              <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                You can simulate any amount. Official Citizen entry starts at $5.
              </div>
            )}

            {/* Single CTA — sale is LIVE; widget saves intent then deep-links to /join */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handlePrepare}
                disabled={step === "prepared"}
                className="rounded-md px-4 py-3 text-sm font-semibold disabled:opacity-60"
                style={{ background: "var(--gradient-gold)" }}
              >
                {step === "prepared" ? "Intent saved ✓" : SALE_CTA_LABEL}
              </button>
              <div className="flex items-center justify-between text-[11px] mono uppercase tracking-[0.18em]">
                <span className="text-amber-700 dark:text-amber-400">
                  ● {SALE_STATUS_LABEL}
                </span>
                {step === "prepared" && (
                  <button
                    onClick={reset}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ↺ Reset
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                SYN and the Membership Sale contract are both LIVE on Avalanche.
                Every USDC purchase routes wallet-to-contract and delivers SYN at
                {" "}{ACCESS_RATE_LABEL}. Use /join to execute the on-chain transaction.
              </p>
            </div>
          </article>


          {/* Readiness + addresses */}
          <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Smart Contract Readiness
              </h3>
              <ul className="space-y-2">
                {CONTRACT_READINESS.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0"
                  >
                    <span className="text-foreground">{item.label}</span>
                    <span
                      className={`mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${
                        item.ready
                          ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                          : "border-border/60 text-muted-foreground"
                      }`}
                    >
                      {item.ready ? "Ready" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Contract Addresses
              </h3>
              <dl className="divide-y divide-border/40 text-sm">
                {(Object.entries(CONTRACTS) as Array<[ContractKey, string]>).map(([k, v]) => {
                  const url = explorerUrlFor(k);
                  return (
                    <div key={k} className="flex items-center justify-between py-2 gap-3">
                      <dt className="text-muted-foreground text-xs mono uppercase tracking-[0.14em]">
                        {k.replace(/_/g, " ")}
                      </dt>
                      <dd className="font-mono text-foreground text-xs">
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
                            title={`View on ${EXPLORER_BASE_URL.replace(/^https?:\/\//, "")}`}
                          >
                            {shortAddr(v)}
                            <span aria-hidden className="text-[10px]">↗</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">{shortAddr(v)}</span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                Live addresses link to {EXPLORER_BASE_URL.replace(/^https?:\/\//, "")}. SYN ERC20 is
                minimal: fixed {TOKEN_SPEC.totalSupply.toLocaleString()} supply, no tax, no admin,
                no mint, no pause, no blacklist, no transfer restrictions. The 70/20/10 split lives
                in the separate Membership Sale contract.
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-background/60 p-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Non-custodial by design
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
                <li>No backend private keys.</li>
                <li>The website never custodies user funds.</li>
                <li>No tokens are sent manually from the site.</li>
                <li>All purchases sign wallet-to-contract via MetaMask / Core Wallet.</li>
              </ul>
            </div>
          </article>
        </div>

        {/* FAQ */}
        <div className="mt-10 rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Smart Contract FAQ
          </h3>
          <dl className="divide-y divide-border/40">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="py-3">
                <dt className="text-sm font-medium text-foreground">{q}</dt>
                <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function PreviewRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`mono text-sm font-semibold ${
          accent ? "text-gradient-gold" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "Why two transactions?",
    a: "First you approve USDC so the Membership Sale contract can pull the amount you chose. Then the buy transaction sends USDC in and SYN out in a single onchain call.",
  },
  {
    q: "Where does my USDC go?",
    a: "70% to the Vault wallet, 20% to the Liquidity wallet, 10% to the Operations wallet. The split happens inside the Membership Sale contract — not inside the SYN token.",
  },
  {
    q: "Where do SYN tokens come from?",
    a: "From the Membership Distribution allocation (350,000,000 SYN). The contract transfers from that pool at the fixed rate of 1 SYN = $0.01 USDC.",
  },
  {
    q: "Can the website steal funds?",
    a: "No. No backend private keys are used. You sign every transaction directly in your wallet, wallet-to-contract.",
  },
  {
    q: "Can the ERC20 token be changed?",
    a: "No. SYN V1 is fixed and non-upgradeable: no mint, no pause, no admin, no blacklist, no tax. Future features ship as separate contracts.",
  },
];

export default SmartContractFlow;
