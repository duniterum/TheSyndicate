import { Section, SectionHeader, GlassCard, StatusPill, CTAButton } from "@/components/syndicate/Primitives";

/**
 * WhyJoinNow — Phase D conversion section.
 *
 * Answers the question: "Why join NOW instead of bookmarking and leaving?"
 *
 * Truth-only framing: no profit language, no yield, no appreciation, no
 * investment promise. The reasons are visibility, participation, transparency,
 * watching the protocol form publicly, being part of the early archive.
 */
export function WhyJoinNow() {
  const reasons = [
    {
      eyebrow: "01 · Early formation",
      title: "The protocol is forming in public",
      body:
        "SYN, the Membership Sale, routing wallets, and the SYN/USDC pool are all live today. Joining now means joining while the archive is still small enough that every wallet is legible.",
      status: "LIVE" as const,
      verifyHref: "/transparency",
      verifyLabel: "Verify the live state",
    },
    {
      eyebrow: "02 · Visible identity",
      title: "Your seat is recorded onchain, publicly",
      body:
        "Every buyer is counted by the Sale contract. Members can be looked up onchain. The earlier you arrive, the longer your participation lives in the public archive — not as a yield position, as a chapter marker.",
      status: "LIVE" as const,
      verifyHref: "/registry",
      verifyLabel: "Open the registry",
    },
    {
      eyebrow: "03 · Same access for everyone",
      title: "No private allocations, no insider price",
      body:
        "Fixed access rate of 1 SYN = $0.01 USDC. The same for a $5 entry and a $5,000 entry. Larger entries change visible capital footprint — never bonus tokens, a cheaper price, or a bought title.",
      status: "LIVE" as const,
      verifyHref: "/tokenomics",
      verifyLabel: "See the tokenomics",
    },
    {
      eyebrow: "04 · Watch the engine compound",
      title: "Routing is atomic, on-chain, and public",
      body:
        "70% of every USDC paid routes to the Vault wallet, 20% to the Liquidity wallet, 10% to Operations — in the same transaction as the SYN delivery. Joining early lets you watch each chapter of the balance sheet form.",
      status: "LIVE" as const,
      verifyHref: "/vault",
      verifyLabel: "Open the Vault",
    },
  ];

  return (
    <Section id="why-join-now">
      <SectionHeader
        eyebrow="Why join now"
        title={
          <>
            Early enough to <span className="text-gradient-gold">matter</span>
          </>
        }
        description="Not because of price, return, or future appreciation. Because the protocol is forming in public, the archive is still small, and every routing transaction can be verified by anyone."
      />

      <div className="grid md:grid-cols-2 gap-5">
        {reasons.map((r) => (
          <GlassCard key={r.eyebrow}>
            <div className="flex items-center justify-between gap-3">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {r.eyebrow}
              </div>
              <StatusPill status={r.status} />
            </div>
            <h3 className="mt-3 text-xl md:text-2xl font-semibold tracking-tight text-foreground">
              {r.title}
            </h3>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              {r.body}
            </p>
            <a
              href={r.verifyHref}
              className="mt-4 inline-flex mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)] transition-colors"
            >
              {r.verifyLabel} →
            </a>
          </GlassCard>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <CTAButton variant="gold" href="/join">Join The Syndicate →</CTAButton>
        <CTAButton variant="ghost" href="/transparency">Verify before you join</CTAButton>
      </div>

      <p className="mt-6 text-xs text-muted-foreground max-w-3xl leading-relaxed">
        SYN is an experimental utility membership token. It is not equity, debt, Vault ownership, a
        dividend instrument, or a promise of profit. Participation may result in total loss. Every
        reason on this page is about visibility and the archive — not about returns.
      </p>
    </Section>
  );
}
