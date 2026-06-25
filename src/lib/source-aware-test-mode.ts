import {
  CURRENT_SOURCE_POLICY_SNAPSHOT,
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
  type SourcePolicyRecord,
  type SourcePolicySnapshot,
} from "./source-policy-observability";

export const SOURCE_AWARE_TEST_MODE_FLAG = "VITE_ENABLE_SOURCE_TEST_MODE" as const;
export const SOURCE_AWARE_TEST_ROUTE = "/labs/source-attribution-test" as const;
export const SOURCE_AWARE_TEST_QUERY_PARAM = "sourceTest" as const;
export const SOURCE_AWARE_TEST_QUERY_VALUE = "INTERNAL_PROTOCOL_TEST_SOURCE_001" as const;
export const SOURCE_AWARE_TEST_USDC = 5 as const;

export type SourceAwareTestGateStatus =
  | "LOCKED_PRODUCTION"
  | "LOCKED_NON_LOCALHOST"
  | "LOCKED_FLAG_MISSING"
  | "LOCKED_QUERY_MISSING"
  | "LOCKED_SOURCE_MISMATCH"
  | "LOCKED_SOURCE_NOT_ACTIVE"
  | "READY_FOR_LOCAL_TEST";

export type SourceAwareTestGateInput = {
  isDev: boolean;
  hostname?: string | null;
  enabledFlag?: string | boolean | null;
  requestedSourceTest?: string | null;
  snapshot?: SourcePolicySnapshot;
  target?: SourcePolicyRecord;
};

export type SourceAwareTestModeGate = {
  route: typeof SOURCE_AWARE_TEST_ROUTE;
  queryParam: typeof SOURCE_AWARE_TEST_QUERY_PARAM;
  expectedQueryValue: typeof SOURCE_AWARE_TEST_QUERY_VALUE;
  flagName: typeof SOURCE_AWARE_TEST_MODE_FLAG;
  status: SourceAwareTestGateStatus;
  canRenderInternalHarness: boolean;
  canQuoteNonZeroSourceId: boolean;
  canPrepareSourceAwareBuy: boolean;
  sourceIdForTest: string;
  sourceStatus: SourcePolicyRecord["status"];
  defaultBuySourceId: typeof ZERO_SOURCE_ID;
  testUsdc: typeof SOURCE_AWARE_TEST_USDC;
  blockers: readonly string[];
  requiredWarnings: readonly string[];
};

export function isLocalhostHost(hostname?: string | null): boolean {
  if (!hostname) return false;
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    normalized === "localhost" ||
    normalized === "::1" ||
    normalized === "0:0:0:0:0:0:0:1" ||
    normalized === "127.0.0.1" ||
    /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalized)
  );
}

function flagEnabled(value?: string | boolean | null): boolean {
  return value === true || value === "true" || value === "1";
}

function findTarget(
  snapshot: SourcePolicySnapshot,
  target: SourcePolicyRecord,
): SourcePolicyRecord | undefined {
  return snapshot.records.find((record) => record.sourceId === target.sourceId);
}

export function buildSourceAwareTestModeGate({
  isDev,
  hostname,
  enabledFlag,
  requestedSourceTest,
  snapshot = CURRENT_SOURCE_POLICY_SNAPSHOT,
  target = INTERNAL_PROTOCOL_TEST_SOURCE_001,
}: SourceAwareTestGateInput): SourceAwareTestModeGate {
  const isLocal = isLocalhostHost(hostname);
  const isFlagEnabled = flagEnabled(enabledFlag);
  const queryMatches = requestedSourceTest === SOURCE_AWARE_TEST_QUERY_VALUE;
  const record = findTarget(snapshot, target);
  const sourceMatches = record?.sourceId === target.sourceId;
  const sourceIsActive = record?.status === "ACTIVE";
  const defaultBuyRemainsZero = snapshot.defaultBuySourceId === ZERO_SOURCE_ID;

  let status: SourceAwareTestGateStatus = "READY_FOR_LOCAL_TEST";
  const blockers: string[] = [];

  if (!isDev) {
    status = "LOCKED_PRODUCTION";
    blockers.push("This path is unavailable in production builds.");
  } else if (!isLocal) {
    status = "LOCKED_NON_LOCALHOST";
    blockers.push("This path is available only on localhost or loopback hosts.");
  } else if (!isFlagEnabled) {
    status = "LOCKED_FLAG_MISSING";
    blockers.push(`${SOURCE_AWARE_TEST_MODE_FLAG}=true is required before the internal harness can render.`);
  } else if (!queryMatches) {
    status = "LOCKED_QUERY_MISSING";
    blockers.push(
      `${SOURCE_AWARE_TEST_QUERY_PARAM}=${SOURCE_AWARE_TEST_QUERY_VALUE} is required so the sourceId is intentional.`,
    );
  } else if (!sourceMatches || !defaultBuyRemainsZero) {
    status = "LOCKED_SOURCE_MISMATCH";
    blockers.push("Current source snapshot or default ZERO_SOURCE_ID boundary does not match the approved test packet.");
  } else if (!sourceIsActive) {
    status = "LOCKED_SOURCE_NOT_ACTIVE";
    blockers.push("The internal source record is not ACTIVE. PAUSED sources cannot route acquisition commission.");
  }

  const canRenderInternalHarness = isDev && isLocal && isFlagEnabled && queryMatches && sourceMatches;
  const canQuoteNonZeroSourceId = canRenderInternalHarness && sourceIsActive && defaultBuyRemainsZero;
  const canPrepareSourceAwareBuy = status === "READY_FOR_LOCAL_TEST" && canQuoteNonZeroSourceId;

  return {
    route: SOURCE_AWARE_TEST_ROUTE,
    queryParam: SOURCE_AWARE_TEST_QUERY_PARAM,
    expectedQueryValue: SOURCE_AWARE_TEST_QUERY_VALUE,
    flagName: SOURCE_AWARE_TEST_MODE_FLAG,
    status,
    canRenderInternalHarness,
    canQuoteNonZeroSourceId,
    canPrepareSourceAwareBuy,
    sourceIdForTest: target.sourceId,
    sourceStatus: record?.status ?? target.status,
    defaultBuySourceId: snapshot.defaultBuySourceId,
    testUsdc: SOURCE_AWARE_TEST_USDC,
    blockers,
    requiredWarnings: [
      "INTERNAL SOURCE TEST MODE / NOT PUBLIC REFERRAL",
      "Localhost only.",
      "Fresh buyer wallet only.",
      "No public source link.",
      "No claim UI.",
      "No source dashboard.",
      "Production/default buys remain ZERO_SOURCE_ID.",
    ],
  };
}

export const CURRENT_SOURCE_AWARE_TEST_MODE_GATE = buildSourceAwareTestModeGate({
  isDev: false,
  hostname: "thesyndicate.money",
  enabledFlag: false,
  requestedSourceTest: null,
});
