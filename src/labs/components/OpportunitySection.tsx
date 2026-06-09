// The Syndicate Opportunity — copy-only context section.
// No benchmarks unless sourced. No comparisons to other protocols.

import { Section, SectionHeader } from "@/components/syndicate/Primitives";

const POINTS = [
  {
    t: "Verifiable accumulation",
    d: "Protocols become stronger when they accumulate on-chain assets that anyone can verify. The Syndicate publishes every wallet, every routing, and every balance.",
  },
  {
    t: "Trust through transparency",
    d: "Small but real numbers, sourced from chain, beat large unverifiable ones. Every metric is LIVE, PARTIAL, or PENDING — never invented.",
  },
  {
    t: "Multiple revenue streams over time",
    d: "Today the protocol earns from Membership Sales. Planned sources (LP fees, treasury deployment, NFT, services, partnerships) will activate as their contracts deploy.",
  },
  {
    t: "Early stage, on purpose",
    d: "Joining early is joining a protocol whose asset base, liquidity, and revenue surface are in their first chapter — and entirely public.",
  },
];

export function OpportunitySection() {
  return (
    <Section id="opportunity" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="The Syndicate Opportunity"
        title={<>Why this <span className="text-gradient-gold">matters now</span></>}
        description="A short, plain-language framing. Nothing here is a forecast, return promise, or solicitation."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {POINTS.map((p) => (
          <article key={p.t} className="surface elevated p-4">
            <h3 className="font-semibold text-foreground">{p.t}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{p.d}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
