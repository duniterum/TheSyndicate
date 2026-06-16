// transaction-state — the canonical vocabulary for the lifecycle of any
// protocol write (approve, buy, mint, and future claim / marketplace paths).
//
// WHY THIS EXISTS:
//   Each write surface invented its own ad-hoc phase strings ("approving",
//   "minting", "Waiting for confirmation…"). This module defines ONE shared
//   status enum + labels so future flows describe themselves with the same
//   words. It is intentionally NOT wired into the existing approve→buy /
//   approve→mint state machines yet — adopting it everywhere is a later step.
//   Creating the vocabulary is the whole job here.
//
// This is a pure-data leaf: no chain reads, no React, no side effects.

export type TransactionStatus =
  /** Nothing in flight; the action is waiting on the user. */
  | "idle"
  /** Reading wallet/contract preconditions (balance, allowance, eligibility). */
  | "checking"
  /** Connected wallet is on the wrong network and must switch. */
  | "needsNetwork"
  /** An ERC-20 approval is required before the main call. */
  | "needsApproval"
  /** The approval transaction is being signed / confirmed. */
  | "approving"
  /** All preconditions met; the main call can be submitted. */
  | "ready"
  /** The main transaction is awaiting the wallet signature. */
  | "submitting"
  /** Submitted; awaiting on-chain confirmation. */
  | "confirming"
  /** Confirmed on-chain. */
  | "success"
  /** Reverted or errored on-chain / in the provider. */
  | "failed"
  /** The user declined the signature in their wallet. */
  | "rejected"
  /** RPC endpoints are degraded; reads/writes are being retried. */
  | "rpcDegraded";

/**
 * Default, wallet-agnostic labels. Surfaces may override per-context, but these
 * are the canonical, doctrine-safe phrasings (no MetaMask-only wording, no
 * financial-return language).
 */
export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  idle: "Idle",
  checking: "Checking…",
  needsNetwork: "Switch network",
  needsApproval: "Approval required",
  approving: "Approving…",
  ready: "Ready",
  submitting: "Confirm in your wallet…",
  confirming: "Confirming on-chain…",
  success: "Confirmed",
  failed: "Failed",
  rejected: "Rejected in wallet",
  rpcDegraded: "Network degraded — retrying",
};

/** Statuses where the lifecycle has come to rest. */
export const TERMINAL_TRANSACTION_STATUSES: readonly TransactionStatus[] = [
  "success",
  "failed",
  "rejected",
];

/** Statuses where a signature or confirmation is actively in flight. */
export const IN_FLIGHT_TRANSACTION_STATUSES: readonly TransactionStatus[] = [
  "checking",
  "approving",
  "submitting",
  "confirming",
];

export function isTerminalTransactionStatus(s: TransactionStatus): boolean {
  return TERMINAL_TRANSACTION_STATUSES.includes(s);
}

export function isInFlightTransactionStatus(s: TransactionStatus): boolean {
  return IN_FLIGHT_TRANSACTION_STATUSES.includes(s);
}

export function transactionStatusLabel(s: TransactionStatus): string {
  return TRANSACTION_STATUS_LABELS[s];
}
