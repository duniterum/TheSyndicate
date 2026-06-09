import { Link } from "@tanstack/react-router";
import { useAccount, useChainId, useDisconnect } from "wagmi";
import { AVALANCHE_CHAIN_ID } from "@/lib/syndicate-config";
import { fmtAddress } from "@/lib/sale-hooks";

/**
 * Calm contextual notice on /wallet/$address.
 *
 * NEVER auto-redirects. Public wallet pages stay public.
 *
 * States:
 *   - disconnected → "this is a public wallet page" hint
 *   - connected, matches URL → "this is your wallet" confirmation
 *   - connected, differs → "viewing public; connected as …" with actions
 *   - connected, wrong network → adds calm switch CTA
 */
export function WalletContextNotice({ urlAddress }: { urlAddress: string }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const wrongChain = isConnected && chainId !== AVALANCHE_CHAIN_ID;

  if (!isConnected) {
    return (
      <Notice tone="muted">
        <span>
          <strong className="text-foreground">Public wallet page.</strong>{" "}
          Connect a wallet to view your own member status.
        </span>
      </Notice>
    );
  }

  const matches = address?.toLowerCase() === urlAddress.toLowerCase();

  if (matches) {
    return (
      <Notice tone="ok">
        <span>
          <strong className="text-foreground">This is your wallet.</strong>{" "}
          Connected as <span className="mono">{fmtAddress(address)}</span>
          {wrongChain && " · Wrong network — switch to Avalanche to take actions."}
        </span>
      </Notice>
    );
  }

  return (
    <Notice tone="warn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          You are viewing <span className="mono">{fmtAddress(urlAddress)}</span>{" "}
          — a public wallet page. Connected as{" "}
          <span className="mono">{fmtAddress(address)}</span>.
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/wallet/$address"
            params={{ address: address! }}
            className="mono text-[10px] uppercase tracking-[0.16em] rounded-md border border-[var(--gold)]/50 px-2.5 py-1.5 text-[var(--gold)] hover:bg-[var(--gold)]/10"
          >
            View my wallet
          </Link>
          <button
            onClick={() => disconnect()}
            className="mono text-[10px] uppercase tracking-[0.16em] rounded-md border border-border/60 px-2.5 py-1.5 text-muted-foreground hover:text-foreground"
          >
            Disconnect
          </button>
        </div>
      </div>
    </Notice>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "muted";
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-900 dark:text-emerald-300"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/5 text-amber-900 dark:text-amber-300"
        : "border-border/60 bg-background/60 text-muted-foreground";
  return (
    <div className={`rounded-lg border px-4 py-3 text-xs leading-relaxed ${cls}`}>
      {children}
    </div>
  );
}
