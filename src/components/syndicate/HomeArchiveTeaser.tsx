// Homepage Archive teaser: a memory shelf, not an NFT shop.
import { Link } from "@tanstack/react-router";
import { ArtifactPreviewArtwork } from "@/components/syndicate/ArtifactPreviewArtwork";
import { GlassCard, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import { track } from "@/lib/analytics";
import { PREVIEW_ARTIFACTS } from "@/lib/archive-preview-catalog";

const HOME_MEMORY_SHELF = [
  {
    id: 1,
    label: "MINT OPEN",
    tone: "success" as const,
    note: "First public Archive memory.",
  },
  {
    id: 3,
    label: "READ GATED",
    tone: "warning" as const,
    note: "Mintability comes from live reads.",
  },
  {
    id: 5,
    label: "RESERVED MEMORY",
    tone: "muted" as const,
    note: "Unseals only when chapter truth exists.",
  },
] as const;

export function HomeArchiveTeaser() {
  return (
    <Section id="home-archive" className="py-10 md:py-14">
      <SectionHeader
        eyebrow="Archive memory layer"
        title={<>Your seat is live. <span className="text-gradient-gold">Memory can follow.</span></>}
        description="Archive1155 is deployed and live. The First Signal is open; Patron Seal is read-gated; future memories stay sealed until on-chain event truth exists."
      />
      <GlassCard className="overflow-hidden p-0">
        <div className="grid gap-px bg-border/50 lg:grid-cols-[1fr_1.15fr]">
          <div className="bg-card/80 p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Pill tone="success">ARCHIVE1155 LIVE</Pill>
              <Pill tone="gold">SYN = SEAT</Pill>
              <Pill tone="navy">Artifacts are the memory</Pill>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">
              A member does not buy an NFT to become seated. A member takes a seat with SYN. Archive artifacts remember verified moments around that seat: opening signals, read-gated support, chapter seals, and future protocol memories.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
              <Link
                to="/nft"
                onClick={() => track("nft_archive_cta_click", { surface: "home_teaser" })}
                className="mono inline-flex min-h-10 items-center justify-center rounded-[3px] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-foreground)]"
                style={{ background: "var(--accent)" }}
              >
                Explore the Archive
              </Link>
              <Link
                to="/my-syndicate"
                className="mono inline-flex min-h-10 items-center justify-center rounded-[3px] border border-border/70 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground hover:border-[var(--gold)]/60"
              >
                Open Member OS
              </Link>
            </div>
          </div>
          <div className="grid gap-px bg-border/50 sm:grid-cols-3">
            {HOME_MEMORY_SHELF.map((slot) => {
              const artifact = PREVIEW_ARTIFACTS.find((item) => item.id === slot.id);
              if (!artifact) return null;
              return (
                <Link
                  key={slot.id}
                  to="/archive"
                  className="group flex min-h-[260px] flex-col bg-card/80 hover:bg-card transition-colors"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-border/50">
                    <ArtifactPreviewArtwork artifact={artifact} />
                    <div className="absolute left-2 top-2">
                      <Pill tone={slot.tone}>{slot.label}</Pill>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                      ID {artifact.id} · {artifact.category}
                    </div>
                    <h3 className="mt-1 text-sm font-semibold leading-tight text-foreground">
                      {artifact.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {slot.note}
                    </p>
                    <span className="mt-auto pt-3 mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] group-hover:text-[var(--gold)]">
                      View memory →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}
