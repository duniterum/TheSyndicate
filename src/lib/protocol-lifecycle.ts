import { ZERO_SOURCE_ID } from "./source-policy-observability";
import {
  REAL_CONDITION_SOURCE_TEST_COMPLETION,
  REAL_CONDITION_SOURCE_TEST_PACKET,
  REAL_CONDITION_SOURCE_TEST_TERMS,
} from "./source-real-condition-test";

export const PROTOCOL_LIFECYCLE_STAGE_STATUSES = [
  "COMPLETE",
  "SAFE_STATE",
  "FUTURE_DECISION",
] as const;

export type ProtocolLifecycleStageStatus =
  (typeof PROTOCOL_LIFECYCLE_STAGE_STATUSES)[number];

export type ProtocolLifecycleStage = {
  readonly label: string;
  readonly status: ProtocolLifecycleStageStatus;
  readonly actor: string;
  readonly proof: string;
  readonly txHash?: string;
  readonly block?: number;
};

export type ProtocolLifecycle = {
  readonly id: string;
  readonly title: string;
  readonly status: "PROVEN_INTERNAL";
  readonly capability: string;
  readonly summary: string;
  readonly institutionalMeaning: string;
  readonly currentSafeState: string;
  readonly finalSourceStatus: "PAUSED";
  readonly defaultPublicSourceId: typeof ZERO_SOURCE_ID;
  readonly latestAuthorityReadbackBlock: number;
  readonly stages: readonly ProtocolLifecycleStage[];
  readonly metrics: readonly { label: string; value: string; note: string }[];
  readonly boundaryFacts: readonly string[];
  readonly nextQuestions: readonly string[];
  readonly evidenceDocs: readonly string[];
};

export const FIRST_SOURCE_ATTRIBUTION_LIFECYCLE: ProtocolLifecycle = {
  id: "source-attribution-real-condition-001",
  title: "First proven protocol lifecycle",
  status: "PROVEN_INTERNAL",
  capability: "Source Attribution",
  summary:
    "One internal source policy moved from packet to on-chain source record, updated terms, controlled ACTIVE state, one real source-attributed MembershipSaleV3 purchase, and final PAUSED closure.",
  institutionalMeaning:
    "The Syndicate proved that a capability can become real under mainnet conditions without becoming public product, and that closure readback is part of the capability.",
  currentSafeState:
    "The internal source is PAUSED, isActive is false, escrow owed is zero, and public/default buys remain ZERO_SOURCE_ID.",
  finalSourceStatus: "PAUSED",
  defaultPublicSourceId: ZERO_SOURCE_ID,
  latestAuthorityReadbackBlock: REAL_CONDITION_SOURCE_TEST_COMPLETION.latestAuthorityReadbackBlock,
  stages: [
    {
      label: "Terms packet frozen",
      status: "COMPLETE",
      actor: "Codex prepares; founder approves",
      proof: REAL_CONDITION_SOURCE_TEST_PACKET.packetId,
    },
    {
      label: "Terms updated",
      status: "COMPLETE",
      actor: "Founder signer",
      proof: "SourceTermsUpdated event read back",
      txHash: REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.termsUpdated.hash,
      block: REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.termsUpdated.block,
    },
    {
      label: "Source activated for the test",
      status: "COMPLETE",
      actor: "Founder signer",
      proof: "SourceStatusChanged to ACTIVE for the approved internal test",
      txHash: REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.activated.hash,
      block: REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.activated.block,
    },
    {
      label: "Controlled $5 source-attributed buy",
      status: "COMPLETE",
      actor: "Fresh buyer wallet",
      proof: "MembershipPurchasedV3 emitted source-attributed receipt fields",
      txHash: REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.buy.hash,
      block: REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.buy.block,
    },
    {
      label: "Source re-paused and closed",
      status: "SAFE_STATE",
      actor: "Founder signer",
      proof: "Latest authority readback confirms PAUSED and isActive false",
      txHash: REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.rePaused.hash,
      block: REAL_CONDITION_SOURCE_TEST_COMPLETION.transactions.rePaused.block,
    },
    {
      label: "Public referral product",
      status: "FUTURE_DECISION",
      actor: "Founder/product/legal review",
      proof: "Separate approval required before source links, dashboards, claim UI, or public source-aware buys",
    },
  ],
  metrics: [
    {
      label: "Gross test",
      value: "$5.00",
      note: "One controlled MembershipSaleV3 purchase.",
    },
    {
      label: "Acquisition",
      value: "$0.25",
      note: `${REAL_CONDITION_SOURCE_TEST_TERMS.commissionBps / 100}% source payout.`,
    },
    {
      label: "Net routed",
      value: "$4.75",
      note: "Routed through Vault, Liquidity, and Operations.",
    },
    {
      label: "Escrow owed",
      value: "$0.00",
      note: "Direct payout succeeded.",
    },
    {
      label: "Member",
      value: `#${REAL_CONDITION_SOURCE_TEST_COMPLETION.memberNumber}`,
      note: "Source-attributed V3 seat.",
    },
    {
      label: "Readback",
      value: `Block ${REAL_CONDITION_SOURCE_TEST_COMPLETION.latestAuthorityReadbackBlock}`,
      note: "Final safe-state authority.",
    },
  ],
  boundaryFacts: [
    "This is a validated internal protocol capability, not public referral activation.",
    "The source is PAUSED and cannot route new commission unless separately activated.",
    `Public/default buys remain ${ZERO_SOURCE_ID}.`,
    "No claim UI, source dashboard, public source link, or public source-aware buy path exists.",
    "Future modules do not inherit MembershipSaleV3 source terms automatically.",
  ],
  nextQuestions: [
    "Should this proof enter Chronicle/Register memory as a material institutional milestone?",
    "What legal, accounting, anti-abuse, and UX gates are required before any public source product exists?",
    "Which future modules need their own source-aware lifecycle before using attribution?",
  ],
  evidenceDocs: [
    "docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md",
    "docs/PROTOCOL_CHECKPOINT_2026_06_25.md",
    "docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md",
    "docs/OPERATIONAL_MEMORY_LEDGER.md",
  ],
} as const;

export const PROTOCOL_LIFECYCLES: readonly ProtocolLifecycle[] = [
  FIRST_SOURCE_ATTRIBUTION_LIFECYCLE,
];

export function getProtocolLifecycleById(id: string) {
  return PROTOCOL_LIFECYCLES.find((lifecycle) => lifecycle.id === id) ?? null;
}

export function getCompletedProtocolLifecycleCount() {
  return PROTOCOL_LIFECYCLES.filter((lifecycle) => lifecycle.status === "PROVEN_INTERNAL").length;
}

export function getProtocolLifecycleStageCounts(lifecycle: ProtocolLifecycle) {
  return PROTOCOL_LIFECYCLE_STAGE_STATUSES.reduce(
    (counts, status) => ({
      ...counts,
      [status]: lifecycle.stages.filter((stage) => stage.status === status).length,
    }),
    {} as Record<ProtocolLifecycleStageStatus, number>,
  );
}
