// Revenue Streams surface (Batch 3b). Registry-driven, read-only.
//
// Renders the three income streams from src/lib/revenue-streams.ts and makes the
// doctrine explicit: ONLY the Membership Sale uses the 70 / 20 / 10 split; NFT
// mints and LP fees are SEPARATE streams. The NFT card reads owner()/treasury()
// live; an unreadable address degrades to PENDING — never fabricated. LP fees
// carry no on-chain amount read, so they are surfaced as destination + PENDING,
// never a computed figure.
import { GlassCard, Section, SectionHeader, ProofButton } from "@/components/syndicate/Primitives";
import { REVENUE_STREAMS } from "@/lib/revenue-streams";
import { explorerUrlFor, explorerUrlForAddress } from "@/lib/syndicate-config";
import { labelForAddress } from "@/lib/known-addresses";
import { useArchiveOwnership } from "@/lib/archive-nft-hooks";

function StatusPill({ status }: { status: "live" | "pending" }) {
  const live = status === "live";
  return (
    <span
      className={`mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${
        live
          ? "text-emerald-300 border-emerald-400/30"
          : "text-amber-300 border-amber-400/30"
      }`}
    >
      {live ? "LIVE" : "PENDING"}
    </span>
  );
}

export function RevenueStreams() {
  const ownership = useArchiveOwnership();
  const treasuryUrl = ownership.treasury ? explorerUrlForAddress(ownership.treasury) : null;

  return (
    <Section id="revenue-streams">
      <SectionHeader
        eyebrow="Income streams"
        title={
          <>
            Three streams, <span className="text-gradient-gold">three destinations</span>
          </>
        }
        description="Only the Membership Sale uses the 70 / 20 / 10 split. NFT mints and LP fees are separate streams with their own on-chain destinations. Every figure maps to an on-chain read or is labeled PENDING — never estimated."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REVENUE_STREAMS.map((s) => (
          <GlassCard key={s.id} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="mono text-[11px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">
                {s.label}
              </div>
              <StatusPill status={s.amountStatus} />
            </div>
            <div className="text-sm text-foreground/85">{s.source}</div>
            <div className="text-sm text-foreground/70">{s.destination}</div>
            {!s.routedThroughMembershipSplit && (
              <div className="mono text-[10px] uppercase tracking-[0.16em] text-amber-300/80">
                Separate stream · not 70 / 20 / 10
              </div>
            )}
            {s.id === "nft-mints" && (
              <div className="text-xs text-muted-foreground border-l-2 border-amber-500/30 pl-3 space-y-0.5">
                <div>
                  Treasury:{" "}
                  <span className="mono break-all">
                    {ownership.treasury
                      ? labelForAddress(ownership.treasury).label
                      : "PENDING · verify on-chain"}
                  </span>
                </div>
                {ownership.owner && (
                  <div>
                    Owner:{" "}
                    <span className="mono break-all">
                      {labelForAddress(ownership.owner).label}
                    </span>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{s.note}</p>
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              {s.proofLinks.map((l) => {
                const href = explorerUrlFor(l.contractKey);
                return href ? (
                  <ProofButton
                    key={l.contractKey}
                    href={href}
                    ariaLabel={`Open ${l.label} on Avascan`}
                  >
                    {l.label} ↗
                  </ProofButton>
                ) : null;
              })}
              {s.id === "nft-mints" && treasuryUrl && (
                <ProofButton href={treasuryUrl} ariaLabel="Open Archive treasury on Avascan">
                  Treasury ↗
                </ProofButton>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground border-l-2 border-amber-500/40 pl-3 max-w-3xl">
        These are separate income streams. NFT and LP proceeds do not pass through
        the 70 / 20 / 10 Membership Sale split. No yield, no dividends, no claim by
        SYN holders on any stream — every destination is a public on-chain address
        you can verify.
      </p>
    </Section>
  );
}
