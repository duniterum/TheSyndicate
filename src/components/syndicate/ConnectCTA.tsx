// ConnectCTA — in-place inactive-widget shell.
//
// Used in every /my-syndicate widget when the wallet is disconnected so the
// dashboard reads as a complete OS with dormant cells, not as empty space.
// Matches the locked v2 doctrine: shell + single primary action, never
// hides the widget itself.

import { ReactNode } from "react";

export function ConnectCTA({
  message = "Connect wallet to activate",
  hint,
}: {
  message?: string;
  hint?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2.5">
      <span className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-muted-foreground/40" />
        DORMANT
      </span>
      <span className="text-sm text-foreground/85 flex-1 min-w-0">{message}</span>
      {hint && (
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {hint}
        </span>
      )}
      <button
        type="button"
        // Wallet connect is handled by the global header — we scroll to it so the user can act.
        onClick={() => {
          if (typeof document === "undefined") return;
          // Try to open the header wallet chip via a custom event the header listens for,
          // and fall back to scrolling the user to the top so the connect button is visible.
          document.dispatchEvent(new CustomEvent("syndicate:open-wallet"));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="mono inline-flex items-center gap-1.5 rounded-md border border-[var(--gold)]/60 bg-[var(--gold)]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground hover:bg-[var(--gold)]/20"
      >
        Connect →
      </button>
    </div>
  );
}
