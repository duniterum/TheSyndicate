import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { RankHub } from "@/components/syndicate/RankHub";

export const Route = createFileRoute("/ranks")({
  head: () => ({
    meta: [
      { title: "Contribution Depth — Capital Footprint | The Syndicate" },
      { name: "description", content: "Capital-footprint bands reflect verified USDC routed through receipts. Seat identity stays binary; contribution depth is one recognition axis only." },
      { property: "og:title", content: "The Syndicate — Contribution Depth" },
      { property: "og:description", content: "Verified capital footprint, aggregate distribution, no leaderboards, no bought titles." },
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
            { "@type": "ListItem", position: 2, name: "Contribution Depth", item: "https://thesyndicate.money/ranks" },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="Contribution Depth"
      title="Capital footprint, not member identity"
      description="Seat identity is binary. Contribution depth is variable. Capital footprint reflects verified USDC routed through receipts — one recognition axis, never a payout or entitlement."
    >
      <RankHub />
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  ),
});
