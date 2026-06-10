// "What changed for you?" — wallet-scoped Protocol Memory card.
//
// Renders only when a wallet is connected AND that wallet is an indexed
// member of the protocol. Shows:
//
//   • Personal facts (seat, rank, contribution, NFTs owned)
//   • Protocol milestones since you joined (soft witness language)
//   • Coming next (closest 3 canonical milestones)
//
// Every row carries a source label (LIVE / INDEXED / LOCAL / PARTIAL).
// No invented thresholds. No fake ownership. If a value is unknown we
// omit it — never guess.

import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useHolderIndex } from "@/lib/holder-index";
import { useProtocolEvents } from "@/lib/protocol-events";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { useArchiveBalances } from "@/lib/archive-balances-hook";
import { derivePersonalMemory, type MemorySource } from "@/lib/protocol-memory";
import { GlassCard, SectionHeader, StatusPill } from "./Primitives";
import { CockpitSection, useCockpitEmbed } from "./cockpit/cockpit-shell";

const SOURCE_STYLE: Record<MemorySource, string> = {
  LIVE: "text-emerald-700 dark:text-emerald-400 border-emerald-600/30",
  INDEXED: "text-[color:var(--gold)] border-[color:var(--gold)]/30",
  LOCAL: "text-muted-foreground border-border",
  PARTIAL: "text-amber-700 dark:text-amber-400 border-amber-500/30",
};

function SourcePill({ source }: { source: MemorySource }) {
  return (
    <span
      className={`mono text-[9px] uppercase tracking-[0.18em] rounded border px-1.5 py-0.5 ${SOURCE_STYLE[source]}`}
      aria-label={`Source ${source}`}
    >
      {source}
    </span>
  );
}

export function WhatChangedForYou() {
  const { isConnected, address } = useAccount();
  const idx = useHolderIndex();
  const pulse = useProtocolPulse();
  const { events } = useProtocolEvents({ limit: 200 });
  const balances = useArchiveBalances([1, 3]);
  const embedded = useCockpitEmbed();

  const record = address ? idx.getByWallet(address) : undefined;

  const mintFlags = useMemo(
    () => ({
      firstSignal: events.some((e) => e.kind === "nft-mint-first-signal"),
      patronSeal: events.some((e) => e.kind === "nft-mint-patron-seal"),
    }),
    [events],
  );

  const memory = useMemo(
    () =>
      derivePersonalMemory({
        record,
        events,
        archiveBalances: {
          firstSignal: balances.balances[1]?.balance,
          patronSeal: balances.balances[3]?.balance,
        },
        pulse: { buyers: pulse.buyers, usdcRaised: pulse.usdcRaised },
        mintFlags,
      }),
    [record, events, balances.balances, pulse.buyers, pulse.usdcRaised, mintFlags],
  );

  // Render nothing if not connected — keeps /my-syndicate clean for visitors.
  if (!isConnected) return null;

  // Connected but not yet a member: keep a tiny prompt instead of pretending.
  if (!memory.isMember) {
    return (
      <CockpitSection id="what-changed-for-you">
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] mb-1">
            Your protocol memory starts now
          </div>
          <p className="text-sm text-muted-foreground">
            This wallet is not yet indexed as a member. Once you buy SYN on the Membership Sale,
            this card will track what changes for you and which protocol milestones happen after
            you joined.{" "}
            <Link to="/join" className="text-foreground underline-offset-4 hover:underline">
              Open the Membership Sale →
            </Link>
          </p>
        </GlassCard>
      </CockpitSection>
    );
  }

  return (
    <CockpitSection id="what-changed-for-you">
      {embedded ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusPill status="LIVE" />
          <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
            What changed for you
          </h2>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · wallet-scoped facts · on-chain reads, never local storage
          </span>
        </div>
      ) : (
        <SectionHeader
          eyebrow="What changed for you"
          title={
            <>
              Your <span className="text-gradient-gold">protocol memory</span>
            </>
          }
          description="Wallet-scoped facts derived from on-chain reads — never from local storage. Every row carries a source label."
        />
      )}

      <div className={`grid grid-cols-1 ${embedded ? "" : "lg:grid-cols-3"} gap-4`}>
        {/* Facts */}
        <GlassCard className="p-5 lg:col-span-1">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Your facts
          </div>
          {memory.facts.length === 0 ? (
            <p className="text-sm text-muted-foreground" role="status">
              No new wallet-specific changes since your last visit.{" "}
              <Link to="/activity" className="text-foreground underline-offset-4 hover:underline">
                Protocol-wide activity is still visible in Activity →
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-border/40" aria-label="Wallet-scoped facts">
              {memory.facts.map((f) => (
                <li key={f.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{f.label}</span>
                    <SourcePill source={f.source} />
                  </div>
                  <div className="mono text-base font-semibold text-foreground mt-0.5 truncate">
                    {f.value}
                  </div>
                  {f.verifyHref && (
                    <a
                      href={f.verifyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${f.verifyLabel ?? "Verify"} ${f.label} on explorer`}
                      className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline min-h-[32px] inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold)]/60 rounded"
                    >
                      {f.verifyLabel ?? "Verify ↗"}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </GlassCard>


        {/* Milestones since join */}
        <GlassCard className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Protocol milestones since you joined
            </span>
            <SourcePill source="INDEXED" />
          </div>
          {memory.milestonesSinceJoin.length === 0 ? (
            <p className="text-sm text-muted-foreground" role="status">
              No protocol milestones have sealed since you joined yet. The next one will appear here
              the moment it lands on-chain.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {memory.milestonesSinceJoin.slice(0, 5).map((s) => (
                <li key={s.milestone.id} className="py-2 first:pt-0 last:pb-0">
                  <div className="text-sm text-foreground truncate">
                    ✓ {s.milestone.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-snug truncate">
                    {s.milestone.description}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {/* Coming next */}
        <GlassCard className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Coming next
            </span>
            <SourcePill source="INDEXED" />
          </div>
          {memory.comingNext.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Awaiting live pulse data — upcoming milestones surface here once the on-chain totals load.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {memory.comingNext.map((s) => {
                const pct = Math.round(s.progress * 100);
                return (
                  <li key={s.milestone.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-foreground truncate">{s.milestone.label}</span>
                      <span className="mono text-[10px] tabular-nums text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-border/40 overflow-hidden" aria-hidden="true">
                      <div className="h-full" style={{ width: `${pct}%`, background: "var(--gold)" }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>
      </div>

      <p className="mt-3 mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
        Source legend · LIVE = direct on-chain read · INDEXED = derived from indexed events ·
        LOCAL = read/unread hint only · PARTIAL = source delayed
      </p>
    </CockpitSection>
  );
}
