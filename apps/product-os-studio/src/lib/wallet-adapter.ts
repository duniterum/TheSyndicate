// THE SYNDICATE — PRODUCT OS STUDIO · WALLET ADAPTER (REAL, READ-ONLY / SAFE)
//
// A tiny, dependency-free EIP-1193 (window.ethereum) layer — NO wagmi/viem. It is the ONLY
// place the Studio touches a real wallet, and it is deliberately constrained to SAFE,
// non-custodial, read-only / user-environment operations:
//
//   ALLOWED (and implemented here):
//     - passive detection:        eth_accounts, eth_chainId   (no prompt)
//     - explicit connect:         eth_requestAccounts          (user-initiated)
//     - network switch/add:       wallet_switchEthereumChain / wallet_addEthereumChain
//     - import token:             wallet_watchAsset (SYN)      (decimals read LIVE first)
//     - LIVE READ:                eth_call balanceOf / decimals / symbol (read-only)
//     - forget in Studio:         wallet_revokePermissions (best-effort) + clear local state
//
//   FORBIDDEN (intentionally absent — there is NO function for any of these):
//     - eth_sendTransaction, eth_signTransaction, personal_sign, eth_sign, signTypedData
//     - approve / buy / mint / burn / claim / source activation / founder exec
//
// The Studio frontend is NEVER production authority (WalletSnapshot.isProductionAuth = false).
// Nothing here moves funds. wallet_switchEthereumChain / wallet_addEthereumChain / watchAsset
// modify the user's wallet *environment* (not the chain) and are strictly user-initiated.

import {
  AVALANCHE,
  SYN_TOKEN,
} from "./production-constants";
import type {
  WalletSnapshot,
  WalletState,
  ReadResult,
} from "./adapters";

// Minimal EIP-1193 provider shape (we never import a wallet SDK).
export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
}

interface InjectedRoot {
  ethereum?: Eip1193Provider & { providers?: Eip1193Provider[] };
}

/** Resolve the injected provider, preferring MetaMask when several are present. */
export function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as InjectedRoot).ethereum;
  if (!eth) return null;
  const multi = (eth as { providers?: Eip1193Provider[] }).providers;
  if (Array.isArray(multi) && multi.length > 0) {
    return multi.find((p) => p.isMetaMask) ?? multi[0];
  }
  return eth;
}

export function hasInjectedProvider(): boolean {
  return getInjectedProvider() !== null;
}

const DISCONNECTED: WalletSnapshot = {
  state: "disconnected",
  isCorrectNetwork: false,
  isProductionAuth: false,
};

const UNSUPPORTED: WalletSnapshot = {
  state: "unsupported",
  isCorrectNetwork: false,
  isProductionAuth: false,
};

function normalizeChainId(raw: unknown): number | undefined {
  if (typeof raw === "string") return raw.startsWith("0x") ? parseInt(raw, 16) : parseInt(raw, 10);
  if (typeof raw === "number") return raw;
  return undefined;
}

function snapshotFor(state: WalletState, address: string | undefined, chainId: number | undefined): WalletSnapshot {
  const isCorrectNetwork = chainId === AVALANCHE.chainId;
  return { state, address, chainId, isCorrectNetwork, isProductionAuth: false };
}

/** Passive snapshot — never prompts. Uses eth_accounts + eth_chainId only. */
export async function readSnapshot(): Promise<WalletSnapshot> {
  const provider = getInjectedProvider();
  if (!provider) return UNSUPPORTED;
  try {
    const accounts = (await provider.request({ method: "eth_accounts" })) as string[] | undefined;
    if (!accounts || accounts.length === 0) return DISCONNECTED;
    const chainId = normalizeChainId(await provider.request({ method: "eth_chainId" }));
    const isCorrect = chainId === AVALANCHE.chainId;
    return snapshotFor(isCorrect ? "ready" : "wrongNetwork", accounts[0], chainId);
  } catch {
    return DISCONNECTED;
  }
}

/** Explicit connect — user-initiated eth_requestAccounts. Throws on user rejection. */
export async function connect(): Promise<WalletSnapshot> {
  const provider = getInjectedProvider();
  if (!provider) return UNSUPPORTED;
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[] | undefined;
  if (!accounts || accounts.length === 0) return DISCONNECTED;
  const chainId = normalizeChainId(await provider.request({ method: "eth_chainId" }));
  const isCorrect = chainId === AVALANCHE.chainId;
  return snapshotFor(isCorrect ? "ready" : "wrongNetwork", accounts[0], chainId);
}

/** Request a switch to Avalanche C-Chain; adds it (canonical public params) if unknown. */
export async function switchToAvalanche(): Promise<void> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error("No wallet detected.");
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AVALANCHE.chainIdHex }],
    });
  } catch (err) {
    const code = (err as { code?: number; data?: { originalError?: { code?: number } } })?.code
      ?? (err as { data?: { originalError?: { code?: number } } })?.data?.originalError?.code;
    if (code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: AVALANCHE.chainIdHex,
            chainName: AVALANCHE.name,
            nativeCurrency: AVALANCHE.nativeCurrency,
            rpcUrls: [AVALANCHE.publicRpcUrl],
            blockExplorerUrls: [AVALANCHE.explorerUrl],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

/**
 * "Forget in Studio" — best-effort revoke of the Studio's read permission, then the hook
 * clears its local snapshot. This is NOT a production session/disconnect (injected wallets
 * control their own connection); it never claims one.
 */
export async function forgetInStudio(): Promise<void> {
  const provider = getInjectedProvider();
  if (!provider) return;
  try {
    await provider.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
  } catch {
    // Many wallets don't support revoke; the caller still clears its local snapshot.
  }
}

// ---- read-only eth_call helpers (no ABI library) ---------------------------

const SELECTOR = {
  balanceOf: "0x70a08231", // balanceOf(address)
  decimals: "0x313ce567", // decimals()
  symbol: "0x95d89b41", // symbol()
} as const;

function padAddress(address: string): string {
  return address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

async function ethCall(provider: Eip1193Provider, to: string, data: string): Promise<string> {
  return (await provider.request({ method: "eth_call", params: [{ to, data }, "latest"] })) as string;
}

/** Live, read-only decimals() — returns null if unreadable (never invents a value). */
export async function readErc20Decimals(token: string): Promise<number | null> {
  const provider = getInjectedProvider();
  if (!provider) return null;
  try {
    const res = await ethCall(provider, token, SELECTOR.decimals);
    if (!res || res === "0x") return null;
    const n = parseInt(res, 16);
    return Number.isFinite(n) && n >= 0 && n <= 36 ? n : null;
  } catch {
    return null;
  }
}

/** Format an integer token amount by decimals, with thousands separators and ≤4 dp. */
export function formatUnits(value: bigint, decimals: number): string {
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  let fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  if (fracStr.length > 4) fracStr = fracStr.slice(0, 4);
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${wholeStr}${fracStr ? `.${fracStr}` : ""}`;
}

export interface SynBalance {
  /** Raw integer amount as a base-10 string (serializable). */
  raw: string;
  decimals: number;
  /** Human-formatted amount (≤4 dp). */
  formatted: string;
  symbol: string;
}

/**
 * LIVE READ — the connected wallet's own SYN balance via eth_call balanceOf, formatted by a
 * live decimals() read. Read-only; no writes. Returns adapter ReadResult states so the UI can
 * label it honestly (notConnected / wrongNetwork / live / adapter-required / error).
 */
export async function readSynBalance(address: string): Promise<ReadResult<SynBalance>> {
  const provider = getInjectedProvider();
  if (!provider) return { state: "notConnected" };
  if (!address) return { state: "notConnected" };
  try {
    const chainId = normalizeChainId(await provider.request({ method: "eth_chainId" }));
    if (chainId !== AVALANCHE.chainId) return { state: "wrongNetwork" };
    const decimals = await readErc20Decimals(SYN_TOKEN.address);
    if (decimals === null) {
      return { state: "adapter-required", error: "Could not read SYN decimals() on-chain." };
    }
    const res = await ethCall(provider, SYN_TOKEN.address, SELECTOR.balanceOf + padAddress(address));
    const raw = BigInt(res && res !== "0x" ? res : "0x0");
    return {
      state: "live",
      data: {
        raw: raw.toString(),
        decimals,
        formatted: formatUnits(raw, decimals),
        symbol: SYN_TOKEN.symbol,
      },
      asOf: "latest block",
    };
  } catch (err) {
    return { state: "error", error: (err as Error)?.message ?? "Failed to read SYN balance." };
  }
}

/**
 * Import SYN via wallet_watchAsset. Reads decimals() LIVE first; if unreadable, throws rather
 * than guessing. Returns true if the wallet reports the asset was added (never fakes success).
 */
export async function watchSyn(): Promise<boolean> {
  const provider = getInjectedProvider();
  if (!provider) throw new Error("No wallet detected.");
  // Re-check the live chain at click time — never rely on a possibly-stale React snapshot,
  // so we never attempt the import against the wrong network.
  const chainId = normalizeChainId(await provider.request({ method: "eth_chainId" }));
  if (chainId !== AVALANCHE.chainId) {
    throw new Error(`Switch to ${AVALANCHE.name} before importing SYN.`);
  }
  const decimals = await readErc20Decimals(SYN_TOKEN.address);
  if (decimals === null) {
    throw new Error("Could not read SYN decimals() on-chain — Import SYN stays not wired until it can be read.");
  }
  const added = await provider.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address: SYN_TOKEN.address,
        symbol: SYN_TOKEN.symbol,
        decimals,
      },
    },
  });
  return Boolean(added);
}

/** Subscribe to account/chain changes. Returns a cleanup function. */
export function subscribe(handler: () => void): () => void {
  const provider = getInjectedProvider();
  if (!provider?.on || !provider.removeListener) return () => {};
  const onAccounts = () => handler();
  const onChain = () => handler();
  provider.on("accountsChanged", onAccounts);
  provider.on("chainChanged", onChain);
  return () => {
    provider.removeListener?.("accountsChanged", onAccounts);
    provider.removeListener?.("chainChanged", onChain);
  };
}

/** Short, display-only address form (0x1234…abcd). */
export function shortenAddress(address: string | undefined): string {
  if (!address) return "";
  return address.length > 10 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}
