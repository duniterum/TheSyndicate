import { Section, SectionHeader, GlassCard, Pill } from "@/components/syndicate/Primitives";

const today = [
  "Membership and participation token on Avalanche",
  "Fixed supply, transparent on-chain routing",
  "Live Membership Sale at a fixed rate",
  "Tradable SYN/USDC pool on Trader Joe",
  "Access to the current Syndicate ecosystem",
];

const planned = [
  "Future access modules",
  "Protocol-owned liquidity fee revenue",
  "Treasury deployment revenue",
  "NFT and vault integrations (if deployed)",
  "Governance-related modules (if deployed)",
  "Ecosystem roles and partner revenue",
];

const never = [
  "No guaranteed return",
  "No dividend or profit share",
  "No shareholder claim",
  "No guaranteed yield or appreciation",
  "No hidden entitlement or backroom terms",
  "No fabricated revenue or fake metrics",
];

function Column({
  status,
  tone,
  title,
  items,
}: {
  status: "LIVE" | "PLANNED" | "NEVER";
  tone: "gold" | "navy" | "muted";
  title: string;
  items: string[];
}) {
  const ring =
    tone === "gold"
      ? "border-[color-mix(in_oklab,var(--gold)_35%,transparent)]"
      : tone === "navy"
        ? "border-[color-mix(in_oklab,var(--navy)_45%,transparent)]"
        : "border-border";
  return (
    <GlassCard className={`border ${ring}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Pill tone={tone}>{status}</Pill>
      </div>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it} className="text-sm text-muted-foreground flex gap-2">
            <span className="text-[var(--gold)] mt-0.5">›</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

export function WhatSynDoes() {
  return (
    <Section id="what-syn-does">
      <SectionHeader
        eyebrow="What SYN does"
        title={<>SYN <span className="text-gradient-gold">today, planned, and never</span></>}
        description="A clear, honest contract with the visitor. What the token is, what it might become, and what it will never claim to be."
      />
      <div className="grid md:grid-cols-3 gap-5">
        <Column status="LIVE" tone="gold" title="SYN Today" items={today} />
        <Column status="PLANNED" tone="navy" title="SYN Planned" items={planned} />
        <Column status="NEVER" tone="muted" title="SYN Never" items={never} />
      </div>
    </Section>
  );
}
