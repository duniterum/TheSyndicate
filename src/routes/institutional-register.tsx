// /institutional-register — the PUBLIC, read-only Institutional Register view (Sprint 7).
//
// The first safe public surface over the Institutional Register: durable protocol
// memory, exposed as a verifiable record. It renders ONLY active + draft entries
// (held/rejected stay internal in /labs), each with full lineage back to its
// on-chain transaction. It is NOT Story, NOT Recognition, NOT the public
// Chronicle, NOT governance, and not a claim of return or investment value — and
// it publishes nothing. Indexable and canonical, but kept restrained: reached via
// cross-links from the Registry and Chronicle, never the main navigation.

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { PagePurpose } from "@/components/syndicate/PagePurpose";
import { InstitutionalRegisterView } from "@/components/syndicate/InstitutionalRegisterView";
import { Pill, Section } from "@/components/syndicate/Primitives";
import { ProtocolMemoryPipeline } from "@/components/syndicate/ProtocolJourneySpine";

export const Route = createFileRoute("/institutional-register")({
  head: () => ({
    meta: [
      {
        title:
          "Protocol Institutional Register — Verified Protocol Memory | The Syndicate",
      },
      {
        name: "description",
        content:
          "The Protocol Institutional Register — a read-only record of verified protocol memory. Every entry is derived from an on-chain event and traces back to it. Not Story, not Recognition, not governance, and not investment value.",
      },
      { property: "og:title", content: "The Syndicate — Protocol Institutional Register" },
      {
        property: "og:description",
        content:
          "Verified protocol memory, read-only. Every entry traces to an on-chain event.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://thesyndicate.money/institutional-register" },
    ],
    links: [
      { rel: "canonical", href: "https://thesyndicate.money/institutional-register" },
    ],
  }),
  component: InstitutionalRegisterRoute,
});

function InstitutionalRegisterRoute() {
  return (
    <PageShell
      eyebrow="Institutional Register"
      title="Protocol Institutional Register"
      description="A read-only record of verified protocol memory. Each entry is derived from an on-chain protocol event and traces back to it. This is the protocol's durable institutional record — not Story, not Recognition, not governance, and not a claim of return or investment value."
    >
      <PagePurpose
        statement="The Institutional Register receives verified facts from the memory path and preserves what became institutional truth. Chronicle tells the story; the Register keeps the durable record."
        distinctions={[
          { label: "Contract Registry", to: "/registry" },
          { label: "Chronicle", to: "/chronicle" },
        ]}
      />

      <ProtocolMemoryPipeline compact />
      <InstitutionalRegisterView />

      <Section id="more">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="muted">Cross-references</Pill>
          <Link
            to="/knowledge-map"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          >
            Knowledge Map →
          </Link>
          <Link
            to="/registry"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          >
            Contract Registry →
          </Link>
          <Link
            to="/chronicle"
            className="mono text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          >
            Chronicle →
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
