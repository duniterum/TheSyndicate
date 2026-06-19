import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { VaultPolicyCore } from "@/components/syndicate/VaultPolicyCore";
import { VaultDisambiguation } from "@/components/syndicate/VaultDisambiguation";
import { TreasuryComposition } from "@/components/syndicate/TreasuryComposition";
import { RevenueStreams } from "@/components/syndicate/RevenueStreams";
import { GlassCard, Section, SectionHeader, MetricExplainer, ProofButton } from "@/components/syndicate/Primitives";
import { vaultFlow, explorerUrlFor, CONTRACTS } from "@/lib/syndicate-config";
import { fmtAddress } from "@/lib/sale-hooks";

const ROUTE_DESTINATIONS = [
  { key: "VAULT_WALLET",      pct: 70, label: "Vault Wallet",      role: "Long-term protocol reserve" },
  { key: "LIQUIDITY_WALLET",  pct: 20, label: "Liquidity Wallet",  role: "Trader Joe SYN/USDC pair" },
  { key: "OPERATIONS_WALLET", pct: 10, label: "Operations Wallet", role: "Protocol operations" },
] as const;

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "The Vault — 70% Vault / 20% LP / 10% Ops | The Syndicate" },
      { name: "description", content: "USDC routing: 70% Vault Wallet, 20% Liquidity Wallet, 10% Operations Wallet — enforced live by the Membership Sale contract." },
      { property: "og:title", content: "The Syndicate — Vault" },
      { property: "og:description", content: "70% Vault · 20% Liquidity · 10% Operations — live on Avalanche. Programmatic Vault contract still PENDING." },
      { property: "og:url", content: "https://thesyndicate.money/vault" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/vault" }],
  }),
  component: VaultPage,
});

function VaultPage() {
  return (
    <PageShell
      eyebrow="Vault"
      title="The Vault"
      description="70% of every USDC purchase is routed live by the Membership Sale contract to the Vault Wallet. Programmatic Vault contract — PENDING, not deployed. Future automation would require audit and explicit activation."
    >
      <VaultDisambiguation />

      <Section id="vault-safety">
        <div className="surface elevated p-4 md:p-5 border-l-2 border-amber-500/40">
          <div className="mono text-[11px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-2">Vault safety</div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            Today the Vault is <span className="font-semibold">a public on-chain wallet</span> — not a smart-contract vault.
            There is <span className="font-semibold">no yield</span>, <span className="font-semibold">no dividends</span>,
            <span className="font-semibold"> no automated custody</span>, and <span className="font-semibold">no claim by SYN holders</span> on Vault assets.
            Any future programmatic Vault automation will require a third-party audit and an explicit activation event before going live.
          </p>
        </div>
      </Section>

      <VaultPolicyCore />

      <Section id="vault-destinations">
        <SectionHeader
          eyebrow="On-chain destinations"
          title={<>Three wallets, <span className="text-gradient-gold">every purchase</span></>}
          description="The Membership Sale contract splits every USDC purchase 70 / 20 / 10 across these three wallets, on-chain. Verify each balance yourself."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROUTE_DESTINATIONS.map((d) => {
            const address = CONTRACTS[d.key];
            const explorer = explorerUrlFor(d.key);
            return (
              <GlassCard key={d.key} className="p-5 flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="mono text-[11px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">{d.label}</div>
                  <div className="mono text-sm font-semibold text-[var(--gold)]">{d.pct}%</div>
                </div>
                <div className="text-sm text-foreground/85">{d.role}</div>
                <div className="mono text-xs text-muted-foreground break-all">{fmtAddress(address)}</div>
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  <ProofButton href={`/wallet/${address}`} external={false} ariaLabel={`Open ${d.label} in app`}>In-app</ProofButton>
                  {explorer && (
                    <ProofButton href={explorer} ariaLabel={`Open ${d.label} on Avascan`}>Avascan ↗</ProofButton>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </Section>

      <Section id="vault-explainer">
        <MetricExplainer
          what="The Vault holds the 70% share of every USDC purchase. Today it is a public Vault Reserve wallet. Programmatic Vault contract — PENDING, not deployed. Future automation would require audit and explicit activation."
          why="The Vault is the long-term protocol reserve — public infrastructure behind SYN membership. Everything else (LP, operations, recognition, and memory artifacts) routes around it."
          how="The Membership Sale contract splits every purchase 70 / 20 / 10 on-chain. The 70% leg lands in the Vault Reserve wallet today and will route into the Vault contract once deployed."
          verify={{ label: "Vault Wallet on Avascan", href: explorerUrlFor("VAULT_WALLET") ?? "#" }}
        />
      </Section>

      <Section id="vault-examples">
        <SectionHeader
          eyebrow="Worked Examples"
          title={<>Where your <span className="text-gradient-gold">USDC goes</span></>}
          description="Every purchase routes onchain through the Membership Sale contract. Numbers below are arithmetic, not forecasts."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[5, 100, 1000].map((amt) => {
            const f = vaultFlow(amt);
            return (
              <GlassCard key={amt} className="p-5">
                <div className="mono text-[11px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-2">${amt} purchase</div>
                <ul className="text-sm space-y-1.5 mt-3">
                  <li className="flex justify-between"><span className="text-muted-foreground">Vault (70%)</span><span className="mono font-semibold">${f.vault.toFixed(2)}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Liquidity (20%)</span><span className="mono font-semibold">${f.lp.toFixed(2)}</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">Operations (10%)</span><span className="mono font-semibold">${f.ops.toFixed(2)}</span></li>
                </ul>
              </GlassCard>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground border-l-2 border-amber-500/40 pl-3 max-w-3xl">
          The programmatic Vault contract is <span className="mono">PENDING</span>. Today the Vault allocation lands in the Vault Reserve wallet — public and verifiable on Avascan.
        </p>
      </Section>


      <RevenueStreams />

      <TreasuryComposition />

    <RouteFinalCTA preset="verify" />
    </PageShell>
  );
}
