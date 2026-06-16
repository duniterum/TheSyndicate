// WalletGate — the canonical UI gate for any action that needs a wallet on
// Avalanche C-Chain. It wraps `useWalletGate()` and renders the right control
// for each connection state, then shows `children` (the action itself) once a
// wallet is connected and on the correct network.
//
// This is the shared foundation for FUTURE actions. The existing purchase /
// mint surfaces keep their bespoke multi-state buttons and consume the
// `useWalletGate()` hook directly; they are intentionally not re-skinned here.
//
// DOCTRINE:
//   - Wallet-agnostic copy. Never says "MetaMask" unless the condition is
//     specifically MetaMask (it never is here — the connector is generic
//     injected).
//   - The Web2 sign-in slot is a disabled PLACEHOLDER only. No Web2 login is
//     wired. It must never look available.

import { ReactNode } from "react";
import { useWalletGate } from "@/lib/useWalletGate";

const PRIMARY_BTN =
  "mono inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--gold)]/60 bg-[var(--gold)]/10 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-[var(--gold)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 disabled:cursor-not-allowed disabled:opacity-50";

export function WalletGate({
  children,
  connectLabel = "Connect wallet",
  switchLabel = "Switch to Avalanche C-Chain",
  unsupportedLabel = "No wallet detected",
  /** Called before the connect attempt (e.g. analytics). */
  onConnect,
  /** Show a disabled Web2 sign-in placeholder under the connect control. */
  web2Placeholder = false,
  /** Show the mobile in-wallet-browser caveat under the connect control. */
  mobileCaveat = false,
  className,
}: {
  children: ReactNode;
  connectLabel?: string;
  switchLabel?: string;
  unsupportedLabel?: string;
  onConnect?: () => void;
  web2Placeholder?: boolean;
  mobileCaveat?: boolean;
  className?: string;
}) {
  const gate = useWalletGate();

  if (gate.status === "ready") {
    return <>{children}</>;
  }

  return (
    <div className={className}>
      {gate.status === "wrongNetwork" ? (
        <button
          type="button"
          disabled={gate.switchPending}
          onClick={() => void gate.switchToAvalanche()}
          className={PRIMARY_BTN}
        >
          {gate.switchPending ? "Switching…" : switchLabel}
        </button>
      ) : gate.status === "unsupported" ? (
        <div className="space-y-2">
          <span className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {unsupportedLabel}
          </span>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Open this site in a browser with a wallet extension, or inside your
            wallet app's built-in browser.
          </p>
        </div>
      ) : (
        <button
          type="button"
          disabled={gate.connectPending || !gate.canConnect}
          onClick={() => {
            onConnect?.();
            gate.connectWallet();
          }}
          className={PRIMARY_BTN}
        >
          {gate.connectPending ? "Connecting…" : connectLabel}
        </button>
      )}

      {mobileCaveat && gate.status === "disconnected" && (
        <p className="mt-2 text-[10px] text-muted-foreground/80 leading-snug">
          On mobile, open this page inside your wallet app's browser to connect.
        </p>
      )}

      {web2Placeholder && (
        <div className="mt-2">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="mono inline-flex items-center gap-1.5 rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 disabled:cursor-not-allowed"
          >
            Email or social sign-in — not available yet
          </button>
        </div>
      )}
    </div>
  );
}
