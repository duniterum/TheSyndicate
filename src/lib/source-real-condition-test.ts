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

export const REAL_CONDITION_SOURCE_TEST_COMPLETION = {
  status: "COMPLETED_SOURCE_REPAUSED",
  latestAuthorityReadbackBlock: 88808111,
  sourceRegistry: "0x780013bB358be6be95b401901264FC7c22a595a6",
  membershipSaleV3: "0x2A6cFc76906e758B934209AFf5A163c9bC20132E",
  sourceId: REAL_CONDITION_SOURCE_TEST_TERMS.sourceId,
  finalSourceStatus: "PAUSED",
  finalIsActive: false,
  sourceGrossAttributed: 5000000,
  buyerGrossAttributedToSource: 5000000,
  sourceEscrowOwed: 0,
  memberCountAfterTest: 10,
  buyer: "0x620febd921E7B8d123c7DFB6731ed58fCfbcC75F",
  memberNumber: 10,
  grossUsdc: 5000000,
  acquisitionCost: 250000,
  protocolContribution: 4750000,
  vaultAmount: 3325000,
  liquidityAmount: 950000,
  operationsAmount: 475000,
  synOut: "500000000000000000000",
  receiptId: "0x7f961284a26ea0d3bb715934159e7cd758d0f8ef0a4da53c460f7c607ce39301",
  transactions: {
    termsUpdated: {
      hash: "0x898b4f142ca388543701da8e483f764d1daef4c3256d28b449aac5cf08e2784d",
      block: 88769017,
      timestamp: 1782375201,
    },
    activated: {
      hash: "0x7565d0fbe6389a7fc39da4ec0f9e69d2a82a99d42d3192e616d18fc35efc4df1",
      block: 88794252,
      timestamp: 1782406515,
    },
    buy: {
      hash: "0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46",
      block: 88806161,
      timestamp: 1782421160,
    },
    rePaused: {
      hash: "0x67f6498cd734b27032f0a10fe55bad57079f5b9cf38b38a85a1f95895aece71f",
      block: 88807390,
      timestamp: 1782422641,
    },
  },
  publicBoundaries: {
    publicDefaultSourceId: "ZERO_SOURCE_ID",
    referralActive: false,
    claimUiActive: false,
    publicSourceAwareBuyPathActive: false,
  },
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
