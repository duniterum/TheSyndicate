// Protocol ledger. Proves the join never fabricates a purpose (purpose is the
// literal "unknown" unless a tx is manually tagged), categories derive from the
// event + founder action, and labels resolve through the known-address registry.

import { describe, it, expect } from "vitest";
import {
  deriveLedgerEntries,
  categoryForEvent,
  UNKNOWN_PURPOSE,
} from "../protocol-ledger";
import { enrichEvent, type ProtocolEvent } from "../protocol-events";
import type { ProtocolEventKind } from "../protocol-event-registry";
import {
  CONTRACTS,
  SYNDICATE_CONFIG,
  SYN_BURN_ADDRESS,
  LP_POOL,
} from "../syndicate-config";

const TX_UNTAGGED = "0x" + "a".repeat(64);
const FOUNDER = SYNDICATE_CONFIG.FOUNDER_WALLET_ADDRESS;
const BUYER = "0x2222222222222222222222222222222222222222";

function mk(
  kind: ProtocolEventKind,
  txHash: string,
  ctx: Parameters<typeof enrichEvent>[1],
  block = 100,
  logIndex = 0,
) {
  const base: ProtocolEvent = {
    id: `${kind}-${block}-${logIndex}`,
    kind,
    title: kind,
    detail: "",
    blockNumber: BigInt(block),
    logIndex,
    txHash,
    badge: "info",
  };
  return enrichEvent(base, ctx);
}

describe("protocol-ledger · deriveLedgerEntries", () => {
  it("uses the literal 'unknown' purpose for an untagged transaction", () => {
    const ev = mk("purchase", TX_UNTAGGED, { from: BUYER, to: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, amount: 100, token: "USDC" });
    const [entry] = deriveLedgerEntries([ev]);
    expect(entry.purpose).toBe(UNKNOWN_PURPOSE);
    expect(entry.isManualTag).toBe(false);
    expect(entry.category).toBe("membership-sale");
    expect(entry.toLabel).toBe("Membership Sale");
  });

  it("uses the manual tag description when the tx hash matches a tagged transaction", () => {
    const ev = mk("lp-add", LP_POOL.creationTx, { from: CONTRACTS.LIQUIDITY_WALLET, to: CONTRACTS.LP_PAIR_ADDRESS, amount: LP_POOL.initialUsdc, token: "USDC" });
    const [entry] = deriveLedgerEntries([ev]);
    expect(entry.isManualTag).toBe(true);
    expect(entry.purpose).not.toBe(UNKNOWN_PURPOSE);
    expect(entry.purpose).toContain("LP seed");
  });

  it("classifies a founder action as founder-funding", () => {
    const ev = mk("burn-founder", TX_UNTAGGED, { from: FOUNDER, to: SYN_BURN_ADDRESS, amount: 1000, token: "SYN" });
    expect(ev.founderAction).toBe("founder-burn");
    expect(categoryForEvent(ev)).toBe("founder-funding");
  });

  it("maps categories from event family", () => {
    const burn = mk("burn-community", TX_UNTAGGED, { from: BUYER, to: SYN_BURN_ADDRESS, amount: 5, token: "SYN" });
    const mint = mk("nft-mint-first-signal", TX_UNTAGGED, { from: CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS, to: BUYER, amount: 1, token: "NFT" });
    expect(categoryForEvent(burn)).toBe("burn");
    expect(categoryForEvent(mint)).toBe("nft-mint-proceeds");
  });
});
