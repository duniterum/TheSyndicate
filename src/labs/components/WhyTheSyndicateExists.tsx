import { Section, SectionHeader, GlassCard } from "@/components/syndicate/Primitives";

/**
 * WHY THE SYNDICATE EXISTS — mission-first opener.
 *
 * Per docs/VISION.md "MEMBER-FIRST PRINCIPLE": every page must answer
 * "why would someone want to become a member?" BEFORE "how does the
 * protocol work?". This section is the member-facing answer to that
 * question on the homepage. No tokenomics, no routing, no treasury — just
 * the mission and the identity.
 */
export function WhyTheSyndicateExists() {
  const pillars = [
    {
      eyebrow: "The problem",
      title: "Crypto promises trust. It rarely shows it.",
      body:
        "Most token projects ship 90% aspiration and 10% verifiable truth. Treasuries are off-chain. Routing is opaque. Insiders price-discover before the public arrives.",
    },
    {
      eyebrow: "Our answer",
      title: "A transparent on-chain protocol — built in public.",
      body:
        "The Syndicate does the inverse: every wallet public, every contract verifiable, every USDC routed atomically on Avalanche. Trust earned before scale.",
    },
    {
      eyebrow: "Who it's for",
      title: "Long-term builders. Not traders. Not tourists.",
      body:
        "Members who want to watch a protocol form from day one — treasury, liquidity, contracts, modules — and who measure success in years, not hours. Disciplined, early, ownership-oriented.",
    },
  ];

  return (
    <Section id="why-syndicate-exists">
      <SectionHeader
        eyebrow="Mission"
        title={
          <>
            Why <span className="text-gradient-gold">The Syndicate</span> exists
          </>
        }
        description="Before the routing diagrams, the live charts, and the contract addresses — the reason any of this is being built."
      />
      <div className="grid md:grid-cols-3 gap-5">
        {pillars.map((p) => (
          <GlassCard key={p.eyebrow} className="flex flex-col">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] mb-3">
              {p.eyebrow}
            </div>
            <h3 className="text-xl font-semibold mb-3 leading-snug text-foreground">
              {p.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
          </GlassCard>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground mono leading-relaxed">
        Mission first. Mechanics second. Everything below this section is the proof — wallets,
        routing, contracts, and live balances you can verify yourself.
      </p>
    </Section>
  );
}
