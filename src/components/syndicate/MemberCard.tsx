// MemberCard — first canonical UI consumer of useHolderIndex.
//
// Two modes:
//   • Connected wallet IS a member  → real card (founder #, capital band,
//     chapter, cumulative USDC routed, first/last tx).
//   • Connected wallet is NOT a member (or no wallet) → preview card
//     ("You would be member #N") sourced from holder totals.
//
// Identity layer only — no fake data, no enrichment, no governance, no NFT
// eligibility surfaced yet (Wave 2+).

import { useRef } from "react";
import { useAccount } from "wagmi";
import { useHolderIndex, type HolderChapter } from "@/lib/holder-index";
import { explorerUrlForAddress, txExplorerUrl } from "@/lib/syndicate-config";
import { fmtAddress } from "@/lib/sale-hooks";
import { CANONICAL_ORIGIN } from "@/lib/canonical-origin";
import { buildReferralShareUrl } from "@/lib/referral-attribution";
import { GlassCard, StatusPill } from "./Primitives";
import { ShareActions } from "./ShareActions";

const fmtUsd = (n: number, d = 2) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: d })}`;
const fmtN = (n: number) => n.toLocaleString("en-US");

const CHAPTER_LABEL: Record<HolderChapter, string> = {
  "genesis-signal":     "Genesis Signal (#1 – #333)",
  "first-thousand":     "First Thousand",
  "the-expansion":      "The Expansion",
  "first-ten-thousand": "First Ten Thousand",
  "open-era":           "Open Era",
};

export function MemberCard() {
  const { address } = useAccount();
  const idx = useHolderIndex();
  const record = idx.getByWallet(address);
  const cardRef = useRef<HTMLDivElement>(null);

  // Preview mode — wallet not yet a member.
  if (!record) {
    const nextNumber = idx.totals.nextMemberNumber;
    const nextChapter =
      nextNumber <= 333 ? "Genesis Signal chapter"
      : nextNumber <= 1_000 ? "First Thousand chapter"
      : nextNumber <= 3_333 ? "The Expansion chapter"
      : nextNumber <= 10_000 ? "First Ten Thousand chapter"
      : "Open Era chapter";

    return (
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <StatusPill status={idx.hasData ? "LIVE" : "PENDING"} />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Member preview
          </span>
        </div>
        <div className="space-y-1">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            You would join as
          </div>
          <div className="text-3xl font-semibold text-gradient-gold">
            Member #{nextNumber}
          </div>
          <div className="text-sm text-muted-foreground">{nextChapter}</div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
          Member number is derived from the order of your first TokensPurchased
          event. Capital footprint is derived from cumulative verified USDC
          routed across all your purchases. Both are immutable once recorded
          on-chain.
        </p>
      </GlassCard>
    );
  }

  // Member mode — real card from canonical record.
  const walletUrl = explorerUrlForAddress(record.wallet);
  const firstTxUrl = txExplorerUrl(record.firstPurchaseTx);
  const identitySentence = `Member #${record.founderNumber} of The Syndicate · ${CHAPTER_LABEL[record.chapter]} · Capital footprint ${record.currentRank?.name ?? "—"} · ${fmtUsd(record.cumulativeUsdc)} routed on-chain.`;
  const shareUrl = buildReferralShareUrl(
    `${CANONICAL_ORIGIN}/wallet/${record.wallet}`,
    record.founderNumber,
  );

  return (
    <div>
      <div ref={cardRef}>
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <StatusPill status="LIVE" />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Your member card
        </span>
      </div>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Founder
          </div>
          <div className="text-3xl font-semibold text-gradient-gold leading-none">
            #{record.founderNumber}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {CHAPTER_LABEL[record.chapter]}
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Capital footprint
          </div>
          <div className="text-lg font-semibold">{record.currentRank?.name ?? "—"}</div>
          {record.nextRank ? (
            <div className="mono text-[10px] text-muted-foreground">
              Next: {record.nextRank.name}
            </div>
          ) : null}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Wallet</dt>
          <dd className="mt-0.5">
            {walletUrl ? (
              <a href={walletUrl} target="_blank" rel="noopener noreferrer" className="mono hover:text-[var(--gold)]">
                {fmtAddress(record.wallet)} ↗
              </a>
            ) : (
              <span className="mono">{fmtAddress(record.wallet)}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">First purchase</dt>
          <dd className="mt-0.5">
            <a href={firstTxUrl} target="_blank" rel="noopener noreferrer" className="mono hover:text-[var(--gold)]">
              tx ↗
            </a>
          </dd>
        </div>
        <div>
          <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">USDC routed</dt>
          <dd className="mt-0.5 mono font-semibold">{fmtUsd(record.cumulativeUsdc)}</dd>
        </div>
        <div>
          <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">SYN received</dt>
          <dd className="mt-0.5 mono font-semibold">{fmtN(Math.round(record.cumulativeSyn))} SYN</dd>
        </div>
        <div>
          <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Purchases</dt>
          <dd className="mt-0.5 mono">{record.purchaseCount}</dd>
        </div>
        <div>
          <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Largest single</dt>
          <dd className="mt-0.5 mono">{fmtUsd(record.largestSinglePurchaseUsdc)}</dd>
        </div>
      </dl>
    </GlassCard>
      </div>
      <ShareActions
        filename={`syndicate-member-${record.founderNumber}.png`}
        shareText={identitySentence}
        shareUrl={shareUrl}
        nodeRef={cardRef}
        hint="Share your seat"
        className="mt-3"
      />
    </div>
  );
}
