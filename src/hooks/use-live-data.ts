import { useState, useEffect, useCallback } from "react";

export interface LiveMetrics {
  vaultValue: number;
  usdcReceived: number;
  synDistributed: number;
  members: number;
  tokenHolders: number;
  genesisNfts: number;
  lpLiquidity: number;
  syndicateIndex: number;
  blockNumber: number;
  episode: string;
  nextMilestone: number;
  lastUpdated: Date;
  tick: number;
}

// Realistic demo baseline so the dashboard never looks "empty / broken".
// Clearly labeled in UI as "Demo data · V1 design preview".
const BASE: LiveMetrics = {
  vaultValue: 12_740,
  usdcReceived: 18_200,
  synDistributed: 1_820_000,
  members: 428,
  tokenHolders: 391,
  genesisNfts: 126,
  lpLiquidity: 3_640,
  syndicateIndex: 612,
  blockNumber: 19_482_117,
  episode: "001",
  nextMilestone: 25_000,
  lastUpdated: new Date(),
  tick: 0,
};

function jitter(n: number, maxDelta: number): number {
  const delta = (Math.random() - 0.5) * 2 * maxDelta;
  return Math.max(0, Math.round((n + delta) * 100) / 100);
}

export function useLiveData(refreshMs = 4000) {
  const [metrics, setMetrics] = useState<LiveMetrics>(BASE);

  const refresh = useCallback(() => {
    setMetrics((prev) => {
      const next: LiveMetrics = {
        ...prev,
        vaultValue: jitter(prev.vaultValue, 25),
        usdcReceived: jitter(prev.usdcReceived, 20),
        synDistributed: Math.round(jitter(prev.synDistributed, 1500)),
        members: prev.members + (Math.random() > 0.7 ? 1 : 0),
        tokenHolders: prev.tokenHolders + (Math.random() > 0.75 ? 1 : 0),
        genesisNfts: prev.genesisNfts + (Math.random() > 0.85 ? 1 : 0),
        lpLiquidity: jitter(prev.lpLiquidity, 15),
        syndicateIndex: Math.round(jitter(prev.syndicateIndex, 3)),
        blockNumber: prev.blockNumber + Math.floor(1 + Math.random() * 3),
        lastUpdated: new Date(),
        tick: prev.tick + 1,
      };
      if (next.usdcReceived < next.vaultValue) next.usdcReceived = next.vaultValue + 5_460;
      return next;
    });
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, refreshMs);
    return () => clearInterval(id);
  }, [refresh, refreshMs]);

  return metrics;
}

export function fmtTimestamp(d: Date): string {
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}
