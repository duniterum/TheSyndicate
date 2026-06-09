// Static preview catalog for the Archive Experience Preview.
//
// Values are taken from docs/NFT_ARCHIVE_TOKEN_CATALOG_V1.md (configured /
// proposed values). These are REFERENCE values for the visual preview only —
// they are NOT live on-chain reads and the UI must label them as such.
// Live values come from useArchiveArtifactReads().

export type PreviewVisualFamily =
  | "ARTIFACT_CARD"
  | "SEAL"
  | "PIXEL_SECRET"
  | "CERTIFICATE"
  | "LEGACY";

export type PreviewRendererMode = "ONCHAIN_SVG" | "EXTERNAL_URI" | "NONE";

export type PreviewMintModel =
  | "PUBLIC_MINT_ACTIVE"
  | "PUBLIC_MINT_PLANNED"
  | "DISCOVERY_ONLY"
  | "ADMIN_MILESTONE"
  | "ADMIN_LP_SNAPSHOT"
  | "ADMIN_ROUTING_TRIGGER"
  | "ADMIN_POST_SEAL"
  | "RESERVED_FUTURE_ERC721";

export type PreviewStatus =
  | "ACTIVE_MINT_OPEN"      // ID 1 — public mint open
  | "DEPLOYED_CONFIGURED"   // configured on contract, not active
  | "RESERVED_DISABLED"     // ID 2
  | "ROADMAP";              // 4–8

export type PreviewArtifact = {
  id: number;
  name: string;
  category: string;
  chapterLabel: string;
  visualFamily: PreviewVisualFamily;
  rendererMode: PreviewRendererMode;
  mintModel: PreviewMintModel;
  status: PreviewStatus;
  // Reference target values (NOT live reads).
  targetPriceUsdc: number | null;
  proposedMaxSupply: number | null;
  proposedWalletLimit: number | null;
  description: string;
  /** Short visitor-friendly "why it matters" line for gallery cards. */
  whyItMatters: string;
  rights: {
    collectibleRecord: true;
    financial: "none";
    vaultClaim: "none";
    lpOwnership: "none";
    governance: "none";
  };
  // Visual hint colors (preview artwork only, NOT contract-rendered).
  primaryColor: string;
  accentColor: string;
};

const baseRights = {
  collectibleRecord: true as const,
  financial: "none" as const,
  vaultClaim: "none" as const,
  lpOwnership: "none" as const,
  governance: "none" as const,
};

export const PREVIEW_ARTIFACTS: PreviewArtifact[] = [
  {
    id: 1,
    whyItMatters:
      "Marks the first public signal of the Archive.",
    name: "The First Signal",
    category: "Chapter Artifact",
    chapterLabel: "Chapter I — Genesis Signal",
    visualFamily: "ARTIFACT_CARD",
    rendererMode: "ONCHAIN_SVG",
    mintModel: "PUBLIC_MINT_ACTIVE",
    status: "ACTIVE_MINT_OPEN",
    targetPriceUsdc: 0.5,
    proposedMaxSupply: 10_000,
    proposedWalletLimit: 5,
    description:
      "The Genesis Chapter Artifact. A small, public collectible record marking the opening chapter of the protocol.",
    rights: baseRights,
    primaryColor: "#0B1220",
    accentColor: "#D4AF37",
  },
  {
    id: 2,
    whyItMatters:
      "Reserved for a future ERC-721 Seat Record. Not mintable in Archive1155 V1.",
    name: "Reserved Seat Record Reference",
    category: "Identity Certificate (future ERC-721)",
    chapterLabel: "—",
    visualFamily: "CERTIFICATE",
    rendererMode: "NONE",
    mintModel: "RESERVED_FUTURE_ERC721",
    status: "RESERVED_DISABLED",
    targetPriceUsdc: null,
    proposedMaxSupply: 0,
    proposedWalletLimit: null,
    description:
      "Reserved pointer in Archive1155 V1. Not mintable. Seat Records will live in a separate future ERC-721 contract (SyndicateSeatRecord721).",
    rights: baseRights,
    primaryColor: "#1A1F2E",
    accentColor: "#8C8C8C",
  },
  {
    id: 3,
    whyItMatters:
      "A flat support Artifact. No tiers. No rank. No financial rights.",
    name: "Patron Seal",
    category: "Support Seal",
    chapterLabel: "Cross-chapter",
    visualFamily: "SEAL",
    rendererMode: "ONCHAIN_SVG",
    mintModel: "PUBLIC_MINT_ACTIVE",
    status: "ACTIVE_MINT_OPEN",
    targetPriceUsdc: 5.0,
    proposedMaxSupply: 10_000,
    proposedWalletLimit: 5,
    description:
      "A single, flat patron seal. One tier only — no Bronze/Silver/Gold, no rank, no wealth-coded status.",
    rights: baseRights,
    primaryColor: "#0B1220",
    accentColor: "#C9A227",
  },
  {
    id: 4,
    whyItMatters:
      "A hidden discovery Artifact for the curious.",
    name: "Heart Signal",
    category: "Secret Artifact",
    chapterLabel: "Hidden",
    visualFamily: "PIXEL_SECRET",
    rendererMode: "NONE",
    mintModel: "DISCOVERY_ONLY",
    status: "ROADMAP",
    targetPriceUsdc: null,
    proposedMaxSupply: null,
    proposedWalletLimit: null,
    description:
      "A secret discovery artifact. Never advertised. Never countdown-promoted. Discovery is the event.",
    rights: baseRights,
    primaryColor: "#0B1220",
    accentColor: "#E94CD6",
  },
  {
    id: 5,
    whyItMatters:
      "A ceremonial record for the Genesis era.",
    name: "Genesis Sealed",
    category: "Protocol Milestone (ceremonial)",
    chapterLabel: "Genesis seal",
    visualFamily: "SEAL",
    rendererMode: "NONE",
    mintModel: "ADMIN_MILESTONE",
    status: "ROADMAP",
    targetPriceUsdc: null,
    proposedMaxSupply: null,
    proposedWalletLimit: null,
    description:
      "Ceremonial mark issued by admin-mint to qualifying wallets at the genesis-seal milestone.",
    rights: baseRights,
    primaryColor: "#0B1220",
    accentColor: "#E5C76B",
  },
  {
    id: 6,
    whyItMatters:
      "Witnesses the protocol's first liquidity event — not a yield share.",
    name: "First Liquidity Event",
    category: "Liquidity Mark",
    chapterLabel: "LP witness",
    visualFamily: "ARTIFACT_CARD",
    rendererMode: "NONE",
    mintModel: "ADMIN_LP_SNAPSHOT",
    status: "ROADMAP",
    targetPriceUsdc: null,
    proposedMaxSupply: null,
    proposedWalletLimit: null,
    description:
      "Admin-mint to JLP holders snapshotted at the trigger block. A witness mark — not a yield share.",
    rights: baseRights,
    primaryColor: "#0B1220",
    accentColor: "#7FB7FF",
  },
  {
    id: 7,
    whyItMatters:
      "Witnesses the protocol's first live USDC routing transaction.",
    name: "First Routing Signal",
    category: "Protocol Milestone",
    chapterLabel: "Routing trigger",
    visualFamily: "ARTIFACT_CARD",
    rendererMode: "NONE",
    mintModel: "ADMIN_ROUTING_TRIGGER",
    status: "ROADMAP",
    targetPriceUsdc: null,
    proposedMaxSupply: null,
    proposedWalletLimit: null,
    description:
      "Admin-mint at the first USDC 70/20/10 routing transaction. Records the protocol's first live revenue split.",
    rights: baseRights,
    primaryColor: "#0B1220",
    accentColor: "#8CE0A6",
  },
  {
    id: 8,
    whyItMatters:
      "Closes an era as an immutable time-capsule Artifact.",
    name: "Legacy Era I",
    category: "Legacy Artifact",
    chapterLabel: "Era closure",
    visualFamily: "LEGACY",
    rendererMode: "NONE",
    mintModel: "ADMIN_POST_SEAL",
    status: "ROADMAP",
    targetPriceUsdc: null,
    proposedMaxSupply: null,
    proposedWalletLimit: null,
    description:
      "Time-capsule artifact. Admin-mint after the chapter has sealed on-chain. Locked in V1.",
    rights: baseRights,
    primaryColor: "#0B1220",
    accentColor: "#B59E58",
  },
  {
    // ID 9 — NOT configured on-chain. The deployed Archive1155 contract
    // reverts on getArtifactCore(9) / remainingSupply(9). We surface this
    // slot truthfully as a roadmap placeholder so the gallery shows the
    // full 9-slot doctrine without implying an on-chain definition exists.
    id: 9,
    whyItMatters:
      "Not configured on the deployed Archive1155 contract. Reserved roadmap slot for a long-term protocol chronicle Artifact.",
    name: "Protocol Chronicle (roadmap)",
    category: "Roadmap slot · not configured on-chain",
    chapterLabel: "Roadmap",
    visualFamily: "LEGACY",
    rendererMode: "NONE",
    mintModel: "ADMIN_POST_SEAL",
    status: "ROADMAP",
    targetPriceUsdc: null,
    proposedMaxSupply: null,
    proposedWalletLimit: null,
    description:
      "Concept preview only. ID 9 is not configured on the deployed Archive1155 contract — getArtifactCore(9) reverts. Would require an admin configureArtifact transaction before anything can be shown as on-chain.",
    rights: baseRights,
    primaryColor: "#0B1220",
    accentColor: "#9AA3B2",
  },
];

export const PREVIEW_IDS = PREVIEW_ARTIFACTS.map((a) => a.id);

export const VISUAL_FAMILY_LABEL: Record<PreviewVisualFamily, string> = {
  ARTIFACT_CARD: "Artifact Card",
  SEAL: "Seal",
  PIXEL_SECRET: "Pixel (secret)",
  CERTIFICATE: "Certificate",
  LEGACY: "Legacy Artifact",
};

export const MINT_MODEL_LABEL: Record<PreviewMintModel, string> = {
  PUBLIC_MINT_ACTIVE: "Public mint · ACTIVE",
  PUBLIC_MINT_PLANNED: "Public mint (planned)",
  DISCOVERY_ONLY: "Discovery only",
  ADMIN_MILESTONE: "Admin-mint at milestone",
  ADMIN_LP_SNAPSHOT: "Admin-mint to LP snapshot",
  ADMIN_ROUTING_TRIGGER: "Admin-mint at routing trigger",
  ADMIN_POST_SEAL: "Admin-mint after chapter seals",
  RESERVED_FUTURE_ERC721: "Reserved — future ERC-721",
};
