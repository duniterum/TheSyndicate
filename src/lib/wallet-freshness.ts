// Wallet freshness guard for write paths.
//
// Problem this prevents: MetaMask can switch accounts while Wagmi/React still
// holds the previous address for a render. A write would then be signed by the
// currently selected wallet while the UI still reads balances/limits for the
// old wallet. Every approve/mint path must verify the injected wallet account
// immediately before submitting a transaction.

export type WalletFreshnessIssue =
  | "no-wallet-connected"
  | "no-injected-provider"
  | "wallet-unavailable"
  | "wallet-switched";

export type WalletFreshnessResult =
  | { ok: true; account: `0x${string}` }
  | {
      ok: false;
      code: WalletFreshnessIssue;
      expected?: string;
      actual?: string;
    };

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

type EthereumProvider = {
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: "accountsChanged" | "chainChanged", handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: "accountsChanged" | "chainChanged", handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function normalizeAddress(address: string | undefined | null): `0x${string}` | null {
  if (!address || !ADDRESS_RE.test(address)) return null;
  return address.toLowerCase() as `0x${string}`;
}

export function sameAddress(a: string | undefined | null, b: string | undefined | null): boolean {
  const aa = normalizeAddress(a);
  const bb = normalizeAddress(b);
  return !!aa && !!bb && aa === bb;
}

export function assessWalletFreshness(
  expected: string | undefined | null,
  injectedAccounts: readonly unknown[],
): WalletFreshnessResult {
  const expectedNorm = normalizeAddress(expected);
  if (!expectedNorm) return { ok: false, code: "no-wallet-connected" };

  const actualRaw = typeof injectedAccounts[0] === "string" ? injectedAccounts[0] : undefined;
  const actualNorm = normalizeAddress(actualRaw);
  if (!actualNorm) {
    return { ok: false, code: "wallet-unavailable", expected: expected ?? undefined };
  }

  if (actualNorm !== expectedNorm) {
    return {
      ok: false,
      code: "wallet-switched",
      expected: expected ?? undefined,
      actual: actualRaw,
    };
  }

  return { ok: true, account: actualNorm };
}

function provider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return window.ethereum;
}

export async function readInjectedAccounts(): Promise<string[]> {
  const eth = provider();
  if (!eth?.request) return [];
  const result = await eth.request({ method: "eth_accounts" });
  return Array.isArray(result) ? result.filter((a): a is string => typeof a === "string") : [];
}

export async function assertFreshWallet(expected: string | undefined | null): Promise<WalletFreshnessResult> {
  const eth = provider();
  if (!eth?.request) return { ok: false, code: "no-injected-provider", expected: expected ?? undefined };
  try {
    return assessWalletFreshness(expected, await readInjectedAccounts());
  } catch {
    return { ok: false, code: "wallet-unavailable", expected: expected ?? undefined };
  }
}

export function walletFreshnessMessage(result: WalletFreshnessResult): string | null {
  if (result.ok) return null;
  if (result.code === "wallet-switched") {
    return "Your wallet is on a different account than the app. The page is syncing before minting so the NFT cannot go to the wrong address.";
  }
  if (result.code === "wallet-unavailable") {
    return "Your wallet did not return an active account. Reconnect your wallet, then mint again.";
  }
  if (result.code === "no-injected-provider") {
    return "No injected wallet was available. Open this page in a browser with a wallet extension enabled.";
  }
  return "Connect a wallet before minting.";
}

export function subscribeInjectedAccountsChanged(handler: (accounts: string[]) => void): () => void {
  const eth = provider();
  if (!eth?.on) return () => {};
  const onAccountsChanged = (accounts: unknown) => {
    handler(Array.isArray(accounts) ? accounts.filter((a): a is string => typeof a === "string") : []);
  };
  eth.on("accountsChanged", onAccountsChanged);
  return () => eth.removeListener?.("accountsChanged", onAccountsChanged);
}