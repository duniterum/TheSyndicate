// Chronicle candidate layer. Proves person-subject kinds never become
// candidates (clause 6), every suggested copy passes the constitutional
// vocabulary gate, candidates default to CANDIDATE (no auto-publish), the
// first occurrence of a kind is elevated to "always", and subject hints map
// to protocol primitives with correct promotability.

import { describe, it, expect } from "vitest";
import {
  deriveChronicleCandidates,
  validateCandidateCopy,
  worthinessForKind,
  statusForEvent,
} from "../chronicle-candidates";
import { enrichEvent, type ProtocolEvent } from "../protocol-events";
import type { ProtocolEventKind } from "../protocol-event-registry";
import { CONTRACTS, SYNDICATE_CONFIG, SYN_BURN_ADDRESS } from "../syndicate-config";

const TX = "0x" + "c".repeat(64);
const FOUNDER = SYNDICATE_CONFIG.FOUNDER_WALLET_ADDRESS;
const BUYER = "0x3333333333333333333333333333333333333333";

function mk(
  kind: ProtocolEventKind,
  block: number,
  logIndex: number,
  ctx: Parameters<typeof enrichEvent>[1],
) {
  const base: ProtocolEvent = {
    id: `${kind}-${block}-${logIndex}`,
    kind,
    title: kind,
    detail: "",
    blockNumber: BigInt(block),
    logIndex,
    txHash: TX,
    badge: "info",
  };
  return enrichEvent(base, ctx);
}

const EVENTS = [
  mk("purchase", 100, 0, { from: BUYER, to: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, amount: 100, token: "USDC" }),
  mk("new-member", 100, 1, { from: BUYER, to: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS }),
  mk("rank-reached", 101, 0, { from: BUYER }),
  mk("burn-founder", 102, 0, { from: FOUNDER, to: SYN_BURN_ADDRESS, amount: 1000, token: "SYN" }),
  mk("nft-mint-first-signal", 103, 0, { from: CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS, to: BUYER, amount: 1, token: "NFT" }),
  mk("lp-add", 104, 0, { from: CONTRACTS.LIQUIDITY_WALLET, to: CONTRACTS.LP_PAIR_ADDRESS, amount: 50, token: "USDC" }),
  mk("lp-add", 105, 0, { from: CONTRACTS.LIQUIDITY_WALLET, to: CONTRACTS.LP_PAIR_ADDRESS, amount: 60, token: "USDC" }),
];

describe("chronicle-candidates · deriveChronicleCandidates", () => {
  const cands = deriveChronicleCandidates(EVENTS);

  it("never produces a candidate for a person-subject kind", () => {
    const personKinds: ProtocolEventKind[] = ["purchase", "new-member", "rank-reached"];
    expect(cands.some((c) => personKinds.includes(c.kind))).toBe(false);
  });

  it("produces candidates only for protocol-primitive milestones", () => {
    // burn-founder, nft-mint-first-signal, lp-add ×2 = 4
    expect(cands.length).toBe(4);
  });

  it("passes the constitutional vocabulary gate for every suggested copy", () => {
    for (const c of cands) {
      expect(c.copyViolations, `${c.kind} copy`).toEqual([]);
    }
  });

  it("defaults every candidate to CANDIDATE (no auto-publish)", () => {
    for (const c of cands) expect(c.status).toBe("CANDIDATE");
    expect(statusForEvent("nonexistent-event")).toBe("CANDIDATE");
  });

  it("maps subject hints to protocol primitives with correct promotability", () => {
    const burn = cands.find((c) => c.kind === "burn-founder")!;
    const mint = cands.find((c) => c.kind === "nft-mint-first-signal")!;
    const lp = cands.find((c) => c.kind === "lp-add")!;
    expect(burn.subjectHint).toBe("supply");
    expect(burn.promotable).toBe(false); // supply not in locked chapter|archive set
    expect(mint.subjectHint).toBe("archive");
    expect(mint.promotable).toBe(true);
    expect(lp.subjectHint).toBe("liquidity");
    expect(lp.promotable).toBe(false);
  });

  it("elevates the first occurrence of a kind to 'always'", () => {
    const lpAdds = cands.filter((c) => c.kind === "lp-add");
    expect(lpAdds.length).toBe(2);
    expect(lpAdds.some((c) => c.worthiness === "always")).toBe(true);
    expect(lpAdds.some((c) => c.worthiness === "sometimes")).toBe(true);
  });

  it("phrases first-of-kind window-relative unless the window is complete", () => {
    // Default: a truncated window must not claim a protocol-wide first.
    const burn = cands.find((c) => c.kind === "burn-founder")!;
    expect(burn.reason).toContain("current sample");
    expect(burn.reason).not.toContain("recorded by the protocol");

    // Only a gapless full-history scan may assert the genuine first.
    const complete = deriveChronicleCandidates(EVENTS, { windowComplete: true });
    const burnComplete = complete.find((c) => c.kind === "burn-founder")!;
    expect(burnComplete.reason).toContain("recorded by the protocol");
  });
});

describe("chronicle-candidates · worthinessForKind + validateCandidateCopy", () => {
  it("rates person-subject + routine kinds activity-only", () => {
    expect(worthinessForKind("purchase")).toBe("activity-only");
    expect(worthinessForKind("swap-buy")).toBe("activity-only");
    expect(worthinessForKind("burn-founder")).toBe("always");
  });

  it("catches banned terms, forbidden subjects, and forbidden language", () => {
    const errs = validateCandidateCopy({
      title: "Member #5 joined",
      body: "the founder did something amazing",
      whatChanged: "guaranteed returns and yield",
    });
    expect(errs.length).toBeGreaterThan(0);
  });
});
