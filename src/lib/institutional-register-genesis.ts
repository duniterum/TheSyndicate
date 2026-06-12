// ─── Institutional Register · GENESIS SEED leaf (Sprint 9) ─────────────────
// A DOCUMENTED, LAWFUL parallel source for the Institutional Register.
//
// The register's normal legal edge is
//   … → CHRONICLE PROMOTION DECISION → INSTITUTIONAL REGISTER ENTRY
// and the deriver (institutional-register.ts) only ever projects promotion
// decisions emitted by the LIVE event scanner. But a handful of foundational,
// VERIFIED protocol-birth facts PREDATE that scanner's bounded window — the
// token deployment, the initial distribution, the sale/archive contracts, the
// first seeded liquidity, the first supply burn. Spec §3 explicitly permits an
// exception "when a foundational event predates or sits outside the current
// event scanner", provided we: document why, preserve lineage, mark each source
// as a verified / locked / coverage-limited fact, and INVENT NOTHING.
//
// This leaf is that exception. It builds InstitutionalRegisterEntry objects
// DIRECTLY from on-chain-truth config constants (the highest authority — code
// outranks docs), reusing the register's own vocabulary, copy guards, and entry
// type. It runs no derivation, reads no chain at runtime, and emits only facts
// that cite a real contract address, transaction, or block.
//
// ── ADJACENCY ──
// CONFIG (on-chain truth) → GENESIS SEED → INSTITUTIONAL REGISTER ENTRY.
// This leaf imports ONLY: the register registry leaf (entry vocabulary + the
// findHistoricClaims guard), the public selection leaf (the §5 sober-language
// guard, reused so copy-safety stays single-sourced), the protocol-language
// guard, and syndicate-config (the facts). It must NEVER import the event,
// Signal, Memory, Chronicle-review, or Chronicle-promotion layers — it does not
// read promotion decisions; it is a parallel, curated origin store. The view
// MERGES these seed entries with the live-derived entries (deduped by tx hash,
// locked seed wins) before the public selection runs.
//
// ── DOCTRINE ──
// "Held is better than invented." Coverage-gated ordinals (earliest member /
// artifact / milestone) cannot prove a "first" without deployment-range coverage
// the public window never proves, so they are SEEDED AS HELD (coverage-limited,
// internal only — never public). Verified protocol-birth facts are active.
// Every entry is protocol-centric: a protocol-wallet (steward) action is framed
// as a protocol fact ("protocol seeded liquidity", "protocol executed a supply
// burn"), never as a person's achievement (spec §5).

import { findForbiddenLanguage } from "./protocol-language";
import { findPublicVocabularyViolations } from "./institutional-register-public";
import {
  findHistoricClaims,
  INSTITUTIONAL_REGISTER,
  type InstitutionalEntryCategory,
  type InstitutionalRegisterEntry,
  type InstitutionalVerificationStatus,
} from "./institutional-register-registry";
import {
  CONTRACTS,
  LP_POOL,
  PROOF_OF_FIRE_001,
  SALE_DEPLOYMENT_BLOCK,
} from "./syndicate-config";

/**
 * Fixed curation timestamp — the date these genesis facts were curated into the
 * register (the human-finalisation act for a seeded fact). A CONSTANT, never
 * Date.now(), so SSR and client render byte-identically (no hydration drift).
 */
export const GENESIS_SEED_CURATED_AT = Date.UTC(2026, 5, 12); // 2026-06-12 UTC

// The Membership Sale creation transaction is documented in syndicate-config.ts
// directly above SALE_DEPLOYMENT_BLOCK (Avalanche C-Chain). The block is the
// exported const; the creation tx hash — the same deployment transaction — is
// pinned here as the entry's verifiable anchor so the lineage resolves to a tx.
const MEMBERSHIP_SALE_CREATION_TX =
  "0x30e1378a66dc1037d49cb7557a162635f37a90ffde80e973bd9750d39927bdb6";

/** The verifiable on-chain anchor for a seeded fact. */
type GenesisAnchor = {
  /** Transaction hash — present for tx/block-pinned (locked) facts. */
  txHash?: string;
  /** Block number — present when the fact is pinned to a block. */
  block?: bigint;
  /** Contract address — the anchor for address-verified facts (no single tx). */
  contract?: string;
};

/**
 * One curated, verifiable protocol-birth fact. `eventClass` matches the spec §4
 * seed-class vocabulary; `category` is a structural MemoryCategory the register
 * already understands. Copy is protocol-centric and person-free by construction.
 */
export type GenesisFact = {
  /** Stable slug (1:1 with the seeded entry id). */
  id: string;
  /** Spec §4 seed class (TOKEN_DEPLOYMENT / FIRST_BURN / …) — provenance label. */
  eventClass: string;
  /** Structural category the register classifies the entry under. */
  category: InstitutionalEntryCategory;
  title: string;
  summary: string;
  rationale: string;
  /**
   * "locked"  — pinned to a transaction / block (independently verifiable).
   * "verified" — anchored to a live contract address (no single origin tx).
   * "coverage-limited" — an ordinal the public window cannot prove (HELD).
   */
  verificationStatus: InstitutionalVerificationStatus;
  /** "active" for verified protocol-birth facts; "held" for coverage-gated ones. */
  disposition: "active" | "held";
  anchor: GenesisAnchor;
};

/**
 * GENESIS FACTS — curated foundational protocol memory, in canonical chronology
 * (oldest → newest). Each cites a real syndicate-config constant. The six active
 * facts are verified/locked protocol-birth events; the three held facts are
 * coverage-gated ordinals retained internally (never public) so the "held, not
 * invented" decision is itself on the record. First campaign funding is OMITTED
 * entirely — no verifiable source exists (spec §1: exclude when not verifiable).
 */
export const GENESIS_FACTS: readonly GenesisFact[] = [
  {
    id: "syn-token-deployment",
    eventClass: "TOKEN_DEPLOYMENT",
    category: "genesis",
    title: "Protocol genesis — SYN token deployed",
    summary:
      "The SYN ERC-20 membership token contract was deployed on Avalanche C-Chain, establishing the protocol's foundational unit. Fixed supply, no admin mint, no transfer tax — the verified initial state every seat is denominated in.",
    rationale:
      "Institutional protocol-birth fact. Verified against the live SYN contract and recorded as durable protocol memory, not a financial instrument.",
    verificationStatus: "verified",
    disposition: "active",
    anchor: { contract: CONTRACTS.SYN_CONTRACT_ADDRESS },
  },
  {
    id: "initial-distribution",
    eventClass: "INITIAL_DISTRIBUTION",
    category: "genesis",
    title: "Protocol initial distribution recorded",
    summary:
      "The fixed 1,000,000,000 SYN supply was allocated across the protocol's published distribution — membership, vault reserve, liquidity, and ecosystem tranches — as the verified initial state. Public wallets, no hidden unlocks.",
    rationale:
      "Institutional protocol-birth fact: the initial supply creation and allocation. Verified against the published allocation table and the on-chain allocation wallets.",
    verificationStatus: "verified",
    disposition: "active",
    anchor: { contract: CONTRACTS.SYN_CONTRACT_ADDRESS },
  },
  {
    id: "membership-sale-deployment",
    eventClass: "CONTRACT_DEPLOYMENT",
    category: "genesis",
    title: "Protocol genesis — Membership Sale contract deployed",
    summary:
      "The Membership Sale contract — which routes member USDC 70/20/10 to the vault, liquidity, and operations wallets — was deployed on Avalanche C-Chain. It is the verified entry point through which a seat is taken.",
    rationale:
      "Institutional protocol-birth fact, locked to its creation transaction and deployment block. The 70/20/10 routing split lives in this contract, never inside the token.",
    verificationStatus: "locked",
    disposition: "active",
    anchor: { txHash: MEMBERSHIP_SALE_CREATION_TX, block: SALE_DEPLOYMENT_BLOCK },
  },
  {
    id: "first-liquidity",
    eventClass: "FIRST_LIQUIDITY",
    category: "liquidity",
    title: "Protocol seeded first liquidity",
    summary:
      "The protocol established its SYN/USDC pair on Trader Joe, seeding the first liquidity for the token. Locked to the pool creation transaction — a foundational, independently verifiable protocol fact.",
    rationale:
      "Institutional protocol-birth fact: protocol-seeded liquidity, locked to the pair creation transaction. Recorded as protocol memory — not a price or scarcity claim.",
    verificationStatus: "locked",
    disposition: "active",
    anchor: { txHash: LP_POOL.creationTx },
  },
  {
    id: "archive-contract-deployment",
    eventClass: "CONTRACT_DEPLOYMENT",
    category: "genesis",
    title: "Protocol genesis — Archive contract deployed",
    summary:
      "The SyndicateArchive1155 contract was deployed on Avalanche C-Chain on 2026-06-06, establishing the protocol's permanent on-chain archive. Read-only at deployment; the verified initial state of the artifact system.",
    rationale:
      "Institutional protocol-birth fact: a first protocol contract. Verified against the live Archive contract.",
    verificationStatus: "verified",
    disposition: "active",
    anchor: { contract: CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS },
  },
  {
    id: "proof-of-fire-001",
    eventClass: "FIRST_BURN",
    category: "burn",
    title: "Protocol executed first supply burn — Proof of Fire #001",
    summary:
      "The protocol permanently removed 1,000 SYN from circulation by transferring it to the standard dead address — Proof of Fire #001. Locked to its transaction and block (87,703,847), independently verifiable on-chain.",
    rationale:
      "Institutional protocol fact: a protocol-executed supply burn, locked to its transaction. A recognition record only — no price impact or scarcity claim.",
    verificationStatus: "locked",
    disposition: "active",
    anchor: { txHash: PROOF_OF_FIRE_001.txHash, block: PROOF_OF_FIRE_001.blockNumber },
  },
  // ── HELD (coverage-limited, INTERNAL only — never surfaced publicly) ──
  // These are real categories but their ORDINAL ("earliest") cannot be proven
  // without deployment-range coverage the public window never asserts. They are
  // held, not invented, and carry NO "first" claim (which would trip the
  // coverage-gated historic-claim guard) and NO member identity.
  {
    id: "earliest-member",
    eventClass: "FIRST_MEMBER",
    category: "membership",
    title: "Earliest recorded membership — held pending coverage",
    summary:
      "The earliest membership the register can attest is held pending proof the scan window covers the full deployment range. No earliest-ever claim is asserted until coverage is proven.",
    rationale:
      "Held, not invented: a membership ordinal requires deployment-range coverage the public window does not prove.",
    verificationStatus: "coverage-limited",
    disposition: "held",
    anchor: {},
  },
  {
    id: "earliest-artifact",
    eventClass: "FIRST_ARTIFACT",
    category: "artifact",
    title: "Earliest archive artifact — held pending coverage",
    summary:
      "The earliest artifact entering the protocol archive is held pending proof the scan window covers the archive's full history. The artifact system is live, but an earliest-entry claim is not asserted without coverage.",
    rationale:
      "Held, not invented: an artifact ordinal requires archive-history coverage the public window does not prove.",
    verificationStatus: "coverage-limited",
    disposition: "held",
    anchor: {},
  },
  {
    id: "earliest-milestone",
    eventClass: "FIRST_MILESTONE",
    category: "milestone",
    title: "Earliest structural milestone — held pending coverage",
    summary:
      "The earliest pre-declared structural threshold the protocol crossed is held pending proof the scan window covers deployment. Milestones are recorded live; an earliest-crossing claim is not asserted without coverage.",
    rationale:
      "Held, not invented: a milestone ordinal requires deployment-range coverage the public window does not prove.",
    verificationStatus: "coverage-limited",
    disposition: "held",
    anchor: {},
  },
];

/** Human-readable lineage anchor for a seeded fact's trail (inspection only). */
function anchorTrail(anchor: GenesisAnchor): string {
  if (anchor.txHash) {
    return anchor.block !== undefined
      ? `tx:${anchor.txHash} · block:${anchor.block.toString()}`
      : `tx:${anchor.txHash}`;
  }
  if (anchor.contract) return `contract:${anchor.contract}`;
  return "predates-scanner (no transaction anchor)";
}

/** Build one InstitutionalRegisterEntry from a curated genesis fact. */
function buildGenesisEntry(fact: GenesisFact): InstitutionalRegisterEntry {
  const copyText = `${fact.title}\n${fact.summary}\n${fact.rationale}`;
  // Copy safety is validated against the SAME guards the live pipeline uses:
  // historic-claim (coverage-aware), forbidden-framing, and the §5 public
  // sober-language banlist. Every seeded fact must produce an EMPTY list.
  const copyViolations = [
    ...findHistoricClaims(copyText, fact.verificationStatus),
    ...findForbiddenLanguage(copyText),
    ...findPublicVocabularyViolations(copyText),
  ];

  return {
    id: `institutional-entry:genesis:${fact.id}`,
    // Lineage sentinels: these foundational facts predate the event scanner, so
    // the intermediate pipeline stages never ran. The fields are filled with
    // HONEST sentinels (not faked ids) so isLineageComplete() holds while the
    // trail truthfully reads "genesis-seed / predates-scanner".
    sourcePromotionDecisionId: `genesis-seed:${fact.id}`,
    sourceChronicleReviewCandidateId: "predates-scanner",
    sourceMemoryCandidateId: "predates-scanner",
    sourceSignalId: "predates-scanner",
    sourceEventId: `genesis-fact:${fact.id}`,
    sourceTxHash: fact.anchor.txHash,
    sourceBlock: fact.anchor.block,
    register: INSTITUTIONAL_REGISTER,
    category: fact.category,
    title: fact.title,
    summary: fact.summary,
    rationale: fact.rationale,
    verificationStatus: fact.verificationStatus,
    entryStatus: fact.disposition,
    createdFrom: "genesis-seed",
    // The curated registry IS the human-finalisation act for an active fact;
    // held facts are not finalised, so they carry no finalisation timestamp.
    createdAt: fact.disposition === "active" ? GENESIS_SEED_CURATED_AT : null,
    derivedAt: null,
    lineage: [
      `institutional-entry:genesis:${fact.id}`,
      `genesis-seed:${fact.id} (curated, predates event scanner)`,
      `genesis-fact:${fact.id}`,
      anchorTrail(fact.anchor),
    ],
    copyViolations,
  };
}

/**
 * Build the seeded genesis register entries (active + held), in canonical
 * chronology. Pure and deterministic — same output every render, every server.
 */
export function deriveGenesisRegisterEntries(): InstitutionalRegisterEntry[] {
  return GENESIS_FACTS.map(buildGenesisEntry);
}
