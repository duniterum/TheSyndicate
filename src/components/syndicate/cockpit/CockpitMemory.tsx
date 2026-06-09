// CockpitMemory — Wave C2 retention / "what changed while I was away" loop.
//
// Three honest surfaces, assembled (no fabricated data):
//   • SinceLastVisitStory  — protocol-wide deltas vs your last visit, sourced
//     from a backend httpOnly cookie. First-visit safe (welcomes, never invents
//     diffs) and shows a skeleton during the roundtrip. (CACHED cookie + LIVE)
//   • PersonalMemoryTimeline — wallet-scoped history spine: when you joined,
//     your latest purchase, purchase count, artifacts owned. Every row is a
//     live on-chain read / indexed event with a proof link. Honest connect &
//     "no wallet events yet" states. (INDEXED + LIVE)
//   • WhatChangedForYou — wallet memory: seat/rank/USDC facts, protocol
//     milestones since you joined, and what's coming next. Renders nothing for
//     disconnected visitors. (INDEXED + LIVE)
//
// Deltas that are NOT tracked are intentionally omitted, never faked: there is
// no per-wallet visit snapshot, so we do not pretend to diff your wallet
// activity / artifact mints "since last visit" — the wallet surfaces below show
// real since-JOIN history instead.

import { useAccount } from "wagmi";
import { useHolderIndex } from "@/lib/holder-index";
import { useChainTime } from "@/lib/chain-time";
import { useArchiveBalances } from "@/lib/archive-balances-hook";
import {
  txExplorerUrl,
  explorerUrlForAddress,
  ARCHIVE_NFT_EXPLORERS,
} from "@/lib/syndicate-config";
import { isValidTxHash } from "@/components/syndicate/TxProofDrawer";
import { SinceLastVisitStory } from "@/components/syndicate/SinceLastVisitStory";
import { WhatChangedForYou } from "@/components/syndicate/WhatChangedForYou";
import { GlassCard, Section, StatusPill } from "@/components/syndicate/Primitives";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function fmtDate(unix: number | undefined): string {
  if (unix === undefined) return "—";
  const d = new Date(unix * 1000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
const fmtUsd = (n: number | undefined, dgts = 2) =>
  n === undefined ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: dgts })}`;
const fmtInt = (n: number | undefined) =>
  n === undefined ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function CockpitMemory() {
  return (
    <>
      <Section id="since-away" className="py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusPill status="LIVE" />
          <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal">
            Since You Were Away
          </h2>
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            · protocol deltas since your last visit · your wallet history since you joined
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <SinceLastVisitStory />
          <PersonalMemoryTimeline />
        </div>
      </Section>

      {/* Wallet memory — renders nothing for disconnected visitors. */}
      <WhatChangedForYou />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PersonalMemoryTimeline — wallet-scoped history spine. Every row is a real
// on-chain read / indexed event with a proof link. No invented history.
// ─────────────────────────────────────────────────────────────────────────
function PersonalMemoryTimeline() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const chainTime = useChainTime();
  const balances = useArchiveBalances([1, 3]);
  const record = address ? idx.getByWallet(address) : undefined;

  const status: "LIVE" | "PARTIAL" | "PENDING" = !isConnected
    ? "PENDING"
    : idx.isLoading
      ? "PARTIAL"
      : record
        ? "LIVE"
        : "PENDING";

  const artifactText = (() => {
    const fs = balances.balances[1]?.balance;
    const ps = balances.balances[3]?.balance;
    if (fs === undefined && ps === undefined) {
      return balances.isLoading ? "Read pending…" : "Ownership read pending";
    }
    const parts: string[] = [];
    if (fs !== undefined && fs > 0n) parts.push(`First Signal × ${fs.toString()}`);
    if (ps !== undefined && ps > 0n) parts.push(`Patron Seal × ${ps.toString()}`);
    return parts.length ? parts.join(" · ") : "None held yet";
  })();

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <StatusPill status={status} />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
          Your history · since you joined
        </span>
      </div>

      {!isConnected ? (
        <p className="text-sm text-muted-foreground">
          Connect your wallet to load your on-chain history — when you joined,
          your latest purchase, and the artifacts you hold. Every row is a live
          read with a proof link.
        </p>
      ) : !record ? (
        <p className="text-sm text-muted-foreground" role="status">
          No wallet events yet. Your first Membership Sale purchase will anchor
          this timeline with a permanent on-chain receipt.
        </p>
      ) : (
        <ol className="relative border-l border-border/50 ml-1 space-y-4">
          <TimelineRow
            label="Joined"
            primary={`Member #${record.memberNumber.toLocaleString("en-US")}`}
            secondary={`≈ ${fmtDate(chainTime.blockToUnix(record.firstPurchaseBlock))} · block ${record.firstPurchaseBlock.toString()}`}
            href={isValidTxHash(record.firstPurchaseTx) ? txExplorerUrl(record.firstPurchaseTx) : undefined}
            verifyLabel="First-purchase tx ↗"
          />
          <TimelineRow
            label="Latest purchase"
            primary={`${fmtUsd(record.lastPurchaseUsdc)} routed`}
            secondary={`≈ ${fmtDate(chainTime.blockToUnix(record.lastPurchaseBlock))} · block ${record.lastPurchaseBlock.toString()}`}
            href={isValidTxHash(record.lastPurchaseTx) ? txExplorerUrl(record.lastPurchaseTx) : undefined}
            verifyLabel="Latest tx ↗"
          />
          <TimelineRow
            label="Total purchases"
            primary={`${fmtInt(record.purchaseCount)} sealed on-chain`}
            secondary={`${fmtUsd(record.cumulativeUsdc)} USDC routed cumulatively`}
            href={explorerUrlForAddress(record.wallet) ?? undefined}
            verifyLabel="Your wallet ↗"
          />
          <TimelineRow
            label="Artifacts owned"
            primary={artifactText}
            secondary="Live balanceOf · Archive1155"
            href={ARCHIVE_NFT_EXPLORERS.avascan}
            verifyLabel="Archive contract ↗"
          />
        </ol>
      )}
    </GlassCard>
  );
}

function TimelineRow({
  label,
  primary,
  secondary,
  href,
  verifyLabel,
}: {
  label: string;
  primary: string;
  secondary: string;
  href?: string;
  verifyLabel?: string;
}) {
  return (
    <li className="ml-4">
      <span
        aria-hidden
        className="absolute -left-[5px] mt-1.5 size-2 rounded-full bg-[var(--gold)]/70 ring-2 ring-background"
      />
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground">{primary}</div>
      <div className="mono text-[11px] text-muted-foreground">{secondary}</div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
        >
          {verifyLabel ?? "Verify ↗"}
        </a>
      )}
    </li>
  );
}
