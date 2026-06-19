// Homepage NFT Archive teaser — compact, does not disturb the conversion path.
// Doctrine: Your seat is live. Your Artifact is next.
import { Link } from "@tanstack/react-router";
import { GlassCard, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import { track } from "@/lib/analytics";

export function HomeArchiveTeaser() {
  return (
    <Section id="home-archive">
      <SectionHeader
        eyebrow="Archive memory layer"
        title={<>Your seat is live. <span className="text-gradient-gold">Your Artifact is next.</span></>}
        description="Membership and routing are already verifiable on Avalanche. Archive1155 is deployed and live. The First Signal (ID 1) is open; Patron Seal (ID 3) is contract/read gated; future Artifacts stay sealed until their on-chain event fires."
      />
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground">SYN membership · Avalanche routing</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="navy">DEPLOYED</Pill>
            <Pill tone="success">ID 1 · MINT OPEN</Pill>
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Archive Contract on Avalanche · The First Signal mint open
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The First Signal (ID 1) is an open public Artifact mint at 0.50 USDC, wallet limit 5. The Patron Seal (ID 3) only appears mintable when live Archive1155 reads confirm it; the remaining Artifacts are protocol-memory surfaces sealed by event.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-foreground">
            SYN is the seat · Artifacts are the memory
          </span>
          <Link
            to="/nft"
            onClick={() => track("nft_archive_cta_click", { surface: "home_teaser" })}
            className="ml-auto mono text-[11px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Explore the NFTs →
          </Link>
        </div>
      </GlassCard>
    </Section>
  );
}
