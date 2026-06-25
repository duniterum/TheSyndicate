import {
  CURRENT_SOURCE_POLICY_SNAPSHOT,
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
  type SourcePolicyRecord,
  type SourcePolicySnapshot,
} from "./source-policy-observability";

export type SourceActivationGateStatus =
  | "SATISFIED"
  | "READBACK_REQUIRED"
  | "FOUNDER_APPROVAL_REQUIRED"
  | "MISSING_IMPLEMENTATION"
  | "BLOCKED_BY_DESIGN";

export type SourceActivationGate = {
  id: string;
  label: string;
  status: SourceActivationGateStatus;
  proof: string;
  requirement: string;
  blocksActiveCeremony: boolean;
};

export type SourceTermWindowStatus = "MISSING" | "NOT_STARTED" | "OPEN" | "EXPIRED";

export type SourceActivationReadiness = {
  targetSourceId: string;
  targetSourceLabel: "INTERNAL_PROTOCOL_TEST_SOURCE_001";
  targetStatus: SourcePolicyRecord["status"];
  targetClass: SourcePolicyRecord["sourceClass"];
  defaultBuySourceId: typeof ZERO_SOURCE_ID;
  readyForActiveCeremony: boolean;
  readyForPublicReferral: false;
  readyForClaimUi: false;
  readyForPublicSourceAwareBuyPath: false;
  gates: readonly SourceActivationGate[];
  requiredNextActions: readonly string[];
  forbiddenActions: readonly string[];
};

export function evaluateSourceTermWindow(
  record: Pick<SourcePolicyRecord, "startTime" | "endTime">,
  nowUnixSeconds: number,
): SourceTermWindowStatus {
  if (record.startTime === undefined || record.endTime === undefined) return "MISSING";
  if (nowUnixSeconds < record.startTime) return "NOT_STARTED";
  if (nowUnixSeconds > record.endTime) return "EXPIRED";
  return "OPEN";
}

function hasTargetRecord(snapshot: SourcePolicySnapshot, targetSourceId: string): boolean {
  return snapshot.records.some((record) => record.sourceId === targetSourceId);
}

export function buildSourceActivationReadiness(
  snapshot: SourcePolicySnapshot = CURRENT_SOURCE_POLICY_SNAPSHOT,
  target: SourcePolicyRecord = INTERNAL_PROTOCOL_TEST_SOURCE_001,
): SourceActivationReadiness {
  const targetExists = hasTargetRecord(snapshot, target.sourceId);
  const targetIsPaused = target.status === "PAUSED";
  const noActiveSources = snapshot.activeCount === 0;
  const defaultBuyRemainsZero = snapshot.defaultBuySourceId === ZERO_SOURCE_ID;

  const gates: readonly SourceActivationGate[] = [
    {
      id: "source-policy-record",
      label: "Target source policy record",
      status: targetExists && targetIsPaused ? "SATISFIED" : "READBACK_REQUIRED",
      proof: targetExists
        ? `${target.sourceId} exists in the current SourceRegistryV1 read model with status ${target.status}.`
        : "The target sourceId is missing from the current SourceRegistryV1 read model.",
      requirement:
        "Immediately before any future status transaction, read sourceExists(sourceId), sourceConfig(sourceId), owner(), and pendingOwner() from Avalanche.",
      blocksActiveCeremony: !(targetExists && targetIsPaused),
    },
    {
      id: "no-active-source-today",
      label: "No active source exists today",
      status: noActiveSources ? "SATISFIED" : "READBACK_REQUIRED",
      proof: `Current source snapshot has ${snapshot.activeCount} active source record${snapshot.activeCount === 1 ? "" : "s"}.`,
      requirement:
        "If any ACTIVE source already exists before the controlled test, stop and reconcile source state before another activation action.",
      blocksActiveCeremony: !noActiveSources,
    },
    {
      id: "current-authority-preflight",
      label: "Fresh current-authority preflight",
      status: "READBACK_REQUIRED",
      proof:
        "The repository records the PAUSED readback, but a future ceremony must re-read chain state at that time.",
      requirement:
        "Verify chain ID 43114, SourceRegistry owner, target status PAUSED, source terms, V3 sale address, and default ZERO_SOURCE_ID path immediately before signing.",
      blocksActiveCeremony: true,
    },
    {
      id: "terms-window-review",
      label: "Source terms and window review",
      status: "READBACK_REQUIRED",
      proof:
        "The current packet has frozen WINDOWED terms. Timing must be reviewed before activation so an old window is not used accidentally.",
      requirement:
        "If the planned test cannot happen inside the approved window, update terms with a new approved packet and metadata hash before any ACTIVE status action.",
      blocksActiveCeremony: true,
    },
    {
      id: "local-source-aware-test-path",
      label: "Localhost-only source-aware test path",
      status: "MISSING_IMPLEMENTATION",
      proof:
        "The public buy path intentionally uses ZERO_SOURCE_ID and no local-only non-zero sourceId test path is approved yet.",
      requirement:
        "Build an environment-gated local test mode before any source-attributed purchase test. It must never expose a public source selector or public source link.",
      blocksActiveCeremony: true,
    },
    {
      id: "clear-source-ux",
      label: "Clear-source buyer disclosure",
      status: "MISSING_IMPLEMENTATION",
      proof:
        "No approved source-aware buyer confirmation exists because public/default buys are not source-attributed.",
      requirement:
        "Before a non-zero sourceId signature path, show sourceId, source class, status, commission bps, cap terms, acquisition commission behavior, and Net USDC Routed implications.",
      blocksActiveCeremony: true,
    },
    {
      id: "founder-active-approval",
      label: "Founder approval for ACTIVE status ceremony",
      status: "FOUNDER_APPROVAL_REQUIRED",
      proof:
        "The PAUSED source ceremony was approved and read back; the ACTIVE ceremony has not been approved.",
      requirement:
        "Founder must approve the exact setSourceStatus(sourceId, ACTIVE) transaction after fresh readbacks and before any wallet signing.",
      blocksActiveCeremony: true,
    },
    {
      id: "legal-product-signoff",
      label: "Legal/product copy signoff",
      status: "FOUNDER_APPROVAL_REQUIRED",
      proof:
        "Source attribution can create acquisition commission and payout facts, so public or test-facing copy must stay precise.",
      requirement:
        "Approve acquisition-first language, no member ownership, no agency/employment implication, no MLM/downline framing, no yield/passive-income/ROI framing.",
      blocksActiveCeremony: true,
    },
    {
      id: "public-zero-source-boundary",
      label: "Public/default ZERO_SOURCE_ID boundary",
      status: defaultBuyRemainsZero ? "SATISFIED" : "READBACK_REQUIRED",
      proof: `Current default buy sourceId is ${snapshot.defaultBuySourceId}.`,
      requirement:
        "Public/default production buys must continue using ZERO_SOURCE_ID unless a separate public source-aware path is approved and tested.",
      blocksActiveCeremony: !defaultBuyRemainsZero,
    },
    {
      id: "no-public-referral-or-claim-ui",
      label: "No public referral, source dashboard, or claim UI",
      status: "BLOCKED_BY_DESIGN",
      proof:
        "Referral activation, claim UI, public source links, and source dashboards remain intentionally absent.",
      requirement:
        "Do not build claim UI, public source links, source dashboards, or product-wide attribution as part of the activation readiness path.",
      blocksActiveCeremony: false,
    },
  ];

  const readyForActiveCeremony = gates.every((gate) => !gate.blocksActiveCeremony);

  return {
    targetSourceId: target.sourceId,
    targetSourceLabel: "INTERNAL_PROTOCOL_TEST_SOURCE_001",
    targetStatus: target.status,
    targetClass: target.sourceClass,
    defaultBuySourceId: snapshot.defaultBuySourceId,
    readyForActiveCeremony,
    readyForPublicReferral: false,
    readyForClaimUi: false,
    readyForPublicSourceAwareBuyPath: false,
    gates,
    requiredNextActions: [
      "Run a fresh current-authority readback before any source status transaction.",
      "Decide whether the approved time window still fits the intended controlled test.",
      "Build the localhost-only source-aware test path with explicit internal-test gating.",
      "Approve source-aware buyer disclosure before any non-zero sourceId wallet signature.",
      "Approve the exact ACTIVE status transaction only after every blocker is cleared.",
    ],
    forbiddenActions: [
      "Do not activate referral.",
      "Do not create public source links.",
      "Do not add claim UI.",
      "Do not route public/default buys through a non-zero sourceId.",
      "Do not use Archive1155, SeatRecord721, SwapRail, or ProductSaleRouter as source-aware paths.",
    ],
  };
}

export const CURRENT_SOURCE_ACTIVATION_READINESS = buildSourceActivationReadiness();
