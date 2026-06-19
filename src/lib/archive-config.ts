// ─── Archive Engine — V1 Config ───────────────────────────────────────────
//
// SYN is the seat. Artifacts are the memory.
//
// This file is the SINGLE source of truth for the Archive layer (categories,
// artifact records, target launch prices, statuses). ID 1 is live today;
// every other artifact remains inactive, locked, secret, or future-contract.
//
// IMPORTANT — legal posture:
//   Artifacts are collectible records only. They are NOT equity, debt,
//   Vault ownership, dividend instruments, revenue share, governance rights,
//   or promises of profit. Participation may result in total loss.
//
// IMPORTANT — naming gates passed:
//   • Patron Seal (singular, flat support) — wealth-tiering removed per
//     Core Asset gate (status is positional, never wealth-coded).
//   • Protocol Milestones (renamed from "Vault Relics") — avoids implying
//     Vault ownership which every disclaimer denies.
//   • All other names retained from the V1 brief.
//
// IMPORTANT — what this file does NOT do:
//   • does not invent contract addresses
//   • does not invent mint counts, holders, or revenue
//   • does not present read-gated artifacts as mintable without live reads
//   • does not bind the protocol to ship every listed item
//
// See docs/ARCHIVE_ENGINE_V1.md for the gate audit + roadmap.

/** Artifact-layer status vocabulary. Distinct from CanonicalStatus on
 *  purpose — these describe an artifact's mint state, not a metric's
 *  trust state. */
export type ArtifactStatus =
  | "ACTIVE_MINT_OPEN"
  | "CONFIGURED_NOT_ACTIVE"
  | "PENDING_CONTRACT"
  | "PENDING_ELIGIBILITY"
  | "LOCKED"
  | "SECRET";

export const ARTIFACT_STATUS_LABEL: Record<ArtifactStatus, string> = {
  ACTIVE_MINT_OPEN:      "ACTIVE · MINT OPEN",
  CONFIGURED_NOT_ACTIVE: "CONFIGURED · NOT ACTIVE",
  PENDING_CONTRACT:      "PENDING SEPARATE CONTRACT",
  PENDING_ELIGIBILITY:   "PENDING ELIGIBILITY",
  LOCKED:                "LOCKED",
  SECRET:                "SECRET",
};

export const ARTIFACT_STATUS_HINT: Record<ArtifactStatus, string> = {
  ACTIVE_MINT_OPEN:
    "Backed by the deployed Archive1155 contract on Avalanche. Visitor copy must still respect per-artifact read gates.",
  CONFIGURED_NOT_ACTIVE:
    "Defined on the deployed Archive1155 contract but mint is not enabled yet.",
  PENDING_CONTRACT:
    "Depends on a separate future contract (e.g. SyndicateSeatRecord721) that has not been deployed yet. The Archive1155 contract is deployed.",
  PENDING_ELIGIBILITY:
    "Eligibility logic depends on a companion module that is not yet live.",
  LOCKED:
    "Will unlock when a real on-chain event occurs (e.g. chapter sealing, milestone reached).",
  SECRET:
    "Hidden discovery. Not advertised. Only revealed when found.",
};

// ─── Categories ───────────────────────────────────────────────────────────

export type ArtifactCategoryId =
  | "chapter"
  | "seat-record"
  | "founder-mark"
  | "milestone"
  | "liquidity"
  | "protocol-milestone"
  | "patron"
  | "secret"
  | "legacy";

export type ArtifactCategory = {
  id: ArtifactCategoryId;
  letter: string;
  name: string;
  status: ArtifactStatus;
  explanation: string;
  unlock: string;
  cta: "View" | "Locked" | "Coming" | "Eligible" | "Hidden";
};

export const ARCHIVE_CATEGORIES: ArtifactCategory[] = [
  {
    id: "chapter",
    letter: "A",
    name: "Chapter Artifacts",
    status: "ACTIVE_MINT_OPEN",
    explanation:
      "Public chapter mints. One artifact per chapter, mintable only while that chapter is open. The Genesis Chapter Artifact — The First Signal (ID 1) — is open now.",
    unlock: "Open during the active chapter. Closes when the chapter seals.",
    cta: "View",
  },
  {
    id: "seat-record",
    letter: "B",
    name: "Seat Records",
    status: "PENDING_CONTRACT",
    explanation:
      "Optional timestamp of a membership purchase. Encodes member number, chapter, block height, and wallet. Lives in a separate future ERC-721 contract (SyndicateSeatRecord721).",
    unlock: "Available after a verified Membership Sale purchase, once SyndicateSeatRecord721 ships.",
    cta: "Coming",
  },
  {
    id: "founder-mark",
    letter: "C",
    name: "Genesis Founder Marks",
    status: "PENDING_ELIGIBILITY",
    explanation:
      "Recognition for early helpers and Genesis-era members. Identity, not entitlement.",
    unlock: "Eligibility is computed from on-chain Genesis participation.",
    cta: "Eligible",
  },
  {
    id: "milestone",
    letter: "D",
    name: "Milestone Artifacts",
    status: "LOCKED",
    explanation:
      "Unlocked by named protocol milestones: First Member, First $100 Routed, First $1,000 Routed, Genesis Signal sealed (#333).",
    unlock: "Releases automatically when its on-chain trigger occurs.",
    cta: "Locked",
  },
  {
    id: "liquidity",
    letter: "E",
    name: "Liquidity Marks",
    status: "LOCKED",
    explanation:
      "Unlocked by Trader Joe SYN/USDC LP participation and first LP events.",
    unlock: "Eligibility derived from JLP balance and LP event history.",
    cta: "Locked",
  },
  {
    id: "protocol-milestone",
    letter: "F",
    name: "Protocol Milestones",
    status: "LOCKED",
    explanation:
      "Collectible records of public on-chain moments — chapter changes, USDC routing events, liquidity events. Does not grant ownership of the Vault, treasury, routed funds, liquidity, or revenue.",
    unlock: "Triggered by verifiable on-chain protocol activity.",
    cta: "Locked",
  },
  {
    id: "patron",
    letter: "G",
    name: "Patron Seals",
    status: "ACTIVE_MINT_OPEN",
    explanation:
      "Optional support artifact for people who want to help fund development, infrastructure, design, operations, and public storytelling. Active on the deployed Archive contract at 5.00 USDC, but PUBLIC_MINT_READ_GATED: wallet mintability must come from live Archive1155 reads. Wallet limit 5, supply 10,000.",
    unlock: "Read-gated on Avalanche. Connect a wallet to check mintability from the live contract. Single flat support amount - no tiers.",
    cta: "View",
  },
  {
    id: "secret",
    letter: "H",
    name: "Secret Artifacts",
    status: "SECRET",
    explanation:
      "Hidden discoveries. Found through curiosity — footer details, reading the docs carefully, attentive participation.",
    unlock: "Not advertised. Found, not granted.",
    cta: "Hidden",
  },
  {
    id: "legacy",
    letter: "I",
    name: "Legacy Artifacts",
    status: "LOCKED",
    explanation:
      "Long-term historical records. Released only after their chapters or eras have sealed.",
    unlock: "Released against permanent on-chain history once sealed.",
    cta: "Locked",
  },
];

// ─── Initial named artifacts (V1 list) ────────────────────────────────────

export type ArtifactRecord = {
  id: string;
  name: string;
  category: ArtifactCategoryId;
  /** Target launch price in USDC. Null = no fixed price (locked / secret / TBD). */
  targetPriceUsdc: number | null;
  status: ArtifactStatus;
  /** One-line description. */
  blurb: string;
  /** Where the unlock signal comes from (chapter / member# / event). */
  unlock: string;
};

export const ARCHIVE_ARTIFACTS: ArtifactRecord[] = [
  {
    id: "first-signal",
    name: "The First Signal",
    category: "chapter",
    targetPriceUsdc: 0.5,
    status: "ACTIVE_MINT_OPEN",
    blurb:
      "The Genesis Chapter Artifact — the first public Archive mint. Open at 0.50 USDC on Avalanche during Chapter I (Genesis Signal · Members #1 – #333).",
    unlock: "Open during Chapter I — Genesis Signal (Members #1 – #333).",
  },
  {
    id: "seat-record",
    name: "Seat Record",
    category: "seat-record",
    targetPriceUsdc: 0.1,
    status: "PENDING_CONTRACT",
    blurb:
      "Optional timestamp of a Membership Sale purchase. Encodes member number, chapter, and block height. Future ERC-721 (SyndicateSeatRecord721) — not deployed.",
    unlock: "Available after a verified Membership Sale purchase, once SyndicateSeatRecord721 ships.",
  },
  {
    id: "patron-seal",
    name: "Patron Seal",
    category: "patron",
    targetPriceUsdc: 5,
    status: "ACTIVE_MINT_OPEN",
    blurb:
      "Optional support artifact. Single flat amount - no tiers, no rank. Active on the deployed Archive contract at 5.00 USDC, but shown as mintable only from live Archive1155 wallet reads (wallet limit 5, supply 10,000).",
    unlock: "Connect a wallet on Avalanche to check read-gated mintability.",
  },
  {
    id: "heart-signal",
    name: "Heart Signal",
    category: "secret",
    targetPriceUsdc: null,
    status: "SECRET",
    blurb:
      "A hidden discovery. Some artifacts are found, not advertised.",
    unlock: "Not announced. Found by reading carefully.",
  },
  {
    id: "genesis-sealed",
    name: "Genesis Sealed",
    category: "milestone",
    targetPriceUsdc: null,
    status: "LOCKED",
    blurb:
      "Marks the moment Chapter I — Genesis Signal seals at Member #333. Released automatically when the sealing transaction fires.",
    unlock: "Unlocks when Chapter I — Genesis Signal seals at Member #333.",
  },

  {
    id: "first-lp-mark",
    name: "First LP Mark",
    category: "liquidity",
    targetPriceUsdc: null,
    status: "LOCKED",
    blurb:
      "Recognizes the first Trader Joe SYN/USDC LP event. Eligibility derived from JLP holdings at the trigger block.",
    unlock: "Unlocks at the first LP event.",
  },
];

export const ARCHIVE_DISCLAIMER =
  "Artifacts are collectible records only. They are not equity, debt, Vault ownership, dividend instruments, revenue share, governance rights, or promises of profit. Participation may result in total loss.";
