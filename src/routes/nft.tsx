// /nft — bespoke, artifact-first public route for The First Signal.
//
// The page component lives in components/syndicate/NftPage so this route file
// only exports `Route`, keeping the page code-split (P5). /nft is the preferred
// public SEO route; /nfts renders the same NftPage. /archive keeps its own
// ArchivePage layout and does NOT reuse this page.
import { createFileRoute } from "@tanstack/react-router";
import { NftPage } from "@/components/syndicate/NftPage";

export const Route = createFileRoute("/nft")({
  head: () => ({
    meta: [
      { title: "The First Signal — Chapter I NFT mint open · The Syndicate" },
      {
        name: "description",
        content:
          "The First Signal is the first public Artifact in The Syndicate Archive. Open for mint on Avalanche at 0.50 USDC, wallet limit 5. Rendered fully on-chain. Collectible record only — no financial rights.",
      },
      {
        property: "og:title",
        content: "The First Signal — Chapter I NFT mint open",
      },
      {
        property: "og:description",
        content:
          "The first public signal ever recorded inside The Syndicate Archive. Mint during Chapter I to become part of the permanent opening record. 0.50 USDC on Avalanche.",
      },
      { property: "og:url", content: "https://thesyndicate.money/nft" },
      { property: "twitter:card", content: "summary_large_image" },
      {
        property: "twitter:title",
        content: "The First Signal — Chapter I NFT mint open",
      },
      {
        property: "twitter:description",
        content:
          "The first public Artifact in The Syndicate Archive. Open on Avalanche at 0.50 USDC. Rendered fully on-chain.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://thesyndicate.money/nft" },
    ],
  }),
  component: NftPage,
});
