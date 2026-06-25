import { INTERNAL_PROTOCOL_TEST_SOURCE_001, type SourcePolicyRecord } from "./source-policy-observability";

export const REAL_CONDITION_SOURCE_TEST_TERMS: SourcePolicyRecord = {
  ...INTERNAL_PROTOCOL_TEST_SOURCE_001,
  status: "ACTIVE",
  startTime: 1782388800,
  endTime: 1783598400,
  metadataHash: "0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681",
};

export const REAL_CONDITION_SOURCE_TEST_PACKET = {
  packetId: "SOURCE_PACKET_INTERNAL_TEST_001_TERMS_UPDATE_2026_06_25",
  sourceLabel: "INTERNAL_PROTOCOL_TEST_SOURCE_001",
  sourceId: REAL_CONDITION_SOURCE_TEST_TERMS.sourceId,
  testUsdc: 5,
  startTimeUtc: "2026-06-25T12:00:00Z",
  endTimeUtc: "2026-07-09T12:00:00Z",
  metadataArtifact:
    "docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_TERMS_UPDATE_2026_06_25_METADATA.json",
  metadataHash: REAL_CONDITION_SOURCE_TEST_TERMS.metadataHash,
  intendedUse:
    "single controlled real-condition $5 source-attributed MembershipSaleV3 test, followed by re-pause",
  requiredStatusBeforeBuy: "ACTIVE",
  publicDefaultSourceId: "ZERO_SOURCE_ID",
} as const;

export function sourceRecordMatchesRealConditionTestTerms(record: SourcePolicyRecord): boolean {
  return (
    record.sourceId.toLowerCase() === REAL_CONDITION_SOURCE_TEST_TERMS.sourceId.toLowerCase() &&
    record.sourceWallet.toLowerCase() === REAL_CONDITION_SOURCE_TEST_TERMS.sourceWallet.toLowerCase() &&
    record.payoutWallet.toLowerCase() === REAL_CONDITION_SOURCE_TEST_TERMS.payoutWallet.toLowerCase() &&
    record.sourceClass === REAL_CONDITION_SOURCE_TEST_TERMS.sourceClass &&
    record.commissionBps === REAL_CONDITION_SOURCE_TEST_TERMS.commissionBps &&
    record.scope === REAL_CONDITION_SOURCE_TEST_TERMS.scope &&
    record.startTime === REAL_CONDITION_SOURCE_TEST_TERMS.startTime &&
    record.endTime === REAL_CONDITION_SOURCE_TEST_TERMS.endTime &&
    record.grossCap === REAL_CONDITION_SOURCE_TEST_TERMS.grossCap &&
    record.perBuyerCap === REAL_CONDITION_SOURCE_TEST_TERMS.perBuyerCap &&
    record.appliesToRepeatPurchases === REAL_CONDITION_SOURCE_TEST_TERMS.appliesToRepeatPurchases &&
    record.metadataHash.toLowerCase() === REAL_CONDITION_SOURCE_TEST_TERMS.metadataHash.toLowerCase()
  );
}
