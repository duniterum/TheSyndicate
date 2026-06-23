import {
  MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS,
  SALE_V3_FRONTEND_BUY_TARGET,
  SOURCE_REGISTRY_V1_CONTRACT_ADDRESS,
  SOURCE_REGISTRY_V1_READBACK_BLOCK,
  explorerUrlForAddress,
  isLiveAddress,
} from "./syndicate-config";

export const ZERO_SOURCE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

export type SourcePolicyStatus = "NONE" | "ACTIVE" | "PAUSED" | "REVOKED";
export type SourcePolicyClass =
  | "MEMBER_INTRODUCTION"
  | "BUILDER_SOURCE"
  | "AFFILIATE"
  | "BD_NETWORK"
  | "WHITELABEL"
  | "SPONSORSHIP"
  | "TREASURY_DEAL";
export type SourcePolicyScope = "FIRST_PURCHASE" | "WINDOWED" | "CAPPED" | "LIFETIME" | "CUSTOM";

export type SourcePolicyRecord = {
  sourceId: string;
  sourceWallet: string;
  sourceClass: SourcePolicyClass;
  status: SourcePolicyStatus;
  commissionBps: number;
  scope: SourcePolicyScope;
  payoutWallet: string;
  metadataHash: string;
};

export type SourceProductAwareness =
  | "SOURCE_AWARE_TECHNICAL"
  | "NOT_SOURCE_AWARE"
  | "FUTURE_DESIGN_REQUIRED";

export type SourcePolicyProductCapability = {
  product: string;
  status: SourceProductAwareness;
  currentTruth: string;
  futureRequirement: string;
};

export type SourcePolicySnapshot = {
  registryExists: boolean;
  registryAddress: string | null;
  registryExplorerHref: string | null;
  readbackBlock: bigint | null;
  recordCount: number;
  activeCount: number;
  pausedCount: number;
  revokedCount: number;
  records: readonly SourcePolicyRecord[];
  referralActive: boolean;
  claimingActive: boolean;
  sourceAttributionActive: boolean;
  publicSourceAwareBuyPathActive: boolean;
  defaultBuySourceId: typeof ZERO_SOURCE_ID;
  membershipSaleV3SupportsSourceAttribution: boolean;
  currentSummary: string;
  currentLimits: readonly string[];
  productCapabilities: readonly SourcePolicyProductCapability[];
};

export type SourcePolicyLifecycleEvent =
  | { type: "SOURCE_CREATED"; record: SourcePolicyRecord }
  | { type: "SOURCE_STATUS_CHANGED"; sourceId: string; status: Exclude<SourcePolicyStatus, "NONE"> }
  | { type: "SOURCE_WALLET_UPDATED"; sourceId: string; sourceWallet: string }
  | { type: "SOURCE_PAYOUT_WALLET_UPDATED"; sourceId: string; payoutWallet: string };

// Current protocol truth from deployed SourceRegistryV1 readback. Intentionally
// empty until a real SourceCreated event is emitted and read back.
export const CURRENT_SOURCE_POLICY_RECORDS: readonly SourcePolicyRecord[] = [];

export const SOURCE_POLICY_PRODUCT_CAPABILITIES: readonly SourcePolicyProductCapability[] = [
  {
    product: "MembershipSaleV3",
    status: "SOURCE_AWARE_TECHNICAL",
    currentTruth:
      "The contract supports sourceId, acquisition cost, attribution scope, and receipt fields. Public/default buys pass ZERO_SOURCE_ID.",
    futureRequirement:
      "A source record must be created, read back, activated, and wired into an approved source-aware buy path.",
  },
  {
    product: "Archive1155",
    status: "NOT_SOURCE_AWARE",
    currentTruth: "Archive memory mints do not read SourceRegistryV1 and are not source-attributed.",
    futureRequirement:
      "Any archive commerce attribution requires a separate approved source-aware wrapper, router, or future archive design.",
  },
  {
    product: "SeatRecord721",
    status: "FUTURE_DESIGN_REQUIRED",
    currentTruth: "SeatRecord721 is not deployed and cannot carry source policy today.",
    futureRequirement:
      "Identity and source attribution must remain separate from financial rights before any future identity record uses source context.",
  },
  {
    product: "SwapRail",
    status: "FUTURE_DESIGN_REQUIRED",
    currentTruth: "SwapRail is not implemented and does not inherit MembershipSaleV3 source logic.",
    futureRequirement:
      "A separate source-aware swap/commerce module review is required before any source terms affect swaps.",
  },
  {
    product: "ProductSaleRouter / premium products",
    status: "FUTURE_DESIGN_REQUIRED",
    currentTruth: "No product-sale router is live. No premium product revenue is source-attributed.",
    futureRequirement:
      "Every product module must declare source eligibility, receipt fields, caps, and disclosure before launch.",
  },
];

export const SOURCE_POLICY_LIFECYCLE_MODEL = [
  {
    status: "PAUSED",
    label: "Created, not usable",
    meaning: "A source record exists for inspection, but cannot route commission until a separate activation action.",
  },
  {
    status: "ACTIVE",
    label: "Usable by approved source-aware paths",
    meaning:
      "A source record can affect a source-aware purchase only when the product path explicitly passes that sourceId.",
  },
  {
    status: "REVOKED",
    label: "Permanently blocked",
    meaning: "No new source attribution should be created. Historical receipts remain readable.",
  },
] as const;

const countStatus = (records: readonly SourcePolicyRecord[], status: SourcePolicyStatus) =>
  records.filter((record) => record.status === status).length;

export function buildSourcePolicySnapshot(
  records: readonly SourcePolicyRecord[] = CURRENT_SOURCE_POLICY_RECORDS,
): SourcePolicySnapshot {
  const registryExists =
    SOURCE_REGISTRY_V1_CONTRACT_ADDRESS !== null &&
    isLiveAddress(SOURCE_REGISTRY_V1_CONTRACT_ADDRESS);
  const recordCount = records.length;
  const activeCount = countStatus(records, "ACTIVE");
  const pausedCount = countStatus(records, "PAUSED");
  const revokedCount = countStatus(records, "REVOKED");
  const sourceAttributionActive = activeCount > 0;

  return {
    registryExists,
    registryAddress: SOURCE_REGISTRY_V1_CONTRACT_ADDRESS,
    registryExplorerHref: explorerUrlForAddress(SOURCE_REGISTRY_V1_CONTRACT_ADDRESS ?? ""),
    readbackBlock: SOURCE_REGISTRY_V1_READBACK_BLOCK,
    recordCount,
    activeCount,
    pausedCount,
    revokedCount,
    records,
    referralActive: false,
    claimingActive: false,
    sourceAttributionActive,
    publicSourceAwareBuyPathActive: false,
    defaultBuySourceId: ZERO_SOURCE_ID,
    membershipSaleV3SupportsSourceAttribution:
      SALE_V3_FRONTEND_BUY_TARGET &&
      MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS !== null &&
      isLiveAddress(MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS),
    currentSummary:
      recordCount === 0
        ? "SourceRegistryV1 exists and has zero source records. Referral, claiming, and public source-aware purchases are inactive."
        : `SourceRegistryV1 has ${recordCount} source record${recordCount === 1 ? "" : "s"}: ${activeCount} active, ${pausedCount} paused, ${revokedCount} revoked.`,
    currentLimits: [
      "No source record has been created.",
      "No referral/source commission is accruing.",
      "No source claim UI is live.",
      "No public source-aware purchase path is live.",
      "Public/default MembershipSaleV3 buys use ZERO_SOURCE_ID.",
    ],
    productCapabilities: SOURCE_POLICY_PRODUCT_CAPABILITIES,
  };
}

export const CURRENT_SOURCE_POLICY_SNAPSHOT = buildSourcePolicySnapshot();

export function buildSourcePolicySnapshotFromLifecycleEvents(
  events: readonly SourcePolicyLifecycleEvent[],
): SourcePolicySnapshot {
  const byId = new Map<string, SourcePolicyRecord>();
  for (const event of events) {
    switch (event.type) {
      case "SOURCE_CREATED":
        byId.set(event.record.sourceId, event.record);
        break;
      case "SOURCE_STATUS_CHANGED": {
        const record = byId.get(event.sourceId);
        if (record) byId.set(event.sourceId, { ...record, status: event.status });
        break;
      }
      case "SOURCE_WALLET_UPDATED": {
        const record = byId.get(event.sourceId);
        if (record) byId.set(event.sourceId, { ...record, sourceWallet: event.sourceWallet });
        break;
      }
      case "SOURCE_PAYOUT_WALLET_UPDATED": {
        const record = byId.get(event.sourceId);
        if (record) byId.set(event.sourceId, { ...record, payoutWallet: event.payoutWallet });
        break;
      }
    }
  }
  return buildSourcePolicySnapshot([...byId.values()]);
}
