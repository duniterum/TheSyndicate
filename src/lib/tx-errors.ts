// ─── Canonical wallet/payment/transaction error classifier ────────────────
//
// Every flow must map raw wallet/RPC errors through `classifyTxError` so the
// UI shows the same human-readable message regardless of which write surface
// produced it (SYN buy, First Signal, Patron Seal, future contracts).
//
// Never render `error.message` directly as the primary copy — wallet
// stack traces are cryptic and leak internals. Use the classified label
// and offer the raw message under a "Details" disclosure if needed.
//
// Authority: docs/WALLET_TRANSACTION_ARCHITECTURE.md §G.

export type TxErrorKind =
  | "user-rejected-approval"
  | "user-rejected-tx"
  | "insufficient-usdc"
  | "insufficient-gas"
  | "wrong-network"
  | "allowance-too-low"
  | "contract-paused"
  | "sold-out"
  | "wallet-limit-reached"
  | "not-active"
  | "not-eligible"
  | "rpc-error"
  | "explorer-unavailable"
  | "tx-stalled"
  | "tx-reverted"
  | "unknown";

export interface ClassifiedTxError {
  kind: TxErrorKind;
  /** Short headline shown as the primary UI copy. */
  title: string;
  /** Sentence-long actionable explanation. */
  message: string;
  /** True when retrying the same action makes sense. */
  retryable: boolean;
}

const LABELS: Record<TxErrorKind, Omit<ClassifiedTxError, "kind">> = {
  "user-rejected-approval": {
    title: "Approval cancelled",
    message: "You cancelled the USDC approval in your wallet. Approve again to continue.",
    retryable: true,
  },
  "user-rejected-tx": {
    title: "Transaction cancelled",
    message: "You cancelled the transaction in your wallet. You can try again whenever you're ready.",
    retryable: true,
  },
  "insufficient-usdc": {
    title: "Not enough USDC",
    message: "Your wallet doesn't have enough USDC to complete this purchase.",
    retryable: false,
  },
  "insufficient-gas": {
    title: "Not enough AVAX for gas",
    message: "Your wallet needs a small amount of AVAX to pay network fees.",
    retryable: false,
  },
  "wrong-network": {
    title: "Wrong network",
    message: "Switch your wallet to Avalanche C-Chain to continue.",
    retryable: true,
  },
  "allowance-too-low": {
    title: "USDC allowance too low",
    message: "Approve enough USDC for this purchase, then try again.",
    retryable: true,
  },
  "contract-paused": {
    title: "Sale paused",
    message: "This sale is temporarily paused on-chain. Try again later.",
    retryable: true,
  },
  "sold-out": {
    title: "Sold out",
    message: "All units have been minted. No further mints are possible.",
    retryable: false,
  },
  "wallet-limit-reached": {
    title: "Per-wallet limit reached",
    message: "Your wallet has already reached the per-wallet maximum for this artifact.",
    retryable: false,
  },
  "not-active": {
    title: "Not active",
    message: "This sale is not active on-chain right now.",
    retryable: false,
  },
  "not-eligible": {
    title: "Not eligible",
    message: "This wallet is not on the eligible list for this mint.",
    retryable: false,
  },
  "rpc-error": {
    title: "Network error",
    message: "The Avalanche RPC didn't respond. Check your connection and try again.",
    retryable: true,
  },
  "explorer-unavailable": {
    title: "Explorer unavailable",
    message: "We couldn't open the block explorer. Your transaction is unaffected.",
    retryable: true,
  },
  "tx-stalled": {
    title: "Still pending",
    message: "Your transaction is taking longer than expected to confirm. It will resolve on-chain shortly.",
    retryable: false,
  },
  "tx-reverted": {
    title: "Transaction reverted",
    message: "The transaction was submitted but reverted on-chain. No funds were moved beyond gas.",
    retryable: true,
  },
  unknown: {
    title: "Something went wrong",
    message: "Something unexpected happened. Please try again, or reach out if it keeps happening.",
    retryable: true,
  },
};

export function classifyTxError(err: unknown): ClassifiedTxError {
  const kind = detectKind(err);
  return { kind, ...LABELS[kind] };
}

function detectKind(err: unknown): TxErrorKind {
  if (!err) return "unknown";
  const raw = readMessage(err).toLowerCase();
  const code = readCode(err);

  if (code === 4001 || raw.includes("user rejected") || raw.includes("user denied")) {
    return raw.includes("approve") || raw.includes("approval")
      ? "user-rejected-approval"
      : "user-rejected-tx";
  }
  if (raw.includes("insufficient funds for gas") || raw.includes("insufficient funds for intrinsic")) {
    return "insufficient-gas";
  }
  if (raw.includes("insufficient") && (raw.includes("usdc") || raw.includes("balance"))) {
    return "insufficient-usdc";
  }
  if (raw.includes("allowance") || raw.includes("erc20: insufficient allowance")) {
    return "allowance-too-low";
  }
  if (raw.includes("paused")) return "contract-paused";
  if (raw.includes("sold out") || raw.includes("max supply") || raw.includes("supply exceeded")) {
    return "sold-out";
  }
  if (raw.includes("per-wallet") || raw.includes("wallet limit") || raw.includes("wallet cap")) {
    return "wallet-limit-reached";
  }
  if (raw.includes("not active") || raw.includes("sale inactive")) return "not-active";
  if (raw.includes("not eligible") || raw.includes("not on allowlist")) return "not-eligible";
  if (raw.includes("wrong network") || raw.includes("chain mismatch") || raw.includes("unsupported chain")) {
    return "wrong-network";
  }
  if (raw.includes("reverted") || raw.includes("execution reverted")) return "tx-reverted";
  if (raw.includes("timeout") || raw.includes("timed out")) return "tx-stalled";
  if (raw.includes("network") || raw.includes("fetch") || raw.includes("rpc")) return "rpc-error";

  return "unknown";
}

function readMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const obj = err as { message?: unknown; shortMessage?: unknown; details?: unknown; cause?: unknown };
    if (typeof obj.shortMessage === "string") return obj.shortMessage;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.details === "string") return obj.details;
    if (obj.cause) return readMessage(obj.cause);
  }
  return String(err);
}

function readCode(err: unknown): number | undefined {
  if (err && typeof err === "object" && "code" in err) {
    const c = (err as { code?: unknown }).code;
    if (typeof c === "number") return c;
  }
  return undefined;
}
