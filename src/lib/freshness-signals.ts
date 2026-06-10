// Freshness signals — RPC head vs latest indexed activity vs indexer probe.
//
// Purpose: give users one place to verify the activity feed is truly
// current, with no hidden lag. All three numbers are live; none are
// estimated.
//
// Sources:
//   • rpcHeadBlock     ← shared chain-tip (useChainTip / CHAIN_TIP_QUERY_KEY)
//   • latestEventBlock ← max(blockNumber) over useLivePurchaseEvents
//   • indexerProbe     ← GET /api/public/indexer/health
//
// Avalanche C-Chain block time ≈ 2s — used only for a human-readable
// "Xs ago" hint next to block deltas. The block number itself is
// always the source of truth.

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLivePurchaseEvents } from "./activity-hooks";
import { useChainTip } from "./chain-time";

export const AVALANCHE_BLOCK_TIME_SEC = 2;

export type IndexerProbeReport = {
  generatedAt: string;
  indexerKind: "mock" | "live";
  ok: boolean;
};

export type FreshnessSignals = {
  // RPC head
  rpcHeadBlock: bigint | undefined;
  rpcHeadFetchedAt: number | undefined; // ms epoch
  rpcAgeSec: number | undefined;

  // Latest activity event we have indexed locally (from RPC log scan)
  latestEventBlock: bigint | undefined;
  blocksBehindTip: number | undefined;
  estimatedLagSec: number | undefined;

  // Background indexer probe (separate system; today: mock)
  indexer: IndexerProbeReport | undefined;
  indexerAgeSec: number | undefined;
  indexerHttpOk: boolean | undefined;

  // Liveness
  refetch: () => void;
  isLoading: boolean;
};

/**
 * Subscribes to RPC head, latest activity event, and the indexer health
 * probe. Re-renders every 10s so the "Xs ago" counters tick.
 */
export function useFreshnessSignals(): FreshnessSignals {
  // 1. RPC head — the SHARED chain-tip query (also powering chain-time and the
  // homepage pulse), not a second independent head fetch (P4d). The head block
  // value and the lag math below are unchanged; only the SOURCE is unified, so
  // every "where is the chain right now?" surface reads one head block. Because
  // the purchase scan now resolves its tip from this same shared query, the most
  // common cause of a spurious negative blocksBehindTip — freshness and the scan
  // reading DIFFERENT RPC nodes (cross-source skew) — is removed. The head is
  // still not strictly monotonic across time (a later read can hit a lagging
  // node), so the prior lag semantics (no clamp) are otherwise preserved, and a
  // transient negative remains theoretically possible. Cadence note: the head
  // now refreshes on the shared chain-tip interval, not freshness's old one.
  const head = useChainTip();

  // 2. Latest activity event (reuses the existing canonical hook —
  // no second RPC scan).
  const events = useLivePurchaseEvents({ limit: 1 });
  const latestEventBlock = (events.data ?? []).reduce<bigint | undefined>(
    (acc, e) => (acc === undefined || e.blockNumber > acc ? e.blockNumber : acc),
    undefined,
  );

  // 3. Indexer probe — refetch every 60s.
  const probe = useQuery({
    queryKey: ["freshness", "indexer-probe"],
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<{ report: IndexerProbeReport | null; httpOk: boolean }> => {
      try {
        const r = await fetch("/api/public/indexer/health", { cache: "no-store" });
        const json = (await r.json()) as IndexerProbeReport;
        return { report: json, httpOk: r.ok };
      } catch {
        return { report: null, httpOk: false };
      }
    },
  });

  // Tick every 10s so "Xs ago" advances even without a refetch.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();
  const rpcHeadBlock = head.data?.number;
  const rpcHeadFetchedAt = head.dataUpdatedAt || undefined;
  const rpcAgeSec =
    rpcHeadFetchedAt !== undefined ? Math.max(0, Math.floor((now - rpcHeadFetchedAt) / 1000)) : undefined;

  const blocksBehindTip =
    rpcHeadBlock !== undefined && latestEventBlock !== undefined
      ? Number(rpcHeadBlock - latestEventBlock)
      : undefined;
  const estimatedLagSec =
    blocksBehindTip !== undefined ? blocksBehindTip * AVALANCHE_BLOCK_TIME_SEC : undefined;

  const indexerReport = probe.data?.report ?? undefined;
  const indexerAgeSec = indexerReport?.generatedAt
    ? Math.max(0, Math.floor((now - new Date(indexerReport.generatedAt).getTime()) / 1000))
    : undefined;

  return {
    rpcHeadBlock,
    rpcHeadFetchedAt,
    rpcAgeSec,
    latestEventBlock,
    blocksBehindTip,
    estimatedLagSec,
    indexer: indexerReport,
    indexerAgeSec,
    indexerHttpOk: probe.data?.httpOk,
    refetch: () => {
      void head.refetch();
      void events.refetch();
      void probe.refetch();
    },
    isLoading: head.isLoading || events.isLoading || probe.isLoading,
  };
}

export function formatAgo(sec: number | undefined): string {
  if (sec === undefined) return "—";
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}
