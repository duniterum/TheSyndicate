// Syndicate Treasury — live balances at the Vault wallet.
// Replaces the "Token Sale" block on the homepage with the real asset list.

import { Section, SectionHeader, ContractLink, CTAButton } from "./Primitives";
import { useTreasuryAssets } from "@/lib/treasury-hooks";
import { CONTRACTS, explorerUrlForAddress, extrasForAddress } from "@/lib/syndicate-config";

const fmtAmt = (n: number, decimals = 4) =>
  n.toLocaleString("en-US", { maximumFractionDigits: n < 1 ? 6 : decimals });

export function TreasuryComposition() {
  const t = useTreasuryAssets();
  const knownUsd = t.knownUsd;
  const totalForPct = knownUsd > 0 ? knownUsd : 1;

  return (
    <Section id="treasury-composition" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Syndicate Treasury"
        title={<>What the <span className="text-gradient-gold">Vault holds</span> right now</>}
        description="Direct balanceOf reads against the Vault wallet on Avalanche. Anything missing a verifiable price is shown as an amount with USD PENDING — we never invent dollar values."
      />
      <div className="surface elevated p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Vault wallet</span>
            <ContractLink
              address={CONTRACTS.VAULT_WALLET}
              explorerHref={explorerUrlForAddress(CONTRACTS.VAULT_WALLET)}
              extras={extrasForAddress(CONTRACTS.VAULT_WALLET)}
            />
          </div>
          <div className="mono text-sm">
            <span className="text-muted-foreground uppercase tracking-[0.18em] text-[10px] mr-2">Known USD</span>
            <span className="font-semibold">${knownUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            {t.anyPendingUsd && (
              <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">+ assets PENDING USD</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="py-2 pr-3 font-normal">Asset</th>
                <th className="py-2 pr-3 font-normal text-right">Amount</th>
                <th className="py-2 pr-3 font-normal text-right">USD Value</th>
                <th className="py-2 pr-3 font-normal text-right">% of known</th>
                <th className="py-2 pr-3 font-normal">Source</th>
              </tr>
            </thead>
            <tbody>
              {t.assets.map((a) => {
                const pct = a.usdValue !== undefined ? (a.usdValue / totalForPct) * 100 : undefined;
                return (
                  <tr key={a.symbol} className="border-t border-border/40">
                    <td className="py-2 pr-3 font-medium">{a.symbol}</td>
                    <td className="py-2 pr-3 text-right mono">
                      {a.amount !== undefined ? fmtAmt(a.amount) : (t.isLoading ? "…" : "—")}
                    </td>
                    <td className="py-2 pr-3 text-right mono">
                      {a.usdValue !== undefined
                        ? `$${a.usdValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                        : (
                          <span className="text-amber-700 dark:text-amber-400 text-[10px] uppercase tracking-[0.14em]">PENDING</span>
                        )}
                    </td>
                    <td className="py-2 pr-3 text-right mono">
                      {pct !== undefined ? `${pct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {a.address ? (
                        <ContractLink
                          address={a.address}
                          explorerHref={explorerUrlForAddress(a.address)}
                          extras={extrasForAddress(a.address)}
                        />
                      ) : (
                        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">native AVAX</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground">
          Sourced live from chain via <code className="mono">balanceOf</code> on each token + native AVAX balance. USD is computed only where verifiable (USDC = $1, SYN priced from the Trader Joe LP). Bridged-asset USD will come online once a price oracle is wired in a later sprint.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <CTAButton variant="ghost" href="/transparency">Open transparency →</CTAButton>
        <CTAButton variant="ghost" href="/registry">Full contract registry →</CTAButton>
      </div>
    </Section>
  );
}
