// /activity Heartbeat hero — the single latest verified protocol event,
// elevated above the feed with a "why it matters" line and an INLINE
// proof drawer (ProofChip → TxProofDrawer). No fabricated narrative:
// meaning, consequence, and disposition come from the canonical
// protocol-event intelligence engine.
//
// When a wallet is connected AND we have a previous visit snapshot, we
// also surface a "Why it matters to me" panel — exclusively from
// since-last-visit deltas + indexed seat facts, every row with a
// verification anchor. No claims without proof.

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useProtocolEvents } from "@/lib/protocol-events";
import { interpretProtocolEvent } from "@/lib/protocol-event-intelligence";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { useHolderIndex } from "@/lib/holder-index";
import { useVisitorMemory } from "@/lib/visitor-memory";
import { txExplorerUrl, explorerUrlForAddress } from "@/lib/syndicate-config";
import { isValidTxHash } from "./TxProofDrawer";
import { ProofChip } from "./ProofChip";
import { VerifiedUpToBadge } from "./VerifiedUpToBadge";
import { GlassCard, Pill, Section, StatusPill } from "./Primitives";

export function ActivityHeartbeat() {
  const { events, isLoading } = useProtocolEvents({ limit: 10 });
  const latest = events[0];
  const intelligence = latest ? interpretProtocolEvent(latest) : null;
  const latestValidTx = latest && isValidTxHash(latest.txHash) ? latest.txHash : null;
  const proofHref = latestValidTx ? txExplorerUrl(latestValidTx) : null;

  return (
    <Section id="activity-heartbeat" className="py-6 md:py-8">
      <GlassCard className="p-5 md:p-6 border-[color:var(--gold)]/30">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
              Protocol heartbeat
            </span>
            <StatusPill status={latest ? "LIVE" : isLoading ? "PARTIAL" : "PENDING"} />
          </div>
          <div className="flex items-center gap-2">
            <VerifiedUpToBadge />
            {latestValidTx && (
              <ProofChip kind="tx" value={latestValidTx} label="Verify" />
            )}
          </div>
        </div>

        {!latest ? (
          <p className="text-sm text-muted-foreground">
            Awaiting the next confirmed on-chain event. This row updates the moment a new tx
            lands on Avalanche.
          </p>
        ) : (
          <>
            <div className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
              {latest.title}
            </div>
            <div className="mt-1 mono text-[12px] text-muted-foreground truncate">
              {latest.detail}
            </div>
            <div className="mt-3 border-t border-border/40 pt-3">
              <div className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1">
                Why it matters
              </div>
              <p className="text-sm text-foreground/90 max-w-3xl leading-relaxed">
                {intelligence?.meaning}
              </p>
              {intelligence && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="rounded-md border border-border/40 bg-background/40 px-3 py-2">
                    <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Consequence
                    </div>
                    <p className="mt-1 text-xs text-foreground/85 leading-relaxed">
                      {intelligence.consequence}
                    </p>
                  </div>
                  <div className="rounded-md border border-border/40 bg-background/40 px-3 py-2">
                    <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Disposition
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Pill tone={intelligence.chronicleCandidate.status === "CANDIDATE" ? "gold" : "muted"}>
                        {intelligence.chronicleCandidate.label}
                      </Pill>
                      <Pill tone={intelligence.registerDisposition.status === "ACTIVE_RECORD" ? "success" : "muted"}>
                        {intelligence.registerDisposition.label}
                      </Pill>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <WhyItMattersToMe />

            {/* Fallback hint when proof anchor cannot be built. */}
            {!latestValidTx && proofHref === null && (
              <p className="mt-3 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Awaiting tx-hash for this event — verification pill will surface once indexed.
              </p>
            )}
          </>
        )}
      </GlassCard>
    </Section>
  );
}

/** Wallet-scoped "why it matters to me" — only verified since-last-visit facts. */
function WhyItMattersToMe() {
  const { isConnected, address } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const pulse = useProtocolPulse();

  const { previous, ready } = useVisitorMemory({
    ready: !pulse.isLoading && pulse.buyers !== undefined,
    members: pulse.buyers,
    usdcRaised: pulse.usdcRaised,
    synSold: pulse.synSold,
    purchases: undefined,
    vaultUsdc: pulse.vaultUsdc,
    liquidityUsdc: pulse.liquidityUsdc,
    milestonesReached: [],
  });

  const items = useMemo(() => {
    const out: { label: string; value: string; verifyHref?: string; verifyLabel?: string }[] = [];
    if (!isConnected || !record || !ready || !previous) return out;

    const dMembers = num(pulse.buyers) - num(previous.members);
    if (dMembers > 0) {
      out.push({
        label: "Members joined after you",
        value: `+${dMembels(dMembers)}`,
        verifyHref: explorerUrlForAddress(record.wallet) ?? undefined,
        verifyLabel: "Your seat on Avascan",
      });
    }
    const dUsdc = num(pulse.usdcRaised) - num(previous.usdcRaised);
    if (dUsdc > 0) {
      out.push({
        label: "USDC routed since you visited",
        value: `+$${Math.round(dUsdc).toLocaleString("en-US")}`,
        verifyHref: explorerUrlForAddress(record.wallet) ?? undefined,
        verifyLabel: "Your purchase history",
      });
    }
    const dVault = num(pulse.vaultUsdc) - num(previous.vaultUsdc);
    if (dVault > 0) {
      out.push({
        label: "Vault grew",
        value: `+$${Math.round(dVault).toLocaleString("en-US")}`,
      });
    }
    return out;
  }, [isConnected, record, ready, previous, pulse.buyers, pulse.usdcRaised, pulse.vaultUsdc]);

  if (items.length === 0) return null;

  return (
    <div className="mt-4 border-t border-border/40 pt-3">
      <div className="mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)] mb-2 inline-flex items-center gap-2">
        Why it matters to me
        <span
          className="mono text-[9px] uppercase tracking-[0.18em] rounded border border-border px-1.5 py-0.5 text-muted-foreground"
          aria-label="Source LOCAL+INDEXED"
        >
          LOCAL+INDEXED
        </span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((it) => (
          <li
            key={it.label}
            className="rounded-md border border-border/40 bg-background/40 px-3 py-2 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground truncate">
                {it.label}
              </div>
              <div className="mono text-sm font-semibold text-foreground tabular-nums">
                {it.value}
              </div>
            </div>
            {it.verifyHref && (
              <a
                href={it.verifyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline shrink-0"
              >
                {it.verifyLabel ?? "Verify ↗"}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function num(n: number | undefined): number {
  return n ?? 0;
}
function dMembels(n: number): string {
  return n.toLocaleString("en-US");
}
