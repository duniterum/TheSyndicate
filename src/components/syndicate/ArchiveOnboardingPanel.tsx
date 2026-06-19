// "What you can do today" onboarding panel for /nft.
// Compact, no hero duplication, no write actions.
import { Link } from "@tanstack/react-router";
import { GlassCard, Pill, Section } from "@/components/syndicate/Primitives";

const TODAY = [
  "Join The Syndicate",
  "Mint The First Signal (ID 1) — 0.50 USDC on Avalanche",
  "Mint Patron Seal (ID 3) only when live Archive1155 reads allow it",
  "Explore planned Artifacts",
  "Verify the deployed Archive contract",
  "Connect your wallet to preview your Archive identity",
];

const NOT_ACTIVE = [
  "marketplace / trading",
  "Seat Record ERC-721",
  "future milestone & discovery Artifacts",
];

export function ArchiveOnboardingPanel() {
  return (
    <Section id="today">
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Pill tone="gold">START HERE</Pill>
          <Pill tone="success">ID 1 · MINT OPEN</Pill>
          <Pill tone="warning">ID 3 · READ GATED</Pill>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] mb-2">
              Today you can
            </div>
            <ul className="space-y-1.5">
              {TODAY.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mono text-[10px] text-[var(--gold)] mt-1">●</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Not active yet
            </div>
            <ul className="space-y-1.5">
              {NOT_ACTIVE.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mono text-[10px] text-muted-foreground mt-1">○</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
          <Link
            to="/join"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-[oklch(0.22_0.025_260)]"
            style={{
              background: "var(--gradient-gold)",
              boxShadow: "var(--shadow-glow-gold)",
            }}
          >
            Join The Syndicate
          </Link>
          <a
            href="#gallery-preview"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-border/60 bg-card/60 hover:bg-card hover:border-[var(--gold)]/60 text-foreground"
          >
            Explore Artifacts
          </a>
        </div>
      </GlassCard>
    </Section>
  );
}
