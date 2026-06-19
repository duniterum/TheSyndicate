// Registry Trust Opener — sits at the top of /registry.
// Skeptic-friendly: "every contract, every address, click to verify."
// Four large canonical contract cards. No fake addresses, no PENDING padding.
import { useState } from "react";
import {
  CONTRACTS,
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  SYN_EXPLORERS,
  ARCHIVE_NFT_EXPLORERS,
  explorerUrlFor,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";
import { GlassCard, Pill, Section, SectionHeader, StatusPill } from "./Primitives";

type TrustCard = {
  role: string;
  label: string;
  address: string;
  explorerHref: string | null;
  source: "LIVE" | "INDEXED" | "LOCAL";
  description: string;
};

const TRUST_CARDS: TrustCard[] = [
  {
    role: "01 · Seat token",
    label: "SYN Token (ERC-20)",
    address: CONTRACTS.SYN_CONTRACT_ADDRESS,
    explorerHref: SYN_EXPLORERS.avascan,
    source: "LIVE",
    description: "Fixed 1,000,000,000 supply. No admin, no mint, no tax, no pause.",
  },
  {
    role: "02 · Membership Sale",
    label: "Membership Sale (USDC → SYN)",
    address: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS,
    explorerHref: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
    source: "LIVE",
    description: "Routes every USDC 70% Vault / 20% Liquidity / 10% Operations on-chain.",
  },
  {
    role: "03 · Archive",
    label: "SyndicateArchive1155",
    address: ARCHIVE_NFT_CONTRACT_ADDRESS,
    explorerHref: ARCHIVE_NFT_EXPLORERS.avascan,
    source: "LIVE",
    description: "ID 1 (First Signal) is open; ID 3 (Patron Seal) is contract/read gated by live Archive1155 reads.",
  },
  {
    role: "04 · Payment token",
    label: "USDC (native Avalanche)",
    address: CONTRACTS.USDC_CONTRACT_ADDRESS,
    explorerHref: explorerUrlFor("USDC_CONTRACT_ADDRESS"),
    source: "LIVE",
    description: "Canonical USDC on Avalanche C-Chain — used for every purchase.",
  },
];

const short = (a: string) => `${a.slice(0, 10)}…${a.slice(-8)}`;

export function RegistryTrustOpener() {
  return (
    <Section id="trust-opener">
      <SectionHeader
        eyebrow="Trust opener"
        title={<>Every contract. Every address. <span className="text-gradient-gold">Click to verify.</span></>}
        description="These are the four canonical contracts that make The Syndicate run. Each address is rendered from the same source of truth that powers every page, and each link opens Avascan."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRUST_CARDS.map((c) => (
          <TrustCardView key={c.address} card={c} />
        ))}
      </div>
    </Section>
  );
}

function TrustCardView({ card }: { card: TrustCard }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(card.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };
  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
          {card.role}
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="muted">{card.source}</Pill>
          <StatusPill status="LIVE" />
        </div>
      </div>
      <h3 className="text-lg font-semibold leading-tight">{card.label}</h3>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={card.explorerHref ?? explorerUrlForAddress(card.address) ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-xs text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline break-all"
        >
          {short(card.address)} ↗
        </a>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${card.label} address`}
          className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2 py-1 hover:border-[var(--gold)]/50 hover:text-foreground transition-colors"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
    </GlassCard>
  );
}
