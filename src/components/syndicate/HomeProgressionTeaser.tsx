// HomeProgressionTeaser — the homepage "Featured Paths" section. Sits in ACT 02
// (Why join), after IdentityZone and before ACT 03. It does NOT clutter the hero
// and does NOT duplicate the canonical milestone/proof copy in
// MilestoneApproachingTile (ACT 03).
//
// Presents the package/progression system as a premium purchase surface: a
// compact, truthful live-Genesis context strip, then six curated featured
// paths (one per group) with strong hierarchy — a single "Start here" default
// and one high-conviction headline. Two doors out: the full recognition ladder
// (/join) for new members, /my-syndicate for members who already hold a seat.
//
// Pure presentation: reads shared config (eras, packages, access rate) + the
// live pulse. No chain writes, no new vocabulary, recognition framing only.

import { Section, SectionHeader, StatusPill } from "./Primitives";
import { SeatPackageCard } from "./SeatPackageCard";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { currentEra, synForUsdcInEra } from "@/lib/eras";
import { featuredPackages } from "@/lib/package-catalog";
import { ACCESS_RATE_USDC_PER_SYN } from "@/lib/syndicate-config";

const fmtInt = (n: number) => n.toLocaleString("en-US");
const MIN_ENTRY_USDC = 5;

export function HomeProgressionTeaser() {
  const pulse = useProtocolPulse();
  const era = currentEra();
  const pkgs = featuredPackages();

  const filled = pulse.buyers; // number | undefined
  const total = era.endMember; // 333 (Genesis)
  const known = filled !== undefined;
  const pct = known ? Math.min(100, Math.round((filled! / total) * 100)) : 0;
  const remaining = known ? Math.max(0, total - filled!) : undefined;

  const minSyn = synForUsdcInEra(MIN_ENTRY_USDC, era); // 500 at Genesis rate
  const rateLabel = `1 SYN = $${ACCESS_RATE_USDC_PER_SYN.toFixed(2)} USDC`;

  return (
    <Section id="home-progression">
      <SectionHeader
        eyebrow="Featured paths"
        title={
          <>
            Choose how you{" "}
            <span className="text-gradient-gold">take your seat</span>
          </>
        }
        description="Every member starts the same way — take a seat in the live Genesis era, then move at your own pace. Each path below is a featured entry amount mapped 1:1 to a recognition tier. Recognition only — no payout, no rate change, no entitlement."
      />

      {/* live Genesis context — one compact, truthful strip (no fake urgency) */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border/60 bg-panel/40 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
              Era I · Genesis
            </span>
            <StatusPill status="LIVE" />
          </div>
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground tabular-nums">
            Entry ${MIN_ENTRY_USDC} · {fmtInt(minSyn)} SYN · {rateLabel}
          </div>
        </div>

        <div className="w-full md:max-w-xs">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Genesis seats · #1–#{total}
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground/80 tabular-nums">
              {known ? `${fmtInt(filled!)} / ${fmtInt(total)}` : `— / ${fmtInt(total)}`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border/40 ring-1 ring-border/40">
            <div
              className="h-full transition-all"
              style={{ width: `${Math.max(2, pct)}%`, background: "var(--gradient-gold)" }}
              aria-label={`${pct}% of Genesis seats taken`}
            />
          </div>
          <p className="mono mt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {known
              ? remaining! > 0
                ? `${fmtInt(remaining!)} seats until Genesis seals`
                : "Genesis is sealed"
              : "Reading the live archive…"}
          </p>
        </div>
      </div>

      {/* six featured paths — one recommended, one high-conviction */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pkgs.map((p) => (
          <SeatPackageCard
            key={p.id}
            pkg={p}
            ctaLabel={p.recommended ? "Take your seat" : "Choose this path"}
            ctaHref="/join"
          />
        ))}
      </div>

      {/* full ladder + member door */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <a
          href="/join"
          className="mono inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-[var(--gold)] underline-offset-4 hover:underline"
        >
          View full recognition ladder →
        </a>
        <a
          href="/my-syndicate"
          className="mono inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          I&rsquo;m already a member
        </a>
      </div>
    </Section>
  );
}
