// protocol-actions — the typed shell that describes every user action the
// protocol exposes, present and planned. This is a SHELL, not a product
// registry: it carries metadata (what an action needs, where it lives, where
// it sends the user on success) so future surfaces can reason about actions
// uniformly. It does NOT render CTAs and does NOT assert live on-chain state.
//
// DOCTRINE GUARDS:
//   - Truth preserved: `joinMembership` is the Sale V2 membership purchase,
//     live-but-unaudited / early. V1 is sealed (history) and is not an action.
//   - Future actions (referral commission, campaign / merch claims, Seat
//     Record mint, marketplace) are marked `pending` and MUST NOT be rendered
//     as live CTAs. CommissionRouter is unset; SeatRecord721 is not deployed.
//   - No financial-return framing. Artifacts and rank confer no rights.
//
// Pure-data leaf: no chain reads, no React.

export type ProtocolActionId =
  // ── Live / current ──
  | "joinMembership"
  | "mintFirstSignal"
  | "mintPatronSeal"
  | "verifyProtocol"
  | "tradeSyn"
  | "addLiquidity"
  | "openMySyndicate"
  // ── Future placeholders (not rendered as live CTAs) ──
  | "claimEscrowedCommission"
  | "claimCampaignReward"
  | "claimMerchEligibility"
  | "mintSeatRecord721"
  | "marketplaceAction";

export type ProtocolActionKind =
  | "membership"
  | "mint"
  | "verify"
  | "trade"
  | "liquidity"
  | "navigate"
  | "claim"
  | "marketplace";

export type ProtocolActionStatus =
  /** Implemented and operational on-chain. */
  | "live"
  /** Live and usable, but the contract is unaudited / early. */
  | "live-unaudited"
  /** Implemented in code but gated by live on-chain state. */
  | "preview"
  /** Planned; no contract / wiring exists yet. Never a live CTA. */
  | "pending"
  /** Permanently closed; retained as history. */
  | "sealed";

export type ProtocolActionTarget =
  | { type: "route"; value: string }
  | { type: "modal"; value: string }
  | { type: "external"; value: string }
  | null;

export interface ProtocolAction {
  id: ProtocolActionId;
  label: string;
  kind: ProtocolActionKind;
  status: ProtocolActionStatus;
  /** Needs a connected wallet to proceed. */
  requiresWallet: boolean;
  /** Needs the wallet to be on Avalanche C-Chain (43114). */
  requiresAvalanche: boolean;
  /** Spends USDC. */
  requiresUsdc: boolean;
  /** Needs native AVAX for gas. */
  requiresAvaxGas: boolean;
  /** Where the action lives (route / modal / external), or null. */
  target: ProtocolActionTarget;
  /** Where to send the user after success, or null when it stays in place. */
  successDestination: string | null;
  /** Reserved: a future per-action eligibility resolver. Not wired yet. */
  eligibilityHook?: null;
  /** Optional clarifier. Never an assertion of current on-chain value. */
  note?: string;
}

export const PROTOCOL_ACTIONS: Record<ProtocolActionId, ProtocolAction> = {
  joinMembership: {
    id: "joinMembership",
    label: "Join The Syndicate",
    kind: "membership",
    status: "live-unaudited",
    requiresWallet: true,
    requiresAvalanche: true,
    requiresUsdc: true,
    requiresAvaxGas: true,
    target: { type: "route", value: "/join" },
    successDestination: "/my-syndicate",
    note: "Sale V2 membership purchase — live but unaudited / early.",
  },
  mintFirstSignal: {
    id: "mintFirstSignal",
    label: "Mint The First Signal",
    kind: "mint",
    status: "live",
    requiresWallet: true,
    requiresAvalanche: true,
    requiresUsdc: true,
    requiresAvaxGas: true,
    target: { type: "route", value: "/nft" },
    successDestination: null,
    note: "Archive1155 ID 1 — collectible record only, no financial rights.",
  },
  mintPatronSeal: {
    id: "mintPatronSeal",
    label: "Mint the Patron Seal",
    kind: "mint",
    status: "preview",
    requiresWallet: true,
    requiresAvalanche: true,
    requiresUsdc: true,
    requiresAvaxGas: true,
    target: { type: "route", value: "/nft" },
    successDestination: null,
    note: "Archive1155 ID 3 — renders only while the artifact reads on-chain active.",
  },
  verifyProtocol: {
    id: "verifyProtocol",
    label: "Verify the protocol",
    kind: "verify",
    status: "live",
    requiresWallet: false,
    requiresAvalanche: false,
    requiresUsdc: false,
    requiresAvaxGas: false,
    target: { type: "route", value: "/transparency" },
    successDestination: null,
    note: "Read-only. Don't trust, verify.",
  },
  tradeSyn: {
    id: "tradeSyn",
    label: "Trade SYN",
    kind: "trade",
    status: "live",
    requiresWallet: false,
    requiresAvalanche: false,
    requiresUsdc: false,
    requiresAvaxGas: false,
    target: { type: "route", value: "/token" },
    successDestination: null,
    note: "SYN/USDC trades on the external Trader Joe v1 pair.",
  },
  addLiquidity: {
    id: "addLiquidity",
    label: "Add liquidity",
    kind: "liquidity",
    status: "live",
    requiresWallet: false,
    requiresAvalanche: false,
    requiresUsdc: false,
    requiresAvaxGas: false,
    target: { type: "route", value: "/liquidity" },
    successDestination: null,
    note: "Liquidity is provided on the external Trader Joe v1 pair.",
  },
  openMySyndicate: {
    id: "openMySyndicate",
    label: "Open My Syndicate",
    kind: "navigate",
    status: "live",
    requiresWallet: false,
    requiresAvalanche: false,
    requiresUsdc: false,
    requiresAvaxGas: false,
    target: { type: "route", value: "/my-syndicate" },
    successDestination: null,
  },

  // ── Future placeholders — PENDING. Never render as live CTAs. ──
  claimEscrowedCommission: {
    id: "claimEscrowedCommission",
    label: "Claim escrowed commission",
    kind: "claim",
    status: "pending",
    requiresWallet: true,
    requiresAvalanche: true,
    requiresUsdc: false,
    requiresAvaxGas: true,
    target: null,
    successDestination: null,
    note: "Pending — CommissionRouter is unset; referral is not active.",
  },
  claimCampaignReward: {
    id: "claimCampaignReward",
    label: "Claim campaign reward",
    kind: "claim",
    status: "pending",
    requiresWallet: true,
    requiresAvalanche: true,
    requiresUsdc: false,
    requiresAvaxGas: true,
    target: null,
    successDestination: null,
    note: "Pending — no campaign contract exists yet.",
  },
  claimMerchEligibility: {
    id: "claimMerchEligibility",
    label: "Check merch eligibility",
    kind: "claim",
    status: "pending",
    requiresWallet: true,
    requiresAvalanche: false,
    requiresUsdc: false,
    requiresAvaxGas: false,
    target: null,
    successDestination: null,
    note: "Pending — no merch eligibility surface exists yet.",
  },
  mintSeatRecord721: {
    id: "mintSeatRecord721",
    label: "Mint Seat Record",
    kind: "mint",
    status: "pending",
    requiresWallet: true,
    requiresAvalanche: true,
    requiresUsdc: false,
    requiresAvaxGas: true,
    target: null,
    successDestination: null,
    note: "Pending — SeatRecord721 is not deployed; must mint from the Holder Index.",
  },
  marketplaceAction: {
    id: "marketplaceAction",
    label: "Marketplace",
    kind: "marketplace",
    status: "pending",
    requiresWallet: true,
    requiresAvalanche: true,
    requiresUsdc: false,
    requiresAvaxGas: true,
    target: null,
    successDestination: null,
    note: "Pending — no marketplace exists; Archive1155 is artifacts-only.",
  },
};

/** Statuses that may surface as usable CTAs today. */
const LIVE_STATUSES: readonly ProtocolActionStatus[] = [
  "live",
  "live-unaudited",
  "preview",
];

export function getProtocolAction(id: ProtocolActionId): ProtocolAction {
  return PROTOCOL_ACTIONS[id];
}

/** Actions that are implemented today (live / live-unaudited / preview). */
export function getLiveProtocolActions(): ProtocolAction[] {
  return Object.values(PROTOCOL_ACTIONS).filter((a) =>
    LIVE_STATUSES.includes(a.status),
  );
}

/** Planned actions that MUST NOT be rendered as live CTAs. */
export function getPendingProtocolActions(): ProtocolAction[] {
  return Object.values(PROTOCOL_ACTIONS).filter((a) => a.status === "pending");
}

export function isLiveProtocolAction(id: ProtocolActionId): boolean {
  return LIVE_STATUSES.includes(PROTOCOL_ACTIONS[id].status);
}
