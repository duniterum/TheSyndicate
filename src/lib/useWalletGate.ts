// useWalletGate — the single, canonical wallet/network gate for every
// protocol action (purchase, mint, and all future write paths).
//
// WHY THIS EXISTS:
//   LivePurchase, MintFirstSignal, and MintPatronSeal each wired up the same
//   six wagmi hooks (account, chainId, connect, reconnect, disconnect,
//   switchChain) and re-derived the identical `wrongChain` test and the same
//   connect / switch-network actions. That duplication is the thing this hook
//   removes: the wiring now lives in ONE place so future actions plug into the
//   same gate instead of copy-pasting it.
//
// SCOPE GUARD:
//   - Injected-only, exactly as `wagmi.ts` configures it. No WalletConnect,
//     Privy, Dynamic, thirdweb, or Web2 login is introduced here.
//   - Behavior is preserved 1:1 with the previous inline logic: the connect
//     action picks the first configured connector; the switch action swallows
//     a user rejection silently; `wrongChain` is `isConnected && chainId !==
//     AVALANCHE_CHAIN_ID`.
import { useCallback } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useReconnect,
  useSwitchChain,
} from "wagmi";
import { AVALANCHE_CHAIN_ID } from "@/lib/syndicate-config";

export type WalletGateStatus =
  /** No connector is available to attempt a connection. */
  | "unsupported"
  /** A connector is available but no wallet is connected. */
  | "disconnected"
  /** A wallet is connected but on the wrong chain. */
  | "wrongNetwork"
  /** A wallet is connected and on Avalanche C-Chain. */
  | "ready";

export interface WalletGateState {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  chainId: number;
  /** `true` when connected but not on Avalanche C-Chain (43114). */
  wrongChain: boolean;
  status: WalletGateStatus;
  /** A connector exists, so a connect attempt is possible. */
  canConnect: boolean;
  connectPending: boolean;
  switchPending: boolean;
  /** Connect the first available injected connector. No-op if none exists. */
  connectWallet: () => void;
  /**
   * Switch the connected wallet to Avalanche C-Chain. Swallows a user
   * rejection silently — callers surface no error, matching prior behavior.
   */
  switchToAvalanche: () => Promise<void>;
  /** Re-sync the injected account into wagmi (used by freshness guards). */
  reconnect: () => void;
  /** Disconnect the active connector. */
  disconnect: () => void;
}

/**
 * Canonical wallet + network gate. Call once at the top of any component that
 * needs wallet connection or the Avalanche network. Returns the connection
 * state plus the two gate actions (connect, switch) every action shares.
 */
export function useWalletGate(): WalletGateState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending: connectPending } = useConnect();
  const { reconnect, connectors: reconnectConnectors } = useReconnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: switchPending } = useSwitchChain();

  const wrongChain = isConnected && chainId !== AVALANCHE_CHAIN_ID;
  const canConnect = connectors.length > 0;

  const connectWallet = useCallback(() => {
    const c = connectors[0];
    if (c) connect({ connector: c });
  }, [connect, connectors]);

  const switchToAvalanche = useCallback(async () => {
    try {
      await switchChainAsync({ chainId: AVALANCHE_CHAIN_ID });
    } catch {
      /* user rejected — no error surfaced, matching prior inline behavior */
    }
  }, [switchChainAsync]);

  const reconnectInjected = useCallback(() => {
    reconnect({ connectors: reconnectConnectors });
  }, [reconnect, reconnectConnectors]);

  const status: WalletGateStatus = !isConnected
    ? canConnect
      ? "disconnected"
      : "unsupported"
    : wrongChain
      ? "wrongNetwork"
      : "ready";

  return {
    address,
    isConnected,
    chainId,
    wrongChain,
    status,
    canConnect,
    connectPending,
    switchPending,
    connectWallet,
    switchToAvalanche,
    reconnect: reconnectInjected,
    disconnect,
  };
}
