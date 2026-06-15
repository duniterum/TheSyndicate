// =============================================================================
//  V1 membership proof flow — WS2 (pure helpers, fail-closed)
// =============================================================================
//  Pins the truth-doctrine contract of src/lib/v1-proof.ts: a proof is never
//  invented, a non-ready (pending / unavailable / malformed) artifact BLOCKS the
//  buy, and an address absent from a READY artifact is a new buyer (empty proof).
//  All functions under test are pure — no network, no React.
// =============================================================================
import { describe, it, expect } from "vitest";
import {
  parseV1ProofArtifact,
  isArtifactReady,
  isArtifactCanonical,
  getV1Proof,
  isKnownV1Member,
  resolveV1ProofForBuy,
  buildV2BuyArgs,
  ZERO_ADDRESS,
  V1_MEMBER_ROOT,
  type V1ProofArtifact,
} from "../v1-proof";

const MEMBER = "0x244531C571966f90f4849e03a507543d90f9C721";
const STRANGER = "0x000000000000000000000000000000000000BEEF";
const PROOF = ["0x1111111111111111111111111111111111111111111111111111111111111111"];

function ready(over: Partial<V1ProofArtifact> = {}): V1ProofArtifact {
  return {
    pending: false,
    root: "0xae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff",
    count: 1,
    proofs: { [MEMBER]: PROOF },
    ...over,
  };
}

const PENDING: V1ProofArtifact = { pending: true, root: null, count: 0, proofs: {} };

describe("WS2 · parseV1ProofArtifact (defensive)", () => {
  it("parses a well-formed PENDING artifact", () => {
    const a = parseV1ProofArtifact({ pending: true, root: null, count: 0, proofs: {} });
    expect(a).not.toBeNull();
    expect(a!.pending).toBe(true);
    expect(a!.root).toBeNull();
  });

  it("parses a well-formed READY artifact", () => {
    const a = parseV1ProofArtifact({ pending: false, root: "0xabc", count: 1, proofs: { [MEMBER]: PROOF } });
    expect(a).not.toBeNull();
    expect(a!.proofs[MEMBER]).toEqual(PROOF);
  });

  it("returns null for non-objects and garbage", () => {
    expect(parseV1ProofArtifact(null)).toBeNull();
    expect(parseV1ProofArtifact("nope")).toBeNull();
    expect(parseV1ProofArtifact(42)).toBeNull();
  });

  it("returns null when root is the wrong type", () => {
    expect(parseV1ProofArtifact({ pending: true, root: 5, count: 0, proofs: {} })).toBeNull();
  });

  it("returns null for a non-pending artifact with no real root", () => {
    expect(parseV1ProofArtifact({ pending: false, root: null, count: 0, proofs: {} })).toBeNull();
    expect(parseV1ProofArtifact({ pending: false, root: "", count: 0, proofs: {} })).toBeNull();
  });

  it("returns null for bad count or bad proofs", () => {
    expect(parseV1ProofArtifact({ pending: true, root: null, count: -1, proofs: {} })).toBeNull();
    expect(parseV1ProofArtifact({ pending: true, root: null, count: 1, proofs: null })).toBeNull();
    expect(parseV1ProofArtifact({ pending: true, root: null, count: 1, proofs: { a: "x" } })).toBeNull();
    expect(parseV1ProofArtifact({ pending: true, root: null, count: 1, proofs: { a: [1] } })).toBeNull();
  });
});

describe("WS2 · isArtifactReady", () => {
  it("true only for a non-pending artifact with a real root", () => {
    expect(isArtifactReady(ready())).toBe(true);
  });
  it("false for pending, null, undefined, or empty root", () => {
    expect(isArtifactReady(PENDING)).toBe(false);
    expect(isArtifactReady(null)).toBe(false);
    expect(isArtifactReady(undefined)).toBe(false);
    expect(isArtifactReady(ready({ root: "" }))).toBe(false);
  });
});

describe("WS2 · isArtifactCanonical (airtight buy gate)", () => {
  it("true only when structurally ready AND root matches the sealed on-chain root AND count matches proofs", () => {
    expect(isArtifactCanonical(ready())).toBe(true);
    expect(ready().root).toBe(V1_MEMBER_ROOT);
  });
  it("false when the root differs from the sealed on-chain V1_MEMBER_ROOT (e.g. a regenerated snapshot that dropped a member)", () => {
    expect(isArtifactCanonical(ready({ root: "0x" + "11".repeat(32) }))).toBe(false);
  });
  it("false when declared count disagrees with the number of proofs carried", () => {
    expect(isArtifactCanonical(ready({ count: 5 }))).toBe(false);
  });
  it("false for pending, null, or undefined artifacts", () => {
    expect(isArtifactCanonical(PENDING)).toBe(false);
    expect(isArtifactCanonical(null)).toBe(false);
    expect(isArtifactCanonical(undefined)).toBe(false);
  });
});

describe("WS2 · getV1Proof / isKnownV1Member (case-insensitive)", () => {
  it("finds a member's proof regardless of address casing", () => {
    expect(getV1Proof(ready(), MEMBER.toLowerCase())).toEqual(PROOF);
    expect(getV1Proof(ready(), MEMBER.toUpperCase())).toEqual(PROOF);
  });
  it("returns null for an unknown address", () => {
    expect(getV1Proof(ready(), STRANGER)).toBeNull();
    expect(isKnownV1Member(ready(), STRANGER)).toBe(false);
  });
  it("isKnownV1Member is true for a known member", () => {
    expect(isKnownV1Member(ready(), MEMBER)).toBe(true);
  });
});

describe("WS2 · resolveV1ProofForBuy (fail-closed)", () => {
  it("blocks when the artifact is missing (unavailable)", () => {
    expect(resolveV1ProofForBuy(undefined, MEMBER)).toEqual({ ok: false, reason: "artifact-unavailable" });
    expect(resolveV1ProofForBuy(null, MEMBER)).toEqual({ ok: false, reason: "artifact-unavailable" });
  });
  it("blocks while the artifact is pending", () => {
    expect(resolveV1ProofForBuy(PENDING, MEMBER)).toEqual({ ok: false, reason: "artifact-pending" });
  });
  it("blocks (invalid) when the artifact is structurally ready but its root is not canonical", () => {
    expect(resolveV1ProofForBuy(ready({ root: "0x" + "22".repeat(32) }), MEMBER)).toEqual({
      ok: false,
      reason: "artifact-invalid",
    });
  });
  it("returns a known member's real proof against a ready artifact", () => {
    expect(resolveV1ProofForBuy(ready(), MEMBER)).toEqual({ ok: true, isV1Member: true, proof: PROOF });
  });
  it("returns an empty proof (new buyer) for a stranger against a ready artifact", () => {
    expect(resolveV1ProofForBuy(ready(), STRANGER)).toEqual({ ok: true, isV1Member: false, proof: [] });
  });
});

describe("WS2 · buildV2BuyArgs", () => {
  it("normalizes a missing/empty referrer to the zero address", () => {
    expect(buildV2BuyArgs({ usdcIn: 5n, minSynOut: 1n, v1Proof: [] })).toEqual([5n, ZERO_ADDRESS, 1n, []]);
    expect(buildV2BuyArgs({ usdcIn: 5n, minSynOut: 1n, v1Proof: [], referrer: null })[1]).toBe(ZERO_ADDRESS);
    expect(buildV2BuyArgs({ usdcIn: 5n, minSynOut: 1n, v1Proof: [], referrer: "" })[1]).toBe(ZERO_ADDRESS);
  });
  it("passes a real referrer and the resolved proof straight through", () => {
    const args = buildV2BuyArgs({ usdcIn: 9n, minSynOut: 2n, v1Proof: PROOF as `0x${string}`[], referrer: STRANGER });
    expect(args).toEqual([9n, STRANGER, 2n, PROOF]);
  });
  it("an empty proof (new buyer) flows through unchanged", () => {
    expect(buildV2BuyArgs({ usdcIn: 1n, minSynOut: 0n, v1Proof: [] })[3]).toEqual([]);
  });
});
