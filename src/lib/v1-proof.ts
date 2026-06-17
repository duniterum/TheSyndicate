// =============================================================================
//  V1 membership proof flow (WS2)
// =============================================================================
//  Sale V2 recognizes existing V1 members via a Merkle proof so a returning
//  member's buy CONTINUES their identity instead of minting a duplicate seat.
//
//    • A NEW buyer (not a V1 member)  → passes an EMPTY proof `[]`; the contract
//      issues a fresh seat. This is the correct, safe default.
//    • A KNOWN V1 member             → must pass THEIR proof so the contract
//      recognizes them; passing `[]` would wrongly mint them a new seat.
//
//  The proofs live in a static artifact (`/v1-member-proofs.json`) generated
//  from a live V1 snapshot. Its `root` MUST equal the `V1_MEMBER_ROOT` baked
//  into the deployed Sale V2 (verified at deploy time, and again on-chain by the
//  contract for every proof). Until that artifact is real, it is `pending` and
//  this module FAILS CLOSED: it refuses to build buy args at all, rather than
//  submit an empty proof that could mis-handle a real V1 member.
//
//  This module is PURE + side-effect-light: the lookup/resolution helpers are
//  pure functions over an artifact object (unit-testable with no network), and
//  `useV1Proof` is a thin TanStack Query wrapper that loads the artifact once.
//
//  Truth doctrine: no proof is ever invented. An address absent from a READY
//  artifact is treated as a non-member (empty proof); an address we cannot
//  classify (pending/unavailable artifact) blocks the buy.
// =============================================================================

import { useQuery } from "@tanstack/react-query";
import { keccak256, encodeAbiParameters, concat, type Hex } from "viem";

/** Canonical zero address — the "no referrer" sentinel for V2 `buy`. */
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/** Where the static proof artifact is served from (Vite `public/`). */
export const V1_PROOF_ARTIFACT_URL = "/v1-member-proofs.json";

/**
 * The sealed membership Merkle root — the cryptographic commitment to the EXACT
 * set of recognized members. For Sale V2b this is the MERGED V1∪V2a snapshot
 * (5 members: 2 from V1 + 3 V2a-only seats #3–#5), baked into the deployed Sale
 * V2b (0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b) and re-verified on-chain for
 * every proof; this constant was confirmed equal to the contract's
 * `V1_MEMBER_ROOT()` at wiring time. The earlier V1-only root
 * (0xae75…74ff, count 2) was V2a's and is now STALE. Any proof artifact whose
 * root differs from this — e.g. a regenerated snapshot that accidentally dropped
 * or added a member — is NOT the canonical snapshot and MUST NOT be trusted to
 * classify buyers: a dropped member would otherwise be mis-handled as a fresh
 * buyer and issued a DUPLICATE seat (the one irreversible identity gate).
 * Lowercase for case-insensitive comparison.
 */
export const V1_MEMBER_ROOT =
  "0xa1f2ed106c6d87372d99256765fcbad8c150441913d7bf0ea51908665f718c49" as const;

/**
 * The EXACT recognized-member set the sealed `V1_MEMBER_ROOT` commits to — the
 * MERGED V1∪V2a snapshot (2 from V1 + 3 V2a-only seats #3–#5), lowercased for
 * case-insensitive comparison. The canonical buy gate requires a ready artifact
 * to carry proofs for EXACTLY this set — no member dropped, none swapped, no
 * case-duplicate keys. The on-chain contract is the ultimate gate (it re-verifies
 * every proof against the root), so the frontend's one safety duty is simply to
 * never classify a real member as a fresh buyer — which would submit an empty
 * proof and mint them a DUPLICATE seat (the one irreversible identity gate).
 * Pinning the set makes that classification deterministic, not merely
 * count-consistent. Bump this set in lockstep with `V1_MEMBER_ROOT` whenever the
 * recognized set changes (e.g. a future V2c snapshot).
 */
export const RECOGNIZED_MEMBERS: ReadonlySet<string> = new Set([
  "0x244531c571966f90f4849e03a507543d90f9c721",
  "0x3488857b003104e2b08a1d198f8a23bff28b0045",
  "0x03e99f09f0fc8d04864466bc37fd73dd7ba3c6d0",
  "0x3b1396b1ff61b79c742751cfb6f0f04eac25ec6a",
  "0x5734c19d1907857d1e54f95d12300e2fc7b0c2cd",
]);

/** Number of recognized members the sealed root commits to (= RECOGNIZED_MEMBERS.size). */
export const EXPECTED_MEMBER_COUNT = RECOGNIZED_MEMBERS.size;

/**
 * Shape of the proof artifact. `proofs` maps a member address → its Merkle
 * proof (an array of 32-byte hex sibling hashes). `root` is the Merkle root the
 * proofs were generated against; it must match the on-chain `V1_MEMBER_ROOT`.
 */
export type V1ProofArtifact = {
  /** True while this is the placeholder (no real snapshot yet). */
  pending: boolean;
  /** Merkle root, or null when pending. */
  root: string | null;
  /** Number of V1 members in the snapshot. */
  count: number;
  /** address → Merkle proof. Address casing is preserved from generation. */
  proofs: Record<string, string[]>;
};

/** A ready artifact is one we can safely classify addresses against. */
export function isArtifactReady(a: V1ProofArtifact | null | undefined): a is V1ProofArtifact {
  return Boolean(a) && a!.pending === false && typeof a!.root === "string" && a!.root.length > 0;
}

/**
 * StandardMerkleTree leaf for leafEncoding `["address"]`, matching the deployed
 * contract EXACTLY: `keccak256(bytes.concat(keccak256(abi.encode(addr))))`
 * (a DOUBLE hash). Lowercased first so the leaf depends only on the address
 * bytes, never its checksum casing.
 */
function v1MerkleLeaf(address: string): Hex {
  const encoded = encodeAbiParameters([{ type: "address" }], [address.toLowerCase() as Hex]);
  return keccak256(keccak256(encoded));
}

/** OpenZeppelin commutative node hash: keccak256 of the two 32-byte nodes in ascending byte order. */
function hashPair(a: Hex, b: Hex): Hex {
  const [lo, hi] = a.toLowerCase() <= b.toLowerCase() ? [a, b] : [b, a];
  return keccak256(concat([lo, hi]));
}

/**
 * Verify a member's Merkle proof against `root` EXACTLY as the on-chain contract
 * does (`MerkleProof.verify` over a StandardMerkleTree `["address"]` leaf). Pure;
 * returns false on any malformed input. This is the real duplicate-seat defense:
 * the contract's `buy()` does NOT revert on a bad non-empty proof — it skips
 * recognition and falls through to mint a FRESH seat — so an empty/corrupt proof
 * for a real member would issue them a DUPLICATE seat. Verifying here lets the
 * buy fail closed instead.
 */
export function verifyV1MerkleProof(
  address: string,
  proof: readonly string[],
  root: string,
): boolean {
  try {
    let node = v1MerkleLeaf(address);
    for (const sib of proof) node = hashPair(node, sib as Hex);
    return node.toLowerCase() === root.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Stronger-than-structural readiness, used at the BUY boundary. The artifact is
 * structurally ready AND its root matches the sealed on-chain `V1_MEMBER_ROOT`
 * AND its proofs cover EXACTLY the recognized-member set (`RECOGNIZED_MEMBERS`)
 * AND every one of those proofs Merkle-verifies against the root. This is the
 * airtight fail-closed gate: only a snapshot that recognizes precisely the known
 * members — each with a proof the contract will accept — may classify a buyer,
 * so a real member can never be silently demoted to a "fresh buyer" (which would
 * submit an empty/invalid proof and mint them a duplicate seat). Pure.
 */
export function isArtifactCanonical(
  a: V1ProofArtifact | null | undefined,
): a is V1ProofArtifact {
  if (!isArtifactReady(a)) return false;
  const root = (a.root ?? "").toLowerCase();
  if (root !== V1_MEMBER_ROOT) return false;
  // Pin to the EXACT recognized-member set. Count-consistency alone is not
  // enough: a correct-root artifact that dropped/swapped a member, or padded the
  // set with extra/case-duplicate keys, could still look plausible. Require the
  // declared count, the RAW key count, and the distinct lowercase addresses to
  // all equal the recognized-set size, AND full coverage of RECOGNIZED_MEMBERS.
  if (a.count !== EXPECTED_MEMBER_COUNT) return false;
  const keys = Object.keys(a.proofs);
  if (keys.length !== EXPECTED_MEMBER_COUNT) return false;
  const distinct = new Set(keys.map((k) => k.toLowerCase()));
  if (distinct.size !== EXPECTED_MEMBER_COUNT) return false;
  for (const m of RECOGNIZED_MEMBERS) {
    if (!distinct.has(m)) return false;
  }
  // Finally, each member's proof must actually authenticate against the sealed
  // root. The contract mints a fresh seat — a DUPLICATE — on a bad/empty proof
  // rather than reverting, so an unverifiable artifact MUST block the buy.
  for (const [addr, proof] of Object.entries(a.proofs)) {
    if (!verifyV1MerkleProof(addr, proof, root)) return false;
  }
  return true;
}

/**
 * Defensive parse of an unknown blob into a V1ProofArtifact. Returns null for
 * anything malformed (so a corrupt artifact degrades to "unavailable", never to
 * a silently wrong proof). A well-formed PENDING artifact parses successfully
 * (pending:true, root:null) — readiness is a separate check.
 */
export function parseV1ProofArtifact(raw: unknown): V1ProofArtifact | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const pending = typeof o.pending === "boolean" ? o.pending : true;
  const root = o.root === null ? null : typeof o.root === "string" ? o.root : undefined;
  if (root === undefined) return null;
  if (typeof o.count !== "number" || !Number.isFinite(o.count) || o.count < 0) return null;
  if (!o.proofs || typeof o.proofs !== "object") return null;

  const proofs: Record<string, string[]> = {};
  for (const [addr, proof] of Object.entries(o.proofs as Record<string, unknown>)) {
    if (!Array.isArray(proof)) return null;
    const sibs: string[] = [];
    for (const s of proof) {
      if (typeof s !== "string") return null;
      sibs.push(s);
    }
    proofs[addr] = sibs;
  }
  // A non-pending artifact must carry a real root.
  if (pending === false && (root === null || root.length === 0)) return null;
  return { pending, root, count: o.count, proofs };
}

/**
 * Case-insensitive proof lookup. Returns the member's Merkle proof, or null if
 * the address is not present in the artifact. Pure.
 */
export function getV1Proof(artifact: V1ProofArtifact, address: string): `0x${string}`[] | null {
  const want = address.toLowerCase();
  for (const [addr, proof] of Object.entries(artifact.proofs)) {
    if (addr.toLowerCase() === want) return proof as `0x${string}`[];
  }
  return null;
}

/** True iff `address` is a known V1 member in the artifact (case-insensitive). Pure. */
export function isKnownV1Member(artifact: V1ProofArtifact, address: string): boolean {
  return getV1Proof(artifact, address) !== null;
}

/**
 * Resolution of the proof a given address must use for a V2 buy.
 *  • ok:true  → safe to proceed. `isV1Member` says whether a real proof was
 *               found; `proof` is that proof for a member, or `[]` for a new buyer.
 *  • ok:false → DO NOT BUY. We cannot classify the address because the artifact
 *               is not ready, so submitting `[]` could mis-handle a V1 member.
 */
export type V1ProofResolution =
  | { ok: true; isV1Member: boolean; proof: `0x${string}`[] }
  | { ok: false; reason: "artifact-pending" | "artifact-unavailable" | "artifact-invalid" };

/**
 * Fail-closed resolution. Pure. Only returns ok:true against a CANONICAL
 * artifact (structurally ready AND root === sealed on-chain V1_MEMBER_ROOT AND
 * count integrity): a known member gets their proof; anyone else is a new buyer
 * with an empty proof. A pending/unavailable artifact blocks ("pending"); a
 * structurally-ready-but-non-canonical artifact (wrong root / count mismatch —
 * a publish error) blocks ("invalid"), so a real V1 member is never demoted to
 * a fresh buyer.
 */
export function resolveV1ProofForBuy(
  artifact: V1ProofArtifact | null | undefined,
  address: string,
): V1ProofResolution {
  if (!artifact) return { ok: false, reason: "artifact-unavailable" };
  if (!isArtifactReady(artifact)) return { ok: false, reason: "artifact-pending" };
  if (!isArtifactCanonical(artifact)) return { ok: false, reason: "artifact-invalid" };
  const proof = getV1Proof(artifact, address);
  if (proof) return { ok: true, isV1Member: true, proof };
  return { ok: true, isV1Member: false, proof: [] };
}

/** Strongly-typed argument tuple for the V2 `buy(usdcIn, referrer, minSynOut, v1Proof)` call. */
export type V2BuyArgs = readonly [bigint, `0x${string}`, bigint, readonly `0x${string}`[]];

/**
 * Build the exact arg tuple for the V2 `buy` write. Pure. Normalizes a missing
 * referrer to the zero address. The proof must come from `resolveV1ProofForBuy`
 * (so this never silently fabricates one).
 */
export function buildV2BuyArgs(params: {
  usdcIn: bigint;
  minSynOut: bigint;
  v1Proof: readonly `0x${string}`[];
  referrer?: string | null;
}): V2BuyArgs {
  const referrer = (params.referrer && params.referrer.length > 0
    ? params.referrer
    : ZERO_ADDRESS) as `0x${string}`;
  return [params.usdcIn, referrer, params.minSynOut, params.v1Proof] as const;
}

/** SSR-safe async loader. Throws on network/parse failure (so TanStack Query marks isError). */
export async function loadV1ProofArtifact(): Promise<V1ProofArtifact> {
  const res = await fetch(V1_PROOF_ARTIFACT_URL, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`v1-proof artifact HTTP ${res.status}`);
  const parsed = parseV1ProofArtifact(await res.json());
  if (!parsed) throw new Error("v1-proof artifact malformed");
  return parsed;
}

/**
 * Loads the proof artifact once (cached) and returns bound, fail-closed helpers.
 * The artifact is immutable per deploy, so it is cached aggressively. When the
 * query is loading/errored the artifact is undefined and `resolveForBuy` returns
 * ok:false — buy stays blocked until a real, ready artifact is in hand.
 */
export function useV1Proof() {
  const query = useQuery({
    queryKey: ["v1-proof-artifact"],
    queryFn: loadV1ProofArtifact,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });

  const artifact = query.data;
  const ready = isArtifactCanonical(artifact);

  return {
    artifact,
    isLoading: query.isLoading,
    isError: query.isError,
    /** True only when a real, CANONICAL artifact is loaded (root matches the sealed on-chain V1_MEMBER_ROOT). */
    ready,
    /** Member count from the artifact (0 until ready). */
    count: artifact?.count ?? 0,
    getProof: (address: string) => (artifact ? getV1Proof(artifact, address) : null),
    isKnownMember: (address: string) => (artifact ? isKnownV1Member(artifact, address) : false),
    resolveForBuy: (address: string) => resolveV1ProofForBuy(artifact, address),
  };
}
