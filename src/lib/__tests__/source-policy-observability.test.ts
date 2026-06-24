import { describe, expect, it } from "vitest";

import {
  CURRENT_SOURCE_POLICY_SNAPSHOT,
  SOURCE_ATTRIBUTED_RECEIPT_PROOF_FIELDS,
  SOURCE_ATTRIBUTION_READINESS_GATES,
  SOURCE_ATTRIBUTION_TOUCHPOINTS,
  SOURCE_POLICY_PRODUCT_CAPABILITIES,
  ZERO_SOURCE_ID,
  buildSourcePolicySnapshot,
  buildSourcePolicySnapshotFromLifecycleEvents,
  type SourcePolicyRecord,
} from "../source-policy-observability";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("source policy observability", () => {
  it("freezes current deployed SourceRegistry truth without activating referral or claims", () => {
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.registryExists).toBe(true);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.registryAddress).toBe("0x780013bB358be6be95b401901264FC7c22a595a6");
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.readbackBlock).toBe(88511703n);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.recordCount).toBe(0);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.activeCount).toBe(0);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.pausedCount).toBe(0);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.revokedCount).toBe(0);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.referralActive).toBe(false);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.claimingActive).toBe(false);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.sourceAttributionActive).toBe(false);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.publicSourceAwareBuyPathActive).toBe(false);
    expect(CURRENT_SOURCE_POLICY_SNAPSHOT.defaultBuySourceId).toBe(ZERO_SOURCE_ID);
  });

  it("counts future source lifecycle states without changing default public activation gates", () => {
    const records: SourcePolicyRecord[] = [
      {
        sourceId: `0x${"1".repeat(64)}`,
        sourceWallet: ZERO_ADDRESS,
        sourceClass: "BUILDER_SOURCE",
        status: "PAUSED",
        commissionBps: 500,
        scope: "WINDOWED",
        payoutWallet: ZERO_ADDRESS,
        metadataHash: `0x${"2".repeat(64)}`,
      },
      {
        sourceId: `0x${"3".repeat(64)}`,
        sourceWallet: ZERO_ADDRESS,
        sourceClass: "MEMBER_INTRODUCTION",
        status: "ACTIVE",
        commissionBps: 300,
        scope: "FIRST_PURCHASE",
        payoutWallet: ZERO_ADDRESS,
        metadataHash: `0x${"0".repeat(64)}`,
      },
      {
        sourceId: `0x${"4".repeat(64)}`,
        sourceWallet: ZERO_ADDRESS,
        sourceClass: "AFFILIATE",
        status: "REVOKED",
        commissionBps: 0,
        scope: "CAPPED",
        payoutWallet: ZERO_ADDRESS,
        metadataHash: `0x${"5".repeat(64)}`,
      },
    ];

    const snapshot = buildSourcePolicySnapshot(records);

    expect(snapshot.recordCount).toBe(3);
    expect(snapshot.activeCount).toBe(1);
    expect(snapshot.pausedCount).toBe(1);
    expect(snapshot.revokedCount).toBe(1);
    expect(snapshot.sourceAttributionActive).toBe(true);
    expect(snapshot.referralActive).toBe(false);
    expect(snapshot.claimingActive).toBe(false);
    expect(snapshot.publicSourceAwareBuyPathActive).toBe(false);
  });

  it("declares product source-awareness boundaries before future modules can inherit source terms", () => {
    expect(SOURCE_POLICY_PRODUCT_CAPABILITIES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          product: "MembershipSaleV3",
          status: "SOURCE_AWARE_TECHNICAL",
        }),
        expect.objectContaining({
          product: "Archive1155",
          status: "NOT_SOURCE_AWARE",
        }),
        expect.objectContaining({
          product: "SeatRecord721",
          status: "FUTURE_DESIGN_REQUIRED",
        }),
        expect.objectContaining({
          product: "SwapRail",
          status: "FUTURE_DESIGN_REQUIRED",
        }),
      ]),
    );
  });

  it("defines activation gates and receipt proof without activating source-aware public buys", () => {
    expect(SOURCE_ATTRIBUTION_READINESS_GATES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Source policy fact", currentStatus: "MISSING" }),
        expect.objectContaining({ label: "Activation ceremony", currentStatus: "LOCKED" }),
        expect.objectContaining({ label: "Source-aware buy path", currentStatus: "LOCKED" }),
        expect.objectContaining({ label: "Receipt and read model", currentStatus: "FUTURE_APPROVAL" }),
        expect.objectContaining({ label: "Claim boundary", currentStatus: "LOCKED" }),
      ]),
    );

    expect(SOURCE_ATTRIBUTED_RECEIPT_PROOF_FIELDS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "sourceId" }),
        expect.objectContaining({ label: "commission bps and caps" }),
        expect.objectContaining({ label: "acquisition commission" }),
        expect.objectContaining({ label: "Net USDC Routed" }),
        expect.objectContaining({ label: "membership receipt" }),
      ]),
    );

    const publicCopy = [
      ...SOURCE_ATTRIBUTION_READINESS_GATES.map((gate) => `${gate.label} ${gate.requirement}`),
      ...SOURCE_ATTRIBUTED_RECEIPT_PROOF_FIELDS.map((field) => `${field.label} ${field.proof}`),
    ].join("\n");

    expect(publicCopy).toContain("ZERO_SOURCE_ID");
    expect(publicCopy).toContain("No claim UI appears");
    expect(publicCopy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(publicCopy).not.toMatch(/passive income|downline|upline|\bROI\b|top earner/i);
  });

  it("maps future source attribution across product touchpoints without making any route live", () => {
    expect(SOURCE_ATTRIBUTION_TOUCHPOINTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: "Join", status: "CURRENT_GUARD" }),
        expect.objectContaining({ surface: "Registry", status: "CURRENT_GUARD" }),
        expect.objectContaining({ surface: "Activity", status: "FUTURE_GATED" }),
        expect.objectContaining({ surface: "My Syndicate", status: "FUTURE_GATED" }),
        expect.objectContaining({ surface: "Transparency / Protocol Economy", status: "FUTURE_GATED" }),
        expect.objectContaining({ surface: "Register / Chronicle", status: "FUTURE_GATED" }),
        expect.objectContaining({ surface: "Archive / future products", status: "NOT_SOURCE_AWARE" }),
      ]),
    );

    const touchpointCopy = SOURCE_ATTRIBUTION_TOUCHPOINTS.map(
      (touchpoint) =>
        `${touchpoint.surface} ${touchpoint.status} ${touchpoint.currentTruth} ${touchpoint.futureRequirement}`,
    ).join("\n");

    expect(touchpointCopy).toContain("ZERO_SOURCE_ID");
    expect(touchpointCopy).toContain("SourceRegistryV1 is deployed and verifiable");
    expect(touchpointCopy).toContain("never as proof that referral is broadly live");
    expect(touchpointCopy).toContain("source terms");
    expect(touchpointCopy).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(touchpointCopy).not.toMatch(/passive income|downline|upline|\bROI\b|top earner/i);
  });

  it("reduces future source lifecycle events into the same observability snapshot", () => {
    const record: SourcePolicyRecord = {
      sourceId: `0x${"6".repeat(64)}`,
      sourceWallet: "0x1111111111111111111111111111111111111111",
      sourceClass: "BUILDER_SOURCE",
      status: "PAUSED",
      commissionBps: 500,
      scope: "WINDOWED",
      payoutWallet: "0x2222222222222222222222222222222222222222",
      metadataHash: `0x${"7".repeat(64)}`,
    };

    const snapshot = buildSourcePolicySnapshotFromLifecycleEvents([
      { type: "SOURCE_CREATED", record },
      {
        type: "SOURCE_WALLET_UPDATED",
        sourceId: record.sourceId,
        sourceWallet: "0x3333333333333333333333333333333333333333",
      },
      {
        type: "SOURCE_PAYOUT_WALLET_UPDATED",
        sourceId: record.sourceId,
        payoutWallet: "0x4444444444444444444444444444444444444444",
      },
      { type: "SOURCE_STATUS_CHANGED", sourceId: record.sourceId, status: "ACTIVE" },
    ]);

    expect(snapshot.recordCount).toBe(1);
    expect(snapshot.activeCount).toBe(1);
    expect(snapshot.records[0]).toMatchObject({
      sourceWallet: "0x3333333333333333333333333333333333333333",
      payoutWallet: "0x4444444444444444444444444444444444444444",
      status: "ACTIVE",
    });
  });
});
