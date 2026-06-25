import {
  CURRENT_SOURCE_POLICY_SNAPSHOT,
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
  type SourcePolicyRecord,
  type SourcePolicySnapshot,
} from "./source-policy-observability";

export const SOURCE_AWARE_TEST_MODE_FLAG = "VITE_ENABLE_SOURCE_TEST_MODE" as const;
export const SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG =
  "VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE" as const;
export const SOURCE_AWARE_TEST_ALLOWED_BUYERS_FLAG =
  "VITE_SOURCE_TEST_ALLOWED_BUYERS" as const;
export const SOURCE_AWARE_TEST_ROUTE = "/labs/source-attribution-test" as const;
export const SOURCE_AWARE_TEST_QUERY_PARAM = "sourceTest" as const;
export const SOURCE_AWARE_TEST_QUERY_VALUE = "INTERNAL_PROTOCOL_TEST_SOURCE_001" as const;
export const SOURCE_AWARE_TEST_USDC = 5 as const;

export type SourceAwareTestGateStatus =
  | "LOCKED_PRODUCTION"
  | "LOCKED_PRODUCTION_FLAG_MISSING"
  | "LOCKED_NON_LOCALHOST"
  | "LOCKED_FLAG_MISSING"
  | "LOCKED_QUERY_MISSING"
  | "LOCKED_SOURCE_MISMATCH"
  | "LOCKED_SOURCE_NOT_ACTIVE"
  | "LOCKED_BUYER_NOT_ALLOWLISTED"
  | "READY_FOR_LOCAL_TEST"
  | "READY_FOR_PRODUCTION_INTERNAL_TEST";

export type SourceAwareTestGateInput = {
  isDev: boolean;
  hostname?: string | null;
  enabledFlag?: string | boolean | null;
  productionEnabledFlag?: string | boolean | null;
  allowedBuyerAddresses?: string | null;
  connectedWallet?: string | null;
  requestedSourceTest?: string | null;
  snapshot?: SourcePolicySnapshot;
  target?: SourcePolicyRecord;
  liveSourceStatus?: SourcePolicyRecord["status"] | null;
  liveSourceMatchesExpectedTerms?: boolean | null;
};

export type SourceAwareTestModeGate = {
  route: typeof SOURCE_AWARE_TEST_ROUTE;
  queryParam: typeof SOURCE_AWARE_TEST_QUERY_PARAM;
  expectedQueryValue: typeof SOURCE_AWARE_TEST_QUERY_VALUE;
  flagName: typeof SOURCE_AWARE_TEST_MODE_FLAG;
  productionFlagName: typeof SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG;
  allowedBuyersFlagName: typeof SOURCE_AWARE_TEST_ALLOWED_BUYERS_FLAG;
  status: SourceAwareTestGateStatus;
  canRenderInternalHarness: boolean;
  canQuoteNonZeroSourceId: boolean;
  canPrepareSourceAwareBuy: boolean;
  isProductionInternalMode: boolean;
  requiresAllowlistedBuyer: boolean;
  connectedWalletAllowed: boolean;
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

export function walletInAllowlist(address?: string | null, allowlist?: string | null): boolean {
  if (!address || !allowlist) return false;
  const normalizedAddress = address.toLowerCase();
  return allowlist
    .split(/[\s,;]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => entry === normalizedAddress);
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
  productionEnabledFlag,
  allowedBuyerAddresses,
  connectedWallet,
  requestedSourceTest,
  snapshot = CURRENT_SOURCE_POLICY_SNAPSHOT,
  target = INTERNAL_PROTOCOL_TEST_SOURCE_001,
  liveSourceStatus = null,
  liveSourceMatchesExpectedTerms = null,
}: SourceAwareTestGateInput): SourceAwareTestModeGate {
  const isLocal = isLocalhostHost(hostname);
  const isFlagEnabled = flagEnabled(enabledFlag);
  const isProductionFlagEnabled = flagEnabled(productionEnabledFlag);
  const queryMatches = requestedSourceTest === SOURCE_AWARE_TEST_QUERY_VALUE;
  const record = findTarget(snapshot, target);
  const sourceMatches = record?.sourceId === target.sourceId;
  const effectiveSourceStatus = liveSourceStatus ?? record?.status ?? target.status;
  const sourceIsActive = effectiveSourceStatus === "ACTIVE";
  const defaultBuyRemainsZero = snapshot.defaultBuySourceId === ZERO_SOURCE_ID;
  const productionInternalMode = !isDev && !isLocal && isProductionFlagEnabled;
  const connectedWalletAllowed =
    !productionInternalMode || walletInAllowlist(connectedWallet, allowedBuyerAddresses);

  let status: SourceAwareTestGateStatus = "READY_FOR_LOCAL_TEST";
  const blockers: string[] = [];

  if (!isDev && !productionInternalMode) {
    status = isProductionFlagEnabled ? "LOCKED_PRODUCTION" : "LOCKED_PRODUCTION_FLAG_MISSING";
    blockers.push(
      `${SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG}=true is required before production-internal test mode can render.`,
    );
  } else if (!isLocal) {
    status = productionInternalMode ? "READY_FOR_PRODUCTION_INTERNAL_TEST" : "LOCKED_NON_LOCALHOST";
    if (!productionInternalMode) {
      blockers.push("This path is available only on localhost or explicitly enabled production-internal mode.");
    }
  }

  if (blockers.length === 0 && isDev && !isFlagEnabled) {
    status = "LOCKED_FLAG_MISSING";
    blockers.push(`${SOURCE_AWARE_TEST_MODE_FLAG}=true is required before the internal harness can render.`);
  } else if (blockers.length === 0 && !queryMatches) {
    status = "LOCKED_QUERY_MISSING";
    blockers.push(
      `${SOURCE_AWARE_TEST_QUERY_PARAM}=${SOURCE_AWARE_TEST_QUERY_VALUE} is required so the sourceId is intentional.`,
    );
  } else if (
    blockers.length === 0 &&
    (!sourceMatches || !defaultBuyRemainsZero || liveSourceMatchesExpectedTerms === false)
  ) {
    status = "LOCKED_SOURCE_MISMATCH";
    blockers.push(
      "Current source snapshot, live SourceRegistry readback, or default ZERO_SOURCE_ID boundary does not match the approved test packet.",
    );
  } else if (blockers.length === 0 && !sourceIsActive) {
    status = "LOCKED_SOURCE_NOT_ACTIVE";
    blockers.push("The internal source record is not ACTIVE. PAUSED sources cannot route acquisition commission.");
  } else if (blockers.length === 0 && productionInternalMode && !connectedWalletAllowed) {
    status = "LOCKED_BUYER_NOT_ALLOWLISTED";
    blockers.push(
      `${SOURCE_AWARE_TEST_ALLOWED_BUYERS_FLAG} must include the connected fresh buyer wallet before production-internal controls unlock.`,
    );
  }

  const localHarnessReady = isDev && isLocal && isFlagEnabled;
  const productionHarnessReady = productionInternalMode;
  const canRenderInternalHarness =
    (localHarnessReady || productionHarnessReady) && queryMatches && sourceMatches;
  const canQuoteNonZeroSourceId =
    canRenderInternalHarness &&
    sourceIsActive &&
    defaultBuyRemainsZero &&
    liveSourceMatchesExpectedTerms !== false &&
    connectedWalletAllowed;
  const canPrepareSourceAwareBuy =
    (status === "READY_FOR_LOCAL_TEST" || status === "READY_FOR_PRODUCTION_INTERNAL_TEST") &&
    canQuoteNonZeroSourceId;

  return {
    route: SOURCE_AWARE_TEST_ROUTE,
    queryParam: SOURCE_AWARE_TEST_QUERY_PARAM,
    expectedQueryValue: SOURCE_AWARE_TEST_QUERY_VALUE,
    flagName: SOURCE_AWARE_TEST_MODE_FLAG,
    productionFlagName: SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG,
    allowedBuyersFlagName: SOURCE_AWARE_TEST_ALLOWED_BUYERS_FLAG,
    status,
    canRenderInternalHarness,
    canQuoteNonZeroSourceId,
    canPrepareSourceAwareBuy,
    isProductionInternalMode: productionInternalMode,
    requiresAllowlistedBuyer: productionInternalMode,
    connectedWalletAllowed,
    sourceIdForTest: target.sourceId,
    sourceStatus: effectiveSourceStatus,
    defaultBuySourceId: snapshot.defaultBuySourceId,
    testUsdc: SOURCE_AWARE_TEST_USDC,
    blockers,
    requiredWarnings: [
      "INTERNAL SOURCE TEST MODE / NOT PUBLIC REFERRAL",
      "Localhost or explicitly approved production-internal mode only.",
      "Fresh buyer wallet only.",
      "Production-internal mode requires an allowlisted buyer wallet.",
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
