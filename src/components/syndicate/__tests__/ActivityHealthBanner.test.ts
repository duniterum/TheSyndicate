// Unit tests for computeActivityHealth — verifies the LIVE / INDEXED /
// PARTIAL / FAIL messaging contract for each freshness-signal shape.
// Pure-function tests — no DOM, no React renderer needed.

import { describe, it, expect } from "vitest";
import { computeActivityHealth } from "../ActivityHealthBanner";
import type { FreshnessSignals } from "@/lib/freshness-signals";

type Input = Parameters<typeof computeActivityHealth>[0];

const base: Input = {
  rpcHeadBlock: 100n,
  isLoading: false,
  indexer: { generatedAt: new Date().toISOString(), indexerKind: "live", ok: true },
  indexerHttpOk: true,
  blocksBehindTip: 0,
  estimatedLagSec: 0,
  latestEventBlock: 100n,
};

describe("computeActivityHealth", () => {
  it("LIVE — RPC at tip, indexer healthy", () => {
    const r = computeActivityHealth(base);
    expect(r.overall).toBe("LIVE");
    expect(r.tone).toBe("success");
    expect(r.loading).toBe(false);
    expect(r.message).toMatch(/at chain tip/i);
  });

  it("INDEXED — indexer is mock but RPC is live", () => {
    const r = computeActivityHealth({
      ...base,
      indexer: { generatedAt: new Date().toISOString(), indexerKind: "mock", ok: true },
    });
    expect(r.overall).toBe("INDEXED");
    expect(r.tone).toBe("warning");
    expect(r.message).toMatch(/direct rpc fallback active/i);
    expect(r.message).toMatch(/pending\/mock/i);
  });

  it("INDEXED — indexer HTTP probe failed but RPC is live and events exist", () => {
    const r = computeActivityHealth({
      ...base,
      indexerHttpOk: false,
      indexer: undefined,
    });
    expect(r.overall).toBe("INDEXED");
    expect(r.message).toMatch(/direct rpc fallback active/i);
  });

  it("PARTIAL — no indexed events in this window", () => {
    const r = computeActivityHealth({ ...base, latestEventBlock: undefined });
    expect(r.overall).toBe("PARTIAL");
    expect(r.tone).toBe("warning");
    expect(r.message).toMatch(/no indexed events in this window/i);
  });

  it("PARTIAL — indexer delayed (>50 blocks behind)", () => {
    const r = computeActivityHealth({
      ...base,
      blocksBehindTip: 120,
      estimatedLagSec: 240,
    });
    expect(r.overall).toBe("PARTIAL");
    expect(r.message).toMatch(/indexer delayed/i);
    expect(r.message).toMatch(/120 blocks behind/);
    expect(r.message).toMatch(/direct rpc fallback active/i);
  });

  it("PARTIAL — slight lag (>5 blocks), indexer otherwise healthy", () => {
    const r = computeActivityHealth({
      ...base,
      blocksBehindTip: 12,
      estimatedLagSec: 24,
    });
    expect(r.overall).toBe("PARTIAL");
    expect(r.message).toMatch(/12 blocks behind/);
    expect(r.message).toMatch(/still streaming live/i);
  });

  it("FAIL — RPC unreachable", () => {
    const r = computeActivityHealth({
      ...base,
      rpcHeadBlock: undefined,
      isLoading: false,
      latestEventBlock: undefined,
    });
    expect(r.overall).toBe("FAIL");
    expect(r.tone).toBe("danger");
    expect(r.message).toMatch(/rpc unreachable/i);
  });

  it("loading — still booting, no RPC head yet", () => {
    const r = computeActivityHealth({
      ...base,
      rpcHeadBlock: undefined,
      isLoading: true,
      latestEventBlock: undefined,
    });
    expect(r.loading).toBe(true);
    expect(r.overall).toBe("PARTIAL");
    expect(r.message).toMatch(/reading the chain/i);
  });

  it("messaging snapshot — full matrix", () => {
    const matrix = {
      LIVE: computeActivityHealth(base),
      INDEXED: computeActivityHealth({
        ...base,
        indexer: { generatedAt: "x", indexerKind: "mock", ok: true },
      }),
      PARTIAL_NO_EVENTS: computeActivityHealth({ ...base, latestEventBlock: undefined }),
      PARTIAL_DELAYED: computeActivityHealth({ ...base, blocksBehindTip: 80, estimatedLagSec: 160 }),
      FAIL: computeActivityHealth({ ...base, rpcHeadBlock: undefined, latestEventBlock: undefined }),
      LOADING: computeActivityHealth({
        ...base,
        rpcHeadBlock: undefined,
        latestEventBlock: undefined,
        isLoading: true,
      }),
    };
    expect({
      LIVE: matrix.LIVE.overall,
      INDEXED: matrix.INDEXED.overall,
      PARTIAL_NO_EVENTS: matrix.PARTIAL_NO_EVENTS.overall,
      PARTIAL_DELAYED: matrix.PARTIAL_DELAYED.overall,
      FAIL: matrix.FAIL.overall,
      LOADING_TONE: matrix.LOADING.loading,
    }).toMatchInlineSnapshot(`
      {
        "FAIL": "FAIL",
        "INDEXED": "INDEXED",
        "LIVE": "LIVE",
        "LOADING_TONE": true,
        "PARTIAL_DELAYED": "PARTIAL",
        "PARTIAL_NO_EVENTS": "PARTIAL",
      }
    `);
  });
});

// Type sanity: the input type accepted by computeActivityHealth must be a
// strict subset of FreshnessSignals so the production banner can pass the
// hook output directly.
const _typeCheck: Input = {} as FreshnessSignals;
void _typeCheck;
