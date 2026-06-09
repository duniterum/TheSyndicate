import { Section, SectionHeader, GlassCard } from "./Primitives";

/**
 * WHY JOIN — Conversion Wave (Wave 2, Priority 1).
 *
 * Plain language. No rewards, no returns, no yield, no profit, no scarcity.
 * Six human reasons answering: "Why should I join?"
 *
 * Sits high on the homepage so visitors hit the WHY before the protocol mechanics.
 */
const reasons = [
  {
    n: "01",
    title: "Be part of the story, early",
    body:
      "The Syndicate is forming in public. Joining now means joining while the archive is still small — every wallet, every transaction, every chapter is still visible from the beginning.",
  },
  {
    n: "02",
    title: "Get recorded, permanently",
    body:
      "Your membership is written to the blockchain. Your member number, your chapter, the day you joined — kept by the network, not by us. Nothing to edit, nothing to delete.",
  },
  {
    n: "03",
    title: "See where every dollar goes",
    body:
      "When you pay, the same transaction splits your USDC across three public wallets. You can open the link, follow the money, and confirm it with your own eyes.",
  },
  {
    n: "04",
    title: "Have a verifiable identity",
    body:
      "Every member gets a public page tied to their wallet — chapter, member number, history. Quiet, factual, on-chain. Yours forever.",
  },
  {
    n: "05",
    title: "Participate, don't speculate",
    body:
      "Joining is an act of participation in something being built openly. Not a position. Not a bet. A seat in a transparent society of people measuring in years.",
  },
  {
    n: "06",
    title: "Same terms for everyone",
    body:
      "No private rounds. No insider rate. No early-access tiers. The founder pays the same price you do. The protocol treats every member the same way.",
  },
];

export function WhyJoinSimple() {
  return (
    <Section id="why-join">
      <SectionHeader
        eyebrow="Why join"
        title={
          <>
            Six reasons to <span className="text-gradient-gold">become a member</span>
          </>
        }
        description="Not about returns. Not about yield. About being part of a protocol that builds in public, records its members on-chain, and lets anyone verify it on-chain."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reasons.map((r) => (
          <GlassCard key={r.n} className="flex flex-col">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] mb-2">
              {r.n}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">{r.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
          </GlassCard>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground leading-relaxed max-w-3xl">
        Honest disclaimer: SYN is an experimental utility membership token. It is not equity,
        not a security, and not a promise of profit. Joining may result in total loss.
      </p>
    </Section>
  );
}
