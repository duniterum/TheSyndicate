import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { useLocation } from "@tanstack/react-router";
import { AVALANCHE_CHAIN_ID } from "@/lib/syndicate-config";
import { useUserBalances, fmtUsdc, fmtAddress } from "@/lib/sale-hooks";

/**
 * Developer-only wallet session readout.
 *
 * Visibility rules (gated, never default-on — including dev):
 *   1. localStorage.setItem("syn:debug", "1") → shown
 *   2. ?debug=wallet query param → shown for the session (and persisted)
 *
 * Both real users and developers see nothing unless explicitly opted in.
 */
export function WalletDebugPanel() {
  const [enabled, setEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ls = (() => {
      try {
        return window.localStorage.getItem("syn:debug") === "1";
      } catch {
        return false;
      }
    })();
    const qs = new URLSearchParams(window.location.search).get("debug") === "wallet";
    if (qs) {
      try {
        window.localStorage.setItem("syn:debug", "1");
      } catch {
        /* ignore */
      }
    }
    setEnabled(ls || qs);
  }, []);

  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const bal = useUserBalances();
  const location = useLocation();

  if (!enabled) return null;

  const wrongChain = isConnected && chainId !== AVALANCHE_CHAIN_ID;
  const onWalletRoute = location.pathname.startsWith("/wallet/");
  const viewingAddress = onWalletRoute
    ? decodeURIComponent(location.pathname.replace(/^\/wallet\//, "").split("/")[0] ?? "")
    : null;
  const mismatch =
    viewingAddress && address ? address.toLowerCase() !== viewingAddress.toLowerCase() : false;

  const usdc =
    bal.usdcBalance !== undefined ? `${fmtUsdc(bal.usdcBalance)} USDC` : "—";
  const allow =
    bal.usdcAllowance !== undefined ? `${fmtUsdc(bal.usdcAllowance)} USDC` : "—";

  // Inferred join-disabled reason (mirrors LivePurchase guards, read-only).
  const joinReason = !isConnected
    ? "not connected"
    : wrongChain
      ? "wrong network"
      : bal.usdcBalance === 0n
        ? "no USDC balance"
        : "ok";

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 10,
        lineHeight: 1.4,
        background: "rgba(15,15,20,0.92)",
        color: "#e6e6e6",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        padding: collapsed ? "6px 10px" : "10px 12px",
        maxWidth: 320,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        pointerEvents: "auto",
      }}
      data-debug="wallet"
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        style={{
          background: "transparent",
          border: 0,
          color: "#ffd86b",
          cursor: "pointer",
          font: "inherit",
          padding: 0,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
        aria-expanded={!collapsed}
      >
        {collapsed ? "▸ wallet debug" : "▾ wallet debug"}
      </button>
      {!collapsed && (
        <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "auto 1fr", gap: "2px 8px" }}>
          <span style={{ opacity: 0.6 }}>status</span>
          <span>{status}</span>
          <span style={{ opacity: 0.6 }}>connected</span>
          <span>{String(isConnected)}</span>
          <span style={{ opacity: 0.6 }}>address</span>
          <span>{address ? fmtAddress(address) : "—"}</span>
          <span style={{ opacity: 0.6 }}>chainId</span>
          <span>
            {chainId} {wrongChain ? "⚠" : "✓"}
          </span>
          <span style={{ opacity: 0.6 }}>wrong net</span>
          <span>{String(wrongChain)}</span>
          <span style={{ opacity: 0.6 }}>viewing</span>
          <span>{viewingAddress ? fmtAddress(viewingAddress) : "—"}</span>
          <span style={{ opacity: 0.6 }}>mismatch</span>
          <span>{String(mismatch)}</span>
          <span style={{ opacity: 0.6 }}>usdc bal</span>
          <span>{usdc}</span>
          <span style={{ opacity: 0.6 }}>allowance</span>
          <span>{allow}</span>
          <span style={{ opacity: 0.6 }}>join</span>
          <span>{joinReason}</span>
        </div>
      )}
    </div>
  );
}
