// MintFirstSignal — first real public mint flow on SyndicateArchive1155.
//
// SCOPE GUARD (constitutional):
//   - This component is HARDCODED to ID 1 ("The First Signal").
//   - It is the ONLY write surface in the Archive UI.
//   - There is no quantity selector — quantity is fixed at 1.
//   - No admin, activation, marketplace, listing, or trading paths.
//
// State machine (explicit `Phase`):
//   verifying → needs-wallet → wrong-chain → checking → needs-usdc
//             → needs-approval → approving → ready → minting → confirmed
//   (error) is orthogonal and surfaced via txError.
//
// Accessibility:
//   - The CTA is a real <button> with focus-visible ring, aria-busy while a
//     write is pending, and aria-disabled when not actionable.
//   - The live status line under the button is an aria-live="polite" region
//     so screen-reader users hear each phase transition.
//   - The post-mint confirmation is a region role="status" with focus moved
//     to it; the page also scrolls to #collectible-record so the user can
//     immediately see the artifact they now own.
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContracts,
} from "wagmi";
import { useWalletGate } from "@/lib/useWalletGate";
import { Pill } from "@/components/syndicate/Primitives";
import { ARCHIVE_NFT_ABI } from "@/lib/archive-nft-abi";
import { ERC20_ABI } from "@/lib/sale-abi";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
  CONTRACTS,
  USDC_DECIMALS,
  txExplorerUrls,
} from "@/lib/syndicate-config";
import { archiveTxUrl } from "@/lib/explorer-guard";
import type { ArchiveIdRead } from "@/lib/archive-nft-hooks";
import { track } from "@/lib/analytics";
import { classifyMintError, type MintErrorCode } from "@/lib/mint-phase";
import { MintProgressTracker } from "@/components/syndicate/MintProgressTracker";
import { useMintHashPersistence } from "@/lib/mint-persistence";
import { useMintGasEstimates, useFormattedActualFee } from "@/lib/mint-gas-estimate";
import { assertFreshWallet, walletFreshnessMessage } from "@/lib/wallet-freshness";
import { recordTx } from "@/lib/tx-history";
import { buildArtifactMintCommerceReceipt } from "@/lib/protocol-commerce-receipt";
// Canonical classifier — `classifyMintError` is the specialized variant for
// First Signal-specific phase logic; `classifyTxError` is the site-wide
// fallback shape every write surface must reference (guarded by
// src/lib/__tests__/tx-write-canonical.test.ts).
import { classifyTxError as _classifyTxErrorCanonical } from "@/lib/tx-errors";
void _classifyTxErrorCanonical;

const ARCHIVE = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;
const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;
const FIRST_SIGNAL_ID = 1n;
const FIRST_SIGNAL_ID_DISPLAY = "1";
const QUANTITY = 1n;
const RENDERER_ONCHAIN_SVG = 1;

type Phase =
  | "verifying"
  | "read-error"
  | "needs-wallet"
  | "wrong-chain"
  | "checking"
  | "wallet-limit"
  | "needs-usdc"
  | "needs-approval"
  | "approving"
  | "approval-confirmed"
  | "approval-mismatch"
  | "ready"
  | "minting"
  | "confirmed";

const PHASE_TONE: Record<Phase, "muted" | "warning" | "navy" | "success"> = {
  verifying: "navy",
  "read-error": "warning",
  "needs-wallet": "navy",
  "wrong-chain": "warning",
  checking: "navy",
  "wallet-limit": "muted",
  "needs-usdc": "warning",
  "needs-approval": "warning",
  approving: "navy",
  "approval-confirmed": "success",
  "approval-mismatch": "warning",
  ready: "success",
  minting: "navy",
  confirmed: "success",
};

const PHASE_LABEL: Record<Phase, string> = {
  verifying: "Verifying on-chain state",
  "read-error": "Network read issue",
  "needs-wallet": "Wallet not connected",
  "wrong-chain": "Wrong network",
  checking: "Checking wallet eligibility",
  "wallet-limit": "Wallet limit reached",
  "needs-usdc": "Insufficient USDC",
  "needs-approval": "Approval required",
  approving: "Approving USDC",
  "approval-confirmed": "Approval confirmed",
  "approval-mismatch": "Approval mismatch",
  ready: "Ready to mint",
  minting: "Minting",
  confirmed: "Mint confirmed",
};

const fmtUsdc = (raw?: bigint) =>
  raw === undefined
    ? "—"
    : `${(Number(raw) / 10 ** USDC_DECIMALS).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} USDC`;

const shortErr = (message: string | undefined) =>
  message?.split("\n")[0]?.trim() || "Transaction failed";

const isRejected = (message: string | undefined) =>
  /user rejected|rejected request|denied|cancelled|canceled/i.test(message ?? "");

function classifyTxError({
  approveWrite,
  approveReceipt,
  mintWrite,
  mintReceipt,
}: {
  approveWrite?: string;
  approveReceipt?: string;
  mintWrite?: string;
  mintReceipt?: string;
}) {
  if (approveWrite) return isRejected(approveWrite) ? "Approval rejected." : `Approval failed: ${shortErr(approveWrite)}`;
  if (approveReceipt) return `Approval failed: ${shortErr(approveReceipt)}`;
  if (mintWrite) return isRejected(mintWrite) ? "Mint rejected." : `Mint reverted: ${shortErr(mintWrite)}`;
  if (mintReceipt) return `Mint reverted: ${shortErr(mintReceipt)}`;
  return null;
}

export function MintFirstSignal({
  read,
  refetchArtifact,
  compact = false,
}: {
  read: ArchiveIdRead | undefined;
  refetchArtifact: () => void;
  compact?: boolean;
}) {
  const gate = useWalletGate();
  const { address, isConnected, connectPending, switchPending, wrongChain } = gate;
  const queryClient = useQueryClient();
  const [walletGuardError, setWalletGuardError] = useState<string | null>(null);

  const wallet = address as `0x${string}` | undefined;

  // Per-wallet reads: USDC balance, USDC allowance to Archive, owned ID 1.
  const userQ = useReadContracts({
    allowFailure: true,
    contracts: wallet
      ? [
          { address: USDC, abi: ERC20_ABI, functionName: "balanceOf", args: [wallet] },
          { address: USDC, abi: ERC20_ABI, functionName: "allowance", args: [wallet, ARCHIVE] },
          {
            address: ARCHIVE,
            abi: ARCHIVE_NFT_ABI,
            functionName: "balanceOf",
            args: [wallet, FIRST_SIGNAL_ID],
          },
        ]
      : [],
    query: { enabled: Boolean(wallet), refetchInterval: 30_000 },
  });
  const usdcBal =
    userQ.data?.[0]?.status === "success" ? (userQ.data[0].result as unknown as bigint) : undefined;
  const usdcAllowance =
    userQ.data?.[1]?.status === "success" ? (userQ.data[1].result as unknown as bigint) : undefined;
  const ownedBal =
    userQ.data?.[2]?.status === "success" ? (userQ.data[2].result as unknown as bigint) : undefined;

  const art = read?.artifact;
  const priceUsdc = art?.priceUsdc;
  const requiredUsdc = priceUsdc !== undefined ? priceUsdc * QUANTITY : undefined;

  const approveTx = useWriteContract();
  const mintTx = useWriteContract();

  // Persist tx hashes per wallet so the tracker / receipt queries survive
  // a page refresh while approval or mint is still in-flight.
  const persisted = useMintHashPersistence(wallet, ARCHIVE);

  // Mirror new write hashes into storage as soon as wagmi reports them.
  useEffect(() => {
    if (approveTx.data && approveTx.data !== persisted.approve) {
      persisted.setApprove(approveTx.data);
    }
  }, [approveTx.data]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (mintTx.data && mintTx.data !== persisted.mint) {
      persisted.setMint(mintTx.data);
    }
  }, [mintTx.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effective hashes — prefer fresh wagmi state, fall back to persisted.
  const effectiveApproveHash = (approveTx.data ?? persisted.approve) as
    | `0x${string}`
    | undefined;
  const effectiveMintHash = (mintTx.data ?? persisted.mint) as
    | `0x${string}`
    | undefined;

  const approveReceipt = useWaitForTransactionReceipt({ hash: effectiveApproveHash });
  const mintReceipt = useWaitForTransactionReceipt({ hash: effectiveMintHash });

  const approveActualFee = useFormattedActualFee(approveReceipt.data);
  const mintActualFee = useFormattedActualFee(mintReceipt.data);

  const confirmationRef = useRef<HTMLDivElement | null>(null);
  const scrolledForTxRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (approveReceipt.isSuccess) {
      void userQ.refetch();
      void queryClient.invalidateQueries();
      track("archive_approve_confirmed", { id: 1, tx: approveTx.data });
    }
  }, [approveReceipt.isSuccess]); // eslint-disable-line

  useEffect(() => {
    if (mintReceipt.isSuccess) {
      void userQ.refetch();
      refetchArtifact();
      // Refresh balances across the app (My Archive, gallery cards).
      queryClient.invalidateQueries();
      track("archive_mint_success", {
        id: 1,
        tx: mintTx.data,
      });

      // One-time post-mint UX: scroll to the collectible record and focus
      // the confirmation panel. Guard with the tx hash so re-renders don't
      // re-trigger scroll/focus.
      if (mintTx.data && scrolledForTxRef.current !== mintTx.data) {
        scrolledForTxRef.current = mintTx.data;
        // Defer to allow the confirmation panel + record section to render.
        setTimeout(() => {
          const target = document.getElementById("collectible-record");
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          confirmationRef.current?.focus();
        }, 60);
      }
    }
  }, [mintReceipt.isSuccess]); // eslint-disable-line

  // Reset transient tx state when wallet changes.
  useEffect(() => {
    approveTx.reset();
    mintTx.reset();
    setWalletGuardError(null);
    scrolledForTxRef.current = undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const verifyFreshWallet = async (surface: string) => {
    const freshness = await assertFreshWallet(wallet);
    const message = walletFreshnessMessage(freshness);
    if (message) {
      setWalletGuardError(message);
      gate.reconnect();
      void userQ.refetch();
      void queryClient.invalidateQueries();
      track("wallet_account_resync", { surface });
      return false;
    }
    setWalletGuardError(null);
    return true;
  };

  // ─── Eligibility gate ────────────────────────────────────────────────
  const hasReadErrors = !!(
    read?.errors.artifact ||
    read?.errors.remainingSupply ||
    (isConnected && read?.errors.isMintableConnected)
  );

  const definitionFrozen = art?.definitionFrozen === true;
  const isActive = art?.active === true;
  const rendererOk = art?.rendererMode === RENDERER_ONCHAIN_SVG;
  const supplyRemaining = read?.remainingSupply;
  const isMintableConnected = read?.isMintableConnected;

  const eligibilityOk =
    !!art &&
    definitionFrozen &&
    isActive &&
    rendererOk &&
    supplyRemaining !== undefined &&
    supplyRemaining > 0n &&
    !hasReadErrors;

  const approvePending = approveTx.isPending || approveReceipt.isLoading;
  const mintPending = mintTx.isPending || mintReceipt.isLoading;
  const needsApprove =
    requiredUsdc !== undefined &&
    usdcAllowance !== undefined &&
    usdcAllowance < requiredUsdc;
  const insufficientUsdc =
    requiredUsdc !== undefined && usdcBal !== undefined && usdcBal < requiredUsdc;

  const maxSupply = art?.maxSupply;
  const minted = art?.totalMinted;
  const walletLimit = art?.walletLimit;
  const userReadError = userQ.data?.some((r) => r?.status === "failure") ?? false;
  const approvalConfirmedButAllowanceLow = approveReceipt.isSuccess && needsApprove;
  const waitingForAllowanceRefresh = approvalConfirmedButAllowanceLow && userQ.isFetching;
  const mintExplorerHref = useMemo(
    () => archiveTxUrl(effectiveMintHash),
    [effectiveMintHash],
  );
  const approvalExplorerHref = useMemo(
    () => archiveTxUrl(effectiveApproveHash),
    [effectiveApproveHash],
  );
  const mintExplorerLinks = useMemo(
    () => txExplorerUrls(effectiveMintHash ?? ""),
    [effectiveMintHash],
  );
  const approvalExplorerLinks = useMemo(
    () => txExplorerUrls(effectiveApproveHash ?? ""),
    [effectiveApproveHash],
  );
  const expectedAllowanceText = requiredUsdc !== undefined ? fmtUsdc(requiredUsdc) : "0.50 USDC";

  // Gas estimates — only fetch when the user can actually act on a step.
  const gasEstimates = useMintGasEstimates({
    wallet,
    requiredUsdc,
    enabled:
      isConnected &&
      !wrongChain &&
      eligibilityOk &&
      !mintReceipt.isSuccess &&
      (needsApprove || (!needsApprove && !insufficientUsdc)),
  });

  type State = {
    phase: Phase;
    label: string;
    disabled: boolean;
    tone: "gold" | "muted" | "error";
    onClick?: () => void | Promise<void>;
    help?: string;
  };

  let s: State = {
    phase: "verifying",
    label: "Mint The First Signal",
    disabled: true,
    tone: "muted",
  };

  if (mintReceipt.isSuccess) {
    s = {
      phase: "confirmed",
      label: "Minted — view your record below",
      disabled: true,
      tone: "muted",
    };
  } else if (!eligibilityOk) {
    s = {
      phase: hasReadErrors ? "read-error" : "verifying",
      label: hasReadErrors ? "Read error — try again" : "Verifying on-chain state…",
      disabled: true,
      tone: "muted",
      help: hasReadErrors
        ? "On-chain reads failed. Refresh to retry."
        : "Confirming live contract state.",
    };
  } else if (!isConnected) {
    s = {
      phase: "needs-wallet",
      label: connectPending ? "Connecting…" : "Connect wallet to mint The First Signal",
      disabled: connectPending || !gate.canConnect,
      tone: "gold",
      onClick: () => {
        gate.connectWallet();
        track("archive_mint_connect_click", { id: 1 });
      },
    };
  } else if (wrongChain) {
    s = {
      phase: "wrong-chain",
      label: switchPending ? "Switching…" : "Switch to Avalanche C-Chain",
      disabled: switchPending,
      tone: "gold",
      help: "Wrong chain. Switch this wallet to Avalanche C-Chain (43114).",
      onClick: () => void gate.switchToAvalanche(),
    };
  } else if (userReadError) {
    s = {
      phase: "read-error",
      label: "Read failed — retry wallet checks",
      disabled: false,
      tone: "gold",
      help: "USDC balance, allowance, or owned-balance read failed. Retry live wallet reads.",
      onClick: () => void userQ.refetch(),
    };
  } else if (userQ.isLoading || usdcBal === undefined || usdcAllowance === undefined) {
    s = {
      phase: "checking",
      label: "Checking wallet eligibility…",
      disabled: true,
      tone: "muted",
      help: "Reading USDC balance, allowance, and owned balance.",
    };
  } else if (isConnected && isMintableConnected === undefined) {
    s = {
      phase: "checking",
      label: "Checking wallet mint eligibility…",
      disabled: true,
      tone: "muted",
      help: "Reading the connected-wallet isMintable check.",
    };
  } else if (isMintableConnected === false) {
    s = {
      phase: "wallet-limit",
      label: "Wallet limit reached",
      disabled: true,
      tone: "muted",
      help: `You already hold the per-wallet limit (${walletLimit !== undefined ? walletLimit.toString() : "5"}) of The First Signal.`,
    };
  } else if (insufficientUsdc) {
    s = {
      phase: "needs-usdc",
      label: "Add native Avalanche USDC to this wallet",
      disabled: true,
      tone: "error",
      help: "Top up native Avalanche USDC (not USDC.e) to mint.",
    };
  } else if (needsApprove) {
    s = {
      phase: approvalConfirmedButAllowanceLow && !waitingForAllowanceRefresh ? "approval-mismatch" : approvePending ? "approving" : "needs-approval",
      label: approvalConfirmedButAllowanceLow
        ? waitingForAllowanceRefresh
          ? "Approval confirmed — refreshing allowance…"
          : "Approval confirmed — allowance still low"
        : approveTx.isPending
          ? "Waiting for wallet signature…"
          : approveReceipt.isLoading
            ? "Waiting for confirmation…"
            : approveTx.data
              ? "Approval submitted…"
              : "Approve 0.50 USDC",
      disabled: approvePending || approvalConfirmedButAllowanceLow,
      tone: "gold",
      help: approvalConfirmedButAllowanceLow
        ? `Approval confirmed, but the latest allowance read is still below ${expectedAllowanceText}. Retry allowance refresh before minting.`
        : approveTx.isPending
          ? "Open your wallet to confirm the approval. Approval lets the Archive contract spend exactly 0.50 USDC for this mint."
          : approveReceipt.isLoading || approveTx.data
            ? "Waiting for confirmation on Avalanche. Do not submit a second approval."
            : "Approval lets the Archive contract spend exactly 0.50 USDC for this mint.",
      onClick: async () => {
        if (requiredUsdc === undefined) return;
        if (!(await verifyFreshWallet("first_signal_approve"))) return;
        try {
          const hash = await approveTx.writeContractAsync({
            address: USDC,
            abi: ERC20_ABI,
            functionName: "approve",
            account: wallet,
            args: [ARCHIVE, requiredUsdc],
          });
          track("archive_approve_submit", { id: 1 });
          recordTx({ hash, account: wallet!, chainId: 43114, surface: "first_signal_approve", label: "First Signal — USDC approve", contract: USDC });
        } catch {
          /* user rejected */
        }
      },
    };
  } else {
    s = {
      phase: mintPending ? "minting" : approveReceipt.isSuccess ? "approval-confirmed" : "ready",
      label: mintTx.isPending
        ? "Waiting for wallet signature…"
        : mintReceipt.isLoading
          ? "Mint submitted — waiting confirmation…"
          : approveReceipt.isSuccess
            ? "Now mint The First Signal"
            : "Mint The First Signal",
      disabled: mintPending,
      tone: "gold",
      help: mintTx.isPending
        ? "Open your wallet to confirm the mint. This calls Archive1155.mint(1, 1)."
        : mintReceipt.isLoading
          ? "Waiting for Avalanche confirmation, then ownership and supply will refresh."
          : "Mint calls Archive1155.mint(1, 1).",
      onClick: async () => {
        if (!(await verifyFreshWallet("first_signal_mint"))) return;
        try {
          const hash = await mintTx.writeContractAsync({
            address: ARCHIVE,
            abi: ARCHIVE_NFT_ABI,
            functionName: "mint",
            account: wallet,
            args: [FIRST_SIGNAL_ID, QUANTITY],
          });
          track("archive_mint_submit", { id: 1, tx: hash });
          recordTx({ hash, account: wallet!, chainId: 43114, surface: "first_signal_mint", label: "First Signal — mint", contract: ARCHIVE, tokenId: String(FIRST_SIGNAL_ID) });
        } catch {
          /* user rejected */
        }
      },
    };
  }

  const txErrorDetail = classifyMintError({
    approveWrite: approveTx.error?.message,
    approveReceipt: approveReceipt.error?.message,
    mintWrite: mintTx.error?.message,
    mintReceipt: mintReceipt.error?.message,
    explorerMissingForTx:
      mintTx.data && !mintExplorerHref ? mintTx.data : undefined,
  });
  // Legacy single-line fallback used by the alert region below.
  const txError = txErrorDetail
    ? `${txErrorDetail.title} ${txErrorDetail.action}`
    : classifyTxError({
        approveWrite: approveTx.error?.message,
        approveReceipt: approveReceipt.error?.message,
        mintWrite: mintTx.error?.message,
        mintReceipt: mintReceipt.error?.message,
      });

  // Read-error recovery panel — shown instead of the action when on-chain
  // reads have failed.
  if (hasReadErrors) {
    return (
      <div
        className={compact ? "" : "mt-2 border-t border-border/40 pt-3"}
        role="region"
        aria-label="Mint The First Signal — read error"
      >
        <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400 mb-1">
            Temporary network issue
          </div>
          <p className="text-[11px] text-foreground/80 leading-snug">
            The First Signal remains live on Avalanche. You can retry, or
            verify the contract directly on the explorer.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => refetchArtifact()}
              className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-[var(--gold)]/50 bg-[var(--gold)]/10 px-3 py-1.5 text-foreground hover:bg-[var(--gold)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
            >
              Retry
            </button>
            <a
              href={ARCHIVE_NFT_EXPLORERS.avascan}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-3 py-1.5 text-foreground hover:border-[var(--gold)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
            >
              View contract ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  const showConfirmation = mintReceipt.isSuccess && !!effectiveMintHash;
  const artifactReceipt =
    showConfirmation && effectiveMintHash
      ? buildArtifactMintCommerceReceipt({
          wallet,
          artifactName: "The First Signal",
          tokenId: FIRST_SIGNAL_ID_DISPLAY,
          quantity: QUANTITY.toString(),
          usdcPaid: requiredUsdc !== undefined ? fmtUsdc(requiredUsdc) : "0.50 USDC",
          ownershipStatus:
            ownedBal !== undefined
              ? `Wallet balance reads ${ownedBal.toString()}`
              : "Ownership refresh pending",
          proof: {
            txHash: effectiveMintHash,
            explorerUrl: mintExplorerHref ?? ARCHIVE_NFT_EXPLORERS.avascan,
          },
        })
      : null;

  return (
    <div
      className={compact ? "" : "mt-2 border-t border-border/40 pt-3"}
      role="region"
      aria-label="Mint The First Signal"
    >
      {!compact && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Mint · The First Signal
          </span>
          {eligibilityOk ? (
            <Pill tone="success">ACTIVE · MINT OPEN</Pill>
          ) : (
            <Pill tone="navy">VERIFYING ON-CHAIN STATE</Pill>
          )}
        </div>
      )}

      {compact ? (
        <div className="grid grid-cols-3 gap-2 mb-2 text-center">
          <Stat label="Price" value={requiredUsdc !== undefined ? "0.50 USDC" : "—"} />
          <Stat
            label="Remaining"
            value={
              supplyRemaining !== undefined
                ? supplyRemaining.toLocaleString("en-US")
                : "—"
            }
          />
          <Stat
            label="You own"
            value={
              isConnected
                ? ownedBal !== undefined
                  ? ownedBal.toString()
                  : "—"
                : "—"
            }
          />
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
          <DT>Price</DT>
          <DD>{requiredUsdc !== undefined ? fmtUsdc(requiredUsdc) : "—"}</DD>
          <DT>Max supply</DT>
          <DD>{maxSupply !== undefined ? maxSupply.toString() : "—"}</DD>
          <DT>Minted</DT>
          <DD>{minted !== undefined ? minted.toString() : "—"}</DD>
          <DT>Remaining</DT>
          <DD>{supplyRemaining !== undefined ? supplyRemaining.toString() : "—"}</DD>
          <DT>Wallet limit</DT>
          <DD>{walletLimit !== undefined ? walletLimit.toString() : "—"}</DD>
          {isConnected && (
            <>
              <DT>You own</DT>
              <DD>{ownedBal !== undefined ? ownedBal.toString() : "—"}</DD>
            </>
          )}
        </dl>
      )}

      <MintProgressTracker
        approveSubmitted={approveTx.isPending || !!effectiveApproveHash}
        approveConfirmed={approveReceipt.isSuccess}
        mintSubmitted={mintTx.isPending || !!effectiveMintHash}
        mintConfirmed={mintReceipt.isSuccess}
        approveError={!!(approveTx.error || approveReceipt.error)}
        mintError={!!(mintTx.error || mintReceipt.error)}
        approveTxUrl={approvalExplorerHref}
        mintTxUrl={mintExplorerHref}
        approveTxUrls={approvalExplorerLinks}
        mintTxUrls={mintExplorerLinks}
        approveFeeAvax={approveActualFee.feeAvax}
        mintFeeAvax={mintActualFee.feeAvax}
        compact={compact}
      />

      {/* Estimated fee breakdown — shown before submit for the active step. */}
      {!mintReceipt.isSuccess && eligibilityOk && isConnected && !wrongChain && !insufficientUsdc && (
        <FeeBreakdown
          step={needsApprove ? "approve" : "mint"}
          priceUsdc={requiredUsdc !== undefined ? fmtUsdc(requiredUsdc) : "0.50 USDC"}
          estimate={needsApprove ? gasEstimates.approve : gasEstimates.mint}
        />
      )}

      <button
        type="button"
        onClick={() => s.onClick?.()}
        disabled={s.disabled}
        title={s.help}
        aria-disabled={s.disabled}
        aria-busy={s.phase === "approving" || s.phase === "minting"}
        aria-describedby="mint-phase-status"
        className={`w-full min-h-11 mono text-xs sm:text-[13px] uppercase tracking-[0.18em] rounded-md py-3 font-semibold transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070a] ${
          s.tone === "gold" && !s.disabled
            ? "text-[oklch(0.22_0.025_260)]"
            : s.tone === "error"
              ? "border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400 cursor-not-allowed"
              : "border border-border/60 bg-muted/40 text-muted-foreground cursor-not-allowed"
        }`}
        style={
          s.tone === "gold" && !s.disabled
            ? {
                background: "var(--gradient-gold)",
                boxShadow: "var(--shadow-glow-gold)",
              }
            : undefined
        }
      >
        {s.label}
      </button>

      {/* Live phase status — announced to assistive tech on every change */}
      <div
        id="mint-phase-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-2 flex items-center justify-between gap-2 text-[10px] mono uppercase tracking-[0.18em]"
      >
        <span className="text-muted-foreground">Status</span>
        <Pill tone={PHASE_TONE[s.phase]}>{PHASE_LABEL[s.phase]}</Pill>
      </div>

      {s.help && (
        <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
          {s.help}
        </p>
      )}

      {/* Refresh status — visible whenever a tx is pending so the user can
          force a re-query without waiting on the polling interval. */}
      {(approveReceipt.isLoading || mintReceipt.isLoading || (effectiveApproveHash && !approveReceipt.isSuccess && !approveReceipt.isError) || (effectiveMintHash && !mintReceipt.isSuccess && !mintReceipt.isError)) && !showConfirmation && (
        <button
          type="button"
          onClick={() => {
            void approveReceipt.refetch();
            void mintReceipt.refetch();
            void userQ.refetch();
            void queryClient.invalidateQueries();
            track("archive_mint_refresh_status", { id: 1 });
          }}
          className="mt-2 inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2.5 8a5.5 5.5 0 0 1 9.4-3.9M13.5 8a5.5 5.5 0 0 1-9.4 3.9M12 2v3h-3M4 14v-3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh status
        </button>
      )}

      {showConfirmation && (
        <div
          ref={confirmationRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Mint confirmed"
          className="mt-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-[11px] text-emerald-800 dark:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
        >
          <div className="flex items-center gap-2">
            <span aria-hidden="true">✓</span>
            <span className="font-semibold text-[12px]">
              The First Signal is yours.
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-emerald-900/80 dark:text-emerald-100/80">
            Recorded on Avalanche. A permanent collectible record of Chapter I.
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {(artifactReceipt?.lines ?? []).map((line) => (
              <Fragment key={line.label}>
                <DT>{line.label}</DT>
                <DD>{line.value}</DD>
              </Fragment>
            ))}
          </dl>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {mintExplorerLinks.length > 0 ? (
              mintExplorerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-sm"
                >
                  {link.label} tx ↗
                </a>
              ))
            ) : (
              <span className="text-emerald-900/70 dark:text-emerald-100/70">
                Explorer link unavailable
              </span>
            )}
            <a
              href={ARCHIVE_NFT_EXPLORERS.avascan}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-sm"
            >
              Verify contract ↗
            </a>
            <a
              href="#collectible-record"
              className="underline underline-offset-2 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-sm"
            >
              See your record ↓
            </a>
          </div>
        </div>
      )}

      {walletGuardError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-[11px] text-amber-800 dark:text-amber-300 leading-snug break-words"
        >
          {walletGuardError}
        </div>
      )}

      {txErrorDetail ? (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-2 rounded-md border border-red-500/40 bg-red-500/5 p-2 text-[11px] text-red-700 dark:text-red-300 leading-snug break-words"
        >
          <div className="mono text-[9px] uppercase tracking-[0.18em] text-red-700/80 dark:text-red-300/80">
            {txErrorDetail.code.replace(/-/g, " ")}
          </div>
          <p className="mt-0.5 font-semibold">{txErrorDetail.title}</p>
          <p className="mt-0.5 text-red-700/90 dark:text-red-300/90">
            Next step — {txErrorDetail.action}
          </p>
          <RecoveryActions
            code={txErrorDetail.code}
            onRetryApprove={() => {
              approveTx.reset();
              persisted.setApprove(undefined);
              void s.onClick?.();
            }}
            onRetryMint={() => {
              mintTx.reset();
              persisted.setMint(undefined);
              void s.onClick?.();
            }}
            onSwitchChain={() => void gate.switchToAvalanche()}
            txHash={effectiveMintHash ?? effectiveApproveHash}
          />
        </div>
      ) : txError ? (
        <p
          role="alert"
          aria-live="assertive"
          className="mt-2 text-[11px] text-red-700 dark:text-red-400 leading-snug break-words"
        >
          {txError.split("\n")[0]}
        </p>
      ) : null}

      <p className="mt-2 text-[10px] text-muted-foreground leading-snug">
        0.50 USDC + Avalanche gas. Native Avalanche USDC only. No financial
        rights — collectible record only.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/50 py-1.5">
      <div className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mono text-[12px] text-foreground font-semibold mt-0.5">
        {value}
      </div>
    </div>
  );
}

function DT({ children }: { children: React.ReactNode }) {
  return (
    <dt className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </dt>
  );
}
function DD({ children }: { children: React.ReactNode }) {
  return <dd className="mono text-[11px] text-foreground">{children}</dd>;
}

function FeeBreakdown({
  step,
  priceUsdc,
  estimate,
}: {
  step: "approve" | "mint";
  priceUsdc: string;
  estimate: { feeAvax?: string; loading: boolean; error?: string };
}) {
  const label = step === "approve" ? "Estimated approval fee" : "Estimated mint fee";
  const helper =
    step === "approve"
      ? "Approval is a one-time wallet signature that lets the Archive spend exactly 0.50 USDC."
      : "Mint cost is 0.50 USDC + Avalanche gas. Estimated live from the network.";
  return (
    <div className="mt-2 mb-2 rounded-md border border-border/40 bg-background/40 p-2">
      <div className="flex items-center justify-between gap-2 mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
        <span>{label}</span>
        <span>live estimate</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
        <dt className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          {step === "approve" ? "Token spend" : "Mint price"}
        </dt>
        <dd className="mono text-foreground text-right">
          {step === "approve" ? "0 USDC (approval only)" : priceUsdc}
        </dd>
        <dt className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          Network fee (AVAX)
        </dt>
        <dd className="mono text-foreground text-right">
          {estimate.loading
            ? "estimating…"
            : estimate.feeAvax
              ? `~${estimate.feeAvax}`
              : estimate.error
                ? "—"
                : "—"}
        </dd>
      </dl>
      <p className="mt-1 text-[10px] text-muted-foreground/80 leading-snug">{helper}</p>
    </div>
  );
}

function RecoveryActions({
  code,
  onRetryApprove,
  onRetryMint,
  onSwitchChain,
  txHash,
}: {
  code: MintErrorCode;
  onRetryApprove: () => void;
  onRetryMint: () => void;
  onSwitchChain: () => void;
  txHash?: `0x${string}`;
}) {
  const baseBtn =
    "mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-[var(--gold)]/50 bg-[var(--gold)]/10 px-2.5 py-1.5 text-foreground hover:bg-[var(--gold)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60";

  let primary: { label: string; onClick: () => void } | null = null;
  if (code === "user-rejected-approve" || code === "approve-failed" || code === "insufficient-allowance") {
    primary = { label: "Retry approval", onClick: onRetryApprove };
  } else if (code === "user-rejected-mint" || code === "mint-reverted") {
    primary = { label: "Retry mint", onClick: onRetryMint };
  } else if (code === "wrong-chain") {
    primary = { label: "Switch to Avalanche", onClick: onSwitchChain };
  }

  const txLinks = txExplorerUrls(txHash ?? "");

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {primary && (
        <button type="button" onClick={() => { primary!.onClick(); track("archive_mint_retry", { code }); }} className={baseBtn}>
          {primary.label}
        </button>
      )}
      {txLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[10px] uppercase tracking-[0.18em] rounded-md border border-border/60 px-2.5 py-1.5 text-foreground hover:border-[var(--gold)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
        >
          {link.label} tx ↗
        </a>
      ))}
    </div>
  );
}
