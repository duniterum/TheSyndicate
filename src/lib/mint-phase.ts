// Pure helpers for the MintFirstSignal state machine.
//
// Two responsibilities, kept dependency-free so they're trivially testable:
//
//  1. classifyMintError(...)
//     Turns raw wagmi error messages into a STRUCTURED error
//     { code, title, action } so the UI can render the exact reason +
//     a single actionable next step. Replaces the old string-only classifier.
//
//  2. decideMintCta(inputs)
//     Pure decision function returning the high-level CTA phase the UI
//     should be in given a snapshot of (wallet, chain, allowance, balance,
//     isMintable, mint result). Used by `MintFirstSignal` AND by the
//     mint-flow simulation test so we can guarantee the CTA never gets
//     stuck on "Approval required" once the allowance is sufficient.

export type MintErrorCode =
  | "user-rejected-approve"
  | "approve-failed"
  | "user-rejected-mint"
  | "mint-reverted"
  | "wrong-chain"
  | "insufficient-allowance"
  | "explorer-unavailable";

export type MintErrorDetail = {
  code: MintErrorCode;
  title: string;
  action: string;
};

const REJECT_RE = /user rejected|rejected request|denied|cancell?ed/i;
const REVERT_RE = /reverted|execution reverted|exception/i;
const CHAIN_RE = /chain mismatch|unsupported chain|chain ".*?" not configured/i;
const ALLOWANCE_RE = /insufficient allowance|allowance/i;

function firstLine(msg?: string) {
  return msg?.split("\n")[0]?.trim() ?? "";
}

export function classifyMintError(args: {
  approveWrite?: string;
  approveReceipt?: string;
  mintWrite?: string;
  mintReceipt?: string;
  explorerMissingForTx?: string;
}): MintErrorDetail | null {
  const { approveWrite, approveReceipt, mintWrite, mintReceipt, explorerMissingForTx } = args;

  if (approveWrite) {
    if (REJECT_RE.test(approveWrite)) {
      return {
        code: "user-rejected-approve",
        title: "Approval rejected in your wallet.",
        action: "Open your wallet and confirm the 0.50 USDC approval, then try again.",
      };
    }
    if (CHAIN_RE.test(approveWrite)) {
      return {
        code: "wrong-chain",
        title: "Wallet on the wrong network.",
        action: "Switch this wallet to Avalanche C-Chain (43114) and retry the approval.",
      };
    }
    return {
      code: "approve-failed",
      title: `Approval failed: ${firstLine(approveWrite) || "unknown error"}`,
      action: "Refresh the page, ensure you hold native Avalanche USDC, and retry the approval.",
    };
  }
  if (approveReceipt) {
    return {
      code: "approve-failed",
      title: `Approval did not confirm: ${firstLine(approveReceipt) || "unknown error"}`,
      action: "Verify the approval transaction on the explorer, then retry from your wallet.",
    };
  }
  if (mintWrite) {
    if (REJECT_RE.test(mintWrite)) {
      return {
        code: "user-rejected-mint",
        title: "Mint rejected in your wallet.",
        action: "Re-open your wallet and confirm the mint transaction, or try again.",
      };
    }
    if (ALLOWANCE_RE.test(mintWrite)) {
      return {
        code: "insufficient-allowance",
        title: "Allowance below mint price.",
        action: "Approve 0.50 USDC for the Archive contract, then retry the mint.",
      };
    }
    if (CHAIN_RE.test(mintWrite)) {
      return {
        code: "wrong-chain",
        title: "Wallet on the wrong network.",
        action: "Switch this wallet to Avalanche C-Chain (43114) and retry the mint.",
      };
    }
    return {
      code: "mint-reverted",
      title: `Mint reverted: ${firstLine(mintWrite) || "unknown error"}`,
      action: "Refresh on-chain reads. If The First Signal is still ACTIVE and remaining > 0, retry the mint.",
    };
  }
  if (mintReceipt) {
    if (REVERT_RE.test(mintReceipt)) {
      return {
        code: "mint-reverted",
        title: `Mint reverted on-chain: ${firstLine(mintReceipt) || "execution reverted"}`,
        action: "Verify wallet limit and remaining supply, refresh reads, then retry.",
      };
    }
    return {
      code: "mint-reverted",
      title: `Mint did not confirm: ${firstLine(mintReceipt) || "unknown error"}`,
      action: "Open the transaction on Routescan to inspect, then retry from your wallet.",
    };
  }
  if (explorerMissingForTx) {
    return {
      code: "explorer-unavailable",
      title: "Explorer link unavailable for this transaction.",
      action: `Search hash ${explorerMissingForTx.slice(0, 10)}… on Routescan or SnowTrace directly.`,
    };
  }
  return null;
}

// ─── CTA decision (pure) ─────────────────────────────────────────────────

export type CtaPhase =
  | "verifying"
  | "needs-wallet"
  | "wrong-chain"
  | "checking"
  | "wallet-limit"
  | "needs-usdc"
  | "needs-approval"
  | "ready"
  | "minting"
  | "confirmed";

export type CtaInputs = {
  eligibilityOk: boolean;
  isConnected: boolean;
  wrongChain: boolean;
  isMintableConnected: boolean | undefined;
  balance: bigint | undefined;
  allowance: bigint | undefined;
  required: bigint | undefined;
  mintConfirmed: boolean;
  mintInFlight: boolean;
};

export function decideMintCta(i: CtaInputs): CtaPhase {
  if (i.mintConfirmed) return "confirmed";
  if (!i.eligibilityOk) return "verifying";
  if (!i.isConnected) return "needs-wallet";
  if (i.wrongChain) return "wrong-chain";
  if (
    i.balance === undefined ||
    i.allowance === undefined ||
    i.required === undefined ||
    i.isMintableConnected === undefined
  ) {
    return "checking";
  }
  if (i.isMintableConnected === false) return "wallet-limit";
  if (i.balance < i.required) return "needs-usdc";
  if (i.allowance < i.required) return "needs-approval";
  if (i.mintInFlight) return "minting";
  return "ready";
}
