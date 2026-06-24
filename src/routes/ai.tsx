import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { GlassCard, Section, MetricExplainer } from "@/components/syndicate/Primitives";
import { PendingModuleNotice } from "@/components/syndicate/PendingModuleNotice";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Syndicate Layer — Pending | The Syndicate" },
      { name: "description", content: "Reserved future member tooling for The Syndicate. Not built, not live, and not part of current protocol totals." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "The Syndicate — AI Layer" },
      { property: "og:description", content: "Reserved future module. Not built or active." },
      { property: "og:url", content: "https://thesyndicate.money/ai" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/ai" }],
  }),
  component: () => (
    <PageShell eyebrow="AI Layer" title="AI Syndicate Layer" description="A future module that will give members AI tooling around the Vault and the network.">
      <Section>
        <GlassCard className="p-6 md:p-8">
          <PendingModuleNotice
            module="AI Syndicate Layer"
            subtitle="Planned protocol module. Not live today."
            secondary="Not included in live metrics or protocol totals. No contract, no claim, no waitlist."
          />
          <div className="mt-6">
            <MetricExplainer
              what="An optional member-facing layer of AI tooling built around the Vault, the protocol, and the on-chain network."
              why="To give members signal, analytics, and automation around participation — without changing how the protocol routes USDC, records receipts, or defines membership."
              how="Specs and contracts are not designed yet. Nothing is live. When work begins, every component will ship behind LIVE / PARTIAL / PENDING status with verifiable contract addresses."
              verify="No contract, no claim, no waitlist. Status: PENDING."
            />
          </div>
        </GlassCard>
      </Section>
    </PageShell>
  ),
});
