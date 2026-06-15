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

/** Canonical zero address — the "no referrer" sentinel for V2 `buy`. */
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/** Where the static proof artifact is served from (Vite `public/`). */
export const V1_PROOF_ARTIFACT_URL = "/v1-member-proofs.json";

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
  | { ok: false; reason: "artifact-pending" | "artifact-unavailable" };

/**
 * Fail-closed resolution. Pure. Only returns ok:true against a READY artifact:
 * a known member gets their proof; anyone else is a new buyer with an empty
 * proof. A pending/unavailable artifact returns ok:false so callers block.
 */
export function resolveV1ProofForBuy(
  artifact: V1ProofArtifact | null | undefined,
  address: string,
): V1ProofResolution {
  if (!artifact) return { ok: false, reason: "artifact-unavailable" };
  if (!isArtifactReady(artifact)) return { ok: false, reason: "artifact-pending" };
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
  const ready = isArtifactReady(artifact);

  return {
    artifact,
    isLoading: query.isLoading,
    isError: query.isError,
    /** True only when a real, ready artifact is loaded. */
    ready,
    /** Member count from the artifact (0 until ready). */
    count: artifact?.count ?? 0,
    getProof: (address: string) => (artifact ? getV1Proof(artifact, address) : null),
    isKnownMember: (address: string) => (artifact ? isKnownV1Member(artifact, address) : false),
    resolveForBuy: (address: string) => resolveV1ProofForBuy(artifact, address),
  };
}
