// THE SYNDICATE — PRODUCT OS STUDIO · STUDIO WALLET CONTEXT
//
// A dedicated React context for the REAL, read-only wallet reality layer. It is intentionally
// SEPARATE from the simulated role store (src/lib/store.tsx): the persisted demo roles
// (syn-connected / syn-seated / syn-founder) are untouched, and this provider never drives
// route gating or production authority. It only surfaces what the user's own wallet truthfully
// reports, plus the safe, user-initiated actions in wallet-adapter.ts.
//
// All chain-changing wallet calls are user-initiated (buttons). Only eth_accounts / eth_chainId
// run passively on mount + on provider events. There is NO transaction path anywhere.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ReadResult, WalletSnapshot } from "./adapters";
import {
  connect as adapterConnect,
  hasInjectedProvider,
  readSnapshot,
  readSynBalance,
  subscribe,
  watchSyn,
  type SynBalance,
} from "./wallet-adapter";

export type ImportSynResult = "added" | "dismissed";

interface StudioWalletContextValue {
  /** Truthful snapshot of the user's wallet (never production authority). */
  snapshot: WalletSnapshot;
  /** Whether an injected EIP-1193 provider exists at all. */
  isDetected: boolean;
  connecting: boolean;
  forgetting: boolean;
  importing: boolean;
  error: string | null;
  clearError: () => void;
  /** Explicit connect (eth_requestAccounts). */
  connect: () => Promise<void>;
  /** Forget the wallet within the Studio — clears ONLY Studio-local state (no wallet call). */
  forget: () => Promise<void>;
  /** Import SYN via wallet_watchAsset (decimals read live first). */
  importSyn: () => Promise<ImportSynResult>;
  /** LIVE READ of the connected wallet's own SYN balance. */
  synBalance: ReadResult<SynBalance>;
  synBalanceLoading: boolean;
  refreshSynBalance: () => Promise<void>;
}

const StudioWalletContext = createContext<StudioWalletContextValue | undefined>(undefined);

function friendlyError(err: unknown): string {
  const e = err as { code?: number; message?: string };
  if (e?.code === 4001) return "Request rejected in your wallet.";
  if (e?.code === -32002) return "A wallet request is already pending — check your wallet.";
  return e?.message ?? "Something went wrong with the wallet request.";
}

const initialSnapshot = (): WalletSnapshot =>
  hasInjectedProvider()
    ? { state: "disconnected", isCorrectNetwork: false, isProductionAuth: false }
    : { state: "unsupported", isCorrectNetwork: false, isProductionAuth: false };

export function StudioWalletProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<WalletSnapshot>(initialSnapshot);
  const [isDetected, setIsDetected] = useState<boolean>(() => hasInjectedProvider());
  const [connecting, setConnecting] = useState(false);
  const [forgetting, setForgetting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synBalance, setSynBalance] = useState<ReadResult<SynBalance>>({ state: "idle" });
  const [synBalanceLoading, setSynBalanceLoading] = useState(false);

  // "Forget in Studio" is local-only: the Studio never revokes wallet permissions. Once
  // forgotten, passive re-detection is suppressed (we present "disconnected") until the user
  // explicitly reconnects. This is honest — the injected wallet still controls its own grant.
  const forgotten = useRef(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refreshSnapshot = useCallback(async () => {
    // Respect a local "forget" — do not read the account back in until the user reconnects.
    if (forgotten.current) {
      const next: WalletSnapshot = hasInjectedProvider()
        ? { state: "disconnected", isCorrectNetwork: false, isProductionAuth: false }
        : { state: "unsupported", isCorrectNetwork: false, isProductionAuth: false };
      if (mounted.current) setSnapshot(next);
      return next;
    }
    const next = await readSnapshot();
    if (mounted.current) setSnapshot(next);
    return next;
  }, []);

  // Passive detection on mount + subscribe to provider account/chain changes.
  useEffect(() => {
    setIsDetected(hasInjectedProvider());
    void refreshSnapshot();
    const unsubscribe = subscribe(() => {
      void refreshSnapshot();
      // A live balance becomes stale on account/chain change — reset to idle (no auto RPC).
      if (mounted.current) setSynBalance({ state: "idle" });
    });
    return unsubscribe;
  }, [refreshSnapshot]);

  const clearError = useCallback(() => setError(null), []);

  const refreshSynBalance = useCallback(async () => {
    if (!snapshot.address) {
      setSynBalance({ state: "notConnected" });
      return;
    }
    if (!snapshot.isCorrectNetwork) {
      setSynBalance({ state: "wrongNetwork" });
      return;
    }
    setSynBalanceLoading(true);
    setSynBalance({ state: "loading" });
    const result = await readSynBalance(snapshot.address);
    if (mounted.current) {
      setSynBalance(result);
      setSynBalanceLoading(false);
    }
  }, [snapshot.address, snapshot.isCorrectNetwork]);

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);
    // A new explicit connect lifts a prior local "forget".
    forgotten.current = false;
    try {
      const next = await adapterConnect();
      if (mounted.current) setSnapshot(next);
    } catch (err) {
      if (mounted.current) setError(friendlyError(err));
    } finally {
      if (mounted.current) setConnecting(false);
    }
  }, []);

  const forget = useCallback(async () => {
    // Local-only: clears the Studio's view of the wallet. It does NOT call the wallet (no
    // wallet_revokePermissions) and never claims a production disconnect.
    setError(null);
    setForgetting(true);
    forgotten.current = true;
    if (mounted.current) {
      setSnapshot(
        hasInjectedProvider()
          ? { state: "disconnected", isCorrectNetwork: false, isProductionAuth: false }
          : { state: "unsupported", isCorrectNetwork: false, isProductionAuth: false },
      );
      setSynBalance({ state: "idle" });
      setForgetting(false);
    }
  }, []);

  const importSyn = useCallback(async (): Promise<ImportSynResult> => {
    setError(null);
    setImporting(true);
    try {
      const added = await watchSyn();
      return added ? "added" : "dismissed";
    } catch (err) {
      if (mounted.current) setError(friendlyError(err));
      throw err;
    } finally {
      if (mounted.current) setImporting(false);
    }
  }, []);

  const value: StudioWalletContextValue = {
    snapshot,
    isDetected,
    connecting,
    forgetting,
    importing,
    error,
    clearError,
    connect,
    forget,
    importSyn,
    synBalance,
    synBalanceLoading,
    refreshSynBalance,
  };

  return <StudioWalletContext.Provider value={value}>{children}</StudioWalletContext.Provider>;
}

export function useStudioWallet(): StudioWalletContextValue {
  const ctx = useContext(StudioWalletContext);
  if (ctx === undefined) {
    throw new Error("useStudioWallet must be used within a StudioWalletProvider");
  }
  return ctx;
}
