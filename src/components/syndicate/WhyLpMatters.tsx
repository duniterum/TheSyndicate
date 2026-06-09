// Liquidity page — lead with WHY before WHAT. Three plain-language cards
// followed by a one-line aspiration. Designed to replace the dry technical
// opening on /liquidity.

import { Section, SectionHeader, GlassCard } from "./Primitives";

const POINTS = [
  {
    title: "LP makes SYN tradable",
    body: "Without a liquidity pool, SYN can only be bought through the Membership Sale. The LP lets anyone trade SYN against USDC, any time, with no permission.",
  },
  {
    title: "Deeper LP = stable price",
    body: "Every USDC added to the pool reduces slippage for the next buyer. The deeper the pool, the more predictable price discovery becomes for the whole protocol.",
  },
  {
    title: "Early LPs shape the pool",
    body: "Every USDC added to the pool reduces slippage for the next buyer. Early liquidity providers shape how SYN trades for everyone who comes after — no yield, no guarantees, no entitlement.",
  },
];

export function WhyLpMatters() {
  return (
    <Section id="why-lp-matters">
      <SectionHeader
        eyebrow="Why Liquidity"
        title={<>LP is what makes SYN <span className="text-gradient-gold">tradable</span></>}
        description="Before any chart, reserve number, or APR — understand why a liquidity pool exists at all. The pool below is small on purpose: every early LP shapes how SYN trades for everyone who comes after."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {POINTS.map((p) => (
          <GlassCard key={p.title} className="p-5">
            <h3 className="text-sm font-semibold">{p.title}</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{p.body}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
