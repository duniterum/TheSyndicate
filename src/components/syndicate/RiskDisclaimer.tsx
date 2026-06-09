import { LEGAL_DISCLAIMER } from "@/lib/syndicate-config";
import { GlassCard, Section, SectionHeader } from "./Primitives";

/**
 * Single source of truth for risk + non-investment messaging.
 * Mounted on Home, /transparency, /tokenomics (and anywhere else that
 * touches purchase or financial framing).
 */
export function RiskDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
        <div className="mono uppercase tracking-[0.18em] text-[10px] mb-1">Risk · Non-Investment Notice</div>
        {LEGAL_DISCLAIMER}
      </div>
    );
  }
  return (
    <Section id="risk-disclaimer">
      <SectionHeader
        eyebrow="Risk · Non-Investment"
        title="Read before participating"
        description="Same disclaimer everywhere on the site. SYN is a utility membership token — not an investment, not equity, not a yield product."
      />
      <GlassCard className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>{LEGAL_DISCLAIMER}</p>
        <ul className="grid gap-2 sm:grid-cols-2 text-xs">
          <li className="rounded-md border border-border/40 p-3">
            <span className="mono uppercase tracking-[0.16em] text-[10px] text-foreground">Not an investment</span>
            <p className="mt-1">No promised return, no dividend, no profit share. Treasury is transparent — not a fund.</p>
          </li>
          <li className="rounded-md border border-border/40 p-3">
            <span className="mono uppercase tracking-[0.16em] text-[10px] text-foreground">Utility only</span>
            <p className="mt-1">SYN unlocks rank, visibility, and archive recognition. It does not represent equity, and no governance rights are live or promised.</p>
          </li>
          <li className="rounded-md border border-border/40 p-3">
            <span className="mono uppercase tracking-[0.16em] text-[10px] text-foreground">Total loss possible</span>
            <p className="mt-1">Token price can move to zero. LP positions can suffer impermanent loss. Participate only with funds you can fully lose.</p>
          </li>
          <li className="rounded-md border border-border/40 p-3">
            <span className="mono uppercase tracking-[0.16em] text-[10px] text-foreground">Verify on-chain</span>
            <p className="mt-1">Every contract, wallet, and event is on Avalanche C-Chain. Don't trust — verify on Avascan / SnowTrace / Trader Joe.</p>
          </li>
        </ul>
      </GlassCard>
    </Section>
  );
}
