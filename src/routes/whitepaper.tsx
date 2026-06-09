import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { GlassCard, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import {
  CONTRACTS,
  ALLOCATION_WALLETS,
  ALLOCATION_EXPECTED_SYN,
  TOKENOMICS_ALLOCATION,
  TOKEN_SPEC,
  PROTOCOL_STATUS,
  SYN_EXPLORERS,
  ACCESS_RATE_LABEL,
  SALE_MIN_USDC,
  LEGAL_DISCLAIMER,
  VAULT_ALLOCATION,
  explorerUrlFor,
  explorerUrlForAddress,
  isLiveAddress,
} from "@/lib/syndicate-config";
import { avascanAddressUrl } from "@/lib/chain-registry";

export const Route = createFileRoute("/whitepaper")({
  head: () => ({
    meta: [
      { title: "Whitepaper — Protocol Reference | The Syndicate" },
      {
        name: "description",
        content:
          "The Syndicate protocol reference: SYN token, allocation model, wallet registry, Membership Sale, Vault architecture, governance, NFT and AI layers, roadmap. Every address public.",
      },
      { property: "og:title", content: "The Syndicate — Whitepaper" },
      {
        property: "og:description",
        content: "Protocol reference. Contracts, wallets, allocations, statuses, verification links.",
      },
      { property: "og:url", content: "https://thesyndicate.money/whitepaper" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/whitepaper" }],
  }),
  component: WhitepaperPage,
});

const SHORT = (a: string) => (isLiveAddress(a) ? `${a.slice(0, 6)}…${a.slice(-4)}` : "PENDING");

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "mission",     label: "01 — Mission" },
  { id: "risk",        label: "02 — Public Risk Notice" },
  { id: "syn",         label: "03 — SYN Token" },
  { id: "allocation",  label: "04 — Allocation Model" },
  { id: "wallets",     label: "05 — Wallet Registry" },
  { id: "sale",        label: "06 — Membership Sale" },
  { id: "vault",       label: "07 — Vault Architecture" },
  { id: "liquidity",   label: "08 — Liquidity Strategy" },
  { id: "governance",  label: "09 — Governance" },
  { id: "nft",         label: "10 — NFT Layer" },
  { id: "archive",     label: "10b — Archive" },
  { id: "ai",          label: "11 — AI Layer" },
  { id: "roadmap",     label: "12 — Roadmap" },
  { id: "registry",    label: "13 — Contract Registry" },
  { id: "verify",      label: "14 — Verification Links" },
  { id: "faq",         label: "15 — FAQ" },
];

function StatusBadge({ status }: { status: "live" | "pending" }) {
  return (
    <span
      className={`mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${
        status === "live"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      }`}
    >
      <span className={`size-1 rounded-full ${status === "live" ? "bg-emerald-500" : "bg-amber-500"}`} />
      {status === "live" ? "LIVE" : "PENDING"}
    </span>
  );
}

function AddrLink({ addr, href }: { addr: string; href: string | null }) {
  if (!isLiveAddress(addr)) return <span className="mono text-xs text-muted-foreground">PENDING</span>;
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="mono text-xs hover:text-[var(--gold)] underline-offset-4 hover:underline">
      {SHORT(addr)} ↗
    </a>
  ) : (
    <span className="mono text-xs">{SHORT(addr)}</span>
  );
}

function WhitepaperPage() {
  return (
    <PageShell
      eyebrow="Whitepaper"
      title="Protocol reference"
      description="This document is the protocol reference. Every claim links to the corresponding onchain artifact or is explicitly marked PENDING."
    >
      {/* TOC */}
      <Section id="toc">
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Contents</div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-foreground/80 hover:text-[var(--gold)]">{s.label}</a>
              </li>
            ))}
          </ol>
        </GlassCard>
      </Section>

      <Section id="mission">
        <SectionHeader eyebrow="01 — Mission" title="A transparent onchain compounding experiment" />
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          The Syndicate is a public protocol designed to compound discipline, capital,
          reputation, and opportunity over decades. SYN is its membership and coordination
          token. Every contract, every wallet, every status is public.
        </p>
      </Section>

      <Section id="risk">
        <SectionHeader eyebrow="02 — Public Risk Notice" title="Read before participating" />
        <GlassCard className="p-6 text-sm text-muted-foreground leading-relaxed">{LEGAL_DISCLAIMER}</GlassCard>
      </Section>

      <Section id="syn">
        <SectionHeader eyebrow="03 — SYN Token" title="ERC20 · fixed supply · no admin" />
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/30">
              <Row label="Status"><StatusBadge status="live" /></Row>
              <Row label="Chain">{TOKEN_SPEC.chain}</Row>
              <Row label="Contract"><AddrLink addr={CONTRACTS.SYN_CONTRACT_ADDRESS} href={SYN_EXPLORERS.avascan} /></Row>
              <Row label="Total Supply">{TOKEN_SPEC.totalSupply.toLocaleString("en-US")} SYN</Row>
              <Row label="Decimals">{TOKEN_SPEC.decimals}</Row>
              <Row label="Mint / Tax / Admin / Pause / Blacklist">None</Row>
            </tbody>
          </table>
        </GlassCard>
      </Section>

      <Section id="allocation">
        <SectionHeader eyebrow="04 — Allocation Model" title="1,000,000,000 SYN across 7 allocations" />
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                <th className="py-3 px-4">Allocation</th>
                <th className="py-3 px-4 text-right">%</th>
                <th className="py-3 px-4 text-right">SYN</th>
                <th className="py-3 px-4">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {TOKENOMICS_ALLOCATION.map((a) => (
                <tr key={a.label} className="border-b border-border/20 last:border-0 align-top">
                  <td className="py-3 px-4 font-medium">{a.label}</td>
                  <td className="py-3 px-4 text-right mono">{a.pct}%</td>
                  <td className="py-3 px-4 text-right mono text-xs">{a.syn.toLocaleString("en-US")}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground max-w-md">{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </Section>

      <Section id="wallets">
        <SectionHeader eyebrow="05 — Wallet Registry" title="Seven public allocation wallets" description="See the full Protocol Registry for routing wallets and copy buttons." />
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                <th className="py-3 px-4">Allocation</th>
                <th className="py-3 px-4">Wallet</th>
                <th className="py-3 px-4 text-right">Expected SYN</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ALLOCATION_WALLETS).map(([label, addr]) => (
                <tr key={label} className="border-b border-border/20 last:border-0">
                  <td className="py-3 px-4">{label}</td>
                  <td className="py-3 px-4"><AddrLink addr={addr} href={explorerUrlForAddress(addr)} /></td>
                  <td className="py-3 px-4 text-right mono text-xs">{(ALLOCATION_EXPECTED_SYN[label] ?? 0).toLocaleString("en-US")} SYN</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
        <p className="mt-3 text-xs text-muted-foreground">
          Full registry with copy buttons and routing wallets:{" "}
          <Link to="/registry" className="underline-offset-4 hover:underline">Protocol Registry →</Link>
        </p>
      </Section>

      <Section id="sale">
        <SectionHeader eyebrow="06 — Membership Sale" title="USDC → SYN, splits 70/20/10 onchain" />
        <GlassCard className="p-6 text-sm text-foreground/85 leading-relaxed space-y-3">
          <p>
            The Membership Sale contract is the only canonical onramp from USDC to SYN.
            Fixed access rate: <span className="mono">{ACCESS_RATE_LABEL}</span>. Minimum buy:{" "}
            <span className="mono">${SALE_MIN_USDC} USDC</span>.
          </p>
          <p>
            Every purchase splits USDC at the contract: {VAULT_ALLOCATION.vaultAssets * 100}% to
            Vault, {VAULT_ALLOCATION.liquidityReinforcement * 100}% to Liquidity,{" "}
            {VAULT_ALLOCATION.operationsCommunity * 100}% to Operations. SYN is delivered from
            the Membership Distribution wallet.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <KV k="Sale contract"><AddrLink addr={CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS} href={explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS")} /></KV>
            <KV k="USDC"><AddrLink addr={CONTRACTS.USDC_CONTRACT_ADDRESS} href={explorerUrlFor("USDC_CONTRACT_ADDRESS")} /></KV>
            <KV k="Vault wallet (70%)"><AddrLink addr={CONTRACTS.VAULT_WALLET} href={explorerUrlFor("VAULT_WALLET")} /></KV>
            <KV k="Liquidity wallet (20%)"><AddrLink addr={CONTRACTS.LIQUIDITY_WALLET} href={explorerUrlFor("LIQUIDITY_WALLET")} /></KV>
            <KV k="Operations wallet (10%)"><AddrLink addr={CONTRACTS.OPERATIONS_WALLET} href={explorerUrlFor("OPERATIONS_WALLET")} /></KV>
            <KV k="Membership SYN wallet"><AddrLink addr={CONTRACTS.MEMBERSHIP_SYN_WALLET} href={explorerUrlForAddress(CONTRACTS.MEMBERSHIP_SYN_WALLET)} /></KV>
          </div>
        </GlassCard>
      </Section>

      <Section id="vault">
        <SectionHeader eyebrow="07 — Vault Architecture" title="Currently a public wallet" />
        <GlassCard className="p-6 text-sm text-foreground/85 leading-relaxed space-y-3">
          <p>
            The Vault currently holds USDC routed by the Membership Sale at the Vault wallet
            above. A programmatic Vault contract (deposits, withdrawals, accounting) is{" "}
            <StatusBadge status="pending" />.
          </p>
          <p>
            All Vault inflows are verifiable through the Vault wallet on Avascan.
          </p>
        </GlassCard>
      </Section>

      <Section id="liquidity">
        <SectionHeader eyebrow="08 — Liquidity Strategy" title="Trader Joe SYN/USDC LP — LIVE" />
        <GlassCard className="p-6 text-sm text-foreground/85 leading-relaxed space-y-3">
          <p>
            The first official liquidity pool for SYN is live on Trader Joe (classic AMM / JLP — not
            Liquidity Book). Initial liquidity: <span className="mono">200 SYN + 2 USDC</span> at
            <span className="mono"> $0.01</span>. Pool address:{" "}
            <a href={avascanAddressUrl("0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389") ?? "#"} target="_blank" rel="noopener noreferrer" className="mono underline-offset-4 hover:underline">0xe124…9389 ↗</a>.
          </p>
          <p>
            Status: <StatusBadge status="live" />. 20% of every USDC purchase accumulates at the
            Liquidity Wallet to progressively deepen the pool. Reserves, TVL, LP supply, and
            implied price are read live on <Link to="/liquidity" className="underline-offset-4 hover:underline">/liquidity</Link>.
          </p>
          <p className="text-xs text-muted-foreground">
            LP risks: impermanent loss, price movement, smart-contract risk, low-liquidity slippage,
            and total loss. Any future LP recognition is not promised, not yield, and not guaranteed.
          </p>
        </GlassCard>
      </Section>

      <Section id="governance">
        <SectionHeader eyebrow="09 — Governance" title="Snapshot / onchain — pending" />
        <GlassCard className="p-6 text-sm text-foreground/85 leading-relaxed">
          <p>
            Governance is <StatusBadge status="pending" />. Rank-weighted voting and proposal
            review will activate when the governance module deploys.
          </p>
        </GlassCard>
      </Section>

      <Section id="nft">
        <SectionHeader eyebrow="10 — NFT Layer" title="NFT layer — two public mints open" />
        <GlassCard className="p-6 text-sm text-foreground/85 leading-relaxed space-y-2">
          <p>The Archive1155 contract is <StatusBadge status="live" /> on Avalanche. The First Signal (ID 1) and the Patron Seal (ID 3) are both OPEN for public mint. Other Artifacts are protocol-memory surfaces sealed by event — they activate when the underlying on-chain event fires.</p>
          <p className="text-muted-foreground text-xs">
            The NFT layer is implemented as the <a href="/nft" className="underline-offset-4 hover:underline text-foreground">NFT Collection</a> — the collectible memory layer (Chapter Artifacts, Seat Records, Patron Seals, Milestone Artifacts, Liquidity Marks, Protocol Milestones, Secret Artifacts, Legacy Artifacts). Artifacts do not grant equity, debt, Vault ownership, dividends, revenue share, governance rights, or promises of profit.
          </p>
        </GlassCard>
      </Section>

      <Section id="archive">
        <SectionHeader eyebrow="10b — Archive" title="Memory layer around the seat — two mints open" />
        <GlassCard className="p-6 text-sm text-foreground/85 leading-relaxed space-y-3">
          <p>
            SYN is the seat. <strong>Artifacts are the memory.</strong> The Archive is an
            optional collectible memory layer for what happens around each seat: Chapter
            Artifacts, Seat Records, Genesis Founder Marks, Milestone Artifacts, Liquidity Marks,
            Protocol Milestones, Patron Seals, Secret Artifacts, and Legacy Artifacts.

          </p>
          <p>
            The Archive1155 contract is <StatusBadge status="live" /> on Avalanche. The First
            Signal (ID 1) is OPEN at 0.50 USDC (wallet limit 5) and the Patron Seal (ID 3) is OPEN at 5.00 USDC. Other Artifacts
            remain inactive. See
            {" "}<Link to="/nft" className="underline-offset-4 hover:underline">/nft</Link>{" "}
            to mint or browse, and
            {" "}<Link to="/my-syndicate" className="underline-offset-4 hover:underline">/my-syndicate</Link>{" "}
            for wallet-scoped status.
          </p>
          <p className="text-xs text-muted-foreground">
            Artifacts are collectible records only. They are not equity, debt, Vault ownership,
            dividend instruments, revenue share, governance rights, or promises of profit.
            Participation may result in total loss.
          </p>
        </GlassCard>
      </Section>


      <Section id="ai">
        <SectionHeader eyebrow="11 — AI Layer" title="Analyst · Governance · Risk — pending" />
        <GlassCard className="p-6 text-sm text-foreground/85 leading-relaxed">
          <p>The AI layer is conceptual and explicitly <StatusBadge status="pending" />.</p>
        </GlassCard>
      </Section>

      <Section id="roadmap">
        <SectionHeader eyebrow="12 — Roadmap" title="Derived from protocol status" />
        <p className="text-sm text-muted-foreground mb-3">
          The roadmap is derived from the same status config used here. See <Link to="/roadmap" className="underline-offset-4 hover:underline">/roadmap</Link>.
        </p>
      </Section>

      <Section id="registry">
        <SectionHeader eyebrow="13 — Contract Registry" title="All contracts in one place" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROTOCOL_STATUS.map((s) => (
            <GlassCard key={s.key} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">{s.label}</h3>
                <StatusBadge status={s.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.summary}</p>
            </GlassCard>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Full canonical registry: <Link to="/registry" className="underline-offset-4 hover:underline">Protocol Registry →</Link>
        </p>
      </Section>

      <Section id="verify">
        <SectionHeader eyebrow="14 — Verification Links" title="Independent explorers" />
        <div className="flex flex-wrap gap-3">
          {Object.entries(SYN_EXPLORERS).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="surface px-3 py-2 mono text-[11px] uppercase tracking-[0.18em] hover:border-[var(--gold)]/40 capitalize">
              {k} ↗
            </a>
          ))}
        </div>
      </Section>

      <Section id="faq">
        <SectionHeader eyebrow="15 — FAQ" title="Common questions" />
        <p className="text-sm text-muted-foreground">
          Full FAQ: <Link to="/faq" className="underline-offset-4 hover:underline">/faq</Link>
        </p>
      </Section>

      <Section>
        <div className="flex flex-wrap gap-3">
          <Pill tone="muted">Reference</Pill>
          <Link to="/registry" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Protocol Registry →</Link>
          <Link to="/transparency" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Transparency Center →</Link>
          <Link to="/tokenomics" className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline">Tokenomics →</Link>
        </div>
      </Section>
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="py-2.5 px-4 text-muted-foreground text-xs uppercase tracking-[0.16em] mono w-1/3">{label}</td>
      <td className="py-2.5 px-4 text-foreground">{children}</td>
    </tr>
  );
}
function KV({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 bg-background/40 px-3 py-2">
      <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k}</span>
      {children}
    </div>
  );
}
