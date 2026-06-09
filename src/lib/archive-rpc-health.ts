// Lightweight RPC reachability probe for both Avalanche endpoints.
//
// Independent of wagmi's transport — we directly POST eth_chainId to each
// configured endpoint and report which ones are reachable. Used by the
// /nft on-chain read-health panel so visitors can see *which* endpoint is
// answering and whether the fallback is also healthy.
//
// READ-ONLY. No write paths. No secrets used. ~10s timeout, refresh every 60s.
import { useEffect, useState } from "react";
import {
  AVALANCHE_CHAIN_ID,
  AVALANCHE_RPC_ENDPOINTS,
} from "./syndicate-config";

export type RpcEndpointStatus = {
  label: string;
  url: string;
  ok: boolean;
  chainId: number | null;
  latencyMs: number | null;
  error: string | null;
  checkedAt: number; // ms epoch
};

async function probe(label: string, url: string, signal: AbortSignal): Promise<RpcEndpointStatus> {
  const started = performance.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
      signal,
    });
    if (!res.ok) {
      return {
        label, url, ok: false, chainId: null, latencyMs: null,
        error: `HTTP ${res.status}`, checkedAt: Date.now(),
      };
    }
    const j = (await res.json()) as { result?: string; error?: { message?: string } };
    if (j.error) {
      return {
        label, url, ok: false, chainId: null, latencyMs: null,
        error: j.error.message ?? "RPC error", checkedAt: Date.now(),
      };
    }
    const chainId = j.result ? Number.parseInt(j.result, 16) : null;
    return {
      label, url,
      ok: chainId === AVALANCHE_CHAIN_ID,
      chainId,
      latencyMs: Math.round(performance.now() - started),
      error: chainId === AVALANCHE_CHAIN_ID ? null : `Unexpected chainId ${chainId}`,
      checkedAt: Date.now(),
    };
  } catch (e) {
    return {
      label, url, ok: false, chainId: null, latencyMs: null,
      error: e instanceof Error ? e.message.split("\n")[0] : "Network error",
      checkedAt: Date.now(),
    };
  }
}

export function useArchiveRpcHealth(intervalMs = 60_000) {
  const [endpoints, setEndpoints] = useState<RpcEndpointStatus[]>(() =>
    AVALANCHE_RPC_ENDPOINTS.map(({ label, url }) => ({
      label, url, ok: false, chainId: null, latencyMs: null,
      error: "Not checked yet", checkedAt: 0,
    })),
  );
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    const run = async () => {
      setIsChecking(true);
      const results = await Promise.all(
        AVALANCHE_RPC_ENDPOINTS.map((e) => probe(e.label, e.url, ctrl.signal)),
      );
      if (!cancelled) {
        setEndpoints(results);
        setIsChecking(false);
      }
    };

    void run();
    const t = setInterval(() => void run(), intervalMs);
    return () => {
      cancelled = true;
      ctrl.abort();
      clearInterval(t);
    };
  }, [intervalMs]);

  const activeEndpoint = endpoints.find((e) => e.ok) ?? null;
  return { endpoints, activeEndpoint, isChecking };
}
