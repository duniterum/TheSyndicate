// /nft — bespoke, artifact-first page for The First Signal.
//
// Doctrine (Founder Audit, June 2026):
//   The NFT is the product. The page exists to make the NFT feel
//   collectible, historic, and desirable.
//
//   Wrong:  PAGE └ NFT card inside page
//   Correct: NFT  └ Page built around the NFT
//
// Mental model: Artifact → Collector → Story → Action → Proof → Contract.
// Weighting:   40% Avascan structural clarity
//            + 40% luxury collectible launch page
//            + 20% museum exhibit
//            +  0% crypto dashboard
//
// Section order (locked):
//   1. Artifact Hero            — <FirstSignalShowcase /> (huge NFT left, action/info right)
//   2. What Is The First Signal — <FirstSignalAnatomyBands /> (numbered callouts + on-chain SVG)
//   3. How The Archive Works    — <HowArchiveWorksFlow /> (6-step infographic)
//   4. The Archive Universe     — <ArchiveGalleryPreview /> (full collection grid)
//   5. Genesis Record           — built into the showcase Genesis Seal (#000001)
//   6. Live proof strip         — <LiveProofStrip /> (3 live on-chain facts)
//   7. Contract Proof           — <ArchiveContractStatus /> (clean proof panel)
//   8. Final CTA                — <FinalMintCTA /> ("Mint the opening signal.")
//
// Internal /archive route keeps its existing layout — this page does not
// reuse ArchivePage. SEO metadata stays NFT-forward.
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { Section } from "@/components/syndicate/Primitives";
import { FirstSignalShowcase } from "@/components/syndicate/FirstSignalShowcase";
import { FirstSignalAnatomyBands } from "@/components/syndicate/FirstSignalAnatomyBands";
import { HowArchiveWorksFlow } from "@/components/syndicate/HowArchiveWorksFlow";
import { PatronSealReadiness } from "@/components/syndicate/PatronSealReadiness";
import { MythologyWall } from "@/components/syndicate/MythologyWall";
import { LiveProofStrip } from "@/components/syndicate/LiveProofStrip";
import { ArchiveContractStatus } from "@/components/syndicate/ArchiveContractStatus";
import { FinalMintCTA } from "@/components/syndicate/FinalMintCTA";
import { MetaMaskExplorerFix } from "@/components/syndicate/MetaMaskExplorerFix";
import { RecentCollectorsRail } from "@/components/syndicate/RecentCollectorsRail";


export function NftPage() {
  return (
    <PageShell
      eyebrow="NFT · Avalanche · Chapter I mints open"
      title="The First Signal — the opening NFT of The Syndicate"

      description="Two public mints open on Avalanche: The First Signal (0.50 USDC) and the Patron Seal (5.00 USDC). Other Artifacts are protocol-memory surfaces sealed by event."
      hideHeader
    >
      {/* 1. Artifact Hero — huge NFT left, info + mint right (Genesis Seal lives here) */}
      <FirstSignalShowcase />

      {/* 1b. Mythology Wall — 9-slot public mythology (Acts I–III) */}
      <MythologyWall />

      {/* 2. What Is The First Signal — anatomy callouts on the live on-chain SVG */}
      <FirstSignalAnatomyBands />

      {/* 3. How The Archive Works — single infographic, 6 steps */}
      <HowArchiveWorksFlow />

      {/* 3b. Patron Seal — ID 3 dedicated panel (LIVE · mint open · 5.00 USDC) */}
      <PatronSealReadiness />

      {/* 4b. Recent collectors rail — live mints scanned from Archive1155 */}
      <RecentCollectorsRail />




      {/* 5. (Genesis Record is rendered inside FirstSignalShowcase as the Genesis Seal card.) */}

      {/* 6. Live proof strip — 3 live on-chain facts */}
      <LiveProofStrip />

      {/* 7. Contract Proof — clean, large, copyable */}
      <Section id="contract-proof">
        <ArchiveContractStatus />
        <div className="mt-4">
          <MetaMaskExplorerFix />
        </div>
      </Section>

      {/* 8. Final CTA — "Mint the opening signal." */}
      <FinalMintCTA />
    </PageShell>
  );
}

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
