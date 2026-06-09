import {
  TOKEN_SPEC,
  TOKENOMICS_ALLOCATION,
  ACCESS_RATE_LABEL,
  ACCESS_RATE_USDC_PER_SYN,
  VAULT_ALLOCATION,
  LEGAL_DISCLAIMER,
  ALLOCATION_WALLETS,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";

const shortAddr = (a: string) =>
  a === "PENDING" ? "PENDING" : `${a.slice(0, 6)}…${a.slice(-4)}`;

const fmtInt = (n: number) => n.toLocaleString("en-US");
const fmtSyn = (n: number) => `${fmtInt(n)} SYN`;

export function CanonicalSpec() {
  const totalAllocated = TOKENOMICS_ALLOCATION.reduce((s, a) => s + a.syn, 0);
  const totalPct = TOKENOMICS_ALLOCATION.reduce((s, a) => s + a.pct, 0);

  const tokenRows: Array<[string, string]> = [
    ["Name", TOKEN_SPEC.name],
    ["Symbol", TOKEN_SPEC.symbol],
    ["Total supply", `${fmtInt(TOKEN_SPEC.totalSupply)} ${TOKEN_SPEC.symbol}`],
    ["Decimals", String(TOKEN_SPEC.decimals)],
    ["Chain", TOKEN_SPEC.chain],
    ["Fixed supply", TOKEN_SPEC.fixedSupply ? "Yes" : "No"],
    ["Future mint", TOKEN_SPEC.futureMint ? "Yes" : "No"],
    ["Transfer tax", `${TOKEN_SPEC.tax}%`],
    ["Blacklist", TOKEN_SPEC.blacklist ? "Yes" : "No"],
    ["Transfer restrictions", TOKEN_SPEC.transferRestrictions ? "Yes" : "No"],
    ["Admin powers", TOKEN_SPEC.admin ? "Yes" : "None"],
  ];

  const flowRows: Array<[string, number]> = [
    ["Vault Assets", VAULT_ALLOCATION.vaultAssets],
    ["Liquidity Reinforcement", VAULT_ALLOCATION.liquidityReinforcement],
    ["Operations & Community", VAULT_ALLOCATION.operationsCommunity],
  ];

  return (
    <section
      id="canonical-spec"
      aria-labelledby="canonical-spec-heading"
      className="border-t border-border/40 bg-background"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
        <header className="mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Canonical Spec
          </p>
          <h2
            id="canonical-spec-heading"
            className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground"
          >
            The single source of truth
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
            Every number on this site — supply, access rate, allocation — is rendered
            directly from one config file. If it changes here, it changes everywhere.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Token spec */}
          <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Core Token</h3>
            <dl className="divide-y divide-border/40">
              {tokenRows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2.5 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-mono text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </article>

          {/* Access rate + vault flow */}
          <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Access Rate</h3>
              <p className="text-2xl font-mono text-primary">{ACCESS_RATE_LABEL}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Fixed rate. Larger contributions reflect a higher rank and archive
                recognition — never cheaper SYN. ({ACCESS_RATE_USDC_PER_SYN} USDC per SYN)
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Per-Purchase Flow
              </h3>
              <dl className="space-y-2">
                {flowRows.map(([label, pct]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-sm"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-mono text-foreground">
                      {Math.round(pct * 100)}%
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                Every USDC purchase is routed 70 / 20 / 10 onchain.
              </p>
            </div>
          </article>
        </div>

        {/* Allocation table */}
        <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6">
          <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              Supply Allocation
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              {totalPct}% · {fmtSyn(totalAllocated)}
            </p>
          </div>

          <ul className="space-y-3">
            {TOKENOMICS_ALLOCATION.map((a) => {
              const wallet = ALLOCATION_WALLETS[a.label];
              const url = wallet ? explorerUrlForAddress(wallet) : null;
              return (
                <li key={a.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-foreground font-medium">{a.label}</span>
                    <span className="font-mono text-muted-foreground">
                      {a.pct}% · {fmtSyn(a.syn)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full bg-primary/70"
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {a.description}
                  </p>
                  {wallet && (
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] font-mono">
                      <span className="uppercase tracking-[0.16em] text-muted-foreground">
                        Wallet
                      </span>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline inline-flex items-center gap-1"
                        >
                          {shortAddr(wallet)}
                          <span aria-hidden className="text-[10px]">↗</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">{shortAddr(wallet)}</span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </article>

        <p className="mt-8 text-xs text-muted-foreground/80 leading-relaxed max-w-3xl">
          {LEGAL_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}

export default CanonicalSpec;
