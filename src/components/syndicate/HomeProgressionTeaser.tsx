// HomeProgressionTeaser — a compact, premium snapshot of the infinite-game
// journey for first-time visitors. Sits in ACT 02 (Why join), after IdentityZone
// and before ACT 03. It does NOT clutter the hero and does NOT duplicate the
// canonical milestone/proof copy in MilestoneApproachingTile (ACT 03) — it shows
// only a compact Genesis snapshot and a restrained package arc.
//
// Surfaces the LIVE Genesis entry at a glance: the one live access rate, the SYN
// a minimum seat receives, live progress through the 333 Genesis seats, and a
// preview of the featured recognition ladder. Two doors out: /join for new
// members, /my-syndicate for members who already hold a seat.
//
// Pure presentation: reads shared config (eras, packages, access rate) + the
// live pulse. No chain writes, no new vocabulary, recognition framing only.

import {
  Section,
  SectionHeader,
  GlassCard,
  StatusPill,
  CTAButton,
} from "./Primitives";
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
        eyebrow="The journey, at a glance"
        title={
          <>
            One seat. <span className="text-gradient-gold">Then your next move.</span>
          </>
        }
        description="Every member starts the same way — take a seat in the live Genesis era, then move at your own pace. Here is where the archive stands right now."
      />

      <GlassCard className="p-5 md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* LEFT — live Genesis snapshot */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                Era I · Genesis
              </span>
              <StatusPill status="LIVE" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Stat label="Entry" value={`$${MIN_ENTRY_USDC}`} sub="minimum seat" />
              <Stat label="You receive" value={`${fmtInt(minSyn)} SYN`} sub={rateLabel} />
            </div>

            {/* progress to #333 — compact meter only (no proof copy) */}
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-3">
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
              <p className="mono mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {known
                  ? remaining! > 0
                    ? `${fmtInt(remaining!)} seats until Genesis seals`
                    : "Genesis is sealed"
                  : "Reading the live archive…"}
              </p>
            </div>
          </div>

          {/* RIGHT — package arc preview + the two doors */}
          <div className="flex flex-col gap-4 lg:border-l lg:border-border/50 lg:pl-6">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Featured seats — recognition only
            </span>
            <ul className="grid grid-cols-2 gap-2.5">
              {pkgs.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-border/60 bg-panel/40 px-3 py-2"
                >
                  <span className="text-sm text-foreground">{p.rank.name}</span>
                  <span className="mono text-xs text-foreground/70 tabular-nums">
                    ${fmtInt(p.usdc)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A package is a featured entry amount mapped 1:1 to a recognition
              tier — no payout, no rate change, no entitlement.
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <CTAButton variant="gold" href="/join">
                Take your seat →
              </CTAButton>
              <CTAButton variant="ghost" href="/my-syndicate">
                I&rsquo;m already a member
              </CTAButton>
            </div>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-serif text-2xl leading-tight text-gradient-gold tabular-nums md:text-3xl">
        {value}
      </div>
      <div className="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}
