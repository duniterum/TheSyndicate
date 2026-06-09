import { Section, SectionHeader, GlassCard, CTAButton } from "@/components/syndicate/Primitives";

/**
 * WHY EARLY MATTERS — careful aspiration.
 *
 * Per docs/VISION.md "WHY EARLY MATTERS": frame early participation as
 * access to the formation of the protocol — treasury, liquidity, contracts,
 * community, modules — NEVER as a price advantage, guaranteed return, or
 * implied appreciation. Banned vocabulary stays banned here too.
 */
export function WhyEarlyMatters() {
  const moments = [
    {
      label: "Treasury formation",
      body: "Watch the Vault Wallet receive its first allocations, transaction by transaction.",
    },
    {
      label: "Liquidity formation",
      body: "See SYN/USDC depth deepen on-chain as each purchase reinforces the LP.",
    },
    {
      label: "Contract deployment",
      body: "Read every new module's source the day it ships — before it touches any funds.",
    },
    {
      label: "Community growth",
      body: "Recognise the first members. The archive remembers who showed up early.",
    },
    {
      label: "Module activation",
      body: "Vault automation, governance, NFTs, AI tooling — each one going from PENDING to LIVE in public.",
    },
  ];

  return (
    <Section id="why-early">
      <SectionHeader
        eyebrow="Why early matters"
        title={
          <>
            Early access is access to the <span className="text-gradient-gold">formation</span>,
            not to a price
          </>
        }
        description="There are no promised returns. No guaranteed appreciation. No implied upside. What early members get is a front-row seat to a protocol being built — and verified — in the open."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {moments.map((m, i) => (
          <GlassCard key={m.label} className="relative">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              Moment {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">{m.label}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{m.body}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5 border-border/60">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
          The honest version
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed">
          Early is fragile. The protocol is small. Liquidity is thin. Most planned modules are still
          PENDING. Participation can result in total loss. Being early is meaningful because the
          protocol is forming — and because you can verify, on-chain, that nothing is being hidden.
          It is not meaningful as a financial timing edge.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CTAButton variant="ghost" href="/transparency">
            Verify what is LIVE
          </CTAButton>
          <CTAButton variant="ghost" href="/roadmap">
            See what is PENDING
          </CTAButton>
        </div>
      </GlassCard>
    </Section>
  );
}
