// FinalMintCTA — closing section for /nft.
//
// Doctrine: "Mint the opening signal." This is the page's emotional close —
// last chance to convert before the visitor leaves. Identity-focused, no
// price language, no urgency. The CTA scrolls back to the live mint card.
//
// Phase 3 harmonization: rendered through the canonical <ActionPanel /> +
// <Section width="editorial"> so the final CTA on /nft shares one shape with
// every other "next step" block on the site.
import { Link } from "@tanstack/react-router";
import { archiveVerifyUrl } from "@/lib/explorer-guard";
import { ARCHIVE_NFT_EXPLORERS } from "@/lib/syndicate-config";
import { ActionPanel, Section } from "@/components/syndicate/Primitives";

export function FinalMintCTA() {
  const verifyUrl = archiveVerifyUrl() ?? ARCHIVE_NFT_EXPLORERS.avascan;

  return (
    <Section id="final-mint-cta" width="editorial">
      <ActionPanel
        eyebrow="Chapter I · Closing record"
        title="Mint the opening signal."
        description="Preserve your place in Chapter I of The Syndicate Archive. Once Chapter I closes, the First Signal can never be issued again."
        primary={{ label: "Mint Now", href: "#first-signal-showcase" }}
        secondary={{ label: "Verify On-chain ↗", href: verifyUrl }}
      />
      <p className="mt-6 text-center mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <Link
          to="/archive"
          className="hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 rounded-sm px-1 py-1"
        >
          Browse the full archive →
        </Link>
      </p>
    </Section>
  );
}
