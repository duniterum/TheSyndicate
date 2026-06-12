// src/lib/protocol-knowledge-map.ts
// PROTOCOL KNOWLEDGE MAP — the canonical index of every knowledge HOME in The Syndicate.
//
// This is a MAP, not a new store. It is additive and read-only: it names where each
// kind of protocol knowledge already lives, and records six facts about each home —
// purpose · source of truth · permanence · coverage model · promotion path · public
// surfaces — plus its implementation status and identity posture.
//
// PRECEDENCE (per docs/canon/00_AUTHORITY_MAP.md): on-chain truth → code registries →
// execution gates → canon docs. This file is a code registry; the doctrine doc
// (docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md) DEFERS to it. When the doc and this file
// disagree, THIS FILE WINS.
//
// It INDEXES existing scaffolding (canon 00 precedence, canon 05 adjacency law, the
// metric registry, the event/signal/memory/chronicle/register pipeline) — it never
// re-states their rules. Each layer points at its canon docs and registries by path.
//
// LAW OF THIS MAP (the anti-fragmentation rules it formalizes):
//   1. ONE canonical home per fact. Each fact has exactly one source-of-truth layer.
//      Every other layer REFERENCES it; nothing keeps a second copy.
//   2. Protocol Knowledge is a live PROJECTION (recomputed every load). Institutional
//      Register Memory is a durable OVERLAY that records an assertion + anchor — never
//      a live value. The Register references homes; it does not replace them.
//   3. A fact enters durable memory only by PROMOTION (lineage-covered) or by SEED
//      (a discrete config anchor). Otherwise it is HELD, and remains fully available
//      in its Protocol-Knowledge home. Held, never invented; nothing is lost.
//
// PURITY: this leaf imports NOTHING. Every reference is a repo-relative string, so the
// map sits outside the Adjacency Law and can be read by any layer (doc, test, /labs)
// without creating a dependency edge. Do not add value imports.

/** How durable the knowledge in a layer is. */
export type LayerPermanence =
  | "onchain-permanent" // fixed on-chain (contract state / deployed truth)
  | "append-only-curated" // written once, curated, never mutated (Chronicle, Register)
  | "recomputed-projection" // derived live every load; not stored
  | "local-cache" // client-side cache of on-chain reads (convenience, not truth)
  | "reserved"; // not built; placeholder/pending

/** How much of protocol history a layer can actually answer for. */
export type LayerCoverage =
  | "deployment-anchored" // scans from the deployment block → can answer "first ever"
  | "bounded-window" // newest-first / limited window → cannot prove protocol-wide firsts
  | "config-pinned" // pinned to a discrete tx/block/address constant → verifiable, fixed
  | "derived" // deterministic function of another covered layer
  | "none"; // point-in-time read only; no historical coverage

/** Implementation reality of the layer today. */
export type LayerStatus =
  | "live" // fully operating on real data
  | "partial" // operating but incomplete; some outputs reserved/pending
  | "mock-quarantined" // demo/mock data, explicitly labeled, NOT treated as truth
  | "reserved"; // not built; reserved for the future

/** Whether the layer touches member identity (and how). */
export type IdentityPosture =
  | "identity-free" // protocol-centric; carries no member identity
  | "member-derived" // derives/displays member identity from on-chain facts
  | "member-living-reserved"; // a future per-member identity record; not built

export type LayerCluster =
  | "foundation-identity"
  | "artifact"
  | "pipeline"
  | "economic"
  | "access-verification";

export interface ProtocolLayer {
  /** Stable id (kebab-case). The doc and /labs route key off this. */
  id: string;
  /** Human-facing layer name. */
  name: string;
  cluster: LayerCluster;
  /** One line: what this layer is the canonical home FOR. */
  purpose: string;
  sourceOfTruth: {
    /** One line: what it reads from (on-chain scan vs config vs derived). */
    description: string;
    /** Repo-relative path(s) of the canonical home file(s). MUST exist on disk. */
    homeFiles: string[];
  };
  permanence: LayerPermanence;
  coverageModel: LayerCoverage;
  /** Where facts go NEXT (the lineage edge), or null when terminal / recognition-only. */
  promotionPath: string | null;
  /** Public route paths that surface this layer (may be empty for internal layers). */
  publicSurfaces: string[];
  /** Internal /labs inspection routes for this layer (may be empty). */
  internalSurfaces: string[];
  status: LayerStatus;
  /** Required when status !== "live". Must cite an evidencing file. */
  statusNote: string | null;
  identityPosture: IdentityPosture;
  /** Existing scaffolding this layer DEFERS to (never restates). */
  indexes: {
    canonDocs: string[];
    registries: string[];
  };
}

export const CLUSTER_ORDER: LayerCluster[] = [
  "foundation-identity",
  "artifact",
  "pipeline",
  "economic",
  "access-verification",
];

export const CLUSTER_LABELS: Record<LayerCluster, string> = {
  "foundation-identity": "Foundation & Identity",
  artifact: "Artifact",
  pipeline: "Knowledge Pipeline (Truth → Events → Signals → Memory → Story)",
  economic: "Economic",
  "access-verification": "Access & Verification",
};

// ─────────────────────────────────────────────────────────────────────────────
// THE LAYERS. Plain ProtocolLayer[] (not `as const`) to avoid never-narrowing in
// downstream branches. Statuses are human-asserted; each non-live status cites the
// file that evidences it so the guard test can keep the map honest.
// ─────────────────────────────────────────────────────────────────────────────
export const PROTOCOL_LAYERS: ProtocolLayer[] = [
  // ── Foundation & Identity ──────────────────────────────────────────────────
  {
    id: "truth",
    name: "Truth / Foundation",
    cluster: "foundation-identity",
    purpose:
      "The base layer: deployed contracts, addresses, and immutable protocol constants that every derived layer reads from.",
    sourceOfTruth: {
      description:
        "Config constants + live on-chain reads of the deployed Avalanche C-Chain (43114) contracts.",
      homeFiles: ["src/lib/syndicate-config.ts", "src/lib/protocol-truth.ts"],
    },
    permanence: "onchain-permanent",
    coverageModel: "config-pinned",
    promotionPath:
      "Feeds EVENTS (protocol-events.ts) and every derived layer below; it is the root of the 5-layer model.",
    publicSurfaces: ["/transparency", "/tokenomics"],
    internalSurfaces: [],
    status: "live",
    statusNote: null,
    identityPosture: "identity-free",
    indexes: {
      canonDocs: [
        "docs/canon/00_AUTHORITY_MAP.md",
        "docs/canon/05_FOUNDATION_FREEZE.md",
      ],
      registries: ["src/lib/protocol-metrics-registry.ts"],
    },
  },
  {
    id: "identity-member",
    name: "Identity / Member (Holder Index)",
    cluster: "foundation-identity",
    purpose:
      "The canonical registry of who is a member and in what order — member numbers, first purchase, first seat.",
    sourceOfTruth: {
      description:
        "Client RPC scan of TokensPurchased events from the Membership Sale, anchored at the sale deployment block; derives founderNumber/memberNumber + cumulativeUsdc.",
      homeFiles: ["src/lib/holder-index.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "deployment-anchored",
    promotionPath:
      "Ordinals/firsts can be ANCHORED into the Institutional Register via the genesis seed (institutional-register-genesis.ts) — promoted, never copied.",
    publicSurfaces: ["/members", "/my-syndicate"],
    internalSurfaces: [],
    status: "live",
    statusNote: null,
    identityPosture: "member-derived",
    indexes: {
      canonDocs: [
        "docs/canon/02_SOURCE_OF_TRUTH_TABLE.md",
        "docs/canon/05_FOUNDATION_FREEZE.md",
      ],
      registries: ["src/lib/protocol-metrics-registry.ts"],
    },
  },
  {
    id: "rank",
    name: "Rank / Progression",
    cluster: "foundation-identity",
    purpose:
      "Structural recognition tier derived from cumulative USDC. Recognition only — confers no rights, returns, or discounts.",
    sourceOfTruth: {
      description:
        "RANKS_V2 thresholds (config) mapped against cumulativeUsdc computed during the Holder Index build.",
      homeFiles: ["src/lib/syndicate-config.ts", "src/lib/holder-index.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "derived",
    promotionPath: null,
    publicSurfaces: ["/ranks", "/my-syndicate"],
    internalSurfaces: [],
    status: "live",
    statusNote: null,
    identityPosture: "member-derived",
    indexes: {
      canonDocs: [
        "docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md",
        "docs/canon/01_FOUNDER_INTENT_MAP.md",
      ],
      registries: ["src/lib/protocol-metrics-registry.ts"],
    },
  },
  {
    id: "chapter",
    name: "Chapter / Era",
    cluster: "foundation-identity",
    purpose:
      "Cohort classification by member-number range (e.g. Genesis Signal #1–#333) and chapter transitions.",
    sourceOfTruth: {
      description:
        "Hardcoded member-number ranges in config; a deterministic function of the member ordinal from the Holder Index.",
      homeFiles: ["src/lib/chapters.ts", "src/lib/protocol-truth.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "derived",
    promotionPath:
      "Chapter transitions surface as protocol milestones and are eligible as Chronicle chapter/archive subjects.",
    publicSurfaces: ["/chapters"],
    internalSurfaces: [],
    status: "live",
    statusNote: null,
    identityPosture: "member-derived",
    indexes: {
      canonDocs: ["docs/canon/05_FOUNDATION_FREEZE.md"],
      registries: [],
    },
  },
  {
    id: "seat-record",
    name: "Seat Record / Identity Record (reserved)",
    cluster: "foundation-identity",
    purpose:
      "A future optional per-member ERC-721 identity record (SeatRecord721). Today the 'seat' is the SYN membership position itself; no record contract exists.",
    sourceOfTruth: {
      description:
        "Reserved reference only — documented as a pending future contract; not deployed.",
      homeFiles: ["src/lib/syndicate-config.ts"],
    },
    permanence: "reserved",
    coverageModel: "none",
    promotionPath: null,
    publicSurfaces: [],
    internalSurfaces: [],
    status: "reserved",
    statusNote:
      "No SeatRecord721 contract deployed; ERC-721 identity record reserved (Archive1155 ID 2 disabled, held for it). Evidence: src/lib/syndicate-config.ts (Reserved Seat Record Reference).",
    identityPosture: "member-living-reserved",
    indexes: {
      canonDocs: [
        "docs/canon/07_FOUNDER_PRINCIPLE.md",
        "docs/canon/02_SOURCE_OF_TRUTH_TABLE.md",
      ],
      registries: [],
    },
  },

  // ── Artifact ───────────────────────────────────────────────────────────────
  {
    id: "artifact-nft",
    name: "Artifact / NFT (Archive1155)",
    cluster: "artifact",
    purpose:
      "On-chain commemorative artifacts (Archive1155): ID 1 The First Signal, ID 3 Patron Seal, and their mint/ownership state.",
    sourceOfTruth: {
      description:
        "Deployed Archive1155 contract; artifact catalog + mint state from config and on-chain reads.",
      homeFiles: [
        "src/lib/archive-config.ts",
        "src/lib/archive-indexer.ts",
        "src/lib/syndicate-config.ts",
      ],
    },
    permanence: "onchain-permanent",
    coverageModel: "config-pinned",
    promotionPath:
      "Mint events → Activity → Chronicle review candidate (archive subject) → Institutional Register.",
    publicSurfaces: ["/nft", "/nfts", "/archive"],
    internalSurfaces: [],
    status: "partial",
    statusNote:
      "Archive1155 deployed and live; ID 1 (First Signal) & ID 3 (Patron Seal) active/mintable, ID 2 reserved/disabled (future SeatRecord721). Evidence: src/lib/archive-config.ts and ARCHIVE_CONTRACT_STATE in src/lib/syndicate-config.ts.",
    identityPosture: "identity-free",
    indexes: {
      canonDocs: ["docs/canon/02_SOURCE_OF_TRUTH_TABLE.md"],
      registries: ["src/lib/protocol-event-registry.ts"],
    },
  },

  // ── Knowledge Pipeline (Truth → Events → Signals → Memory → Story) ──────────
  {
    id: "activity",
    name: "Activity / Events",
    cluster: "pipeline",
    purpose:
      "The raw, complete, automatic chronological stream of on-chain protocol events (what happened).",
    sourceOfTruth: {
      description:
        "Normalizes raw chain logs into CanonicalProtocolEvent (typed by the event registry).",
      homeFiles: ["src/lib/protocol-events.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "bounded-window",
    promotionPath: "Activity → Signals (deriveSignals).",
    publicSurfaces: ["/activity"],
    internalSurfaces: ["/labs/protocol-events"],
    status: "live",
    statusNote: null,
    identityPosture: "member-derived",
    indexes: {
      canonDocs: ["docs/canon/05_FOUNDATION_FREEZE.md"],
      registries: ["src/lib/protocol-event-registry.ts"],
    },
  },
  {
    id: "signals",
    name: "Signals",
    cluster: "pipeline",
    purpose:
      "A deterministic prioritization projection: Signal = Type × Tier × Subject derived from events.",
    sourceOfTruth: {
      description:
        "Pure deriver over the canonical event stream; person subjects capped at S2 (money never buys a tier).",
      homeFiles: ["src/lib/protocol-signals.ts", "src/lib/signal-registry.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "bounded-window",
    promotionPath: "Signals → Memory candidates.",
    publicSurfaces: [],
    internalSurfaces: ["/labs/signals"],
    status: "live",
    statusNote: null,
    identityPosture: "member-derived",
    indexes: {
      canonDocs: [
        "docs/canon/05_FOUNDATION_FREEZE.md",
        "docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md",
      ],
      registries: ["src/lib/signal-registry.ts"],
    },
  },
  {
    id: "memory",
    name: "Memory",
    cluster: "pipeline",
    purpose:
      "The gateway that persists worth-keeping facts toward the Activity / Chronicle / Recognition / Ledger / Reports stores.",
    sourceOfTruth: {
      description:
        "Pure candidate deriver over Signals; routes each candidate to its memory store.",
      homeFiles: ["src/lib/memory-candidates.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "bounded-window",
    promotionPath: "Memory → Chronicle review candidates.",
    publicSurfaces: [],
    internalSurfaces: ["/labs/memory-candidates", "/labs/protocol-memory"],
    status: "partial",
    statusNote:
      "Candidate derivation live; some durable MEMORY sub-stores (Recognition/Ledger/Reports) are partial. Evidence: src/lib/memory-candidates.ts.",
    identityPosture: "member-derived",
    indexes: {
      canonDocs: ["docs/canon/05_FOUNDATION_FREEZE.md"],
      registries: [],
    },
  },
  {
    id: "chronicle",
    name: "Chronicle",
    cluster: "pipeline",
    purpose:
      "Curated, gated, append-only record of what MATTERED — protocol-centric primitives only (chapters, artifacts); member subjects forbidden.",
    sourceOfTruth: {
      description:
        "Hand-curated entries plus automated review/promotion of protocol-centric memory candidates.",
      homeFiles: [
        "src/lib/chronicle-entries.ts",
        "src/lib/chronicle-review-candidates.ts",
        "src/lib/chronicle-promotion.ts",
      ],
    },
    permanence: "append-only-curated",
    coverageModel: "bounded-window",
    promotionPath:
      "Chronicle review → Chronicle promotion → Institutional Register (protocol-institutional facts only).",
    publicSurfaces: ["/chronicle"],
    internalSurfaces: [
      "/labs/chronicle-candidates",
      "/labs/chronicle-promotion",
      "/labs/chronicle-admission",
      "/labs/chronicle-entries-preview",
      "/labs/chronicle-timeline",
    ],
    status: "partial",
    statusNote:
      "Promotion pipeline live; public Chronicle curation is gated and human-approved. The admission → entry edge derives DRAFT institutional entries only; publication is a human / governance act. The entry → chronology edge orders entries by verified block height (unprovable order is held, never invented). Evidence: src/lib/chronicle-promotion.ts, src/lib/chronicle-entry.ts, src/lib/chronology.ts.",
    identityPosture: "identity-free",
    indexes: {
      canonDocs: ["docs/canon/05_FOUNDATION_FREEZE.md"],
      registries: ["src/lib/chronicle-entry-registry.ts", "src/lib/chronology-registry.ts"],
    },
  },
  {
    id: "institutional-register",
    name: "Institutional Register",
    cluster: "pipeline",
    purpose:
      "The durable, identity-blind overlay that records protocol-institutional FACTS (assertion + anchor) — not live values, never member-living.",
    sourceOfTruth: {
      description:
        "Durable register of promotion decisions, plus a lawful genesis seed for verified protocol-birth facts that predate the event scanner.",
      homeFiles: [
        "src/lib/institutional-register.ts",
        "src/lib/institutional-register-registry.ts",
        "src/lib/institutional-register-genesis.ts",
      ],
    },
    permanence: "append-only-curated",
    coverageModel: "config-pinned",
    promotionPath: "Terminal — durable institutional store; no onward promotion.",
    publicSurfaces: ["/institutional-register"],
    internalSurfaces: ["/labs/institutional-register", "/labs/chronicle-admission"],
    status: "live",
    statusNote: null,
    identityPosture: "identity-free",
    indexes: {
      canonDocs: [
        "docs/canon/05_FOUNDATION_FREEZE.md",
        "docs/canon/08_PROTOCOL_OPERATING_PRINCIPLE.md",
      ],
      registries: [
        "src/lib/institutional-register-registry.ts",
        "src/lib/chronicle-admission-registry.ts",
      ],
    },
  },
  {
    id: "recognition",
    name: "Recognition (partial)",
    cluster: "pipeline",
    purpose:
      "Derives recognition candidates (e.g. patron-seal-holder, early-chapter-member) from on-chain facts — a memory OUTPUT, distinct from the Rank attribute.",
    sourceOfTruth: {
      description:
        "Pure derivation over on-chain facts; surfaced as recognition pills in the cockpit and rank hub.",
      homeFiles: ["src/lib/recognition-candidates.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "derived",
    promotionPath:
      "PARTIAL — derivation only; alias/public recognition tiers reserved (not built).",
    publicSurfaces: ["/my-syndicate", "/ranks"],
    internalSurfaces: ["/labs/protocol-memory"],
    status: "partial",
    statusNote:
      "Derivation logic live; advanced alias/public recognition tiers are reserved and not built. Evidence: src/lib/recognition-candidates.ts.",
    identityPosture: "member-derived",
    indexes: {
      canonDocs: ["docs/canon/01_FOUNDER_INTENT_MAP.md"],
      registries: [],
    },
  },

  // ── Economic ─────────────────────────────────────────────────────────────-─
  {
    id: "economic-routing",
    name: "Economic / Routing",
    cluster: "economic",
    purpose:
      "The 70/20/10 inflow split rule (Vault / Liquidity / Operations) and revenue attribution by stream.",
    sourceOfTruth: {
      description:
        "USDC_ROUTING constants enforced atomically by the Membership Sale contract on each purchase.",
      homeFiles: ["src/lib/syndicate-config.ts", "src/lib/protocol-truth.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "config-pinned",
    promotionPath:
      "Routes inflows to the Treasury/Vault, Liquidity, and Operations destinations.",
    publicSurfaces: ["/vault", "/tokenomics"],
    internalSurfaces: [],
    status: "partial",
    statusNote:
      "70/20/10 split is LIVE and on-chain for the Membership Sale stream; other revenue streams (NFT mint proceeds, LP fees) are PARTIAL/PENDING. Evidence: USDC_ROUTING in src/lib/syndicate-config.ts.",
    identityPosture: "identity-free",
    indexes: {
      canonDocs: ["docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md"],
      registries: ["src/lib/protocol-metrics-registry.ts"],
    },
  },
  {
    id: "treasury-vault",
    name: "Treasury / Vault",
    cluster: "economic",
    purpose:
      "The destination of routed value: the Vault Wallet (70% USDC) and Vault Reserve (25% SYN).",
    sourceOfTruth: {
      description:
        "A single Externally-Owned Account address (the Vault Wallet and Vault Reserve currently resolve to the same EOA).",
      homeFiles: ["src/lib/syndicate-config.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "none",
    promotionPath:
      "Current holdings are surfaced via the Asset layer; a programmatic Vault contract is PENDING.",
    publicSurfaces: ["/vault"],
    internalSurfaces: [],
    status: "partial",
    statusNote:
      "Vault Wallet and Vault Reserve resolve to the SAME EOA today; a programmatic Vault contract is PENDING. Evidence: src/lib/syndicate-config.ts.",
    identityPosture: "identity-free",
    indexes: {
      canonDocs: ["docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md"],
      registries: [],
    },
  },
  {
    id: "asset",
    name: "Asset",
    cluster: "economic",
    purpose:
      "What the Vault actually HOLDS right now — live multi-asset balances (AVAX / USDC / BTC.b / WETH.e). Formally named here for the first time.",
    sourceOfTruth: {
      description:
        "Live RPC balance reads of the Vault wallet via useTreasuryAssets (point-in-time, no history).",
      homeFiles: ["src/lib/treasury-hooks.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "none",
    promotionPath: "Point-in-time snapshot; no onward promotion.",
    publicSurfaces: ["/tokenomics", "/vault"],
    internalSurfaces: [],
    status: "live",
    statusNote:
      "Real RPC balance reads are live. The VAULT_ASSETS / VAULT_INFLOWS demo data in src/lib/syndicate-config.ts is mock, quarantined, and explicitly labeled — NOT part of this layer's truth.",
    identityPosture: "identity-free",
    indexes: {
      canonDocs: ["docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md"],
      registries: [],
    },
  },
  {
    id: "liquidity",
    name: "Liquidity",
    cluster: "economic",
    purpose:
      "The SYN/USDC liquidity pool (Trader Joe v1): pair reserves, spot price, and the LP creation event.",
    sourceOfTruth: {
      description:
        "LP_POOL constants (pair address + creation tx) plus live RPC reads of reserves/price via useLpStats.",
      homeFiles: ["src/lib/syndicate-config.ts", "src/lib/sale-hooks.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "config-pinned",
    promotionPath:
      "LP creation is pinned/anchorable; LP fee accrual is RESERVED (planned, no live data-link yet).",
    publicSurfaces: ["/liquidity"],
    internalSurfaces: [],
    status: "partial",
    statusNote:
      "Pair reserves/price reads are live; LP fee accrual is reserved/planned with no live data-link. Evidence: useLpStats in src/lib/sale-hooks.ts.",
    identityPosture: "identity-free",
    indexes: {
      canonDocs: ["docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md"],
      registries: ["src/lib/protocol-metrics-registry.ts"],
    },
  },

  // ── Access & Verification ───────────────────────────────────────────────────
  {
    id: "wallet",
    name: "Wallet-linked",
    cluster: "access-verification",
    purpose:
      "The connected wallet's normalized session and a client-side cache of its on-chain reads (balance, allowance).",
    sourceOfTruth: {
      description:
        "Wagmi-backed session plus a localStorage persistence layer over on-chain reads (cache of truth, not truth).",
      homeFiles: ["src/lib/wallet-session.ts", "src/lib/wallet-reads-cache.ts"],
    },
    permanence: "local-cache",
    coverageModel: "none",
    promotionPath: "Local cache only; no onward promotion.",
    publicSurfaces: ["/my-syndicate", "/wallet/$address"],
    internalSurfaces: [],
    status: "live",
    statusNote: null,
    identityPosture: "member-derived",
    indexes: {
      canonDocs: ["docs/canon/05_FOUNDATION_FREEZE.md"],
      registries: [],
    },
  },
  {
    id: "metrics-verification",
    name: "Metrics / Verification",
    cluster: "access-verification",
    purpose:
      "The canonical dictionary of every protocol metric — its id, formula, and verification path. The 'don't trust, verify' home.",
    sourceOfTruth: {
      description:
        "The metric registry: each metric's definition, status, and on-chain verification path.",
      homeFiles: ["src/lib/protocol-metrics-registry.ts"],
    },
    permanence: "recomputed-projection",
    coverageModel: "derived",
    promotionPath:
      "Projected into the truth layer, the verify drawer, and every surface via metric aliases.",
    publicSurfaces: ["/registry"],
    internalSurfaces: ["/labs/protocol-intelligence"],
    status: "partial",
    statusNote:
      "Registry is live; some metrics carry documented ceilings / PARTIAL verification status rather than a live value. Evidence: src/lib/protocol-metrics-registry.ts.",
    identityPosture: "identity-free",
    indexes: {
      canonDocs: ["docs/canon/02_SOURCE_OF_TRUTH_TABLE.md"],
      registries: ["src/lib/protocol-metrics-registry.ts"],
    },
  },
];

export function layerById(id: string): ProtocolLayer | undefined {
  return PROTOCOL_LAYERS.find((l) => l.id === id);
}

export function layersByCluster(cluster: LayerCluster): ProtocolLayer[] {
  return PROTOCOL_LAYERS.filter((l) => l.cluster === cluster);
}

/** All layer ids, in registry order. The doctrine doc must name every one. */
export const PROTOCOL_LAYER_IDS: string[] = PROTOCOL_LAYERS.map((l) => l.id);

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE KINDS — a derived 3-way grouping over EXISTING fields (no new data).
// The public knowledge-map graph reads the homes in three honest buckets. The
// bucket is computed from a layer's permanence/status; nothing new is stored.
//   • live-projection — recomputed every load from on-chain truth (a projection).
//   • durable-overlay — written once and curated (Chronicle, Institutional
//                       Register): records an assertion + anchor, never a live value.
//   • reserved        — named and reserved, not yet built; carries no live data.
// ─────────────────────────────────────────────────────────────────────────────
export type KnowledgeKind = "live-projection" | "durable-overlay" | "reserved";

export const KNOWLEDGE_KIND_ORDER: KnowledgeKind[] = [
  "live-projection",
  "durable-overlay",
  "reserved",
];

export const KNOWLEDGE_KIND_LABELS: Record<KnowledgeKind, { title: string; blurb: string }> = {
  "live-projection": {
    title: "Live Protocol Knowledge",
    blurb:
      "Read live from on-chain truth on every load — a projection of what the chain already knows, never a separately asserted institutional record.",
  },
  "durable-overlay": {
    title: "Durable Memory",
    blurb:
      "Written once and curated. Records an assertion and its on-chain anchor — never a live value, and only ever by promotion or seed.",
  },
  reserved: {
    title: "Reserved / Future",
    blurb:
      "Named and reserved in code, not yet built. No live data — listed so the map stays honest about what does not exist yet.",
  },
};

/** Derive a layer's knowledge kind from its existing permanence/status (no new data). */
export function knowledgeKindOf(layer: ProtocolLayer): KnowledgeKind {
  if (layer.status === "reserved" || layer.permanence === "reserved") return "reserved";
  if (layer.permanence === "append-only-curated") return "durable-overlay";
  return "live-projection";
}

export function layersByKnowledgeKind(kind: KnowledgeKind): ProtocolLayer[] {
  return PROTOCOL_LAYERS.filter((l) => knowledgeKindOf(l) === kind);
}

// ─────────────────────────────────────────────────────────────────────────────
// ANTI-FRAGMENTATION RULES — the three rules formalized in the header comment above
// and in docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md, exposed as DATA so any surface
// renders them FROM here instead of duplicating the prose. The knowledge-map test
// keeps each statement aligned with doc 09.
// ─────────────────────────────────────────────────────────────────────────────
export interface AntiFragmentationRule {
  n: number;
  title: string;
  statement: string;
}

export const ANTI_FRAGMENTATION_RULES: AntiFragmentationRule[] = [
  {
    n: 1,
    title: "One canonical home per fact",
    statement:
      "Each fact has exactly one source-of-truth layer. Every other layer references it; nothing keeps a second copy.",
  },
  {
    n: 2,
    title: "Knowledge is a projection; the Register is an overlay",
    statement:
      "The Institutional Register records an assertion + anchor, never a live value (never the live LP balance, current member count, or rank).",
  },
  {
    n: 3,
    title: "Promotion or seed, otherwise held",
    statement:
      "A fact enters durable memory only by promotion (lineage-covered) or by seed (a discrete config anchor). Otherwise it is held, and remains fully available in its Protocol-Knowledge home.",
  },
];
