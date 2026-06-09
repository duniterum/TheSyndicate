// ─── Protocol Execution Control System — machine-readable gate config ────
//
// Lightweight orchestration over existing canonical primitives. This file
// is the SINGLE machine-readable surface that scripts (CI gate runner),
// tests, and dashboards import from. No new architecture — it indexes
// what already exists.
//
// Authority: docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md.

export const SEVERITY = {
  BLOCKER: "BLOCKER",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;
export type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];

export const OUTCOME = {
  EXECUTE_NOW: "EXECUTE_NOW",
  DEFER: "DEFER",
  ASK_FOUNDER: "ASK_FOUNDER",
  REQUIRES_ONCHAIN_ACTION: "REQUIRES_ONCHAIN_ACTION",
  DO_NOT_DO: "DO_NOT_DO",
} as const;
export type Outcome = (typeof OUTCOME)[keyof typeof OUTCOME];

export const INVARIANTS = [
  "registry-only",
  "freshness-check",
  "account-pinning",
  "accounts-changed-sync",
  "registry-explorer-links",
  "mint-hash-persistence",
] as const;
export type Invariant = (typeof INVARIANTS)[number];

export const BLOCKER_CATEGORIES = [
  "wrong-contract-address",
  "wrong-abi",
  "wrong-chain",
  "dead-explorer-link",
  "stale-wallet-state",
  "lost-tx-hash-on-refresh",
  "fake-live-state",
  "wallet-state-as-global",
  "financial-rights-copy",
  "missing-freeze-before-activate",
  "false-ownership-display",
  "broken-write-flow-payment-path",
  "transaction-revert",
  "activation-precondition-failed",
  "public-mint-active-contradiction",
] as const;
export type BlockerCategory = (typeof BLOCKER_CATEGORIES)[number];

export interface ReleaseGate {
  id: string;
  description: string;
  severity: Severity;
  sourceOfTruth: string;
}

export const RELEASE_GATES: ReleaseGate[] = [
  { id: "contract-registry-complete", description: "Archive1155, SYN, Sale, USDC, LP, wallets all LIVE in contract-registry", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/contract-registry.ts" },
  { id: "seat-record-721-pending", description: "SeatRecord721 entry remains PENDING with address: null", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/contract-registry.ts" },
  { id: "archive-id-1-live", description: "Archive ID 1 (First Signal) LIVE_PUBLIC_MINT", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/archive-id-registry.ts" },
  { id: "archive-id-2-reserved", description: "Archive ID 2 RESERVED_DISABLED, never public-mintable", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/archive-id-registry.ts" },
  { id: "archive-id-3-live", description: "Archive ID 3 (Patron Seal) LIVE_PUBLIC_MINT at 5 USDC", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/archive-id-registry.ts" },
  { id: "archive-ids-4-8-not-public", description: "Archive IDs 4–8 not publicMintAllowed", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/archive-id-registry.ts" },
  { id: "archive-id-9-not-configured", description: "Archive ID 9 NOT_CONFIGURED — never claim configured", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/archive-id-registry.ts" },
  { id: "mint-hash-persistence", description: "Every write surface uses useMintHashPersistence", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/__tests__/tx-write-canonical.test.ts" },
  { id: "canonical-explorer-helpers", description: "No hand-built explorer URLs in write surfaces", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/chain-registry.ts" },
  { id: "no-bare-avascan-tx", description: "No bare avascan.info/tx/ — must use /blockchain/c/tx/", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/__tests__/explorer-urls.test.ts" },
  { id: "no-financial-rights-copy", description: "No ROI/dividend/yield/profit/investment/returns language in write surfaces", severity: SEVERITY.BLOCKER, sourceOfTruth: "docs/VISION.md" },
  { id: "patron-seal-price-5-usdc", description: "Patron Seal ID 3 priceUsdc === 5", severity: SEVERITY.BLOCKER, sourceOfTruth: "src/lib/archive-id-registry.ts" },
  { id: "freeze-before-activate", description: "Activation runbook enforces freeze-before-activate", severity: SEVERITY.BLOCKER, sourceOfTruth: "docs/ACTIVATION_RUNBOOK.md" },
];

export interface ActivationGate {
  candidate: string;
  requiresFreeze: boolean;
  requiresOwnerSignature: boolean;
  requiresFounderApproval: boolean;
  invariants: Invariant[];
}

/** Activation candidates currently known. Every future id MUST be added
 *  here BEFORE any UI surface may claim configured/active. */
export const ACTIVATION_GATES: ActivationGate[] = [
  { candidate: "archive-id-4", requiresFreeze: true, requiresOwnerSignature: true, requiresFounderApproval: true, invariants: [...INVARIANTS] },
  { candidate: "archive-id-5", requiresFreeze: true, requiresOwnerSignature: true, requiresFounderApproval: true, invariants: [...INVARIANTS] },
  { candidate: "archive-id-6", requiresFreeze: true, requiresOwnerSignature: true, requiresFounderApproval: true, invariants: [...INVARIANTS] },
  { candidate: "archive-id-7", requiresFreeze: true, requiresOwnerSignature: true, requiresFounderApproval: true, invariants: [...INVARIANTS] },
  { candidate: "archive-id-8", requiresFreeze: true, requiresOwnerSignature: true, requiresFounderApproval: true, invariants: [...INVARIANTS] },
  { candidate: "archive-id-9", requiresFreeze: true, requiresOwnerSignature: true, requiresFounderApproval: true, invariants: [...INVARIANTS] },
  { candidate: "seat-record-721", requiresFreeze: false, requiresOwnerSignature: true, requiresFounderApproval: true, invariants: [...INVARIANTS] },
];

/** Thin ABI registry index — enough for the gate runner to assert pairing
 *  without duplicating ABI shape. */
export const ABI_REGISTRY = {
  ARCHIVE_1155: { abiModule: "src/lib/archive-nft-abi.ts", export: "ARCHIVE_NFT_ABI", contractKey: "ARCHIVE_1155" },
  MEMBERSHIP_SALE: { abiModule: "src/lib/sale-abi.ts", export: "SALE_ABI", contractKey: "MEMBERSHIP_SALE" },
  USDC: { abiModule: "src/lib/sale-abi.ts", export: "ERC20_ABI", contractKey: "USDC" },
  SYN_TOKEN: { abiModule: "src/lib/sale-abi.ts", export: "ERC20_ABI", contractKey: "SYN_TOKEN" },
  SEAT_RECORD_721: { abiModule: null, export: null, contractKey: "SEAT_RECORD_721" },
} as const;

export type GateResult = "PASS" | "WARN" | "BLOCKER" | "DEFERRED";

export interface Finding {
  gate: string;
  severity: Severity;
  outcome: Outcome;
  message: string;
}

export function classify(finding: Pick<Finding, "severity">): GateResult {
  switch (finding.severity) {
    case SEVERITY.BLOCKER: return "BLOCKER";
    case SEVERITY.HIGH: return "WARN";
    case SEVERITY.MEDIUM: return "DEFERRED";
    case SEVERITY.LOW: return "DEFERRED";
  }
}
