// Guard: every protocol event MUST carry a tx hash that resolves to a real
// Avascan URL — that is the contract the /activity "Verify ↗" proof pill
// relies on. If this test fails, the proof pill cannot validate origin.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { txExplorerUrl } from "../syndicate-config";
import type { ProtocolEvent, ProtocolEventKind } from "../protocol-events";

const ALL_KINDS: ProtocolEventKind[] = [
  "purchase",
  "new-member",
  "rank-reached",
  "swap-buy",
  "swap-sell",
  "lp-add",
  "lp-remove",
  "vault-in",
  "vault-out",
  "burn-founder",
  "burn-community",
];

function fake(kind: ProtocolEventKind, n: number): ProtocolEvent {
  return {
    id: `${kind}-${n}`,
    kind,
    title: `${kind}`,
    detail: "",
    blockNumber: BigInt(1_000 + n),
    logIndex: n,
    txHash: `0x${"a".repeat(63)}${n}`,
    actor: "0x0000000000000000000000000000000000000001",
    badge: "live",
  };
}

describe("activity row — verify pill origin contract", () => {
  it("every supported event kind resolves to an Avascan tx URL via txExplorerUrl", () => {
    for (const kind of ALL_KINDS) {
      const e = fake(kind, 1);
      const url = txExplorerUrl(e.txHash);
      expect(url, `tx URL missing for ${kind}`).toMatch(/^https?:\/\//);
      expect(url, `tx URL must contain hash for ${kind}`).toContain(e.txHash);
      expect(url, `tx URL must point to an Avalanche explorer for ${kind}`).toMatch(
        /avascan|snowtrace|snowscan|avalanche/i,
      );
    }
  });

  it("ProtocolEventsFeed row source still wires Verify pill to e.txHash via TxProofPill", () => {
    // Source-level guard: regression-proof the wiring without rendering React.
    const src = readFileSync(
      join(process.cwd(), "src/components/syndicate/ProtocolEventsFeed.tsx"),
      "utf8",
    );
    // The row must render a TxProofPill bound to the event's own tx hash.
    expect(src).toMatch(/<TxProofPill[\s\S]{0,200}txHash=\{e\.txHash\}/);
    // And it must still expose the readable short tx hash next to it.
    expect(src).toMatch(/e\.txHash\.slice\(0,\s*8\)/);
    // And the invalid-tx branch must render an explicit "no tx" / "not found" sentinel.
    expect(src).toMatch(/isValidTxHash\(e\.txHash\)/);
  });
});
