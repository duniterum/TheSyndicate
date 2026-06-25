import { describe, expect, it } from "vitest";
import {
  buildSourceAwareTestModeGate,
  isLocalhostHost,
  SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG,
  SOURCE_AWARE_TEST_ALLOWED_BUYERS_FLAG,
  SOURCE_AWARE_TEST_MODE_FLAG,
  SOURCE_AWARE_TEST_QUERY_VALUE,
  SOURCE_AWARE_TEST_USDC,
  walletInAllowlist,
} from "../source-aware-test-mode";
import {
  CURRENT_SOURCE_POLICY_SNAPSHOT,
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
  type SourcePolicyRecord,
} from "../source-policy-observability";

const activeSource: SourcePolicyRecord = {
  ...INTERNAL_PROTOCOL_TEST_SOURCE_001,
  status: "ACTIVE",
};
const allowlistedBuyer = "0x1111111111111111111111111111111111111111";

describe("source-aware localhost test mode", () => {
  it("recognizes only local loopback hosts", () => {
    expect(isLocalhostHost("localhost")).toBe(true);
    expect(isLocalhostHost("127.0.0.1")).toBe(true);
    expect(isLocalhostHost("127.12.34.56")).toBe(true);
    expect(isLocalhostHost("[::1]")).toBe(true);
    expect(isLocalhostHost("thesyndicate.money")).toBe(false);
    expect(isLocalhostHost("replit.dev")).toBe(false);
  });

  it("hard-locks production unless the production-internal flag is explicitly set", () => {
    const gate = buildSourceAwareTestModeGate({
      isDev: false,
      hostname: "thesyndicate.money",
      enabledFlag: "true",
      requestedSourceTest: SOURCE_AWARE_TEST_QUERY_VALUE,
      snapshot: { ...CURRENT_SOURCE_POLICY_SNAPSHOT, records: [activeSource], activeCount: 1, pausedCount: 0 },
      target: activeSource,
    });

    expect(gate.status).toBe("LOCKED_PRODUCTION_FLAG_MISSING");
    expect(gate.canRenderInternalHarness).toBe(false);
    expect(gate.canQuoteNonZeroSourceId).toBe(false);
    expect(gate.canPrepareSourceAwareBuy).toBe(false);
    expect(gate.defaultBuySourceId).toBe(ZERO_SOURCE_ID);
    expect(gate.productionFlagName).toBe(SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG);
  });

  it("requires localhost plus explicit flag plus explicit source test query", () => {
    const base = {
      isDev: true,
      hostname: "localhost",
      requestedSourceTest: SOURCE_AWARE_TEST_QUERY_VALUE,
      snapshot: { ...CURRENT_SOURCE_POLICY_SNAPSHOT, records: [activeSource], activeCount: 1, pausedCount: 0 },
      target: activeSource,
    };

    expect(buildSourceAwareTestModeGate({ ...base, enabledFlag: null }).status).toBe(
      "LOCKED_FLAG_MISSING",
    );
    expect(
      buildSourceAwareTestModeGate({
        ...base,
        enabledFlag: "true",
        requestedSourceTest: null,
      }).status,
    ).toBe("LOCKED_QUERY_MISSING");
    expect(
      buildSourceAwareTestModeGate({
        ...base,
        hostname: "preview.example.com",
        enabledFlag: "true",
      }).status,
    ).toBe("LOCKED_NON_LOCALHOST");
  });

  it("renders the internal harness but blocks execution while the source remains PAUSED", () => {
    const gate = buildSourceAwareTestModeGate({
      isDev: true,
      hostname: "localhost",
      enabledFlag: "true",
      requestedSourceTest: SOURCE_AWARE_TEST_QUERY_VALUE,
    });

    expect(gate.status).toBe("LOCKED_SOURCE_NOT_ACTIVE");
    expect(gate.canRenderInternalHarness).toBe(true);
    expect(gate.canQuoteNonZeroSourceId).toBe(false);
    expect(gate.canPrepareSourceAwareBuy).toBe(false);
    expect(gate.sourceIdForTest).toBe(INTERNAL_PROTOCOL_TEST_SOURCE_001.sourceId);
    expect(gate.testUsdc).toBe(SOURCE_AWARE_TEST_USDC);
    expect(gate.requiredWarnings.join(" ")).toContain("NOT PUBLIC REFERRAL");
    expect(gate.requiredWarnings.join(" ")).toContain("ZERO_SOURCE_ID");
  });

  it("can prepare the local source-aware path only after the source is ACTIVE", () => {
    const gate = buildSourceAwareTestModeGate({
      isDev: true,
      hostname: "127.0.0.1",
      enabledFlag: true,
      requestedSourceTest: SOURCE_AWARE_TEST_QUERY_VALUE,
      snapshot: { ...CURRENT_SOURCE_POLICY_SNAPSHOT, records: [activeSource], activeCount: 1, pausedCount: 0 },
      target: activeSource,
    });

    expect(gate.status).toBe("READY_FOR_LOCAL_TEST");
    expect(gate.canRenderInternalHarness).toBe(true);
    expect(gate.canQuoteNonZeroSourceId).toBe(true);
    expect(gate.canPrepareSourceAwareBuy).toBe(true);
  });

  it("allows production-internal test mode only for an allowlisted buyer after live readback", () => {
    const gate = buildSourceAwareTestModeGate({
      isDev: false,
      hostname: "thesyndicate.money",
      productionEnabledFlag: true,
      allowedBuyerAddresses: allowlistedBuyer,
      connectedWallet: allowlistedBuyer,
      requestedSourceTest: SOURCE_AWARE_TEST_QUERY_VALUE,
      snapshot: { ...CURRENT_SOURCE_POLICY_SNAPSHOT, records: [activeSource], activeCount: 1, pausedCount: 0 },
      target: activeSource,
      liveSourceStatus: "ACTIVE",
      liveSourceMatchesExpectedTerms: true,
    });

    expect(gate.status).toBe("READY_FOR_PRODUCTION_INTERNAL_TEST");
    expect(gate.isProductionInternalMode).toBe(true);
    expect(gate.requiresAllowlistedBuyer).toBe(true);
    expect(gate.connectedWalletAllowed).toBe(true);
    expect(gate.canRenderInternalHarness).toBe(true);
    expect(gate.canQuoteNonZeroSourceId).toBe(true);
    expect(gate.canPrepareSourceAwareBuy).toBe(true);
    expect(gate.allowedBuyersFlagName).toBe(SOURCE_AWARE_TEST_ALLOWED_BUYERS_FLAG);
  });

  it("blocks production-internal controls when the buyer is not allowlisted", () => {
    const gate = buildSourceAwareTestModeGate({
      isDev: false,
      hostname: "thesyndicate.money",
      productionEnabledFlag: true,
      allowedBuyerAddresses: allowlistedBuyer,
      connectedWallet: "0x2222222222222222222222222222222222222222",
      requestedSourceTest: SOURCE_AWARE_TEST_QUERY_VALUE,
      snapshot: { ...CURRENT_SOURCE_POLICY_SNAPSHOT, records: [activeSource], activeCount: 1, pausedCount: 0 },
      target: activeSource,
      liveSourceStatus: "ACTIVE",
      liveSourceMatchesExpectedTerms: true,
    });

    expect(gate.status).toBe("LOCKED_BUYER_NOT_ALLOWLISTED");
    expect(gate.canPrepareSourceAwareBuy).toBe(false);
  });

  it("blocks production-internal controls when live source terms do not match", () => {
    const gate = buildSourceAwareTestModeGate({
      isDev: false,
      hostname: "thesyndicate.money",
      productionEnabledFlag: true,
      allowedBuyerAddresses: allowlistedBuyer,
      connectedWallet: allowlistedBuyer,
      requestedSourceTest: SOURCE_AWARE_TEST_QUERY_VALUE,
      snapshot: { ...CURRENT_SOURCE_POLICY_SNAPSHOT, records: [activeSource], activeCount: 1, pausedCount: 0 },
      target: activeSource,
      liveSourceStatus: "ACTIVE",
      liveSourceMatchesExpectedTerms: false,
    });

    expect(gate.status).toBe("LOCKED_SOURCE_MISMATCH");
    expect(gate.canPrepareSourceAwareBuy).toBe(false);
  });

  it("parses buyer allowlists without treating the value as a secret", () => {
    expect(walletInAllowlist(allowlistedBuyer, ` ${allowlistedBuyer.toUpperCase()} , 0x3333333333333333333333333333333333333333`)).toBe(
      true,
    );
    expect(walletInAllowlist("0x2222222222222222222222222222222222222222", allowlistedBuyer)).toBe(
      false,
    );
  });

  it("contains no fake-live referral or claim wording", () => {
    const gateText = JSON.stringify(
      buildSourceAwareTestModeGate({
        isDev: true,
        hostname: "localhost",
        enabledFlag: "true",
        requestedSourceTest: SOURCE_AWARE_TEST_QUERY_VALUE,
      }),
    );

    expect(gateText).not.toMatch(/public referral is live|claim UI is live|source links are live/i);
    expect(gateText).not.toMatch(/yield opportunity|passive income|downline|upline|top earner/i);
  });
});
