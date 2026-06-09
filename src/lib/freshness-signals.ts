// Freshness signals — RPC head vs latest indexed activity vs indexer probe.
//
// Purpose: give users one place to verify the activity feed is truly
// current, with no hidden lag. All three numbers are live; none are
// estimated.
//
// Sources:
//   • rpcHeadBlock     ← publicClient.getBlockNumber()
//   • latestEventBlock ← max(blockNumber) over useLivePurchaseEvents
//   • indexerProbe     ← GET /api/public/indexer/health
//
// Avalanche C-Chain block time ≈ 2s — used only for a human-readable
// "Xs ago" hint next to block deltas. The block number itself is
// always the source of truth.

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { useLivePurchaseEvents } from "./activity-hooks";

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
  const publicClient = usePublicClient();

  // 1. RPC head — refetch every 15s.
  const head = useQuery({
    queryKey: ["freshness", "rpc-head"],
    enabled: Boolean(publicClient),
    refetchInterval: 15_000,
    staleTime: 5_000,
    queryFn: async () => {
      if (!publicClient) return null;
      const n = await publicClient.getBlockNumber();
      return { block: n, at: Date.now() };
    },
  });

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
  const rpcHeadBlock = head.data?.block;
  const rpcHeadFetchedAt = head.data?.at;
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
