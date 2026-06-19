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
      { title: "The Syndicate NFTs — First Signal mint open · Patron Seal read-gated" },
      {
        name: "description",
        content:
          "Collectible NFT Artifacts for The Syndicate. The First Signal (ID 1) is open on Avalanche at 0.50 USDC. Patron Seal (ID 3) is contract/read gated and only mintable when live Archive1155 reads say so. Other Artifacts are protocol-memory surfaces sealed by event.",
      },
      {
        property: "og:title",
        content: "The Syndicate NFTs — First Signal mint open · Patron Seal read-gated",
      },
      {
        property: "og:description",
        content:
          "The First Signal is open on Avalanche at 0.50 USDC. Patron Seal is contract/read gated by live Archive1155 reads.",
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
