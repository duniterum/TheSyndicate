import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { RankHub } from "@/components/syndicate/RankHub";

export const Route = createFileRoute("/ranks")({
  head: () => ({
    meta: [
      { title: "Ranks — Where do I fit? | The Syndicate" },
      { name: "description", content: "Twelve ranks across four groups. See your current rank, the next one, and how the protocol is forming. Recognition only — never entitlement." },
      { property: "og:title", content: "The Syndicate — Where do I fit?" },
      { property: "og:description", content: "Twelve ranks, four groups, one question: where do I fit? Aggregate distribution, no leaderboards." },
      { property: "og:url", content: "https://thesyndicate.money/ranks" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/ranks" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://thesyndicate.money/" },
            { "@type": "ListItem", position: 2, name: "Ranks", item: "https://thesyndicate.money/ranks" },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="Ranks"
      title="Where do I fit?"
      description="Twelve ranks across four groups. Recognition, not entitlement. Derived live from on-chain purchase events."
    >
      <RankHub />
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  ),
});
