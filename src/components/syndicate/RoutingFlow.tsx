import { formatUnits } from "viem";
import {
  USDC_ROUTING,
  CONTRACTS,
  USDC_DECIMALS,
  explorerUrlForAddress,
  explorerUrlFor,
} from "@/lib/syndicate-config";
import { useSaleStats } from "@/lib/sale-hooks";
import { Section, SectionHeader, CTAButton, ProofButton } from "./Primitives";

const fmtUsd = (n: number | undefined, max = 2) =>
  n === undefined ? "…" : `$${n.toLocaleString("en-US", { maximumFractionDigits: max })}`;

const toneClass = (tone: "gold" | "navy" | "amber") => {
  switch (tone) {
    case "gold":
      return {
        bar: "bg-[var(--gold)]",
        border: "border-[var(--gold)]/40 bg-[var(--gold)]/5",
        text: "text-[var(--gold)]",
      };
    case "navy":
      return {
        bar: "bg-[var(--navy-soft)]",
        border: "border-[var(--navy-soft)]/40 bg-[var(--navy-soft)]/5",
        text: "text-[var(--navy-soft)]",
      };
    case "amber":
      return {
        bar: "bg-amber-500",
        border: "border-amber-500/40 bg-amber-500/5",
        text: "text-amber-700 dark:text-amber-400",
      };
  }
};

/**
 * USDC Routing Flow — visualizes the 70/20/10 split enforced by the
 * Membership Sale contract. Totals are live, derived from totalUsdcRaised().
 */
export function RoutingFlow() {
  const s = useSaleStats();
  const usdcRaisedNum =
    s.totalUsdcRaised !== undefined
      ? Number(formatUnits(s.totalUsdcRaised, USDC_DECIMALS))
      : undefined;

  return (
    <Section id="routing-flow">
      <SectionHeader
        eyebrow="USDC Routing"
        title={<>Every USDC <span className="text-gradient-gold">splits 70 / 20 / 10</span> automatically</>}
        description="The Membership Sale contract routes every payment on-chain. No multisig, no manual transfer — the split is enforced in code."
      />

      {/* Total raised + atomic split bar */}
      <div className="surface elevated p-4 mb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Total USDC Routed</div>
            <div className="mono text-2xl font-semibold mt-1">{fmtUsd(usdcRaisedNum)}</div>
          </div>
          <a
            href={explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS") ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]"
          >
            totalUsdcRaised() ↗
          </a>
        </div>

        {/* Stacked horizontal bar */}
        <div className="h-3 w-full rounded-full overflow-hidden flex border border-border/50">
          {USDC_ROUTING.map((r) => {
            const t = toneClass(r.tone);
            return <div key={r.label} className={`${t.bar} h-full`} style={{ width: `${r.pct}%` }} />;
          })}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {USDC_ROUTING.map((r) => (
            <div key={r.label} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${toneClass(r.tone).bar}`} />
              {r.pct}% {r.label.replace(" Wallet", "")}
            </div>
          ))}
        </div>
      </div>

      {/* Per-wallet cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {USDC_ROUTING.map((r) => {
          const t = toneClass(r.tone);
          const addr = CONTRACTS[r.key];
          const url = explorerUrlForAddress(addr);
          const routed = usdcRaisedNum !== undefined ? usdcRaisedNum * (r.pct / 100) : undefined;
          return (
            <article key={r.label} className={`rounded-md border p-4 ${t.border}`}>
              <div className="flex items-baseline justify-between gap-2">
                <div className={`mono text-[10px] uppercase tracking-[0.18em] ${t.text}`}>{r.label}</div>
                <div className={`mono text-xs font-semibold ${t.text}`}>{r.pct}%</div>
              </div>
              <div className="mono text-xl font-semibold mt-2">{fmtUsd(routed)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {r.key === "VAULT_WALLET" && "Long-term Vault reserve — backs SYN over time."}
                {r.key === "LIQUIDITY_WALLET" && "Held to reinforce LP depth on Trader Joe."}
                {r.key === "OPERATIONS_WALLET" && "Build, ops, infra, and contributor payments."}
              </div>
              <div className="mono text-[10px] mt-3 break-all text-muted-foreground">{addr}</div>
              {url && (
                <div className="mt-2">
                  <ProofButton href={url}>Avascan ↗</ProofButton>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <CTAButton variant="gold" href="/transparency">See full transparency →</CTAButton>
        <CTAButton variant="ghost" href="/vault">How the Vault works →</CTAButton>
      </div>
    </Section>
  );
}
