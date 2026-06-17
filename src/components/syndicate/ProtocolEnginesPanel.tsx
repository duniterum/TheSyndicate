// Protocol Engines panel — an honest status board for what the protocol runs.
//
// Static projection of engine state. Each engine is labeled by its real maturity:
//   LIVE    — on-chain and verifiable today (links to its proof surface)
//   PREVIEW — staged, not yet live (no link, amber)
//   FUTURE  — direction, not deployed (no link, muted)
//
// Tone is deliberate: status is encoded ONLY in emerald / amber / muted — never
// gold (gold is identity, not a status) and never red (red is risk). Gold appears
// only as the generic interactive hover accent, matching the rest of the site.
// This panel does NOT wire the protocol-actions shell; it makes no new claim.

import { Section, SectionHeader } from "./Primitives";

type EngineStatus = "LIVE" | "PREVIEW" | "FUTURE";

type Engine = {
  key: string;
  label: string;
  status: EngineStatus;
  blurb: string;
  href?: string;
};

const ENGINES: Engine[] = [
  {
    key: "sale",
    label: "Membership Sale",
    status: "LIVE",
    blurb: "USDC → SYN, routed 70 / 20 / 10 on-chain.",
    href: "/transparency",
  },
  {
    key: "vault",
    label: "Vault Wallet",
    status: "LIVE",
    blurb: "70% of every purchase routes to a public on-chain wallet.",
    href: "/vault",
  },
  {
    key: "liquidity",
    label: "Liquidity",
    status: "LIVE",
    blurb: "20% deepens the SYN / USDC pool on Trader Joe.",
    href: "/liquidity",
  },
  {
    key: "burn",
    label: "Burn",
    status: "LIVE",
    blurb: "Supply sent to the dead address — Proof of Burn.",
    href: "/activity",
  },
  {
    key: "nft",
    label: "NFT / Artifacts",
    status: "LIVE",
    blurb: "Archive artifacts minted on-chain.",
    href: "/nft",
  },
  {
    key: "referral",
    label: "Referral",
    status: "PREVIEW",
    blurb: "Commission routing — staged, not yet live.",
  },
  {
    key: "marketplace",
    label: "Marketplace",
    status: "FUTURE",
    blurb: "Secondary identity surfaces — direction, not deployed.",
  },
];

const STATUS_STYLE: Record<EngineStatus, { dot: string; chip: string }> = {
  LIVE: {
    dot: "bg-emerald-500",
    chip: "border-emerald-500/40 text-emerald-400 bg-emerald-500/[0.06]",
  },
  PREVIEW: {
    dot: "bg-amber-400",
    chip: "border-amber-500/40 text-amber-300 bg-amber-500/[0.06]",
  },
  FUTURE: {
    dot: "bg-muted-foreground/50",
    chip: "border-border/60 text-muted-foreground bg-foreground/[0.02]",
  },
};

export function ProtocolEnginesPanel() {
  return (
    <Section id="protocol-engines">
      <SectionHeader
        eyebrow="Protocol engines"
        title={<>What is <span className="text-gradient-gold">running</span></>}
        description="Each engine is labeled by its real state: LIVE engines are on-chain and verifiable today; PREVIEW is staged; FUTURE is direction, not deployed."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {ENGINES.map((e) => (
          <EngineCard key={e.key} engine={e} />
        ))}
      </div>
    </Section>
  );
}

function EngineCard({ engine }: { engine: Engine }) {
  const s = STATUS_STYLE[engine.status];
  const inner = (
    <div
      className={`surface p-4 h-full flex flex-col gap-2 transition-colors ${
        engine.href ? "hover:border-[var(--gold)]/40" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {engine.label}
        </span>
        <span
          className={`mono inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.16em] ${s.chip}`}
        >
          <span className={`size-1.5 rounded-full ${s.dot}`} />
          {engine.status}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{engine.blurb}</p>
      {engine.href && (
        <span className="mono mt-auto text-[9px] uppercase tracking-[0.18em] text-[var(--navy-soft)] group-hover:text-[var(--gold)] transition-colors">
          Open →
        </span>
      )}
    </div>
  );

  return engine.href ? (
    <a href={engine.href} aria-label={`Open ${engine.label}`} className="block group">
      {inner}
    </a>
  ) : (
    inner
  );
}
