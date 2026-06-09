// "Your next action" — single, personalized recommendation for the
// connected wallet on /my-syndicate.
//
// Truth model:
//   • Recommendation is derived ONLY from indexed/live reads:
//       - wagmi connection state (LIVE)
//       - useHolderIndex membership record (INDEXED)
//       - useArchiveBalances for First Signal + Patron Seal (LIVE)
//   • Never gated on localStorage. Never invents eligibility.
//   • Exactly ONE primary action surfaced at a time — no decision paralysis.

import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useHolderIndex } from "@/lib/holder-index";
import { useArchiveBalances } from "@/lib/archive-balances-hook";
import { useIndexerGuard } from "@/lib/indexer-guard";
import { txExplorerUrl, ARCHIVE_NFT_EXPLORERS } from "@/lib/syndicate-config";
import { GlassCard, Section } from "./Primitives";
import { VerifiedUpToBadge } from "./VerifiedUpToBadge";

type Action = {
  step: string;
  title: string;
  reason: string;
  cta: string;
  to: string;
  source: "LIVE" | "INDEXED";
  done?: boolean;
  verifyHref?: string;
  verifyLabel?: string;
};

export function YourNextAction() {
  const { isConnected, address } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const bal = useArchiveBalances([1, 3]);
  const guard = useIndexerGuard();

  const fs = bal.balances[1]?.balance;
  const ps = bal.balances[3]?.balance;

  let action: Action;

  if (!isConnected) {
    action = {
      step: "Step 1 of 4",
      title: "Connect a wallet to read your seat",
      reason: "Every recommendation below derives from on-chain reads scoped to your address.",
      cta: "Open the Membership Sale →",
      to: "/join",
      source: "LIVE",
    };
  } else if (!record) {
    action = {
      step: "Step 2 of 4",
      title: "Buy SYN on the Membership Sale",
      reason: "This wallet is not yet indexed as a member. Joining seals your member number and chapter on-chain.",
      cta: "Buy SYN with USDC →",
      to: "/join",
      source: "INDEXED",
    };
  } else if (fs === undefined || fs === 0n) {
    action = {
      step: "Step 3 of 4",
      title: "Mint The First Signal (0.50 USDC)",
      reason: `Member #${record.memberNumber} sealed. The Archive ID 1 mint is OPEN — your first protocol artifact, attached to your seat.`,
      cta: "Mint The First Signal →",
      to: "/nft",
      source: "LIVE",
    };
  } else if (ps === undefined || ps === 0n) {
    action = {
      step: "Step 4 of 4",
      title: "Mint the Patron Seal (5.00 USDC)",
      reason: "First Signal recorded on your wallet. The Patron Seal (ID 3) is the optional patron artifact for early members.",
      cta: "Mint the Patron Seal →",
      to: "/nft",
      source: "LIVE",
    };
  } else {
    action = {
      step: "All caught up",
      title: "You're caught up — every verifiable step is sealed",
      reason: "Seat, First Signal, and Patron Seal are all sealed on Avalanche. Coming Next surfaces here the moment a new canonical protocol step becomes available.",
      cta: "Open My Archive →",
      to: "/my-syndicate",
      source: "LIVE",
      done: true,
      verifyHref: record.firstPurchaseTx ? txExplorerUrl(record.firstPurchaseTx) : ARCHIVE_NFT_EXPLORERS.avascan,
      verifyLabel: record.firstPurchaseTx ? "Your first purchase tx ↗" : "Archive contract ↗",
    };
  }

  return (
    <Section id="your-next-action">
      <GlassCard className="p-5 md:p-6 border-[color:var(--gold)]/30">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                Your next action
              </span>
              <span
                className="mono text-[9px] uppercase tracking-[0.18em] rounded border border-border px-1.5 py-0.5 text-muted-foreground"
                aria-label={`Source ${action.source}`}
              >
                {action.source}
              </span>
              <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">
                · {action.step}
              </span>
            </div>
            <h2 className="mt-1 text-lg md:text-xl font-semibold tracking-tight text-foreground">
              {action.done ? "✓ " : ""}{action.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{action.reason}</p>
            {guard.disableRecommendations && (
              <p
                role="status"
                className="mt-2 text-xs text-[color:oklch(0.55_0.16_28)]"
              >
                Indexer is behind by {guard.blocksBehindTip} blocks — this recommendation
                is paused until the feed catches up. Existing on-chain state is unaffected.
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <VerifiedUpToBadge />
              {action.verifyHref && (
                <a
                  href={action.verifyHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
                >
                  {action.verifyLabel ?? "Verify ↗"}
                </a>
              )}
            </div>
          </div>
          {guard.disableRecommendations ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Indexer is catching up — recommendations paused"
              className="mono text-[11px] uppercase tracking-[0.18em] rounded-md px-4 py-2 border border-border/60 text-muted-foreground bg-background/40 cursor-not-allowed whitespace-nowrap"
            >
              {action.cta} (paused)
            </button>
          ) : (
            <Link
              to={action.to}
              className="mono text-[11px] uppercase tracking-[0.18em] rounded-md px-4 py-2 border border-[color:var(--gold)]/60 text-foreground hover:bg-[color:var(--gold)]/10 transition-colors whitespace-nowrap"
            >
              {action.cta}
            </Link>
          )}
        </div>
      </GlassCard>
    </Section>
  );
}
