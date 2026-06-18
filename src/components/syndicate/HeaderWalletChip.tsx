import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { AVALANCHE_CHAIN_ID } from "@/lib/syndicate-config";
import { fmtAddress } from "@/lib/sale-hooks";
import { useGlobalIdentity } from "@/lib/use-global-identity";

// Avalanche red — reserved for the official Avalanche mark ONLY (semantic-color doctrine).
const AVALANCHE_RED = "#E84142";

/**
 * Official Avalanche (AVAX) logo — the white mark cut out of the brand-red circle.
 * The single canonical Avalanche mark (also reused by the hero proof badge).
 */
export function AvalancheMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1503 1504"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="287" y="258" width="928" height="844" fill="#fff" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1502.5 752C1502.5 1167.07 1166.07 1503.5 751 1503.5C335.933 1503.5 -0.5 1167.07 -0.5 752C-0.5 336.933 335.933 0.5 751 0.5C1166.07 0.5 1502.5 336.933 1502.5 752ZM538.688 1050.86H392.94C362.314 1050.86 347.186 1050.86 337.962 1044.96C327.999 1038.5 321.911 1027.8 321.173 1015.99C320.619 1005.11 328.184 991.822 343.312 965.255L703.182 330.935C718.495 303.999 726.243 290.531 736.021 285.55C746.537 280.2 759.083 280.2 769.599 285.55C779.377 290.531 787.126 303.999 802.438 330.935L876.42 460.079L876.797 460.738C893.336 489.635 901.723 504.289 905.385 519.669C909.443 536.458 909.443 554.169 905.385 570.958C901.695 586.455 893.393 601.215 876.604 630.549L687.573 964.702L687.084 965.558C670.436 994.693 661.999 1009.46 650.306 1020.6C637.576 1032.78 622.263 1041.63 605.474 1046.61C590.161 1050.86 573.004 1050.86 538.688 1050.86ZM906.75 1050.86H1115.59C1146.4 1050.86 1161.9 1050.86 1171.13 1044.78C1181.09 1038.32 1187.36 1027.43 1187.92 1015.63C1188.45 1005.1 1181.05 992.33 1166.55 967.307C1166.05 966.452 1165.55 965.582 1165.04 964.694L1060.43 785.685L1059.24 783.673C1044.54 758.79 1037.12 746.231 1027.59 741.483C1017.08 736.133 1004.71 736.133 994.191 741.483C984.413 746.464 976.665 759.563 961.352 785.871L857.118 964.881L856.76 965.503C841.502 991.997 833.876 1005.24 834.428 1016.11C835.166 1027.92 841.254 1038.69 851.217 1045.15C860.441 1050.86 875.94 1050.86 906.75 1050.86Z"
        fill={AVALANCHE_RED}
      />
    </svg>
  );
}

/**
 * Avalanche C-Chain network indicator — a standalone, non-interactive pill that
 * lives in the header beside (and separate from) the Connect Wallet affordance.
 * Green dot = chain live; amber = connected wallet on the wrong network.
 * Avalanche red is confined to the AvalancheMark per the semantic-color doctrine.
 */
export function AvalancheNetworkPill({ className = "" }: { className?: string }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const wrongChain = isConnected && chainId !== AVALANCHE_CHAIN_ID;
  const label = wrongChain ? "Wrong network" : "Avalanche";
  return (
    <div
      role="status"
      aria-label={`Network: ${label} · Avalanche C-Chain`}
      title={
        wrongChain
          ? "Connected wallet is on the wrong network — switch to Avalanche C-Chain"
          : "Live on Avalanche C-Chain (43114)"
      }
      className={`hidden md:inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 ${className}`}
    >
      <AvalancheMark />
      <span
        className={`mono whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] leading-none ${
          wrongChain ? "text-amber-600 dark:text-amber-400" : "text-foreground"
        }`}
      >
        {label}
      </span>
      <span className="mono hidden 2xl:inline whitespace-nowrap text-[10px] uppercase tracking-[0.16em] leading-none text-muted-foreground">
        C-Chain
      </span>
      <span
        className="size-1.5 rounded-full"
        style={{ background: wrongChain ? "#F59E0B" : "var(--success)" }}
        aria-hidden
      />
    </div>
  );
}

/**
 * Persistent wallet/network chip rendered in the header.
 *
 * Disconnected: minimal "Connect" affordance.
 * Connected: status pill + truncated address + dropdown with My wallet,
 * Switch to Avalanche (when needed), Disconnect.
 *
 * Variant "mobile" lays out as a full-width block for the mobile drawer.
 *
 * Accessibility:
 *   - aria-haspopup + aria-expanded on trigger
 *   - role="menu" / role="menuitem" on dropdown
 *   - Enter / Space opens; ArrowDown focuses first item
 *   - Escape closes and returns focus to trigger
 *   - Arrow keys move between items; Tab also works
 *   - Click-outside and scroll close the menu
 *   - Visible focus ring on every interactive element
 */
export function HeaderWalletChip({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending: connectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: switchPending } = useSwitchChain();
  const id = useGlobalIdentity();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  // Focus first menuitem when opening; return focus to trigger on close.
  useEffect(() => {
    if (open) {
      const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    } else {
      // Only return focus if the trigger was the active source (avoid stealing focus on initial mount).
      if (document.activeElement && menuRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
    }
  }, [open]);

  const wrongChain = isConnected && chainId !== AVALANCHE_CHAIN_ID;

  const onSwitch = async () => {
    try {
      await switchChainAsync({ chainId: AVALANCHE_CHAIN_ID });
    } catch {
      /* user rejected */
    }
  };

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "ArrowDown"
        ? items[(idx + 1) % items.length]
        : items[(idx - 1 + items.length) % items.length];
    next?.focus();
  };

  // ── Disconnected ──────────────────────────────────────────────────────────
  if (!isConnected) {
    const c = connectors[0];
    if (variant === "mobile") {
      return (
        <button
          onClick={() => c && connect({ connector: c })}
          disabled={connectPending || !c}
          aria-label="Connect wallet"
          className="w-full mono inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] text-foreground hover:border-[var(--gold)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {connectPending ? "Connecting…" : "Connect Wallet"}
        </button>
      );
    }
    return (
      <button
        onClick={() => c && connect({ connector: c })}
        disabled={connectPending || !c}
        aria-label="Connect wallet"
        title={connectPending ? "Connecting…" : "Connect wallet"}
        className="hidden md:inline-flex w-full justify-center mono whitespace-nowrap items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-[11px] uppercase tracking-[0.12em] text-foreground hover:border-[#E3A92B] hover:text-[#E3A92B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E3A92B] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
      >
        {connectPending ? (
          "Connecting…"
        ) : (
          <>
            <span className="2xl:hidden">Connect</span>
            <span className="hidden 2xl:inline">Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  const networkLabel = wrongChain ? "Wrong network" : "Avalanche";

  const chipInner = (
    <>
      <AvalancheMark />
      <span
        className={`mono whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] leading-none ${
          wrongChain ? "text-amber-600 dark:text-amber-400" : "text-foreground"
        }`}
      >
        {networkLabel}
      </span>
      <span
        className="mono text-[11px] leading-none text-muted-foreground"
        aria-label={`Connected as ${address}`}
      >
        {fmtAddress(address)}
      </span>
      <span
        className="size-1.5 rounded-full"
        style={{ background: wrongChain ? "#F59E0B" : "var(--success)" }}
        aria-label={`Network: ${networkLabel}`}
      />
    </>
  );

  if (variant === "mobile") {
    return (
      <div className="space-y-2" role="group" aria-label="Wallet controls">
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5">
          {chipInner}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/my-syndicate"
            className="col-span-2 mono text-[10px] uppercase tracking-[0.16em] rounded-md border border-[color:var(--accent)]/40 text-[color:var(--accent)] px-3 py-2 text-center hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] min-h-11"
          >
            My Syndicate
          </Link>
          <Link
            to="/wallet/$address"
            params={{ address: address! }}
            className="mono text-[10px] uppercase tracking-[0.16em] rounded-md border border-border px-3 py-2 text-center hover:border-[var(--gold)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] min-h-11"
          >
            My wallet
          </Link>
          {wrongChain ? (
            <button
              onClick={onSwitch}
              disabled={switchPending}
              className="mono text-[10px] uppercase tracking-[0.16em] rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-11"
            >
              {switchPending ? "Switching…" : "Switch to Avalanche"}
            </button>
          ) : (
            <Link
              to="/join"
              className="mono text-[10px] uppercase tracking-[0.16em] rounded-md border border-border px-3 py-2 text-center hover:border-[var(--gold)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] min-h-11"
            >
              {id.isMember ? "Buy More SYN" : id.shouldShowBecomeMember ? "Become Member" : "Join page"}
            </Link>
          )}
          <button
            onClick={() => disconnect()}
            className="col-span-2 mono text-[10px] uppercase tracking-[0.16em] rounded-md border border-border px-3 py-2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] min-h-11"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Wallet menu — connected as ${address}, network ${networkLabel}`}
        className="hidden md:inline-flex w-full justify-center items-center gap-2 rounded-md border border-border px-2.5 py-2 hover:border-[#E3A92B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E3A92B] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className="size-1.5 rounded-full"
          style={{ background: wrongChain ? "#F59E0B" : "var(--success)" }}
          aria-hidden
        />
        {/* Compact identity below 2xl keeps the connected chip within the header
            width budget (the row is full at 1280); full address + menu caret at 2xl+. */}
        <span className="mono text-[11px] leading-none text-foreground 2xl:hidden">
          {address ? `…${address.slice(-4)}` : ""}
        </span>
        <span className="mono text-[11px] leading-none text-foreground hidden 2xl:inline">
          {fmtAddress(address)}
        </span>
        <ChevronDown className="size-3 opacity-60 hidden 2xl:inline" aria-hidden />
      </button>
      {open && (
        <div className="absolute right-0 top-full pt-2 w-64 z-50">
          <div
            ref={menuRef}
            role="menu"
            aria-label="Wallet actions"
            onKeyDown={onMenuKey}
            className="surface elevated p-2 rounded-lg shadow-xl border border-border/60 bg-card"
          >
            <div className="px-3 py-2 border-b border-border/60 mb-1">
              <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                Connected
              </div>
              <div className="mono text-xs text-foreground mt-0.5 break-all">{address}</div>
            </div>
            {wrongChain && (
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  void onSwitch();
                }}
                disabled={switchPending}
                className="block w-full text-left rounded-md px-3 py-2 text-xs hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 focus:outline-none focus-visible:bg-amber-500/10 focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <div className="font-medium">
                  {switchPending ? "Switching…" : "Switch to Avalanche"}
                </div>
                <div className="mt-0.5 text-[10px] opacity-80">
                  Actions are unavailable on the wrong network
                </div>
              </button>
            )}
            <Link
              role="menuitem"
              to="/my-syndicate"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-xs hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              <div className="font-medium text-foreground">My Syndicate</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {id.isMember ? "Your member dashboard" : "Your identity & activity"}
              </div>
            </Link>
            <Link
              role="menuitem"
              to="/wallet/$address"
              params={{ address: address! }}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-xs hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              <div className="font-medium text-foreground">My wallet page</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {id.isMember ? "Member identity & history" : "Wallet identity & history"}
              </div>
            </Link>
            <Link
              role="menuitem"
              to="/join"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-xs hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              <div className="font-medium text-foreground">{id.isMember ? "Buy More SYN" : id.shouldShowBecomeMember ? "Become a Syndicate Member" : "Join page"}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                Buy SYN with USDC
              </div>
            </Link>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                disconnect();
              }}
              className="block w-full text-left rounded-md px-3 py-2 text-xs hover:bg-muted/50 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
