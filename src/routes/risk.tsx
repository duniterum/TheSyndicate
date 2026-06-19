import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { GlassCard, Section, SectionHeader, Pill, ProofButton } from "@/components/syndicate/Primitives";
import { LEGAL_DISCLAIMER, SYNDICATE_CONFIG } from "@/lib/syndicate-config";
import { ARCHIVE_DISCLAIMER } from "@/lib/archive-config";
import { avascanAddressUrl, avascanTokenUrl } from "@/lib/chain-registry";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk & Legal Notice — The Syndicate" },
      { name: "description", content: "Risk and legal notice for The Syndicate: no profit promise, no yield, no dividend, no governance rights, no Vault or LP ownership. NFT Artifacts are collectible records only." },
      { property: "og:title", content: "Risk & Legal Notice — The Syndicate" },
      { property: "og:description", content: "Read before participating. No financial rights promised. NFT Artifacts are collectible records only." },
      { property: "og:url", content: "https://thesyndicate.money/risk" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/risk" }],
  }),
  component: RiskPage,
});

function RiskPage() {
  return (
    <PageShell
      eyebrow="Risk & Legal"
      title="Read before participating"
      description="No financial rights are promised. This is an experimental utility-membership system, not an investment product."
    >
      <Section>
        <div className="grid gap-6 max-w-3xl mx-auto">
          {/* Core legal disclaimer */}
          <GlassCard className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-2">
              <Pill tone="muted">Non-Investment</Pill>
            </div>
            <p>{LEGAL_DISCLAIMER}</p>
          </GlassCard>

          {/* What you are NOT getting */}
          <GlassCard className="p-6 space-y-4">
            <SectionHeader
              eyebrow="What this is not"
              title="No financial rights promised"
              description="SYN, membership, and any future NFT Artifacts are framed as utility and collectible records only."
            />
            <ul className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2 rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">No profit promise</span>
              </li>
              <li className="flex items-start gap-2 rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">No yield</span>
              </li>
              <li className="flex items-start gap-2 rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">No dividend</span>
              </li>
              <li className="flex items-start gap-2 rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">No revenue share</span>
              </li>
              <li className="flex items-start gap-2 rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">No governance rights</span>
              </li>
              <li className="flex items-start gap-2 rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">No Vault ownership</span>
              </li>
              <li className="flex items-start gap-2 rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">No LP ownership</span>
              </li>
              <li className="flex items-start gap-2 rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">No NFT financial rights</span>
              </li>
            </ul>
          </GlassCard>

          {/* What you ARE getting */}
          <GlassCard className="p-6 space-y-4">
            <SectionHeader
              eyebrow="What this is"
              title="Utility / membership / collectible-record framing"
              description="Participation confers status, visibility, and archive recognition within the protocol."
            />
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li className="rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">Utility membership</span>
                <p className="mt-1">SYN unlocks rank tiers, on-chain visibility, and future archive recognition. It does not represent equity or debt.</p>
              </li>
              <li className="rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">Collectible record</span>
                <p className="mt-1">Any NFT Artifacts issued are collectible records of protocol events. They confer no ownership, governance, or financial entitlement.</p>
              </li>
            </ul>
          </GlassCard>

          {/* Risks */}
          <GlassCard className="p-6 space-y-4">
            <SectionHeader
              eyebrow="Risks"
              title="Smart-contract and market risks"
              description="Blockchain experiments carry real risks. Participate only with funds you can afford to lose entirely."
            />
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li className="rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">Total loss possible</span>
                <p className="mt-1">Token price can move to zero. Smart contracts may contain bugs. LP positions can suffer impermanent loss. Only spend what you are willing to lose.</p>
              </li>
              <li className="rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">Smart-contract risk</span>
                <p className="mt-1">Deployed contracts have not been audited by a third-party firm. All contract code is public and verifiable, but verification is not a guarantee of safety.</p>
              </li>
              <li className="rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">Market risk</span>
                <p className="mt-1">Liquidity is thin. Large trades can move the price significantly. There is no buyback guarantee, no floor, and no redemption mechanism.</p>
              </li>
              <li className="rounded-md border border-border/40 p-3">
                <span className="text-foreground font-medium">Regulatory risk</span>
                <p className="mt-1">Laws and regulations affecting tokens, NFTs, and DeFi vary by jurisdiction and can change. Participation may become restricted or taxable in your region.</p>
              </li>
            </ul>
          </GlassCard>

          {/* Archive status */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Pill tone="success">LIVE</Pill>
            </div>
            <SectionHeader
              eyebrow="Archive"
              title="Archive1155 is live on Avalanche"
              description="The First Signal (ID 1, 0.50 USDC) is open. Patron Seal (ID 3) is CONTRACT_GATED / PUBLIC_MINT_READ_GATED and only appears mintable when live Archive1155 reads support it. Other Artifact categories are protocol-memory surfaces sealed by event."
            />
            <p className="text-sm text-muted-foreground leading-relaxed">{ARCHIVE_DISCLAIMER}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Artifacts are collectible records of protocol events. They confer no equity, debt, Vault ownership, dividends, revenue share, governance rights, or promises of profit.
            </p>
          </GlassCard>

          {/* Verification */}
          <GlassCard className="p-6 space-y-4">
            <SectionHeader
              eyebrow="Verify"
              title="Do not trust — verify"
              description="Every live contract, wallet, and event is on Avalanche C-Chain."
            />
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li className="rounded-md border border-border/40 p-3 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-foreground font-medium">SYN Token</span>
                <ProofButton href={avascanTokenUrl(SYNDICATE_CONFIG.TOKEN_CONTRACT_ADDRESS) ?? "#"}>
                  Avascan ↗
                </ProofButton>
              </li>
              <li className="rounded-md border border-border/40 p-3 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-foreground font-medium">Membership Sale</span>
                <ProofButton href={avascanAddressUrl("0x0020Df30C127306f0F5B44E6a6E4368D2855842d") ?? "#"}>
                  Avascan ↗
                </ProofButton>
              </li>
            </ul>
          </GlassCard>
        </div>
      </Section>
    <RouteFinalCTA preset="editorial" />
    </PageShell>
  );
}
