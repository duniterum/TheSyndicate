import { Section, SectionHeader, GlassCard } from "@/components/syndicate/Primitives";

const steps = [
  {
    n: "01",
    title: "Join",
    body: "Buy SYN with USDC on Avalanche to become part of The Syndicate. Same fixed rate for everyone — no private allocations, no insider pricing.",
  },
  {
    n: "02",
    title: "Route",
    body: "Every USDC paid into the Membership Sale is split on-chain in the same transaction: 70% to the Vault Wallet, 20% to the Liquidity Wallet, 10% to the Operations Wallet.",
  },
  {
    n: "03",
    title: "Build",
    body: "Liquidity deepens. Treasury reserves grow. Planned revenue modules activate over time. The protocol compounds in public — visible from day one.",
  },
];

export function HowItWorks30s() {
  return (
    <Section id="how-it-works">
      <SectionHeader
        eyebrow="How it works — 30 seconds"
        title={<>From your USDC to <span className="text-gradient-gold">protocol-owned assets</span></>}
        description="No black box. Three on-chain steps. Every movement is verifiable on Avascan."
      />
      <div className="grid md:grid-cols-3 gap-5">
        {steps.map((s) => (
          <GlassCard key={s.n} className="relative">
            <div className="mono text-xs uppercase tracking-[0.25em] text-[var(--gold)] mb-3">
              Step {s.n}
            </div>
            <h3 className="text-2xl font-semibold mb-3">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
