import {
  AVALANCHE_CHAIN_ID,
  MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS,
  SOURCE_REGISTRY_V1_CONTRACT_ADDRESS,
} from "./syndicate-config";
import {
  INTERNAL_PROTOCOL_TEST_SOURCE_001,
  ZERO_SOURCE_ID,
} from "./source-policy-observability";
import { SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION } from "./source-public-product-framework";

export type VerifiedIntroductionReleaseQaStatus =
  "DRAFT_RELEASE_QA_NOT_APPROVED";

export type VerifiedIntroductionQaGateStatus =
  | "SATISFIED_FOR_REVIEW"
  | "PENDING_LATEST_READBACK"
  | "PENDING_REPLIT_QA"
  | "PENDING_FOUNDER_APPROVAL"
  | "BLOCKED_BY_DESIGN";

export type VerifiedIntroductionLatestRead = {
  readonly id: string;
  readonly label: string;
  readonly contractOrSurface: string;
  readonly read: string;
  readonly expected: string;
  readonly stopCondition: string;
};

export type VerifiedIntroductionReleaseGate = {
  readonly id: string;
  readonly label: string;
  readonly status: VerifiedIntroductionQaGateStatus;
  readonly requiredBefore: "LAUNCH_CANDIDATE" | "PUBLISH" | "WALLET_SIGNATURE";
  readonly requirement: string;
  readonly stopCondition: string;
};

export type VerifiedIntroductionLiveQaCheck = {
  readonly id: string;
  readonly routeOrSurface: string;
  readonly mustConfirm: string;
  readonly mustNotExpose: string;
};

export type VerifiedIntroductionReleaseQaPacket = {
  readonly id: "verified-introduction-v1-release-qa-packet";
  readonly productId: typeof SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id;
  readonly status: VerifiedIntroductionReleaseQaStatus;
  readonly launchApproved: false;
  readonly publicControlsApproved: false;
  readonly blockTag: "latest";
  readonly chainId: typeof AVALANCHE_CHAIN_ID;
  readonly sourceRegistryAddress: typeof SOURCE_REGISTRY_V1_CONTRACT_ADDRESS;
  readonly membershipSaleAddress: typeof MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS;
  readonly sourceId: typeof INTERNAL_PROTOCOL_TEST_SOURCE_001.sourceId;
  readonly publicJoinDefaultSourceId: typeof ZERO_SOURCE_ID;
  readonly latestChainReads: readonly VerifiedIntroductionLatestRead[];
  readonly releaseGates: readonly VerifiedIntroductionReleaseGate[];
  readonly liveQaChecks: readonly VerifiedIntroductionLiveQaCheck[];
  readonly stopConditions: readonly string[];
};

export const VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET = {
  id: "verified-introduction-v1-release-qa-packet",
  productId: SOURCE_PUBLIC_PRODUCT_V1_RECOMMENDATION.id,
  status: "DRAFT_RELEASE_QA_NOT_APPROVED",
  launchApproved: false,
  publicControlsApproved: false,
  blockTag: "latest",
  chainId: AVALANCHE_CHAIN_ID,
  sourceRegistryAddress: SOURCE_REGISTRY_V1_CONTRACT_ADDRESS,
  membershipSaleAddress: MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS,
  sourceId: INTERNAL_PROTOCOL_TEST_SOURCE_001.sourceId,
  publicJoinDefaultSourceId: ZERO_SOURCE_ID,
  latestChainReads: [
    {
      id: "chain-id",
      label: "Avalanche C-Chain",
      contractOrSurface: "RPC",
      read: "eth_chainId at latest",
      expected: "43114",
      stopCondition: "Stop if the read is not Avalanche C-Chain.",
    },
    {
      id: "source-registry-bytecode",
      label: "SourceRegistryV1 bytecode",
      contractOrSurface: SOURCE_REGISTRY_V1_CONTRACT_ADDRESS ?? "MISSING",
      read: "getCode at latest",
      expected: "bytecode exists",
      stopCondition: "Stop if SourceRegistryV1 is missing or unresolved.",
    },
    {
      id: "source-registry-owner",
      label: "SourceRegistryV1 owner",
      contractOrSurface: SOURCE_REGISTRY_V1_CONTRACT_ADDRESS ?? "MISSING",
      read: "owner() and pendingOwner() if available",
      expected: "founder/operator owner unchanged; no unexpected pending owner",
      stopCondition: "Stop if owner authority changed unexpectedly.",
    },
    {
      id: "source-record-current-status",
      label: "Current source status",
      contractOrSurface: SOURCE_REGISTRY_V1_CONTRACT_ADDRESS ?? "MISSING",
      read: "sourceExists(sourceId), sourceConfig(sourceId), isActive(sourceId)",
      expected:
        "source exists; terms match approved packet; status matches the launch candidate; isActive agrees with status",
      stopCondition:
        "Stop if a historical readback, stale block, mismatched terms, or unexpected status is used.",
    },
    {
      id: "membership-sale-bytecode",
      label: "MembershipSaleV3 bytecode",
      contractOrSurface: MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS ?? "MISSING",
      read: "getCode at latest",
      expected: "bytecode exists at the current buy target",
      stopCondition: "Stop if MembershipSaleV3 is missing or not the expected target.",
    },
    {
      id: "membership-sale-source-wiring",
      label: "MembershipSaleV3 source wiring",
      contractOrSurface: MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS ?? "MISSING",
      read: "source registry wiring, paused state, and public/default quote path",
      expected: "wires to SourceRegistryV1; public/default buys still use ZERO_SOURCE_ID",
      stopCondition:
        "Stop if the public/default path carries a non-zero sourceId or sale wiring is uncertain.",
    },
  ],
  releaseGates: [
    {
      id: "latest-chain-readback",
      label: "Latest-chain current authority",
      status: "PENDING_LATEST_READBACK",
      requiredBefore: "LAUNCH_CANDIDATE",
      requirement:
        "Run live RPC reads at blockTag latest for SourceRegistryV1, MembershipSaleV3, and the candidate source.",
      stopCondition:
        "If any read uses the historical readback anchor instead of latest chain state, stop.",
    },
    {
      id: "github-release-gate",
      label: "GitHub release gate",
      status: "SATISFIED_FOR_REVIEW",
      requiredBefore: "PUBLISH",
      requirement:
        "GitHub must pass check-release before Replit publishes a public or hidden runtime candidate.",
      stopCondition: "If typecheck, tests, build, or production guards fail, stop.",
    },
    {
      id: "replit-sync-publish-gate",
      label: "Replit sync and publish gate",
      status: "PENDING_REPLIT_QA",
      requiredBefore: "PUBLISH",
      requirement:
        "Replit reports starting commit/status, preserves documented local divergences, syncs GitHub, validates, and publishes only if green.",
      stopCondition:
        "If Replit has unexplained local changes or validation fails, do not publish.",
    },
    {
      id: "live-no-leakage-gate",
      label: "Live no-leakage QA",
      status: "PENDING_REPLIT_QA",
      requiredBefore: "PUBLISH",
      requirement:
        "Live QA confirms /join, /referral, sitemap, robots, nav, and hidden review surfaces do not expose public source controls.",
      stopCondition:
        "If any public route exposes a source selector, source link, alias, claim UI, dashboard, or source-aware public buy path, stop.",
    },
    {
      id: "founder-final-approval",
      label: "Founder final launch approval",
      status: "PENDING_FOUNDER_APPROVAL",
      requiredBefore: "WALLET_SIGNATURE",
      requirement:
        "Founder must approve the exact launch candidate, source policy, buyer disclosure, Replit plan, and stop conditions.",
      stopCondition:
        "If approval is for direction, review, proof, Register memory, or QA only, do not treat it as launch approval.",
    },
    {
      id: "excluded-public-surfaces",
      label: "Excluded public surfaces",
      status: "BLOCKED_BY_DESIGN",
      requiredBefore: "LAUNCH_CANDIDATE",
      requirement:
        "Aliases, source dashboards, claim UI, open self-serve referral, product-wide attribution, and Archive/SeatRecord/SwapRail attribution remain outside V1.",
      stopCondition:
        "If any excluded surface becomes necessary, create a separate founder-approved product sprint.",
    },
  ],
  liveQaChecks: [
    {
      id: "join-zero-source",
      routeOrSurface: "/join",
      mustConfirm: "Public/default buy path remains ZERO_SOURCE_ID.",
      mustNotExpose: "No source selector, source code field, alias route, or source-aware public buy path.",
    },
    {
      id: "referral-inactive",
      routeOrSurface: "/referral",
      mustConfirm: "Referral remains inactive/pending and does not offer public source action.",
      mustNotExpose: "No claim control, source dashboard, source link, or public activation language.",
    },
    {
      id: "hidden-review-route",
      routeOrSurface: "/labs/verified-introduction-review",
      mustConfirm: "Internal review remains noindex, direct URL only, and absent from sitemap/nav.",
      mustNotExpose: "No wallet controls, buy button, claim control, source link, or launch approval.",
    },
    {
      id: "knowledge-and-register",
      routeOrSurface: "/knowledge-map and /institutional-register",
      mustConfirm: "Proof and memory remain distinct from public product launch.",
      mustNotExpose: "No wording that proof, Register memory, or Chronicle review equals activation.",
    },
    {
      id: "negative-copy-filter",
      routeOrSurface: "live QA grep output",
      mustConfirm:
        "QA distinguishes denial copy such as no claim UI from actionable controls such as buttons, forms, selectors, links, or wallet actions.",
      mustNotExpose: "No false launch report based only on negative/disclaimer text.",
    },
  ],
  stopConditions: [
    "Stop if current-authority validation reads a historical block or cached snapshot.",
    "Stop if SourceRegistryV1 or MembershipSaleV3 readback mismatches GitHub truth.",
    "Stop if public/default /join does not remain ZERO_SOURCE_ID.",
    "Stop if /referral becomes actionable before founder launch approval.",
    "Stop if hidden internal review routes appear in public navigation or sitemap.",
    "Stop if claim UI, source dashboard, alias route, source link, or public source-aware buy path appears.",
    "Stop if Replit validation or live QA is partial and founder has not explicitly accepted the residual risk.",
  ],
} satisfies VerifiedIntroductionReleaseQaPacket;

export function getVerifiedIntroductionReleaseQaBlockers(): readonly VerifiedIntroductionReleaseGate[] {
  return VERIFIED_INTRODUCTION_V1_RELEASE_QA_PACKET.releaseGates.filter(
    (gate) => gate.status !== "SATISFIED_FOR_REVIEW",
  );
}

export function isVerifiedIntroductionReleaseQaApproved(): false {
  return false;
}
