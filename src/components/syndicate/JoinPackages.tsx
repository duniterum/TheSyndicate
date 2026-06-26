// JoinPackages — two additive Join-page surfaces:
//
//   • SeatPackages       — a curated strip of "featured ways to take your seat".
//                          Each card is an EXISTING contribution-depth band (no new naming),
//                          rendered through the shared premium SeatPackageCard:
//                          entry USDC · SYN at the current V3 era rate ·
//                          capital-footprint meaning · who it is for · CTA.
//                          Recognition only — no payout/entitlement/private terms.
//   • EraSchedulePreview — the distribution-era schedule. Era I (Genesis) is the
//                          current active era; Eras II+ are scheduled later
//                          pricing eras. Includes the sale-vs-DEX
//                          two-price note.
//
// Both are pure presentational leaves: they read the package + era config only,
// no chain, no writes.

import {
  Section,
  SectionHeader,
  StatusPill,
} from "@/components/syndicate/Primitives";
import { SeatPackageCard } from "@/components/syndicate/SeatPackageCard";
import { featuredPackages } from "@/lib/package-catalog";
import { ERAS, ERA_SCHEDULE_NOTE, currentEra, eraSynPerUsdc } from "@/lib/eras";

const fmtUsd = (n: number) => `$${n.toLocaleString("en-US")}`;
const fmtInt = (n: number) => n.toLocaleString("en-US");

export function SeatPackages() {
  const pkgs = featuredPackages();
  const era = currentEra();
  const genesisLive = era.id === "genesis";

  return (
    <Section id="packages">
      <SectionHeader
        eyebrow="Featured ways to take your seat"
        title={
          <>
            Pick a <span className="text-gradient-gold">seat package</span>
          </>
        }
        description={
          genesisLive
            ? "A package is simply a featured entry amount. Each one maps 1:1 to a capital-footprint band; the SYN shown uses the current Era I quote (100 SYN per 1 USDC), and the live quote is always confirmed in your wallet at checkout. Capital is visible and respected, but it is one recognition axis only — no payout, no entitlement, no private terms."
            : "A package is simply a featured entry amount. Each one maps 1:1 to a capital-footprint band; the SYN you receive is set by the current era and always confirmed in your wallet at checkout. Capital is visible and respected, but it is one recognition axis only — no payout, no entitlement, no private terms."
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pkgs.map((p) => (
          <SeatPackageCard
            key={p.id}
            pkg={p}
            ctaLabel={p.recommended ? "Take this seat" : "Choose this path"}
            ctaHref={`/join?amount=${p.usdc}`}
          />
        ))}
      </div>

      <p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-5 leading-relaxed">
        Era {era.roman} ({era.name}) is the current V3 pricing era. The
        full contribution-depth reference — all twelve bands — is below. Capital
        footprint reflects verified USDC routed through receipts; it is one
        recognition axis, not member identity.
      </p>
    </Section>
  );
}

export function EraSchedulePreview() {
  return (
    <Section id="era-schedule">
      <SectionHeader
        eyebrow="The distribution eras"
        title={
          <>
            Chapter is history.{" "}
            <span className="text-gradient-gold">Era is pricing.</span>
          </>
        }
        description={ERA_SCHEDULE_NOTE}
      />

      <div className="surface elevated overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-border/60">
              {["Era", "Seats", "Entry", "SYN / entry", "SYN per $1", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-normal px-4 py-3"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {ERAS.map((e) => {
              const live = e.status === "LIVE";
              return (
                <tr
                  key={e.id}
                  className={`border-b border-border/40 ${live ? "bg-[var(--gold)]/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="mono text-sm text-foreground">
                      {e.roman} · {e.name}
                    </div>
                    <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      #{fmtInt(e.startMember)} – #{fmtInt(e.endMember)}
                    </div>
                  </td>
                  <td className="px-4 py-3 mono text-sm text-foreground/85 tabular-nums">
                    {fmtInt(e.capacity)}
                  </td>
                  <td className="px-4 py-3 mono text-sm text-foreground/85 tabular-nums">
                    {fmtUsd(e.entryUsdc)}
                  </td>
                  <td className="px-4 py-3 mono text-sm text-foreground/85 tabular-nums">
                    {fmtInt(e.synPerEntry)}
                  </td>
                  <td className="px-4 py-3 mono text-sm text-foreground/85 tabular-nums">
                    {fmtInt(eraSynPerUsdc(e))}
                  </td>
                  <td className="px-4 py-3">
                    {live ? (
                      <StatusPill status="LIVE" />
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <StatusPill status="PENDING" />
                        <span className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                          scheduled
                        </span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mt-5 max-w-3xl">
        <span className="text-foreground">Sale quote vs. open market.</span> The
        current era quote is the protocol&rsquo;s own sale quote for taking a
        seat. Once you hold SYN, it may also trade on Trader Joe at a separate,
        market-set price — the two are independent, and the sale quote is not a
        market quote. Later eras are scheduled sale phases: they become active
        by deterministic member-seat ranges, not by an admin price switch.
      </p>
    </Section>
  );
}
