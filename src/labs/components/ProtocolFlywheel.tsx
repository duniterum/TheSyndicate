// Protocol Flywheel — static visual. No promises, no numbers.

import { Section, SectionHeader } from "@/components/syndicate/Primitives";

const STEPS = [
  { n: "01", t: "Members join",           d: "Members buy SYN with USDC through the Membership Sale contract." },
  { n: "02", t: "Protocol revenue enters", d: "USDC enters the protocol and is routed atomically on-chain." },
  { n: "03", t: "Vault reserves grow",     d: "70% routes to the Vault Wallet — the long-term protocol reserve." },
  { n: "04", t: "Liquidity deepens",       d: "20% routes to the Liquidity Wallet to reinforce SYN/USDC LP depth on Trader Joe." },
  { n: "05", t: "Operations fund the build", d: "10% routes to the Operations Wallet — development, infrastructure, contributors." },
  { n: "06", t: "Protocol assets grow",    d: "Current Protocol-Controlled Assets increase over time." },
  { n: "07", t: "New revenue sources activate", d: "Planned sources move from PLANNED to LIVE as contracts deploy." },
  { n: "08", t: "Protocol becomes more useful", d: "More products, more verifiable activity, more reasons to join." },
];

export function ProtocolFlywheel() {
  return (
    <Section id="flywheel" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Protocol Flywheel"
        title={<>How the model <span className="text-gradient-gold">compounds over time</span></>}
        description="No promises. No yields. A simple model: revenue enters, is routed on-chain, becomes liquidity and reserves, and unlocks new revenue sources as the protocol expands."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {STEPS.map((s) => (
          <article key={s.n} className="surface elevated p-3">
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.n}</div>
            <div className="font-medium mt-1 text-sm">{s.t}</div>
            <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{s.d}</div>
          </article>
        ))}
      </div>
    </Section>
  );
}
