import { describe, expect, it } from "vitest";
import {
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
  type SourcePolicyRecord,
} from "../source-policy-observability";
import {
  REAL_CONDITION_SOURCE_TEST_PACKET,
  REAL_CONDITION_SOURCE_TEST_TERMS,
  sourceRecordMatchesRealConditionTestTerms,
} from "../source-real-condition-test";

describe("real-condition source attribution test packet", () => {
  it("freezes the before-July source terms without changing current PAUSED truth", () => {
    expect(INTERNAL_PROTOCOL_TEST_SOURCE_001.status).toBe("PAUSED");
    expect(INTERNAL_PROTOCOL_TEST_SOURCE_001.startTime).toBe(1782907200);
    expect(INTERNAL_PROTOCOL_TEST_SOURCE_001.metadataHash).toBe(
      "0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d",
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

  it("matches only the exact updated real-condition terms", () => {
    expect(sourceRecordMatchesRealConditionTestTerms(REAL_CONDITION_SOURCE_TEST_TERMS)).toBe(true);

    const staleWindow: SourcePolicyRecord = {
      ...REAL_CONDITION_SOURCE_TEST_TERMS,
      startTime: INTERNAL_PROTOCOL_TEST_SOURCE_001.startTime,
      endTime: INTERNAL_PROTOCOL_TEST_SOURCE_001.endTime,
    };
    expect(sourceRecordMatchesRealConditionTestTerms(staleWindow)).toBe(false);

    const staleHash: SourcePolicyRecord = {
      ...REAL_CONDITION_SOURCE_TEST_TERMS,
      metadataHash: INTERNAL_PROTOCOL_TEST_SOURCE_001.metadataHash,
    };
    expect(sourceRecordMatchesRealConditionTestTerms(staleHash)).toBe(false);
  });
});
