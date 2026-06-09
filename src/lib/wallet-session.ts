// ─── Canonical wallet/session layer ───────────────────────────────────────
//
// Single source of truth for "who is connected, on what chain, in what
// state" across the entire Syndicate site. Every surface that needs wallet
// context (header, NFT pages, sale, registry, My Syndicate, activity,
// dashboards) MUST consume `useWalletSession()` instead of calling
// wagmi hooks directly. This guarantees:
//
//   • One address normalization (lowercased 0x).
//   • One chain truth (CHAIN_REGISTRY.id — Avalanche C-Chain 43114).
//   • One wrong-network state.
//   • One short-address rendering.
//   • One reconnect / disconnect signal shape.
//
// This module composes — does not replace — the per-write `assertFreshWallet`
// guard (src/lib/wallet-freshness.ts). Freshness still runs immediately
// before every writeContractAsync; the session layer feeds it the
// `addressFromWagmi` value to pin.
//
// Authority: docs/WALLET_TRANSACTION_ARCHITECTURE.md.

import { useMemo } from "react";
import { useAccount, useChainId, useSwitchChain, useDisconnect } from "wagmi";
import { CHAIN_REGISTRY } from "./chain-registry";
import { normalizeAddress } from "./wallet-freshness";

export type WalletConnectionState =
  | "disconnected"
  | "connecting"
  | "reconnecting"
  | "wrong-network"
  | "connected";

export interface WalletSession {
  /** Lowercased 0x address, or null when disconnected. */
  address: `0x${string}` | null;
  /** Short form e.g. 0x1234…abcd, or null when disconnected. */
  short: string | null;
  /** Currently selected chain id from wagmi (may differ from expected). */
  chainId: number | undefined;
  /** Expected chain id — Avalanche C-Chain (43114). */
  expectedChainId: number;
  /** True when chainId !== expectedChainId AND wallet is connected. */
  wrongNetwork: boolean;
  /** Coarse connection state for UI. */
  state: WalletConnectionState;
  isConnected: boolean;
  /** Trigger network switch to the expected chain. */
  switchToExpectedChain: () => Promise<void>;
  /** Disconnect wallet. */
  disconnect: () => void;
}

export function shortAddress(address: string | undefined | null): string | null {
  const norm = normalizeAddress(address);
  if (!norm) return null;
  return `${norm.slice(0, 6)}…${norm.slice(-4)}`;
}

export function useWalletSession(): WalletSession {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { disconnect } = useDisconnect();

  const expected = CHAIN_REGISTRY.id;
  const normalized = normalizeAddress(address);

  const wrongNetwork = isConnected && !!chainId && chainId !== expected;
  const state: WalletConnectionState = !isConnected
    ? isConnecting
      ? "connecting"
      : "disconnected"
    : isReconnecting
      ? "reconnecting"
      : wrongNetwork
        ? "wrong-network"
        : "connected";

  return useMemo<WalletSession>(
    () => ({
      address: normalized,
      short: shortAddress(normalized),
      chainId,
      expectedChainId: expected,
      wrongNetwork,
      state,
      isConnected: !!isConnected,
      switchToExpectedChain: async () => {
        await switchChainAsync({ chainId: expected });
      },
      disconnect: () => disconnect(),
    }),
    [normalized, chainId, expected, wrongNetwork, state, isConnected, switchChainAsync, disconnect],
  );
}
