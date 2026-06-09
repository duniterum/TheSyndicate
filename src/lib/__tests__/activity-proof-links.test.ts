// Regression guard: every protocol event row MUST carry a verifiable
// txHash so the UI (ProtocolEventsFeed, NotificationBell, wallet pages)
// can render a working explorer link. A row with no txHash would render
// as an unverifiable claim — banned by the trust model.

import { describe, it, expect } from "vitest";
import type { ProtocolEvent, ProtocolEventKind } from "../protocol-events";
import { isValidTxHash } from "../../components/syndicate/TxProofDrawer";
import { txExplorerUrl } from "../syndicate-config";

const KINDS: ProtocolEventKind[] = [
  "purchase",
  "new-member",
  "rank-reached",
  "swap-buy",
  "swap-sell",
  "lp-add",
  "lp-remove",
  "vault-in",
  "vault-out",
  "nft-mint-first-signal",
  "nft-mint-patron-seal",
  "nft-mint-other",
];

function ev(kind: ProtocolEventKind, n: number): ProtocolEvent {
  const suffix = n.toString(16).padStart(2, "0");
  return {
    id: `${kind}-${n}`,
    kind,
    title: `${kind} ${n}`,
    detail: "detail",
    blockNumber: BigInt(1000 + n),
    logIndex: n,
    txHash: `0x${"a".repeat(62)}${suffix}`,
    actor: "0x0000000000000000000000000000000000000001",
    badge: "live",
  };
}

describe("activity proof-link invariant", () => {
  it("every supported event kind has a sample that resolves to an explorer URL", () => {
    for (let i = 0; i < KINDS.length; i++) {
      const e = ev(KINDS[i], i);
      expect(isValidTxHash(e.txHash), `kind ${e.kind} txHash invalid`).toBe(true);
      const url = txExplorerUrl(e.txHash);
      expect(url, `kind ${e.kind} missing explorer url`).toBeTruthy();
      expect(url!.startsWith("http"), `kind ${e.kind} url not http`).toBe(true);
    }
  });

  it("rejects events with missing or malformed txHash", () => {
    const bad: ProtocolEvent = { ...ev("purchase", 1), txHash: "" };
    expect(isValidTxHash(bad.txHash)).toBe(false);
    const bad2: ProtocolEvent = { ...ev("purchase", 1), txHash: "0xnothex" };
    expect(isValidTxHash(bad2.txHash)).toBe(false);
  });
});
