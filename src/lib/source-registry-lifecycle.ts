import type {
  SourcePolicyLifecycleEvent,
  SourcePolicyRecord,
  SourcePolicyScope,
  SourcePolicyStatus,
} from "./source-policy-observability";
import {
  ZERO_SOURCE_ID,
  buildSourcePolicySnapshotFromLifecycleEvents,
} from "./source-policy-observability";

export type SourceRegistryEventName =
  | "SourceCreated"
  | "SourceTermsUpdated"
  | "SourceStatusChanged"
  | "SourceWalletUpdated"
  | "SourcePayoutWalletUpdated";

export type SourceRegistryLifecycleVisibility = {
  eventName: SourceRegistryEventName;
  proofMeaning: string;
  notProofOf: string;
  primarySurfaces: readonly string[];
};

export type SourceRegistryLifecycleFact = {
  eventName: SourceRegistryEventName;
  sourceId: string;
  status: SourcePolicyStatus | "UPDATED";
  title: string;
  productMeaning: string;
  activationBoundary: string;
  proofFields: readonly string[];
};

export type SourceRegistryLifecycleSummary = {
  factCount: number;
  sourceRecordCount: number;
  activeCount: number;
  pausedCount: number;
  revokedCount: number;
  referralActive: false;
  claimingActive: false;
  publicSourceAwareBuyPathActive: false;
  defaultBuySourceId: typeof ZERO_SOURCE_ID;
  boundary: string;
};

export const SOURCE_REGISTRY_LIFECYCLE_VISIBILITY: readonly SourceRegistryLifecycleVisibility[] = [
  {
    eventName: "SourceCreated",
    proofMeaning: "A source policy record exists and can be inspected against its approved packet.",
    notProofOf:
      "Referral activation, public source links, claim UI, or a public non-zero source buy path.",
    primarySurfaces: ["Registry", "Referral", "Activity"],
  },
  {
    eventName: "SourceTermsUpdated",
    proofMeaning: "A source policy record changed terms and needs a fresh readback trail.",
    notProofOf: "A new source ceremony, a payout claim, or a retroactive rewrite of old receipts.",
    primarySurfaces: ["Registry", "Activity", "Transparency"],
  },
  {
    eventName: "SourceStatusChanged",
    proofMeaning: "A source moved between PAUSED, ACTIVE, or REVOKED lifecycle states.",
    notProofOf:
      "Public referral readiness unless the product path, disclosure, and read models are separately approved.",
    primarySurfaces: ["Registry", "Referral", "Activity", "My Syndicate"],
  },
  {
    eventName: "SourceWalletUpdated",
    proofMeaning: "The source identity wallet changed and must stay historically traceable.",
    notProofOf: "A payout-wallet change, a member-ownership claim, or public source activation.",
    primarySurfaces: ["Registry", "Activity"],
  },
  {
    eventName: "SourcePayoutWalletUpdated",
    proofMeaning: "The commission payout wallet changed and must be visible before money can route.",
    notProofOf: "A claim balance, a source dashboard, or a public promise of future earnings.",
    primarySurfaces: ["Registry", "Activity", "My Syndicate"],
  },
] as const;

export const SOURCE_REGISTRY_ACTIVITY_READ_MODEL_BOUNDARY = {
  currentTruth:
    "SourceRegistry lifecycle events are read-only proof facts. They do not create a public referral system.",
  futureRequirement:
    "After a founder-approved ceremony, SourceCreated and status-change readbacks should enter Activity/Register as event facts before any source-aware public buy path exists.",
  publicDefaultBoundary: `Public/default buys remain ${ZERO_SOURCE_ID}.`,
} as const;

export function sourceScopeLabel(scope: SourcePolicyScope): string {
  return scope;
}

export function sourceStatusMeaning(status: SourcePolicyStatus): string {
  switch (status) {
    case "ACTIVE":
      return "The source is eligible only for separately approved source-aware product paths.";
    case "PAUSED":
      return "The source record exists for inspection but cannot route commission.";
    case "REVOKED":
      return "The source cannot create new attribution; historical receipts remain readable.";
    case "NONE":
      return "No source policy exists.";
  }
}

function recordProofFields(record: SourcePolicyRecord): readonly string[] {
  const fields = [
    `sourceId ${record.sourceId}`,
    `sourceWallet ${record.sourceWallet}`,
    `sourceClass ${record.sourceClass}`,
    `status ${record.status}`,
    `commissionBps ${record.commissionBps}`,
    `scope ${sourceScopeLabel(record.scope)}`,
    `payoutWallet ${record.payoutWallet}`,
    `metadataHash ${record.metadataHash}`,
  ];

  if (record.startTime !== undefined) fields.push(`startTime ${record.startTime}`);
  if (record.endTime !== undefined) fields.push(`endTime ${record.endTime}`);
  if (record.grossCap !== undefined) fields.push(`grossCap ${record.grossCap}`);
  if (record.perBuyerCap !== undefined) fields.push(`perBuyerCap ${record.perBuyerCap}`);
  if (record.appliesToRepeatPurchases !== undefined) {
    fields.push(`appliesToRepeatPurchases ${record.appliesToRepeatPurchases}`);
  }
  if (record.sourceCreatedBlock !== undefined) fields.push(`sourceCreatedBlock ${record.sourceCreatedBlock}`);
  if (record.sourceCreatedTxHash) fields.push(`sourceCreatedTxHash ${record.sourceCreatedTxHash}`);

  return fields;
}

export function projectSourceRegistryLifecycleFact(
  event: SourcePolicyLifecycleEvent,
): SourceRegistryLifecycleFact {
  switch (event.type) {
    case "SOURCE_CREATED":
      return {
        eventName: "SourceCreated",
        sourceId: event.record.sourceId,
        status: event.record.status,
        title: "Source policy record created",
        productMeaning: sourceStatusMeaning(event.record.status),
        activationBoundary:
          "Creation is a policy fact only. It is not referral activation, not a public source link, and not a claim surface.",
        proofFields: recordProofFields(event.record),
      };
    case "SOURCE_TERMS_UPDATED":
      return {
        eventName: "SourceTermsUpdated",
        sourceId: event.record.sourceId,
        status: event.record.status,
        title: "Source policy terms updated",
        productMeaning:
          "Terms changed and must be understood from the latest SourceRegistry readback before future source-aware purchases can trust them.",
        activationBoundary:
          "A terms update cannot rewrite historical receipts and does not create public source-aware buys.",
        proofFields: recordProofFields(event.record),
      };
    case "SOURCE_STATUS_CHANGED":
      return {
        eventName: "SourceStatusChanged",
        sourceId: event.sourceId,
        status: event.status,
        title: `Source status changed to ${event.status}`,
        productMeaning: sourceStatusMeaning(event.status),
        activationBoundary:
          event.status === "ACTIVE"
            ? "ACTIVE is necessary but not sufficient: public/default buys still use ZERO_SOURCE_ID until a source-aware path is separately approved."
            : "Status visibility protects historical truth without creating a live referral system.",
        proofFields: [`sourceId ${event.sourceId}`, `newStatus ${event.status}`],
      };
    case "SOURCE_WALLET_UPDATED":
      return {
        eventName: "SourceWalletUpdated",
        sourceId: event.sourceId,
        status: "UPDATED",
        title: "Source wallet updated",
        productMeaning: "The source identity wallet changed and should remain historically traceable.",
        activationBoundary:
          "Wallet recovery is not a new source, not member ownership, and not public referral activation.",
        proofFields: [`sourceId ${event.sourceId}`, `sourceWallet ${event.sourceWallet}`],
      };
    case "SOURCE_PAYOUT_WALLET_UPDATED":
      return {
        eventName: "SourcePayoutWalletUpdated",
        sourceId: event.sourceId,
        status: "UPDATED",
        title: "Source payout wallet updated",
        productMeaning:
          "The payout destination changed and must be readable before future commission movement is trusted.",
        activationBoundary:
          "A payout-wallet update does not create a claim balance, source dashboard, or public source link.",
        proofFields: [`sourceId ${event.sourceId}`, `payoutWallet ${event.payoutWallet}`],
      };
  }
}

export function projectSourceRegistryLifecycleFacts(
  events: readonly SourcePolicyLifecycleEvent[],
): readonly SourceRegistryLifecycleFact[] {
  return events.map(projectSourceRegistryLifecycleFact);
}

export function summarizeSourceRegistryLifecycleEvents(
  events: readonly SourcePolicyLifecycleEvent[],
): SourceRegistryLifecycleSummary {
  const snapshot = buildSourcePolicySnapshotFromLifecycleEvents(events);

  return {
    factCount: events.length,
    sourceRecordCount: snapshot.recordCount,
    activeCount: snapshot.activeCount,
    pausedCount: snapshot.pausedCount,
    revokedCount: snapshot.revokedCount,
    referralActive: false,
    claimingActive: false,
    publicSourceAwareBuyPathActive: false,
    defaultBuySourceId: ZERO_SOURCE_ID,
    boundary:
      "SourceRegistry lifecycle facts make source state observable. They do not activate referral, claim UI, or public non-zero sourceId purchases.",
  };
}
