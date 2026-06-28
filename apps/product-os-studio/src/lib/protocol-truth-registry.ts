// THE SYNDICATE — PRODUCT OS STUDIO · CANONICAL PROTOCOL TRUTH REGISTRY (READ-ONLY)
//
// ONE canonical place that enumerates every known production-truth item the Studio surfaces —
// chain, contracts/addresses, Proof of Fire, routing/economy, membership/seat, referral/source,
// archive/memory, activity/chronicle — each tagged with its data posture, the StatusBadge label,
// its source, a confidence, and an honest note.
//
// This module is an AGGREGATION / INDEX only. It INVENTS NOTHING and DUPLICATES NOTHING:
//   - addresses / chain id / Proof of Fire / routing split come from the existing canonical
//     constants (production-constants.ts -> PRODUCTION_PROOF porting map),
//   - live values (held balances, cumulative burn, connected-wallet SYN) are `value: null` here
//     because they are read LIVE (read-only) at runtime by the existing adapters — never hardcoded,
//   - posture labels reuse the single DataPosture taxonomy (data-posture.ts) and the existing
//     StatusBadge `Status` union — there is NO parallel enum.
//
// The brief's extra status words (RECONCILED / CANDIDATE / UNKNOWN / SIMULATED_PROTOTYPE) are
// expressed through `posture` + `status` + `confidence` + `notes`, not a new badge system.

import { ROUTING_SPLIT, MOCK_DATA } from "./mock-data";
import {
  AVALANCHE,
  CANONICAL_CONTRACTS,
  PROOF_OF_FIRE,
  getCanonicalContract,
  type CanonicalContract,
  type ContractCategory,
} from "./production-constants";
import { postureStatus, type DataPosture } from "./data-posture";
import { BALANCE_HOLDER_KEYS } from "./protocol-snapshot-adapter";
import type { Status } from "@/components/ui/status-badge";

// Re-export the canonical sources so this registry is the single reference surface a page can
// import from. These are the SAME bindings — no copy, no divergence.
export { CANONICAL_CONTRACTS, getCanonicalContract, PROOF_OF_FIRE, AVALANCHE };
export type { CanonicalContract, ContractCategory };

export type TruthGroup =
  | "chain"
  | "contracts"
  | "proof-of-fire"
  | "routing-economy"
  | "membership-seat"
  | "referral-source"
  | "archive-memory"
  | "activity-chronicle";

/** Where a value's truth comes from. */
export type TruthSource =
  | "production-porting-map" // canonical constant copied verbatim from the porting map
  | "on-chain-live-read" // read live (read-only) at runtime via an existing adapter / the user's wallet
  | "snowtrace" // verifiable on the canonical explorer
  | "studio-prototype" // a demonstration value in the Studio — not production truth
  | "adapter-seam"; // real behaviour intentionally deferred to a future Codex adapter

/** How sure we are of the value AS SHOWN (nuance the posture alone can't carry). */
export type TruthConfidence =
  | "verified" // verified production fact (e.g. a confirmed tx)
  | "reconciled" // live read reconciled against an authoritative on-chain total
  | "live-read" // a live, read-only value at runtime
  | "static-proof" // a static canonical reference (address / chain id / policy)
  | "adapter-required" // no real value until a Codex adapter is wired
  | "simulated" // a prototype demonstration value
  | "paused"; // deployed but inactive today

export type TruthValue =
  | string
  | number
  | boolean
  | readonly string[]
  | Record<string, unknown>
  | null;

export interface ProtocolTruthItem {
  id: string;
  group: TruthGroup;
  label: string;
  /** The production value when one exists STATICALLY. `null` when it is read live at runtime,
   *  or is intentionally absent (simulated / adapter-required). NEVER an invented number. */
  value: TruthValue;
  posture: DataPosture;
  /** The StatusBadge label — defaults to the posture's canonical label so it can never drift. */
  status: Status;
  source: TruthSource;
  confidence: TruthConfidence;
  notes?: string;
  /** Links the item to a CANONICAL_CONTRACTS key, where relevant. */
  relatedContractKey?: string;
}

/** Build an item; `status` defaults to the posture's canonical StatusBadge label (no drift). */
function item(
  partial: Omit<ProtocolTruthItem, "status"> & { status?: Status },
): ProtocolTruthItem {
  return { ...partial, status: partial.status ?? postureStatus(partial.posture) };
}

// --- chain -----------------------------------------------------------------------------------
const chainItems: ProtocolTruthItem[] = [
  item({
    id: "chain:network",
    group: "chain",
    label: "Network",
    value: AVALANCHE.name,
    posture: "READ_ONLY_PROOF",
    source: "production-porting-map",
    confidence: "static-proof",
    notes: "Avalanche C-Chain. The Studio never requests a network change.",
  }),
  item({
    id: "chain:id",
    group: "chain",
    label: "Chain ID",
    value: AVALANCHE.chainId,
    posture: "READ_ONLY_PROOF",
    source: "production-porting-map",
    confidence: "static-proof",
    notes: "43114. The live chain id is also read at runtime (eth_chainId) by the snapshot adapter.",
  }),
  item({
    id: "chain:rpc",
    group: "chain",
    label: "Read-only RPC",
    value: AVALANCHE.publicRpcUrl,
    posture: "READ_ONLY_PROOF",
    source: "production-porting-map",
    confidence: "static-proof",
    notes: "Public read-only RPC used by the provider-less snapshot adapter (eth_chainId / eth_blockNumber / eth_call only).",
  }),
  item({
    id: "chain:explorer",
    group: "chain",
    label: "Explorer",
    value: AVALANCHE.explorerUrl,
    posture: "READ_ONLY_PROOF",
    source: "snowtrace",
    confidence: "static-proof",
    notes: `${AVALANCHE.explorerName} — canonical read-only explorer for addresses and transactions.`,
  }),
];

// --- contracts / addresses -------------------------------------------------------------------
const contractPostureFor = (c: CanonicalContract): DataPosture =>
  c.status === "PAUSED" ? "NOT_LIVE" : "READ_ONLY_PROOF";

const contractItems: ProtocolTruthItem[] = CANONICAL_CONTRACTS.map((c) =>
  item({
    id: `contract:${c.key}`,
    group: "contracts",
    label: c.label,
    value: c.address,
    posture: contractPostureFor(c),
    status: c.status, // pass through the canonical StatusBadge label verbatim
    source: "production-porting-map",
    confidence: c.status === "PAUSED" ? "paused" : "static-proof",
    notes: c.note,
    relatedContractKey: c.key,
  }),
);

// --- live held balances (read-only, runtime) -------------------------------------------------
// Derived from BALANCE_HOLDER_KEYS — the exact set of holders the snapshot adapter live-reads.
// value is null: the number is read live (balanceOf + live decimals()) and never hardcoded.
const HELD_GROUP_FOR: Record<string, TruthGroup> = {
  VaultWallet: "routing-economy",
  LiquidityWallet: "routing-economy",
  OperationsWallet: "routing-economy",
  TraderJoeLpPair: "routing-economy",
  MembershipSaleV3: "membership-seat",
  MembershipSynWallet: "membership-seat",
  SynBurnAddress: "proof-of-fire",
};

const liveHeldItems: ProtocolTruthItem[] = BALANCE_HOLDER_KEYS.map((key) => {
  const c = getCanonicalContract(key);
  return item({
    id: `live-held:${key}`,
    group: HELD_GROUP_FOR[key] ?? "routing-economy",
    label: `Current held balance — ${c?.label ?? key}`,
    value: null,
    posture: "LIVE_READ",
    source: "on-chain-live-read",
    confidence: "live-read",
    notes:
      "Current on-chain held balance, read live (read-only) at runtime via the provider-less snapshot adapter. Held balance — NOT cumulative routed/sold/burned.",
    relatedContractKey: key,
  });
});

// --- proof of fire ---------------------------------------------------------------------------
const proofOfFireItems: ProtocolTruthItem[] = [
  item({
    id: "fire:proof-001-amount",
    group: "proof-of-fire",
    label: "Proof of Fire #001 — amount",
    value: PROOF_OF_FIRE.amountSyn,
    posture: "READ_ONLY_PROOF",
    source: "snowtrace",
    confidence: "verified",
    notes: `${PROOF_OF_FIRE.category}. Verified founder burn at block ${PROOF_OF_FIRE.block}; tx is read-only on the explorer.`,
    relatedContractKey: "SynBurnAddress",
  }),
  item({
    id: "fire:proof-001-tx",
    group: "proof-of-fire",
    label: "Proof of Fire #001 — transaction",
    value: PROOF_OF_FIRE.txHash,
    posture: "READ_ONLY_PROOF",
    source: "snowtrace",
    confidence: "verified",
    notes: "Canonical burn transaction. Static, read-only explorer reference.",
    relatedContractKey: "SynBurnAddress",
  }),
  item({
    id: "fire:aggregate-burned-supply",
    group: "proof-of-fire",
    label: "Aggregate burned supply",
    value: null,
    posture: "LIVE_READ",
    source: "on-chain-live-read",
    confidence: "reconciled",
    notes:
      "Live cumulative burn read at runtime by BurnProofAdapter (eth_getLogs Transfer -> burn sink), reconciled against balanceOf(burn sink). Never hardcoded; the simulated protocolStats.burnedSyn is NOT truth.",
    relatedContractKey: "SynBurnAddress",
  }),
  item({
    id: "fire:burn-categories",
    group: "proof-of-fire",
    label: "Founder / Community / Protocol burn split",
    value: null,
    posture: "PROTOTYPE",
    status: "SIMULATED PROTOTYPE",
    source: "studio-prototype",
    confidence: "simulated",
    notes:
      "On-chain category attribution of burns is NOT proven. Category cards are a labeled SIMULATED PROTOTYPE — not a live split.",
    relatedContractKey: "SynBurnAddress",
  }),
];

// --- routing / economy -----------------------------------------------------------------------
const routingEconomyItems: ProtocolTruthItem[] = [
  item({
    id: "economy:routing-split",
    group: "routing-economy",
    label: "USDC routing split",
    value: ROUTING_SPLIT,
    posture: "READ_ONLY_PROOF",
    source: "production-porting-map",
    confidence: "static-proof",
    notes: "Canonical 70% / 20% / 10% (Vault / Liquidity / Operations) USDC routing policy.",
  }),
  item({
    id: "economy:total-usdc-routed",
    group: "routing-economy",
    label: "Total / Net USDC routed",
    value: null,
    posture: "PROTOTYPE",
    status: "SIMULATED PROTOTYPE",
    source: "studio-prototype",
    confidence: "simulated",
    notes:
      "Cumulative routed total is a SIMULATED PROTOTYPE figure. A live cumulative-routed read is ADAPTER REQUIRED. Distinct from the live current-held balances above.",
  }),
];

// --- membership / seat -----------------------------------------------------------------------
const membershipSeatItems: ProtocolTruthItem[] = [
  item({
    id: "membership:connected-wallet-syn",
    group: "membership-seat",
    label: "Connected wallet SYN balance",
    value: null,
    posture: "LIVE_READ",
    source: "on-chain-live-read",
    confidence: "live-read",
    notes: "Read live (read-only) via the user's own EIP-1193 provider (wallet-adapter). No writes.",
    relatedContractKey: "SYN",
  }),
  item({
    id: "membership:member-count",
    group: "membership-seat",
    label: "Member count / seat state",
    value: null,
    posture: "ADAPTER_REQUIRED",
    source: "adapter-seam",
    confidence: "adapter-required",
    notes: "A live member count / seat state needs a Codex production adapter; the prototype count is simulated.",
    relatedContractKey: "MembershipSaleV3",
  }),
  item({
    id: "membership:demo-persona",
    group: "membership-seat",
    label: "Demo persona (member #, chapter)",
    value: { memberNumber: MOCK_DATA.memberNumber, chapter: MOCK_DATA.chapter },
    posture: "PROTOTYPE",
    status: "SIMULATED PROTOTYPE",
    source: "studio-prototype",
    confidence: "simulated",
    notes: "A demonstration persona — never the connected wallet, never a production seat.",
  }),
];

// --- referral / source -----------------------------------------------------------------------
const referralSourceItems: ProtocolTruthItem[] = [
  item({
    id: "source:policy-state",
    group: "referral-source",
    label: "Source / referral policy",
    value: MOCK_DATA.sourceStatus, // "paused"
    posture: "NOT_LIVE",
    status: "PAUSED",
    source: "production-porting-map",
    confidence: "paused",
    notes:
      "SourceRegistryV1 is deployed but PAUSED. No public source link, no claim UI, no payout, no MLM / downline / upline.",
    relatedContractKey: "SourceRegistryV1",
  }),
  item({
    id: "source:default-id",
    group: "referral-source",
    label: "Default source id",
    value: MOCK_DATA.defaultSourceId, // "ZERO_SOURCE_ID"
    posture: "READ_ONLY_PROOF",
    source: "production-porting-map",
    confidence: "static-proof",
    notes: "ZERO_SOURCE_ID — the default while source policy is paused.",
    relatedContractKey: "SourceRegistryV1",
  }),
  item({
    id: "source:claim-payout",
    group: "referral-source",
    label: "Referral claim / payout",
    value: MOCK_DATA.claimUiActive, // false
    posture: "NOT_WIRED",
    source: "adapter-seam",
    confidence: "adapter-required",
    notes: "No claim UI and no payout path are wired. Referral is not active.",
    relatedContractKey: "SourceRegistryV1",
  }),
];

// --- archive / memory ------------------------------------------------------------------------
const archiveMemoryItems: ProtocolTruthItem[] = [
  item({
    id: "archive:contract",
    group: "archive-memory",
    label: "Archive1155 — protocol memory",
    value: getCanonicalContract("Archive1155")?.address ?? null,
    posture: "READ_ONLY_PROOF",
    source: "production-porting-map",
    confidence: "static-proof",
    notes: "ERC-1155 protocol memory only — never a seat, never financial rights, not source-aware.",
    relatedContractKey: "Archive1155",
  }),
  item({
    id: "archive:mint",
    group: "archive-memory",
    label: "Archive mint / claim (First Signal, Patron Seal)",
    value: null,
    posture: "NOT_WIRED",
    source: "adapter-seam",
    confidence: "adapter-required",
    notes: "Archive editions are protocol memory concepts; live mint / claim is NOT wired. No financial rights.",
    relatedContractKey: "Archive1155",
  }),
  item({
    id: "archive:seat-record",
    group: "archive-memory",
    label: "SeatRecord",
    value: null,
    posture: "FUTURE",
    source: "adapter-seam",
    confidence: "adapter-required",
    notes: "Reserved / future — not built.",
  }),
];

// --- activity / chronicle --------------------------------------------------------------------
const activityChronicleItems: ProtocolTruthItem[] = [
  item({
    id: "activity:burn-events",
    group: "activity-chronicle",
    label: "Burn events",
    value: null,
    posture: "LIVE_READ",
    source: "on-chain-live-read",
    confidence: "live-read",
    notes: "Burn events are live in Fire via BurnProofAdapter (read-only).",
    relatedContractKey: "SynBurnAddress",
  }),
  item({
    id: "activity:propagation",
    group: "activity-chronicle",
    label: "Purchase / member activity feed",
    value: null,
    posture: "ADAPTER_REQUIRED",
    source: "adapter-seam",
    confidence: "adapter-required",
    notes:
      "Purchase / member activity propagation to the Activity feed is ADAPTER REQUIRED; simulated activity is clearly labeled.",
  }),
];

/** The single canonical enumeration of protocol truth, in presentation order by group. */
export const PROTOCOL_TRUTH_REGISTRY: readonly ProtocolTruthItem[] = [
  ...chainItems,
  ...contractItems,
  ...liveHeldItems,
  ...proofOfFireItems,
  ...routingEconomyItems,
  ...membershipSeatItems,
  ...referralSourceItems,
  ...archiveMemoryItems,
  ...activityChronicleItems,
];

export function getProtocolTruthItem(id: string): ProtocolTruthItem | undefined {
  return PROTOCOL_TRUTH_REGISTRY.find((i) => i.id === id);
}

export function truthItemsByGroup(group: TruthGroup): ProtocolTruthItem[] {
  return PROTOCOL_TRUTH_REGISTRY.filter((i) => i.group === group);
}
