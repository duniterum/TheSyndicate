import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { FaqRebuilt } from "@/components/syndicate/FaqRebuilt";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — The Syndicate" },
      { name: "description", content: "Structured, searchable answers about SYN, the Membership Sale, the Vault, liquidity, ranks, and risk." },
      { property: "og:title", content: "The Syndicate — FAQ" },
      { property: "og:description", content: "Honest, structured answers about the token, the sale, the Vault, and the risk." },
      { property: "og:url", content: "https://thesyndicate.money/faq" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/faq" }],
  }),
  component: () => (
    <PageShell
      eyebrow="FAQ"
      title="Frequently asked questions"
      description="Search by keyword, filter by topic, expand any question. Every answer is aligned with what is live, pending, and planned on-chain."
    >
      <FaqRebuilt />
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  ),
});
