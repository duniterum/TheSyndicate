import { GlassCard, Pill, Section, SectionHeader, CTAButton } from "@/components/syndicate/Primitives";
import { TRANSPARENCY_ITEMS, type TransparencyStatus } from "@/lib/syndicate-config";

const STATUS_LABEL: Record<TransparencyStatus, string> = {
  live: "LIVE ONCHAIN",
  partial: "PARTIAL",
  pending: "PENDING CONTRACT",
};
const STATUS_TONE: Record<TransparencyStatus, "success" | "gold" | "muted"> = {
  live: "success",
  partial: "gold",
  pending: "muted",
};

export function HomeTransparencySnapshot() {
  return (
    <Section id="transparency">
      <SectionHeader
        eyebrow="Transparency Snapshot"
        title="What is live, confirmed, and pending"
        description="Eight modules. One status truth. Full breakdown lives in the Transparency Center."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRANSPARENCY_ITEMS.map((c) => (
          <GlassCard key={c.label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{c.label}</h3>
              <Pill tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Pill>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{c.detail}</p>
          </GlassCard>
        ))}
      </div>
      <div className="mt-6">
        <CTAButton variant="ghost" href="/transparency">See full Transparency Center →</CTAButton>
      </div>
    </Section>
  );
}
