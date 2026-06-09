// Global "Story So Far" — one compact, verifiable snapshot of the protocol
// rendered above-the-fold on Home, Activity, and My Syndicate so every
// surface tells the same single truth:
//
//   Chapter · Members · Artifacts minted · Vault USDC · Latest verified event
//
// Truth model:
//   • Reads from useProtocolTruth + useProtocolEvents only — no fabrication.
//   • Every numeric tile is labeled with its canonical status pill.
//   • The latest event row links to the EXACT explorer URL for its tx hash.
//   • If a fact is unknown it shows "—" and a PENDING pill — never a guess.

import { Link } from "@tanstack/react-router";
import { GlassCard, Section, StatusPill } from "./Primitives";
import { useProtocolTruth } from "@/lib/protocol-truth";
import { useProtocolEvents } from "@/lib/protocol-events";
import { isValidTxHash } from "./TxProofDrawer";
import { ProofChip } from "./ProofChip";
import { VerifiedUpToBadge } from "./VerifiedUpToBadge";

const fmtInt = (n: number | undefined) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtUsd = (n: number | undefined) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function ProtocolStorySoFar() {
  const t = useProtocolTruth();
  const { events } = useProtocolEvents({ limit: 60 });

  const artifactsMinted = events.filter(
    (e) =>
      e.kind === "nft-mint-first-signal" ||
      e.kind === "nft-mint-patron-seal" ||
      e.kind === "nft-mint-other",
  ).length;

  const latest = events[0];
  const latestValidTx = latest && isValidTxHash(latest.txHash) ? latest.txHash : null;

  const cp = t.chapterProgress.value;

  return (
    <Section id="protocol-story-so-far" className="py-8 md:py-10">
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
              The Story So Far
            </div>
            <h2 className="mt-1 text-lg md:text-xl font-semibold tracking-tight text-foreground">
              {cp
                ? <>Chapter <span className="text-gradient-gold">{cp.label}</span> · {fmtInt(cp.remaining)} seat{cp.remaining === 1 ? "" : "s"} until close</>
                : <>The protocol is <span className="text-gradient-gold">forming in public</span></>}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <VerifiedUpToBadge />
            <Link
              to="/activity"
              className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Full activity →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile label="Members archived" value={fmtInt(t.members.value)} status={t.members.status} href={t.members.verifyHref} />
          <Tile label="Artifacts minted" value={fmtInt(artifactsMinted)} status={artifactsMinted > 0 ? "LIVE" : "PENDING"} href={null} hrefLabel="Indexed mints" />
          <Tile label="Vault USDC" value={fmtUsd(t.vaultUsdc.value)} status={t.vaultUsdc.status} href={t.vaultUsdc.verifyHref} />
          <Tile label="USDC routed" value={fmtUsd(t.usdcRaised.value)} status={t.usdcRaised.status} href={t.usdcRaised.verifyHref} />
        </div>

        <div className="mt-4 border-t border-border/40 pt-3">
          <div className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-1 flex items-center justify-between gap-2">
            <span>Latest verified event</span>
            {latestValidTx && (
              <ProofChip kind="tx" value={latestValidTx} label="Verify" />
            )}
          </div>
          {latest ? (
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
              <span className="text-foreground font-medium truncate">{latest.title}</span>
              <span className="mono text-[11px] text-muted-foreground truncate">
                {latest.detail}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Awaiting the next on-chain event. The feed will update the moment a new tx confirms.
            </p>
          )}
        </div>
      </GlassCard>
    </Section>
  );
}

function Tile({
  label,
  value,
  status,
  href,
  hrefLabel,
}: {
  label: string;
  value: string;
  status: "LIVE" | "PARTIAL" | "PENDING";
  href: string | null;
  hrefLabel?: string;
}) {
  const inner = (
    <div className="rounded-md border border-border/50 bg-background/40 px-3 py-2.5 h-full">
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground truncate">
          {label}
        </span>
        <StatusPill status={status} />
      </div>
      <div className="mono text-base md:text-lg font-semibold text-foreground mt-0.5 tabular-nums">
        {value}
      </div>
      {href && (
        <div className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--navy-soft)] mt-1">
          Verify ↗
        </div>
      )}
      {!href && hrefLabel && (
        <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70 mt-1">
          {hrefLabel}
        </div>
      )}
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
      {inner}
    </a>
  ) : (
    inner
  );
}
