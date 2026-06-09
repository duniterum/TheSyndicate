import { Section, SectionHeader, GlassCard } from "@/components/syndicate/Primitives";

/**
 * WHY BECOME A MEMBER — identity & participation, not investment.
 *
 * Per docs/VISION.md "THE SYNDICATE IDENTITY" + "TRUST + ASPIRATION BALANCE":
 * the emotional target is "I want to be part of building this" — never
 * "I want a quick profit". Aspiration is expressed through identity,
 * mission, and early participation, never through price language.
 */
const reasons = [
  {
    title: "An identity, not a position",
    body:
      "Membership is a signal of who you are — disciplined, long-term, builder-minded. It is recorded on-chain and remembered by the archive, not measured by a P&L.",
  },
  {
    title: "A seat at the formation",
    body:
      "Join while the protocol is still small enough to watch every wallet, every contract, every routing transaction. Most members will never get to see this stage.",
  },
  {
    title: "Aligned with everyone else",
    body:
      "Same fixed access rate. Same routing. Same wallets. Same contracts. No private allocations, no insider terms, no priority lanes for anyone — including the founder.",
  },
  {
    title: "Verifiable participation",
    body:
      "No hidden treasury, no invented metrics. Every major flow links to a block explorer. PENDING modules are labeled PENDING, not dressed up as LIVE.",
  },
  {
    title: "Part of a society, not a feed",
    body:
      "The Syndicate is closer to an onchain investor-relations society than a Telegram trading group. Quiet, durable, transparent — built for people measuring in years.",
  },
  {
    title: "A protocol that grows with you",
    body:
      "Vault automation, governance, NFTs, AI tooling — each future module ships in public, and members participate in their activation as they go from PENDING to LIVE.",
  },
];

export function WhyBecomeMember() {
  return (
    <Section id="why-member">
      <SectionHeader
        eyebrow="Why become a member"
        title={
          <>
            A seat inside a <span className="text-gradient-gold">transparent on-chain protocol</span>
          </>
        }
        description="Membership is participation, identity, and alignment — not a financial product. No guaranteed returns, no dividends, no yield promises. Only a verifiable position inside a protocol being built in the open by ambitious long-term builders."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reasons.map((r) => (
          <GlassCard key={r.title} className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-foreground">{r.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
          </GlassCard>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground mono leading-relaxed">
        Membership does not constitute a security, share, or claim on protocol revenue. SYN is a
        utility participation token in an early-stage on-chain protocol. Participation may result in
        total loss.
      </p>
    </Section>
  );
}
