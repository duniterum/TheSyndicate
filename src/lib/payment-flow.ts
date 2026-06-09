// ─── Canonical USDC payment flow primitives ───────────────────────────────
//
// Standardizes the approve → wait → action → wait → refetch shape for every
// USDC-denominated purchase (SYN sale, First Signal, Patron Seal, future
// public Archive1155 mints). Components compose these primitives instead of
// re-implementing balance/allowance arithmetic per flow.
//
// This file is pure — no React, no wagmi imports — so it is trivially
// testable and reusable on server (e.g. OG renderers).
//
// Authority: docs/WALLET_TRANSACTION_ARCHITECTURE.md §C.

export interface PaymentInputs {
  /** Current USDC balance (6-decimal raw units). */
  balance: bigint | undefined;
  /** Current USDC allowance for the spender (6-decimal raw units). */
  allowance: bigint | undefined;
  /** Required USDC for the action (6-decimal raw units). */
  required: bigint;
}

export interface PaymentReadiness {
  hasBalanceData: boolean;
  hasAllowanceData: boolean;
  sufficientBalance: boolean;
  sufficientAllowance: boolean;
  /** True when approve must be called before the action. */
  needsApproval: boolean;
  /** Amount of USDC the user is missing (0 when sufficient). */
  missingUsdc: bigint;
  /** Amount of additional USDC allowance required (0 when sufficient). */
  missingAllowance: bigint;
}

export function assessPayment({ balance, allowance, required }: PaymentInputs): PaymentReadiness {
  const hasBalance = balance !== undefined;
  const hasAllowance = allowance !== undefined;
  const sufficientBalance = hasBalance && balance! >= required;
  const sufficientAllowance = hasAllowance && allowance! >= required;
  return {
    hasBalanceData: hasBalance,
    hasAllowanceData: hasAllowance,
    sufficientBalance,
    sufficientAllowance,
    needsApproval: hasAllowance && !sufficientAllowance,
    missingUsdc: sufficientBalance || !hasBalance ? 0n : required - balance!,
    missingAllowance: sufficientAllowance || !hasAllowance ? 0n : required - allowance!,
  };
}

/** Exact-allowance approve amount. We deliberately approve the exact required
 *  amount per purchase rather than infinite/max-uint to keep risk surface low. */
export function exactApprovalAmount(required: bigint): bigint {
  return required;
}

/** Format a 6-decimal USDC raw amount for display. */
export function formatUsdc(raw: bigint | undefined, fractionDigits = 2): string {
  if (raw === undefined) return "—";
  const whole = raw / 1_000_000n;
  const frac = raw % 1_000_000n;
  const fracStr = frac.toString().padStart(6, "0").slice(0, fractionDigits);
  return fractionDigits > 0 ? `${whole}.${fracStr}` : `${whole}`;
}
