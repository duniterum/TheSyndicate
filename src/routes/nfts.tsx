// /nfts — alias of /nft (plural). Renders the same NFT Archive experience.
//
// This replaces the prior stale "Genesis NFTs — Eligibility Scaffold"
// page (which claimed the NFT contract was not deployed). The Archive
// contract is now DEPLOYED on Avalanche; the public route is /nft.
// /nfts is kept as a valid alias for any existing inbound links and
// search results, with a canonical pointing to /nft.
import { createFileRoute } from "@tanstack/react-router";
import { NftPage } from "@/components/syndicate/NftPage";

export const Route = createFileRoute("/nfts")({
  head: () => ({
    meta: [
      { title: "The Syndicate NFTs — First Signal & Patron Seal mints open on Avalanche" },
      {
        name: "description",
        content:
          "Collectible NFT Artifacts for The Syndicate. Two public mints open on Avalanche: The First Signal (ID 1, 0.50 USDC) and the Patron Seal (ID 3, 5.00 USDC). Other Artifacts are protocol-memory surfaces sealed by event.",
      },
      {
        property: "og:title",
        content: "The Syndicate NFTs — First Signal & Patron Seal mints open",
      },
      {
        property: "og:description",
        content:
          "Two public mints open on Avalanche: The First Signal (0.50 USDC) and the Patron Seal (5.00 USDC).",
      },
      { property: "og:url", content: "https://thesyndicate.money/nfts" },
      { property: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://thesyndicate.money/nft" },
    ],
  }),
  component: NftPage,
});
