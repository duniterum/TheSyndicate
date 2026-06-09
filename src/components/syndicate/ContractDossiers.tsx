// Institutional-grade contract dossiers for /registry.
// Static metadata is sourced from docs/MASTER_PROTOCOL_CONTEXT.md.
// PENDING for anything not yet verifiable from chain or trusted source.

import {
  CONTRACTS,
  LP_POOL,
  SYN_EXPLORERS,
  explorerUrlFor,
  explorerUrlForAddress,
  extrasForAddress,
  txExplorerUrl,
  SALE_DEPLOYMENT_BLOCK,
} from "@/lib/syndicate-config";
import { routescanContractCodeUrl, snowtraceTokenUrl } from "@/lib/chain-registry";
import { ContractLink, GlassCard, Section, SectionHeader, Pill, StatusPill } from "./Primitives";

type Dossier = {
  label: string;
  address: string;
  explorerHref: string | null;
  network: string;
  chainId: number;
  deployment: { kind: "block" | "tx" | "pending"; value: string; href?: string };
  verified: "yes" | "partial" | "no" | "pending";
  verificationSources: Array<{ label: string; href: string }>;
  ownerLabel: string;
  upgradeable: "no" | "yes" | "pending";
  standard: string;
  description: string;
  status: "live" | "pending";
};

const DOSSIERS: Dossier[] = [
  {
    label: "SYN Token (ERC20·Burnable·Permit)",
    address: CONTRACTS.SYN_CONTRACT_ADDRESS,
    explorerHref: SYN_EXPLORERS.avascan,
    network: "Avalanche C-Chain",
    chainId: 43114,
    deployment: { kind: "block", value: "Genesis mint · fixed 1,000,000,000 SYN" },
    verified: "yes",
    verificationSources: [
      { label: "Sourcify", href: SYN_EXPLORERS.sourcify },
      { label: "Routescan", href: SYN_EXPLORERS.routescan },
      { label: "SnowTrace", href: SYN_EXPLORERS.snowtrace },
      { label: "Avascan", href: SYN_EXPLORERS.avascan },
    ],
    ownerLabel: "Renounced · no admin · no mint · no pause · no blacklist · no tax",
    upgradeable: "no",
    standard: "ERC20 · Burnable · Permit · fixed supply",
    description:
      "Immutable utility token. Total supply fixed at 1,000,000,000 minted at genesis. Distributed across seven public allocation wallets.",
    status: "live",
  },
  {
    label: "SyndicateMembershipSale",
    address: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS,
    explorerHref: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
    network: "Avalanche C-Chain",
    chainId: 43114,
    deployment: { kind: "block", value: `Block ${SALE_DEPLOYMENT_BLOCK.toString()} · creation tx` , href: txExplorerUrl("0x30e1378a66dc1037d49cb7557a162635f37a90ffde80e973bd9750d39927bdb6") },
    verified: "yes",
    verificationSources: [
      { label: "Routescan", href: routescanContractCodeUrl(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS) ?? "" },
      { label: "Avascan", href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS") ?? "" },
    ],
    ownerLabel: "Deployer · permitted to pause and seed inventory only · cannot mint, cannot change price",
    upgradeable: "no",
    standard: "Custom · routes USDC 70/20/10 onchain · 1 SYN = $0.01 USDC fixed",
    description:
      "Accepts USDC and dispatches SYN from the Membership Distribution wallet. Splits every USDC across Vault (70%), Liquidity (20%), Operations (10%) in the same transaction. Emits TokensPurchased.",
    status: "live",
  },
  {
    label: "USDC (Native Avalanche)",
    address: CONTRACTS.USDC_CONTRACT_ADDRESS,
    explorerHref: explorerUrlFor("USDC_CONTRACT_ADDRESS"),
    network: "Avalanche C-Chain",
    chainId: 43114,
    deployment: { kind: "pending", value: "Issued by Circle · third-party contract" },
    verified: "yes",
    verificationSources: [
      { label: "SnowTrace", href: snowtraceTokenUrl(CONTRACTS.USDC_CONTRACT_ADDRESS) ?? "" },
    ],
    ownerLabel: "Circle Inc. · external issuer · Syndicate has no privileges",
    upgradeable: "yes",
    standard: "ERC20 · proxy · 6 decimals",
    description:
      "Native (non-bridged) USDC issued by Circle on Avalanche. Used as the payment token in the Membership Sale.",
    status: "live",
  },
  {
    label: "Trader Joe v1 · SYN/USDC pair",
    address: LP_POOL.pairAddress,
    explorerHref: explorerUrlForAddress(LP_POOL.pairAddress),
    network: "Avalanche C-Chain",
    chainId: 43114,
    deployment: { kind: "tx", value: "Pair-creation transaction", href: txExplorerUrl(LP_POOL.creationTx) },
    verified: "yes",
    verificationSources: [
      { label: "Trader Joe", href: LP_POOL.traderJoeUrl },
      { label: "DexScreener", href: `https://dexscreener.com/avalanche/${LP_POOL.pairAddress}` },
    ],
    ownerLabel: "None · permissionless AMM · factory-deployed",
    upgradeable: "no",
    standard: "Uniswap V2 / JLP AMM pair",
    description: `Live SYN/USDC AMM. Seed liquidity: ${LP_POOL.initialSyn} SYN + ${LP_POOL.initialUsdc} USDC @ $${LP_POOL.initialPriceUsd}.`,
    status: "live",
  },
  {
    label: "Vault Contract (programmatic)",
    address: "PENDING",
    explorerHref: null,
    network: "Avalanche C-Chain (planned)",
    chainId: 43114,
    deployment: { kind: "pending", value: "Not deployed · funds currently held at the Vault wallet" },
    verified: "pending",
    verificationSources: [],
    ownerLabel: "—",
    upgradeable: "pending",
    standard: "Programmatic vault · spec drafting",
    description:
      "Future on-chain Vault. Until deployed, Vault USDC + SYN are held in the public Vault wallet, fully verifiable.",
    status: "pending",
  },
  {
    label: "Genesis NFT Contract",
    address: "PENDING",
    explorerHref: null,
    network: "Avalanche C-Chain (planned)",
    chainId: 43114,
    deployment: { kind: "pending", value: "Not deployed" },
    verified: "pending",
    verificationSources: [],
    ownerLabel: "—",
    upgradeable: "pending",
    standard: "ERC721 (planned)",
    description: "Achievement NFTs for member milestones. Spec frozen pending Phase 5.",
    status: "pending",
  },
  {
    label: "Governance Module",
    address: "PENDING",
    explorerHref: null,
    network: "Avalanche C-Chain (planned)",
    chainId: 43114,
    deployment: { kind: "pending", value: "Not deployed · Snapshot for soft signaling only" },
    verified: "pending",
    verificationSources: [],
    ownerLabel: "—",
    upgradeable: "pending",
    standard: "Snapshot → onchain (planned)",
    description: "Onchain governance with proposal lifecycle and weighted voting.",
    status: "pending",
  },
];

export function ContractDossiers() {
  return (
    <Section id="dossiers">
      <SectionHeader
        eyebrow="02b — Contract Dossiers"
        title={<>Full <span className="text-gradient-gold">verification record</span></>}
        description="Every contract listed with verification status, deployment, owner, upgradeability, standard, and source links. Anything not yet deployed is explicitly PENDING."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {DOSSIERS.map((d) => (
          <DossierCard key={d.label} d={d} />
        ))}
      </div>
    </Section>
  );
}

function DossierCard({ d }: { d: Dossier }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{d.label}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{d.description}</p>
        </div>
        <StatusBadge status={d.status} />
      </div>

      <div className="mb-3">
        <ContractLink
          address={d.address}
          explorerHref={d.explorerHref}
          extras={extrasForAddress(d.address)}
        />
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
        <Field label="Network" value={`${d.network} · ${d.chainId}`} />
        <Field label="Verified" value={verifiedLabel(d.verified)} />
        <Field label="Upgradeable" value={upgradeableLabel(d.upgradeable)} />
        <Field label="Standard" value={d.standard} />
        <Field
          label="Deployment"
          value={d.deployment.value}
          href={d.deployment.href}
        />
        <Field label="Owner / Admin" value={d.ownerLabel} />
      </dl>

      {d.verificationSources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">Source / Verification</div>
          <div className="flex flex-wrap gap-1.5">
            {d.verificationSources.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-[9px] uppercase tracking-[0.16em] rounded border border-border/60 px-1.5 py-0.5 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/60"
              >
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  const v = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)] underline-offset-4 hover:underline">{value} ↗</a>
  ) : (
    value
  );
  return (
    <>
      <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="text-foreground break-words">{v}</dd>
    </>
  );
}

function StatusBadge({ status }: { status: "live" | "pending" }) {
  return <StatusPill status={status === "live" ? "LIVE" : "PENDING"} />;
}


function verifiedLabel(v: Dossier["verified"]) {
  if (v === "yes") return "Yes · multi-source";
  if (v === "partial") return "Partial";
  if (v === "no") return "No";
  return "PENDING";
}

function upgradeableLabel(v: Dossier["upgradeable"]) {
  if (v === "no") return "No · immutable bytecode";
  if (v === "yes") return "Yes · upgradeable proxy";
  return "PENDING";
}
