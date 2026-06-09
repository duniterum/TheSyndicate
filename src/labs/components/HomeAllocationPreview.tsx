import { TOKENOMICS_ALLOCATION } from "@/lib/syndicate-config";
import { GlassCard, Section, SectionHeader, CTAButton } from "@/components/syndicate/Primitives";

export function HomeAllocationPreview() {
  return (
    <Section id="allocation-preview">
      <SectionHeader
        eyebrow="Allocation Preview"
        title="1,000,000,000 SYN · seven public wallets"
        description="Initial mint confirmed onchain. Full tokenomics and wallet links live on the Tokenomics page."
      />
      <GlassCard className="p-2 overflow-hidden">
        <ul className="divide-y divide-border/60">
          {TOKENOMICS_ALLOCATION.map((a) => (
            <li key={a.label} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
              <div className="col-span-7 md:col-span-6">
                <div className="font-medium">{a.label}</div>
                <div className="text-xs text-muted-foreground hidden md:block">{a.description}</div>
              </div>
              <div className="col-span-2 md:col-span-2 mono text-sm">{a.pct}%</div>
              <div className="col-span-3 md:col-span-4 mono text-xs text-right text-muted-foreground">
                {a.syn.toLocaleString("en-US")} SYN
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
      <div className="mt-6">
        <CTAButton variant="ghost" href="/tokenomics">View Full Tokenomics →</CTAButton>
      </div>
    </Section>
  );
}
