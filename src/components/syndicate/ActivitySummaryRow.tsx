// Live summary row for /activity — five at-a-glance counts derived from
// the same useProtocolEvents stream that powers the feed below.
// Bigger readable values, proof pills, click any tile to verify the
// underlying contract on Avascan.

import { useMemo } from "react";
import { useProtocolEvents } from "@/lib/protocol-events";
import { summarizeActivity, applyActivityFilter, type ActivityFilterKey } from "@/lib/activity-filters";
import { CONTRACTS } from "@/lib/syndicate-config";
import { explorerUrlForAddress, txExplorerUrl } from "@/lib/syndicate-config";
import { Pill, StatusPill } from "./Primitives";
import { TxProofPill } from "./TxProofDrawer";

const fmtN = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtUsd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

type Tile = {
  label: string;
  value: string;
  hint: string;
  verifyHref?: string | null;
};

export function ActivitySummaryRow({ window = 200 }: { window?: number }) {
  const { events, isLoading } = useProtocolEvents({ limit: window });
  const summary = useMemo(() => summarizeActivity(events), [events]);

  const saleHref = explorerUrlForAddress(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS);
  const archiveHref = explorerUrlForAddress(CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS);
  const lpHref = explorerUrlForAddress(CONTRACTS.LP_PAIR_ADDRESS);
  const vaultHref = explorerUrlForAddress(CONTRACTS.VAULT_WALLET);
  const lastTxHref = summary.lastEventTxHash ? txExplorerUrl(summary.lastEventTxHash) : null;

  const tiles: Tile[] = [
    {
      label: "Events (window)",
      value: fmtN(summary.total),
      hint: `Last ${window} on-chain rows merged from purchases, LP, vault, archive`,
      verifyHref: lastTxHref,
    },
    {
      label: "Membership",
      value: fmtN(summary.membership),
      hint: "Sale purchases + rank-reached in window",
      verifyHref: saleHref,
    },
    {
      label: "Archive entries",
      value: fmtN(summary.archive),
      hint: "New members archived in window",
      verifyHref: archiveHref,
    },
    {
      label: "Liquidity",
      value: fmtN(summary.liquidity),
      hint: "LP swaps + add/remove in window",
      verifyHref: lpHref,
    },
    {
      label: "Vault flows",
      value: fmtN(summary.vault),
      hint: `${fmtUsd(summary.usdcSettledTotal)} USDC across all rows`,
      verifyHref: vaultHref,
    },
  ];

  return (
    <div className="surface elevated p-4 md:p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2">
          <StatusPill status={isLoading && summary.total === 0 ? "PARTIAL" : "LIVE"} />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Window summary · last {window} rows · click any tile to verify
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {summary.lastEventBlock !== undefined && (
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Last block {summary.lastEventBlock.toString()}
            </span>
          )}
          {summary.lastEventTxHash && (
            <TxProofPill
              txHash={summary.lastEventTxHash}
              label="Verify latest"
              ariaLabel="Verify latest event transaction"
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {tiles.map((t) => (
          <SummaryTile key={t.label} t={t} />
        ))}
      </div>
    </div>
  );
}

export function getActivityChipCounts(
  events: ReturnType<typeof useProtocolEvents>["events"],
): Partial<Record<ActivityFilterKey, number>> {
  return {
    all: applyActivityFilter(events, "all").length,
    membership: applyActivityFilter(events, "membership").length,
    archive: applyActivityFilter(events, "archive").length,
    nft: applyActivityFilter(events, "nft").length,
    liquidity: applyActivityFilter(events, "liquidity").length,
    vault: applyActivityFilter(events, "vault").length,
  };
}

function SummaryTile({ t }: { t: Tile }) {
  const inner = (
    <div className="surface p-3 h-full flex flex-col gap-1 transition-colors hover:border-[var(--gold)]/40">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {t.label}
      </div>
      <div className="mono text-2xl md:text-3xl font-semibold leading-none mt-1 tabular-nums">
        {t.value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
        {t.hint}
      </div>
      <div className="mt-auto pt-2">
        <Pill tone={t.verifyHref ? "navy" : "muted"}>
          {t.verifyHref ? "Verify ↗" : "No source"}
        </Pill>
      </div>
    </div>
  );
  if (!t.verifyHref) return inner;
  return (
    <a
      href={t.verifyHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Verify ${t.label} on Avascan`}
      className="block"
    >
      {inner}
    </a>
  );
}
