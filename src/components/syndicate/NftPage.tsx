// NftPage — bespoke, memory-first page for The First Signal.
//
// Rendered by BOTH the /nft and /nfts routes. It lives here (not in a route
// file) so each route module only exports `Route` and stays code-split (P5).
//
// Doctrine (Founder Audit, June 2026):
//   The memory is the product. The page exists to make the artifact feel
//   historical, verifiable, and worth carrying.
//
//   Wrong:  PAGE └ NFT card inside page
//   Correct: NFT  └ Page built around the NFT
//
// Mental model: Artifact -> Witness -> Story -> Action -> Proof -> Contract.
//
// Section order (locked):
//   1. Artifact Hero            — <FirstSignalShowcase /> (huge NFT left, action/info right)
//   2. What Is The First Signal — <FirstSignalAnatomyBands /> (numbered callouts + on-chain SVG)
//   3. How The Archive Works    — <HowArchiveWorksFlow /> (6-step infographic)
//   6. Live proof strip         — <LiveProofStrip /> (3 live on-chain facts)
//   7. Contract Proof           — <ArchiveContractStatus /> (clean proof panel)
//   8. Final CTA                — <FinalMintCTA /> ("Mint the opening signal.")
import { PageShell } from "@/components/syndicate/PageShell";
import { Section } from "@/components/syndicate/Primitives";
import { FirstSignalShowcase } from "@/components/syndicate/FirstSignalShowcase";
import { FirstSignalAnatomyBands } from "@/components/syndicate/FirstSignalAnatomyBands";
import { HowArchiveWorksFlow } from "@/components/syndicate/HowArchiveWorksFlow";
import { PatronSealReadiness } from "@/components/syndicate/PatronSealReadiness";
import { MythologyWall } from "@/components/syndicate/MythologyWall";
import { ArchiveCeremony } from "@/components/syndicate/ArchiveCeremony";
import { LiveProofStrip } from "@/components/syndicate/LiveProofStrip";
import { ArchiveContractStatus } from "@/components/syndicate/ArchiveContractStatus";
import { FinalMintCTA } from "@/components/syndicate/FinalMintCTA";
import { MetaMaskExplorerFix } from "@/components/syndicate/MetaMaskExplorerFix";
import { RecentCollectorsRail } from "@/components/syndicate/RecentCollectorsRail";

export function NftPage() {
  return (
    <PageShell
      eyebrow="Archive memory · Avalanche · Chapter I"
      title="The First Signal — the opening memory of The Syndicate"
      description="The First Signal is open on Avalanche at 0.50 USDC. Patron Seal is CONTRACT_GATED / PUBLIC_MINT_READ_GATED and only appears mintable when live Archive1155 reads say so. Other Artifacts are protocol-memory surfaces sealed by event."
      hideHeader
    >
      {/* 1. Artifact Hero — huge NFT left, info + mint right (Genesis Seal lives here) */}
      <FirstSignalShowcase />

      {/* 1b. Mythology Wall — 9-slot public mythology (Acts I–III) */}
      <MythologyWall />

      <ArchiveCeremony />

      {/* 2. What Is The First Signal — anatomy callouts on the live on-chain SVG */}
      <FirstSignalAnatomyBands />

      {/* 3. How The Archive Works — single infographic, 6 steps */}
      <HowArchiveWorksFlow />

      {/* 3b. Patron Seal - ID 3 dedicated panel (contract/read gated) */}
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
