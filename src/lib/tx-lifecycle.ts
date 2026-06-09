// ─── Canonical transaction lifecycle ──────────────────────────────────────
//
// One state vocabulary for every write surface (SYN sale, Archive1155 mints,
// future SeatRecord721, claims). Components and analytics must speak this
// vocabulary instead of inventing per-flow booleans.
//
// Authority: docs/WALLET_TRANSACTION_ARCHITECTURE.md.

export type TxPhase =
  | "idle"
  | "preparing"
  | "needs-wallet"
  | "wrong-network"
  | "needs-approval"
  | "approval-pending"
  | "approval-confirmed"
  | "ready"
  | "tx-pending"
  | "tx-confirmed"
  | "failed"
  | "rejected";

export interface TxLifecycle {
  phase: TxPhase;
  approveHash?: `0x${string}`;
  txHash?: `0x${string}`;
  /** Mapped, user-friendly error message; null when no error. */
  error: string | null;
  /** True when a retry is meaningful (failed/rejected, not pending). */
  retryable: boolean;
}

export const TX_PHASE_LABEL: Record<TxPhase, string> = {
  idle: "Ready",
  preparing: "Preparing",
  "needs-wallet": "Connect a wallet",
  "wrong-network": "Switch to Avalanche",
  "needs-approval": "USDC approval required",
  "approval-pending": "Approving USDC…",
  "approval-confirmed": "USDC approved",
  ready: "Ready to submit",
  "tx-pending": "Transaction pending…",
  "tx-confirmed": "Confirmed",
  failed: "Transaction failed",
  rejected: "Cancelled by user",
};

export const RETRYABLE_PHASES = new Set<TxPhase>(["failed", "rejected"]);

export function isPendingPhase(phase: TxPhase): boolean {
  return phase === "approval-pending" || phase === "tx-pending" || phase === "preparing";
}

export function isTerminalPhase(phase: TxPhase): boolean {
  return phase === "tx-confirmed" || phase === "failed" || phase === "rejected";
}

/**
 * Compose a TxLifecycle from primitive booleans/hashes/errors. This is the
 * single mapping every component should use, so phase semantics never drift
 * between flows.
 */
export function deriveLifecycle(input: {
  hasWallet: boolean;
  wrongNetwork: boolean;
  needsApproval: boolean;
  approvalPending: boolean;
  approvalConfirmed: boolean;
  txPending: boolean;
  txConfirmed: boolean;
  approveHash?: `0x${string}`;
  txHash?: `0x${string}`;
  error?: string | null;
  rejected?: boolean;
}): TxLifecycle {
  const error = input.error ?? null;
  let phase: TxPhase = "idle";

  if (input.txConfirmed) phase = "tx-confirmed";
  else if (input.txPending) phase = "tx-pending";
  else if (input.rejected) phase = "rejected";
  else if (error) phase = "failed";
  else if (!input.hasWallet) phase = "needs-wallet";
  else if (input.wrongNetwork) phase = "wrong-network";
  else if (input.approvalPending) phase = "approval-pending";
  else if (input.needsApproval) phase = "needs-approval";
  else if (input.approvalConfirmed) phase = "approval-confirmed";
  else phase = "ready";

  return {
    phase,
    approveHash: input.approveHash,
    txHash: input.txHash,
    error,
    retryable: RETRYABLE_PHASES.has(phase),
  };
}
