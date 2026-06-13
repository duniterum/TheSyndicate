// Guard for the SYN burn scanner's Proof-of-Burn numbering. The live RPC scan
// can't run in unit tests, so we test the PURE numbering contract and the
// scan-floor invariant that guarantees #001 is always in range.

import { describe, it, expect } from "vitest";
import { assignProofOfFireNumbers, type SynBurnEvent } from "../syn-burn-events";
import { PROOF_OF_FIRE_001, SALE_DEPLOYMENT_BLOCK } from "../syndicate-config";

function burn(over: Partial<SynBurnEvent> & { blockNumber: bigint; txHash: string; logIndex: number }): SynBurnEvent {
  return {
    sender: "0x0000000000000000000000000000000000000001",
    amountSyn: 1000,
    isFounder: false,
    ...over,
  };
}

describe("SYN burn scanner — Proof of Burn numbering", () => {
  it("scan floor (SALE_DEPLOYMENT_BLOCK) is at or below Proof of Burn #001's block", () => {
    // If the floor were above #001's block, the cursor scan would never reach it
    // and the numbering would start at the wrong burn.
    expect(SALE_DEPLOYMENT_BLOCK <= PROOF_OF_FIRE_001.blockNumber).toBe(true);
  });

  it("numbers the oldest burn #1 — and the oldest IS Proof of Burn #001", () => {
    // Newest-first input (as the scanner produces) including the real #001 burn.
    const events: SynBurnEvent[] = [
      burn({ blockNumber: 88_000_000n, txHash: "0xbbbb", logIndex: 2 }),
      burn({ blockNumber: 87_900_000n, txHash: "0xaaaa", logIndex: 5 }),
      burn({
        blockNumber: PROOF_OF_FIRE_001.blockNumber,
        txHash: PROOF_OF_FIRE_001.txHash,
        logIndex: 0,
        isFounder: true,
        amountSyn: PROOF_OF_FIRE_001.amountSyn,
      }),
    ];
    const numbered = assignProofOfFireNumbers(events);
    const first = numbered.find((e) => e.proofOfFireNumber === 1);
    expect(first?.txHash).toBe(PROOF_OF_FIRE_001.txHash);
  });

  it("assigns contiguous numbers and preserves input order", () => {
    const events: SynBurnEvent[] = [
      burn({ blockNumber: 300n, txHash: "0xc", logIndex: 0 }),
      burn({ blockNumber: 100n, txHash: "0xa", logIndex: 0 }),
      burn({ blockNumber: 200n, txHash: "0xb", logIndex: 0 }),
    ];
    const numbered = assignProofOfFireNumbers(events);
    // Input order preserved.
    expect(numbered.map((e) => e.txHash)).toEqual(["0xc", "0xa", "0xb"]);
    // Numbers follow chronological order (oldest = 1).
    expect(numbered.find((e) => e.txHash === "0xa")?.proofOfFireNumber).toBe(1);
    expect(numbered.find((e) => e.txHash === "0xb")?.proofOfFireNumber).toBe(2);
    expect(numbered.find((e) => e.txHash === "0xc")?.proofOfFireNumber).toBe(3);
  });

  it("breaks ties within a block by logIndex (oldest log = lower number)", () => {
    const events: SynBurnEvent[] = [
      burn({ blockNumber: 500n, txHash: "0xy", logIndex: 7 }),
      burn({ blockNumber: 500n, txHash: "0xx", logIndex: 3 }),
    ];
    const numbered = assignProofOfFireNumbers(events);
    expect(numbered.find((e) => e.txHash === "0xx")?.proofOfFireNumber).toBe(1);
    expect(numbered.find((e) => e.txHash === "0xy")?.proofOfFireNumber).toBe(2);
  });
});
