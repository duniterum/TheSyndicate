import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RegistryTrustOpener } from "@/components/syndicate/RegistryTrustOpener";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { ContractDossiers } from "@/components/syndicate/ContractDossiers";
import { RegistryCustody } from "@/components/syndicate/RegistryCustody";
import { ContractLink, GlassCard, Pill, Section, SectionHeader, StatusPill as CanonicalStatusPill } from "@/components/syndicate/Primitives";
import {
  CONTRACTS,
  ALLOCATION_WALLETS,
  ALLOCATION_EXPECTED_SYN,
  PROTOCOL_STATUS,
  SYN_EXPLORERS,
  ARCHIVE_NFT_EXPLORERS,
  VAULT_ALLOCATION,
  LP_POOL,
  MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS,
  ACTIVE_MEMBERSHIP_SALE_CONTRACT_ADDRESS,
  ACTIVE_MEMBERSHIP_SALE_VERSION,
  explorerUrlFor,
  explorerUrlForAddress,
  extrasForAddress,
  txExplorerUrl,
} from "@/lib/syndicate-config";
import { CURRENT_SOURCE_POLICY_SNAPSHOT } from "@/lib/source-policy-observability";
import {
  SOURCE_REGISTRY_ACTIVITY_READ_MODEL_BOUNDARY,
  SOURCE_REGISTRY_LIFECYCLE_VISIBILITY,
} from "@/lib/source-registry-lifecycle";

// Active membership sale (V3 after cutover; V1/V2 history stays sealed but verifiable).
const ACTIVE_SALE_ADDR =
  ACTIVE_MEMBERSHIP_SALE_CONTRACT_ADDRESS ?? CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS;

export const Route = createFileRoute("/registry")({
  head: () => ({
    meta: [
      { title: "Protocol Registry â€” Contracts, Wallets, Status | The Syndicate" },
      { name: "description", content: "Canonical Protocol Registry: every contract address, every allocation wallet, every status, every explorer link for The Syndicate on Avalanche C-Chain." },
      { property: "og:title", content: "The Syndicate â€” Protocol Registry" },
      { property: "og:description", content: "Single source of truth: contracts, wallets, allocations, statuses." },
      { property: "og:url", content: "https://thesyndicate.money/registry" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/registry" }],
  }),
  component: RegistryPage,
});

const fmt = (n: number) => n.toLocaleString("en-US");

type ContractRow = {
  label: string;
  status: "live" | "pending";
  address: string;
  href: string | null;
  description: string;
};

const CONTRACT_ROWS: ContractRow[] = [
  {
    label: "SYN Token (ERC20)",
    status: "live",
    address: CONTRACTS.SYN_CONTRACT_ADDRESS,
    href: SYN_EXPLORERS.avascan,
    description: "Fixed 1,000,000,000 supply. No admin, no mint, no tax, no pause.",
  },
  {
    label: "Membership Sale",
    status: "live",
    address: ACTIVE_SALE_ADDR,
    href: explorerUrlForAddress(ACTIVE_SALE_ADDR),
    description: ACTIVE_MEMBERSHIP_SALE_VERSION === "v3"
      ? "USDC to SYN through MembershipSaleV3. Public buys use zero sourceId, wait for approval and purchase receipts, and route net USDC 70/20/10. Source records, referral UI, and claim UI remain inactive."
      : "USDC to SYN. Splits 70/20/10 onchain to Vault, Liquidity, Operations.",
  },
  {
    label: "USDC (Avalanche)",
    status: "live",
    address: CONTRACTS.USDC_CONTRACT_ADDRESS,
    href: explorerUrlFor("USDC_CONTRACT_ADDRESS"),
    description: "Payment token. Native USDC on Avalanche C-Chain.",
  },
  {
    label: "LP Pool (Trader Joe Â· SYN/USDC Â· AMM/JLP)",
    status: "live",
    address: LP_POOL.pairAddress,
    href: explorerUrlFor("LP_PAIR_ADDRESS"),
    description: `Live SYN/USDC ${LP_POOL.poolType} pair on Avalanche. Initial liquidity: ${LP_POOL.initialSyn} SYN + ${LP_POOL.initialUsdc} USDC @ $${LP_POOL.initialPriceUsd}.`,
  },
  { label: "Vault Contract",     status: "pending", address: "PENDING", href: null, description: "Programmatic Vault is not deployed. Vault funds currently sit in a public wallet (see below)." },
  { label: "SeatRecord721 (future ERC-721)", status: "pending", address: "PENDING", href: null, description: "Future identity record â€” PENDING CONTRACT. Distinct from the deployed Archive1155 memory contract. It is not live and cannot be inferred from Archive1155." },
  { label: "Archive Contract (SyndicateArchive1155)", status: "live", address: CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS, href: ARCHIVE_NFT_EXPLORERS.avascan, description: "Deployed on Avalanche Â· The First Signal (ID 1) is ACTIVE and public mint is OPEN at 0.50 USDC (wallet limit 5). Patron Seal (ID 3) is CONTRACT_GATED / PUBLIC_MINT_READ_GATED: mintability is shown only from live Archive1155 reads. ID 2 is reserved/disabled for future SeatRecord721 identity." },
  { label: "Governance Module",  status: "pending", address: "PENDING", href: null, description: "Snapshot / onchain governance. Not deployed yet." },
  { label: "AI Layer",           status: "pending", address: "PENDING", href: null, description: "No AI module is live." },
];

const ROUTING_WALLETS: Array<{ label: string; key: keyof typeof CONTRACTS; pct: number }> = [
  { label: "70% â†’ Vault Wallet",      key: "VAULT_WALLET",      pct: 70 },
  { label: "20% â†’ Liquidity Wallet",  key: "LIQUIDITY_WALLET",  pct: 20 },
  { label: "10% â†’ Operations Wallet", key: "OPERATIONS_WALLET", pct: 10 },
];

function StatusPill({ status }: { status: "live" | "pending" }) {
  return <CanonicalStatusPill status={status === "live" ? "LIVE" : "PENDING"} />;
}

function RegistryPage() {
  const sourcePolicy = CURRENT_SOURCE_POLICY_SNAPSHOT;

  return (
    <PageShell
      eyebrow="Registry"
      title="Protocol Registry"
      description="One canonical source of truth. Every contract, every wallet, every status, every explorer link."
    >
      {/* Trust opener â€” skeptic-friendly canonical cards above all tables */}
      <RegistryTrustOpener />

      {/* Protocol Status */}
      <Section id="status">
        <SectionHeader
          eyebrow="01 â€” Status"
          title="Live and pending modules"
          description="Same source of truth that powers the homepage, Transparency Center, and roadmap."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROTOCOL_STATUS.map((s) => (
            <GlassCard key={s.key} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">{s.label}</h3>
                <StatusPill status={s.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.summary}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Contracts */}
      <Section id="contracts">
        <SectionHeader
          eyebrow="02 â€” Contracts"
          title="Smart contracts"
          description="Every deployed contract is listed here. Pending contracts are explicitly marked PENDING."
        />
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                  <th className="py-3 px-4">Contract</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {CONTRACT_ROWS.map((r) => (
                  <tr key={r.label} className="border-b border-border/20 last:border-0 align-top">
                    <td className="py-3 px-4 font-medium">{r.label}</td>
                    <td className="py-3 px-4"><StatusPill status={r.status} /></td>
                    <td className="py-3 px-4">
                      <ContractLink
                        address={r.address}
                        explorerHref={r.href}
                        extras={extrasForAddress(r.address)}
                      />
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-md">{r.description}</td>
                  </tr>
                ))}
                {/* Extra row: LP creation TX */}
                <tr className="border-b border-border/20 last:border-0 align-top">
                  <td className="py-3 px-4 font-medium">LP Pool Creation TX</td>
                  <td className="py-3 px-4"><StatusPill status="live" /></td>
                  <td className="py-3 px-4">
                    <a
                      href={txExplorerUrl(LP_POOL.creationTx)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-xs hover:text-[var(--gold)] underline-offset-4 hover:underline"
                    >
                      {LP_POOL.creationTx.slice(0, 10)}â€¦{LP_POOL.creationTx.slice(-6)} â†—
                    </a>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground max-w-md">
                    Trader Joe pair-creation transaction on Avalanche C-Chain.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </Section>

      <ContractDossiers />

      {/* SourceRegistry lifecycle model */}
      <Section id="source-registry-lifecycle">
        <SectionHeader
          eyebrow="Source policy lifecycle"
          title="Source records become proof before they become rails"
          description="SourceRegistryV1 is deployed and readable. Its future events must appear as status-aware proof facts, not as proof that referral, claim UI, or public source links are available."
        />
        <GlassCard className="p-5">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["Source records", sourcePolicy.recordCount.toString()],
              ["Active", sourcePolicy.activeCount.toString()],
              ["Paused", sourcePolicy.pausedCount.toString()],
              ["Public default", "ZERO_SOURCE_ID"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[6px] border border-border/55 bg-background/45 p-3">
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {label}
                </div>
                <div className="mt-2 text-lg font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[6px] border border-[rgba(255,180,84,0.28)] bg-[rgba(255,180,84,0.07)] p-3 text-sm leading-relaxed text-foreground/85">
            {SOURCE_REGISTRY_ACTIVITY_READ_MODEL_BOUNDARY.currentTruth}{" "}
            {SOURCE_REGISTRY_ACTIVITY_READ_MODEL_BOUNDARY.publicDefaultBoundary}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            {SOURCE_REGISTRY_LIFECYCLE_VISIBILITY.map((event) => (
              <article key={event.eventName} className="rounded-md border border-border/60 bg-card/70 p-4">
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
                  {event.eventName}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                  {event.proofMeaning}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Not proof of: {event.notProofOf}
                </p>
              </article>
            ))}
          </div>
        </GlassCard>
      </Section>

      {/* Allocation Wallets */}
      <Section id="allocations">
        <SectionHeader
          eyebrow="03 â€” Allocation Wallets"
          title="Seven public allocation wallets"
          description="Initial 1,000,000,000 SYN mint distributed across seven public wallets. Every balance is verifiable on Avascan."
        />
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                  <th className="py-3 px-4">Allocation</th>
                  <th className="py-3 px-4 text-right">Expected SYN</th>
                  <th className="py-3 px-4">Wallet</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ALLOCATION_WALLETS).map(([label, addr]) => {
                  const url = explorerUrlForAddress(addr);
                  const expected = ALLOCATION_EXPECTED_SYN[label] ?? 0;
                  return (
                    <tr key={label} className="border-b border-border/20 last:border-0">
                      <td className="py-3 px-4 font-medium">{label}</td>
                      <td className="py-3 px-4 text-right mono text-xs">{fmt(expected)} SYN</td>
                      <td className="py-3 px-4">
                        <ContractLink address={addr} explorerHref={url} extras={extrasForAddress(addr)} />
                      </td>
                      <td className="py-3 px-4"><StatusPill status="live" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </Section>

      {/* USDC Routing Wallets */}
      <Section id="routing">
        <SectionHeader
          eyebrow="04 â€” USDC Routing"
          title="Where USDC goes"
          description={`Every USDC purchase splits onchain: ${VAULT_ALLOCATION.vaultAssets * 100}% Vault Â· ${VAULT_ALLOCATION.liquidityReinforcement * 100}% Liquidity Â· ${VAULT_ALLOCATION.operationsCommunity * 100}% Operations.`}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROUTING_WALLETS.map((r) => {
            const addr = CONTRACTS[r.key];
            const url = explorerUrlFor(r.key);
            return (
              <GlassCard key={r.key} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{r.label}</h3>
                  <StatusPill status="live" />
                </div>
                <ContractLink address={addr} explorerHref={url} extras={extrasForAddress(addr)} />
                <p className="mt-3 text-xs text-muted-foreground">
                  Receives {r.pct}% of every USDC purchase, routed automatically by the Membership Sale contract.
                </p>
              </GlassCard>
            );
          })}
        </div>
      </Section>

      {/* Explorer index */}
      <Section id="explorers">
        <SectionHeader
          eyebrow="05 â€” Verification"
          title="Explorers & source"
          description="SYN is verified across multiple explorers. Use any of them to confirm contract bytecode and source."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ExplorerCard href={SYN_EXPLORERS.avascan} label="Avascan" />
          <ExplorerCard href={SYN_EXPLORERS.sourcify} label="Sourcify" />
          <ExplorerCard href={SYN_EXPLORERS.routescan} label="Routescan" />
          <ExplorerCard href={SYN_EXPLORERS.snowtrace} label="SnowTrace" />
        </div>
      </Section>

      {/* Custody & admin keys â€” live on-chain reads */}
      <RegistryCustody />

      {/* Cross-links */}
      <Section id="more">
        <div className="flex flex-wrap gap-3">
          <Pill tone="muted">Cross-references</Pill>
          <Link to="/transparency" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Transparency Center â†’</Link>
          <Link to="/institutional-register" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Institutional Register â†’</Link>
          <Link to="/knowledge-map" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Knowledge Map â†’</Link>
          <Link to="/tokenomics" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Tokenomics â†’</Link>
          <Link to="/liquidity" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Liquidity â†’</Link>
          <Link to="/whitepaper" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Whitepaper â†’</Link>
          <Link to="/roadmap" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Roadmap â†’</Link>
        </div>
      </Section>
    <RouteFinalCTA preset="verify" />
    </PageShell>
  );
}

function ExplorerCard({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="surface elevated p-4 flex items-center justify-between hover:border-[var(--gold)]/40 transition-colors"
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="mono text-xs text-muted-foreground">â†—</span>
    </a>
  );
}
