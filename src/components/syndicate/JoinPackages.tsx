// JoinPackages — two additive Join-page surfaces:
//
//   • SeatPackages       — a curated strip of "featured ways to take your seat".
//                          Each card is an EXISTING rank tier (no new naming),
//                          showing entry USDC · SYN at the live Genesis rate ·
//                          recognition. Recognition only — no payout/rate change.
//   • EraSchedulePreview — the distribution-era schedule. Era I (Genesis) is the
//                          ONE live rate; Eras II+ are a PROPOSED FUTURE model,
//                          labeled PENDING / not live. Includes the sale-vs-DEX
//                          two-price note.
//
// Both are pure presentational leaves: they read the package + era config only,
// no chain, no writes.

import {
  Section,
  SectionHeader,
  StatusPill,
} from "@/components/syndicate/Primitives";
import { featuredPackages } from "@/lib/package-catalog";
import { ERAS, ERA_SCHEDULE_NOTE, currentEra, eraSynPerUsdc } from "@/lib/eras";

const fmtUsd = (n: number) => `$${n.toLocaleString("en-US")}`;
const fmtInt = (n: number) => n.toLocaleString("en-US");

export function SeatPackages() {
  const pkgs = featuredPackages();
  const era = currentEra();

  return (
    <Section id="packages">
      <SectionHeader
        eyebrow="Featured ways to take your seat"
        title={
          <>
            Pick a <span className="text-gradient-gold">seat package</span>
          </>
        }
        description="A package is simply a featured entry amount. Each one maps 1:1 to a recognition tier and the SYN you receive at the live Genesis access rate (1 SYN = $0.01 USDC). Recognition only — no payout, no rate change, no entitlement."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pkgs.map((p) => (
          <div
            key={p.id}
            className="surface elevated p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {p.rank.name}
              </span>
              <StatusPill status="LIVE" />
            </div>
            <div className="font-serif text-3xl text-gradient-gold tabular-nums">
              {fmtUsd(p.usdc)}
            </div>
            <div className="mono text-sm text-foreground tabular-nums">
              {fmtInt(p.synAtGenesis)} SYN
              <span className="text-muted-foreground"> at Genesis rate</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              {p.tagline}
            </p>
            <a
              href="#buy"
              className="mono inline-flex items-center justify-between gap-2 rounded-[3px] border border-[var(--gold)]/60 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-foreground hover:bg-[var(--gold)]/10 transition-colors"
            >
              <span>Take this seat</span>
              <span aria-hidden>↑</span>
            </a>
          </div>
        ))}
      </div>

      <p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-5 leading-relaxed">
        Era {era.roman} ({era.name}) is live now at the fixed access rate. The
        full recognition ladder — all twelve tiers — is below. Rank is derived
        from cumulative USDC routed; it is recognition only.
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
            One live rate today — a{" "}
            <span className="text-gradient-gold">proposed schedule</span> ahead
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
                          proposed
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
        <span className="text-foreground">Sale rate vs. open market.</span> The
        Genesis access rate is the protocol&rsquo;s own sale rate for taking a
        seat. Once you hold SYN, it may also trade on Trader Joe at a separate,
        market-set price — the two are independent, and the access rate is not a
        market quote. Eras II onward are a proposed future distribution model:
        not live, and contingent on a future sale contract before any of it
        takes effect.
      </p>
    </Section>
  );
}
