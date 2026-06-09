// MintPatronSeal — write-path for Archive1155 ID 3 (Patron Seal).
//
// SCOPE GUARD (constitutional):
//   - HARDCODED to ID 3. Quantity is fixed at 1. No quantity selector.
//   - This component is ONLY rendered by PatronSealReadiness when
//     `liveActive === true && isMintableConnected === true`. While ID 3
//     is inactive on-chain (current state), this component does not mount
//     at all — there is no UI surface that can call writeContract.
//   - Mirrors the safety discipline of MintFirstSignal (USDC allowance →
//     approve(exact) → mint(id, qty)). No admin, activation, listing, or
//     marketplace paths.
//   - No "force mint" override. No bypass. No fake state.
//
// State machine (explicit `Phase`):
//   verifying → wrong-chain → checking → wallet-limit
//             → needs-usdc → needs-approval → approving
//             → ready → minting → confirmed
//   `error` is orthogonal and surfaced via `txError`.
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useChainId,
  useConnect,
  useReconnect,
  useSwitchChain,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Pill } from "@/components/syndicate/Primitives";
import { ARCHIVE_NFT_ABI } from "@/lib/archive-nft-abi";
import { ERC20_ABI } from "@/lib/sale-abi";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  CONTRACTS,
  AVALANCHE_CHAIN_ID,
  USDC_DECIMALS,
} from "@/lib/syndicate-config";
import { archiveTxUrl } from "@/lib/explorer-guard";
import type { ArchiveIdRead } from "@/lib/archive-nft-hooks";
import { track } from "@/lib/analytics";
import { assertFreshWallet, walletFreshnessMessage } from "@/lib/wallet-freshness";
import { recordTx } from "@/lib/tx-history";
import { useMintHashPersistence } from "@/lib/mint-persistence";
import { classifyTxError } from "@/lib/tx-errors";

const ARCHIVE = ARCHIVE_NFT_CONTRACT_ADDRESS as `0x${string}`;
const USDC = CONTRACTS.USDC_CONTRACT_ADDRESS as `0x${string}`;

// HARDCODED — this component will never mint any id other than 3.
const PATRON_SEAL_ID = 3n;
const QUANTITY = 1n;
const RENDERER_ONCHAIN_SVG = 1;

type Phase =
  | "verifying"
  | "needs-wallet"
  | "wrong-chain"
  | "paused"
  | "checking"
  | "sold-out"
  | "wallet-limit"
  | "not-active"
  | "needs-usdc"
  | "needs-approval"
  | "approving"
  | "ready"
  | "minting"
  | "confirmed";

const PHASE_LABEL: Record<Phase, string> = {
  verifying: "Reading on-chain state…",
  "needs-wallet": "Connect wallet to mint",
  "wrong-chain": "Switch to Avalanche C-Chain",
  paused: "Paused",
  checking: "Checking wallet eligibility…",
  "sold-out": "Sold out",
  "wallet-limit": "Mint limit reached",
  "not-active": "Not active yet",
  "needs-usdc": "Insufficient USDC",
  "needs-approval": "Approve 5.00 USDC",
  approving: "Approving USDC…",
  ready: "Mint Patron Seal",
  minting: "Minting…",
  confirmed: "Minted",
};

const fmtUsdc = (raw?: bigint) =>
  raw === undefined
    ? "—"
    : `${(Number(raw) / 10 ** USDC_DECIMALS).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} USDC`;

const isRejected = (m: string | undefined) =>
  /user rejected|rejected request|denied|cancelled|canceled/i.test(m ?? "");

function shortMsg(m: string | undefined): string {
  if (!m) return "Transaction failed";
  return m.split("\n")[0]?.trim() || "Transaction failed";
}

/**
 * MintPatronSeal — render-gate enforced by PARENT.
 *
 * The parent MUST only mount this when:
 *   read.artifact.active === true
 *   AND read.isMintableConnected === true
 *
 * This component re-asserts both invariants and will refuse to render
 * its CTA if either flips to false (e.g. via a refetch).
 */
export function MintPatronSeal({
  read,
  refetchArtifact,
  paused,
}: {
  read: ArchiveIdRead;
  refetchArtifact: () => void;
  /** Global Pausable.paused() flag — `true` blocks all writes. */
  paused?: boolean | undefined;
}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending: connectPending } = useConnect();
  const { reconnect, connectors: reconnectConnectors } = useReconnect();
  const { switchChainAsync, isPending: switchPending } = useSwitchChain();
  const queryClient = useQueryClient();
  const [walletGuardError, setWalletGuardError] = useState<string | null>(null);

  const wallet = address as `0x${string}` | undefined;

  const art = read.artifact;
  const priceUsdc = art?.priceUsdc;
  const requiredUsdc = priceUsdc !== undefined ? priceUsdc * QUANTITY : undefined;

  // Per-wallet reads.
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
            args: [wallet, PATRON_SEAL_ID],
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

  const approveTx = useWriteContract();
  const mintTx = useWriteContract();

  // Canonical Archive1155 mint-hash persistence (proven on ID 1 First Signal).
  // Survives page refresh / wallet drift so the progress tracker and
  // explorer link don't disappear while an approval / mint is still
  // in-flight on-chain.
  const persisted = useMintHashPersistence(wallet, ARCHIVE, 3);

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

  const effectiveApproveHash = (approveTx.data ?? persisted.approve) as
    | `0x${string}`
    | undefined;
  const effectiveMintHash = (mintTx.data ?? persisted.mint) as
    | `0x${string}`
    | undefined;

  const approveReceipt = useWaitForTransactionReceipt({ hash: effectiveApproveHash });
  const mintReceipt = useWaitForTransactionReceipt({ hash: effectiveMintHash });

  // Reset transient tx state when wallet changes.
  useEffect(() => {
    approveTx.reset();
    mintTx.reset();
    setWalletGuardError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const verifyFreshWallet = async (surface: string) => {
    const freshness = await assertFreshWallet(wallet);
    const message = walletFreshnessMessage(freshness);
    if (message) {
      setWalletGuardError(message);
      reconnect({ connectors: reconnectConnectors });
      void userQ.refetch();
      void queryClient.invalidateQueries();
      track("wallet_account_resync", { surface });
      return false;
    }
    setWalletGuardError(null);
    return true;
  };

  // Post-confirmation refresh.
  useEffect(() => {
    if (approveReceipt.isSuccess) {
      void userQ.refetch();
      track("patron_seal_approve_confirmed", { id: 3, tx: effectiveApproveHash });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveReceipt.isSuccess]);

  useEffect(() => {
    if (mintReceipt.isSuccess) {
      void userQ.refetch();
      refetchArtifact();
      queryClient.invalidateQueries();
      track("patron_seal_mint_success", { id: 3, tx: effectiveMintHash });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintReceipt.isSuccess]);

  // ── Re-asserted eligibility invariants ───────────────────────────────
  // Parent enforces, but we re-check defensively. If either flips false
  // after mount (refetch), the CTA is hard-disabled and writes are blocked.
  const definitionFrozen = art?.definitionFrozen === true;
  const isActive = art?.active === true;
  const rendererOk = art?.rendererMode === RENDERER_ONCHAIN_SVG;
  const supplyRemaining = read.remainingSupply;
  const isMintableConnected = read.isMintableConnected;
  const walletLimit = art?.walletLimit;

  // eligibilityOk is only meaningful WHEN a wallet is connected. When no
  // wallet is connected, isMintableConnected is undefined by design — that
  // is NOT a global "not active" signal, just a missing wallet input.
  const eligibilityOk =
    !!art &&
    definitionFrozen &&
    isActive &&
    rendererOk &&
    supplyRemaining !== undefined &&
    supplyRemaining > 0n &&
    isMintableConnected === true;

  const wrongChain = isConnected && chainId !== AVALANCHE_CHAIN_ID;
  const approvePending = approveTx.isPending || approveReceipt.isLoading;
  const mintPending = mintTx.isPending || mintReceipt.isLoading;
  const needsApprove =
    requiredUsdc !== undefined &&
    usdcAllowance !== undefined &&
    usdcAllowance < requiredUsdc;
  const insufficientUsdc =
    requiredUsdc !== undefined && usdcBal !== undefined && usdcBal < requiredUsdc;

  type State = {
    phase: Phase;
    label: string;
    disabled: boolean;
    onClick?: () => void | Promise<void>;
    help?: string;
  };

  // Snapshot of paused as a generic boolean so closures don't get narrowed
  // by the if/else chain below.
  const pausedNow: boolean = paused === true;

  let s: State = { phase: "verifying", label: PHASE_LABEL.verifying, disabled: true };

  if (mintReceipt.isSuccess) {
    s = { phase: "confirmed", label: "Minted — Patron Seal recorded", disabled: true };
  } else if (paused === true) {
    // Global Pausable.paused() — refuse approve and mint while paused.
    s = {
      phase: "paused",
      label: PHASE_LABEL.paused,
      disabled: true,
      help: "Minting is temporarily paused.",
    };
  } else if (isActive === false) {
    // Globally inactive on-chain — only path that should ever render
    // "Not active yet". A wallet-specific unknown does NOT reach here.
    s = {
      phase: "not-active",
      label: PHASE_LABEL["not-active"],
      disabled: true,
      help: "On-chain state says Patron Seal is not currently mintable.",
    };
  } else if (!isConnected) {
    // No wallet connected. Show a clickable connect CTA — mirrors
    // MintFirstSignal. Previously this was disabled with a forbidden
    // cursor, which made the page feel broken.
    s = {
      phase: "needs-wallet",
      label: connectPending ? "Connecting wallet…" : "Connect wallet to mint",
      disabled: connectPending || connectors.length === 0,
      help: "Connect a wallet on Avalanche C-Chain to mint Patron Seal.",
      onClick: () => {
        const c = connectors[0];
        if (c) connect({ connector: c });
        track("patron_seal_connect_click", { id: 3 });
      },
    };
  } else if (wrongChain) {
    s = {
      phase: "wrong-chain",
      label: switchPending ? "Switching…" : PHASE_LABEL["wrong-chain"],
      disabled: switchPending,
      onClick: async () => {
        try {
          await switchChainAsync({ chainId: AVALANCHE_CHAIN_ID });
        } catch {
          /* user rejected */
        }
      },
    };
  } else if (supplyRemaining !== undefined && supplyRemaining === 0n) {
    s = {
      phase: "sold-out",
      label: PHASE_LABEL["sold-out"],
      disabled: true,
      help: "All Patron Seals have been minted.",
    };
  } else if (userQ.isLoading || usdcBal === undefined || usdcAllowance === undefined || ownedBal === undefined) {
    s = { phase: "checking", label: PHASE_LABEL.checking, disabled: true };
  } else if (walletLimit !== undefined && ownedBal >= walletLimit) {
    s = {
      phase: "wallet-limit",
      label: PHASE_LABEL["wallet-limit"],
      disabled: true,
      help: "This wallet has reached the Patron Seal limit.",
    };
  } else if (isActive === true && isMintableConnected === false) {
    // Active but not mintable for this wallet — cap or limit reached.
    s = {
      phase: "wallet-limit",
      label: PHASE_LABEL["wallet-limit"],
      disabled: true,
      help: "This wallet has reached the Patron Seal limit.",
    };
  } else if (!eligibilityOk) {
    // Reads still resolving (artifact/isMintableConnected). Stay in a
    // truthful "checking" state — do NOT print "Not active yet".
    s = {
      phase: "verifying",
      label: PHASE_LABEL.verifying,
      disabled: true,
      help: "Reading on-chain eligibility…",
    };
  } else if (insufficientUsdc) {
    s = {
      phase: "needs-usdc",
      label: PHASE_LABEL["needs-usdc"],
      disabled: true,
      help: "Top up native Avalanche USDC (not USDC.e) to mint.",
    };
  } else if (needsApprove) {
    s = {
      phase: approvePending ? "approving" : "needs-approval",
      label: approvePending ? PHASE_LABEL.approving : PHASE_LABEL["needs-approval"],
      disabled: approvePending,
      help: "Approval lets the Archive contract spend exactly 5.00 USDC for this mint.",
      onClick: async () => {
        if (requiredUsdc === undefined) return;
        // Hard refuse if paused flips true mid-flow.
        if (pausedNow) return;
        if (!(await verifyFreshWallet("patron_seal_approve"))) return;
        try {
          const hash = await approveTx.writeContractAsync({
            address: USDC,
            abi: ERC20_ABI,
            functionName: "approve",
            account: wallet,
            args: [ARCHIVE, requiredUsdc],
          });
          track("patron_seal_approve_submit", { id: 3 });
          recordTx({ hash, account: wallet!, chainId: 43114, surface: "patron_seal_approve", label: "Patron Seal — USDC approve", contract: USDC });
        } catch {
          /* user rejected */
        }
      },
    };
  } else {
    s = {
      phase: mintPending ? "minting" : "ready",
      label: mintPending ? PHASE_LABEL.minting : PHASE_LABEL.ready,
      disabled: mintPending,
      help: "Mint calls Archive1155.mint(3, 1).",
      onClick: async () => {
        // Defensive re-check before submitting the write.
        if (!eligibilityOk || wrongChain || needsApprove || insufficientUsdc || pausedNow) return;
        if (!(await verifyFreshWallet("patron_seal_mint"))) return;
        try {
          const hash = await mintTx.writeContractAsync({
            address: ARCHIVE,
            abi: ARCHIVE_NFT_ABI,
            functionName: "mint",
            account: wallet,
            args: [PATRON_SEAL_ID, QUANTITY],
          });
          track("patron_seal_mint_submit", { id: 3 });
          recordTx({ hash, account: wallet!, chainId: 43114, surface: "patron_seal_mint", label: "Patron Seal — mint", contract: ARCHIVE, tokenId: String(PATRON_SEAL_ID) });
        } catch {
          /* user rejected */
        }
      },
    };
  }

  // Error string for the alert region. Primary copy goes through the
  // canonical `classifyTxError` classifier so it stays consistent with the
  // SYN sale + future contracts; the existing `isRejected`/`shortMsg`
  // helper acts only as a fallback for the rare "unknown" classification.
  const approveErrRaw = approveTx.error || approveReceipt.error;
  const mintErrRaw = mintTx.error || mintReceipt.error;
  const rawErr = approveErrRaw || mintErrRaw;
  const classified = rawErr ? classifyTxError(rawErr) : null;
  const approveErr = approveTx.error?.message || approveReceipt.error?.message;
  const mintErr = mintTx.error?.message || mintReceipt.error?.message;
  const txError = (() => {
    if (classified && classified.kind !== "unknown") return `${classified.title} — ${classified.message}`;
    if (approveErr) return isRejected(approveErr) ? "Approval rejected." : `Approval failed: ${shortMsg(approveErr)}`;
    if (mintErr) return isRejected(mintErr) ? "Mint rejected." : `Mint reverted: ${shortMsg(mintErr)}`;
    return null;
  })();

  const mintExplorerHref = useMemo(() => archiveTxUrl(effectiveMintHash), [effectiveMintHash]);
  const approveExplorerHref = useMemo(() => archiveTxUrl(effectiveApproveHash), [effectiveApproveHash]);

  return (
    <div role="region" aria-label="Mint Patron Seal" className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Mint · Patron Seal · ID 3
        </span>
        <Pill tone="success">ACTIVE · MINT OPEN</Pill>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 mb-1 text-xs">
        <DT>Price</DT>
        <DD>{requiredUsdc !== undefined ? fmtUsdc(requiredUsdc) : "5.00 USDC"}</DD>
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

      <button
        type="button"
        onClick={s.onClick}
        disabled={s.disabled || !s.onClick}
        aria-disabled={s.disabled || !s.onClick}
        aria-busy={approvePending || mintPending}
        className={
          s.disabled || !s.onClick
            ? "mono w-full inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/40 text-muted-foreground px-4 py-3 text-[12px] uppercase tracking-[0.18em] cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
            : "mono w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-[12px] uppercase tracking-[0.18em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
        }
        style={
          s.disabled || !s.onClick
            ? undefined
            : { background: "var(--gradient-gold)", color: "oklch(0.20 0.005 60)" }
        }
      >
        {s.label}
      </button>

      <div aria-live="polite" className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground min-h-[14px]">
        {s.help ?? ""}
      </div>

      {(approveExplorerHref || mintExplorerHref) && (
        <div className="flex flex-wrap gap-3 text-[11px]">
          {approveExplorerHref && (
            <a href={approveExplorerHref} target="_blank" rel="noopener noreferrer" className="mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
              View approval ↗
            </a>
          )}
          {mintExplorerHref && (
            <a href={mintExplorerHref} target="_blank" rel="noopener noreferrer" className="mono uppercase tracking-[0.18em] text-[var(--gold)] hover:opacity-80">
              View mint tx ↗
            </a>
          )}
        </div>
      )}

      {txError && (
        <div role="alert" className="rounded-md border border-red-500/40 bg-red-500/5 p-2 text-[11px] text-foreground/90">
          {txError}
        </div>
      )}

      {walletGuardError && (
        <div role="alert" className="rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-[11px] text-amber-800 dark:text-amber-300">
          {walletGuardError}
        </div>
      )}

      {/* Post-mint success panel — tx hash, explorer link, and a manual
          "Refresh minted status" button. The contract reads are also auto-
          refetched on success via the useEffect above, so this button is a
          belt-and-braces refresh for users who want to confirm immediately. */}
      {mintReceipt.isSuccess && (
        <div role="status" className="rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/5 p-3 flex flex-col gap-2">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
            Patron Seal minted
          </div>
          <p className="text-[12px] text-foreground/90 leading-relaxed">
            Your Patron Seal has been recorded on-chain. It may take a few
            seconds for the counts below to refresh.
          </p>
          {effectiveMintHash && (
            <code className="mono text-[10px] text-muted-foreground break-all">
              tx · {effectiveMintHash}
            </code>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {mintExplorerHref && (
              <a
                href={mintExplorerHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)] hover:opacity-80"
              >
                View on explorer ↗
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                void userQ.refetch();
                refetchArtifact();
                queryClient.invalidateQueries();
              }}
              className="mono text-[11px] uppercase tracking-[0.18em] rounded-md border border-border/60 bg-background/60 px-2 py-1 hover:text-foreground"
            >
              Refresh minted status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DT({ children }: { children: React.ReactNode }) {
  return (
    <dt className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </dt>
  );
}
function DD({ children }: { children: React.ReactNode }) {
  return <dd className="mono text-[11px] text-foreground">{children}</dd>;
}
