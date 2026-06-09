import { Section, SectionHeader, GlassCard } from "@/components/syndicate/Primitives";

const contrasts = [
  { them: "Most projects ask for trust.", us: "The Syndicate shows the wallets." },
  { them: "Most projects show promises.", us: "The Syndicate shows on-chain routing." },
  { them: "Most projects hide treasury movement.", us: "The Syndicate labels every LIVE, PARTIAL and PENDING metric." },
  { them: "Most projects market first.", us: "The Syndicate verifies first." },
];

export function WhyDifferent() {
  return (
    <Section id="why-different">
      <SectionHeader
        eyebrow="Why this is different"
        title={<>Verification <span className="text-gradient-gold">before marketing</span></>}
        description="Most projects ask you to trust the pitch. The Syndicate is built for people who would rather verify the system."
      />
      <div className="grid md:grid-cols-2 gap-5">
        {contrasts.map((c) => (
          <GlassCard key={c.them}>
            <p className="text-sm text-muted-foreground line-through decoration-[color-mix(in_oklab,var(--muted-foreground)_40%,transparent)]">
              {c.them}
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">{c.us}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
