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
  isRecognizedMember,
  resolveV1ProofForBuy,
  resolveV1ProofForBuySafe,
  buildV2BuyArgs,
  verifyV1MerkleProof,
  ZERO_ADDRESS,
  V1_MEMBER_ROOT,
  type V1ProofArtifact,
} from "../v1-proof";
// The actual artifact served to the browser at /v1-member-proofs.json. Pinning
// it here means a future regeneration that drifts from the recognized-member set
// (wrong root, dropped/swapped member, bad count) fails CI before it can ship and
// silently mint a duplicate seat for a real member.
import liveProofArtifact from "../../../public/v1-member-proofs.json";

const MEMBER = "0x244531C571966f90f4849e03a507543d90f9C721";
const STRANGER = "0x000000000000000000000000000000000000BEEF";
// MEMBER's REAL Merkle proof from the live artifact, so a canonical fixture
// authenticates against V1_MEMBER_ROOT (isArtifactCanonical now Merkle-verifies
// every proof exactly as the on-chain contract does).
const PROOF = [
  "0x351be682d5731e02352dd7e4a84dc8f8af1cc8f58e62316caafc44159d441f39",
  "0xef07f63cec6e120b7b02d379ff08ceed31056c89ee8812835b7dd2845d42d403",
];

// The sealed merged snapshot recognizes EXACTLY 5 members (2 V1 + 3 V2a-only),
// each with its REAL proof (copied from public/v1-member-proofs.json) so the
// fixture passes the airtight gate. A canonical artifact must carry all 5 with
// proofs that verify — see RECOGNIZED_MEMBERS / verifyV1MerkleProof in v1-proof.
const FIVE_PROOFS: Record<string, string[]> = {
  [MEMBER]: PROOF,
  "0x3488857b003104e2B08A1D198f8a23BFF28B0045": [
    "0x1cafd1512d9feca9a70c3c66ff0e9b6b774003dfe83847276d7de838f04b55f6",
    "0x929c81bdf7c84ce011276a5e2dc5a7e959b98f12f1c39751e024230249e92c59",
  ],
  "0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0": [
    "0x0560ad24ad0d373632c2755d700b9c7aafd2d6040e3a829cf7930c77743ae4a7",
    "0x3eb58fd16895751acdd571cb5db11df332a3c61a317fe3cdbba62311120dd484",
    "0x929c81bdf7c84ce011276a5e2dc5a7e959b98f12f1c39751e024230249e92c59",
  ],
  "0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a": [
    "0x2706e70c528387c0d2b480dfde8e23c8a4444070c1117e5139fa37ab13f6065b",
    "0x3eb58fd16895751acdd571cb5db11df332a3c61a317fe3cdbba62311120dd484",
    "0x929c81bdf7c84ce011276a5e2dc5a7e959b98f12f1c39751e024230249e92c59",
  ],
  "0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD": [
    "0x2f88566ae4accbe296cd9222269a1eeeb4d56bf2c96a9f4bab14a2a9623e5fe3",
    "0xef07f63cec6e120b7b02d379ff08ceed31056c89ee8812835b7dd2845d42d403",
  ],
};

function ready(over: Partial<V1ProofArtifact> = {}): V1ProofArtifact {
  return {
    pending: false,
    root: "0xa1f2ed106c6d87372d99256765fcbad8c150441913d7bf0ea51908665f718c49",
    count: 5,
    proofs: { ...FIVE_PROOFS },
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
  it("the LIVE public/v1-member-proofs.json artifact passes the canonical gate (parsed exactly as the runtime fetches it)", () => {
    const parsed = parseV1ProofArtifact(liveProofArtifact);
    expect(parsed).not.toBeNull();
    expect(isArtifactCanonical(parsed)).toBe(true);
  });
  it("false when the root differs from the sealed on-chain V1_MEMBER_ROOT (e.g. a regenerated snapshot that dropped a member)", () => {
    expect(isArtifactCanonical(ready({ root: "0x" + "11".repeat(32) }))).toBe(false);
  });
  it("false when declared count disagrees with the number of proofs carried", () => {
    expect(isArtifactCanonical(ready({ count: 4 }))).toBe(false);
  });
  it("false for a correct-root, self-consistent snapshot that dropped members (count < recognized set)", () => {
    // count === proofs.length (self-consistent) AND root is correct, but it
    // carries fewer than the recognized-member set → a missing member would be
    // mis-handled as a fresh buyer (duplicate seat). Must fail closed.
    expect(isArtifactCanonical(ready({ count: 1, proofs: { [MEMBER]: PROOF } }))).toBe(false);
  });
  it("false when the right count/root carry a SWAPPED address (a real member replaced by a stranger)", () => {
    // 5 entries, correct root, count 5 — but one recognized member is dropped
    // and a stranger takes their slot. The dropped member would be treated as a
    // fresh buyer (duplicate seat). Must fail closed.
    const swapped: Record<string, string[]> = { ...FIVE_PROOFS };
    delete swapped["0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD"];
    swapped[STRANGER] = PROOF;
    expect(Object.keys(swapped).length).toBe(5);
    expect(isArtifactCanonical(ready({ proofs: swapped }))).toBe(false);
  });
  it("false when case-duplicate keys inflate the entry count above the distinct member set", () => {
    // Two keys for the same address (different case) push Object.keys() to 5,
    // but only 4 DISTINCT members are covered — one real member is missing.
    const dup: Record<string, string[]> = {
      [MEMBER]: PROOF,
      [MEMBER.toLowerCase()]: PROOF,
      "0x3488857b003104e2B08A1D198f8a23BFF28B0045": ["0x" + "a2".repeat(32)],
      "0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0": ["0x" + "a3".repeat(32)],
      "0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a": ["0x" + "a4".repeat(32)],
    };
    expect(Object.keys(dup).length).toBe(5);
    expect(isArtifactCanonical(ready({ count: 5, proofs: dup }))).toBe(false);
  });
  it("false when all recognized members are present but one carries a CORRUPTED (non-empty, wrong) proof", () => {
    // Set/count all line up, but MEMBER's proof is garbage → it will not
    // authenticate against the root. On-chain the contract would skip
    // recognition and mint MEMBER a fresh (duplicate) seat, so the gate must
    // fail closed.
    const corrupt: Record<string, string[]> = { ...FIVE_PROOFS, [MEMBER]: ["0x" + "11".repeat(32)] };
    expect(isArtifactCanonical(ready({ proofs: corrupt }))).toBe(false);
  });
  it("false when a recognized member carries an EMPTY proof (would mint them a duplicate seat on-chain)", () => {
    const emptied: Record<string, string[]> = { ...FIVE_PROOFS, [MEMBER]: [] };
    expect(isArtifactCanonical(ready({ proofs: emptied }))).toBe(false);
  });
  it("false when all 5 members are present PLUS a case-duplicate extra key (raw key count > recognized set)", () => {
    const extra: Record<string, string[]> = { ...FIVE_PROOFS, [MEMBER.toLowerCase()]: PROOF };
    expect(Object.keys(extra).length).toBe(6);
    expect(isArtifactCanonical(ready({ count: 5, proofs: extra }))).toBe(false);
  });
  it("false for pending, null, or undefined artifacts", () => {
    expect(isArtifactCanonical(PENDING)).toBe(false);
    expect(isArtifactCanonical(null)).toBe(false);
    expect(isArtifactCanonical(undefined)).toBe(false);
  });
});

describe("WS2 · verifyV1MerkleProof (matches on-chain MerkleProof.verify)", () => {
  it("true for every recognized member's real proof against the sealed root", () => {
    for (const [addr, proof] of Object.entries(FIVE_PROOFS)) {
      expect(verifyV1MerkleProof(addr, proof, V1_MEMBER_ROOT)).toBe(true);
    }
  });
  it("false for a non-member, a wrong proof, or an empty proof", () => {
    expect(verifyV1MerkleProof(STRANGER, PROOF, V1_MEMBER_ROOT)).toBe(false);
    expect(verifyV1MerkleProof(MEMBER, ["0x" + "11".repeat(32)], V1_MEMBER_ROOT)).toBe(false);
    expect(verifyV1MerkleProof(MEMBER, [], V1_MEMBER_ROOT)).toBe(false);
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

describe("WS2 · isRecognizedMember (bundle-baked, no artifact needed)", () => {
  it("true for a recognized member (case-insensitive), false for a stranger", () => {
    expect(isRecognizedMember(MEMBER)).toBe(true);
    expect(isRecognizedMember(MEMBER.toLowerCase())).toBe(true);
    expect(isRecognizedMember(MEMBER.toUpperCase())).toBe(true);
    expect(isRecognizedMember(STRANGER)).toBe(false);
  });
  it("false for a missing address (no wallet connected)", () => {
    expect(isRecognizedMember(null)).toBe(false);
    expect(isRecognizedMember(undefined)).toBe(false);
    expect(isRecognizedMember("")).toBe(false);
  });
});

describe("WS2 · resolveV1ProofForBuySafe (fresh buyer never over-blocked; member still fail-closed)", () => {
  it("a fresh buyer resolves to an empty proof WITHOUT any artifact (missing/null/pending)", () => {
    // A wallet outside the root-committed set is provably new: `[]` is correct and
    // safe even if the artifact never loaded, so an artifact hiccup must not block.
    expect(resolveV1ProofForBuySafe(undefined, STRANGER)).toEqual({ ok: true, isV1Member: false, proof: [] });
    expect(resolveV1ProofForBuySafe(null, STRANGER)).toEqual({ ok: true, isV1Member: false, proof: [] });
    expect(resolveV1ProofForBuySafe(PENDING, STRANGER)).toEqual({ ok: true, isV1Member: false, proof: [] });
  });
  it("a fresh buyer resolves to an empty proof against a ready artifact too", () => {
    expect(resolveV1ProofForBuySafe(ready(), STRANGER)).toEqual({ ok: true, isV1Member: false, proof: [] });
  });
  it("a RECOGNIZED member stays fail-closed: blocked when the artifact is missing/pending/non-canonical", () => {
    // The duplicate-seat protection is preserved — a real member is NEVER waved
    // through with `[]`; they must carry their proof or the buy stays blocked.
    expect(resolveV1ProofForBuySafe(undefined, MEMBER)).toEqual({ ok: false, reason: "artifact-unavailable" });
    expect(resolveV1ProofForBuySafe(null, MEMBER)).toEqual({ ok: false, reason: "artifact-unavailable" });
    expect(resolveV1ProofForBuySafe(PENDING, MEMBER)).toEqual({ ok: false, reason: "artifact-pending" });
    expect(resolveV1ProofForBuySafe(ready({ root: "0x" + "22".repeat(32) }), MEMBER)).toEqual({
      ok: false,
      reason: "artifact-invalid",
    });
  });
  it("a recognized member gets THEIR real proof against a canonical artifact", () => {
    expect(resolveV1ProofForBuySafe(ready(), MEMBER)).toEqual({ ok: true, isV1Member: true, proof: PROOF });
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
