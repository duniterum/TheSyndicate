import { describe, expect, it } from "vitest";
import {
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
  type SourcePolicyRecord,
} from "../source-policy-observability";
import {
  REAL_CONDITION_SOURCE_TEST_COMPLETION,
  REAL_CONDITION_SOURCE_TEST_PACKET,
  REAL_CONDITION_SOURCE_TEST_TERMS,
  sourceRecordMatchesRealConditionTestTerms,
} from "../source-real-condition-test";

describe("real-condition source attribution test packet", () => {
  it("records the before-July source terms and final PAUSED truth", () => {
    expect(INTERNAL_PROTOCOL_TEST_SOURCE_001.status).toBe("PAUSED");
    expect(INTERNAL_PROTOCOL_TEST_SOURCE_001.startTime).toBe(1782388800);
    expect(INTERNAL_PROTOCOL_TEST_SOURCE_001.endTime).toBe(1783598400);
    expect(INTERNAL_PROTOCOL_TEST_SOURCE_001.metadataHash).toBe(
      "0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681",
    );

    expect(REAL_CONDITION_SOURCE_TEST_TERMS.status).toBe("ACTIVE");
    expect(REAL_CONDITION_SOURCE_TEST_TERMS.startTime).toBe(1782388800);
    expect(REAL_CONDITION_SOURCE_TEST_TERMS.endTime).toBe(1783598400);
    expect(REAL_CONDITION_SOURCE_TEST_TERMS.metadataHash).toBe(
      "0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681",
    );
    expect(REAL_CONDITION_SOURCE_TEST_TERMS.sourceId).toBe(
      INTERNAL_PROTOCOL_TEST_SOURCE_001.sourceId,
    );
    expect(REAL_CONDITION_SOURCE_TEST_PACKET.publicDefaultSourceId).toBe("ZERO_SOURCE_ID");
    expect(ZERO_SOURCE_ID).toMatch(/^0x0{64}$/);
  });

  it("records the completed ceremony without making public referral live", () => {
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.status).toBe("COMPLETED_SOURCE_REPAUSED");
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.finalSourceStatus).toBe("PAUSED");
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.finalIsActive).toBe(false);
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.grossUsdc).toBe(5000000);
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.acquisitionCost).toBe(250000);
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.protocolContribution).toBe(4750000);
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.sourceGrossAttributed).toBe(5000000);
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.buyerGrossAttributedToSource).toBe(5000000);
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.sourceEscrowOwed).toBe(0);
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.memberNumber).toBe(10);
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.buy.hash).toBe(
      "0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46",
    );
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.rePaused.hash).toBe(
      "0x67f6498cd734b27032f0a10fe55bad57079f5b9cf38b38a85a1f95895aece71f",
    );
    expect(REAL_CONDITION_SOURCE_TEST_COMPLETION.publicBoundaries).toEqual({
      publicDefaultSourceId: "ZERO_SOURCE_ID",
      referralActive: false,
      claimUiActive: false,
      publicSourceAwareBuyPathActive: false,
    });
  });

  it("matches only the exact updated real-condition terms", () => {
    expect(sourceRecordMatchesRealConditionTestTerms(REAL_CONDITION_SOURCE_TEST_TERMS)).toBe(true);

    const staleWindow: SourcePolicyRecord = {
      ...REAL_CONDITION_SOURCE_TEST_TERMS,
      startTime: 1782907200,
      endTime: 1784116800,
    };
    expect(sourceRecordMatchesRealConditionTestTerms(staleWindow)).toBe(false);

    const staleHash: SourcePolicyRecord = {
      ...REAL_CONDITION_SOURCE_TEST_TERMS,
      metadataHash: "0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d",
    };
    expect(sourceRecordMatchesRealConditionTestTerms(staleHash)).toBe(false);
  });
});
