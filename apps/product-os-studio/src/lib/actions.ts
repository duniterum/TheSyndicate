// THE SYNDICATE — PROTOCOL ACTION REGISTRY ("the toolkit").
//
// A single source of truth for every action a person can take in the Product OS,
// role-aware and truth-labeled. Pages (public-toolkit, member toolkit, wallet,
// economy, share, founder console) render FROM this registry so an action's
// access requirement, status, and safety labels can never drift across surfaces.
//
// TRUTH POSTURE (hard rules):
// - This is a SIMULATED, frontend-only prototype. No action executes a real
//   transaction, posts on-chain, or moves funds.
// - External tools (DEX / swap / liquidity / charts) are NOT wired. Such actions
//   carry an `externalWarning`, a neutral risk note, and are `disabledReason`-gated.
// - Token import / watch is a simulated preview only: the SYN address is a READ-ONLY
//   PRODUCTION PROOF constant, but the Studio never calls wallet_watchAsset (not wired).
// - Burn = Proof of Fire: a costly signal that retires supply. Never minting,
//   never yield, never a price promise.

import {
  User,
  Wallet,
  Copy,
  Download,
  ArrowLeftRight,
  Droplets,
  Flame,
  Share2,
  Database,
  History,
  Award,
  Hammer,
  Users,
  FileText,
  Shield,
  Activity as ActivityIcon,
  Search,
  LineChart,
  type LucideIcon,
} from "lucide-react";

import type { RouteRequirement } from "./navigation";
import type { Status as DisplayStatus } from "@/components/ui/status-badge";
import type { SharePayload } from "@/components/share-dialog";
import { SYN_TOKEN } from "./production-constants";
import { EXTERNAL_LINKS, EXTERNAL_LINK_WARNING } from "./external-links";

export type { DisplayStatus };

// "public" = visible to everyone (no wallet). Otherwise reuse member route
// requirements so action gating and nav gating share one vocabulary.
export type ActionVisibility = "public" | RouteRequirement;

export type ActionType =
  | "internal-route" // navigates within the OS
  | "external-link" // leaves the app (always warned, usually disabled here)
  | "wallet-action" // a simulated wallet preview (e.g. Import SYN)
  | "copy" // copies a value to the clipboard
  | "share" // opens the share dialog
  | "modal-preview" // opens an in-app simulated preview
  | "future"; // a roadmap concept, not actionable yet

// Presentation tier — keeps category pages to three readable bands instead of a
// wall of buttons.
export type ActionTier = "primary" | "proof" | "future";

export type ActionCategory =
  | "membership"
  | "wallet"
  | "dex"
  | "liquidity"
  | "burn"
  | "proof"
  | "memory"
  | "recognition"
  | "builder"
  | "referral"
  | "identity"
  | "operator";

export interface ProtocolAction {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  tier: ActionTier;
  visibility: ActionVisibility;
  /** StatusBadge label — reused, never a parallel enum. */
  displayStatus: DisplayStatus;
  actionType: ActionType;
  icon: LucideIcon;
  /** Short, honest note on what is real vs simulated for this action. */
  sourceTruth: string;
  /** Internal destination (internal-route / future links). */
  href?: string;
  /** External destination — only set for external-link; rendered behind a warning. */
  externalUrl?: string;
  /** Value to copy for copy actions. */
  copyValue?: string;
  /** If set, the action is shown but disabled, with this reason. */
  disabledReason?: string;
  /** Compact safety chips (e.g. "Simulated", "Not a price promise"). */
  safetyLabels?: string[];
  /** Confirmation text shown before an external tool is opened. */
  externalWarning?: string;
  /** Related public surface id or member path, for "see the proof" links. */
  relatedSurfaceId?: string;
  /** What proof this action produces, if any. */
  proofOutput?: string;
  /** How it flows through the organism (e.g. "Activity -> Candidate -> Chronicle"). */
  graphOutput?: string;
  /** Render the real, safe Import SYN (wallet_watchAsset) control instead of a simulated preview. */
  realWalletImport?: boolean;
  /** How a copy action's value is described: a simulated note, or a canonical proof value. */
  copyTruth?: "simulated" | "canonical";
  /** Share payload for share actions. */
  sharePayload?: SharePayload;
}

const EXTERNAL_RISK =
  "External tools carry market risk, slippage, and impermanent loss. Nothing here is a promised return. Always verify the real contract address from an official Syndicate channel before interacting.";

// ---- Category metadata (ordered, for category-led dashboards) --------------

export interface ActionCategoryDef {
  id: ActionCategory;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const ACTION_CATEGORIES: ActionCategoryDef[] = [
  { id: "membership", label: "Membership", description: "Take a seat and route capital by the canonical split.", icon: User },
  { id: "wallet", label: "Wallet & Token", description: "SYN and USDC tools. Import, copy, and inspect — simulated previews only.", icon: Wallet },
  { id: "dex", label: "Swap / DEX", description: "Market tools. Not wired in this prototype — external and source-required.", icon: ArrowLeftRight },
  { id: "liquidity", label: "Liquidity", description: "Liquidity provision concepts. External and not wired.", icon: Droplets },
  { id: "burn", label: "Proof of Fire", description: "Burn as a costly signal — supply retired, never minted, never a price promise.", icon: Flame },
  { id: "proof", label: "Proof & Share", description: "Make a seat, receipt, or milestone verifiable and portable.", icon: Share2 },
  { id: "memory", label: "Memory", description: "Anchor and revisit protocol memory — Archive and Chronicle.", icon: History },
  { id: "recognition", label: "Recognition", description: "Multi-axis standing. Proof-backed signals, never a wealth ladder.", icon: Award },
  { id: "builder", label: "Contributor Workbench", description: "Propose contributions across the protocol surfaces.", icon: Hammer },
  { id: "referral", label: "Verified Introduction", description: "Source attribution — a V1 candidate, not live today.", icon: Users },
  { id: "identity", label: "Identity", description: "SeatRecord as identity — a future module.", icon: FileText },
  { id: "operator", label: "Operator Toolkit", description: "Founder-only control: review candidates and Proof of Fire.", icon: Shield },
];

export function getActionCategory(id: ActionCategory): ActionCategoryDef | undefined {
  return ACTION_CATEGORIES.find((c) => c.id === id);
}

// ---- The registry ----------------------------------------------------------

export const ACTION_REGISTRY: ProtocolAction[] = [
  // --- Membership ---
  {
    id: "act-take-seat",
    title: "Take your seat",
    description: "Acquire a binary on-chain membership seat and route USDC by the canonical 70% / 20% / 10% split.",
    category: "membership",
    tier: "primary",
    visibility: "connected",
    displayStatus: "LIVE NOW",
    actionType: "internal-route",
    icon: User,
    href: "/member/join",
    sourceTruth: "Membership engine is the live module. Connecting and routing are simulated in this prototype.",
    relatedSurfaceId: "economy",
    proofOutput: "Membership receipt",
    graphOutput: "Raw event -> Activity -> Recognition (Capital axis) -> Share",
  },
  {
    id: "act-view-receipt",
    title: "View your receipt",
    description: "Open the proof of your membership — amount routed and the canonical split that processed it.",
    category: "membership",
    tier: "proof",
    visibility: "seated",
    displayStatus: "LIVE NOW",
    actionType: "internal-route",
    icon: FileText,
    href: "/member/my-syndicate",
    sourceTruth: "Receipt values are simulated prototype data.",
    proofOutput: "Routed-capital receipt",
  },
  {
    id: "act-public-economy",
    title: "See the routing model",
    description: "The 70% / 20% / 10% routing model and protocol economy — public, read-only proof before you connect.",
    category: "membership",
    tier: "proof",
    visibility: "public",
    displayStatus: "READ-ONLY",
    actionType: "internal-route",
    icon: Search,
    href: "/economy",
    sourceTruth: "Public, anonymized protocol-level figures. Simulated for the prototype.",
    relatedSurfaceId: "economy",
  },

  // --- Wallet & Token ---
  {
    id: "act-import-syn",
    title: "Import SYN",
    description: "Add SYN to your wallet's token list via wallet_watchAsset. SYN is the accounting unit, not a financial right.",
    category: "wallet",
    tier: "primary",
    visibility: "public",
    displayStatus: "LIVE NOW",
    actionType: "wallet-action",
    icon: Download,
    realWalletImport: true,
    safetyLabels: ["Real wallet_watchAsset", "Decimals read live", "Not a financial right"],
    sourceTruth: "A real wallet_watchAsset call. The SYN address is READ-ONLY PRODUCTION PROOF and decimals are read live on-chain before importing — no funds move and no transaction is sent.",
    proofOutput: "SYN added to your wallet",
    relatedSurfaceId: "registry",
  },
  {
    id: "act-copy-syn-address",
    title: "Copy SYN address",
    description: "Copy the canonical SYN token address (READ-ONLY PRODUCTION PROOF). Copying it wires nothing.",
    category: "wallet",
    tier: "primary",
    visibility: "public",
    displayStatus: "READ-ONLY PRODUCTION PROOF",
    actionType: "copy",
    icon: Copy,
    copyValue: SYN_TOKEN.address,
    copyTruth: "canonical",
    safetyLabels: ["Read-only proof", "Copying wires nothing"],
    sourceTruth: "The SYN address is a READ-ONLY PRODUCTION PROOF constant from the porting map. Copying it never calls or wires a contract; a read-only Snowtrace link lives in the Registry.",
    relatedSurfaceId: "registry",
  },
  {
    id: "act-view-wallet",
    title: "Open your wallet",
    description: "Balances, approvals, and token tools for SYN and USDC — a simulated member dashboard.",
    category: "wallet",
    tier: "primary",
    visibility: "connected",
    displayStatus: "SIMULATED PROTOTYPE",
    actionType: "internal-route",
    icon: Wallet,
    href: "/member/wallet",
    sourceTruth: "Balances and approvals are simulated prototype values.",
  },

  // --- Swap / DEX ---
  {
    id: "act-swap-dex",
    title: "Swap on Trader Joe (LFJ)",
    description: "Open the canonical Trader Joe (LFJ) trade route on Avalanche to swap USDC for SYN.",
    category: "dex",
    tier: "primary",
    visibility: "public",
    displayStatus: "EXTERNAL",
    actionType: "external-link",
    icon: ArrowLeftRight,
    externalUrl: EXTERNAL_LINKS.swapUsdcToSyn,
    safetyLabels: ["External tool", "Market risk", "Not a promised return"],
    externalWarning: EXTERNAL_LINK_WARNING,
    sourceTruth: "Opens Trader Joe (LFJ) on Avalanche (USDC → SYN) — a canonical external venue. SYN is acquired/anchored through membership, not pumped.",
    relatedSurfaceId: "economy",
  },
  {
    id: "act-price-chart",
    title: "View market chart",
    description: "Track the SYN / USDC pair on DexScreener — canonical, third-party market data.",
    category: "dex",
    tier: "proof",
    visibility: "public",
    displayStatus: "EXTERNAL",
    actionType: "external-link",
    icon: LineChart,
    externalUrl: EXTERNAL_LINKS.lpPairChart,
    safetyLabels: ["External tool", "Market risk"],
    externalWarning: EXTERNAL_LINK_WARNING,
    sourceTruth: "Opens the canonical DexScreener page for the SYN / USDC pair. Market data is third-party; nothing here is a promised return.",
    relatedSurfaceId: "economy",
  },

  // --- Liquidity ---
  {
    id: "act-provide-liquidity",
    title: "Provide liquidity",
    description: "Add SYN / USDC to the canonical liquidity pair. The add-liquidity deep link is not verified, so it stays not wired here.",
    category: "liquidity",
    tier: "future",
    visibility: "seated",
    displayStatus: "NOT WIRED",
    actionType: "external-link",
    icon: Droplets,
    disabledReason: "Add-liquidity deep link not verified — kept not wired. The SYN / USDC LP pair is shown as READ-ONLY PRODUCTION PROOF in the Registry.",
    safetyLabels: ["External tool", "Impermanent loss", "Market risk", "Not a promised return"],
    externalWarning: EXTERNAL_LINK_WARNING,
    sourceTruth: "Liquidity is one canonical routing destination (20%). The LP pair address is canonical, but no verified add-liquidity URL exists — so this stays not wired rather than guessing a link.",
    relatedSurfaceId: "economy",
  },

  // --- Proof of Fire (burn) ---
  {
    id: "act-propose-burn",
    title: "Propose a burn",
    description: "Propose retiring SYN supply as a costly signal. Founder review is required before any burn could be real.",
    category: "burn",
    tier: "primary",
    visibility: "seated",
    displayStatus: "CONCEPT ONLY",
    actionType: "internal-route",
    icon: Flame,
    href: "/member/fire",
    safetyLabels: ["Retires supply", "Not minting", "Not yield", "Not a price promise"],
    sourceTruth: "No burn is executed. A proposal becomes a founder-gated candidate in the Fire Ledger.",
    relatedSurfaceId: "fire",
    proofOutput: "Fire Ledger candidate",
    graphOutput: "Activity -> Candidate (fire) -> Founder review -> Chronicle / Archive",
  },
  {
    id: "act-view-fire-ledger",
    title: "Open the Fire Ledger",
    description: "Proof of Fire — every proposed and recorded burn, labeled simulated, with no fake transactions.",
    category: "burn",
    tier: "proof",
    visibility: "public",
    displayStatus: "SIMULATED PROTOTYPE",
    actionType: "internal-route",
    icon: Flame,
    href: "/fire",
    safetyLabels: ["Simulated total", "Proof, not price"],
    sourceTruth: "The burned-SYN aggregate is simulated prototype data. The one real record is PROOF_OF_FIRE_001 (READ-ONLY PRODUCTION PROOF, shown static); a live burn-event scan is ADAPTER REQUIRED.",
    relatedSurfaceId: "fire",
  },
  {
    id: "act-share-fire",
    title: "Share a Proof of Fire",
    description: "Turn a recorded burn concept into a portable proof card. Witness, never hype.",
    category: "burn",
    tier: "proof",
    visibility: "seated",
    displayStatus: "PROTOTYPE ONLY",
    actionType: "share",
    icon: Share2,
    sourceTruth: "Sharing opens public intents with prototype text. No image is generated and nothing is posted for you.",
    sharePayload: {
      title: "Proof of Fire",
      summary: "A costly signal: supply retired, nothing minted.",
      eyebrow: "Proof of Fire",
      accent: "orange",
      lines: [
        { label: "Signal", value: "SYN retired" },
        { label: "Nature", value: "Not yield · Not a price promise" },
        { label: "Chapter", value: "Genesis Signal" },
        { label: "Status", value: "Simulated" },
      ],
      shareText:
        "Proof of Fire on The Syndicate: a burn is a costly signal — supply retired, nothing minted, no promised return. Prototype.",
      footnote: "simulated proof",
    },
  },

  // --- Proof & Share ---
  {
    id: "act-share-proof",
    title: "Make a share card",
    description: "Turn a seat, receipt, chapter, or milestone into a portable, branded proof card.",
    category: "proof",
    tier: "primary",
    visibility: "public",
    displayStatus: "PROTOTYPE ONLY",
    actionType: "internal-route",
    icon: Share2,
    href: "/share",
    sourceTruth: "Sharing is prototype-only — public intents with prototype text, no generated image.",
    relatedSurfaceId: "share",
  },
  {
    id: "act-view-registry",
    title: "Open the Registry",
    description: "Contract and protocol proof summary. Real deployed addresses are READ-ONLY PRODUCTION PROOF (static, read-only explorer links); concepts not in the porting map stay inert placeholders.",
    category: "proof",
    tier: "proof",
    visibility: "public",
    displayStatus: "READ-ONLY",
    actionType: "internal-route",
    icon: Database,
    href: "/registry",
    sourceTruth: "Addresses are simulated prototype data; explorer links are inert.",
    relatedSurfaceId: "registry",
  },
  {
    id: "act-view-activity",
    title: "Watch the heartbeat",
    description: "The protocol Activity feed — a public, read-only stream of protocol events.",
    category: "proof",
    tier: "proof",
    visibility: "public",
    displayStatus: "READ-ONLY",
    actionType: "internal-route",
    icon: ActivityIcon,
    href: "/activity",
    sourceTruth: "Public, anonymized protocol-level events. Simulated for the prototype.",
    relatedSurfaceId: "activity",
  },

  // --- Memory ---
  {
    id: "act-anchor-memory",
    title: "Anchor a memory",
    description: "Preserve a milestone as a permanent Archive memory object (ERC-1155). Memory, not financial rights.",
    category: "memory",
    tier: "primary",
    visibility: "seated",
    displayStatus: "LIVE NOW",
    actionType: "internal-route",
    icon: History,
    href: "/member/archive",
    sourceTruth: "Archive is a live module. Anchoring is simulated in this prototype.",
    relatedSurfaceId: "archive",
    proofOutput: "Archive memory object",
    graphOutput: "Candidate (archive) -> Memory -> Share",
  },
  {
    id: "act-view-chronicle",
    title: "Read the Chronicle",
    description: "Curated institutional canon — selective history, founder-gated. Most events never qualify.",
    category: "memory",
    tier: "proof",
    visibility: "public",
    displayStatus: "READ-ONLY",
    actionType: "internal-route",
    icon: History,
    href: "/chronicle",
    sourceTruth: "Canon is simulated prototype history.",
    relatedSurfaceId: "chronicle",
  },

  // --- Recognition ---
  {
    id: "act-view-recognition",
    title: "View recognition",
    description: "Multi-axis standing — proof-backed signals across eleven axes. Never a wealth leaderboard.",
    category: "recognition",
    tier: "primary",
    visibility: "public",
    displayStatus: "READ-ONLY",
    actionType: "internal-route",
    icon: Award,
    href: "/recognition",
    sourceTruth: "The public board is anonymized; standing is simulated prototype data.",
    relatedSurfaceId: "recognition",
  },

  // --- Contributor Workbench ---
  {
    id: "act-open-workbench",
    title: "Open the Workbench",
    description: "Propose a contribution across the protocol surfaces and follow it toward recognition.",
    category: "builder",
    tier: "primary",
    visibility: "seated",
    displayStatus: "PROTOTYPE ONLY",
    actionType: "internal-route",
    icon: Hammer,
    href: "/member/workbench",
    sourceTruth: "Contribution submission is a prototype concept — nothing is sent to a backend.",
    proofOutput: "Contribution candidate",
    graphOutput: "Activity -> Candidate (recognition) -> Founder review -> Recognition signal",
  },

  // --- Verified Introduction ---
  {
    id: "act-referral-status",
    title: "Verified Introduction",
    description: "Source attribution status. A V1 candidate, not live today — the default source stays ZERO_SOURCE_ID.",
    category: "referral",
    tier: "future",
    visibility: "public",
    displayStatus: "V1 CANDIDATE",
    actionType: "internal-route",
    icon: Users,
    href: "/referral-status",
    sourceTruth: "No public referral activation is live. There is no source link or downline of any kind.",
    relatedSurfaceId: "referral-status",
  },

  // --- Identity ---
  {
    id: "act-seat-record",
    title: "Claim SeatRecord",
    description: "Identity as an on-chain record (ERC-721). A future module, not yet deployed.",
    category: "identity",
    tier: "future",
    visibility: "seated",
    displayStatus: "FUTURE",
    actionType: "future",
    icon: FileText,
    href: "/member/seat-record",
    disabledReason: "SeatRecord721 is a future module — not yet deployed.",
    sourceTruth: "Planned module. No claim path exists in the prototype.",
  },

  // --- Operator Toolkit (founder only) ---
  {
    id: "act-founder-console",
    title: "Open Founder Console",
    description: "The control room — review candidates before they become canon or public truth.",
    category: "operator",
    tier: "primary",
    visibility: "founder",
    displayStatus: "SIMULATED PROTOTYPE",
    actionType: "internal-route",
    icon: Shield,
    href: "/member/founder-review",
    sourceTruth: "Operator mode is simulated UI gating only — not production authentication.",
  },
  {
    id: "act-review-fire",
    title: "Review Proof of Fire",
    description: "Approve or decline proposed burns. No burn is real until an operator confirms it — and nothing executes here.",
    category: "operator",
    tier: "primary",
    visibility: "founder",
    displayStatus: "CONCEPT ONLY",
    actionType: "internal-route",
    icon: Flame,
    href: "/member/fire",
    safetyLabels: ["Founder-gated", "No execution"],
    sourceTruth: "Burn review is a simulated decision surface. Approving does not execute a burn.",
    relatedSurfaceId: "fire",
  },
];

// ---- Role + selectors ------------------------------------------------------

export interface RoleState {
  isConnected: boolean;
  isSeated: boolean;
  isFounder: boolean;
}

export const PUBLIC_ROLE: RoleState = { isConnected: false, isSeated: false, isFounder: false };

// Can the given role access (unlock) this action? Locked actions are still shown
// on category pages, with a role-lock affordance.
export function canAccessAction(action: ProtocolAction, role: RoleState): boolean {
  switch (action.visibility) {
    case "public":
      return true;
    case "connected":
      return role.isConnected;
    case "seated":
      return role.isConnected && role.isSeated;
    case "founder":
      return role.isConnected && role.isFounder;
    default:
      return false;
  }
}

// Human-readable lock reason for a role that cannot access an action.
export function actionLockReason(action: ProtocolAction): string | undefined {
  switch (action.visibility) {
    case "connected":
      return "Connect your wallet to use this";
    case "seated":
      return "Requires a seat";
    case "founder":
      return "Founder / operator only";
    default:
      return undefined;
  }
}

export function getActionsByCategory(category: ActionCategory): ProtocolAction[] {
  return ACTION_REGISTRY.filter((a) => a.category === category);
}

export function getActionsByTier(tier: ActionTier): ProtocolAction[] {
  return ACTION_REGISTRY.filter((a) => a.tier === tier);
}

export function getActionsByVisibility(visibility: ActionVisibility): ProtocolAction[] {
  return ACTION_REGISTRY.filter((a) => a.visibility === visibility);
}

// Actions a role can actually use right now (for member quick-action panels).
export function getActionsForRole(role: RoleState): ProtocolAction[] {
  return ACTION_REGISTRY.filter((a) => canAccessAction(a, role));
}

// Category groups that contain at least one action visible to a role (locked or
// not), preserving ACTION_CATEGORIES order. Founder-only categories are hidden
// from non-founders entirely (consistent with founder nav hiding).
export function getVisibleCategories(role: RoleState): { def: ActionCategoryDef; actions: ProtocolAction[] }[] {
  return ACTION_CATEGORIES.map((def) => {
    let actions = getActionsByCategory(def.id);
    if (def.id === "operator" && !role.isFounder) actions = [];
    return { def, actions };
  }).filter((g) => g.actions.length > 0);
}
