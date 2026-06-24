import { describe, expect, it } from "vitest";

import {
  ZERO_SOURCE_ID,
  buildSourcePolicySnapshotFromLifecycleEvents,
  type SourcePolicyLifecycleEvent,
  type SourcePolicyRecord,
} from "../source-policy-observability";
import {
  SOURCE_REGISTRY_ACTIVITY_READ_MODEL_BOUNDARY,
  SOURCE_REGISTRY_LIFECYCLE_VISIBILITY,
  projectSourceRegistryLifecycleFact,
  projectSourceRegistryLifecycleFacts,
  summarizeSourceRegistryLifecycleEvents,
} from "../source-registry-lifecycle";

const SOURCE_ID = `0x${"8".repeat(64)}`;
const SOURCE_WALLET = "0x244531C571966f90f4849e03a507543d90f9C721";
const PAYOUT_WALLET = SOURCE_WALLET;
const METADATA_HASH = `0x${"1".repeat(64)}`;

const pausedRecord: SourcePolicyRecord = {
  sourceId: SOURCE_ID,
  sourceWallet: SOURCE_WALLET,
  sourceClass: "BUILDER_SOURCE",
  status: "PAUSED",
  commissionBps: 500,
  scope: "WINDOWED",
  payoutWallet: PAYOUT_WALLET,
  metadataHash: METADATA_HASH,
};

describe("SourceRegistry lifecycle read model", () => {
  it("projects SourceCreated as a proof fact, not referral activation", () => {
    const fact = projectSourceRegistryLifecycleFact({
      type: "SOURCE_CREATED",
      record: pausedRecord,
    });

    expect(fact).toMatchObject({
      eventName: "SourceCreated",
      sourceId: SOURCE_ID,
      status: "PAUSED",
      title: "Source policy record created",
    });
    expect(fact.productMeaning).toContain("cannot route commission");
    expect(fact.activationBoundary).toContain("not referral activation");
    expect(fact.activationBoundary).toContain("not a claim surface");
    expect(fact.proofFields).toEqual(
      expect.arrayContaining([
        `sourceId ${SOURCE_ID}`,
        `sourceClass BUILDER_SOURCE`,
        `status PAUSED`,
        `commissionBps 500`,
        `metadataHash ${METADATA_HASH}`,
      ]),
    );
  });

  it("reduces PAUSED to ACTIVE to REVOKED lifecycle without opening public source paths", () => {
    const events: SourcePolicyLifecycleEvent[] = [
      { type: "SOURCE_CREATED", record: pausedRecord },
      { type: "SOURCE_STATUS_CHANGED", sourceId: SOURCE_ID, status: "ACTIVE" },
      { type: "SOURCE_STATUS_CHANGED", sourceId: SOURCE_ID, status: "REVOKED" },
    ];

    const facts = projectSourceRegistryLifecycleFacts(events);
    const summary = summarizeSourceRegistryLifecycleEvents(events);
    const snapshot = buildSourcePolicySnapshotFromLifecycleEvents(events);

    expect(facts.map((fact) => fact.eventName)).toEqual([
      "SourceCreated",
      "SourceStatusChanged",
      "SourceStatusChanged",
    ]);
    expect(facts[1].activationBoundary).toContain("ACTIVE is necessary but not sufficient");
    expect(summary).toMatchObject({
      factCount: 3,
      sourceRecordCount: 1,
      activeCount: 0,
      pausedCount: 0,
      revokedCount: 1,
      referralActive: false,
      claimingActive: false,
      publicSourceAwareBuyPathActive: false,
      defaultBuySourceId: ZERO_SOURCE_ID,
    });
    expect(snapshot.records[0].status).toBe("REVOKED");
    expect(snapshot.referralActive).toBe(false);
    expect(snapshot.claimingActive).toBe(false);
    expect(snapshot.publicSourceAwareBuyPathActive).toBe(false);
  });

  it("models terms, source-wallet, and payout-wallet updates as readback facts", () => {
    const updatedRecord: SourcePolicyRecord = {
      ...pausedRecord,
      commissionBps: 250,
      scope: "CAPPED",
      payoutWallet: "0x3333333333333333333333333333333333333333",
    };
    const events: SourcePolicyLifecycleEvent[] = [
      { type: "SOURCE_CREATED", record: pausedRecord },
      { type: "SOURCE_TERMS_UPDATED", record: updatedRecord },
      {
        type: "SOURCE_WALLET_UPDATED",
        sourceId: SOURCE_ID,
        sourceWallet: "0x4444444444444444444444444444444444444444",
      },
      {
        type: "SOURCE_PAYOUT_WALLET_UPDATED",
        sourceId: SOURCE_ID,
        payoutWallet: "0x5555555555555555555555555555555555555555",
      },
    ];

    const facts = projectSourceRegistryLifecycleFacts(events);
    const snapshot = buildSourcePolicySnapshotFromLifecycleEvents(events);

    expect(facts.map((fact) => fact.eventName)).toEqual([
      "SourceCreated",
      "SourceTermsUpdated",
      "SourceWalletUpdated",
      "SourcePayoutWalletUpdated",
    ]);
    expect(snapshot.records[0]).toMatchObject({
      commissionBps: 250,
      scope: "CAPPED",
      sourceWallet: "0x4444444444444444444444444444444444444444",
      payoutWallet: "0x5555555555555555555555555555555555555555",
      status: "PAUSED",
    });
    expect(facts[1].activationBoundary).toContain("does not create public source-aware buys");
    expect(facts[3].activationBoundary).toContain("does not create a claim balance");
  });

  it("defines complete SourceRegistry event visibility without fake-live language", () => {
    expect(SOURCE_REGISTRY_LIFECYCLE_VISIBILITY.map((event) => event.eventName)).toEqual([
      "SourceCreated",
      "SourceTermsUpdated",
      "SourceStatusChanged",
      "SourceWalletUpdated",
      "SourcePayoutWalletUpdated",
    ]);

    const lifecycleCopy = [
      SOURCE_REGISTRY_ACTIVITY_READ_MODEL_BOUNDARY.currentTruth,
      SOURCE_REGISTRY_ACTIVITY_READ_MODEL_BOUNDARY.futureRequirement,
      SOURCE_REGISTRY_ACTIVITY_READ_MODEL_BOUNDARY.publicDefaultBoundary,
      ...SOURCE_REGISTRY_LIFECYCLE_VISIBILITY.flatMap((event) => [
        event.eventName,
        event.proofMeaning,
        event.notProofOf,
        event.primarySurfaces.join(" "),
      ]),
    ].join("\n");

    expect(lifecycleCopy).toContain("SourceRegistry lifecycle events are read-only proof facts");
    expect(lifecycleCopy).toContain("Public/default buys remain");
    expect(lifecycleCopy).toContain(ZERO_SOURCE_ID);
    expect(lifecycleCopy).toContain("Referral");
    expect(lifecycleCopy).toContain("Activity");
    expect(lifecycleCopy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(lifecycleCopy).not.toMatch(/passive income|downline|upline|\bROI\b|top earner|leaderboard/i);
  });
});
