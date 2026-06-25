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
  startTime?: number;
  endTime?: number;
  grossCap?: number;
  perBuyerCap?: number;
  appliesToRepeatPurchases?: boolean;
  payoutWallet: string;
  metadataHash: string;
  sourceCreatedTxHash?: string;
  sourceCreatedBlock?: number;
  sourceCreatedAt?: string;
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

export type SourceAttributionReadinessGate = {
  label: string;
  currentStatus: "RECORDED" | "MISSING" | "LOCKED" | "FUTURE_APPROVAL";
  requirement: string;
};

export type SourceAttributedReceiptProofField = {
  label: string;
  proof: string;
};

export type SourceAttributionTouchpointStatus =
  | "CURRENT_GUARD"
  | "FUTURE_GATED"
  | "NOT_SOURCE_AWARE";

export type SourceAttributionTouchpoint = {
  surface: string;
  status: SourceAttributionTouchpointStatus;
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
  | { type: "SOURCE_TERMS_UPDATED"; record: SourcePolicyRecord }
  | { type: "SOURCE_STATUS_CHANGED"; sourceId: string; status: Exclude<SourcePolicyStatus, "NONE"> }
  | { type: "SOURCE_WALLET_UPDATED"; sourceId: string; sourceWallet: string }
  | { type: "SOURCE_PAYOUT_WALLET_UPDATED"; sourceId: string; payoutWallet: string };

export const INTERNAL_PROTOCOL_TEST_SOURCE_001: SourcePolicyRecord = {
  sourceId: "0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620",
  sourceWallet: "0x244531C571966f90f4849e03a507543d90f9C721",
  sourceClass: "BUILDER_SOURCE",
  status: "PAUSED",
  commissionBps: 500,
  scope: "WINDOWED",
  startTime: 1782907200,
  endTime: 1784116800,
  grossCap: 25000000,
  perBuyerCap: 5000000,
  appliesToRepeatPurchases: false,
  payoutWallet: "0x244531C571966f90f4849e03a507543d90f9C721",
  metadataHash: "0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d",
  sourceCreatedTxHash: "0xf72d3c0ad6445f407382508985fc01c8d458186a410701ae40308a9d5f7a5280",
  sourceCreatedBlock: 88705814,
  sourceCreatedAt: "2026-06-24T09:11:50.000Z",
} as const;

// Current protocol truth from deployed SourceRegistryV1 readback. The first
// internal protocol-test source exists as PAUSED policy state only: it is not
// referral activation, not a public source link, and not a claim surface.
export const CURRENT_SOURCE_POLICY_RECORDS: readonly SourcePolicyRecord[] = [
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
];

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

export const SOURCE_ATTRIBUTION_READINESS_GATES: readonly SourceAttributionReadinessGate[] = [
  {
    label: "Source policy fact",
    currentStatus: "RECORDED",
    requirement:
      "One internal PAUSED SourceCreated event exists and matches the approved packet. It remains unusable until a separate activation ceremony.",
  },
  {
    label: "Activation ceremony",
    currentStatus: "LOCKED",
    requirement:
      "A source starts PAUSED and remains unusable until a separate approved status change makes it ACTIVE.",
  },
  {
    label: "Source-aware buy path",
    currentStatus: "LOCKED",
    requirement:
      "Public/default buys keep using ZERO_SOURCE_ID until a separately approved path passes a specific non-zero sourceId.",
  },
  {
    label: "Receipt and read model",
    currentStatus: "FUTURE_APPROVAL",
    requirement:
      "Activity, Register, My Syndicate, and receipt views must show source truth from events, not browser memory or private spreadsheets.",
  },
  {
    label: "Claim boundary",
    currentStatus: "LOCKED",
    requirement:
      "No claim UI appears unless escrow state, legal copy, tax/accounting posture, and source readbacks are approved.",
  },
] as const;

export const SOURCE_ATTRIBUTED_RECEIPT_PROOF_FIELDS: readonly SourceAttributedReceiptProofField[] = [
  {
    label: "sourceId",
    proof: "The exact source policy identifier used by the purchase, or ZERO_SOURCE_ID for public/default buys.",
  },
  {
    label: "source class and status",
    proof: "The SourceRegistry class and ACTIVE/PAUSED/REVOKED state read at the time the purchase is evaluated.",
  },
  {
    label: "commission bps and caps",
    proof: "The money terms that determined acquisition commission, gross cap, per-buyer cap, and repeat-purchase eligibility.",
  },
  {
    label: "acquisition commission",
    proof: "The USDC routed to the source payout wallet, or escrowed only if direct payout fails.",
  },
  {
    label: "Net USDC Routed",
    proof: "Gross USDC minus acquisition commission, then split to Vault, Liquidity, and Operations.",
  },
  {
    label: "membership receipt",
    proof: "Buyer, recipient, SYN delivered, era, chapter, first-seat status, member number, and transaction proof.",
  },
] as const;

export const SOURCE_ATTRIBUTION_TOUCHPOINTS: readonly SourceAttributionTouchpoint[] = [
  {
    surface: "Join",
    status: "CURRENT_GUARD",
    currentTruth: "Public/default buys use ZERO_SOURCE_ID and do not expose a source selector or source link.",
    futureRequirement:
      "A source-aware purchase path must show source terms before wallet signature and pass a specific non-zero sourceId only after approval.",
  },
  {
    surface: "Registry",
    status: "CURRENT_GUARD",
    currentTruth:
      "SourceRegistryV1 is deployed and verifiable with one internal PAUSED protocol-test source record.",
    futureRequirement:
      "Source records must appear as policy facts with status, terms, metadata hash, and explorer proof; never as proof that referral is broadly live.",
  },
  {
    surface: "Activity",
    status: "FUTURE_GATED",
    currentTruth: "No source policy or source-attributed purchase activity is live in the public feed.",
    futureRequirement:
      "SourceCreated, SourceStatusChanged, payout-wallet changes, and source-attributed purchase receipts must appear as verifiable events.",
  },
  {
    surface: "My Syndicate",
    status: "FUTURE_GATED",
    currentTruth: "The member cockpit shows pending source readiness only; no share link, source balance, or claim UI is displayed.",
    futureRequirement:
      "A member view may show source-linked receipts and source state only from indexed events and current SourceRegistry readbacks.",
  },
  {
    surface: "Transparency / Protocol Economy",
    status: "FUTURE_GATED",
    currentTruth: "The economy surfaces show referral inactive and public/default ZERO_SOURCE_ID routing.",
    futureRequirement:
      "Future source-attributed receipts must separate gross USDC, acquisition commission, Net USDC Routed, and 70/20/10 routing.",
  },
  {
    surface: "Register / Chronicle",
    status: "FUTURE_GATED",
    currentTruth: "No source-policy facts or source-attributed milestones are registered as institutional memory today.",
    futureRequirement:
      "Only meaningful source-policy events should enter Register or Chronicle; routine attribution events remain Activity/read-model facts.",
  },
  {
    surface: "Archive / future products",
    status: "NOT_SOURCE_AWARE",
    currentTruth: "Archive1155, SeatRecord721, SwapRail, and ProductSaleRouter do not inherit MembershipSaleV3 source terms.",
    futureRequirement:
      "Each future product needs its own source-aware design, disclosure, receipt schema, and activation gate before using source terms.",
  },
] as const;

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
  const currentLimits =
    recordCount === 0
      ? [
          "No source record has been created.",
          "No referral/source commission is accruing.",
          "No source claim UI is live.",
          "No public source-aware purchase path is live.",
          "Public/default MembershipSaleV3 buys use ZERO_SOURCE_ID.",
        ]
      : [
          "One internal PAUSED source record exists as a policy fact, not as public referral activation.",
          "No active source record can route commission today.",
          "No source claim UI is live.",
          "No public source-aware purchase path is live.",
          "Public/default MembershipSaleV3 buys use ZERO_SOURCE_ID.",
          "Source records must remain status-aware: PAUSED cannot route commission; REVOKED cannot create new attribution.",
        ];

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
        : `SourceRegistryV1 has ${recordCount} source record${recordCount === 1 ? "" : "s"}: ${activeCount} active, ${pausedCount} paused, ${revokedCount} revoked. Public/default buys remain ZERO_SOURCE_ID.`,
    currentLimits,
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
      case "SOURCE_TERMS_UPDATED":
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
