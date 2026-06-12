// src/lib/protocol-lineage.ts
// PROTOCOL LINEAGE — the pure VISIBILITY projection for Sprint 16.
//
// This leaf exposes a fact's JOURNEY through the protocol intelligence pipeline:
//
//   Activity event → Signal → Memory candidate → Chronicle review candidate →
//   Promotion decision → Institutional Register entry → Chronicle admission
//   candidate → Chronicle entry → Chronology position → Verified timestamp
//
// It creates NO new intelligence. Every stage already exists; every stage already
// prepends its own id onto the terminal object's `lineage` trail. This projection
// only RE-EXPRESSES that already-carried trail as a typed, read-only LineagePath
// so a surface can show "what happened to this fact" without each surface having
// to re-parse the breadcrumb strings by hand.
//
// ── What this layer is NOT ──
//   • not Story, not Recognition, not Governance, not publishing, not a DAO
//   • it generates NO narrative, NO interpretation, NO dates, NO recommendations
//   • it never re-derives an upstream object: middle stages are honestly carried
//     as id-only nodes (their live status is not recomputed here)
//   • it never invents a stage: the projected nodes are EXACTLY the trail the
//     terminal object already carries, in the order it carries them
//   • it never claims certainty it cannot prove: completeness degrades to
//     held / coverage-limited / rpc-limited / partial, and a date appears only
//     when the source chronology entry already proved one (Sprint 15)
//
// ── Adjacency (canon 05 §2.1) ──
//   It reads the terminal CHRONOLOGY ENTRY only, TYPE-ONLY, from its immediate
//   neighbour (the chronology registry leaf). It imports nothing else: not the
//   chronology deriver, not the chronicle / admission / register / promotion /
//   review / memory / signal / event layers, not wagmi, not React. A LinageNode's
//   middle stages are read from the trail the entry already carries — never by
//   reaching back into another layer.

import type {
  ChronologyConfidence,
  ChronologyEntry,
  ChronologyStatus,
  TimestampStatus,
} from "./chronology-registry";

// ─── Vocabulary ─────────────────────────────────────────────────────────────

/**
 * The canonical pipeline layer a lineage node belongs to. These are MACHINE ids
 * (not public copy); a protocol-centric display label is given by STAGE_LABEL.
 *   • on-chain-anchor — a transaction / block / contract reference carried in the
 *     trail for verification; not a pipeline stage of its own.
 *   • unknown — a trail reference that does not match any known protocol layer
 *     (defensive: it forces the path to read PARTIAL rather than COMPLETE).
 */
export type LineageLayer =
  | "event"
  | "signal"
  | "memory-candidate"
  | "chronicle-review"
  | "promotion-decision"
  | "institutional-register"
  | "chronicle-admission"
  | "chronicle-entry"
  | "chronology"
  | "on-chain-anchor"
  | "unknown";

/**
 * How much a node's standing is independently proven HERE.
 *   • verified        — proven on-chain at this projection (a block-ordered
 *                       chronology position, or an event/anchor with a tx).
 *   • held            — recorded but not proven (a held chronology position, or
 *                       an anchor that predates the scanner).
 *   • carried-through — an id-only middle stage; its live status is carried from
 *                       the source object and intentionally not re-derived here.
 */
export type LineageVerification = "verified" | "held" | "carried-through";

/**
 * How fully the lineage is known (spec §"Lineage completeness"). First match in
 * resolveLineageCompleteness wins; the order encodes "never imply certainty":
 *   • held            — the chronology position is held (existence ≠ order).
 *   • coverage-limited— a block anchor exists but is deliberately withheld
 *                       (superseded / suspected duplicate).
 *   • rpc-limited     — ordered, but the verified-timestamp lookup failed
 *                       (Sprint 15 error / unavailable) — order is known, date is not.
 *   • partial         — the chain does not start at an Activity event (a genesis
 *                       fact that predates the scanner), or a stage is unknown.
 *   • complete        — a full Activity-event-rooted chain, ordered on-chain.
 */
export type LineageCompleteness =
  | "complete"
  | "partial"
  | "held"
  | "coverage-limited"
  | "rpc-limited";

/**
 * One node in a fact's lineage — a single, read-only projection of one entry in
 * the terminal object's carried trail. Its `id` is the trail string VERBATIM, so
 * the projection never alters or invents identity.
 */
export type LineageNode = {
  /** The trail reference verbatim (preserves identity exactly). */
  id: string;
  /** The pipeline layer this node belongs to. */
  layer: LineageLayer;
  /** The immediate upstream node's id (the next trail entry toward the root), or null. */
  sourceId: string | null;
  /** Stable machine descriptor of what produced this node (incl. genesis sentinels). */
  sourceType: string;
  /** Stage status when one is carried (the chronology status / "root"); else null. */
  status: string | null;
  /** Verified block timestamp (unix seconds) — non-null ONLY on a verified chronology node. */
  timestamp: number | null;
  /** Source transaction hash, when the entry carried one (chronology / event / anchor nodes). */
  txHash: string | null;
  /** Verified block height, when carried (chronology / event / anchor nodes). */
  block: number | null;
  /** Whether this node is proven, held, or merely carried through. */
  verificationStatus: LineageVerification;
  /** Canonical timeline position (1-based) — non-null ONLY on an ordered chronology node. */
  chronologyPosition: number | null;
  /** Sober, person-free, magnitude-free explanation of this node's role. */
  lineageReason: string;
};

/**
 * A fact's full lineage as a typed, read-only path. Pure projection of ONE
 * ChronologyEntry: same entry in → same path out.
 */
export type LineagePath = {
  /** The chronology overlay id this path projects (durable identity). */
  chronologyId: string;
  /** The Chronicle Entry the chronology orders (lookup key). */
  sourceChronicleEntryId: string;
  /** The Activity-event (or genesis-fact sentinel) id at the root of the chain, or null. */
  sourceEventId: string | null;
  /** The source transaction hash, when one is carried (lookup key), or null. */
  sourceTxHash: string | null;
  /** Every node in the carried trail, terminal → root, in trail order. */
  nodes: readonly LineageNode[];
  /** The furthest-along stage the fact has reached (always the chronology layer here). */
  currentStage: LineageLayer;
  /** The furthest-along stage that is independently proven on-chain, or null. */
  highestVerifiedStage: LineageLayer | null;
  /** How fully the lineage is known. */
  completenessStatus: LineageCompleteness;
};

// ─── Display labels (protocol-centric, sober) ───────────────────────────────
// Stage labels frame the PIPELINE LAYER, never the actor. Fact framing (Treasury
// movement / Liquidity action / Supply burn / Deployment record / Protocol
// action) lives on the source entry's own copy, which is already guard-clean.

export const STAGE_LABEL: Record<LineageLayer, string> = {
  event: "Activity event",
  signal: "Signal",
  "memory-candidate": "Memory candidate",
  "chronicle-review": "Chronicle review candidate",
  "promotion-decision": "Promotion decision",
  "institutional-register": "Institutional Register entry",
  "chronicle-admission": "Chronicle admission candidate",
  "chronicle-entry": "Chronicle entry",
  chronology: "Chronology position",
  "on-chain-anchor": "On-chain anchor",
  unknown: "Unrecognised reference",
};

export const COMPLETENESS_LABEL: Record<LineageCompleteness, string> = {
  complete: "COMPLETE",
  partial: "PARTIAL",
  held: "HELD",
  "coverage-limited": "COVERAGE LIMITED",
  "rpc-limited": "RPC LIMITED",
};

export const COMPLETENESS_DESCRIPTION: Record<LineageCompleteness, string> = {
  complete:
    "A full Activity-event-rooted chain, ordered to a verified block height.",
  partial:
    "The chain does not start at an Activity event — a foundational fact that predates the event scanner, carried from on-chain truth.",
  held: "Existence is proven but order is not; the position is held, never sequenced.",
  "coverage-limited":
    "A block anchor exists but is deliberately withheld so one on-chain action holds one position (superseded or suspected duplicate).",
  "rpc-limited":
    "Ordered by verified block height, but the block-timestamp lookup did not resolve — the order is known, the date is not.",
};

// Pipeline ordinal — used to pick the furthest-along stage. Non-pipeline nodes
// (on-chain anchors, unknown references) have no ordinal.
const STAGE_ORDINAL: Record<LineageLayer, number | null> = {
  event: 1,
  signal: 2,
  "memory-candidate": 3,
  "chronicle-review": 4,
  "promotion-decision": 5,
  "institutional-register": 6,
  "chronicle-admission": 7,
  "chronicle-entry": 8,
  chronology: 9,
  "on-chain-anchor": null,
  unknown: null,
};

// ─── Classification ─────────────────────────────────────────────────────────

type Classification = {
  layer: LineageLayer;
  sourceType: string;
  /** True for a genesis sentinel (a stage that never ran; curated before the scanner). */
  genesisSentinel: boolean;
};

/**
 * Classify ONE trail reference into a pipeline layer by its deterministic id
 * prefix. PURE: a string in → a classification out. It recognises both the live
 * pipeline prefixes and the honest genesis sentinels (genesis-seed: / genesis-
 * fact: / a predates-scanner anchor) so a foundational fact reads as PARTIAL
 * rather than being mis-read as a complete chain.
 */
export function classifyLineageId(id: string): Classification {
  if (id.startsWith("chronology:"))
    return { layer: "chronology", sourceType: "chronology", genesisSentinel: false };
  if (id.startsWith("chronicle-entry:"))
    return { layer: "chronicle-entry", sourceType: "chronicle-entry", genesisSentinel: false };
  if (id.startsWith("chronicle-admission:"))
    return { layer: "chronicle-admission", sourceType: "chronicle-admission-candidate", genesisSentinel: false };
  if (id.startsWith("chronicle-candidate:"))
    return { layer: "chronicle-review", sourceType: "chronicle-review-candidate", genesisSentinel: false };
  if (id.startsWith("institutional-entry:"))
    return {
      layer: "institutional-register",
      sourceType: id.includes(":genesis:")
        ? "institutional-register-entry-genesis"
        : "institutional-register-entry",
      genesisSentinel: id.includes(":genesis:"),
    };
  if (id.startsWith("promotion-decision:"))
    return { layer: "promotion-decision", sourceType: "promotion-decision", genesisSentinel: false };
  if (id.startsWith("genesis-seed:"))
    return { layer: "promotion-decision", sourceType: "genesis-seed-sentinel", genesisSentinel: true };
  if (id.startsWith("memory-candidate:"))
    return { layer: "memory-candidate", sourceType: "memory-candidate", genesisSentinel: false };
  if (id.startsWith("signal:"))
    return { layer: "signal", sourceType: "signal", genesisSentinel: false };
  if (id.startsWith("event:"))
    return { layer: "event", sourceType: "activity-event", genesisSentinel: false };
  if (id.startsWith("genesis-fact:"))
    return { layer: "event", sourceType: "genesis-fact-sentinel", genesisSentinel: true };
  if (id.startsWith("tx:"))
    return { layer: "on-chain-anchor", sourceType: "transaction-anchor", genesisSentinel: false };
  if (id.startsWith("block:"))
    return { layer: "on-chain-anchor", sourceType: "block-anchor", genesisSentinel: false };
  if (id.startsWith("contract:"))
    return { layer: "on-chain-anchor", sourceType: "contract-anchor", genesisSentinel: false };
  if (id.startsWith("predates-scanner"))
    return { layer: "on-chain-anchor", sourceType: "no-anchor-predates-scanner", genesisSentinel: true };
  return { layer: "unknown", sourceType: "unknown", genesisSentinel: false };
}

// ─── Per-node reason copy (sober, structural) ───────────────────────────────

function reasonFor(
  classification: Classification,
  entry: ChronologyEntry,
): string {
  const { layer, genesisSentinel } = classification;

  if (genesisSentinel && layer === "promotion-decision")
    return "Foundational fact curated before the event scanner; the promotion stage never ran (honest sentinel).";
  if (genesisSentinel && layer === "event")
    return "Foundational fact curated before the event scanner; no Activity event was recorded (honest sentinel).";
  if (genesisSentinel && layer === "on-chain-anchor")
    return "No transaction anchor — this foundational fact predates the event scanner.";

  switch (layer) {
    case "chronology":
      // The chronology entry already carries a sober, guard-clean reason.
      return entry.chronologyReason;
    case "event":
      return entry.txHash
        ? "Root Activity event; verifiable on-chain via its transaction."
        : "Root Activity event; carried through without a transaction anchor.";
    case "on-chain-anchor":
      return "On-chain anchor carried for verification.";
    case "unknown":
      return "Unrecognised lineage reference; could not be classified to a known protocol layer.";
    default:
      return "Carried through from the source object; recorded in the lineage, live status not re-derived at this layer.";
  }
}

function verificationFor(
  classification: Classification,
  entry: ChronologyEntry,
): LineageVerification {
  const { layer, genesisSentinel } = classification;
  if (layer === "chronology") return entry.chronologyConfidence;
  if (layer === "event") return entry.txHash ? "verified" : "carried-through";
  if (layer === "on-chain-anchor") return genesisSentinel ? "held" : "verified";
  return "carried-through";
}

// ─── Projection ─────────────────────────────────────────────────────────────

/**
 * Project ONE ChronologyEntry into a typed LineagePath. PURE and deterministic:
 * it reads ONLY the entry's own fields and its carried `lineage` trail, never
 * reaching into another layer. Every trail entry becomes exactly one node, in
 * trail order — so the projection can neither invent nor drop a stage, and a
 * node's id is the trail string verbatim.
 *
 * The terminal CHRONOLOGY node and the root ACTIVITY-EVENT / on-chain-anchor
 * nodes are enriched with the structured fields the entry already proves
 * (sequence, verified timestamp, tx, block); all middle stages are honest id-only
 * nodes whose live status is carried through, never recomputed here.
 */
export function deriveLineagePath(entry: ChronologyEntry): LineagePath {
  const trail = entry.lineage;

  const nodes: LineageNode[] = trail.map((id, i) => {
    const classification = classifyLineageId(id);
    const { layer } = classification;
    const sourceId = i + 1 < trail.length ? trail[i + 1] : null;

    const isChronology = layer === "chronology";
    const carriesAnchor =
      isChronology || layer === "event" || layer === "on-chain-anchor";

    return {
      id,
      layer,
      sourceId,
      sourceType: classification.sourceType,
      status: isChronology ? entry.chronologyStatus : layer === "event" ? "root" : null,
      // A date is carried ONLY by a verified chronology node (Sprint 15 rule).
      timestamp: isChronology ? entry.blockTimestamp : null,
      txHash: carriesAnchor ? entry.txHash : null,
      block: carriesAnchor ? entry.blockNumber : null,
      verificationStatus: verificationFor(classification, entry),
      chronologyPosition: isChronology ? entry.sequenceNumber : null,
      lineageReason: reasonFor(classification, entry),
    };
  });

  const eventNode = nodes.find((n) => n.layer === "event") ?? null;

  return {
    chronologyId: entry.chronologyId,
    sourceChronicleEntryId: entry.sourceChronicleEntryId,
    sourceEventId: eventNode ? eventNode.id : null,
    sourceTxHash: entry.txHash,
    nodes,
    currentStage: currentStage(nodes),
    highestVerifiedStage: highestVerifiedStage(nodes),
    completenessStatus: resolveLineageCompleteness(entry, nodes),
  };
}

/** Project many entries (preserving input order). PURE. */
export function deriveLineagePaths(
  entries: ReadonlyArray<ChronologyEntry>,
): LineagePath[] {
  return entries.map(deriveLineagePath);
}

/** The furthest-along pipeline stage present in the trail. */
function currentStage(nodes: ReadonlyArray<LineageNode>): LineageLayer {
  let best: LineageLayer = "unknown";
  let bestOrd = -1;
  for (const n of nodes) {
    const ord = STAGE_ORDINAL[n.layer];
    if (ord !== null && ord > bestOrd) {
      bestOrd = ord;
      best = n.layer;
    }
  }
  return best;
}

/** The furthest-along pipeline stage that is independently proven on-chain, or null. */
function highestVerifiedStage(
  nodes: ReadonlyArray<LineageNode>,
): LineageLayer | null {
  let best: LineageLayer | null = null;
  let bestOrd = -1;
  for (const n of nodes) {
    const ord = STAGE_ORDINAL[n.layer];
    if (n.verificationStatus === "verified" && ord !== null && ord > bestOrd) {
      bestOrd = ord;
      best = n.layer;
    }
  }
  return best;
}

/**
 * Resolve how fully a lineage is known. PURE. Precedence (first match wins) is
 * ordered so the projection never implies more certainty than it can prove:
 *   held → coverage-limited → rpc-limited → partial → complete.
 */
export function resolveLineageCompleteness(
  entry: ChronologyEntry,
  nodes: ReadonlyArray<LineageNode>,
): LineageCompleteness {
  if (entry.chronologyStatus === "held-no-anchor") return "held";
  if (entry.chronologyStatus === "coverage-limited") return "coverage-limited";
  // From here the chronology position is ordered (a verified block height).
  if (entry.timestampStatus === "error" || entry.timestampStatus === "unavailable")
    return "rpc-limited";
  const genesisOrigin = nodes.some(
    (n) => n.sourceType.endsWith("-sentinel") || n.sourceType === "institutional-register-entry-genesis",
  );
  if (genesisOrigin) return "partial";
  const hasEvent = nodes.some((n) => n.layer === "event");
  const hasUnknown = nodes.some((n) => n.layer === "unknown");
  if (!hasEvent || hasUnknown) return "partial";
  return "complete";
}

// ─── Lookup indexes (pure) ──────────────────────────────────────────────────

/**
 * Index paths by their root Activity-event id, so a surface can answer "what
 * happened to THIS event?". Genesis-rooted paths key on their genesis-fact
 * sentinel id. Later paths win on an id collision (deterministic last-write).
 */
export function lineagePathsByEvent(
  paths: ReadonlyArray<LineagePath>,
): Map<string, LineagePath> {
  const out = new Map<string, LineagePath>();
  for (const p of paths) if (p.sourceEventId) out.set(p.sourceEventId, p);
  return out;
}

/** Index paths by source transaction hash, for tx-based lookup. */
export function lineagePathsByTxHash(
  paths: ReadonlyArray<LineagePath>,
): Map<string, LineagePath> {
  const out = new Map<string, LineagePath>();
  for (const p of paths) if (p.sourceTxHash) out.set(p.sourceTxHash, p);
  return out;
}

// Re-export the carried vocab as types only, so a surface can type lineage
// without importing the chronology leaf directly.
export type { ChronologyStatus, TimestampStatus, ChronologyConfidence };
