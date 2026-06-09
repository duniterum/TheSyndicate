// Tx-hash proof: a Verify pill that opens a drawer showing the on-chain
// transaction summary (from / to / block / timestamp / value / action),
// with copy buttons and an "Open on Avascan" action. When the hash is
// missing, malformed, or the RPC lookup fails, renders an explicit
// "Tx not found" / "Lookup failed" proof state instead of a broken link.
//
// Caching: the per-tx query lives in the app-level React Query cache with
// staleTime: Infinity and a long gcTime, so repeated clicks on the same
// pill reuse the previously fetched transaction data — no second RPC call.
//
// A11y: the Dialog primitive (Radix) provides modal focus trap, Escape
// to close, and aria-modal. We add aria-haspopup="dialog" on the pill
// trigger, aria-busy while loading, aria-live="polite" on the dynamic
// content region, and explicit aria-labels on every icon-only button.

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { formatEther, type Hex } from "viem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProofButton, StatusPill } from "./Primitives";
import {
  txExplorerUrl,
  explorerUrlForAddress,
  CONTRACTS,
  LP_POOL,
} from "@/lib/syndicate-config";

const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;

export function isValidTxHash(hash: string | undefined | null): hash is Hex {
  if (!hash || typeof hash !== "string") return false;
  return TX_HASH_RE.test(hash);
}

// ─────────────────────────────────────────────────────────────────────────────
// Action decoder — pure, no RPC, runs on the already-fetched tx.
// Maps (to address, 4-byte selector) → human-readable action summary.
// ─────────────────────────────────────────────────────────────────────────────

const SELECTORS: Record<string, string> = {
  "0xa9059cbb": "Token transfer",
  "0x23b872dd": "Token transferFrom",
  "0x095ea7b3": "Approve",
  "0xf242432a": "NFT transfer",
  "0x2eb2c2d6": "NFT batch transfer",
  "0x731133e9": "NFT mint",
  "0x40c10f19": "Mint",
  "0x38ed1739": "Swap (exact in)",
  "0x8803dbee": "Swap (exact out)",
  "0x18cbafe5": "Swap → AVAX",
  "0x7ff36ab5": "Swap AVAX →",
  "0xfb3bdb41": "Swap AVAX → exact",
  "0x4a25d94a": "Swap → AVAX (exact)",
  "0xe8e33700": "LP add",
  "0xf305d719": "LP add AVAX",
  "0xbaa2abde": "LP remove",
  "0x02751cec": "LP remove AVAX",
};

function labelForAddress(addr: string | null | undefined): string | null {
  if (!addr) return null;
  const lc = addr.toLowerCase();
  if (lc === CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS.toLowerCase()) return "Archive NFT";
  if (lc === LP_POOL.pairAddress.toLowerCase()) return "Trader Joe LP";
  if (lc === CONTRACTS.SYN_CONTRACT_ADDRESS.toLowerCase()) return "SYN token";
  if (lc === CONTRACTS.USDC_CONTRACT_ADDRESS.toLowerCase()) return "USDC";
  if (lc === CONTRACTS.VAULT_WALLET.toLowerCase()) return "Vault wallet";
  if (lc === CONTRACTS.LIQUIDITY_WALLET.toLowerCase()) return "Liquidity wallet";
  if (lc === CONTRACTS.OPERATIONS_WALLET.toLowerCase()) return "Operations wallet";
  if (lc === CONTRACTS.MEMBERSHIP_SYN_WALLET.toLowerCase()) return "Membership distribution";
  return null;
}

export function decodeTxAction(input: {
  to: string | null | undefined;
  input?: string | null;
  valueWei?: bigint;
}): string {
  const target = labelForAddress(input.to);
  const data = (input.input ?? "").toLowerCase();
  const selector = data.length >= 10 ? data.slice(0, 10) : "";
  const action = SELECTORS[selector];

  // Refine swap label based on which side of the SYN/USDC pair the target is.
  let actionLabel = action;
  if (action?.startsWith("Swap") && target === "Trader Joe LP") {
    actionLabel = "Swap (Trader Joe)";
  }

  if (!actionLabel && (!data || data === "0x")) {
    // No calldata = plain value transfer.
    if (input.valueWei && input.valueWei > 0n) {
      return target ? `AVAX transfer → ${target}` : "AVAX transfer";
    }
    return target ? `Call → ${target}` : "Plain transfer";
  }

  if (!actionLabel) {
    return target ? `Contract call → ${target}` : "Contract call";
  }
  return target ? `${actionLabel} → ${target}` : actionLabel;
}

function classifyError(err: unknown): {
  kind: "rate-limit" | "timeout" | "network" | "unknown";
  message: string;
} {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const m = raw.toLowerCase();
  if (m.includes("429") || m.includes("rate limit") || m.includes("too many")) {
    return {
      kind: "rate-limit",
      message: "The RPC is rate-limiting requests. Wait a moment and retry.",
    };
  }
  if (m.includes("timeout") || m.includes("timed out") || m.includes("aborted")) {
    return {
      kind: "timeout",
      message: "The RPC took too long to respond. Retry to try again.",
    };
  }
  if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch")) {
    return {
      kind: "network",
      message: "Network error while reading the chain. Retry when reconnected.",
    };
  }
  return {
    kind: "unknown",
    message:
      "The RPC could not return this transaction right now. The originating event is still recorded on-chain — open it on Avascan to inspect.",
  };
}

/**
 * Clickable Verify ↗ pill. Opens TxProofDrawer on click. When the hash is
 * not valid, renders a muted, non-interactive "Tx not found" pill — no
 * broken link, no false trust.
 */
export function TxProofPill({
  txHash,
  label = "Verify",
  className = "",
  ariaLabel,
}: {
  txHash: string | undefined | null;
  label?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const valid = isValidTxHash(txHash);

  if (!valid) {
    return (
      <span
        role="status"
        aria-label="No transaction hash recorded for this event"
        title="No transaction hash recorded for this event."
        className={`mono inline-flex items-center gap-1 rounded border border-border/50 bg-background/40 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground ${className}`}
      >
        Tx not found
      </span>
    );
  }

  return (
    <>
      <ProofButton
        external={false}
        onClick={() => setOpen(true)}
        ariaLabel={
          ariaLabel ?? `${label} transaction ${txHash} — opens proof dialog`
        }
        className={`!px-1.5 !py-0.5 !text-[9px] ${className}`}
      >
        {label} ↗
      </ProofButton>
      {open && (
        <TxProofDrawer txHash={txHash as Hex} open={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export function TxProofDrawer({
  txHash,
  open,
  onClose,
}: {
  txHash: Hex;
  open: boolean;
  onClose: () => void;
}) {
  const client = usePublicClient();
  const q = useQuery({
    queryKey: ["tx-proof", txHash, client?.chain?.id ?? 0],
    enabled: Boolean(client) && open,
    queryFn: async () => {
      if (!client) throw new Error("no rpc client");
      const tx = await client.getTransaction({ hash: txHash });
      const blockNumber = tx.blockNumber;
      const block = blockNumber !== null
        ? await client.getBlock({ blockNumber })
        : null;
      return {
        from: tx.from,
        to: tx.to,
        blockNumber: tx.blockNumber,
        timestamp: block?.timestamp,
        valueWei: tx.value,
        input: tx.input,
      };
    },
    // Cache aggressively — repeated clicks on the same pill must reuse the
    // last fetched transaction data instead of re-calling the RPC.
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000, // keep 1h after the drawer closes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const avascanHref = txExplorerUrl(txHash);
  const failed = !q.isLoading && q.isError;
  const errInfo = failed ? classifyError(q.error) : null;
  const action = q.data ? decodeTxAction(q.data) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="max-w-lg" aria-labelledby="tx-proof-title" aria-describedby="tx-proof-desc">
        <DialogHeader>
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 inline-flex items-center gap-2">
            <StatusPill status={failed ? "PARTIAL" : "LIVE"} />
            <span>Transaction proof</span>
          </div>
          <DialogTitle id="tx-proof-title" className="text-xl font-serif">
            Verify on-chain
          </DialogTitle>
          <DialogDescription id="tx-proof-desc" className="text-sm leading-relaxed">
            Read directly from Avalanche via the project RPC. Open the
            transaction on Avascan for the canonical record.
          </DialogDescription>
        </DialogHeader>

        <div
          className="space-y-3 mt-1"
          aria-busy={q.isLoading || q.isFetching}
          aria-live="polite"
        >
          <Row label="Tx hash" value={<MonoCopyAddress value={txHash} href={avascanHref} />} />

          {q.isLoading && (
            <div className="space-y-2">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          )}

          {failed && errInfo && (
            <div
              role="alert"
              className="surface elevated p-3 text-sm text-muted-foreground space-y-2"
            >
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-[color:oklch(0.5_0.13_75)]">
                {errInfo.kind === "rate-limit"
                  ? "RPC rate-limited"
                  : errInfo.kind === "timeout"
                    ? "RPC timeout"
                    : errInfo.kind === "network"
                      ? "Network error"
                      : "Lookup failed"}
              </div>
              <div>{errInfo.message}</div>
              <div className="flex flex-wrap gap-2 pt-1">
                <ProofButton
                  external={false}
                  onClick={() => q.refetch()}
                  ariaLabel="Retry transaction lookup"
                >
                  {q.isFetching ? "Retrying…" : "Retry"}
                </ProofButton>
                <ProofButton href={avascanHref} ariaLabel="Open transaction on Avascan">
                  Open on Avascan ↗
                </ProofButton>
              </div>
            </div>
          )}

          {q.data && (
            <>
              <Row
                label="Action"
                value={
                  <span className="text-xs text-foreground">
                    {action}
                  </span>
                }
              />
              <Row
                label="From"
                value={<MonoCopyAddress value={q.data.from} href={explorerUrlForAddress(q.data.from) ?? undefined} />}
              />
              <Row
                label="To"
                value={
                  q.data.to ? (
                    <MonoCopyAddress value={q.data.to} href={explorerUrlForAddress(q.data.to) ?? undefined} />
                  ) : (
                    <span className="mono text-xs text-muted-foreground">Contract creation</span>
                  )
                }
              />
              <Row
                label="Block"
                value={
                  q.data.blockNumber !== null ? (
                    <span className="mono text-xs">{q.data.blockNumber.toString()}</span>
                  ) : (
                    <span className="mono text-xs text-muted-foreground">Pending</span>
                  )
                }
              />
              <Row
                label="Block time"
                value={
                  q.data.timestamp !== undefined ? (
                    <span className="mono text-xs">
                      {new Date(Number(q.data.timestamp) * 1000).toISOString().replace("T", " ").slice(0, 19)} UTC
                    </span>
                  ) : (
                    <span className="mono text-xs text-muted-foreground">—</span>
                  )
                }
              />
              <Row
                label="Value"
                value={
                  <span className="mono text-xs">
                    {q.data.valueWei === 0n ? "0 AVAX" : `${formatEther(q.data.valueWei)} AVAX`}
                  </span>
                }
              />
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <ProofButton href={avascanHref} ariaLabel="Open transaction on Avascan">
            Open on Avascan ↗
          </ProofButton>
          <ProofButton
            external={false}
            onClick={() => {
              try {
                navigator.clipboard?.writeText(txHash);
              } catch {}
            }}
            ariaLabel="Copy transaction hash"
          >
            Copy hash
          </ProofButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px,1fr] gap-3 items-start">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground pt-1">
        {label}
      </div>
      <div className="min-w-0">{value}</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[88px,1fr] gap-3 items-center" aria-hidden="true">
      <div className="h-3 w-16 rounded bg-foreground/[0.06] animate-pulse" />
      <div className="h-3 w-full rounded bg-foreground/[0.06] animate-pulse" />
    </div>
  );
}

function MonoCopyAddress({ value, href }: { value: string; href?: string | null }) {
  const short = value.length > 16 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;
  return (
    <div className="flex items-center gap-2 flex-wrap min-w-0">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-xs text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 rounded"
          title={value}
          aria-label={`Open ${value} on explorer`}
        >
          {short}
        </a>
      ) : (
        <span className="mono text-xs truncate" title={value}>
          {short}
        </span>
      )}
      <button
        type="button"
        aria-label={`Copy ${value}`}
        onClick={() => {
          try {
            navigator.clipboard?.writeText(value);
          } catch {}
        }}
        className="mono text-[9px] uppercase tracking-[0.16em] rounded border border-border/60 px-1.5 py-0.5 hover:border-[var(--gold)]/60 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
      >
        Copy
      </button>
    </div>
  );
}
